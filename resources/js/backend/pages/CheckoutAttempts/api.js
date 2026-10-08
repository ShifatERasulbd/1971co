import { requestJson } from '@/lib/apiClient';

export async function fetchCheckoutAttempts({ page = 1, perPage = 20, status = '', search = '' } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return requestJson(`/api/checkout-attempt?${params.toString()}`);
}