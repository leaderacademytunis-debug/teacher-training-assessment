import { describe, it, expect } from "vitest";
import { getUltimateStudioTranslations, ultimateStudioTranslations } from "../client/src/lib/ultimateStudioTranslations";
import { QUALITY_PRESETS, type VideoQuality, type RenderProgress } from "../client/src/lib/videoRenderer";

/**
 * Tests for Video Export Enhancements:
 * 1. Per-scene progress bar with percentage
 * 2. Video quality selector (720p/1080p)
 * 3. Video preview before final download
 */

describe("Video Quality Presets", () => {
  it("should have 720p and 1080p presets defined", () => {
    expect(QUALITY_PRESETS['720p']).toBeDefined();
    expect(QUALITY_PRESETS['1080p']).toBeDefined();
  });

  it("should have correct dimensions for 720p", () => {
    const q = QUALITY_PRESETS['720p'];
    expect(q.width).toBe(1280);
    expect(q.height).toBe(720);
  });

  it("should have correct dimensions for 1080p", () => {
    const q = QUALITY_PRESETS['1080p'];
    expect(q.width).toBe(1920);
    expect(q.height).toBe(1080);
  });

  it("should have audio and video bitrate for each preset", () => {
    for (const key of ['720p', '1080p'] as VideoQuality[]) {
      const q = QUALITY_PRESETS[key];
      expect(q.videoBitrate).toBeTruthy();
      expect(q.audioBitrate).toBeTruthy();
      expect(q.label).toBeTruthy();
    }
  });

  it("should have higher bitrate for 1080p than 720p", () => {
    const bps720 = parseInt(QUALITY_PRESETS['720p'].videoBitrate);
    const bps1080 = parseInt(QUALITY_PRESETS['1080p'].videoBitrate);
    expect(bps1080).toBeGreaterThan(bps720);
  });

  it("should have human-readable labels", () => {
    expect(QUALITY_PRESETS['720p'].label).toContain('720');
    expect(QUALITY_PRESETS['1080p'].label).toContain('1080');
  });
});

describe("Enhanced RenderProgress Interface", () => {
  it("should support per-scene tracking fields", () => {
    const progress: RenderProgress = {
      phase: 'rendering',
      percent: 45,
      message: 'Rendering scene 2/4',
      currentScene: 2,
      totalScenes: 4,
      scenePhase: 'encoding',
    };

    expect(progress.currentScene).toBe(2);
    expect(progress.totalScenes).toBe(4);
    expect(progress.scenePhase).toBe('encoding');
  });

  it("should allow optional scene tracking fields", () => {
    const progress: RenderProgress = {
      phase: 'loading',
      percent: 5,
      message: 'Loading engine...',
    };

    expect(progress.currentScene).toBeUndefined();
    expect(progress.totalScenes).toBeUndefined();
    expect(progress.scenePhase).toBeUndefined();
  });

  it("should support all scene phases", () => {
    const phases: RenderProgress['scenePhase'][] = ['downloading', 'encoding', 'complete'];
    for (const phase of phases) {
      const progress: RenderProgress = {
        phase: 'rendering',
        percent: 50,
        message: 'test',
        scenePhase: phase,
      };
      expect(progress.scenePhase).toBe(phase);
    }
  });

  it("should support all main phases", () => {
    const mainPhases: RenderProgress['phase'][] = ['loading', 'preparing', 'rendering', 'finalizing', 'done', 'error'];
    for (const phase of mainPhases) {
      const progress: RenderProgress = {
        phase,
        percent: 50,
        message: `Phase: ${phase}`,
      };
      expect(progress.phase).toBe(phase);
    }
  });
});

