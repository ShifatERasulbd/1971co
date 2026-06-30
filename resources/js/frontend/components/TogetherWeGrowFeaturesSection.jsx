import { GraduationCap, HandHeart, HeartHandshake, Sparkles, Sprout } from 'lucide-react';

import { timelessFontClass } from '../utils/typography';



const iconMap = {
    'graduation-cap': GraduationCap,
    'heart-handshake': HeartHandshake,
    'hand-heart': HandHeart,
    sprout: Sprout,
    sparkles: Sparkles,
};

export default function TogetherWeGrowFeaturesSection({ sectionData }) {
    const imageSrc = sectionData?.featureImage || '/uploads/heroes/images/hero1.webp';
    

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

               
            </div>
        </section>
    );
}
