import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, Download, Trophy, Users, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CompetencyStatsTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch competency statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.getCompetencyStats.useQuery();
  const { mutate: sendReportsManually } = trpc.admin.sendMonthlyReportsManually.useMutation({
    onSuccess: () => {
      toast({
        title: "تم الإرسال",
        description: "تم إرسال التقارير الشهرية بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال التقارير",
        variant: "destructive",
      });
    },
  });

  const handleSendReportsManually = async () => {
    setIsLoading(true);
    try {
      sendReportsManually();
    } finally {
      setIsLoading(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const levelDistribution = [
    { name: "مبتدئ", value: stats.levelDistribution.beginner, color: "#94a3b8" },
    { name: "متطور", value: stats.levelDistribution.intermediate, color: "#3b82f6" },
    { name: "خبير", value: stats.levelDistribution.expert, color: "#f59e0b" },
    { name: "ماهر رقمي", value: stats.levelDistribution.master, color: "#1D9E75" },
  ];

  // Prepare data for top teachers
  const topTeachersData = stats.topTeachers.map((teacher, index) => ({
    rank: index + 1,
    name: teacher.fullName,
    points: teacher.totalPoints,
    level: teacher.level,
  }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إحصائيات الكفاءة الرقمية</h2>
          <p className="text-gray-500 mt-1">مراقبة أداء المعلمين والنقاط الموزعة</p>
        </div>
        <Button
          onClick={handleSendReportsManually}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 ml-2" />
              إرسال التقارير الآن
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي النقاط هذا الشهر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalPointsThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">نقطة موزعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">عدد المعلمين النشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.activeTeachersCount}</div>
            <p className="text-xs text-gray-500 mt-1">معلم نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">متوسط النقاط للمعلم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(stats.totalPointsThisMonth / Math.max(stats.activeTeachersCount, 1))}
            </div>
            <p className="text-xs text-gray-500 mt-1">نقطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">التحديات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.activeChallengesCount}</div>
            <p className="text-xs text-gray-500 mt-1">تحدٍ أسبوعي</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع المعلمين حسب المستوى</CardTitle>
            <CardDescription>النسبة المئوية لكل مستوى كفاءة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Teachers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>أكثر 5 معلمين نشاطاً</CardTitle>
            <CardDescription>المعلمون الأكثر حصولاً على النقاط هذا الشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTeachersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="points" fill="#1D9E75" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges Section */}
      <Card>
        <CardHeader>
          <CardTitle>التحديات الأسبوعية النشطة</CardTitle>
          <CardDescription>التحديات الحالية ونسبة الإتمام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.activeChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${challenge.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{challenge.completionPercentage}%</span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-green-600">+{challenge.pointsReward}</div>
                  <p className="text-xs text-gray-500">نقطة</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Teachers Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة أفضل المعلمين</CardTitle>
          <CardDescription>تفاصيل أكثر 5 معلمين نشاطاً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الترتيب</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم المعلم</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">النقاط</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المستوى</th>
                </tr>
              </thead>
              <tbody>
                {stats.topTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Trophy className="h-5 w-5 text-orange-600" />}
                        {index > 2 && <span className="text-gray-700 font-medium">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{teacher.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-green-600">{teacher.totalPoints}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {teacher.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
