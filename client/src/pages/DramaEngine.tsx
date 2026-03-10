import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowRight, Theater, Users, Sparkles, Download, Loader2,
  Play, Pause, ChevronDown, ChevronUp, Lightbulb, Target,
  Clock, BookOpen, Palette, MessageCircle, Star, Award,
  Wand2, UserPlus, Package, FileText, RefreshCw,
  Image, Save, Heart, Trash2, Store, Share2,
  HelpCircle, CheckCircle, Library, Eye, Printer
} from "lucide-react";
import { toast } from "sonner";

type DramaScript = {
  title: string;
  synopsis: string;
  duration: string;
  characters: Array<{ name: string; description: string; keyLines: number; difficulty: string }>;
  scenes: Array<{
    number: number;
    title: string;
    setting: string;
    directorNotes: string;
    dialogue: Array<{ character: string; line: string; action: string }>;
    audienceInteraction: string;
  }>;
  educationalObjectives: string[];
  props: Array<{ name: string; description: string; cost: string; alternatives: string }>;
  warmUpActivity: string;
  debriefQuestions: string[];
};

type MaskItem = { characterName: string; imageUrl: string; generatedAt: string };
type AssessmentQuestion = { question: string; type: string; options?: string[]; correctAnswer: string; criterion: string };
type SavedScript = {
  id: number;
  lessonTitle: string;
  subject: string;
  grade: string;
  scriptData: any;
  maskUrls: any;
  assessmentQuestions: any;
  isFavorite: boolean;
  isPublished: boolean;
  createdAt: string;
};

