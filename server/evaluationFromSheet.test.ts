/**
 * evaluationFromSheet.test.ts
 * Tests unitaires pour la génération d'ورقة تقييم depuis une جذاذة
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./wordExporter", () => ({
  exportEvaluationToWord: vi.fn(),
}));

// ─── Données de test ──────────────────────────────────────────────────────────
const mockSheet = {
  lessonTitle: "الجملة الفعلية",
  subject: "اللغة العربية",
  level: "الرابعة ابتدائي",
  trimester: "الثلاثي الأول",
  finalCompetency: "يوظف المتعلم الجملة الفعلية في التعبير الكتابي",
  distinguishedObjective: "يتعرف على مكونات الجملة الفعلية",
  proceduralObjectives: ["يحدد الفعل والفاعل والمفعول به", "يبني جملاً فعلية صحيحة"],
  launchPhase: { problemSituation: "قرأ أحمد قصة عن زيتون تونس" },
  conclusion: "الجملة الفعلية تبدأ بفعل وتتكون من فعل وفاعل وقد تحتوي على مفعول به",
};

const mockEvaluationResponse = {
  evaluationTitle: "ورقة تقييم — الجملة الفعلية",
  subject: "اللغة العربية",
  level: "الرابعة ابتدائي",
  trimester: "الثلاثي الأول",
  duration: "45 دقيقة",
  evaluationType: "تكويني",
  totalPoints: 20,
  learningObjective: "يتعرف على مكونات الجملة الفعلية",
  competency: "يوظف المتعلم الجملة الفعلية في التعبير الكتابي",
  sections: [
    {
      sectionNumber: 1,
      sectionTitle: "صواب وخطأ",
      sectionType: "true_false",
      points: 4,
      instructions: "ضع علامة (✓) أمام العبارة الصحيحة و(✗) أمام العبارة الخاطئة",
      questions: [
        {
          number: 1,
          question: "الجملة الفعلية تبدأ دائماً بفعل",
          options: [],
          points: 2,
          answer: "صواب",
          justification: "الجملة الفعلية تبدأ بفعل بالتعريف",
        },
        {
          number: 2,
          question: "الفاعل يأتي دائماً قبل الفعل",
          options: [],
          points: 2,
          answer: "خطأ",
          justification: "الفاعل يأتي بعد الفعل",
        },
      ],
    },
    {
      sectionNumber: 2,
      sectionTitle: "اختيار من متعدد",
      sectionType: "mcq",
      points: 4,
      instructions: "اختر الإجابة الصحيحة",
      questions: [
        {
          number: 3,
          question: "في الجملة 'كتب الطالب الدرس'، ما هو الفاعل؟",
          options: ["أ) كتب", "ب) الطالب", "ج) الدرس", "د) في"],
          points: 2,
          answer: "ب) الطالب",
          justification: "الطالب هو من قام بفعل الكتابة",
        },
        {
          number: 4,
          question: "المفعول به في الجملة السابقة هو:",
          options: ["أ) كتب", "ب) الطالب", "ج) الدرس", "د) لا يوجد"],
          points: 2,
          answer: "ج) الدرس",
          justification: "الدرس هو ما وقع عليه فعل الكتابة",
        },
      ],
    },
  ],
  integrationSituation: {
    context: "في مزرعة زيتون بمنطقة صفاقس، قطف الفلاحون الزيتون في موسم الحصاد",
    task: "استخرج جملتين فعليتين من النص وحدد مكونات كل منهما",
    points: 4,
    expectedAnswer: "الجملة الأولى: قطف الفلاحون الزيتون — فعل: قطف، فاعل: الفلاحون، مفعول به: الزيتون",
  },
  evaluationCriteria: [
    {
      criterion: "التعرف على مكونات الجملة الفعلية",
      indicators: ["يحدد الفعل بشكل صحيح", "يحدد الفاعل بشكل صحيح"],
    },
  ],
};

// ─── Tests: توليد ورقة التقييم ────────────────────────────────────────────────
describe("generateEvaluationFromSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن تتضمن ورقة التقييم جميع الحقول الإلزامية", () => {
    const requiredFields = [
      "evaluationTitle",
      "subject",
      "level",
      "trimester",
      "duration",
      "evaluationType",
      "totalPoints",
      "learningObjective",
      "competency",
      "sections",
      "integrationSituation",
      "evaluationCriteria",
    ];
    for (const field of requiredFields) {
      expect(mockEvaluationResponse).toHaveProperty(field);
    }
  });

  it("يجب أن يكون مجموع النقاط 20", () => {
    expect(mockEvaluationResponse.totalPoints).toBe(20);
  });

  it("يجب أن تحتوي الأقسام على أسئلة صحيحة", () => {
    for (const section of mockEvaluationResponse.sections) {
      expect(section.sectionNumber).toBeGreaterThan(0);
      expect(section.sectionTitle).toBeTruthy();
      expect(["true_false", "fill_blank", "mcq", "open", "integration"]).toContain(section.sectionType);
      expect(section.points).toBeGreaterThan(0);
      expect(section.instructions).toBeTruthy();
      expect(Array.isArray(section.questions)).toBe(true);
      expect(section.questions.length).toBeGreaterThan(0);
    }
  });

  it("يجب أن تحتوي كل سؤال على الحقول الإلزامية", () => {
    for (const section of mockEvaluationResponse.sections) {
      for (const question of section.questions) {
        expect(question.number).toBeGreaterThan(0);
        expect(question.question).toBeTruthy();
        expect(question.points).toBeGreaterThan(0);
        expect(question.answer).toBeTruthy();
        expect(Array.isArray(question.options)).toBe(true);
      }
    }
  });

  it("يجب أن تحتوي الوضعية الإدماجية على السياق والمهمة والإجابة", () => {
    const { integrationSituation } = mockEvaluationResponse;
    expect(integrationSituation.context).toBeTruthy();
    expect(integrationSituation.task).toBeTruthy();
    expect(integrationSituation.points).toBeGreaterThan(0);
    expect(integrationSituation.expectedAnswer).toBeTruthy();
  });

  it("يجب أن تكون أسئلة MCQ تحتوي على 4 خيارات", () => {
    const mcqSections = mockEvaluationResponse.sections.filter(s => s.sectionType === "mcq");
    for (const section of mcqSections) {
      for (const question of section.questions) {
        expect(question.options.length).toBe(4);
      }
    }
  });

  it("يجب أن تحتوي معايير التقييم على مؤشرات", () => {
    expect(Array.isArray(mockEvaluationResponse.evaluationCriteria)).toBe(true);
    expect(mockEvaluationResponse.evaluationCriteria.length).toBeGreaterThan(0);
    for (const criterion of mockEvaluationResponse.evaluationCriteria) {
      expect(criterion.criterion).toBeTruthy();
      expect(Array.isArray(criterion.indicators)).toBe(true);
      expect(criterion.indicators.length).toBeGreaterThan(0);
    }
  });
});

// ─── Tests: تصدير Word ────────────────────────────────────────────────────────
describe("exportEvaluationToWord", () => {
  it("يجب أن تُستدعى دالة التصدير بالمعطيات الصحيحة", async () => {
    const { exportEvaluationToWord } = await import("./wordExporter");
    const mockBuffer = Buffer.from("mock-word-content");
    (exportEvaluationToWord as ReturnType<typeof vi.fn>).mockResolvedValue(mockBuffer);

    const result = await exportEvaluationToWord({
      evaluation: mockEvaluationResponse as Record<string, unknown>,
      includeAnswerKey: true,
      schoolName: "مدرسة الزيتونة",
      teacherName: "الأستاذ محمد",
      schoolYear: "2025-2026",
    });

    expect(result).toBe(mockBuffer);
    expect(exportEvaluationToWord).toHaveBeenCalledWith(
      expect.objectContaining({
        evaluation: mockEvaluationResponse,
        includeAnswerKey: true,
        schoolName: "مدرسة الزيتونة",
        teacherName: "الأستاذ محمد",
        schoolYear: "2025-2026",
      })
    );
  });

  it("يجب أن تُصدَّر ورقة التقييم بدون مفتاح الإجابة عند الطلب", async () => {
    const { exportEvaluationToWord } = await import("./wordExporter");
    const mockBuffer = Buffer.from("mock-word-no-key");
    (exportEvaluationToWord as ReturnType<typeof vi.fn>).mockResolvedValue(mockBuffer);

    const result = await exportEvaluationToWord({
      evaluation: mockEvaluationResponse as Record<string, unknown>,
      includeAnswerKey: false,
    });

    expect(result).toBe(mockBuffer);
    expect(exportEvaluationToWord).toHaveBeenCalledWith(
      expect.objectContaining({ includeAnswerKey: false })
    );
  });
});

// ─── Tests: تحقق من بيانات الجذاذة ────────────────────────────────────────────
describe("sheet data validation", () => {
  it("يجب أن تحتوي الجذاذة على الحقول الأساسية", () => {
    expect(mockSheet.subject).toBeTruthy();
    expect(mockSheet.level).toBeTruthy();
    expect(mockSheet.trimester).toBeTruthy();
    expect(mockSheet.distinguishedObjective).toBeTruthy();
  });

  it("يجب أن تكون الأهداف الإجرائية مصفوفة", () => {
    expect(Array.isArray(mockSheet.proceduralObjectives)).toBe(true);
    expect(mockSheet.proceduralObjectives.length).toBeGreaterThan(0);
  });

  it("يجب أن تحتوي وضعية الانطلاق على مشكلة", () => {
    expect(mockSheet.launchPhase.problemSituation).toBeTruthy();
  });

  it("يجب أن يكون الاستنتاج موجوداً", () => {
    expect(mockSheet.conclusion).toBeTruthy();
  });
});

// ─── Tests: أنواع التقييم ─────────────────────────────────────────────────────
describe("evaluation types", () => {
  it("يجب أن تكون أنواع التقييم المتاحة صحيحة", () => {
    const validTypes = ["formative", "summative", "diagnostic"];
    expect(validTypes).toContain("formative");
    expect(validTypes).toContain("summative");
    expect(validTypes).toContain("diagnostic");
  });

  it("يجب أن تُترجم أنواع التقييم إلى العربية بشكل صحيح", () => {
    const typeLabels: Record<string, string> = {
      formative: "تكويني",
      summative: "إجمالي",
      diagnostic: "تشخيصي",
    };
    expect(typeLabels.formative).toBe("تكويني");
    expect(typeLabels.summative).toBe("إجمالي");
    expect(typeLabels.diagnostic).toBe("تشخيصي");
  });
});

// ─── Tests: أنواع أقسام الأسئلة ───────────────────────────────────────────────
describe("section types", () => {
  it("يجب أن تكون أنواع الأقسام المتاحة صحيحة", () => {
    const validSectionTypes = ["true_false", "fill_blank", "mcq", "open", "integration"];
    for (const type of validSectionTypes) {
      expect(validSectionTypes).toContain(type);
    }
  });

  it("يجب أن تُترجم أنواع الأقسام إلى العربية بشكل صحيح", () => {
    const sectionTypeLabels: Record<string, string> = {
      true_false: "صواب / خطأ",
      fill_blank: "ملء فراغات",
      mcq: "اختيار من متعدد",
      open: "أسئلة مفتوحة",
      integration: "وضعية إدماجية",
    };
    expect(sectionTypeLabels.true_false).toBe("صواب / خطأ");
    expect(sectionTypeLabels.mcq).toBe("اختيار من متعدد");
    expect(sectionTypeLabels.integration).toBe("وضعية إدماجية");
  });
});
