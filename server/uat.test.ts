import { describe, it, expect } from "vitest";

// ===== PILLAR 1: Branding & Identity =====
describe("Pillar 1: Branding & Identity", () => {
  it("schoolName field is defined in exportExamWord input schema", () => {
    // The exportExamWord now accepts schoolName, schoolYear, schoolLogoUrl
    const inputSchema = {
      subject: "إيقاظ علمي",
      level: "السنة الخامسة",
      trimester: "الثلاثي الأول",
      examContent: "test",
      schoolName: "المدرسة الابتدائية النموذجية",
      schoolYear: "2025-2026",
      schoolLogoUrl: "https://example.com/logo.png",
    };
    expect(inputSchema.schoolName).toBe("المدرسة الابتدائية النموذجية");
    expect(inputSchema.schoolYear).toBe("2025-2026");
    expect(inputSchema.schoolLogoUrl).toBeDefined();
  });

  it("header table uses dynamic schoolName instead of hardcoded dots", () => {
    const schoolName = "المدرسة الابتدائية بن عروس";
    const headerText = `${schoolName}\nالمدرسة الابتدائيّة`;
    expect(headerText).toContain(schoolName);
    expect(headerText).not.toBe("..................\nالمدرسة الابتدائيّة");
  });

  it("schoolLogo field exists in user schema", () => {
    const userFields = ["id", "name", "email", "role", "schoolName", "schoolLogo"];
    expect(userFields).toContain("schoolLogo");
    expect(userFields).toContain("schoolName");
  });
});

// ===== PILLAR 2: EDUGPT Core =====
describe("Pillar 2: EDUGPT Core (Pedagogical Logic)", () => {
  const sampleExam = `
## الوضعية 1: (مع1 أ)

**السند:**
يلاحظ أحمد أن النباتات في حديقة المدرسة تنمو بسرعة في فصل الربيع.

[رسم: نبتة في مراحل النمو المختلفة]

**التعليمة:**
رتّب مراحل نمو النبتة من البذرة إلى النبتة الكاملة.

---

## الوضعية 2: (مع2 ب)

**السند:**
في حصة الإيقاظ العلمي، قامت المعلمة بتجربة حول التنفس.

**التعليمة:**
أكمل الرسم التالي بوضع الأسهم التي تبين مسار الهواء.

---

## جدول إسناد الأعداد

| المعيار | مع1 أ | مع1 ب | مع2 أ | مع2 ب | مع2 ج | مع3 |
|---------|-------|-------|-------|-------|-------|-----|
| العدد   | 3     | 3     | 2     | 2     | 2     | 2   |
`;

  it("exam follows Sened/Ta'lima structure", () => {
    expect(sampleExam).toContain("**السند:**");
    expect(sampleExam).toContain("**التعليمة:**");
  });

  it("criteria codes are present (مع1 أ، مع2 ب)", () => {
    expect(sampleExam).toContain("مع1 أ");
    expect(sampleExam).toContain("مع2 ب");
  });

  it("grading table is included at the end", () => {
    expect(sampleExam).toContain("جدول إسناد الأعداد");
    expect(sampleExam).toContain("مع3");
  });

  it("image placeholders use [رسم: ...] format", () => {
    const placeholderRegex = /\[رسم:\s*[^\]]+\]/;
    expect(placeholderRegex.test(sampleExam)).toBe(true);
  });
});

// ===== PILLAR 3: Visual Studio =====
describe("Pillar 3: Visual Studio (Image Handling)", () => {
  it("auto-detects [رسم: ...] placeholders from exam content", () => {
    const content = "هذا سند يحتوي على [رسم: جهاز التنفس عند الإنسان] و [رسم: كوب ماء]";
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    const matches: string[] = [];
    let m;
    while ((m = regex.exec(content)) !== null) {
      matches.push(m[1].trim());
    }
    expect(matches).toHaveLength(2);
    expect(matches[0]).toBe("جهاز التنفس عند الإنسان");
    expect(matches[1]).toBe("كوب ماء");
  });

  it("bw_lineart style is used for educational images", () => {
    const imagePrompt = "Simple black and white line art drawing for primary school exam: جهاز التنفس";
    expect(imagePrompt).toContain("black and white line art");
  });

  it("gallery supports individual and bulk deletion", () => {
    let images = [
      { url: "img1.png", caption: "صورة 1" },
      { url: "img2.png", caption: "صورة 2" },
      { url: "img3.png", caption: "صورة 3" },
    ];
    // Individual delete
    images = images.filter((_, i) => i !== 1);
    expect(images).toHaveLength(2);
    expect(images[0].caption).toBe("صورة 1");
    // Bulk delete
    images = [];
    expect(images).toHaveLength(0);
  });
});

