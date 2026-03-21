
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";

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
  loaderMessagesFr: [
    "Analyse de la structure générale du document...",
    "Examen des compétences et des objectifs pédagogiques...",
    "Évaluation des activités et des supports didactiques...",
    "Vérification des normes du ministère de l'Éducation tunisien...",
    "Rédaction des recommandations et des observations...",
    "Préparation du rapport final...",
  ],
  loaderMessagesEn: [
    "Analyzing the general structure of the document...",
    "Reviewing pedagogical competencies and objectives...",
    "Evaluating learning activities and teaching aids...",
    "Checking against Tunisian Ministry of Education standards...",
    "Formulating recommendations and feedback...",
    "Preparing the final report...",
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
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: (t: (ar: string, fr: string, en: string) => string) => string;
  placeholder: (t: (ar: string, fr: string, en: string) => string) => string;
  hint: (t: (ar: string, fr: string, en: string) => string) => string;
}

const TABS: Tab[] = [
  {
    id: "lesson",
    icon: BookOpen,
    labelAr: "مذكرة درس",
    labelFr: "Fiche de cours",
    labelEn: "Lesson Plan",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: (t) => t("تقييم مذكرة درس أو جذاذة حصة وفق المعايير البيداغوجية الرسمية", "Évaluer une fiche de cours ou de séance selon les normes pédagogiques officielles", "Evaluate a lesson plan or session sheet according to official pedagogical standards"),
    placeholder: (t) => t("الصق هنا نص مذكرة الدرس أو الجذاذة...", "Collez ici le texte de la fiche de cours ou de la séance...", "Paste the text of the lesson plan or session sheet here..."),
    hint: (t) => t("يُفضّل لصق النص كاملاً مع العناوين والأنشطة", "Il est préférable de coller le texte intégral avec les titres et les activités", "It is best to paste the full text including titles and activities"),
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    labelAr: "اختبار",
    labelFr: "Examen",
    labelEn: "Exam",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: (t) => t("تقييم اختبار أو فرض وفق معايير التقييم الرسمية (سند، تعليمة، مع1-4)", "Évaluer un examen ou un devoir selon les critères d'évaluation officiels (support, consigne, C1-4)", "Evaluate an exam or test according to official assessment criteria (support, instruction, C1-4)"),
    placeholder: (t) => t("الصق هنا نص الاختبار أو الفرض...", "Collez ici le texte de l'examen ou du devoir...", "Paste the text of the exam or test here..."),
    hint: (t) => t("تأكد من تضمين السند والتعليمات وجدول التنقيط", "Assurez-vous d'inclure le support, les consignes et le barème de notation", "Make sure to include the support, instructions, and scoring table"),
  },
  {
    id: "planning",
    icon: CalendarDays,
    labelAr: "تخطيط سنوي",
    labelFr: "Planification",
    labelEn: "Planning",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: (t) => t("تقييم التخطيط السنوي أو التوزيع الزمني وفق البرنامج الرسمي", "Évaluer la planification annuelle ou la répartition temporelle selon le programme officiel", "Evaluate the annual planning or timeline according to the official curriculum"),
    placeholder: (t) => t("الصق هنا نص التخطيط السنوي أو التوزيع الزمني...", "Collez ici le texte de la planification annuelle ou de la répartition temporelle...", "Paste the text of the annual planning or timeline here..."),
    hint: (t) => t("يُفضّل تضمين جميع الوحدات والحصص", "Il est préférable d'inclure toutes les unités et séances", "It is best to include all units and sessions"),
  },
  {
    id: "other",
    icon: FileText,
    labelAr: "وثيقة أخرى",
    labelFr: "Autre document",
    labelEn: "Other Document",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: (t) => t("تقييم أي وثيقة تربوية أخرى (مشروع، تقرير، خطة علاجية...)", "Évaluer tout autre document pédagogique (projet, rapport, plan de remédiation...)", "Evaluate any other educational document (project, report, remedial plan...)"),
    placeholder: (t) => t("الصق هنا نص الوثيقة التربوية...", "Collez ici le texte du document pédagogique...", "Paste the text of the educational document here..."),
    hint: (t) => t("حدد نوع الوثيقة بوضوح في بداية النص", "Précisez clairement le type de document au début du texte", "Clearly specify the type of document at the beginning of the text"),
  },
];

// ─── Evaluation criteria chips ────────────────────────────────────────────────

