import { requestJson } from '@/lib/apiClient';

export async function fetchCollections() {
    return requestJson('/api/collections');
}

export async function fetchPublicCollections() {
    return requestJson('/api/public/collections');
}

export async function updateCollections(data) {
    return requestJson('/api/collections', {
        needsCsrf: true,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
