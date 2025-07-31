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
  Gift, 
  Calendar, 
  Percent,
  Users,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag
} from 'lucide-react';
import { couponsAPI } from '../utils/api';

interface Coupon {
  id: number;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    filterAndSortCoupons();
  }, [coupons, searchTerm, statusFilter, typeFilter, sortBy]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponsAPI.getAll();
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('فشل في جلب الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCoupons = () => {
    let filtered = [...coupons];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      const now = new Date();
      filtered = filtered.filter(coupon => {
        const isExpired = new Date(coupon.expiresAt) < now;
        const isUsedUp = coupon.usedCount >= coupon.usageLimit;
        
        switch (statusFilter) {
          case 'active':
            return coupon.isActive && !isExpired && !isUsedUp;
          case 'inactive':
            return !coupon.isActive;
          case 'expired':
            return isExpired;
          case 'used_up':
            return isUsedUp;
          default:
            return true;
        }
      });
    }

    // Filter by type
    if (typeFilter) {
      filtered = filtered.filter(coupon => coupon.type === typeFilter);
    }

    // Sort coupons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'expires_desc':
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        case 'expires_asc':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'code':
          return a.code.localeCompare(b.code);
        case 'value_desc':
          return b.value - a.value;
        case 'value_asc':
          return a.value - b.value;
        case 'usage_desc':
          return b.usedCount - a.usedCount;
        case 'usage_asc':
          return a.usedCount - b.usedCount;
        default:
          return 0;
      }
    });

    setFilteredCoupons(filtered);
    setCurrentPage(1);
  };

  const handleDeleteCoupon = async (id: number, code: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الكوبون "${code}"؟`)) return;

    try {
      const response = await couponsAPI.delete(id);
      if (response.success) {
        setCoupons(coupons.filter(c => c.id !== id));
        toast.success('تم حذف الكوبون بنجاح');
      } else {
        toast.error(response.message || 'فشل في حذف الكوبون');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('خطأ في حذف الكوبون');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await couponsAPI.update(id, { isActive: !currentStatus });
      if (response.success) {
        setCoupons(coupons.map(coupon => 
          coupon.id === id 
            ? { ...coupon, isActive: !currentStatus, updatedAt: new Date().toISOString() }
            : coupon
        ));
        toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الكوبون بنجاح`);
      } else {
        toast.error(response.message || 'فشل في تحديث الكوبون');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('خطأ في تحديث الكوبون');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success('تم نسخ الكود');
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(() => {
      toast.error('فشل في نسخ الكود');
    });
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const isExpired = new Date(coupon.expiresAt) < now;
    const isUsedUp = coupon.usedCount >= coupon.usageLimit;

    if (!coupon.isActive) {
      return { text: 'غير مفعل', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-4 h-4" /> };
    }
    if (isExpired) {
      return { text: 'منتهي الصلاحية', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> };
    }
    if (isUsedUp) {
      return { text: 'مستنفد', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4" /> };
    }
    return { text: 'مفعل', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
  };

  const formatCouponValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    }
    return `${coupon.value} ر.س`;
  };

  // Statistics
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => {
      const now = new Date();
      const isExpired = new Date(c.expiresAt) < now;
      const isUsedUp = c.usedCount >= c.usageLimit;
      return c.isActive && !isExpired && !isUsedUp;
    }).length,
    inactive: coupons.filter(c => !c.isActive).length,
    expired: coupons.filter(c => new Date(c.expiresAt) < new Date()).length,
    usedUp: coupons.filter(c => c.usedCount >= c.usageLimit).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0)
  };

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = filteredCoupons.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الكوبونات...</p>
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
                <Gift className="w-8 h-8 text-blue-600" />
                إدارة الكوبونات
              </h1>
              <p className="text-gray-600 mt-2">إدارة كوبونات الخصم والعروض</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCoupons}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
              <Link
                to="/admin/coupons/new"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة كوبون
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">إجمالي الكوبونات</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">مفعلة</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">غير مفعلة</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">منتهية الصلاحية</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.usedUp}</div>
              <div className="text-sm text-gray-600">مستنفدة</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
              <div className="text-sm text-gray-600">إجمالي الاستخدام</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في الكوبونات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">جميع الحالات</option>
                <option value="active">مفعلة</option>
                <option value="inactive">غير مفعلة</option>
                <option value="expired">منتهية الصلاحية</option>
                <option value="used_up">مستنفدة</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">جميع الأنواع</option>
                <option value="percentage">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_desc">الأحدث أولاً</option>
                <option value="created_asc">الأقدم أولاً</option>
                <option value="expires_desc">ينتهي أولاً</option>
                <option value="expires_asc">ينتهي أخيراً</option>
                <option value="code">حسب الكود</option>
                <option value="value_desc">الأعلى قيمة</option>
                <option value="value_asc">الأقل قيمة</option>
                <option value="usage_desc">الأكثر استخداماً</option>
                <option value="usage_asc">الأقل استخداماً</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setSortBy('created_desc');
                }}
                className="w-full px-3 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredCoupons.length)} من {filteredCoupons.length} كوبون
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        {currentCoupons.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكود
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الوصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        القيمة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الاستخدام
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        انتهاء الصلاحية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCoupons.map((coupon) => {
                      const status = getCouponStatus(coupon);
                      return (
                        <tr key={coupon.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {coupon.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(coupon.code)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="نسخ الكود"
                              >
                                {copiedCode === coupon.code ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                              {coupon.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                              coupon.type === 'percentage' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {coupon.type === 'percentage' ? <Percent className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                              {coupon.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCouponValue(coupon)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              {coupon.usedCount} / {coupon.usageLimit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              {status.icon}
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(coupon.expiresAt).toLocaleDateString('ar-SA')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/coupons/edit/${coupon.id}`}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              
                              <button
                                onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                className={`p-1 ${
                                  coupon.isActive 
                                    ? 'text-red-600 hover:text-red-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={coupon.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                              >
                                {coupon.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
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
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد كوبونات</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || typeFilter
                ? 'لم يتم العثور على كوبونات تطابق معايير البحث'
                : 'لا توجد كوبونات في المتجر بعد'
              }
            </p>
            {searchTerm || statusFilter || typeFilter ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                مسح الفلاتر
              </button>
            ) : (
              <Link
                to="/admin/coupons/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة أول كوبون
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManagement; 