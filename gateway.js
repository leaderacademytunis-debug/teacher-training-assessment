/**
 * Leader Academy - API Gateway
 * Central routing hub for all microservices
 * 
 * Features:
 * - Request routing to microservices
 * - JWT authentication
 * - Rate limiting
 * - Error handling
 * - CORS support
 * - Request logging
 */

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long';

// ============================================
// MICROSERVICES CONFIGURATION
// ============================================

const MICROSERVICES = {
  courses: {
    name: 'Courses Service',
    url: process.env.COURSES_URL || 'http://localhost:3001',
    port: 3001,
    description: 'Training management'
  },
  learning: {
    name: 'Learning Support Service',
    url: process.env.LEARNING_SUPPORT_URL || 'http://localhost:3002',
    port: 3002,
    description: 'Pedagogical tools'
  },
  tools: {
    name: 'Teacher Tools Service',
    url: process.env.TEACHER_TOOLS_URL || 'http://localhost:3003',
    port: 3003,
    description: 'AI utilities'
  },
  showcase: {
    name: 'Showcase Service',
    url: process.env.SHOWCASE_URL || 'http://localhost:3004',
    port: 3004,
    description: 'Portfolio display'
  },
  talent: {
    name: 'Talent Radar Service',
    url: process.env.TALENT_RADAR_URL || 'http://localhost:3005',
    port: 3005,
    description: 'Talent discovery'
  },
  jobs: {
    name: 'Jobs Service',
    url: process.env.JOBS_URL || 'http://localhost:3006',
    port: 3006,
    description: 'Career opportunities'
  },
  realtime: {
    name: 'Realtime Service',
    url: process.env.REALTIME_URL || 'http://localhost:3007',
    port: 3007,
    description: 'Collaboration'
  },
  marketplace: {
    name: 'Marketplace Service',
    url: process.env.MARKETPLACE_URL || 'http://localhost:3009',
    port: 3009,
    description: 'Resource trading'
  },
  gamification: {
    name: 'Gamification Service',
    url: process.env.GAMIFICATION_URL || 'http://localhost:3010',
    port: 3010,
    description: 'Points & badges'
  },
  analytics: {
    name: 'Analytics Service',
    url: process.env.ANALYTICS_URL || 'http://localhost:3011',
    port: 3011,
    description: 'Reports & insights'
  }
};

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
      message: 'Authorization token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message
    });
  }
};

/**
 * Optional token verification (doesn't fail if no token)
 */
const optionalToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      console.warn('Invalid token:', error.message);
    }
  }

  next();
};

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

/**
 * Gateway health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'leader-academy-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Check all microservices health
 */
app.get('/health/services', async (req, res) => {
  const services = {};

  for (const [key, service] of Object.entries(MICROSERVICES)) {
    try {
      const response = await axios.get(`${service.url}/health`, {
        timeout: 5000
      });
      services[key] = {
        name: service.name,
        status: 'online',
        port: service.port,
        response: response.data
      };
    } catch (error) {
      services[key] = {
        name: service.name,
        status: 'offline',
        port: service.port,
        error: error.message
      };
    }
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services
  });
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Generate JWT token (for testing)
 */
app.post('/auth/token', (req, res) => {
  const { userId, email, role } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'userId is required'
    });
  }

  const token = jwt.sign(
    {
      userId,
      email: email || `user${userId}@leaderacademy.school`,
      role: role || 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    JWT_SECRET
  );

  res.json({
    success: true,
    token,
    expiresIn: 86400 // 24 hours in seconds
  });
});

/**
 * Verify JWT token
 */
app.post('/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Missing token',
      message: 'Token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

// ============================================
// PROXY ENDPOINTS
// ============================================

/**
 * Generic proxy function
 */
const proxyRequest = async (req, res, serviceUrl, method = 'GET') => {
  try {
    const config = {
      method,
      url: `${serviceUrl}${req.path.replace(/^\/api\/[a-z]+/, '')}`,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      timeout: 30000
    };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      config.data = req.body;
    }

    if (req.query && Object.keys(req.query).length > 0) {
      config.params = req.query;
    }

    const response = await axios(config);

    res.status(response.status).json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      service: serviceUrl,
      timestamp: new Date().toISOString()
    });
  }
};

// ============================================
// COURSES SERVICE ROUTES
// ============================================

app.get('/api/courses', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.courses.url, 'GET');
});

app.get('/api/courses/:id', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.courses.url, 'GET');
});

app.post('/api/courses', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.courses.url, 'POST');
});

app.put('/api/courses/:id', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.courses.url, 'PUT');
});

app.delete('/api/courses/:id', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.courses.url, 'DELETE');
});

// ============================================
// LEARNING SUPPORT SERVICE ROUTES
// ============================================

app.post('/api/learning/lessons/generate', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.learning.url, 'POST');
});

app.post('/api/learning/assessments/generate', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.learning.url, 'POST');
});

app.get('/api/learning/lessons/:id', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.learning.url, 'GET');
});

// ============================================
// TEACHER TOOLS SERVICE ROUTES
// ============================================

app.post('/api/tools/images/generate', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.tools.url, 'POST');
});

app.post('/api/tools/videos/generate', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.tools.url, 'POST');
});

app.post('/api/tools/speech/generate', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.tools.url, 'POST');
});

// ============================================
// SHOWCASE SERVICE ROUTES
// ============================================

app.get('/api/showcase/portfolios', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.showcase.url, 'GET');
});

app.get('/api/showcase/portfolios/:id', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.showcase.url, 'GET');
});

app.post('/api/showcase/portfolios', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.showcase.url, 'POST');
});

// ============================================
// TALENT RADAR SERVICE ROUTES
// ============================================

app.get('/api/talent/directory', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.talent.url, 'GET');
});

app.get('/api/talent/profiles/:id', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.talent.url, 'GET');
});

// ============================================
// JOBS SERVICE ROUTES
// ============================================

app.get('/api/jobs', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.jobs.url, 'GET');
});

app.get('/api/jobs/:id', optionalToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.jobs.url, 'GET');
});

app.post('/api/jobs/apply', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.jobs.url, 'POST');
});

// ============================================
// GAMIFICATION SERVICE ROUTES
// ============================================

app.get('/api/gamification/points', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.gamification.url, 'GET');
});

app.get('/api/gamification/badges', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.gamification.url, 'GET');
});

app.post('/api/gamification/points/award', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.gamification.url, 'POST');
});

// ============================================
// ANALYTICS SERVICE ROUTES
// ============================================

app.get('/api/analytics/reports', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.analytics.url, 'GET');
});

app.get('/api/analytics/metrics', verifyToken, (req, res) => {
  proxyRequest(req, res, MICROSERVICES.analytics.url, 'GET');
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Leader Academy - API Gateway             ║
║   🚀 Server running on port ${PORT}          ║
╚════════════════════════════════════════════╝

📊 Microservices Configuration:
${Object.entries(MICROSERVICES).map(([key, service]) => 
  `  • ${service.name} (${key}) → ${service.url}`
).join('\n')}

🔗 Available Endpoints:
  • GET  /health                    - Gateway health
  • GET  /health/services           - All services health
  • POST /auth/token                - Generate JWT token
  • POST /auth/verify               - Verify JWT token
  • GET  /api/courses               - List courses
  • POST /api/learning/lessons/generate - Generate lesson
  • POST /api/tools/images/generate - Generate image
  • GET  /api/jobs                  - List jobs
  • GET  /api/analytics/metrics     - Get analytics

📖 Documentation: https://leaderacademy.school/docs
  `);
});

module.exports = app;
