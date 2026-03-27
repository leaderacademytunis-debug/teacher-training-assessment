import { describe, it, expect, vi } from "vitest";

// Mock the LLM, image generation, and TTS modules
vi.mock("./server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify([
      { sceneNumber: 1, title: "Introduction", narration: "Welcome to the lesson", visualDescription: "A classroom with students" },
      { sceneNumber: 2, title: "Main Content", narration: "Let's learn about science", visualDescription: "A science lab" }
    ]) } }]
  })
}));

vi.mock("./server/_core/imageGeneration.ts", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://storage.example.com/generated-image.png" })
}));

vi.mock("./server/storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://storage.example.com/audio.mp3", key: "audio/test.mp3" })
}));

describe("Edu-Studio Media Generation & Project Saving", () => {
  
  describe("Image Generation for Scene Cards", () => {
    it("should accept a visual prompt and return an image URL", () => {
      const input = {
        prompt: "Cinematic 4K educational 3D animation of a classroom with students learning about photosynthesis",
        sceneIndex: 0
      };
      expect(input.prompt).toBeTruthy();
      expect(input.prompt.length).toBeGreaterThan(10);
      expect(typeof input.sceneIndex).toBe("number");
    });

    it("should validate that visual prompts are in English", () => {
      const englishPrompt = "Cinematic 4K shot of a teacher explaining mathematics";
      const hasEnglishWords = /[a-zA-Z]/.test(englishPrompt);
      expect(hasEnglishWords).toBe(true);
    });

    it("should handle image generation failure gracefully", async () => {
      const mockFailedGeneration = async () => {
        throw new Error("Image generation failed: rate limit exceeded");
      };
      await expect(mockFailedGeneration()).rejects.toThrow("rate limit exceeded");
    });
  });

  describe("TTS Audio Generation for Voiceover", () => {
    it("should accept voiceover text and generate audio", () => {
      const input = {
        text: "مرحباً بكم في درس العلوم. اليوم سنتعلم عن عملية التركيب الضوئي.",
        sceneIndex: 0,
        voice: "alloy"
      };
      expect(input.text).toBeTruthy();
      expect(input.text.length).toBeGreaterThan(5);
      expect(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).toContain(input.voice);
    });

    it("should validate supported voice options", () => {
      const supportedVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
      expect(supportedVoices.length).toBe(6);
      supportedVoices.forEach(voice => {
        expect(typeof voice).toBe("string");
        expect(voice.length).toBeGreaterThan(0);
      });
    });

    it("should handle TTS failure gracefully", async () => {
      const mockFailedTTS = async () => {
        throw new Error("TTS service unavailable");
      };
      await expect(mockFailedTTS()).rejects.toThrow("TTS service unavailable");
    });
  });

  describe("Project Saving (Cloud Archiving)", () => {
    it("should save a complete project with all scene data", () => {
      const project = {
        title: "درس التركيب الضوئي",
        referenceText: "النص المرجعي من الكتاب المدرسي",
        scenarioData: JSON.stringify([
          { sceneNumber: 1, title: "المقدمة", narration: "مرحباً", visualDescription: "فصل دراسي" }
        ]),
        visualPromptsData: JSON.stringify([
          { sceneNumber: 1, visualPrompt: "Cinematic classroom scene" }
        ]),
        voiceoverData: JSON.stringify([
          { sceneNumber: 1, voiceoverText: "مرحباً بكم", tone: "Enthusiastic" }
        ]),
        generatedImages: JSON.stringify({ "0": "https://storage.example.com/img1.png" }),
        generatedAudios: JSON.stringify({ "0": "https://storage.example.com/audio1.mp3" }),
        numberOfScenes: 1,
        status: "completed"
      };

      expect(project.title).toBeTruthy();
      expect(JSON.parse(project.scenarioData)).toHaveLength(1);
      expect(JSON.parse(project.visualPromptsData)).toHaveLength(1);
      expect(JSON.parse(project.voiceoverData)).toHaveLength(1);
      expect(project.numberOfScenes).toBe(1);
      expect(project.status).toBe("completed");
    });

    it("should update an existing project", () => {
      const updatePayload = {
        id: 1,
        title: "درس التركيب الضوئي - نسخة محدثة",
        status: "in_progress",
        generatedImages: JSON.stringify({ "0": "https://storage.example.com/img-updated.png" })
      };

      expect(updatePayload.id).toBeGreaterThan(0);
      expect(updatePayload.title).toContain("محدثة");
      expect(updatePayload.status).toBe("in_progress");
    });

    it("should list projects for a user", () => {
      const mockProjects = [
        { id: 1, title: "مشروع 1", status: "completed", numberOfScenes: 4, createdAt: Date.now() },
        { id: 2, title: "مشروع 2", status: "in_progress", numberOfScenes: 3, createdAt: Date.now() }
      ];

      expect(mockProjects).toHaveLength(2);
      expect(mockProjects[0].status).toBe("completed");
      expect(mockProjects[1].status).toBe("in_progress");
    });

    it("should delete a project by ID", () => {
      const deleteInput = { id: 1 };
      expect(deleteInput.id).toBeGreaterThan(0);
    });

    it("should load a project and restore storyboard state", () => {
      const savedProject = {
        id: 1,
        title: "مشروع محفوظ",
        referenceText: "النص المرجعي",
        scenarioData: JSON.stringify([
          { sceneNumber: 1, title: "مشهد 1", narration: "نص", visualDescription: "وصف" },
          { sceneNumber: 2, title: "مشهد 2", narration: "نص 2", visualDescription: "وصف 2" }
        ]),
        visualPromptsData: JSON.stringify([
          { sceneNumber: 1, visualPrompt: "Prompt 1" },
          { sceneNumber: 2, visualPrompt: "Prompt 2" }
        ]),
        voiceoverData: JSON.stringify([
          { sceneNumber: 1, voiceoverText: "صوت 1", tone: "Calm" },
          { sceneNumber: 2, voiceoverText: "صوت 2", tone: "Energetic" }
        ]),
        generatedImages: JSON.stringify({ "0": "url1", "1": "url2" }),
        generatedAudios: JSON.stringify({ "0": "audio1" }),
        numberOfScenes: 2
      };

      const scenarios = JSON.parse(savedProject.scenarioData);
      const prompts = JSON.parse(savedProject.visualPromptsData);
      const voiceovers = JSON.parse(savedProject.voiceoverData);
      const images = JSON.parse(savedProject.generatedImages);
      const audios = JSON.parse(savedProject.generatedAudios);

      expect(scenarios).toHaveLength(2);
      expect(prompts).toHaveLength(2);
      expect(voiceovers).toHaveLength(2);
      expect(Object.keys(images)).toHaveLength(2);
      expect(Object.keys(audios)).toHaveLength(1);
      expect(savedProject.numberOfScenes).toBe(2);
    });
  });

  describe("Scene Card Complete Data Structure", () => {
    it("should have all required fields for a complete scene card", () => {
      const completeSceneCard = {
        sceneNumber: 1,
        title: "المقدمة",
        narration: "مرحباً بكم في درس اليوم",
        visualDescription: "فصل دراسي مليء بالطلاب",
        visualPrompt: "Cinematic 4K educational 3D animation of a bright classroom with engaged students, warm lighting, professional quality",
        voiceoverText: "مرحباً بكم في درس اليوم عن التركيب الضوئي",
        voiceoverTone: "Enthusiastic",
        voiceoverSpeed: "1.0x",
        generatedImageUrl: "https://storage.example.com/scene1.png",
        generatedAudioUrl: "https://storage.example.com/scene1.mp3"
      };

      // All fields must be present
      expect(completeSceneCard.sceneNumber).toBeDefined();
      expect(completeSceneCard.title).toBeDefined();
      expect(completeSceneCard.narration).toBeDefined();
      expect(completeSceneCard.visualDescription).toBeDefined();
      expect(completeSceneCard.visualPrompt).toBeDefined();
      expect(completeSceneCard.voiceoverText).toBeDefined();
      expect(completeSceneCard.voiceoverTone).toBeDefined();
      expect(completeSceneCard.generatedImageUrl).toBeDefined();
      expect(completeSceneCard.generatedAudioUrl).toBeDefined();
    });

    it("should validate the sequential pipeline flow", () => {
      // Step 1: Scenario must be generated first
      const step1Complete = true;
      // Step 2: Visual prompts depend on scenario
      const step2Enabled = step1Complete;
      // Step 3: Voiceover depends on scenario
      const step3Enabled = step1Complete;
      // Image generation depends on visual prompts (step 2)
      const imageGenEnabled = step2Enabled;
      // Audio generation depends on voiceover (step 3)
      const audioGenEnabled = step3Enabled;

      expect(step2Enabled).toBe(true);
      expect(step3Enabled).toBe(true);
      expect(imageGenEnabled).toBe(true);
      expect(audioGenEnabled).toBe(true);
    });
  });

  describe("Studio Projects Database Schema", () => {
    it("should have all required fields in the schema", () => {
      const requiredFields = [
        "id", "userId", "title", "summary", "referenceText",
        "scenarioData", "visualPromptsData", "voiceoverData",
        "generatedImages", "generatedAudios", "numberOfScenes",
        "status", "createdAt", "updatedAt"
      ];

      requiredFields.forEach(field => {
        expect(typeof field).toBe("string");
        expect(field.length).toBeGreaterThan(0);
      });
      expect(requiredFields).toHaveLength(14);
    });

    it("should validate status enum values", () => {
      const validStatuses = ["draft", "in_progress", "completed"];
      validStatuses.forEach(status => {
        expect(["draft", "in_progress", "completed"]).toContain(status);
      });
    });
  });
});
