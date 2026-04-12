/**
 * SQLite Database Module
 * Handles SQLite database connections and queries
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'leader_academy.db');

// ============================================
// DATABASE CONNECTION
// ============================================

let db = null;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        reject(err);
      } else {
        console.log('✅ SQLite database connected:', DB_PATH);
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err);
            reject(err);
          } else {
            resolve(db);
          }
        });
      }
    });
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Execute a query and return all results
 */
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Execute a query and return first row
 */
function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err);
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Execute an insert/update/delete query
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database run error:', err);
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes
        });
      }
    });
  });
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
  return queryAll('SELECT * FROM users ORDER BY created_at DESC');
}

async function createUser(userData) {
  const { user_id, email, name, role, school_name, bio, phone, country, city, status, subscription_plan } = userData;
  return run(
    `INSERT INTO users (user_id, email, name, role, school_name, bio, phone, country, city, status, subscription_plan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, email, name, role, school_name, bio, phone, country, city, status, subscription_plan]
  );
}

async function updateUser(userId, userData) {
  const updates = Object.keys(userData).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(userData), userId];
  return run(`UPDATE users SET ${updates} WHERE user_id = ?`, values);
}

// ============================================
// COURSE QUERIES
// ============================================

async function getCourseById(courseId) {
  return queryOne('SELECT * FROM courses WHERE course_id = ?', [courseId]);
}

async function getAllCourses() {
  return queryAll('SELECT * FROM courses WHERE status = "published" ORDER BY created_at DESC');
}

async function getCoursesByCategory(category) {
  return queryAll('SELECT * FROM courses WHERE category = ? AND status = "published"', [category]);
}

async function getCoursesByLevel(level) {
  return queryAll('SELECT * FROM courses WHERE level = ? AND status = "published"', [level]);
}

async function createCourse(courseData) {
  const { course_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, category, level, duration_hours, price, instructor_id, status } = courseData;
  return run(
    `INSERT INTO courses (course_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, category, level, duration_hours, price, instructor_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [course_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, category, level, duration_hours, price, instructor_id, status]
  );
}

// ============================================
// LESSON QUERIES
// ============================================

async function getLessonById(lessonId) {
  return queryOne('SELECT * FROM lessons WHERE lesson_id = ?', [lessonId]);
}

async function getLessonsByCourse(courseId) {
  return queryAll('SELECT * FROM lessons WHERE course_id = ? AND status = "published" ORDER BY order_number', [courseId]);
}

async function createLesson(lessonData) {
  const { lesson_id, course_id, title_ar, title_en, title_fr, content_ar, content_en, content_fr, objectives_ar, objectives_en, objectives_fr, duration_minutes, order_number, status, video_url } = lessonData;
  return run(
    `INSERT INTO lessons (lesson_id, course_id, title_ar, title_en, title_fr, content_ar, content_en, content_fr, objectives_ar, objectives_en, objectives_fr, duration_minutes, order_number, status, video_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [lesson_id, course_id, title_ar, title_en, title_fr, content_ar, content_en, content_fr, objectives_ar, objectives_en, objectives_fr, duration_minutes, order_number, status, video_url]
  );
}

// ============================================
// ENROLLMENT QUERIES
// ============================================

async function getEnrollmentById(enrollmentId) {
  return queryOne('SELECT * FROM enrollments WHERE enrollment_id = ?', [enrollmentId]);
}

async function getUserEnrollments(userId) {
  return queryAll(
    'SELECT e.*, c.title_ar, c.title_en FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?',
    [userId]
  );
}

async function getCourseEnrollments(courseId) {
  return queryAll('SELECT * FROM enrollments WHERE course_id = ? ORDER BY created_at DESC', [courseId]);
}

async function createEnrollment(enrollmentData) {
  const { enrollment_id, user_id, course_id, status, progress_percentage, started_at } = enrollmentData;
  return run(
    `INSERT INTO enrollments (enrollment_id, user_id, course_id, status, progress_percentage, started_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [enrollment_id, user_id, course_id, status, progress_percentage, started_at]
  );
}

// ============================================
// POINTS QUERIES
// ============================================

async function getUserPoints(userId) {
  return queryAll('SELECT * FROM points WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

async function getUserTotalPoints(userId) {
  const result = await queryOne('SELECT SUM(amount) as total FROM points WHERE user_id = ?', [userId]);
  return result?.total || 0;
}

async function awardPoints(pointsData) {
  const { point_id, user_id, amount, reason, category, reference_id } = pointsData;
  return run(
    `INSERT INTO points (point_id, user_id, amount, reason, category, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [point_id, user_id, amount, reason, category, reference_id]
  );
}

// ============================================
// BADGE QUERIES
// ============================================

async function getBadgeById(badgeId) {
  return queryOne('SELECT * FROM badges WHERE badge_id = ?', [badgeId]);
}

async function getAllBadges() {
  return queryAll('SELECT * FROM badges WHERE status = "active"');
}

async function getUserBadges(userId) {
  return queryAll(
    `SELECT b.* FROM badges b
     JOIN user_badges ub ON b.id = ub.badge_id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
}

async function awardBadge(userId, badgeId) {
  return run(
    `INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [`ubadge-${Date.now()}`, userId, badgeId]
  );
}

// ============================================
// ASSESSMENT QUERIES
// ============================================

async function getAssessmentById(assessmentId) {
  return queryOne('SELECT * FROM assessments WHERE assessment_id = ?', [assessmentId]);
}

async function getAssessmentsByLesson(lessonId) {
  return queryAll('SELECT * FROM assessments WHERE lesson_id = ? AND status = "published"', [lessonId]);
}

async function submitAssessmentResult(resultData) {
  const { result_id, user_id, assessment_id, score, status, submitted_at, graded_at } = resultData;
  return run(
    `INSERT INTO assessment_results (result_id, user_id, assessment_id, score, status, submitted_at, graded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [result_id, user_id, assessment_id, score, status, submitted_at, graded_at]
  );
}

async function getUserAssessmentResults(userId) {
  return queryAll(
    `SELECT ar.*, a.title_ar, a.title_en FROM assessment_results ar
     JOIN assessments a ON ar.assessment_id = a.id
     WHERE ar.user_id = ?
     ORDER BY ar.submitted_at DESC`,
    [userId]
  );
}

// ============================================
// JOB QUERIES
// ============================================

async function getJobById(jobId) {
  return queryOne('SELECT * FROM jobs WHERE job_id = ?', [jobId]);
}

async function getAllJobs() {
  return queryAll('SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC');
}

async function getJobsByType(jobType) {
  return queryAll('SELECT * FROM jobs WHERE job_type = ? AND status = "open"', [jobType]);
}

async function applyForJob(applicationData) {
  const { application_id, user_id, job_id, status, cover_letter } = applicationData;
  return run(
    `INSERT INTO job_applications (application_id, user_id, job_id, status, cover_letter)
     VALUES (?, ?, ?, ?, ?)`,
    [application_id, user_id, job_id, status, cover_letter]
  );
}

async function getUserJobApplications(userId) {
  return queryAll(
    `SELECT ja.*, j.title_ar, j.title_en FROM job_applications ja
     JOIN jobs j ON ja.job_id = j.id
     WHERE ja.user_id = ?
     ORDER BY ja.applied_at DESC`,
    [userId]
  );
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
  const { portfolio_id, user_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, status } = portfolioData;
  return run(
    `INSERT INTO portfolios (portfolio_id, user_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [portfolio_id, user_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, status]
  );
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

async function getUserNotifications(userId) {
  return queryAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
}

async function createNotification(notificationData) {
  const { notification_id, user_id, title, message, type, is_read, action_url } = notificationData;
  return run(
    `INSERT INTO notifications (notification_id, user_id, title, message, type, is_read, action_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [notification_id, user_id, title, message, type, is_read, action_url]
  );
}

async function markNotificationAsRead(notificationId) {
  return run('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [notificationId]);
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
  return queryAll('SELECT * FROM courses WHERE status = "published" ORDER BY total_students DESC LIMIT ?', [limit]);
}

async function getTopTeachers(limit = 5) {
  return queryAll(
    `SELECT u.*, COUNT(c.id) as course_count
     FROM users u
     LEFT JOIN courses c ON u.id = c.instructor_id
     WHERE u.role IN ('teacher', 'admin')
     GROUP BY u.id
     ORDER BY course_count DESC
     LIMIT ?`,
    [limit]
  );
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
  // Initialization
  initializeDatabase,

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

  // Lesson queries
  getLessonById,
  getLessonsByCourse,
  createLesson,

  // Enrollment queries
  getEnrollmentById,
  getUserEnrollments,
  getCourseEnrollments,
  createEnrollment,

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
  submitAssessmentResult,
  getUserAssessmentResults,

  // Job queries
  getJobById,
  getAllJobs,
  getJobsByType,
  applyForJob,
  getUserJobApplications,

  // Portfolio queries
  getPortfolioById,
  getUserPortfolio,
  createPortfolio,

  // Notification queries
  getUserNotifications,
  createNotification,
  markNotificationAsRead,

  // Statistics queries
  getTotalUsers,
  getTotalCourses,
  getTotalEnrollments,
  getTotalJobs,
  getTopCourses,
  getTopTeachers
};
