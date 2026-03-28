import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  ArrowRight, Upload, X, Camera, Brain, FileText, Download,
  AlertTriangle, CheckCircle2, Loader2, User, History, ChevronDown,
  ChevronUp, Sparkles, Eye, PenTool, Ruler, AlignCenter,
  RotateCcw, Gauge, TrendingUp, Baby, GraduationCap,
  BarChart3, Users, Mic, ClipboardList, BookOpen, Send,
  Plus, Trash2, Phone, Mail, Building, Activity, Target,
  Home, LineChart, Dumbbell, UserPlus, FileDown, Volume2,
  Printer, Square, Circle, Pause, Play, StopCircle, Timer,
  BellRing, CheckCheck, AlertCircle, GitCompare, FileEdit, CalendarDays,
} from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import useI18n from "@/i18n";


// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = "analyze" | "multi" | "voice" | "history" | "exercises" | "specialists" | "pei" | "dashboard" | "benchmarks" | "compare" | "worksheets" | "monthly";

interface AxisScore { score: number; observation: string; }
interface Disorder { name: string; nameAr: string; probability: "high" | "medium" | "low" | "none"; indicators: string[]; }

interface AnalysisResult {
  id: number; overallScore: number;
  axes: { letterFormation: AxisScore; sizeProportion: AxisScore; spacingOrganization: AxisScore; baseline: AxisScore; reversals: AxisScore; pressureSpeed: AxisScore; consistency: AxisScore; };
  disorders: Disorder[]; detailedReport: string; recommendations: string; imageUrl: string;
  studentName: string; studentAge?: number; studentGrade?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADES = ["سنة 1 ابتدائي", "سنة 2 ابتدائي", "سنة 3 ابتدائي", "سنة 4 ابتدائي", "سنة 5 ابتدائي", "سنة 6 ابتدائي"];
const WRITING_TYPES = [
  { value: "copy", label: "نسخ من السبورة" }, { value: "dictation", label: "إملاء" },
  { value: "free_expression", label: "تعبير حر" }, { value: "math", label: "تمارين رياضيات" },
];

const AXIS_CONFIG = [
  { key: "letterFormation", label: "تشكيل الحروف", icon: PenTool, description: "جودة رسم الحروف ووضوحها" },
  { key: "sizeProportion", label: "الحجم والتناسب", icon: Ruler, description: "تناسق حجم الحروف" },
  { key: "spacingOrganization", label: "التباعد والتنظيم", icon: AlignCenter, description: "المسافات والتنظيم على الصفحة" },
  { key: "baseline", label: "خط الأساس", icon: TrendingUp, description: "الالتزام بالسطر" },
  { key: "reversals", label: "الانعكاسات", icon: RotateCcw, description: "حروف مقلوبة أو معكوسة" },
  { key: "pressureSpeed", label: "الضغط والسرعة", icon: Gauge, description: "ضغط القلم وسرعة الكتابة" },
  { key: "consistency", label: "الاتساق العام", icon: Eye, description: "ثبات الجودة عبر الصفحة" },
];

const TAB_CONFIG = [
  { key: "analyze" as MainTab, label: "تحليل عينة", icon: Brain },
  { key: "multi" as MainTab, label: "تحليل متعدد", icon: BarChart3 },
  { key: "voice" as MainTab, label: "تحليل صوتي", icon: Mic },
  { key: "exercises" as MainTab, label: "تمارين علاجية", icon: Dumbbell },
  { key: "specialists" as MainTab, label: "الأخصائيون", icon: UserPlus },
  { key: "pei" as MainTab, label: "خطة تدخل", icon: ClipboardList },
  { key: "compare" as MainTab, label: "مقارنة", icon: GitCompare },
  { key: "worksheets" as MainTab, label: "أوراق عمل", icon: FileEdit },
  { key: "benchmarks" as MainTab, label: "المعايير العمرية", icon: Target },
  { key: "monthly" as MainTab, label: "تقرير شهري", icon: CalendarDays },
  { key: "dashboard" as MainTab, label: "لوحة الإحصائيات", icon: Activity },
  { key: "history" as MainTab, label: "السجل", icon: History },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}
function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}
function getScoreLabel(score: number): string {
  if (score >= 80) return "ممتاز";
  if (score >= 70) return "جيد";
  if (score >= 50) return "مقبول";
  if (score >= 30) return "ضعيف";
  return "ضعيف جداً";
}
function getProbabilityBadge(probability: string) {
  switch (probability) {
    case "high": return <Badge className="bg-red-100 text-red-700 border-red-200">مرتفع</Badge>;
    case "medium": return <Badge className="bg-amber-100 text-amber-700 border-amber-200">متوسط</Badge>;
    case "low": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">منخفض</Badge>;
    default: return <Badge className="bg-green-100 text-green-700 border-green-200">غير موجود</Badge>;
  }
}

// ─── Print Helper ────────────────────────────────────────────────────────────

