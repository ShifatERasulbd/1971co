import { requestJson } from '@/lib/apiClient';

function normalizeSizeRecord(record) {
    if (!record || typeof record !== 'object') {
        return record;
    }

    const normalizedValue = typeof record.size === 'string'
        ? record.size
        : (typeof record.Size === 'string' ? record.Size : '');

    return {
        ...record,
        size: normalizedValue,
    };
}

export async function fetchSizes() {
    const payload = await requestJson('/api/sizes');

    // Keep UI stable even if the backend/auth layer returns an unexpected payload.
    return Array.isArray(payload) ? payload.map(normalizeSizeRecord) : [];
}

export async function fetchSize(id) {
    const payload = await requestJson(`/api/sizes/${id}`);
    return normalizeSizeRecord(payload);
}

export async function createSize(data) {
    return requestJson('/api/sizes', {
        needsCsrf: true,
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateSize(id, data) {
    return requestJson(`/api/sizes/${id}`, {
        needsCsrf: true,
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteSize(id) {
    return requestJson(`/api/sizes/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}

// Backward-compatible aliases for any older imports still present.
export const updateSizes = updateSize;
export const deleteSizes = deleteSize;