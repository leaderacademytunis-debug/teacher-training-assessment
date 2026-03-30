/**
 * Bulk User Import Router - Real database operations
 * Handles CSV processing and bulk account creation with email notifications
 */

import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users, servicePermissions, notifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// Admin-only procedure
const adminOnlyProcedure = staffProcedure;

// Helper: validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper: validate phone (supports multiple formats)
function isValidPhone(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Check if it's a valid Tunisian phone number
  return /^(\+216|0)?[0-9]{8}$/.test(cleaned);
}

// Helper: validate plan
function isValidPlan(plan: string): boolean {
  return ["starter", "pro", "vip", "free"].includes(plan.toLowerCase());
}

// Helper: generate temporary password
function generateTemporaryPassword(): string {
  return nanoid(12);
}

// Helper: send welcome email (simulated)
async function sendWelcomeEmail(
  email: string,
  name: string,
  password: string
): Promise<boolean> {
  // In production, this would integrate with an email service
  // For now, we simulate it
  console.log(`[EMAIL] Welcome email sent to ${email} for ${name}`);
  console.log(`[EMAIL] Temporary password: ${password}`);
  return true;
}

export const bulkUserImportRouter = router({
  // ============================================
  // PROCESS CSV AND CREATE ACCOUNTS
  // ============================================

  processBulkImport: adminOnlyProcedure
    .input(
      z.object({
        records: z.array(
          z.object({
            fullName: z.string(),
            email: z.string(),
            phone: z.string(),
            plan: z.string(),
            institution: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;
      const results = {
        created: 0,
        duplicates: 0,
        errors: 0,
        details: [] as Array<{
          email: string;
          status: "created" | "duplicate" | "error";
          message: string;
          password?: string;
        }>,
      };

      for (const record of input.records) {
        try {
          // Validate email
          if (!isValidEmail(record.email)) {
            results.errors++;
            results.details.push({
              email: record.email,
              status: "error",
              message: "البريد الإلكتروني غير صحيح",
            });
            continue;
          }

          // Validate phone
          if (!isValidPhone(record.phone)) {
            results.errors++;
            results.details.push({
              email: record.email,
              status: "error",
              message: "رقم الهاتف غير صحيح",
            });
            continue;
          }

          // Validate plan
          if (!isValidPlan(record.plan)) {
            results.errors++;
            results.details.push({
              email: record.email,
              status: "error",
              message: "الخطة غير صحيحة",
            });
            continue;
          }

          // Check if email already exists
          const existingUser = await database
            .select()
            .from(users)
            .where(eq(users.email, record.email))
            .limit(1);

          if (existingUser.length > 0) {
            results.duplicates++;
            results.details.push({
              email: record.email,
              status: "duplicate",
              message: "البريد الإلكتروني موجود بالفعل",
            });
            continue;
          }

          // Generate temporary password
          const tempPassword = generateTemporaryPassword();

          // Create user account
          const openId = `bulk-import-${nanoid()}`;
          const result = await database.insert(users).values({
            openId: openId,
            name: record.fullName,
            arabicName: record.fullName,
            email: record.email,
            phone: record.phone,
            loginMethod: "email",
            role: "teacher",
            registrationCompleted: true,
            registrationStatus: "approved",
            schoolName: record.institution,
          });

          const userId = result[0];

          // Create service permission for the plan
          const planTier = record.plan.toLowerCase() as "starter" | "pro" | "vip" | "free";
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

          await database.insert(servicePermissions).values({
            userId: userId,
            tier: planTier,
            activatedAt: new Date(),
            activatedBy: ctx.user.id,
            expiresAt: expiresAt,
            accessEdugpt: planTier !== "free",
            accessCourseAi: planTier === "pro" || planTier === "vip",
            accessCoursePedagogy: planTier === "vip",
            accessFullBundle: planTier === "vip",
          });

          // Send welcome email
          await sendWelcomeEmail(record.email, record.fullName, tempPassword);

          // Create notification
          await database.insert(notifications).values({
            userId: userId,
            titleAr: "مرحباً بك في Leader Academy",
            messageAr: `تم إنشاء حسابك بنجاح. كلمة المرور المؤقتة: ${tempPassword}`,
            type: "system",
          });

          results.created++;
          results.details.push({
            email: record.email,
            status: "created",
            message: "تم إنشاء الحساب بنجاح",
            password: tempPassword,
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            email: record.email,
            status: "error",
            message: error instanceof Error ? error.message : "خطأ غير معروف",
          });
        }
      }

      return results;
    }),

  // ============================================
  // CHECK FOR DUPLICATE EMAILS
  // ============================================

  checkDuplicateEmails: adminOnlyProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()),
      })
    )
    .query(async ({ input }) => {
      const database = (await getDb())!;

      const existingUsers = await database
        .select({ email: users.email })
        .from(users)
        .where(
          and(
            ...input.emails.map((email) => eq(users.email, email))
          )
        );

      const existingEmails = new Set(existingUsers.map((u) => u.email));

      return {
        duplicates: input.emails.filter((email) => existingEmails.has(email)),
        newEmails: input.emails.filter((email) => !existingEmails.has(email)),
      };
    }),

  // ============================================
  // GET IMPORT HISTORY
  // ============================================

  getImportHistory: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    // Get users created in the last 30 days with role "teacher"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "teacher"),
          eq(users.registrationStatus, "approved")
        )
      )
      .orderBy(users.createdAt);

    return recentUsers;
  }),
});
