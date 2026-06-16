import { ArrowLeft, ArrowRight, Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import ProductVariantModal from './ProductVariantModal.jsx';
import { featuresFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

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

function RelatedProductCard({ product, onAddToCart }) {
    const navigate = useNavigate();
    const imageSource = toAbsoluteImageUrl(product?.cover_image || product?.image_gallery?.[0] || fallbackImage);
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
        <article className="group cursor-pointer">
            <div className="relative overflow-hidden bg-[#f6f6f6]">
                <Link to={productLink} className="block">
                <img
                    src={imageSource}
                    alt={product.name}
                    className="h-[280px] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102 sm:h-[340px] lg:h-[440px]"
                />
                </Link>

                <div className="pointer-events-none absolute inset-x-0 bottom-5 left-0 flex items-center justify-center gap-2 px-4 opacity-0 transition-all duration-300 transform translate-y-2 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="inline-flex h-9 items-center justify-center bg-zinc-900 px-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-zinc-800"
                    >
                        Add to cart
                    </button>
                    <button
                        type="button"
                        onClick={handleWishlist}
                        aria-label="Add to wishlist"
                        className="inline-flex size-9 items-center justify-center bg-white text-zinc-700 border border-zinc-200 transition-colors duration-200 hover:text-zinc-950"
                    >
                        <Heart className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleQuickView}
                        aria-label="Preview product"
                        className="inline-flex size-9 items-center justify-center bg-white text-zinc-700 border border-zinc-200 transition-colors duration-200 hover:text-zinc-950"
                    >
                        <Eye className="size-4" />
                    </button>
                </div>
            </div>

            <div className="pt-3 text-left">
                <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} text-zinc-900 line-clamp-2 transition-opacity hover:opacity-70`}>
                        {product.name}
                    </h3>
                </Link>
                <p className={`mt-1 ${sectionTypography.productPrice} text-zinc-950`}>${Number(product?.price || 0).toFixed(2)}</p>
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
        <section className={`${featuresFontClass} bg-white border-t border-zinc-100 py-16 sm:py-20 lg:py-24`}>
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="font-serif text-[1.8rem] uppercase tracking-wide text-zinc-900 sm:text-[2.2rem]">
                            Related Products
                        </h2>
                        <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/shop"
                        className="inline-flex items-center self-start border-b border-zinc-900 pb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 transition-opacity hover:opacity-70"
                    >
                        View all products
                    </Link>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        aria-label="Previous related products"
                        className="absolute -left-12 top-1/2 hidden -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900 xl:inline-flex"
                    >
                        <ArrowLeft className="size-7" strokeWidth={1.2} />
                    </button>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                        {products.map((product) => (
                            <RelatedProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-label="Next related products"
                        className="absolute -right-12 top-1/2 hidden -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-900 xl:inline-flex"
                    >
                        <ArrowRight className="size-7" strokeWidth={1.2} />
                    </button>
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