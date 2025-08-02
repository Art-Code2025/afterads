# تحديث متغيرات البيئة في Netlify 🚀

## المشكلة المحلولة ✅

**المشكلة:** عند الدفع في موقع `https://afterads-sa.netlify.app/` يتم التوجيه لنفس الصفحة بدلاً من صفحة الدفع

**السبب:** متغيرات البيئة في Netlify مازالت تشير إلى `localhost` بدلاً من رابط الموقع الحقيقي

## الحل المطبق محلياً ✓

تم تحديث ملف `.env` ليحتوي على:

```env
SITE_URL=https://afterads-sa.netlify.app
SUCCESS_URL=https://afterads-sa.netlify.app/payment-result?success=true
ERROR_URL=https://afterads-sa.netlify.app/payment-result?success=false
CANCEL_URL=https://afterads-sa.netlify.app/checkout
```

## خطوات تطبيق التغييرات على Netlify 📋

### 1. تحديث متغيرات البيئة في Netlify Dashboard

1. **اذهب إلى Netlify Dashboard:**
   - https://app.netlify.com/
   - اختر موقع `afterads-sa`

2. **اذهب إلى Site Settings:**
   - اضغط على "Site settings"
   - اختر "Environment variables" من القائمة الجانبية

3. **حدث المتغيرات التالية:**

```env
SITE_URL=https://afterads-sa.netlify.app
SUCCESS_URL=https://afterads-sa.netlify.app/payment-result?success=true
ERROR_URL=https://afterads-sa.netlify.app/payment-result?success=false
CANCEL_URL=https://afterads-sa.netlify.app/checkout
```

### 2. إعادة نشر الموقع

بعد تحديث متغيرات البيئة:

```bash
# ارفع التغييرات على GitHub
git add .
git commit -m "Fix payment URLs for production"
git push
```

أو اضغط "Trigger deploy" في Netlify Dashboard

### 3. تحديث إعدادات Paymob

**مهم جداً:** يجب تحديث callback URLs في لوحة تحكم Paymob:

1. **اذهب إلى Paymob Dashboard:**
   - https://accept.paymob.com/portal2/en/PaymobDeveloperPortal

2. **حدث Integration Settings:**
   - Success URL: `https://afterads-sa.netlify.app/payment-result?success=true`
   - Error URL: `https://afterads-sa.netlify.app/payment-result?success=false`
   - Cancel URL: `https://afterads-sa.netlify.app/checkout`

3. **حدث Webhook URLs:**
   - Callback URL: `https://afterads-sa.netlify.app/.netlify/functions/payment/callback`

## التحقق من الإصلاح ✓

بعد تطبيق التغييرات:

1. **اذهب إلى الموقع:** https://afterads-sa.netlify.app/
2. **جرب عملية دفع تجريبية**
3. **تأكد من التوجيه الصحيح للصفحات**

## ملاحظات مهمة ⚠️

1. **انتظر 5-10 دقائق** بعد تحديث متغيرات البيئة
2. **امسح cache المتصفح** إذا لم تظهر التغييرات
3. **تأكد من تحديث Paymob settings** أيضاً
4. **اختبر جميع مسارات الدفع** (نجاح، فشل، إلغاء)

## قائمة التحقق النهائية ☑️

- [ ] تحديث متغيرات البيئة في Netlify
- [ ] إعادة نشر الموقع
- [ ] تحديث إعدادات Paymob
- [ ] اختبار عملية الدفع
- [ ] التأكد من عمل جميع الروابط

---

**النتيجة المتوقعة:** عند الدفع سيتم توجيهك لصفحة Paymob الصحيحة بدلاً من البقاء في نفس الصفحة! 🎉