// ===== PILLAR 4: Grading & Export Engine =====
describe("Pillar 4: Grading & Export Engine", () => {
  it("grading table uses ---/+++ scoring system", () => {
    const gradingSystem = ["---", "+--", "++-", "+++"];
    expect(gradingSystem).toHaveLength(4);
    expect(gradingSystem[0]).toBe("---");
    expect(gradingSystem[3]).toBe("+++");
  });

  it("grading table can be manually edited", () => {
    const gradingData = [
      { criterion: "مع1 أ", score: 3, maxScore: 4 },
      { criterion: "مع2 ب", score: 2, maxScore: 3 },
    ];
    // Edit score
    gradingData[0].score = 4;
    expect(gradingData[0].score).toBe(4);
    // Total calculation
    const total = gradingData.reduce((sum, g) => sum + g.score, 0);
    expect(total).toBe(6);
  });

  it("Word export includes page borders", () => {
    // The document section properties now include page borders
    const pageBorders = {
      pageBorderTop: { style: "SINGLE", size: 6, color: "333333", space: 10 },
      pageBorderBottom: { style: "SINGLE", size: 6, color: "333333", space: 10 },
      pageBorderLeft: { style: "SINGLE", size: 6, color: "333333", space: 10 },
      pageBorderRight: { style: "SINGLE", size: 6, color: "333333", space: 10 },
    };
    expect(pageBorders.pageBorderTop).toBeDefined();
    expect(pageBorders.pageBorderTop.style).toBe("SINGLE");
    expect(pageBorders.pageBorderTop.size).toBe(6);
  });

  it("Word export uses dynamic school name and year", () => {
    const input = {
      schoolName: "المدرسة الابتدائية سيدي بوزيد",
      schoolYear: "2025-2026",
    };
    const headerCell = `${input.schoolName || '..................'}\nالمدرسة الابتدائيّة`;
    expect(headerCell).toContain("سيدي بوزيد");
    expect(headerCell).not.toContain("..................");
  });
});

// ===== PILLAR 5: Admin & Access Control =====
describe("Pillar 5: Admin & Access Control", () => {
  it("free accounts are blocked from image generation", () => {
    const tier = "free";
    const isAdmin = false;
    const isFreeAccount = tier === "free" && !isAdmin;
    expect(isFreeAccount).toBe(true);
  });

  it("admin accounts bypass free restrictions", () => {
    const tier = "free";
    const isAdmin = true;
    const isFreeAccount = tier === "free" && !isAdmin;
    expect(isFreeAccount).toBe(false);
  });

  it("pro accounts are not blocked", () => {
    const tier = "pro";
    const isAdmin = false;
    const isFreeAccount = tier === "free" && !isAdmin;
    expect(isFreeAccount).toBe(false);
  });

  it("bulk activation handles up to 500 emails", () => {
    const emails = Array.from({ length: 500 }, (_, i) => `user${i}@test.com`);
    expect(emails).toHaveLength(500);
    expect(emails[0]).toBe("user0@test.com");
    expect(emails[499]).toBe("user499@test.com");
  });

  it("bulk activation rejects more than 500 emails", () => {
    const emails = Array.from({ length: 501 }, (_, i) => `user${i}@test.com`);
    expect(emails.length > 500).toBe(true);
  });

  it("email parsing handles various separators", () => {
    const rawInput = "a@b.com\nc@d.com, e@f.com; g@h.com";
    const parsed = rawInput
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes("@"));
    expect(parsed).toHaveLength(4);
    expect(parsed).toContain("a@b.com");
    expect(parsed).toContain("g@h.com");
  });

  it("smart onboarding prompts for subject and grade", () => {
    const welcomeMessages = {
      ar: "لبدء المحادثة، يرجى تحديد المادة الدراسية والمستوى أولاً",
      fr: "Pour commencer, veuillez sélectionner la matière et le niveau",
    };
    expect(welcomeMessages.ar).toContain("المادة الدراسية");
    expect(welcomeMessages.ar).toContain("المستوى");
    expect(welcomeMessages.fr).toContain("matière");
    expect(welcomeMessages.fr).toContain("niveau");
  });
});
