import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight, BookOpen, ChevronDown, ChevronRight, ChevronLeft,
  FileText, Lightbulb, Map, Plus, Target, Trash2, Upload,
  CheckCircle2, Clock, AlertCircle, Loader2, Sparkles, BookMarked,
  BarChart3, GraduationCap, Compass, ArrowLeft
} from "lucide-react";
import UnifiedToolLayout, { type ToolConfig } from "@/components/UnifiedToolLayout";

// ─── Tool Config ─────────────────────────────────────────────────────────────

const CURRICULUM_CONFIG: ToolConfig = {
  id: "curriculum-map",
  icon: Compass,
  nameAr: "خريطة المنهج الذكية",
  nameFr: "Curriculum GPS",
  nameEn: "Curriculum GPS",
  descAr: "تتبع تقدمك في المنهج الدراسي وفق البرنامج الرسمي التونسي",
  descFr: "Suivez votre progression dans le programme scolaire",
  descEn: "Track your curriculum progress",
  accentColor: "#1565C0",
  gradient: "linear-gradient(135deg, #1565C0, #1A237E)",
  loaderMessages: [
    "جارٍ تحليل المخطط السنوي...",
    "استخراج المواضيع والوحدات...",
    "ربط الكفايات بالأهداف...",
    "إعداد خريطة المنهج...",
  ],
};

// ===== CONSTANTS =====
const SUBJECTS = [
  "الرياضيات", "الإيقاظ العلمي", "اللغة العربية", "التربية الإسلامية",
  "التربية المدنية", "التاريخ", "الجغرافيا", "اللغة الفرنسية",
  "اللغة الإنجليزية", "التربية التكنولوجية", "التربية الفنية",
  "التربية البدنية", "التربية الموسيقية",
];

const GRADES = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
  "السنة السابعة أساسي", "السنة الثامنة أساسي", "السنة التاسعة أساسي",
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-200 text-gray-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  skipped: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "لم يبدأ",
  in_progress: "قيد الإنجاز",
  completed: "مكتمل",
  skipped: "تم تخطيه",
};

