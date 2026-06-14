import { requestJson } from '@/lib/apiClient';

function buildHeroFormData(data = {}, asUpdate = false) {
    const formData = new FormData();

    function appendIfDefined(key) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
            if (key === 'button_enabled') {
                formData.append(key, data[key] ? '1' : '0');
                return;
            }

            formData.append(key, data[key] ?? '');
        }
    }

    formData.append('title', data.title || '');
    formData.append('description', data.description || '');
    formData.append('title_display_mode', data.title_display_mode || '');
    formData.append('title_font_size', data.title_font_size || '');
    formData.append('title_font_family', data.title_font_family || '');
    formData.append('description_font_size', data.description_font_size || '');
    formData.append('description_font_family', data.description_font_family || '');
    formData.append('image_url', data.image_url || '');
    formData.append('video_url', data.video_url || '');
    appendIfDefined('text_offset_x');
    appendIfDefined('text_offset_y');
    appendIfDefined('title_offset_x');
    appendIfDefined('title_offset_y');
    appendIfDefined('description_offset_x');
    appendIfDefined('description_offset_y');
    appendIfDefined('button_offset_x');
    appendIfDefined('button_offset_y');
    appendIfDefined('button_enabled');
    appendIfDefined('button_url');

    if (data.image instanceof File) {
        formData.append('image', data.image);
    }

    if (data.video instanceof File) {
        formData.append('video', data.video);
    }

    if (asUpdate) {
        formData.append('_method', 'PUT');
    }

    return formData;
}

export async function fetchHeroes() {
    const payload = await requestJson('/api/heroes');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchHero(id) {
    return requestJson(`/api/heroes/${id}`);
}

export async function createHero(data) {
    return requestJson('/api/heroes', {
        needsCsrf: true,
        method: 'POST',
        body: buildHeroFormData(data),
    });
}

export async function updateHero(id, data) {
    return requestJson(`/api/heroes/${id}`, {
        needsCsrf: true,
        method: 'POST',
        body: buildHeroFormData(data, true),
    });
}

export async function deleteHero(id) {
    return requestJson(`/api/heroes/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}
