import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Phone, Clock, Shield, Award, ThumbsUp, Sparkles, Zap, Heart, Users, ChevronLeft, ChevronRight, Package, Gift, ShoppingCart, ArrowRight, Crown, Droplets, Wind, Flower, Leaf, Mail, Truck } from 'lucide-react';
import Navbar from '../components/Navbar';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { createProductSlug, createCategorySlug } from '../utils/slugify';
import ImageSlider from '../components/ImageSlider';
import ProductCard from '../components/ProductCard';

// Lazy load components that aren't immediately visible
const ContactFooter = lazy(() => import('../components/ContactFooter'));

// استيراد صور الهيرو
import b1 from '../assets/b2.png';
import b2 from '../assets/b1.png';
import b3 from '../assets/b3.png';
import b4 from '../assets/b4.png';

const heroImages = [b1, b2, b3, b4];

// تعريف نوع الخدمة
interface Service {
  id: string | number; // Support both string and number IDs
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
}

// تعريف نوع المنتج
interface Product {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: string | number | null; // Support both string and number IDs
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

// تعريف نوع الفئة
interface Category {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  image: string;
}

// تعريف المميزات ولماذا تختارنا
interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface WhyChooseUsItem {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Truck className="w-8 h-8 text-zico-primary" />,
    title: 'شحن مجاني',
    description: 'للطلبات أكثر من 200 ريال'
  },
  {
    icon: <Shield className="w-8 h-8 text-zico-primary" />,
    title: 'ضمان الجودة',
    description: 'عطور أصلية 100%'
  },
  {
    icon: <Gift className="w-8 h-8 text-zico-primary" />,
    title: 'تغليف فاخر',
    description: 'تغليف مجاني لجميع الطلبات'
  },
  {
    icon: <Award className="w-8 h-8 text-zico-primary" />,
    title: 'خدمة عملاء',
    description: 'دعم على مدار الساعة'
  }
];

const whyChooseUs: WhyChooseUsItem[] = [
  {
    icon: <Award className="w-12 h-12 mb-4 text-white" />,
    title: 'فريق محترف',
    description: 'نخبة من المتخصصين ذوي الخبرة والكفاءة العالية'
  },
  {
    icon: <Shield className="w-12 h-12 mb-4 text-white" />,
    title: 'معدات متطورة',
    description: 'نستثمر في أحدث المعدات والتقنيات العالمية'
  },
  {
    icon: <ThumbsUp className="w-12 h-12 mb-4 text-white" />,
    title: 'أسعار تنافسية',
    description: 'أسعار مدروسة مع ضمان أعلى مستويات الجودة'
  }
];

interface SectionRefs {
  services: React.RefObject<HTMLDivElement>;
  features: React.RefObject<HTMLDivElement>;
  whyChooseUs: React.RefObject<HTMLDivElement>;
}

// Sample perfume products data
const samplePerfumes = [
  {
    id: '1',
    name: 'زيكو العود الملكي',
    price: 299.99,
    originalPrice: 399.99,
    image: '/api/placeholder/300/400',
    category: 'رجالي',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isNew: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'شرقي',
    fragranceNotes: {
      top: ['العود', 'الورد', 'البرغموت'],
      middle: ['الياسمين', 'المسك'],
      base: ['الصندل', 'العنبر']
    },
    scentStrength: 'intense' as const,
    size: '100ml',
    concentration: 'Parfum',
    longevity: '8-12 ساعة',
    sillage: 'قوي'
  },
  {
    id: '2',
    name: 'زيكو روز الذهبي',
    price: 249.99,
    originalPrice: 329.99,
    image: '/api/placeholder/300/400',
    category: 'نسائي',
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'زهري',
    fragranceNotes: {
      top: ['الورد البلغاري', 'الليتشي'],
      middle: ['الياسمين', 'الفاوانيا'],
      base: ['المسك الأبيض', 'الأرز']
    },
    scentStrength: 'medium' as const,
    size: '50ml',
    concentration: 'EDP',
    longevity: '6-8 ساعات',
    sillage: 'متوسط'
  },
  {
    id: '3',
    name: 'زيكو أكوا فريش',
    price: 179.99,
    image: '/api/placeholder/300/400',
    category: 'مشترك',
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    isNew: true,
    brand: 'زيكو',
    scentFamily: 'منعش',
    fragranceNotes: {
      top: ['الليمون', 'النعناع', 'الجريب فروت'],
      middle: ['الخزامى', 'إكليل الجبل'],
      base: ['الأرز الأبيض', 'المسك']
    },
    scentStrength: 'light' as const,
    size: '75ml',
    concentration: 'EDT',
    longevity: '4-6 ساعات',
    sillage: 'خفيف'
  },
  {
    id: '4',
    name: 'زيكو عنبر الليل',
    price: 349.99,
    image: '/api/placeholder/300/400',
    category: 'مسائي',
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    isLuxury: true,
    brand: 'زيكو',
    scentFamily: 'شرقي',
    fragranceNotes: {
      top: ['البرغموت الأسود', 'الهيل'],
      middle: ['العنبر', 'اللبان'],
      base: ['الصندل', 'الباتشولي']
    },
    scentStrength: 'strong' as const,
    size: '100ml',
    concentration: 'Parfum',
    longevity: '10+ ساعات',
    sillage: 'قوي جداً'
  }
];

