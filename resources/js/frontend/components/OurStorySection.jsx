import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const FALLBACK_STORY_DATA = {
    story_image: '/uploads/heroes/images/hero1.webp',
    story_logo: '',
    section_title: 'Our Story',
    title: 'Heritage, Refined.',
    description:
        '1971Co blends cultural identity with modern streetwear discipline - built to feel confident without shouting. Our pieces are designed for those who value restraint over noise, quality over quantity.',
    background_color: '#c8b89a',
    show_image: true,
    show_text: true,
};

function toAbsoluteImageUrl(path) {
    if (!path || typeof path !== 'string') return '';
    const trimmed = path.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `/${trimmed.replace(/^\/+/, '')}`;
}

export default function OurStorySection() {
    const [dbData, setDbData] = useState(null);
    const [previewOverride, setPreviewOverride] = useState(null);
    const sectionRef = useRef(null);
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });
    const isInView = useInView(sectionRef, { amount: 0.35, once: false });

    useEffect(() => {
        let ignore = false;

        async function loadOurStory() {
            try {
                const response = await fetch('/api/public/our-story', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload && typeof payload === 'object') {
                    setDbData(payload);
                }
            } catch {
                // Keep fallback content.
            }
        }

        loadOurStory();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!isBuilderPreview) {
            return;
        }

        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_OUR_STORY_PREVIEW_UPDATE') {
                return;
            }

            setPreviewOverride((previous) => ({
                ...(previous || {}),
                ...(data.payload || {}),
            }));
        }

        window.addEventListener('message', handleBuilderPreviewMessage);

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_REQUEST_OUR_STORY_PREVIEW',
                },
                window.location.origin,
            );
        }

        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, [isBuilderPreview]);

    const displayData = useMemo(() => {
        const base = dbData || FALLBACK_STORY_DATA;
        return previewOverride ? { ...base, ...previewOverride } : base;
    }, [dbData, previewOverride]);

    const showImage = Boolean(displayData.show_image);
    const showText = Boolean(displayData.show_text);
    const storyImage = toAbsoluteImageUrl(displayData.story_image || FALLBACK_STORY_DATA.story_image);
    const storyLogo = displayData.story_logo || '';

    const splitSectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.18,
                delayChildren: 0.08,
            },
        },
    };

    const leftPanelVariants = {
        hidden: { opacity: 0, x: -90 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 70, damping: 16, mass: 0.9 },
        },
    };

    const rightPanelVariants = {
        hidden: { opacity: 0, x: 90 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 70, damping: 16, mass: 0.9 },
        },
    };

    function handleSectionSelect(event) {
        if (!isBuilderPreview) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_OUR_STORY_SECTION_SELECTED',
                },
                window.location.origin,
            );
        }
    }

    const columnClass = showImage && showText ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

    return (
        <section className={`${timelessFontClass} w-full overflow-hidden`} onClick={handleSectionSelect}>
            <motion.div
                ref={sectionRef}
                className={`grid min-h-[580px] grid-cols-1 ${columnClass}`}
                variants={splitSectionVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                {showImage ? (
                    <motion.div className="relative min-h-[380px] overflow-hidden lg:min-h-0" variants={leftPanelVariants}>
                        <img
                            src={storyImage}
                            alt="1971Co - our story"
                            className="absolute inset-0 h-full w-full object-cover object-[40%_20%]"
                            loading="lazy"
                            onError={(event) => {
                                event.currentTarget.src = FALLBACK_STORY_DATA.story_image;
                            }}
                        />
                    </motion.div>
                ) : null}

                {showText ? (
                    <motion.div
                        className="flex items-center px-10 py-14 sm:px-14 lg:px-20 xl:px-28"
                        style={{ backgroundColor: displayData.background_color || '#c8b89a' }}
                        variants={rightPanelVariants}
                    >
                        <div className="max-w-[480px]">
                            {storyLogo ? (
                                <div className="mb-4">
                                    <img
                                        src={storyLogo}
                                        alt="Story logo"
                                        className="h-12 w-auto max-w-[220px] object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="mb-5 flex items-baseline gap-0.5 text-zinc-900">
                                    <span className="text-[2rem] font-black leading-none tracking-[-0.02em]">
                                        1971
                                    </span>
                                    <span className="text-[1.55rem] font-light leading-none tracking-[-0.01em]">
                                        Co.
                                    </span>
                                </div>
                            )}

                            <p className={`mb-3 ${sectionTypography.sectionMetaLink} font-semibold text-zinc-700`}>
                                {displayData.section_title || 'Our Story'}
                            </p>

                            <h2 className="text-[2.1rem] font-black uppercase leading-[0.95] tracking-[-0.01em] text-zinc-900 sm:text-[2.6rem] lg:text-[3rem]">
                                {displayData.title || 'Heritage, Refined.'}
                            </h2>

                            <p className={`mt-6 max-w-[380px] ${sectionTypography.description} text-zinc-800/80`}>
                                {displayData.description || FALLBACK_STORY_DATA.description}
                            </p>

                            <Link
                                to="/about"
                                className="mt-8 inline-flex items-center gap-2 text-[0.8rem] font-medium tracking-[0.04em] text-zinc-900 underline-offset-4 transition-opacity hover:opacity-60"
                                onClick={(event) => {
                                    if (isBuilderPreview) {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                About 1971Co
                            </Link>
                        </div>
                    </motion.div>
                ) : null}
            </motion.div>
        </section>
    );
}
