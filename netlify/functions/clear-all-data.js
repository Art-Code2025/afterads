import { db } from './config/firebase.js';
import { 
  collection, 
  getDocs, 
  deleteDoc,
  doc
} from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🗑️ Clear All Data API Called:', {
    method: event.httpMethod,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed. Use POST.' 
      }),
    };
  }

  try {
    console.log('🔥 Starting Firebase cleanup...');
    
    const collectionsToClean = [
      'products',
      'categories', 
      'carts',
      'wishlists',
      'reviews',
      'orders',
      'customers',
      'coupons'
    ];

    const results = [];
    
    for (const collectionName of collectionsToClean) {
      try {
        console.log(`🗑️ Cleaning collection: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`✅ Collection ${collectionName} is already empty`);
          results.push(`${collectionName}: already empty`);
          continue;
        }

        const deletePromises = [];
        snapshot.forEach((docSnapshot) => {
          deletePromises.push(deleteDoc(doc(db, collectionName, docSnapshot.id)));
        });

        await Promise.all(deletePromises);
        
        console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
        results.push(`${collectionName}: deleted ${snapshot.size} documents`);
        
      } catch (collectionError) {
        console.error(`❌ Error cleaning ${collectionName}:`, collectionError);
        results.push(`${collectionName}: error - ${collectionError.message}`);
      }
    }

    console.log('🎉 Firebase cleanup completed');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'تم مسح جميع البيانات الوهمية من Firebase بنجاح',
        results,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Error during Firebase cleanup:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'حدث خطأ أثناء مسح البيانات',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
}; 