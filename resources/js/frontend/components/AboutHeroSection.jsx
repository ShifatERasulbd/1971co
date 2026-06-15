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
                    <p className="mb-6 text-[0.72rem] uppercase tracking-[0.26em] text-white/80 sm:text-[0.78rem]">
                        Our Story
                    </p>

                    <h1 className="font-serif text-[clamp(2.8rem,8vw,6.8rem)] uppercase leading-[0.92] tracking-[0.04em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
                        Heritage. Culture. Style.
                    </h1>

                    <p className="mx-auto mt-6 max-w-[600px] text-[0.95rem] font-light leading-[1.6] text-white/85 sm:text-[1.02rem]">
                        Redefining streetwear through bold design and authentic self-expression.
                    </p>
                </div>
            </div>
        </section>
    );
}
