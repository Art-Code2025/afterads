import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Save, Upload, X, Plus, Minus } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from './config/api';

// تعريف نوع الخدمة
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  originalPrice: number; // السعر قبل الخصم
  basePrice: number; // السعر بعد الخصم
  status: 'active' | 'inactive';
  categories: string[];
  faqs: { question: string; answer: string; }[];
  addOns: { name: string; price: number; }[];
  seoTitle: string;
  seoDescription: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
  deliveryTime: string; // مدة التنفيذ
}

// نوع البيانات المستخدمة في الفورم يرث من Service
interface ServiceFormData extends Omit<Service, 'id'> {
  id?: number;
}

const ServiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    homeShortDescription: '',
    detailsShortDescription: '',
    description: '',
    originalPrice: 0,
    basePrice: 0,
    status: 'active',
    categories: [],
    faqs: [],
    addOns: [],
    seoTitle: '',
    seoDescription: '',
    mainImage: '',
    detailedImages: [],
    imageDetails: [],
    features: [],
    deliveryTime: ''
  });
  const [newFeature, setNewFeature] = useState<string>('');
  const [newFaq, setNewFaq] = useState<{ question: string; answer: string; }>({ question: '', answer: '' });
  const [newAddOn, setNewAddOn] = useState<{ name: string; price: number; }>({ name: '', price: 0 });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailedFiles, setDetailedFiles] = useState<File[]>([]);
  const [imageDetailInputs, setImageDetailInputs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  useEffect(() => {
    // تحميل التصنيفات المتاحة
    apiCall(API_ENDPOINTS.CATEGORIES)
      .then(data => {
        setAvailableCategories(data || []);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    if (id) {
      setFetchLoading(true);
      apiCall(API_ENDPOINTS.SERVICE_BY_ID(id))
        .then(service => {
          if (service) {
            setFormData({
              id: service.id,
              name: service.name,
              homeShortDescription: service.homeShortDescription,
              detailsShortDescription: service.detailsShortDescription,
              description: service.description,
              originalPrice: service.originalPrice || 0,
              basePrice: service.basePrice || 0,
              status: service.status || 'active',
              categories: service.categories || [],
              faqs: service.faqs || [],
              addOns: service.addOns || [],
              seoTitle: service.seoTitle || '',
              seoDescription: service.seoDescription || '',
              mainImage: service.mainImage || '',
              detailedImages: service.detailedImages || [],
              imageDetails: service.imageDetails || [],
              features: service.features || [],
              deliveryTime: service.deliveryTime || ''
            });
            setImageDetailInputs(service.imageDetails || []);
          }
          setFetchLoading(false);
        })
        .catch(error => {
          console.error('Error fetching service:', error);
          setError(error.message || 'حدث خطأ أثناء جلب بيانات الخدمة');
          setFetchLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, mainImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailedImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDetailedFiles(files);
      Promise.all(files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }))
        .then(base64Images => {
          setFormData(prev => ({
            ...prev,
            detailedImages: [...prev.detailedImages, ...base64Images],
          }));
          setImageDetailInputs(prev => [...prev, ...Array(files.length).fill('')]);
        })
        .catch(error => {
          console.error('Error previewing images:', error);
          setError('حدث خطأ أثناء معاينة الصور');
        });
    }
  };

  const handleImageDetailChange = (index: number, value: string) => {
    const updatedImageDetails = [...imageDetailInputs];
    updatedImageDetails[index] = value;
    setImageDetailInputs(updatedImageDetails);
    setFormData(prev => ({ ...prev, imageDetails: updatedImageDetails }));
  };

  const handleRemoveMainImage = () => {
    setFormData({ ...formData, mainImage: '' });
    setMainImageFile(null);
  };

  const handleRemoveDetailedImage = (index: number) => {
    const updatedImages = formData.detailedImages.filter((_, i) => i !== index);
    const updatedFiles = detailedFiles.filter((_, i) => i !== index - (formData.detailedImages.length - detailedFiles.length));
    const updatedImageDetails = imageDetailInputs.filter((_, i) => i !== index);
    setFormData({ ...formData, detailedImages: updatedImages, imageDetails: updatedImageDetails });
    setDetailedFiles(updatedFiles);
    setImageDetailInputs(updatedImageDetails);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  // FAQ handlers
  const handleAddFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFormData({ ...formData, faqs: [...formData.faqs, { question: newFaq.question.trim(), answer: newFaq.answer.trim() }] });
      setNewFaq({ question: '', answer: '' });
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
  };

  // Add-on handlers
  const handleAddAddOn = () => {
    if (newAddOn.name.trim() && newAddOn.price > 0) {
      setFormData({ ...formData, addOns: [...formData.addOns, { name: newAddOn.name.trim(), price: newAddOn.price }] });
      setNewAddOn({ name: '', price: 0 });
    }
  };

  const handleRemoveAddOn = (index: number) => {
    setFormData({ ...formData, addOns: formData.addOns.filter((_, i) => i !== index) });
  };

  // Category handlers
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, categories: [...formData.categories, categoryId] });
    } else {
      setFormData({ ...formData, categories: formData.categories.filter(id => id !== categoryId) });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const method = id ? 'PUT' : 'POST';
    const url = id ? buildApiUrl(`${API_ENDPOINTS.SERVICES}/${id}`) : buildApiUrl(API_ENDPOINTS.SERVICES);

    // Prepare service data as JSON (like ProductForm)
    const serviceData = {
      name: formData.name,
      homeShortDescription: formData.homeShortDescription,
      detailsShortDescription: formData.detailsShortDescription,
      description: formData.description,
      originalPrice: formData.originalPrice,
      basePrice: formData.basePrice,
      status: formData.status,
      categories: formData.categories,
      faqs: formData.faqs,
      addOns: formData.addOns,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
      mainImage: formData.mainImage,
      detailedImages: formData.detailedImages,
      imageDetails: formData.imageDetails,
      features: formData.features,
      deliveryTime: formData.deliveryTime
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      let responseData: any = {};
      const responseText = await response.text();
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response text:', responseText);
        throw new Error(`خطأ في تحليل استجابة الخادم. كود الحالة: ${response.status}`);
      }
      
      console.log('Server response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `فشل في حفظ الخدمة. كود الحالة: ${response.status}`);
      }

      setLoading(false);
      setSuccess(id ? 'تم تعديل الخدمة بنجاح!' : 'تم إضافة الخدمة بنجاح!');
      
      // إشعار Dashboard بتحديث البيانات
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error: any) {
      console.error('Error saving service:', error);
      setLoading(false);
      setError(error.message || 'حدث خطأ أثناء حفظ الخدمة');
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-400 border-t-transparent rounded-full spinner"></div>
          <p className="mt-4 text-gray-300 font-tajawal text-sm sm:text-base">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error && id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans flex items-center justify-center px-4" dir="rtl">
        <div className="glass-effect p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl text-center animate-fade-in">
          <p className="text-red-400 mb-4 sm:mb-6 font-tajawal text-base sm:text-lg">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="relative action-button bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-800 transition-all duration-300 glow-effect font-tajawal text-sm sm:text-base"
          >
            العودة إلى الإدارة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans" dir="rtl">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease forwards;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.8s ease forwards;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .animate-pulse {
            animation: pulse 2s infinite ease-in-out;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .gradient-shift {
            background: linear-gradient(45deg, #34D399, #059669, #047857, #34D399);
            background-size: 200% 200%;
            animation: gradientShift 8s ease infinite;
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
          }
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }
          .glass-effect:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: scale(1.02);
          }
          .glow-effect {
            box-shadow: 0 0 20px rgba(52, 211, 153, 0.6);
          }
          .action-button::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.15);
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s ease;
          }
          .action-button:hover::after {
            transform: scaleX(1);
            transform-origin: left;
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .input-container {
            position: relative;
          }
          .input-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            transition: color 0.3s ease;
          }
          .input-container input:focus + .input-icon,
          .input-container textarea:focus + .input-icon {
            color: #34D399;
          }
          .form-title {
            font-family: 'Tajawal', sans-serif;
            font-weight: 700;
            color: #E5E7EB;
            position: relative;
          }
          .form-title::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background: linear-gradient(to right, #34D399, #059669);
            border-radius: 2px;
          }
          .image-preview {
            transition: transform 0.3s ease;
          }
          .image-preview:hover {
            transform: scale(1.05);
          }
          .feature-item {
            transition: all 0.3s ease;
          }
          .feature-item:hover {
            background: rgba(52, 211, 153, 0.15);
            transform: translateX(5px);
          }
        `}
      </style>

      <header className="gradient-shift text-white py-6 shadow-lg relative">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="form-title text-xl sm:text-2xl lg:text-3xl font-bold animate-fade-in">{id ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h1>
          <button
            onClick={() => navigate('/admin')}
            className="relative action-button bg-white text-green-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 glow-effect animate-pulse text-sm sm:text-base"
          >
            العودة إلى الإدارة
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="glass-effect p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl mx-auto animate-fade-in">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-xl shadow-md animate-slide-in">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 text-green-200 rounded-xl shadow-md animate-slide-in">
              {success}
            </div>
          )}

          <div className="mb-4 sm:mb-6 animate-slide-in">
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center text-sm sm:text-base">
              اسم الخدمة
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18m-7 5h7" />
              </svg>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2.5 sm:p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal text-sm sm:text-base"
                required
              />
              <svg className="input-icon w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18m-7 5h7" />
              </svg>
            </div>
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              تعريف مختصر (لصفحة الرئيسية)
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-9 6h18V3H3v18z" />
              </svg>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="homeShortDescription"
                value={formData.homeShortDescription}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                required
              />
              <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-9 6h18V3H3v18z" />
              </svg>
            </div>
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '200ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              تعريف مختصر (لصفحة التفاصيل)
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-9 6h18V3H3v18z" />
              </svg>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="detailsShortDescription"
                value={formData.detailsShortDescription}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                required
              />
              <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-9 6h18V3H3v18z" />
              </svg>
            </div>
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '300ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              نبذة عن الخدمة
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </label>
            <div className="input-container">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                rows={5}
                required
              />
              <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* الأسعار */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '350ms' }}>
            <label className="block text-gray-200 mb-4 font-tajawal flex items-center text-lg">
              إدارة الأسعار
              <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* السعر الأصلي */}
              <div className="glass-effect p-4 rounded-xl">
                <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
                  السعر قبل الخصم
                  <span className="text-red-400 mr-2">*</span>
                  <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </label>
                <div className="input-container relative">
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-tajawal">ج.م</span>
                </div>
              </div>
              
              {/* السعر بعد الخصم */}
              <div className="glass-effect p-4 rounded-xl">
                <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
                  السعر بعد الخصم
                  <span className="text-green-400 mr-2">*</span>
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </label>
                <div className="input-container relative">
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-3 pr-12 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-tajawal">ج.م</span>
                </div>
              </div>
            </div>
            
            {/* مؤشر الخصم */}
            {formData.originalPrice > 0 && formData.basePrice > 0 && formData.originalPrice > formData.basePrice && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-green-400 font-tajawal font-semibold">نسبة الخصم</span>
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-bold text-green-400 font-tajawal">
                      {Math.round(((formData.originalPrice - formData.basePrice) / formData.originalPrice) * 100)}%
                    </span>
                    <div className="text-sm text-gray-300 font-tajawal">
                      توفير {(formData.originalPrice - formData.basePrice).toFixed(2)} ج.م
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* الحالة */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '375ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              الحالة
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </label>
            <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  >
              <option value="active">مفعل</option>
              <option value="inactive">غير مفعل</option>
            </select>
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '400ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              الصورة الرئيسية (لصفحة الرئيسية)
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4-4 4 4 4-4 4 4M4 8h16" />
              </svg>
            </label>
            <input
              type="file"
              name="mainImage"
              onChange={handleMainImageChange}
              accept="image/*"
              className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:hover:bg-green-700"
            />
            {formData.mainImage && (
              <div className="flex items-center justify-between glass-effect p-4 rounded-xl mt-4 card-hover">
                <img
                  src={buildImageUrl(formData.mainImage)}
                  alt="main-preview"
                  className="w-20 h-20 object-cover rounded-lg image-preview"
                />
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="relative action-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-tajawal"
                >
                  حذف
                </button>
              </div>
            )}
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '500ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              صور تفاصيل الخدمة (يمكنك رفع أكثر من صورة)
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4-4 4 4 4-4 4 4M4 8h16" />
              </svg>
            </label>
            <input
              type="file"
              name="detailedImages"
              onChange={handleDetailedImagesChange}
              accept="image/*"
              multiple
              className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:hover:bg-green-700"
            />
            <ul className="space-y-4 mt-4">
              {formData.detailedImages.map((image, index) => (
                <li key={index} className="glass-effect p-4 rounded-xl card-hover animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <img
                      src={buildImageUrl(image)}
                      alt={`preview-${index}`}
                      className="w-20 h-20 object-cover rounded-lg image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDetailedImage(index)}
                      className="relative action-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-tajawal"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      value={imageDetailInputs[index] || ''}
                      onChange={(e) => handleImageDetailChange(index, e.target.value)}
                      className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                      placeholder={`تفاصيل الصورة ${index + 1}`}
                    />
                    <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 animate-slide-in" style={{ animationDelay: '600ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              مميزات الخدمة
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </label>
            <div className="flex items-center mb-4">
              <div className="input-container flex-1">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="أضف ميزة جديدة"
                />
                <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <button
                type="button"
                onClick={handleAddFeature}
                className="relative action-button bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-all duration-300 glow-effect mr-2 font-tajawal"
              >
                إضافة
              </button>
            </div>
            <ul className="space-y-3">
              {formData.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-between glass-effect p-3 rounded-lg feature-item">
                  <span className="text-gray-200 font-tajawal">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="relative action-button bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-tajawal"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* التصنيفات */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '700ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              التصنيفات
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </label>
            
            <select
              multiple
              className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, categories: selectedOptions });
              }}
              value={formData.categories}
              size={1}
            >
              {availableCategories.map((category) => (
                <option 
                  key={category.id} 
                  value={category.id}
                  className="p-2 font-tajawal"
                >
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* التصنيفات المختارة */}
            {formData.categories.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((categoryId) => {
                    const category = availableCategories.find(cat => cat.id === categoryId);
                    return category ? (
                      <span 
                        key={categoryId}
                        className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-tajawal"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              categories: formData.categories.filter(id => id !== categoryId)
                            });
                          }}
                          className="mr-2 hover:bg-blue-700 rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* مدة التنفيذ */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '750ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              مدة التنفيذ
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </label>
            <div className="input-container">
              <input
                type="text"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                placeholder="مثال: 3-5 أيام عمل"
              />
              <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* الأسئلة الشائعة */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '800ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              الأسئلة الشائعة
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </label>
            <div className="space-y-4 mb-4">
              <div className="input-container">
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="السؤال"
                />
              </div>
              <div className="input-container">
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="الإجابة"
                  rows={3}
                />
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="relative action-button bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-all duration-300 glow-effect font-tajawal"
              >
                إضافة سؤال
              </button>
            </div>
            <div className="space-y-3">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="glass-effect p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-gray-200 font-tajawal font-semibold">{faq.question}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      className="relative action-button bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300 font-tajawal text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  <p className="text-gray-300 font-tajawal">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* الخدمات الإضافية */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '900ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              الخدمات الإضافية
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </label>
            <div className="flex gap-3 mb-4">
              <div className="input-container flex-1">
                <input
                  type="text"
                  value={newAddOn.name}
                  onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="اسم الإضافة"
                />
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newAddOn.price}
                  onChange={(e) => setNewAddOn({ ...newAddOn, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="السعر"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAddOn}
                className="relative action-button bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-all duration-300 glow-effect font-tajawal"
              >
                إضافة
              </button>
            </div>
            <div className="space-y-3">
              {formData.addOns.map((addOn, index) => (
                <div key={index} className="flex items-center justify-between glass-effect p-3 rounded-lg">
                  <div className="flex-1">
                    <span className="text-gray-200 font-tajawal">{addOn.name}</span>
                    <span className="text-green-400 font-tajawal mr-2">{addOn.price} ج.م</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddOn(index)}
                    className="relative action-button bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-tajawal"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '1000ms' }}>
            <label className="block text-gray-200 mb-2 font-tajawal flex items-center">
              تحسين محركات البحث (SEO)
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </label>
            <div className="space-y-4">
              <div className="input-container">
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="عنوان SEO"
                />
              </div>
              <div className="input-container">
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow-md transition-all duration-300 font-tajawal"
                  placeholder="وصف SEO"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="relative action-button w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-all duration-300 glow-effect font-tajawal text-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full spinner mr-2"></div>
                جاري الحفظ...
              </div>
            ) : id ? 'تعديل الخدمة' : 'إضافة الخدمة'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ServiceForm;