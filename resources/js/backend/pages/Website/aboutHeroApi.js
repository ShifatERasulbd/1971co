import { requestJson } from '@/lib/apiClient';

function buildAboutHeroFormData(data = {}) {
    const formData = new FormData();

    formData.append('section_title', data.section_title || 'Our Story');
    formData.append('title', data.title || 'Heritage. Culture. Style.');
    formData.append('description', data.description || '');

    if (data.background_image instanceof File) {
        formData.append('background_image_file', data.background_image);
    } else if (typeof data.background_image === 'string' && data.background_image.length > 0) {
        formData.append('background_image', data.background_image);
    }

    return formData;
}

export async function fetchAboutHero() {
    return requestJson('/api/about-hero');
}

export async function fetchPublicAboutHero() {
    return requestJson('/api/public/about-hero');
}

export async function updateAboutHero(data) {
    return requestJson('/api/about-hero', {
        needsCsrf: true,
        method: 'POST',
        body: buildAboutHeroFormData(data),
    });
}
