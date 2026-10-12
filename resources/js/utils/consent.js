const CONSENT_STORAGE_KEY = 'cookie-consent-v1';

// 'accepted' | 'declined' | null (not yet decided)
export function getStoredConsent() {
    try {
        const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        return value === 'accepted' || value === 'declined' ? value : null;
    } catch {
        return null;
    }
}

export function setStoredConsent(value) {
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
        // Ignore persistence failures - banner will just reappear next visit.
    }
}

export function hasAnalyticsConsent() {
    return getStoredConsent() === 'accepted';
}
