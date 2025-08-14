import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Grid, List, Package, Sparkles, Folder, ArrowRight } from 'lucide-react';
import { createCategorySlug } from '../utils/slugify';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';

interface Category {
  id: string | number;
  name: string;
  description: string;
  image: string;
}

interface Product {
  id: string | number;
  categoryId: string | number | null;
}

const AllCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [categories, searchTerm, sortBy]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching categories...');
      
      const categoriesData = await apiCall(API_ENDPOINTS.CATEGORIES);
      
      console.log('✅ Categories loaded:', categoriesData.length);
      setCategories(categoriesData);
      localStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      toast.error('فشل في جلب التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products for count...');
      
      const productsData = await apiCall(API_ENDPOINTS.SERVICES);
      
      console.log('✅ Products loaded for count:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const filterAndSortCategories = () => {
    let filtered = [...categories];
    
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    switch (sortBy) {
      case 'products':
        filtered.sort((a, b) => {
          const aCount = products.filter(p => p.categoryId?.toString() === a.id.toString()).length;
          const bCount = products.filter(p => p.categoryId?.toString() === b.id.toString()).length;
          return bCount - aCount;
        });
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
    }
    
    setFilteredCategories(filtered);
  };

  const getCategoryProductsCount = (categoryId: string | number) => {
    return products.filter(p => p.categoryId?.toString() === categoryId.toString()).length;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value);

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton for header */}
          <div className="text-center mb-8">
            <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          
          {/* Skeleton for filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton for categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">جميع التصنيفات</h1>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            استكشف جميع تصنيفات منتجاتنا المتنوعة واختر ما يناسبك
          </p>
        </div>
        
        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="ابحث في التصنيفات..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={handleSort}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="products">ترتيب حسب عدد المنتجات</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-sm">شبكة</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">قائمة</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {filteredCategories.length} من {categories.length} تصنيف
            </div>
          </div>
        </div>

        {/* Categories Display */}
        {filteredCategories.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredCategories.map((category) => {
              const productsCount = getCategoryProductsCount(category.id);
              const categorySlug = createCategorySlug(category.id, category.name);
              
              return viewMode === 'grid' ? (
                <Link
                  key={category.id}
                  to={`/category/${categorySlug}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {/* Category Image */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {category.image ? (
                      <img
                        src={buildImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                  
                  {/* Category Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {productsCount} منتج
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>استكشف المنتجات</span>
                      <ArrowRight className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  key={category.id}
                  to={`/category/${categorySlug}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 flex items-center gap-4"
                >
                  {/* Category Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {category.image ? (
                      <img
                        src={buildImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Category Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {productsCount} منتج
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد تصنيفات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'لم يتم العثور على تصنيفات تطابق البحث'
                : 'لا توجد تصنيفات متاحة حالياً'
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

export default AllCategories;