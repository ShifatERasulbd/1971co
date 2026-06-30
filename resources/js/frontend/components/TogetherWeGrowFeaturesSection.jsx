import { GraduationCap, HandHeart, HeartHandshake, Sparkles, Sprout } from 'lucide-react';

import { timelessFontClass } from '../utils/typography';

// const featureItems = [
//     {
//         id: 'education',
//         title: 'Education',
//         description: 'School supplies, tuition assistance, and scholarships that keep kids in the classroom.',
//         icon: 'graduation-cap',
//     },
//     {
//         id: 'care',
//         title: 'Care',
//         description: 'Healthcare, nutrition, and safe spaces for the children of the people who make our garments.',
//         icon: 'heart-handshake',
//     },
//     {
//         id: 'opportunity',
//         title: 'Opportunity',
//         description: 'Mentorship and skills programs that open doors to brighter, self-made futures.',
//         icon: 'sprout',
//     },
// ];

const iconMap = {
    'graduation-cap': GraduationCap,
    'heart-handshake': HeartHandshake,
    'hand-heart': HandHeart,
    sprout: Sprout,
    sparkles: Sparkles,
};

export default function TogetherWeGrowFeaturesSection({ sectionData }) {
    const imageSrc = sectionData?.featureImage || '/uploads/heroes/images/hero1.webp';
    // const items = Array.isArray(sectionData?.featureItems) && sectionData.featureItems.length > 0
    //     ? sectionData.featureItems
    //     : [];

    return (
        <section className={`${timelessFontClass} bg-[#eadccf]`}>
            <div className="mx-auto w-full max-w-[1920px]">
                <div className="h-[260px] sm:h-[360px] lg:h-[450px]">
                    <img
                        src={imageSrc}
                        alt="Community center building"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-3">
                    {items.map((item, index) => {
                        const Icon = iconMap[String(item.icon || '').toLowerCase()] || Sprout;

                        return (
                            <article
                                key={item.id || `${item.title || 'feature'}-${index}`}
                                className={`px-7 py-8 sm:px-10 sm:py-10 ${index !== 0 ? 'border-t border-white/70 md:border-l md:border-t-0' : ''}`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center border border-zinc-400/40 text-zinc-800">
                                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                                </div>

                                <h3 className="mt-5 text-[2rem] font-bold leading-[1.05] text-zinc-950">
                                    {item.title || 'Feature Title'}
                                </h3>

                                <p className="mt-3 max-w-[30ch] text-[1rem] leading-[1.6] text-zinc-700">
                                    {item.description || 'Feature description'}
                                </p>
                            </article>
                        );
                    })}
                </div> */}
            </div>
        </section>
    );
}
