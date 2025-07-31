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
  orderBy,
  limit,
  startAfter 
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
    
    console.log('⭐ Reviews API - Method:', method, 'Path:', path);

    // GET /reviews/product/{productId} - Get reviews for a product
    if (method === 'GET' && pathSegments.includes('product')) {
      const productId = pathSegments[pathSegments.indexOf('product') + 1];
      console.log('⭐ Fetching reviews for product:', productId);
      
      try {
        const reviewsCollection = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsCollection, 
          where('productId', '==', productId),
          where('isApproved', '==', true),
          orderBy('createdAt', 'desc')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviews = [];
        reviewsSnapshot.forEach((doc) => {
          reviews.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        console.log(`✅ Found ${reviews.length} reviews for product ${productId}`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reviews,
            stats: {
              totalReviews: reviews.length,
              averageRating: Math.round(averageRating * 10) / 10,
              ratingDistribution: {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length,
              }
            }
          }),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, returning empty reviews:', firestoreError);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reviews: [],
            stats: {
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            }
          }),
        };
      }
    }

    // GET /reviews/user/{userId} - Get user's reviews
    if (method === 'GET' && pathSegments.includes('user')) {
      const userId = pathSegments[pathSegments.indexOf('user') + 1];
      console.log('⭐ Fetching reviews by user:', userId);
      
      try {
        const reviewsCollection = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsCollection, 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviews = [];
        reviewsSnapshot.forEach((doc) => {
          reviews.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${reviews.length} reviews by user ${userId}`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(reviews),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, returning empty reviews:', firestoreError);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }
    }

    // POST /reviews - Add new review
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Adding new review:', body);
      
      try {
        // Check if user already reviewed this product
        const reviewsCollection = collection(db, 'reviews');
        const existingQuery = query(
          reviewsCollection, 
          where('userId', '==', body.userId),
          where('productId', '==', body.productId)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ 
              error: 'لقد قمت بتقييم هذا المنتج من قبل',
              alreadyReviewed: true 
            }),
          };
        }
        
        const reviewData = {
          userId: body.userId,
          productId: body.productId,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          rating: parseInt(body.rating) || 5,
          title: body.title || '',
          comment: body.comment || '',
          isApproved: false, // Requires admin approval
          isVerifiedPurchase: body.isVerifiedPurchase || false,
          helpfulCount: 0,
          reportCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(reviewsCollection, reviewData);
        
        const newReview = {
          id: docRef.id,
          ...reviewData
        };
        
        console.log('✅ Review added with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newReview),
        };
        
      } catch (error) {
        console.error('❌ Error adding review:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في إضافة التقييم: ' + error.message }),
        };
      }
    }

    // PUT /reviews/{id} - Update review (for admin approval or user edit)
    if (method === 'PUT' && pathSegments.length >= 2) {
      const reviewId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('🔄 Updating review:', reviewId);
      
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        const updateData = {
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(reviewDoc, updateData);
        
        const updatedDoc = await getDoc(reviewDoc);
        const updatedReview = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };
        
        console.log('✅ Review updated');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedReview),
        };
      } catch (error) {
        console.error('❌ Error updating review:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في تحديث التقييم: ' + error.message }),
        };
      }
    }

    // DELETE /reviews/{id} - Delete review
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const reviewId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting review:', reviewId);
      
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        
        console.log('✅ Review deleted');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف التقييم بنجاح' }),
        };
      } catch (error) {
        console.error('❌ Error deleting review:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في حذف التقييم: ' + error.message }),
        };
      }
    }

    // POST /reviews/{id}/helpful - Mark review as helpful
    if (method === 'POST' && pathSegments.includes('helpful')) {
      const reviewId = pathSegments[pathSegments.indexOf('helpful') - 1];
      console.log('👍 Marking review as helpful:', reviewId);
      
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        const reviewSnapshot = await getDoc(reviewDoc);
        
        if (!reviewSnapshot.exists()) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'التقييم غير موجود' }),
          };
        }
        
        const currentData = reviewSnapshot.data();
        const newHelpfulCount = (currentData.helpfulCount || 0) + 1;
        
        await updateDoc(reviewDoc, {
          helpfulCount: newHelpfulCount,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Review marked as helpful');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'تم تسجيل إعجابك بالتقييم',
            helpfulCount: newHelpfulCount
          }),
        };
      } catch (error) {
        console.error('❌ Error marking review as helpful:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'خطأ في تسجيل الإعجاب: ' + error.message }),
        };
      }
    }

    // GET /reviews - Get all reviews (for admin)
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'reviews') {
      console.log('⭐ Fetching all reviews for admin');
      
      try {
        const reviewsCollection = collection(db, 'reviews');
        const reviewsQuery = query(reviewsCollection, orderBy('createdAt', 'desc'));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviews = [];
        reviewsSnapshot.forEach((doc) => {
          reviews.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Found ${reviews.length} total reviews`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(reviews),
        };
      } catch (firestoreError) {
        console.error('❌ Firestore error, returning empty reviews:', firestoreError);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'المسار غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Reviews API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطأ في الخادم: ' + error.message }),
    };
  }
}; 