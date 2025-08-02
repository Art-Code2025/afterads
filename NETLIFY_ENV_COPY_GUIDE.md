# دليل نسخ متغيرات البيئة إلى Netlify

## المشكلة
لديك ملف `.env` محلي يحتوي على جميع المتغيرات المطلوبة، لكن Netlify لا تقرأ هذا الملف تلقائياً. تحتاج إلى نسخ هذه المتغيرات يدوياً إلى لوحة تحكم Netlify.

## الحل: نسخ المتغيرات من ملف .env إلى Netlify

### الخطوة 1: الوصول إلى لوحة تحكم Netlify
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخولك
3. اختر موقعك `afterads-sa`
4. اذهب إلى **Site settings** → **Environment variables**

### الخطوة 2: إضافة المتغيرات التالية
انسخ والصق هذه المتغيرات **بالضبط كما هي** في لوحة تحكم Netlify:

#### متغيرات Paymob الأساسية:
```
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBMk5Ea3dNaXdpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5WMHB6OVZPTVBWLVlmX2pwYV9ZR0pxYVd5ZFJ1V2V4MnFNb21EUjZVMDg0cXlSc19yNHlTb29JQlU0T1lMWVFDZGlYMERqbDZpRkcwQnNIaTljTmFodw==

PAYMOB_SECRET_KEY=your_paymob_secret_key_here

PAYMOB_HMAC_SECRET=7135FDF9CBFA345C841850725BE2CE9D

PAYMOB_INTEGRATION_ID=5222059

PAYMOB_IFRAME_ID=945119

PAYMOB_BASE_URL=https://accept.paymob.com/api
```

#### روابط الموقع:
```
SITE_URL=https://afterads-sa.netlify.app

SUCCESS_URL=https://afterads-sa.netlify.app/payment-result?success=true

ERROR_URL=https://afterads-sa.netlify.app/payment-result?success=false

CANCEL_URL=https://afterads-sa.netlify.app/checkout
```

#### متغيرات إضافية (إذا كنت تستخدم Firebase):
```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

NODE_ENV=production
```

### الخطوة 3: كيفية إضافة كل متغير
1. اضغط على **Add variable**
2. في حقل **Key**: اكتب اسم المتغير (مثل `PAYMOB_API_KEY`)
3. في حقل **Value**: اكتب القيمة (مثل `ZXlKaGJHY2lP...`)
4. اضغط **Save**
5. كرر هذه العملية لكل متغير

### الخطوة 4: إعادة نشر الموقع
بعد إضافة جميع المتغيرات:
1. اذهب إلى **Deploys**
2. اضغط **Trigger deploy** → **Deploy site**
3. انتظر حتى ينتهي النشر

### الخطوة 5: اختبار الدفع
1. اذهب إلى موقعك: https://afterads-sa.netlify.app
2. جرب عملية دفع
3. يجب أن تعمل بشكل صحيح الآن

## ملاحظات مهمة:
- **لا تنس** تحديث إعدادات Callback URLs في لوحة تحكم Paymob
- تأكد من أن جميع المتغيرات منسوخة **بالضبط** كما هي
- إذا واجهت مشاكل، تحقق من أن جميع المتغيرات موجودة في Netlify

## التحقق من نجاح العملية:
يمكنك التحقق من أن المتغيرات تم إضافتها بنجاح من خلال:
1. الذهاب إلى **Site settings** → **Environment variables**
2. يجب أن ترى جميع المتغيرات مدرجة هناك

---

**الخلاصة**: المشكلة ليست في الكود، بل في أن Netlify تحتاج إلى إضافة متغيرات البيئة يدوياً في لوحة التحكم.