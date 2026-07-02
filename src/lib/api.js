const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.aroma-naur.ru';
async function request(path, options = {}) {
  const { token, body, headers, ...rest } = options;
  const finalHeaders = new Headers(headers || {});

  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const hasFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !hasFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function loginAdmin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.page) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.brand) {
    searchParams.set('brand', params.brand);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function fetchParfumes(params = {}) {
  return request(`/parfumes${buildQuery(params)}`);
}

export async function fetchParfume(id) {
  return request(`/parfumes/${id}`);
}

export async function fetchAllParfumes({ token, pageSize = 100 } = {}) {
  const collected = [];
  let page = 1;
  let total = 0;

  while (true) {
    const response = await request(`/parfumes?page=${page}&limit=${pageSize}`, { token });
    const items = response.parfumes || [];
    total = response.total ?? total;
    collected.push(...items);

    if (items.length === 0 || collected.length >= total) {
      break;
    }

    page += 1;
  }

  return collected;
}

export async function createParfume(payload, token) {
  const formData = new FormData();
  appendParfumePayload(formData, payload);

  return request('/parfumes', {
    method: 'POST',
    token,
    body: formData,
  });
}

export async function updateParfume(id, payload, token) {
  const formData = new FormData();
  appendParfumePayload(formData, payload);

  return request(`/parfumes/${id}`, {
    method: 'PUT',
    token,
    body: formData,
  });
}

export async function deleteParfume(id, token) {
  return request(`/parfumes/${id}`, {
    method: 'DELETE',
    token,
  });
}

function appendParfumePayload(formData, payload) {
  formData.append('name', payload.name);
  formData.append('description', payload.description || '');
  formData.append('brand', payload.brand);
  formData.append('category', payload.category);
  formData.append('notes', JSON.stringify(payload.notes || []));
  formData.append('price_per_ml', String(payload.price_per_ml));
  formData.append('available_volumes', JSON.stringify(payload.available_volumes || []));
  formData.append('badge', payload.badge || '');
  formData.append('is_active', payload.is_active ? 'true' : 'false');

  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  } else if (payload.image_url) {
    formData.append('image_url', payload.image_url);
  }
}

export { API_BASE_URL };
