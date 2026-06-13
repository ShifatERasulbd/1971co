import { Link } from 'react-router-dom';

import { timelessFontClass } from '../../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

const storyImage = '/uploads/heroes/images/hero1.webp';

export default function OurStorySection() {
    return (
        <section className={`${timelessFontClass} w-full overflow-hidden`}>
            <div className="grid min-h-[580px] grid-cols-1 lg:grid-cols-2">

                {/* Left — product image */}
                <div className="relative min-h-[380px] lg:min-h-0">
                    <img
                        src={storyImage}
                        alt="1971Co — our story"
                        className="absolute inset-0 h-full w-full object-cover object-[40%_20%]"
                    />
                </div>

                {/* Right — story copy */}
                <div className="flex items-center bg-[#c8b89a] px-10 py-14 sm:px-14 lg:px-20 xl:px-28">
                    <div className="max-w-[480px]">

                        {/* Brand logo lockup */}
                        <div className="mb-5 flex items-baseline gap-0.5 text-zinc-900">
                            <span className="text-[2rem] font-black leading-none tracking-[-0.02em]">
                                1971
                            </span>
                            <span className="text-[1.55rem] font-light leading-none tracking-[-0.01em]">
                                Co.
                            </span>
                        </div>

                        {/* Label */}
                        <p className={`mb-3 ${sectionTypography.sectionMetaLink} font-semibold text-zinc-700`}>
                            Our Story
                        </p>

                        {/* Headline */}
                        <h2 className="text-[2.1rem] font-black uppercase leading-[0.95] tracking-[-0.01em] text-zinc-900 sm:text-[2.6rem] lg:text-[3rem]">
                            Heritage,
                            <br />
                            Refined.
                        </h2>

                        {/* Body */}
                        <p className={`mt-6 max-w-[380px] ${sectionTypography.description} text-zinc-800/80`}>
                            1971Co blends cultural identity with modern streetwear discipline —
                            built to feel confident without shouting. Our pieces are designed
                            for those who value restraint over noise, quality over quantity.
                        </p>

                        {/* CTA */}
                        <Link
                            to="/about"
                            className="mt-8 inline-flex items-center gap-2 text-[0.8rem] font-medium tracking-[0.04em] text-zinc-900 underline-offset-4 transition-opacity hover:opacity-60"
                        >
                            About 1971Co
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
