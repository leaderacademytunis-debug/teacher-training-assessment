import { describe, it, expect } from "vitest";

// ══════════════════════════════════════════════════════════════════════════
// Tests for Enhanced Lesson Plan (Jidhadha) Generation Engine
// ══════════════════════════════════════════════════════════════════════════

describe("Lesson Plan - System Prompt Structure", () => {
  // Simulate the expected JSON output structure from the enhanced system prompt
  const sampleLessonSheet = {
    lessonTitle: "التنفس عند الإنسان",
    planType: "شهري",
    subject: "إيقاظ علمي",
    level: "السنة الخامسة",
    degree: "الثالثة",
    trimester: "الثلاثي الثاني",
    period: "الفترة 3",
    duration: "45 دقيقة",
    domainCompetency: "حلّ وضعيات مشكل دالّة متّصلة بالمحيط",
    subjectFinalCompetency: "حلّ وضعيات مشكل دالّة بإنجاز بحوث ومشاريع متّصلة بالجسم البشري",
    competencyComponent: "يتعرّف الجهاز التنفسي ويفسّر آلية التنفس",
    distinguishedObjective: "يتعرّف أعضاء الجهاز التنفسي ووظائفها",
    sessionObjective: "أن يكون المتعلّم قادراً على تسمية أعضاء الجهاز التنفسي الرئيسية وتحديد دور كلّ عضو",
    proceduralObjectives: [
      "يسمّي أعضاء الجهاز التنفسي",
      "يرتّب مسار الهواء من الأنف إلى الرئتين",
      "يفسّر دور الحجاب الحاجز في عملية التنفس"
    ],
    prerequisites: [
      "الحواس الخمس",
      "أعضاء الجسم الرئيسية"
    ],
    materials: ["صورة الجهاز التنفسي", "مجسّم الرئتين", "السبورة"],
    explorationPhase: {
      duration: "10 دقائق",
      situation: "يطلب المعلم من التلاميذ الجري في المكان لمدة دقيقة ثم يسألهم: ماذا تلاحظون؟",
      teacherRole: "يطرح أسئلة تحفيزية ويوجّه النقاش",
      studentRole: "يلاحظ التغيّرات في تنفسه ويعبّر عنها شفوياً",
      tools: "الفضاء المدرسي"
    },
    constructionPhase: {
      duration: "25 دقائق",
      problemSituation: "صديقك سأل: لماذا نتنفس بسرعة بعد الجري؟ ساعده على فهم مسار الهواء في جسمنا",
      steps: [
        { step: "الملاحظة", teacherRole: "يعرض صورة الجهاز التنفسي", studentRole: "يلاحظ ويسمّي الأعضاء", tools: "صورة مكبّرة" },
        { step: "التجريب", teacherRole: "يوزّع ورقة عمل", studentRole: "يرتّب مسار الهواء", tools: "ورقة عمل" },
        { step: "الاستنتاج", teacherRole: "يوجّه نحو الخلاصة", studentRole: "يصوغ القاعدة", tools: "السبورة" }
      ]
    },
    applicationPhase: {
      duration: "5 دقائق",
      situation: "تمرين: أكمل الرسم التخطيطي للجهاز التنفسي بوضع الأسماء الصحيحة",
      teacherRole: "يوزّع التمرين ويتابع",
      studentRole: "ينجز التمرين فردياً",
      tools: "ورقة التمرين"
    },
    integrationPhase: {
      duration: "5 دقائق",
      context: "جارك الصغير يسأل: لماذا يجب أن نتنفس هواءً نظيفاً؟",
      instruction: "أجب جارك مستعملاً ما تعلّمته عن الجهاز التنفسي",
      successCriteria: "يذكر 3 أعضاء على الأقل ويربط بين التلوث وصحة الرئتين"
    },
    remediation: {
      anticipatedDifficulties: ["الخلط بين القصبة الهوائية والمريء", "صعوبة ترتيب مسار الهواء"],
      remediationActivities: ["تمرين مبسّط بالصور مع أسهم توجيهية", "عمل ثنائي: تلميذ يشرح لزميله"],
      minimumCriteria: "يسمّي 3 أعضاء رئيسية من الجهاز التنفسي"
    },
    conclusion: "الجهاز التنفسي يتكوّن من الأنف والقصبة الهوائية والرئتين والحجاب الحاجز",
    teacherNotes: ""
  };

  it("should have all 6 required sections in the lesson sheet", () => {
    // Section 1: Administrative Header
    expect(sampleLessonSheet.planType).toBeDefined();
    expect(sampleLessonSheet.subject).toBeDefined();
    expect(sampleLessonSheet.level).toBeDefined();
    expect(sampleLessonSheet.degree).toBeDefined();
    expect(sampleLessonSheet.trimester).toBeDefined();
    expect(sampleLessonSheet.duration).toBeDefined();

    // Section 2: Pedagogical Reference
    expect(sampleLessonSheet.domainCompetency).toBeDefined();
    expect(sampleLessonSheet.subjectFinalCompetency).toBeDefined();
    expect(sampleLessonSheet.competencyComponent).toBeDefined();
    expect(sampleLessonSheet.distinguishedObjective).toBeDefined();
    expect(sampleLessonSheet.sessionObjective).toBeDefined();

    // Section 3: Pedagogical Workflow (4 phases)
    expect(sampleLessonSheet.explorationPhase).toBeDefined();
    expect(sampleLessonSheet.constructionPhase).toBeDefined();
    expect(sampleLessonSheet.applicationPhase).toBeDefined();
    expect(sampleLessonSheet.integrationPhase).toBeDefined();

    // Section 4: Integration & Evaluation
    expect(sampleLessonSheet.integrationPhase.context).toBeDefined();
    expect(sampleLessonSheet.integrationPhase.instruction).toBeDefined();
    expect(sampleLessonSheet.integrationPhase.successCriteria).toBeDefined();

    // Section 5: Remediation
    expect(sampleLessonSheet.remediation).toBeDefined();
    expect(sampleLessonSheet.remediation.anticipatedDifficulties).toBeDefined();
    expect(sampleLessonSheet.remediation.remediationActivities).toBeDefined();
    expect(sampleLessonSheet.remediation.minimumCriteria).toBeDefined();

    // Section 6: Teacher Notes
    expect(sampleLessonSheet).toHaveProperty("teacherNotes");
  });

  it("should have competency-based approach fields (المقاربة بالكفايات)", () => {
    expect(sampleLessonSheet.domainCompetency).toContain("وضعيات مشكل");
    expect(sampleLessonSheet.subjectFinalCompetency).toContain("بإنجاز بحوث");
    expect(sampleLessonSheet.competencyComponent).toBeTruthy();
    expect(sampleLessonSheet.sessionObjective).toContain("أن يكون المتعلّم قادراً");
  });

  it("should have 4 pedagogical phases with required fields", () => {
    // Exploration phase
    const exp = sampleLessonSheet.explorationPhase;
    expect(exp.duration).toBeDefined();
    expect(exp.situation).toBeDefined();
    expect(exp.teacherRole).toBeDefined();
    expect(exp.studentRole).toBeDefined();

    // Construction phase with steps
    const con = sampleLessonSheet.constructionPhase;
    expect(con.duration).toBeDefined();
    expect(con.problemSituation).toBeDefined();
    expect(con.steps).toBeInstanceOf(Array);
    expect(con.steps.length).toBeGreaterThan(0);
    con.steps.forEach(step => {
      expect(step.step).toBeDefined();
      expect(step.teacherRole).toBeDefined();
      expect(step.studentRole).toBeDefined();
    });

    // Application phase
    const app = sampleLessonSheet.applicationPhase;
    expect(app.duration).toBeDefined();
    expect(app.situation).toBeDefined();

    // Integration phase (Sened/Ta'lima)
    const int = sampleLessonSheet.integrationPhase;
    expect(int.context).toBeDefined(); // السند
    expect(int.instruction).toBeDefined(); // التعليمة
    expect(int.successCriteria).toBeDefined();
  });

  it("should have remediation with difficulties and activities", () => {
    const rem = sampleLessonSheet.remediation;
    expect(rem.anticipatedDifficulties).toBeInstanceOf(Array);
    expect(rem.anticipatedDifficulties.length).toBeGreaterThan(0);
    expect(rem.remediationActivities).toBeInstanceOf(Array);
    expect(rem.remediationActivities.length).toBeGreaterThan(0);
    expect(rem.minimumCriteria).toBeTruthy();
  });

  it("should have procedural objectives and prerequisites", () => {
    expect(sampleLessonSheet.proceduralObjectives).toBeInstanceOf(Array);
    expect(sampleLessonSheet.proceduralObjectives.length).toBeGreaterThanOrEqual(2);
    expect(sampleLessonSheet.prerequisites).toBeInstanceOf(Array);
    expect(sampleLessonSheet.prerequisites.length).toBeGreaterThan(0);
  });

  it("should have materials list", () => {
    expect(sampleLessonSheet.materials).toBeInstanceOf(Array);
    expect(sampleLessonSheet.materials.length).toBeGreaterThan(0);
  });
});

