import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const textbookOCRRouter = router({
  /**
   * Extract text from a cropped image region using LLM vision
   * Uses the built-in LLM with image understanding to perform OCR
   */
  extractText: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string().describe("Base64-encoded PNG image of the selected region"),
        fileName: z.string().optional(),
        pageNumber: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { imageBase64, fileName, pageNumber } = input;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `أنت محرك استخراج نصوص متخصص في الكتب المدرسية التونسية. مهمتك:
1. استخراج النص الموجود في الصورة بدقة تامة
2. الحفاظ على التنسيق الأصلي (عناوين، فقرات، قوائم)
3. دعم اللغتين العربية والفرنسية
4. إذا كان النص يحتوي على أرقام أو رموز رياضية، اكتبها بدقة
5. لا تضف أي تعليقات أو شروحات، فقط النص المستخرج كما هو

قواعد مهمة:
- إذا كان النص بالعربية، اكتبه بالعربية
- إذا كان بالفرنسية، اكتبه بالفرنسية
- إذا كان مختلطاً، حافظ على اللغتين
- لا تترجم أي شيء`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text" as const,
                  text: `استخرج النص الموجود في هذه الصورة المقتطعة من ${fileName ? `كتاب "${fileName}"` : "كتاب مدرسي"}${pageNumber ? ` (صفحة ${pageNumber})` : ""}. أعد النص فقط بدون أي إضافات.`,
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: imageBase64,
                    detail: "high" as const,
                  },
                },
              ],
            },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const extractedText = typeof rawContent === 'string' ? rawContent.trim() : '';

        return {
          text: extractedText,
          fileName: fileName || "",
          pageNumber: pageNumber || 0,
          charCount: extractedText.length,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "خطأ غير معروف";
        throw new Error(`فشل استخراج النص: ${message}`);
      }
    }),
});
