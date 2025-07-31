import { db } from './config/firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  addDoc,
  writeBatch
} from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🔧 Init Collections API Called:', {
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Validate Firebase connection
    if (!db) {
      console.error('❌ Firebase DB not initialized!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection failed' }),
      };
    }

    console.log('🧹 Starting database cleanup...');

    // Collections to clear
    const collectionsToInit = [
      'products',
      'categories', 
      'orders',
      'customers',
      'carts',
      'wishlists',
      'reviews',
      'coupons',
      'notifications'
    ];

    const results = {};

    // Clear all collections
    for (const collectionName of collectionsToInit) {
      try {
        console.log(`🗑️ Clearing collection: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const batch = writeBatch(db);
        let deleteCount = 0;
        
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
          deleteCount++;
        });
        
        if (deleteCount > 0) {
          await batch.commit();
          console.log(`✅ Deleted ${deleteCount} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️ Collection ${collectionName} was already empty`);
        }
        
        results[collectionName] = {
          status: 'cleared',
          deletedCount: deleteCount
        };
        
      } catch (error) {
        console.error(`❌ Error clearing ${collectionName}:`, error);
        results[collectionName] = {
          status: 'error',
          error: error.message
        };
      }
    }

    console.log('✅ Database cleanup completed');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'تم تنظيف قاعدة البيانات بنجاح',
        results,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Init Collections Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'خطأ في تنظيف قاعدة البيانات', 
        details: error.message 
      }),
    };
  }
}; 