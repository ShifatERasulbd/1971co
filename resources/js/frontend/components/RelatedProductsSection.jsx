import { Eye, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import ProductVariantModal from './ProductVariantModal.jsx';
import { featuresFontClass } from '../utils/typography';
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
                // Fall through to comma-delimited parsing.
            }
        }

        return trimmedValue
            .split(',')
            .map((item) => item.trim().replace(/^[\[\]"']+|[\[\]"']+$/g, ''))
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

    if (!/^#[0-9a-f]{3,8}$/i.test(colorCode)) {
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

function toPrice(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.-]+/g, '');
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function getSwatchColor(value, colorLookup = {}) {
    const raw = String(value || '').trim();

    if (!raw) {
        return '#d4d4d8';
    }

    if (/gradient\s*\(/i.test(raw)) {
        return raw;
    }

    if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
        return raw;
    }

    if (/^(rgb|rgba|hsl|hsla|oklch|lab|lch)\(/i.test(raw)) {
        return raw;
    }

    const mapped = colorLookup[raw.toLowerCase()];
    if (mapped) {
        return mapped;
    }

    if (/^[a-z\s-]+$/i.test(raw)) {
        return raw.toLowerCase().replace(/[\s-]+/g, '');
    }

    return '#d4d4d8';
}

function getSwatchBorderColor(value, colorLookup = {}) {
    const color = getSwatchColor(value, colorLookup);

    if (/^#(?:fff|ffffff|fefefe|fdfdfd|f8f8f8)$/i.test(color)) {
        return 'border-zinc-300';
    }

    if (/^#(?:eaeaea|ececec|f2f2f2|f4f4f4|f6f6f6)$/i.test(color)) {
        return 'border-zinc-300';
    }

    return 'border-zinc-200';
}

function ColorSwatch({ color, active, onClick, colorLookup = {} }) {
    const swatchColor = getSwatchColor(color, colorLookup);
    const borderColor = getSwatchBorderColor(color, colorLookup);
    const usesGradient = /gradient\s*\(/i.test(swatchColor);

    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-flex size-5 items-center justify-center rounded-full ${borderColor} bg-white p-0.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform hover:scale-110 sm:size-[1.35rem] ${
                active ? 'ring-1 ring-zinc-900/30' : ''
            }`}
            style={usesGradient ? { background: swatchColor } : { backgroundColor: swatchColor }}
        />
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

function resolveVariantImagesByColor(variantMap, colorValue) {
    if (!variantMap || typeof variantMap !== 'object') {
        return [];
    }

    const colorKey = String(colorValue || '').trim();
    if (!colorKey) {
        return [];
    }

    const direct = Array.isArray(variantMap[colorKey]) ? variantMap[colorKey].filter(Boolean) : [];
    if (direct.length > 0) {
        return direct;
    }

    const matchedEntry = Object.entries(variantMap).find(
        ([key]) => String(key || '').trim().toLowerCase() === colorKey.toLowerCase(),
    );

    return Array.isArray(matchedEntry?.[1]) ? matchedEntry[1].filter(Boolean) : [];
}

function RelatedProductCard({ product, onAddToCart, colorLookup = {} }) {
    const navigate = useNavigate();
    const colors = normalizeProductColors(product?.color);
    const colorVariantImages =
        product?.color_variant_images && typeof product.color_variant_images === 'object'
            ? product.color_variant_images
            : {};

    const galleryImages = useMemo(() => {
        const rawGallery = Array.isArray(product?.image_gallery) ? product.image_gallery : [];
        const allCandidates = [product?.cover_image, ...rawGallery].filter(Boolean);
        const seen = new Set();
        const deduped = [];

        allCandidates.forEach((item) => {
            const key = normalizeImageKey(item);
            if (!key || seen.has(key)) {
                return;
            }

            seen.add(key);
            deduped.push(toAbsoluteImageUrl(item));
        });

        return deduped.length > 0 ? deduped : [fallbackImage];
    }, [product?.cover_image, product?.image_gallery]);

    const [selectedColor, setSelectedColor] = useState(() => String(colors[0] || '').trim() || null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const nextColor = String(colors[0] || '').trim() || null;
        setSelectedColor(nextColor);
        setCurrentImageIndex(0);
    }, [product?.id, product?.color]);

    useEffect(() => {
        const selected = String(selectedColor || '').trim();
        if (!selected) {
            return;
        }

        const mappedImages = resolveVariantImagesByColor(colorVariantImages, selected);
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
    }, [selectedColor, colorVariantImages, galleryImages]);

    const imageSource = galleryImages[currentImageIndex] || galleryImages[0] || fallbackImage;
    const displayPrice = useMemo(
        () => toPrice(product?.priceValue ?? product?.price),
        [product?.priceValue, product?.price],
    );
    const productSlug = String(product?.slug || '').trim();
    const productName = String(product?.name || '').trim();
    const preferredColor = String(selectedColor || colors[0] || '').trim();
    const productLinkBase = productSlug
        ? `/product-details/${encodeURIComponent(productSlug)}`
        : `/product-details/${encodeURIComponent(productName)}`;
    const productLink = preferredColor
        ? `${productLinkBase}/${encodeURIComponent(preferredColor)}`
        : productLinkBase;

    function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        onAddToCart?.(product, {
            selectedColor: preferredColor || null,
            quantity: 1,
            image: imageSource,
        });
    }

    function handleSelectColor(color, event) {
        event.preventDefault();
        event.stopPropagation();
        setSelectedColor(String(color || '').trim() || null);
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
        <article className="group mx-auto w-full max-w-[315px] cursor-pointer">
            <div className="relative h-[400px] overflow-hidden bg-zinc-100">
                <Link to={productLink} className="block">
                <img
                    src={imageSource}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                </Link>

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
            </div>

            <div className="space-y-1 pt-3.5 text-left">
                {colors.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {colors.slice(0, 6).map((color, index) => (
                            <ColorSwatch
                                key={`${color}-${index}`}
                                color={color}
                                active={String(color || '').trim().toLowerCase() === String(selectedColor || '').trim().toLowerCase()}
                                colorLookup={colorLookup}
                                onClick={(event) => handleSelectColor(color, event)}
                            />
                        ))}
                    </div>
                ) : null}

                <Link to={productLink} className="block">
                    <h3 className={`font-monstrate ${sectionTypography.productName} line-clamp-2 text-[0.95rem] font-medium leading-[1.15] text-zinc-900 transition-opacity hover:opacity-70 sm:text-[1.02rem]`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-[1.2rem] font-semibold leading-none text-zinc-800 sm:text-[.95rem]`}>
                    ${displayPrice.toFixed(2)}
                </p>
            </div>
        </article>
    );
}

export default function RelatedProductsSection({ products = [] }) {
    const { addToCart, openCartDrawer } = useCart();
    const [variantModalState, setVariantModalState] = useState(null);
    const [colorLookup, setColorLookup] = useState({});

    useEffect(() => {
        let ignore = false;

        async function loadColors() {
            try {
                const response = await fetch('/api/public/colors', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                const colorList = Array.isArray(payload)
                    ? payload
                    : (Array.isArray(payload?.data) ? payload.data : []);

                if (colorList.length === 0) {
                    return;
                }

                const normalized = colorList.flatMap((item) => normalizeColorLookupEntries(item));

                if (!ignore) {
                    setColorLookup(Object.fromEntries(normalized));
                }
            } catch {
                // Keep default fallback colors when color map fetch fails.
            }
        }

        loadColors();

        return () => {
            ignore = true;
        };
    }, []);

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
        <section className={`${featuresFontClass} bg-[#f8f8f7] py-10 sm:py-14`}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes relatedLightWaveSweep {
                    0%   { transform: translateX(-220%); }
                    100% { transform: translateX(420%); }
                }
                .related-wave-outer, .related-wave-mid, .related-wave-core, .related-wave-hotspot {
                    animation: relatedLightWaveSweep 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                
                <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 sm:mb-8">
                    <div>
                        <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                            Related Products
                        </h2>
                        <p className="font-monstrate mt-2 text-xs text-zinc-500 sm:text-sm">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/shop"
                        className={`font-monstrate ${sectionTypography.sectionMetaLink} inline-flex items-center self-end `}
                    >
                        View all products
                    </Link>

                    <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-zinc-300">
                        <div className="related-wave-outer absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[3px]" />
                        <div className="related-wave-mid absolute inset-y-0 w-[35%] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1.5px]" />
                        <div className="related-wave-core absolute inset-y-0 w-[18%] bg-gradient-to-r from-transparent via-white to-transparent" />
                        <div className="related-wave-hotspot absolute inset-y-0 w-[7%] bg-gradient-to-r from-transparent via-white to-transparent brightness-[2]" />
                    </div>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                        {products.map((product) => (
                            <RelatedProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                colorLookup={colorLookup}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <ProductVariantModal
                isOpen={Boolean(variantModalState?.product)}
                product={variantModalState?.product || null}
                defaults={variantModalState?.defaults || {}}
                onClose={() => setVariantModalState(null)}
                onConfirm={handleConfirmVariant}
            />
        </section>
    );
}