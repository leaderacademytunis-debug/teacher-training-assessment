import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Award, Target, Zap } from "lucide-react";

const COMPETENCY_LEVELS = {
  beginner: { label: "مبتدئ", color: "#3b82f6", range: "0-50" },
  advanced: { label: "متطور", color: "#f59e0b", range: "51-150" },
  expert: { label: "خبير", color: "#10b981", range: "151-300" },
  master: { label: "ماهر رقمي", color: "#8b5cf6", range: "300+" },
};

const TOOL_LABELS = {
  edugpt_sheet: "جذاذات EduGPT",
  test_builder: "منشئ الاختبارات",
  smart_correction: "التصحيح الذكي",
  visual_studio: "Visual Studio",
  ultimate_studio: "Ultimate Studio",
  marketplace_publish: "نشر في Marketplace",
  course_completion: "إتمام التكوينات",
};

const TOOL_COLORS = {
  edugpt_sheet: "#1D9E75",
  test_builder: "#E8590C",
  smart_correction: "#534AB7",
  visual_studio: "#f59e0b",
  ultimate_studio: "#06b6d4",
  marketplace_publish: "#ec4899",
  course_completion: "#8b5cf6",
};

export function CompetencyAnalytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = trpc.competencyPoints.getTeacherAnalytics.useQuery();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">يرجى تسجيل الدخول</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  // Prepare monthly data for chart
  const monthlyChartData = Object.entries(analytics.monthlyData || {}).map(([month, points]) => ({
    month: month.slice(5),
    points,
  }));

  // Prepare tool usage data for pie chart
  const toolUsageData = Object.entries(analytics.toolUsage || {}).map(([tool, count]) => ({
    name: TOOL_LABELS[tool as keyof typeof TOOL_LABELS] || tool,
    value: count,
    color: TOOL_COLORS[tool as keyof typeof TOOL_COLORS] || "#999",
  }));

  const competencyInfo = COMPETENCY_LEVELS[analytics.currentLevel as keyof typeof COMPETENCY_LEVELS] || COMPETENCY_LEVELS.beginner;
  const progressPercentage = Math.min(
    ((analytics.totalPoints % 50) / 50) * 100,
    100
  );

  const getRecommendation = () => {
    if (analytics.pointsToNextLevel > 0) {
      const toolsNeeded = Math.ceil(analytics.pointsToNextLevel / 5);
      return `أنجز ${toolsNeeded} اختبارات إضافية أو ${Math.ceil(toolsNeeded / 2)} فيديوهات للوصول لمستوى ${
        analytics.currentLevel === "beginner"
          ? "متطور"
          : analytics.currentLevel === "advanced"
          ? "خبير"
          : "ماهر رقمي"
      }`;
    }
    return "مبروك! لقد وصلت لأعلى مستوى في الكفاءة الرقمية 🎉";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">تحليلات الكفاءة الرقمية</h1>
          <p className="text-slate-600">تابع تطورك في استخدام أدوات الذكاء الاصطناعي</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Level Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Award className="w-4 h-4" />
                المستوى الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">{competencyInfo.label}</div>
              <Badge style={{ backgroundColor: competencyInfo.color }} className="text-white">
                {competencyInfo.range} نقطة
              </Badge>
            </CardContent>
          </Card>

          {/* Total Points Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                إجمالي النقاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{analytics.totalPoints}</div>
              <p className="text-xs text-slate-500 mt-2">نقطة مجمعة</p>
            </CardContent>
          </Card>

          {/* Ranking Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                ترتيبك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{analytics.percentile}%</div>
              <p className="text-xs text-slate-500 mt-2">{analytics.rank}</p>
            </CardContent>
          </Card>

          {/* Points to Next Level Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                للمستوى التالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{analytics.pointsToNextLevel}</div>
              <p className="text-xs text-slate-500 mt-2">نقطة متبقية</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg">التقدم نحو المستوى التالي</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-3" />
            <p className="text-sm text-slate-600 text-center">{Math.round(progressPercentage)}% من 50 نقطة</p>
          </CardContent>
        </Card>

        {/* Smart Recommendation */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">💡 نصيحة ذكية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 font-medium">{getRecommendation()}</p>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Tabs defaultValue="monthly" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="monthly">تطور النقاط (6 أشهر)</TabsTrigger>
            <TabsTrigger value="tools">استخدام الأدوات</TabsTrigger>
          </TabsList>

          {/* Monthly Progress Chart */}
          <TabsContent value="monthly">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>تطور النقاط آخر 6 أشهر</CardTitle>
                <CardDescription>رسم بياني يوضح تطورك الشهري</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} نقطة`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="points"
                        stroke="#1D9E75"
                        strokeWidth={3}
                        dot={{ fill: "#1D9E75", r: 6 }}
                        activeDot={{ r: 8 }}
                        name="النقاط"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 py-8">لا توجد بيانات شهرية حتى الآن</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tool Usage Chart */}
          <TabsContent value="tools">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>توزيع استخدام الأدوات</CardTitle>
                <CardDescription>عدد مرات استخدام كل أداة</CardDescription>
              </CardHeader>
              <CardContent>
                {toolUsageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={toolUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {toolUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} مرة`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 py-8">لم تستخدم أي أدوات حتى الآن</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detailed Tool Usage Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>تفصيل استخدام الأدوات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold text-slate-700">الأداة</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">عدد الاستخدامات</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">النقاط المكتسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {toolUsageData.map((tool) => {
                    const toolKey = Object.keys(TOOL_LABELS).find(
                      (key) => TOOL_LABELS[key as keyof typeof TOOL_LABELS] === tool.name
                    ) as keyof typeof TOOL_LABELS | undefined;
                    const pointsPerUse = {
                      edugpt_sheet: 3,
                      test_builder: 5,
                      smart_correction: 5,
                      visual_studio: 2,
                      ultimate_studio: 10,
                      marketplace_publish: 8,
                      course_completion: 20,
                    }[toolKey || "edugpt_sheet"] || 0;

                    return (
                      <tr key={tool.name} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{tool.name}</td>
                        <td className="px-4 py-3 text-slate-600">{tool.value} مرة</td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">
                          {tool.value * pointsPerUse} نقطة
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
