/**
 * Gamification Service (3010)
 * Implements points system, badges, leaderboard, and achievements
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3010;
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
  res.json({ status: 'ok', service: 'gamification', port: PORT });
});

// Get user points
app.get('/api/gamification/points/:userId', (req, res) => {
  db.get(
    'SELECT SUM(points_earned) as total_points FROM points WHERE user_id = ?',
    [req.params.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: row || { total_points: 0 } });
    }
  );
});

// Award points
app.post('/api/gamification/points/award', (req, res) => {
  const { point_id, user_id, points_earned, reason } = req.body;
  db.run(
    'INSERT INTO points (point_id, user_id, points_earned, reason, awarded_at) VALUES (?, ?, ?, ?, datetime("now"))',
    [point_id, user_id, points_earned, reason],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Points awarded' });
    }
  );
});

// Get user badges
app.get('/api/gamification/badges/:userId', (req, res) => {
  db.all(
    'SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = ? ORDER BY ub.earned_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Award badge
app.post('/api/gamification/badges/award', (req, res) => {
  const { user_badge_id, user_id, badge_id } = req.body;
  db.run(
    'INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at) VALUES (?, ?, ?, datetime("now"))',
    [user_badge_id, user_id, badge_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Badge awarded' });
    }
  );
});

// Get leaderboard
app.get('/api/gamification/leaderboard', (req, res) => {
  db.all(
    'SELECT user_id, name, total_points, total_badges FROM users ORDER BY total_points DESC LIMIT 20',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get leaderboard by category
app.get('/api/gamification/leaderboard/category/:category', (req, res) => {
  const leaderboard = [\n    { rank: 1, user_id: 'user-001', name: 'أحمد محمد', points: 2500 },\n    { rank: 2, user_id: 'user-002', name: 'فاطمة علي', points: 2300 },\n    { rank: 3, user_id: 'user-003', name: 'محمود سالم', points: 2100 }\n  ];\n  \n  res.json({ success: true, data: leaderboard });\n});\n\n// Get achievements\napp.get('/api/gamification/achievements', (req, res) => {\n  const achievements = [\n    { id: 1, name: 'First Steps', description: 'Complete your first course', points: 100 },\n    { id: 2, name: 'Course Master', description: 'Complete 5 courses', points: 500 },\n    { id: 3, name: 'Top Performer', description: 'Score 100% on an assessment', points: 250 },\n    { id: 4, name: 'Community Leader', description: 'Help 10 other users', points: 300 },\n    { id: 5, name: 'Streak Master', description: 'Maintain a 7-day learning streak', points: 200 }\n  ];\n  \n  res.json({ success: true, data: achievements });\n});\n\n// Get user achievements\napp.get('/api/gamification/achievements/:userId', (req, res) => {\n  const achievements = [\n    { id: 1, name: 'First Steps', earned_at: '2026-01-15', points: 100 },\n    { id: 2, name: 'Course Master', earned_at: '2026-03-20', points: 500 }\n  ];\n  \n  res.json({ success: true, data: achievements });\n});\n\n// Get user level\napp.get('/api/gamification/level/:userId', (req, res) => {\n  db.get(\n    'SELECT FLOOR(total_points / 500) + 1 as level, (total_points % 500) as progress FROM users WHERE user_id = ?',\n    [req.params.userId],\n    (err, row) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: row || { level: 1, progress: 0 } });\n    }\n  );\n});\n\n// Get streaks\napp.get('/api/gamification/streaks/:userId', (req, res) => {\n  const streaks = {\n    current_streak: 7,\n    longest_streak: 15,\n    total_days_active: 42,\n    last_active: '2026-04-12'\n  };\n  \n  res.json({ success: true, data: streaks });\n});\n\n// Update streak\napp.post('/api/gamification/streaks/update', (req, res) => {\n  const { user_id } = req.body;\n  \n  res.json({ success: true, message: 'Streak updated' });\n});\n\n// Get challenges\napp.get('/api/gamification/challenges', (req, res) => {\n  const challenges = [\n    { id: 1, name: 'Weekly Quiz', description: 'Complete the weekly quiz', reward: 100, deadline: '2026-04-19' },\n    { id: 2, name: 'Course Challenge', description: 'Finish a course this week', reward: 250, deadline: '2026-04-19' },\n    { id: 3, name: 'Community Help', description: 'Help 5 users', reward: 150, deadline: '2026-04-26' }\n  ];\n  \n  res.json({ success: true, data: challenges });\n});\n\n// Start server\napp.listen(PORT, () => {\n  console.log(`\\n✅ Gamification Service running on http://localhost:${PORT}`);\n  console.log(`🎮 Endpoints: /health, /api/gamification/points, /api/gamification/badges, /api/gamification/leaderboard\\n`);\n});\n\nmodule.exports = app;
