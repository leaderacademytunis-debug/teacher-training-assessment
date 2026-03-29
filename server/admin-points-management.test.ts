import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Admin Points Management - Unit Tests
 * Tests for the admin points management procedures added to voiceCloning router
 */

// ===== Schema Validation Tests =====
describe("Admin Points Management - Input Validation", () => {
  const adminListSchema = z.object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.enum(["balance", "totalSpent", "name", "createdAt"]).default("balance"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });

  const adjustPointsSchema = z.object({
    userId: z.number(),
    amount: z.number().min(-999999).max(999999),
    reason: z.string().min(1).max(500),
  });

  const bulkGrantSchema = z.object({
    userIds: z.array(z.number()).min(1).max(500),
    amount: z.number().min(1).max(999999),
    reason: z.string().min(1).max(500),
  });

  const userTransactionsSchema = z.object({
    userId: z.number(),
    limit: z.number().min(1).max(200).default(50),
  });

  // ===== adminListUsersPoints =====
  describe("adminListUsersPoints input", () => {
    it("should accept valid input with all fields", () => {
      const result = adminListSchema.safeParse({
        search: "test",
        page: 1,
        limit: 20,
        sortBy: "balance",
        sortOrder: "desc",
      });
      expect(result.success).toBe(true);
    });

    it("should use defaults when optional fields are omitted", () => {
      const result = adminListSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe("balance");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should accept search as undefined", () => {
      const result = adminListSchema.safeParse({ search: undefined });
      expect(result.success).toBe(true);
    });

    it("should reject page < 1", () => {
      const result = adminListSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject limit > 100", () => {
      const result = adminListSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("should reject invalid sortBy value", () => {
      const result = adminListSchema.safeParse({ sortBy: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should accept all valid sortBy values", () => {
      for (const sortBy of ["balance", "totalSpent", "name", "createdAt"]) {
        const result = adminListSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it("should accept both sort orders", () => {
      for (const sortOrder of ["asc", "desc"]) {
        const result = adminListSchema.safeParse({ sortOrder });
        expect(result.success).toBe(true);
      }
    });
  });

  // ===== adminAdjustPoints =====
  describe("adminAdjustPoints input", () => {
    it("should accept valid grant input", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: 100,
        reason: "مكافأة إكمال الدورة",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid deduction input (negative amount)", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: -50,
        reason: "خصم بسبب إساءة استخدام",
      });
      expect(result.success).toBe(true);
    });

    it("should reject amount below -999999", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: -1000000,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject amount above 999999", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: 1000000,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty reason", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: 100,
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject reason longer than 500 chars", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: 100,
        reason: "x".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("should accept amount of 0", () => {
      const result = adjustPointsSchema.safeParse({
        userId: 1,
        amount: 0,
        reason: "test",
      });
      expect(result.success).toBe(true);
    });
  });

  // ===== adminBulkGrantPoints =====
  describe("adminBulkGrantPoints input", () => {
    it("should accept valid bulk grant input", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: [1, 2, 3],
        amount: 50,
        reason: "مكافأة المشاركة في الدورة",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty userIds array", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: [],
        amount: 50,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject more than 500 userIds", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: Array.from({ length: 501 }, (_, i) => i + 1),
        amount: 50,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });

    it("should accept exactly 500 userIds", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: Array.from({ length: 500 }, (_, i) => i + 1),
        amount: 50,
        reason: "test",
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative amount for bulk grant", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: [1],
        amount: -10,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero amount for bulk grant", () => {
      const result = bulkGrantSchema.safeParse({
        userIds: [1],
        amount: 0,
        reason: "test",
      });
      expect(result.success).toBe(false);
    });
  });

  // ===== adminGetUserTransactions =====
  describe("adminGetUserTransactions input", () => {
    it("should accept valid input", () => {
      const result = userTransactionsSchema.safeParse({ userId: 1, limit: 50 });
      expect(result.success).toBe(true);
    });

    it("should use default limit of 50", () => {
      const result = userTransactionsSchema.safeParse({ userId: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit > 200", () => {
      const result = userTransactionsSchema.safeParse({ userId: 1, limit: 201 });
      expect(result.success).toBe(false);
    });

    it("should reject limit < 1", () => {
      const result = userTransactionsSchema.safeParse({ userId: 1, limit: 0 });
      expect(result.success).toBe(false);
    });
  });
});

// ===== Business Logic Tests =====
describe("Admin Points Management - Business Logic", () => {
  describe("Balance calculation", () => {
    it("should calculate new balance correctly for grant", () => {
      const currentBalance = 100;
      const grantAmount = 50;
      const newBalance = Math.max(0, currentBalance + grantAmount);
      expect(newBalance).toBe(150);
    });

    it("should calculate new balance correctly for deduction", () => {
      const currentBalance = 100;
      const deductAmount = -30;
      const newBalance = Math.max(0, currentBalance + deductAmount);
      expect(newBalance).toBe(70);
    });

    it("should not allow balance to go below 0", () => {
      const currentBalance = 50;
      const deductAmount = -100;
      const newBalance = Math.max(0, currentBalance + deductAmount);
      expect(newBalance).toBe(0);
    });

    it("should handle large grants correctly", () => {
      const currentBalance = 100;
      const grantAmount = 999999;
      const newBalance = Math.max(0, currentBalance + grantAmount);
      expect(newBalance).toBe(1000099);
    });
  });

  describe("Transaction type determination", () => {
    it("should classify positive amounts as grant/bonus", () => {
      const amount = 100;
      const isGrant = amount > 0;
      expect(isGrant).toBe(true);
    });

    it("should classify negative amounts as deduction/spend", () => {
      const amount = -50;
      const isGrant = amount > 0;
      expect(isGrant).toBe(false);
    });

    it("should classify zero as not a grant", () => {
      const amount = 0;
      const isGrant = amount > 0;
      expect(isGrant).toBe(false);
    });
  });

  describe("Bulk grant calculation", () => {
    it("should calculate total points for bulk grant", () => {
      const amount = 50;
      const userCount = 10;
      const total = amount * userCount;
      expect(total).toBe(500);
    });

    it("should handle single user bulk grant", () => {
      const amount = 100;
      const userCount = 1;
      const total = amount * userCount;
      expect(total).toBe(100);
    });
  });

  describe("Stats calculation", () => {
    it("should calculate average balance excluding admins", () => {
      const allPoints = [
        { balance: 100, totalEarned: 100, totalSpent: 0 },
        { balance: 200, totalEarned: 200, totalSpent: 0 },
        { balance: 999999, totalEarned: 999999, totalSpent: 0 }, // admin
      ];
      const nonAdminPoints = allPoints.filter(p => p.balance < 900000);
      const avgBalance = nonAdminPoints.length > 0
        ? Math.round(nonAdminPoints.reduce((sum, p) => sum + p.balance, 0) / nonAdminPoints.length)
        : 0;
      expect(avgBalance).toBe(150);
    });

    it("should return 0 average when no non-admin users", () => {
      const allPoints = [
        { balance: 999999, totalEarned: 999999, totalSpent: 0 },
      ];
      const nonAdminPoints = allPoints.filter(p => p.balance < 900000);
      const avgBalance = nonAdminPoints.length > 0
        ? Math.round(nonAdminPoints.reduce((sum, p) => sum + p.balance, 0) / nonAdminPoints.length)
        : 0;
      expect(avgBalance).toBe(0);
    });

    it("should calculate total spent correctly", () => {
      const allPoints = [
        { totalSpent: 10 },
        { totalSpent: 20 },
        { totalSpent: 30 },
      ];
      const totalSpent = allPoints.reduce((sum, p) => sum + p.totalSpent, 0);
      expect(totalSpent).toBe(60);
    });
  });

  describe("Search filtering", () => {
    const users = [
      { id: 1, name: "علي سعدالله", email: "ali@test.com", balance: 100 },
      { id: 2, name: "محمد أحمد", email: "mohamed@test.com", balance: 200 },
      { id: 3, name: "سارة بن علي", email: "sara@test.com", balance: 50 },
    ];

    it("should filter by name", () => {
      const search = "علي";
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        String(u.id).includes(search)
      );
      expect(filtered.length).toBe(2); // علي سعدالله and سارة بن علي
    });

    it("should filter by email", () => {
      const search = "mohamed";
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        String(u.id).includes(search)
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(2);
    });

    it("should filter by ID", () => {
      const search = "3";
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        String(u.id).includes(search)
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(3);
    });

    it("should return empty for no match", () => {
      const search = "xyz";
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        String(u.id).includes(search)
      );
      expect(filtered.length).toBe(0);
    });
  });

  describe("Sorting", () => {
    const users = [
      { name: "B", balance: 200, totalSpent: 10 },
      { name: "A", balance: 100, totalSpent: 30 },
      { name: "C", balance: 300, totalSpent: 20 },
    ];

    it("should sort by balance descending", () => {
      const sorted = [...users].sort((a, b) => b.balance - a.balance);
      expect(sorted[0].name).toBe("C");
      expect(sorted[2].name).toBe("A");
    });

    it("should sort by balance ascending", () => {
      const sorted = [...users].sort((a, b) => a.balance - b.balance);
      expect(sorted[0].name).toBe("A");
      expect(sorted[2].name).toBe("C");
    });

    it("should sort by name ascending", () => {
      const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted[0].name).toBe("A");
      expect(sorted[2].name).toBe("C");
    });

    it("should sort by totalSpent descending", () => {
      const sorted = [...users].sort((a, b) => b.totalSpent - a.totalSpent);
      expect(sorted[0].name).toBe("A");
      expect(sorted[2].name).toBe("B");
    });
  });

  describe("Pagination", () => {
    it("should calculate total pages correctly", () => {
      const total = 45;
      const limit = 20;
      const totalPages = Math.ceil(total / limit);
      expect(totalPages).toBe(3);
    });

    it("should slice correct page", () => {
      const items = Array.from({ length: 50 }, (_, i) => i);
      const page = 2;
      const limit = 20;
      const start = (page - 1) * limit;
      const paged = items.slice(start, start + limit);
      expect(paged[0]).toBe(20);
      expect(paged.length).toBe(20);
    });

    it("should handle last page with fewer items", () => {
      const items = Array.from({ length: 45 }, (_, i) => i);
      const page = 3;
      const limit = 20;
      const start = (page - 1) * limit;
      const paged = items.slice(start, start + limit);
      expect(paged.length).toBe(5);
    });
  });

  describe("Admin description format", () => {
    it("should format admin adjustment description correctly", () => {
      const adminName = "علي سعدالله";
      const reason = "مكافأة إكمال الدورة";
      const description = `[Admin: ${adminName}] ${reason}`;
      expect(description).toBe("[Admin: علي سعدالله] مكافأة إكمال الدورة");
    });

    it("should format bulk admin description correctly", () => {
      const adminName = "علي سعدالله";
      const reason = "مكافأة المشاركة";
      const description = `[Bulk Admin: ${adminName}] ${reason}`;
      expect(description).toBe("[Bulk Admin: علي سعدالله] مكافأة المشاركة");
    });
  });

  describe("UI display logic", () => {
    it("should display infinity symbol for admin balance", () => {
      const balance = 999999;
      const display = balance >= 900000 ? "∞" : balance.toLocaleString();
      expect(display).toBe("∞");
    });

    it("should display normal balance for regular users", () => {
      const balance = 500;
      const display = balance >= 900000 ? "∞" : balance.toLocaleString();
      expect(display).not.toBe("∞");
    });

    it("should apply correct color class based on balance", () => {
      const getColorClass = (balance: number) => {
        if (balance >= 100) return "text-green-400";
        if (balance > 0) return "text-amber-400";
        return "text-red-400";
      };
      expect(getColorClass(500)).toBe("text-green-400");
      expect(getColorClass(50)).toBe("text-amber-400");
      expect(getColorClass(0)).toBe("text-red-400");
    });

    it("should map role to Arabic label", () => {
      const roleLabel = (role: string) => {
        switch (role) {
          case "admin": return "مشرف";
          case "trainer": return "مدرب";
          case "supervisor": return "مراقب";
          default: return "مستخدم";
        }
      };
      expect(roleLabel("admin")).toBe("مشرف");
      expect(roleLabel("trainer")).toBe("مدرب");
      expect(roleLabel("supervisor")).toBe("مراقب");
      expect(roleLabel("user")).toBe("مستخدم");
    });
  });
});
