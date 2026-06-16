import { useState } from 'react';
import { Link } from 'react-router-dom';

function readCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

export default function AuthLoginForm() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const xsrfToken = readCookie('XSRF-TOKEN');

            const response = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                },
                body: JSON.stringify({
                    email: form.email.trim(),
                    password: form.password,
                    remember: form.remember,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(payload?.message || 'Invalid credentials.');
                return;
            }

            window.location.assign('/admin/dashboard');
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="Example@email.com"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Password <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="Your Password"
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />
            </div>

            <label className="inline-flex items-center gap-2 text-[0.95rem] text-zinc-700">
                <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(event) => updateField('remember', event.target.checked)}
                    className="size-4 border-zinc-300"
                />
                <span>Remember me</span>
            </label>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Logging in...' : 'Log In'}
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
