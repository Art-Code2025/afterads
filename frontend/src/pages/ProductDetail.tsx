import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ArrowRight,
  Sparkles,
  Crown,
  Droplets,
  Wind,
  Flower,
  Leaf,
  Gift,
  Award,
  Truck,
  Shield,
  Phone,
  Mail,
  Plus,
  Minus,
  Share2,
  Check,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { productsAPI, servicesAPI } from '../utils/api';
import { buildImageUrl } from '../config/api';

// Cache for instant loading
const productCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Product {
  id: string | number;
  name: string;
  brand?: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: string | number | null;
  productType?: string;
  dynamicOptions?: any[];
  rating?: number;
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
  // Service-specific properties
  features?: string[];
  duration?: string;
  category?: string;
  deliveryTime?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const isServicePage = window.location.pathname.includes('/service/');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Helper function to test if an image URL is valid
  const testImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url || url.trim() === '') {
        resolve(false);
        return;
      }
      
      // For data URLs, assume they're valid
      if (url.startsWith('data:image/')) {
        resolve(true);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        console.error('❌ No product ID/slug provided');
        setError('معرف المنتج غير صحيح');
        setIsInitialLoad(false);
        return;
      }

      try {
        setError(null);
        
        // Check cache first for instant display
        const cacheKey = `${isServicePage ? 'service' : 'product'}_${id}`;
        const cachedData = productCache.get(cacheKey);
        
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
          setProduct(cachedData.data);
          setIsInitialLoad(false);
          setError(null);
          // Update SEO tags immediately
          document.title = `${cachedData.data.name} - ${isServicePage ? 'خدمات' : 'منتجات'} شار`;
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', cachedData.data.description || `${cachedData.data.name} - ${isServicePage ? 'خدمة متميزة' : 'منتج عالي الجودة'} من شار`);
          }
          console.log('✅ Loaded from cache instantly:', cachedData.data.name);
          return;
        }
        
        let productData = null;
        
        // Simplified and faster approach - try direct ID first
        const isNumericId = /^\d+$/.test(id);
        
        if (isNumericId) {
          // Direct ID lookup - fastest method
          if (isServicePage) {
            productData = await servicesAPI.getById(parseInt(id));
          } else {
            productData = await productsAPI.getById(parseInt(id));
          }
        } else {
          // For slugs, try a more efficient approach
          try {
            // First try to treat as ID if it's short
            if (id.length < 10) {
              try {
                if (isServicePage) {
                  productData = await servicesAPI.getById(id as any);
                } else {
                  productData = await productsAPI.getById(id as any);
                }
              } catch (idError) {
                // Continue to slug search if ID fails
              }
            }
            
            // If still no data, search by slug (optimized)
            if (!productData) {
              const allItems = isServicePage 
                ? await servicesAPI.getAll({}, true)
                : await productsAPI.getAll({}, true);
              
              // Quick slug matching
              productData = allItems.find((p: any) => {
                if (p.slug === id) return true;
                
                // Simple slug generation for comparison
                const generatedSlug = p.name
                  ?.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .trim();
                
                return generatedSlug === id || p.id?.toString() === id;
              });
            }
          } catch (slugError) {
            console.warn('Slug search failed:', slugError);
          }
        }
        
        if (productData) {
          setProduct(productData);
          setIsInitialLoad(false);
          
          // Cache the data for future instant loading
          const cacheKey = `${isServicePage ? 'service' : 'product'}_${id}`;
          productCache.set(cacheKey, {
            data: productData,
            timestamp: Date.now()
          });
          
          // Quick SEO update
          document.title = `${productData.name} - ${isServicePage ? 'خدمات' : 'منتجات'} شار`;
        } else {
          // Only show error after initial load attempt is complete
          setIsInitialLoad(false);
          setError(isServicePage ? 'الخدمة غير موجودة' : 'المنتج غير موجود');
          console.log('Product/Service not found with ID:', id);
        }
        
      } catch (error) {
        setIsInitialLoad(false);
        console.error('❌ Error fetching product:', error);
        setError(isServicePage ? 'الخدمة غير متوفرة' : 'المنتج غير متوفر');
      }
    };

    // Execute immediately without delay
    fetchProduct();
  }, [id]);

  // Check wishlist status
  useEffect(() => {
    if (product) {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(product.id));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, [product]);

  // Listen for wishlist updates
  useEffect(() => {
    if (!product) return;
    
    const handleWishlistUpdate = (event: any) => {
      try {
        if (event.detail && Array.isArray(event.detail)) {
          setIsWishlisted(event.detail.includes(product.id));
        } else {
          // Fallback to localStorage
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setIsWishlisted(wishlist.includes(product.id));
        }
      } catch (error) {
        console.error('Error updating wishlist status:', error);
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [product]);

  // Remove loading state - show content immediately

  // Minimal loading state - only show for very brief moments
  if (isInitialLoad && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">تحميل...</p>
        </div>
      </div>
    );
  }

  // Error state - only show after initial load is complete and no cached data
  if (error || (!product && !isInitialLoad)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{isServicePage ? 'الخدمة غير موجودة' : 'المنتج غير موجود'}</h2>
          <p className="text-gray-600 mb-4">{error || `لم يتم العثور على ${isServicePage ? 'الخدمة' : 'المنتج'} المطلوب`}</p>
          
          {/* Debug information */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left text-sm">
            <div className="font-bold mb-2">معلومات التشخيص:</div>
            <div>Product ID/Slug: {id || 'undefined'}</div>
            <div>URL: {window.location.href}</div>
            <div>Hostname: {window.location.hostname}</div>
            <div>Port: {window.location.port}</div>
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Dev: {String(import.meta.env.DEV)}</div>
            <div>Is Numeric ID: {id ? /^\d+$/.test(id) ? 'Yes' : 'No' : 'N/A'}</div>
            <div className="mt-2 text-xs text-gray-500">
              افتح Developer Tools (F12) واذهب إلى Console لمزيد من التفاصيل
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 إذا كان هذا slug، تأكد من أن {isServicePage ? 'الخدمة' : 'المنتج'} موجود في قاعدة البيانات
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                console.log('🔄 Retry button clicked');
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            <button
              onClick={() => {
                console.log('🔍 Debug button clicked');
                console.log('Current state:', { id, error, product });
                alert('تم طباعة معلومات التشخيص في Console. افتح Developer Tools (F12) لرؤيتها.');
              }}
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-700 transition-colors"
            >
              🔍 تشخيص
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get product images
  const productImages = [
    product?.mainImage,
    ...(product?.detailedImages || [])
  ].filter(Boolean);

  console.log('🖼️ Product images:', {
    mainImage: product?.mainImage,
    detailedImages: product?.detailedImages,
    filteredImages: productImages,
    selectedImage: selectedImage,
    currentImageUrl: productImages[selectedImage]
  });

  const getScentStrengthDots = (strength: string) => {
    const strengthLevels: Record<string, number> = {
      light: 1,
      medium: 2,
      strong: 3,
      intense: 4
    };
    
    const level = strengthLevels[strength] || 2;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < level ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScentFamilyIcon = (family?: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'زهري': <Flower className="w-5 h-5 text-pink-500" />,
      'شرقي': <Crown className="w-5 h-5 text-amber-600" />,
      'حمضي': <Leaf className="w-5 h-5 text-green-500" />,
      'خشبي': <Wind className="w-5 h-5 text-amber-600" />,
      'منعش': <Droplets className="w-5 h-5 text-blue-500" />
    };
    
    return family ? iconMap[family] || <Sparkles className="w-5 h-5 text-blue-600" /> : null;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      const existingCart = localStorage.getItem('cartItems');
      let cartItems = existingCart ? JSON.parse(existingCart) : [];
      
      const cartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.mainImage,
        quantity: quantity,
        total: product.price * quantity
      };
      
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.productId === product.id
      );
      
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].total = cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
      } else {
        cartItems.push(cartItem);
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      // Dispatch custom event for cart update
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { items: cartItems } 
      }));
      
      toast.success(`تم إضافة ${product?.name} إلى السلة!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج إلى السلة');
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.info('يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة');
      return;
    }
    
    try {
      // Get current wishlist from localStorage to ensure accuracy
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const productId = Number(product.id);
      let newWishlist;
      
      // Check current state from localStorage to avoid conflicts
      const currentlyInWishlist = currentWishlist.includes(productId);
      
      if (currentlyInWishlist) {
        // Remove from wishlist
        newWishlist = currentWishlist.filter((id: number) => id !== productId);
        setIsWishlisted(false);
        toast.info(`تم إزالة ${product?.name} من المفضلة 💔`);
      } else {
        // Add to wishlist - prevent duplicates
        if (!currentWishlist.includes(productId)) {
          newWishlist = [...currentWishlist, productId];
          setIsWishlisted(true);
          toast.success(`تم إضافة ${product?.name} إلى المفضلة! ❤️`);
        } else {
          // Already exists, just update UI state
          newWishlist = currentWishlist;
          setIsWishlisted(true);
          toast.info(`${product?.name} موجود بالفعل في المفضلة`);
          return;
        }
      }
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      
      // Dispatch event with detail
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: newWishlist }));
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
      // Reset state on error
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(Number(product.id)));
      } catch (resetError) {
        setIsWishlisted(false);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || '',
        text: product?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط!');
    }
  };

  const discountPercentage = product?.originalPrice && product?.originalPrice > (product?.price || 0)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20" dir="rtl">
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <ArrowRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-blue-600 transition-colors">المنتجات</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product?.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Product Images */}
          <div className="space-y-6">
            
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-lg">
              <img
                src={buildImageUrl(productImages[selectedImage] || product?.mainImage)}
                alt={product?.name || ''}
                className="w-full h-full object-cover"
                onLoad={() => {
                  // Image loaded successfully
                }}
                onError={(e) => {
                  const failedUrl = productImages[selectedImage] || product?.mainImage;
                  
                  // Try fallback to a better placeholder
                  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTYwIiByPSI0MCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNTAgMjIwTDE4MCAyMDBMMjAwIDIyMEwyNDAgMjgwSDE1MFYyMjBaIiBmaWxsPSIjOUNBM0FGIi8+PHRleHQgeD0iMjAwIiB5PSIzMjAiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+2YTYpyDYqtmI2KzYryDYtdmI2LHYqTwvdGV4dD48L3N2Zz4K';
                  e.currentTarget.src = placeholder;
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {(product?.stock || 0) > 0 && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    متوفر
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleAddToWishlist}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
                      isWishlisted 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    }`} 
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group"
                >
                  <Share2 className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors group-hover:scale-110" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-blue-600 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={buildImageUrl(image)}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        // Thumbnail loaded successfully
                      }}
                      onError={(e) => {
                        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzIiIHI9IjgiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMwIDQ0TDM2IDQwTDQwIDQ0TDQ4IDU2SDMwVjQ0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        e.currentTarget.src = placeholder;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {product?.brand || 'after ads'}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product?.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product?.rating || 0) 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-gray-900 mr-2">
                    {product?.rating || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Price - Enhanced for Services */}
            {!isServicePage && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-blue-600">{product?.price} ر.س</span>
                    {product?.originalPrice && product?.originalPrice > (product?.price || 0) && (
                      <div className="flex flex-col">
                        <span className="text-xl text-gray-500 line-through">
                          {product?.originalPrice} ر.س
                        </span>
                        <span className="text-sm text-green-600 font-bold">
                          وفر {((product?.originalPrice || 0) - (product?.price || 0)).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      خصم {discountPercentage}%
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    {(product?.stock || 0) > 0 ? `متوفر في المخزون (${product?.stock} قطعة)` : 'غير متوفر'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Service Price */}
            {isServicePage && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-green-600">{product?.price} ر.س</span>
                    {product?.originalPrice && product?.originalPrice > (product?.price || 0) && (
                      <div className="flex flex-col">
                        <span className="text-xl text-gray-500 line-through">
                          {product?.originalPrice} ر.س
                        </span>
                        <span className="text-sm text-green-600 font-bold">
                          وفر {((product?.originalPrice || 0) - (product?.price || 0)).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      خصم {discountPercentage}%
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">خدمة متاحة</span>
                </div>
              </div>
            )}

            {/* Quantity Selection - Only for Products */}
            {!isServicePage && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">الكمية:</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product?.stock || 0, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= (product?.stock || 0)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    الحد الأقصى: {product?.stock} قطعة
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isServicePage ? (
              <button
                onClick={handleAddToCart}
                disabled={(product?.stock || 0) === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {(product?.stock || 0) > 0 ? 'إضافة إلى السلة' : 'غير متوفر'}
              </button>
            ) : (
              <div className="flex gap-4">
                <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  طلب الخدمة
                </button>
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  استفسار
                </button>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {isServicePage ? 'وصف الخدمة:' : 'وصف المنتج:'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product?.description}
              </p>
            </div>
            
            {/* Additional Service Information */}
            {isServicePage && (
              <div className="space-y-4">
                {/* Service Features */}
                {product?.features && product?.features.length > 0 && (
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">مميزات الخدمة:</h3>
                    <ul className="space-y-2">
                      {product?.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Service Duration */}
                {(product?.duration || product?.deliveryTime) && (
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">مدة الخدمة:</h3>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{product?.duration || product?.deliveryTime}</span>
                    </div>
                  </div>
                )}
                
                {/* Service Category */}
                {product?.category && (
                  <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">فئة الخدمة:</h3>
                    <div className="flex items-center gap-2 text-green-700">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">{product?.category}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {product?.specifications && product?.specifications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">المواصفات:</h3>
                <div className="space-y-2">
                  {product?.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700">{spec.name}:</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;