// API Configuration with Enhanced Error Handling and Fallback Support

const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

console.log('🔧 API Configuration:', {
  isDevelopment,
  baseURL: API_BASE_URL,
  hostname: window.location.hostname
});

// Force fallback mode if Firebase is having permission issues
const FORCE_FALLBACK_MODE = false; // Set to true to use mock data temporarily

// Image URL builder function
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with '/', return as is (absolute path)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Otherwise, prepend with /images/
  return `/images/${imagePath}`;
};

// API URL builder function
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}/${endpoint}`;
};

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id) => `products/${id}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id) => `categories/${id}`,
  
  // Orders
  ORDERS: 'orders',
  ORDER_BY_ID: (id) => `orders/${id}`,
  
  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_BY_ID: (id) => `customers/${id}`,
  
  // Coupons
  COUPONS: 'coupons',
  COUPON_BY_ID: (id) => `coupons/${id}`,
  
  // Cart - NEW
  CART: 'cart',
  USER_CART: (userId) => `cart/user/${userId}`,
  CART_ITEM: (itemId) => `cart/${itemId}`,
  CLEAR_CART: (userId) => `cart/user/${userId}/clear`,
  
  // Wishlist - NEW
  WISHLISTS: 'wishlists',
  USER_WISHLIST: (userId) => `wishlists/user/${userId}`,
  WISHLIST_ITEM: (itemId) => `wishlists/${itemId}`,
  WISHLIST_CHECK: (userId, productId) => `wishlists/user/${userId}/check/${productId}`,
  WISHLIST_REMOVE_PRODUCT: (userId, productId) => `wishlists/user/${userId}/product/${productId}`,
  CLEAR_WISHLIST: (userId) => `wishlists/user/${userId}/clear`,
  
  // Reviews - NEW
  REVIEWS: 'reviews',
  PRODUCT_REVIEWS: (productId) => `reviews/product/${productId}`,
  USER_REVIEWS: (userId) => `reviews/user/${userId}`,
  REVIEW_BY_ID: (id) => `reviews/${id}`,
  REVIEW_HELPFUL: (id) => `reviews/${id}/helpful`,
  
  // Dashboard
  DASHBOARD: 'dashboard',
  
  // Initialize Collections
  INIT_COLLECTIONS: 'init-collections',
  
  // Auth - UPDATED
  AUTH: 'auth/admin',
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  
  // Test
  TEST_FIREBASE: 'test-firebase'
};

// Enhanced API call function with better error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  const timeoutMs = 15000; // 15 seconds timeout
  
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`, {
    endpoint,
    forceFallback: FORCE_FALLBACK_MODE,
    timestamp: new Date().toISOString()
  });

  // Add fallback mode header if enabled
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(FORCE_FALLBACK_MODE && { 'X-Force-Fallback': 'true' })
  };

  const fetchOptions = {
    method: 'GET',
    headers,
    ...options
  };

  try {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    // Make the API call with timeout
    const fetchPromise = fetch(url, fetchOptions);
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    console.log(`📡 Response Status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      
      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log(`✅ API Success for ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'Object received');
    
    return data;

  } catch (error) {
    console.error(`❌ API Call Failed for ${endpoint}:`, {
      message: error.message,
      type: error.name,
      url,
      method: fetchOptions.method
    });

    // Enhanced error messages in Arabic
    if (error.message.includes('timeout')) {
      throw new Error('انتهت مهلة الاتصال - يرجى المحاولة مرة أخرى');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('فشل في الاتصال بالخادم - تحقق من الاتصال بالإنترنت');
    } else if (error.message.includes('permission') || error.message.includes('PERMISSION')) {
      throw new Error('مشكلة في صلاحيات قاعدة البيانات - يتم استخدام البيانات البديلة');
    } else {
      throw new Error(error.message || 'حدث خطأ غير متوقع');
    }
  }
}; 