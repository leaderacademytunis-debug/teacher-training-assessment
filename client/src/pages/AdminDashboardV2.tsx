/**
 * Admin Dashboard V2 - لوحة التحكم الشاملة
 * 5 Sections: Overview, Usage Limits, Users, Subscriptions, Content
 */
import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard, Users, CreditCard, Activity, Settings, Download,
  ChevronRight, ChevronLeft, Eye, Check, X, Shield, Sparkles,
  BookOpen, GraduationCap, Package, Search, RefreshCw, FileText,
  BarChart3, Bell, Menu, Sliders, TrendingUp, UserCheck, UserX,
  Zap, Image, Upload, Clock, ArrowUpRight, ArrowDownRight,
  MessageSquare, ToggleLeft, Save, Trash2, Plus, Edit, AlertTriangle,
  PenTool, ScanLine, Video, Theater, Map, Calendar, Lightbulb, EyeOff, UserCog
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import RichTextEditor from "@/components/RichTextEditor";

// ===== TYPES =====
type Section = "overview" | "limits" | "users" | "subscriptions" | "content" | "pages" | "names";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Map: <Map className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  Theater: <Theater className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  PenTool: <PenTool className="h-4 w-4" />,
  ScanLine: <ScanLine className="h-4 w-4" />,
  Lightbulb: <Lightbulb className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
};

const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#eab308", "#06b6d4", "#ef4444"];

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "مجاني", color: "bg-gray-500" },
  pro: { label: "Pro", color: "bg-blue-500" },
  premium: { label: "Premium", color: "bg-amber-500" },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "مدير", color: "bg-red-500" },
  trainer: { label: "مدرب", color: "bg-blue-500" },
  supervisor: { label: "مشرف", color: "bg-purple-500" },
  user: { label: "مستخدم", color: "bg-gray-500" },
};

