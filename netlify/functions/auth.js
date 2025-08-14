const { db } = require('./config/firebase.js');
const { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  query, 
  where 
} = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Auth Function for Admin and Customer Login
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathSegments = path.split('/').filter(Boolean);

    console.log('🔐 Auth API - Method:', method, 'Path:', path);

    // Admin/Staff login endpoint
    if (method === 'POST' && pathSegments.includes('admin')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;

      console.log('🔐 Admin/Staff login attempt:', { username });

      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'اسم المستخدم وكلمة المرور مطلوبان'
          }),
        };
      }

      try {
        // First check hardcoded admin credentials for backward compatibility
        const validCredentials = [
          { username: 'admin', password: '123123', role: 'admin', name: 'المدير العام' },
          { username: 'administrator', password: '123123', role: 'admin', name: 'مدير النظام' },
          { username: 'مدير', password: '123123', role: 'admin', name: 'المدير العام' }
        ];

        const hardcodedAdmin = validCredentials.find(cred => 
          cred.username === username && cred.password === password
        );

        if (hardcodedAdmin) {
          // Log the successful login for hardcoded admin
          const now = new Date().toISOString();
          const loginLogsCollection = collection(db, 'loginLogs');
          await addDoc(loginLogsCollection, {
            staffId: 'hardcoded_admin',
            username: hardcodedAdmin.username,
            name: hardcodedAdmin.name,
            role: 'admin',
            loginTime: now,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown',
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'success'
          });

          console.log('📝 Login logged for hardcoded admin:', hardcodedAdmin.username);

          // Create token for hardcoded admin
          const token = Buffer.from(JSON.stringify({
            username: hardcodedAdmin.username,
            role: 'admin',
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            loginTime: Date.now()
          })).toString('base64');

          const user = {
            username: hardcodedAdmin.username,
            role: 'admin',
            name: hardcodedAdmin.name,
            permissions: ['all']
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'تم تسجيل الدخول بنجاح',
              token: token,
              user: user
            }),
          };
        }

        // Check staff collection in Firebase
        const staffCollection = collection(db, 'staff');
        const q = query(staffCollection, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Log failed login attempt for non-existent user
          const loginLogsCollection = collection(db, 'loginLogs');
          await addDoc(loginLogsCollection, {
            staffId: null,
            username: username,
            name: 'غير معروف',
            role: 'غير معروف',
            loginTime: new Date().toISOString(),
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown',
            sessionId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'failed',
            reason: 'user_not_found'
          });

          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'بيانات الدخول غير صحيحة'
            }),
          };
        }

        let staffData = null;
        querySnapshot.forEach((doc) => {
          staffData = { id: doc.id, ...doc.data() };
        });

        // Check if staff is active
        if (staffData.status !== 'active') {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'الحساب غير مفعل'
            }),
          };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, staffData.password);
        if (!isPasswordValid) {
          // Log failed login attempt
          const loginLogsCollection = collection(db, 'loginLogs');
          await addDoc(loginLogsCollection, {
            staffId: staffData.id,
            username: staffData.username,
            name: staffData.name,
            role: staffData.role,
            loginTime: new Date().toISOString(),
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown',
            sessionId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'failed',
            reason: 'invalid_password'
          });

          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'بيانات الدخول غير صحيحة'
            }),
          };
        }

        // Update last login and log the session
        const now = new Date().toISOString();
        const staffDoc = doc(db, 'staff', staffData.id);
        await updateDoc(staffDoc, {
          lastLogin: now
        });

        // Log the login session
        const loginLogsCollection = collection(db, 'loginLogs');
        await addDoc(loginLogsCollection, {
          staffId: staffData.id,
          username: staffData.username,
          name: staffData.name,
          role: staffData.role,
          loginTime: now,
          ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown',
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'success'
        });

        console.log('📝 Login logged for staff:', staffData.username);

        // Create token
        const token = Buffer.from(JSON.stringify({
          id: staffData.id,
          username: staffData.username,
          role: staffData.role,
          exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          loginTime: Date.now()
        })).toString('base64');

        const user = {
          id: staffData.id,
          username: staffData.username,
          role: staffData.role,
          name: staffData.name,
          email: staffData.email,
          permissions: staffData.role === 'admin' ? ['all'] : ['orders']
        };

        console.log('✅ Staff login successful:', user.username);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token: token,
            user: user
          }),
        };

      } catch (error) {
        console.error('❌ Admin/Staff login error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في الخادم'
          }),
        };
      }
    }

    // Customer login endpoint
    if (method === 'POST' && pathSegments.includes('login')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { email, password } = body;

      console.log('🔐 Customer login attempt:', { email });

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
          }),
        };
      }

      try {
        // Query customers collection for user with email
        const customersCollection = collection(db, 'customers');
        const q = query(customersCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'البريد الإلكتروني غير مسجل'
            }),
          };
        }

        let customerData = null;
        querySnapshot.forEach((doc) => {
          customerData = { id: doc.id, ...doc.data() };
        });

        // Check password (in real app, use bcrypt)
        if (customerData.password !== password) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'كلمة المرور غير صحيحة'
            }),
          };
        }

        // Create customer token
        const token = Buffer.from(JSON.stringify({
          id: customerData.id,
          email: customerData.email,
          role: 'customer',
          exp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          loginTime: Date.now()
        })).toString('base64');

        const user = {
          id: customerData.id,
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          role: 'customer'
        };

        console.log('✅ Customer login successful:', user.email);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token: token,
            user: user
          }),
        };

      } catch (error) {
        console.error('❌ Customer login error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في الخادم'
          }),
        };
      }
    }

    // Customer register endpoint
    if (method === 'POST' && pathSegments.includes('register')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { email, password, firstName, lastName, phone } = body;

      console.log('📝 Customer register attempt:', { email, firstName, lastName });

      if (!email || !password || !firstName || !lastName || !phone) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'جميع الحقول مطلوبة'
          }),
        };
      }

      try {
        // Check if email already exists
        const customersCollection = collection(db, 'customers');
        const q = query(customersCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'البريد الإلكتروني مسجل بالفعل'
            }),
          };
        }

        // Create new customer
        const customerData = {
          email,
          password, // In real app, hash this with bcrypt
          firstName,
          lastName,
          phone,
          createdAt: new Date().toISOString(),
          status: 'active',
          totalOrders: 0,
          totalSpent: 0
        };

        const docRef = await addDoc(customersCollection, customerData);

        // Create customer token
        const token = Buffer.from(JSON.stringify({
          id: docRef.id,
          email: customerData.email,
          role: 'customer',
          exp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          loginTime: Date.now()
        })).toString('base64');

        const user = {
          id: docRef.id,
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          role: 'customer'
        };

        console.log('✅ Customer registered successfully:', user.email);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            token: token,
            user: user
          }),
        };

      } catch (error) {
        console.error('❌ Customer register error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في إنشاء الحساب'
          }),
        };
      }
    }

    // Verify token endpoint
    if (method === 'POST' && pathSegments.includes('verify')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { token } = body;

      if (!token) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Token مطلوب'
          }),
        };
      }

      try {
        const decoded = JSON.parse(atob(token));
        
        if (decoded.exp && decoded.exp < Date.now()) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'انتهت صلاحية الجلسة'
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              id: decoded.id,
              username: decoded.username,
              email: decoded.email,
              role: decoded.role
            }
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Token غير صالح'
          }),
        };
      }
    }

    // Get current user endpoint
    if (method === 'GET' && pathSegments.includes('me')) {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Token مطلوب'
          }),
        };
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const decoded = JSON.parse(atob(token));
        
        if (decoded.exp && decoded.exp < Date.now()) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'انتهت صلاحية الجلسة'
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              id: decoded.id,
              username: decoded.username,
              email: decoded.email,
              role: decoded.role,
              name: decoded.username === 'admin' ? 'المدير العام' : 'مدير النظام'
            }
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Token غير صالح'
          }),
        };
      }
    }

    // Change password endpoint
    if (method === 'POST' && pathSegments.includes('change-password')) {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Token مطلوب'
          }),
        };
      }

      const token = authHeader.replace('Bearer ', '');
      const body = event.body ? JSON.parse(event.body) : {};
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'كلمة المرور الحالية والجديدة مطلوبتان'
          }),
        };
      }

      if (newPassword.length < 6) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
          }),
        };
      }

      try {
        const decoded = JSON.parse(atob(token));
        
        if (decoded.exp && decoded.exp < Date.now()) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'انتهت صلاحية الجلسة'
            }),
          };
        }

        // Check if it's hardcoded admin
        const validCredentials = [
          { username: 'admin', password: '123123' },
          { username: 'administrator', password: '123123' },
          { username: 'مدير', password: '123123' }
        ];

        const hardcodedAdmin = validCredentials.find(cred => 
          cred.username === decoded.username
        );

        if (hardcodedAdmin) {
          // For hardcoded admin, just check current password
          if (currentPassword !== hardcodedAdmin.password) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
              }),
            };
          }

          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'لا يمكن تغيير كلمة مرور المدير الافتراضي. يرجى إنشاء حساب مدير جديد.'
            }),
          };
        }

        // For staff members in Firebase
        if (!decoded.id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'معرف المستخدم غير صالح'
            }),
          };
        }

        const staffDoc = doc(db, 'staff', decoded.id);
        const staffSnapshot = await getDoc(staffDoc);

        if (!staffSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'المستخدم غير موجود'
            }),
          };
        }

        const staffData = staffSnapshot.data();

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staffData.password);
        if (!isCurrentPasswordValid) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'كلمة المرور الحالية غير صحيحة'
            }),
          };
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await updateDoc(staffDoc, {
          password: hashedNewPassword,
          passwordChangedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        console.log('✅ Password changed successfully for:', decoded.username);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
          }),
        };

      } catch (error) {
        console.error('❌ Change password error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في تغيير كلمة المرور'
          }),
        };
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      }),
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'خطأ في الخادم: ' + error.message
      }),
    };
  }
};