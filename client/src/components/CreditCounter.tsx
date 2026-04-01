import { Gift, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function CreditCounter() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user credits
  const { data: userCredits } = trpc.profileBuilder.getUserProfile.useQuery(undefined, {
    onSuccess: (data) => {
      if (data) {
        setCredits(data.freeCredits || 0);
      }
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  if (isLoading) {
    return (
      <div className="h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg animate-pulse" />
    );
  }

  if (credits === null || credits === undefined) {
    return null;
  }

  // Determine urgency level
  const isUrgent = credits <= 3;
  const isAlmostGone = credits === 0;

  return (
    <div
      className={`w-full px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300 ${
        isAlmostGone
          ? 'bg-red-100 text-red-800 border-2 border-red-300'
          : isUrgent
          ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
          : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Gift className={`h-5 w-5 ${isAlmostGone ? 'animate-bounce' : ''}`} />
        
        {isAlmostGone ? (
          <>
            <span>⚠️ انتهى رصيدك المجاني!</span>
            <AlertCircle className="h-5 w-5 animate-pulse" />
          </>
        ) : (
          <>
            <span>🎁 متبقي لك {credits} جذاذات مجانية!</span>
            {isUrgent && <span className="ml-2 animate-pulse">استخدمها الآن قبل انتهاؤها!</span>}
          </>
        )}
      </div>

      {/* Urgency message */}
      {isUrgent && !isAlmostGone && (
        <p className="text-xs mt-1 opacity-90">
          ⏰ جرب الآن واستفد من رصيدك المجاني قبل انتهاؤه!
        </p>
      )}

      {isAlmostGone && (
        <p className="text-xs mt-1 opacity-90">
          📦 ترقّ إلى خطة Pro للحصول على رصيد غير محدود
        </p>
      )}
    </div>
  );
}
