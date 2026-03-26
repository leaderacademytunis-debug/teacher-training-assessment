import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  FileText,
  Loader2,
  Copy,
  CheckCheck,
  Search,
  Star,
  AlertTriangle,
  ThumbsUp,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { Streamdown } from "streamdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "lesson" | "exam" | "planning" | "other";

interface Tab {
  id: TabId;
  icon: typeof BookOpen;
  labelAr: string;
  labelFr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  placeholder: string;
  hint: string;
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  {
    id: "lesson",
    icon: BookOpen,
    labelAr: "مذكرة / جذاذة",
    labelFr: "Fiche de cours",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "تقييم مذكرة الدرس وفق معايير التفقد الرسمية التونسية",
    placeholder: "الصق هنا نص مذكرة الدرس كاملةً أو أبرز محاورها الأساسية (المادة، المستوى، الكفايات، الأهداف، مراحل الدرس، التقييم...)",
    hint: "💡 كلما كانت المذكرة أكثر تفصيلاً، كان التقرير أكثر دقةً وعمقاً.",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    labelAr: "اختبار / فرض",
    labelFr: "Épreuve / Devoir",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "تقييم ورقة الاختبار من حيث الصياغة والتدرج والتغطية البرامجية",
    placeholder: "الصق هنا نص الاختبار كاملاً (المادة، المستوى، الفصل، الأسئلة، التنقيط...)",
    hint: "💡 أدرج التعليمات والمعامل والمدة لتقرير أكثر شمولاً.",
  },
  {
    id: "planning",
    icon: CalendarDays,
    labelAr: "توزيع / تخطيط سنوي",
    labelFr: "Planification annuelle",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "مراجعة التوزيع السنوي ومدى توافقه مع البرنامج الرسمي والمناهج 2026",
    placeholder: "الصق هنا التوزيع السنوي أو الفصلي (المادة، المستوى، الوحدات، عدد الحصص، التواريخ...)",
    hint: "💡 أدرج عدد الأسابيع الفعلية والعطل المدرسية للحصول على تقييم دقيق.",
  },
  {
    id: "other",
    icon: FileText,
    labelAr: "وثيقة أخرى",
    labelFr: "Autre document",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "تقييم أي وثيقة تربوية أخرى (تقرير، بطاقة متابعة، مشروع بيداغوجي...)",
    placeholder: "الصق هنا نص الوثيقة التربوية مع ذكر نوعها والسياق التربوي المتعلق بها...",
    hint: "💡 حدد نوع الوثيقة وغرضها لتوجيه التقييم بشكل أفضل.",
  },
];

// ─── Evaluation criteria chips ────────────────────────────────────────────────

