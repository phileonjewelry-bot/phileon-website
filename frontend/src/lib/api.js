import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phileon_admin_token');
  if (token && config.url.includes('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('phileon_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Public API
export const publicApi = {
  getCollections: () => api.get('/collections'),
  getCollection: (slug) => api.get(`/collections/${slug}`),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (slug) => api.get(`/products/${slug}`),
  getTestimonials: (params) => api.get('/testimonials', { params }),
  getFAQ: (params) => api.get('/faq', { params }),
  getSettings: () => api.get('/settings'),
  createInquiry: (data) => api.post('/inquiries', data),
  createConsultation: (data) => api.post('/consultations', data),
};

// Admin API
export const adminApi = {
  login: (data) => api.post('/admin/login', data),
  getStats: () => api.get('/admin/stats'),
  
  // Collections
  getCollections: () => api.get('/admin/collections'),
  createCollection: (data) => api.post('/admin/collections', data),
  updateCollection: (id, data) => api.put(`/admin/collections/${id}`, data),
  deleteCollection: (id) => api.delete(`/admin/collections/${id}`),
  
  // Products
  getProducts: () => api.get('/admin/products'),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Inquiries
  getInquiries: (params) => api.get('/admin/inquiries', { params }),
  updateInquiry: (id, data) => api.put(`/admin/inquiries/${id}`, data),
  
  // Consultations
  getConsultations: (params) => api.get('/admin/consultations', { params }),
  updateConsultation: (id, data) => api.put(`/admin/consultations/${id}`, data),
  
  // Testimonials
  getTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),
  
  // FAQ
  getFAQ: () => api.get('/admin/faq'),
  createFAQ: (data) => api.post('/admin/faq', data),
  updateFAQ: (id, data) => api.put(`/admin/faq/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/faq/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export default api;
