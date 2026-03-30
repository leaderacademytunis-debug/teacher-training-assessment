/**
 * Analytics Dashboard Component
 * 4 Main Sections: Revenue, Users, Tool Usage, Courses
 * NOW USING REAL DATABASE QUERIES
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
  DollarSign, ArrowUpRight, ArrowDownRight, Award, Loader2
} from "lucide-react";

const CHART_COLORS = ["#1D9E75", "#E8590C", "#7C3AED", "#3B82F6", "#EC4899"];

// ===== REVENUE SECTION =====
function RevenueSection() {
  // Real API calls
  const { data: monthlyRevenueData, isLoading: revenueLoading } = trpc.analytics.getMonthlyRevenue.useQuery();
  const { data: planDistributionData, isLoading: planLoading } = trpc.analytics.getPlanDistribution.useQuery();
  const { data: revenueTrendData, isLoading: trendLoading } = trpc.analytics.getRevenueTrend.useQuery();

  if (revenueLoading || planLoading || trendLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const currentMonth = monthlyRevenueData?.currentMonth || 0;
  const lastMonth = monthlyRevenueData?.previousMonth || 0;
  const percentChange = monthlyRevenueData?.percentChange || 0;

  // Calculate total for plan distribution percentages
  const totalPlans = (planDistributionData || []).reduce((sum, p) => sum + p.count, 0);
  const planDistribution = (planDistributionData || []).map((p) => ({
    name: p.plan === "free" ? "مجاني" : p.plan === "starter" ? "Starter" : p.plan === "pro" ? "Pro" : "VIP",
    value: p.count,
    percentage: totalPlans > 0 ? ((p.count / totalPlans) * 100).toFixed(1) : 0,
    color: p.plan === "free" ? "#94A3B8" : p.plan === "starter" ? "#3B82F6" : p.plan === "pro" ? "#1D9E75" : "#E8590C",
  }));

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
                  <p className="text-3xl font-bold">{percentChange.toFixed(1)}%</p>
                  {percentChange >= 0 ? (
                    <ArrowUpRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${percentChange >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} flex items-center justify-center`}>
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
                  <span className="text-sm font-bold">{plan.count} ({plan.percentage}%)</span>
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
            <LineChart data={revenueTrendData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1D9E75" strokeWidth={2} dot={{ fill: "#1D9E75" }} name="الدخل (TND)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== USERS SECTION =====
function UsersSection() {
  // Real API calls
  const { data: userStats, isLoading: statsLoading } = trpc.analytics.getUserStats.useQuery();
  const { data: planDistribution, isLoading: planLoading } = trpc.analytics.getUserPlanDistribution.useQuery();
  const { data: registrationTrend, isLoading: trendLoading } = trpc.analytics.getNewRegistrations.useQuery();

  if (statsLoading || planLoading || trendLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalUsers = userStats?.totalUsers || 0;
  const newThisMonth = userStats?.newThisMonth || 0;
  const activeUsers = userStats?.activeUsers || 0;

  const planData = (planDistribution || []).map((p) => ({
    name: p.tier === "free" ? "مجاني" : p.tier === "starter" ? "Starter" : p.tier === "pro" ? "Pro" : "VIP",
    value: p.count,
    color: p.tier === "free" ? "#94A3B8" : p.tier === "starter" ? "#3B82F6" : p.tier === "pro" ? "#1D9E75" : "#E8590C",
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
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
                <p className="text-sm text-slate-400 mb-1">مستخدمون جدد هذا الشهر</p>
                <p className="text-3xl font-bold">{newThisMonth}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">مستخدمون نشطون (30 يوم)</p>
                <p className="text-3xl font-bold">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>توزيع المستخدمين حسب الخطة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Registration Trend */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>التسجيلات الجديدة (آخر 30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={registrationTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }} />
                <Bar dataKey="registrations" fill="#1D9E75" name="التسجيلات" />
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
  // Real API call
  const { data: topTools, isLoading } = trpc.analytics.getTopTools.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
                  <th className="text-right py-3 px-4">الأداة</th>
                  <th className="text-right py-3 px-4">هذا الشهر</th>
                  <th className="text-right py-3 px-4">الشهر الماضي</th>
                  <th className="text-right py-3 px-4">التغيير</th>
                </tr>
              </thead>
              <tbody>
                {(topTools || []).map((tool, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">{tool.tool}</td>
                    <td className="py-3 px-4 font-bold">{tool.count}</td>
                    <td className="py-3 px-4">{tool.previousCount}</td>
                    <td className="py-3 px-4">
                      <span className={tool.change >= 0 ? "text-green-400" : "text-red-400"}>
                        {tool.change >= 0 ? "+" : ""}{tool.change}
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

// ===== COURSES SECTION =====
function CoursesSection() {
  // Real API call
  const { data: courseStats, isLoading } = trpc.analytics.getCourseStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalCertificates = courseStats?.totalCertificates || 0;
  const courses = courseStats?.courses || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">إجمالي التكوينات</p>
                <p className="text-3xl font-bold">{courses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">إجمالي الشهادات الممنوحة</p>
                <p className="text-3xl font-bold">{totalCertificates}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>التكوينات ومعدلات الإتمام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-4">اسم التكوين</th>
                  <th className="text-right py-3 px-4">المسجلون</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">{course.courseName}</td>
                    <td className="py-3 px-4 font-bold">{course.enrollmentCount}</td>
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

// ===== MAIN ANALYTICS DASHBOARD =====
export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<"revenue" | "users" | "tools" | "courses">("revenue");

  const tabs = [
    { id: "revenue", label: "الدخل", icon: DollarSign },
    { id: "users", label: "المستخدمون", icon: Users },
    { id: "tools", label: "الأدوات", icon: Zap },
    { id: "courses", label: "التكوينات", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "revenue" && <RevenueSection />}
      {activeTab === "users" && <UsersSection />}
      {activeTab === "tools" && <ToolUsageSection />}
      {activeTab === "courses" && <CoursesSection />}
    </div>
  );
}
