/**
 * Database Connection Module
 * Handles MySQL database connections and queries
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// ============================================
// DATABASE CONFIGURATION
// ============================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'leader_academy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  charset: 'utf8mb4'
};

// ============================================
// CREATE CONNECTION POOL
// ============================================

let pool = null;

async function initializePool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database pool initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database pool:', error);
    throw error;
  }
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Execute a query and return results
 */
async function query(sql, values = []) {
  if (!pool) {
    await initializePool();
  }

  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return first row
 */
async function queryOne(sql, values = []) {
  const results = await query(sql, values);
  return results.length > 0 ? results[0] : null;
}

/**
 * Insert a record and return the inserted ID
 */
async function insert(table, data) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => '?').join(', ');

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  try {
    const results = await query(sql, values);
    return results.insertId;
  } catch (error) {
    console.error('Insert error:', error);
    throw error;
  }
}

/**
 * Update a record
 */
async function update(table, data, whereClause, whereValues = []) {
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), ...whereValues];

  const sql = `UPDATE ${table} SET ${updates} WHERE ${whereClause}`;

  try {
    const results = await query(sql, values);
    return results.affectedRows;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

/**
 * Delete a record
 */
async function deleteRecord(table, whereClause, whereValues = []) {
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

  try {
    const results = await query(sql, whereValues);
    return results.affectedRows;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// ============================================
// USER QUERIES
// ============================================

async function getUserById(userId) {
  return queryOne('SELECT * FROM users WHERE user_id = ?', [userId]);
}

async function getUserByEmail(email) {
  return queryOne('SELECT * FROM users WHERE email = ?', [email]);
}

async function getAllUsers() {
  return query('SELECT * FROM users ORDER BY created_at DESC');
}

async function createUser(userData) {
  return insert('users', userData);
}

async function updateUser(userId, userData) {
  return update('users', userData, 'user_id = ?', [userId]);
}

// ============================================
// COURSE QUERIES
// ============================================

async function getCourseById(courseId) {
  return queryOne('SELECT * FROM courses WHERE course_id = ?', [courseId]);
}

async function getAllCourses() {
  return query('SELECT * FROM courses WHERE status = "published" ORDER BY created_at DESC');
}

async function getCoursesByCategory(category) {
  return query('SELECT * FROM courses WHERE category = ? AND status = "published"', [category]);
}

async function getCoursesByLevel(level) {
  return query('SELECT * FROM courses WHERE level = ? AND status = "published"', [level]);
}

async function createCourse(courseData) {
  return insert('courses', courseData);
}

async function updateCourse(courseId, courseData) {
  return update('courses', courseData, 'course_id = ?', [courseId]);
}

// ============================================
// LESSON QUERIES
// ============================================

async function getLessonById(lessonId) {
  return queryOne('SELECT * FROM lessons WHERE lesson_id = ?', [lessonId]);
}

async function getLessonsByCourse(courseId) {
  return query('SELECT * FROM lessons WHERE course_id = ? AND status = "published" ORDER BY order_number', [courseId]);
}

async function createLesson(lessonData) {
  return insert('lessons', lessonData);
}

async function updateLesson(lessonId, lessonData) {
  return update('lessons', lessonData, 'lesson_id = ?', [lessonId]);
}

// ============================================
// ENROLLMENT QUERIES
// ============================================

async function getEnrollmentById(enrollmentId) {
  return queryOne('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);
}

async function getUserEnrollments(userId) {
  return query('SELECT e.*, c.title_ar, c.title_en FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?', [userId]);
}

async function getCourseEnrollments(courseId) {
  return query('SELECT * FROM enrollments WHERE course_id = ? ORDER BY created_at DESC', [courseId]);
}

async function createEnrollment(enrollmentData) {
  return insert('enrollments', enrollmentData);
}

async function updateEnrollment(enrollmentId, enrollmentData) {
  return update('enrollments', enrollmentData, 'enrollment_id = ?', [enrollmentId]);
}

// ============================================
// POINTS QUERIES
// ============================================

async function getUserPoints(userId) {
  return query('SELECT * FROM points WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

async function getUserTotalPoints(userId) {
  const result = await queryOne('SELECT SUM(amount) as total FROM points WHERE user_id = ?', [userId]);
  return result?.total || 0;
}

async function awardPoints(pointsData) {
  return insert('points', pointsData);
}

// ============================================
// BADGE QUERIES
// ============================================

async function getBadgeById(badgeId) {
  return queryOne('SELECT * FROM badges WHERE badge_id = ?', [badgeId]);
}

async function getAllBadges() {
  return query('SELECT * FROM badges WHERE status = "active"');
}

async function getUserBadges(userId) {
  return query(`
    SELECT b.* FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `, [userId]);
}

async function awardBadge(userId, badgeId) {
  return insert('user_badges', {
    user_badge_id: `ubadge-${Date.now()}`,
    user_id: userId,
    badge_id: badgeId,
    earned_at: new Date()
  });
}

// ============================================
// ASSESSMENT QUERIES
// ============================================

async function getAssessmentById(assessmentId) {
  return queryOne('SELECT * FROM assessments WHERE assessment_id = ?', [assessmentId]);
}

async function getAssessmentsByLesson(lessonId) {
  return query('SELECT * FROM assessments WHERE lesson_id = ? AND status = "published"', [lessonId]);
}

async function createAssessment(assessmentData) {
  return insert('assessments', assessmentData);
}

async function submitAssessmentResult(resultData) {
  return insert('assessment_results', resultData);
}

async function getUserAssessmentResults(userId) {
  return query(`
    SELECT ar.*, a.title_ar, a.title_en FROM assessment_results ar
    JOIN assessments a ON ar.assessment_id = a.id
    WHERE ar.user_id = ?
    ORDER BY ar.submitted_at DESC
  `, [userId]);
}

// ============================================
// JOB QUERIES
// ============================================

async function getJobById(jobId) {
  return queryOne('SELECT * FROM jobs WHERE job_id = ?', [jobId]);
}

async function getAllJobs() {
  return query('SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC');
}

async function getJobsByType(jobType) {
  return query('SELECT * FROM jobs WHERE job_type = ? AND status = "open"', [jobType]);
}

async function createJob(jobData) {
  return insert('jobs', jobData);
}

async function applyForJob(applicationData) {
  return insert('job_applications', applicationData);
}

async function getUserJobApplications(userId) {
  return query(`
    SELECT ja.*, j.title_ar, j.title_en FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.user_id = ?
    ORDER BY ja.applied_at DESC
  `, [userId]);
}

// ============================================
// PORTFOLIO QUERIES
// ============================================

async function getPortfolioById(portfolioId) {
  return queryOne('SELECT * FROM portfolios WHERE portfolio_id = ?', [portfolioId]);
}

async function getUserPortfolio(userId) {
  return queryOne('SELECT * FROM portfolios WHERE user_id = ? AND status = "published"', [userId]);
}

async function createPortfolio(portfolioData) {
  return insert('portfolios', portfolioData);
}

async function updatePortfolio(portfolioId, portfolioData) {
  return update('portfolios', portfolioData, 'portfolio_id = ?', [portfolioId]);
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

async function getUserNotifications(userId) {
  return query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
}

async function createNotification(notificationData) {
  return insert('notifications', notificationData);
}

async function markNotificationAsRead(notificationId) {
  return update('notifications', { is_read: true }, 'notification_id = ?', [notificationId]);
}

// ============================================
// ANALYTICS QUERIES
// ============================================

async function logAnalytics(analyticsData) {
  return insert('analytics', analyticsData);
}

async function getAnalyticsByUser(userId) {
  return query('SELECT * FROM analytics WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

async function getAnalyticsByEventType(eventType) {
  return query('SELECT * FROM analytics WHERE event_type = ? ORDER BY created_at DESC', [eventType]);
}

// ============================================
// STATISTICS QUERIES
// ============================================

async function getTotalUsers() {
  const result = await queryOne('SELECT COUNT(*) as count FROM users');
  return result?.count || 0;
}

async function getTotalCourses() {
  const result = await queryOne('SELECT COUNT(*) as count FROM courses WHERE status = "published"');
  return result?.count || 0;
}

async function getTotalEnrollments() {
  const result = await queryOne('SELECT COUNT(*) as count FROM enrollments');
  return result?.count || 0;
}

async function getTotalJobs() {
  const result = await queryOne('SELECT COUNT(*) as count FROM jobs WHERE status = "open"');
  return result?.count || 0;
}

async function getTopCourses(limit = 5) {
  return query('SELECT * FROM courses WHERE status = "published" ORDER BY total_students DESC LIMIT ?', [limit]);
}

async function getTopTeachers(limit = 5) {
  return query(`
    SELECT u.*, COUNT(c.id) as course_count
    FROM users u
    LEFT JOIN courses c ON u.id = c.instructor_id
    WHERE u.role IN ('teacher', 'admin')
    GROUP BY u.id
    ORDER BY course_count DESC
    LIMIT ?
  `, [limit]);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
  // Pool management
  initializePool,
  query,
  queryOne,
  insert,
  update,
  deleteRecord,

  // User queries
  getUserById,
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUser,

  // Course queries
  getCourseById,
  getAllCourses,
  getCoursesByCategory,
  getCoursesByLevel,
  createCourse,
  updateCourse,

  // Lesson queries
  getLessonById,
  getLessonsByCourse,
  createLesson,
  updateLesson,

  // Enrollment queries
  getEnrollmentById,
  getUserEnrollments,
  getCourseEnrollments,
  createEnrollment,
  updateEnrollment,

  // Points queries
  getUserPoints,
  getUserTotalPoints,
  awardPoints,

  // Badge queries
  getBadgeById,
  getAllBadges,
  getUserBadges,
  awardBadge,

  // Assessment queries
  getAssessmentById,
  getAssessmentsByLesson,
  createAssessment,
  submitAssessmentResult,
  getUserAssessmentResults,

  // Job queries
  getJobById,
  getAllJobs,
  getJobsByType,
  createJob,
  applyForJob,
  getUserJobApplications,

  // Portfolio queries
  getPortfolioById,
  getUserPortfolio,
  createPortfolio,
  updatePortfolio,

  // Notification queries
  getUserNotifications,
  createNotification,
  markNotificationAsRead,

  // Analytics queries
  logAnalytics,
  getAnalyticsByUser,
  getAnalyticsByEventType,

  // Statistics queries
  getTotalUsers,
  getTotalCourses,
  getTotalEnrollments,
  getTotalJobs,
  getTopCourses,
  getTopTeachers
};
