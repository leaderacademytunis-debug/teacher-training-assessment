-- ============================================
-- LEADER ACADEMY - SQLite SCHEMA
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'teacher', 'admin', 'inspector')),
  school_name TEXT,
  school_logo TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  subscription_plan TEXT DEFAULT 'free' CHECK(subscription_plan IN ('free', 'pro', 'expert')),
  subscription_expires_at DATETIME,
  total_points INTEGER DEFAULT 0,
  total_badges INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- COURSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  category TEXT,
  level TEXT DEFAULT 'beginner' CHECK(level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER,
  price REAL DEFAULT 0,
  currency TEXT DEFAULT 'TND',
  instructor_id INTEGER,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  total_students INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_status ON courses(status);

-- ============================================
-- LESSONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id TEXT UNIQUE NOT NULL,
  course_id INTEGER NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  content_ar TEXT,
  content_en TEXT,
  content_fr TEXT,
  objectives_ar TEXT,
  objectives_en TEXT,
  objectives_fr TEXT,
  duration_minutes INTEGER,
  order_number INTEGER,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  video_url TEXT,
  resources_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(order_number);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percentage INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  certificate_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- ============================================
-- LESSON PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id TEXT UNIQUE NOT NULL,
  enrollment_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
  watched_duration_seconds INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- ============================================
-- POINTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  point_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  category TEXT DEFAULT 'other' CHECK(category IN ('lesson_completed', 'quiz_passed', 'course_completed', 'achievement', 'other')),
  reference_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_points_category ON points(category);
CREATE INDEX idx_points_created_at ON points(created_at);

-- ============================================
-- BADGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_id TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  icon_url TEXT,
  criteria TEXT,
  points_required INTEGER,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_status ON badges(status);

-- ============================================
-- USER BADGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_badge_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

-- ============================================
-- ASSESSMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id TEXT UNIQUE NOT NULL,
  lesson_id INTEGER NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  type TEXT DEFAULT 'quiz' CHECK(type IN ('quiz', 'assignment', 'project', 'exam')),
  total_points INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 60,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE INDEX idx_assessments_lesson_id ON assessments(lesson_id);
CREATE INDEX idx_assessments_type ON assessments(type);

-- ============================================
-- ASSESSMENT RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  score INTEGER,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'graded', 'passed', 'failed')),
  submitted_at DATETIME,
  graded_at DATETIME,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_assessment_results_status ON assessment_results(status);

-- ============================================
-- JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  company_name TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'full_time' CHECK(job_type IN ('full_time', 'part_time', 'contract', 'freelance')),
  salary_min REAL,
  salary_max REAL,
  currency TEXT DEFAULT 'TND',
  experience_level TEXT DEFAULT 'mid' CHECK(experience_level IN ('entry', 'mid', 'senior')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'archived')),
  total_applications INTEGER DEFAULT 0,
  posted_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'reviewing', 'shortlisted', 'rejected', 'accepted')),
  cover_letter TEXT,
  resume_url TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- ============================================
-- PORTFOLIOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  title_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  total_views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolios(status);

-- ============================================
-- PORTFOLIO ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT UNIQUE NOT NULL,
  portfolio_id INTEGER NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  image_url TEXT,
  url TEXT,
  order_number INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE INDEX idx_portfolio_items_portfolio_id ON portfolio_items(portfolio_id);
CREATE INDEX idx_portfolio_items_order ON portfolio_items(order_number);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT 0,
  action_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analytics_id TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  event_type TEXT,
  event_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- ============================================
-- END OF SCHEMA
-- ============================================
