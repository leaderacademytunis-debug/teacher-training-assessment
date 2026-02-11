import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  courses, Course, InsertCourse,
  enrollments, Enrollment, InsertEnrollment,
  exams, Exam, InsertExam,
  questions, Question, InsertQuestion,
  examAttempts, ExamAttempt, InsertExamAttempt,
  answers, Answer, InsertAnswer
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
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
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
    status: "active"
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
  const result = await db.insert(exams).values(exam);
  return result;
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

export async function createQuestion(question: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questions).values(question);
  return result;
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
