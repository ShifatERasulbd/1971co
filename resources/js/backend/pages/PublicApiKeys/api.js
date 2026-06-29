import { requestJson } from '@/lib/apiClient';

export async function fetchPublicApiKeys() {
    const payload = await requestJson('/api/public-api-keys');
    return Array.isArray(payload) ? payload : [];
}

export async function createPublicApiKey(name) {
    return requestJson('/api/public-api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function revokePublicApiKey(id) {
    return requestJson(`/api/public-api-keys/${id}`, {
        method: 'DELETE',
    });
}
