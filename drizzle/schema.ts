import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role management for trainers, participants, and supervisors.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  arabicName: text("arabicName"), // Arabic name for certificates
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "trainer", "supervisor"]).default("user").notNull(),
  
  // Registration fields
  firstNameAr: varchar("firstNameAr", { length: 100 }),
  lastNameAr: varchar("lastNameAr", { length: 100 }),
  firstNameFr: varchar("firstNameFr", { length: 100 }),
  lastNameFr: varchar("lastNameFr", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  idCardNumber: varchar("idCardNumber", { length: 50 }),
  paymentReceiptUrl: text("paymentReceiptUrl"),
  registrationCompleted: boolean("registrationCompleted").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Courses table - stores the 7 training courses
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
    "primary_teachers",
    "arabic_teachers", 
    "science_teachers",
    "french_teachers",
    "preschool_facilitators",
    "special_needs_companions",
    "digital_teacher_ai"
  ]).notNull(),
  duration: int("duration"), // in hours
  axes: text("axes"), // JSON array of course axes/topics
  batchNumber: varchar("batchNumber", { length: 100 }), // Batch/promotion number
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Enrollments table - tracks participant registrations to courses
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active", "completed", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Exams table - stores final exams for each course
 */
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  duration: int("duration"), // in minutes
  passingScore: int("passingScore").default(60).notNull(), // percentage
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

/**
 * Questions table - stores multiple choice questions for exams
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("examId").notNull(),
  questionTextAr: text("questionTextAr").notNull(),
  options: json("options").notNull().$type<{
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }>(),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  points: int("points").default(1).notNull(),
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Exam attempts table - tracks when participants take exams
 */
export const examAttempts = mysqlTable("examAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examId: int("examId").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  submittedAt: timestamp("submittedAt"),
  score: int("score"), // percentage
  totalPoints: int("totalPoints"),
  earnedPoints: int("earnedPoints"),
  status: mysqlEnum("status", ["in_progress", "submitted", "graded"]).default("in_progress").notNull(),
  passed: boolean("passed"),
});

export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = typeof examAttempts.$inferInsert;

/**
 * Answers table - stores participant answers to questions
 */
export const answers = mysqlTable("answers", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  selectedAnswer: mysqlEnum("selectedAnswer", ["A", "B", "C", "D"]).notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  points: int("points").notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

/**
 * Certificates table - stores generated certificates for successful participants
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  examAttemptId: int("examAttemptId"), // Nullable for cumulative certificates
  certificateNumber: varchar("certificateNumber", { length: 50 }).notNull().unique(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  pdfUrl: text("pdfUrl"),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Videos table - stores course videos
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  videoUrl: text("videoUrl").notNull(),
  duration: int("duration"), // in seconds
  orderIndex: int("orderIndex").notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Video progress table - tracks user video watching progress
 */
export const videoProgress = mysqlTable("videoProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoId: int("videoId").notNull(),
  watchedDuration: int("watchedDuration").default(0).notNull(), // in seconds
  completed: boolean("completed").default(false).notNull(),
  lastWatchedAt: timestamp("lastWatchedAt").defaultNow().notNull(),
});

export type VideoProgress = typeof videoProgress.$inferSelect;
export type InsertVideoProgress = typeof videoProgress.$inferInsert;

/**
 * Notifications table - stores user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  messageAr: text("messageAr").notNull(),
  type: mysqlEnum("type", ["enrollment_request", "enrollment_approved", "enrollment_rejected", "new_video", "exam_result"]).notNull(),
  relatedId: int("relatedId"), // courseId, examId, etc.
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
