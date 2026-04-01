/**
 * Analytics Router - Real database queries for admin dashboard
 * Provides data for:
 * 1. Revenue analytics (monthly income, plan distribution, 6-month trends)
 * 2. User analytics (registration, active users, plan distribution)
 * 3. Tool usage analytics (top tools, monthly comparison)
 * 4. Course analytics (enrollments, completion rates, certificates)
 */

import { protectedProcedure, router, staffProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  users,
  servicePermissions,
  aiActivityLog,
  paymentRequests,
  courses,
  enrollments,
  certificates,
  toolUsageTracking,
  analytics,
} from "../../drizzle/schema";
import { eq, desc, asc, and, sql, count, like, or, gte, lte, between, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminOnlyProcedure = staffProcedure;

// Helper: get current month string
function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Helper: get previous month string
function getPreviousMonthYear(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Helper: get last 6 months
function getLast6Months(): string[] {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export const analyticsRouter = router({
  /**
   * Track page view (public - no auth required)
   */
  trackPageView: publicProcedure
    .input(
      z.object({
        page: z.string(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;
      const userId = ctx.user?.id || null;
      await database.insert(analytics).values({
        userId,
        eventType: "page_view",
        page: input.page,
        referrer: input.referrer,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  /**
   * Track demo access
   */
  trackDemoAccess: publicProcedure
    .input(z.object({ page: z.string() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      await database.insert(analytics).values({
        userId: null,
        eventType: "demo_access",
        page: input.page,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  /**
   * Get demo access statistics
   */
  getDemoAccessStats: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const stats = await database
      .select({
        totalDemoAccess: count().as("count"),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ip_address)`.as("unique"),
      })
      .from(analytics)
      .where(eq(analytics.eventType, "demo_access"));

    return stats[0] || { totalDemoAccess: 0, uniqueVisitors: 0 };
  }),

  /**
   * Check milestone alerts
   */
  checkMilestoneAlerts: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const demoCount = await database
      .select({ count: count() })
      .from(analytics)
      .where(eq(analytics.eventType, "demo_access"));

    const total = demoCount[0]?.count || 0;
    const milestones = [100, 500, 1000, 5000, 10000];
    const triggeredMilestone = milestones.find((m) => total >= m);

    return {
      currentCount: total,
      triggeredMilestone,
      readyForLaunch: total >= 1000,
    };
  }),

  /**
   * Get enrollment trend (last 30 days)
   */
  getEnrollmentTrend: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const trend = await database
      .select({
        date: sql<string>`DATE(${enrollments.enrolledAt})`,
        count: count().as("count"),
      })
      .from(enrollments)
      .where(gte(enrollments.enrolledAt, last30Days))
      .groupBy(sql`DATE(${enrollments.enrolledAt})`)
      .orderBy(asc(sql`DATE(${enrollments.enrolledAt})`));

    return trend.map((t) => ({
      date: t.date,
      enrollments: t.count,
    }));
  }),
});
