/**
 * Leader Academy API Gateway v2
 * With SQLite Database Integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db-sqlite');

// ============================================
// INITIALIZATION
// ============================================

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    res.json({
      status: 'ok',
      services: {
        courses: { status: 'ok', port: 3001 },
        learning: { status: 'ok', port: 3002 },
        tools: { status: 'ok', port: 3003 },
        showcase: { status: 'ok', port: 3004 },
        talent: { status: 'ok', port: 3005 },
        jobs: { status: 'ok', port: 3006 },
        realtime: { status: 'ok', port: 3007 },
        marketplace: { status: 'ok', port: 3009 },
        gamification: { status: 'ok', port: 3010 },
        analytics: { status: 'ok', port: 3011 }
      },
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get services status' });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

app.post('/auth/token', async (req, res) => {
  try {
    const { userId, email, name, role } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check if user exists
    let user = await db.getUserByEmail(email);

    // Create user if doesn't exist
    if (!user) {
      await db.createUser({
        user_id: userId,
        email,
        name: name || email.split('@')[0],
        role: role || 'user',
        status: 'active',
        subscription_plan: 'free'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role: role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      expiresIn: 86400
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.post('/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ============================================
// USER ENDPOINTS
// ============================================

app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================
// COURSE ENDPOINTS
// ============================================

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const course = await db.getCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

app.get('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const course = await db.getCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await db.getLessonsByCourse(course.id);
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// ============================================
// ENROLLMENT ENDPOINTS
// ============================================

app.get('/api/enrollments/user/:userId', verifyToken, async (req, res) => {
  try {
    const enrollments = await db.getUserEnrollments(req.params.userId);
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

app.post('/api/enrollments', verifyToken, async (req, res) => {
  try {
    const { enrollment_id, user_id, course_id } = req.body;

    if (!enrollment_id || !user_id || !course_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.createEnrollment({
      enrollment_id,
      user_id,
      course_id,
      status: 'enrolled',
      progress_percentage: 0,
      started_at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Enrollment created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// ============================================
// POINTS ENDPOINTS
// ============================================

app.get('/api/points/user/:userId', verifyToken, async (req, res) => {
  try {
    const points = await db.getUserPoints(req.params.userId);
    const total = await db.getUserTotalPoints(req.params.userId);
    res.json({ success: true, data: points, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

app.post('/api/points', verifyToken, async (req, res) => {
  try {
    const { point_id, user_id, amount, reason, category } = req.body;

    if (!point_id || !user_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.awardPoints({
      point_id,
      user_id,
      amount,
      reason: reason || 'Manual award',
      category: category || 'other',
      reference_id: null
    });

    res.json({ success: true, message: 'Points awarded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// ============================================
// BADGE ENDPOINTS
// ============================================

app.get('/api/badges', async (req, res) => {
  try {
    const badges = await db.getAllBadges();
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

app.get('/api/badges/user/:userId', verifyToken, async (req, res) => {
  try {
    const badges = await db.getUserBadges(req.params.userId);
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// ============================================
// JOBS ENDPOINTS
// ============================================

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.getAllJobs();
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const job = await db.getJobById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.post('/api/jobs/apply', verifyToken, async (req, res) => {
  try {
    const { application_id, user_id, job_id, cover_letter } = req.body;

    if (!application_id || !user_id || !job_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.applyForJob({
      application_id,
      user_id,
      job_id,
      status: 'applied',
      cover_letter: cover_letter || ''
    });

    res.json({ success: true, message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ============================================
// STATISTICS ENDPOINTS
// ============================================

app.get('/api/statistics', async (req, res) => {
  try {
    const stats = {
      totalUsers: await db.getTotalUsers(),
      totalCourses: await db.getTotalCourses(),
      totalEnrollments: await db.getTotalEnrollments(),
      totalJobs: await db.getTotalJobs(),
      topCourses: await db.getTopCourses(5),
      topTeachers: await db.getTopTeachers(5)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

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
      console.log(`\n🚀 Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
