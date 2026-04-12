/**
 * Jobs Service (3006)
 * Manages job postings, applications, and job matching
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3006;
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
  res.json({ status: 'ok', service: 'jobs', port: PORT });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  db.all(
    'SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get job by ID
app.get('/api/jobs/:jobId', (req, res) => {
  db.get('SELECT * FROM jobs WHERE job_id = ?', [req.params.jobId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, data: row });
  });
});

// Search jobs
app.get('/api/jobs/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  db.all(
    'SELECT * FROM jobs WHERE (title_ar LIKE ? OR title_en LIKE ? OR description_ar LIKE ?) AND status = "open"',
    [query, query, query],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get jobs by category
app.get('/api/jobs/category/:category', (req, res) => {
  db.all(
    'SELECT * FROM jobs WHERE category = ? AND status = "open"',
    [req.params.category],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Create job posting
app.post('/api/jobs', (req, res) => {
  const { job_id, title_ar, title_en, company, category, salary_range, location } = req.body;
  db.run(
    'INSERT INTO jobs (job_id, title_ar, title_en, company, category, salary_range, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, "open")',
    [job_id, title_ar, title_en, company, category, salary_range, location],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Job posted' });
    }
  );
});

// Apply for job
app.post('/api/jobs/apply', (req, res) => {
  const { application_id, user_id, job_id, cover_letter } = req.body;
  db.run(
    'INSERT INTO job_applications (application_id, user_id, job_id, cover_letter, status, applied_at) VALUES (?, ?, ?, ?, "pending", datetime("now"))',
    [application_id, user_id, job_id, cover_letter],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Application submitted' });
    }
  );
});

// Get user applications
app.get('/api/jobs/applications/user/:userId', (req, res) => {
  db.all(
    'SELECT * FROM job_applications WHERE user_id = ? ORDER BY applied_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Get job applications
app.get('/api/jobs/:jobId/applications', (req, res) => {
  db.all(
    'SELECT * FROM job_applications WHERE job_id = ? ORDER BY applied_at DESC',
    [req.params.jobId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, data: rows });
    }
  );
});

// Update application status
app.put('/api/jobs/applications/:applicationId', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE job_applications SET status = ? WHERE application_id = ?',
    [status, req.params.applicationId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Application updated' });
    }
  );
});

// Get recommended jobs
app.get('/api/jobs/recommendations/:userId', (req, res) => {
  const recommendations = [
    { job_id: 'job-001', title: 'Senior Teacher', match_score: 0.95 },
n    { job_id: 'job-002', title: 'Curriculum Developer', match_score: 0.88 },\n    { job_id: 'job-003', title: 'Training Specialist', match_score: 0.82 }\n  ];\n  \n  res.json({ success: true, data: recommendations });\n});\n\n// Get job statistics\napp.get('/api/jobs/stats', (req, res) => {\n  db.get(\n    'SELECT COUNT(*) as total_jobs, COUNT(CASE WHEN status = "open" THEN 1 END) as open_jobs FROM jobs',\n    (err, row) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: row });\n    }\n  );\n});\n\n// Start server\napp.listen(PORT, () => {\n  console.log(`\\n✅ Jobs Service running on http://localhost:${PORT}`);\n  console.log(`💼 Endpoints: /health, /api/jobs, /api/jobs/apply, /api/jobs/applications\\n`);\n});\n\nmodule.exports = app;
