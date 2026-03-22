import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Lightbulb,
  Palette,
  MessageSquare,
  ArrowLeft,
  Wand2,
  GraduationCap,
  Brain,
  Heart,
  Zap,
  Settings2,
  History,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ===== DIFFICULTY TYPES =====
const DIFFICULTY_TYPES = [
  { id: "dyslexia", nameAr: "عسر القراءة", icon: "📖", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "dysgraphia", nameAr: "عسر الكتابة", icon: "✏️", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "dyscalculia", nameAr: "عسر الحساب", icon: "🔢", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "adhd", nameAr: "فرط النشاط وتشتت الانتباه", icon: "⚡", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { id: "autism", nameAr: "اضطراب طيف التوحد", icon: "🧩", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  { id: "intellectual", nameAr: "صعوبات ذهنية", icon: "🧠", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { id: "slow_learner", nameAr: "بطء التعلم", icon: "🐢", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { id: "visual_impairment", nameAr: "ضعف البصر", icon: "👁️", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
];

const ADAPTATION_LEVELS = [
  { id: "light" as const, nameAr: "خفيف", desc: "تبسيط بسيط مع الحفاظ على المحتوى", icon: "🌤️", color: "border-green-500/30 bg-green-500/5" },
  { id: "moderate" as const, nameAr: "متوسط", desc: "إعادة صياغة شاملة مع أمثلة ملموسة", icon: "⛅", color: "border-yellow-500/30 bg-yellow-500/5" },
  { id: "intensive" as const, nameAr: "مكثف", desc: "إعادة بناء كاملة بأبسط صورة", icon: "🌧️", color: "border-red-500/30 bg-red-500/5" },
];

const SUBJECTS = [
  "اللغة العربية", "الرياضيات", "العلوم", "الإيقاظ العلمي",
  "اللغة الفرنسية", "اللغة الإنجليزية", "التربية الإسلامية",
  "التاريخ والجغرافيا", "التربية المدنية", "التربية التكنولوجية",
  "التربية الفنية", "التربية البدنية", "أخرى",
];

const GRADE_LEVELS = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
  "السنة السابعة أساسي", "السنة الثامنة أساسي", "السنة التاسعة أساسي",
  "أخرى",
];

export default function ContentAdapter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"adapt" | "history">("adapt");

  // Form state
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficultyType, setDifficultyType] = useState("");
  const [adaptationLevel, setAdaptationLevel] = useState<"light" | "moderate" | "intensive">("moderate");

  // Result state
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true, instructions: false, visual: false, notes: false
  });

  // History state
  const [historyViewId, setHistoryViewId] = useState<number | null>(null);

  // Queries
  const statsQuery = trpc.contentAdapter.getStats.useQuery(undefined, { enabled: !!user });
  const historyQuery = trpc.contentAdapter.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!user && activeTab === "history" }
  );
  const historyItemQuery = trpc.contentAdapter.getById.useQuery(
    { id: historyViewId! },
    { enabled: !!historyViewId }
  );

  // Mutations
  const adaptMutation = trpc.contentAdapter.adaptContent.useMutation({
    onSuccess: (data) => {
      setResultData(data);
      setShowResult(true);
      statsQuery.refetch();
      toast.success("تم تكييف المحتوى بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تكييف المحتوى");
    },
  });

  const deleteMutation = trpc.contentAdapter.deleteContent.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      statsQuery.refetch();
      toast.success("تم حذف المحتوى المكيّف");
    },
  });

  const handleAdapt = () => {
    if (!originalTitle.trim()) { toast.error("يرجى إدخال عنوان الدرس"); return; }
    if (!originalContent.trim()) { toast.error("يرجى إدخال محتوى الدرس"); return; }
    if (!difficultyType) { toast.error("يرجى اختيار نوع الصعوبة"); return; }

    adaptMutation.mutate({
      originalTitle,
      originalContent,
      subject: subject || undefined,
      gradeLevel: gradeLevel || undefined,
      difficultyType,
      adaptationLevel,
    });
  };

  const resetForm = () => {
    setOriginalTitle("");
    setOriginalContent("");
    setSubject("");
    setGradeLevel("");
    setDifficultyType("");
    setAdaptationLevel("moderate");
    setShowResult(false);
    setResultData(null);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedDifficulty = useMemo(() => DIFFICULTY_TYPES.find(d => d.id === difficultyType), [difficultyType]);

  // ===== NOT LOGGED IN =====
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
        <div className="container max-w-4xl py-20 text-center">
          <div className="text-6xl mb-6">🔄</div>
          <h1 className="text-3xl font-bold mb-4">مكيّف المحتوى التعليمي</h1>
          <p className="text-lg text-slate-400 mb-8">حوّل أي درس إلى نسخة مكيّفة تناسب التلاميذ ذوي صعوبات التعلم</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2">
              <ArrowRight className="h-5 w-5" />
              سجّل الدخول للبدء
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // ===== VIEWING HISTORY ITEM =====
  if (historyViewId && historyItemQuery.data) {
    const item = historyItemQuery.data;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
        <div className="container max-w-5xl py-8">
          <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white" onClick={() => setHistoryViewId(null)}>
            <ArrowLeft className="h-4 w-4 ml-2" /> العودة للسجل
          </Button>
          <ResultDisplay data={item} expandedSections={expandedSections} toggleSection={toggleSection} />
        </div>
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container max-w-6xl py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/learning-support">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 ml-1" /> أدوات ذوي الصعوبات
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔄</span>
                  <h1 className="text-2xl font-bold bg-gradient-to-l from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    مكيّف المحتوى التعليمي
                  </h1>
                </div>
                <p className="text-sm text-slate-400 mt-1">حوّل أي درس إلى نسخة مبسّطة ومكيّفة لذوي صعوبات التعلم</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-slate-300">{statsQuery.data?.totalAdaptations || 0} تكييف</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "adapt" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("adapt")}
              className={activeTab === "adapt" ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-400"}
            >
              <Wand2 className="h-4 w-4 ml-1" /> تكييف جديد
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className={activeTab === "history" ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-400"}
            >
              <History className="h-4 w-4 ml-1" /> السجل
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        {activeTab === "adapt" ? (
          showResult && resultData ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-emerald-400">نتيجة التكييف</h2>
                <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Wand2 className="h-4 w-4" /> تكييف جديد
                </Button>
              </div>
              <ResultDisplay data={resultData} expandedSections={expandedSections} toggleSection={toggleSection} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Lesson Input */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      محتوى الدرس الأصلي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">عنوان الدرس *</label>
                      <Input
                        value={originalTitle}
                        onChange={(e) => setOriginalTitle(e.target.value)}
                        placeholder="مثال: درس الكسور - السنة الرابعة"
                        className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                        dir="rtl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">المادة</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white px-3 py-2 text-sm"
                        >
                          <option value="">اختر المادة</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">المستوى</label>
                        <select
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value)}
                          className="w-full rounded-md bg-slate-800/50 border border-slate-600/50 text-white px-3 py-2 text-sm"
                        >
                          <option value="">اختر المستوى</option>
                          {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">محتوى الدرس * (انسخ والصق محتوى الدرس هنا)</label>
                      <Textarea
                        value={originalContent}
                        onChange={(e) => setOriginalContent(e.target.value)}
                        placeholder="الصق هنا محتوى الدرس الذي تريد تكييفه...&#10;&#10;يمكنك نسخ النص من الكتاب المدرسي أو المذكرة البيداغوجية أو أي مصدر آخر."
                        className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 min-h-[200px] resize-y"
                        dir="rtl"
                      />
                      <p className="text-xs text-slate-500 mt-1">{originalContent.length} حرف</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Type */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                      <Brain className="h-5 w-5 text-purple-400" />
                      نوع الصعوبة *
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DIFFICULTY_TYPES.map(d => (
                        <button
                          key={d.id}
                          onClick={() => setDifficultyType(d.id)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            difficultyType === d.id
                              ? `${d.color} border-2 scale-[1.02] shadow-lg`
                              : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-2xl mb-1">{d.icon}</div>
                          <div className="text-xs font-medium">{d.nameAr}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Adaptation Level */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                      <Settings2 className="h-5 w-5 text-yellow-400" />
                      مستوى التكييف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ADAPTATION_LEVELS.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setAdaptationLevel(level.id)}
                          className={`p-4 rounded-xl border text-right transition-all ${
                            adaptationLevel === level.id
                              ? `${level.color} border-2 scale-[1.02] shadow-lg`
                              : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-2xl mb-2">{level.icon}</div>
                          <div className="font-bold text-sm mb-1">{level.nameAr}</div>
                          <div className="text-xs opacity-70">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  onClick={handleAdapt}
                  disabled={adaptMutation.isPending || !originalTitle || !originalContent || !difficultyType}
                  className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg font-bold gap-3 disabled:opacity-50"
                >
                  {adaptMutation.isPending ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      جاري تكييف المحتوى... (قد يستغرق 15-30 ثانية)
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-6 w-6" />
                      كيّف المحتوى الآن
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Info Sidebar */}
              <div className="space-y-6">
                {/* How it works */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      كيف يعمل المكيّف؟
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { step: "1", text: "أدخل محتوى الدرس الأصلي", icon: "📝" },
                      { step: "2", text: "اختر نوع صعوبة التعلم", icon: "🎯" },
                      { step: "3", text: "حدد مستوى التكييف المطلوب", icon: "⚙️" },
                      { step: "4", text: "احصل على النسخة المكيّفة فوراً", icon: "✨" },
                    ].map(s => (
                      <div key={s.step} className="flex items-center gap-3">
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-sm text-slate-300">{s.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* What you get */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ماذا ستحصل؟
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "محتوى مكيّف حسب نوع الصعوبة",
                      "تعليمات مبسّطة خطوة بخطوة",
                      "اقتراحات دعم بصري",
                      "ملاحظات تكييف (ماذا تغيّر ولماذا)",
                      "نصائح عملية للمعلم",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Selected difficulty info */}
                {selectedDifficulty && (
                  <Card className={`border ${selectedDifficulty.color}`}>
                    <CardContent className="pt-4">
                      <div className="text-3xl mb-2">{selectedDifficulty.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{selectedDifficulty.nameAr}</h3>
                      <p className="text-xs text-slate-400">
                        سيتم تكييف المحتوى وفقاً لاحتياجات التلاميذ ذوي {selectedDifficulty.nameAr} مع مراعاة الإرشادات البيداغوجية المتخصصة.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )
        ) : (
          /* History Tab */
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-400" />
              سجل التكييفات ({historyQuery.data?.total || 0})
            </h2>

            {historyQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400">جاري التحميل...</p>
              </div>
            ) : !historyQuery.data?.items.length ? (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="py-12 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-lg font-bold text-slate-300 mb-2">لا توجد تكييفات سابقة</h3>
                  <p className="text-slate-400 mb-4">ابدأ بتكييف أول درس لك!</p>
                  <Button onClick={() => setActiveTab("adapt")} className="bg-emerald-600 hover:bg-emerald-700">
                    <Wand2 className="h-4 w-4 ml-2" /> تكييف جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyQuery.data.items.map(item => {
                  const diff = DIFFICULTY_TYPES.find(d => d.id === item.difficultyType);
                  return (
                    <Card key={item.id} className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{diff?.icon || "📄"}</span>
                            <div>
                              <h3 className="font-bold text-sm text-slate-200 line-clamp-1">{item.originalTitle}</h3>
                              <p className="text-xs text-slate-500">{diff?.nameAr}</p>
                            </div>
                          </div>
                          <Badge variant={item.status === "completed" ? "default" : "destructive"} className="text-xs">
                            {item.status === "completed" ? "مكتمل" : item.status === "pending" ? "قيد المعالجة" : "فشل"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          {item.subject && <span className="bg-slate-800 px-2 py-0.5 rounded">{item.subject}</span>}
                          {item.gradeLevel && <span className="bg-slate-800 px-2 py-0.5 rounded">{item.gradeLevel}</span>}
                          <span>{new Date(item.createdAt).toLocaleDateString("ar-TN")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === "completed" && (
                            <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 text-xs"
                              onClick={() => setHistoryViewId(item.id)}>
                              <Eye className="h-3.5 w-3.5 ml-1" /> عرض
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs"
                            onClick={() => {
                              if (confirm("هل تريد حذف هذا التكييف؟")) {
                                deleteMutation.mutate({ id: item.id });
                              }
                            }}>
                            <Trash2 className="h-3.5 w-3.5 ml-1" /> حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== RESULT DISPLAY COMPONENT =====
function ResultDisplay({ data, expandedSections, toggleSection }: {
  data: any;
  expandedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
}) {
  const diff = DIFFICULTY_TYPES.find(d => d.id === data.difficultyType);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-l from-emerald-900/30 to-teal-900/30 border-emerald-700/30">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{diff?.icon || "📄"}</span>
                <Badge className={diff?.color || ""}>{diff?.nameAr || data.difficultyType}</Badge>
                <Badge variant="outline" className="text-slate-400 border-slate-600">
                  {data.adaptationLevel === "light" ? "تكييف خفيف" : data.adaptationLevel === "moderate" ? "تكييف متوسط" : "تكييف مكثف"}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{data.adaptedTitle || data.originalTitle}</h2>
              <p className="text-sm text-slate-400">
                {data.subject && <span className="ml-3">{data.subject}</span>}
                {data.gradeLevel && <span>{data.gradeLevel}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {new Date(data.createdAt).toLocaleDateString("ar-TN")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adapted Content */}
      <CollapsibleSection
        title="المحتوى المكيّف"
        icon={<BookOpen className="h-5 w-5 text-emerald-400" />}
        isOpen={expandedSections.content}
        onToggle={() => toggleSection("content")}
        color="emerald"
      >
        <div
          className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: data.adaptedContentText || "<p>لا يوجد محتوى</p>" }}
        />
      </CollapsibleSection>

      {/* Simplified Instructions */}
      {data.simplifiedInstructions?.length > 0 && (
        <CollapsibleSection
          title="تعليمات مبسّطة"
          icon={<Lightbulb className="h-5 w-5 text-yellow-400" />}
          isOpen={expandedSections.instructions}
          onToggle={() => toggleSection("instructions")}
          color="yellow"
        >
          <div className="space-y-2">
            {data.simplifiedInstructions.map((inst: string, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/30 rounded-lg p-3">
                <span className="bg-yellow-500/20 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300">{inst}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Visual Supports */}
      {data.visualSupports?.length > 0 && (
        <CollapsibleSection
          title="اقتراحات الدعم البصري"
          icon={<Palette className="h-5 w-5 text-purple-400" />}
          isOpen={expandedSections.visual}
          onToggle={() => toggleSection("visual")}
          color="purple"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.visualSupports.map((vs: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                <Eye className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{vs}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Adaptation Notes */}
      {data.adaptationNotes && (
        <CollapsibleSection
          title="ملاحظات التكييف ونصائح المعلم"
          icon={<MessageSquare className="h-5 w-5 text-blue-400" />}
          isOpen={expandedSections.notes}
          onToggle={() => toggleSection("notes")}
          color="blue"
        >
          <div className="space-y-4">
            {data.adaptationNotes.whatChanged?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" /> ما تم تغييره
                </h4>
                <ul className="space-y-1">
                  {data.adaptationNotes.whatChanged.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.adaptationNotes.whyChanged?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" /> لماذا تم التغيير
                </h4>
                <ul className="space-y-1">
                  {data.adaptationNotes.whyChanged.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.adaptationNotes.teacherTips?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-400" /> نصائح للمعلم
                </h4>
                <ul className="space-y-1">
                  {data.adaptationNotes.teacherTips.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 text-center">
        <p className="text-xs text-slate-500">
          ⚠️ هذه أداة مساعدة تعتمد على الذكاء الاصطناعي. يُنصح بمراجعة المحتوى المكيّف قبل استخدامه مع التلاميذ.
          التكييف لا يُغني عن التشخيص المتخصص أو التدخل الطبي.
        </p>
      </div>
    </div>
  );
}

// ===== COLLAPSIBLE SECTION COMPONENT =====
function CollapsibleSection({ title, icon, isOpen, onToggle, color, children }: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-slate-200">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
      </button>
      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4 border-t border-slate-700/30">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
