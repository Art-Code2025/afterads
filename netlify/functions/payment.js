import fetch from 'node-fetch';
import { db } from './config/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

// معلومات Paymob - ستحتاج لتحديثها بمعلوماتك الحقيقية
const PAYMOB_CONFIG = {
  API_KEY: process.env.PAYMOB_API_KEY || 'your_api_key_here',
  INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || 'your_integration_id_here',
  HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || 'your_hmac_secret_here'
};

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

export const handler = async (event, context) => {
  console.log('🚀 Payment API Handler Started:', {
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString(),
    headers: event.headers,
    queryStringParameters: event.queryStringParameters
  });
  
  console.log('📦 Request Body:', event.body);

  // Handle CORS
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

    // POST /payment/create - إنشاء رابط دفع جديد
    if (method === 'POST' && pathSegments.includes('create')) {
      console.log('🎯 Entering payment/create endpoint');
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('📋 Parsed request body:', JSON.stringify(body, null, 2));
      console.log('💳 Creating payment link for order:', body.orderId);

      try {
        console.log('🔐 Step 1: Getting Auth Token from Paymob');
        console.log('🔑 Using API Key:', PAYMOB_CONFIG.API_KEY ? 'Present' : 'Missing');
        
        // الخطوة 1: الحصول على Auth Token
        const authResponse = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: PAYMOB_CONFIG.API_KEY
          })
        });

        console.log('📡 Auth response status:', authResponse.status);
        const authData = await authResponse.json();
        console.log('🔐 Auth response data:', JSON.stringify(authData, null, 2));
        
        if (!authData.token) {
          console.error('❌ No token in auth response');
          throw new Error('فشل في الحصول على Auth Token');
        }

        console.log('✅ Auth token received successfully');

        console.log('📦 Step 2: Creating Order in Paymob');
        const orderPayload = {
          auth_token: authData.token,
          delivery_needed: false,
          amount_cents: Math.round(body.amount * 100), // تحويل للقروش
          currency: 'EGP',
          merchant_order_id: body.orderId,
          items: body.items || []
        };
        console.log('📋 Order payload:', JSON.stringify(orderPayload, null, 2));
        
        // الخطوة 2: إنشاء Order في Paymob
        const orderResponse = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload)
        });
        
        console.log('📡 Order response status:', orderResponse.status);

        const orderData = await orderResponse.json();
        console.log('📋 Paymob order response:', JSON.stringify(orderData, null, 2));
        
        if (!orderData.id) {
          console.error('❌ Paymob order creation failed:', orderData);
          throw new Error(`فشل في إنشاء الطلب في Paymob: ${orderData.detail || orderData.message || 'Unknown error'}`);
        }

        console.log('✅ Paymob order created:', orderData.id);

        console.log('🔑 Step 3: Creating Payment Key');
         const paymentKeyPayload = {
           auth_token: authData.token,
           amount_cents: Math.round(body.amount * 100),
           expiration: 3600, // ساعة واحدة
           order_id: orderData.id,
           billing_data: {
             apartment: 'NA',
             email: body.customerData?.email || 'customer@example.com',
             floor: 'NA',
             first_name: body.customerData?.name?.split(' ')[0] || 'Customer',
             street: 'Digital Product',
             building: 'NA',
             phone_number: body.customerData?.phone || '+201000000000',
             shipping_method: 'PKG',
             postal_code: '12345',
             city: 'Cairo',
             country: 'EG',
             last_name: body.customerData?.name?.split(' ').slice(1).join(' ') || 'Customer',
             state: 'Cairo'
           },
           currency: 'EGP',
           integration_id: PAYMOB_CONFIG.INTEGRATION_ID
         };
         console.log('🔑 Payment key payload:', JSON.stringify(paymentKeyPayload, null, 2));
         
         // الخطوة 3: إنشاء Payment Key
         const paymentKeyResponse = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(paymentKeyPayload)
         });
         
         console.log('📡 Payment key response status:', paymentKeyResponse.status);
         const paymentKeyData = await paymentKeyResponse.json();
         console.log('🔑 Payment key response data:', JSON.stringify(paymentKeyData, null, 2));
         
        if (!paymentKeyData.token) {
          console.error('❌ No payment token in response');
          throw new Error('فشل في إنشاء Payment Key');
        }

        console.log('✅ Payment key created successfully');

        // إنشاء رابط الدفع
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_CONFIG.INTEGRATION_ID}?payment_token=${paymentKeyData.token}`;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            paymentUrl,
            paymentToken: paymentKeyData.token,
            paymobOrderId: orderData.id,
            message: 'تم إنشاء رابط الدفع بنجاح'
          }),
        };

      } catch (error) {
        console.error('❌ Error creating payment:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في إنشاء رابط الدفع: ' + error.message 
          }),
        };
      }
    }

    // POST /payment/callback - استقبال إشعارات Paymob
    if (method === 'POST' && pathSegments.includes('callback')) {
      const body = event.body ? JSON.parse(event.body) : {};
      console.log('📞 Payment callback received:', body);

      try {
        // التحقق من صحة الإشعار (HMAC)
        const { obj } = body;
        if (!obj) {
          throw new Error('Invalid callback data');
        }

        // استخراج معلومات الدفع
        const orderId = obj.order?.merchant_order_id;
        const paymentStatus = obj.success ? 'paid' : 'failed';
        const transactionId = obj.id;

        console.log('💳 Payment status:', { orderId, paymentStatus, transactionId });

        // تحديث حالة الطلب في Firebase
        if (orderId && db) {
          const orderDoc = doc(db, 'orders', orderId);
          await updateDoc(orderDoc, {
            paymentStatus,
            transactionId,
            paymentUpdatedAt: new Date().toISOString(),
            paymobData: obj
          });

          console.log('✅ Order payment status updated in Firebase');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };

      } catch (error) {
        console.error('❌ Error processing callback:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في معالجة إشعار الدفع: ' + error.message 
          }),
        };
      }
    }

    // GET /payment/status/{orderId} - التحقق من حالة الدفع
    if (method === 'GET' && pathSegments.includes('status')) {
      const orderId = pathSegments[pathSegments.length - 1];
      console.log('🔍 Checking payment status for order:', orderId);

      try {
        // يمكن إضافة منطق للتحقق من حالة الدفع من Paymob أو Firebase
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            orderId,
            message: 'يمكن التحقق من حالة الدفع من قاعدة البيانات'
          }),
        };

      } catch (error) {
        console.error('❌ Error checking payment status:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'خطأ في التحقق من حالة الدفع: ' + error.message 
          }),
        };
      }
    }

    // إذا لم يتم العثور على endpoint
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Payment endpoint not found' }),
    };

  } catch (error) {
    console.error('❌ Payment API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطأ في خدمة الدفع: ' + error.message }),
    };
  }
};