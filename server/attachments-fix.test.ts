import { describe, it, expect } from "vitest";

/**
 * Tests for the attachments JSON handling fix.
 * The bug was: JSON.parse() was called on an already-parsed JSON object
 * from Drizzle's json() column type, causing "SyntaxError: [object Object] is not valid JSON".
 * 
 * Fix: Use typeof check to handle both string and object types safely.
 */

// Helper that mirrors the fix logic in AdminBatchManager.tsx
function parseAttachments(attachments: any): any[] {
  if (!attachments) return [];
  if (typeof attachments === 'string') {
    try {
      return JSON.parse(attachments);
    } catch {
      return [];
    }
  }
  if (Array.isArray(attachments)) return attachments;
  return [];
}

describe("Attachments JSON parsing fix", () => {
  it("should handle null attachments", () => {
    expect(parseAttachments(null)).toEqual([]);
  });

  it("should handle undefined attachments", () => {
    expect(parseAttachments(undefined)).toEqual([]);
  });

  it("should handle empty string attachments", () => {
    expect(parseAttachments("")).toEqual([]);
  });

  it("should handle JSON string attachments (legacy format)", () => {
    const jsonStr = JSON.stringify([
      { name: "test.pdf", type: "application/pdf", url: "https://example.com/test.pdf", size: 1024 },
    ]);
    const result = parseAttachments(jsonStr);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("test.pdf");
  });

  it("should handle already-parsed object attachments (Drizzle json column)", () => {
    // This is the actual bug scenario - Drizzle returns parsed objects from json() columns
    const parsedObj = [
      { name: "doc.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", url: "https://example.com/doc.docx", size: 11264 },
    ];
    const result = parseAttachments(parsedObj);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("doc.docx");
    expect(result[0].size).toBe(11264);
  });

  it("should handle multiple attachments as parsed objects", () => {
    const parsedObj = [
      { name: "file1.pdf", type: "application/pdf", url: "https://example.com/file1.pdf", size: 1024 },
      { name: "file2.png", type: "image/png", url: "https://example.com/file2.png", size: 2048 },
      { name: "file3.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", url: "https://example.com/file3.docx", size: 3072 },
    ];
    const result = parseAttachments(parsedObj);
    expect(result).toHaveLength(3);
  });

  it("should handle empty array", () => {
    expect(parseAttachments([])).toEqual([]);
  });

  it("should handle invalid JSON string gracefully", () => {
    expect(parseAttachments("not-valid-json")).toEqual([]);
  });

  it("should handle non-array object (edge case)", () => {
    // If somehow a non-array object is stored
    expect(parseAttachments({ name: "test" })).toEqual([]);
  });

  it("should NOT throw SyntaxError when given an object (the original bug)", () => {
    const obj = [{ name: "test.pdf" }];
    // This was the original bug: JSON.parse(obj) would throw
    // "SyntaxError: [object Object] is not valid JSON"
    expect(() => parseAttachments(obj)).not.toThrow();
  });
});
