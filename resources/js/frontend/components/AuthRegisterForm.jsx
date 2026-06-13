import { Link } from 'react-router-dom';

function NormalRegisterFields() {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-[0.96rem] font-semibold text-zinc-900">
                        First name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="First Name"
                        className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    />
                </div>
                <div>
                    <label className="text-[0.96rem] font-semibold text-zinc-900">
                        Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Last name"
                        className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    />
                </div>
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Email address <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="Example@email.com"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>
        </>
    );
}

function CorporateRegisterFields() {
    return (
        <>
            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Company name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="Company name"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Company email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="Example@email.com"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Tax ID / Registration number <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Company address <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={3}
                    className="mt-2 w-full border border-zinc-200 bg-[#ebeff4] px-4 py-3 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Company phone <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>
        </>
    );
}

export default function AuthRegisterForm({ userType }) {
    const isCorporate = userType === 'corporate';

    return (
        <form className="mt-7 space-y-4">
            {isCorporate ? <CorporateRegisterFields /> : <NormalRegisterFields />}

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Password <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    placeholder="At least 8 characters"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Confirm password <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    placeholder="At least 8 characters"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-zinc-800"
            >
                Register
            </button>

            <div className="border-t border-zinc-200 pt-5 text-center">
                <p className="text-[0.95rem] text-slate-500">Already have an account?</p>
                <Link
                    to="/login"
                    className="mt-4 inline-flex h-12 items-center justify-center border border-zinc-500 px-12 text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                >
                    Login
                </Link>
            </div>
        </form>
    );
}
