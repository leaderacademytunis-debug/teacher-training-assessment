import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsRouter } from './analytics';
import { getDb } from '../db';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

describe('Analytics Router', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({ success: true }),
      }),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe('trackPageView', () => {
    it('should track page view successfully', async () => {
      const caller = analyticsRouter.createCaller({
        user: { id: 1, role: 'user' },
      });

      const result = await caller.trackPageView({
        pageUrl: '/talent-radar',
        pageTitle: 'Talent Radar',
        eventType: 'page_view',
        sessionId: 'session-123',
      });

      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should track page view without authentication', async () => {
      const caller = analyticsRouter.createCaller({
        user: null,
      });

      const result = await caller.trackPageView({
        pageUrl: '/talent-radar',
        pageTitle: 'Talent Radar',
        eventType: 'page_view',
        sessionId: 'session-456',
      });

      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database error');
      });

      const caller = analyticsRouter.createCaller({
        user: null,
      });

      const result = await caller.trackPageView({
        pageUrl: '/talent-radar',
        pageTitle: 'Talent Radar',
        eventType: 'page_view',
        sessionId: 'session-789',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('trackDemoAccess', () => {
    it('should track demo access successfully', async () => {
      const caller = analyticsRouter.createCaller({
        user: null,
      });

      const result = await caller.trackDemoAccess({
        pageUrl: '/talent-radar',
        sessionId: 'demo-session-123',
        userAgent: 'Mozilla/5.0',
      });

      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should include demo metadata', async () => {
      const caller = analyticsRouter.createCaller({
        user: null,
      });

      await caller.trackDemoAccess({
        pageUrl: '/talent-radar',
        sessionId: 'demo-session-456',
      });

      const insertCall = mockDb.insert.mock.calls[0];
      expect(insertCall).toBeDefined();
    });
  });
});
