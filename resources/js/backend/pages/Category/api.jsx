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

function buildCategoryFormData(data = {}, asUpdate = false) {
    const formData = new FormData();

    formData.append('name', data.name || '');
    formData.append('slug', data.slug || '');
    formData.append('show_homepage', data.show_homepage ? '1' : '0');

  

    if (asUpdate) {
        formData.append('_method', 'PUT');
    }

    return formData;
}

export async function fetchCategories(){
    const payload = await requestJson('/api/categories');
    if (Array.isArray(payload)) {
        return payload;
    }
    // console.log('[Category] Fetched payload:', payload);
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }
    console.warn('[Category] Unexpected payload structure:', payload);
    if (Array.isArray(payload?.categories)) {
        return payload.categories;
    }
    console.warn('[Category] Still no categories array found in payload:', payload);
    return [];
}

export async function fetchCategory(id){
    const payload =await requestJson(`/api/categories/${id}`);
    return payload || null;
}

export async function createCategory(data){
    await ensureCsrfCookie();
    return requestJson('/api/categories',{
        method:'POST',
        body: buildCategoryFormData(data),
    })
}

export async function updateCategory(id,data){
    await ensureCsrfCookie();
    return requestJson(`/api/categories/${id}`,{
        method:'POST',
        body: buildCategoryFormData(data,true)
    });
}

export async function deleteCategory(id){
    await ensureCsrfCookie();
    return requestJson(`/api/categories/${id}`,{
        method:'DELETE'
    });
}
