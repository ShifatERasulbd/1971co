import { Link } from 'react-router-dom';

import { timelessFontClass } from '../../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const collections = [
    {
        label: 'New Arrivals',
        href: '/shop?collection=new-arrivals',
        image: '/uploads/heroes/images/hero1.webp',
        objectPosition: 'object-[30%_center]',
    },
    {
        label: 'Essentials',
        href: '/shop?collection=essentials',
        image: '/uploads/heroes/images/hero1.webp',
        objectPosition: 'object-[45%_center]',
    },
    {
        label: 'Tees',
        href: '/shop?collection=tees',
        image: '/uploads/heroes/images/hero1.webp',
        objectPosition: 'object-[55%_center]',
    },
    {
        label: 'Bottoms',
        href: '/shop?collection=bottoms',
        image: '/uploads/heroes/images/hero1.webp',
        objectPosition: 'object-[70%_center]',
    },
];

function CollectionCard({ label, href, image, objectPosition }) {
    return (
        <Link
            to={href}
            className="group relative block overflow-hidden bg-zinc-100"
        >
            <img
                src={image}
                alt={label}
                className={`h-[420px] w-full object-cover ${objectPosition} transition-transform duration-500 group-hover:scale-105 sm:h-[480px] lg:h-[520px]`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <span className={`absolute bottom-4 left-4 ${sectionTypography.cardLabel} text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]`}>
                {label}
            </span>
        </Link>
    );
}

export default function CollectionsSection() {
    return (
        <section className={`${timelessFontClass} bg-white py-10 sm:py-14`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                    <h2 className={`${sectionTypography.sectionHeader} text-zinc-900`}>
                        Collections
                    </h2>
                    <Link
                        to="/shop"
                        className={`${sectionTypography.sectionMetaLink} text-zinc-500 transition-colors hover:text-zinc-900`}
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                    {collections.map((col) => (
                        <CollectionCard key={col.label} {...col} />
                    ))}
                </div>
            </div>
        </section>
    );
}
