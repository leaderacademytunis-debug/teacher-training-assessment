import { eq, and, desc, sql } from "drizzle-orm";
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
  notifications, Notification, InsertNotification
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
    subject: '🎉 مبروك! تم قبول تسجيلك في منصة تأهيل المدرسين',
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
