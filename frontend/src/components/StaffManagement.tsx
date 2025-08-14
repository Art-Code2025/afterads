import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Users, Shield, User, Clock, Activity, FileText } from 'lucide-react';
import { staffAPI, authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import ActivityLog from './ActivityLog';

interface Staff {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string | null;
}

interface LoginLog {
  id: string;
  staffId: string;
  username: string;
  name: string;
  role: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  status: 'success' | 'failed';
  reason?: string;
}

interface StaffManagementProps {
  currentUser: any;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ currentUser }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [selectedStaffLogs, setSelectedStaffLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedStaffForLogs, setSelectedStaffForLogs] = useState<Staff | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showStaffActivityLog, setShowStaffActivityLog] = useState(false);
  const [selectedStaffForActivity, setSelectedStaffForActivity] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff' as 'admin' | 'staff'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pinCode, setPinCode] = useState('');
  const [showPinModal, setShowPinModal] = useState(false); // سيتم تحديدها بناءً على حالة المصادقة
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('0000');
  
  // حفظ PIN في localStorage وتحقق من حالة المصادقة
  useEffect(() => {
    const savedPin = localStorage.getItem('adminPin');
    if (savedPin) {
      setAdminPin(savedPin);
    }
    
    // تحقق من حالة المصادقة المحفوظة
    const savedAuthState = sessionStorage.getItem('staffManagementAuth');
    const authTime = sessionStorage.getItem('staffManagementAuthTime');
    const now = Date.now();
    
    // إذا كانت المصادقة محفوظة وحديثة (أقل من 30 دقيقة)
     if (savedAuthState === 'true' && authTime && (now - parseInt(authTime)) < 30 * 60 * 1000) {
       setIsAuthenticated(true);
       setShowPinModal(false);
       console.log('✅ Staff management authentication restored from session');
     } else {
       // إذا لم تكن هناك مصادقة محفوظة أو انتهت صلاحيتها
       setIsAuthenticated(false);
       setShowPinModal(true);
       // مسح المصادقة المنتهية الصلاحية
       sessionStorage.removeItem('staffManagementAuth');
       sessionStorage.removeItem('staffManagementAuthTime');
     }
   }, []);
  
  const savePinToStorage = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('adminPin', newPin);
  };
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    // فقط جلب البيانات إذا كان المستخدم مصادق عليه
    if (isAuthenticated) {
      fetchStaff();
    } else {
      // إيقاف التحميل إذا لم يكن مصادق عليه
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchStaff = useCallback(async (forceRefresh = false) => {
    // تحقق من وجود بيانات محفوظة مؤقتاً
    const cachedStaff = sessionStorage.getItem('staffData');
    const cacheTime = sessionStorage.getItem('staffDataTime');
    const now = Date.now();
    
    // استخدام البيانات المحفوظة إذا كانت حديثة (أقل من 30 ثانية) ولم يتم طلب التحديث
    if (!forceRefresh && cachedStaff && cacheTime && (now - parseInt(cacheTime)) < 30000) {
      const staffData = JSON.parse(cachedStaff);
      setStaff(staffData);
      console.log('✅ Staff loaded from cache:', staffData.length);
      
      // تحديث البيانات في الخلفية
      setTimeout(async () => {
        try {
          const response = await staffAPI.getAll();
          if (response.success) {
            const freshStaffData = response.data;
            
            // حفظ البيانات الجديدة في التخزين المؤقت
            sessionStorage.setItem('staffData', JSON.stringify(freshStaffData));
            sessionStorage.setItem('staffDataTime', now.toString());
            
            setStaff(freshStaffData);
            console.log('🔄 Staff refreshed in background:', freshStaffData.length);
          }
        } catch (error) {
          console.warn('⚠️ Background staff refresh failed:', error);
        }
      }, 100);
      
      return;
    }
    
    try {
      setLoading(true);
      const response = await staffAPI.getAll();
      if (response.success) {
        const staffData = response.data;
        
        // حفظ البيانات في التخزين المؤقت
        sessionStorage.setItem('staffData', JSON.stringify(staffData));
        sessionStorage.setItem('staffDataTime', now.toString());
        
        setStaff(staffData);
        console.log('✅ Staff loaded fresh:', staffData.length);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('خطأ في جلب بيانات الموظفين');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name || (!editingStaff && !formData.password)) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingStaff) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await staffAPI.update(editingStaff.id, updateData);
        if (response.success) {
          toast.success('تم تحديث بيانات الموظف بنجاح');
          fetchStaff();
          resetForm();
        }
      } else {
        const response = await staffAPI.create(formData);
        if (response.success) {
          toast.success('تم إنشاء حساب الموظف بنجاح');
          fetchStaff();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error(error.response?.data?.message || 'خطأ في حفظ بيانات الموظف');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الموظف "${name}"؟`)) {
      return;
    }

    try {
      const response = await staffAPI.delete(id);
      if (response.success) {
        toast.success('تم حذف الموظف بنجاح');
        fetchStaff();
      }
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast.error(error.response?.data?.message || 'خطأ في حذف الموظف');
    }
  };

  const fetchAllLoginLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await staffAPI.getLoginLogs();
      setLoginLogs(response.logs || []);
      setShowAllLogs(true);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error fetching login logs:', error);
      toast.error('حدث خطأ أثناء جلب سجلات الدخول');
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchStaffLoginLogs = async (staffMember: Staff) => {
    try {
      setLogsLoading(true);
      const response = await staffAPI.getStaffLoginLogs(staffMember.id);
      setSelectedStaffLogs(response.logs || []);
      setSelectedStaffForLogs(staffMember);
      setShowAllLogs(false);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error fetching staff login logs:', error);
      toast.error('حدث خطأ أثناء جلب سجلات دخول الموظف');
    } finally {
      setLogsLoading(false);
    }
  };

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setSelectedStaffForLogs(null);
    setLoginLogs([]);
    setSelectedStaffLogs([]);
    setShowAllLogs(false);
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      password: '',
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'staff'
    });
    setEditingStaff(null);
    setShowModal(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      const response = await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (response.success) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'خطأ في تغيير كلمة المرور');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === adminPin) {
      setShowPinModal(false);
      setIsAuthenticated(true);
      setPinCode('');
      
      // حفظ حالة المصادقة في sessionStorage
      sessionStorage.setItem('staffManagementAuth', 'true');
      sessionStorage.setItem('staffManagementAuthTime', Date.now().toString());
      console.log('✅ Staff management authentication saved to session');
      
      // تحميل البيانات فور المصادقة
      fetchStaff(true);
      toast.success('تم الدخول بنجاح إلى إدارة الموظفين');
    } else {
      toast.error('رمز PIN غير صحيح');
      setPinCode('');
    }
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast.error('رمز PIN الجديد غير متطابق');
      return;
    }
    if (newPin.length !== 4) {
      toast.error('رمز PIN يجب أن يكون 4 أرقام');
      return;
    }
    savePinToStorage(newPin);
    setShowPinSettings(false);
    setNewPin('');
    setConfirmPin('');
    toast.success('تم تغيير رمز PIN بنجاح');
  };

  const closePinModal = () => {
    // لا يمكن إغلاق النافذة بدون إدخال PIN صحيح
    toast.warning('يجب إدخال رمز PIN للوصول إلى إدارة الموظفين');
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="w-4 h-4 text-red-500" /> : <User className="w-4 h-4 text-blue-500" />;
  };

  const getRoleName = (role: string) => {
    return role === 'admin' ? 'مدير' : 'موظف';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAllLoginLogs}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4" />
                سجلات الدخول
              </button>
              <button
                onClick={() => setShowActivityLog(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                سجل الأنشطة
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                تغيير كلمة مروري
              </button>
              <button
                onClick={() => setShowPinSettings(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                تغيير رمز PIN
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة موظف جديد
              </button>
            </div>
          </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر تسجيل دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{member.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-gray-900">{getRoleName(member.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email || 'غير محدد'}</div>
                    <div className="text-sm text-gray-500">{member.phone || 'غير محدد'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchStaffLoginLogs(member)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                        title="سجلات الدخول"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStaffForActivity(member);
                          setShowStaffActivityLog(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="سجلات الأنشطة"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="حذف"
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
        
        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد موظفين</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة موظف جديد</p>
          </div>
        )}

      {/* Activity Log Modal */}
       {showActivityLog && (
         <ActivityLog
           currentUser={null}
           isOpen={showActivityLog}
           onClose={() => setShowActivityLog(false)}
         />
       )}

      {/* Staff Activity Log Modal */}
       {showStaffActivityLog && selectedStaffForActivity && (
         <ActivityLog
           currentUser={null}
           isOpen={showStaffActivityLog}
           onClose={() => {
             setShowStaffActivityLog(false);
             setSelectedStaffForActivity(null);
           }}
           staffFilter={selectedStaffForActivity.id}
           staffName={selectedStaffForActivity.name}
         />
       )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingStaff ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingStaff}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور {!editingStaff && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required={!editingStaff}
                    placeholder={editingStaff ? 'اتركه فارغاً إذا لم ترد تغييره' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الدور *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="staff">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStaff ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">تغيير كلمة المرور</h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الحالية *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowPasswordModal(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  تغيير كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {showAllLogs ? 'جميع سجلات الدخول' : `سجلات دخول ${selectedStaffForLogs?.name}`}
              </h2>
              <button
                onClick={closeLogsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {logsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المستخدم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت الدخول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(showAllLogs ? loginLogs : selectedStaffLogs).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.name || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.role === 'admin' ? 'مدير' : 'موظف'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.loginTime).toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'success' ? 'نجح' : 'فشل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.reason ? (
                            log.reason === 'invalid_password' ? 'كلمة مرور خاطئة' :
                            log.reason === 'user_not_found' ? 'المستخدم غير موجود' :
                            log.reason
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(showAllLogs ? loginLogs : selectedStaffLogs).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد سجلات دخول
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={closeLogsModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PIN Settings Modal - بوب أب صغير */}
      {showPinSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg border border-gray-300 p-4 w-64 mx-4">
            <div className="text-center mb-3">
              <h3 className="text-base font-medium text-black">تغيير رمز PIN</h3>
            </div>
            <form onSubmit={handlePinChange}>
              <div className="mb-2">
                <label className="block text-xs font-medium text-black mb-1">
                  رمز PIN الجديد
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded text-sm focus:outline-none focus:border-black"
                  placeholder="4 أرقام"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-black mb-1">
                  تأكيد رمز PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded text-sm focus:outline-none focus:border-black"
                  placeholder="أعد الإدخال"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinSettings(false);
                    setNewPin('');
                    setConfirmPin('');
                  }}
                  className="flex-1 px-2 py-1 text-black border border-gray-400 rounded text-xs hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-2 py-1 bg-black text-white rounded text-xs hover:bg-gray-800"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* PIN Code Modal - بوب أب صغير */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg border border-gray-300 p-4 w-64 mx-4">
            <div className="text-center mb-3">
              <h3 className="text-base font-medium text-black mb-1">رمز الحماية</h3>
              <p className="text-xs text-gray-600">أدخل رمز PIN</p>
            </div>
            <form onSubmit={handlePinSubmit}>
              <div className="mb-3">
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-2 py-1 text-center text-base font-mono border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-1 px-3 rounded text-sm"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PIN Settings Modal - بوب أب صغير */}
      {showPinSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg border border-gray-300 p-4 w-64 mx-4">
            <div className="text-center mb-3">
              <h3 className="text-base font-medium text-black">تغيير رمز PIN</h3>
            </div>
            <form onSubmit={handlePinChange}>
              <div className="mb-2">
                <label className="block text-xs font-medium text-black mb-1">
                  رمز PIN الجديد
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded text-sm focus:outline-none focus:border-black"
                  placeholder="4 أرقام"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-black mb-1">
                  تأكيد رمز PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 rounded text-sm focus:outline-none focus:border-black"
                  placeholder="أعد الإدخال"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinSettings(false);
                    setNewPin('');
                    setConfirmPin('');
                  }}
                  className="flex-1 px-2 py-1 text-black border border-gray-400 rounded text-xs hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-2 py-1 bg-black text-white rounded text-xs hover:bg-gray-800"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagement;