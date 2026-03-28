import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowRight, Brain, Dumbbell, Eye, Ear, BookOpen, PenTool,
  Calculator, Target, MemoryStick, Users, MessageSquare, Lightbulb,
  FolderOpen, Clock, ChevronDown, ChevronUp, Trash2, Loader2,
  Sparkles, GraduationCap, Home, Heart, AlertTriangle, CheckCircle2,
  ArrowLeft, Star, Zap, FileText, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import useI18n from "@/i18n";


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

const EXERCISE_CATEGORIES = [
  { value: "motor_skills", label: "مهارات حركية دقيقة", icon: Dumbbell },
  { value: "visual_perception", label: "إدراك بصري", icon: Eye },
  { value: "auditory_processing", label: "معالجة سمعية", icon: Ear },
  { value: "reading_skills", label: "مهارات القراءة", icon: BookOpen },
  { value: "writing_skills", label: "مهارات الكتابة", icon: PenTool },
  { value: "math_skills", label: "مهارات حسابية", icon: Calculator },
  { value: "attention_focus", label: "انتباه وتركيز", icon: Target },
  { value: "memory_training", label: "تدريب الذاكرة", icon: Brain },
  { value: "social_skills", label: "مهارات اجتماعية", icon: Users },
  { value: "language_expression", label: "تعبير لغوي", icon: MessageSquare },
  { value: "comprehension", label: "فهم واستيعاب", icon: Lightbulb },
  { value: "organization", label: "تنظيم وتخطيط", icon: FolderOpen },
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

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "مبتدئ", description: "تمارين بسيطة وتأسيسية", color: "text-green-600" },
  { value: "intermediate", label: "متوسط", description: "تمارين تطبيقية متدرجة", color: "text-yellow-600" },
  { value: "advanced", label: "متقدم", description: "تمارين تحدي وتعميق", color: "text-red-600" },
];

