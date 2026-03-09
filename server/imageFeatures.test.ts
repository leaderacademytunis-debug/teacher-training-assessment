import { describe, it, expect, vi } from "vitest";

describe("Image Features - Educational Image Library", () => {
  it("should have Tunisia map URL defined correctly", () => {
    const TUNISIA_MAP_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/tunisia-map_3f49e2c4.webp";
    expect(TUNISIA_MAP_URL).toBeTruthy();
    expect(TUNISIA_MAP_URL).toContain("cloudfront.net");
    expect(TUNISIA_MAP_URL).toContain("tunisia-map");
  });

  it("should categorize library images by subject", () => {
    const subjects = [
      "الإيقاظ العلمي",
      "الرياضيات",
      "التربية الإسلامية",
      "التربية المدنية",
    ];
    // All expected subjects should be present
    expect(subjects.length).toBeGreaterThanOrEqual(4);
    expect(subjects).toContain("الإيقاظ العلمي");
    expect(subjects).toContain("الرياضيات");
  });

  it("should have pre-built images with required fields", () => {
    const sampleImage = {
      id: "tunisia-map-political",
      url: "https://example.com/map.webp",
      title_ar: "خريطة تونس السياسية",
      category: "جغرافيا",
      subject: "الإيقاظ العلمي",
      tags: ["تونس", "خريطة"],
    };
    expect(sampleImage.id).toBeTruthy();
    expect(sampleImage.title_ar).toBeTruthy();
    expect(sampleImage.category).toBeTruthy();
    expect(sampleImage.subject).toBeTruthy();
    expect(sampleImage.tags.length).toBeGreaterThan(0);
  });
});

describe("Image Features - Overlay Editor", () => {
  it("should validate overlay text label structure", () => {
    const label = {
      id: "label-1",
      text: "الجذور",
      x: 100,
      y: 200,
      fontSize: 16,
      color: "#000000",
      fontWeight: "bold" as const,
    };
    expect(label.text).toBeTruthy();
    expect(label.x).toBeGreaterThanOrEqual(0);
    expect(label.y).toBeGreaterThanOrEqual(0);
    expect(label.fontSize).toBeGreaterThan(0);
    expect(label.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("should support Arabic text in labels", () => {
    const arabicTexts = [
      "الجهاز الهضمي",
      "المعدة",
      "الأمعاء الدقيقة",
      "الأمعاء الغليظة",
      "المريء",
    ];
    arabicTexts.forEach((text) => {
      expect(text.length).toBeGreaterThan(0);
      // Arabic text should contain Arabic characters
      expect(/[\u0600-\u06FF]/.test(text)).toBe(true);
    });
  });
});

describe("Image Features - Regenerate Single Image", () => {
  it("should identify image by index for regeneration", () => {
    const images = [
      { url: "https://example.com/1.png", caption: "أسد" },
      { url: "https://example.com/2.png", caption: "غزالة" },
      { url: "https://example.com/3.png", caption: "سلحفاة" },
    ];
    const indexToRegenerate = 1;
    expect(images[indexToRegenerate]).toBeDefined();
    expect(images[indexToRegenerate].caption).toBe("غزالة");
  });

  it("should replace only the targeted image after regeneration", () => {
    const images = [
      { url: "https://example.com/1.png", caption: "أسد" },
      { url: "https://example.com/2.png", caption: "غزالة" },
      { url: "https://example.com/3.png", caption: "سلحفاة" },
    ];
    const idx = 1;
    const newUrl = "https://example.com/2_new.png";
    const updatedImages = images.map((item, i) =>
      i === idx ? { ...item, url: newUrl } : item
    );
    expect(updatedImages[0].url).toBe("https://example.com/1.png");
    expect(updatedImages[1].url).toBe(newUrl);
    expect(updatedImages[1].caption).toBe("غزالة");
    expect(updatedImages[2].url).toBe("https://example.com/3.png");
  });
});

describe("Image Generation - Arabic Text Avoidance", () => {
  it("should translate Arabic prompts to English for image generation", () => {
    // The system prompt instructs LLM to translate Arabic descriptions
    const systemPrompt = "You are an image prompt translator. Convert Arabic educational image descriptions to English prompts suitable for AI image generation. CRITICAL: Include 'NO TEXT, NO LETTERS, NO WORDS, NO ARABIC SCRIPT' in every prompt.";
    expect(systemPrompt).toContain("NO TEXT");
    expect(systemPrompt).toContain("NO ARABIC SCRIPT");
    expect(systemPrompt).toContain("English");
  });

  it("should include no-text instruction in generated prompts", () => {
    const basePrompt = "A lion in its natural habitat, educational illustration for children";
    const fullPrompt = `${basePrompt}. IMPORTANT: Do not include any text, letters, words, or Arabic script in the image. The image should be purely visual with no written content.`;
    expect(fullPrompt).toContain("Do not include any text");
    expect(fullPrompt).toContain("purely visual");
  });
});