const perfumeCategories = [
  {
    id: 'mens',
    name: 'عطور رجالي',
    description: 'عطور فاخرة للرجل العصري',
    image: '/api/placeholder/400/300',
    icon: <Crown className="w-8 h-8" />,
    color: 'from-zico-primary to-zico-secondary'
  },
  {
    id: 'womens',
    name: 'عطور نسائي',
    description: 'عطور أنثوية ساحرة',
    image: '/api/placeholder/400/300',
    icon: <Flower className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'unisex',
    name: 'عطور مشتركة',
    description: 'عطور للجنسين',
    image: '/api/placeholder/400/300',
    icon: <Droplets className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'luxury',
    name: 'المجموعة الفاخرة',
    description: 'أرقى العطور العالمية',
    image: '/api/placeholder/400/300',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-zico-gold to-yellow-500'
  }
];

function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState({
    services: false,
    features: false,
    whyChooseUs: false
  });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [serverAvailable, setServerAvailable] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState(samplePerfumes);

  // جلب الخدمات والمنتجات من الخادم
  useEffect(() => {
    fetchServices();
    fetchProducts();
    fetchCategories();
    // استرجاع طريقة العرض من localStorage
    const savedMode = localStorage.getItem('displayMode') as 'grid' | 'list' | 'carousel';
    if (savedMode) {
      setDisplayMode(savedMode);
    }
    setInitialLoad(false);
  }, []);

  const fetchServices = async () => {
    try {
      // For now, we'll use empty array since SERVICES endpoint doesn't exist
      // You can add services data later or create a services endpoint
      console.log('📝 Services endpoint not implemented yet');
      setServices([]);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products for home page...');
      const data = await apiCall(API_ENDPOINTS.PRODUCTS);
      console.log('✅ Products loaded for home:', data.length);
      setProducts(data.slice(0, 8)); // أخذ أول 8 منتجات فقط
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories for home page...');
      
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      
      console.log('✅ Categories loaded for home:', data.length);
      console.log('📂 Categories data:', data);
      setCategories(data);
      
      // Also trigger navbar update
      window.dispatchEvent(new Event('categoriesUpdated'));
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]); // Set empty array instead of hardcoded data
      
      // Trigger navbar update with empty data
      window.dispatchEvent(new Event('categoriesUpdated'));
    }
  };

  // دالة لتتبع زيارات الخدمة
  const trackVisit = (serviceId: string | number) => {
    const visits = JSON.parse(localStorage.getItem('serviceVisits') || '{}');
    visits[serviceId] = (visits[serviceId] || 0) + 1;
    localStorage.setItem('serviceVisits', JSON.stringify(visits));
  };

  // مراجع الأقسام
  const sectionsRef: SectionRefs = {
    services: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    whyChooseUs: useRef<HTMLDivElement>(null)
  };

  const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (sectionsRef.services.current) {
      sectionsRef.services.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // تحميل الهيرو
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // مراقبة ظهور الأقسام
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const sectionId = entry.target.dataset.section;
            if (sectionId && (sectionId === 'services' || sectionId === 'features' || sectionId === 'whyChooseUs')) {
              setVisibleSections(prev => ({
                ...prev,
                [sectionId]: true
              }));
              sectionObserver.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    Object.entries(sectionsRef).forEach(([key, ref]) => {
      if (ref.current) {
        if (ref.current instanceof HTMLElement) {
          ref.current.dataset.section = key;
          sectionObserver.observe(ref.current);
        }
      }
    });

    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  const getImageSrc = (image: string) => {
    return buildImageUrl(image);
  };

  // إعدادات السلايدر للكروسيل
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // الأنميشنات
  const animationStyles = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    @keyframes subtleGlow {
      0% { box-shadow: 0 0 3px rgba(0, 0, 0, 0.1); }
      50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
      100% { box-shadow: 0 0 3px rgba(0, 0, 0, 0.1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s ease forwards;
    }
    .animate-slide-in {
      animation: slideIn 0.6s ease forwards;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .shimmer-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 2s infinite;
    }
    .pulse-effect {
      animation: pulse 3s infinite ease-in-out;
    }
    .glow-effect {
      animation: subtleGlow 2s infinite ease-in-out;
    }
    .list-item {
      transition: all 0.3s ease;
    }
    .list-item:hover {
      background: rgba(236, 72, 153, 0.15);
      transform: translateX(-5px);
    }
    .carousel-item {
      transition: transform 0.5s ease;
    }
    .carousel-item:hover {
      transform: scale(1.05);
    }
    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(236, 72, 153, 0.1);
    }
    .gradient-button::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #ec4899, #be185d);
      z-index: -1;
      border-radius: 10px;
      filter: blur(8px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .gradient-button:hover::before {
      opacity: 1;
    }
    .gradient-border {
      background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #ec4899, #be185d) border-box;
      border: 2px solid transparent;
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zico-cream to-beige-50">
      <style>{animationStyles}</style>
      <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      {/* التنقل */}
      <Navbar />

      {/* Hero Section with ImageSlider */}
      <section className="relative pt-20 pb-12 lg:pb-16">
        <div className="container-responsive">
          <ImageSlider className="mb-8" />
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold luxury-heading mb-6">
              قصة براند زيكو
            </h2>
            <p className="text-lg lg:text-xl text-beige-700 max-w-3xl mx-auto leading-relaxed">
              رحلة عطرية استثنائية تجمع بين التراث العربي الأصيل والحداثة العصرية، 
              لنقدم لك أرقى العطور التي تعكس شخصيتك المميزة
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="perfume-bottle-container aspect-[4/3] rounded-3xl overflow-hidden">
                <img 
                  src="/api/placeholder/600/450" 
                  alt="زيكو براند" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zico-primary/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-zico-primary mb-2">منذ 2020</h3>
                    <p className="text-beige-700">نصنع العطور بحب وإتقان</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-zico-primary to-zico-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">جودة استثنائية</h3>
                  <p className="text-beige-700">نختار أجود المواد الخام من جميع أنحاء العالم</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-zico-gold to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">تصميم فريد</h3>
                  <p className="text-beige-700">كل عطر يحكي قصة مختلفة ويعكس شخصية فريدة</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">تقدير عالمي</h3>
                  <p className="text-beige-700">حائزون على جوائز عالمية في صناعة العطور</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-beige-50 to-beige-100">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold luxury-heading mb-6">
              مجموعاتنا المميزة
            </h2>
            <p className="text-lg text-beige-700 max-w-2xl mx-auto">
              اكتشف مجموعة متنوعة من العطور المصممة خصيصاً لكل مناسبة وشخصية
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perfumeCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-zico-lg hover:shadow-zico-xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`}></div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="text-white mb-4 transform transition-all duration-300 group-hover:scale-110">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-white/90 text-sm mb-4">{category.description}</p>
                    
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span>استكشف المجموعة</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-2" />
                    </div>
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random()}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold luxury-heading mb-6">
              العطور الأكثر مبيعاً
            </h2>
            <p className="text-lg text-beige-700 max-w-2xl mx-auto">
              اكتشف العطور المفضلة لدى عملائنا والأكثر طلباً في المملكة
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in-up"
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-zico inline-flex items-center gap-3"
            >
              <span>عرض جميع المنتجات</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-zico-primary to-zico-secondary">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              لماذا تختار زيكو؟
            </h2>
            <p className="text-lg text-beige-100 max-w-2xl mx-auto">
              نقدم لك تجربة تسوق استثنائية مع أفضل الخدمات والضمانات
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                  {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-beige-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-24 bg-beige-50">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-zico-xl p-8 lg:p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-zico-primary to-zico-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold luxury-heading mb-4">
                اشترك في نشرتنا الإخبارية
              </h2>
              <p className="text-lg text-beige-700 mb-8">
                احصل على آخر الأخبار والعروض الحصرية والمنتجات الجديدة قبل الجميع
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-6 py-4 rounded-xl border border-beige-300 focus:outline-none focus:border-zico-primary focus:ring-2 focus:ring-zico-primary/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="btn-zico px-8 py-4 whitespace-nowrap"
                >
                  اشترك الآن
                </button>
              </form>
              
              <p className="text-sm text-beige-600 mt-4">
                لن نشارك بريدك الإلكتروني مع أي طرف ثالث
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold luxury-heading mb-6">
                تواصل معنا
              </h2>
              <p className="text-lg text-beige-700 mb-8">
                فريق خدمة العملاء لدينا جاهز لمساعدتك في أي وقت. 
                تواصل معنا للحصول على استشارة مجانية حول أفضل العطور المناسبة لك
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-zico-primary to-zico-secondary rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">اتصل بنا</p>
                    <p className="text-beige-700">+966 50 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-zico-gold to-yellow-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">راسلنا</p>
                    <p className="text-beige-700">info@zico-perfumes.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="perfume-bottle-container aspect-square rounded-3xl overflow-hidden">
                <img 
                  src="/api/placeholder/500/500" 
                  alt="تواصل معنا" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zico-primary/30 to-transparent"></div>
                
                {/* Floating Contact Info */}
                <div className="absolute top-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-zico-primary font-bold">خدمة عملاء 24/7</p>
                    <p className="text-sm text-beige-700">نحن هنا لخدمتك</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* الفوتر */}
      <Suspense fallback={<div className="bg-gray-900 h-64"></div>}>
        <ContactFooter />
      </Suspense>
    </div>
  );
}

export default Home;