// ===== MAIN COMPONENT =====
export default function AdminDashboardV2() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950" dir="rtl">
        <Card className="max-w-md w-full border-red-500/30 bg-slate-900 text-white">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">وصول محظور</h2>
            <p className="text-slate-400">هذه الصفحة مخصصة للمدير فقط.</p>
            <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/"}>
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "limits", label: "حدود الاستخدام", icon: <Sliders className="h-5 w-5" /> },
    { id: "users", label: "إدارة المستخدمين", icon: <Users className="h-5 w-5" /> },
    { id: "subscriptions", label: "الاشتراكات", icon: <CreditCard className="h-5 w-5" /> },
    { id: "content", label: "المحتوى والرسائل", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "pages", label: "إدارة الصفحات", icon: <FileText className="h-5 w-5" /> },
    { id: "names", label: "تصحيح الأسماء", icon: <PenTool className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 right-0 h-screen z-50 lg:z-auto
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white transition-all duration-300 flex flex-col border-l border-slate-800
        ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        ${sidebarOpen ? "w-64" : "w-20"}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm truncate">لوحة التحكم</h1>
                <p className="text-xs text-slate-400 truncate">Leader Academy</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setMobileSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                ${activeSection === section.id
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {section.icon}
              {sidebarOpen && <span>{section.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm"
          >
            <ChevronRight className="h-5 w-5" />
            {sidebarOpen && <span>العودة للموقع</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-all text-xs"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {sidebarOpen && <span>طي القائمة</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-white">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10">
              {user.name || user.email}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "limits" && <UsageLimitsSection />}
          {activeSection === "users" && <UserManagementSection />}
          {activeSection === "subscriptions" && <SubscriptionSection />}
          {activeSection === "content" && <ContentManagementSection />}
          {activeSection === "pages" && <PageManagementSection />}
          {activeSection === "names" && <NameCorrectionSection />}
        </div>
      </main>
    </div>
  );
}

// ===== SECTION 1: OVERVIEW =====
function OverviewSection() {
  const stats = trpc.adminControl.getOverviewStats.useQuery();
  const dailyActivity = trpc.adminControl.getDailyActivity.useQuery();
  const toolRanking = trpc.adminControl.getToolUsageRanking.useQuery();
  const registrationTrend = trpc.adminControl.getUserRegistrationTrend.useQuery();
  const conversionRate = trpc.adminControl.getConversionRate.useQuery();

  const statCards = [
    { label: "إجمالي المستخدمين", value: stats.data?.totalUsers ?? 0, icon: <Users className="h-5 w-5" />, color: "from-blue-500 to-blue-600" },
    { label: "مستخدمون جدد اليوم", value: stats.data?.todayUsers ?? 0, icon: <UserCheck className="h-5 w-5" />, color: "from-green-500 to-green-600" },
    { label: "نشطون (7 أيام)", value: stats.data?.activeUsers7d ?? 0, icon: <Activity className="h-5 w-5" />, color: "from-purple-500 to-purple-600" },
    { label: "عمليات AI هذا الشهر", value: stats.data?.monthlyOperations ?? 0, icon: <Zap className="h-5 w-5" />, color: "from-orange-500 to-orange-600" },
    { label: "صور مولّدة هذا الشهر", value: stats.data?.monthlyImages ?? 0, icon: <Image className="h-5 w-5" />, color: "from-pink-500 to-pink-600" },
    { label: "طلبات دفع معلقة", value: stats.data?.pendingPayments ?? 0, icon: <CreditCard className="h-5 w-5" />, color: "from-amber-500 to-amber-600" },
  ];

  // Process daily activity data for chart
  const chartData = useMemo(() => {
    if (!dailyActivity.data) return [];
    const dateMap: Record<string, number> = {};
    dailyActivity.data.forEach((item) => {
      dateMap[item.date] = (dateMap[item.date] || 0) + item.count;
    });
    return Object.entries(dateMap)
      .map(([date, count]) => ({ date: date.slice(5), count }))
      .slice(-14);
  }, [dailyActivity.data]);

  // Process tool ranking for pie chart
  const toolData = useMemo(() => {
    if (!toolRanking.data) return [];
    const LABELS: Record<string, string> = {
      lesson_plan: "جذاذات",
      exam_generated: "اختبارات",
      evaluation: "تقييمات",
      image_generated: "صور",
      inspection_report: "تفقد",
    };
    return toolRanking.data.map((item, i) => ({
      name: LABELS[item.activityType] || item.activityType,
      value: item.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [toolRanking.data]);

  // Registration trend
  const regData = useMemo(() => {
    if (!registrationTrend.data) return [];
    return registrationTrend.data.map((item) => ({
      date: item.date.slice(5),
      count: item.count,
    }));
  }, [registrationTrend.data]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 text-white overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Rate */}
      {conversionRate.data && (
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">معدل التحويل (مجاني → مدفوع)</p>
              <p className="text-3xl font-bold text-emerald-400">{conversionRate.data.conversionRate}%</p>
            </div>
            <div className="mr-auto text-sm text-slate-400">
              <span className="text-white font-bold">{conversionRate.data.paidUsers}</span> مدفوع من أصل{" "}
              <span className="text-white font-bold">{conversionRate.data.totalUsers}</span> مستخدم
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-400" />
              نشاط AI اليومي (آخر 14 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#colorOps)" strokeWidth={2} name="عمليات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tool Usage Pie */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              توزيع استخدام الأدوات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={toolData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {toolData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Registration Trend */}
        <Card className="bg-slate-900 border-slate-800 text-white lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-400" />
              تسجيلات جديدة (آخر 30 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="تسجيلات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== SECTION 2: USAGE LIMITS =====
function UsageLimitsSection() {
  const toolConfigs = trpc.adminControl.getToolConfigs.useQuery();
  const seedMutation = trpc.adminControl.seedToolConfigs.useMutation({
    onSuccess: () => {
      toast.success("تم تهيئة الأدوات بنجاح");
      toolConfigs.refetch();
    },
  });
  const updateMutation = trpc.adminControl.updateToolConfig.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الإعدادات");
      toolConfigs.refetch();
    },
  });
  const globalUsage = trpc.adminControl.getGlobalUsageOverview.useQuery();

  const [editingTool, setEditingTool] = useState<any>(null);

  // If no tools configured, show seed button
  if (toolConfigs.data && toolConfigs.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sliders className="h-16 w-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">لم يتم تهيئة الأدوات بعد</h3>
        <p className="text-slate-400 mb-6">اضغط لتهيئة إعدادات الأدوات الافتراضية</p>
        <Button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {seedMutation.isPending ? "جاري التهيئة..." : "تهيئة الأدوات الافتراضية"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Usage Overview */}
      {globalUsage.data && globalUsage.data.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              استخدام الأدوات هذا الشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalUsage.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="toolKey" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }} />
                  <Bar dataKey="totalOps" fill="#f97316" radius={[4, 4, 0, 0]} name="عمليات" />
                  <Bar dataKey="uniqueUsers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="مستخدمون" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolConfigs.data?.map((tool) => (
          <Card
            key={tool.id}
            className={`border transition-all ${
              tool.isEnabled
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-slate-900/50 border-red-500/30 text-slate-500"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.isEnabled ? "bg-orange-500/20 text-orange-400" : "bg-red-500/20 text-red-400"}`}>
                    {TOOL_ICONS[tool.icon || "Sparkles"] || <Sparkles className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{tool.nameAr}</h4>
                    <p className="text-xs text-slate-500">{tool.toolKey}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tool.isEnabled}
                    onCheckedChange={(checked) => {
                      updateMutation.mutate({ id: tool.id, isEnabled: checked });
                    }}
                  />
                </div>
              </div>

              {/* Tier access badges */}
              <div className="flex gap-1 mb-3">
                <Badge variant={tool.freeAccess ? "default" : "outline"} className={`text-xs ${tool.freeAccess ? "bg-green-500/20 text-green-400 border-green-500/30" : "text-slate-500 border-slate-700"}`}>
                  مجاني
                </Badge>
                <Badge variant={tool.proAccess ? "default" : "outline"} className={`text-xs ${tool.proAccess ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "text-slate-500 border-slate-700"}`}>
                  Pro
                </Badge>
                <Badge variant={tool.premiumAccess ? "default" : "outline"} className={`text-xs ${tool.premiumAccess ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "text-slate-500 border-slate-700"}`}>
                  Premium
                </Badge>
              </div>

              {/* Limits */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">حد المجاني/شهر:</span>
                  <span className="font-mono">{tool.freeLimitPerMonth === 0 ? "∞" : tool.freeLimitPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حد Pro/شهر:</span>
                  <span className="font-mono">{tool.proLimitPerMonth === 0 ? "∞" : tool.proLimitPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حد Premium/شهر:</span>
                  <span className="font-mono">{tool.premiumLimitPerMonth === 0 ? "∞" : tool.premiumLimitPerMonth}</span>
                </div>
                {(tool.proImageLimit > 0 || tool.freeImageLimit > 0) && (
                  <div className="flex justify-between text-pink-400">
                    <span>حد الصور Pro/شهر:</span>
                    <span className="font-mono">{tool.proImageLimit === 0 ? "∞" : tool.proImageLimit}</span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setEditingTool({ ...tool })}
              >
                <Edit className="h-3 w-3 ml-1" /> تعديل الحدود
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTool && (
        <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-orange-400" />
                تعديل إعدادات: {editingTool.nameAr}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                تعديل حدود الاستخدام وصلاحيات الوصول لهذه الأداة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                <Label>الأداة مفعلة</Label>
                <Switch
                  checked={editingTool.isEnabled}
                  onCheckedChange={(v) => setEditingTool({ ...editingTool, isEnabled: v })}
                />
              </div>

              {/* Tier Access */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">صلاحيات الوصول</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "freeAccess", label: "مجاني" },
                    { key: "proAccess", label: "Pro" },
                    { key: "premiumAccess", label: "Premium" },
                  ].map((tier) => (
                    <div key={tier.key} className="flex items-center gap-2 p-2 rounded bg-slate-800">
                      <Switch
                        checked={editingTool[tier.key]}
                        onCheckedChange={(v) => setEditingTool({ ...editingTool, [tier.key]: v })}
                      />
                      <Label className="text-xs">{tier.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Limits */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">حدود العمليات الشهرية (0 = غير محدود)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "freeLimitPerMonth", label: "مجاني" },
                    { key: "proLimitPerMonth", label: "Pro" },
                    { key: "premiumLimitPerMonth", label: "Premium" },
                  ].map((tier) => (
                    <div key={tier.key}>
                      <Label className="text-xs text-slate-400">{tier.label}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editingTool[tier.key]}
                        onChange={(e) => setEditingTool({ ...editingTool, [tier.key]: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Limits */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">حدود الصور الشهرية (0 = غير محدود)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "freeImageLimit", label: "مجاني" },
                    { key: "proImageLimit", label: "Pro" },
                    { key: "premiumImageLimit", label: "Premium" },
                  ].map((tier) => (
                    <div key={tier.key}>
                      <Label className="text-xs text-slate-400">{tier.label}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editingTool[tier.key]}
                        onChange={(e) => setEditingTool({ ...editingTool, [tier.key]: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload Limit */}
              <div>
                <Label className="text-sm font-bold">حد رفع الملفات (MB)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingTool.maxFileUploadMB}
                  onChange={(e) => setEditingTool({ ...editingTool, maxFileUploadMB: parseInt(e.target.value) || 10 })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingTool(null)} className="border-slate-700 text-slate-300">
                إلغاء
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  updateMutation.mutate({
                    id: editingTool.id,
                    isEnabled: editingTool.isEnabled,
                    freeAccess: editingTool.freeAccess,
                    proAccess: editingTool.proAccess,
                    premiumAccess: editingTool.premiumAccess,
                    freeLimitPerMonth: editingTool.freeLimitPerMonth,
                    proLimitPerMonth: editingTool.proLimitPerMonth,
                    premiumLimitPerMonth: editingTool.premiumLimitPerMonth,
                    freeImageLimit: editingTool.freeImageLimit,
                    proImageLimit: editingTool.proImageLimit,
                    premiumImageLimit: editingTool.premiumImageLimit,
                    maxFileUploadMB: editingTool.maxFileUploadMB,
                  });
                  setEditingTool(null);
                }}
              >
                <Save className="h-4 w-4 ml-1" /> حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ===== SECTION 3: USER MANAGEMENT =====
function UserManagementSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "lastSignedIn" | "name">("createdAt");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const usersList = trpc.adminControl.listUsersAdvanced.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter || undefined,
    sortBy,
    sortOrder: "desc",
  });

  const userDetails = trpc.adminControl.getUserDetails.useQuery(
    { userId: selectedUser! },
    { enabled: !!selectedUser }
  );

  // Existing admin dashboard mutations (from old adminDashboard router)
  const updateRole = trpc.adminDashboard.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الدور");
      usersList.refetch();
    },
  });

  const updatePermissions = trpc.adminDashboard.updateUserPermissions.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصلاحيات");
      usersList.refetch();
    },
  });

  const toggleBan = trpc.adminControl.toggleUserBan.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة المستخدم");
      usersList.refetch();
    },
  });

  const resetUsage = trpc.adminControl.resetUserUsage.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة تعيين الاستخدام");
    },
  });

  const exportCSV = trpc.adminDashboard.exportUsersCSV.useQuery(undefined, { enabled: false });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-400 mb-1 block">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="اسم، بريد إلكتروني..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-slate-800 border-slate-700 text-white pr-9"
                />
              </div>
            </div>
            <div className="w-40">
              <Label className="text-xs text-slate-400 mb-1 block">الدور</Label>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="trainer">مدرب</SelectItem>
                  <SelectItem value="supervisor">مشرف</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Label className="text-xs text-slate-400 mb-1 block">ترتيب حسب</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">تاريخ التسجيل</SelectItem>
                  <SelectItem value="lastSignedIn">آخر دخول</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={async () => {
                const result = await exportCSV.refetch();
                if (result.data) {
                  const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = result.data.filename;
                  a.click();
                  toast.success("تم تصدير CSV");
                }
              }}
            >
              <Download className="h-4 w-4 ml-1" /> تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-right p-3">المستخدم</th>
                <th className="text-right p-3">البريد</th>
                <th className="text-right p-3">الدور</th>
                <th className="text-right p-3">المستوى</th>
                <th className="text-right p-3">استخدام الشهر</th>
                <th className="text-right p-3">آخر دخول</th>
                <th className="text-right p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {usersList.data?.users.map((u) => {
                const role = ROLE_LABELS[u.role] || ROLE_LABELS.user;
                const tier = TIER_LABELS[u.permissions?.tier || "free"];
                const isBanned = u.registrationStatus === "rejected";
                return (
                  <tr key={u.id} className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition ${isBanned ? "opacity-50" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {(u.name || u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.arabicName || u.name || "-"}</p>
                          {isBanned && <Badge variant="destructive" className="text-[10px] px-1">محظور</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">{u.email}</td>
                    <td className="p-3">
                      <Badge className={`${role.color} text-white text-xs`}>{role.label}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${tier.color} text-white text-xs`}>{tier.label}</Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{u.monthlyUsage || 0}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("ar-TN") : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                          onClick={() => setSelectedUser(u.id)}
                          title="تفاصيل"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Select
                          value={u.role}
                          onValueChange={(v) => updateRole.mutate({ userId: u.id, role: v as any })}
                        >
                          <SelectTrigger className="h-7 w-20 text-xs bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">مستخدم</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="trainer">مدرب</SelectItem>
                            <SelectItem value="supervisor">مشرف</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${isBanned ? "text-green-400" : "text-red-400"}`}
                          onClick={() => toggleBan.mutate({ userId: u.id, banned: !isBanned })}
                          title={isBanned ? "إلغاء الحظر" : "حظر"}
                        >
                          {isBanned ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersList.data && usersList.data.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              صفحة {usersList.data.page} من {usersList.data.totalPages} ({usersList.data.total} مستخدم)
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="border-slate-700 text-slate-300"
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= usersList.data.totalPages}
                onClick={() => setPage(page + 1)}
                className="border-slate-700 text-slate-300"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                تفاصيل المستخدم
              </DialogTitle>
            </DialogHeader>

            {userDetails.isLoading ? (
              <div className="py-8 text-center text-slate-400">جاري التحميل...</div>
            ) : userDetails.data ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-slate-400 text-xs">الاسم</p>
                    <p className="font-bold">{userDetails.data.user.arabicName || userDetails.data.user.name || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-slate-400 text-xs">البريد</p>
                    <p>{userDetails.data.user.email}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-slate-400 text-xs">الهاتف</p>
                    <p>{userDetails.data.user.phone || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-slate-400 text-xs">المدرسة</p>
                    <p>{userDetails.data.user.schoolName || "-"}</p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-sm font-bold mb-2">الصلاحيات</p>
                  <div className="flex flex-wrap gap-2">
                    {userDetails.data.permissions ? (
                      <>
                        {userDetails.data.permissions.accessEdugpt && <Badge className="bg-emerald-500/20 text-emerald-400">EDUGPT</Badge>}
                        {userDetails.data.permissions.accessCourseAi && <Badge className="bg-blue-500/20 text-blue-400">دورة AI</Badge>}
                        {userDetails.data.permissions.accessCoursePedagogy && <Badge className="bg-purple-500/20 text-purple-400">بيداغوجيا</Badge>}
                        {userDetails.data.permissions.accessFullBundle && <Badge className="bg-amber-500/20 text-amber-400">الباقة الكاملة</Badge>}
                        <Badge className={`${TIER_LABELS[userDetails.data.permissions.tier].color} text-white`}>
                          {TIER_LABELS[userDetails.data.permissions.tier].label}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-slate-500 text-sm">لا توجد صلاحيات</span>
                    )}
                  </div>
                </div>

                {/* Monthly Usage */}
                {userDetails.data.monthlyUsage.length > 0 && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-sm font-bold mb-2">استخدام هذا الشهر</p>
                    <div className="space-y-1">
                      {userDetails.data.monthlyUsage.map((u) => (
                        <div key={u.id} className="flex justify-between text-xs">
                          <span className="text-slate-400">{u.toolKey}</span>
                          <span className="font-mono">{u.operationCount} عملية</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-700 text-slate-300"
                      onClick={() => resetUsage.mutate({ userId: selectedUser })}
                    >
                      <RefreshCw className="h-3 w-3 ml-1" /> إعادة تعيين الاستخدام
                    </Button>
                  </div>
                )}

                {/* Recent Activity */}
                {userDetails.data.recentActivity.length > 0 && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-sm font-bold mb-2">آخر النشاطات</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {userDetails.data.recentActivity.map((a) => (
                        <div key={a.id} className="flex justify-between text-xs border-b border-slate-700/50 pb-1">
                          <span>{a.title || a.activityType}</span>
                          <span className="text-slate-500">{new Date(a.createdAt).toLocaleDateString("ar-TN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ===== SECTION 4: SUBSCRIPTIONS =====
function SubscriptionSection() {
  const subStats = trpc.adminControl.getSubscriptionStats.useQuery();
  const pricingPlans = trpc.adminControl.getPricingPlans.useQuery();

  // Existing pricing mutations from old admin dashboard
  const createPlan = trpc.adminDashboard.createPricingPlan.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الخطة");
      pricingPlans.refetch();
    },
  });
  const updatePlan = trpc.adminDashboard.updatePricingPlan.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الخطة");
      pricingPlans.refetch();
    },
  });
  const deletePlan = trpc.adminDashboard.deletePricingPlan.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخطة");
      pricingPlans.refetch();
    },
  });

  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    serviceKey: "",
    nameAr: "",
    nameEn: "",
    description: "",
    price: 0,
    currency: "TND",
    billingPeriod: "monthly" as const,
    features: "",
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    badgeText: "",
    color: "blue",
  });

  // Pie chart data for tier distribution
  const tierChartData = useMemo(() => {
    if (!subStats.data) return [];
    return subStats.data.tierCounts.map((tc, i) => ({
      name: TIER_LABELS[tc.tier]?.label || tc.tier,
      value: tc.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [subStats.data]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {subStats.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{subStats.data.totalUsers}</p>
              <p className="text-xs text-slate-400 mt-1">إجمالي المستخدمين</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{subStats.data.paidUsers}</p>
              <p className="text-xs text-slate-400 mt-1">مستخدمون مدفوعون</p>
            </CardContent>
          </Card>
          {subStats.data.paymentStats.map((ps) => (
            <Card key={ps.status} className="bg-slate-900 border-slate-800 text-white">
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${ps.status === "pending" ? "text-amber-400" : ps.status === "approved" ? "text-green-400" : "text-red-400"}`}>
                  {ps.count}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  طلبات {ps.status === "pending" ? "معلقة" : ps.status === "approved" ? "مقبولة" : "مرفوضة"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tier Distribution Chart */}
      {tierChartData.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزيع المستويات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tierChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {tierChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans Management */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">خطط الأسعار</CardTitle>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowNewPlan(true)}>
            <Plus className="h-4 w-4 ml-1" /> خطة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pricingPlans.data?.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${plan.isActive ? "bg-green-400" : "bg-red-400"}`} />
                  <div>
                    <p className="font-bold text-sm">{plan.nameAr}</p>
                    <p className="text-xs text-slate-400">{plan.serviceKey} - {plan.price} {plan.currency}/{plan.billingPeriod}</p>
                  </div>
                  {plan.isPopular && <Badge className="bg-amber-500/20 text-amber-400 text-xs">شائعة</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setEditingPlan({ ...plan })}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذه الخطة؟")) {
                      deletePlan.mutate({ id: plan.id });
                    }
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {(!pricingPlans.data || pricingPlans.data.length === 0) && (
              <p className="text-center text-slate-500 py-4">لا توجد خطط أسعار</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Plan Dialog */}
      <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء خطة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">مفتاح الخدمة</Label>
                <Input value={newPlan.serviceKey} onChange={(e) => setNewPlan({ ...newPlan, serviceKey: e.target.value })} className="bg-slate-800 border-slate-700 text-white" placeholder="edugpt_pro" />
              </div>
              <div>
                <Label className="text-xs">الاسم بالعربية</Label>
                <Input value={newPlan.nameAr} onChange={(e) => setNewPlan({ ...newPlan, nameAr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">السعر</Label>
                <Input type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-xs">العملة</Label>
                <Input value={newPlan.currency} onChange={(e) => setNewPlan({ ...newPlan, currency: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-xs">الفترة</Label>
                <Select value={newPlan.billingPeriod} onValueChange={(v) => setNewPlan({ ...newPlan, billingPeriod: v as any })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                    <SelectItem value="lifetime">مدى الحياة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">المميزات (سطر لكل ميزة)</Label>
              <Textarea value={newPlan.features} onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlan(false)} className="border-slate-700 text-slate-300">إلغاء</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
              createPlan.mutate(newPlan);
              setShowNewPlan(false);
            }}>
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل الخطة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">الاسم بالعربية</Label>
                  <Input value={editingPlan.nameAr} onChange={(e) => setEditingPlan({ ...editingPlan, nameAr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <Label className="text-xs">السعر</Label>
                  <Input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })} className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={editingPlan.isActive} onCheckedChange={(v) => setEditingPlan({ ...editingPlan, isActive: v })} />
                  <Label className="text-xs">نشطة</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editingPlan.isPopular} onCheckedChange={(v) => setEditingPlan({ ...editingPlan, isPopular: v })} />
                  <Label className="text-xs">شائعة</Label>
                </div>
              </div>
              <div>
                <Label className="text-xs">المميزات</Label>
                <Textarea value={editingPlan.features || ""} onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPlan(null)} className="border-slate-700 text-slate-300">إلغاء</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
                updatePlan.mutate({
                  id: editingPlan.id,
                  nameAr: editingPlan.nameAr,
                  price: editingPlan.price,
                  isActive: editingPlan.isActive,
                  isPopular: editingPlan.isPopular,
                  features: editingPlan.features,
                });
                setEditingPlan(null);
              }}>
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ===== SECTION 5: CONTENT MANAGEMENT =====
function ContentManagementSection() {
  const messages = trpc.adminControl.getMessages.useQuery();
  const settings = trpc.adminControl.getSettings.useQuery();

  const upsertMessage = trpc.adminControl.upsertMessage.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الرسالة");
      messages.refetch();
    },
  });
  const deleteMessage = trpc.adminControl.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الرسالة");
      messages.refetch();
    },
  });
  const upsertSetting = trpc.adminControl.upsertSetting.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعداد");
      settings.refetch();
    },
  });

  const sendNotification = trpc.adminControl.sendNotification.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إرسال الإشعار إلى ${data.count} مستخدم`);
      setShowNotificationDialog(false);
    },
  });

  const [activeTab, setActiveTab] = useState("messages");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notification, setNotification] = useState({ titleAr: "", messageAr: "", userId: undefined as number | undefined });

  const [newMessage, setNewMessage] = useState({
    messageKey: "",
    contentAr: "",
    contentFr: "",
    contentEn: "",
    isActive: true,
    displayLocation: "home",
    messageType: "info" as "info" | "warning" | "success" | "promo",
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="messages" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            رسائل المنصة
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            الإعدادات العامة
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            إرسال إشعارات
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold">رسائل المنصة</h3>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowNewMessage(true)}>
              <Plus className="h-4 w-4 ml-1" /> رسالة جديدة
            </Button>
          </div>

          <div className="space-y-3">
            {messages.data?.map((msg) => (
              <Card key={msg.id} className="bg-slate-900 border-slate-800 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${msg.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {msg.isActive ? "نشطة" : "معطلة"}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                        {msg.displayLocation || "عام"}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                        {msg.messageType}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setEditingMessage({ ...msg })}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400" onClick={() => {
                        if (confirm("حذف هذه الرسالة؟")) deleteMessage.mutate({ id: msg.id });
                      }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-1 font-mono">{msg.messageKey}</p>
                  <p className="text-sm">{msg.contentAr || msg.contentFr || msg.contentEn || "-"}</p>
                </CardContent>
              </Card>
            ))}
            {(!messages.data || messages.data.length === 0) && (
              <p className="text-center text-slate-500 py-8">لا توجد رسائل بعد</p>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-white font-bold">الإعدادات العامة</h3>
          <div className="space-y-3">
            {settings.data?.map((setting) => (
              <Card key={setting.id} className="bg-slate-900 border-slate-800 text-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{setting.labelAr || setting.settingKey}</p>
                    <p className="text-xs text-slate-400">{setting.description || setting.settingKey}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.settingType === "boolean" ? (
                      <Switch
                        checked={setting.settingValue === "true"}
                        onCheckedChange={(v) => {
                          upsertSetting.mutate({
                            settingKey: setting.settingKey,
                            settingValue: v.toString(),
                            settingType: "boolean",
                            category: setting.category,
                          });
                        }}
                      />
                    ) : (
                      <Input
                        value={setting.settingValue || ""}
                        onChange={(e) => {
                          // Debounced save on blur
                        }}
                        onBlur={(e) => {
                          upsertSetting.mutate({
                            settingKey: setting.settingKey,
                            settingValue: e.target.value,
                            settingType: setting.settingType,
                            category: setting.category,
                          });
                        }}
                        className="bg-slate-800 border-slate-700 text-white w-60"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!settings.data || settings.data.length === 0) && (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">لا توجد إعدادات بعد. يمكنك إضافة إعدادات جديدة.</p>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    // Seed some default settings
                    const defaults = [
                      { settingKey: "platform_name", settingValue: "Leader Academy", settingType: "string" as const, category: "branding", labelAr: "اسم المنصة" },
                      { settingKey: "maintenance_mode", settingValue: "false", settingType: "boolean" as const, category: "general", labelAr: "وضع الصيانة" },
                      { settingKey: "registration_open", settingValue: "true", settingType: "boolean" as const, category: "general", labelAr: "التسجيل مفتوح" },
                      { settingKey: "max_file_upload_mb", settingValue: "10", settingType: "number" as const, category: "general", labelAr: "حد رفع الملفات (MB)" },
                      { settingKey: "support_email", settingValue: "support@leaderacademy.school", settingType: "string" as const, category: "general", labelAr: "بريد الدعم" },
                    ];
                    defaults.forEach((d) => upsertSetting.mutate(d));
                  }}
                >
                  تهيئة الإعدادات الافتراضية
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-400" />
                إرسال إشعار للمستخدمين
              </CardTitle>
              <CardDescription className="text-slate-400">
                أرسل إشعاراً لجميع المستخدمين أو لمستخدم محدد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-400">عنوان الإشعار</Label>
                <Input
                  value={notification.titleAr}
                  onChange={(e) => setNotification({ ...notification, titleAr: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="عنوان الإشعار..."
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">محتوى الإشعار</Label>
                <Textarea
                  value={notification.messageAr}
                  onChange={(e) => setNotification({ ...notification, messageAr: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="محتوى الإشعار..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">معرف المستخدم (اتركه فارغاً للإرسال للجميع)</Label>
                <Input
                  type="number"
                  value={notification.userId || ""}
                  onChange={(e) => setNotification({ ...notification, userId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="اتركه فارغاً للإرسال للجميع"
                />
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!notification.titleAr || !notification.messageAr || sendNotification.isPending}
                onClick={() => {
                  sendNotification.mutate({
                    titleAr: notification.titleAr,
                    messageAr: notification.messageAr,
                    userId: notification.userId,
                  });
                }}
              >
                <Bell className="h-4 w-4 ml-1" />
                {sendNotification.isPending ? "جاري الإرسال..." : notification.userId ? "إرسال لمستخدم محدد" : "إرسال للجميع"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Message Dialog */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>رسالة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">مفتاح الرسالة</Label>
                <Input value={newMessage.messageKey} onChange={(e) => setNewMessage({ ...newMessage, messageKey: e.target.value })} className="bg-slate-800 border-slate-700 text-white" placeholder="welcome_banner" />
              </div>
              <div>
                <Label className="text-xs">مكان العرض</Label>
                <Select value={newMessage.displayLocation} onValueChange={(v) => setNewMessage({ ...newMessage, displayLocation: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">الرئيسية</SelectItem>
                    <SelectItem value="tools">الأدوات</SelectItem>
                    <SelectItem value="pricing">الأسعار</SelectItem>
                    <SelectItem value="global_banner">بانر عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">المحتوى بالعربية</Label>
              <Textarea value={newMessage.contentAr} onChange={(e) => setNewMessage({ ...newMessage, contentAr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
            </div>
            <div>
              <Label className="text-xs">المحتوى بالفرنسية</Label>
              <Textarea value={newMessage.contentFr} onChange={(e) => setNewMessage({ ...newMessage, contentFr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
            </div>
            <div>
              <Label className="text-xs">المحتوى بالإنجليزية</Label>
              <Textarea value={newMessage.contentEn} onChange={(e) => setNewMessage({ ...newMessage, contentEn: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
            </div>
            <div>
              <Label className="text-xs">النوع</Label>
              <Select value={newMessage.messageType} onValueChange={(v) => setNewMessage({ ...newMessage, messageType: v as any })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="promo">ترويج</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMessage(false)} className="border-slate-700 text-slate-300">إلغاء</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
              upsertMessage.mutate(newMessage);
              setShowNewMessage(false);
              setNewMessage({ messageKey: "", contentAr: "", contentFr: "", contentEn: "", isActive: true, displayLocation: "home", messageType: "info" });
            }}>
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      {editingMessage && (
        <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل الرسالة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">المحتوى بالعربية</Label>
                <Textarea value={editingMessage.contentAr || ""} onChange={(e) => setEditingMessage({ ...editingMessage, contentAr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
              </div>
              <div>
                <Label className="text-xs">المحتوى بالفرنسية</Label>
                <Textarea value={editingMessage.contentFr || ""} onChange={(e) => setEditingMessage({ ...editingMessage, contentFr: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
              </div>
              <div>
                <Label className="text-xs">المحتوى بالإنجليزية</Label>
                <Textarea value={editingMessage.contentEn || ""} onChange={(e) => setEditingMessage({ ...editingMessage, contentEn: e.target.value })} className="bg-slate-800 border-slate-700 text-white" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingMessage.isActive} onCheckedChange={(v) => setEditingMessage({ ...editingMessage, isActive: v })} />
                <Label className="text-xs">نشطة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMessage(null)} className="border-slate-700 text-slate-300">إلغاء</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
                upsertMessage.mutate({
                  id: editingMessage.id,
                  messageKey: editingMessage.messageKey,
                  contentAr: editingMessage.contentAr,
                  contentFr: editingMessage.contentFr,
                  contentEn: editingMessage.contentEn,
                  isActive: editingMessage.isActive,
                });
                setEditingMessage(null);
              }}>
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ===== SECTION 6: PAGE MANAGEMENT =====
function PageManagementSection() {
  const pages = trpc.adminControl.getPageConfigs.useQuery();
  const seedPages = trpc.adminControl.seedPageConfigs.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      pages.refetch();
    },
  });
  const updatePage = trpc.adminControl.updatePageConfig.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصفحة بنجاح");
      pages.refetch();
    },
  });
  const addCustomPage = trpc.adminControl.addCustomPage.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الصفحة بنجاح");
      pages.refetch();
      setShowAddDialog(false);
      resetNewPage();
    },
  });
  const deletePage = trpc.adminControl.deleteCustomPage.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصفحة بنجاح");
      pages.refetch();
    },
  });
  const bulkUpdate = trpc.adminControl.bulkUpdatePageVisibility.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الإعدادات بنجاح");
      pages.refetch();
    },
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [newPage, setNewPage] = useState({
    pageKey: "",
    titleAr: "",
    titleFr: "",
    titleEn: "",
    descriptionAr: "",
    path: "",
    icon: "",
    category: "custom",
    pageType: "custom" as "custom" | "external_link",
    externalUrl: "",
    customContent: "",
    requiresAuth: false,
    requiredTier: "free" as "free" | "pro" | "premium",
    isVisible: true,
    badgeText: "",
    badgeColor: "",
  });

  const resetNewPage = () => {
    setNewPage({
      pageKey: "", titleAr: "", titleFr: "", titleEn: "", descriptionAr: "",
      path: "", icon: "", category: "custom", pageType: "custom",
      externalUrl: "", customContent: "", requiresAuth: false,
      requiredTier: "free", isVisible: true, badgeText: "", badgeColor: "",
    });
  };

  const CATEGORIES: Record<string, string> = {
    all: "الكل",
    main: "الصفحات الرئيسية",
    ai_tools: "أدوات الذكاء الاصطناعي",
    profile: "الملف الشخصي",
    custom: "صفحات مخصصة",
  };

  const filteredPages = useMemo(() => {
    if (!pages.data) return [];
    let result = [...pages.data];
    if (filterCategory !== "all") {
      result = result.filter((p) => p.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.titleAr.toLowerCase().includes(q) ||
          (p.titleFr && p.titleFr.toLowerCase().includes(q)) ||
          (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
          p.pageKey.toLowerCase().includes(q) ||
          p.path.toLowerCase().includes(q)
      );
    }
    return result;
  }, [pages.data, filterCategory, searchQuery]);

  const categoryStats = useMemo(() => {
    if (!pages.data) return {};
    const stats: Record<string, { total: number; visible: number; hidden: number }> = {};
    pages.data.forEach((p) => {
      const cat = p.category || "other";
      if (!stats[cat]) stats[cat] = { total: 0, visible: 0, hidden: 0 };
      stats[cat].total++;
      if (p.isVisible) stats[cat].visible++;
      else stats[cat].hidden++;
    });
    return stats;
  }, [pages.data]);

  // Seed if no pages exist
  if (pages.data && pages.data.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">إعداد إدارة الصفحات</h3>
            <p className="text-slate-400 mb-6">
              لم يتم إعداد الصفحات بعد. اضغط لتحميل جميع صفحات الموقع الحالية.
            </p>
            <Button
              onClick={() => seedPages.mutate()}
              disabled={seedPages.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {seedPages.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
              تحميل الصفحات الافتراضية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categoryStats).map(([cat, stats]) => (
          <Card key={cat} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <p className="text-xs text-slate-400 mb-1">{CATEGORIES[cat] || cat}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{stats.total}</span>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-400 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {stats.visible}
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <EyeOff className="h-3 w-3" /> {stats.hidden}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex gap-3 flex-1 w-full md:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="بحث عن صفحة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة صفحة جديدة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="p-3 text-right">الصفحة</th>
                  <th className="p-3 text-center">المسار</th>
                  <th className="p-3 text-center">النوع</th>
                  <th className="p-3 text-center">الفئة</th>
                  <th className="p-3 text-center">مرئية</th>
                  <th className="p-3 text-center">مفعّلة</th>
                  <th className="p-3 text-center">تسجيل دخول</th>
                  <th className="p-3 text-center">المستوى</th>
                  <th className="p-3 text-center">شارة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{page.titleAr}</p>
                          <p className="text-slate-500 text-xs">{page.titleFr || page.pageKey}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <code className="text-xs bg-slate-800 px-2 py-1 rounded text-blue-300">{page.path}</code>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={
                        page.pageType === "built_in" ? "border-blue-500/30 text-blue-400" :
                        page.pageType === "custom" ? "border-green-500/30 text-green-400" :
                        "border-orange-500/30 text-orange-400"
                      }>
                        {page.pageType === "built_in" ? "مدمجة" : page.pageType === "custom" ? "مخصصة" : "رابط خارجي"}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs text-slate-400">{CATEGORIES[page.category || ""] || page.category}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={page.isVisible}
                        onCheckedChange={(checked) => {
                          updatePage.mutate({ id: page.id, isVisible: checked });
                        }}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={page.isEnabled}
                        onCheckedChange={(checked) => {
                          updatePage.mutate({ id: page.id, isEnabled: checked });
                        }}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={page.requiresAuth}
                        onCheckedChange={(checked) => {
                          updatePage.mutate({ id: page.id, requiresAuth: checked });
                        }}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Select
                        value={page.requiredTier || "free"}
                        onValueChange={(val) => {
                          updatePage.mutate({ id: page.id, requiredTier: val as any });
                        }}
                      >
                        <SelectTrigger className="w-[90px] h-7 text-xs bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">مجاني</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      {page.badgeText ? (
                        <Badge style={{ backgroundColor: page.badgeColor || "#3B82F6" }} className="text-white text-xs">
                          {page.badgeText}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300"
                          onClick={() => setEditingPage({ ...page })}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {page.pageType !== "built_in" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذه الصفحة؟")) {
                                deletePage.mutate({ id: page.id });
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPages.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد صفحات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Page Dialog */}
      {editingPage && (
        <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل الصفحة: {editingPage.titleAr}</DialogTitle>
              <DialogDescription className="text-slate-400">
                تعديل إعدادات ومحتوى الصفحة
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>العنوان بالعربية</Label>
                <Input
                  value={editingPage.titleAr}
                  onChange={(e) => setEditingPage({ ...editingPage, titleAr: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان بالفرنسية</Label>
                <Input
                  value={editingPage.titleFr || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, titleFr: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان بالإنجليزية</Label>
                <Input
                  value={editingPage.titleEn || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, titleEn: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>الأيقونة (Lucide)</Label>
                <Input
                  value={editingPage.icon || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, icon: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="FileText, Home, Sparkles..."
                />
              </div>
              <div className="space-y-2">
                <Label>نص الشارة</Label>
                <Input
                  value={editingPage.badgeText || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, badgeText: e.target.value || null })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="جديد، حصري..."
                />
              </div>
              <div className="space-y-2">
                <Label>لون الشارة</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingPage.badgeColor || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, badgeColor: e.target.value || null })}
                    className="bg-slate-800 border-slate-700 flex-1"
                    placeholder="#FF6B00"
                  />
                  <input
                    type="color"
                    value={editingPage.badgeColor || "#3B82F6"}
                    onChange={(e) => setEditingPage({ ...editingPage, badgeColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
              {editingPage.pageType === "external_link" && (
                <div className="space-y-2 col-span-2">
                  <Label>الرابط الخارجي</Label>
                  <Input
                    value={editingPage.externalUrl || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, externalUrl: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    dir="ltr"
                  />
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label>الوصف بالعربية</Label>
                <Textarea
                  value={editingPage.descriptionAr || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, descriptionAr: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  rows={2}
                />
              </div>
              {(editingPage.pageType === "custom" || editingPage.pageType === "built_in") && (
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    محتوى الصفحة (محرر مرئي)
                  </Label>
                  <RichTextEditor
                    content={editingPage.customContent || ""}
                    onChange={(html) => setEditingPage({ ...editingPage, customContent: html })}
                    placeholder="اكتب محتوى الصفحة هنا..."
                    minHeight="250px"
                    darkMode={true}
                  />
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label>عنوان SEO</Label>
                <Input
                  value={editingPage.metaTitle || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value || null })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>وصف SEO</Label>
                <Textarea
                  value={editingPage.metaDescription || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value || null })}
                  className="bg-slate-800 border-slate-700"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPage(null)} className="border-slate-600">
                إلغاء
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  updatePage.mutate({
                    id: editingPage.id,
                    titleAr: editingPage.titleAr,
                    titleFr: editingPage.titleFr || undefined,
                    titleEn: editingPage.titleEn || undefined,
                    descriptionAr: editingPage.descriptionAr || undefined,
                    icon: editingPage.icon || undefined,
                    badgeText: editingPage.badgeText,
                    badgeColor: editingPage.badgeColor,
                    externalUrl: editingPage.externalUrl,
                    metaTitle: editingPage.metaTitle,
                    metaDescription: editingPage.metaDescription,
                    customContent: editingPage.customContent,
                  });
                  setEditingPage(null);
                }}
              >
                <Save className="h-4 w-4 ml-2" />
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Page Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة صفحة جديدة</DialogTitle>
            <DialogDescription className="text-slate-400">
              أضف صفحة مخصصة أو رابط خارجي إلى الموقع
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>نوع الصفحة *</Label>
              <Select
                value={newPage.pageType}
                onValueChange={(val) => setNewPage({ ...newPage, pageType: val as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">صفحة مخصصة</SelectItem>
                  <SelectItem value="external_link">رابط خارجي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>معرّف الصفحة (بالإنجليزية) *</Label>
              <Input
                value={newPage.pageKey}
                onChange={(e) => setNewPage({ ...newPage, pageKey: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="bg-slate-800 border-slate-700"
                dir="ltr"
                placeholder="my-custom-page"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان بالعربية *</Label>
              <Input
                value={newPage.titleAr}
                onChange={(e) => setNewPage({ ...newPage, titleAr: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان بالفرنسية</Label>
              <Input
                value={newPage.titleFr}
                onChange={(e) => setNewPage({ ...newPage, titleFr: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان بالإنجليزية</Label>
              <Input
                value={newPage.titleEn}
                onChange={(e) => setNewPage({ ...newPage, titleEn: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>المسار *</Label>
              <Input
                value={newPage.path}
                onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                className="bg-slate-800 border-slate-700"
                dir="ltr"
                placeholder="/my-page"
              />
            </div>
            <div className="space-y-2">
              <Label>الأيقونة (Lucide)</Label>
              <Input
                value={newPage.icon}
                onChange={(e) => setNewPage({ ...newPage, icon: e.target.value })}
                className="bg-slate-800 border-slate-700"
                placeholder="FileText"
              />
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select
                value={newPage.category}
                onValueChange={(val) => setNewPage({ ...newPage, category: val })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">رئيسية</SelectItem>
                  <SelectItem value="ai_tools">أدوات ذكاء اصطناعي</SelectItem>
                  <SelectItem value="profile">ملف شخصي</SelectItem>
                  <SelectItem value="custom">مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المستوى المطلوب</Label>
              <Select
                value={newPage.requiredTier}
                onValueChange={(val) => setNewPage({ ...newPage, requiredTier: val as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={newPage.requiresAuth}
                onCheckedChange={(checked) => setNewPage({ ...newPage, requiresAuth: checked })}
              />
              <Label>يتطلب تسجيل دخول</Label>
            </div>
            {newPage.pageType === "external_link" && (
              <div className="space-y-2 col-span-2">
                <Label>الرابط الخارجي *</Label>
                <Input
                  value={newPage.externalUrl}
                  onChange={(e) => setNewPage({ ...newPage, externalUrl: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  dir="ltr"
                  placeholder="https://example.com"
                />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label>الوصف بالعربية</Label>
              <Textarea
                value={newPage.descriptionAr}
                onChange={(e) => setNewPage({ ...newPage, descriptionAr: e.target.value })}
                className="bg-slate-800 border-slate-700"
                rows={2}
              />
            </div>
            {newPage.pageType === "custom" && (
              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  محتوى الصفحة (محرر مرئي)
                </Label>
                <RichTextEditor
                  content={newPage.customContent}
                  onChange={(html) => setNewPage({ ...newPage, customContent: html })}
                  placeholder="اكتب محتوى الصفحة المخصصة هنا..."
                  minHeight="250px"
                  darkMode={true}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>نص الشارة</Label>
              <Input
                value={newPage.badgeText}
                onChange={(e) => setNewPage({ ...newPage, badgeText: e.target.value })}
                className="bg-slate-800 border-slate-700"
                placeholder="جديد"
              />
            </div>
            <div className="space-y-2">
              <Label>لون الشارة</Label>
              <div className="flex gap-2">
                <Input
                  value={newPage.badgeColor}
                  onChange={(e) => setNewPage({ ...newPage, badgeColor: e.target.value })}
                  className="bg-slate-800 border-slate-700 flex-1"
                  placeholder="#FF6B00"
                />
                <input
                  type="color"
                  value={newPage.badgeColor || "#3B82F6"}
                  onChange={(e) => setNewPage({ ...newPage, badgeColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetNewPage(); }} className="border-slate-600">
              إلغاء
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={!newPage.pageKey || !newPage.titleAr || !newPage.path || addCustomPage.isPending}
              onClick={() => {
                addCustomPage.mutate({
                  pageKey: newPage.pageKey,
                  titleAr: newPage.titleAr,
                  titleFr: newPage.titleFr || undefined,
                  titleEn: newPage.titleEn || undefined,
                  descriptionAr: newPage.descriptionAr || undefined,
                  path: newPage.path,
                  icon: newPage.icon || undefined,
                  category: newPage.category || undefined,
                  pageType: newPage.pageType,
                  externalUrl: newPage.externalUrl || undefined,
                  customContent: newPage.customContent || undefined,
                  requiresAuth: newPage.requiresAuth,
                  requiredTier: newPage.requiredTier,
                  isVisible: newPage.isVisible,
                  badgeText: newPage.badgeText || undefined,
                  badgeColor: newPage.badgeColor || undefined,
                });
              }}
            >
              {addCustomPage.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
              إضافة الصفحة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== SECTION 6: NAME CORRECTION =====
function NameCorrectionSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => {
      if (value.trim().length >= 2) {
        setDebouncedQuery(value.trim());
      } else {
        setDebouncedQuery("");
      }
    }, 400);
  };

  const searchResults = trpc.adminControl.searchUsersForCorrection.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const history = trpc.adminControl.getNameEditHistory.useQuery({ limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenTool className="h-6 w-6 text-orange-400" />
            تصحيح أسماء المشاركين
          </h2>
          <p className="text-slate-400 mt-1">تعديل الأسماء وإعادة إصدار الشهادات</p>
        </div>
        <a href="/admin/name-correction" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <ArrowUpRight className="h-4 w-4 ml-1" />
            فتح في صفحة كاملة
          </Button>
        </a>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="search" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Search className="h-4 w-4 ml-1" />
            البحث والتصحيح
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Clock className="h-4 w-4 ml-1" />
            سجل التعديلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          {/* Search */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {searchResults.isLoading && debouncedQuery && (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="h-5 w-5 animate-spin text-orange-400" />
                  <span className="mr-2 text-slate-400">جاري البحث...</span>
                </div>
              )}

              {searchResults.data && searchResults.data.length > 0 && (
                <div className="space-y-2">
                  {searchResults.data.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUserId === u.id
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-700 hover:border-orange-500/50 bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">
                            {u.firstNameAr || ""} {u.lastNameAr || ""}
                          </span>
                          {(u.firstNameFr || u.lastNameFr) && (
                            <span className="text-sm text-slate-400 mr-2" dir="ltr">
                              ({u.firstNameFr || ""} {u.lastNameFr || ""})
                            </span>
                          )}
                          <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.data && searchResults.data.length === 0 && debouncedQuery && (
                <div className="text-center py-6 text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>لم يتم العثور على نتائج</p>
                </div>
              )}

              {!debouncedQuery && (
                <div className="text-center py-8 text-slate-500">
                  <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>اكتب اسم المشارك للبحث</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inline correction form */}
          {selectedUserId && (
            <InlineNameCorrection
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {history.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="h-5 w-5 animate-spin text-orange-400" />
                </div>
              ) : !history.data || history.data.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد تعديلات سابقة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.data.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{h.participantName}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(h.createdAt).toLocaleDateString("ar-TN")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-red-400 line-through">
                          {h.previousFirstNameAr} {h.previousLastNameAr}
                        </div>
                        <div className="text-green-400 font-medium">
                          {h.newFirstNameAr} {h.newLastNameAr}
                        </div>
                      </div>
                      {h.certificatesRegenerated && h.certificatesRegenerated > 0 && (
                        <Badge className="mt-2 bg-green-500/20 text-green-400 text-xs">
                          {h.certificatesRegenerated} شهادة معاد إصدارها
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Inline name correction form for AdminDashboardV2
function InlineNameCorrection({ userId, onClose }: { userId: number; onClose: () => void }) {
  const userDetails = trpc.adminControl.getUserForNameCorrection.useQuery({ userId });
  const correctName = trpc.adminControl.correctParticipantName.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      userDetails.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ");
    },
  });

  const [firstNameAr, setFirstNameAr] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");
  const [firstNameFr, setFirstNameFr] = useState("");
  const [lastNameFr, setLastNameFr] = useState("");
  const [reason, setReason] = useState("");
  const [regenerateCerts, setRegenerateCerts] = useState(true);
  const [initialized, setInitialized] = useState(false);

  if (userDetails.data && !initialized) {
    const u = userDetails.data.user;
    setFirstNameAr(u.firstNameAr || "");
    setLastNameAr(u.lastNameAr || "");
    setFirstNameFr(u.firstNameFr || "");
    setLastNameFr(u.lastNameFr || "");
    setInitialized(true);
  }

  const hasChanges = useMemo(() => {
    if (!userDetails.data) return false;
    const u = userDetails.data.user;
    return (
      firstNameAr !== (u.firstNameAr || "") ||
      lastNameAr !== (u.lastNameAr || "") ||
      firstNameFr !== (u.firstNameFr || "") ||
      lastNameFr !== (u.lastNameFr || "")
    );
  }, [firstNameAr, lastNameAr, firstNameFr, lastNameFr, userDetails.data]);

  if (userDetails.isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 mt-4">
        <CardContent className="py-8 text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-orange-400 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!userDetails.data) return null;
  const { user: participant, certificates: certs } = userDetails.data;

  return (
    <Card className="bg-slate-900 border-orange-500/30 mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <PenTool className="h-5 w-5 text-orange-400" />
            تصحيح: {participant.firstNameAr} {participant.lastNameAr}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-xs">الاسم الأول (عربي)</Label>
            <Input value={firstNameAr} onChange={(e) => setFirstNameAr(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1" dir="rtl" />
          </div>
          <div>
            <Label className="text-slate-300 text-xs">اللقب (عربي)</Label>
            <Input value={lastNameAr} onChange={(e) => setLastNameAr(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1" dir="rtl" />
          </div>
          <div>
            <Label className="text-slate-300 text-xs">Prénom (فرنسي)</Label>
            <Input value={firstNameFr} onChange={(e) => setFirstNameFr(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1" dir="ltr" />
          </div>
          <div>
            <Label className="text-slate-300 text-xs">Nom (فرنسي)</Label>
            <Input value={lastNameFr} onChange={(e) => setLastNameFr(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white mt-1" dir="ltr" />
          </div>
        </div>

        <div>
          <Label className="text-slate-300 text-xs">سبب التصحيح</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: خطأ إملائي..."
            className="bg-slate-800 border-slate-700 text-white mt-1 placeholder:text-slate-600" />
        </div>

        {certs.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
            <input
              type="checkbox"
              checked={regenerateCerts}
              onChange={(e) => setRegenerateCerts(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-amber-300">
              إعادة إصدار {certs.length} شهادة بالاسم الجديد
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => {
              correctName.mutate({
                userId,
                firstNameAr: firstNameAr || undefined,
                lastNameAr: lastNameAr || undefined,
                firstNameFr: firstNameFr || undefined,
                lastNameFr: lastNameFr || undefined,
                reason: reason || undefined,
                regenerateCertificates: regenerateCerts,
              });
            }}
            disabled={!hasChanges || correctName.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {correctName.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin ml-1" />
            ) : (
              <Check className="h-4 w-4 ml-1" />
            )}
            حفظ التصحيح
          </Button>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
