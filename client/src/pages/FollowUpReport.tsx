import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft, FileText, Brain, BookOpen, PenTool, Calculator,
  MessageSquare, Zap, Heart, Clock, Target, Users, Loader2,
  Sparkles, GraduationCap, Trash2, FolderOpen, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle2, TrendingUp, Star,
  ClipboardList, BarChart3, Lightbulb, Shield, ArrowRight, Info,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line
} from "recharts";

// ===== CONSTANTS =====
const DIFFICULTY_TYPES = [
  { value: "dyslexia", label: "عسر القراءة (Dyslexia)", icon: BookOpen, color: "bg-blue-500" },
  { value: "dysgraphia", label: "عسر الكتابة (Dysgraphia)", icon: PenTool, color: "bg-purple-500" },
  { value: "dyscalculia", label: "عسر الحساب (Dyscalculia)", icon: Calculator, color: "bg-orange-500" },
  { value: "dysphasia", label: "عسر النطق (Dysphasia)", icon: MessageSquare, color: "bg-pink-500" },
  { value: "adhd", label: "فرط النشاط ونقص الانتباه (ADHD)", icon: Zap, color: "bg-yellow-500" },
  { value: "asd", label: "طيف التوحد (ASD)", icon: Brain, color: "bg-teal-500" },
  { value: "slow_learning", label: "بطء التعلم", icon: Clock, color: "bg-indigo-500" },
  { value: "intellectual_disability", label: "إعاقة ذهنية", icon: Heart, color: "bg-red-500" },
];

const GRADE_LEVELS = [
  { value: "preschool", label: "تحضيري" },
  { value: "grade1", label: "السنة 1" },
  { value: "grade2", label: "السنة 2" },
  { value: "grade3", label: "السنة 3" },
  { value: "grade4", label: "السنة 4" },
  { value: "grade5", label: "السنة 5" },
  { value: "grade6", label: "السنة 6" },
  { value: "middle_school", label: "إعدادي" },
  { value: "high_school", label: "ثانوي" },
];

const SEVERITY_LEVELS = [
  { value: "mild", label: "خفيف", color: "text-green-600", bg: "bg-green-50" },
  { value: "moderate", label: "متوسط", color: "text-yellow-600", bg: "bg-yellow-50" },
  { value: "severe", label: "شديد", color: "text-red-600", bg: "bg-red-50" },
];

const REPORT_PERIODS = [
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
  { value: "trimesterly", label: "ثلاثي" },
  { value: "yearly", label: "سنوي" },
];

const SCORE_LABELS: Record<string, string> = {
  reading: "القراءة",
  writing: "الكتابة",
  math: "الرياضيات",
  attention: "الانتباه",
  social: "التفاعل الاجتماعي",
  motivation: "الدافعية",
};

