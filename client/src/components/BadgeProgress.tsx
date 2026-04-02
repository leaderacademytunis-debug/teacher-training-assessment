import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BadgeProgressProps {
  totalBadges: number;
  completedReferrals: number;
  nextBadgeThreshold: number;
  nextBadgeName: string;
  progressPercent: number;
  className?: string;
}

export function BadgeProgress({
  totalBadges,
  completedReferrals,
  nextBadgeThreshold,
  nextBadgeName,
  progressPercent,
  className = '',
}: BadgeProgressProps) {
  const remainingReferrals = nextBadgeThreshold - completedReferrals;

  return (
    <Card className={`bg-gradient-to-r from-amber-50 to-orange-50 ${className}`} dir="rtl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">🎯 تقدمك نحو الشارة التالية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{totalBadges}</p>
            <p className="text-xs text-slate-600">شارات مكتسبة</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{completedReferrals}</p>
            <p className="text-xs text-slate-600">إحالات مكتملة</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{remainingReferrals}</p>
            <p className="text-xs text-slate-600">متبقي</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-900">
              {nextBadgeName}
            </span>
            <span className="text-sm text-slate-600">
              {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-slate-600 text-center">
            احصل على {remainingReferrals} إحالة {remainingReferrals === 1 ? 'أخرى' : 'أخرى'} لفتح الشارة
          </p>
        </div>

        {/* Motivation Message */}
        <div className="bg-white p-3 rounded-lg border-l-4 border-amber-500">
          <p className="text-sm text-slate-700">
            💡 <strong>نصيحة:</strong> شارك رابط الإحالة مع المزيد من المعلمين لتحقيق الشارة التالية!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
