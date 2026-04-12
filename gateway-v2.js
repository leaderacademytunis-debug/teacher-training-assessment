/**
 * Leader Academy API Gateway v2
 * With SQLite Database Integration & Service Proxy
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const db = require('./db-sqlite');

// ============================================
// INITIALIZATION
// ============================================

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Service Registry
const SERVICES = {
  courses: { port: 3001, name: 'Courses Service' },
  learning: { port: 3002, name: 'Learning Support Service' },
  tools: { port: 3003, name: 'Teacher Tools Service' },
  showcase: { port: 3004, name: 'Showcase Service' },
  talent: { port: 3005, name: 'Talent Radar Service' },
  jobs: { port: 3006, name: 'Jobs Service' },
  realtime: { port: 3007, name: 'Realtime Service' },
  marketplace: { port: 3009, name: 'Marketplace Service' },
  gamification: { port: 3010, name: 'Gamification Service' },
  analytics: { port: 3011, name: 'Analytics Service' }
};

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// ============================================
// HEALTH ENDPOINTS
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'leader-academy-gateway-v2',
    database: 'sqlite',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health/services', async (req, res) => {
  try {
    const stats = {
      users: await db.getTotalUsers(),
      courses: await db.getTotalCourses(),
      enrollments: await db.getTotalEnrollments(),
      jobs: await db.getTotalJobs()
    };

    const services = {};
    for (const [key, service] of Object.entries(SERVICES)) {
      try {
        const response = await axios.get(`http://localhost:${service.port}/health`, { timeout: 2000 });
        services[key] = { status: 'ok', port: service.port, name: service.name };
      } catch (error) {
        services[key] = { status: 'unavailable', port: service.port, name: service.name };
      }
    }

    res.json({
      status: 'ok',
      services,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

app.post('/auth/token', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // In production, verify against database
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// ============================================
// SERVICE PROXY ROUTES
// ============================================

// Courses Service Proxy
app.get('/api/courses', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.courses.port}/api/courses`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Courses service unavailable' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.courses.port}/api/courses/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Courses service unavailable' });
  }
});

// Learning Support Service Proxy
app.get('/api/lessons/:courseId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.learning.port}/api/lessons/course/${req.params.courseId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Learning service unavailable' });
  }
});

app.get('/api/assessments/:lessonId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.learning.port}/api/assessments/lesson/${req.params.lessonId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Learning service unavailable' });
  }
});

// Teacher Tools Service Proxy
app.post('/api/tools/lesson-plan/generate', async (req, res) => {
  try {
    const response = await axios.post(`http://localhost:${SERVICES.tools.port}/api/tools/lesson-plan/generate`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Teacher tools service unavailable' });
  }
});

// Showcase Service Proxy
app.get('/api/portfolios/:userId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.showcase.port}/api/portfolios/user/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Showcase service unavailable' });
  }
});

// Talent Radar Service Proxy
app.get('/api/talent/profiles', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.talent.port}/api/talent/profiles`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Talent radar service unavailable' });
  }
});

// Jobs Service Proxy
app.get('/api/jobs', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.jobs.port}/api/jobs`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Jobs service unavailable' });
  }
});

app.post('/api/jobs/apply', async (req, res) => {
  try {
    const response = await axios.post(`http://localhost:${SERVICES.jobs.port}/api/jobs/apply`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Jobs service unavailable' });
  }
});

// Marketplace Service Proxy
app.get('/api/marketplace/products', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.marketplace.port}/api/marketplace/products`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Marketplace service unavailable' });
  }
});

// Gamification Service Proxy
app.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.gamification.port}/api/gamification/leaderboard`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Gamification service unavailable' });
  }
});

app.get('/api/gamification/points/:userId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.gamification.port}/api/gamification/points/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Gamification service unavailable' });
  }
});

// Analytics Service Proxy
app.get('/api/analytics/user/:userId', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${SERVICES.analytics.port}/api/analytics/user/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Analytics service unavailable' });
  }
});

// ============================================
// DATABASE ENDPOINTS
// ============================================

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    const stats = {
      total_users: await db.getTotalUsers(),
      total_courses: await db.getTotalCourses(),
      total_enrollments: await db.getTotalEnrollments(),
      total_jobs: await db.getTotalJobs(),
      top_courses: await db.getTopCourses(),
      top_teachers: await db.getTopTeachers()
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/enrollments/user/:userId', async (req, res) => {
  try {
    const enrollments = await db.getUserEnrollments(req.params.userId);
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/points/user/:userId', async (req, res) => {
  try {
    const points = await db.getUserTotalPoints(req.params.userId);
    res.json({ success: true, data: points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/badges', async (req, res) => {
  try {
    const badges = await db.getAllBadges();
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SERVICE DISCOVERY ENDPOINT
// ============================================

app.get('/api/services', (req, res) => {
  const services = Object.entries(SERVICES).map(([key, service]) => ({
    id: key,
    name: service.name,
    port: service.port,
    url: `http://localhost:${service.port}`
  }));

  res.json({
    success: true,
    services,
    total: services.length
  });
});

// ============================================
// GENERIC PROXY ROUTE (Catch-all)
// ============================================

app.use('/api/courses', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.courses.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/learning', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.learning.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/tools', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.tools.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/showcase', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.showcase.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/talent', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.talent.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/jobs', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.jobs.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/realtime', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.realtime.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/marketplace', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.marketplace.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/gamification', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.gamification.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.use('/api/analytics', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:${SERVICES.analytics.port}${req.originalUrl}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    // Initialize database
    await db.initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n✅ API Gateway v2 running on http://localhost:${PORT}`);
      console.log(`📊 Database: SQLite (leader_academy.db)`);
      console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
      console.log(`🔗 Service Registry: ${Object.keys(SERVICES).length} services`);
      console.log(`\n📋 Available Services:`);
      Object.entries(SERVICES).forEach(([key, service]) => {
        console.log(`   • ${service.name} (${key}): http://localhost:${service.port}`);
      });
      console.log(`\n🚀 Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
