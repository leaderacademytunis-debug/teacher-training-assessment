import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function WeeklyChallenges() {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());

  const { data: challenges, isLoading, refetch } = trpc.weeklyChallenges.getActiveChallengesForUser.useQuery();
  const completeMutation = trpc.weeklyChallenges.completeChallengeAndAwardPoints.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Calculate time remaining until end of week
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const daysUntilSunday = 7 - now.getDay();
      const hoursRemaining = 23 - now.getHours();
      const minutesRemaining = 59 - now.getMinutes();

      if (daysUntilSunday === 0) {
        setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m متبقي`);
      } else {
        setTimeRemaining(`${daysUntilSunday} أيام متبقية`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleCompleteChallenge = async (challengeId: number) => {
    try {
      await completeMutation.mutateAsync({ challengeId });
      setCompletedChallenges((prev) => new Set([...prev, challengeId]));
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            التحديات الأسبوعية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  const totalChallenges = challenges?.length || 0;
  const completedCount = completedChallenges.size;
  const completionPercentage = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  return (
    <Card className="mb-8 border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <CardTitle>التحديات الأسبوعية</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {timeRemaining}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {completedCount}/{totalChallenges}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">التقدم الكلي</span>
            <span className="text-sm text-gray-500">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge) => {
              const isCompleted = completedChallenges.has(challenge.id);
              const progressPercent = (challenge.progress.currentCount / challenge.targetCount) * 100;

              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <Target className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{challenge.titleAr}</h3>
                        <p className="text-sm text-gray-600 mt-1">{challenge.descriptionAr}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                      +{challenge.bonusPoints}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        {challenge.progress.currentCount}/{challenge.targetCount}
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>

                  {/* Action Button */}
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      تم الإكمال! ربحت {challenge.progress.bonusPointsAwarded} نقطة
                    </div>
                  ) : challenge.progress.completed ? (
                    <Button
                      onClick={() => handleCompleteChallenge(challenge.id)}
                      disabled={completeMutation.isPending}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {completeMutation.isPending ? "جاري المعالجة..." : "استلام المكافأة"}
                    </Button>
                  ) : (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      أكمل التحدي لاستلام المكافأة
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد تحديات هذا الأسبوع</p>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>نصيحة:</strong> أكمل جميع التحديات هذا الأسبوع لكسب نقاط إضافية وتحسين مستوى كفاءتك الرقمية!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
