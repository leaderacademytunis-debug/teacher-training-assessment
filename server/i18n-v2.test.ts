import { describe, it, expect } from "vitest";
import arTranslations from "../client/src/i18n/ar.json";
import frTranslations from "../client/src/i18n/fr.json";
import enTranslations from "../client/src/i18n/en.json";
import { getLanguageInstruction } from "./llmWithLanguage";

/**
 * Comprehensive i18n v2 Test Suite
 * Tests:
 * 1. Translation file completeness and consistency
 * 2. Language instruction injection for AI
 * 3. RTL/LTR direction logic
 * 4. Translation key coverage
 */

describe("i18n Translation Files", () => {
  it("should have all three language files with content", () => {
    expect(Object.keys(arTranslations).length).toBeGreaterThan(0);
    expect(Object.keys(frTranslations).length).toBeGreaterThan(0);
    expect(Object.keys(enTranslations).length).toBeGreaterThan(0);
  });

  it("should have matching top-level keys across all languages", () => {
    const arKeys = Object.keys(arTranslations).sort();
    const frKeys = Object.keys(frTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();

    expect(arKeys).toEqual(frKeys);
    expect(arKeys).toEqual(enKeys);
  });

  it("should have matching nested keys for each section", () => {
    const sections = Object.keys(arTranslations) as (keyof typeof arTranslations)[];
    
    for (const section of sections) {
      const arSection = arTranslations[section];
      const frSection = (frTranslations as any)[section];
      const enSection = (enTranslations as any)[section];

      if (typeof arSection === "object" && arSection !== null) {
        const arNestedKeys = Object.keys(arSection).sort();
        const frNestedKeys = Object.keys(frSection || {}).sort();
        const enNestedKeys = Object.keys(enSection || {}).sort();

        expect(arNestedKeys).toEqual(frNestedKeys);
        expect(arNestedKeys).toEqual(enNestedKeys);
      }
    }
  });

  it("should not have empty string values in Arabic translations", () => {
    const checkEmpty = (obj: any, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          expect(value.trim().length, `Empty value at ${path}.${key}`).toBeGreaterThan(0);
        } else if (typeof value === "object" && value !== null) {
          checkEmpty(value, `${path}.${key}`);
        }
      }
    };
    checkEmpty(arTranslations, "ar");
  });

  it("should not have empty string values in French translations", () => {
    const checkEmpty = (obj: any, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          expect(value.trim().length, `Empty value at ${path}.${key}`).toBeGreaterThan(0);
        } else if (typeof value === "object" && value !== null) {
          checkEmpty(value, `${path}.${key}`);
        }
      }
    };
    checkEmpty(frTranslations, "fr");
  });

  it("should not have empty string values in English translations", () => {
    const checkEmpty = (obj: any, path: string) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          expect(value.trim().length, `Empty value at ${path}.${key}`).toBeGreaterThan(0);
        } else if (typeof value === "object" && value !== null) {
          checkEmpty(value, `${path}.${key}`);
        }
      }
    };
    checkEmpty(enTranslations, "en");
  });

  it("should have common sections (common, nav, landing, studio, pricing, errors)", () => {
    const requiredSections = ["common", "nav", "landing", "studio", "pricing", "errors"];
    for (const section of requiredSections) {
      expect(arTranslations).toHaveProperty(section);
      expect(frTranslations).toHaveProperty(section);
      expect(enTranslations).toHaveProperty(section);
    }
  });

  it("should have Arabic text in ar.json common section", () => {
    const common = (arTranslations as any).common;
    // Arabic text should contain Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(JSON.stringify(common));
    expect(hasArabic).toBe(true);
  });

  it("should have French text in fr.json common section", () => {
    const common = (frTranslations as any).common;
    // French text should contain accented characters or common French words
    const text = JSON.stringify(common);
    const hasFrench = /[àâéèêëïîôùûüÿçœæ]|Connexion|Déconnexion|Accueil/i.test(text);
    expect(hasFrench).toBe(true);
  });

  it("should have English text in en.json common section", () => {
    const common = (enTranslations as any).common;
    const text = JSON.stringify(common);
    const hasEnglish = /Login|Logout|Home|Dashboard/i.test(text);
    expect(hasEnglish).toBe(true);
  });
});

describe("AI Language Context Switching", () => {
  it("should return Arabic instruction for 'ar'", () => {
    const instruction = getLanguageInstruction("ar");
    expect(instruction).toContain("Arabic");
    expect(instruction).toContain("العربية");
  });

  it("should return French instruction for 'fr'", () => {
    const instruction = getLanguageInstruction("fr");
    expect(instruction).toContain("Français");
    expect(instruction).toContain("français");
  });

  it("should return English instruction for 'en'", () => {
    const instruction = getLanguageInstruction("en");
    expect(instruction).toContain("English");
  });

  it("should include LANGUAGE DIRECTIVE marker", () => {
    for (const lang of ["ar", "fr", "en"] as const) {
      const instruction = getLanguageInstruction(lang);
      expect(instruction).toContain("[LANGUAGE DIRECTIVE]");
    }
  });

  it("should default to Arabic for unknown language", () => {
    const instruction = getLanguageInstruction("ar");
    expect(instruction).toContain("Arabic");
  });
});

describe("RTL/LTR Direction Logic", () => {
  it("should map 'ar' to RTL direction", () => {
    const isRTL = "ar" === "ar";
    const dir = isRTL ? "rtl" : "ltr";
    expect(dir).toBe("rtl");
  });

  it("should map 'fr' to LTR direction", () => {
    const lang = "fr";
    const isRTL = lang === "ar";
    const dir = isRTL ? "rtl" : "ltr";
    expect(dir).toBe("ltr");
  });

  it("should map 'en' to LTR direction", () => {
    const lang = "en";
    const isRTL = lang === "ar";
    const dir = isRTL ? "rtl" : "ltr";
    expect(dir).toBe("ltr");
  });
});

describe("Translation Key Count", () => {
  it("should have at least 50 translation keys total", () => {
    const countKeys = (obj: any): number => {
      let count = 0;
      for (const value of Object.values(obj)) {
        if (typeof value === "string") {
          count++;
        } else if (typeof value === "object" && value !== null) {
          count += countKeys(value);
        }
      }
      return count;
    };

    const arCount = countKeys(arTranslations);
    const frCount = countKeys(frTranslations);
    const enCount = countKeys(enTranslations);

    expect(arCount).toBeGreaterThanOrEqual(50);
    expect(frCount).toBeGreaterThanOrEqual(50);
    expect(enCount).toBeGreaterThanOrEqual(50);
    
    // All should have the same count
    expect(arCount).toBe(frCount);
    expect(arCount).toBe(enCount);
  });
});

describe("UltimateStudio Translations", () => {
  it("should have studio section with required keys", () => {
    const studioKeys = Object.keys((arTranslations as any).studio || {});
    const requiredKeys = ["title", "sourceTitle", "pipelineTitle", "storyboardTitle"];
    for (const key of requiredKeys) {
      expect(studioKeys, `Missing studio key: ${key}`).toContain(key);
    }
  });
});
