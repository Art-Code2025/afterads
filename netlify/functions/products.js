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
  limit 
} from 'firebase/firestore';

export const handler = async (event, context) => {
  console.log('🛍️ Products API Called:', {
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
    
    console.log('🛍️ Products API - Method:', method, 'Path:', path, 'Segments:', pathSegments);

    // Validate Firebase connection
    if (!db) {
      console.error('❌ Firebase DB not initialized!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection failed' }),
      };
    }

    // GET /products - Get all products
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'products') {
      console.log('📦 Fetching all products from Firestore');
      
      const productsCollection = collection(db, 'products');
      const productsQuery = query(productsCollection, orderBy('createdAt', 'desc'));
      const productsSnapshot = await getDocs(productsQuery);
      
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${products.length} products in Firestore`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(products),
      };
    }

    // GET /products/{id} - Get single product
    if (method === 'GET' && pathSegments.length >= 2) {
      const productId = pathSegments[pathSegments.length - 1];
      console.log('📦 Fetching product:', productId);
      
      const productDoc = doc(db, 'products', productId);
      const productSnapshot = await getDoc(productDoc);
      
      if (!productSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'المنتج غير موجود' }),
        };
      }
      
      const product = {
        id: productSnapshot.id,
        ...productSnapshot.data()
      };
      
      console.log('✅ Product found:', product.name);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(product),
      };
    }

    // POST /products - Create new product
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('➕ Creating new product:', body.name);
      console.log('📋 Product data received:', JSON.stringify(body, null, 2));
      
      // Validate required fields - تخفيف التحقق
      if (!body.name || !body.price) {
        console.error('❌ Missing required fields:', { name: body.name, price: body.price });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'البيانات المطلوبة ناقصة (الاسم والسعر مطلوبان)' }),
        };
      }
      
      // إعداد البيانات مع قيم افتراضية
      const productData = {
        name: body.name,
        description: body.description || '',
        price: parseFloat(body.price) || 0,
        originalPrice: parseFloat(body.originalPrice) || 0,
        stock: parseInt(body.stock) || 0,
        categoryId: body.categoryId || null, // السماح بـ null
        productType: body.productType || '',
        mainImage: body.mainImage || '',
        detailedImages: body.detailedImages || [],
        specifications: body.specifications || [],
        dynamicOptions: body.dynamicOptions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('💾 Saving product with data:', JSON.stringify(productData, null, 2));
      
      try {
        const productsCollection = collection(db, 'products');
        const docRef = await addDoc(productsCollection, productData);
        
        const newProduct = {
          id: docRef.id,
          ...productData
        };
        
        console.log('✅ Product created successfully with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newProduct),
        };
      } catch (firebaseError) {
        console.error('❌ Firebase error creating product:', firebaseError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'فشل في حفظ المنتج في قاعدة البيانات',
            details: firebaseError.message
          }),
        };
      }
    }

    // PUT /products/{id} - Update product
    if (method === 'PUT' && pathSegments.length >= 2) {
      const productId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating product:', productId);
      
      const productDoc = doc(db, 'products', productId);
      const productSnapshot = await getDoc(productDoc);
      
      if (!productSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'المنتج غير موجود' }),
        };
      }
      
      const updateData = {
        ...body,
        price: parseFloat(body.price),
        stock: parseInt(body.stock) || 0,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(productDoc, updateData);
      
      const updatedProduct = {
        id: productId,
        ...productSnapshot.data(),
        ...updateData
      };
      
      console.log('✅ Product updated:', productId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedProduct),
      };
    }

    // DELETE /products/{id} - Delete product
    if (method === 'DELETE' && pathSegments.length >= 2) {
      const productId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting product:', productId);
      
      const productDoc = doc(db, 'products', productId);
      const productSnapshot = await getDoc(productDoc);
      
      if (!productSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'المنتج غير موجود' }),
        };
      }
      
      await deleteDoc(productDoc);
      
      console.log('✅ Product deleted:', productId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'تم حذف المنتج بنجاح' }),
      };
    }

    // GET /products/category/{categoryId} - Get products by category
    if (method === 'GET' && pathSegments.includes('category')) {
      const categoryId = pathSegments[pathSegments.length - 1];
      console.log('📦 Fetching products for category:', categoryId);
      
      const productsCollection = collection(db, 'products');
      const productsQuery = query(
        productsCollection, 
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${products.length} products for category ${categoryId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(products),
      };
    }

    // If no route matches
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'الطريق غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Products API Error:', error);
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