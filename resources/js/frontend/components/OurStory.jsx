const aboutImage = '/uploads/heroes/images/hero1.webp';

export default function TimelessAboutSection() {
    return (
        // Changed outer wrapper to pure white
        <section className="bg-white py-14 sm:py-16 lg:py-20">
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                {/* Changed inner marked container to a clear gray background */}
                <div className="bg-[#ececec] px-5 py-6 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
                    <article className="grid items-center gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-14 xl:gap-20">
                        
                        <div className="px-1 sm:px-2 lg:px-0">
                           

                            <h2 className="mt-5 font-serif text-[clamp(2rem,3.8vw,3.4rem)] leading-[1.05] tracking-[0.01em] text-zinc-900">
                                 Our Story
                               
                            </h2>

                            <p className="mt-6 max-w-[42ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.06rem]">
                                Timeless Fashion was built with a vision to combine quality craftsmanship with modern personalization. What started as a passion for premium apparel evolved into a brand focused on helping individuals, teams, and businesses express themselves through fashion.
                            </p>
                            <p className="mt-4 max-w-[42ch] text-[1rem] leading-8 text-slate-600 sm:text-[1.06rem]">
                                From custom corporate wear to personalized everyday essentials, we focus on creating pieces that feel comfortable, meaningful, and uniquely yours.
                            </p>
                        </div>

                        {/* Kept image outer frame bright white/light gray to pop out from the container */}
                        <div className="bg-white p-3 sm:p-4 lg:p-5">
                            <img
                                src={aboutImage}
                                alt="Timeless apparel collection"
                                className="h-[270px] w-full object-cover object-center sm:h-[390px] lg:h-[520px]"
                            />
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}