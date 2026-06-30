import { ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import { timelessFontClass } from '../utils/typography';
import { useCart } from '../context/CartContext';
import ProductVariantModal from './ProductVariantModal.jsx';
import { sectionTypography } from '../utils/sectionTypography';

const REGEX_STRIP = /^[\[\]"']+|[\[\]"']+$/g;
const REGEX_HEX = /^#[0-9a-f]{6}$/i;
const REGEX_ALPHA = /^[a-z]+$/i;
const MIN_LOOP_SLIDES = 8;

function normalizeProductColors(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (item == null) return '';
                if (typeof item === 'object') {
                    return String(item.name || item.id || '').trim();
                }
                return String(item).trim().replace(REGEX_STRIP, '');
            })
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        const trimmedValue = value.trim();
        if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
            try {
                return normalizeProductColors(JSON.parse(trimmedValue));
            } catch {
                // Fall back to comma-delimited parsing
            }
        }
        return trimmedValue
            .split(',')
            .map((item) => item.trim().replace(REGEX_STRIP, ''))
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
    if (!record || typeof record !== 'object') return [];
    const colorCode = String(record.color_code || '').trim();
    if (!REGEX_HEX.test(colorCode)) return [];

    const entries = [];
    const name = String(record.name || '').trim();
    const id = record.id != null ? String(record.id).trim() : '';

    if (name) entries.push([name.toLowerCase(), colorCode]);
    if (id) entries.push([id, colorCode]);
    return entries;
}

function normalizeVariantKey(value) {
    return String(value ?? '').trim().toLowerCase();
}

function normalizeVariantImageMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const accumulator = {};
    for (const [key, items] of Object.entries(value)) {
        const normalizedKey = normalizeVariantKey(key);
        if (normalizedKey) {
            accumulator[normalizedKey] = Array.isArray(items) ? items.filter(Boolean) : [];
        }
    }
    return accumulator;
}

function getSwatchColor(value, colorLookup = {}) {
    if (typeof value !== 'string') return '#d4d4d8';
    const trimmed = value.trim();
    if (REGEX_HEX.test(trimmed)) return trimmed;

    const mappedColor = colorLookup[trimmed.toLowerCase()];
    if (mappedColor && REGEX_HEX.test(mappedColor)) return mappedColor;
    if (REGEX_ALPHA.test(trimmed)) return trimmed.toLowerCase();

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
    if (product?.cover_image) images.push(product.cover_image);
    if (Array.isArray(product?.image_gallery)) {
        images.push(...product.image_gallery.filter(Boolean));
    }
    if (product?.color_variant_images && typeof product.color_variant_images === 'object') {
        for (const items of Object.values(product.color_variant_images)) {
            if (Array.isArray(items)) images.push(...items.filter(Boolean));
        }
    }
    return images;
}

function getVariantImagesForColor(product, color) {
    const colorVariantImages = normalizeVariantImageMap(product?.color_variant_images);
    const normalizedColor = normalizeVariantKey(color);
    if (!normalizedColor) return [];
    return Array.isArray(colorVariantImages[normalizedColor]) ? colorVariantImages[normalizedColor] : [];
}

