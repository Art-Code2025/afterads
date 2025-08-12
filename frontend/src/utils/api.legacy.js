// API Base URL - will be automatically detected in production
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 [API] Making request:', {
    endpoint,
    url,
    method: options.method || 'GET',
    hasBody: !!options.body,
    timestamp: new Date().toISOString()
  });
  
  if (options.body) {
    console.log('📦 [API] Request body:', options.body);
  }
  
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
    console.log('📡 [API] Sending fetch request...');
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log('📡 [API] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data
    });
    
    if (!response.ok) {
      console.error('❌ [API] Request failed:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ [API] Request successful:', data);
    return data;
  } catch (error) {
    console.error('💥 [API] Request Error:', {
      endpoint,
      url,
      options,
      error: error.message,
      stack: error.stack
    });
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
    console.log('📋 [OrdersAPI] getAll called with params:', params);
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/orders?${searchParams}`);
  },
  
  getById: (id) => {
    console.log('🔍 [OrdersAPI] getById called for order:', id);
    return apiRequest(`/orders/${id}`);
  },
  
  create: (orderData) => {
    console.log('📝 [OrdersAPI] create called with order data:', JSON.stringify(orderData, null, 2));
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  update: (id, orderData) => {
    console.log('✏️ [OrdersAPI] update called for order:', id, 'with data:', JSON.stringify(orderData, null, 2));
    return apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },
  
  delete: (id) => {
    console.log('🗑️ [OrdersAPI] delete called for order:', id);
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
  
  getStats: () => {
    console.log('📊 [OrdersAPI] getStats called');
    return apiRequest('/orders/stats');
  },
  
  getByCustomer: (phone) => {
    console.log('👤 [OrdersAPI] getByCustomer called for phone:', phone);
    return apiRequest(`/orders/customer/${phone}`);
  },
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

// Payment API
export const paymentAPI = {
  createPaymentLink: (paymentData) => {
    console.log('💳 [PaymentAPI] createPaymentLink called with:', JSON.stringify(paymentData, null, 2));
    return apiRequest('/payment/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  checkPaymentStatus: (orderId) => {
    console.log('🔍 [PaymentAPI] checkPaymentStatus called for order:', orderId);
    return apiRequest(`/payment/status/${orderId}`);
  },
  
  processCallback: (callbackData) => {
    console.log('📞 [PaymentAPI] processCallback called with:', JSON.stringify(callbackData, null, 2));
    return apiRequest('/payment/callback', {
      method: 'POST',
      body: JSON.stringify(callbackData),
    });
  },
};

// Static Pages API
export const staticPagesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/static-pages${queryString ? `?${queryString}` : ''}`);
  },

  getBySlug: (slug) => {
    return apiRequest(`/static-pages/${slug}`);
  },

  create: (pageData) => {
    return apiRequest('/static-pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  },

  update: (id, pageData) => {
    return apiRequest(`/static-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  },

  delete: (id) => {
    return apiRequest(`/static-pages/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  coupons: couponsAPI,
  dashboard: dashboardAPI,
  upload: uploadAPI,
  auth: authAPI,
  payment: paymentAPI,
  staticPages: staticPagesAPI,
  setAuthToken,
  getAuthToken,
  isAuthenticated,
};