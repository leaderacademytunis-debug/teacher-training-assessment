import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Plus, Trash2, Settings, BarChart3, BookOpen, Search, UserPlus, CheckCircle2, Clock, AlertCircle, ArrowRight, Loader2, Tag, Shield, Link2, Copy, RefreshCw, Download, ExternalLink, Eye, Paperclip, FileText, Image as ImageIcon, PieChart, MessageSquare } from "lucide-react";
import BatchStatsDashboard from "./BatchStatsDashboard";
import SubmissionComments from "./SubmissionComments";
import ParticipantPDFReport from "./ParticipantPDFReport";

const FEATURE_OPTIONS = [
  { key: "accessEdugpt", label: "EduGPT المساعد الذكي", icon: "🤖" },
  { key: "accessInspector", label: "المفتش البيداغوجي", icon: "🔍" },
  { key: "accessDrama", label: "محرك الدراما", icon: "🎭" },
  { key: "accessVisualStudio", label: "الاستوديو البصري", icon: "🎨" },
  { key: "accessExamBuilder", label: "مولد الاختبارات", icon: "📝" },
  { key: "accessCourseAi", label: "دورة الذكاء الاصطناعي", icon: "📚" },
  { key: "accessCoursePedagogy", label: "دورة البيداغوجيا", icon: "📖" },
];

const BATCH_COLORS = [
  { value: "#3B82F6", label: "أزرق" },
  { value: "#10B981", label: "أخضر" },
  { value: "#F59E0B", label: "برتقالي" },
  { value: "#EF4444", label: "أحمر" },
  { value: "#8B5CF6", label: "بنفسجي" },
  { value: "#EC4899", label: "وردي" },
  { value: "#06B6D4", label: "سماوي" },
];

