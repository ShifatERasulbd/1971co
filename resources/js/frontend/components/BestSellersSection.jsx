import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { timelessFontClass } from '../../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

const PLACEHOLDER_PRODUCTS = [
    { id: 1, name: 'Athletic Shorts', price: '15.99', cover_image: null, color: ['#9ca3af', '#18181b', '#3b82f6', '#f4f4f5'] },
    { id: 2, name: 'Athletic Shorts 5 Pcs Bundle', price: '59.99', cover_image: null, color: ['#9ca3af', '#3b82f6', '#18181b'] },
    { id: 3, name: 'Classic Polo Shirt', price: '19.99', cover_image: null, color: ['#f4f4f5', '#3b82f6', '#18181b', '#d4b896'] },
    { id: 4, name: "Classic Tank Tops For Men's", price: '9.99', cover_image: null, color: ['#f4f4f5', '#18181b', '#3b82f6', '#d4b896'] },
    { id: 5, name: "Classic Tank Tops For Men's- 4 Pcs Bundle", price: '39.96', cover_image: null, color: ['#ef4444', '#1e3a5f', '#3d5c3a', '#3b82f6'] },
    { id: 6, name: "Men's Puffer Vest", price: '44.99', cover_image: null, color: ['#374151', '#1e3a5f'] },
];

function normalizeProductColors(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

function getSwatchColor(value) {
    if (typeof value !== 'string') {
        return '#d4d4d8';
    }

    const trimmed = value.trim();
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed;
    }

    if (/^[a-z]+$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    return '#d4d4d8';
}

function collectVariantImages(product) {
    const images = [];

    if (product?.cover_image) {
        images.push(product.cover_image);
    }

    if (Array.isArray(product?.image_gallery)) {
        images.push(...product.image_gallery.filter(Boolean));
    }

    if (product?.color_variant_images && typeof product.color_variant_images === 'object') {
        Object.values(product.color_variant_images).forEach((items) => {
            if (Array.isArray(items)) {
                images.push(...items.filter(Boolean));
            }
        });
    }

    return images;
}

function groupProductsByName(products) {
    const grouped = new Map();

    products.forEach((product, index) => {
        const name = String(product?.name || '').trim();
        const key = name.toLowerCase() || `unnamed-${product?.id ?? index}`;
        const existing = grouped.get(key);
        const productColors = normalizeProductColors(product?.color);
        const productImageCandidates = collectVariantImages(product);
        const directVariantImages =
            product?.color_variant_images && typeof product.color_variant_images === 'object'
                ? product.color_variant_images
                : {};

        if (!existing) {
            const next = {
                ...product,
                color: [...productColors],
                image_gallery: [],
                color_variant_images: {},
            };

            grouped.set(key, next);
        }

        const target = grouped.get(key);
        const mergedColors = new Set(normalizeProductColors(target.color));
        productColors.forEach((color) => mergedColors.add(color));
        target.color = [...mergedColors];

        const mergedGallery = new Set(Array.isArray(target.image_gallery) ? target.image_gallery.filter(Boolean) : []);
        productImageCandidates.forEach((image) => mergedGallery.add(image));
        target.image_gallery = [...mergedGallery];

        if (!target.cover_image && product?.cover_image) {
            target.cover_image = product.cover_image;
        }

        const variantMap = {
            ...(target.color_variant_images && typeof target.color_variant_images === 'object' ? target.color_variant_images : {}),
        };

        productColors.forEach((color) => {
            const mappedImages = Array.isArray(directVariantImages[color]) ? directVariantImages[color].filter(Boolean) : [];
            const fallbackImages = mappedImages.length > 0 ? mappedImages : productImageCandidates;
            const merged = new Set(Array.isArray(variantMap[color]) ? variantMap[color].filter(Boolean) : []);

            fallbackImages.forEach((image) => merged.add(image));
            if (merged.size > 0) {
                variantMap[color] = [...merged];
            }
        });

        target.color_variant_images = variantMap;
    });

    return [...grouped.values()];
}

function ColorSwatch({ color, active, onClick }) {
    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-zinc-500 ${
                active ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700'
            }`}
        >
            <span
                className="inline-block size-3 rounded-full border border-black/10"
                style={{ backgroundColor: getSwatchColor(color) }}
            />
            <span>{color}</span>
        </button>
    );
}

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

function ProductCard({ product, autoPlay = false }) {
    const colors = useMemo(
        () => normalizeProductColors(product.color),
        [product.color],
    );

    const galleryImages = useMemo(() => {
        const rawGallery = Array.isArray(product.image_gallery) ? product.image_gallery : [];
        const allCandidates = [product.cover_image, ...rawGallery].filter(Boolean);
        const seen = new Set();
        const deduped = [];

        allCandidates.forEach((item) => {
            const key = normalizeImageKey(item);
            if (!key || seen.has(key)) {
                return;
            }

            seen.add(key);
            deduped.push(item);
        });

        if (deduped.length === 0) {
            return [fallbackImage];
        }

        return deduped.map((item) => toAbsoluteImageUrl(item));
    }, [product.cover_image, product.image_gallery]);

    const colorVariantImages =
        product.color_variant_images && typeof product.color_variant_images === 'object'
            ? product.color_variant_images
            : {};

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(() => colors[0] || null);

    useEffect(() => {
        setCurrentImageIndex(0);
        setSelectedColor(colors[0] || null);
    }, [product.id, product.color]);

    const imageSrc = galleryImages[currentImageIndex] || fallbackImage;

    useEffect(() => {
        if (!autoPlay || galleryImages.length <= 1) {
            return;
        }

        const timer = window.setInterval(() => {
            setCurrentImageIndex((previous) =>
                previous === galleryImages.length - 1 ? 0 : previous + 1,
            );
        }, 2500);

        return () => {
            window.clearInterval(timer);
        };
    }, [autoPlay, galleryImages.length]);

    function handlePrevImage(event) {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((previous) =>
            previous === 0 ? galleryImages.length - 1 : previous - 1,
        );
    }

    function handleNextImage(event) {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((previous) =>
            previous === galleryImages.length - 1 ? 0 : previous + 1,
        );
    }

    function handleSelectColor(color, event) {
        event.preventDefault();
        event.stopPropagation();
        setSelectedColor(color);

        const mappedImages = Array.isArray(colorVariantImages[color]) ? colorVariantImages[color] : [];
        if (mappedImages.length === 0) {
            return;
        }

        const firstMapped = mappedImages[0];
        const targetIndex = galleryImages.findIndex(
            (image) => normalizeImageKey(image) === normalizeImageKey(firstMapped),
        );

        if (targetIndex >= 0) {
            setCurrentImageIndex(targetIndex);
        }
    }

    const productLink = product.slug ? `/shop/${product.slug}` : `/shop?id=${product.id}`;

    return (
        <article className="group flex-none w-[230px] sm:w-[260px] lg:w-[290px] cursor-pointer">
            <Link to={productLink} className="block">
                <div className="relative overflow-hidden bg-zinc-100">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-[320px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[360px] lg:h-[400px]"
                    />

                    {galleryImages.length > 1 ? (
                        <>
                            <button
                                type="button"
                                aria-label="Previous image"
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-zinc-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next image"
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-zinc-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <ChevronRight className="size-4" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-2 py-1">
                                {galleryImages.map((_, index) => (
                                    <button
                                        key={`image-dot-${index}`}
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        className={`size-1.5 rounded-full ${
                                            currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </Link>

            <div className="pt-3 space-y-1.5">
                {colors.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {colors.slice(0, 6).map((c, i) => (
                            <ColorSwatch
                                key={`${c}-${i}`}
                                color={c}
                                active={selectedColor === c}
                                onClick={(event) => handleSelectColor(c, event)}
                            />
                        ))}
                    </div>
                )}

                <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} text-zinc-900 line-clamp-2 hover:opacity-70 transition-opacity`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-zinc-700`}>
                    ${Number(product.price).toFixed(2)}
                </p>
            </div>
        </article>
    );
}

