const brandLogo = '/uploads/heroes/images/hero1.webp';

export default function About1971Section() {
    return (
        <section className="bg-[#f5f5f5] py-14 sm:py-16 lg:py-24">
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                    {/* Left Content */}
                    <div className="px-1 sm:px-2 lg:px-0">
                        <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[#8b7355]">
                            The Beginning
                        </p>

                        <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.1] tracking-[0.02em] text-zinc-900">
                            Why 1971?
                        </h2>

                        <div className="mt-8 space-y-5 text-[0.95rem] leading-[1.7] text-slate-700 sm:text-[1rem]">
                            <p>
                                "1971" carries deep historical significance representing independence, pride, and cultural identity. It signals that our brand is rooted in Bangladeshi legacy, not copying Western streetwear but redefining its own path.
                            </p>

                            <p>
                                The "Co" brings a fresh, youthful street vibe clean, approachable, and contemporary. Together, they represent our mission: heritage meets modern street culture.
                            </p>

                            <p>
                                At 1971Co, we believe streetwear is more than clothing. It's a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.
                            </p>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="flex items-center justify-center bg-black p-6 sm:p-8 lg:p-12">
                        <div className="flex h-[300px] w-full items-center justify-center sm:h-[380px] lg:h-[480px]">
                            <img
                                src={brandLogo}
                                alt="1971Co. Brand Logo"
                                className="h-full w-full object-contain text-white filter brightness-0 invert"
                            />
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