export default function AdminBatchManager() {
  const { user } = useAuth();
  // Using sonner toast
  const [activeTab, setActiveTab] = useState("batches");
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form states
  const [newBatch, setNewBatch] = useState({ name: "", description: "", color: "#3B82F6" });
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", type: "lesson_plan" as const, dueDate: "", maxScore: 100 });
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [showInviteLinkDialog, setShowInviteLinkDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [inviteMaxMembers, setInviteMaxMembers] = useState<string>("");
  const [showSubmissionDetail, setShowSubmissionDetail] = useState<number | null>(null);
  const [reportUserId, setReportUserId] = useState<number | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Queries
  const batchesQuery = trpc.batchManager.listBatches.useQuery(undefined, { enabled: !!user && user.role === "admin" });
  const batchDetailQuery = trpc.batchManager.getBatch.useQuery({ id: selectedBatchId! }, { enabled: !!selectedBatchId });
  const batchProgressQuery = trpc.batchManager.batchProgress.useQuery({ batchId: selectedBatchId! }, { enabled: !!selectedBatchId && activeTab === "progress" });
  const searchUsersQuery = trpc.batchManager.searchUsers.useQuery({ query: searchQuery }, { enabled: searchQuery.length >= 2 });
  const submissionsQuery = trpc.assignmentManager.getAssignmentSubmissions.useQuery(
    { assignmentId: showSubmissionDetail! },
    { enabled: !!showSubmissionDetail }
  );

  // Mutations
  const createBatch = trpc.batchManager.createBatch.useMutation({
    onSuccess: () => { batchesQuery.refetch(); setShowCreateDialog(false); setNewBatch({ name: "", description: "", color: "#3B82F6" }); toast.success("تم إنشاء الدفعة بنجاح"); },
  });
  const deleteBatch = trpc.batchManager.deleteBatch.useMutation({
    onSuccess: () => { batchesQuery.refetch(); setSelectedBatchId(null); toast.success("تم حذف الدفعة"); },
  });
  const addMembers = trpc.batchManager.addMembers.useMutation({
    onSuccess: (data) => { batchDetailQuery.refetch(); batchesQuery.refetch(); toast.success(`تمت إضافة ${data.added} عضو`); },
  });
  const removeMember = trpc.batchManager.removeMember.useMutation({
    onSuccess: () => { batchDetailQuery.refetch(); batchesQuery.refetch(); toast.success("تمت إزالة العضو"); },
  });
  const setFeatureAccess = trpc.batchManager.setFeatureAccess.useMutation({
    onSuccess: () => { batchDetailQuery.refetch(); batchesQuery.refetch(); setShowFeatureDialog(false); toast.success("تم تحديث صلاحيات الوصول"); },
  });
  const createAssignment = trpc.assignmentManager.createAssignment.useMutation({
    onSuccess: () => { batchDetailQuery.refetch(); batchProgressQuery.refetch(); setShowAssignmentDialog(false); setNewAssignment({ title: "", description: "", type: "lesson_plan", dueDate: "", maxScore: 100 }); toast.success("تم إنشاء الواجب بنجاح"); },
  });
  const aiGrade = trpc.assignmentManager.aiGradeSubmission.useMutation({
    onSuccess: (data) => { toast.success(`تم التقييم: ${data.score}/${100} - ${data.grade}`); },
  });
  const generateInviteLink = trpc.batchManager.generateInviteLink.useMutation({
    onSuccess: () => { inviteLinkQuery.refetch(); toast.success("تم إنشاء رابط الدعوة"); },
  });
  const regenerateInviteLink = trpc.batchManager.regenerateInviteLink.useMutation({
    onSuccess: () => { inviteLinkQuery.refetch(); toast.success("تم تجديد رابط الدعوة"); },
  });
  const inviteLinkQuery = trpc.batchManager.getInviteLink.useQuery({ batchId: selectedBatchId! }, { enabled: !!selectedBatchId });
  const exportGradesQuery = trpc.batchManager.exportBatchGrades.useQuery({ batchId: selectedBatchId! }, { enabled: false });

  const getInviteUrl = (code: string) => `${window.location.origin}/join/${code}`;

  const copyInviteLink = (code: string) => {
    navigator.clipboard.writeText(getInviteUrl(code));
    setCopiedLink(true);
    toast.success("تم نسخ رابط الدعوة");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = async () => {
    try {
      const result = await exportGradesQuery.refetch();
      if (!result.data) { toast.error("لا توجد بيانات للتصدير"); return; }
      const { batchName, rows } = result.data;
      if (rows.length === 0) { toast.error("لا توجد بيانات للتصدير"); return; }
      const BOM = "\uFEFF";
      const headers = ["الاسم", "البريد الإلكتروني", "الواجب", "النوع", "العلامة", "العلامة القصوى", "التقدير", "درجة التمكن", "الحالة", "تاريخ التسليم", "تاريخ التقييم"];
      const csvRows = rows.map(r => [
        r.userName, r.userEmail, r.assignmentTitle, r.assignmentType,
        r.score ?? "", r.maxScore, r.grade ?? "", r.masteryScore ?? "",
        r.status, r.submittedAt ?? "", r.gradedAt ?? ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      const csv = BOM + headers.join(",") + "\n" + csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${batchName}_grades.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير الدرجات بنجاح");
    } catch (e) { toast.error("فشل في تصدير البيانات"); }
  };


  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" dir="rtl">
        <Shield className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-bold">يرجى تسجيل الدخول</h2>
        <a href={getLoginUrl()}><Button>تسجيل الدخول</Button></a>
      </div>
    );
  }
  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" dir="rtl">
        <Shield className="h-16 w-16 text-red-400" />
        <h2 className="text-xl font-bold">غير مصرح</h2>
        <p className="text-gray-500">هذه الصفحة مخصصة للمسؤولين فقط</p>
        <Link href="/"><Button variant="outline">العودة للرئيسية</Button></Link>
      </div>
    );
  }

  const batchDetail = batchDetailQuery.data;
  const progressData = batchProgressQuery.data;

  // Invite Link Dialog

  const inviteLinkDialog = showInviteLinkDialog && selectedBatchId && (
    <Dialog open={showInviteLinkDialog} onOpenChange={setShowInviteLinkDialog}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-green-600" />رابط دعوة الانضمام</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {inviteLinkQuery.data?.inviteCode ? (
            <>
              <p className="text-sm text-gray-600">شارك هذا الرابط مع المشاركين للانضمام تلقائياً إلى الدفعة:</p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <input readOnly className="flex-1 bg-transparent text-sm font-mono text-left" dir="ltr" value={getInviteUrl(inviteLinkQuery.data.inviteCode)} />
                <Button size="sm" variant="outline" onClick={() => copyInviteLink(inviteLinkQuery.data!.inviteCode!)}>
                  {copiedLink ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {/* Expiry and Max Members info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-1">الأعضاء</p>
                  <p className="text-sm font-bold text-blue-800">
                    {inviteLinkQuery.data.currentMembers ?? 0}
                    {inviteLinkQuery.data.maxMembers ? ` / ${inviteLinkQuery.data.maxMembers}` : ' (غير محدود)'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium mb-1">الصلاحية</p>
                  <p className="text-sm font-bold text-amber-800">
                    {inviteLinkQuery.data.inviteExpiresAt
                      ? new Date(inviteLinkQuery.data.inviteExpiresAt).toLocaleDateString('ar-TN', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'غير محدودة'}
                  </p>
                </div>
              </div>
              {/* Settings */}
              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-medium text-gray-700">إعدادات الرابط:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">تاريخ انتهاء الصلاحية</label>
                    <Input type="date" value={inviteExpiresAt} onChange={(e) => setInviteExpiresAt(e.target.value)} className="text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">الحد الأقصى للأعضاء</label>
                    <Input type="number" min="1" placeholder="غير محدود" value={inviteMaxMembers} onChange={(e) => setInviteMaxMembers(e.target.value)} className="text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => regenerateInviteLink.mutate({ batchId: selectedBatchId!, expiresAt: inviteExpiresAt || undefined, maxMembers: inviteMaxMembers ? parseInt(inviteMaxMembers) : undefined })} disabled={regenerateInviteLink.isPending}>
                  {regenerateInviteLink.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <RefreshCw className="h-4 w-4 ml-1" />}
                  تجديد الرابط
                </Button>
                <Button size="sm" className="flex-1" onClick={() => copyInviteLink(inviteLinkQuery.data!.inviteCode!)}>
                  <Copy className="h-4 w-4 ml-1" />
                  نسخ الرابط
                </Button>
              </div>
              <p className="text-xs text-gray-500">عند تجديد الرابط، يصبح الرابط القديم غير صالح. الإعدادات الجديدة تُطبق على الرابط المجدد.</p>
            </>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">جاري إنشاء رابط الدعوة...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {inviteLinkDialog}
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/"><Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">← الرئيسية</Button></Link>
              </div>
              <h1 className="text-3xl font-bold">مدير الدفعات الأكاديمية</h1>
              <p className="text-blue-100 mt-1">إدارة المجموعات والواجبات والصلاحيات</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/batch-comparison">
                <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20"><BarChart3 className="h-4 w-4 ml-2" />مقارنة الدفعات</Button>
              </Link>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-700 hover:bg-blue-50"><Plus className="h-4 w-4 ml-2" />دفعة جديدة</Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>إنشاء دفعة جديدة</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">اسم الدفعة</label>
                      <Input placeholder="مثال: Batch-114, English-Group" value={newBatch.name} onChange={e => setNewBatch(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">الوصف</label>
                      <Textarea placeholder="وصف مختصر للدفعة..." value={newBatch.description} onChange={e => setNewBatch(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">اللون</label>
                      <div className="flex gap-2 flex-wrap">
                        {BATCH_COLORS.map(c => (
                          <button key={c.value} className={`w-8 h-8 rounded-full border-2 transition-all ${newBatch.color === c.value ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c.value }} onClick={() => setNewBatch(p => ({ ...p, color: c.value }))} title={c.label} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={() => createBatch.mutate(newBatch)} disabled={!newBatch.name || createBatch.isPending}>
                      {createBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}إنشاء
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{batchesQuery.data?.length || 0}</div>
              <div className="text-blue-100 text-sm">إجمالي الدفعات</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{batchesQuery.data?.reduce((s, b) => s + b.memberCount, 0) || 0}</div>
              <div className="text-blue-100 text-sm">إجمالي الأعضاء</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{batchesQuery.data?.reduce((s, b) => s + b.assignmentCount, 0) || 0}</div>
              <div className="text-blue-100 text-sm">إجمالي الواجبات</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{batchesQuery.data?.filter(b => b.isActive).length || 0}</div>
              <div className="text-blue-100 text-sm">دفعات نشطة</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch List (Left sidebar) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2"><Tag className="h-5 w-5" />الدفعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {batchesQuery.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : batchesQuery.data?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد دفعات بعد</p>
                    <p className="text-sm">أنشئ أول دفعة للبدء</p>
                  </div>
                ) : (
                  batchesQuery.data?.map(batch => (
                    <button key={batch.id} className={`w-full text-right p-3 rounded-lg border transition-all hover:shadow-sm ${selectedBatchId === batch.id ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setSelectedBatchId(batch.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: batch.color || "#3B82F6" }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{batch.name}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{batch.memberCount}</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{batch.assignmentCount}</span>
                            <span className="flex items-center gap-1">{batch.features.length} ميزة</span>
                          </div>
                        </div>
                        {!batch.isActive && <Badge variant="secondary" className="text-xs">معطلة</Badge>}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Detail (Right content) */}
          <div className="lg:col-span-2">
            {!selectedBatchId ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                  <Tag className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">اختر دفعة لعرض تفاصيلها</p>
                  <p className="text-sm">أو أنشئ دفعة جديدة للبدء</p>
                </div>
              </Card>
            ) : batchDetailQuery.isLoading ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </Card>
            ) : batchDetail ? (
              <div className="space-y-4">
                {/* Batch Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: batchDetail.color || "#3B82F6" }} />
                        <div>
                          <h2 className="text-xl font-bold">{batchDetail.name}</h2>
                          {batchDetail.description && <p className="text-gray-500 text-sm mt-1">{batchDetail.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => { if (!inviteLinkQuery.data?.inviteCode) { generateInviteLink.mutate({ batchId: selectedBatchId! }); } setShowInviteLinkDialog(true); }}>
                          <Link2 className="h-4 w-4 ml-1" />
                          رابط الدعوة
                        </Button>
                        <Button variant="outline" size="sm" className="text-purple-600 hover:bg-purple-50" onClick={handleExportCSV}>
                          <Download className="h-4 w-4 ml-1" />
                          تصدير CSV
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => { if (confirm("هل أنت متأكد من حذف هذه الدفعة؟")) deleteBatch.mutate({ id: selectedBatchId! }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-5">
                    <TabsTrigger value="members" className="flex items-center gap-1"><Users className="h-4 w-4" />الأعضاء ({batchDetail.members.length})</TabsTrigger>
                    <TabsTrigger value="features" className="flex items-center gap-1"><Settings className="h-4 w-4" />الصلاحيات</TabsTrigger>
                    <TabsTrigger value="assignments" className="flex items-center gap-1"><BookOpen className="h-4 w-4" />الواجبات</TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-1"><BarChart3 className="h-4 w-4" />التقدم</TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center gap-1"><PieChart className="h-4 w-4" />الإحصائيات</TabsTrigger>
                  </TabsList>

                  {/* Members Tab */}
                  <TabsContent value="members">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">أعضاء الدفعة</CardTitle>
                          <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm"><UserPlus className="h-4 w-4 ml-1" />إضافة أعضاء</Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                              <DialogHeader><DialogTitle>إضافة أعضاء للدفعة</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input placeholder="ابحث بالاسم أو البريد الإلكتروني..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                  {searchUsersQuery.data?.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-2 rounded border hover:bg-gray-50">
                                      <div>
                                        <div className="font-medium text-sm">{u.arabicName || u.name || "بدون اسم"}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                      </div>
                                      <Button size="sm" variant="outline" onClick={() => addMembers.mutate({ batchId: selectedBatchId!, userIds: [u.id] })}>
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  {searchQuery.length >= 2 && searchUsersQuery.data?.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm py-4">لا توجد نتائج</p>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {batchDetail.members.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>لا يوجد أعضاء بعد</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {batchDetail.members.map((m: any) => (
                              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {(m.arabicName || m.userName || "?").charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{m.arabicName || m.userName || "بدون اسم"}</div>
                                    <div className="text-xs text-gray-500">{m.userEmail}</div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeMember.mutate({ batchId: selectedBatchId!, userId: m.userId })}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">صلاحيات الوصول للميزات</CardTitle>
                            <CardDescription>حدد الميزات المتاحة لأعضاء هذه الدفعة</CardDescription>
                          </div>
                          <Dialog open={showFeatureDialog} onOpenChange={(open) => {
                            setShowFeatureDialog(open);
                            if (open && batchDetail) {
                              const featureMap: Record<string, boolean> = {};
                              batchDetail.features.forEach((f: any) => { featureMap[f.key] = f.enabled; });
                              setSelectedFeatures(featureMap);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm"><Settings className="h-4 w-4 ml-1" />تعديل</Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                              <DialogHeader><DialogTitle>تعديل صلاحيات الدفعة</DialogTitle></DialogHeader>
                              <div className="space-y-3 py-4">
                                {FEATURE_OPTIONS.map(f => (
                                  <label key={f.key} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 rounded" checked={!!selectedFeatures[f.key]} onChange={e => setSelectedFeatures(p => ({ ...p, [f.key]: e.target.checked }))} />
                                    <span className="text-lg">{f.icon}</span>
                                    <span className="font-medium text-sm">{f.label}</span>
                                  </label>
                                ))}
                              </div>
                              <DialogFooter>
                                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                                <Button onClick={() => {
                                  const features = Object.entries(selectedFeatures).filter(([_, v]) => v).map(([k]) => ({ featureKey: k, isEnabled: true }));
                                  setFeatureAccess.mutate({ batchId: selectedBatchId!, features });
                                }} disabled={setFeatureAccess.isPending}>
                                  {setFeatureAccess.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}حفظ
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {batchDetail.features.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Settings className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>لم يتم تحديد صلاحيات بعد</p>
                            <p className="text-sm">اضغط على "تعديل" لتحديد الميزات المتاحة</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {batchDetail.features.map((f: any) => {
                              const opt = FEATURE_OPTIONS.find(o => o.key === f.key);
                              return (
                                <div key={f.key} className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{opt?.icon} {opt?.label || f.key}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Assignments Tab */}
                  <TabsContent value="assignments">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">الواجبات</CardTitle>
                          <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm"><Plus className="h-4 w-4 ml-1" />واجب جديد</Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl" className="max-w-lg">
                              <DialogHeader><DialogTitle>إنشاء واجب جديد</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">عنوان الواجب</label>
                                  <Input placeholder="مثال: إعداد جذاذة درس الكسور" value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">الوصف</label>
                                  <Textarea placeholder="تعليمات الواجب..." value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">النوع</label>
                                    <Select value={newAssignment.type} onValueChange={(v: any) => setNewAssignment(p => ({ ...p, type: v }))}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="lesson_plan">جذاذة درس</SelectItem>
                                        <SelectItem value="exam">اختبار</SelectItem>
                                        <SelectItem value="evaluation">تقييم</SelectItem>
                                        <SelectItem value="free_form">حر</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">العلامة القصوى</label>
                                    <Input type="number" value={newAssignment.maxScore} onChange={e => setNewAssignment(p => ({ ...p, maxScore: parseInt(e.target.value) || 100 }))} />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">تاريخ التسليم</label>
                                  <Input type="datetime-local" value={newAssignment.dueDate} onChange={e => setNewAssignment(p => ({ ...p, dueDate: e.target.value }))} />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                                <Button onClick={() => createAssignment.mutate({ batchId: selectedBatchId!, ...newAssignment, isPublished: true })} disabled={!newAssignment.title || createAssignment.isPending}>
                                  {createAssignment.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}إنشاء ونشر
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {batchDetail.assignments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>لا توجد واجبات بعد</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {batchDetail.assignments.map((a: any) => (
                              <div key={a.id} className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{a.title}</h4>
                                    {a.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                      <Badge variant="outline" className="text-xs">
                                        {a.type === "lesson_plan" ? "جذاذة" : a.type === "exam" ? "اختبار" : a.type === "evaluation" ? "تقييم" : "حر"}
                                      </Badge>
                                      <span>العلامة: {a.maxScore}</span>
                                      {a.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(a.dueDate).toLocaleDateString("ar-TN")}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowSubmissionDetail(a.id)}>
                                      <Eye className="h-4 w-4 ml-1" />عرض التسليمات
                                    </Button>
                                    <Badge variant={a.isPublished ? "default" : "secondary"}>{a.isPublished ? "منشور" : "مسودة"}</Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Progress Tab */}
                  <TabsContent value="progress">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5" />ملخص تقدم الدفعة</CardTitle>
                        <CardDescription>{progressData?.batch?.name} - {progressData?.memberCount || 0} عضو</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {batchProgressQuery.isLoading ? (
                          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                        ) : !progressData?.assignments?.length ? (
                          <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>لا توجد بيانات تقدم بعد</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {progressData.assignments.map((a: any) => (
                              <div key={a.assignmentId} className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">{a.assignmentTitle}</h4>
                                  <Badge variant={a.completionRate >= 80 ? "default" : a.completionRate >= 50 ? "secondary" : "outline"} className={a.completionRate >= 80 ? "bg-green-600" : ""}>
                                    {a.completionRate}% إنجاز
                                  </Badge>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                  <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${a.completionRate}%`, backgroundColor: a.completionRate >= 80 ? "#16a34a" : a.completionRate >= 50 ? "#f59e0b" : "#ef4444" }} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div className="bg-blue-50 rounded p-2 text-center">
                                    <div className="font-bold text-blue-700">{a.totalMembers}</div>
                                    <div className="text-xs text-blue-600">إجمالي الأعضاء</div>
                                  </div>
                                  <div className="bg-amber-50 rounded p-2 text-center">
                                    <div className="font-bold text-amber-700">{a.totalSubmissions}</div>
                                    <div className="text-xs text-amber-600">تسليمات</div>
                                  </div>
                                  <div className="bg-green-50 rounded p-2 text-center">
                                    <div className="font-bold text-green-700">{a.gradedSubmissions}</div>
                                    <div className="text-xs text-green-600">مقيّمة</div>
                                  </div>
                                  <div className="bg-purple-50 rounded p-2 text-center">
                                    <div className="font-bold text-purple-700">{a.averageScore || "—"}</div>
                                    <div className="text-xs text-purple-600">معدل العلامة</div>
                                  </div>
                                </div>
                                {a.dueDate && (
                                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />آخر أجل: {new Date(a.dueDate).toLocaleDateString("ar-TN")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Statistics Tab */}
                  <TabsContent value="statistics">
                    {selectedBatchId && (
                      <BatchStatsDashboard
                        batchId={selectedBatchId}
                        onGenerateReport={(userId) => {
                          setReportUserId(userId);
                          setShowReportDialog(true);
                        }}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Submission Detail Dialog */}
      <Dialog open={!!showSubmissionDetail} onOpenChange={(open) => { if (!open) setShowSubmissionDetail(null); }}>
        <DialogContent dir="rtl" className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />تسليمات الواجب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {submissionsQuery.isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !submissionsQuery.data?.submissions?.length ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>لا توجد تسليمات بعد</p>
              </div>
            ) : (
              submissionsQuery.data.submissions.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{sub.userName}</h4>
                      <p className="text-xs text-gray-500">{sub.userEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sub.status === 'graded' ? 'default' : sub.status === 'submitted' ? 'secondary' : 'outline'}
                        className={sub.status === 'graded' ? 'bg-green-600' : sub.status === 'returned' ? 'bg-amber-500 text-white' : ''}>
                        {sub.status === 'graded' ? 'مُقيّم' : sub.status === 'submitted' ? 'مُسلّم' : sub.status === 'returned' ? 'مُعاد' : sub.status}
                      </Badge>
                      {sub.aiScore !== null && sub.aiScore !== undefined && (
                        <span className="text-sm font-bold text-green-700">{sub.aiScore}/{submissionsQuery.data?.assignment?.maxScore || 100}</span>
                      )}
                    </div>
                  </div>

                  {/* Rich Text Content */}
                  {sub.content && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">الإجابة النصية:</p>
                      <div className="p-3 bg-gray-50 rounded-lg border text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sub.content }} />
                    </div>
                  )}

                  {/* Attachments */}
                  {(() => {
                    if (!sub.attachments) return null;
                    const atts: any[] = typeof sub.attachments === 'string' ? JSON.parse(sub.attachments) : (Array.isArray(sub.attachments) ? sub.attachments : []);
                    if (atts.length === 0) return null;
                    return (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><Paperclip className="h-3 w-3" />المرفقات ({atts.length}):</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {atts.map((file: any, idx: number) => {
                            const isImage = file.type?.startsWith('image/');
                            return (
                              <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                                {isImage ? (
                                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate group-hover:text-blue-700">{file.name}</p>
                                  <p className="text-xs text-gray-500">{file.type} • {(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* AI Feedback */}
                  {sub.aiFeedback && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">تقييم الذكاء الاصطناعي:</p>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm">{sub.aiFeedback}</div>
                    </div>
                  )}

                  {/* Grading actions */}
                  {sub.status === 'submitted' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" onClick={() => aiGrade.mutate({ submissionId: sub.id })} disabled={aiGrade.isPending}>
                        {aiGrade.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <CheckCircle2 className="h-4 w-4 ml-1" />}
                        تقييم بالذكاء الاصطناعي
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    تاريخ التسليم: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('ar-TN') : '—'}
                    {sub.gradedAt && <span className="mr-3">تاريخ التقييم: {new Date(sub.gradedAt).toLocaleString('ar-TN')}</span>}
                  </div>

                  {/* Submission Comments */}
                  <div className="mt-3 pt-3 border-t">
                    <SubmissionComments submissionId={sub.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Report Dialog */}
      {selectedBatchId && reportUserId && (
        <ParticipantPDFReport
          batchId={selectedBatchId}
          userId={reportUserId}
          open={showReportDialog}
          onOpenChange={(open) => {
            setShowReportDialog(open);
            if (!open) setReportUserId(null);
          }}
        />
      )}
    </div>
  );
}
