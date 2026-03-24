import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, FileText, Brain, BookOpen, PenTool, Calculator,
  MessageSquare, Zap, Heart, Clock, Target, Users, Loader2,
  Sparkles, GraduationCap, Trash2, FolderOpen, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Star, BarChart3, Lightbulb, Info,
  Plus, Minus, Activity, Award, ArrowUpRight, ArrowDownRight
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
  Tooltip, Legend, LineChart, Line, AreaChart, Area
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

const EXERCISE_CATEGORIES = [
  "مهارات حركية دقيقة", "إدراك بصري", "معالجة سمعية", "مهارات القراءة",
  "مهارات الكتابة", "مهارات حسابية", "انتباه وتركيز", "تدريب الذاكرة",
  "مهارات اجتماعية", "تعبير لغوي", "فهم واستيعاب", "تنظيم وتخطيط",
];

const PROGRESS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  significant_improvement: { label: "تحسن ملحوظ", color: "text-green-600", icon: TrendingUp },
  moderate_improvement: { label: "تحسن متوسط", color: "text-emerald-600", icon: TrendingUp },
  slight_improvement: { label: "تحسن طفيف", color: "text-lime-600", icon: ArrowUpRight },
  stable: { label: "مستقر", color: "text-blue-600", icon: Activity },
  slight_decline: { label: "تراجع طفيف", color: "text-orange-600", icon: ArrowDownRight },
  needs_attention: { label: "يحتاج اهتماماً", color: "text-red-600", icon: AlertTriangle },
};

const SKILL_COLORS: Record<string, string> = {
  "القراءة": "#3b82f6",
  "الكتابة": "#8b5cf6",
  "الرياضيات": "#f97316",
  "الانتباه": "#eab308",
  "التفاعل الاجتماعي": "#14b8a6",
  "الدافعية": "#ef4444",
};

