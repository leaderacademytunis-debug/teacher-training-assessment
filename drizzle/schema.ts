import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal, mediumtext } from "drizzle-orm/mysql-core";

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
  schoolName: varchar("schoolName", { length: 255 }),
  schoolLogo: text("schoolLogo"), // URL to school logo in S3
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
  type: mysqlEnum("type", ["enrollment_request", "enrollment_approved", "enrollment_rejected", "new_video", "exam_result", "marketplace_rating", "marketplace_download", "marketplace_review", "assignment_graded", "assignment_returned", "submission_comment"]).notNull(),
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
  language: mysqlEnum("language", ["arabic", "french", "english"]), // Optional: override auto-detection
  
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
  language: mysqlEnum("language", ["arabic", "french", "english"]).default("arabic").notNull(), // Document language
  extractedContent: mediumtext("extractedContent"), // Extracted text from PDF for better AI suggestions
  
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
 * AI Suggestions table - archives AI-generated pedagogical suggestions
 */
export const aiSuggestions = mysqlTable("aiSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Basic information
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  lessonTitle: varchar("lessonTitle", { length: 255 }).notNull(),
  
  // Suggestion content
  duration: int("duration"),
  lessonObjectives: text("lessonObjectives"),
  materials: text("materials"),
  introduction: text("introduction"),
  mainActivities: json("mainActivities"), // Array of {title, duration, description}
  conclusion: text("conclusion"),
  evaluation: text("evaluation"),
  
  // AI metadata
  rawSuggestion: text("rawSuggestion"), // Original AI response
  usedReferences: json("usedReferences"), // Array of reference documents used
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = typeof aiSuggestions.$inferInsert;

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

/**
 * Suggestion ratings table - stores user ratings for AI-generated suggestions
 */
export const suggestionRatings = mysqlTable("suggestionRatings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Rating details
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional feedback
  
  // Context for analysis
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  language: mysqlEnum("language", ["arabic", "french", "english"]).notNull(),
  
  // Reference tracking
  usedReferences: json("usedReferences").$type<Array<number>>(), // IDs of references used
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SuggestionRating = typeof suggestionRatings.$inferSelect;
export type InsertSuggestionRating = typeof suggestionRatings.$inferInsert;

/**
 * Templates table - stores predefined pedagogical note templates
 */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  // Template identification
  templateName: varchar("templateName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Context
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }),
  subject: varchar("subject", { length: 100 }),
  language: mysqlEnum("language", ["arabic", "french", "english"]).notNull(),
  
  // Template content
  duration: int("duration"), // in minutes
  lessonObjectives: text("lessonObjectives"),
  materials: text("materials"),
  introduction: text("introduction"),
  mainActivities: json("mainActivities").$type<Array<{
    title: string;
    description: string;
    duration: number;
  }>>(),
  conclusion: text("conclusion"),
  evaluation: text("evaluation"),
  
  // Metadata
  isPublic: boolean("isPublic").default(true).notNull(), // Whether visible to all users
  usageCount: int("usageCount").default(0).notNull(), // How many times used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/**
 * Conversations table - stores chat history with EduGPT
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Conversation metadata
  title: varchar("title", { length: 255 }).notNull(), // Auto-generated from first message
  messages: json("messages").$type<Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: Array<{
      name: string;
      size: number;
      type: string;
      url: string;
    }>;
    timestamp: number;
  }>>().notNull(),
  
  // Pin feature
  isPinned: boolean("isPinned").default(false).notNull(),
  
  // Tags (وسوم) - stored as JSON string, nullable
  tags: json("tags").$type<string[]>(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Shared evaluations table - stores evaluation reports for public sharing
 */
export const sharedEvaluations = mysqlTable("shared_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(), // Unique share token
  userId: int("userId").notNull(),
  userName: text("userName"), // Snapshot of user name at share time
  
  // Evaluation data snapshot
  noteGlobale: decimal("noteGlobale", { precision: 4, scale: 2 }).notNull(),
  appreciation: varchar("appreciation", { length: 100 }).notNull(),
  evaluationData: json("evaluationData").$type<{
    criteres: Array<{
      nom: string;
      note: number;
      noteMax: number;
      commentaire: string;
      points: string[];
      ameliorations: string[];
    }>;
    pointsForts: string[];
    pointsAmeliorer: string[];
    recommandations: string;
  }>().notNull(),
  
  // Optional metadata
  fileName: varchar("fileName", { length: 255 }),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  pdfUrl: text("pdfUrl"), // S3 URL of generated PDF
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Optional expiry
});

export type SharedEvaluation = typeof sharedEvaluations.$inferSelect;
export type InsertSharedEvaluation = typeof sharedEvaluations.$inferInsert;

/**
 * Saved evaluations library - stores generated SC2M223 evaluation sheets
 */
