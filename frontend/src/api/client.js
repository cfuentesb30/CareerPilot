/* API client utilities - uses REACT_APP_BACKEND_URL */

const TOKEN_KEY = 'cp_token';

// Get backend URL from environment variable (required for deployment)
const baseURL = process.env.REACT_APP_BACKEND_URL;
if (!baseURL) {
  throw new Error('REACT_APP_BACKEND_URL environment variable is required but not set');
}

export const getBackendUrl = () => baseURL;

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
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  const res = await fetch(`${baseURL}${path}`, { ...options, headers });
  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  if (!res.ok) {
    let errorMessage = 'Request failed';
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && data.detail) {
      // Handle FastAPI validation errors
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else {
        errorMessage = data.detail;
      }
    } else if (data && data.message) {
      errorMessage = data.message;
    }
    
    const err = new Error(errorMessage);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, body) => {
    const options = { method: 'POST' };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return apiFetch(path, options);
  },
  put: (path, body) => {
    const options = { method: 'PUT' };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return apiFetch(path, options);
  },
  del: (path) => apiFetch(path, { method: 'DELETE' })
};