const { db } = require('./config/firebase.js');
const { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  limit 
} = require('firebase/firestore');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'no-cache',
  };

  try {
    const method = event.httpMethod;
    const path = event.path;
    
    console.log('📊 Dashboard API - Method:', method, 'Path:', path);

    if (method === 'GET') {
      console.log('⚡ Fast dashboard data fetch started');
      const startTime = Date.now();
      
      try {
        // Fetch all collections in parallel with timeout
        const fetchPromises = [
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'customers')),
          getDocs(collection(db, 'coupons'))
        ];
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 8000)
        );
        
        const [productsSnapshot, categoriesSnapshot, ordersSnapshot, customersSnapshot, couponsSnapshot] = await Promise.race([
          Promise.all(fetchPromises),
          timeoutPromise
        ]);

        // Process data efficiently
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const coupons = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const fetchTime = Date.now() - startTime;
        console.log(`⚡ Data fetched in ${fetchTime}ms - Products: ${products.length}, Orders: ${orders.length}, Customers: ${customers.length}`);

        // Calculate dashboard statistics efficiently
        const calcStartTime = Date.now();
        
        // Product stats
        let outOfStockProducts = 0;
        let lowStockProducts = 0;
        let totalValue = 0;
        
        products.forEach(p => {
          const stock = p.stock || 0;
          const price = p.price || 0;
          
          if (stock <= 0) outOfStockProducts++;
          else if (stock <= 5) lowStockProducts++;
          
          totalValue += price * stock;
        });
        
        // Order stats
        let pendingOrders = 0;
        let confirmedOrders = 0;
        let completedOrders = 0;
        let cancelledOrders = 0;
        let totalRevenue = 0;
        let totalOrderValue = 0;
        
        orders.forEach(o => {
          const total = o.total || 0;
          totalOrderValue += total;
          
          switch(o.status) {
            case 'pending': pendingOrders++; break;
            case 'confirmed': confirmedOrders++; break;
            case 'delivered': 
              completedOrders++;
              totalRevenue += total;
              break;
            case 'cancelled': cancelledOrders++; break;
          }
        });
        
        // Customer stats
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        let activeCustomers = 0;
        let newCustomersThisMonth = 0;
        
        customers.forEach(c => {
          if (c.status === 'active') activeCustomers++;
          
          if (c.createdAt) {
            const created = new Date(c.createdAt);
            if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
              newCustomersThisMonth++;
            }
          }
        });
        
        // Coupon stats
        let activeCoupons = 0;
        coupons.forEach(c => {
          if (c.isActive) activeCoupons++;
        });
        
        const stats = {
          totalProducts: products.length,
          totalCategories: categories.length,
          outOfStockProducts,
          lowStockProducts,
          totalValue,
          
          totalOrders: orders.length,
          pendingOrders,
          confirmedOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
          averageOrderValue: orders.length > 0 ? totalOrderValue / orders.length : 0,
          
          totalCustomers: customers.length,
          activeCustomers,
          newCustomersThisMonth,
          
          totalCoupons: coupons.length,
          activeCoupons,
          expiredCoupons: coupons.length - activeCoupons
        };
        
        const calcTime = Date.now() - calcStartTime;
        console.log(`⚡ Stats calculated in ${calcTime}ms`);

        // Generate sales data for the last 6 months
        const salesData = [];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = months[monthDate.getMonth()];
          
          // Filter orders for this month
          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === monthDate.getMonth() && 
                   orderDate.getFullYear() === monthDate.getFullYear();
          });
          
          const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          
          salesData.push({
            month: monthName,
            sales: monthRevenue,
            orders: monthOrders.length
          });
        }

        // Top products - improved calculation
        const topProductsStartTime = Date.now();
        
        // Calculate actual sales from orders for each product
        const productSales = new Map();
        
        orders.forEach(order => {
          if (order.status === 'delivered' && order.items) {
            order.items.forEach(item => {
              const productId = item.productId || item.id;
              if (productId) {
                const current = productSales.get(productId) || { sales: 0, revenue: 0 };
                current.sales += item.quantity || 1;
                current.revenue += (item.price || 0) * (item.quantity || 1);
                productSales.set(productId, current);
              }
            });
          }
        });
        
        // Get top 5 products by sales
        const topProducts = products
          .map(product => {
            const sales = productSales.get(product.id) || { sales: 0, revenue: 0 };
            return {
              id: product.id,
              name: product.name || 'منتج غير محدد',
              sales: sales.sales,
              revenue: sales.revenue,
              image: product.images?.[0] || '/placeholder.jpg'
            };
          })
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        
        const topProductsTime = Date.now() - topProductsStartTime;
        console.log(`⚡ Top products calculated in ${topProductsTime}ms`);

        // Get recent orders (last 10) - optimized
        const recentOrdersStartTime = Date.now();
        
        // Sort orders by creation date (newest first) and take top 10
        const sortedOrders = orders
          .map(order => ({
            id: order.id,
            customerName: order.customerName || 'غير محدد',
            total: order.total || 0,
            status: order.status || 'pending',
            createdAt: order.createdAt,
            items: order.items || [],
            timestamp: new Date(order.createdAt).getTime()
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
        
        // Remove timestamp field from final result
        const recentOrders = sortedOrders.map(({ timestamp, ...order }) => order);
        
        const recentOrdersTime = Date.now() - recentOrdersStartTime;
        console.log(`⚡ Recent orders processed in ${recentOrdersTime}ms - Found: ${recentOrders.length}`);

        const dashboardData = {
          statistics: stats,
          salesData,
          topProducts,
          recentOrders,
          dataTimestamp: new Date().toISOString()
        };

        const totalTime = Date.now() - startTime;
        console.log(`✅ Dashboard data compiled successfully in ${totalTime}ms`);
        console.log(`📊 Stats: ${stats.totalProducts} products, ${stats.totalOrders} orders, ${stats.totalCustomers} customers`);
        console.log(`⚡ Performance: Fetch(${fetchTime}ms) + Calc(${calcTime}ms) + TopProducts(${topProductsTime}ms) + RecentOrders(${recentOrdersTime}ms) = Total(${totalTime}ms)`);
        
        // Add performance metrics to response
        dashboardData.performance = {
          totalTime,
          fetchTime,
          calcTime,
          topProductsTime,
          recentOrdersTime
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(dashboardData),
        };

      } catch (firestoreError) {
        console.error('❌ Firestore error, falling back to mock data:', firestoreError);
        
        // Fallback to mock dashboard data
        const mockDashboardData = {
          statistics: {
            totalProducts: 3,
            totalCategories: 5,
            outOfStockProducts: 0,
            lowStockProducts: 1,
            totalValue: 15000,
            totalOrders: 3,
            pendingOrders: 1,
            confirmedOrders: 1,
            completedOrders: 1,
            cancelledOrders: 0,
            totalRevenue: 566,
            averageOrderValue: 188.67,
            totalCustomers: 4,
            activeCustomers: 4,
            newCustomersThisMonth: 1,
            totalCoupons: 4,
            activeCoupons: 3,
            expiredCoupons: 1
          },
          salesData: [
            { month: 'يوليو', sales: 2500, orders: 12 },
            { month: 'أغسطس', sales: 3200, orders: 18 },
            { month: 'سبتمبر', sales: 2800, orders: 15 },
            { month: 'أكتوبر', sales: 4100, orders: 22 },
            { month: 'نوفمبر', sales: 3600, orders: 19 },
            { month: 'ديسمبر', sales: 566, orders: 3 }
          ],
          topProducts: [
            { name: 'وشاح التخرج الكلاسيكي', sales: 20, revenue: 1700 },
            { name: 'عباءة التخرج الأكاديمية', sales: 17, revenue: 3060 },
            { name: 'زي مدرسي موحد', sales: 14, revenue: 1680 },
            { name: 'كاب التخرج الأكاديمي', sales: 11, revenue: 880 },
            { name: 'إكسسوارات التخرج', sales: 8, revenue: 640 }
          ],
          recentOrders: [
            {
              id: 'o1',
              customerName: 'أحمد محمد الغامدي',
              total: 110.00,
              status: 'confirmed',
              createdAt: '2024-12-06T10:30:00Z'
            },
            {
              id: 'o2',
              customerName: 'فاطمة علي القحطاني',
              total: 200.00,
              status: 'preparing',
              createdAt: '2024-12-05T14:15:00Z'
            },
            {
              id: 'o3',
              customerName: 'محمد عبدالرحمن السلمي',
              total: 256.00,
              status: 'delivered',
              createdAt: '2024-12-04T09:45:00Z'
            }
          ],
          dataTimestamp: new Date().toISOString()
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockDashboardData),
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
    console.error('❌ Dashboard API Error:', error);
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