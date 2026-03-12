import { useState, useRef, useCallback, useMemo } from "react";
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
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  ArrowRight, Upload, X, Camera, Brain, FileText, Download,
  AlertTriangle, CheckCircle2, Loader2, User, History, ChevronDown,
  ChevronUp, Sparkles, Eye, PenTool, Ruler, AlignCenter,
  RotateCcw, Gauge, TrendingUp, Baby, GraduationCap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "upload" | "analyzing" | "results" | "history";

interface AxisScore {
  score: number;
  observation: string;
}

interface Disorder {
  name: string;
  nameAr: string;
  probability: "high" | "medium" | "low" | "none";
  indicators: string[];
}

interface AnalysisResult {
  id: number;
  overallScore: number;
  axes: {
    letterFormation: AxisScore;
    sizeProportion: AxisScore;
    spacingOrganization: AxisScore;
    baseline: AxisScore;
    reversals: AxisScore;
    pressureSpeed: AxisScore;
    consistency: AxisScore;
  };
  disorders: Disorder[];
  detailedReport: string;
  recommendations: string;
  imageUrl: string;
  studentName: string;
  studentAge?: number;
  studentGrade?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADES = [
  "سنة 1 ابتدائي", "سنة 2 ابتدائي", "سنة 3 ابتدائي",
  "سنة 4 ابتدائي", "سنة 5 ابتدائي", "سنة 6 ابتدائي",
];

const WRITING_TYPES = [
  { value: "copy", label: "نسخ من السبورة" },
  { value: "dictation", label: "إملاء" },
  { value: "free_expression", label: "تعبير حر" },
  { value: "math", label: "تمارين رياضيات" },
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HandwritingAnalyzer() {
  const { user, isLoading: authLoading } = useAuth();

  // State
  const [step, setStep] = useState<Step>("upload");
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
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const analyzeMutation = trpc.handwriting.analyzeHandwriting.useMutation({
    onSuccess: (data) => {
      setResult(data as AnalysisResult);
      setStep("results");
      toast.success("تم التحليل بنجاح!");
    },
    onError: (error) => {
      toast.error(error.message || "فشل في تحليل خط اليد. يرجى المحاولة مرة أخرى.");
      setStep("upload");
    },
  });

  const exportPdfMutation = trpc.handwriting.exportPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.pdfUrl, "_blank");
      toast.success("تم إنشاء التقرير بنجاح!");
    },
    onError: () => {
      toast.error("فشل في إنشاء ملف PDF");
    },
  });

  // History query
  const historyQuery = trpc.handwriting.getAnalyses.useQuery(
    {},
    { enabled: activeTab === "history" && !!user }
  );

  // File handling
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error("يرجى رفع صورة بصيغة PNG أو JPG أو WEBP");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 10 ميغابايت");
      return;
    }

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
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Submit analysis
  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      toast.error("يرجى رفع صورة أولاً");
      return;
    }

    setStep("analyzing");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      analyzeMutation.mutate({
        imageBase64: base64,
        mimeType: imageFile.type,
        studentName: studentName || undefined,
        studentAge: studentAge ? parseInt(studentAge) : undefined,
        studentGrade: studentGrade || undefined,
        writingType: writingType as "copy" | "dictation" | "free_expression" | "math",
        teacherNotes: teacherNotes || undefined,
      });
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, studentName, studentAge, studentGrade, writingType, teacherNotes, analyzeMutation]);

  // Reset
  const handleReset = useCallback(() => {
    setStep("upload");
    setResult(null);
    clearImage();
    setStudentName("");
    setStudentAge("");
    setStudentGrade("");
    setGender("");
    setWritingType("copy");
    setTeacherNotes("");
    setShowDetailedReport(false);
    setShowRecommendations(true);
  }, [clearImage]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">محلل خط اليد الذكي</h2>
            <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى هذه الأداة</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">تسجيل الدخول</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                الرئيسية <ArrowRight className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-blue-900">محلل خط اليد الذكي</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "results" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("results")}
              className={activeTab === "results" ? "bg-blue-600" : ""}
            >
              <PenTool className="h-4 w-4 ml-1" />
              تحليل جديد
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className={activeTab === "history" ? "bg-blue-600" : ""}
            >
              <History className="h-4 w-4 ml-1" />
              السجل
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {activeTab === "history" ? (
          <HistoryView analyses={historyQuery.data || []} isLoading={historyQuery.isLoading} />
        ) : step === "upload" ? (
          <UploadStep
            imageFile={imageFile}
            imagePreview={imagePreview}
            studentName={studentName}
            studentAge={studentAge}
            studentGrade={studentGrade}
            gender={gender}
            writingType={writingType}
            teacherNotes={teacherNotes}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onDrop={handleDrop}
            onClearImage={clearImage}
            onStudentNameChange={setStudentName}
            onStudentAgeChange={setStudentAge}
            onStudentGradeChange={setStudentGrade}
            onGenderChange={setGender}
            onWritingTypeChange={setWritingType}
            onTeacherNotesChange={setTeacherNotes}
            onAnalyze={handleAnalyze}
          />
        ) : step === "analyzing" ? (
          <AnalyzingStep />
        ) : result ? (
          <ResultsStep
            result={result}
            showDetailedReport={showDetailedReport}
            showRecommendations={showRecommendations}
            onToggleReport={() => setShowDetailedReport(!showDetailedReport)}
            onToggleRecommendations={() => setShowRecommendations(!showRecommendations)}
            onExportPdf={() => exportPdfMutation.mutate({ analysisId: result.id })}
            isExporting={exportPdfMutation.isPending}
            onReset={handleReset}
          />
        ) : null}
      </main>
    </div>
  );
}