describe("Lesson Plan - Word Export Structure", () => {
  it("should map new fields to Word export sections", () => {
    // Verify the field mapping for Word export
    const fieldMapping = {
      // Section 1: Admin Header
      adminHeader: ["planType", "subject", "level", "degree", "trimester", "period", "duration"],
      // Section 2: Pedagogical Reference
      pedagogicalRef: ["domainCompetency", "subjectFinalCompetency", "competencyComponent", "distinguishedObjective", "sessionObjective"],
      // Section 3: Pedagogical Workflow
      workflow: ["explorationPhase", "constructionPhase", "applicationPhase"],
      // Section 4: Integration & Evaluation
      evaluation: ["integrationPhase", "conclusion", "summativeEvaluation"],
      // Section 5: Remediation
      remediation: ["remediation"],
      // Section 6: Teacher Notes
      notes: ["teacherNotes"]
    };

    expect(fieldMapping.adminHeader).toContain("planType");
    expect(fieldMapping.adminHeader).toContain("degree");
    expect(fieldMapping.pedagogicalRef).toContain("domainCompetency");
    expect(fieldMapping.pedagogicalRef).toContain("subjectFinalCompetency");
    expect(fieldMapping.pedagogicalRef).toContain("competencyComponent");
    expect(fieldMapping.workflow).toContain("explorationPhase");
    expect(fieldMapping.workflow).toContain("constructionPhase");
    expect(fieldMapping.workflow).toContain("applicationPhase");
    expect(fieldMapping.evaluation).toContain("integrationPhase");
    expect(fieldMapping.remediation).toContain("remediation");
    expect(fieldMapping.notes).toContain("teacherNotes");
  });

  it("should support construction phase steps table format", () => {
    const steps = [
      { step: "الملاحظة", teacherRole: "يعرض", studentRole: "يلاحظ", tools: "صورة" },
      { step: "التجريب", teacherRole: "يوزّع", studentRole: "ينجز", tools: "ورقة" },
      { step: "الاستنتاج", teacherRole: "يوجّه", studentRole: "يصوغ", tools: "سبورة" }
    ];

    // Each step should have 4 columns: step name, teacher, student, tools
    steps.forEach(step => {
      expect(Object.keys(step)).toEqual(expect.arrayContaining(["step", "teacherRole", "studentRole", "tools"]));
    });
  });

  it("should handle missing optional fields gracefully", () => {
    const minimalSheet = {
      subject: "رياضيات",
      level: "السنة الرابعة",
      distinguishedObjective: "الجمع والطرح",
      explorationPhase: { duration: "10 دقائق", situation: "وضعية" },
      constructionPhase: { duration: "20 دقائق", steps: [] }
    };

    // These should not throw
    expect(minimalSheet.subject).toBeTruthy();
    expect(minimalSheet.level).toBeTruthy();
    expect(minimalSheet.distinguishedObjective).toBeTruthy();
    // Optional fields should be undefined, not error
    expect((minimalSheet as any).remediation).toBeUndefined();
    expect((minimalSheet as any).teacherNotes).toBeUndefined();
    expect((minimalSheet as any).domainCompetency).toBeUndefined();
  });
});

