import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

/**
 * OnboardingGuard Component
 * Checks if user's profile is complete on first login
 * Redirects to /profile-builder if incomplete
 * 
 * Pages that should skip this check:
 * - /profile-builder (onboarding page itself)
 * - /complete-registration (registration page)
 * - / (home page)
 * - /pricing (pricing page)
 * - /contact (contact page)
 * - /about (about page)
 */

const SKIP_ONBOARDING_ROUTES = [
  '/profile-builder',
  '/complete-registration',
  '/',
  '/pricing',
  '/contact',
  '/about',
  '/login',
  '/logout',
];

export default function OnboardingGuard() {
  const [location, setLocation] = useLocation();
  const user = useAuth();
  const [hasChecked, setHasChecked] = React.useState(false);

  // Query to check if profile is completed
  const { data: isProfileCompleted, isLoading } = trpc.profileBuilder.isProfileCompleted.useQuery(
    undefined,
    {
      enabled: !!user && !hasChecked, // Only run if user is authenticated and we haven't checked yet
      retry: 1,
    }
  );

  useEffect(() => {
    // Skip if user is not authenticated
    if (!user) {
      return;
    }

    // Skip if still loading
    if (isLoading) {
      return;
    }

    // Skip if we've already checked
    if (hasChecked) {
      return;
    }

    // Mark as checked
    setHasChecked(true);

    // Check if current route should skip onboarding
    const shouldSkipOnboarding = SKIP_ONBOARDING_ROUTES.some(
      (route) => location === route || location.startsWith(route + '/')
    );

    // If profile is incomplete and not on a skip route, redirect to profile builder
    if (!isProfileCompleted && !shouldSkipOnboarding) {
      console.log('[OnboardingGuard] Profile incomplete, redirecting to /profile-builder');
      setLocation('/profile-builder');
    }
  }, [user, isProfileCompleted, isLoading, hasChecked, location, setLocation]);

  // Show loading state while checking
  if (isLoading && user && !hasChecked) {
    return (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600 text-sm">جاري التحقق من ملفك المهني...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if check is complete
  return null;
}
