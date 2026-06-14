import { Suspense, lazy, useEffect, useState } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const Hero = lazy(() => import('../components/Hero.jsx'));
const CollectionsSection = lazy(() => import('../components/CollectionsSection.jsx'));
const BestSellersSection = lazy(() => import('../components/BestSellersSection.jsx'));
const FeaturesSection = lazy(() => import('../components/FeaturesSection.jsx'));
const OurStorySection = lazy(() => import('../components/OurStorySection.jsx'));

const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));

function LazySection({ children, heightClass }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} />}>{children}</Suspense>;
}

const sectionRegistry = {
    hero: { height: 'h-[520px]', component: Hero },
    collections: { height: 'h-[560px]', component: CollectionsSection },
    'best-sellers': { height: 'h-[520px]', component: BestSellersSection },
    features: { height: 'h-[80px]', component: FeaturesSection },
    'our-story': { height: 'h-[580px]', component: OurStorySection },
    newsletter: { height: 'h-[220px]', component: NewsletterSection },
};

const defaultSectionOrder = [
    'hero',
    'collections',
    'best-sellers',
    'features',
    'our-story',
    'newsletter',
];

export default function HomePage() {
    const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
    const [bestSellersConfig, setBestSellersConfig] = useState({
        title: 'Best Sellers',
        position: 3,
    });

    function applyBestSellersPosition(order, position) {
        const next = Array.isArray(order) ? [...order] : [...defaultSectionOrder];
        const currentIndex = next.indexOf('best-sellers');
        if (currentIndex < 0) {
            return next;
        }

        next.splice(currentIndex, 1);
        const targetIndex = Math.max(0, Math.min(next.length, Number(position || 3) - 1));
        next.splice(targetIndex, 0, 'best-sellers');
        return next;
    }

    useEffect(() => {
        let ignore = false;

        async function loadBestSellersConfig() {
            try {
                const response = await fetch('/api/public/best-sellers-section', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (ignore || !payload) {
                    return;
                }

                const normalized = {
                    title: String(payload.title || 'Best Sellers').trim() || 'Best Sellers',
                    position: Math.max(1, Math.min(6, Number(payload.position) || 3)),
                };

                setBestSellersConfig(normalized);
                setSectionOrder((previous) => applyBestSellersPosition(previous, normalized.position));
            } catch {
                // Keep default config when endpoint is unavailable.
            }
        }

        loadBestSellersConfig();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        function handleBuilderLayoutMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data) {
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION') {
                const sectionKey = data.payload?.sectionKey;
                if (!sectionKey) {
                    return;
                }

                const target = document.getElementById(`section-${sectionKey}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_BEST_SELLERS_SECTION_CONFIG_UPDATE') {
                const payload = data.payload || {};
                const normalized = {
                    title: String(payload.title || 'Best Sellers').trim() || 'Best Sellers',
                    position: Math.max(1, Math.min(6, Number(payload.position) || 3)),
                };

                setBestSellersConfig(normalized);
                setSectionOrder((previous) => applyBestSellersPosition(previous, normalized.position));
                return;
            }

            if (data.type !== 'TIMLESS_PAGE_BUILDER_HOME_LAYOUT_UPDATE') {
                return;
            }

            const incomingOrder = Array.isArray(data.payload?.order) ? data.payload.order : null;
            if (!incomingOrder || incomingOrder.length === 0) {
                return;
            }

            const safeOrder = incomingOrder.filter((key) => Object.prototype.hasOwnProperty.call(sectionRegistry, key));
            if (safeOrder.length > 0) {
                setSectionOrder(safeOrder);
            }
        }

        window.addEventListener('message', handleBuilderLayoutMessage);
        return () => {
            window.removeEventListener('message', handleBuilderLayoutMessage);
        };
    }, []);

    return (
        <>
            {sectionOrder.map((sectionKey) => {
                const section = sectionRegistry[sectionKey];
                if (!section) {
                    return null;
                }

                const Component = section.component;
                return (
                    <div
                        key={sectionKey}
                        id={`section-${sectionKey}`}
                        data-section-key={sectionKey}
                        className="scroll-mt-24"
                    >
                        <LazySection heightClass={section.height}>
                            {sectionKey === 'best-sellers' ? (
                                <Component sectionTitle={bestSellersConfig.title} />
                            ) : (
                                <Component />
                            )}
                        </LazySection>
                    </div>
                );
            })}
        </>
    );
}