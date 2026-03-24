import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { generatedTherapeuticExercises, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count, like } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ===== DIFFICULTY TYPES =====
const DIFFICULTY_TYPES = [
  "dyslexia", "dysgraphia", "dyscalculia", "dysphasia",
  "adhd", "asd", "slow_learning", "intellectual_disability"
] as const;

// ===== EXERCISE CATEGORIES =====
const EXERCISE_CATEGORIES = [
  "motor_skills",        // مهارات حركية دقيقة
  "visual_perception",   // إدراك بصري
  "auditory_processing", // معالجة سمعية
  "reading_skills",      // مهارات القراءة
  "writing_skills",      // مهارات الكتابة
  "math_skills",         // مهارات حسابية
  "attention_focus",     // انتباه وتركيز
  "memory_training",     // تدريب الذاكرة
  "social_skills",       // مهارات اجتماعية
  "language_expression", // تعبير لغوي
  "comprehension",       // فهم واستيعاب
  "organization",        // تنظيم وتخطيط
] as const;

// ===== ARABIC LABELS =====
const DIFFICULTY_TYPE_LABELS: Record<string, string> = {
  dyslexia: "عسر القراءة (Dyslexia)",
  dysgraphia: "عسر الكتابة (Dysgraphia)",
  dyscalculia: "عسر الحساب (Dyscalculia)",
  dysphasia: "عسر النطق (Dysphasia)",
  adhd: "فرط النشاط ونقص الانتباه (ADHD)",
  asd: "طيف التوحد (ASD)",
  slow_learning: "بطء التعلم",
  intellectual_disability: "إعاقة ذهنية",
};

const EXERCISE_CATEGORY_LABELS: Record<string, string> = {
  motor_skills: "مهارات حركية دقيقة",
  visual_perception: "إدراك بصري",
  auditory_processing: "معالجة سمعية",
  reading_skills: "مهارات القراءة",
  writing_skills: "مهارات الكتابة",
  math_skills: "مهارات حسابية",
  attention_focus: "انتباه وتركيز",
  memory_training: "تدريب الذاكرة",
  social_skills: "مهارات اجتماعية",
  language_expression: "تعبير لغوي",
  comprehension: "فهم واستيعاب",
  organization: "تنظيم وتخطيط",
};

const DIFFICULTY_LEVEL_LABELS: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

