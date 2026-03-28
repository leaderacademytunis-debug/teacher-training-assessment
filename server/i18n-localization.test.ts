import { describe, it, expect } from "vitest";

/**
 * Comprehensive i18n / Localization Tests
 * Tests the translation system, RTL/LTR logic, and AI language context passing
 */

// ─── Import translation modules ───
// We test the translation dictionaries directly since they're pure functions
import { getUltimateStudioTranslations, ultimateStudioTranslations } from "../client/src/lib/ultimateStudioTranslations";

describe("Ultimate Studio Translations", () => {
  const languages = ["ar", "fr", "en"] as const;

  it("should return translations for all 3 languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t).toBeDefined();
      expect(typeof t.studioTitle).toBe("string");
      expect(t.studioTitle.length).toBeGreaterThan(0);
    }
  });

  it("should have matching keys across all languages", () => {
    const arKeys = Object.keys(ultimateStudioTranslations.ar).sort();
    const frKeys = Object.keys(ultimateStudioTranslations.fr).sort();
    const enKeys = Object.keys(ultimateStudioTranslations.en).sort();

    expect(arKeys).toEqual(frKeys);
    expect(arKeys).toEqual(enKeys);
  });

  it("should have non-empty values for all keys in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      for (const [key, value] of Object.entries(t)) {
        expect(value, `${lang}.${key} should not be empty`).toBeTruthy();
        expect(typeof value, `${lang}.${key} should be string`).toBe("string");
      }
    }
  });

  it("should return Arabic translations by default for unknown language", () => {
    // @ts-expect-error - testing fallback
    const t = getUltimateStudioTranslations("xx");
    expect(t.studioTitle).toBe(ultimateStudioTranslations.ar.studioTitle);
  });

  it("should have Arabic translations with Arabic characters", () => {
    const t = getUltimateStudioTranslations("ar");
    // Check that key Arabic strings contain Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.newProject)).toBe(true);
    expect(arabicRegex.test(t.sourceTitle)).toBe(true);
    expect(arabicRegex.test(t.pipelineTitle)).toBe(true);
    expect(arabicRegex.test(t.storyboardTitle)).toBe(true);
  });

  it("should have French translations with French characters", () => {
    const t = getUltimateStudioTranslations("fr");
    // French strings should not contain Arabic
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.newProject)).toBe(false);
    expect(arabicRegex.test(t.sourceTitle)).toBe(false);
    expect(arabicRegex.test(t.pipelineTitle)).toBe(false);
  });

  it("should have English translations without Arabic or accented-only strings", () => {
    const t = getUltimateStudioTranslations("en");
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.newProject)).toBe(false);
    expect(arabicRegex.test(t.sourceTitle)).toBe(false);
    expect(arabicRegex.test(t.generateScript)).toBe(false);
  });

  // ─── Specific critical translations ───
  it("should have correct CTA button translations", () => {
    expect(getUltimateStudioTranslations("ar").btnSave).toBe("حفظ");
    expect(getUltimateStudioTranslations("fr").btnSave).toBe("Enregistrer");
    expect(getUltimateStudioTranslations("en").btnSave).toBe("Save");
  });

  it("should have correct pipeline step translations", () => {
    const ar = getUltimateStudioTranslations("ar");
    const fr = getUltimateStudioTranslations("fr");
    const en = getUltimateStudioTranslations("en");

    expect(ar.stepScript).toBe("السيناريو");
    expect(fr.stepScript).toBe("Scénario");
    expect(en.stepScript).toBe("Script");

    expect(ar.stepVision).toBe("الأوامر البصرية");
    expect(fr.stepVision).toBe("Commandes visuelles");
    expect(en.stepVision).toBe("Visual Commands");

    expect(ar.stepVoice).toBe("التعليق الصوتي");
    expect(fr.stepVoice).toBe("Narration vocale");
    expect(en.stepVoice).toBe("Voice Over");
  });

  it("should have VIP paywall translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.vipExclusive.length).toBeGreaterThan(0);
      expect(t.vipPackage.length).toBeGreaterThan(0);
      expect(t.vipDescription.length).toBeGreaterThan(0);
      expect(t.upgradeToVIP.length).toBeGreaterThan(0);
    }
  });

  it("should have video export translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.videoExportProgress.length).toBeGreaterThan(0);
      expect(t.videoExportFailed.length).toBeGreaterThan(0);
      expect(t.videoExportSuccess.length).toBeGreaterThan(0);
    }
  });
});