export default function FollowUpReport() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const [viewingResult, setViewingResult] = useState<any>(null);
  const [step, setStep] = useState(1);

  // Form state
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState<number | undefined>();
  const [gradeLevel, setGradeLevel] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [difficultyType, setDifficultyType] = useState("");
  const [severityLevel, setSeverityLevel] = useState("moderate");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [periodEndDate, setPeriodEndDate] = useState("");
  const [academicObs, setAcademicObs] = useState("");
  const [behavioralObs, setBehavioralObs] = useState("");
  const [socialObs, setSocialObs] = useState("");

  // Scores
  const [readingScore, setReadingScore] = useState<number>(5);
  const [writingScore, setWritingScore] = useState<number>(5);
  const [mathScore, setMathScore] = useState<number>(5);
  const [attentionScore, setAttentionScore] = useState<number>(5);
  const [socialScore, setSocialScore] = useState<number>(5);
  const [motivationScore, setMotivationScore] = useState<number>(5);

  // Historical scores
  const [historicalScores, setHistoricalScores] = useState<{
    date: string; reading: number; writing: number; math: number;
    attention: number; social: number; motivation: number;
  }[]>([]);

  // Queries
  const historyQuery = trpc.followUpReports.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!user }
  );
  const statsQuery = trpc.followUpReports.getStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mutations
  const generateMutation = trpc.followUpReports.generate.useMutation({
    onSuccess: (data: any) => {
      toast.success("تم إنشاء تقرير المتابعة بنجاح!");
      setViewingResult(data);
      setActiveTab("result");
      historyQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل في إنشاء التقرير");
    },
  });

  const deleteMutation = trpc.followUpReports.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التقرير");
      historyQuery.refetch();
      statsQuery.refetch();
    },
  });

  const exportPdfMutation = trpc.followUpReports.exportPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success(data.isPdf ? "تم تصدير التقرير كـ PDF" : "تم تصدير التقرير كصفحة قابلة للطباعة");
    },
    onError: () => toast.error("فشل في تصدير التقرير"),
  });

  const handleGenerate = () => {
    if (!studentName.trim()) {
      toast.error("يرجى إدخال اسم التلميذ");
      return;
    }
    if (!difficultyType) {
      toast.error("يرجى اختيار نوع الصعوبة");
      return;
    }
    generateMutation.mutate({
      studentName,
      studentAge,
      gradeLevel: gradeLevel || undefined,
      schoolName: schoolName || undefined,
      difficultyType,
      severityLevel: severityLevel as "mild" | "moderate" | "severe",
      reportPeriod: reportPeriod as "weekly" | "monthly" | "trimesterly" | "yearly",
      periodStartDate: periodStartDate || undefined,
      periodEndDate: periodEndDate || undefined,
      academicObservations: academicObs || undefined,
      behavioralObservations: behavioralObs || undefined,
      socialObservations: socialObs || undefined,
      readingScore,
      writingScore,
      mathScore,
      attentionScore,
      socialScore,
      motivationScore,
      historicalScores: historicalScores.length > 0 ? historicalScores : undefined,
    });
  };

  const addHistoricalEntry = () => {
    setHistoricalScores(prev => [...prev, {
      date: "", reading: 5, writing: 5, math: 5,
      attention: 5, social: 5, motivation: 5,
    }]);
  };

  const updateHistoricalEntry = (index: number, field: string, value: any) => {
    setHistoricalScores(prev => prev.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const removeHistoricalEntry = (index: number) => {
    setHistoricalScores(prev => prev.filter((_, i) => i !== index));
  };

  const currentRadarData = useMemo(() => [
    { subject: "القراءة", score: readingScore, fullMark: 10 },
    { subject: "الكتابة", score: writingScore, fullMark: 10 },
    { subject: "الرياضيات", score: mathScore, fullMark: 10 },
    { subject: "الانتباه", score: attentionScore, fullMark: 10 },
    { subject: "التفاعل", score: socialScore, fullMark: 10 },
    { subject: "الدافعية", score: motivationScore, fullMark: 10 },
  ], [readingScore, writingScore, mathScore, attentionScore, socialScore, motivationScore]);

  const selectedDifficultyType = useMemo(
    () => DIFFICULTY_TYPES.find(d => d.value === difficultyType),
    [difficultyType]
  );

  // ===== NOT LOGGED IN =====
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
        <div className="container max-w-4xl py-20 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <ClipboardList className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">تقرير المتابعة الفردي</h1>
          <p className="mb-8 text-lg text-gray-600">
            أداة ذكية لإنشاء تقارير متابعة دورية شاملة لتتبع تقدم التلاميذ ذوي صعوبات التعلم
          </p>
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
            <a href={getLoginUrl()}>تسجيل الدخول للاستخدام</a>
          </Button>
        </div>
      </div>
    );
  }

  // ===== RESULT VIEW =====
  const renderResult = () => {
    if (!viewingResult) return null;
    const report = viewingResult;

    const resultRadarData = [
      { subject: "القراءة", score: report.readingScore || 0, fullMark: 10 },
      { subject: "الكتابة", score: report.writingScore || 0, fullMark: 10 },
      { subject: "الرياضيات", score: report.mathScore || 0, fullMark: 10 },
      { subject: "الانتباه", score: report.attentionScore || 0, fullMark: 10 },
      { subject: "التفاعل", score: report.socialScore || 0, fullMark: 10 },
      { subject: "الدافعية", score: report.motivationScore || 0, fullMark: 10 },
    ];

    const historicalData = (report.historicalScores as any[] || []).map((h: any) => ({
      date: h.date,
      القراءة: h.reading,
      الكتابة: h.writing,
      الرياضيات: h.math,
      الانتباه: h.attention,
      التفاعل: h.social,
      الدافعية: h.motivation,
    }));
    // Add current scores as latest entry
    historicalData.push({
      date: "الحالي",
      القراءة: report.readingScore || 0,
      الكتابة: report.writingScore || 0,
      الرياضيات: report.mathScore || 0,
      الانتباه: report.attentionScore || 0,
      التفاعل: report.socialScore || 0,
      الدافعية: report.motivationScore || 0,
    });

    const diffLabel = DIFFICULTY_TYPES.find(d => d.value === report.difficultyType)?.label || report.difficultyType;
    const sevLabel = SEVERITY_LEVELS.find(s => s.value === report.severityLevel)?.label || report.severityLevel;
    const perLabel = REPORT_PERIODS.find(p => p.value === report.reportPeriod)?.label || report.reportPeriod;

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.reportTitle || "تقرير متابعة فردي"}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="bg-white">{report.studentName}</Badge>
                  <Badge variant="outline" className="bg-white">{diffLabel}</Badge>
                  <Badge variant="outline" className="bg-white">الشدة: {sevLabel}</Badge>
                  <Badge variant="outline" className="bg-white">الفترة: {perLabel}</Badge>
                </div>
                {report.schoolName && (
                  <p className="text-sm text-gray-500">المدرسة: {report.schoolName}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString("ar")}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => exportPdfMutation.mutate({ id: report.id })}
                  disabled={exportPdfMutation.isPending}
                >
                  {exportPdfMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  تحميل PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                الملف الشخصي للمهارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={resultRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Radar name="الدرجات" dataKey="score" stroke="#d97706" fill="#fbbf24" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historical Line Chart */}
          {historicalData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  تطور المهارات عبر الزمن
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="القراءة" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="الكتابة" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="الرياضيات" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="الانتباه" stroke="#eab308" strokeWidth={2} />
                    <Line type="monotone" dataKey="التفاعل" stroke="#14b8a6" strokeWidth={2} />
                    <Line type="monotone" dataKey="الدافعية" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Executive Summary */}
        {report.executiveSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                الملخص التنفيذي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.executiveSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        {report.detailedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-600" />
                التحليل المفصل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.detailedAnalysis}</p>
            </CardContent>
          </Card>
        )}

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.strengths && (report.strengths as string[]).length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                  <Star className="h-5 w-5" />
                  نقاط القوة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(report.strengths as string[]).map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <span className="text-gray-700">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.challenges && (report.challenges as string[]).length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  التحديات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(report.challenges as string[]).map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-1 shrink-0" />
                      <span className="text-gray-700">{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        {report.recommendations && (report.recommendations as any[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                التوصيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(report.recommendations as any[]).map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="shrink-0 mt-1">
                      <Badge variant={rec.priority === "عالية" ? "destructive" : rec.priority === "متوسطة" ? "default" : "secondary"}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{rec.category}</Badge>
                        <span className="text-xs text-gray-400">{rec.timeline}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parent Guidance */}
        {report.parentGuidance && (
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-teal-700">
                <Shield className="h-5 w-5" />
                إرشادات الأولياء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.parentGuidance}</p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {report.nextSteps && (report.nextSteps as any[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-indigo-600" />
                الخطوات القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-right p-3 font-semibold">الإجراء</th>
                      <th className="text-right p-3 font-semibold">المسؤول</th>
                      <th className="text-right p-3 font-semibold">الموعد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.nextSteps as any[]).map((ns: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{ns.action}</td>
                        <td className="p-3">{ns.responsible}</td>
                        <td className="p-3">{ns.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => { setViewingResult(null); setActiveTab("generate"); }}>
            إنشاء تقرير جديد
          </Button>
        </div>
      </div>
    );
  };

  // ===== SCORE SLIDER COMPONENT =====
  const ScoreSlider = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className={`text-sm font-bold ${color}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30" dir="rtl">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container max-w-7xl py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/learning-support">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                أدوات ذوي الصعوبات
              </Button>
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <ClipboardList className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">تقرير المتابعة الفردي</h1>
                <p className="text-gray-500 mt-1">تقارير دورية شاملة لتتبع تقدم التلاميذ ذوي صعوبات التعلم</p>
              </div>
            </div>
            {statsQuery.data && (
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-700">{statsQuery.data.totalReports}</div>
                  <div className="text-xs text-gray-500">تقارير مكتملة</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white shadow-sm">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              إنشاء تقرير
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              السجل ({historyQuery.data?.total || 0})
            </TabsTrigger>
            {viewingResult && (
              <TabsTrigger value="result" className="gap-2">
                <FileText className="h-4 w-4" />
                التقرير
              </TabsTrigger>
            )}
          </TabsList>

          {/* ===== GENERATE TAB ===== */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStep(s)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        step === s
                          ? "bg-amber-500 text-white shadow-md"
                          : step > s
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step > s ? <CheckCircle2 className="h-4 w-4" /> : <span>{s}</span>}
                      {s === 1 && "المعلومات"}
                      {s === 2 && "الصعوبة"}
                      {s === 3 && "الدرجات"}
                      {s === 4 && "الملاحظات"}
                    </button>
                  ))}
                </div>

                {/* Step 1: Student Info */}
                {step === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCap className="h-5 w-5 text-amber-600" />
                        معلومات التلميذ
                      </CardTitle>
                      <CardDescription>أدخل المعلومات الأساسية للتلميذ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>اسم التلميذ <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="مثال: أحمد محمد"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>العمر</Label>
                          <Input
                            type="number"
                            min={3}
                            max={18}
                            placeholder="مثال: 8"
                            value={studentAge || ""}
                            onChange={(e) => setStudentAge(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <Label>المستوى الدراسي</Label>
                          <Select value={gradeLevel} onValueChange={setGradeLevel}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                            <SelectContent>
                              {GRADE_LEVELS.map(g => (
                                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>اسم المدرسة</Label>
                          <Input
                            placeholder="مثال: المدرسة الابتدائية النموذجية"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>فترة التقرير</Label>
                          <Select value={reportPeriod} onValueChange={setReportPeriod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REPORT_PERIODS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>تاريخ البداية</Label>
                          <Input
                            type="date"
                            value={periodStartDate}
                            onChange={(e) => setPeriodStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>تاريخ النهاية</Label>
                          <Input
                            type="date"
                            value={periodEndDate}
                            onChange={(e) => setPeriodEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => setStep(2)} className="bg-amber-500 hover:bg-amber-600">
                          التالي <ArrowRight className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Difficulty Type */}
                {step === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        نوع الصعوبة ودرجة الشدة <span className="text-red-500">*</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {DIFFICULTY_TYPES.map((dt) => {
                          const Icon = dt.icon;
                          const isSelected = difficultyType === dt.value;
                          return (
                            <button
                              key={dt.value}
                              onClick={() => setDifficultyType(dt.value)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                isSelected
                                  ? "border-amber-500 bg-amber-50 shadow-md"
                                  : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className={`h-10 w-10 rounded-full ${dt.color} flex items-center justify-center`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-medium leading-tight">{dt.label}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
                            </button>
                          );
                        })}
                      </div>

                      <Separator />

                      <div>
                        <Label className="mb-3 block">درجة الشدة</Label>
                        <div className="flex gap-3">
                          {SEVERITY_LEVELS.map(s => (
                            <button
                              key={s.value}
                              onClick={() => setSeverityLevel(s.value)}
                              className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                                severityLevel === s.value
                                  ? `border-amber-500 ${s.bg} shadow-sm`
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <span className={`font-medium ${s.color}`}>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>السابق</Button>
                        <Button onClick={() => setStep(3)} className="bg-amber-500 hover:bg-amber-600">
                          التالي <ArrowRight className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Scores */}
                {step === 3 && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BarChart3 className="h-5 w-5 text-amber-600" />
                          الدرجات الحالية (من 10)
                        </CardTitle>
                        <CardDescription>حرّك المؤشر لتحديد مستوى التلميذ في كل مجال</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <ScoreSlider label="القراءة" value={readingScore} onChange={setReadingScore} color="text-blue-600" />
                        <ScoreSlider label="الكتابة" value={writingScore} onChange={setWritingScore} color="text-purple-600" />
                        <ScoreSlider label="الرياضيات" value={mathScore} onChange={setMathScore} color="text-orange-600" />
                        <ScoreSlider label="الانتباه والتركيز" value={attentionScore} onChange={setAttentionScore} color="text-yellow-600" />
                        <ScoreSlider label="التفاعل الاجتماعي" value={socialScore} onChange={setSocialScore} color="text-teal-600" />
                        <ScoreSlider label="الدافعية" value={motivationScore} onChange={setMotivationScore} color="text-red-600" />
                      </CardContent>
                    </Card>

                    {/* Historical Scores */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          الدرجات السابقة (اختياري)
                        </CardTitle>
                        <CardDescription>أضف درجات سابقة لمقارنة التطور عبر الزمن</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {historicalScores.map((entry, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Label>الفترة {idx + 1}</Label>
                                <Input
                                  type="text"
                                  placeholder="مثال: جانفي 2025"
                                  value={entry.date}
                                  onChange={(e) => updateHistoricalEntry(idx, "date", e.target.value)}
                                  className="w-48"
                                />
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeHistoricalEntry(idx)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(SCORE_LABELS).map(([key, label]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <Label className="text-xs w-20">{label}</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={(entry as any)[key]}
                                    onChange={(e) => updateHistoricalEntry(idx, key, Number(e.target.value))}
                                    className="w-16 text-center"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addHistoricalEntry} className="w-full">
                          + إضافة فترة سابقة
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>السابق</Button>
                      <Button onClick={() => setStep(4)} className="bg-amber-500 hover:bg-amber-600">
                        التالي <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Observations */}
                {step === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-amber-600" />
                        ملاحظات المعلم
                      </CardTitle>
                      <CardDescription>أضف ملاحظاتك حول أداء التلميذ في مختلف المجالات</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>ملاحظات أكاديمية</Label>
                        <Textarea
                          placeholder="مثال: يواجه صعوبة في قراءة الكلمات الطويلة، لكنه يتحسن في الإملاء..."
                          value={academicObs}
                          onChange={(e) => setAcademicObs(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>ملاحظات سلوكية</Label>
                        <Textarea
                          placeholder="مثال: يظهر تحسناً في التركيز أثناء الحصة، لكنه يحتاج استراحات متكررة..."
                          value={behavioralObs}
                          onChange={(e) => setBehavioralObs(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>ملاحظات اجتماعية</Label>
                        <Textarea
                          placeholder="مثال: بدأ يتفاعل أكثر مع زملائه في الأنشطة الجماعية..."
                          value={socialObs}
                          onChange={(e) => setSocialObs(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(3)}>السابق</Button>
                        <Button
                          onClick={handleGenerate}
                          disabled={generateMutation.isPending || !studentName.trim() || !difficultyType}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-2"
                          size="lg"
                        >
                          {generateMutation.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              جاري إنشاء التقرير...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              إنشاء التقرير
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Preview */}
              <div className="space-y-6">
                {/* Live Radar Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">معاينة الملف الشخصي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={currentRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                        <Radar name="الدرجات" dataKey="score" stroke="#d97706" fill="#fbbf24" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold text-amber-800">ملخص البيانات</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">التلميذ:</span>
                        <span className="font-medium">{studentName || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الصعوبة:</span>
                        <span className="font-medium">{selectedDifficultyType?.label || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الشدة:</span>
                        <span className="font-medium">{SEVERITY_LEVELS.find(s => s.value === severityLevel)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفترة:</span>
                        <span className="font-medium">{REPORT_PERIODS.find(p => p.value === reportPeriod)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">متوسط الدرجات:</span>
                        <span className="font-bold text-amber-700">
                          {((readingScore + writingScore + mathScore + attentionScore + socialScore + motivationScore) / 6).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">ملاحظة مهمة</p>
                        <p>هذا التقرير أداة تربوية مساعدة وليس تشخيصاً طبياً. يُنصح بالتعاون مع المختصين لتقييم شامل.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ===== HISTORY TAB ===== */}
          <TabsContent value="history">
            {historyQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : !historyQuery.data?.items.length ? (
              <Card className="text-center py-16">
                <CardContent>
                  <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد تقارير بعد</h3>
                  <p className="text-gray-400 mb-4">ابدأ بإنشاء أول تقرير متابعة فردي</p>
                  <Button onClick={() => setActiveTab("generate")} className="bg-amber-500 hover:bg-amber-600">
                    <Sparkles className="h-4 w-4 ml-2" />
                    إنشاء تقرير
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {historyQuery.data.items.map((item: any) => {
                  const diffLabel = DIFFICULTY_TYPES.find(d => d.value === item.difficultyType)?.label || item.difficultyType;
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{item.reportTitle || item.studentName}</h3>
                              <Badge variant={item.status === "completed" ? "default" : item.status === "pending" ? "secondary" : "destructive"}>
                                {item.status === "completed" ? "مكتمل" : item.status === "pending" ? "قيد المعالجة" : "فشل"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{item.studentName}</Badge>
                              <Badge variant="outline">{diffLabel}</Badge>
                              {item.reportPeriod && <Badge variant="outline">{REPORT_PERIODS.find(p => p.value === item.reportPeriod)?.label}</Badge>}
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setViewingResult(item); setActiveTab("result"); }}
                              >
                                <FileText className="h-4 w-4 ml-1" />
                                عرض
                              </Button>
                            )}
                            {item.status === "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportPdfMutation.mutate({ id: item.id })}
                                disabled={exportPdfMutation.isPending}
                              >
                                {exportPdfMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-blue-500" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate({ id: item.id })}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== RESULT TAB ===== */}
          <TabsContent value="result">
            {renderResult()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
