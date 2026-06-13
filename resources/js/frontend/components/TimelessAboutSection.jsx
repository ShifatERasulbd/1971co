const aboutImage = '/uploads/heroes/images/hero1.webp';

export default function TimelessAboutSection() {
    return (
        <section className="bg-[#ececec] py-14 sm:py-16 lg:py-20">
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <div className="bg-[#dfdfdf] px-5 py-6 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
                    <article className="grid items-center gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-14 xl:gap-20">
                        <div className="bg-[#f1f1f1] p-3 sm:p-4 lg:p-5">
                            <img
                                src={aboutImage}
                                alt="Timeless apparel collection"
                                className="h-[270px] w-full object-cover object-center sm:h-[390px] lg:h-[520px]"
                            />
                        </div>

                        <div className="px-1 sm:px-2 lg:px-0">
                            <p className="text-[0.8rem] uppercase tracking-[0.08em] text-slate-600">
                                About Timeless Fashion
                            </p>

                            <h2 className="mt-5 font-serif text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.05] tracking-[0.01em] text-zinc-900">
                                Fashion Designed Around Identity,
                                <span className="block">Creativity & Comfort</span>
                            </h2>

                            <p className="mt-6 max-w-[42ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.06rem]">
                                At Timeless Fashion, we create premium apparel designed for comfort,
                                individuality, and everyday style. With a focus on quality craftsmanship
                                and modern customization, every piece is made to help you express your
                                identity with confidence.
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
