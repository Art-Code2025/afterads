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
    
    console.log('👥 Customers API - Method:', method, 'Path:', path);

    // GET /customers - Get all customers
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'customers') {
      console.log('👥 Fetching all customers from Firestore');
      
      try {
        const customersCollection = collection(db, 'customers');
        const customersQuery = query(customersCollection, orderBy('createdAt', 'desc'));
        const customersSnapshot = await getDocs(customersQuery);
        
        const customers = [];
        customersSnapshot.forEach((doc) => {
          customers.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${customers.length} customers in Firestore`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(customers),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, falling back to mock data:', firestoreError);
        
        // Fallback to mock data if Firestore fails
        const mockCustomers = [
          {
            id: 'cu1',
            email: 'ahmed.ghamdi@email.com',
            firstName: 'أحمد',
            lastName: 'الغامدي',
            fullName: 'أحمد محمد الغامدي',
            phone: '+966501234567',
            city: 'الرياض',
            totalOrders: 3,
            totalSpent: 485.00,
            lastOrderDate: '2024-12-06T10:30:00Z',
            lastLogin: '2024-12-06T15:20:00Z',
            createdAt: '2024-11-01T08:00:00Z',
            status: 'active',
            cartItemsCount: 2,
            wishlistItemsCount: 5,
            hasCart: true,
            hasWishlist: true
          },
          {
            id: 'cu2',
            email: 'fatima.qahtani@email.com',
            firstName: 'فاطمة',
            lastName: 'القحطاني',
            fullName: 'فاطمة علي القحطاني',
            phone: '+966507654321',
            city: 'جدة',
            totalOrders: 1,
            totalSpent: 200.00,
            lastOrderDate: '2024-12-05T14:15:00Z',
            lastLogin: '2024-12-05T16:45:00Z',
            createdAt: '2024-10-15T10:30:00Z',
            status: 'active',
            cartItemsCount: 0,
            wishlistItemsCount: 3,
            hasCart: false,
            hasWishlist: true
          },
          {
            id: 'cu3',
            email: 'mohammed.salmi@email.com',
            firstName: 'محمد',
            lastName: 'السلمي',
            fullName: 'محمد عبدالرحمن السلمي',
            phone: '+966551234567',
            city: 'الخبر',
            totalOrders: 2,
            totalSpent: 376.00,
            lastOrderDate: '2024-12-04T09:45:00Z',
            lastLogin: '2024-12-04T11:30:00Z',
            createdAt: '2024-09-20T14:20:00Z',
            status: 'active',
            cartItemsCount: 1,
            wishlistItemsCount: 2,
            hasCart: true,
            hasWishlist: true
          },
          {
            id: 'cu4',
            email: 'sara.aldosari@email.com',
            firstName: 'سارة',
            lastName: 'الدوسري',
            fullName: 'سارة أحمد الدوسري',
            phone: '+966556789012',
            city: 'الدمام',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null,
            lastLogin: '2024-11-28T09:15:00Z',
            createdAt: '2024-11-25T12:00:00Z',
            status: 'active',
            cartItemsCount: 3,
            wishlistItemsCount: 8,
            hasCart: true,
            hasWishlist: true
          }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockCustomers),
        };
      }
    }

    // GET /customers/{id} - Get single customer
    if (method === 'GET' && pathSegments.length >= 2) {
      const customerId = pathSegments[pathSegments.length - 1];
      console.log('👥 Fetching customer:', customerId);
      
      try {
        const customerDoc = doc(db, 'customers', customerId);
        const customerSnapshot = await getDoc(customerDoc);
        
        if (!customerSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'العميل غير موجود' }),
          };
        }
        
        const customer = {
          id: customerSnapshot.id,
          ...customerSnapshot.data()
        };
        
        console.log('✅ Customer found:', customer.fullName || customer.email);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(customer),
        };
      } catch (error) {
        console.error('❌ Error fetching customer:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في جلب العميل' }),
        };
      }
    }

    // POST /customers - Create new customer
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Creating new customer:', body.email);
      
      try {
        const customerData = {
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: body.status || 'active',
          totalOrders: 0,
          totalSpent: 0,
          cartItemsCount: 0,
          wishlistItemsCount: 0,
          hasCart: false,
          hasWishlist: false
        };
        
        const customersCollection = collection(db, 'customers');
        const docRef = await addDoc(customersCollection, customerData);
        
        const newCustomer = {
          id: docRef.id,
          ...customerData
        };
        
        console.log('✅ Customer created with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newCustomer),
        };
      } catch (error) {
        console.error('❌ Error creating customer:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في إنشاء العميل: ' + error.message }),
        };
      }
    }

    // PUT /customers/{id} - Update customer
    if (method === 'PUT' && pathSegments.length >= 2) {
      const customerId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating customer:', customerId);
      
      try {
        const customerDoc = doc(db, 'customers', customerId);
        const updateData = {
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(customerDoc, updateData);
        
        // Get updated customer
        const updatedSnapshot = await getDoc(customerDoc);
        const updatedCustomer = {
          id: updatedSnapshot.id,
          ...updatedSnapshot.data()
        };
        
        console.log('✅ Customer updated:', updatedCustomer.fullName || updatedCustomer.email);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedCustomer),
        };
      } catch (error) {
        console.error('❌ Error updating customer:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في تحديث العميل: ' + error.message }),
        };
      }
    }

    // DELETE /customers/{id} - Delete customer
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const customerId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting customer:', customerId);
      
      try {
        const customerDoc = doc(db, 'customers', customerId);
        await deleteDoc(customerDoc);
        
        console.log('✅ Customer deleted successfully');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف العميل بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error deleting customer:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف العميل: ' + error.message }),
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
    console.error('❌ Customers API Error:', error);
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