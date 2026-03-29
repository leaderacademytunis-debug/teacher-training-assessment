import { describe, it, expect } from "vitest";

/**
 * Batch Audio Engine Tests
 * Tests for: auto-tashkeel, batch generation, voice prompt, translations
 */

// ─── Translation Completeness Tests ───

describe("Batch Audio Engine Translations", () => {
  // Dynamically import to avoid module issues
  const getTranslations = async () => {
    const mod = await import("../client/src/lib/ultimateStudioTranslations");
    return mod.getUltimateStudioTranslations;
  };

  const batchKeys = [
    "batchGenerateAll",
    "batchGenerating",
    "batchComplete",
    "batchPartialFail",
    "batchCancelled",
    "batchCancel",
    "voiceSettings",
    "voicePromptLabel",
    "voicePromptPlaceholder",
    "voicePromptHelp",
    "autoTashkeel",
    "autoTashkeelDesc",
    "tashkeelProcessing",
    "tashkeelDone",
    "batchStepTashkeel",
    "batchStepAudio",
  ];

  it("should have all batch audio keys in Arabic translations", async () => {
    const getT = await getTranslations();
    const t = getT("ar");
    for (const key of batchKeys) {
      expect((t as any)[key], `Missing Arabic key: ${key}`).toBeDefined();
      expect((t as any)[key], `Empty Arabic key: ${key}`).not.toBe("");
    }
  });

  it("should have all batch audio keys in French translations", async () => {
    const getT = await getTranslations();
    const t = getT("fr");
    for (const key of batchKeys) {
      expect((t as any)[key], `Missing French key: ${key}`).toBeDefined();
      expect((t as any)[key], `Empty French key: ${key}`).not.toBe("");
    }
  });

  it("should have all batch audio keys in English translations", async () => {
    const getT = await getTranslations();
    const t = getT("en");
    for (const key of batchKeys) {
      expect((t as any)[key], `Missing English key: ${key}`).toBeDefined();
      expect((t as any)[key], `Empty English key: ${key}`).not.toBe("");
    }
  });

  it("batchGenerating should contain {current} and {total} placeholders in all languages", async () => {
    const getT = await getTranslations();
    for (const lang of ["ar", "fr", "en"] as const) {
      const t = getT(lang);
      expect(t.batchGenerating).toContain("{current}");
      expect(t.batchGenerating).toContain("{total}");
    }
  });

  it("batchPartialFail should contain {success}, {total}, and {failed} placeholders", async () => {
    const getT = await getTranslations();
    for (const lang of ["ar", "fr", "en"] as const) {
      const t = getT(lang);
      expect(t.batchPartialFail).toContain("{success}");
      expect(t.batchPartialFail).toContain("{total}");
      expect(t.batchPartialFail).toContain("{failed}");
    }
  });
});

// ─── Auto-Tashkeel Logic Tests ───

describe("Auto-Tashkeel Logic", () => {
  it("should detect Arabic text correctly", () => {
    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
    expect(isArabic("مرحبا بالعالم")).toBe(true);
    expect(isArabic("Hello World")).toBe(false);
    expect(isArabic("Bonjour le monde")).toBe(false);
    expect(isArabic("مرحبا Hello")).toBe(true);
  });

  it("should detect Arabic diacritics (tashkeel) in text", () => {
    const hasTashkeel = (text: string) => /[\u064B-\u065F\u0670]/.test(text);
    expect(hasTashkeel("مَرْحَبًا")).toBe(true);
    expect(hasTashkeel("مرحبا")).toBe(false);
    expect(hasTashkeel("بِسْمِ اللَّهِ")).toBe(true);
    expect(hasTashkeel("بسم الله")).toBe(false);
  });

  it("should validate text length before tashkeel processing", () => {
    const isValidForTashkeel = (text: string) => text.trim().length >= 5;
    expect(isValidForTashkeel("مرحبا بالعالم")).toBe(true);
    expect(isValidForTashkeel("مرح")).toBe(false);
    expect(isValidForTashkeel("     ")).toBe(false);
    expect(isValidForTashkeel("أهلاً وسهلاً")).toBe(true);
  });

  it("should not apply tashkeel for non-Arabic languages", () => {
    const shouldApplyTashkeel = (lang: string) => lang === "ar";
    expect(shouldApplyTashkeel("ar")).toBe(true);
    expect(shouldApplyTashkeel("fr")).toBe(false);
    expect(shouldApplyTashkeel("en")).toBe(false);
  });
});

// ─── Batch Processing Logic Tests ───

