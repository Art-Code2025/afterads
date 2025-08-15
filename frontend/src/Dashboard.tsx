import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, Calendar, 
  Eye, Edit, Trash2, Plus, Search, RefreshCw,
  BarChart3, Clock, CheckCircle, XCircle,
  AlertTriangle, Heart, Phone, Mail,
  MapPin, Truck, Gift, Tag, Settings,
  LogOut, Home, Menu, X, Bell,
  FileText, Shield,
  Grid, AlertCircle as AlertIcon,
  Circle, Globe, Activity
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { apiCall, API_ENDPOINTS, buildImageUrl } from './config/api.ts';
import OrderModal from './components/OrderModal';
import DeleteModal from './components/DeleteModal';
import InvoiceManagement from './components/InvoiceManagement';
import StaticPageModal from './components/StaticPageModal';
import logo from './assets/logo.png';
import BlogManagement from './components/blog/BlogManagement';
import StaffManagement from './components/StaffManagement';

// تعريف الأنواع
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  basePrice: number;
  originalPrice?: number;
  status: 'active' | 'inactive';
  categories: string[];
  createdAt?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: 'active' | 'inactive';
  type: string;
  originalPrice?: number;
  basePrice?: number;
  categoryId?: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage?: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface Category {
  id: string | number; // Support both string and number IDs
  name: string;
  description: string;
  image: string;
  createdAt?: string;
}

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
  id: string | number; // Make id flexible to handle both types
  customerName: string;
  total: number;
  status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'; // Make optional
  createdAt?: string; // Make optional to handle undefined
  items: any[];
  address: string;
  city: string;
  customerPhone?: string;
  customerEmail?: string;
  subtotal?: number;
  deliveryFee?: number;
  couponDiscount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  adminNotes?: string; // ملاحظات الإدارة
}

interface Customer {
  id: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  cartItems?: number;
  wishlistItems?: number;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  cartItemsCount?: number;
  wishlistItemsCount?: number;
  hasCart?: boolean;
  hasWishlist?: boolean;
}

interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

