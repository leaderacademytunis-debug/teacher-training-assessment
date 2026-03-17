import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { LockedFeature, usePermissions } from "@/components/LockedFeature";
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
  Upload,
  X,
  FileImage,
  File,
  Type,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { Download, FileDown, Stethoscope, ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";
import UnifiedToolLayout, { type ToolConfig } from "@/components/UnifiedToolLayout";

// ─── Tool Config ─────────────────────────────────────────────────────────────

const INSPECTOR_CONFIG: ToolConfig = {
  id: "inspector",
  icon: Search,
  nameAr: "المتفقد الذكي",
  nameFr: "Inspecteur Intelligent",
  nameEn: "Smart Inspector",
  descAr: "نظام تقييم بيداغوجي ذكي يحاكي منهجية المتفقد التربوي التونسي",
  descFr: "Système d'évaluation pédagogique intelligent",
  descEn: "Smart pedagogical evaluation system",
  accentColor: "#1A237E",
  gradient: "linear-gradient(135deg, #1A237E, #1565C0)",
  loaderMessages: [
    "جارٍ تحليل البنية العامة للوثيقة...",
    "مراجعة الكفايات والأهداف البيداغوجية...",
    "تقييم الأنشطة والوسائل التعليمية...",
    "التحقق من معايير وزارة التربية التونسية...",
    "صياغة التوصيات والملاحظات...",
    "إعداد التقرير النهائي...",
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "lesson" | "exam" | "planning" | "other";
type InputMode = "text" | "file";

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

const TABS: Tab[] = [
  {
    id: "lesson",
    icon: BookOpen,
    labelAr: "مذكرة درس",
    labelFr: "Fiche de cours",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "تقييم مذكرة درس أو جذاذة حصة وفق المعايير البيداغوجية الرسمية",
    placeholder: "الصق هنا نص مذكرة الدرس أو الجذاذة...",
    hint: "يُفضّل لصق النص كاملاً مع العناوين والأنشطة",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    labelAr: "اختبار",
    labelFr: "Examen",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "تقييم اختبار أو فرض وفق معايير التقييم الرسمية (سند، تعليمة، مع1-4)",
    placeholder: "الصق هنا نص الاختبار أو الفرض...",
    hint: "تأكد من تضمين السند والتعليمات وجدول التنقيط",
  },
  {
    id: "planning",
    icon: CalendarDays,
    labelAr: "تخطيط سنوي",
    labelFr: "Planification",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "تقييم التخطيط السنوي أو التوزيع الزمني وفق البرنامج الرسمي",
    placeholder: "الصق هنا نص التخطيط السنوي أو التوزيع الزمني...",
    hint: "يُفضّل تضمين جميع الوحدات والحصص",
  },
  {
    id: "other",
    icon: FileText,
    labelAr: "وثيقة أخرى",
    labelFr: "Autre document",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "تقييم أي وثيقة تربوية أخرى (مشروع، تقرير، خطة علاجية...)",
    placeholder: "الصق هنا نص الوثيقة التربوية...",
    hint: "حدد نوع الوثيقة بوضوح في بداية النص",
  },
];

// ─── Evaluation criteria chips ────────────────────────────────────────────────

const CRITERIA_BY_TAB: Record<TabId, string[]> = {
  lesson: ["الكفايات والأهداف", "مراحل الدرس (5E)", "أنشطة التعلم", "التقييم التكويني", "التمييز البيداغوجي", "الوسائل والأدوات"],
  exam: ["صياغة الأسئلة", "التدرج في الصعوبة", "التغطية البرامجية", "التنقيط والمعامل", "الوضوح والدقة", "ملاءمة المستوى"],
  planning: ["التوافق مع البرنامج", "توزيع الحصص", "التسلسل المنطقي", "الوحدات والمحاور", "التقييمات الدورية", "الاحتياطي الزمني"],
  other: ["الوضوح والتنظيم", "الملاءمة التربوية", "الجدوى والتطبيق", "الأهداف المحددة", "المرجعية القانونية", "القيمة المضافة"],
};

// ─── Accepted file types ──────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_FILE_SIZE_MB = 10;

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return <File className="w-5 h-5 text-red-500" />;
  if (mimeType.startsWith("image/")) return <FileImage className="w-5 h-5 text-blue-500" />;
  return <FileText className="w-5 h-5 text-indigo-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartInspector() {
  const { hasEdugpt, isAdmin, isLoading: permLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabId>("lesson");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [documentText, setDocumentText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showFullReport, setShowFullReport] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inspectionScore, setInspectionScore] = useState<number | null>(null);
  const [missingCriteria, setMissingCriteria] = useState<string[]>([]);
  const [presentCriteria, setPresentCriteria] = useState<string[]>([]);
  const [remediationPlan, setRemediationPlan] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingRemediation, setIsGeneratingRemediation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse score and criteria from the report
  function parseReportMetrics(report: string) {
    let score = 0;
    const starMatch = report.match(/[⭐]+/g);
    if (starMatch) {
      const maxStars = starMatch.reduce((max, s) => Math.max(max, s.length), 0);
      score = (maxStars / 5) * 100;
    }
    const pctMatch = report.match(/(\d{1,3})\s*[%٪]/);
    if (pctMatch) score = parseInt(pctMatch[1]);

    const criteriaChecks = [
      { name: "السند (الوضعية)", patterns: ["سند", "وضعية", "sened"] },
      { name: "التعليمة", patterns: ["تعليمة", "ta'lima", "تعليمات"] },
      { name: "معايير التملك (مع1)", patterns: ["مع1", "مع 1", "M1", "معيار 1"] },
      { name: "معايير التملك (مع2)", patterns: ["مع2", "مع 2", "M2", "معيار 2"] },
      { name: "معايير التملك (مع3)", patterns: ["مع3", "مع 3", "M3", "معيار 3"] },
      { name: "معايير التملك (مع4)", patterns: ["مع4", "مع 4", "M4", "معيار 4"] },
      { name: "جدول التنقيط", patterns: ["جدول", "تنقيط", "إسناد الأعداد"] },
    ];
    const docLower = report.toLowerCase();
    const missing: string[] = [];
    const present: string[] = [];
    criteriaChecks.forEach((c) => {
      const found = c.patterns.some((p) => docLower.includes(p.toLowerCase()));
      if (found) present.push(c.name);
      else missing.push(c.name);
    });
    return { score, missing, present };
  }

  const inspectMutation = trpc.edugpt.inspectDocument.useMutation({
    onSuccess: (data) => {
      setResult(data.report);
      const metrics = parseReportMetrics(data.report);
      setInspectionScore(metrics.score);
      setMissingCriteria(metrics.missing);
      setPresentCriteria(metrics.present);
      setIsLoading(false);
      setError(null);
      if (metrics.score > 0 && metrics.score < 70) {
        handleGenerateRemediation(data.report);
      }
    },
    onError: (err) => {
      setError(err.message || "حدث خطأ أثناء التحليل. حاول مرة أخرى.");
      setIsLoading(false);
    },
  });

  const extractMutation = trpc.edugpt.extractTextFromFile.useMutation({
    onSuccess: (data) => {
      setDocumentText(data.text);
      setIsExtracting(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "فشل استخراج النص من الملف.");
      setIsExtracting(false);
    },
  });

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const criteria = CRITERIA_BY_TAB[activeTab];

  function toggleCriterion(c: string) {
    setSelectedCriteria((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  const remediationMutation = trpc.edugpt.generateRemediationPlan.useMutation({
    onSuccess: (data) => {
      setRemediationPlan(data.plan);
      setIsGeneratingRemediation(false);
    },
    onError: () => {
      setIsGeneratingRemediation(false);
      toast.error("تعذّر توليد الخطة العلاجية");
    },
  });

  const exportPdfMutation = trpc.edugpt.exportInspectionPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      setIsGeneratingPdf(false);
      toast.success("تم تصدير التقرير بنجاح");
    },
    onError: () => {
      setIsGeneratingPdf(false);
      toast.error("تعذّر تصدير التقرير");
    },
  });

  function handleGenerateRemediation(reportText: string) {
    setIsGeneratingRemediation(true);
    remediationMutation.mutate({
      inspectionReport: reportText,
      documentType: activeTab,
    });
  }

  function handleExportPdf() {
    if (!result) return;
    setIsGeneratingPdf(true);
    exportPdfMutation.mutate({
      report: result,
      documentType: activeTab,
      fileName: uploadedFile?.name || "وثيقة تربوية",
      score: inspectionScore || 0,
      missingCriteria,
      presentCriteria,
      remediationPlan: remediationPlan || undefined,
    });
  }

  function handleInspect() {
    if (!documentText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    setInspectionScore(null);
    setMissingCriteria([]);
    setPresentCriteria([]);
    setRemediationPlan(null);
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
    setUploadedFile(null);
  }

  // ── File handling ────────────────────────────────────────────────────────

  function processFile(file: File) {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    const isValidType =
      ACCEPTED_TYPES.includes(file.type) ||
      file.name.toLowerCase().endsWith(".docx") ||
      file.name.toLowerCase().endsWith(".doc");
    if (!isValidType) {
      setError("نوع الملف غير مدعوم. يُرجى رفع ملف PDF أو Word (.docx) أو صورة (PNG/JPG/WEBP).");
      return;
    }

    setUploadedFile(file);
    setDocumentText("");
    setResult(null);
    setError(null);
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      extractMutation.mutate({
        base64Data: base64,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name,
      });
    };
    reader.onerror = () => {
      setError("فشل قراءة الملف. حاول مرة أخرى.");
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  function clearFile() {
    setUploadedFile(null);
    setDocumentText("");
    setError(null);
  }

  // Show loading spinner while permissions are loading
  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // Show locked state for non-subscribers
  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <LockedFeature requiredService="accessEdugpt" featureName="المتفقد الذكي">
          <div />
        </LockedFeature>
      </div>
    );
  }

  // ─── Input Panel ─────────────────────────────────────────────────────────

  const inputPanel = (
    <div className="space-y-4" dir="rtl" style={{ fontFamily: "'Almarai', sans-serif" }}>
      {/* Document type tabs */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
          نوع الوثيقة
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? `${tab.bgColor} ${tab.borderColor} ${tab.color} shadow-sm`
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.labelAr}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1">{currentTab.description}</p>
      </div>

      {/* Input mode toggle */}
      <div className="bg-gray-50 rounded-xl p-1 flex gap-1">
        <button
          onClick={() => setInputMode("text")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            inputMode === "text"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          لصق النص
        </button>
        <button
          onClick={() => setInputMode("file")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            inputMode === "file"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          رفع ملف
        </button>
      </div>

      {/* Text input */}
      {inputMode === "text" && (
        <div className="space-y-2">
          <Textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder={currentTab.placeholder}
            className="min-h-[180px] text-sm leading-relaxed resize-none border-gray-200 focus:border-indigo-400 rounded-xl"
            dir="rtl"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{documentText.length} حرف</span>
            {documentText.length > 0 && (
              <button onClick={() => setDocumentText("")} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                مسح النص
              </button>
            )}
          </div>
        </div>
      )}

      {/* File upload */}
      {inputMode === "file" && (
        <div className="space-y-3">
          {uploadedFile && !isExtracting && (
            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-3">
              {getFileIcon(uploadedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(uploadedFile.size)}</p>
              </div>
              <button
                onClick={clearFile}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isExtracting && (
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">جارٍ استخراج النص...</p>
                <p className="text-xs text-blue-500 mt-0.5">قد يستغرق بضع ثوانٍ</p>
              </div>
            </div>
          )}

          {!uploadedFile && !isExtracting && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
              <p className="font-medium text-gray-700 text-sm mb-1">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-gray-400 text-xs">PDF، Word، صورة (PNG/JPG/WEBP)</p>
              <p className="text-gray-300 text-xs mt-1">الحد الأقصى: {MAX_FILE_SIZE_MB} MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {documentText && uploadedFile && !isExtracting && (
            <div className="p-2 rounded-lg border border-green-200 bg-green-50">
              <p className="text-xs font-medium text-green-700 flex items-center gap-1 mb-1">
                <CheckCheck className="w-3.5 h-3.5" />
                تم استخراج النص ({documentText.length} حرف)
              </p>
              <div className="max-h-24 overflow-y-auto text-xs text-gray-600 leading-relaxed">
                {documentText.slice(0, 300)}{documentText.length > 300 ? "..." : ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Criteria chips */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-orange-500" />
          معايير التركيز (اختياري)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {criteria.map((c) => (
            <button
              key={c}
              onClick={() => toggleCriterion(c)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedCriteria.includes(c)
                  ? `${currentTab.bgColor} ${currentTab.borderColor} ${currentTab.color}`
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {selectedCriteria.includes(c) ? "✓ " : ""}{c}
            </button>
          ))}
        </div>
        {selectedCriteria.length > 0 && (
          <button onClick={() => setSelectedCriteria([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            إلغاء التحديد
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Inspect button */}
      <Button
        onClick={handleInspect}
        disabled={isLoading || isExtracting || !documentText.trim()}
        className="w-full py-3 text-white font-bold text-sm rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 gap-2"
        style={{
          background: (isLoading || isExtracting || !documentText.trim())
            ? "#9E9E9E"
            : "linear-gradient(135deg, #1A237E, #1565C0)",
          boxShadow: (isLoading || isExtracting || !documentText.trim())
            ? "none"
            : "0 6px 20px rgba(26,35,126,0.35)",
        }}
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التحليل...</>
        ) : isExtracting ? (
          <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الاستخراج...</>
        ) : (
          <><Search className="w-4 h-4" />ابدأ التفقد الذكي</>
        )}
      </Button>
    </div>
  );

  // ─── Custom Result Renderer ──────────────────────────────────────────────

  const customResultRenderer = result ? (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" dir="rtl">
      {/* Report header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A237E" }}>
            <ClipboardCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">تقرير التفقد</p>
            <p className="text-xs text-gray-500">
              {currentTab.labelAr}{uploadedFile ? ` — ${uploadedFile.name}` : ""}
            </p>
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

      {/* Criteria Analysis Panel */}
      {(missingCriteria.length > 0 || presentCriteria.length > 0) && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            تحليل المعايير الرسمية
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presentCriteria.map((c, i) => (
              <div key={`p-${i}`} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                {c}
              </div>
            ))}
            {missingCriteria.map((c, i) => (
              <div key={`m-${i}`} className="flex items-center gap-2 text-xs">
                <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>غائب: {c}</span>
              </div>
            ))}
          </div>
          {inspectionScore !== null && inspectionScore > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-500">التقييم العام:</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${inspectionScore >= 70 ? "bg-green-500" : inspectionScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${inspectionScore}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${inspectionScore >= 70 ? "text-green-600" : inspectionScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {inspectionScore}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Remediation Plan */}
      {remediationPlan && (
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            خطة علاجية مقترحة
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <Streamdown>{remediationPlan}</Streamdown>
          </div>
        </div>
      )}
      {isGeneratingRemediation && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">جارٍ توليد الخطة العلاجية...</p>
              <p className="text-xs text-amber-500 mt-0.5">التقييم أقل من 70%</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => { setResult(null); setDocumentText(""); setUploadedFile(null); setInspectionScore(null); setMissingCriteria([]); setPresentCriteria([]); setRemediationPlan(null); }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          تقييم وثيقة جديدة
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            تصدير PDF رسمي
          </Button>
          {inspectionScore !== null && inspectionScore < 70 && !remediationPlan && !isGeneratingRemediation && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => handleGenerateRemediation(result!)}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              خطة علاجية
            </Button>
          )}
          <Link href="/assistant">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
              <BookOpen className="w-3.5 h-3.5" />
              إنشاء مذكرة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <UnifiedToolLayout
      config={INSPECTOR_CONFIG}
      inputPanel={inputPanel}
      resultContent={result}
      isGenerating={isLoading}
      onRegenerate={handleInspect}
      onDownloadPDF={handleExportPdf}
      customResultRenderer={customResultRenderer}
      editable={false}
    />
  );
}
