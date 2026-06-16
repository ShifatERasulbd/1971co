import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

// Used only as last-resort fallback when the API call fails entirely.
const FALLBACK_DATA = {
    title: 'Collections',
    titlePosition: 'left',
    itemsPerView: 4,
    items: [
        { name: 'New Arrivals', slug: 'new-arrivals', image: '/uploads/heroes/images/hero1.webp' },
        { name: 'Essentials',   slug: 'essentials',   image: '/uploads/heroes/images/hero1.webp' },
        { name: 'Tees',         slug: 'tees',         image: '/uploads/heroes/images/hero1.webp' },
        { name: 'Bottoms',      slug: 'bottoms',      image: '/uploads/heroes/images/hero1.webp' },
    ],
};

function CollectionCardSkeleton() {
    return (
        <div className="h-[420px] w-full animate-pulse rounded-sm bg-zinc-200 sm:h-[480px] lg:h-[520px]" />
    );
}

function CollectionCard({ name, slug, image, isBuilderPreview, index }) {
    const href = `/shop?collection=${slug || ''}`;

    function handleSelectInBuilder(event) {
        if (!isBuilderPreview) {
            return;
        }

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
            className="group relative block overflow-hidden"
            onClick={handleSelectInBuilder}
        >
            <img
                src={image}
                alt={name}
                className="block w-full h-auto transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className={`absolute bottom-4 left-4 ${sectionTypography.cardLabel} text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]`}>
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
    // null = still loading, false = load failed, object = loaded
    const [loadStatus, setLoadStatus] = useState('loading');

    const [isBuilderPreview] = useState(() => {
        try {
            return window.self !== window.top;
        } catch {
            return false;
        }
    });

    // In builder preview, render immediately with fallback and then hydrate from postMessage.
    useEffect(() => {
        if (isBuilderPreview) {
            setLoadStatus('ready');
        }
    }, [isBuilderPreview]);

    // In builder preview the parent pushes data via postMessage – no public API fetch needed.
    useEffect(() => {
        if (!isBuilderPreview) {
            return;
        }

        function handleBuilderPreviewMessage(event) {
            if (event.origin !== window.location.origin) {
                return;
            }

            const data = event.data;
            if (!data || data.type !== 'TIMLESS_PAGE_BUILDER_COLLECTIONS_PREVIEW_UPDATE') {
                return;
            }

            setPreviewOverride((previous) => ({
                ...(previous || {}),
                ...(data.payload || {}),
            }));

            // First message arrives → mark as loaded so the skeleton disappears.
            setLoadStatus('ready');
        }

        window.addEventListener('message', handleBuilderPreviewMessage);

        // Ask parent for the latest collections draft in case initial publish happened
        // before this lazy-loaded section mounted.
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'TIMLESS_PAGE_BUILDER_REQUEST_COLLECTIONS_PREVIEW',
                },
                window.location.origin
            );
        }

        return () => {
            window.removeEventListener('message', handleBuilderPreviewMessage);
        };
    }, [isBuilderPreview]);

    // Public storefront: fetch from database.
    useEffect(() => {
        if (isBuilderPreview) {
            return;
        }

        let ignore = false;

        async function loadPublicCollections() {
            try {
                const response = await fetch('/api/public/collections', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    if (!ignore) {
                        setLoadStatus('error');
                    }
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
                if (!ignore) {
                    setLoadStatus('error');
                }
            }
        }

        loadPublicCollections();

        return () => {
            ignore = true;
        };
    }, [isBuilderPreview]);

    // Merge: DB data is authoritative; builder preview override sits on top.
    const displayData = useMemo(() => {
        const base = dbData || FALLBACK_DATA;
        if (!previewOverride) {
            return base;
        }
        return { ...base, ...previewOverride };
    }, [dbData, previewOverride]);

    const title = displayData.title || 'Collections';
    const titlePosition = displayData.titlePosition || 'left';
    const itemsPerView = Math.max(1, Math.min(6, Number(displayData.itemsPerView) || 4));
    const collections = Array.isArray(displayData.items) && displayData.items.length > 0
        ? displayData.items
        : FALLBACK_DATA.items;

    const titleAlignClass =
        titlePosition === 'center'
            ? 'text-center'
            : titlePosition === 'right'
              ? 'text-right'
              : 'text-left';

    const gridColumnsClass =
        itemsPerView <= 1
            ? 'lg:grid-cols-1'
            : itemsPerView === 2
              ? 'lg:grid-cols-2'
              : itemsPerView === 3
                ? 'lg:grid-cols-3'
                : itemsPerView === 5
                  ? 'lg:grid-cols-5'
                  : itemsPerView >= 6
                    ? 'lg:grid-cols-6'
                    : 'lg:grid-cols-4';

    function handleSectionSelect() {
        if (!isBuilderPreview) {
            return;
        }

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
            const sourceItems = Array.isArray(previous?.items)
                ? previous.items
                : Array.isArray(dbData?.items)
                  ? dbData.items
                  : FALLBACK_DATA.items;

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

    const isLoading = !isBuilderPreview && loadStatus === 'loading';

    return (
        <section className={`${timelessFontClass} bg-white py-10 sm:py-14`} onClick={handleSectionSelect}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                    {isLoading ? (
                        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
                    ) : (
                        <h2 className={`${sectionTypography.sectionHeader} ${titleAlignClass} text-zinc-900`}>
                            {title}
                        </h2>
                    )}
                    <Link
                        to="/shop"
                        className={`${sectionTypography.sectionMetaLink} text-zinc-500 transition-colors hover:text-zinc-900`}
                        onClick={(event) => {
                            if (isBuilderPreview) {
                                event.preventDefault();
                            }
                        }}
                    >
                        View All
                    </Link>
                </div>

                <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${gridColumnsClass}`}>
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
                                      image={col.image || '/uploads/heroes/images/hero1.webp'}
                                      isBuilderPreview={isBuilderPreview}
                                      index={index}
                                  />
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
}
