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

function buildProductPayload(data = {}) {
    return {
        name: data.name?.trim() || '',
        sku: data.sku?.trim() || '',
        color: data.color?.trim() || '',
        size: data.size?.trim() || '',
        description: data.description?.trim() || '',
        long_description: data.long_description || '',
        additional_information: data.additional_information || '',
        cover_image: data.cover_image?.trim() || '',
        category_id: data.category_id ? Number(data.category_id) : null,
        subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
        price: data.price === '' ? 0 : Number(data.price),
        stock: data.stock === '' ? 0 : Number(data.stock),
    };
}

export async function fetchProducts() {
    const payload = await requestJson('/api/products');

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (payload && typeof payload === 'object') {
        const numericKeyRows = Object.keys(payload)
            .filter((key) => /^\d+$/.test(key))
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => payload[key])
            .filter((row) => row && typeof row === 'object');

        if (numericKeyRows.length > 0) {
            return numericKeyRows;
        }
    }

    return [];
}

export async function fetchProduct(id) {
    return await requestJson(`/api/products/${id}`);
}

export async function createProduct(data) {
    await ensureCsrfCookie();
    return requestJson('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildProductPayload(data)),
    });
}

export async function updateProduct(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildProductPayload(data)),
    });
}

export async function deleteProduct(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/products/${id}`, {
        method: 'DELETE',
    });
}

export async function syncApiProducts() {
    return requestJson('/api/api-products/sync', {
        method: 'POST',
    });
}
