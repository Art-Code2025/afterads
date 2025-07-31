import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api.js';

interface Coupon {
  id?: string | number;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount?: number;
  expiryDate?: string;
  isActive: boolean;
}

interface CouponFormProps {
  isEdit?: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({ isEdit: propIsEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = propIsEdit || Boolean(id);

  const [coupon, setCoupon] = useState<Coupon>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    usageLimit: 0,
    usedCount: 0,
    expiryDate: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🚀 [CouponForm] Component mounted, isEdit:', isEdit, 'id:', id);
    
    if (isEdit && id) {
      fetchCoupon(id);
    }
  }, [isEdit, id]);

  const fetchCoupon = async (couponId: string) => {
    try {
      setLoading(true);
      console.log('🔄 [CouponForm] Fetching coupon:', couponId);
      
      // Fetch all coupons and find the one we need
      const coupons = await apiCall(API_ENDPOINTS.COUPONS);
      
      console.log('🎫 [CouponForm] All coupons loaded:', coupons.length);
      console.log('🔍 [CouponForm] Looking for coupon ID:', couponId);
      console.log('📋 [CouponForm] Available coupon IDs:', coupons.map((c: Coupon) => c.id));
      
      // Find coupon by ID (handle both string and number IDs)
      const coupon = coupons.find((c: Coupon) => c.id && c.id.toString() === couponId.toString());
      
      if (!coupon) {
        console.error('❌ [CouponForm] Coupon not found with ID:', couponId);
        toast.error('الكوبون غير موجود');
        navigate('/admin');
        return;
      }
      
      console.log('✅ [CouponForm] Coupon found:', coupon.name);
      setCoupon(coupon);
      
    } catch (error) {
      console.error('❌ [CouponForm] Error fetching coupon:', error);
      toast.error('فشل في جلب بيانات الكوبون');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon.code || !coupon.name || coupon.value <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data
      const couponData = {
        ...coupon,
        value: parseFloat(coupon.value.toString()) || 0,
        maxDiscount: parseFloat(coupon.maxDiscount?.toString() || '0') || 0,
        minOrderValue: parseFloat(coupon.minOrderValue?.toString() || '0') || 0,
        usageLimit: parseInt(coupon.usageLimit?.toString() || '0') || 0,
        code: coupon.code.toUpperCase()
      };
      
      console.log('💾 [CouponForm] Saving coupon data:', couponData);

      if (isEdit && id) {
        // Update existing coupon using PUT to /coupons/{id}
        await apiCall(API_ENDPOINTS.COUPON_BY_ID(id), {
          method: 'PUT',
          body: JSON.stringify(couponData)
        });
        toast.success('تم تحديث الكوبون بنجاح');
      } else {
        // Create new coupon using POST method
        await apiCall(API_ENDPOINTS.COUPONS, {
          method: 'POST',
          body: JSON.stringify(couponData)
        });
        toast.success('تم إضافة الكوبون بنجاح');
      }
      
      // Trigger refresh in main app
      window.dispatchEvent(new Event('couponsUpdated'));
      navigate('/admin');
      
    } catch (error) {
      console.error('❌ [CouponForm] Error saving coupon:', error);
      toast.error(isEdit ? 'فشل في تحديث الكوبون' : 'فشل في إضافة الكوبون');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-black">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Mobile Header */}
      <div className="bg-white border-b-2 border-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">
                {isEdit ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {isEdit ? 'تحديث بيانات الكوبون' : 'إنشاء كوبون خصم جديد'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-black transition-colors text-sm sm:text-base border border-black px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              ← العودة للداشبورد
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">🎫</span>
              معلومات الكوبون الأساسية
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Coupon Code */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  كود الكوبون *
                </label>
                <input
                  type="text"
                  value={coupon.code}
                  onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="SAVE20"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">سيتم تحويل الأحرف إلى كبيرة تلقائياً</p>
              </div>

              {/* Coupon Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  اسم الكوبون *
                </label>
                <input
                  type="text"
                  value={coupon.name}
                  onChange={(e) => setCoupon({ ...coupon, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="خصم 20% على جميع المنتجات"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  وصف الكوبون
                </label>
                <textarea
                  value={coupon.description}
                  onChange={(e) => setCoupon({ ...coupon, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 resize-none text-sm sm:text-base"
                  placeholder="وصف مختصر للكوبون وشروط الاستخدام"
                />
              </div>
            </div>
          </div>

          {/* Discount Settings Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">💰</span>
              إعدادات الخصم
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  نوع الخصم *
                </label>
                <select
                  value={coupon.type}
                  onChange={(e) => setCoupon({ ...coupon, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black text-sm sm:text-base"
                  required
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ر.س)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  قيمة الخصم *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={coupon.value}
                  onChange={(e) => setCoupon({ ...coupon, value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder={coupon.type === 'percentage' ? '20' : '50.00'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {coupon.type === 'percentage' ? 'النسبة المئوية للخصم' : 'المبلغ بالريال السعودي'}
                </p>
              </div>

              {/* Max Discount (for percentage only) */}
              {coupon.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    الحد الأقصى للخصم (ر.س)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={coupon.maxDiscount || ''}
                    onChange={(e) => setCoupon({ ...coupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                    placeholder="100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لعدم وضع حد أقصى</p>
                </div>
              )}

              {/* Min Order Value */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  الحد الأدنى لقيمة الطلب (ر.س)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={coupon.minOrderValue || ''}
                  onChange={(e) => setCoupon({ ...coupon, minOrderValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="200.00"
                />
                <p className="text-xs text-gray-500 mt-1">الحد الأدنى لقيمة الطلب لتطبيق الكوبون</p>
              </div>
            </div>
          </div>

          {/* Usage & Expiry Settings Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">⏰</span>
              إعدادات الاستخدام والانتهاء
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  حد الاستخدام
                </label>
                <input
                  type="number"
                  min="0"
                  value={coupon.usageLimit || ''}
                  onChange={(e) => setCoupon({ ...coupon, usageLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">عدد المرات المسموح باستخدام الكوبون</p>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={coupon.expiryDate || ''}
                  onChange={(e) => setCoupon({ ...coupon, expiryDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للكوبون دائم</p>
              </div>

              {/* Active Status */}
              <div className="sm:col-span-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coupon.isActive}
                    onChange={(e) => setCoupon({ ...coupon, isActive: e.target.checked })}
                    className="w-4 h-4 text-black bg-white border-2 border-black rounded focus:ring-black focus:ring-2"
                  />
                  <span className="mr-3 text-sm font-medium text-black">
                    الكوبون نشط ومتاح للاستخدام
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {isEdit ? 'تحديث الكوبون' : 'إضافة الكوبون'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm; 