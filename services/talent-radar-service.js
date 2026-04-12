/**
 * Talent Radar Service (3005)
 * Implements talent discovery, skill matching, and recommendations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3005;
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
  res.json({ status: 'ok', service: 'talent-radar', port: PORT });
});

// Get talent profiles
app.get('/api/talent/profiles', (req, res) => {
  db.all(
    'SELECT user_id, name, email, bio, school_name, total_points, total_badges FROM users WHERE role IN ("teacher", "user") ORDER BY total_points DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get talent by skill
app.get('/api/talent/search/skill/:skill', (req, res) => {
  // Mock skill-based search
  const talents = [
    { id: 1, name: 'أحمد محمد', skill: req.params.skill, level: 'Advanced', points: 1500 },
    { id: 2, name: 'فاطمة علي', skill: req.params.skill, level: 'Intermediate', points: 1200 },
    { id: 3, name: 'محمود سالم', skill: req.params.skill, level: 'Beginner', points: 800 }
  ];
  
  res.json({ success: true, data: talents });
});

// Get talent recommendations
app.get('/api/talent/recommendations/:userId', (req, res) => {
  // Mock recommendations
  const recommendations = [
    { id: 1, recommended_user: 'user-002', reason: 'Similar skills', match_score: 0.85 },
    { id: 2, recommended_user: 'user-003', reason: 'Complementary expertise', match_score: 0.78 },
    { id: 3, recommended_user: 'user-004', reason: 'Same interests', match_score: 0.72 }
  ];
  
  res.json({ success: true, data: recommendations });
});

// Get skill matrix
app.get('/api/talent/skills/:userId', (req, res) => {
  const skills = [
    { skill: 'Teaching', level: 'Expert', endorsements: 45 },\n    { skill: 'Curriculum Design', level: 'Advanced', endorsements: 32 },\n    { skill: 'Technology', level: 'Intermediate', endorsements: 28 },\n    { skill: 'Leadership', level: 'Advanced', endorsements: 38 }\n  ];\n  \n  res.json({ success: true, data: skills });\n});\n\n// Get top talents\napp.get('/api/talent/top-talents', (req, res) => {\n  db.all(\n    'SELECT user_id, name, email, total_points, total_badges FROM users WHERE role IN ("teacher", "user") ORDER BY total_points DESC LIMIT 10',\n    (err, rows) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: rows });\n    }\n  );\n});\n\n// Get talent connections\napp.get('/api/talent/connections/:userId', (req, res) => {\n  const connections = [\n    { id: 1, connected_user: 'user-002', connection_type: 'Colleague', since: '2026-01-15' },\n    { id: 2, connected_user: 'user-003', connection_type: 'Mentor', since: '2026-02-20' },\n    { id: 3, connected_user: 'user-004', connection_type: 'Friend', since: '2026-03-10' }\n  ];\n  \n  res.json({ success: true, data: connections });\n});\n\n// Get endorsements\napp.get('/api/talent/endorsements/:userId', (req, res) => {\n  const endorsements = [\n    { skill: 'Teaching', count: 45, recent: ['user-002', 'user-003', 'user-004'] },\n    { skill: 'Leadership', count: 38, recent: ['user-005', 'user-006'] },\n    { skill: 'Innovation', count: 32, recent: ['user-007'] }\n  ];\n  \n  res.json({ success: true, data: endorsements });\n});\n\n// Endorse skill\napp.post('/api/talent/endorse', (req, res) => {\n  const { endorser_id, talent_id, skill } = req.body;\n  \n  res.json({ success: true, message: 'Skill endorsed successfully' });\n});\n\n// Get talent analytics\napp.get('/api/talent/analytics/:userId', (req, res) => {\n  const analytics = {\n    profile_views: 234,\n    endorsements_received: 127,\n    recommendations_sent: 45,\n    connections: 52,\n    engagement_score: 0.85\n  };\n  \n  res.json({ success: true, data: analytics });\n});\n\n// Start server\napp.listen(PORT, () => {\n  console.log(`\\n✅ Talent Radar Service running on http://localhost:${PORT}`);\n  console.log(`🎯 Endpoints: /health, /api/talent/profiles, /api/talent/search, /api/talent/recommendations\\n`);\n});\n\nmodule.exports = app;