function handlePrintReport(title: string, contentHtml: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) { toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة"); return; }
  printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Kufi Arabic', sans-serif; direction: rtl; padding: 30px; color: #1a1a1a; line-height: 1.8; }
    h1 { font-size: 22px; color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { font-size: 18px; color: #1e3a5f; margin: 20px 0 10px; }
    h3 { font-size: 16px; color: #374151; margin: 15px 0 8px; }
    p { margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: right; }
    th { background-color: #eff6ff; font-weight: 700; }
    .score-high { color: #059669; font-weight: bold; }
    .score-mid { color: #d97706; font-weight: bold; }
    .score-low { color: #dc2626; font-weight: bold; }
    .disclaimer { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 13px; }
    .header-logo { text-align: center; margin-bottom: 20px; }
    .header-logo img { height: 50px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    @media print { body { padding: 15px; } @page { size: A4; margin: 1.5cm; } }
  </style>
</head>
<body>
  <div class="header-logo"><h1>${title}</h1></div>
  ${contentHtml}
  <div class="footer"><p>Leader Academy - منصة الذكاء الاصطناعي التربوي</p><p>© 2026 جميع الحقوق محفوظة</p></div>
  <div class="disclaimer">⚠️ تنبيه: هذا التقرير أولي ولا يُعتبر تشخيصاً طبياً. يُرجى استشارة أخصائي مختص.</div>
</body>
</html>`);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
}

function buildAnalysisReportHtml(result: AnalysisResult): string {
  const axisRows = AXIS_CONFIG.map(a => {
    const score = (result.axes as any)?.[a.key]?.score ?? 0;
    const obs = (result.axes as any)?.[a.key]?.observation ?? "";
    const cls = score >= 70 ? "score-high" : score >= 40 ? "score-mid" : "score-low";
    return `<tr><td>${a.label}</td><td class="${cls}">${score}/100</td><td>${obs}</td></tr>`;
  }).join("");

  const disorderRows = (result.disorders || []).map((d: Disorder) => {
    const probLabel = d.probability === "high" ? "مرتفع" : d.probability === "medium" ? "متوسط" : d.probability === "low" ? "منخفض" : "غير موجود";
    return `<tr><td>${d.nameAr}</td><td>${probLabel}</td><td>${(d.indicators || []).join("، ")}</td></tr>`;
  }).join("");

  const overallCls = result.overallScore >= 70 ? "score-high" : result.overallScore >= 40 ? "score-mid" : "score-low";

  return `
    <h2>معلومات التلميذ</h2>
    <table><tr><th>الاسم</th><td>${result.studentName || "غير محدد"}</td><th>العمر</th><td>${result.studentAge || "-"}</td><th>المستوى</th><td>${result.studentGrade || "-"}</td></tr></table>
    <h2>النتيجة العامة: <span class="${overallCls}">${result.overallScore}/100 (${getScoreLabel(result.overallScore)})</span></h2>
    <h2>تحليل المحاور السبعة</h2>
    <table><thead><tr><th>المحور</th><th>الدرجة</th><th>الملاحظة</th></tr></thead><tbody>${axisRows}</tbody></table>
    <h2>الاضطرابات المحتملة</h2>
    <table><thead><tr><th>الاضطراب</th><th>الاحتمال</th><th>المؤشرات</th></tr></thead><tbody>${disorderRows}</tbody></table>
    ${result.recommendations ? `<h2>التوصيات البيداغوجية</h2><p>${result.recommendations.replace(/\n/g, "<br>")}</p>` : ""}
  `;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HandwritingAnalyzer() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("analyze");
  const [analysisStep, setAnalysisStep] = useState<"upload" | "analyzing" | "results">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState<string>("");
  const [studentGrade, setStudentGrade] = useState("");
  const [gender, setGender] = useState<string>("");
  const [writingType, setWritingType] = useState("copy");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const analyzeMutation = trpc.handwriting.analyzeHandwriting.useMutation({
    onSuccess: (data: any) => {
      setResult(data as AnalysisResult); setAnalysisStep("results"); toast.success("تم التحليل بنجاح!");
      if (data.autoNotified && data.autoNotified.length > 0) {
        toast.info(`تم إرسال تنبيه تلقائي بالبريد إلى: ${data.autoNotified.join("، ")}`, { duration: 8000, icon: "🚨" });
      }
    },
    onError: (error) => { toast.error(error.message || "فشل في تحليل خط اليد."); setAnalysisStep("upload"); },
  });
  const exportPdfMutation = trpc.handwriting.exportPdf.useMutation({
    onSuccess: (data) => { window.open(data.pdfUrl, "_blank"); toast.success("تم إنشاء التقرير!"); },
    onError: () => { toast.error("فشل في إنشاء PDF"); },
  });
  const exportParentMutation = trpc.handwriting.exportParentReport.useMutation({
    onSuccess: (data) => { window.open(data.pdfUrl, "_blank"); toast.success("تم إنشاء تقرير الأولياء!"); },
    onError: () => { toast.error("فشل في إنشاء تقرير الأولياء"); },
  });

  // File handling
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) { toast.error("يرجى رفع صورة بصيغة PNG أو JPG أو WEBP"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("حجم الصورة يجب أن لا يتجاوز 10 ميغابايت"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) { toast.error("يرجى رفع صورة أولاً"); return; }
    setAnalysisStep("analyzing");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      analyzeMutation.mutate({
        imageBase64: base64, mimeType: imageFile.type,
        studentName: studentName || undefined, studentAge: studentAge ? parseInt(studentAge) : undefined,
        studentGrade: studentGrade || undefined, writingType: writingType as any,
        teacherNotes: teacherNotes || undefined,
      });
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, studentName, studentAge, studentGrade, writingType, teacherNotes, analyzeMutation]);

  const handleReset = useCallback(() => {
    setAnalysisStep("upload"); setResult(null); clearImage();
    setStudentName(""); setStudentAge(""); setStudentGrade(""); setGender(""); setWritingType("copy"); setTeacherNotes("");
    setShowDetailedReport(false); setShowRecommendations(true);
  }, [clearImage]);

  if (authLoading) {
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>);
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50" dir="rtl">
        <Card className="max-w-md w-full mx-4"><CardContent className="pt-6 text-center">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">محلل خط اليد الذكي</h2>
          <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى هذه الأداة</p>
          <a href={getLoginUrl()}><Button className="w-full bg-blue-600 hover:bg-blue-700">تسجيل الدخول</Button></a>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" dir="rtl">
      <ToolPageHeader
        icon={Brain}
        nameAr="محلل خط اليد الذكي"
        nameFr="Analyseur d'Écriture Intelligent"
        nameEn="Smart Handwriting Analyzer"
        descAr="تحليل ذكي لخط اليد بالذكاء الاصطناعي"
        descFr="Analyse intelligente de l'écriture manuscrite par l'IA"
        descEn="AI-powered handwriting analysis"
        gradient="linear-gradient(135deg, #1e40af, #4338ca)"
        backTo="/"
      />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            {TAB_CONFIG.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {activeTab === "analyze" && (
          analysisStep === "upload" ? (
            <UploadStep
              imagePreview={imagePreview} studentName={studentName} studentAge={studentAge}
              studentGrade={studentGrade} gender={gender} writingType={writingType} teacherNotes={teacherNotes}
              fileInputRef={fileInputRef} onFileSelect={handleFileSelect} onDrop={handleDrop}
              onClearImage={clearImage} onStudentNameChange={setStudentName} onStudentAgeChange={setStudentAge}
              onStudentGradeChange={setStudentGrade} onGenderChange={setGender}
              onWritingTypeChange={setWritingType} onTeacherNotesChange={setTeacherNotes}
              onAnalyze={handleAnalyze}
            />
          ) : analysisStep === "analyzing" ? (
            <AnalyzingStep />
          ) : result ? (
            <ResultsStep
              result={result} showDetailedReport={showDetailedReport} showRecommendations={showRecommendations}
              onToggleReport={() => setShowDetailedReport(!showDetailedReport)}
              onToggleRecommendations={() => setShowRecommendations(!showRecommendations)}
              onExportPdf={() => exportPdfMutation.mutate({ analysisId: result.id })}
              onExportParent={() => exportParentMutation.mutate({ analysisId: result.id })}
              isExporting={exportPdfMutation.isPending} isExportingParent={exportParentMutation.isPending}
              onReset={handleReset}
              onPrint={() => handlePrintReport("تقرير تحليل خط اليد - " + (result.studentName || "تلميذ"), buildAnalysisReportHtml(result))}
            />
          ) : null
        )}
        {activeTab === "multi" && <MultiSampleTab />}
        {activeTab === "voice" && <VoiceAnalysisTab />}
        {activeTab === "exercises" && <ExercisesTab />}
        {activeTab === "specialists" && <SpecialistsTab />}
        {activeTab === "pei" && <PEITab />}
        {activeTab === "benchmarks" && <BenchmarksTab />}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "compare" && <CompareTab />}
        {activeTab === "worksheets" && <WorksheetsTab />}
        {activeTab === "monthly" && <MonthlyReportTab />}
      </main>

      {/* Ethical Disclaimer (always visible) */}
      <div className="container mx-auto px-4 pb-6 max-w-6xl">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">تنبيه أخلاقي وقانوني</p>
              <p>هذا التحليل أداة مساعدة أولية وليس تشخيصاً طبياً رسمياً. يُنصح بشدة باستشارة أخصائي نفسي تربوي أو أخصائي أرطوفونيا.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Upload Step ──────────────────────────────────────────────────────────────

function UploadStep({ imagePreview, studentName, studentAge, studentGrade, gender, writingType, teacherNotes, fileInputRef, onFileSelect, onDrop, onClearImage, onStudentNameChange, onStudentAgeChange, onStudentGradeChange, onGenderChange, onWritingTypeChange, onTeacherNotesChange, onAnalyze }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Upload */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-blue-600" />رفع صورة خط اليد</CardTitle></CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative"><img src={imagePreview} alt="معاينة" className="w-full rounded-lg border max-h-[300px] object-contain bg-white" />
                <button onClick={onClearImage} className="absolute top-2 start-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-700 font-medium mb-1">اسحب الصورة هنا أو اضغط للرفع</p>
                <p className="text-sm text-blue-500">PNG, JPG, WEBP - حتى 10 ميغابايت</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onFileSelect} />
          </CardContent>
        </Card>
      </div>
      {/* Right: Student Info */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-blue-600" />معلومات التلميذ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>اسم التلميذ</Label><Input placeholder="الاسم الأول" value={studentName} onChange={(e) => onStudentNameChange(e.target.value)} className="mt-1" /></div>
              <div><Label>العمر</Label><Input type="number" min="5" max="12" placeholder="5-12" value={studentAge} onChange={(e) => onStudentAgeChange(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>المستوى الدراسي</Label>
                <Select value={studentGrade} onValueChange={onStudentGradeChange}><SelectTrigger className="mt-1"><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                  <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label>الجنس</Label>
                <Select value={gender} onValueChange={onGenderChange}><SelectTrigger className="mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">ذكر</SelectItem><SelectItem value="female">أنثى</SelectItem></SelectContent></Select>
              </div>
            </div>
            <Separator />
            <div><Label>نوع الكتابة</Label>
              <Select value={writingType} onValueChange={onWritingTypeChange}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{WRITING_TYPES.map((wt) => <SelectItem key={wt.value} value={wt.value}>{wt.label}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>ملاحظات المعلم</Label>
              <Textarea placeholder="أي ملاحظات سلوكية..." value={teacherNotes} onChange={(e) => onTeacherNotesChange(e.target.value)} className="mt-1 min-h-[80px]" />
            </div>
          </CardContent>
        </Card>
        <Button className="w-full h-14 text-lg bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" onClick={onAnalyze} disabled={!imagePreview}>
          <Brain className="h-5 w-5 ms-2" />ابدأ التحليل الذكي<Sparkles className="h-5 w-5 me-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Analyzing Step ───────────────────────────────────────────────────────────

function AnalyzingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center animate-pulse"><Brain className="h-12 w-12 text-blue-600" /></div>
        <div className="absolute -top-2 -end-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-bounce"><Sparkles className="h-4 w-4 text-white" /></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">جارٍ تحليل خط اليد...</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">يقوم الذكاء الاصطناعي بتحليل 7 محاور مختلفة</p>
      <div className="w-64"><Progress value={65} className="h-2" /></div>
      <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-gray-500">
        {AXIS_CONFIG.map((axis, i) => (
          <div key={axis.key} className="flex items-center gap-2">
            <Loader2 className={`h-3.5 w-3.5 ${i < 4 ? "text-green-500" : "animate-spin text-blue-500"}`} />
            <span>{axis.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results Step (with Progress Chart + Parent Report) ──────────────────────

function ResultsStep({ result, showDetailedReport, showRecommendations, onToggleReport, onToggleRecommendations, onExportPdf, onExportParent, isExporting, isExportingParent, onReset, onPrint }: any) {
  const [showProgress, setShowProgress] = useState(false);
  const progressQuery = trpc.handwriting.getStudentProgress.useQuery(
    { studentName: result.studentName },
    { enabled: showProgress && !!result.studentName }
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">نتائج التحليل</h2>
          {result.studentName && <Badge variant="outline" className="text-blue-600 border-blue-200"><User className="h-3 w-3 ms-1" />{result.studentName}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowProgress(!showProgress)}>
            <LineChart className="h-4 w-4 ms-1" />{showProgress ? "إخفاء التقدم" : "منحنى التقدم"}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportParent} disabled={isExportingParent}>
            {isExportingParent ? <Loader2 className="h-4 w-4 animate-spin ms-1" /> : <Users className="h-4 w-4 ms-1" />}تقرير الأولياء
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPdf} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin ms-1" /> : <Download className="h-4 w-4 ms-1" />}تصدير PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint} className="text-green-700 border-green-300 hover:bg-green-50">
            <Printer className="h-4 w-4 ms-1" />طباعة مباشرة
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}><PenTool className="h-4 w-4 ms-1" />تحليل جديد</Button>
        </div>
      </div>

      {/* IMPROVEMENT 1: Progress Chart */}
      {showProgress && progressQuery.data && progressQuery.data.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><LineChart className="h-5 w-5 text-blue-600" />منحنى تقدم {result.studentName}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex items-end gap-4 min-w-[400px] h-48 border-b border-e border-gray-200 p-4 relative">
                {progressQuery.data.map((point: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`text-xs font-bold ${getScoreColor(point.overallScore)}`}>{point.overallScore}</span>
                    <div className={`w-full rounded-t-lg ${getScoreBg(point.overallScore)} transition-all`} style={{ height: `${(point.overallScore / 100) * 140}px` }} />
                    <span className="text-[10px] text-gray-500">{new Date(point.date).toLocaleDateString("ar-TN", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
            </div>
            {progressQuery.data.length >= 2 && (
              <div className="mt-3 text-sm text-gray-600">
                {(() => {
                  const first = progressQuery.data[0].overallScore;
                  const last = progressQuery.data[progressQuery.data.length - 1].overallScore;
                  const diff = last - first;
                  return diff > 0 ? <span className="text-emerald-600 font-medium">تحسن بمقدار {diff} نقطة منذ أول تحليل</span>
                    : diff < 0 ? <span className="text-red-600 font-medium">تراجع بمقدار {Math.abs(diff)} نقطة منذ أول تحليل</span>
                    : <span className="text-gray-500">لا تغيير في الدرجة</span>;
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Score + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={result.overallScore >= 70 ? "#059669" : result.overallScore >= 40 ? "#d97706" : "#dc2626"} strokeWidth="10" strokeDasharray={`${(result.overallScore / 100) * 327} 327`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                <span className="text-xs text-gray-500">من 100</span>
              </div>
            </div>
            <p className={`text-lg font-semibold ${getScoreColor(result.overallScore)}`}>{getScoreLabel(result.overallScore)}</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2"><CardContent className="pt-6">
          <img src={result.imageUrl} alt="خط يد التلميذ" className="w-full rounded-lg border max-h-[300px] object-contain bg-white" />
        </CardContent></Card>
      </div>

      {/* 7 Axes */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5 text-blue-600" />تحليل المحاور السبعة</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AXIS_CONFIG.map((axis) => {
              const axisData = result.axes[axis.key as keyof typeof result.axes];
              if (!axisData) return null;
              return (
                <div key={axis.key} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><axis.icon className="h-4 w-4 text-blue-600" /><span className="font-medium text-sm">{axis.label}</span></div>
                    <span className={`font-bold text-lg ${getScoreColor(axisData.score)}`}>{axisData.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${getScoreBg(axisData.score)}`} style={{ width: `${axisData.score}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{axisData.observation}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disorders */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" />الاضطرابات المحتملة</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="text-end p-3 font-semibold">الاضطراب</th><th className="text-center p-3 font-semibold">الاحتمال</th><th className="text-end p-3 font-semibold">المؤشرات</th></tr></thead>
              <tbody>
                {result.disorders.map((d: Disorder, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3"><div className="font-medium">{d.nameAr}</div><div className="text-xs text-gray-400">{d.name}</div></td>
                    <td className="p-3 text-center">{getProbabilityBadge(d.probability)}</td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{d.indicators.map((ind, j) => <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{ind}</span>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report */}
      <Card>
        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggleReport}>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />التقرير المفصل</div>
            {showDetailedReport ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {showDetailedReport && <CardContent><div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dir="rtl"><Streamdown>{result.detailedReport}</Streamdown></div></CardContent>}
      </Card>

      {/* Recommendations */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="cursor-pointer hover:bg-green-50 transition-colors" onClick={onToggleRecommendations}>
          <CardTitle className="text-lg flex items-center justify-between text-green-800">
            <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-green-600" />التوصيات البيداغوجية</div>
            {showRecommendations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {showRecommendations && <CardContent><div className="prose prose-sm max-w-none text-green-900 leading-relaxed" dir="rtl"><Streamdown>{result.recommendations}</Streamdown></div></CardContent>}
      </Card>
    </div>
  );
}

// ─── IMPROVEMENT 5: Multi-Sample Analysis Tab ────────────────────────────────

function MultiSampleTab() {
  const [samples, setSamples] = useState<Array<{ file: File; preview: string; writingType: string }>>([]);
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = trpc.handwriting.analyzeMultipleSamples.useMutation({
    onSuccess: (data) => { setResult(data); toast.success("تم التحليل المقارن بنجاح!"); },
    onError: (err) => { toast.error(err.message || "فشل في التحليل"); },
  });

  const addSample = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || samples.length >= 5) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSamples(prev => [...prev, { file, preview: ev.target?.result as string, writingType: "copy" }]);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (samples.length < 2) { toast.error("يجب رفع عينتين على الأقل"); return; }
    const sampleData = await Promise.all(samples.map(async (s) => {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string).split(",")[1]);
        reader.readAsDataURL(s.file);
      });
      return { imageBase64: base64, mimeType: s.file.type, writingType: s.writingType as any };
    }));
    mutation.mutate({
      samples: sampleData, studentName: studentName || undefined,
      studentAge: studentAge ? parseInt(studentAge) : undefined, studentGrade: studentGrade || undefined,
      teacherNotes: teacherNotes || undefined,
    });
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />نتائج التحليل المقارن</h2>
          <Button variant="outline" onClick={() => { setResult(null); setSamples([]); }}>تحليل جديد</Button>
        </div>
        {/* Sample scores comparison */}
        {result.sampleScores && (
          <Card>
            <CardHeader><CardTitle className="text-lg">مقارنة العينات</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.sampleScores.map((s: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 border text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
                    <div className="text-sm text-gray-600 mt-1">العينة {i + 1} ({s.writingType})</div>
                    <p className="text-xs text-gray-500 mt-2">{s.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Comparative report */}
        {result.comparativeReport && (
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />التقرير المقارن</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none" dir="rtl"><Streamdown>{result.comparativeReport}</Streamdown></div></CardContent>
          </Card>
        )}
        {result.recommendations && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader><CardTitle className="text-lg text-green-800 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-green-600" />التوصيات</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none text-green-900" dir="rtl"><Streamdown>{result.recommendations}</Streamdown></div></CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />تحليل متعدد العينات (2-5 عينات)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {samples.map((s, i) => (
              <div key={i} className="relative border rounded-lg overflow-hidden">
                <img src={s.preview} alt={`عينة ${i + 1}`} className="w-full h-24 object-cover" />
                <button onClick={() => setSamples(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 start-1 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                <Select value={s.writingType} onValueChange={(v) => setSamples(prev => prev.map((item, j) => j === i ? { ...item, writingType: v } : item))}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{WRITING_TYPES.map(wt => <SelectItem key={wt.value} value={wt.value}>{wt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            {samples.length < 5 && (
              <div className="border-2 border-dashed rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-gray-50" onClick={() => fileRef.current?.click()}>
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addSample} />
          <div className="grid grid-cols-3 gap-4">
            <Input placeholder="اسم التلميذ" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            <Input type="number" placeholder="العمر" value={studentAge} onChange={(e) => setStudentAge(e.target.value)} />
            <Select value={studentGrade} onValueChange={setStudentGrade}><SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
              <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAnalyze} disabled={samples.length < 2 || mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Brain className="h-4 w-4 ms-2" />}
            تحليل مقارن ({samples.length} عينات)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── IMPROVEMENT 7: Voice Analysis Tab ───────────────────────────────────────

function VoiceAnalysisTab() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [result, setResult] = useState<any>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  // Browser recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      toast.error("يرجى السماح بالوصول إلى الميكروفون");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const mutation = trpc.handwriting.analyzeVoice.useMutation({
    onSuccess: (data) => { setResult(data); toast.success("تم تحليل القراءة بنجاح!"); },
    onError: (err) => { toast.error(err.message || "فشل في التحليل الصوتي"); },
  });

  const handleAnalyze = async () => {
    if (!audioFile) { toast.error("يرجى تسجيل أو رفع ملف صوتي"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      mutation.mutate({
        audioBase64: base64, mimeType: audioFile.type || "audio/webm",
        studentName: studentName || undefined, studentAge: studentAge ? parseInt(studentAge) : undefined,
        studentGrade: studentGrade || undefined,
      });
    };
    reader.readAsDataURL(audioFile);
  };

  if (result) {
    const scores = [
      { label: "الطلاقة", score: result.fluencyScore, icon: Activity },
      { label: "النطق", score: result.pronunciationScore, icon: Volume2 },
      { label: "سرعة القراءة", score: result.readingSpeedScore, icon: Gauge },
      { label: "الفهم", score: result.comprehensionScore, icon: BookOpen },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><Mic className="h-5 w-5 text-purple-600" />نتائج التحليل الصوتي</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => {
              const voiceHtml = `
                <h2>نتائج التحليل الصوتي</h2>
                <table><thead><tr><th>المحور</th><th>الدرجة</th></tr></thead>
                <tbody>
                  <tr><td>الطلاقة</td><td>${result.fluencyScore}/100</td></tr>
                  <tr><td>النطق</td><td>${result.pronunciationScore}/100</td></tr>
                  <tr><td>سرعة القراءة</td><td>${result.readingSpeedScore}/100</td></tr>
                  <tr><td>الفهم</td><td>${result.comprehensionScore}/100</td></tr>
                </tbody></table>
                ${result.transcription ? `<h2>النص المستخرج</h2><p>${result.transcription}</p>` : ""}
                ${result.report ? `<h2>التقرير</h2><p>${result.report.replace(/\n/g, "<br>")}</p>` : ""}
              `;
              handlePrintReport("تقرير التحليل الصوتي", voiceHtml);
            }}>
              <Printer className="h-4 w-4 ms-1" />طباعة مباشرة
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setAudioFile(null); }}>تحليل جديد</Button>
          </div>
        </div>
        {result.transcription && (
          <Card><CardHeader><CardTitle className="text-lg">النص المستخرج</CardTitle></CardHeader>
            <CardContent><p className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed">{result.transcription}</p></CardContent></Card>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scores.map(s => (
            <Card key={s.label}><CardContent className="pt-4 text-center">
              <s.icon className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className={`text-3xl font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </CardContent></Card>
          ))}
        </div>
        {result.report && (
          <Card><CardHeader><CardTitle className="text-lg">التقرير</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none" dir="rtl"><Streamdown>{result.report}</Streamdown></div></CardContent></Card>
        )}
        {result.combinedReport && (
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader><CardTitle className="text-lg text-purple-800">التقرير المدمج (كتابة + قراءة)</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none text-purple-900" dir="rtl"><Streamdown>{result.combinedReport}</Streamdown></div></CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5 text-purple-600" />تحليل القراءة الصوتية</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">سجّل قراءة التلميذ مباشرة من المتصفح أو ارفع ملفاً صوتياً لتحليل الطلاقة والنطق والسرعة والفهم.</p>

        {/* Recording Section */}
        <div className="border-2 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-indigo-50 space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
              <Mic className="h-5 w-5" />تسجيل مباشر من المتصفح
            </h3>
            {isRecording && (
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-amber-500" : "bg-red-500 animate-pulse"}`} />
                <span className="text-2xl font-mono font-bold text-purple-900">{formatTime(recordingTime)}</span>
                <span className="text-sm text-purple-600">{isPaused ? "مؤقت" : "جاري التسجيل..."}</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              {!isRecording && !audioFile && (
                <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14 p-0">
                  <Mic className="h-6 w-6" />
                </Button>
              )}
              {isRecording && (
                <>
                  <Button onClick={pauseRecording} variant="outline" className="rounded-full h-12 w-12 p-0 border-purple-300">
                    {isPaused ? <Play className="h-5 w-5 text-green-600" /> : <Pause className="h-5 w-5 text-amber-600" />}
                  </Button>
                  <Button onClick={stopRecording} className="bg-gray-700 hover:bg-gray-800 text-white rounded-full h-14 w-14 p-0">
                    <StopCircle className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            {!isRecording && !audioFile && <p className="text-xs text-purple-500 mt-2">اضغط على الزر الأحمر لبدء التسجيل</p>}
          </div>

          {/* Audio Preview */}
          {audioFile && !isRecording && (
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-800">{audioFile.name}</span>
                  <span className="text-sm text-gray-500">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  {recordingTime > 0 && <Badge variant="outline" className="text-purple-600"><Timer className="h-3 w-3 ms-1" />{formatTime(recordingTime)}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={resetRecording} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4 ms-1" />حذف
                </Button>
              </div>
              {audioUrl && <audio controls src={audioUrl} className="w-full" />}
            </div>
          )}
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-sm text-gray-500 font-medium">أو</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        {/* File Upload Section */}
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center bg-purple-50/30 cursor-pointer hover:bg-purple-50/60 transition-colors" onClick={() => { if (!isRecording) audioRef.current?.click(); }}>
          {!audioFile ? (
            <div><Volume2 className="h-8 w-8 text-purple-400 mx-auto mb-2" /><p className="text-purple-700 font-medium">اضغط لرفع تسجيل صوتي من الجهاز</p>
              <p className="text-sm text-purple-500">MP3, WAV, WEBM, OGG - حتى 16 MB</p></div>
          ) : (
            <div><CheckCheck className="h-8 w-8 text-green-500 mx-auto mb-2" /><p className="text-green-700 font-medium">تم تحميل الملف - اضغط لتغييره</p></div>
          )}
        </div>
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => {
          if (e.target.files?.[0]) {
            setAudioFile(e.target.files[0]);
            setAudioUrl(URL.createObjectURL(e.target.files[0]));
            setRecordingTime(0);
          }
        }} />

        {/* Student Info */}
        <div className="grid grid-cols-3 gap-4">
          <Input placeholder="اسم التلميذ" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Input type="number" placeholder="العمر" value={studentAge} onChange={(e) => setStudentAge(e.target.value)} />
          <Select value={studentGrade} onValueChange={setStudentGrade}><SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
            <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAnalyze} disabled={!audioFile || mutation.isPending || isRecording}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Mic className="h-4 w-4 ms-2" />}تحليل القراءة
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── IMPROVEMENT 3: Exercises Tab ────────────────────────────────────────────

function ExercisesTab() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const historyQuery = trpc.handwriting.getAnalyses.useQuery({});
  const exercisesQuery = trpc.handwriting.getExercisesForAnalysis.useQuery(
    { analysisId: selectedAnalysisId! },
    { enabled: !!selectedAnalysisId }
  );

  const typeLabels: Record<string, string> = {
    motor: "حركي", visual: "بصري", cognitive: "معرفي",
    classroom_adaptation: "تكييف صفي", home_activity: "نشاط منزلي",
  };
  const typeColors: Record<string, string> = {
    motor: "bg-blue-100 text-blue-700", visual: "bg-purple-100 text-purple-700",
    cognitive: "bg-amber-100 text-amber-700", classroom_adaptation: "bg-green-100 text-green-700",
    home_activity: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-blue-600" />تمارين علاجية مخصصة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">اختر تحليلاً سابقاً لتوليد تمارين علاجية مخصصة بناءً على نقاط الضعف المكتشفة.</p>
          <Select value={selectedAnalysisId?.toString() || ""} onValueChange={(v) => setSelectedAnalysisId(parseInt(v))}>
            <SelectTrigger><SelectValue placeholder="اختر تحليلاً سابقاً" /></SelectTrigger>
            <SelectContent>
              {(historyQuery.data || []).map((a: any) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.studentName || "تلميذ"} - {a.overallScore}/100 - {new Date(a.createdAt).toLocaleDateString("ar-TN")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {exercisesQuery.isPending && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}

      {exercisesQuery.data && (
        <>
          {exercisesQuery.data.weakAxes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">المحاور الضعيفة:</span>
              {exercisesQuery.data.weakAxes.map((axis: string) => {
                const config = AXIS_CONFIG.find(a => a.key === axis);
                return <Badge key={axis} variant="outline" className="text-red-600 border-red-200">{config?.label || axis}</Badge>;
              })}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercisesQuery.data.exercises.map((ex: any, i: number) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-800">{ex.title}</h3>
                    <Badge className={typeColors[ex.type] || "bg-gray-100 text-gray-700"}>{typeLabels[ex.type] || ex.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{ex.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>المدة: {ex.duration} دقيقة</span>
                    <span>الصعوبة: {ex.difficulty === "easy" ? "سهل" : ex.difficulty === "medium" ? "متوسط" : "صعب"}</span>
                  </div>
                  {ex.materials && <p className="text-xs text-gray-500">المواد: {ex.materials}</p>}
                  {ex.steps && ex.steps.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">الخطوات:</p>
                      <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        {ex.steps.map((step: string, j: number) => <li key={j}>{step}</li>)}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── IMPROVEMENT 6: Specialists Tab ─────────────────────────────────────────

function SpecialistsTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("orthophonist");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const utils = trpc.useUtils();

  const specialistsQuery = trpc.handwriting.getSpecialists.useQuery();
  const addMutation = trpc.handwriting.addSpecialist.useMutation({
    onSuccess: () => { utils.handwriting.getSpecialists.invalidate(); setShowAdd(false); setName(""); toast.success("تمت إضافة الأخصائي"); },
    onError: () => toast.error("فشل في الإضافة"),
  });
  const removeMutation = trpc.handwriting.removeSpecialist.useMutation({
    onSuccess: () => { utils.handwriting.getSpecialists.invalidate(); toast.success("تم الحذف"); },
  });
  const notifyMutation = trpc.handwriting.notifySpecialist.useMutation({
    onSuccess: (data) => {
      if (data.emailSent) {
        toast.success(`تم إرسال الإشعار بالبريد الإلكتروني إلى ${data.specialistName} (${data.specialistEmail})`);
      } else if (data.specialistEmail) {
        toast.warning(`تم إعداد الإشعار لـ ${data.specialistName} لكن فشل إرسال البريد. تحقق من إعدادات SMTP.`);
      } else {
        toast.success(`تم إعداد الإشعار لـ ${data.specialistName}. أضف بريده الإلكتروني للإرسال التلقائي.`);
      }
    },
    onError: () => toast.error("فشل في الإشعار"),
  });

  const specialtyLabels: Record<string, string> = {
    orthophonist: "أخصائي أرطوفونيا", psychologist: "أخصائي نفسي",
    occupational_therapist: "أخصائي علاج وظيفي", other: "أخرى",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-600" />جهات اتصال الأخصائيين</h2>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm"><Plus className="h-4 w-4 ms-1" />إضافة أخصائي</Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>الاسم</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
              <div><Label>التخصص</Label>
                <Select value={specialty} onValueChange={setSpecialty}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orthophonist">أخصائي أرطوفونيا</SelectItem>
                    <SelectItem value="psychologist">أخصائي نفسي</SelectItem>
                    <SelectItem value="occupational_therapist">أخصائي علاج وظيفي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>البريد الإلكتروني</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
              <div><Label>الهاتف</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" /></div>
              <div><Label>المدرسة</Label><Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-1" /></div>
            </div>
            <Button onClick={() => addMutation.mutate({ name, specialty: specialty as any, email: email || undefined, phone: phone || undefined, schoolName: schoolName || undefined })} disabled={!name || addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-1" /> : null}حفظ
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(specialistsQuery.data || []).map((s: any) => (
          <Card key={s.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{s.name}</h3>
                  <Badge variant="outline" className="mt-1">{specialtyLabels[s.specialty] || s.specialty}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeMutation.mutate({ id: s.id })}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {s.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{s.email}</div>}
                {s.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{s.phone}</div>}
                {s.schoolName && <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5" />{s.schoolName}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(specialistsQuery.data || []).length === 0 && !showAdd && (
        <Card className="py-12 text-center"><CardContent><UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لم تتم إضافة أخصائيين بعد</p></CardContent></Card>
      )}
    </div>
  );
}

// ─── IMPROVEMENT 8: PEI Tab ──────────────────────────────────────────────────

function PEITab() {
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [specialistName, setSpecialistName] = useState("");
  const [parentName, setParentName] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const [result, setResult] = useState<any>(null);

  const historyQuery = trpc.handwriting.getAnalyses.useQuery({});
  const peisQuery = trpc.handwriting.getPEIs.useQuery();

  const generateMutation = trpc.handwriting.generatePEI.useMutation({
    onSuccess: (data) => { setResult(data); toast.success("تم إنشاء خطة التدخل!"); },
    onError: (err) => toast.error(err.message || "فشل في إنشاء الخطة"),
  });
  const exportMutation = trpc.handwriting.exportPEI.useMutation({
    onSuccess: (data) => { window.open(data.pdfUrl, "_blank"); toast.success("تم تصدير الخطة!"); },
    onError: () => toast.error("فشل في التصدير"),
  });

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-purple-600" />خطة التدخل الفردية</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportMutation.mutate({ id: result.id })} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-1" /> : <FileDown className="h-4 w-4 ms-1" />}تصدير PDF
            </Button>
            <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => {
              const peiHtml = `
                <h2>معلومات التلميذ</h2>
                <table><tr><th>الاسم</th><td>${result.studentName || "-"}</td><th>العمر</th><td>${result.studentAge || "-"}</td><th>المستوى</th><td>${result.studentGrade || "-"}</td></tr></table>
                ${result.diagnosis ? `<h2>التشخيص</h2><p>${result.diagnosis.replace(/\n/g, "<br>")}</p>` : ""}
                ${result.objectives?.length ? `<h2>الأهداف</h2><table><thead><tr><th>الهدف</th><th>المدة</th><th>الحالة</th></tr></thead><tbody>${result.objectives.map((o: any) => `<tr><td>${o.objective}</td><td>${o.timeline}</td><td>${o.status}</td></tr>`).join("")}</tbody></table>` : ""}
                ${result.activities?.length ? `<h2>الأنشطة</h2><table><thead><tr><th>النشاط</th><th>التكرار</th><th>المسؤول</th></tr></thead><tbody>${result.activities.map((a: any) => `<tr><td>${a.activity}</td><td>${a.frequency}</td><td>${a.responsible}</td></tr>`).join("")}</tbody></table>` : ""}
              `;
              handlePrintReport("خطة التدخل الفردية - " + (result.studentName || "تلميذ"), peiHtml);
            }}>
              <Printer className="h-4 w-4 ms-1" />طباعة مباشرة
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>خطة جديدة</Button>
          </div>
        </div>
        {result.diagnosis && (
          <Card><CardHeader><CardTitle className="text-lg">التشخيص</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none" dir="rtl"><Streamdown>{result.diagnosis}</Streamdown></div></CardContent></Card>
        )}
        {result.objectives && result.objectives.length > 0 && (
          <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-blue-600" />الأهداف</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm"><thead><tr className="border-b bg-gray-50"><th className="p-3 text-end">الهدف</th><th className="p-3 text-center">المدة</th><th className="p-3 text-center">الحالة</th></tr></thead>
                <tbody>{result.objectives.map((o: any, i: number) => (
                  <tr key={i} className="border-b"><td className="p-3">{o.objective}</td><td className="p-3 text-center">{o.timeline}</td><td className="p-3 text-center"><Badge variant="outline">{o.status}</Badge></td></tr>
                ))}</tbody></table>
            </CardContent></Card>
        )}
        {result.interventions && (
          <Card><CardHeader><CardTitle className="text-lg">استراتيجيات التدخل</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none" dir="rtl"><Streamdown>{result.interventions}</Streamdown></div></CardContent></Card>
        )}
        {result.classroomAdaptations && (
          <Card className="border-green-200 bg-green-50/30"><CardHeader><CardTitle className="text-lg text-green-800">التكييفات الصفية</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none text-green-900" dir="rtl"><Streamdown>{result.classroomAdaptations}</Streamdown></div></CardContent></Card>
        )}
        {result.homeActivities && (
          <Card className="border-pink-200 bg-pink-50/30"><CardHeader><CardTitle className="text-lg text-pink-800 flex items-center gap-2"><Home className="h-5 w-5" />الأنشطة المنزلية</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm max-w-none text-pink-900" dir="rtl"><Streamdown>{result.homeActivities}</Streamdown></div></CardContent></Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-purple-600" />إنشاء خطة تدخل فردية (PEI)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><Label>اسم التلميذ *</Label><Input value={studentName} onChange={(e) => setStudentName(e.target.value)} className="mt-1" /></div>
            <div><Label>العمر</Label><Input type="number" value={studentAge} onChange={(e) => setStudentAge(e.target.value)} className="mt-1" /></div>
            <div><Label>المستوى</Label>
              <Select value={studentGrade} onValueChange={setStudentGrade}><SelectTrigger className="mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <Separator />
          <div><Label>ربط بتحليل خط يد سابق</Label>
            <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}><SelectTrigger className="mt-1"><SelectValue placeholder="اختياري" /></SelectTrigger>
              <SelectContent>
                {(historyQuery.data || []).map((a: any) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.studentName || "تلميذ"} - {a.overallScore}/100</SelectItem>
                ))}
              </SelectContent></Select>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <div><Label>اسم المعلم</Label><Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="mt-1" /></div>
            <div><Label>اسم الأخصائي</Label><Input value={specialistName} onChange={(e) => setSpecialistName(e.target.value)} className="mt-1" /></div>
            <div><Label>اسم الولي</Label><Input value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1" /></div>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => generateMutation.mutate({
            studentName, studentAge: studentAge ? parseInt(studentAge) : undefined,
            studentGrade: studentGrade || undefined, handwritingAnalysisId: selectedAnalysis ? parseInt(selectedAnalysis) : undefined,
            teacherName: teacherName || undefined, specialistName: specialistName || undefined, parentName: parentName || undefined,
          })} disabled={!studentName || generateMutation.isPending}>
            {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <ClipboardList className="h-4 w-4 ms-2" />}
            إنشاء خطة التدخل بالذكاء الاصطناعي
          </Button>
        </CardContent>
      </Card>

      {/* Existing PEIs */}
      {(peisQuery.data || []).length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">الخطط السابقة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(peisQuery.data || []).map((p: any) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{p.studentName}</h4>
                    <Badge variant="outline">{p.status === "draft" ? "مسودة" : p.status === "active" ? "نشطة" : "مكتملة"}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{p.studentGrade} - {new Date(p.createdAt).toLocaleDateString("ar-TN")}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => exportMutation.mutate({ id: p.id })} disabled={exportMutation.isPending}>
                    <FileDown className="h-3.5 w-3.5 ms-1" />تصدير PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── IMPROVEMENT 4: Benchmarks Tab ───────────────────────────────────────────

function BenchmarksTab() {
  const benchmarksQuery = trpc.handwriting.getAgeBenchmarks.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-blue-600" />المعايير العمرية لتطور الكتابة</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm mb-4">الدرجات المتوقعة لكل فئة عمرية بناءً على الدراسات العلمية في تطور الكتابة الحركية عند الأطفال.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-end font-semibold">العمر</th>
                  <th className="p-3 text-end font-semibold">المستوى</th>
                  <th className="p-3 text-center font-semibold">الدرجة المتوقعة</th>
                  {AXIS_CONFIG.map(a => <th key={a.key} className="p-3 text-center font-semibold text-xs">{a.label}</th>)}
                  <th className="p-3 text-end font-semibold">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {(benchmarksQuery.data || []).map((b: any) => (
                  <tr key={b.age} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold">{b.age} سنوات</td>
                    <td className="p-3">{b.grade}</td>
                    <td className="p-3 text-center"><span className={`font-bold ${getScoreColor(b.expectedScore)}`}>{b.expectedScore}</span></td>
                    <td className="p-3 text-center text-xs">{b.letterFormation}</td>
                    <td className="p-3 text-center text-xs">{b.sizeProportion}</td>
                    <td className="p-3 text-center text-xs">{b.spacingOrganization}</td>
                    <td className="p-3 text-center text-xs">{b.baseline}</td>
                    <td className="p-3 text-center text-xs">{b.reversals}</td>
                    <td className="p-3 text-center text-xs">{b.pressureSpeed}</td>
                    <td className="p-3 text-center text-xs">{b.consistency}</td>
                    <td className="p-3 text-xs text-gray-500">{b.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── IMPROVEMENT 9: Dashboard Tab ────────────────────────────────────────────

function DashboardTab() {
  const statsQuery = trpc.handwriting.getSchoolStats.useQuery();
  const stats = statsQuery.data;

  if (statsQuery.isPending) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" />لوحة إحصائيات المدرسة</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalAnalyses}</div>
          <div className="text-sm text-gray-600">إجمالي التحليلات</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalStudents}</div>
          <div className="text-sm text-gray-600">عدد التلاميذ</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}</div>
          <div className="text-sm text-gray-600">متوسط الدرجة</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-3xl font-bold text-amber-600">
            {Object.values(stats.disorderDistribution || {}).reduce((sum: number, d: any) => sum + (d.high || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">حالات مرتفعة الاحتمال</div>
        </CardContent></Card>
      </div>

      {/* Axis Averages */}
      {stats.axisAverages && (
        <Card>
          <CardHeader><CardTitle className="text-lg">متوسط الدرجات حسب المحور</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AXIS_CONFIG.map(axis => {
                const score = (stats.axisAverages as any)?.[axis.key] || 0;
                return (
                  <div key={axis.key} className="flex items-center gap-3">
                    <axis.icon className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-sm w-32 shrink-0">{axis.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${getScoreBg(score)}`} style={{ width: `${score}%` }} />
                    </div>
                    <span className={`text-sm font-bold w-10 text-start ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disorder Distribution */}
      {stats.disorderDistribution && Object.keys(stats.disorderDistribution).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" />توزيع الاضطرابات</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="p-3 text-end">الاضطراب</th><th className="p-3 text-center text-red-600">مرتفع</th>
                  <th className="p-3 text-center text-amber-600">متوسط</th><th className="p-3 text-center text-blue-600">منخفض</th>
                  <th className="p-3 text-center text-green-600">غير موجود</th>
                </tr></thead>
                <tbody>
                  {Object.entries(stats.disorderDistribution).map(([name, counts]: [string, any]) => (
                    <tr key={name} className="border-b"><td className="p-3 font-medium">{name}</td>
                      <td className="p-3 text-center font-bold text-red-600">{counts.high || 0}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{counts.medium || 0}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{counts.low || 0}</td>
                      <td className="p-3 text-center text-green-600">{counts.none || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {stats.gradeDistribution && Object.keys(stats.gradeDistribution).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">التوزيع حسب المستوى الدراسي</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats.gradeDistribution).map(([grade, data]: [string, any]) => (
                <div key={grade} className="p-4 rounded-lg bg-gray-50 border text-center">
                  <div className="text-sm font-medium text-gray-700">{grade}</div>
                  <div className={`text-2xl font-bold mt-1 ${getScoreColor(data.avgScore)}`}>{data.avgScore}</div>
                  <div className="text-xs text-gray-500">{data.count} تحليل</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalAnalyses === 0 && (
        <Card className="py-16 text-center"><CardContent><Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد بيانات بعد</h3>
          <p className="text-gray-400">ابدأ بتحليل خط يد التلاميذ لتظهر الإحصائيات هنا</p>
        </CardContent></Card>
      )}
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const historyQuery = trpc.handwriting.getAnalyses.useQuery({});

  if (historyQuery.isPending) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  const analyses = historyQuery.data || [];

  if (analyses.length === 0) {
    return (
      <Card className="py-16 text-center"><CardContent><History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد تحليلات سابقة</h3>
        <p className="text-gray-400">ابدأ بتحليل خط يد تلميذ لتظهر النتائج هنا</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><History className="h-5 w-5 text-blue-600" />سجل التحليلات ({analyses.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map((a: any) => (
          <Card key={a.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div><h4 className="font-semibold text-gray-800">{a.studentName || "تلميذ"}</h4>
                  <p className="text-xs text-gray-500">{a.studentGrade && `${a.studentGrade} • `}{a.studentAge && `${a.studentAge} سنوات`}</p>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(a.overallScore || 0)}`}>{a.overallScore || 0}</div>
              </div>
              {a.imageUrl && <img src={a.imageUrl} alt="خط يد" className="w-full h-32 object-cover rounded-lg border mb-3" />}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(a.createdAt).toLocaleDateString("ar-TN")}</span>
                <span>{a.writingType === "copy" ? "نسخ" : a.writingType === "dictation" ? "إملاء" : a.writingType === "free_expression" ? "تعبير حر" : "رياضيات"}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(a.disorders as any[] || []).filter((d: any) => d.probability !== "none").map((d: any, i: number) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${d.probability === "high" ? "bg-red-100 text-red-700" : d.probability === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{d.nameAr}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── Compare Tab ─────────────────────────────────────────────────────────────

function CompareTab() {
  const { data: studentNames = [] } = trpc.handwriting.getStudentNames.useQuery();
  const [student1, setStudent1] = useState("");
  const [student2, setStudent2] = useState("");
  const compareMutation = trpc.handwriting.compareStudents.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const result = compareMutation.data;

  const axesAr: Record<string, string> = {
    letterFormation: "تشكيل الحروف", sizeProportion: "الحجم والتناسب",
    spacingOrganization: "التباعد والتنظيم", baseline: "خط الأساس",
    reversals: "الانعكاسات", pressureSpeed: "الضغط والسرعة", consistency: "الاتساق",
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <GitCompare className="h-6 w-6" />
            مقارنة بين تلميذين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block font-semibold">التلميذ الأول</Label>
              <Select value={student1} onValueChange={setStudent1}>
                <SelectTrigger><SelectValue placeholder="اختر التلميذ الأول" /></SelectTrigger>
                <SelectContent>
                  {studentNames.filter(n => n !== student2).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block font-semibold">التلميذ الثاني</Label>
              <Select value={student2} onValueChange={setStudent2}>
                <SelectTrigger><SelectValue placeholder="اختر التلميذ الثاني" /></SelectTrigger>
                <SelectContent>
                  {studentNames.filter(n => n !== student1).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => { if (student1 && student2) compareMutation.mutate({ studentName1: student1, studentName2: student2 }); }}
            disabled={!student1 || !student2 || compareMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {compareMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin ms-2" />جاري المقارنة...</> : <><GitCompare className="h-4 w-4 ms-2" />مقارنة</>}
          </Button>

          {studentNames.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>يجب أن يكون لديك تحليلات لتلميذين على الأقل لإجراء المقارنة</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 mt-6">
              {/* Overall Score Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="py-4 text-center">
                    <p className="font-bold text-lg text-blue-800">{result.student1.name}</p>
                    <p className={`text-4xl font-bold mt-2 ${getScoreColor(result.student1.overallScore)}`}>{result.student1.overallScore}</p>
                    <p className="text-sm text-gray-500 mt-1">{result.student1.grade} - {result.student1.age} سنوات</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="py-4 text-center">
                    <p className="font-bold text-lg text-purple-800">{result.student2.name}</p>
                    <p className={`text-4xl font-bold mt-2 ${getScoreColor(result.student2.overallScore)}`}>{result.student2.overallScore}</p>
                    <p className="text-sm text-gray-500 mt-1">{result.student2.grade} - {result.student2.age} سنوات</p>
                  </CardContent>
                </Card>
              </div>

              {/* Axis-by-Axis Comparison */}
              <Card>
                <CardHeader><CardTitle className="text-lg">مقارنة المحاور</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.comparison.map((c: any) => (
                      <div key={c.axis} className="space-y-1">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>{c.axisAr}</span>
                          <span className="text-xs text-gray-500">
                            {c.better === 1 ? `${result.student1.name} أفضل` : c.better === 2 ? `${result.student2.name} أفضل` : "متساويان"}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-600">{result.student1.name}: {c.score1}</span>
                            </div>
                            <Progress value={c.score1} className="h-3 [&>div]:bg-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-purple-600">{result.student2.name}: {c.score2}</span>
                            </div>
                            <Progress value={c.score2} className="h-3 [&>div]:bg-purple-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.summary.student1Strengths.length > 0 && (
                  <Card className="bg-blue-50">
                    <CardContent className="py-4">
                      <p className="font-bold text-blue-700 mb-2">نقاط قوة {result.student1.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {result.summary.student1Strengths.map((s: string) => <Badge key={s} variant="secondary" className="bg-blue-100 text-blue-700">{s}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {result.summary.student2Strengths.length > 0 && (
                  <Card className="bg-purple-50">
                    <CardContent className="py-4">
                      <p className="font-bold text-purple-700 mb-2">نقاط قوة {result.student2.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {result.summary.student2Strengths.map((s: string) => <Badge key={s} variant="secondary" className="bg-purple-100 text-purple-700">{s}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {result.summary.equalAxes.length > 0 && (
                  <Card className="bg-gray-50">
                    <CardContent className="py-4">
                      <p className="font-bold text-gray-700 mb-2">محاور متساوية</p>
                      <div className="flex flex-wrap gap-1">
                        {result.summary.equalAxes.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Print Button */}
              <Button variant="outline" onClick={() => {
                const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
                <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
                * { font-family: 'Noto Sans Arabic', sans-serif; } body { direction: rtl; padding: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                th { background: #f0f9ff; } @page { size: A4; margin: 1.5cm; }</style></head><body>
                <h1 style="text-align:center;color:#1e40af;">مقارنة بين ${result.student1.name} و ${result.student2.name}</h1>
                <table><tr><th>المحور</th><th>${result.student1.name}</th><th>${result.student2.name}</th><th>الفرق</th></tr>
                ${result.comparison.map((c: any) => `<tr><td>${c.axisAr}</td><td>${c.score1}</td><td>${c.score2}</td><td>${c.diff > 0 ? "+" : ""}${c.diff}</td></tr>`).join("")}
                <tr style="font-weight:bold;background:#f0f9ff;"><td>المجموع</td><td>${result.student1.overallScore}</td><td>${result.student2.overallScore}</td><td>${result.student1.overallScore - result.student2.overallScore > 0 ? "+" : ""}${result.student1.overallScore - result.student2.overallScore}</td></tr>
                </table><p style="text-align:center;color:#6b7280;font-size:12px;">Leader Academy 🇹🇳 - ${new Date().toLocaleDateString("ar-TN")}</p></body></html>`;
                const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); w.print(); }
              }}>
                <Printer className="h-4 w-4 ms-2" />طباعة المقارنة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Worksheets Tab ──────────────────────────────────────────────────────────

function WorksheetsTab() {
  const [showForm, setShowForm] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState<number | undefined>();
  const [studentGrade, setStudentGrade] = useState("");
  const [selectedAxes, setSelectedAxes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [generatedWorksheet, setGeneratedWorksheet] = useState<any>(null);

  const { data: worksheets = [], refetch } = trpc.handwriting.getWorksheets.useQuery();
  const generateMutation = trpc.handwriting.generateWorksheet.useMutation({
    onSuccess: (data) => {
      setGeneratedWorksheet(data);
      setShowForm(false);
      refetch();
      toast.success("تم إنشاء ورقة العمل بنجاح!");
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.handwriting.deleteWorksheet.useMutation({
    onSuccess: () => { refetch(); toast.success("تم حذف ورقة العمل"); },
  });

  const axes = [
    { key: "letterFormation", label: "تشكيل الحروف" },
    { key: "sizeProportion", label: "الحجم والتناسب" },
    { key: "spacingOrganization", label: "التباعد والتنظيم" },
    { key: "baseline", label: "خط الأساس" },
    { key: "reversals", label: "الانعكاسات" },
    { key: "pressureSpeed", label: "الضغط والسرعة" },
    { key: "consistency", label: "الاتساق" },
  ];

  const toggleAxis = (key: string) => {
    setSelectedAxes(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl" dir="rtl">
      {showForm && !generatedWorksheet ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileEdit className="h-6 w-6" />
              إنشاء ورقة عمل مخصصة بالذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">اسم التلميذ (اختياري)</Label>
                <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="اسم التلميذ" />
              </div>
              <div>
                <Label className="mb-2 block">العمر</Label>
                <Select value={studentAge?.toString() || ""} onValueChange={v => setStudentAge(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="العمر" /></SelectTrigger>
                  <SelectContent>
                    {[5,6,7,8,9,10,11,12].map(a => <SelectItem key={a} value={a.toString()}>{a} سنوات</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">المستوى</Label>
                <Select value={difficulty} onValueChange={v => setDifficulty(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">سهل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">صعب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-3 block font-semibold">المحاور المستهدفة (اختر واحداً على الأقل)</Label>
              <div className="flex flex-wrap gap-2">
                {axes.map(axis => (
                  <button
                    key={axis.key}
                    onClick={() => toggleAxis(axis.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedAxes.includes(axis.key)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {axis.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => generateMutation.mutate({ studentName: studentName || undefined, studentAge, studentGrade: studentGrade || undefined, targetAxes: selectedAxes, difficulty })}
              disabled={selectedAxes.length === 0 || generateMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin ms-2" />جاري الإنشاء بالذكاء الاصطناعي...</> : <><Sparkles className="h-4 w-4 ms-2" />إنشاء ورقة العمل</>}
            </Button>
          </CardContent>
        </Card>
      ) : generatedWorksheet ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-700">{generatedWorksheet.title}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                if (generatedWorksheet.printableHtml) {
                  const w = window.open("", "_blank"); if (w) { w.document.write(generatedWorksheet.printableHtml); w.document.close(); w.print(); }
                }
              }}>
                <Printer className="h-4 w-4 ms-2" />طباعة
              </Button>
              <Button variant="outline" onClick={() => { setGeneratedWorksheet(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 ms-2" />ورقة جديدة
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(generatedWorksheet.exercises || []).map((ex: any, i: number) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="py-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-blue-800">التمرين {ex.number}: {ex.title}</h3>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">{ex.type}</Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{ex.instruction}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Timer className="h-4 w-4" />{ex.duration}</span>
                    <span className="flex items-center gap-1"><PenTool className="h-4 w-4" />{ex.materials}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Saved Worksheets Library */}
      {worksheets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">مكتبة أوراق العمل المحفوظة ({worksheets.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worksheets.map((ws: any) => (
              <Card key={ws.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-blue-700">{ws.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {ws.studentName && `${ws.studentName} - `}
                        {ws.difficulty === "easy" ? "سهل" : ws.difficulty === "medium" ? "متوسط" : "صعب"}
                        {" - "}{new Date(ws.createdAt).toLocaleDateString("ar-TN")}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(ws.targetAxes || []).map((a: string) => (
                          <Badge key={a} variant="outline" className="text-xs">{axes.find(x => x.key === a)?.label || a}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (ws.printableHtml) {
                          const w = window.open("", "_blank"); if (w) { w.document.write(ws.printableHtml); w.document.close(); w.print(); }
                        }
                      }}><Printer className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: ws.id })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Monthly Report Tab ──────────────────────────────────────────────────────

function MonthlyReportTab() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [report, setReport] = useState<any>(null);

  const { data: savedReports = [], refetch } = trpc.handwriting.getMonthlyReports.useQuery();
  const generateMutation = trpc.handwriting.generateMonthlyReport.useMutation({
    onSuccess: (data) => { setReport(data); refetch(); toast.success("تم إنشاء التقرير الشهري بنجاح!"); },
    onError: (err) => toast.error(err.message),
  });

  const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const trendIcons: Record<string, any> = { improving: "📈", stable: "➡️", declining: "📉" };
  const trendLabels: Record<string, string> = { improving: "تحسن", stable: "مستقر", declining: "تراجع" };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <CalendarDays className="h-6 w-6" />
            التقرير الدوري الشهري
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month/Year Selection */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="mb-2 block">الشهر</Label>
              <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">السنة</Label>
              <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => generateMutation.mutate({ month: selectedMonth, year: selectedYear })}
              disabled={generateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin ms-2" />جاري الإنشاء...</> : <><Sparkles className="h-4 w-4 ms-2" />إنشاء التقرير</>}
            </Button>
          </div>

          {/* Report Display */}
          {report && (
            <div className="space-y-6 mt-4">
              <div className="text-center py-4 bg-gradient-to-l from-blue-50 to-purple-50 rounded-xl">
                <h2 className="text-2xl font-bold text-blue-800">تقرير شهر {report.monthName} {report.year}</h2>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="py-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{report.totalAnalyses}</p>
                    <p className="text-sm text-gray-600">تحليل</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="py-4 text-center">
                    <p className="text-3xl font-bold text-purple-700">{report.totalStudents}</p>
                    <p className="text-sm text-gray-600">تلميذ</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="py-4 text-center">
                    <p className={`text-3xl font-bold ${getScoreColor(report.avgScore)}`}>{report.avgScore}/100</p>
                    <p className="text-sm text-gray-600">متوسط الدرجة</p>
                  </CardContent>
                </Card>
              </div>

              {/* Student Summaries Table */}
              {report.studentSummaries && report.studentSummaries.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">ملخص التلاميذ</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-3 px-4 text-end font-semibold">التلميذ</th>
                            <th className="py-3 px-4 text-center font-semibold">التحليلات</th>
                            <th className="py-3 px-4 text-center font-semibold">آخر درجة</th>
                            <th className="py-3 px-4 text-center font-semibold">الدرجة السابقة</th>
                            <th className="py-3 px-4 text-center font-semibold">الاتجاه</th>
                            <th className="py-3 px-4 text-end font-semibold">المخاوف</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.studentSummaries.map((s: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{s.name}</td>
                              <td className="py-3 px-4 text-center">{s.analysesCount}</td>
                              <td className="py-3 px-4 text-center"><span className={`font-bold ${getScoreColor(s.latestScore)}`}>{s.latestScore}</span></td>
                              <td className="py-3 px-4 text-center">{s.previousScore ?? "-"}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${s.trend === "improving" ? "bg-emerald-100 text-emerald-700" : s.trend === "declining" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                                  {trendIcons[s.trend]} {trendLabels[s.trend]}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {s.mainConcerns?.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {s.mainConcerns.map((c: string, j: number) => <Badge key={j} variant="destructive" className="text-xs">{c}</Badge>)}
                                  </div>
                                ) : <span className="text-emerald-600 text-xs">لا توجد مخاوف</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disorder Alerts */}
              {report.disorderAlerts && report.disorderAlerts.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader><CardTitle className="text-lg text-red-700 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />تنبيهات الاضطرابات</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.disorderAlerts.map((alert: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                          <span className="font-medium">{alert.studentName}</span>
                          <Badge variant="destructive">{alert.disorder}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Summary */}
              {report.summary && (
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" />ملخص الذكاء الاصطناعي</CardTitle></CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                      <Streamdown>{report.summary}</Streamdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {report.recommendations && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader><CardTitle className="text-lg text-emerald-700 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />التوصيات</CardTitle></CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                      <Streamdown>{report.recommendations}</Streamdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Print Button */}
              <Button variant="outline" onClick={() => {
                const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
                <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
                * { font-family: 'Noto Sans Arabic', sans-serif; } body { direction: rtl; padding: 30px; max-width: 800px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; } th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background: #f0f9ff; } @page { size: A4; margin: 1.5cm; }</style></head><body>
                <h1 style="text-align:center;color:#1e40af;">تقرير شهر ${report.monthName} ${report.year}</h1>
                <div style="display:flex;justify-content:space-around;margin:20px 0;">
                  <div style="text-align:center;"><strong style="font-size:24px;color:#2563eb;">${report.totalAnalyses}</strong><br/>تحليل</div>
                  <div style="text-align:center;"><strong style="font-size:24px;color:#7c3aed;">${report.totalStudents}</strong><br/>تلميذ</div>
                  <div style="text-align:center;"><strong style="font-size:24px;">${report.avgScore}/100</strong><br/>متوسط</div>
                </div>
                ${report.studentSummaries?.length > 0 ? `<table><tr><th>التلميذ</th><th>التحليلات</th><th>آخر درجة</th><th>الاتجاه</th></tr>
                ${report.studentSummaries.map((s: any) => `<tr><td>${s.name}</td><td>${s.analysesCount}</td><td>${s.latestScore}</td><td>${trendLabels[s.trend]}</td></tr>`).join("")}</table>` : ""}
                <h2>الملخص</h2><p>${report.summary || ""}</p>
                <h2>التوصيات</h2><p>${report.recommendations || ""}</p>
                <p style="text-align:center;color:#6b7280;font-size:12px;margin-top:30px;">Leader Academy 🇹🇳 - ${new Date().toLocaleDateString("ar-TN")}</p></body></html>`;
                const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); w.print(); }
              }}>
                <Printer className="h-4 w-4 ms-2" />طباعة التقرير
              </Button>
            </div>
          )}

          {/* Saved Reports */}
          {savedReports.length > 0 && !report && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">التقارير المحفوظة</h3>
              <div className="space-y-3">
                {savedReports.map((r: any) => (
                  <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReport(r)}>
                    <CardContent className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{monthNames[(r.month || 1) - 1]} {r.year}</p>
                        <p className="text-sm text-gray-500">{r.totalAnalyses} تحليل - {r.totalStudents} تلميذ - متوسط {r.avgScore}/100</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(r.disorderAlerts as any[])?.length > 0 && <Badge variant="destructive">{(r.disorderAlerts as any[]).length} تنبيه</Badge>}
                        <ArrowRight className="h-4 w-4 text-gray-400 rotate-180" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
