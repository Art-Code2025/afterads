import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { authAPI, isAuthenticated } from './utils/api';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      console.log('🔒 User already authenticated, redirecting to admin...');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      // Try admin login first using Serverless APIs
      console.log('🔐 Attempting admin login...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🌐 Hostname:', window.location.hostname);
      console.log('🏗️ Environment:', import.meta.env.PROD ? 'Production' : 'Development');
      
      const response = await authAPI.adminLogin(credentials.username, credentials.password);
      console.log('📥 Login response:', response);
      
      if (response && response.success) {
        // Store admin token - fix: access token directly, not response.data.token
        console.log('✅ Login successful, storing token...');
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true'); // Add this line for ProtectedRoute
        
        toast.success('تم تسجيل الدخول بنجاح');
        
        // Force navigation after a short delay to ensure state is updated
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 100);
      } else {
        console.log('❌ Login failed:', response);
        toast.error(response?.message || 'فشل تسجيل الدخول');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'خطأ في تسجيل الدخول';
      
      if (error.message) {
        if (error.message.includes('404')) {
          errorMessage = 'خطأ في الاتصال - تأكد من رفع الموقع بشكل صحيح';
        } else if (error.message.includes('401')) {
          errorMessage = 'بيانات الدخول غير صحيحة';
        } else if (error.message.includes('500')) {
          errorMessage = 'خطأ في الخادم';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'خطأ في الاتصال بالخادم';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="أدخل اسم المستخدم"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="أدخل كلمة المرور"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                جاري تسجيل الدخول...
              </div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            مخصص للإدارة فقط
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;