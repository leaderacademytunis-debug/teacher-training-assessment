/**
 * Email Integration Router
 * Handles sending emails for welcome, enrollment, and messages
 */

import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { z } from "zod";
import { sendWelcomeEmail, sendEnrollmentEmail, sendCourseMessage } from "../_core/emailService";
import { TRPCError } from "@trpc/server";

export const emailIntegrationRouter = router({
  /**
   * Send welcome email to new user
   */
  sendWelcomeEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email("بريد إلكتروني غير صحيح"),
        fullName: z.string().min(1, "الاسم الكامل مطلوب"),
        tempPassword: z.string().min(6, "كلمة المرور قصيرة جداً"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const loginUrl = `${process.env.VITE_APP_URL || "https://leaderacademy.school"}/login`;
        const result = await sendWelcomeEmail(
          input.email,
          input.fullName,
          input.tempPassword,
          loginUrl
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل إرسال بريد الترحيب",
          });
        }

        return { success: true, message: "تم إرسال بريد الترحيب بنجاح" };
      } catch (error: any) {
        console.error("Error sending welcome email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "خطأ في إرسال البريد",
        });
      }
    }),

  /**
   * Send enrollment confirmation email
   */
  sendEnrollmentEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email("بريد إلكتروني غير صحيح"),
        userName: z.string().min(1, "اسم المستخدم مطلوب"),
        courseName: z.string().min(1, "اسم التكوين مطلوب"),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const courseUrl = `${process.env.VITE_APP_URL || "https://leaderacademy.school"}/courses/${input.courseId}`;
        const result = await sendEnrollmentEmail(
          input.email,
          input.userName,
          input.courseName,
          courseUrl
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل إرسال بريد التسجيل",
          });
        }

        return { success: true, message: "تم إرسال بريد التسجيل بنجاح" };
      } catch (error: any) {
        console.error("Error sending enrollment email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "خطأ في إرسال البريد",
        });
      }
    }),

  /**
   * Send message to course participants (admin only)
   */
  sendCourseMessage: staffProcedure
    .input(
      z.object({
        email: z.string().email("بريد إلكتروني غير صحيح"),
        recipientName: z.string().min(1, "اسم المستقبل مطلوب"),
        courseName: z.string().min(1, "اسم التكوين مطلوب"),
        message: z.string().min(10, "الرسالة قصيرة جداً"),
        subject: z.string().min(5, "الموضوع قصير جداً"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await sendCourseMessage(
          input.email,
          input.recipientName,
          input.courseName,
          input.message,
          input.subject
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل إرسال الرسالة",
          });
        }

        return { success: true, message: "تم إرسال الرسالة بنجاح" };
      } catch (error: any) {
        console.error("Error sending course message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "خطأ في إرسال الرسالة",
        });
      }
    }),

  /**
   * Send welcome emails to multiple users (bulk)
   */
  sendBulkWelcomeEmails: staffProcedure
    .input(
      z.object({
        users: z.array(
          z.object({
            email: z.string().email(),
            fullName: z.string(),
            tempPassword: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      const loginUrl = `${process.env.VITE_APP_URL || "https://leaderacademy.school"}/login`;

      for (const user of input.users) {
        try {
          const result = await sendWelcomeEmail(
            user.email,
            user.fullName,
            user.tempPassword,
            loginUrl
          );

          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`فشل إرسال بريد إلى ${user.email}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`خطأ في ${user.email}: ${error.message}`);
        }
      }

      return results;
    }),
});
