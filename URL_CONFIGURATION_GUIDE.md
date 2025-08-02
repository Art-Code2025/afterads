# دليل تكوين الروابط (URLs Configuration)

## فهم الروابط في ملف .env 🔗

### الروابط الحالية (للتطوير المحلي)

```env
SITE_URL=http://localhost:5173
SUCCESS_URL=http://localhost:5173/payment-result?success=true
ERROR_URL=http://localhost:5173/payment-result?success=false
CANCEL_URL=http://localhost:5173/checkout
```

**هذه الروابط مخصصة للتطوير المحلي فقط!** 🏠

## متى تستخدم كل نوع من الروابط؟

### 1. التطوير المحلي (Local Development) 💻
**متى:** عندما تعمل على الكود في جهازك
**الروابط:** `http://localhost:5173`
**الاستخدام:** للاختبار والتطوير

### 2. الإنتاج (Production) 🌐
**متى:** عندما ترفع الموقع على الإنترنت
**الروابط:** رابط موقعك الحقيقي
**مثال:** `https://your-site.netlify.app`

## كيفية تغيير الروابط للإنتاج 🔧

### إذا كنت تستخدم Netlify:

1. **ارفع موقعك على Netlify**
2. **احصل على رابط موقعك** (مثل: `https://amazing-site-123.netlify.app`)
3. **حدث ملف .env:**

```env
# للإنتاج على Netlify
SITE_URL=https://amazing-site-123.netlify.app
SUCCESS_URL=https://amazing-site-123.netlify.app/payment-result?success=true
ERROR_URL=https://amazing-site-123.netlify.app/payment-result?success=false
CANCEL_URL=https://amazing-site-123.netlify.app/checkout
```

### إذا كنت تستخدم خادم آخر:

```env
# للإنتاج على خادم مخصص
SITE_URL=https://yourwebsite.com
SUCCESS_URL=https://yourwebsite.com/payment-result?success=true
ERROR_URL=https://yourwebsite.com/payment-result?success=false
CANCEL_URL=https://yourwebsite.com/checkout
```

## أهمية هذه الروابط 📋

### SITE_URL
- **الغرض:** الرابط الأساسي لموقعك
- **الاستخدام:** في إعدادات CORS وcallbacks

### SUCCESS_URL
- **الغرض:** الصفحة التي يتم توجيه المستخدم إليها بعد نجاح الدفع
- **مثال:** "تم الدفع بنجاح!"

### ERROR_URL
- **الغرض:** الصفحة التي يتم توجيه المستخدم إليها عند فشل الدفع
- **مثال:** "فشل في الدفع، حاول مرة أخرى"

### CANCEL_URL
- **الغرض:** الصفحة التي يتم توجيه المستخدم إليها عند إلغاء الدفع
- **مثال:** العودة لصفحة الدفع

## خطوات النشر الصحيحة 🚀

### 1. للتطوير المحلي:
```bash
# استخدم الروابط الحالية
npm run dev
# الموقع سيعمل على http://localhost:5173
```

### 2. للنشر على Netlify:
```bash
# 1. ارفع الكود على GitHub
git add .
git commit -m "Ready for production"
git push

# 2. اربط GitHub مع Netlify
# 3. احصل على رابط الموقع
# 4. حدث متغيرات البيئة في Netlify Dashboard
```

## نصائح مهمة ⚠️

1. **لا تخلط بين البيئات:** استخدم localhost للتطوير فقط
2. **حدث Paymob settings:** أضف الروابط الجديدة في لوحة تحكم Paymob
3. **اختبر الروابط:** تأكد من أن جميع الصفحات تعمل
4. **أمان SSL:** استخدم https:// في الإنتاج

## مثال كامل للنشر 📝

```env
# بيئة التطوير
SITE_URL=http://localhost:5173

# بيئة الإنتاج (غير التعليقات لتفعيلها)
# SITE_URL=https://my-perfume-store.netlify.app
# SUCCESS_URL=https://my-perfume-store.netlify.app/payment-result?success=true
# ERROR_URL=https://my-perfume-store.netlify.app/payment-result?success=false
# CANCEL_URL=https://my-perfume-store.netlify.app/checkout
```

---

**الخلاصة:** الروابط الحالية صحيحة للتطوير المحلي. عند النشر، غيرها لرابط موقعك الحقيقي! 🎯