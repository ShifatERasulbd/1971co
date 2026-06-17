import { useEffect, useMemo, useRef, useState } from 'react';

import { timelessFontClass } from '../utils/typography';
import {
    resolveHeroFontFamily,
    resolveHeroFontSize,
} from '../../utils/heroTypography';
import { sectionTypography } from '../utils/sectionTypography';

function splitHeroTitle(value, mode = 'double') {
    const title = String(value || '').trim();

    if (!title) {
        return [];
    }

    if (mode === 'single') {
        return [title];
    }

    const words = title.split(/\s+/);

    if (words.length <= 2) {
        return [title];
    }

    const middle = Math.ceil(words.length / 2);
    return [words.slice(0, middle).join(' '), words.slice(middle).join(' ')];
}

export default function Hero() {
    const [heroData, setHeroData] = useState(null);
    const [heroSlides, setHeroSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });
    const dragStateRef = useRef(null);

    const partOffsetFields = {
        title: ['title_offset_x', 'title_offset_y'],
        description: ['description_offset_x', 'description_offset_y'],
        button: ['button_offset_x', 'button_offset_y'],
    };

    useEffect(() => {
        let ignore = false;

        async function loadHero() {
            try {
                setIsLoading(true);
                const slidesResponse = await fetch('/api/public/heroes', {
                    headers: { Accept: 'application/json' },
                });

                if (slidesResponse.ok) {
                    const slidesPayload = await slidesResponse.json();
                    if (!ignore && Array.isArray(slidesPayload) && slidesPayload.length > 0) {
                        setHeroSlides(slidesPayload);
                        setHeroData(slidesPayload[0]);
                        setIsLoading(false);
                        return;
                    }
                }

                const response = await fetch('/api/public/hero', {
                    headers: { Accept: 'application/json' },
                });

                if (response.ok) {
                    const payload = await response.json();
                    if (!ignore && payload) {
                        setHeroData(payload);
                    }
                }
            } catch {
                // Handled gracefully: UI remains in skeleton or minimal fallback state if fetch fails entirely
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadHero();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (heroSlides.length === 0) {
            return;
        }

        setCurrentSlide((previous) => {
            if (previous >= heroSlides.length) {
                return 0;
            }
            return previous;
        });
    }, [heroSlides]);

    useEffect(() => {
        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data) {
                return;
            }

            if (data.type !== 'TIMLESS_PAGE_BUILDER_HERO_PREVIEW_UPDATE') {
                return;
            }

            setPreviewOverride((previous) => ({
                ...(previous || {}),
                ...(data.payload || {}),
            }));
        }

        window.addEventListener('message', handleBuilderPreviewMessage);
        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, []);

    const activeHero = heroSlides.length > 0 ? heroSlides[currentSlide] : heroData;
    const displayHeroData = previewOverride ? { ...activeHero, ...previewOverride } : activeHero;
    const slidesCount = heroSlides.length > 0 ? heroSlides.length : 1;

    const titleLines = useMemo(
        () => splitHeroTitle(displayHeroData?.title, displayHeroData?.title_display_mode || 'double'),
        [displayHeroData?.title, displayHeroData?.title_display_mode]
    );
    const heroImage = displayHeroData?.image_url || '';
    const [isVideoFallback, setIsVideoFallback] = useState(false);
    const heroVideo = displayHeroData?.video_url || null;
    const titleSize = resolveHeroFontSize(displayHeroData?.title_font_size, 124);
    const descriptionSize = resolveHeroFontSize(displayHeroData?.description_font_size, 24);
    const titleFamily = resolveHeroFontFamily(displayHeroData?.title_font_family, 'instrument-sans');
    const descriptionFamily = resolveHeroFontFamily(
        displayHeroData?.description_font_family,
        'instrument-sans'
    );
    const displayTitleSize = Math.max(52, Math.round(titleSize * 0.58));
    const displayDescriptionSize = Math.max(16, Math.round(descriptionSize * 0.72));
    const textOffsetX = Number(displayHeroData?.text_offset_x) || 0;
    const textOffsetY = Number(displayHeroData?.text_offset_y) || 0;
    const titleOffsetX = Number(displayHeroData?.title_offset_x) || 0;
    const titleOffsetY = Number(displayHeroData?.title_offset_y) || 0;
    const descriptionOffsetX = Number(displayHeroData?.description_offset_x) || 0;
    const descriptionOffsetY = Number(displayHeroData?.description_offset_y) || 0;
    const buttonOffsetX = Number(displayHeroData?.button_offset_x) || 0;
    const buttonOffsetY = Number(displayHeroData?.button_offset_y) || 0;

    useEffect(() => {
        setIsVideoFallback(false);
    }, [heroVideo]);

    function beginPartDrag(part, event) {
        if (!isBuilderPreview || isLoading) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_HERO_PART_SELECTED',
                    payload: { part },
                },
                window.location.origin
            );
        }

        event.preventDefault();
        event.stopPropagation();

        const [xField, yField] = partOffsetFields[part] || [];
        dragStateRef.current = {
            part,
            xField,
            yField,
            startX: event.clientX,
            startY: event.clientY,
            baseOffsetX: Number(displayHeroData?.[xField]) || 0,
            baseOffsetY: Number(displayHeroData?.[yField]) || 0,
        };
    }

    useEffect(() => {
        if (!isBuilderPreview) {
            return undefined;
        }

        function handleMouseMove(event) {
            if (!dragStateRef.current) {
                return;
            }

            const drag = dragStateRef.current;
            const width = Math.max(window.innerWidth, 1);
            const height = Math.max(window.innerHeight, 1);
            const deltaXPercent = ((event.clientX - drag.startX) / width) * 100;
            const deltaYPercent = ((event.clientY - drag.startY) / height) * 100;
            const nextOffsetX = Math.max(-55, Math.min(55, drag.baseOffsetX + deltaXPercent));
            const nextOffsetY = Math.max(-55, Math.min(55, drag.baseOffsetY + deltaYPercent));

            if (!drag.xField || !drag.yField) {
                return;
            }

            setPreviewOverride((previous) => ({
                ...(previous || {}),
                [drag.xField]: nextOffsetX,
                [drag.yField]: nextOffsetY,
            }));

            if (window.parent && window.parent !== window) {
                window.parent.postMessage(
                    {
                        type: 'TIMLESS_PAGE_BUILDER_HERO_POSITION_CHANGED',
                        payload: {
                            [drag.xField]: nextOffsetX,
                            [drag.yField]: nextOffsetY,
                            part: drag.part,
                        },
                    },
                    window.location.origin
                );
            }
        }

        function handlePointerUp() {
            dragStateRef.current = null;
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handlePointerUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handlePointerUp);
        };
    }, [isBuilderPreview]);

    const renderBackground = useMemo(() => {
        if (isLoading) {
            return <div className="absolute inset-0 -z-30 h-full w-full bg-neutral-900 animate-pulse" />;
        }
        if (heroVideo && !isVideoFallback) {
            return (
                <video
                    key={heroVideo}
                    poster={heroImage}
                    className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onError={() => setIsVideoFallback(true)}
                >
                    <source src={heroVideo} type="video/mp4" />
                </video>
            );
        }
        return (
            <img
                src={heroImage}
                alt="Timeless custom apparel hero"
                className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
            />
        );
    }, [heroVideo, isVideoFallback, heroImage, isLoading]);

    return (
        <section className={`${timelessFontClass} hero-section relative isolate min-h-[calc(100vh-90px)] overflow-hidden text-white`}>
            {renderBackground}

            <div className="hero-grid-overlay absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(18,18,18,0.48)_0%,rgba(18,18,18,0.48)_33.2%,rgba(16,16,16,0.3)_33.2%,rgba(16,16,16,0.3)_66.6%,rgba(18,18,18,0.48)_66.6%,rgba(18,18,18,0.48)_100%)]" />
            <div className="hero-column-line absolute inset-y-0 left-1/3 -z-10 w-px bg-white/18" />
            <div className="hero-column-line absolute inset-y-0 left-2/3 -z-10 w-px bg-white/18" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.07),rgba(0,0,0,0.56)_48%,rgba(0,0,0,0.82)_100%)]" />

            <div className="hero-shell mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-[1920px] items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                <div
                    className={`hero-content relative mx-auto flex w-full max-w-[760px] flex-col items-center space-y-6 text-center ${
                        isBuilderPreview && !isLoading ? 'rounded-md border border-dashed border-white/55 p-3' : ''
                    }`}
                    style={{ transform: `translate(${textOffsetX}%, ${textOffsetY}%)` }}
                >
                    {isLoading ? (
                        <>
                            {/* Title Skeleton */}
                            <div className="w-full flex flex-col items-center space-y-3 animate-pulse">
                                <div className="h-12 w-4/5 rounded bg-white/20 sm:h-16 lg:h-20" />
                                <div className="h-12 w-3/5 rounded bg-white/20 sm:h-16 lg:h-20" />
                            </div>

                            {/* Description Skeleton */}
                            <div className="w-full flex flex-col items-center space-y-2 pt-2 animate-pulse">
                                <div className="h-4 w-11/12 rounded bg-white/15" />
                                <div className="h-4 w-9/12 rounded bg-white/15" />
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row animate-pulse">
                                <div className="h-12 w-36 rounded-md bg-white/20" />
                                <div className="h-12 w-40 rounded-md bg-white/10" />
                            </div>
                        </>
                    ) : (
                        <>
                            <h1
                                className={`hero-title ${sectionTypography.heroTitle} text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
                                    isBuilderPreview ? 'cursor-move rounded border border-dashed border-white/45 px-2' : ''
                                }`}
                                style={{
                                    fontFamily: titleFamily,
                                    fontSize: `clamp(2.4rem, 7.1vw, ${displayTitleSize}px)`,
                                    transform: `translate(${titleOffsetX}%, ${titleOffsetY}%)`,
                                }}
                                onMouseDown={(event) => beginPartDrag('title', event)}
                            >
                                {titleLines.map((line, index) => (
                                    <span key={`${line}-${index}`} className="block">
                                        {line}
                                    </span>
                                ))}
                            </h1>

                            <p
                                className={`hero-description ${sectionTypography.heroDescription} text-white/90 ${
                                    isBuilderPreview ? 'cursor-move rounded border border-dashed border-white/45 px-2' : ''
                                }`}
                                style={{
                                    fontFamily: descriptionFamily,
                                    fontSize: `clamp(0.95rem, 1.35vw, ${displayDescriptionSize}px)`,
                                    transform: `translate(${descriptionOffsetX}%, ${descriptionOffsetY}%)`,
                                }}
                                onMouseDown={(event) => beginPartDrag('description', event)}
                            >
                                {displayHeroData?.description}
                            </p>

                            {Boolean(displayHeroData?.button_enabled ?? true) ? (
                                <div
                                    className="hero-actions flex flex-col items-center gap-3 sm:flex-row"
                                    style={{ transform: `translate(${buttonOffsetX}%, ${buttonOffsetY}%)` }}
                                    onMouseDown={(event) => beginPartDrag('button', event)}
                                >
                                    <a
                                        href={displayHeroData?.button_url || '/shop'}
                                        className={sectionTypography.heroPrimaryButton}
                                        onClick={(event) => {
                                            if (isBuilderPreview) {
                                                event.preventDefault();
                                            }
                                        }}
                                    >
                                        Shop now
                                    </a>
                                    <a
                                        href="/shop"
                                        className={sectionTypography.heroSecondaryButton}
                                        onClick={(event) => {
                                            if (isBuilderPreview) {
                                                event.preventDefault();
                                            }
                                        }}
                                    >
                                        Shop essentials
                                    </a>
                                </div>
                            ) : null}

                            {slidesCount > 1 ? (
                                <div className="pointer-events-none flex justify-center pt-1">
                                    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-sm">
                                        {Array.from({ length: slidesCount }).map((_, index) => (
                                            <button
                                                key={`hero-dot-${index}`}
                                                type="button"
                                                aria-label={`Go to slide ${index + 1}`}
                                                className={`size-2 rounded-full ${
                                                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                                                }`}
                                                onClick={() => goToSlide(index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}