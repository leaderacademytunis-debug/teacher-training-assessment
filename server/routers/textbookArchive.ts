import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { textbookExcerpts } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const textbookArchiveRouter = router({
  // Extract text from image using LLM Vision (OCR)
  extractText: protectedProcedure
    .input(z.object({
      imageBase64: z.string(), // data:image/png;base64,...
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
2. حافظ على التنسيق الأصلي (فقرات، عناوين، قوائم)
3. إذا كان النص بالعربية، اكتبه بالعربية. إذا كان بالفرنسية، اكتبه بالفرنسية
4. لا تضف أي تعليقات أو شروحات - فقط النص المستخرج
5. إذا لم تجد نصاً واضحاً، أعد سلسلة فارغة`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text" as const,
                  text: "استخرج النص الموجود في هذه الصورة من الكتاب المدرسي:",
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

        return { text };
      } catch (err) {
        console.error("[TextbookOCR] Extraction failed:", err);
        return { text: "" };
      }
    }),

  // Save excerpt to archive
  saveExcerpt: protectedProcedure
    .input(z.object({
      content: z.string().min(1),
      sourceFileName: z.string().optional(),
      sourcePageNumber: z.number().optional(),
      bookId: z.string().optional(),
      bookTitle: z.string().optional(),
      title: z.string().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const [result] = await db!.insert(textbookExcerpts).values({
        userId: ctx.user.id,
        content: input.content,
        sourceFileName: input.sourceFileName || null,
        sourcePageNumber: input.sourcePageNumber || null,
        bookId: input.bookId || null,
        bookTitle: input.bookTitle || null,
        title: input.title || null,
        notes: input.notes || null,
        tags: input.tags || null,
      });
      return { id: result.insertId, success: true };
    }),

  // Get user's archived excerpts
  myExcerpts: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;
      const excerpts = await db!.select()
        .from(textbookExcerpts)
        .where(eq(textbookExcerpts.userId, ctx.user.id))
        .orderBy(desc(textbookExcerpts.createdAt))
        .limit(limit)
        .offset(offset);
      return excerpts;
    }),

  // Delete an excerpt
  deleteExcerpt: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db!.delete(textbookExcerpts)
        .where(and(
          eq(textbookExcerpts.id, input.id),
          eq(textbookExcerpts.userId, ctx.user.id),
        ));
      return { success: true };
    }),
});
