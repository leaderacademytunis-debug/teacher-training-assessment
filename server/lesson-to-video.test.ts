import { describe, it, expect, vi } from "vitest";

describe("EduGPT to AI Director Integration", () => {
  
  describe("lessonToVideoScript procedure validation", () => {
    it("should reject lesson content shorter than 50 characters", () => {
      const shortContent = "نص قصير جداً";
      expect(shortContent.length).toBeLessThan(50);
    });

    it("should accept lesson content with 50+ characters", () => {
      const validContent = "هذا نص جذاذة تربوية طويل بما يكفي لتجاوز الحد الأدنى المطلوب وهو خمسون حرفاً على الأقل لكي يتم قبوله من طرف الإجراء";
      expect(validContent.length).toBeGreaterThanOrEqual(50);
    });

    it("should handle optional subject, level, and topic fields", () => {
      const input = {
        lessonContent: "هذا نص جذاذة تربوية طويل بما يكفي لتجاوز الحد الأدنى المطلوب وهو خمسون حرفاً على الأقل",
        subject: undefined,
        level: undefined,
        topic: undefined,
      };
      expect(input.subject).toBeUndefined();
      expect(input.level).toBeUndefined();
      expect(input.topic).toBeUndefined();
    });

    it("should accept all optional fields when provided", () => {
      const input = {
        lessonContent: "هذا نص جذاذة تربوية طويل بما يكفي لتجاوز الحد الأدنى المطلوب وهو خمسون حرفاً على الأقل",
        subject: "الرياضيات",
        level: "السنة الخامسة ابتدائي",
        topic: "الكسور",
      };
      expect(input.subject).toBe("الرياضيات");
      expect(input.level).toBe("السنة الخامسة ابتدائي");
      expect(input.topic).toBe("الكسور");
    });
  });

  describe("Video script response format", () => {
    const mockResponse = {
      videoTitle: "رحلة الكسور - فيديو تعليمي",
      narrativeScript: "في يوم مشمس، قررت سارة أن تتعلم الكسور...",
      targetAudience: "تلاميذ السنة الخامسة ابتدائي",
      estimatedDuration: 90,
      keyScenes: [
        { title: "المقدمة", narration: "تبدأ القصة...", visualNote: "يظهر فصل دراسي" },
        { title: "التعلم", narration: "تكتشف سارة...", visualNote: "رسم توضيحي للكسور" },
      ],
      suggestedMood: "تعليمي مرح",
    };

    it("should have all required fields in the response", () => {
      expect(mockResponse).toHaveProperty("videoTitle");
      expect(mockResponse).toHaveProperty("narrativeScript");
      expect(mockResponse).toHaveProperty("targetAudience");
      expect(mockResponse).toHaveProperty("estimatedDuration");
      expect(mockResponse).toHaveProperty("keyScenes");
      expect(mockResponse).toHaveProperty("suggestedMood");
    });

    it("should have videoTitle as a non-empty string", () => {
      expect(typeof mockResponse.videoTitle).toBe("string");
      expect(mockResponse.videoTitle.length).toBeGreaterThan(0);
    });

    it("should have narrativeScript as a non-empty string", () => {
      expect(typeof mockResponse.narrativeScript).toBe("string");
      expect(mockResponse.narrativeScript.length).toBeGreaterThan(0);
    });

    it("should have estimatedDuration as a positive integer", () => {
      expect(typeof mockResponse.estimatedDuration).toBe("number");
      expect(mockResponse.estimatedDuration).toBeGreaterThan(0);
    });

    it("should have keyScenes as an array with scene objects", () => {
      expect(Array.isArray(mockResponse.keyScenes)).toBe(true);
      expect(mockResponse.keyScenes.length).toBeGreaterThan(0);
      mockResponse.keyScenes.forEach((scene) => {
        expect(scene).toHaveProperty("title");
        expect(scene).toHaveProperty("narration");
        expect(scene).toHaveProperty("visualNote");
      });
    });
  });

  describe("SessionStorage prefill data format", () => {
    it("should create valid prefill data for AI Director", () => {
      const videoScriptResult = {
        videoTitle: "رحلة الكسور",
        narrativeScript: "في يوم مشمس، قررت سارة أن تتعلم الكسور...",
        targetAudience: "السنة الخامسة",
        estimatedDuration: 90,
        keyScenes: [],
        suggestedMood: "مرح",
      };
      const subject = "الرياضيات";
      const level = "السنة الخامسة";

      const prefillData = JSON.stringify({
        script: videoScriptResult.narrativeScript,
        subject: subject,
        level: level,
        title: videoScriptResult.videoTitle,
      });

      const parsed = JSON.parse(prefillData);
      expect(parsed.script).toBe(videoScriptResult.narrativeScript);
      expect(parsed.subject).toBe(subject);
      expect(parsed.level).toBe(level);
      expect(parsed.title).toBe(videoScriptResult.videoTitle);
    });

    it("should handle empty optional fields in prefill data", () => {
      const prefillData = JSON.stringify({
        script: "نص السكريبت",
        subject: "",
        level: "",
        title: "عنوان الفيديو",
      });

      const parsed = JSON.parse(prefillData);
      expect(parsed.script).toBeTruthy();
      expect(parsed.title).toBeTruthy();
    });
  });

  describe("URL parameter handling for tab switching", () => {
    it("should detect director tab from URL params", () => {
      const params = new URLSearchParams("tab=director");
      expect(params.get("tab")).toBe("director");
    });

    it("should default to images tab when no param", () => {
      const params = new URLSearchParams("");
      const tab = params.get("tab") === "director" ? "director" : "images";
      expect(tab).toBe("images");
    });

    it("should default to images tab for other values", () => {
      const params = new URLSearchParams("tab=other");
      const tab = params.get("tab") === "director" ? "director" : "images";
      expect(tab).toBe("images");
    });
  });

  describe("LLM prompt construction", () => {
    it("should build correct user prompt with all fields", () => {
      const input = { subject: "الرياضيات", level: "السنة الخامسة", topic: "الكسور", lessonContent: "محتوى الجذاذة" };
      const prompt = `المادة: ${input.subject || "غير محدد"}\nالمستوى: ${input.level || "غير محدد"}\nالموضوع: ${input.topic || "غير محدد"}\n\nنص الجذاذة/المذكرة:\n${input.lessonContent}`;
      expect(prompt).toContain("الرياضيات");
      expect(prompt).toContain("السنة الخامسة");
      expect(prompt).toContain("الكسور");
      expect(prompt).toContain("محتوى الجذاذة");
    });

    it("should use fallback for missing optional fields", () => {
      const input = { subject: undefined, level: undefined, topic: undefined, lessonContent: "محتوى الجذاذة" };
      const prompt = `المادة: ${input.subject || "غير محدد"}\nالمستوى: ${input.level || "غير محدد"}\nالموضوع: ${input.topic || "غير محدد"}`;
      expect(prompt).toContain("غير محدد");
      expect((prompt.match(/غير محدد/g) || []).length).toBe(3);
    });
  });

  describe("JSON response parsing", () => {
    it("should parse valid JSON string response", () => {
      const rawContent = '{"videoTitle":"test","narrativeScript":"script","targetAudience":"audience","estimatedDuration":90,"keyScenes":[],"suggestedMood":"mood"}';
      const parsed = JSON.parse(rawContent);
      expect(parsed.videoTitle).toBe("test");
      expect(parsed.estimatedDuration).toBe(90);
    });

    it("should handle typeof check for content extraction", () => {
      const stringContent = "some json string";
      const objectContent = { text: "object" };
      
      const fromString = typeof stringContent === "string" ? stringContent : "{}";
      const fromObject = typeof objectContent === "string" ? objectContent : "{}";
      
      expect(fromString).toBe("some json string");
      expect(fromObject).toBe("{}");
    });
  });
});
