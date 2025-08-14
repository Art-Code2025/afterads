const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { httpMethod: method, path } = event;
    const pathSegments = path.split('/').filter(segment => segment !== '');

    console.log('🔍 Activity Logs API called:', { method, path, pathSegments });

    // GET /activity-logs - Get all activity logs with optional filters
    if (method === 'GET' && (pathSegments.length === 2 || pathSegments[pathSegments.length - 1] === 'activity-logs')) {
      try {
        const queryParams = event.queryStringParameters || {};
        const {
          staffId,
          action,
          orderId,
          startDate,
          endDate,
          limit: queryLimit = '100'
        } = queryParams;

        console.log('📊 Fetching activity logs with filters:', queryParams);

        let activityQuery = collection(db, 'activityLogs');
        const constraints = [];

        // Apply filters
        if (staffId) {
          constraints.push(where('staffId', '==', staffId));
        }
        if (action) {
          constraints.push(where('action', '==', action));
        }
        if (orderId) {
          constraints.push(where('orderId', '==', orderId));
        }
        if (startDate) {
          constraints.push(where('timestamp', '>=', startDate));
        }
        if (endDate) {
          constraints.push(where('timestamp', '<=', endDate));
        }

        // Add ordering and limit
        constraints.push(orderBy('timestamp', 'desc'));
        constraints.push(limit(parseInt(queryLimit)));

        if (constraints.length > 0) {
          activityQuery = query(activityQuery, ...constraints);
        }

        // Add timeout for Firebase query
        const queryPromise = getDocs(activityQuery);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase query timeout')), 8000)
        );
        
        const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
        const activities = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            ...data
          });
        });

        console.log(`✅ Found ${activities.length} activity logs`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            activities: activities,
            total: activities.length
          }),
        };
      } catch (error) {
        console.error('❌ Error fetching activity logs:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب سجلات الأنشطة: ' + error.message
          }),
        };
      }
    }

    // POST /activity-logs - Create new activity log
    if (method === 'POST' && (pathSegments.length === 2 || pathSegments[pathSegments.length - 1] === 'activity-logs')) {
      try {
        const body = event.body ? JSON.parse(event.body) : {};
        const {
          staffId,
          staffName,
          staffUsername,
          action,
          orderId,
          customerId,
          details,
          ipAddress,
          userAgent
        } = body;

        console.log('📝 Creating activity log:', {
          staffId,
          staffName,
          action,
          orderId
        });

        // Validate required fields
        if (!staffId || !staffName || !action) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'البيانات المطلوبة مفقودة (staffId, staffName, action)'
            }),
          };
        }

        // Create activity log entry
        const activityLog = {
          staffId,
          staffName,
          staffUsername: staffUsername || '',
          action,
          orderId: orderId || null,
          customerId: customerId || null,
          details: details || {},
          timestamp: new Date().toISOString(),
          ipAddress: ipAddress || event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: userAgent || event.headers['user-agent'] || 'unknown'
        };

        // Add timeout for Firebase operation
        const activityLogsCollection = collection(db, 'activityLogs');
        const addDocPromise = addDoc(activityLogsCollection, activityLog);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase operation timeout')), 5000)
        );
        
        const docRef = await Promise.race([addDocPromise, timeoutPromise]);

        const createdActivity = {
          id: docRef.id,
          ...activityLog
        };

        console.log('✅ Activity log created successfully:', docRef.id);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            activity: createdActivity,
            message: 'تم تسجيل النشاط بنجاح'
          }),
        };
      } catch (error) {
        console.error('❌ Error creating activity log:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في تسجيل النشاط: ' + error.message
          }),
        };
      }
    }

    // GET /activity-logs/stats - Get activity statistics
    if (method === 'GET' && pathSegments.length >= 3 && pathSegments[pathSegments.length - 1] === 'stats') {
      try {
        const queryParams = event.queryStringParameters || {};
        const { startDate, endDate } = queryParams;

        console.log('📈 Fetching activity statistics');

        let activityQuery = collection(db, 'activityLogs');
        const constraints = [];

        if (startDate) {
          constraints.push(where('timestamp', '>=', startDate));
        }
        if (endDate) {
          constraints.push(where('timestamp', '<=', endDate));
        }

        if (constraints.length > 0) {
          activityQuery = query(activityQuery, ...constraints);
        }

        const querySnapshot = await getDocs(activityQuery);
        const activities = [];

        querySnapshot.forEach((doc) => {
          activities.push(doc.data());
        });

        // Calculate statistics
        const stats = {
          total: activities.length,
          byAction: {},
          byStaff: {},
          byDate: {}
        };

        activities.forEach(activity => {
          // Count by action
          stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
          
          // Count by staff
          const staffKey = `${activity.staffName} (${activity.staffUsername})`;
          stats.byStaff[staffKey] = (stats.byStaff[staffKey] || 0) + 1;
          
          // Count by date
          const date = activity.timestamp.split('T')[0];
          stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });

        console.log('✅ Activity statistics calculated');

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            stats: stats
          }),
        };
      } catch (error) {
        console.error('❌ Error fetching activity statistics:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب إحصائيات الأنشطة: ' + error.message
          }),
        };
      }
    }

    // GET /activity-logs/staff/{staffId} - Get activities for specific staff member
    if (method === 'GET' && pathSegments.length >= 4 && pathSegments[pathSegments.length - 2] === 'staff') {
      const staffId = pathSegments[pathSegments.length - 1];
      
      try {
        console.log('👤 Fetching activities for staff:', staffId);

        const activityQuery = query(
          collection(db, 'activityLogs'),
          where('staffId', '==', staffId),
          orderBy('timestamp', 'desc'),
          limit(100)
        );

        const querySnapshot = await getDocs(activityQuery);
        const activities = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            ...data
          });
        });

        console.log(`✅ Found ${activities.length} activities for staff ${staffId}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            activities: activities,
            staffId: staffId
          }),
        };
      } catch (error) {
        console.error('❌ Error fetching staff activities:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب أنشطة الموظف: ' + error.message
          }),
        };
      }
    }

    // GET /activity-logs/order/{orderId} - Get activities for specific order
    if (method === 'GET' && pathSegments.length >= 4 && pathSegments[pathSegments.length - 2] === 'order') {
      const orderId = pathSegments[pathSegments.length - 1];
      
      try {
        console.log('📦 Fetching activities for order:', orderId);

        const activityQuery = query(
          collection(db, 'activityLogs'),
          where('orderId', '==', orderId),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(activityQuery);
        const activities = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            ...data
          });
        });

        console.log(`✅ Found ${activities.length} activities for order ${orderId}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            activities: activities,
            orderId: orderId
          }),
        };
      } catch (error) {
        console.error('❌ Error fetching order activities:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'خطأ في جلب أنشطة الطلب: ' + error.message
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
    console.error('❌ Activity Logs API Error:', error);
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

// Helper function to log activity (can be imported and used in other functions)
exports.logActivity = async (activityData) => {
  try {
    const activityLog = {
      ...activityData,
      timestamp: new Date().toISOString()
    };

    const activityLogsCollection = collection(db, 'activityLogs');
    const docRef = await addDoc(activityLogsCollection, activityLog);
    
    console.log('✅ Activity logged:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return { success: false, error: error.message };
  }
};