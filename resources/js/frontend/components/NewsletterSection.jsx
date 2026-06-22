import { ArrowRight } from 'lucide-react';

import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';

export default function NewsletterSection({ sectionData }) {
    return (
        <section className={`${timelessFontClass} bg-[#f0ede8] py-16 sm:py-20 lg:py-24`}>
            <div className="mx-auto w-full max-w-[640px] px-6 text-center sm:px-8">

                <h2 className={`${sectionTypography.sectionHeader} text-zinc-900 sm:text-[2.6rem]`}>
                    Get Early Access.
                </h2>

                <p className={`${sectionTypography.description} mt-4 text-zinc-500`}>
                    Drops. Restocks. No noise.
                </p>

                <form
                    className="mt-8 flex items-stretch"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label htmlFor="newsletter-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Email address"
                        required
                        className="h-12 flex-1 border-b border-zinc-400 bg-transparent px-1 text-[0.9rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                    />
                    <button
                        type="submit"
                        aria-label="Subscribe"
                        className="flex size-12 flex-none items-center justify-center bg-zinc-900 text-white transition-colors hover:bg-zinc-700"
                    >
                        <ArrowRight className="size-4" strokeWidth={2} />
                    </button>
                </form>

            </div>
        </section>
    );
}
