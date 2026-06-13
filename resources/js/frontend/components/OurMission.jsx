import { BadgeCheck, Gift, Handshake, SlidersHorizontal } from 'lucide-react';

const missionBackground = '/uploads/heroes/images/hero1.webp';

const missionPillars = [
    { icon: BadgeCheck, title: 'Premium-Quality' },
    { icon: SlidersHorizontal, title: 'Creative Customization' },
    { icon: Gift, title: 'Long-Term Partnerships' },
    { icon: Handshake, title: 'Modern Fashion Designed' },
];

export default function OurMission() {
    return (
        <section className="relative isolate overflow-hidden bg-zinc-950 py-16 text-white sm:py-20 lg:py-24">
            <img
                src={missionBackground}
                alt="Timeless mission background"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 -z-10 bg-black/72" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(12,18,32,0.15),rgba(2,6,16,0.65)_52%,rgba(0,0,0,0.82)_100%)]" />

            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[900px] text-center">
                    <h2 className="font-serif text-[clamp(2.1rem,4.8vw,3.4rem)] uppercase tracking-[0.06em] text-white">
                        Our Mission
                    </h2>

                    <p className="mx-auto mt-2 max-w-[72ch] text-[1.02rem] leading-6 text-white/82 sm:text-[1.12rem]">
                        Our mission is to make personalized fashion accessible, premium, and expressive.
                        We aim to deliver apparel that combines comfort, durability, and modern design
                        while giving customers the freedom to create styles that represent their identity.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 text-center sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
                    {missionPillars.map((pillar) => {
                        const Icon = pillar.icon;

                        return (
                            <article key={pillar.title} className="flex flex-col items-center px-3 py-2">
                                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/35 backdrop-blur-sm">
                                    <Icon className="size-7 text-white" strokeWidth={1.7} />
                                </span>

                                <h3 className="mt-3 font-serif text-[1.65rem] leading-tight text-white sm:text-[1.2rem]">
                                    {pillar.title}
                                </h3>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
