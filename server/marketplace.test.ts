import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-marketplace-user",
    email: "teacher@example.com",
    name: "Test Teacher",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
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

describe("marketplace", () => {
  describe("marketplace.list", () => {
    it("returns items list with total count (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.list({});
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("supports filtering by subject", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.list({ subject: "الرياضيات" });
      expect(result).toHaveProperty("items");
      expect(Array.isArray(result.items)).toBe(true);
    });

    it("supports filtering by content type", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.list({ contentType: "lesson_plan" });
      expect(result).toHaveProperty("items");
    });

    it("supports search query", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.list({ search: "أعداد" });
      expect(result).toHaveProperty("items");
    });

    it("supports sorting options", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      for (const sortBy of ["ranking", "newest", "rating", "downloads"] as const) {
        const result = await caller.marketplace.list({ sortBy });
        expect(result).toHaveProperty("items");
      }
    });

    it("supports pagination", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.list({ limit: 5, offset: 0 });
      expect(result).toHaveProperty("items");
      expect(result.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe("marketplace.getStats", () => {
    it("returns marketplace statistics (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.marketplace.getStats();
      expect(stats).toHaveProperty("totalItems");
      expect(stats).toHaveProperty("totalDownloads");
      expect(stats).toHaveProperty("totalContributors");
      expect(stats).toHaveProperty("topSubjects");
      expect(typeof stats.totalItems).toBe("number");
    });
  });

  describe("marketplace.publish", () => {
    it("publishes content with watermark (authenticated)", async () => {
      const ctx = createAuthContext({ name: "أحمد المعلم" });
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.publish({
        title: "جذاذة درس الأعداد ذات 5 أرقام",
        contentType: "lesson_plan",
        subject: "الرياضيات",
        grade: "السنة الخامسة ابتدائي",
        content: "سند: في مكتبة المدرسة وجد أحمد كتاباً ثمنه 12345 مليماً...",
        difficulty: "medium",
        tags: ["أعداد", "رياضيات", "سنة خامسة"],
      });
      expect(result).toBeTruthy();
      expect(result?.title).toBe("جذاذة درس الأعداد ذات 5 أرقام");
      // Verify watermark was added
      expect(result?.content).toContain("Leader Academy");
      expect(result?.content).toContain("أحمد المعلم");
      expect(result?.status).toBe("approved");
    });

    it("rejects publish with missing required fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.marketplace.publish({
          title: "ab", // too short (min 3)
          contentType: "lesson_plan",
          subject: "الرياضيات",
          grade: "السنة الخامسة",
          content: "test",
        })
      ).rejects.toThrow();
    });
  });

  describe("marketplace.myItems", () => {
    it("returns user's published items (authenticated)", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const items = await caller.marketplace.myItems();
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("marketplace.rate", () => {
    it("prevents rating own content", async () => {
      const ctx = createAuthContext({ id: 1 });
      const caller = appRouter.createCaller(ctx);
      
      // First publish something
      const item = await caller.marketplace.publish({
        title: "محتوى للاختبار",
        contentType: "exam",
        subject: "اللغة العربية",
        grade: "السنة الرابعة ابتدائي",
        content: "محتوى الاختبار...",
      });
      
      // Try to rate own content
      if (item) {
        await expect(
          caller.marketplace.rate({ itemId: item.id, rating: 5 })
        ).rejects.toThrow("لا يمكنك تقييم محتواك الخاص");
      }
    });
  });

  describe("marketplace.recordDownload", () => {
    it("records a download (authenticated)", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Publish first
      const item = await caller.marketplace.publish({
        title: "محتوى للتحميل",
        contentType: "lesson_plan",
        subject: "الإيقاظ العلمي",
        grade: "السنة الثالثة ابتدائي",
        content: "محتوى الجذاذة...",
      });
      
      if (item) {
        const result = await caller.marketplace.recordDownload({ itemId: item.id, format: "pdf" });
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe("marketplace.getContributor", () => {
    it("returns contributor profile (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.getContributor({ userId: 1 });
      // May return null if user doesn't exist in DB, but should not throw
      expect(result).toBeDefined();
    });
  });

  describe("marketplace.featured", () => {
    it("returns featured items (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.featured({ limit: 6 });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeLessThanOrEqual(6);
    });

    it("returns featured items with default limit", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.marketplace.featured();
      expect(result).toHaveProperty("items");
    });
  });

  describe("marketplace.quickPublish", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.marketplace.quickPublish({
          sourceType: "lesson_plan",
          sourceId: 1,
          title: "\u062c\u0630\u0627\u0630\u0629 \u0644\u0644\u0646\u0634\u0631",
          subject: "\u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0627\u062a",
          grade: "\u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062e\u0627\u0645\u0633\u0629",
        })
      ).rejects.toThrow();
    });
  });

  describe("marketplace.delete", () => {
    it("allows deleting own content", async () => {
      const ctx = createAuthContext({ id: 1 });
      const caller = appRouter.createCaller(ctx);
      
      // Publish first
      const item = await caller.marketplace.publish({
        title: "محتوى للحذف",
        contentType: "other",
        subject: "التربية الفنية",
        grade: "السنة الأولى ابتدائي",
        content: "محتوى...",
      });
      
      if (item) {
        const result = await caller.marketplace.delete({ id: item.id });
        expect(result).toEqual({ success: true });
      }
    });

    it("prevents deleting others' content", async () => {
      const ctx1 = createAuthContext({ id: 1 });
      const caller1 = appRouter.createCaller(ctx1);
      
      const item = await caller1.marketplace.publish({
        title: "محتوى محمي",
        contentType: "exam",
        subject: "الرياضيات",
        grade: "السنة السادسة ابتدائي",
        content: "محتوى...",
      });
      
      if (item) {
        const ctx2 = createAuthContext({ id: 2, role: "user" });
        const caller2 = appRouter.createCaller(ctx2);
        await expect(
          caller2.marketplace.delete({ id: item.id })
        ).rejects.toThrow();
      }
    });
  });
});
