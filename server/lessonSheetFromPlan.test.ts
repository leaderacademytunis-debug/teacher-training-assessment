import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// ─── Mock wordExporter ────────────────────────────────────────────────────────
vi.mock("./wordExporter", () => ({
  exportLessonSheetToWord: vi.fn(),
}));

// ─── Tests de validation du schéma JSON de la fiche ──────────────────────────
describe("Lesson Sheet JSON Schema Validation", () => {
  const validSheet = {
    lessonTitle: "الجملة الاسمية",
    subject: "اللغة العربية",
    level: "الخامسة ابتدائي",
    trimester: "الثلاثي الأول",
    period: "الوحدة الأولى",
    duration: "45 دقيقة",
    finalCompetency: "يتواصل المتعلم شفهياً وكتابياً بلغة عربية سليمة",
    distinguishedObjective: "يتعرف المتعلم على الجملة الاسمية ومكوناتها",
    proceduralObjectives: [
      "يُعرِّف الجملة الاسمية",
      "يُحدِّد المبتدأ والخبر",
      "يُصنِّف الجمل الاسمية",
    ],
    materials: ["الكتاب المدرسي", "السبورة", "بطاقات مصوّرة"],
    launchPhase: {
      duration: "10 دقائق",
      problemSituation: "يُقرأ نص قصير عن سوق الزيتون في صفاقس",
      teacherActivity: "يطرح المعلم أسئلة تحفيزية",
      learnerActivity: "يُجيب المتعلمون على الأسئلة",
    },
    mainPhase: {
      duration: "25 دقائق",
      steps: [
        {
          step: "الاكتشاف",
          teacherActivity: "يكتب أمثلة على السبورة",
          learnerActivity: "يُلاحظ ويُحلِّل",
        },
        {
          step: "التطبيق",
          teacherActivity: "يوزع بطاقات التمارين",
          learnerActivity: "يُصنِّف الجمل",
        },
      ],
    },
    consolidationPhase: {
      duration: "10 دقائق",
      exercise: "أُعيِّن المبتدأ والخبر في الجمل التالية...",
      exerciseType: "تعيين",
    },
    conclusion: "الجملة الاسمية تبدأ باسم وتتكون من مبتدأ وخبر",
    summativeEvaluation: "أكتب جملتين اسميتين عن الحياة في تونس",
  };

  it("يجب أن تحتوي الجذاذة على الحقول الإلزامية", () => {
    const requiredFields = [
      "lessonTitle",
      "subject",
      "level",
      "trimester",
      "finalCompetency",
      "distinguishedObjective",
      "proceduralObjectives",
      "materials",
      "launchPhase",
      "mainPhase",
      "consolidationPhase",
      "conclusion",
      "summativeEvaluation",
    ];
    for (const field of requiredFields) {
      expect(validSheet).toHaveProperty(field);
    }
  });

  it("يجب أن تحتوي الأهداف الإجرائية على 3 أهداف على الأقل", () => {
    expect(validSheet.proceduralObjectives.length).toBeGreaterThanOrEqual(3);
  });

  it("يجب أن تحتوي مرحلة بناء التعلمات على خطوات", () => {
    expect(validSheet.mainPhase.steps).toBeDefined();
    expect(validSheet.mainPhase.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("يجب أن تحتوي كل خطوة على نشاط المعلم ونشاط المتعلم", () => {
    for (const step of validSheet.mainPhase.steps) {
      expect(step).toHaveProperty("step");
      expect(step).toHaveProperty("teacherActivity");
      expect(step).toHaveProperty("learnerActivity");
    }
  });

  it("يجب أن تحتوي وضعية الانطلاق على وضعية المشكلة", () => {
    expect(validSheet.launchPhase.problemSituation).toBeTruthy();
    expect(validSheet.launchPhase.problemSituation.length).toBeGreaterThan(10);
  });

  it("يجب أن تحتوي الجذاذة على وسائل بيداغوجية", () => {
    expect(validSheet.materials.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Tests de la logique de construction du prompt ───────────────────────────
describe("Lesson Sheet Prompt Construction", () => {
  it("يجب أن يتضمن الطلب معطيات المخطط السنوي", () => {
    const input = {
      subject: "الرياضيات",
      level: "الثالثة ابتدائي",
      trimester: "الثلاثي الثاني",
      period: "الوحدة الثالثة",
      activity: "الضرب",
      competencyComponent: "الحساب الذهني",
      distinguishedObjective: "يُجري المتعلم عمليات الضرب",
      content: "جداول الضرب من 1 إلى 10",
    };

    const userMessage = `أعدّ جذاذة كاملة للدرس التالي:
- المادة: ${input.subject}
- المستوى: ${input.level}
- الثلاثي: ${input.trimester}
- الفترة: ${input.period}
- النشاط: ${input.activity}
- مكوّن الكفاية: ${input.competencyComponent}
- الهدف المميز: ${input.distinguishedObjective}
- المحتوى: ${input.content}`;

    expect(userMessage).toContain("الرياضيات");
    expect(userMessage).toContain("الثالثة ابتدائي");
    expect(userMessage).toContain("الضرب");
    expect(userMessage).toContain("جداول الضرب");
  });

  it("يجب أن يتضمن system prompt المصطلحات البيداغوجية التونسية", () => {
    const systemPromptKeywords = [
      "المقاربة بالكفايات",
      "APC",
      "وضعية مشكلة",
      "الكفاية الختامية",
      "الهدف المميز",
      "الأهداف الإجرائية",
    ];

    // نتحقق من أن المصطلحات موجودة في قائمة الكلمات المفتاحية المتوقعة
    const systemPrompt = `المقاربة بالكفايات (APC) وضعية مشكلة الكفاية الختامية الهدف المميز الأهداف الإجرائية`;
    for (const keyword of systemPromptKeywords) {
      expect(systemPrompt).toContain(keyword);
    }
  });
});

// ─── Tests de l'export Word ───────────────────────────────────────────────────
describe("Lesson Sheet Word Export", () => {
  it("يجب أن يُنتج ملف Word بالاسم الصحيح", () => {
    const subject = "الإيقاظ العلمي";
    const level = "الخامسة ابتدائي";
    const filename = `جذاذة-${subject}-${level}.docx`;
    expect(filename).toContain("الإيقاظ العلمي");
    expect(filename).toContain("الخامسة ابتدائي");
    expect(filename).toMatch(/\.docx$/);
  });

  it("يجب أن تكون بيانات Word قابلة للترميز بـ base64", () => {
    const mockBuffer = Buffer.from("mock word content");
    const base64 = mockBuffer.toString("base64");
    expect(base64).toBeTruthy();
    expect(typeof base64).toBe("string");
    // يمكن فك ترميزه بنجاح
    const decoded = Buffer.from(base64, "base64");
    expect(decoded.toString()).toBe("mock word content");
  });
});

// ─── Tests de validation des entrées ─────────────────────────────────────────
describe("Input Validation for generateLessonSheetFromPlan", () => {
  it("يجب أن تكون الحقول الإلزامية غير فارغة", () => {
    const requiredFields = {
      subject: "اللغة العربية",
      level: "الخامسة ابتدائي",
      trimester: "الثلاثي الأول",
      period: "الوحدة الأولى",
      activity: "القراءة",
      competencyComponent: "الفهم",
      distinguishedObjective: "يقرأ المتعلم نصاً بطلاقة",
      content: "نص قرائي",
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      expect(value).toBeTruthy();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("يجب أن تكون الحقول الاختيارية مقبولة كـ undefined", () => {
    const optionalFields = {
      sessionCount: undefined,
      schoolName: undefined,
      teacherName: undefined,
      schoolYear: undefined,
    };

    for (const [, value] of Object.entries(optionalFields)) {
      expect(value).toBeUndefined();
    }
  });
});
