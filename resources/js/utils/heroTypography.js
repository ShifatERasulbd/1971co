import { getFrontendUtilsConfig } from './siteSettings';

export const heroFontFamilyOptions = [
    { label: 'Montserrat', value: 'montserrat' },
   
];

const heroFontFamilyCssMap = {
    montserrat: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
    
};

export function resolveHeroFontFamily(value, fallback = 'montserrat') {
    const config = getFrontendUtilsConfig();
    const runtimeCssMap =
        config.hero_font_family_css_map && typeof config.hero_font_family_css_map === 'object'
            ? config.hero_font_family_css_map
            : {};

    const mergedCssMap = {
        ...heroFontFamilyCssMap,
        ...runtimeCssMap,
    };

    const configFallback = config.hero_default_font_family || fallback;
    const key = String(value || configFallback).toLowerCase();
    const fallbackKey = String(configFallback || fallback).toLowerCase();

    return mergedCssMap[key] || mergedCssMap[fallbackKey] || heroFontFamilyCssMap['instrument-sans'];
}

export function resolveHeroFontSize(value, fallback) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}