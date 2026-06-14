import { requestJson } from '@/lib/apiClient';

function buildFeatureFormData(data = {}, asUpdate = false) {
    const formData = new FormData();

    formData.append('title', data.title || '');
    formData.append('short_description', data.short_description || data.description || '');
    formData.append('description', data.description || data.short_description || '');
    if (data.sort_order !== undefined && data.sort_order !== null) {
        formData.append('sort_order', String(data.sort_order));
    }
    if (data.columns_per_view !== undefined && data.columns_per_view !== null) {
        formData.append('columns_per_view', String(data.columns_per_view));
    }
    if (data.title_font_size !== undefined && data.title_font_size !== null) {
        formData.append('title_font_size', String(data.title_font_size));
    }
    if (data.title_font_family !== undefined && data.title_font_family !== null) {
        formData.append('title_font_family', data.title_font_family);
    }
    if (data.description_font_size !== undefined && data.description_font_size !== null) {
        formData.append('description_font_size', String(data.description_font_size));
    }
    if (data.description_font_family !== undefined && data.description_font_family !== null) {
        formData.append('description_font_family', data.description_font_family);
    }

    if (data.icon instanceof File) {
        formData.append('icon', data.icon);
    }

    if (typeof data.icon === 'string' && data.icon.length > 0) {
        formData.append('icon_url', data.icon);
    }


    if (asUpdate) {
        formData.append('_method', 'PUT');
    }

    return formData;
}
// Features API All entries
export async function fetchFeatures(){
    const payload =await requestJson('/api/features');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchPublicFeatures() {
    const payload = await requestJson('/api/public/features');
    return Array.isArray(payload) ? payload : [];
}

export async function  fetchFeature(id){
    return await requestJson(`/api/features/${id}`);
}

export async function createFeature(data){
    return requestJson('/api/features',{
        needsCsrf: true,
        method: 'POST',
        body: buildFeatureFormData(data)
    });
}

export async function updateFeature(id,data){
    return requestJson(`/api/features/${id}`,{
        needsCsrf: true,
        method: 'POST',
        body: buildFeatureFormData(data, true)
    });
}

export async function deleteFeature(id){
    return requestJson(`/api/features/${id}`,{
        needsCsrf: true,
        method: 'DELETE'
    });
}