// إضافة interfaces نظام الشحن
interface ShippingZone {
  id: number;
  name: string;
  description: string;
  cities: string[];
  shippingCost: number;
  freeShippingThreshold: number;
  estimatedDays: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

interface ShippingSettings {
  id: number;
  globalFreeShippingThreshold: number;
  defaultShippingCost: number;
  enableFreeShipping: boolean;
  enableZoneBasedShipping: boolean;
  enableExpressShipping: boolean;
  expressShippingCost: number;
  expressShippingDays: string;
  shippingTaxRate: number;
  updatedAt: string;
}

interface StaticPage {
  id: string | number; // Allow both string and number
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  priority?: number;
  publishDate?: string;
}

const Dashboard: React.FC = () => {
  console.log('🎯 Dashboard component started rendering...');
  
  // State definitions
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  // حالات الخدمات والتصنيفات
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');

  // حالات تبويب "خدماتي" الجديد
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [filteredMyServices, setFilteredMyServices] = useState<Service[]>([]);
  const [myServicesSearchTerm, setMyServicesSearchTerm] = useState<string>('');
  const [myServicesLoading, setMyServicesLoading] = useState<boolean>(false);
  const [myServicesError, setMyServicesError] = useState<string | null>(null);


  // حالات الكوبونات والـ Wishlist
  const [coupons, setCoupons] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const [couponSearchTerm, setCouponSearchTerm] = useState<string>('');

  // حالات الطلبات والإحصائيات
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // حالات العملاء
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');

  // حالات مناطق الشحن
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [filteredShippingZones, setFilteredShippingZones] = useState<ShippingZone[]>([]);
  const [shippingZoneSearchTerm, setShippingZoneSearchTerm] = useState<string>('');
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    id: 1,
    globalFreeShippingThreshold: 500,
    defaultShippingCost: 50,
    enableFreeShipping: true,
    enableZoneBasedShipping: true,
    enableExpressShipping: true,
    expressShippingCost: 100,
    expressShippingDays: '1-2 أيام',
    shippingTaxRate: 0,
    updatedAt: new Date().toISOString()
  });
  const [showShippingZoneModal, setShowShippingZoneModal] = useState<boolean>(false);
  const [showShippingSettingsModal, setShowShippingSettingsModal] = useState<boolean>(false);
  const [editingShippingZone, setEditingShippingZone] = useState<ShippingZone | null>(null);
  const [newShippingZone, setNewShippingZone] = useState<Partial<ShippingZone>>({
    name: '',
    description: '',
    cities: [],
    shippingCost: 0,
    freeShippingThreshold: 0,
    estimatedDays: '2-3 أيام',
    isActive: true,
    priority: 1
  });

  // حالات المودال
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'shippingZone' | 'service';
    id: string | number;
    name: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'product',
    id: '',
    name: '',
    loading: false
  });

  // جلب إحصائيات العملاء
  const [customerStats, setCustomerStats] = useState<any>(null);

  // حالات مودالات العملاء الجديدة
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState<boolean>(false);
  const [isCustomerEditModalOpen, setIsCustomerEditModalOpen] = useState<boolean>(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // حالات الإحصائيات والتحليلات
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);

  // حالات الصفحات الثابتة
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [filteredStaticPages, setFilteredStaticPages] = useState<StaticPage[]>([]);
  const [pageSearchTerm, setPageSearchTerm] = useState<string>('');
  const [showPageModal, setShowPageModal] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newPage, setNewPage] = useState<Partial<StaticPage> & {
    keywords?: string;
    contentType?: string;
    status?: string;
    priority?: number;
    publishDate?: string;
    imageFile?: File | null;
    imageUrl?: string;
  }>({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isActive: true,
    showInFooter: true
  });

  // حالة تحميل الطلبات
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  
  // حالات إدارة الملاحظات
  const [editingOrderNotes, setEditingOrderNotes] = useState<string | number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // تحويل الستاف تلقائياً لتاب الطلبات
  useEffect(() => {
    if (currentUser && currentUser.role === 'staff' && currentTab !== 'orders') {
      setCurrentTab('orders');
    }
  }, [currentUser, currentTab]);

  // وظائف الطلبات - محسنة للسرعة القصوى بدون تحميل
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    // تجنب التداخل مع fetchDashboardData في تبويب overview
    if (currentTab === 'overview') {
      console.log('⚠️ Skipping fetchOrders in overview tab - using fetchDashboardData instead');
      return;
    }
    const cachedOrders = sessionStorage.getItem('ordersData');
    const cacheTime = sessionStorage.getItem('ordersDataTime');
    const now = Date.now();
    
    // عرض البيانات المحفوظة فوراً إذا كانت متوفرة
    if (cachedOrders) {
      try {
        const parsedOrders = JSON.parse(cachedOrders);
        setOrders(parsedOrders);
        setFilteredOrders(parsedOrders);
        console.log('⚡ Orders displayed instantly from cache:', parsedOrders.length);
      } catch (error) {
        console.warn('⚠️ Cache parsing failed');
      }
    }
    
    // التحقق من الحاجة للتحديث (30 ثانية فقط)
    const CACHE_DURATION = 30 * 1000; // 30 ثانية
    const shouldRefresh = forceRefresh || !cacheTime || (now - parseInt(cacheTime)) > CACHE_DURATION;
    
    if (shouldRefresh) {
      try {
        // تحديث البيانات في الخلفية بدون تحميل
        console.log('🔄 Refreshing orders in background...');
        
        const response = await apiCall(API_ENDPOINTS.ORDERS);
        const ordersData = response?.data || response || [];
        
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
          setFilteredOrders(ordersData);
          
          // تحديث الكاش
          sessionStorage.setItem('ordersData', JSON.stringify(ordersData));
          sessionStorage.setItem('ordersDataTime', now.toString());
          
          console.log('✅ Orders refreshed silently:', ordersData.length);
        } else {
          console.warn('⚠️ Invalid orders data format:', ordersData);
          // الاحتفاظ بالبيانات المحفوظة في حالة الخطأ
          if (!cachedOrders) {
            setOrders([]);
            setFilteredOrders([]);
          }
        }
      } catch (error) {
        console.error('❌ Error refreshing orders:', error);
        // الاحتفاظ بالبيانات المحفوظة في حالة الخطأ
        if (!cachedOrders) {
          setOrders([]);
          setFilteredOrders([]);
          toast.error('خطأ في جلب الطلبات');
        }
      }
    }
  }, []);

  // Initialize current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  // دالة جلب بيانات الداشبورد المحسنة
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🚀 Fetching optimized dashboard data...');
      const startTime = Date.now();
      
      const data = await apiCall('/dashboard');
      const fetchTime = Date.now() - startTime;
      
      console.log(`✅ Dashboard data fetched in ${fetchTime}ms:`, {
        services: data.stats?.totalServices || 0,
        orders: data.stats?.totalOrders || 0,
        customers: data.stats?.totalCustomers || 0,
        recentOrders: data.recentOrders?.length || 0
      });
      
      // تحديث البيانات بشكل متسق
      if (data.recentOrders) {
        console.log(`📊 Updating orders state with ${data.recentOrders.length} orders`);
        setOrders(data.recentOrders);
        setFilteredOrders(data.recentOrders);
        
        // مسح أي cache قديم للطلبات لتجنب التضارب
        sessionStorage.removeItem('ordersCache');
        sessionStorage.removeItem('ordersCacheTime');
      }
      
      // حفظ البيانات في sessionStorage للتخزين المؤقت
      sessionStorage.setItem('dashboardData', JSON.stringify(data));
      sessionStorage.setItem('dashboardDataTime', Date.now().toString());
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // محاولة استخدام البيانات المحفوظة
      const cachedData = sessionStorage.getItem('dashboardData');
      if (cachedData) {
        console.log('🔄 Using cached dashboard data');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  }, []);

  // تحميل محسن للداشبورد - تحميل البيانات الأساسية فقط أولاً
  useEffect(() => {
    console.log('🚀 Dashboard initializing with optimized loading...');
    
    // إظهار الواجهة فوراً
    setLoading(false);
    console.log('✅ Dashboard UI loaded immediately');
    
    // تحميل البيانات الأساسية فقط (الطلبات للداشبورد الرئيسي)
    const loadEssentialData = async () => {
      try {
        // تحميل التصنيفات والخدمات مع بداية التطبيق
        await fetchCategories();
        await fetchMyServices(false); // Use cache if available
        
        // استخدام API الداشبورد المحسن للتبويب الرئيسي
        if (currentTab === 'overview') {
          await fetchDashboardData();
        } else if (currentTab === 'orders') {
          await fetchOrders();
        }
      } catch (error) {
        console.error('❌ Essential data loading error:', error);
      }
    };
    
    // تحميل البيانات الأساسية فوراً
    loadEssentialData();
    
    // تأجيل تحميل باقي البيانات لتحسين الأداء
    const loadSecondaryData = () => {
      // تحميل المنتجات بعد ثانية واحدة
      setTimeout(async () => {
        try {
          const servicesResponse = await apiCall(API_ENDPOINTS.SERVICES);
          const servicesData = servicesResponse?.data || servicesResponse || [];
          setProducts(Array.isArray(servicesData) ? servicesData : []);
          setFilteredProducts(Array.isArray(servicesData) ? servicesData : []);
          console.log('✅ Services loaded in background:', servicesData?.length || 0);
        } catch (err) {
          console.warn('⚠️ Services failed:', err);
          setProducts([]);
          setFilteredProducts([]);
        }
      }, 1000);
      
      // تحميل التصنيفات بعد ثانيتين
      setTimeout(async () => {
        try {
          const categoriesResponse = await apiCall(API_ENDPOINTS.CATEGORIES);
          const categoriesData = categoriesResponse?.data || categoriesResponse || [];
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setFilteredCategories(Array.isArray(categoriesData) ? categoriesData : []);
          console.log('✅ Categories loaded in background:', categoriesData?.length || 0);
        } catch (err) {
          console.warn('⚠️ Categories failed:', err);
          setCategories([]);
          setFilteredCategories([]);
        }
      }, 2000);
      
      // تحميل الكوبونات بعد 3 ثوانٍ مع آلية إعادة المحاولة
      setTimeout(async () => {
        const loadCouponsWithRetry = async (retries = 2) => {
          try {
            const couponsResponse = await apiCall(API_ENDPOINTS.COUPONS);
            const couponsData = couponsResponse?.data || couponsResponse || [];
            setCoupons(Array.isArray(couponsData) ? couponsData : []);
            setFilteredCoupons(Array.isArray(couponsData) ? couponsData : []);
            console.log('✅ Coupons loaded in background:', couponsData?.length || 0);
          } catch (err) {
            console.warn('⚠️ Coupons failed (attempt remaining: ' + retries + '):', err);
            if (retries > 0 && err instanceof Error && err.message.includes('انتهت مهلة الطلب')) {
              // إعادة المحاولة بعد 3 ثوانٍ في حالة timeout
              setTimeout(() => loadCouponsWithRetry(retries - 1), 3000);
            } else {
              setCoupons([]);
              setFilteredCoupons([]);
            }
          }
        };
        
        await loadCouponsWithRetry();
      }, 3000);
      
      // تحميل العملاء بعد 4 ثوانٍ مع آلية إعادة المحاولة
      setTimeout(async () => {
        const loadCustomersWithRetry = async (retries = 2) => {
          try {
            const customersResponse = await apiCall(API_ENDPOINTS.CUSTOMERS);
            const customersData = customersResponse?.data || customersResponse || [];
            setCustomers(Array.isArray(customersData) ? customersData : []);
            setFilteredCustomers(Array.isArray(customersData) ? customersData : []);
            console.log('✅ Customers loaded in background:', customersData?.length || 0);
          } catch (err) {
            console.warn('⚠️ Customers failed (attempt remaining: ' + retries + '):', err);
            if (retries > 0 && err instanceof Error && err.message.includes('انتهت مهلة الطلب')) {
              // إعادة المحاولة بعد 3 ثوانٍ في حالة timeout
              setTimeout(() => loadCustomersWithRetry(retries - 1), 3000);
            } else {
              setCustomers([]);
              setFilteredCustomers([]);
            }
          }
        };
        
        await loadCustomersWithRetry();
      }, 4000);
    };
    
    // بدء تحميل البيانات الثانوية في الخلفية
    loadSecondaryData();
    
  }, [currentTab, fetchOrders]);
  
  const fetchCustomerStats = async () => {
    try {
      // Calculate basic customer stats
      const total = customers.length;
      const active = customers.filter(c => c.status === 'active').length;
      const thisMonth = customers.filter(c => {
        const created = new Date(c.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;
      
      // Calculate wishlist and cart stats from enriched customer data
      let totalWishlistItems = 0;
      let totalCartItems = 0;
      let customersWithCart = 0;
      let customersWithWishlist = 0;
      
      // Sum up data from all customers
      customers.forEach(customer => {
        if (customer.wishlistItemsCount && customer.wishlistItemsCount > 0) {
          totalWishlistItems += customer.wishlistItemsCount;
          customersWithWishlist++;
        }
        if (customer.cartItemsCount && customer.cartItemsCount > 0) {
          totalCartItems += customer.cartItemsCount;
          customersWithCart++;
        }
      });
      
      // Calculate averages
      const avgCartItems = customersWithCart > 0 ? Math.round(totalCartItems / customersWithCart) : 0;
      
      const stats = {
        total,
        active,
        thisMonth,
        totalWishlistItems,
        avgCartItems
      };
      
      console.log('📊 Customer Stats Calculated:', {
        ...stats,
        customersWithCart,
        customersWithWishlist,
        totalCartItems
      });
      setCustomerStats(stats);
      return stats;
    } catch (error) {
      console.error('Error calculating customer stats:', error);
      // Return default stats to prevent UI errors
      const defaultStats = {
        total: customers.length,
        active: 0,
        thisMonth: 0,
        totalWishlistItems: 0,
        avgCartItems: 0
      };
      setCustomerStats(defaultStats);
      return defaultStats;
    }
  };

  const generateSalesData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const salesData: SalesData[] = months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 8000) + 5000 + (index * 500),
      orders: Math.floor(Math.random() * 40) + 20 + (index * 3)
    }));
    setSalesData(salesData);

    if (services.length > 0) {
        const topServicesData = services.slice(0, 5).map((service, index) => ({
        name: service.name,
        sales: Math.floor(Math.random() * 80) + 20 - (index * 5),
        revenue: (Math.floor(Math.random() * 80) + 20 - (index * 5)) * (service.basePrice || service.originalPrice || 0)
      }));
      setTopServices(topServicesData);
    }
  };

  // دالة تحميل بيانات الإحصائيات الحقيقية - محسنة للسرعة القصوى
  const loadAnalyticsData = useCallback(async () => {
    // تحقق من وجود بيانات محفوظة مؤقتاً
    const cachedData = sessionStorage.getItem('analyticsData');
    const cacheTime = sessionStorage.getItem('analyticsDataTime');
    const now = Date.now();
    
    // استخدام البيانات المحفوظة إذا كانت حديثة (أقل من 5 دقائق)
    if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
      const data = JSON.parse(cachedData);
      setAnalyticsData(data.analytics || {});
      setDailyStats(data.daily || []);
      setMonthlyStats(data.monthly || []);
      setAnalyticsLoading(false);
      console.log('✅ Analytics data loaded from cache');
      return;
    }

    setAnalyticsLoading(true);
    console.log('🔄 Loading analytics data...');
    
    try {
      // تحميل البيانات الأساسية أولاً (الإحصائيات العامة)
      const analyticsResponse = apiCall('/analytics');
      
      // تحميل البيانات التفصيلية في الخلفية
      const loadDetailedData = async () => {
        try {
          const [dailyData, monthlyData] = await Promise.all([
            apiCall('/analytics-stats?type=daily'),
            apiCall('/analytics-stats?type=monthly')
          ]);

          setDailyStats(dailyData.stats || []);
          console.log('✅ Daily stats loaded');
          
          setMonthlyStats(monthlyData.stats || []);
          console.log('✅ Monthly stats loaded');
        } catch (error) {
          console.warn('⚠️ Detailed analytics data failed:', error);
        }
      };

      // تحميل البيانات الأساسية
      const analyticsData = await analyticsResponse;
      setAnalyticsData(analyticsData);
      console.log('✅ Basic analytics loaded');
      
      // حفظ البيانات الأساسية في التخزين المؤقت
      const basicResults = {
        analytics: analyticsData,
        daily: [],
        monthly: []
      };
      sessionStorage.setItem('analyticsData', JSON.stringify(basicResults));
      sessionStorage.setItem('analyticsDataTime', now.toString());
      
      // إنهاء حالة التحميل للبيانات الأساسية
      setAnalyticsLoading(false);
      
      // تحميل البيانات التفصيلية في الخلفية
      loadDetailedData();
      
    } catch (error) {
      console.error('خطأ في تحميل بيانات الإحصائيات:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // تحديث الإحصائيات (background job)
  const updateAnalyticsStats = async () => {
    try {
      console.log('🔄 بدء تحديث الإحصائيات...');
      
      await apiCall('/analytics-stats?action=calculate', {
        method: 'POST'
      });
      
      console.log('✅ تم تحديث الإحصائيات بنجاح');
      toast.success('تم تحديث الإحصائيات بنجاح');
      
      // إعادة تحميل البيانات بعد التحديث
      await loadAnalyticsData();
      
    } catch (error: any) {
      console.error('❌ خطأ في تحديث الإحصائيات:', error);
      
      // معالجة مخصصة لأنواع الأخطاء المختلفة
      if (error.message?.includes('انتهت مهلة الطلب')) {
        toast.warning('تحديث الإحصائيات يستغرق وقتاً أطول من المعتاد. سيتم المحاولة مرة أخرى في الخلفية.');
        
        // محاولة مرة أخرى بعد 30 ثانية في الخلفية
        setTimeout(async () => {
          try {
            await apiCall('/analytics-stats?action=calculate', {
              method: 'POST'
            });
            console.log('✅ تم تحديث الإحصائيات في المحاولة الثانية');
            await loadAnalyticsData();
            toast.success('تم تحديث الإحصائيات بنجاح (محاولة ثانية)');
          } catch (retryError) {
            console.error('❌ فشل في المحاولة الثانية:', retryError);
          }
        }, 30000);
        
      } else if (error.message?.includes('خطأ في الاتصال')) {
        toast.error('خطأ في الاتصال - تأكد من اتصالك بالإنترنت');
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error('خطأ في الشبكة - يرجى المحاولة مرة أخرى');
      } else {
        toast.error('حدث خطأ أثناء تحديث الإحصائيات');
      }
    }
  };

  // Update filtered orders when orders change or when switching to orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      filterOrders(orderSearchTerm, orderStatusFilter);
    }
  }, [orders, currentTab, orderSearchTerm, orderStatusFilter]);

  // تحميل بيانات الإحصائيات عند تبديل التبويب
  useEffect(() => {
    if (currentTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [currentTab]);

  // تحميل الطلبات عند فتح التبويب فقط - محسن
  useEffect(() => {
    if (currentTab === 'orders') {
      fetchOrders();
    }
  }, [currentTab, fetchOrders]);

  // تحديث تلقائي للطلبات في الداشبورد الرئيسي - محسن
  useEffect(() => {
    if (currentTab === 'overview') {
      fetchDashboardData(); // جلب بيانات الداشبورد المحسنة
      
      // تحديث تلقائي كل 5 دقائق بدلاً من 30 ثانية لتوفير الموارد
      const interval = setInterval(() => {
        fetchDashboardData(); // تحديث قسري
      }, 300000); // 5 دقائق
      
      return () => clearInterval(interval);
    }
  }, [currentTab, fetchDashboardData]);

  // تحديث الطلبات عند العودة للصفحة (focus) - محسن
  useEffect(() => {
    const handleFocus = () => {
      if (currentTab === 'overview') {
        fetchDashboardData(); // تحديث بيانات الداشبورد المحسنة
      } else if (currentTab === 'orders') {
        fetchOrders(true); // تحديث قسري عند العودة للصفحة
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentTab, fetchDashboardData, fetchOrders]);

  // الاستماع لإشعارات الطلبات الجديدة - محسن
  useEffect(() => {
    const handleNewOrder = () => {
      console.log('📢 [Dashboard] Received new order notification, refreshing data...');
      
      // استخدام API الداشبورد المحسن إذا كنا في التبويب الرئيسي
      if (currentTab === 'overview') {
        fetchDashboardData(); // تحديث بيانات الداشبورد الكاملة
      } else {
        fetchOrders(true); // تحديث الطلبات فقط للتبويبات الأخرى
      }
      
      // إزالة الإشعار بعد المعالجة
      localStorage.removeItem('newOrderAdded');
      toast.success('تم استلام طلب جديد!');
    };
    
    // فحص وجود إشعار عند تحميل الصفحة
    if (localStorage.getItem('newOrderAdded') === 'true') {
      handleNewOrder();
    }
    
    // تحميل فوري للخدمات من localStorage عند التبديل إلى تبويب "خدماتي"
    if (currentTab === 'myservices') {
      // تحميل فوري من localStorage أولاً
      const { services: cachedServices, isValid } = getMyServicesFromCache();
      if (cachedServices && cachedServices.length > 0) {
        console.log('⚡ INSTANT LOAD: Setting services from localStorage immediately');
        setMyServices(cachedServices);
        setFilteredMyServices(cachedServices);
        setMyServicesError(null);
        setMyServicesLoading(false);
        
        // إذا كانت البيانات منتهية الصلاحية، حدثها في الخلفية
        if (!isValid) {
          console.log('🔄 Background refresh: Updating expired cache');
          fetchMyServices(true); // تحديث في الخلفية
        }
      } else {
        // لا توجد بيانات محفوظة، تحميل من API
        fetchMyServices(false);
      }
    }
    
    // الاستماع للإشعارات الجديدة
    window.addEventListener('newOrderAdded', handleNewOrder);
    return () => window.removeEventListener('newOrderAdded', handleNewOrder);
  }, [currentTab, fetchDashboardData, fetchOrders]);

  // localStorage cache for my services - محسن للسرعة الفائقة
  const MY_SERVICES_CACHE_KEY = 'myServices_cache';
  const MY_SERVICES_CACHE_TIMESTAMP_KEY = 'myServices_cache_timestamp';
  const MY_SERVICES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better persistence

  // وظيفة حفظ الخدمات في localStorage
  const saveMyServicesToCache = (services: Service[]) => {
    try {
      localStorage.setItem(MY_SERVICES_CACHE_KEY, JSON.stringify(services));
      localStorage.setItem(MY_SERVICES_CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('💾 My services saved to localStorage cache');
    } catch (error) {
      console.warn('⚠️ Failed to save services to localStorage:', error);
    }
  };

  // وظيفة استرجاع الخدمات من localStorage
  const getMyServicesFromCache = (): { services: Service[] | null; isValid: boolean } => {
    try {
      const cachedServices = localStorage.getItem(MY_SERVICES_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(MY_SERVICES_CACHE_TIMESTAMP_KEY);
      
      if (!cachedServices || !cachedTimestamp) {
        return { services: null, isValid: false };
      }

      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();
      const isValid = (now - timestamp) < MY_SERVICES_CACHE_DURATION;
      
      const services = JSON.parse(cachedServices) as Service[];
      return { services, isValid };
    } catch (error) {
      console.warn('⚠️ Failed to read services from localStorage:', error);
      return { services: null, isValid: false };
    }
  };

  // وظائف تبويب "خدماتي" الجديد - محسن بـ localStorage
  const fetchMyServices = useCallback(async (forceRefresh = false) => {
    // التحقق من وجود بيانات محفوظة في localStorage
    if (!forceRefresh) {
      const { services: cachedServices, isValid } = getMyServicesFromCache();
      
      if (isValid && cachedServices && cachedServices.length > 0) {
        console.log('⚡ Using localStorage cached my services data - INSTANT LOAD!');
        setMyServices(cachedServices);
        setFilteredMyServices(cachedServices);
        setMyServicesError(null);
        setMyServicesLoading(false);
        return;
      }
      
      // إذا كانت البيانات منتهية الصلاحية ولكن موجودة، اعرضها أولاً ثم حدث في الخلفية
      if (cachedServices && cachedServices.length > 0) {
        console.log('📦 Using expired cached data while refreshing in background');
        setMyServices(cachedServices);
        setFilteredMyServices(cachedServices);
        setMyServicesError(null);
        // لا تضع setMyServicesLoading(false) هنا لأننا سنحدث في الخلفية
      }
    }

    // جلب البيانات من API
    try {
      setMyServicesLoading(true);
      setMyServicesError(null);
      
      const response = await apiCall(API_ENDPOINTS.SERVICES);
      
      if (!response) {
        throw new Error('لم يتم استلام بيانات من الخادم');
      }

      let servicesData: Service[] = [];
      
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response.services && Array.isArray(response.services)) {
        servicesData = response.services;
      } else if (response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        servicesData = [];
      }

      // حفظ البيانات الجديدة في localStorage
      saveMyServicesToCache(servicesData);
      
      setMyServices(servicesData);
      setFilteredMyServices(servicesData);
      setMyServicesError(null);
      
      // التحقق من وجود تغييرات مقارنة بالبيانات المخبأة
      const { services: oldCachedServices } = getMyServicesFromCache();
      if (oldCachedServices && JSON.stringify(oldCachedServices) !== JSON.stringify(servicesData)) {
        console.log('🔄 Services data updated from server');
      }
    } catch (error) {
      console.error('❌ Error fetching my services:', error);
      
      // في حالة الخطأ، استخدم البيانات المخبأة إن وجدت
      const { services: cachedServices } = getMyServicesFromCache();
      if (cachedServices && cachedServices.length > 0) {
        console.log('📦 Using cached data due to API error');
        setMyServices(cachedServices);
        setFilteredMyServices(cachedServices);
        setMyServicesError(null);
      } else {
        setMyServicesError('حدث خطأ في تحميل الخدمات');
        setMyServices([]);
        setFilteredMyServices([]);
      }
      
      toast.error('فشل في تحميل الخدمات');
    } finally {
      setMyServicesLoading(false);
    }
  }, []);

  // استماع لأحداث تحديث الخدمات
  useEffect(() => {
    const handleServicesUpdate = () => {
      console.log('🔄 Services updated event received, refreshing myServices');
      if (currentTab === 'myservices') {
        fetchMyServices(true); // تحديث قسري
      }
    };

    window.addEventListener('servicesUpdated', handleServicesUpdate);
    return () => window.removeEventListener('servicesUpdated', handleServicesUpdate);
  }, [currentTab, fetchMyServices]);

  // وظائف الخدمات
  const fetchServices = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.SERVICES);
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    }
  };




  // وظائف التصنيفات
  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);

      setCategories(data || []);
      setFilteredCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setFilteredCategories([]);
    }
  };

  // وظائف الكوبونات
  const fetchCoupons = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.COUPONS);
      setCoupons(data || []);
      setFilteredCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
      setFilteredCoupons([]);
    }
  };

  // وظائف قائمة الأمنيات - تم إزالتها
  const fetchWishlistItems = async () => {
    // Wishlist functionality has been removed
    setWishlistItems([]);
  };

  // تم نقل fetchOrders إلى أعلى الملف لتجنب مشكلة "used before declaration"

  // localStorage cache for customers - محسن للسرعة الفائقة
  const CUSTOMERS_CACHE_KEY = 'customers_cache';
  const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'customers_cache_timestamp';
  const CUSTOMERS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better persistence

  // وظيفة حفظ العملاء في localStorage
  const saveCustomersToCache = (customers: Customer[]) => {
    try {
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(customers));
      localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('💾 Customers saved to localStorage cache');
    } catch (error) {
      console.warn('⚠️ Failed to save customers to localStorage:', error);
    }
  };

  // وظيفة استرجاع العملاء من localStorage
  const getCustomersFromCache = (): { customers: Customer[] | null; isValid: boolean } => {
    try {
      const cachedCustomers = localStorage.getItem(CUSTOMERS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
      
      if (!cachedCustomers || !cachedTimestamp) {
        return { customers: null, isValid: false };
      }

      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();
      const isValid = (now - timestamp) < CUSTOMERS_CACHE_DURATION;
      
      const customers = JSON.parse(cachedCustomers) as Customer[];
      return { customers, isValid };
    } catch (error) {
      console.warn('⚠️ Failed to read customers from localStorage:', error);
      return { customers: null, isValid: false };
    }
  };

  // وظائف العملاء - محسنة بـ localStorage للسرعة الفائقة
  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    // التحقق من وجود بيانات محفوظة في localStorage
    if (!forceRefresh) {
      const { customers: cachedCustomers, isValid } = getCustomersFromCache();
      
      if (isValid && cachedCustomers && cachedCustomers.length > 0) {
        console.log('⚡ Using localStorage cached customers data - INSTANT LOAD!');
        setCustomers(cachedCustomers);
        setFilteredCustomers(cachedCustomers);
        return;
      }
      
      // إذا كانت البيانات منتهية الصلاحية ولكن موجودة، اعرضها أولاً ثم حدث في الخلفية
      if (cachedCustomers && cachedCustomers.length > 0) {
        console.log('📦 Using expired cached customers data while refreshing in background');
        setCustomers(cachedCustomers);
        setFilteredCustomers(cachedCustomers);
        // لا تضع loading هنا لأننا سنحدث في الخلفية
      }
    }

    // جلب البيانات من API
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      const customersData = data || [];
      
      // تحميل سريع للعملاء بدون إثراء البيانات أولاً
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      
      // حفظ في localStorage للمرة القادمة
      if (customersData.length > 0) {
        saveCustomersToCache(customersData);
      }
      
      // إثراء البيانات في الخلفية بدون انتظار
      enrichCustomersData(customersData);
      
      console.log('✅ Customers loaded and cached successfully:', customersData.length);
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      // في حالة الخطأ، حاول استخدام البيانات المحفوظة
      const { customers: cachedCustomers } = getCustomersFromCache();
      if (cachedCustomers && cachedCustomers.length > 0) {
        console.log('🔄 Using cached customers data due to API error');
        setCustomers(cachedCustomers);
        setFilteredCustomers(cachedCustomers);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    }
  }, []);

  const fetchCustomersOld = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      const customersData = data || [];
      
      // تحميل سريع للعملاء بدون إثراء البيانات أولاً
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      
      // إثراء البيانات في الخلفية بدون انتظار
      enrichCustomersData(customersData);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    }
  };
  
  // دالة منفصلة لإثراء بيانات العملاء في الخلفية
  const enrichCustomersData = async (customersData: Customer[]) => {
    try {
      // استخدام الدالة الجديدة من API للحصول على جميع البيانات مرة واحدة
      const enrichedCustomers = await Promise.all(customersData.map(async (customer: Customer) => {
        let cartItemsCount = 0;
        let wishlistItemsCount = 0;
        let hasCart = false;
        let hasWishlist = false;
        
        // فقط للعميل الحالي نحصل على بيانات المفضلة من localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id && customer.id && currentUser.id.toString() === customer.id.toString()) {
          try {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (Array.isArray(wishlist)) {
              wishlistItemsCount = wishlist.length;
              hasWishlist = wishlistItemsCount > 0;
            }
          } catch (wishlistError) {
            console.warn(`⚠️ Could not parse wishlist for customer ${customer.id}:`, wishlistError);
          }
        }
        
        return {
          ...customer,
          cartItemsCount,
          wishlistItemsCount,
          hasCart,
          hasWishlist
        };
      }));
      
      // تحديث البيانات بعد الإثراء
      setCustomers(enrichedCustomers);
      setFilteredCustomers(enrichedCustomers);
      console.log('✅ Customers enriched with cart/wishlist data:', enrichedCustomers.length);
      
    } catch (error) {
      console.warn('⚠️ Error enriching customers data:', error);
    }
  };

  // تحميل المنتجات والتصنيفات عند فتح التبويب
  useEffect(() => {
    if (currentTab === 'services') {
      fetchServices();
    }
    if (currentTab === 'categories') {
      fetchCategories();
    }
  }, [currentTab]);

  // الاستماع لأحداث تحديث المنتجات
  useEffect(() => {
    const handleProductsUpdate = () => {
      if (currentTab === 'services') {
        fetchServices();
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    window.addEventListener('productCreated', handleProductsUpdate);
    window.addEventListener('productUpdated', handleProductsUpdate);
    window.addEventListener('productDeleted', handleProductsUpdate);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('productCreated', handleProductsUpdate);
      window.removeEventListener('productUpdated', handleProductsUpdate);
      window.removeEventListener('productDeleted', handleProductsUpdate);
    };
  }, [currentTab]);

  // تحميل العملاء عند فتح التبويب فقط - مع localStorage caching
  useEffect(() => {
    if (currentTab === 'customers') {
      // تحميل فوري من localStorage أولاً
      const { customers: cachedCustomers, isValid } = getCustomersFromCache();
      if (cachedCustomers && cachedCustomers.length > 0) {
        console.log('⚡ INSTANT LOAD: Setting customers from localStorage immediately');
        setCustomers(cachedCustomers);
        setFilteredCustomers(cachedCustomers);
        
        // إذا كانت البيانات منتهية الصلاحية، حدثها في الخلفية
        if (!isValid) {
          console.log('🔄 Background refresh: Updating expired customers cache');
          fetchCustomers(true); // تحديث في الخلفية
        }
      } else {
        // لا توجد بيانات محفوظة، تحميل من API
        fetchCustomers(false);
      }
    }
  }, [currentTab, fetchCustomers]);

  useEffect(() => {
    if (currentTab === 'customers' && customers.length > 0) {
      fetchCustomerStats();
    }
  }, [currentTab, customers]);

  const handleOrderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setOrderSearchTerm(term);
    filterOrders(term, orderStatusFilter);
  };

  const handleOrderStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setOrderStatusFilter(status);
    filterOrders(orderSearchTerm, status);
  };

  const filterOrders = (searchTerm: string, statusFilter: string) => {
    let filtered = orders;

    if (statusFilter !== 'all' && statusFilter !== '') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerPhone && order.customerPhone.includes(searchTerm)) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.id.toString().includes(searchTerm) // Convert to string for search
      );
    }

    setFilteredOrders(filtered);
  };

  // Order update handler - محسن للسرعة القصوى
  const handleOrderStatusUpdate = async (orderId: string | number, newStatus: string) => {
    try {
      // إزالة صفحة التحميل - تحديث فوري في الواجهة
      const orderIdStr = typeof orderId === 'string' ? orderId : orderId.toString();
      
      // Find current order to get old status
      const currentOrder = orders.find(order => order.id.toString() === orderId.toString());
      const oldStatus = currentOrder?.status;
      
      // تحديث الحالة فوراً في الواجهة قبل إرسال الطلب للخادم
      const updateOrdersState = (orders: Order[]) => 
        orders.map(order => 
          order.id.toString() === orderId.toString()
            ? { ...order, status: newStatus as Order['status'] }
            : order
        );
      
      setOrders(updateOrdersState);
      setFilteredOrders(updateOrdersState);
      
      // إظهار رسالة النجاح فوراً
      toast.success(`تم تحديث حالة الطلب إلى: ${getOrderStatusText(newStatus)}`);
      
      // إرسال التحديث للخادم في الخلفية
      try {
        await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderIdStr), {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        });
        
        // Local activity logging (no API dependency)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        
        // استخدام بيانات المستخدم المناسبة
        const activeUser = currentUser.id ? currentUser : adminUser;
        const staffName = activeUser.name || activeUser.firstName || activeUser.username || 'مستخدم غير معروف';
        const staffEmail = activeUser.email || '';
        
        // إنشاء سجل النشاط
        const activityLog = {
          id: Date.now().toString(),
          staffId: activeUser.id || 'unknown',
          staffName: staffName,
          action: 'order_status_change',
          orderId: orderIdStr,
          timestamp: new Date().toISOString(),
          details: {
            oldStatus: getOrderStatusText(oldStatus),
            newStatus: getOrderStatusText(newStatus),
            customerName: currentOrder?.customerName || '',
            orderTotal: currentOrder?.total || 0,
            firstName: activeUser.firstName || '',
            email: staffEmail
          },
          ipAddress: '127.0.0.1'
        };
        
        // حفظ السجل في localStorage
        const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        existingLogs.unshift(activityLog);
        
        // الاحتفاظ بآخر 100 سجل فقط
        if (existingLogs.length > 100) {
          existingLogs.splice(100);
        }
        
        localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
        
        console.log('✅ Order status updated successfully on server');
        
      } catch (error) {
        console.error('❌ Error updating order status on server:', error);
        // في حالة فشل التحديث على الخادم، إعادة الحالة السابقة
        const revertOrdersState = (orders: Order[]) => 
          orders.map(order => 
            order.id.toString() === orderId.toString()
              ? { ...order, status: oldStatus }
              : order
          );
        
        setOrders(revertOrdersState);
        setFilteredOrders(revertOrdersState);
        toast.error('فشل في تحديث حالة الطلب على الخادم، تم استرجاع الحالة السابقة');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('فشل في تحديث حالة الطلب');
    }
  };
  
  // إضافة ملاحظة للطلب
  const handleAddOrderNote = async (orderId: string | number, note: string) => {
    try {
      const orderIdStr = typeof orderId === 'string' ? orderId : orderId.toString();
      
      // تحديث الطلب بالملاحظة الجديدة فوراً في الواجهة
      const updateOrdersWithNote = (orders: Order[]) => 
        orders.map(order => 
          order.id.toString() === orderId.toString()
            ? { ...order, adminNotes: note }
            : order
        );
      
      setOrders(updateOrdersWithNote);
      setFilteredOrders(updateOrdersWithNote);
      
      toast.success('تم إضافة الملاحظة بنجاح');
      
      // إرسال التحديث للخادم في الخلفية
      try {
        await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderIdStr), {
          method: 'PUT',
          body: JSON.stringify({ 
            adminNotes: note,
            updatedAt: new Date().toISOString()
          }),
        });
        
        // تسجيل النشاط
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const activeUser = currentUser.id ? currentUser : adminUser;
        const currentOrder = orders.find(order => order.id.toString() === orderId.toString());
        
        const activityLog = {
          id: Date.now().toString(),
          staffId: activeUser.id || 'unknown',
          staffName: activeUser.name || activeUser.firstName || 'مستخدم غير معروف',
          action: 'order_note_add',
          orderId: orderIdStr,
          timestamp: new Date().toISOString(),
          details: {
            note: note,
            customerName: currentOrder?.customerName || '',
            orderTotal: currentOrder?.total || 0,
            firstName: activeUser.firstName || activeUser.name || '',
            email: activeUser.email || ''
          },
          ipAddress: '127.0.0.1'
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        existingLogs.unshift(activityLog);
        if (existingLogs.length > 100) existingLogs.splice(100);
        localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
        
        console.log('✅ Order note added successfully');
        
      } catch (error) {
        console.error('❌ Error adding order note on server:', error);
        toast.error('تم إضافة الملاحظة محلياً، لكن فشل في الحفظ على الخادم');
      }
    } catch (error) {
      console.error('Error adding order note:', error);
      toast.error('فشل في إضافة الملاحظة');
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    try {
      setLoading(true);
      
      // Convert orderId to string for API call consistency
      const orderIdStr = typeof orderId === 'string' ? orderId : orderId.toString();
      
      await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderIdStr), {
        method: 'DELETE',
      });

      // Remove order from local state - compare as strings for consistency
      setOrders(prevOrders => prevOrders.filter(order => order.id.toString() !== orderId.toString()));
      setFilteredOrders(prevOrders => prevOrders.filter(order => order.id.toString() !== orderId.toString()));
      
      toast.success('تم حذف الطلب بنجاح');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('فشل في حذف الطلب');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOrderStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'قيد التحضير';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status || 'غير محدد';
    }
  };

  const getOrderPriorityColor = (order: any) => {
    const orderDate = new Date(order.createdAt);
    const hoursAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
    
    if (order.status === 'pending' && hoursAgo > 24) return 'border-l-4 border-red-500 bg-red-50';
    if (order.status === 'pending' && hoursAgo > 12) return 'border-l-4 border-orange-500 bg-orange-50';
    if (order.status === 'pending') return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-gray-300';
  };

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش',
      fabric: 'نوع القماش',
      length: 'الطول',
      width: 'العرض'
    };
    return optionNames[optionName] || optionName;
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.SERVICE_BY_ID(id), {
        method: 'DELETE',
      });
      
      // Convert id to number for comparison since Service.id is number
      setServices(services.filter(s => s.id !== Number(id)));
      setFilteredProducts(filteredProducts.filter(p => p.id !== id.toString()));
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('فشل في حذف المنتج');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.COUPON_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCoupons(coupons.filter(c => c.id !== id));
      setFilteredCoupons(filteredCoupons.filter(c => c.id !== id));
      toast.success('تم حذف الكوبون بنجاح');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('فشل في حذف الكوبون');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCategories(categories.filter(c => c.id !== id));
      setFilteredCategories(filteredCategories.filter(c => c.id !== id));
      toast.success('تم حذف التصنيف بنجاح');
      
      // Trigger categories update event
      window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف التصنيف');
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setProductSearchTerm(term);
    
    if (term) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(term.toLowerCase()) ||
        service.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCategorySearchTerm(term);

    if (term) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(term.toLowerCase()) ||
        category.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  // دالة البحث للتبويب الجديد "خدماتي"
  const handleMyServicesSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setMyServicesSearchTerm(term);

    if (term) {
      const filtered = myServices.filter(service =>
        service.name.toLowerCase().includes(term.toLowerCase()) ||
        service.description.toLowerCase().includes(term.toLowerCase()) ||
        service.homeShortDescription.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMyServices(filtered);
    } else {
      setFilteredMyServices(myServices);
    }
  };

  const handleCouponSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCouponSearchTerm(term);

    if (term) {
      const filtered = coupons.filter(coupon =>
        coupon.name.toLowerCase().includes(term.toLowerCase()) ||
        coupon.code.toLowerCase().includes(term.toLowerCase()) ||
        coupon.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  };

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearchTerm(term);
    
    if (!term) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => {
        const searchTerm = term.toLowerCase();
        const customerName = (customer.name || customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()).toLowerCase();
        const customerEmail = (customer.email || '').toLowerCase();
        const customerPhone = (customer.phone || '').toLowerCase();
        
        return customerName.includes(searchTerm) || 
               customerEmail.includes(searchTerm) || 
               customerPhone.includes(searchTerm);
      });
      setFilteredCustomers(filtered);
    }
  };

  // وظائف إدارة الملاحظات للطلبات
  const handleEditOrderNotes = (orderId: string | number) => {
    const order = orders.find(o => o.id.toString() === orderId.toString());
    if (order) {
      setEditingOrderNotes(orderId.toString());
      setTempNotes(order.notes || '');
    }
  };

  const handleSaveOrderNotes = async (orderId: string | number) => {
    try {
      const orderIdStr = orderId.toString();
      
      // تحديث الواجهة فوراً
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id.toString() === orderIdStr 
            ? { ...order, notes: tempNotes }
            : order
        )
      );
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id.toString() === orderIdStr 
            ? { ...order, notes: tempNotes }
            : order
        )
      );
      
      setEditingOrderNotes(null);
      setTempNotes('');
      toast.success('تم حفظ الملاحظة بنجاح');
      
      // إرسال التحديث للخادم في الخلفية
      try {
        await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderIdStr), {
          method: 'PUT',
          body: JSON.stringify({
            notes: tempNotes,
            updatedAt: new Date().toISOString()
          }),
        });
        
        // تسجيل النشاط
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const activeUser = currentUser.id ? currentUser : adminUser;
        const currentOrder = orders.find(order => order.id.toString() === orderIdStr);
        
        const activityLog = {
          id: Date.now().toString(),
          staffId: activeUser.id || 'unknown',
          staffName: activeUser.name || activeUser.firstName || 'مستخدم غير معروف',
          action: 'تحديث ملاحظة الطلب',
          orderId: orderIdStr,
          timestamp: new Date().toISOString(),
          details: {
            note: tempNotes,
            customerName: currentOrder?.customerName || '',
            orderTotal: currentOrder?.total || 0,
            firstName: activeUser.firstName || activeUser.name || '',
            email: activeUser.email || ''
          },
          ipAddress: '127.0.0.1'
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        existingLogs.unshift(activityLog);
        if (existingLogs.length > 100) existingLogs.splice(100);
        localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
        
        console.log('✅ Order notes updated successfully on server');
        
      } catch (error) {
        console.error('❌ Error updating order notes on server:', error);
        toast.error('تم حفظ الملاحظة محلياً، لكن فشل في الحفظ على الخادم');
      }
    } catch (error) {
      console.error('Error saving order notes:', error);
      toast.error('فشل في حفظ الملاحظة');
    }
  };

  const handleCancelEditOrderNotes = () => {
    setEditingOrderNotes(null);
    setTempNotes('');
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    
    toast.success('تم تسجيل الخروج بنجاح');
    
    // Navigate to login with replace to prevent back navigation
    navigate('/login', { replace: true });
  };

  const switchTab = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when switching tabs
  };

  // إحصائيات المتجر - محسنة باستخدام بيانات API الداشبورد
  const getStoreStats = () => {
    // محاولة الحصول على البيانات من sessionStorage أولاً
    const cachedDashboardData = sessionStorage.getItem('dashboardData');
    let dashboardStats = null;
    
    if (cachedDashboardData) {
      try {
        const parsedData = JSON.parse(cachedDashboardData);
        dashboardStats = parsedData.stats;
      } catch (error) {
        console.error('❌ Error parsing cached dashboard data:', error);
      }
    }
    
    // استخدام بيانات API الداشبورد إذا كانت متوفرة، وإلا استخدام الحسابات المحلية
    if (dashboardStats) {
      console.log('✅ Using optimized dashboard stats from API');
      return {
        totalServices: dashboardStats.totalServices || 0,
        totalCategories: dashboardStats.totalCategories || 0,
        unavailableServices: dashboardStats.unavailableServices || 0,
        availableServices: dashboardStats.availableServices || 0,
        totalValue: dashboardStats.totalValue || 0,
        totalCoupons: dashboardStats.totalCoupons || 0,
        activeCoupons: dashboardStats.activeCoupons || 0,
        wishlistItemsCount: wishlistItems.length || 0, // هذا لا يزال محلياً
        totalOrders: dashboardStats.totalOrders || 0,
        pendingOrders: dashboardStats.pendingOrders || 0,
        completedOrders: dashboardStats.completedOrders || 0,
        totalRevenue: dashboardStats.totalRevenue || 0,
        averageOrderValue: dashboardStats.averageOrderValue || 0
      };
    }
    
    // Fallback للحسابات المحلية إذا لم تكن بيانات API متوفرة
    console.log('⚠️ Using local calculations as fallback');
    const totalServices = services.length || 3;
    const totalCategories = categories.length || 5;
    const unavailableServices = services.filter(s => s.status === 'inactive').length;
    const availableServices = services.filter(s => s.status === 'active').length;
    const totalValue = services.reduce((sum, s) => sum + (s.basePrice || s.originalPrice || 0), 0) || 15000;
    const totalCoupons = coupons.length || 4;
    const activeCoupons = coupons.filter(coupon => coupon.isActive).length || 3;
    const wishlistItemsCount = wishlistItems.length || 0;
    
    const totalOrders = orders.length || 3;
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || 
      (order.status as any) === 'معلق'
    ).length || 1;
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' || 
      (order.status as any) === 'مُستلم'
    ).length || 1;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0) || 614;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : (614 / 3);

    return {
      totalServices,
      totalCategories,
      unavailableServices,
      availableServices,
      totalValue,
      totalCoupons,
      activeCoupons,
      wishlistItemsCount,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue
    };
  };

  // دوال إدارة الصفحات الثابتة
  const fetchStaticPages = async () => {
    try {
      console.log('Fetching static pages from API...');
      const response = await apiCall(API_ENDPOINTS.STATIC_PAGES.GET_ALL);
      console.log('Static pages received:', response);
      
      if (response && Array.isArray(response)) {
        setStaticPages(response);
        setFilteredStaticPages(response);
        // Save to localStorage for persistence
        localStorage.setItem('dashboardStaticPages', JSON.stringify(response));
      } else {
        console.warn('Invalid response format for static pages');
        setStaticPages([]);
        setFilteredStaticPages([]);
      }
    } catch (error) {
      console.error('Error fetching static pages:', error);
      // Try to load from localStorage as fallback
      try {
        const savedPages = localStorage.getItem('dashboardStaticPages');
        if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          setStaticPages(parsedPages);
          setFilteredStaticPages(parsedPages);
          console.log('Loaded static pages from localStorage:', parsedPages);
        } else {
          setStaticPages([]);
          setFilteredStaticPages([]);
        }
      } catch (storageError) {
        console.error('Error loading from localStorage:', storageError);
        setStaticPages([]);
        setFilteredStaticPages([]);
      }
      toast.error('حدث خطأ في تحميل الصفحات');
    }
  };

  const handlePageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setPageSearchTerm(term);
    
    if (term) {
      const filtered = staticPages.filter(page =>
        page.title.toLowerCase().includes(term.toLowerCase()) ||
        page.slug.toLowerCase().includes(term.toLowerCase()) ||
        page.content.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStaticPages(filtered);
    } else {
      setFilteredStaticPages(staticPages);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Keep Arabic, English, numbers, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // تحميل البيانات عند تحميل الصفحة لأول مرة
  useEffect(() => {
    // تحميل البيانات الأساسية
    loadAnalyticsData();
    fetchOrders();
    fetchCoupons();
    fetchWishlistItems();
    
    // تحميل الخدمات والتصنيفات
    fetchServices();
    fetchCategories();
    
    // تحديث الإحصائيات
    updateAnalyticsStats();
  }, []);

  const openPageModal = (page?: StaticPage) => {
    if (page) {
      setEditingPage(page);
      setNewPage({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaDescription: page.metaDescription,
        isActive: page.isActive,
        showInFooter: page.showInFooter,
        keywords: '',
        contentType: 'page',
        status: 'published',
        priority: 1,
        publishDate: new Date().toISOString().split('T')[0],
        imageFile: null,
        imageUrl: ''
      });
    } else {
      setEditingPage(null);
      setNewPage({
        title: '',
        slug: '',
        content: '',
        metaDescription: '',
        isActive: true,
        showInFooter: true,
        keywords: '',
        contentType: 'page',
        status: 'published',
        priority: 1,
        publishDate: new Date().toISOString().split('T')[0],
        imageFile: null,
        imageUrl: ''
      });
    }
    setShowPageModal(true);
    setShowPreview(false);
  };

  const closePageModal = () => {
    setShowPageModal(false);
    setEditingPage(null);
    setShowPreview(false);
    setNewPage({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isActive: true,
      showInFooter: true,
      keywords: '',
      contentType: 'page',
      status: 'published',
      priority: 1,
      publishDate: new Date().toISOString().split('T')[0],
      imageFile: null,
      imageUrl: ''
    });
  };

  // دوال مساعدة للمحرر المتقدم
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPage(prev => ({
          ...prev,
          imageFile: file,
          imageUrl: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = newPage.content || '';
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      setNewPage(prev => ({ ...prev, content: newContent }));
      
      // إعادة تعيين موضع المؤشر
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const formatText = (tag: string, prompt?: string) => {
    if (prompt) {
      const userInput = window.prompt(prompt);
      if (userInput) {
        if (tag === 'link') {
          insertTextAtCursor(`<a href="${userInput}" target="_blank">النص المحدد</a>`);
        } else if (tag === 'image') {
          insertTextAtCursor(`<img src="${userInput}" alt="وصف الصورة" class="max-w-full h-auto rounded-lg" />`);
        }
      }
    } else {
      const formats: { [key: string]: string } = {
        bold: '<strong>النص المحدد</strong>',
        italic: '<em>النص المحدد</em>',
        underline: '<u>النص المحدد</u>',
        h1: '<h1 class="text-3xl font-bold mb-4">العنوان الرئيسي</h1>',
        h2: '<h2 class="text-2xl font-bold mb-3">العنوان الفرعي</h2>',
        h3: '<h3 class="text-xl font-bold mb-2">عنوان فرعي صغير</h3>',
        ul: '<ul class="list-disc list-inside mb-4">\n  <li>العنصر الأول</li>\n  <li>العنصر الثاني</li>\n</ul>',
        ol: '<ol class="list-decimal list-inside mb-4">\n  <li>العنصر الأول</li>\n  <li>العنصر الثاني</li>\n</ol>',
        blockquote: '<blockquote class="border-r-4 border-blue-500 pr-4 py-2 bg-blue-50 mb-4">\n  النص المقتبس\n</blockquote>',
        alert: '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">\n  <div class="flex items-center">\n    <span class="text-yellow-600">⚠️</span>\n    <span class="mr-2 font-medium text-yellow-800">تنبيه مهم</span>\n  </div>\n</div>',
        hr: '<hr class="my-6 border-gray-300" />'
      };
      
      if (formats[tag]) {
        insertTextAtCursor(formats[tag]);
      }
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const savePage = async (pageData: {
    title: string;
    slug: string;
    content: string;
    metaDescription?: string;
    isActive: boolean;
    showInFooter: boolean;
  }) => {
    try {
      // لا نكرر التحقق هنا؛ المودال قام بالفعل بالتحقق وإرسال بيانات مُنظّفة
      const title = pageData.title?.trim();
      const slug = pageData.slug?.trim();
      const content = pageData.content?.trim();
      const metaDescription = (pageData.metaDescription || '').trim();
      const isActive = pageData.isActive;
      const showInFooter = pageData.showInFooter;

      // تحقق من تكرار الـ slug (مع استثناء الصفحة الحالية إذا كنا بنعدّل)
      const slugExists = staticPages.some(page =>
        page.slug === slug && page.id !== editingPage?.id
      );
      
      if (slugExists) {
        toast.error('هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر');
        return;
      }

      if (editingPage) {
        // تحديث صفحة موجودة
        const updateData = { title, slug, content, metaDescription, isActive, showInFooter };
        
        const response = await apiCall(API_ENDPOINTS.STATIC_PAGES.UPDATE(editingPage.id), {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
        
        if (response) {
          await fetchStaticPages();
          toast.success('تم تحديث الصفحة بنجاح');
        }
      } else {
        // إضافة صفحة جديدة
        const newPageData = { title, slug, content, metaDescription, isActive, showInFooter };
        
        const response = await apiCall(API_ENDPOINTS.STATIC_PAGES.CREATE, {
          method: 'POST',
          body: JSON.stringify(newPageData)
        });
        
        if (response) {
          await fetchStaticPages();
          toast.success('تم إضافة الصفحة بنجاح');
        }
      }
      
      closePageModal();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('حدث خطأ في حفظ الصفحة');
    }
  };

  const deletePage = async (pageId: string | number) => {
    try {
      setLoading(true);
      
      await apiCall(API_ENDPOINTS.STATIC_PAGES.DELETE(pageId), {
        method: 'DELETE',
      });

      // تحديث الحالة محلياً مع توحيد المقارنة كسلاسل نصية
      setStaticPages(prevPages => prevPages.filter(page => String(page.id) !== String(pageId)));
      setFilteredStaticPages(prevPages => prevPages.filter(page => String(page.id) !== String(pageId)));
      
      toast.success('تم حذف الصفحة بنجاح');
    } catch (error) {
      console.error('Error deleting static page:', error);
      toast.error('فشل في حذف الصفحة');
    } finally {
      setLoading(false);
    }
  };


  // Event handlers
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDeleteClick = (type: string, id: string | number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: type as 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'shippingZone',
      id: id.toString(),
      name,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      let endpoint = '';
      let successMessage = '';
      
      switch (deleteModal.type) {
        case 'product':
          endpoint = API_ENDPOINTS.SERVICES + '/' + deleteModal.id;
          successMessage = 'تم حذف الخدمة بنجاح!';
          // مسح cache الخدمات عند الحذف
          localStorage.removeItem('myServices_cache');
          localStorage.removeItem('myServices_cache_timestamp');
          console.log('🗑️ Cleared myServices cache after service deletion');
          break;
        case 'service':
          endpoint = API_ENDPOINTS.SERVICES + '/' + deleteModal.id;
          successMessage = 'تم حذف الخدمة بنجاح!';
          // مسح cache الخدمات عند الحذف
          localStorage.removeItem('myServices_cache');
          localStorage.removeItem('myServices_cache_timestamp');
          console.log('🗑️ Cleared myServices cache after service deletion');
          break;
        case 'category':
          endpoint = API_ENDPOINTS.CATEGORIES + '/' + deleteModal.id;
          successMessage = 'تم حذف التصنيف بنجاح!';
          break;
        case 'order':
          endpoint = API_ENDPOINTS.ORDERS + '/' + deleteModal.id;
          successMessage = 'تم حذف الطلب بنجاح!';
          break;
        case 'customer':
          endpoint = API_ENDPOINTS.CUSTOMERS + '/' + deleteModal.id;
          successMessage = 'تم حذف العميل بنجاح!';
          break;
        case 'coupon':
          endpoint = API_ENDPOINTS.COUPONS + '/' + deleteModal.id;
          successMessage = 'تم حذف الكوبون بنجاح!';
          break;
        case 'shippingZone':
          // Handle shipping zone deletion locally
          const updatedZones = shippingZones.filter(zone => zone.id.toString() !== deleteModal.id.toString());
          setShippingZones(updatedZones);
          setFilteredShippingZones(updatedZones);
          localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
          window.dispatchEvent(new Event('shippingZonesUpdated'));
          setDeleteModal(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success('تم حذف منطقة الشحن بنجاح');
          return;
        default:
          throw new Error('نوع غير معروف للحذف');
      }
      
      const response = await apiCall(endpoint, { method: 'DELETE' });
      
      // Update local state based on type
      switch (deleteModal.type) {
        case 'product':
          setProducts(prev => prev.filter(p => p.id.toString() !== deleteModal.id.toString()));
          setFilteredProducts(prev => prev.filter(p => p.id.toString() !== deleteModal.id.toString()));
          break;
        case 'service':
          setServices(prev => prev.filter(s => s.id.toString() !== deleteModal.id.toString()));
          setFilteredServices(prev => prev.filter(s => s.id.toString() !== deleteModal.id.toString()));
          break;
        case 'category':
          setCategories(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          setFilteredCategories(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          // Update products that had this category
          const updatedProducts = products.map((product: Product) => 
            product.categoryId?.toString() === deleteModal.id.toString() ? { ...product, categoryId: null } : product
          );
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
          window.dispatchEvent(new Event('categoriesUpdated'));
          break;
        case 'order':
          setOrders(prev => prev.filter(o => o.id.toString() !== deleteModal.id.toString()));
          setFilteredOrders(prev => prev.filter(o => o.id.toString() !== deleteModal.id.toString()));
          break;
        case 'customer':
          setCustomers(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          setFilteredCustomers(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          break;
        case 'coupon':
          setCoupons(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          setFilteredCoupons(prev => prev.filter(c => c.id.toString() !== deleteModal.id.toString()));
          break;
      }
      
      toast.success(successMessage);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleteModal(prev => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  // Delete Modal Functions
  const openDeleteModal = (type: 'product' | 'category' | 'order' | 'customer' | 'coupon' | 'shippingZone' | 'service', id: string | number, name: string) => {
    // For services, keep the ID as string since Firebase uses string IDs
    if (type === 'service') {
      handleDeleteClick(type, id, name);
      return;
    }
    
    // For other types, ensure id is a valid number
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) {
      console.error('Invalid ID provided for deletion:', id);
      toast.error('معرف غير صالح للحذف');
      return;
    }
    handleDeleteClick(type, numericId, name);
  };

  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDelete = async () => {
    await handleDeleteConfirm();
  };

  // وظائف إدارة العملاء الجديدة
  const openCustomerDetailsModal = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsModalOpen(true);
    setLoadingCustomerOrders(true);
    
    try {
      // جلب طلبات العميل
      const customerOrdersData = orders.filter(order => 
        (order.customerEmail && customer.email && order.customerEmail === customer.email) || 
        (order.customerName && (customer.fullName || customer.name) && order.customerName === (customer.fullName || customer.name))
      );
      setCustomerOrders(customerOrdersData);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('فشل في جلب طلبات العميل');
    } finally {
      setLoadingCustomerOrders(false);
    }
  };

  const closeCustomerDetailsModal = () => {
    setIsCustomerDetailsModalOpen(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const openCustomerEditModal = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setIsCustomerEditModalOpen(true);
  };

  const closeCustomerEditModal = () => {
    setIsCustomerEditModalOpen(false);
    setEditingCustomer(null);
  };

  const updateCustomer = async () => {
    if (!editingCustomer) return;
    
    try {
      const endpoint = `customers/${editingCustomer.id}`;
      const updatedCustomer = await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(editingCustomer)
      });
      
      // تحديث الحالة المحلية
      setCustomers(prev => prev.map(customer => 
        customer.id && editingCustomer.id && customer.id.toString() === editingCustomer.id.toString() ? updatedCustomer : customer
      ));
      setFilteredCustomers(prev => prev.map(customer => 
        customer.id && editingCustomer.id && customer.id.toString() === editingCustomer.id.toString() ? updatedCustomer : customer
      ));
      
      toast.success('تم تحديث بيانات العميل بنجاح!');
      closeCustomerEditModal();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('فشل في تحديث بيانات العميل');
    }
  };

  const toggleCustomerStatus = async (customerId: string | number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const endpoint = `customers/${customerId}`;
      
      await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      // تحديث الحالة المحلية
      setCustomers(prev => prev.map(customer => 
        customer.id && customer.id.toString() === customerId.toString() ? { ...customer, status: newStatus as 'active' | 'inactive' } : customer
      ));
      setFilteredCustomers(prev => prev.map(customer => 
        customer.id && customer.id.toString() === customerId.toString() ? { ...customer, status: newStatus as 'active' | 'inactive' } : customer
      ));
      
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} العميل بنجاح!`);
    } catch (error) {
      console.error('Error toggling customer status:', error);
      toast.error('فشل في تغيير حالة العميل');
    }
  };

  // إضافة معالجة أفضل للأخطاء
  const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast.error(message);
  };

  // حالة تحميل الشحن
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);

  // وظائف نظام الشحن
  const fetchShippingZones = async () => {
    try {
      setLoadingShipping(true);
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // محاولة تحميل البيانات من localStorage أولاً
      const savedZones = localStorage.getItem('shippingZones');
      if (savedZones) {
        const zones = JSON.parse(savedZones);
        if (Array.isArray(zones) && zones.length > 0) {
          setShippingZones(zones);
          setFilteredShippingZones(zones);
          return;
        }
      }

      // إذا لم توجد بيانات محفوظة، استخدم البيانات الافتراضية
      const mockZones: ShippingZone[] = [
        {
          id: 1,
          name: 'الرياض الكبرى',
          description: 'مدينة الرياض والمناطق المحيطة',
          cities: ['الرياض', 'الدرعية', 'الخرج', 'المزاحمية'],
          shippingCost: 25,
          freeShippingThreshold: 300,
          estimatedDays: '1-2 أيام',
          isActive: true,
          priority: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'جدة ومكة',
          description: 'المنطقة الغربية الرئيسية',
          cities: ['جدة', 'مكة المكرمة', 'الطائف', 'رابغ'],
          shippingCost: 35,
          freeShippingThreshold: 400,
          estimatedDays: '2-3 أيام',
          isActive: true,
          priority: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'المنطقة الشرقية',
          description: 'الدمام والخبر والأحساء',
          cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الجبيل'],
          shippingCost: 40,
          freeShippingThreshold: 450,
          estimatedDays: '2-4 أيام',
          isActive: true,
          priority: 3,
          createdAt: new Date().toISOString()
        }
      ];
      
      // حفظ البيانات الافتراضية في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(mockZones));
      setShippingZones(mockZones);
      setFilteredShippingZones(mockZones);
    } catch (error) {
      handleError(error, 'فشل في جلب مناطق الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleShippingZoneSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setShippingZoneSearchTerm(term);
    
    if (!term) {
      setFilteredShippingZones(shippingZones);
    } else {
      const filtered = shippingZones.filter(zone => 
        zone.name.toLowerCase().includes(term.toLowerCase()) ||
        zone.description.toLowerCase().includes(term.toLowerCase()) ||
        zone.cities.some(city => city.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredShippingZones(filtered);
    }
  };

  const handleAddShippingZone = async () => {
    try {
      setLoadingShipping(true);
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const zoneData: Omit<ShippingZone, 'id' | 'createdAt'> = {
        name: newShippingZone.name || '',
        description: newShippingZone.name || '', // استخدام اسم المنطقة كوصف
        cities: [newShippingZone.name || ''], // استخدام اسم المنطقة كمدينة افتراضية
        shippingCost: newShippingZone.shippingCost || 0,
        freeShippingThreshold: 500, // قيمة افتراضية ثابتة
        estimatedDays: newShippingZone.estimatedDays || '2-3 أيام',
        isActive: true, // تفعيل افتراضي
        priority: shippingZones.length + 1 // أولوية تلقائية
      };

      // محاكاة إضافة المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const newZoneWithId: ShippingZone = {
        ...zoneData,
        id: Math.max(...shippingZones.map(z => z.id), 0) + 1,
        createdAt: new Date().toISOString()
      };

      const updatedZones = [...shippingZones, newZoneWithId];
      setShippingZones(updatedZones);
      setFilteredShippingZones([...filteredShippingZones, newZoneWithId]);
      
      // حفظ المناطق في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      // إشعار المكونات الأخرى بالتحديث
      window.dispatchEvent(new Event('shippingZonesUpdated'));
      
      setShowShippingZoneModal(false);
      setNewShippingZone({
        name: '',
        description: '',
        cities: [],
        shippingCost: 0,
        freeShippingThreshold: 0,
        estimatedDays: '2-3 أيام',
        isActive: true,
        priority: 1
      });
      toast.success('تم إضافة منطقة الشحن بنجاح');
    } catch (error) {
      handleError(error, 'فشل في إضافة منطقة الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleUpdateShippingZone = async () => {
    if (!editingShippingZone) return;

    try {
      setLoadingShipping(true);
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // محاكاة تحديث المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const updatedZones = shippingZones.map(z => z.id === editingShippingZone.id ? editingShippingZone : z);
      setShippingZones(updatedZones);
      setFilteredShippingZones(filteredShippingZones.map(z => z.id === editingShippingZone.id ? editingShippingZone : z));
      
      // حفظ المناطق في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      setShowShippingZoneModal(false);
      setEditingShippingZone(null);
      toast.success('تم تحديث منطقة الشحن بنجاح');
    } catch (error) {
      handleError(error, 'فشل في تحديث منطقة الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleDeleteShippingZone = async (id: number) => {
    try {
      setLoadingShipping(true);
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // محاكاة حذف المنطقة (سيتم ربطها بالباك إند لاحقاً)
      const updatedZones = shippingZones.filter(z => z.id !== id);
      setShippingZones(updatedZones);
      setFilteredShippingZones(filteredShippingZones.filter(z => z.id !== id));
      
      // حفظ المناطق المحدثة في localStorage
      localStorage.setItem('shippingZones', JSON.stringify(updatedZones));
      
      // إشعار المكونات الأخرى بالتحديث
      window.dispatchEvent(new Event('shippingZonesUpdated'));
      
      toast.success('تم حذف منطقة الشحن بنجاح');
    } catch (error) {
      handleError(error, 'فشل في حذف منطقة الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleUpdateShippingSettings = async () => {
    try {
      setLoadingShipping(true);
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // محاكاة تحديث إعدادات الشحن (سيتم ربطها بالباك إند لاحقاً)
      const updatedSettings = {
        ...shippingSettings,
        updatedAt: new Date().toISOString()
      };
      
      setShippingSettings(updatedSettings);
      
      // حفظ الإعدادات في localStorage
      localStorage.setItem('shippingSettings', JSON.stringify(updatedSettings));
      
      setShowShippingSettingsModal(false);
      toast.success('تم تحديث إعدادات الشحن بنجاح');
    } catch (error) {
      handleError(error, 'فشل في تحديث إعدادات الشحن');
    } finally {
      setLoadingShipping(false);
    }
  };

  // إضافة useEffect لجلب بيانات الشحن
  useEffect(() => {
    if (currentTab === 'shipping') {
      fetchShippingZones();
    }
  }, [currentTab]);

  // Load static pages from localStorage on component mount
  useEffect(() => {
    const savedPages = localStorage.getItem('dashboardStaticPages');
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        if (Array.isArray(parsedPages)) {
          setStaticPages(parsedPages);
          setFilteredStaticPages(parsedPages);
          console.log('🚀 Initial load: Dashboard static pages from localStorage');
        }
      } catch (error) {
        console.error('❌ Error parsing saved dashboard static pages on mount:', error);
      }
    }
  }, []);

  // تحميل الصفحات الثابتة عند فتح التبويب
  useEffect(() => {
    if (currentTab === 'pages') {
      fetchStaticPages();
    }
  }, [currentTab]);

  // Calculate stats after all data is loaded
  const stats = getStoreStats();

  console.log('🔍 Dashboard render check:', {
    loading,
    error,
    productsCount: products.length,
    categoriesCount: categories.length,
    currentTab,
    isAuthenticated: localStorage.getItem('isAuthenticated')
  });

  // NEVER redirect if already on dashboard - this was causing the disappearing issue!
  // Only check authentication without redirecting
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const adminUser = localStorage.getItem('adminUser');
  
  if (!isAuthenticated && !adminUser) {
    console.log('⚠️ No authentication found, but staying on dashboard');
    // Don't redirect! Just show a message or handle it differently
  }

  // Show loading screen while data is loading - but with timeout
  if (loading) {
    console.log('⏳ Still in loading state, showing loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">جاري تحميل لوحة التحكم</h2>
          <p className="text-gray-500">يرجى الانتظار...</p>
          <button 
            onClick={() => setLoading(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إظهار الداشبورد الآن
          </button>
        </div>
      </div>
    );
  }

  // Show error screen only for critical errors - but don't redirect
  if (error && error.includes('critical')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">حدث خطأ</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(false);
            }} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ml-2"
          >
            المتابعة للداشبورد
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  console.log('🎉 Dashboard rendering main UI!');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <img src={logo} alt="Mawasiem Logo" className="h-10 w-10 ml-3" />
            
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">فتح القائمة الرئيسية</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8 space-x-reverse">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 inline-block ml-2" />
                  الرئيسية
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('products')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'products'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4 inline-block ml-2" />
                  المنتجات والخدمات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('myservices')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'myservices'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4 inline-block ml-2" />
                  خدماتي
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('categories')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'categories'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4 inline-block ml-2" />
                  التصنيفات
                </button>
              )}
              <button
                onClick={() => switchTab('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline-block ml-2" />
                الطلبات
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('customers')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'customers'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 inline-block ml-2" />
                  العملاء
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('coupons')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'coupons'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Gift className="w-4 h-4 inline-block ml-2" />
                  الكوبونات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('shipping')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'shipping'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Truck className="w-4 h-4 inline-block ml-2" />
                  الشحن
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('analytics')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'analytics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline-block ml-2" />
                  التحليلات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('invoices')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'invoices'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block ml-2" />
                  الفواتير
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('pages')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'pages'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4 inline-block ml-2" />
                  اضافة صفحة
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('blog')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'blog'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block ml-2" />
                  المدونة
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('staff')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'staff'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 inline-block ml-2" />
                  إدارة الموظفين
                </button>
              )}
            </nav>

            {/* User Menu */}
            <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('overview')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 inline-block ml-2" />
                  الرئيسية
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('products')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'products'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4 inline-block ml-2" />
                  المنتجات والخدمات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('myservices')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'myservices'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4 inline-block ml-2" />
                  خدماتي
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('categories')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'categories'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4 inline-block ml-2" />
                  التصنيفات
                </button>
              )}
              <button
                onClick={() => switchTab('orders')}
                className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentTab === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline-block ml-2" />
                الطلبات
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('customers')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'customers'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 inline-block ml-2" />
                  العملاء
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('coupons')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'coupons'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Gift className="w-4 h-4 inline-block ml-2" />
                  الكوبونات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('shipping')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'shipping'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Truck className="w-4 h-4 inline-block ml-2" />
                  الشحن
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('analytics')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'analytics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline-block ml-2" />
                  التحليلات
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('invoices')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'invoices'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block ml-2" />
                  الفواتير
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('pages')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'pages'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4 inline-block ml-2" />
                  اضافة صفحة
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('blog')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'blog'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block ml-2" />
                  المدونة
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('staff')}
                  className={`block w-full text-right px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTab === 'staff'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 inline-block ml-2" />
                  إدارة الموظفين
                </button>
              )}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleLogout}
                  className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 inline-block ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - White Theme */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div>  
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currentTab === 'overview' && 'نظرة عامة'}
                    {currentTab === 'products' && 'إدارة المنتجات'}
                    {currentTab === 'products' && 'إدارة المنتجات والخدمات'}
                    {currentTab === 'myservices' && 'خدماتي'}
                    {currentTab === 'categories' && 'إدارة التصنيفات'}
                    {currentTab === 'orders' && 'إدارة الطلبات'}
                    {currentTab === 'customers' && 'إدارة العملاء'}
                    {currentTab === 'coupons' && 'إدارة الكوبونات'}
                    {currentTab === 'shipping' && 'إدارة الشحن والتوصيل'}
                    {currentTab === 'analytics' && 'التحليلات والإحصائيات'}
                    {currentTab === 'pages' && 'إدارة الصفحات الثابتة'}
                    {currentTab === 'blog' && 'إدارة المدونة'}
                    {currentTab === 'staff' && 'إدارة الموظفين'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    آخر تحديث: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Stats Badges */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center text-green-700">
                      <Circle className="w-2 h-2 fill-current mr-2" />
                      <span className="text-xs font-medium">متصل</span>
                    </div>
                  </div>
                  
                  {currentTab === 'orders' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <div className="flex items-center text-blue-700">
                        <span className="text-xs font-medium">{stats.pendingOrders} طلب معلق</span>
                      </div>
                    </div>
                  )}
                  
                  {(currentTab === 'products' || currentTab === 'services') && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <div className="flex items-center text-orange-700">
                        <span className="text-xs font-medium">{stats.unavailableServices} غير متاح</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Services Tab */}
          {currentTab === 'services' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">المنتجات والخدمات</h2>
                  <p className="text-gray-600">إدارة وتنظيم منتجات وخدمات المتجر</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/admin/service/add"
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة خدمة جديدة
                  </Link>
                  <button 
                    onClick={fetchServices}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    تحديث
                  </button>

                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات/الخدمات</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{stats.unavailableServices}</div>
                      <div className="text-sm text-gray-500">منتجات/خدمات غير متاحة</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Circle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">{stats.availableServices}</div>
                      <div className="text-sm text-gray-500">منتجات/خدمات محدودة</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{(stats.totalValue || 0).toFixed(0)}</div>
                      <div className="text-sm text-gray-500">قيمة المنتجات/الخدمات (ر.س)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث عن خدمة..."
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Services List - Mobile First Design */}
              {filteredServices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة خدمات جديدة لمتجرك</p>
                  <Link
                    to="/admin/service/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول خدمة
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {filteredServices.map((service) => {
                      const categoryName = service.categories && service.categories.length > 0 
                        ? service.categories.map(catId => categories.find(cat => cat.id === catId)?.name).filter(Boolean).join(', ') || 'غير محدد'
                        : 'غير محدد';
                      const stockStatus = service.status === 'inactive' ? 'غير متاح' : 'متاح';
                const stockColor = service.status === 'inactive' ? 'text-red-600' : 'text-green-600';
                const stockBg = service.status === 'inactive' ? 'bg-red-50' : 'bg-green-50';
                      
                      return (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {service.mainImage ? (
                                <img 
                                  src={buildImageUrl(service.mainImage)}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{service.name}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.homeShortDescription || service.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                  {categoryName}
                                </span>
                                <span className={`${stockBg} ${stockColor} px-2 py-1 rounded-md text-xs font-medium`}>
                                  {stockStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-gray-500 text-sm">السعر</span>
                              <div className="font-bold text-lg text-black">{(service.basePrice || service.originalPrice || 0).toFixed(2)} ر.س</div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">الحالة</span>
                              <div className="font-bold text-lg">{service.status === 'active' ? 'متاح' : 'غير متاح'}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">النوع</span>
                              <div className="font-medium text-sm">خدمة</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/admin/service/edit/${service.id}`}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => openDeleteModal('product', service.id, service.name)}
                              className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">المنتج/الخدمة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">التصنيف</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">السعر</th>

                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredServices.map((service) => {
                            const categoryName = service.categories && service.categories.length > 0 
                              ? service.categories.map(catId => categories.find(cat => cat.id === catId)?.name).filter(Boolean).join(', ') || 'غير محدد'
                              : 'غير محدد';
                            const stockStatus = service.status === 'inactive' ? 'غير متاح' : 'متاح';
                const stockColor = service.status === 'inactive' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
                            
                            return (
                              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 ml-4 flex-shrink-0">
                                      {service.mainImage ? (
                                        <img 
                                          src={buildImageUrl(service.mainImage)}
                                          alt={service.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">{service.name}</div>
                                      <div className="text-sm text-gray-500 max-w-xs truncate">{service.homeShortDescription || service.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {categoryName}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-black">{(service.basePrice || service.originalPrice || 0).toFixed(2)} ر.س</div>
                                  {service.originalPrice && (
                                    <div className="text-sm text-gray-500 line-through">{(service.originalPrice || 0).toFixed(2)} ر.س</div>
                                  )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${stockColor}`}>
                                    {stockStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/admin/service/edit/${service.id}`}
                                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                      onClick={() => openDeleteModal('product', service.id, service.name)}
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {currentTab === 'customers' && currentUser?.role === 'admin' && (
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">العملاء</h2>
                  <p className="text-gray-500">إدارة ومتابعة بيانات العملاء المسجلين ونشاطهم</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                    <span className="text-gray-600 text-sm">إجمالي العملاء: </span>
                    <span className="font-bold text-blue-600">{customers.length}</span>
                  </div>
                  {customerStats && (
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                      <span className="text-gray-600 text-sm">النشطين: </span>
                      <span className="font-bold text-green-600">{customerStats.active}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Stats Cards */}
              {customerStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">👥</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.total}</div>
                        <div className="text-sm text-gray-500">عميل</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">إجمالي العملاء</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🛒</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.thisMonth}</div>
                        <div className="text-sm text-gray-500">خدمة</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">في الشهر</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">❤️</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.totalWishlistItems}</div>
                        <div className="text-sm text-gray-500">خدمة</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">في المفضلة</div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{customerStats.avgCartItems}</div>
                        <div className="text-sm text-gray-500">متوسط</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">خدمات/عربة</div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في العملاء..."
                    value={customerSearchTerm}
                    onChange={handleCustomerSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل بيانات العملاء...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <div className="text-red-500 mb-4">❌</div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={() => fetchCustomers(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* Customers Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCustomers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="text-gray-500">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">لا يوجد عملاء مسجلين</p>
                        <p className="text-gray-500 text-sm mb-6">سيظهر العملاء هنا عند التسجيل عبر النظام الجديد</p>
                        <button 
                          onClick={() => fetchCustomers(true)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تحديث البيانات
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredCustomers.map(customer => (
                      <div key={customer.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {customer.fullName?.[0] || customer.firstName?.[0] || customer.name?.[0] || '؟'}
                          </div>
                          <div className="mr-3 flex-1">
                            <h3 className="font-bold text-lg text-gray-800">
                              {customer.fullName || 
                               (customer.firstName && customer.lastName 
                                ? `${customer.firstName} ${customer.lastName}`
                                : customer.name || 'غير محدد'
                               )}
                            </h3>
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                              {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{customer.email}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{customer.phone || 'غير محدد'}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                            <span>
                              تاريخ التسجيل: {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Activity Stats */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">نشاط العميل</span>
                            <div className="flex space-x-2">
                              {customer.hasCart && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="لديه منتجات في العربة"></div>
                              )}
                              {customer.hasWishlist && (
                                <div className="w-2 h-2 bg-pink-500 rounded-full" title="لديه منتجات في المفضلة"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{customer.cartItemsCount || 0}</div>
                              <div className="text-xs text-gray-500">عربة التسوق</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-pink-600">{customer.wishlistItemsCount || 0}</div>
                              <div className="text-xs text-gray-500">المفضلة</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{customer.totalOrders || 0}</div>
                              <div className="text-xs text-gray-500">الطلبات</div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-500">آخر دخول:</span>
                            <span className="font-medium text-gray-700">
                              {customer.lastLogin 
                                ? new Date(customer.lastLogin).toLocaleDateString('ar-SA')
                                : 'لم يسجل دخول'
                              }
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <button 
                              onClick={() => openCustomerDetailsModal(customer)}
                              className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              عرض التفاصيل
                            </button>
                            <button 
                              onClick={() => openCustomerEditModal(customer)}
                              className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => toggleCustomerStatus(customer.id, customer.status || 'active')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                customer.status === 'active' 
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {customer.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => openDeleteModal('customer', customer.id, customer.fullName || customer.name || customer.email)}
                              className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* My Services Tab */}
          {currentTab === 'myservices' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">خدماتي</h2>
                  <p className="text-gray-600">إدارة وتنظيم خدماتي الشخصية</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/admin/service/add"
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة خدمة جديدة
                  </Link>
                  <button 
                    onClick={() => fetchMyServices(true)}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={myServicesLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ml-2 ${myServicesLoading ? 'animate-spin' : ''}`} />
                    {myServicesLoading ? 'جاري التحديث...' : 'تحديث'}
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="البحث في الخدمات..."
                        value={myServicesSearchTerm}
                        onChange={handleMyServicesSearch}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm">
                      <option value="">جميع الحالات</option>
                      <option value="available">متاح</option>
                      <option value="inactive">غير متاح</option>
                    </select>
                    <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm">
                      <option value="">جميع التصنيفات</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {myServicesLoading && (
                <div className="text-center py-16">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">جاري تحميل الخدمات...</p>
                </div>
              )}

              {/* Error State */}
              {myServicesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">خطأ في تحميل البيانات</h3>
                  <p className="text-red-700 mb-4">{myServicesError}</p>
                  <button
                    onClick={() => fetchMyServices(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* Services Grid */}
              {!myServicesLoading && !myServicesError && filteredMyServices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyServices.map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="aspect-video bg-gray-200 relative">
                        <img 
                          src={buildImageUrl(service.mainImage) || 'https://via.placeholder.com/400x225'} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            service.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.status === 'active' ? 'متاح' : 'غير متاح'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {service.homeShortDescription || service.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-bold text-gray-900">
                             {service.basePrice ? `${service.basePrice} ج.م` : 'السعر غير محدد'}
                           </div>
                          <div className="text-sm text-gray-500">
                            تصنيف: {service.categories && service.categories.length > 0 
                              ? service.categories.map(catId => categories.find(cat => cat.id === catId || cat.id?.toString() === catId?.toString())?.name).filter(Boolean).join(', ') || 'عام'
                              : 'عام'} 
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/service/${service.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                          >
                            <Eye className="w-4 h-4 inline-block ml-1" />
                            عرض
                          </Link>
                          <Link
                            to={`/admin/service/edit/${service.id}`}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                          >
                            <Edit className="w-4 h-4 inline-block ml-1" />
                            تعديل
                          </Link>
                          <button 
                            onClick={() => openDeleteModal('service', service.id, service.name)}
                            className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!myServicesLoading && !myServicesError && filteredMyServices.length === 0 && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {myServicesSearchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد خدمات'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {myServicesSearchTerm ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة خدمتك الأولى'}
                  </p>
                  {!myServicesSearchTerm && (
                     <Link
                       to="/admin/service/add"
                       className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                     >
                       <Plus className="w-4 h-4 ml-2" />
                       إضافة خدمة جديدة
                     </Link>
                   )}
                 </div>
               )}
            </div>
          )}

          {/* Categories Tab */}
          {currentTab === 'categories' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">التصنيفات</h2>
                  <p className="text-gray-600">تنظيم وإدارة فئات المنتجات</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة تصنيف جديد
                  </Link>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في التصنيفات..."
                    value={categorySearchTerm}
                    onChange={handleCategorySearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories Grid */}
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تصنيفات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة تصنيفات لتنظيم خدماتك</p>
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول تصنيف
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map(category => {
                    const categoryProductsCount = products.filter((p: Product) => p.categoryId?.toString() === category.id?.toString()).length;
                    const categoryServicesCount = 0; // Services count placeholder
                    
                    return (
                      <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 overflow-hidden">
                          {category.image ? (
                            <img 
                              src={buildImageUrl(category.image)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <Grid className="w-16 h-16 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                              {categoryProductsCount} خدمة
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-6 line-clamp-2">{category.description}</p>
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/category/edit/${category.id}`}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => openDeleteModal('category', category.id, category.name)}
                              className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">الطلبات</h2>
                  <p className="text-gray-600">متابعة ومعالجة جميع طلبات العملاء</p>
                </div>
                <button
                  onClick={() => fetchOrders(true)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'في الانتظار', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                  { label: 'مؤكد', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                  { label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-purple-50 border-purple-200 text-purple-800' },
                  { label: 'تم الشحن', count: orders.filter(o => o.status === 'shipped').length, color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
                  { label: 'تم التسليم', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-50 border-green-200 text-green-800' },
                  { label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-50 border-red-200 text-red-800' }
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} border rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold mb-1">{stat.count}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الطلبات..."
                      value={orderSearchTerm}
                      onChange={handleOrderSearch}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={handleOrderStatusFilter}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm bg-white"
                  >
                    <option value="all">جميع الطلبات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="preparing">قيد التحضير</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <div className="text-sm text-gray-600 flex items-center">
                    عرض {filteredOrders.length} من {orders.length} طلب
                  </div>
                </div>
              </div>

              {/* Orders List - Mobile First */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">طلب #{order.id}</h3>
                            <p className="text-gray-600 text-sm">{order.customerName}</p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-gray-600 text-sm">المبلغ الإجمالي</span>
                            <div className="font-bold text-lg text-black">{(order.total || 0).toFixed(2)} ر.س</div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">عدد الخدمات</span>
                            <div className="font-bold text-lg text-black">{order.items.length}</div>
                          </div>
                        </div>

                        {/* Order Notes Section */}
                        <div className="mb-4">
                          <span className="text-gray-600 text-sm">الملاحظات</span>
                          {editingOrderNotes === order.id.toString() ? (
                            <div className="mt-2">
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="أضف ملاحظة..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                                rows={3}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSaveOrderNotes(order.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={handleCancelEditOrderNotes}
                                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border min-h-[40px] cursor-pointer hover:bg-gray-100" 
                                   onClick={() => handleEditOrderNotes(order.id)}>
                                {order.notes || 'اضغط لإضافة ملاحظة...'}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                          <button
                            onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                            className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">رقم الطلب</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">العميل</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">المبلغ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الملاحظات</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">التاريخ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-gray-900">#{order.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium text-gray-900">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-black">{(order.total || 0).toFixed(2)} ر.س</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.status || 'pending'}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className={`text-sm font-medium px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}
                                >
                                  <option value="pending">قيد المراجعة</option>
                                  <option value="confirmed">مؤكد</option>
                                  <option value="preparing">قيد التحضير</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="delivered">تم التسليم</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                {editingOrderNotes === order.id.toString() ? (
                                  <div className="w-48">
                                    <textarea
                                      value={tempNotes}
                                      onChange={(e) => setTempNotes(e.target.value)}
                                      placeholder="أضف ملاحظة..."
                                      className="w-full p-2 border border-gray-300 rounded text-xs"
                                      rows={2}
                                    />
                                    <div className="flex gap-1 mt-1">
                                      <button
                                        onClick={() => handleSaveOrderNotes(order.id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                      >
                                        حفظ
                                      </button>
                                      <button
                                        onClick={handleCancelEditOrderNotes}
                                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                      >
                                        إلغاء
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="w-48 text-xs text-gray-700 bg-gray-50 p-2 rounded border cursor-pointer hover:bg-gray-100 min-h-[32px] flex items-center"
                                    onClick={() => handleEditOrderNotes(order.id)}
                                  >
                                    {order.notes || 'اضغط لإضافة ملاحظة...'}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'تاريخ غير محدد'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openOrderModal(order)}
                                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupons Tab */}
          {currentTab === 'coupons' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">الكوبونات</h2>
                  <p className="text-gray-600">إدارة كوبونات الخصم والعروض</p>
                </div>
                <Link
                  to="/admin/coupon/add"
                  className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة كوبون جديد
                </Link>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في الكوبونات..."
                    value={couponSearchTerm}
                    onChange={handleCouponSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Coupons Grid */}
              {filteredCoupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد كوبونات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة كوبونات خصم جديدة</p>
                  <Link
                    to="/admin/coupon/add"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول كوبون
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCoupons.map(coupon => (
                    <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">{coupon.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <div className="bg-black text-white font-bold text-xl px-4 py-3 rounded-lg text-center">
                            {coupon.code}
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <p className="text-gray-600 text-sm line-clamp-2">{coupon.description}</p>
                          
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">نوع الخصم:</span>
                              <span className="text-sm font-medium">
                                {coupon.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">قيمة الخصم:</span>
                              <span className="text-sm font-bold text-black">
                                {coupon.type === 'percentage' 
                                  ? `${coupon.value}%` 
                                  : `${coupon.value} ر.س`
                                }
                              </span>
                            </div>
                            {coupon.usageLimit && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">الاستخدام:</span>
                                <span className="text-sm">
                                  {coupon.usedCount || 0} / {coupon.usageLimit}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/coupon/edit/${coupon.id}`}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                          >
                            تعديل
                          </Link>
                          <button
                            onClick={() => openDeleteModal('coupon', coupon.id, coupon.name)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {currentTab === 'overview' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-black rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h2>
                    <p className="text-gray-300 mb-4">إليك نظرة شاملة على أداء متجرك اليوم</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleDateString('ar-SA')}
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
                      <div className="text-sm text-gray-500">إجمالي الخدمات</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${stats.unavailableServices > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    <span className="mr-1">{stats.unavailableServices > 0 ? '⚠️' : '✅'}</span>
                    {stats.unavailableServices} خدمات غير متاحة
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                      <div className="text-sm text-gray-500">إجمالي الطلبات</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {stats.pendingOrders} طلب معلق
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
                      <div className="text-sm text-gray-500">العملاء</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    عملاء نشطين
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{(stats.totalRevenue || 0).toFixed(0)}</div>
                      <div className="text-sm text-gray-500">إجمالي الإيرادات (ر.س)</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600">
                    متوسط الطلب: {(stats.averageOrderValue || 0).toFixed(0)} ر.س
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        أحدث الطلبات
                      </h3>
                      <button 
                        onClick={() => switchTab('orders')}
                        className="text-black hover:text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">لا توجد طلبات بعد</p>
                        </div>
                      ) : (
                        orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                               onClick={() => {setSelectedOrder(order); setIsOrderModalOpen(true);}}>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                                #{order.id}
                              </div>
                              <div className="mr-4">
                                <p className="font-medium text-gray-900">{order.customerName}</p>
                                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{(order.total || 0).toFixed(2)} ر.س</p>
                              <div className="text-sm text-gray-500">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'تاريخ غير محدد'}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Package className="w-5 h-5 ml-2" />
                        الخدمات الأكثر مبيعاً
                      </h3>
                      <button 
                        onClick={() => switchTab('services')}
                        className="text-black hover:text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-3">
                      {products.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">لا توجد خدمات بعد</p>
                        </div>
                      ) : (
                        products.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                #{index + 1}
                              </div>
                              <div className="mr-4">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">الحالة: {product.status === 'active' ? 'متاح' : 'غير متاح'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{(product.basePrice || product.originalPrice || 0).toFixed(2)} ر.س</p>
                              <p className="text-sm text-gray-500">خدمة</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Quick Stats and Actions */}
                <div className="space-y-6">
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Link
                        to="/admin/service/add"
                        className="flex items-center justify-center bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة خدمة
                      </Link>
                      <Link
                        to="/admin/category/add"
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Grid className="w-5 h-5 ml-2" />
                        إضافة تصنيف
                      </Link>
                      <button
                        onClick={() => switchTab('orders')}
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        إدارة الطلبات
                      </button>
                      <Link
                        to="/admin/coupon/add"
                        className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        <Tag className="w-5 h-5 ml-2" />
                        إضافة كوبون
                      </Link>
                    </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">تنبيهات المخزون</h3>
                    <div className="space-y-3">
                      {stats.unavailableServices > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-red-800">خدمات غير متاحة</p>
                              <p className="text-xs text-red-600">{stats.unavailableServices} خدمة غير متاحة</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {stats.availableServices > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <Circle className="w-5 h-5 text-yellow-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">خدمات متاحة</p>
                              <p className="text-xs text-yellow-600">{stats.availableServices} خدمة متاحة</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {stats.unavailableServices === 0 && stats.availableServices === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">الخدمات متاحة</p>
                              <p className="text-xs text-green-600">جميع الخدمات متوفرة</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Performance */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">أداء المتجر</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">معدل إتمام الطلبات</span>
                        <span className="font-bold text-green-600">
                          {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">قيمة الخدمات الإجمالية</span>
                        <span className="font-bold text-blue-600">{stats.totalValue.toLocaleString('ar-SA')} ر.س</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">عدد التصنيفات</span>
                        <span className="font-bold text-purple-600">{stats.totalCategories}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الكوبونات النشطة</span>
                        <span className="font-bold text-orange-600">{stats.activeCoupons}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {currentTab === 'shipping' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">إدارة الشحن والتوصيل</h2>
                  <p className="text-gray-600">إدارة مناطق الشحن وإعدادات التوصيل</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowShippingSettingsModal(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    الإعدادات العامة
                  </button>
                  <button
                    onClick={() => setShowShippingZoneModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منطقة شحن
                  </button>
                </div>
              </div>

              {/* Shipping Settings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingSettings.globalFreeShippingThreshold}</div>
                      <div className="text-sm text-gray-500">حد الشحن المجاني (ر.س)</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${shippingSettings.enableFreeShipping ? 'text-green-600' : 'text-red-600'}`}>
                    {shippingSettings.enableFreeShipping ? 'مفعل' : 'معطل'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingZones.length}</div>
                      <div className="text-sm text-gray-500">مناطق الشحن</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {shippingZones.filter(z => z.isActive).length} منطقة نشطة
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{shippingSettings.defaultShippingCost}</div>
                      <div className="text-sm text-gray-500">تكلفة الشحن الافتراضية (ر.س)</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${shippingSettings.enableExpressShipping ? 'text-green-600' : 'text-gray-600'}`}>
                    الشحن السريع: {shippingSettings.enableExpressShipping ? 'متاح' : 'غير متاح'}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في مناطق الشحن..."
                    value={shippingZoneSearchTerm}
                    onChange={handleShippingZoneSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Shipping Zones */}
              {loadingShipping ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">جاري تحميل مناطق الشحن</h3>
                  <p className="text-gray-600">يرجى الانتظار...</p>
                </div>
              ) : filteredShippingZones.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مناطق شحن</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة مناطق شحن جديدة لتنظيم خدمة التوصيل</p>
                  <button
                    onClick={() => setShowShippingZoneModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    disabled={loadingShipping}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول منطقة شحن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredShippingZones.map(zone => (
                    <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">{zone.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {zone.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">تكلفة الشحن:</span>
                              <span className="text-xl font-bold text-black">{zone.shippingCost} ر.س</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">مدة التوصيل:</span>
                              <span className="text-sm font-medium text-blue-600">{zone.estimatedDays}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingShippingZone(zone);
                              setShowShippingZoneModal(true);
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                            disabled={loadingShipping}
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => openDeleteModal('shippingZone', zone.id, zone.name)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            disabled={loadingShipping}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {currentTab === 'analytics' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">تحليل شامل لأداء المتجر والمبيعات</p>
                </div>
              </div>

              {/* Analytics Cards */}
              {analyticsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="text-right">
                          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Daily Sales */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {analyticsData?.dailySales?.[analyticsData.dailySales.length - 1]?.sales?.toLocaleString('ar-SA') || '0'}
                        </div>
                        <div className="text-sm text-gray-500">المبيعات اليومية (ر.س)</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {analyticsData?.dailySalesGrowth ? `+${analyticsData.dailySalesGrowth}%` : '+0%'} من الأمس
                    </div>
                  </div>

                  {/* Monthly Sales */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {analyticsData?.monthlySales?.[analyticsData.monthlySales.length - 1]?.sales?.toLocaleString('ar-SA') || '0'}
                        </div>
                        <div className="text-sm text-gray-500">المبيعات الشهرية (ر.س)</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {analyticsData?.monthlySalesGrowth ? `+${analyticsData.monthlySalesGrowth}%` : '+0%'} من الشهر الماضي
                    </div>
                  </div>

                  {/* Daily Visitors */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {analyticsData?.dailyVisitors?.[analyticsData.dailyVisitors.length - 1]?.visitors?.toLocaleString('ar-SA') || '0'}
                        </div>
                        <div className="text-sm text-gray-500">الزوار اليوم</div>
                      </div>
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      {analyticsData?.visitorsGrowth ? `+${analyticsData.visitorsGrowth}%` : '+0%'} من الأمس
                    </div>
                  </div>

                  {/* Services Sold */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {analyticsData?.servicesSold?.total || '0'}
                        </div>
                        <div className="text-sm text-gray-500">الخدمات المباعة</div>
                      </div>
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      {analyticsData?.servicesSoldGrowth ? `+${analyticsData.servicesSoldGrowth}%` : '+0%'} من الأمس
                    </div>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <div className="flex justify-end">
                <button
                  onClick={updateAnalyticsStats}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث الإحصائيات
                </button>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Services */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">أعلى الخدمات مبيعاً</h3>
                  <div className="space-y-4">
                    {analyticsData?.topSellingServices?.length > 0 ? (
                      analyticsData.topSellingServices.map((service: any, index: number) => (
                        <div key={service.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500">{service.price} ر.س</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{service.sales} مبيعة</div>
                            <div className="text-sm text-gray-500">{service.revenue?.toLocaleString('ar-SA')} ر.س</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      products.slice(0, 5).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.basePrice || product.originalPrice || 0} ر.س</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">0 مبيعة</div>
                            <div className="text-sm text-gray-500">0 ر.س</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Coupon Usage Report */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">تقارير الكوبونات المستخدمة</h3>
                  <div className="space-y-4">
                    {analyticsData?.couponUsageReports?.length > 0 ? (
                      analyticsData.couponUsageReports.map((coupon: any, index: number) => (
                        <div key={coupon.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Tag className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{coupon.code}</div>
                              <div className="text-sm text-gray-500">
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} ر.س`} خصم
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{coupon.usageCount || 0} استخدام</div>
                            <div className={`text-sm font-medium ${
                              coupon.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {coupon.isActive ? 'نشط' : 'منتهي'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      coupons.slice(0, 5).map((coupon, index) => (
                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Tag className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{coupon.code}</div>
                              <div className="text-sm text-gray-500">
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} ر.س`} خصم
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">0 استخدام</div>
                            <div className={`text-sm font-medium ${
                              coupon.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {coupon.isActive ? 'نشط' : 'منتهي'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Sales Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg border border-blue-200 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        رحلة نجاحك عبر السنة
                      </h3>
                      <p className="text-gray-600 text-sm">مخطط المبيعات والطلبات الشهرية - كل شهر قصة نجاح جديدة</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {monthlyStats?.reduce((total: number, stat: any) => total + (stat.totalSales || 0), 0)?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">إجمالي المبيعات السنوية (ر.س)</div>
                    </div>
                  </div>
                  
                  <div className="h-96 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={monthlyStats?.length > 0 ? monthlyStats.map((stat: any) => ({
                          month: stat.month,
                          sales: stat.totalSales || 0,
                          orders: stat.totalOrders || 0
                        })) : [
                          { month: 'يناير', sales: 0, orders: 0 },
                          { month: 'فبراير', sales: 0, orders: 0 },
                          { month: 'مارس', sales: 0, orders: 0 },
                          { month: 'أبريل', sales: 0, orders: 0 },
                          { month: 'مايو', sales: 0, orders: 0 },
                          { month: 'يونيو', sales: 0, orders: 0 },
                          { month: 'يوليو', sales: 0, orders: 0 },
                          { month: 'أغسطس', sales: 0, orders: 0 },
                          { month: 'سبتمبر', sales: 0, orders: 0 },
                          { month: 'أكتوبر', sales: 0, orders: 0 },
                          { month: 'نوفمبر', sales: 0, orders: 0 },
                          { month: 'ديسمبر', sales: 0, orders: 0 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6B7280"
                          fontSize={12}
                          fontWeight={500}
                          tick={{ fill: '#6B7280' }}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          fontSize={12}
                          fontWeight={500}
                          tick={{ fill: '#6B7280' }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: any, name: string) => [
                            name === 'sales' ? `${value.toLocaleString()} ر.س` : `${value} طلب`,
                            name === 'sales' ? '💰 المبيعات' : '📦 الطلبات'
                          ]}
                          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="url(#salesGradient)" 
                          name="💰 المبيعات (ر.س)"
                          radius={[4, 4, 0, 0]}
                          stroke="#3B82F6"
                          strokeWidth={1}
                        />
                        <Bar 
                          dataKey="orders" 
                          fill="url(#ordersGradient)" 
                          name="📦 عدد الطلبات"
                          radius={[4, 4, 0, 0]}
                          stroke="#10B981"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Success metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {monthlyStats?.reduce((total: number, stat: any) => total + (stat.totalOrders || 0), 0) || 0}
                      </div>
                      <div className="text-xs text-gray-600">إجمالي الطلبات</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {monthlyStats?.reduce((total: number, stat: any) => total + (stat.newCustomers || 0), 0) || 0}
                      </div>
                      <div className="text-xs text-gray-600">عملاء جدد</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {monthlyStats?.reduce((total: number, stat: any) => total + (stat.productsSold || 0), 0) || 0}
                      </div>
                      <div className="text-xs text-gray-600">منتجات مباعة</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {monthlyStats?.length > 0 ? 
                          Math.round(monthlyStats.reduce((total: number, stat: any) => total + (stat.averageOrderValue || 0), 0) / monthlyStats.length) 
                          : 0
                        }
                      </div>
                      <div className="text-xs text-gray-600">متوسط قيمة الطلب</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Conversion Rate */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {analyticsData?.conversionRate ? `${analyticsData.conversionRate.toFixed(1)}%` : '3.2%'}
                      </div>
                      <div className="text-sm text-gray-500">معدل التحويل</div>
                    </div>
                  </div>
                  <div className="text-sm text-indigo-600 font-medium">
                    +0.5% من الشهر الماضي
                  </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {analyticsData?.averageOrderValue ? analyticsData.averageOrderValue.toFixed(0) : getStoreStats().averageOrderValue.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-500">متوسط قيمة الطلب (ر.س)</div>
                    </div>
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">
                    +7% من الشهر الماضي
                  </div>
                </div>

                {/* Customer Retention */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {analyticsData?.customerRetention ? `${analyticsData.customerRetention.toFixed(0)}%` : '68%'}
                      </div>
                      <div className="text-sm text-gray-500">معدل الاحتفاظ بالعملاء</div>
                    </div>
                  </div>
                  <div className="text-sm text-pink-600 font-medium">
                    +3% من الشهر الماضي
                  </div>
                </div>
              </div>

              {/* Daily Statistics Table */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">الإحصائيات اليومية</h3>
                  <button
                    onClick={() => updateAnalyticsStats()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    تحديث
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">التاريخ</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">إجمالي الطلبات</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">إجمالي المبيعات</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">عملاء جدد</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">متوسط قيمة الطلب</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">المنتجات المباعة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsLoading ? (
                        Array.from({ length: 7 }).map((_, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                            <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          </tr>
                        ))
                      ) : dailyStats?.length > 0 ? (
                        dailyStats.slice(0, 30).map((stat: any, index: number) => (
                          <tr key={stat.date || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              {new Date(stat.date).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {stat.totalOrders || 0}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {(stat.totalSales || 0).toLocaleString()} ر.س
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {stat.newCustomers || 0}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {(stat.averageOrderValue || 0).toLocaleString()} ر.س
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {stat.productsSold || 0}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                            لا توجد بيانات إحصائية متاحة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {currentTab === 'invoices' && currentUser?.role === 'admin' && (
            <InvoiceManagement orders={orders} />
          )}

          {/* Blog Tab */}
          {currentTab === 'blog' && currentUser?.role === 'admin' && (
            <BlogManagement />
          )}

          {/* Staff Tab */}
          {currentTab === 'staff' && currentUser?.role === 'admin' && (
            <StaffManagement currentUser={currentUser} />
          )}

          {/* Pages Tab */}
          {currentTab === 'pages' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">الصفحات الثابتة</h2>
                  <p className="text-gray-600">إنشاء وإدارة صفحات المحتوى الثابت مثل "من نحن" و "سياسة الخصوصية"</p>
                </div>
                <button
                  onClick={() => openPageModal()}
                  className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة صفحة جديدة
                </button>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث في الصفحات..."
                    value={pageSearchTerm}
                    onChange={handlePageSearch}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pages List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {filteredStaticPages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            العنوان
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الرابط
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            في الفوتر
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ الإنشاء
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStaticPages.map((page) => (
                          <tr key={page.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{page.title}</div>
                              {page.metaDescription && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{page.metaDescription}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-mono">/{page.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                page.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {page.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                page.showInFooter
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {page.showInFooter ? 'نعم' : 'لا'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(page.createdAt).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openPageModal(page)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deletePage(page.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد صفحات</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {pageSearchTerm ? 'لا توجد صفحات تطابق البحث' : 'ابدأ بإنشاء صفحة جديدة'}
                    </p>
                    {!pageSearchTerm && (
                      <div className="mt-6">
                        <button
                          onClick={() => openPageModal()}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة صفحة جديدة
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={closeOrderModal}
          onStatusUpdate={handleOrderStatusUpdate}
          onAddNote={handleAddOrderNote}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        title={`حذف ${
          deleteModal.type === 'product' ? 'الخدمة' :
          deleteModal.type === 'category' ? 'التصنيف' :
          deleteModal.type === 'order' ? 'الطلب' :
          deleteModal.type === 'customer' ? 'العميل' :
          deleteModal.type === 'coupon' ? 'الكوبون' :
          'منطقة الشحن'
        }`}
        message={`هل أنت متأكد من حذف "${deleteModal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        loading={deleteModal.loading}
      />

      {/* Shipping Zone Modal */}
      {showShippingZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingShippingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowShippingZoneModal(false);
                    setEditingShippingZone(null);
                    setNewShippingZone({
                      name: '',
                      description: '',
                      cities: [],
                      shippingCost: 0,
                      freeShippingThreshold: 0,
                      estimatedDays: '2-3 أيام',
                      isActive: true,
                      priority: 1
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنطقة *</label>
                <input
                  type="text"
                  value={editingShippingZone?.name || newShippingZone.name || ''}
                  onChange={(e) => {
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, name: e.target.value});
                    } else {
                      setNewShippingZone({...newShippingZone, name: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="مثال: الرياض الكبرى"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن (ر.س) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingShippingZone?.shippingCost || newShippingZone.shippingCost || 0}
                  onChange={(e) => {
                    const cost = parseFloat(e.target.value) || 0;
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, shippingCost: cost});
                    } else {
                      setNewShippingZone({...newShippingZone, shippingCost: cost});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مدة التوصيل *</label>
                <input
                  type="text"
                  value={editingShippingZone?.estimatedDays || newShippingZone.estimatedDays || ''}
                  onChange={(e) => {
                    if (editingShippingZone) {
                      setEditingShippingZone({...editingShippingZone, estimatedDays: e.target.value});
                    } else {
                      setNewShippingZone({...newShippingZone, estimatedDays: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="مثال: 2-3 أيام"
                  required
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowShippingZoneModal(false);
                  setEditingShippingZone(null);
                  setNewShippingZone({
                    name: '',
                    description: '',
                    cities: [],
                    shippingCost: 0,
                    freeShippingThreshold: 0,
                    estimatedDays: '2-3 أيام',
                    isActive: true,
                    priority: 1
                  });
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={editingShippingZone ? handleUpdateShippingZone : handleAddShippingZone}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingShipping || 
                         !(editingShippingZone?.name || newShippingZone.name) || 
                         !(editingShippingZone?.shippingCost || newShippingZone.shippingCost) ||
                         !(editingShippingZone?.estimatedDays || newShippingZone.estimatedDays)}
              >
                {loadingShipping ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    {editingShippingZone ? 'جاري التحديث...' : 'جاري الإضافة...'}
                  </div>
                ) : (
                  editingShippingZone ? 'تحديث' : 'إضافة'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings Modal */}
      {showShippingSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">إعدادات الشحن العامة</h3>
                <button
                  onClick={() => setShowShippingSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للشحن المجاني (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.globalFreeShippingThreshold}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      globalFreeShippingThreshold: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن الافتراضية (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.defaultShippingCost}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      defaultShippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تكلفة الشحن السريع (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.expressShippingCost}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      expressShippingCost: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مدة الشحن السريع</label>
                  <input
                    type="text"
                    value={shippingSettings.expressShippingDays}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      expressShippingDays: e.target.value
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="مثال: 1-2 أيام"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">معدل ضريبة الشحن (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={shippingSettings.shippingTaxRate}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    shippingTaxRate: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableFreeShipping"
                    checked={shippingSettings.enableFreeShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableFreeShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableFreeShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن المجاني
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableZoneBasedShipping"
                    checked={shippingSettings.enableZoneBasedShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableZoneBasedShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableZoneBasedShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن حسب المنطقة
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableExpressShipping"
                    checked={shippingSettings.enableExpressShipping}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      enableExpressShipping: e.target.checked
                    })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="enableExpressShipping" className="mr-2 text-sm text-gray-700">
                    تفعيل الشحن السريع
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowShippingSettingsModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateShippingSettings}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingShipping}
              >
                {loadingShipping ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الحفظ...
                  </div>
                ) : (
                  'حفظ الإعدادات'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {isCustomerDetailsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">تفاصيل العميل</h2>
                <button
                  onClick={closeCustomerDetailsModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedCustomer.fullName?.[0] || selectedCustomer.firstName?.[0] || selectedCustomer.name?.[0] || '؟'}
                  </div>
                  <div className="mr-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedCustomer.fullName || 
                       (selectedCustomer.firstName && selectedCustomer.lastName 
                        ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                        : selectedCustomer.name || 'غير محدد'
                       )}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCustomer.status === 'active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {selectedCustomer.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 ml-2 text-blue-500" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-5 h-5 ml-2 text-green-500" />
                    <span>{selectedCustomer.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 ml-2 text-red-500" />
                    <span>{selectedCustomer.city || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 ml-2 text-purple-500" />
                    <span>تاريخ التسجيل: {new Date(selectedCustomer.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{customerOrders.length}</div>
                  <div className="text-sm text-gray-600">إجمالي الطلبات</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {customerOrders.reduce((total, order) => total + order.total, 0).toFixed(2)} ر.س
                  </div>
                  <div className="text-sm text-gray-600">إجمالي الإنفاق</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {customerOrders.length > 0 ? (customerOrders.reduce((total, order) => total + order.total, 0) / customerOrders.length).toFixed(2) : '0.00'} ر.س
                  </div>
                  <div className="text-sm text-gray-600">متوسط قيمة الطلب</div>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 ml-2" />
                  سجل الطلبات
                </h4>
                
                {loadingCustomerOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">جاري تحميل الطلبات...</p>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">لا توجد طلبات لهذا العميل</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {customerOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-800">طلب #{order.id}</span>
                            <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                              order.status === 'confirmed' ? 'bg-purple-100 text-purple-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {order.status === 'pending' ? 'في الانتظار' :
                               order.status === 'confirmed' ? 'مؤكد' :
                               order.status === 'preparing' ? 'قيد التحضير' :
                               order.status === 'shipped' ? 'تم الشحن' :
                               order.status === 'delivered' ? 'تم التسليم' :
                               order.status === 'cancelled' ? 'ملغي' : order.status}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-green-600">{order.total.toFixed(2)} ر.س</div>
                            <div className="text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'تاريخ غير محدد'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.length} منتج - {order.address}, {order.city}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeCustomerDetailsModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {isCustomerEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">تعديل بيانات العميل</h2>
                <button
                  onClick={closeCustomerEditModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={editingCustomer.fullName || editingCustomer.name || ''}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      fullName: e.target.value,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      email: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      phone: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      city: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
        
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة الحساب</label>
                  <select
                    value={editingCustomer.status || 'active'}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      status: e.target.value as 'active' | 'inactive'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeCustomerEditModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={updateCustomer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Page Modal */}
      <StaticPageModal
        isOpen={showPageModal}
        onClose={closePageModal}
        onSave={savePage}
        editingPage={editingPage}
      />


      {/* Toast Container */}
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};              

export default Dashboard;