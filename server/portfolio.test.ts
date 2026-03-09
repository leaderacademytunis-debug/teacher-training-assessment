import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-portfolio-user",
    email: "teacher@leader-academy.tn",
    name: "Test Teacher",
    arabicName: "معلم تجريبي",
    loginMethod: "manus",
    role: "user",
    firstNameAr: "معلم",
    lastNameAr: "تجريبي",
    firstNameFr: "Test",
    lastNameFr: "Teacher",
    phone: "+21612345678",
    idCardNumber: null,
    paymentReceiptUrl: null,
    schoolName: "المدرسة الابتدائية النموذجية",
    schoolLogo: null,
    registrationCompleted: true,
    registrationStatus: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("portfolio2 router", () => {
  describe("getMyPortfolio", () => {
    it("returns a portfolio object for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const portfolio = await caller.portfolio2.getMyPortfolio();

      expect(portfolio).toBeDefined();
      expect(portfolio).toHaveProperty("id");
      expect(portfolio).toHaveProperty("userId");
      expect(portfolio).toHaveProperty("isPublic");
      expect(portfolio).toHaveProperty("publicToken");
      expect(portfolio).toHaveProperty("totalLessonPlans");
    });

    it("creates portfolio on first call and returns same on second", async () => {
      const ctx = createAuthContext({ id: 9901 });
      const caller = appRouter.createCaller(ctx);

      const first = await caller.portfolio2.getMyPortfolio();
      const second = await caller.portfolio2.getMyPortfolio();

      expect(first.id).toBe(second.id);
      expect(first.publicToken).toBe(second.publicToken);
    });
  });

  describe("getStats", () => {
    it("returns stats object with expected fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.portfolio2.getStats();

      expect(stats).toHaveProperty("totalLessonPlans");
      expect(stats).toHaveProperty("totalExams");
      expect(stats).toHaveProperty("totalImages");
      expect(stats).toHaveProperty("totalCertificates");
      expect(stats).toHaveProperty("totalEvaluations");
      expect(stats).toHaveProperty("totalDigitizedDocs");
      expect(stats).toHaveProperty("totalConversations");
      expect(stats).toHaveProperty("subjectBreakdown");
      expect(typeof stats.totalLessonPlans).toBe("number");
      expect(typeof stats.totalExams).toBe("number");
    });
  });

  describe("updateProfile", () => {
    it("updates bio and specializations", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio2.updateProfile({
        bio: "معلم لغة عربية ذو خبرة 15 سنة",
        specializations: ["اللغة العربية", "التربية الإسلامية"],
        yearsOfExperience: 15,
        currentSchool: "المدرسة الابتدائية النموذجية",
        region: "تونس العاصمة",
      });

      expect(result).toEqual({ success: true });

      // Verify the update persisted
      const portfolio = await caller.portfolio2.getMyPortfolio();
      expect(portfolio.bio).toBe("معلم لغة عربية ذو خبرة 15 سنة");
      expect(portfolio.specializations).toContain("اللغة العربية");
      expect(portfolio.yearsOfExperience).toBe(15);
    });
  });

  describe("togglePublic", () => {
    it("toggles portfolio visibility and returns token", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Enable public
      const result = await caller.portfolio2.togglePublic({ isPublic: true });
      expect(result.isPublic).toBe(true);
      expect(result.publicToken).toBeTruthy();

      // Verify
      const portfolio = await caller.portfolio2.getMyPortfolio();
      expect(portfolio.isPublic).toBe(true);

      // Disable public
      const result2 = await caller.portfolio2.togglePublic({ isPublic: false });
      expect(result2.isPublic).toBe(false);
    });
  });

  describe("getPublicPortfolio", () => {
    it("returns public portfolio when token is valid and public", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Make portfolio public
      const toggleResult = await caller.portfolio2.togglePublic({ isPublic: true });
      const token = toggleResult.publicToken!;

      // Access as public
      const publicCtx = createPublicContext();
      const publicCaller = appRouter.createCaller(publicCtx);

      const publicPortfolio = await publicCaller.portfolio2.getPublicPortfolio({ token });
      expect(publicPortfolio).toBeDefined();
      expect(publicPortfolio.isPublic).toBe(true);
      expect(publicPortfolio.userName).toBeTruthy();
    });

    it("throws NOT_FOUND for invalid token", async () => {
      const publicCtx = createPublicContext();
      const publicCaller = appRouter.createCaller(publicCtx);

      await expect(
        publicCaller.portfolio2.getPublicPortfolio({ token: "nonexistent-token-12345" })
      ).rejects.toThrow();
    });

    it("throws NOT_FOUND when portfolio is private", async () => {
      const ctx = createAuthContext({ id: 9902 });
      const caller = appRouter.createCaller(ctx);

      // Create portfolio and keep it private
      const portfolio = await caller.portfolio2.getMyPortfolio();
      await caller.portfolio2.togglePublic({ isPublic: false });

      // Try to access as public
      const publicCtx = createPublicContext();
      const publicCaller = appRouter.createCaller(publicCtx);

      await expect(
        publicCaller.portfolio2.getPublicPortfolio({ token: portfolio.publicToken! })
      ).rejects.toThrow();
    });
  });

  describe("getCertificates", () => {
    it("returns an array of certificates", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const certs = await caller.portfolio2.getCertificates();
      expect(Array.isArray(certs)).toBe(true);
    });
  });

  describe("getRecentActivity", () => {
    it("returns an array of activities with limit", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const activities = await caller.portfolio2.getRecentActivity({ limit: 5 });
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeLessThanOrEqual(5);
    });
  });
});
