import { SlidersHorizontal } from 'lucide-react';

import { featuresFontClass } from '../../utils/typography';
import ShopSidebar from './ShopSidebar.jsx';

const productImage = '/uploads/heroes/images/hero1.webp';

const products = [
    { id: 1, name: 'Corporate Signature Sweatshirt', price: '$68.00', tag: 'Best Seller', position: 'object-[45%_center]' },
    { id: 2, name: 'Classic Team Hoodie', price: '$72.00', tag: 'New', position: 'object-[52%_center]' },
    { id: 3, name: 'Performance Office Tee', price: '$44.00', tag: null, position: 'object-[58%_center]' },
    { id: 4, name: 'Premium Embroidered Crewneck', price: '$82.00', tag: 'Popular', position: 'object-[62%_center]' },
    { id: 5, name: 'Modern Fit Polo', price: '$54.00', tag: null, position: 'object-[49%_center]' },
    { id: 6, name: 'Athletic Team Jersey', price: '$60.00', tag: null, position: 'object-[65%_center]' },
    { id: 7, name: 'Corporate Essentials Zip Hoodie', price: '$76.00', tag: null, position: 'object-[54%_center]' },
    { id: 8, name: 'Minimalist Staff Tee', price: '$39.00', tag: null, position: 'object-[47%_center]' },
];

function ProductCard({ product }) {
    return (
        <article className="group overflow-hidden border border-zinc-200 bg-white">
            <div className="relative overflow-hidden bg-zinc-100">
                <img
                    src={productImage}
                    alt={product.name}
                    className={`h-[250px] w-full object-cover ${product.position} transition-transform duration-500 group-hover:scale-105 sm:h-[320px]`}
                />

                {product.tag ? (
                    <span className="absolute left-3 top-3 bg-zinc-950 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white">
                        {product.tag}
                    </span>
                ) : null}
            </div>

            <div className="space-y-2 p-4">
                <h3 className="text-[1.05rem] font-medium leading-6 text-zinc-900">{product.name}</h3>
                <p className="text-[0.95rem] uppercase tracking-[0.1em] text-zinc-600">{product.price}</p>
                <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center border border-zinc-900 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                    Add to cart
                </button>
            </div>
        </article>
    );
}

function ShopProductsGrid() {
    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3  py-4">
                <p className="text-[0.88rem]  tracking-[0.07em] text-slate-600">
                    Showing 1-12 of 27 results
                </p>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-zinc-950 px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white"
                >
                    <SlidersHorizontal className="size-4" strokeWidth={1.7} />
                    Sort by
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] ${
                            page === 1
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ShopCatalogSection() {
    return (
        <section className={`${featuresFontClass} px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1480px] gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
                <ShopSidebar />
                <ShopProductsGrid />
            </div>
        </section>
    );
}
