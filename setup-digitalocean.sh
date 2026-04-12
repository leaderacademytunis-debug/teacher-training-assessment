#!/bin/bash

# ============================================
# Leader Academy - DigitalOcean Setup Script
# ============================================
# هذا السكريبت يقوم بإعداد الخادم تلقائياً
# Version: 1.0.0
# ============================================

set -e  # توقف عند أي خطأ

# الألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ============================================
# الخطوة 1: تحديث النظام
# ============================================
print_info "بدء إعداد الخادم..."
print_info "الخطوة 1: تحديث النظام"

apt-get update
apt-get upgrade -y
apt-get install -y curl wget git build-essential

print_success "تم تحديث النظام"

# ============================================
# الخطوة 2: تثبيت Node.js
# ============================================
print_info "الخطوة 2: تثبيت Node.js"

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

print_success "تم تثبيت Node.js $NODE_VERSION"
print_success "تم تثبيت npm $NPM_VERSION"

# ============================================
# الخطوة 3: تثبيت PM2
# ============================================
print_info "الخطوة 3: تثبيت PM2"

npm install -g pm2
pm2 startup
pm2 save

print_success "تم تثبيت PM2"

# ============================================
# الخطوة 4: تثبيت Nginx
# ============================================
print_info "الخطوة 4: تثبيت Nginx"

apt-get install -y nginx
systemctl start nginx
systemctl enable nginx

print_success "تم تثبيت Nginx"

# ============================================
# الخطوة 5: تثبيت SSL (Let's Encrypt)
# ============================================
print_info "الخطوة 5: تثبيت Certbot"

apt-get install -y certbot python3-certbot-nginx

print_success "تم تثبيت Certbot"

# ============================================
# الخطوة 6: تثبيت SQLite3
# ============================================
print_info "الخطوة 6: تثبيت SQLite3"

apt-get install -y sqlite3

print_success "تم تثبيت SQLite3"

# ============================================
# الخطوة 7: إعداد Firewall
# ============================================
print_info "الخطوة 7: تكوين Firewall"

ufw enable -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

print_success "تم تكوين Firewall"

# ============================================
# الخطوة 8: نسخ المشروع
# ============================================
print_info "الخطوة 8: نسخ المشروع"

cd /opt

# اطلب من المستخدم رابط المستودع
read -p "أدخل رابط مستودع GitHub (أو اضغط Enter للتخطي): " REPO_URL

if [ -n "$REPO_URL" ]; then
    git clone "$REPO_URL" leader-academy
    cd leader-academy
else
    print_warning "تم تخطي نسخ المشروع"
    mkdir -p leader-academy
    cd leader-academy
fi

print_success "تم نسخ المشروع"

# ============================================
# الخطوة 9: تثبيت المتطلبات
# ============================================
print_info "الخطوة 9: تثبيت المتطلبات"

npm install --production

print_success "تم تثبيت المتطلبات"

# ============================================
# الخطوة 10: إعداد قاعدة البيانات
# ============================================
print_info "الخطوة 10: إعداد قاعدة البيانات"

if [ -f "init-db.js" ]; then
    node init-db.js
    print_success "تم إعداد قاعدة البيانات"
else
    print_warning "لم يتم العثور على init-db.js"
fi

# ============================================
# الخطوة 11: إعداد متغيرات البيئة
# ============================================
print_info "الخطوة 11: إعداد متغيرات البيئة"

if [ ! -f ".env" ]; then
    # توليد JWT Secret قوي
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Gateway Configuration
GATEWAY_PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_PATH=./leader_academy.db

# Optional: Analytics
ANALYTICS_ENABLED=true
EOF
    
    print_success "تم إنشاء ملف .env"
    print_warning "تأكد من تحديث CORS_ORIGIN بـ نطاقك الفعلي"
else
    print_warning "ملف .env موجود بالفعل"
fi

# ============================================
# الخطوة 12: بدء الخدمات
# ============================================
print_info "الخطوة 12: بدء الخدمات"

# بدء API Gateway
pm2 start gateway-v2.js --name "gateway" --instances 2 2>/dev/null || print_warning "لم يتم العثور على gateway-v2.js"

# بدء الخدمات الأخرى
for service in services/*.js; do
    if [ -f "$service" ]; then
        SERVICE_NAME=$(basename "$service" .js)
        pm2 start "$service" --name "$SERVICE_NAME" 2>/dev/null || true
    fi
done

pm2 save

print_success "تم بدء الخدمات"

# ============================================
# الخطوة 13: اختبار الخدمات
# ============================================
print_info "الخطوة 13: اختبار الخدمات"

sleep 2

if curl -s http://localhost:3000/health > /dev/null; then
    print_success "API Gateway يعمل بنجاح"
else
    print_error "API Gateway لا يستجيب"
fi

# ============================================
# ملخص النتائج
# ============================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  تم إعداد الخادم بنجاح!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

print_info "معلومات الخادم:"
echo "  • Node.js: $(node --version)"
echo "  • npm: $(npm --version)"
echo "  • PM2: $(pm2 --version)"
echo "  • Nginx: $(nginx -v 2>&1)"
echo ""

print_info "الخطوات التالية:"
echo "  1. تحديث .env بـ نطاقك الفعلي"
echo "  2. الحصول على شهادة SSL: certbot certonly --nginx -d yourdomain.com"
echo "  3. تكوين Nginx: nano /etc/nginx/sites-available/leader-academy"
echo "  4. مراقبة الخدمات: pm2 status"
echo "  5. عرض السجلات: pm2 logs"
echo ""

print_success "الإعداد مكتمل!"
print_info "للمزيد من المعلومات، اقرأ: DIGITALOCEAN_DEPLOYMENT.md"
