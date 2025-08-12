import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Printer,
  Mail,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  attachments?: {
    images?: string[];
    text?: string;
  };
}

interface Order {
  id: string | number; // Changed from number to string | number for consistency
  customerName: string;
  customerPhone?: string; // Changed from string to optional
  customerEmail?: string;
  address: string;
  city: string;
  items: OrderItem[];
  total: number;
  status?: string; // Changed from string to optional
  createdAt?: string; // Changed from string to optional
}

interface InvoiceManagementProps {
  orders: Order[];
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ orders }) => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Filter orders based on search and filters
  // Update filteredOrders to handle mixed ID types
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || // Convert to string
                       (order.customerPhone?.includes(searchTerm) || false);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.createdAt || new Date()); // Provide fallback date
    const today = new Date();
    let matchesDate = true;
    
    if (dateFilter === 'today') {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = orderDate >= weekAgo;
    } else if (dateFilter === 'month') {
      matchesDate = orderDate.getMonth() === today.getMonth() && 
                   orderDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Generate invoice for single order
  const generateSingleInvoice = async (orderId: string | number) => {
    setIsGenerating(true);
    try {
      const orderIdStr = typeof orderId === 'string' ? orderId : orderId.toString();
      
      const response = await fetch('/.netlify/functions/invoice-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single-order',
          orderId: orderIdStr
        })
      });
  
      if (!response.ok) {
        throw new Error('فشل في إنشاء الفاتورة');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderIdStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
      toast.success(`تم تحميل فاتورة الطلب #${orderIdStr} بنجاح`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('فشل في إنشاء الفاتورة');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate monthly statistics report
  const generateMonthlyReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/.netlify/functions/invoice-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'monthly-stats',
          year: selectedYear,
          month: selectedMonth
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير الشهري');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-report-${selectedYear}-${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`تم تحميل التقرير الشهري لشهر ${selectedMonth}/${selectedYear} بنجاح`);
    } catch (error) {
      console.error('Error generating monthly report:', error);
      toast.error('فشل في إنشاء التقرير الشهري');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate daily statistics report
  const generateDailyReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/.netlify/functions/invoice-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily-stats',
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير اليومي');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-report-${selectedYear}-${selectedMonth}-${selectedDay}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`تم تحميل التقرير اليومي لتاريخ ${selectedDay}/${selectedMonth}/${selectedYear} بنجاح`);
    } catch (error) {
      console.error('Error generating daily report:', error);
      toast.error('فشل في إنشاء التقرير اليومي');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return { color: 'text-green-600 bg-green-50', icon: CheckCircle };
      case 'shipped':
        return { color: 'text-blue-600 bg-blue-50', icon: TrendingUp };
      case 'confirmed':
        return { color: 'text-purple-600 bg-purple-50', icon: CheckCircle };
      case 'preparing':
        return { color: 'text-yellow-600 bg-yellow-50', icon: Clock };
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: AlertCircle };
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'preparing': 'قيد التحضير',
      'shipped': 'تم الشحن',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📄 نظام إدارة الفواتير</h1>
            <p className="text-blue-100">إنشاء فواتير احترافية وتقارير إحصائية مفصلة</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <div className="text-blue-100">إجمالي الطلبات</div>
          </div>
        </div>
      </div>

      {/* Statistics Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Report */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">التقرير الشهري</h3>
              <p className="text-gray-600">إحصائيات مفصلة للشهر المحدد</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2024, month - 1).toLocaleDateString('ar-SA', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateMonthlyReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 ml-2" />
              )}
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل التقرير الشهري'}
            </button>
          </div>
        </div>

        {/* Daily Report */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center ml-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">التقرير اليومي</h3>
              <p className="text-gray-600">إحصائيات مفصلة لليوم المحدد</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اليوم</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateDailyReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 ml-2" />
              )}
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل التقرير اليومي'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">فواتير الطلبات</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} من {orders.length} طلب
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="preparing">قيد التحضير</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status || 'pending');
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{order.total.toFixed(2)} ر.س</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 ml-1" />
                        {getStatusText(order.status || 'pending')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'تاريخ غير محدد'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateSingleInvoice(order.id.toString())}
                          disabled={isGenerating}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="تحميل فاتورة Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">لم يتم العثور على طلبات تطابق المعايير المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;