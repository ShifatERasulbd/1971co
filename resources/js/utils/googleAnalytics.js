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
