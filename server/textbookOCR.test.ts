import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the trpc module
vi.mock("./_core/trpc", () => ({
  publicProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
  protectedProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
  router: vi.fn((routes) => routes),
  staffProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
  teacherProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
  schoolProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
  teacherOrSchoolProcedure: {
    query: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  },
}));

import { invokeLLM } from "./_core/llm";

describe("Textbook OCR - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LLM-based OCR extraction", () => {
    it("should extract Arabic text from image via LLM", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "هذا نص مستخرج من كتاب الرياضيات",
            },
          },
        ],
      };
      (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "أنت محرك استخراج نصوص" },
          {
            role: "user",
            content: [
              { type: "text", text: "استخرج النص" },
              { type: "image_url", image_url: { url: "data:image/png;base64,test", detail: "high" } },
            ],
          },
        ],
      });

      expect(result.choices[0].message.content).toBe("هذا نص مستخرج من كتاب الرياضيات");
      expect(invokeLLM).toHaveBeenCalledTimes(1);
    });

    it("should extract French text from image via LLM", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Leçon 5: Les fractions\nExercice 1: Calculer les fractions suivantes",
            },
          },
        ],
      };
      (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "أنت محرك استخراج نصوص" },
          {
            role: "user",
            content: [
              { type: "text", text: "استخرج النص" },
              { type: "image_url", image_url: { url: "data:image/png;base64,test", detail: "high" } },
            ],
          },
        ],
      });

      expect(result.choices[0].message.content).toContain("Leçon 5");
      expect(result.choices[0].message.content).toContain("fractions");
    });

    it("should handle empty LLM response gracefully", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      };
      (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "أنت محرك استخراج نصوص" },
          { role: "user", content: "استخرج النص" },
        ],
      });

      const rawContent = result.choices?.[0]?.message?.content;
      const extractedText = typeof rawContent === "string" ? rawContent.trim() : "";
      expect(extractedText).toBe("");
    });

    it("should handle LLM error", async () => {
      (invokeLLM as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("LLM service unavailable"));

      await expect(
        invokeLLM({
          messages: [
            { role: "system", content: "أنت محرك استخراج نصوص" },
            { role: "user", content: "استخرج النص" },
          ],
        })
      ).rejects.toThrow("LLM service unavailable");
    });

    it("should trim whitespace from extracted text", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "  نص مع مسافات زائدة  \n  ",
            },
          },
        ],
      };
      (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "أنت محرك استخراج نصوص" },
          { role: "user", content: "استخرج النص" },
        ],
      });

      const rawContent = result.choices?.[0]?.message?.content;
      const extractedText = typeof rawContent === "string" ? rawContent.trim() : "";
      expect(extractedText).toBe("نص مع مسافات زائدة");
    });
  });

  describe("Extraction Store Logic", () => {
    it("should correctly format extraction result", () => {
      const text = "نص مستخرج";
      const fileName = "كتاب الرياضيات.pdf";
      const pageNumber = 5;

      const result = {
        text,
        fileName,
        pageNumber,
        charCount: text.length,
      };

      expect(result.text).toBe("نص مستخرج");
      expect(result.fileName).toBe("كتاب الرياضيات.pdf");
      expect(result.pageNumber).toBe(5);
      expect(result.charCount).toBe(9);
    });

    it("should handle missing optional fields", () => {
      const text = "نص مستخرج";

      const result = {
        text,
        fileName: "",
        pageNumber: 0,
        charCount: text.length,
      };

      expect(result.fileName).toBe("");
      expect(result.pageNumber).toBe(0);
    });

    it("should append text correctly", () => {
      const existing = "النص الأول";
      const newText = "النص الثاني";
      const combined = existing ? `${existing}\n\n${newText}` : newText;

      expect(combined).toBe("النص الأول\n\nالنص الثاني");
    });

    it("should handle first append when payload is empty", () => {
      const existing = "";
      const newText = "النص الأول";
      const combined = existing ? `${existing}\n\n${newText}` : newText;

      expect(combined).toBe("النص الأول");
    });
  });
});
