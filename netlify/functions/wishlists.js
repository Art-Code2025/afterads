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
    
    console.log('❤️ Wishlist API - Method:', method, 'Path:', path);

    // GET /wishlists/user/{userId} - Get user's wishlist
    if (method === 'GET' && pathSegments.includes('user')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      console.log('❤️ Fetching wishlist for user:', userId);
      
      try {
        const wishlistCollection = collection(db, 'wishlists');
        const wishlistQuery = query(
          wishlistCollection, 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const wishlistSnapshot = await getDocs(wishlistQuery);
        
        const wishlistItems = [];
        wishlistSnapshot.forEach((doc) => {
          wishlistItems.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${wishlistItems.length} wishlist items for user ${userId}`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(wishlistItems),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, returning empty wishlist:', firestoreError);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }
    }

    // POST /wishlists - Add item to wishlist
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Adding item to wishlist:', body);
      
      try {
        // Check if item already exists in wishlist
        const wishlistCollection = collection(db, 'wishlists');
        const existingQuery = query(
          wishlistCollection, 
          where('userId', '==', body.userId),
          where('productId', '==', body.productId)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ 
              error: 'المنتج موجود بالفعل في قائمة الأمنيات',
              alreadyExists: true 
            }),
          };
        }
        
        const wishlistData = {
          userId: body.userId,
          productId: body.productId,
          productName: body.productName,
          productImage: body.productImage,
          price: body.price,
          originalPrice: body.originalPrice,
          category: body.category,
          isAvailable: body.isAvailable !== false, // Default to true
          createdAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(wishlistCollection, wishlistData);
        
        const newWishlistItem = {
          id: docRef.id,
          ...wishlistData
        };
        
        console.log('✅ Wishlist item added with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newWishlistItem),
        };
        
      } catch (error) {
        console.error('❌ Error adding to wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في إضافة المنتج لقائمة الأمنيات: ' + error.message }),
        };
      }
    }

    // DELETE /wishlists/{id} - Remove item from wishlist
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const wishlistItemId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Removing wishlist item:', wishlistItemId);
      
      try {
        await deleteDoc(doc(db, 'wishlists', wishlistItemId));
        
        console.log('✅ Wishlist item removed');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف المنتج من قائمة الأمنيات بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error removing wishlist item:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف المنتج: ' + error.message }),
        };
      }
    }

    // DELETE /wishlists/user/{userId}/product/{productId} - Remove specific product from user's wishlist
    if (method === 'DELETE' && pathSegments.includes('user') && pathSegments.includes('product')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      const productId = pathSegments[pathSegments.indexOf('product') + 1];
      console.log('🗑️ Removing product from wishlist:', { userId, productId });
      
      try {
        const wishlistCollection = collection(db, 'wishlists');
        const wishlistQuery = query(
          wishlistCollection, 
          where('userId', '==', userId),
          where('productId', '==', productId)
        );
        const wishlistSnapshot = await getDocs(wishlistQuery);
        
        if (wishlistSnapshot.empty) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'المنتج غير موجود في قائمة الأمنيات' }),
          };
        }
        
        const batch = [];
        wishlistSnapshot.forEach((doc) => {
          batch.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(batch);
        
        console.log('✅ Product removed from wishlist');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف المنتج من قائمة الأمنيات بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error removing product from wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف المنتج: ' + error.message }),
        };
      }
    }

    // DELETE /wishlists/user/{userId}/clear - Clear user's wishlist
    if (method === 'DELETE' && pathSegments.includes('clear')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      console.log('🗑️ Clearing wishlist for user:', userId);
      
      try {
        const wishlistCollection = collection(db, 'wishlists');
        const wishlistQuery = query(wishlistCollection, where('userId', '==', userId));
        const wishlistSnapshot = await getDocs(wishlistQuery);
        
        const batch = [];
        wishlistSnapshot.forEach((doc) => {
          batch.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(batch);
        
        console.log(`✅ Cleared ${wishlistSnapshot.size} items from wishlist`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم مسح قائمة الأمنيات بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error clearing wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في مسح قائمة الأمنيات: ' + error.message }),
        };
      }
    }

    // GET /wishlists/user/{userId}/check/{productId} - Check if product is in wishlist
    if (method === 'GET' && pathSegments.includes('check')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      const productId = pathSegments[pathSegments.indexOf('check') + 1];
      console.log('🔍 Checking if product is in wishlist:', { userId, productId });
      
      try {
        const wishlistCollection = collection(db, 'wishlists');
        const wishlistQuery = query(
          wishlistCollection, 
          where('userId', '==', userId),
          where('productId', '==', productId)
        );
        const wishlistSnapshot = await getDocs(wishlistQuery);
        
        const isInWishlist = !wishlistSnapshot.empty;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            inWishlist: isInWishlist,
            itemId: isInWishlist ? wishlistSnapshot.docs[0].id : null
          }),
        };
      } catch (error) {
        console.error('❌ Error checking wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في فحص قائمة الأمنيات: ' + error.message }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'المسار غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Wishlist API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطأ في الخادم: ' + error.message }),
    };
  }
}; 