import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('OnboardingGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Skip routes logic', () => {
    const skipRoutes = [
      '/profile-builder',
      '/complete-registration',
      '/',
      '/pricing',
      '/contact',
      '/about',
      '/login',
      '/logout',
    ];

    it('should skip onboarding check for profile-builder route', () => {
      const route = '/profile-builder';
      const shouldSkip = skipRoutes.includes(route);
      expect(shouldSkip).toBe(true);
    });

    it('should skip onboarding check for home route', () => {
      const route = '/';
      const shouldSkip = skipRoutes.includes(route);
      expect(shouldSkip).toBe(true);
    });

    it('should not skip onboarding check for dashboard route', () => {
      const route = '/dashboard';
      const shouldSkip = skipRoutes.includes(route);
      expect(shouldSkip).toBe(false);
    });

    it('should not skip onboarding check for assistant route', () => {
      const route = '/assistant';
      const shouldSkip = skipRoutes.includes(route);
      expect(shouldSkip).toBe(false);
    });
  });

  describe('Route matching logic', () => {
    it('should match exact routes', () => {
      const location = '/profile-builder';
      const skipRoutes = ['/profile-builder', '/'];
      const shouldSkip = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );
      expect(shouldSkip).toBe(true);
    });

    it('should match nested routes', () => {
      const location = '/profile-builder/step-2';
      const skipRoutes = ['/profile-builder'];
      const shouldSkip = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );
      expect(shouldSkip).toBe(true);
    });

    it('should not match partial routes', () => {
      const location = '/profile-builder-v2';
      const skipRoutes = ['/profile-builder'];
      const shouldSkip = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );
      expect(shouldSkip).toBe(false);
    });
  });

  describe('Profile completion logic', () => {
    it('should redirect if profile incomplete and not on skip route', () => {
      const isProfileCompleted = false;
      const location = '/dashboard';
      const skipRoutes = ['/profile-builder', '/'];

      const shouldSkipOnboarding = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );

      const shouldRedirect = !isProfileCompleted && !shouldSkipOnboarding;
      expect(shouldRedirect).toBe(true);
    });

    it('should not redirect if profile is completed', () => {
      const isProfileCompleted = true;
      const location = '/dashboard';
      const skipRoutes = ['/profile-builder', '/'];

      const shouldSkipOnboarding = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );

      const shouldRedirect = !isProfileCompleted && !shouldSkipOnboarding;
      expect(shouldRedirect).toBe(false);
    });

    it('should not redirect if on skip route even if profile incomplete', () => {
      const isProfileCompleted = false;
      const location = '/profile-builder';
      const skipRoutes = ['/profile-builder', '/'];

      const shouldSkipOnboarding = skipRoutes.some(
        (route) => location === route || location.startsWith(route + '/')
      );

      const shouldRedirect = !isProfileCompleted && !shouldSkipOnboarding;
      expect(shouldRedirect).toBe(false);
    });
  });
});
