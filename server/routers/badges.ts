import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";

export const badgesRouter = router({
  /**
   * Initialize default badges (admin only)
   */
  initializeBadges: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can initialize badges");
    }

    await db.initializeBadges();
    return { success: true, message: "Badges initialized successfully" };
  }),

  /**
   * Get user's earned badges
   */
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    const badges = await db.getUserBadges(ctx.user.id);
    return badges;
  }),

  /**
   * Get badge statistics for user
   */
  getBadgeStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await db.getBadgeStats(ctx.user.id);
    return stats;
  }),

  /**
   * Check and award badges based on referral progress
   */
  checkAndAwardBadges: protectedProcedure.mutation(async ({ ctx }) => {
    const newBadges = await db.checkAndAwardBadges(ctx.user.id);
    return {
      success: true,
      newBadgesAwarded: newBadges.length,
      badges: newBadges,
    };
  }),

  /**
   * Get all badge definitions
   */
  getAllBadges: protectedProcedure.query(async () => {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    const { badgeDefinitions } = await import("../drizzle/schema");
    const badges = await dbInstance
      .select()
      .from(badgeDefinitions)
      .where(eq(badgeDefinitions.isActive, true));

    return badges;
  }),

  /**
   * Mark badge notification as sent
   */
  markBadgeNotificationSent: protectedProcedure
    .input(z.object({ badgeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) return { success: false };

      const { userBadges } = await import("../drizzle/schema");
      await dbInstance
        .update(userBadges)
        .set({ notificationSent: true })
        .where(
          and(
            eq(userBadges.userId, ctx.user.id),
            eq(userBadges.badgeId, input.badgeId)
          )
        );

      return { success: true };
    }),

  /**
   * Toggle badge visibility
   */
  toggleBadgeVisibility: protectedProcedure
    .input(z.object({ badgeId: z.number(), isDisplayed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) return { success: false };

      const { userBadges } = await import("../drizzle/schema");
      await dbInstance
        .update(userBadges)
        .set({ isDisplayed: input.isDisplayed })
        .where(
          and(
            eq(userBadges.userId, ctx.user.id),
            eq(userBadges.badgeId, input.badgeId)
          )
        );

      return { success: true };
    }),
});
