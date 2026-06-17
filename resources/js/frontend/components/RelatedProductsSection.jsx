import { Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import ProductVariantModal from './ProductVariantModal.jsx';
import { featuresFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

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
    const raw = String(value || '').trim();

    if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
        return raw;
    }

    if (/^[a-z]+$/i.test(raw)) {
        return raw.toLowerCase();
    }

    return '#d4d4d8';
}

function getSwatchBorderColor(value) {
    const color = getSwatchColor(value);

    if (/^#(?:fff|ffffff|fefefe|fdfdfd|f8f8f8)$/i.test(color)) {
        return 'border-zinc-300';
    }

    if (/^#(?:eaeaea|ececec|f2f2f2|f4f4f4|f6f6f6)$/i.test(color)) {
        return 'border-zinc-300';
    }

    return 'border-zinc-200';
}

function ColorSwatch({ color, active, onClick }) {
    const swatchColor = getSwatchColor(color);
    const borderColor = getSwatchBorderColor(color);

    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-flex size-5 items-center justify-center rounded-full ${borderColor} bg-white p-0.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform hover:scale-110 sm:size-[1.35rem] ${
                active ? 'ring-1 ring-zinc-900/30' : ''
            }`}
            style={{ backgroundColor: swatchColor }}
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

function RelatedProductCard({ product, onAddToCart }) {
    const navigate = useNavigate();
    const imageSource = toAbsoluteImageUrl(product?.cover_image || product?.image_gallery?.[0] || fallbackImage);
    const colors = normalizeProductColors(product?.color);
    const productSlug = String(product?.slug || '').trim();
    const productName = String(product?.name || '').trim();
    const productLink = productSlug
        ? `/singleProduct?slug=${encodeURIComponent(productSlug)}`
        : `/singleProduct?name=${encodeURIComponent(productName)}`;

    function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        onAddToCart?.(product, {
            quantity: 1,
            image: imageSource,
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
            <div className="relative overflow-hidden bg-zinc-100">
                <Link to={productLink} className="block">
                <img
                    src={imageSource}
                    alt={product.name}
                    className="h-[320px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[360px] lg:h-[400px]"
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
                                active={index === 0}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            />
                        ))}
                    </div>
                ) : null}

                <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} line-clamp-2 text-[0.95rem] font-medium leading-[1.15] text-zinc-900 transition-opacity hover:opacity-70 sm:text-[1.02rem]`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-[1.2rem] font-semibold leading-none text-zinc-800 sm:text-[.95rem]`}>
                    ${Number(product.priceValue).toFixed(2)}
                </p>
            </div>
        </article>
    );
}

export default function RelatedProductsSection({ products = [] }) {
    const { addToCart, openCartDrawer } = useCart();
    const [variantModalState, setVariantModalState] = useState(null);

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
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
                    <div>
                        <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                            Related Products
                        </h2>
                        <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/shop"
                        className={`${sectionTypography.sectionMetaLink} inline-flex items-center self-start border-b border-zinc-900 pb-0.5 text-zinc-500 transition-opacity hover:opacity-70`}
                    >
                        View all products
                    </Link>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                        {products.map((product) => (
                            <RelatedProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
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