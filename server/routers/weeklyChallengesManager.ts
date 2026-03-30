import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { weeklyChallenges, userChallengeProgress, competencyPoints } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Challenge templates
const CHALLENGE_TEMPLATES = [
  {
    titleAr: "جذاذات متعددة",
    descriptionAr: "أنشئ 3 جذاذات هذا الأسبوع",
    targetCount: 3,
    toolType: "edugpt_sheet",
    bonusPoints: 30,
  },
  {
    titleAr: "منشئ الاختبارات",
    descriptionAr: "استخدم منشئ الاختبارات مرتين",
    targetCount: 2,
    toolType: "test_builder",
    bonusPoints: 20,
  },
  {
    titleAr: "نشر في Marketplace",
    descriptionAr: "انشر محتوى واحد في Marketplace",
    targetCount: 1,
    toolType: "marketplace_publish",
    bonusPoints: 40,
  },
  {
    titleAr: "فيديوهات Ultimate Studio",
    descriptionAr: "أنتج فيديوهين باستخدام Ultimate Studio",
    targetCount: 2,
    toolType: "ultimate_studio",
    bonusPoints: 50,
  },
  {
    titleAr: "صور Visual Studio",
    descriptionAr: "وليد 5 صور باستخدام Visual Studio",
    targetCount: 5,
    toolType: "visual_studio",
    bonusPoints: 25,
  },
];

