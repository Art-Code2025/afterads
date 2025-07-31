import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Package, 
  Grid, 
  List,
  MoreVertical,
  RefreshCw,
  Upload,
  Download
} from 'lucide-react';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';
import { createProductSlug } from '../utils/slugify';

interface Product {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: string | number; // Support both string and number IDs
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  image: string;
  createdAt?: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false); // تم تغييرها من true إلى false
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products and categories...');
      
      const [products, categories] = await Promise.all([
        apiCall(API_ENDPOINTS.PRODUCTS),
        apiCall(API_ENDPOINTS.CATEGORIES)
      ]);

      console.log('✅ Products loaded:', products.length);
      console.log('✅ Categories loaded:', categories.length);
      
      setProducts(products);
      setCategories(categories);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('فشل في جلب البيانات');
      // Set empty arrays as fallback
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return b.stock - a.stock;
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleDeleteProduct = async (id: string | number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return;

    try {
      console.log('🗑️ Deleting product:', id);
      
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'DELETE'
      });
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('تم حذف المنتج بنجاح');
      console.log('✅ Product deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast.error('خطأ في حذف المنتج');
    }
  };

  const getCategoryName = (categoryId: string | number) => {
    const category = categories.find(c => c.id === categoryId || c.id.toString() === categoryId.toString());
    return category ? category.name : 'غير محدد';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'نفذ', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'قليل', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'متوفر', color: 'text-green-600 bg-green-100' };
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                إدارة المنتجات
              </h1>
              <p className="text-gray-600 mt-2">إدارة وتنظيم منتجات المتجر</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">متوفر</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">نفذ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">قليل</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock > 0 && p.stock < 10).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">جميع التصنيفات</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price">ترتيب حسب السعر</option>
                <option value="stock">ترتيب حسب المخزون</option>
                <option value="created">الأحدث أولاً</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} من {filteredProducts.length} منتج
            </div>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Products List/Grid */}
        {currentProducts.length > 0 ? (
          <>
            {viewMode === 'list' ? (
              /* List View */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التصنيف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المخزون
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={buildImageUrl(product.mainImage)}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.png';
                                  }}
                                />
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {product.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getCategoryName(product.categoryId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900 font-semibold">{(product.price || 0).toFixed(0)} ر.س</div>
                              {product.originalPrice && (
                                <div className="text-gray-500 line-through text-sm">
                                  {(product.originalPrice || 0).toFixed(0)} ر.س
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/product/${createProductSlug(product.id, product.name)}`}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="عرض"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  to={`/admin/products/edit/${product.id}`}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={buildImageUrl(product.mainImage)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="text-sm text-gray-500 mb-2">
                          {getCategoryName(product.categoryId)}
                        </div>
                        
                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-xl font-bold text-gray-800">{(product.price || 0).toFixed(0)} ر.س</span>
                          {product.originalPrice ? (
                            <span className="text-gray-500 line-through ml-2">{(product.originalPrice || 0).toFixed(0)} ر.س</span>
                          ) : null}
                        </div>

                        {/* Stock */}
                        <div className="text-sm text-gray-600 mb-3">
                          المخزون: {product.stock}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/product/${createProductSlug(product.id, product.name)}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                          >
                            عرض
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? 'لم يتم العثور على منتجات تطابق معايير البحث'
                : 'لا توجد منتجات في المتجر بعد'
              }
            </p>
            {searchTerm || selectedCategory ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                مسح الفلاتر
              </button>
            ) : (
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة أول منتج
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement; 