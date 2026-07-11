import { useMemo } from 'react';
import { timelessFontClass } from '../utils/typography';

// Data source maintained from your original snippet
const galleryItems = [
    { id: 'community-1', src: '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp', alt: 'Children participating in a classroom activity.'  },
    { id: 'community-2', src: '/uploads/about/story/1781528584_about_story_6a2ff8086e82f3.63671374.webp', alt: 'Students listening during a learning session.' },
    { id: 'community-3', src: '/uploads/about/hero/1781527310_about_hero_6a2ff30ec4c0d8.12870098.jpg', alt: 'Community program moment with children.' },
    { id: 'community-4', src: '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg', alt: 'Mentorship and care initiative.'  },
    { id: 'community-5', src: '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp', alt: 'Shared community space and daily activities.' },
    { id: 'community-6', src: '/uploads/heroes/images/1780912831_image.webp', alt: 'A support event for garment workers families.', },
     { id: 'community-7', src: '/uploads/about/mission/1781585355_about_mission_6a30d5cb0eab87.68288187.jpg', alt: 'Mentorship and care initiative.' },
    { id: 'community-8', src: '/uploads/our-story/images/1781584475_story_image_6a30d25bc69ac5.59079252.webp', alt: 'Shared community space and daily activities.' },
    { id: 'community-9', src: '/uploads/heroes/images/1780912831_image.webp', alt: 'A support event for garment workers families.' }
];

export default function TogetherWeGrowCanvas({ sectionData }) {
    // Memoize the items to handle potential dynamic data updates efficiently
    const items = useMemo(() => 
        (Array.isArray(sectionData?.galleryItems) && sectionData.galleryItems.length > 0) 
            ? sectionData.galleryItems 
            : galleryItems, 
    [sectionData?.galleryItems]);

    return (
        <section className={`${timelessFontClass} bg-zinc-50 px-4 py-16 sm:px-6 lg:px-10`}>
            <div className="mx-auto w-full max-w-[1400px]">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-[2rem] font-black uppercase tracking-[-0.02em] text-zinc-950 sm:text-[2.8rem]">
                        Drawing Board
                    </h2>
                    <div className="mt-2 h-1 w-20 bg-zinc-950" />
                </div>

                {/* Masonry-style Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-min">
                    {items.map((item, index) => (
                        <div 
                            key={item.id || index}
                            className={`group bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-xl ${
                                // Dynamic spanning to mimic the mood board look
                                index % 5 === 0 ? 'md:col-span-2' : ''
                            }`}
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={item.src}
                                    alt={item.alt || 'Gallery image'}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-3 px-1 pb-1">
                                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}