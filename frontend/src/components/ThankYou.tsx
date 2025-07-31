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
  estimatedDelivery?: string;
}

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Show confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Get order data from navigation state
    if (location.state?.order) {
      setOrderData(location.state.order);
    } else {
      // If no order data, redirect to home after 3 seconds
      setTimeout(() => navigate('/'), 3000);
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
                </div>
                <div className="text-left">
                  <div className="bg-white/20 rounded-2xl px-6 py-4">
                    <p className="text-sm text-gray-300 mb-1">تاريخ الطلب</p>
                    <p className="text-lg font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                            </div>
                          </div>
                          
            {/* Order Items */}
            {orderData?.items && orderData.items.length > 0 && (
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">المنتجات المطلوبة</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      {item.image && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        {item.size && (
                          <p className="text-sm text-gray-600">الحجم: {item.size}</p>
                        )}
                        <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ر.س</p>
                        </div>
                      </div>
                    ))}
                </div>
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
                    {orderData?.userData && (
                      <>
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{orderData.userData.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{orderData.userData.phone}</span>
                        </div>
                      <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{orderData.userData.city}</span>
                      </div>
                      </>
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
                        {orderData?.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between items-center">
                      <span>المبلغ الإجمالي:</span>
                      <span className="font-bold text-lg text-green-600">
                        {orderData?.total?.toFixed(2) || '0.00'} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">الحالة</h3>
                      <p className="text-purple-600 font-medium">قيد المعالجة</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>سنقوم بإرسال رسالة تأكيد قريباً مع تفاصيل الشحن والتتبع.</p>
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