import { TalentRadar } from '@/components/TalentRadar';
import UnifiedNavbar from '@/components/UnifiedNavbar';
import { DemoAccessBanner } from '@/components/DemoAccessBanner';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';

export default function TalentRadarPage() {
  const user = useAuth();
  const [bannerVisible, setBannerVisible] = useState(!user);
  const trackDemoAccess = trpc.analytics.trackDemoAccess.useMutation();

  // Track demo access when component mounts
  useEffect(() => {
    if (!user) {
      const sessionId = sessionStorage.getItem('sessionId') || `session-${Date.now()}`;
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', sessionId);
      }

      trackDemoAccess.mutate({
        pageUrl: '/talent-radar',
        sessionId,
        userAgent: navigator.userAgent,
      });
    }
  }, [user, trackDemoAccess]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <UnifiedNavbar />
      {bannerVisible && !user && (
        <DemoAccessBanner onClose={() => setBannerVisible(false)} />
      )}
      <div className="w-full">
        <TalentRadar />
      </div>
    </div>
  );
}
