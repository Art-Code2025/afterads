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
    console.log('🔄 [PaymentResult] useEffect triggered, calling processPaymentResult...');
    console.log('🔄 [PaymentResult] Current URL:', window.location.href);
    console.log('🔄 [PaymentResult] Search params:', Object.fromEntries(searchParams.entries()));
    
    const processPaymentResult = async () => {
      try {
        console.log('🚀 [PaymentResult] Starting payment result processing...');
        
        // قراءة معاملات الـ URL
        console.log('🔍 [PaymentResult] Reading URL parameters...');
        console.log('🔍 [PaymentResult] Full URL:', window.location.href);
        console.log('🔍 [PaymentResult] Search string:', window.location.search);
        console.log('🔍 [PaymentResult] SearchParams object:', searchParams);
        console.log('🔍 [PaymentResult] All search params:', Object.fromEntries(searchParams.entries()));
        
        const success = searchParams.get('success');
        const orderId = searchParams.get('order');
        const transactionId = searchParams.get('id');
        
        console.log('🔍 [PaymentResult] URL Parameters:', { success, orderId, transactionId });
        console.log('🔍 [PaymentResult] Success parameter type:', typeof success);
        console.log('🔍 [PaymentResult] Success parameter value:', success);
        console.log('🔍 [PaymentResult] Success === "true":', success === 'true');
        console.log('🔍 [PaymentResult] Success === "false":', success === 'false');
        console.log('💳 [PaymentResult] Payment result params:', { success, orderId, transactionId });
        console.log('💳 [PaymentResult] Success value type:', typeof success);
        console.log('💳 [PaymentResult] Success === "true":', success === 'true');

        // التحقق من وجود بيانات الطلب المحفوظة
        const pendingOrderData = localStorage.getItem('pendingOrderData');
        console.log('💾 [PaymentResult] Pending order data exists:', !!pendingOrderData);
        
        let parsedData = null;
        if (pendingOrderData) {
          try {
            parsedData = JSON.parse(pendingOrderData);
            console.log('✅ [PaymentResult] Successfully parsed pending order data');
            console.log('📋 [PaymentResult] Parsed data keys:', Object.keys(parsedData));
            setOrderData(parsedData);
            
            // إزالة البيانات المؤقتة
            localStorage.removeItem('pendingOrderData');
            console.log('🗑️ [PaymentResult] Removed pending order data from localStorage');
          } catch (parseError) {
            console.error('❌ [PaymentResult] Error parsing pending order data:', parseError);
          }
        } else {
          console.warn('⚠️ [PaymentResult] No pending order data found in localStorage');
        }

        console.log('🔍 [PaymentResult] Checking success condition...');
        if (success === 'true') {
          console.log('✅ [PaymentResult] Payment was successful, processing...');
          setPaymentStatus('success');
          toast.success('تم الدفع بنجاح! شكراً لك.');
          
          // حفظ الطلب في قاعدة البيانات عند نجاح الدفع
          if (parsedData) {
            console.log('💾 [PaymentResult] Found parsed data, proceeding to save order...');
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
              console.log('💾 [PaymentResult] Attempting to save order to database...');
              console.log('💾 [PaymentResult] Order data to save:', finalOrderData);
              console.log('💾 [PaymentResult] API object:', api);
              console.log('💾 [PaymentResult] API orders method:', api.orders);
              console.log('💾 [PaymentResult] API orders create method:', api.orders.create);
              
              let result = null;
              try {
                result = await api.orders.create(finalOrderData);
                console.log('✅ [PaymentResult] Order saved successfully:', result);
                console.log('✅ [PaymentResult] Saved order ID:', result?.id || result?._id);
              } catch (saveError) {
                console.error('❌ [PaymentResult] Error saving order to database:', saveError);
                console.error('❌ [PaymentResult] Save error details:', {
                  message: saveError.message,
                  status: saveError.status,
                  response: saveError.response
                });
                // لا نوقف العملية حتى لو فشل الحفظ
                toast.error('تم الدفع بنجاح ولكن حدث خطأ في حفظ الطلب');
              }
              
              // حفظ بيانات الطلب النهائية في localStorage
              const finalOrderForDisplay = {
                ...parsedData,
                orderId: result?.id || `MW${Date.now().toString().slice(-6)}`,
                orderNumber: result?.orderNumber || result?.id || `MW${Date.now().toString().slice(-6)}`,
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
          console.log('🧹 [PaymentResult] Clearing cart data...');
          localStorage.removeItem('cartItems');
          localStorage.removeItem('cart');
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          console.log('✅ [PaymentResult] Cart data cleared successfully');
          
          // التوجيه التلقائي لصفحة الشكر بعد 5 ثوانٍ مع عداد تنازلي
          console.log('⏰ [PaymentResult] Setting up redirect timer (5 seconds)...');
          console.log('🔍 [PaymentResult] Navigate function type:', typeof navigate);
          console.log('🔍 [PaymentResult] Navigate function available:', !!navigate);
          
          // عداد تنازلي للتوجيه
          let countdown = 5;
          const countdownInterval = setInterval(() => {
            countdown--;
            console.log(`⏰ [PaymentResult] Redirect countdown: ${countdown} seconds`);
            
            // تحديث النص في الصفحة إذا كان هناك عنصر للعداد
            const countdownElement = document.getElementById('redirect-countdown');
            if (countdownElement) {
              countdownElement.textContent = countdown.toString();
            }
            
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              performRedirect();
            }
          }, 1000);
          
          // دالة التوجيه مع آليات متعددة
          const performRedirect = () => {
            console.log('🔄 [PaymentResult] Starting redirect process...');
            console.log('🔄 [PaymentResult] Current location before redirect:', window.location.href);
            
            try {
              // المحاولة الأولى: React Router
              console.log('🔄 [PaymentResult] Attempting React Router navigation...');
              navigate('/thank-you', { replace: true });
              console.log('✅ [PaymentResult] React Router navigate called successfully');
              
              // التحقق من نجاح التوجيه بعد ثانية واحدة
              setTimeout(() => {
                if (window.location.pathname.includes('payment-result')) {
                  console.log('🔄 [PaymentResult] React Router failed, using window.location.replace...');
                  window.location.replace('/thank-you');
                }
              }, 1000);
              
              // Fallback نهائي بعد 3 ثوانٍ
              setTimeout(() => {
                if (window.location.pathname.includes('payment-result')) {
                  console.log('🔄 [PaymentResult] Final fallback: forcing redirect...');
                  window.location.href = '/thank-you';
                }
              }, 3000);
              
            } catch (navError) {
              console.error('❌ [PaymentResult] Navigation error:', navError);
              console.log('🔄 [PaymentResult] Using window.location.replace as immediate fallback...');
              window.location.replace('/thank-you');
            }
          };
          
          console.log('⏰ [PaymentResult] Redirect system initialized successfully');
          
        } else if (success === 'false') {
          console.log('❌ [PaymentResult] Payment failed, processing failure...');
          setPaymentStatus('failed');
          toast.error('فشل في عملية الدفع. يرجى المحاولة مرة أخرى.');
          
          // التوجيه التلقائي لصفحة الـ checkout بعد 5 ثوانٍ
          console.log('⏰ [PaymentResult] Setting up redirect timer for failed payment (5 seconds)...');
          setTimeout(() => {
            console.log('🔄 [PaymentResult] Redirecting to checkout page after payment failure...');
            navigate('/checkout', { replace: true });
          }, 5000);
          
        } else {
          console.log('⚠️ [PaymentResult] Payment status unclear, setting to pending');
          console.log('⚠️ [PaymentResult] Success parameter value:', success);
          setPaymentStatus('pending');
        }
        
        console.log('✅ [PaymentResult] Payment result processing completed successfully');
      } catch (error) {
        console.error('❌ [PaymentResult] Error processing payment result:', error);
        console.error('❌ [PaymentResult] Error stack:', error.stack);
        setPaymentStatus('failed');
        toast.error('حدث خطأ أثناء معالجة نتيجة الدفع.');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    console.log('🔄 [PaymentResult] Continue button clicked');
    console.log('🔍 [PaymentResult] Current payment status:', paymentStatus);
    
    if (paymentStatus === 'success') {
      console.log('🔄 [PaymentResult] Navigating to thank-you page...');
      // استخدام آليات متعددة للتوجيه
      try {
        navigate('/thank-you', { replace: true });
        // Fallback
        setTimeout(() => {
          if (window.location.pathname.includes('payment-result')) {
            window.location.replace('/thank-you');
          }
        }, 500);
      } catch (error) {
        console.error('❌ [PaymentResult] Navigation error:', error);
        window.location.replace('/thank-you');
      }
    } else {
      console.log('🔄 [PaymentResult] Navigating to checkout page...');
      navigate('/checkout');
    }
  };

  const handleGoHome = () => {
    console.log('🔄 [PaymentResult] Home button clicked');
    try {
      navigate('/', { replace: true });
      setTimeout(() => {
        if (!window.location.pathname === '/') {
          window.location.replace('/');
        }
      }, 500);
    } catch (error) {
      console.error('❌ [PaymentResult] Home navigation error:', error);
      window.location.replace('/');
    }
  };

  const handleImmediateRedirect = () => {
    console.log('🔄 [PaymentResult] Immediate redirect button clicked');
    if (paymentStatus === 'success') {
      try {
        navigate('/thank-you', { replace: true });
        setTimeout(() => {
          if (window.location.pathname.includes('payment-result')) {
            window.location.replace('/thank-you');
          }
        }, 200);
      } catch (error) {
        console.error('❌ [PaymentResult] Immediate redirect error:', error);
        window.location.replace('/thank-you');
      }
    }
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
              
              {paymentStatus === 'success' && (
                <div className="mt-4 bg-white/20 rounded-lg p-3">
                  <p className="text-white/90 text-sm mb-2">
                    سيتم توجيهك تلقائياً إلى صفحة تفاصيل الطلب خلال:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-white" id="redirect-countdown">5</span>
                    <span className="text-white/90">ثانية</span>
                  </div>
                </div>
              )}
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
              <div className="space-y-4 mt-8">
                {paymentStatus === 'success' && (
                  <button
                    onClick={handleImmediateRedirect}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Package className="w-5 h-5" />
                    انتقل الآن إلى تفاصيل الطلب
                  </button>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
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
    </div>
  );
};

export default PaymentResult;