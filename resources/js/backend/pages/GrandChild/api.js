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
	await ensureCsrfCookie();
	return requestJson('/api/grand-childs', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function updateGrandChild(id, data) {
	await ensureCsrfCookie();
	return requestJson(`/api/grand-childs/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}

export async function deleteGrandChild(id) {
	await ensureCsrfCookie();
	return requestJson(`/api/grand-childs/${id}`, {
		method: 'DELETE',
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
