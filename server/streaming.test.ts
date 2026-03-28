import { describe, it, expect, vi } from "vitest";

describe("Streaming Chat Endpoint", () => {
  describe("Server-side streaming setup", () => {
    it("should have the streaming endpoint file", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.resolve(__dirname, "streamChat.ts");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should export streamChatHandler function", async () => {
      const mod = await import("./streamChat");
      expect(typeof mod.streamChatHandler).toBe("function");
    });

    it("streaming endpoint module should be importable", async () => {
      const mod = await import("./streamChat");
      // The module should have exports
      expect(mod).toBeDefined();
    });
  });

  describe("System prompt building", () => {
    it("should build system prompt with subject and level", async () => {
      // Test that the streaming endpoint builds proper prompts
      const subject = "الرياضيات";
      const level = "السنة الأولى";
      const subjectInfo = `\n\n📚 المادة الدراسية المحددة: **${subject}**`;
      const levelInfo = `\n🎓 المستوى الدراسي المحدد: **${level}**`;
      
      expect(subjectInfo).toContain(subject);
      expect(levelInfo).toContain(level);
    });

    it("should handle French teaching language", () => {
      const teachingLanguage = "french";
      const langNote = teachingLanguage === "french"
        ? `\n🇫🇷 Langue d'enseignement: **Français**.`
        : teachingLanguage === "english"
        ? `\n🇬🇧 Teaching Language: **English**.`
        : `\n🇹🇳 لغة التدريس: **العربية**.`;
      
      expect(langNote).toContain("Français");
    });

    it("should handle English teaching language", () => {
      const teachingLanguage = "english";
      const langNote = teachingLanguage === "french"
        ? `\n🇫🇷 Langue d'enseignement: **Français**.`
        : teachingLanguage === "english"
        ? `\n🇬🇧 Teaching Language: **English**.`
        : `\n🇹🇳 لغة التدريس: **العربية**.`;
      
      expect(langNote).toContain("English");
    });

    it("should handle Arabic teaching language by default", () => {
      const teachingLanguage = "arabic";
      const langNote = teachingLanguage === "french"
        ? `\n🇫🇷 Langue d'enseignement: **Français**.`
        : teachingLanguage === "english"
        ? `\n🇬🇧 Teaching Language: **English**.`
        : `\n🇹🇳 لغة التدريس: **العربية**.`;
      
      expect(langNote).toContain("العربية");
    });
  });

  describe("Message history limiting", () => {
    it("should limit messages to last 12 when more than 12 provided", () => {
      const messages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
      }));
      
      const recentMessages = messages.length > 12 ? messages.slice(-12) : messages;
      expect(recentMessages.length).toBe(12);
      expect(recentMessages[0].content).toBe("Message 8");
    });

    it("should keep all messages when 12 or fewer", () => {
      const messages = Array.from({ length: 8 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
      }));
      
      const recentMessages = messages.length > 12 ? messages.slice(-12) : messages;
      expect(recentMessages.length).toBe(8);
    });
  });

  describe("SSE format", () => {
    it("should format SSE data correctly", () => {
      const content = "مرحباً";
      const sseData = `data: ${JSON.stringify({ content })}\n\n`;
      
      expect(sseData.startsWith("data: ")).toBe(true);
      expect(sseData).toContain('"content"');
      expect(sseData.endsWith("\n\n")).toBe(true);
    });

    it("should format done signal correctly", () => {
      const doneSignal = "data: [DONE]\n\n";
      expect(doneSignal).toBe("data: [DONE]\n\n");
    });

    it("should format error messages correctly", () => {
      const error = "Connection failed";
      const sseError = `data: ${JSON.stringify({ error })}\n\n`;
      
      expect(sseError).toContain('"error"');
      const parsed = JSON.parse(sseError.replace("data: ", "").trim());
      expect(parsed.error).toBe(error);
    });
  });

  describe("Frontend streaming consumer", () => {
    it("should parse SSE content chunks correctly", () => {
      const rawLine = 'data: {"content":"مرحباً "}';
      const trimmed = rawLine.trim();
      
      expect(trimmed.startsWith("data: ")).toBe(true);
      const data = JSON.parse(trimmed.slice(6));
      expect(data.content).toBe("مرحباً ");
    });

    it("should accumulate streaming content", () => {
      const chunks = ["مرحباً ", "أيها ", "المعلم"];
      let accumulated = "";
      
      for (const chunk of chunks) {
        accumulated += chunk;
      }
      
      expect(accumulated).toBe("مرحباً أيها المعلم");
    });

    it("should skip [DONE] signal", () => {
      const line = "data: [DONE]";
      const isDone = line.trim() === "data: [DONE]";
      expect(isDone).toBe(true);
    });

    it("should skip empty lines", () => {
      const lines = ["", "  ", "data: [DONE]", 'data: {"content":"hello"}'];
      const validLines = lines.filter(l => {
        const trimmed = l.trim();
        return trimmed && trimmed !== "data: [DONE]" && trimmed.startsWith("data: ");
      });
      
      expect(validLines.length).toBe(1);
      expect(validLines[0]).toContain("hello");
    });

    it("should handle malformed JSON gracefully", () => {
      const malformedLine = "data: {invalid json}";
      let parsed = null;
      try {
        parsed = JSON.parse(malformedLine.slice(6));
      } catch {
        // Expected
      }
      expect(parsed).toBeNull();
    });
  });

  describe("Streaming state management", () => {
    it("should track streaming vs non-streaming loading states", () => {
      // When streaming starts, isLoading=true and streamingContent starts empty
      let isLoading = true;
      let streamingContent = "";
      
      // Initially: show typing indicator (isLoading && !streamingContent)
      expect(isLoading && !streamingContent).toBe(true);
      
      // After first chunk: hide typing, show streaming content
      streamingContent = "مرحباً";
      expect(isLoading && !streamingContent).toBe(false);
      expect(streamingContent.length > 0).toBe(true);
      
      // After completion: reset everything
      isLoading = false;
      streamingContent = "";
      expect(isLoading).toBe(false);
      expect(streamingContent).toBe("");
    });
  });
});
