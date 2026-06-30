import { useEffect, useState } from 'react';

const missionBackground = '/uploads/heroes/images/hero1.webp';

const defaultMissionData = {
    background_image: missionBackground,
    title: 'Our Mission',
    description:
        'Our mission is to make personalized fashion accessible, premium, and expressive. We aim to deliver apparel that combines comfort, durability, and modern design while giving customers the freedom to create styles that represent their identity.',
    items: [
        { icon: 'BadgeCheck', title: 'Premium-Quality' },
        { icon: 'SlidersHorizontal', title: 'Creative Customization' },
        { icon: 'Gift', title: 'Long-Term Partnerships' },
        { icon: 'Handshake', title: 'Modern Fashion Designed' },
    ],
};

export default function OurMission() {
    const [missionData, setMissionData] = useState(defaultMissionData);
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

        async function loadAboutMission() {
            try {
                const response = await fetch('/api/public/about-mission', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload) {
                    setMissionData((previous) => ({
                        ...previous,
                        background_image: payload.background_image || previous.background_image,
                        title: payload.title || previous.title,
                        description: payload.description ?? previous.description,
                        items: Array.isArray(payload.items) && payload.items.length > 0
                            ? payload.items
                            : previous.items,
                    }));
                }
            } catch {
                // Keep default mission content when endpoint is unavailable.
            }
        }

        loadAboutMission();

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

            if (data.type === 'TIMLESS_PAGE_BUILDER_OUR_MISSION_PREVIEW_UPDATE') {
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

    const displayMissionData = previewOverride ? { ...missionData, ...previewOverride } : missionData;
    const displayBackgroundImage = displayMissionData.background_image || missionBackground;

    function handleSectionClick() {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_OUR_MISSION_SECTION_SELECTED',
                },
                window.location.origin
            );
        }
    }

    return (
        <section
            className="py-14 sm:py-16 lg:py-20"
            onClick={handleSectionClick}
            role={isBuilderPreview ? 'button' : undefined}
            tabIndex={isBuilderPreview ? 0 : undefined}
        >
            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                    <div>
                        <h2 className="font-serif text-[clamp(2rem,4.3vw,3.2rem)] uppercase tracking-[0.06em] text-zinc-900">
                            {displayMissionData.title || defaultMissionData.title}
                        </h2>

                        <p className="mt-4 max-w-[65ch] text-[1.08rem] leading-[1.85] text-zinc-700 sm:text-[1.15rem]">
                            {displayMissionData.description || defaultMissionData.description}
                        </p>
                    </div>

                    <div>
                        <div className="overflow-hidden rounded-none border border-zinc-200 shadow-[0_24px_60px_rgba(0,0,0,0.20)]">
                            <img
                                src={displayBackgroundImage}
                                alt="Timeless mission"
                                className="h-[320px] w-full object-cover object-center sm:h-[420px] lg:h-[460px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
