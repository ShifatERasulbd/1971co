import { requestJson } from '@/lib/apiClient';

export async function fetchGrandChilds() {
	const payload = await requestJson('/api/grand-childs');

	if (Array.isArray(payload)) {
		return payload;
	}

	if (Array.isArray(payload?.data)) {
		return payload.data;
	}

	if (Array.isArray(payload?.grandChilds)) {
		return payload.grandChilds;
	}

	return [];
}

export async function fetchGrandChild(id) {
	const payload = await requestJson(`/api/grand-childs/${id}`);
	return payload || null;
}

export async function createGrandChild(data) {
	return requestJson('/api/grand-childs', {
		needsCsrf: true,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function updateGrandChild(id, data) {
	return requestJson(`/api/grand-childs/${id}`, {
		needsCsrf: true,
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function deleteGrandChild(id) {
	return requestJson(`/api/grand-childs/${id}`, {
		needsCsrf: true,
		method: 'DELETE',
	});
}

export async function reorderGrandChilds(ids = []) {
	return requestJson('/api/grand-childs/reorder', {
		needsCsrf: true,
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ids }),
	});
}

export async function fetchCategoriesForDropdown() {
	const payload = await requestJson('/api/categories');
	return Array.isArray(payload) ? payload : [];
}

export async function fetchSubCategoriesForDropdown() {
	const payload = await requestJson('/api/sub-categories');
	return Array.isArray(payload) ? payload : [];
}
