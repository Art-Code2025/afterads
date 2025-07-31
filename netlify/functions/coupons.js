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
  where 
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
    
    console.log('🎫 Coupons API - Method:', method, 'Path:', path);

    // GET /coupons - Get all coupons
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'coupons') {
      console.log('🎫 Fetching all coupons from Firestore');
      
      try {
        const couponsCollection = collection(db, 'coupons');
        const couponsQuery = query(couponsCollection, orderBy('createdAt', 'desc'));
        const couponsSnapshot = await getDocs(couponsQuery);
        
        const coupons = [];
        couponsSnapshot.forEach((doc) => {
          coupons.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${coupons.length} coupons in Firestore`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(coupons),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, falling back to mock data:', firestoreError);
        
        // Fallback to mock data if Firestore fails
        const mockCoupons = [
          {
            id: 'cp1',
            name: 'خصم الطلاب الجدد',
            code: 'WELCOME10',
            description: 'خصم 10% على أول طلب للطلاب الجدد',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 100,
            maxDiscountAmount: 50,
            usageLimit: 100,
            usedCount: 15,
            isActive: true,
            validFrom: '2024-12-01T00:00:00Z',
            validUntil: '2024-12-31T23:59:59Z',
            applicableCategories: [],
            applicableProducts: [],
            createdAt: '2024-12-01T08:00:00Z'
          },
          {
            id: 'cp2',
            name: 'خصم التخرج الذهبي',
            code: 'GRAD25',
            description: 'خصم 25% على منتجات التخرج',
            discountType: 'percentage',
            discountValue: 25,
            minOrderAmount: 200,
            maxDiscountAmount: 100,
            usageLimit: 50,
            usedCount: 8,
            isActive: true,
            validFrom: '2024-12-01T00:00:00Z',
            validUntil: '2024-12-25T23:59:59Z',
            applicableCategories: ['c1', 'c2'],
            applicableProducts: [],
            createdAt: '2024-12-01T09:00:00Z'
          },
          {
            id: 'cp3',
            name: 'خصم ثابت للمناسبات',
            code: 'SPECIAL50',
            description: 'خصم 50 ريال على الطلبات فوق 300 ريال',
            discountType: 'fixed',
            discountValue: 50,
            minOrderAmount: 300,
            maxDiscountAmount: 50,
            usageLimit: 30,
            usedCount: 12,
            isActive: true,
            validFrom: '2024-12-01T00:00:00Z',
            validUntil: '2024-12-20T23:59:59Z',
            applicableCategories: [],
            applicableProducts: [],
            createdAt: '2024-12-01T10:00:00Z'
          },
          {
            id: 'cp4',
            name: 'خصم منتهي الصلاحية',
            code: 'EXPIRED20',
            description: 'خصم 20% منتهي الصلاحية',
            discountType: 'percentage',
            discountValue: 20,
            minOrderAmount: 150,
            maxDiscountAmount: 75,
            usageLimit: 20,
            usedCount: 20,
            isActive: false,
            validFrom: '2024-11-01T00:00:00Z',
            validUntil: '2024-11-30T23:59:59Z',
            applicableCategories: [],
            applicableProducts: [],
            createdAt: '2024-11-01T08:00:00Z'
          }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockCoupons),
        };
      }
    }

    // GET /coupons/{id} - Get single coupon
    if (method === 'GET' && pathSegments.length >= 2) {
      const couponId = pathSegments[pathSegments.length - 1];
      console.log('🎫 Fetching coupon:', couponId);
      
      try {
        const couponDoc = doc(db, 'coupons', couponId);
        const couponSnapshot = await getDoc(couponDoc);
        
        if (!couponSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'الكوبون غير موجود' }),
          };
        }
        
        const coupon = {
          id: couponSnapshot.id,
          ...couponSnapshot.data()
        };
        
        console.log('✅ Coupon found:', coupon.name);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(coupon),
        };
      } catch (error) {
        console.error('❌ Error fetching coupon:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في جلب الكوبون' }),
        };
      }
    }

    // POST /coupons - Create new coupon
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Creating new coupon:', body.name);
      
      try {
        const couponData = {
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usedCount: 0,
          isActive: body.isActive !== undefined ? body.isActive : true
        };
        
        const couponsCollection = collection(db, 'coupons');
        const docRef = await addDoc(couponsCollection, couponData);
        
        const newCoupon = {
          id: docRef.id,
          ...couponData
        };
        
        console.log('✅ Coupon created with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newCoupon),
        };
      } catch (error) {
        console.error('❌ Error creating coupon:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في إنشاء الكوبون: ' + error.message }),
        };
      }
    }

    // PUT /coupons/{id} - Update coupon
    if (method === 'PUT' && pathSegments.length >= 2) {
      const couponId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating coupon:', couponId);
      
      try {
        const couponDoc = doc(db, 'coupons', couponId);
        const updateData = {
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(couponDoc, updateData);
        
        // Get updated coupon
        const updatedSnapshot = await getDoc(couponDoc);
        const updatedCoupon = {
          id: updatedSnapshot.id,
          ...updatedSnapshot.data()
        };
        
        console.log('✅ Coupon updated:', updatedCoupon.name);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedCoupon),
        };
      } catch (error) {
        console.error('❌ Error updating coupon:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في تحديث الكوبون: ' + error.message }),
        };
      }
    }

    // DELETE /coupons/{id} - Delete coupon
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const couponId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting coupon:', couponId);
      
      try {
        const couponDoc = doc(db, 'coupons', couponId);
        await deleteDoc(couponDoc);
        
        console.log('✅ Coupon deleted successfully');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف الكوبون بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error deleting coupon:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف الكوبون: ' + error.message }),
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
    console.error('❌ Coupons API Error:', error);
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