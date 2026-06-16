import { requestJson } from '@/lib/apiClient';

function normalizeMissionItems(items = []) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.map((item) => ({
        icon: String(item?.icon || 'BadgeCheck'),
        title: String(item?.title || ''),
    }));
}

export async function fetchAboutMission() {
    return requestJson('/api/about-mission');
}

export async function fetchPublicAboutMission() {
    return requestJson('/api/public/about-mission');
}

function buildAboutMissionFormData(data = {}) {
    const formData = new FormData();

    formData.append('title', data.title || 'Our Mission');
    formData.append('description', data.description || '');
    formData.append('items', JSON.stringify(normalizeMissionItems(data.items)));

    if (data.background_image instanceof File) {
        formData.append('background_image_file', data.background_image);
    } else if (typeof data.background_image === 'string' && data.background_image.length > 0) {
        formData.append('background_image', data.background_image);
    }

    return formData;
}

export async function updateAboutMission(data) {
    return requestJson('/api/about-mission', {
        needsCsrf: true,
        method: 'POST',
        body: buildAboutMissionFormData(data),
    });
}
