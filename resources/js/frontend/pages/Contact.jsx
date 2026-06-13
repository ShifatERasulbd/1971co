import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const ContactHeroSection = lazy(() => import('../components/ContactHeroSection.jsx'));

const ContactSection = lazy(() => import('../components/ContactSection.jsx'));
const ContactLocationMapSection = lazy(() => import('../components/ContactLocationMapSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass, className }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} className={className} />}>{children}</Suspense>;
}

export default function ContactPage() {
    return (
        <>
            <LazySection heightClass="h-[520px]">
                <ContactHeroSection />
            </LazySection>
           
            <LazySection heightClass="h-[760px]">
                <ContactSection />
            </LazySection>
            <LazySection heightClass="h-[520px]" className="px-0">
                <ContactLocationMapSection />
            </LazySection>
            <LazySection heightClass="h-[220px]">
                <NewsletterSection />
            </LazySection>
            <LazySection heightClass="h-[320px]">
                <InstagramSection />
            </LazySection>
        </>
    );
}