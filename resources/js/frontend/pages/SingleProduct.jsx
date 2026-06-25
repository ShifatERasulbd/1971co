import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const SingleProductMainSection = lazy(() => import('../components/SingleProductMainSection.jsx'));
// const SingleProductInfoTabs = lazy(() => import('../components/SingleProductInfoTabs.jsx'));
const RelatedProductsSection = lazy(() => import('../components/RelatedProductsSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass, variant = 'generic' }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} variant={variant} />}>{children}</Suspense>;
}

function parseColorTokens(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    return [];
}

function productMatchesColor(product, colorParam) {
    const wanted = String(colorParam || '').trim().toLowerCase();
    if (!wanted) {
        return false;
    }

    return parseColorTokens(product?.color).some(
        (token) => String(token || '').trim().toLowerCase() === wanted,
    );
}

export default function SingleProductPage() {
    const { slug: routeSlug = '', color: routeColor = '' } = useParams();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function loadProducts() {
            try {
                const response = await fetch('/api/public/shop-products', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    if (!ignore) {
                        setProducts([]);
                    }
                    return;
                }

                const payload = await response.json();
                if (!ignore) {
                    setProducts(Array.isArray(payload) ? payload : []);
                }
            } catch {
                if (!ignore) {
                    setProducts([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            ignore = true;
        };
    }, []);

    const currentProduct = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) {
            return null;
        }

        const slugParam = routeSlug || searchParams.get('slug');
        const nameParam = searchParams.get('name');
        const colorParam = (routeColor || searchParams.get('color') || '').replace(/-/g, ' ');

        if (slugParam) {
            const bySlugCandidates = products.filter((item) => String(item?.slug || '') === String(slugParam));
            const bySlug = bySlugCandidates.find((item) => productMatchesColor(item, colorParam)) || bySlugCandidates[0];
            if (bySlug) {
                return bySlug;
            }
        }

        if (nameParam) {
            const normalizedName = String(nameParam).trim().toLowerCase();
            const byNameCandidates = products.filter(
                (item) => String(item?.name || '').trim().toLowerCase() === normalizedName,
            );
            const byName = byNameCandidates.find((item) => productMatchesColor(item, colorParam)) || byNameCandidates[0];

            if (byName) {
                return byName;
            }
        }

        return products[0] || null;
    }, [products, routeSlug, routeColor, searchParams]);

    const initialColor = useMemo(() => {
        const colorParam = String(routeColor || searchParams.get('color') || '').trim().replace(/-/g, ' ');
        return colorParam;
    }, [routeColor, searchParams]);

    const relatedProducts = useMemo(() => {
        if (!currentProduct) {
            return [];
        }

        const sameGroup = products.filter(
            (item) =>
                item?.id !== currentProduct.id
                && item?.grand_child_id != null
                && item?.grand_child_id === currentProduct.grand_child_id,
        );

        const fallback = products.filter((item) => item?.id !== currentProduct.id);

        return (sameGroup.length > 0 ? sameGroup : fallback).slice(0, 8);
    }, [products, currentProduct]);

    if (isLoading) {
        return (
            <div className="bg-white">
                <LazySection heightClass="h-[760px]" variant="product">
                    <SectionSkeleton heightClass="h-[760px]" variant="product" />
                </LazySection>
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="bg-white px-6 py-20 text-center text-zinc-600">
                Product not found.
            </div>
        );
    }

    return (
        <div className="bg-white">
            <LazySection heightClass="h-[760px]" variant="product">
                <SingleProductMainSection product={currentProduct} initialColor={initialColor} />
            </LazySection>
            <LazySection heightClass="h-[320px]" variant="generic">
                {/* <SingleProductInfoTabs product={currentProduct} /> */}
            </LazySection>
            <LazySection heightClass="h-[640px]" variant="catalog">
                <RelatedProductsSection products={relatedProducts} />
            </LazySection>
            <LazySection heightClass="h-[220px]" variant="newsletter">
                <NewsletterSection />
            </LazySection>
           
        </div>
    );
}
