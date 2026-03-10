import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import {
  Wand2, Copy, Download, ArrowRight, Loader2, BookOpen,
  GraduationCap, Sparkles, CheckCircle, FileText, Brain,
  ChevronLeft, RotateCcw, Lightbulb, Target, Clock, Users,
} from "lucide-react";

const LEVELS = [
  { value: "ابتدائي", label: "ابتدائي (Primaire)", icon: "🏫" },
  { value: "إعدادي", label: "إعدادي (Collège)", icon: "📚" },
  { value: "ثانوي", label: "ثانوي (Lycée)", icon: "🎓" },
];

const QUICK_SUBJECTS = [
  "الرياضيات", "العلوم", "اللغة العربية", "اللغة الفرنسية",
  "التاريخ والجغرافيا", "التربية الإسلامية", "الفيزياء", "الكيمياء",
];

const EXAMPLE_TOPICS = [
  { subject: "الرياضيات", topic: "الكسور العشرية", level: "ابتدائي" },
  { subject: "العلوم", topic: "التكاثر عند النباتات", level: "إعدادي" },
  { subject: "الفيزياء", topic: "قوانين نيوتن", level: "ثانوي" },
];

const TIPS = [
  { icon: Target, text: "حدّد الهدف بدقة للحصول على جذاذة أكثر تركيزاً" },
  { icon: Lightbulb, text: "أضف السياق التونسي (أمثلة محلية) في حقل الأهداف" },
  { icon: Clock, text: "يمكنك تحديد مدة الحصة في حقل الأهداف الاختياري" },
  { icon: Users, text: "ذكر عدد التلاميذ يساعد في تصميم الأنشطة" },
];

