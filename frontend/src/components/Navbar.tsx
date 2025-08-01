import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Package, Sparkles, Home, Grid, Phone, Info, LogOut, ChevronLeft, Crown, Droplets, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { createCategorySlug, createProductSlug } from '../utils/slugify';
import { productsAPI, categoriesAPI } from '../utils/api';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  image: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  mainImage: string;
  // Add other product properties as needed
}

interface NavbarProps {
  onCartClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('👤 User loaded from localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchCategories();
    
    // إضافة مستمعين أكثر للأحداث لضمان دقة العداد
    const handleCartUpdate = () => {
      console.log('🔄 [Navbar] Cart update event received');
      fetchCartCount();
    };
    
    
    const handleCategoriesUpdate = () => fetchCategories();
    
    // استماع لكل الأحداث المختلفة من cartUtils
    const cartEvents = [
      'cartUpdated',
      'productAddedToCart',
      'cartCountChanged',
      'forceCartUpdate'
    ];
    
    const wishlistEvents = [
      'wishlistUpdated',
      'productAddedToWishlist',
      'productRemovedFromWishlist'
    ];
    
    // إضافة مستمعين للأحداث
    cartEvents.forEach(event => {
      window.addEventListener(event, handleCartUpdate);
    });
    
  
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    // استماع للتغييرات في localStorage أيضاً
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh') {
        console.log('🔄 [Navbar] Storage cart update detected');
        handleCartUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // تحديث فوري من localStorage للمستخدم الحالي
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);
      
