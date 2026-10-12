import ReactGA from 'react-ga4';
import { toGaItem, getItemPrice, sumValue } from './dataLayer';
import { hasConsent } from './consent'; // CONSENT

let isInitialized = false;
let activeMeasurementId = ''; // CONSENT: needed for the ga-disable flag

// CONSENT: every tracking call goes through this check
function canTrack() {
    return isInitialized && hasConsent('targeting');
}

// CONSENT: official GA opt-out flag, stops all hits for this measurement ID
function setGaDisabled(disabled) {
    if (typeof window === 'undefined' || !activeMeasurementId) {
        return;
    }
    window[`ga-disable-${activeMeasurementId}`] = disabled;
}

export function initializeGoogleAnalytics(measurementId) {
    if (!measurementId || typeof measurementId !== 'string') {
        console.warn('Google Analytics: No measurement ID provided');
        return false;
    }

    if (isInitialized) {
        return true;
    }

    // CONSENT: do not load GA at all unless targeting is allowed
    if (!hasConsent('targeting')) {
        return false;
    }

    try {
        activeMeasurementId = measurementId;
        setGaDisabled(false);
        ReactGA.initialize(measurementId);
        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Google Analytics: Failed to initialize', error);
        return false;
    }
}

export function trackPageView(pathname) {
    if (!canTrack()) { // CONSENT
        return;
    }

    try {
        ReactGA.send({
            hitType: 'pageview',
            page: pathname,
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track page view', error);
    }
}

export function enableGoogleAnalytics() {
    if (!isInitialized) {
        return;
    }

    setGaDisabled(false); // CONSENT
    ReactGA.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
    });
}

export function disableGoogleAnalytics() {
    if (!isInitialized) {
        return;
    }

    setGaDisabled(true); // CONSENT: hard stop
    ReactGA.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
}

export function trackEvent(category, action, label, value) {
    if (!canTrack()) { // CONSENT
        return;
    }

    try {
        ReactGA.event({
            category,
            action,
            label,
            value,
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track event', error);
    }
}

export function isGoogleAnalyticsInitialized() {
    return isInitialized;
}

// --- GA4 ecommerce: item_id is ALWAYS the product slug (via shared toGaItem) ---

export function trackGaViewItem(product) {
    if (!canTrack() || !product) { // CONSENT
        return;
    }

    try {
        ReactGA.event('view_item', {
            currency: 'USD',
            value: getItemPrice(product),
            items: [toGaItem({ ...product, quantity: 1 })],
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track view_item', error);
    }
}

export function trackGaAddToCart(item) {
    if (!canTrack() || !item) { // CONSENT
        return;
    }

    try {
        ReactGA.event('add_to_cart', {
            currency: 'USD',
            value: getItemPrice(item) * (Number(item.quantity) || 1),
            items: [toGaItem(item)],
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track add_to_cart', error);
    }
}

export function trackGaBeginCheckout(items = [], value) {
    if (!canTrack()) { // CONSENT
        return;
    }

    try {
        ReactGA.event('begin_checkout', {
            currency: 'USD',
            value: Number.isFinite(Number(value)) ? Number(value) : sumValue(items),
            items: items.map(toGaItem),
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track begin_checkout', error);
    }
}

export function trackGaPurchase({ transactionId, value, tax = 0, shipping = 0, items = [] } = {}) {
    if (!canTrack()) { // CONSENT
        return;
    }

    const id = String(transactionId || '').trim();
    if (!id) {
        return;
    }

    try {
        ReactGA.event('purchase', {
            transaction_id: id,
            currency: 'USD',
            value: Number(value) || 0,
            tax: Number(tax) || 0,
            shipping: Number(shipping) || 0,
            items: items.map(toGaItem),
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track purchase', error);
    }
}