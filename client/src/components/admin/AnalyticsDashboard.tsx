/**
 * Analytics Dashboard Component
 * 4 Main Sections: Revenue, Users, Tool Usage, Courses
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Zap, BookOpen,
  DollarSign, ArrowUpRight, ArrowDownRight, Award
} from "lucide-react";

const CHART_COLORS = ["#1D9E75", "#E8590C", "#7C3AED", "#3B82F6", "#EC4899"];

// ===== REVENUE SECTION =====
function RevenueSection() {
  // Mock data - replace with real API call
  const monthlyRevenue = [
    { month: "يناير", revenue: 45000 },
    { month: "فبراير", revenue: 52000 },
    { month: "مارس", revenue: 48000 },
    { month: "أبريل", revenue: 61000 },
    { month: "مايو", revenue: 58000 },
    { month: "يونيو", revenue: 67000 },
  ];

  const currentMonth = 67000;
  const lastMonth = 58000;
  const percentChange = ((currentMonth - lastMonth) / lastMonth * 100).toFixed(1);

  const planDistribution = [
    { name: "Starter", value: 22000, color: "#3B82F6" },
    { name: "Professionnel", value: 28000, color: "#1D9E75" },
    { name: "VIP", value: 17000, color: "#E8590C" },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">إجمالي الدخل الشهري</p>
                <p className="text-3xl font-bold">{currentMonth.toLocaleString()} TND</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">مقارنة بالشهر الماضي</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{percentChange}%</p>
                  {parseFloat(percentChange) >= 0 ? (
                    <ArrowUpRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${parseFloat(percentChange) >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} flex items-center justify-center`}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400 mb-4">توزيع الدخل حسب الخطة</p>
            <div className="space-y-2">
              {planDistribution.map((plan, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm">{plan.name}</span>
                  <span className="text-sm font-bold">{(plan.value / 1000).toFixed(0)}k TND</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6-Month Revenue Chart */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>الدخل آخر 6 أشهر</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue} dir="rtl">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1D9E75"
                strokeWidth={3}
                dot={{ fill: "#1D9E75", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== USERS SECTION =====
function UsersSection() {
  const userStats = [
    { label: "إجمالي المستخدمين", value: 1250, icon: <Users className="h-6 w-6" /> },
    { label: "المستخدمون الجدد هذا الشهر", value: 145, icon: <TrendingUp className="h-6 w-6" /> },
    { label: "المستخدمون النشطون (30 يوم)", value: 890, icon: <Zap className="h-6 w-6" /> },
  ];

  const registrationTrend = [
    { week: "الأسبوع 1", free: 120, starter: 85, pro: 45, vip: 20 },
    { week: "الأسبوع 2", free: 135, starter: 92, pro: 52, vip: 25 },
    { week: "الأسبوع 3", free: 128, starter: 88, pro: 48, vip: 22 },
    { week: "الأسبوع 4", free: 145, starter: 95, pro: 55, vip: 28 },
  ];

  const planBreakdown = [
    { name: "مجاني", value: 450, color: "#6B7280" },
    { name: "Starter", value: 380, color: "#3B82F6" },
    { name: "Pro", value: 280, color: "#1D9E75" },
    { name: "VIP", value: 140, color: "#E8590C" },
  ];

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {userStats.map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>توزيع المستخدمين حسب الخطة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>التسجيلات الجديدة (آخر 30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={registrationTrend} dir="rtl">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Bar dataKey="free" fill="#6B7280" name="مجاني" />
                <Bar dataKey="starter" fill="#3B82F6" name="Starter" />
                <Bar dataKey="pro" fill="#1D9E75" name="Pro" />
                <Bar dataKey="vip" fill="#E8590C" name="VIP" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== TOOL USAGE SECTION =====
function ToolUsageSection() {
  const topTools = [
    { name: "مساعد إعداد الجذاذات", thisMonth: 1250, lastMonth: 980, change: 27.6 },
    { name: "بناء الاختبارات الذكي", thisMonth: 890, lastMonth: 750, change: 18.7 },
    { name: "المتفقد الذكي", thisMonth: 650, lastMonth: 580, change: 12.1 },
    { name: "خريطة المنهج GPS", thisMonth: 520, lastMonth: 420, change: 23.8 },
    { name: "مختبر هندسة الأوامر", thisMonth: 380, lastMonth: 290, change: 31.0 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>أكثر 5 أدوات استخداماً هذا الشهر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-4 text-slate-400">الأداة</th>
                  <th className="text-right py-3 px-4 text-slate-400">هذا الشهر</th>
                  <th className="text-right py-3 px-4 text-slate-400">الشهر الماضي</th>
                  <th className="text-right py-3 px-4 text-slate-400">التغير</th>
                </tr>
              </thead>
              <tbody>
                {topTools.map((tool, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">{tool.name}</td>
                    <td className="py-3 px-4 font-bold">{tool.thisMonth.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">{tool.lastMonth.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{tool.change}%
                      </Badge>
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

// ===== COURSES SECTION =====
function CoursesSection() {
  const courses = [
    { name: "المعلم الرقمي والذكاء الاصطناعي", enrolled: 245, completed: 189, completionRate: 77, certificates: 189 },
    { name: "تأهيل مدرسي الابتدائي", enrolled: 180, completed: 142, completionRate: 79, certificates: 142 },
    { name: "تأهيل مرافقي التلاميذ ذوي الصعوبات", enrolled: 95, completed: 71, completionRate: 75, certificates: 71 },
    { name: "المعلم الرقمي والمحتوى التفاعلي", enrolled: 120, completed: 88, completionRate: 73, certificates: 88 },
    { name: "تطوير المهارات التربوية", enrolled: 150, completed: 115, completionRate: 77, certificates: 115 },
  ];

  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + c.completed, 0);
  const totalCertificates = courses.reduce((sum, c) => sum + c.certificates, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">إجمالي المسجلين</p>
                <p className="text-3xl font-bold">{totalEnrolled.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">المكتملون</p>
                <p className="text-3xl font-bold">{totalCompleted.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">الشهادات الممنوحة</p>
                <p className="text-3xl font-bold">{totalCertificates.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>تفاصيل التكوينات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-4 text-slate-400">التكوين</th>
                  <th className="text-right py-3 px-4 text-slate-400">المسجلون</th>
                  <th className="text-right py-3 px-4 text-slate-400">المكتملون</th>
                  <th className="text-right py-3 px-4 text-slate-400">نسبة الإتمام</th>
                  <th className="text-right py-3 px-4 text-slate-400">الشهادات</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">{course.name}</td>
                    <td className="py-3 px-4 font-bold">{course.enrolled}</td>
                    <td className="py-3 px-4">{course.completed}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{course.certificates}</td>
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

// ===== MAIN ANALYTICS DASHBOARD COMPONENT =====
export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<"revenue" | "users" | "tools" | "courses">("revenue");

  return (
    <div className="space-y-6" dir="rtl">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
        {[
          { id: "revenue", label: "💰 الدخل" },
          { id: "users", label: "👥 المستخدمون" },
          { id: "tools", label: "⚙️ استخدام الأدوات" },
          { id: "courses", label: "📚 التكوينات" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "revenue" && <RevenueSection />}
      {activeTab === "users" && <UsersSection />}
      {activeTab === "tools" && <ToolUsageSection />}
      {activeTab === "courses" && <CoursesSection />}
    </div>
  );
}
