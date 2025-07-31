import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FleurNavbar from './components/FleurNavbar';
import App from './App.tsx';
// Direct import for debugging
import './index.css';
import { initCartStorageFix } from './utils/cartStorageFix.ts';
// Initialize mock data
import './utils/initData';

// Lazy load components for better performance
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const ProductsByCategory = React.lazy(() => import('./components/ProductsByCategory'));
const ShoppingCart = React.lazy(() => import('./components/ShoppingCart'));
const CartDiagnostics = React.lazy(() => import('./components/CartDiagnostics'));
const Checkout = React.lazy(() => import('./components/Checkout'));
const Wishlist = React.lazy(() => import('./components/Wishlist'));
const Login = React.lazy(() => import('./Login'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const ServiceForm = React.lazy(() => import('./ServiceForm'));
const ServiceDetails = React.lazy(() => import('./ServiceDetails'));
const ProductForm = React.lazy(() => import('./components/ProductForm'));
const CategoryForm = React.lazy(() => import('./components/CategoryForm'));
const CategoryAdd = React.lazy(() => import('./CategoryAdd'));
const CategoryEdit = React.lazy(() => import('./CategoryEdit'));
const CouponForm = React.lazy(() => import('./components/CouponForm'));
const AllProducts = React.lazy(() => import('./components/AllProducts'));
const ThankYou = React.lazy(() => import('./components/ThankYou'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Media = React.lazy(() => import('./pages/Media'));
const Partners = React.lazy(() => import('./pages/Partners'));
const CategoryPage = React.lazy(() => import('./components/CategoryPage'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const ReturnPolicy = React.lazy(() => import('./components/ReturnPolicy'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#FAF8F5]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#8B5A3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-xl text-[#6B4226] font-medium">جاري التحميل...</div>
    </div>
  </div>
);

// تعريف Props لـ ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check for authentication more reliably
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authToken = localStorage.getItem('authToken');
  const adminUser = localStorage.getItem('adminUser');
  
  console.log('🔐 ProtectedRoute check:', {
    isAuthenticated,
    hasAuthToken: !!authToken,
    hasAdminUser: !!adminUser
  });
  
  // Function to check if token is valid (not expired) - with better error handling
  const isTokenValid = () => {
    if (!authToken) return false;
    
    try {
      // Try to decode the token
      const decoded = JSON.parse(atob(authToken));
      
      // Check if token has expiration and if it's not expired
      if (decoded.exp && typeof decoded.exp === 'number') {
        return decoded.exp > Date.now();
      }
      
      // If no expiration, consider it valid for now
      return true;
    } catch (error) {
      console.log('Token validation error:', error);
      // Don't immediately invalidate, allow fallback to other checks
      return false;
    }
  };
  
  // Multiple validation checks - be more forgiving
  const hasValidAuth = isAuthenticated || 
                      (authToken && isTokenValid()) || 
                      adminUser ||
                      // Allow access if this is the admin dashboard and we have some form of auth
                      (window.location.pathname.startsWith('/admin') && (isAuthenticated || authToken || adminUser));
  
  console.log('🔐 Final auth decision:', hasValidAuth);
  
  // Only clear tokens if we're absolutely sure they're invalid
  if (!hasValidAuth && !isAuthenticated && !authToken && !adminUser) {
    console.log('🧹 Clearing invalid auth data');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
  }
  
  // If still no valid auth, redirect to login
  if (!hasValidAuth) {
    console.log('❌ No valid authentication, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authentication valid, showing protected content');
  return <>{children}</>;
};

// مكون للتحكم في النافبار والـ padding
const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/admin'];

  // التحقق إذا المسار الحالي هو /login أو بيبدأ بـ /admin
  const shouldHideNavbar = hideNavbarPaths.some(path => 
    path === '/login' ? location.pathname === path : location.pathname.startsWith(path)
  );

  // إضافة responsive padding بس لو النافبار موجود
  // للصفحة الرئيسية، نخلي الصورة تبدأ من النافبار مباشرة
  const isHomePage = location.pathname === '/';
  const contentClass = shouldHideNavbar ? '' : isHomePage ? '' : 'pt-16 sm:pt-20 lg:pt-24';

  return (
    <>
      {!shouldHideNavbar && <FleurNavbar />}
      <div className={contentClass}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* E-commerce Routes */}
            <Route path="/" element={<App />} />
            <Route path="/products" element={<AllProducts />} />
            {/* Single product route that handles both IDs and slugs */}
            <Route path="/product/:id" element={<ProductDetail />} />
            {/* SEO-friendly category routes */}
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/cart/diagnostics" element={<CartDiagnostics />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Services Management Routes (Legacy) */}
            <Route path="/admin/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/admin/service/add" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
            <Route path="/admin/service/edit/:id" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
            
            {/* New E-commerce Management Routes */}
            <Route path="/admin/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute><ProductForm isEdit={true} /></ProtectedRoute>} />
            
            {/* Additional routes for Dashboard compatibility */}
            <Route path="/admin/product/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/admin/product/edit/:id" element={<ProtectedRoute><ProductForm isEdit={true} /></ProtectedRoute>} />
            
            {/* Coupon Management Routes */}
            <Route path="/admin/coupon/add" element={<ProtectedRoute><CouponForm /></ProtectedRoute>} />
            <Route path="/admin/coupon/edit/:id" element={<ProtectedRoute><CouponForm isEdit={true} /></ProtectedRoute>} />
            
            {/* Category Management Routes - Legacy */}
            <Route path="/admin/category/add" element={<ProtectedRoute><CategoryAdd /></ProtectedRoute>} />
            <Route path="/admin/category/edit/:id" element={<ProtectedRoute><CategoryEdit /></ProtectedRoute>} />
            
            {/* Category Management Routes - New */}
            <Route path="/admin/categories/new" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
            <Route path="/admin/categories/edit/:id" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
            
            {/* Other Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/media" element={<Media />} />
            <Route path="/partners" element={<Partners />} />
            
            {/* Policy Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

// إصلاح localStorage للسلة قبل بدء التطبيق
initCartStorageFix();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <LayoutWrapper />
      {/* Global ToastContainer for all pages */}
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        style={{ 
          zIndex: 999999,
          top: '80px',
          fontSize: '16px'
        }}
        toastStyle={{
          minHeight: '60px',
          fontSize: '16px'
        }}
      />
    </Router>
  </React.StrictMode>
);