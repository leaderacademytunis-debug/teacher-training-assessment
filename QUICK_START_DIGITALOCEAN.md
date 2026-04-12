# 🚀 دليل البدء السريع - نشر على DigitalOcean

**المدة المتوقعة:** 30 دقيقة  
**المستوى:** مبتدئ

---

## ⚡ **الخطوات السريعة (5 خطوات فقط):**

### **الخطوة 1: إنشاء حساب DigitalOcean (5 دقائق)**

```
1. اذهب إلى: https://www.digitalocean.com
2. انقر على "Sign Up"
3. أدخل بريدك الإلكتروني وكلمة مرورك
4. تحقق من بريدك
5. أضف بطاقة ائتمان
```

**النتيجة:** حساب DigitalOcean جاهز ✅

---

### **الخطوة 2: إنشاء Droplet (5 دقائق)**

```
1. اضغط "Create" → "Droplets"
2. اختر "Ubuntu 22.04 LTS"
3. اختر "$5/month" plan
4. اختر "Frankfurt" (أقرب للشرق الأوسط)
5. اضغط "Create Droplet"
6. انتظر 2 دقيقة
```

**النتيجة:** Droplet جديد بـ عنوان IP ✅

---

### **الخطوة 3: الاتصال بـ SSH (2 دقيقة)**

**على Windows (PowerShell):**
```powershell
ssh root@YOUR_DROPLET_IP
```

**على Mac/Linux:**
```bash
ssh root@YOUR_DROPLET_IP
```

**ملاحظة:** استبدل `YOUR_DROPLET_IP` بـ عنوان IP الفعلي

**النتيجة:** متصل بالخادم ✅

---

### **الخطوة 4: تشغيل السكريبت التلقائي (10 دقائق)**

```bash
# على الخادم (بعد الاتصال بـ SSH):

# تحميل المشروع
cd /tmp
wget https://raw.githubusercontent.com/your-repo/leader-academy/main/setup-digitalocean.sh
chmod +x setup-digitalocean.sh

# تشغيل السكريبت
./setup-digitalocean.sh
```

**ماذا يفعل السكريبت؟**
- ✅ تحديث النظام
- ✅ تثبيت Node.js
- ✅ تثبيت PM2
- ✅ تثبيت Nginx
- ✅ تثبيت SSL
- ✅ نسخ المشروع
- ✅ بدء الخدمات

**النتيجة:** كل شيء مثبت وجاهز ✅

---

### **الخطوة 5: اختبار الموقع (3 دقائق)**

```bash
# اختبر من الخادم
curl http://localhost:3000/health

# يجب أن تظهر:
# {"status":"ok","gateway":"leader-academy-gateway-v2",...}

# اختبر من المتصفح
http://YOUR_DROPLET_IP:3000/health
```

**النتيجة:** الموقع يعمل بنجاح ✅

---

## 📋 **قائمة التحقق السريعة:**

- [ ] تم إنشاء حساب DigitalOcean
- [ ] تم إضافة بطاقة ائتمان
- [ ] تم إنشاء Droplet
- [ ] تم الاتصال بـ SSH
- [ ] تم تشغيل السكريبت
- [ ] تم اختبار الموقع
- [ ] تم تكوين النطاق (اختياري)
- [ ] تم إضافة SSL (اختياري)

---

## 🎯 **الخطوات الإضافية (اختيارية):**

### **إضافة نطاق مخصص:**

```
1. اشترِ نطاق (مثلاً: leader-academy.school)
2. اذهب إلى DigitalOcean → Networking → Domains
3. أضف النطاق
4. حدّث DNS عند المزود
5. انتظر 24 ساعة
```

### **إضافة SSL (HTTPS):**

```bash
# على الخادم:
certbot certonly --nginx -d leader-academy.school

# ثم كوّن Nginx
nano /etc/nginx/sites-available/leader-academy

# أعد تشغيل Nginx
systemctl restart nginx
```

---

## 🔧 **أوامر مهمة:**

```bash
# عرض حالة الخدمات
pm2 status

# عرض السجلات
pm2 logs

# إعادة تشغيل الخدمات
pm2 restart all

# إيقاف الخدمات
pm2 stop all

# بدء الخدمات
pm2 start all
```

---

## 💰 **التكاليف:**

- **Droplet ($5/شهر):** $5
- **النطاق (اختياري):** $10-15/سنة
- **SSL (مجاني):** $0

**الإجمالي:** $5/شهر

---

## ✅ **النتيجة النهائية:**

بعد 30 دقيقة، ستملك:

✅ موقع يعمل على الإنتاج  
✅ API Gateway محسّن  
✅ 10 Microservices  
✅ Database SQLite  
✅ Dashboard كامل  
✅ جاهز للتسويق  

---

## 🆘 **حل المشاكل الشائعة:**

### **المشكلة: لا يمكن الاتصال بـ SSH**

```bash
# تحقق من عنوان IP
# تأكد من تفعيل Firewall

# أو استخدم Console من DigitalOcean
# اذهب إلى Droplet → Access → Launch Console
```

### **المشكلة: السكريبت فشل**

```bash
# شغّل الخطوات يدوياً
apt-get update
apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pm2
```

### **المشكلة: الخدمات لا تعمل**

```bash
# تحقق من السجلات
pm2 logs

# تحقق من المنافذ
lsof -i :3000

# أعد تشغيل الخدمات
pm2 restart all
```

---

## 📞 **الدعم:**

- **DigitalOcean Support:** https://www.digitalocean.com/support
- **Email:** support@leaderacademy.school
- **Documentation:** `/home/ubuntu/leader-academy-manus/DIGITALOCEAN_DEPLOYMENT.md`

---

## 🎉 **تم!**

**المشروع الآن على الإنتاج!** 🚀

استمتع بـ منصتك الجديدة! 🎊

---

**آخر تحديث:** 12 أبريل 2026  
**الإصدار:** 1.0.0  
**الفريق:** Leader Academy Development Team
