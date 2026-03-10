import { eq, and, desc, sql, like, count, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  courses, Course, InsertCourse,
  enrollments, Enrollment, InsertEnrollment,
  exams, Exam, InsertExam,
  questions, Question, InsertQuestion,
  examAttempts, ExamAttempt, InsertExamAttempt,
  answers, Answer, InsertAnswer,
  certificates, Certificate, InsertCertificate,
  videos, Video, InsertVideo,
  videoProgress, VideoProgress, InsertVideoProgress,
  notifications, Notification, InsertNotification,
  pedagogicalSheets, PedagogicalSheet, InsertPedagogicalSheet,
  lessonPlans, LessonPlan, InsertLessonPlan,
  teacherExams, TeacherExam, InsertTeacherExam,
  referenceDocuments, ReferenceDocument, InsertReferenceDocument,
  aiSuggestions, AiSuggestion, InsertAiSuggestion,
  templates, Template, InsertTemplate,
  conversations, Conversation, InsertConversation,
  savedEvaluations, SavedEvaluation, InsertSavedEvaluation
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `${user.openId}@temp.local`, // Provide default email if missing
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      // For email field, ensure it's never null since it's required
      if (field === 'email') {
        const emailValue = value || values.email; // Use existing email if value is null
        values[field] = emailValue;
        updateSet[field] = emailValue;
      } else {
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== COURSES ==========

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).where(eq(courses.isActive, true)).orderBy(courses.createdAt);
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courses).values(course);
  return result;
}

export async function updateCourse(id: number, updates: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courses).set(updates).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting isActive to false
  await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
}

export async function getAllCoursesIncludingInactive() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).orderBy(courses.createdAt);
}

// ========== ENROLLMENTS ==========

export async function enrollUserInCourse(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already enrolled
  const existing = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const result = await db.insert(enrollments).values({
    userId,
    courseId,
    status: "pending"
  });
  return result;
}

export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    enrollment: enrollments,
    course: courses
  })
  .from(enrollments)
  .leftJoin(courses, eq(enrollments.courseId, courses.id))
  .where(eq(enrollments.userId, userId))
  .orderBy(desc(enrollments.enrolledAt));
}

export async function getCourseEnrollments(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    enrollment: enrollments,
    user: users
  })
  .from(enrollments)
  .leftJoin(users, eq(enrollments.userId, users.id))
  .where(eq(enrollments.courseId, courseId))
  .orderBy(desc(enrollments.enrolledAt));
}

export async function getPendingEnrollments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    enrollment: enrollments,
    user: users,
    course: courses
  })
  .from(enrollments)
  .leftJoin(users, eq(enrollments.userId, users.id))
  .leftJoin(courses, eq(enrollments.courseId, courses.id))
  .where(eq(enrollments.status, "pending"))
  .orderBy(desc(enrollments.enrolledAt));
}

export async function approveEnrollment(enrollmentId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(enrollments).set({
    status: "approved",
    approvedBy,
    approvedAt: new Date()
  }).where(eq(enrollments.id, enrollmentId));
}

export async function rejectEnrollment(enrollmentId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(enrollments).set({
    status: "rejected",
    approvedBy,
    approvedAt: new Date()
  }).where(eq(enrollments.id, enrollmentId));
}

export async function getEnrollmentById(id: number): Promise<Enrollment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
  return result[0];
}

// ========== EXAMS ==========

export async function getExamsByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(exams).where(eq(exams.courseId, courseId));
}

export async function getExamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exams).where(eq(exams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createExam(exam: InsertExam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(exams).values(exam);
  
  // Get the inserted exam ID - handle different return formats
  let insertId: number;
  if (result.insertId !== undefined) {
    insertId = Number(result.insertId);
  } else if (result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.lastInsertRowid !== undefined) {
    insertId = Number(result.lastInsertRowid);
  } else {
    // Fallback: get the last inserted ID
    const lastInserted = await db.select().from(exams).orderBy(desc(exams.id)).limit(1);
    if (lastInserted.length === 0) throw new Error("Failed to create exam");
    insertId = lastInserted[0].id;
  }
  
  // Fetch and return the created exam
  const created = await db.select().from(exams).where(eq(exams.id, insertId)).limit(1);
  if (created.length === 0) throw new Error("Failed to retrieve created exam");
  return created[0];
}

export async function updateExam(id: number, updates: Partial<InsertExam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(exams).set(updates).where(eq(exams.id, id));
}

export async function deleteExam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all questions associated with this exam (cascade delete)
  await db.delete(questions).where(eq(questions.examId, id));
  
  // Delete all exam attempts associated with this exam
  await db.delete(examAttempts).where(eq(examAttempts.examId, id));
  
  // Delete the exam itself
  await db.delete(exams).where(eq(exams.id, id));
}

// ========== QUESTIONS ==========

export async function getQuestionsByExamId(examId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions).where(eq(questions.examId, examId)).orderBy(questions.orderIndex);
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuestion(question: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questions).values(question);
  
  // Get the inserted ID
  const insertId = Number((result as any).insertId || (result as any).lastInsertRowid || (result as any)[0]?.insertId);
  if (!insertId || isNaN(insertId)) {
    throw new Error("Failed to get inserted question ID");
  }
  
  return { id: insertId };
}

export async function updateQuestion(id: number, updates: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(questions).set(updates).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questions).where(eq(questions.id, id));
}

// ========== EXAM ATTEMPTS ==========

export async function createExamAttempt(attempt: InsertExamAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(examAttempts).values(attempt);
  return result;
}

export async function getExamAttemptById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(examAttempts).where(eq(examAttempts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateExamAttempt(id: number, updates: Partial<InsertExamAttempt>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(examAttempts).set(updates).where(eq(examAttempts.id, id));
}

export async function getUserExamAttempts(userId: number, examId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examAttempts)
    .where(and(eq(examAttempts.userId, userId), eq(examAttempts.examId, examId)))
    .orderBy(desc(examAttempts.startedAt));
}

export async function getAllExamAttemptsByExam(examId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    attempt: examAttempts,
    user: users
  })
  .from(examAttempts)
  .leftJoin(users, eq(examAttempts.userId, users.id))
  .where(eq(examAttempts.examId, examId))
  .orderBy(desc(examAttempts.startedAt));
}

// ========== ANSWERS ==========

export async function createAnswer(answer: InsertAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(answers).values(answer);
  return result;
}

export async function getAnswersByAttemptId(attemptId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(answers).where(eq(answers.attemptId, attemptId));
}

// ========== STATISTICS ==========

export async function getCourseStatistics(courseId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const enrollmentCount = await db.select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(eq(enrollments.courseId, courseId));
  
  const completedCount = await db.select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, "completed")));
  
  return {
    totalEnrollments: enrollmentCount[0]?.count || 0,
    completedEnrollments: completedCount[0]?.count || 0
  };
}