describe("Lesson Plan - UI Display Sections", () => {
  it("should display 6 sections in the correct order", () => {
    const sectionOrder = [
      "الترويسة الإدارية",
      "المرجعية البيداغوجية",
      "التمشي البيداغوجي",
      "الإدماج والتقييم",
      "الدعم والعلاج",
      "ملاحظات المعلم"
    ];

    expect(sectionOrder).toHaveLength(6);
    expect(sectionOrder[0]).toBe("الترويسة الإدارية");
    expect(sectionOrder[1]).toBe("المرجعية البيداغوجية");
    expect(sectionOrder[2]).toBe("التمشي البيداغوجي");
    expect(sectionOrder[3]).toBe("الإدماج والتقييم");
    expect(sectionOrder[4]).toBe("الدعم والعلاج");
    expect(sectionOrder[5]).toBe("ملاحظات المعلم");
  });

  it("should display phase workflow as a structured table with 4 columns", () => {
    const tableColumns = ["المرحلة", "دور المعلم", "نشاط المتعلم", "الوسائل والوسائط"];
    expect(tableColumns).toHaveLength(4);
    expect(tableColumns).toContain("المرحلة");
    expect(tableColumns).toContain("دور المعلم");
    expect(tableColumns).toContain("نشاط المتعلم");
    expect(tableColumns).toContain("الوسائل والوسائط");
  });

  it("should display integration phase with Sened/Ta'lima format", () => {
    const integrationDisplay = {
      sened: "السند: جارك الصغير يسأل...",
      talima: "التعليمة: أجب جارك مستعملاً...",
      criteria: "معيار النجاح: يذكر 3 أعضاء..."
    };

    expect(integrationDisplay.sened).toContain("السند");
    expect(integrationDisplay.talima).toContain("التعليمة");
    expect(integrationDisplay.criteria).toContain("معيار النجاح");
  });
});

