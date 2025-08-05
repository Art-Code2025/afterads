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
      let body = {};
      
      // Check if the request contains FormData or JSON
      // Handle JSON request (both ProductForm and ServiceForm now send JSON)
      body = event.body ? JSON.parse(event.body) : {};
      
      console.log('➕ Creating new product:', body.name);
      console.log('📋 Product data received:', JSON.stringify(body, null, 2));
      
      // Validate required fields for ServiceForm
      if (!body.name || (!body.basePrice && !body.originalPrice)) {
        console.error('❌ Missing required fields:', { name: body.name, basePrice: body.basePrice, originalPrice: body.originalPrice });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'البيانات المطلوبة ناقصة (الاسم والسعر مطلوبان)' }),
        };
      }
      
      // إعداد البيانات للخدمة مع قيم افتراضية
      const serviceData = {
        name: body.name,
        homeShortDescription: body.homeShortDescription || '',
        detailsShortDescription: body.detailsShortDescription || '',
        description: body.description || '',
        originalPrice: parseFloat(body.originalPrice) || 0,
        basePrice: parseFloat(body.basePrice) || 0,
        status: body.status || 'active',
        categories: body.categories || [],
        faqs: body.faqs || [],
        addOns: body.addOns || [],
        seoTitle: body.seoTitle || '',
        seoDescription: body.seoDescription || '',
        mainImage: body.mainImage || '',
        detailedImages: body.detailedImages || [],
        imageDetails: body.imageDetails || [],
        features: body.features || [],
        deliveryTime: body.deliveryTime || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('💾 Saving service with data:', JSON.stringify(serviceData, null, 2));
      
      try {
        const servicesCollection = collection(db, 'services');
        const docRef = await addDoc(servicesCollection, serviceData);
        
        const newService = {
          id: docRef.id,
          ...serviceData
        };
        
        console.log('✅ Service created successfully with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newService),
        };
      } catch (firebaseError) {
        console.error('❌ Firebase error creating service:', firebaseError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'فشل في حفظ الخدمة في قاعدة البيانات',
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