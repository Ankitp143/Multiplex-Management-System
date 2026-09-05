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
    if (error.response?.status === 401) {
      localStorage.removeItem('mms_token');
      localStorage.removeItem('mms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
