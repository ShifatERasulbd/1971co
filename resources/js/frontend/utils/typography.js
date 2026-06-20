import { getFrontendUtilsConfig, onSettingsUpdated } from '../../utils/siteSettings';

// Keep both exported class names for backward compatibility in components.
export const timelessFontClass = 'frontend-unified-font';
export const featuresFontClass = 'frontend-unified-font';
export const titleFontClass = 'frontend-title-font';
export const textFontClass = 'frontend-text-font';

const STYLE_TAG_ID = 'frontend-unified-typography-style';
const DEFAULT_FONT_FAMILY = '"Bebas Neue"';
const DEFAULT_TITLE_FONT_FAMILY = '"Bebas Neue"';
const DEFAULT_TEXT_FONT_FAMILY = '"Montserrat"';

function ensureTypographyStyleTag() {
    if (typeof document === 'undefined') {
        return;
    }

    if (document.getElementById(STYLE_TAG_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = `
.${timelessFontClass} { font-family: var(--frontend-font-family, ${DEFAULT_FONT_FAMILY}); }
.${titleFontClass} { font-family: var(--frontend-title-font-family, ${DEFAULT_TITLE_FONT_FAMILY}); }
.${textFontClass} { font-family: var(--frontend-text-font-family, ${DEFAULT_TEXT_FONT_FAMILY}); }
.font-serif { font-family: var(--frontend-font-family, ${DEFAULT_FONT_FAMILY}) !important; }
`;

    document.head.appendChild(style);
}

function applyTypographyFromConfig() {
    if (typeof document === 'undefined') {
        return;
    }

    const config = getFrontendUtilsConfig();
    const unifiedFont = config.timeless_font_family || config.features_font_family || DEFAULT_FONT_FAMILY;
    const titleFont = DEFAULT_TITLE_FONT_FAMILY;
    const textFont = DEFAULT_TEXT_FONT_FAMILY;

    document.documentElement.style.setProperty('--frontend-font-family', unifiedFont);
    document.documentElement.style.setProperty('--frontend-title-font-family', titleFont);
    document.documentElement.style.setProperty('--frontend-text-font-family', textFont);
}

if (typeof window !== 'undefined') {
    ensureTypographyStyleTag();
    applyTypographyFromConfig();
    onSettingsUpdated(() => {
        applyTypographyFromConfig();
    });
}
