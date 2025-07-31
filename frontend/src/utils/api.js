// API Base URL - will be automatically detected in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/products?${searchParams}`);
  },
  
  getById: (id) => apiRequest(`/products/${id}`),
  
  create: (productData) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  update: (id, productData) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
  
  getByCategory: (categoryId) => apiRequest(`/products/category/${categoryId}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/categories?${searchParams}`);
  },
  
  getById: (id) => apiRequest(`/categories/${id}`),
  
  create: (categoryData) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  
  update: (id, categoryData) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  
  delete: (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/orders?${searchParams}`);
  },
  
  getById: (id) => apiRequest(`/orders/${id}`),
  
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  update: (id, orderData) => apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  }),
  
  delete: (id) => apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  }),
  
  getStats: () => apiRequest('/orders/stats'),
  
  getByCustomer: (phone) => apiRequest(`/orders/customer/${phone}`),
};

// Coupons API
export const couponsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/coupons?${searchParams}`);
  },
  
  getById: (id) => apiRequest(`/coupons/${id}`),
  
  create: (couponData) => apiRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData),
  }),
  
  update: (id, couponData) => apiRequest(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(couponData),
  }),
  
  delete: (id) => apiRequest(`/coupons/${id}`, {
    method: 'DELETE',
  }),
  
  validate: (code, orderValue) => apiRequest('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderValue }),
  }),
  
  apply: (code) => apiRequest('/coupons/apply', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard'),
  
  getAnalytics: (period = '30') => apiRequest(`/dashboard/analytics?period=${period}`),
};

// Upload API
export const uploadAPI = {
  single: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return apiRequest('/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  },
  
  multiple: (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);
    
    return apiRequest('/upload/multiple', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  },
  
  delete: (publicId) => apiRequest(`/upload/${publicId}`, {
    method: 'DELETE',
  }),
  
  getSignature: (folder = 'products') => apiRequest(`/upload/signature?folder=${folder}`),
};

// Auth API
export const authAPI = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  adminLogin: (username, password) => apiRequest('/auth/admin', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  
  register: (email, password, adminKey) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, adminKey }),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  
  resetPassword: (email) => apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  verifyToken: (token) => apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
  
  getCurrentUser: () => apiRequest('/auth/me'),
};

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // For JWT tokens, check expiration
    if (token.startsWith('eyJ')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    }
    
    // For our demo base64 tokens
    const decoded = JSON.parse(atob(token));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export default {
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  coupons: couponsAPI,
  dashboard: dashboardAPI,
  upload: uploadAPI,
  auth: authAPI,
  setAuthToken,
  getAuthToken,
  isAuthenticated,
}; 