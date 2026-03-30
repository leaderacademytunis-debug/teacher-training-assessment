/**
 * Courses Management Router - Real database operations
 * Provides CRUD operations for courses and enrollment management
 */

import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { trackCompetencyPoints } from "../db";
import {
  courses,
  enrollments,
  users,
  certificates,
  notifications,
} from "../../drizzle/schema";
import { eq, desc, asc, and, sql, count, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { storagePut } from "../storage";

// Admin-only procedure
const adminOnlyProcedure = staffProcedure;

export const coursesManagementRouter = router({
  // ============================================
  // GET COURSES
  // ============================================

  getAllCourses: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    const allCourses = await database
      .select({
        id: courses.id,
        titleAr: courses.titleAr,
        descriptionAr: courses.descriptionAr,
        price: courses.price,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .orderBy(desc(courses.createdAt));

    // Get enrollment count for each course
    const enrollmentCounts = await database
      .select({
        courseId: enrollments.courseId,
        count: count().as("count"),
      })
      .from(enrollments)
      .groupBy(enrollments.courseId);

    const enrollmentMap = new Map(enrollmentCounts.map((e) => [e.courseId, e.count]));

    return allCourses.map((course) => ({
      ...course,
      enrollmentCount: enrollmentMap.get(course.id) || 0,
    }));
  }),

  getCourseById: adminOnlyProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const database = (await getDb())!;

      const course = await database
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);

      if (!course.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "التكوين غير موجود",
        });
      }

      return course[0];
    }),

  // ============================================
  // CREATE COURSE
  // ============================================

  createCourse: adminOnlyProcedure
    .input(
      z.object({
        titleAr: z.string().min(1, "عنوان التكوين مطلوب"),
        descriptionAr: z.string().optional(),
        price: z.number().default(0),
        duration: z.number().optional(),
        coverImageBase64: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;
      let coverImageUrl = "";

      // Upload cover image to S3 if provided
      if (input.coverImageBase64) {
        try {
          const buffer = Buffer.from(input.coverImageBase64, "base64");
          const fileKey = `courses/covers/${nanoid()}.jpg`;
          const uploadResult = await storagePut(fileKey, buffer, "image/jpeg");
          coverImageUrl = uploadResult.url;
        } catch (error) {
          console.error("Error uploading cover image:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل رفع صورة الغلاف",
          });
        }
      }

      const result = await database.insert(courses).values({
        titleAr: input.titleAr,
        descriptionAr: input.descriptionAr,
        price: input.price,
        duration: input.duration,
        coverImageUrl: coverImageUrl,
        isActive: input.isActive,
        createdBy: ctx.user.id,
        category: "digital_teacher_ai",
      });

      return {
        success: true,
        courseId: result[0],
        coverImageUrl: coverImageUrl,
      };
    }),

  // ============================================
  // UPDATE COURSE
  // ============================================

  updateCourse: adminOnlyProcedure
    .input(
      z.object({
        courseId: z.number(),
        titleAr: z.string().optional(),
        descriptionAr: z.string().optional(),
        price: z.number().optional(),
        duration: z.number().optional(),
        coverImageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;

      const { courseId, ...updateData } = input;

      await database
        .update(courses)
        .set(updateData)
        .where(eq(courses.id, courseId));

      return { success: true };
    }),

  // ============================================
  // DELETE COURSE
  // ============================================

  deleteCourse: adminOnlyProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;

      // Check if course has enrollments
      const enrollmentCount = await database
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.courseId, input.courseId));

      if (enrollmentCount[0]?.count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف تكوين به مسجلون",
        });
      }

      await database.delete(courses).where(eq(courses.id, input.courseId));

      return { success: true };
    }),

  // ============================================
  // ENROLLMENT MANAGEMENT
  // ============================================

  getEnrollments: adminOnlyProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const database = (await getDb())!;

      const courseEnrollments = await database
        .select({
          id: enrollments.id,
          userId: enrollments.userId,
          userName: users.name,
          email: users.email,
          status: enrollments.status,
          enrolledAt: enrollments.enrolledAt,
          completedAt: enrollments.completedAt,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .where(eq(enrollments.courseId, input.courseId))
        .orderBy(desc(enrollments.enrolledAt));

      // Get completion rate for each user
      const completionRates = await Promise.all(
        courseEnrollments.map(async (enrollment) => {
          const certificateCount = await database
            .select({ count: count() })
            .from(certificates)
            .where(
              and(
                eq(certificates.userId, enrollment.userId),
                eq(certificates.courseId, input.courseId)
              )
            );

          return {
            ...enrollment,
            hasCertificate: certificateCount[0]?.count > 0,
            completionRate: enrollment.status === "completed" ? 100 : 50,
          };
        })
      );

      return completionRates;
    }),

  // ============================================
  // SEND MESSAGE TO ENROLLEES
  // ============================================

  sendMessageToEnrollees: adminOnlyProcedure
    .input(
      z.object({
        courseId: z.number(),
        message: z.string().min(1, "الرسالة مطلوبة"),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;

      // Get all enrolled users
      const enrolledUsers = await database
        .select({ userId: enrollments.userId })
        .from(enrollments)
        .where(eq(enrollments.courseId, input.courseId));

      if (enrolledUsers.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يوجد مسجلون في هذا التكوين",
        });
      }

      // Create notifications for each user
      const notificationsToCreate = enrolledUsers.map((enrollment) => ({
        userId: enrollment.userId,
        titleAr: input.subject || "رسالة من المدرب",
        messageAr: input.message,
        type: "system" as const,
        relatedId: input.courseId,
      }));

      await database.insert(notifications).values(notificationsToCreate);

      return {
        success: true,
        messagesSent: enrolledUsers.length,
      };
    }),

  // ============================================
  // APPROVE/REJECT ENROLLMENT
  // ============================================

  approveEnrollment: adminOnlyProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;

      // Get enrollment details to find the user
      const enrollment = await database
        .select()
        .from(enrollments)
        .where(eq(enrollments.id, input.enrollmentId))
        .limit(1);

      if (!enrollment.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "التسجيل غير موجود" });
      }

      await database
        .update(enrollments)
        .set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(enrollments.id, input.enrollmentId));

      // Track competency points for course completion: +20 points
      try {
        await trackCompetencyPoints(enrollment[0].userId, "course_completion");
      } catch (pointsError) {
        console.error("Error tracking competency points:", pointsError);
      }

      return { success: true };
    }),

  rejectEnrollment: adminOnlyProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;

      await database
        .update(enrollments)
        .set({ status: "rejected" })
        .where(eq(enrollments.id, input.enrollmentId));

      return { success: true };
    }),
});