export async function getExamStatistics(examId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const attempts = await db.select().from(examAttempts)
    .where(and(eq(examAttempts.examId, examId), eq(examAttempts.status, "graded")));
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }
  
  const scores = attempts.map(a => a.score || 0);
  const passedCount = attempts.filter(a => a.passed).length;
  
  return {
    totalAttempts: attempts.length,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    passRate: (passedCount / attempts.length) * 100,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  };
}

// ===== Certificate Functions =====

export async function createCertificate(certificate: InsertCertificate): Promise<Certificate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(certificates).values(certificate);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(certificates).where(eq(certificates.id, insertedId)).limit(1);
  return created[0]!;
}

export async function getCertificateByAttemptId(attemptId: number): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(certificates).where(eq(certificates.examAttemptId, attemptId)).limit(1);
  return result[0];
}

export async function getCertificatesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    certificate: certificates,
    course: courses,
    examAttempt: examAttempts,
  })
  .from(certificates)
  .leftJoin(courses, eq(certificates.courseId, courses.id))
  .leftJoin(examAttempts, eq(certificates.examAttemptId, examAttempts.id))
  .where(eq(certificates.userId, userId))
  .orderBy(desc(certificates.issuedAt));
  
  return result.map(r => ({
    ...r.certificate,
    course: r.course,
    examAttempt: r.examAttempt,
  }));
}

export async function getCertificateById(id: number): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  return result[0];
}

export async function getCertificateByCertificateNumber(certificateNumber: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    certificate: certificates,
    user: users,
    course: courses,
    attempt: examAttempts,
  })
  .from(certificates)
  .leftJoin(users, eq(certificates.userId, users.id))
  .leftJoin(courses, eq(certificates.courseId, courses.id))
  .leftJoin(examAttempts, eq(certificates.examAttemptId, examAttempts.id))
  .where(eq(certificates.certificateNumber, certificateNumber))
  .limit(1);

  return result[0] || null;
}

// ===== Video Functions =====

export async function createVideo(video: InsertVideo): Promise<Video> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(videos).values(video);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(videos).where(eq(videos.id, insertedId)).limit(1);
  return created[0]!;
}

export async function getVideosByCourseId(courseId: number): Promise<Video[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(videos).where(eq(videos.courseId, courseId)).orderBy(videos.orderIndex);
}

export async function getVideoById(id: number): Promise<Video | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result[0];
}

export async function updateVideo(id: number, updates: Partial<InsertVideo>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(videos).set(updates).where(eq(videos.id, id));
}

export async function deleteVideo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(videos).where(eq(videos.id, id));
}

// ===== Video Progress Functions =====

export async function upsertVideoProgress(progress: InsertVideoProgress): Promise<VideoProgress> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if progress exists
  const existing = await db
    .select()
    .from(videoProgress)
    .where(and(eq(videoProgress.userId, progress.userId), eq(videoProgress.videoId, progress.videoId)))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(videoProgress)
      .set({
        watchedDuration: progress.watchedDuration,
        completed: progress.completed,
        lastWatchedAt: new Date(),
      })
      .where(eq(videoProgress.id, existing[0].id));
    
    const updated = await db.select().from(videoProgress).where(eq(videoProgress.id, existing[0].id)).limit(1);
    return updated[0]!;
  } else {
    // Insert new
    const result = await db.insert(videoProgress).values(progress);
    const insertedId = Number(result[0].insertId);
    const created = await db.select().from(videoProgress).where(eq(videoProgress.id, insertedId)).limit(1);
    return created[0]!;
  }
}

export async function getVideoProgress(userId: number, videoId: number): Promise<VideoProgress | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), eq(videoProgress.videoId, videoId)))
    .limit(1);
  
  return result[0];
}

export async function getUserCourseVideoProgress(userId: number, courseId: number): Promise<VideoProgress[]> {
  const db = await getDb();
  if (!db) return [];

  const courseVideos = await getVideosByCourseId(courseId);
  const videoIds = courseVideos.map(v => v.id);

  if (videoIds.length === 0) return [];

  return db
    .select()
    .from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), sql`${videoProgress.videoId} IN (${sql.join(videoIds.map(id => sql`${id}`), sql`, `)})`));
}

export async function hasCompletedAllRequiredVideos(userId: number, courseId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const courseVideos = await getVideosByCourseId(courseId);
  const requiredVideos = courseVideos.filter(v => v.isRequired);

  if (requiredVideos.length === 0) return true;

  const progress = await getUserCourseVideoProgress(userId, courseId);
  const completedVideoIds = new Set(progress.filter(p => p.completed).map(p => p.videoId));

  return requiredVideos.every(v => completedVideoIds.has(v.id));
}

// ===== Notification Functions =====

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(notifications).where(eq(notifications.id, insertedId)).limit(1);
  return created[0]!;
}

export async function getUserNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return Number(result[0]?.count || 0);
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

// Helper function to notify all admins
export async function notifyAllAdmins(notification: Omit<InsertNotification, "userId">): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  
  for (const admin of admins) {
    await createNotification({
      ...notification,
      userId: admin.id,
    });
  }
}

// ============================================
// User Profile Management
// ============================================

