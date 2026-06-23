export async function fetchFeatures() {
    return [];
}

export async function createFeature(payload) {
    return {
        id: Date.now(),
        ...payload,
    };
}

export async function updateFeature(id, payload) {
    return {
        id,
        ...payload,
    };
}

export async function deleteFeature() {
    return { success: true };
}
