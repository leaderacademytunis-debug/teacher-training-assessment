import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role management for trainers, participants, and supervisors.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  arabicName: text("arabicName"), // Arabic name for certificates
  email: varchar("email", { length: 320 }).notNull(),
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
  registrationStatus: mysqlEnum("registrationStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
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

/**
 * Pedagogical sheets table - stores lesson preparation sheets (مذكرات بيداغوجية)
 */
export const pedagogicalSheets = mysqlTable("pedagogicalSheets", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  // Mandatory identification
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(), // e.g., "2025-2026"
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(), // ابتدائي، إعدادي، ثانوي
  grade: varchar("grade", { length: 50 }).notNull(), // e.g., "السنة الأولى ابتدائي"
  subject: varchar("subject", { length: 100 }).notNull(), // e.g., "اللغة العربية"
  
  // Lesson details
  lessonTitle: varchar("lessonTitle", { length: 255 }).notNull(),
  lessonObjectives: text("lessonObjectives"), // Competences and objectives
  duration: int("duration"), // in minutes
  materials: text("materials"), // Required materials
  
  // Pedagogical structure
  introduction: text("introduction"),
  mainActivities: json("mainActivities").$type<Array<{
    title: string;
    description: string;
    duration: number;
  }>>(),
  conclusion: text("conclusion"),
  evaluation: text("evaluation"),
  
  // Official references
  guidePageReference: varchar("guidePageReference", { length: 100 }), // Page from official guide
  programReference: text("programReference"), // Terminal competence from official program
  
  // Metadata
  status: mysqlEnum("status", ["draft", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PedagogicalSheet = typeof pedagogicalSheets.$inferSelect;
export type InsertPedagogicalSheet = typeof pedagogicalSheets.$inferInsert;

/**
 * Lesson plans table - stores lesson planning (تخطيط الدروس)
 */
export const lessonPlans = mysqlTable("lessonPlans", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  // Mandatory identification
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  
  // Planning details
  planTitle: varchar("planTitle", { length: 255 }).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  totalLessons: int("totalLessons"),
  
  // Lessons breakdown
  lessons: json("lessons").$type<Array<{
    week: number;
    lessonTitle: string;
    objectives: string;
    duration: number;
  }>>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonPlan = typeof lessonPlans.$inferSelect;
export type InsertLessonPlan = typeof lessonPlans.$inferInsert;

/**
 * Teacher exams table - stores teacher-created exams (اختبارات المدرسين)
 * Different from training course exams
 */
export const teacherExams = mysqlTable("teacherExams", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  // Mandatory identification
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  
  // Exam details
  examTitle: varchar("examTitle", { length: 255 }).notNull(),
  examType: mysqlEnum("examType", ["formative", "summative", "diagnostic"]).notNull(), // تقييم تكويني، ختامي، تشخيصي
  duration: int("duration"), // in minutes
  totalPoints: int("totalPoints").default(20).notNull(), // Out of 20
  
  // Exam content
  questions: json("questions").$type<Array<{
    questionText: string;
    questionType: "mcq" | "short_answer" | "essay";
    points: number;
    options?: string[]; // For MCQ
    correctAnswer?: string;
  }>>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeacherExam = typeof teacherExams.$inferSelect;
export type InsertTeacherExam = typeof teacherExams.$inferInsert;

/**
 * Reference documents table - stores uploaded official guides and programs
 */
export const referenceDocuments = mysqlTable("referenceDocuments", {
  id: int("id").autoincrement().primaryKey(),
  uploadedBy: int("uploadedBy").notNull(),
  
  // Document identification
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }),
  subject: varchar("subject", { length: 100 }),
  
  // Document details
  documentType: mysqlEnum("documentType", ["teacher_guide", "official_program", "other"]).notNull(),
  documentTitle: varchar("documentTitle", { length: 255 }).notNull(),
  documentUrl: text("documentUrl").notNull(), // S3 URL
  
  // Metadata
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type ReferenceDocument = typeof referenceDocuments.$inferSelect;
export type InsertReferenceDocument = typeof referenceDocuments.$inferInsert;

/**
 * Saved prompts table - stores favorite prompts for reuse
 */
export const savedPrompts = mysqlTable("savedPrompts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Prompt details
  title: varchar("title", { length: 255 }).notNull(), // User-given title
  promptText: text("promptText").notNull(), // The full prompt
  
  // Context for filtering
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]),
  grade: varchar("grade", { length: 50 }),
  subject: varchar("subject", { length: 100 }),
  
  // Metadata
  usageCount: int("usageCount").default(0).notNull(), // How many times reused
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export type SavedPrompt = typeof savedPrompts.$inferSelect;
export type InsertSavedPrompt = typeof savedPrompts.$inferInsert;

/**
 * Shared pedagogical sheets table - stores published notes in the shared library
 */
export const sharedPedagogicalSheets = mysqlTable("sharedPedagogicalSheets", {
  id: int("id").autoincrement().primaryKey(),
  originalSheetId: int("originalSheetId").notNull(), // Reference to pedagogicalSheets
  publishedBy: int("publishedBy").notNull(), // User who published
  
  // Cached data from original sheet (for faster queries)
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  lessonTitle: varchar("lessonTitle", { length: 255 }).notNull(),
  
  // Full sheet data as JSON
  sheetData: json("sheetData").notNull(),
  
  // Engagement metrics
  viewCount: int("viewCount").default(0).notNull(),
  cloneCount: int("cloneCount").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: int("ratingCount").default(0).notNull(),
  
  // Metadata
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedPedagogicalSheet = typeof sharedPedagogicalSheets.$inferSelect;
export type InsertSharedPedagogicalSheet = typeof sharedPedagogicalSheets.$inferInsert;

/**
 * Sheet ratings table - stores user ratings for shared sheets
 */
export const sheetRatings = mysqlTable("sheetRatings", {
  id: int("id").autoincrement().primaryKey(),
  sharedSheetId: int("sharedSheetId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SheetRating = typeof sheetRatings.$inferSelect;
export type InsertSheetRating = typeof sheetRatings.$inferInsert;

/**
 * Sheet comments table - stores comments on shared sheets
 */
export const sheetComments = mysqlTable("sheetComments", {
  id: int("id").autoincrement().primaryKey(),
  sharedSheetId: int("sharedSheetId").notNull(),
  userId: int("userId").notNull(),
  commentText: text("commentText").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SheetComment = typeof sheetComments.$inferSelect;
export type InsertSheetComment = typeof sheetComments.$inferInsert;


/**
 * Infographics table - stores AI-generated infographics
 */
export const infographics = mysqlTable("infographics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  style: varchar("style", { length: 50 }).notNull(), // educational, scientific, statistical
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  prompt: text("prompt").notNull(), // The AI prompt used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Infographic = typeof infographics.$inferSelect;
export type InsertInfographic = typeof infographics.$inferInsert;

/**
 * Mind maps table - stores AI-generated mind maps
 */
export const mindMaps = mysqlTable("mindMaps", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  centralTopic: varchar("centralTopic", { length: 255 }).notNull(),
  description: text("description"),
  mapData: json("mapData").notNull(), // Stores the mind map structure
  imageUrl: varchar("imageUrl", { length: 500 }), // Optional rendered image
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MindMap = typeof mindMaps.$inferSelect;
export type InsertMindMap = typeof mindMaps.$inferInsert;
