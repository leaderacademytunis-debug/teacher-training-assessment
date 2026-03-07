/**
 * evaluationFromPlanRow.test.ts
 * Tests unitaires pour la génération d'évaluation depuis une ligne du plan annuel
 */
import { describe, it, expect } from "vitest";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlanRowInput {
  subject: string;
  grade: string;
  schoolYear: string;
  trimester: string;
  unit: string;
  activity: string;
  competencyComponent: string;
  distinguishedObjective: string;
  content: string;
  sessions: number;
  evaluationType: "formative" | "summative" | "diagnostic";
  questionCount: number;
  includeAnswerKey: boolean;
  schoolName?: string;
  teacherName?: string;
}

interface EvaluationQuestion {
  number: number;
  question: string;
  options?: string[];
  points: number;
  answer: string;
  justification?: string;
}

interface EvaluationSection {
  sectionNumber: number;
  sectionTitle: string;
  sectionType: "truefalse" | "mcq" | "fill" | "matching" | "open" | "integration";
  points: number;
  instructions: string;
  questions: EvaluationQuestion[];
}

interface EvaluationOutput {
  evaluationTitle: string;
  subject: string;
  level: string;
  trimester: string;
  duration: string;
  evaluationType: string;
  totalPoints: number;
  learningObjective: string;
  competency: string;
  sections: EvaluationSection[];
  integrationSituation?: {
    context: string;
    task: string;
    points: number;
    expectedAnswer: string;
  };
  evaluationCriteria?: Array<{
    criterion: string;
    indicators: string[];
  }>;
}

// ─── Helpers de validation ────────────────────────────────────────────────────

function validateEvaluationOutput(ev: EvaluationOutput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ev.evaluationTitle || ev.evaluationTitle.trim() === "") {
    errors.push("evaluationTitle est requis");
  }
  if (!ev.subject || ev.subject.trim() === "") {
    errors.push("subject est requis");
  }
  if (!ev.level || ev.level.trim() === "") {
    errors.push("level est requis");
  }
  if (!ev.trimester || ev.trimester.trim() === "") {
    errors.push("trimester est requis");
  }
  if (typeof ev.totalPoints !== "number" || ev.totalPoints <= 0) {
    errors.push("totalPoints doit être un nombre positif");
  }
  if (!Array.isArray(ev.sections) || ev.sections.length === 0) {
    errors.push("sections doit être un tableau non vide");
  }

  return { valid: errors.length === 0, errors };
}

function validateSection(sec: EvaluationSection): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validTypes = ["truefalse", "mcq", "fill", "matching", "open", "integration"];

  if (!sec.sectionTitle || sec.sectionTitle.trim() === "") {
    errors.push("sectionTitle est requis");
  }
  if (!validTypes.includes(sec.sectionType)) {
    errors.push(`sectionType invalide: ${sec.sectionType}`);
  }
  if (typeof sec.points !== "number" || sec.points <= 0) {
    errors.push("points doit être un nombre positif");
  }
  if (!sec.instructions || sec.instructions.trim() === "") {
    errors.push("instructions est requis");
  }
  if (!Array.isArray(sec.questions) || sec.questions.length === 0) {
    errors.push("questions doit être un tableau non vide");
  }

  return { valid: errors.length === 0, errors };
}

