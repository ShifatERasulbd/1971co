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
    formData.append('category_id', data.category_id || '');

    if (data.image instanceof File) {
        formData.append('image', data.image);
    }

  

    if (asUpdate) {
        formData.append('_method', 'PUT');
    }

    return formData;
}

export async function fetchSubCategories(){
    const payload = await requestJson('/api/sub-categories');
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.subcategories)) {
        return payload.subcategories;
    }

    return [];
}

export async function fetchSubCategory(id){
    const payload =await requestJson(`/api/sub-categories/${id}`);
    return payload || null;
}

export async function createSubCategory(data){
    await ensureCsrfCookie();
    return requestJson('/api/sub-categories',{
        method:'POST',
        body: buildCategoryFormData(data),
    })
}

export async function updateSubCategory(id,data){
    await ensureCsrfCookie();
    return requestJson(`/api/sub-categories/${id}`,{
        method:'POST',
        body: buildCategoryFormData(data,true)
    });
}

export async function deleteSubCategory(id){
    await ensureCsrfCookie();
    return requestJson(`/api/sub-categories/${id}`,{
        method:'DELETE'
    });
}

export async function fetchCategoriesForDropdown() {
    const payload = await requestJson('/api/categories');
    return Array.isArray(payload) ? payload : [];
}
