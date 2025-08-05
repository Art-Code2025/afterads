import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard,
  ArrowRight, 
  Download,
  Share2,
  Star,
  Gift,
  Heart,
  Home,
  ShoppingBag,
  Calendar,
  User,
  Mail
} from 'lucide-react';

interface OrderData {
  id?: string;
  orderNumber?: string;
  items?: any[];
  userData?: any;
  paymentMethod?: string;
  total?: number;
  totalAmount?: number;
  estimatedDelivery?: string;
  shippingCost?: number;
  discount?: number;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    shippingAddress?: string;
  };
  shippingAddress?: string;
  deliveryNotes?: string;
  paymentStatus?: string;
  status?: string;
  estimatedProcessingTime?: string;
  trackingNumber?: string;
}

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    console.log('🔍 [ThankYou] Component mounted, searching for order data...');
    
    // Show confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // محاولة الحصول على بيانات الطلب من مصادر متعددة
    const orderFromState = location.state?.orderData || location.state?.order;
    const orderFromStorage = localStorage.getItem('finalOrderData');
    const pendingOrderData = localStorage.getItem('pendingOrderData');
    const lastOrderData = localStorage.getItem('lastOrderData');
    const cartData = localStorage.getItem('cartData');
    
    console.log('🔍 [ThankYou] Order from state:', orderFromState);
    console.log('🔍 [ThankYou] Order from storage:', orderFromStorage);
    console.log('🔍 [ThankYou] Pending order data:', pendingOrderData);
    console.log('🔍 [ThankYou] Last order data:', lastOrderData);
    console.log('🔍 [ThankYou] Cart data available:', !!cartData);
    
    let foundOrderData = null;
    
    // الأولوية الأولى: بيانات من state
    if (orderFromState) {
      console.log('✅ [ThankYou] Using order data from state');
      foundOrderData = orderFromState;
      setOrderData(orderFromState);
    }
    // الأولوية الثانية: بيانات الطلب النهائي من localStorage
    else if (orderFromStorage) {
      try {
        const parsedOrder = JSON.parse(orderFromStorage);
        console.log('✅ [ThankYou] Using order data from localStorage');
        foundOrderData = parsedOrder;
        setOrderData(parsedOrder);
      } catch (error) {
        console.error('❌ [ThankYou] Error parsing final order data:', error);
        // Continue to next data source
      }
    }
    // الأولوية الثالثة: بيانات الطلب المعلق
    else if (pendingOrderData) {
      try {
        const parsedPendingOrder = JSON.parse(pendingOrderData);
        console.log('✅ [ThankYou] Using pending order data');
        foundOrderData = parsedPendingOrder;
        setOrderData(parsedPendingOrder);
      } catch (error) {
        console.error('❌ [ThankYou] Error parsing pending order data:', error);
        // Continue to next data source
      }
    }
    // الأولوية الرابعة: بيانات الطلب الأخير
    else if (lastOrderData) {
      try {
        const parsedLastOrder = JSON.parse(lastOrderData);
        console.log('✅ [ThankYou] Using last order data');
        foundOrderData = parsedLastOrder;
        setOrderData(parsedLastOrder);
      } catch (error) {
        console.error('❌ [ThankYou] Error parsing last order data:', error);
        // Continue to fallback
      }
    }
    
    // إذا لم توجد بيانات الطلب، عرض رسالة وتوجيه المستخدم
    if (!foundOrderData) {
      console.log('⚠️ [ThankYou] No order data found from any source');
      console.log('🔄 [ThankYou] Will redirect to home in 5 seconds...');
      
      // عرض رسالة للمستخدم
      setOrderData({
        orderNumber: 'غير متوفر',
        total: 0,
        items: [],
        userData: {},
        paymentMethod: 'unknown'
      });
      
      // توجيه بعد 5 ثوانٍ
      setTimeout(() => {
        console.log('🔄 [ThankYou] Redirecting to home...');
        navigate('/');
      }, 5000);
    } else {
      console.log('✅ [ThankYou] Order data loaded successfully:', foundOrderData);
    }
  }, [location.state, navigate]);

  const orderNumber = orderData?.orderNumber || orderData?.id || `MW${Date.now().toString().slice(-6)}`;
  const estimatedDelivery = orderData?.estimatedDelivery || 'خلال 2-3 أيام عمل';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50" dir="rtl">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow animate-float">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center animate-ping">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
              تم إرسال طلبك بنجاح! 🎉
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              شكراً لك على ثقتك بنا. سنقوم بمعالجة طلبك في أقرب وقت ممكن وإرسال تفاصيل الشحن قريباً.
            </p>
              
            {/* Order Number Highlight */}
            <div className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-2xl shadow-2xl animate-gradient hover:scale-105 transition-transform duration-300">
              <Package className="w-6 h-6" />
              <span className="text-lg font-bold">رقم الطلب: #{orderNumber}</span>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-900 to-black p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">تفاصيل الطلب</h2>
                  <p className="text-gray-300 text-lg">رقم الطلب: #{orderNumber}</p>
                  {orderData?.orderNumber === 'غير متوفر' && (
                    <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm">
                        لم نتمكن من العثور على تفاصيل الطلب. سيتم توجيهك للصفحة الرئيسية خلال 5 ثوانٍ.
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <div className="bg-white/20 rounded-2xl px-6 py-4">
                    <p className="text-sm text-gray-300 mb-1">تاريخ الطلب</p>
                    <p className="text-lg font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                  {orderData?.paymentMethod && (
                    <div className="bg-white/20 rounded-2xl px-6 py-4 mt-3">
                      <p className="text-sm text-gray-300 mb-1">طريقة الدفع</p>
                      <p className="text-lg font-bold">
                        {orderData.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 
                         orderData.paymentMethod === 'bank' ? 'تحويل بنكي' : 
                         orderData.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
                          
            {/* Order Items */}
            {orderData?.items && orderData.items.length > 0 && orderData.orderNumber !== 'غير متوفر' && (
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">المنتجات المطلوبة</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      {item.image && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name || item.title}</h4>
                        {item.size && (
                          <p className="text-sm text-gray-600">الحجم: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-600">اللون: {item.color}</p>
                        )}
                        <p className="text-sm text-gray-600">الكمية: {item.quantity || 1}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">ملاحظات: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ر.س</p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-sm text-gray-500 line-through">{item.originalPrice.toFixed(2)} ر.س</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Total Summary */}
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>المجموع الفرعي:</span>
                      <span>{(orderData.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0)).toFixed(2)} ر.س</span>
                    </div>
                    {orderData.shippingCost && (
                      <div className="flex justify-between text-gray-600">
                        <span>رسوم الشحن:</span>
                        <span>{orderData.shippingCost.toFixed(2)} ر.س</span>
                      </div>
                    )}
                    {orderData.discount && (
                      <div className="flex justify-between text-green-600">
                        <span>الخصم:</span>
                        <span>-{orderData.discount.toFixed(2)} ر.س</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>المجموع الإجمالي:</span>
                        <span>{orderData.total?.toFixed(2) || '0.00'} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* No Items Fallback */}
            {(!orderData?.items || orderData.items.length === 0) && orderData?.orderNumber !== 'غير متوفر' && (
              <div className="p-8 border-b border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تفاصيل للمنتجات</h3>
                <p className="text-gray-600">سيتم إرسال تفاصيل المنتجات عبر رسالة التأكيد</p>
              </div>
            )}

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Delivery Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">التوصيل</h3>
                      <p className="text-blue-600 font-medium">{estimatedDelivery}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    {(orderData?.userData || orderData?.customerInfo) && orderData?.orderNumber !== 'غير متوفر' && (
                      <>
                        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100">
                          <User className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{orderData.userData?.name || orderData.customerInfo?.name || 'غير محدد'}</div>
                            <div className="text-gray-500">{orderData.userData?.phone || orderData.customerInfo?.phone || 'غير محدد'}</div>
                            {(orderData.userData?.email || orderData.customerInfo?.email) && (
                              <div className="text-gray-500" dir="ltr">{orderData.userData?.email || orderData.customerInfo?.email}</div>
                            )}
                          </div>
                        </div>
                        {(orderData.userData?.address || orderData.customerInfo?.address || orderData.shippingAddress) && (
                          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-700">عنوان التوصيل:</div>
                              <div className="text-gray-600">{orderData.userData?.address || orderData.customerInfo?.address || orderData.shippingAddress}</div>
                              {orderData.deliveryNotes && (
                                <div className="text-gray-500 text-xs mt-1">ملاحظات: {orderData.deliveryNotes}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {orderData?.orderNumber === 'غير متوفر' && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">معلومات التوصيل غير متوفرة حالياً</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">الدفع</h3>
                      <p className="text-green-600 font-medium">
                        {orderData?.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 
                         orderData?.paymentMethod === 'bank' ? 'تحويل بنكي' :
                         orderData?.paymentMethod === 'card' ? 'بطاقة ائتمانية' :
                         orderData?.paymentMethod || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between items-center">
                      <span>المبلغ الإجمالي:</span>
                      <span className="font-bold text-lg text-green-600">
                        {orderData?.total?.toFixed(2) || orderData?.totalAmount?.toFixed(2) || '0.00'} ر.س
                      </span>
                    </div>
                    {orderData?.paymentStatus && (
                      <div className="flex justify-between items-center">
                        <span>حالة الدفع:</span>
                        <span className={`font-medium ${
                          orderData.paymentStatus === 'paid' ? 'text-green-600' :
                          orderData.paymentStatus === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {orderData.paymentStatus === 'paid' ? 'تم الدفع' :
                           orderData.paymentStatus === 'pending' ? 'في الانتظار' :
                           orderData.paymentStatus}
                        </span>
                      </div>
                    )}
                    {orderData?.paymentMethod === 'bank' && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-2">تفاصيل التحويل البنكي:</p>
                        <p className="text-xs text-gray-700">سيتم إرسال تفاصيل الحساب البنكي عبر رسالة التأكيد</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">حالة الطلب</h3>
                      <p className="text-purple-600 font-medium">
                        {orderData?.status === 'confirmed' ? 'مؤكد' :
                         orderData?.status === 'processing' ? 'قيد المعالجة' :
                         orderData?.status === 'shipped' ? 'تم الشحن' :
                         orderData?.status === 'delivered' ? 'تم التوصيل' :
                         orderData?.orderNumber === 'غير متوفر' ? 'في الانتظار' :
                         'قيد المعالجة'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">التحديث التالي:</span>
                      </div>
                      <p className="text-xs">
                        {orderData?.orderNumber === 'غير متوفر' 
                          ? 'سيتم تحديث حالة الطلب عند توفر البيانات'
                          : 'سنقوم بإرسال رسالة تأكيد قريباً مع تفاصيل الشحن والتتبع.'}
                      </p>
                    </div>
                    {orderData?.estimatedProcessingTime && (
                      <div className="flex justify-between items-center">
                        <span>وقت المعالجة المتوقع:</span>
                        <span className="font-medium">{orderData.estimatedProcessingTime}</span>
                      </div>
                    )}
                    {orderData?.trackingNumber && (
                      <div className="flex justify-between items-center">
                        <span>رقم التتبع:</span>
                        <span className="font-medium font-mono">{orderData.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
              <h3 className="text-2xl font-bold">الخطوات التالية</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">رسالة التأكيد</h4>
                  <p className="text-gray-600 text-sm">ستصلك رسالة تأكيد على الواتساب خلال دقائق</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">تحضير الطلب</h4>
                  <p className="text-gray-600 text-sm">سنقوم بتحضير وتغليف طلبك بعناية فائقة</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">الشحن والتوصيل</h4>
                  <p className="text-gray-600 text-sm">سيتم توصيل طلبك خلال {estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              to="/"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-2xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105"
            >
              <Home className="w-6 h-6" />
              العودة للرئيسية
            </Link>
            
            <Link
              to="/products"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105"
            >
              <ShoppingBag className="w-6 h-6" />
              متابعة التسوق
            </Link>
            
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105"
            >
              <Download className="w-6 h-6" />
              طباعة الفاتورة
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-200 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">هل تحتاج مساعدة؟</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                فريق خدمة العملاء لدينا جاهز لمساعدتك في أي وقت. لا تتردد في التواصل معنا.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/966500000000"
                  className="inline-flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-bold"
                >
                  <Phone className="w-5 h-5" />
                  واتساب
                </a>
                <a
                  href="tel:+966500000000"
                  className="inline-flex items-center gap-3 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-bold"
                >
                  <Phone className="w-5 h-5" />
                  اتصال مباشر
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ThankYou;