export async function completeUserRegistration(
  userId: number, 
  data: {
    firstNameAr: string;
    lastNameAr: string;
    firstNameFr: string;
    lastNameFr: string;
    phone: string;
    idCardNumber: string;
    paymentReceiptUrl: string;
    email: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({
      ...data,
      registrationCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserProfile(
  userId: number,
  updates: {
    firstNameAr?: string;
    lastNameAr?: string;
    firstNameFr?: string;
    lastNameFr?: string;
    phone?: string;
    idCardNumber?: string;
    email?: string;
    schoolName?: string;
    schoolLogo?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ============================================
// Registration Management (for instructors)
// ============================================

export async function getAllRegistrations(filter?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];

  if (filter) {
    const results = await db
      .select()
      .from(users)
      .where(and(
        eq(users.registrationCompleted, true),
        eq(users.registrationStatus, filter)
      ))
      .orderBy(desc(users.createdAt));
    return results;
  } else {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.registrationCompleted, true))
      .orderBy(desc(users.createdAt));
    return results;
  }
}

export async function approveRegistration(userId: number, approvedBy: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user details before update
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  await db.update(users)
    .set({
      registrationStatus: "approved",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Send notification to user
  await createNotification({
    userId,
    titleAr: "تم قبول تسجيلك",
    messageAr: "تم قبول طلب تسجيلك بنجاح. يمكنك الآن الوصول إلى جميع الدورات.",
    type: "enrollment_approved",
  });

  // Send email notification
  const { sendEmail, getApprovalEmailTemplate } = await import('./emailService');
  const userNameAr = `${user[0].firstNameAr || ''} ${user[0].lastNameAr || ''}`.trim();
  const userName = user[0].name || user[0].email;
  await sendEmail({
    to: user[0].email,
    subject: '🎉 مبروك! تم قبول تسجيلك في ليدر أكاديمي',
    html: getApprovalEmailTemplate(userName, userNameAr),
  });
}

export async function rejectRegistration(userId: number, rejectedBy: number, reason?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user details before update
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  await db.update(users)
    .set({
      registrationStatus: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Send notification to user
  await createNotification({
    userId,
    titleAr: "تم رفض تسجيلك",
    messageAr: reason || "تم رفض طلب تسجيلك. يرجى التواصل مع الإدارة للمزيد من المعلومات.",
    type: "enrollment_rejected",
  });

  // Send email notification
  const { sendEmail, getRejectionEmailTemplate } = await import('./emailService');
  const userNameAr = `${user[0].firstNameAr || ''} ${user[0].lastNameAr || ''}`.trim();
  const userName = user[0].name || user[0].email;
  await sendEmail({
    to: user[0].email,
    subject: 'إشعار بخصوص طلب التسجيل',
    html: getRejectionEmailTemplate(userName, userNameAr, reason || undefined),
  });
}

export async function deleteRegistration(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  await db.delete(users).where(eq(users.id, userId));
}

// ============================================
// Pedagogical Tools - المذكرات البيداغوجية
// ============================================

export async function createPedagogicalSheet(data: InsertPedagogicalSheet): Promise<PedagogicalSheet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [sheet] = await db.insert(pedagogicalSheets).values(data).$returningId();
  const [result] = await db.select().from(pedagogicalSheets).where(eq(pedagogicalSheets.id, sheet.id));
  return result;
}

export async function getPedagogicalSheetsByUser(userId: number): Promise<PedagogicalSheet[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pedagogicalSheets)
    .where(eq(pedagogicalSheets.createdBy, userId))
    .orderBy(desc(pedagogicalSheets.createdAt));
}

export async function getPedagogicalSheetById(id: number): Promise<PedagogicalSheet | null> {
  const db = await getDb();
  if (!db) return null;

  const [sheet] = await db.select().from(pedagogicalSheets).where(eq(pedagogicalSheets.id, id)).limit(1);
  return sheet || null;
}

export async function updatePedagogicalSheet(id: number, data: Partial<InsertPedagogicalSheet>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pedagogicalSheets).set(data).where(eq(pedagogicalSheets.id, id));
}

export async function deletePedagogicalSheet(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pedagogicalSheets).where(eq(pedagogicalSheets.id, id));
}

// ============================================
// Lesson Plans - تخطيط الدروس
// ============================================

export async function createLessonPlan(data: InsertLessonPlan): Promise<LessonPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [plan] = await db.insert(lessonPlans).values(data).$returningId();
  const [result] = await db.select().from(lessonPlans).where(eq(lessonPlans.id, plan.id));
  return result;
}

export async function getLessonPlansByUser(userId: number): Promise<LessonPlan[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessonPlans)
    .where(eq(lessonPlans.createdBy, userId))
    .orderBy(desc(lessonPlans.createdAt));
}

export async function getLessonPlanById(id: number): Promise<LessonPlan | null> {
  const db = await getDb();
  if (!db) return null;

  const [plan] = await db.select().from(lessonPlans).where(eq(lessonPlans.id, id)).limit(1);
  return plan || null;
}

export async function updateLessonPlan(id: number, data: Partial<InsertLessonPlan>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(lessonPlans).set(data).where(eq(lessonPlans.id, id));
}

export async function deleteLessonPlan(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(lessonPlans).where(eq(lessonPlans.id, id));
}

// ============================================
// Teacher Exams - اختبارات المدرسين
// ============================================

export async function createTeacherExam(data: InsertTeacherExam): Promise<TeacherExam> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [exam] = await db.insert(teacherExams).values(data).$returningId();
  const [result] = await db.select().from(teacherExams).where(eq(teacherExams.id, exam.id));
  return result;
}

export async function getTeacherExamsByUser(userId: number): Promise<TeacherExam[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(teacherExams)
    .where(eq(teacherExams.createdBy, userId))
    .orderBy(desc(teacherExams.createdAt));
}

export async function getTeacherExamById(id: number): Promise<TeacherExam | null> {
  const db = await getDb();
  if (!db) return null;

  const [exam] = await db.select().from(teacherExams).where(eq(teacherExams.id, id)).limit(1);
  return exam || null;
}

export async function updateTeacherExam(id: number, data: Partial<InsertTeacherExam>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(teacherExams).set(data).where(eq(teacherExams.id, id));
}

export async function deleteTeacherExam(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(teacherExams).where(eq(teacherExams.id, id));
}

// ============================================
// Reference Documents - المراجع الرسمية
// ============================================

export async function createReferenceDocument(data: InsertReferenceDocument): Promise<ReferenceDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [doc] = await db.insert(referenceDocuments).values(data).$returningId();
  const [result] = await db.select().from(referenceDocuments).where(eq(referenceDocuments.id, doc.id));
  return result;
}

