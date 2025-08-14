import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Eye, Star, Heart, Share2, RefreshCw } from 'lucide-react';
import { servicesAPI } from '../utils/api';
import { buildImageUrl } from '../config/api';
import ContactFooter from '../components/ContactFooter';
import { cacheManager, CACHE_KEYS, CachedService } from '../utils/cacheManager';

// تعريف نوع الخدمة
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
  deliveryTime: string; // مدة التنفيذ
}

function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات الخدمة من الـ API مع استخدام Cache Manager
  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    setError(null);
    
    try {
      // محاولة تحميل الخدمة من Cache فوراً
      const cachedService = cacheManager.get<Service>(CACHE_KEYS.SERVICE_DETAIL(id!));
      
      if (cachedService) {
        console.log('✅ تحميل فوري للخدمة من Cache Manager');
        setService(cachedService);
        setLoading(false);
        
        // تحديث البيانات في الخلفية
        refreshServiceInBackground();
        return;
      }
      
      // محاولة البحث في قائمة الخدمات المخزنة
      const cachedServices = cacheManager.get<CachedService[]>(CACHE_KEYS.SERVICES);
      if (cachedServices) {
        const foundInList = cachedServices.find(s => s.id.toString() === id);
        if (foundInList) {
          console.log('✅ تحميل الخدمة من قائمة الخدمات المخزنة');
          setService(foundInList as Service);
          setLoading(false);
          
          // حفظ الخدمة منفردة في Cache
          cacheManager.set(CACHE_KEYS.SERVICE_DETAIL(id!), foundInList, 30 * 60 * 1000);
          
          // تحديث البيانات في الخلفية
          refreshServiceInBackground();
          return;
        }
      }
      
      // إذا لم توجد بيانات مخزنة، جلب البيانات الجديدة
      setLoading(true);
      await fetchFreshService();
      
    } catch (error) {
      console.error('خطأ في جلب بيانات الخدمة:', error);
      setError('فشل في تحميل الخدمة');
      setLoading(false);
    }
  };
  
  const fetchFreshService = async () => {
    console.log('🔄 جلب بيانات الخدمة الجديدة من الخادم');
    
    const foundService = await servicesAPI.getById(id!);
    if (foundService) {
      setService(foundService);
      
      // حفظ الخدمة في Cache Manager
      cacheManager.set(CACHE_KEYS.SERVICE_DETAIL(id!), foundService, 30 * 60 * 1000);
      
      console.log('✅ تم حفظ الخدمة في Cache Manager');
    } else {
      setError('الخدمة غير موجودة');
    }
    
    setLoading(false);
  };
  
  const refreshServiceInBackground = async () => {
    try {
      console.log('🔄 تحديث بيانات الخدمة في الخلفية');
      await fetchFreshService();
    } catch (err) {
      console.warn('فشل في تحديث بيانات الخدمة في الخلفية:', err);
    }
  };

  // التمرير إلى محتوى الخدمة عند التحميل
  useEffect(() => {
    if (service) {
      const serviceContent = document.getElementById('service-content');
      if (serviceContent) {
        serviceContent.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [service]);

  const getImageSrc = (image: string) => {
    return image.startsWith('data:image/') ? image : buildImageUrl(image);
  };

  // التحقق من الحالات المختلفة قبل عرض محتوى الخدمة
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">جاري التحميل...</h1>
          <p className="text-gray-600 mb-6">يتم تحميل بيانات الخدمة</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">الخدمة غير موجودة</h1>
        <Link to="/" className="text-green-600 hover:underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .text-shadow-green {
            text-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          }
          .hero-overlay {
            background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease forwards;
          }
          @keyframes modalZoom {
            0% {
              opacity: 0;
              transform: scale(0.85);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-modal {
            animation: modalZoom 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .hero-bg {
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
          }
          @media (max-width: 768px) {
            .hero-bg {
              background-attachment: scroll !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-50 rtl">
        {/* Hero Header */}
        <div className="w-full relative overflow-hidden" style={{ height: '70vh', maxHeight: '700px' }}>
          <div
            className="absolute inset-0 hero-bg"
            style={{ backgroundImage: service.mainImage ? `url(${getImageSrc(service.mainImage)})` : 'none' }}
          ></div>
          <div className="absolute inset-0 hero-overlay"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 text-shadow-green">
                {service.name}
              </h1>
              <div className="w-32 h-1 bg-white mx-auto rounded-full mb-6"></div>
              <p className="text-white text-xl md:text-2xl mt-4 max-w-3xl mx-auto font-light text-shadow-green">
                {service.detailsShortDescription}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f9fafb">
              <path d="M0,0 C240,95 480,95 720,95 C960,95 1200,95 1440,0 L1440,100 L0,100 Z"></path>
            </svg>
          </div>
        </div>

        {/* محتوى الخدمة */}
        <div id="service-content" className="container mx-auto px-4 lg:px-8 py-16 -mt-20">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-4 border-green-600">
            {/* نبذة عن الخدمة */}
            <div className="mb-12 bg-green-50 p-6 rounded-2xl border-r-4 border-green-500 animate-fade-in">
              <h2 className="text-2xl font-bold text-green-700 mb-4 text-right">نبذة عن الخدمة</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-right">
                {service.description}
              </p>
            </div>

            {/* مدة التنفيذ */}
            {service.deliveryTime && (
              <div className="mb-12 bg-blue-50 p-6 rounded-2xl border-r-4 border-blue-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold text-blue-700 mb-4 text-right flex items-center">
                  <Calendar className="w-6 h-6 ml-2" />
                  مدة التنفيذ
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed text-right">
                  {service.deliveryTime}
                </p>
              </div>
            )}

            {/* قسم "خدماتنا تشمل" */}
            {service.detailedImages && service.detailedImages.length > 0 && (
              <div className="mb-14 animate-fade-in" style={{ animationDelay: '0.2s' }} dir="rtl">
                <div className="flex items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">
                    <span className="border-b-3 border-green-500 pb-1">خدماتنا تشمل</span>
                  </h3>
                  <div className="flex-grow border-b border-gray-200 mr-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
                  {service.detailedImages.map((image, index) => (
                    <div
                      key={index}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto">
                        <img
                          src={getImageSrc(image)}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                          loading="lazy"
                          onClick={() => setOpenImage(image)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <h4 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300 text-right">
                          {service.name} - صورة {index + 1}
                        </h4>
                        <p className="text-gray-600 text-sm mt-2">
                          {service.imageDetails[index] || 'لا توجد تفاصيل لهذه الصورة'}
                        </p>
                        <div className="mt-2 w-16 h-0.5 bg-green-500 transform origin-right transition-all duration-300 group-hover:w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* قسم "مميزات الخدمة" */}
            {service.features && service.features.length > 0 && (
              <div className="mb-14 animate-fade-in" style={{ animationDelay: '0.4s' }} dir="rtl">
                <div className="flex items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">
                    <span className="border-b-3 border-green-500 pb-1">مميزات الخدمة</span>
                  </h3>
                  <div className="flex-grow border-b border-gray-200 mr-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 space-x-reverse bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-200"
                    >
                      <span className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <p className="text-gray-700 font-medium text-lg">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* قسم "هل تريد الاستفادة من خدماتنا؟" */}
            <div className="mt-10 text-center">
              <div className="bg-gradient-to-r from-green-50 to-gray-50 p-8 rounded-2xl border border-green-100 shadow-inner">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">هل تريد الاستفادة من خدماتنا؟</h3>
                <p className="text-gray-600 mb-6">تواصل معنا اليوم للحصول على أفضل خدمة</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/contact"
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 inline-block shadow-md hover:shadow-lg font-medium w-full sm:w-auto transform hover:-translate-y-1 hover:scale-105"
                  >
                    تواصل معنا
                  </Link>
                  <Link
                    to="/"
                    className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-all duration-300 inline-block shadow-sm hover:shadow-md font-medium w-full sm:w-auto"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContactFooter />

        {/* مودال عرض الصورة المكبرة */}
        {openImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-lg transition-opacity duration-700"
            onClick={() => setOpenImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transform transition-transform duration-700 animate-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageSrc(openImage)}
                alt="صورة مكبرة"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ServiceDetail;