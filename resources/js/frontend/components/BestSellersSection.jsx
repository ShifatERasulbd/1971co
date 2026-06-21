import { ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
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

function normalizeColorLookupEntry(record) {
    if (!record || typeof record !== 'object') {
        return null;
    }

    const name = String(record.name || '').trim();
    const colorCode = String(record.color_code || '').trim();

    if (!name || !/^#[0-9a-f]{6}$/i.test(colorCode)) {
        return null;
    }

    return [name.toLowerCase(), colorCode];
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

function groupProductsByName(products) {
    const grouped = new Map();

    products.forEach((product, index) => {
        const name = String(product?.name || '').trim();
        const key = name.toLowerCase() || `unnamed-${product?.id ?? index}`;
        const existing = grouped.get(key);
        const productColors = normalizeProductColors(product?.color);
        const productSizes = [
            ...normalizeProductSizes(product?.sizes),
            ...normalizeProductSizes(product?.size_variants),
            ...normalizeProductSizes(product?.size_variant?.size),
            ...normalizeProductSizes(product?.size),
            ...((Array.isArray(product?.variant_rows)
                ? product.variant_rows.map((row) => row?.size)
                : []).flatMap((value) => normalizeProductSizes(value))),
        ];
        const productImageCandidates = collectVariantImages(product);
        const directVariantImages =
            product?.color_variant_images && typeof product.color_variant_images === 'object'
                ? product.color_variant_images
                : {};

        if (!existing) {
            const next = {
                ...product,
                color: [...productColors],
                sizes: [...new Set(productSizes)],
                image_gallery: [],
                color_variant_images: {},
            };

            grouped.set(key, next);
        }

        const target = grouped.get(key);
        const mergedColors = new Set(normalizeProductColors(target.color));
        productColors.forEach((color) => mergedColors.add(color));
        target.color = [...mergedColors];

        const mergedSizes = new Set(normalizeProductSizes(target.sizes));
        productSizes.forEach((size) => mergedSizes.add(size));
        target.sizes = [...mergedSizes];

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

function ColorSwatch({ color, active, onClick, colorLookup }) {
    const swatchColor = getSwatchColor(color, colorLookup);
    const borderClass = getSwatchBorderClass(swatchColor);

    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-flex size-5 items-center justify-center rounded-full bg-white p-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform hover:scale-110 sm:size-[1.35rem] ${
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
    const productLink = productSlug
        ? `/singleProduct?slug=${encodeURIComponent(productSlug)}`
        : `/singleProduct?name=${encodeURIComponent(productName)}`;

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

export default function BestSellersSection({ sectionTitle = 'Best Sellers' }) {
    const { addToCart, openCartDrawer } = useCart();
    const [products, setProducts] = useState([]);
    const [colorLookup, setColorLookup] = useState({});
    const [loading, setLoading] = useState(true);
    const [variantModalState, setVariantModalState] = useState(null);
    const sliderId = useId().replace(/:/g, '');
    const prevNavClass = `best-sellers-prev-${sliderId}`;
    const nextNavClass = `best-sellers-next-${sliderId}`;
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
                        colorList
                            .map(normalizeColorLookupEntry)
                            .filter(Boolean),
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

    const displayProducts = loading
        ? PLACEHOLDER_PRODUCTS
        : groupProductsByName(products);

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
            className={`${timelessFontClass} bg-white py-10 sm:py-14`}
            style={{ backgroundColor: '#ffffff' }}
            onClick={() => notifyBuilderSelection(null)}
        >
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
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
                            className={`${sectionTypography.sectionMetaLink} text-zinc-500 transition-colors hover:text-zinc-900`}
                        >
                            Shop All
                        </Link>
                    </div>
                </div>

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
                    spaceBetween={16}
                    slidesPerView={1.15}
                    breakpoints={{
                        480: { slidesPerView: 1.45 },
                        640: { slidesPerView: 2.1 },
                        860: { slidesPerView: 3.1 },
                        1180: { slidesPerView: 4.1 },
                        1460: { slidesPerView: 5.1 },
                    }}
                    className="best-sellers-swiper pb-4"
                >
                    {displayProducts.map((product, index) => (
                        <SwiperSlide
                            key={product.id || `${product.name}-${index}`}
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
                                colorLookup={colorLookup}
                                onAddToCart={handleAddToCart}
                                allowAddToCart={!loading}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {!loading && displayProducts.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">No products are marked as Best Sellers.</p>
                ) : null}

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