export default function TherapeuticExercises() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [viewingResult, setViewingResult] = useState<any>(null);

  // Form state
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState<number | undefined>();
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficultyType, setDifficultyType] = useState("");
  const [exerciseCategory, setExerciseCategory] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");
  const [subject, setSubject] = useState("");
  const [specificSkill, setSpecificSkill] = useState("");
  const [sessionDuration, setSessionDuration] = useState(20);
  const [exerciseCount, setExerciseCount] = useState(5);

  // Queries
  const historyQuery = trpc.therapeuticExercisesGen.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!user }
  );
  const statsQuery = trpc.therapeuticExercisesGen.getStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Mutations
  const generateMutation = trpc.therapeuticExercisesGen.generate.useMutation({
    onSuccess: (data) => {
      toast.success("تم توليد التمارين بنجاح!");
      setViewingResult(data);
      setActiveTab("result");
      historyQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل في توليد التمارين");
    },
  });

  const deleteMutation = trpc.therapeuticExercisesGen.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف مجموعة التمارين");
      historyQuery.refetch();
      statsQuery.refetch();
    },
  });

  const handleGenerate = () => {
    if (!difficultyType) {
      toast.error("يرجى اختيار نوع الاضطراب");
      return;
    }
    if (!exerciseCategory) {
      toast.error("يرجى اختيار فئة التمارين");
      return;
    }
    generateMutation.mutate({
      studentName: studentName || undefined,
      studentAge: studentAge || undefined,
      gradeLevel: gradeLevel || undefined,
      difficultyType,
      exerciseCategory,
      difficultyLevel: difficultyLevel as "beginner" | "intermediate" | "advanced",
      subject: subject || undefined,
      specificSkill: specificSkill || undefined,
      sessionDuration,
      exerciseCount,
    });
  };

  const handleViewHistoryItem = (item: any) => {
    setViewingResult(item);
    setActiveTab("result");
  };

  const selectedDifficultyType = useMemo(
    () => DIFFICULTY_TYPES.find(d => d.value === difficultyType),
    [difficultyType]
  );

  // ===== NOT LOGGED IN =====
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" dir="rtl">
        <div className="container max-w-4xl py-20 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Dumbbell className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">مولّد التمارين العلاجية</h1>
          <p className="mb-8 text-lg text-gray-600">
            أداة ذكية تولّد تمارين تدريجية مخصصة لكل نوع اضطراب تعلّم
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <a href={getLoginUrl()}>تسجيل الدخول للاستخدام</a>
          </Button>
        </div>
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" dir="rtl">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Dumbbell className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">مولّد التمارين العلاجية</h1>
                <p className="text-gray-500 mt-1">تمارين تدريجية مخصصة لكل نوع اضطراب تعلّم</p>
              </div>
            </div>
            {statsQuery.data && (
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-700">{statsQuery.data.total}</div>
                  <div className="text-xs text-gray-500">إجمالي التوليدات</div>
                </div>
                <div className="text-center px-4 py-2 bg-teal-50 rounded-xl">
                  <div className="text-2xl font-bold text-teal-700">{statsQuery.data.completed}</div>
                  <div className="text-xs text-gray-500">مكتملة</div>
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
              توليد تمارين
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
                {/* Student Info (Optional) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                      معلومات التلميذ (اختياري)
                    </CardTitle>
                    <CardDescription>يمكنك تخصيص التمارين لتلميذ محدد</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>اسم التلميذ</Label>
                        <Input
                          placeholder="مثال: أحمد"
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
                      نوع الاضطراب <span className="text-red-500">*</span>
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
                                ? "border-emerald-500 bg-emerald-50 shadow-md"
                                : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-full ${dt.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-medium leading-tight">{dt.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      فئة التمارين <span className="text-red-500">*</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {EXERCISE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = exerciseCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => setExerciseCategory(cat.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                            <span className="text-sm font-medium">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      إعدادات إضافية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>مستوى الصعوبة</Label>
                        <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map(dl => (
                              <SelectItem key={dl.value} value={dl.value}>
                                <span className={dl.color}>{dl.label}</span> - {dl.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>المادة الدراسية (اختياري)</Label>
                        <Input
                          placeholder="مثال: رياضيات، عربية..."
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>المهارة المستهدفة (اختياري)</Label>
                        <Input
                          placeholder="مثال: التمييز بين الحروف المتشابهة"
                          value={specificSkill}
                          onChange={(e) => setSpecificSkill(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>مدة الحصة (دقيقة)</Label>
                          <Input
                            type="number"
                            min={5}
                            max={60}
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>عدد التمارين</Label>
                          <Input
                            type="number"
                            min={3}
                            max={10}
                            value={exerciseCount}
                            onChange={(e) => setExerciseCount(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Summary & Generate */}
              <div className="space-y-6">
                <Card className="sticky top-4 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-lg">ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {studentName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">التلميذ:</span>
                          <span className="font-medium">{studentName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">الاضطراب:</span>
                        <span className="font-medium">{selectedDifficultyType?.label || "لم يُحدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">الفئة:</span>
                        <span className="font-medium">
                          {EXERCISE_CATEGORIES.find(c => c.value === exerciseCategory)?.label || "لم تُحدد"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">المستوى:</span>
                        <span className="font-medium">
                          {DIFFICULTY_LEVELS.find(l => l.value === difficultyLevel)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">المدة:</span>
                        <span className="font-medium">{sessionDuration} دقيقة</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">عدد التمارين:</span>
                        <span className="font-medium">{exerciseCount}</span>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleGenerate}
                      disabled={!difficultyType || !exerciseCategory || generateMutation.isPending}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                      size="lg"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin ms-2" />
                          جاري التوليد...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 ms-2" />
                          توليد التمارين
                        </>
                      )}
                    </Button>

                    {generateMutation.isPending && (
                      <p className="text-xs text-center text-gray-500">
                        قد يستغرق التوليد 15-30 ثانية...
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-blue-500" />
                      نصائح للاستخدام
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600 space-y-2">
                    <p>- ابدأ بمستوى "مبتدئ" ثم تدرّج حسب تقدم التلميذ</p>
                    <p>- حدد المهارة المستهدفة لنتائج أدق</p>
                    <p>- استخدم نشاط التهدئة في نهاية كل حصة</p>
                    <p>- شارك إرشادات الأولياء مع عائلة التلميذ</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ===== HISTORY TAB ===== */}
          <TabsContent value="history">
            {historyQuery.isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : !historyQuery.data?.items.length ? (
              <Card className="py-16 text-center">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد تمارين سابقة</p>
                <p className="text-gray-400 text-sm mt-1">ابدأ بتوليد مجموعة تمارين جديدة</p>
                <Button
                  onClick={() => setActiveTab("generate")}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4 ms-2" />
                  توليد تمارين
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyQuery.data.items.map((item) => {
                  const dt = DIFFICULTY_TYPES.find(d => d.value === item.difficultyType);
                  const cat = EXERCISE_CATEGORIES.find(c => c.value === item.exerciseCategory);
                  const DtIcon = dt?.icon || Brain;
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`h-10 w-10 rounded-lg ${dt?.color || "bg-gray-500"} flex items-center justify-center`}>
                            <DtIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex gap-1">
                            <Badge variant={item.status === "completed" ? "default" : item.status === "failed" ? "destructive" : "secondary"}>
                              {item.status === "completed" ? "مكتمل" : item.status === "failed" ? "فشل" : "قيد المعالجة"}
                            </Badge>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {item.title || `تمارين ${dt?.label || ""}`}
                        </h3>
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          {item.studentName && <p>التلميذ: {item.studentName}</p>}
                          <p>الفئة: {cat?.label || item.exerciseCategory}</p>
                          <p>عدد التمارين: {(item.exercises as any[])?.length || item.exerciseCount}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString("ar-TN")}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleViewHistoryItem(item); }}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              عرض
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("هل تريد حذف هذه المجموعة؟")) {
                                  deleteMutation.mutate({ id: item.id });
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
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
            {viewingResult && (
              <div className="space-y-6">
                {/* Result Header */}
                <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{viewingResult.title}</h2>
                        <p className="text-gray-600 mt-2">{viewingResult.introduction}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setViewingResult(null);
                            setActiveTab("generate");
                          }}
                        >
                          توليد جديد
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercises List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-emerald-600" />
                    التمارين ({viewingResult.exercises?.length || 0})
                  </h3>
                  {viewingResult.exercises?.map((ex: any, idx: number) => {
                    const isExpanded = expandedExercise === idx;
                    return (
                      <Card key={idx} className={`transition-all ${isExpanded ? "ring-2 ring-emerald-300" : ""}`}>
                        <CardContent className="p-0">
                          <button
                            onClick={() => setExpandedExercise(isExpanded ? null : idx)}
                            className="w-full p-4 flex items-center justify-between text-end"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                {ex.order || idx + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold">{ex.title}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{ex.type}</Badge>
                                  {ex.duration && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="h-3 w-3 ms-1" />
                                      {ex.duration} د
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-4 border-t">
                              <div className="pt-4">
                                <h5 className="font-medium text-emerald-700 mb-2 flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  التعليمات
                                </h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{ex.instructions}</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  المحتوى
                                </h5>
                                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{ex.content}</p>
                              </div>
                              {ex.expectedResponse && (
                                <div>
                                  <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    الإجابة المتوقعة
                                  </h5>
                                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg text-sm">{ex.expectedResponse}</p>
                                </div>
                              )}
                              {ex.hint && (
                                <div>
                                  <h5 className="font-medium text-yellow-700 mb-2 flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    تلميح مساعد
                                  </h5>
                                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg text-sm">{ex.hint}</p>
                                </div>
                              )}
                              {ex.adaptationTip && (
                                <div>
                                  <h5 className="font-medium text-purple-700 mb-2 flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    نصيحة للتكييف
                                  </h5>
                                  <p className="text-gray-700 bg-purple-50 p-3 rounded-lg text-sm">{ex.adaptationTip}</p>
                                </div>
                              )}
                              {ex.materials?.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">المواد المطلوبة:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {ex.materials.map((m: string, i: number) => (
                                      <Badge key={i} variant="outline">{m}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Cooldown Activity */}
                {viewingResult.cooldownActivity && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Heart className="h-5 w-5" />
                        نشاط التهدئة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{viewingResult.cooldownActivity}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Teacher Notes */}
                {viewingResult.teacherNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                        ملاحظات المعلم
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewingResult.teacherNotes.objectives?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-emerald-700 mb-2">الأهداف التعلمية</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {viewingResult.teacherNotes.objectives.map((o: string, i: number) => (
                                <li key={i}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewingResult.teacherNotes.prerequisites?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-blue-700 mb-2">المتطلبات القبلية</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {viewingResult.teacherNotes.prerequisites.map((p: string, i: number) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewingResult.teacherNotes.successIndicators?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">مؤشرات النجاح</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {viewingResult.teacherNotes.successIndicators.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewingResult.teacherNotes.commonMistakes?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">الأخطاء الشائعة</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {viewingResult.teacherNotes.commonMistakes.map((m: string, i: number) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewingResult.teacherNotes.extensionIdeas?.length > 0 && (
                          <div className="md:col-span-2">
                            <h5 className="font-medium text-purple-700 mb-2">أفكار للتوسيع</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {viewingResult.teacherNotes.extensionIdeas.map((e: string, i: number) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Parent Guidance */}
                {viewingResult.parentGuidance && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Home className="h-5 w-5" />
                        إرشادات للأولياء
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{viewingResult.parentGuidance}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
