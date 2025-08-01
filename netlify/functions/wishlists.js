const { db } = require('./config/firebase.js');
const { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} = require('firebase/firestore');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathSegments = path.split('/').filter(Boolean);
    
    console.log('💖 Professional Wishlist API - Method:', method, 'Path:', path);

    // GET /wishlists/user/{userId} - Get user's wishlist
    if (method === 'GET' && pathSegments.includes('user')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'معرف المستخدم مطلوب' }),
        };
      }
      
      console.log('💖 Fetching wishlist for user:', userId);
      
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
          body: JSON.stringify({
            success: true,
            data: wishlistItems,
            count: wishlistItems.length
          }),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error:', firestoreError);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: [],
            count: 0
          }),
        };
      }
    }

    // POST /wishlists - Add item to wishlist
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      
      // Validate required fields
      if (!body.userId || !body.productId || !body.productName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'البيانات المطلوبة مفقودة (userId, productId, productName)' 
          }),
        };
      }
      
      console.log('💖 Adding item to wishlist:', body);
      
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
              success: false,
              error: 'المنتج موجود بالفعل في المفضلة',
              alreadyExists: true 
            }),
          };
        }
        
        const wishlistData = {
          userId: body.userId,
          productId: body.productId,
          productName: body.productName,
          productImage: body.productImage || '',
          price: body.price || 0,
          originalPrice: body.originalPrice || null,
          category: body.category || 'عام',
          isAvailable: body.isAvailable !== false,
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
          body: JSON.stringify({
            success: true,
            data: newWishlistItem,
            message: 'تم إضافة المنتج للمفضلة بنجاح'
          }),
        };
        
      } catch (error) {
        console.error('❌ Error adding to wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في إضافة المنتج للمفضلة: ' + error.message 
          }),
        };
      }
    }

    // DELETE /wishlists/user/{userId}/product/{productId} - Remove specific product from user's wishlist
    if (method === 'DELETE' && pathSegments.includes('user') && pathSegments.includes('product')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      const productId = pathSegments[pathSegments.indexOf('product') + 1];
      
      if (!userId || !productId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'معرف المستخدم ومعرف المنتج مطلوبان' 
          }),
        };
      }
      
      console.log('💖 Removing product from wishlist:', { userId, productId });
      
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
            body: JSON.stringify({ 
              success: false,
              error: 'المنتج غير موجود في المفضلة' 
            }),
          };
        }
        
        const deletePromises = [];
        wishlistSnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        console.log('✅ Product removed from wishlist');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'تم حذف المنتج من المفضلة بنجاح' 
          }),
        };
      } catch (error) {
        console.error('❌ Error removing product from wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في حذف المنتج: ' + error.message 
          }),
        };
      }
    }

    // DELETE /wishlists/user/{userId}/clear - Clear user's wishlist
    if (method === 'DELETE' && pathSegments.includes('clear')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'معرف المستخدم مطلوب' 
          }),
        };
      }
      
      console.log('💖 Clearing wishlist for user:', userId);
      
      try {
        const wishlistCollection = collection(db, 'wishlists');
        const wishlistQuery = query(wishlistCollection, where('userId', '==', userId));
        const wishlistSnapshot = await getDocs(wishlistQuery);
        
        const deletePromises = [];
        wishlistSnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        console.log(`✅ Cleared ${wishlistSnapshot.size} items from wishlist`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'تم مسح المفضلة بنجاح',
            deletedCount: wishlistSnapshot.size
          }),
        };
      } catch (error) {
        console.error('❌ Error clearing wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في مسح المفضلة: ' + error.message 
          }),
        };
      }
    }

    // GET /wishlists/user/{userId}/check/{productId} - Check if product is in wishlist
    if (method === 'GET' && pathSegments.includes('check')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      const productId = pathSegments[pathSegments.indexOf('check') + 1];
      
      if (!userId || !productId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'معرف المستخدم ومعرف المنتج مطلوبان' 
          }),
        };
      }
      
      console.log('💖 Checking if product is in wishlist:', { userId, productId });
      
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
            success: true,
            inWishlist: isInWishlist,
            itemId: isInWishlist ? wishlistSnapshot.docs[0].id : null
          }),
        };
      } catch (error) {
        console.error('❌ Error checking wishlist:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في فحص المفضلة: ' + error.message 
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'المسار غير موجود' 
      }),
    };

  } catch (error) {
    console.error('❌ Professional Wishlist API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'خطأ في الخادم: ' + error.message 
      }),
    };
  }
};