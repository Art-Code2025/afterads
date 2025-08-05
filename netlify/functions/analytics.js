import { db } from './config/firebase.js';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  limit,
  Timestamp
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
    const path = event.path;
    
    console.log('📊 Analytics API - Method:', method, 'Path:', path);

    if (method === 'GET') {
      console.log('📊 Fetching analytics data from Firestore');
      
      try {
        // Fetch all necessary collections
        const [ordersSnapshot, productsSnapshot, customersSnapshot, couponsSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'customers')),
          getDocs(collection(db, 'coupons'))
        ]);

        // Process orders
        const orders = [];
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Process products
        const products = [];
        productsSnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });

        // Process customers
        const customers = [];
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          customers.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Process coupons
        const coupons = [];
        couponsSnapshot.forEach((doc) => {
          coupons.push({ id: doc.id, ...doc.data() });
        });

        // Calculate real analytics data
        const analytics = calculateAnalytics(orders, products, customers, coupons);
        
        console.log(`✅ Analytics data compiled successfully`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(analytics),
        };

      } catch (firestoreError) {
        console.error('❌ Firestore error in analytics:', firestoreError);
        
        // Return empty analytics structure
        const emptyAnalytics = {
          dailySales: [],
          monthlySales: [],
          dailyVisitors: [],
          servicesSold: {
            total: 0,
            byCategory: []
          },
          topSellingServices: [],
          couponReports: {
            totalUsed: 0,
            totalSavings: 0,
            byCode: []
          },
          conversionRate: 0,
          averageOrderValue: 0,
          customerRetention: 0,
          monthlyChart: [],
          error: 'لا توجد بيانات متاحة حالياً'
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(emptyAnalytics),
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
    console.error('❌ Analytics API Error:', error);
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

// Helper function to calculate analytics
function calculateAnalytics(orders, products, customers, coupons) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Filter completed orders only
  const completedOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'completed'
  );
  
  // Calculate daily sales for last 30 days
  const dailySales = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toISOString().split('T')[0] === dateStr;
    });
    
    const dayTotal = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    dailySales.push({
      date: dateStr,
      sales: dayTotal,
      orders: dayOrders.length,
      formattedDate: date.toLocaleDateString('ar-SA')
    });
  }
  
  // Calculate monthly sales for last 12 months
  const monthlySales = [];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[monthDate.getMonth()];
    
    const monthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === monthDate.getMonth() && 
             orderDate.getFullYear() === monthDate.getFullYear();
    });
    
    const monthTotal = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    monthlySales.push({
      month: monthName,
      year: monthDate.getFullYear(),
      sales: monthTotal,
      orders: monthOrders.length
    });
  }
  
  // Calculate daily visitors (using customers as proxy)
  const dailyVisitors = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayCustomers = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate.toISOString().split('T')[0] === dateStr;
    });
    
    dailyVisitors.push({
      date: dateStr,
      visitors: dayCustomers.length,
      formattedDate: date.toLocaleDateString('ar-SA')
    });
  }
  
  // Calculate services sold by category
  const categoryStats = {};
  completedOrders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.categoryId) {
          if (!categoryStats[product.categoryId]) {
            categoryStats[product.categoryId] = {
              categoryName: product.categoryName || 'غير محدد',
              quantity: 0,
              revenue: 0
            };
          }
          categoryStats[product.categoryId].quantity += item.quantity || 1;
          categoryStats[product.categoryId].revenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    }
  });
  
  const servicesSold = {
    total: Object.values(categoryStats).reduce((sum, cat) => sum + cat.quantity, 0),
    byCategory: Object.values(categoryStats)
  };
  
  // Calculate top selling services
  const productStats = {};
  completedOrders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!productStats[product.id]) {
            productStats[product.id] = {
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productStats[product.id].quantity += item.quantity || 1;
          productStats[product.id].revenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    }
  });
  
  const topSellingServices = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  
  // Calculate coupon usage
  const couponUsage = {};
  let totalSavings = 0;
  
  orders.forEach(order => {
    if (order.couponCode) {
      const coupon = coupons.find(c => c.code === order.couponCode);
      if (coupon) {
        if (!couponUsage[order.couponCode]) {
          couponUsage[order.couponCode] = {
            code: order.couponCode,
            name: coupon.name || order.couponCode,
            usageCount: 0,
            totalSavings: 0
          };
        }
        couponUsage[order.couponCode].usageCount++;
        const savings = order.discount || 0;
        couponUsage[order.couponCode].totalSavings += savings;
        totalSavings += savings;
      }
    }
  });
  
  const couponReports = {
    totalUsed: Object.values(couponUsage).reduce((sum, c) => sum + c.usageCount, 0),
    totalSavings: totalSavings,
    byCode: Object.values(couponUsage)
  };
  
  // Calculate conversion rate (orders / customers)
  const conversionRate = customers.length > 0 ? (orders.length / customers.length) * 100 : 0;
  
  // Calculate average order value
  const averageOrderValue = completedOrders.length > 0 ? 
    completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) / completedOrders.length : 0;
  
  // Calculate customer retention (customers with more than one order)
  const customerOrderCounts = {};
  orders.forEach(order => {
    if (order.customerId) {
      customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
    }
  });
  
  const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const customerRetention = customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0;
  
  // Prepare monthly chart data (last 6 months)
  const monthlyChart = monthlySales.slice(-6).map(month => ({
    name: month.month,
    sales: month.sales,
    orders: month.orders
  }));
  
  return {
    dailySales,
    monthlySales,
    dailyVisitors,
    servicesSold,
    topSellingServices,
    couponReports,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    customerRetention: Math.round(customerRetention * 100) / 100,
    monthlyChart,
    lastUpdated: new Date().toISOString()
  };
}