# 🚀 API Gateway Documentation

## Overview

The API Gateway is the central routing hub for all Leader Academy microservices. It provides:

- **Request Routing**: Routes requests to appropriate microservices
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Protects services from abuse
- **Error Handling**: Centralized error handling and logging
- **CORS Support**: Cross-origin resource sharing
- **Health Monitoring**: Monitors all microservices health

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (3000)                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Authentication Layer                                 │ │
│  │  - JWT Token Generation                               │ │
│  │  - Token Verification                                 │ │
│  │  - Authorization Checks                               │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Routing Layer                                        │ │
│  │  - Request Routing                                    │ │
│  │  - Rate Limiting                                      │ │
│  │  - CORS Handling                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Proxy Layer                                          │ │
│  │  - Forward Requests                                   │ │
│  │  - Transform Responses                                │ │
│  │  - Error Handling                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Microservices (11 Services)                    │
│  Courses (3001) | Learning (3002) | Tools (3003) | ...    │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- Node.js 18.0.0+
- npm 9.0.0+

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
nano .env

# Start the gateway
npm start

# Or for development with auto-reload
npm run dev
```

---

## Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
GATEWAY_PORT=3000

# JWT
JWT_SECRET=your-secret-key-min-32-chars-long

# CORS
CORS_ORIGIN=*

# Microservices
COURSES_URL=http://localhost:3001
LEARNING_SUPPORT_URL=http://localhost:3002
# ... (see .env for all services)
```

### Microservices Configuration

The gateway automatically discovers and routes to these services:

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Courses | 3001 | `/api/courses` | Training management |
| Learning Support | 3002 | `/api/learning` | Pedagogical tools |
| Teacher Tools | 3003 | `/api/tools` | AI utilities |
| Showcase | 3004 | `/api/showcase` | Portfolio display |
| Talent Radar | 3005 | `/api/talent` | Talent discovery |
| Jobs | 3006 | `/api/jobs` | Career opportunities |
| Realtime | 3007 | `/api/realtime` | Collaboration |
| Marketplace | 3009 | `/api/marketplace` | Resource trading |
| Gamification | 3010 | `/api/gamification` | Points & badges |
| Analytics | 3011 | `/api/analytics` | Reports & insights |

---

## API Endpoints

### Health & Status

#### Gateway Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "gateway": "leader-academy-gateway",
  "timestamp": "2026-04-12T13:37:00.000Z",
  "uptime": 1234.56
}
```

#### Services Health
```http
GET /health/services
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-12T13:37:00.000Z",
  "services": {
    "courses": {
      "name": "Courses Service",
      "status": "online",
      "port": 3001
    },
    "learning": {
      "name": "Learning Support Service",
      "status": "online",
      "port": 3002
    }
  }
}
```

---

### Authentication

#### Generate Token
```http
POST /auth/token
Content-Type: application/json

{
  "userId": "user-123",
  "email": "user@leaderacademy.school",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

#### Verify Token
```http
POST /auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "userId": "user-123",
    "email": "user@leaderacademy.school",
    "role": "user",
    "iat": 1681234567,
    "exp": 1681320967
  }
}
```

---

### Courses Service

#### List Courses
```http
GET /api/courses
Authorization: Bearer {token}
```

#### Get Course Details
```http
GET /api/courses/:id
Authorization: Bearer {token}
```

#### Create Course (Admin)
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Course Name",
  "description": "Course description",
  "level": "beginner"
}
```

#### Update Course (Admin)
```http
PUT /api/courses/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Course (Admin)
```http
DELETE /api/courses/:id
Authorization: Bearer {token}
```

---

### Learning Support Service

#### Generate Lesson Plan
```http
POST /api/learning/lessons/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "English",
  "level": "Grade 5",
  "topic": "Present Perfect Tense",
  "objectives": "Students will understand and use present perfect"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonPlan": "...",
    "duration": "45 minutes",
    "materials": [...]
  }
}
```

#### Generate Assessment
```http
POST /api/learning/assessments/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "English",
  "level": "Grade 5",
  "topic": "Present Perfect Tense",
  "type": "quiz"
}
```

---

### Teacher Tools Service

#### Generate Image
```http
POST /api/tools/images/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "A classroom with students learning English",
  "style": "watercolor"
}
```

#### Generate Video
```http
POST /api/tools/videos/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "Explain the present perfect tense",
  "duration": 60
}
```

