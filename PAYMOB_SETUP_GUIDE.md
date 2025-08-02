# دليل إعداد Paymob Payment Gateway

## المشكلة الحالية ❌

تم اكتشاف أن `PAYMOB_API_KEY` المستخدم حالياً هو **auth token مؤقت** وليس API key ثابت، مما يسبب خطأ 500 من خادم Paymob.

## الحل المطلوب ✅

### 1. الحصول على API Key الصحيح

1. **سجل دخول إلى لوحة تحكم Paymob:**
   - اذهب إلى: https://accept.paymob.com/portal2/en/PaymobDeveloperPortal
   - سجل دخول بحسابك

2. **احصل على API Key:**
   - اذهب إلى قسم "API Keys" أو "Developer Settings"
   - انسخ الـ **Secret Key** (وليس Auth Token)
   - يجب أن يبدأ بـ `sk_` أو يكون نص ثابت

3. **احصل على Integration ID:**
   - اذهب إلى قسم "Integrations"
   - انسخ Integration ID للدفع الإلكتروني

4. **احصل على HMAC Secret:**
   - موجود في إعدادات الـ Integration
   - مطلوب للتحقق من صحة callbacks

### 2. تحديث ملف .env

استبدل القيم في ملف `.env`:

```env
# استبدل هذه القيم بالقيم الصحيحة من لوحة تحكم Paymob
PAYMOB_API_KEY=sk_your_actual_secret_key_here
PAYMOB_INTEGRATION_ID=your_actual_integration_id
PAYMOB_HMAC_SECRET=your_actual_hmac_secret
```

### 3. إعادة تشغيل الخادم

بعد تحديث ملف `.env`:

```bash
# أوقف الخادم الحالي (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

## التحقق من الإعداد ✓

بعد التحديث، اختبر payment API:

```bash
curl -X POST http://localhost:8888/.netlify/functions/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName":"أحمد محمد",
    "customerPhone":"+966501234567",
    "customerEmail":"ahmed@test.com",
    "items":[{"productId":"1","productName":"منتج تجريبي","price":100,"quantity":1}],
    "total":100,
    "paymentMethod":"online_payment"
  }'
```

## ملاحظات مهمة 📝

1. **لا تشارك API Keys:** لا تضع API keys في GitHub أو أي مكان عام
2. **استخدم Test Mode:** تأكد من استخدام test keys أثناء التطوير
3. **Production Keys:** استخدم production keys فقط في بيئة الإنتاج
4. **Webhook URLs:** تأكد من إعداد webhook URLs في لوحة تحكم Paymob

## روابط مفيدة 🔗

- [Paymob Developer Portal](https://accept.paymob.com/portal2/en/PaymobDeveloperPortal)
- [Paymob API Documentation](https://docs.paymob.com/)
- [Paymob Integration Guide](https://docs.paymob.com/docs/accept-standard-redirect)

---

**الخطأ الحالي:** `API_KEY appears to be a temporary auth token, not a permanent API key`

**الحل:** احصل على Secret Key الثابت من لوحة تحكم Paymob وحدث ملف .env