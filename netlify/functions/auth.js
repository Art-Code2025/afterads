import { db } from './config/firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  query, 
  where 
} from 'firebase/firestore';

// Auth Function for Admin and Customer Login
export const handler = async (event, context) => {
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

    // Admin login endpoint
    if (method === 'POST' && pathSegments.includes('admin')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;

      console.log('🔐 Admin login attempt:', { username });

      // Check credentials - hardcoded for demo
      const validCredentials = [
        { username: 'admin', password: '123123' },
        { username: 'administrator', password: '123123' },
        { username: 'مدير', password: '123123' }
      ];

      const isValid = validCredentials.some(cred => 
        cred.username === username && cred.password === password
      );

      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'بيانات الدخول غير صحيحة'
          }),
        };
      }

      // Create a simple token (not JWT for simplicity)
      const token = Buffer.from(JSON.stringify({
        username,
        role: 'admin',
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        loginTime: Date.now()
      })).toString('base64');

      const user = {
        username,
        role: 'admin',
        name: username === 'admin' ? 'المدير العام' : 'مدير النظام',
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