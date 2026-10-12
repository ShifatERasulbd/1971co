import { deleteCookies, getConsent, onConsentChange } from './consent';
import {
    disableGoogleAnalytics,
    enableGoogleAnalytics,
    initializeGoogleAnalytics,
    isGoogleAnalyticsInitialized,
    trackPageView,
} from './googleAnalytics';
import {
    grantFacebookPixel,
    initializeFacebookPixel,
    isFacebookPixelInitialized,
    revokeFacebookPixel,
    trackPixelPageView,
} from './facebookPixel';
import {
    grantMicrosoftClarity,
    initializeMicrosoftClarity,
    isMicrosoftClarityInitialized,
    revokeMicrosoftClarity,
} from './microsoftClarity';

/*
 * Cookie category -> tool
 *   targeting   -> Google Tag Manager + GA4
 *   social      -> Meta (Facebook) Pixel
 *   performance -> Microsoft Clarity
 */

let config = { gtmId: '', gaMeasurementId: '', pixelId: '', clarityId: '' };
let unsubscribe = null;
let gtmLoaded = false;
let consentDefaultSet = false;
const applied = { targeting: null, social: null, performance: null };

// --- Google (GTM + GA4) ---------------------------------------------------------------

function gtag() {
    window.dataLayer = window.dataLayer || [];
    // gtag requires the `arguments` object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
}

function setGoogleConsentDefault() {
    if (consentDefaultSet) {
        return;
    }
    consentDefaultSet = true;
    gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
}

function setGoogleConsent(granted) {
    const value = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
        ad_storage: value,
        analytics_storage: value,
        ad_user_data: value,
        ad_personalization: value,
    });
}

function loadGtm(gtmId) {
    if (gtmLoaded || !gtmId) {
        return;
    }
    gtmLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(script);
}

function applyTargeting(allowed, isChange) {
    if (allowed) {
        setGoogleConsent(true);
        loadGtm(config.gtmId);

        if (config.gaMeasurementId) {
            if (!isGoogleAnalyticsInitialized()) {
                initializeGoogleAnalytics(config.gaMeasurementId);
            }
            enableGoogleAnalytics();
        }

        // Turned on mid-session: record the page the visitor is already on.
        if (isChange && applied.targeting === false) {
            trackPageView(window.location.pathname + window.location.search);
        }
        return;
    }

    setGoogleConsent(false);
    disableGoogleAnalytics();
    deleteCookies({
        names: ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw', '_gcl_dc', 'FPID'],
        prefixes: ['_ga_', '_gac_', '_gat_', '_dc_gtm_'],
    });
}

// --- Meta Pixel -----------------------------------------------------------------------

function applySocial(allowed, isChange) {
    if (allowed) {
        if (config.pixelId && !isFacebookPixelInitialized()) {
            initializeFacebookPixel(config.pixelId);
        }
        grantFacebookPixel();

        if (isChange && applied.social === false) {
            trackPixelPageView();
        }
        return;
    }

    revokeFacebookPixel();
    deleteCookies({ names: ['_fbp', '_fbc'] });
}

// --- Microsoft Clarity ----------------------------------------------------------------

function applyPerformance(allowed) {
    if (allowed) {
        if (config.clarityId && !isMicrosoftClarityInitialized()) {
            initializeMicrosoftClarity(config.clarityId);
        }
        grantMicrosoftClarity();
        return;
    }

    revokeMicrosoftClarity();
    deleteCookies({ names: ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'SM'] });
}

// --- Public API -----------------------------------------------------------------------

function applyConsent(consent, isChange) {
    if (applied.targeting !== consent.targeting) {
        applyTargeting(consent.targeting, isChange);
    }
    if (applied.social !== consent.social) {
        applySocial(consent.social, isChange);
    }
    if (applied.performance !== consent.performance) {
        applyPerformance(consent.performance);
    }

    applied.targeting = consent.targeting;
    applied.social = consent.social;
    applied.performance = consent.performance;
}

/**
 * Call once after your ids are known (env for the pixel, settings table for GTM/GA4).
 * Safe to call again if the ids arrive later; it re-applies the current consent.
 */
export function startTrackingConsent(ids = {}) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    config = { ...config, ...ids };

    // Must be set before GTM / GA4 load so nothing fires until the visitor allows it.
    setGoogleConsentDefault();

    // Ids changed or arrived late: let every category be re-evaluated.
    applied.targeting = applied.targeting === true ? null : applied.targeting;
    applied.social = applied.social === true ? null : applied.social;
    applied.performance = applied.performance === true ? null : applied.performance;

    applyConsent(getConsent(), false);

    if (!unsubscribe) {
        unsubscribe = onConsentChange((consent) => applyConsent(consent, true));
    }

    return () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    };
}