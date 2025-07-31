# 🚀 دليل نشر مشروع مواسم على Netlify

## 📋 **المتطلبات المسبقة**
- حساب على [Netlify](https://netlify.com)
- المشروع مرفوع على GitHub: `https://github.com/Art-Code2025/perfumes`

## 🔧 **خطوات النشر**

### 1️⃣ **ربط المشروع بـ Netlify**
1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اضغط على **"New site from Git"**
3. اختر **GitHub** كمصدر
4. ابحث عن repository: `Art-Code2025/perfumes`
5. اضغط على **Deploy site**

### 2️⃣ **إعدادات Build**
Netlify سيقرأ الإعدادات من `netlify.toml` تلقائياً:
- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/dist`
- **Functions directory**: `netlify/functions`
- **Node version**: `22`

### 3️⃣ **متغيرات البيئة (Environment Variables)**
اذهب إلى **Site settings > Environment variables** وأضف:

#### 🔥 **Firebase Configuration**
```
VITE_FIREBASE_API_KEY=AIzaSyAr-8KXPyqsqcwiDSiIbyn6alhFcQCN4gU
VITE_FIREBASE_AUTH_DOMAIN=perfum-ac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=perfum-ac
VITE_FIREBASE_STORAGE_BUCKET=perfum-ac.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=429622096271
VITE_FIREBASE_APP_ID=1:429622096271:web:88876e9ae849344a5d1bfa
```

#### ☁️ **Cloudinary Configuration**
```
VITE_CLOUDINARY_CLOUD_NAME=dfbup2swi
VITE_CLOUDINARY_UPLOAD_PRESET=perfume
```

#### 🔐 **Admin Configuration**
```
ADMIN_REGISTRATION_KEY=super-secret-admin-key-2024
VITE_API_BASE_URL=/.netlify/functions
```

### 4️⃣ **Firebase Firestore Rules**
تأكد من أن قواعد Firestore تسمح بالقراءة والكتابة:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5️⃣ **تفعيل Functions**
Netlify Functions ستعمل تلقائياً من مجلد `netlify/functions`

## 🎯 **النتيجة النهائية**

بعد النشر، ستحصل على:
- **🌐 الموقع الرئيسي**: `https://your-site-name.netlify.app`
- **🛠️ لوحة التحكم**: `https://your-site-name.netlify.app/login`
- **⚡ APIs**: `https://your-site-name.netlify.app/.netlify/functions/`

## 🔑 **بيانات الدخول للإدمن**
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `123123`

## 📝 **APIs المتاحة**
- `/auth/admin` - تسجيل دخول الإدمن
- `/products` - إدارة المنتجات
- `/categories` - إدارة التصنيفات
- `/orders` - إدارة الطلبات
- `/customers` - إدارة العملاء
- `/coupons` - إدارة الكوبونات
- `/upload` - رفع الصور
- `/dashboard` - إحصائيات لوحة التحكم

## 🚨 **نصائح مهمة**
1. **تأكد من Firebase Rules**: يجب أن تسمح بالقراءة والكتابة
2. **Environment Variables**: يجب إضافة جميع المتغيرات المطلوبة
3. **Domain Settings**: يمكنك ربط دومين مخصص لاحقاً
4. **SSL Certificate**: Netlify توفر SSL مجاناً

## 🔄 **التحديثات المستقبلية**
أي push جديد إلى `main` branch سيؤدي إلى إعادة build تلقائية

## 📞 **الدعم**
إذا واجهت أي مشاكل، تحقق من:
- Build logs في Netlify Dashboard
- Function logs في Netlify Functions tab
- Browser Console للأخطاء في Frontend 