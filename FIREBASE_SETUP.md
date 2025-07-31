# إعداد Firebase للمشروع

## الخطوات المطلوبة:

### 1. إنشاء مشروع Firebase جديد:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "إنشاء مشروع" (Create Project)
3. اختر اسم المشروع (مثل: mawasim-store)
4. اتبع خطوات الإعداد

### 2. إعداد Firestore Database:
1. من قائمة المشروع، اختر "Firestore Database"
2. انقر على "إنشاء قاعدة بيانات" (Create Database)
3. اختر وضع الاختبار (Test mode) للبداية
4. اختر المنطقة الجغرافية الأقرب لك

### 3. الحصول على إعدادات المشروع:
1. اذهب إلى "إعدادات المشروع" (Project Settings)
2. انقر على "إضافة تطبيق" (Add App) واختر "Web"
3. أدخل اسم التطبيق
4. انسخ كود الإعداد (Firebase Config)

### 4. تحديث ملفات الإعداد:

#### أ. تحديث `netlify/functions/config/firebase.js`:
```javascript
// استبدل البيانات الموجودة بالبيانات الحقيقية من Firebase Console
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### ب. تحديث `frontend/src/config/firebase.js`:
```javascript
// نفس البيانات المستخدمة في الباك إند
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. إعداد قواعد الأمان في Firestore:
اذهب إلى Firestore Rules وضع هذه القواعد:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بالقراءة والكتابة للجميع (مؤقتاً للاختبار)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ مهم**: هذه القواعد للاختبار فقط. في الإنتاج، يجب تشديد قواعد الأمان.

### 6. تهيئة البيانات الأولية:
بعد تحديث إعدادات Firebase، قم بتشغيل:
```bash
node init-firebase.js
```

## الميزات الجديدة بعد إعداد Firebase:

✅ **حفظ دائم للبيانات**: جميع التعديلات ستُحفظ في قاعدة البيانات
✅ **إدارة المنتجات**: إضافة، تعديل، حذف المنتجات
✅ **إدارة التصنيفات**: إنشاء وتعديل التصنيفات
✅ **إدارة الطلبات**: تتبع جميع الطلبات وحالاتها
✅ **إدارة العملاء**: قاعدة بيانات كاملة للعملاء
✅ **إدارة الكوبونات**: إنشاء وإدارة رموز الخصم
✅ **إحصائيات حقيقية**: إحصائيات مبنية على البيانات الفعلية

## اختبار الإعداد:
1. ارفع المشروع إلى Netlify
2. اذهب إلى `/admin`
3. سجل دخول بـ admin/123123
4. جرب إضافة منتج جديد
5. اعمل refresh للصفحة
6. تأكد أن المنتج لا يزال موجوداً

## استكشاف الأخطاء:
- تأكد من صحة إعدادات Firebase في الملفات
- تحقق من logs في Netlify Functions
- تأكد من أن Firestore Rules تسمح بالقراءة والكتابة
- في حال فشل Firebase، النظام سيعود للبيانات الوهمية تلقائياً 