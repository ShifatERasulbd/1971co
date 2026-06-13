const avatarImage = '/uploads/heroes/images/hero1.webp';

export default function TestimonialSection() {
    return (
        <section className="bg-white py-14 sm:py-16 lg:py-20">
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <div className="bg-[#dfdfdf] px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
                    <article className="mx-auto flex max-w-[980px] flex-col items-center text-center">
                        <img
                            src={avatarImage}
                            alt="Client testimonial avatar"
                            className="h-22 w-22 rounded-full object-cover object-center shadow-[0_10px_28px_rgba(0,0,0,0.22)] sm:h-24 sm:w-24"
                        />

                        {/* Minimized text sizing to a premium, scalable size */}
                        <blockquote className="mt-6 max-w-[760px] font-serif text-[clamp(1.25rem,2vw,1.75rem)] italic leading-[1.5] tracking-[0.01em] text-slate-700 sm:mt-8">
                            "Timeless Fashion delivered exactly what our company needed. The quality,
                            customization, and overall professionalism exceeded our expectations. Our team
                            loved the comfort and modern look of the apparel."
                        </blockquote>

                        {/* Minimized author signature to match modern minimal layouts */}
                        <p className="mt-5 text-sm font-medium uppercase tracking-wider text-slate-600 sm:text-base">
                            James Walker, <span className="text-slate-500 font-normal capitalize">Startup Founder</span>
                        </p>

                        <div className="mt-6 inline-flex items-center gap-3" aria-label="Testimonial pagination">
                            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-500">
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                            </span>
                            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}