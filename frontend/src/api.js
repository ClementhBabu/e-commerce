const API_BASE = '/api';

async function request(path, options = {}) {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });
  if (res.status === 401 && !skipAuthRedirect) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

export const auth = {
  me: () => request('/auth/me', { skipAuthRedirect: true }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const products = {
  list: (params) => request(`/products${params ? `?${new URLSearchParams(params)}` : ''}`),
  get: (id) => request(`/products/${id}`),
};

export const cart = {
  get: () => request('/cart'),
  add: (body) => request('/cart/add', { method: 'POST', body: JSON.stringify(body) }),
  update: (itemId, body) => request(`/cart/update/${itemId}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (itemId) => request(`/cart/remove/${itemId}`, { method: 'DELETE' }),
};

export const checkout = {
  process: (body) => request('/checkout', { method: 'POST', body: JSON.stringify(body) }),
};

export const address = {
  list: () => request('/address'),
  getDefault: () => request('/address/default'),
  create: (body) => request('/address', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/address/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/address/${id}`, { method: 'DELETE' }),
  geocode: (body) => request('/address/geocode', { method: 'POST', body: JSON.stringify(body) }),
};

export const chat = {
  send: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};