export default function BestSellersSection({ sectionTitle = 'Best Sellers' }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    function isBestSeller(product) {
        if (product?.show_on_best_sellers === true) {
            return true;
        }

        return Number(product?.show_on_best_sellers) === 1;
    }

    function normalizeProductList(payload) {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        if (Array.isArray(payload?.items)) {
            return payload.items;
        }

        return [];
    }

    function notifyBuilderSelection(itemIndex = null) {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_BEST_SELLERS_SECTION_SELECTED',
                    payload: { itemIndex },
                },
                window.location.origin,
            );
        }
    }

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const res = await fetch('/api/public/products', {
                    headers: { Accept: 'application/json' },
                });

                let finalProducts = [];

                if (res.ok) {
                    const data = await res.json();
                    finalProducts = normalizeProductList(data);
                }

                if (isBuilderPreview && finalProducts.length === 0) {
                    const adminRes = await fetch('/api/products', {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    });

                    if (adminRes.ok) {
                        const adminData = await adminRes.json();
                        finalProducts = normalizeProductList(adminData).filter((item) => isBestSeller(item));
                    }
                }

                if (!ignore) {
                    setProducts(finalProducts);
                }
            } catch {
                if (!ignore) {
                    setProducts([]);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, [isBuilderPreview]);

    const displayProducts = loading
        ? PLACEHOLDER_PRODUCTS
        : groupProductsByName(products);

    return (
        <section
            className={`${timelessFontClass} bg-[#f8f8f7] py-10 sm:py-14`}
            onClick={() => notifyBuilderSelection(null)}
        >
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                    <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                        {sectionTitle}
                    </h2>
                    <Link
                        to="/shop"
                        className={`${sectionTypography.sectionMetaLink} text-zinc-500 transition-colors hover:text-zinc-900`}
                    >
                        Shop All
                    </Link>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-4 sm:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {displayProducts.map((product, index) => (
                        <div
                            key={product.id || `${product.name}-${index}`}
                            onClick={(event) => {
                                if (!isBuilderPreview) {
                                    return;
                                }

                                event.preventDefault();
                                event.stopPropagation();
                                notifyBuilderSelection(index);
                            }}
                        >
                            <ProductCard product={product} autoPlay={isBuilderPreview} />
                        </div>
                    ))}
                </div>

                {!loading && displayProducts.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">No products are marked as Best Sellers.</p>
                ) : null}
            </div>
        </section>
    );
}
