import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  X,
  Save,
  AlertCircle,
  DollarSign,
  Star,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Menu,
  ChevronDown,
  Settings,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import { productsAPI, categoriesAPI, ordersAPI, couponsAPI, dashboardAPI, uploadAPI } from '../utils/api';
import { buildImageUrl } from '../config/api';

// Interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  mainImage: string;
  dynamicOptions?: any[];
  specifications?: any[];
  totalRevenue: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface Order {
  id: number;
  customerName?: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
  selectedOptions?: any;
}

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUses: number;
  endDate: string;
  isActive: boolean;
}

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryFile, setSelectedCategoryFile] = useState<File | null>(null);
  
  // Add mobile state
  const [activeMobileSection, setActiveMobileSection] = useState<'stats' | 'products' | 'categories' | 'orders' | 'coupons'>('stats');
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    mainImage: '',
    dynamicOptions: [],
    specifications: []
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxUses: 1,
    endDate: '',
    isActive: true
  });

  // Fetch functions using new Serverless APIs
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productsAPI.getAll();
      
      // The API returns a direct array, not a wrapped object
      if (Array.isArray(productsData)) {
        console.log('✅ Products loaded successfully:', productsData.length);
      setProducts(productsData);
      } else {
        console.error("API did not return an array for products:", productsData);
        setProducts([]);
        toast.error('فشل في تحميل المنتجات، البيانات المستلمة غير صالحة.');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
      toast.error('فشل في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoriesAPI.getAll();
      
      // The API returns a direct array, not a wrapped object
      if (Array.isArray(categoriesData)) {
        console.log('✅ Categories loaded successfully:', categoriesData.length);
      setCategories(categoriesData);
      } else {
        console.error("API did not return an array for categories:", categoriesData);
        setCategories([]);
        toast.error('فشل في تحميل التصنيفات، البيانات المستلمة غير صالحة.');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
      toast.error('فشل في جلب التصنيفات');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordersData = await ordersAPI.getAll();
      
      // The API returns a direct array, not a wrapped object
      if (Array.isArray(ordersData)) {
        console.log('✅ Orders loaded successfully:', ordersData.length);
      setOrders(ordersData);
      } else {
        console.error("API did not return an array for orders:", ordersData);
        setOrders([]);
        toast.error('فشل في تحميل الطلبات، البيانات المستلمة غير صالحة.');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
      toast.error('فشل في جلب الطلبات');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const couponsData = await couponsAPI.getAll();
      
      // The API returns a direct array, not a wrapped object
      if (Array.isArray(couponsData)) {
        console.log('✅ Coupons loaded successfully:', couponsData.length);
      setCoupons(couponsData);
      } else {
        console.error("API did not return an array for coupons:", couponsData);
        setCoupons([]);
        toast.error('فشل في تحميل الكوبونات، البيانات المستلمة غير صالحة.');
      }
    } catch (error) {
      console.error('❌ Error fetching coupons:', error);
      setCoupons([]);
      toast.error('فشل في جلب الكوبونات');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const statsData = await dashboardAPI.getStats();
      
      // Handle the response - it might be direct data or wrapped
      console.log('📊 Stats data received:', statsData);
      
      if (statsData && typeof statsData === 'object') {
        // Try to extract stats from different possible response formats
        const data = statsData.data || statsData;
        
        setStats({
          totalProducts: data.products?.total || data.totalProducts || 0,
          totalCustomers: data.insights?.recentOrders?.length || data.totalCustomers || 0,
          totalOrders: data.orders?.total || data.totalOrders || 0,
          totalRevenue: data.revenue?.total || data.totalRevenue || 0
        });
        
        console.log('✅ Stats updated successfully');
      } else {
        console.warn('⚠️ Unexpected stats response format:', statsData);
        // Set default values if response format is unexpected
        setStats({
          totalProducts: 0,
          totalCustomers: 0,
          totalOrders: 0,
          totalRevenue: 0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      toast.error('فشل في جلب الإحصائيات');
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Reset functions
  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0,
      mainImage: '',
      dynamicOptions: [],
      specifications: []
    });
    setSelectedFile(null);
  };

  // CRUD operations using new Serverless APIs
  const handleAddProduct = async () => {
    try {
      let imageUrl = '';
      
      // Handle image upload using base64 if a file is selected
      if (selectedFile) {
        try {
          console.log('📤 Converting image to base64...');
          imageUrl = await convertFileToBase64(selectedFile);
          console.log('✅ Image converted to base64 successfully');
        } catch (uploadError) {
          console.error('❌ Error converting image:', uploadError);
          toast.error('فشل في معالجة الصورة');
          return;
        }
      }

      const productData = {
        name: newProduct.name || '',
        description: newProduct.description || '',
        price: Number(newProduct.price) || 0,
        stock: Number(newProduct.stock) || 0,
        categoryId: newProduct.categoryId || null,
        mainImage: imageUrl,
        dynamicOptions: newProduct.dynamicOptions || [],
        specifications: newProduct.specifications || []
      };

      console.log('📦 Creating product with data:', { ...productData, mainImage: imageUrl ? 'base64_image' : 'no_image' });

      const newProductResponse = await productsAPI.create(productData);
      
      // API returns the product directly, not wrapped in success object
      console.log('✅ Product created successfully:', newProductResponse);
      setProducts([...products, newProductResponse]);
        setShowAddModal(false);
        resetNewProduct();
        toast.success('تم إضافة المنتج بنجاح');
      
      // Dispatch event to update homepage
      window.dispatchEvent(new CustomEvent('productCreated', { 
        detail: { product: newProductResponse } 
      }));
      
    } catch (error) {
      console.error('❌ Error adding product:', error);
      toast.error('خطأ في إضافة المنتج: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.mainImage;
      
      // Handle new image upload using base64 if a file is selected
      if (selectedFile) {
        try {
          console.log('📤 Converting new image to base64...');
          imageUrl = await convertFileToBase64(selectedFile);
          console.log('✅ New image converted to base64 successfully');
        } catch (uploadError) {
          console.error('❌ Error converting new image:', uploadError);
          toast.error('فشل في معالجة الصورة الجديدة');
          return;
        }
      }

      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        categoryId: Number(editingProduct.categoryId),
        mainImage: imageUrl,
        dynamicOptions: editingProduct.dynamicOptions || [],
        specifications: editingProduct.specifications || []
      };

      console.log('📦 Updating product with data:', { ...productData, mainImage: imageUrl ? 'image_present' : 'no_image' });

      const updatedProduct = await productsAPI.update(editingProduct.id, productData);
      
      // API returns the updated product directly, not wrapped in success object
      console.log('✅ Product updated successfully:', updatedProduct);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, mainImage: imageUrl } : p));
        setShowEditModal(false);
        setEditingProduct(null);
        setSelectedFile(null);
        toast.success('تم تحديث المنتج بنجاح');
      
      // Dispatch event to update homepage
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { product: updatedProduct } 
      }));
      
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast.error('خطأ في تحديث المنتج: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await productsAPI.delete(id);
      
      // API returns success directly, no wrapper needed
      console.log('✅ Product deleted successfully');
        setProducts(products.filter(p => p.id !== id));
        toast.success('تم حذف المنتج بنجاح');
      
      // Dispatch event to update homepage
      window.dispatchEvent(new CustomEvent('productDeleted', { 
        detail: { productId: id } 
      }));
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast.error('خطأ في حذف المنتج');
    }
  };

  const handleAddCategory = async () => {
    try {
      let imageUrl = '';
      
      // Handle image upload using base64 if a file is selected
      if (selectedCategoryFile) {
        try {
          console.log('📤 Converting category image to base64...');
          imageUrl = await convertFileToBase64(selectedCategoryFile);
          console.log('✅ Category image converted to base64 successfully');
        } catch (uploadError) {
          console.error('❌ Error converting category image:', uploadError);
          toast.error('فشل في معالجة صورة التصنيف');
          return;
        }
      }

      const categoryData = {
        ...newCategory,
        image: imageUrl
      };

      const newCategoryResponse = await categoriesAPI.create(categoryData);
      
      // API returns the category directly, no wrapper needed
      console.log('✅ Category created successfully:', newCategoryResponse);
        toast.success('تم إضافة الفئة بنجاح');
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '' });
        setSelectedCategoryFile(null);
        fetchCategories();
    } catch (error) {
      console.error('❌ Error adding category:', error);
      toast.error('خطأ في إضافة الفئة');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      await categoriesAPI.delete(id);
      
      // API returns success directly, no wrapper needed
      console.log('✅ Category deleted successfully');
        toast.success('تم حذف الفئة بنجاح');
        fetchCategories();
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      toast.error('خطأ في حذف الفئة');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const updatedOrder = await ordersAPI.update(orderId, { status: newStatus });
      
      // API returns the order directly, no wrapper needed
      console.log('✅ Order status updated successfully:', updatedOrder);
        toast.success('تم تحديث حالة الطلب');
        fetchOrders();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('خطأ في تحديث حالة الطلب');
    }
  };

  const handleAddCoupon = async () => {
    try {
      const newCouponResponse = await couponsAPI.create(newCoupon);
      
      // API returns the coupon directly, no wrapper needed
      console.log('✅ Coupon created successfully:', newCouponResponse);
        toast.success('تم إضافة الكوبون بنجاح');
        setShowAddCouponModal(false);
        setNewCoupon({
          code: '',
          type: 'percentage',
          value: 0,
          minOrderValue: 0,
          maxUses: 1,
          endDate: '',
          isActive: true
        });
        fetchCoupons();
    } catch (error) {
      console.error('❌ Error adding coupon:', error);
      toast.error('خطأ في إضافة الكوبون');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      await couponsAPI.delete(id);
      
      // API returns success directly, no wrapper needed
      console.log('✅ Coupon deleted successfully');
        toast.success('تم حذف الكوبون بنجاح');
        fetchCoupons();
    } catch (error) {
      console.error('❌ Error deleting coupon:', error);
      toast.error('خطأ في حذف الكوبون');
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('فشل في قراءة الملف'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('خطأ في قراءة الملف'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
    fetchCoupons();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-card {
              transition: all 0.2s ease-in-out;
              transform-origin: center;
            }
            .mobile-card:active {
              transform: scale(0.98);
            }
            
            .mobile-section-nav {
              position: sticky;
              top: 0;
              z-index: 30;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 12px;
            }
            
            .mobile-stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
          }
          
          .compact-text {
            font-size: 13px;
            line-height: 1.4;
          }
          
          .compact-title {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.3;
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      {/* Mobile Section Navigation */}
      <div className="mobile-section-nav block lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">لوحة التحكم</h1>
          <div className="relative">
            <select
              value={activeMobileSection}
              onChange={(e) => setActiveMobileSection(e.target.value as any)}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-6"
            >
              <option value="stats">الإحصائيات</option>
              <option value="products">المنتجات</option>
              <option value="categories">الفئات</option>
              <option value="orders">الطلبات</option>
              <option value="coupons">الكوبونات</option>
            </select>
            <ChevronDown className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 lg:p-6">
        {/* Desktop Title */}
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
        
        {/* Stats Cards */}
        <div className={`${activeMobileSection === 'stats' ? 'block' : 'hidden'} lg:block fade-in mb-4 lg:mb-6`}>
          <div className="mobile-stats-grid lg:grid lg:grid-cols-4 lg:gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-md lg:rounded-lg">
                  <Package className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">المنتجات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalProducts}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-green-100 rounded-md lg:rounded-lg">
                  <ShoppingCart className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">الطلبات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-purple-100 rounded-md lg:rounded-lg">
                  <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">الإيرادات</p>
                  {loadingStats ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 lg:p-4 mobile-card hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-1.5 lg:p-2 bg-yellow-100 rounded-md lg:rounded-lg">
                  <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <div className="mr-2 lg:mr-3 flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-0.5 lg:mb-1 truncate">الكوبونات</p>
                  {loadingCoupons ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-400 ml-1" />
                      <span className="text-xs text-gray-400">جاري...</span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-xl font-bold text-gray-900">{coupons.length}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple message for other sections */}
        <div className={`${activeMobileSection === 'products' ? 'block' : 'hidden'} lg:block fade-in`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة المنتجات</h2>
            <p className="text-gray-600">استخدم صفحة إدارة المنتجات المخصصة لإدارة المنتجات بشكل كامل.</p>
          </div>
        </div>

        <div className={`${activeMobileSection === 'categories' ? 'block' : 'hidden'} lg:block fade-in`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة التصنيفات</h2>
            <p className="text-gray-600">استخدم صفحة إدارة التصنيفات المخصصة لإدارة التصنيفات بشكل كامل.</p>
          </div>
        </div>

        <div className={`${activeMobileSection === 'orders' ? 'block' : 'hidden'} lg:block fade-in`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة الطلبات</h2>
            <p className="text-gray-600">استخدم صفحة إدارة الطلبات المخصصة لإدارة الطلبات بشكل كامل.</p>
          </div>
        </div>

        <div className={`${activeMobileSection === 'coupons' ? 'block' : 'hidden'} lg:block fade-in`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة الكوبونات</h2>
            <p className="text-gray-600">استخدم صفحة إدارة الكوبونات المخصصة لإدارة الكوبونات بشكل كامل.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 