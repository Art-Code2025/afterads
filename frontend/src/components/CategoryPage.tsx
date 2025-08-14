import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Grid, ArrowRight, Sparkles, Filter, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import { extractIdFromSlug, isValidSlug, createCategorySlug, createProductSlug } from '../utils/slugify';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { cacheManager, CACHE_KEYS, CachedCategory, CachedService } from '../utils/cacheManager';

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

// استخدام Cache Manager الجديد
const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Remove loading state for instant display
  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Extract category ID from slug
  const categoryId = useMemo(() => {
    return slug ? extractIdFromSlug(slug) : null;
  }, [slug]);

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

  // Handle category changes - optimized
  useEffect(() => {
    if (!slug || !categoryId) {
      setError('رابط التصنيف مفقود');
      return;
    }

    if (categoryId === '0') {
      setError('معرف التصنيف غير صحيح');
      return;
    }

    // Reset search when category changes
    setSearchTerm('');
    setSortBy('name');
    
    if (categoryId && allProducts.length > 0) {
      const cachedCategories = cacheManager.get<Category[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories) {
        const currentCategory = cachedCategories.find((cat: Category) => 
          cat.id.toString() === categoryId.toString()
        );
        
        if (currentCategory) {
           setCategory(currentCategory);
           setError(null);
           console.log('✅ Category set from cache:', currentCategory.name);
         } else {
           setError('التصنيف غير موجود');
           console.log('❌ Category not found for ID:', categoryId);
         }
      }
    }
  }, [slug, categoryId, allProducts]);

  const fetchInitialData = async () => {
    setError(null);
    
    try {
      // محاولة تحميل البيانات من Cache فوراً
      const cachedCategories = cacheManager.get<Category[]>(CACHE_KEYS.CATEGORIES);
      const cachedServices = cacheManager.get<Product[]>(CACHE_KEYS.SERVICES);
      
      if (cachedCategories && cachedServices) {
        console.log('✅ تحميل فوري من Cache Manager');
        setAllProducts(cachedServices);
        
        const foundCategory = cachedCategories.find((cat: Category) => 
          cat.id.toString() === categoryId?.toString()
        );
        if (foundCategory) {
          setCategory(foundCategory);
        }
        
        // تحديث البيانات في الخلفية (Background Refresh)
        refreshDataInBackground();
        return;
      }
      
      // إذا لم توجد بيانات مخزنة، جلب البيانات الجديدة
      await fetchFreshData();
      
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setError('حدث خطأ في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    }
  };
  
  const fetchFreshData = async () => {
    console.log('🔄 جلب البيانات الجديدة من الخادم');
    
    const [categoriesData, servicesData] = await Promise.all([
      apiCall(API_ENDPOINTS.CATEGORIES),
      apiCall(API_ENDPOINTS.SERVICES)
    ]);
    
    // حفظ البيانات في Cache Manager
    cacheManager.set(CACHE_KEYS.CATEGORIES, categoriesData, CACHE_DURATION);
    cacheManager.set(CACHE_KEYS.SERVICES, servicesData, CACHE_DURATION);
    
    setAllProducts(servicesData);
    
    const foundCategory = categoriesData.find((cat: Category) => 
      cat.id.toString() === categoryId?.toString()
    );
    if (foundCategory) {
      setCategory(foundCategory);
    } else {
      setError('الفئة غير موجودة');
    }
  };
  
  const refreshDataInBackground = async () => {
    try {
      console.log('🔄 تحديث البيانات في الخلفية');
      await fetchFreshData();
    } catch (err) {
      console.warn('فشل في تحديث البيانات في الخلفية:', err);
    }
  };



  // Handle wishlist toggle - functionality removed
  const handleWishlistToggle = (productId: number, productName: string) => {
    // Wishlist functionality has been removed
    toast.info('ميزة المفضلة غير متوفرة حالياً');
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Only show "category not found" if data is loaded but category is still null
  const cachedCategories = cacheManager.get<Category[]>(CACHE_KEYS.CATEGORIES);
  if (!category && cachedCategories && cachedCategories.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تصنيف غير موجود</h2>
          <p className="text-gray-600 mb-4">التصنيف المطلوب غير موجود</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // If no data loaded yet, show nothing (let the page render with empty content)
  if (!category && (!cachedCategories || cachedCategories.length === 0)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category?.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {category?.image && (
              <img
                src={buildImageUrl(category.image)}
                alt={category.name}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name}</h1>
              <p className="text-gray-600 leading-relaxed">{category?.description}</p>
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
                onChange={(e) => setSortBy(e.target.value)}
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
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'لم يتم العثور على خدمات تطابق البحث في هذا التصنيف'
                : 'لا توجد خدمات في هذا التصنيف حالياً'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;