import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { timelessFontClass } from '../utils/typography';

const POLICY_CONFIG = {
    '/shipping': {
        title: 'Shipping & Returns',
        field: 'shipping_and_return',
        fallback: 'Shipping and return information is currently unavailable.',
    },
    '/privacy': {
        title: 'Privacy Policy',
        field: 'privacy_policy',
        fallback: 'Privacy policy information is currently unavailable.',
    },
    '/terms': {
        title: 'Terms & Conditions',
        field: 'terms_and_conditions',
        fallback: 'Terms and conditions are currently unavailable.',
    },
};

function normalizePath(pathname) {
    if (typeof pathname !== 'string') {
        return '/shipping';
    }

    const lower = pathname.toLowerCase();
    if (lower === '/privacy') {
        return '/privacy';
    }

    if (lower === '/terms') {
        return '/terms';
    }

    return '/shipping';
}

export default function CompliancePolicyPage() {
    const { pathname } = useLocation();
    const pathKey = normalizePath(pathname);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const config = useMemo(() => POLICY_CONFIG[pathKey], [pathKey]);

    useEffect(() => {
        let ignore = false;

        async function loadCompliance() {
            setIsLoading(true);
            setError('');

            try {
                const response = await fetch('/api/public/compliance', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(payload?.message || 'Failed to load compliance content.');
                }

                if (!ignore) {
                    setData(payload && typeof payload === 'object' ? payload : {});
                }
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError?.message || 'Failed to load compliance content.');
                    setData({});
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCompliance();

        return () => {
            ignore = true;
        };
    }, []);

    const content = typeof data?.[config.field] === 'string' ? data[config.field].trim() : '';

    return (
        <section className={`${timelessFontClass} bg-white text-zinc-900`}>
            <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
                <header className="mb-8 border-b border-zinc-200 pb-5">
                    <h1 className="font-monstrate text-2xl font-semibold uppercase tracking-[0.12em] text-zinc-900 sm:text-3xl">
                        {config.title}
                    </h1>
                </header>

                {isLoading ? (
                    <p className="text-sm text-zinc-500">Loading content...</p>
                ) : null}

                {!isLoading && error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : null}

                {!isLoading && !error ? (
                    content ? (
                        <article
                            className="prose prose-zinc max-w-none text-zinc-700"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <p className="text-sm text-zinc-500">{config.fallback}</p>
                    )
                ) : null}
            </div>
        </section>
    );
}
