import { useEffect, useState } from 'react';

import { getStoredConsent, setStoredConsent } from '../../utils/consent.js';

export default function CookieConsentBanner({ onDecision }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(getStoredConsent() === null);
    }, []);

    function decide(value) {
        setStoredConsent(value);
        setIsVisible(false);
        onDecision?.(value);
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-[999] border-t border-zinc-200 bg-white/95 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:px-8">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.85rem] text-zinc-700">
                   We use cookies to improve your experience. You can manage your cookie preferences at any time.
                </p>
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={() => decide('declined')}
                        className="h-9 border border-zinc-300 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                        Decline
                    </button>
                    <button
                        type="button"
                        onClick={() => decide('accepted')}
                        className="h-9 bg-zinc-900 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-black"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
