import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, like } from "drizzle-orm";
import { users, auditLogs, userCredits, userSubscriptions, teacherPortfolios } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Admin-only router for super admin dashboard
 * All procedures require SUPER_ADMIN role
 */

// Middleware to check for super admin role
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only super admins can access this resource",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get all users with pagination and filtering
   */
  getAllUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(users);

      if (input.search) {
        query = query.where(
          like(users.name, `%${input.search}%`)
        );
      }

      if (input.role && input.role !== "all") {
        query = query.where(eq(users.role, input.role as any));
      }

      const allUsers = await query;
      const total = allUsers.length;

      const paginatedUsers = allUsers.slice(offset, offset + input.limit);

      return {
        users: paginatedUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          schoolName: u.schoolName,
          registrationStatus: u.registrationStatus,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  /**
   * Get user details with credits and subscription
   */
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();

      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const credits = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, input.userId))
        .limit(1);

      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, input.userId))
        .limit(1);

      const profile = await db
        .select()
        .from(teacherPortfolios)
        .where(eq(teacherPortfolios.userId, input.userId))
        .limit(1);

      return {
        user: user[0],
        credits: credits[0] || null,
        subscription: subscription[0] || null,
        profile: profile[0] || null,
      };
    }),

  /**
   * Update user credits
   */
  updateUserCredits: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        creditsToAdd: z.number().int(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get current credits
      const currentCredits = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, input.userId))
        .limit(1);

      const oldTotal = currentCredits[0]?.totalCredits || 0;
      const newTotal = oldTotal + input.creditsToAdd;

      // Update or create credits record
      if (currentCredits.length) {
        await db
          .update(userCredits)
          .set({
            totalCredits: newTotal,
            remainingCredits: newTotal - (currentCredits[0].usedCredits || 0),
            updatedBy: ctx.user.id,
          })
          .where(eq(userCredits.userId, input.userId));
      } else {
        await db.insert(userCredits).values({
          userId: input.userId,
          totalCredits: newTotal,
          usedCredits: 0,
          remainingCredits: newTotal,
          updatedBy: ctx.user.id,
        });
      }

      // Log the action
      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: "UPDATE_CREDITS",
        targetUserId: input.userId,
        targetType: "user",
        changes: JSON.stringify({
          oldTotal,
          newTotal,
          creditsAdded: input.creditsToAdd,
        }),
        description: `${input.reason} (Added ${input.creditsToAdd} credits)`,
      });

      return { success: true, newTotal };
    }),

  /**
   * Update user subscription
   */
  updateUserSubscription: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "basic", "pro", "vip"]),
        status: z.enum(["active", "inactive", "suspended", "expired"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      const existing = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, input.userId))
        .limit(1);

      if (existing.length) {
        await db
          .update(userSubscriptions)
          .set({
            plan: input.plan,
            status: input.status,
            updatedBy: ctx.user.id,
          })
          .where(eq(userSubscriptions.userId, input.userId));
      } else {
        await db.insert(userSubscriptions).values({
          userId: input.userId,
          plan: input.plan,
          status: input.status,
          updatedBy: ctx.user.id,
        });
      }

      // Log the action
      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: "UPDATE_SUBSCRIPTION",
        targetUserId: input.userId,
        targetType: "subscription",
        changes: JSON.stringify({
          plan: input.plan,
          status: input.status,
        }),
        description: `Changed subscription to ${input.plan} (${input.status})`,
      });

      return { success: true };
    }),

  /**
   * Suspend/Ban user account
   */
  suspendUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      await db
        .update(users)
        .set({
          registrationStatus: "rejected",
        })
        .where(eq(users.id, input.userId));

      // Log the action
      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: "SUSPEND_USER",
        targetUserId: input.userId,
        targetType: "user",
        description: `User suspended: ${input.reason}`,
      });

      return { success: true };
    }),

  /**
   * Get KPI statistics
   */
  getKPIStats: adminProcedure.query(async () => {
    const db = await getDb();

    const allUsers = await db.select().from(users);
    const activeUsers = allUsers.filter((u) => u.registrationStatus === "approved");
    const totalTeachers = allUsers.filter((u) => u.role === "teacher");

    const allProfiles = await db.select().from(teacherPortfolios);
    const totalLessons = allProfiles.reduce((sum, p) => sum + (p.lessonsCreated || 0), 0);
    const totalVideos = allProfiles.reduce((sum, p) => sum + (p.videosCreated || 0), 0);

    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      totalTeachers: totalTeachers.length,
      totalLessonsCreated: totalLessons,
      totalVideosCreated: totalVideos,
      totalContent: totalLessons + totalVideos,
    };
  }),

  /**
   * Get audit logs
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        action: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

      if (input.action) {
        query = query.where(eq(auditLogs.action, input.action));
      }

      const allLogs = await query;
      const total = allLogs.length;

      const paginatedLogs = allLogs.slice(offset, offset + input.limit);

      return {
        logs: paginatedLogs,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});
