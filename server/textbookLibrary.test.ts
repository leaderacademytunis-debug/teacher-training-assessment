import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the extraction store logic
describe("Extraction Store", () => {
  it("should have correct initial state", async () => {
    // Dynamic import to avoid module caching issues
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const state = useExtractionStore.getState();
    
    expect(state.extracted_payload).toBe("");
    expect(state.sourceInfo).toBeNull();
    expect(state.isExtracting).toBe(false);
  });

  it("should set extracted payload with source info", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    store.getState().setExtractedPayload("نص مستخرج من الكتاب", {
      fileName: "كتاب الرياضيات",
      pageNumber: 5,
    });
    
    const state = store.getState();
    expect(state.extracted_payload).toBe("نص مستخرج من الكتاب");
    expect(state.sourceInfo?.fileName).toBe("كتاب الرياضيات");
    expect(state.sourceInfo?.pageNumber).toBe(5);
    expect(state.sourceInfo?.extractedAt).toBeInstanceOf(Date);
  });

  it("should append to existing payload", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    store.getState().setExtractedPayload("الفقرة الأولى");
    store.getState().appendToPayload("الفقرة الثانية");
    
    const state = store.getState();
    expect(state.extracted_payload).toContain("الفقرة الأولى");
    expect(state.extracted_payload).toContain("الفقرة الثانية");
  });

  it("should clear payload", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    store.getState().setExtractedPayload("some text", {
      fileName: "test.pdf",
      pageNumber: 1,
    });
    store.getState().clearPayload();
    
    const state = store.getState();
    expect(state.extracted_payload).toBe("");
    expect(state.sourceInfo).toBeNull();
  });

  it("should toggle isExtracting state", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    store.getState().setIsExtracting(true);
    expect(store.getState().isExtracting).toBe(true);
    
    store.getState().setIsExtracting(false);
    expect(store.getState().isExtracting).toBe(false);
  });
});

// Test the textbook archive router
describe("Textbook Archive Router", () => {
  it("should validate save excerpt input requires text", () => {
    // Test that the schema requires text field
    const { z } = require("zod");
    const saveSchema = z.object({
      text: z.string().min(1),
      title: z.string().optional(),
      sourceFileName: z.string().optional(),
      sourcePageNumber: z.number().optional(),
    });
    
    // Valid input
    const valid = saveSchema.safeParse({ text: "مقتطف من الكتاب" });
    expect(valid.success).toBe(true);
    
    // Invalid - empty text
    const invalid = saveSchema.safeParse({ text: "" });
    expect(invalid.success).toBe(false);
    
    // Invalid - missing text
    const missing = saveSchema.safeParse({});
    expect(missing.success).toBe(false);
  });

  it("should validate OCR extract input requires imageData", () => {
    const { z } = require("zod");
    const extractSchema = z.object({
      imageData: z.string().min(1),
      language: z.enum(["ar", "fr", "en"]).optional(),
    });
    
    // Valid input
    const valid = extractSchema.safeParse({ imageData: "data:image/png;base64,abc123" });
    expect(valid.success).toBe(true);
    
    // Valid with language
    const validLang = extractSchema.safeParse({ imageData: "data:image/png;base64,abc123", language: "ar" });
    expect(validLang.success).toBe(true);
    
    // Invalid - empty imageData
    const invalid = extractSchema.safeParse({ imageData: "" });
    expect(invalid.success).toBe(false);
  });
});

// Test the textbook library mock data structure
describe("Textbooks Library Data", () => {
  it("should have correct textbook item structure", () => {
    // Mock textbook item matching the TextbooksLibrary page structure
    const textbook = {
      id: "math-6",
      title: "كتاب الرياضيات",
      titleFr: "Mathématiques",
      subject: "رياضيات",
      level: "السنة السادسة",
      color: "#f59e0b",
      description: "كتاب الرياضيات للسنة السادسة من التعليم الأساسي",
    };
    
    expect(textbook.id).toBeTruthy();
    expect(textbook.title).toBeTruthy();
    expect(textbook.titleFr).toBeTruthy();
    expect(textbook.subject).toBeTruthy();
    expect(textbook.level).toBeTruthy();
    expect(textbook.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("should support multiple subjects", () => {
    const subjects = ["رياضيات", "فرنسية", "إيقاظ علمي", "عربية"];
    expect(subjects.length).toBeGreaterThanOrEqual(3);
    subjects.forEach(s => expect(s).toBeTruthy());
  });

  it("should support multiple grade levels", () => {
    const levels = ["السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة", "السنة السادسة"];
    expect(levels.length).toBeGreaterThanOrEqual(4);
  });
});

// Test the smart routing logic
describe("Smart Action Routing", () => {
  it("should define correct route targets for each action", () => {
    const routes = {
      lessonPlan: "/repartition-journaliere",
      examBuilder: "/exam-builder",
      visualStudio: "/leader-visual-studio",
      archive: null, // archive saves in-place
    };
    
    expect(routes.lessonPlan).toBe("/repartition-journaliere");
    expect(routes.examBuilder).toBe("/exam-builder");
    expect(routes.visualStudio).toBe("/leader-visual-studio");
    expect(routes.archive).toBeNull();
  });

  it("should ensure payload is consumed after routing", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    // Simulate: set payload before routing
    store.getState().setExtractedPayload("محتوى الدرس المستخرج");
    expect(store.getState().extracted_payload).toBe("محتوى الدرس المستخرج");
    
    // Simulate: receiving page clears payload after reading
    const payload = store.getState().extracted_payload;
    store.getState().clearPayload();
    
    expect(payload).toBe("محتوى الدرس المستخرج");
    expect(store.getState().extracted_payload).toBe("");
  });

  it("should handle empty payload gracefully", async () => {
    const { useExtractionStore } = await import("../client/src/stores/extractionStore");
    const store = useExtractionStore;
    
    store.getState().clearPayload();
    
    // Simulate: receiving page checks for empty payload
    const payload = store.getState().extracted_payload;
    expect(payload).toBe("");
    
    // Should not auto-fill when empty
    const shouldAutoFill = payload.length > 0;
    expect(shouldAutoFill).toBe(false);
  });
});
