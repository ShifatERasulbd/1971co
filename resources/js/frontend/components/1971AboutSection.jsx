import { useEffect, useState } from 'react';

const defaultAboutStoryData = {
    background_image: '/uploads/heroes/images/hero1.webp',
    section_title: 'The Beginning',
    title: 'Why 1971?',
    description_html:
        '<p>"1971" carries deep historical significance representing independence, pride, and cultural identity. It signals that our brand is rooted in Bangladeshi legacy, not copying Western streetwear but redefining its own path.</p><p>The "Co" brings a fresh, youthful street vibe clean, approachable, and contemporary. Together, they represent our mission: heritage meets modern street culture.</p><p>At 1971Co, we believe streetwear is more than clothing. It\'s a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.</p>',
};

export default function About1971Section() {
    const [storyData, setStoryData] = useState(defaultAboutStoryData);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        let ignore = false;

        async function loadAboutStory() {
            try {
                const response = await fetch('/api/public/about-story', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload) {
                    setStoryData((previous) => ({
                        ...previous,
                        background_image: payload.background_image || previous.background_image,
                        section_title: payload.section_title || previous.section_title,
                        title: payload.title || previous.title,
                        description_html: payload.description_html ?? previous.description_html,
                    }));
                }
            } catch {
                // Keep the default story content when the public endpoint is unavailable.
            }
        }

        loadAboutStory();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data) {
                return;
            }

            if (data.type === 'TIMLESS_PAGE_BUILDER_1971_STORY_PREVIEW_UPDATE') {
                setPreviewOverride((previous) => ({
                    ...(previous || {}),
                    ...(data.payload || {}),
                }));
            }
        }

        window.addEventListener('message', handleBuilderPreviewMessage);
        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, []);

    const displayStoryData = previewOverride ? { ...storyData, ...previewOverride } : storyData;
    const storyImage = displayStoryData.background_image || defaultAboutStoryData.background_image;

    function handleSectionClick() {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_1971_STORY_SECTION_SELECTED',
                },
                window.location.origin
            );
        }
    }

    return (
        <section
            id="about-1971-story"
            className="bg-[#f5f5f5] py-14 sm:py-16 lg:py-24"
            onClick={handleSectionClick}
            role={isBuilderPreview ? 'button' : undefined}
            tabIndex={isBuilderPreview ? 0 : undefined}
        >
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                    <div className="px-1 sm:px-2 lg:px-0">
                        <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[#8b7355]">
                            {displayStoryData.section_title || 'The Beginning'}
                        </p>

                        <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.1] tracking-[0.02em] text-zinc-900">
                            {displayStoryData.title || 'Why 1971?'}
                        </h2>

                        <div
                            className="story-rich-text mt-8 space-y-5 text-[0.95rem] leading-[1.7] text-slate-700 sm:text-[1rem]"
                            dangerouslySetInnerHTML={{
                                __html: displayStoryData.description_html || defaultAboutStoryData.description_html,
                            }}
                        />
                    </div>

                    <div className="w-full">
                        <div className="h-[300px] w-full bg-black sm:h-[380px] lg:h-[560px]">
                            <img
                                src={storyImage}
                                alt="1971 story visual"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
