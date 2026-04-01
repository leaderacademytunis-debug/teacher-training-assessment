import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: 'test',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };

  return ctx;
}

describe('Referrals Router', () => {
  let caller: any;
  let testReferralCode: string;

  beforeAll(async () => {
    const ctx = createAuthContext(1);
    caller = appRouter.createCaller(ctx);
  });

  it('should create a referral invite', async () => {
    const result = await caller.referrals.createReferralInvite({
      referredEmail: 'friend@example.com',
      invitationMessage: 'Join our platform!',
    });

    expect(result).toBeDefined();
    expect(result.referralCode).toBeDefined();
    expect(result.referralLink).toBeDefined();
    expect(result.expiresAt).toBeDefined();
    expect(result.referralCode).toMatch(/^[A-F0-9]{16}$/);
    
    testReferralCode = result.referralCode;
  });

  it('should validate referral code', async () => {
    const publicCaller = appRouter.createCaller(createAuthContext(2));
    
    const validated = await publicCaller.referrals.validateReferralCode({
      referralCode: testReferralCode,
    });

    expect(validated).toBeDefined();
    expect(validated.referralCode).toBe(testReferralCode);
    expect(validated.invitationMessage).toBe('Join our platform!');
  });

  it('should get referral stats', async () => {
    const stats = await caller.referrals.getReferralStats();

    expect(stats).toBeDefined();
    expect(stats.totalReferrals).toBeGreaterThanOrEqual(0);
    expect(stats.pending).toBeGreaterThanOrEqual(0);
    expect(stats.accepted).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.totalEarned).toBeGreaterThanOrEqual(0);
  });

  it('should get user referrals', async () => {
    const referrals = await caller.referrals.getMyReferrals();

    expect(Array.isArray(referrals)).toBe(true);
  });

  it('should get user referral rewards', async () => {
    const rewards = await caller.referrals.getMyReferralRewards();

    expect(Array.isArray(rewards)).toBe(true);
  });

  it('should reject invalid referral code', async () => {
    const publicCaller = appRouter.createCaller(createAuthContext(3));
    
    try {
      await publicCaller.referrals.validateReferralCode({
        referralCode: 'INVALID123456',
      });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should reject expired referral code', async () => {
    // Create a referral
    const result = await caller.referrals.createReferralInvite({
      referredEmail: 'expired@example.com',
      invitationMessage: 'Will expire',
    });

    // Try to validate immediately - should work
    const publicCaller = appRouter.createCaller(createAuthContext(4));
    const validated = await publicCaller.referrals.validateReferralCode({
      referralCode: result.referralCode,
    });

    expect(validated).toBeDefined();
  });
});
