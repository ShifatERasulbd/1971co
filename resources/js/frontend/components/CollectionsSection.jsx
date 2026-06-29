import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const GRID_COLUMNS_MAP = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
};

const TITLE_ALIGN_MAP = {
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
};

function CollectionCardSkeleton() {
    return (
        <div className="aspect-[3/4] w-full animate-pulse bg-zinc-200" />
    );
}

function CollectionCard({ name, slug, image, isBuilderPreview, index }) {
    const routeSegment = String(slug || name || '').trim();
    const href = `/collection/${encodeURIComponent(routeSegment)}`;

    function handleSelectInBuilder(event) {
        if (!isBuilderPreview) return;
        event.preventDefault();
        event.stopPropagation();

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_COLLECTIONS_SECTION_SELECTED',
                    payload: { itemIndex: index },
                },
                window.location.origin
            );
        }
    }

    return (
        <Link
            to={href}
            className="group relative block overflow-hidden aspect-[3/4] bg-zinc-100"
            onClick={handleSelectInBuilder}
        >
            {image && (
                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            <span className={`absolute bottom-5 left-5 z-20 ${sectionTypography.cardLabel} text-[1.1rem] sm:text-[1.3rem] lg:text-[1.6rem] font-bold uppercase tracking-wider text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]`}>
                {name}
            </span>
        </Link>
    );
}

function reorderItems(items, sourceIndex, targetIndex) {
    if (
        !Array.isArray(items) ||
        sourceIndex === targetIndex ||
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= items.length ||
        targetIndex >= items.length
    ) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}

export default function CollectionsSection() {
    const [previewOverride, setPreviewOverride] = useState(null);
    const [dbData, setDbData] = useState(null);
    const [loadStatus, setLoadStatus] = useState('loading');

    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (isBuilderPreview) {
            setLoadStatus('ready');
        }
    }, [isBuilderPreview]);

    useEffect(() => {
        if (!isBuilderPreview) return;

        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) return;

            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_COLLECTIONS_PREVIEW_UPDATE') return;

            setPreviewOverride((previous) => ({
                ...(previous || {}),
                ...(data.payload || {}),
            }));
            setLoadStatus('ready');
        }

        window.addEventListener('message', handleBuilderPreviewMessage);

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                { type: 'TIMLESS_PAGE_BUILDER_REQUEST_COLLECTIONS_PREVIEW' },
                window.location.origin
            );
        }

        return () => window.removeEventListener('message', handleBuilderPreviewMessage);
    }, [isBuilderPreview]);

    useEffect(() => {
        if (isBuilderPreview) return;

        let ignore = false;

        async function loadPublicCollections() {
            try {
                const response = await fetch('/api/public/collections', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    if (!ignore) setLoadStatus('error');
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload?.section && Array.isArray(payload?.items)) {
                    setDbData({
                        title: payload.section.title,
                        titlePosition: payload.section.titlePosition,
                        itemsPerView: Number(payload.section.itemsPerView) || 4,
                        items: payload.items
                            .slice()
                            .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
                            .map((item) => ({
                                id: item.id,
                                name: item.name,
                                slug: item.slug,
                                image: item.image || null,
                            })),
                    });
                    setLoadStatus('ready');
                } else if (!ignore) {
                    setLoadStatus('error');
                }
            } catch {
                if (!ignore) setLoadStatus('error');
            }
        }

        loadPublicCollections();
        return () => { ignore = true; };
    }, [isBuilderPreview]);

    const displayData = useMemo(() => {
        const base = dbData || { title: 'Collections', titlePosition: 'left', itemsPerView: 4, items: [] };
        return previewOverride ? { ...base, ...previewOverride } : base;
    }, [dbData, previewOverride]);

    const title = displayData.title || 'Collections';
    const titlePosition = displayData.titlePosition || 'left';
    const itemsPerView = Math.max(1, Math.min(6, Number(displayData.itemsPerView) || 4));
    const collections = Array.isArray(displayData.items) ? displayData.items : [];

    const titleAlignClass = TITLE_ALIGN_MAP[titlePosition] || 'text-left';
    const gridColumnsClass = GRID_COLUMNS_MAP[itemsPerView] || 'lg:grid-cols-4';
    const isLoading = !isBuilderPreview && loadStatus === 'loading';

    function handleSectionSelect() {
        if (!isBuilderPreview) return;
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_COLLECTIONS_SECTION_SELECTED',
                    payload: { itemIndex: null },
                },
                window.location.origin
            );
        }
    }

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
            const sourceItems = previous?.items || dbData?.items || [];
            return {
                ...(previous || {}),
                items: reorderItems(sourceItems, sourceIndex, targetIndex),
            };
        });

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_COLLECTIONS_ITEMS_REORDERED',
                    payload: { sourceIndex, targetIndex },
                },
                window.location.origin
            );
        }
    }

    // Scroll motion variants: Enter from far right (+150px) and exit to far left (-150px)
    const containerVariants = {
        hidden: { opacity: 0, x: 150 },
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: { type: 'spring', stiffness: 50, damping: 14, mass: 0.8 } 
        },
        exit: { 
            opacity: 0, 
            x: -150, 
            transition: { ease: 'easeInOut', duration: 0.4 } 
        }
    };

    return (
        <section
            className={`${timelessFontClass} bg-white py-10 sm:py-14 overflow-hidden`}
            onClick={handleSectionSelect}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes lightWaveSweep {
                    0%   { transform: translateX(-220%); }
                    100% { transform: translateX(420%);  }
                }
                .wave-outer, .wave-mid, .wave-core, .wave-hotspot {
                    animation: lightWaveSweep 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />

            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                {/* Header Container */}
                <div className="relative mb-6 flex items-center justify-between pb-4 sm:mb-8">
                    {isLoading ? (
                        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
                    ) : (
                        <h2 className={`${sectionTypography.sectionHeader} text-zinc-900 ${titleAlignClass}`}>
                            {title}
                        </h2>
                    )}
                    <Link
                        to="/shop"
                        className={`${sectionTypography.sectionHeaderActionLink} section-header-cta-glow text-zinc-500 transition-colors hover:text-zinc-900`}
                        onClick={(event) => isBuilderPreview && event.preventDefault()}
                    >
                        View All
                    </Link>

                    <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-zinc-300">
                        <div className="wave-outer absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[3px]" />
                        <div className="wave-mid absolute inset-y-0 w-[35%] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1.5px]" />
                        <div className="wave-core absolute inset-y-0 w-[18%] bg-gradient-to-r from-transparent via-white to-transparent" />
                        <div className="wave-hotspot absolute inset-y-0 w-[7%] bg-gradient-to-r from-transparent via-white to-transparent brightness-[2]" />
                    </div>
                </div>

                {/* Animated Grid Container */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    variants={containerVariants}
                    viewport={{ once: false, amount: 0.1 }}
                    className={`grid grid-cols-2 gap-2 sm:gap-3 ${gridColumnsClass}`}
                >
                    {isLoading
                        ? Array.from({ length: itemsPerView }).map((_, index) => (
                            <CollectionCardSkeleton key={`skeleton-${index}`} />
                        ))
                        : collections.map((col, index) => (
                            <div
                                key={`${col.slug || col.name || 'collection'}-${index}`}
                                draggable={isBuilderPreview}
                                onDragStart={(event) => handleDragStart(index, event)}
                                onDragOver={handleDragOver}
                                onDrop={(event) => handleDrop(index, event)}
                            >
                                <CollectionCard
                                    name={col.name || `Collection ${index + 1}`}
                                    slug={col.slug || ''}
                                    image={col.image}
                                    isBuilderPreview={isBuilderPreview}
                                    index={index}
                                />
                            </div>
                        ))}
                </motion.div>
            </div>
        </section>
    );
}