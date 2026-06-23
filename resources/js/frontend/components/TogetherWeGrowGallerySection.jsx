import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { timelessFontClass } from '../utils/typography';

const galleryItems = [
    {
        id: 'community-1',
        src: '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp',
        alt: 'Children participating in a classroom activity.',
        label: 'Community',
        date: '2026-06-18',
    },
    {
        id: 'community-2',
        src: '/uploads/about/story/1781528584_about_story_6a2ff8086e82f3.63671374.webp',
        alt: 'Students listening during a learning session.',
        label: 'Learning Session',
        date: '2026-06-12',
    },
    {
        id: 'community-3',
        src: '/uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg',
        alt: 'Community program moment with children.',
        label: 'Community Program',
        date: '2026-06-10',
    },
    {
        id: 'community-4',
        src: '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg',
        alt: 'Mentorship and care initiative.',
        label: 'Mentorship',
        date: '2026-06-07',
    },
    {
        id: 'community-5',
        src: '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp',
        alt: 'Shared community space and daily activities.',
        label: 'Shared Space',
        date: '2026-06-04',
    },
    {
        id: 'community-6',
        src: '/uploads/heroes/images/1780912831_image.webp',
        alt: 'A support event for garment workers families.',
        label: 'Support Event',
        date: '2026-06-01',
    },
];

function formatDate(isoDate) {
    try {
        const parsed = new Date(isoDate);
        return parsed.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    } catch {
        return isoDate;
    }
}

export default function TogetherWeGrowGallerySection({ sectionData }) {
    const items = Array.isArray(sectionData?.galleryItems) && sectionData.galleryItems.length > 0
        ? sectionData.galleryItems
        : galleryItems;

    const [activeIndex, setActiveIndex] = useState(0);

    const activeItem = useMemo(() => {
        return items[activeIndex] || items[0];
    }, [activeIndex, items]);

    const safeActiveItem = activeItem || items[0] || galleryItems[0];

    function showPrevious() {
        setActiveIndex((previous) => (previous === 0 ? items.length - 1 : previous - 1));
    }

    function showNext() {
        setActiveIndex((previous) => (previous === items.length - 1 ? 0 : previous + 1));
    }

    return (
        <section className={`${timelessFontClass} bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-10`}>
            <div className="mx-auto w-full max-w-[1920px] border border-zinc-200 bg-white p-3 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="max-w-[340px] text-[1.9rem] font-black uppercase leading-[0.9] tracking-[-0.01em] text-zinc-950 sm:text-[2.3rem]">
                        Moments From
                        <br />
                        The Community.
                    </h2>

                    <button
                        type="button"
                        className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                        View All Photos
                    </button>
                </div>

                <div className="relative mt-4 overflow-hidden bg-zinc-100">
                    <img
                        src={safeActiveItem.src}
                        alt={safeActiveItem.alt || 'Community gallery image'}
                        className="h-[340px] w-full object-contain sm:h-[430px] lg:h-[560px] xl:h-[620px]"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                        <div>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/85">
                                {safeActiveItem.label || 'Community'}
                            </p>
                            <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-white/75">
                                {formatDate(safeActiveItem.date || '')}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={showPrevious}
                                className="inline-flex h-8 w-8 items-center justify-center border border-white/35 bg-black/45 text-white transition-colors hover:bg-black/70"
                                aria-label="Previous photo"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                            </button>
                            <button
                                type="button"
                                onClick={showNext}
                                className="inline-flex h-8 w-8 items-center justify-center border border-white/35 bg-black/45 text-white transition-colors hover:bg-black/70"
                                aria-label="Next photo"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-6 gap-2.5">
                    {items.map((item, index) => (
                        <button
                            type="button"
                            key={item.id || `gallery-item-${index}`}
                            onClick={() => setActiveIndex(index)}
                            className={`relative overflow-hidden border ${index === activeIndex ? 'border-zinc-950' : 'border-zinc-200 opacity-75'} transition-all hover:opacity-100`}
                            aria-label={`Show ${item.label || 'gallery'} photo`}
                        >
                            <img
                                src={item.src}
                                alt={item.alt || 'Community gallery thumbnail'}
                                className="h-[58px] w-full bg-white object-contain sm:h-[72px]"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