export default function DramaEngine() {
  const { user, loading: authLoading } = useAuth();

  
  // View mode: "create" | "library"
  const [viewMode, setViewMode] = useState<"create" | "library">("create");
  
  // Form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [duration, setDuration] = useState(10);
  const [studentCount, setStudentCount] = useState(25);
  
  // Result state
  const [script, setScript] = useState<DramaScript | null>(null);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [showRoles, setShowRoles] = useState(false);
  const [roles, setRoles] = useState<Array<{ studentNumber: number; characterName: string; role: string; tip: string }>>([]);
  
  // New feature states
  const [masks, setMasks] = useState<MaskItem[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showMasks, setShowMasks] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [currentSavedId, setCurrentSavedId] = useState<number | null>(null);
  
  // Library query
  const libraryQuery = trpc.drama.getLibrary.useQuery(undefined, {
    enabled: viewMode === "library" && !!user,
  });
  
  // Mutations
  const generateMutation = trpc.drama.generateScript.useMutation({
    onSuccess: (data) => {
      setScript(data as DramaScript);
      setActiveScene(0);
      setMasks([]);
      setAssessmentQuestions([]);
      setCurrentSavedId(null);
    },
  });
  
  const assignRolesMutation = trpc.drama.assignRoles.useMutation({
    onSuccess: (data) => {
      setRoles(data.assignments);
      setShowRoles(true);
    },
  });
  
  const exportPdfMutation = trpc.drama.exportPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  const generateMasksMutation = trpc.drama.generateMasks.useMutation({
    onSuccess: (data) => {
      setMasks(data.masks);
      setShowMasks(true);
      toast.success(`تم توليد ${data.masks.length} قناع جاهز للطباعة`);
    },
    onError: () => {
      toast.error("فشل توليد الأقنعة، حاول مرة أخرى");
    },
  });

  const saveScriptMutation = trpc.drama.saveScript.useMutation({
    onSuccess: (data) => {
      setCurrentSavedId(data.id);
      toast.success("تم حفظ المسرحية في مكتبتك الشخصية");
      libraryQuery.refetch();
    },
  });

  const deleteScriptMutation = trpc.drama.deleteScript.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المسرحية من المكتبة");
      libraryQuery.refetch();
    },
  });

  const toggleFavoriteMutation = trpc.drama.toggleFavorite.useMutation({
    onSuccess: () => {
      libraryQuery.refetch();
    },
  });

  const generateAssessmentMutation = trpc.drama.generateAssessment.useMutation({
    onSuccess: (data) => {
      setAssessmentQuestions(data.questions);
      setShowAssessment(true);
      toast.success(`تم توليد ${data.questions.length} أسئلة تقييمية جاهزة`);
    },
  });

  const publishToMarketMutation = trpc.drama.publishToMarket.useMutation({
    onSuccess: () => {
      setShowPublishDialog(false);
      toast.success("تم نشر المسرحية في السوق الذهبي");
      libraryQuery.refetch();
    },
    onError: () => {
      toast.error("فشل النشر، حاول مرة أخرى");
    },
  });

  const subjects = useMemo(() => [
    "إيقاظ علمي", "رياضيات", "عربية", "فرنسية", "إنجليزية",
    "تربية إسلامية", "تاريخ وجغرافيا", "تربية مدنية",
    "تربية تشكيلية", "تربية موسيقية", "تربية بدنية"
  ], []);

  const grades = useMemo(() => [
    "السنة الأولى", "السنة الثانية", "السنة الثالثة",
    "السنة الرابعة", "السنة الخامسة", "السنة السادسة"
  ], []);

  const handleGenerate = () => {
    if (!lessonTitle || !subject || !grade || !lessonContent) return;
    generateMutation.mutate({ lessonTitle, subject, grade, lessonContent, duration, studentCount });
  };

  const handleAssignRoles = () => {
    if (!script) return;
    assignRolesMutation.mutate({ characters: script.characters, studentCount });
  };

  const handleExportPDF = () => {
    if (!script) return;
    exportPdfMutation.mutate({ script, lessonTitle });
  };

  const handleGenerateMasks = () => {
    if (!script) return;
    generateMasksMutation.mutate({
      characters: script.characters.slice(0, 6).map(c => ({ name: c.name, description: c.description })),
      lessonTitle, subject,
    });
  };

  const handleSaveScript = () => {
    if (!script) return;
    saveScriptMutation.mutate({
      lessonTitle, subject, grade, duration, studentCount,
      scriptData: script,
      maskImages: masks.length > 0 ? masks : undefined,
      assessmentQuestions: assessmentQuestions.length > 0 ? assessmentQuestions.map(q => ({ question: q.question, expectedAnswer: q.correctAnswer, criteria: q.criterion })) : undefined,
    });
  };

  const handleGenerateAssessment = () => {
    if (!script) return;
    generateAssessmentMutation.mutate({
      lessonTitle, subject, grade,
      scriptSynopsis: script.synopsis,
      educationalObjectives: script.educationalObjectives,
    });
  };

  const handlePublish = () => {
    if (!script || !publishTitle) return;
    publishToMarketMutation.mutate({
      scriptId: currentSavedId || undefined,
      title: publishTitle,
      description: publishDesc || script.synopsis,
      subject, grade,
      content: script.synopsis,
      scriptData: script,
    });
  };

  const handleLoadFromLibrary = (saved: SavedScript) => {
    setScript(saved.scriptData as DramaScript);
    setLessonTitle(saved.lessonTitle);
    setSubject(saved.subject);
    setGrade(saved.grade);
    setCurrentSavedId(saved.id);
    setMasks(saved.maskUrls ? (saved.maskUrls as MaskItem[]) : []);
    setAssessmentQuestions(saved.assessmentQuestions ? (saved.assessmentQuestions as AssessmentQuestion[]) : []);
    setShowMasks(false);
    setShowAssessment(false);
    setViewMode("create");
    setActiveScene(0);
  };

  const resetAll = () => {
    setScript(null);
    setRoles([]);
    setShowRoles(false);
    setActiveScene(0);
    setMasks([]);
    setAssessmentQuestions([]);
    setShowMasks(false);
    setShowAssessment(false);
    setCurrentSavedId(null);
    setShowPublishDialog(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Theater className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">محرك الدراما التعليمية</h1>
          <p className="text-gray-600 mb-6">حوّل دروسك إلى مسرحيات تفاعلية ممتعة!</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
            تسجيل الدخول
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-purple-600 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Theater className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">محرك الدراما التعليمية</h1>
                <p className="text-xs text-gray-500">حوّل الدرس إلى مسرحية تفاعلية</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode("create")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "create" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Wand2 className="w-3.5 h-3.5" />
                إنشاء
              </button>
              <button onClick={() => setViewMode("library")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "library" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Library className="w-3.5 h-3.5" />
                مكتبتي
              </button>
            </div>
            {script && viewMode === "create" && (
              <>
                <button onClick={handleSaveScript} disabled={saveScriptMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm border border-green-200 disabled:opacity-50">
                  {saveScriptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ
                </button>
                <button onClick={handleExportPDF} disabled={exportPdfMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm border border-red-200 disabled:opacity-50">
                  {exportPdfMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PDF
                </button>
                <button onClick={() => { setPublishTitle(script.title); setPublishDesc(script.synopsis); setShowPublishDialog(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors font-medium text-sm border border-amber-200">
                  <Store className="w-4 h-4" />
                  نشر
                </button>
                <button onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ===== LIBRARY VIEW ===== */}
        {viewMode === "library" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-600" />
                مكتبة المسرحيات المحفوظة
              </h2>
              <span className="text-sm text-gray-500">{libraryQuery.data?.length || 0} مسرحية</span>
            </div>

            {libraryQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : !libraryQuery.data || libraryQuery.data.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-purple-100">
                <Theater className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">لا توجد مسرحيات محفوظة بعد</p>
                <button onClick={() => setViewMode("create")} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  أنشئ مسرحيتك الأولى
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraryQuery.data.map((saved: any) => (
                  <div key={saved.id} className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{saved.lessonTitle}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">{saved.subject}</span>
                          <span>{saved.grade}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleFavoriteMutation.mutate({ id: saved.id })}
                        className={`p-1.5 rounded-lg transition-colors ${saved.isFavorite ? "text-red-500 bg-red-50" : "text-gray-300 hover:text-red-400 hover:bg-red-50"}`}>
                        <Heart className={`w-4 h-4 ${saved.isFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(saved.createdAt).toLocaleDateString("ar-TN")}
                      {saved.maskUrls && <span className="flex items-center gap-1 text-pink-500"><Image className="w-3 h-3" /> أقنعة</span>}
                      {saved.assessmentQuestions && <span className="flex items-center gap-1 text-green-500"><HelpCircle className="w-3 h-3" /> تقييم</span>}
                      {saved.isPublished && <span className="flex items-center gap-1 text-amber-500"><Store className="w-3 h-3" /> منشور</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleLoadFromLibrary(saved)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        عرض
                      </button>
                      <button onClick={() => deleteScriptMutation.mutate({ id: saved.id })}
                        disabled={deleteScriptMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !script ? (
          /* ===== INPUT FORM ===== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  معلومات الدرس
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدرس *</label>
                    <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="مثال: الجهاز التنفسي عند الإنسان" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المادة *</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white">
                        <option value="">اختر المادة</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المستوى *</label>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white">
                        <option value="">اختر المستوى</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">محتوى الدرس *</label>
                    <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm min-h-[120px] resize-y"
                      placeholder="اكتب ملخص الدرس أو الأفكار الرئيسية التي تريد تحويلها إلى مسرحية..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقائق)</label>
                      <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                        min={5} max={30} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد التلاميذ</label>
                      <input type="number" value={studentCount} onChange={(e) => setStudentCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                        min={5} max={40} />
                    </div>
                  </div>

                  <button onClick={handleGenerate}
                    disabled={!lessonTitle || !subject || !grade || !lessonContent || generateMutation.isPending}
                    className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> جاري التوليد...</>
                    ) : (
                      <><Wand2 className="w-5 h-5" /> توليد المسرحية</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Tips */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  نصائح للحصول على أفضل نتيجة
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /><span>اكتب محتوى الدرس بالتفصيل للحصول على مسرحية أغنى</span></li>
                  <li className="flex items-start gap-2"><Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /><span>يمكنك توليد أقنعة Line Art للشخصيات وطباعتها</span></li>
                  <li className="flex items-start gap-2"><Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /><span>أسئلة التقييم التكويني تُولّد تلقائياً بعد المسرحية</span></li>
                  <li className="flex items-start gap-2"><Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /><span>احفظ مسرحياتك وانشرها في السوق الذهبي</span></li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  ماذا ستحصل عليه؟
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-purple-500" /> نص مسرحي كامل بالعربية</li>
                  <li className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-blue-500" /> شخصيات مع توزيع تلقائي للأدوار</li>
                  <li className="flex items-center gap-2"><Image className="w-3.5 h-3.5 text-pink-500" /> أقنعة Line Art للطباعة</li>
                  <li className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-green-500" /> قائمة وسائل منخفضة التكلفة</li>
                  <li className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-amber-500" /> أسئلة تقييم تكويني</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* ===== SCRIPT RESULT ===== */
          <div className="space-y-6">
            {/* Script Header */}
            <div className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Theater className="w-6 h-6" />
                    <span className="text-sm opacity-80">مسرحية تعليمية</span>
                    {currentSavedId && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">محفوظة</span>}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{script.title}</h2>
                  <p className="text-sm opacity-90 leading-relaxed max-w-2xl">{script.synopsis}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    {script.duration}
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Users className="w-4 h-4" />
                    {script.characters.length} شخصية
                  </div>
                </div>
              </div>
              
              {/* Action buttons row */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button onClick={handleGenerateMasks} disabled={generateMasksMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {generateMasksMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                  توليد أقنعة
                </button>
                <button onClick={handleGenerateAssessment} disabled={generateAssessmentMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {generateAssessmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                  أسئلة تقييمية
                </button>
                <button onClick={handleAssignRoles} disabled={assignRolesMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                  {assignRolesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  وزّع الأدوار
                </button>
              </div>
            </div>

            {/* Masks Section */}
            {showMasks && masks.length > 0 && (
              <div className="bg-white rounded-2xl border border-pink-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-pink-600" />
                    أقنعة الشخصيات (Line Art)
                  </h3>
                  <button onClick={() => setShowMasks(false)} className="text-gray-400 hover:text-gray-600 text-sm">إخفاء</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {masks.map((mask, idx) => (
                    <div key={idx} className="text-center">
                      {mask.imageUrl ? (
                        <div className="relative group">
                          <img src={mask.imageUrl} alt={mask.characterName} className="w-full rounded-xl border border-gray-200 bg-white" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                            <a href={mask.imageUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                              <Download className="w-4 h-4" />
                            </a>
                            <button onClick={() => window.print()}
                              className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                          <span className="text-xs">فشل التوليد</span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-700 mt-2">{mask.characterName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Questions Section */}
            {showAssessment && assessmentQuestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                    أسئلة التقييم التكويني (بعد العرض)
                  </h3>
                  <button onClick={() => setShowAssessment(false)} className="text-gray-400 hover:text-gray-600 text-sm">إخفاء</button>
                </div>
                <div className="space-y-4">
                  {assessmentQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-2">{q.question}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{q.type === "mcq" ? "اختيار متعدد" : q.type === "open" ? "سؤال مفتوح" : "صح/خطأ"}</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{q.criterion}</span>
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${opt === q.correctAnswer ? "bg-green-100 text-green-800 font-medium" : "bg-gray-50 text-gray-600"}`}>
                                  {opt === q.correctAnswer ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" />}
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {!q.options && (
                            <p className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                              الإجابة المتوقعة: {q.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Warm-up Activity */}
                {script.warmUpActivity && (
                  <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      نشاط التحمية
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">{script.warmUpActivity}</p>
                  </div>
                )}

                {/* Scenes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Play className="w-5 h-5 text-purple-600" />
                    المشاهد
                  </h3>
                  
                  {script.scenes.map((scene, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                      <button onClick={() => setActiveScene(activeScene === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                            {scene.number}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">{scene.title}</div>
                            <div className="text-xs text-gray-500">{scene.dialogue.length} حوار</div>
                          </div>
                        </div>
                        {activeScene === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      
                      {activeScene === idx && (
                        <div className="px-4 pb-4 space-y-3">
                          {scene.setting && (
                            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                              <Palette className="w-3 h-3 inline ml-1" />
                              المكان: {scene.setting}
                            </div>
                          )}
                          {scene.directorNotes && (
                            <div className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg italic">
                              ملاحظات المخرج: {scene.directorNotes}
                            </div>
                          )}
                          <div className="space-y-2">
                            {scene.dialogue.map((d, di) => (
                              <div key={di} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold whitespace-nowrap">{d.character}</span>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">{d.line}</p>
                                  {d.action && <p className="text-xs text-gray-400 mt-1 italic">({d.action})</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          {scene.audienceInteraction && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                              <MessageCircle className="w-3 h-3 inline ml-1" />
                              تفاعل الجمهور: {scene.audienceInteraction}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Debrief Questions */}
                {script.debriefQuestions && script.debriefQuestions.length > 0 && (
                  <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      أسئلة النقاش بعد المسرحية
                    </h3>
                    <ul className="space-y-2">
                      {script.debriefQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                          <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Characters */}
                <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    الشخصيات
                  </h3>
                  <div className="space-y-2">
                    {script.characters.map((char, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">{char.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            char.difficulty === "easy" ? "bg-green-100 text-green-700" :
                            char.difficulty === "hard" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {char.difficulty === "easy" ? "سهل" : char.difficulty === "hard" ? "متقدم" : "متوسط"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{char.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Assignments */}
                {showRoles && roles.length > 0 && (
                  <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      توزيع الأدوار
                    </h3>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {roles.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 text-sm">
                          <span className="text-gray-600">تلميذ {r.studentNumber}</span>
                          <span className="font-medium text-blue-700 text-xs">{r.characterName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Props */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    الوسائل المطلوبة
                  </h3>
                  <div className="space-y-2">
                    {script.props.map((prop, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-green-50/50 border border-green-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">{prop.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            prop.cost === "مجاني" ? "bg-green-100 text-green-700" :
                            prop.cost === "منخفض" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{prop.cost}</span>
                        </div>
                        <p className="text-xs text-gray-500">{prop.description}</p>
                        {prop.alternatives && (
                          <p className="text-xs text-green-600 mt-1">
                            <Lightbulb className="w-3 h-3 inline ml-1" />
                            بديل: {prop.alternatives}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Educational Objectives */}
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    الأهداف التعليمية
                  </h3>
                  <ul className="space-y-2">
                    {script.educationalObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPublishDialog(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" />
              نشر في السوق الذهبي
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المنشور *</label>
                <input type="text" value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف المحتوى</label>
                <textarea value={publishDesc} onChange={(e) => setPublishDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm min-h-[80px] resize-y" />
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                <Share2 className="w-3.5 h-3.5 inline ml-1" />
                سيتم ربط المنشور بملفك المهني واسم مدرستك تلقائياً
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handlePublish} disabled={!publishTitle || publishToMarketMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-l from-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {publishToMarketMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                  نشر
                </button>
                <button onClick={() => setShowPublishDialog(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
