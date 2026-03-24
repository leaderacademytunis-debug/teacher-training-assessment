import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { followUpReports, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ===== FOLLOW-UP REPORTS ROUTER =====
export const followUpReportsRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== GET REPORTS HISTORY =====
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;

      const items = await database.select().from(followUpReports)
        .where(eq(followUpReports.userId, String(ctx.user.id)))
        .orderBy(desc(followUpReports.createdAt))
        .limit(limit).offset(offset);

      const totalResult = await database.select({ total: count() }).from(followUpReports)
        .where(eq(followUpReports.userId, String(ctx.user.id)));

      return { items, total: totalResult[0]?.total || 0 };
    }),

  // ===== GET STATS =====
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const totalResult = await database.select({ total: count() }).from(followUpReports)
      .where(and(eq(followUpReports.userId, String(ctx.user.id)), eq(followUpReports.status, "completed")));
    return { totalReports: totalResult[0]?.total || 0 };
  }),

  // ===== GENERATE FOLLOW-UP REPORT =====
  generate: protectedProcedure
    .input(z.object({
      studentName: z.string().min(1),
      studentAge: z.number().min(3).max(18).optional(),
      gradeLevel: z.string().optional(),
      schoolName: z.string().optional(),
      difficultyType: z.string().min(1),
      severityLevel: z.enum(["mild", "moderate", "severe"]).default("moderate"),
      reportPeriod: z.enum(["weekly", "monthly", "trimesterly", "yearly"]).default("monthly"),
      periodStartDate: z.string().optional(),
      periodEndDate: z.string().optional(),
      academicObservations: z.string().optional(),
      behavioralObservations: z.string().optional(),
      socialObservations: z.string().optional(),
      readingScore: z.number().min(0).max(10).optional(),
      writingScore: z.number().min(0).max(10).optional(),
      mathScore: z.number().min(0).max(10).optional(),
      attentionScore: z.number().min(0).max(10).optional(),
      socialScore: z.number().min(0).max(10).optional(),
      motivationScore: z.number().min(0).max(10).optional(),
      historicalScores: z.array(z.object({
        date: z.string(),
        reading: z.number(),
        writing: z.number(),
        math: z.number(),
        attention: z.number(),
        social: z.number(),
        motivation: z.number(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      // Insert pending record
      const insertResult: any = await database.insert(followUpReports).values({
        userId: String(ctx.user.id),
        studentName: input.studentName,
        studentAge: input.studentAge,
        gradeLevel: input.gradeLevel,
        schoolName: input.schoolName,
        difficultyType: input.difficultyType,
        severityLevel: input.severityLevel,
        reportPeriod: input.reportPeriod,
        periodStartDate: input.periodStartDate,
        periodEndDate: input.periodEndDate,
        academicObservations: input.academicObservations,
        behavioralObservations: input.behavioralObservations,
        socialObservations: input.socialObservations,
        readingScore: input.readingScore,
        writingScore: input.writingScore,
        mathScore: input.mathScore,
        attentionScore: input.attentionScore,
        socialScore: input.socialScore,
        motivationScore: input.motivationScore,
        historicalScores: input.historicalScores,
        status: "pending",
      });

      const reportId = insertResult[0].insertId;

      const difficultyLabels: Record<string, string> = {
        dyslexia: "عسر القراءة",
        dysgraphia: "عسر الكتابة",
        dyscalculia: "عسر الحساب",
        adhd: "فرط النشاط وتشتت الانتباه",
        asd: "اضطراب طيف التوحد",
        auditory_processing: "اضطراب المعالجة السمعية",
        visual_processing: "اضطراب المعالجة البصرية",
        speech_language: "اضطرابات النطق واللغة",
      };

      const severityLabels: Record<string, string> = {
        mild: "خفيف", moderate: "متوسط", severe: "شديد"
      };

      const periodLabels: Record<string, string> = {
        weekly: "أسبوعي", monthly: "شهري", trimesterly: "ثلاثي", yearly: "سنوي"
      };

      const currentScores = `القراءة: ${input.readingScore || 'غير محدد'}/10، الكتابة: ${input.writingScore || 'غير محدد'}/10، الرياضيات: ${input.mathScore || 'غير محدد'}/10، الانتباه: ${input.attentionScore || 'غير محدد'}/10، التفاعل الاجتماعي: ${input.socialScore || 'غير محدد'}/10، الدافعية: ${input.motivationScore || 'غير محدد'}/10`;

      let historicalContext = "";
      if (input.historicalScores && input.historicalScores.length > 0) {
        historicalContext = "\n\nالدرجات السابقة للمقارنة:\n" + input.historicalScores.map(h =>
          `${h.date}: قراءة ${h.reading}/10، كتابة ${h.writing}/10، رياضيات ${h.math}/10، انتباه ${h.attention}/10، اجتماعي ${h.social}/10، دافعية ${h.motivation}/10`
        ).join("\n");
      }

      try {
        const prompt = `أنت خبير تربوي متخصص في صعوبات واضطرابات التعلم. قم بإعداد تقرير متابعة فردي شامل ومهني للتلميذ التالي:

معلومات التلميذ:
- الاسم: ${input.studentName}
- العمر: ${input.studentAge || 'غير محدد'} سنة
- المستوى الدراسي: ${input.gradeLevel || 'غير محدد'}
- المدرسة: ${input.schoolName || 'غير محددة'}

نوع الصعوبة: ${difficultyLabels[input.difficultyType] || input.difficultyType}
درجة الشدة: ${severityLabels[input.severityLevel]}
فترة التقرير: ${periodLabels[input.reportPeriod]}
${input.periodStartDate ? `من: ${input.periodStartDate}` : ''} ${input.periodEndDate ? `إلى: ${input.periodEndDate}` : ''}

الدرجات الحالية (من 10):
${currentScores}
${historicalContext}

ملاحظات المعلم:
- أكاديمية: ${input.academicObservations || 'لا توجد'}
- سلوكية: ${input.behavioralObservations || 'لا توجد'}
- اجتماعية: ${input.socialObservations || 'لا توجد'}

أعد التقرير بصيغة JSON بالهيكل التالي:
{
  "reportTitle": "عنوان التقرير",
  "executiveSummary": "ملخص تنفيذي شامل (3-4 فقرات)",
  "detailedAnalysis": "تحليل مفصل للأداء في كل مجال (5-6 فقرات)",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", ...],
  "challenges": ["تحدي 1", "تحدي 2", ...],
  "recommendations": [
    {"category": "أكاديمي", "recommendation": "التوصية", "priority": "عالية/متوسطة/منخفضة", "timeline": "المدة الزمنية"},
    ...
  ],
  "parentGuidance": "إرشادات مفصلة للأولياء (3-4 فقرات)",
  "nextSteps": [
    {"action": "الإجراء", "responsible": "المسؤول", "deadline": "الموعد"},
    ...
  ]
}

ملاحظة مهمة: هذا تقرير تربوي وليس تشخيصاً طبياً. يجب أن يكون مهنياً وعملياً ومبنياً على الملاحظات المقدمة.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت خبير تربوي متخصص في صعوبات التعلم. أجب دائماً بصيغة JSON صالحة باللغة العربية." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "follow_up_report",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  reportTitle: { type: "string" },
                  executiveSummary: { type: "string" },
                  detailedAnalysis: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  challenges: { type: "array", items: { type: "string" } },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        recommendation: { type: "string" },
                        priority: { type: "string" },
                        timeline: { type: "string" },
                      },
                      required: ["category", "recommendation", "priority", "timeline"],
                      additionalProperties: false,
                    },
                  },
                  parentGuidance: { type: "string" },
                  nextSteps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        responsible: { type: "string" },
                        deadline: { type: "string" },
                      },
                      required: ["action", "responsible", "deadline"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["reportTitle", "executiveSummary", "detailedAnalysis", "strengths", "challenges", "recommendations", "parentGuidance", "nextSteps"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

        await database.update(followUpReports).set({
          reportTitle: parsed.reportTitle,
          executiveSummary: parsed.executiveSummary,
          detailedAnalysis: parsed.detailedAnalysis,
          strengths: parsed.strengths,
          challenges: parsed.challenges,
          recommendations: parsed.recommendations,
          parentGuidance: parsed.parentGuidance,
          nextSteps: parsed.nextSteps,
          status: "completed",
        }).where(eq(followUpReports.id, reportId));

        const result = await database.select().from(followUpReports).where(eq(followUpReports.id, reportId)).limit(1);
        return result[0];

      } catch (error) {
        await database.update(followUpReports).set({ status: "failed" }).where(eq(followUpReports.id, reportId));
        throw error;
      }
    }),

  // ===== EXPORT PDF =====
  exportPdf: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [report] = await database.select().from(followUpReports)
        .where(and(eq(followUpReports.id, input.id), eq(followUpReports.userId, String(ctx.user.id))))
        .limit(1);
      if (!report) throw new Error("Report not found");
      const { exportFollowUpReportPdf } = await import("../lib/learningReportPdf");
      const result = await exportFollowUpReportPdf({
        studentName: report.studentName,
        difficultyType: report.difficultyType,
        gradeLevel: report.gradeLevel || undefined,
        studentAge: report.studentAge || undefined,
        severityLevel: report.severityLevel || undefined,
        reportPeriod: report.reportPeriod || undefined,
        readingScore: report.readingScore || undefined,
        writingScore: report.writingScore || undefined,
        mathScore: report.mathScore || undefined,
        attentionScore: report.attentionScore || undefined,
        socialScore: report.socialScore || undefined,
        motivationScore: report.motivationScore || undefined,
        reportTitle: report.reportTitle || undefined,
        strengths: (report.strengths as string[]) || undefined,
        challenges: (report.challenges as string[]) || undefined,
        recommendations: (report.recommendations as any[]) || undefined,
        detailedAnalysis: report.detailedAnalysis || undefined,
        parentGuidance: report.parentGuidance || undefined,
        executiveSummary: report.executiveSummary || undefined,
      });
      return result;
    }),

  // ===== DELETE REPORT =====
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(followUpReports)
        .where(and(eq(followUpReports.id, input.id), eq(followUpReports.userId, String(ctx.user.id))));
      return { success: true };
    }),
});
