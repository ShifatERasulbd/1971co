// Reads the choices saved by CookiePreferencesModal.
// Keys and event name must match the modal.
export const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
export const COOKIE_PREFERENCES_EVENT = 'cookie-preferences-updated';

// Used until the visitor saves a choice: every category starts ON.
const DEFAULT_CONSENT = { targeting: true, performance: true, social: true, functional: true };

// Category -> what it controls:
//   targeting   -> GTM + GA4
//   social      -> Meta (Facebook) Pixel
//   performance -> Microsoft Clarity
export function getConsent() {
    try {
        const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (!raw) {
            return { ...DEFAULT_CONSENT };
        }
        const saved = JSON.parse(raw);
        return {
            targeting: Boolean(saved?.targeting),
            performance: Boolean(saved?.performance),
            social: Boolean(saved?.social),
            functional: Boolean(saved?.functional),
        };
    } catch {
        return { ...DEFAULT_CONSENT };
    }
}

export function hasConsent(category) {
    if (typeof window === 'undefined') {
        return false;
    }
    return Boolean(getConsent()[category]);
}

// Fires when the modal saves (same tab) or when another tab changes the choices.
export function onConsentChange(callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
        return () => {};
    }

    const handleCustom = () => callback(getConsent());
    const handleStorage = (event) => {
        if (event.key === COOKIE_PREFERENCES_KEY) {
            callback(getConsent());
        }
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, handleCustom);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener(COOKIE_PREFERENCES_EVENT, handleCustom);
        window.removeEventListener('storage', handleStorage);
    };
}

// Removes cookies by exact name or prefix, on the current host and its parent domains.
export function deleteCookies({ names = [], prefixes = [] } = {}) {
    if (typeof document === 'undefined') {
        return;
    }

    const host = window.location.hostname;
    const parts = host.split('.');
    const domains = ['', host, `.${host}`];
    for (let i = 1; i < parts.length - 1; i += 1) {
        domains.push(`.${parts.slice(i).join('.')}`);
    }

    const existing = document.cookie
        .split('; ')
        .map((cookie) => cookie.split('=')[0])
        .filter(Boolean);

    existing
        .filter((name) => names.includes(name) || prefixes.some((prefix) => name.startsWith(prefix)))
        .forEach((name) => {
            domains.forEach((domain) => {
                const domainPart = domain ? `; domain=${domain}` : '';
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
            });
        });
}

// --- Legacy API (old accept/decline banner). Kept so existing imports don't break. ---
const LEGACY_CONSENT_KEY = 'cookie-consent-v1';

export function getStoredConsent() {
    try {
        const value = window.localStorage.getItem(LEGACY_CONSENT_KEY);
        return value === 'accepted' || value === 'declined' ? value : null;
    } catch {
        return null;
    }
}

export function setStoredConsent(value) {
    try {
        window.localStorage.setItem(LEGACY_CONSENT_KEY, value);
    } catch {
        // Ignore persistence failures.
    }
}

export function hasAnalyticsConsent() {
    return hasConsent('targeting');
}