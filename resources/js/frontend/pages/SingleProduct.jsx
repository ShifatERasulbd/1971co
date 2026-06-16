import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const SingleProductMainSection = lazy(() => import('../components/SingleProductMainSection.jsx'));
const SingleProductInfoTabs = lazy(() => import('../components/SingleProductInfoTabs.jsx'));
const RelatedProductsSection = lazy(() => import('../components/RelatedProductsSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} />}>{children}</Suspense>;
}

export default function SingleProductPage() {
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

        const idParam = searchParams.get('id');
        const slugParam = searchParams.get('slug');

        if (idParam) {
            const byId = products.find((item) => String(item?.id) === String(idParam));
            if (byId) {
                return byId;
            }
        }

        if (slugParam) {
            const bySlug = products.find((item) => String(item?.slug || '') === String(slugParam));
            if (bySlug) {
                return bySlug;
            }
        }

        return products[0] || null;
    }, [products, searchParams]);

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
                <LazySection heightClass="h-[760px]">
                    <SectionSkeleton heightClass="h-[760px]" />
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
            <LazySection heightClass="h-[760px]">
                <SingleProductMainSection product={currentProduct} />
            </LazySection>
            <LazySection heightClass="h-[320px]">
                <SingleProductInfoTabs product={currentProduct} />
            </LazySection>
            <LazySection heightClass="h-[640px]">
                <RelatedProductsSection products={relatedProducts} />
            </LazySection>
            <LazySection heightClass="h-[220px]">
                <NewsletterSection />
            </LazySection>
            <LazySection heightClass="h-[320px]">
                <InstagramSection />
            </LazySection>
        </div>
    );
}
