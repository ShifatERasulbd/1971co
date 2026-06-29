import { Layers, RefreshCw, Tag } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const FALLBACK_FEATURES = [
    {
        id: 1,
        title: 'Premium Materials',
        short_description: 'Quality fabrics built to last',
        icon_url: null,
        _fallbackIcon: Layers,
    },
    {
        id: 2,
        title: 'Made for Daily Wear',
        short_description: "Essentials you'll reach for every day",
        icon_url: null,
        _fallbackIcon: RefreshCw,
    },
    {
        id: 3,
        title: 'Clean, Urban Fit',
        short_description: 'Modern silhouettes, timeless style',
        icon_url: null,
        _fallbackIcon: Tag,
    },
];

function FeatureItem({ feature, isLast, isBuilderPreview, index, onDragStart, onDragOver, onDrop }) {
    const FallbackIcon = feature._fallbackIcon;

    return (
        <div
            className="group relative flex items-start gap-5 py-8 sm:py-10 sm:px-12 lg:px-16 first:sm:pl-0"
            draggable={isBuilderPreview}
            onDragStart={(event) => onDragStart(index, event)}
            onDragOver={onDragOver}
            onDrop={(event) => onDrop(index, event)}
            onClick={(event) => {
                if (!isBuilderPreview) return;
                event.preventDefault();
                event.stopPropagation();
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage(
                        {
                            type: 'TIMLESS_PAGE_BUILDER_FEATURES_SECTION_SELECTED',
                            payload: { itemIndex: index },
                        },
                        window.location.origin
                    );
                }
            }}
        >
            {/* Vertical divider on the right — desktop only, hidden for last item */}
            {!isLast && (
                <span className="pointer-events-none absolute right-0 top-0 hidden h-full w-px overflow-hidden sm:block">
                    <span className="absolute inset-0 bg-zinc-200" />
                    <span className="wave-v absolute left-0 w-full bg-gradient-to-b from-transparent via-white to-transparent" />
                </span>
            )}

            {/* Horizontal divider on the bottom — mobile only, hidden for last item */}
            {!isLast && (
                <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full overflow-hidden sm:hidden">
                    <span className="absolute inset-0 bg-zinc-200" />
                    <span className="wave-h absolute top-0 h-full bg-gradient-to-r from-transparent via-white to-transparent" />
                </span>
            )}

            <div className="mt-0.5 flex size-12 flex-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-all duration-200 group-hover:border-zinc-300 group-hover:text-zinc-700 group-hover:shadow-md">
                {feature.icon_url ? (
                    <img src={feature.icon_url} alt="" aria-hidden="true" className="size-6 object-contain" />
                ) : FallbackIcon ? (
                    <FallbackIcon className="size-5" strokeWidth={1.5} />
                ) : null}
            </div>

            <div className="min-w-0">
                <h3
                    className={`${sectionTypography.title} text-zinc-900`}
                    style={feature.title_font_family ? { fontFamily: feature.title_font_family } : undefined}
                >
                    {feature.title}
                </h3>
                <p
                    className={`${sectionTypography.description} mt-1 text-zinc-500`}
                    style={feature.description_font_family ? { fontFamily: feature.description_font_family } : undefined}
                >
                    {feature.short_description || feature.description}
                </p>
            </div>
        </div>
    );
}

