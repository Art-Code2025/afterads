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
  orderBy,
  where
} from 'firebase/firestore';

// Categories Function with Enhanced Error Handling
export const handler = async (event, context) => {
  console.log('📂 Categories API Called:', {
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
    
    console.log('📂 Categories API - Method:', method, 'Path:', path, 'Segments:', pathSegments);

    // Validate Firebase connection
    if (!db) {
      console.error('❌ Firebase DB not initialized!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection failed' }),
      };
    }

    // GET /categories - Get all categories
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'categories') {
      console.log('📂 Fetching all categories from Firestore');
      
      const categoriesCollection = collection(db, 'categories');
      const categoriesQuery = query(categoriesCollection, orderBy('name'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categories = [];
      categoriesSnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${categories.length} categories in Firestore`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(categories),
      };
    }

    // GET /categories/{id} - Get single category
    if (method === 'GET' && pathSegments.length >= 2) {
      const categoryId = pathSegments[pathSegments.length - 1];
      console.log('📂 Fetching category:', categoryId);
      
      const categoryDoc = doc(db, 'categories', categoryId);
      const categorySnapshot = await getDoc(categoryDoc);
      
      if (!categorySnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'التصنيف غير موجود' }),
        };
      }
      
      const category = {
        id: categorySnapshot.id,
        ...categorySnapshot.data()
      };
      
      console.log('✅ Category found:', category.name);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(category),
      };
    }

    // POST /categories - Create new category
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Creating new category:', body.name);
      
      // Validate required fields
      if (!body.name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'اسم التصنيف مطلوب' }),
        };
      }
      
      const categoryData = {
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const categoriesCollection = collection(db, 'categories');
      const docRef = await addDoc(categoriesCollection, categoryData);
      
      const newCategory = {
        id: docRef.id,
        ...categoryData
      };
      
      console.log('✅ Category created with ID:', docRef.id);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newCategory),
      };
    }

    // PUT /categories/{id} - Update category
    if (method === 'PUT' && pathSegments.length >= 2) {
      const categoryId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating category:', categoryId);
      
      const categoryDoc = doc(db, 'categories', categoryId);
      const categorySnapshot = await getDoc(categoryDoc);
      
      if (!categorySnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'التصنيف غير موجود' }),
        };
      }
      
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(categoryDoc, updateData);
      
      const updatedCategory = {
        id: categoryId,
        ...categorySnapshot.data(),
        ...updateData
      };
      
      console.log('✅ Category updated:', categoryId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedCategory),
      };
    }

    // DELETE /categories/{id} - Delete category
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const categoryId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting category:', categoryId);
      
      const categoryDoc = doc(db, 'categories', categoryId);
      const categorySnapshot = await getDoc(categoryDoc);
      
      if (!categorySnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'التصنيف غير موجود' }),
        };
      }
      
      // Check if category has products
      const productsCollection = collection(db, 'products');
      const productsQuery = query(productsCollection, where('categoryId', '==', categoryId));
      const productsSnapshot = await getDocs(productsQuery);
      
      if (!productsSnapshot.empty) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: `لا يمكن حذف التصنيف لأنه يحتوي على ${productsSnapshot.size} منتج` 
          }),
        };
      }
      
      await deleteDoc(categoryDoc);
      
      console.log('✅ Category deleted:', categoryId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'تم حذف التصنيف بنجاح' }),
      };
    }

    // If no route matches
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'الطريق غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Categories API Error:', error);
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