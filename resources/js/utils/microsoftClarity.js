import { getProductSlug } from './dataLayer';

let isInitialized = false;

export function initializeMicrosoftClarity(projectId) {
    if (!projectId || typeof projectId !== 'string') {
        return false;
    }

    if (isInitialized || typeof window === 'undefined') {
        return isInitialized;
    }

    try {
        /* eslint-disable */
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', projectId);
        /* eslint-enable */

        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Microsoft Clarity: Failed to initialize', error);
        return false;
    }
}

export function isMicrosoftClarityInitialized() {
    return isInitialized;
}

// --- Product tracking: product_slug is the identifier (same as GA4/GTM/Pixel) ---

function clarity(...args) {
    if (!isInitialized || typeof window === 'undefined' || typeof window.clarity !== 'function') {
        return;
    }

    try {
        window.clarity(...args);
    } catch (error) {
        console.error('Microsoft Clarity: call failed', error);
    }
}

export function trackClarityProductEvent(eventName, item) {
    const slug = getProductSlug(item);
    if (!slug) {
        return;
    }

    clarity('set', 'product_slug', slug);
    clarity('event', eventName);
}

export const trackClarityViewItem = (product) => trackClarityProductEvent('view_item', product);
export const trackClarityAddToCart = (item) => trackClarityProductEvent('add_to_cart', item);

export function trackClarityPurchase(items = []) {
    const slugs = items.map(getProductSlug).filter(Boolean);
    if (!slugs.length) {
        return;
    }

    clarity('set', 'product_slug', slugs.join(','));
    clarity('event', 'purchase');
}