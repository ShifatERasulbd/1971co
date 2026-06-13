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
    await ensureCsrfCookie();

    return requestJson('/api/heroes', {
        method: 'POST',
        body: buildHeroFormData(data),
    });
}

export async function updateHero(id, data) {
    await ensureCsrfCookie();

    return requestJson(`/api/heroes/${id}`, {
        method: 'POST',
        body: buildHeroFormData(data, true),
    });
}

export async function deleteHero(id) {

    
    await ensureCsrfCookie();

    return requestJson(`/api/heroes/${id}`, {
        method: 'DELETE',
    });
}
