import { requestJson } from '@/lib/apiClient';

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
    return requestJson('/api/colors', {
        needsCsrf: true,
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateColor(id, data) {
    return requestJson(`/api/colors/${id}`, {
        needsCsrf: true,
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteColor(id) {
    return requestJson(`/api/colors/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}