#### Generate Speech
```http
POST /api/tools/speech/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Hello students, today we will learn...",
  "language": "en",
  "voice": "female"
}
```

---

### Gamification Service

#### Get User Points
```http
GET /api/gamification/points
Authorization: Bearer {token}
```

#### Get User Badges
```http
GET /api/gamification/badges
Authorization: Bearer {token}
```

#### Award Points
```http
POST /api/gamification/points/award
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-123",
  "points": 50,
  "reason": "Completed lesson"
}
```

---

### Analytics Service

#### Get Reports
```http
GET /api/analytics/reports
Authorization: Bearer {token}
```

#### Get Metrics
```http
GET /api/analytics/metrics
Authorization: Bearer {token}
```

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "userId": "user-123",
  "email": "user@leaderacademy.school",
  "role": "user",
  "iat": 1681234567,
  "exp": 1681320967
}
```

### Roles

- **user**: Regular user access
- **admin**: Administrative access
- **teacher**: Teacher-specific features
- **inspector**: Inspector/supervisor access

### Protected vs Public Endpoints

**Protected Endpoints** (require token):
- POST /api/courses
- POST /api/learning/lessons/generate
- POST /api/tools/images/generate
- POST /api/gamification/points/award
- GET /api/analytics/reports

**Public Endpoints** (optional token):
- GET /api/courses
- GET /api/jobs
- GET /api/showcase/portfolios

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message",
  "timestamp": "2026-04-12T13:37:00.000Z"
}
```

### Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Microservice unavailable |

---

## Rate Limiting

The gateway implements rate limiting to protect services:

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Header**: `X-RateLimit-Remaining`

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## CORS Configuration

### Allowed Origins
By default, all origins are allowed. Configure in `.env`:

```env
CORS_ORIGIN=http://localhost:3000,https://leaderacademy.school
```

### Allowed Methods
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS

### Allowed Headers
- Content-Type
- Authorization

---

## Monitoring & Logging

### Log Levels
- **error**: Error messages
- **warn**: Warning messages
- **info**: Information messages
- **debug**: Debug messages

### Access Logs
All requests are logged using Morgan:

```
::1 - - [12/Apr/2026:13:37:00 +0000] "GET /health HTTP/1.1" 200 123 "-" "curl/7.68.0"
```

### Error Logs
Errors are logged with full stack traces for debugging.

---

## Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Test Categories
- Health checks
- Authentication
- Authorization
- Routing
- Error handling
- Rate limiting
- CORS
- Security
- Integration tests

---

## Deployment

### Docker

```bash
# Build image
docker build -t leader-academy-gateway:latest .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e COURSES_URL=http://courses:3001 \
  leader-academy-gateway:latest
```

### Docker Compose

```bash
docker-compose up -d gateway
```

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure CORS_ORIGIN properly
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Enable logging
- [ ] Configure error tracking (Sentry)
- [ ] Set up backups
- [ ] Configure auto-scaling

---

## Troubleshooting

### Gateway won't start
```bash
# Check if port is in use
lsof -i :3000

# Kill process on port
kill -9 <PID>
```

### Service connection errors
```bash
# Check service health
curl http://localhost:3001/health

# Check gateway logs
tail -f logs/gateway.log
```

### Authentication issues
```bash
# Verify token
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token"}'
```

### Rate limiting issues
```bash
# Check rate limit headers
curl -i http://localhost:3000/health | grep X-RateLimit
```

---

## Performance Optimization

### Caching
- Implement Redis caching for frequently accessed data
- Cache service health checks
- Cache authentication tokens

### Connection Pooling
- Use connection pools for database connections
- Reuse HTTP connections to microservices

### Load Balancing
- Deploy multiple gateway instances
- Use load balancer (nginx, HAProxy)
- Implement sticky sessions if needed

---

## Security Best Practices

1. **Use strong JWT secret** (min 32 characters)
2. **Enable HTTPS** in production
3. **Validate all inputs** before forwarding
4. **Implement rate limiting** to prevent abuse
5. **Use security headers** (Helmet.js)
6. **Log all requests** for audit trail
7. **Monitor for suspicious activity**
8. **Keep dependencies updated**
9. **Use environment variables** for secrets
10. **Implement API key rotation**

---

## Support & Documentation

- **API Docs**: https://leaderacademy.school/docs
- **GitHub**: https://github.com/leader-academy/gateway
- **Issues**: https://github.com/leader-academy/gateway/issues
- **Email**: support@leaderacademy.school

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Maintained by:** Leader Academy Team
