import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { progressEvaluations, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ===== PROGRESS EVALUATOR ROUTER =====
export const progressEvaluatorRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== GET EVALUATIONS HISTORY =====
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;

      const items = await database.select().from(progressEvaluations)
        .where(eq(progressEvaluations.userId, String(ctx.user.id)))
        .orderBy(desc(progressEvaluations.createdAt))
        .limit(limit).offset(offset);

      const totalResult = await database.select({ total: count() }).from(progressEvaluations)
        .where(eq(progressEvaluations.userId, String(ctx.user.id)));

      return { items, total: totalResult[0]?.total || 0 };
    }),

  // ===== GET STATS =====
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const totalResult = await database.select({ total: count() }).from(progressEvaluations)
      .where(and(eq(progressEvaluations.userId, String(ctx.user.id)), eq(progressEvaluations.status, "completed")));
    return { totalEvaluations: totalResult[0]?.total || 0 };
  }),

  // ===== GENERATE PROGRESS EVALUATION =====
  generate: protectedProcedure
    .input(z.object({
      studentName: z.string().min(1),
      studentAge: z.number().min(3).max(18).optional(),
      gradeLevel: z.string().optional(),
      difficultyType: z.string().min(1),
      evaluationStartDate: z.string().min(1),
      evaluationEndDate: z.string().min(1),
      assessmentData: z.array(z.object({
        date: z.string(),
        label: z.string(),
        scores: z.object({
          reading: z.number().min(0).max(10),
          writing: z.number().min(0).max(10),
          math: z.number().min(0).max(10),
          attention: z.number().min(0).max(10),
          social: z.number().min(0).max(10),
          motivation: z.number().min(0).max(10),
        }),
        notes: z.string().optional(),
      })).min(2),
      exercisesCompleted: z.array(z.object({
        category: z.string(),
        count: z.number(),
        successRate: z.number(),
        averageDuration: z.number(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      // Insert pending record
      const insertResult: any = await database.insert(progressEvaluations).values({
        userId: String(ctx.user.id),
        studentName: input.studentName,
        studentAge: input.studentAge,
        gradeLevel: input.gradeLevel,
        difficultyType: input.difficultyType,
        evaluationStartDate: input.evaluationStartDate,
        evaluationEndDate: input.evaluationEndDate,
        assessmentData: input.assessmentData,
        exercisesCompleted: input.exercisesCompleted,
        status: "pending",
      });

      const evalId = insertResult[0].insertId;

      const difficultyLabels: Record<string, string> = {
        dyslexia: "عسر القراءة",
        dysgraphia: "عسر الكتابة",
        dyscalculia: "عسر الحساب",
        adhd: "فرط النشاط وتشتت الانتباه",
        asd: "اضطراب طيف التوحد",
        dysphasia: "عسر النطق",
        slow_learning: "بطء التعلم",
        intellectual_disability: "إعاقة ذهنية",
      };

      const assessmentSummary = input.assessmentData.map(a =>
        `${a.label} (${a.date}): قراءة ${a.scores.reading}/10، كتابة ${a.scores.writing}/10، رياضيات ${a.scores.math}/10، انتباه ${a.scores.attention}/10، اجتماعي ${a.scores.social}/10، دافعية ${a.scores.motivation}/10${a.notes ? ` - ملاحظات: ${a.notes}` : ''}`
      ).join("\n");

      let exercisesSummary = "";
      if (input.exercisesCompleted && input.exercisesCompleted.length > 0) {
        exercisesSummary = "\n\nالتمارين المنجزة:\n" + input.exercisesCompleted.map(e =>
          `${e.category}: ${e.count} تمرين، نسبة النجاح ${e.successRate}%، متوسط المدة ${e.averageDuration} دقيقة`
        ).join("\n");
      }

      // Calculate changes
      const firstAssessment = input.assessmentData[0].scores;
      const lastAssessment = input.assessmentData[input.assessmentData.length - 1].scores;
      const changes = {
        reading: lastAssessment.reading - firstAssessment.reading,
        writing: lastAssessment.writing - firstAssessment.writing,
        math: lastAssessment.math - firstAssessment.math,
        attention: lastAssessment.attention - firstAssessment.attention,
        social: lastAssessment.social - firstAssessment.social,
        motivation: lastAssessment.motivation - firstAssessment.motivation,
      };

      try {
        const prompt = `أنت خبير تربوي متخصص في تحليل تقدم التلاميذ ذوي صعوبات التعلم. قم بتحليل بيانات التقييم التالية وإعداد تقرير تقييم تقدم شامل:

معلومات التلميذ:
- الاسم: ${input.studentName}
- العمر: ${input.studentAge || 'غير محدد'} سنة
- المستوى الدراسي: ${input.gradeLevel || 'غير محدد'}
- نوع الصعوبة: ${difficultyLabels[input.difficultyType] || input.difficultyType}

فترة التقييم: من ${input.evaluationStartDate} إلى ${input.evaluationEndDate}

بيانات التقييمات الدورية:
${assessmentSummary}
${exercisesSummary}

التغيرات بين أول وآخر تقييم:
القراءة: ${changes.reading > 0 ? '+' : ''}${changes.reading}، الكتابة: ${changes.writing > 0 ? '+' : ''}${changes.writing}، الرياضيات: ${changes.math > 0 ? '+' : ''}${changes.math}
الانتباه: ${changes.attention > 0 ? '+' : ''}${changes.attention}، التفاعل: ${changes.social > 0 ? '+' : ''}${changes.social}، الدافعية: ${changes.motivation > 0 ? '+' : ''}${changes.motivation}

أعد التحليل بصيغة JSON بالهيكل التالي:
{
  "analysisTitle": "عنوان تقرير التقييم",
  "overallProgress": "significant_improvement أو moderate_improvement أو slight_improvement أو stable أو slight_decline أو needs_attention",
  "progressPercentage": رقم من 0 إلى 100 يمثل نسبة التقدم الإجمالي,
  "detailedAnalysis": "تحليل مفصل شامل (4-5 فقرات)",
  "trendAnalysis": "تحليل الاتجاهات والأنماط في البيانات (3-4 فقرات)",
  "skillsImproved": [
    {"skill": "اسم المهارة", "fromScore": الدرجة الأولى, "toScore": الدرجة الأخيرة, "changePercent": نسبة التغير}
  ],
  "skillsNeedingWork": [
    {"skill": "اسم المهارة", "currentScore": الدرجة الحالية, "targetScore": الدرجة المستهدفة, "suggestedActivities": ["نشاط 1", "نشاط 2"]}
  ],
  "predictiveInsights": "رؤى تنبؤية حول مسار التقدم المتوقع (2-3 فقرات)",
  "actionPlan": [
    {"phase": "المرحلة", "duration": "المدة", "goals": ["هدف 1"], "activities": ["نشاط 1"], "successMetrics": ["مؤشر نجاح 1"]}
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت خبير تربوي متخصص في تحليل تقدم التلاميذ ذوي صعوبات التعلم. أجب دائماً بصيغة JSON صالحة باللغة العربية." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "progress_evaluation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  analysisTitle: { type: "string" },
                  overallProgress: { type: "string" },
                  progressPercentage: { type: "integer" },
                  detailedAnalysis: { type: "string" },
                  trendAnalysis: { type: "string" },
                  skillsImproved: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        fromScore: { type: "number" },
                        toScore: { type: "number" },
                        changePercent: { type: "number" },
                      },
                      required: ["skill", "fromScore", "toScore", "changePercent"],
                      additionalProperties: false,
                    },
                  },
                  skillsNeedingWork: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        currentScore: { type: "number" },
                        targetScore: { type: "number" },
                        suggestedActivities: { type: "array", items: { type: "string" } },
                      },
                      required: ["skill", "currentScore", "targetScore", "suggestedActivities"],
                      additionalProperties: false,
                    },
                  },
                  predictiveInsights: { type: "string" },
                  actionPlan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        phase: { type: "string" },
                        duration: { type: "string" },
                        goals: { type: "array", items: { type: "string" } },
                        activities: { type: "array", items: { type: "string" } },
                        successMetrics: { type: "array", items: { type: "string" } },
                      },
                      required: ["phase", "duration", "goals", "activities", "successMetrics"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["analysisTitle", "overallProgress", "progressPercentage", "detailedAnalysis", "trendAnalysis", "skillsImproved", "skillsNeedingWork", "predictiveInsights", "actionPlan"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

        // Map overall progress
        const validProgress = ["significant_improvement", "moderate_improvement", "slight_improvement", "stable", "slight_decline", "needs_attention"];
        const overallProgress = validProgress.includes(parsed.overallProgress) ? parsed.overallProgress : "stable";

        await database.update(progressEvaluations).set({
          analysisTitle: parsed.analysisTitle,
          overallProgress,
          progressPercentage: parsed.progressPercentage,
          detailedAnalysis: parsed.detailedAnalysis,
          trendAnalysis: parsed.trendAnalysis,
          skillsImproved: parsed.skillsImproved,
          skillsNeedingWork: parsed.skillsNeedingWork,
          predictiveInsights: parsed.predictiveInsights,
          actionPlan: parsed.actionPlan,
          status: "completed",
        }).where(eq(progressEvaluations.id, evalId));

        const result = await database.select().from(progressEvaluations).where(eq(progressEvaluations.id, evalId)).limit(1);
        return result[0];

      } catch (error) {
        await database.update(progressEvaluations).set({ status: "failed" }).where(eq(progressEvaluations.id, evalId));
        throw error;
      }
    }),

  // ===== EXPORT PDF =====
  exportPdf: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [evaluation] = await database.select().from(progressEvaluations)
        .where(and(eq(progressEvaluations.id, input.id), eq(progressEvaluations.userId, String(ctx.user.id))))
        .limit(1);
      if (!evaluation) throw new Error("Evaluation not found");
      const { exportProgressEvaluationPdf } = await import("../lib/learningReportPdf");
      const result = await exportProgressEvaluationPdf({
        studentName: evaluation.studentName,
        difficultyType: evaluation.difficultyType,
        gradeLevel: evaluation.gradeLevel || undefined,
        analysisTitle: evaluation.analysisTitle || undefined,
        overallProgress: evaluation.overallProgress || undefined,
        progressPercentage: evaluation.progressPercentage || undefined,
        evaluationStartDate: evaluation.evaluationStartDate || undefined,
        evaluationEndDate: evaluation.evaluationEndDate || undefined,
        assessmentData: (evaluation.assessmentData as any[]) || undefined,
        detailedAnalysis: evaluation.detailedAnalysis || undefined,
        predictiveInsights: evaluation.predictiveInsights || undefined,
        actionPlan: (evaluation.actionPlan as any[])?.map((a: any) => `${a.phase}: ${a.goals?.join(', ')}`).join('\n') || undefined,
      });
      return result;
    }),

  // ===== DELETE EVALUATION =====
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(progressEvaluations)
        .where(and(eq(progressEvaluations.id, input.id), eq(progressEvaluations.userId, String(ctx.user.id))));
      return { success: true };
    }),
});
