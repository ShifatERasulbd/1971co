import { useEffect, useState } from 'react';

const defaultAboutHeroData = {
    background_image: '/uploads/heroes/images/hero1.webp',
    section_title: 'Our Story',
    title: 'Heritage. Culture. Style.',
    description: 'Redefining streetwear through bold design and authentic self-expression.',
};

export default function AboutHeroSection() {
    const [heroData, setHeroData] = useState(defaultAboutHeroData);
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

        async function loadAboutHero() {
            try {
                const response = await fetch('/api/public/about-hero', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload) {
                    setHeroData((previous) => ({
                        ...previous,
                        background_image: payload.background_image || previous.background_image,
                        section_title: payload.section_title || previous.section_title,
                        title: payload.title || previous.title,
                        description: payload.description ?? previous.description,
                    }));
                }
            } catch {
                // Keep the default About hero when the public endpoint is unavailable.
            }
        }

        loadAboutHero();

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

            if (data.type === 'TIMLESS_PAGE_BUILDER_ABOUT_HERO_PREVIEW_UPDATE') {
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

    const displayHeroData = previewOverride ? { ...heroData, ...previewOverride } : heroData;
    const backgroundImage = displayHeroData.background_image || defaultAboutHeroData.background_image;

    function handleHeroClick() {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_ABOUT_HERO_SECTION_SELECTED',
                },
                window.location.origin
            );
        }
    }

    return (
        <section
            className="relative isolate overflow-hidden bg-zinc-950 text-white"
            onClick={handleHeroClick}
            role={isBuilderPreview ? 'button' : undefined}
            tabIndex={isBuilderPreview ? 0 : undefined}
        >
            <img
                src={backgroundImage}
                alt="About hero background"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />

            <div className="mx-auto flex min-h-[320px] w-full max-w-[1920px] items-end justify-start px-6 py-10 sm:min-h-[420px] sm:px-8 sm:py-12 lg:min-h-[540px] lg:px-12 lg:py-14">
                <div className="max-w-[920px] text-left">
                    <p className="font-monstrate mb-5 text-[0.72rem] uppercase tracking-[0.26em] text-blackhite sm:text-[0.78rem]">
                        {displayHeroData.section_title || 'Our Story'}
                    </p>

                    <h1 className="font-monstrate text-[clamp(2.8rem,8vw,6.8rem)] uppercase leading-[0.92] tracking-[0.04em] text-black">
                        {displayHeroData.title || defaultAboutHeroData.title}
                    </h1>

                    <p className="font-monstrate mt-6 max-w-[600px] text-[0.95rem] leading-[1.6] text-blackhite sm:text-[1.02rem]">
                        {displayHeroData.description || defaultAboutHeroData.description}
                    </p>
                </div>
            </div>
        </section>
    );
}