export default function CurriculumMap() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState<Record<number, boolean>>({});

  // Create plan form
  const [newPlan, setNewPlan] = useState({
    planTitle: "",
    schoolYear: "2025-2026",
    educationLevel: "primary" as "primary" | "middle" | "secondary",
    grade: "",
    subject: "",
    totalPeriods: 6,
  });

  // Import form
  const [importText, setImportText] = useState("");
  const [importGrade, setImportGrade] = useState("");
  const [importSubject, setImportSubject] = useState("");

  // Queries
  const plansQuery = trpc.curriculum.getMyPlans.useQuery(undefined, { enabled: !!user });
  const planDetailsQuery = trpc.curriculum.getPlanDetails.useQuery(
    { planId: selectedPlanId! },
    { enabled: !!selectedPlanId }
  );
  const coverageQuery = trpc.curriculum.getCoverage.useQuery(
    { planId: selectedPlanId! },
    { enabled: !!selectedPlanId }
  );
  const coverageByPeriodQuery = trpc.curriculum.getCoverageByPeriod.useQuery(
    { planId: selectedPlanId! },
    { enabled: !!selectedPlanId }
  );
  const suggestionsQuery = trpc.curriculum.getSmartSuggestions.useQuery(
    { planId: selectedPlanId!, limit: 3 },
    { enabled: !!selectedPlanId }
  );

  // Mutations
  const createPlanMutation = trpc.curriculum.createPlan.useMutation();
  const addTopicsMutation = trpc.curriculum.addTopics.useMutation();
  const parseAnnualPlanMutation = trpc.curriculum.parseAnnualPlan.useMutation();
  const updateProgressMutation = trpc.curriculum.updateProgress.useMutation();
  const deletePlanMutation = trpc.curriculum.deletePlan.useMutation();

  const utils = trpc.useUtils();

  // Auto-select first plan
  useEffect(() => {
    if (plansQuery.data && plansQuery.data.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plansQuery.data[0].id);
    }
  }, [plansQuery.data, selectedPlanId]);

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Compass className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">خريطة المنهج الذكية</h2>
            <p className="text-muted-foreground mb-6">سجّل دخولك للوصول إلى نظام تتبع المنهج</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">تسجيل الدخول</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreatePlan = async () => {
    if (!newPlan.planTitle || !newPlan.grade || !newPlan.subject) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    try {
      const plan = await createPlanMutation.mutateAsync(newPlan);
      toast.success("تم إنشاء المخطط بنجاح");
      setShowCreateDialog(false);
      utils.curriculum.getMyPlans.invalidate();
      if (plan) setSelectedPlanId(plan.id);
      setNewPlan({ planTitle: "", schoolYear: "2025-2026", educationLevel: "primary", grade: "", subject: "", totalPeriods: 6 });
    } catch {
      toast.error("فشل في إنشاء المخطط");
    }
  };

  const handleImportPlan = async () => {
    if (!importText || !importGrade || !importSubject) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    try {
      toast.info("جاري تحليل المخطط بالذكاء الاصطناعي...");
      const topics = await parseAnnualPlanMutation.mutateAsync({
        documentContent: importText,
        grade: importGrade,
        subject: importSubject,
        schoolYear: "2025-2026",
      });

      if (!topics || topics.length === 0) {
        toast.error("لم يتم العثور على مواضيع في المحتوى");
        return;
      }

      const plan = await createPlanMutation.mutateAsync({
        planTitle: `التوزيع السنوي - ${importSubject} ${importGrade}`,
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: importGrade,
        subject: importSubject,
        totalPeriods: Math.max(...topics.map((t: any) => t.periodNumber || 1)),
      });

      if (plan) {
        await addTopicsMutation.mutateAsync({
          planId: plan.id,
          topics: topics.map((t: any, i: number) => ({
            ...t,
            orderIndex: i + 1,
            sessionCount: t.sessionCount || 1,
            sessionDuration: t.sessionDuration || 45,
          })),
        });
        setSelectedPlanId(plan.id);
        toast.success(`تم استيراد ${topics.length} موضوع بنجاح`);
      }

      setShowImportDialog(false);
      setImportText("");
      utils.curriculum.getMyPlans.invalidate();
      utils.curriculum.getPlanDetails.invalidate();
    } catch {
      toast.error("فشل في تحليل المخطط");
    }
  };

  const handleUpdateStatus = async (topicId: number, status: string) => {
    if (!selectedPlanId) return;
    try {
      await updateProgressMutation.mutateAsync({
        planId: selectedPlanId,
        topicId,
        status: status as any,
      });
      utils.curriculum.getCoverage.invalidate();
      utils.curriculum.getCoverageByPeriod.invalidate();
      utils.curriculum.getSmartSuggestions.invalidate();
      toast.success("تم تحديث الحالة");
    } catch {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await deletePlanMutation.mutateAsync({ planId });
      toast.success("تم حذف المخطط");
      if (selectedPlanId === planId) setSelectedPlanId(null);
      utils.curriculum.getMyPlans.invalidate();
    } catch {
      toast.error("فشل في حذف المخطط");
    }
  };

  const togglePeriod = (periodNum: number) => {
    setExpandedPeriods(prev => ({ ...prev, [periodNum]: !prev[periodNum] }));
  };

  const coverage = coverageQuery.data;
  const periods = coverageByPeriodQuery.data || [];
  const suggestions = suggestionsQuery.data || [];
  const plans = plansQuery.data || [];
  const selectedPlan = planDetailsQuery.data;

  // ─── Input Panel: Plans sidebar + action buttons ─────────────────────────

  const inputPanel = (
    <div className="space-y-4" dir="rtl" style={{ fontFamily: "'Almarai', sans-serif" }}>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              استيراد مخطط
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">استيراد مخطط سنوي بالذكاء الاصطناعي</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                الصق محتوى المخطط السنوي (من ملف PDF أو Word) وسيقوم الذكاء الاصطناعي بتحليله واستخراج المواضيع تلقائياً.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Select value={importGrade} onValueChange={setImportGrade}>
                  <SelectTrigger><SelectValue placeholder="المستوى الدراسي" /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={importSubject} onValueChange={setImportSubject}>
                  <SelectTrigger><SelectValue placeholder="المادة" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="الصق محتوى المخطط السنوي هنا..."
                className="min-h-[200px] text-right"
                dir="rtl"
              />
              <Button
                onClick={handleImportPlan}
                disabled={parseAnnualPlanMutation.isPending || createPlanMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {parseAnnualPlanMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري التحليل بالذكاء الاصطناعي...</>
                ) : (
                  <><Sparkles className="h-4 w-4 ml-2" />تحليل واستيراد</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex-1 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              مخطط جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إنشاء مخطط سنوي جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newPlan.planTitle}
                onChange={e => setNewPlan(p => ({ ...p, planTitle: e.target.value }))}
                placeholder="عنوان المخطط"
                dir="rtl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newPlan.grade} onValueChange={v => setNewPlan(p => ({ ...p, grade: v }))}>
                  <SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={newPlan.subject} onValueChange={v => setNewPlan(p => ({ ...p, subject: v }))}>
                  <SelectTrigger><SelectValue placeholder="المادة" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={newPlan.schoolYear}
                onChange={e => setNewPlan(p => ({ ...p, schoolYear: e.target.value }))}
                placeholder="السنة الدراسية"
                dir="rtl"
              />
              <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {createPlanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء المخطط"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <Map className="w-3.5 h-3.5 text-blue-600" />
          مخططاتي السنوية
        </p>
        <ScrollArea className="max-h-[400px]">
          {plans.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground bg-gray-50 rounded-xl">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">لا توجد مخططات بعد</p>
              <p className="text-xs mt-1">أنشئ مخططاً جديداً أو استورد واحداً</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedPlanId === plan.id
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{plan.planTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{plan.subject}</Badge>
                        <span className="text-xs text-muted-foreground">{plan.grade}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">{plan.totalTopics} موضوع</span>
                        {plan.isOfficial && (
                          <Badge className="text-[10px] bg-green-100 text-green-800 px-1">رسمي</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={e => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl border border-amber-200 bg-amber-50/50">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            اقتراحات ذكية
          </p>
          <p className="text-xs text-amber-700">الدروس التالية في المنهج:</p>
          {suggestions.map((topic: any) => (
            <div key={topic.id} className="p-2 bg-white rounded-lg border border-amber-200">
              <p className="text-sm font-medium">{topic.topicTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">الفترة {topic.periodNumber}</Badge>
                {topic.textbookPages && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <BookMarked className="h-3 w-3" />{topic.textbookPages}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-1 text-xs text-amber-700 hover:bg-amber-100"
                onClick={() => navigate(`/teacher-tools?topic=${encodeURIComponent(topic.topicTitle)}`)}
              >
                <Sparkles className="h-3 w-3 ml-1" />
                إعداد هذا الدرس
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Custom Result: The main curriculum dashboard ────────────────────────

  const customResultRenderer = (
    <div className="space-y-5" dir="rtl" style={{ fontFamily: "'Almarai', sans-serif" }}>
      {!selectedPlanId ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Compass className="h-16 w-16 mx-auto text-blue-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">اختر مخططاً أو أنشئ واحداً جديداً</h3>
          <p className="text-muted-foreground mb-4">
            خريطة المنهج الذكية تساعدك على تتبع تقدمك في تغطية المنهج الدراسي
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />إنشاء مخطط
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 ml-2" />استيراد مخطط
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Coverage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">التقدم الكلي</p>
                    <p className="text-3xl font-bold mt-1">{coverage?.percentage || 0}%</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-200" />
                </div>
                <Progress value={coverage?.percentage || 0} className="mt-3 h-2 bg-blue-400" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">إجمالي المواضيع</p>
                    <p className="text-2xl font-bold mt-1">{coverage?.total || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">مكتمل</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-600">{coverage?.completed || 0}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">قيد الإنجاز</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600">{coverage?.inProgress || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Title */}
          {selectedPlan && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{selectedPlan.plan.planTitle}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge>{selectedPlan.plan.subject}</Badge>
                      <span className="text-sm text-muted-foreground">{selectedPlan.plan.grade}</span>
                      <span className="text-sm text-muted-foreground">{selectedPlan.plan.schoolYear}</span>
                    </div>
                  </div>
                  <GraduationCap className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Periods Accordion */}
          <div className="space-y-3">
            {periods.length === 0 && planDetailsQuery.isLoading && (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="mt-2 text-muted-foreground">جاري تحميل المنهج...</p>
              </Card>
            )}

            {periods.length === 0 && !planDetailsQuery.isLoading && selectedPlan?.topics.length === 0 && (
              <Card className="p-8 text-center">
                <AlertCircle className="h-10 w-10 mx-auto text-amber-400 mb-2" />
                <h3 className="font-bold mb-1">لا توجد مواضيع في هذا المخطط</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  استخدم ميزة الاستيراد الذكي لإضافة المواضيع تلقائياً من مخطط سنوي
                </p>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 ml-2" />استيراد المواضيع
                </Button>
              </Card>
            )}

            {periods.map(period => (
              <Card key={period.periodNumber} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => togglePeriod(period.periodNumber)}
                >
                  <div className="flex items-center gap-3">
                    {expandedPeriods[period.periodNumber] ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-bold">{period.periodName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {period.completed}/{period.total} موضوع مكتمل
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={period.percentage} className="h-2" />
                    </div>
                    <Badge variant={period.percentage === 100 ? "default" : "outline"} className={period.percentage === 100 ? "bg-emerald-600" : ""}>
                      {period.percentage}%
                    </Badge>
                  </div>
                </div>

                {expandedPeriods[period.periodNumber] && (
                  <div className="border-t">
                    <div className="divide-y">
                      {period.topics.map((topic: any) => {
                        const status = topic.progress?.status || "not_started";
                        return (
                          <div key={topic.id} className="p-3 px-6 flex items-center gap-3 hover:bg-gray-50/50">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{topic.topicTitle}</p>
                                <Badge className={`text-[10px] ${STATUS_COLORS[status]}`}>
                                  {STATUS_LABELS[status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {topic.competency && (
                                  <span className="text-xs text-muted-foreground">
                                    <Target className="h-3 w-3 inline ml-0.5" />{topic.competency}
                                  </span>
                                )}
                                {topic.competencyCode && (
                                  <Badge variant="outline" className="text-[10px]">{topic.competencyCode}</Badge>
                                )}
                                {topic.textbookPages && (
                                  <span className="text-xs text-blue-600 flex items-center gap-0.5">
                                    <BookMarked className="h-3 w-3" />{topic.textbookName}: {topic.textbookPages}
                                  </span>
                                )}
                                {topic.sessionCount && (
                                  <span className="text-xs text-muted-foreground">
                                    {topic.sessionCount} حصة × {topic.sessionDuration} د
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Select
                                value={status}
                                onValueChange={v => handleUpdateStatus(topic.id, v)}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_started">لم يبدأ</SelectItem>
                                  <SelectItem value="in_progress">قيد الإنجاز</SelectItem>
                                  <SelectItem value="completed">مكتمل</SelectItem>
                                  <SelectItem value="skipped">تخطي</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-blue-600"
                                onClick={() => navigate(`/teacher-tools?topic=${encodeURIComponent(topic.topicTitle)}`)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <UnifiedToolLayout
      config={CURRICULUM_CONFIG}
      inputPanel={inputPanel}
      resultContent={selectedPlanId ? "loaded" : null}
      isGenerating={planDetailsQuery.isLoading}
      onRegenerate={() => {
        utils.curriculum.getPlanDetails.invalidate();
        utils.curriculum.getCoverage.invalidate();
        utils.curriculum.getCoverageByPeriod.invalidate();
      }}
      customResultRenderer={customResultRenderer}
      editable={false}
    />
  );
}
