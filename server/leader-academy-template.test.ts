import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock QRCode
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,mockQRCode"),
  },
}));

// Mock fs
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue(Buffer.from("mockLogoData")),
  },
  existsSync: vi.fn().mockReturnValue(false),
  readFileSync: vi.fn().mockReturnValue(Buffer.from("mockLogoData")),
}));

describe("Leader Academy Template", () => {
  it("should generate HTML with required sections", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      duration: "45 دقيقة",
      problemSituation: "لماذا يتبخر الماء عند التسخين؟",
      hypotheses: "الحرارة تحول الماء إلى بخار",
      conclusion: "الماء يتحول من السائل إلى الغاز عند التسخين",
      evaluation: "ما هي حالات الماء الثلاث؟",
      language: "arabic",
    });

    // Check basic structure
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Leader Academy Standard");
    expect(html).toContain("المساعد البيداغوجي الذكي");
    expect(html).toContain("نسخة تونس 2026");
    expect(html).toContain("المقاربة بالكفايات");
  });

  it("should include lesson data in the HTML", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      problemSituation: "وضعية مشكلة تجريبية",
      language: "arabic",
    });

    expect(html).toContain("2025-2026");
    expect(html).toContain("الإيقاظ العلمي");
    expect(html).toContain("خصائص الماء");
    expect(html).toContain("وضعية مشكلة تجريبية");
  });

  it("should include RTL direction for Arabic", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      language: "arabic",
    });

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
  });

  it("should include Tunisian identity in footer", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      language: "arabic",
    });

    expect(html).toContain("الجمهورية التونسية");
    expect(html).toContain("leaderacademy.school");
  });

  it("should include QR code section", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      qrUrl: "https://leaderacademy.school",
      language: "arabic",
    });

    expect(html).toContain("امسح للمعاينة");
  });

  it("should include Amiri font from Google Fonts", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "السنة الثالثة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "خصائص الماء",
      language: "arabic",
    });

    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("Amiri");
  });

  it("should support French language", async () => {
    const { generateLeaderAcademyPDF } = await import("./leaderAcademyTemplate");

    const html = await generateLeaderAcademyPDF({
      schoolYear: "2025-2026",
      level: "3ème année primaire",
      subject: "Éveil scientifique",
      lessonTitle: "Propriétés de l'eau",
      language: "french",
    });

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('lang="fr"');
    expect(html).toContain("République Tunisienne");
    expect(html).toContain("Informations générales");
  });
});
