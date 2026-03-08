import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard, Users, CreditCard, Activity, Settings, Download,
  ChevronRight, ChevronLeft, Eye, Check, X, Shield, Sparkles,
  BookOpen, GraduationCap, Package, Search, RefreshCw, FileText,
  BarChart3, Bell, Menu
} from "lucide-react";

// ===== TYPES =====
type Tab = "overview" | "users" | "payments" | "activity" | "pricing" | "bulk" | "settings";

const SERVICE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  accessEdugpt: { label: "EDUGPT", color: "bg-emerald-500", icon: <Sparkles className="h-3 w-3" /> },
  accessCourseAi: { label: "دورة AI", color: "bg-blue-500", icon: <BookOpen className="h-3 w-3" /> },
  accessCoursePedagogy: { label: "بيداغوجيا", color: "bg-purple-500", icon: <GraduationCap className="h-3 w-3" /> },
  accessFullBundle: { label: "الباقة الكاملة", color: "bg-amber-500", icon: <Package className="h-3 w-3" /> },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "مدير", color: "bg-red-500" },
  trainer: { label: "مدرب", color: "bg-blue-500" },
  supervisor: { label: "مشرف", color: "bg-purple-500" },
  user: { label: "مستخدم", color: "bg-gray-500" },
};

const SERVICE_REQUEST_LABELS: Record<string, string> = {
  edugpt_pro: "EDUGPT PRO",
  course_ai: "دورة الذكاء الاصطناعي",
  course_pedagogy: "دورة البيداغوجيا",
  full_bundle: "الباقة الكاملة",
};

const ACTIVITY_LABELS: Record<string, { label: string; icon: string }> = {
  lesson_plan: { label: "جذاذة/مذكرة", icon: "📝" },
  exam_generated: { label: "اختبار", icon: "📋" },
  evaluation: { label: "تقييم", icon: "✅" },
  image_generated: { label: "صورة", icon: "🎨" },
  inspection_report: { label: "تقرير تفقد", icon: "🔍" },
};

