/**
 * Shared fetch helpers for all backend API modules.
 *
 * Fixes 419 "Page Expired" on live / proxied servers by always reading the
 * XSRF-TOKEN cookie after the Sanctum handshake and injecting it explicitly as
 * the X-XSRF-TOKEN request header.  Native fetch — unlike Axios — never does
 * this automatically, so the header was missing and Laravel rejected every
 * mutating request with 419.
 */

function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Refresh the Sanctum CSRF cookie then return the token string.
 * Always refreshes so long-running uploads (e.g. video) never use a stale token.
 */
export async function ensureCsrfToken() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    return getCsrfToken();
}

/**
 * Perform a fetch request with the correct credentials and CSRF header.
 * For mutating methods (POST / PUT / PATCH / DELETE) pass `needsCsrf: true`
 * so the token is refreshed and injected automatically.
 */
export async function requestJson(url, options = {}) {
    const { needsCsrf = false, ...fetchOptions } = options;

    const extraHeaders = {};

    if (needsCsrf) {
        const token = await ensureCsrfToken();
        if (token) {
            extraHeaders['X-XSRF-TOKEN'] = token;
        }
    }

    const response = await fetch(url, {
        credentials: 'include',
        ...fetchOptions,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...extraHeaders,
            ...(fetchOptions.headers || {}),
        },
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.message || 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}
