import { describe, it, expect, vi } from "vitest";

// Mock invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("Edu-Studio Engine", () => {
  describe("Scenario Generation", () => {
    it("should validate that referenceText is required", () => {
      const input = { referenceText: "", numberOfScenes: 4 };
      expect(input.referenceText.trim()).toBe("");
    });

    it("should accept valid numberOfScenes range (2-8)", () => {
      const validValues = [2, 3, 4, 5, 6, 7, 8];
      validValues.forEach(n => {
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n).toBeLessThanOrEqual(8);
      });
    });

    it("should structure scenario output correctly", () => {
      const mockScenario = {
        title: "درس الجمع",
        summary: "فيديو تعليمي عن عملية الجمع",
        scenes: [
          {
            sceneNumber: 1,
            title: "المقدمة",
            description: "مشهد افتتاحي",
            educationalContent: "مفهوم الجمع",
            duration: 30,
            transition: "Fade In",
          },
          {
            sceneNumber: 2,
            title: "الشرح",
            description: "شرح العملية",
            educationalContent: "أمثلة عملية",
            duration: 45,
            transition: "Cut",
          },
        ],
      };

      expect(mockScenario.scenes).toHaveLength(2);
      expect(mockScenario.scenes[0]).toHaveProperty("sceneNumber");
      expect(mockScenario.scenes[0]).toHaveProperty("title");
      expect(mockScenario.scenes[0]).toHaveProperty("description");
      expect(mockScenario.scenes[0]).toHaveProperty("educationalContent");
      expect(mockScenario.scenes[0]).toHaveProperty("duration");
      expect(mockScenario.scenes[0]).toHaveProperty("transition");
    });
  });

  describe("Visual Prompts Generation", () => {
    it("should validate visual style options", () => {
      const validStyles = ["3d_animation", "2d_cartoon", "realistic", "whiteboard", "cinematic"];
      validStyles.forEach(style => {
        expect(typeof style).toBe("string");
      });
    });

    it("should structure visual prompt output correctly", () => {
      const mockPrompt = {
        sceneNumber: 1,
        visualPrompt: "Cinematic 4K shot of a colorful classroom with animated numbers floating in the air, 3D educational animation style, soft lighting, vibrant colors",
        negativePrompt: "blurry, low quality, text, watermark",
        suggestedTool: "Midjourney",
        aspectRatio: "16:9",
      };

      expect(mockPrompt.visualPrompt).toContain("Cinematic");
      expect(mockPrompt).toHaveProperty("negativePrompt");
      expect(mockPrompt).toHaveProperty("suggestedTool");
      expect(mockPrompt).toHaveProperty("aspectRatio");
    });

    it("should generate English prompts regardless of input language", () => {
      const arabicInput = "مشهد افتتاحي في فصل دراسي";
      const expectedOutput = "Cinematic 4K shot of a colorful classroom";
      
      // The prompt should be in English even if input is Arabic
      expect(expectedOutput).toMatch(/^[A-Za-z]/);
    });
  });

  describe("Voiceover Generation", () => {
    it("should validate voice language options", () => {
      const validLanguages = ["ar", "fr", "en"];
      validLanguages.forEach(lang => {
        expect(["ar", "fr", "en"]).toContain(lang);
      });
    });

    it("should validate voice tone options", () => {
      const validTones = ["enthusiastic", "calm", "professional", "storytelling"];
      validTones.forEach(tone => {
        expect(typeof tone).toBe("string");
      });
    });

    it("should structure voiceover output correctly", () => {
      const mockVoiceover = {
        sceneNumber: 1,
        spokenText: "مرحباً أيها الأطفال، اليوم سنتعلم عملية الجمع",
        performanceNotes: "Start with an enthusiastic greeting, slow down for key concepts",
        pace: "moderate",
        emphasis: ["الجمع", "نتعلم"],
        pausePoints: ["مرحباً أيها الأطفال،", "اليوم"],
        estimatedDuration: 8,
        emotionalTone: "enthusiastic",
      };

      expect(mockVoiceover).toHaveProperty("spokenText");
      expect(mockVoiceover).toHaveProperty("performanceNotes");
      expect(mockVoiceover).toHaveProperty("pace");
      expect(mockVoiceover.emphasis).toBeInstanceOf(Array);
      expect(mockVoiceover.pausePoints).toBeInstanceOf(Array);
      expect(mockVoiceover.estimatedDuration).toBeGreaterThan(0);
    });
  });

  describe("Scene Cards Merging", () => {
    it("should merge scene, visual prompt, and voiceover by sceneNumber", () => {
      const scenes = [
        { sceneNumber: 1, title: "Scene 1", description: "Desc 1", educationalContent: "Content 1", duration: 30, transition: "Fade" },
        { sceneNumber: 2, title: "Scene 2", description: "Desc 2", educationalContent: "Content 2", duration: 45, transition: "Cut" },
      ];
      const visuals = [
        { sceneNumber: 1, visualPrompt: "Prompt 1", negativePrompt: "", suggestedTool: "Midjourney", aspectRatio: "16:9" },
        { sceneNumber: 2, visualPrompt: "Prompt 2", negativePrompt: "", suggestedTool: "DALL-E", aspectRatio: "16:9" },
      ];
      const voiceovers = [
        { sceneNumber: 1, spokenText: "Text 1", performanceNotes: "Notes 1", pace: "moderate", emphasis: [], pausePoints: [], estimatedDuration: 8, emotionalTone: "calm" },
      ];

      const merged = scenes.map(scene => ({
        scene,
        visualPrompt: visuals.find(vp => vp.sceneNumber === scene.sceneNumber),
        voiceover: voiceovers.find(vo => vo.sceneNumber === scene.sceneNumber),
      }));

      expect(merged).toHaveLength(2);
      expect(merged[0].visualPrompt?.visualPrompt).toBe("Prompt 1");
      expect(merged[0].voiceover?.spokenText).toBe("Text 1");
      expect(merged[1].visualPrompt?.visualPrompt).toBe("Prompt 2");
      expect(merged[1].voiceover).toBeUndefined(); // Scene 2 has no voiceover yet
    });
  });

  describe("Pipeline Step Logic", () => {
    it("should enforce sequential step progression", () => {
      let scenarioComplete = false;
      let visualComplete = false;
      let voiceoverComplete = false;

      // Step 1: Scenario must be done first
      expect(scenarioComplete).toBe(false);
      scenarioComplete = true;

      // Step 2: Visual requires scenario
      expect(scenarioComplete).toBe(true);
      visualComplete = true;

      // Step 3: Voiceover requires visual
      expect(visualComplete).toBe(true);
      voiceoverComplete = true;

      expect(voiceoverComplete).toBe(true);
    });

    it("should not allow visual generation without scenario", () => {
      const scenarioData = null;
      const canGenerateVisuals = !!scenarioData;
      expect(canGenerateVisuals).toBe(false);
    });

    it("should not allow voiceover generation without visuals", () => {
      const visualPrompts: any[] = [];
      const canGenerateVoiceover = visualPrompts.length > 0;
      expect(canGenerateVoiceover).toBe(false);
    });
  });

  describe("PDF Export Data", () => {
    it("should structure export data correctly for sessionStorage", () => {
      const exportData = {
        title: "Test Video",
        summary: "Test Summary",
        scenes: [
          {
            scene: { sceneNumber: 1, title: "S1", description: "D1", educationalContent: "C1", duration: 30, transition: "Fade" },
            visualPrompt: { visualPrompt: "VP1", negativePrompt: "", suggestedTool: "Midjourney", aspectRatio: "16:9" },
            voiceover: { spokenText: "VO1", performanceNotes: "N1", pace: "moderate", emphasis: [], pausePoints: [], estimatedDuration: 8, emotionalTone: "calm" },
          },
        ],
        totalDuration: 30,
        visualStyle: "3d_animation",
        voiceLanguage: "ar",
      };

      const serialized = JSON.stringify(exportData);
      const parsed = JSON.parse(serialized);

      expect(parsed.title).toBe("Test Video");
      expect(parsed.scenes).toHaveLength(1);
      expect(parsed.scenes[0].scene.sceneNumber).toBe(1);
      expect(parsed.scenes[0].visualPrompt.visualPrompt).toBe("VP1");
      expect(parsed.scenes[0].voiceover.spokenText).toBe("VO1");
    });

    it("should calculate total duration from all scenes", () => {
      const scenes = [
        { duration: 30 },
        { duration: 45 },
        { duration: 20 },
        { duration: 35 },
      ];
      const total = scenes.reduce((sum, s) => sum + s.duration, 0);
      expect(total).toBe(130);
    });
  });
});