function groupProductsByName(products) {
    const grouped = new Map();

    products.forEach((product, index) => {
        const name = String(product?.name || '').trim();
        const key = name.toLowerCase() || `unnamed-${product?.id ?? index}`;
        const productColors = normalizeProductColors(product?.color);
        
        let productSizes = [
            ...normalizeProductSizes(product?.sizes),
            ...normalizeProductSizes(product?.size_variants),
            ...normalizeProductSizes(product?.size_variant?.size),
            ...normalizeProductSizes(product?.size),
        ];
        if (Array.isArray(product?.variant_rows)) {
            for (const row of product.variant_rows) {
                if (row?.size) productSizes.push(...normalizeProductSizes(row.size));
            }
        }

        const productImageCandidates = collectVariantImages(product);
        const directVariantImages = normalizeVariantImageMap(product?.color_variant_images);

        if (!grouped.has(key)) {
            grouped.set(key, {
                ...product,
                color: [...productColors],
                sizes: [...new Set(productSizes)],
                image_gallery: [],
                color_variant_images: {},
            });
        }

        const target = grouped.get(key);
        
        const mergedColors = new Set(target.color);
        productColors.forEach((c) => mergedColors.add(c));
        target.color = [...mergedColors];

        const mergedSizes = new Set(target.sizes);
        productSizes.forEach((s) => mergedSizes.add(s));
        target.sizes = [...mergedSizes];

        const mergedGallery = new Set(target.image_gallery);
        productImageCandidates.forEach((img) => mergedGallery.add(img));
        target.image_gallery = [...mergedGallery];

        if (!target.cover_image && product?.cover_image) {
            target.cover_image = product.cover_image;
        }

        const variantMap = { ...target.color_variant_images };
        productColors.forEach((color) => {
            const normalizedColor = normalizeVariantKey(color);
            const mappedImages = Array.isArray(directVariantImages[normalizedColor]) ? directVariantImages[normalizedColor].filter(Boolean) : [];
            const fallbackImages = mappedImages.length > 0 ? mappedImages : productImageCandidates;
            const merged = new Set(variantMap[normalizedColor] || []);

            fallbackImages.forEach((image) => merged.add(image));
            if (merged.size > 0) {
                variantMap[normalizedColor] = [...merged];
            }
        });    

        target.color_variant_images = variantMap;
    });

    return [...grouped.values()];
}

