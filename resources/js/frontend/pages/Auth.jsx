import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocation } from 'react-router-dom';

import SectionSkeleton from '../components/SectionSkeleton.jsx';
import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';

const AuthLoginForm = lazy(() => import('../components/AuthLoginForm.jsx'));
const AuthRegisterForm = lazy(() => import('../components/AuthRegisterForm.jsx'));

const fallbackShowcaseImage = '';

function resolveGoogleClientId() {
    const fromVite = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
    if (fromVite) {
        return fromVite;
    }

    if (typeof document !== 'undefined') {
        const fromMeta = document
            .querySelector('meta[name="google-client-id"]')
            ?.getAttribute('content');

        if (typeof fromMeta === 'string' && fromMeta.trim()) {
            return fromMeta.trim();
        }
    }

    return '';
}

export default function AuthPage() {
    const location = useLocation();
    const isRegister = location.pathname.toLowerCase() === '/register';
    const swapSides = false;
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload() || {});

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSiteSettings(payload || {});
        });

        setSiteSettings(getSettingsPayload() || {});

        return unsubscribe;
    }, []);

    const authShowcaseImage = useMemo(() => {
        const raw = String(siteSettings?.shop_menu_image || '').trim();
        if (!raw) {
            return fallbackShowcaseImage;
        }

        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }

        return `/${raw.replace(/^\/+/, '')}`;
    }, [siteSettings]);

    const googleClientId = useMemo(() => resolveGoogleClientId(), []);

    if (!googleClientId) {
        return (
            <section className="bg-[#f5f5f3] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
                <div className="mx-auto w-full max-w-[760px] border border-amber-300 bg-amber-50 px-6 py-5 text-amber-900">
                    Google login is temporarily unavailable because the Google client ID is not configured.
                </div>
            </section>
        );
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
        <section className="bg-[#f5f5f3] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="mx-auto grid w-full max-w-[1500px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
                <div
                    className={`mx-auto w-full max-w-[560px] transition-all duration-500 ease-out lg:will-change-transform ${
                        swapSides ? 'lg:order-2 lg:translate-x-8' : 'lg:order-1 lg:translate-x-0'
                    }`}
                >
                    <h1 className="font-serif text-[2rem] uppercase tracking-[0.02em] text-zinc-900 sm:text-[2.4rem]">
                        {isRegister ? 'Create Account' : 'Login'}
                    </h1>

                    <Suspense fallback={<SectionSkeleton heightClass="h-[540px]" className="px-0 py-2" variant="form" />}>
                        {isRegister ? <AuthRegisterForm /> : <AuthLoginForm />}
                    </Suspense>
                </div>

                <div
                    className={`mx-auto w-full max-w-[780px] border-[16px] border-zinc-200 bg-zinc-200 transition-all duration-500 ease-out lg:will-change-transform ${
                        swapSides ? 'lg:order-1 lg:-translate-x-6' : 'lg:order-2 lg:translate-x-0'
                    }`}
                >
                    <img
                        src={authShowcaseImage}
                        alt="Timeless apparel showcase"
                        className="h-[300px] w-full object-cover object-center sm:h-[420px] lg:h-[560px]"
                    />
                </div>
            </div>
        </section>
        </GoogleOAuthProvider>
    );
}
