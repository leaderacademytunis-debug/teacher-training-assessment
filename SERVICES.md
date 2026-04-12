# 🚀 Leader Academy Microservices Architecture

## Overview

Leader Academy uses a microservices architecture with 10 independent services, each responsible for a specific domain. All services communicate through a central API Gateway.

---

## 📋 Services Summary

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **API Gateway** | 3000 | Central routing and authentication | ✅ |
| **Courses** | 3001 | Course management and enrollment | ✅ |
| **Learning Support** | 3002 | Lessons, assessments, progress tracking | ✅ |
| **Teacher Tools** | 3003 | Image generation, documents, lesson planning | ✅ |
| **Showcase** | 3004 | Portfolios, achievements, profiles | ✅ |
| **Talent Radar** | 3005 | Talent discovery, skill matching | ✅ |
| **Jobs** | 3006 | Job postings, applications | ✅ |
| **Realtime** | 3007 | WebSocket, notifications, chat | ✅ |
| **Marketplace** | 3009 | Products, shopping, orders | ✅ |
| **Gamification** | 3010 | Points, badges, leaderboard | ✅ |
| **Analytics** | 3011 | User analytics, reports | ✅ |

---

## 🔗 Service Details

### 1. API Gateway (3000)

**Purpose:** Central entry point for all client requests

**Key Features:**
- JWT authentication
- Request routing to microservices
- Rate limiting
- CORS handling
- Security headers
- Request logging

**Main Endpoints:**
- `GET /health` - Gateway health
- `GET /health/services` - All services status
- `POST /auth/token` - Generate JWT
- `POST /auth/verify` - Verify token

---

### 2. Courses Service (3001)

**Purpose:** Manage all course-related operations

**Key Features:**
- CRUD operations for courses
- Search and filtering
- Course categorization
- Lesson management
- Course statistics

**Main Endpoints:**
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/lessons` - Get course lessons

---

### 3. Learning Support Service (3002)

**Purpose:** Handle educational content and assessments

**Key Features:**
- Lesson creation and management
- Assessment creation
- Quiz system
- Progress tracking
- Result submission

**Main Endpoints:**
- `GET /api/lessons/course/:courseId` - Get course lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons` - Create lesson
- `GET /api/assessments/lesson/:lessonId` - Get assessments
- `POST /api/assessments` - Create assessment
- `POST /api/assessments/submit` - Submit result
- `GET /api/progress/user/:userId` - Get user progress

---

### 4. Teacher Tools Service (3003)

**Purpose:** Provide tools for teachers

**Key Features:**
- Lesson plan generation
- Image generation
- Document generation
- Quiz generation
- Rubric templates
- Class management tools

**Main Endpoints:**
- `POST /api/tools/lesson-plan/generate` - Generate lesson plan
- `POST /api/tools/images/generate` - Generate image
- `POST /api/tools/documents/generate` - Generate document
- `POST /api/tools/quizzes/generate` - Generate quiz
- `GET /api/tools/templates` - Get templates
- `GET /api/tools/rubrics` - Get rubric templates

---

### 5. Showcase Service (3004)

**Purpose:** Display student achievements and portfolios

**Key Features:**
- Portfolio management
- Achievement display
- Student profiles
- Success stories
- Top students leaderboard
- Gallery management

**Main Endpoints:**
- `GET /api/portfolios/user/:userId` - Get user portfolio
- `GET /api/portfolios/:id/items` - Get portfolio items
- `POST /api/portfolios` - Create portfolio
- `GET /api/achievements/user/:userId` - Get achievements
- `GET /api/profiles/user/:userId` - Get user profile
- `GET /api/showcase/top-students` - Get top students
- `GET /api/showcase/success-stories` - Get success stories

---

### 6. Talent Radar Service (3005)

**Purpose:** Discover and match talents

**Key Features:**
- Talent profile discovery
- Skill-based search
- Recommendation engine
- Endorsement system
- Connection management
- Talent analytics

**Main Endpoints:**
- `GET /api/talent/profiles` - Get all talent profiles
- `GET /api/talent/search/skill/:skill` - Search by skill
- `GET /api/talent/recommendations/:userId` - Get recommendations
- `GET /api/talent/skills/:userId` - Get user skills
- `GET /api/talent/top-talents` - Get top talents
- `GET /api/talent/endorsements/:userId` - Get endorsements

---

### 7. Jobs Service (3006)

**Purpose:** Manage job postings and applications

**Key Features:**
- Job posting management
- Application tracking
- Job search and filtering
- Job recommendations
- Application status management
- Job statistics

**Main Endpoints:**
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post job
- `GET /api/jobs/search/:query` - Search jobs
- `POST /api/jobs/apply` - Apply for job
- `GET /api/jobs/applications/user/:userId` - Get user applications
- `GET /api/jobs/:id/applications` - Get job applications

---

### 8. Realtime Service (3007)

**Purpose:** Handle real-time communication

**Key Features:**
- WebSocket connections
- Live notifications
- Chat system
- Real-time updates
- Broadcast messaging
- Connection management

**Main Endpoints:**
- `GET /health` - Service health
- `GET /api/notifications/user/:userId` - Get notifications
- `POST /api/notifications` - Send notification
- `PUT /api/notifications/:id` - Mark as read
- `GET /api/realtime/connections` - Get active connections
- `POST /api/realtime/broadcast` - Broadcast message

