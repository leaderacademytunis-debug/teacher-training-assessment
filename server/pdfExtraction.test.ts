import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PDF Text Extraction", () => {
  it("should use LLM file_url for PDF extraction instead of pdf-parse", async () => {
    // Verify the routers.ts code uses file_url for PDF extraction
    const routersPath = path.join(__dirname, "routers.ts");
    const routersContent = fs.readFileSync(routersPath, "utf-8");

    // Find the PDF extraction section
    const pdfSection = routersContent.match(
      /if \(input\.mimeType === "application\/pdf"\) \{[\s\S]*?(?=\/\/ ── Word)/
    );
    expect(pdfSection).toBeTruthy();

    const pdfCode = pdfSection![0];

    // Should use LLM with file_url instead of pdf-parse
    expect(pdfCode).toContain("file_url");
    expect(pdfCode).toContain("storagePut");
    expect(pdfCode).toContain("invokeLLM");

    // Should NOT use pdf-parse anymore
    expect(pdfCode).not.toContain("PDFParse");
    expect(pdfCode).not.toContain("pdf-parse");
  });

  it("should include Arabic extraction prompt for PDFs", async () => {
    const routersPath = path.join(__dirname, "routers.ts");
    const routersContent = fs.readFileSync(routersPath, "utf-8");

    const pdfSection = routersContent.match(
      /if \(input\.mimeType === "application\/pdf"\) \{[\s\S]*?(?=\/\/ ── Word)/
    );
    expect(pdfSection).toBeTruthy();

    const pdfCode = pdfSection![0];

    // Should have Arabic extraction prompt
    expect(pdfCode).toContain("استخرج كل النص");
    // Should handle multi-page PDFs
    expect(pdfCode).toContain("جميع الصفحات");
  });

  it("should set correct mime_type for PDF file_url", async () => {
    const routersPath = path.join(__dirname, "routers.ts");
    const routersContent = fs.readFileSync(routersPath, "utf-8");

    const pdfSection = routersContent.match(
      /if \(input\.mimeType === "application\/pdf"\) \{[\s\S]*?(?=\/\/ ── Word)/
    );
    expect(pdfSection).toBeTruthy();

    const pdfCode = pdfSection![0];

    // Should set correct mime type
    expect(pdfCode).toContain('mime_type: "application/pdf"');
  });
});