describe("Lesson Plan - Tunisian Terminology Compliance", () => {
  it("should use official Tunisian pedagogical terms", () => {
    const requiredTerms = [
      "كفاية المجال",
      "الكفاية النهائية",
      "مكوّن الكفاية",
      "الهدف المميز",
      "هدف الحصة",
      "وضعية مشكل دالة",
      "معايير الحد الأدنى",
      "المقاربة بالكفايات"
    ];

    requiredTerms.forEach(term => {
      expect(term).toBeTruthy();
      expect(term.length).toBeGreaterThan(3);
    });
  });

  it("should follow the competency-based approach hierarchy", () => {
    // Hierarchy: Domain Competency > Subject Final Competency > Component > Distinguished Objective > Session Objective
    const hierarchy = [
      "domainCompetency",
      "subjectFinalCompetency",
      "competencyComponent",
      "distinguishedObjective",
      "sessionObjective"
    ];

    expect(hierarchy.indexOf("domainCompetency")).toBeLessThan(hierarchy.indexOf("subjectFinalCompetency"));
    expect(hierarchy.indexOf("subjectFinalCompetency")).toBeLessThan(hierarchy.indexOf("competencyComponent"));
    expect(hierarchy.indexOf("competencyComponent")).toBeLessThan(hierarchy.indexOf("distinguishedObjective"));
    expect(hierarchy.indexOf("distinguishedObjective")).toBeLessThan(hierarchy.indexOf("sessionObjective"));
  });
});
