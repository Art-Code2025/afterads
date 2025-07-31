import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api.js';

interface Category {
  id: string | number;
  name: string;
  description?: string;
}

interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  categoryId: string | number | null;
  mainImage: string;
  detailedImages: string[];
  specifications: { key: string; value: string }[];
  productType: string;
  dynamicOptions: any[];
}

interface ProductFormProps {
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isEdit: propIsEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = propIsEdit || Boolean(id);

  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    categoryId: null,
    mainImage: '',
    detailedImages: [],
    specifications: [],
    productType: '',
    dynamicOptions: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // New specification state
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    console.log('🚀 [ProductForm] Component mounted, isEdit:', isEdit, 'id:', id);
    fetchCategories();
    
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [isEdit, id]);

  // Update image preview when formData.mainImage changes
  useEffect(() => {
    if (formData.mainImage) {
      setImagePreview(formData.mainImage);
    }
  }, [formData.mainImage]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setUploadingImage(true);
      
      console.log('📤 [ProductForm] Processing image:', file.name);
      
      // Convert to base64 directly
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        console.log('✅ [ProductForm] Image processed successfully');
        
        // Update form data
        setFormData({ ...formData, mainImage: result });
        setImagePreview(result);
        
        toast.success('تم تحميل الصورة بنجاح');
        setUploadingImage(false);
      };
      
      reader.onerror = () => {
        console.error('❌ [ProductForm] Error reading file');
        toast.error('فشل في قراءة الصورة');
        setUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('❌ [ProductForm] Error processing image:', error);
      toast.error('فشل في معالجة الصورة');
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      handleImageUpload(file);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('🔄 [ProductForm] Fetching categories...');
      
      const categories = await apiCall(API_ENDPOINTS.CATEGORIES);
      
      console.log('✅ [ProductForm] Categories loaded:', categories.length);
      setCategories(categories);
    } catch (error) {
      console.error('❌ [ProductForm] Error fetching categories:', error);
      toast.error('فشل في جلب التصنيفات');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      console.log('🔄 [ProductForm] Fetching product:', productId);
      
      const products = await apiCall(API_ENDPOINTS.PRODUCTS);
      
      console.log('📦 [ProductForm] All products loaded:', products.length);
      console.log('🔍 [ProductForm] Looking for product ID:', productId);
      
      const product = products.find((p: Product) => p.id && p.id.toString() === productId.toString());
      
      if (!product) {
        console.error('❌ [ProductForm] Product not found with ID:', productId);
        toast.error('المنتج غير موجود');
        navigate('/admin');
        return;
      }
      
      console.log('✅ [ProductForm] Product found:', product.name);
      setFormData(product);
      
    } catch (error) {
      console.error('❌ [ProductForm] Error fetching product:', error);
      toast.error('فشل في جلب بيانات المنتج');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare the data
      const productData = {
        ...formData,
        price: parseFloat(formData.price.toString()) || 0,
        originalPrice: parseFloat(formData.originalPrice?.toString() || '0') || 0,
        stock: parseInt(formData.stock?.toString() || '0') || 0,
        categoryId: formData.categoryId || null,
        mainImage: formData.mainImage || '',
        detailedImages: formData.detailedImages || [],
        specifications: formData.specifications || [],
        productType: formData.productType || '',
        dynamicOptions: formData.dynamicOptions || []
      };
      
      console.log('💾 [ProductForm] Saving product data:', productData);

      if (isEdit && id) {
        // Update existing product using PUT
        await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
          method: 'PUT',
          body: JSON.stringify(productData)
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        // Create new product using POST
        await apiCall(API_ENDPOINTS.PRODUCTS, {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      // Trigger refresh in main app
      window.dispatchEvent(new Event('productsUpdated'));
      navigate('/admin');
      
    } catch (error) {
      console.error('❌ [ProductForm] Error saving product:', error);
      toast.error(isEdit ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, { ...newSpec }]
      });
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-black">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Mobile Header */}
      <div className="bg-white border-b-2 border-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">
                {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {isEdit ? 'تحديث بيانات المنتج' : 'إنشاء منتج جديد في المتجر'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-black transition-colors text-sm sm:text-base border border-black px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              ← العودة للداشبورد
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">📦</span>
              معلومات المنتج الأساسية
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="عباية تخرج فاخرة"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  وصف المنتج *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 resize-none text-sm sm:text-base"
                  placeholder="وصف تفصيلي للمنتج..."
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  التصنيف
                </label>
                {loadingCategories ? (
                  <div className="flex items-center text-gray-600">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري تحميل التصنيفات...
                  </div>
                ) : (
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black text-sm sm:text-base"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">💰</span>
              السعر والمخزون
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  السعر الحالي (ر.س) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="299.99"
                  required
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  السعر الأصلي (ر.س)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="399.99"
                />
                <p className="text-xs text-gray-500 mt-1">للعروض والخصومات</p>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  الكمية المتاحة
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">🖼️</span>
              صور المنتج
            </h2>
            
            <div className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  الصورة الرئيسية *
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-black"
                    />
                  </div>
                )}
                
                {/* Upload Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div>
                    <label className="block w-full">
                      <div className="w-full px-4 py-3 border-2 border-dashed border-black rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {uploadingImage ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                            جاري الرفع...
                          </div>
                        ) : (
                          <div>
                            <div className="text-2xl mb-2">📤</div>
                            <div className="text-sm font-medium text-black">اختر صورة من الجهاز</div>
                            <div className="text-xs text-gray-500 mt-1">PNG, JPG, GIF حتى 10MB</div>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  
                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      أو أدخل رابط الصورة
                    </label>
                    <input
                      type="text"
                      value={formData.mainImage}
                      onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  نوع المنتج
                </label>
                <input
                  type="text"
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="عباية، أوشحة، كاب، إلخ..."
                />
              </div>
            </div>
          </div>

          {/* Specifications Card */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6 flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-sm mr-3">📋</span>
              مواصفات المنتج
            </h2>
            
            {/* Add New Specification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newSpec.key}
                onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                placeholder="اسم المواصفة (مثل: المقاس)"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpec.value}
                  onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500 text-sm sm:text-base"
                  placeholder="القيمة (مثل: XL)"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Current Specifications */}
            <div className="space-y-2">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 border border-black rounded-lg p-3">
                  <div className="flex-1">
                    <span className="text-black font-medium">{spec.key}:</span>
                    <span className="text-gray-700 mr-2">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    حذف
                  </button>
                </div>
              ))}
              {formData.specifications.length === 0 && (
                <p className="text-gray-500 text-sm">لا توجد مواصفات مضافة</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {isEdit ? 'تحديث المنتج' : 'إضافة المنتج'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;