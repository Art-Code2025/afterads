const { db } = require('./config/firebase.js');
const { 
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
} = require('firebase/firestore');

exports.handler = async (event, context) => {
  console.log('🛍️ Services API Called:', {
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString()
  });

  // Check body size to prevent "Stream body too big" error
  if (event.body && event.body.length > 6 * 1024 * 1024) { // 6MB limit
    console.error('❌ Request body too large:', event.body.length, 'bytes');
    return {
      statusCode: 413,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'حجم البيانات كبير جداً. يرجى تقليل حجم الصور أو البيانات المرسلة.',
        maxSize: '6MB'
      }),
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'no-cache',
  };

  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathSegments = path.split('/').filter(Boolean);
    
    console.log('🛍️ Services API - Method:', method, 'Path:', path, 'Segments:', pathSegments);

    // Validate Firebase connection
    if (!db) {
      console.error('❌ Firebase DB not initialized!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection failed' }),
      };
    }

    // GET /services - Get all services
    if (method === 'GET' && pathSegments[pathSegments.length - 1] === 'services') {
      console.log('🛠️ Fetching all services from Firestore');
      
      const servicesCollection = collection(db, 'services');
      const servicesQuery = query(servicesCollection, orderBy('createdAt', 'desc'));
      const servicesSnapshot = await getDocs(servicesQuery);
      
      const services = [];
      servicesSnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${services.length} services in Firestore`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(services),
      };
    }

    // GET /services/{id} - Get single service
    if (method === 'GET' && pathSegments.length >= 2 && pathSegments.includes('services')) {
      const serviceId = pathSegments[pathSegments.length - 1];
      console.log('🛠️ Fetching service:', serviceId);
      
      const serviceDoc = doc(db, 'services', serviceId);
      const serviceSnapshot = await getDoc(serviceDoc);
      
      if (!serviceSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'الخدمة غير موجودة' }),
        };
      }
      
      const service = {
        id: serviceSnapshot.id,
        ...serviceSnapshot.data()
      };
      
      console.log('✅ Service found:', service.name);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(service),
      };
    }

    // POST /services - Create new service
    if (method === 'POST') {
      let body = {};
      
      try {
        // Handle JSON request from ServiceForm
        body = event.body ? JSON.parse(event.body) : {};
        
        console.log('➕ Creating new service:', body.name);
        console.log('📋 Data size:', event.body ? `${(event.body.length / 1024).toFixed(2)}KB` : '0KB');
        
        // Log data structure without full content to avoid large logs
        const logData = {
          name: body.name,
          hasMainImage: !!body.mainImage,
          detailedImagesCount: body.detailedImages ? body.detailedImages.length : 0,
          imageDetailsCount: body.imageDetails ? body.imageDetails.length : 0,
          categoriesCount: body.categories ? body.categories.length : 0,
          faqsCount: body.faqs ? body.faqs.length : 0,
          addOnsCount: body.addOns ? body.addOns.length : 0
        };
        console.log('📋 Data structure:', JSON.stringify(logData, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'بيانات غير صحيحة - تأكد من صحة البيانات المرسلة' }),
        };
      }
      
      // Validate required fields
      if (!body.name) {
        console.error('❌ Missing required field: name');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'اسم الخدمة مطلوب' }),
        };
      }
      
      if (!body.basePrice && !body.originalPrice) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'سعر الخدمة مطلوب' }),
        };
      }
      
      try {
        // Handle service creation
        console.log('🔧 Creating service');
        
        const itemData = {
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
        
        const servicesCollection = collection(db, 'services');
        const docRef = await addDoc(servicesCollection, itemData);
        
        const newItem = {
          id: docRef.id,
          ...itemData
        };
        
        console.log('✅ Service created successfully with ID:', docRef.id);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newItem),
        };
      } catch (firebaseError) {
        console.error('❌ Firebase error:', firebaseError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'فشل في حفظ البيانات في قاعدة البيانات',
            details: firebaseError.message
          }),
        };
      }
    }

    // PUT /services/{id} - Update service
    if (method === 'PUT' && pathSegments.length >= 2 && pathSegments.includes('services')) {
      const serviceId = pathSegments[pathSegments.length - 1];
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('✏️ Updating service:', serviceId);
      
      const serviceDoc = doc(db, 'services', serviceId);
      const serviceSnapshot = await getDoc(serviceDoc);
      
      if (!serviceSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'الخدمة غير موجودة' }),
        };
      }
      
      const updateData = {
        ...body,
        originalPrice: parseFloat(body.originalPrice) || 0,
        basePrice: parseFloat(body.basePrice) || 0,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(serviceDoc, updateData);
      
      const updatedService = {
        id: serviceId,
        ...serviceSnapshot.data(),
        ...updateData
      };
      
      console.log('✅ Service updated:', serviceId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedService),
      };
    }

    // DELETE /services/{id} - Delete service
    if (method === 'DELETE' && pathSegments.length >= 2 && pathSegments.includes('services')) {
      const serviceId = pathSegments[pathSegments.length - 1];
      console.log('🗑️ Deleting service:', serviceId);
      
      const serviceDoc = doc(db, 'services', serviceId);
      const serviceSnapshot = await getDoc(serviceDoc);
      
      if (!serviceSnapshot.exists()) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'الخدمة غير موجودة' }),
        };
      }
      
      await deleteDoc(serviceDoc);
      
      console.log('✅ Service deleted:', serviceId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'تم حذف الخدمة بنجاح' }),
      };
    }

    // GET /services/category/{categoryId} - Get services by category
    if (method === 'GET' && pathSegments.includes('category')) {
      const categoryId = pathSegments[pathSegments.length - 1];
      console.log('🔧 Fetching services for category:', categoryId);
      
      const servicesCollection = collection(db, 'services');
      const servicesQuery = query(
        servicesCollection, 
        where('categories', 'array-contains', categoryId),
        orderBy('createdAt', 'desc')
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      
      const services = [];
      servicesSnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Found ${services.length} services for category ${categoryId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(services),
      };
    }

    // If no route matches
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'الطريق غير موجود' }),
    };

  } catch (error) {
    console.error('❌ Services API Error:', error);
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