// ===== ROUTER =====
export const therapeuticExercisesRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== GET EXERCISE HISTORY =====
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;
      const items = await database.select().from(generatedTherapeuticExercises)
        .where(eq(generatedTherapeuticExercises.userId, String(ctx.user.id)))
        .orderBy(desc(generatedTherapeuticExercises.createdAt))
        .limit(limit).offset(offset);
      const [total] = await database.select({ count: count() }).from(generatedTherapeuticExercises)
        .where(eq(generatedTherapeuticExercises.userId, String(ctx.user.id)));
      return { items, total: total?.count || 0 };
    }),

  // ===== GET SINGLE EXERCISE SET =====
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [item] = await database.select().from(generatedTherapeuticExercises)
        .where(and(
          eq(generatedTherapeuticExercises.id, input.id),
          eq(generatedTherapeuticExercises.userId, String(ctx.user.id))
        ));
      return item || null;
    }),

  // ===== GENERATE THERAPEUTIC EXERCISES =====
  generate: protectedProcedure
    .input(z.object({
      studentName: z.string().optional(),
      studentAge: z.number().min(3).max(18).optional(),
      gradeLevel: z.string().optional(),
      difficultyType: z.string(),
      exerciseCategory: z.string(),
      difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
      subject: z.string().optional(),
      specificSkill: z.string().optional(),
      sessionDuration: z.number().min(5).max(60).default(20),
      exerciseCount: z.number().min(3).max(10).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      const difficultyLabel = DIFFICULTY_TYPE_LABELS[input.difficultyType] || input.difficultyType;
      const categoryLabel = EXERCISE_CATEGORY_LABELS[input.exerciseCategory] || input.exerciseCategory;
      const levelLabel = DIFFICULTY_LEVEL_LABELS[input.difficultyLevel] || input.difficultyLevel;

      // Create initial record
      const [inserted] = await database.insert(generatedTherapeuticExercises).values({
        userId: String(ctx.user.id),
        studentName: input.studentName || null,
        studentAge: input.studentAge || null,
        gradeLevel: input.gradeLevel || null,
        difficultyType: input.difficultyType,
        exerciseCategory: input.exerciseCategory,
        difficultyLevel: input.difficultyLevel,
        subject: input.subject || null,
        specificSkill: input.specificSkill || null,
        sessionDuration: input.sessionDuration,
        exerciseCount: input.exerciseCount,
        status: "pending",
      });

      const recordId = inserted.insertId;

      try {
        // Build the LLM prompt
        const studentInfo = input.studentName 
          ? `اسم التلميذ: ${input.studentName}${input.studentAge ? `، العمر: ${input.studentAge} سنوات` : ""}${input.gradeLevel ? `، المستوى: ${input.gradeLevel}` : ""}`
          : "تلميذ مجهول الهوية";

        const prompt = `أنت خبير في التربية الخاصة وعلاج صعوبات التعلم. مهمتك هي توليد مجموعة تمارين علاجية تدريجية مخصصة.

## معلومات التلميذ:
${studentInfo}

## إعدادات التمارين:
- نوع الاضطراب: ${difficultyLabel}
- فئة التمارين: ${categoryLabel}
- مستوى الصعوبة: ${levelLabel}
${input.subject ? `- المادة الدراسية: ${input.subject}` : ""}
${input.specificSkill ? `- المهارة المستهدفة: ${input.specificSkill}` : ""}
- مدة الحصة: ${input.sessionDuration} دقيقة
- عدد التمارين المطلوب: ${input.exerciseCount}

## المطلوب:
أنشئ مجموعة تمارين علاجية تدريجية (من الأسهل إلى الأصعب) مع مراعاة:
1. أن تكون التمارين مناسبة لنوع الاضطراب المحدد
2. أن تتدرج في الصعوبة بشكل منطقي
3. أن تكون التعليمات واضحة وبسيطة
4. أن تتضمن تلميحات مساعدة للمعلم
5. أن تشمل نشاط تهدئة في النهاية
6. أن تتضمن إرشادات للأولياء لمواصلة العمل في المنزل

أجب بصيغة JSON فقط بالهيكل التالي:
{
  "title": "عنوان مجموعة التمارين بالعربية",
  "introduction": "مقدمة تشرح الهدف من هذه التمارين وكيفية تقديمها للتلميذ (3-4 جمل)",
  "exercises": [
    {
      "order": 1,
      "title": "عنوان التمرين",
      "type": "نوع التمرين (حركي/بصري/سمعي/كتابي/شفوي/لعبة/...)",
      "instructions": "تعليمات واضحة ومبسطة للمعلم حول كيفية تقديم التمرين",
      "content": "محتوى التمرين نفسه (النص أو الوصف التفصيلي للنشاط)",
      "expectedResponse": "الإجابة أو الأداء المتوقع من التلميذ",
      "hint": "تلميح يمكن تقديمه للتلميذ إذا واجه صعوبة",
      "adaptationTip": "نصيحة لتكييف التمرين حسب مستوى التلميذ",
      "duration": 4,
      "materials": ["قائمة المواد المطلوبة"]
    }
  ],
  "cooldownActivity": "وصف نشاط تهدئة مناسب في نهاية الحصة (2-3 جمل)",
  "teacherNotes": {
    "objectives": ["الأهداف التعلمية المستهدفة"],
    "prerequisites": ["المتطلبات القبلية"],
    "successIndicators": ["مؤشرات النجاح والتقدم"],
    "commonMistakes": ["الأخطاء الشائعة وكيفية معالجتها"],
    "extensionIdeas": ["أفكار للتوسيع والتعميق"]
  },
  "parentGuidance": "إرشادات مفصلة للأولياء لمواصلة العمل في المنزل (4-5 جمل)"
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت خبير في التربية الخاصة وعلاج صعوبات التعلم. أجب دائماً بصيغة JSON صحيحة باللغة العربية." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "therapeutic_exercises",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  introduction: { type: "string" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        order: { type: "number" },
                        title: { type: "string" },
                        type: { type: "string" },
                        instructions: { type: "string" },
                        content: { type: "string" },
                        expectedResponse: { type: "string" },
                        hint: { type: "string" },
                        adaptationTip: { type: "string" },
                        duration: { type: "number" },
                        materials: { type: "array", items: { type: "string" } },
                      },
                      required: ["order", "title", "type", "instructions", "content", "expectedResponse", "hint", "adaptationTip", "duration", "materials"],
                      additionalProperties: false,
                    },
                  },
                  cooldownActivity: { type: "string" },
                  teacherNotes: {
                    type: "object",
                    properties: {
                      objectives: { type: "array", items: { type: "string" } },
                      prerequisites: { type: "array", items: { type: "string" } },
                      successIndicators: { type: "array", items: { type: "string" } },
                      commonMistakes: { type: "array", items: { type: "string" } },
                      extensionIdeas: { type: "array", items: { type: "string" } },
                    },
                    required: ["objectives", "prerequisites", "successIndicators", "commonMistakes", "extensionIdeas"],
                    additionalProperties: false,
                  },
                  parentGuidance: { type: "string" },
                },
                required: ["title", "introduction", "exercises", "cooldownActivity", "teacherNotes", "parentGuidance"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

        // Update record with generated content
        await database.update(generatedTherapeuticExercises)
          .set({
            title: parsed.title,
            introduction: parsed.introduction,
            exercises: parsed.exercises,
            cooldownActivity: parsed.cooldownActivity,
            teacherNotes: parsed.teacherNotes,
            parentGuidance: parsed.parentGuidance,
            status: "completed",
          })
          .where(eq(generatedTherapeuticExercises.id, Number(recordId)));

        return {
          id: Number(recordId),
          title: parsed.title,
          introduction: parsed.introduction,
          exercises: parsed.exercises,
          cooldownActivity: parsed.cooldownActivity,
          teacherNotes: parsed.teacherNotes,
          parentGuidance: parsed.parentGuidance,
          status: "completed" as const,
        };
      } catch (error: any) {
        // Mark as failed
        await database.update(generatedTherapeuticExercises)
          .set({ status: "failed" })
          .where(eq(generatedTherapeuticExercises.id, Number(recordId)));
        throw new Error(`فشل في توليد التمارين: ${error.message}`);
      }
    }),

  // ===== DELETE EXERCISE SET =====
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(generatedTherapeuticExercises)
        .where(and(
          eq(generatedTherapeuticExercises.id, input.id),
          eq(generatedTherapeuticExercises.userId, String(ctx.user.id))
        ));
      return { success: true };
    }),

  // ===== GET BY STUDENT NAME (cross-tool integration) =====
  getByStudentName: protectedProcedure
    .input(z.object({ studentName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const exercises = await database.select().from(generatedTherapeuticExercises)
        .where(and(
          eq(generatedTherapeuticExercises.userId, String(ctx.user.id)),
          like(generatedTherapeuticExercises.studentName, `%${input.studentName}%`),
          eq(generatedTherapeuticExercises.status, "completed")
        ))
        .orderBy(desc(generatedTherapeuticExercises.createdAt))
        .limit(50);
      return exercises;
    }),

  // ===== GET STATS =====
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const [total] = await database.select({ count: count() }).from(generatedTherapeuticExercises)
      .where(eq(generatedTherapeuticExercises.userId, String(ctx.user.id)));
    const [completed] = await database.select({ count: count() }).from(generatedTherapeuticExercises)
      .where(and(
        eq(generatedTherapeuticExercises.userId, String(ctx.user.id)),
        eq(generatedTherapeuticExercises.status, "completed")
      ));
    return {
      total: total?.count || 0,
      completed: completed?.count || 0,
    };
  }),
});
