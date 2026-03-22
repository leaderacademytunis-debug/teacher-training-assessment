import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { adaptedContent, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ===== CONTENT ADAPTER ROUTER =====
export const contentAdapterRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== GET ADAPTED CONTENT HISTORY =====
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;

      const items = await database.select().from(adaptedContent)
        .where(eq(adaptedContent.userId, String(ctx.user.id)))
        .orderBy(desc(adaptedContent.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await database.select({ total: count() }).from(adaptedContent)
        .where(eq(adaptedContent.userId, String(ctx.user.id)));

      return { items, total: totalResult?.total || 0 };
    }),

  // ===== GET SINGLE ADAPTED CONTENT =====
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [item] = await database.select().from(adaptedContent)
        .where(and(
          eq(adaptedContent.id, input.id),
          eq(adaptedContent.userId, String(ctx.user.id))
        ));
      return item || null;
    }),

  // ===== GET STATS =====
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const userId = String(ctx.user.id);

    const [totalResult] = await database.select({ total: count() }).from(adaptedContent)
      .where(eq(adaptedContent.userId, userId));

    const [completedResult] = await database.select({ total: count() }).from(adaptedContent)
      .where(and(eq(adaptedContent.userId, userId), eq(adaptedContent.status, "completed")));

    return {
      totalAdaptations: totalResult?.total || 0,
      completedAdaptations: completedResult?.total || 0,
    };
  }),

  // ===== ADAPT CONTENT =====
  adaptContent: protectedProcedure
    .input(z.object({
      originalTitle: z.string().min(1, "عنوان الدرس مطلوب"),
      originalContent: z.string().min(10, "محتوى الدرس مطلوب (10 أحرف على الأقل)"),
      subject: z.string().optional(),
      gradeLevel: z.string().optional(),
      difficultyType: z.string().min(1, "نوع الصعوبة مطلوب"),
      adaptationLevel: z.enum(["light", "moderate", "intensive"]).default("moderate"),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const userId = String(ctx.user.id);

      // Create record first
      const [insertResult] = await database.insert(adaptedContent).values({
        userId,
        originalTitle: input.originalTitle,
        originalContent: input.originalContent,
        subject: input.subject || null,
        gradeLevel: input.gradeLevel || null,
        difficultyType: input.difficultyType,
        adaptationLevel: input.adaptationLevel,
        status: "pending",
      });

      const recordId = insertResult.insertId;

      // Build the LLM prompt
      const adaptationLevelDesc: Record<string, string> = {
        light: "تكييف خفيف: تبسيط بسيط مع الحفاظ على معظم المحتوى الأصلي. تقسيم الجمل الطويلة، إضافة شرح للمصطلحات الصعبة.",
        moderate: "تكييف متوسط: إعادة صياغة شاملة مع تبسيط المفردات والبنية. إضافة أمثلة ملموسة ودعم بصري.",
        intensive: "تكييف مكثف: إعادة بناء كاملة للمحتوى بأبسط صورة ممكنة. استخدام جمل قصيرة جداً، صور ذهنية، وخطوات مجزّأة.",
      };

      const difficultyGuides: Record<string, string> = {
        dyslexia: "عسر القراءة (Dyslexia): استخدم جمل قصيرة وواضحة. تجنب الكلمات المتشابهة بصرياً. أضف مسافات أكبر بين الأسطر. استخدم خطاً واضحاً وكبيراً. قسّم النص إلى فقرات صغيرة مع عناوين فرعية. أضف ألوان للتمييز بين الأجزاء المهمة.",
        dysgraphia: "عسر الكتابة (Dysgraphia): قلّل من التمارين الكتابية. أضف خيارات الاختيار من متعدد. استخدم الرسومات والأشكال بدل الكتابة. أضف مساحات كبيرة للكتابة. قدّم نماذج مكتوبة للنسخ.",
        dyscalculia: "عسر الحساب (Dyscalculia): استخدم أمثلة ملموسة من الحياة اليومية. أضف رسومات وأشكال بصرية للأرقام. قسّم العمليات الحسابية لخطوات صغيرة. استخدم الألوان للتمييز بين الأرقام. أضف جداول مرجعية.",
        adhd: "فرط النشاط وتشتت الانتباه (ADHD): قسّم المحتوى لأجزاء قصيرة (5-10 دقائق). أضف أنشطة حركية بين الأجزاء. استخدم ألوان وصور جاذبة. أضف تعليمات واضحة ومختصرة. استخدم القوائم المرقمة.",
        autism: "اضطراب طيف التوحد (ASD): استخدم لغة حرفية ومباشرة. تجنب المجاز والاستعارات. أضف جداول زمنية مرئية. استخدم الصور التوضيحية. قدّم التعليمات خطوة بخطوة. حافظ على بنية ثابتة ومتوقعة.",
        intellectual: "صعوبات ذهنية: بسّط المفردات لأقصى حد. استخدم التكرار والتعزيز. أضف أمثلة حسية وملموسة. قسّم كل مفهوم لأجزاء صغيرة جداً. استخدم الصور والرموز بكثرة.",
        slow_learner: "بطء التعلم: أعد شرح المفاهيم بطرق متعددة. أضف تمارين تدريجية من السهل للصعب. كرّر المفاهيم الأساسية. أضف ملخصات في نهاية كل قسم. استخدم أمثلة من بيئة التلميذ.",
        visual_impairment: "ضعف البصر: استخدم خطاً كبيراً وواضحاً. أضف وصفاً نصياً لكل صورة. استخدم تباين ألوان عالي. تجنب المحتوى المعتمد على البصر فقط. أضف بدائل سمعية.",
      };

      const difficultyGuide = difficultyGuides[input.difficultyType] || difficultyGuides["slow_learner"];

      const systemPrompt = `أنت خبير في التربية الخاصة وتكييف المحتوى التعليمي لذوي صعوبات واضطرابات التعلم.
مهمتك: تحويل الدرس المقدم إلى نسخة مكيّفة تناسب التلاميذ ذوي الصعوبة المحددة.

قواعد التكييف:
${adaptationLevelDesc[input.adaptationLevel]}

إرشادات خاصة بنوع الصعوبة:
${difficultyGuide}

قواعد عامة:
- حافظ على المحتوى العلمي الصحيح مع تبسيط العرض
- استخدم اللغة العربية الفصحى المبسطة
- أضف رموز بصرية (إيموجي تعليمية) لتسهيل الفهم
- قسّم المحتوى لأقسام واضحة بعناوين
- أضف "نقاط تذكير" في نهاية كل قسم
- اقترح أنشطة تفاعلية مكيّفة

يجب أن يكون الرد بصيغة JSON بالهيكل التالي:
{
  "adaptedTitle": "العنوان المكيّف",
  "adaptedContent": "المحتوى المكيّف بالكامل (نص HTML مع تنسيق)",
  "simplifiedInstructions": ["تعليمة مبسّطة 1", "تعليمة 2", ...],
  "visualSupports": ["وصف دعم بصري 1", "وصف 2", ...],
  "adaptationNotes": {
    "whatChanged": ["ما تم تغييره 1", "ما تم تغييره 2", ...],
    "whyChanged": ["سبب التغيير 1", "سبب 2", ...],
    "teacherTips": ["نصيحة للمعلم 1", "نصيحة 2", ...]
  }
}`;

      const userPrompt = `عنوان الدرس: ${input.originalTitle}
${input.subject ? `المادة: ${input.subject}` : ""}
${input.gradeLevel ? `المستوى: ${input.gradeLevel}` : ""}
نوع الصعوبة: ${input.difficultyType}
مستوى التكييف: ${input.adaptationLevel}

محتوى الدرس الأصلي:
${input.originalContent}

قم بتكييف هذا الدرس وفقاً للإرشادات المحددة. أعد المحتوى بصيغة JSON.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "adapted_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  adaptedTitle: { type: "string", description: "العنوان المكيّف" },
                  adaptedContent: { type: "string", description: "المحتوى المكيّف بالكامل بصيغة HTML" },
                  simplifiedInstructions: { type: "array", items: { type: "string" }, description: "تعليمات مبسّطة" },
                  visualSupports: { type: "array", items: { type: "string" }, description: "اقتراحات دعم بصري" },
                  adaptationNotes: {
                    type: "object",
                    properties: {
                      whatChanged: { type: "array", items: { type: "string" }, description: "ما تم تغييره" },
                      whyChanged: { type: "array", items: { type: "string" }, description: "أسباب التغيير" },
                      teacherTips: { type: "array", items: { type: "string" }, description: "نصائح للمعلم" },
                    },
                    required: ["whatChanged", "whyChanged", "teacherTips"],
                    additionalProperties: false,
                  },
                },
                required: ["adaptedTitle", "adaptedContent", "simplifiedInstructions", "visualSupports", "adaptationNotes"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");

        const parsed = JSON.parse(String(content));

        // Update the record with results
        await database.update(adaptedContent)
          .set({
            adaptedTitle: parsed.adaptedTitle,
            adaptedContentText: parsed.adaptedContent,
            simplifiedInstructions: parsed.simplifiedInstructions,
            visualSupports: parsed.visualSupports,
            adaptationNotes: parsed.adaptationNotes,
            status: "completed",
          })
          .where(eq(adaptedContent.id, Number(recordId)));

        // Return the full record
        const [updated] = await database.select().from(adaptedContent)
          .where(eq(adaptedContent.id, Number(recordId)));

        return updated;
      } catch (error: any) {
        // Mark as failed
        await database.update(adaptedContent)
          .set({ status: "failed" })
          .where(eq(adaptedContent.id, Number(recordId)));

        throw new Error(`فشل في تكييف المحتوى: ${error.message}`);
      }
    }),

  // ===== DELETE ADAPTED CONTENT =====
  deleteContent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(adaptedContent)
        .where(and(
          eq(adaptedContent.id, input.id),
          eq(adaptedContent.userId, String(ctx.user.id))
        ));
      return { success: true };
    }),
});
