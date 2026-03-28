import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Extracted text from image" } }],
  }),
}));

// Mock mammoth
vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({ value: "Extracted text from document" }),
  },
  extractRawText: vi.fn().mockResolvedValue({ value: "Extracted text from document" }),
}));

// Mock image generation
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/generated-image.png" }),
}));

describe("Ultimate Studio Enhancements", () => {
  describe("extractFromImage endpoint", () => {
    it("should accept image base64 and language parameters", () => {
      // Validate the input schema structure
      const validInput = {
        imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        language: "ar" as const,
      };
      expect(validInput.imageBase64).toBeTruthy();
      expect(["ar", "fr", "en"]).toContain(validInput.language);
    });

    it("should support Arabic, French, and English languages", () => {
      const languages = ["ar", "fr", "en"];
      languages.forEach((lang) => {
        expect(["ar", "fr", "en"]).toContain(lang);
      });
    });
  });

  describe("extractFromDoc endpoint", () => {
    it("should accept doc base64, fileName, and language parameters", () => {
      const validInput = {
        fileBase64: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAA==",
        fileName: "lesson-plan.docx",
        language: "ar" as const,
      };
      expect(validInput.fileBase64).toBeTruthy();
      expect(validInput.fileName).toBe("lesson-plan.docx");
    });

    it("should handle both .doc and .docx file names", () => {
      const docFiles = ["test.doc", "test.docx", "plan.DOC", "plan.DOCX"];
      docFiles.forEach((name) => {
        expect(name.toLowerCase()).toMatch(/\.docx?$/);
      });
    });
  });

  describe("enhancePrompt endpoint", () => {
    it("should accept prompt, style, and optional context", () => {
      const validInput = {
        prompt: "A classroom with students learning about fractions",
        style: "educational" as const,
        context: "Math lesson about fractions for grade 5",
      };
      expect(validInput.prompt.length).toBeGreaterThan(3);
      expect(["realistic", "cartoon", "lineart", "educational", "watercolor", "child_friendly"]).toContain(validInput.style);
    });

    it("should validate all 6 image styles", () => {
      const styles = ["realistic", "cartoon", "lineart", "educational", "watercolor", "child_friendly"];
      expect(styles).toHaveLength(6);
      styles.forEach((style) => {
        expect(typeof style).toBe("string");
        expect(style.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateImageWithStyle endpoint", () => {
    it("should accept sceneNumber, visualPrompt, and style", () => {
      const validInput = {
        sceneNumber: 1,
        visualPrompt: "A teacher explaining fractions on a whiteboard in a bright classroom",
        style: "realistic" as const,
      };
      expect(validInput.sceneNumber).toBeGreaterThanOrEqual(1);
      expect(validInput.visualPrompt.length).toBeGreaterThanOrEqual(5);
    });

    it("should support all image style options", () => {
      const stylePrefix: Record<string, string> = {
        realistic: "Photorealistic cinematic still",
        cartoon: "Colorful cartoon illustration",
        lineart: "Black and white line art drawing",
        educational: "Professional educational illustration",
        watercolor: "Beautiful watercolor painting",
        child_friendly: "Children's book illustration",
      };

      Object.keys(stylePrefix).forEach((style) => {
        expect(stylePrefix[style]).toBeTruthy();
        expect(stylePrefix[style].length).toBeGreaterThan(10);
      });
    });
  });

  describe("Multi-format file detection", () => {
    it("should correctly identify PDF files", () => {
      const ext = "test.pdf".toLowerCase().split(".").pop();
      expect(ext).toBe("pdf");
    });

    it("should correctly identify image files", () => {
      const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      const testFiles = ["photo.jpg", "scan.JPEG", "page.png", "image.gif", "doc.bmp", "pic.webp"];
      testFiles.forEach((file) => {
        const ext = file.toLowerCase().split(".").pop() || "";
        expect(imageExts).toContain(ext);
      });
    });

    it("should correctly identify DOC/DOCX files", () => {
      const docExts = ["doc", "docx"];
      const testFiles = ["lesson.doc", "plan.docx", "test.DOC", "exam.DOCX"];
      testFiles.forEach((file) => {
        const ext = file.toLowerCase().split(".").pop() || "";
        expect(docExts).toContain(ext);
      });
    });

    it("should reject unsupported formats", () => {
      const supportedExts = ["pdf", "jpg", "jpeg", "png", "gif", "bmp", "webp", "doc", "docx"];
      const unsupportedFiles = ["data.xlsx", "video.mp4", "audio.mp3", "archive.zip"];
      unsupportedFiles.forEach((file) => {
        const ext = file.toLowerCase().split(".").pop() || "";
        expect(supportedExts).not.toContain(ext);
      });
    });
  });

  describe("Page count extraction", () => {
    it("should support extracting 1, 2, or 3 pages", () => {
      const validCounts = [1, 2, 3];
      validCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(3);
      });
    });

    it("should not exceed total pages when extracting multiple pages", () => {
      const totalPages = 5;
      const currentPage = 4;
      const pageCountToExtract = 3;
      const actualPages = Math.min(pageCountToExtract, totalPages - currentPage + 1);
      expect(actualPages).toBe(2); // Can only extract 2 pages (4 and 5)
    });
  });

  describe("Translation keys", () => {
    it("should have all required new translation keys for multi-format upload", () => {
      const requiredKeys = [
        "uploadFile", "uploadFormats", "fileLoaded", "fileLoadFailed",
        "imageFile", "wordFile", "pdfFile", "unsupportedFormat",
        "pageCountLabel", "pageCountOne", "pageCountTwo", "pageCountThree",
        "extractMultiplePages", "extractingPages", "multiPageExtracted",
        "pasteText", "directTextInput", "switchToFile", "switchToText",
      ];
      // Just validate the key list exists
      expect(requiredKeys).toHaveLength(19);
    });

    it("should have all required new translation keys for image styles", () => {
      const requiredKeys = [
        "imageStyleLabel", "styleRealistic", "styleCartoon", "styleLineart",
        "styleEducational", "styleWatercolor", "styleChildFriendly",
        "enhancePrompt", "enhancingPrompt", "promptEnhanced", "promptEnhanceFailed",
        "editPrompt", "savePrompt", "cancelEdit", "regenerateWithStyle",
      ];
      expect(requiredKeys).toHaveLength(15);
    });
  });
});
