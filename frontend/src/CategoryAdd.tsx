import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from './config/api';

const CategoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  // Convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image file selection
  const handleImageChange = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setFormData({ ...formData, image: '' }); // Clear URL input when file is selected
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setLoading(true);

    try {
      console.log('🔄 Creating category with data:', formData);
      
      let imageUrl = formData.image;
      
      // Handle image upload using base64 if a file is selected
      if (imageFile) {
        try {
          console.log('📤 Converting category image to base64...');
          imageUrl = await convertFileToBase64(imageFile);
          console.log('✅ Category image converted to base64 successfully');
        } catch (uploadError) {
          console.error('❌ Error converting category image:', uploadError);
          toast.error('فشل في معالجة صورة التصنيف');
          return;
        }
      }
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl || 'categories/default-category.jpg'
      };

      const result = await apiCall(API_ENDPOINTS.CATEGORIES, {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });

      console.log('✅ Category created successfully:', result);
      toast.success('تم إنشاء التصنيف بنجاح!');
      
      // Trigger a refresh in the main app
      window.dispatchEvent(new Event('categoriesUpdated'));
      navigate('/admin?tab=categories');
      
    } catch (error) {
      console.error('❌ Error creating category:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في إنشاء التصنيف';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" dir="rtl">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/admin?tab=categories" className="flex items-center text-gray-600 hover:text-orange-600 transition-colors text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى التصنيفات
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold ml-2 sm:ml-3">
                  +
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900">إضافة تصنيف جديد</h1>
                  <p className="text-xs sm:text-sm text-gray-500">إنشاء تصنيف جديد لتنظيم المنتجات</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              📂 إدارة التصنيفات
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-orange-600 text-xs sm:text-sm ml-2 sm:ml-3">📝</span>
                  معلومات التصنيف
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* اسم التصنيف */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    اسم التصنيف *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                    placeholder="أدخل اسم التصنيف"
                  />
                </div>

                {/* وصف التصنيف */}
                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    وصف التصنيف *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all duration-200 resize-none text-sm sm:text-base sm:rows-6"
                    placeholder="أدخل وصف مفصل للتصنيف وما يحتويه من منتجات"
                  />
                </div>

                {/* صورة التصنيف */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    صورة التصنيف (اختياري)
                  </label>
                  
                  {/* Image Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="معاينة الصورة"
                          className="w-48 h-48 object-cover mx-auto rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="mt-4 text-sm text-gray-600">
                          {imageFile ? 'صورة جديدة' : 'الصورة الحالية'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600 mb-2">
                          اسحب الصورة هنا أو انقر للاختيار
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          حد أقصى: 10 ميجابايت • PNG, JPG, GIF
                        </p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                    />
                    
                    {!imagePreview && (
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4 ml-2" />
                        اختر صورة
                      </label>
                    )}
                  </div>
                  
                  {/* URL Input Alternative */}
                  {!imageFile && (
                    <div className="mt-4">
                      <div className="text-center text-sm text-gray-500 mb-2">أو</div>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
                        placeholder="أدخل رابط الصورة (https://example.com/image.jpg)"
                      />
                      
                      {formData.image && (
                        <div className="mt-3">
                          <img
                            src={formData.image}
                            alt="معاينة الصورة"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جارٍ الحفظ...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        حفظ التصنيف
                      </>
                    )}
                  </button>
                  
                  <Link
                    to="/admin?tab=categories"
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium text-center text-sm sm:text-base"
                  >
                    إلغاء
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Image Upload Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                  💡
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">نصائح مفيدة</h3>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                    <li>• اختر اسم واضح ومميز للتصنيف</li>
                    <li>• اكتب وصف مفصل يوضح نوع المنتجات</li>
                    <li>• استخدم صورة عالية الجودة وواضحة</li>
                    <li>• تأكد من أن الصورة مناسبة لمحتوى التصنيف</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAdd;