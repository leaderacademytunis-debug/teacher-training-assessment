# 🚀 Leader Academy Platform - Deployment Guide

**Version:** 1.0.0  
**Date:** April 12, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements:
- **OS:** Linux/macOS/Windows (with WSL)
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **RAM:** 4GB minimum
- **Disk Space:** 2GB minimum
- **Ports Available:** 3000-3011, 8080

### Software Requirements:
```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+
```

---

## Installation

### Step 1: Clone or Download Project

```bash
cd /home/ubuntu/leader-academy-manus
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Initialize Database

```bash
node init-db.js
```

This will:
- Create SQLite database (leader_academy.db)
- Create 17 tables
- Load seed data (5 users, 3 courses, etc.)

### Step 4: Verify Installation

```bash
ls -la
# Should show:
# - leader_academy.db (324 KB)
# - node_modules/
# - services/
# - gateway-v2.js
# - etc.
```

---

## Configuration

### Environment Variables

Create or update `.env` file:

```env
# Gateway Configuration
GATEWAY_PORT=3000
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=*

# Database Configuration
DATABASE_URL=sqlite:./leader_academy.db

# Service Ports
COURSES_PORT=3001
LEARNING_PORT=3002
TOOLS_PORT=3003
SHOWCASE_PORT=3004
TALENT_PORT=3005
JOBS_PORT=3006
REALTIME_PORT=3007
MARKETPLACE_PORT=3009
GAMIFICATION_PORT=3010
ANALYTICS_PORT=3011
```

### Database Configuration

The database is automatically configured to use SQLite with:
- File: `leader_academy.db`
- Location: Project root directory
- Backup: Create regular backups of this file

---

## Running Services

### Option 1: Using Shell Scripts (Recommended)

```bash
# Make scripts executable
chmod +x start-all-services.sh stop-all-services.sh

# Start all services
./start-all-services.sh

# Stop all services
./stop-all-services.sh
```

### Option 2: Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Manual Start (Development)

**Terminal 1: Start API Gateway**
```bash
node gateway-v2.js
```

**Terminal 2-11: Start Microservices**
```bash
# Terminal 2
node services/courses-service.js

# Terminal 3
node services/learning-support-service.js

# Terminal 4
node services/teacher-tools-service.js

# Terminal 5
node services/showcase-service.js

# Terminal 6
node services/talent-radar-service.js

# Terminal 7
node services/jobs-service.js

# Terminal 8
node services/realtime-service.js

# Terminal 9
node services/marketplace-service.js

# Terminal 10
node services/gamification-service.js

# Terminal 11
node services/analytics-service.js
```

**Terminal 12: Start Dashboard**
```bash
python3 -m http.server 8080
```

---

## Testing

### Health Checks

```bash
# Check Gateway Health
curl http://localhost:3000/health

# Check All Services Status
curl http://localhost:3000/health/services

# Expected Response:
# {
#   "status": "ok",
#   "services": {
#     "courses": { "status": "ok", "port": 3001 },
#     ...
#   }
# }
```

### Authentication Test

```bash
# Generate JWT Token
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Expected Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { ... }
# }
```

### API Endpoints Test

```bash
# Get Courses
curl http://localhost:3000/api/courses

# Get Statistics
curl http://localhost:3000/api/statistics

# Get Services List
curl http://localhost:3000/api/services

# Get Leaderboard
curl http://localhost:3000/api/gamification/leaderboard
```

### Dashboard Test

```bash
# Open in browser
http://localhost:8080/index-v2.html

# Or via public URL
https://8080-inyb4q97c2cjov5mq5xjx-2ac21d7b.us2.manus.computer/index-v2.html
```

---

## Monitoring

### Log Files

All services write logs to `logs/` directory:

```bash
# View Gateway Logs
tail -f logs/gateway.log

# View Service Logs
tail -f logs/courses.log
tail -f logs/learning.log
tail -f logs/teacher.log
tail -f logs/showcase.log
tail -f logs/talent.log
tail -f logs/jobs.log
tail -f logs/realtime.log
tail -f logs/marketplace.log
tail -f logs/gamification.log
tail -f logs/analytics.log
```

### Performance Monitoring

```bash
# Check CPU and Memory Usage
top

