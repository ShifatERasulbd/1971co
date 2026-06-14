import { requestJson } from '@/lib/apiClient';

function buildOurStoryFormData(data = {}) {
    const formData = new FormData();

    formData.append('section_title', data.section_title || '');
    formData.append('title', data.title || '');
    formData.append('description', data.description || '');
    formData.append('background_color', data.background_color || '#c8b89a');
    formData.append('show_image', data.show_image ? '1' : '0');
    formData.append('show_text', data.show_text ? '1' : '0');

    if (data.story_image instanceof File) {
        formData.append('story_image_file', data.story_image);
    } else if (typeof data.story_image === 'string' && data.story_image.length > 0) {
        formData.append('story_image', data.story_image);
    }

    if (data.story_logo instanceof File) {
        formData.append('story_logo_file', data.story_logo);
    } else if (typeof data.story_logo === 'string' && data.story_logo.length > 0) {
        formData.append('story_logo', data.story_logo);
    }

    return formData;
}

export async function fetchOurStory() {
    return requestJson('/api/our-story');
}

export async function fetchPublicOurStory() {
    return requestJson('/api/public/our-story');
}

export async function updateOurStory(data) {
    return requestJson('/api/our-story', {
        needsCsrf: true,
        method: 'POST',
        body: buildOurStoryFormData(data),
    });
}
