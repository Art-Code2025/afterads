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
  where, 
  orderBy 
} from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🛒 Cart API Called:', {
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString()
  });

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
    
    console.log('🛒 Cart API - Method:', method, 'Path:', path, 'Segments:', pathSegments);

    // Validate Firebase connection
    if (!db) {
      console.error('❌ Firebase DB not initialized!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection failed' }),
      };
    }

    // GET /cart - Get cart (guest or user)
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'cart') {
      const { sessionId, userId } = event.queryStringParameters || {};
      console.log('🛒 Fetching cart for:', { sessionId, userId });
      
      if (!sessionId && !userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'sessionId أو userId مطلوب' }),
        };
      }

      const cartsCollection = collection(db, 'carts');
      let cartQuery;
      
      if (userId) {
        cartQuery = query(cartsCollection, where('userId', '==', userId));
      } else {
        cartQuery = query(cartsCollection, where('sessionId', '==', sessionId));
      }
      
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        console.log('📭 No cart found, returning empty cart');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ items: [] }),
        };
      }

      const cartDoc = cartSnapshot.docs[0];
      const cartData = {
        id: cartDoc.id,
        ...cartDoc.data()
      };
      
      console.log(`✅ Found cart with ${cartData.items?.length || 0} items`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cartData),
      };
    }

    // POST /cart - Save cart (guest or user)
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { sessionId, userId, items } = body;
      
      console.log('💾 Saving cart for:', { sessionId, userId, itemsCount: items?.length });
      
      if (!sessionId && !userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'sessionId أو userId مطلوب' }),
        };
      }

      if (!Array.isArray(items)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'items يجب أن يكون array' }),
        };
      }

      const cartsCollection = collection(db, 'carts');
      
      // Check if cart already exists
      let cartQuery;
      if (userId) {
        cartQuery = query(cartsCollection, where('userId', '==', userId));
      } else {
        cartQuery = query(cartsCollection, where('sessionId', '==', sessionId));
      }
      
      const existingCartSnapshot = await getDocs(cartQuery);
      
      const cartData = {
        items,
        updatedAt: new Date().toISOString(),
        totalItems: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
        ...(userId ? { userId } : { sessionId })
      };

      let cartId;
      
      if (!existingCartSnapshot.empty) {
        // Update existing cart
        const existingCartDoc = existingCartSnapshot.docs[0];
        cartId = existingCartDoc.id;
        await updateDoc(doc(db, 'carts', cartId), cartData);
        console.log('✅ Updated existing cart:', cartId);
      } else {
        // Create new cart
        cartData.createdAt = new Date().toISOString();
        const docRef = await addDoc(cartsCollection, cartData);
        cartId = docRef.id;
        console.log('✅ Created new cart:', cartId);
      }
      
      const savedCart = {
        id: cartId,
        ...cartData
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(savedCart),
      };
    }

    // DELETE /cart - Clear cart
    if (method === 'DELETE' && pathSegments[pathSegments.length - 1] === 'cart') {
      const { sessionId, userId } = event.queryStringParameters || {};
      console.log('🗑️ Clearing cart for:', { sessionId, userId });
      
      if (!sessionId && !userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'sessionId أو userId مطلوب' }),
        };
      }

      const cartsCollection = collection(db, 'carts');
      let cartQuery;
      
      if (userId) {
        cartQuery = query(cartsCollection, where('userId', '==', userId));
      } else {
        cartQuery = query(cartsCollection, where('sessionId', '==', sessionId));
      }
      
      const cartSnapshot = await getDocs(cartQuery);
      
      if (!cartSnapshot.empty) {
        const cartDoc = cartSnapshot.docs[0];
        await deleteDoc(doc(db, 'carts', cartDoc.id));
        console.log('✅ Cart cleared successfully');
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'تم مسح السلة بنجاح' }),
      };
    }

    // POST /cart/merge - Merge guest cart with user cart
    if (method === 'POST' && pathSegments.includes('merge')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { sessionId, userId, guestItems } = body;
      
      console.log('🔄 Merging carts:', { sessionId, userId, guestItemsCount: guestItems?.length });
      
      if (!sessionId || !userId || !Array.isArray(guestItems)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'sessionId, userId, and guestItems are required' }),
        };
      }

      const cartsCollection = collection(db, 'carts');
      
      // Get user's existing cart
      const userCartQuery = query(cartsCollection, where('userId', '==', userId));
      const userCartSnapshot = await getDocs(userCartQuery);
      
      let mergedItems = [...guestItems];
      
      if (!userCartSnapshot.empty) {
        const userCartData = userCartSnapshot.docs[0].data();
        const userItems = userCartData.items || [];
        
        // Merge items (avoid duplicates based on productId and selectedOptions)
        userItems.forEach(userItem => {
          const existsInGuest = guestItems.find(guestItem => 
            guestItem.productId === userItem.productId &&
            JSON.stringify(guestItem.selectedOptions) === JSON.stringify(userItem.selectedOptions)
          );
          
          if (!existsInGuest) {
            mergedItems.push(userItem);
          }
        });
      }
      
      // Save merged cart
      const mergedCartData = {
        userId,
        items: mergedItems,
        updatedAt: new Date().toISOString(),
        totalItems: mergedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
      };
      
      // Update or create user cart
      if (!userCartSnapshot.empty) {
        const userCartDoc = userCartSnapshot.docs[0];
        await updateDoc(doc(db, 'carts', userCartDoc.id), mergedCartData);
      } else {
        mergedCartData.createdAt = new Date().toISOString();
        await addDoc(cartsCollection, mergedCartData);
      }
      
      // Remove guest cart
      const guestCartQuery = query(cartsCollection, where('sessionId', '==', sessionId));
      const guestCartSnapshot = await getDocs(guestCartQuery);
      
      if (!guestCartSnapshot.empty) {
        const guestCartDoc = guestCartSnapshot.docs[0];
        await deleteDoc(doc(db, 'carts', guestCartDoc.id));
      }
      
      console.log(`✅ Carts merged successfully: ${mergedItems.length} items`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'تم دمج السلة بنجاح',
          items: mergedItems,
          totalItems: mergedCartData.totalItems
        }),
      };
    }

    // If no route matches
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'الطريق غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Cart API Error:', error);
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