import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@leaderacademy.school",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
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

describe("adminControl router", () => {
  describe("access control", () => {
    it("rejects non-admin users from getOverviewStats", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.adminControl.getOverviewStats()).rejects.toThrow(
        /Access denied|FORBIDDEN/
      );
    });

    it("rejects non-admin users from getToolConfigs", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.adminControl.getToolConfigs()).rejects.toThrow(
        /Access denied|FORBIDDEN/
      );
    });

    it("rejects non-admin users from listUsersAdvanced", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.adminControl.listUsersAdvanced({ page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" })
      ).rejects.toThrow(/Access denied|FORBIDDEN/);
    });

    it("rejects non-admin users from getSubscriptionStats", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.adminControl.getSubscriptionStats()).rejects.toThrow(
        /Access denied|FORBIDDEN/
      );
    });

    it("rejects non-admin users from sendNotification", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.adminControl.sendNotification({ titleAr: "test", messageAr: "test" })
      ).rejects.toThrow(/Access denied|FORBIDDEN/);
    });
  });

  describe("admin access", () => {
    it("allows admin to call getOverviewStats", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getOverviewStats();
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("todayUsers");
      expect(result).toHaveProperty("activeUsers7d");
      expect(result).toHaveProperty("monthlyOperations");
      expect(result).toHaveProperty("monthlyImages");
      expect(result).toHaveProperty("pendingPayments");
      expect(typeof result.totalUsers).toBe("number");
    });

    it("allows admin to call getToolConfigs", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getToolConfigs();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call listUsersAdvanced", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.listUsersAdvanced({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.users)).toBe(true);
    });

    it("allows admin to call getSubscriptionStats", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getSubscriptionStats();
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("paidUsers");
      expect(result).toHaveProperty("tierCounts");
      expect(result).toHaveProperty("paymentStats");
    });

    it("allows admin to call getDailyActivity", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getDailyActivity();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getToolUsageRanking", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getToolUsageRanking();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getUserRegistrationTrend", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getUserRegistrationTrend();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getConversionRate", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getConversionRate();
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("paidUsers");
      expect(result).toHaveProperty("conversionRate");
      expect(typeof result.conversionRate).toBe("number");
    });

    it("allows admin to call getSettings", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getSettings();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getMessages", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getMessages();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getGlobalUsageOverview", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getGlobalUsageOverview();
      expect(Array.isArray(result)).toBe(true);
    });

    it("allows admin to call getPricingPlans", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.getPricingPlans();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("usage limit checking (user-accessible)", () => {
    it("allows any authenticated user to check usage limit", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.checkUsageLimit({ toolKey: "exam_builder" });
      expect(result).toHaveProperty("allowed");
      expect(result).toHaveProperty("remaining");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("message");
    });

    it("returns allowed=true for non-existent tool key", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.checkUsageLimit({ toolKey: "nonexistent_tool" });
      expect(result.allowed).toBe(true);
    });
  });

  describe("seed tool configs", () => {
    it("allows admin to seed tool configurations", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.adminControl.seedToolConfigs();
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("count");
    });
  });
});
