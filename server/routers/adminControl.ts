/**
 * Admin Control Panel Router
 * Comprehensive admin dashboard backend with 5 sections:
 * 1. Usage Limits Management
 * 2. User Management
 * 3. Subscription Management
 * 4. Statistics Dashboard
 * 5. Content & Tool Management
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  users,
  servicePermissions,
  aiActivityLog,
  pricingPlans,
  paymentRequests,
  toolConfigurations,
  toolUsageTracking,
  adminSettings,
  platformMessages,
  imageUsageTracking,
  notifications,
  pageConfigurations,
} from "../../drizzle/schema";
import { eq, desc, asc, and, sql, count, like, or, gte, lte, between } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Access denied. Admin role required.",
    });
  }
  return next({ ctx });
});

// Helper: get current month string
function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Default tool configurations for seeding
const DEFAULT_TOOLS = [
  { toolKey: "exam_builder", nameAr: "منشئ الاختبارات", nameFr: "Générateur d'examens", nameEn: "Exam Builder", icon: "FileText", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 50, premiumLimitPerMonth: 0 },
  { toolKey: "inspector", nameAr: "المفتش الذكي", nameFr: "Inspecteur intelligent", nameEn: "Smart Inspector", icon: "Search", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 30, premiumLimitPerMonth: 0 },
  { toolKey: "curriculum_map", nameAr: "خريطة المنهج", nameFr: "Carte du programme", nameEn: "Curriculum Map", icon: "Map", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0 },
  { toolKey: "annual_plan", nameAr: "المخطط السنوي", nameFr: "Plan annuel", nameEn: "Annual Plan", icon: "Calendar", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0 },
  { toolKey: "lesson_sheet", nameAr: "الجذاذة من المخطط", nameFr: "Fiche de leçon", nameEn: "Lesson Sheet", icon: "BookOpen", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 50, premiumLimitPerMonth: 0 },
  { toolKey: "blind_grading", nameAr: "التصحيح الذكي", nameFr: "Correction intelligente", nameEn: "Smart Grading", icon: "Eye", category: "assessment", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 30, premiumLimitPerMonth: 0 },
  { toolKey: "visual_studio", nameAr: "الاستوديو البصري", nameFr: "Studio visuel", nameEn: "Visual Studio", icon: "Image", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0, freeImageLimit: 0, proImageLimit: 50, premiumImageLimit: 0 },
  { toolKey: "drama_engine", nameAr: "محرك المسرح", nameFr: "Moteur de théâtre", nameEn: "Drama Engine", icon: "Theater", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0 },
  { toolKey: "video_evaluator", nameAr: "مقيّم الفيديو", nameFr: "Évaluateur vidéo", nameEn: "Video Evaluator", icon: "Video", category: "assessment", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 15, premiumLimitPerMonth: 0 },
  { toolKey: "handwriting_analyzer", nameAr: "محلل الخط", nameFr: "Analyseur d'écriture", nameEn: "Handwriting Analyzer", icon: "PenTool", category: "assessment", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0 },
  { toolKey: "legacy_digitizer", nameAr: "رقمنة الوثائق", nameFr: "Numérisation", nameEn: "Legacy Digitizer", icon: "ScanLine", category: "content", freeAccess: false, freeLimitPerMonth: 0, proLimitPerMonth: 20, premiumLimitPerMonth: 0 },
  { toolKey: "prompt_lab", nameAr: "مختبر الأوامر", nameFr: "Labo de prompts", nameEn: "Prompt Lab", icon: "Lightbulb", category: "ai_tools", freeAccess: true, freeLimitPerMonth: 0, proLimitPerMonth: 0, premiumLimitPerMonth: 0 },
  { toolKey: "edugpt", nameAr: "المساعد الذكي", nameFr: "Assistant IA", nameEn: "EduGPT Assistant", icon: "MessageSquare", category: "ai_tools", freeAccess: false, freeLimitPerMonth: 5, proLimitPerMonth: 100, premiumLimitPerMonth: 0 },
  { toolKey: "pedagogical_companion", nameAr: "المرافق البيداغوجي", nameFr: "Accompagnateur pédagogique", nameEn: "Pedagogical Companion", icon: "HeartHandshake", category: "assessment", freeAccess: false, freeLimitPerMonth: 2, proLimitPerMonth: 30, premiumLimitPerMonth: 0 },
  { toolKey: "content_adapter", nameAr: "مكيّف المحتوى التعليمي", nameFr: "Adaptateur de contenu", nameEn: "Content Adapter", icon: "BookOpen", category: "assessment", freeAccess: false, freeLimitPerMonth: 3, proLimitPerMonth: 40, premiumLimitPerMonth: 0 },
  { toolKey: "therapeutic_exercises_gen", nameAr: "مولّد التمارين العلاجية", nameFr: "Générateur d'exercices thérapeutiques", nameEn: "Therapeutic Exercises Generator", icon: "Dumbbell", category: "assessment", freeAccess: false, freeLimitPerMonth: 2, proLimitPerMonth: 30, premiumLimitPerMonth: 0 },
];

export const adminControlRouter = router({
  // ============================================
  // 1. TOOL & USAGE LIMITS MANAGEMENT
  // ============================================

  // Get all tool configurations
  getToolConfigs: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const tools = await database.select().from(toolConfigurations).orderBy(asc(toolConfigurations.sortOrder));
    return tools;
  }),

  // Seed default tool configurations (run once)
  seedToolConfigs: adminOnlyProcedure.mutation(async () => {
    const database = (await getDb())!;
    const existing = await database.select().from(toolConfigurations);
    if (existing.length > 0) {
      return { message: "Tools already seeded", count: existing.length };
    }
    for (let i = 0; i < DEFAULT_TOOLS.length; i++) {
      const tool = DEFAULT_TOOLS[i];
      await database.insert(toolConfigurations).values({
        toolKey: tool.toolKey,
        nameAr: tool.nameAr,
        nameFr: tool.nameFr || null,
        nameEn: tool.nameEn || null,
        icon: tool.icon,
        isEnabled: true,
        requiresAuth: !tool.freeAccess,
        freeAccess: tool.freeAccess,
        proAccess: true,
        premiumAccess: true,
        freeLimitPerMonth: tool.freeLimitPerMonth,
        proLimitPerMonth: tool.proLimitPerMonth,
        premiumLimitPerMonth: tool.premiumLimitPerMonth,
        freeImageLimit: (tool as any).freeImageLimit ?? 0,
        proImageLimit: (tool as any).proImageLimit ?? 0,
        premiumImageLimit: (tool as any).premiumImageLimit ?? 0,
        maxFileUploadMB: 10,
        sortOrder: i,
        category: tool.category,
      });
    }
    return { message: "Tools seeded successfully", count: DEFAULT_TOOLS.length };
  }),

  // Update a tool configuration
  updateToolConfig: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
        isEnabled: z.boolean().optional(),
        freeAccess: z.boolean().optional(),
        proAccess: z.boolean().optional(),
        premiumAccess: z.boolean().optional(),
        freeLimitPerMonth: z.number().optional(),
        proLimitPerMonth: z.number().optional(),
        premiumLimitPerMonth: z.number().optional(),
        freeImageLimit: z.number().optional(),
        proImageLimit: z.number().optional(),
        premiumImageLimit: z.number().optional(),
        maxFileUploadMB: z.number().optional(),
        sortOrder: z.number().optional(),
        nameAr: z.string().optional(),
        nameFr: z.string().optional(),
        nameEn: z.string().optional(),
        descriptionAr: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const { id, ...data } = input;
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await database.update(toolConfigurations).set(cleanData).where(eq(toolConfigurations.id, id));
      return { success: true };
    }),

  // Get usage stats for a specific user
  getUserUsageStats: adminOnlyProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const monthYear = getCurrentMonthYear();
      const usage = await database
        .select()
        .from(toolUsageTracking)
        .where(
          and(
            eq(toolUsageTracking.userId, input.userId),
            eq(toolUsageTracking.monthYear, monthYear)
          )
        );
      return usage;
    }),

  // Get global usage overview (all users, current month)
  getGlobalUsageOverview: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const monthYear = getCurrentMonthYear();
    const result = await database
      .select({
        toolKey: toolUsageTracking.toolKey,
        totalOps: sql<number>`SUM(${toolUsageTracking.operationCount})`,
        totalImages: sql<number>`SUM(${toolUsageTracking.imageCount})`,
        totalFiles: sql<number>`SUM(${toolUsageTracking.fileUploadCount})`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${toolUsageTracking.userId})`,
      })
      .from(toolUsageTracking)
      .where(eq(toolUsageTracking.monthYear, monthYear))
      .groupBy(toolUsageTracking.toolKey);
    return result;
  }),

  // ============================================
  // 2. USER MANAGEMENT (Enhanced)
  // ============================================

  // List users with advanced filtering
  listUsersAdvanced: adminOnlyProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        role: z.string().optional(),
        tier: z.string().optional(),
        sortBy: z.enum(["createdAt", "lastSignedIn", "name"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const offset = (input.page - 1) * input.limit;

      // Build conditions
      let conditions: any[] = [];
      if (input.search) {
        conditions.push(
          or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`),
            like(users.arabicName, `%${input.search}%`)
          )
        );
      }
      if (input.role) {
        conditions.push(eq(users.role, input.role as any));
      }

      // Count total
      const totalQuery = conditions.length > 0
        ? database.select({ count: count() }).from(users).where(and(...conditions))
        : database.select({ count: count() }).from(users);
      const totalResult = await totalQuery;
      const total = totalResult[0]?.count ?? 0;

      // Get users
      const sortCol = input.sortBy === "lastSignedIn" ? users.lastSignedIn : input.sortBy === "name" ? users.name : users.createdAt;
      const orderFn = input.sortOrder === "asc" ? asc : desc;

      let usersQuery = conditions.length > 0
        ? database.select().from(users).where(and(...conditions))
        : database.select().from(users);

      const userList = await usersQuery
        .orderBy(orderFn(sortCol))
        .limit(input.limit)
        .offset(offset);

      // Get permissions for these users
      if (userList.length === 0) {
        return { users: [], total, page: input.page, totalPages: Math.ceil(total / input.limit) };
      }

      const allPerms = await database.select().from(servicePermissions);
      const permMap = new Map(allPerms.map((p) => [p.userId, p]));

      // Get this month's usage
      const monthYear = getCurrentMonthYear();
      const allUsage = await database
        .select({
          userId: toolUsageTracking.userId,
          totalOps: sql<number>`SUM(${toolUsageTracking.operationCount})`,
        })
        .from(toolUsageTracking)
        .where(eq(toolUsageTracking.monthYear, monthYear))
        .groupBy(toolUsageTracking.userId);
      const usageMap = new Map(allUsage.map((u) => [u.userId, u.totalOps]));

      const enrichedUsers = userList.map((u) => ({
        ...u,
        permissions: permMap.get(u.id) || null,
        monthlyUsage: usageMap.get(u.id) || 0,
      }));

      // Filter by tier if needed
      let filteredUsers = enrichedUsers;
      if (input.tier) {
        filteredUsers = enrichedUsers.filter((u) => {
          const perm = u.permissions;
          if (input.tier === "free") return !perm || perm.tier === "free";
          return perm?.tier === input.tier;
        });
      }

      return {
        users: filteredUsers,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // Ban/Unban user
  toggleUserBan: adminOnlyProcedure
    .input(z.object({
      userId: z.number(),
      banned: z.boolean(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      // We use registrationStatus to indicate banned
      await database
        .update(users)
        .set({
          registrationStatus: input.banned ? "rejected" : "approved",
        })
        .where(eq(users.id, input.userId));

      // Notify user
      if (input.banned) {
        await database.insert(notifications).values({
          userId: input.userId,
          titleAr: "تم تعليق حسابك",
          messageAr: input.reason || "تم تعليق حسابك من قبل الإدارة. يرجى التواصل للمزيد من المعلومات.",
          type: "system",
        });
      }

      return { success: true };
    }),

  // Get single user details
  getUserDetails: adminOnlyProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const [user] = await database.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const [perm] = await database.select().from(servicePermissions).where(eq(servicePermissions.userId, input.userId)).limit(1);

      const monthYear = getCurrentMonthYear();
      const usage = await database
        .select()
        .from(toolUsageTracking)
        .where(and(eq(toolUsageTracking.userId, input.userId), eq(toolUsageTracking.monthYear, monthYear)));

      const recentActivity = await database
        .select()
        .from(aiActivityLog)
        .where(eq(aiActivityLog.userId, input.userId))
        .orderBy(desc(aiActivityLog.createdAt))
        .limit(10);

      return {
        user,
        permissions: perm || null,
        monthlyUsage: usage,
        recentActivity,
      };
    }),

  // ============================================
  // 3. SUBSCRIPTION MANAGEMENT
  // ============================================

  // Get all pricing plans
  getPricingPlans: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const plans = await database.select().from(pricingPlans).orderBy(asc(pricingPlans.sortOrder));
    return plans;
  }),

  // Get subscription statistics
  getSubscriptionStats: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    // Count users by tier
    const tierCounts = await database
      .select({
        tier: servicePermissions.tier,
        count: count(),
      })
      .from(servicePermissions)
      .groupBy(servicePermissions.tier);

    // Total users
    const [totalUsers] = await database.select({ count: count() }).from(users);

    // Users with any paid service
    const [paidUsers] = await database
      .select({ count: count() })
      .from(servicePermissions)
      .where(
        or(
          eq(servicePermissions.accessEdugpt, true),
          eq(servicePermissions.accessCourseAi, true),
          eq(servicePermissions.accessCoursePedagogy, true),
          eq(servicePermissions.accessFullBundle, true)
        )
      );

    // Payment requests stats
    const paymentStats = await database
      .select({
        status: paymentRequests.status,
        count: count(),
      })
      .from(paymentRequests)
      .groupBy(paymentRequests.status);

    return {
      totalUsers: totalUsers?.count ?? 0,
      paidUsers: paidUsers?.count ?? 0,
      tierCounts,
      paymentStats,
    };
  }),

  // ============================================
  // 4. STATISTICS DASHBOARD
  // ============================================

  // Get overview statistics
  getOverviewStats: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    // Total users
    const [totalUsersResult] = await database.select({ count: count() }).from(users);

    // Users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayUsersResult] = await database
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));

    // Users active in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [activeUsersResult] = await database
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastSignedIn, sevenDaysAgo));

    // Total AI operations this month
    const monthYear = getCurrentMonthYear();
    const [monthlyOpsResult] = await database
      .select({
        totalOps: sql<number>`COALESCE(SUM(${toolUsageTracking.operationCount}), 0)`,
        totalImages: sql<number>`COALESCE(SUM(${toolUsageTracking.imageCount}), 0)`,
      })
      .from(toolUsageTracking)
      .where(eq(toolUsageTracking.monthYear, monthYear));

    // AI activity today
    const [todayActivityResult] = await database
      .select({ count: count() })
      .from(aiActivityLog)
      .where(gte(aiActivityLog.createdAt, today));

    // Pending payments
    const [pendingPaymentsResult] = await database
      .select({ count: count() })
      .from(paymentRequests)
      .where(eq(paymentRequests.status, "pending"));

    return {
      totalUsers: totalUsersResult?.count ?? 0,
      todayUsers: todayUsersResult?.count ?? 0,
      activeUsers7d: activeUsersResult?.count ?? 0,
      monthlyOperations: monthlyOpsResult?.totalOps ?? 0,
      monthlyImages: monthlyOpsResult?.totalImages ?? 0,
      todayActivity: todayActivityResult?.count ?? 0,
      pendingPayments: pendingPaymentsResult?.count ?? 0,
    };
  }),

  // Get daily activity for charts (last 30 days)
  getDailyActivity: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateExpr = sql<string>`DATE(${aiActivityLog.createdAt})`.as("activity_date");
    const dailyActivity = await database
      .select({
        date: dateExpr,
        count: count(),
        type: aiActivityLog.activityType,
      })
      .from(aiActivityLog)
      .where(gte(aiActivityLog.createdAt, thirtyDaysAgo))
      .groupBy(dateExpr, aiActivityLog.activityType)
      .orderBy(dateExpr);

    return dailyActivity;
  }),

  // Get tool usage ranking
  getToolUsageRanking: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    const ranking = await database
      .select({
        activityType: aiActivityLog.activityType,
        count: count(),
      })
      .from(aiActivityLog)
      .groupBy(aiActivityLog.activityType)
      .orderBy(desc(count()));

    return ranking;
  }),

  // Get user registration trend (last 30 days)
  getUserRegistrationTrend: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const regDateExpr = sql<string>`DATE(${users.createdAt})`.as("reg_date");
    const trend = await database
      .select({
        date: regDateExpr,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(regDateExpr)
      .orderBy(regDateExpr);

    return trend;
  }),

  // Get conversion rate (free to paid)
  getConversionRate: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;

    const [totalUsers] = await database.select({ count: count() }).from(users);
    const [paidUsers] = await database
      .select({ count: count() })
      .from(servicePermissions)
      .where(
        or(
          eq(servicePermissions.tier, "pro"),
          eq(servicePermissions.tier, "premium")
        )
      );

    const total = totalUsers?.count ?? 0;
    const paid = paidUsers?.count ?? 0;
    const rate = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";

    return {
      totalUsers: total,
      paidUsers: paid,
      conversionRate: parseFloat(rate),
    };
  }),

  // ============================================
  // 5. CONTENT & SETTINGS MANAGEMENT
  // ============================================

  // --- Admin Settings ---
  getSettings: adminOnlyProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const database = (await getDb())!;
      if (input?.category) {
        return database
          .select()
          .from(adminSettings)
          .where(eq(adminSettings.category, input.category))
          .orderBy(asc(adminSettings.settingKey));
      }
      return database.select().from(adminSettings).orderBy(asc(adminSettings.settingKey));
    }),

  upsertSetting: adminOnlyProcedure
    .input(
      z.object({
        settingKey: z.string(),
        settingValue: z.string().nullable(),
        settingType: z.enum(["string", "number", "boolean", "json"]).default("string"),
        category: z.string().default("general"),
        labelAr: z.string().optional(),
        labelFr: z.string().optional(),
        labelEn: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const existing = await database
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.settingKey, input.settingKey))
        .limit(1);

      if (existing.length > 0) {
        await database
          .update(adminSettings)
          .set({
            settingValue: input.settingValue,
            settingType: input.settingType,
            category: input.category,
            labelAr: input.labelAr,
            labelFr: input.labelFr,
            labelEn: input.labelEn,
            description: input.description,
          })
          .where(eq(adminSettings.settingKey, input.settingKey));
      } else {
        await database.insert(adminSettings).values(input);
      }
      return { success: true };
    }),

  // --- Platform Messages ---
  getMessages: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    return database.select().from(platformMessages).orderBy(asc(platformMessages.messageKey));
  }),

  upsertMessage: adminOnlyProcedure
    .input(
      z.object({
        id: z.number().optional(),
        messageKey: z.string(),
        contentAr: z.string().nullable().optional(),
        contentFr: z.string().nullable().optional(),
        contentEn: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        displayLocation: z.string().optional(),
        messageType: z.enum(["info", "warning", "success", "promo"]).optional(),
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      if (input.id) {
        const { id, ...data } = input;
        await database.update(platformMessages).set(data).where(eq(platformMessages.id, id));
      } else {
        await database.insert(platformMessages).values(input);
      }
      return { success: true };
    }),

  deleteMessage: adminOnlyProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      await database.delete(platformMessages).where(eq(platformMessages.id, input.id));
      return { success: true };
    }),

  // --- Utility: Check & increment usage (used by tools) ---
  checkUsageLimit: protectedProcedure
    .input(z.object({ toolKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const monthYear = getCurrentMonthYear();

      // Get tool config
      const [toolConfig] = await database
        .select()
        .from(toolConfigurations)
        .where(eq(toolConfigurations.toolKey, input.toolKey))
        .limit(1);

      if (!toolConfig) {
        return { allowed: true, remaining: -1, limit: 0, message: "" };
      }

      // Check if tool is enabled
      if (!toolConfig.isEnabled) {
        return { allowed: false, remaining: 0, limit: 0, message: "هذه الأداة معطلة حالياً" };
      }

      // Get user's tier
      const [perm] = await database
        .select()
        .from(servicePermissions)
        .where(eq(servicePermissions.userId, ctx.user.id))
        .limit(1);

      const tier = perm?.tier || "free";

      // Check tier access
      if (tier === "free" && !toolConfig.freeAccess) {
        return { allowed: false, remaining: 0, limit: 0, message: "يتطلب اشتراك Pro أو أعلى" };
      }

      // Get limit for this tier
      let limit = 0;
      if (tier === "free") limit = toolConfig.freeLimitPerMonth;
      else if (tier === "pro") limit = toolConfig.proLimitPerMonth;
      else if (tier === "premium") limit = toolConfig.premiumLimitPerMonth;

      // 0 means unlimited
      if (limit === 0) {
        return { allowed: true, remaining: -1, limit: 0, message: "" };
      }

      // Get current usage
      const [usage] = await database
        .select()
        .from(toolUsageTracking)
        .where(
          and(
            eq(toolUsageTracking.userId, ctx.user.id),
            eq(toolUsageTracking.toolKey, input.toolKey),
            eq(toolUsageTracking.monthYear, monthYear)
          )
        )
        .limit(1);

      const currentUsage = usage?.operationCount ?? 0;
      const remaining = limit - currentUsage;

      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          limit,
          message: `لقد استنفدت حد الاستخدام الشهري (${limit} عملية)`,
        };
      }

      return { allowed: true, remaining, limit, message: "" };
    }),

  // Increment usage counter
  incrementUsage: protectedProcedure
    .input(
      z.object({
        toolKey: z.string(),
        operationCount: z.number().default(1),
        imageCount: z.number().default(0),
        fileUploadCount: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const monthYear = getCurrentMonthYear();

      const [existing] = await database
        .select()
        .from(toolUsageTracking)
        .where(
          and(
            eq(toolUsageTracking.userId, ctx.user.id),
            eq(toolUsageTracking.toolKey, input.toolKey),
            eq(toolUsageTracking.monthYear, monthYear)
          )
        )
        .limit(1);

      if (existing) {
        await database
          .update(toolUsageTracking)
          .set({
            operationCount: sql`${toolUsageTracking.operationCount} + ${input.operationCount}`,
            imageCount: sql`${toolUsageTracking.imageCount} + ${input.imageCount}`,
            fileUploadCount: sql`${toolUsageTracking.fileUploadCount} + ${input.fileUploadCount}`,
            lastUsedAt: new Date(),
          })
          .where(eq(toolUsageTracking.id, existing.id));
      } else {
        await database.insert(toolUsageTracking).values({
          userId: ctx.user.id,
          toolKey: input.toolKey,
          monthYear,
          operationCount: input.operationCount,
          imageCount: input.imageCount,
          fileUploadCount: input.fileUploadCount,
        });
      }

      return { success: true };
    }),

  // Reset a user's monthly usage (admin only)
  resetUserUsage: adminOnlyProcedure
    .input(z.object({
      userId: z.number(),
      toolKey: z.string().optional(), // if omitted, reset all tools
    }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const monthYear = getCurrentMonthYear();

      if (input.toolKey) {
        await database
          .update(toolUsageTracking)
          .set({ operationCount: 0, imageCount: 0, fileUploadCount: 0 })
          .where(
            and(
              eq(toolUsageTracking.userId, input.userId),
              eq(toolUsageTracking.toolKey, input.toolKey),
              eq(toolUsageTracking.monthYear, monthYear)
            )
          );
      } else {
        await database
          .update(toolUsageTracking)
          .set({ operationCount: 0, imageCount: 0, fileUploadCount: 0 })
          .where(
            and(
              eq(toolUsageTracking.userId, input.userId),
              eq(toolUsageTracking.monthYear, monthYear)
            )
          );
      }

      return { success: true };
    }),

  // Get recent AI activity feed (enhanced)
  getRecentActivity: adminOnlyProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      activityType: z.string().optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const offset = (input.page - 1) * input.limit;

      let conditions: any[] = [];
      if (input.activityType) {
        conditions.push(eq(aiActivityLog.activityType, input.activityType as any));
      }
      if (input.userId) {
        conditions.push(eq(aiActivityLog.userId, input.userId));
      }

      const query = conditions.length > 0
        ? database.select().from(aiActivityLog).where(and(...conditions))
        : database.select().from(aiActivityLog);

      const activities = await query
        .orderBy(desc(aiActivityLog.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalQuery = conditions.length > 0
        ? database.select({ count: count() }).from(aiActivityLog).where(and(...conditions))
        : database.select({ count: count() }).from(aiActivityLog);
      const [totalResult] = await totalQuery;

      return {
        activities,
        total: totalResult?.count ?? 0,
        page: input.page,
        totalPages: Math.ceil((totalResult?.count ?? 0) / input.limit),
      };
    }),

  // Send notification to all users or specific user
  sendNotification: adminOnlyProcedure
    .input(z.object({
      userId: z.number().optional(), // if omitted, send to all
      titleAr: z.string(),
      messageAr: z.string(),
      type: z.string().default("system"),
    }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;

      if (input.userId) {
        await database.insert(notifications).values({
          userId: input.userId,
          titleAr: input.titleAr,
          messageAr: input.messageAr,
          type: input.type as any,
        });
        return { success: true, count: 1 };
      }

      // Send to all users
      const allUsers = await database.select({ id: users.id }).from(users);
      for (const u of allUsers) {
        await database.insert(notifications).values({
          userId: u.id,
          titleAr: input.titleAr,
          messageAr: input.messageAr,
          type: input.type as any,
        });
      }
      return { success: true, count: allUsers.length };
    }),

  // ============================================
  // 6. PAGE MANAGEMENT
  // ============================================

  // Get all page configurations
  getPageConfigs: adminOnlyProcedure.query(async () => {
    const database = (await getDb())!;
    const pages = await database.select().from(pageConfigurations).orderBy(asc(pageConfigurations.sortOrder));
    return pages;
  }),

  // Seed default page configurations from existing routes
  seedPageConfigs: adminOnlyProcedure.mutation(async () => {
    const database = (await getDb())!;
    const existing = await database.select().from(pageConfigurations);
    if (existing.length > 0) {
      return { message: "Pages already seeded", count: existing.length };
    }
    const defaultPages = [
      { pageKey: "home", titleAr: "الرئيسية", titleFr: "Accueil", titleEn: "Home", path: "/", icon: "Home", category: "main", sortOrder: 0, pageType: "built_in" as const },
      { pageKey: "teacher-tools", titleAr: "أدوات الذكاء الاصطناعي", titleFr: "Outils IA", titleEn: "AI Tools", path: "/teacher-tools", icon: "Sparkles", category: "main", sortOrder: 1, pageType: "built_in" as const },
      { pageKey: "lesson-bank", titleAr: "بنك الدروس", titleFr: "Banque de leçons", titleEn: "Lesson Bank", path: "/lesson-bank", icon: "BookOpen", category: "main", sortOrder: 2, pageType: "built_in" as const },
      { pageKey: "about", titleAr: "من نحن", titleFr: "À propos", titleEn: "About Us", path: "/about", icon: "Info", category: "main", sortOrder: 3, pageType: "built_in" as const },
      { pageKey: "courses", titleAr: "الدورات", titleFr: "Cours", titleEn: "Courses", path: "/courses", icon: "GraduationCap", category: "main", sortOrder: 4, pageType: "built_in" as const },
      { pageKey: "pricing", titleAr: "الأسعار", titleFr: "Tarifs", titleEn: "Pricing", path: "/pricing", icon: "CreditCard", category: "main", sortOrder: 5, pageType: "built_in" as const },
      { pageKey: "contact", titleAr: "تواصل معنا", titleFr: "Contactez-nous", titleEn: "Contact Us", path: "/contact", icon: "Mail", category: "main", sortOrder: 6, pageType: "built_in" as const },
      // AI Tools
      { pageKey: "edugpt", titleAr: "المساعد الذكي EDUGPT", titleFr: "Assistant EDUGPT", titleEn: "EDUGPT Assistant", path: "/edugpt", icon: "MessageSquare", category: "ai_tools", sortOrder: 10, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "lesson-planner", titleAr: "تحضير الدروس الفوري", titleFr: "Préparation de leçons", titleEn: "Lesson Planner", path: "/lesson-planner", icon: "FileText", category: "ai_tools", sortOrder: 11, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "exam-builder", titleAr: "بنك التقييمات الذكي", titleFr: "Banque d'évaluations", titleEn: "Exam Builder", path: "/exam-builder", icon: "FileEdit", category: "ai_tools", sortOrder: 12, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "inspector", titleAr: "المتفقد الذكي", titleFr: "Inspecteur intelligent", titleEn: "Smart Inspector", path: "/inspector", icon: "Search", category: "ai_tools", sortOrder: 13, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "visual-studio", titleAr: "استوديو الصور التعليمية", titleFr: "Studio visuel", titleEn: "Visual Studio", path: "/visual-studio", icon: "Palette", category: "ai_tools", sortOrder: 14, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "blind-grading", titleAr: "مساعد التصحيح الذكي", titleFr: "Correction intelligente", titleEn: "Smart Grading", path: "/blind-grading", icon: "FileCheck", category: "ai_tools", sortOrder: 15, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "curriculum-map", titleAr: "خريطة المنهج الذكية", titleFr: "Carte du programme", titleEn: "Curriculum Map", path: "/curriculum-map", icon: "BarChart3", category: "ai_tools", sortOrder: 16, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "drama-engine", titleAr: "محرك الدراما التعليمية", titleFr: "Moteur de théâtre", titleEn: "Drama Engine", path: "/drama-engine", icon: "Theater", category: "ai_tools", sortOrder: 17, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "handwriting-analyzer", titleAr: "محلل خط اليد الذكي", titleFr: "Analyseur d'écriture", titleEn: "Handwriting Analyzer", path: "/handwriting-analyzer", icon: "Brain", category: "ai_tools", sortOrder: 18, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "video-evaluator", titleAr: "مُقيِّم المعلم الرقمي", titleFr: "Évaluateur vidéo", titleEn: "Video Evaluator", path: "/video-evaluator", icon: "Film", category: "ai_tools", sortOrder: 19, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "legacy-digitizer", titleAr: "رقمنة الوثائق التعليمية", titleFr: "Numérisation", titleEn: "Legacy Digitizer", path: "/legacy-digitizer", icon: "ScanLine", category: "ai_tools", sortOrder: 20, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "prompt-lab", titleAr: "مختبر هندسة الأوامر", titleFr: "Labo Prompt", titleEn: "Prompt Lab", path: "/prompt-lab", icon: "Sparkles", category: "ai_tools", sortOrder: 21, pageType: "built_in" as const },
      { pageKey: "marketplace", titleAr: "سوق المحتوى الذهبي", titleFr: "Marché du contenu", titleEn: "Content Marketplace", path: "/marketplace", icon: "Store", category: "ai_tools", sortOrder: 22, pageType: "built_in" as const },
      // Profile & Certificates
      { pageKey: "my-certificates", titleAr: "شهاداتي", titleFr: "Mes certificats", titleEn: "My Certificates", path: "/my-certificates", icon: "Award", category: "profile", sortOrder: 30, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "verify-certificate", titleAr: "التحقق من شهادة", titleFr: "Vérifier un certificat", titleEn: "Verify Certificate", path: "/verify-certificate", icon: "CheckCircle", category: "profile", sortOrder: 31, pageType: "built_in" as const },
      { pageKey: "my-portfolio", titleAr: "ملفي المهني", titleFr: "Mon portfolio", titleEn: "My Portfolio", path: "/my-portfolio", icon: "Star", category: "profile", sortOrder: 32, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "my-assignments", titleAr: "واجباتي", titleFr: "Mes devoirs", titleEn: "My Assignments", path: "/my-assignments", icon: "ClipboardList", category: "profile", sortOrder: 33, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "job-board", titleAr: "فرص العمل", titleFr: "Offres d'emploi", titleEn: "Job Board", path: "/job-board", icon: "Briefcase", category: "profile", sortOrder: 34, pageType: "built_in" as const },
      { pageKey: "my-applications", titleAr: "طلباتي", titleFr: "Mes candidatures", titleEn: "My Applications", path: "/my-applications", icon: "FileText", category: "profile", sortOrder: 35, pageType: "built_in" as const, requiresAuth: true },
      { pageKey: "skills-directory", titleAr: "دليل الكفاءات", titleFr: "Répertoire des compétences", titleEn: "Skills Directory", path: "/skills-directory", icon: "Users", category: "profile", sortOrder: 36, pageType: "built_in" as const },
    ];
    for (const page of defaultPages) {
      await database.insert(pageConfigurations).values({
        pageKey: page.pageKey,
        titleAr: page.titleAr,
        titleFr: page.titleFr || null,
        titleEn: page.titleEn || null,
        path: page.path,
        icon: page.icon || null,
        category: page.category || null,
        sortOrder: page.sortOrder,
        pageType: page.pageType,
        isVisible: true,
        isEnabled: true,
        requiresAuth: page.requiresAuth || false,
      });
    }
    return { message: "Pages seeded successfully", count: defaultPages.length };
  }),

  // Update a page configuration
  updatePageConfig: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        titleFr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionFr: z.string().optional(),
        descriptionEn: z.string().optional(),
        isVisible: z.boolean().optional(),
        isEnabled: z.boolean().optional(),
        requiresAuth: z.boolean().optional(),
        requiredTier: z.enum(["free", "pro", "premium"]).optional(),
        sortOrder: z.number().optional(),
        badgeText: z.string().nullable().optional(),
        badgeColor: z.string().nullable().optional(),
        icon: z.string().optional(),
        externalUrl: z.string().nullable().optional(),
        customContent: z.string().nullable().optional(),
        metaTitle: z.string().nullable().optional(),
        metaDescription: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const { id, ...data } = input;
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await database.update(pageConfigurations).set(cleanData).where(eq(pageConfigurations.id, id));
      return { success: true };
    }),

  // Add a new custom page
  addCustomPage: adminOnlyProcedure
    .input(
      z.object({
        pageKey: z.string().min(2).max(100),
        titleAr: z.string().min(1),
        titleFr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        path: z.string().min(1),
        icon: z.string().optional(),
        category: z.string().optional(),
        pageType: z.enum(["custom", "external_link"]),
        externalUrl: z.string().optional(),
        customContent: z.string().optional(),
        requiresAuth: z.boolean().default(false),
        requiredTier: z.enum(["free", "pro", "premium"]).default("free"),
        isVisible: z.boolean().default(true),
        badgeText: z.string().optional(),
        badgeColor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      // Get max sort order
      const maxSort = await database
        .select({ maxOrder: sql<number>`MAX(${pageConfigurations.sortOrder})` })
        .from(pageConfigurations);
      const nextOrder = (maxSort[0]?.maxOrder ?? 0) + 1;

      await database.insert(pageConfigurations).values({
        pageKey: input.pageKey,
        titleAr: input.titleAr,
        titleFr: input.titleFr || null,
        titleEn: input.titleEn || null,
        descriptionAr: input.descriptionAr || null,
        path: input.path,
        icon: input.icon || null,
        category: input.category || null,
        pageType: input.pageType,
        externalUrl: input.externalUrl || null,
        customContent: input.customContent || null,
        requiresAuth: input.requiresAuth,
        requiredTier: input.requiredTier as any,
        isVisible: input.isVisible,
        isEnabled: true,
        sortOrder: nextOrder,
        badgeText: input.badgeText || null,
        badgeColor: input.badgeColor || null,
      });
      return { success: true };
    }),

  // Delete a custom page (only custom/external pages can be deleted)
  deleteCustomPage: adminOnlyProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const page = await database.select().from(pageConfigurations).where(eq(pageConfigurations.id, input.id));
      if (!page[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      if (page[0].pageType === "built_in") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete built-in pages. You can hide them instead." });
      }
      await database.delete(pageConfigurations).where(eq(pageConfigurations.id, input.id));
      return { success: true };
    }),

  // Bulk update page visibility (toggle multiple pages at once)
  bulkUpdatePageVisibility: adminOnlyProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            id: z.number(),
            isVisible: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      for (const update of input.updates) {
        await database
          .update(pageConfigurations)
          .set({ isVisible: update.isVisible })
          .where(eq(pageConfigurations.id, update.id));
      }
      return { success: true, count: input.updates.length };
    }),

  // Reorder pages
  reorderPages: adminOnlyProcedure
    .input(
      z.object({
        orders: z.array(
          z.object({
            id: z.number(),
            sortOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      for (const order of input.orders) {
        await database
          .update(pageConfigurations)
          .set({ sortOrder: order.sortOrder })
          .where(eq(pageConfigurations.id, order.id));
      }
      return { success: true };
    }),
});
