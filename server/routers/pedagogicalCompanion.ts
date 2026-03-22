import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { studentSupportProfiles, supportPlans, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

// ===== PEDAGOGICAL COMPANION ROUTER =====
export const pedagogicalCompanionRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== CREATE STUDENT PROFILE =====
  createStudentProfile: protectedProcedure
    .input(z.object({
      studentCode: z.string().min(1).max(50),
      studentAge: z.number().min(3).max(20).optional(),
      studentGrade: z.string().max(50).optional(),
      studentGender: z.enum(["male", "female"]).optional(),
      primaryDifficulty: z.enum([
        "dyslexia", "dysgraphia", "dyscalculia", "dysphasia",
        "dyspraxia", "adhd", "autism_spectrum", "slow_learner", "other"
      ]),
      secondaryDifficulties: z.array(z.string()).optional(),
      teacherObservations: z.string().optional(),
      behavioralNotes: z.string().optional(),
      academicStrengths: z.string().optional(),
      academicWeaknesses: z.string().optional(),
      previousInterventions: z.string().optional(),
      familyContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const result = await database.insert(studentSupportProfiles).values({
        userId: ctx.user.id,
        studentCode: input.studentCode,
        studentAge: input.studentAge,
        studentGrade: input.studentGrade,
        studentGender: input.studentGender,
        primaryDifficulty: input.primaryDifficulty,
        secondaryDifficulties: input.secondaryDifficulties || [],
        teacherObservations: input.teacherObservations,
        behavioralNotes: input.behavioralNotes,
        academicStrengths: input.academicStrengths,
        academicWeaknesses: input.academicWeaknesses,
        previousInterventions: input.previousInterventions,
        familyContext: input.familyContext,
      });
      return { id: result[0].insertId, success: true };
    }),

  // ===== GET MY STUDENT PROFILES =====
  getMyStudentProfiles: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    return database.select().from(studentSupportProfiles)
      .where(and(
        eq(studentSupportProfiles.userId, ctx.user.id),
        eq(studentSupportProfiles.isActive, true)
      ))
      .orderBy(desc(studentSupportProfiles.createdAt));
  }),

  // ===== GET STUDENT PROFILE BY ID =====
  getStudentProfile: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const profiles = await database.select().from(studentSupportProfiles)
        .where(and(
          eq(studentSupportProfiles.id, input.id),
          eq(studentSupportProfiles.userId, ctx.user.id)
        )).limit(1);
      return profiles[0] || null;
    }),

  // ===== DELETE STUDENT PROFILE =====
  deleteStudentProfile: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.update(studentSupportProfiles)
        .set({ isActive: false })
        .where(and(
          eq(studentSupportProfiles.id, input.id),
          eq(studentSupportProfiles.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  // ===== GENERATE SUPPORT PLAN (AI) =====
  generateSupportPlan: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      targetSubject: z.string().min(1),
      planDuration: z.string().min(1), // "4 أسابيع", "فصل دراسي"
      additionalNotes: z.string().optional(),
      language: z.enum(["ar", "fr"]).default("ar"),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      // Get student profile
      const profiles = await database.select().from(studentSupportProfiles)
        .where(and(
          eq(studentSupportProfiles.id, input.studentProfileId),
          eq(studentSupportProfiles.userId, ctx.user.id)
        )).limit(1);

      if (!profiles[0]) throw new Error("Student profile not found");
      const profile = profiles[0];

      // Difficulty names mapping
      const difficultyNames: Record<string, { ar: string; fr: string }> = {
        dyslexia: { ar: "عسر القراءة", fr: "Dyslexie" },
        dysgraphia: { ar: "عسر الكتابة", fr: "Dysgraphie" },
        dyscalculia: { ar: "عسر الحساب", fr: "Dyscalculie" },
        dysphasia: { ar: "عسر النطق", fr: "Dysphasie" },
        dyspraxia: { ar: "عسر التنسيق الحركي", fr: "Dyspraxie" },
        adhd: { ar: "فرط النشاط ونقص الانتباه", fr: "TDAH" },
        autism_spectrum: { ar: "طيف التوحد", fr: "Trouble du spectre autistique" },
        slow_learner: { ar: "بطء التعلم", fr: "Lenteur d'apprentissage" },
        other: { ar: "أخرى", fr: "Autre" },
      };

      const lang = input.language;
      const diffName = difficultyNames[profile.primaryDifficulty]?.[lang] || profile.primaryDifficulty;
      const secondaryNames = (profile.secondaryDifficulties as string[] || [])
        .map((d: string) => difficultyNames[d]?.[lang] || d).join("، ");

      const systemPrompt = lang === "ar" ? `أنت خبير في التربية الخاصة وصعوبات التعلم. مهمتك هي إنشاء خطة مرافقة فردية مفصّلة ومهنية لتلميذ يعاني من صعوبات تعلم.

يجب أن تكون الخطة:
- مبنية على أسس علمية وبيداغوجية معتمدة
- عملية وقابلة للتطبيق في الفصل الدراسي
- متدرجة من البسيط إلى المعقد
- تراعي الفروق الفردية واحتياجات التلميذ الخاصة
- تتضمن أنشطة علاجية متنوعة (بصرية، سمعية، حركية)
- تشمل معايير تقييم واضحة لقياس التقدم

أجب بصيغة JSON فقط.` :
`Vous êtes un expert en éducation spécialisée et en troubles d'apprentissage. Votre mission est de créer un plan d'accompagnement individualisé détaillé et professionnel pour un élève en difficulté d'apprentissage.

Le plan doit être:
- Fondé sur des bases scientifiques et pédagogiques reconnues
- Pratique et applicable en classe
- Progressif du simple au complexe
- Adapté aux besoins individuels de l'élève
- Inclure des activités thérapeutiques variées (visuelles, auditives, kinesthésiques)
- Comprendre des critères d'évaluation clairs pour mesurer les progrès

Répondez en format JSON uniquement.`;

      const userPrompt = lang === "ar" ? `أنشئ خطة مرافقة فردية للتلميذ التالي:

**معلومات التلميذ:**
- الرمز: ${profile.studentCode}
- العمر: ${profile.studentAge || "غير محدد"} سنة
- المستوى: ${profile.studentGrade || "غير محدد"}
- الجنس: ${profile.studentGender === "male" ? "ذكر" : "أنثى"}

**الصعوبة الأساسية:** ${diffName}
${secondaryNames ? `**صعوبات ثانوية:** ${secondaryNames}` : ""}

**ملاحظات المعلم:** ${profile.teacherObservations || "لا توجد"}
**ملاحظات سلوكية:** ${profile.behavioralNotes || "لا توجد"}
**نقاط القوة:** ${profile.academicStrengths || "لا توجد"}
**نقاط الضعف:** ${profile.academicWeaknesses || "لا توجد"}
**تدخلات سابقة:** ${profile.previousInterventions || "لا توجد"}
**السياق العائلي:** ${profile.familyContext || "لا توجد"}

**المادة المستهدفة:** ${input.targetSubject}
**مدة الخطة:** ${input.planDuration}
${input.additionalNotes ? `**ملاحظات إضافية:** ${input.additionalNotes}` : ""}

أنشئ خطة مرافقة مفصّلة بالصيغة التالية (JSON):
{
  "planTitle": "عنوان الخطة",
  "diagnosticSummary": "ملخص تشخيصي شامل للحالة (3-5 فقرات)",
  "weeklyPlan": [
    {
      "week": 1,
      "objectives": ["هدف 1", "هدف 2"],
      "activities": [
        {
          "title": "عنوان النشاط",
          "description": "وصف مفصّل للنشاط",
          "duration": "20 دقيقة",
          "materials": ["وسيلة 1", "وسيلة 2"],
          "adaptations": ["تكييف 1", "تكييف 2"]
        }
      ],
      "assessmentCriteria": ["معيار تقييم 1", "معيار تقييم 2"]
    }
  ],
  "teachingStrategies": ["استراتيجية 1", "استراتيجية 2", "..."],
  "classroomAdaptations": ["تكييف صفي 1", "تكييف صفي 2", "..."],
  "parentGuidelines": ["توجيه للأولياء 1", "توجيه للأولياء 2", "..."],
  "progressIndicators": ["مؤشر تقدم 1", "مؤشر تقدم 2", "..."]
}` :
`Créez un plan d'accompagnement individualisé pour l'élève suivant:

**Informations de l'élève:**
- Code: ${profile.studentCode}
- Âge: ${profile.studentAge || "Non spécifié"} ans
- Niveau: ${profile.studentGrade || "Non spécifié"}
- Genre: ${profile.studentGender === "male" ? "Masculin" : "Féminin"}

**Difficulté principale:** ${diffName}
${secondaryNames ? `**Difficultés secondaires:** ${secondaryNames}` : ""}

**Observations de l'enseignant:** ${profile.teacherObservations || "Aucune"}
**Notes comportementales:** ${profile.behavioralNotes || "Aucune"}
**Points forts:** ${profile.academicStrengths || "Aucun"}
**Points faibles:** ${profile.academicWeaknesses || "Aucun"}
**Interventions précédentes:** ${profile.previousInterventions || "Aucune"}
**Contexte familial:** ${profile.familyContext || "Non spécifié"}

**Matière ciblée:** ${input.targetSubject}
**Durée du plan:** ${input.planDuration}
${input.additionalNotes ? `**Notes supplémentaires:** ${input.additionalNotes}` : ""}

Créez un plan d'accompagnement détaillé au format JSON suivant:
{
  "planTitle": "Titre du plan",
  "diagnosticSummary": "Résumé diagnostique complet (3-5 paragraphes)",
  "weeklyPlan": [
    {
      "week": 1,
      "objectives": ["Objectif 1", "Objectif 2"],
      "activities": [
        {
          "title": "Titre de l'activité",
          "description": "Description détaillée",
          "duration": "20 minutes",
          "materials": ["Matériel 1", "Matériel 2"],
          "adaptations": ["Adaptation 1", "Adaptation 2"]
        }
      ],
      "assessmentCriteria": ["Critère 1", "Critère 2"]
    }
  ],
  "teachingStrategies": ["Stratégie 1", "Stratégie 2"],
  "classroomAdaptations": ["Adaptation 1", "Adaptation 2"],
  "parentGuidelines": ["Conseil 1", "Conseil 2"],
  "progressIndicators": ["Indicateur 1", "Indicateur 2"]
}`;

      const { invokeLLM } = await import("../_core/llm");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "support_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                planTitle: { type: "string" },
                diagnosticSummary: { type: "string" },
                weeklyPlan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "number" },
                      objectives: { type: "array", items: { type: "string" } },
                      activities: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            duration: { type: "string" },
                            materials: { type: "array", items: { type: "string" } },
                            adaptations: { type: "array", items: { type: "string" } },
                          },
                          required: ["title", "description", "duration", "materials", "adaptations"],
                          additionalProperties: false,
                        },
                      },
                      assessmentCriteria: { type: "array", items: { type: "string" } },
                    },
                    required: ["week", "objectives", "activities", "assessmentCriteria"],
                    additionalProperties: false,
                  },
                },
                teachingStrategies: { type: "array", items: { type: "string" } },
                classroomAdaptations: { type: "array", items: { type: "string" } },
                parentGuidelines: { type: "array", items: { type: "string" } },
                progressIndicators: { type: "array", items: { type: "string" } },
              },
              required: ["planTitle", "diagnosticSummary", "weeklyPlan", "teachingStrategies", "classroomAdaptations", "parentGuidelines", "progressIndicators"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new Error("Failed to generate support plan");
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

      const plan = JSON.parse(content);

      // Save to database
      const result = await database.insert(supportPlans).values({
        userId: ctx.user.id,
        studentProfileId: input.studentProfileId,
        planTitle: plan.planTitle,
        planDuration: input.planDuration,
        targetSubject: input.targetSubject,
        diagnosticSummary: plan.diagnosticSummary,
        weeklyPlan: plan.weeklyPlan,
        teachingStrategies: plan.teachingStrategies,
        classroomAdaptations: plan.classroomAdaptations,
        parentGuidelines: plan.parentGuidelines,
        progressIndicators: plan.progressIndicators,
        fullPlanContent: content,
        status: "draft",
      });

      return {
        id: result[0].insertId,
        ...plan,
        success: true,
      };
    }),

  // ===== GET MY SUPPORT PLANS =====
  getMySupportPlans: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    return database.select().from(supportPlans)
      .where(eq(supportPlans.userId, ctx.user.id))
      .orderBy(desc(supportPlans.createdAt));
  }),

  // ===== GET SUPPORT PLAN BY ID =====
  getSupportPlan: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const plans = await database.select().from(supportPlans)
        .where(and(
          eq(supportPlans.id, input.id),
          eq(supportPlans.userId, ctx.user.id)
        )).limit(1);
      return plans[0] || null;
    }),

  // ===== UPDATE PLAN STATUS =====
  updatePlanStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "active", "completed", "archived"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.update(supportPlans)
        .set({ status: input.status })
        .where(and(
          eq(supportPlans.id, input.id),
          eq(supportPlans.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  // ===== DELETE SUPPORT PLAN =====
  deleteSupportPlan: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(supportPlans)
        .where(and(
          eq(supportPlans.id, input.id),
          eq(supportPlans.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  // ===== GET STATS =====
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const profileCount = await database.select({ count: count() }).from(studentSupportProfiles)
      .where(and(
        eq(studentSupportProfiles.userId, ctx.user.id),
        eq(studentSupportProfiles.isActive, true)
      ));
    const planCount = await database.select({ count: count() }).from(supportPlans)
      .where(eq(supportPlans.userId, ctx.user.id));
    const activePlans = await database.select({ count: count() }).from(supportPlans)
      .where(and(
        eq(supportPlans.userId, ctx.user.id),
        eq(supportPlans.status, "active")
      ));
    return {
      totalProfiles: profileCount[0]?.count || 0,
      totalPlans: planCount[0]?.count || 0,
      activePlans: activePlans[0]?.count || 0,
    };
  }),
});
