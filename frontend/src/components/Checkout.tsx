import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersAPI } from '../utils/api';
import api from '../utils/api';
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Gift, 
  Truck, 
  Clock, 
  Star,
  Plus,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  Package,
  Shield,
  Heart,
  Zap,
  Phone,
  Mail,
  Home,
  Calendar,
  Award,
  Percent,
  Calculator,
  Edit3,
  Trash2
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  category?: string;
  originalPrice?: number;
  discount?: number;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface ShippingZone {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  regions: string[];
  icon?: string;
  color?: string;
  freeShippingThreshold?: number;
}

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'freeShipping';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  description: string;
  validUntil?: string;
  category?: string;
  isActive: boolean;
}

const Checkout: React.FC = () => {
  console.log('🚀 [Checkout] Component starting to load...');
  
  // All state declarations first
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  console.log('🔧 [Checkout] Initial state set up complete');
  
  // All state hooks
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false); // تم تغييرها من true إلى false
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZone | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');

  // Static data
  const shippingZones: ShippingZone[] = [
    {
      id: 'riyadh-express',
      name: 'الرياض - توصيل سريع',
      price: 25,
      estimatedDays: 'خلال 24 ساعة',
      regions: ['الرياض', 'riyadh'],
      icon: '🚀',
      color: 'from-blue-500 to-purple-500',
      freeShippingThreshold: 300
    },
    {
      id: 'riyadh-standard',
      name: 'الرياض - توصيل عادي',
      price: 15,
      estimatedDays: '2-3 أيام',
      regions: ['الرياض', 'riyadh'],
      icon: '🚚',
      color: 'from-green-500 to-blue-500',
      freeShippingThreshold: 200
    },
    {
      id: 'jeddah',
      name: 'جدة ومكة المكرمة',
      price: 30,
      estimatedDays: '3-4 أيام',
      regions: ['جدة', 'مكة', 'jeddah', 'mecca'],
      icon: '🕌',
      color: 'from-purple-500 to-pink-500',
      freeShippingThreshold: 350
    },
    {
      id: 'dammam',
      name: 'الدمام والخبر',
      price: 35,
      estimatedDays: '4-5 أيام',
      regions: ['الدمام', 'الخبر', 'dammam', 'khobar'],
      icon: '🏢',
      color: 'from-orange-500 to-red-500',
      freeShippingThreshold: 400
    },
    {
      id: 'other',
      name: 'باقي المناطق',
      price: 45,
      estimatedDays: '5-7 أيام',
      regions: ['other'],
      icon: '📦',
      color: 'from-gray-500 to-gray-600',
      freeShippingThreshold: 500
    }
  ];

  const availableCoupons: Coupon[] = [
    {
      code: 'WELCOME15',
      type: 'percentage',
      value: 15,
      minAmount: 100,
      maxDiscount: 50,
      description: 'خصم 15% للعملاء الجدد (حتى 50 ريال)',
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      code: 'SAVE100',
      type: 'fixed',
      value: 100,
      minAmount: 500,
      description: 'خصم 100 ريال عند الشراء بـ 500 ريال أو أكثر',
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      code: 'FREESHIP',
      type: 'freeShipping',
      value: 0,
      minAmount: 200,
      description: 'شحن مجاني للطلبات أكثر من 200 ريال',
      validUntil: '2024-12-31',
      isActive: true
    }
  ];

  // Load user data for auto-fill
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          console.log('👤 [Checkout] Loading user data for auto-fill:', user);
          
          // Auto-fill user data in checkout form
          setUserData({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          });
          
          console.log('✅ [Checkout] User data auto-filled successfully');
        } catch (error) {
          console.error('❌ [Checkout] Error parsing user data:', error);
        }
      }
    };
    
    loadUserData();
  }, []);

  // Load cart data
  useEffect(() => {
    const loadCartData = () => {
      console.log('🔄 [Checkout] Loading cart data...');
      setIsLoadingCart(true);
      
      try {
        // Try 'cartItems' first (new key), then 'cart' (old key) as fallback
        let savedCart = localStorage.getItem('cartItems');
        let keyUsed = 'cartItems';
        
        if (!savedCart || savedCart === 'null' || savedCart === 'undefined') {
          savedCart = localStorage.getItem('cart');
          keyUsed = 'cart';
          console.log('💾 [Checkout] Fallback to old cart key');
        }
        
        console.log('💾 [Checkout] Raw cart data from', keyUsed, ':', savedCart);
        
        if (savedCart && savedCart !== 'null' && savedCart !== 'undefined') {
          const parsedCart = JSON.parse(savedCart);
          console.log('📦 [Checkout] Parsed cart:', parsedCart);
          
          // Handle different cart data formats
          let cartData = [];
          
          if (Array.isArray(parsedCart)) {
            cartData = parsedCart;
          } else if (parsedCart.items && Array.isArray(parsedCart.items)) {
            cartData = parsedCart.items;
          } else if (typeof parsedCart === 'object') {
            cartData = Object.values(parsedCart).filter((item: any) => 
              item && typeof item === 'object' && item.id
            );
          }
          
          // Convert cart data to standard format
          const standardizedCart = cartData.map((item: any) => {
            // Handle different data structures
            const product = item.product || item;
            const name = product.name || product.title || item.name || item.title || 'منتج';
            const price = parseFloat(product.price || item.price || 0);
            const image = product.image || product.images?.[0] || item.image || item.images?.[0] || product.mainImage;
            
            return {
              id: String(product.id || item.id || item.productId || Math.random()),
              name,
              price,
              quantity: parseInt(item.quantity || 1),
              image,
              size: item.selectedOptions?.size || item.size,
              category: product.category || item.category,
              originalPrice: product.originalPrice || item.originalPrice,
              discount: product.discount || item.discount
            };
          }).filter((item: CartItem) => item.id && item.name && item.price > 0);
          
          console.log('✅ [Checkout] Standardized cart:', standardizedCart);
          setCartItems(standardizedCart);
          
          if (standardizedCart.length === 0) {
            console.log('⚠️ [Checkout] Cart is empty after processing');
          }
        } else {
          console.log('❌ [Checkout] No cart data found in localStorage');
          setCartItems([]);
        }
      } catch (error) {
        console.error('💥 [Checkout] Error loading cart:', error);
        setCartItems([]);
      } finally {
        setIsLoadingCart(false);
      }
    };

    loadCartData();

    // Listen for cart updates
    const handleCartUpdate = (event: any) => {
      console.log('🔄 [Checkout] Cart update event received:', event);
      loadCartData();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cartItems' || event.key === 'cart') {
        console.log('💾 [Checkout] localStorage cart changed for key:', event.key);
        loadCartData();
      }
    };

    // Add event listeners
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 0;
  const couponDiscount = appliedCoupon ? (
    appliedCoupon.type === 'percentage' 
      ? Math.min(subtotal * (appliedCoupon.value / 100), appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.value
  ) : 0;
  const freeShipping = true;
  const finalShippingCost = 0;
  const total = subtotal - couponDiscount + finalShippingCost;

  const updateQuantity = (itemId: string, size: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId && item.size === size) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      return updatedItems;
    });
  };

  const removeItem = (itemId: string, size: string | undefined) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => 
        !(item.id === itemId && item.size === size)
      );
      
      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      
      return updatedItems;
    });
    
    toast.success('تم حذف المنتج من السلة');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 2) {
      // اسم العميل
      if (!userData.name.trim()) {
        newErrors.name = 'الاسم مطلوب';
      } else if (userData.name.trim().length < 2) {
        newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين';
      } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(userData.name.trim())) {
        newErrors.name = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      // رقم الهاتف
      if (!userData.phone.trim()) {
        newErrors.phone = 'رقم الهاتف مطلوب';
      } else if (!/^(05|5)[0-9]{8}$/.test(userData.phone.replace(/\s|-/g, ''))) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
      }
      
      // البريد الإلكتروني (مطلوب للمنتجات الرقمية)
      if (!userData.email.trim()) {
        newErrors.email = 'البريد الإلكتروني مطلوب';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
        newErrors.email = 'البريد الإلكتروني غير صحيح';
      }
    }
    
    if (step === 4) {
      if (!agreeToTerms) newErrors.terms = 'يجب الموافقة على الشروط والأحكام';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    
    try {
      const coupon = availableCoupons.find(c => 
        c.code === couponCode && c.isActive
      );
      
      if (!coupon) {
        toast.error('كود الخصم غير صحيح أو منتهي الصلاحية');
        return;
      }
      
      if (subtotal < coupon.minAmount) {
        toast.error(`الحد الأدنى للطلب ${coupon.minAmount} ريال`);
        return;
      }
      
      setAppliedCoupon(coupon);
      toast.success('تم تطبيق كود الخصم بنجاح!');
      setCouponCode('');
    } catch (error) {
      toast.error('حدث خطأ في تطبيق كود الخصم');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('تم إلغاء كود الخصم');
  };

  const handleSubmit = async () => {
    console.log('🚀 [Checkout] handleSubmit started');
    console.log('📋 [Checkout] Current step:', currentStep);
    console.log('✅ [Checkout] Validation check for step 4...');
    
    if (!validateStep(4)) {
      console.log('❌ [Checkout] Validation failed for step 4');
      return;
    }
    
    console.log('✅ [Checkout] Validation passed, proceeding with order submission');
    setLoading(true);
    
    try {
      console.log('📦 [Checkout] Preparing order data...');
      // تحضير بيانات الطلب بالتنسيق المطلوب للـ API
      const orderData = {
        customerName: userData.name,
        customerEmail: userData.email,
        customerPhone: userData.phone,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          selectedOptions: {
            size: item.size
          },
          productImage: item.image
        })),
        subtotal,
        shippingCost: finalShippingCost,
        couponDiscount,
        total,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: orderNotes,
        isGift,
        giftMessage,
        preferredDeliveryTime,
        shippingZone: selectedShippingZone,
        appliedCoupon
      };

      console.log('📦 [Checkout] Order data prepared:', JSON.stringify(orderData, null, 2));
      console.log('📦 [Checkout] Submitting order to API...');

      // إرسال الطلب إلى API
      console.log('📡 [Checkout] Calling ordersAPI.create...');
      const result = await ordersAPI.create(orderData);
      
      console.log('✅ [Checkout] Order created successfully:', JSON.stringify(result, null, 2));
      console.log('🆔 [Checkout] Order ID:', result.id);

      // إذا كان الدفع إلكتروني، إنشاء رابط الدفع
      console.log('💳 [Checkout] Checking payment method:', selectedPaymentMethod);
      if (selectedPaymentMethod === 'card') {
        try {
          console.log('💳 [Checkout] Payment method is card, creating payment link...');
          
          const paymentData = {
            orderId: result.id,
            amount: total,
            customerData: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone
            },
            items: cartItems.map(item => ({
              name: item.name,
              amount_cents: Math.round(item.price * item.quantity * 100),
              description: `${item.name} - الكمية: ${item.quantity}`,
              quantity: item.quantity
            }))
          };
          
          console.log('💳 [Checkout] Payment data prepared:', JSON.stringify(paymentData, null, 2));

          // إنشاء رابط الدفع الإلكتروني
          console.log('🔍 [Checkout] Checking if payment API is available...');
          console.log('🔍 [Checkout] API object:', api);
          console.log('🔍 [Checkout] Payment in API:', 'payment' in api);
          
          if ('payment' in api && typeof (api as any).payment?.createPaymentLink === 'function') {
            console.log('✅ [Checkout] Payment API is available, calling createPaymentLink...');
            const paymentResult = await (api as any).payment.createPaymentLink(paymentData);
            
            console.log('📡 [Checkout] Payment API response:', JSON.stringify(paymentResult, null, 2));
            
            if (paymentResult.success && paymentResult.paymentUrl) {
              console.log('✅ [Checkout] Payment link created successfully:', paymentResult.paymentUrl);
              // حفظ بيانات الطلب المؤقتة في localStorage
              console.log('💾 [Checkout] Saving temporary order data to localStorage...');
              const tempOrderData = {
                orderId: result.id,
                orderNumber: result.orderNumber || result.id,
                items: cartItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                  size: item.size
                })),
                userData: userData,
                paymentMethod: selectedPaymentMethod,
                subtotal: subtotal,
                shipping: finalShippingCost,
                discount: couponDiscount,
                total: total,
                estimatedDelivery: selectedShippingZone?.estimatedDays || 'خلال 2-3 أيام عمل'
              };
              
              console.log('💾 [Checkout] Temp order data:', JSON.stringify(tempOrderData, null, 2));
              localStorage.setItem('pendingOrderData', JSON.stringify(tempOrderData));
              
              // توجيه المستخدم لصفحة الدفع
              console.log('🌐 [Checkout] Redirecting to payment URL:', paymentResult.paymentUrl);
              window.location.href = paymentResult.paymentUrl;
              return;
            } else {
              console.error('❌ [Checkout] Failed to create payment link:', paymentResult);
              console.error('❌ [Checkout] Payment result success:', paymentResult.success);
              console.error('❌ [Checkout] Payment result paymentUrl:', paymentResult.paymentUrl);
              toast.error('فشل في إنشاء رابط الدفع. يرجى المحاولة مرة أخرى.');
              return;
            }
          } else {
              console.error('❌ [Checkout] Payment API not available');
              console.error('❌ [Checkout] API structure:', Object.keys(api));
              toast.error('خدمة الدفع الإلكتروني غير متاحة حالياً. يرجى المحاولة مرة أخرى.');
              return;
            }
        } catch (paymentError) {
          console.error('❌ [Checkout] Payment creation error:', paymentError);
          console.error('❌ [Checkout] Payment error details:', JSON.stringify(paymentError, null, 2));
          toast.error('فشل في إنشاء رابط الدفع. يرجى المحاولة مرة أخرى.');
          return;
        }
      }

      // هذا الجزء لن يتم تنفيذه إلا في حالة عدم وجود دفع إلكتروني
      // (وهو غير مطلوب حالياً لأننا نستخدم الدفع الإلكتروني فقط)
      console.log('⚠️ [Checkout] No electronic payment - this should not happen');
      console.log('⚠️ [Checkout] Selected payment method:', selectedPaymentMethod);
    } catch (error) {
      console.error('💥 [Checkout] Order submission error:', error);
      console.error('💥 [Checkout] Error details:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        console.error('💥 [Checkout] Error message:', error.message);
        console.error('💥 [Checkout] Error stack:', error.stack);
      }
      toast.error('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      console.log('🏁 [Checkout] handleSubmit finished, setting loading to false');
      setLoading(false);
    }
  };

  // Handle empty cart case
  if (!isLoadingCart && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" dir="rtl">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-12">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-6">
                السلة فارغة
              </h1>
              <p className="text-gray-600 text-xl mb-12 leading-relaxed">
                لا توجد منتجات في سلة التسوق حالياً.<br />
                يرجى إضافة بعض المنتجات أولاً لإتمام الطلب.
              </p>
              <div className="space-y-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-xl shadow-2xl transform hover:scale-105 hover:shadow-3xl"
                >
                  <ArrowRight size={28} />
                  ابدأ التسوق الآن
                </Link>
                <div>
                  <Link
                    to="/cart"
                    className="text-gray-500 hover:text-gray-700 transition-colors underline text-lg"
                  >
                    العودة إلى السلة
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl font-medium">جاري تحميل بيانات السلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-30" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للتسوق
          </button>
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <ShoppingCart className="w-6 h-6" />
            إتمام الطلب
            </div>
          <div className="w-6 h-6"></div>
          </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-12">
            
            {/* Order Summary Sidebar – يظهر يسار الشاشة الكبيرة */}
            <div className="order-2 xl:order-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-black p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">ملخص الطلب</h3>
                    <p className="text-gray-300">تفاصيل طلبك النهائية</p>
                  </div>

                  <div className="p-8">
                    {/* Price Breakdown */}
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">المجموع الفرعي</span>
                        <span className="font-bold text-gray-900">{(subtotal || 0).toFixed(2)} ر.س</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-base text-green-600">
                          <span>الخصم</span>
                          <span className="font-bold">-{(couponDiscount || 0).toFixed(2)} ر.س</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">الشحن</span>
                        <span className={freeShipping ? 'font-bold text-green-600' : 'font-bold text-gray-900'}>
                          {freeShipping ? 'مجاني' : `${(finalShippingCost || 0).toFixed(2)} ر.س`}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                          <span className="text-2xl font-bold text-gray-900">{(total || 0).toFixed(2)} ر.س</span>
                        </div>
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Gift className="text-green-600" size={20} />
                        كود الخصم
                      </h4>
                      
                      {!appliedCoupon ? (
                        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="أدخل كود الخصم هنا"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-center font-mono text-lg tracking-wider"
                              disabled={couponLoading}
                            />
                            <button
                              onClick={applyCoupon}
                              disabled={!couponCode.trim() || couponLoading}
                              className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 px-6 rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 disabled:opacity-50 font-bold text-lg shadow-lg"
                            >
                              {couponLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  جاري التحقق...
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <Gift size={20} />
                                  تطبيق كود الخصم
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <Gift className="text-white" size={24} />
                              </div>
                              <div>
                                <p className="font-bold text-green-800 text-lg">{appliedCoupon.code}</p>
                                <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                                <p className="text-lg font-bold text-green-700 mt-1">
                                  وفرت {(couponDiscount || 0).toFixed(2)} ر.س
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={removeCoupon}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 border-2 border-red-200 hover:border-red-300"
                              title="إلغاء كود الخصم"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* زر الإتمام */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
                      {currentStep > 1 ? (
                        <button
                          onClick={prevStep}
                          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <ArrowRight className="w-5 h-5" />
                          السابق
                        </button>
                      ) : <span />}

                      {currentStep < 4 ? (
                        <button
                          onClick={nextStep}
                          className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-bold"
                        >
                          التالي
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={loading || !agreeToTerms}
                          className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-bold disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              تأكيد الطلب
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="order-1 xl:order-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                
                {/* Step Indicator */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    {[
                      { step: 1, title: 'مراجعة الطلب', icon: ShoppingCart },
                      { step: 2, title: 'بيانات التوصيل', icon: User },
                      { step: 3, title: 'طريقة الدفع', icon: CreditCard },
                      { step: 4, title: 'تأكيد الطلب', icon: CheckCircle }
                    ].map(({ step, title, icon: Icon }, index) => (
                      <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            currentStep === step 
                              ? 'bg-black border-black text-white shadow-lg scale-110' 
                              : currentStep > step 
                                ? 'bg-green-500 border-green-500 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            <Icon size={18} className="lg:w-5 lg:h-5" />
                          </div>
                          <span className={`text-xs lg:text-sm mt-1 lg:mt-2 font-medium transition-colors ${
                            currentStep === step ? 'text-black font-bold' : 'text-gray-500'
                          }`}>
                            {title}
                          </span>
                        </div>
                        {index < 3 && (
                          <div className={`w-12 lg:w-16 h-0.5 mx-2 lg:mx-4 transition-colors ${
                            currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Step 1: Order Review */}
                {currentStep === 1 && (
                  <div className="p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-white to-gray-50 min-h-[500px]">
                    <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                        <ShoppingCart className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">مراجعة طلبك</h2>
                        <p className="text-gray-600 text-base lg:text-lg xl:text-xl">{cartItems.length} منتج في السلة</p>
                    </div>
                  </div>

                  {/* Cart Items */}
                    <div className="space-y-6 lg:space-y-8">
                    {cartItems.map((item, index) => (
                      <div 
                        key={`${item.id}-${item.size || 'default'}`}
                          className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                          <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                          {/* Product Image */}
                          {item.image && (
                            <div className="relative">
                                <div className="w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-xl lg:rounded-2xl overflow-hidden border-2 border-gray-100">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                    className="w-full h-full object-cover" 
                                />
                              </div>
                                <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-sm lg:text-base font-bold shadow-lg">
                                {item.quantity}
                              </div>
                            </div>
                          )}
                          
                          {/* Product Details */}
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl mb-2 lg:mb-3">
                              {item.name}
                            </h4>
                            {item.size && (
                                <div className="inline-flex items-center gap-2 lg:gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl text-sm lg:text-base text-gray-700 mb-3 lg:mb-4 border border-blue-100">
                                  <Package size={16} className="lg:w-5 lg:h-5 text-blue-600" />
                                  الحجم: <span className="font-bold">{item.size}</span>
                              </div>
                            )}
                            
                            {/* Quantity Controls */}
                              <div className="flex items-center gap-3 lg:gap-4">
                                <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 rounded-xl lg:rounded-2xl p-2 border border-gray-200">
                                <button
                                  onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 shadow-md"
                                  disabled={item.quantity <= 1}
                                >
                                    <Minus size={16} className="lg:w-5 lg:h-5" />
                                </button>
                                  <span className="w-12 lg:w-16 text-center font-bold text-base lg:text-lg text-gray-900 bg-white px-3 py-1 rounded-lg border">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
                                >
                                    <Plus size={16} className="lg:w-5 lg:h-5" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => removeItem(item.id, item.size)}
                                  className="p-2 lg:p-3 text-red-500 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all duration-300 border border-red-200 hover:border-red-300"
                                title="حذف المنتج"
                              >
                                  <Trash2 size={18} className="lg:w-5 lg:h-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                              <div className="space-y-1 lg:space-y-2">
                              {item.originalPrice && item.originalPrice > item.price && (
                                  <p className="text-sm lg:text-base text-gray-400 line-through">
                                    <span className="text-gray-500 line-through">{((item.originalPrice || 0) * (item.quantity || 1)).toFixed(2)} ر.س</span>
                                </p>
                              )}
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                                  <span className="font-bold text-gray-900 text-lg">{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ر.س</span>
                              </p>
                                <p className="text-sm lg:text-base text-gray-500">
                                  {(item.price || 0).toFixed(2)} ر.س × {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Step 2: Customer Information */}
                {currentStep === 2 && (
                  <div className="p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-gray-50 to-white min-h-[500px]">
                    <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                        <User className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">بياناتك الشخصية</h2>
                        <p className="text-gray-600 text-base lg:text-lg xl:text-xl">أدخل بياناتك لإتمام الشراء</p>
                    </div>
                  </div>
                  
                    <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg">
                      <div className="max-w-2xl mx-auto">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="block text-sm lg:text-base font-bold text-gray-700">الاسم الكامل *</label>
                            <input
                              type="text"
                              value={userData.name}
                              onChange={(e) => setUserData({...userData, name: e.target.value})}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-black/20 focus:border-black transition-all ${
                                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="أدخل اسمك الكامل"
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                <X size={14} />
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm lg:text-base font-bold text-gray-700">رقم الهاتف *</label>
                            <input
                              type="tel"
                              value={userData.phone}
                              onChange={(e) => {
                                let phone = e.target.value.replace(/\D/g, '');
                                if (phone.length > 0 && !phone.startsWith('05')) {
                                  if (phone.startsWith('5')) {
                                    phone = '0' + phone;
                                  }
                                }
                                if (phone.length > 10) {
                                  phone = phone.slice(0, 10);
                                }
                                setUserData({...userData, phone});
                              }}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-black/20 focus:border-black transition-all ${
                                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="05xxxxxxxx"
                              maxLength={10}
                            />
                            {errors.phone && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                <X size={14} />
                                {errors.phone}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm lg:text-base font-bold text-gray-700">البريد الإلكتروني *</label>
                            <input
                              type="email"
                              value={userData.email}
                              onChange={(e) => setUserData({...userData, email: e.target.value})}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-black/20 focus:border-black transition-all ${
                                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="example@email.com"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                <X size={14} />
                                {errors.email}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              سيتم إرسال المنتج الرقمي على هذا البريد الإلكتروني
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                            </div>
                          )}

                {/* Step 3: Payment Method */}
                {currentStep === 3 && (
                  <div className="p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-white to-gray-50 min-h-[500px]">
                    <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                        <CreditCard className="text-white" size={24} />
                        </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">طريقة الدفع</h2>
                        <p className="text-gray-600 text-base lg:text-lg xl:text-xl">اختر الطريقة المناسبة لك</p>
                    </div>
                  </div>

                    <div className="flex justify-center">
                      {/* خيار الدفع الإلكتروني الوحيد */}
                      <div
                        className="p-8 lg:p-10 rounded-2xl lg:rounded-3xl border-3 border-black bg-gradient-to-br from-gray-50 to-white shadow-2xl max-w-md w-full"
                      >
                        <div className="flex items-center gap-4 lg:gap-6">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg">
                            <CreditCard className="text-white" size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl mb-2">دفع إلكتروني آمن</h4>
                            <p className="text-sm lg:text-base text-gray-600">فيزا أو ماستركارد عبر باي موب</p>
                          </div>
                        </div>
                        <div className="mt-4 lg:mt-6 flex justify-center">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full p-2 shadow-lg">
                            <CheckCircle size={20} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* معلومات إضافية عن طريقة الدفع */}
                    <div className="mt-8 lg:mt-10 p-6 lg:p-8 bg-white rounded-2xl lg:rounded-3xl border-2 border-gray-100 shadow-lg">
                      <div className="flex items-start gap-4 lg:gap-6">
                        <Shield className="text-green-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3 text-lg lg:text-xl">الدفع آمن ومضمون</h4>
                          <ul className="text-sm lg:text-base text-gray-600 space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              جميع المعاملات محمية ومشفرة
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              الدفع الإلكتروني آمن ومشفر عبر باي موب
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              يدعم جميع البطاقات الائتمانية (فيزا، ماستركارد)
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              معالجة فورية وآمنة للمدفوعات
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              ضمان استرداد الأموال في حالة عدم الرضا
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>
              </div>
                )}

                {/* Step 4: Order Confirmation */}
                {currentStep === 4 && (
                  <div className="p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-gray-50 to-white min-h-[500px]">
                    <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-black to-gray-800 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                        <CheckCircle className="text-white" size={24} />
                  </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">تأكيد الطلب</h2>
                        <p className="text-gray-600 text-base lg:text-lg xl:text-xl">راجع بياناتك قبل إتمام الطلب</p>
                        </div>
                      </div>

                    {/* Order Summary */}
                    <div className="space-y-6 lg:space-y-8">
                      {/* Customer Info */}
                      <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <User className="text-blue-600" size={24} />
                          <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">بيانات التوصيل</h3>
                            </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 text-sm lg:text-base">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="font-bold text-gray-700">الاسم:</span>
                            <span className="text-gray-900 font-medium">{userData.name}</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="font-bold text-gray-700">الهاتف:</span>
                            <span className="text-gray-900 font-medium" dir="ltr">{userData.phone}</span>
                        </div>
                          {userData.email && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <span className="font-bold text-gray-700">البريد الإلكتروني:</span>
                              <span className="text-gray-900 font-medium" dir="ltr">{userData.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Payment Method */}
                      <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <CreditCard className="text-green-600" size={24} />
                          <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">طريقة الدفع</h3>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500">
                            <CreditCard className="text-white" size={20} />
                          </div>
                          <span className="text-gray-900 font-bold text-base lg:text-lg">
                            دفع إلكتروني آمن عبر باي موب
                        </span>
                        </div>
                      </div>

                      {/* Order Items Summary */}
                      <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <Package className="text-purple-600" size={24} />
                          <h3 className="font-bold text-gray-900 text-lg lg:text-xl xl:text-2xl">المنتجات ({cartItems.length})</h3>
                        </div>
                        <div className="space-y-4">
                          {cartItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200" />
                              )}
                              <span className="flex-1 text-gray-900 font-medium">{item.name}</span>
                              <span className="text-gray-600 font-medium">×{item.quantity}</span>
                              <span className="font-bold text-gray-900 text-lg">{(item.price || 0).toFixed(2)} ر.س</span>
                      </div>
                          ))}
                          {cartItems.length > 3 && (
                            <div className="text-center text-gray-500 text-sm lg:text-base p-3 bg-gray-50 rounded-xl">
                              وعدد {cartItems.length - 3} منتجات أخرى...
                    </div>
                          )}
                        </div>
                        </div>

                      {/* Terms Agreement */}
                      <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg">
                        <div className="flex items-start gap-4 lg:gap-6">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-2 w-5 h-5 lg:w-6 lg:h-6 text-black border-gray-300 rounded focus:ring-black"
                          />
                          <label htmlFor="terms" className="text-gray-700 leading-relaxed text-base lg:text-lg">
                            أوافق على <Link to="/privacy-policy" className="text-black font-bold hover:underline">الشروط والأحكام</Link> و
                            <Link to="/return-policy" className="text-black font-bold hover:underline"> سياسة الإرجاع</Link>
                          </label>
                    </div>
                        {errors.terms && (
                          <p className="text-red-500 text-sm lg:text-base mt-3 flex items-center gap-2">
                            <X size={16} />
                            {errors.terms}
                          </p>
                        )}
                  </div>
                </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes animate-gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-x {
          animation: animate-gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
