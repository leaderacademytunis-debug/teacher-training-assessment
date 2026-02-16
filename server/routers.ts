import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { generateCertificatePDF } from "./certificates";
import { nanoid } from "nanoid";
import { parseTextQuestions, parseCSVQuestions, parseGoogleFormsCSV } from "./questionParser";

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
        const result = await db.enrollUserInCourse(ctx.user.id, input.courseId);
        
        // Get course details for notification
        const course = await db.getCourseById(input.courseId);
        
        // Notify all admins about new enrollment request
        await db.notifyAllAdmins({
          titleAr: "طلب تسجيل جديد",
          messageAr: `طلب ${ctx.user.name || "مستخدم"} التسجيل في دورة "${course?.titleAr || "غير محدد"}"`,
          type: "enrollment_request",
          relatedId: input.courseId,
        });
        
        return result;
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
    
    importQuestions: adminProcedure
      .input(z.object({
        courseId: z.number(),
        content: z.string(),
        format: z.enum(['text', 'csv', 'google_forms']),
      }))
      .mutation(async ({ input, ctx }) => {
        const { courseId, content, format } = input;
        
        // Parse questions based on format
        let questions;
        try {
          if (format === 'google_forms') {
            questions = parseGoogleFormsCSV(content);
          } else if (format === 'csv') {
            questions = parseCSVQuestions(content);
          } else {
            questions = parseTextQuestions(content);
          }
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `خطأ في تحليل المحتوى: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
          });
        }
        
        if (questions.length === 0) {
          // Get first few lines for debugging
          const preview = content.split('\n').slice(0, 3).join('\n');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `لم يتم العثور على أسئلة صالحة. تأكد من التنسيق: question,option_a,option_b,option_c,option_d,correct\n\nمعاينة: ${preview}`,
          });
        }
        
        // Create exam for this import
        const exam = await db.createExam({
          courseId,
          titleAr: `اختبار مستورد - ${new Date().toLocaleDateString('ar-TN')}`,
          descriptionAr: `تم استيراد ${questions.length} سؤال`,
          duration: questions.length * 2, // 2 minutes per question
          passingScore: 60,
          createdBy: ctx.user.id,
        });
        
        // Insert all questions
        let orderIndex = 1;
        for (const q of questions) {
          await db.createQuestion({
            examId: exam.id,
            questionTextAr: q.question,
            options: {
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
            },
            correctAnswer: q.correctAnswer,
            orderIndex: orderIndex++,
            points: 1,
          });
        }
        
        return { success: true, count: questions.length, examId: exam.id };
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

  certificates: router({    
    generate: protectedProcedure
      .input(z.object({ attemptId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Check if certificate already exists
        const existing = await db.getCertificateByAttemptId(input.attemptId);
        if (existing) {
          return existing;
        }

        // Get attempt details
        const attempt = await db.getExamAttemptById(input.attemptId);
        if (!attempt || attempt.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Check if passed
        if (!attempt.passed) {
          throw new TRPCError({ 
            code: "BAD_REQUEST",
            message: "Cannot generate certificate for failed exam"
          });
        }

        // Get exam and course details
        const exam = await db.getExamById(attempt.examId);
        if (!exam) throw new TRPCError({ code: "NOT_FOUND" });

        const course = await db.getCourseById(exam.courseId);
        if (!course) throw new TRPCError({ code: "NOT_FOUND" });

        // Generate certificate number
        const certificateNumber = `CERT-${Date.now()}-${nanoid(8).toUpperCase()}`;

        // Generate PDF
        const { url, key } = await generateCertificatePDF({
          participantName: ctx.user.arabicName || ctx.user.name || "المشارك",
          courseName: course.titleAr,
          courseType: course.category,
          completionDate: attempt.submittedAt || new Date(),
          score: attempt.score || 0,
          certificateNumber,
        });

        // Save certificate record
        const certificate = await db.createCertificate({
          userId: ctx.user.id,
          courseId: course.id,
          examAttemptId: attempt.id,
          certificateNumber,
          pdfUrl: url,
        });

        return certificate;
      }),

    getByAttemptId: protectedProcedure
      .input(z.object({ attemptId: z.number() }))
      .query(async ({ input, ctx }) => {
        const certificate = await db.getCertificateByAttemptId(input.attemptId);
        if (!certificate) return null;

        // Users can only see their own certificates
        if (certificate.userId !== ctx.user.id && ![ "admin", "trainer", "supervisor"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return certificate;
      }),

    listMyCertificates: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getCertificatesByUserId(ctx.user.id);
      }),

    verify: publicProcedure
      .input(z.object({ certificateNumber: z.string() }))
      .query(async ({ input }) => {
        const certificate = await db.getCertificateByCertificateNumber(input.certificateNumber);
        if (!certificate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certificate not found"
          });
        }
        return certificate;
      }),

    // Generate cumulative certificate (after completing all 5 base courses)
    generateCumulative: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Check if cumulative certificate already exists
        const existing = await db.getCertificatesByUserId(ctx.user.id);
        const cumulativeCert = existing.find(cert => {
          const course = cert.course;
          return course && course.titleAr === 'تأهيل أصحاب الشهادات العليا';
        });
        
        if (cumulativeCert) {
          return cumulativeCert;
        }

        // Get all user's certificates
        const userCertificates = await db.getCertificatesByUserId(ctx.user.id);
        
        // Required courses for cumulative certificate
        const requiredCourses = [
          'تأهيل مدرّسي العربية',
          'تأهيل مدرّسي العلوم',
          'تأهيل مدرّسي الفرنسية',
          'تأهيل مرافقي التلاميذ ذوي الصعوبات',
          'تأهيل منشطي التحضيري'
        ];
        
        // Check if user has completed all required courses
        const completedCourses = new Set(
          userCertificates.map(cert => cert.course?.titleAr).filter(Boolean)
        );
        
        const hasAllCourses = requiredCourses.every(course => completedCourses.has(course));
        
        if (!hasAllCourses) {
          const missing = requiredCourses.filter(course => !completedCourses.has(course));
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `يجب إكمال جميع الدورات الخمس للحصول على الشهادة التجميعية. الدورات الناقصة: ${missing.join(', ')}`
          });
        }

        // Find or create the cumulative course
        const allCourses = await db.getAllCourses();
        let cumulativeCourse = allCourses.find(c => c.titleAr === 'تأهيل أصحاب الشهادات العليا');
        
        if (!cumulativeCourse) {
          // Create cumulative course if it doesn't exist
          await db.createCourse({
            titleAr: 'تأهيل أصحاب الشهادات العليا',
            descriptionAr: 'شهادة تجميعية تُمنح بعد إتمام جميع الدورات الخمس الأساسية',
            category: 'primary_teachers',
            duration: 150,
            createdBy: 1, // System
          });
          
          // Fetch the newly created course
          const allCoursesUpdated = await db.getAllCourses();
          cumulativeCourse = allCoursesUpdated.find(c => c.titleAr === 'تأهيل أصحاب الشهادات العليا');
        }
        
        if (!cumulativeCourse) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or find cumulative course"
          });
        }

        // Generate certificate number
        const certificateNumber = `CERT-CUMUL-${Date.now()}-${nanoid(8).toUpperCase()}`;

        // Calculate average score from all certificates
        const avgScore = Math.round(
          userCertificates.reduce((sum, cert) => {
            const attempt = cert.examAttempt;
            return sum + (attempt?.score || 0);
          }, 0) / userCertificates.length
        );

        // Generate PDF
        const { url, key } = await generateCertificatePDF({
          participantName: ctx.user.arabicName || ctx.user.name || "المشارك",
          courseName: cumulativeCourse.titleAr,
          courseType: cumulativeCourse.category,
          completionDate: new Date(),
          score: avgScore,
          certificateNumber,
        });

        // Save certificate record (without examAttemptId since it's cumulative)
        const certificate = await db.createCertificate({
          userId: ctx.user.id,
          courseId: cumulativeCourse.id,
          examAttemptId: null, // No specific exam attempt for cumulative cert
          certificateNumber,
          pdfUrl: url,
        });

        return certificate;
      }),

    // Check if user is eligible for cumulative certificate
    checkCumulativeEligibility: protectedProcedure
      .query(async ({ ctx }) => {
        const userCertificates = await db.getCertificatesByUserId(ctx.user.id);
        
        const requiredCourses = [
          'تأهيل مدرّسي العربية',
          'تأهيل مدرّسي العلوم',
          'تأهيل مدرّسي الفرنسية',
          'تأهيل مرافقي التلاميذ ذوي الصعوبات',
          'تأهيل منشطي التحضيري'
        ];
        
        const completedCourses = new Set(
          userCertificates.map(cert => cert.course?.titleAr).filter(Boolean)
        );
        
        const hasAllCourses = requiredCourses.every(course => completedCourses.has(course));
        const missingCourses = requiredCourses.filter(course => !completedCourses.has(course));
        
        // Check if already has cumulative certificate
        const hasCumulative = userCertificates.some(cert => 
          cert.course?.titleAr === 'تأهيل أصحاب الشهادات العليا'
        );
        
        return {
          eligible: hasAllCourses && !hasCumulative,
          hasAllCourses,
          hasCumulative,
          missingCourses,
          completedCount: completedCourses.size,
          requiredCount: requiredCourses.length
        };
      }),
  }),

  videos: router({
    listByCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideosByCourseId(input.courseId);
      }),

    create: adminProcedure
      .input(z.object({
        courseId: z.number(),
        titleAr: z.string(),
        descriptionAr: z.string().optional(),
        videoUrl: z.string().url(),
        duration: z.number().optional(),
        orderIndex: z.number(),
        isRequired: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createVideo({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        descriptionAr: z.string().optional(),
        videoUrl: z.string().url().optional(),
        duration: z.number().optional(),
        orderIndex: z.number().optional(),
        isRequired: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateVideo(id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVideo(input.id);
        return { success: true };
      }),
  }),

  videoProgress: router({
    updateProgress: protectedProcedure
      .input(z.object({
        videoId: z.number(),
        watchedDuration: z.number(),
        completed: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.upsertVideoProgress({
          userId: ctx.user.id,
          videoId: input.videoId,
          watchedDuration: input.watchedDuration,
          completed: input.completed,
        });
      }),

    getCourseProgress: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getUserCourseVideoProgress(ctx.user.id, input.courseId);
      }),

    hasCompletedRequired: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.hasCompletedAllRequiredVideos(ctx.user.id, input.courseId);
      }),
  }),

  enrollmentApproval: router({
    listPending: adminProcedure
      .query(async () => {
        return await db.getPendingEnrollments();
      }),

    approve: adminProcedure
      .input(z.object({ enrollmentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Get enrollment details
        const enrollment = await db.getEnrollmentById(input.enrollmentId);
        if (!enrollment) throw new TRPCError({ code: "NOT_FOUND", message: "Enrollment not found" });
        
        const course = await db.getCourseById(enrollment.courseId);
        
        // Approve enrollment
        await db.approveEnrollment(input.enrollmentId, ctx.user.id);
        
        // Notify participant
        await db.createNotification({
          userId: enrollment.userId,
          titleAr: "تمت الموافقة على تسجيلك",
          messageAr: `تمت الموافقة على طلب تسجيلك في دورة "${course?.titleAr || "غير محدد"}". يمكنك الآن البدء بمشاهدة الفيديوهات.`,
          type: "enrollment_approved",
          relatedId: enrollment.courseId,
        });
        
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ enrollmentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Get enrollment details
        const enrollment = await db.getEnrollmentById(input.enrollmentId);
        if (!enrollment) throw new TRPCError({ code: "NOT_FOUND", message: "Enrollment not found" });
        
        const course = await db.getCourseById(enrollment.courseId);
        
        // Reject enrollment
        await db.rejectEnrollment(input.enrollmentId, ctx.user.id);
        
        // Notify participant
        await db.createNotification({
          userId: enrollment.userId,
          titleAr: "تم رفض طلب التسجيل",
          messageAr: `تم رفض طلب تسجيلك في دورة "${course?.titleAr || "غير محدد"}". يرجى التواصل مع المشرف للمزيد من المعلومات.`,
          type: "enrollment_rejected",
          relatedId: enrollment.courseId,
        });
        
        return { success: true };
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserNotifications(ctx.user.id);
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadNotificationCount(ctx.user.id);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
