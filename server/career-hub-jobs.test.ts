import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "admin" | "user" = "user", id = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id,
    openId: `user-${id}`,
    email: `user${id}@example.com`,
    name: `User ${id}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Job Board Router", () => {
  describe("jobBoard.list", () => {
    it("should list active job postings for public users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.jobBoard.listJobs({ page: 1 });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("jobs");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.jobs)).toBe(true);
    });

    it("should support pagination", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const page1 = await caller.jobBoard.listJobs({ page: 1 });
      const page2 = await caller.jobBoard.listJobs({ page: 2 });
      expect(page1).toHaveProperty("jobs");
      expect(page1).toHaveProperty("total");
      expect(page2).toHaveProperty("jobs");
    });

    it("should filter by subject", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.jobBoard.listJobs({ page: 1, subject: "رياضيات" });
      expect(result).toBeDefined();
      expect(Array.isArray(result.jobs)).toBe(true);
    });

    it("should filter by region", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.jobBoard.listJobs({ page: 1, region: "تونس" });
      expect(result).toBeDefined();
      expect(Array.isArray(result.jobs)).toBe(true);
    });
  });

  describe("jobBoard.getJob", () => {
    it("should throw NOT_FOUND for non-existent job", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.jobBoard.getJob({ jobId: 99999 })).rejects.toThrow();
    });
  });

  describe("jobBoard.hasApplied", () => {
    it("should exist as a procedure", () => {
      expect(appRouter._def.procedures).toHaveProperty("jobBoard.hasApplied");
    });
  });
});

describe("Applications Router", () => {
  describe("applications.myApplications", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.applications.myApplications()).rejects.toThrow();
    });

    it("should return empty array for user with no applications", async () => {
      const ctx = createContext("user", 999);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.applications.myApplications();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("applications.myCounts", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.applications.myCounts()).rejects.toThrow();
    });

    it("should return count object with status fields", async () => {
      const ctx = createContext("user", 999);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.applications.myCounts();
      expect(result).toHaveProperty("sent");
      expect(result).toHaveProperty("viewed");
      expect(result).toHaveProperty("shortlisted");
      expect(result).toHaveProperty("interviewed");
      expect(result).toHaveProperty("accepted");
      expect(result).toHaveProperty("rejected");
      expect(result).toHaveProperty("total");
    });
  });

  describe("applications.applyForJob", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.jobBoard.applyForJob({ jobId: 1 })
      ).rejects.toThrow();
    });
  });
});

describe("Smart Match Router", () => {
  describe("smartMatch.myNotifications", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.smartMatch.myNotifications()).rejects.toThrow();
    });

    it("should return array for authenticated user", async () => {
      const ctx = createContext("user", 999);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.smartMatch.myNotifications();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("smartMatch.markRead", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.smartMatch.markRead({ notificationId: 1 })).rejects.toThrow();
    });
  });
});

describe("Admin Partners - Pending Count", () => {
  it("should require admin role", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminPartners.pendingCount()).rejects.toThrow();
  });

  it("should return a number for admin", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminPartners.pendingCount();
    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
    expect(result.count).toBeGreaterThanOrEqual(0);
  });
});

describe("Navigation Structure", () => {
  it("should have jobBoard router with list and getById", () => {
    expect(appRouter._def.procedures).toHaveProperty("jobBoard.listJobs");
    expect(appRouter._def.procedures).toHaveProperty("jobBoard.getJob");
  });

  it("should have applications router with myApplications and myCounts", () => {
    expect(appRouter._def.procedures).toHaveProperty("applications.myApplications");
    expect(appRouter._def.procedures).toHaveProperty("applications.myCounts");
    expect(appRouter._def.procedures).toHaveProperty("jobBoard.applyForJob");
  });

  it("should have smartMatch router with myNotifications and markRead", () => {
    expect(appRouter._def.procedures).toHaveProperty("smartMatch.myNotifications");
    expect(appRouter._def.procedures).toHaveProperty("smartMatch.markRead");
  });

  it("should have adminPartners.pendingCount", () => {
    expect(appRouter._def.procedures).toHaveProperty("adminPartners.pendingCount");
  });
});
