// API Configuration for Serverless environment
export const API_CONFIG = {
  // للتطوير المحلي مع Netlify Dev
  development: {
    baseURL: 'http://localhost:8888/.netlify/functions',
  },
  // للإنتاج - Netlify Functions
  production: {
    baseURL: '/.netlify/functions', // الصيغة الصحيحة لـ Netlify Functions
  }
};

// الحصول على الـ base URL حسب البيئة
export const getApiBaseUrl = (): string => {
  // تحقق من البيئة
  const isDevelopment = import.meta.env.MODE === 'development';
  const baseUrl = isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;
  
  console.log('🔧 API Configuration:', {
    isDevelopment,
    baseURL: baseUrl,
    hostname: window.location.hostname
  });
  
  return baseUrl;
};

// دالة مساعدة لبناء URL كامل للـ Serverless APIs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // إزالة الـ slash الأول من endpoint إذا كان موجود
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// دالة مساعدة لبناء URL الصور - محسنة للأداء
export const buildImageUrl = (imagePath: string | null | undefined): string => {
  // Use a better placeholder SVG
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTYwIiByPSI0MCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNTAgMjIwTDE4MCAyMDBMMjAwIDIyMEwyNDAgMjgwSDE1MFYyMjBaIiBmaWxsPSIjOUNBM0FGIi8+PHRleHQgeD0iMjAwIiB5PSIzMjAiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+2YTYpyDYqtmI2KzYryDYtdmI2LHYqTwvdGV4dD48L3N2Zz4K';

  // Handle null, undefined, or empty strings
  if (!imagePath || imagePath.trim() === '') {
    console.log('⚠️ [buildImageUrl] Empty image path, using placeholder');
    return placeholder;
  }

  const cleanPath = imagePath.trim();

  // Handle data URLs (base64 images)
  if (cleanPath.startsWith('data:image/')) {
    console.log('✅ [buildImageUrl] Using data URL as is');
    return cleanPath;
  }
  
  // NEW: Handle data URLs that erroneously have a leading slash ("/data:image/")
  if (cleanPath.startsWith('/data:image/')) {
    console.warn('⚠️ [buildImageUrl] Detected leading slash in data URL, removing...');
    return cleanPath.slice(1); // Remove the leading slash to form a valid data URL
  }
  
  // Handle Cloudinary URLs
  if (cleanPath.includes('cloudinary.com') || cleanPath.includes('res.cloudinary.com')) {
    console.log('✅ [buildImageUrl] Using Cloudinary URL as is');
    return cleanPath;
  }
  
  // Handle absolute URLs (HTTP/HTTPS)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    console.log('✅ [buildImageUrl] Using absolute URL as is');
    return cleanPath;
  }
  
  // Handle relative paths from public folder
  if (cleanPath.startsWith('/')) {
    console.log('✅ [buildImageUrl] Using relative path from root');
    return cleanPath;
  }

  // Handle relative paths without leading slash
  if (cleanPath.includes('/')) {
    console.log('✅ [buildImageUrl] Adding leading slash to relative path');
    return `/${cleanPath}`;
  }
  
  // Handle just filename
  console.log('✅ [buildImageUrl] Adding leading slash to filename');
  return `/${cleanPath}`;
};

// دالة مركزية لجميع API calls للـ Serverless
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  console.log('🚀 Starting API call:', {
    endpoint,
    url,
    method: options.method || 'GET'
  });
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    } as Record<string, string>,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    (defaultOptions.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
  };
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    console.log('📡 Making fetch request...');
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📩 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData = {};
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          console.warn('Failed to parse error JSON:', e);
        }
      } else {
        const textError = await response.text();
        console.error('Non-JSON error response:', textError);
        errorData = { message: textError };
      }
      
      const errorMessage = (errorData as any).error || (errorData as any).message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ API Error:', {
        url,
        status: response.status,
        error: errorMessage,
        errorData
      });
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', {
      endpoint,
      dataReceived: !!data
    });
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏰ API Request Timeout:', url);
      throw new Error('انتهت مهلة الطلب - يرجى المحاولة مرة أخرى');
    }
    
    console.error('💥 API Call Failed:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Improved error message for the user
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('خطأ في الاتصال - تأكد من اتصالك بالإنترنت');
      }
      throw error;
    }
    
    throw new Error('خطأ غير متوقع - يرجى المحاولة مرة أخرى');
  }
};

// تصدير الثوابت المفيدة للـ Serverless APIs
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  SERVICES: 'services',
  PRODUCT_BY_ID: (id: string | number) => `products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `products/category/${categoryId}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id: string | number) => `categories/${id}`,
  
  // Orders
  ORDERS: 'orders',
  ORDER_BY_ID: (id: string | number) => `orders/${id}`,
  ORDER_STATS: 'orders/stats',
  ORDERS_BY_CUSTOMER: (phone: string) => `orders/customer/${phone}`,
  
  // Coupons
  COUPONS: 'coupons',
  COUPON_BY_ID: (id: string | number) => `coupons/${id}`,
  VALIDATE_COUPON: 'coupons/validate',
  APPLY_COUPON: 'coupons/apply',
  
  // Customers - NEW
  CUSTOMERS: 'customers',
  CUSTOMER_BY_ID: (id: string | number) => `customers/${id}`,
  CUSTOMER_ORDERS: (id: string | number) => `customers/${id}/orders`,
  
  // Cart - NEW
  CART: 'cart',
  USER_CART: (userId: string | number) => `cart/user/${userId}`,
  USER_CART_COUNT: (userId: string | number) => `cart/user/${userId}/count`,
  USER_CART_MERGE: (userId: string | number) => `cart/user/${userId}/merge`,
  CART_ITEM: (itemId: string | number) => `cart/${itemId}`,
  
  // Dashboard
  DASHBOARD: 'dashboard',
  DASHBOARD_ANALYTICS: (period: string) => `dashboard/analytics?period=${period}`,
  
  // Upload
  UPLOAD: 'upload',
  UPLOAD_MULTIPLE: 'upload/multiple',
  UPLOAD_DELETE: (publicId: string) => `upload/${publicId}`,
  UPLOAD_SIGNATURE: (folder: string) => `upload/signature?folder=${folder}`,
  
  // Auth - Updated to use customers function
  LOGIN: 'customers/login',
  REGISTER: 'customers/register',
  LOGOUT: 'customers/logout',
  RESET_PASSWORD: 'customers/reset-password',
  
  // Legacy Auth endpoints (keeping for backward compatibility)
  AUTH_LOGIN: 'customers/login',
  AUTH_ADMIN: 'auth/admin',
  AUTH_REGISTER: 'customers/register',
  AUTH_LOGOUT: 'customers/logout',
  AUTH_RESET_PASSWORD: 'customers/reset-password',
  AUTH_VERIFY: 'auth/verify',
  AUTH_ME: 'auth/me',
  
  // Legacy endpoints for backward compatibility
  CHECKOUT: 'orders', // Orders endpoint handles checkout
  HEALTH: 'dashboard', // Dashboard endpoint serves as health check
  notifications: `${getApiBaseUrl()}/.netlify/functions/notifications`
}; 