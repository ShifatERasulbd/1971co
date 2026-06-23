import { requestJson } from '@/lib/apiClient';

function buildHeroFormData(payload = {}) {
    const formData = new FormData();

    formData.append('title', payload.title || '');
    formData.append('description', payload.description || '');
    formData.append('title_display_mode', payload.title_display_mode || 'double');
    formData.append('image_url', payload.image_url || '');
    formData.append('video_url', payload.video_url || '');
    formData.append('title_font_size', String(payload.title_font_size ?? ''));
    formData.append('title_font_family', payload.title_font_family || '');
    formData.append('description_font_size', String(payload.description_font_size ?? ''));
    formData.append('description_font_family', payload.description_font_family || '');
    formData.append('text_offset_x', String(payload.text_offset_x ?? 0));
    formData.append('text_offset_y', String(payload.text_offset_y ?? 0));
    formData.append('title_offset_x', String(payload.title_offset_x ?? 0));
    formData.append('title_offset_y', String(payload.title_offset_y ?? 0));
    formData.append('description_offset_x', String(payload.description_offset_x ?? 0));
    formData.append('description_offset_y', String(payload.description_offset_y ?? 0));
    formData.append('button_offset_x', String(payload.button_offset_x ?? 0));
    formData.append('button_offset_y', String(payload.button_offset_y ?? 0));
    formData.append('button_enabled', payload.button_enabled ? '1' : '0');
    formData.append('button_url', payload.button_url || '');

    if (payload.image instanceof File) {
        formData.append('image_file', payload.image);
    }

    if (payload.video instanceof File) {
        formData.append('video_file', payload.video);
    }

    return formData;
}

export async function fetchHeroes() {
    return requestJson('/api/heroes');
}

export async function createHero(payload) {
    return requestJson('/api/heroes', {
        needsCsrf: true,
        method: 'POST',
        body: buildHeroFormData(payload),
    });
}

export async function updateHero(id, payload) {
    return requestJson(`/api/heroes/${id}`, {
        needsCsrf: true,
        method: 'POST',
        body: (() => {
            const formData = buildHeroFormData(payload);
            formData.append('_method', 'PUT');
            return formData;
        })(),
    });
}
