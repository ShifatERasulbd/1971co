import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { timelessFontClass } from '../utils/typography';

export default function TogetherWeGrowHeroSection() {
    return (
        <section className={`${timelessFontClass} bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20`}>
            <div className="mx-auto w-full max-w-[1920px]">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-black">
                    Together We Grow
                </p>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                    <h1 className="max-w-[1200px] text-[2.5rem] font-black uppercase leading-[1] tracking-[-0.02em] text-black sm:text-[3.2rem] lg:col-span-12 lg:text-[6.5rem]">
                        $0.50 FROM EVERY PURCHASE YOU MAKE<br />
                        SUPPORTS <em className="italic">GARMENT'S WORKERS' CHILDREN</em>
                    </h1>

                    <div className="max-w-[700px] pb-2 lg:col-start-8 lg:col-span-5 lg:ml-auto lg:max-w-[560px]">
                        <p className="text-[0.95rem] leading-[1.8] text-zinc-600">
                            Every purchase makes a difference. We donate <strong className="font-semibold text-black">$0.50 from every order</strong> to support
                            workers' children in our community — helping create brighter futures through care, education, and
                            opportunity.
                        </p>

                        <Link
                            to="/shop"
                            className="mt-8 inline-flex items-center gap-3 bg-black px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-zinc-800"
                        >
                            Let's Make a Purchase
                            <div className="flex size-4 items-center justify-center bg-white text-black">
                                <ArrowRight className="size-3" strokeWidth={3} />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}