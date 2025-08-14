import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Menu, X, Search, ShoppingCart, Heart, Package, Gift, Sparkles, ArrowLeft, Plus, Minus, Star, Users, Shield, Crown, Truck, Medal, Award, Tag, Zap, ArrowRight, Flame, TrendingUp, Eye } from 'lucide-react';
import { FaInstagram, FaTiktok, FaSnapchatGhost, FaWhatsapp, FaUser } from 'react-icons/fa';
// Import components directly for debugging
import ImageSlider from './components/ImageSlider';
import ProductCard from './components/ProductCard';
import WhatsAppButton from './components/WhatsAppButton';
import ShippingOfferPopup from './components/ShippingOfferPopup';
import cover1 from './assets/cover1.jpg';
import { createCategorySlug, createProductSlug } from './utils/slugify';
import cover2 from './assets/cover2.jpg';
import cover3 from './assets/cover3.jpg';
// Import API functions
import api, { productsAPI, servicesAPI, categoriesAPI } from './utils/api';
import { buildImageUrl } from './config/api';
import { addToCartUnified } from './utils/cartUtils';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CustomerFavoritesSection from './components/CustomerFavoritesSection';
import DiscoverNewSection from './components/DiscoverNewSection';
import AllServicesSection from './components/AllServicesSection';
import { cacheManager, CACHE_KEYS } from './utils/cacheManager';
// استيراد سكريپت بيانات العطور للداشبورد
// import './utils/runPerfumeScript';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
  rating?: number;
  brand?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface CategoryProducts {
  category: Category;
  products: Product[];
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
}

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts[]>([]);
  const [loading, setLoading] = useState(false); // تم تغييرها من true إلى false
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const heroImages = [cover1, cover2, cover3];
  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        return;
      }
      
      const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      if (Array.isArray(cart)) {
        const totalCount = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Load wishlist from localStorage
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlist(parsedWishlist);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل المفضلة:', error);
        setWishlist([]);
      }
    };

    // Wishlist functionality has been removed
    setWishlist([]);
    
    return () => {
      // Cleanup function - no event listeners to remove
    };
  }, []);

  // Note: Wishlist is saved to localStorage directly in handleWishlistToggle function
  // No need for automatic saving useEffect to avoid infinite loops

  const handleCategoriesUpdate = () => {
    fetchCategoriesWithProducts();
  };

  useEffect(() => {
    fetchCategoriesWithProducts();

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('productsUpdated', handleCategoriesUpdate);
    // Add listener for product creation from dashboard
    window.addEventListener('productCreated', handleCategoriesUpdate);
    window.addEventListener('productUpdated', handleCategoriesUpdate);
    window.addEventListener('productDeleted', handleCategoriesUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('productsUpdated', handleCategoriesUpdate);
      window.removeEventListener('productCreated', handleCategoriesUpdate);
      window.removeEventListener('productUpdated', handleCategoriesUpdate);
      window.removeEventListener('productDeleted', handleCategoriesUpdate);
    };
  }, []);

  // Load static pages from localStorage on component mount
  useEffect(() => {
    const savedPages = localStorage.getItem('staticPages');
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        if (Array.isArray(parsedPages)) {
          setStaticPages(parsedPages);
          console.log('🚀 Initial load: Static pages from localStorage');
        }
      } catch (error) {
        console.error('❌ Error parsing saved static pages on mount:', error);
      }
    }
  }, []);

  // Fetch static pages from API
  useEffect(() => {
    fetchStaticPages();
  }, []);

  const fetchStaticPages = async () => {
    // Define main site pages that should always be present in quick links
    const mainSitePages: StaticPage[] = [
      {
        id: 'main-1',
        title: 'الرئيسية',
        slug: '/',
        content: '',
        metaDescription: 'الصفحة الرئيسية',
        isActive: true,
        showInFooter: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'main-2',
        title: 'المنتجات',
        slug: '/products',
        content: '',
        metaDescription: 'جميع المنتجات',
        isActive: true,
        showInFooter: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'main-3',
        title: 'التصنيفات',
        slug: '/categories',
        content: '',
        metaDescription: 'تصنيفات المنتجات',
        isActive: true,
        showInFooter: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'main-4',
        title: 'اتصل بنا',
        slug: '/contact',
        content: '',
        metaDescription: 'تواصل معنا',
        isActive: true,
        showInFooter: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    let dynamicPages: StaticPage[] = [];
    
    try {
      console.log('🔄 Fetching dynamic static pages...');
      const pages = await (api as any).staticPages.getAll();
      console.log('📄 Dynamic static pages received:', pages);
      if (Array.isArray(pages)) {
        dynamicPages = pages;
        console.log('✅ Dynamic static pages loaded from API');
      }
    } catch (error) {
      console.error('❌ Error fetching dynamic static pages:', error);
      // Try to load from localStorage as fallback
      const savedPages = localStorage.getItem('staticPages');
      if (savedPages) {
        try {
          const parsedPages = JSON.parse(savedPages);
          if (Array.isArray(parsedPages)) {
            // Filter out main site pages from saved data to avoid duplicates
            dynamicPages = parsedPages.filter(page => 
              !mainSitePages.some(mainPage => mainPage.slug === page.slug)
            );
            console.log('📦 Dynamic static pages loaded from localStorage');
          }
        } catch (parseError) {
          console.error('❌ Error parsing saved static pages:', parseError);
        }
      }
    }
    
    // Combine main site pages with dynamic pages
    const allPages = [...mainSitePages, ...dynamicPages];
    setStaticPages(allPages);
    
    // Save combined pages to localStorage
    localStorage.setItem('staticPages', JSON.stringify(allPages));
    console.log('📝 Combined static pages set:', allPages.length);
  };

  const fetchCategoriesWithProducts = async () => {
    try {
      setError(null);

      // محاولة تحميل البيانات من Cache فوراً
      const cachedCategories = cacheManager.get(CACHE_KEYS.CATEGORIES);
      const cachedServices = cacheManager.get(CACHE_KEYS.SERVICES);
      
      if (cachedCategories && cachedServices && Array.isArray(cachedCategories) && Array.isArray(cachedServices)) {
        console.log('✅ تحميل فوري من Cache Manager في App.tsx');
        
        // تجميع البيانات
        const groupedData = cachedCategories.map((category: any) => ({
          category,
          products: cachedServices.filter((service: any) => service.categoryId === category.id)
        }));
        
        setCategoryProducts(groupedData);
        setLoading(false);
        
        // تحديث البيانات في الخلفية
        refreshAppDataInBackground();
        return;
      }

      console.log('🔄 جلب البيانات الجديدة من API...');

      // Fetch real data from API
      const [services, categories] = await Promise.all([
        servicesAPI.getAll({}, true), // Public request
        categoriesAPI.getAll()
      ]);

      console.log('✅ API Data loaded:', {
        services: Array.isArray(services) ? services.length : 'Invalid',
        categories: Array.isArray(categories) ? categories.length : 'Invalid'
      });

      // Ensure we have arrays
      const validServices = Array.isArray(services) ? services : [];
      const validCategories = Array.isArray(categories) ? categories : [];
      
      // تخزين البيانات الأساسية فقط للسرعة الخارقة
      const compactCategories = validCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image
        // إزالة الوصف لتوفير مساحة أكبر
      }));
      
      const compactServices = validServices.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        categoryId: service.categoryId,
        mainImage: service.mainImage
        // حفظ الحقول الأساسية فقط للعرض السريع
      }));
      
      // حفظ البيانات المضغوطة في Cache Manager
      cacheManager.set(CACHE_KEYS.CATEGORIES, compactCategories);
      cacheManager.set(CACHE_KEYS.SERVICES, compactServices);

      // Group services by category
      const groupedData = validCategories.map(category => ({
        category,
        products: validServices.filter(service => service.categoryId === category.id)
      }));

      setCategoryProducts(groupedData);
      setError(null);
      
      console.log('✅ تم حفظ البيانات في Cache Manager');

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'خطأ في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    }
  };
  
  const refreshAppDataInBackground = async () => {
    try {
      console.log('🔄 تحديث بيانات التطبيق في الخلفية');
      
      const [services, categories] = await Promise.all([
        servicesAPI.getAll({}, true),
        categoriesAPI.getAll()
      ]);
      
      const validServices = Array.isArray(services) ? services : [];
      const validCategories = Array.isArray(categories) ? categories : [];
      
      // تحديث Cache
      cacheManager.set(CACHE_KEYS.CATEGORIES, validCategories, 30 * 60 * 1000);
      cacheManager.set(CACHE_KEYS.SERVICES, validServices, 30 * 60 * 1000);
      
      // تحديث البيانات المعروضة
      const groupedData = validCategories.map(category => ({
        category,
        products: validServices.filter(service => service.categoryId === category.id)
      }));
      
      setCategoryProducts(groupedData);
      
    } catch (err) {
      console.warn('فشل في تحديث بيانات التطبيق في الخلفية:', err);
    }
  };

  // Quantity handlers for mobile cards
  const handleQuantityDecrease = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const handleQuantityIncrease = (productId: number, maxStock: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.min(maxStock, (prev[productId] || 1) + 1)
    }));
  };

  // Handle add to cart
  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      const quantity = quantities[productId] || 1;
      
      // Locate full product details
      const product = categoryProducts
        .flatMap(cp => cp.products)
        .find(p => p.id === productId);
      
      if (!product) {
        toast.error('لم يتم العثور على المنتج');
        return;
      }
      
      // Centralized add-to-cart logic
      const success = await addToCartUnified(
        product.id,
        product.name,
        product.price,
        quantity,
        {}, // selectedOptions
        {}, // optionsPricing
        { images: [], text: '' },
        product
      );

      if (success) {
        // Reset quantity back to 1 after successful addition
        setQuantities(prev => ({ ...prev, [productId]: 1 }));
      }
      
    } catch (error) {
      console.error('❌ [App] Error in handleAddToCart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  // Handle wishlist toggle - functionality removed
  const handleWishlistToggle = async (productId: number, productName: string) => {
    // Wishlist functionality has been removed
    toast.info('ميزة المفضلة غير متوفرة حالياً');
  };

  // Wishlist functionality has been removed
  const isInWishlist = (productId: number) => {
    return false;
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gradient mb-2">after ads</h2>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );

  // Get all services for filtering
  const allServices = categoryProducts.flatMap(cp => cp.products);
  
  // Filter services based on active tab
  const filteredServices = activeTab === 'All' 
    ? allServices 
    : activeTab === 'Featured'
    ? allServices.filter(p => p.rating === 5)
    : activeTab === 'Top selling'
    ? allServices.filter(p => p.originalPrice && p.originalPrice > p.price)
    : activeTab === 'Sale'
    ? allServices.filter(p => p.originalPrice && p.originalPrice > p.price)
    : activeTab === 'New'
    ? allServices.slice(0, 4)
    : allServices;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <>
      {/* تم إلغاء شاشة التحميل تماماً */}
      {error && <ErrorComponent />}
      <div className="min-h-screen bg-[#FAF8F5] overflow-hidden" dir="rtl">
      <style>
        {`
          .perfume-bottle {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);
            border-radius: 20px;
            position: relative;
            transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
            box-shadow: 
              0 25px 50px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.2);
          }
          
          .perfume-bottle::before {
            content: '';
            position: absolute;
            top: 10%;
            left: 15%;
            right: 15%;
            height: 60%;
            background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
            border-radius: 10px;
          }
          
          .perfume-cap {
            background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
            border-radius: 8px 8px 4px 4px;
            position: absolute;
            top: -15px;
            left: 25%;
            right: 25%;
            height: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.4);
          }
          
          .floating-elements {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          
          .floating-circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            animation: float 6s ease-in-out infinite;
          }
          
          .floating-circle:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
          }
          
          .floating-circle:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 60%;
            right: 15%;
            animation-delay: 2s;
            background: rgba(236, 72, 153, 0.2);
          }
          
          .floating-circle:nth-child(3) {
            width: 60px;
            height: 60px;
            bottom: 20%;
            left: 20%;
            animation-delay: 4s;
            background: rgba(124, 58, 237, 0.2);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(10px) rotate(240deg); }
          }
          
          .hero-text {
            font-family: 'Playfair Display', serif;
            background: linear-gradient(135deg, #1F2937 0%, #374151 50%, #1F2937 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .product-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .product-card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          }
          
          .tab-active {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
          }
          
          .tab-inactive {
            color: #6B7280;
            border-bottom: 2px solid transparent;
          }
          
          .tab-inactive:hover {
            color: #374151;
            border-bottom-color: #EF4444;
          }
          
          .rating-stars {
            color: #F59E0B;
          }
        `}
      </style>
      
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover draggable />
      
      {/* HERO SECTION */}
      <Hero />

      {/* CUSTOMER FAVORITES */}
      <CustomerFavoritesSection products={allServices} />

      {/* DISCOVER NEW SECTION */}
      <DiscoverNewSection />

      {/* ALL SERVICES SECTION */}
      <AllServicesSection />

      {/* Enhanced Professional Footer */}
      <footer className="relative bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 text-white overflow-hidden" dir="rtl">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-dark-400/10 to-dark-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-16 w-48 h-48 bg-gradient-to-br from-dark-500/10 to-dark-600/10 rounded-full blur-3xl"></div>
  </div>

        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-16 fill-dark-800 transform rotate-180">
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>

        <div className="relative z-10 pt-24 pb-12">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-4xl font-extrabold bg-gradient-to-r from-dark-400 via-dark-500 to-dark-400 bg-clip-text text-transparent select-none">
                    after ads
              </h3>
                  <p className="text-dark-300 leading-relaxed max-w-md">
                    موقع إلكتروني متخصص في تطوير المتاجر الإلكترونية وتقديم حلول متكاملة للتجارة الإلكترونية. 
                    نحن نؤمن بأن التجارة الإلكترونية هي مستقبل الأعمال، ونسعى لتقديم أفضل الحلول لعملائنا.
                  </p>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">تابعنا على</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: FaInstagram, color: 'from-dark-400 to-dark-500', label: 'Instagram' },
                      { icon: FaTiktok, color: 'from-dark-300 to-dark-400', label: 'TikTok' },
                      { icon: FaSnapchatGhost, color: 'from-dark-500 to-dark-300', label: 'Snapchat' },
                      { icon: FaWhatsapp, color: 'from-dark-500 to-dark-600', label: 'WhatsApp' }
                    ].map(({ icon: Icon, color, label }) => (
                      <a
                        key={label}
                        href="#"
                        className={`group relative w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-dark-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    ))}
                  </div>
</div>
            </div>

            {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-white relative">
                  روابط سريعة
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 rounded-full"></div>
                </h4>
                <ul className="space-y-3">
                  {/* Static Pages */}
                  {staticPages
                    .filter(page => page.isActive && page.showInFooter)
                    .map((page) => (
                      <li key={page.id}>
                        <Link 
                          to={page.slug} 
                          className="group flex items-center gap-2 text-dark-300 hover:text-white transition-colors duration-300"
                        >
                          <div className="w-1 h-1 bg-dark-400 rounded-full group-hover:w-2 transition-all duration-300"></div>
                          {page.title}
                        </Link>
                      </li>
                    ))}
                </ul>
            </div>

            {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-white relative">
                  تواصل معنا
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-dark-400 to-dark-500 rounded-full"></div>
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-dark-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-dark-400 to-dark-500 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">📞</span>
                </div>
                    <div>
                      <div className="text-sm text-dark-400">اتصل بنا</div>
                      <div className="text-white font-medium">+966551064118</div>
                </div>
                  </li>
                  <li className="flex items-center gap-3 text-dark-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-dark-300 to-dark-400 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">✉️</span>
                </div>
                    <div>
                      <div className="text-sm text-dark-400">البريد الإلكتروني</div>
                      <div className="text-white font-medium">info@afterads.sa</div>
              </div>
                  </li>
                  <li className="flex items-center gap-3 text-dark-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-dark-300 to-dark-400 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">📍</span>
                    </div>
                    <div>
                      <div className="text-sm text-dark-400">العنوان</div>
                      <div className="text-white font-medium">الرياض، السعودية</div>
                    </div>
                  </li>
                </ul>
            </div>
          </div>

            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-dark-300/50 to-dark-400/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-dark-500/50">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-white">اشترك في النشرة الإخبارية</h4>
                  <p className="text-dark-300">كن أول من يعلم بأحدث الخدمات والعروض الحصرية</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-dark-500 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-dark-400"
                  />
                  <button className="px-8 py-3 bg-gradient-to-r from-dark-400 to-dark-500 text-dark-950 rounded-xl font-semibold shadow-lg hover:shadow-dark-400/25 transition-all duration-300 hover:-translate-y-1">
                    اشتراك
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-dark-500/50 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-dark-400 text-sm text-center md:text-right">
                  © 2025 after ads. جميع الحقوق محفوظة.
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <a href="#" className="text-dark-400 hover:text-white transition-colors">سياسة الخصوصية</a>
                  <a href="#" className="text-dark-400 hover:text-white transition-colors">شروط الاستخدام</a>
                  <a href="#" className="text-dark-400 hover:text-white transition-colors">سياسة الإرجاع</a>
                  <a href="#" className="text-dark-400 hover:text-white transition-colors">الشحن والتوصيل</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Enhanced Floating Cart Button */}
      <div className="fixed bottom-24 left-6 z-50">
        <Link
          to="/cart"
          className="group relative w-16 h-16 bg-gradient-to-r from-dark-300 via-dark-400 to-dark-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 overflow-hidden"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-400 to-dark-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
          
          <div className="relative z-10">
            <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-r from-dark-200 to-dark-300 text-dark-950 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce shadow-lg">
                {cartCount}
              </span>
            )}
          </div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
          </div>
        </Link>
      </div>

      {/* Shipping Offer Popup */}
      <ShippingOfferPopup />
    </div>
    </>
  );
}

export default App;