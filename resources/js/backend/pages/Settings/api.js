import { requestJson } from '@/lib/apiClient';

function normalizeSocialMedia(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.map((item) => ({
        name: item?.name || '',
        link: item?.link || '',
        icon: item?.icon || '',
    }));
}

function normalizeSettingRecord(record) {
    if (!record || typeof record !== 'object') {
        return { id: null, payload: {} };
    }

    const payload = record.payload && typeof record.payload === 'object' ? record.payload : {};

    return {
        ...record,
        payload: {
            header_logo: payload.header_logo || '',
            footer_logo: payload.footer_logo || '',
            email: payload.email || '',
            location: payload.location || '',
            currency: payload.currency || '',
            social_media: normalizeSocialMedia(payload.social_media),
            frontend_utils:
                payload.frontend_utils && typeof payload.frontend_utils === 'object'
                    ? {
                          timeless_font_family: payload.frontend_utils.timeless_font_family || '',
                          features_font_family: payload.frontend_utils.features_font_family || '',
                          hero_default_font_family: payload.frontend_utils.hero_default_font_family || '',
                          hero_font_family_options: Array.isArray(payload.frontend_utils.hero_font_family_options)
                              ? payload.frontend_utils.hero_font_family_options
                              : [],
                          hero_font_family_css_map:
                              payload.frontend_utils.hero_font_family_css_map &&
                              typeof payload.frontend_utils.hero_font_family_css_map === 'object'
                                  ? payload.frontend_utils.hero_font_family_css_map
                                  : {},
                      }
                    : {
                          timeless_font_family: '',
                          features_font_family: '',
                          hero_default_font_family: '',
                          hero_font_family_options: [],
                          hero_font_family_css_map: {},
                      },
        },
    };
}

function buildSettingsPayload(data = {}) {
    const frontendUtils = data.frontend_utils && typeof data.frontend_utils === 'object' ? data.frontend_utils : {};

    return {
        header_logo: data.header_logo || '',
        footer_logo: data.footer_logo || '',
        email: data.email || '',
        location: data.location || '',
        currency: data.currency || '',
        social_media: normalizeSocialMedia(data.social_media),
        frontend_utils: {
            timeless_font_family: frontendUtils.timeless_font_family || '',
            features_font_family: frontendUtils.features_font_family || '',
            hero_default_font_family: frontendUtils.hero_default_font_family || '',
            hero_font_family_options: Array.isArray(frontendUtils.hero_font_family_options)
                ? frontendUtils.hero_font_family_options
                : [],
            hero_font_family_css_map:
                frontendUtils.hero_font_family_css_map && typeof frontendUtils.hero_font_family_css_map === 'object'
                    ? frontendUtils.hero_font_family_css_map
                    : {},
        },
    };
}

function buildSettingsFormData(data = {}) {
    const payload = buildSettingsPayload(data);
    const formData = new FormData();

    formData.append('header_logo_existing', payload.header_logo || '');
    formData.append('footer_logo_existing', payload.footer_logo || '');
    formData.append('social_media', JSON.stringify(payload.social_media));
    formData.append('frontend_utils', JSON.stringify(payload.frontend_utils));
    formData.append('email', payload.email);
    formData.append('location', payload.location);
    formData.append('currency', payload.currency);

    if (data.header_logo_file instanceof File) {
        formData.append('header_logo_file', data.header_logo_file);
    }

    if (data.footer_logo_file instanceof File) {
        formData.append('footer_logo_file', data.footer_logo_file);
    }

    if (data.social_icon_files && typeof data.social_icon_files === 'object') {
        Object.entries(data.social_icon_files).forEach(([index, file]) => {
            if (file instanceof File) {
                formData.append(`social_icon_files[${index}]`, file);
            }
        });
    }

    return formData;
}

function hasUploadFiles(data = {}) {
    if (data.header_logo_file instanceof File || data.footer_logo_file instanceof File) {
        return true;
    }

    if (data.social_icon_files && typeof data.social_icon_files === 'object') {
        return Object.values(data.social_icon_files).some((file) => file instanceof File);
    }

    return false;
}

export async function fetchSettings() {
    const payload = await requestJson('/api/settings');
    return Array.isArray(payload) ? payload.map(normalizeSettingRecord) : [];
}

export async function fetchSetting(id) {
    const payload = await requestJson(`/api/settings/${id}`);
    return normalizeSettingRecord(payload);
}

export async function createSetting(data) {
    if (hasUploadFiles(data)) {
        return requestJson('/api/settings', {
            needsCsrf: true,
            method: 'POST',
            body: buildSettingsFormData(data),
        });
    }

    return requestJson('/api/settings', {
        needsCsrf: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSettingsPayload(data)),
    });
}

export async function updateSetting(id, data) {
    if (hasUploadFiles(data)) {
        return requestJson(`/api/settings/${id}`, {
            needsCsrf: true,
            method: 'POST',
            body: (() => {
                const formData = buildSettingsFormData(data);
                formData.append('_method', 'PUT');
                return formData;
            })(),
        });
    }

    return requestJson(`/api/settings/${id}`, {
        needsCsrf: true,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSettingsPayload(data)),
    });
}

export async function deleteSetting(id) {
    return requestJson(`/api/settings/${id}`, {
        needsCsrf: true,
        method: 'DELETE',
    });
}

export const updateSettings = updateSetting;
export const deleteSettings = deleteSetting;
