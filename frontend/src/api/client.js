/* API client utilities - uses REACT_APP_BACKEND_URL. No hardcoded URLs. */

const BACKEND_URL = (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.REACT_APP_BACKEND_URL)
  || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL)
  || '';

const TOKEN_KEY = 'cp_token';

export const getBackendUrl = () => BACKEND_URL;

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {}
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
};

export async function apiFetch(path, options = {}) {
  if (!path.startsWith('/')) {
    throw new Error('apiFetch path must start with /');
  }
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'object') {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : (data?.detail || 'Request failed'));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, body) => apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: (path) => apiFetch(path, { method: 'DELETE' })
};