// ─── Upload Step ──────────────────────────────────────────────────────────────

function UploadStep({
  imageFile, imagePreview, studentName, studentAge, studentGrade, gender,
  writingType, teacherNotes, fileInputRef,
  onFileSelect, onDrop, onClearImage, onStudentNameChange, onStudentAgeChange,
  onStudentGradeChange, onGenderChange, onWritingTypeChange, onTeacherNotesChange,
  onAnalyze,
}: {
  imageFile: File | null;
  imagePreview: string | null;
  studentName: string;
  studentAge: string;
  studentGrade: string;
  gender: string;
  writingType: string;
  teacherNotes: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onClearImage: () => void;
  onStudentNameChange: (v: string) => void;
  onStudentAgeChange: (v: string) => void;
  onStudentGradeChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onWritingTypeChange: (v: string) => void;
  onTeacherNotesChange: (v: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Image Upload */}
      <div className="space-y-4">
        <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              رفع صورة خط اليد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-full rounded-lg border border-gray-200 max-h-[400px] object-contain bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 left-2 bg-white/90"
                  onClick={onClearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="mt-2 text-sm text-gray-500 text-center">
                  {imageFile?.name} ({(imageFile?.size || 0 / 1024).toFixed(0)} KB)
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  اسحب الصورة هنا أو انقر للرفع
                </p>
                <p className="text-sm text-gray-500">
                  PNG / JPG / WEBP - حد أقصى 10 ميغابايت
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  التقط صورة واضحة لورقة التلميذ بالهاتف
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={onFileSelect}
            />
          </CardContent>
        </Card>

        {/* Ethical Disclaimer */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">تنبيه مهم</p>
              <p>هذه أداة مساعدة أولية وليست تشخيصاً طبياً رسمياً. يُنصح باستشارة أخصائي نفسي تربوي أو أخصائي أرطوفونيا للتأكد من النتائج.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Student Info */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              معلومات التلميذ
              <span className="text-xs text-gray-400 font-normal">(اختياري لكن مفيد للتحليل)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">الاسم الأول</Label>
                <Input
                  id="studentName"
                  placeholder="مثال: أحمد"
                  value={studentName}
                  onChange={(e) => onStudentNameChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="studentAge">العمر</Label>
                <Select value={studentAge} onValueChange={onStudentAgeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر العمر" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <SelectItem key={age} value={String(age)}>
                        {age} سنوات
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentGrade">المستوى الدراسي</Label>
                <Select value={studentGrade} onValueChange={onStudentGradeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">الجنس</Label>
                <Select value={gender} onValueChange={onGenderChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="writingType">نوع الكتابة</Label>
              <Select value={writingType} onValueChange={onWritingTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRITING_TYPES.map((wt) => (
                    <SelectItem key={wt.value} value={wt.value}>
                      {wt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teacherNotes">ملاحظات المعلم</Label>
              <Textarea
                id="teacherNotes"
                placeholder="أي ملاحظات سلوكية لاحظتها على التلميذ أثناء الكتابة..."
                value={teacherNotes}
                onChange={(e) => onTeacherNotesChange(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analysis Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              ما الذي سيتم تحليله؟
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {AXIS_CONFIG.map((axis) => (
                <div key={axis.key} className="flex items-center gap-2 text-sm text-blue-800">
                  <axis.icon className="h-3.5 w-3.5 text-blue-500" />
                  <span>{axis.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button */}
        <Button
          className="w-full h-14 text-lg bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          onClick={onAnalyze}
          disabled={!imagePreview}
        >
          <Brain className="h-5 w-5 ml-2" />
          ابدأ التحليل الذكي
          <Sparkles className="h-5 w-5 mr-2" />
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
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
          <Brain className="h-12 w-12 text-blue-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-bounce">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">جارٍ تحليل خط اليد...</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        يقوم الذكاء الاصطناعي بتحليل 7 محاور مختلفة في كتابة التلميذ
        للكشف عن مؤشرات صعوبات التعلم
      </p>
      <div className="w-64">
        <Progress value={65} className="h-2" />
      </div>
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

// ─── Results Step ─────────────────────────────────────────────────────────────

function ResultsStep({
  result, showDetailedReport, showRecommendations,
  onToggleReport, onToggleRecommendations, onExportPdf, isExporting, onReset,
}: {
  result: AnalysisResult;
  showDetailedReport: boolean;
  showRecommendations: boolean;
  onToggleReport: () => void;
  onToggleRecommendations: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">نتائج التحليل</h2>
          {result.studentName && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <User className="h-3 w-3 ml-1" />
              {result.studentName}
              {result.studentAge && ` (${result.studentAge} سنوات)`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportPdf} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Download className="h-4 w-4 ml-1" />}
            تصدير PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <PenTool className="h-4 w-4 ml-1" />
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Overall Score + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Circle */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={result.overallScore >= 70 ? "#059669" : result.overallScore >= 40 ? "#d97706" : "#dc2626"}
                  strokeWidth="10"
                  strokeDasharray={`${(result.overallScore / 100) * 327} 327`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </span>
                <span className="text-xs text-gray-500">من 100</span>
              </div>
            </div>
            <p className={`text-lg font-semibold ${getScoreColor(result.overallScore)}`}>
              {getScoreLabel(result.overallScore)}
            </p>
            <p className="text-sm text-gray-500 mt-1">جودة الكتابة الحركية</p>
          </CardContent>
        </Card>

        {/* Image Preview */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <img
              src={result.imageUrl}
              alt="خط يد التلميذ"
              className="w-full rounded-lg border border-gray-200 max-h-[300px] object-contain bg-white"
            />
          </CardContent>
        </Card>
      </div>

      {/* 7 Axes Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            تحليل المحاور السبعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AXIS_CONFIG.map((axis) => {
              const axisData = result.axes[axis.key as keyof typeof result.axes];
              if (!axisData) return null;
              return (
                <div key={axis.key} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <axis.icon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{axis.label}</span>
                    </div>
                    <span className={`font-bold text-lg ${getScoreColor(axisData.score)}`}>
                      {axisData.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getScoreBg(axisData.score)}`}
                      style={{ width: `${axisData.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{axisData.observation}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disorders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            الاضطرابات المحتملة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-3 font-semibold">الاضطراب</th>
                  <th className="text-center p-3 font-semibold">الاحتمال</th>
                  <th className="text-right p-3 font-semibold">المؤشرات الملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {result.disorders.map((disorder, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{disorder.nameAr}</div>
                      <div className="text-xs text-gray-400">{disorder.name}</div>
                    </td>
                    <td className="p-3 text-center">
                      {getProbabilityBadge(disorder.probability)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {disorder.indicators.map((ind, j) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report (Collapsible) */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggleReport}
        >
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              التقرير المفصل
            </div>
            {showDetailedReport ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {showDetailedReport && (
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dir="rtl">
              <Streamdown>{result.detailedReport}</Streamdown>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations (Collapsible, open by default) */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader
          className="cursor-pointer hover:bg-green-50 transition-colors"
          onClick={onToggleRecommendations}
        >
          <CardTitle className="text-lg flex items-center justify-between text-green-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              التوصيات البيداغوجية
            </div>
            {showRecommendations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {showRecommendations && (
          <CardContent>
            <div className="prose prose-sm max-w-none text-green-900 leading-relaxed" dir="rtl">
              <Streamdown>{result.recommendations}</Streamdown>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Ethical Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">تنبيه أخلاقي وقانوني</p>
            <p>هذا التحليل أداة مساعدة أولية وليس تشخيصاً طبياً رسمياً. النتائج تعتمد على جودة الصورة المرفوعة وقد لا تعكس الحالة الكاملة للتلميذ. يُنصح بشدة باستشارة أخصائي نفسي تربوي أو أخصائي أرطوفونيا للتأكد من النتائج واتخاذ القرارات المناسبة.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── History View ─────────────────────────────────────────────────────────────

function HistoryView({ analyses, isLoading }: { analyses: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="py-16 text-center">
        <CardContent>
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد تحليلات سابقة</h3>
          <p className="text-gray-400">ابدأ بتحليل خط يد تلميذ لتظهر النتائج هنا</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <History className="h-5 w-5 text-blue-600" />
        سجل التحليلات ({analyses.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map((analysis: any) => (
          <Card key={analysis.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {analysis.studentName || "تلميذ"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {analysis.studentGrade && `${analysis.studentGrade} • `}
                    {analysis.studentAge && `${analysis.studentAge} سنوات`}
                  </p>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore || 0)}`}>
                  {analysis.overallScore || 0}
                </div>
              </div>
              {analysis.imageUrl && (
                <img
                  src={analysis.imageUrl}
                  alt="خط يد"
                  className="w-full h-32 object-cover rounded-lg border mb-3"
                />
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(analysis.createdAt).toLocaleDateString("ar-TN")}</span>
                <span className="capitalize">
                  {analysis.writingType === "copy" ? "نسخ" :
                   analysis.writingType === "dictation" ? "إملاء" :
                   analysis.writingType === "free_expression" ? "تعبير حر" : "رياضيات"}
                </span>
              </div>
              {/* Disorder badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {(analysis.disorders as any[] || [])
                  .filter((d: any) => d.probability !== "none")
                  .map((d: any, i: number) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                      d.probability === "high" ? "bg-red-100 text-red-700" :
                      d.probability === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {d.nameAr}
                    </span>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