describe("Batch Processing Logic", () => {
  it("should calculate correct progress percentage", () => {
    const calcProgress = (current: number, total: number) =>
      Math.round((current / total) * 100);
    expect(calcProgress(1, 5)).toBe(20);
    expect(calcProgress(3, 5)).toBe(60);
    expect(calcProgress(5, 5)).toBe(100);
    expect(calcProgress(0, 5)).toBe(0);
  });

  it("should format batch progress message correctly", () => {
    const template = "جاري توليد صوت المشهد {current} من {total}...";
    const format = (t: string, current: number, total: number) =>
      t.replace("{current}", String(current)).replace("{total}", String(total));
    expect(format(template, 2, 5)).toBe("جاري توليد صوت المشهد 2 من 5...");
    expect(format(template, 5, 5)).toBe("جاري توليد صوت المشهد 5 من 5...");
  });

  it("should format partial fail message correctly", () => {
    const template = "تم توليد {success} من {total} مشاهد. فشل {failed}.";
    const format = (t: string, success: number, total: number, failed: number) =>
      t
        .replace("{success}", String(success))
        .replace("{total}", String(total))
        .replace("{failed}", String(failed));
    expect(format(template, 3, 5, 2)).toBe("تم توليد 3 من 5 مشاهد. فشل 2.");
  });

  it("should skip scenes that already have audio", () => {
    const scenes = [
      { audioUrl: "https://example.com/audio1.mp3", spokenText: "مرحبا" },
      { audioUrl: null, spokenText: "أهلاً وسهلاً بكم" },
      { audioUrl: "https://example.com/audio3.mp3", spokenText: "شكراً" },
    ];
    const scenesToProcess = scenes.filter((s) => !s.audioUrl);
    expect(scenesToProcess.length).toBe(1);
    expect(scenesToProcess[0].spokenText).toBe("أهلاً وسهلاً بكم");
  });

  it("should skip scenes with short spokenText", () => {
    const scenes = [
      { spokenText: "مرحبا بالعالم العربي" },
      { spokenText: "مرح" },
      { spokenText: "" },
      { spokenText: "أهلاً وسهلاً بكم في الدرس" },
    ];
    const validScenes = scenes.filter(
      (s) => s.spokenText && s.spokenText.trim().length >= 5
    );
    expect(validScenes.length).toBe(2);
  });

  it("should handle cancellation flag correctly", () => {
    let cancelled = false;
    const results: number[] = [];
    const scenes = [1, 2, 3, 4, 5];

    for (const scene of scenes) {
      if (cancelled) break;
      results.push(scene);
      if (scene === 3) cancelled = true;
    }

    expect(results).toEqual([1, 2, 3]);
  });
});

// ─── Voice Prompt Tests ───

describe("Voice Prompt Processing", () => {
  it("should handle empty voice prompt gracefully", () => {
    const voicePrompt = "";
    const hasPrompt = voicePrompt.trim().length > 0;
    expect(hasPrompt).toBe(false);
  });

  it("should detect when voice prompt is provided", () => {
    const voicePrompt = "تحدث بحماس وبطء وكأنك تخاطب أطفالاً";
    const hasPrompt = voicePrompt.trim().length > 0;
    expect(hasPrompt).toBe(true);
  });

  it("should truncate very long text for TTS", () => {
    const maxLength = 4500;
    const longText = "أ".repeat(5000);
    const truncated =
      longText.length > maxLength ? longText.slice(0, maxLength) + "..." : longText;
    expect(truncated.length).toBe(maxLength + 3);
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("should not truncate short text", () => {
    const maxLength = 4500;
    const shortText = "مرحبا بالعالم";
    const truncated =
      shortText.length > maxLength
        ? shortText.slice(0, maxLength) + "..."
        : shortText;
    expect(truncated).toBe(shortText);
  });
});

// ─── Tashkeel System Prompt Tests ───

describe("Tashkeel System Prompt Construction", () => {
  it("should build correct system prompt with voice directions", () => {
    const voicePrompt = "تحدث بحماس";
    const systemPrompt = voicePrompt.trim()
      ? `أنت خبير لغوي. توجيهات الأداء: ${voicePrompt}`
      : `أنت خبير لغوي. قم بتشكيل النص.`;
    expect(systemPrompt).toContain("توجيهات الأداء");
    expect(systemPrompt).toContain("تحدث بحماس");
  });

  it("should build correct system prompt without voice directions", () => {
    const voicePrompt = "";
    const systemPrompt = voicePrompt.trim()
      ? `أنت خبير لغوي. توجيهات الأداء: ${voicePrompt}`
      : `أنت خبير لغوي. قم بتشكيل النص.`;
    expect(systemPrompt).toContain("قم بتشكيل النص");
    expect(systemPrompt).not.toContain("توجيهات الأداء");
  });
});
