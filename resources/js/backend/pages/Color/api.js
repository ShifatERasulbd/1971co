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
            'Content-Type': 'application/json',
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

function normalizeColorCode(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) {
        return '';
    }

    const prefixed = raw.startsWith('#') ? raw : `#${raw}`;
    return prefixed.toUpperCase();
}

function normalizeColorRecord(record) {
    if (!record || typeof record !== 'object') {
        return record;
    }

    const name = record.name ?? record.Name ?? '';
    const colorCode = record.color_code ?? record.colorCode ?? record.ColorCode ?? '';

    return {
        ...record,
        name,
        color_code: normalizeColorCode(colorCode),
    };
}

export async function fetchColors() {
    const payload = await requestJson('/api/colors');
    return Array.isArray(payload) ? payload.map(normalizeColorRecord) : [];
}

export async function fetchColor(id) {
    const payload = await requestJson(`/api/colors/${id}`);
    return normalizeColorRecord(payload);
}

export async function createColor(data) {
    await ensureCsrfCookie();
    return requestJson('/api/colors', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateColor(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/colors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteColor(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/colors/${id}`, {
        method: 'DELETE',
    });
}
