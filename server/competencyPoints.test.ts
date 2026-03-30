import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { trackCompetencyPoints } from "./db";
import { users, competencyPoints } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Competency Points Tracking", () => {
  let testUserId: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        role: "teacher",
      })
      .returning();

    testUserId = user.id;
  });

  afterAll(async () => {
    if (db && testUserId) {
      // Clean up test user
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should track EDUGPT sheet points correctly", async () => {
    await trackCompetencyPoints(testUserId, "edugpt_sheet", "sheet-123", "pedagogical_sheet");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [record] = await db
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, testUserId),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    expect(record).toBeDefined();
    expect(record.totalPoints).toBeGreaterThanOrEqual(3);
    expect(record.monthlyPoints).toBeGreaterThanOrEqual(3);
  });

  it("should track test builder points correctly", async () => {
    await trackCompetencyPoints(testUserId, "test_builder", "exam-456", "teacher_exam");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [record] = await db
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, testUserId),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    expect(record).toBeDefined();
    expect(record.totalPoints).toBeGreaterThanOrEqual(5);
  });

  it("should track ultimate studio video export points", async () => {
    await trackCompetencyPoints(testUserId, "ultimate_studio", "video-789", "studio_project");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [record] = await db
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, testUserId),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    expect(record).toBeDefined();
    expect(record.totalPoints).toBeGreaterThanOrEqual(10);
  });

  it("should update competency level when points increase", async () => {
    // Track multiple actions to accumulate points
    for (let i = 0; i < 20; i++) {
      await trackCompetencyPoints(testUserId, "edugpt_sheet", `sheet-${i}`, "pedagogical_sheet");
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [record] = await db
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, testUserId),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    expect(record).toBeDefined();
    expect(record.totalPoints).toBeGreaterThanOrEqual(60);
    expect(record.level).toBeDefined();
  });

  it("should skip admin users", async () => {
    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        openId: `admin-user-${Date.now()}`,
        email: `admin-${Date.now()}@example.com`,
        role: "admin",
      })
      .returning();

    await trackCompetencyPoints(adminUser.id, "edugpt_sheet", "sheet-admin", "pedagogical_sheet");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const records = await db
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, adminUser.id),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    // Admin should not have any points
    expect(records.length).toBe(0);

    // Clean up
    await db.delete(users).where(eq(users.id, adminUser.id));
  });
});

// Import and function to help with tests
import { and } from "drizzle-orm";
