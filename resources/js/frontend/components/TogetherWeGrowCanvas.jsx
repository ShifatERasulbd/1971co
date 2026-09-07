import { useEffect, useMemo, useState } from 'react';
import { timelessFontClass } from '../utils/typography';
import CanvasModal from './CanvasModal';

const galleryItems = [
    { id: 'community-1', src: '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp', alt: 'Children participating in a classroom activity.' },
    { id: 'community-2', src: '/uploads/about/story/1781528584_about_story_6a2ff8086e82f3.63671374.webp', alt: 'Students listening during a learning session.' },
    { id: 'community-3', src: '/uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg', alt: 'Community program moment with children.' },
    { id: 'community-4', src: '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg', alt: 'Mentorship and care initiative.' },
    { id: 'community-5', src: '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp', alt: 'Shared community space and daily activities.' },
    { id: 'community-6', src: '/uploads/heroes/images/1780912831_image.webp', alt: 'A support event for garment workers families.' },
    { id: 'community-7', src: '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg', alt: 'Mentorship and care initiative.' },
    { id: 'community-8', src: '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp', alt: 'Shared community space and daily activities.' },
    { id: 'community-9', src: '/uploads/heroes/images/1780912831_image.webp', alt: 'A support event for garment workers families.' },
    { id: 'community-10', src: '/uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg', alt: 'Additional community event.' }
];

function moveItem(items, sourceIndex, targetIndex) {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return items;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}

export default function TogetherWeGrowCanvas({ sectionData, isBuilderPreview = false, onReorderImages }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const normalizedItems = useMemo(() =>
        Array.isArray(sectionData?.canvasImages) && sectionData.canvasImages.length > 0
            ? sectionData.canvasImages.map((item, index) =>
                  typeof item === 'string'
                      ? { id: `community-canvas-${index}`, src: item }
                      : {
                            id: item?.id || `community-canvas-${index}`,
                            src: item?.src || '',
                            alt: item?.alt || 'Community canvas image',
                            label: item?.label || 'Canvas',
                            sort_order: Number.isFinite(item?.sort_order) ? item.sort_order : index,
                        }
              )
            : sectionData?.canvasImage
            ? [{ id: 'community-canvas-image', src: sectionData.canvasImage, alt: 'Community canvas image', label: 'Canvas', sort_order: 0 }]
            : (Array.isArray(sectionData?.galleryItems) && sectionData.galleryItems.length > 0)
                ? sectionData.galleryItems.map((item, index) => ({ ...item, sort_order: index }))
                : galleryItems,
    [sectionData?.canvasImage, sectionData?.canvasImages, sectionData?.galleryItems]);

    const [items, setItems] = useState(normalizedItems);
    const [draggingIndex, setDraggingIndex] = useState(null);

    useEffect(() => { setItems(normalizedItems); }, [normalizedItems]);

    const handleDropOnIndex = (targetIndex) => {
        if (draggingIndex === null || draggingIndex === targetIndex) return;
        const reordered = moveItem(items, draggingIndex, targetIndex).map((item, index) => ({ ...item, sort_order: index }));
        setItems(reordered);
        setDraggingIndex(null);
        onReorderImages?.(reordered);
    };

    const visibleItems = items.slice(0, 10);
    const hasMore = items.length > 10;
    const remainingCount = items.length - 10;

    const handleOpenModal = () => {
        if (isBuilderPreview) {
            return;
        }

        setIsModalOpen(true);
    };

    return (
        <section className={`${timelessFontClass} bg-zinc-50 px-4 py-16 sm:px-6 lg:px-10`}>
            <div className="mx-auto w-full max-w-[1400px]">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-[2rem] font-black uppercase tracking-[-0.02em] text-zinc-950 sm:text-[2.8rem]">
                        Community Canvas
                    </h2>
                    <div className="mt-2 h-1 w-20 bg-zinc-950" />
                </div>

                {/* Masonry Layout */}
                <div className="columns-2 gap-4 md:columns-3 lg:columns-4 space-y-4">
                    {visibleItems.map((item, index) => {
                        const isLastVisible = index === 9 && hasMore;
                        
                        return (
                            <div 
                                key={item.id || index}
                                draggable={isBuilderPreview}
                                onDragStart={() => isBuilderPreview && setDraggingIndex(index)}
                                onDragOver={(e) => isBuilderPreview && e.preventDefault()}
                                onDrop={() => isBuilderPreview && handleDropOnIndex(index)}
                                onDragEnd={() => setDraggingIndex(null)}
                                onClick={handleOpenModal}
                                className={`group break-inside-avoid bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-xl relative ${isLastVisible ? 'cursor-pointer' : ''} ${isBuilderPreview ? 'cursor-move' : ''}`}
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={item.src}
                                        alt={item.alt || 'Gallery image'}
                                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                    
                                    {/* Static Overlay Counter (Always Activated) */}
                                    {isLastVisible && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                            <span className="text-white font-black text-2xl tracking-wider">
                                                +{remainingCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Overlay Component */}
            <CanvasModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                items={items} 
            />
        </section>
    );
}