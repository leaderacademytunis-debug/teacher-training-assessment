# 🚀 دليل نشر المنصة على خادم الإنتاج

**الإصدار:** 1.0.0  
**التاريخ:** 12 أبريل 2026  
**الحالة:** جاهز للنشر

---

## 📋 **جدول المحتويات**

1. [متطلبات الخادم](#متطلبات-الخادم)
2. [اختيار مزود الخدمة](#اختيار-مزود-الخدمة)
3. [إعداد الخادم](#إعداد-الخادم)
4. [نشر المنصة](#نشر-المنصة)
5. [التكوين الأمني](#التكوين-الأمني)
6. [المراقبة والصيانة](#المراقبة-والصيانة)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🖥️ **متطلبات الخادم**

### **المتطلبات الأساسية:**

| المتطلب | الحد الأدنى | الموصى به |
|--------|-----------|---------|
| **CPU** | 2 Core | 4 Core |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 20 GB | 50 GB |
| **Bandwidth** | 100 Mbps | 1 Gbps |
| **OS** | Ubuntu 20.04 | Ubuntu 22.04 LTS |

### **البرامج المطلوبة:**

```bash
# Node.js v18+
# npm v9+
# Git
# PM2 (Process Manager)
# Nginx (Reverse Proxy)
# SSL Certificate (Let's Encrypt)
# Docker (اختياري)
```

---

## 🌐 **اختيار مزود الخدمة**

### **الخيارات الموصى بها:**

#### **1. AWS (Amazon Web Services)**
- **المميزات:** موثوقية عالية، قابلية توسع، دعم ممتاز
- **السعر:** $20-100/شهر
- **الخطوات:** EC2 → RDS → S3 → CloudFront

#### **2. DigitalOcean**
- **المميزات:** سهل الاستخدام، أسعار معقولة، دعم جيد
- **السعر:** $5-20/شهر
- **الخطوات:** Droplet → Database → Spaces

#### **3. Linode**
- **المميزات:** أداء عالي، أسعار منخفضة، دعم ممتاز
- **السعر:** $5-20/شهر
- **الخطوات:** Linode → NodeBalancer → Backups

#### **4. Heroku**
- **المميزات:** نشر سهل جداً، لا حاجة لإدارة الخادم
- **السعر:** $7-50/شهر
- **الخطوات:** `git push heroku main`

#### **5. Azure**
- **المميزات:** تكامل مع Microsoft، أداء عالي
- **السعر:** $20-100/شهر
- **الخطوات:** App Service → SQL Database

---

## ⚙️ **إعداد الخادم**

### **الخطوة 1: الاتصال بالخادم**

```bash
# استخدام SSH للاتصال
ssh root@your_server_ip

# أو إذا كان لديك مفتاح SSH
ssh -i /path/to/key.pem ubuntu@your_server_ip
```

### **الخطوة 2: تحديث النظام**

```bash
# تحديث قائمة الحزم
sudo apt-get update

# تحديث النظام
sudo apt-get upgrade -y

# تثبيت الأدوات الأساسية
sudo apt-get install -y curl wget git build-essential
```

### **الخطوة 3: تثبيت Node.js**

```bash
# إضافة مستودع NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# تثبيت Node.js
sudo apt-get install -y nodejs

# التحقق من الإصدار
node --version  # v18+
npm --version   # v9+
```

### **الخطوة 4: تثبيت PM2**

```bash
# تثبيت PM2 عالمياً
sudo npm install -g pm2

# تفعيل PM2 عند بدء النظام
pm2 startup

# حفظ عمليات PM2
pm2 save
```

### **الخطوة 5: تثبيت Nginx**

```bash
# تثبيت Nginx
sudo apt-get install -y nginx

# بدء Nginx
sudo systemctl start nginx

# تفعيل Nginx عند بدء النظام
sudo systemctl enable nginx

# التحقق من الحالة
sudo systemctl status nginx
```

### **الخطوة 6: تثبيت SSL Certificate**

```bash
# تثبيت Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# تجديد تلقائي
sudo systemctl enable certbot.timer
```

---

## 📦 **نشر المنصة**

### **الخطوة 1: نسخ المشروع**

```bash
# الانتقال إلى مجلد التطبيقات
cd /opt

# نسخ المشروع من Git
sudo git clone https://github.com/your-username/leader-academy.git

# أو نسخ من ملف ZIP
sudo unzip leader-academy.zip

# تغيير الملكية
sudo chown -R ubuntu:ubuntu leader-academy

# الانتقال للمشروع
cd leader-academy
```

### **الخطوة 2: تثبيت المتطلبات**

```bash
# تثبيت npm packages
npm install --production

# التحقق من التثبيت
npm list
```

### **الخطوة 3: إعداد قاعدة البيانات**

```bash
# تهيئة قاعدة البيانات
node init-db.js

# التحقق من قاعدة البيانات
ls -lh leader_academy.db
```

### **الخطوة 4: إعداد متغيرات البيئة**

```bash
# إنشاء ملف .env
nano .env

# أضف المتغيرات التالية:
GATEWAY_PORT=3000
JWT_SECRET=your-very-strong-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# حفظ الملف (Ctrl+O ثم Enter ثم Ctrl+X)
```

### **الخطوة 5: بدء الخدمات بـ PM2**

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

---

## 🔐 **التكوين الأمني**

### **الخطوة 1: تكوين Nginx**

```bash
# إنشاء ملف تكوين Nginx
sudo nano /etc/nginx/sites-available/leader-academy

# أضف التكوين التالي:
```

```nginx
upstream gateway {
    server localhost:3000;
    server localhost:3000;  # للتوازن
}

upstream dashboard {
    server localhost:8080;
}

# إعادة توجيه HTTP إلى HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API Gateway
    location /api/ {
        proxy_pass http://gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Dashboard
    location / {
        proxy_pass http://dashboard;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/leader-academy /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### **الخطوة 2: تكوين Firewall**

```bash
# تفعيل UFW Firewall
sudo ufw enable

# السماح بـ SSH
sudo ufw allow 22/tcp

# السماح بـ HTTP
sudo ufw allow 80/tcp

# السماح بـ HTTPS
sudo ufw allow 443/tcp

# عرض القواعس
sudo ufw status
```

### **الخطوة 3: تحديث JWT Secret**

```bash
# توليد secret قوي
openssl rand -base64 32

# تحديث .env
nano .env

# استبدل JWT_SECRET بالقيمة الجديدة
JWT_SECRET=your-new-strong-secret-here
```

### **الخطوة 4: تأمين قاعدة البيانات**

```bash
# نسخ احتياطي من قاعدة البيانات
cp leader_academy.db leader_academy.db.backup

# تحديد الأذونات
chmod 600 leader_academy.db

# تحديد الملكية
chown ubuntu:ubuntu leader_academy.db
```

---

## 📊 **المراقبة والصيانة**

### **الخطوة 1: مراقبة العمليات**

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

### **الخطوة 2: النسخ الاحتياطية**

```bash
# إنشاء سكريبت النسخ الاحتياطية
sudo nano /usr/local/bin/backup-leader-academy.sh

#!/bin/bash
BACKUP_DIR="/backups/leader-academy"
mkdir -p $BACKUP_DIR
cp /opt/leader-academy/leader_academy.db $BACKUP_DIR/leader_academy.db.$(date +%Y%m%d_%H%M%S)

# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/backup-leader-academy.sh

# جدولة النسخ الاحتياطية يومياً
sudo crontab -e

# أضف السطر التالي:
# 0 2 * * * /usr/local/bin/backup-leader-academy.sh
```

### **الخطوة 3: مراقبة الأداء**

```bash
# مراقبة استخدام الموارد
top

# مراقبة استخدام القرص
df -h

# مراقبة استخدام الذاكرة
free -h

# مراقبة استخدام الشبكة
nethogs

# مراقبة استخدام I/O
iotop
```

### **الخطوة 4: تحديث السجلات**

```bash
# إنشاء ملف logrotate
sudo nano /etc/logrotate.d/leader-academy

# أضف التكوين التالي:
/opt/leader-academy/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reload all > /dev/null 2>&1 || true
    endscript
}
```

---

## 🔧 **استكشاف الأخطاء**

### **المشكلة: الخادم لا يستجيب**

```bash
# التحقق من حالة الخدمات
pm2 status

# إعادة تشغيل الخدمات
pm2 restart all

# التحقق من السجلات
pm2 logs
```

### **المشكلة: استهلاك عالي للموارد**

```bash
# عرض العمليات الثقيلة
top

# قتل عملية معينة
kill -9 <PID>

# إعادة تشغيل الخدمة
pm2 restart <service-name>
```

### **المشكلة: قاعدة البيانات بطيئة**

```bash
# التحقق من حجم قاعدة البيانات
ls -lh leader_academy.db

# تحسين قاعدة البيانات
sqlite3 leader_academy.db "VACUUM;"

# إضافة indexes
sqlite3 leader_academy.db << EOF
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
EOF
```

### **المشكلة: أخطاء SSL**

```bash
# التحقق من شهادة SSL
sudo certbot certificates

# تجديد شهادة SSL يدوياً
sudo certbot renew --force-renewal

# اختبار تجديد تلقائي
sudo certbot renew --dry-run
```

---

## 📈 **التوسع المستقبلي**

### **إضافة Load Balancing**

```bash
# استخدام Nginx upstream
upstream gateway_cluster {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

### **إضافة Redis Caching**

```bash
# تثبيت Redis
sudo apt-get install -y redis-server

# بدء Redis
sudo systemctl start redis-server

# تفعيل Redis عند البدء
sudo systemctl enable redis-server
```

### **إضافة CDN**

```bash
# استخدام Cloudflare أو AWS CloudFront
# لتحسين سرعة التحميل والأداء
```

---

## ✅ **قائمة التحقق قبل الإطلاق**

- [ ] تم تحديث النظام
- [ ] تم تثبيت Node.js v18+
- [ ] تم تثبيت PM2
- [ ] تم تثبيت Nginx
- [ ] تم الحصول على SSL Certificate
- [ ] تم تكوين Firewall
- [ ] تم إعداد قاعدة البيانات
- [ ] تم تعيين JWT Secret قوي
- [ ] تم تشغيل جميع الخدمات
- [ ] تم اختبار الاتصال
- [ ] تم إعداد النسخ الاحتياطية
- [ ] تم اختبار الأداء
- [ ] تم اختبار الأمان

---

## 📞 **الدعم والمساعدة**

### **مصادر مفيدة:**

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

### **الاتصال بالدعم:**

- **البريد الإلكتروني:** support@leaderacademy.school
- **الموقع:** https://leaderacademy.school
- **الهاتف:** +216 XX XXX XXX

---

## 🎉 **الخلاصة**

تم توفير دليل شامل لنشر المنصة على خادم الإنتاج. اتبع الخطوات بعناية وتأكد من اختبار كل شيء قبل الإطلاق النهائي.

**الحالة:** ✅ **جاهز للنشر**

**آخر تحديث:** 12 أبريل 2026  
**الإصدار:** 1.0.0  
**الفريق:** Leader Academy Development Team
