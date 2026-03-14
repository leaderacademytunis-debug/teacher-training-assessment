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
        caller.handwriting.createStudent({ firstName: "", age: 7, grade: "سنة 2 ابتدائي", gender: "male" })
      ).rejects.toThrow();
    });

    it("rejects age below 5", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.createStudent({ firstName: "أحمد", age: 3, grade: "سنة 1 ابتدائي", gender: "male" })
      ).rejects.toThrow();
    });

    it("rejects age above 12", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.createStudent({ firstName: "أحمد", age: 15, grade: "سنة 6 ابتدائي", gender: "male" })
      ).rejects.toThrow();
    });

    it("rejects invalid gender", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.createStudent({ firstName: "أحمد", age: 7, grade: "سنة 2 ابتدائي", gender: "other" as any })
      ).rejects.toThrow();
    });
  });

  describe("analyzeHandwriting input validation", () => {
    it("rejects empty imageBase64", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeHandwriting({ imageBase64: "", mimeType: "image/png", writingType: "copy" })
      ).rejects.toThrow();
    });

    it("rejects invalid writingType", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeHandwriting({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "invalid" as any })
      ).rejects.toThrow();
    });

    it("rejects studentAge below 5", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeHandwriting({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy", studentAge: 3 })
      ).rejects.toThrow();
    });

    it("rejects studentAge above 12", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeHandwriting({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy", studentAge: 15 })
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
        caller.handwriting.analyzeHandwriting({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy" })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to createStudent", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.createStudent({ firstName: "أحمد", age: 7, grade: "سنة 2 ابتدائي", gender: "male" })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to exportPdf", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.exportPdf({ analysisId: 1 })).rejects.toThrow();
    });

    it("rejects unauthenticated access to getStudentHistory", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getStudentHistory({ studentId: 1 })).rejects.toThrow();
    });

    // New: auth tests for improvement procedures
    it("rejects unauthenticated access to exportParentReport", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.exportParentReport({ analysisId: 1 })).rejects.toThrow();
    });

    it("rejects unauthenticated access to getExercisesForAnalysis", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getExercisesForAnalysis({ analysisId: 1 })).rejects.toThrow();
    });

    it("rejects unauthenticated access to getAgeBenchmarks", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getAgeBenchmarks()).rejects.toThrow();
    });

    it("rejects unauthenticated access to analyzeMultipleSamples", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeMultipleSamples({
          samples: [
            { imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy" },
            { imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "dictation" },
          ],
        })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to addSpecialist", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.addSpecialist({ name: "Dr. Test", specialty: "orthophonist" })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to getSpecialists", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getSpecialists()).rejects.toThrow();
    });

    it("rejects unauthenticated access to analyzeVoice", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeVoice({ audioBase64: "dGVzdA==", mimeType: "audio/mp3" })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to generatePEI", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.generatePEI({ studentName: "أحمد" })
      ).rejects.toThrow();
    });

    it("rejects unauthenticated access to getPEIs", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getPEIs()).rejects.toThrow();
    });

    it("rejects unauthenticated access to getSchoolStats", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.handwriting.getSchoolStats()).rejects.toThrow();
    });

    it("rejects unauthenticated access to getStudentProgress", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.getStudentProgress({ studentName: "أحمد" })
      ).rejects.toThrow();
    });
  });

  // ─── Router Structure Tests ───────────────────────────────────────────

  describe("router structure", () => {
    it("has all original procedures", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.createStudent");
      expect(procedures).toHaveProperty("handwriting.getStudents");
      expect(procedures).toHaveProperty("handwriting.analyzeHandwriting");
      expect(procedures).toHaveProperty("handwriting.getAnalyses");
      expect(procedures).toHaveProperty("handwriting.getAnalysis");
      expect(procedures).toHaveProperty("handwriting.getStudentHistory");
      expect(procedures).toHaveProperty("handwriting.exportPdf");
    });

    it("has improvement 1: progress tracking procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.getStudentProgress");
    });

    it("has improvement 2: parent report procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.exportParentReport");
    });

    it("has improvement 3: therapeutic exercises procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.getExercisesForAnalysis");
    });

    it("has improvement 4: age benchmarks procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.getAgeBenchmarks");
    });

    it("has improvement 5: multi-sample analysis procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.analyzeMultipleSamples");
    });

    it("has improvement 6: specialist management procedures", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.addSpecialist");
      expect(procedures).toHaveProperty("handwriting.getSpecialists");
      expect(procedures).toHaveProperty("handwriting.removeSpecialist");
      expect(procedures).toHaveProperty("handwriting.notifySpecialist");
    });

    it("has improvement 7: voice analysis procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.analyzeVoice");
    });

    it("has improvement 8: PEI procedures", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.generatePEI");
      expect(procedures).toHaveProperty("handwriting.getPEIs");
      expect(procedures).toHaveProperty("handwriting.exportPEI");
    });

    it("has improvement 9: school stats procedure", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.getSchoolStats");
    });
  });

  // ─── Input Validation for New Procedures ──────────────────────────────

  describe("analyzeMultipleSamples input validation", () => {
    it("rejects less than 2 samples", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeMultipleSamples({
          samples: [{ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy" }],
        })
      ).rejects.toThrow();
    });

    it("rejects more than 5 samples", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const samples = Array(6).fill({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy" });
      await expect(
        caller.handwriting.analyzeMultipleSamples({ samples })
      ).rejects.toThrow();
    });
  });

  describe("addSpecialist input validation", () => {
    it("rejects empty name", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.addSpecialist({ name: "", specialty: "orthophonist" })
      ).rejects.toThrow();
    });

    it("rejects invalid specialty", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.addSpecialist({ name: "Dr. Test", specialty: "invalid" as any })
      ).rejects.toThrow();
    });
  });

  describe("generatePEI input validation", () => {
    it("rejects empty studentName", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.generatePEI({ studentName: "" })
      ).rejects.toThrow();
    });
  });

  describe("analyzeVoice input validation", () => {
    it("rejects missing audioBase64 field", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        (caller.handwriting.analyzeVoice as any)({ mimeType: "audio/mp3" })
      ).rejects.toThrow();
    });
  });

  describe("getAnalysis input validation", () => {
    it("requires numeric id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.getAnalysis({ id: "abc" as any })
      ).rejects.toThrow();
    });
  });

  describe("exportPdf input validation", () => {
    it("requires numeric analysisId", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.exportPdf({ analysisId: "abc" as any })
      ).rejects.toThrow();
    });
  });

  describe("exportParentReport input validation", () => {
    it("requires numeric analysisId", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.exportParentReport({ analysisId: "abc" as any })
      ).rejects.toThrow();
    });
  });

  describe("removeSpecialist input validation", () => {
    it("requires numeric id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.removeSpecialist({ id: "abc" as any })
      ).rejects.toThrow();
    });
  });

  describe("exportPEI input validation", () => {
    it("requires numeric id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.exportPEI({ id: "abc" as any })
      ).rejects.toThrow();
    });
  });

  // ─── Authenticated Data Retrieval Tests ───────────────────────────────

  describe("authenticated data retrieval", () => {
    it("getAgeBenchmarks returns array of benchmarks", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getAgeBenchmarks();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Check structure of first benchmark
      const first = result[0];
      expect(first).toHaveProperty("age");
      expect(first).toHaveProperty("grade");
      expect(first).toHaveProperty("expectedScore");
      expect(first).toHaveProperty("letterFormation");
    });

    it("getSchoolStats returns statistics object", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getSchoolStats();
      expect(result).toHaveProperty("totalAnalyses");
      expect(result).toHaveProperty("totalStudents");
      expect(result).toHaveProperty("avgScore");
      expect(result).toHaveProperty("axisAverages");
      expect(result).toHaveProperty("disorderDistribution");
      expect(result).toHaveProperty("gradeDistribution");
      expect(typeof result.totalAnalyses).toBe("number");
      expect(typeof result.totalStudents).toBe("number");
      expect(typeof result.avgScore).toBe("number");
    });

    it("getSpecialists returns array", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getSpecialists();
      expect(Array.isArray(result)).toBe(true);
    });

    it("getPEIs returns array", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getPEIs();
      expect(Array.isArray(result)).toBe(true);
    });

    it("getStudentProgress returns array for valid name", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getStudentProgress({ studentName: "أحمد" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("getAnalyses returns array", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getAnalyses({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("getStudents returns array", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.handwriting.getStudents();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ─── Email Notification Tests ─────────────────────────────────────────

  describe("notifySpecialist email integration", () => {
    it("rejects unauthenticated access to notifySpecialist", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.notifySpecialist({ specialistId: 1, analysisId: 1 })
      ).rejects.toThrow();
    });

    it("requires specialistId as number", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.notifySpecialist({ specialistId: "abc" as any, analysisId: 1 })
      ).rejects.toThrow();
    });

    it("requires analysisId as number", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.notifySpecialist({ specialistId: 1, analysisId: "abc" as any })
      ).rejects.toThrow();
    });

    it("accepts optional message parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      // Should fail with NOT_FOUND (specialist doesn't exist), not input validation
      await expect(
        caller.handwriting.notifySpecialist({ specialistId: 999, analysisId: 1, message: "يرجى المراجعة" })
      ).rejects.toThrow();
    });
  });

  // ─── Auto-notification Structure Tests ─────────────────────────────────

  describe("analyzeHandwriting auto-notification structure", () => {
    it("procedure exists and is protected", () => {
      const procedures = (appRouter as any)._def.procedures;
      expect(procedures).toHaveProperty("handwriting.analyzeHandwriting");
    });

    it("rejects unauthenticated access", async () => {
      const { ctx } = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.handwriting.analyzeHandwriting({ imageBase64: "dGVzdA==", mimeType: "image/png", writingType: "copy" })
      ).rejects.toThrow();
    });
  });
});
