import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token attached to request');
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/';
      console.error('Unauthorized - token cleared');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (credentials) => api.post('/auth/register', credentials),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Links API
export const linksAPI = {
  createLink: (data) => api.post('/links', data),
  getAllLinks: () => api.get('/links'),
  getLink: (slug) => api.get(`/links/${slug}`),
  updateLink: (slug, data) => api.put(`/links/${slug}`, data),
  deleteLink: (slug) => api.delete(`/links/${slug}`),
  getStats: () => api.get('/links/stats/overview'),
};

// Logs API
export const logsAPI = {
  getLogs: (filters) => api.get('/logs', { params: filters }),
  getStats: () => api.get('/logs/stats/overview'),
  clearLogs: () => api.delete('/logs/clear'),
};

// Domains API
export const domainsAPI = {
  add: (domain) => api.post('/domains/add', { domain }),
  list: () => api.get('/domains/list'),
  verify: (domain) => api.get(`/domains/verify/${encodeURIComponent(domain)}`),
  poll: (domain) => api.get(`/domains/poll/${encodeURIComponent(domain)}`),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  toggleCloaking: () => api.post('/settings/toggle'),
};

export default api;
