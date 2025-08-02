import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, ArrowRight, Home, Package } from 'lucide-react';
import api from '../utils/api';

const PaymentResult: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // الحصول على معاملات الـ URL
        const success = searchParams.get('success');
        const orderId = searchParams.get('order');
        const transactionId = searchParams.get('id');
        
        console.log('💳 Payment result params:', { success, orderId, transactionId });

        // التحقق من وجود بيانات الطلب المحفوظة
        const pendingOrderData = localStorage.getItem('pendingOrderData');
        let parsedData = null;
        if (pendingOrderData) {
          parsedData = JSON.parse(pendingOrderData);
          setOrderData(parsedData);
          
          // إزالة البيانات المؤقتة
          localStorage.removeItem('pendingOrderData');
        }

        if (success === 'true') {
          setPaymentStatus('success');
          toast.success('تم الدفع بنجاح! شكراً لك.');
          
          // حفظ الطلب في قاعدة البيانات عند نجاح الدفع
          if (parsedData) {
            try {
              console.log('💾 [PaymentResult] Saving order to database after successful payment...');
              console.log('📋 [PaymentResult] Parsed data structure:', Object.keys(parsedData));
              console.log('📋 [PaymentResult] Order data exists:', !!parsedData.orderData);
              
              // استخدام البيانات الصحيحة بناءً على البنية المحفوظة
              const orderDataToSave = parsedData.orderData || {
                customerName: parsedData.userData?.name,
                customerEmail: parsedData.userData?.email,
                customerPhone: parsedData.userData?.phone,
                items: parsedData.items || [],
                subtotal: parsedData.subtotal || 0,
                shippingCost: parsedData.shipping || 0,
                total: parsedData.total || 0,
                paymentMethod: parsedData.paymentMethod || 'card'
              };
              
              // تحديث بيانات الطلب بحالة الدفع الناجح
              const finalOrderData = {
                ...orderDataToSave,
                paymentStatus: 'paid',
                status: 'confirmed',
                transactionId: transactionId
              };
              
              // حفظ الطلب في قاعدة البيانات
              const result = await api.orders.create(finalOrderData);
              console.log('✅ [PaymentResult] Order saved successfully:', result);
              
              // حفظ بيانات الطلب النهائية في localStorage
              const finalOrderForDisplay = {
                ...parsedData,
                orderId: result.id,
                orderNumber: result.orderNumber || result.id,
                paymentStatus: 'paid',
                transactionId: transactionId
              };
              
              localStorage.setItem('lastOrderData', JSON.stringify(finalOrderForDisplay));
              setOrderData(finalOrderForDisplay);
              
            } catch (saveError) {
              console.error('❌ [PaymentResult] Error saving order to database:', saveError);
              toast.error('تم الدفع بنجاح ولكن حدث خطأ في حفظ الطلب. سيتم التواصل معك قريباً.');
            }
          }
          
          // مسح السلة
          localStorage.removeItem('cartItems');
          localStorage.removeItem('cart');
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          
          // التوجيه التلقائي لصفحة الشكر بعد 3 ثوانٍ
          setTimeout(() => {
            console.log('🔄 [PaymentResult] Auto-redirecting to thank you page...');
            navigate('/thank-you', { replace: true });
          }, 3000);
          
        } else if (success === 'false') {
          setPaymentStatus('failed');
          toast.error('فشل في عملية الدفع. يرجى المحاولة مرة أخرى.');
          
          // التوجيه التلقائي لصفحة الـ checkout بعد 5 ثوانٍ
          setTimeout(() => {
            console.log('🔄 [PaymentResult] Auto-redirecting to checkout page...');
            navigate('/checkout', { replace: true });
          }, 5000);
          
        } else {
          setPaymentStatus('pending');
        }
        
      } catch (error) {
        console.error('❌ Error processing payment result:', error);
        setPaymentStatus('failed');
        toast.error('حدث خطأ في معالجة نتيجة الدفع.');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      navigate('/thank-you');
    } else {
      navigate('/checkout');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري معالجة نتيجة الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Header */}
            <div className={`p-8 text-center ${
              paymentStatus === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : paymentStatus === 'failed'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
            }`}>
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                {paymentStatus === 'success' && (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                )}
                {paymentStatus === 'failed' && (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
                {paymentStatus === 'pending' && (
                  <Clock className="w-12 h-12 text-yellow-500" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {paymentStatus === 'success' && 'تم الدفع بنجاح!'}
                {paymentStatus === 'failed' && 'فشل في الدفع'}
                {paymentStatus === 'pending' && 'معالجة الدفع'}
              </h1>
              
              <p className="text-white/90 text-lg">
                {paymentStatus === 'success' && 'شكراً لك! تم تأكيد طلبك وسيتم تجهيزه قريباً.'}
                {paymentStatus === 'failed' && 'لم تتم عملية الدفع. يرجى المحاولة مرة أخرى.'}
                {paymentStatus === 'pending' && 'جاري معالجة عملية الدفع...'}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {paymentStatus === 'success' && orderData && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      تفاصيل الطلب
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">رقم الطلب:</span>
                        <p className="font-bold text-gray-900">{orderData.orderNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">المبلغ الإجمالي:</span>
                        <p className="font-bold text-gray-900">{orderData.total?.toFixed(2)} ر.س</p>
                      </div>
                      <div>
                        <span className="text-gray-600">طريقة الدفع:</span>
                        <p className="font-bold text-gray-900">دفع إلكتروني</p>
                      </div>
                      <div>
                        <span className="text-gray-600">حالة الدفع:</span>
                        <p className="font-bold text-green-600">مدفوع</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">الخطوات التالية</h4>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• سيتم تجهيز طلبك خلال 24 ساعة</li>
                      <li>• ستصلك رسالة تأكيد على الواتساب</li>
                      <li>• سيتم شحن الطلب خلال {orderData.estimatedDelivery}</li>
                    </ul>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="font-bold text-red-900 mb-2">أسباب محتملة لفشل الدفع:</h3>
                    <ul className="text-red-800 space-y-1 text-sm">
                      <li>• رصيد غير كافي في البطاقة</li>
                      <li>• انتهاء صلاحية البطاقة</li>
                      <li>• خطأ في بيانات البطاقة</li>
                      <li>• مشكلة مؤقتة في الشبكة</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-2">ماذا يمكنك فعله؟</h4>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• تأكد من صحة بيانات البطاقة</li>
                      <li>• تأكد من وجود رصيد كافي</li>
                      <li>• جرب بطاقة أخرى</li>
                      <li>• اختر الدفع عند الاستلام</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={handleContinue}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    paymentStatus === 'success'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {paymentStatus === 'success' ? (
                    <>
                      <Package className="w-5 h-5" />
                      عرض تفاصيل الطلب
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      إعادة المحاولة
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Home className="w-5 h-5" />
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;