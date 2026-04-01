import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { teacherPortfolios, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

export const profileBuilderRouter = router({
  /**
   * Get teacher profile for onboarding
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const profile = await db
      .select()
      .from(teacherPortfolios)
      .where(eq(teacherPortfolios.userId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) {
      // Create default profile if doesn't exist
      const newProfile = await db.insert(teacherPortfolios).values({
        userId: ctx.user.id,
        isAvailableForJobs: true,
      });
      return null;
    }

    return profile[0];
  }),

  /**
   * Upload avatar image to S3
   */
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        base64Data: z.string(),
        fileExtension: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Data, "base64");

        // Generate unique filename
        const fileName = `avatars/${ctx.user.id}-${Date.now()}.${input.fileExtension}`;

        // Upload to S3
        const { url } = await storagePut(fileName, buffer, input.mimeType);

        return { url, success: true };
      } catch (error) {
        console.error("Avatar upload error:", error);
        throw new Error("فشل رفع الصورة. حاول مرة أخرى.");
      }
    }),

  /**
   * Save teacher profile (onboarding completion)
   */
  saveProfile: protectedProcedure
    .input(
      z.object({
        avatarUrl: z.string().optional(),
        fullName: z.string().min(2, "الاسم الكامل مطلوب"),
        phone: z.string().min(8, "رقم الهاتف غير صحيح"),
        subject: z.string().min(1, "المادة مطلوبة"),
        teachingLevel: z.enum(["primary", "middle", "secondary"]),
        yearsOfExperience: z.number().int().min(0).max(50).optional(),
        isAvailableForJobs: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Update user name if provided
        if (input.fullName) {
          const nameParts = input.fullName.trim().split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          await db
            .update(users)
            .set({
              arabicName: input.fullName,
              phone: input.phone,
            })
            .where(eq(users.id, ctx.user.id));
        }

        // Check if profile exists
        const existingProfile = await db
          .select()
          .from(teacherPortfolios)
          .where(eq(teacherPortfolios.userId, ctx.user.id))
          .limit(1);

        if (existingProfile.length === 0) {
          // Create new profile
          await db.insert(teacherPortfolios).values({
            userId: ctx.user.id,
            avatarUrl: input.avatarUrl,
            subject: input.subject,
            teachingLevel: input.teachingLevel,
            yearsOfExperience: input.yearsOfExperience,
            isAvailableForJobs: input.isAvailableForJobs,
            profileCompletedAt: new Date(),
          });
        } else {
          // Update existing profile
          await db
            .update(teacherPortfolios)
            .set({
              avatarUrl: input.avatarUrl,
              subject: input.subject,
              teachingLevel: input.teachingLevel,
              yearsOfExperience: input.yearsOfExperience,
              isAvailableForJobs: input.isAvailableForJobs,
              profileCompletedAt: new Date(),
            })
            .where(eq(teacherPortfolios.userId, ctx.user.id));
        }

        return { success: true, message: "تم حفظ الملف المهني بنجاح" };
      } catch (error) {
        console.error("Profile save error:", error);
        throw new Error("فشل حفظ الملف المهني. حاول مرة أخرى.");
      }
    }),

  /**
   * Check if profile is already completed
   */
  isProfileCompleted: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const profile = await db
      .select()
      .from(teacherPortfolios)
      .where(eq(teacherPortfolios.userId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) return false;

    // Profile is complete if it has subject, teachingLevel, and profileCompletedAt
    return (
      profile[0].subject !== null &&
      profile[0].teachingLevel !== null &&
      profile[0].profileCompletedAt !== null
    );
  }),

  /**
   * Get all teacher profiles for TalentRadar (public data only)
   */
  getAllTeacherProfiles: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const profiles = await db
      .select({
        id: teacherPortfolios.id,
        userId: teacherPortfolios.userId,
        avatarUrl: teacherPortfolios.avatarUrl,
        subject: teacherPortfolios.subject,
        teachingLevel: teacherPortfolios.teachingLevel,
        yearsOfExperience: teacherPortfolios.yearsOfExperience,
        lessonsCreated: teacherPortfolios.lessonsCreated,
        videosCreated: teacherPortfolios.videosCreated,
        isAvailableForJobs: teacherPortfolios.isAvailableForJobs,
        userName: users.arabicName,
        userPhone: users.phone,
        userEmail: users.email,
      })
      .from(teacherPortfolios)
      .innerJoin(users, eq(teacherPortfolios.userId, users.id))
      .where(eq(teacherPortfolios.isAvailableForJobs, true));

    return profiles;
  }),
});