export async function getReferenceDocuments(filters?: {
  educationLevel?: string;
  grade?: string;
  subject?: string;
  documentType?: string;
  language?: string;
  searchQuery?: string;
}): Promise<ReferenceDocument[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(referenceDocuments);
  
  const conditions = [];
  if (filters?.educationLevel && filters.educationLevel !== "all") {
    conditions.push(eq(referenceDocuments.educationLevel, filters.educationLevel as any));
  }
  if (filters?.grade && filters.grade !== "all") {
    conditions.push(eq(referenceDocuments.grade, filters.grade));
  }
  if (filters?.subject && filters.subject !== "all") {
    conditions.push(eq(referenceDocuments.subject, filters.subject));
  }
  if (filters?.documentType && filters.documentType !== "all") {
    conditions.push(eq(referenceDocuments.documentType, filters.documentType as any));
  }
  if (filters?.language && filters.language !== "all") {
    conditions.push(eq(referenceDocuments.language, filters.language as any));
  }
  if (filters?.searchQuery) {
    conditions.push(like(referenceDocuments.documentTitle, `%${filters.searchQuery}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(referenceDocuments.uploadedAt));
}

export async function deleteReferenceDocument(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(referenceDocuments).where(eq(referenceDocuments.id, id));
}


// AI Suggestions functions
export async function createAiSuggestion(data: InsertAiSuggestion): Promise<AiSuggestion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [suggestion] = await db.insert(aiSuggestions).values(data).$returningId();
  const [result] = await db.select().from(aiSuggestions).where(eq(aiSuggestions.id, suggestion.id));
  return result;
}

export async function getUserAiSuggestions(userId: number): Promise<AiSuggestion[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(aiSuggestions)
    .where(eq(aiSuggestions.userId, userId))
    .orderBy(desc(aiSuggestions.createdAt));
}

export async function getAiSuggestionById(id: number): Promise<AiSuggestion | null> {
  const db = await getDb();
  if (!db) return null;

  const [suggestion] = await db.select().from(aiSuggestions).where(eq(aiSuggestions.id, id)).limit(1);
  return suggestion || null;
}

export async function searchAiSuggestions(userId: number, filters?: {
  educationLevel?: string;
  grade?: string;
  subject?: string;
}): Promise<AiSuggestion[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(aiSuggestions.userId, userId)];
  
  if (filters?.educationLevel && filters.educationLevel !== "all") {
    conditions.push(eq(aiSuggestions.educationLevel, filters.educationLevel as any));
  }
  if (filters?.grade && filters.grade !== "all") {
    conditions.push(eq(aiSuggestions.grade, filters.grade));
  }
  if (filters?.subject && filters.subject !== "all") {
    conditions.push(eq(aiSuggestions.subject, filters.subject));
  }

  return await db.select().from(aiSuggestions)
    .where(and(...conditions))
    .orderBy(desc(aiSuggestions.createdAt));
}

export async function deleteAiSuggestion(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(aiSuggestions)
    .where(and(eq(aiSuggestions.id, id), eq(aiSuggestions.userId, userId)));
  
  return true;
}

// Templates functions
export async function getTemplates(filters?: {
  educationLevel?: "primary" | "middle" | "secondary";
  grade?: string;
  subject?: string;
  language?: "arabic" | "french" | "english";
}): Promise<Template[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(templates.isPublic, true)];
  
  if (filters?.educationLevel) {
    conditions.push(eq(templates.educationLevel, filters.educationLevel));
  }
  if (filters?.grade) {
    conditions.push(eq(templates.grade, filters.grade));
  }
  if (filters?.subject) {
    conditions.push(eq(templates.subject, filters.subject));
  }
  if (filters?.language) {
    conditions.push(eq(templates.language, filters.language));
  }

  return await db.select().from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.usageCount), desc(templates.createdAt));
}

export async function getTemplateById(id: number): Promise<Template | null> {
  const db = await getDb();
  if (!db) return null;

  const [template] = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return template || null;
}

export async function createTemplate(userId: number, data: Omit<InsertTemplate, "createdBy">): Promise<Template> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [template] = await db.insert(templates).values({
    ...data,
    createdBy: userId,
  }).$returningId();
  
  const [result] = await db.select().from(templates).where(eq(templates.id, template.id));
  return result;
}

export async function incrementTemplateUsage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(templates)
    .set({ usageCount: sql`${templates.usageCount} + 1` })
    .where(eq(templates.id, id));
}

// Conversations functions
export async function saveConversation(userId: number, data: {
  title: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: Array<{
      name: string;
      size: number;
      type: string;
      url: string;
    }>;
    timestamp: number;
  }>;
}): Promise<Conversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [conversation] = await db.insert(conversations).values({
    userId,
    title: data.title,
    messages: data.messages,
    lastMessageAt: new Date(),
  }).$returningId();
  
  const [result] = await db.select().from(conversations).where(eq(conversations.id, conversation.id));
  return result;
}

export async function updateConversation(id: number, userId: number, data: {
  title?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: Array<{
      name: string;
      size: number;
      type: string;
      url: string;
    }>;
    timestamp: number;
  }>;
}): Promise<Conversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(conversations)
    .set({
      ...(data.title && { title: data.title }),
      messages: data.messages,
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, id));
  
  const [result] = await db.select().from(conversations).where(eq(conversations.id, id));
  return result;
}

export async function getUserConversations(userId: number, searchQuery?: string, filterTag?: string): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(conversations.userId, userId)];
  
  // If search query is provided, filter by title OR message content
  if (searchQuery) {
    conditions.push(sql`(${conversations.title} LIKE ${`%${searchQuery}%`} OR JSON_SEARCH(${conversations.messages}, 'one', ${`%${searchQuery}%`}) IS NOT NULL)`);
  }

  // If filterTag is provided, filter conversations that contain this tag in their JSON array
  if (filterTag) {
    conditions.push(sql`JSON_SEARCH(${conversations.tags}, 'one', ${filterTag}) IS NOT NULL`);
  }
  
  // Pinned conversations first, then by lastMessageAt
  return await db.select()
    .from(conversations)
    .where(and(...conditions))
    .orderBy(desc(conversations.isPinned), desc(conversations.lastMessageAt));
}

export async function togglePinConversation(id: number, userId: number, isPinned: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(conversations)
    .set({ isPinned })
    .where(sql`${conversations.id} = ${id} AND ${conversations.userId} = ${userId}`);
  return true;
}

export async function getConversationById(id: number, userId: number): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) return null;

  const [conversation] = await db.select()
    .from(conversations)
    .where(sql`${conversations.id} = ${id} AND ${conversations.userId} = ${userId}`)
    .limit(1);
  
  return conversation || null;
}

export async function deleteConversation(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.delete(conversations)
    .where(sql`${conversations.id} = ${id} AND ${conversations.userId} = ${userId}`);
  
  return true;
}

export async function updateConversationTags(id: number, userId: number, tags: string[]): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(conversations)
    .set({ tags })
    .where(sql`${conversations.id} = ${id} AND ${conversations.userId} = ${userId}`);
  return true;
}

// ─── Saved Evaluations (مكتبة التقييمات) ─────────────────────────────────────
export async function savePedagogicalEvaluation(data: {
  userId: number;
  title: string;
  subject?: string;
  level?: string;
  trimester?: string;
  evaluationType?: string;
  schoolYear?: string;
  schoolName?: string;
  teacherName?: string;
  totalPoints?: number;
  variant?: string;
  evaluationData: Record<string, unknown>;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(savedEvaluations).values({
    userId: data.userId,
    title: data.title,
    subject: data.subject,
    level: data.level,
    trimester: data.trimester,
    evaluationType: data.evaluationType,
    schoolYear: data.schoolYear,
    schoolName: data.schoolName,
    teacherName: data.teacherName,
    totalPoints: data.totalPoints ?? 20,
    variant: data.variant ?? "A",
    evaluationData: data.evaluationData,
  });
  return Number((result as any).insertId ?? 0);
}

export async function listPedagogicalEvaluations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: savedEvaluations.id,
    title: savedEvaluations.title,
    subject: savedEvaluations.subject,
    level: savedEvaluations.level,
    trimester: savedEvaluations.trimester,
    evaluationType: savedEvaluations.evaluationType,
    schoolYear: savedEvaluations.schoolYear,
    schoolName: savedEvaluations.schoolName,
    teacherName: savedEvaluations.teacherName,
    totalPoints: savedEvaluations.totalPoints,
    variant: savedEvaluations.variant,
    createdAt: savedEvaluations.createdAt,
  }).from(savedEvaluations)
    .where(sql`${savedEvaluations.userId} = ${userId}`)
    .orderBy(sql`${savedEvaluations.createdAt} DESC`)
    .limit(200);
}

export async function getPedagogicalEvaluation(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(savedEvaluations)
    .where(sql`${savedEvaluations.id} = ${id} AND ${savedEvaluations.userId} = ${userId}`)
    .limit(1);
  return row || null;
}

export async function deletePedagogicalEvaluation(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(savedEvaluations)
    .where(sql`${savedEvaluations.id} = ${id} AND ${savedEvaluations.userId} = ${userId}`);
  return true;
}


// ============================================
// Digitized Documents - رقمنة الوثائق التعليمية (Legacy Digitizer)
// ============================================

import { digitizedDocuments, DigitizedDocument, InsertDigitizedDocument } from "../drizzle/schema";

export async function createDigitizedDocument(data: InsertDigitizedDocument): Promise<DigitizedDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [doc] = await db.insert(digitizedDocuments).values(data).$returningId();
  const [result] = await db.select().from(digitizedDocuments).where(eq(digitizedDocuments.id, doc.id));
  return result;
}

export async function getDigitizedDocumentsByUser(userId: number): Promise<DigitizedDocument[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(digitizedDocuments)
    .where(eq(digitizedDocuments.userId, userId))
    .orderBy(desc(digitizedDocuments.createdAt));
}

export async function getDigitizedDocumentById(id: number, userId: number): Promise<DigitizedDocument | null> {
  const db = await getDb();
  if (!db) return null;

  const [doc] = await db.select().from(digitizedDocuments)
    .where(sql`${digitizedDocuments.id} = ${id} AND ${digitizedDocuments.userId} = ${userId}`)
    .limit(1);
  return doc || null;
}

export async function updateDigitizedDocument(id: number, userId: number, data: Partial<InsertDigitizedDocument>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(digitizedDocuments).set(data)
    .where(sql`${digitizedDocuments.id} = ${id} AND ${digitizedDocuments.userId} = ${userId}`);
}

export async function deleteDigitizedDocument(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(digitizedDocuments)
    .where(sql`${digitizedDocuments.id} = ${id} AND ${digitizedDocuments.userId} = ${userId}`);
  return true;
}


// ===== TEACHER PORTFOLIO HELPERS =====
import { teacherPortfolios, InsertTeacherPortfolio, TeacherPortfolio, generatedImages, sharedEvaluations } from "../drizzle/schema";

export async function getOrCreatePortfolio(userId: number): Promise<TeacherPortfolio> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [existing] = await db.select().from(teacherPortfolios)
    .where(eq(teacherPortfolios.userId, userId))
    .limit(1);

  if (existing) return existing;

  // Create new portfolio with a unique public token
  const { nanoid } = await import("nanoid");
  const publicToken = nanoid(32);

  await db.insert(teacherPortfolios).values({
    userId,
    publicToken,
    isPublic: false,
    totalLessonPlans: 0,
    totalExams: 0,
    totalImages: 0,
    totalCertificates: 0,
    totalEvaluations: 0,
    totalDigitizedDocs: 0,
    totalConversations: 0,
  });

  const [created] = await db.select().from(teacherPortfolios)
    .where(eq(teacherPortfolios.userId, userId))
    .limit(1);

  return created;
}

export async function updatePortfolio(userId: number, data: Partial<InsertTeacherPortfolio>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(teacherPortfolios).set(data)
    .where(eq(teacherPortfolios.userId, userId));
}

export async function getPortfolioByToken(token: string): Promise<(TeacherPortfolio & { userName: string | null; userEmail: string }) | null> {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.select({
    portfolio: teacherPortfolios,
    userName: users.name,
    userEmail: users.email,
    arabicName: users.arabicName,
    schoolName: users.schoolName,
  }).from(teacherPortfolios)
    .innerJoin(users, eq(teacherPortfolios.userId, users.id))
    .where(and(
      eq(teacherPortfolios.publicToken, token),
      eq(teacherPortfolios.isPublic, true),
    ))
    .limit(1);

  if (!result) return null;

  return {
    ...result.portfolio,
    userName: result.arabicName || result.userName,
    userEmail: result.userEmail,
  };
}

export async function computePortfolioStats(userId: number): Promise<{
  totalLessonPlans: number;
  totalExams: number;
  totalImages: number;
  totalCertificates: number;
  totalEvaluations: number;
  totalDigitizedDocs: number;
  totalConversations: number;
  subjectBreakdown: Record<string, number>;
  lessonPlansBySubject: Record<string, number>;
  examsBySubject: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Count lesson plans (pedagogicalSheets + aiSuggestions)
  const [sheetsCount] = await db.select({ count: count() }).from(pedagogicalSheets)
    .where(eq(pedagogicalSheets.createdBy, userId));
  const [suggestionsCount] = await db.select({ count: count() }).from(aiSuggestions)
    .where(eq(aiSuggestions.userId, userId));
  const totalLessonPlans = (sheetsCount?.count || 0) + (suggestionsCount?.count || 0);

  // Count exams (teacherExams + savedEvaluations)
  const [teacherExamsCount] = await db.select({ count: count() }).from(teacherExams)
    .where(eq(teacherExams.createdBy, userId));
  const [savedEvalsCount] = await db.select({ count: count() }).from(savedEvaluations)
    .where(eq(savedEvaluations.userId, userId));
  const totalExams = (teacherExamsCount?.count || 0) + (savedEvalsCount?.count || 0);

  // Count generated images
  const [imagesCount] = await db.select({ count: count() }).from(generatedImages)
    .where(eq(generatedImages.userId, userId));
  const totalImages = imagesCount?.count || 0;

  // Count certificates
  const [certsCount] = await db.select({ count: count() }).from(certificates)
    .where(eq(certificates.userId, userId));
  const totalCertificates = certsCount?.count || 0;

  // Count evaluations (shared evaluations)
  const [sharedEvalsCount] = await db.select({ count: count() }).from(sharedEvaluations)
    .where(eq(sharedEvaluations.userId, userId));
  const totalEvaluations = sharedEvalsCount?.count || 0;

  // Count digitized documents
  const [digiDocsCount] = await db.select({ count: count() }).from(digitizedDocuments)
    .where(eq(digitizedDocuments.userId, userId));
  const totalDigitizedDocs = digiDocsCount?.count || 0;

  // Count conversations
  const [convsCount] = await db.select({ count: count() }).from(conversations)
    .where(eq(conversations.userId, userId));
  const totalConversations = convsCount?.count || 0;

  // Subject breakdown from lesson plans
  const lessonPlansBySubject: Record<string, number> = {};
  const sheets = await db.select({ subject: pedagogicalSheets.subject }).from(pedagogicalSheets)
    .where(eq(pedagogicalSheets.createdBy, userId));
  for (const s of sheets) {
    if (s.subject) {
      lessonPlansBySubject[s.subject] = (lessonPlansBySubject[s.subject] || 0) + 1;
    }
  }
  const suggestions = await db.select({ subject: aiSuggestions.subject }).from(aiSuggestions)
    .where(eq(aiSuggestions.userId, userId));
  for (const s of suggestions) {
    if (s.subject) {
      lessonPlansBySubject[s.subject] = (lessonPlansBySubject[s.subject] || 0) + 1;
    }
  }

  // Subject breakdown from exams
  const examsBySubject: Record<string, number> = {};
  const tExams = await db.select({ subject: teacherExams.subject }).from(teacherExams)
    .where(eq(teacherExams.createdBy, userId));
  for (const e of tExams) {
    if (e.subject) {
      examsBySubject[e.subject] = (examsBySubject[e.subject] || 0) + 1;
    }
  }

  // Merge subject breakdown
  const subjectBreakdown: Record<string, number> = {};
  for (const [subj, cnt] of Object.entries(lessonPlansBySubject)) {
    subjectBreakdown[subj] = (subjectBreakdown[subj] || 0) + cnt;
  }
  for (const [subj, cnt] of Object.entries(examsBySubject)) {
    subjectBreakdown[subj] = (subjectBreakdown[subj] || 0) + cnt;
  }

  return {
    totalLessonPlans,
    totalExams,
    totalImages,
    totalCertificates,
    totalEvaluations,
    totalDigitizedDocs,
    totalConversations,
    subjectBreakdown,
    lessonPlansBySubject,
    examsBySubject,
  };
}


// ===== CURRICULUM MAP HELPERS =====
import { curriculumPlans, curriculumTopics, teacherCurriculumProgress, type CurriculumPlan, type InsertCurriculumPlan, type CurriculumTopic, type InsertCurriculumTopic, type TeacherCurriculumProgress, type InsertTeacherCurriculumProgress } from "../drizzle/schema";

export async function createCurriculumPlan(data: InsertCurriculumPlan): Promise<CurriculumPlan | null> {
  const database = await getDb();
  if (!database) return null;
  const [inserted] = await database.insert(curriculumPlans).values(data).$returningId();
  const [plan] = await database.select().from(curriculumPlans).where(eq(curriculumPlans.id, inserted.id));
  return plan || null;
}

export async function getCurriculumPlansByUser(userId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(curriculumPlans)
    .where(and(eq(curriculumPlans.createdBy, userId), eq(curriculumPlans.isActive, true)))
    .orderBy(desc(curriculumPlans.createdAt));
}

export async function getCurriculumPlanById(planId: number) {
  const database = await getDb();
  if (!database) return null;
  const [plan] = await database.select().from(curriculumPlans).where(eq(curriculumPlans.id, planId));
  return plan || null;
}

export async function getOfficialPlans(grade: string, subject: string) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(curriculumPlans)
    .where(and(
      eq(curriculumPlans.grade, grade),
      eq(curriculumPlans.subject, subject),
      eq(curriculumPlans.isOfficial, true),
      eq(curriculumPlans.isActive, true),
    ))
    .orderBy(desc(curriculumPlans.createdAt));
}

export async function getAvailablePlans(grade?: string, subject?: string) {
  const database = await getDb();
  if (!database) return [];
  const conditions = [eq(curriculumPlans.isActive, true)];
  if (grade) conditions.push(eq(curriculumPlans.grade, grade));
  if (subject) conditions.push(eq(curriculumPlans.subject, subject));
  return database.select().from(curriculumPlans)
    .where(and(...conditions))
    .orderBy(desc(curriculumPlans.createdAt));
}

export async function addCurriculumTopics(topics: InsertCurriculumTopic[]) {
  const database = await getDb();
  if (!database) return [];
  if (topics.length === 0) return [];
  await database.insert(curriculumTopics).values(topics);
  return database.select().from(curriculumTopics)
    .where(eq(curriculumTopics.planId, topics[0].planId))
    .orderBy(curriculumTopics.orderIndex);
}

export async function getTopicsByPlan(planId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(curriculumTopics)
    .where(eq(curriculumTopics.planId, planId))
    .orderBy(curriculumTopics.orderIndex);
}

export async function getTopicsByPeriod(planId: number, periodNumber: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(curriculumTopics)
    .where(and(
      eq(curriculumTopics.planId, planId),
      eq(curriculumTopics.periodNumber, periodNumber),
    ))
    .orderBy(curriculumTopics.orderIndex);
}

export async function findTopicByTitle(planId: number, topicTitle: string) {
  const database = await getDb();
  if (!database) return null;
  const [topic] = await database.select().from(curriculumTopics)
    .where(and(
      eq(curriculumTopics.planId, planId),
      like(curriculumTopics.topicTitle, `%${topicTitle}%`),
    ));
  return topic || null;
}

export async function getUserProgress(userId: number, planId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, userId),
      eq(teacherCurriculumProgress.planId, planId),
    ));
}

export async function upsertProgress(data: InsertTeacherCurriculumProgress) {
  const database = await getDb();
  if (!database) return null;
  // Check if progress already exists
  const existing = await database.select().from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, data.userId),
      eq(teacherCurriculumProgress.planId, data.planId),
      eq(teacherCurriculumProgress.topicId, data.topicId),
    ));
  if (existing.length > 0) {
    await database.update(teacherCurriculumProgress)
      .set({
        status: data.status,
        linkedLessonPlanId: data.linkedLessonPlanId,
        linkedExamId: data.linkedExamId,
        linkedEvaluationId: data.linkedEvaluationId,
        teacherNotes: data.teacherNotes,
        completedAt: data.status === "completed" ? new Date() : null,
      })
      .where(eq(teacherCurriculumProgress.id, existing[0].id));
    const [updated] = await database.select().from(teacherCurriculumProgress)
      .where(eq(teacherCurriculumProgress.id, existing[0].id));
    return updated;
  } else {
    const [inserted] = await database.insert(teacherCurriculumProgress).values(data).$returningId();
    const [progress] = await database.select().from(teacherCurriculumProgress)
      .where(eq(teacherCurriculumProgress.id, inserted.id));
    return progress;
  }
}

export async function getCoverageStats(userId: number, planId: number) {
  const database = await getDb();
  if (!database) return { total: 0, completed: 0, inProgress: 0, percentage: 0 };
  
  const totalTopics = await database.select({ count: count() }).from(curriculumTopics)
    .where(eq(curriculumTopics.planId, planId));
  
  const completedTopics = await database.select({ count: count() }).from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, userId),
      eq(teacherCurriculumProgress.planId, planId),
      eq(teacherCurriculumProgress.status, "completed"),
    ));
  
  const inProgressTopics = await database.select({ count: count() }).from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, userId),
      eq(teacherCurriculumProgress.planId, planId),
      eq(teacherCurriculumProgress.status, "in_progress"),
    ));
  
  const total = totalTopics[0]?.count || 0;
  const completed = completedTopics[0]?.count || 0;
  const inProgress = inProgressTopics[0]?.count || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, inProgress, percentage };
}

export async function getNextSuggestedTopics(userId: number, planId: number, limit = 3) {
  const database = await getDb();
  if (!database) return [];
  
  // Get all topics for this plan
  const allTopics = await database.select().from(curriculumTopics)
    .where(eq(curriculumTopics.planId, planId))
    .orderBy(curriculumTopics.orderIndex);
  
  // Get completed/in-progress topic IDs
  const progress = await database.select().from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, userId),
      eq(teacherCurriculumProgress.planId, planId),
      or(
        eq(teacherCurriculumProgress.status, "completed"),
        eq(teacherCurriculumProgress.status, "in_progress"),
      ),
    ));
  
  const doneTopicIds = new Set(progress.map(p => p.topicId));
  
  // Return next uncovered topics
  return allTopics.filter(t => !doneTopicIds.has(t.id)).slice(0, limit);
}

export async function deleteCurriculumPlan(planId: number) {
  const database = await getDb();
  if (!database) return false;
  await database.update(curriculumPlans)
    .set({ isActive: false })
    .where(eq(curriculumPlans.id, planId));
  return true;
}

export async function updateCurriculumPlanTotalTopics(planId: number) {
  const database = await getDb();
  if (!database) return;
  const [result] = await database.select({ count: count() }).from(curriculumTopics)
    .where(eq(curriculumTopics.planId, planId));
  await database.update(curriculumPlans)
    .set({ totalTopics: result?.count || 0 })
    .where(eq(curriculumPlans.id, planId));
}

export async function getCoverageByCurriculumPeriod(userId: number, planId: number) {
  const database = await getDb();
  if (!database) return [];
  
  // Get all topics grouped by period
  const allTopics = await database.select().from(curriculumTopics)
    .where(eq(curriculumTopics.planId, planId))
    .orderBy(curriculumTopics.periodNumber, curriculumTopics.orderIndex);
  
  // Get user progress
  const progress = await database.select().from(teacherCurriculumProgress)
    .where(and(
      eq(teacherCurriculumProgress.userId, userId),
      eq(teacherCurriculumProgress.planId, planId),
    ));
  
  const progressMap = new Map(progress.map(p => [p.topicId, p]));
  
  // Group by period
  const periods: Record<number, { periodName: string; total: number; completed: number; topics: Array<typeof allTopics[0] & { progress?: typeof progress[0] }> }> = {};
  
  for (const topic of allTopics) {
    if (!periods[topic.periodNumber]) {
      periods[topic.periodNumber] = {
        periodName: topic.periodName || `الفترة ${topic.periodNumber}`,
        total: 0,
        completed: 0,
        topics: [],
      };
    }
    periods[topic.periodNumber].total++;
    const prog = progressMap.get(topic.id);
    if (prog?.status === "completed") periods[topic.periodNumber].completed++;
    periods[topic.periodNumber].topics.push({ ...topic, progress: prog });
  }
  
  return Object.entries(periods).map(([num, data]) => ({
    periodNumber: parseInt(num),
    ...data,
    percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }));
}


// ==================== GRADING SESSIONS ====================
import { gradingSessions, GradingSession, InsertGradingSession, studentSubmissions, StudentSubmission, InsertStudentSubmission } from "../drizzle/schema";

export async function createGradingSession(data: InsertGradingSession): Promise<GradingSession | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(gradingSessions).values(data);
  const id = result[0].insertId;
  const rows = await db.select().from(gradingSessions).where(eq(gradingSessions.id, id));
  return rows[0] || null;
}

export async function getGradingSessionsByUser(userId: number): Promise<GradingSession[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(gradingSessions)
    .where(eq(gradingSessions.createdBy, userId))
    .orderBy(desc(gradingSessions.createdAt));
}

export async function getGradingSessionById(sessionId: number): Promise<GradingSession | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(gradingSessions).where(eq(gradingSessions.id, sessionId));
  return rows[0] || null;
}

export async function updateGradingSession(sessionId: number, data: Partial<InsertGradingSession>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(gradingSessions).set(data).where(eq(gradingSessions.id, sessionId));
  return true;
}

export async function deleteGradingSession(sessionId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  // Delete all submissions first
  await db.delete(studentSubmissions).where(eq(studentSubmissions.sessionId, sessionId));
  await db.delete(gradingSessions).where(eq(gradingSessions.id, sessionId));
  return true;
}

// ==================== STUDENT SUBMISSIONS ====================

export async function createStudentSubmission(data: InsertStudentSubmission): Promise<StudentSubmission | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(studentSubmissions).values(data);
  const id = result[0].insertId;
  const rows = await db.select().from(studentSubmissions).where(eq(studentSubmissions.id, id));
  return rows[0] || null;
}

export async function getSubmissionsBySession(sessionId: number): Promise<StudentSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studentSubmissions)
    .where(eq(studentSubmissions.sessionId, sessionId))
    .orderBy(studentSubmissions.studentNumber);
}

export async function getSubmissionById(submissionId: number): Promise<StudentSubmission | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(studentSubmissions).where(eq(studentSubmissions.id, submissionId));
  return rows[0] || null;
}

export async function updateStudentSubmission(submissionId: number, data: Partial<InsertStudentSubmission>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(studentSubmissions).set(data).where(eq(studentSubmissions.id, submissionId));
  return true;
}

export async function deleteStudentSubmission(submissionId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(studentSubmissions).where(eq(studentSubmissions.id, submissionId));
  return true;
}

export async function getSessionStats(sessionId: number): Promise<{ total: number; graded: number; reviewed: number; finalized: number }> {
  const db = await getDb();
  if (!db) return { total: 0, graded: 0, reviewed: 0, finalized: 0 };
  const all = await db.select().from(studentSubmissions).where(eq(studentSubmissions.sessionId, sessionId));
  return {
    total: all.length,
    graded: all.filter(s => s.status === "ai_graded" || s.status === "teacher_reviewed" || s.status === "finalized").length,
    reviewed: all.filter(s => s.status === "teacher_reviewed" || s.status === "finalized").length,
    finalized: all.filter(s => s.status === "finalized").length,
  };
}


// ===== MARKETPLACE HELPERS =====
import { marketplaceItems, MarketplaceItem, InsertMarketplaceItem, marketplaceRatings, MarketplaceRating, InsertMarketplaceRating, marketplaceDownloads } from "../drizzle/schema";

export async function createMarketplaceItem(data: InsertMarketplaceItem): Promise<MarketplaceItem | null> {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(marketplaceItems).values(data).$returningId();
  const [item] = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, result.id));
  return item || null;
}

export async function getMarketplaceItemById(id: number): Promise<MarketplaceItem | null> {
  const db = await getDb();
  if (!db) return null;
  const [item] = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, id));
  return item || null;
}

export async function listMarketplaceItems(filters: {
  contentType?: string;
  subject?: string;
  grade?: string;
  educationLevel?: string;
  period?: string;
  difficulty?: string;
  search?: string;
  publishedBy?: number;
  status?: string;
  sortBy?: "ranking" | "newest" | "rating" | "downloads";
  limit?: number;
  offset?: number;
}): Promise<{ items: MarketplaceItem[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: any[] = [];
  
  // Default to approved items unless specific status requested
  if (filters.status) {
    conditions.push(eq(marketplaceItems.status, filters.status as any));
  } else {
    conditions.push(eq(marketplaceItems.status, "approved"));
  }

  if (filters.contentType) conditions.push(eq(marketplaceItems.contentType, filters.contentType as any));
  if (filters.subject) conditions.push(eq(marketplaceItems.subject, filters.subject));
  if (filters.grade) conditions.push(eq(marketplaceItems.grade, filters.grade));
  if (filters.educationLevel) conditions.push(eq(marketplaceItems.educationLevel, filters.educationLevel as any));
  if (filters.period) conditions.push(eq(marketplaceItems.period, filters.period));
  if (filters.difficulty) conditions.push(eq(marketplaceItems.difficulty, filters.difficulty as any));
  if (filters.publishedBy) conditions.push(eq(marketplaceItems.publishedBy, filters.publishedBy));
  if (filters.search) {
    conditions.push(
      or(
        like(marketplaceItems.title, `%${filters.search}%`),
        like(marketplaceItems.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db.select({ value: count() }).from(marketplaceItems).where(whereClause);
  const total = countResult?.value || 0;

  // Determine sort order
  let orderBy;
  switch (filters.sortBy) {
    case "newest": orderBy = desc(marketplaceItems.createdAt); break;
    case "rating": orderBy = desc(marketplaceItems.averageRating); break;
    case "downloads": orderBy = desc(marketplaceItems.totalDownloads); break;
    case "ranking": default: orderBy = desc(marketplaceItems.rankingScore); break;
  }

  const items = await db.select().from(marketplaceItems)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);

  return { items, total };
}

export async function updateMarketplaceItem(id: number, data: Partial<InsertMarketplaceItem>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(marketplaceItems).set(data).where(eq(marketplaceItems.id, id));
  return true;
}

export async function deleteMarketplaceItem(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));
  return true;
}

// Ratings
export async function createRating(data: InsertMarketplaceRating): Promise<MarketplaceRating | null> {
  const db = await getDb();
  if (!db) return null;
  // Check if user already rated this item
  const [existing] = await db.select().from(marketplaceRatings)
    .where(and(eq(marketplaceRatings.itemId, data.itemId), eq(marketplaceRatings.userId, data.userId)));
  
  if (existing) {
    // Update existing rating
    await db.update(marketplaceRatings).set({ rating: data.rating, review: data.review }).where(eq(marketplaceRatings.id, existing.id));
    const [updated] = await db.select().from(marketplaceRatings).where(eq(marketplaceRatings.id, existing.id));
    return updated || null;
  }
  
  const [result] = await db.insert(marketplaceRatings).values(data).$returningId();
  const [rating] = await db.select().from(marketplaceRatings).where(eq(marketplaceRatings.id, result.id));
  return rating || null;
}

export async function getItemRatings(itemId: number): Promise<MarketplaceRating[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceRatings)
    .where(eq(marketplaceRatings.itemId, itemId))
    .orderBy(desc(marketplaceRatings.createdAt));
}

export async function recalculateItemRating(itemId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const ratings = await db.select().from(marketplaceRatings).where(eq(marketplaceRatings.itemId, itemId));
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
  
  // Recalculate ranking score: 40% AI score + 30% rating + 30% popularity
  const [item] = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, itemId));
  if (item) {
    const aiScore = (item.aiInspectorScore || 0) / 100; // normalize to 0-1
    const ratingScore = avgRating / 5; // normalize to 0-1
    const popularityScore = Math.min((item.totalDownloads + item.totalViews * 0.1) / 100, 1); // normalize
    const rankingScore = (aiScore * 0.4 + ratingScore * 0.3 + popularityScore * 0.3) * 100;
    
    await db.update(marketplaceItems).set({
      averageRating: avgRating.toFixed(2),
      totalRatings,
      rankingScore: rankingScore.toFixed(4),
    }).where(eq(marketplaceItems.id, itemId));
  }
}

// Downloads tracking
export async function recordDownload(itemId: number, userId: number, format: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(marketplaceDownloads).values({ itemId, userId, format });
  await db.update(marketplaceItems).set({
    totalDownloads: sql`${marketplaceItems.totalDownloads} + 1`,
  }).where(eq(marketplaceItems.id, itemId));
}

export async function incrementItemViews(itemId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(marketplaceItems).set({
    totalViews: sql`${marketplaceItems.totalViews} + 1`,
  }).where(eq(marketplaceItems.id, itemId));
}

export async function getUserMarketplaceItems(userId: number): Promise<MarketplaceItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceItems)
    .where(eq(marketplaceItems.publishedBy, userId))
    .orderBy(desc(marketplaceItems.createdAt));
}

export async function getMarketplaceStats(): Promise<{
  totalItems: number;
  totalDownloads: number;
  totalContributors: number;
  topSubjects: Array<{ subject: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) return { totalItems: 0, totalDownloads: 0, totalContributors: 0, topSubjects: [] };
  
  const [itemCount] = await db.select({ value: count() }).from(marketplaceItems).where(eq(marketplaceItems.status, "approved"));
  const allItems = await db.select().from(marketplaceItems).where(eq(marketplaceItems.status, "approved"));
  const totalDownloads = allItems.reduce((sum, item) => sum + item.totalDownloads, 0);
  const contributors = new Set(allItems.map(item => item.publishedBy));
  
  // Top subjects
  const subjectMap: Record<string, number> = {};
  allItems.forEach(item => {
    subjectMap[item.subject] = (subjectMap[item.subject] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectMap)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalItems: itemCount?.value || 0,
    totalDownloads,
    totalContributors: contributors.size,
    topSubjects,
  };
}