// ===== MAIN COMPONENT =====
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check admin access
  if (!user || !["admin", "trainer", "supervisor"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">وصول محظور</h2>
            <p className="text-muted-foreground">هذه الصفحة مخصصة للمسؤولين فقط.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/"}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "users", label: "إدارة المستخدمين", icon: <Users className="h-5 w-5" /> },
    { id: "payments", label: "طلبات الدفع", icon: <CreditCard className="h-5 w-5" /> },
    { id: "activity", label: "مراقبة AI", icon: <Activity className="h-5 w-5" /> },
    { id: "pricing", label: "الأسعار", icon: <CreditCard className="h-5 w-5" /> },
    { id: "bulk", label: "تفعيل جماعي", icon: <Users className="h-5 w-5" /> },
    { id: "settings", label: "الإعدادات", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 right-0 h-screen z-50 lg:z-auto
        bg-slate-900 text-white transition-all duration-300 flex flex-col
        ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        ${sidebarOpen ? "w-64" : "w-20"}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm">لوحة التحكم</h1>
              <p className="text-xs text-slate-400">Leader Academy</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
                ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
            >
              {tab.icon}
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="p-3 border-t border-slate-700 hidden lg:block">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {sidebarOpen && <span>طي القائمة</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {ROLE_LABELS[user.role]?.label || user.role}
            </Badge>
            <span className="text-sm text-gray-600 hidden sm:inline">{user.name || user.email}</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "pricing" && <PricingTab />}
          {activeTab === "bulk" && <BulkActivationTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

// ===== OVERVIEW TAB =====
function OverviewTab() {
  const { data, isLoading, refetch } = trpc.adminDashboard.getOverview.useQuery();

  const cards = [
    { title: "إجمالي المستخدمين", value: data?.totalUsers ?? 0, icon: <Users className="h-6 w-6" />, color: "text-blue-600 bg-blue-50" },
    { title: "مشتركو EDUGPT", value: data?.edugptSubscribers ?? 0, icon: <Sparkles className="h-6 w-6" />, color: "text-emerald-600 bg-emerald-50" },
    { title: "طلاب الدورات", value: data?.courseStudents ?? 0, icon: <GraduationCap className="h-6 w-6" />, color: "text-purple-600 bg-purple-50" },
    { title: "مدفوعات معلقة", value: data?.pendingPayments ?? 0, icon: <CreditCard className="h-6 w-6" />, color: "text-amber-600 bg-amber-50" },
    { title: "نشاط AI اليوم", value: data?.todayAiActivities ?? 0, icon: <Activity className="h-6 w-6" />, color: "text-rose-600 bg-rose-50" },
    { title: "إجمالي نشاط AI", value: data?.totalAiActivities ?? 0, icon: <BarChart3 className="h-6 w-6" />, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">الإحصائيات العامة</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? "..." : card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== USERS TAB =====
function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [permDialog, setPermDialog] = useState<any>(null);

  const { data, isLoading, refetch } = trpc.adminDashboard.listUsers.useQuery({ page, limit: 20 });
  const updateRole = trpc.adminDashboard.updateUserRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الدور"); refetch(); setEditingUser(null); },
    onError: (e) => toast.error(e.message),
  });
  const updatePerms = trpc.adminDashboard.updateUserPermissions.useMutation({
    onSuccess: () => { toast.success("تم تحديث الصلاحيات"); refetch(); setPermDialog(null); },
    onError: (e) => toast.error(e.message),
  });
  const exportCSV = trpc.adminDashboard.exportUsersCSV.useQuery(undefined, { enabled: false });

  const handleExportCSV = async () => {
    const result = await exportCSV.refetch();
    if (result.data) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير القائمة");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    if (!search) return data.users;
    const s = search.toLowerCase();
    return data.users.filter(u =>
      (u.name || "").toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.arabicName || "").includes(s)
    );
  }, [data?.users, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Users table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right p-3 font-medium">المستخدم</th>
                <th className="text-right p-3 font-medium">الدور</th>
                <th className="text-right p-3 font-medium">الخدمات</th>
                <th className="text-right p-3 font-medium">المستوى</th>
                <th className="text-right p-3 font-medium">التسجيل</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">جارٍ التحميل...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{u.name || u.arabicName || "بدون اسم"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={`${ROLE_LABELS[u.role]?.color || "bg-gray-500"} text-white text-xs`}>
                      {ROLE_LABELS[u.role]?.label || u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.permissions?.accessEdugpt && (
                        <Badge className="bg-emerald-500 text-white text-xs gap-1">
                          <Sparkles className="h-3 w-3" /> EDUGPT
                        </Badge>
                      )}
                      {u.permissions?.accessCourseAi && (
                        <Badge className="bg-blue-500 text-white text-xs gap-1">
                          <BookOpen className="h-3 w-3" /> AI
                        </Badge>
                      )}
                      {u.permissions?.accessCoursePedagogy && (
                        <Badge className="bg-purple-500 text-white text-xs gap-1">
                          <GraduationCap className="h-3 w-3" /> بيداغوجيا
                        </Badge>
                      )}
                      {u.permissions?.accessFullBundle && (
                        <Badge className="bg-amber-500 text-white text-xs gap-1">
                          <Package className="h-3 w-3" /> كاملة
                        </Badge>
                      )}
                      {!u.permissions?.accessEdugpt && !u.permissions?.accessCourseAi && !u.permissions?.accessCoursePedagogy && !u.permissions?.accessFullBundle && (
                        <span className="text-xs text-muted-foreground">مجاني</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {u.permissions?.tier || "free"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-TN") : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)} title="تعديل الدور">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPermDialog({
                        userId: u.id,
                        accessEdugpt: u.permissions?.accessEdugpt || false,
                        accessCourseAi: u.permissions?.accessCourseAi || false,
                        accessCoursePedagogy: u.permissions?.accessCoursePedagogy || false,
                        accessFullBundle: u.permissions?.accessFullBundle || false,
                        tier: u.permissions?.tier || "free",
                      })} title="تعديل الصلاحيات">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t">
            <p className="text-sm text-muted-foreground">
              صفحة {data.page} من {data.totalPages} ({data.total} مستخدم)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>التالي</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل دور المستخدم</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editingUser.name || editingUser.email}</p>
              <Select
                value={editingUser.role}
                onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="trainer">مدرب</SelectItem>
                  <SelectItem value="supervisor">مشرف</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button onClick={() => updateRole.mutate({ userId: editingUser.id, role: editingUser.role })}
                  disabled={updateRole.isPending}>
                  {updateRole.isPending ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!permDialog} onOpenChange={() => setPermDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات الخدمات</DialogTitle>
          </DialogHeader>
          {permDialog && (
            <div className="space-y-4">
              {Object.entries(SERVICE_LABELS).map(([key, { label, color, icon }]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${color} text-white`}>{icon}</div>
                    <Label>{label}</Label>
                  </div>
                  <Switch
                    checked={permDialog[key] || false}
                    onCheckedChange={(v) => setPermDialog({ ...permDialog, [key]: v })}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <Label>المستوى</Label>
                <Select value={permDialog.tier} onValueChange={(v) => setPermDialog({ ...permDialog, tier: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">مجاني</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={() => updatePerms.mutate(permDialog)} disabled={updatePerms.isPending}>
                  {updatePerms.isPending ? "جارٍ الحفظ..." : "حفظ الصلاحيات"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== PAYMENTS TAB =====
function PaymentsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approveDialog, setApproveDialog] = useState<any>(null);
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.adminDashboard.listPaymentRequests.useQuery({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter as any,
  });

  const approve = trpc.adminDashboard.approvePayment.useMutation({
    onSuccess: () => { toast.success("تم تفعيل الخدمة بنجاح"); refetch(); setApproveDialog(null); },
    onError: (e) => toast.error(e.message),
  });

  const reject = trpc.adminDashboard.rejectPayment.useMutation({
    onSuccess: () => { toast.success("تم رفض الطلب"); refetch(); setRejectDialog(null); setRejectReason(""); },
    onError: (e) => toast.error(e.message),
  });

  const exportCSV = trpc.adminDashboard.exportPaymentsCSV.useQuery(undefined, { enabled: false });

  const handleExportCSV = async () => {
    const result = await exportCSV.refetch();
    if (result.data) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير سجل المدفوعات");
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const STATUS_LABELS: Record<string, string> = {
    pending: "معلق",
    approved: "مفعّل",
    rejected: "مرفوض",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="approved">مفعّل</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Payment requests */}
      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
        ) : !data?.requests?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد طلبات دفع</CardContent></Card>
        ) : data.requests.map(req => (
          <Card key={req.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{req.userName || "بدون اسم"}</p>
                    <Badge className={STATUS_COLORS[req.status]}>{STATUS_LABELS[req.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <Badge variant="outline">{SERVICE_REQUEST_LABELS[req.requestedService] || req.requestedService}</Badge>
                    {req.amount && <span className="text-muted-foreground">{req.amount} {req.currency || "TND"}</span>}
                    <span className="text-muted-foreground">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString("ar-TN") : ""}
                    </span>
                  </div>
                  {req.userNote && <p className="text-xs mt-1 text-muted-foreground">ملاحظة: {req.userNote}</p>}
                  {req.rejectionReason && <p className="text-xs mt-1 text-red-600">سبب الرفض: {req.rejectionReason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReceiptPreview(req.receiptImageUrl)}>
                    <Eye className="h-4 w-4 ml-1" />
                    الإيصال
                  </Button>
                  {req.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setApproveDialog(req)}>
                        <Check className="h-4 w-4 ml-1" />
                        تفعيل
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectDialog(req)}>
                        <X className="h-4 w-4 ml-1" />
                        رفض
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>إيصال الدفع</DialogTitle></DialogHeader>
          {receiptPreview && (
            <img src={receiptPreview} alt="إيصال الدفع" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تفعيل الخدمات</DialogTitle>
          </DialogHeader>
          {approveDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                اختر الخدمات التي تريد تفعيلها لـ <strong>{approveDialog.userName}</strong>
              </p>
              <p className="text-sm">
                الخدمة المطلوبة: <Badge variant="outline">{SERVICE_REQUEST_LABELS[approveDialog.requestedService]}</Badge>
              </p>
              {Object.entries(SERVICE_LABELS).map(([key, { label, color, icon }]) => {
                const inputKey = key as keyof typeof approveDialog;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${color} text-white`}>{icon}</div>
                      <Label>{label}</Label>
                    </div>
                    <Switch
                      checked={approveDialog[inputKey] || false}
                      onCheckedChange={(v) => setApproveDialog({ ...approveDialog, [key]: v })}
                    />
                  </div>
                );
              })}
              <DialogFooter>
                <Button className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => approve.mutate({
                    requestId: approveDialog.id,
                    accessEdugpt: approveDialog.accessEdugpt || false,
                    accessCourseAi: approveDialog.accessCourseAi || false,
                    accessCoursePedagogy: approveDialog.accessCoursePedagogy || false,
                    accessFullBundle: approveDialog.accessFullBundle || false,
                  })}
                  disabled={approve.isPending}>
                  {approve.isPending ? "جارٍ التفعيل..." : "تأكيد التفعيل"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفض طلب الدفع</DialogTitle>
          </DialogHeader>
          {rejectDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                سيتم إرسال إشعار للمستخدم <strong>{rejectDialog.userName}</strong> بسبب الرفض.
              </p>
              <Textarea
                placeholder="سبب الرفض (إلزامي)..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
              />
              <DialogFooter>
                <Button variant="destructive"
                  onClick={() => reject.mutate({ requestId: rejectDialog.id, rejectionReason: rejectReason })}
                  disabled={reject.isPending || !rejectReason.trim()}>
                  {reject.isPending ? "جارٍ الرفض..." : "تأكيد الرفض"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== ACTIVITY TAB =====
function ActivityTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = trpc.adminDashboard.getAiActivityFeed.useQuery({ page, limit: 30 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">البث المباشر لنشاط الذكاء الاصطناعي</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
        ) : !data?.activities?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">لا يوجد نشاط بعد</CardContent></Card>
        ) : data.activities.map(act => (
          <Card key={act.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {ACTIVITY_LABELS[act.activityType]?.icon || "📌"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {ACTIVITY_LABELS[act.activityType]?.label || act.activityType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{act.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {act.createdAt ? new Date(act.createdAt).toLocaleString("ar-TN") : ""}
                  </span>
                </div>
                {act.title && <p className="text-sm font-medium mt-1 truncate">{act.title}</p>}
                {(act.subject || act.level) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {act.subject && `المادة: ${act.subject}`}
                    {act.subject && act.level && " | "}
                    {act.level && `المستوى: ${act.level}`}
                  </p>
                )}
                {act.contentPreview && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{act.contentPreview}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.total > 30 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="text-sm text-muted-foreground">صفحة {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}
    </div>
  );
}

// ===== PRICING TAB =====
const BILLING_LABELS: Record<string, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  yearly: "سنوي",
  lifetime: "مدى الحياة",
};

const COLOR_OPTIONS = [
  { value: "blue", label: "أزرق", class: "bg-blue-500" },
  { value: "emerald", label: "أخضر", class: "bg-emerald-500" },
  { value: "purple", label: "بنفسجي", class: "bg-purple-500" },
  { value: "amber", label: "ذهبي", class: "bg-amber-500" },
  { value: "rose", label: "وردي", class: "bg-rose-500" },
  { value: "indigo", label: "نيلي", class: "bg-indigo-500" },
];

function PricingTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    serviceKey: "edugpt_pro",
    nameAr: "",
    nameEn: "",
    description: "",
    price: 0,
    currency: "TND",
    billingPeriod: "monthly" as "monthly" | "quarterly" | "yearly" | "lifetime",
    features: "",
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    badgeText: "",
    color: "blue",
  });

  const utils = trpc.useUtils();
  const { data: plans, isLoading } = trpc.adminDashboard.listPricingPlans.useQuery();
  const createPlan = trpc.adminDashboard.createPricingPlan.useMutation({
    onSuccess: () => { toast.success("تم إنشاء الخطة بنجاح"); utils.adminDashboard.listPricingPlans.invalidate(); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updatePlan = trpc.adminDashboard.updatePricingPlan.useMutation({
    onSuccess: () => { toast.success("تم التحديث بنجاح"); utils.adminDashboard.listPricingPlans.invalidate(); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deletePlan = trpc.adminDashboard.deletePricingPlan.useMutation({
    onSuccess: () => { toast.success("تم الحذف"); utils.adminDashboard.listPricingPlans.invalidate(); },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ serviceKey: "edugpt_pro", nameAr: "", nameEn: "", description: "", price: 0, currency: "TND", billingPeriod: "monthly", features: "", isPopular: false, isActive: true, sortOrder: 0, badgeText: "", color: "blue" });
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setForm({
      serviceKey: plan.serviceKey,
      nameAr: plan.nameAr,
      nameEn: plan.nameEn || "",
      description: plan.description || "",
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      features: plan.features || "",
      isPopular: plan.isPopular || false,
      isActive: plan.isActive !== false,
      sortOrder: plan.sortOrder || 0,
      badgeText: plan.badgeText || "",
      color: plan.color || "blue",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.nameAr) { toast.error("يرجى إدخال اسم الخطة"); return; }
    if (editingId) {
      updatePlan.mutate({ id: editingId, ...form });
    } else {
      createPlan.mutate(form);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 1000).toFixed(3) + " TND";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">إدارة الأسعار</h2>
          <p className="text-sm text-muted-foreground">تحديد أسعار الخدمات وعرضها للمستخدمين</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <span>+</span> خطة جديدة
        </Button>
      </div>

      {/* Plans list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : !plans?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">لا توجد خطط أسعار بعد</p>
            <p className="text-sm text-muted-foreground/70 mt-1">أنشئ خطة جديدة لعرضها للمستخدمين</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const colorClass = COLOR_OPTIONS.find(c => c.value === plan.color)?.class || "bg-blue-500";
            let featuresList: string[] = [];
            try { featuresList = plan.features ? JSON.parse(plan.features) : []; } catch { featuresList = []; }
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${!plan.isActive ? 'opacity-60' : ''}`}>
                <div className={`h-2 ${colorClass}`} />
                {plan.isPopular && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
                    {plan.badgeText || "الأكثر طلباً"}
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.nameAr}</CardTitle>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "نشط" : "معطل"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{SERVICE_REQUEST_LABELS[plan.serviceKey] || plan.serviceKey}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground"> / {BILLING_LABELS[plan.billingPeriod]}</span>
                  </div>
                  {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                  {featuresList.length > 0 && (
                    <ul className="space-y-1">
                      {featuresList.map((f, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plan)} className="flex-1">
                      تعديل
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50"
                      onClick={() => { if (confirm("هل تريد حذف هذه الخطة؟")) deletePlan.mutate({ id: plan.id }); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل خطة الأسعار" : "إنشاء خطة أسعار جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الخدمة</Label>
                <Select value={form.serviceKey} onValueChange={(v) => setForm({ ...form, serviceKey: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edugpt_pro">EDUGPT PRO</SelectItem>
                    <SelectItem value="course_ai">دورة الذكاء الاصطناعي</SelectItem>
                    <SelectItem value="course_pedagogy">دورة البيداغوجيا</SelectItem>
                    <SelectItem value="full_bundle">الباقة الكاملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>فترة الفوترة</Label>
                <Select value={form.billingPeriod} onValueChange={(v: any) => setForm({ ...form, billingPeriod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>الاسم بالعربية *</Label>
              <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="مثال: باقة EDUGPT الاحترافية" />
            </div>
            <div>
              <Label>الاسم بالإنجليزية</Label>
              <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="EDUGPT Pro" />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف مختصر للخطة..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>السعر (بالمليمات) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} placeholder="25000 = 25 TND" />
                <p className="text-xs text-muted-foreground mt-1">{(form.price / 1000).toFixed(3)} TND</p>
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>المميزات (JSON array)</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder='["توليد غير محدود للجذاذات", "بناء اختبارات", "المتفقد الذكي"]'
                className="font-mono text-xs" rows={3} />
            </div>
            <div>
              <Label>نص الشارة</Label>
              <Input value={form.badgeText} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} placeholder="الأكثر طلباً" />
            </div>
            <div>
              <Label>اللون</Label>
              <div className="flex gap-2 mt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c.value} onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-8 h-8 rounded-full ${c.class} ${form.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    title={c.label} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isPopular} onCheckedChange={(v) => setForm({ ...form, isPopular: v })} />
                <Label>الأكثر طلباً</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label>نشط</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetForm}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createPlan.isPending || updatePlan.isPending}>
              {(createPlan.isPending || updatePlan.isPending) ? "جاري..." : editingId ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">إشعار عند رفع إيصال دفع جديد</p>
              <p className="text-sm text-muted-foreground">تلقي إشعار فوري عند إرسال طلب دفع</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">إشعار عند تسجيل مستخدم جديد</p>
              <p className="text-sm text-muted-foreground">تلقي إشعار عند انضمام مستخدم جديد</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تقرير يومي بالنشاط</p>
              <p className="text-sm text-muted-foreground">ملخص يومي لنشاط المنصة عبر البريد</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تصدير البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">يمكنك تصدير بيانات المنصة من صفحات إدارة المستخدمين وطلبات الدفع.</p>
        </CardContent>
      </Card>
    </div>
  );
}


// ===== BULK ACTIVATION TAB =====
function BulkActivationTab() {
  const [emailsText, setEmailsText] = useState("");
  const [tier, setTier] = useState<"pro" | "premium">("pro");
  const [accessEdugpt, setAccessEdugpt] = useState(true);
  const [accessCourseAi, setAccessCourseAi] = useState(false);
  const [accessCoursePedagogy, setAccessCoursePedagogy] = useState(false);
  const [accessFullBundle, setAccessFullBundle] = useState(false);
  const [result, setResult] = useState<{ activated: number; notFound: number; notFoundEmails: string[]; total: number } | null>(null);

  const bulkActivate = trpc.adminDashboard.bulkActivate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(`تم تفعيل ${data.activated} حساب من أصل ${data.total}`);
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const emails = emailsText
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.length > 0 && e.includes("@"));

  const handleActivate = () => {
    if (emails.length === 0) {
      toast.error("يرجى إدخال عنوان بريد إلكتروني واحد على الأقل");
      return;
    }
    if (emails.length > 500) {
      toast.error("الحد الأقصى 500 بريد إلكتروني في المرة الواحدة");
      return;
    }
    bulkActivate.mutate({
      emails,
      tier,
      accessEdugpt,
      accessCourseAi,
      accessCoursePedagogy,
      accessFullBundle,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            تفعيل جماعي للحسابات
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            أدخل عناوين البريد الإلكتروني (حتى 500) لترقية حساباتهم دفعة واحدة إلى PRO أو Premium.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Emails input */}
          <div className="space-y-2">
            <Label>عناوين البريد الإلكتروني</Label>
            <Textarea
              placeholder={"أدخل عناوين البريد (واحد في كل سطر أو مفصولة بفاصلة):\nuser1@example.com\nuser2@example.com\nuser3@example.com"}
              value={emailsText}
              onChange={e => { setEmailsText(e.target.value); setResult(null); }}
              rows={8}
              className="font-mono text-sm"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              {emails.length > 0 ? `✅ تم اكتشاف ${emails.length} بريد إلكتروني صالح` : "لم يتم اكتشاف أي بريد إلكتروني بعد"}
              {emails.length > 500 && <span className="text-red-500 mr-2">⚠️ تجاوز الحد الأقصى (500)</span>}
            </p>
          </div>

          {/* Tier selection */}
          <div className="space-y-2">
            <Label>المستوى</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as "pro" | "premium")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">PRO</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label>الصلاحيات</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={accessEdugpt} onCheckedChange={setAccessEdugpt} />
                <span className="text-sm">EDUGPT</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={accessCourseAi} onCheckedChange={setAccessCourseAi} />
                <span className="text-sm">دورة AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={accessCoursePedagogy} onCheckedChange={setAccessCoursePedagogy} />
                <span className="text-sm">بيداغوجيا</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={accessFullBundle} onCheckedChange={setAccessFullBundle} />
                <span className="text-sm">الباقة الكاملة</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            onClick={handleActivate}
            disabled={bulkActivate.isPending || emails.length === 0 || emails.length > 500}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {bulkActivate.isPending ? (
              <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> جاري التفعيل...</span>
            ) : (
              `تفعيل ${emails.length} حساب`
            )}
          </Button>

          {/* Results */}
          {result && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-bold text-sm">نتائج التفعيل الجماعي</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-emerald-600">{result.activated}</p>
                    <p className="text-xs text-muted-foreground">تم تفعيلهم</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-red-500">{result.notFound}</p>
                    <p className="text-xs text-muted-foreground">غير موجودين</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-blue-600">{result.total}</p>
                    <p className="text-xs text-muted-foreground">الإجمالي</p>
                  </div>
                </div>
                {result.notFoundEmails.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-600 mb-1">عناوين غير مسجلة في المنصة:</p>
                    <div className="bg-red-50 rounded p-2 text-xs font-mono max-h-32 overflow-auto" dir="ltr">
                      {result.notFoundEmails.map((e, i) => (
                        <div key={i} className="text-red-700">{e}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
