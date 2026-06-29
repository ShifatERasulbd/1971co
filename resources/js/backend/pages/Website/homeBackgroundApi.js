import { requestJson } from '@/lib/apiClient';

function buildHomeBackgroundFormData(data = {}) {
    const formData = new FormData();

    const items = Array.isArray(data.items) ? data.items : [];

    formData.append(
        'items',
        JSON.stringify(
            items.map((item, index) => ({
                id: item.id ?? index + 1,
                image: typeof item.image === 'string' ? item.image : '',
                title: item.title || '',
                description: item.description || '',
                button_text: item.button_text || 'Explore The Drop',
                button_url: item.button_url || '/shop',
                show_button: Boolean(item.show_button),
                sort_order: Number.isInteger(item.sort_order) ? item.sort_order : index,
            }))
        )
    );

    items.forEach((item, index) => {
        if (item.image_file instanceof File) {
            formData.append(`item_image_files[${index}]`, item.image_file);
        }
    });

    return formData;
}

export async function fetchHomeBackgroundSection() {
    return requestJson('/api/home-background-section');
}

export async function fetchPublicHomeBackgroundSection() {
    return requestJson('/api/public/home-background-section');
}

export async function updateHomeBackgroundSection(data) {
    return requestJson('/api/home-background-section', {
        needsCsrf: true,
        method: 'POST',
        body: buildHomeBackgroundFormData(data),
    });
}