const CRITERIA_BY_TAB: Record<TabId, string[]> = {
  lesson: ["الكفايات والأهداف", "مراحل الدرس (5E)", "أنشطة التعلم", "التقييم التكويني", "التمييز البيداغوجي", "الوسائل والأدوات"],
  exam: ["صياغة الأسئلة", "التدرج في الصعوبة", "التغطية البرامجية", "التنقيط والمعامل", "الوضوح والدقة", "ملاءمة المستوى"],
  planning: ["التوافق مع البرنامج", "توزيع الحصص", "التسلسل المنطقي", "الوحدات والمحاور", "التقييمات الدورية", "الاحتياطي الزمني"],
  other: ["الوضوح والتنظيم", "الملاءمة التربوية", "الجدوى والتطبيق", "الأهداف المحددة", "المرجعية القانونية", "القيمة المضافة"],
};

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-800 border-green-300" :
    score >= 60 ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
    "bg-red-100 text-red-800 border-red-300";
  const label =
    score >= 80 ? "ممتاز" :
    score >= 70 ? "جيد جداً" :
    score >= 60 ? "جيد" :
    score >= 50 ? "مقبول" :
    "يحتاج تحسيناً";

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-lg ${color}`}>
      <Star className="w-5 h-5" />
      <span>{score}/100</span>
      <span className="text-sm font-medium">— {label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartInspector() {
  const [activeTab, setActiveTab] = useState<TabId>("lesson");
  const [documentText, setDocumentText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showFullReport, setShowFullReport] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectMutation = trpc.edugpt.inspectDocument.useMutation({
    onSuccess: (data) => {
      setResult(data.report);
      setIsLoading(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "حدث خطأ أثناء التحليل. حاول مرة أخرى.");
      setIsLoading(false);
    },
  });

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const criteria = CRITERIA_BY_TAB[activeTab];

  function toggleCriterion(c: string) {
    setSelectedCriteria((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleInspect() {
    if (!documentText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    inspectMutation.mutate({
      documentType: activeTab,
      documentText: documentText.trim(),
      focusCriteria: selectedCriteria.length > 0 ? selectedCriteria : undefined,
    });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleTabChange(id: TabId) {
    setActiveTab(id);
    setResult(null);
    setDocumentText("");
    setSelectedCriteria([]);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Cairo,Tajawal,sans-serif]" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: "#1A237E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/logo_navbar_74c3be1f.png"
                  alt="Leader Academy"
                  className="h-9 w-auto"
                />
                <span className="text-white font-bold text-lg hidden sm:block" style={{ fontFamily: "Cairo, sans-serif" }}>
                  Leader Academy
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/assistant">
                <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10 text-sm gap-2">
                  <BookOpen className="w-4 h-4" />
                  EDUGPT
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10 text-sm gap-2">
                  <ArrowRight className="w-4 h-4" />
                  الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-12 px-4" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 60%, #1565C0 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FF6D00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #42A5F5 0%, transparent 50%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 text-white" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.4)" }}>
            <Search className="w-4 h-4" style={{ color: "#FF6D00" }} />
            <span>مدعوم بالذكاء الاصطناعي</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
            المتفقد الذكي
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-2">
            نظام تقييم بيداغوجي ذكي يحاكي منهجية المتفقد التربوي التونسي
          </p>
          <p className="text-blue-300 text-sm">
            تقييم المذكرات، الاختبارات، التوزيعات السنوية وكل الوثائق التربوية وفق المعايير الرسمية
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: "📋", value: "4", label: "أنواع وثائق" },
              { icon: "⚡", value: "30 ثانية", label: "وقت التحليل" },
              { icon: "🎯", value: "معايير رسمية", label: "وزارة التربية" },
              { icon: "📊", value: "تقرير شامل", label: "نقاط وتوصيات" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-white font-bold">{s.value}</div>
                <div className="text-blue-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                  isActive
                    ? `${tab.bgColor} ${tab.borderColor} shadow-md scale-105`
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? tab.bgColor : "bg-gray-100"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? tab.color : "text-gray-500"}`} />
                </div>
                <span className={`font-bold text-sm ${isActive ? tab.color : "text-gray-700"}`}>
                  {tab.labelAr}
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">{tab.labelFr}</span>
              </button>
            );
          })}
        </div>

        {/* Description banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${currentTab.bgColor} border ${currentTab.borderColor}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${currentTab.bgColor}`}>
            <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
          </div>
          <div>
            <p className={`font-bold text-sm ${currentTab.color}`}>{currentTab.labelAr}</p>
            <p className="text-gray-600 text-sm mt-0.5">{currentTab.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Left: Input ─────────────────────────────────────────────── */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                نص الوثيقة
              </h2>
              <Textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder={currentTab.placeholder}
                className="min-h-[220px] text-sm leading-relaxed resize-none border-gray-200 focus:border-blue-400 rounded-xl"
                dir="rtl"
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span>{currentTab.hint}</span>
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{documentText.length} حرف</span>
                {documentText.length > 0 && (
                  <button
                    onClick={() => setDocumentText("")}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    مسح النص
                  </button>
                )}
              </div>
            </div>

            {/* Criteria chips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                معايير التركيز (اختياري)
              </h3>
              <p className="text-xs text-gray-400 mb-3">اختر المعايير التي تريد التركيز عليها في التقييم</p>
              <div className="flex flex-wrap gap-2">
                {criteria.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCriterion(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedCriteria.includes(c)
                        ? `${currentTab.bgColor} ${currentTab.borderColor} ${currentTab.color} shadow-sm`
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {selectedCriteria.includes(c) ? "✓ " : ""}{c}
                  </button>
                ))}
              </div>
              {selectedCriteria.length > 0 && (
                <button
                  onClick={() => setSelectedCriteria([])}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
                >
                  إلغاء التحديد
                </button>
              )}
            </div>

            {/* Inspect button */}
            <Button
              onClick={handleInspect}
              disabled={isLoading || !documentText.trim()}
              className="w-full py-4 text-white font-bold text-base rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 gap-3"
              style={{ background: isLoading ? "#9E9E9E" : "linear-gradient(135deg, #1A237E, #1565C0)", boxShadow: isLoading ? "none" : "0 8px 24px rgba(26,35,126,0.35)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جارٍ التحليل والتقييم...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  ابدأ التفقد الذكي
                </>
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* ── Right: Result ───────────────────────────────────────────── */}
          <div>
            {!result && !isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)" }}>
                  <Search className="w-10 h-10" style={{ color: "#1A237E" }} />
                </div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">في انتظار الوثيقة</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  الصق نص وثيقتك التربوية في الحقل المجاور ثم اضغط "ابدأ التفقد الذكي"
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                  {[
                    { icon: <ThumbsUp className="w-4 h-4 text-green-600" />, text: "نقاط القوة" },
                    { icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, text: "الإخلالات" },
                    { icon: <Star className="w-4 h-4 text-blue-600" />, text: "التوصيات" },
                    { icon: <Award className="w-4 h-4 text-purple-600" />, text: "القرار النهائي" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-500">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#1A237E" }} />
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                    <Search className="w-9 h-9 text-white animate-pulse" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">جارٍ التفقد الذكي...</h3>
                <p className="text-gray-400 text-sm">يقوم المتفقد الذكي بتحليل وثيقتك وفق المعايير الرسمية</p>
                <div className="mt-6 space-y-2 w-full max-w-xs">
                  {["تحليل البنية العامة...", "مراجعة الكفايات والأهداف...", "تقييم الأنشطة والوسائل...", "صياغة التوصيات..."].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Report header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A237E" }}>
                      <ClipboardCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">تقرير التفقد</p>
                      <p className="text-xs text-gray-500">{currentTab.labelAr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      {copied ? "تم النسخ" : "نسخ"}
                    </button>
                    <button
                      onClick={() => setShowFullReport(!showFullReport)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {showFullReport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showFullReport ? "طيّ" : "توسيع"}
                    </button>
                  </div>
                </div>

                {/* Report body */}
                {showFullReport && (
                  <div className="p-5 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dir="rtl">
                      <Streamdown>{result}</Streamdown>
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => { setResult(null); setDocumentText(""); }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    تقييم وثيقة جديدة
                  </button>
                  <div className="flex items-center gap-2">
                    <Link href="/assistant">
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                        <BookOpen className="w-3.5 h-3.5" />
                        إنشاء مذكرة في EDUGPT
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info section ─────────────────────────────────────────────── */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "🎓",
              title: "معايير رسمية تونسية",
              desc: "التقييم وفق منهجية وزارة التربية التونسية ومعايير التفقد البيداغوجي الرسمية",
            },
            {
              icon: "🤖",
              title: "ذكاء اصطناعي متخصص",
              desc: "نموذج مدرَّب على آلاف الوثائق التربوية التونسية مع خبرة 30 سنة في التفقد",
            },
            {
              icon: "📊",
              title: "تقرير شامل ومفصّل",
              desc: "نقاط قوة، إخلالات، توصيات عملية، وقرار نهائي بالمصطلحات البيداغوجية الرسمية",
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="mt-10 rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
          <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>
            هل تريد تحسين مهاراتك البيداغوجية؟
          </h3>
          <p className="text-blue-200 text-sm mb-5">
            انضم إلى دوراتنا التدريبية المتخصصة في توظيف الذكاء الاصطناعي في التدريس
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/assistant">
              <Button className="text-white font-bold gap-2 hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 6px 20px rgba(255,109,0,0.4)" }}>
                <BookOpen className="w-4 h-4" />
                جرّب EDUGPT
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 gap-2">
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 Leader Academy — جميع الحقوق محفوظة</p>
          <p className="mt-1">
            <a href="mailto:leaderacademy216@gmail.com" className="hover:text-blue-600 transition-colors">
              leaderacademy216@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
