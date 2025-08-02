# حل خطأ 500 في API الدفع على Netlify

## المشكلة
```
POST https://afterads-sa.netlify.app/api/payment/create 500 (Internal Server Error)
فشل في انشاء رابط الدفع
```

## السبب
الخادم المباشر على Netlify لا يحتوي على متغيرات البيئة الخاصة بـ Paymob، مما يؤدي إلى فشل التحقق من صحة الإعدادات في `payment.js`.

## الحل

### الخطوة 1: إضافة متغيرات البيئة في Netlify Dashboard

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اختر موقعك `afterads-sa`
3. اذهب إلى `Site settings` > `Environment variables`
4. أضف المتغيرات التالية:

#### متغيرات Paymob (مطلوبة لحل الخطأ):
```
PAYMOB_API_KEY=your_paymob_api_key_here
PAYMOB_SECRET_KEY=your_paymob_secret_key_here
PAYMOB_HMAC_SECRET=your_paymob_hmac_secret_here
PAYMOB_INTEGRATION_ID=your_integration_id_here
PAYMOB_IFRAME_ID=your_iframe_id_here
PAYMOB_BASE_URL=https://accept.paymob.com/api
```

#### روابط الموقع:
```
SITE_URL=https://afterads-sa.netlify.app
SUCCESS_URL=https://afterads-sa.netlify.app/payment-result?success=true
ERROR_URL=https://afterads-sa.netlify.app/payment-result?success=false
CANCEL_URL=https://afterads-sa.netlify.app/checkout
```

#### متغيرات Firebase (إذا لم تكن موجودة):
```
VITE_FIREBASE_API_KEY=AIzaSyAr-8KXPyqsqcwiDSiIbyn6alhFcQCN4gU
VITE_FIREBASE_AUTH_DOMAIN=perfum-ac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=perfum-ac
VITE_FIREBASE_STORAGE_BUCKET=perfum-ac.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=429622096271
VITE_FIREBASE_APP_ID=1:429622096271:web:88876e9ae849344a5d1bfa
```

### الخطوة 2: إعادة النشر

1. بعد إضافة المتغيرات، اذهب إلى `Deploys`
2. اضغط `Trigger deploy` > `Deploy site`
3. انتظر حتى ينتهي النشر

### الخطوة 3: التحقق من الحل

1. اذهب إلى الموقع: https://afterads-sa.netlify.app
2. أضف منتجات للسلة
3. اذهب لصفحة الدفع
4. اختر "الدفع بالبطاقة"
5. اضغط "تأكيد الطلب"
6. يجب أن تظهر صفحة Paymob بدلاً من خطأ 500

## التفسير التقني

ملف `payment.js` يحتوي على دالة `validatePaymobConfig()` التي تتحقق من وجود متغيرات Paymob:

```javascript
function validatePaymobConfig() {
  const issues = [];
  
  if (!PAYMOB_CONFIG.API_KEY || PAYMOB_CONFIG.API_KEY === 'your_api_key_here') {
    issues.push('PAYMOB_API_KEY is missing or invalid');
  }
  // ... المزيد من التحققات
  
  return issues;
}
```

إذا كانت هناك مشاكل في الإعدادات، يتم إرجاع خطأ 500:

```javascript
if (configIssues.length > 0) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Paymob configuration error',
      message: 'يرجى التحقق من إعدادات Paymob في متغيرات البيئة'
    })
  };
}
```

## ملاحظات مهمة

- ✅ **الخادم المحلي يعمل بشكل صحيح** لأن ملف `.env` محدث
- ❌ **الخادم المباشر يحتاج لمتغيرات البيئة** في Netlify Dashboard
- 🔄 **إعادة النشر مطلوبة** بعد إضافة المتغيرات
- 🔐 **لا تشارك متغيرات Paymob** مع أحد

## الملفات المرجعية

- `NETLIFY_ENV_VARS_UPDATED.txt` - قائمة كاملة بالمتغيرات المطلوبة
- `payment.js` - ملف API الدفع
- `.env` - إعدادات التطوير المحلي

بعد تطبيق هذه الخطوات، سيتم حل خطأ 500 وستعمل وظيفة الدفع بشكل صحيح على الموقع المباشر.