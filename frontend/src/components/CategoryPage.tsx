import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowRight, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import { extractIdFromSlug } from '../utils/slugify';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface Product {
  id: string | number;
  name: string;
  description: string;
  price?: number;
  basePrice?: number;
  originalPrice?: number;
  stock: number;
  categoryId?: string | number | null; // Keep for backward compatibility
  categories?: string[]; // Array of category IDs
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: string | number;
  name: string;
  description: string;
  image: string;
}

// استخدام localStorage للسرعة القصوى
const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة
const CACHE_KEYS = {
  CATEGORIES: 'ultra_fast_categories',
  SERVICES: 'ultra_fast_services',
  TIMESTAMP: 'ultra_fast_timestamp'
};

// دوال localStorage فائقة السرعة مع معالجة QuotaExceededError
const fastCache = {
  set: (key: string, data: any) => {
    try {
      // تنظيف البيانات القديمة أولاً لتوفير مساحة
      const keysToCheck = ['ultra_fast_categories', 'ultra_fast_services', 'ultra_fast_timestamp'];
      keysToCheck.forEach(k => {
        if (k !== key) {
          const item = localStorage.getItem(k);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (Date.now() - parsed.timestamp > CACHE_DURATION) {
                localStorage.removeItem(k);
              }
            } catch (e) { localStorage.removeItem(k); }
          }
        }
      });
      
      // محاولة حفظ البيانات الجديدة
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) { 
      console.warn('Cache set failed:', e);
      // في حالة امتلاء التخزين، نظف كل شيء ثم حاول مرة أخرى
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (e2) {
        console.warn('Cache set failed after clear:', e2);
      }
    }
  },
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) { return null; }
  },
  clear: () => {
    Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Extract category ID from slug first
  const categoryId = useMemo(() => {
    return slug ? extractIdFromSlug(slug) : null;
  }, [slug]);
  
  // تحميل فوري من localStorage مثل AllCategories
  const [category, setCategory] = useState<Category | null>(() => {
    const cachedCategories = fastCache.get(CACHE_KEYS.CATEGORIES) as Category[];
    if (cachedCategories && categoryId) {
      return cachedCategories.find((cat: Category) => cat.id.toString() === categoryId) || null;
    }
    return null;
  });
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const cachedProducts = fastCache.get(CACHE_KEYS.SERVICES) as Product[];
    return cachedProducts || [];
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Memoize filtered services to prevent unnecessary recalculations
  const categoryProducts = useMemo(() => {
    if (!categoryId) return [];
    return allProducts.filter((product: Product) => {
      // Check if product has categories array and includes the current categoryId
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.includes(categoryId.toString());
      }
      // Fallback to categoryId for backward compatibility
      return product.categoryId && product.categoryId.toString() === categoryId.toString();
    });
  }, [allProducts, categoryId]);

  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'ar');
      }
    });
  }, [categoryProducts, searchTerm, sortBy]);

  // Wishlist functionality has been removed
  useEffect(() => {
    // Initialize with empty wishlist
    setWishlist([]);
  }, []);

  // Initial data fetch - check cache first for instant display
  useEffect(() => {
    fetchInitialData();
  }, []);

  // تحديث التصنيف عند تغيير الرابط - مبسط مثل AllCategories
  useEffect(() => {
    if (categoryId) {
      // إعادة تعيين البحث عند تغيير التصنيف
      setSearchTerm('');
      setSortBy('name');
      
      // البحث عن التصنيف في الكاش
      const cachedCategories = fastCache.get(CACHE_KEYS.CATEGORIES) as Category[];
      if (cachedCategories) {
        const currentCategory = cachedCategories.find((cat: Category) => 
          cat.id.toString() === categoryId.toString()
        );
        
        if (currentCategory) {
          setCategory(currentCategory);
          setError(null);
        }
      }
    }
  }, [categoryId]);

  const fetchInitialData = async () => {
    try {
      // تحديث البيانات في الخلفية بدون تأثير على العرض - مثل AllCategories
      console.log('🔄 Updating data in background...');
      
      const [categoriesData, servicesData] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORIES),
        apiCall(API_ENDPOINTS.SERVICES)
      ]);
      
      // تحديث الكاش
      fastCache.set(CACHE_KEYS.CATEGORIES, categoriesData);
      fastCache.set(CACHE_KEYS.SERVICES, servicesData);
      
      // تحديث البيانات فقط إذا كانت مختلفة
      setAllProducts(servicesData);
      
      if (categoryId) {
        const currentCategory = categoriesData.find((cat: Category) => 
          cat.id.toString() === categoryId.toString()
        );
        
        if (currentCategory) {
          setCategory(currentCategory);
          setError(null);
        }
      }
      
      console.log('✅ Background data update completed');
    } catch (error) {
      console.error('❌ Background update failed:', error);
      // لا نعرض أخطاء التحديث في الخلفية
    }
  };
  
  // تم حذف الدوال المعقدة - الآن نعمل مثل AllCategories بساطة وسرعة



  // Handle wishlist toggle - functionality removed
  const handleWishlistToggle = (productId: number, productName: string) => {
    // Wishlist functionality has been removed
    toast.info('ميزة المفضلة غير متوفرة حالياً');
  };

  // لا نعرض أخطاء - عرض فوري مثل AllCategories

  // عرض فوري بدون أي loading - مثل AllCategories تماماً
  // إذا لم يوجد التصنيف، سيتم تحديثه في الخلفية

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb - عرض فوري */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category?.name || 'التصنيف'}</span>
        </nav>

        {/* Category Header - عرض فوري حتى بدون بيانات */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {category?.image && (
              <img
                src={buildImageUrl(category.image)}
                alt={category?.name || 'تصنيف'}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category?.name || 'تحميل التصنيف...'}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {category?.description || 'يتم تحميل بيانات التصنيف'}
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Package className="w-4 h-4 ml-1" />
                <span>{categoryProducts.length} منتج</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث في هذا التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price-low">السعر: من الأقل إلى الأعلى</option>
                <option value="price-high">السعر: من الأعلى إلى الأقل</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {filteredProducts.length} من {categoryProducts.length} خدمة
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={`${product.id}-${categoryId || 'unknown'}`} className="transform transition-all duration-200 hover:scale-105">
                <ProductCard 
                  product={{
                    ...product,
                    image: product.mainImage, // تحويل mainImage إلى image للتوافق مع ProductCard
                    category: category?.name || '',
                    price: product.basePrice || product.originalPrice || 0, // تحويل basePrice/originalPrice إلى price
                    originalPrice: product.originalPrice,
                    inStock: (product.stock || 0) > 0
                  }}
                  onAddToWishlist={(product) => handleWishlistToggle(Number(product.id), product.name)}
                />
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500 mb-4">
              لم يتم العثور على خدمات تطابق البحث في هذا التصنيف
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              مسح البحث
            </button>
          </div>
        ) : (
          // عرض فارغ تماماً لضمان العرض الفوري بدون أي رسائل
          <div className="min-h-[200px]"></div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;