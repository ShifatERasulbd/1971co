export const heroFontFamilyOptions = [
    { label: 'Instrument Sans', value: 'instrument-sans' },
    { label: 'Georgia', value: 'georgia' },
    { label: 'Times New Roman', value: 'times-new-roman' },
    { label: 'Verdana', value: 'verdana' },
    { label: 'Trebuchet MS', value: 'trebuchet-ms' },
    { label: 'Courier New', value: 'courier-new' },
];

const heroFontFamilyCssMap = {
    'instrument-sans': '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
    georgia: 'Georgia, "Times New Roman", serif',
    'times-new-roman': '"Times New Roman", Times, serif',
    verdana: 'Verdana, Geneva, sans-serif',
    'trebuchet-ms': '"Trebuchet MS", Tahoma, sans-serif',
    'courier-new': '"Courier New", Courier, monospace',
};

export function resolveHeroFontFamily(value, fallback = 'instrument-sans') {
    const key = String(value || fallback).toLowerCase();
    return heroFontFamilyCssMap[key] || heroFontFamilyCssMap[fallback];
}

export function resolveHeroFontSize(value, fallback) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}