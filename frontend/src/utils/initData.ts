import { getMockProducts, getMockCategories } from './mockData';

// Function to initialize the application with mock data
export const initializeApp = () => {
  console.log('🚀 Initializing application...');
  
  // Only load mock data in development mode and when API is not available
  if (import.meta.env.MODE === 'development' && window.location.hostname === 'localhost') {
    console.log('🔧 Development mode: Loading mock data as fallback');
    
    // Load mock data to localStorage if not already present
    const products = getMockProducts();
    const categories = getMockCategories();
    
    console.log('✅ App initialized with mock data:', {
      products: products.length,
      categories: categories.length
    });
    
    return {
      products,
      categories
    };
  } else {
    console.log('🌐 Production mode: Using real API data only');
    
    // Clear any existing mock data in production
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    
    return {
      products: [],
      categories: []
    };
  }
};

// Auto-initialize when the module is imported
initializeApp(); 