const CRITERIA_BY_TAB: Record<TabId, { ar: string, fr: string, en: string }[]> = {
  lesson: [
    { ar: "الكفايات والأهداف", fr: "Compétences et objectifs", en: "Competencies and Objectives" },
    { ar: "مراحل الدرس (5E)", fr: "Phases de la leçon (5E)", en: "Lesson Stages (5E)" },
    { ar: "أنشطة التعلم", fr: "Activités d'apprentissage", en: "Learning Activities" },
    { ar: "التقييم التكويني", fr: "Évaluation formative", en: "Formative Assessment" },
    { ar: "التمييز البيداغوجي", fr: "Différenciation pédagogique", en: "Pedagogical Differentiation" },
    { ar: "الوسائل والأدوات", fr: "Supports et outils", en: "Materials and Tools" },
  ],
  exam: [
    { ar: "صياغة الأسئلة", fr: "Formulation des questions", en: "Question Formulation" },
    { ar: "التدرج في الصعوبة", fr: "Progression de la difficulté", en: "Difficulty Progression" },
    { ar: "التغطية البرامجية", fr: "Couverture du programme", en: "Curriculum Coverage" },
    { ar: "التنقيط والمعامل", fr: "Notation et coefficient", en: "Scoring and Weighting" },
    { ar: "الوضوح والدقة", fr: "Clarté et précision", en: "Clarity and Precision" },
    { ar: "ملاءمة المستوى", fr: "Adéquation au niveau", en: "Level Appropriateness" },
  ],
  planning: [
    { ar: "التوافق مع البرنامج", fr: "Conformité au programme", en: "Curriculum Alignment" },
    { ar: "توزيع الحصص", fr: "Répartition des séances", en: "Session Distribution" },
    { ar: "التسلسل المنطقي", fr: "Séquençage logique", en: "Logical Sequencing" },
    { ar: "الوحدات والمحاور", fr: "Unités et axes", en: "Units and Themes" },
    { ar: "التقييمات الدورية", fr: "Évaluations périodiques", en: "Periodic Assessments" },
    { ar: "الاحتياطي الزمني", fr: "Marge de temps", en: "Time Buffer" },
  ],
  other: [
    { ar: "الوضوح والتنظيم", fr: "Clarté et organisation", en: "Clarity and Organization" },
    { ar: "الملاءمة التربوية", fr: "Pertinence pédagogique", en: "Educational Relevance" },
    { ar: "الجدوى والتطبيق", fr: "Faisabilité et application", en: "Feasibility and Application" },
    { ar: "الأهداف المحددة", fr: "Objectifs spécifiques", en: "Specific Objectives" },
    { ar: "المرجعية القانونية", fr: "Référence légale", en: "Legal Reference" },
    { ar: "القيمة المضافة", fr: "Valeur ajoutée", en: "Added Value" },
  ],
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
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

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
      { name: t("السند (الوضعية)", "Support (Situation)", "Support (Situation)"), patterns: ["سند", "وضعية", "sened"] },
      { name: t("التعليمة", "Instruction", "Instruction"), patterns: ["تعليمة", "ta'lima", "تعليمات"] },
      { name: t("معايير التملك (مع1)", "Critères de maîtrise (C1)", "Mastery Criteria (C1)"), patterns: ["مع1", "مع 1", "M1", "معيار 1"] },
      { name: t("معايير التملك (مع2)", "Critères de maîtrise (C2)", "Mastery Criteria (C2)"), patterns: ["مع2", "مع 2", "M2", "معيار 2"] },
      { name: t("معايير التملك (مع3)", "Critères de maîtrise (C3)", "Mastery Criteria (C3)"), patterns: ["مع3", "مع 3", "M3", "معيار 3"] },
      { name: t("معايير التملك (مع4)", "Critères de maîtrise (C4)", "Mastery Criteria (C4)"), patterns: ["مع4", "مع 4", "M4", "معيار 4"] },
      { name: t("جدول التنقيط", "Barème de notation", "Scoring Table"), patterns: ["جدول", "تنقيط", "إسناد الأعداد"] },
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
      setError(err.message || t("حدث خطأ أثناء التحليل. حاول مرة أخرى.", "Une erreur est survenue lors de l'analyse. Veuillez réessayer.", "An error occurred during analysis. Please try again."));
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
      setError(err.message || t("فشل استخراج النص من الملف.", "Échec de l'extraction du texte du fichier.", "Failed to extract text from the file."));
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
      toast.error(t("تعذّر توليد الخطة العلاجية", "Impossible de générer le plan de remédiation", "Failed to generate remedial plan"));
    },
  });

  const exportPdfMutation = trpc.edugpt.exportInspectionPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      setIsGeneratingPdf(false);
      toast.success(t("تم تصدير التقرير بنجاح", "Le rapport a été exporté avec succès", "Report exported successfully"));
    },
    onError: () => {
      setIsGeneratingPdf(false);
      toast.error(t("تعذّر تصدير التقرير", "Impossible d'exporter le rapport", "Failed to export report"));
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
      fileName: uploadedFile?.name || t("وثيقة تربوية", "Document Pédagogique", "Educational Document"),
      score: inspectionScore || 0,
      missingCriteria,
      presentCriteria,
      remediationPlan: remediationPlan || "",
      lang: language,
    });
  }

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(
        `${t("حجم الملف كبير جداً", "Fichier trop volumineux", "File is too large")} (${formatFileSize(file.size)}). ${t("الحد الأقصى", "Max", "Max")}: ${MAX_FILE_SIZE_MB}MB`
      );
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(
        `${t("نوع الملف غير مدعوم", "Type de fichier non supporté", "Unsupported file type")}: ${file.type}. ${t("الأنواع المدعومة", "Types supportés", "Supported types")}: PDF, Word, PNG, JPG`
      );
      return;
    }

    setUploadedFile(file);
    setInputMode("file");
    setIsExtracting(true);
    setError(null);
    setResult(null);
    setInspectionScore(null);
    setRemediationPlan(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      extractMutation.mutate({ fileContentBase64: base64, fileType: file.type });
    };
    reader.readAsDataURL(file);
  }, [extractMutation, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  function handleAnalyze() {
    if (!documentText.trim()) {
      toast.error(t("الرجاء إدخال نص المذكرة أولاً", "Veuillez d'abord saisir le texte du document", "Please enter the document text first"));
      return;
    }
    setIsLoading(true);
    setResult(null);
    setInspectionScore(null);
    setRemediationPlan(null);
    inspectMutation.mutate({
      documentText,
      documentType: activeTab,
      selectedCriteria,
      lang: language,
    });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetState() {
    setDocumentText("");
    setResult(null);
    setError(null);
    setUploadedFile(null);
    setInputMode("text");
    setInspectionScore(null);
    setMissingCriteria([]);
    setPresentCriteria([]);
    setRemediationPlan(null);
  }

  const canAnalyze = hasEdugpt && !permLoading;

  return (
    <UnifiedToolLayout config={INSPECTOR_CONFIG}>
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
        {!result ? (
          // ─── Input View ───────────────────────────────────────────────────
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Input form */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("1. اختر نوع الوثيقة", "1. Choisissez le type de document", "1. Choose Document Type")}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${activeTab === tab.id
                        ? `${tab.bgColor} ${tab.borderColor} ${tab.color}`
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300"
                      }`}>
                    <tab.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{t(tab.labelAr, tab.labelFr, tab.labelEn)}</span>
                  </button>
                ))}
              </div>

              <p className={`text-sm text-gray-500 mb-4 p-3 rounded-lg ${currentTab.bgColor} border ${currentTab.borderColor}`}>
                {currentTab.description(t)}
              </p>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("2. أدخل محتوى الوثيقة", "2. Saisissez le contenu du document", "2. Enter Document Content")}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={inputMode === "text" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className="h-8 px-3 text-xs">
                    <Type className="w-4 h-4 me-2" />
                    {t("نص", "Texte", "Text")}
                  </Button>
                  <Button
                    variant={inputMode === "file" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 text-xs">
                    <Upload className="w-4 h-4 me-2" />
                    {t("ملف", "Fichier", "File")}
                  </Button>
                </div>
              </div>

              {inputMode === "text" ? (
                <Textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder={currentTab.placeholder(t)}
                  className="w-full h-48 lg:h-64 resize-none mb-2"
                  disabled={!canAnalyze}
                />
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-48 lg:h-64 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}>
                  {uploadedFile && !isExtracting ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getFileIcon(uploadedFile.type)}
                        <span className="font-semibold text-gray-700">{uploadedFile.name}</span>
                        <span className="text-sm text-gray-500">({formatFileSize(uploadedFile.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-500 hover:text-red-600 h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetState();
                        }}>
                        <X className="w-3 h-3 me-1" />
                        {t("إزالة الملف", "Retirer le fichier", "Remove file")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                          <p className="font-semibold text-blue-600">{t("جارٍ استخراج النص...", "Extraction du texte en cours...", "Extracting text...")}</p>
                          <p className="text-xs">{t("قد يستغرق هذا بعض الوقت للملفات الكبيرة", "Cela peut prendre un certain temps pour les fichiers volumineux", "This may take a while for large files")}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2" />
                          <p className="font-semibold">{t("انقر للرفع أو اسحب وأفلت", "Cliquez pour téléverser ou glissez-déposez", "Click to upload or drag and drop")}</p>
                          <p className="text-xs">{t("PDF، Word، أو صورة (حتى 10 ميجا)", "PDF, Word, ou Image (max 10MB)", "PDF, Word, or Image (up to 10MB)")}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
                accept={ACCEPTED_TYPES.join(",")}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">{currentTab.hint(t)}</p>
            </div>

            {/* Right side: Criteria selection */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {t("3. حدد معايير التقييم (اختياري)", "3. Sélectionnez les critères d'évaluation (facultatif)", "3. Select Evaluation Criteria (Optional)")}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {t("يمكنك توجيه المتفقد للتركيز على جوانب محددة. سيتم تقييم كل الجوانب إن لم تختر شيئاً.", "Vous pouvez guider l'inspecteur pour qu'il se concentre sur des aspects spécifiques. Tous les aspects seront évalués si vous ne sélectionnez rien.", "You can guide the inspector to focus on specific aspects. All aspects will be evaluated if you select nothing.")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {criteria.map((c) => (
                  <button
                    key={c.ar}
                    onClick={() => toggleCriterion(c.ar)}
                    className={`p-2.5 text-center text-xs font-medium rounded-lg border transition-colors ${
                      selectedCriteria.includes(c.ar)
                        ? `${currentTab.bgColor} ${currentTab.borderColor} ${currentTab.color}`
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}>
                    {t(c.ar, c.fr, c.en)}
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <LockedFeature
                  isLocked={!canAnalyze}
                  lockMessage={permLoading ? tt.loading : tt.loginRequired}
                  featureName={tt.premiumFeature}>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || isExtracting || !documentText.trim()}
                    className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin me-2" />
                        {tt.generating}
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 me-2" />
                        {t("ابدأ التفقد الآن", "Lancer l'inspection", "Start Inspection Now")}
                      </>
                    )}
                  </Button>
                </LockedFeature>
                {error && <p className="text-sm text-red-500 mt-2 text-center">{error}</p>}
              </div>
            </div>
          </div>
        ) : (
          // ─── Result View ────────────────────────────────────────────────────
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {t("تقرير التفقد الذكي", "Rapport d'Inspection Intelligent", "Smart Inspection Report")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("تحليل للوثيقة:", "Analyse du document :", "Analysis for document:")} <span className="font-medium text-gray-700">{uploadedFile?.name || t("نص مدخل", "Texte saisi", "Input Text")}</span>
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button onClick={resetState} variant="outline" className="h-9">
                  <ArrowRight className="w-4 h-4 me-2" />
                  {t("تقييم جديد", "Nouvelle évaluation", "New Evaluation")}
                </Button>
                <Button onClick={handleCopy} variant="outline" className="h-9">
                  {copied ? (
                    <CheckCheck className="w-4 h-4 me-2 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 me-2" />
                  )}
                  {copied ? tt.copied : tt.copy}
                </Button>
                <Button onClick={handleExportPdf} disabled={isGeneratingPdf} className="h-9">
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                  ) : (
                    <FileDown className="w-4 h-4 me-2" />
                  )}
                  {tt.downloadPDF}
                </Button>
              </div>
            </div>

            {/* ─── Metrics Dashboard ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">{t("النتيجة الإجمالية", "Score Global", "Overall Score")}</p>
                <p className="text-3xl font-bold text-gray-800">{inspectionScore?.toFixed(0) ?? "--"}%</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <p className="text-sm font-medium text-gray-500">{t("المعايير المتوفرة", "Critères Présents", "Present Criteria")}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {presentCriteria.map(c => <span key={c} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{c}</span>)}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <p className="text-sm font-medium text-gray-500">{t("المعايير الناقصة", "Critères Manquants", "Missing Criteria")}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {missingCriteria.map(c => <span key={c} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{c}</span>)}
                </div>
              </div>
            </div>

            {/* ─── Remediation Plan ─────────────────────────────────── */}
            {remediationPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Stethoscope className="w-7 h-7 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">{t("خطة علاجية مقترحة", "Plan de remédiation proposé", "Proposed Remedial Plan")}</h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <Streamdown>{remediationPlan}</Streamdown>
                </div>
              </div>
            )}
            {isGeneratingRemediation && (
              <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="font-medium text-sm">{t("جارٍ إعداد الخطة العلاجية...", "Préparation du plan de remédiation en cours...", "Preparing remedial plan...")}</p>
              </div>
            )}

            {/* ─── Full Report ──────────────────────────────────────── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100">
                <h3 className="text-base font-semibold text-gray-700">{t("التقرير المفصل", "Rapport Détaillé", "Detailed Report")}</h3>
                {showFullReport ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showFullReport && (
                <div className="p-4 prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  <Streamdown>{result}</Streamdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UnifiedToolLayout>
  );
}