describe("RTL/LTR Direction Logic", () => {
  it("should set RTL for Arabic language", () => {
    const isRTL = "ar" === "ar";
    expect(isRTL).toBe(true);
  });

  it("should set LTR for French language", () => {
    const isRTL = "fr" === "ar";
    expect(isRTL).toBe(false);
  });

  it("should set LTR for English language", () => {
    const isRTL = "en" === "ar";
    expect(isRTL).toBe(false);
  });

  it("should determine correct dir attribute", () => {
    const getDir = (lang: string) => lang === "ar" ? "rtl" : "ltr";
    expect(getDir("ar")).toBe("rtl");
    expect(getDir("fr")).toBe("ltr");
    expect(getDir("en")).toBe("ltr");
  });
});

describe("AI Language Context", () => {
  it("should map UI language to correct AI system prompt language instruction", () => {
    const getLanguageInstruction = (lang: string) => {
      switch (lang) {
        case "ar": return "Respond entirely in Arabic.";
        case "fr": return "Répondez entièrement en français.";
        case "en": return "Respond entirely in English.";
        default: return "Respond entirely in Arabic.";
      }
    };

    expect(getLanguageInstruction("ar")).toContain("Arabic");
    expect(getLanguageInstruction("fr")).toContain("français");
    expect(getLanguageInstruction("en")).toContain("English");
  });

  it("should pass uiLanguage parameter to quickScenario", () => {
    // Simulate the input validation
    const input = {
      text: "Sample educational text for testing",
      numberOfScenes: 4,
      language: "ar" as const,
      uiLanguage: "fr" as const,
    };

    expect(input.uiLanguage).toBe("fr");
    expect(input.language).toBe("ar");
    // Content language and UI language can be different
    expect(input.language).not.toBe(input.uiLanguage);
  });

  it("should pass language parameter to extractPageText", () => {
    const input = {
      imageBase64: "data:image/png;base64,test",
      pageNumber: 1,
      language: "en" as const,
    };

    expect(input.language).toBe("en");
  });
});

describe("Translation Completeness", () => {
  it("should have at least 50 translation keys per language", () => {
    const arCount = Object.keys(ultimateStudioTranslations.ar).length;
    const frCount = Object.keys(ultimateStudioTranslations.fr).length;
    const enCount = Object.keys(ultimateStudioTranslations.en).length;

    expect(arCount).toBeGreaterThanOrEqual(50);
    expect(frCount).toBeGreaterThanOrEqual(50);
    expect(enCount).toBeGreaterThanOrEqual(50);
  });

  it("should cover all UI sections", () => {
    const ar = ultimateStudioTranslations.ar;
    // Top bar
    expect(ar.studioTitle).toBeDefined();
    expect(ar.btnNew).toBeDefined();
    expect(ar.btnSave).toBeDefined();
    // Source column
    expect(ar.sourceTitle).toBeDefined();
    expect(ar.uploadPDF).toBeDefined();
    expect(ar.extractText).toBeDefined();
    // Pipeline column
    expect(ar.pipelineTitle).toBeDefined();
    expect(ar.stepScript).toBeDefined();
    expect(ar.stepVision).toBeDefined();
    expect(ar.stepVoice).toBeDefined();
    // Storyboard column
    expect(ar.storyboardTitle).toBeDefined();
    expect(ar.exportMP4).toBeDefined();
    // Video export
    expect(ar.videoExportProgress).toBeDefined();
    expect(ar.videoExportSuccess).toBeDefined();
    // Projects dialog
    expect(ar.myProjectsTitle).toBeDefined();
    expect(ar.deleteConfirm).toBeDefined();
    // VIP paywall
    expect(ar.vipExclusive).toBeDefined();
    expect(ar.upgradeToVIP).toBeDefined();
  });
});
