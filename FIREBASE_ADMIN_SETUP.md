# إعداد Firebase Admin SDK للفواتير

## المشكلة
تظهر رسالة خطأ 500 عند محاولة إنشاء الفواتير أو التقارير بسبب عدم وجود بيانات Firebase Admin SDK الصحيحة.

## الحل

### 1. الحصول على بيانات Firebase Admin SDK

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك `perfum-ac`
3. اذهب إلى **Project Settings** (إعدادات المشروع)
4. اختر تبويب **Service accounts** (حسابات الخدمة)
5. اضغط على **Generate new private key** (إنشاء مفتاح خاص جديد)
6. سيتم تحميل ملف JSON يحتوي على البيانات المطلوبة

### 2. تحديث ملف .env

افتح ملف `.env` وحدث المتغيرات التالية بالبيانات من ملف JSON:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=perfum-ac
FIREBASE_PRIVATE_KEY_ID=القيمة_من_private_key_id
FIREBASE_PRIVATE_KEY="القيمة_الكاملة_من_private_key"
FIREBASE_CLIENT_EMAIL=القيمة_من_client_email
FIREBASE_CLIENT_ID=القيمة_من_client_id
FIREBASE_CLIENT_CERT_URL=القيمة_من_client_x509_cert_url
FIREBASE_DATABASE_URL=https://perfum-ac-default-rtdb.firebaseio.com
```

### 3. مثال على ملف JSON

```json
{
  "type": "service_account",
  "project_id": "perfum-ac",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@perfum-ac.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 4. إعادة تشغيل الخادم

بعد تحديث ملف `.env`:

1. أوقف خادم Netlify (Ctrl+C في Terminal)
2. أعد تشغيله بالأمر: `npx netlify dev`

### 5. اختبار الفواتير

1. اذهب إلى لوحة التحكم
2. اختر تبويب **إدارة الفواتير**
3. جرب إنشاء فاتورة أو تقرير

## ملاحظات مهمة

- **لا تشارك** ملف JSON أو بيانات Firebase Admin SDK مع أحد
- تأكد من إضافة ملف `.env` إلى `.gitignore`
- في بيئة الإنتاج (Netlify)، أضف هذه المتغيرات في إعدادات البيئة

## إعداد Netlify للإنتاج

1. اذهب إلى لوحة تحكم Netlify
2. اختر موقعك
3. اذهب إلى **Site settings** > **Environment variables**
4. أضف جميع متغيرات Firebase Admin SDK

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. تحقق من صحة البيانات في ملف `.env`
2. تأكد من أن المشروع `perfum-ac` نشط في Firebase
3. تحقق من صلاحيات حساب الخدمة في Firebase
4. راجع سجلات الأخطاء في Terminal