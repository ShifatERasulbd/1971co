import { requestJson } from '@/lib/apiClient';

export async function fetchBestSellersSectionSettings() {
    return requestJson('/api/website/best-sellers-section');
}

export async function updateBestSellersSectionSettings(data) {
    return requestJson('/api/website/best-sellers-section', {
        needsCsrf: true,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
