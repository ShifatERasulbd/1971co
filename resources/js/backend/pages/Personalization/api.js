import { requestJson } from '@/lib/apiClient';

export async function fetchPersonalizationOrders() {
    const payload = await requestJson('/api/personalizations');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchPersonalizationOrder(id) {
    return requestJson(`/api/personalizations/${id}`);
}

export async function updatePersonalizationOrder(id, data) {
    return requestJson(`/api/personalizations/${id}`, {
        needsCsrf: true,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function deletePersonalizationOrder(id) {
    return requestJson(`/api/personalizations/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}