export default function EduGPT() {
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  // Pre-fill from URL params (e.g., from Curriculum GPS "Prepare this lesson" button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSubject = params.get("subject");
    const urlGrade = params.get("grade");
    const urlLesson = params.get("lesson");
    if (urlSubject) setSubject(urlSubject);
    if (urlLesson) setTopic(urlLesson);
    if (urlGrade) {
      const gradeLower = urlGrade.toLowerCase();
      if (gradeLower.includes("ابتدائي") || gradeLower.includes("primary")) setLevel("ابتدائي");
      else if (gradeLower.includes("إعدادي") || gradeLower.includes("middle")) setLevel("إعدادي");
      else if (gradeLower.includes("ثانوي") || gradeLower.includes("secondary")) setLevel("ثانوي");
    }
  }, []);
  const [objectives, setObjectives] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const generateMutation = trpc.edugpt.generateLesson.useMutation({
    onSuccess: (data) => {
      setResult(data.content);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء التوليد: " + err.message);
    },
  });

  const exportPdfMutation = trpc.edugpt.exportLessonAsPdf.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data.base64}`;
      link.download = `جذاذة-${subject}-${topic}.pdf`;
      link.click();
      toast.success("تم تحميل الجذاذة بصيغة PDF");
    },
    onError: () => toast.error("فشل تصدير PDF"),
  });

  const handleGenerate = () => {
    if (!level || !subject.trim() || !topic.trim()) {
      toast.error("يرجى ملء حقول المستوى والمادة وموضوع الدرس");
      return;
    }
    setResult("");
    generateMutation.mutate({ level, subject, topic, objectives });
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("تم نسخ الجذاذة إلى الحافظة");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (!result) return;
    exportPdfMutation.mutate({ content: result, subject, topic, level });
  };

  const handleReset = () => {
    setLevel("");
    setSubject("");
    setTopic("");
    setObjectives("");
    setResult("");
  };

  const handleQuickExample = (ex: typeof EXAMPLE_TOPICS[0]) => {
    setLevel(ex.level);
    setSubject(ex.subject);
    setTopic(ex.topic);
  };

  // ===== المتفقد الذكي =====
  const [inspectText, setInspectText] = useState("");
  const [inspectReport, setInspectReport] = useState("");
  const [inspectTab, setInspectTab] = useState<"generate" | "inspect">("generate");
  const [inspectCopied, setInspectCopied] = useState(false);
  const inspectReportRef = useRef<HTMLDivElement>(null);

  const inspectMutation = trpc.edugpt.inspectLesson.useMutation({
    onSuccess: (data) => {
      const reportText = typeof data.report === "string" ? data.report : String(data.report ?? "");
      setInspectReport(reportText);
      setTimeout(() => inspectReportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء التحليل: " + err.message);
    },
  });

  const handleInspect = () => {
    if (!inspectText.trim() || inspectText.trim().length < 50) {
      toast.error("يرجى لصق نص الجذاذة (لا يقل عن 50 حرفاً)");
      return;
    }
    setInspectReport("");
    inspectMutation.mutate({ lessonText: inspectText });
  };

  const handleInspectCopy = async () => {
    if (!inspectReport) return;
    await navigator.clipboard.writeText(inspectReport);
    setInspectCopied(true);
    toast.success("تم نسخ تقرير التفقد إلى الحافظة");
    setTimeout(() => setInspectCopied(false), 2000);
  };

  const isLoading = generateMutation.isPending;
  const hasResult = !!result;

  return (
    <div className="min-h-screen" style={{ background: "#F0F4FF" }} dir="rtl">

      {/* ===== TOP NAV ===== */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ background: "#1A237E" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png"
                alt="Leader Academy"
                className="h-7 w-auto"
              />
              <span className="text-sm font-medium hidden sm:inline">Leader Academy</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(255,109,0,0.2)", color: "#FFB74D", border: "1px solid rgba(255,109,0,0.3)" }}>
              <Brain className="w-3.5 h-3.5" />
              <span>EDUGPT</span>
            </div>
            <Link href="/assistant">
              <Button size="sm" variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10 h-8 text-xs">
                <BookOpen className="w-3.5 h-3.5 ml-1" />
                المساعد الكامل
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== PAGE HEADER ===== */}
      <div style={{ background: "linear-gradient(135deg, #1A237E 0%, #1565C0 100%)" }} className="pb-16 pt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ background: "rgba(255,109,0,0.2)", color: "#FFB74D", border: "1px solid rgba(255,109,0,0.3)" }}>
            <Sparkles className="w-4 h-4" />
            <span>مدعوم بالذكاء الاصطناعي — متوافق مع البرامج التونسية 2026</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>
            EDUGPT: مساعدك الذكي لتصميم الجذاذات التربوية
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            أدخل بيانات درسك وسيُنشئ لك الذكاء الاصطناعي جذاذة احترافية كاملة في ثوانٍ
          </p>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ===== LEFT PANEL: FORM ===== */}
          <div className="lg:col-span-2 space-y-4">

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #F8F9FF, #EEF2FF)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>بيانات الجذاذة</h2>
                  <p className="text-gray-500 text-xs">أدخل تفاصيل الدرس</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Level */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" style={{ color: "#1A237E" }} />
                    المستوى التعليمي
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-xl">
                      <SelectValue placeholder="اختر المستوى..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          <span className="flex items-center gap-2">
                            <span>{l.icon}</span>
                            <span>{l.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" style={{ color: "#1A237E" }} />
                    المادة
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="مثال: الرياضيات، العلوم، اللغة العربية..."
                    className="h-11 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  {/* Quick subject chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_SUBJECTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSubject(s)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${subject === s ? "text-white" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}
                        style={subject === s ? { background: "#1A237E" } : {}}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Target className="w-4 h-4" style={{ color: "#1A237E" }} />
                    موضوع الدرس
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: الكسور العشرية، التكاثر عند النباتات..."
                    className="h-11 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                </div>

                {/* Objectives (optional) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" style={{ color: "#FF6D00" }} />
                    أهداف الدرس
                    <span className="text-gray-400 text-xs font-normal">(اختياري)</span>
                  </Label>
                  <Textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="مثال: أن يتعرف التلميذ على... أن يحسب... أن يطبق... (يمكنك ذكر مدة الحصة وعدد التلاميذ)"
                    className="min-h-[90px] border-gray-200 focus:border-blue-400 rounded-xl resize-none text-sm"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !level || !subject.trim() || !topic.trim()}
                  className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:scale-100"
                  style={{ background: isLoading ? "#9E9E9E" : "linear-gradient(135deg, #FF6D00, #FF8F00)", color: "white", boxShadow: isLoading ? "none" : "0 4px 20px rgba(255,109,0,0.35)" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 ml-2" />
                      توليد جذاذة احترافية
                    </>
                  )}
                </Button>

                {hasResult && (
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    className="w-full h-9 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 ml-1.5" />
                    إعادة تعيين
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Examples Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#FF6D00" }} />
                أمثلة سريعة
              </h3>
              <div className="space-y-2">
                {EXAMPLE_TOPICS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickExample(ex)}
                    className="w-full text-right p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ex.topic}</p>
                        <p className="text-xs text-gray-500">{ex.subject} — {ex.level}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-2xl p-5 border" style={{ background: "rgba(26,35,126,0.04)", borderColor: "rgba(26,35,126,0.1)" }}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                <Lightbulb className="w-4 h-4" style={{ color: "#FF6D00" }} />
                نصائح للحصول على أفضل نتيجة
              </h3>
              <ul className="space-y-2">
                {TIPS.map((tip, i) => {
                  const Icon = tip.icon;
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#1A237E" }} />
                      <span>{tip.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ===== RIGHT PANEL: RESULT ===== */}
          <div className="lg:col-span-3" ref={resultRef}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">

              {/* Result header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #F8F9FF, #EEF2FF)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: hasResult ? "linear-gradient(135deg, #FF6D00, #FF8F00)" : "#E5E7EB" }}>
                    {hasResult ? <CheckCircle className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>
                      {hasResult ? `جذاذة: ${subject} — ${topic}` : "منطقة عرض الجذاذة"}
                    </h2>
                    <p className="text-gray-500 text-xs">
                      {hasResult ? `المستوى: ${level}` : "ستظهر الجذاذة المُولَّدة هنا"}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                {hasResult && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs gap-1.5 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "تم النسخ!" : "نسخ"}
                    </Button>
                    <Button
                      onClick={handleExportPdf}
                      disabled={exportPdfMutation.isPending}
                      size="sm"
                      className="h-8 px-3 text-xs gap-1.5 text-white"
                      style={{ background: "#1A237E" }}
                    >
                      {exportPdfMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      تحميل PDF
                    </Button>
                  </div>
                )}
              </div>

              {/* Result body */}
              <div className="flex-1 p-6">
                {isLoading ? (
                  /* Loading state */
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,109,0,0.1)" }}>
                        <Wand2 className="w-10 h-10 animate-pulse" style={{ color: "#FF6D00" }} />
                      </div>
                      <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#FF6D00" }} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800 text-lg mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                        الذكاء الاصطناعي يُصمّم جذاذتك...
                      </p>
                      <p className="text-gray-500 text-sm">يتم الآن تحليل البرنامج الرسمي التونسي وتوليد الجذاذة</p>
                    </div>
                    <div className="flex gap-2">
                      {["تحليل الأهداف", "تصميم الأنشطة", "صياغة التقييم"].map((step, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(26,35,126,0.06)", color: "#1A237E" }}>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hasResult ? (
                  /* Result content */
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    <Streamdown>{result}</Streamdown>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="h-full flex flex-col items-center justify-center gap-6 py-12">
                    {/* Decorative illustration */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EEF2FF, #E8EAF6)" }}>
                        <FileText className="w-14 h-14" style={{ color: "#C5CAE9" }} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
                        <Wand2 className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="text-center max-w-sm">
                      <h3 className="font-bold text-gray-700 text-xl mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                        جاهز لتوليد جذاذتك
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        أدخل بيانات الدرس في النموذج على اليسار ثم اضغط على زر "توليد جذاذة احترافية"
                      </p>
                    </div>

                    {/* Feature badges */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                      {[
                        { icon: "📋", text: "جذاذة كاملة الأقسام" },
                        { icon: "🇹🇳", text: "متوافقة مع البرامج 2026" },
                        { icon: "⚡", text: "توليد في أقل من 30 ثانية" },
                        { icon: "📄", text: "قابلة للتحميل PDF" },
                      ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50">
                          <span className="text-lg">{badge.icon}</span>
                          <span className="text-xs text-gray-600 font-medium">{badge.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Result footer (only when result exists) */}
              {hasResult && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between" style={{ background: "#FAFBFF" }}>
                  <p className="text-xs text-gray-400">
                    ✅ تم التوليد بنجاح — يمكنك نسخ الجذاذة أو تحميلها بصيغة PDF
                  </p>
                  <Link href="/assistant">
                    <button className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: "#1A237E" }}>
                      <Brain className="w-3.5 h-3.5" />
                      فتح في المساعد الكامل
                    </button>
                  </Link>
                </div>
              )}
            </div>{/* end grid */}
          </div>{/* end main content */}
        </div>{/* end outer card */}
      </div>{/* end max-w-7xl */}

      {/* ===== المتفقد الذكي سكشن ===== */}
      <div className="max-w-7xl mx-auto px-4 pb-16 mt-10">
        <div className="rounded-2xl overflow-hidden shadow-xl border-2" style={{ borderColor: "#1A237E", background: "white" }}>

          {/* Header المتفقد */}
          <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #1A237E 0%, #283593 100%)" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: "rgba(255,109,0,0.2)", border: "2px solid #FF6D00" }}>
                👨‍🏫
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">عرض على المتفقد الذكي</h2>
                <p className="text-blue-200 text-sm mt-0.5">تقرير تفقد رسمي بمعايير وزارة التربية التونسية — رتبة مميز، 30 سنة خبرة</p>
              </div>
              <div className="mr-auto flex gap-2">
                {[
                  { icon: "✅", text: "انسجام بيداغوجي" },
                  { icon: "📊", text: "تمشّي الحصة" },
                  { icon: "🎯", text: "دقة علمية" },
                  { icon: "🏆", text: "قرار نهائي" },
                ].map((badge, i) => (
                  <div key={i} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* محتوى */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* يسار: منطقة الإدخال */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A237E" }}>
                  📝 الصق نص الجذاذة أو المذكرة هنا:
                </label>
                <Textarea
                  value={inspectText}
                  onChange={(e) => setInspectText(e.target.value)}
                  placeholder="الصق نص جذاذتك أو مذكرتك هنا... سيقوم المتفقد الذكي بتحليلها وإعطائك تقرير تفقد رسمي شاملاً."
                  className="w-full text-sm resize-none border-2 focus:ring-2"
                  style={{ minHeight: "280px", borderColor: "#C5CAE9", fontFamily: "Cairo, sans-serif", direction: "rtl" }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{inspectText.length} حرف (50 حرف كحد أدنى)</p>
                  {inspectText && (
                    <button onClick={() => setInspectText("")} className="text-xs text-red-400 hover:text-red-600">حذف النص</button>
                  )}
                </div>

                <Button
                  onClick={handleInspect}
                  disabled={inspectMutation.isPending || inspectText.trim().length < 50}
                  className="w-full mt-4 h-12 text-base font-bold rounded-xl shadow-lg transition-all"
                  style={{ background: inspectMutation.isPending ? "#9E9E9E" : "linear-gradient(135deg, #FF6D00 0%, #FF8F00 100%)", color: "white" }}
                >
                  {inspectMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin ml-2" />جاري التحليل... (قد يستغرق 30 ثانية)</>
                  ) : (
                    <><span className="ml-2 text-xl">👨‍🏫</span>عرض على المتفقد الذكي</>
                  )}
                </Button>

                {/* تعليمات */}
                <div className="mt-4 p-4 rounded-xl border border-blue-100" style={{ background: "#EEF2FF" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#1A237E" }}>💡 ماذا يحلّل المتفقد؟</p>
                  <ul className="space-y-1">
                    {[
                      "الانسجام بين الأهداف والكفايات",
                      "تمشّي الحصة ومحورية المتعلّم",
                      "الدقة العلمية واللغوية",
                      "هندسة الاختبارات (سند، تعليمة، معيار)",
                      "الإبداع الرقمي ودمج الذكاء الاصطناعي",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: "#3949AB" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF6D00" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* يمين: تقرير التفقد */}
              <div ref={inspectReportRef}>
                {inspectMutation.isPending ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed" style={{ borderColor: "#FF6D00", background: "#FFF8F0" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-pulse" style={{ background: "rgba(255,109,0,0.1)" }}>
                      👨‍🏫
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: "#1A237E" }}>المتفقد يقرأ ويحلّل...</p>
                      <p className="text-sm text-gray-500 mt-1">جاري إعداد تقرير التفقد الرسمي</p>
                    </div>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF6D00" }} />
                  </div>
                ) : inspectReport ? (
                  <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#1A237E" }}>
                    {/* رأس التقرير */}
                    <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#1A237E" }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📜</span>
                        <div>
                          <p className="text-white font-bold text-sm">تقرير التفقد الرسمي</p>
                          <p className="text-blue-200 text-xs">وزارة التربية التونسية — رتبة مميز</p>
                        </div>
                      </div>
                      <button
                        onClick={handleInspectCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: inspectCopied ? "#4CAF50" : "rgba(255,255,255,0.2)", color: "white" }}
                      >
                        {inspectCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {inspectCopied ? "تم النسخ" : "نسخ التقرير"}
                      </button>
                    </div>
                    {/* محتوى التقرير */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: "500px", background: "#FAFBFF", fontFamily: "Cairo, sans-serif", direction: "rtl" }}>
                      <Streamdown>{inspectReport}</Streamdown>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed" style={{ borderColor: "#C5CAE9", background: "#F8F9FF", minHeight: "300px" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "rgba(26,35,126,0.08)" }}>
                      👨‍🏫
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: "#1A237E" }}>المتفقد الذكي في خدمتك</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">الصق نص جذاذتك واضغط على الزر للحصول على تقرير تفقد رسمي شامل</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      {[
                        { icon: "📜", text: "توطئة تربوية" },
                        { icon: "✅", text: "نقاط القوة" },
                        { icon: "⚠️", text: "إخلالات" },
                        { icon: "🏆", text: "قرار نهائي" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-white text-xs text-gray-600">
                          <span>{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
