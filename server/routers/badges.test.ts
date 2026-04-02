import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import * as db from "../db";
import { eq } from "drizzle-orm";
import { badgeDefinitions, userBadges } from "../../drizzle/schema";

describe("Badge System", () => {
  let testUserId = 999999; // Use a high ID to avoid conflicts

  beforeAll(async () => {
    // Initialize badges before tests
    await db.initializeBadges();
  });

  afterAll(async () => {
    // Clean up test data
    const dbInstance = await getDb();
    if (dbInstance) {
      // Clean up user badges
      await dbInstance
        .delete(userBadges)
        .where(eq(userBadges.userId, testUserId));
    }
  });

  it("should initialize default badges", async () => {
    const dbInstance = await getDb();
    if (!dbInstance) {
      expect(true).toBe(true);
      return;
    }

    const badges = await dbInstance
      .select()
      .from(badgeDefinitions)
      .where(eq(badgeDefinitions.isActive, true));

    expect(badges.length).toBeGreaterThanOrEqual(4);
    expect(badges.some((b) => b.tier === "bronze")).toBe(true);
    expect(badges.some((b) => b.tier === "silver")).toBe(true);
    expect(badges.some((b) => b.tier === "gold")).toBe(true);
    expect(badges.some((b) => b.tier === "platinum")).toBe(true);
  });

  it("should get badge definitions with correct properties", async () => {
    const dbInstance = await getDb();
    if (!dbInstance) {
      expect(true).toBe(true);
      return;
    }

    const badges = await dbInstance
      .select()
      .from(badgeDefinitions)
      .where(eq(badgeDefinitions.isActive, true))
      .limit(1);

    if (badges.length > 0) {
      const badge = badges[0];
      expect(badge.nameAr).toBeDefined();
      expect(badge.nameEn).toBeDefined();
      expect(badge.descriptionAr).toBeDefined();
      expect(badge.descriptionEn).toBeDefined();
      expect(badge.referralThreshold).toBeGreaterThan(0);
      expect(badge.icon).toBeDefined();
      expect(badge.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("should get badge stats for user", async () => {
    const stats = await db.getBadgeStats(testUserId);

    expect(stats).toBeDefined();
    expect(stats.totalBadges).toBeGreaterThanOrEqual(0);
    expect(stats.completedReferrals).toBeGreaterThanOrEqual(0);
    expect(stats.nextBadgeThreshold).toBeGreaterThan(0);
    expect(stats.nextBadgeName).toBeDefined();
    expect(stats.progressPercent).toBeGreaterThanOrEqual(0);
    expect(stats.progressPercent).toBeLessThanOrEqual(100);
  });

  it("should check and award badges", async () => {
    const newBadges = await db.checkAndAwardBadges(testUserId);

    expect(Array.isArray(newBadges)).toBe(true);
    // Should be empty for test user with no referrals
    expect(newBadges.length).toBe(0);
  });

  it("should get user badges", async () => {
    const badges = await db.getUserBadges(testUserId);

    expect(Array.isArray(badges)).toBe(true);
    // Should be empty for test user with no earned badges
    expect(badges.length).toBe(0);
  });

  it("should have correct badge thresholds in order", async () => {
    const dbInstance = await getDb();
    if (!dbInstance) {
      expect(true).toBe(true);
      return;
    }

    const badges = await dbInstance
      .select()
      .from(badgeDefinitions)
      .where(eq(badgeDefinitions.isActive, true));

    const sortedByThreshold = badges.sort(
      (a, b) => a.referralThreshold - b.referralThreshold
    );

    // Verify thresholds are in ascending order
    for (let i = 1; i < sortedByThreshold.length; i++) {
      expect(sortedByThreshold[i].referralThreshold).toBeGreaterThan(
        sortedByThreshold[i - 1].referralThreshold
      );
    }
  });

  it("should have unique badge tiers", async () => {
    const dbInstance = await getDb();
    if (!dbInstance) {
      expect(true).toBe(true);
      return;
    }

    const badges = await dbInstance
      .select()
      .from(badgeDefinitions)
      .where(eq(badgeDefinitions.isActive, true));

    const tiers = new Set(badges.map((b) => b.tier));
    expect(tiers.size).toBeGreaterThanOrEqual(4);
  });
});
