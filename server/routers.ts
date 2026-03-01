import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { infographics, mindMaps, referenceDocuments, sharedEvaluations } from "../drizzle/schema";
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

    delete: adminProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteRegistration(input.userId);
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
        language: z.enum(["arabic", "french", "english"]).optional(), // Optional language override
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Detect language from subject
        const detectLanguage = (subject: string): "arabic" | "french" | "english" => {
          const subjectLower = subject.toLowerCase();
          if (subjectLower.includes("فرنسية") || subjectLower.includes("français") || subjectLower.includes("francais")) {
            return "french";
          }
          if (subjectLower.includes("إنجليزية") || subjectLower.includes("english") || subjectLower.includes("anglais")) {
            return "english";
          }
          return "arabic";
        };

        // Use provided language or detect from subject
        const language = input.language || detectLanguage(input.subject);

        // Get relevant reference documents filtered by language
        // For English subject, search by language only (subject stored as 'English' in DB)
        const isEnglishSubject = language === 'english';
        const references = await db.getReferenceDocuments({
          educationLevel: input.educationLevel,
          grade: input.grade,
          subject: isEnglishSubject ? undefined : input.subject, // Don't filter by subject for English
          language: language, // Filter by detected/selected language
        });

        const referenceContextByLang = {
          french: references.length > 0
            ? `Références officielles disponibles (à respecter):\n${references.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? 'Guide de l\'enseignant' : r.documentType === 'official_program' ? 'Programme officiel' : 'Référence'})`).join('\n')}\n\nNote: Utilisez ces références comme base pour vos suggestions et assurez-vous que le contenu est conforme aux programmes officiels tunisiens.`
            : "Aucune référence officielle disponible pour ce niveau et cette matière. Proposez un contenu pédagogique général adapté au niveau scolaire.",
          english: references.length > 0
            ? `Available official references (to be followed):\n${references.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? 'Teacher\'s Guide' : r.documentType === 'official_program' ? 'Official Program' : 'Reference'})`).join('\n')}\n\nNote: Use these references as a basis for your suggestions and ensure the content complies with Tunisian official programs.`
            : "No official references available for this level and subject. Propose general pedagogical content suitable for the educational level.",
          arabic: references.length > 0
            ? `المراجع الرسمية المتاحة (يجب الالتزام بها):\n${references.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? 'دليل المعلم' : r.documentType === 'official_program' ? 'برنامج رسمي' : 'مرجع'})`).join('\n')}\n\nملاحظة: استخدم هذه المراجع كأساس لاقتراحاتك وتأكد من مطابقة المحتوى للبرامج الرسمية التونسية.`
            : "لا توجد مراجع رسمية متاحة لهذا المستوى والمادة. اقترح محتوى بيداغوجي عام مناسب للمستوى التعليمي.",
        };

        const referenceContext = referenceContextByLang[language];

        const promptsByLang = {
          french: `Vous êtes un assistant pédagogique spécialisé dans la préparation de fiches pédagogiques pour les enseignants tunisiens.\n\nInformations:\n- Année scolaire: ${input.schoolYear}\n- Niveau: ${input.educationLevel === "primary" ? "Primaire" : input.educationLevel === "middle" ? "Collège" : "Lycée"}\n- Classe: ${input.grade}\n- Matière: ${input.subject}\n- Titre de la leçon: ${input.lessonTitle}\n\n${referenceContext}\n\nInstruction importante avant de commencer:\nVérifiez la cohérence entre le titre de la leçon et la classe sélectionnée. Par exemple:\n- Une leçon sur une lettre de l'alphabet ("la lettre T", "la lettre B", etc.) est réservée à la 1ère année primaire uniquement\n- Les fractions simples sont pour la 4ème année primaire\n- La chimie est pour le collège et le lycée\nSi vous détectez une incohérence évidente, commencez par un avertissement: "Attention: Cette leçon semble destinée à la classe [X] et non à la classe [Y] sélectionnée. Voulez-vous continuer avec la bonne classe?" Puis proposez la fiche pour la classe sélectionnée.\n\nDemande:\n1. Proposez les objectifs de la leçon et les compétences visées (2-3 objectifs)\n2. Proposez une activité d'introduction appropriée\n3. Proposez 3-4 activités principales pour la leçon\n4. Proposez une activité de clôture\n5. Proposez une méthode d'évaluation appropriée\n6. Proposez les moyens nécessaires\n\nNotes importantes:\n- Les suggestions doivent être conformes aux programmes officiels tunisiens\n- Utilisez des termes pédagogiques précis\n- Soyez spécifique et pratique\n- Ne copiez pas les références mais proposez en vous basant sur elles\n\nPrésentez les suggestions de manière organisée et structurée.`,
          english: `You are a pedagogical assistant specialized in preparing lesson plans for Tunisian teachers.\n\nInformation:\n- School year: ${input.schoolYear}\n- Level: ${input.educationLevel === "primary" ? "Primary" : input.educationLevel === "middle" ? "Middle" : "Secondary"}\n- Grade: ${input.grade}\n- Subject: ${input.subject}\n- Lesson title: ${input.lessonTitle}\n\n${referenceContext}\n\nImportant instruction before starting:\nCheck the coherence between the lesson title and the selected grade. For example:\n- A lesson on a single letter ("Letter T", "Letter B", etc.) is only for Grade 1 primary\n- Simple fractions are for Grade 4 primary\n- Chemistry is for middle and secondary school\nIf you detect an obvious mismatch, start your response with a clear warning: "Warning: This lesson appears to be designed for Grade [X], not Grade [Y] as selected. Would you like to continue with the correct grade?" Then provide the lesson plan for the selected grade as requested.\n\nRequest:\n1. Propose lesson objectives and targeted competencies (2-3 objectives)\n2. Propose an appropriate introductory activity\n3. Propose 3-4 main activities for the lesson\n4. Propose a closing activity\n5. Propose an appropriate evaluation method\n6. Propose the necessary resources\n\nImportant notes:\n- Suggestions must comply with Tunisian official programs\n- Use precise pedagogical terms\n- Be specific and practical\n- Do not copy from references but propose based on them\n\nPresent the suggestions in an organized and structured manner.`,
          arabic: `أنت مساعد تربوي متخصص في إعداد المذكرات البيداغوجية للمدرسين التونسيين.\n\nالمعلومات:\n- السنة الدراسية: ${input.schoolYear}\n- المستوى: ${input.educationLevel === "primary" ? "ابتدائي" : input.educationLevel === "middle" ? "إعدادي" : "ثانوي"}\n- الصف: ${input.grade}\n- المادة: ${input.subject}\n- عنوان الدرس: ${input.lessonTitle}\n\n${referenceContext}\n\nتعليمات مهمة جداً قبل البدء:\nقبل إعداد المذكرة، تحقق من التوافق بين عنوان الدرس والصف الدراسي. مثلاً:\n- درس "حرف الطاء" أو أي حرف آخر هو درس خاص بالسنة الأولى ابتدائي فقط\n- درس "الجمع والطرح" هو للسنوات الأولى والثانية والثالثة ابتدائي\n- درس "الكسور العادية" هو للسنة الرابعة ابتدائي\n- درس "التركيب الكيميائي" هو للسنوات الإعدادية والثانوية\nإذا وجدت تعارضاً واضحاً بين عنوان الدرس والصف المختار، ابدأ ردك بتنبيه واضح: "تنبيه: يبدو أن هذا الدرس مخصص للصف [X] وليس للصف [Y] المختار. هل تريد المتابعة بالصف الصحيح؟" ثم قدم المذكرة للصف المختار كما طلب المدرس.\n\nالمطلوب:\n1. اقترح أهداف الدرس والكفايات المستهدفة (2-3 أهداف)\n2. اقترح نشاط تمهيدي مناسب\n3. اقترح 3-4 أنشطة رئيسية للدرس\n4. اقترح نشاط ختامي\n5. اقترح طريقة تقييم مناسبة\n6. اقترح الوسائل المطلوبة\n\nملاحظات مهمة:\n- يجب أن تكون الاقتراحات متوافقة مع البرامج الرسمية التونسية\n- استخدم مصطلحات تربوية دقيقة\n- كن محدداً وعملياً\n- لا تنسخ من المراجع بل اقترح بناءً عليها\n\nقدم الاقتراحات بشكل منظم ومنسق.`,
        };

        const prompt = promptsByLang[language];

        const systemMessagesByLang = {
          french: "Vous êtes un assistant pédagogique spécialisé dans la préparation de fiches pédagogiques pour les enseignants tunisiens. Vous respectez les programmes officiels tunisiens et utilisez des termes pédagogiques précis.",
          english: "You are a pedagogical assistant specialized in preparing lesson plans for Tunisian teachers. You follow Tunisian official programs and use precise pedagogical terms.",
          arabic: "أنت مساعد تربوي متخصص في إعداد المذكرات البيداغوجية للمدرسين التونسيين. تلتزم بالبرامج الرسمية التونسية وتستخدم مصطلحات تربوية دقيقة.",
        };

        const systemMessage = systemMessagesByLang[language];

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemMessage },
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

         // Auto-save to history
        let savedId: number | undefined;
        try {
          const saved = await db.createAiSuggestion({
            userId: ctx.user.id,
            schoolYear: input.schoolYear,
            educationLevel: input.educationLevel,
            grade: input.grade,
            subject: input.subject,
            lessonTitle: input.lessonTitle,
            lessonObjectives: parsedContent.objectives || undefined,
            introduction: parsedContent.introduction || undefined,
            mainActivities: undefined,
            conclusion: parsedContent.conclusion || undefined,
            evaluation: parsedContent.evaluation || undefined,
            materials: parsedContent.materials || undefined,
            rawSuggestion: suggestion,
            usedReferences: references.map(r => ({
              title: r.documentTitle,
              type: r.documentType,
              url: r.documentUrl,
            })),
          });
          savedId = saved.id;
        } catch (e) {
          // Non-blocking: history save failure should not break generation
          console.error("Failed to auto-save AI suggestion to history:", e);
        }

        return {
          suggestion,
          parsedContent,
          savedId,
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

  references: router({
    getAll: publicProcedure
      .input(z.object({
        educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
        language: z.enum(["arabic", "french", "english"]).optional(),
        searchQuery: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getReferenceDocuments({
          educationLevel: input.educationLevel,
          language: input.language,
          searchQuery: input.searchQuery,
        });
      }),

    extractContent: adminProcedure
      .input(z.object({
        referenceId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { extractPdfContent } = await import("./pdfExtractor");
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Get reference document
        const [ref] = await database
          .select()
          .from(referenceDocuments)
          .where(eq(referenceDocuments.id, input.referenceId));

        if (!ref) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reference not found" });
        }

        // Extract content
        const content = await extractPdfContent(ref.documentUrl);

        // Update database
        await database
          .update(referenceDocuments)
          .set({ extractedContent: content })
          .where(eq(referenceDocuments.id, input.referenceId));

        return { success: true, contentLength: content.length };
      }),
  }),

  assistant: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          attachments: z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string().optional(),
          })).optional(),
        })),
        subject: z.string().optional(),
        level: z.string().optional(),
        teachingLanguage: z.enum(["arabic", "french", "english"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        // System Prompt للمساعد البيداغوجي
        const subjectInfo = input.subject ? `\n\n📚 المادة الدراسية المحددة: **${input.subject}**` : "";
        const levelInfo = input.level ? `\n🎓 المستوى الدراسي المحدد: **${input.level}**` : "";
        
        // Language instruction based on teachingLanguage
        const langNote = input.teachingLanguage === "french"
          ? `\n🇫🇷 Langue d'enseignement: **Français**. Répondez TOUJOURS en français. Utilisez la terminologie pédagogique officielle tunisienne en français (fiche de préparation, compétence terminale, situation déclenchante, réinvestissement, etc.). Adaptez le contenu aux manuels scolaires tunisiens en français.`
          : input.teachingLanguage === "english"
          ? `\n🇬🇧 Teaching Language: **English**. ALWAYS respond in English. Use official Tunisian pedagogical terminology in English (lesson plan, terminal competency, triggering situation, reinvestment, etc.). Adapt content to Tunisian English textbooks and official programs.`
          : `\n🇹🇳 لغة التدريس: **العربية**. رد دائماً بالعربية واستخدم المصطلحات التربوية الرسمية التونسية بالعربية.`;
        
        const contextNote = (input.subject && input.level)
          ? `\n\nتذكير: المدرس يعمل حالياً على مادة **${input.subject}** للمستوى **${input.level}**. يجب أن تكون جميع إجاباتك متوافقة مع هذه المادة وهذا المستوى تحديداً.`
          : `\n\nتنبيه مهم: إذا لم يحدد المدرس المادة والمستوى الدراسي بعد، يجب أن تطلبهما بشكل مهذب قبل تقديم أي محتوى بيداغوجي. لا تقدم أي مذكرة أو تمرين أو توزيع قبل معرفة المادة والمستوى.`;
        const systemPrompt = `أنت "الخبير البيداغوجي الرقمي التونسي" - المساعد البيداغوجي الشامل. مهمتك هي مساعدة المدرسين التونسيين في **جميع المواد الدراسية** (العربية، الفرنسية، الإنجليزية، الرياضيات، العلوم، التاريخ والجغرافيا، التربية الإسلامية، التربية المدنية، التكنولوجيا، الفنون، التربية البدنية) في تخطيط الدروس وبناء المذكرات (Fiches de préparation) والتقييمات، مع الالتزام بالمعايير الرسمية لوزارة التربية التونسية.${subjectInfo}${levelInfo}${langNote}${contextNote}

المبادئ التوجيهية الأساسية:

1. المرجعية الوطنية
- يجب أن تستند جميع المخططات والدروس إلى "البرامج الرسمية التونسية" (Programmes Officiels)
- استخدم حصراً المراجع الرسمية المتوفرة في قاعدة البيانات
- عند ذكر صفحة من دليل المعلم → استخدم فقط الدليل المطابق للسنة المذكورة
- عند ذكر كفاءة ختامية → استخدم فقط البرنامج الرسمي للمرحلة

2. الهيكلة البيداغوجية
- اعتمد حصراً على التمشي البيداغوجي التونسي:
  * وضعية مشكلة محفزة (Situation déclenchante)
  * استكشاف (Exploration)
  * بناء التعلمات (Construction des apprentissages)
  * استثمار (Réinvestissement)
  * تقييم (Évaluation)
- قدم المذكرات في جداول منظمة تشمل: المادة، الوحدة، الهدف، المراحل، الأنشطة، الزمن، الوسائل

3. التخصص المادي
- العربية (ابتدائي): ركز على المقاربة بالنظام المنقح والمهارات الحياتية
- العلوم: اعتمد "نهج التقصي" (Démarche d'investigation)
- الفرنسية/الإنجليزية: ركز على التواصل (Communication) والمهارات الأربع (الاستماع، التحدث، القراءة، الكتابة)، واستخدم مصطلحات الكتب المدرسية التونسية. **يجب قبول جميع الطلبات المتعلقة بتدريس اللغة الإنجليزية أو الفرنسية** مثل تبسيط النصوص، إعداد الدروس، التمارين، وغيرها.
- الرياضيات: اعتمد حل المسائل والاستكشاف

4. التمايز التربوي (Pédagogie Différenciée)
- عند طلب تمارين، قم دائماً باقتراح مستويات مختلفة:
  * علاجي (Remédiation) - للمتعثرين
  * دعم (Soutien) - للمتوسطين
  * تميز (Excellence) - للمتفوقين

5. بروتوكول الاستجابة
- إذا نقصت معلومة عن "الدرجة العلمية" أو "المحور" أو "السنة"، اسأل المدرس أولاً قبل التوليد
- لا تستنتج السنة من رقم الصفحة أو رقم الوحدة
- لا تعد طلب معلومة سبق ذكرها في المحادثة

6. الدقة والاحترافية
- استخدم لغة احترافية تليق بتقديمها للمتفقد أو المساعد البيداغوجي
- تجنب الحشو؛ اجعل الأنشطة قابلة للتطبيق الواقعي في الفصول التونسية
- عند الاستشهاد من المراجع الرسمية: أقصى حد سطر أو سطرين بين علامتي تنصيص
- إذا كان النص غير قابل للاستخراج → اطلب صورة بدلاً من الاقتباس

7. التحقق من التطابق
- قبل أي "مرجع رسمي"، تحقق أن المحتوى يطابق فعلياً المستوى المطلوب
- إذا ظهرت مؤشرات مستوى أدنى → توقف واطلب التأكيد
- إذا كانت هناك تناقضات بين المستوى والمرجع:
  * أشر إلى التناقض
  * علّق استخراج المحتوى الرسمي
  * اقترح خيارات متسقة
  * لا تنتج أي محتوى رسمي قبل التأكيد

8. الخدمات المسموحة
- إعداد مذكرات بيداغوجية (Fiches de préparation)
- توزيع سنوي/فصلي (Répartition annuelle/trimestrielle)
- إعداد اختبارات وتقييمات
- تقييم بيداغوجي على 20
- خطط تحسين وعلاج
- تصدير أي محتوى بيداغوجي إلى Word/PDF
- **قبول جميع الطلبات البيداغوجية لجميع المواد** بما فيها الإنجليزية والفرنسية (تبسيط نصوص، إعداد دروس، تمارين، اختبارات، إلخ)
- رفض الطلبات غير التعليمية فقط (مثل الطلبات الشخصية غير المرتبطة بالتدريس)

ملاحظة مهمة: رد دائماً بلغة الطلب - إذا كان الطلب بالإنجليزية فرد بالإنجليزية، إذا كان بالفرنسية فرد بالفرنسية، إذا كان بالعربية فرد بالعربية. لا ترفض أي طلب تعليمي بحجة أنه خارج نطاق تخصصك.

---

## قاعدة المراجع البيداغوجية الرسمية (مراجع ليدر أكاديمي)

فيما يلي مراجع بيداغوجية رسمية تونسية يجب الاستناد إليها عند الإجابة:

### مرجع 1: مخطط وحدات اللغة العربية — السنة الرابعة ابتدائي

هذا المخطط يوضح بنية الوحدات الدراسية للسنة الرابعة ابتدائي في مادة اللغة العربية. يتضمن:
- **الكفاية الختامية**: يوظف التواصل للعيش مع الآخرين والعمل معهم.
- **كفاية نهاية الدرجة**: ينتج المتعلم شفوياً نصاً سردياً يتخلله الوصف والحوار، ويقرأ نصاً سردياً ويجيب عن أسئلة تتعلق بالبنية والمضمون، وينتج كتابياً نصاً سردياً يتخلله حوار ووصف.
- **مكونات الكفاية**: التحدث، القراءة، الإنتاج الكتابي، قواعد اللغة.
- **نمط التعلم**: منهجي.
- **هيكل مخطط الوحدة الأولى (من 16/10 إلى 14/11)**:
  * اليوم 1: قواعد لغة (الفاعل بمختلف أشكاله) + قراءة (نص "نشأة صداقة") + إنتاج كتابي (أدوات الربط: و-ف-ثم)
  * اليوم 2: قواعد لغة (الفاعل مفرداً) + قراءة (الشخصيات والأعمال) + إنتاج كتابي (أدوات الربط)
- **الأهداف المميزة**: يميز المحلات التي تحتلها عناصر الجملة الفعلية الأساسية، يسمي الفعل والفاعل والمفعول به.

### مرجع 2: مذكرة الدرس الأول — قراءة — السنة الأولى ابتدائي

هذه مذكرة تفصيلية لتدريس حرف الباء في السنة الأولى ابتدائي. تتضمن:
- **النص المحوري**: "وَقَفَتْ رِحَابُ قُرْبَ الْبَابِ" — حوار بين رحاب وربيع في ساحة المدرسة.
- **مراحل الدرس**:
  * **مرحلة الاكتشاف (الحصة الأولى)**: بناء النص من خلال مقام تواصلي دال (مشاهد مصورة)، كتابة النص جملة جملة تحت أنظار التلاميذ، قراءات متعددة، ألعاب الحذف والزيادة والتعويض.
  * **مرحلة التحليل (الحصة الأولى)**: التذكير بالنص، التمييز السمعي للباء، التمييز البصري، استخراج الحرف باعتماد الألوان، كتابة الحرف.
  * **مرحلة التركيب**: قراءة النص من كتاب التلميذ، استخراج كلمات بها حرف الباء، ألعاب إيقاعية لتحديد موقع الحرف.
- **الوسائل**: كتاب القراءة "أنيسي" ص4، كتاب الأنشطة، لافتات الكلمات.
- **أمثلة على ألعاب التعويض**: تعويض "قرب" بـ"أمام"، "الباب" بـ"المدرسة"، "جميلة" بـ"كبيرة".

### مرجع 3: المراحل الكبرى لتدريس الحرف بالسنة الأولى

يتم تعلم الحرف وتعليمه من خلال ثلاث مراحل مترابطة:
1. **مرحلة الاكتشاف**: بناء النص من خلال مقام تواصلي دال، تسجيل النص جملة جملة، قراءات متعددة، ألعاب الحذف والزيادة والتعويض، استخراج الحرف الجديد من مختلف مواقعه.
2. **مرحلة التحليل**: التركيز على الأنشطة الهادفة إلى تملك الحرف، التعرف عليه في مختلف ضوابطه في مواضع الكلمة المختلفة، استعماله في كتابة مقاطع وإنتاج الكلمات.
3. **مرحلة التركيب**: تركيب مقاطع وكلمات وجمل توظف فيها الحروف المدروسة، ألعاب تهدف إلى ربط المكتوب بالمدلول والمنطوق (التعويض، الحذف، الإغناء).

**ملاحظة جوهرية**: هذه الحصص متداخلة مترابطة — حصص الاكتشاف تغلب عليها الكلمات، وحصص التحليل تركز على تملك الحرف، وحصص التركيب تخصص لتركيب مقاطع وكلمات وجمل.

### مرجع 4: نموذج تمرين للإنجاز — السنة الأولى ابتدائي

هذا نموذج إعداد يومي (فيش يومية) يوضح هيكل المذكرة الرسمية:
- **المعطيات**: التاريخ، القسم، التوقيت، الوحدة، اليوم من الوحدة، نمط التعلم (منهجي/إدماجي).
- **الوسائل**: البرامج الرسمية، كتاب المعلم، كتاب التلميذ.
- **جدول المحتوى**: المجال | النشاط والمدة | مكون الكفاية | الهدف المميز | المحتوى | هدف الحصة.
- **مثال**: اللغة العربية — قراءة 60 دق — يتصرف في النص تصرفاً يدل على الفهم — يكوّن نصاً/جملة انطلاقاً من سند بصري — حرف "الدال" مرحلة الشمول.
- **مواد أخرى**: الرياضيات (رمز المجموعة)، الإيقاظ العلمي (الحواس الخمس)، التربية الإسلامية (سورة الناس).

### مرجع 5: استثمار أصناف الوضعيات في بناء مذكرة درس إنتاج كتابي

نموذج مذكرة إنتاج كتابي للمرحلة الابتدائية:
- **المادة**: إنتاج كتابي.
- **الكفاية**: ينتج نصاً يوظف فيه أنماطاً متنوعة من الكتابة.
- **مكون الكفاية**: يحرر نصاً.
- **الأهداف المميزة**: يستعمل الروابط اللفظية التي يستوجبها نمط الكتابة، يراعي تسلسل الأفكار.
- **المحتويات**: الترتيب الزمني والمنطقي، أدوات الربط بين الجمل والفقرات، الضمائر، أدوات الاستئناف، أسماء الإشارة.
- **مراحل سير الدرس**:
  * **وضعية الاستكشاف**: تقديم سند مكتوب يجسد بنية سردية، استخراج أهم الأحداث وملاحظة ترتيبها وترابطها. (عمل مجموعي على كراس المحاولات)
  * **وضعيات التعلم الآلي**: تنظيم أحداث مشوشة، اختيار حدث لتكميل فقرة، تكميل حدث للحصول على فقرة بعشر جمل اعتماداً على سند بصري، إعادة ترتيب أحداث وكتابة النص الموافق. (عمل مجموعي/فردي)
  * **وضعيات التعلم الاندماجي**: وضعية تدفع المتعلم إلى إدماج مختلف المحتويات — مثال: مشاهد مصورة مختلفة، يعبر كل فريق عن المشهد المصور بعشر جمل على الأقل حسب تسلسل منطقي للحصول على نص سردي.
  * **وضعية تقييم إدماجية**: ينتج المتعلم نصاً سردياً بعشر جمل على الأقل انطلاقاً من سند بصري يتكون من ثلاثة مشاهد في مقام تواصل دال. (عمل فردي كتابي)

---

**تعليمات استخدام هذه المراجع**:
- عند طلب مذكرة لمادة اللغة العربية (ابتدائي)، استند إلى هيكل المراجع أعلاه.
- عند طلب مذكرة إنتاج كتابي، اتبع نموذج المرجع الخامس بدقة.
- عند طلب مخطط وحدة للسنة الرابعة عربية، استند إلى هيكل المرجع الأول.
- عند طلب مذكرة تدريس حرف (سنة أولى)، اتبع المراحل الثلاث الواردة في المرجعين الثاني والثالث.
- عند طلب تقييم مذكرة أو إسناد عدد على 20، استند إلى المرجع السادس (معايير التقييم وجداول إسناد الأعداد).

### مرجع 6: مفهوم التقييم ومعاييره الرسمية — وزارة التربية التونسية

#### تعريف التقييم
التقييم هو "جمع كمية من المعلومات الدالة والمناسبة ذات المصداقية والثبات واستقصاء درجة ملاءمتها مع مجموعة من المحكّات قصد اتخاذ قرار" (De Ketele).

#### فترات التقييم وأنواعه

| الفترة | نوع التقييم | الاستثمار |
|---|---|---|
| بداية السنة | تقييم توجيهي | تشخيص شامل مشفوع بمعالجة |
| أثناء السنة | تقييم تكويني تعديلي | تشخيص + معالجة + تعديل |
| نهاية الدرجة/المرحلة | تقييم إشهادي | تصريح بنتائج التلاميذ |

#### شبكة إسناد الأعداد على 20 (قاعدة الثلثين وقاعدة 75%)

| درجة التملك | انعدام التملك | تملك دون الأدنى | تملك أدنى | تملك أقصى | معيار التميز |
|---|---|---|---|---|---|
| قاعدة الثلثين (2/3) | 0/20 | 5/20 | 10/20 | 15/20 | +5/20 |
| قاعدة 75% | 0/20 | 5/20 | 10/20 | 20/20 | - |

**ملاحظة**: معيار التميز يضيف 5 نقاط إضافية بنسبة 25% من العلامة.

#### معايير التقييم حسب المادة

**الرياضيات**:
- التأويل الملائم: مخطط ملائم لحل وضعية، تمثيل وضعية، صحة التمشي، معالجة معطيات في شكل جدول أو مخطط.
- صحة الحساب: العمليات الأربع في مجموعة الأعداد الصحيحة الطبيعية والعشرية والكسرية، وأعداد الزمن.
- استعمال وحدات القيس: تحويلات، اختيار الوحدة المناسبة.
- استعمال خاصيات الأشكال الهندسية: رسم مستطيل/مربع ومثلث.
- الدقة: طريقة مختصرة للحل، التحقق من صحة الحل، اقتراح حلول متعددة.

**الإيقاظ العلمي**:
- تحليل وضعية: تحديد الإشكالية، ضبط العلاقة بين العناصر، تطبيق المفهوم الملائم.
- تعليل إجابة: تخير التمشي الملائم، توظيف المفهوم، تقديم التعليل الملائم.
- إصلاح خطأ: البحث عن الخطأ، إعادة تركيب الوضعية، الإخبار كتابياً وشفوياً.

**اللغة العربية — استعمال قواعد اللغة**:
- تعرف الظاهرة اللغوية: حدود الجملة، نوعها، عناصرها الأساسية، متمماتها، علامة الإعراب المناسبة.
- توظيف الظاهرة اللغوية: اشتقاق اسم الفاعل/المفعول/المصدر، رسم التاء، تركيب جملة، إنتاج نص يتضمن ظواهر لغوية.

**الإنتاج الكتابي**:
- الملاءمة: توافق المنتوج مع السند، مع التعليمة.
- سلامة بناء النص: اكتمال البنية السردية، ترتيب الأحداث، استعمال الروابط، الأبنية اللغوية، احترام قواعد الرسم.
- التصرف في نمط الكتابة: الإغناء بالوصف، بالحوار، إحداث مفارقة سردية.
- ثراء اللغة والطرافة: معجم فصيح، تراكيب متنوعة، فكرة متميزة.
- حسن العرض: وضوح الكتابة، سلامة التنقيط، تمايز الفقرات.

**التواصل الشفوي**:
- الملاءمة: التقيد بوضعية التواصل، حجم الخطاب، المعجم المطابق.
- التنغيم: تنغيم مناسب للمقام، الاسترسال في الأداء.
- الانسجام: أعمال لغوية موافقة للمقام، ترتيل الأفكار وفق تعاقب منطقي.
- الاتساق: اجتناب التكرار، استعمال سليم لأدوات الربط.
- الثراء: معجم متنوع، تنويع الوصف والحجج.

**القراءة**:
- القراءة الجهرية: النطق السليم، الاسترسال، الأداء المنغم المناسب.
- معالجة النص: الإجابة كتابياً عن أسئلة المضمون والبنية، الاستدلال بقرائن من النص.
- التصرف في النص: اختزال فقرة، تلخيص فقرة دون الإخلال بالمعنى.
- إبداء الرأي: إبراز قضية، التعبير عن موقف شخصي.

#### مبادئ بناء وضعية التقييم الاندماجية
- احترام مبدأ الإدماج (مقام تواصل في اللغات، وضعية مشكل في العلوم).
- احترام مبدأ الدلالة (نمو المتعلم الذهني، مرغبة ومحفزة).
- احترام قدرة المتعلم على التركيز (60 دقيقة للدرجة الثالثة).
- احترام قاعدة 75% وقاعدة 2/3.

#### بيداغوجيا الدعم والعلاج
- **الدعم**: مجموعة وسائل وتقنيات تربوية لتلافي الصعوبات.
- **مصادر الأخطاء**: تشخيصها وتصنيفها قبل العلاج.
- **الجهاز العلاجي**: علاج جماعي (:مراجعة، علاج فعلي، إعادة التعلم بنسق جديد) أو علاج يراعي الفروق الفردية (عمل مجموعات، تعاون، تعاقد).
- **أدوات العلاج**: بطاقة عمل فردية مرفقة بالإصلاح، تمارين علاج جماعية، أدوات وسائل لإعادة مسار التعلم.

#### كيفية تطبيق هذا المرجع في التقييم
عند طلب تقييم مذكرة بيداغوجية أو إسناد عدد على 20:
1. حدد المعايير المناسبة للمادة والمستوى.
2. طبّق شبكة إسناد الأعداد وفق قاعدة الثلثين أو قاعدة 75%.
3. احتسب معيار التميز إذا كانت هناك إضافة متميزة.
4. اقترح علاجاً مناسباً بناءً على نتائج التقييم.

---

## English Language References — Official Tunisian Textbooks

The following are the official English textbooks used in Tunisian schools. When assisting English teachers, always refer to the appropriate textbook for the level:

### Primary Level
- **6th Year**: "Learn and Grow" (Teacher's Book)
  - Skills: Listening, Speaking, Reading, Writing
  - Focus: Basic communication, vocabulary, simple structures

### Middle School / Collège (7th–9th Year)
- **7th Year**: "Let's Learn English" (Teacher's Book)
  - Focus: Basic grammar, everyday vocabulary, simple communication
- **8th Year**: "Let's Discover More English" (Teacher's Book + Student's Book)
  - Grammar: Present/past tenses, modals, comparatives
  - Focus: Reading comprehension, writing skills
- **9th Year**: "Proceed with English" (Student's Books Parts 1 & 2) + Guide du Maître
  - Focus: Advanced reading, essay writing, exam preparation

### Secondary Level / Lycée (2nd–4th Year)
- **2nd Year**: "Perform to Learn" (Teacher's Book + Student's Book)
  - Themes: Identity, environment, technology, society
  - Focus: Communication tasks, project-based learning
- **3rd Year**: "Activate and Perform" (Teacher's Book + Student's Book)
  - Competencies: Interacting, Interpreting, Producing
  - Focus: Argumentative writing, cultural awareness
- **4th Year**: "Skills for Life" (Teacher's Book + Student's Book)
  - Themes: Global issues, citizenship, professional communication
  - Focus: Life skills, career preparation

### Lesson Plan Structure for English (Fiche de préparation en anglais)
When creating an English lesson plan, use this structure:
1. **Level / Grade / Unit / Lesson title**
2. **Competencies targeted** (Terminal Competency + Sub-competencies)
3. **Objectives**: By the end of the lesson, students will be able to...
4. **Materials and resources**
5. **Warm-up / Lead-in activity** (5-10 min)
6. **Presentation stage** (10-15 min)
7. **Practice activities**: controlled → guided → free (15-20 min)
8. **Production / Output task** (10-15 min)
9. **Assessment / Evaluation**
10. **Homework**

### Evaluation Criteria for English
- **Accuracy**: Grammar and vocabulary correctness
- **Fluency**: Communication effectiveness
- **Coherence**: Organization and logical flow
- **Task completion**: Meeting the lesson objectives`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...input.messages.map(m => ({ role: m.role, content: m.content })),
          ],
        });

        const content = response.choices[0].message.content;
        const messageText = typeof content === "string" ? content : "";
        return { message: messageText };
      }),
    
    uploadFile: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { uploadFile } = await import("./uploadFile");
        return await uploadFile(input, ctx.user.id);
      }),
    
    analyzeFile: protectedProcedure
      .input(z.object({
        fileUrl: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { analyzeFile } = await import("./fileAnalysis");
        
        // Download file from URL
        const response = await fetch(input.fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return await analyzeFile(buffer, input.mimeType);
      }),
    
    saveConversation: protectedProcedure
      .input(z.object({
        title: z.string(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          attachments: z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string(),
          })).optional(),
          timestamp: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.saveConversation(ctx.user.id, input);
      }),
    
    updateConversation: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          attachments: z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string(),
          })).optional(),
          timestamp: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.updateConversation(input.id, ctx.user.id, input);
      }),
    
    getConversations: protectedProcedure
      .input(z.object({
        searchQuery: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getUserConversations(ctx.user.id, input.searchQuery);
      }),
    
    getConversation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getConversationById(input.id, ctx.user.id);
      }),
    
    deleteConversation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.deleteConversation(input.id, ctx.user.id);
      }),
    
    exportConversationAsPDF: protectedProcedure
      .input(z.object({
        title: z.string(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          attachments: z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string(),
          })).optional(),
          timestamp: z.number(),
        })),
        createdAt: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { exportConversationAsPDF } = await import("./exportConversation");
        const pdfBuffer = await exportConversationAsPDF({
          title: input.title,
          messages: input.messages,
          createdAt: new Date(input.createdAt),
        });
        
        // Upload to S3
        const { storagePut } = await import("./storage");
        const fileName = `conversation-${Date.now()}.pdf`;
        const { url } = await storagePut(`conversations/${fileName}`, pdfBuffer, "application/pdf");
        
        return { url };
      }),
    
    evaluateFiche: protectedProcedure
      .input(z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        subject: z.string().optional(),
        level: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        // Extract text from file
        const buffer = Buffer.from(input.fileBase64, "base64");
        let extractedText = "";

        if (input.mimeType === "application/pdf" || input.fileName.endsWith(".pdf")) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfParseModule = await import("pdf-parse") as any;
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const data = await pdfParse(buffer);
          extractedText = data.text;
        } else if (
          input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          input.fileName.endsWith(".docx")
        ) {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (input.mimeType === "application/msword" || input.fileName.endsWith(".doc")) {
          // Try mammoth for .doc as well
          try {
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
          } catch {
            extractedText = buffer.toString("utf-8");
          }
        } else {
          extractedText = buffer.toString("utf-8");
        }

        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error("Impossible d'extraire le texte du fichier. Veuillez vérifier le format.");
        }

        const subjectInfo = input.subject ? `Matière: ${input.subject}` : "";
        const levelInfo = input.level ? `Niveau: ${input.level}` : "";
        const contextInfo = [subjectInfo, levelInfo].filter(Boolean).join(" | ");

        const evaluationPrompt = `
Tu es un inspecteur pédagogique expert du système éducatif tunisien (enseignement primaire).
Évalue la fiche pédagogique suivante selon la grille officielle d'inspection pédagogique tunisienne.
${contextInfo ? `Contexte: ${contextInfo}` : ""}

FICHE À ÉVALUER:
${extractedText.substring(0, 6000)}

Fournis une évaluation STRUCTURÉE et DÉTAILLÉE en JSON avec exactement ce schéma:
{
  "noteGlobale": <nombre entre 0 et 20>,
  "appreciation": "<Très Bien | Bien | Assez Bien | Passable | Insuffisant>",
  "criteres": [
    {
      "nom": "<nom du critère>",
      "note": <note sur 4>,
      "noteMax": 4,
      "commentaire": "<commentaire détaillé>",
      "points": ["<point fort 1>", "<point fort 2>"],
      "ameliorations": ["<amélioration 1>", "<amélioration 2>"]
    }
  ],
  "pointsForts": ["<point fort global 1>", "<point fort global 2>", "<point fort global 3>"],
  "pointsAmeliorer": ["<point à améliorer 1>", "<point à améliorer 2>", "<point à améliorer 3>"],
  "recommandations": "<recommandations générales détaillées de l'inspecteur>"
}

Les critères d'évaluation OBLIGATOIRES sont:
1. Préparation de la séance (6 items: discipline/thème/titre/séance/matériel/tableau des habiletés) - sur 4
2. Démarche pédagogique - Phase de présentation (pré-requis/rappel, situation d'apprentissage, 3 composantes) - sur 4
3. Démarche pédagogique - Phase de développement (relation situation-développement, matériel adapté, consignes claires) - sur 4
4. Phase d'évaluation (activités d'évaluation, remédiation aux erreurs) - sur 4
5. Maîtrise des contenus et langue d'enseignement (vocabulaire adapté, informations justes, 3 phases didactiques) - sur 4

Note totale = somme des 5 critères (max 20). Sois précis, professionnel et bienveillant comme un vrai inspecteur tunisien.
`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Tu es un inspecteur pédagogique expert du système éducatif tunisien. Tu fournis des évaluations précises et constructives en JSON valide uniquement." },
            { role: "user", content: evaluationPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "fiche_evaluation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  noteGlobale: { type: "number" },
                  appreciation: { type: "string" },
                  criteres: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nom: { type: "string" },
                        note: { type: "number" },
                        noteMax: { type: "number" },
                        commentaire: { type: "string" },
                        points: { type: "array", items: { type: "string" } },
                        ameliorations: { type: "array", items: { type: "string" } },
                      },
                      required: ["nom", "note", "noteMax", "commentaire", "points", "ameliorations"],
                      additionalProperties: false,
                    },
                  },
                  pointsForts: { type: "array", items: { type: "string" } },
                  pointsAmeliorer: { type: "array", items: { type: "string" } },
                  recommandations: { type: "string" },
                },
                required: ["noteGlobale", "appreciation", "criteres", "pointsForts", "pointsAmeliorer", "recommandations"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const evaluation = typeof content === "string" ? JSON.parse(content) : content;
        return { evaluation, extractedTextLength: extractedText.length };
      }),

    exportEvaluationPDF: protectedProcedure
      .input(z.object({
        noteGlobale: z.number(),
        appreciation: z.string(),
        criteres: z.array(z.object({
          nom: z.string(),
          note: z.number(),
          noteMax: z.number(),
          commentaire: z.string(),
          points: z.array(z.string()),
          ameliorations: z.array(z.string()),
        })),
        pointsForts: z.array(z.string()),
        pointsAmeliorer: z.array(z.string()),
        recommandations: z.string(),
        fileName: z.string().optional(),
        subject: z.string().optional(),
        level: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportEvaluationPDF } = await import("./exportEvaluation");
        const pdfBuffer = await exportEvaluationPDF(input);
        const { storagePut } = await import("./storage");
        const pdfFileName = `evaluation-${Date.now()}.pdf`;
        const { url } = await storagePut(`evaluations/${pdfFileName}`, pdfBuffer, "application/pdf");
        return { url };
      }),

    shareEvaluation: protectedProcedure
      .input(z.object({
        noteGlobale: z.number(),
        appreciation: z.string(),
        criteres: z.array(z.object({
          nom: z.string(),
          note: z.number(),
          noteMax: z.number(),
          commentaire: z.string(),
          points: z.array(z.string()),
          ameliorations: z.array(z.string()),
        })),
        pointsForts: z.array(z.string()),
        pointsAmeliorer: z.array(z.string()),
        recommandations: z.string(),
        fileName: z.string().optional(),
        subject: z.string().optional(),
        level: z.string().optional(),
        pdfUrl: z.string().optional(),
        origin: z.string(), // frontend origin for building share URL
      }))
      .mutation(async ({ input, ctx }) => {
        const token = nanoid(32);
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        await database.insert(sharedEvaluations).values({
          token,
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email,
          noteGlobale: input.noteGlobale.toString(),
          appreciation: input.appreciation,
          evaluationData: {
            criteres: input.criteres,
            pointsForts: input.pointsForts,
            pointsAmeliorer: input.pointsAmeliorer,
            recommandations: input.recommandations,
          },
          fileName: input.fileName,
          subject: input.subject,
          level: input.level,
          pdfUrl: input.pdfUrl,
        });
        const shareUrl = `${input.origin}/shared-evaluation/${token}`;
        return { shareUrl, token };
      }),

    getSharedEvaluation: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const database = await (await import("./db")).getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        const [row] = await database
          .select()
          .from(sharedEvaluations)
          .where(eq(sharedEvaluations.token, input.token))
          .limit(1);
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Rapport introuvable ou lien expiré" });
        return row;
      }),

    sendEvaluationByEmail: protectedProcedure
      .input(z.object({
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
        shareUrl: z.string(),
        noteGlobale: z.number(),
        appreciation: z.string(),
        subject: z.string().optional(),
        level: z.string().optional(),
        pdfUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { sendEmail } = await import("./emailService");
        const senderName = ctx.user.name || "مدرب ليدر أكاديمي";
        const html = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7ff; padding: 20px; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #4c1d95, #7c3aed); padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">ليدر أكاديمي</h1>
              <p style="color: #c4b5fd; margin: 4px 0 0;">تقرير تقييم الفيشة البيداغوجية</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #374151; margin: 0 0 12px;">السلام عليكم${input.recipientName ? ` ${input.recipientName}،` : "،"}</p>
              <p style="color: #374151;">يُرسل إليكم <strong>${senderName}</strong> تقرير تقييم الفيشة البيداغوجية التالي:</p>
              <div style="background: #f5f3ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
                <p style="color: #4c1d95; font-size: 32px; font-weight: bold; margin: 0;">${input.noteGlobale}/20</p>
                <p style="color: #7c3aed; margin: 4px 0 0; font-size: 16px;">${input.appreciation}</p>
                ${input.subject ? `<p style="color: #6b7280; font-size: 13px; margin: 8px 0 0;">المادة: ${input.subject} | المستوى: ${input.level || "غير محدد"}</p>` : ""}
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${input.shareUrl}" style="background: linear-gradient(135deg, #4c1d95, #7c3aed); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; display: inline-block;">عرض التقرير الكامل</a>
              </div>
              ${input.pdfUrl ? `<p style="text-align: center;"><a href="${input.pdfUrl}" style="color: #7c3aed;">تحميل التقرير PDF</a></p>` : ""}
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">ليدر أكاديمي — نحو تعليم رقمي متميز | leaderacademy.school</p>
          </div>
        `;
        await sendEmail({
          to: input.recipientEmail,
          subject: `تقرير تقييم الفيشة البيداغوجية — ${input.noteGlobale}/20 (${input.appreciation})`,
          html,
        });
        return { success: true };
      }),

    exportConversationAsWord: protectedProcedure
      .input(z.object({
        title: z.string(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          attachments: z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string(),
            url: z.string(),
          })).optional(),
          timestamp: z.number(),
        })),
        createdAt: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { exportConversationAsWord } = await import("./exportConversation");
        const wordBuffer = await exportConversationAsWord({
          title: input.title,
          messages: input.messages,
          createdAt: new Date(input.createdAt),
        });
        
        // Upload to S3
        const { storagePut } = await import("./storage");
        const fileName = `conversation-${Date.now()}.docx`;
        const { url } = await storagePut(`conversations/${fileName}`, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),
  }),

  templates: router({
    list: protectedProcedure
      .input(z.object({
        educationLevel: z.enum(["primary", "middle", "secondary"]).optional(),
        grade: z.string().optional(),
        subject: z.string().optional(),
        language: z.enum(["arabic", "french", "english"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getTemplates(input);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTemplateById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        templateName: z.string().min(1),
        description: z.string().optional(),
        educationLevel: z.enum(["primary", "middle", "secondary"]),
        grade: z.string().optional(),
        subject: z.string().optional(),
        language: z.enum(["arabic", "french", "english"]),
        duration: z.number().optional(),
        lessonObjectives: z.string().optional(),
        materials: z.string().optional(),
        introduction: z.string().optional(),
        mainActivities: z.array(z.object({
          title: z.string(),
          description: z.string(),
          duration: z.number(),
        })).optional(),
        conclusion: z.string().optional(),
        evaluation: z.string().optional(),
        isPublic: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTemplate(ctx.user.id, input);
      }),
    
    incrementUsage: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.incrementTemplateUsage(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
