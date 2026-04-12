/**
 * Learning Support Service (3002)
 * Handles lesson generation, assessments, and progress tracking
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3002;
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
  res.json({ status: 'ok', service: 'learning-support', port: PORT });
});

// Get lessons by course
app.get('/api/lessons/course/:courseId', (req, res) => {
  db.all(
    'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_number',
    [req.params.courseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get lesson by ID
app.get('/api/lessons/:lessonId', (req, res) => {
  db.get('SELECT * FROM lessons WHERE lesson_id = ?', [req.params.lessonId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ success: true, data: row });
  });
});

// Create lesson
app.post('/api/lessons', (req, res) => {
  const { lesson_id, course_id, title_ar, title_en, content_ar, content_en, duration_minutes, order_number } = req.body;
  db.run(
    'INSERT INTO lessons (lesson_id, course_id, title_ar, title_en, content_ar, content_en, duration_minutes, order_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "published")',
    [lesson_id, course_id, title_ar, title_en, content_ar, content_en, duration_minutes, order_number],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Lesson created' });
    }
  );
});

// Get assessments by lesson
app.get('/api/assessments/lesson/:lessonId', (req, res) => {
  db.all(
    'SELECT * FROM assessments WHERE lesson_id = ? AND status = "published"',
    [req.params.lessonId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Create assessment
app.post('/api/assessments', (req, res) => {
  const { assessment_id, lesson_id, title_ar, title_en, description_ar, description_en, total_points } = req.body;
  db.run(
    'INSERT INTO assessments (assessment_id, lesson_id, title_ar, title_en, description_ar, description_en, total_points, status) VALUES (?, ?, ?, ?, ?, ?, ?, "published")',
    [assessment_id, lesson_id, title_ar, title_en, description_ar, description_en, total_points],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Assessment created' });
    }
  );
});

// Submit assessment result
app.post('/api/assessments/submit', (req, res) => {
  const { result_id, user_id, assessment_id, score } = req.body;
  db.run(
    'INSERT INTO assessment_results (result_id, user_id, assessment_id, score, status, submitted_at) VALUES (?, ?, ?, ?, "submitted", datetime("now"))',
    [result_id, user_id, assessment_id, score],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Assessment submitted' });
    }
  );
});

// Get user progress
app.get('/api/progress/user/:userId', (req, res) => {
  db.all(
    'SELECT * FROM lesson_progress WHERE user_id = ? ORDER BY completed_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Update lesson progress
app.post('/api/progress/update', (req, res) => {
  const { user_id, lesson_id, progress_percentage, completed } = req.body;
  db.run(
    'INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, progress_percentage, completed) VALUES (?, ?, ?, ?)',
    [user_id, lesson_id, progress_percentage, completed ? 1 : 0],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Progress updated' });
    }
  );
});

// Get quiz questions
app.get('/api/quizzes/:quizId/questions', (req, res) => {
  db.all(
    'SELECT * FROM assessments WHERE assessment_id = ?',
    [req.params.quizId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Learning Support Service running on http://localhost:${PORT}`);
  console.log(`📖 Endpoints: /health, /api/lessons, /api/assessments, /api/progress\n`);
});

module.exports = app;
