import { Link } from 'react-router-dom';

const aboutHeroImage = '/uploads/heroes/images/hero1.webp';

export default function AboutHeroSection() {
    return (
        <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
            <img
                src={aboutHeroImage}
                alt="Timeless about team"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(5,10,22,0.82)_0%,rgba(8,12,20,0.58)_40%,rgba(6,10,18,0.86)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),rgba(0,0,0,0.28)_55%,rgba(0,0,0,0.52)_100%)]" />

            <div className="mx-auto flex min-h-[320px] w-full max-w-[1920px] items-center justify-center px-6 py-14 sm:min-h-[420px] sm:px-8 lg:min-h-[540px] lg:px-12">
                <div className="text-center">
                    <p className="mb-6 text-[0.72rem] uppercase tracking-[0.24em] text-white/75 sm:text-[0.78rem]">
                        <Link to="/" className="transition-colors hover:text-white">
                            Home
                        </Link>{' '}
                        / About Us
                    </p>

                    <h1 className="font-serif text-[clamp(2.6rem,7.8vw,6.6rem)] uppercase leading-[0.9] tracking-[0.06em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
                        About Us
                    </h1>
                </div>
            </div>
        </section>
    );
}
