import { featuresFontClass } from '../../utils/typography';

const imageSource = '/uploads/heroes/images/hero1.webp';

const instagramItems = [
    { id: 1, alt: 'Timeless instagram product 1', position: 'object-[42%_center]' },
    { id: 2, alt: 'Timeless instagram product 2', position: 'object-[50%_center]', featured: true },
    { id: 3, alt: 'Timeless instagram product 3', position: 'object-[58%_center]' },
    { id: 4, alt: 'Timeless instagram product 4', position: 'object-[64%_center]' },
    { id: 5, alt: 'Timeless instagram product 5', position: 'object-[48%_center]' },
    { id: 6, alt: 'Timeless instagram product 6', position: 'object-[70%_center]' },
];

function InstagramCard({ item }) {
    const overlayClass = item.featured
        ? 'bg-black/42 opacity-100'
        : 'bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100';

    return (
        <article className="group relative overflow-hidden bg-white">
            <img
                src={imageSource}
                alt={item.alt}
                className={`h-[220px] w-full object-cover ${item.position} transition-transform duration-500 group-hover:scale-105 sm:h-[250px] lg:h-[300px]`}
            />

            <div className={`absolute inset-0 flex items-center justify-center ${overlayClass}`}>
                <span className="inline-flex size-14 items-center justify-center rounded-full border border-white/70 text-white">
                    <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                        <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
                        <circle cx="12" cy="12" r="3.7" stroke="currentColor" strokeWidth="1.8" fill="none" />
                        <circle cx="16.4" cy="7.6" r="1.1" fill="currentColor" />
                    </svg>
                </span>
            </div>
        </article>
    );
}

export default function InstagramSection() {
    return (
        <section className={`${featuresFontClass} bg-white py-14 sm:py-16 lg:py-20`}>
            <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12">
                <h2 className="mb-8 text-center text-[1.2rem] font-medium uppercase tracking-[0.18em] text-zinc-900 sm:mb-10 sm:text-[1.55rem]">
                    Follow Us On Instagram
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                    {instagramItems.map((item) => (
                        <InstagramCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}
