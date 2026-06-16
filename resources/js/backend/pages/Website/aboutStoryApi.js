import { requestJson } from '@/lib/apiClient';

function buildAboutStoryFormData(data = {}) {
    const formData = new FormData();

    formData.append('section_title', data.section_title || 'The Beginning');
    formData.append('title', data.title || 'Why 1971?');
    formData.append('description_html', data.description_html || '');

    if (data.background_image instanceof File) {
        formData.append('background_image_file', data.background_image);
    } else if (typeof data.background_image === 'string' && data.background_image.length > 0) {
        formData.append('background_image', data.background_image);
    }

    return formData;
}

export async function fetchAboutStory() {
    return requestJson('/api/about-story');
}

export async function fetchPublicAboutStory() {
    return requestJson('/api/public/about-story');
}

export async function updateAboutStory(data) {
    return requestJson('/api/about-story', {
        needsCsrf: true,
        method: 'POST',
        body: buildAboutStoryFormData(data),
    });
}
