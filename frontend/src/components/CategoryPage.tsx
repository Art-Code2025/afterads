import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Grid, ArrowRight, Sparkles, Filter, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import { extractIdFromSlug, isValidSlug, createCategorySlug, createProductSlug } from '../utils/slugify';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string | number | null;
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

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Separate loading states for better UX
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Extract category ID from slug
  const categoryId = useMemo(() => {
    return slug ? extractIdFromSlug(slug) : null;
  }, [slug]);

  // Memoize filtered products to prevent unnecessary recalculations
  const categoryProducts = useMemo(() => {
    if (!categoryId) return [];
    return allProducts.filter((product: Product) => 
      product.categoryId && product.categoryId.toString() === categoryId.toString()
    );
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
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'ar');
      }
    });
  }, [categoryProducts, searchTerm, sortBy]);

  // Fetch categories and products once on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle category change
  useEffect(() => {
    if (!slug || !categoryId) {
      setError('رابط التصنيف مفقود');
      setCategoryLoading(false);
      return;
    }

    if (categoryId === '0') {
      setError('معرف التصنيف غير صحيح');
      setCategoryLoading(false);
      return;
    }

    // Reset search when category changes
    setSearchTerm('');
    setSortBy('name');
    
    findCategoryFromLoaded();
  }, [slug, categoryId]);

  const fetchInitialData = async () => {
    try {
      setCategoryLoading(true);
      setProductsLoading(true);
      setError(null);

      // Fetch both categories and products in parallel
      const [categoriesData, productsData] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORIES),
        apiCall(API_ENDPOINTS.PRODUCTS)
      ]);

      console.log('📂 Categories loaded:', categoriesData.length);
      console.log('📦 Products loaded:', productsData.length);

      // Store all data
      setAllProducts(productsData);
      
      // Find the current category if we have a categoryId
      if (categoryId) {
        const currentCategory = categoriesData.find((cat: Category) => 
          cat.id.toString() === categoryId.toString()
        );
        
        if (currentCategory) {
          setCategory(currentCategory);
          console.log('✅ Category found:', currentCategory.name);
        } else {
          console.error('❌ Category not found with ID:', categoryId);
          setError('التصنيف غير موجود');
        }
      }

    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
      setError('فشل في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setCategoryLoading(false);
      setProductsLoading(false);
    }
  };

  const findCategoryFromLoaded = async () => {
    try {
      setCategoryLoading(true);
      setError(null);

      // If we don't have categories loaded yet, fetch them
      const categoriesData = await apiCall(API_ENDPOINTS.CATEGORIES);
      
      const currentCategory = categoriesData.find((cat: Category) => 
        categoryId && cat.id.toString() === categoryId.toString()
      );
      
      if (currentCategory) {
        setCategory(currentCategory);
        console.log('✅ Category switched to:', currentCategory.name);
      } else {
        console.error('❌ Category not found with ID:', categoryId);
        setError('التصنيف غير موجود');
      }
    } catch (error) {
      console.error('❌ Error finding category:', error);
      setError('فشل في تحميل التصنيف');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Loading state - show skeleton while loading
  const isLoading = categoryLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton for breadcrumb */}
          <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          
          {/* Skeleton for category header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Skeleton for filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton for products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تصنيف غير موجود</h2>
          <p className="text-gray-600 mb-4">{error || 'التصنيف المطلوب غير موجود'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {category.image && (
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              <p className="text-gray-600 leading-relaxed">{category.description}</p>
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
              عرض {filteredProducts.length} من {categoryProducts.length} منتج
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={`${product.id}-${categoryId || 'unknown'}`} className="transform transition-all duration-200 hover:scale-105">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'لم يتم العثور على منتجات تطابق البحث في هذا التصنيف'
                : 'لا توجد منتجات في هذا التصنيف حالياً'
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