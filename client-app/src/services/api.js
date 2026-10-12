import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawBaseURL.endsWith('/v1') ? rawBaseURL.replace(/\/v1$/, '') : rawBaseURL;

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor – attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Response interceptor – handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') ||
                           url.includes('/auth/register') ||
                           url.includes('/auth/forgot-password') ||
                           url.includes('/auth/verify-otp') ||
                           url.includes('/auth/reset-password');

    // Only redirect to /login if 401 occurs on protected routes, NOT during login/auth attempts
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('mms_token');
      localStorage.removeItem('mms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
