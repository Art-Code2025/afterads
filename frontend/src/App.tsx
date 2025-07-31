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
import { productsAPI, categoriesAPI } from './utils/api';
import { buildImageUrl } from './config/api';
import { addToCartUnified } from './utils/cartUtils';
import FleurNavbar from './components/FleurNavbar';
import HeroFleur from './components/HeroFleur';
import CustomerFavoritesSection from './components/CustomerFavoritesSection';
import DiscoverNewSection from './components/DiscoverNewSection';
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

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts[]>([]);
  const [loading, setLoading] = useState(false); // تم تغييرها من true إلى false
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('All');

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

    loadWishlist();
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: wishlist }));
    } catch (error) {
      console.error('خطأ في حفظ المفضلة:', error);
    }
  }, [wishlist]);

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

  const fetchCategoriesWithProducts = async () => {
    try {
      setError(null);

      console.log('🔄 Fetching real data from API...');

      // Fetch real data from API
      const [products, categories] = await Promise.all([
        productsAPI.getAll({}, true), // Public request
        categoriesAPI.getAll()
      ]);

      console.log('✅ API Data loaded:', {
        products: Array.isArray(products) ? products.length : 'Invalid',
        categories: Array.isArray(categories) ? categories.length : 'Invalid'
      });

      // Ensure we have arrays
      const validProducts = Array.isArray(products) ? products : [];
      const validCategories = Array.isArray(categories) ? categories : [];

      // Group products by category
      const groupedData = validCategories.map(category => ({
        category,
        products: validProducts.filter(product => product.categoryId === category.id)
      }));

      setCategoryProducts(groupedData);
      setError(null);
      
      // Show success message only if we have data
      if (validProducts.length > 0 || validCategories.length > 0) {
        toast.success(`تم تحميل البيانات من قاعدة البيانات بنجاح!`);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'خطأ في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
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

  // Handle wishlist toggle
  const handleWishlistToggle = (productId: number, productName: string) => {
    try {
      setWishlist(prev => {
        const isInWishlist = prev.includes(productId);
        let newWishlist;
        
        if (isInWishlist) {
          // Remove from wishlist
          newWishlist = prev.filter(id => id !== productId);
          toast.info(`تم إزالة ${productName} من المفضلة 💔`);
        } else {
          // Add to wishlist
          newWishlist = [...prev, productId];
          toast.success(`تم إضافة ${productName} للمفضلة ❤️`);
        }
        
        return newWishlist;
      });
    } catch (error) {
      console.error('خطأ في تحديث المفضلة:', error);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: number) => {
    return wishlist.includes(productId);
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gradient mb-2">غِيم</h2>
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

  // Get all products for filtering
  const allProducts = categoryProducts.flatMap(cp => cp.products);
  
  // Filter products based on active tab
  const filteredProducts = activeTab === 'All' 
    ? allProducts 
    : activeTab === 'Featured'
    ? allProducts.filter(p => p.rating === 5)
    : activeTab === 'Top selling'
    ? allProducts.filter(p => p.originalPrice && p.originalPrice > p.price)
    : activeTab === 'Sale'
    ? allProducts.filter(p => p.originalPrice && p.originalPrice > p.price)
    : activeTab === 'New'
    ? allProducts.slice(0, 4)
    : allProducts;

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
      
      {/* HERO FLEUR SECTION */}
      <HeroFleur />

      {/* CUSTOMER FAVORITES */}
      <CustomerFavoritesSection products={allProducts} />

      {/* DISCOVER NEW SECTION */}
      <DiscoverNewSection />

      {/* Our Store Section */}
      <section className="relative py-24 bg-gradient-to-br from-white via-[#FAF8F5]/30 to-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-[#C4A484]/20 to-[#D4B896]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-[#E5D5C8]/15 to-[#C4A484]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-[#D4B896]/20 to-[#E5D5C8]/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
                          </div>
                          
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-[#C4A484]/50 mb-6">
              <div className="w-2 h-2 bg-[#8B5A3C] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[#6B4226]">متجرنا المميز</span>
              <div className="w-2 h-2 bg-[#A67C52] rounded-full animate-pulse delay-500"></div>
                              </div>

            {/* Main Title */}
            <div className="space-y-4 mb-8">
              <h2 className="font-english text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#6B4226] via-[#8B5A3C] to-[#6B4226] bg-clip-text text-transparent">
                OUR STORE
              </h2>
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full"></div>
              </div>
            </div>
            
            <p className="text-[#8B5A3C] text-lg max-w-2xl mx-auto leading-relaxed">
              اكتشف مجموعتنا الحصرية من أفخر العطور العالمية المختارة بعناية لتناسب جميع الأذواق والمناسبات
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex justify-center mb-16">
            <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-[#C4A484]/50">
              {['All', 'Featured', 'Top selling', 'Sale', 'New'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white shadow-lg' 
                      : 'text-[#8B5A3C] hover:text-[#6B4226] hover:bg-[#C4A484]/10'
                  }`}
                >
                  {tab === 'All' ? 'الكل' : 
                   tab === 'Featured' ? 'مميز' :
                   tab === 'Top selling' ? 'الأكثر مبيعاً' :
                   tab === 'Sale' ? 'تخفيضات' :
                   tab === 'New' ? 'جديد' : tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {filteredProducts.slice(0, 8).map((product, index) => (
                  <div
                    key={product.id}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C4A484]/10 to-[#D4B896]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110"></div>
                
                <div className="relative card-premium hover-lift">
                  <div className="aspect-square bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EB] relative overflow-hidden rounded-t-2xl">
                          <img
                            src={buildImageUrl(product.mainImage)}
                            alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                            onError={(e) => {
                        console.log('❌ Image failed to load:', product.mainImage);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE2MCIgcj0iMzAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE1MCAyMDBMMTgwIDE3MEwyMDAgMTkwTDI0MCAyNTBIMTUwVjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIzMDAiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCI+2YTYpyDYqtmI2KzYryDYtdmI2LHYqTwvdGV4dD4KPC9zdmc+'; 
                      }}
                    />
                    
                    {/* Sale Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        تخفيض
                          </div>
                    )}
                          
                          {/* Wishlist Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleWishlistToggle(product.id, product.name);
                              }}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        isInWishlist(product.id) ? 'text-[#8B5A3C] bg-[#C4A484]/20' : 'text-[#A67C52] hover:text-[#8B5A3C]'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-[#8B5A3C]' : ''}`} />
                            </button>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <Link 
                        to={`/product/${product.id}`}
                        className="bg-white/90 backdrop-blur-sm text-[#8B5A3C] px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-[#6B4226]"
                      >
                        عرض التفاصيل
                      </Link>
                                </div>
                                </div>
                  
                  <div className="p-6 text-center space-y-4">
                    {/* Rating */}
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (product.rating || 0) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#C4A484]'
                          }`}
                        />
                      ))}
                          </div>
                          
                    <div>
                      <Link to={`/product/${product.id}`} className="block hover:text-[#8B5A3C] transition-colors">
                        <h3 className="font-semibold text-[#6B4226] mb-1 line-clamp-1 hover:text-[#8B5A3C] transition-colors">{product.brand || product.name}</h3>
                        <p className="text-sm text-[#A67C52] line-clamp-2">{product.name}</p>
                                </Link>
                    </div>
                    
                                  <div className="flex items-center justify-center gap-3">
                      <span className="text-[#8B5A3C] font-bold text-lg">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-[#C4A484] line-through text-sm">${product.originalPrice}</span>
                      )}
                                  </div>
                                  
                                  <button
                      onClick={() => handleAddToCart(product.id, product.name)}
                      className="w-full bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] hover:from-[#6B4226] hover:to-[#8B5A3C] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-[#8B5A3C]/25 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      إضافة للسلة
                                  </button>
                            </div>
                        </div>
                  </div>
                ))}
            </div>
            
          {/* View More Button */}
          <div className="text-center mt-16">
            <button className="group relative px-10 py-4 bg-gradient-to-r from-[#6B4226] to-[#8B5A3C] text-white rounded-full font-semibold shadow-2xl hover:shadow-[#8B5A3C]/25 transition-all duration-300 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                عرض المزيد من المنتجات
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5A3C] to-[#6B4226] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Professional Footer */}
      <footer className="relative bg-gradient-to-br from-[#6B4226] via-[#8B5A3C] to-[#6B4226] text-white overflow-hidden" dir="rtl">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-[#A67C52]/10 to-[#C4A484]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-16 w-48 h-48 bg-gradient-to-br from-[#C4A484]/10 to-[#D4B896]/10 rounded-full blur-3xl"></div>
  </div>

        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-16 fill-[#6B4226] transform rotate-180">
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
                  <h3 className="text-4xl font-extrabold bg-gradient-to-r from-[#C4A484] via-[#D4B896] to-[#C4A484] bg-clip-text text-transparent select-none">
                    FLEUR
              </h3>
                  <p className="text-[#E5D5C8] leading-relaxed max-w-md">
                    متجر عطور فاخر يقدم أحدث التشكيلات النسائية والرجالية من أرقى البراندات العالمية. 
                    نحن نؤمن بأن العطر ليس مجرد رائحة، بل هو تعبير عن الشخصية والأناقة.
                  </p>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">تابعنا على</h4>
                  <div className="flex gap-4">
                    {[
                      { icon: FaInstagram, color: 'from-[#A67C52] to-[#C4A484]', label: 'Instagram' },
                      { icon: FaTiktok, color: 'from-[#8B5A3C] to-[#A67C52]', label: 'TikTok' },
                      { icon: FaSnapchatGhost, color: 'from-[#D4AF37] to-[#E5D5C8]', label: 'Snapchat' },
                      { icon: FaWhatsapp, color: 'from-[#C4A484] to-[#D4B896]', label: 'WhatsApp' }
                    ].map(({ icon: Icon, color, label }) => (
                      <a
                        key={label}
                        href="#"
                        className={`group relative w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    ))}
                  </div>
</div>
            </div>

            {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-white relative">
                  روابط سريعة
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full"></div>
                </h4>
                <ul className="space-y-3">
                  {[
                    { to: '/', label: 'الرئيسية' },
                    { to: '/products', label: 'المنتجات' },
                    { to: '/categories', label: 'التصنيفات' },
                    { to: '/blog', label: 'المدونة' },
                    { to: '/contact', label: 'اتصل بنا' }
                  ].map(({ to, label }) => (
                    <li key={to}>
                      <Link 
                        to={to} 
                        className="group flex items-center gap-2 text-[#E5D5C8] hover:text-white transition-colors duration-300"
                      >
                        <div className="w-1 h-1 bg-[#C4A484] rounded-full group-hover:w-2 transition-all duration-300"></div>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>

            {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-white relative">
                  تواصل معنا
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-full"></div>
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[#E5D5C8]">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#C4A484] to-[#D4B896] rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">📞</span>
                </div>
                    <div>
                      <div className="text-sm text-[#C4A484]">اتصل بنا</div>
                      <div className="text-white font-medium">+966551064118</div>
                </div>
                  </li>
                  <li className="flex items-center gap-3 text-[#E5D5C8]">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#A67C52] to-[#C4A484] rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">✉️</span>
                </div>
                    <div>
                      <div className="text-sm text-[#C4A484]">البريد الإلكتروني</div>
                      <div className="text-white font-medium">info@fleur.store</div>
              </div>
                  </li>
                  <li className="flex items-center gap-3 text-[#E5D5C8]">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-lg">📍</span>
                    </div>
                    <div>
                      <div className="text-sm text-[#C4A484]">العنوان</div>
                      <div className="text-white font-medium">الرياض، السعودية</div>
                    </div>
                  </li>
                </ul>
            </div>
          </div>

            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-[#8B5A3C]/50 to-[#A67C52]/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-[#C4A484]/50">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-white">اشترك في النشرة الإخبارية</h4>
                  <p className="text-[#E5D5C8]">كن أول من يعلم بأحدث العطور والعروض الحصرية</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-[#C4A484] rounded-xl text-white placeholder-[#C4A484] focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
                  />
                  <button className="px-8 py-3 bg-gradient-to-r from-[#C4A484] to-[#D4B896] text-[#6B4226] rounded-xl font-semibold shadow-lg hover:shadow-[#C4A484]/25 transition-all duration-300 hover:-translate-y-1">
                    اشتراك
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#C4A484]/50 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[#C4A484] text-sm text-center md:text-right">
                  © 2025 FLEUR Perfume Store. جميع الحقوق محفوظة.
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <a href="#" className="text-[#C4A484] hover:text-white transition-colors">سياسة الخصوصية</a>
                  <a href="#" className="text-[#C4A484] hover:text-white transition-colors">شروط الاستخدام</a>
                  <a href="#" className="text-[#C4A484] hover:text-white transition-colors">سياسة الإرجاع</a>
                  <a href="#" className="text-[#C4A484] hover:text-white transition-colors">الشحن والتوصيل</a>
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
          className="group relative w-16 h-16 bg-gradient-to-r from-[#8B5A3C] via-[#A67C52] to-[#C4A484] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 overflow-hidden"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484] to-[#D4B896] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
          
          <div className="relative z-10">
            <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-r from-[#D4AF37] to-[#E5D5C8] text-[#6B4226] text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce shadow-lg">
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