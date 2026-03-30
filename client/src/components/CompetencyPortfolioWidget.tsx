import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Trophy, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Competency Widget for My Portfolio Page
 * Displays current level, today's points, active challenge, and link to full analytics
 */
export function CompetencyPortfolioWidget() {
  // Mock data - in production, fetch from API
  const competencyData = {
    currentLevel: "خبير",
    totalPoints: 285,
    todayPoints: 15,
    nextLevelPoints: 300,
    progressPercent: 95,
    badge: "🏆",
    activeChallenge: {
      title: "أنشئ 3 جذاذات هذا الأسبوع",
      progress: 2,
      total: 3,
      pointsReward: 30,
    },
  };

  const levelColors: Record<string, { bg: string; text: string; icon: string }> = {
    "مبتدئ": { bg: "bg-blue-50", text: "text-blue-900", icon: "🌱" },
    "متطور": { bg: "bg-amber-50", text: "text-amber-900", icon: "📈" },
    "خبير": { bg: "bg-green-50", text: "text-green-900", icon: "⭐" },
    "ماهر رقمي": { bg: "bg-purple-50", text: "text-purple-900", icon: "👑" },
  };

  const levelColor = levelColors[competencyData.currentLevel] || levelColors["متطور"];

  return (
    <Card className="border-0 shadow-lg mb-8 overflow-hidden">
      <div className={`${levelColor.bg} p-6 border-b-2 border-green-500`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{levelColor.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">كفاءتك الرقمية</h2>
                <p className={`text-sm ${levelColor.text}`}>مستوى: {competencyData.currentLevel}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{competencyData.totalPoints}</div>
            <p className="text-sm text-slate-600">نقطة إجمالي</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Today's Points */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">النقاط اليوم</p>
                <p className="text-2xl font-bold text-green-600">+{competencyData.todayPoints}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">نحو المستوى التالي</p>
                <p className="text-2xl font-bold text-blue-600">{competencyData.progressPercent}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Next Level Points */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">نقاط المستوى التالي</p>
                <p className="text-2xl font-bold text-purple-600">{competencyData.nextLevelPoints}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">التقدم نحو المستوى التالي</span>
            <span className="text-sm text-slate-600">
              {competencyData.totalPoints} / {competencyData.nextLevelPoints}
            </span>
          </div>
          <Progress value={competencyData.progressPercent} className="h-3" />
        </div>

        {/* Active Challenge */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-l-4 border-orange-500 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                التحدي النشط
              </h3>
              <p className="text-sm text-slate-600 mt-1">{competencyData.activeChallenge.title}</p>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300">
              +{competencyData.activeChallenge.pointsReward}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">التقدم</span>
              <span className="font-semibold text-slate-900">
                {competencyData.activeChallenge.progress} / {competencyData.activeChallenge.total}
              </span>
            </div>
            <Progress
              value={
                (competencyData.activeChallenge.progress / competencyData.activeChallenge.total) * 100
              }
              className="h-2"
            />
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">الشارات المكتسبة</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <span className="text-xl">🌱</span>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
              <span className="text-xl">📈</span>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <span className="text-xl">⭐</span>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full opacity-50">
              <span className="text-xl">👑</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">3 من 4 شارات مكتسبة</p>
        </div>

        {/* Call to Action */}
        <div className="flex gap-3">
          <Link href="/teacher-analytics" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <span>عرض كل تحليلاتي</span>
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </Link>
          <Button variant="outline" className="flex-1">
            مشاركة الملف العام
          </Button>
        </div>

        {/* Motivational Text */}
        <p className="text-center text-sm text-slate-600 mt-4 p-3 bg-slate-50 rounded-lg">
          🎯 أنت قريب جداً من مستوى "ماهر رقمي"! استمر في استخدام الأدوات وستصل إلى هناك قريباً.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Mini Competency Widget for Sidebar
 * Compact version for quick reference
 */
export function CompetencyMiniWidget() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">الكفاءة الرقمية</h3>
        <span className="text-2xl">⭐</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">المستوى</span>
          <Badge className="bg-green-600">خبير</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">النقاط</span>
          <span className="font-bold text-green-600">285</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">اليوم</span>
          <span className="text-sm font-semibold text-yellow-600">+15</span>
        </div>
      </div>

      <Link href="/teacher-analytics" className="mt-3 block">
        <Button variant="outline" className="w-full text-xs" size="sm">
          عرض التفاصيل
        </Button>
      </Link>
    </div>
  );
}