function ColorSwatch({ color, active, onClick, colorLookup }) {
    const swatchColor = getSwatchColor(color, colorLookup);
    const borderClass = getSwatchBorderClass(swatchColor);

    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-flex size-5 items-center justify-center rounded-full bg-white p-[2px] transition-transform hover:scale-110 sm:size-[1.35rem] ${
                active ? 'ring-1 ring-zinc-900/25' : borderClass
            }`}
        >
            <span
                className="block size-full rounded-full"
                style={{ backgroundColor: swatchColor }}
            />
        </button>
    );
}

function toAbsoluteImageUrl(path) {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    return `/${path.replace(/^\/+/, '')}`;
}

function normalizeImageKey(path) {
    if (!path || typeof path !== 'string') return '';
    return path.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').trim();
}

function ProductCard({ product, autoPlay = false, colorLookup = {}, onAddToCart, allowAddToCart = true }) {
    const navigate = useNavigate();
    const colors = useMemo(() => normalizeProductColors(product.color), [product.color]);

    const galleryImages = useMemo(() => {
        const rawGallery = Array.isArray(product.image_gallery) ? product.image_gallery : [];
        const allCandidates = [product.cover_image, ...rawGallery].filter(Boolean);
        const seen = new Set();
        const deduped = [];

        allCandidates.forEach((item) => {
            const key = normalizeImageKey(item);
            if (key && !seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        });

        return deduped.map(toAbsoluteImageUrl);
    }, [product.cover_image, product.image_gallery]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(() => colors[0] || null);

    useEffect(() => {
        setCurrentImageIndex(0);
        setSelectedColor(colors[0] || null);
    }, [product.id, colors]);

    const imageSrc = galleryImages[currentImageIndex] || '';

    useEffect(() => {
        if (!autoPlay || galleryImages.length <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentImageIndex((previous) => (previous === galleryImages.length - 1 ? 0 : previous + 1));
        }, 2500);

        return () => window.clearInterval(timer);
    }, [autoPlay, galleryImages.length]);

    const handlePrevImage = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    }, [galleryImages.length]);

    const handleNextImage = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }, [galleryImages.length]);

    const handleSelectColor = useCallback((color, event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedColor(color);

        const mappedImages = getVariantImagesForColor(product, color);
        if (mappedImages.length === 0) return;

        const firstMapped = mappedImages[0];
        const targetIndex = galleryImages.findIndex(
            (image) => normalizeImageKey(image) === normalizeImageKey(firstMapped),
        );

        if (targetIndex >= 0) setCurrentImageIndex(targetIndex);
    }, [product, galleryImages]);

    const productSlug = String(product?.slug || '').trim();
    const productName = String(product?.name || '').trim();
    const productLink = productSlug
        ? `/product-details/${encodeURIComponent(productSlug)}`
        : `/product-details/${encodeURIComponent(productName)}`;

    const handleAddToCartClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        onAddToCart?.(product, { selectedColor, quantity: 1, image: imageSrc });
    }, [onAddToCart, product, selectedColor, imageSrc]);

    const handleQuickView = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(productLink);
    }, [navigate, productLink]);

    const handleWishlist = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        toast.info('Wishlist will be available soon');
    }, []);

    return (
        <article className="group w-full cursor-pointer">
            <Link to={productLink} className="block">
                <div className="relative overflow-hidden">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={product.name}
                            loading="lazy"
                            className="h-[340px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[420px] lg:h-[520px]"
                        />
                    ) : (
                        <div className="h-[340px] w-full bg-transparent sm:h-[420px] lg:h-[520px]" />
                    )}

                    {allowAddToCart && (
                        <div className="product-hover-cta absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <button
                                type="button"
                                onClick={handleAddToCartClick}
                                className="inline-flex h-9 items-center justify-center bg-zinc-900 px-4 text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-zinc-800"
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
                    )}

                    {galleryImages.length > 1 && (
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
                    )}
                </div>
            </Link>

            <div className="space-y-1 pt-3.5">
                {colors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {colors.slice(0, 6).map((c, i) => (
                            <ColorSwatch
                                key={`${c}-${i}`}
                                color={c}
                                active={selectedColor === c}
                                colorLookup={colorLookup}
                                onClick={(event) => handleSelectColor(c, event)}
                            />
                        ))}
                    </div>
                )}

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

export default function ProductDividerSection({ sectionTitle = '' }) {
    const { addToCart, openCartDrawer } = useCart();
    const [products, setProducts] = useState([]);
    const [colorLookup, setColorLookup] = useState({});
    const [loading, setLoading] = useState(true);
    const [variantModalState, setVariantModalState] = useState(null);
    const sliderId = useId().replace(/:/g, '');
    const swiperRef = useRef(null);
    const prevNavClass = `best-sellers-prev-${sliderId}`;
    const nextNavClass = `best-sellers-next-${sliderId}`;
    
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    const isBestSeller = useCallback((product) => {
        return product?.show_on_best_sellers === true || Number(product?.show_on_best_sellers) === 1;
    }, []);

    const normalizeProductList = useCallback((payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.items)) return payload.items;
        return [];
    }, []);

    const notifyBuilderSelection = useCallback((itemIndex = null) => {
        if (!isBuilderPreview) return;
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_BEST_SELLERS_SECTION_SELECTED',
                    payload: { itemIndex },
                },
                window.location.origin,
            );
        }
    }, [isBuilderPreview]);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const [resResult, colorResult] = await Promise.allSettled([
                    fetch('/api/public/shop-products', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/colors', { headers: { Accept: 'application/json' } })
                ]);

                let finalProducts = [];
                if (resResult.status === 'fulfilled' && resResult.value.ok) {
                    const data = await resResult.value.json();
                    finalProducts = normalizeProductList(data).filter(isBestSeller);
                }

                if (isBuilderPreview && finalProducts.length === 0) {
                    const adminRes = await fetch('/api/products', {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    });
                    if (adminRes.ok) {
                        const adminData = await adminRes.json();
                        finalProducts = normalizeProductList(adminData).filter(isBestSeller);
                    }
                }

                let nextColorLookup = {};
                if (colorResult.status === 'fulfilled' && colorResult.value.ok) {
                    const colorData = await colorResult.value.json();
                    const colorList = Array.isArray(colorData)
                        ? colorData
                        : (Array.isArray(colorData?.data) ? colorData.data : []);

                    nextColorLookup = Object.fromEntries(
                        colorList.flatMap(normalizeColorLookupEntries),
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
    }, [isBuilderPreview, isBestSeller, normalizeProductList]);

    const displayProducts = useMemo(() => {
        const grouped = groupProductsByName(products);
        if (grouped.length === 0) {
            return [];
        }

        const base = grouped.map((item, index) => ({
            ...item,
            __baseIndex: index,
        }));

        const targetLength = Math.max(MIN_LOOP_SLIDES, base.length);
        const repeated = [];
        let cycle = 0;

        while (repeated.length < targetLength) {
            base.forEach((item, baseIndex) => {
                if (repeated.length >= targetLength) {
                    return;
                }

                repeated.push({
                    ...item,
                    uiUniqueId: `${item.id || baseIndex}-${cycle}-${baseIndex}`,
                });
            });

            cycle += 1;
        }

        return repeated;
    }, [products]);

    const loopEnabled = displayProducts.length > 1;

    const handleAddToCart = useCallback((product, options = {}) => {
        setVariantModalState({ product, defaults: options });
    }, []);

    const handleConfirmVariant = useCallback((options = {}) => {
        if (!variantModalState?.product) return;

        const nextItem = addToCart(variantModalState.product, options);
        setVariantModalState(null);
        toast.success(`${nextItem.name} added to cart`);
        openCartDrawer();
    }, [variantModalState, addToCart, openCartDrawer]);

    const scrollAnimationVariants = {
        hidden: { opacity: 0, x: 250 },
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: { type: 'spring', stiffness: 45, damping: 15, mass: 0.8 } 
        },
        exit: { 
            opacity: 0, 
            x: -250, 
            transition: { ease: 'easeInOut', duration: 0.5 } 
        }
    };

    return (
        <section
            className={`${timelessFontClass} overflow-x-hidden py-6 sm:py-8`}
            onClick={() => notifyBuilderSelection(null)}
        >
            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-7 lg:px-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
                    <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                        {sectionTitle}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex h-72 items-center justify-center">
                        <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                    </div>
                ) : displayProducts.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        exit="exit"
                        variants={scrollAnimationVariants}
                        viewport={{ once: false, amount: 0.15 }}
                    >
                        <Swiper
                            key={`swiper-list-${displayProducts.length}`}
                            modules={[Navigation, Autoplay, EffectCoverflow]}
                            effect="coverflow"
                            coverflowEffect={{
                                rotate: 0,
                                stretch: -48,
                                depth: 240,
                                modifier: 1.25,
                                slideShadows: false,
                            }}
                            grabCursor
                            centeredSlides={true}
                            watchSlidesProgress
                            navigation={{
                                prevEl: `.${prevNavClass}`,
                                nextEl: `.${nextNavClass}`,
                            }}
                            autoplay={loopEnabled ? {
                                delay: 2800,
                                reverseDirection: false,
                                disableOnInteraction: false,
                                ...({ pauseOnMouseEnter: false }),
                            } : false}
                            loop={loopEnabled}
                            loopedSlides={displayProducts.length}
                            slidesPerGroup={1}
                            spaceBetween={16}
                            slidesPerView={1.15}
                            breakpoints={{
                                480: { slidesPerView: 1.35 },
                                640: { slidesPerView: 1.8 },
                                860: { slidesPerView: 2.2 },
                                1180: { slidesPerView: 2.6 },
                                1460: { slidesPerView: 3.1 },
                            }}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            className="best-sellers-swiper pb-4"
                        >
                            {displayProducts.map((product, index) => (
                                <SwiperSlide
                                    key={product.uiUniqueId}
                                    className="h-auto transition-all duration-500 scale-[0.88] opacity-60 [&.swiper-slide-active]:scale-100 [&.swiper-slide-active]:opacity-100 [&.swiper-slide-active]:z-10"
                                    onClick={(event) => {
                                        if (!isBuilderPreview) return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        notifyBuilderSelection(product.__baseIndex ?? index);
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                        autoPlay={isBuilderPreview}
                                        colorLookup={colorLookup}
                                        onAddToCart={handleAddToCart}
                                        allowAddToCart={true}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </motion.div>
                ) : (
                    <p className="mt-3 text-sm text-zinc-500">No products are marked as Best Sellers.</p>
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