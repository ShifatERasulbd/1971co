async function ensureCsrfCookie() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
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

export async function fetchPersonalizationOrders() {
    const payload = await requestJson('/api/personalizations');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchPersonalizationOrder(id) {
    return requestJson(`/api/personalizations/${id}`);
}

export async function updatePersonalizationOrder(id, data) {
    await ensureCsrfCookie();

    return requestJson(`/api/personalizations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function deletePersonalizationOrder(id) {
    await ensureCsrfCookie();

    return requestJson(`/api/personalizations/${id}`, {
        method: 'DELETE',
    });
}
