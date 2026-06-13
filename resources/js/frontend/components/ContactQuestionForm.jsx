export default function ContactQuestionForm() {
    return (
        <div>
            <h2 className="font-serif text-[1.9rem] uppercase tracking-[0.02em] text-zinc-900 sm:text-[2.2rem]">
                Got Any Questions?
            </h2>

            <p className="mt-10 max-w-[32rem] text-[0.98rem] leading-7 text-zinc-500">
                Use the form below to get in touch with the sales team
            </p>

            <form className="mt-8 space-y-4">
                <input
                    type="text"
                    placeholder="Your name"
                    className="h-12 w-full border border-zinc-200 bg-white px-4 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                />
                <input
                    type="email"
                    placeholder="Your email"
                    className="h-12 w-full border border-zinc-200 bg-white px-4 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                />
                <input
                    type="text"
                    placeholder="Subject"
                    className="h-12 w-full border border-zinc-200 bg-white px-4 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                />
                <textarea
                    placeholder="Your message"
                    rows={6}
                    className="w-full border border-zinc-200 bg-white px-4 py-4 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                />

                <button
                    type="submit"
                    className="inline-flex min-w-[150px] items-center justify-center bg-black px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
                >
                    Send Message
                </button>
            </form>
        </div>
    );
}
