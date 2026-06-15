import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const AboutHeroSection = lazy(() => import('../components/AboutHeroSection.jsx'));

const About1971Section = lazy(() => import('../components/1971AboutSection.jsx'));
const OurMission = lazy(() => import('../components/OurMission.jsx'));
const GivingBackSection = lazy(() => import('../components/GivingBackSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} />}>{children}</Suspense>;
}
export default function AboutPage() {
    return (
        <div className="bg-white">
            <LazySection heightClass="h-[520px]">
                <AboutHeroSection />
            </LazySection>
            
            <LazySection heightClass="h-[520px]">
                <About1971Section />
            </LazySection>
            
            <LazySection heightClass="h-[540px]">
                <OurMission />
            </LazySection>
            <LazySection heightClass="h-[560px]">
                <GivingBackSection />
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