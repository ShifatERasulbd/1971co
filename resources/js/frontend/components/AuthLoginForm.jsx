import { Link } from 'react-router-dom';

export default function AuthLoginForm({ userType }) {
    const isCorporate = userType === 'corporate';

    return (
        <form className="mt-7 space-y-4">
            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    {isCorporate ? 'Company email address' : 'Email'}
                </label>
                <input
                    type="email"
                    placeholder="Example@email.com"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    {isCorporate ? 'Company password' : 'Password'} <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    placeholder={isCorporate ? 'At least 8 characters' : 'Your Password'}
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                />
            </div>

            <label className="inline-flex items-center gap-2 text-[0.95rem] text-zinc-700">
                <input type="checkbox" className="size-4 border-zinc-300" />
                <span>Remember me</span>
            </label>

            <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-zinc-800"
            >
                Log In
            </button>

            <p className="pt-3 text-center text-[0.95rem] text-slate-500">Lost your password?</p>

            <div className="border-t border-zinc-200 pt-5 text-center">
                <p className="text-[0.95rem] text-slate-500">Don&apos;t have an account?</p>
                <Link
                    to="/register"
                    className="mt-4 inline-flex h-12 items-center justify-center border border-zinc-500 px-8 text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                >
                    Create Account
                </Link>
            </div>
        </form>
    );
}
