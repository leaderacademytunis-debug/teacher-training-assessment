import React from 'react';
import { AlertCircle, X, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface DemoAccessBannerProps {
  onClose?: () => void;
  showLoginButton?: boolean;
}

export function DemoAccessBanner({ onClose, showLoginButton = true }: DemoAccessBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  
  // Fetch live statistics
  const { data: usersCount } = trpc.analytics.getTotalUsersCount.useQuery();
  const { data: demoStats } = trpc.analytics.getDemoAccessStats.useQuery();

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  // Format numbers for display
  const formattedUsers = usersCount ? Math.round(usersCount / 100) * 100 : 0;
  const formattedVisits = demoStats?.totalDemoVisits || 0;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              🎯 <span className="font-bold">نسخة تجريبية (Demo)</span> - هذه نسخة معاينة من رادار الكفاءات
            </p>
            <p className="text-xs text-amber-700 mt-1">
              للوصول الكامل والاستفادة من جميع الميزات، يرجى تسجيل الدخول أو إنشاء حساب جديد
            </p>
            
            {/* Live Statistics */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              {formattedUsers > 0 && (
                <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                  <Users className="w-3 h-3 text-green-600" />
                  <span className="text-amber-800 font-semibold">
                    {formattedUsers}+ معلم انضموا بالفعل
                  </span>
                </div>
              )}
              {formattedVisits > 0 && (
                <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-amber-800 font-semibold">
                    {formattedVisits} زيارة تجريبية
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {showLoginButton && (
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.location.href = '/login'}
            >
              تسجيل الدخول
            </Button>
          )}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-amber-200 rounded-md transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
