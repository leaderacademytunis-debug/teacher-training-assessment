import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { 
  competencyPoints, 
  competencyTransactions, 
  weeklyChallenges, 
  userChallengeProgress,
  users 
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getDb } from "../db";

// Point values for each tool
const POINT_VALUES = {
  edugpt_sheet: 3,        // جذاذة كاملة
  test_builder: 5,        // منشئ الاختبارات
  smart_correction: 5,    // التصحيح الذكي
  visual_studio: 2,       // صورة
  ultimate_studio: 10,    // فيديو
  marketplace_publish: 8, // نشر محتوى
  course_completion: 20,  // إتمام تكوين
};

// Competency levels
const COMPETENCY_LEVELS = {
  beginner: { min: 0, max: 50, label: "مبتدئ" },
  advanced: { min: 51, max: 150, label: "متطور" },
  expert: { min: 151, max: 300, label: "خبير" },
  master: { min: 301, max: Infinity, label: "ماهر رقمي" },
};

function getCompetencyLevel(points: number): string {
  if (points <= 50) return "beginner";
  if (points <= 150) return "advanced";
  if (points <= 300) return "expert";
  return "master";
}

export const competencyPointsRouter = router({
  // Get user's current competency points
  getCompetencyProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get or create competency record for current month
      let record = await database.query.competencyPoints.findFirst({
        where: and(
          eq(competencyPoints.userId, ctx.user.id),
          eq(competencyPoints.monthYear, currentMonth)
        ),
      });

      if (!record) {
        // Create new record for current month
        const now = new Date();
        await database.insert(competencyPoints).values({
          userId: ctx.user.id,
          totalPoints: 0,
          level: "beginner",
          monthYear: currentMonth,
          monthlyPoints: 0,
          monthlyUsageCount: 0,
          toolUsage: {},
          badges: [],
        });

        record = await database.query.competencyPoints.findFirst({
          where: and(
            eq(competencyPoints.userId, ctx.user.id),
            eq(competencyPoints.monthYear, currentMonth)
          ),
        });
      }

      return {
        totalPoints: record?.totalPoints || 0,
        level: record?.level || "beginner",
        monthlyPoints: record?.monthlyPoints || 0,
        monthlyUsageCount: record?.monthlyUsageCount || 0,
        toolUsage: record?.toolUsage || {},
        badges: record?.badges || [],
      };
    }),

  // Add points for tool usage
  addPoints: protectedProcedure
    .input(z.object({
      toolType: z.enum([
        "edugpt_sheet",
        "test_builder",
        "smart_correction",
        "visual_studio",
        "ultimate_studio",
        "marketplace_publish",
        "course_completion",
      ]),
      referenceId: z.string().optional(),
      referenceType: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Skip for admin users
      if (ctx.user.role === "admin") {
        return { success: true, skipped: true };
      }

      const pointsToAdd = POINT_VALUES[input.toolType as keyof typeof POINT_VALUES] || 0;

      // Get current competency record
      let record = await database.query.competencyPoints.findFirst({
        where: and(
          eq(competencyPoints.userId, ctx.user.id),
          eq(competencyPoints.monthYear, currentMonth)
        ),
      });

      if (!record) {
        const now = new Date();
        await database.insert(competencyPoints).values({
          userId: ctx.user.id,
          totalPoints: 0,
          level: "beginner",
          monthYear: currentMonth,
          monthlyPoints: 0,
          monthlyUsageCount: 0,
          toolUsage: {},
          badges: [],
        });

        record = await database.query.competencyPoints.findFirst({
          where: and(
            eq(competencyPoints.userId, ctx.user.id),
            eq(competencyPoints.monthYear, currentMonth)
          ),
        });
      }

      const previousTotal = record?.totalPoints || 0;
      const previousLevel = record?.level || "beginner";
      const newTotal = previousTotal + pointsToAdd;
      const newLevel = getCompetencyLevel(newTotal);

      // Update tool usage
      const toolUsage = (record?.toolUsage || {}) as Record<string, number>;
      toolUsage[input.toolType] = (toolUsage[input.toolType] || 0) + 1;

      // Check if level changed
      const levelChanged = previousLevel !== newLevel;
      let newBadges = (record?.badges || []) as Array<{ name: string; earnedAt: string }>;

      if (levelChanged) {
        newBadges.push({
          name: newLevel,
          earnedAt: new Date().toISOString(),
        });
      }

      // Update competency points
      await database
        .update(competencyPoints)
        .set({
          totalPoints: newTotal,
          level: newLevel as any,
          monthlyPoints: (record?.monthlyPoints || 0) + pointsToAdd,
          monthlyUsageCount: (record?.monthlyUsageCount || 0) + 1,
          toolUsage: toolUsage,
          badges: newBadges,
          updatedAt: new Date(),
        })
        .where(eq(competencyPoints.id, record!.id));

      // Record transaction
      await database.insert(competencyTransactions).values({
        userId: ctx.user.id,
        toolType: input.toolType,
        pointsEarned: pointsToAdd,
        previousTotal,
        newTotal,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        previousLevel,
        newLevel,
        levelChanged,
      });

      return {
        success: true,
        pointsAdded: pointsToAdd,
        newTotal,
        levelChanged,
        newLevel,
      };
    }),

  // Get teacher's public competency info
  getPublicCompetencyInfo: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all-time total points
      const totalRecord = await database.query.competencyPoints.findFirst({
        where: eq(competencyPoints.userId, input.userId),
        orderBy: desc(competencyPoints.totalPoints),
      });

      if (!totalRecord) {
        return {
          totalPoints: 0,
          level: "beginner",
          levelLabel: "مبتدئ",
          monthlyUsageCount: 0,
        };
      }

      const levelLabel = COMPETENCY_LEVELS[totalRecord.level as keyof typeof COMPETENCY_LEVELS]?.label || "مبتدئ";

      return {
        totalPoints: totalRecord.totalPoints,
        level: totalRecord.level,
        levelLabel,
        monthlyUsageCount: totalRecord.monthlyUsageCount,
      };
    }),

  // Get teacher analytics (detailed stats)
  getTeacherAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get last 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const transactions = await database.query.competencyTransactions.findMany({
        where: and(
          eq(competencyTransactions.userId, ctx.user.id),
          gte(competencyTransactions.createdAt, sixMonthsAgo)
        ),
        orderBy: desc(competencyTransactions.createdAt),
      });

      // Group by month
      const monthlyData: Record<string, number> = {};
      transactions.forEach((t) => {
        const month = t.createdAt.toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + t.pointsEarned;
      });

      // Get tool usage breakdown
      const toolUsage: Record<string, number> = {};
      transactions.forEach((t) => {
        toolUsage[t.toolType] = (toolUsage[t.toolType] || 0) + 1;
      });

      // Get current competency
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentRecord = await database.query.competencyPoints.findFirst({
        where: and(
          eq(competencyPoints.userId, ctx.user.id),
          eq(competencyPoints.monthYear, currentMonth)
        ),
      });

      // Calculate rank (percentage of teachers with lower points)
      const allUsersPoints = await database.query.competencyPoints.findMany({
        where: eq(competencyPoints.monthYear, currentMonth),
      });

      const userTotal = currentRecord?.totalPoints || 0;
      const usersWithLowerPoints = allUsersPoints.filter((u) => u.totalPoints < userTotal).length;
      const percentile = allUsersPoints.length > 0 ? Math.round((usersWithLowerPoints / allUsersPoints.length) * 100) : 0;

      return {
        monthlyData,
        toolUsage,
        currentLevel: currentRecord?.level || "beginner",
        totalPoints: currentRecord?.totalPoints || 0,
        percentile,
        rank: `أنت في أفضل ${100 - percentile}% من معلمي المنصة`,
        nextLevelPoints: {
          beginner: 50,
          advanced: 150,
          expert: 300,
          master: Infinity,
        }[currentRecord?.level || "beginner"],
        pointsToNextLevel: Math.max(
          0,
          ({
            beginner: 50,
            advanced: 150,
            expert: 300,
            master: Infinity,
          }[currentRecord?.level || "beginner"] as number) - (currentRecord?.totalPoints || 0)
        ),
      };
    }),

  // Get monthly usage summary
  getMonthlyUsageSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const currentMonth = new Date().toISOString().slice(0, 7);

      const record = await database.query.competencyPoints.findFirst({
        where: and(
          eq(competencyPoints.userId, ctx.user.id),
          eq(competencyPoints.monthYear, currentMonth)
        ),
      });

      return {
        totalUsageThisMonth: record?.monthlyUsageCount || 0,
        pointsThisMonth: record?.monthlyPoints || 0,
        toolUsage: record?.toolUsage || {},
      };
    }),

  // Get active weekly challenges
  getActiveChallenges: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const now = new Date();

      const challenges = await database.query.weeklyChallenges.findMany({
        where: and(
          eq(weeklyChallenges.isActive, true),
          lte(weeklyChallenges.weekStart, now),
          gte(weeklyChallenges.weekEnd, now)
        ),
      });

      // Get user's progress on each challenge
      const progress = await Promise.all(
        challenges.map(async (challenge) => {
          const userProgress = await database.query.userChallengeProgress.findFirst({
            where: and(
              eq(userChallengeProgress.userId, ctx.user.id),
              eq(userChallengeProgress.challengeId, challenge.id)
            ),
          });

          return {
            ...challenge,
            userProgress: userProgress || {
              currentCount: 0,
              targetCount: challenge.targetCount,
              completed: false,
              bonusPointsAwarded: 0,
            },
          };
        })
      );

      return progress;
    }),

  // Complete a challenge
  completeChallenge: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const challenge = await database.query.weeklyChallenges.findFirst({
        where: eq(weeklyChallenges.id, input.challengeId),
      });

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      const userProgress = await database.query.userChallengeProgress.findFirst({
        where: and(
          eq(userChallengeProgress.userId, ctx.user.id),
          eq(userChallengeProgress.challengeId, input.challengeId)
        ),
      });

      if (!userProgress) {
        throw new Error("User progress not found");
      }

      if (userProgress.completed) {
        return { success: false, message: "Challenge already completed" };
      }

      // Update progress
      await database
        .update(userChallengeProgress)
        .set({
          completed: true,
          completedAt: new Date(),
          bonusPointsAwarded: challenge.bonusPoints,
          updatedAt: new Date(),
        })
        .where(eq(userChallengeProgress.id, userProgress.id));

      // Add bonus points
      const currentMonth = new Date().toISOString().slice(0, 7);
      const record = await database.query.competencyPoints.findFirst({
        where: and(
          eq(competencyPoints.userId, ctx.user.id),
          eq(competencyPoints.monthYear, currentMonth)
        ),
      });

      if (record) {
        const newTotal = (record.totalPoints || 0) + challenge.bonusPoints;
        const newLevel = getCompetencyLevel(newTotal);

        await database
          .update(competencyPoints)
          .set({
            totalPoints: newTotal,
            level: newLevel as any,
            monthlyPoints: (record.monthlyPoints || 0) + challenge.bonusPoints,
            updatedAt: new Date(),
          })
          .where(eq(competencyPoints.id, record.id));
      }

      return {
        success: true,
        bonusPointsAwarded: challenge.bonusPoints,
      };
    }),
});
