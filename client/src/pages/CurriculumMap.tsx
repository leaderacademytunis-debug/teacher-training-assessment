import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";

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
  loaderMessagesFr: [
    "Analyse du plan annuel...",
    "Extraction des thèmes et unités...",
    "Liaison des compétences aux objectifs...",
    "Préparation de la carte du curriculum...",
  ],
  loaderMessagesEn: [
    "Analyzing annual plan...",
    "Extracting topics and units...",
    "Linking competencies to objectives...",
    "Preparing curriculum map...",
  ],
};

// ===== CONSTANTS =====
const SUBJECTS_DATA = [
  { ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" },
  { ar: "الإيقاظ العلمي", fr: "Éveil scientifique", en: "Science" },
  { ar: "اللغة العربية", fr: "Langue arabe", en: "Arabic Language" },
  { ar: "التربية الإسلامية", fr: "Éducation islamique", en: "Islamic Education" },
  { ar: "التربية المدنية", fr: "Éducation civique", en: "Civic Education" },
  { ar: "التاريخ", fr: "Histoire", en: "History" },
  { ar: "الجغرافيا", fr: "Géographie", en: "Geography" },
  { ar: "اللغة الفرنسية", fr: "Langue française", en: "French Language" },
  { ar: "اللغة الإنجليزية", fr: "Langue anglaise", en: "English Language" },
  { ar: "التربية التكنولوجية", fr: "Éducation technologique", en: "Technology Education" },
  { ar: "التربية الفنية", fr: "Arts plastiques", en: "Art Education" },
  { ar: "التربية البدنية", fr: "Éducation physique", en: "Physical Education" },
  { ar: "التربية الموسيقية", fr: "Éducation musicale", en: "Music Education" },
];

const GRADES_DATA = [
  { ar: "السنة الأولى ابتدائي", fr: "1ère année primaire", en: "1st Year Primary" },
  { ar: "السنة الثانية ابتدائي", fr: "2ème année primaire", en: "2nd Year Primary" },
  { ar: "السنة الثالثة ابتدائي", fr: "3ème année primaire", en: "3rd Year Primary" },
  { ar: "السنة الرابعة ابتدائي", fr: "4ème année primaire", en: "4th Year Primary" },
  { ar: "السنة الخامسة ابتدائي", fr: "5ème année primaire", en: "5th Year Primary" },
  { ar: "السنة السادسة ابتدائي", fr: "6ème année primaire", en: "6th Year Primary" },
  { ar: "السنة السابعة أساسي", fr: "7ème année de base", en: "7th Year Basic" },
  { ar: "السنة الثامنة أساسي", fr: "8ème année de base", en: "8th Year Basic" },
  { ar: "السنة التاسعة أساسي", fr: "9ème année de base", en: "9th Year Basic" },
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-200 text-gray-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  skipped: "bg-red-100 text-red-700",
};

export default function CurriculumMap() {
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  const STATUS_LABELS: Record<string, string> = {
    not_started: t("لم يبدأ", "Pas commencé", "Not Started"),
    in_progress: t("قيد الإنجاز", "En cours", "In Progress"),
    completed: t("مكتمل", "Terminé", "Completed"),
    skipped: t("تم تخطيه", "Sauté", "Skipped"),
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Compass className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t("خريطة المنهج الذكية", "Curriculum GPS", "Curriculum GPS")}</h2>
            <p className="text-muted-foreground mb-6">{t("سجّل دخولك للوصول إلى نظام تتبع المنهج", "Connectez-vous pour accéder au suivi du curriculum", "Log in to access the curriculum tracking system")}</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">{t("تسجيل الدخول", "Se connecter", "Log In")}</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreatePlan = async () => {
    if (!newPlan.planTitle || !newPlan.grade || !newPlan.subject) {
      toast.error(t("يرجى ملء جميع الحقول المطلوبة", "Veuillez remplir tous les champs requis", "Please fill in all required fields"));
      return;
    }
    try {
      const plan = await createPlanMutation.mutateAsync(newPlan);
      toast.success(t("تم إنشاء المخطط بنجاح", "Plan créé avec succès", "Plan created successfully"));
      setShowCreateDialog(false);
      utils.curriculum.getMyPlans.invalidate();
      if (plan) setSelectedPlanId(plan.id);
      setNewPlan({ planTitle: "", schoolYear: "2025-2026", educationLevel: "primary", grade: "", subject: "", totalPeriods: 6 });
    } catch {
      toast.error(t("فشل في إنشاء المخطط", "Échec de la création du plan", "Failed to create plan"));
    }
  };

  const handleImportPlan = async () => {
    if (!importText || !importGrade || !importSubject) {
      toast.error(t("يرجى ملء جميع الحقول", "Veuillez remplir tous les champs", "Please fill in all fields"));
      return;
    }
    try {
      toast.info(t("جاري تحليل المخطط بالذكاء الاصطناعي...", "Analyse du plan par IA en cours...", "Analyzing plan with AI..."));
      const topics = await parseAnnualPlanMutation.mutateAsync({
        documentContent: importText,
        grade: importGrade,
        subject: importSubject,
        schoolYear: "2025-2026",
      });

      if (!topics || topics.length === 0) {
        toast.error(t("لم يتم العثور على مواضيع في المحتوى", "Aucun sujet trouvé dans le contenu", "No topics found in the content"));
        return;
      }

      const plan = await createPlanMutation.mutateAsync({
        planTitle: `${t("التوزيع السنوي", "Plan Annuel", "Annual Plan")} - ${importSubject} ${importGrade}`,
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
        toast.success(t(`تم استيراد ${topics.length} موضوع بنجاح`, `Importation réussie de ${topics.length} sujets`, `Successfully imported ${topics.length} topics`));
      }

      setShowImportDialog(false);
      setImportText("");
      utils.curriculum.getMyPlans.invalidate();
      utils.curriculum.getPlanDetails.invalidate();
    } catch {
      toast.error(t("فشل في تحليل المخطط", "Échec de l'analyse du plan", "Failed to analyze plan"));
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
      toast.success(t("تم تحديث الحالة", "Statut mis à jour", "Status updated"));
    } catch {
      toast.error(t("فشل في تحديث الحالة", "Échec de la mise à jour du statut", "Failed to update status"));
    }
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await deletePlanMutation.mutateAsync({ planId });
      toast.success(t("تم حذف المخطط", "Plan supprimé", "Plan deleted"));
      if (selectedPlanId === planId) setSelectedPlanId(null);
      utils.curriculum.getMyPlans.invalidate();
    } catch {
      toast.error(t("فشل في حذف المخطط", "Échec de la suppression du plan", "Failed to delete plan"));
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
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: isRTL ? "'Almarai', sans-serif" : undefined }}>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {t("استيراد مخطط", "Importer Plan", "Import Plan")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-end" : "text-start"}>{t("استيراد مخطط سنوي بالذكاء الاصطناعي", "Importer un Plan Annuel par IA", "Import Annual Plan with AI")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className={`text-sm text-muted-foreground ${isRTL ? "text-end" : "text-start"}`}>
                {t("الصق محتوى المخطط السنوي (من ملف PDF أو Word) وسيقوم الذكاء الاصطناعي بتحليله واستخراج المواضيع تلقائيًا.", "Collez le contenu du plan annuel (depuis un PDF ou Word) et l'IA l'analysera et extraira les sujets automatiquement.", "Paste the content of the annual plan (from a PDF or Word file) and the AI will analyze it and extract the topics automatically.")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={importSubject} onValueChange={setImportSubject}>
                  <SelectTrigger><SelectValue placeholder={tt.subject} /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS_DATA.map(s => <SelectItem key={s.ar} value={s.ar}>{t(s.ar, s.fr, s.en)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={importGrade} onValueChange={setImportGrade}>
                  <SelectTrigger><SelectValue placeholder={tt.level} /></SelectTrigger>
                  <SelectContent>
                    {GRADES_DATA.map(g => <SelectItem key={g.ar} value={g.ar}>{t(g.ar, g.fr, g.en)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t("مثال: الفترة 1: الأعداد من 0 إلى 9 (10 ساعات)...", "Ex: Période 1: Les nombres de 0 à 9 (10 heures)...", "Ex: Period 1: Numbers from 0 to 9 (10 hours)...")}
                className="h-48 resize-none"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button onClick={handleImportPlan} disabled={parseAnnualPlanMutation.isLoading || createPlanMutation.isLoading} className="w-full">
                {parseAnnualPlanMutation.isLoading ? tt.generating : t("استيراد وتحليل", "Importer & Analyser", "Import & Analyze")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t("إنشاء مخطط جديد", "Nouveau Plan", "New Plan")}
            </Button>
          </DialogTrigger>
          <DialogContent dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={isRTL ? "text-end" : "text-start"}>{t("إنشاء مخطط تدرج سنوي جديد", "Créer un nouveau plan annuel", "Create a New Annual Plan")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="plan-title" className={`mb-1.5 block ${isRTL ? "text-end" : "text-start"}`}>{t("عنوان المخطط", "Titre du Plan", "Plan Title")}</Label>
                <Input id="plan-title" value={newPlan.planTitle} onChange={e => setNewPlan(p => ({ ...p, planTitle: e.target.value }))} placeholder={t("مثال: مخطط الرياضيات للسنة الثالثة", "Ex: Plan de maths 3ème année", "Ex: 3rd Grade Math Plan")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={newPlan.subject} onValueChange={val => setNewPlan(p => ({ ...p, subject: val }))}>
                  <SelectTrigger><SelectValue placeholder={tt.subject} /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS_DATA.map(s => <SelectItem key={s.ar} value={s.ar}>{t(s.ar, s.fr, s.en)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={newPlan.grade} onValueChange={val => setNewPlan(p => ({ ...p, grade: val }))}>
                  <SelectTrigger><SelectValue placeholder={tt.level} /></SelectTrigger>
                  <SelectContent>
                    {GRADES_DATA.map(g => <SelectItem key={g.ar} value={g.ar}>{t(g.ar, g.fr, g.en)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="total-periods" className={`mb-1.5 block ${isRTL ? "text-end" : "text-start"}`}>{t("عدد الفترات", "Nombre de Périodes", "Number of Periods")}</Label>
                <Input id="total-periods" type="number" value={newPlan.totalPeriods} onChange={e => setNewPlan(p => ({ ...p, totalPeriods: +e.target.value }))} />
              </div>
              <Button onClick={handleCreatePlan} disabled={createPlanMutation.isLoading} className="w-full">
                {createPlanMutation.isLoading ? tt.generating : t("إنشاء المخطط", "Créer le Plan", "Create Plan")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      <Card>
        <CardHeader className="p-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            {t("مخططاتي", "Mes Plans", "My Plans")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {plansQuery.isLoading && <div className="p-4 text-center text-sm text-muted-foreground">{tt.loading}</div>}
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full flex items-center justify-between text-sm p-2 rounded-md transition-colors cursor-pointer ${selectedPlanId === plan.id ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}>
                  <div className={isRTL ? "text-end" : "text-start"}>
                    <p className="font-medium">{plan.planTitle}</p>
                    <p className={`text-xs ${selectedPlanId === plan.id ? "text-blue-600" : "text-muted-foreground"}`}>
                      {plan.subject} - {plan.grade}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPlanId === plan.id && (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {plans.length === 0 && !plansQuery.isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">{t("لا توجد مخططات. قم بإنشاء واحد.", "Aucun plan. Créez-en un.", "No plans. Create one.")}</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Result Panel: Coverage, Periods, Suggestions ────────────────────────

  const resultPanel = (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {selectedPlan ? (
        <>
          {/* Header */}
          <div className={`p-4 rounded-lg bg-white border border-gray-200 ${isRTL ? "text-end" : "text-start"}`}>
            <h2 className="text-lg font-bold text-gray-800">{selectedPlan.planTitle}</h2>
            <p className="text-sm text-muted-foreground">{selectedPlan.subject} · {selectedPlan.grade} · {selectedPlan.schoolYear}</p>
          </div>

          {/* Coverage */}
          <Card>
            <CardHeader className="p-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t("نسبة التغطية", "Taux de Couverture", "Coverage Rate")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {coverageQuery.isLoading ? <div className="text-center">{tt.loading}</div> : coverage && (
                <>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{t("التقدم الإجمالي", "Progression Globale", "Overall Progress")}</span>
                    <span className="text-blue-600">{Math.round(coverage.overallCoverage * 100)}%</span>
                  </div>
                  <Progress value={coverage.overallCoverage * 100} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2">
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <div className="font-bold">{coverage.completedTopics}</div>
                        <div className="text-muted-foreground">{t("مكتمل", "Terminé", "Completed")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <div>
                        <div className="font-bold">{coverage.inProgressTopics}</div>
                        <div className="text-muted-foreground">{t("قيد الإنجاز", "En cours", "In Progress")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                      <BookOpen className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-bold">{coverage.notStartedTopics}</div>
                        <div className="text-muted-foreground">{t("لم يبدأ", "Pas commencé", "Not Started")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="font-bold">{coverage.skippedTopics}</div>
                        <div className="text-muted-foreground">{t("تم تخطيه", "Sauté", "Skipped")}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Periods */}
          <Card>
            <CardHeader className="p-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Map className="h-4 w-4" />
                {t("خريطة المنهج حسب الفترات", "Carte par Périodes", "Map by Periods")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {coverageByPeriodQuery.isLoading ? <div className="p-4 text-center">{tt.loading}</div> : periods.map(period => (
                <div key={period.periodNumber} className="border border-gray-200 rounded-md">
                  <button onClick={() => togglePeriod(period.periodNumber)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      {expandedPeriods[period.periodNumber] ? <ChevronDown className="h-5 w-5" /> : (isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />)}
                      <div className={isRTL ? "text-end" : "text-start"}>
                        <p className="font-semibold">{t("الفترة", "Période", "Period")} {period.periodNumber}</p>
                        <p className="text-xs text-muted-foreground">{t(`${period.completedTopics} من ${period.totalTopics} مواضيع مكتملة`, `${period.completedTopics} / ${period.totalTopics} sujets terminés`, `${period.completedTopics} of ${period.totalTopics} topics completed`)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(period.completedTopics / period.totalTopics) * 100} className="w-24 h-2" />
                      <span className="text-xs font-mono w-10 text-end">{Math.round((period.completedTopics / period.totalTopics) * 100)}%</span>
                    </div>
                  </button>
                  {expandedPeriods[period.periodNumber] && (
                    <div className="p-3 space-y-2">
                      {period.topics.map(topic => (
                        <div key={topic.id} className={`flex items-center justify-between p-2 rounded-md ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{topic.topicTitle}</span>
                          </div>
                          <Select value={topic.status} onValueChange={(status) => handleUpdateStatus(topic.id, status)}>
                            <SelectTrigger className={`w-36 h-8 text-xs ${STATUS_COLORS[topic.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value} className={`text-xs ${STATUS_COLORS[value]}`}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          <Card>
            <CardHeader className="p-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {t("اقتراحات ذكية", "Suggestions Intelligentes", "Smart Suggestions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {suggestionsQuery.isLoading ? <div className="text-center">{tt.loading}</div> : suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-purple-900">{suggestion}</p>
                </div>
              ))}
              {suggestions.length === 0 && !suggestionsQuery.isLoading && (
                <div className="text-center text-sm text-muted-foreground">{t("لا توجد اقتراحات حاليًا.", "Aucune suggestion pour le moment.", "No suggestions at this time.")}</div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" dir={isRTL ? "rtl" : "ltr"}>
          <GraduationCap className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">{t("اختر مخططًا أو أنشئ واحدًا جديدًا", "Sélectionnez ou créez un plan", "Select or Create a Plan")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("ابدأ بتتبع تقدمك في المنهج الدراسي", "Commencez à suivre votre progression", "Start tracking your curriculum progress")}</p>
        </div>
      )}
    </div>
  );

  return (
    <UnifiedToolLayout
      config={CURRICULUM_CONFIG}
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      isLoading={plansQuery.isLoading}
    />
  );
}
