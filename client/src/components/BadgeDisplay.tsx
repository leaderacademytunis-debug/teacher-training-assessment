import { Medal, Star, Crown, Gem } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BadgeItem {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  color: string;
  earnedAt: Date;
}

interface BadgeDisplayProps {
  badges: BadgeItem[];
  showEmpty?: boolean;
  className?: string;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'medal':
      return Medal;
    case 'star':
      return Star;
    case 'crown':
      return Crown;
    case 'gem':
      return Gem;
    default:
      return Medal;
  }
};

export function BadgeDisplay({
  badges,
  showEmpty = true,
  className = '',
}: BadgeDisplayProps) {
  if (badges.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div className={`w-full ${className}`} dir="rtl">
      {badges.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            🏆 الشارات المكتسبة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {badges.map((badge) => {
              const IconComponent = getIconComponent(badge.icon);
              return (
                <Card
                  key={badge.id}
                  className="hover:shadow-lg transition-shadow border-2"
                  style={{ borderColor: badge.color }}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <div
                      className="flex justify-center mb-2"
                      style={{ color: badge.color }}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">
                      {badge.nameAr}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      {badge.descriptionAr}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(badge.earnedAt).toLocaleDateString('ar-TN')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-slate-600 mb-2">لم تحصل على أي شارات بعد</p>
            <p className="text-sm text-slate-500">
              ابدأ بإحالة المعلمين لكسب الشارات والمكافآت! 🚀
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
