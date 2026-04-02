import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { referrals, referralRewards, users, userCredits } from "../../drizzle/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { getDb } from "../db";

export const referralsRouter = router({
  /**
   * Generate a unique referral code and create a referral invitation
   */
  createReferralInvite: protectedProcedure
    .input((val: unknown) => {
      const obj = val as any;
      if (typeof obj?.referredEmail !== "string") throw new Error("Invalid email");
      if (typeof obj?.invitationMessage !== "string") throw new Error("Invalid message");
      return {
        referredEmail: obj.referredEmail as string,
        invitationMessage: obj.invitationMessage as string,
      };
    })
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb())!;
      const referrerId = ctx.user.id;

      // Generate unique referral code
      const referralCode = crypto.randomBytes(8).toString("hex").toUpperCase();
      const referralLink = `${process.env.VITE_APP_URL}/signup?ref=${referralCode}`;

      // Calculate expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create referral record
      await db
        .insert(referrals)
        .values({
          referrerId,
          referredEmail: input.referredEmail,
          referralCode,
          referralLink,
          invitationMessage: input.invitationMessage,
          expiresAt,
          status: "pending",
          referrerRewardCredits: 10,
          referredRewardCredits: 5,
        });

      return {
        referralCode,
        referralLink,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Get referral stats for the current user
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const db = (await getDb())!;
    const userId = ctx.user.id;

    // Get all referrals made by this user
    const myReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // Count by status
    const pending = myReferrals.filter((r) => r.status === "pending").length;
    const accepted = myReferrals.filter((r) => r.status === "accepted").length;
    const completed = myReferrals.filter((r) => r.status === "completed").length;

    // Calculate total earned credits
    const rewards = await db
      .select()
      .from(referralRewards)
      .where(and(eq(referralRewards.userId, userId), eq(referralRewards.status, "awarded")));

    const totalEarned = rewards.reduce((sum: number, r: any) => sum + r.creditsAwarded, 0);

    return {
      totalReferrals: myReferrals.length,
      pending,
      accepted,
      completed,
      totalEarned,
      referrals: myReferrals,
    };
  }),

  /**
   * Validate and process referral link when user signs up
   */
  validateReferralCode: publicProcedure
    .input((val: unknown) => {
      const obj = val as any;
      if (typeof obj?.referralCode !== "string") throw new Error("Invalid code");
      return { referralCode: obj.referralCode as string };
    })
    .query(async ({ ctx, input }) => {
      const db = (await getDb())!;

      // Find referral by code
      const [referral] = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.referralCode));

      if (!referral) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Referral code not found or expired",
        });
      }

      // Check if expired
      if (referral.expiresAt && new Date() > referral.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Referral code has expired",
        });
      }

      // Check if already completed
      if (referral.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This referral has already been used",
        });
      }

      return {
        referralCode: referral.referralCode,
        referrerName: (
          await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, referral.referrerId))
        )[0]?.name,
        invitationMessage: referral.invitationMessage,
      };
    }),

  /**
   * Complete referral when new user signs up with referral code
   */
  completeReferral: protectedProcedure
    .input((val: unknown) => {
      const obj = val as any;
      if (typeof obj?.referralCode !== "string") throw new Error("Invalid code");
      return { referralCode: obj.referralCode as string };
    })
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb())!;
      const newUserId = ctx.user.id;

      // Find referral
      const [referral] = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.referralCode));

      if (!referral) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Referral not found",
        });
      }

      if (referral.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Referral already completed",
        });
      }

      // Update referral status
      await db
        .update(referrals)
        .set({
          referredId: newUserId,
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(referrals.id, referral.id));

      // Award credits to referrer
      await db
        .insert(referralRewards)
        .values({
          referralId: referral.id,
          userId: referral.referrerId,
          rewardType: "referrer_bonus",
          creditsAwarded: referral.referrerRewardCredits,
          reason: `Referral completed by ${ctx.user.name}`,
          status: "awarded",
          awardedAt: new Date(),
        });

      // Award credits to referred user
      await db
        .insert(referralRewards)
        .values({
          referralId: referral.id,
          userId: newUserId,
          rewardType: "referred_bonus",
          creditsAwarded: referral.referredRewardCredits,
          reason: "Welcome bonus for joining via referral",
          status: "awarded",
          awardedAt: new Date(),
        });

      // Update user credits
      await db
        .update(userCredits)
        .set({
          remainingCredits: sql`${userCredits.remainingCredits} + ${referral.referrerRewardCredits}`,
        })
        .where(eq(userCredits.userId, referral.referrerId));

      await db
        .update(userCredits)
        .set({
          remainingCredits: sql`${userCredits.remainingCredits} + ${referral.referredRewardCredits}`,
        })
        .where(eq(userCredits.userId, newUserId));

      return {
        success: true,
        message: "Referral completed and rewards awarded",
      };
    }),

  /**
   * Get all referrals made by the current user
   */
  getMyReferrals: protectedProcedure.query(async ({ ctx }) => {
    const db = (await getDb())!;
    const userId = ctx.user.id;

    const myReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    return myReferrals;
  }),

  /**
   * Get referral rewards for the current user
   */
  getMyReferralRewards: protectedProcedure.query(async ({ ctx }) => {
    const db = (await getDb())!;
    const userId = ctx.user.id;

    const rewards = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));

    return rewards;
  }),
});
