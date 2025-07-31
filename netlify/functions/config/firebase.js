import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr-8KXPyqsqcwiDSiIbyn6alhFcQCN4gU",
  authDomain: "perfum-ac.firebaseapp.com",
  projectId: "perfum-ac",
  storageBucket: "perfum-ac.firebasestorage.app",
  messagingSenderId: "429622096271",
  appId: "1:429622096271:web:88876e9ae849344a5d1bfa"
};

let app;
let auth;
let db;

try {
  console.log('🔥 Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Test Firebase connection
  console.log('✅ Firebase initialized successfully');
  console.log('📊 Firebase App:', app.name);
  console.log('🔐 Firebase Auth:', !!auth);
  console.log('🗄️ Firebase Firestore:', !!db);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('🔍 Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  throw error;
}

// Helper function to check Firebase connection
export const testFirebaseConnection = async () => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    // Try a simple operation to test connection
    const { collection, getDocs } = await import('firebase/firestore');
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    
    console.log('✅ Firebase connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

export { auth, db }; 