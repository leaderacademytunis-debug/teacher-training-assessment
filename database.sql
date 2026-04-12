-- ============================================
-- LEADER ACADEMY - DATABASE SCHEMA
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS leader_academy;
USE leader_academy;

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('user', 'teacher', 'admin', 'inspector') DEFAULT 'user',
  school_name VARCHAR(100),
  school_logo VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(50),
  city VARCHAR(50),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  subscription_plan ENUM('free', 'pro', 'expert') DEFAULT 'free',
  subscription_expires_at DATETIME,
  total_points INT DEFAULT 0,
  total_badges INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id VARCHAR(50) UNIQUE NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  category VARCHAR(50),
  level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  duration_hours INT,
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'TND',
  instructor_id INT,
  cover_image_url VARCHAR(255),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  total_students INT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id),
  INDEX idx_category (category),
  INDEX idx_level (level),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LESSONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id VARCHAR(50) UNIQUE NOT NULL,
  course_id INT NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  content_ar LONGTEXT,
  content_en LONGTEXT,
  content_fr LONGTEXT,
  objectives_ar TEXT,
  objectives_en TEXT,
  objectives_fr TEXT,
  duration_minutes INT,
  order_number INT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  video_url VARCHAR(255),
  resources_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  INDEX idx_course_id (course_id),
  INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('enrolled', 'in_progress', 'completed', 'dropped') DEFAULT 'enrolled',
  progress_percentage INT DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  certificate_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY unique_enrollment (user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LESSON PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  progress_id VARCHAR(50) UNIQUE NOT NULL,
  enrollment_id INT NOT NULL,
  lesson_id INT NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  watched_duration_seconds INT DEFAULT 0,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  UNIQUE KEY unique_progress (enrollment_id, lesson_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POINTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  point_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  reason VARCHAR(100),
  category ENUM('lesson_completed', 'quiz_passed', 'course_completed', 'achievement', 'other') DEFAULT 'other',
  reference_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BADGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  badge_id VARCHAR(50) UNIQUE NOT NULL,
  title_ar VARCHAR(100) NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  title_fr VARCHAR(100) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  icon_url VARCHAR(255),
  criteria VARCHAR(100),
  points_required INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER BADGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_badge_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  INDEX idx_user_id (user_id),
  INDEX idx_earned_at (earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ASSESSMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessment_id VARCHAR(50) UNIQUE NOT NULL,
  lesson_id INT NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  type ENUM('quiz', 'assignment', 'project', 'exam') DEFAULT 'quiz',
  total_points INT DEFAULT 100,
  passing_score INT DEFAULT 60,
  duration_minutes INT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ASSESSMENT RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  assessment_id INT NOT NULL,
  score INT,
  status ENUM('pending', 'submitted', 'graded', 'passed', 'failed') DEFAULT 'pending',
  submitted_at DATETIME,
  graded_at DATETIME,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  INDEX idx_user_id (user_id),
  INDEX idx_assessment_id (assessment_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id VARCHAR(50) UNIQUE NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  description_ar LONGTEXT,
  description_en LONGTEXT,
  description_fr LONGTEXT,
  company_name VARCHAR(100),
  location VARCHAR(100),
  job_type ENUM('full_time', 'part_time', 'contract', 'freelance') DEFAULT 'full_time',
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'TND',
  experience_level ENUM('entry', 'mid', 'senior') DEFAULT 'mid',
  status ENUM('open', 'closed', 'archived') DEFAULT 'open',
  total_applications INT DEFAULT 0,
  posted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_job_type (job_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('applied', 'reviewing', 'shortlisted', 'rejected', 'accepted') DEFAULT 'applied',
  cover_letter TEXT,
  resume_url VARCHAR(255),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  UNIQUE KEY unique_application (user_id, job_id),
  INDEX idx_user_id (user_id),
  INDEX idx_job_id (job_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PORTFOLIOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  title_ar VARCHAR(255),
  title_en VARCHAR(255),
  title_fr VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  cover_image_url VARCHAR(255),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  total_views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PORTFOLIO ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id VARCHAR(50) UNIQUE NOT NULL,
  portfolio_id INT NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  image_url VARCHAR(255),
  url VARCHAR(255),
  order_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  INDEX idx_portfolio_id (portfolio_id),
  INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analytics_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT,
  event_type VARCHAR(50),
  event_data JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create Indexes for Performance
-- ============================================

CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_lessons_created_at ON lessons(created_at);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at);
CREATE INDEX idx_points_user_created ON points(user_id, created_at);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- ============================================
-- END OF SCHEMA
-- ============================================
