import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const visitorApi = {
  signIn: (visitorData) => api.post('/visitors/sign-in', visitorData),
  signOut: (visitorNumber) => api.post('/visitors/sign-out', { visitorNumber }),
  getVisitor: (visitorNumber) => api.get(`/visitors/${visitorNumber}`),
};

export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getVisitors: (page = 1, limit = 10, search = '') => 
    api.get('/admin/visitors', { 
      params: { page, limit, search } 
    }),
  exportExcel: () => {
    window.open(`${API_URL}/admin/export/excel`, '_blank');
    return Promise.resolve({ success: true });
  },
  exportPdf: () => {
    window.open(`${API_URL}/admin/export/pdf`, '_blank');
    return Promise.resolve({ success: true });
  },
  sendExcelEmail: () => api.post('/admin/send-excel-email'),
  deleteVisitor: (id) => api.delete(`/admin/visitors/${id}`),
};
