let isInitialized = false;

function injectPixelScript() {
    if (typeof window === 'undefined' || window.fbq) {
        return;
    }

    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
}

export function initializeFacebookPixel(pixelId) {
    if (!pixelId || typeof pixelId !== 'string') {
        return false;
    }

    if (isInitialized) {
        return true;
    }

    try {
        injectPixelScript();
        window.fbq('init', pixelId);
        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Facebook Pixel: Failed to initialize', error);
        return false;
    }
}

export function trackPixelEvent(eventName, params = {}, eventId) {
    if (!isInitialized || typeof window === 'undefined' || !window.fbq) {
        return;
    }

    try {
        const options = eventId ? { eventID: eventId } : undefined;
        window.fbq('track', eventName, params, options);
    } catch (error) {
        console.error('Facebook Pixel: Failed to track event', eventName, error);
    }
}

export function trackPixelPageView() {
    trackPixelEvent('PageView');
}

export function isFacebookPixelInitialized() {
    return isInitialized;
}

export function getFacebookBrowserId() {
    return readCookie('_fbp');
}

export function getFacebookClickId() {
    return readCookie('_fbc');
}

function readCookie(name) {
    if (typeof document === 'undefined') {
        return '';
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}
