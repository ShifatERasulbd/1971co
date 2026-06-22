import { Suspense, lazy, useEffect, useMemo, useState } from 'react';

import TogetherWeGrowHeroSection from '../components/TogetherWeGrowHeroSection';

const TogetherWeGrowFeaturesSection = lazy(() => import('../components/TogetherWeGrowFeaturesSection.jsx'));
const TogetherWeGrowCommunityCenterSection = lazy(() => import('../components/TogetherWeGrowCommunityCenterSection.jsx'));
const TogetherWeGrowGallerySection = lazy(() => import('../components/TogetherWeGrowGallerySection.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));

function SectionFallback({ minHeight = 'min-h-[220px]' }) {
    return <div className={`${minHeight} animate-pulse bg-zinc-100`} aria-hidden="true" />;
}

const KNOWN_SECTION_KEYS = ['hero', 'features', 'community-center', 'gallery', 'newsletter'];

export default function TogetherWeGrowPage() {
    const [sectionOrder, setSectionOrder] = useState(KNOWN_SECTION_KEYS);
    const [isBuilderPreview, setIsBuilderPreview] = useState(false);
    const [sectionsData, setSectionsData] = useState({});

    // Fetch community page sections from API
    useEffect(() => {
        fetch('/api/community-page-sections', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch community sections');
                }
                return response.json();
            })
            .then((data) => {
                // Convert snake_case to camelCase for button_text and button_url
                const sectionsMap = {};
                Array.isArray(data) ? data : Object.values(data || {}).forEach((section) => {
                    sectionsMap[section.key] = {
                        ...section,
                        buttonText: section.button_text || section.buttonText,
                        buttonUrl: section.button_url || section.buttonUrl,
                    };
                });
                setSectionsData(sectionsMap);
            })
            .catch((error) => {
                console.error('Error fetching community sections:', error);
            });
    }, []);

    useEffect(() => {
        function handleBuilderMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data || typeof data !== 'object') {
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_PREVIEW_MODE') {
                setIsBuilderPreview(Boolean(data?.payload?.enabled));
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_TOGETHER_LAYOUT_UPDATE') {
                const nextOrder = Array.isArray(data?.payload?.order)
                    ? data.payload.order.filter((key) => KNOWN_SECTION_KEYS.includes(key))
                    : [];

                if (nextOrder.length > 0) {
                    setSectionOrder(nextOrder);
                }
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_SCROLL_TO_SECTION') {
                const sectionKey = String(data?.payload?.sectionKey || '');
                if (!sectionKey) {
                    return;
                }

                const target = document.querySelector(`[data-together-section="${sectionKey}"]`);
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }

        window.addEventListener('message', handleBuilderMessage);

        return () => {
            window.removeEventListener('message', handleBuilderMessage);
        };
    }, []);

    const sectionNodes = useMemo(
        () => ({
            hero: <TogetherWeGrowHeroSection sectionData={sectionsData.hero} />,
            features: (
                <Suspense fallback={<SectionFallback minHeight="min-h-[320px]" />}>
                    <TogetherWeGrowFeaturesSection sectionData={sectionsData.features} />
                </Suspense>
            ),
            'community-center': (
                <Suspense fallback={<SectionFallback minHeight="min-h-[480px]" />}>
                    <TogetherWeGrowCommunityCenterSection sectionData={sectionsData['community-center']} />
                </Suspense>
            ),
            gallery: (
                <Suspense fallback={<SectionFallback minHeight="min-h-[420px]" />}>
                    <TogetherWeGrowGallerySection sectionData={sectionsData.gallery} />
                </Suspense>
            ),
            newsletter: (
                <Suspense fallback={<SectionFallback minHeight="min-h-[220px]" />}>
                    <NewsletterSection sectionData={sectionsData.newsletter} />
                </Suspense>
            ),
        }),
        [sectionsData],
    );

    function handleSectionSelect(sectionKey, event) {
        if (!isBuilderPreview) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_TOGETHER_SECTION_SELECTED',
                    payload: { sectionKey },
                },
                window.location.origin,
            );
        }
    }

    return (
        <>
            {sectionOrder.map((sectionKey) => (
                <div
                    key={sectionKey}
                    data-together-section={sectionKey}
                    onClick={(event) => handleSectionSelect(sectionKey, event)}
                >
                    {sectionNodes[sectionKey] || null}
                </div>
            ))}
        </>
    );
}