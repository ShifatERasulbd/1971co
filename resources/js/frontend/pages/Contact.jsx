import { Suspense, lazy, useEffect, useRef, useState } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const ContactHeroSection = lazy(() => import('../components/ContactHeroSection.jsx'));

const ContactSection = lazy(() => import('../components/ContactSection.jsx'));
const ContactLocationMapSection = lazy(() => import('../components/ContactLocationMapSection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

function LazySection({ children, heightClass, className, variant = 'generic', defer = true }) {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(() => !defer);

    useEffect(() => {
        if (!defer) {
            setIsVisible(true);
            return;
        }

        if (isVisible) {
            return;
        }

        const node = containerRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '220px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [defer, isVisible]);

    return (
        <div ref={containerRef}>
            {isVisible ? (
                <Suspense fallback={<SectionSkeleton heightClass={heightClass} className={className} variant={variant} />}>
                    {children}
                </Suspense>
            ) : (
                <SectionSkeleton heightClass={heightClass} className={className} variant={variant} />
            )}
        </div>
    );
}

export default function ContactPage() {
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    return (
        <>
            <LazySection heightClass="h-[520px]" variant="hero" defer={false}>
                <ContactHeroSection />
            </LazySection>
           
            <LazySection heightClass="h-[760px]" variant="form" defer={!isBuilderPreview}>
                <ContactSection />
            </LazySection>
            <LazySection heightClass="h-[520px]" className="px-0" variant="map" defer={!isBuilderPreview}>
                <ContactLocationMapSection />
            </LazySection>
            <LazySection heightClass="h-[220px]" variant="newsletter" defer={!isBuilderPreview}>
                <NewsletterSection />
            </LazySection>
            <LazySection heightClass="h-[320px]" variant="instagram" defer={!isBuilderPreview}>
                <InstagramSection />
            </LazySection>
        </>
    );
}