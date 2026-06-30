import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { timelessFontClass } from '../utils/typography';

export default function TogetherWeGrowHeroSection({ sectionData }) {
    const contentTitle = sectionData?.contentTitle || 'Together We Grow';
    const heading = sectionData?.heading || '$0.50 \'S WORKERS\' CHILDREN';
    const description = sectionData?.sectionDescription || 'Every purchase makes a difference. We donate $0.50 from every order to support workers\' children in our community — helping create brighter futures through care, education, and opportunity.';
    const buttonText = sectionData?.buttonText || 'Let\'s Make a Purchase';
    const buttonUrl = sectionData?.buttonUrl || '/shop';

    return (
        <section className={`${timelessFontClass} bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20`}>
            <div className="mx-auto w-full max-w-[1920px]">
                <p className="font-monstrate text-[1.2rem]  uppercase tracking-[0.25em] text-black">
                    {contentTitle}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                    <h1 className="max-w-[1100px] text-[2rem] font-black uppercase leading-[1.02] tracking-[-0.02em] text-black sm:text-[2.7rem] lg:col-span-12 lg:text-[5.2rem]">
                        {heading.split('\n').map((line, index) => (
                            <div key={index}>
                                {line.trim().startsWith('$0.50') ? (
                                    <>
                                        <span className="text-[2.5rem] sm:text-[3.2rem] lg:text-[6.5rem]">$0.50</span>
                                        {line.replace(/^\$0\.50/i, '')}
                                    </>
                                ) : line}
                                {index === 0 && heading.split('\n').length > 1 && <br />}
                            </div>
                        ))}
                    </h1>

                    <div className="max-w-[700px] pb-2 lg:col-start-8 lg:col-span-5 lg:ml-auto lg:max-w-[560px]">
                        <p className="font-monstrate text-[0.95rem] leading-[1.8] text-zinc-600">
                            {description}
                        </p>

                        <Link
                            to={buttonUrl}
                            className="mt-8 inline-flex items-center gap-3 bg-black px-6 py-4 text-[1.2rem] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-zinc-800"
                        >
                            {buttonText}
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