/**
 * Admin Competency Statistics Router
 * Provides endpoints for admin dashboard competency statistics
 */

import { router, staffProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, competencyPoints, weeklyChallenges, userChallengeProgress } from "../../drizzle/schema";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";
import { runMonthlyEmailCronJob } from "../jobs/monthlyEmailCronJob";

export const adminCompetencyStatsRouter = router({
  /**
   * Get comprehensive competency statistics for admin dashboard
   */
  getCompetencyStats: staffProcedure.query(async () => {
    const database = (await getDb())!;

    // Get current month start date
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // 1. Get all users with competency points
    const usersWithPoints = await database
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        totalPoints: competencyPoints.totalPoints,
        level: competencyPoints.level,
      })
      .from(users)
      .leftJoin(competencyPoints, eq(users.id, competencyPoints.userId))
      .where(eq(users.role, "user"));

    // 2. Calculate level distribution
    const levelDistribution = {
      beginner: usersWithPoints.filter((u) => !u.level || u.level === "مبتدئ").length,
      intermediate: usersWithPoints.filter((u) => u.level === "متطور").length,
      expert: usersWithPoints.filter((u) => u.level === "خبير").length,
      master: usersWithPoints.filter((u) => u.level === "ماهر رقمي").length,
    };

    // 3. Get total points distributed this month
    const monthlyPointsResult = await database
      .select({
        total: sql<number>`SUM(points_awarded)`,
      })
      .from(sql`competency_transactions`)
      .where(
        sql`DATE(created_at) >= DATE(${monthStart})`
      );

    const totalPointsThisMonth = monthlyPointsResult[0]?.total || 0;

    // 4. Get active teachers count (logged in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeTeachersResult = await database
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "user"),
          gte(users.lastLoginAt, thirtyDaysAgo)
        )
      );

    const activeTeachersCount = activeTeachersResult[0]?.count || 0;

    // 5. Get top 5 teachers
    const topTeachers = usersWithPoints
      .filter((u) => u.totalPoints && u.totalPoints > 0)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        fullName: u.fullName || "Unknown",
        email: u.email,
        totalPoints: u.totalPoints || 0,
        level: u.level || "مبتدئ",
      }));

    // 6. Get active weekly challenges
    const activeChallenges = await database
      .select({
        id: weeklyChallenges.id,
        title: weeklyChallenges.title,
        description: weeklyChallenges.description,
        pointsReward: weeklyChallenges.pointsReward,
      })
      .from(weeklyChallenges)
      .where(eq(weeklyChallenges.isActive, true))
      .limit(5);

    // 7. Calculate challenge completion percentages
    const challengesWithCompletion = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const totalUsers = await database
          .select({ count: count() })
          .from(users)
          .where(eq(users.role, "user"));

        const completedUsers = await database
          .select({ count: count() })
          .from(userChallengeProgress)
          .where(
            and(
              eq(userChallengeProgress.challengeId, challenge.id),
              eq(userChallengeProgress.isCompleted, true)
            )
          );

        const completionPercentage = totalUsers[0]?.count
          ? Math.round((completedUsers[0]?.count || 0) / totalUsers[0].count * 100)
          : 0;

        return {
          ...challenge,
          completionPercentage,
        };
      })
    );

    return {
      levelDistribution,
      totalPointsThisMonth,
      activeTeachersCount,
      topTeachers,
      activeChallengesCount: activeChallenges.length,
      activeChallenges: challengesWithCompletion,
    };
  }),

  /**
   * Manually trigger monthly email reports (admin only)
   */
  sendMonthlyReportsManually: staffProcedure.mutation(async () => {
    try {
      const result = await runMonthlyEmailCronJob();

      return {
        success: true,
        message: `تم إرسال ${result.successCount} تقرير من أصل ${result.totalTeachers}`,
        details: result,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`فشل إرسال التقارير: ${errorMsg}`);
    }
  }),

  /**
   * Get cron job execution history
   */
  getCronJobHistory: staffProcedure.query(async () => {
    // This would typically fetch from database
    // For now, returning a placeholder
    return {
      lastRun: new Date(),
      nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    };
  }),
});