# Check Port Usage
lsof -i :3000
lsof -i :3001
# ... etc

# Check Disk Usage
df -h
```

### Database Monitoring

```bash
# Check Database Size
ls -lh leader_academy.db

# Backup Database
cp leader_academy.db leader_academy.db.backup

# Check Database Integrity
sqlite3 leader_academy.db ".tables"
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use this command to kill all Node processes
pkill -f "node"
```

### Database Errors

```bash
# Reinitialize database
rm leader_academy.db
node init-db.js
```

### Service Connection Errors

1. Check if all services are running:
   ```bash
   curl http://localhost:3000/health/services
   ```

2. Check service logs for errors:
   ```bash
   tail logs/service-name.log
   ```

3. Verify network connectivity:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   # ... etc
   ```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node gateway-v2.js

# Or set in .env
export NODE_OPTIONS="--max-old-space-size=4096"
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All services tested locally
- [ ] Database backed up
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan
- [ ] Documentation updated
- [ ] Team trained

### Deployment Steps

#### 1. Server Setup

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Clone Project

```bash
cd /opt
sudo git clone <your-repo-url> leader-academy
cd leader-academy
```

#### 3. Install Dependencies

```bash
npm install --production
```

#### 4. Configure Environment

```bash
# Create .env file
sudo nano .env

# Add production configuration
GATEWAY_PORT=3000
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

#### 5. Initialize Database

```bash
node init-db.js
```

#### 6. Start Services with PM2

```bash
# Create ecosystem.config.js
pm2 init

# Configure PM2 to start all services
pm2 start gateway-v2.js --name "gateway"
pm2 start services/courses-service.js --name "courses"
pm2 start services/learning-support-service.js --name "learning"
# ... etc

# Save PM2 configuration
pm2 save

# Enable PM2 auto-start on reboot
pm2 startup
```

#### 7. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/leader-academy

# Add configuration:
upstream gateway {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://gateway;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/leader-academy /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Setup SSL Certificate

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### 9. Setup Monitoring

```bash
# Install monitoring tools
sudo apt-get install -y htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/leader-academy

# Add:
/opt/leader-academy/logs/*.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0640 www-data www-data
  sharedscripts
}
```

#### 10. Backup Strategy

```bash
# Create backup script
sudo nano /usr/local/bin/backup-leader-academy.sh

#!/bin/bash
BACKUP_DIR="/backups/leader-academy"
mkdir -p $BACKUP_DIR
cp /opt/leader-academy/leader_academy.db $BACKUP_DIR/leader_academy.db.$(date +%Y%m%d_%H%M%S)

# Schedule daily backup
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-leader-academy.sh
```

---

## Performance Optimization

### Database Optimization

```bash
# Add indexes for frequently queried columns
sqlite3 leader_academy.db << EOF
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
EOF
```

### Caching Strategy

```bash
# Install Redis (optional)
sudo apt-get install -y redis-server

# Update gateway-v2.js to use Redis caching
# (See advanced configuration)
```

### Load Balancing

```bash
# Setup multiple gateway instances
# Use Nginx upstream configuration
upstream gateway_cluster {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check service health
- Monitor disk usage

**Weekly:**
- Review performance metrics
- Check database size
- Verify backups

**Monthly:**
- Update dependencies
- Review security logs
- Performance optimization

### Update Procedure

```bash
# 1. Backup database
cp leader_academy.db leader_academy.db.backup

# 2. Pull latest code
git pull origin main

# 3. Install new dependencies
npm install

# 4. Run migrations (if any)
node migrate.js

# 5. Restart services
pm2 restart all
```

---

## Support & Documentation

### Documentation Files:
- `README.md` - Project overview
- `ARCHITECTURE.md` - System architecture
- `GATEWAY.md` - API Gateway documentation
- `SERVICES.md` - Services documentation
- `FINAL_REPORT.md` - Project report

### Getting Help:
1. Check logs: `tail -f logs/*.log`
2. Review documentation
3. Check service health: `curl http://localhost:3000/health/services`
4. Contact support team

---

## Conclusion

The Leader Academy platform is now ready for deployment. Follow this guide for smooth installation and operation.

**Status:** ✅ Production Ready

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Maintained By:** Leader Academy Development Team
