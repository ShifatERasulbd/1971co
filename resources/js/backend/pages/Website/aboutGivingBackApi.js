import { requestJson } from '@/lib/apiClient';

function normalizePoints(points = []) {
    if (!Array.isArray(points)) {
        return [];
    }

    return points
        .map((point) => String(point || '').trim())
        .filter((point) => point.length > 0);
}

function buildAboutGivingBackFormData(data = {}) {
    const formData = new FormData();

    formData.append('section_title', data.section_title || 'Giving Back');
    formData.append('title', data.title || 'Roots Run Deep.');
    formData.append('description', data.description || '');
    formData.append('points', JSON.stringify(normalizePoints(data.points)));

    if (data.image instanceof File) {
        formData.append('image_file', data.image);
    } else if (typeof data.image === 'string' && data.image.length > 0) {
        formData.append('image', data.image);
    }

    return formData;
}

export async function fetchAboutGivingBack() {
    return requestJson('/api/about-giving-back');
}

export async function fetchPublicAboutGivingBack() {
    return requestJson('/api/public/about-giving-back');
}

export async function updateAboutGivingBack(data) {
    return requestJson('/api/about-giving-back', {
        needsCsrf: true,
        method: 'POST',
        body: buildAboutGivingBackFormData(data),
    });
}
