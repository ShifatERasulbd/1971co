import ReactGA from 'react-ga4';
import { toGaItem, getItemPrice, sumValue } from './dataLayer';

let isInitialized = false;

export function initializeGoogleAnalytics(measurementId) {
    if (!measurementId || typeof measurementId !== 'string') {
        console.warn('Google Analytics: No measurement ID provided');
        return false;
    }

    if (isInitialized) {
        console.warn('Google Analytics: Already initialized');
        return true;
    }

    try {
        ReactGA.initialize(measurementId);
        isInitialized = true;
        console.log('Google Analytics: Initialized with ID', measurementId);
        return true;
    } catch (error) {
        console.error('Google Analytics: Failed to initialize', error);
        return false;
    }
}

export function trackPageView(pathname) {
    if (!isInitialized) {
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

export function trackEvent(category, action, label, value) {
    if (!isInitialized) {
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
    if (!isInitialized || !product) {
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
    if (!isInitialized || !item) {
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
    if (!isInitialized) {
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
    if (!isInitialized) {
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