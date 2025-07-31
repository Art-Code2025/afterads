# دليل تشخيص المشاكل 🔧

## المشكلة: فشل جميع العمليات (إضافة، تعديل، حذف)

### 🔍 خطوات التشخيص:

#### 1. **فحص Console المتصفح**:
- اضغط `F12` في المتصفح
- اذهب لتاب `Console`
- ابحث عن أي أخطاء حمراء
- لاحظ رسائل API Calls (ستظهر بالرموز مثل 🚀, 📡, ✅, ❌)

#### 2. **فحص Network Tab**:
- في Developer Tools، اذهب لتاب `Network`
- جرب إضافة منتج جديد
- لاحظ الـ requests في القائمة
- اذا كانت الـ requests حمراء، انقر عليها واقرأ الخطأ

#### 3. **فحص URL الـ API**:
- في Console، ابحث عن رسالة تحتوي على: `🔗 API Base URL`
- يجب أن تكون مثل: `/.netlify/functions` للإنتاج
- أو `http://localhost:8888/.netlify/functions` للتطوير المحلي

### 🚨 الأخطاء الشائعة وحلولها:

#### **خطأ 404 - Function Not Found**:
```
Solution: 
- تأكد من أن الـ Functions deployed صحيح
- تحقق من netlify.toml configuration
```

#### **خطأ CORS**:
```
Access to fetch at '...' has been blocked by CORS policy
Solution:
- الـ functions مُحدثة للتعامل مع CORS
- تأكد من deployment الجديد
```

#### **خطأ Firebase**:
```
Firebase configuration error
Solution:
1. تحقق من netlify/functions/config/firebase.js
2. تأكد من صحة Firebase project ID
3. تحقق من Firestore Rules
```

#### **خطأ Timeout**:
```
Request timeout - please try again
Solution:
- مدة الانتظار زادت إلى 15 ثانية
- تحقق من سرعة الإنترنت
- قد تكون Firebase بطيئة - سيعود النظام للبيانات الوهمية
```

### 🔧 حلول سريعة:

#### **إذا كانت كل العمليات فاشلة**:
1. **افحص الرابط الأساسي للـ API**:
   ```javascript
   // في Console المتصفح، اكتب:
   localStorage.clear();
   location.reload();
   ```

2. **تأكد من الـ Deployment**:
   - تأكد من أن آخر deployment نجح في Netlify
   - تحقق من Functions logs في Netlify Dashboard

3. **اختبر الـ API مباشرة**:
   ```
   اذهب إلى: https://your-site.netlify.app/.netlify/functions/products
   يجب أن ترى JSON response
   ```

#### **إذا كان Firebase لا يعمل**:
- النظام سيعمل بالبيانات الوهمية تلقائياً
- ستظهر رسالة في Console: `❌ Firestore error, falling back to mock data`
- هذا طبيعي إذا لم تقم بإعداد Firebase بعد

### 🧪 اختبار النظام:

#### **1. اختبار Firebase**:
```
URL: https://your-site.netlify.app/.netlify/functions/test-firebase
```

#### **2. اختبار Products API**:
```
URL: https://your-site.netlify.app/.netlify/functions/products
```

#### **3. اختبار Dashboard**:
```
URL: https://your-site.netlify.app/.netlify/functions/dashboard
```

### 📝 معلومات للمطور:

#### **Log Messages الجديدة**:
- `🚀 Starting API call` - بداية API call
- `📡 Making fetch request` - إرسال request
- `📩 Response received` - استلام response
- `✅ API Success` - نجح الطلب
- `❌ API Error` - فشل الطلب
- `💥 API Call Failed` - خطأ عام

#### **بيانات التشخيص**:
```javascript
// للحصول على معلومات التشخيص:
console.log('API Base URL:', 
  window.location.hostname === 'localhost' 
    ? 'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions'
);
```

### 🆘 إذا لم تنجح الحلول:

1. **أعد deployment المشروع**
2. **امسح cache المتصفح** (Ctrl+Shift+R)
3. **جرب متصفح آخر**
4. **تحقق من Netlify Functions logs**
5. **أرفق screenshot من Console errors**

---

**💡 تذكر**: النظام مصمم للعمل حتى لو فشل Firebase - سيستخدم بيانات وهمية كـ fallback. 