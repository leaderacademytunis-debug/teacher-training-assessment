import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { contactRequests, users, auditLogs } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { notifyOwner } from '../_core/notification';

export const contactRequestsRouter = router({
  /**
   * Create a new contact request
   * Requires authentication and Pro/Expert subscription
   */
  create: protectedProcedure
    .input(
      z.object({
        teacherId: z.number(),
        teacherName: z.string().min(2),
        teacherEmail: z.string().email(),
        teacherPhone: z.string().min(8),
        subject: z.string().min(3),
        message: z.string().min(10),
        subscriptionRequired: z.boolean().default(true),
        subscriptionType: z.enum(['free', 'pro', 'expert']).default('pro'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Check if user has required subscription
      if (input.subscriptionRequired) {
        const userSub = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (!userSub[0] || userSub[0].role === 'user') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'يجب أن تكون مشتركاً في خطة Pro أو Expert للوصول إلى هذه الميزة',
          });
        }
      }

      // Create contact request
      const result = await db.insert(contactRequests).values({
        teacherId: input.teacherId,
        teacherName: input.teacherName,
        teacherEmail: input.teacherEmail,
        teacherPhone: input.teacherPhone,
        subject: input.subject,
        message: input.message,
        subscriptionRequired: input.subscriptionRequired,
        subscriptionType: input.subscriptionType,
        status: 'pending',
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Log the action
      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: 'CREATE_CONTACT_REQUEST',
        targetUserId: input.teacherId,
        targetType: 'contact_request',
        description: `Contact request created: ${input.subject}`,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      // Notify owner
      await notifyOwner({
        title: '📞 طلب اتصال جديد',
        content: `المعلم ${input.teacherName} طلب الاتصال - ${input.subject}`,
      });

      return {
        success: true,
        id: result[0].insertId,
        message: 'تم إرسال طلب الاتصال بنجاح',
      };
    }),

  /**
   * Get all contact requests for admin
   */
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'contacted', 'accepted', 'rejected', 'expired']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view all requests
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'trainer') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية لعرض طلبات الاتصال',
        });
      }

      const db = await getDb();

      const where = input.status
        ? and(eq(contactRequests.status, input.status))
        : undefined;

      const requests = await db
        .select()
        .from(contactRequests)
        .where(where)
        .orderBy(desc(contactRequests.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return requests;
    }),

  /**
   * Get contact requests for a specific teacher
   */
  getByTeacher: protectedProcedure
    .input(
      z.object({
        teacherId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();

      // User can only view their own requests
      if (ctx.user.id !== input.teacherId && ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية لعرض هذه الطلبات',
        });
      }

      const requests = await db
        .select()
        .from(contactRequests)
        .where(eq(contactRequests.teacherId, input.teacherId))
        .orderBy(desc(contactRequests.createdAt));

      return requests;
    }),

  /**
   * Update contact request status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        status: z.enum(['pending', 'contacted', 'accepted', 'rejected', 'expired']),
        response: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can update status
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'trainer') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية لتحديث حالة الطلب',
        });
      }

      const db = await getDb();

      // Update the request
      await db
        .update(contactRequests)
        .set({
          status: input.status,
          schoolResponse: input.response,
          respondedAt: new Date(),
          respondedBy: ctx.user.id,
        })
        .where(eq(contactRequests.id, input.requestId));

      // Log the action
      await db.insert(auditLogs).values({
        adminId: ctx.user.id,
        action: 'UPDATE_CONTACT_REQUEST_STATUS',
        targetType: 'contact_request',
        description: `Contact request status updated to: ${input.status}`,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      return { success: true, message: 'تم تحديث حالة الطلب بنجاح' };
    }),

  /**
   * Get contact request statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view stats
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'trainer') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'ليس لديك صلاحية لعرض الإحصائيات',
      });
    }

    const db = await getDb();

    // Get counts by status
    const statuses = ['pending', 'contacted', 'accepted', 'rejected', 'expired'] as const;
    const stats: Record<string, number> = {};

    for (const status of statuses) {
      const result = await db
        .select()
        .from(contactRequests)
        .where(eq(contactRequests.status, status));
      stats[status] = result.length;
    }

    return {
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      byStatus: stats,
      thisMonth: stats.pending + stats.contacted,
    };
  }),
});
