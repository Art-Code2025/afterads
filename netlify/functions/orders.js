import { db } from './config/firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  limit 
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
    const pathSegments = path.split('/').filter(Boolean);
    
    console.log('📋 Orders API - Method:', method, 'Path:', path);

    // GET /orders - Get all orders
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'orders') {
      console.log('📋 Fetching all orders from Firestore');
      
      try {
        const ordersCollection = collection(db, 'orders');
        const ordersQuery = query(ordersCollection, orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        const orders = [];
        ordersSnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${orders.length} orders in Firestore`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(orders),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, falling back to mock data:', firestoreError);
        
        // Fallback to mock data if Firestore fails
        const mockOrders = [
          {
            id: 'o1',
            customerName: 'أحمد محمد الغامدي',
            customerPhone: '+966501234567',
            customerEmail: 'ahmed.ghamdi@email.com',
            address: 'شارع الأمير محمد بن عبدالعزيز، حي الملز',
            city: 'الرياض',
            items: [
              {
                productId: 'p1',
                productName: 'وشاح التخرج الكلاسيكي',
                price: 85.00,
                quantity: 1,
                totalPrice: 85.00,
                selectedOptions: {
                  nameOnSash: 'أحمد محمد الغامدي',
                  embroideryColor: 'ذهبي'
                },
                productImage: 'graduation-sash-1.jpg'
              }
            ],
            subtotal: 85.00,
            deliveryFee: 25.00,
            couponDiscount: 0,
            total: 110.00,
            paymentMethod: 'cash_on_delivery',
            paymentStatus: 'pending',
            status: 'confirmed',
            createdAt: '2024-12-06T10:30:00Z',
            notes: 'يرجى التأكد من دقة التطريز'
          },
          {
            id: 'o2',
            customerName: 'فاطمة علي القحطاني',
            customerPhone: '+966507654321',
            customerEmail: 'fatima.qahtani@email.com',
            address: 'شارع التحلية، حي النخيل',
            city: 'جدة',
            items: [
              {
                productId: 'p2',
                productName: 'عباءة التخرج الأكاديمية',
                price: 180.00,
                quantity: 1,
                totalPrice: 180.00,
                selectedOptions: {
                  size: 'متوسط',
                  capColor: 'أسود'
                },
                productImage: 'graduation-gown-1.jpg'
              }
            ],
            subtotal: 180.00,
            deliveryFee: 35.00,
            couponDiscount: 15.00,
            total: 200.00,
            paymentMethod: 'bank_transfer',
            paymentStatus: 'paid',
            status: 'preparing',
            createdAt: '2024-12-05T14:15:00Z',
            notes: ''
          },
          {
            id: 'o3',
            customerName: 'محمد عبدالرحمن السلمي',
            customerPhone: '+966551234567',
            customerEmail: 'mohammed.salmi@email.com',
            address: 'شارع الملك فهد، حي الراكة',
            city: 'الخبر',
            items: [
              {
                productId: 'p3',
                productName: 'زي مدرسي موحد',
                price: 120.00,
                quantity: 2,
                totalPrice: 240.00,
                selectedOptions: {
                  size: 'L',
                  color: 'أزرق'
                },
                productImage: 'school-uniform-1.jpg'
              }
            ],
            subtotal: 240.00,
            deliveryFee: 40.00,
            couponDiscount: 24.00,
            total: 256.00,
            paymentMethod: 'online_payment',
            paymentStatus: 'paid',
            status: 'delivered',
            createdAt: '2024-12-04T09:45:00Z',
            notes: 'تم التسليم بنجاح'
          }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockOrders),
        };
      }
    }

    // GET /orders/{id} - Get single order
    if (method === 'GET' && pathSegments.length >= 2) {
      const orderId = pathSegments[pathSegments.length - 1];
      console.log('📋 Fetching order:', orderId);
      
      try {
        const orderDoc = doc(db, 'orders', orderId);
        const orderSnapshot = await getDoc(orderDoc);
        
        if (!orderSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'الطلب غير موجود' }),
          };
        }
        
        const order = {
          id: orderSnapshot.id,
          ...orderSnapshot.data()
        };
        
        console.log('✅ Order found:', order.customerName);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(order),
        };
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في جلب الطلب' }),
        };
      }
    }

    // POST /orders - Create new order
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Creating new order for:', body.customerName);
      
      try {
        const orderData = {
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: body.status || 'pending',
          paymentStatus: body.paymentStatus || 'pending'
        };
        
        const ordersCollection = collection(db, 'orders');
        const docRef = await addDoc(ordersCollection, orderData);
        
        const newOrder = {
          id: docRef.id,
          ...orderData
        };
        
        console.log('✅ Order created with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newOrder),
        };
      } catch (error) {
        console.error('❌ Error creating order:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في إنشاء الطلب: ' + error.message }),
        };
      }
    }

    // PUT /orders/{id} - Update order
    if (method === 'PUT' && pathSegments.length >= 2) {
      const orderId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating order:', orderId);
      
      try {
        const orderDoc = doc(db, 'orders', orderId);
        const updateData = {
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(orderDoc, updateData);
        
        // Get updated order
        const updatedSnapshot = await getDoc(orderDoc);
        const updatedOrder = {
          id: updatedSnapshot.id,
          ...updatedSnapshot.data()
        };
        
        console.log('✅ Order updated:', updatedOrder.customerName);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedOrder),
        };
      } catch (error) {
        console.error('❌ Error updating order:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في تحديث الطلب: ' + error.message }),
        };
      }
    }

    // DELETE /orders/{id} - Delete order
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const orderId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting order:', orderId);
      
      try {
        const orderDoc = doc(db, 'orders', orderId);
        await deleteDoc(orderDoc);
        
        console.log('✅ Order deleted successfully');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف الطلب بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error deleting order:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف الطلب: ' + error.message }),
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
    console.error('❌ Orders API Error:', error);
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