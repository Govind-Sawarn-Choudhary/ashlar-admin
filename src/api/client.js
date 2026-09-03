const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function getToken() {
  return localStorage.getItem('admin_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 200) || 'Unexpected server response' };
  }
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new ApiError(
      'Cannot reach backend server. Start it with: cd backend && npm run dev',
      { code: 'network' },
    );
  }

  const data = await parseResponse(response);

  if (response.status === 401) {
    setToken(null);
    throw new ApiError(data.error || 'Session expired. Please sign in again.', {
      status: 401,
      code: 'auth',
    });
  }

  if (!response.ok) {
    throw new ApiError(data.error || `Request failed (${response.status})`, {
      status: response.status,
      code: 'server',
    });
  }

  return data;
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { online: false, message: `Backend returned ${response.status}` };
    }

    const data = await parseResponse(response);
    return {
      online: true,
      message: data.service || 'Backend connected',
    };
  } catch {
    return {
      online: false,
      message: 'Backend offline — run: cd backend && npm run dev',
    };
  }
}

export const api = {
  login: (email, password) =>
    request('/api/admin/login', {
      method: 'POST',
      body: { email, password },
    }),
  getStats: () => request('/api/admin/stats'),
  getLawyers: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      ),
    ).toString();

    return request(`/api/admin/lawyers${query ? `?${query}` : ''}`);
  },
  getLawyer: (id) => request(`/api/admin/lawyers/${id}`),
  updateVerification: (id, body) =>
    request(`/api/admin/lawyers/${id}/verification`, {
      method: 'PATCH',
      body,
    }),
  updateBarVerification: (id, body) =>
    request(`/api/admin/lawyers/${id}/bar-verification`, {
      method: 'PATCH',
      body,
    }),
  getOverviewStats: () => request('/api/admin/stats/overview'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      ),
    ).toString();
    return request(`/api/admin/users${query ? `?${query}` : ''}`);
  },
  getUser: (id) => request(`/api/admin/users/${id}`),
  getAppointment: (id) => request(`/api/admin/appointments/${id}`),
  getConsultations: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      ),
    ).toString();
    return request(`/api/admin/consultations${query ? `?${query}` : ''}`);
  },
  getConsultation: (id) => request(`/api/admin/consultations/${id}`),
  endConsultation: (id) =>
    request(`/api/admin/consultations/${id}/end`, {
      method: 'POST',
    }),
  getIntegrations: () => request('/api/admin/integrations'),
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      ),
    ).toString();
    return request(`/api/admin/appointments${query ? `?${query}` : ''}`);
  },
  getPayments: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      ),
    ).toString();
    return request(`/api/admin/payments${query ? `?${query}` : ''}`);
  },
  getSettings: () => request('/api/admin/settings'),
  updateSettings: (body) =>
    request('/api/admin/settings', {
      method: 'PUT',
      body,
    }),
};