export default function FeaturesSection() {
    const [features, setFeatures] = useState(FALLBACK_FEATURES);
    const [columnsPerView, setColumnsPerView] = useState(3);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [exitDirection, setExitDirection] = useState('bottom');
    const sectionRef = useRef(null);
    const lastScrollY = useRef(0);

    const [isBuilderPreview] = useState(() => {
        try { return window.self !== window.top; } catch { return false; }
    });

    /* ── Scroll-based fade in / fade out ── */
    useEffect(() => {
        if (isBuilderPreview) {
            setIsVisible(true);
            return;
        }

        lastScrollY.current = window.scrollY;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const currentScrollY = window.scrollY;
                const scrollingDown = currentScrollY > lastScrollY.current;

                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                    setExitDirection(scrollingDown ? 'top' : 'bottom');
                }
                lastScrollY.current = currentScrollY;
            },
            { rootMargin: '-20px 0px -20px 0px', threshold: 0.08 }
        );

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    lastScrollY.current = window.scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }

        if (sectionRef.current) observer.observe(sectionRef.current);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
        };
    }, [isBuilderPreview]);

    /* ── Data fetching ── */
    useEffect(() => {
        let ignore = false;
        async function load() {
            try {
                const res = await fetch('/api/public/features', { headers: { Accept: 'application/json' } });
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore && Array.isArray(data) && data.length > 0) {
                        setFeatures(data.map((item) => ({
                            ...item,
                            short_description: item.short_description || item.description || '',
                        })));
                        const first = data[0] || {};
                        if (Number(first.columns_per_view) > 0) setColumnsPerView(Number(first.columns_per_view));
                    }
                }
            } catch { /* keep fallback */ }
        }
        load();
        return () => { ignore = true; };
    }, []);

    /* ── Builder preview messages ── */
    useEffect(() => {
        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_FEATURES_PREVIEW_UPDATE') return;
            const draft = data.payload || {};
            if (!Array.isArray(draft.items)) return;
            setPreviewOverride(
                draft.items.map((item, index) => ({
                    id: item.id || index + 1,
                    title: item.title || '',
                    short_description: item.short_description || item.description || '',
                    description: item.short_description || item.description || '',
                    icon_url: item.icon_url || item.icon || null,
                    title_font_family: draft.titleFontFamily,
                    description_font_family: draft.descriptionFontFamily,
                    _fallbackIcon: FALLBACK_FEATURES[index]?._fallbackIcon || Layers,
                }))
            );
            setColumnsPerView(Math.max(1, Math.min(4, Number(draft.columns) || 3)));
        }
        window.addEventListener('message', handleBuilderPreviewMessage);
        return () => window.removeEventListener('message', handleBuilderPreviewMessage);
    }, []);

    const displayFeatures = Array.isArray(previewOverride) ? previewOverride : features;

    const desktopColumnsClass =
        columnsPerView <= 1 ? 'lg:grid-cols-1'
        : columnsPerView === 2 ? 'lg:grid-cols-2'
        : columnsPerView === 4 ? 'lg:grid-cols-4'
        : 'lg:grid-cols-3';

    const fadeClass = isVisible
        ? 'opacity-100 translate-y-0 scale-100'
        : exitDirection === 'top'
            ? 'opacity-0 -translate-y-10 scale-[0.99]'
            : 'opacity-0 translate-y-10 scale-[0.99]';

    function handleDragStart(index, event) {
        if (!isBuilderPreview) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
    }

    function handleDragOver(event) {
        if (!isBuilderPreview) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(targetIndex, event) {
        if (!isBuilderPreview) return;
        event.preventDefault();
        const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
        if (!Number.isInteger(sourceIndex) || sourceIndex === targetIndex) return;

        setPreviewOverride((previous) => {
            const list = Array.isArray(previous) ? previous : displayFeatures;
            const next = [...list];
            const [moved] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, moved);
            return next;
        });

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                { type: 'TIMLESS_PAGE_BUILDER_FEATURES_ITEMS_REORDERED', payload: { sourceIndex, targetIndex } },
                window.location.origin
            );
        }
    }

    function handleSectionSelect() {
        if (!isBuilderPreview) return;
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                { type: 'TIMLESS_PAGE_BUILDER_FEATURES_SECTION_SELECTED', payload: { itemIndex: null } },
                window.location.origin
            );
        }
    }

    return (
        <section
            ref={sectionRef}
            className={`${timelessFontClass} relative bg-[#f8f8f7] transform transition-all duration-700 ease-out will-change-[transform,opacity] ${fadeClass}`}
            onClick={handleSectionSelect}
        >
            {/* ── Keyframes ── */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes waveH {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(100%);  }
                }
                @keyframes waveV {
                    0%   { transform: translateY(-100%); }
                    100% { transform: translateY(100%);  }
                }
                .wave-h {
                    width: 100%;
                    animation: waveH 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .wave-v {
                    height: 100%;
                    animation: waveV 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />

            {/* ── TOP border with horizontal wave ── */}
            <div className="absolute top-0 left-0 h-px w-full overflow-hidden">
                <div className="absolute inset-0 bg-zinc-200" />
                <div className="wave-h absolute top-0 h-full bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            {/* ── BOTTOM border with horizontal wave ── */}
            <div className="absolute bottom-0 left-0 h-px w-full overflow-hidden">
                <div className="absolute inset-0 bg-zinc-200" />
                <div className="wave-h absolute top-0 h-full bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16">
                {/*
                 * Tailwind divide-* and border-* removed from grid and items.
                 * Each divider is an absolutely-positioned element inside FeatureItem
                 * with a base zinc-200 layer and an animated wave on top.
                 */}
                <div className={`grid grid-cols-1 ${desktopColumnsClass}`}>
                    {displayFeatures.slice(0, Math.max(1, columnsPerView)).map((feature, index) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                            isLast={index === Math.min(displayFeatures.length, columnsPerView) - 1}
                            isBuilderPreview={isBuilderPreview}
                            index={index}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