      if (savedCartCount) {
        setCartItemsCount(parseInt(savedCartCount));
      }
      if (savedWishlistCount) {
        setWishlistItemsCount(parseInt(savedWishlistCount));
      }
    } else {
      // For guests, load from localStorage directly
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlistItemsCount(parsedWishlist.length);
          }
        } catch (error) {
          console.error('❌ [Navbar] Error parsing guest wishlist:', error);
          setWishlistItemsCount(0);
        }
      }
    }
    
    return () => {
      // إزالة جميع المستمعين
      cartEvents.forEach(event => {
        window.removeEventListener(event, handleCartUpdate);
      });
      
      
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        // المستخدم غير مسجل - تحميل من localStorage
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              console.log('📊 [Navbar] Cart count from localStorage:', totalItems);
              return;
            }
          } catch (parseError) {
            console.error('❌ [Navbar] Error parsing local cart:', parseError);
          }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      console.log('🔄 [Navbar] Fetching cart count for user:', user.id);
      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      const totalItems = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      console.log('📊 [Navbar] Cart count fetched:', totalItems);
      setCartItemsCount(totalItems);
      
      // حفظ العداد في localStorage بنفس طريقة cartUtils
      localStorage.setItem('lastCartCount', totalItems.toString());
      localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());
      
      console.log('💾 [Navbar] Cart count saved to localStorage:', totalItems);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching cart count:', error);
      
      // في حالة الخطأ، حاول تحميل من localStorage
      const localCart = localStorage.getItem('cartItems');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            return;
          }
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing local cart fallback:', parseError);
        }
      }
      
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };


  const fetchCategories = async () => {
    try {
      console.log('🔄 [Navbar] Fetching categories...');
      
      const categories = await apiCall(API_ENDPOINTS.CATEGORIES);
      
      console.log('✅ [Navbar] Categories loaded:', categories.length);
      console.log('📂 [Navbar] Categories data:', categories);
      
      setCategories(categories);
      
      // Cache categories in localStorage
      localStorage.setItem('cachedCategories', JSON.stringify(categories));
      
    } catch (error) {
      console.error('❌ [Navbar] Error fetching categories:', error);
      
      // Try to use cached categories as fallback
      const cached = localStorage.getItem('cachedCategories');
      if (cached) {
        try {
          const cachedCategories = JSON.parse(cached);
          console.log('🔄 [Navbar] Using cached categories:', cachedCategories.length);
          setCategories(cachedCategories);
          return;
        } catch (parseError) {
          console.error('❌ [Navbar] Error parsing cached categories:', parseError);
        }
      }
      
      // Set empty array if no cache available
      console.log('🔄 [Navbar] No categories available');
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    
    // دمج السلة المحلية مع سلة المستخدم
    const mergeLocalCartWithUserCart = async () => {
      try {
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (localItems.length > 0) {
            console.log('🔄 [Navbar] Merging local cart with user cart:', localItems.length, 'items');
            
            try {
              // استخدام Cart API الجديد للدمج
              const response = await apiCall(API_ENDPOINTS.USER_CART_MERGE(userData.id), {
                method: 'POST',
                body: JSON.stringify({ items: localItems })
              });
              
              if (response.success) {
                console.log('✅ [Navbar] Cart merged successfully:', response.mergedCount, 'items');
                
                // تحديث السلة من الخادم بعد الدمج
                const serverCartResponse = await apiCall(API_ENDPOINTS.USER_CART(userData.id));
                if (serverCartResponse.success) {
                  localStorage.setItem('cartItems', JSON.stringify(serverCartResponse.data));
                  console.log('✅ [Navbar] Cart updated from server, new cart size:', serverCartResponse.data.length);
                }
                
                // إطلاق حدث لتحديث السلة
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                
                if (response.mergedCount > 0) {
                  toast.success(`تم دمج ${response.mergedCount} منتج في سلة التسوق! 🛒`, {
                    position: "top-center",
                    autoClose: 3000,
                    style: {
                      background: '#10B981',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  });
                }
              }
            } catch (mergeError) {
              console.error('❌ [Navbar] Error merging cart:', mergeError);
              // لا نظهر خطأ للمستخدم، السلة المحلية ستبقى تعمل
            }
          } else {
            console.log('📭 [Navbar] Local cart is empty, no merge needed');
          }
        } else {
          console.log('📭 [Navbar] No local cart found');
        }
      } catch (error) {
        console.error('❌ [Navbar] Error in cart merge:', error);
      }
    };
    
    // تنفيذ دمج السلة
    mergeLocalCartWithUserCart();
    
    toast.success(`مرحباً بك ${userData.firstName}! 🎉`, {
      position: "top-center",
      autoClose: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold'
      }
    });
  };

  const handleLogout = () => {
    // مسح جميع بيانات المستخدم
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    
    // مسح بيانات السلة والمفضلة للمستخدم الحالي
    if (currentUser?.id) {
      localStorage.removeItem(`cartCount_${currentUser.id}`);
      localStorage.removeItem(`wishlistCount_${currentUser.id}`);
    }
    
    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);
    
    // إعادة توجيه للصفحة الرئيسية
    navigate('/');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-lg" dir="rtl">
        <style>
          {`
            /* Mobile Touch Optimization */
            @media (max-width: 1024px) {
              .mobile-touch-target {
                min-height: 40px;
                min-width: 40px;
                touch-action: manipulation;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .mobile-logo-area {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 50;
                pointer-events: auto;
                touch-action: manipulation;
                padding: 8px;
                border-radius: 12px;
              }
              
              .mobile-icons-area {
                position: relative;
                z-index: 60;
                pointer-events: auto;
                gap: 4px;
              }
              
              .mobile-menu-button {
                position: relative;
                z-index: 60;
                pointer-events: auto;
                touch-action: manipulation;
              }
            }
            
            /* Prevent text selection on touch */
            .no-select {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          `}
        </style>
        
        {/* Removed background and border for seamless overlay */}
        
        <div className="relative flex items-center justify-between h-16 px-4 lg:px-12">
          {/* Menu Button for Mobile - حجم مصغر ومتناسق */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button mobile-touch-target text-dark-200 hover:text-dark-100 p-2 sm:p-2.5 rounded-xl lg:hidden transition-all duration-300 ease-out transform hover:scale-110 bg-dark-800/60 backdrop-blur-xl border border-dark-600/50 shadow-md hover:shadow-lg z-[60] relative no-select"
            style={{ 
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            {isMenuOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Brand */}
          <Link to="/" onClick={()=>{setIsMenuOpen(false);window.scrollTo(0,0);}} className="text-2xl font-extrabold text-dark-400 select-none lg:absolute lg:right-8">
            after ads
          </Link>

          {/* Centered Links */}
          <ul className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8 text-sm font-medium text-dark-200">
            {[
              {label:'Home',to:'/'},
              {label:'Products',to:'/products'},
              {label:'Categories',to:'/categories'},
              {label:'Pages',to:'#'},
              {label:'Blog',to:'/blog'},
              {label:'Contact us',to:'/contact'}
            ].map(link=> (
              <Link key={link.label} to={link.to} className="hover:text-dark-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </ul>

          {/* Icons */}
          <div className="mobile-icons-area flex items-center gap-3 z-[60] relative">
            {/* Cart Icon - حجم مصغر */}
            <Link 
              to="/cart" 
              className="mobile-touch-target relative p-2 sm:p-2.5 text-dark-200 hover:text-dark-100 transition-all duration-300 ease-out transform hover:scale-110 bg-dark-800/60 backdrop-blur-xl border border-dark-600/50 rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span 
                  data-cart-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-dark-400 to-dark-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse border border-white"
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-dark-400/10 to-dark-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Wishlist Icon - حجم مصغر */}
            <Link 
              to="/wishlist" 
              className="mobile-touch-target relative p-2 sm:p-2.5 text-dark-200 hover:text-dark-100 transition-all duration-300 ease-out transform hover:scale-110 bg-dark-800/60 backdrop-blur-xl border border-dark-600/50 rounded-xl shadow-md hover:shadow-lg group z-[60] no-select"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistItemsCount > 0 && (
                <span 
                  data-wishlist-count
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-dark-400 to-dark-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse border border-white"
                >
                  {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-dark-400/10 to-dark-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* User Menu - حجم مصغر */}
            {user ? (
              <div className="relative z-[60]">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="mobile-touch-target flex items-center gap-1 sm:gap-2 text-dark-200 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-dark-800/70 to-dark-700/70 backdrop-blur-xl border border-dark-600/50 hover:bg-gradient-to-r hover:from-dark-800/90 hover:to-dark-700/90 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg group z-[60] no-select"
                  style={{ 
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                    minHeight: '40px'
                  }}
                >
                  <User size={16} className="sm:w-5 sm:h-5 text-dark-300" />
                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-dark-200 text-xs">{user.name?.split(' ')[0] || user.firstName || 'عميل'}</span>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-dark-400/10 to-dark-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-dark-800/95 backdrop-blur-2xl rounded-xl shadow-xl border border-dark-700/60 py-2 animate-[slideInFromTop_0.3s_ease-out] z-[70]">
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-900/40 via-dark-800/30 to-dark-900/40 rounded-xl" />
                    <div className="relative">
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-3 text-sm text-dark-200 hover:text-dark-100 hover:bg-dark-700/60 flex items-center gap-3 transition-all duration-300 ease-out group"
                      >
                        <LogOut size={16} className="group-hover:scale-110 transition-transform duration-300 text-red-400" />
                        <span className="font-medium">تسجيل خروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="mobile-touch-target relative bg-gradient-to-r from-dark-500 to-dark-400 text-dark-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl border border-dark-500/30 hover:from-dark-600 hover:to-dark-500 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg font-medium group z-[60] no-select"
                style={{ 
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  minHeight: '40px'
                }}
              >
                <div className="flex items-center gap-1">
                  <User size={14} className="sm:w-4 sm:h-4 text-dark-50" />
                  <span className="text-xs sm:text-sm font-semibold">دخول</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-dark-400/20 to-dark-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-dark-400/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-dark-500/10 rounded-full blur-3xl opacity-50" />
      </nav>

      {/* Premium Mobile Menu - خارج النافبار لأعلى z-index */}
      <div className={`lg:hidden fixed inset-0 z-[999999] transition-all duration-500 ease-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {/* Backdrop Overlay - خلفية معتمة */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-lg transition-all duration-500 ease-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Mobile Menu Panel - لوحة القائمة */}
        <div className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-dark-800/98 backdrop-blur-3xl shadow-2xl border-l border-dark-700/60 transition-all duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Premium Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900/95 via-dark-800/80 to-dark-900/95" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-dark-700/40 to-transparent" />
          
          {/* Content Container */}
          <div className="relative h-full flex flex-col overflow-y-auto">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-dark-800/90 to-dark-700/90 backdrop-blur-sm border-b border-dark-600/60 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-dark-500 to-dark-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Menu className="w-6 h-6 text-dark-50" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-100">القائمة الرئيسية</h3>
                    <p className="text-sm text-dark-300">تصفح أقسام المتجر</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 text-dark-300 hover:text-dark-100 hover:bg-dark-700/60 rounded-2xl transition-all duration-300 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Navigation Links Section */}
            <div className="relative p-6 space-y-3">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-dark-300 uppercase tracking-wider mb-4 px-2">التنقل السريع</h4>
                
                {/* الرئيسية */}
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full text-right block px-4 py-4 text-dark-300 hover:text-dark-100 hover:bg-gradient-to-r hover:from-dark-700 hover:to-dark-800/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-dark-600/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                    isActive('/') ? 'bg-gradient-to-r from-dark-700 to-dark-800 border-dark-600/60 text-dark-100 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-dark-500 to-dark-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Home className="w-5 h-5 text-dark-50" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">الرئيسية</span>
                      <div className="text-xs text-dark-400 mt-0.5">العودة للصفحة الرئيسية</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-dark-400 group-hover:text-dark-200 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>

                {/* جميع المنتجات */}
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full text-right block px-4 py-4 text-dark-300 hover:text-dark-100 hover:bg-gradient-to-r hover:from-dark-700 hover:to-dark-800/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-dark-600/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                    isActive('/products') ? 'bg-gradient-to-r from-dark-700 to-dark-800 border-dark-600/60 text-dark-100 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-dark-500 to-dark-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Package className="w-5 h-5 text-dark-50" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">جميع المنتجات</span>
                      <div className="text-xs text-dark-400 mt-0.5">تصفح كامل للمنتجات</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-dark-400 group-hover:text-dark-200 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>

                {/* جميع التصنيفات */}
                <Link
                  to="/categories"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full text-right block px-4 py-4 text-dark-300 hover:text-dark-100 hover:bg-gradient-to-r hover:from-dark-700 hover:to-dark-800/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-dark-600/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                    isActive('/categories') ? 'bg-gradient-to-r from-dark-700 to-dark-800 border-dark-600/60 text-dark-100 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-dark-500 to-dark-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Grid className="w-5 h-5 text-dark-50" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">جميع التصنيفات</span>
                      <div className="text-xs text-dark-400 mt-0.5">استكشف التصنيفات المتاحة</div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-dark-400 group-hover:text-dark-200 group-hover:-translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </div>

              {/* Categories Section */}
              {categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-dark-300 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                    <span>التصنيفات</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-dark-500 to-transparent"></div>
                    <span className="text-xs bg-dark-700 px-2 py-1 rounded-full text-dark-200">{categories.length}</span>
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          console.log('📱 Mobile Category clicked:', category.name, 'ID:', category.id);
                          const categorySlug = createCategorySlug(category.id, category.name);
                          navigate(`/category/${categorySlug}`);
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full text-right block px-4 py-4 text-dark-300 hover:text-dark-100 hover:bg-gradient-to-r hover:from-dark-700 hover:to-dark-800/50 rounded-2xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-dark-600/50 cursor-pointer text-base transform hover:scale-[1.02] ${
                          isActive(`/category/${createCategorySlug(category.id, category.name)}`) ? 'bg-gradient-to-r from-dark-700 to-dark-800 border-dark-600/60 text-dark-100 shadow-md' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-dark-500 to-dark-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <span className="text-dark-50 text-sm font-bold">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold">{category.name}</span>
                            <div className="text-xs text-dark-400 mt-0.5">استكشف مجموعة {category.name}</div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-dark-400 group-hover:text-dark-200 group-hover:-translate-x-1 transition-all duration-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State للتصنيفات */}
              {categories.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-dark-400" />
                  </div>
                  <h3 className="font-bold text-dark-200 mb-2">لا توجد تصنيفات</h3>
                  <p className="text-dark-300 text-sm">سيتم إضافة التصنيفات قريباً</p>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="relative mt-auto border-t border-dark-700/50 bg-gradient-to-r from-dark-800/60 to-dark-700/60 p-6">
              <div className="text-center">
                <div className="text-sm text-dark-300 mb-2">
                  مرحباً بك في متجر
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-dark-400 to-dark-300 bg-clip-text text-transparent">
                  after ads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;