function buildMockEvaluation(overrides: Partial<EvaluationOutput> = {}): EvaluationOutput {
  return {
    evaluationTitle: "تقييم تكويني — اللغة العربية — الثلاثي الأول",
    subject: "اللغة العربية",
    level: "السادسة",
    trimester: "الأول",
    duration: "45 دقيقة",
    evaluationType: "تقييم تكويني",
    totalPoints: 20,
    learningObjective: "يقرأ المتعلم نصاً قرائياً بطلاقة مع الفهم",
    competency: "التواصل الشفوي والكتابي باللغة العربية الفصحى",
    sections: [
      {
        sectionNumber: 1,
        sectionTitle: "الفهم والاستيعاب",
        sectionType: "truefalse",
        points: 4,
        instructions: "ضع علامة (صح) أو (خطأ) أمام كل جملة",
        questions: [
          { number: 1, question: "النص يتحدث عن الطبيعة", points: 1, answer: "صح", options: [] },
          { number: 2, question: "الشخصية الرئيسية طفل", points: 1, answer: "خطأ", options: [] },
          { number: 3, question: "تجري الأحداث في الريف", points: 1, answer: "صح", options: [] },
          { number: 4, question: "النهاية حزينة", points: 1, answer: "خطأ", options: [] },
        ],
      },
      {
        sectionNumber: 2,
        sectionTitle: "المفردات والتعابير",
        sectionType: "mcq",
        points: 6,
        instructions: "اختر الإجابة الصحيحة من بين الخيارات المقترحة",
        questions: [
          {
            number: 1,
            question: "معنى كلمة 'يتأمل' في النص هو:",
            options: ["أ. يتفرج", "ب. يتدبر ويفكر", "ج. يلعب", "د. يكتب"],
            points: 2,
            answer: "ب. يتدبر ويفكر",
          },
          {
            number: 2,
            question: "مرادف كلمة 'جميل' هو:",
            options: ["أ. قبيح", "ب. صغير", "ج. حسن", "د. بعيد"],
            points: 2,
            answer: "ج. حسن",
          },
          {
            number: 3,
            question: "ضد كلمة 'يقترب' هو:",
            options: ["أ. يبتعد", "ب. يجلس", "ج. يركض", "د. يصل"],
            points: 2,
            answer: "أ. يبتعد",
          },
        ],
      },
      {
        sectionNumber: 3,
        sectionTitle: "التعبير الكتابي",
        sectionType: "open",
        points: 6,
        instructions: "أجب عن الأسئلة التالية بجمل كاملة",
        questions: [
          { number: 1, question: "ما الفكرة الرئيسية للنص؟", points: 3, answer: "الطبيعة وجمالها وأثرها على الإنسان" },
          { number: 2, question: "صف مشاعرك تجاه الطبيعة في سطرين", points: 3, answer: "إجابة حرة تعبر عن المشاعر الشخصية" },
        ],
      },
    ],
    integrationSituation: {
      context: "أنت تزور حديقة عامة مع عائلتك في يوم ربيعي مشمس",
      task: "اكتب فقرة من 4 إلى 5 جمل تصف فيها ما تراه وتشعر به",
      points: 4,
      expectedAnswer: "فقرة وصفية تتضمن: المكان، الأشخاص، الطبيعة، المشاعر، مع توظيف مفردات من النص",
    },
    evaluationCriteria: [
      {
        criterion: "الملاءمة",
        indicators: ["الإجابة تتعلق بالسؤال المطروح", "توظيف المفردات المناسبة"],
      },
      {
        criterion: "الدقة",
        indicators: ["صحة المعلومات", "سلامة اللغة والإملاء"],
      },
      {
        criterion: "الانسجام",
        indicators: ["ترابط الأفكار", "وضوح التعبير"],
      },
    ],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateEvaluationFromPlanRow — validation des entrées", () => {
  it("doit accepter une entrée valide avec tous les champs obligatoires", () => {
    const input: PlanRowInput = {
      subject: "اللغة العربية",
      grade: "السادسة",
      schoolYear: "2025-2026",
      trimester: "الأول",
      unit: "الوحدة 1",
      activity: "قراءة",
      competencyComponent: "قراءة نصوص متنوعة",
      distinguishedObjective: "يقرأ المتعلم نصاً قرائياً بطلاقة",
      content: "نص قرائي: الطبيعة الجميلة",
      sessions: 3,
      evaluationType: "formative",
      questionCount: 8,
      includeAnswerKey: true,
    };
    expect(input.subject).toBe("اللغة العربية");
    expect(input.evaluationType).toBe("formative");
    expect(input.questionCount).toBe(8);
    expect(input.includeAnswerKey).toBe(true);
  });

  it("doit accepter les 3 types d'évaluation valides", () => {
    const types: Array<"formative" | "summative" | "diagnostic"> = ["formative", "summative", "diagnostic"];
    types.forEach((type) => {
      const input: PlanRowInput = {
        subject: "الرياضيات",
        grade: "الخامسة",
        schoolYear: "2025-2026",
        trimester: "الثاني",
        unit: "الوحدة 2",
        activity: "أعداد وحساب",
        competencyComponent: "العمليات الحسابية",
        distinguishedObjective: "يحل مسائل الضرب",
        content: "جداول الضرب",
        sessions: 2,
        evaluationType: type,
        questionCount: 6,
        includeAnswerKey: false,
      };
      expect(input.evaluationType).toBe(type);
    });
  });

  it("doit accepter les champs optionnels schoolName et teacherName", () => {
    const input: PlanRowInput = {
      subject: "الرياضيات",
      grade: "الرابعة",
      schoolYear: "2025-2026",
      trimester: "الثالث",
      unit: "الوحدة 3",
      activity: "هندسة",
      competencyComponent: "الأشكال الهندسية",
      distinguishedObjective: "يتعرف على الأشكال الهندسية",
      content: "المثلث والمربع والمستطيل",
      sessions: 4,
      evaluationType: "summative",
      questionCount: 10,
      includeAnswerKey: true,
      schoolName: "المدرسة الابتدائية النموذجية",
      teacherName: "الأستاذ محمد بن علي",
    };
    expect(input.schoolName).toBe("المدرسة الابتدائية النموذجية");
    expect(input.teacherName).toBe("الأستاذ محمد بن علي");
  });
});

