# 🚀 دليل النشر على Render

## المرحلة 1️⃣: إنشاء حساب Render

### الخطوات:

1. **اذهب إلى:** https://render.com

2. **انقر على "Sign Up"** (أعلى اليمين)

3. **اختر طريقة التسجيل:**
   - GitHub (الأفضل - يربط مشروعك تلقائياً)
   - Google
   - البريد الإلكتروني

4. **إذا اخترت GitHub:**
   - انقر "Continue with GitHub"
   - سيطلب منك تسجيل الدخول إلى GitHub
   - وافق على الأذونات
   - ستعود إلى Render

5. **أكمل بيانات الحساب:**
   - الاسم
   - البريد الإلكتروني
   - كلمة المرور

6. **تحقق من بريدك الإلكتروني** (إذا لزم الأمر)

---

## المرحلة 2️⃣: ربط مشروعك من GitHub

### المتطلبات:

- ✅ حساب GitHub
- ✅ مشروعك موجود على GitHub
- ✅ حساب Render جديد

### الخطوات:

1. **ادخل إلى لوحة التحكم Render**
   - ستظهر رسالة: "Connect your first repository"

2. **انقر على "New +"** (أعلى اليسار)

3. **اختر "Web Service"**

4. **اختر "Build and deploy from a Git repository"**

5. **انقر "Connect"** بجانب مشروعك على GitHub
   - إذا لم يظهر، انقر "Configure account"
   - ثم اختر المستودع

6. **اختر الفرع:**
   - اختر `main` أو `master`

7. **أدخل اسم الخدمة:**
   - اكتب: `leader-academy`

---

## المرحلة 3️⃣: تكوين الخدمة

### في صفحة إعدادات الخدمة:

1. **Environment:**
   - اختر `Node`

2. **Build Command:**
   ```bash
   pnpm install && pnpm run build
   ```

3. **Start Command:**
   ```bash
   node dist/server/index.js
   ```

4. **Instance Type:**
   - اختر `Starter` ($7/شهر)

---

## المرحلة 4️⃣: إضافة متغيرات البيئة

### في قسم "Environment" في Render:

أضف المتغيرات التالية:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=your_oauth_url
VITE_OAUTH_PORTAL_URL=your_oauth_portal_url
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=your_name
BUILT_IN_FORGE_API_URL=your_forge_url
BUILT_IN_FORGE_API_KEY=your_forge_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=your_frontend_url
NODE_ENV=production
```

### الحصول على القيم:

- من ملف `.env` في مشروعك
- أو من Manus Dashboard

---

## المرحلة 5️⃣: نشر التطبيق

### الخطوات:

1. **انقر "Create Web Service"**

2. **انتظر النشر:**
   - سيبدأ البناء تلقائياً
   - ستظهر رسائل في السجل
   - المدة: 3-5 دقائق

3. **تحقق من الحالة:**
   - إذا رأيت ✅ أخضر: النشر نجح
   - إذا رأيت ❌ أحمر: حدثت مشكلة

4. **الحصول على URL:**
   - ستظهر رسالة: "Your service is live on..."
   - مثال: `https://leader-academy.onrender.com`

---

## المرحلة 6️⃣: اختبار التطبيق

### اختبر الـ API:

```bash
curl https://your-service.onrender.com/health
```

### اختبر الـ Frontend:

- اذهب إلى: `https://your-service.onrender.com`
- يجب أن ترى الصفحة الرئيسية

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: "Build failed"

**الحل:**
- تحقق من السجل (Logs)
- تأكد من `package.json` صحيح
- تأكد من `build` script موجود

### المشكلة 2: "Application failed to start"

**الحل:**
- تحقق من `start` command
- تأكد من جميع المتغيرات موجودة
- تحقق من `DATABASE_URL`

### المشكلة 3: "Port is already in use"

**الحل:**
- استخدم المتغير `PORT` من البيئة:
```javascript
const port = process.env.PORT || 3000;
app.listen(port);
```

---

## 📊 مراقبة التطبيق

### في لوحة تحكم Render:

1. **Logs:** شاهد رسائل الخادم
2. **Metrics:** شاهد استخدام الموارد
3. **Events:** شاهد سجل النشر

---

## 🔄 النشر التلقائي

### كيفية عمله:

1. تدفع كود جديد إلى GitHub
2. Render يكتشف التغيير تلقائياً
3. يبدأ البناء والنشر
4. التطبيق يتحدث تلقائياً

### لتعطيل النشر التلقائي:

- اذهب إلى: Settings → Auto-Deploy
- اختر "No"

---

## 💰 التكاليف

| الخطة | السعر | المميزات |
|------|------|---------|
| **Free** | مجاني | محدود، ينام بعد 15 دقيقة |
| **Starter** | $7/شهر | 0.5 CPU, 512MB RAM |
| **Standard** | $12/شهر | 1 CPU, 1GB RAM |
| **Pro** | $29/شهر | 2 CPU, 2GB RAM |

---

## ✅ قائمة التحقق

- [ ] حساب Render مُنشأ
- [ ] مشروع GitHub مربوط
- [ ] متغيرات البيئة مضافة
- [ ] التطبيق نُشر بنجاح
- [ ] الـ API يستجيب (Health Check)
- [ ] الـ Frontend يعمل
- [ ] النشر التلقائي يعمل

---

## 📞 الدعم

- **Render Docs:** https://render.com/docs
- **GitHub Issues:** تقارير الأخطاء
- **Render Support:** support@render.com

---

**تم الإنشاء:** 2026-04-12
**الإصدار:** 1.0
