import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', details = [], status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function getAuthHeader() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (err) {
    console.warn('Could not retrieve Supabase session token:', err);
  }
  // Local fallback mock token for development when Supabase is not fully bound
  const localMockToken = localStorage.getItem('km_mock_token');
  if (localMockToken) {
    return { Authorization: `Bearer ${localMockToken}` };
  }
  return {};
}

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const authHeaders = await getAuthHeader();

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...authHeaders,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errCode = data?.error?.code || `HTTP_${res.status}`;
      const errMsg = data?.error?.message || res.statusText || 'An error occurred';
      const details = data?.error?.details || [];
      throw new ApiError(errMsg, errCode, details, res.status);
    }

    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network connection failed', 'NETWORK_ERROR', [], 0);
  }
}
