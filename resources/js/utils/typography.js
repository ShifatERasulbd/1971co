import { getFrontendUtilsConfig, onSettingsUpdated } from './siteSettings';

export const timelessFontClass = 'timeless-dynamic-font';
export const featuresFontClass = 'features-dynamic-font';

const STYLE_TAG_ID = 'timeless-dynamic-typography-style';
const DEFAULT_FONT_FAMILY = '"Instrument Sans", ui-sans-serif, system-ui, sans-serif';

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
.${timelessFontClass} { font-family: var(--timeless-font-family, ${DEFAULT_FONT_FAMILY}); }
.${featuresFontClass} { font-family: var(--features-font-family, var(--timeless-font-family, ${DEFAULT_FONT_FAMILY})); }
`;

	document.head.appendChild(style);
}

function applyTypographyFromConfig() {
	if (typeof document === 'undefined') {
		return;
	}

	const config = getFrontendUtilsConfig();
	const timelessFont = config.timeless_font_family || DEFAULT_FONT_FAMILY;
	const featuresFont = config.features_font_family || timelessFont;

	document.documentElement.style.setProperty('--timeless-font-family', timelessFont);
	document.documentElement.style.setProperty('--features-font-family', featuresFont);
}

if (typeof window !== 'undefined') {
	ensureTypographyStyleTag();
	applyTypographyFromConfig();
	onSettingsUpdated(() => {
		applyTypographyFromConfig();
	});
}