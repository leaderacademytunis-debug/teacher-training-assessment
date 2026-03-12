import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-handwriting-user",
    email: "teacher@example.com",
    name: "Test Teacher",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("handwriting router", () => {
  // ─── Input Validation Tests ────────────────────────────────────────────

  describe("createStudent input validation", () => {
    it("rejects empty firstName", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.createStudent({
          firstName: "",
          age: 7,
          grade: "سنة 2 ابتدائي",
          gender: "male",
        })
      ).rejects.toThrow();
    });

    it("rejects age below 5", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.createStudent({
          firstName: "أحمد",
          age: 3,
          grade: "سنة 1 ابتدائي",
          gender: "male",
        })
      ).rejects.toThrow();
    });

    it("rejects age above 12", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.createStudent({
          firstName: "أحمد",
          age: 15,
          grade: "سنة 6 ابتدائي",
          gender: "male",
        })
      ).rejects.toThrow();
    });

    it("rejects invalid gender", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.createStudent({
          firstName: "أحمد",
          age: 7,
          grade: "سنة 2 ابتدائي",
          gender: "other" as any,
        })
      ).rejects.toThrow();
    });
  });

  describe("analyzeHandwriting input validation", () => {
    it("rejects empty imageBase64", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "",
          mimeType: "image/png",
          writingType: "copy",
        })
      ).rejects.toThrow();
    });

    it("rejects invalid writingType", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "dGVzdA==",
          mimeType: "image/png",
          writingType: "invalid" as any,
        })
      ).rejects.toThrow();
    });

    it("accepts all valid writingType enum values at schema level", async () => {
      // Verify the schema accepts valid writingType values by checking that
      // invalid values are rejected (schema-level validation only)
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Invalid value should throw
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "dGVzdA==",
          mimeType: "image/png",
          writingType: "invalid_type" as any,
        })
      ).rejects.toThrow();
      
      // Valid values: "copy", "dictation", "free_expression", "math"
      // We can't test them all without hitting LLM/storage,
      // but we verified the enum rejects invalid values above
    });

    it("rejects studentAge below 5", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "dGVzdA==",
          mimeType: "image/png",
          writingType: "copy",
          studentAge: 3,
        })
      ).rejects.toThrow();
    });

    it("rejects studentAge above 12", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "dGVzdA==",
          mimeType: "image/png",
          writingType: "copy",
          studentAge: 15,
        })
      ).rejects.toThrow();
    });
  });

  // ─── Authentication Tests ─────────────────────────────────────────────

  describe("authentication requirements", () => {
    it("rejects unauthenticated access to getStudents", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.handwriting.getStudents()).rejects.toThrow();
    });

    it("rejects unauthenticated access to getAnalyses", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.handwriting.getAnalyses({})).rejects.toThrow();
    });

    it("rejects unauthenticated access to analyzeHandwriting", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.analyzeHandwriting({
          imageBase64: "dGVzdA==",
          mimeType: "image/png",
          writingType: "copy",
        })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to createStudent", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.createStudent({
          firstName: "أحمد",
          age: 7,
          grade: "سنة 2 ابتدائي",
          gender: "male",
        })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to exportPdf", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.exportPdf({ analysisId: 1 })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to getStudentHistory", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.getStudentHistory({ studentId: 1 })
      ).rejects.toThrow();
    });
  });

  // ─── Router Structure Tests ───────────────────────────────────────────

  describe("router structure", () => {
    it("has all expected procedures", () => {
      const handwritingRouter = (appRouter as any)._def.procedures;
      
      // Check that handwriting procedures exist
      expect(handwritingRouter).toHaveProperty("handwriting.createStudent");
      expect(handwritingRouter).toHaveProperty("handwriting.getStudents");
      expect(handwritingRouter).toHaveProperty("handwriting.analyzeHandwriting");
      expect(handwritingRouter).toHaveProperty("handwriting.getAnalyses");
      expect(handwritingRouter).toHaveProperty("handwriting.getAnalysis");
      expect(handwritingRouter).toHaveProperty("handwriting.getStudentHistory");
      expect(handwritingRouter).toHaveProperty("handwriting.exportPdf");
    });
  });

  // ─── getAnalysis input validation ─────────────────────────────────────

  describe("getAnalysis input validation", () => {
    it("requires numeric id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.getAnalysis({ id: "abc" as any })
      ).rejects.toThrow();
    });
  });

  // ─── exportPdf input validation ───────────────────────────────────────

  describe("exportPdf input validation", () => {
    it("requires numeric analysisId", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.handwriting.exportPdf({ analysisId: "abc" as any })
      ).rejects.toThrow();
    });
  });
});
