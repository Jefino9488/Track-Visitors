import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Visitor API
export const visitorApi = {
  signIn: (visitorData) => api.post('/visitors/sign-in', visitorData),
  signOut: (visitorNumber) => api.post('/visitors/sign-out', { visitorNumber }),
  getVisitor: (visitorNumber) => api.get(`/visitors/${visitorNumber}`),
};

// Admin API
export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getVisitors: (page = 1, limit = 10, search = '') => 
    api.get('/admin/visitors', { 
      params: { page, limit, search } 
    }),
};

export default api;