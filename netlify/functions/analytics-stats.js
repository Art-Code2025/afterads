import { db } from './config/firebase.js';
import { 
  collection, 
  getDocs, 
  doc,
  setDoc,
  query, 
  where,
  orderBy
} from 'firebase/firestore';

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
    const { action } = event.queryStringParameters || {};
    
    console.log('📊 Analytics Stats API - Method:', method, 'Action:', action);

    if (method === 'POST' && action === 'calculate') {
      console.log('🔄 Starting analytics calculation...');
      
      try {
        // Fetch all necessary data
        const [ordersSnapshot, productsSnapshot, customersSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'customers'))
        ]);

        // Process data
        const orders = [];
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        const products = [];
        productsSnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });

        const customers = [];
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          customers.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Calculate and save daily stats
        await calculateAndSaveDailyStats(orders, products, customers);
        
        // Calculate and save monthly stats
        await calculateAndSaveMonthlyStats(orders, products, customers);
        
        console.log('✅ Analytics calculation completed successfully');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'تم حساب الإحصائيات بنجاح',
            timestamp: new Date().toISOString()
          }),
        };

      } catch (error) {
        console.error('❌ Error calculating analytics:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في حساب الإحصائيات',
            details: error.message 
          }),
        };
      }
    }
    
    if (method === 'GET') {
      const { type, date } = event.queryStringParameters || {};
      
      if (type === 'daily') {
        // Get daily stats
        const dailyStatsSnapshot = await getDocs(
          collection(db, 'analytics_daily')
        );
        
        const dailyStats = [];
        dailyStatsSnapshot.forEach((doc) => {
          dailyStats.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort manually by date in descending order
        dailyStats.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(dailyStats),
        };
      }
      
      if (type === 'monthly') {
        // Get monthly stats
        const monthlyStatsSnapshot = await getDocs(
          collection(db, 'analytics_monthly')
        );
        
        const monthlyStats = [];
        monthlyStatsSnapshot.forEach((doc) => {
          monthlyStats.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort manually by year and month in descending order
        monthlyStats.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year; // Sort by year descending
          }
          return b.month - a.month; // Sort by month descending
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(monthlyStats),
        };
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('❌ Analytics Stats API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'خطأ في الخادم',
        details: error.message 
      }),
    };
  }
};

// Calculate and save daily statistics
async function calculateAndSaveDailyStats(orders, products, customers) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  
  // Calculate stats for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter data for this specific day
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toISOString().split('T')[0] === dateStr;
    });
    
    const dayCustomers = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate.toISOString().split('T')[0] === dateStr;
    });
    
    const completedDayOrders = dayOrders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    );
    
    // Calculate daily statistics
    const dailyStats = {
      date: dateStr,
      formattedDate: date.toLocaleDateString('ar-SA'),
      totalOrders: dayOrders.length,
      completedOrders: completedDayOrders.length,
      totalSales: completedDayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      newCustomers: dayCustomers.length,
      averageOrderValue: completedDayOrders.length > 0 ? 
        completedDayOrders.reduce((sum, order) => sum + (order.total || 0), 0) / completedDayOrders.length : 0,
      
      // Product statistics
      productsSold: calculateProductsSold(completedDayOrders, products),
      
      // Order status breakdown
      ordersByStatus: {
        pending: dayOrders.filter(o => o.status === 'pending').length,
        confirmed: dayOrders.filter(o => o.status === 'confirmed').length,
        preparing: dayOrders.filter(o => o.status === 'preparing').length,
        shipped: dayOrders.filter(o => o.status === 'shipped').length,
        delivered: dayOrders.filter(o => o.status === 'delivered').length,
        cancelled: dayOrders.filter(o => o.status === 'cancelled').length
      },
      
      calculatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    const docId = dateStr;
    await setDoc(doc(db, 'analytics_daily', docId), dailyStats);
  }
  
  console.log('✅ Daily statistics calculated and saved');
}

// Calculate and save monthly statistics
async function calculateAndSaveMonthlyStats(orders, products, customers) {
  const now = new Date();
  
  // Calculate stats for the last 12 months
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1; // 1-based month
    
    // Filter data for this specific month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === monthDate.getMonth() && 
             orderDate.getFullYear() === monthDate.getFullYear();
    });
    
    const monthCustomers = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate.getMonth() === monthDate.getMonth() && 
             customerDate.getFullYear() === monthDate.getFullYear();
    });
    
    const completedMonthOrders = monthOrders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    );
    
    // Calculate monthly statistics
    const monthlyStats = {
      year: year,
      month: month,
      monthName: getMonthName(month),
      totalOrders: monthOrders.length,
      completedOrders: completedMonthOrders.length,
      totalSales: completedMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      newCustomers: monthCustomers.length,
      averageOrderValue: completedMonthOrders.length > 0 ? 
        completedMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0) / completedMonthOrders.length : 0,
      
      // Product statistics
      productsSold: calculateProductsSold(completedMonthOrders, products),
      
      // Order status breakdown
      ordersByStatus: {
        pending: monthOrders.filter(o => o.status === 'pending').length,
        confirmed: monthOrders.filter(o => o.status === 'confirmed').length,
        preparing: monthOrders.filter(o => o.status === 'preparing').length,
        shipped: monthOrders.filter(o => o.status === 'shipped').length,
        delivered: monthOrders.filter(o => o.status === 'delivered').length,
        cancelled: monthOrders.filter(o => o.status === 'cancelled').length
      },
      
      // Growth compared to previous month
      growthRate: 0, // Will be calculated separately
      
      calculatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    const docId = `${year}-${month.toString().padStart(2, '0')}`;
    await setDoc(doc(db, 'analytics_monthly', docId), monthlyStats);
  }
  
  console.log('✅ Monthly statistics calculated and saved');
}

// Helper function to calculate products sold
function calculateProductsSold(orders, products) {
  const productStats = {};
  let totalQuantity = 0;
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!productStats[product.id]) {
            productStats[product.id] = {
              id: product.id,
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          const quantity = item.quantity || 1;
          const price = item.price || product.price || 0;
          
          productStats[product.id].quantity += quantity;
          productStats[product.id].revenue += price * quantity;
          totalQuantity += quantity;
        }
      });
    }
  });
  
  return {
    totalQuantity,
    byProduct: Object.values(productStats)
  };
}

// Helper function to get month name in Arabic
function getMonthName(month) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month - 1];
}