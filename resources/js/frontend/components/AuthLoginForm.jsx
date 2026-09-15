import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';

const AUTH_USER_STORAGE_KEY = 'backend-auth-user-v1';

function cacheBackendUser(user) {
    try {
        if (user && typeof user === 'object') {
            sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
        }
    } catch {
        // Ignore cache failures.
    }
}

function readCookie(name) {
    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

export default function AuthLoginForm() {
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [form, setForm] = useState({ email: '', otp: '', remember: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [showForgotForm, setShowForgotForm] = useState(false);
    
    // Resend countdown state (60 seconds)
    const [resendCountdown, setResendCountdown] = useState(0);

    // Forgot password state
    const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotResetUrl, setForgotResetUrl] = useState('');

    // Handle countdown interval
    useEffect(() => {
        let timer;
        if (resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCountdown]);

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

    // Step 1: Request OTP code to be sent to email
    async function handleRequestOtp(event) {
        if (event) event.preventDefault();
        setErrorMessage('');
        setInfoMessage('');
        setIsSubmitting(true);

        try {
            const headers = await getCsrfAndHeaders();

            const response = await fetch('/api/login/send-otp', {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({
                    email: form.email.trim(),
                    remember: form.remember,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(payload?.message || 'Unable to send OTP. Please check your email.');
                return;
            }

            setInfoMessage(payload?.message || `Verification code sent to ${form.email}`);
            setStep('otp');
            setResendCountdown(60); // Start 60 seconds countdown
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Step 2: Verify OTP code and finish login
    async function handleVerifyOtp(event) {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const headers = await getCsrfAndHeaders();

            const response = await fetch('/api/login/verify-otp', {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({
                    email: form.email.trim(),
                    otp: form.otp.trim(),
                    remember: form.remember,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setErrorMessage(payload?.message || 'Invalid or expired OTP code.');
                return;
            }

            cacheBackendUser(payload?.user);
            window.location.assign('/user/dashboard');
        } catch {
            setErrorMessage('Unable to verify code right now. Please try again.');
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

            cacheBackendUser(payload?.user);
            window.location.assign('/user/dashboard');
        } catch {
            setErrorMessage('Unable to complete Google login. Please try again.');
        } finally {
            setIsGoogleSubmitting(false);
        }
    }

    function handleGoogleError() {
        setErrorMessage('Google login was cancelled or failed. Please try again.');
    }

    // Handler to switch view when user clicks forgot password
    function handleForgotClick(event) {
        event.preventDefault();
        setErrorMessage('');
        setForgotEmail(form.email); // Pre-fill with entered email if any
        setShowForgotForm(true);
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

    // Step 2 UI: OTP verification input view
    if (step === 'otp') {
        return (
            <form className="mt-5 space-y-3" onSubmit={handleVerifyOtp}>
                <div>
                    <label className="text-[0.9rem] font-semibold text-zinc-900">Verification Code (OTP)</label>
                    <p className="text-xs text-slate-500 mt-0.5">Code sent to <strong>{form.email}</strong></p>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.otp}
                        onChange={(event) => updateField('otp', event.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="mt-2 h-11 w-full border border-zinc-200 bg-[#ebeff4] px-3.5 text-center text-lg tracking-[0.4em] font-mono text-zinc-900 outline-none transition-colors placeholder:text-slate-400 focus:border-zinc-900"
                        required
                    />
                </div>

                {infoMessage ? <p className="text-sm text-emerald-700">{infoMessage}</p> : null}
                {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting || form.otp.length < 4}
                    className="inline-flex h-11 w-full items-center justify-center bg-black px-5 text-[0.86rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Verifying...' : 'Verify & Log In'}
                </button>

                <div className="flex items-center justify-between pt-1 text-[0.88rem]">
                    <button
                        type="button"
                        onClick={() => {
                            setStep('email');
                            setErrorMessage('');
                            setInfoMessage('');
                        }}
                        className="text-slate-500 underline underline-offset-2 transition-colors hover:text-zinc-800"
                    >
                        Change email
                    </button>
                    <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSubmitting || resendCountdown > 0}
                        className="text-slate-500 underline underline-offset-2 transition-colors hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                    >
                        {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend code'}
                    </button>
                </div>
            </form>
        );
    }

    // Step 1 UI: Email input view
    return (
        <form className="mt-5 space-y-3" onSubmit={handleRequestOtp}>
            <div>
                <div className="flex items-center justify-between">
                    <label className="text-[0.9rem] font-semibold text-zinc-900">Email</label>
                    <button
                        type="button"
                        onClick={handleForgotClick}
                        className="text-[0.82rem] text-slate-500 underline underline-offset-2 transition-colors hover:text-zinc-900"
                    >
                        Forgot password?
                    </button>
                </div>
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="Example@email.com"
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

            {infoMessage ? <p className="text-sm text-emerald-700">{infoMessage}</p> : null}
            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="inline-flex h-11 w-full items-center justify-center bg-black px-5 text-[0.86rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Sending Code...' : 'Send Login Code'}
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

            
        </form>
    );
}