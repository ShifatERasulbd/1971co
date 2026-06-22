import { Suspense, lazy } from 'react';

import TogetherWeGrowHeroSection from '../components/TogetherWeGrowHeroSection';

const TogetherWeGrowFeaturesSection = lazy(() => import('../components/TogetherWeGrowFeaturesSection.jsx'));
const TogetherWeGrowCommunityCenterSection = lazy(() => import('../components/TogetherWeGrowCommunityCenterSection.jsx'));
const TogetherWeGrowGallerySection = lazy(() => import('../components/TogetherWeGrowGallerySection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));

function SectionFallback({ minHeight = 'min-h-[220px]' }) {
    return <div className={`${minHeight} animate-pulse bg-zinc-100`} aria-hidden="true" />;
}

export default function TogetherWeGrowPage() {
    return (
        <>
            <TogetherWeGrowHeroSection />
            <Suspense fallback={<SectionFallback minHeight="min-h-[320px]" />}>
                <TogetherWeGrowFeaturesSection />
            </Suspense>
            <Suspense fallback={<SectionFallback minHeight="min-h-[480px]" />}>
                <TogetherWeGrowCommunityCenterSection />
            </Suspense>
            <Suspense fallback={<SectionFallback minHeight="min-h-[420px]" />}>
                <TogetherWeGrowGallerySection />
            </Suspense>
            <Suspense fallback={<SectionFallback minHeight="min-h-[220px]" />}>
                <NewsletterSection />
            </Suspense>
        </>
    );
}