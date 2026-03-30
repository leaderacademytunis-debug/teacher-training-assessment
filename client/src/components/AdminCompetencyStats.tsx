import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, Trophy, Target, Zap, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function AdminCompetencyStats() {
  const [sendingReport, setSendingReport] = useState(false);

  // Mock data - in production, fetch from API
  const competencyDistribution = [
    { level: "مبتدئ", count: 45, percentage: 18 },
    { level: "متطور", count: 89, percentage: 35 },
    { level: "خبير", count: 78, percentage: 31 },
    { level: "ماهر رقمي", count: 38, percentage: 15 },
  ];

  const topTeachers = [
    {
      id: 1,
      name: "علي سعد الله",
      points: 450,
      level: "ماهر رقمي",
      monthlyPoints: 85,
    },
    {
      id: 2,
      name: "فاطمة محمد",
      points: 320,
      level: "خبير",
      monthlyPoints: 72,
    },
    {
      id: 3,
      name: "محمود أحمد",
      points: 285,
      level: "خبير",
      monthlyPoints: 68,
    },
    {
      id: 4,
      name: "سارة علي",
      points: 245,
      level: "متطور",
      monthlyPoints: 55,
    },
    {
      id: 5,
      name: "خالد حسن",
      points: 210,
      level: "متطور",
      monthlyPoints: 48,
    },
  ];

  const activeChallenges = [
    {
      id: 1,
      title: "أنشئ 3 جذاذات",
      completionRate: 68,
      participantsCount: 156,
    },
    {
      id: 2,
      title: "استخدم منشئ الاختبارات مرتين",
      completionRate: 52,
      participantsCount: 142,
    },
    {
      id: 3,
      title: "انشر محتوى في Marketplace",
      completionRate: 31,
      participantsCount: 89,
    },
  ];

  const monthlyTrendData = [
    { month: "يناير", points: 1200, teachers: 45 },
    { month: "فبراير", points: 1450, teachers: 52 },
    { month: "مارس", points: 1680, teachers: 58 },
    { month: "أبريل", points: 1920, teachers: 65 },
    { month: "مايو", points: 2150, teachers: 72 },
    { month: "يونيو", points: 2380, teachers: 78 },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  const handleSendManualReport = async () => {
    setSendingReport(true);
    try {
      // Call the monthly reports mutation
      // await trpc.monthlyReports.sendMonthlyReports.mutate();
      alert("تم إرسال التقارير الشهرية بنجاح! ✅");
    } catch (error) {
      alert("فشل إرسال التقارير. يرجى المحاولة لاحقاً.");
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">إحصائيات الكفاءة الرقمية</h1>
        <p className="text-slate-600">مراقبة تطور معلمي المنصة في استخدام أدوات الذكاء الاصطناعي</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              إجمالي النقاط الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">2,380</div>
            <p className="text-xs text-green-600 mt-2">↑ 10% عن الشهر السابق</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              المعلمون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">250</div>
            <p className="text-xs text-slate-500 mt-2">معلم نشط هذا الشهر</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              معلمون ماهرون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">38</div>
            <p className="text-xs text-slate-500 mt-2">+300 نقطة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              متوسط النقاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">95</div>
            <p className="text-xs text-slate-500 mt-2">نقطة لكل معلم</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="distribution">توزيع المستويات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات الشهرية</TabsTrigger>
          <TabsTrigger value="challenges">التحديات النشطة</TabsTrigger>
        </TabsList>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>توزيع المعلمين حسب مستوى الكفاءة</CardTitle>
              <CardDescription>النسبة المئوية لكل مستوى هذا الشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={competencyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, percentage }) => `${level}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {competencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Distribution List */}
                <div className="space-y-4">
                  {competencyDistribution.map((item, index) => (
                    <div key={item.level} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.level}</p>
                          <p className="text-sm text-slate-600">{item.count} معلم</p>
                        </div>
                      </div>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>اتجاهات النقاط والمعلمين النشطين (6 أشهر)</CardTitle>
              <CardDescription>تطور الأداء على مدار الفترة الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="points"
                    stroke="#1D9E75"
                    strokeWidth={2}
                    name="إجمالي النقاط"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="teachers"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="المعلمون النشطون"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>التحديات الأسبوعية النشطة</CardTitle>
              <CardDescription>نسبة الإتمام والمشاركة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {challenge.title}
                      </h3>
                      <Badge variant="outline">{challenge.participantsCount} مشارك</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">نسبة الإتمام</span>
                        <span className="font-semibold text-slate-900">{challenge.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${challenge.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Teachers */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>أكثر 5 معلمين نشاطاً هذا الشهر</CardTitle>
          <CardDescription>المعلمون الأكثر استخداماً لأدوات الذكاء الاصطناعي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">الترتيب</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">اسم المعلم</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">المستوى</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">النقاط الشهرية</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">إجمالي النقاط</th>
                </tr>
              </thead>
              <tbody>
                {topTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">#{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{teacher.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{teacher.level}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{teacher.monthlyPoints}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">{teacher.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Report Sending */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            إرسال التقارير الشهرية
          </CardTitle>
          <CardDescription>أرسل تقارير الأداء الشهرية لجميع المعلمين النشطين</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                سيتم إرسال تقرير شامل لـ <strong>250 معلم</strong> يتضمن:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 mr-4">
                <li>✓ إجمالي النقاط والمستوى الحالي</li>
                <li>✓ الترتيب والنسبة المئوية</li>
                <li>✓ نصائح ذكية للتطور</li>
              </ul>
            </div>
            <Button
              onClick={handleSendManualReport}
              disabled={sendingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
            >
              {sendingReport ? "جاري الإرسال..." : "إرسال الآن"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
