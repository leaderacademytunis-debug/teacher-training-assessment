import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for Follow-Up Reports and Progress Evaluator routers
 * These tests verify the router structure, input validation, and basic functionality
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// ===== FOLLOW-UP REPORTS ROUTER TESTS =====
describe("followUpReports router", () => {
  it("router has all expected procedures", () => {
    const routerDef = appRouter._def.procedures;
    // Check that followUpReports procedures exist
    expect(routerDef).toHaveProperty("followUpReports.getUserTier");
    expect(routerDef).toHaveProperty("followUpReports.getHistory");
    expect(routerDef).toHaveProperty("followUpReports.getStats");
    expect(routerDef).toHaveProperty("followUpReports.generate");
    expect(routerDef).toHaveProperty("followUpReports.delete");
  });

  it("rejects unauthenticated access to getUserTier", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.followUpReports.getUserTier()).rejects.toThrow();
  });

  it("rejects unauthenticated access to getHistory", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.followUpReports.getHistory()).rejects.toThrow();
  });

  it("rejects unauthenticated access to generate", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.followUpReports.generate({
        studentName: "أحمد",
        difficultyType: "dyslexia",
        reportPeriod: "شهر أكتوبر",
        assessmentAreas: [
          { area: "reading", score: 6, maxScore: 10, notes: "" },
          { area: "writing", score: 5, maxScore: 10, notes: "" },
        ],
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated access to delete", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.followUpReports.delete({ id: 1 })).rejects.toThrow();
  });
});

// ===== PROGRESS EVALUATOR ROUTER TESTS =====
describe("progressEvaluator router", () => {
  it("router has all expected procedures", () => {
    const routerDef = appRouter._def.procedures;
    // Check that progressEvaluator procedures exist
    expect(routerDef).toHaveProperty("progressEvaluator.getUserTier");
    expect(routerDef).toHaveProperty("progressEvaluator.getHistory");
    expect(routerDef).toHaveProperty("progressEvaluator.getStats");
    expect(routerDef).toHaveProperty("progressEvaluator.generate");
    expect(routerDef).toHaveProperty("progressEvaluator.delete");
  });

  it("rejects unauthenticated access to getUserTier", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progressEvaluator.getUserTier()).rejects.toThrow();
  });

  it("rejects unauthenticated access to getHistory", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progressEvaluator.getHistory()).rejects.toThrow();
  });

  it("rejects unauthenticated access to generate", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.progressEvaluator.generate({
        studentName: "أحمد",
        difficultyType: "dyslexia",
        evaluationStartDate: "2025-09-01",
        evaluationEndDate: "2025-12-01",
        assessmentData: [
          {
            date: "2025-09-15",
            label: "التقييم 1",
            scores: { reading: 3, writing: 4, math: 5, attention: 4, social: 6, motivation: 5 },
          },
          {
            date: "2025-12-01",
            label: "التقييم 2",
            scores: { reading: 5, writing: 5, math: 6, attention: 5, social: 7, motivation: 6 },
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated access to delete", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progressEvaluator.delete({ id: 1 })).rejects.toThrow();
  });

  it("validates generate input - requires at least 2 assessment points", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.progressEvaluator.generate({
        studentName: "أحمد",
        difficultyType: "dyslexia",
        evaluationStartDate: "2025-09-01",
        evaluationEndDate: "2025-12-01",
        assessmentData: [
          {
            date: "2025-09-15",
            label: "التقييم 1",
            scores: { reading: 3, writing: 4, math: 5, attention: 4, social: 6, motivation: 5 },
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("validates generate input - requires student name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.progressEvaluator.generate({
        studentName: "",
        difficultyType: "dyslexia",
        evaluationStartDate: "2025-09-01",
        evaluationEndDate: "2025-12-01",
        assessmentData: [
          {
            date: "2025-09-15",
            label: "التقييم 1",
            scores: { reading: 3, writing: 4, math: 5, attention: 4, social: 6, motivation: 5 },
          },
          {
            date: "2025-12-01",
            label: "التقييم 2",
            scores: { reading: 5, writing: 5, math: 6, attention: 5, social: 7, motivation: 6 },
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("validates score range (0-10)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.progressEvaluator.generate({
        studentName: "أحمد",
        difficultyType: "dyslexia",
        evaluationStartDate: "2025-09-01",
        evaluationEndDate: "2025-12-01",
        assessmentData: [
          {
            date: "2025-09-15",
            label: "التقييم 1",
            scores: { reading: 15, writing: 4, math: 5, attention: 4, social: 6, motivation: 5 },
          },
          {
            date: "2025-12-01",
            label: "التقييم 2",
            scores: { reading: 5, writing: 5, math: 6, attention: 5, social: 7, motivation: 6 },
          },
        ],
      })
    ).rejects.toThrow();
  });
});
