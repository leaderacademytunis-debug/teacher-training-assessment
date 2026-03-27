import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * Ultimate Studio Router
 * Provides the "Page Extractor" endpoint that reads a specific page
 * from a PDF URL using LLM Vision and returns the extracted text.
 */

export const ultimateStudioRouter = router({
  /**
   * Extract text from a specific PDF page using LLM Vision
   * The frontend renders the page to a canvas, converts to base64, and sends it here.
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
   * Takes extracted text and generates a structured scenario in one step
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
});
