import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Package, Grid, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  mainImage: string;
  detailedImages?: string[];
  rating?: number;
  brand?: string;
}

// استخدام localStorage للسرعة القصوى
const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة
const CACHE_KEY = 'ultra_fast_services';

// دوال localStorage فائقة السرعة
const fastCache = {
  set: (data: Service[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) { 
      console.warn('Cache set failed:', e);
      try {
        localStorage.clear();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (e2) {
        console.warn('Cache set failed after clear:', e2);
      }
    }
  },
  get: (): Service[] | null => {
    try {
      const item = localStorage.getItem(CACHE_KEY);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsed.data;
    } catch (e) { return null; }
  }
};

const AllServicesSection: React.FC = () => {
  // تحميل فوري من localStorage
  const [services, setServices] = useState<Service[]>(() => {
    const cachedServices = fastCache.get();
    return cachedServices || [];
  });
  const [error, setError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // إذا كانت هناك خدمات محملة، تحديث في الخلفية
    if (services.length > 0) {
      refreshServicesInBackground();
    } else {
      // إذا لم توجد خدمات، جلب البيانات
      fetchInitialServices();
    }
  }, []);

  const fetchInitialServices = async () => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;
    
    try {
      console.log('🔄 جلب الخدمات الأولية');
      const response = await apiCall(API_ENDPOINTS.SERVICES);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ تم جلب الخدمات بنجاح:', response.data.length);
        setServices(response.data);
        fastCache.set(response.data);
        setError(null);
      }
    } catch (error) {
      console.warn('فشل في جلب الخدمات الأولية:', error);
      setError('فشل في تحميل الخدمات');
    }
  };

  const refreshServicesInBackground = async () => {
    try {
      console.log('🔄 تحديث الخدمات في الخلفية');
      const response = await apiCall(API_ENDPOINTS.SERVICES);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ تم تحديث الخدمات في localStorage');
        setServices(response.data);
        fastCache.set(response.data);
      }
    } catch (error) {
      console.warn('فشل في تحديث الخدمات في الخلفية:', error);
    }
  };

  const retryFetch = async () => {
    fetchAttempted.current = false;
    await fetchInitialServices();
  };
  if (error) {
    return (
      <section className="py-24 bg-gradient-to-br from-[#FAF8F5] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={retryFetch}
              className="mt-4 px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-[#FAF8F5] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-600">لم يتم العثور على أي خدمات متاحة حالياً</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-[#FAF8F5] to-white" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-[#8B4513]/5 to-[#A0522D]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-[#D2691E]/5 to-[#CD853F]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-[#8B4513]/20">
            <Sparkles className="w-4 h-4 text-[#8B4513]" />
            <span className="text-[#8B4513] font-medium text-sm">جميع خدماتنا</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              استكشف
              <span className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] bg-clip-text text-transparent mx-3">
                خدماتنا
              </span>
              المتميزة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              مجموعة شاملة من الخدمات المصممة خصيصاً لتلبية احتياجاتك وتحقيق أهدافك
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group">
              <ProductCard
                product={{
                  id: service.id.toString(),
                  name: service.name,
                  price: service.price,
                  originalPrice: service.originalPrice,
                  image: service.mainImage,
                  category: '',
                  rating: service.rating || 5,
                  brand: service.brand,
                  inStock: true
                }}
                onAddToWishlist={() => toast.info('ميزة المفضلة غير متوفرة حالياً')}
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        {services.length > 12 && (
          <div className="text-center mt-16">
            <Link
              to="/services"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Eye className="w-5 h-5" />
              عرض جميع الخدمات
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllServicesSection;