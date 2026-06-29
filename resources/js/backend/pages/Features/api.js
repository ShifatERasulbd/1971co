import { requestJson } from '@/lib/apiClient';

function buildFeatureFormData(payload = {}) {
    const formData = new FormData();

    formData.append('title', payload.title || '');
    formData.append('short_description', payload.short_description || '');
    formData.append('description', payload.description || payload.short_description || '');
    formData.append('sort_order', String(payload.sort_order ?? 0));
    formData.append('columns_per_view', String(payload.columns_per_view ?? 3));
    formData.append('title_font_size', String(payload.title_font_size ?? 28));
    formData.append('title_font_family', payload.title_font_family || 'instrument-sans');
    formData.append('description_font_size', String(payload.description_font_size ?? 16));
    formData.append(
        'description_font_family',
        payload.description_font_family || 'instrument-sans'
    );

    if (payload.icon instanceof File) {
        formData.append('icon_file', payload.icon);
    } else if (typeof payload.icon === 'string') {
        formData.append('icon', payload.icon);
    }

    return formData;
}

export async function fetchFeatures() {
    return requestJson('/api/features');
}

export async function createFeature(payload) {
    return requestJson('/api/features', {
        needsCsrf: true,
        method: 'POST',
        body: buildFeatureFormData(payload),
    });
}

export async function updateFeature(id, payload) {
    return requestJson(`/api/features/${id}`, {
        needsCsrf: true,
        method: 'POST',
        body: (() => {
            const formData = buildFeatureFormData(payload);
            formData.append('_method', 'PUT');
            return formData;
        })(),
    });
}

export async function deleteFeature(id) {
    return requestJson(`/api/features/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}
