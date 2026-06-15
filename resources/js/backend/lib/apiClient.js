/**
 * Shared fetch helpers for all backend API modules.
 *
 * CSRF token handling is disabled project-wide; requests rely on session
 * credentials only.
 */
export async function requestJson(url, options = {}) {
    const { ...fetchOptions } = options;
    const incomingHeaders = fetchOptions.headers || {};

    const hasContentType = Object.keys(incomingHeaders).some(
        (key) => key.toLowerCase() === 'content-type',
    );

    const shouldSetJsonContentType =
        !hasContentType
        && fetchOptions.body !== undefined
        && fetchOptions.body !== null
        && !(fetchOptions.body instanceof FormData)
        && !(fetchOptions.body instanceof Blob)
        && !(fetchOptions.body instanceof URLSearchParams)
        && !(typeof ArrayBuffer !== 'undefined' && fetchOptions.body instanceof ArrayBuffer);

    const response = await fetch(url, {
        credentials: 'include',
        ...fetchOptions,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(shouldSetJsonContentType ? { 'Content-Type': 'application/json' } : {}),
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
