    import { requestJson } from '@/lib/apiClient';

export async function fetchCompliancePages() {
    const payload = await requestJson('/api/compliance');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchCompliancePage(id) {
    return await requestJson(`/api/compliance/${id}`);
}

export async function createCompliancePage(data) {
    return requestJson('/api/compliance', {
        needsCsrf: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function updateCompliancePage(id, data) {
    return requestJson(`/api/compliance/${id}`, {
        needsCsrf: true,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export async function deleteCompliancePage(id) {
    return requestJson(`/api/compliance/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}