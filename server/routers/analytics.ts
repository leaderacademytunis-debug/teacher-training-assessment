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
        pageUrl: z.string(),
        pageTitle: z.string().optional(),
        eventType: z.string().default("page_view"),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
        sessionId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(analytics).values({
          userId: ctx.user?.id,
          pageUrl: input.pageUrl,
          pageTitle: input.pageTitle,
          eventType: input.eventType,
          referrer: input.referrer,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          sessionId: input.sessionId,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        });

        return { success: true };
      } catch (error) {
        console.error("Analytics tracking error:", error);
        return { success: false };
      }
    }),

  /**
   * Track demo access (unauthenticated talent radar views)
   */
  trackDemoAccess: publicProcedure
    .input(
      z.object({
        pageUrl: z.string(),
        sessionId: z.string(),
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(analytics).values({
          pageUrl: input.pageUrl,
          pageTitle: "Demo - Talent Radar",
          eventType: "demo_access",
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          sessionId: input.sessionId,
          metadata: JSON.stringify({ demoAccess: true }),
        });

        return { success: true };
      } catch (error) {
        console.error("Demo access tracking error:", error);
        return { success: false };
      }
    }),

  /**
   * Get demo access statistics (admin only)
   */
  getDemoAccessStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin" && ctx.user?.role !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total demo visits
    const totalDemoVisits = await db
      .select({ count: count() })
      .from(analytics)
      .where(eq(analytics.eventType, "demo_access"));

    // Demo visits today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const demoVisitsToday = await db
      .select({ count: count() })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, "demo_access"),
          gte(analytics.createdAt, today)
        )
      );

    // Average daily demo visits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysVisits = await db
      .select({ count: count() })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, "demo_access"),
          gte(analytics.createdAt, thirtyDaysAgo)
        )
      );

    const avgDaily = Math.round((last30DaysVisits[0]?.count || 0) / 30);

    // Demo visits by day (last 30 days)
    const demoTrend = await db
      .select({
        date: sql<string>`DATE(${analytics.createdAt})`,
        count: count().as("count"),
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, "demo_access"),
          gte(analytics.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${analytics.createdAt})`)
      .orderBy(asc(sql`DATE(${analytics.createdAt})`));

    return {
      totalDemoVisits: totalDemoVisits[0]?.count || 0,
      demoVisitsToday: demoVisitsToday[0]?.count || 0,
      avgDailyVisits: avgDaily,
      trend: demoTrend.map((d) => ({
        date: d.date,
        visits: d.count,
      })),
    };
  }),

  /**
   * Get total registered users count (for demo banner)
   */
  getTotalUsersCount: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }),

  /**
   * Check for demo access milestone alerts (admin only)
   */
  checkMilestoneAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin" && ctx.user?.role !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const totalDemoVisits = await db
      .select({ count: count() })
      .from(analytics)
      .where(eq(analytics.eventType, "demo_access"));

    const demoCount = totalDemoVisits[0]?.count || 0;
    const milestones = [100, 500, 1000, 5000, 10000];
    const alerts = [];

    for (const milestone of milestones) {
      if (demoCount >= milestone) {
        alerts.push({
          milestone,
          reached: true,
          message: `تم تجاوز ${milestone} زيارة تجريبية!`,
          actionRequired: milestone === 1000,
        });
      }
    }

    return {
      totalDemoVisits: demoCount,
      alerts,
      launchReady: demoCount >= 1000,
    };
  }),

  // ============================================
  // REVENUE ANALYTICS
  // ============================================

  getMonthlyRevenue: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const currentMonth = getCurrentMonthYear();
    const previousMonth = getPreviousMonthYear();

    // Get current month revenue from approved payments
    const currentRevenue = await database
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${paymentRequests.amount} AS DECIMAL(10,2))), 0)`,
      })
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.status, "approved"),
          sql`DATE_FORMAT(${paymentRequests.reviewedAt}, '%Y-%m') = ${currentMonth}`
        )
      );

    // Get previous month revenue
    const previousRevenue = await database
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${paymentRequests.amount} AS DECIMAL(10,2))), 0)`,
      })
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.status, "approved"),
          sql`DATE_FORMAT(${paymentRequests.reviewedAt}, '%Y-%m') = ${previousMonth}`
        )
      );

    const current = parseFloat(currentRevenue[0]?.total?.toString() || "0");
    const previous = parseFloat(previousRevenue[0]?.total?.toString() || "0");
    const percentChange = previous === 0 ? 0 : ((current - previous) / previous) * 100;

    return {
      currentMonth: current,
      previousMonth: previous,
      percentChange: Math.round(percentChange * 10) / 10,
      trend: current >= previous ? "up" : "down",
    };
  }),

  getPlanDistribution: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    const distribution = await database
      .select({
        tier: servicePermissions.tier,
        count: count().as("count"),
      })
      .from(servicePermissions)
      .groupBy(servicePermissions.tier);

    return distribution.map((d) => ({
      plan: d.tier,
      count: d.count,
      percentage: 0, // Will be calculated on frontend
    }));
  }),

  getRevenueTrend: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const months = getLast6Months();

    const trend = await Promise.all(
      months.map(async (month) => {
        const result = await database
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${paymentRequests.amount} AS DECIMAL(10,2))), 0)`,
          })
          .from(paymentRequests)
          .where(
            and(
              eq(paymentRequests.status, "approved"),
              sql`DATE_FORMAT(${paymentRequests.reviewedAt}, '%Y-%m') = ${month}`
            )
          );

        return {
          month: month.split("-")[1],
          revenue: parseFloat(result[0]?.total?.toString() || "0"),
        };
      })
    );

    return trend;
  }),

  // ============================================
  // USER ANALYTICS
  // ============================================

  getUserStats: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    // Total users
    const totalUsers = await database.select({ count: count() }).from(users);

    // New users this month
    const currentMonth = getCurrentMonthYear();
    const newUsers = await database
      .select({ count: count() })
      .from(users)
      .where(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m') = ${currentMonth}`);

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await database
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastSignedIn, thirtyDaysAgo));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      newThisMonth: newUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
    };
  }),

  getUserPlanDistribution: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    const distribution = await database
      .select({
        tier: servicePermissions.tier,
        count: count().as("count"),
      })
      .from(servicePermissions)
      .groupBy(servicePermissions.tier);

    return distribution;
  }),

  getNewRegistrations: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // Get registrations by day for last 30 days
    const registrations = await database
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count().as("count"),
      })
      .from(users)
      .where(gte(users.createdAt, last30Days))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(asc(sql`DATE(${users.createdAt})`));

    return registrations.map((r) => ({
      date: r.date,
      registrations: r.count,
    }));
  }),

  // ============================================
  // TOOL USAGE ANALYTICS
  // ============================================

  getTopTools: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const currentMonth = getCurrentMonthYear();

    // Get top 5 tools this month
    const topTools = await database
      .select({
        tool: aiActivityLog.activityType,
        count: count().as("count"),
      })
      .from(aiActivityLog)
      .where(sql`DATE_FORMAT(${aiActivityLog.createdAt}, '%Y-%m') = ${currentMonth}`)
      .groupBy(aiActivityLog.activityType)
      .orderBy(desc(count()))
      .limit(5);

    // Get top 5 tools last month for comparison
    const previousMonth = getPreviousMonthYear();
    const previousTopTools = await database
      .select({
        tool: aiActivityLog.activityType,
        count: count().as("count"),
      })
      .from(aiActivityLog)
      .where(sql`DATE_FORMAT(${aiActivityLog.createdAt}, '%Y-%m') = ${previousMonth}`)
      .groupBy(aiActivityLog.activityType)
      .orderBy(desc(count()))
      .limit(5);

    // Create comparison map
    const previousMap = new Map(previousTopTools.map((t) => [t.tool, t.count]));

    return topTools.map((tool) => ({
      tool: tool.tool,
      count: tool.count,
      previousCount: previousMap.get(tool.tool) || 0,
      change: tool.count - (previousMap.get(tool.tool) || 0),
    }));
  }),

  // ============================================
  // COURSE ANALYTICS
  // ============================================

  getCourseStats: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    // Get all courses with enrollment stats
    const courseStats = await database
      .select({
        courseId: courses.id,
        courseName: courses.titleAr,
        enrollmentCount: count(enrollments.id).as("enrollmentCount"),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .groupBy(courses.id, courses.titleAr);

    // Get total certificates
    const totalCertificates = await database.select({ count: count() }).from(certificates);

    // Get completion rates
    const completionStats = await database
      .select({
        courseId: enrollments.courseId,
        total: count().as("total"),
        completed: count(
          sql`CASE WHEN ${enrollments.status} = 'completed' THEN 1 END`
        ).as("completed"),
      })
      .from(enrollments)
      .groupBy(enrollments.courseId);

    return {
      courses: courseStats,
      totalCertificates: totalCertificates[0]?.count || 0,
      completionStats: completionStats,
    };
  }),

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
