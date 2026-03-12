import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("PDF Parse v2 API Fix", () => {
  describe("PDFParse class usage", () => {
    it("should import PDFParse as a named export from pdf-parse", async () => {
      const { PDFParse } = await import("pdf-parse");
      expect(PDFParse).toBeDefined();
      expect(typeof PDFParse).toBe("function");
    });

    it("should create PDFParse instance with options object", async () => {
      const { PDFParse } = await import("pdf-parse");
      const pdf = new PDFParse({ data: new Uint8Array([]), verbosity: 0 });
      expect(pdf).toBeDefined();
      expect(typeof pdf.getText).toBe("function");
      expect(typeof pdf.load).toBe("function");
      expect(typeof pdf.destroy).toBe("function");
      await pdf.destroy().catch(() => {});
    });

    it("should NOT work with old API (pdfParse as function)", async () => {
      const pdfParseModule = await import("pdf-parse") as any;
      // In v2, there is no default export that is a function
      const pdfParse = pdfParseModule.default;
      expect(typeof pdfParse).not.toBe("function");
    });
  });

  describe("assistant.evaluateFiche procedure", () => {
    it("should exist and accept correct input shape", () => {
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("assistant.evaluateFiche");
    });

    it("should reject unauthenticated access", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.assistant.evaluateFiche({
          fileBase64: "dGVzdA==",
          fileName: "test.pdf",
          mimeType: "application/pdf",
        })
      ).rejects.toThrow();
    });

    it("should accept PDF mimeType in input validation", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // This will fail at PDF parsing (invalid base64 for PDF), not at input validation
      try {
        await caller.assistant.evaluateFiche({
          fileBase64: "dGVzdA==", // "test" in base64 - not a valid PDF
          fileName: "test.pdf",
          mimeType: "application/pdf",
        });
      } catch (e: any) {
        // Should fail at PDF parsing, not at input validation
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });

  describe("edugpt.extractTextFromFile procedure", () => {
    it("should exist as a public procedure", () => {
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("edugpt.extractTextFromFile");
    });

    it("should accept PDF mimeType in input validation", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.edugpt.extractTextFromFile({
          base64Data: "dGVzdA==",
          mimeType: "application/pdf",
          fileName: "test.pdf",
        });
      } catch (e: any) {
        // Should fail at PDF parsing, not at input validation
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });

  describe("fileAnalysis.ts analyzePDF", () => {
    it("should use PDFParse v2 API correctly", async () => {
      const { analyzePDF } = await import("./fileAnalysis");
      expect(typeof analyzePDF).toBe("function");

      // Test with invalid buffer - should throw a PDF error, not "pdfParse is not a function"
      try {
        await analyzePDF(Buffer.from("not a pdf"));
      } catch (e: any) {
        // Should be a PDF-related error, NOT "pdfParse is not a function"
        expect(e.message).not.toContain("is not a function");
        expect(e.message).not.toContain("is not a constructor");
      }
    });
  });
});
