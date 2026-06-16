import { useState } from 'react';
import { Link } from 'react-router-dom';

function readCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

export default function AuthRegisterForm() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });
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

            const response = await fetch('/api/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                },
                body: JSON.stringify({
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    password_confirmation: form.password,
                }),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                setErrorMessage(payload?.message || 'Registration failed. Please check your details and try again.');
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
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-[0.96rem] font-semibold text-zinc-900">
                        First name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.first_name}
                        onChange={(event) => updateField('first_name', event.target.value)}
                        placeholder="First Name"
                        className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                        required
                    />
                </div>
                <div>
                    <label className="text-[0.96rem] font-semibold text-zinc-900">
                        Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.last_name}
                        onChange={(event) => updateField('last_name', event.target.value)}
                        placeholder="Last name"
                        className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="text-[0.96rem] font-semibold text-zinc-900">
                    Email address <span className="text-red-500">*</span>
                </label>
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
                    placeholder="At least 8 characters"
                    minLength={8}
                    className="mt-2 h-14 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-[1.05rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />
            </div>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Registering...' : 'Register'}
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
