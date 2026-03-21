import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, Upload, FileCheck, Eye, EyeOff, Plus, Trash2,
  CheckCircle2, Clock, AlertCircle, BarChart3, ChevronDown,
  ChevronUp, Sparkles, FileText, Users, Shield, Star,
  TrendingUp, TrendingDown, Loader2, X, Download, PieChart,
  FileDown, Target, Award, Percent, Navigation, MessageCircle, AlertTriangle
} from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BLIND_GRADING_GRADIENT = "linear-gradient(135deg, #4338ca, #7c3aed, #1d4ed8)";

const masteryLevelsData = {
  "+++": { ar: "تملك ممتاز", fr: "Excellente maîtrise", en: "Excellent Mastery" },
  "++": { ar: "تملك جيد", fr: "Bonne maîtrise", en: "Good Mastery" },
  "+": { ar: "تملك مقبول", fr: "Maîtrise acceptable", en: "Acceptable Mastery" },
  "-": { ar: "غير كاف", fr: "Insuffisant", en: "Insufficient" },
  "--": { ar: "غير كاف جدا", fr: "Très insuffisant", en: "Very Insufficient" },
  "---": { ar: "غير متملك", fr: "Non maîtrisé", en: "Not Mastered" },
};

const masteryColors: Record<string, { bg: string; text: string }> = {
    "+++": { bg: "bg-emerald-100", text: "text-emerald-700" },
    "++": { bg: "bg-green-100", text: "text-green-700" },
    "+": { bg: "bg-yellow-100", text: "text-yellow-700" },
    "-": { bg: "bg-orange-100", text: "text-orange-700" },
    "--": { bg: "bg-red-100", text: "text-red-700" },
    "---": { bg: "bg-red-200", text: "text-red-800" },
  };

function getMasteryDisplay(level: string, t: (ar: string, fr: string, en: string) => string) {
  const style = masteryColors[level] || { bg: "bg-gray-100", text: "text-gray-600" };
  const label = masteryLevelsData[level] ? t(masteryLevelsData[level].ar, masteryLevelsData[level].fr, masteryLevelsData[level].en) : level;
  return { ...style, label };
}

