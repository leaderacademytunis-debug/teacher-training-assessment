import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { studioProjects } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Ultimate Studio Router
 * Provides:
 * - Page text extraction via LLM Vision
 * - Quick scenario generation
 * - Project save/load/list/delete for auto-save
 */

export const ultimateStudioRouter = router({
  /**
   * Extract text from a specific PDF page using LLM Vision
   */
  extractPageText: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(10, "صورة الصفحة مطلوبة"),
      pageNumber: z.number().min(1),
      fileName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `أنت نظام OCR متقدم متخصص في استخراج النصوص من الكتب المدرسية التونسية.
قواعد الاستخراج:
1. استخرج النص بالضبط كما هو مكتوب في الصورة
2. حافظ على التنسيق الأصلي (فقرات، عناوين، قوائم مرقمة)
3. إذا كان النص بالعربية، اكتبه بالعربية. إذا كان بالفرنسية، اكتبه بالفرنسية
4. لا تضف أي تعليقات أو شروحات - فقط النص المستخرج
5. حافظ على ترتيب الفقرات والعناوين كما تظهر في الصفحة
6. إذا وجدت جداول، حاول إعادة تمثيلها بنص منسق
7. إذا لم تجد نصاً واضحاً، أعد وصفاً موجزاً لمحتوى الصفحة`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text" as const,
                  text: `استخرج كل النص الموجود في الصفحة رقم ${input.pageNumber} من الكتاب المدرسي:`,
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: input.imageBase64,
                    detail: "high" as const,
                  },
                },
              ],
            },
          ],
        });

        const text = typeof response?.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content.trim()
          : "";

        return {
          text,
          pageNumber: input.pageNumber,
          fileName: input.fileName || "",
        };
      } catch (err: any) {
        console.error("[UltimateStudio] Page extraction failed:", err?.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في استخراج النص من الصفحة. حاول مجدداً.",
        });
      }
    }),

  /**
   * Quick scenario generation optimized for the pipeline flow
   */
  quickScenario: protectedProcedure
    .input(z.object({
      text: z.string().min(10, "النص قصير جداً"),
      numberOfScenes: z.number().min(2).max(8).default(4),
      targetAudience: z.string().default("تلاميذ المرحلة الابتدائية"),
      language: z.enum(["ar", "fr"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      const langInstruction = input.language === "fr"
        ? "Write all scene content in French."
        : "اكتب محتوى المشاهد بالعربية.";

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت مخرج فيديو تعليمي محترف. حلل النص المدرسي وقسمه إلى ${input.numberOfScenes} مشاهد سينمائية.
${langInstruction}

لكل مشهد أعطِ:
- عنوان قصير
- وصف بصري مفصل (ألوان، كاميرا، إضاءة)
- النص التعليمي المرتبط
- نص التعليق الصوتي (ما سيُقال)
- أمر بصري بالإنجليزية لتوليد الصورة (Visual Prompt)
- المدة المقترحة بالثواني

أجب بصيغة JSON فقط.`,
          },
          {
            role: "user",
            content: `النص المدرسي:\n\n${input.text}\n\nالجمهور: ${input.targetAudience}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "quick_scenario",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      title: { type: "string" },
                      description: { type: "string" },
                      educationalContent: { type: "string" },
                      spokenText: { type: "string" },
                      visualPrompt: { type: "string" },
                      duration: { type: "integer" },
                    },
                    required: ["sceneNumber", "title", "description", "educationalContent", "spokenText", "visualPrompt", "duration"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "summary", "scenes"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices?.[0]?.message?.content;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد السيناريو" });

      try {
        return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحليل السيناريو" });
      }
    }),

  // =================== PROJECT SAVE/LOAD ===================

  /**
   * Save or update a project (auto-save or manual save)
   */
  saveProject: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(), // If provided, update existing
      title: z.string().min(1).max(255),
      pdfUrl: z.string().optional(),
      pdfFileName: z.string().optional(),
      currentPage: z.number().optional(),
      extractedText: z.string().optional(),
      scriptContent: z.string().optional(),
      scenarioData: z.any().optional(),
      visualPromptsData: z.any().optional(),
      voiceoverData: z.any().optional(),
      generatedImages: z.any().optional(),
      generatedAudios: z.any().optional(),
      status: z.enum(["draft", "in_progress", "completed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;

      if (input.projectId) {
        // Update existing project
        const [existing] = await db
          .select({ id: studioProjects.id })
          .from(studioProjects)
          .where(and(
            eq(studioProjects.id, input.projectId),
            eq(studioProjects.userId, userId),
          ))
          .limit(1);

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
        }

        await db.update(studioProjects)
          .set({
            title: input.title,
            pdfUrl: input.pdfUrl ?? null,
            pdfFileName: input.pdfFileName ?? null,
            currentPage: input.currentPage ?? 1,
            extractedText: input.extractedText ?? null,
            scriptContent: input.scriptContent ?? null,
            scenarioData: input.scenarioData ?? null,
            visualPromptsData: input.visualPromptsData ?? null,
            voiceoverData: input.voiceoverData ?? null,
            generatedImages: input.generatedImages ?? null,
            generatedAudios: input.generatedAudios ?? null,
            status: input.status ?? "in_progress",
          })
          .where(eq(studioProjects.id, input.projectId));

        return { id: input.projectId, saved: true };
      } else {
        // Create new project
        const [result] = await db.insert(studioProjects).values({
          userId,
          title: input.title,
          studioType: "ultimate_studio",
          pdfUrl: input.pdfUrl ?? null,
          pdfFileName: input.pdfFileName ?? null,
          currentPage: input.currentPage ?? 1,
          extractedText: input.extractedText ?? null,
          scriptContent: input.scriptContent ?? null,
          scenarioData: input.scenarioData ?? null,
          visualPromptsData: input.visualPromptsData ?? null,
          voiceoverData: input.voiceoverData ?? null,
          generatedImages: input.generatedImages ?? null,
          generatedAudios: input.generatedAudios ?? null,
          status: input.status ?? "draft",
        });

        return { id: result.insertId, saved: true };
      }
    }),

  /**
   * List all projects for the current user (Ultimate Studio only)
   */
  listProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const userId = ctx.user!.id;
      const projects = await db
        .select({
          id: studioProjects.id,
          title: studioProjects.title,
          pdfFileName: studioProjects.pdfFileName,
          status: studioProjects.status,
          studioType: studioProjects.studioType,
          createdAt: studioProjects.createdAt,
          updatedAt: studioProjects.updatedAt,
        })
        .from(studioProjects)
        .where(and(
          eq(studioProjects.userId, userId),
          eq(studioProjects.studioType, "ultimate_studio"),
        ))
        .orderBy(desc(studioProjects.updatedAt))
        .limit(50);

      return projects;
    }),

  /**
   * Load a specific project with all data
   */
  loadProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      const [project] = await db
        .select()
        .from(studioProjects)
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ))
        .limit(1);

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      return project;
    }),

  /**
   * Delete a project
   */
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      const [existing] = await db
        .select({ id: studioProjects.id })
        .from(studioProjects)
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      await db.delete(studioProjects)
        .where(eq(studioProjects.id, input.projectId));

      return { deleted: true };
    }),

  /**
   * Rename a project
   */
  renameProject: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      await db.update(studioProjects)
        .set({ title: input.title })
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ));

      return { renamed: true };
    }),
});