export default function ProgressEvaluator() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const [viewingResult, setViewingResult] = useState<any>(null);

  // Form state
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState<number | undefined>();
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficultyType, setDifficultyType] = useState("");
  const [evalStartDate, setEvalStartDate] = useState("");
  const [evalEndDate, setEvalEndDate] = useState("");

  // Assessment data points
  const [assessmentData, setAssessmentData] = useState<{
    date: string; label: string;
    scores: { reading: number; writing: number; math: number; attention: number; social: number; motivation: number; };
    notes?: string;
  }[]>([
    { date: "", label: "التقييم 1", scores: { reading: 5, writing: 5, math: 5, attention: 5, social: 5, motivation: 5 } },
    { date: "", label: "التقييم 2", scores: { reading: 5, writing: 5, math: 5, attention: 5, social: 5, motivation: 5 } },
  ]);

  // Exercise data
  const [exercisesCompleted, setExercisesCompleted] = useState<{
    category: string; count: number; successRate: number; averageDuration: number;
  }[]>([]);

  // Queries
  const historyQuery = trpc.progressEvaluator.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!user }
  );
  const statsQuery = trpc.progressEvaluator.getStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mutations
  const generateMutation = trpc.progressEvaluator.generate.useMutation({
    onSuccess: (data: any) => {
      toast.success("تم إنشاء تقييم التقدم بنجاح!");
      setViewingResult(data);
      setActiveTab("result");
      historyQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل في إنشاء التقييم");
    },
  });

  const deleteMutation = trpc.progressEvaluator.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التقييم");
      historyQuery.refetch();
      statsQuery.refetch();
    },
  });

  const addAssessmentPoint = () => {
    setAssessmentData(prev => [...prev, {
      date: "", label: `التقييم ${prev.length + 1}`,
      scores: { reading: 5, writing: 5, math: 5, attention: 5, social: 5, motivation: 5 },
    }]);
  };

  const removeAssessmentPoint = (index: number) => {
    if (assessmentData.length <= 2) {
      toast.error("يجب أن يكون هناك نقطتا تقييم على الأقل");
      return;
    }
    setAssessmentData(prev => prev.filter((_, i) => i !== index));
  };

  const updateAssessmentPoint = (index: number, field: string, value: any) => {
    setAssessmentData(prev => prev.map((entry, i) => {
      if (i !== index) return entry;
      if (field.startsWith("scores.")) {
        const scoreField = field.replace("scores.", "");
        return { ...entry, scores: { ...entry.scores, [scoreField]: value } };
      }
      return { ...entry, [field]: value };
    }));
  };

  const addExerciseEntry = () => {
    setExercisesCompleted(prev => [...prev, {
      category: "", count: 0, successRate: 50, averageDuration: 15,
    }]);
  };

  const removeExerciseEntry = (index: number) => {
    setExercisesCompleted(prev => prev.filter((_, i) => i !== index));
  };

  const updateExerciseEntry = (index: number, field: string, value: any) => {
    setExercisesCompleted(prev => prev.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handleGenerate = () => {
    if (!studentName.trim()) {
      toast.error("يرجى إدخال اسم التلميذ");
      return;
    }
    if (!difficultyType) {
      toast.error("يرجى اختيار نوع الصعوبة");
      return;
    }
    if (!evalStartDate || !evalEndDate) {
      toast.error("يرجى تحديد فترة التقييم");
      return;
    }
    if (assessmentData.length < 2) {
      toast.error("يجب إدخال نقطتي تقييم على الأقل");
      return;
    }

    generateMutation.mutate({
      studentName,
      studentAge,
      gradeLevel: gradeLevel || undefined,
      difficultyType,
      evaluationStartDate: evalStartDate,
      evaluationEndDate: evalEndDate,
      assessmentData: assessmentData.map(a => ({
        ...a,
        date: a.date || a.label,
        notes: a.notes || undefined,
      })),
      exercisesCompleted: exercisesCompleted.length > 0 ? exercisesCompleted.filter(e => e.category) : undefined,
    });
  };

  // Chart data from assessment points
  const lineChartData = useMemo(() =>
    assessmentData.map(a => ({
      name: a.label || a.date,
      القراءة: a.scores.reading,
      الكتابة: a.scores.writing,
      الرياضيات: a.scores.math,
      الانتباه: a.scores.attention,
      التفاعل: a.scores.social,
      الدافعية: a.scores.motivation,
    })),
    [assessmentData]
  );

  const selectedDifficultyType = useMemo(
    () => DIFFICULTY_TYPES.find(d => d.value === difficultyType),
    [difficultyType]
  );

  // ===== NOT LOGGED IN =====
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white" dir="rtl">
        <div className="container max-w-4xl py-20 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
            <Activity className="h-10 w-10 text-violet-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">مقيّم التقدم</h1>
          <p className="mb-8 text-lg text-gray-600">
            أداة ذكية لتحليل تطور التلميذ عبر الزمن وتقديم رؤى تنبؤية حول مسار التقدم
          </p>
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
            <a href={getLoginUrl()}>تسجيل الدخول للاستخدام</a>
          </Button>
        </div>
      </div>
    );
  }

  // ===== RESULT VIEW =====
  const renderResult = () => {
    if (!viewingResult) return null;
    const ev = viewingResult;

    const progressInfo = PROGRESS_LABELS[ev.overallProgress] || PROGRESS_LABELS.stable;
    const ProgressIcon = progressInfo.icon;

    // Build chart data from assessmentData
    const assessments = (ev.assessmentData as any[]) || [];
    const resultLineData = assessments.map((a: any) => ({
      name: a.label || a.date,
      القراءة: a.scores.reading,
      الكتابة: a.scores.writing,
      الرياضيات: a.scores.math,
      الانتباه: a.scores.attention,
      التفاعل: a.scores.social,
      الدافعية: a.scores.motivation,
    }));

    // Skills improved bar chart
    const skillsImprovedData = ((ev.skillsImproved as any[]) || []).map((s: any) => ({
      name: s.skill,
      "الدرجة الأولى": s.fromScore,
      "الدرجة الأخيرة": s.toScore,
      "التغير": s.changePercent,
    }));

    const diffLabel = DIFFICULTY_TYPES.find(d => d.value === ev.difficultyType)?.label || ev.difficultyType;

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{ev.analysisTitle || "تقييم التقدم"}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="bg-white">{ev.studentName}</Badge>
                  <Badge variant="outline" className="bg-white">{diffLabel}</Badge>
                  <Badge variant="outline" className="bg-white">
                    {ev.evaluationStartDate} - {ev.evaluationEndDate}
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <div className={`flex items-center gap-2 ${progressInfo.color} text-lg font-bold`}>
                  <ProgressIcon className="h-6 w-6" />
                  {progressInfo.label}
                </div>
                {ev.progressPercentage != null && (
                  <div className="mt-2">
                    <div className="text-3xl font-bold text-violet-700">{ev.progressPercentage}%</div>
                    <div className="text-xs text-gray-500">نسبة التقدم</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Line Chart */}
          {resultLineData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                  تطور المهارات عبر التقييمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={resultLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="القراءة" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="الكتابة" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="الرياضيات" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="الانتباه" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="التفاعل" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="الدافعية" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Skills Improvement Bar Chart */}
          {skillsImprovedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  المهارات المتحسنة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillsImprovedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="الدرجة الأولى" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="الدرجة الأخيرة" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Analysis */}
        {ev.detailedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-600" />
                التحليل المفصل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ev.detailedAnalysis}</p>
            </CardContent>
          </Card>
        )}

        {/* Trend Analysis */}
        {ev.trendAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                تحليل الاتجاهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ev.trendAnalysis}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills Needing Work */}
        {ev.skillsNeedingWork && (ev.skillsNeedingWork as any[]).length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                <Target className="h-5 w-5" />
                مهارات تحتاج تطوير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(ev.skillsNeedingWork as any[]).map((skill: any, i: number) => (
                  <div key={i} className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-800">{skill.skill}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">الحالي: {skill.currentScore}/10</Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <Badge className="bg-orange-100 text-orange-800">المستهدف: {skill.targetScore}/10</Badge>
                      </div>
                    </div>
                    {skill.suggestedActivities && skill.suggestedActivities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">الأنشطة المقترحة:</p>
                        <ul className="space-y-1">
                          {skill.suggestedActivities.map((act: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Insights */}
        {ev.predictiveInsights && (
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-700">
                <Sparkles className="h-5 w-5" />
                رؤى تنبؤية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ev.predictiveInsights}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Plan */}
        {ev.actionPlan && (ev.actionPlan as any[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-violet-600" />
                خطة العمل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(ev.actionPlan as any[]).map((phase: any, i: number) => (
                  <div key={i} className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-violet-800">{phase.phase}</h4>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600 mb-1">الأهداف:</p>
                        <ul className="space-y-1">
                          {(phase.goals || []).map((g: string, j: number) => (
                            <li key={j} className="flex items-start gap-1">
                              <Target className="h-3 w-3 text-violet-500 mt-1 shrink-0" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600 mb-1">الأنشطة:</p>
                        <ul className="space-y-1">
                          {(phase.activities || []).map((a: string, j: number) => (
                            <li key={j} className="flex items-start gap-1">
                              <Star className="h-3 w-3 text-amber-500 mt-1 shrink-0" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600 mb-1">مؤشرات النجاح:</p>
                        <ul className="space-y-1">
                          {(phase.successMetrics || []).map((m: string, j: number) => (
                            <li key={j} className="flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => { setViewingResult(null); setActiveTab("generate"); }}>
            إنشاء تقييم جديد
          </Button>
        </div>
      </div>
    );
  };

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-violet-50/30" dir="rtl">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">مقيّم التقدم</h1>
                <p className="text-gray-500 mt-1">تحليل تطور التلميذ عبر الزمن مع رؤى تنبؤية</p>
              </div>
            </div>
            {statsQuery.data && (
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-violet-50 rounded-xl">
                  <div className="text-2xl font-bold text-violet-700">{statsQuery.data.totalEvaluations}</div>
                  <div className="text-xs text-gray-500">تقييمات مكتملة</div>
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
              تقييم جديد
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              السجل ({historyQuery.data?.total || 0})
            </TabsTrigger>
            {viewingResult && (
              <TabsTrigger value="result" className="gap-2">
                <FileText className="h-4 w-4" />
                النتيجة
              </TabsTrigger>
            )}
          </TabsList>

          {/* ===== GENERATE TAB ===== */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-violet-600" />
                      معلومات التلميذ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      نوع الصعوبة <span className="text-red-500">*</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                                ? "border-violet-500 bg-violet-50 shadow-md"
                                : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-full ${dt.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-medium leading-tight">{dt.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluation Period */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-violet-600" />
                      فترة التقييم <span className="text-red-500">*</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>تاريخ البداية</Label>
                        <Input type="date" value={evalStartDate} onChange={(e) => setEvalStartDate(e.target.value)} />
                      </div>
                      <div>
                        <Label>تاريخ النهاية</Label>
                        <Input type="date" value={evalEndDate} onChange={(e) => setEvalEndDate(e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment Data Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-violet-600" />
                      نقاط التقييم <span className="text-red-500">*</span>
                      <span className="text-sm font-normal text-gray-400">(نقطتان على الأقل)</span>
                    </CardTitle>
                    <CardDescription>أدخل درجات التلميذ في كل فترة تقييم</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assessmentData.map((point, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-violet-100 text-violet-700">
                              {idx + 1}
                            </Badge>
                            <Input
                              placeholder="اسم الفترة (مثال: أكتوبر)"
                              value={point.label}
                              onChange={(e) => updateAssessmentPoint(idx, "label", e.target.value)}
                              className="w-48"
                            />
                            <Input
                              type="date"
                              value={point.date}
                              onChange={(e) => updateAssessmentPoint(idx, "date", e.target.value)}
                              className="w-40"
                            />
                          </div>
                          {assessmentData.length > 2 && (
                            <Button variant="ghost" size="sm" onClick={() => removeAssessmentPoint(idx)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: "reading", label: "القراءة", color: "text-blue-600" },
                            { key: "writing", label: "الكتابة", color: "text-purple-600" },
                            { key: "math", label: "الرياضيات", color: "text-orange-600" },
                            { key: "attention", label: "الانتباه", color: "text-yellow-600" },
                            { key: "social", label: "التفاعل", color: "text-teal-600" },
                            { key: "motivation", label: "الدافعية", color: "text-red-600" },
                          ].map(({ key, label, color }) => (
                            <div key={key} className="flex items-center gap-2">
                              <Label className={`text-xs w-16 ${color}`}>{label}</Label>
                              <Input
                                type="number"
                                min={0}
                                max={10}
                                value={(point.scores as any)[key]}
                                onChange={(e) => updateAssessmentPoint(idx, `scores.${key}`, Number(e.target.value))}
                                className="w-16 text-center"
                              />
                              <span className="text-xs text-gray-400">/10</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Textarea
                            placeholder="ملاحظات إضافية (اختياري)"
                            value={point.notes || ""}
                            onChange={(e) => updateAssessmentPoint(idx, "notes", e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addAssessmentPoint} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      إضافة نقطة تقييم
                    </Button>
                  </CardContent>
                </Card>

                {/* Exercises Completed (Optional) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-green-600" />
                      التمارين المنجزة (اختياري)
                    </CardTitle>
                    <CardDescription>أضف بيانات التمارين العلاجية المنجزة خلال فترة التقييم</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exercisesCompleted.map((ex, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Select value={ex.category} onValueChange={(v) => updateExerciseEntry(idx, "category", v)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXERCISE_CATEGORIES.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">العدد</Label>
                          <Input type="number" min={0} value={ex.count} onChange={(e) => updateExerciseEntry(idx, "count", Number(e.target.value))} className="w-16" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">النجاح%</Label>
                          <Input type="number" min={0} max={100} value={ex.successRate} onChange={(e) => updateExerciseEntry(idx, "successRate", Number(e.target.value))} className="w-16" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">المدة(د)</Label>
                          <Input type="number" min={0} value={ex.averageDuration} onChange={(e) => updateExerciseEntry(idx, "averageDuration", Number(e.target.value))} className="w-16" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeExerciseEntry(idx)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addExerciseEntry} className="w-full gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      إضافة فئة تمارين
                    </Button>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !studentName.trim() || !difficultyType || !evalStartDate || !evalEndDate || assessmentData.length < 2}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2 px-8"
                    size="lg"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري تحليل التقدم...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        تحليل التقدم
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="space-y-6">
                {/* Live Chart Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">معاينة تطور المهارات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Tooltip />
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

                {/* Summary */}
                <Card className="bg-violet-50 border-violet-200">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold text-violet-800">ملخص البيانات</h3>
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
                        <span className="text-gray-600">نقاط التقييم:</span>
                        <span className="font-bold text-violet-700">{assessmentData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">التمارين:</span>
                        <span className="font-medium">{exercisesCompleted.length} فئة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">كيف يعمل مقيّم التقدم؟</p>
                        <p>أدخل درجات التلميذ في فترات مختلفة، وسيقوم الذكاء الاصطناعي بتحليل الاتجاهات وتقديم رؤى تنبؤية وخطة عمل مخصصة.</p>
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
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : !historyQuery.data?.items.length ? (
              <Card className="text-center py-16">
                <CardContent>
                  <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد تقييمات بعد</h3>
                  <p className="text-gray-400 mb-4">ابدأ بإنشاء أول تقييم تقدم</p>
                  <Button onClick={() => setActiveTab("generate")} className="bg-violet-500 hover:bg-violet-600">
                    <Sparkles className="h-4 w-4 ml-2" />
                    تقييم جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {historyQuery.data.items.map((item: any) => {
                  const diffLabel = DIFFICULTY_TYPES.find(d => d.value === item.difficultyType)?.label || item.difficultyType;
                  const progressInfo = PROGRESS_LABELS[item.overallProgress] || PROGRESS_LABELS.stable;
                  const ProgressIcon = progressInfo.icon;
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{item.analysisTitle || item.studentName}</h3>
                              <Badge variant={item.status === "completed" ? "default" : item.status === "pending" ? "secondary" : "destructive"}>
                                {item.status === "completed" ? "مكتمل" : item.status === "pending" ? "قيد المعالجة" : "فشل"}
                              </Badge>
                              {item.status === "completed" && (
                                <span className={`flex items-center gap-1 text-sm ${progressInfo.color}`}>
                                  <ProgressIcon className="h-4 w-4" />
                                  {progressInfo.label}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{item.studentName}</Badge>
                              <Badge variant="outline">{diffLabel}</Badge>
                              {item.progressPercentage != null && (
                                <Badge variant="outline" className="bg-violet-50">{item.progressPercentage}% تقدم</Badge>
                              )}
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
