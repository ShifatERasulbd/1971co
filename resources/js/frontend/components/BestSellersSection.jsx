import { useEffect, useRef, useState } from 'react';
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

function ColorSwatch({ color }) {
    return (
        <span
            title={color}
            className="inline-block size-4 rounded-full border border-zinc-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
            style={{ backgroundColor: color }}
        />
    );
}

function ProductCard({ product }) {
    const colors = Array.isArray(product.color)
        ? product.color
        : typeof product.color === 'string' && product.color
            ? [product.color]
            : [];

    const imageSrc = product.cover_image
        ? (product.cover_image.startsWith('http') ? product.cover_image : `/${product.cover_image.replace(/^\//, '')}`)
        : fallbackImage;

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
                </div>
            </Link>

            <div className="pt-3 space-y-1.5">
                {colors.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {colors.slice(0, 6).map((c, i) => (
                            <ColorSwatch key={`${c}-${i}`} color={c} />
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

export default function BestSellersSection() {
    const [products, setProducts] = useState(PLACEHOLDER_PRODUCTS);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const res = await fetch('/api/public/products', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore && Array.isArray(data) && data.length > 0) {
                        setProducts(data);
                    }
                }
            } catch {
                // keep placeholders
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    const displayProducts = loading ? PLACEHOLDER_PRODUCTS : products;

    return (
        <section className={`${timelessFontClass} bg-[#f8f8f7] py-10 sm:py-14`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                    <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                        Best Sellers
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
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
