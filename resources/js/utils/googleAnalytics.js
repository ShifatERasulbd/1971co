import ReactGA from 'react-ga4';

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

// --- Google Analytics (react-ga4) Ecommerce Helpers (Using product_slug as item_id) ---

function getProductSlug(item = {}) {
    return String(item.product_slug || item.slug || item.sku || item.productId || item.id || '');
}

function toGaItem(item = {}) {
    const variant = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
    const productSlug = getProductSlug(item);

    return {
        item_id: productSlug, // Strictly using product_slug as the identifier
        item_name: String(item.name || ''),
        price: Number(item.priceValue ?? item.price ?? 0) || 0,
        quantity: Number(item.quantity) || 1,
        ...(variant ? { item_variant: variant } : {}),
        ...(item.category ? { item_category: String(item.category) } : {}),
    };
}

function sumValue(items = []) {
    return items.reduce((sum, item) => sum + (Number(item.priceValue ?? item.price ?? 0) || 0) * (Number(item.quantity) || 1), 0);
}

export function trackGaViewItem(product) {
    if (!isInitialized || !product) {
        return;
    }

    try {
        ReactGA.event('view_item', {
            currency: 'USD',
            value: Number(product?.priceValue ?? product?.price ?? 0) || 0,
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
            value: (Number(item.priceValue ?? item.price) || 0) * (Number(item.quantity) || 1),
            items: [toGaItem(item)],
        });
    } catch (error) {
        console.error('Google Analytics: Failed to track add_to_cart', error);
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