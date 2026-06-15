const givingBackImage = '/uploads/heroes/images/hero1.webp';

export default function GivingBackSection() {
    return (
        <section className="bg-white py-14 sm:py-16 lg:py-24">
            <div className="mx-auto w-full max-w-[1540px] px-5 sm:px-8 lg:px-12">
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                    {/* Left Image */}
                    <div className="flex justify-center">
                        <div className="bg-[#e8e8e8] p-4 sm:p-6 lg:p-8">
                            <img
                                src={givingBackImage}
                                alt="1971Co. community giving back initiative"
                                className="h-[400px] w-full object-cover object-center sm:h-[480px] lg:h-[560px]"
                            />
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="px-1 sm:px-2 lg:px-0">
                        <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[#8b7355]">
                            Giving Back
                        </p>

                        <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.1] tracking-[0.02em] text-zinc-900">
                            Roots Run Deep.
                        </h2>

                        <div className="mt-8 space-y-5 text-[0.95rem] leading-[1.7] text-slate-700 sm:text-[1rem]">
                            <p>
                                Every 1971Co garment is crafted in Bangladesh—the birthplace of our heritage and the heart of our production. But our commitment goes beyond manufacturing.
                            </p>

                            <p>
                                We actively support community centers across Bangladesh, providing resources for education, skills training, and youth development programs. These centers serve as hubs for local communities, offering opportunities for growth and empowerment.
                            </p>

                            <p>
                                When you wear 1971Co, you're not just wearing quality streetwear. You're supporting the communities that make our vision possible. Every purchase contributes to building stronger, more vibrant communities back home.
                            </p>
                        </div>

                        <div className="mt-8 space-y-3 text-[0.95rem] font-medium text-zinc-900">
                            <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-900" />
                                <span>Education Programs</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-900" />
                                <span>Skills Training</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-900" />
                                <span>Youth Development</span>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
