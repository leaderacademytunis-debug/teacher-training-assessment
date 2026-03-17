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

const BLIND_GRADING_GRADIENT = "linear-gradient(135deg, #4338ca, #7c3aed, #1d4ed8)";

// Tunisian mastery level colors
const masteryColors: Record<string, { bg: string; text: string; label: string }> = {
  "+++": { bg: "bg-emerald-100", text: "text-emerald-700", label: "تملك ممتاز" },
  "++": { bg: "bg-green-100", text: "text-green-700", label: "تملك جيد" },
  "+": { bg: "bg-yellow-100", text: "text-yellow-700", label: "تملك مقبول" },
  "-": { bg: "bg-orange-100", text: "text-orange-700", label: "غير كاف" },
  "--": { bg: "bg-red-100", text: "text-red-700", label: "غير كاف جدا" },
  "---": { bg: "bg-red-200", text: "text-red-800", label: "غير متملك" },
};

function getMasteryStyle(level: string) {
  return masteryColors[level] || { bg: "bg-gray-100", text: "text-gray-600", label: level };
}

export default function BlindGrading() {
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
    },
  });

  const deleteSessionMutation = trpc.grading.deleteSession.useMutation({
    onSuccess: () => {
      utils.grading.getSessions.invalidate();
      setActiveView("sessions");
      setSelectedSessionId(null);
    },
  });

  const uploadMutation = trpc.grading.uploadAndOCR.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      setUploadStudentName("");
      setUploading(false);
    },
    onError: () => setUploading(false),
  });

  const aiGradeMutation = trpc.grading.aiGrade.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      if (selectedSubmissionId) {
        utils.grading.getSubmission.invalidate({ submissionId: selectedSubmissionId });
      }
    },
  });

  const finalizeSubmissionMutation = trpc.grading.finalizeSubmission.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      if (selectedSubmissionId) {
        utils.grading.getSubmission.invalidate({ submissionId: selectedSubmissionId });
      }
    },
  });

  const deleteSubmissionMutation = trpc.grading.deleteSubmission.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
      setActiveView("session-detail");
      setSelectedSubmissionId(null);
    },
  });

  const updateSessionMutation = trpc.grading.updateSession.useMutation({
    onSuccess: () => {
      utils.grading.getSession.invalidate({ sessionId: selectedSessionId! });
    },
  });

  // GPS Context query - auto-detect current lesson
  const gpsQuery = trpc.grading.getGPSContext.useQuery(
    { subject: newSubject || undefined, grade: newGrade || undefined },
    { enabled: !!user && showCreateForm && !!newSubject && !!newGrade }
  );

  // Statistics query
  const statsQuery = trpc.grading.classStatistics.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId && activeView === "statistics" }
  );

  // PDF export mutation
  const exportPdfMutation = trpc.grading.exportPDF.useMutation({
    onSuccess: (data) => {
      setExportingPdf(false);
      window.open(data.url, "_blank");
    },
    onError: () => setExportingPdf(false),
  });

  // Inspector report mutation
  const [exportingInspector, setExportingInspector] = useState(false);
  const inspectorReportMutation = trpc.grading.inspectorReport.useMutation({
    onSuccess: (data) => {
      setExportingInspector(false);
      window.open(data.url, "_blank");
    },
    onError: () => setExportingInspector(false),
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedSessionId) return;
    setUploading(true);
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
  }, [selectedSessionId, uploadStudentName, uploadMutation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <Shield className="w-16 h-16 text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">مساعد التصحيح الأعمى</h2>
          <p className="text-gray-600">يجب تسجيل الدخول للوصول إلى هذه الأداة</p>
          <a href={getLoginUrl()} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  // ==================== SESSIONS LIST ====================
  if (activeView === "sessions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        <ToolPageHeader
          icon={FileCheck}
          nameAr="مساعد التصحيح الأعمى"
          descAr="تصحيح ذكي بالذكاء الاصطناعي حسب المعايير التونسية"
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
                <p className="text-sm text-gray-500">جلسات التصحيح</p>
                <p className="text-2xl font-bold text-gray-800">{sessionsQuery.data?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">مكتملة</p>
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
                <p className="text-sm text-gray-500">إجمالي التلاميذ</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sessionsQuery.data?.reduce((sum, s) => sum + (s.totalStudents || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Create New Session */}
          {showCreateForm ? (
            <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">جلسة تصحيح جديدة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الجلسة</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="مثال: اختبار الرياضيات - الثلاثي 2"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
                  <select value={newSubject} onChange={e => setNewSubject(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                    <option value="">اختر المادة</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="الإيقاظ العلمي">الإيقاظ العلمي</option>
                    <option value="العربية">العربية</option>
                    <option value="الفرنسية">الفرنسية</option>
                    <option value="التربية الإسلامية">التربية الإسلامية</option>
                    <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                  <select value={newGrade} onChange={e => setNewGrade(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                    <option value="">اختر المستوى</option>
                    <option value="السنة الأولى">السنة الأولى</option>
                    <option value="السنة الثانية">السنة الثانية</option>
                    <option value="السنة الثالثة">السنة الثالثة</option>
                    <option value="السنة الرابعة">السنة الرابعة</option>
                    <option value="السنة الخامسة">السنة الخامسة</option>
                    <option value="السنة السادسة">السنة السادسة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الاختبار</label>
                  <select value={newExamType} onChange={e => setNewExamType(e.target.value as any)}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                    <option value="summative">تقييم ختامي</option>
                    <option value="formative">تقييم تكويني</option>
                    <option value="diagnostic">تقييم تشخيصي</option>
                  </select>
                </div>
              </div>
              {fromExamContent && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    تم نقل مفتاح الإصلاح تلقائياً من بناء الاختبار
                  </div>
                </div>
              )}
              {/* GPS Context - Auto-detect current lesson */}
              {gpsQuery.data?.currentTopic && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-bold mb-2">
                    <Navigation className="w-4 h-4" />
                    بوصلة المنهج — الدرس الحالي
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="font-semibold text-gray-800">{gpsQuery.data.currentTopic.title}</p>
                    {gpsQuery.data.currentTopic.competency && (
                      <p className="text-xs text-gray-500 mt-1">الكفاية: {gpsQuery.data.currentTopic.competency}</p>
                    )}
                    {gpsQuery.data.period && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{gpsQuery.data.period}</span>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">سيتم ربط هذه الجلسة تلقائياً بالدرس الحالي في المنهج</p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => {
                  if (newTitle && newSubject && newGrade) {
                    createSessionMutation.mutate({
                      sessionTitle: newTitle, subject: newSubject, grade: newGrade, examType: newExamType,
                      ...(fromExamContent ? { correctionKey: fromExamContent } : {})
                    } as any);
                  }
                }}
                  disabled={!newTitle || !newSubject || !newGrade || createSessionMutation.isPending}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {createSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  إنشاء الجلسة
                </button>
                <button onClick={() => setShowCreateForm(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCreateForm(true)}
              className="w-full bg-white rounded-2xl shadow-sm border-2 border-dashed border-indigo-300 p-6 mb-8 flex items-center justify-center gap-3 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all">
              <Plus className="w-6 h-6" />
              <span className="text-lg font-semibold">جلسة تصحيح جديدة</span>
            </button>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {sessionsQuery.data?.map(session => (
              <div key={session.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedSessionId(session.id); setActiveView("session-detail"); }}>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{session.sessionTitle}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.status === "completed" ? "bg-green-100 text-green-700" :
                          session.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {session.status === "completed" ? "مكتمل" : session.status === "in_progress" ? "قيد التصحيح" : "مسودة"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{session.subject}</span>
                        <span>{session.grade}</span>
                        <span>{session.examType === "summative" ? "ختامي" : session.examType === "formative" ? "تكويني" : "تشخيصي"}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-indigo-600">{session.gradedStudents}/{session.totalStudents}</div>
                      <div className="text-xs text-gray-500">مصحح</div>
                    </div>
                  </div>
                  {session.totalStudents > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${session.totalStudents > 0 ? (session.gradedStudents / session.totalStudents) * 100 : 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!sessionsQuery.data || sessionsQuery.data.length === 0) && !sessionsQuery.isLoading && (
              <div className="text-center py-16 text-gray-400">
                <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد جلسات تصحيح بعد</p>
                <p className="text-sm mt-1">أنشئ جلسة جديدة لبدء التصحيح الذكي</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== SESSION DETAIL ====================
  if (activeView === "session-detail" && selectedSessionId) {
    const session = sessionDetailQuery.data?.session;
    const submissions = sessionDetailQuery.data?.submissions || [];
    const stats = sessionDetailQuery.data?.stats;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        {/* Header */}
        <ToolPageHeader
          icon={FileCheck}
          nameAr={session?.sessionTitle || "..."}
          gradient={BLIND_GRADING_GRADIENT}
          onBack={() => { setActiveView("sessions"); setSelectedSessionId(null); }}
          subtitle={session ? `${session.subject} | ${session.grade}` : undefined}
        />


        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Privacy Toggle & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Privacy Shield Toggle */}
              <button
                onClick={() => {
                  setHideNames(!hideNames);
                  if (selectedSessionId) {
                    updateSessionMutation.mutate({ sessionId: selectedSessionId, hideStudentNames: !hideNames });
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  hideNames
                    ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                }`}>
                {hideNames ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <Shield className="w-4 h-4" />
                {hideNames ? "وضع التصحيح الأعمى" : "إظهار الأسماء"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* PDF Export */}
              <button
                onClick={() => {
                  setExportingPdf(true);
                  exportPdfMutation.mutate({ sessionId: selectedSessionId });
                }}
                disabled={exportingPdf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
                title="تصدير PDF">
                {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                تصدير PDF
              </button>
              {/* Inspector Report */}
              <button
                onClick={() => {
                  setExportingInspector(true);
                  inspectorReportMutation.mutate({ sessionId: selectedSessionId });
                }}
                disabled={exportingInspector}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-indigo-50 text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-50"
                title="تقرير التفقد الرسمي">
                {exportingInspector ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                تقرير التفقد
              </button>
              {/* Statistics */}
              <button
                onClick={() => setActiveView("statistics")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 transition-all"
                title="إحصائيات الفصل">
                <PieChart className="w-4 h-4" />
                إحصائيات
              </button>
              <button onClick={() => deleteSessionMutation.mutate({ sessionId: selectedSessionId })}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="حذف الجلسة">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
                <p className="text-xs text-gray-500">إجمالي الأوراق</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.graded}</p>
                <p className="text-xs text-gray-500">مصحح بالذكاء</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
                <p className="text-xs text-gray-500">مراجع</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.finalized}</p>
                <p className="text-xs text-gray-500">نهائي</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              رفع أوراق التلاميذ
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-gray-600 mb-1">اسم التلميذ (اختياري)</label>
                <input type="text" value={uploadStudentName} onChange={e => setUploadStudentName(e.target.value)}
                  placeholder="يمكن تركه فارغاً للتصحيح الأعمى"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload}
                  className="hidden" id="upload-sheets" />
                <label htmlFor="upload-sheets"
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold cursor-pointer transition-colors ${
                    uploading ? "bg-gray-300 text-gray-500" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "جاري الرفع..." : "رفع صور الأوراق"}
                </label>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800">أوراق التلاميذ ({submissions.length})</h3>
            </div>
            {submissions.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لم يتم رفع أي أوراق بعد</p>
              </div>
            ) : (
              <div className="divide-y">
                {submissions.map((sub: any) => (
                  <div key={sub.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4"
                    onClick={() => { setSelectedSubmissionId(sub.id); setActiveView("submission-detail"); }}>
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                      <img src={sub.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {hideNames ? `تلميذ ${sub.studentNumber}` : (sub.studentName || `تلميذ ${sub.studentNumber}`)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "finalized" ? "bg-emerald-100 text-emerald-700" :
                          sub.status === "teacher_reviewed" ? "bg-green-100 text-green-700" :
                          sub.status === "ai_graded" ? "bg-blue-100 text-blue-700" :
                          sub.status === "ocr_done" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {sub.status === "finalized" ? "نهائي" :
                           sub.status === "teacher_reviewed" ? "مراجع" :
                           sub.status === "ai_graded" ? "مصحح" :
                           sub.status === "ocr_done" ? "جاهز للتصحيح" : "مرفوع"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span>OCR: {sub.ocrConfidence === "high" ? "عالي" : sub.ocrConfidence === "medium" ? "متوسط" : "ضعيف"}</span>
                        {sub.totalFinalScore != null && (
                          <span className="font-semibold text-indigo-600">{sub.totalFinalScore}/20</span>
                        )}
                      </div>
                    </div>
                    {/* Mastery Badge */}
                    {sub.overallMasteryLevel && (
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getMasteryStyle(sub.overallMasteryLevel).bg} ${getMasteryStyle(sub.overallMasteryLevel).text}`}>
                        {sub.overallMasteryLevel}
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {(sub.status === "ocr_done" || sub.status === "uploaded") && (
                        <button onClick={(e) => { e.stopPropagation(); aiGradeMutation.mutate({ submissionId: sub.id }); }}
                          disabled={aiGradeMutation.isPending}
                          className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1">
                          {aiGradeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          تصحيح ذكي
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== SUBMISSION DETAIL ====================
  if (activeView === "submission-detail" && selectedSubmissionId) {
    const subData = submissionDetailQuery.data;
    const sub = subData?.submission;
    const session = subData?.session;
    const criteriaScores = (sub?.criteriaScores as any[]) || [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        <ToolPageHeader
          icon={FileCheck}
          nameAr={hideNames ? `تلميذ ${sub?.studentNumber}` : (sub?.studentName || `تلميذ ${sub?.studentNumber}`)}
          gradient={BLIND_GRADING_GRADIENT}
          onBack={() => { setActiveView("session-detail"); setSelectedSubmissionId(null); }}
          subtitle={sub?.overallMasteryLevel ? `${sub.overallMasteryLevel} - ${getMasteryStyle(sub.overallMasteryLevel).label}` : undefined}
        />

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Image */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  الورقة الأصلية
                </h3>
                {sub?.imageUrl && (
                  <a href={sub.imageUrl} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                    <Download className="w-4 h-4" /> تحميل
                  </a>
                )}
              </div>
              <div className="p-4">
                {sub?.imageUrl && (
                  <img src={sub.imageUrl} alt="ورقة التلميذ" className="w-full rounded-lg border" />
                )}
              </div>
              {/* OCR Text */}
              {sub?.extractedText && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">النص المستخرج (OCR)</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {sub.extractedText}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Grading Results */}
            <div className="space-y-6">
              {/* Score Summary */}
              {sub?.totalFinalScore != null && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      النتيجة الإجمالية
                    </h3>
                    <div className="text-3xl font-bold text-indigo-600">
                      {sub.totalFinalScore}<span className="text-lg text-gray-400">/20</span>
                    </div>
                  </div>
                  {sub.overallMasteryLevel && (
                    <div className={`text-center py-3 rounded-xl ${getMasteryStyle(sub.overallMasteryLevel).bg}`}>
                      <span className={`text-lg font-bold ${getMasteryStyle(sub.overallMasteryLevel).text}`}>
                        {sub.overallMasteryLevel} — {getMasteryStyle(sub.overallMasteryLevel).label}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Criteria Scores */}
              {criteriaScores.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800">جدول إسناد الأعداد</h3>
                  </div>
                  <div className="divide-y">
                    {criteriaScores.map((cs: any, idx: number) => (
                      <div key={idx} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">
                              {cs.criterionCode}
                            </span>
                            <span className="font-medium text-gray-800">{cs.criterionLabel}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-indigo-600">
                              {cs.finalScore}<span className="text-sm text-gray-400">/{cs.maxScore}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMasteryStyle(cs.masteryLevel).bg} ${getMasteryStyle(cs.masteryLevel).text}`}>
                              {cs.masteryLevel}
                            </span>
                          </div>
                        </div>
                        {/* Score bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${cs.maxScore > 0 ? (cs.finalScore / cs.maxScore) * 100 : 0}%` }} />
                        </div>
                        {cs.justification && (
                          <p className="text-xs text-gray-500 mt-1">{cs.justification}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encouragement Note */}
              {(sub as any)?.encouragementNote && (
                <div className="bg-gradient-to-l from-purple-50 to-indigo-50 rounded-2xl shadow-sm border border-purple-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-600 mb-0.5">ملاحظة تشجيعية للتلميذ</p>
                      <p className="text-base font-bold text-purple-800 leading-relaxed">{(sub as any).encouragementNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pedagogical Feedback */}
              {(sub?.feedbackStrengths || sub?.feedbackImprovements) && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    الملاحظات البيداغوجية
                  </h3>
                  {sub.feedbackStrengths && (
                    <div className="bg-green-50 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">نقاط القوة</span>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed">{sub.feedbackStrengths}</p>
                    </div>
                  )}
                  {sub.feedbackImprovements && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">مجالات التحسين</span>
                      </div>
                      <p className="text-sm text-amber-800 leading-relaxed">{sub.feedbackImprovements}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {(sub?.status === "ocr_done" || sub?.status === "uploaded") && (
                  <button onClick={() => aiGradeMutation.mutate({ submissionId: selectedSubmissionId })}
                    disabled={aiGradeMutation.isPending}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                    {aiGradeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    تصحيح ذكي بالذكاء الاصطناعي
                  </button>
                )}
                {sub?.status === "ai_graded" && (
                  <button onClick={() => finalizeSubmissionMutation.mutate({ submissionId: selectedSubmissionId })}
                    disabled={finalizeSubmissionMutation.isPending}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    {finalizeSubmissionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    تأكيد النتيجة
                  </button>
                )}
                <button onClick={() => deleteSubmissionMutation.mutate({ submissionId: selectedSubmissionId })}
                  disabled={deleteSubmissionMutation.isPending}
                  className="border border-red-300 text-red-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== STATISTICS VIEW ====================
  if (activeView === "statistics" && selectedSessionId) {
    const stats = statsQuery.data;
    const isLoading = statsQuery.isLoading;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        {/* Header */}
        <ToolPageHeader
          icon={PieChart}
          nameAr="تحليل إحصائي للفصل"
          gradient={BLIND_GRADING_GRADIENT}
          onBack={() => setActiveView("session-detail")}
          subtitle={stats ? `${stats.session.title} | ${stats.session.subject} | ${stats.session.grade}` : undefined}
        />

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border p-5 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.overview.gradedStudents}</p>
                  <p className="text-xs text-gray-500">تلميذ مصحح</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border p-5 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.overview.average}<span className="text-sm text-gray-400">/{stats.session.totalPoints}</span></p>
                  <p className="text-xs text-gray-500">المعدل العام</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border p-5 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.overview.passRate}%</p>
                  <p className="text-xs text-gray-500">نسبة النجاح</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border p-5 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{stats.overview.excellenceRate}%</p>
                  <p className="text-xs text-gray-500">نسبة التميز</p>
                </div>
              </div>

              {/* Score Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  توزيع الدرجات
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {stats.scoreBuckets.map((bucket: any) => {
                    const maxCount = Math.max(...stats.scoreBuckets.map((b: any) => b.count), 1);
                    const pct = (bucket.count / maxCount) * 100;
                    const colors = bucket.label === "15-20" ? "bg-emerald-500" : bucket.label === "10-14" ? "bg-blue-500" : bucket.label === "5-9" ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={bucket.label} className="text-center">
                        <div className="h-40 flex items-end justify-center mb-2">
                          <div className={`w-full max-w-[60px] ${colors} rounded-t-lg transition-all`}
                            style={{ height: `${Math.max(pct, 5)}%` }}>
                            <span className="text-white text-sm font-bold block pt-2">{bucket.count}</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{bucket.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>أدنى: {stats.overview.min}</span>
                  <span>الوسيط: {stats.overview.median}</span>
                  <span>أعلى: {stats.overview.max}</span>
                </div>
              </div>

              {/* Mastery Levels Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  توزيع مستويات التملك
                </h3>
                <div className="space-y-3">
                  {stats.masteryLevels.map((level: any) => {
                    const pct = stats.overview.gradedStudents > 0 ? Math.round((level.count / stats.overview.gradedStudents) * 100) : 0;
                    const style = getMasteryStyle(level.symbol);
                    return (
                      <div key={level.symbol} className="flex items-center gap-3">
                        <div className={`w-16 text-center py-1 rounded-lg font-bold text-sm ${style.bg} ${style.text}`}>
                          {level.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{level.label}</span>
                            <span className="text-sm font-semibold text-gray-600">{level.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: level.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Criteria Weakness Alert */}
              {stats.criteriaAnalysis.length > 0 && (() => {
                const weakCriteria = stats.criteriaAnalysis.filter((c: any) => c.successRate < 50);
                return weakCriteria.length > 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-red-800">تنبيه: معايير تحتاج معالجة</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-3">الفصل يعاني من ضعف في المعايير التالية (نسبة نجاح أقل من 50%):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {weakCriteria.map((c: any) => (
                        <div key={c.code} className="bg-white rounded-xl p-3 border border-red-100">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm font-bold">{c.code}</span>
                              <span className="text-sm font-medium text-gray-800">{c.label}</span>
                            </div>
                            <span className="text-red-600 font-bold text-sm">{c.successRate}%</span>
                          </div>
                          <div className="w-full bg-red-100 rounded-full h-2 mt-1">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${c.successRate}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">المعدل: {c.average}/{c.maxScore} | أدنى: {c.min} | أعلى: {c.max}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mt-3 font-medium">مقترح: خصص حصة علاجية لهذه المعايير قبل الانتقال للدرس الموالي</p>
                  </div>
                ) : null;
              })()}

              {/* Per-Criteria Analysis */}
              {stats.criteriaAnalysis.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      تحليل المعايير
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-sm">
                          <th className="text-right p-3 font-semibold text-gray-600">المعيار</th>
                          <th className="text-center p-3 font-semibold text-gray-600">المعدل</th>
                          <th className="text-center p-3 font-semibold text-gray-600">أعلى</th>
                          <th className="text-center p-3 font-semibold text-gray-600">أدنى</th>
                          <th className="text-center p-3 font-semibold text-gray-600">نسبة النجاح</th>
                          <th className="p-3 font-semibold text-gray-600 w-40">المستوى</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stats.criteriaAnalysis.map((c: any) => {
                          const pct = c.maxScore > 0 ? Math.round((c.average / c.maxScore) * 100) : 0;
                          return (
                            <tr key={c.code} className="hover:bg-gray-50">
                              <td className="p-3">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold ml-2">{c.code}</span>
                                <span className="text-sm text-gray-700">{c.label}</span>
                              </td>
                              <td className="p-3 text-center font-semibold text-indigo-600">{c.average}/{c.maxScore}</td>
                              <td className="p-3 text-center text-green-600">{c.max}</td>
                              <td className="p-3 text-center text-red-600">{c.min}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  c.successRate >= 75 ? "bg-green-100 text-green-700" :
                                  c.successRate >= 50 ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                }`}>{c.successRate}%</span>
                              </td>
                              <td className="p-3">
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                  <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Student Results Table */}
              {stats.studentResults.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      نتائج التلاميذ
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-sm">
                          <th className="text-right p-3 font-semibold text-gray-600">#</th>
                          <th className="text-right p-3 font-semibold text-gray-600">التلميذ</th>
                          {stats.criteriaAnalysis.map((c: any) => (
                            <th key={c.code} className="text-center p-3 font-semibold text-gray-600">{c.code}</th>
                          ))}
                          <th className="text-center p-3 font-semibold text-gray-600">المجموع</th>
                          <th className="text-center p-3 font-semibold text-gray-600">المستوى</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stats.studentResults.map((s: any, i: number) => {
                          const cs = (s.criteriaScores as any[]) || [];
                          return (
                            <tr key={s.studentNumber} className="hover:bg-gray-50">
                              <td className="p-3 text-sm text-gray-500">{i + 1}</td>
                              <td className="p-3 text-sm font-medium text-gray-800">{s.studentName}</td>
                              {stats.criteriaAnalysis.map((c: any) => {
                                const score = cs.find((x: any) => x.criterionCode === c.code);
                                return (
                                  <td key={c.code} className="p-3 text-center text-sm">
                                    {score ? `${score.finalScore ?? score.suggestedScore}/${c.maxScore}` : "-"}
                                  </td>
                                );
                              })}
                              <td className="p-3 text-center font-bold text-indigo-600">{s.totalScore}/{stats.session.totalPoints}</td>
                              <td className="p-3 text-center">
                                {s.masteryLevel && (
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getMasteryStyle(s.masteryLevel).bg} ${getMasteryStyle(s.masteryLevel).text}`}>
                                    {s.masteryLevel}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setExportingPdf(true);
                    exportPdfMutation.mutate({ sessionId: selectedSessionId });
                  }}
                  disabled={exportingPdf}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                  {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  تصدير التقرير PDF
                </button>
                <button onClick={() => setActiveView("session-detail")}
                  className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  العودة للجلسة
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>لا توجد بيانات كافية للتحليل</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
