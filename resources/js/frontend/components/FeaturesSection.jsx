import { Layers, RefreshCw, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { timelessFontClass } from '../../utils/typography';
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
            className={`group flex items-start gap-5 py-8 sm:py-10 ${!isLast ? 'border-b border-zinc-200 sm:border-b-0 sm:border-r sm:pr-12 lg:pr-16' : ''} ${!isLast || true ? 'sm:px-12 lg:px-16' : ''} first:sm:pl-0`}
            draggable={isBuilderPreview}
            onDragStart={(event) => onDragStart(index, event)}
            onDragOver={onDragOver}
            onDrop={(event) => onDrop(index, event)}
            onClick={(event) => {
                if (!isBuilderPreview) {
                    return;
                }

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
            <div className="mt-0.5 flex size-12 flex-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-all duration-200 group-hover:border-zinc-300 group-hover:text-zinc-700 group-hover:shadow-md">
                {feature.icon_url ? (
                    <img
                        src={feature.icon_url}
                        alt=""
                        aria-hidden="true"
                        className="size-6 object-contain"
                    />
                ) : FallbackIcon ? (
                    <FallbackIcon className="size-5" strokeWidth={1.5} />
                ) : null}
            </div>

            <div className="min-w-0">
                <h3
                    className={`${sectionTypography.title} text-zinc-900`}
                    style={
                        feature.title_font_family
                            ? { fontFamily: feature.title_font_family }
                            : undefined
                    }
                >
                    {feature.title}
                </h3>
                <p
                    className={`${sectionTypography.description} mt-1 text-zinc-500`}
                    style={
                        feature.description_font_family
                            ? { fontFamily: feature.description_font_family }
                            : undefined
                    }
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
    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const res = await fetch('/api/public/features', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore && Array.isArray(data) && data.length > 0) {
                        setFeatures(
                            data.map((item) => ({
                                ...item,
                                short_description:
                                    item.short_description || item.description || '',
                            }))
                        );

                        const first = data[0] || {};
                        if (Number(first.columns_per_view) > 0) {
                            setColumnsPerView(Number(first.columns_per_view));
                        }
                    }
                }
            } catch {
                // keep fallback
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    useEffect(() => {
        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_FEATURES_PREVIEW_UPDATE') {
                return;
            }

            const draft = data.payload || {};
            if (!Array.isArray(draft.items)) {
                return;
            }

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

            setColumnsPerView(
                Math.max(1, Math.min(4, Number(draft.columns) || 3))
            );
        }

        window.addEventListener('message', handleBuilderPreviewMessage);
        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, []);

    const displayFeatures = Array.isArray(previewOverride) ? previewOverride : features;
        const desktopColumnsClass =
                columnsPerView <= 1
                        ? 'lg:grid-cols-1'
                        : columnsPerView === 2
                            ? 'lg:grid-cols-2'
                            : columnsPerView === 4
                                ? 'lg:grid-cols-4'
                                : 'lg:grid-cols-3';

    function handleDragStart(index, event) {
        if (!isBuilderPreview) {
            return;
        }

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
    }

    function handleDragOver(event) {
        if (!isBuilderPreview) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(targetIndex, event) {
        if (!isBuilderPreview) {
            return;
        }

        event.preventDefault();
        const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
        if (!Number.isInteger(sourceIndex) || sourceIndex === targetIndex) {
            return;
        }

        setPreviewOverride((previous) => {
            const list = Array.isArray(previous) ? previous : displayFeatures;
            const next = [...list];
            const [moved] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, moved);
            return next;
        });

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_FEATURES_ITEMS_REORDERED',
                    payload: { sourceIndex, targetIndex },
                },
                window.location.origin
            );
        }
    }

    function handleSectionSelect() {
        if (!isBuilderPreview) {
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_FEATURES_SECTION_SELECTED',
                    payload: { itemIndex: null },
                },
                window.location.origin
            );
        }
    }

    return (
        <section
            className={`${timelessFontClass} border-y border-zinc-200 bg-[#f8f8f7]`}
            onClick={handleSectionSelect}
        >
            <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16">
                <div className={`grid grid-cols-1 divide-y divide-zinc-200 sm:divide-y-0 ${desktopColumnsClass} sm:divide-x`}>
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
