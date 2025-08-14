import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Grid, 
  List,
  RefreshCw,
  Package,
  Folder,
  Image as ImageIcon
} from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { createCategorySlug } from '../utils/slugify';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryWithStats extends Category {
  productCount: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(false); // تم تغييرها من true إلى false
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [categories, searchTerm, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        apiCall(API_ENDPOINTS.CATEGORIES),
        apiCall(API_ENDPOINTS.SERVICES)
      ]);

      // Count products for each category
      const categoriesWithStats: CategoryWithStats[] = categoriesData.map((category: Category) => ({
        ...category,
        productCount: productsData.filter((product: any) => product.categoryId === category.id).length
      }));

      setCategories(categoriesWithStats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCategories = () => {
    let filtered = [...categories];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return b.productCount - a.productCount;
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.productCount > 0) {
      toast.error(`لا يمكن حذف التصنيف "${name}" لأنه يحتوي على ${category.productCount} منتج`);
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف التصنيف "${name}"؟`)) return;

    try {
      await apiCall(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
        method: 'DELETE'
      });
      setCategories(categories.filter(c => c.id !== id));
      toast.success('تم حذف التصنيف بنجاح');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('خطأ في حذف التصنيف');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التصنيفات...</p>
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
                <Folder className="w-8 h-8 text-blue-600" />
                إدارة التصنيفات
              </h1>
              <p className="text-gray-600 mt-2">إدارة وتنظيم تصنيفات المنتجات</p>
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
                to="/admin/categories/new"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة تصنيف
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">إجمالي التصنيفات</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">تصنيفات بها منتجات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.productCount > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Folder className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-600">تصنيفات فارغة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.productCount === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في التصنيفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="products">ترتيب حسب عدد المنتجات</option>
                <option value="created">الأحدث أولاً</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
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
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredCategories.length)} من {filteredCategories.length} تصنيف
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

        {/* Categories List/Grid */}
        {currentCategories.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Category Image */}
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {category.image ? (
                        <img
                          src={buildImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Product Count Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {category.productCount} منتج
                        </span>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/category/${createCategorySlug(category.id, category.name)}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                        >
                          عرض
                        </Link>
                        <Link
                          to={`/admin/categories/edit/${category.id}`}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التصنيف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الوصف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عدد المنتجات
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {category.image ? (
                                  <img
                                    src={buildImageUrl(category.image)}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder-image.png';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                              {category.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              category.productCount > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.productCount} منتج
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/category/${createCategorySlug(category.id, category.name)}`}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="عرض"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admin/categories/edit/${category.id}`}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد تصنيفات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'لم يتم العثور على تصنيفات تطابق البحث'
                : 'لا توجد تصنيفات في المتجر بعد'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                مسح البحث
              </button>
            ) : (
              <Link
                to="/admin/categories/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة أول تصنيف
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;