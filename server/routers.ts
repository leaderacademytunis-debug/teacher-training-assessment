import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Admin/Trainer procedure - only for admin, trainer, or supervisor roles
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "trainer", "supervisor"].includes(ctx.user.role)) {
    throw new TRPCError({ 
      code: "FORBIDDEN",
      message: "Access denied. Admin, trainer, or supervisor role required."
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  courses: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCourses();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCourseById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        titleAr: z.string(),
        descriptionAr: z.string().optional(),
        category: z.enum([
          "primary_teachers",
          "arabic_teachers", 
          "science_teachers",
          "french_teachers",
          "preschool_facilitators",
          "special_needs_companions",
          "digital_teacher_ai"
        ]),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createCourse({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        descriptionAr: z.string().optional(),
        duration: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateCourse(id, updates);
        return { success: true };
      }),
    
    getStatistics: adminProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCourseStatistics(input.courseId);
      }),
  }),

  enrollments: router({
    enroll: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.enrollUserInCourse(ctx.user.id, input.courseId);
      }),
    
    myEnrollments: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEnrollments(ctx.user.id);
    }),
    
    courseEnrollments: adminProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCourseEnrollments(input.courseId);
      }),
  }),

  exams: router({
    listByCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamsByCourseId(input.courseId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        courseId: z.number(),
        titleAr: z.string(),
        descriptionAr: z.string().optional(),
        duration: z.number(),
        passingScore: z.number().default(60),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createExam({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        descriptionAr: z.string().optional(),
        duration: z.number().optional(),
        passingScore: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateExam(id, updates);
        return { success: true };
      }),
    
    getStatistics: adminProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamStatistics(input.examId);
      }),
  }),

  questions: router({
    listByExam: protectedProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionsByExamId(input.examId);
      }),
    
    create: adminProcedure
      .input(z.object({
        examId: z.number(),
        questionTextAr: z.string(),
        options: z.object({
          optionA: z.string(),
          optionB: z.string(),
          optionC: z.string(),
          optionD: z.string(),
        }),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
        points: z.number().default(1),
        orderIndex: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createQuestion(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        questionTextAr: z.string().optional(),
        options: z.object({
          optionA: z.string(),
          optionB: z.string(),
          optionC: z.string(),
          optionD: z.string(),
        }).optional(),
        correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
        points: z.number().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateQuestion(id, updates);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
  }),

  examAttempts: router({
    start: protectedProcedure
      .input(z.object({ examId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Check if user already has an in-progress attempt
        const existing = await db.getUserExamAttempts(ctx.user.id, input.examId);
        const inProgress = existing.find(a => a.status === "in_progress");
        
        if (inProgress) {
          return { attemptId: inProgress.id };
        }
        
        await db.createExamAttempt({
          userId: ctx.user.id,
          examId: input.examId,
          status: "in_progress",
        });
        
        // Get the newly created attempt
        const newAttempts = await db.getUserExamAttempts(ctx.user.id, input.examId);
        const newAttempt = newAttempts.find(a => a.status === "in_progress");
        
        return { attemptId: newAttempt!.id };
      }),
    
    submit: protectedProcedure
      .input(z.object({
        attemptId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          selectedAnswer: z.enum(["A", "B", "C", "D"]),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const attempt = await db.getExamAttemptById(input.attemptId);
        if (!attempt || attempt.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Get all questions for this exam
        const questions = await db.getQuestionsByExamId(attempt.examId);
        
        let totalPoints = 0;
        let earnedPoints = 0;
        
        // Grade each answer
        for (const answer of input.answers) {
          const question = questions.find(q => q.id === answer.questionId);
          if (!question) continue;
          
          const isCorrect = question.correctAnswer === answer.selectedAnswer;
          const points = isCorrect ? question.points : 0;
          
          totalPoints += question.points;
          earnedPoints += points;
          
          await db.createAnswer({
            attemptId: input.attemptId,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
            points,
          });
        }
        
        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        
        // Get exam to check passing score
        const exam = await db.getExamById(attempt.examId);
        const passed = exam ? score >= exam.passingScore : false;
        
        await db.updateExamAttempt(input.attemptId, {
          submittedAt: new Date(),
          status: "graded",
          score,
          totalPoints,
          earnedPoints,
          passed,
        });
        
        return { score, passed, earnedPoints, totalPoints };
      }),
    
    myAttempts: protectedProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getUserExamAttempts(ctx.user.id, input.examId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ attemptId: z.number() }))
      .query(async ({ input, ctx }) => {
        const attempt = await db.getExamAttemptById(input.attemptId);
        if (!attempt) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // Users can only see their own attempts, admins can see all
        if (attempt.userId !== ctx.user.id && !["admin", "trainer", "supervisor"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const answers = await db.getAnswersByAttemptId(input.attemptId);
        return { attempt, answers };
      }),
    
    listByExam: adminProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAllExamAttemptsByExam(input.examId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
