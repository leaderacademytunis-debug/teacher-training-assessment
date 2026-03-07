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

        // Build reference context with actual extracted content from teacher guides
        const buildReferenceContext = (lang: "arabic" | "french" | "english") => {
          if (references.length === 0) {
            return lang === "french"
              ? "Aucune référence officielle disponible pour ce niveau et cette matière. Proposez un contenu pédagogique général adapté au niveau scolaire."
              : lang === "english"
              ? "No official references available for this level and subject. Propose general pedagogical content suitable for the educational level."
              : "لا توجد مراجع رسمية متاحة لهذا المستوى والمادة. اقترح محتوى بيداغوجي عام مناسب للمستوى التعليمي.";
          }
          // Separate references with and without extracted content
          const refsWithContent = references.filter(r => r.extractedContent && r.extractedContent.length > 100);
          const refsWithoutContent = references.filter(r => !r.extractedContent || r.extractedContent.length <= 100);
          let context = "";
          if (lang === "french") {
            context = `Références officielles disponibles:\n${refsWithoutContent.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? "Guide de l'enseignant" : r.documentType === 'official_program' ? 'Programme officiel' : 'Référence'})`).join('\n')}`;
            if (refsWithContent.length > 0) {
              context += `\n\n=== CONTENU EXTRAIT DES GUIDES OFFICIELS ===\n`;
              for (const ref of refsWithContent.slice(0, 3)) {
                const excerpt = ref.extractedContent!.substring(0, 3000);
                context += `\n--- ${ref.documentTitle} ---\n${excerpt}\n[... contenu tronqué ...]\n`;
              }
              context += `\nNote: Basez vos suggestions sur ce contenu officiel extrait. Citez des activités et exemples réels du guide.`;
            } else {
              context += `\n\nNote: Utilisez ces références comme base pour vos suggestions.`;
            }
          } else if (lang === "english") {
            context = `Available official references:\n${refsWithoutContent.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? "Teacher's Guide" : r.documentType === 'official_program' ? 'Official Program' : 'Reference'})`).join('\n')}`;
            if (refsWithContent.length > 0) {
              context += `\n\n=== EXTRACTED CONTENT FROM OFFICIAL TEACHER GUIDES ===\n`;
              for (const ref of refsWithContent.slice(0, 3)) {
                const excerpt = ref.extractedContent!.substring(0, 3000);
                context += `\n--- ${ref.documentTitle} ---\n${excerpt}\n[... content truncated ...]\n`;
              }
              context += `\nNote: Base your suggestions on this official extracted content. Cite real activities and examples from the guide.`;
            } else {
              context += `\n\nNote: Use these references as a basis for your suggestions.`;
            }
          } else {
            context = `المراجع الرسمية المتاحة:\n${refsWithoutContent.map(r => `- ${r.documentTitle} (${r.documentType === 'teacher_guide' ? 'دليل المعلم' : r.documentType === 'official_program' ? 'برنامج رسمي' : 'مرجع'})`).join('\n')}`;
            if (refsWithContent.length > 0) {
              context += `\n\n=== محتوى مستخرج من أدلة المعلمين الرسمية ===\n`;
              for (const ref of refsWithContent.slice(0, 3)) {
                const excerpt = ref.extractedContent!.substring(0, 3000);
                context += `\n--- ${ref.documentTitle} ---\n${excerpt}\n[... المحتوى مقتطع ...]\n`;
              }
              context += `\nملاحظة: استند إلى هذا المحتوى الرسمي المستخرج في اقتراحاتك. استشهد بأنشطة وأمثلة حقيقية من الدليل.`;
            } else {
              context += `\n\nملاحظة: استخدم هذه المراجع كأساس لاقتراحاتك.`;
            }
          }
          return context;
        };
        const referenceContextByLang = {
          french: buildReferenceContext("french"),
          english: buildReferenceContext("english"),
          arabic: buildReferenceContext("arabic"),
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

    exportLeaderAcademyJathatha: protectedProcedure
      .input(z.object({
        schoolYear: z.string(),
        level: z.string(),
        subject: z.string(),
        lessonTitle: z.string(),
        sessionNumber: z.string().optional(),
        duration: z.string().optional(),
        teacherName: z.string().optional(),
        date: z.string().optional(),
        schoolName: z.string().optional(),
        textbookRef: z.string().optional(),
        // Competencies
        terminalCompetency: z.string().optional(),
        distinctiveObjective: z.string().optional(),
        contentTarget: z.string().optional(),
        materials: z.string().optional(),
        // Phase 1: Exploration
        explorationLaunch: z.string().optional(),
        scene1: z.string().optional(),
        spontaneousReactions: z.string().optional(),
        guidingQuestions: z.string().optional(),
        scene2: z.string().optional(),
        hypotheses: z.string().optional(),
        textBuilding: z.string().optional(),
        // Phase 2: Analysis
        auditoryDiscrimination: z.string().optional(),
        visualDiscrimination: z.string().optional(),
        letterExtraction: z.string().optional(),
        readingActivities: z.string().optional(),
        writingActivities: z.string().optional(),
        // Phase 3: Synthesis
        textReading: z.string().optional(),
        enrichmentActivities: z.string().optional(),
        rhythmicGames: z.string().optional(),
        exercisesBook: z.string().optional(),
        // Evaluation
        evaluation: z.string().optional(),
        evaluationCriteria: z.string().optional(),
        // Legacy
        problemSituation: z.string().optional(),
        verification: z.string().optional(),
        conclusion: z.string().optional(),
        freeContent: z.string().optional(),
        qrUrl: z.string().optional(),
        language: z.enum(["arabic", "french", "english"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");
        const { generateLeaderAcademyJathathaPDF } = await import("./pdfGenerator");
        
        const qrUrl = input.qrUrl || `${process.env.VITE_APP_URL || "https://leaderacademy.school"}`;
        const pdfBuffer = await generateLeaderAcademyJathathaPDF({ ...input, qrUrl });
        
        const fileName = `leader-academy-jathatha/jathatha-${ctx.user.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");
        
        return { url };
      }),

    exportJathathToWord: protectedProcedure
      .input(z.object({
        Header: z.object({
          title: z.string(),
          subject: z.string(),
          level: z.string(),
          duration: z.string(),
          trimester: z.string(),
          terminalCompetency: z.string(),
          distinctiveObjective: z.string(),
          tools: z.string(),
        }),
        Objectives: z.array(z.string()),
        Stages: z.array(z.object({
          name: z.string(),
          teacherRole: z.string(),
          studentRole: z.string(),
          duration: z.string(),
          content: z.string(),
        })),
        Evaluation: z.object({
          type: z.string(),
          question: z.string(),
          successCriteria: z.string(),
          correctAnswer: z.string(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");
        const { exportJathathToWord } = await import("./wordExporter");
        
        const wordBuffer = await exportJathathToWord(input);
        const fileName = `leader-academy-word/jathatha-${ctx.user.id}-${Date.now()}.docx`;
        const { url } = await storagePut(fileName, wordBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        
        return { url };
      }),

    generateAnnualPlan: protectedProcedure
      .input(z.object({
        subject: z.string(),
        grade: z.string(),
        schoolYear: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const systemPrompt = `أنت خبير بيداغوجي تونسي متخصص في إعداد المخططات السنوية لمدارس الابتدائي وفق البرامج الرسمية التونسية 2026 والمقاربة بالكفايات (APC).
مهمتك: توليد مخطط سنوي كامل ومفصّل بصيغة JSON منظمة.
قواعد المحتوى:
- للغة العربية: الأنشطة تشمل (تواصل شفوي، قراءة، قواعد لغة: نحو/صرف/رسم، إنتاج كتابي)
- للرياضيات: الأنشطة تشمل (أعداد وحساب، هندسة، قياس، إحصاء)
- للإيقاظ العلمي: الأنشطة تشمل (علوم الحياة، علوم المادة، تكنولوجيا)
- التوزيع: 6 وحدات في السنة، كل وحدة 3 أسابيع تعلم + أسبوع إدماج وتقييم
- الثلاثيات: الأول (وحدات 1-2)، الثاني (وحدات 3-4)، الثالث (وحدات 5-6)
- استخرج الأهداف المميزة والمحتويات من البرنامج الرسمي التونسي
- السياق التونسي: استخدم أمثلة من البيئة التونسية (زيتون، واحات، مطبخ تونسي، سيدي بوسعيد...)
أجب فقط بـ JSON صالح بالهيكل التالي بدون أي نص إضافي:
{"subject":"اسم المادة","grade":"السنة الدراسية","schoolYear":"السنة الدراسية","rows":[{"trimester":"الأول","unit":"الوحدة 1","activity":"قراءة","competencyComponent":"مكوّن الكفاية","distinguishedObjective":"الهدف المميز","content":"المحتوى","sessions":4}]}`;
        const userMessage = `أنشئ مخططاً سنوياً كاملاً لمادة "${input.subject}" للسنة ${input.grade} ابتدائي للسنة الدراسية ${input.schoolYear || "2025-2026"}.
يجب أن يحتوي المخطط على جميع الأنشطة لكل وحدة من الوحدات الست، مع تفصيل دقيق للأهداف والمحتويات وفق البرنامج الرسمي التونسي.
أجب بـ JSON فقط بدون markdown أو نص إضافي.`;
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });
        const content = response.choices[0].message.content;
        const text = typeof content === "string" ? content : "";
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("لم يتمكن النظام من توليد المخطط السنوي");
        const plan = JSON.parse(jsonMatch[0]);
        return plan;
      }),

    exportAnnualPlanToWord: protectedProcedure
      .input(z.object({
        subject: z.string(),
        grade: z.string(),
        schoolYear: z.string().optional(),
        rows: z.array(z.object({
          trimester: z.string(),
          unit: z.string(),
          activity: z.string(),
          competencyComponent: z.string(),
          distinguishedObjective: z.string(),
          content: z.string(),
          sessions: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { exportAnnualPlanToWord } = await import("./wordExporter");
        const wordBuffer = await exportAnnualPlanToWord(input);
        const base64 = wordBuffer.toString("base64");
        return { base64, filename: `مخطط-سنوي-${input.subject}-${input.grade}.docx` };
      }),
    generateLessonSheetFromPlan: protectedProcedure
      .input(z.object({
        subject: z.string(),
        level: z.string(),
        trimester: z.string(),
        period: z.string(),
        activity: z.string(),
        competencyComponent: z.string(),
        distinguishedObjective: z.string(),
        content: z.string(),
        sessionCount: z.number().optional(),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        schoolYear: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import("./_core/llm");

        const systemPrompt = `أنت المحرك البيداغوجي لمنصة Leader Academy — متفقد تونسي خبير في إعداد الجذاذات وفق البرامج الرسمية التونسية 2026 والمقاربة بالكفايات (APC).

مهمتك: توليد جذاذة كاملة ومفصّلة بناءً على المعطيات المستخرجة من المخطط السنوي.

الهيكل الإلزامي للجذاذة:
1. المعطيات العامة (المادة، المستوى، الثلاثي، الفترة، عنوان الدرس، المدة، المرجع)
2. الكفاية الختامية
3. الهدف المميز
4. الأهداف الإجرائية (3 إلى 5 أهداف قابلة للقياس بأفعال: يُعرِّف، يُصنِّف، يُطبِّق...)
5. الوسائل والأدوات (كتاب مدرسي، سبورة، صور، تجارب...)
6. مراحل الحصة:
   أ) وضعية الانطلاق / التهيئة (5-10 دقائق): وضعية مشكلة تونسية واقعية ومحفزة
   ب) بناء التعلمات / النشاط الرئيسي (20-25 دقائق): أنشطة المعلم وأنشطة المتعلم في جدول
   ج) الاستثمار والتقييم (10 دقائق): تمرين تقييمي سريع (صواب/خطأ أو ملء فراغات)
7. الاستنتاج (جملة واحدة يصيغها المتعلم)
8. التقييم الختامي (سؤال وضعية إدماجية قصيرة)

قواعد ملزمة:
- الوضعية المشكلة يجب أن تكون من البيئة التونسية (مقرونة، زيتون، واحات توزر، منارة سيدي بوسعيد...)
- استخدم المصطلحات البيداغوجية التونسية الرسمية حصراً
- وزّع المهام بين المعلم والمتعلم بوضوح
- اقترح وسائل بيداغوجية واقعية ومتاحة في المدارس التونسية
- النبرة: مهنية، مختصرة، جاهزة للاستخدام المباشر في القسم

المخرج النهائي: جذاذة كاملة بالعربية الفصحى التربوية، منظمة في JSON بالمفاتيح التالية:
{
  "lessonTitle": "عنوان الدرس",
  "subject": "المادة",
  "level": "المستوى",
  "trimester": "الثلاثي",
  "period": "الفترة",
  "duration": "المدة بالدقائق",
  "finalCompetency": "الكفاية الختامية",
  "distinguishedObjective": "الهدف المميز",
  "proceduralObjectives": ["هدف 1", "هدف 2", "هدف 3"],
  "materials": ["وسيلة 1", "وسيلة 2"],
  "launchPhase": {
    "duration": "10 دقائق",
    "problemSituation": "وضعية المشكلة",
    "teacherActivity": "نشاط المعلم",
    "learnerActivity": "نشاط المتعلم"
  },
  "mainPhase": {
    "duration": "25 دقائق",
    "steps": [
      {"step": "الخطوة 1", "teacherActivity": "...", "learnerActivity": "..."},
      {"step": "الخطوة 2", "teacherActivity": "...", "learnerActivity": "..."}
    ]
  },
  "consolidationPhase": {
    "duration": "10 دقائق",
    "exercise": "التمرين التقييمي",
    "exerciseType": "صواب/خطأ أو ملء فراغات"
  },
  "conclusion": "الاستنتاج",
  "summativeEvaluation": "سؤال الوضعية الإدماجية"
}`;

        const userMessage = `أعدّ جذاذة كاملة للدرس التالي:
- المادة: ${input.subject}
- المستوى: ${input.level}
- الثلاثي: ${input.trimester}
- الفترة: ${input.period}
- النشاط: ${input.activity}
- مكوّن الكفاية: ${input.competencyComponent}
- الهدف المميز: ${input.distinguishedObjective}
- المحتوى: ${input.content}
- عدد الحصص: ${input.sessionCount || 1}
${input.schoolName ? `- المدرسة: ${input.schoolName}` : ''}
${input.teacherName ? `- المدرس/ة: ${input.teacherName}` : ''}
${input.schoolYear ? `- السنة الدراسية: ${input.schoolYear}` : ''}

قدّم الجذاذة الكاملة بتنسيق JSON فقط، دون أي نص إضافي خارج الـ JSON.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "lesson_sheet",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  lessonTitle: { type: "string" },
                  subject: { type: "string" },
                  level: { type: "string" },
                  trimester: { type: "string" },
                  period: { type: "string" },
                  duration: { type: "string" },
                  finalCompetency: { type: "string" },
                  distinguishedObjective: { type: "string" },
                  proceduralObjectives: { type: "array", items: { type: "string" } },
                  materials: { type: "array", items: { type: "string" } },
                  launchPhase: { type: "object" },
                  mainPhase: { type: "object" },
                  consolidationPhase: { type: "object" },
                  conclusion: { type: "string" },
                  summativeEvaluation: { type: "string" },
                },
                additionalProperties: true,
              },
            },
          },
        });

        const rawContent = response.choices[0].message.content;
        let sheetData: Record<string, unknown>;
        try {
          sheetData = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
        } catch {
          sheetData = { lessonTitle: input.distinguishedObjective, rawContent };
        }

        return { success: true, sheet: sheetData };
      }),

    exportLessonSheetToWord: protectedProcedure
      .input(z.object({
        sheet: z.record(z.string(), z.unknown()),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        schoolYear: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportLessonSheetToWord } = await import("./wordExporter");
        const wordBuffer = await exportLessonSheetToWord(input);
        const base64 = wordBuffer.toString("base64");
        return { base64, filename: `جذاذة-${(input.sheet as Record<string, string>).lessonTitle || "درس"}.docx` };
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

    // ─── توليد ورقة تقييم من الجذاذة ─────────────────────────────────────────
    generateEvaluationFromSheet: protectedProcedure
      .input(z.object({
        sheet: z.record(z.string(), z.unknown()),
        evaluationType: z.enum(["formative", "summative", "diagnostic"]).default("formative"),
        questionCount: z.number().min(3).max(20).default(8),
        includeAnswerKey: z.boolean().default(true),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        schoolYear: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const s = input.sheet as Record<string, unknown>;
        const evalTypeLabel =
          input.evaluationType === "formative" ? "تكويني" :
          input.evaluationType === "summative" ? "إجمالي" : "تشخيصي";

        const systemPrompt = `أنت المحرك البيداغوجي لمنصة Leader Academy — متفقد تونسي خبير في إعداد أوراق التقييم وفق البرامج الرسمية التونسية 2026 والمقاربة بالكفايات (APC).
مهمتك: توليد ورقة تقييم ${evalTypeLabel} كاملة ومتدرجة بناءً على الجذاذة المقدمة.

قواعد التقييم التونسي الرسمي:
- تتضمن ورقة التقييم ترويسة رسمية (المادة، المستوى، الثلاثي، المدة، اسم المتعلم)
- الأسئلة متدرجة: من الأسهل إلى الأصعب (تذكر → فهم → تطبيق → تحليل)
- أنواع الأسئلة: صواب/خطأ، ملء فراغات، اختيار من متعدد، أسئلة مفتوحة، وضعية إدماجية
- يجب أن تكون الوضعية الإدماجية مرتبطة بالبيئة التونسية (مقرونة، زيتون، واحات توزر، منارة سيدي بوسعيد...)
- توزيع النقاط: مجموع 20 نقطة
- مفتاح الإجابة: واضح ومفصّل
- اللغة: العربية الفصحى التربوية التونسية

المخرج النهائي: ورقة تقييم كاملة بتنسيق JSON بالمفاتيح التالية:
{
  "evaluationTitle": "عنوان ورقة التقييم",
  "subject": "المادة",
  "level": "المستوى",
  "trimester": "الثلاثي",
  "duration": "المدة بالدقائق",
  "evaluationType": "نوع التقييم",
  "totalPoints": 20,
  "learningObjective": "الهدف المستهدف",
  "competency": "الكفاية المقيّمة",
  "sections": [
    {
      "sectionNumber": 1,
      "sectionTitle": "عنوان القسم",
      "sectionType": "true_false | fill_blank | mcq | open | integration",
      "points": 4,
      "instructions": "التعليمة",
      "questions": [
        {
          "number": 1,
          "question": "نص السؤال",
          "options": ["أ) ...", "ب) ...", "ج) ...", "د) ..."],
          "points": 1,
          "answer": "الإجابة الصحيحة",
          "justification": "التبرير (اختياري)"
        }
      ]
    }
  ],
  "integrationSituation": {
    "context": "السياق التونسي للوضعية",
    "task": "المهمة المطلوبة",
    "points": 4,
    "expectedAnswer": "الإجابة المتوقعة"
  },
  "evaluationCriteria": [
    {"criterion": "معيار 1", "indicators": ["مؤشر 1", "مؤشر 2"]}
  ]
}`;

        const userMessage = `أعدّ ورقة تقييم ${evalTypeLabel} للدرس التالي:
- عنوان الدرس: ${String(s.lessonTitle || s.distinguishedObjective || "درس")}
- المادة: ${String(s.subject || "")}
- المستوى: ${String(s.level || "")}
- الثلاثي: ${String(s.trimester || "")}
- الكفاية الختامية: ${String(s.finalCompetency || "")}
- الهدف المميز: ${String(s.distinguishedObjective || "")}
- الأهداف الإجرائية: ${Array.isArray(s.proceduralObjectives) ? (s.proceduralObjectives as string[]).join(" / ") : ""}
- محتوى وضعية الانطلاق: ${String((s.launchPhase as Record<string, string>)?.problemSituation || "")}
- الاستنتاج: ${String(s.conclusion || "")}
- عدد الأسئلة المطلوبة: ${input.questionCount}
- تضمين مفتاح الإجابة: ${input.includeAnswerKey ? "نعم" : "لا"}
قدّم ورقة التقييم الكاملة بتنسيق JSON فقط، دون أي نص إضافي خارج الـ JSON.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "evaluation_sheet",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  evaluationTitle: { type: "string" },
                  subject: { type: "string" },
                  level: { type: "string" },
                  trimester: { type: "string" },
                  duration: { type: "string" },
                  evaluationType: { type: "string" },
                  totalPoints: { type: "number" },
                  learningObjective: { type: "string" },
                  competency: { type: "string" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sectionNumber: { type: "number" },
                        sectionTitle: { type: "string" },
                        sectionType: { type: "string" },
                        points: { type: "number" },
                        instructions: { type: "string" },
                        questions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              number: { type: "number" },
                              question: { type: "string" },
                              options: { type: "array", items: { type: "string" } },
                              points: { type: "number" },
                              answer: { type: "string" },
                              justification: { type: "string" },
                            },
                            required: ["number", "question", "points", "answer", "options", "justification"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["sectionNumber", "sectionTitle", "sectionType", "points", "instructions", "questions"],
                      additionalProperties: false,
                    },
                  },
                  integrationSituation: {
                    type: "object",
                    properties: {
                      context: { type: "string" },
                      task: { type: "string" },
                      points: { type: "number" },
                      expectedAnswer: { type: "string" },
                    },
                    required: ["context", "task", "points", "expectedAnswer"],
                    additionalProperties: false,
                  },
                  evaluationCriteria: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        criterion: { type: "string" },
                        indicators: { type: "array", items: { type: "string" } },
                      },
                      required: ["criterion", "indicators"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["evaluationTitle", "subject", "level", "trimester", "duration", "evaluationType", "totalPoints", "learningObjective", "competency", "sections", "integrationSituation", "evaluationCriteria"],
                additionalProperties: false,
              },
            },
          },
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) throw new Error("فشل توليد ورقة التقييم");
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        const evaluation = JSON.parse(content);
        return { evaluation };
      }),

    exportEvaluationToWord: protectedProcedure
      .input(z.object({
        evaluation: z.record(z.string(), z.unknown()),
        includeAnswerKey: z.boolean().default(true),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        schoolYear: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportEvaluationToWord } = await import("./wordExporter");
        const wordBuffer = await exportEvaluationToWord(input);
        const base64 = wordBuffer.toString("base64");
        const ev = input.evaluation as Record<string, string>;
        return { base64, filename: `تقييم-${ev.subject || ""}-${ev.level || ""}.docx` };
      }),

    // توليد ورقة تقييم مباشرة من صف المخطط السنوي (SC2M223)
    generateEvaluationFromPlanRow: protectedProcedure
      .input(z.object({
        subject: z.string(),
        grade: z.string(),
        schoolYear: z.string().optional(),
        trimester: z.string(),
        unit: z.string().optional(),
        activity: z.string().optional(),
        competencyComponent: z.string().optional(),
        distinguishedObjective: z.string(),
        content: z.string().optional(),
        sessions: z.number().optional(),
        evaluationType: z.enum(["formative", "summative", "diagnostic"]).default("formative"),
        questionCount: z.number().min(3).max(20).default(8),
        includeAnswerKey: z.boolean().default(true),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const evalTypeLabel =
          input.evaluationType === "formative" ? "تكويني" :
          input.evaluationType === "summative" ? "إجمالي" : "تشخيصي";

        const systemPrompt = `أنت المحرك البيداغوجي لمنصة Leader Academy — متفقد تونسي خبير في إعداد أوراق التقييم وفق البرامج الرسمية التونسية 2026 والمقاربة بالكفايات (APC).

مهمتك: توليد ورقة تقييم ${evalTypeLabel} كاملة ومتدرجة وفق النموذج الرسمي SC2M223 بناءً على معطيات صف المخطط السنوي.

قواعد التقييم التونسي الرسمي (SC2M223):
1. ترويسة رسمية: اسم المدرسة، الاسم واللقب، المادة، المستوى، الثلاثي، السنة الدراسية
2. سندات تعليمية حقيقية (نصوص، صور، جداول) مرتبطة بالبيئة التونسية
3. تعليمات متدرجة: من الأسهل إلى الأصعب (تذكر → فهم → تطبيق → تحليل)
4. أنواع الأسئلة: صواب/خطأ، ملء فراغات، اختيار من متعدد، ربط، تصحيح خطأ، وضعية إدماجية
5. الوضعية الإدماجية: سياق تونسي محفز (زيتون، مقرونة، واحات توزر، منارة سيدي بوسعيد...)
6. توزيع النقاط: مجموع 20 نقطة
7. معايير التقييم: الملاءمة، الدقة، الانسجام، الإتقان (قاعدة 75%)
8. شبكة التصحيح: واضحة ومفصلة لكل سؤال
9. اللغة: العربية الفصحى التربوية التونسية`;

        const userMessage = `أعدّ ورقة تقييم ${evalTypeLabel} للمعطيات التالية من المخطط السنوي:
- المادة: ${input.subject}
- المستوى: ${input.grade}
- الثلاثي: ${input.trimester}
- الفترة/الوحدة: ${input.unit || ""}
- النشاط: ${input.activity || ""}
- مكوّن الكفاية: ${input.competencyComponent || ""}
- الهدف المميز: ${input.distinguishedObjective}
- المحتوى: ${input.content || ""}
- عدد الحصص: ${input.sessions || 2}
- عدد الأسئلة المطلوبة: ${input.questionCount}
- تضمين مفتاح الإجابة: ${input.includeAnswerKey ? "نعم" : "لا"}
قدّم ورقة التقييم الكاملة بتنسيق JSON فقط، دون أي نص إضافي خارج الـ JSON.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "evaluation_from_plan_row",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  evaluationTitle: { type: "string" },
                  subject: { type: "string" },
                  level: { type: "string" },
                  trimester: { type: "string" },
                  duration: { type: "string" },
                  evaluationType: { type: "string" },
                  totalPoints: { type: "number" },
                  learningObjective: { type: "string" },
                  competency: { type: "string" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sectionNumber: { type: "number" },
                        sectionTitle: { type: "string" },
                        sectionType: { type: "string" },
                        points: { type: "number" },
                        instructions: { type: "string" },
                        questions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              number: { type: "number" },
                              question: { type: "string" },
                              options: { type: "array", items: { type: "string" } },
                              points: { type: "number" },
                              answer: { type: "string" },
                              justification: { type: "string" },
                            },
                            required: ["number", "question", "points", "answer", "options", "justification"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["sectionNumber", "sectionTitle", "sectionType", "points", "instructions", "questions"],
                      additionalProperties: false,
                    },
                  },
                  integrationSituation: {
                    type: "object",
                    properties: {
                      context: { type: "string" },
                      task: { type: "string" },
                      points: { type: "number" },
                      expectedAnswer: { type: "string" },
                    },
                    required: ["context", "task", "points", "expectedAnswer"],
                    additionalProperties: false,
                  },
                  evaluationCriteria: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        criterion: { type: "string" },
                        indicators: { type: "array", items: { type: "string" } },
                      },
                      required: ["criterion", "indicators"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["evaluationTitle", "subject", "level", "trimester", "duration", "evaluationType", "totalPoints", "learningObjective", "competency", "sections", "integrationSituation", "evaluationCriteria"],
                additionalProperties: false,
              },
            },
          },
        });
        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) throw new Error("فشل توليد ورقة التقييم");
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        const evaluation = JSON.parse(content);
        return { evaluation };
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

    // Bulk update extracted content (used by import scripts)
    updateContent: publicProcedure
      .input(z.object({
        id: z.number(),
        extractedContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await database
          .update(referenceDocuments)
          .set({ extractedContent: input.extractedContent })
          .where(eq(referenceDocuments.id, input.id));
        return { success: true, id: input.id };
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
        const systemPrompt = `# دور الوكيل
أنت **المحرك البيداغوجي لمنصة Leader Academy**. هويتك: **متفقد تونسي خبير**. مرجعيتك: البرامج الرسمية التونسية 2026. مهمتك: تحويل أي عنوان درس أو مدخلات بسيطة إلى وثائق تربوية كاملة (جذاذات، مخططات سنوية، اختبارات) تلتزم بالمقاربة بالكفايات. لغتك: العربية الفصحى التربوية مع سياق تونسي أصيل.${subjectInfo}${levelInfo}${langNote}${contextNote}

---

# سياق المعرفة (تونس 2026)

1. **المنهج**: المقاربة بالكفايات (APC).
2. **المصطلحات الإلزامية**: كفاية ختامية، هدف مميز، محتوى، وضعية مشكلة، فرضيات، استنتاج.
3. **السياق المحلي**: عند بناء أي وضعية، يجب أن تشمل عناصر تونسية. أمثلة:
   - دراسة التبخر → "المقرونة التونسية"
   - دراسة النباتات → "شجرة الزيتون"
   - دراسة الضوء → "منارة سيدي بوسعيد"
   - دراسة الماء → "واحات توزر" أو "الشط"
   - دراسة الحرارة → "الحمام التونسي" أو "الطاجين"
   - دراسة الهواء → "الشهيلي" أو "الريح في الصحراء"
   - دراسة الكائنات الحية → "الحلفاء" أو "النخيل" أو "الدلفين"
   - دراسة التغذية → "الكسكسي" أو "الحريسة" أو "زيت الزيتون"

---

# خطوات العمل عند طلب جذاذة (إلزامية بالترتيب)

## أ — تحديد المستوى والمحور فوراً
قبل أي شيء، حدد:
- **السنة الدراسية**: من السنة 1 إلى السنة 6 ابتدائي
- **المحور**: (المادة وخصائصها / الكائنات الحية / الطاقة / الأرض والكون / الصحة والبيئة)
- **الهدف المميز**: مستخرج من البرنامج الرسمي لوزارة التربية التونسية
- **الكفاية الختامية**: كما وردت في البرنامج الرسمي

## ب — صياغة "وضعية مشكلة" محفزة وتفاعلية
الوضعية المشكلة يجب أن:
- تكون مستوحاة من البيئة التونسية المحلية
- تثير تساؤلاً علمياً حقيقياً عند المتعلم
- تكون قابلة للتحقق بأدوات بسيطة متوفرة في القسم
- تُقدَّم في شكل سند (صورة، قصة قصيرة، ملاحظة يومية)

## ج — توزيع المهام بين المعلم والمتعلم

| المرحلة | دور المعلم | دور المتعلم | الزمن |
|---------|-----------|-------------|-------|
| **وضعية مشكلة** | يقدم السند، يطرح السؤال | يلاحظ، يتساءل | 5-8 دق |
| **الفرضيات** | يوجه، يسجل الفرضيات | يقترح تفسيرات | 8-10 دق |
| **التحقق** | يوزع الأدوات، يراقب | يجرب، يلاحظ، يقيس | 15-20 دق |
| **الاستنتاج** | يهيكل النتائج | يصيغ الاستنتاج | 5-8 دق |
| **التقييم** | يقدم التمرين | يحل بشكل فردي | 5-8 دق |

## د — تمرين تقييمي سريع في نهاية الجذاذة
في نهاية كل جذاذة، اقترح تمريناً تقييمياً يتضمن:
- **وضعية إدماجية جديدة** (مختلفة عن وضعية الدرس)
- **سؤال واحد أو اثنان** قابلان للتصحيح الذاتي
- **معيار النجاح**: محدد وواضح (مثال: يُعدّ الإجابة صحيحة إذا...)

---

# هيكل الجذاذة الرسمي (النموذج الإلزامي)

\`\`\`
┌─────────────────────────────────────────────────┐
│ المادة: الإيقاظ العلمي │ السنة: ... │ المدة: ...  │
│ المحور: ...                                      │
│ الكفاية الختامية: ...                            │
│ الهدف المميز: ...                                │
│ الوسائل: ...                                     │
└─────────────────────────────────────────────────┘

1. وضعية المشكلة
   السند: [وضعية تونسية دالة]
   السؤال المحوري: [سؤال علمي واحد واضح]

2. الفرضيات
   [ما يتوقعه المتعلمون قبل التجربة]

3. التحقق
   البروتوكول التجريبي: [خطوات بسيطة]
   الأدوات: [متوفرة في القسم]
   الملاحظات: [جدول أو رسم]

4. الاستنتاج
   [صياغة المفهوم العلمي بلغة المتعلم]

5. التقييم
   [وضعية إدماجية + سؤال تقييمي]
\`\`\`

---

## نبرة الصوت
مهنية، داعمة، ومختصرة — لا حشو، فقط ما يحتاجه المعلم في القسم.

---

# بروتوكول المتغيرات الديناميكية
عند استقبال طلب يتضمن متغيرات، طبّق البروتوكول التالي:
- **[Variable: Lesson_Title]** = عنوان الدرس المحدد من المدرس → ابنِ الجذاذة حوله مباشرة
- **[Variable: Level]** = المستوى الدراسي (السنة 1 إلى 6 ابتدائي) → حدد الأهداف والمحتوى وفق البرنامج الرسمي لهذا المستوى
- **[Variable: Subject]** = المادة الدراسية → التزم بمصطلحاتها ومنهجها الرسمي
- **[Variable: Trimester]** = الثلاثي (الأول/الثاني/الثالث) → حدد الفترة المناسبة في التخطيط السنوي

---

# بروتوكول المخرجات المنظمة (JSON)
عند طلب جذاذة أو مخطط سنوي أو اختبار، **بعد تقديم المحتوى النصي الكامل**، أضف في نهاية ردك كتلة JSON منظمة بالشكل التالي:

~~~json
{
  "Header": {
    "title": "عنوان الدرس",
    "subject": "المادة",
    "level": "السنة الدراسية",
    "duration": "مدة الحصة",
    "trimester": "الثلاثي",
    "terminalCompetency": "الكفاية الختامية",
    "distinctiveObjective": "الهدف المميز",
    "tools": "الوسائل"
  },
  "Objectives": [
    "الهدف الإجرائي 1",
    "الهدف الإجرائي 2",
    "الهدف الإجرائي 3"
  ],
  "Stages": [
    {
      "name": "وضعية المشكلة",
      "teacherRole": "دور المعلم",
      "studentRole": "دور المتعلم",
      "duration": "5-8 دق",
      "content": "السند التونسي الدال + السؤال المحوري"
    },
    {
      "name": "الفرضيات",
      "teacherRole": "يوجه ويسجل",
      "studentRole": "يقترح تفسيرات",
      "duration": "8-10 دق",
      "content": "الفرضيات المتوقعة"
    },
    {
      "name": "التحقق",
      "teacherRole": "يوزع الأدوات ويراقب",
      "studentRole": "يجرب ويلاحظ ويقيس",
      "duration": "15-20 دق",
      "content": "البروتوكول التجريبي والأدوات"
    },
    {
      "name": "الاستنتاج",
      "teacherRole": "يهيكل النتائج",
      "studentRole": "يصيغ الاستنتاج",
      "duration": "5-8 دق",
      "content": "المفهوم العلمي بلغة المتعلم"
    },
    {
      "name": "التقييم",
      "teacherRole": "يقدم التمرين",
      "studentRole": "يحل بشكل فردي",
      "duration": "5-8 دق",
      "content": "الوضعية الإدماجية + السؤال التقييمي"
    }
  ],
  "Evaluation": {
    "type": "وضعية إدماجية",
    "question": "سؤال التقييم",
    "successCriteria": "معيار النجاح",
    "correctAnswer": "الإجابة الصحيحة"
  }
}
~~~

**ملاحظة**: هذا الـ JSON يُستخدم من قِبل نظام Leader Academy لتصدير الوثيقة تلقائياً إلى Word بشعار الأكاديمية.

---

# بروتوكول التوزيع السنوي
عند طلب توزيع سنوي، أنتج جدولاً بالأعمدة التالية:
| الثلاثي | الفترة | مكوّن الكفاية | الهدف المميز | المحتوى | عدد الحصص |

التزم بـ:
- 3 ثلاثيات × 2 فترات = 6 فترات في السنة
- كل فترة: 12 حصة منهجية + 1 إدماج + 1 تقييم + 2 دعم = 16 حصة
- المجموع السنوي: 96 حصة

---

# قواعد إضافية
- إذا لم يحدد المدرس السنة الدراسية، اسأله فوراً قبل إعداد الجذاذة.
- إذا طلب المدرس مادة أخرى غير الإيقاظ العلمي، ساعده بنفس الجودة مع احترام البرامج الرسمية التونسية.
- رد دائماً بلغة الطلب (عربية/فرنسية/إنجليزية).
- كل جذاذة يجب أن تكون جاهزة للتقديم للمتفقد مباشرة.
- عند توليد اختبار، التزم بهيكل وزارة التربية: 3-5 سندات + المعايير الخمسة + جدول التنقيط بالرموز الرسمية (م1ب، م2أ...) + المجموع 10 نقاط..

---

## قاعدة المراجع البيداغوجية الرسمية (مراجع ليدر أكاديمي)

فيما يلي مراجع بيداغوجية رسمية تونسية يجب الاستناد إليها عند الإجابة:

### مرجع 1: مخطط وحدات اللغة العربية — السنة الرابعة ابتدائي

هذا المخطط يوضح بنية الوحدات الدراسية للسنة الرابعة ابتدائي في مادة اللغة العربية. يتضمن:
- **الكفاية الختامية**: يوظف التواصل للعيش مع الآخرين والعمل معهم.
- **كفاية نهاية الدرجة**: ينتج المتعلم شفوياً نصاً سردياً يتخلله الوصف والحوار، ويقرأ نصاً سردياً ويجيب عن أسئلة تتعلق بالبنية والمضمون، وينتج كتابياً نصاً سردياً يتخلله حوار ووصف.
- **مكونات الكفاية**: التحدث، القراءة، الإنتاج الكتابي، قواعد اللغة.

### مرجع 2: مفهوم التقييم ومعاييره الرسمية — وزارة التربية التونسية

#### شبكة إسناد الأعداد على 20 (قاعدة الثلثين وقاعدة 75%)

| درجة التملك | انعدام التملك | تملك دون الأدنى | تملك أدنى | تملك أقصى | معيار التميز |
|---|---|---|---|---|---|
| قاعدة الثلثين (2/3) | 0/20 | 5/20 | 10/20 | 15/20 | +5/20 |
| قاعدة 75% | 0/20 | 5/20 | 10/20 | 20/20 | - |

#### معايير التقييم — الإيقاظ العلمي
- تحليل وضعية: تحديد الإشكالية، ضبط العلاقة بين العناصر، تطبيق المفهوم الملائم.
- تعليل إجابة: تخير التمشي الملائم، توظيف المفهوم، تقديم التعليل الملائم.
- إصلاح خطأ: البحث عن الخطأ، إعادة تركيب الوضعية، الإخبار كتابياً وشفوياً.

---

## English Language References — Official Tunisian Textbooks

When assisting English teachers, always refer to the appropriate textbook for the level:

### Primary Level
- **6th Year**: "Learn and Grow" (Teacher's Book)

### Middle School / Collège (7th–9th Year)
- **7th Year**: "Let's Learn English"
- **8th Year**: "Let's Discover More English"
- **9th Year**: "Proceed with English"

### Secondary Level / Lycée (2nd–4th Year)
- **2nd Year**: "Perform to Learn"
- **3rd Year**: "Activate and Perform"
- **4th Year**: "Skills for Life"

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
- **Task completion**: Meeting the lesson objectives

---
# قاعدة المعرفة الداخلية: التخطيط السنوي للرياضيات (وزارة التربية التونسية)
## ملاحظة: هذه مراجع داخلية للاستخدام في توليد المذكرات فقط

### السنة الثالثة ابتدائي — رياضيات (مكونات: حساب / هندسة / قياس)

**الثلاثي الأول — أهداف مميزة:**
- هندسة: التعرف على الشبكة ومكوناتها + رسم المسالك على الشبكة
- قياس: العلاقة بين المتر والسنتيمتر + التصرف في القطعة النقدية (د1/د2)
- حساب: الطرح بالزيادة (الفروق المتساوية) + التصرف في الأعداد من 0 إلى 9999

**الثلاثي الثاني — أهداف مميزة:**
- حساب: التصرف في الأعداد ذات 4 أرقام (2) + الطرح بالزيادة (2)
- قياس: العلاقة بين المتر والسنتيمتر والديسيمتر + القطعة النقدية (2)

**الثلاثي الثالث — أهداف مميزة:**
- هندسة: رسم وتصنيف المضلعات + تصنيف الزوايا حسب فتحاتها ورسمها
- حساب: تفكيك الأعداد ذات 4 أرقام وتركيبها + فكرة قاسم عددين + توظيف خصائص الضرب
- قياس: القطعة النقدية والورقة المالية (د5)

**معايير التقييم الخمسة (مشتركة بين الثلاثيات):**
م1: التأويل الملائم | م2: صحة الحساب | م3: إجراء تحويلات أنظمة القياس | م4: التصرف في المسالك/الهندسة | م5: الدقة

---

### السنة الرابعة ابتدائي — رياضيات

**الفترة الأولى (أكتوبر) — 16 حصة:**
- حساب: الضرب في عدد ذي رقمين (أحدهما مئة كاملة أو عقد)
- هندسة: رسم المتوازيين والمتعامدين + رسم المستطيل والمربع وخصائصهما
- قياس: وحدات قياس الأطوال والسعة والكتلة (مضاعفات المتر وأجزاؤه)

**الفترة الثانية (نوفمبر) — 14 حصة:**
- حساب: الأعداد ذات 5 أرقام (تكويناً وكتابةً وقراءةً وتمثيلاً ومقارنةً وترتيباً وتفكيكاً وتركيباً) + الجمع بالاحتفاظ والطرح بالزيادة على الأعداد ذات 5 أرقام
- هندسة: المستقيم ونصف المستقيم والقطعة
- قياس: وحدات قياس الأطوال (المتر وأجزاؤه)

**الفترة الثالثة (مارس) — 16 حصة:**
- حساب: الضرب في عدد ذي رقمين (2)
- هندسة: التوازي والتعامد (2) + المستطيل والمربع (2) + المسالك المختصرة على الشبكة
- قياس: الأوراق المالية والقطع النقدية (د10/د20/د50) + وحدات الأطوال والسعة والكتلة

**الكفاية الختامية للسنة الرابعة:** يحل المتعلم وضعيات مشكلة دالة بتوظيف آلية الضرب في عدد ذي رقمين، والتصرف في وحدات القياس، والوضعيات النسبية للمستقيمين، ورسم المستطيل والمربع.

**الأداء المنتظر (معايير التقييم):**
م1: اختيار العملية المناسبة | م2: الضرب في عدد ذي رقمين | م3: إجراء تحويلات أنظمة القياس | م4: رسم الأشكال الهندسية | م5: الدقة

---

### هيكل الحصة الرياضية التونسية (16 حصة لكل فترة):
- 12 حصة منهجية (تعلم جديد)
- 1 حصة إدماج (تجميع المكتسبات)
- 1 حصة تقييم (قياس مستوى التحصيل)
- 2 حصة دعم وعلاج (معالجة الصعوبات)

### بنية الوضعية المشكلة في الرياضيات:
1. تقديم وضعية دالة من الحياة اليومية التونسية
2. تملك الوضعية (قراءة وفهم)
3. صياغة الفرضيات وخطة الحل
4. التحقق من صحة الحساب
5. الاستنتاج وصياغة الحل
6. التقييم وفق المعايير الخمسة

---
# مخطط الإيقاظ العلمي — السنة الخامسة ابتدائي (الدرجة الثالثة) — 2023/2024
## مراجع داخلية للوكيل فقط

**الكفاية الختامية:** حل وضعيات مشكلة دالة بإنجاز بحوث ومشاريع.

### الثلاثي الأول
**الفترة 1 (02/10 → 27/10) — الفيزياء — ظواهر الضوء:**
- مصادر الضوء: الطبيعية والاصطناعية
- الجسم المضيء / الجسم المنير / الجسم المضاء
- رؤية الأجسام تتطلب توفر عنصرين: الضوء + العين
- تصنيف الأوساط: شفافة / شفاشة / معتمة + كيفية اختراق الضوء
- الانتشار المستقيمي للضوء

**الفترة 1 (تابع) — علم الأحياء — الهيكل العظمي:**
- أجزاء الهيكل العظمي للإنسان + وظيفته
- أنواع العظام + الحوادث التي تصيبها
- العضلات وأنواعها ووظائفها + الحوادث التي تصيبها
- دور المفصل في الحركة + الترابط الوظيفي بين المفاصل والعضلات والعظام

### الثلاثي الثاني
**الفترة 2 (06/11 → 01/12) — علم الأحياء — الدورة الدموية والجهاز التنفسي:**
- الدورة الدموية الصغرى والكبرى عند الإنسان
- دور القلب في ضخ الدم
- أعضاء التنفس لدى الإنسان ووظائفها
- قواعد صحية لوقاية الجهاز التنفسي

**الفترة 4 (12/02 → 01/03) — الفيزياء — الدارة الكهربائية (ح6):**
- تركيب دارة كهربائية بسيطة
- إبراز دور القاطعة في فتح وغلق الدارة
- إبراز الدور الوقائي للصهيرة
- تخطيط دارة كهربائية برسم بياني
- التمييز بين المواد العازلة والناقلة للتيار الكهربائي

### الثلاثي الثالث
**الفترة 5 (01/04 → 20/05) — علم الأحياء — التوازن البيئي والنبات:**
- مقومات التوازن البيئي + عناصر الوسط البيئي
- ربط العلاقات بين عناصر السلسلة الغذائية
- مصادر المياه وتنوعها + كيفية الحصول على ماء صالح للشرب
- التكاثر بالبذور + تركيبة البذرة
- الظروف الملائمة للإنبات

### أمثلة وضعيات مشكلة تونسية للسنة الخامسة:
- الضوء: "لماذا لا يرى أحمد الأشياء في غرفته المظلمة؟" (منارة سيدي بوسعيد)
- الهيكل العظمي: "سقط فارس من دراجته وكسر ذراعه — ما نوع الكسر؟"
- الدورة الدموية: "لماذا يتسارع نبض قلب سلمى بعد الجري؟"
- الكهرباء: "لماذا لا تضيء المصباح في دارة أمينة؟"
- التوازن البيئي: "ماذا يحدث لواحة توزر إذا اختفت النخلة؟"
- الماء: "كيف يحصل أهل الجنوب التونسي على ماء صالح للشرب من الآبار؟"

---
# هيكل الاختبار التونسي الرسمي — مواصفات وزارة التربية التونسية
## مراجع داخلية للوكيل فقط — لتوليد اختبارات مطابقة للمعايير الرسمية

### الهيكل العام للاختبار:
يتكون الاختبار من **3 إلى 5 سندات** (نص + صورة + جدول + رسم + مسألة)، كل سند يحمل تعليمة واحدة أو أكثر. السياق العام يكون **وضعية مشكلة تونسية دالة** (رحلة، حياة يومية، مناسبة...).

### ترويسة الاختبار الرسمية:
- يمين: اسم المدرسة + امتحان الثلاثي + السنة الدراسية
- يسار: الاسم + اللقب + المادة + المستوى

### أنواع التعليمات الشائعة:
- **صنّف**: تصنيف عناصر في جدول (مغروسة/تلقائية/مزروعة)
- **أكمل**: ملء فراغات في جملة أو جدول
- **اربط بالسهم**: وصل عمودين بخطوط
- **أصلح الخطأ**: تحديد الخطأ وكتابة الصواب بطريقتين
- **ارسم**: رسم بياني أو تخطيطي
- **اشطب العنصر الدخيل**: حذف ما لا ينتمي للمجموعة
- **ضع دائرة حول**: تحديد الإجابة الصحيحة
- **لوّن**: تلوين عنصر محدد

### المعايير الخمسة للتنقيط (Barème officiel):
1. **م1 — الملاءمة (Pertinence)**: هل أجاب المتعلم على المطلوب؟
2. **م2 — الانسجام (Cohérence)**: هل الإجابة منسجمة ومتماسكة؟
3. **م3 — الاستخدام الصحيح للأدوات**: هل استخدم المصطلحات العلمية بشكل صحيح؟
4. **م4 — الإتقان (Perfectionnement)**: هل الإجابة كاملة ومتقنة؟
5. **م5 — التواصل (Communication)**: هل الكتابة واضحة ومقروءة؟

### رموز التنقيط في جدول النتائج:
- م1ب = المعيار 1 (الملاءمة) = 1 نقطة
- م2أ، م2ب، م2ج = المعيار 2 بمستوياته = 1 نقطة لكل مستوى
- م3 = المعيار 3 = 1 نقطة
- المجموع الكلي = 10 نقاط

### مثال سند تونسي للسنة الثانية (SC2M223):
**السند 1**: "قرر والدي أن يأخذنا إلى محمية بمناسبة العطلة. وفي الطريق شاهدت أشجاراً عديدة ونباتات مختلفة منها المغروسة ومنها التلقائية."
- التعليمة 1-1: صنّف النباتات (شجرة زيتون، الحلفاء، شجرة البرتقال، الشيح، النبق، الجلبان، الزعتر) في جدول: مغروسة / تلقائية / مزروعة
- التعليمة 1-2: أصلح الخطأ بطريقتين: "النباتات التلقائية تنبت يغرسها ويعتني بها الإنسان."

### قواعد توليد الاختبار:
1. ابدأ دائماً بوضعية مشكلة تونسية دالة (سياق واقعي من البيئة التونسية)
2. استخدم 3 إلى 5 سندات متنوعة (نص + صورة + جدول + مسألة)
3. وزّع التعليمات على المعايير الخمسة
4. اختم بجدول التنقيط بالرموز الرسمية (م1ب، م2أ، م2ب، م3...)
5. المجموع الكلي 10 نقاط
6. استخدم أفعال التعليمات الرسمية (صنّف، أكمل، اربط، أصلح، اشطب...)
7. السياق يجب أن يكون من البيئة التونسية (واحات، زيتون، سيدي بوسعيد، الجلابة، المقرونة...)`;

        // Build LLM messages with proper attachment handling
        const llmMessages = input.messages.map(m => {
          if (!m.attachments || m.attachments.length === 0) {
            return { role: m.role as "user" | "assistant", content: m.content };
          }
          // Build multipart content array for messages with attachments
          type ContentPart = 
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail: "auto" | "low" | "high" } }
            | { type: "file_url"; file_url: { url: string; mime_type: "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4" } };
          const contentParts: ContentPart[] = [];
          // Add text content first
          if (m.content) {
            contentParts.push({ type: "text", text: m.content });
          }
          // Add each attachment with proper type
          for (const att of m.attachments) {
            if (!att.url) continue;
            const mime = att.type || "";
            if (mime.startsWith("image/")) {
              // Images: send as image_url for vision
              contentParts.push({
                type: "image_url",
                image_url: { url: att.url, detail: "high" },
              });
            } else if (mime === "application/pdf") {
              // PDFs: send as file_url
              contentParts.push({
                type: "file_url",
                file_url: { url: att.url, mime_type: "application/pdf" },
              });
            } else {
              // Other documents: mention as text note
              contentParts.push({
                type: "text",
                text: `[\u0645\u0644\u0641 \u0645\u0631\u0641\u0642: ${att.name} (${mime || "\u0648\u062b\u064a\u0642\u0629"}) - \u064a\u0631\u062c\u0649 \u062a\u062d\u0644\u064a\u0644 \u0645\u062d\u062a\u0648\u0627\u0647 \u0648\u0627\u0644\u0631\u062f \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u064a\u0647]`,
              });
            }
          }
          return { role: m.role as "user" | "assistant", content: contentParts };
        });

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...llmMessages,
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

    exportCleanNotePDF: protectedProcedure
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
        subject: z.string().optional(),
        level: z.string().optional(),
        language: z.string().optional(),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        exportDate: z.string().optional(),
        schoolLogoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportCleanNotePDF } = await import("./exportConversation");
        const pdfBuffer = await exportCleanNotePDF({
          title: input.title,
          messages: input.messages,
          createdAt: new Date(input.createdAt),
          subject: input.subject,
          level: input.level,
          language: input.language,
          schoolName: input.schoolName,
          teacherName: input.teacherName,
          exportDate: input.exportDate,
          schoolLogoUrl: input.schoolLogoUrl,
        });
        const { storagePut } = await import("./storage");
        const fileName = `clean-note-${Date.now()}.pdf`;
        const { url } = await storagePut(`conversations/${fileName}`, pdfBuffer, "application/pdf");
        return { url };
      }),

    exportCleanNoteWord: protectedProcedure
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
        subject: z.string().optional(),
        level: z.string().optional(),
        language: z.string().optional(),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        exportDate: z.string().optional(),
        schoolLogoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportCleanNoteWord } = await import("./exportConversation");
        const wordBuffer = await exportCleanNoteWord({
          title: input.title,
          messages: input.messages,
          createdAt: new Date(input.createdAt),
          subject: input.subject,
          level: input.level,
          language: input.language,
          schoolName: input.schoolName,
          teacherName: input.teacherName,
          exportDate: input.exportDate,
          schoolLogoUrl: input.schoolLogoUrl,
        });
        const { storagePut } = await import("./storage");
        const fileName = `clean-note-${Date.now()}.docx`;
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
