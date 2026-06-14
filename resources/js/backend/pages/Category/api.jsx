import { requestJson } from '@/lib/apiClient';

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
    return requestJson('/api/categories',{
        needsCsrf: true,
        method:'POST',
        body: buildCategoryFormData(data),
    })
}

export async function updateCategory(id,data){
    return requestJson(`/api/categories/${id}`,{
        needsCsrf: true,
        method:'POST',
        body: buildCategoryFormData(data,true)
    });
}

export async function deleteCategory(id){
    return requestJson(`/api/categories/${id}`,{
        needsCsrf: true,
        method:'DELETE'
    });
}
