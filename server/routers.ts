import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { infographics, mindMaps } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
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

  profile: router({
    uploadPaymentReceipt: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        fileExtension: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");
        
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Data, 'base64');
        
        // Generate unique filename
        const fileName = `payment-receipts/${ctx.user.id}-${Date.now()}.${input.fileExtension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileName, buffer, input.mimeType);
        
        return { url };
      }),
    
    completeRegistration: protectedProcedure
      .input(z.object({
        firstNameAr: z.string().min(1, "الاسم بالعربية مطلوب"),
        lastNameAr: z.string().min(1, "اللقب بالعربية مطلوب"),
        firstNameFr: z.string().min(1, "Le prénom en français est requis"),
        lastNameFr: z.string().min(1, "Le nom en français est requis"),
        phone: z.string().min(8, "رقم الهاتف غير صحيح"),
        idCardNumber: z.string().min(1, "رقم بطاقة التعريف مطلوب"),
        paymentReceiptUrl: z.string().url("رابط وصل الخلاص غير صحيح"),
        email: z.string().email("البريد الإلكتروني غير صحيح"),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.completeUserRegistration(ctx.user.id, input);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        firstNameAr: z.string().optional(),
        lastNameAr: z.string().optional(),
        firstNameFr: z.string().optional(),
        lastNameFr: z.string().optional(),
        phone: z.string().optional(),
        idCardNumber: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
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
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteExam(input.id);
        return { success: true };
      }),
    
    getStatistics: adminProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExamStatistics(input.examId);
      }),
    
    getQuestions: protectedProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionsByExamId(input.examId);
      }),
    
    updateQuestion: adminProcedure
      .input(z.object({
        id: z.number(),
        questionText: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        optionC: z.string(),
        optionD: z.string(),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
      }))
      .mutation(async ({ input }) => {
        const { id, questionText, ...rest } = input;
        await db.updateQuestion(id, {
          questionTextAr: questionText,
          options: {
            optionA: rest.optionA,
            optionB: rest.optionB,
            optionC: rest.optionC,
            optionD: rest.optionD,
          },
          correctAnswer: rest.correctAnswer,
        });
        return { success: true };
      }),
    
    deleteQuestion: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    
    reorderQuestion: adminProcedure
      .input(z.object({
        id: z.number(),
        newOrder: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get the question and its exam
        const question = await db.getQuestionById(input.id);
        if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found' });
        
        const allQuestions = await db.getQuestionsByExamId(question.examId);
        const currentOrder = question.orderIndex;
        const newOrder = input.newOrder;
        
        // Update order indices
        if (newOrder < currentOrder) {
          // Moving up: shift down questions between new and current position
          for (const q of allQuestions) {
            if (q.orderIndex >= newOrder && q.orderIndex < currentOrder) {
              await db.updateQuestion(q.id, { orderIndex: q.orderIndex + 1 });
            }
          }
        } else if (newOrder > currentOrder) {
          // Moving down: shift up questions between current and new position
          for (const q of allQuestions) {
            if (q.orderIndex > currentOrder && q.orderIndex <= newOrder) {
              await db.updateQuestion(q.id, { orderIndex: q.orderIndex - 1 });
            }
          }
        }
        
        // Update the question's order
        await db.updateQuestion(input.id, { orderIndex: newOrder });
        return { success: true };
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

        // Generate PDF with Arabic name from registration form
        const participantNameAr = `${ctx.user.firstNameAr || ''} ${ctx.user.lastNameAr || ''}`.trim() || ctx.user.name || "المشارك";
        const { url, key } = await generateCertificatePDF({
          participantName: participantNameAr,
          courseName: course.titleAr,
          courseType: course.category,
          completionDate: attempt.submittedAt || new Date(),
          score: attempt.score || 0,
          certificateNumber,
          idCardNumber: ctx.user.idCardNumber || undefined,
        });

        // Save certificate record
        const certificate = await db.createCertificate({
          userId: ctx.user.id,
          courseId: course.id,
          examAttemptId: attempt.id,
          certificateNumber,
          pdfUrl: url,
        });

        // Send certificate via email
        try {
          const { sendEmail, getCertificateEmailTemplate } = await import('./emailService');
          const userNameAr = `${ctx.user.firstNameAr || ''} ${ctx.user.lastNameAr || ''}`.trim();
          const userName = ctx.user.name || ctx.user.email;
          await sendEmail({
            to: ctx.user.email,
            subject: `مبروك! حصلت على شهادة إتمام - ${course.titleAr}`,
            html: getCertificateEmailTemplate(userName, userNameAr, course.titleAr, url),
          });
        } catch (emailError) {
          console.error('[Certificate] Failed to send certificate email:', emailError);
          // Don't fail the certificate generation if email fails
        }

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

        // Generate PDF with Arabic name from registration form
        const participantNameAr = `${ctx.user.firstNameAr || ''} ${ctx.user.lastNameAr || ''}`.trim() || ctx.user.name || "المشارك";
        const { url, key } = await generateCertificatePDF({
          participantName: participantNameAr,
          courseName: cumulativeCourse.titleAr,
          courseType: cumulativeCourse.category,
          completionDate: new Date(),
          score: avgScore,
          certificateNumber,
          idCardNumber: ctx.user.idCardNumber || undefined,
        });

        // Save certificate record (without examAttemptId since it's cumulative)
        const certificate = await db.createCertificate({
          userId: ctx.user.id,
          courseId: cumulativeCourse.id,
          examAttemptId: null, // No specific exam attempt for cumulative cert
          certificateNumber,
          pdfUrl: url,
        });

        // Send certificate via email
        try {
          const { sendEmail, getCertificateEmailTemplate } = await import('./emailService');
          const userNameAr = `${ctx.user.firstNameAr || ''} ${ctx.user.lastNameAr || ''}`.trim();
          const userName = ctx.user.name || ctx.user.email;
          await sendEmail({
            to: ctx.user.email,
            subject: `مبروك! حصلت على شهادة إتمام - ${cumulativeCourse.titleAr}`,
            html: getCertificateEmailTemplate(userName, userNameAr, cumulativeCourse.titleAr, url),
          });
        } catch (emailError) {
          console.error('[Certificate] Failed to send cumulative certificate email:', emailError);
          // Don't fail the certificate generation if email fails
        }

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

  registrations: router({
    list: adminProcedure
      .input(z.object({
        filter: z.enum(["all", "pending", "approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const filter = input?.filter === "all" ? undefined : input?.filter;
        return await db.getAllRegistrations(filter);
      }),

    approve: adminProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.approveRegistration(input.userId, ctx.user.id);
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.rejectRegistration(input.userId, ctx.user.id, input.reason);
        return { success: true };
      }),

    exportToExcel: adminProcedure
      .input(z.object({
        filter: z.enum(["all", "pending", "approved", "rejected"]).optional(),
      }).optional())
      .mutation(async ({ input }) => {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('التسجيلات');

        // Get registrations
        const filter = input?.filter === "all" ? undefined : input?.filter;
        const registrations = await db.getAllRegistrations(filter);

        // Define columns with Arabic headers
        worksheet.columns = [
          { header: 'الرقم', key: 'id', width: 10 },
          { header: 'الاسم بالعربية', key: 'nameAr', width: 25 },
          { header: 'الاسم بالفرنسية', key: 'nameFr', width: 25 },
          { header: 'البريد الإلكتروني', key: 'email', width: 30 },
          { header: 'رقم الهاتف', key: 'phone', width: 20 },
          { header: 'رقم بطاقة التعريف', key: 'idCardNumber', width: 20 },
          { header: 'الحالة', key: 'status', width: 15 },
          { header: 'تاريخ التسجيل', key: 'createdAt', width: 20 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

        // Add data rows
        registrations.forEach((reg) => {
          const statusMap: Record<string, string> = {
            pending: 'قيد الانتظار',
            approved: 'مقبول',
            rejected: 'مرفوض'
          };

          worksheet.addRow({
            id: reg.id,
            nameAr: `${reg.firstNameAr} ${reg.lastNameAr}`,
            nameFr: `${reg.firstNameFr} ${reg.lastNameFr}`,
            email: reg.email,
            phone: reg.phone || '-',
            idCardNumber: reg.idCardNumber || '-',
            status: statusMap[reg.registrationStatus] || reg.registrationStatus,
            createdAt: new Date(reg.createdAt).toLocaleDateString('ar-TN'),
          });
        });

        // Auto-fit columns and add borders
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            if (rowNumber > 1) {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
          });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Convert to base64
        const base64 = Buffer.from(buffer).toString('base64');
        
        return { 
          data: base64,
          filename: `registrations-${new Date().toISOString().split('T')[0]}.xlsx`
        };
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

  // ============================================
  // Pedagogical Tools - أدوات المدرس
  // ============================================

  pedagogicalSheets: router({
    create: protectedProcedure
      .input(z.object({
        schoolYear: z.string().min(1, "السنة الدراسية إلزامية"),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string().min(1),
        subject: z.string().min(1),
        lessonTitle: z.string().min(1),
        lessonObjectives: z.string().optional(),
        duration: z.number().optional(),
        materials: z.string().optional(),
        introduction: z.string().optional(),
        mainActivities: z.array(z.object({
          title: z.string(),
          description: z.string(),
          duration: z.number(),
        })).optional(),
        conclusion: z.string().optional(),
        evaluation: z.string().optional(),
        guidePageReference: z.string().optional(),
        programReference: z.string().optional(),
        status: z.enum(["draft", "completed"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        const sheet = await db.createPedagogicalSheet({
          ...input,
          createdBy: ctx.user.id,
        });
        return sheet;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getPedagogicalSheetsByUser(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPedagogicalSheetById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          schoolYear: z.string().optional(),
          educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
          grade: z.string().optional(),
          subject: z.string().optional(),
          lessonTitle: z.string().optional(),
          lessonObjectives: z.string().optional(),
          duration: z.number().optional(),
          materials: z.string().optional(),
          introduction: z.string().optional(),
          mainActivities: z.array(z.object({
            title: z.string(),
            description: z.string(),
            duration: z.number(),
          })).optional(),
          conclusion: z.string().optional(),
          evaluation: z.string().optional(),
          guidePageReference: z.string().optional(),
          programReference: z.string().optional(),
          status: z.enum(["draft", "completed"]).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updatePedagogicalSheet(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePedagogicalSheet(input.id);
        return { success: true };
      }),

    exportToPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const sheet = await db.getPedagogicalSheetById(input.id);
        if (!sheet || sheet.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على المذكرة" });
        }

        const { generatePedagogicalSheetPdf } = await import("./pdfGenerator");
        const pdfBuffer = await generatePedagogicalSheetPdf(sheet);
        
        const { storagePut } = await import("./storage");
        const fileName = `pedagogical-sheets/sheet-${sheet.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
        
        return { url };
      }),

    exportToWord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const sheet = await db.getPedagogicalSheetById(input.id);
        if (!sheet || sheet.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على المذكرة" });
        }

        const { generatePedagogicalSheetWord } = await import("./wordGenerator");
        const wordBuffer = await generatePedagogicalSheetWord(sheet);
        
        const { storagePut } = await import("./storage");
        const fileName = `pedagogical-sheets/sheet-${sheet.id}-${Date.now()}.docx`;
        const { url } = await storagePut(fileName, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),

    generateAiSuggestion: protectedProcedure
      .input(z.object({
        schoolYear: z.string(),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string(),
        subject: z.string(),
        lessonTitle: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Get relevant reference documents
        const references = await db.getReferenceDocuments({
          educationLevel: input.educationLevel,
          grade: input.grade,
          subject: input.subject,
        });

        const referenceContext = references.length > 0
          ? `المراجع الرسمية المتاحة (يجب الالتزام بها):\n${references.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? 'دليل المعلم' : r.documentType === 'official_program' ? 'برنامج رسمي' : 'مرجع'})`).join('\n')}\n\nملاحظة: استخدم هذه المراجع كأساس لاقتراحاتك وتأكد من مطابقة المحتوى للبرامج الرسمية التونسية."`
          : "لا توجد مراجع رسمية متاحة لهذا المستوى والمادة. اقترح محتوى بيداغوجي عام مناسب للمستوى التعليمي.";

        const prompt = `أنت مساعد تربوي متخصص في إعداد المذكرات البيداغوجية للمدرسين التونسيين.

المعلومات:
- السنة الدراسية: ${input.schoolYear}
- المستوى: ${input.educationLevel === "primary" ? "ابتدائي" : input.educationLevel === "middle" ? "إعدادي" : "ثانوي"}
- الصف: ${input.grade}
- المادة: ${input.subject}
- عنوان الدرس: ${input.lessonTitle}

${referenceContext}

المطلوب:
1. اقترح أهداف الدرس والكفايات المستهدفة (2-3 أهداف)
2. اقترح نشاط تمهيدي مناسب
3. اقترح 3-4 أنشطة رئيسية للدرس
4. اقترح نشاط ختامي
5. اقترح طريقة تقييم مناسبة
6. اقترح الوسائل المطلوبة

ملاحظات مهمة:
- يجب أن تكون الاقتراحات متوافقة مع البرامج الرسمية التونسية
- استخدم مصطلحات تربوية دقيقة
- كن محدداً وعملياً
- لا تنسخ من المراجع بل اقترح بناءً عليها

قدم الاقتراحات بشكل منظم ومنسق.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت مساعد تربوي متخصص في إعداد المذكرات البيداغوجية للمدرسين التونسيين. تلتزم بالبرامج الرسمية التونسية وتستخدم مصطلحات تربوية دقيقة." },
            { role: "user", content: prompt },
          ],
        });

        const suggestionContent = response.choices[0]?.message?.content;
        const suggestion = typeof suggestionContent === 'string' ? suggestionContent : "لم يتم الحصول على اقتراح";

        // Try to parse the suggestion into structured data
        const parsedContent = {
          objectives: "",
          introduction: "",
          mainActivities: "",
          conclusion: "",
          evaluation: "",
          materials: "",
        };

        // Simple parsing based on keywords (can be improved)
        const lines = suggestion.split('\n');
        let currentSection = "";
        
        for (const line of lines) {
          if (line.includes("أهداف") || line.includes("الكفايات")) {
            currentSection = "objectives";
          } else if (line.includes("تمهيد") || line.includes("المقدمة")) {
            currentSection = "introduction";
          } else if (line.includes("أنشطة رئيسية") || line.includes("الأنشطة")) {
            currentSection = "mainActivities";
          } else if (line.includes("خاتمة") || line.includes("الخاتمة")) {
            currentSection = "conclusion";
          } else if (line.includes("تقييم") || line.includes("التقييم")) {
            currentSection = "evaluation";
          } else if (line.includes("وسائل") || line.includes("الوسائل")) {
            currentSection = "materials";
          } else if (currentSection && line.trim()) {
            parsedContent[currentSection as keyof typeof parsedContent] += line + "\n";
          }
        }

        return {
          suggestion,
          parsedContent,
          usedReferences: references.map(r => ({
            title: r.documentTitle,
            type: r.documentType,
            url: r.documentUrl,
          })),
        };
      }),

    exportAiSuggestionToWord: protectedProcedure
      .input(z.object({
        schoolYear: z.string(),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string(),
        subject: z.string(),
        lessonTitle: z.string(),
        duration: z.number().optional(),
        lessonObjectives: z.string().optional(),
        materials: z.string().optional(),
        introduction: z.string().optional(),
        mainActivities: z.array(z.object({
          title: z.string(),
          duration: z.number(),
          description: z.string(),
        })).optional(),
        conclusion: z.string().optional(),
        evaluation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { generateAiSuggestionWord } = await import("./wordGenerator");
        
        const wordBuffer = await generateAiSuggestionWord(input);
        
        const fileName = `ai-suggestions/suggestion-${Date.now()}.docx`;
        const { url } = await storagePut(fileName, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),

    exportAiSuggestionToPDF: protectedProcedure
      .input(z.object({
        schoolYear: z.string(),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string(),
        subject: z.string(),
        lessonTitle: z.string(),
        duration: z.number().optional(),
        lessonObjectives: z.string().optional(),
        materials: z.string().optional(),
        introduction: z.string().optional(),
        mainActivities: z.array(z.object({
          title: z.string(),
          duration: z.number(),
          description: z.string(),
        })).optional(),
        conclusion: z.string().optional(),
        evaluation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { generateAiSuggestionPDF } = await import("./pdfGenerator");
        
        const pdfBuffer = await generateAiSuggestionPDF(input);
        
        const fileName = `ai-suggestions/suggestion-${Date.now()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
        
        return { url };
      }),

    saveAiSuggestion: protectedProcedure
      .input(z.object({
        schoolYear: z.string(),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string(),
        subject: z.string(),
        lessonTitle: z.string(),
        duration: z.number().optional(),
        lessonObjectives: z.string().optional(),
        materials: z.string().optional(),
        introduction: z.string().optional(),
        mainActivities: z.array(z.object({
          title: z.string(),
          duration: z.number(),
          description: z.string(),
        })).optional(),
        conclusion: z.string().optional(),
        evaluation: z.string().optional(),
        rawSuggestion: z.string().optional(),
        usedReferences: z.array(z.object({
          title: z.string(),
          type: z.string(),
          url: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const suggestion = await db.createAiSuggestion({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, id: suggestion.id };
      }),

    listAiSuggestions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserAiSuggestions(ctx.user.id);
      }),

    searchAiSuggestions: protectedProcedure
      .input(z.object({
        educationLevel: z.string().optional(),
        grade: z.string().optional(),
        subject: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.searchAiSuggestions(ctx.user.id, input);
      }),

    getAiSuggestion: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAiSuggestionById(input.id);
      }),

    deleteAiSuggestion: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await db.deleteAiSuggestion(input.id, ctx.user.id);
        return { success };
      }),

    // Saved Prompts procedures
    savePrompt: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "العنوان إلزامي"),
        promptText: z.string().min(1),
        educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
        grade: z.string().optional(),
        subject: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { savedPrompts } = await import("../drizzle/schema");
        
        const [prompt] = await database.insert(savedPrompts).values({
          userId: ctx.user.id,
          title: input.title,
          promptText: input.promptText,
          educationLevel: input.educationLevel,
          grade: input.grade,
          subject: input.subject,
          usageCount: 0,
        });
        
        return { success: true, id: prompt.insertId };
      }),

    listSavedPrompts: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { savedPrompts } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        
        return await database
          .select()
          .from(savedPrompts)
          .where(eq(savedPrompts.userId, ctx.user.id))
          .orderBy(desc(savedPrompts.createdAt));
      }),

    deletePrompt: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { savedPrompts } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        
        await database
          .delete(savedPrompts)
          .where(and(
            eq(savedPrompts.id, input.id),
            eq(savedPrompts.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),

    incrementUsage: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { savedPrompts } = await import("../drizzle/schema");
        const { eq, sql } = await import("drizzle-orm");
        
        await database
          .update(savedPrompts)
          .set({ 
            usageCount: sql`${savedPrompts.usageCount} + 1`,
            lastUsedAt: new Date(),
          })
          .where(eq(savedPrompts.id, input.id));
        
        return { success: true };
      }),

    // Shared Library procedures
    publishSheet: protectedProcedure
      .input(z.object({ sheetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { pedagogicalSheets, sharedPedagogicalSheets } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Get the original sheet
        const [sheet] = await database
          .select()
          .from(pedagogicalSheets)
          .where(eq(pedagogicalSheets.id, input.sheetId));

        if (!sheet) throw new TRPCError({ code: "NOT_FOUND", message: "المذكرة غير موجودة" });
        if (sheet.createdBy !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكنك نشر مذكرة ليست لك" });

        // Check if already published
        const [existing] = await database
          .select()
          .from(sharedPedagogicalSheets)
          .where(eq(sharedPedagogicalSheets.originalSheetId, input.sheetId));

        if (existing) throw new TRPCError({ code: "BAD_REQUEST", message: "هذه المذكرة منشورة بالفعل" });

        // Publish the sheet
        await database.insert(sharedPedagogicalSheets).values({
          originalSheetId: sheet.id,
          publishedBy: ctx.user.id,
          schoolYear: sheet.schoolYear,
          educationLevel: sheet.educationLevel,
          grade: sheet.grade,
          subject: sheet.subject,
          lessonTitle: sheet.lessonTitle,
          sheetData: sheet as any,
        });

        return { success: true };
      }),

    listSharedSheets: publicProcedure
      .input(z.object({
        educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
        grade: z.string().optional(),
        subject: z.string().optional(),
        minRating: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { sharedPedagogicalSheets, users } = await import("../drizzle/schema");
        const { eq, and, gte, desc } = await import("drizzle-orm");

        const conditions = [];
        if (input.educationLevel) conditions.push(eq(sharedPedagogicalSheets.educationLevel, input.educationLevel));
        if (input.grade) conditions.push(eq(sharedPedagogicalSheets.grade, input.grade));
        if (input.subject) conditions.push(eq(sharedPedagogicalSheets.subject, input.subject));
        if (input.minRating) conditions.push(gte(sharedPedagogicalSheets.averageRating, input.minRating.toString()));

        const sheets = await database
          .select({
            id: sharedPedagogicalSheets.id,
            lessonTitle: sharedPedagogicalSheets.lessonTitle,
            schoolYear: sharedPedagogicalSheets.schoolYear,
            educationLevel: sharedPedagogicalSheets.educationLevel,
            grade: sharedPedagogicalSheets.grade,
            subject: sharedPedagogicalSheets.subject,
            viewCount: sharedPedagogicalSheets.viewCount,
            cloneCount: sharedPedagogicalSheets.cloneCount,
            averageRating: sharedPedagogicalSheets.averageRating,
            ratingCount: sharedPedagogicalSheets.ratingCount,
            publishedAt: sharedPedagogicalSheets.publishedAt,
            publishedBy: sharedPedagogicalSheets.publishedBy,
            publisherName: users.name,
          })
          .from(sharedPedagogicalSheets)
          .leftJoin(users, eq(sharedPedagogicalSheets.publishedBy, users.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(sharedPedagogicalSheets.publishedAt));

        return sheets;
      }),

    getSharedSheetById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { sharedPedagogicalSheets, users } = await import("../drizzle/schema");
        const { eq, sql } = await import("drizzle-orm");

        // Increment view count
        await database
          .update(sharedPedagogicalSheets)
          .set({ viewCount: sql`${sharedPedagogicalSheets.viewCount} + 1` })
          .where(eq(sharedPedagogicalSheets.id, input.id));

        const [sheet] = await database
          .select({
            id: sharedPedagogicalSheets.id,
            sheetData: sharedPedagogicalSheets.sheetData,
            viewCount: sharedPedagogicalSheets.viewCount,
            cloneCount: sharedPedagogicalSheets.cloneCount,
            averageRating: sharedPedagogicalSheets.averageRating,
            ratingCount: sharedPedagogicalSheets.ratingCount,
            publishedAt: sharedPedagogicalSheets.publishedAt,
            publishedBy: sharedPedagogicalSheets.publishedBy,
            publisherName: users.name,
          })
          .from(sharedPedagogicalSheets)
          .leftJoin(users, eq(sharedPedagogicalSheets.publishedBy, users.id))
          .where(eq(sharedPedagogicalSheets.id, input.id));

        if (!sheet) throw new TRPCError({ code: "NOT_FOUND", message: "المذكرة غير موجودة" });
        return sheet;
      }),

    cloneSheet: protectedProcedure
      .input(z.object({ sharedSheetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { sharedPedagogicalSheets, pedagogicalSheets } = await import("../drizzle/schema");
        const { eq, sql } = await import("drizzle-orm");

        // Get the shared sheet
        const [sharedSheet] = await database
          .select()
          .from(sharedPedagogicalSheets)
          .where(eq(sharedPedagogicalSheets.id, input.sharedSheetId));

        if (!sharedSheet) throw new TRPCError({ code: "NOT_FOUND", message: "المذكرة غير موجودة" });

        // Clone to user's personal sheets
        const sheetData = sharedSheet.sheetData as any;
        await database.insert(pedagogicalSheets).values({
          ...sheetData,
          id: undefined, // Let DB generate new ID
          createdBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Increment clone count
        await database
          .update(sharedPedagogicalSheets)
          .set({ cloneCount: sql`${sharedPedagogicalSheets.cloneCount} + 1` })
          .where(eq(sharedPedagogicalSheets.id, input.sharedSheetId));

        return { success: true };
      }),
  }),

  lessonPlans: router({
    create: protectedProcedure
      .input(z.object({
        schoolYear: z.string().min(1, "السنة الدراسية إلزامية"),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string().min(1),
        subject: z.string().min(1),
        planTitle: z.string().min(1),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        totalLessons: z.number().optional(),
        lessons: z.array(z.object({
          week: z.number(),
          lessonTitle: z.string(),
          objectives: z.string(),
          duration: z.number(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const plan = await db.createLessonPlan({
          ...input,
          createdBy: ctx.user.id,
        });
        return plan;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getLessonPlansByUser(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLessonPlanById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          schoolYear: z.string().optional(),
          educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
          grade: z.string().optional(),
          subject: z.string().optional(),
          planTitle: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          totalLessons: z.number().optional(),
          lessons: z.array(z.object({
            week: z.number(),
            lessonTitle: z.string(),
            objectives: z.string(),
            duration: z.number(),
          })).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateLessonPlan(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLessonPlan(input.id);
        return { success: true };
      }),

    exportToPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const plan = await db.getLessonPlanById(input.id);
        if (!plan || plan.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على الخطة" });
        }

        const { generateLessonPlanPdf } = await import("./pdfGenerator");
        const pdfBuffer = await generateLessonPlanPdf(plan);
        
        const { storagePut } = await import("./storage");
        const fileName = `lesson-plans/plan-${plan.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
        
        return { url };
      }),

    exportToWord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const plan = await db.getLessonPlanById(input.id);
        if (!plan || plan.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على الخطة" });
        }

        const { generateLessonPlanWord } = await import("./wordGenerator");
        const wordBuffer = await generateLessonPlanWord(plan);
        
        const { storagePut } = await import("./storage");
        const fileName = `lesson-plans/plan-${plan.id}-${Date.now()}.docx`;
        const { url } = await storagePut(fileName, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),
  }),

  teacherExams: router({
    create: protectedProcedure
      .input(z.object({
        schoolYear: z.string().min(1, "السنة الدراسية إلزامية"),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string().min(1),
        subject: z.string().min(1),
        examTitle: z.string().min(1),
        examType: z.enum(["formative", "summative", "diagnostic"]),
        duration: z.number().optional(),
        totalPoints: z.number().default(20),
        questions: z.array(z.object({
          questionText: z.string(),
          questionType: z.enum(["mcq", "short_answer", "essay"]),
          points: z.number(),
          options: z.array(z.string()).optional(),
          correctAnswer: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const exam = await db.createTeacherExam({
          ...input,
          createdBy: ctx.user.id,
        });
        return exam;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getTeacherExamsByUser(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeacherExamById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          schoolYear: z.string().optional(),
          educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
          grade: z.string().optional(),
          subject: z.string().optional(),
          examTitle: z.string().optional(),
          examType: z.enum(["formative", "summative", "diagnostic"]).optional(),
          duration: z.number().optional(),
          totalPoints: z.number().optional(),
          questions: z.array(z.object({
            questionText: z.string(),
            questionType: z.enum(["mcq", "short_answer", "essay"]),
            points: z.number(),
            options: z.array(z.string()).optional(),
            correctAnswer: z.string().optional(),
          })).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateTeacherExam(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTeacherExam(input.id);
        return { success: true };
      }),

    exportToPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const exam = await db.getTeacherExamById(input.id);
        if (!exam || exam.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على الاختبار" });
        }

        const { generateTeacherExamPdf } = await import("./pdfGenerator");
        const pdfBuffer = await generateTeacherExamPdf(exam);
        
        const { storagePut } = await import("./storage");
        const fileName = `teacher-exams/exam-${exam.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
        
        return { url };
      }),

    exportToWord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const exam = await db.getTeacherExamById(input.id);
        if (!exam || exam.createdBy !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على الاختبار" });
        }

        const { generateTeacherExamWord } = await import("./wordGenerator");
        const wordBuffer = await generateTeacherExamWord(exam);
        
        const { storagePut } = await import("./storage");
        const fileName = `teacher-exams/exam-${exam.id}-${Date.now()}.docx`;
        const { url } = await storagePut(fileName, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),
  }),

  referenceDocuments: router({
    upload: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        fileExtension: z.string(),
        mimeType: z.string(),
        schoolYear: z.string().min(1),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string().optional(),
        subject: z.string().optional(),
        documentType: z.enum(["teacher_guide", "official_program", "other"]),
        documentTitle: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");
        
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Data, 'base64');
        
        // Generate unique filename
        const fileName = `reference-docs/${ctx.user.id}-${Date.now()}.${input.fileExtension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileName, buffer, input.mimeType);
        
        // Save to database
        const doc = await db.createReferenceDocument({
          uploadedBy: ctx.user.id,
          schoolYear: input.schoolYear,
          educationLevel: input.educationLevel,
          grade: input.grade,
          subject: input.subject,
          documentType: input.documentType,
          documentTitle: input.documentTitle,
          documentUrl: url,
        });
        
        return doc;
      }),

    list: protectedProcedure
      .input(z.object({
        educationLevel: z.string().optional(),
        grade: z.string().optional(),
        subject: z.string().optional(),
        documentType: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getReferenceDocuments(input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReferenceDocument(input.id);
        return { success: true };
      }),
  }),

  /* visualTools: router({
    generateInfographic: protectedProcedure
      .input(z.object({
        title: z.string(),
        subject: z.string(),
        description: z.string().optional(),
        style: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        
        // Build prompt for infographic
        const styleDescriptions: Record<string, string> = {
          educational: "تعليمي واضح ومبسط للطلاب",
          scientific: "علمي دقيق مع رسوم توضيحية",
          statistical: "إحصائي مع رسوم بيانية وأرقام",
          timeline: "خط زمني متسلسل",
          comparison: "مقارنة بين عناصر مختلفة",
        };
        
        const prompt = `Create a professional infographic in Arabic about "${input.title}". Subject: ${input.subject}. ${input.description ? `Content: ${input.description}.` : ""} Style: ${styleDescriptions[input.style] || input.style}. Use vibrant colors, clear icons, and well-organized layout. Include title in Arabic at the top. Make it visually appealing and educational.`;
        
        const { url } = await generateImage({
          prompt,
        });
        
        // Save to database
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        await database.insert(infographics).values({
          userId: ctx.user.id,
          title: input.title,
          subject: input.subject,
          description: input.description || "",
          style: input.style,
          imageUrl: url,
          prompt,
        });
        
        return { imageUrl: url };
      }),

    generateMindMap: protectedProcedure
      .input(z.object({
        title: z.string(),
        centralTopic: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        
        const prompt = `Create a colorful mind map in Arabic with "${input.centralTopic}" as the central topic. ${input.description ? `Include these branches and elements: ${input.description}.` : "Generate relevant branches automatically."} Use different colors for each branch, clear connections, and icons. Make it visually organized and easy to understand. Professional educational style.`;
        
        const { url } = await generateImage({
          prompt,
        });
        
        // Save to database
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        await database.insert(mindMaps).values({
          userId: ctx.user.id,
          title: input.title,
          centralTopic: input.centralTopic,
          description: input.description || "",
          mapData: { prompt }, // Store prompt as map data
          imageUrl: url,
        });
        
        return { imageUrl: url };
      }),

    listInfographics: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) return [];
        
        return await database
          .select()
          .from(infographics)
          .where(eq(infographics.userId, ctx.user.id))
          .orderBy(desc(infographics.createdAt));
      }),

    listMindMaps: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) return [];
        
        return await database
          .select()
          .from(mindMaps)
          .where(eq(mindMaps.userId, ctx.user.id))
          .orderBy(desc(mindMaps.createdAt));
      }),
  }), */
});

export type AppRouter = typeof appRouter;
