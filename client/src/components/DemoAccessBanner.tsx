import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoAccessBannerProps {
  onClose?: () => void;
  showLoginButton?: boolean;
}

export function DemoAccessBanner({ onClose, showLoginButton = true }: DemoAccessBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              🎯 <span className="font-bold">نسخة تجريبية (Demo)</span> - هذه نسخة معاينة من رادار الكفاءات
            </p>
            <p className="text-xs text-amber-700 mt-1">
              للوصول الكامل والاستفادة من جميع الميزات، يرجى تسجيل الدخول أو إنشاء حساب جديد
            </p>
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
