import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAr-8KXPyqsqcwiDSiIbyn6alhFcQCN4gU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "perfum-ac.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "perfum-ac",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "perfum-ac.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "429622096271",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:429622096271:web:88876e9ae849344a5d1bfa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 