import { ArrowLeft, ArrowRight, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const products = [
    {
        id: 1,
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$54.00',
        image: '/uploads/personalizer/order/order-design-ec8725a6-cb1f-456a-b929-ebf789cc956d.png',
    },
    {
        id: 2,
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$95.00',
        image: '/uploads/personalizer/order/order-design-7069fa1a-7e0f-4ed7-80df-3b10ac7092d0.png',
    },
    {
        id: 3,
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$56.00',
        image: '/uploads/personalizer/order/order-design-e9e2e99a-d9f7-40a1-9a43-773d8aa00524.png',
    },
    {
        id: 4,
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$65.00',
        image: '/uploads/personalizer/order/order-design-a821648d-34d4-4db9-b17b-986431fd341b.png',
    },
];

function RelatedProductCard({ product }) {
    return (
        <article className="group cursor-pointer">
            {/* Soft gray card/image box frame to hold the product safely */}
            <div className="relative overflow-hidden bg-[#f6f6f6]">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-[280px] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102 sm:h-[340px] lg:h-[440px]"
                />

                {/* Hover Quick Actions Area */}
                <div className="pointer-events-none absolute inset-x-0 bottom-5 left-0 flex items-center justify-center gap-2 px-4 opacity-0 transition-all duration-300 transform translate-y-2 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center bg-zinc-900 px-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-zinc-800"
                    >
                        Add to cart
                    </button>
                    <button
                        type="button"
                        aria-label="Add to wishlist"
                        className="inline-flex size-9 items-center justify-center bg-white text-zinc-700 border border-zinc-200 transition-colors duration-200 hover:text-zinc-950"
                    >
                        <Heart className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Preview product"
                        className="inline-flex size-9 items-center justify-center bg-white text-zinc-700 border border-zinc-200 transition-colors duration-200 hover:text-zinc-950"
                    >
                        <Eye className="size-4" />
                    </button>
                </div>
            </div>

            {/* Compact Typography Container */}
            <div className="pt-3 text-left">
                <h3 className="text-[0.92rem] font-medium tracking-wide text-zinc-800 transition-colors group-hover:text-zinc-600 sm:text-[0.98rem]">
                    {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-zinc-950">{product.price}</p>
            </div>
        </article>
    );
}

export default function RelatedProductsSection() {
    return (
        // Changed to clean white background with fine border partitioning
        <section className={`${featuresFontClass} bg-white border-t border-zinc-100 py-16 sm:py-20 lg:py-24`}>
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                
                {/* Header Layout Section */}
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

                {/* Slider / Grid Container with Refined Control Navigation */}
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
                            <RelatedProductCard key={product.id} product={product} />
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
        </section>
    );
}