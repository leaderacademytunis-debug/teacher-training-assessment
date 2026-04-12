/**
 * Showcase Service (3004)
 * Displays portfolios, achievements, and student profiles
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3004;
const DB_PATH = path.join(__dirname, '../leader_academy.db');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Database connection
let db = new sqlite3.Database(DB_PATH);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'showcase', port: PORT });
});

// Get user portfolio
app.get('/api/portfolios/user/:userId', (req, res) => {
  db.get(
    'SELECT * FROM portfolios WHERE user_id = ? AND status = "published"',
    [req.params.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Portfolio not found' });
      res.json({ success: true, data: row });
    }
  );
});

// Get portfolio items
app.get('/api/portfolios/:portfolioId/items', (req, res) => {
  db.all(
    'SELECT * FROM portfolio_items WHERE portfolio_id = ?',
    [req.params.portfolioId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Create portfolio
app.post('/api/portfolios', (req, res) => {
  const { portfolio_id, user_id, title_ar, title_en, description_ar, description_en } = req.body;
  db.run(
    'INSERT INTO portfolios (portfolio_id, user_id, title_ar, title_en, description_ar, description_en, status) VALUES (?, ?, ?, ?, ?, ?, "published")',
    [portfolio_id, user_id, title_ar, title_en, description_ar, description_en],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Portfolio created' });
    }
  );
});

// Get user achievements
app.get('/api/achievements/user/:userId', (req, res) => {
  db.all(
    'SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = ? ORDER BY ub.earned_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get student profile
app.get('/api/profiles/user/:userId', (req, res) => {
  db.get(
    'SELECT user_id, name, email, bio, avatar_url, school_name, country, city, total_points, total_badges FROM users WHERE user_id = ?',
    [req.params.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Profile not found' });
      res.json({ success: true, data: row });
    }
  );
});

// Get top students
app.get('/api/showcase/top-students', (req, res) => {
  db.all(
    'SELECT user_id, name, email, total_points, total_badges FROM users WHERE role = "user" ORDER BY total_points DESC LIMIT 10',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get success stories
app.get('/api/showcase/success-stories', (req, res) => {
  const stories = [
    {
      id: 1,
      student_name: 'أحمد محمد',
      achievement: 'أكمل 5 دورات بنجاح',
      points: 1500,
      badge_count: 8
    },
    {
      id: 2,
      student_name: 'فاطمة علي',
      achievement: 'حقق المرتبة الأولى في الاختبار',
      points: 2000,
      badge_count: 12
    },
    {
      id: 3,
      student_name: 'محمود سالم',
      achievement: 'أكمل مشروع بحثي متقدم',
      points: 1800,
      badge_count: 10
    }
  ];
  
  res.json({ success: true, data: stories });
});

// Get featured portfolios
app.get('/api/showcase/featured-portfolios', (req, res) => {
  db.all(
    'SELECT * FROM portfolios WHERE status = "published" LIMIT 6',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get gallery
app.get('/api/showcase/gallery', (req, res) => {
  db.all(
    'SELECT * FROM portfolio_items LIMIT 12',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Showcase Service running on http://localhost:${PORT}`);
  console.log(`🎨 Endpoints: /health, /api/portfolios, /api/achievements, /api/showcase\n`);
});

module.exports = app;
