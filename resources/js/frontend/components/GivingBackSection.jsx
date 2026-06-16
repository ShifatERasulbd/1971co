import { useEffect, useState } from 'react';

const givingBackImage = '/uploads/heroes/images/hero1.webp';

const defaultGivingBackData = {
    image: givingBackImage,
    section_title: 'Giving Back',
    title: 'Roots Run Deep.',
    description:
        "Every 1971Co garment is crafted in Bangladesh-the birthplace of our heritage and the heart of our production. But our commitment goes beyond manufacturing.\n\nWe actively support community centers across Bangladesh, providing resources for education, skills training, and youth development programs. These centers serve as hubs for local communities, offering opportunities for growth and empowerment.\n\nWhen you wear 1971Co, you are not just wearing quality streetwear. You are supporting the communities that make our vision possible. Every purchase contributes to building stronger, more vibrant communities back home.",
    points: ['Education Programs', 'Skills Training', 'Youth Development'],
};

export default function GivingBackSection() {
    const [givingBackData, setGivingBackData] = useState(defaultGivingBackData);
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

        async function loadGivingBack() {
            try {
                const response = await fetch('/api/public/about-giving-back', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload) {
                    setGivingBackData((previous) => ({
                        ...previous,
                        image: payload.image || previous.image,
                        section_title: payload.section_title || previous.section_title,
                        title: payload.title || previous.title,
                        description: payload.description ?? previous.description,
                        points: Array.isArray(payload.points) && payload.points.length > 0
                            ? payload.points
                            : previous.points,
                    }));
                }
            } catch {
                // Keep defaults when endpoint is unavailable.
            }
        }

        loadGivingBack();

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

            if (data.type === 'TIMLESS_PAGE_BUILDER_GIVING_BACK_PREVIEW_UPDATE') {
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

    function handleSectionClick() {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_GIVING_BACK_SECTION_SELECTED',
                },
                window.location.origin
            );
        }
    }

    const displayData = previewOverride ? { ...givingBackData, ...previewOverride } : givingBackData;
    const descriptionParagraphs = String(displayData.description || '')
        .split(/\n\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0);

    return (
        <section
            className="bg-white py-14 sm:py-16 lg:py-24"
            onClick={handleSectionClick}
            role={isBuilderPreview ? 'button' : undefined}
            tabIndex={isBuilderPreview ? 0 : undefined}
        >
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                    <div className="flex justify-center">
                        <div className="bg-[#e8e8e8] p-4 sm:p-6 lg:p-8">
                            <img
                                src={displayData.image || givingBackImage}
                                alt="1971Co. community giving back initiative"
                                className="h-[400px] w-full object-cover object-center sm:h-[480px] lg:h-[560px]"
                            />
                        </div>
                    </div>

                    <div className="px-1 sm:px-2 lg:px-0">
                        <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[#8b7355]">
                            {displayData.section_title || defaultGivingBackData.section_title}
                        </p>

                        <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.1] tracking-[0.02em] text-zinc-900">
                            {displayData.title || defaultGivingBackData.title}
                        </h2>

                        <div className="mt-8 space-y-5 text-[0.95rem] leading-[1.7] text-slate-700 sm:text-[1rem]">
                            {descriptionParagraphs.map((paragraph, index) => (
                                <p key={`${paragraph.slice(0, 24)}-${index}`}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="mt-8 space-y-3 text-[0.95rem] font-medium text-zinc-900">
                            {(Array.isArray(displayData.points) ? displayData.points : []).map((point, index) => (
                                <div key={`${String(point || '').slice(0, 24)}-${index}`} className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-900" />
                                    <span>{point || `Point ${index + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
