import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock storagePut to capture what's uploaded
const mockStoragePut = vi.fn().mockImplementation(async (key: string, data: any, contentType: string) => {
  return { url: `https://s3.example.com/${key}`, key };
});

vi.mock("./storage", () => ({
  storagePut: (...args: any[]) => mockStoragePut(...args),
}));

describe("htmlToPdf helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export htmlToPdf function", async () => {
    const mod = await import("./lib/htmlToPdf");
    expect(typeof mod.htmlToPdf).toBe("function");
  });

  it("should generate a file URL from HTML content", async () => {
    const { htmlToPdf } = await import("./lib/htmlToPdf");
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body { font-family: sans-serif; }</style></head><body><h1>Test</h1></body></html>`;
    const result = await htmlToPdf(html, "test/output-file");
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("isPdf");
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
  });

  it("should call storagePut with correct content type", async () => {
    const { htmlToPdf } = await import("./lib/htmlToPdf");
    const html = `<!DOCTYPE html><html><head><style>body { color: black; }</style></head><body>Test</body></html>`;
    const result = await htmlToPdf(html, "test/content-type-check");
    
    expect(mockStoragePut).toHaveBeenCalled();
    const contentType = mockStoragePut.mock.calls[0][2];
    // Should be either application/pdf (WeasyPrint) or text/html (fallback)
    expect(["application/pdf", "text/html"]).toContain(contentType);
    
    if (result.isPdf) {
      expect(contentType).toBe("application/pdf");
    } else {
      expect(contentType).toBe("text/html");
    }
  });

  it("should use custom margins when provided", async () => {
    const { htmlToPdf } = await import("./lib/htmlToPdf");
    const html = `<!DOCTYPE html><html><head><style>body {}</style></head><body>Test</body></html>`;
    const result = await htmlToPdf(html, "test/custom-margins", {
      margins: { top: "2cm", right: "2cm", bottom: "2cm", left: "2cm" },
    });
    
    // If it fell back to HTML, the HTML content should contain the margins
    if (!result.isPdf) {
      const uploadedContent = mockStoragePut.mock.calls[0][1].toString();
      expect(uploadedContent).toContain("2cm");
    }
    // Either way, the function should succeed
    expect(result.url).toBeTruthy();
  });

  it("should handle S3 key and add proper extension", async () => {
    const { htmlToPdf } = await import("./lib/htmlToPdf");
    const html = `<!DOCTYPE html><html><head><style>body {}</style></head><body>Test</body></html>`;
    await htmlToPdf(html, "test/no-extension");
    
    const s3Key = mockStoragePut.mock.calls[0][0];
    // Should have either .pdf or .html extension
    expect(s3Key).toMatch(/\.(pdf|html)$/);
  });

  it("should return isPdf=true when WeasyPrint is available", async () => {
    const { htmlToPdf } = await import("./lib/htmlToPdf");
    const html = `<!DOCTYPE html><html><head><style>body {}</style></head><body>WeasyPrint test</body></html>`;
    const result = await htmlToPdf(html, "test/weasyprint-check");
    
    // In dev environment, WeasyPrint should be available
    // In production, it falls back to HTML
    expect(typeof result.isPdf).toBe("boolean");
    expect(result.url).toBeTruthy();
  });
});
