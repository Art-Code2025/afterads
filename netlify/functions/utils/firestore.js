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
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Response helper
export const response = (statusCode, data, message = '') => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    success: statusCode < 400,
    data,
    message
  })
});

// Error handler
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  return response(500, null, `Server error: ${error.message}`);
};

// Get all documents from a collection
export const getAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get document by ID
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Add document
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Update document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw error;
  }
};

// Query documents with conditions
export const queryDocuments = async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Add where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    // Add orderBy
    if (orderByField) {
      q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
    }
    
    // Add limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
}; 

// Get next sequential numeric ID for a collection
export const getNextId = async (collectionName) => {
  try {
    // Get all documents and find the highest numeric ID
    const documents = await getAllDocuments(collectionName);
    
    if (documents.length === 0) {
      return 1; // Start with 1 if no documents exist
    }
    
    // Find the highest numericId
    const maxId = documents.reduce((max, doc) => {
      const numericId = doc.numericId || 0;
      return numericId > max ? numericId : max;
    }, 0);
    
    return maxId + 1;
  } catch (error) {
    throw error;
  }
}; 