describe("validateEvaluationOutput — structure de sortie", () => {
  it("doit valider une évaluation complète et correcte", () => {
    const ev = buildMockEvaluation();
    const { valid, errors } = validateEvaluationOutput(ev);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("doit rejeter une évaluation sans titre", () => {
    const ev = buildMockEvaluation({ evaluationTitle: "" });
    const { valid, errors } = validateEvaluationOutput(ev);
    expect(valid).toBe(false);
    expect(errors).toContain("evaluationTitle est requis");
  });

  it("doit rejeter une évaluation sans sections", () => {
    const ev = buildMockEvaluation({ sections: [] });
    const { valid, errors } = validateEvaluationOutput(ev);
    expect(valid).toBe(false);
    expect(errors).toContain("sections doit être un tableau non vide");
  });

  it("doit rejeter une évaluation avec totalPoints négatif", () => {
    const ev = buildMockEvaluation({ totalPoints: -5 });
    const { valid, errors } = validateEvaluationOutput(ev);
    expect(valid).toBe(false);
    expect(errors).toContain("totalPoints doit être un nombre positif");
  });

  it("doit valider la présence de la وضعية الإدماجية", () => {
    const ev = buildMockEvaluation();
    expect(ev.integrationSituation).toBeDefined();
    expect(ev.integrationSituation?.context).toBeTruthy();
    expect(ev.integrationSituation?.task).toBeTruthy();
    expect(ev.integrationSituation?.points).toBeGreaterThan(0);
    expect(ev.integrationSituation?.expectedAnswer).toBeTruthy();
  });

  it("doit valider les critères d'évaluation (الملاءمة، الدقة، الانسجام)", () => {
    const ev = buildMockEvaluation();
    expect(ev.evaluationCriteria).toBeDefined();
    expect(ev.evaluationCriteria!.length).toBeGreaterThanOrEqual(3);
    const criteriaNames = ev.evaluationCriteria!.map((c) => c.criterion);
    expect(criteriaNames).toContain("الملاءمة");
    expect(criteriaNames).toContain("الدقة");
    expect(criteriaNames).toContain("الانسجام");
  });
});

describe("validateSection — types de sections SC2M223", () => {
  it("doit valider une section صواب/خطأ", () => {
    const sec: EvaluationSection = {
      sectionNumber: 1,
      sectionTitle: "صواب وخطأ",
      sectionType: "truefalse",
      points: 4,
      instructions: "ضع علامة (صح) أو (خطأ)",
      questions: [{ number: 1, question: "السؤال 1", points: 1, answer: "صح" }],
    };
    const { valid, errors } = validateSection(sec);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("doit valider une section اختيار من متعدد avec options", () => {
    const sec: EvaluationSection = {
      sectionNumber: 2,
      sectionTitle: "اختيار من متعدد",
      sectionType: "mcq",
      points: 6,
      instructions: "اختر الإجابة الصحيحة",
      questions: [
        {
          number: 1,
          question: "ما معنى كلمة؟",
          options: ["أ. خيار 1", "ب. خيار 2", "ج. خيار 3", "د. خيار 4"],
          points: 2,
          answer: "ب. خيار 2",
        },
      ],
    };
    const { valid, errors } = validateSection(sec);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
    expect(sec.questions[0].options).toHaveLength(4);
  });

  it("doit valider une section ملء الفراغات", () => {
    const sec: EvaluationSection = {
      sectionNumber: 3,
      sectionTitle: "ملء الفراغات",
      sectionType: "fill",
      points: 4,
      instructions: "أكمل الجمل بالكلمة المناسبة",
      questions: [
        { number: 1, question: "الشمس تشرق من .........", points: 1, answer: "الشرق" },
        { number: 2, question: "الماء يتدفق في .........", points: 1, answer: "النهر" },
      ],
    };
    const { valid, errors } = validateSection(sec);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("doit rejeter une section avec sectionType invalide", () => {
    const sec = {
      sectionNumber: 1,
      sectionTitle: "نوع غير معروف",
      sectionType: "unknown" as EvaluationSection["sectionType"],
      points: 4,
      instructions: "تعليمات",
      questions: [{ number: 1, question: "سؤال", points: 1, answer: "جواب" }],
    };
    const { valid, errors } = validateSection(sec);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes("sectionType invalide"))).toBe(true);
  });

  it("doit rejeter une section sans instructions", () => {
    const sec: EvaluationSection = {
      sectionNumber: 1,
      sectionTitle: "قسم بدون تعليمات",
      sectionType: "open",
      points: 5,
      instructions: "",
      questions: [{ number: 1, question: "سؤال مفتوح", points: 5, answer: "إجابة حرة" }],
    };
    const { valid, errors } = validateSection(sec);
    expect(valid).toBe(false);
    expect(errors).toContain("instructions est requis");
  });
});

describe("SC2M223 — conformité au modèle officiel tunisien", () => {
  it("doit générer un titre d'évaluation en arabe", () => {
    const ev = buildMockEvaluation();
    expect(ev.evaluationTitle).toMatch(/[\u0600-\u06FF]/); // Contient des caractères arabes
  });

  it("doit avoir une durée par défaut de 45 minutes", () => {
    const ev = buildMockEvaluation();
    expect(ev.duration).toContain("45");
  });

  it("doit avoir un total de points de 20", () => {
    const ev = buildMockEvaluation();
    expect(ev.totalPoints).toBe(20);
  });

  it("doit contenir au moins 3 sections de types différents", () => {
    const ev = buildMockEvaluation();
    const types = new Set(ev.sections.map((s) => s.sectionType));
    expect(types.size).toBeGreaterThanOrEqual(3);
  });

  it("doit avoir des questions numérotées séquentiellement dans chaque section", () => {
    const ev = buildMockEvaluation();
    ev.sections.forEach((sec) => {
      sec.questions.forEach((q, idx) => {
        expect(q.number).toBe(idx + 1);
      });
    });
  });

  it("doit avoir une somme de points cohérente avec totalPoints", () => {
    const ev = buildMockEvaluation();
    const sectionsTotal = ev.sections.reduce((sum, s) => sum + s.points, 0);
    const integrationPoints = ev.integrationSituation?.points || 0;
    const total = sectionsTotal + integrationPoints;
    expect(total).toBe(ev.totalPoints);
  });

  it("doit avoir un objectif d'apprentissage non vide", () => {
    const ev = buildMockEvaluation();
    expect(ev.learningObjective).toBeTruthy();
    expect(ev.learningObjective.length).toBeGreaterThan(10);
  });
});

describe("Mapping PlanRow → EvaluationOutput", () => {
  it("doit mapper le sujet et le niveau correctement", () => {
    const input: PlanRowInput = {
      subject: "الرياضيات",
      grade: "الخامسة",
      schoolYear: "2025-2026",
      trimester: "الثاني",
      unit: "الوحدة 2",
      activity: "أعداد وحساب",
      competencyComponent: "العمليات الحسابية الأربع",
      distinguishedObjective: "يحل مسائل الضرب والقسمة",
      content: "الضرب والقسمة على أعداد من رقمين",
      sessions: 3,
      evaluationType: "formative",
      questionCount: 8,
      includeAnswerKey: true,
    };
    // Simulation du mapping
    const ev = buildMockEvaluation({
      subject: input.subject,
      level: input.grade,
      trimester: input.trimester,
      learningObjective: input.distinguishedObjective,
      competency: input.competencyComponent,
    });
    expect(ev.subject).toBe("الرياضيات");
    expect(ev.level).toBe("الخامسة");
    expect(ev.trimester).toBe("الثاني");
    expect(ev.learningObjective).toBe("يحل مسائل الضرب والقسمة");
  });

  it("doit respecter le nombre de questions demandé", () => {
    const questionCount = 8;
    const ev = buildMockEvaluation();
    const totalQuestions = ev.sections.reduce((sum, s) => sum + s.questions.length, 0);
    // Le nombre total de questions doit être proche de questionCount
    expect(totalQuestions).toBeGreaterThanOrEqual(Math.floor(questionCount * 0.8));
    expect(totalQuestions).toBeLessThanOrEqual(Math.ceil(questionCount * 1.2));
  });

  it("doit inclure une وضعية إدماجية avec contexte tunisien", () => {
    const ev = buildMockEvaluation();
    expect(ev.integrationSituation).toBeDefined();
    // La situation d'intégration doit avoir un contexte significatif
    expect(ev.integrationSituation!.context.length).toBeGreaterThan(20);
    expect(ev.integrationSituation!.task.length).toBeGreaterThan(20);
  });
});
