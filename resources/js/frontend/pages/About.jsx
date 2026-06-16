import { Suspense, lazy, useEffect } from 'react';

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
    useEffect(() => {
        function handleBuilderMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION') {
                return;
            }

            const sectionKey = data.payload?.sectionKey;
            if (!sectionKey) {
                return;
            }

            const target = document.getElementById(`section-${sectionKey}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        window.addEventListener('message', handleBuilderMessage);
        return () => window.removeEventListener('message', handleBuilderMessage);
    }, []);

    return (
        <div className="bg-white">
            <div id="section-hero">
                <LazySection heightClass="h-[520px]">
                    <AboutHeroSection />
                </LazySection>
            </div>

            <div id="section-1971-about">
                <LazySection heightClass="h-[520px]">
                    <About1971Section />
                </LazySection>
            </div>

            <div id="section-our-mission">
                <LazySection heightClass="h-[540px]">
                    <OurMission />
                </LazySection>
            </div>

            <div id="section-giving-back">
                <LazySection heightClass="h-[560px]">
                    <GivingBackSection />
                </LazySection>
            </div>

           
           
        </div>
    );
}