export const savedEvaluations = mysqlTable("saved_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // Metadata for search/filter
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  trimester: varchar("trimester", { length: 50 }),
  evaluationType: varchar("evaluationType", { length: 50 }), // formative | summative | diagnostic
  schoolYear: varchar("schoolYear", { length: 20 }),
  schoolName: varchar("schoolName", { length: 255 }),
  teacherName: varchar("teacherName", { length: 255 }),
  totalPoints: int("totalPoints").default(20),
  variant: varchar("variant", { length: 10 }).default("A"), // A or B

  // Full evaluation JSON (SC2M223 structure)
  evaluationData: json("evaluationData").$type<Record<string, unknown>>().notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedEvaluation = typeof savedEvaluations.$inferSelect;
export type InsertSavedEvaluation = typeof savedEvaluations.$inferInsert;

// ===== NEWSLETTER SUBSCRIBERS =====
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// ===== SAVED EXAMS (بناء الاختبار - المتفقد المميز) =====
export const savedExams = mysqlTable("saved_exams", {
  id: int("id").primaryKey().autoincrement(),
  subject: varchar("subject", { length: 100 }).notNull(),
  level: varchar("level", { length: 100 }).notNull(),
  trimester: varchar("trimester", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 30 }),
  totalScore: int("totalScore").default(20),
  topics: text("topics"),
  examContent: text("examContent").notNull(),
  answerKeyContent: text("answerKeyContent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SavedExam = typeof savedExams.$inferSelect;
export type InsertSavedExam = typeof savedExams.$inferInsert;

// ===== GENERATED IMAGES (Leader Visual Studio) =====
export const generatedImages = mysqlTable("generated_images", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId"),
  url: text("url").notNull(),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  source: varchar("source", { length: 50 }).default("studio"), // 'studio' | 'exam_builder' | 'edugpt'
  noBgUrl: text("noBgUrl"), // URL after background removal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

// ===== IMAGE USAGE TRACKING =====
export const imageUsageTracking = mysqlTable("image_usage_tracking", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 100 }), // for anonymous users
  imagesGenerated: int("imagesGenerated").default(0).notNull(),
  monthYear: varchar("monthYear", { length: 7 }).notNull(), // '2026-03'
  tier: varchar("tier", { length: 20 }).default("free").notNull(), // 'free' | 'pro'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ImageUsageTracking = typeof imageUsageTracking.$inferSelect;


// ===== PAYMENT REQUESTS (طلبات الدفع والتفعيل) =====
export const paymentRequests = mysqlTable("payment_requests", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Requested service
  requestedService: mysqlEnum("requestedService", [
    "edugpt_pro",
    "course_ai",
    "course_pedagogy",
    "full_bundle"
  ]).notNull(),
  
  // Payment proof
  receiptImageUrl: text("receiptImageUrl").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("TND"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // e.g., 'bank_transfer', 'd17', 'flouci'
  
  // Admin review
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  
  // Services activated (set by admin on approval)
  activatedServices: json("activatedServices").$type<{
    access_edugpt?: boolean;
    access_course_ai?: boolean;
    access_course_pedagogy?: boolean;
    access_full_bundle?: boolean;
  }>(),
  
  // Notes
  userNote: text("userNote"),
  adminNote: text("adminNote"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

// ===== SERVICE PERMISSIONS (صلاحيات الخدمات) =====
export const servicePermissions = mysqlTable("service_permissions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Service access flags
  accessEdugpt: boolean("access_edugpt").default(false).notNull(),
  accessCourseAi: boolean("access_course_ai").default(false).notNull(),
  accessCoursePedagogy: boolean("access_course_pedagogy").default(false).notNull(),
  accessFullBundle: boolean("access_full_bundle").default(false).notNull(),
  
  // Subscription details
  tier: mysqlEnum("tier", ["free", "pro", "premium"]).default("free").notNull(),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServicePermission = typeof servicePermissions.$inferSelect;
export type InsertServicePermission = typeof servicePermissions.$inferInsert;

// ===== AI ACTIVITY LOG (سجل نشاط الذكاء الاصطناعي) =====
export const aiActivityLog = mysqlTable("ai_activity_log", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }),
  
  // Activity details
  activityType: mysqlEnum("activityType", [
    "lesson_plan",
    "exam_generated",
    "evaluation",
    "image_generated",
    "inspection_report"
  ]).notNull(),
  
  // Content snapshot
  title: varchar("title", { length: 500 }),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  contentPreview: text("contentPreview"), // First 500 chars of generated content
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiActivityLog = typeof aiActivityLog.$inferSelect;
export type InsertAiActivityLog = typeof aiActivityLog.$inferInsert;

// ===== PRICING PLANS (خطط الأسعار) =====
export const pricingPlans = mysqlTable("pricing_plans", {
  id: int("id").primaryKey().autoincrement(),
  serviceKey: varchar("serviceKey", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  description: text("description"),
  price: int("price").notNull().default(0),
  currency: varchar("currency", { length: 10 }).notNull().default("TND"),
  billingPeriod: mysqlEnum("billingPeriod", ["monthly", "quarterly", "yearly", "lifetime"]).notNull().default("monthly"),
  features: text("features"),
  isPopular: boolean("isPopular").default(false),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  badgeText: varchar("badgeText", { length: 100 }),
  color: varchar("color", { length: 50 }).default("blue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;


// ===== DIGITIZED DOCUMENTS (رقمنة الوثائق التعليمية - Legacy Digitizer) =====
export const digitizedDocuments = mysqlTable("digitized_documents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),

  // Original document info
  title: varchar("title", { length: 255 }).notNull(),
  originalImageUrl: text("originalImageUrl").notNull(), // S3 URL of uploaded image
  originalFileName: varchar("originalFileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),

  // OCR extracted text
  extractedText: mediumtext("extractedText"),
  ocrLanguage: varchar("ocrLanguage", { length: 20 }).default("ar+fr"), // detected/used language

  // AI-formatted output
  formattedContent: mediumtext("formattedContent"), // AI-formatted lesson plan / exam
  formatType: mysqlEnum("formatType", ["lesson_plan", "exam", "evaluation", "annual_plan", "other"]).default("lesson_plan").notNull(),

  // Structured data (JSON of the formatted content for re-editing)
  structuredData: json("structuredData").$type<Record<string, unknown>>(),

  // Export URLs
  wordExportUrl: text("wordExportUrl"),
  pdfExportUrl: text("pdfExportUrl"),

  // Context metadata
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  schoolYear: varchar("schoolYear", { length: 20 }),

  // Status
  status: mysqlEnum("status", ["uploaded", "ocr_done", "formatted", "saved"]).default("uploaded").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DigitizedDocument = typeof digitizedDocuments.$inferSelect;
export type InsertDigitizedDocument = typeof digitizedDocuments.$inferInsert;


// ===== TEACHER PORTFOLIOS (الملف المهني للمعلم) =====
export const teacherPortfolios = mysqlTable("teacher_portfolios", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),

  // Public sharing
  isPublic: boolean("isPublic").default(false).notNull(),
  publicToken: varchar("publicToken", { length: 64 }).unique(), // Unique share link token
  publicSlug: varchar("publicSlug", { length: 100 }).unique(), // Custom slug for URL

  // Profile customization
  bio: text("bio"), // Short professional bio
  specializations: json("specializations").$type<string[]>(), // e.g., ["اللغة العربية", "الرياضيات"]
  yearsOfExperience: int("yearsOfExperience"),
  currentSchool: varchar("currentSchool", { length: 255 }),
  region: varchar("region", { length: 100 }), // Tunisian region/governorate
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]),

  // Cached analytics (updated periodically)
  totalLessonPlans: int("totalLessonPlans").default(0).notNull(),
  totalExams: int("totalExams").default(0).notNull(),
  totalImages: int("totalImages").default(0).notNull(),
  totalCertificates: int("totalCertificates").default(0).notNull(),
  totalEvaluations: int("totalEvaluations").default(0).notNull(),
  totalDigitizedDocs: int("totalDigitizedDocs").default(0).notNull(),
  totalConversations: int("totalConversations").default(0).notNull(),

  // Subject breakdown for radar chart (JSON map: subject -> count)
  subjectBreakdown: json("subjectBreakdown").$type<Record<string, number>>(),

  // PDF export URL (cached last export)
  lastPdfExportUrl: text("lastPdfExportUrl"),
  lastPdfExportAt: timestamp("lastPdfExportAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TeacherPortfolio = typeof teacherPortfolios.$inferSelect;
export type InsertTeacherPortfolio = typeof teacherPortfolios.$inferInsert;


// ===== CURRICULUM PLANS (المخططات السنوية الرسمية - Curriculum GPS) =====
export const curriculumPlans = mysqlTable("curriculum_plans", {
  id: int("id").primaryKey().autoincrement(),
  createdBy: int("createdBy").notNull(), // Admin or teacher who uploaded

  // Identification
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(), // e.g., "2025-2026"
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(), // e.g., "السنة الخامسة ابتدائي"
  subject: varchar("subject", { length: 100 }).notNull(), // e.g., "الإيقاظ العلمي"

  // Plan metadata
  planTitle: varchar("planTitle", { length: 255 }).notNull(), // e.g., "التوزيع السنوي - إيقاظ علمي سنة 5"
  totalPeriods: int("totalPeriods").default(6).notNull(), // Number of periods (فترات)
  totalTopics: int("totalTopics").default(0).notNull(), // Total topics in plan
  sourceDocumentUrl: text("sourceDocumentUrl"), // S3 URL of original uploaded file

  // Status
  isOfficial: boolean("isOfficial").default(false).notNull(), // Admin-verified official plan
  isActive: boolean("isActive").default(true).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CurriculumPlan = typeof curriculumPlans.$inferSelect;
export type InsertCurriculumPlan = typeof curriculumPlans.$inferInsert;

// ===== CURRICULUM TOPICS (مواضيع المنهج - تفاصيل كل درس في المخطط) =====
export const curriculumTopics = mysqlTable("curriculum_topics", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("planId").notNull(), // FK to curriculumPlans

  // Period info
  periodNumber: int("periodNumber").notNull(), // الفترة (1-6)
  periodName: varchar("periodName", { length: 100 }), // e.g., "الفترة الأولى"
  weekNumber: int("weekNumber"), // Optional: week within the year

  // Topic details
  topicTitle: varchar("topicTitle", { length: 255 }).notNull(), // e.g., "الأعداد ذات 5 أرقام"
  competency: varchar("competency", { length: 255 }), // كفاية المجال - e.g., "حل وضعيات مشكل دالة بتوظيف العمليات"
  competencyCode: varchar("competencyCode", { length: 50 }), // e.g., "ك.م.1"
  objectives: text("objectives"), // الأهداف المميزة
  
  // Textbook reference
  textbookName: varchar("textbookName", { length: 255 }), // e.g., "كتاب الرياضيات - السنة الرابعة"
  textbookPages: varchar("textbookPages", { length: 100 }), // e.g., "ص 42-45"
  
  // Session details
  sessionCount: int("sessionCount").default(1), // Number of sessions for this topic
  sessionDuration: int("sessionDuration").default(45), // Duration per session in minutes
  
  // Ordering
  orderIndex: int("orderIndex").notNull(), // Order within the plan

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CurriculumTopic = typeof curriculumTopics.$inferSelect;
export type InsertCurriculumTopic = typeof curriculumTopics.$inferInsert;

// ===== TEACHER CURRICULUM PROGRESS (تقدم المعلم في المنهج) =====
export const teacherCurriculumProgress = mysqlTable("teacher_curriculum_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(), // FK to curriculumPlans
  topicId: int("topicId").notNull(), // FK to curriculumTopics

  // Progress tracking
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "skipped"]).default("not_started").notNull(),
  
  // Linked content (what the teacher generated for this topic)
  linkedLessonPlanId: int("linkedLessonPlanId"), // FK to pedagogicalSheets
  linkedExamId: int("linkedExamId"), // FK to savedExams or teacherExams
  linkedEvaluationId: int("linkedEvaluationId"), // FK to savedEvaluations

  // Notes
  teacherNotes: text("teacherNotes"),

  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TeacherCurriculumProgress = typeof teacherCurriculumProgress.$inferSelect;
export type InsertTeacherCurriculumProgress = typeof teacherCurriculumProgress.$inferInsert;


/**
 * Grading Sessions - stores a grading session linked to an exam
 */
export const gradingSessions = mysqlTable("gradingSessions", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  // Session info
  sessionTitle: varchar("sessionTitle", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 50 }).notNull(),
  examType: mysqlEnum("examType", ["formative", "summative", "diagnostic"]).default("summative").notNull(),
  
  // Linked exam (optional - from Exam Builder)
  linkedExamId: int("linkedExamId"),
  
  // Linked curriculum (optional - from Curriculum GPS)
  linkedPlanId: int("linkedPlanId"),
  linkedTopicId: int("linkedTopicId"),
  
  // Correction key - the expected answers and criteria
  correctionKey: json("correctionKey").$type<{
    criteria: Array<{
      code: string; // مع1، مع2، مع3
      label: string;
      maxScore: number;
      description: string;
      expectedAnswer?: string;
    }>;
    totalPoints: number;
    gradingScale: {
      excellent: { min: number; symbol: string }; // +++
      good: { min: number; symbol: string }; // ++
      acceptable: { min: number; symbol: string }; // +
      insufficient: { min: number; symbol: string }; // -
      veryInsufficient: { min: number; symbol: string }; // --
      notAcquired: { min: number; symbol: string }; // ---
    };
  }>(),
  
  // Privacy
  hideStudentNames: boolean("hideStudentNames").default(true).notNull(),
  
  // Status
  status: mysqlEnum("status", ["draft", "in_progress", "completed"]).default("draft").notNull(),
  totalStudents: int("totalStudents").default(0).notNull(),
  gradedStudents: int("gradedStudents").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GradingSession = typeof gradingSessions.$inferSelect;
export type InsertGradingSession = typeof gradingSessions.$inferInsert;

/**
 * Student Submissions - individual student answer sheets within a grading session
 */
export const studentSubmissions = mysqlTable("studentSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  
  // Student info (can be hidden during grading)
  studentName: varchar("studentName", { length: 255 }),
  studentNumber: int("studentNumber"), // Anonymous number for blind grading
  
  // Uploaded answer sheet
  imageUrl: text("imageUrl").notNull(), // S3 URL
  imageKey: text("imageKey").notNull(), // S3 key
  
  // OCR extracted text
  extractedText: text("extractedText"),
  ocrConfidence: varchar("ocrConfidence", { length: 20 }), // high, medium, low
  
  // AI grading results
  criteriaScores: json("criteriaScores").$type<Array<{
    criterionCode: string; // مع1، مع2، مع3
    criterionLabel: string;
    maxScore: number;
    suggestedScore: number;
    finalScore: number; // After teacher review
    masteryLevel: string; // +++, ++, +, -, --, ---
    justification: string;
  }>>(),
  
  totalSuggestedScore: int("totalSuggestedScore"),
  totalFinalScore: int("totalFinalScore"),
  overallMasteryLevel: varchar("overallMasteryLevel", { length: 10 }), // +++, ++, +, etc.
  
  // Pedagogical feedback
  feedbackStrengths: text("feedbackStrengths"),
  feedbackImprovements: text("feedbackImprovements"),
  encouragementNote: text("encouragementNote"),
  
  // Status
  status: mysqlEnum("status", ["uploaded", "ocr_done", "ai_graded", "teacher_reviewed", "finalized"]).default("uploaded").notNull(),
  teacherNotes: text("teacherNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentSubmission = typeof studentSubmissions.$inferSelect;
export type InsertStudentSubmission = typeof studentSubmissions.$inferInsert;


// ===== MARKETPLACE ITEMS (سوق المحتوى الذهبي) =====
export const marketplaceItems = mysqlTable("marketplace_items", {
  id: int("id").primaryKey().autoincrement(),
  publishedBy: int("publishedBy").notNull(), // FK to users
  
  // Content identification
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", [
    "lesson_plan",    // جذاذة درس
    "exam",           // اختبار
    "evaluation",     // تقييم
    "drama_script",   // نص مسرحي
    "annual_plan",    // مخطط سنوي
    "digitized_doc",  // وثيقة مرقمنة
    "other"
  ]).notNull(),
  
  // Educational metadata
  subject: varchar("subject", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 100 }).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["primary", "middle", "secondary"]).default("primary").notNull(),
  period: varchar("period", { length: 50 }), // الفترة (1-6)
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  trimester: varchar("trimester", { length: 50 }), // الثلاثي
  
  // Content data
  content: mediumtext("content").notNull(), // The actual content (HTML/Markdown)
  contentPreview: text("contentPreview"), // First 300 chars for card display
  thumbnailUrl: text("thumbnailUrl"), // Preview image URL
  
  // Source reference (link to original item)
  sourceType: varchar("sourceType", { length: 50 }), // 'pedagogicalSheet', 'savedExam', 'savedEvaluation', etc.
  sourceId: int("sourceId"), // ID of the original item
  
  // Files
  wordExportUrl: text("wordExportUrl"),
  pdfExportUrl: text("pdfExportUrl"),
  
  // Watermarked versions (with IP protection)
  watermarkedPdfUrl: text("watermarkedPdfUrl"),
  
  // Contributor info (snapshot at publish time)
  contributorName: varchar("contributorName", { length: 255 }),
  contributorSchool: varchar("contributorSchool", { length: 255 }),
  contributorPortfolioLink: text("contributorPortfolioLink"), // Link to creator's public portfolio
  
  // Ranking metrics
  aiInspectorScore: int("aiInspectorScore"), // 0-100 from AI evaluation
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: int("totalRatings").default(0).notNull(),
  totalDownloads: int("totalDownloads").default(0).notNull(),
  totalViews: int("totalViews").default(0).notNull(),
  
  // Computed ranking score (weighted combination)
  rankingScore: decimal("rankingScore", { precision: 8, scale: 4 }).default("0"),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "approved", "rejected", "flagged"]).default("pending").notNull(),
  moderationNote: text("moderationNote"),
  moderatedBy: int("moderatedBy"),
  moderatedAt: timestamp("moderatedAt"),
  
  // Tags for enhanced search
  tags: json("tags").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItems.$inferInsert;

// ===== MARKETPLACE RATINGS (تقييمات ومراجعات السوق) =====
export const marketplaceRatings = mysqlTable("marketplace_ratings", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("itemId").notNull(), // FK to marketplaceItems
  userId: int("userId").notNull(), // FK to users
  
  // Rating
  rating: int("rating").notNull(), // 1-5 stars
  review: text("review"), // Optional text review
  
  // Helpful votes
  helpfulCount: int("helpfulCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MarketplaceRating = typeof marketplaceRatings.$inferSelect;
export type InsertMarketplaceRating = typeof marketplaceRatings.$inferInsert;

// ===== MARKETPLACE DOWNLOADS (تتبع التحميلات) =====
export const marketplaceDownloads = mysqlTable("marketplace_downloads", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("itemId").notNull(), // FK to marketplaceItems
  userId: int("userId").notNull(), // FK to users
  
  format: varchar("format", { length: 20 }).default("view"), // 'view', 'pdf', 'word'
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MarketplaceDownload = typeof marketplaceDownloads.$inferSelect;
export type InsertMarketplaceDownload = typeof marketplaceDownloads.$inferInsert;


// ========== Saved Drama Scripts ==========
export const savedDramaScripts = mysqlTable("saved_drama_scripts", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(), // FK to users
  
  // Script metadata
  lessonTitle: varchar("lessonTitle", { length: 500 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 100 }).notNull(),
  duration: int("duration").default(10).notNull(),
  studentCount: int("studentCount").default(25).notNull(),
  
  // Generated content
  scriptData: json("scriptData").$type<{
    title: string;
    synopsis: string;
    duration: string;
    characters: Array<{ name: string; description: string; keyLines: number; difficulty: string }>;
    scenes: Array<{
      number: number;
      title: string;
      setting: string;
      directorNotes: string;
      dialogue: Array<{ character: string; line: string; action: string }>;
      audienceInteraction: string;
    }>;
    educationalObjectives: string[];
    props: Array<{ name: string; description: string; cost: string; alternatives: string }>;
    warmUpActivity: string;
    debriefQuestions: string[];
  }>().notNull(),
  
  // Mask images (generated via Visual Studio)
  maskImages: json("maskImages").$type<Array<{
    characterName: string;
    imageUrl: string;
    generatedAt: string;
  }>>(),
  
  // Formative assessment questions
  assessmentQuestions: json("assessmentQuestions").$type<Array<{
    question: string;
    expectedAnswer: string;
    criteria: string; // مع1, مع2, مع3
  }>>(),
  
  // Role assignments
  roleAssignments: json("roleAssignments").$type<Array<{
    studentNumber: number;
    characterName: string;
    role: string;
    tip: string;
  }>>(),
  
  // Export URLs
  pdfExportUrl: text("pdfExportUrl"),
  
  // Status
  isFavorite: boolean("isFavorite").default(false),
  isPublished: boolean("isPublished").default(false),
  marketplaceItemId: int("marketplaceItemId"), // FK to marketplace_items if published
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SavedDramaScript = typeof savedDramaScripts.$inferSelect;
export type InsertDramaScript = typeof savedDramaScripts.$inferInsert;

// ===== PEER REVIEW COMMENTS (تعليقات المراجعة بين الأقران) =====
export const peerReviewComments = mysqlTable("peer_review_comments", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("itemId").notNull(), // FK to marketplace_items
  userId: int("userId").notNull(), // FK to users
  userName: varchar("userName", { length: 255 }),
  comment: text("comment").notNull(),
  isAiFiltered: boolean("isAiFiltered").default(false),
  aiFilterResult: mysqlEnum("aiFilterResult", ["approved", "modified", "rejected"]),
  originalComment: text("originalComment"),
  helpfulCount: int("helpfulCount").default(0).notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PeerReviewComment = typeof peerReviewComments.$inferSelect;
export type InsertPeerReviewComment = typeof peerReviewComments.$inferInsert;

// ===== AI VIDEO TEASERS (معاينات فيديو AI للمسرحيات) =====
export const aiVideoTeasers = mysqlTable("ai_video_teasers", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  scriptId: int("scriptId"),
  title: varchar("title", { length: 500 }).notNull(),
  prompt: text("prompt").notNull(),
  videoUrl: text("videoUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration").default(30),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AiVideoTeaser = typeof aiVideoTeasers.$inferSelect;
export type InsertAiVideoTeaser = typeof aiVideoTeasers.$inferInsert;

// ===== CONNECTION REQUESTS (طلبات التوظيف - Career Hub) =====
export const connectionRequests = mysqlTable("connection_requests", {
  id: int("id").primaryKey().autoincrement(),
  teacherUserId: int("teacherUserId").notNull(), // FK to users - the teacher being contacted
  // Requester info
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
  requesterPhone: varchar("requesterPhone", { length: 50 }),
  requesterOrganization: varchar("requesterOrganization", { length: 255 }),
  requesterRole: varchar("requesterRole", { length: 100 }),
  message: text("message").notNull(),
  // Status flow: pending -> teacher approves/rejects -> if approved, contact info revealed
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  teacherResponse: text("teacherResponse"),
  contactInfoRevealed: boolean("contactInfoRevealed").default(false).notNull(),
  teacherNotifiedAt: timestamp("teacherNotifiedAt"),
  adminNotifiedAt: timestamp("adminNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = typeof connectionRequests.$inferInsert;

// ===== GOLDEN SAMPLES (العينات الذهبية - Featured Portfolio Items) =====
export const goldenSamples = mysqlTable("golden_samples", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["lesson_plan", "exam", "drama_script", "digitized_doc", "marketplace_item"]).notNull(),
  itemId: int("itemId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }),
  grade: varchar("grade", { length: 50 }),
  thumbnailUrl: text("thumbnailUrl"),
  displayOrder: int("displayOrder").default(0).notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GoldenSample = typeof goldenSamples.$inferSelect;
export type InsertGoldenSample = typeof goldenSamples.$inferInsert;

// ===== PARTNER SCHOOLS (المدارس الشريكة - Recruitment Portal) =====
export const partnerSchools = mysqlTable("partner_schools", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(), // Links to users table (school admin account)
  schoolName: varchar("schoolName", { length: 255 }).notNull(),
  schoolNameAr: varchar("schoolNameAr", { length: 255 }),
  schoolType: mysqlEnum("schoolType", ["private", "public", "international", "other"]).default("private").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  logoUrl: text("logoUrl"),
  description: text("description"),
  isVerified: boolean("isVerified").default(false).notNull(),
  contactPersonName: varchar("contactPersonName", { length: 200 }),
  contactPersonRole: varchar("contactPersonRole", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PartnerSchool = typeof partnerSchools.$inferSelect;
export type InsertPartnerSchool = typeof partnerSchools.$inferInsert;

// ===== JOB POSTINGS (عروض العمل - School Job Offers) =====
export const jobPostings = mysqlTable("job_postings", {
  id: int("id").primaryKey().autoincrement(),
  schoolId: int("schoolId").notNull(),
  postedByUserId: int("postedByUserId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 50 }),
  region: varchar("region", { length: 100 }).notNull(),
  contractType: mysqlEnum("contractType", ["full_time", "part_time", "temporary", "freelance"]).default("full_time").notNull(),
  salaryRange: varchar("salaryRange", { length: 100 }),
  requirements: text("requirements"),
  requiredSkills: json("requiredSkills").$type<string[]>(),
  isActive: boolean("isActive").default(true).notNull(),
  applicationDeadline: timestamp("applicationDeadline"),
  matchedTeacherIds: json("matchedTeacherIds").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;


// ===== CAREER CONVERSATIONS (محادثات مهنية) =====
export const careerConversations = mysqlTable("career_conversations", {
  id: int("id").primaryKey().autoincrement(),
  teacherUserId: int("teacherUserId").notNull(),
  schoolId: int("schoolId").notNull(),
  schoolUserId: int("schoolUserId").notNull(),
  jobPostingId: int("jobPostingId"),
  status: mysqlEnum("status", ["active", "archived", "blocked"]).default("active").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CareerConversation = typeof careerConversations.$inferSelect;
export type InsertCareerConversation = typeof careerConversations.$inferInsert;

// ===== CAREER MESSAGES (رسائل مهنية) =====
export const careerMessages = mysqlTable("career_messages", {
  id: int("id").primaryKey().autoincrement(),
  conversationId: int("conversationId").notNull(),
  senderUserId: int("senderUserId").notNull(),
  content: text("content").notNull(),
  isFiltered: boolean("isFiltered").default(false),
  filteredContent: text("filteredContent"),
  messageType: mysqlEnum("messageType", ["text", "system", "task_request", "task_response"]).default("text").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CareerMessage = typeof careerMessages.$inferSelect;
export type InsertCareerMessage = typeof careerMessages.$inferInsert;

// ===== PROFILE ANALYTICS (تحليلات الملف المهني) =====
export const profileAnalytics = mysqlTable("profile_analytics", {
  id: int("id").primaryKey().autoincrement(),
  teacherUserId: int("teacherUserId").notNull(),
  eventType: mysqlEnum("eventType", ["profile_view", "cv_download", "smart_match", "contact_click"]).notNull(),
  visitorInfo: varchar("visitorInfo", { length: 500 }),
  jobPostingId: int("jobPostingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProfileAnalytic = typeof profileAnalytics.$inferSelect;
export type InsertProfileAnalytic = typeof profileAnalytics.$inferInsert;

// ===== DIGITAL TASKS (مهام رقمية - Digital Audition) =====
export const digitalTasks = mysqlTable("digital_tasks", {
  id: int("id").primaryKey().autoincrement(),
  schoolId: int("schoolId").notNull(),
  schoolUserId: int("schoolUserId").notNull(),
  teacherUserId: int("teacherUserId").notNull(),
  jobPostingId: int("jobPostingId"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  topic: varchar("topic", { length: 200 }).notNull(),
  taskType: mysqlEnum("taskType", ["lesson_plan", "exam", "drama_script", "free_form"]).default("lesson_plan").notNull(),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["pending", "in_progress", "submitted", "reviewed", "expired"]).default("pending").notNull(),
  responseContent: text("responseContent"),
  responseUrl: varchar("responseUrl", { length: 1000 }),
  schoolFeedback: text("schoolFeedback"),
  schoolRating: int("schoolRating"),
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DigitalTask = typeof digitalTasks.$inferSelect;
export type InsertDigitalTask = typeof digitalTasks.$inferInsert;

// ===== JOB APPLICATIONS (طلبات التوظيف) =====
export const jobApplications = mysqlTable("job_applications", {
  id: int("id").primaryKey().autoincrement(),
  jobPostingId: int("jobPostingId").notNull(),
  teacherUserId: int("teacherUserId").notNull(),
  schoolId: int("schoolId").notNull(),
  showcaseLink: varchar("showcaseLink", { length: 500 }), // Teacher's verified showcase link
  coverMessage: text("coverMessage"), // Optional cover message
  status: mysqlEnum("status", ["sent", "viewed", "shortlisted", "interviewed", "accepted", "rejected"]).default("sent").notNull(),
  matchScore: int("matchScore"), // Smart match percentage (0-100)
  schoolNotes: text("schoolNotes"), // Internal notes from school
  viewedAt: timestamp("viewedAt"),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

// ===== SMART MATCH NOTIFICATIONS (إشعارات المطابقة الذكية) =====
export const smartMatchNotifications = mysqlTable("smart_match_notifications", {
  id: int("id").primaryKey().autoincrement(),
  teacherUserId: int("teacherUserId").notNull(),
  jobPostingId: int("jobPostingId").notNull(),
  matchScore: int("matchScore").notNull(), // Match percentage (0-100)
  matchDetails: json("matchDetails").$type<{ matchedSkills: string[]; matchedRegion: boolean; matchedLevel: boolean }>(),
  notificationType: mysqlEnum("notificationType", ["in_app", "email", "both"]).default("both").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  emailSent: boolean("emailSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SmartMatchNotification = typeof smartMatchNotifications.$inferSelect;
export type InsertSmartMatchNotification = typeof smartMatchNotifications.$inferInsert;


// ===== ACADEMY BATCH MANAGER (مدير الدفعات الأكاديمية) =====

// Batches / Tags (الدفعات والمجموعات)
export const batches = mysqlTable("batches", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Batch-114", "English-Group"
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  icon: varchar("icon", { length: 50 }).default("users"),
  inviteCode: varchar("inviteCode", { length: 32 }).unique(),
  inviteExpiresAt: timestamp("inviteExpiresAt"),
  maxMembers: int("maxMembers"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Batch = typeof batches.$inferSelect;
export type InsertBatch = typeof batches.$inferInsert;

// Batch Members (أعضاء الدفعة)
export const batchMembers = mysqlTable("batch_members", {
  id: int("id").primaryKey().autoincrement(),
  batchId: int("batchId").notNull(),
  userId: int("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type BatchMember = typeof batchMembers.$inferSelect;
export type InsertBatchMember = typeof batchMembers.$inferInsert;

// Batch Feature Access Rules (قواعد الوصول للميزات حسب الدفعة)
export const batchFeatureAccess = mysqlTable("batch_feature_access", {
  id: int("id").primaryKey().autoincrement(),
  batchId: int("batchId").notNull(),
  featureKey: varchar("featureKey", { length: 100 }).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BatchFeatureAccess = typeof batchFeatureAccess.$inferSelect;
export type InsertBatchFeatureAccess = typeof batchFeatureAccess.$inferInsert;

// Assignments (الواجبات)
export const assignments = mysqlTable("assignments", {
  id: int("id").primaryKey().autoincrement(),
  batchId: int("batchId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["lesson_plan", "exam", "evaluation", "free_form"]).default("lesson_plan").notNull(),
  dueDate: timestamp("dueDate"),
  maxScore: int("maxScore").default(100).notNull(),
  rubric: json("rubric").$type<{ criteria: string; weight: number; description: string }[]>(),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

// Submissions (التسليمات)
export const submissions = mysqlTable("submissions", {
  id: int("id").primaryKey().autoincrement(),
  assignmentId: int("assignmentId").notNull(),
  userId: int("userId").notNull(),
  content: mediumtext("content"), // Rich text HTML content
  fileUrl: varchar("fileUrl", { length: 500 }), // Legacy single file
  attachments: json("attachments").$type<Array<{
    name: string;
    url: string;
    mimeType: string;
    size: number;
  }>>(), // Multiple file attachments
  aiScore: int("aiScore"),
  aiGrade: mysqlEnum("aiGrade", ["excellent", "good", "acceptable", "needs_improvement", "insufficient"]),
  aiFeedback: mediumtext("aiFeedback"),
  aiRubricScores: json("aiRubricScores").$type<{ criterion: string; score: number; maxScore: number; feedback: string }[]>(),
  masteryScore: int("masteryScore"),
  status: mysqlEnum("status", ["draft", "submitted", "grading", "graded", "returned"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  gradedAt: timestamp("gradedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

// Submission Comments (تعليقات التسليمات - محادثة بين المدرب والمشارك)
export const submissionComments = mysqlTable("submission_comments", {
  id: int("id").primaryKey().autoincrement(),
  submissionId: int("submissionId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  role: mysqlEnum("role", ["instructor", "participant"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SubmissionComment = typeof submissionComments.$inferSelect;
export type InsertSubmissionComment = typeof submissionComments.$inferInsert;


// ========== Google Classroom Integration ==========

// Google Classroom Connection (ربط Google Classroom)
export const googleClassroomConnections = mysqlTable("google_classroom_connections", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  googleEmail: varchar("googleEmail", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scopes: text("scopes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GoogleClassroomConnection = typeof googleClassroomConnections.$inferSelect;

// Batch-Classroom Course Mapping (ربط الدفعات بالفصول)
export const batchClassroomMappings = mysqlTable("batch_classroom_mappings", {
  id: int("id").primaryKey().autoincrement(),
  batchId: int("batchId").notNull(),
  connectionId: int("connectionId").notNull(),
  googleCourseId: varchar("googleCourseId", { length: 255 }).notNull(),
  googleCourseName: varchar("googleCourseName", { length: 500 }),
  syncAssignments: boolean("syncAssignments").default(true).notNull(),
  syncGrades: boolean("syncGrades").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BatchClassroomMapping = typeof batchClassroomMappings.$inferSelect;

// Assignment-CourseWork Mapping (ربط الواجبات)
export const assignmentClassroomMappings = mysqlTable("assignment_classroom_mappings", {
  id: int("id").primaryKey().autoincrement(),
  assignmentId: int("assignmentId").notNull(),
  mappingId: int("mappingId").notNull(),
  googleCourseWorkId: varchar("googleCourseWorkId", { length: 255 }).notNull(),
  lastGradeSyncAt: timestamp("lastGradeSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AssignmentClassroomMapping = typeof assignmentClassroomMappings.$inferSelect;

// Sync Log (سجل المزامنة)
export const classroomSyncLogs = mysqlTable("classroom_sync_logs", {
  id: int("id").primaryKey().autoincrement(),
  connectionId: int("connectionId").notNull(),
  action: mysqlEnum("action", ["push_assignment", "sync_grades", "pull_roster", "full_sync"]).notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  details: text("details"),
  errorMessage: text("errorMessage"),
  itemsProcessed: int("itemsProcessed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ClassroomSyncLog = typeof classroomSyncLogs.$inferSelect;


// ===== AI DIRECTOR PROJECTS (مشاريع مساعد المخرج بالذكاء الاصطناعي) =====
export const aiDirectorProjects = mysqlTable("ai_director_projects", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  originalScript: text("originalScript").notNull(),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 100 }),
  characterProfile: mysqlEnum("characterProfile", ["teacher", "leader", "custom"]).default("teacher").notNull(),
  customCharacterDesc: text("customCharacterDesc"),
  scenes: json("scenes").$type<Array<{
    sceneNumber: number;
    title: string;
    description: string;
    visualPrompt: string;
    editedPrompt: string | null;
    cameraAngle: string;
    mood: string;
    duration: number; // seconds
    imageUrl: string | null;
    videoUrl: string | null;
    videoStatus: "pending" | "generating" | "completed" | "failed";
    errorMessage: string | null;
  }>>(),
  soundtrack: json("soundtrack").$type<{
    genre: string;
    mood: string;
    suggestion: string;
    url: string | null;
  }>(),
  finalVideoUrl: text("finalVideoUrl"),
  status: mysqlEnum("status", ["draft", "scenes_generated", "images_generating", "videos_generating", "merging", "completed", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AiDirectorProject = typeof aiDirectorProjects.$inferSelect;
export type InsertAiDirectorProject = typeof aiDirectorProjects.$inferInsert;


/**
 * Student profiles table - stores student information for handwriting analysis
 */
export const studentProfiles = mysqlTable("studentProfiles", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(), // teacher user ID
  firstName: varchar("firstName", { length: 100 }).notNull(),
  age: int("age").notNull(), // 5-12
  grade: varchar("grade", { length: 50 }).notNull(), // e.g., "سنة 1 ابتدائي"
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  notes: text("notes"), // teacher observations
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * Handwriting analyses table - stores AI analysis results of student handwriting
 */
export const handwritingAnalyses = mysqlTable("handwritingAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(), // teacher user ID
  studentId: int("studentId"), // optional link to studentProfiles
  
  // Student info (stored directly for cases without profile)
  studentName: varchar("studentName", { length: 100 }),
  studentAge: int("studentAge"),
  studentGrade: varchar("studentGrade", { length: 50 }),
  
  // Image
  imageUrl: text("imageUrl").notNull(), // S3 URL of uploaded handwriting image
  writingType: mysqlEnum("writingType", ["copy", "dictation", "free_expression", "math"]).default("copy").notNull(),
  teacherNotes: text("teacherNotes"),
  
  // Overall score
  overallScore: int("overallScore"), // 0-100
  
  // 7 axis scores (0-100 each)
  letterFormationScore: int("letterFormationScore"),
  sizeProportionScore: int("sizeProportionScore"),
  spacingOrganizationScore: int("spacingOrganizationScore"),
  baselineScore: int("baselineScore"),
  reversalsScore: int("reversalsScore"),
  pressureSpeedScore: int("pressureSpeedScore"),
  consistencyScore: int("consistencyScore"),
  
  // Disorder probabilities
  disorders: json("disorders").$type<Array<{
    name: string;
    nameAr: string;
    probability: "high" | "medium" | "low" | "none";
    indicators: string[];
  }>>(),
  
  // Detailed analysis report (markdown)
  analysisReport: mediumtext("analysisReport"),
  
  // Pedagogical recommendations (markdown)
  recommendations: mediumtext("recommendations"),
  
  // PDF export URL
  pdfUrl: text("pdfUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HandwritingAnalysis = typeof handwritingAnalyses.$inferSelect;
export type InsertHandwritingAnalysis = typeof handwritingAnalyses.$inferInsert;
