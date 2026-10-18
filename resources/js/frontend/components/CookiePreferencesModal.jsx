import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

// Shown (and applied) until the visitor saves a choice.
const DEFAULT_PREFS = { targeting: true, performance: true, social: true, functional: true };

// What "Reject All" saves.
const REJECT_PREFS = { targeting: false, performance: false, social: false, functional: false };

const FONT_FAMILY = "'Montserrat', ui-sans-serif, system-ui, sans-serif";
const FONT_LINK_ID = 'montserrat-font-link';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';

// Loads Montserrat once. Safe to keep even if you also load it in index.html.
function ensureMontserrat() {
    if (typeof document === 'undefined' || document.getElementById(FONT_LINK_ID)) {
        return;
    }
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
}

const categories = [
    {
        id: 'necessary',
        title: 'Essential Website Cookies',
        locked: true,
        description:
            'These cookies help our website work properly. They keep items in your shopping cart, help you stay securely logged in, and remember your cookie preferences. They are always active because they are necessary for the website to function.',
    },
    {
        id: 'targeting',
        title: 'Advertising & Measurement Cookies',
        description:
            'These cookies help us understand how you find our store. They may also help us show you products, special offers, and ads that match your interests.',
    },
    {
        id: 'performance',
        title: 'Performance & Experience Cookies',
        description:
            'These cookies help us understand how you use our website, such as which pages you visit and what you click on. This helps us fix problems, improve loading speed, and make your shopping experience easier.',
    },
    {
        id: 'social',
        title: 'Social Media & Sharing Cookies',
        description:
            'These cookies help social media features from platforms like Facebook and Instagram work on our website. They may also help us understand how you interact with our social media ads and whether those ads bring you to our store.',
    },
   
];

function readPreferences() {
    try {
        const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (!raw) {
            return DEFAULT_PREFS;
        }
        const saved = JSON.parse(raw);
        return {
            targeting: Boolean(saved?.targeting),
            performance: Boolean(saved?.performance),
            social: Boolean(saved?.social),
            functional: Boolean(saved?.functional),
        };
    } catch {
        return DEFAULT_PREFS;
    }
}

function Switch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                checked ? 'bg-zinc-900' : 'bg-zinc-500'
            }`}
        >
            <span
                className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

export default function CookiePreferencesModal({ isOpen, onClose, logoSrc = '' }) {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [openId, setOpenId] = useState(null);

    // Load saved choices each time the modal opens
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        ensureMontserrat();
        setPrefs(readPreferences());
        setOpenId(null);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const save = (next) => {
        const payload = { necessary: true, ...next, updatedAt: new Date().toISOString() };
        try {
            window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(payload));
        } catch {
            // Ignore storage errors (private mode, quota).
        }
        window.dispatchEvent(new CustomEvent('cookie-preferences-updated', { detail: payload }));
        toast.success('Your privacy choices have been saved.');
        onClose();
    };

    const allowAll = () => save({ targeting: true, performance: true, social: true, functional: true });
    const rejectAll = () => save(REJECT_PREFS);
    const confirmChoices = () => save(prefs);

    return createPortal(
        <div
            className="fixed inset-0 z-[1700] flex items-center justify-center bg-black/60 p-3 sm:p-6"
            style={{ fontFamily: FONT_FAMILY }}
            role="dialog"
            aria-modal="true"
            aria-label="Your privacy choices"
        >
            <button
                type="button"
                aria-label="Close privacy choices"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <div className="relative z-10 flex max-h-[92svh] w-full max-w-[600px] flex-col bg-white text-zinc-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    {logoSrc ? (
                        <img src={logoSrc} alt="1971Co" className="h-8 w-auto max-w-[200px] object-contain" />
                    ) : (
                        <span className="text-2xl font-semibold tracking-tight">1971Co.</span>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="inline-flex size-9 items-center justify-center text-zinc-700 transition-colors hover:text-black"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <h2 className="text-lg font-semibold">Your Privacy Choices</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-700">
                        We use cookies and similar tools on our websites to keep the site working, remember your
                        preferences, understand how visitors use the site, and show you relevant content. You can
                        choose which categories to allow and change your preferences at any time. Please see our{' '}
                        <a href="/privacy" className="underline">Privacy Policy</a> for more information about our
                        privacy practices.
                    </p>

                    <button
                        type="button"
                        onClick={allowAll}
                        className="mt-6 bg-[#2f2f2f] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                        Allow All
                    </button>

                    <h3 className="mb-4 mt-8 text-lg font-semibold">Manage Consent Preferences</h3>

                    {/* Accordion */}
                    <div className="border border-zinc-200">
                        {categories.map((category, index) => {
                            const isExpanded = openId === category.id;
                            const panelId = `cookie-panel-${category.id}`;

                            return (
                                <div
                                    key={category.id}
                                    className={index > 0 ? 'border-t border-zinc-200' : ''}
                                >
                                    <div className="flex items-center gap-2 pr-4">
                                        <button
                                            type="button"
                                            aria-expanded={isExpanded}
                                            aria-controls={panelId}
                                            onClick={() => setOpenId(isExpanded ? null : category.id)}
                                            className="flex flex-1 items-center gap-4 px-4 py-4 text-left"
                                        >
                                            {isExpanded ? (
                                                <Minus className="size-4 shrink-0 text-zinc-700" />
                                            ) : (
                                                <Plus className="size-4 shrink-0 text-zinc-700" />
                                            )}
                                            <span className="text-sm font-semibold">{category.title}</span>
                                        </button>

                                        {category.locked ? (
                                            <span className="shrink-0 text-sm font-semibold text-blue-600">
                                                Always Active
                                            </span>
                                        ) : (
                                            <Switch
                                                checked={prefs[category.id]}
                                                label={category.title}
                                                onChange={() =>
                                                    setPrefs((previous) => ({
                                                        ...previous,
                                                        [category.id]: !previous[category.id],
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>

                                    {isExpanded ? (
                                        <p id={panelId} className="px-4 pb-4 pl-12 text-sm leading-6 text-zinc-600">
                                            {category.description}
                                        </p>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={rejectAll}
                        className="bg-[#2f2f2f] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                        Reject All
                    </button>
                    <button
                        type="button"
                        onClick={confirmChoices}
                        className="bg-[#2f2f2f] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                        Confirm My Choices
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
