import { requestJson } from '@/lib/apiClient';

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
    return requestJson('/api/sub-categories',{
        needsCsrf: true,
        method:'POST',
        body: buildCategoryFormData(data),
    })
}

export async function updateSubCategory(id,data){
    return requestJson(`/api/sub-categories/${id}`,{
        needsCsrf: true,
        method:'POST',
        body: buildCategoryFormData(data,true)
    });
}

export async function deleteSubCategory(id){
    return requestJson(`/api/sub-categories/${id}`,{
        needsCsrf: true,
        method:'DELETE'
    });
}

export async function fetchCategoriesForDropdown() {
    const payload = await requestJson('/api/categories');
    return Array.isArray(payload) ? payload : [];
}
