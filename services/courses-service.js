/**
 * Courses Service (3001)
 * Manages all course-related operations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, '../leader_academy.db');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Database connection
let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✅ Courses Service connected to database');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'courses', port: PORT });
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    db.all('SELECT * FROM courses WHERE status = "published"', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
app.get('/api/courses/:courseId', (req, res) => {
  db.get('SELECT * FROM courses WHERE course_id = ?', [req.params.courseId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Course not found' });
    res.json({ success: true, data: row });
  });
});

// Search courses
app.get('/api/courses/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  db.all(
    'SELECT * FROM courses WHERE (title_ar LIKE ? OR title_en LIKE ? OR description_ar LIKE ?) AND status = "published"',
    [query, query, query],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get courses by category
app.get('/api/courses/category/:category', (req, res) => {
  db.all(
    'SELECT * FROM courses WHERE category = ? AND status = "published"',
    [req.params.category],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get courses by level
app.get('/api/courses/level/:level', (req, res) => {
  db.all(
    'SELECT * FROM courses WHERE level = ? AND status = "published"',
    [req.params.level],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Create course
app.post('/api/courses', (req, res) => {
  const { course_id, title_ar, title_en, category, level, duration_hours, instructor_id } = req.body;
  db.run(
    'INSERT INTO courses (course_id, title_ar, title_en, category, level, duration_hours, instructor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, "published")',
    [course_id, title_ar, title_en, category, level, duration_hours, instructor_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Course created' });
    }
  );
});

// Update course
app.put('/api/courses/:courseId', (req, res) => {
  const { title_ar, title_en, category, level } = req.body;
  db.run(
    'UPDATE courses SET title_ar = ?, title_en = ?, category = ?, level = ? WHERE course_id = ?',
    [title_ar, title_en, category, level, req.params.courseId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Course updated' });
    }
  );
});

// Delete course
app.delete('/api/courses/:courseId', (req, res) => {
  db.run('DELETE FROM courses WHERE course_id = ?', [req.params.courseId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Course deleted' });
  });
});

// Get course lessons
app.get('/api/courses/:courseId/lessons', (req, res) => {
  db.all('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_number', [req.params.courseId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: rows });
  });
});

// Get course statistics
app.get('/api/courses/:courseId/stats', (req, res) => {
  db.get(
    'SELECT COUNT(*) as total_students, AVG(average_rating) as avg_rating FROM courses WHERE course_id = ?',
    [req.params.courseId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: row });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Courses Service running on http://localhost:${PORT}`);
  console.log(`📚 Endpoints: /health, /api/courses, /api/courses/search/:query\n`);
});

module.exports = app;