export default function BlindGrading() {
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<"sessions" | "session-detail" | "submission-detail" | "statistics">("sessions");
  const [, navigate] = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hideNames, setHideNames] = useState(true);

  // Create session form
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newExamType, setNewExamType] = useState<"formative" | "summative" | "diagnostic">("summative");
  const [fromExamContent, setFromExamContent] = useState("");

  // Handle URL params from Exam Builder
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fromExam") === "true") {
      setNewTitle(params.get("examTitle") || "");
      setNewSubject(params.get("subject") || "");
      setNewGrade(params.get("grade") || "");
      setFromExamContent(params.get("examContent") || "");
      setShowCreateForm(true);
    }
  }, []);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadStudentName, setUploadStudentName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const utils = trpc.useUtils();
  const sessionsQuery = trpc.grading.getSessions.useQuery(undefined, { enabled: !!user });
  const sessionDetailQuery = trpc.grading.getSession.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId && activeView !== "sessions" }
  );
  const submissionDetailQuery = trpc.grading.getSubmission.useQuery(
    { submissionId: selectedSubmissionId! },
    { enabled: !!selectedSubmissionId && activeView === "submission-detail" }
  );

  const createSessionMutation = trpc.grading.createSession.useMutation({
    onSuccess: () => {
      utils.grading.getSessions.invalidate();
      setShowCreateForm(false);
      setNewTitle(""); setNewSubject(""); setNewGrade("");
      setFromExamContent("");
      toast.success(t("تم إنشاء الجلسة بنجاح!", "Session créée avec succès !", "Session created successfully!"));
    },
    onError: () => {
        toast.error(t("فشل إنشاء الجلسة.", "Échec de la création de la session.", "Failed to create session."));
    }
  });

  const deleteSessionMutation = trpc.grading.deleteSession.useMutation({
    onSuccess: () => {
      utils.grading.getSessions.invalidate();
      setActiveView("sessions");
      setSelectedSessionId(null);
      toast.success(t("تم حذف الجلسة بنجاح!", "Session supprimée avec succès !", "Session deleted successfully!"));
    },
    onError: () => {
        toast.error(t("فشل حذف الجلسة.", "Échec de la suppression de la session.", "Failed to delete session."));
    }
  });

  const uploadMutation = trpc.grading.uploadAndOCR.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      setUploadStudentName("");
      setUploading(false);
      toast.success(t("تم رفع الملف ومعالجته بنجاح!", "Fichier téléversé et traité avec succès !", "File uploaded and processed successfully!"));
    },
    onError: () => {
        setUploading(false);
        toast.error(t("فشل رفع الملف.", "Échec du téléversement du fichier.", "File upload failed."));
    }
  });

  const aiGradeMutation = trpc.grading.aiGrade.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      if (selectedSubmissionId) {
        utils.grading.getSubmission.invalidate({ submissionId: selectedSubmissionId });
      }
      toast.success(t("تم التصحيح بالذكاء الاصطناعي بنجاح!", "Correction par IA terminée avec succès !", "AI grading completed successfully!"));
    },
    onError: () => {
        toast.error(t("فشل التصحيح بالذكاء الاصطناعي.", "Échec de la correction par IA.", "AI grading failed."));
    }
  });

  const finalizeSubmissionMutation = trpc.grading.finalizeSubmission.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      if (selectedSubmissionId) {
        utils.grading.getSubmission.invalidate({ submissionId: selectedSubmissionId });
      }
      toast.success(t("تم تثبيت التقييم بنجاح!", "Évaluation finalisée avec succès !", "Submission finalized successfully!"));
    },
    onError: () => {
        toast.error(t("فشل تثبيت التقييم.", "Échec de la finalisation de l\
'''évaluation.", "Failed to finalize submission."));
    }
  });

  const deleteSubmissionMutation = trpc.grading.deleteSubmission.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      setActiveView("session-detail");
      setSelectedSubmissionId(null);
      toast.success(t("تم حذف الورقة بنجاح!", "Copie supprimée avec succès !", "Submission deleted successfully!"));
    },
    onError: () => {
        toast.error(t("فشل حذف الورقة.", "Échec de la suppression de la copie.", "Failed to delete submission."));
    }
  });

  const updateSessionMutation = trpc.grading.updateSession.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      toast.success(t("تم تحديث الجلسة بنجاح!", "Session mise à jour avec succès !", "Session updated successfully!"));
    },
    onError: () => {
        toast.error(t("فشل تحديث الجلسة.", "Échec de la mise à jour de la session.", "Failed to update session."));
    }
  });

  const gpsQuery = trpc.grading.getGPSContext.useQuery(
    { subject: newSubject || undefined, grade: newGrade || undefined },
    { enabled: !!user && showCreateForm && !!newSubject && !!newGrade }
  );

  const statsQuery = trpc.grading.classStatistics.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId && activeView === "statistics" }
  );

  const exportPdfMutation = trpc.grading.exportPDF.useMutation({
    onSuccess: (data) => {
      setExportingPdf(false);
      window.open(data.url, "_blank");
      toast.success(t("تم تصدير التقرير بنجاح!", "Rapport exporté avec succès !", "Report exported successfully!"));
    },
    onError: () => {
        setExportingPdf(false);
        toast.error(t("فشل تصدير التقرير.", "Échec de l'exportation du rapport.", "Failed to export report."));
    }
  });

  const [exportingInspector, setExportingInspector] = useState(false);
  const inspectorReportMutation = trpc.grading.inspectorReport.useMutation({
    onSuccess: (data) => {
      setExportingInspector(false);
      window.open(data.url, "_blank");
      toast.success(t("تم إنشاء تقرير المتفقد بنجاح!", "Rapport d'inspecteur généré avec succès !", "Inspector report generated successfully!"));
    },
    onError: () => {
        setExportingInspector(false);
        toast.error(t("فشل إنشاء تقرير المتفقد.", "Échec de la génération du rapport d'inspecteur.", "Failed to generate inspector report."));
    }
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedSessionId) return;
    setUploading(true);
    toast.info(t("جاري رفع الملفات...", "Téléversement des fichiers...", "Uploading files..."));
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          sessionId: selectedSessionId,
          studentName: uploadStudentName || undefined,
          base64Data: base64,
          mimeType: file.type,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedSessionId, uploadStudentName, uploadMutation, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <Shield className="w-16 h-16 text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">{t("مساعد التصحيح الأعمى", "Assistant de Correction Anonyme", "Blind Grading Assistant")}</h2>
          <p className="text-gray-600">{t("يجب تسجيل الدخول للوصول إلى هذه الأداة", "Vous devez être connecté pour accéder à cet outil", "You must be logged in to access this tool")}</p>
          <a href={getLoginUrl()} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {t("تسجيل الدخول", "Se connecter", "Log In")}
          </a>
        </div>
      </div>
    );
  }

  // ==================== SESSIONS LIST ====================
  if (activeView === "sessions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
        <ToolPageHeader
          icon={FileCheck}
          nameAr="مساعد التصحيح الأعمى"
          nameFr="Assistant de Correction Anonyme"
          nameEn="Blind Grading Assistant"
          descAr="تصحيح ذكي بالذكاء الاصطناعي حسب المعايير التونسية"
          descFr="Correction intelligente par l'IA selon les critères tunisiens"
          descEn="AI-powered grading according to Tunisian criteria"
          gradient={BLIND_GRADING_GRADIENT}
          backTo="/"
        />

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("جلسات التصحيح", "Sessions de correction", "Grading Sessions")}</p>
                <p className="text-2xl font-bold text-gray-800">{sessionsQuery.data?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("مكتملة", "Terminées", "Completed")}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sessionsQuery.data?.filter(s => s.status === "completed").length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("إجمالي التلاميذ", "Total élèves", "Total Students")}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sessionsQuery.data?.reduce((sum, s) => sum + (s._count?.submissions || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Create/List Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t("قائمة الجلسات", "Liste des sessions", "Sessions List")}</h2>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {showCreateForm ? t("إلغاء", "Annuler", "Cancel") : t("جلسة جديدة", "Nouvelle session", "New Session")}
            </Button>
          </div>

          {/* Create Session Form */}
          {showCreateForm && (
            <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8 space-y-6 animate-in fade-in-50 duration-300">
              <h3 className="text-xl font-bold text-gray-800">{t("إنشاء جلسة تصحيح جديدة", "Créer une nouvelle session de correction", "Create a New Grading Session")}</h3>
              
              {fromExamContent && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-sm text-blue-800">{t("تم استيراد بيانات التقييم بنجاح. يمكنك تعديلها أدناه.", "Les données de l'évaluation ont été importées. Vous pouvez les modifier ci-dessous.", "Exam data has been imported. You can modify it below.")}</p>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">{tt.title}</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t("مثال: فرض مراقبة عدد 1", "Ex: Devoir de contrôle N°1", "e.g., Control Test #1")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">{tt.subject}</label>
                  <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder={t("مثال: رياضيات", "Ex: Mathématiques", "e.g., Mathematics")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">{tt.level}</label>
                  <Input value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder={t("مثال: سادسة ابتدائي", "Ex: 6ème année primaire", "e.g., 6th Year Primary")} />
                </div>
              </div>

              {gpsQuery.data?.currentLesson && (
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-700">{t("الدرس الحالي حسب التدرج:", "Leçon actuelle selon la progression :", "Current lesson based on progression:")} <span className="font-semibold text-indigo-600">{gpsQuery.data.currentLesson}</span></p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">{t("نوع التقييم", "Type d'évaluation", "Assessment Type")}</label>
                <Select value={newExamType} onValueChange={(v: any) => setNewExamType(v)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t("اختر نوع التقييم...", "Sélectionnez le type...", "Select type...")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="summative">{t("تقييم جزائي", "Évaluation sommative", "Summative Assessment")}</SelectItem>
                        <SelectItem value="formative">{t("تقييم تكويني", "Évaluation formative", "Formative Assessment")}</SelectItem>
                        <SelectItem value="diagnostic">{t("تقييم تشخيصي", "Évaluation diagnostique", "Diagnostic Assessment")}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>{tt.cancel}</Button>
                <Button onClick={() => createSessionMutation.mutate({ title: newTitle, subject: newSubject, grade: newGrade, examType: newExamType, examContent: fromExamContent || undefined })} disabled={createSessionMutation.isLoading || !newTitle || !newSubject || !newGrade}>
                  {createSessionMutation.isLoading && <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2" />}
                  {tt.save}
                </Button>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {sessionsQuery.isLoading && <p className="text-center text-gray-500 py-8">{tt.loading}</p>}
            {sessionsQuery.data?.length === 0 && !showCreateForm && (
              <div className="text-center py-16 px-8 bg-white rounded-2xl shadow-sm border">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">{t("لا توجد جلسات تصحيح بعد", "Aucune session de correction", "No Grading Sessions Yet")}</h3>
                <p className="mt-2 text-sm text-gray-500">{t("ابدأ بإنشاء جلسة جديدة لرفع أوراق التلاميذ وتصحيحها.", "Créez une nouvelle session pour commencer à téléverser et corriger les copies.", "Create a new session to start uploading and grading papers.")}</p>
                <Button onClick={() => setShowCreateForm(true)} className="mt-6">
                  <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {t("إنشاء أول جلسة", "Créer la première session", "Create First Session")}
                </Button>
              </div>
            )}
            {sessionsQuery.data?.map(session => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border hover:border-indigo-300 transition-all duration-200 p-5 flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="font-bold text-lg text-gray-800">{session.title}</p>
                  <p className="text-sm text-gray-500">{session.subject} • {session.grade}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {session.status === 'completed' ? t('مكتملة', 'Terminée', 'Completed') : t('قيد الإنجاز', 'En cours', 'In Progress')}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500"><Users className="w-3.5 h-3.5" /> {session._count.submissions} {t("تلميذ", "élèves", "students")}</span>
                    <span className="flex items-center gap-1.5 text-gray-500"><Clock className="w-3.5 h-3.5" /> {new Date(session.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  </div>
                </div>
                <Button onClick={() => { setSelectedSessionId(session.id); setActiveView("session-detail"); }}>
                  {t("فتح الجلسة", "Ouvrir", "Open Session")} <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== SESSION DETAIL ====================
  if (activeView === "session-detail" && selectedSessionId) {
    const session = sessionDetailQuery.data;

    const handleTriggerUpload = () => {
        if (!uploadStudentName) {
            toast.warning(t("الرجاء إدخال اسم التلميذ أولاً.", "Veuillez d'abord saisir le nom de l'élève.", "Please enter the student's name first."));
            return;
        }
        fileInputRef.current?.click();
    }

    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        {session && (
            <ToolPageHeader
                icon={FileCheck}
                nameAr={session.title}
                nameFr={session.title}
                nameEn={session.title}
                descAr={`${session.subject} • ${session.grade}`}
                descFr={`${session.subject} • ${session.grade}`}
                descEn={`${session.subject} • ${session.grade}`}
                gradient={BLIND_GRADING_GRADIENT}
                backTo={() => setActiveView("sessions")}
            />
        )}

        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {sessionDetailQuery.isLoading ? (
                <p>{tt.loading}</p>
            ) : session ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Submissions List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{t("أوراق التلاميذ", "Copies des élèves", "Student Submissions")}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">{t("إخفاء الأسماء", "Cacher les noms", "Hide Names")}</span>
                                <button onClick={() => setHideNames(!hideNames)} className={`p-1.5 rounded-full ${hideNames ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {hideNames ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="bg-gray-50 border-2 border-dashed rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
                            <Input 
                                value={uploadStudentName} 
                                onChange={e => setUploadStudentName(e.target.value)} 
                                placeholder={t("أدخل اسم التلميذ هنا...", "Entrez le nom de l'élève ici...", "Enter student name here...")} 
                                className="flex-grow"
                            />
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" accept="image/*,application/pdf" />
                            <Button onClick={handleTriggerUpload} disabled={uploading} className="w-full md:w-auto">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2" /> : <Upload className="w-4 h-4 ltr:mr-2 rtl:ml-2" />}
                                {uploading ? t("جاري الرفع...", "Téléversement...", "Uploading...") : t("رفع ورقة تلميذ", "Téléverser une copie", "Upload Paper")}
                            </Button>
                        </div>

                        {/* Submissions Table */}
                        <div className="space-y-3">
                            {session.submissions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">{t("لم يتم رفع أي ورقة بعد.", "Aucune copie n'a été téléversée pour le moment.", "No submissions have been uploaded yet.")}</p>
                                </div>
                            ) : (
                                session.submissions.map((sub, index) => (
                                    <div 
                                        key={sub.id} 
                                        onClick={() => { setSelectedSubmissionId(sub.id); setActiveView("submission-detail"); }}
                                        className="p-4 rounded-xl border bg-white hover:bg-gray-50 cursor-pointer grid grid-cols-12 gap-4 items-center"
                                    >
                                        <div className="col-span-4 font-semibold text-gray-800">
                                            {hideNames ? `${t("تلميذ", "Élève", "Student")} ${index + 1}` : sub.studentName}
                                        </div>
                                        <div className="col-span-3">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ sub.status === 'graded' ? 'bg-green-100 text-green-700' : sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {sub.status === 'graded' ? t('تم التصحيح', 'Corrigée', 'Graded') : sub.status === 'pending' ? t('في الانتظار', 'En attente', 'Pending') : t('قيد المعالجة', 'En cours', 'Processing')}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm font-bold text-gray-700">
                                            {sub.finalScore !== null ? `${sub.finalScore} / ${sub.totalScore}` : '-- / --'}
                                        </div>
                                        <div className="col-span-2 text-end">
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Session Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("إحصائيات سريعة", "Statistiques rapides", "Quick Stats")}</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span>{t("عدد التلاميذ", "Nombre d'élèves", "Number of Students")}</span><span className="font-bold">{session.submissions.length}</span></div>
                                <div className="flex justify-between"><span>{t("الأوراق المصححة", "Copies corrigées", "Graded Papers")}</span><span className="font-bold">{session.submissions.filter(s => s.status === 'graded').length}</span></div>
                                <div className="flex justify-between"><span>{t("معدل القسم", "Moyenne de la classe", "Class Average")}</span><span className="font-bold">{session.classAverage?.toFixed(2) || 'N/A'}</span></div>
                            </div>
                            <Button onClick={() => setActiveView("statistics")} className="w-full mt-5">
                                <BarChart3 className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("عرض الإحصائيات الكاملة", "Voir les statistiques complètes", "View Full Statistics")}
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("إجراءات", "Actions", "Actions")}</h3>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => updateSessionMutation.mutate({ sessionId: session.id, status: session.status === 'completed' ? 'in-progress' : 'completed' })}>
                                    {session.status === 'completed' ? <Clock className="w-4 h-4 ltr:mr-2 rtl:ml-2"/> : <CheckCircle2 className="w-4 h-4 ltr:mr-2 rtl:ml-2"/>}
                                    {session.status === 'completed' ? t("إعادة فتح الجلسة", "Rouvrir la session", "Re-open Session") : t("إنهاء وغلق الجلسة", "Terminer et fermer la session", "Finalize Session")}
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => { setExportingInspector(true); inspectorReportMutation.mutate({ sessionId: session.id }); }} disabled={exportingInspector}>
                                    {exportingInspector ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2"/> : <FileDown className="w-4 h-4 ltr:mr-2 rtl:ml-2"/>}
                                    {t("تصدير تقرير المتفقد", "Exporter rapport d'inspecteur", "Export Inspector Report")}
                                </Button>
                                <Button variant="destructive_outline" className="w-full justify-start" onClick={() => {
                                    if (confirm(t("هل أنت متأكد من حذف هذه الجلسة وكل ما يتعلق بها؟", "Êtes-vous sûr de vouloir supprimer cette session et toutes ses données ?", "Are you sure you want to delete this session and all its data?"))) {
                                        deleteSessionMutation.mutate({ sessionId: session.id });
                                    }
                                }}>
                                    <Trash2 className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("حذف الجلسة", "Supprimer la session", "Delete Session")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>{t("لم يتم العثور على الجلسة.", "Session non trouvée.", "Session not found.")}</p>
            )}
        </div>
      </div>
    );
  }

  // ==================== SUBMISSION DETAIL ====================
  if (activeView === "submission-detail" && selectedSubmissionId) {
    const submission = submissionDetailQuery.data;
    const session = sessionDetailQuery.data?.session;

    const handleGradeUpdate = (criterionId: number, score: number | null, mastery: string | null) => {
        if (!submission) return;
        const newGrades = submission.grades.map(g => 
            g.id === criterionId ? { ...g, score, masteryLevel: mastery } : g
        );
        // This is a local update for UI responsiveness, the actual update is sent on finalize.
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
            {submission && session && (
                <ToolPageHeader
                    icon={FileCheck}
                    nameAr={hideNames ? `${t("ورقة التلميذ", "Copie de l'élève", "Student Paper")} #${submission.id}` : submission.studentName || ""}
                    nameFr={hideNames ? `Copie de l'élève #${submission.id}` : submission.studentName || ""}
                    nameEn={hideNames ? `Student Paper #${submission.id}` : submission.studentName || ""}
                    descAr={session.title}
                    descFr={session.title}
                    descEn={session.title}
                    gradient={BLIND_GRADING_GRADIENT}
                    backTo={() => setActiveView("session-detail")}
                />
            )}

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {submissionDetailQuery.isLoading ? (
                    <p>{tt.loading}</p>
                ) : submission ? (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left Column: Image Preview */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border p-4 flex flex-col">
                            <div className="flex-grow rounded-lg bg-gray-100 overflow-auto p-2">
                                {submission.imageUrl ? (
                                    <img src={submission.imageUrl} alt={t("ورقة التلميذ", "Copie de l'élève", "Student Paper")} className="w-full h-auto" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">{t("لا توجد صورة لعرضها", "Aucune image à afficher", "No image to display")}</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Grading Interface */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{t("التصحيح والتقييم", "Correction et Évaluation", "Grading and Assessment")}</h3>
                                
                                {submission.status === 'pending' && session?.examContent && (
                                    <Button className="w-full mb-4" onClick={() => aiGradeMutation.mutate({ submissionId: submission.id })} disabled={aiGradeMutation.isLoading}>
                                        {aiGradeMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2"/> : <Sparkles className="w-4 h-4 ltr:mr-2 rtl:ml-2"/>}
                                        {t("بدء التصحيح بالذكاء الاصطناعي", "Lancer la correction IA", "Start AI Grading")}
                                    </Button>
                                )}

                                <div className="space-y-4">
                                    {submission.grades.map(grade => {
                                        const mastery = getMasteryDisplay(grade.masteryLevel || "", t);
                                        return (
                                            <div key={grade.id} className="border-b pb-4 last:border-b-0">
                                                <p className="font-semibold text-gray-700">{grade.criterion}</p>
                                                {grade.feedback && <p className="text-xs text-gray-500 mt-1">{grade.feedback}</p>}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Input 
                                                        type="number"
                                                        value={grade.score === null ? '' : grade.score}
                                                        onChange={e => handleGradeUpdate(grade.id, e.target.value === '' ? null : parseFloat(e.target.value), grade.masteryLevel)}
                                                        className="w-24"
                                                        placeholder={tt.score}
                                                    />
                                                    <Select 
                                                        value={grade.masteryLevel || ''}
                                                        onValueChange={m => handleGradeUpdate(grade.id, grade.score, m)}
                                                    >
                                                        <SelectTrigger className={`flex-grow ${mastery.bg} ${mastery.text}`}>
                                                            <SelectValue placeholder={t("اختر مستوى التملك", "Choisir maîtrise", "Select Mastery")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(masteryLevelsData).map(([level, labels]) => (
                                                                <SelectItem key={level} value={level}>{t(labels.ar, labels.fr, labels.en)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-6 border-t pt-4 space-y-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{tt.total}</span>
                                        <span>{submission.finalScore} / {submission.totalScore}</span>
                                    </div>
                                    <Button className="w-full" onClick={() => finalizeSubmissionMutation.mutate({ submissionId: submission.id, grades: submission.grades.map(g => ({ criterionId: g.id, score: g.score, masteryLevel: g.masteryLevel }))})} disabled={finalizeSubmissionMutation.isLoading}>
                                        {finalizeSubmissionMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2"/> : <CheckCircle2 className="w-4 h-4 ltr:mr-2 rtl:ml-2"/>}
                                        {t("تثبيت التقييم النهائي", "Finaliser l'évaluation", "Finalize Assessment")}
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{t("إجراءات الورقة", "Actions sur la copie", "Submission Actions")}</h3>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start" onClick={() => { setExportingPdf(true); exportPdfMutation.mutate({ submissionId: submission.id }); }} disabled={exportingPdf}>
                                        {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2"/> : <Download className="w-4 h-4 ltr:mr-2 rtl:ml-2"/>}
                                        {t("تصدير تقرير التلميذ (PDF)", "Exporter rapport élève (PDF)", "Export Student Report (PDF)")}
                                    </Button>
                                    <Button variant="destructive_outline" className="w-full justify-start" onClick={() => {
                                        if (confirm(t("هل أنت متأكد من حذف هذه الورقة؟", "Êtes-vous sûr de vouloir supprimer cette copie ?", "Are you sure you want to delete this submission?"))) {
                                            deleteSubmissionMutation.mutate({ submissionId: submission.id });
                                        }
                                    }}>
                                        <Trash2 className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("حذف الورقة", "Supprimer la copie", "Delete Submission")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>{t("لم يتم العثور على الورقة.", "Copie non trouvée.", "Submission not found.")}</p>
                )}
            </div>
        </div>
    );
  }

  // ==================== STATISTICS VIEW ====================
  if (activeView === "statistics" && selectedSessionId) {
    const stats = statsQuery.data;
    const session = sessionDetailQuery.data; // Already fetched

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
            {session && (
                <ToolPageHeader
                    icon={BarChart3}
                    nameAr={`${t("إحصائيات", "Statistiques", "Statistics")}: ${session.title}`}
                    nameFr={`Statistiques: ${session.title}`}
                    nameEn={`Statistics: ${session.title}`}
                    descAr={t("تحليل مفصل لنتائج القسم", "Analyse détaillée des résultats de la classe", "Detailed analysis of class results")}
                    descFr={t("تحليل مفصل لنتائج القسم", "Analyse détaillée des résultats de la classe", "Detailed analysis of class results")}
                    descEn={t("تحليل مفصل لنتائج القسم", "Analyse détaillée des résultats de la classe", "Detailed analysis of class results")}
                    gradient={BLIND_GRADING_GRADIENT}
                    backTo={() => setActiveView("session-detail")}
                />
            )}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {statsQuery.isLoading ? (
                    <p>{tt.loading}</p>
                ) : stats ? (
                    <div className="space-y-8">
                        {/* Top-level stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Award} label={t("أعلى معدل", "Meilleure moyenne", "Top Score")} value={stats.highestScore?.toFixed(2) || 'N/A'} />
                            <StatCard icon={TrendingDown} label={t("أدنى معدل", "Moins bonne moyenne", "Lowest Score")} value={stats.lowestScore?.toFixed(2) || 'N/A'} />
                            <StatCard icon={PieChart} label={t("معدل القسم", "Moyenne de classe", "Class Average")} value={stats.averageScore?.toFixed(2) || 'N/A'} />
                            <StatCard icon={Percent} label={t("نسبة النجاح", "Taux de réussite", "Success Rate")} value={`${stats.successRate?.toFixed(1) || 'N/A'}%`} />
                        </div>

                        {/* Mastery Distribution */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("توزيع مستويات التملك", "Distribution des niveaux de maîtrise", "Mastery Level Distribution")}</h3>
                            <div className="space-y-4">
                                {Object.entries(stats.masteryDistribution).map(([level, count]) => {
                                    const mastery = getMasteryDisplay(level, t);
                                    const percentage = (count / stats.totalSubmissions) * 100;
                                    return (
                                        <div key={level} className="flex items-center gap-4">
                                            <div className={`w-28 text-sm font-semibold ${mastery.text}`}>{mastery.label}</div>
                                            <div className="flex-grow bg-gray-200 rounded-full h-4">
                                                <div className={`${mastery.bg} h-4 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <div className="w-20 text-sm font-bold text-gray-600 text-end">{count} ({percentage.toFixed(0)}%)</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Criteria Analysis */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("تحليل حسب المعيار", "Analyse par critère", "Criteria Analysis")}</h3>
                            <div className="space-y-5">
                                {stats.criteriaAnalysis.map(criterion => (
                                    <div key={criterion.criterionId}>
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-gray-700">{criterion.criterionName}</p>
                                            <p className="text-sm font-bold">{t("المعدل:", "Moyenne:", "Avg:")} {criterion.averageScore.toFixed(2)}</p>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div className="bg-emerald-50 p-2 rounded-lg text-center"><p className="font-bold text-emerald-700">{criterion.masteryCounts['+++'] || 0}</p><p className="text-emerald-600">{t("ممتاز", "Excellent", "Excellent")}</p></div>
                                            <div className="bg-green-50 p-2 rounded-lg text-center"><p className="font-bold text-green-700">{criterion.masteryCounts['++'] || 0}</p><p className="text-green-600">{t("جيد", "Bon", "Good")}</p></div>
                                            <div className="bg-yellow-50 p-2 rounded-lg text-center"><p className="font-bold text-yellow-700">{criterion.masteryCounts['+'] || 0}</p><p className="text-yellow-600">{t("مقبول", "Acceptable", "Acceptable")}</p></div>
                                            <div className="bg-red-50 p-2 rounded-lg text-center"><p className="font-bold text-red-700">{Object.entries(criterion.masteryCounts).filter(([k]) => ['-', '--', '---'].includes(k)).reduce((s, [, c]) => s + c, 0)}</p><p className="text-red-600">{t("ضعيف", "Faible", "Weak")}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Outliers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="text-green-500"/> {t("أفضل 3 تلاميذ", "Top 3 élèves", "Top 3 Students")}</h3>
                                <ul className="space-y-2">
                                    {stats.topStudents.map(s => <StudentListItem key={s.id} name={s.studentName} score={s.finalScore} total={s.totalScore} hideName={hideNames} t={t} />)}
                                </ul>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingDown className="text-red-500"/> {t("أقل 3 تلاميذ", "3 derniers élèves", "Bottom 3 Students")}</h3>
                                <ul className="space-y-2">
                                    {stats.bottomStudents.map(s => <StudentListItem key={s.id} name={s.studentName} score={s.finalScore} total={s.totalScore} hideName={hideNames} t={t} />)}
                                </ul>
                            </div>
                        </div>

                    </div>
                ) : (
                    <p>{t("لا توجد إحصائيات لعرضها.", "Aucune statistique à afficher.", "No statistics to display.")}</p>
                )}
            </div>
        </div>
    );
  }

  return null;
}

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StudentListItem = ({ name, score, total, hideName, t }: { name: string | null, score: number | null, total: number | null, hideName: boolean, t: any }) => (
    <li className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
        <span className="font-semibold text-gray-700">{hideName ? t("تلميذ", "Élève", "Student") : name}</span>
        <span className="font-bold text-indigo-600">{score?.toFixed(2)} / {total}</span>
    </li>
);
