/**
 * Content Adapter Router with Competency Points Integration
 * Tracks points when teachers save, export, or publish content
 */

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { adaptedContent, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { trackCompetencyPoints } from "../db";
import { z } from "zod";

export const contentAdapterWithPointsRouter = router({
  // ===== ADAPT CONTENT WITH POINTS TRACKING =====
  adaptContentAndTrackPoints: protectedProcedure
    .input(z.object({
      originalTitle: z.string().min(1, "عنوان الدرس مطلوب"),
      originalContent: z.string().min(10, "محتوى الدرس مطلوب (10 أحرف على الأقل)"),
      subject: z.string().optional(),
      gradeLevel: z.string().optional(),
      difficultyType: z.string().min(1, "نوع الصعوبة مطلوب"),
      adaptationLevel: z.enum(["light", "moderate", "intensive"]).default("moderate"),
      outputFormat: z.enum(["lesson_plan", "worksheet", "assessment"]).default("lesson_plan"),
      includeExamples: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const userId = ctx.user.id;

      try {
        // Generate adapted content using LLM
        const adaptedResult = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `أنت معلم خبير متخصص في تكييف المحتوى التعليمي للطلاب ذوي الصعوبات. قم بتكييف المحتوى التالي بمستوى ${input.adaptationLevel}.`,
            },
            {
              role: "user",
              content: `عنوان الدرس: ${input.originalTitle}\nالمحتوى الأصلي: ${input.originalContent}\nنوع الصعوبة: ${input.difficultyType}`,
            },
          ],
        });

        const adaptedText =
          typeof adaptedResult.choices[0].message.content === "string"
            ? adaptedResult.choices[0].message.content
            : "";

        // Save adapted content to database
        const result = await database
          .insert(adaptedContent)
          .values({
            userId: String(userId),
            originalTitle: input.originalTitle,
            originalContent: input.originalContent,
            adaptedContent: adaptedText,
            subject: input.subject,
            gradeLevel: input.gradeLevel,
            difficultyType: input.difficultyType,
            adaptationLevel: input.adaptationLevel,
            outputFormat: input.outputFormat,
            status: "completed",
            createdAt: new Date(),
          });
        
        const savedContentId = 1; // Placeholder - would get from result

        // Track competency points for content adaptation
        // EDUGPT equivalent: +3 points per saved lesson
        await trackCompetencyPoints(
          userId,
          "edugpt_sheet",
          String(savedContentId),
          "pedagogical_sheet"
        );

        return {
          success: true,
          contentId: savedContentId,
          adaptedContent: adaptedText,
          pointsAwarded: 3,
          message: "تم تكييف المحتوى بنجاح! ربحت 3 نقاط 🎉",
        };
      } catch (error) {
        console.error("[Content Adapter] Error adapting content:", error);
        throw new Error("فشل في تكييف المحتوى. يرجى المحاولة مرة أخرى.");
      }
    }),

  // ===== EXPORT ADAPTED CONTENT WITH POINTS =====
  exportContentAndTrackPoints: protectedProcedure
    .input(z.object({
      contentId: z.number(),
      format: z.enum(["pdf", "docx", "html"]).default("pdf"),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const userId = ctx.user.id;

      try {
        // Verify ownership
        const [content] = await database
          .select()
          .from(adaptedContent)
          .where(
            and(eq(adaptedContent.id, input.contentId), eq(adaptedContent.userId, String(userId)))
          );

        if (!content) {
          throw new Error("المحتوى غير موجود");
        }

        // Track export as content usage
        // Similar to test export: +5 points
        await trackCompetencyPoints(
          userId,
          "test_builder", // Using test_builder as equivalent for export
          String(input.contentId),
          "teacher_exam"
        );

        return {
          success: true,
          format: input.format,
          pointsAwarded: 5,
          message: `تم تصدير المحتوى بصيغة ${input.format}! ربحت 5 نقاط 🎉`,
          downloadUrl: `https://example.com/exports/${input.contentId}.${input.format}`,
        };
      } catch (error) {
        console.error("[Content Adapter] Error exporting content:", error);
        throw new Error("فشل في تصدير المحتوى");
      }
    }),

  // ===== PUBLISH TO MARKETPLACE WITH POINTS =====
  publishToMarketplaceAndTrackPoints: protectedProcedure
    .input(z.object({
      contentId: z.number(),
      title: z.string().min(1),
      description: z.string().min(10),
      subject: z.string(),
      gradeLevel: z.string(),
      price: z.number().min(0).default(0),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const userId = ctx.user.id;

      try {
        // Verify ownership
        const [content] = await database
          .select()
          .from(adaptedContent)
          .where(
            and(eq(adaptedContent.id, input.contentId), eq(adaptedContent.userId, String(userId)))
          );

        if (!content) {
          throw new Error("المحتوى غير موجود");
        }

        // Update content status to completed (published)
        await database
          .update(adaptedContent)
          .set({
            status: "completed",
          })
          .where(eq(adaptedContent.id, input.contentId));

        // Track marketplace publish: +8 points
        await trackCompetencyPoints(
          userId,
          "marketplace_publish",
          String(input.contentId),
          "marketplace_item"
        );

        return {
          success: true,
          contentId: input.contentId,
          pointsAwarded: 8,
          message: "تم نشر المحتوى في Marketplace! ربحت 8 نقاط 🎉",
          marketplaceUrl: `https://leaderacademy.school/marketplace/item/${input.contentId}`,
        };
      } catch (error) {
        console.error("[Content Adapter] Error publishing to marketplace:", error);
        throw new Error("فشل في نشر المحتوى");
      }
    }),

  // ===== GET POINTS HISTORY FOR CONTENT =====
  getPointsHistory: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const userId = ctx.user.id;

    try {
      // Get all user's adapted content
      const userContent = await database
        .select()
        .from(adaptedContent)
        .where(eq(adaptedContent.userId, String(userId)))
        .orderBy(desc(adaptedContent.createdAt))
        .limit(50);

      // Calculate points for each action
      const pointsHistory = userContent.map((item) => ({
        id: item.id,
        title: item.originalTitle,
        action: item.status === "completed" ? "حفظ الدرس" : "جاري المعالجة",
        points: item.status === "completed" ? 3 : 0,
        date: item.createdAt,
        status: item.status,
      }));

      const totalPoints = pointsHistory.reduce((sum, item) => sum + item.points, 0);

      return {
        history: pointsHistory,
        totalPoints,
        count: pointsHistory.length,
      };
    } catch (error) {
      console.error("[Content Adapter] Error getting points history:", error);
      throw new Error("فشل في جلب سجل النقاط");
    }
  }),
});
