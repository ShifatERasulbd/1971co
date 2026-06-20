import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

function readCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

export default function ResetPasswordPage() {
    const { token = '' } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

    const [form, setForm] = useState({
        email: initialEmail,
        password: '',
        password_confirmation: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function getCsrfHeaders() {
        await fetch('/sanctum/csrf-cookie', {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const xsrfToken = readCookie('XSRF-TOKEN');

        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const headers = await getCsrfHeaders();
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({
                    token,
                    email: form.email.trim(),
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const firstValidationError = payload?.errors
                    ? Object.values(payload.errors)?.[0]?.[0]
                    : null;
                setErrorMessage(firstValidationError || payload?.message || 'Unable to reset password.');
                return;
            }

            setMessage(payload?.message || 'Password reset successful. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1200);
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="bg-[#f5f5f3] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="mx-auto w-full max-w-[680px] bg-white p-7 shadow-sm sm:p-10">
                <h1 className="font-serif text-[2rem] uppercase tracking-[0.03em] text-zinc-900 sm:text-[2.4rem]">
                    Reset Password
                </h1>
                <p className="mt-2 text-[0.95rem] text-zinc-500">
                    Enter your email and a new password to complete your reset.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="text-[0.9rem] font-semibold text-zinc-900">Email</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            className="mt-2 h-12 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-zinc-900 outline-none focus:border-zinc-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[0.9rem] font-semibold text-zinc-900">New Password</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(event) => updateField('password', event.target.value)}
                            className="mt-2 h-12 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-zinc-900 outline-none focus:border-zinc-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[0.9rem] font-semibold text-zinc-900">Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={form.password_confirmation}
                            onChange={(event) => updateField('password_confirmation', event.target.value)}
                            className="mt-2 h-12 w-full border border-zinc-200 bg-[#ebeff4] px-4 text-zinc-900 outline-none focus:border-zinc-900"
                            required
                        />
                    </div>

                    {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
                    {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-[0.9rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <Link to="/login" className="text-[0.92rem] text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
                        Back to login
                    </Link>
                </div>
            </div>
        </section>
    );
}
