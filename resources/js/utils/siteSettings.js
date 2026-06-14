const SETTINGS_UPDATED_EVENT = 'timeless-settings-updated';

let settingsPayload = {};
let hasLoaded = false;

function normalizeFrontendUtils(frontendUtils) {
    if (!frontendUtils || typeof frontendUtils !== 'object') {
        return {};
    }

    return {
        timeless_font_family: typeof frontendUtils.timeless_font_family === 'string' ? frontendUtils.timeless_font_family : '',
        features_font_family: typeof frontendUtils.features_font_family === 'string' ? frontendUtils.features_font_family : '',
        hero_default_font_family:
            typeof frontendUtils.hero_default_font_family === 'string' ? frontendUtils.hero_default_font_family : '',
        hero_font_family_options: Array.isArray(frontendUtils.hero_font_family_options)
            ? frontendUtils.hero_font_family_options
            : [],
        hero_font_family_css_map:
            frontendUtils.hero_font_family_css_map && typeof frontendUtils.hero_font_family_css_map === 'object'
                ? frontendUtils.hero_font_family_css_map
                : {},
    };
}

export function getSettingsPayload() {
    return settingsPayload;
}

export function getFrontendUtilsConfig() {
    return normalizeFrontendUtils(settingsPayload.frontend_utils);
}

export async function bootstrapPublicSettings() {
    if (hasLoaded) {
        return settingsPayload;
    }

    hasLoaded = true;

    try {
        const response = await fetch('/api/public/settings', {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            return settingsPayload;
        }

        const payload = await response.json();
        settingsPayload = payload?.payload && typeof payload.payload === 'object' ? payload.payload : {};

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: settingsPayload }));
        }
    } catch {
        // Keep defaults when endpoint is unavailable.
    }

    return settingsPayload;
}

export function onSettingsUpdated(callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
        return () => {};
    }

    const handler = (event) => {
        callback(event.detail || settingsPayload);
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handler);
}
