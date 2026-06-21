import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../utils/typography';
import { useCart } from '../context/CartContext';
import SingleProductDetailsPanel from './SingleProductDetailsPanel.jsx';
import SingleProductMediaGallery from './SingleProductMediaGallery.jsx';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

function toAbsoluteImageUrl(path) {
    if (!path || typeof path !== 'string') {
        return fallbackImage;
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

function toAbsoluteVideoUrl(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

function normalizeImageKey(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }

    return path.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').trim();
}

function normalizeColors(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

function normalizeSizes(product) {
    if (typeof product?.size === 'string' && product.size.trim()) {
        return product.size.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const variants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    const extracted = variants
        .map((row) => String(row?.size || '').trim())
        .filter(Boolean);

    return [...new Set(extracted)];
}

function normalizeColorVariantImages(mapping) {
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
        return {};
    }

    return mapping;
}

function normalizeColorVariantVideos(mapping) {
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
        return {};
    }

    return mapping;
}

function resolveColorVariantItems(mapping, selectedColor, colorRecords) {
    if (!selectedColor || !mapping || typeof mapping !== 'object') {
        return [];
    }

    const rawSelected = String(selectedColor).trim();
    const matchedById = colorRecords.find((record) => String(record?.id) === rawSelected);
    const matchedByName = colorRecords.find(
        (record) => String(record?.name || '').trim().toLowerCase() === rawSelected.toLowerCase(),
    );
    const matchedColor = matchedById || matchedByName;

    const candidateKeys = [
        rawSelected,
        rawSelected.toLowerCase(),
        String(matchedColor?.name || '').trim(),
        String(matchedColor?.name || '').trim().toLowerCase(),
        String(matchedColor?.id || '').trim(),
    ].filter(Boolean);

    for (const key of candidateKeys) {
        const directMatch = mapping?.[key];
        if (Array.isArray(directMatch) && directMatch.length > 0) {
            return directMatch;
        }

        const ciKey = Object.keys(mapping).find(
            (existingKey) => existingKey.toLowerCase() === key.toLowerCase(),
        );
        if (ciKey && Array.isArray(mapping[ciKey]) && mapping[ciKey].length > 0) {
            return mapping[ciKey];
        }
    }

    return [];
}

function resolveInitialColor(preferredColor, availableColors) {
    const requested = String(preferredColor || '').trim();
    if (!requested) {
        return availableColors[0] || '';
    }

    const exactMatch = availableColors.find((item) => String(item || '').trim() === requested);
    if (exactMatch) {
        return exactMatch;
    }

    const caseInsensitiveMatch = availableColors.find(
        (item) => String(item || '').trim().toLowerCase() === requested.toLowerCase(),
    );

    return caseInsensitiveMatch || availableColors[0] || '';
}

export default function SingleProductMainSection({ product, initialColor = '' }) {
    const { addToCart, openCartDrawer } = useCart();
    const [colorLookup, setColorLookup] = useState({});
    const [colorRecords, setColorRecords] = useState([]);

    const imageList = useMemo(() => {
        const gallery = Array.isArray(product?.image_gallery) ? product.image_gallery : [];
        const candidates = [product?.cover_image, ...gallery].filter(Boolean);
        const seen = new Set();

        const unique = candidates.filter((item) => {
            const key = normalizeImageKey(item);
            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });

        if (unique.length === 0) {
            return [fallbackImage];
        }

        return unique.map((item) => toAbsoluteImageUrl(item));
    }, [product?.cover_image, product?.image_gallery]);

    const colors = useMemo(() => normalizeColors(product?.color), [product?.color]);
    const colorVariantImages = useMemo(
        () => normalizeColorVariantImages(product?.color_variant_images),
        [product?.color_variant_images],
    );
    const colorVariantVideos = useMemo(
        () => normalizeColorVariantVideos(product?.color_variant_videos),
        [product?.color_variant_videos],
    );
    const sizes = useMemo(() => normalizeSizes(product), [product]);
    const [selectedImage, setSelectedImage] = useState(imageList[0]);
    const [selectedColor, setSelectedColor] = useState(() => resolveInitialColor(initialColor, colors));
    const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedImage(imageList[0]);
    }, [imageList]);

    useEffect(() => {
        setSelectedColor(resolveInitialColor(initialColor, colors));
    }, [colors, initialColor]);

    useEffect(() => {
        setSelectedSize(sizes[0] || '');
    }, [sizes]);

    useEffect(() => {
        let ignore = false;

        async function loadColorLookup() {
            try {
                const response = await fetch('/api/public/colors', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    if (!ignore) {
                        setColorLookup({});
                    }
                    return;
                }

                const payload = await response.json();
                const list = Array.isArray(payload)
                    ? payload
                    : (Array.isArray(payload?.data) ? payload.data : []);

                const nextLookup = {};
                const nextRecords = [];
                list.forEach((item) => {
                    const id = String(item?.id || '').trim();
                    const name = String(item?.name || '').trim().toLowerCase();
                    const code = String(item?.color_code || '').trim();

                    if (!/^#[0-9a-f]{6}$/i.test(code)) {
                        return;
                    }

                    nextRecords.push(item);

                    if (name) {
                        nextLookup[name] = code;
                    }

                    if (id) {
                        nextLookup[id] = code;
                    }
                });

                if (!ignore) {
                    setColorLookup(nextLookup);
                    setColorRecords(nextRecords);
                }
            } catch {
                if (!ignore) {
                    setColorLookup({});
                    setColorRecords([]);
                }
            }
        }

        loadColorLookup();

        return () => {
            ignore = true;
        };
    }, []);

    const breadcrumbs = useMemo(
        () => {
            const slug = String(product?.slug || '').trim();
            const name = String(product?.name || '').trim();
            const detailUrl = slug
                ? `/singleProduct?slug=${encodeURIComponent(slug)}`
                : `/singleProduct?name=${encodeURIComponent(name)}`;

            return [
                { label: 'Home', to: '/' },
                { label: 'Shop', to: '/shop' },
                { label: String(product?.name || 'Product'), to: detailUrl },
            ];
        },
        [product?.name, product?.slug]
    );

    function decreaseQuantity() {
        setQuantity((previous) => Math.max(1, previous - 1));
    }

    function increaseQuantity() {
        setQuantity((previous) => previous + 1);
    }

    function handleSelectColor(colorLabel) {
        setSelectedColor(colorLabel);
    }

    function handleAddToCart() {
        addToCart(product, {
            selectedColor,
            selectedSize,
            quantity,
            image: selectedImage,
        });
        openCartDrawer();
    }

    const filteredImages = useMemo(() => {
        if (!selectedColor) {
            return imageList;
        }

        const mappedImages = resolveColorVariantItems(colorVariantImages, selectedColor, colorRecords);

        if (mappedImages.length === 0) {
            return imageList;
        }

        const imageSet = new Set(imageList.map((item) => normalizeImageKey(item)));
        const filtered = mappedImages
            .map((item) => toAbsoluteImageUrl(item))
            .filter((item) => imageSet.has(normalizeImageKey(item)));

        return filtered.length > 0 ? filtered : imageList;
    }, [selectedColor, colorRecords, colorVariantImages, imageList]);

    const filteredVideos = useMemo(() => {
        if (!selectedColor) {
            return [];
        }

        const mappedVideos = resolveColorVariantItems(colorVariantVideos, selectedColor, colorRecords);
        if (mappedVideos.length === 0) {
            return [];
        }

        return mappedVideos
            .map((item) => toAbsoluteVideoUrl(item))
            .filter(Boolean);
    }, [selectedColor, colorRecords, colorVariantVideos]);

    useEffect(() => {
        if (!filteredImages.includes(selectedImage)) {
            setSelectedImage(filteredImages[0] || imageList[0]);
        }
    }, [filteredImages, selectedImage, imageList]);

    const primaryVideo = filteredVideos[0] || '';

    return (
        <section className={`${featuresFontClass} bg-[#f7f7f6] px-5 py-6 sm:px-8 lg:px-12 lg:py-8`}>
            <div className="mx-auto w-full max-w-[1800px]">
                <p className="mb-4 text-[0.95rem] uppercase tracking-[0.08em] text-slate-600 sm:mb-6">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.label}>
                            <Link to={crumb.to} className="transition-colors hover:text-zinc-900">
                                {crumb.label}
                            </Link>
                            {index < breadcrumbs.length - 1 ? ' / ' : ''}
                        </span>
                    ))}
                </p>

                {/* UPDATED: Adjusted the grid system tracking to give more width to the gallery and less to the panel */}
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_440px] xl:gap-12">
                    <div className="self-start">
                        <SingleProductMediaGallery
                            images={filteredImages}
                            primaryVideo={primaryVideo}
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                        />
                    </div>

                    <div className="xl:sticky xl:top-24">
                        <SingleProductDetailsPanel
                            product={{
                                id: product?.id,
                                slug: product?.slug,
                                name: String(product?.name || 'Untitled Product'),
                                sku: String(product?.sku || 'N/A'),
                                price: `$${Number(product?.price || 0).toFixed(2)}`,
                                description: String(product?.description || 'No description available.'),
                                fit: String(product?.fit || product?.long_description || ''),
                                fabric_and_care: String(product?.fabric_and_care || product?.additional_information || ''),
                                product_features: String(product?.product_features || product?.features || ''),
                                product_composition: String(product?.product_composition || product?.composition || ''),
                                size_chart_image: String(product?.size_chart_image || ''),
                                colors: colors.map((color) => ({ label: color, value: color })),
                                sizes,
                            }}
                            colorLookup={colorLookup}
                            selectedColor={selectedColor}
                            onSelectColor={handleSelectColor}
                            selectedSize={selectedSize}
                            onSelectSize={setSelectedSize}
                            quantity={quantity}
                            onDecreaseQuantity={decreaseQuantity}
                            onIncreaseQuantity={increaseQuantity}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}