import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Grid, ArrowRight, Sparkles, Filter, Search, Eye } from 'lucide-react';
import ProductCard from './ProductCard';
import { extractIdFromSlug, isValidSlug, createCategorySlug, createProductSlug } from '../utils/slugify';
import { toast } from 'react-toastify';
import { productsAPI, categoriesAPI } from '../utils/api';
import { buildImageUrl } from '../config/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const ProductsByCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract category ID from slug
  const categoryId = slug ? extractIdFromSlug(slug) : null;

  useEffect(() => {
    if (!slug || !isValidSlug(slug) || !categoryId) {
      setError('رابط التصنيف غير صحيح');
      setLoading(false);
      return;
    }

    fetchCategory();
    fetchProducts();
  }, [slug, categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoriesAPI.getById(categoryId!);
      if (response.success) {
        setCategory(response.data);
      } else {
        throw new Error('فشل في تحميل التصنيف');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('فشل في تحميل التصنيف');
      toast.error('فشل في تحميل التصنيف');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getByCategory(categoryId!);
      if (response.success) {
        setProducts(response.data);
      } else {
        console.warn('No products found for this category');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('فشل في تحميل المنتجات');
      setProducts([]);
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التصنيف...</p>
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

        {/* Category Header with Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Category Cover Image */}
          {category.image && (
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img
                src={buildImageUrl(category.image)}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center&auto=format,compress&q=60&ixlib=rb-4.0.3`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 right-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
                <div className="flex items-center text-sm opacity-90">
                  <Package className="w-4 h-4 ml-1" />
                  <span>{products.length} منتج</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Category Info */}
          <div className="p-6">
            {!category.image && (
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Package className="w-4 h-4 ml-1" />
                  <span>{products.length} منتج</span>
                </div>
              </div>
            )}
            <p className="text-gray-600 leading-relaxed">{category.description}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                <option value="newest">الأحدث أولاً</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-600 font-medium text-sm">عرض:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                عرض {filteredProducts.length} من {products.length} منتج
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  مسح البحث
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => {
              const productForCard = {
                ...product,
                id: String(product.id),             // ProductCard expects string
                image: product.mainImage,            // map mainImage → image
                category: category?.name || '',      // provide category name
              } as any; // quick cast to satisfy type without over-refactoring

              return (
              <ProductCard 
                key={product.id} 
                  product={productForCard}
                viewMode={viewMode}
              />
              );
            })}
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

export default ProductsByCategory; 