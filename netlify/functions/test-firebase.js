import { db } from './config/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🧪 Firebase Test Function Called');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('🔥 Testing Firebase Firestore connection...');
    
    if (!db) {
      throw new Error('Firebase DB not initialized');
    }

    // Test 1: Create a test document
    console.log('📝 Test 1: Creating test document...');
    const testCollection = collection(db, 'test');
    const testData = {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString(),
      testId: Date.now()
    };
    
    const docRef = await addDoc(testCollection, testData);
    console.log('✅ Test document created with ID:', docRef.id);

    // Test 2: Read test documents
    console.log('📖 Test 2: Reading test documents...');
    const snapshot = await getDocs(testCollection);
    const docs = [];
    snapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`✅ Found ${docs.length} test documents`);

    // Test 3: Delete the test document we created
    console.log('🗑️ Test 3: Cleaning up test document...');
    await deleteDoc(doc(db, 'test', docRef.id));
    console.log('✅ Test document deleted successfully');

    // All tests passed
    console.log('🎉 All Firebase tests passed!');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Firebase connection successful! 🎉',
        tests: {
          create: '✅ Pass',
          read: '✅ Pass',
          delete: '✅ Pass'
        },
        documentsFound: docs.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    let errorDetails = {
      message: error.message,
      code: error.code || 'unknown',
      type: 'Firebase Error'
    };

    // Check for specific error types
    if (error.code === 'permission-denied') {
      errorDetails.solution = 'Update Firestore Rules to allow read/write operations';
      errorDetails.type = 'Permission Error';
    } else if (error.message.includes('not initialized')) {
      errorDetails.solution = 'Check Firebase configuration';
      errorDetails.type = 'Configuration Error';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Firebase test failed ❌',
        details: errorDetails,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 