export function buildOptimizedImageUrl(source, options = {}) {
    const raw = String(source || '').trim();
    if (!raw) {
        return '';
    }

    if (raw.startsWith('data:')) {
        return raw;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(raw, window.location.origin);
    } catch {
        return raw;
    }

    if (parsedUrl.origin !== window.location.origin) {
        return raw;
    }

    const path = parsedUrl.pathname || '';
    if (!path) {
        return raw;
    }

    const width = Number(options.w) || 1400;
    const quality = Number(options.q) || 76;

    const params = new URLSearchParams();
    params.set('path', path);
    params.set('w', String(Math.max(120, Math.min(2600, Math.round(width)))));
    params.set('q', String(Math.max(40, Math.min(90, Math.round(quality)))));

    return `/media/optimize?${params.toString()}`;
}
