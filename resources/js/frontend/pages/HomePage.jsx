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
                            <Component />
                        </LazySection>
                    </div>
                );
            })}
        </>
    );
}