**WebSocket:**
- `ws://localhost:3007` - WebSocket connection

---

### 9. Marketplace Service (3009)

**Purpose:** Manage e-commerce functionality

**Key Features:**
- Product listing
- Shopping cart management
- Order processing
- Payment handling
- Category management
- Order tracking

**Main Endpoints:**
- `GET /api/marketplace/products` - List products
- `GET /api/marketplace/products/:id` - Get product details
- `GET /api/marketplace/search/:query` - Search products
- `GET /api/marketplace/cart/:userId` - Get cart
- `POST /api/marketplace/cart/add` - Add to cart
- `POST /api/marketplace/checkout` - Checkout
- `GET /api/marketplace/orders/:userId` - Get orders

---

### 10. Gamification Service (3010)

**Purpose:** Implement gamification features

**Key Features:**
- Points system
- Badge system
- Leaderboard
- Achievement tracking
- Streak management
- Challenges
- User levels

**Main Endpoints:**
- `GET /api/gamification/points/:userId` - Get user points
- `POST /api/gamification/points/award` - Award points
- `GET /api/gamification/badges/:userId` - Get user badges
- `POST /api/gamification/badges/award` - Award badge
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/achievements/:userId` - Get achievements
- `GET /api/gamification/level/:userId` - Get user level
- `GET /api/gamification/challenges` - Get challenges

---

### 11. Analytics Service (3011)

**Purpose:** Provide analytics and reporting

**Key Features:**
- User analytics
- Course analytics
- Performance metrics
- Engagement tracking
- Trend analysis
- Report generation
- Dashboard statistics

**Main Endpoints:**
- `GET /api/analytics/user/:userId` - Get user analytics
- `GET /api/analytics/course/:courseId` - Get course analytics
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/engagement/:userId` - Get engagement
- `GET /api/analytics/trends/:userId` - Get trends
- `GET /api/analytics/top-performers` - Get top performers
- `POST /api/analytics/reports/generate` - Generate report

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│              (Web, Mobile, Desktop)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (3000)                    │
│         (Authentication, Routing, Rate Limiting)        │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │Courses  │    │Learning  │    │Teacher   │
   │(3001)   │    │Support   │    │Tools     │
   │         │    │(3002)    │    │(3003)    │
   └─────────┘    └──────────┘    └──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │Showcase │    │Talent    │    │Jobs      │
   │(3004)   │    │Radar     │    │(3006)    │
   │         │    │(3005)    │    │          │
   └─────────┘    └──────────┘    └──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │Realtime │    │Marketplace
   │(3007)   │    │(3009)    │    │Gamification
   │         │    │          │    │(3010)    │
   └─────────┘    └──────────┘    └──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   SQLite DB      │
                │ (leader_academy) │
                └──────────────────┘
```

---

## 🚀 Running Services

### Option 1: Using Shell Scripts

```bash
# Start all services
chmod +x start-all-services.sh
./start-all-services.sh

# Stop all services
chmod +x stop-all-services.sh
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

### Option 3: Manual Start

```bash
# Terminal 1: Start API Gateway
node gateway-v2.js

# Terminal 2: Start Courses Service
node services/courses-service.js

# Terminal 3: Start Learning Support Service
node services/learning-support-service.js

# ... and so on for other services
```

---

## 🔐 Authentication Flow

1. **Client** sends credentials to `/auth/token`
2. **API Gateway** validates and generates JWT token
3. **Client** includes token in Authorization header
4. **API Gateway** verifies token and routes to service
5. **Service** processes request and returns response

---

## 📊 Database Schema

All services share the same SQLite database with 17 tables:

- users
- courses
- lessons
- enrollments
- lesson_progress
- points
- badges
- user_badges
- assessments
- assessment_results
- jobs
- job_applications
- portfolios
- portfolio_items
- notifications
- analytics

---

## 🧪 Testing Services

### Health Check
```bash
curl http://localhost:3000/health
```

### Get All Services Status
```bash
curl http://localhost:3000/health/services
```

### Get Courses
```bash
curl http://localhost:3000/api/courses
```

### Generate Token
```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## 📈 Performance Considerations

1. **Caching**: Implement Redis for frequently accessed data
2. **Load Balancing**: Use Nginx for distributing traffic
3. **Database Optimization**: Add indexes on frequently queried columns
4. **Async Processing**: Use message queues for long-running tasks
5. **Monitoring**: Implement APM for performance tracking

---

## 🔄 Service Communication

Services communicate through:
1. **Direct HTTP calls** via API Gateway
2. **WebSocket** for real-time updates (Realtime Service)
3. **Shared database** for data persistence

---

## 📝 Deployment Checklist

- [ ] All services tested locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan
- [ ] Documentation updated
- [ ] Team trained on deployment

---

## 🆘 Troubleshooting

### Service won't start
- Check port availability: `lsof -i :PORT`
- Check logs: `tail -f logs/service-name.log`
- Verify database connection

### High latency
- Check database queries
- Monitor CPU/Memory usage
- Check network connectivity

### Authentication failures
- Verify JWT token expiration
- Check secret key configuration
- Verify CORS settings

---

## 📞 Support

For issues or questions:
- Check service logs
- Review API documentation
- Contact development team

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
