import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const heroImage = '/uploads/heroes/images/hero1.webp';

export default function ShopHeroSection() {
    return (
        <section className={`${featuresFontClass} relative isolate overflow-hidden border-b border-zinc-200 bg-zinc-950 text-white`}>
            <img
                src={heroImage}
                alt="Timeless shop hero"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.82)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-black/20" />

            <div className="mx-auto flex min-h-[360px] w-full max-w-[1920px] items-center justify-center px-5 py-16 sm:min-h-[440px] sm:px-8 lg:min-h-[520px] lg:px-12">
                <div className="text-center">
                    <p className="mb-6 text-[0.72rem] uppercase tracking-[0.26em] text-white/70 sm:text-[0.78rem]">
                        <Link to="/" className="transition-colors hover:text-white">
                            Home
                        </Link>{' '}
                        / Shop
                    </p>

                    <h1 className="font-serif text-[clamp(3rem,8vw,7.2rem)] uppercase leading-none tracking-[0.02em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
                        Shop Left Sidebar
                    </h1>
                </div>
            </div>
        </section>
    );
}
