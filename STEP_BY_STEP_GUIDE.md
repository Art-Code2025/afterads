# دليل خطوة بخطوة لإصلاح مشكلة الدفع 🚀

## الخطوة 1: تحديث متغيرات البيئة في Netlify Dashboard 🔧

### أ) الدخول إلى Netlify Dashboard

1. **اذهب إلى:** https://app.netlify.com/
2. **سجل دخول** بحسابك
3. **اختر موقع** `afterads-sa` من قائمة المواقع

### ب) الوصول لإعدادات متغيرات البيئة

1. **اضغط على "Site settings"** (في الشريط العلوي)
2. **من القائمة الجانبية اليسرى، اختر "Environment variables"**
3. **ستجد قائمة بمتغيرات البيئة الحالية**

### ج) تحديث المتغيرات

**ابحث عن هذه المتغيرات وحدثها:**

```
SITE_URL
```
- **القيمة الجديدة:** `https://afterads-sa.netlify.app`
- **اضغط "Edit"** ← **غير القيمة** ← **اضغط "Save"**

```
SUCCESS_URL
```
- **القيمة الجديدة:** `https://afterads-sa.netlify.app/payment-result?success=true`

```
ERROR_URL
```
- **القيمة الجديدة:** `https://afterads-sa.netlify.app/payment-result?success=false`

```
CANCEL_URL
```
- **القيمة الجديدة:** `https://afterads-sa.netlify.app/checkout`

**إذا لم تجد هذه المتغيرات:**
- **اضغط "Add variable"**
- **اكتب اسم المتغير** (مثل SITE_URL)
- **اكتب القيمة**
- **اضغط "Create variable"**

---

## الخطوة 2: إعادة نشر الموقع 🔄

### الطريقة الأولى: من Netlify Dashboard

1. **اذهب إلى "Deploys" tab** (في موقعك)
2. **اضغط "Trigger deploy"**
3. **اختر "Deploy site"**
4. **انتظر انتهاء النشر** (سيظهر "Published" باللون الأخضر)

### الطريقة الثانية: من GitHub (إذا كان مربوط)

```bash
# في Terminal أو Command Prompt
git add .
git commit -m "Update environment variables for production"
git push
```

**ملاحظة:** إذا كان موقعك مربوط بـ GitHub، سيتم النشر تلقائياً عند الـ push

---

## الخطوة 3: تحديث callback URLs في لوحة تحكم Paymob 💳

### أ) الدخول إلى Paymob Dashboard

1. **اذهب إلى:** https://accept.paymob.com/portal2/en/PaymobDeveloperPortal
2. **سجل دخول** بحسابك
3. **اختر "Integrations"** من القائمة الجانبية

### ب) تحديث Integration Settings

1. **اختر Integration الخاص بك** (عادة يكون اسمه "Online Card Payment" أو مشابه)
2. **اضغط "Edit"** أو أيقونة التعديل ✏️
3. **ابحث عن قسم "Callback URLs" أو "Redirect URLs"**

### ج) تحديث الروابط

**حدث هذه الحقول:**

```
Success URL (رابط النجاح):
https://afterads-sa.netlify.app/payment-result?success=true
```

```
Error URL (رابط الخطأ):
https://afterads-sa.netlify.app/payment-result?success=false
```

```
Cancel URL (رابط الإلغاء):
https://afterads-sa.netlify.app/checkout
```

```
Callback URL (رابط الـ Webhook):
https://afterads-sa.netlify.app/.netlify/functions/payment/callback
```

4. **اضغط "Save"** أو "Update"

### د) تحديث Webhook Settings (إذا وجد)

1. **ابحث عن قسم "Webhooks" أو "Notifications"**
2. **حدث Webhook URL إلى:**
   ```
   https://afterads-sa.netlify.app/.netlify/functions/payment/callback
   ```
3. **تأكد من تفعيل الـ Webhook**
4. **احفظ التغييرات**

---

## التحقق من نجاح الإصلاح ✅

### 1. انتظر 5-10 دقائق
**بعد تحديث متغيرات البيئة وإعادة النشر**

### 2. امسح Cache المتصفح
```
- Chrome: Ctrl+Shift+R (Windows) أو Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) أو Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R (Mac)
```

### 3. اختبر عملية الدفع

1. **اذهب إلى:** https://afterads-sa.netlify.app/
2. **أضف منتج للسلة**
3. **اذهب للدفع**
4. **تأكد من التوجيه لصفحة Paymob**

### 4. اختبر جميع المسارات

- **نجاح الدفع:** يجب أن توجه لـ `/payment-result?success=true`
- **فشل الدفع:** يجب أن توجه لـ `/payment-result?success=false`
- **إلغاء الدفع:** يجب أن توجه لـ `/checkout`

---

## إذا لم تعمل التغييرات ⚠️

### تحقق من:

1. **متغيرات البيئة في Netlify:**
   - تأكد من حفظ جميع المتغيرات
   - تأكد من عدم وجود مسافات زائدة

2. **إعدادات Paymob:**
   - تأكد من حفظ جميع الروابط
   - تأكد من تفعيل Integration

3. **النشر:**
   - تأكد من اكتمال عملية النشر
   - تحقق من عدم وجود أخطاء في Build

### طلب المساعدة:

إذا استمرت المشكلة، أرسل:
- **لقطة شاشة من متغيرات البيئة في Netlify**
- **لقطة شاشة من إعدادات Paymob**
- **رسالة الخطأ (إن وجدت)**

---

## ملخص سريع 📋

✅ **Netlify:** Site Settings → Environment variables → حدث الروابط

✅ **إعادة النشر:** Deploys → Trigger deploy

✅ **Paymob:** Integrations → Edit → حدث Callback URLs

✅ **اختبار:** امسح Cache + جرب الدفع

**النتيجة:** الدفع سيعمل بشكل صحيح! 🎉