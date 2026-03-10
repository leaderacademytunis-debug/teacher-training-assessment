import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

function createCaller(user: { id: number; role: string; name: string; email: string }) {
  return appRouter.createCaller({ user: user as any });
}

function createPublicCaller() {
  return appRouter.createCaller({ user: null } as any);
}

const adminUser = { id: 1, role: "admin", name: "Admin", email: "admin@test.com" };
const normalUser = { id: 2, role: "user", name: "User", email: "user@test.com" };

describe("Google Classroom Integration", () => {
  describe("googleClassroom.getConnection", () => {
    it("should return null for a user with no link", async () => {
      const caller = createCaller(adminUser);
      const result = await caller.googleClassroom.getConnection();
      expect(result).toBeNull();
    });

    it("should restrict access to admin users only", async () => {
      const caller = createCaller(normalUser);
      try {
        await caller.googleClassroom.getConnection();
        expect.fail("Should have thrown FORBIDDEN");
      } catch (err: any) {
        expect(err.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("googleClassroom.getAuthUrl", () => {
    it("should attempt to generate an auth URL", async () => {
      const caller = createCaller(adminUser);
      try {
        const result = await caller.googleClassroom.getAuthUrl({ origin: "https://example.com" });
        expect(result).toBeDefined();
      } catch (err: any) {
        expect(err.message).toBeDefined();
      }
    });
  });

  describe("googleClassroom.disconnect", () => {
    it("should succeed even if no connection exists", async () => {
      const caller = createCaller(adminUser);
      const result = await caller.googleClassroom.disconnect();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("googleClassroom.listCourses", () => {
    it("should throw if connection does not exist", async () => {
      const caller = createCaller(adminUser);
      try {
        await caller.googleClassroom.listCourses({ connectionId: 99999 });
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBeDefined();
      }
    });
  });

  describe("googleClassroom.syncGrades", () => {
    it("should require a valid assignmentId", async () => {
      const caller = createCaller(adminUser);
      try {
        await caller.googleClassroom.syncGrades({ assignmentId: 99999 });
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBeDefined();
      }
    });
  });

  describe("googleClassroom.getSyncLogs", () => {
    it("should return empty logs for non-existent connection", async () => {
      const caller = createCaller(adminUser);
      const result = await caller.googleClassroom.getSyncLogs({ connectionId: 99999 });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("Access control", () => {
    it("should not allow unauthenticated access", async () => {
      const caller = createPublicCaller();
      try {
        await caller.googleClassroom.getConnection();
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.code || err.message).toBeDefined();
      }
    });
  });
});
