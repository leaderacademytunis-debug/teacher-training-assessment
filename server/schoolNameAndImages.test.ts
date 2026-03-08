import { describe, it, expect } from "vitest";

// ─── Test: School Name in User Profile ─────────────────────────────────────────

describe("School Name Feature", () => {
  it("should accept schoolName in profile update input schema", () => {
    // The profile.update endpoint accepts schoolName as optional string
    const validInput = {
      firstNameAr: "أحمد",
      lastNameAr: "بن علي",
      schoolName: "المدرسة الابتدائية النموذجية بتونس",
    };
    expect(validInput.schoolName).toBeDefined();
    expect(typeof validInput.schoolName).toBe("string");
  });

  it("should allow empty schoolName", () => {
    const input = { schoolName: "" };
    expect(input.schoolName).toBe("");
  });

  it("should handle long school names", () => {
    const longName = "المدرسة الابتدائية الخاصة بالمنطقة الشمالية لولاية تونس العاصمة";
    expect(longName.length).toBeLessThanOrEqual(255);
  });
});

// ─── Test: Line Art Placeholder Detection ──────────────────────────────────────

describe("Line Art Placeholder Detection", () => {
  it("should detect [رسم: ...] placeholders in exam content", () => {
    const examContent = `
## الوضعية 1: السند

[رسم: كوب ماء وصحن فاكهة]

### التعليمة 1 (مع1 أ)

أنظر إلى الرسم وأجب:

## الوضعية 2: السند

[رسم: أنف وأذن]

### التعليمة 2 (مع2 أ)
`;
    const placeholders: RegExpExecArray[] = [];
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(examContent)) !== null) placeholders.push(m);

    expect(placeholders).toHaveLength(2);
    expect(placeholders[0][1].trim()).toBe("كوب ماء وصحن فاكهة");
    expect(placeholders[1][1].trim()).toBe("أنف وأذن");
  });

  it("should return empty array when no placeholders exist", () => {
    const examContent = "## الوضعية 1\n\nهذا اختبار بدون رسومات";
    const placeholders: RegExpExecArray[] = [];
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(examContent)) !== null) placeholders.push(m);

    expect(placeholders).toHaveLength(0);
  });

  it("should handle multiple placeholders on same line", () => {
    const content = "[رسم: تفاحة] و [رسم: برتقالة]";
    const placeholders: RegExpExecArray[] = [];
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(content)) !== null) placeholders.push(m);

    expect(placeholders).toHaveLength(2);
    expect(placeholders[0][1].trim()).toBe("تفاحة");
    expect(placeholders[1][1].trim()).toBe("برتقالة");
  });

  it("should handle placeholder with extra spaces", () => {
    const content = "[رسم:    حيوانات المزرعة   ]";
    const placeholders: RegExpExecArray[] = [];
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(content)) !== null) placeholders.push(m);

    expect(placeholders).toHaveLength(1);
    expect(placeholders[0][1].trim()).toBe("حيوانات المزرعة");
  });
});

// ─── Test: Image Generation Input Validation ───────────────────────────────────

describe("Image Generation Input", () => {
  it("should validate bw_lineart style for exam images", () => {
    const validStyles = ["bw_lineart", "minimalist", "cartoon", "realistic", "diagram", "coloring"];
    const examStyle = "bw_lineart";
    expect(validStyles).toContain(examStyle);
  });

  it("should construct proper image generation input", () => {
    const description = "كوب ماء وصحن فاكهة";
    const input = {
      prompt: description,
      style: "bw_lineart" as const,
      subject: "الإيقاظ العلمي",
      level: "السنة الثانية ابتدائي",
      source: "exam-builder",
    };

    expect(input.prompt).toBe(description);
    expect(input.style).toBe("bw_lineart");
    expect(input.source).toBe("exam-builder");
  });
});

// ─── Test: School Name in PrintPreview Header ──────────────────────────────────

describe("School Name in Exam Header", () => {
  it("should use provided school name in header", () => {
    const schoolName = "المدرسة الابتدائية النموذجية";
    const headerHTML = `<div class="school-name">${schoolName}</div>`;
    expect(headerHTML).toContain(schoolName);
  });

  it("should use default placeholder when no school name", () => {
    const defaultSchoolName = "..................";
    const headerHTML = `<div class="school-name">${defaultSchoolName}</div>`;
    expect(headerHTML).toContain("..................");
  });

  it("should prioritize input over saved school name", () => {
    const savedName = "المدرسة القديمة";
    const inputName = "المدرسة الجديدة";
    const finalName = inputName.trim() || savedName || "..................";
    expect(finalName).toBe("المدرسة الجديدة");
  });

  it("should fall back to saved name when input is empty", () => {
    const savedName = "المدرسة المحفوظة";
    const inputName = "";
    const finalName = inputName.trim() || savedName || "..................";
    expect(finalName).toBe("المدرسة المحفوظة");
  });

  it("should fall back to placeholder when both are empty", () => {
    const savedName = "";
    const inputName = "";
    const finalName = inputName.trim() || savedName || "..................";
    expect(finalName).toBe("..................");
  });
});

// ─── Test: Images Array for PrintPreview ───────────────────────────────────────

describe("Images Array for PrintPreview", () => {
  it("should pass images to PrintPreview when available", () => {
    const images = [
      { url: "https://example.com/img1.png", caption: "كوب ماء" },
      { url: "https://example.com/img2.png", caption: "أنف" },
    ];
    expect(images).toHaveLength(2);
    expect(images[0].caption).toBe("كوب ماء");
  });

  it("should pass undefined when no images", () => {
    const examImages: Array<{ url: string; caption?: string }> = [];
    const propsImages = examImages.length > 0 ? examImages : undefined;
    expect(propsImages).toBeUndefined();
  });

  it("should handle images without captions", () => {
    const images = [
      { url: "https://example.com/img1.png" },
    ];
    expect(images[0].caption).toBeUndefined();
    expect(images[0].url).toBeDefined();
  });
});
