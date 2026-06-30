import { ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { useEffect, useId, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { timelessFontClass } from '../utils/typography';
import { useCart } from '../context/CartContext';
import ProductVariantModal from './ProductVariantModal.jsx';
import { sectionTypography } from '../utils/sectionTypography';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

function normalizeProductColors(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (item == null) {
                    return '';
                }

                if (typeof item === 'object') {
                    if (item.name) {
                        return String(item.name).trim();
                    }

                    if (item.id != null) {
                        return String(item.id).trim();
                    }

                    return '';
                }

                return String(item).trim().replace(/^[\[\]"']+|[\[\]"']+$/g, '');
            })
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        const trimmedValue = value.trim();

        if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmedValue);
                return normalizeProductColors(parsed);
            } catch {
                // Fall back to comma-delimited parsing for malformed persisted strings.
            }
        }

        return trimmedValue
            .split(',')
            .map((item) => item.trim().replace(/^[\[\]"']+|[\[\]"']+$/g, ''))
            .filter(Boolean);
    }

    return [];
}

function normalizeProductSizes(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value
            .split(',')
            .map((item) => item.trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    return [];
}

function normalizeColorLookupEntries(record) {
    if (!record || typeof record !== 'object') {
        return [];
    }

    const name = String(record.name || '').trim();
    const id = record.id != null ? String(record.id).trim() : '';
    const colorCode = String(record.color_code || '').trim();

    if (!/^#[0-9a-f]{6}$/i.test(colorCode)) {
        return [];
    }

    const entries = [];

    if (name) {
        entries.push([name.toLowerCase(), colorCode]);
    }

    if (id) {
        entries.push([id, colorCode]);
    }

    return entries;
}

function getSwatchColor(value, colorLookup = {}) {
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

    const mappedColor = colorLookup[trimmed.toLowerCase()];
    if (mappedColor) {
        return mappedColor;
    }

    return '#d4d4d8';
}

function getSwatchBorderClass(value) {
    const color = String(value || '').trim().toLowerCase();

    if (color === '#fff' || color === '#ffffff' || color === 'white' || color === 'off-white' || color === 'ivory') {
        return 'border-zinc-300';
    }

    return 'border-zinc-200';
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

function isTruthyFlag(value) {
    if (value === true || value === 1) return true;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
    }
    return false;
}

function buildTrendingDisplayProducts(products) {
    if (!Array.isArray(products)) return [];

    const expanded = [];

    products.forEach((product, productIndex) => {
        const productColors = normalizeProductColors(product?.color);
        const productColorSet = new Set(productColors.map((item) => String(item || '').trim()).filter(Boolean));
        const variantRows = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
        const trendingColorSet = new Set();

        variantRows.forEach((row) => {
            if (!row || typeof row !== 'object') return;
            if (!isTruthyFlag(row.show_on_best_sellers)) return;

            const colorKey = String(row.color || '').trim();
            if (!colorKey) return;

            if (productColorSet.size === 0 || productColorSet.has(colorKey)) {
                trendingColorSet.add(colorKey);
            }
        });

        const colorVariantImages =
            product?.color_variant_images && typeof product.color_variant_images === 'object'
                ? product.color_variant_images
                : {};

        const imageCandidates = collectVariantImages(product);

        if (trendingColorSet.size > 0) {
            [...trendingColorSet].forEach((colorKey, colorIndex) => {
                const selectedImages = Array.isArray(colorVariantImages[colorKey])
                    ? colorVariantImages[colorKey].filter(Boolean)
                    : [];

                const nextGallery = selectedImages.length > 0 ? selectedImages : imageCandidates;

                expanded.push({
                    ...product,
                    ui_variant_key: `${product?.id || productIndex}-trending-${colorKey}-${colorIndex}`,
                    color: [colorKey],
                    image_gallery: [...new Set(nextGallery)],
                    cover_image: selectedImages[0] || product?.cover_image || imageCandidates[0] || fallbackImage,
                    color_variant_images: {
                        [colorKey]: selectedImages.length > 0 ? selectedImages : nextGallery,
                    },
                    trending_color: colorKey,
                });
            });

            return;
        }
    });

    return expanded;
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

function ProductCard({ product, autoPlay = false, colorLookup = {}, onAddToCart, allowAddToCart = true }) {
    const navigate = useNavigate();
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

    const productSlug = String(product?.slug || '').trim();
    const productName = String(product?.name || '').trim();
    const productLink = useMemo(() => {
        const base = productSlug
            ? `/product-details/${encodeURIComponent(productSlug)}`
            : `/product-details/${encodeURIComponent(productName)}`;

        const colorValue = String(selectedColor || '').trim();
        if (!colorValue) {
            return base;
        }

        return `${base}/${encodeURIComponent(colorValue)}`;
    }, [productSlug, productName, selectedColor]);

    function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        onAddToCart?.(product, {
            selectedColor,
            quantity: 1,
            image: imageSrc,
        });
    }

    function handleQuickView(event) {
        event.preventDefault();
        event.stopPropagation();
        navigate(productLink);
    }

    function handleWishlist(event) {
        event.preventDefault();
        event.stopPropagation();
        toast.info('Wishlist will be available soon');
    }

    return (
        <article className="group w-full cursor-pointer">
            <Link to={productLink} className="block">
                <div className="relative overflow-hidden bg-zinc-100">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-[320px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[360px] lg:h-[400px]"
                    />

                    {allowAddToCart ? (
                        <div className="product-hover-cta absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="inline-flex h-9 items-center justify-center bg-zinc-900 px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-zinc-800"
                            >
                                Add to cart
                            </button>
                            <button
                                type="button"
                                onClick={handleWishlist}
                                aria-label="Add to wishlist"
                                className="inline-flex size-9 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                            >
                                <Heart className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleQuickView}
                                aria-label="Preview product"
                                className="inline-flex size-9 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                            >
                                <Eye className="size-4" />
                            </button>
                        </div>
                    ) : null}

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
                        </>
                    ) : null}
                </div>
            </Link>

            <div className="space-y-1 pt-3.5">
       

                <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} line-clamp-2 text-[0.95rem] font-medium leading-[1.15] text-zinc-900 transition-opacity hover:opacity-70 sm:text-[1.02rem]`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-[1.2rem] font-semibold leading-none text-zinc-800 sm:text-[.95rem]`}>
                    ${Number(product.price).toFixed(2)}
                </p>
            </div>
        </article>
    );
}

