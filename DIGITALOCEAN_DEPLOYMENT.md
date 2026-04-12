# 🚀 شرح تفصيلي لنشر المنصة على DigitalOcean

**الإصدار:** 1.0.0  
**التاريخ:** 12 أبريل 2026  
**المستوى:** مبتدئ إلى متوسط

---

## 📋 **جدول المحتويات**

1. [إنشاء حساب DigitalOcean](#إنشاء-حساب-digitalocean)
2. [إنشاء Droplet](#إنشاء-droplet)
3. [الاتصال بـ SSH](#الاتصال-بـ-ssh)
4. [إعداد الخادم](#إعداد-الخادم)
5. [نشر المشروع](#نشر-المشروع)
6. [تكوين النطاق](#تكوين-النطاق)
7. [إضافة SSL](#إضافة-ssl)
8. [المراقبة والصيانة](#المراقبة-والصيانة)

---

## 📝 **الخطوة 1: إنشاء حساب DigitalOcean**

### **الخطوة 1.1: الدخول للموقع**

1. اذهب إلى [DigitalOcean.com](https://www.digitalocean.com)
2. انقر على زر **"Sign Up"** في الزاوية العلوية اليمنى

### **الخطوة 1.2: إنشاء حساب**

```
1. أدخل بريدك الإلكتروني
2. أدخل كلمة مرور قوية
3. انقر على "Sign Up with Email"
4. تحقق من بريدك الإلكتروني
5. انقر على رابط التفعيل
```

### **الخطوة 1.3: إضافة بطاقة ائتمان**

```
1. اذهب إلى "Billing" → "Payment Methods"
2. انقر على "Add Credit Card"
3. أدخل بيانات البطاقة:
   - رقم البطاقة
   - تاريخ الانتهاء
   - CVV
   - اسم صاحب البطاقة
4. انقر على "Add Card"
```

### **الخطوة 1.4: تفعيل الحساب**

```
1. قد تطلب DigitalOcean التحقق من الهوية
2. أكمل عملية التحقق
3. انتظر تأكيد التفعيل (عادة دقائق)
```

---

## 🖥️ **الخطوة 2: إنشاء Droplet**

### **الخطوة 2.1: الذهاب إلى صفحة الإنشاء**

```
1. انقر على "Create" في الزاوية العلوية اليسرى
2. اختر "Droplets" من القائمة المنسدلة
```

### **الخطوة 2.2: اختيار نظام التشغيل**

```
1. اختر "Ubuntu" من القائمة
2. اختر "22.04 LTS x64" (أحدث إصدار مستقر)
```

**لماذا Ubuntu 22.04؟**
- نظام مستقر وموثوق
- دعم طويل الأجل (حتى 2027)
- متوافق مع Node.js
- سهل الإدارة

### **الخطوة 2.3: اختيار خطة التسعير**

```
اختر الخطة الأساسية:
┌─────────────────────────────────┐
│ Regular Performance             │
│ $5/month                        │
├─────────────────────────────────┤
│ • 1 GB RAM                      │
│ • 1 vCPU                        │
│ • 25 GB SSD                     │
│ • 1 TB Transfer                 │
└─────────────────────────────────┘
```

**ملاحظة:** هذه الخطة كافية للبدء. يمكنك الترقية لاحقاً.

### **الخطوة 2.4: اختيار المنطقة الجغرافية**

```
اختر منطقة قريبة من المستخدمين:
• Frankfurt (أوروبا) - الأفضل للعالم العربي
• Amsterdam (أوروبا)
• Singapore (آسيا)
• New York (أمريكا)
• Toronto (كندا)
```

**التوصية:** اختر **Frankfurt** لأنها الأقرب للشرق الأوسط

### **الخطوة 2.5: خيارات إضافية**

```
1. VPC Network: اختر "Default"
2. Backups: فعّل "Enable Backups" (اختياري - يضيف $1/شهر)
3. IPv6: فعّل (اختياري)
4. User Data: اترك فارغاً (سنستخدم سكريبت يدوي)
```

### **الخطوة 2.6: إضافة مفتاح SSH (اختياري لكن موصى به)**

```
1. انقر على "New SSH Key"
2. أعطِ اسماً للمفتاح: "leader-academy"
3. انسخ المفتاح العام من جهازك
4. أضفه في الحقل
5. انقر على "Add SSH Key"
```

**إذا لم تملك مفتاح SSH:**

```bash
# على جهازك المحلي (Windows/Mac/Linux)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/leader-academy

# اضغط Enter عند طلب كلمة المرور (اتركها فارغة)
# سيتم إنشاء مفتاحين:
# ~/.ssh/leader-academy (المفتاح الخاص - احفظه!)
# ~/.ssh/leader-academy.pub (المفتاح العام - أضفه في DigitalOcean)
```

### **الخطوة 2.7: تسمية الـ Droplet**

```
أدخل الاسم: "leader-academy-prod"
```

### **الخطوة 2.8: الإنشاء**

```
1. انقر على "Create Droplet"
2. انتظر 1-2 دقيقة حتى يتم الإنشاء
3. ستظهر رسالة "Droplet created successfully"
```

---

## 🔑 **الخطوة 3: الاتصال بـ SSH**

### **الخطوة 3.1: الحصول على عنوان IP**

```
1. اذهب إلى "Droplets" من القائمة الجانبية
2. انقر على اسم الـ Droplet "leader-academy-prod"
3. انسخ عنوان IP (مثلاً: 123.45.67.89)
```

### **الخطوة 3.2: الاتصال من جهازك**

**على Windows (استخدم PowerShell أو PuTTY):**

```powershell
# إذا استخدمت مفتاح SSH
ssh -i C:\Users\YourName\.ssh\leader-academy root@123.45.67.89

# إذا استخدمت كلمة مرور (ستُرسل إلى بريدك)
ssh root@123.45.67.89
```

**على Mac/Linux:**

```bash
# إذا استخدمت مفتاح SSH
ssh -i ~/.ssh/leader-academy root@123.45.67.89

# إذا استخدمت كلمة مرور
ssh root@123.45.67.89
```

### **الخطوة 3.3: التحقق من الاتصال**

```bash
# ستظهر رسالة مثل هذه:
# The authenticity of host '123.45.67.89' can't be established.
# Are you sure you want to continue connecting (yes/no)?

# اكتب: yes
# ثم اضغط Enter

# ستدخل الآن إلى الخادم
root@leader-academy-prod:~#
```

---

## ⚙️ **الخطوة 4: إعداد الخادم**

### **الخطوة 4.1: تحديث النظام**

```bash
# تحديث قائمة الحزم
apt-get update

# تحديث جميع الحزم
apt-get upgrade -y

# تثبيت الأدوات الأساسية
apt-get install -y curl wget git build-essential
```

**ماذا يفعل كل أمر؟**
- `apt-get update` - تحديث قائمة الحزم المتاحة
- `apt-get upgrade -y` - تحديث جميع الحزم المثبتة
- `apt-get install` - تثبيت حزم جديدة

### **الخطوة 4.2: تثبيت Node.js**

```bash
# إضافة مستودع NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# تثبيت Node.js
apt-get install -y nodejs

# التحقق من الإصدار
node --version   # يجب أن يظهر v18.x.x
npm --version    # يجب أن يظهر 9.x.x
```

### **الخطوة 4.3: تثبيت PM2**

```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# تفعيل PM2 عند بدء النظام
pm2 startup

# حفظ عمليات PM2
pm2 save
```

### **الخطوة 4.4: تثبيت Nginx**

```bash
# تثبيت Nginx
apt-get install -y nginx

# بدء Nginx
systemctl start nginx

# تفعيل Nginx عند بدء النظام
systemctl enable nginx

# التحقق من الحالة
systemctl status nginx
```

### **الخطوة 4.5: تثبيت SSL (Let's Encrypt)**

```bash
# تثبيت Certbot
apt-get install -y certbot python3-certbot-nginx

# سنستخدمه لاحقاً بعد تكوين النطاق
```

---

## 📦 **الخطوة 5: نشر المشروع**

### **الخطوة 5.1: نسخ المشروع**

```bash
# الانتقال إلى مجلد التطبيقات
cd /opt

# نسخ المشروع من GitHub (استبدل بـ رابط مستودعك)
git clone https://github.com/your-username/leader-academy.git

# أو إذا كان لديك ملف ZIP
# wget https://your-server.com/leader-academy.zip
# unzip leader-academy.zip

# الانتقال للمشروع
cd leader-academy

# التحقق من الملفات
ls -la
```

### **الخطوة 5.2: تثبيت المتطلبات**

```bash
# تثبيت npm packages
npm install --production

# التحقق من التثبيت
npm list | head -20
```

**ملاحظة:** استخدم `--production` لتثبيت الحزم الضرورية فقط (أسرع وأخف)

### **الخطوة 5.3: إعداد قاعدة البيانات**

```bash
# تهيئة قاعدة البيانات
node init-db.js

# التحقق من قاعدة البيانات
ls -lh leader_academy.db

# يجب أن تظهر: -rw-r--r-- 1 root root 324K Apr 12 19:00 leader_academy.db
```

### **الخطوة 5.4: إعداد متغيرات البيئة**

```bash
# إنشاء ملف .env
nano .env

# أضف المتغيرات التالية:
```

```env
# Gateway Configuration
GATEWAY_PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-very-strong-secret-key-here-change-this-now
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_PATH=./leader_academy.db

# Optional: Analytics
ANALYTICS_ENABLED=true
```

```bash
# لحفظ الملف:
# اضغط Ctrl+O ثم Enter ثم Ctrl+X
```

**كيفية توليد JWT Secret قوي:**

```bash
# استخدم هذا الأمر
openssl rand -base64 32

# سيظهر شيء مثل:
# aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=

# انسخ هذا واستخدمه في JWT_SECRET
```

### **الخطوة 5.5: بدء الخدمات**

```bash
# بدء API Gateway
pm2 start gateway-v2.js --name "gateway" --instances 2

# بدء الخدمات الأخرى
pm2 start services/courses-service.js --name "courses"
pm2 start services/learning-support-service.js --name "learning"
pm2 start services/teacher-tools-service.js --name "tools"
pm2 start services/showcase-service.js --name "showcase"
pm2 start services/talent-radar-service.js --name "talent"
pm2 start services/jobs-service.js --name "jobs"
pm2 start services/realtime-service.js --name "realtime"
pm2 start services/marketplace-service.js --name "marketplace"
pm2 start services/gamification-service.js --name "gamification"
pm2 start services/analytics-service.js --name "analytics"

# عرض حالة العمليات
pm2 status

# حفظ قائمة العمليات
pm2 save
```

### **الخطوة 5.6: اختبار الخدمات**

```bash
# اختبار API Gateway
curl http://localhost:3000/health

# يجب أن تظهر:
# {"status":"ok","gateway":"leader-academy-gateway-v2",...}

# اختبار من خارج الخادم
# استبدل 123.45.67.89 بـ IP الخادم الفعلي
curl http://123.45.67.89:3000/health
```

---

## 🌐 **الخطوة 6: تكوين النطاق**

### **الخطوة 6.1: شراء النطاق**

```
يمكنك شراء النطاق من:
• NameCheap
• GoDaddy
• Domain.com
• أو أي مزود نطاقات آخر

مثال: leader-academy.school
```

### **الخطوة 6.2: إضافة النطاق في DigitalOcean**

```
1. اذهب إلى "Networking" → "Domains"
2. انقر على "Add Domain"
3. أدخل النطاق: leader-academy.school
4. اختر الـ Droplet: leader-academy-prod
5. انقر على "Add Domain"
```

### **الخطوة 6.3: تحديث DNS عند المزود**

```
1. اذهب إلى موقع مزود النطاق
2. ابحث عن "DNS Settings" أو "Nameservers"
3. استبدل الـ Nameservers بـ:
   • ns1.digitalocean.com
   • ns2.digitalocean.com
   • ns3.digitalocean.com
4. احفظ التغييرات
5. انتظر 24-48 ساعة للتحديث الكامل
```

### **الخطوة 6.4: التحقق من النطاق**

```bash
# بعد 24 ساعة، اختبر:
nslookup leader-academy.school

# يجب أن يظهر عنوان IP الخادم
```

---

## 🔒 **الخطوة 7: إضافة SSL**

### **الخطوة 7.1: الحصول على شهادة SSL**

```bash
# الحصول على شهادة SSL من Let's Encrypt
certbot certonly --nginx -d leader-academy.school -d www.leader-academy.school

# اتبع التعليمات:
# 1. أدخل بريدك الإلكتروني
# 2. اقبل الشروط
# 3. اختر الخيار المناسب
```

### **الخطوة 7.2: تكوين Nginx**

```bash
# إنشاء ملف تكوين Nginx
nano /etc/nginx/sites-available/leader-academy
```

```nginx
# أضف هذا التكوين:

upstream gateway {
    server localhost:3000;
}

# إعادة توجيه HTTP إلى HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name leader-academy.school www.leader-academy.school;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name leader-academy.school www.leader-academy.school;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/leader-academy.school/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/leader-academy.school/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API Gateway
    location /api/ {
        proxy_pass http://gateway;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location / {
        root /opt/leader-academy;
        try_files $uri $uri/ =404;
    }
}
```

```bash
# لحفظ الملف: Ctrl+O ثم Enter ثم Ctrl+X
```

### **الخطوة 7.3: تفعيل الموقع**

```bash
# إنشاء رابط symlink
ln -s /etc/nginx/sites-available/leader-academy /etc/nginx/sites-enabled/

# اختبار التكوين
nginx -t

# يجب أن يظهر: "syntax is ok"

# إعادة تشغيل Nginx
systemctl restart nginx
```

### **الخطوة 7.4: اختبار HTTPS**

```bash
# اختبر الموقع
curl https://leader-academy.school

# أو افتح المتصفح وادخل:
# https://leader-academy.school
```

---

## 📊 **الخطوة 8: المراقبة والصيانة**

### **الخطوة 8.1: مراقبة العمليات**

```bash
# عرض حالة العمليات
pm2 status

# عرض السجلات
pm2 logs

# عرض سجلات خدمة معينة
pm2 logs gateway

# مراقبة الموارد
pm2 monit
```

### **الخطوة 8.2: النسخ الاحتياطية**

```bash
# إنشاء نسخة احتياطية من قاعدة البيانات
cp /opt/leader-academy/leader_academy.db /opt/leader-academy/leader_academy.db.backup

# أو استخدم DigitalOcean Backups
# اذهب إلى Droplet → Settings → Backups
```

### **الخطوة 8.3: مراقبة الأداء**

```bash
# عرض استخدام الموارد
top

# عرض استخدام القرص
df -h

# عرض استخدام الذاكرة
free -h

# عرض استخدام الشبكة
nethogs
```

### **الخطوة 8.4: تحديث التطبيق**

```bash
# الذهاب للمشروع
cd /opt/leader-academy

# سحب أحدث التحديثات
git pull origin main

# تثبيت المتطلبات الجديدة
npm install --production

# إعادة تشغيل الخدمات
pm2 restart all
```

---

## ✅ **قائمة التحقق النهائية**

- [ ] تم إنشاء حساب DigitalOcean
- [ ] تم إنشاء Droplet
- [ ] تم الاتصال بـ SSH
- [ ] تم تحديث النظام
- [ ] تم تثبيت Node.js
- [ ] تم تثبيت PM2
- [ ] تم تثبيت Nginx
- [ ] تم نسخ المشروع
- [ ] تم تثبيت المتطلبات
- [ ] تم إعداد قاعدة البيانات
- [ ] تم إعداد متغيرات البيئة
- [ ] تم بدء الخدمات
- [ ] تم تكوين النطاق
- [ ] تم إضافة SSL
- [ ] تم اختبار HTTPS
- [ ] تم إعداد المراقبة

---

## 🎉 **النتيجة النهائية**

بعد اتباع جميع الخطوات، ستملك:

✅ منصة تعليمية متكاملة على الإنتاج  
✅ نطاق خاص (leader-academy.school)  
✅ شهادة SSL آمنة  
✅ خدمات مراقبة  
✅ نسخ احتياطية  
✅ أداء عالي  

---

## 📞 **الدعم والمساعدة**

إذا واجهت مشاكل:

1. **تحقق من السجلات:**
   ```bash
   pm2 logs
   ```

2. **اختبر الاتصال:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **تحقق من Nginx:**
   ```bash
   nginx -t
   systemctl status nginx
   ```

4. **اتصل بالدعم:**
   - DigitalOcean Support
   - Email: support@leaderacademy.school

---

**الحالة:** ✅ **جاهز للإطلاق**

**آخر تحديث:** 12 أبريل 2026  
**الإصدار:** 1.0.0  
**الفريق:** Leader Academy Development Team
