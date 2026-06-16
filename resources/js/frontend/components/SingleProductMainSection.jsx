import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';
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

export default function SingleProductMainSection({ product }) {
    const [colorLookup, setColorLookup] = useState({});

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
    const sizes = useMemo(() => normalizeSizes(product), [product]);
    const [selectedImage, setSelectedImage] = useState(imageList[0]);
    const [selectedColor, setSelectedColor] = useState(colors[0] || '');
    const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedImage(imageList[0]);
    }, [imageList]);

    useEffect(() => {
        setSelectedColor(colors[0] || '');
    }, [colors]);

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
                list.forEach((item) => {
                    const id = String(item?.id || '').trim();
                    const name = String(item?.name || '').trim().toLowerCase();
                    const code = String(item?.color_code || '').trim();

                    if (!/^#[0-9a-f]{6}$/i.test(code)) {
                        return;
                    }

                    if (name) {
                        nextLookup[name] = code;
                    }

                    if (id) {
                        nextLookup[id] = code;
                    }
                });

                if (!ignore) {
                    setColorLookup(nextLookup);
                }
            } catch {
                if (!ignore) {
                    setColorLookup({});
                }
            }
        }

        loadColorLookup();

        return () => {
            ignore = true;
        };
    }, []);

    const breadcrumbs = useMemo(
        () => [
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: String(product?.name || 'Product'), to: `/singleProduct?id=${product?.id}` },
        ],
        [product?.id, product?.name]
    );

    function decreaseQuantity() {
        setQuantity((previous) => Math.max(1, previous - 1));
    }

    function increaseQuantity() {
        setQuantity((previous) => previous + 1);
    }

    function handleSelectColor(colorLabel) {
        setSelectedColor(colorLabel);

        const mappedImages = Array.isArray(colorVariantImages?.[colorLabel])
            ? colorVariantImages[colorLabel]
            : [];

        if (mappedImages.length === 0) {
            return;
        }

        const firstMapped = toAbsoluteImageUrl(mappedImages[0]);
        if (imageList.includes(firstMapped)) {
            setSelectedImage(firstMapped);
        }
    }

    return (
        <section className={`${featuresFontClass} bg-[#f7f7f6] px-5 py-6 sm:px-8 lg:px-12 lg:py-8`}>
            <div className="mx-auto w-full max-w-[1720px]">
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

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:gap-8">
                    <div className="self-start">
                        <SingleProductMediaGallery
                            images={imageList}
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                        />
                    </div>

                    <div className="xl:sticky xl:top-24">
                        <SingleProductDetailsPanel
                            product={{
                                name: String(product?.name || 'Untitled Product'),
                                sku: String(product?.sku || 'N/A'),
                                price: `$${Number(product?.price || 0).toFixed(2)}`,
                                description: String(product?.description || 'No description available.'),
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
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
