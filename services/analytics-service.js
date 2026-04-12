/**
 * Analytics Service (3011)
 * Provides user analytics, course analytics, and performance metrics
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3011;
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
  res.json({ status: 'ok', service: 'analytics', port: PORT });
});

// Get user analytics
app.get('/api/analytics/user/:userId', (req, res) => {
  const analytics = {
    user_id: req.params.userId,
    total_courses: 5,
    completed_courses: 3,
    in_progress_courses: 2,
    total_points: 1500,
    total_badges: 8,
    average_score: 85.5,
    learning_time_hours: 42,
    last_activity: '2026-04-12T10:30:00Z'\n  };\n  \n  res.json({ success: true, data: analytics });\n});\n\n// Get course analytics\napp.get('/api/analytics/course/:courseId', (req, res) => {\n  const analytics = {\n    course_id: req.params.courseId,\n    total_students: 150,\n    completed_students: 98,\n    completion_rate: 65.3,\n    average_score: 78.5,\n    average_time_hours: 12.5,\n    rating: 4.5,\n    total_reviews: 120\n  };\n  \n  res.json({ success: true, data: analytics });\n});\n\n// Get dashboard statistics\napp.get('/api/analytics/dashboard', (req, res) => {\n  db.get(\n    'SELECT COUNT(*) as total_users, (SELECT COUNT(*) FROM courses) as total_courses, (SELECT COUNT(*) FROM enrollments) as total_enrollments FROM users',\n    (err, row) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: row });\n    }\n  );\n});\n\n// Get user engagement\napp.get('/api/analytics/engagement/:userId', (req, res) => {\n  const engagement = {\n    daily_active: 5,\n    weekly_active: 6,\n    monthly_active: 25,\n    engagement_score: 0.78,\n    trend: 'increasing'\n  };\n  \n  res.json({ success: true, data: engagement });\n});\n\n// Get learning paths analytics\napp.get('/api/analytics/learning-paths', (req, res) => {\n  const paths = [\n    { path_id: 'path-001', name: 'Arabic Language', students: 120, completion_rate: 72 },\n    { path_id: 'path-002', name: 'English Language', students: 95, completion_rate: 68 },\n    { path_id: 'path-003', name: 'Technology Skills', students: 110, completion_rate: 75 }\n  ];\n  \n  res.json({ success: true, data: paths });\n});\n\n// Get performance trends\napp.get('/api/analytics/trends/:userId', (req, res) => {\n  const trends = {\n    user_id: req.params.userId,\n    points_trend: [100, 150, 200, 250, 300, 350, 400],\n    completion_trend: [10, 20, 30, 40, 50, 60, 70],\n    time_spent_trend: [2, 3, 4, 5, 6, 7, 8]\n  };\n  \n  res.json({ success: true, data: trends });\n});\n\n// Get top performers\napp.get('/api/analytics/top-performers', (req, res) => {\n  db.all(\n    'SELECT user_id, name, total_points, total_badges FROM users ORDER BY total_points DESC LIMIT 10',\n    (err, rows) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: rows });\n    }\n  );\n});\n\n// Get course completion rates\napp.get('/api/analytics/completion-rates', (req, res) => {\n  const rates = [\n    { course_id: 'course-001', name: 'Arabic 101', rate: 85 },\n    { course_id: 'course-002', name: 'English 101', rate: 78 },\n    { course_id: 'course-003', name: 'Tech Basics', rate: 92 }\n  ];\n  \n  res.json({ success: true, data: rates });\n});\n\n// Get assessment performance\napp.get('/api/analytics/assessments/:userId', (req, res) => {\n  const assessments = [\n    { assessment_id: 'assess-001', name: 'Quiz 1', score: 95, date: '2026-04-01' },\n    { assessment_id: 'assess-002', name: 'Quiz 2', score: 88, date: '2026-04-05' },\n    { assessment_id: 'assess-003', name: 'Final Exam', score: 92, date: '2026-04-10' }\n  ];\n  \n  res.json({ success: true, data: assessments });\n});\n\n// Generate report\napp.post('/api/analytics/reports/generate', (req, res) => {\n  const { user_id, report_type, date_range } = req.body;\n  \n  const report = {\n    report_id: `report-${Date.now()}`,\n    user_id,\n    type: report_type,\n    date_range,\n    generated_at: new Date().toISOString(),\n    url: `/reports/report-${Date.now()}.pdf`\n  };\n  \n  res.json({ success: true, data: report });\n});\n\n// Get time spent analytics\napp.get('/api/analytics/time-spent/:userId', (req, res) => {\n  const timeData = {\n    total_hours: 42.5,\n    by_course: [\n      { course_id: 'course-001', hours: 15 },\n      { course_id: 'course-002', hours: 12 },\n      { course_id: 'course-003', hours: 15.5 }\n    ],\n    by_day: {\n      monday: 6,\n      tuesday: 7,\n      wednesday: 5,\n      thursday: 8,\n      friday: 6,\n      saturday: 5,\n      sunday: 4.5\n    }\n  };\n  \n  res.json({ success: true, data: timeData });\n});\n\n// Start server\napp.listen(PORT, () => {\n  console.log(`\\n✅ Analytics Service running on http://localhost:${PORT}`);\n  console.log(`📊 Endpoints: /health, /api/analytics/user, /api/analytics/course, /api/analytics/dashboard\\n`);\n});\n\nmodule.exports = app;