export default function BestSellersSection({ sectionTitle = 'Trending' }) {
    const { addToCart, openCartDrawer } = useCart();
    const [products, setProducts] = useState([]);
    const [colorLookup, setColorLookup] = useState({});
    const [loading, setLoading] = useState(true);
    const [variantModalState, setVariantModalState] = useState(null);
    const sliderId = useId().replace(/:/g, '');
    const prevNavClass = `best-sellers-prev-${sliderId}`;
    const nextNavClass = `best-sellers-next-${sliderId}`;
    
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1,
            }
        );

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

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
                const colorPromise = fetch('/api/public/colors', {
                    headers: { Accept: 'application/json' },
                });

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

                const colorRes = await colorPromise;
                let nextColorLookup = {};

                if (colorRes.ok) {
                    const colorData = await colorRes.json();
                    const colorList = Array.isArray(colorData)
                        ? colorData
                        : (Array.isArray(colorData?.data) ? colorData.data : []);

                    nextColorLookup = Object.fromEntries(
                        colorList.flatMap((record) => normalizeColorLookupEntries(record)),
                    );
                }

                if (!ignore) {
                    setProducts(finalProducts);
                    setColorLookup(nextColorLookup);
                }
            } catch {
                if (!ignore) {
                    setProducts([]);
                    setColorLookup({});
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, [isBuilderPreview]);

    // Derived collection purely from live fetched state
    const displayProducts = loading ? [] : buildTrendingDisplayProducts(products);

    function handleAddToCart(product, options = {}) {
        setVariantModalState({
            product,
            defaults: options,
        });
    }

    function handleConfirmVariant(options = {}) {
        if (!variantModalState?.product) {
            return;
        }

        const nextItem = addToCart(variantModalState.product, options);
        setVariantModalState(null);
        toast.success(`${nextItem.name} added to cart`);
        openCartDrawer();
    }

    return (
        <section
            ref={sectionRef}
            className={`${timelessFontClass} bg-white py-10 sm:py-14 transform transition-all duration-1000 ease-out ${
                isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
            }`}
            style={{ backgroundColor: '#ffffff' }}
            onClick={() => notifyBuilderSelection(null)}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lightWaveSweep {
                    0%   { transform: translateX(-220%); }
                    100% { transform: translateX(420%); }
                }
                .wave-outer, .wave-mid, .wave-core, .wave-hotspot {
                    animation: lightWaveSweep 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />

            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 sm:mb-8">
                    <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                        {sectionTitle}
                    </h2>
                    <div className="flex items-center gap-3 sm:gap-5">
                        <button
                            type="button"
                            aria-label="Previous best seller products"
                            className={`${prevNavClass} inline-flex size-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-35`}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Next best seller products"
                            className={`${nextNavClass} inline-flex size-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-35`}
                        >
                            <ChevronRight className="size-4" />
                        </button>
                        <Link
                            to="/shop"
                            className={`${sectionTypography.sectionHeaderActionLink} section-header-cta-glow text-black transition-colors hover:text-zinc-900`}
                        >
                            Shop All
                        </Link>
                    </div>

                    <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-zinc-300">
                        <div className="wave-outer absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[3px]" />
                        <div className="wave-mid absolute inset-y-0 w-[35%] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1.5px]" />
                        <div className="wave-core absolute inset-y-0 w-[18%] bg-gradient-to-r from-transparent via-white to-transparent" />
                        <div className="wave-hotspot absolute inset-y-0 w-[7%] bg-gradient-to-r from-transparent via-white to-transparent brightness-[2]" />
                    </div>
                </div>

                {displayProducts.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation={{
                            prevEl: `.${prevNavClass}`,
                            nextEl: `.${nextNavClass}`,
                        }}
                        autoplay={{
                            delay: 2800,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={displayProducts.length > 1}
                        spaceBetween={12}
                        slidesPerView={2}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            640: { slidesPerView: 2.1 },
                            860: { slidesPerView: 3.1 },
                            1180: { slidesPerView: 4.1 },
                            1460: { slidesPerView: 5.1 },
                        }}
                        className="best-sellers-swiper pb-4"
                    >
                        {displayProducts.map((product, index) => (
                            <SwiperSlide
                                key={product.ui_variant_key || product.id || `${product.name}-${index}`}
                                className="h-auto"
                                onClick={(event) => {
                                    if (!isBuilderPreview) {
                                        return;
                                    }

                                    event.preventDefault();
                                    event.stopPropagation();
                                    notifyBuilderSelection(index);
                                }}
                            >
                                <ProductCard
                                    product={product}
                                    autoPlay={isBuilderPreview}
                                   
                                    onAddToCart={handleAddToCart}
                                    allowAddToCart={!loading}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : !loading ? (
                    <p className="mt-3 text-sm text-zinc-500">No products are marked as Best Trending.</p>
                ) : (
                    <div className="h-48 flex items-center justify-center">
                        <span className="text-sm text-zinc-400">Loading tracking collection...</span>
                    </div>
                )}

                <ProductVariantModal
                    isOpen={Boolean(variantModalState?.product)}
                    product={variantModalState?.product || null}
                    colorLookup={colorLookup}
                    defaults={variantModalState?.defaults || {}}
                    onClose={() => setVariantModalState(null)}
                    onConfirm={handleConfirmVariant}
                />
            </div>
        </section>
    );
}