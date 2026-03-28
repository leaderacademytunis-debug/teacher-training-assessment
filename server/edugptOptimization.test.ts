import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("EduGPT Optimization Tests", () => {
  const routersContent = fs.readFileSync(
    path.join(__dirname, "routers.ts"),
    "utf8"
  );

  describe("System Prompt Optimization", () => {
    it("should have a condensed system prompt (under 12000 chars)", () => {
      const startMarker = "# ❗❗ قاعدة مطلقة";
      const endMarker = "- **التقييم (معايير التملك):** ...`";
      const startIdx = routersContent.indexOf(startMarker);
      const endIdx = routersContent.indexOf(endMarker) + endMarker.length;
      const prompt = routersContent.substring(startIdx, endIdx);
      expect(prompt.length).toBeLessThan(12000);
      expect(prompt.length).toBeGreaterThan(5000);
    });

    it("should still contain essential Tunisian pedagogical terms", () => {
      expect(routersContent).toContain("كفاية ختامية");
      expect(routersContent).toContain("هدف مميز");
      expect(routersContent).toContain("وضعية مشكلة");
      expect(routersContent).toContain("المقاربة بالكفايات");
      expect(routersContent).toContain("APC");
    });

    it("should still contain evaluation criteria references", () => {
      expect(routersContent).toContain("م1");
      expect(routersContent).toContain("م2");
      expect(routersContent).toContain("م3");
      expect(routersContent).toContain("ملاءمة");
      expect(routersContent).toContain("انسجام");
    });

    it("should still contain English textbook references", () => {
      expect(routersContent).toContain("Learn&Grow");
      expect(routersContent).toContain("Let's Learn");
      expect(routersContent).toContain("Skills for Life");
    });

    it("should still contain exam structure references", () => {
      expect(routersContent).toContain("سندات");
      expect(routersContent).toContain("تعليمات");
      expect(routersContent).toContain("جدول تنقيط");
    });
  });

  describe("Conversation History Limiting", () => {
    it("should limit conversation history to last 12 messages", () => {
      expect(routersContent).toContain("input.messages.length > 12");
      expect(routersContent).toContain("input.messages.slice(-12)");
    });

    it("should use recentMessages for LLM call instead of full history", () => {
      expect(routersContent).toContain("const llmMessages = recentMessages.map");
    });
  });

  describe("LLM Configuration", () => {
    it("should set max_tokens for faster response", () => {
      // Find the assistant.chat section
      const chatSection = routersContent.indexOf("assistant:");
      const nextSection = routersContent.indexOf("uploadFile:", chatSection);
      const chatCode = routersContent.substring(chatSection, nextSection);
      expect(chatCode).toContain("max_tokens: 4096");
    });
  });

  describe("CSS Table Styling for Chat Bubbles", () => {
    const cssContent = fs.readFileSync(
      path.join(__dirname, "../client/src/index.css"),
      "utf8"
    );

    it("should have blue bubble table overrides", () => {
      expect(cssContent).toContain(".bg-blue-600 .prose table th");
      expect(cssContent).toContain(".bg-blue-600 .prose table td");
    });

    it("should set white text color for tables in blue bubbles", () => {
      expect(cssContent).toContain("color: #ffffff");
    });

    it("should have semi-transparent table backgrounds", () => {
      expect(cssContent).toContain("rgba(255,255,255,0.25)");
      expect(cssContent).toContain("rgba(255,255,255,0.12)");
    });

    it("should have heading overrides for blue bubbles", () => {
      expect(cssContent).toContain(".bg-blue-600 .prose h1");
      expect(cssContent).toContain(".bg-blue-600 .prose h2");
      expect(cssContent).toContain(".bg-blue-600 .prose strong");
    });

    it("should have responsive table scrolling", () => {
      expect(cssContent).toContain("overflow-x: auto");
      expect(cssContent).toContain("-webkit-overflow-scrolling: touch");
    });

    it("should have mobile-specific table styles", () => {
      expect(cssContent).toContain("@media (max-width: 640px)");
    });
  });

  describe("Chat Bubble Responsive Layout", () => {
    const chatContent = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/EduGPTAssistantEnhanced.tsx"),
      "utf8"
    );

    it("should have responsive max-width on chat bubbles", () => {
      expect(chatContent).toContain("max-w-[85vw] sm:max-w-3xl");
    });

    it("should have responsive padding on chat bubbles", () => {
      expect(chatContent).toContain("p-3 sm:p-4");
    });

    it("should have overflow-hidden on chat cards", () => {
      expect(chatContent).toContain("overflow-hidden");
    });
  });
});
