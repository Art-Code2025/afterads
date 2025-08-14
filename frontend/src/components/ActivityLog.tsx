import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Package, Edit, Trash2, Plus, FileText, Phone, X, CheckCircle, AlertCircle, RefreshCw, Filter, Search, Calendar } from 'lucide-react';
import { FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
// import api from '../utils/api'; // No longer needed - using localStorage

interface ActivityLogEntry {
  id: string;
  staffId: string;
  staffName: string;
  staffUsername?: string;
  action: 'order_status_change' | 'order_note_add' | 'order_data_edit' | 'order_cancel' | 'customer_data_edit' | 'order_create' | 'تعديل حالة الطلب';
  orderId?: string;
  customerId?: string;
  details: {
    oldValue?: any;
    newValue?: any;
    oldStatus?: string;
    newStatus?: string;
    customerName?: string;
    orderTotal?: number;
    firstName?: string;
    email?: string;
    note?: string;
    field?: string;
    reason?: string;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ActivityLogProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  staffFilter?: string;
  staffName?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ currentUser, isOpen, onClose, staffFilter, staffName }) => {
  if (!isOpen) return null;
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [error, setError] = useState('');



  useEffect(() => {
    if (isOpen) {
      fetchActivities();
      fetchStaffList();
      // Set staff filter if provided
      if (staffFilter) {
        setFilterStaff(staffFilter);
      }
    }
  }, [staffFilter, isOpen]);

  useEffect(() => {
    filterActivities();
  }, [allActivities, searchTerm, filterAction, filterStaff, dateRange]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Read activities from localStorage instead of API
      const storedActivities = localStorage.getItem('activityLogs');
      let loadedActivities: ActivityLogEntry[] = [];
      
      if (storedActivities) {
        try {
          loadedActivities = JSON.parse(storedActivities);
        } catch (parseError) {
          console.error('Error parsing stored activities:', parseError);
          loadedActivities = [];
        }
      }
      
      // Sort by timestamp (newest first)
      loadedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // حفظ البيانات الأصلية
      setAllActivities(loadedActivities);
      setActivities(loadedActivities);
      
      console.log(`📋 Loaded ${loadedActivities.length} activities from localStorage`);
      
    } catch (error) {
      console.error('Error fetching activities from localStorage:', error);
      setError('حدث خطأ في تحميل البيانات المحلية');
      setAllActivities([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      // Extract unique staff from stored activities
      const storedActivities = localStorage.getItem('activityLogs');
      let uniqueStaff: any[] = [];
      
      if (storedActivities) {
        try {
          const activities: ActivityLogEntry[] = JSON.parse(storedActivities);
          const staffMap = new Map();
          
          activities.forEach(activity => {
            if (!staffMap.has(activity.staffId)) {
              staffMap.set(activity.staffId, {
                id: activity.staffId,
                name: activity.staffName,
                username: activity.staffUsername || activity.staffName
              });
            }
          });
          
          uniqueStaff = Array.from(staffMap.values());
        } catch (parseError) {
          console.error('Error parsing stored activities for staff list:', parseError);
        }
      }
      
      // If no staff found in activities, use default list
      if (uniqueStaff.length === 0) {
        uniqueStaff = [
          { id: 'staff1', name: 'أحمد محمد', username: 'ahmed' },
          { id: 'staff2', name: 'سارة أحمد', username: 'sara' },
          { id: 'staff3', name: 'محمود علي', username: 'mahmoud' }
        ];
      }
      
      setStaffList(uniqueStaff);
      console.log(`👥 Loaded ${uniqueStaff.length} staff members from activities`);
      
    } catch (error) {
      console.error('Error fetching staff list from localStorage:', error);
      // Fallback to default staff list
      const defaultStaff = [
        { id: 'staff1', name: 'أحمد محمد', username: 'ahmed' },
        { id: 'staff2', name: 'سارة أحمد', username: 'sara' },
        { id: 'staff3', name: 'محمود علي', username: 'mahmoud' }
      ];
      setStaffList(defaultStaff);
    }
  };

  const filterActivities = () => {
    let filtered = [...allActivities];

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.orderId?.includes(searchTerm) ||
        activity.details.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب نوع النشاط
    if (filterAction !== 'all') {
      if (filterAction === 'order_data_edit') {
        // فلتر التعديلات يشمل جميع أنواع التعديلات
        filtered = filtered.filter(activity => 
          activity.action === 'order_data_edit' || 
          activity.action === 'order_status_change' || 
          activity.action === 'تعديل حالة الطلب' || 
          activity.action === 'customer_data_edit'
        );
      } else {
        filtered = filtered.filter(activity => activity.action === filterAction);
      }
    }

    // تصفية حسب الموظف
    if (filterStaff !== 'all') {
      filtered = filtered.filter(activity => activity.staffId === filterStaff);
    }

    // تصفية حسب التاريخ
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= startDate
      );
    }

    // ترتيب حسب التاريخ (الأحدث أولاً)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'order_status_change':
      case 'تعديل حالة الطلب':
        return <CheckCircle className="w-4 h-4" />;
      case 'order_note_add':
        return <FileText className="w-4 h-4" />;
      case 'order_data_edit':
        return <Edit className="w-4 h-4" />;
      case 'order_cancel':
        return <X className="w-4 h-4" />;
      case 'customer_data_edit':
        return <User className="w-4 h-4" />;
      case 'order_create':
        return <Plus className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'order_status_change':
      case 'تعديل حالة الطلب':
        return 'تعديل حالة الطلب';
      case 'order_note_add':
        return 'إضافة ملاحظة';
      case 'order_data_edit':
        return 'تعديل بيانات الطلب';
      case 'order_cancel':
        return 'إلغاء الطلب';
      case 'customer_data_edit':
        return 'تعديل بيانات العميل';
      case 'order_create':
        return 'إنشاء طلب جديد';
      default:
        return action || 'نشاط غير محدد';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'order_status_change':
      case 'تعديل حالة الطلب':
        return 'bg-blue-100 text-blue-800';
      case 'order_note_add':
        return 'bg-green-100 text-green-800';
      case 'order_data_edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'order_cancel':
        return 'bg-red-100 text-red-800';
      case 'customer_data_edit':
        return 'bg-purple-100 text-purple-800';
      case 'order_create':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityDescription = (activity: ActivityLogEntry) => {
    const { action, details, orderId, staffName } = activity;
    
    switch (action) {
      case 'order_status_change':
      case 'تعديل حالة الطلب':
        const oldStatus = details.oldStatus || details.oldValue || 'غير محدد';
        const newStatus = details.newStatus || details.newValue || 'غير محدد';
        const customerName = details.customerName || '';
        const orderTotal = details.orderTotal ? ` (${details.orderTotal.toFixed(2)} ر.س)` : '';
        return `الموظف "${staffName}" عدل حالة طلب #${orderId} من "${oldStatus}" إلى "${newStatus}"${customerName ? ` للعميل ${customerName}` : ''}${orderTotal}`;
      case 'order_note_add':
        const noteText = details.note || details.newValue || 'ملاحظة فارغة';
        return (
          <div>
            <span>الموظف "{staffName}" أضاف ملاحظة على طلب #{orderId}:</span>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">📝 الملاحظة:</p>
              <p className="text-sm text-gray-800 mt-1">"{noteText}"</p>
            </div>
          </div>
        );
      case 'order_data_edit':
        return `الموظف "${staffName}" عدل ${details.field || 'بيانات'} لطلب #${orderId} من "${details.oldValue || 'غير محدد'}" إلى "${details.newValue || 'غير محدد'}"`;
      case 'order_cancel':
        return `الموظف "${staffName}" ألغى طلب #${orderId}${details.reason ? ` - السبب: ${details.reason}` : ''}`;
      case 'customer_data_edit':
        const fieldName = details.field || 'البيانات';
        const oldValue = details.oldValue || 'غير محدد';
        const newValue = details.newValue || 'غير محدد';
        return `الموظف "${staffName}" عدل ${fieldName} للعميل من "${oldValue}" إلى "${newValue}"`;
      case 'order_create':
        const total = details.orderTotal ? ` بقيمة ${details.orderTotal.toFixed(2)} ر.س` : '';
        const customer = details.customerName ? ` للعميل ${details.customerName}` : '';
        return `الموظف "${staffName}" أنشأ طلب جديد #${orderId}${customer}${total}`;
      default:
        // معالجة أفضل للأنشطة غير المحددة
        if (details.note) {
          return (
            <div>
              <span>الموظف "{staffName}" قام بنشاط:</span>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">📋 التفاصيل:</p>
                <p className="text-sm text-gray-800 mt-1">"{details.note}"</p>
              </div>
            </div>
          );
        }
        return `الموظف "${staffName}" قام بنشاط: ${action || 'غير محدد'}`;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل سجلات الأنشطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              {staffName ? `سجل أنشطة ${staffName}` : 'سجل الأنشطة'}
            </h1>
            <p className="text-gray-600 mt-2">
              {staffName ? `تتبع أنشطة الموظف ${staffName} مع الطلبات والعملاء` : 'تتبع جميع أنشطة الموظفين مع الطلبات والعملاء'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchActivities();
                fetchStaffList();
                toast.success('تم تحديث سجل الأنشطة بنجاح');
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">

          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في الأنشطة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">جميع الأنشطة</option>
                <option value="order_status_change">تعديل حالة الطلب</option>
                <option value="order_note_add">إضافة ملاحظة</option>
                <option value="order_data_edit">تعديل بيانات الطلب</option>
                <option value="order_cancel">إلغاء الطلب</option>
                <option value="customer_data_edit">تعديل بيانات العميل</option>
                <option value="order_create">إنشاء طلب جديد</option>
              </select>
            </div>

            {/* Staff Filter */}
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">جميع الموظفين</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">جميع التواريخ</option>
                <option value="today">اليوم</option>
                <option value="week">آخر أسبوع</option>
                <option value="month">آخر شهر</option>
              </select>
            </div>
          </div>
          </div>

          {/* Statistics - Interactive Filter Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button 
            onClick={() => setFilterAction('all')}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 text-right transition-all hover:shadow-md ${
              filterAction === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الأنشطة</p>
                <p className="text-2xl font-bold text-gray-900">{allActivities.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setFilterAction('order_data_edit')}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 text-right transition-all hover:shadow-md ${
              filterAction === 'order_data_edit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">التعديلات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allActivities.filter(a => a.action === 'order_data_edit' || a.action === 'order_status_change' || a.action === 'تعديل حالة الطلب' || a.action === 'customer_data_edit').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setFilterAction('order_note_add')}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 text-right transition-all hover:shadow-md ${
              filterAction === 'order_note_add' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الملاحظات</p>
                <p className="text-2xl font-bold text-green-600">
                  {allActivities.filter(a => a.action === 'order_note_add').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setFilterAction('order_cancel')}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 text-right transition-all hover:shadow-md ${
              filterAction === 'order_cancel' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المحذوفات</p>
                <p className="text-2xl font-bold text-red-600">
                  {allActivities.filter(a => a.action === 'order_cancel').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </button>
          </div>

          {/* Activities List */}
          {currentActivities.length > 0 ? (
            <>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">سجل الأنشطة</h3>
                <p className="text-sm text-gray-600 mt-1">
                  عرض {startIndex + 1} - {Math.min(endIndex, filteredActivities.length)} من {filteredActivities.length} نشاط
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {currentActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(activity.action)}`}>
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                              {getActionText(activity.action)}
                            </span>
                            {activity.orderId && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                طلب #{activity.orderId}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-900 mb-2">
                            {formatActivityDescription(activity)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.staffName} (@{activity.staffUsername})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.timestamp).toLocaleString('ar-EG')}
                            </span>
                            {activity.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {activity.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      عرض <span className="font-medium">{startIndex + 1}</span> إلى{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredActivities.length)}</span> من{' '}
                      <span className="font-medium">{filteredActivities.length}</span> نتيجة
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أنشطة</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterAction !== 'all' || filterStaff !== 'all' || dateRange !== 'all'
                ? 'لا توجد أنشطة تطابق المرشحات المحددة'
                : 'لم يتم تسجيل أي أنشطة بعد'}
            </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;