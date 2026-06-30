import { BookOpen, HeartPulse, Sparkles, Sprout, Users } from 'lucide-react';

import { timelessFontClass } from '../utils/typography';

const communityItems = [
    {
        id: 'learning-hub',
        title: 'Learning Hub',
        description: 'Workshops, library access, and skill-building sessions led by community members.',
        icon: 'book-open',
    },
    {
        id: 'health-wellness',
        title: 'Health & Wellness',
        description: 'Regular health check-ups, awareness sessions, and on-call counseling support.',
        icon: 'heart-pulse',
    },
    {
        id: 'social-support',
        title: 'Social Support',
        description: 'Community events, peer groups, and family engagement programs.',
        icon: 'users',
    },
    {
        id: 'recreation',
        title: 'Recreation',
        description: 'Spaces for relaxation, cultural activities, and team-building moments.',
        icon: 'sparkles',
    },
];

const iconMap = {
    'book-open': BookOpen,
    'heart-pulse': HeartPulse,
    users: Users,
    sparkles: Sparkles,
    sprout: Sprout,
};

export default function TogetherWeGrowCommunityCenterSection({ sectionData }) {
    const contentTitle = sectionData?.contentTitle || 'Community Center';
    const heading = sectionData?.heading || 'A SPACE BUILT FOR THE PEOPLE WHO MAKE US.';
    const imageSrc = sectionData?.communityImage || '/uploads/about/giving-back/1781586266_about_giving_back_6a30d95a8dd5c4.14738819.webp';
    const items = Array.isArray(sectionData?.communityItems) && sectionData.communityItems.length > 0
        ? sectionData.communityItems
        : communityItems;

    return (
        <section className={`${timelessFontClass} bg-[#ececec] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20`}>
            <div className="mx-auto w-full max-w-[1920px]">
                <p className="text-[1.2rem] font-bold uppercase tracking-[0.25em] text-zinc-900">
                    {contentTitle}
                </p>

                <h2 className="mt-4 max-w-[760px] text-[2.3rem] font-black uppercase leading-[0.95] tracking-[-0.02em] text-black sm:text-[3rem] lg:text-[4.2rem]">
                    {heading}
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-6">
                    <div className="grid grid-cols-1 gap-4 self-start sm:grid-cols-2 sm:gap-5">
                        {items.map((item, index) => {
                            const Icon = iconMap[String(item.icon || '').toLowerCase()] || Sparkles;

                            return (
                                <article key={item.id || `${item.title || 'community'}-${index}`} className="border border-zinc-300/80 bg-[#f3f3f3] px-5 py-5 sm:px-6 sm:py-6">
                                    <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                                        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    </div>

                                    <h3 className="mt-4 text-[1.45rem] font-bold leading-[1.05] text-zinc-950 sm:text-[1.6rem]">
                                        {item.title || 'Community Program'}
                                    </h3>

                                    <p className="mt-3 max-w-[30ch] text-[0.86rem] leading-[1.65] text-zinc-600 sm:text-[0.9rem]">
                                        {item.description || 'Program details'}
                                    </p>
                                </article>
                            );
                        })}
                    </div>

                    <div className="h-[320px] overflow-hidden border border-zinc-300/70 bg-zinc-200 sm:h-[420px] lg:ml-auto lg:h-[460px] lg:max-w-[860px] xl:h-[500px]">
                        <img
                            src={imageSrc}
                            alt="Children at the community center"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