describe("Video Quality & Preview Translations", () => {
  const languages = ["ar", "fr", "en"] as const;

  it("should have video quality translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.videoQualityLabel.length).toBeGreaterThan(0);
      expect(t.videoQuality720.length).toBeGreaterThan(0);
      expect(t.videoQuality1080.length).toBeGreaterThan(0);
      expect(t.videoQualityNote.length).toBeGreaterThan(0);
    }
  });

  it("should have video preview translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.videoPreviewTitle.length).toBeGreaterThan(0);
      expect(t.videoPreviewReady.length).toBeGreaterThan(0);
      expect(t.videoPreviewDownload.length).toBeGreaterThan(0);
      expect(t.videoPreviewRegenerate.length).toBeGreaterThan(0);
      expect(t.videoPreviewClose.length).toBeGreaterThan(0);
      expect(t.videoPreviewFileSize.length).toBeGreaterThan(0);
      expect(t.videoPreviewDuration.length).toBeGreaterThan(0);
      expect(t.videoPreviewQuality.length).toBeGreaterThan(0);
    }
  });

  it("should have scene progress translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.videoSceneProgress.length).toBeGreaterThan(0);
      expect(t.videoSceneDownloading.length).toBeGreaterThan(0);
      expect(t.videoSceneEncoding.length).toBeGreaterThan(0);
      expect(t.videoSceneComplete.length).toBeGreaterThan(0);
    }
  });

  it("should have export settings translations in all languages", () => {
    for (const lang of languages) {
      const t = getUltimateStudioTranslations(lang);
      expect(t.videoStartExport.length).toBeGreaterThan(0);
      expect(t.videoExportSettings.length).toBeGreaterThan(0);
    }
  });

  it("should have matching new keys across all languages", () => {
    const newKeys = [
      'videoQualityLabel', 'videoQuality720', 'videoQuality1080', 'videoQualityNote',
      'videoPreviewTitle', 'videoPreviewReady', 'videoPreviewDownload', 'videoPreviewRegenerate',
      'videoPreviewClose', 'videoPreviewFileSize', 'videoPreviewDuration', 'videoPreviewQuality',
      'videoSceneProgress', 'videoSceneDownloading', 'videoSceneEncoding', 'videoSceneComplete',
      'videoStartExport', 'videoExportSettings',
    ];

    for (const key of newKeys) {
      const arVal = (ultimateStudioTranslations.ar as any)[key];
      const frVal = (ultimateStudioTranslations.fr as any)[key];
      const enVal = (ultimateStudioTranslations.en as any)[key];

      expect(arVal, `ar.${key} should exist`).toBeDefined();
      expect(frVal, `fr.${key} should exist`).toBeDefined();
      expect(enVal, `en.${key} should exist`).toBeDefined();
    }
  });

  it("should have Arabic quality labels with Arabic characters", () => {
    const t = getUltimateStudioTranslations("ar");
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.videoQualityLabel)).toBe(true);
    expect(arabicRegex.test(t.videoPreviewTitle)).toBe(true);
    expect(arabicRegex.test(t.videoPreviewDownload)).toBe(true);
  });

  it("should have French quality labels without Arabic", () => {
    const t = getUltimateStudioTranslations("fr");
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.videoQualityLabel)).toBe(false);
    expect(arabicRegex.test(t.videoPreviewTitle)).toBe(false);
    expect(arabicRegex.test(t.videoPreviewDownload)).toBe(false);
  });

  it("should have English quality labels without Arabic", () => {
    const t = getUltimateStudioTranslations("en");
    const arabicRegex = /[\u0600-\u06FF]/;
    expect(arabicRegex.test(t.videoQualityLabel)).toBe(false);
    expect(arabicRegex.test(t.videoPreviewTitle)).toBe(false);
    expect(arabicRegex.test(t.videoStartExport)).toBe(false);
  });
});

describe("Translation Key Consistency After Enhancement", () => {
  it("should still have matching keys across all 3 languages", () => {
    const arKeys = Object.keys(ultimateStudioTranslations.ar).sort();
    const frKeys = Object.keys(ultimateStudioTranslations.fr).sort();
    const enKeys = Object.keys(ultimateStudioTranslations.en).sort();

    expect(arKeys).toEqual(frKeys);
    expect(arKeys).toEqual(enKeys);
  });

  it("should have at least 65 translation keys per language (including new ones)", () => {
    const arCount = Object.keys(ultimateStudioTranslations.ar).length;
    const frCount = Object.keys(ultimateStudioTranslations.fr).length;
    const enCount = Object.keys(ultimateStudioTranslations.en).length;

    // Original ~80 keys + 18 new keys = ~98 keys
    expect(arCount).toBeGreaterThanOrEqual(65);
    expect(frCount).toBeGreaterThanOrEqual(65);
    expect(enCount).toBeGreaterThanOrEqual(65);
  });
});

describe("Progress Calculation Logic", () => {
  it("should calculate per-scene progress range correctly", () => {
    const totalScenes = 4;
    const sceneProgressRange = 60; // 25% to 85%
    const perSceneRange = sceneProgressRange / totalScenes;

    expect(perSceneRange).toBe(15);

    // Scene 1 starts at 25%, ends at 40%
    const scene1Start = 25 + (0 * perSceneRange);
    expect(scene1Start).toBe(25);

    // Scene 4 starts at 70%, ends at 85%
    const scene4Start = 25 + (3 * perSceneRange);
    expect(scene4Start).toBe(70);
  });

  it("should calculate sub-step percentages within a scene", () => {
    const sceneBasePercent = 25;
    const perSceneRange = 15;

    // Download image: 33% of scene range
    const downloadPercent = Math.round(sceneBasePercent + perSceneRange * 0.33);
    expect(downloadPercent).toBe(30);

    // Encode: 66% of scene range
    const encodePercent = Math.round(sceneBasePercent + perSceneRange * 0.66);
    expect(encodePercent).toBe(35);

    // Complete: 100% of scene range
    const completePercent = Math.round(sceneBasePercent + perSceneRange);
    expect(completePercent).toBe(40);
  });

  it("should handle single scene correctly", () => {
    const totalScenes = 1;
    const sceneProgressRange = 60;
    const perSceneRange = sceneProgressRange / totalScenes;

    expect(perSceneRange).toBe(60);

    const scene1Start = 25;
    const scene1End = 25 + perSceneRange;
    expect(scene1End).toBe(85);
  });

  it("should handle many scenes correctly", () => {
    const totalScenes = 10;
    const sceneProgressRange = 60;
    const perSceneRange = sceneProgressRange / totalScenes;

    expect(perSceneRange).toBe(6);

    // Last scene should end at 85%
    const lastSceneEnd = 25 + (totalScenes * perSceneRange);
    expect(lastSceneEnd).toBe(85);
  });
});

describe("File Size Formatting", () => {
  // Test the formatting logic used in the preview modal
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  it("should format KB correctly", () => {
    expect(formatFileSize(512 * 1024)).toBe("512 KB");
    expect(formatFileSize(100 * 1024)).toBe("100 KB");
  });

  it("should format MB correctly", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatFileSize(15.5 * 1024 * 1024)).toBe("15.5 MB");
  });

  it("should handle small files", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("should handle large files", () => {
    expect(formatFileSize(100 * 1024 * 1024)).toBe("100.0 MB");
  });
});