export const weeklyChallengesManagerRouter = router({
  // Initialize weekly challenges for current week
  initializeWeeklyChallenges: adminProcedure.mutation(async () => {
    const database = (await getDb())!;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if challenges already exist for this week
    const existingChallenges = await database
      .select()
      .from(weeklyChallenges)
      .where(
        and(
          gte(weeklyChallenges.weekStart, weekStart),
          lte(weeklyChallenges.weekEnd, weekEnd)
        )
      );

    if (existingChallenges.length > 0) {
      return { success: true, message: "Challenges already exist for this week" };
    }

    // Select 3 random challenges from templates
    const selectedChallenges = CHALLENGE_TEMPLATES.sort(() => Math.random() - 0.5).slice(0, 3);

    // Create challenges
    for (const challenge of selectedChallenges) {
      await database.insert(weeklyChallenges).values({
        titleAr: challenge.titleAr,
        descriptionAr: challenge.descriptionAr,
        targetCount: challenge.targetCount,
        toolType: challenge.toolType as any,
        bonusPoints: challenge.bonusPoints,
        weekStart,
        weekEnd,
        isActive: true,
      });
    }

    return {
      success: true,
      message: `Created ${selectedChallenges.length} challenges for this week`,
    };
  }),

  // Get active challenges for user
  getActiveChallengesForUser: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;

    const now = new Date();

    // Get active challenges for current week
    const challenges = await database
      .select()
      .from(weeklyChallenges)
      .where(
        and(
          eq(weeklyChallenges.isActive, true),
          lte(weeklyChallenges.weekStart, now),
          gte(weeklyChallenges.weekEnd, now)
        )
      );

    // Get user's progress on each challenge
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        let userProgress = await database
          .select()
          .from(userChallengeProgress)
          .where(
            and(
              eq(userChallengeProgress.userId, ctx.user.id),
              eq(userChallengeProgress.challengeId, challenge.id)
            )
          )
          .limit(1);

        // Create progress record if doesn't exist
        if (userProgress.length === 0) {
          await database.insert(userChallengeProgress).values({
            userId: ctx.user.id,
            challengeId: challenge.id,
            currentCount: 0,
            targetCount: challenge.targetCount,
            completed: false,
            bonusPointsAwarded: 0,
          });

          userProgress = await database
            .select()
            .from(userChallengeProgress)
            .where(
              and(
                eq(userChallengeProgress.userId, ctx.user.id),
                eq(userChallengeProgress.challengeId, challenge.id)
              )
            )
            .limit(1);
        }

        return {
          id: challenge.id,
          titleAr: challenge.titleAr,
          descriptionAr: challenge.descriptionAr,
          targetCount: challenge.targetCount,
          bonusPoints: challenge.bonusPoints,
          progress: {
            currentCount: userProgress[0]?.currentCount || 0,
            completed: userProgress[0]?.completed || false,
            bonusPointsAwarded: userProgress[0]?.bonusPointsAwarded || 0,
          },
        };
      })
    );

    return challengesWithProgress;
  }),

  // Update challenge progress (called when user completes an action)
  updateChallengeProgress: protectedProcedure
    .input(
      z.object({
        toolType: z.string(),
        count: z.number().optional().default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;

      const now = new Date();

      // Get active challenges for this tool type
      const challenges = await database
        .select()
        .from(weeklyChallenges)
        .where(
          and(
            eq(weeklyChallenges.isActive, true),
            eq(weeklyChallenges.toolType, input.toolType as any),
            lte(weeklyChallenges.weekStart, now),
            gte(weeklyChallenges.weekEnd, now)
          )
        );

      // Update progress for each matching challenge
      for (const challenge of challenges) {
        let userProgress = await database
          .select()
          .from(userChallengeProgress)
          .where(
            and(
              eq(userChallengeProgress.userId, ctx.user.id),
              eq(userChallengeProgress.challengeId, challenge.id)
            )
          )
          .limit(1);

        if (userProgress.length === 0) {
          await database.insert(userChallengeProgress).values({
            userId: ctx.user.id,
            challengeId: challenge.id,
            currentCount: input.count,
            targetCount: challenge.targetCount,
            completed: input.count >= challenge.targetCount,
            bonusPointsAwarded: 0,
          });
        } else {
          const newCount = (userProgress[0].currentCount || 0) + input.count;
          const isCompleted = newCount >= challenge.targetCount;

          await database
            .update(userChallengeProgress)
            .set({
              currentCount: newCount,
              completed: isCompleted,
              updatedAt: new Date(),
            })
            .where(eq(userChallengeProgress.id, userProgress[0].id));
        }
      }

      return { success: true };
    }),

  // Complete challenge and award bonus points
  completeChallengeAndAwardPoints: protectedProcedure
    .input(z.object({ challengeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = (await getDb())!;

      const challenge = await database
        .select()
        .from(weeklyChallenges)
        .where(eq(weeklyChallenges.id, input.challengeId))
        .limit(1);

      if (challenge.length === 0) {
        throw new Error("Challenge not found");
      }

      const userProgress = await database
        .select()
        .from(userChallengeProgress)
        .where(
          and(
            eq(userChallengeProgress.userId, ctx.user.id),
            eq(userChallengeProgress.challengeId, input.challengeId)
          )
        )
        .limit(1);

      if (userProgress.length === 0) {
        throw new Error("User progress not found");
      }

      if (userProgress[0].completed) {
        return { success: false, message: "Challenge already completed" };
      }

      // Mark as completed and award bonus points
      await database
        .update(userChallengeProgress)
        .set({
          completed: true,
          bonusPointsAwarded: challenge[0].bonusPoints,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userChallengeProgress.id, userProgress[0].id));

      return {
        success: true,
        bonusPointsAwarded: challenge[0].bonusPoints,
      };
    }),

  // Get badges earned by user
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;

    // Get user's competency record to check level
    const competencyRecord = await database
      .select()
      .from(competencyPoints)
      .where(eq(competencyPoints.userId, ctx.user.id))
      .orderBy(desc(competencyPoints.totalPoints))
      .limit(1);

    const BADGE_INFO: Record<string, { label: string; color: string; icon: string }> = {
      beginner: { label: "مبتدئ رقمي", color: "#CD7F32", icon: "🥉" },
      advanced: { label: "متطور رقمي", color: "#C0C0C0", icon: "🥈" },
      expert: { label: "خبير رقمي", color: "#FFD700", icon: "🥇" },
      master: { label: "ماهر رقمي", color: "#E5E4E2", icon: "💎" },
    };

    const badges: Array<{ name: string; label: string; color: string; icon: string; earnedAt: string }> = [];

    if (competencyRecord.length > 0 && competencyRecord[0].badges && Array.isArray(competencyRecord[0].badges)) {
      const badgesList = competencyRecord[0].badges as Array<{ name: string; earnedAt: string }>;
      badgesList.forEach((badge) => {
        const badgeInfo = BADGE_INFO[badge.name];

        if (badgeInfo) {
          badges.push({
            name: badge.name,
            label: badgeInfo.label,
            color: badgeInfo.color,
            icon: badgeInfo.icon,
            earnedAt: badge.earnedAt,
          });
        }
      });
    }

    return badges;
  }),
});
