const { db } = require('./config/firebase.js');
const { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where 
} = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Staff Management Function
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
      body: ''
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

    console.log('👥 Staff API - Method:', method, 'Path:', path);

    // Verify admin authorization
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'غير مصرح لك بالوصول'
        }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = JSON.parse(atob(token));
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
      if (decoded.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'غير مصرح لك بهذا الإجراء'
          }),
        };
      }
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

    // Get all staff members
    if (method === 'GET' && (pathSegments.length === 1 || pathSegments[pathSegments.length - 1] === 'staff')) {
      try {
        const staffCollection = collection(db, 'staff');
        const querySnapshot = await getDocs(staffCollection);
        
        const staff = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          staff.push({
            id: doc.id,
            username: data.username,
            name: data.name,
            role: data.role,
            email: data.email,
            phone: data.phone,
            status: data.status,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin
          });
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: staff
          }),
        };
      } catch (error) {
        console.error('❌ Get staff error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب بيانات الموظفين'
          }),
        };
      }
    }

    // Create new staff member
    if (method === 'POST' && (pathSegments.length === 1 || pathSegments[pathSegments.length - 1] === 'staff')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password, name, email, phone, role = 'staff' } = body;

      console.log('👥 Creating staff member:', { username, name, role });

      if (!username || !password || !name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'اسم المستخدم وكلمة المرور والاسم مطلوبة'
          }),
        };
      }

      try {
        // Check if username already exists
        const staffCollection = collection(db, 'staff');
        const q = query(staffCollection, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'اسم المستخدم موجود بالفعل'
            }),
          };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new staff member
        const staffData = {
          username,
          password: hashedPassword,
          name,
          email: email || '',
          phone: phone || '',
          role: role === 'admin' ? 'admin' : 'staff',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: decoded.username,
          lastLogin: null
        };

        const docRef = await addDoc(staffCollection, staffData);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم إنشاء حساب الموظف بنجاح',
            data: {
              id: docRef.id,
              username: staffData.username,
              name: staffData.name,
              role: staffData.role,
              status: staffData.status
            }
          }),
        };

      } catch (error) {
        console.error('❌ Create staff error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في إنشاء حساب الموظف'
          }),
        };
      }
    }

    // Update staff member
    if (method === 'PUT' && pathSegments.length === 4) {
      const staffId = pathSegments[3];
      const body = event.body ? JSON.parse(event.body) : {};
      const { name, email, phone, role, status, password } = body;

      console.log('👥 Updating staff member:', staffId);

      try {
        const staffDoc = doc(db, 'staff', staffId);
        const staffSnapshot = await getDoc(staffDoc);

        if (!staffSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'الموظف غير موجود'
            }),
          };
        }

        const updateData = {
          updatedAt: new Date().toISOString(),
          updatedBy: decoded.username
        };

        if (name) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (role) updateData.role = role === 'admin' ? 'admin' : 'staff';
        if (status) updateData.status = status;
        
        // Update password if provided
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        await updateDoc(staffDoc, updateData);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم تحديث بيانات الموظف بنجاح'
          }),
        };

      } catch (error) {
        console.error('❌ Update staff error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في تحديث بيانات الموظف'
          }),
        };
      }
    }

    // Delete staff member
    if (method === 'DELETE' && pathSegments.length === 4) {
      const staffId = pathSegments[3];

      console.log('👥 Deleting staff member:', staffId);

      try {
        const staffDoc = doc(db, 'staff', staffId);
        const staffSnapshot = await getDoc(staffDoc);

        if (!staffSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'الموظف غير موجود'
            }),
          };
        }

        await deleteDoc(staffDoc);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'تم حذف الموظف بنجاح'
          }),
        };

      } catch (error) {
        console.error('❌ Delete staff error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في حذف الموظف'
          }),
        };
      }
    }

    // Get staff login logs
    if (method === 'GET' && pathSegments.length === 4 && pathSegments[3] === 'logs') {
      try {
        const loginLogsCollection = collection(db, 'loginLogs');
        const querySnapshot = await getDocs(loginLogsCollection);
        
        const logs = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          logs.push({
            id: doc.id,
            ...data
          });
        });

        // Sort by login time (newest first)
        logs.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            logs: logs
          }),
        };
      } catch (error) {
        console.error('❌ Get login logs error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب سجلات الدخول'
          }),
        };
      }
    }

    // Get specific staff member's login logs
    if (method === 'GET' && pathSegments.length === 5 && pathSegments[4] === 'logs') {
      const staffId = pathSegments[3];
      
      try {
        const loginLogsCollection = collection(db, 'loginLogs');
        const q = query(loginLogsCollection, where('staffId', '==', staffId));
        const querySnapshot = await getDocs(q);
        
        const logs = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          logs.push({
            id: doc.id,
            ...data
          });
        });

        // Sort by login time (newest first)
        logs.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            logs: logs
          }),
        };
      } catch (error) {
        console.error('❌ Get staff login logs error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب سجلات دخول الموظف'
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
    console.error('Staff function error:', error);
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