import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { timelessFontClass } from '../utils/typography';

const DEFAULT_BACKGROUND_IMAGE = '/uploads/heroes/images/hero1.webp';
const DEFAULT_ITEM = {
    image: DEFAULT_BACKGROUND_IMAGE,
    title: 'Built For Everyday Confidence',
    description:
        'Elevated essentials with clean cuts, durable fabrics, and a refined streetwear silhouette.',
    button_text: 'Explore The Drop',
    button_url: '/shop',
    show_button: true,
};

export default function HomeBackgroundImageSection() {
    const [dbData, setDbData] = useState(null);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [pendingSlideIndex, setPendingSlideIndex] = useState(null);
    const [turnDirection, setTurnDirection] = useState('next');
    const [isTurning, setIsTurning] = useState(false);
    const [isSectionActiveInView, setIsSectionActiveInView] = useState(false);
    const [isDesktopViewport, setIsDesktopViewport] = useState(false);
    const lastWheelTimeRef = useRef(0);
    const turnTimeoutRef = useRef(null);
    const sectionRef = useRef(null);
    const touchStartYRef = useRef(null);
    const touchMoveYRef = useRef(null);
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        let ignore = false;

        async function loadSection() {
            try {
                const response = await fetch('/api/public/home-background-section', {
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
                // Keep fallback image.
            }
        }

        loadSection();

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
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_HOME_BACKGROUND_PREVIEW_UPDATE') {
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
                    type: 'TIMLESS_PAGE_BUILDER_REQUEST_HOME_BACKGROUND_PREVIEW',
                },
                window.location.origin
            );
        }

        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, [isBuilderPreview]);

    const displayData = useMemo(() => {
        const base = dbData || { items: [DEFAULT_ITEM] };
        if (!previewOverride) {
            return base;
        }
        return { ...base, ...previewOverride };
    }, [dbData, previewOverride]);

    const slides = useMemo(() => {
        const incoming = Array.isArray(displayData.items) ? displayData.items : [];
        if (incoming.length === 0) {
            return [DEFAULT_ITEM];
        }

        return incoming.map((item) => ({
            image: item.image || item.background_image || DEFAULT_BACKGROUND_IMAGE,
            label: item.label || 'New Season',
            title: item.title || DEFAULT_ITEM.title,
            description: item.description || DEFAULT_ITEM.description,
            button_text: item.button_text || DEFAULT_ITEM.button_text,
            button_url: item.button_url || DEFAULT_ITEM.button_url,
            show_button:
                typeof item.show_button === 'boolean' ? item.show_button : DEFAULT_ITEM.show_button,
        }));
    }, [displayData.items]);

    useEffect(() => {
        setActiveSlideIndex(0);
    }, [slides.length]);

    useEffect(() => {
        return () => {
            if (turnTimeoutRef.current) {
                window.clearTimeout(turnTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        function updateDesktopViewport() {
            setIsDesktopViewport(window.innerWidth >= 1024);
        }

        updateDesktopViewport();
        window.addEventListener('resize', updateDesktopViewport);

        return () => {
            window.removeEventListener('resize', updateDesktopViewport);
        };
    }, []);

    useEffect(() => {
        function updateInViewState() {
            const node = sectionRef.current;
            if (!node) {
                setIsSectionActiveInView(false);
                return;
            }

            const rect = node.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 0;
            const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
            const sectionHeight = Math.max(rect.height, 1);
            const visibleRatio = visibleHeight / sectionHeight;

            // Consider the section active once most of it is in view.
            setIsSectionActiveInView(visibleRatio >= 0.72);
        }

        updateInViewState();
        window.addEventListener('scroll', updateInViewState, { passive: true });
        window.addEventListener('resize', updateInViewState);

        return () => {
            window.removeEventListener('scroll', updateInViewState);
            window.removeEventListener('resize', updateInViewState);
        };
    }, []);

    function triggerTurn(direction) {
        if (slides.length <= 1 || isTurning) {
            return;
        }

        const maxIndex = slides.length - 1;
        const nextIndex = direction === 'next' ? activeSlideIndex + 1 : activeSlideIndex - 1;

        if (nextIndex < 0 || nextIndex > maxIndex) {
            return;
        }

        setTurnDirection(direction);
        setPendingSlideIndex(nextIndex);
        setIsTurning(true);

        turnTimeoutRef.current = window.setTimeout(() => {
            setActiveSlideIndex(nextIndex);
            setPendingSlideIndex(null);
            setIsTurning(false);
        }, 720);
    }

    function canTurnInDirection(direction) {
        const isAtFirstSlide = activeSlideIndex === 0;
        const isAtLastSlide = activeSlideIndex === slides.length - 1;

        if (direction === 'next' && isAtLastSlide) {
            return false;
        }

        if (direction === 'prev' && isAtFirstSlide) {
            return false;
        }

        return true;
    }

    function handleWheelTurn(event) {
        const shouldCaptureWheel = isDesktopViewport && isSectionActiveInView && !isBuilderPreview;

        if (!shouldCaptureWheel || slides.length <= 1) {
            return;
        }

        const now = Date.now();
        if (now - lastWheelTimeRef.current < 520) {
            return;
        }

        if (Math.abs(event.deltaY) < 14) {
            return;
        }

        const direction = event.deltaY > 0 ? 'next' : 'prev';
        if (!canTurnInDirection(direction)) {
            return;
        }

        event.preventDefault();
        lastWheelTimeRef.current = now;
        triggerTurn(direction);
    }

    function handleTouchStart(event) {
        if (slides.length <= 1 || isBuilderPreview) {
            return;
        }

        const touch = event.touches?.[0];
        if (!touch) {
            return;
        }

        touchStartYRef.current = touch.clientY;
        touchMoveYRef.current = touch.clientY;
    }

    function handleTouchMove(event) {
        const touch = event.touches?.[0];
        if (!touch || touchStartYRef.current === null) {
            return;
        }

        touchMoveYRef.current = touch.clientY;
        const delta = touchStartYRef.current - touch.clientY;
        const direction = delta > 0 ? 'next' : 'prev';

        if (Math.abs(delta) > 12 && canTurnInDirection(direction)) {
            event.preventDefault();
        }
    }

    function handleTouchEnd() {
        if (touchStartYRef.current === null || touchMoveYRef.current === null || isTurning) {
            touchStartYRef.current = null;
            touchMoveYRef.current = null;
            return;
        }

        const delta = touchStartYRef.current - touchMoveYRef.current;
        const threshold = 40;

        if (Math.abs(delta) < threshold) {
            touchStartYRef.current = null;
            touchMoveYRef.current = null;
            return;
        }

        const direction = delta > 0 ? 'next' : 'prev';
        if (canTurnInDirection(direction)) {
            triggerTurn(direction);
        }

        touchStartYRef.current = null;
        touchMoveYRef.current = null;
    }

    const activeSlide = slides[activeSlideIndex] || slides[0] || DEFAULT_ITEM;
    const pendingSlide =
        Number.isInteger(pendingSlideIndex) && pendingSlideIndex >= 0
            ? slides[pendingSlideIndex]
            : null;

    function handleSectionSelect(event) {
        if (!isBuilderPreview) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_HOME_BACKGROUND_SECTION_SELECTED',
                },
                window.location.origin
            );
        }
    }

    return (
        <section
            ref={sectionRef}
            className={`${timelessFontClass} relative isolate overflow-hidden bg-white`}
            onClick={handleSectionSelect}
            onWheel={handleWheelTurn}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative">
                <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-[#d8e4f5] blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-[#dce7f8] blur-3xl" />

                <div className="relative z-10 mx-auto grid min-h-[560px] w-full max-w-[1700px] gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[700px] lg:grid-cols-[minmax(0,1fr)_minmax(560px,760px)] lg:items-center lg:gap-10 lg:px-14 lg:py-16">
                    <div className="max-w-[620px] lg:pr-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                            {activeSlide.label || 'New Season'}
                        </p>
                        <h2 className="mt-3 text-[2rem] font-black uppercase leading-[0.9] tracking-[0.01em] text-zinc-900 sm:text-[2.7rem] lg:text-[3.4rem]">
                            {activeSlide.title}
                        </h2>
                        <p className="mt-4 max-w-[500px] text-[0.98rem] font-medium text-zinc-700 sm:text-[1.08rem]">
                            {activeSlide.description}
                        </p>

                        <Link
                            to={activeSlide.button_url || '/shop'}
                            className="mt-6 inline-flex items-center justify-center border border-zinc-900 bg-zinc-900 px-6 py-3 text-[0.84rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800"
                        >
                            {activeSlide.button_text || 'Explore The Drop'}
                        </Link>

                        {slides.length > 1 ? (
                            <div className="mt-5 flex items-center gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={`home-bg-slide-dot-${index}`}
                                        type="button"
                                        aria-label={`Go to slide ${index + 1}`}
                                        onClick={() => {
                                            if (index === activeSlideIndex || isTurning) {
                                                return;
                                            }

                                            setTurnDirection(index > activeSlideIndex ? 'next' : 'prev');
                                            setPendingSlideIndex(index);
                                            setIsTurning(true);

                                            turnTimeoutRef.current = window.setTimeout(() => {
                                                setActiveSlideIndex(index);
                                                setPendingSlideIndex(null);
                                                setIsTurning(false);
                                            }, 720);
                                        }}
                                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                                            index === activeSlideIndex
                                                ? 'bg-zinc-900'
                                                : 'bg-zinc-400 hover:bg-zinc-600'
                                        }`}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="relative lg:ml-auto lg:w-full lg:max-w-[760px]">
                        <div className="pointer-events-none absolute -inset-4 bg-gradient-to-tr from-zinc-900/10 to-transparent blur-2xl" />
                        <div className="relative overflow-hidden border border-zinc-200/80 bg-white shadow-[0_28px_65px_-30px_rgba(15,23,42,0.55)]">
                            <div className="book-page-frame relative aspect-[4/3] min-h-[300px] sm:min-h-[380px] lg:min-h-[500px]">
                                <img
                                    src={activeSlide.image || DEFAULT_BACKGROUND_IMAGE}
                                    alt="Background showcase"
                                    className={`absolute inset-0 h-full w-full object-cover ${
                                        isTurning
                                            ? turnDirection === 'next'
                                                ? 'book-page-out-next'
                                                : 'book-page-out-prev'
                                            : ''
                                    }`}
                                    loading="lazy"
                                    decoding="async"
                                />

                                {isTurning && pendingSlide ? (
                                    <img
                                        src={pendingSlide.image || DEFAULT_BACKGROUND_IMAGE}
                                        alt="Background showcase"
                                        className={`absolute inset-0 h-full w-full object-cover ${
                                            turnDirection === 'next' ? 'book-page-in-next' : 'book-page-in-prev'
                                        }`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
