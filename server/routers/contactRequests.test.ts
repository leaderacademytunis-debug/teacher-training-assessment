import { describe, it, expect, beforeEach, vi } from 'vitest';
import { contactRequestsRouter } from './contactRequests';
import { getDb } from '../db';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

// Mock notification system
vi.mock('../_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('Contact Requests Router', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue({ insertId: 1 }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe('create', () => {
    it('should create a contact request successfully', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const input = {
        teacherId: 2,
        teacherName: 'أحمد محمد',
        teacherEmail: 'ahmed@example.com',
        teacherPhone: '98765432',
        subject: 'طلب توظيف',
        message: 'أنا معلم متخصص في الرياضيات',
        subscriptionRequired: true,
        subscriptionType: 'pro' as const,
      };

      mockDb.insert.mockReturnThis();
      mockDb.values.mockResolvedValue({ insertId: 1 });

      const result = await caller.create(input);

      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should reject unauthenticated users', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: null,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const input = {
        teacherId: 2,
        teacherName: 'أحمد محمد',
        teacherEmail: 'ahmed@example.com',
        teacherPhone: '98765432',
        subject: 'طلب توظيف',
        message: 'أنا معلم متخصص في الرياضيات',
        subscriptionRequired: true,
        subscriptionType: 'pro' as const,
      };

      expect(async () => {
        await caller.create(input);
      }).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const invalidInput = {
        teacherId: 2,
        teacherName: '', // Invalid: empty name
        teacherEmail: 'not-an-email', // Invalid: not an email
        teacherPhone: '123', // Invalid: too short
        subject: 'ab', // Invalid: too short
        message: 'short', // Invalid: too short
        subscriptionRequired: true,
        subscriptionType: 'pro' as const,
      };

      expect(async () => {
        await caller.create(invalidInput);
      }).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return all contact requests for admin', async () => {
      const mockRequests = [
        {
          id: 1,
          teacherId: 2,
          teacherName: 'أحمد محمد',
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      mockDb.insert.mockReturnThis();
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.orderBy.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockResolvedValue(mockRequests);

      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'admin' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const result = await caller.getAll({ limit: 20, offset: 0 });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(async () => {
        await caller.getAll({ limit: 20, offset: 0 });
      }).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update contact request status', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'admin' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue({ success: true });

      const result = await caller.updateStatus({
        requestId: 1,
        status: 'contacted',
        response: 'تم التواصل مع المعلم',
      });

      expect(result.success).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should reject non-admin users from updating status', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(async () => {
        await caller.updateStatus({
          requestId: 1,
          status: 'contacted',
          response: 'تم التواصل مع المعلم',
        });
      }).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return contact request statistics for admin', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'admin' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockResolvedValue([
        { id: 1, status: 'pending' },
        { id: 2, status: 'contacted' },
      ]);

      const result = await caller.getStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('thisMonth');
    });

    it('should reject non-admin users from viewing stats', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(async () => {
        await caller.getStats();
      }).rejects.toThrow();
    });
  });

  describe('Contact request validation', () => {
    it('should validate email format', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const invalidInput = {
        teacherId: 2,
        teacherName: 'أحمد محمد',
        teacherEmail: 'invalid-email',
        teacherPhone: '98765432',
        subject: 'طلب توظيف',
        message: 'أنا معلم متخصص في الرياضيات',
        subscriptionRequired: true,
        subscriptionType: 'pro' as const,
      };

      expect(async () => {
        await caller.create(invalidInput);
      }).rejects.toThrow();
    });

    it('should validate phone number length', async () => {
      const caller = contactRequestsRouter.createCaller({
        user: { id: 1, role: 'teacher' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      const invalidInput = {
        teacherId: 2,
        teacherName: 'أحمد محمد',
        teacherEmail: 'ahmed@example.com',
        teacherPhone: '123', // Too short
        subject: 'طلب توظيف',
        message: 'أنا معلم متخصص في الرياضيات',
        subscriptionRequired: true,
        subscriptionType: 'pro' as const,
      };

      expect(async () => {
        await caller.create(invalidInput);
      }).rejects.toThrow();
    });
  });
});
