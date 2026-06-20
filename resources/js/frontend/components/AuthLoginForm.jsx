import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
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
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotResetUrl, setForgotResetUrl] = useState('');
    const [showForgotForm, setShowForgotForm] = useState(false);

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function getCsrfAndHeaders() {
        await fetch('/sanctum/csrf-cookie', {
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const headers = await getCsrfAndHeaders();

            const response = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers,
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

    async function handleGoogleSuccess(credentialResponse) {
        setErrorMessage('');
        setIsGoogleSubmitting(true);

        try {
            const headers = await getCsrfAndHeaders();

            const response = await fetch('/api/auth/google/callback', {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(payload?.message || 'Google login failed. Please try again.');
                return;
            }

            window.location.assign('/admin/dashboard');
        } catch {
            setErrorMessage('Unable to complete Google login. Please try again.');
        } finally {
            setIsGoogleSubmitting(false);
        }
    }

    function handleGoogleError() {
        setErrorMessage('Google login was cancelled or failed. Please try again.');
    }

    async function handleForgotPassword(event) {
        event.preventDefault();
        setErrorMessage('');
        setForgotMessage('');
        setForgotResetUrl('');
        setIsForgotSubmitting(true);

        try {
            const headers = await getCsrfAndHeaders();
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({ email: forgotEmail.trim() }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(payload?.message || 'Unable to send reset link.');
                return;
            }

            setForgotMessage(payload?.message || 'Password reset link sent to your email.');
            setForgotResetUrl(payload?.reset_url || '');
        } catch {
            setErrorMessage('Unable to send reset link right now. Please try again.');
        } finally {
            setIsForgotSubmitting(false);
        }
    }

    if (showForgotForm) {
        return (
            <form className="mt-5 space-y-3" onSubmit={handleForgotPassword}>
                <label className="block text-[0.9rem] font-semibold text-zinc-900">Send reset link to email</label>
                <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full border border-zinc-200 bg-[#ebeff4] px-3.5 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />

                {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
                {forgotMessage ? <p className="text-sm text-emerald-700">{forgotMessage}</p> : null}
                {forgotResetUrl ? (
                    <p className="text-sm text-zinc-700">
                        Local reset link:{' '}
                        <a href={forgotResetUrl} className="underline underline-offset-2" target="_self" rel="noreferrer">
                            Open reset page
                        </a>
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center bg-black px-5 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setShowForgotForm(false);
                        setErrorMessage('');
                        setForgotMessage('');
                    }}
                    className="text-[0.88rem] text-slate-500 underline underline-offset-2 transition-colors hover:text-zinc-800"
                >
                    Back to login
                </button>
            </form>
        );
    }

    return (
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <div>
                <label className="text-[0.9rem] font-semibold text-zinc-900">Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="Example@email.com"
                    className="mt-1.5 h-11 w-full border border-zinc-200 bg-[#ebeff4] px-3.5 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />
            </div>

            <div>
                <label className="text-[0.9rem] font-semibold text-zinc-900">
                    Password <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="Your Password"
                    className="mt-1.5 h-11 w-full border border-zinc-200 bg-[#ebeff4] px-3.5 text-[0.95rem] text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                    required
                />
            </div>

            <label className="inline-flex items-center gap-2 text-[0.88rem] text-zinc-700">
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
                disabled={isSubmitting || isGoogleSubmitting}
                className="inline-flex h-11 w-full items-center justify-center bg-black px-5 text-[0.86rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>

            <div className="relative flex items-center gap-3 py-0.5">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-[0.8rem] uppercase tracking-[0.1em] text-zinc-400">or</span>
                <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className={`flex w-full justify-center transition-opacity ${isGoogleSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="100%"
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                />
            </div>

            <button
                type="button"
                onClick={() => {
                    setShowForgotForm(true);
                    setErrorMessage('');
                    setForgotMessage('');
                }}
                className="pt-1.5 text-center text-[0.88rem] text-slate-500 underline underline-offset-2 transition-colors hover:text-zinc-800"
            >
                Lost your password?
            </button>

            <div className="border-t border-zinc-200 pt-3.5 text-center">
                <p className="text-[0.88rem] text-slate-500">Don&apos;t have an account?</p>
                <Link
                    to="/register"
                    className="mt-3 inline-flex h-10 items-center justify-center border border-zinc-500 px-7 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-zinc-800 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                >
                    Create Account
                </Link>
            </div>
        </form>
    );
}
