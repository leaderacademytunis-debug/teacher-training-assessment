import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  HeartHandshake, Plus, ChevronRight, ChevronLeft, User, Brain, FileText,
  Sparkles, Loader2, CheckCircle2, BookOpen, Users, ClipboardList,
  Target, Calendar, ArrowLeft, Trash2, Eye, Download, AlertCircle,
  GraduationCap, Activity, Home, Lightbulb, Shield, Clock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Difficulty types with translations
const DIFFICULTIES = [
  { value: "dyslexia", ar: "عسر القراءة", fr: "Dyslexie", icon: "📖", color: "#E74C3C" },
  { value: "dysgraphia", ar: "عسر الكتابة", fr: "Dysgraphie", icon: "✏️", color: "#E67E22" },
  { value: "dyscalculia", ar: "عسر الحساب", fr: "Dyscalculie", icon: "🔢", color: "#9B59B6" },
  { value: "dysphasia", ar: "عسر النطق", fr: "Dysphasie", icon: "🗣️", color: "#3498DB" },
  { value: "dyspraxia", ar: "عسر التنسيق الحركي", fr: "Dyspraxie", icon: "🤸", color: "#1ABC9C" },
  { value: "adhd", ar: "فرط النشاط ونقص الانتباه", fr: "TDAH", icon: "⚡", color: "#F39C12" },
  { value: "autism_spectrum", ar: "طيف التوحد", fr: "TSA", icon: "🧩", color: "#2ECC71" },
  { value: "slow_learner", ar: "بطء التعلم", fr: "Lenteur", icon: "🐢", color: "#95A5A6" },
  { value: "other", ar: "أخرى", fr: "Autre", icon: "📋", color: "#7F8C8D" },
] as const;

const GRADES = [
  "السنة التحضيرية", "السنة 1", "السنة 2", "السنة 3", "السنة 4", "السنة 5", "السنة 6",
  "السنة 7", "السنة 8", "السنة 9",
];

const SUBJECTS = [
  "القراءة", "الكتابة", "الرياضيات", "العلوم", "الإيقاظ العلمي", "اللغة العربية",
  "اللغة الفرنسية", "التربية الإسلامية", "التربية المدنية", "التاريخ والجغرافيا",
  "التربية التشكيلية", "التربية البدنية", "جميع المواد",
];

const DURATIONS = [
  "أسبوعان", "3 أسابيع", "4 أسابيع", "6 أسابيع", "فصل دراسي كامل", "سنة دراسية",
];

type ViewMode = "home" | "new-profile" | "profiles" | "generate" | "plans" | "view-plan";

export default function PedagogicalCompanion() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [step, setStep] = useState(1);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [language, setLanguage] = useState<"ar" | "fr">("ar");

  // Form state for new profile
  const [profileForm, setProfileForm] = useState({
    studentCode: "",
    studentAge: "",
    studentGrade: "",
    studentGender: "male" as "male" | "female",
    primaryDifficulty: "" as string,
    secondaryDifficulties: [] as string[],
    teacherObservations: "",
    behavioralNotes: "",
    academicStrengths: "",
    academicWeaknesses: "",
    previousInterventions: "",
    familyContext: "",
  });

  // Form state for plan generation
  const [planForm, setPlanForm] = useState({
    targetSubject: "",
    planDuration: "",
    additionalNotes: "",
  });

  // Queries
  const stats = trpc.pedagogicalCompanion.getMyStats.useQuery(undefined, { enabled: !!user });
  const profiles = trpc.pedagogicalCompanion.getMyStudentProfiles.useQuery(undefined, { enabled: !!user });
  const plans = trpc.pedagogicalCompanion.getMySupportPlans.useQuery(undefined, { enabled: !!user });
  const selectedPlan = trpc.pedagogicalCompanion.getSupportPlan.useQuery(
    { id: selectedPlanId! },
    { enabled: !!selectedPlanId && viewMode === "view-plan" }
  );

  // Mutations
  const createProfile = trpc.pedagogicalCompanion.createStudentProfile.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء ملف التلميذ بنجاح");
      profiles.refetch();
      stats.refetch();
      setViewMode("profiles");
      resetProfileForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProfile = trpc.pedagogicalCompanion.deleteStudentProfile.useMutation({
    onSuccess: () => {
      toast.success("تم حذف ملف التلميذ");
      profiles.refetch();
      stats.refetch();
    },
  });

  const generatePlan = trpc.pedagogicalCompanion.generateSupportPlan.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء خطة المرافقة الفردية");
      plans.refetch();
      stats.refetch();
      setSelectedPlanId(data.id);
      setViewMode("view-plan");
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePlan = trpc.pedagogicalCompanion.deleteSupportPlan.useMutation({
    onSuccess: () => {
      toast.success("تم الحذف");
      plans.refetch();
      stats.refetch();
    },
  });

  const updatePlanStatus = trpc.pedagogicalCompanion.updatePlanStatus.useMutation({
    onSuccess: () => {
      toast.success("تم التحديث");
      plans.refetch();
      selectedPlan.refetch();
    },
  });

  function resetProfileForm() {
    setProfileForm({
      studentCode: "", studentAge: "", studentGrade: "", studentGender: "male",
      primaryDifficulty: "", secondaryDifficulties: [], teacherObservations: "",
      behavioralNotes: "", academicStrengths: "", academicWeaknesses: "",
      previousInterventions: "", familyContext: "",
    });
    setStep(1);
  }

  function handleCreateProfile() {
    if (!profileForm.studentCode || !profileForm.primaryDifficulty) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    createProfile.mutate({
      ...profileForm,
      studentAge: profileForm.studentAge ? parseInt(profileForm.studentAge) : undefined,
      studentGender: profileForm.studentGender,
      primaryDifficulty: profileForm.primaryDifficulty as any,
    });
  }

  function handleGeneratePlan() {
    if (!selectedProfileId || !planForm.targetSubject || !planForm.planDuration) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    generatePlan.mutate({
      studentProfileId: selectedProfileId,
      targetSubject: planForm.targetSubject,
      planDuration: planForm.planDuration,
      additionalNotes: planForm.additionalNotes,
      language,
    });
  }

  const getDifficultyInfo = (key: string) => DIFFICULTIES.find(d => d.value === key);

  // ===== NOT LOGGED IN =====
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white" dir="rtl">
        <div className="container max-w-4xl py-20 text-center">
          <HeartHandshake className="w-20 h-20 mx-auto text-teal-600 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">المرافق البيداغوجي الخاص</h1>
          <p className="text-lg text-gray-600 mb-8">أداة ذكية لتوليد خطط مرافقة فردية للتلاميذ ذوي صعوبات التعلم</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              سجّل الدخول للبدء
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // ===== HOME VIEW =====
  if (viewMode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30" dir="rtl">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full bg-emerald-300/20 blur-3xl" />
          </div>
          <div className="container max-w-6xl py-12 relative">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/learning-support">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  العودة لأدوات ذوي الصعوبات
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <Sparkles className="w-3 h-3 ml-1" /> مدعوم بالذكاء الاصطناعي
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">المرافق البيداغوجي الخاص</h1>
                <p className="text-lg text-teal-100 mb-6 leading-relaxed">
                  أنشئ خطط مرافقة فردية مفصّلة ومهنية لكل تلميذ يعاني من صعوبات التعلم.
                  الأداة تحلّل حالة التلميذ وتولّد خطة أسبوعية مع أنشطة علاجية واستراتيجيات تدريس مكيّفة.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold" onClick={() => setViewMode("new-profile")}>
                    <Plus className="w-5 h-5 ml-2" /> إنشاء ملف تلميذ جديد
                  </Button>
                  {(profiles.data?.length || 0) > 0 && (
                    <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => setViewMode("profiles")}>
                      <Users className="w-5 h-5 ml-2" /> ملفات التلاميذ ({profiles.data?.length})
                    </Button>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <HeartHandshake className="w-24 h-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container max-w-6xl -mt-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.data?.totalProfiles || 0}</p>
                  <p className="text-sm text-gray-500">ملفات التلاميذ</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.data?.totalPlans || 0}</p>
                  <p className="text-sm text-gray-500">خطط المرافقة</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.data?.activePlans || 0}</p>
                  <p className="text-sm text-gray-500">خطط نشطة</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="container max-w-6xl py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">كيف تعمل الأداة؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: User, title: "أنشئ ملف التلميذ", desc: "أدخل معلومات التلميذ ونوع الصعوبة وملاحظاتك", color: "teal" },
              { icon: Brain, title: "حدد المادة والمدة", desc: "اختر المادة المستهدفة ومدة خطة المرافقة", color: "blue" },
              { icon: Sparkles, title: "الذكاء الاصطناعي يحلّل", desc: "يحلّل الحالة ويولّد خطة مرافقة مفصّلة", color: "purple" },
              { icon: FileText, title: "خطة جاهزة للتطبيق", desc: "خطة أسبوعية مع أنشطة وتكييفات وتوجيهات", color: "green" },
            ].map((item, i) => (
              <Card key={i} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-${item.color}-100 flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-sm font-bold text-gray-500">{i + 1}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Plans */}
        {(plans.data?.length || 0) > 0 && (
          <div className="container max-w-6xl pb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">آخر خطط المرافقة</h2>
              <Button variant="outline" onClick={() => setViewMode("plans")}>
                عرض الكل <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.data?.slice(0, 3).map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md"
                  onClick={() => { setSelectedPlanId(plan.id); setViewMode("view-plan"); }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{plan.planTitle}</h3>
                      <Badge variant={plan.status === "active" ? "default" : "secondary"} className="text-xs">
                        {plan.status === "draft" ? "مسودة" : plan.status === "active" ? "نشط" : plan.status === "completed" ? "مكتمل" : "مؤرشف"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {plan.targetSubject}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {plan.planDuration}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{new Date(plan.createdAt).toLocaleDateString("ar-TN")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== NEW PROFILE (Multi-step form) =====
  if (viewMode === "new-profile") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8" dir="rtl">
        <div className="container max-w-3xl">
          <Button variant="ghost" className="mb-4" onClick={() => { setViewMode("home"); resetProfileForm(); }}>
            <ArrowLeft className="w-4 h-4 ml-1" /> العودة
          </Button>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-l from-teal-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> إنشاء ملف تلميذ جديد
              </CardTitle>
              <CardDescription className="text-teal-100">الخطوة {step} من 3</CardDescription>
              {/* Progress bar */}
              <div className="flex gap-2 mt-3">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-white" : "bg-white/30"}`} />
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" /> المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>رمز التلميذ <span className="text-red-500">*</span></Label>
                      <Input placeholder="مثال: T1-2026" value={profileForm.studentCode}
                        onChange={e => setProfileForm(p => ({ ...p, studentCode: e.target.value }))} />
                      <p className="text-xs text-gray-400 mt-1">رمز مجهول لحماية خصوصية التلميذ</p>
                    </div>
                    <div>
                      <Label>العمر</Label>
                      <Input type="number" min={3} max={20} placeholder="مثال: 8" value={profileForm.studentAge}
                        onChange={e => setProfileForm(p => ({ ...p, studentAge: e.target.value }))} />
                    </div>
                    <div>
                      <Label>المستوى الدراسي</Label>
                      <Select value={profileForm.studentGrade} onValueChange={v => setProfileForm(p => ({ ...p, studentGrade: v }))}>
                        <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                        <SelectContent>
                          {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>الجنس</Label>
                      <Select value={profileForm.studentGender} onValueChange={(v: "male" | "female") => setProfileForm(p => ({ ...p, studentGender: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">الصعوبة الأساسية <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {DIFFICULTIES.map(d => (
                        <button key={d.value}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${
                            profileForm.primaryDifficulty === d.value
                              ? "border-teal-500 bg-teal-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setProfileForm(p => ({ ...p, primaryDifficulty: d.value }))}
                        >
                          <span className="text-xl">{d.icon}</span>
                          <p className="font-medium text-sm mt-1">{d.ar}</p>
                          <p className="text-xs text-gray-400">{d.fr}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => {
                      if (!profileForm.studentCode || !profileForm.primaryDifficulty) {
                        toast.error("يرجى ملء رمز التلميذ واختيار الصعوبة الأساسية");
                        return;
                      }
                      setStep(2);
                    }} className="bg-teal-600 hover:bg-teal-700">
                      التالي <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Observations */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" /> الملاحظات والتقييم
                  </h3>
                  <div>
                    <Label>ملاحظات المعلم</Label>
                    <Textarea placeholder="ماذا لاحظت على هذا التلميذ في الفصل؟ (مثال: يخلط بين الحروف المتشابهة، يجد صعوبة في القراءة الجهرية...)"
                      rows={3} value={profileForm.teacherObservations}
                      onChange={e => setProfileForm(p => ({ ...p, teacherObservations: e.target.value }))} />
                  </div>
                  <div>
                    <Label>ملاحظات سلوكية</Label>
                    <Textarea placeholder="كيف يتصرف التلميذ في الفصل؟ (مثال: كثير الحركة، يفقد التركيز بسرعة، منعزل...)"
                      rows={3} value={profileForm.behavioralNotes}
                      onChange={e => setProfileForm(p => ({ ...p, behavioralNotes: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>نقاط القوة الأكاديمية</Label>
                      <Textarea placeholder="ما هي المجالات التي يتفوق فيها التلميذ؟"
                        rows={2} value={profileForm.academicStrengths}
                        onChange={e => setProfileForm(p => ({ ...p, academicStrengths: e.target.value }))} />
                    </div>
                    <div>
                      <Label>نقاط الضعف الأكاديمية</Label>
                      <Textarea placeholder="ما هي المجالات التي يعاني فيها التلميذ؟"
                        rows={2} value={profileForm.academicWeaknesses}
                        onChange={e => setProfileForm(p => ({ ...p, academicWeaknesses: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronRight className="w-4 h-4 ml-1" /> السابق
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-teal-600 hover:bg-teal-700">
                      التالي <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Context */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-teal-600" /> السياق والتدخلات السابقة
                  </h3>
                  <div>
                    <Label>تدخلات سابقة</Label>
                    <Textarea placeholder="هل تم تجريب أي تدخلات أو استراتيجيات سابقة مع هذا التلميذ؟ ما النتائج؟"
                      rows={3} value={profileForm.previousInterventions}
                      onChange={e => setProfileForm(p => ({ ...p, previousInterventions: e.target.value }))} />
                  </div>
                  <div>
                    <Label>السياق العائلي</Label>
                    <Textarea placeholder="ما مستوى دعم العائلة؟ هل هناك ظروف خاصة يجب مراعاتها؟"
                      rows={3} value={profileForm.familyContext}
                      onChange={e => setProfileForm(p => ({ ...p, familyContext: e.target.value }))} />
                  </div>

                  {/* Summary */}
                  <Card className="bg-teal-50 border-teal-200">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-teal-800 mb-2">ملخص الملف</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">الرمز:</span> {profileForm.studentCode}</p>
                        <p><span className="text-gray-500">العمر:</span> {profileForm.studentAge || "—"}</p>
                        <p><span className="text-gray-500">المستوى:</span> {profileForm.studentGrade || "—"}</p>
                        <p><span className="text-gray-500">الصعوبة:</span> {getDifficultyInfo(profileForm.primaryDifficulty)?.ar || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ChevronRight className="w-4 h-4 ml-1" /> السابق
                    </Button>
                    <Button onClick={handleCreateProfile} disabled={createProfile.isPending}
                      className="bg-teal-600 hover:bg-teal-700">
                      {createProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
                      حفظ الملف
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== PROFILES LIST =====
  if (viewMode === "profiles") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8" dir="rtl">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setViewMode("home")}>
                <ArrowLeft className="w-4 h-4 ml-1" /> العودة
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">ملفات التلاميذ</h1>
            </div>
            <Button onClick={() => setViewMode("new-profile")} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 ml-2" /> ملف جديد
            </Button>
          </div>

          {profiles.isLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" /></div>
          ) : !profiles.data?.length ? (
            <Card className="text-center py-16 border-0 shadow-lg">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">لا توجد ملفات تلاميذ بعد</p>
              <Button onClick={() => setViewMode("new-profile")} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 ml-2" /> إنشاء أول ملف
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.data.map(profile => {
                const diff = getDifficultyInfo(profile.primaryDifficulty);
                return (
                  <Card key={profile.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: diff?.color + "15" }}>
                            {diff?.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{profile.studentCode}</h3>
                            <p className="text-sm text-gray-500">{diff?.ar} • {profile.studentGrade || "—"}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteProfile.mutate({ id: profile.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {profile.teacherObservations && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{profile.teacherObservations}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{new Date(profile.createdAt).toLocaleDateString("ar-TN")}</span>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => { setSelectedProfileId(profile.id); setViewMode("generate"); }}>
                          <Sparkles className="w-3.5 h-3.5 ml-1" /> توليد خطة مرافقة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== GENERATE PLAN =====
  if (viewMode === "generate") {
    const selectedProfile = profiles.data?.find(p => p.id === selectedProfileId);
    const diff = selectedProfile ? getDifficultyInfo(selectedProfile.primaryDifficulty) : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8" dir="rtl">
        <div className="container max-w-3xl">
          <Button variant="ghost" className="mb-4" onClick={() => setViewMode("profiles")}>
            <ArrowLeft className="w-4 h-4 ml-1" /> العودة للملفات
          </Button>

          {generatePlan.isPending ? (
            <Card className="border-0 shadow-xl text-center py-16">
              <CardContent>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-200 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">الذكاء الاصطناعي يعمل...</h2>
                <p className="text-gray-500 mb-4">جاري تحليل حالة التلميذ وتوليد خطة مرافقة مفصّلة</p>
                <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  قد يستغرق هذا 15-30 ثانية...
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-teal-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> توليد خطة مرافقة فردية
                </CardTitle>
                {selectedProfile && (
                  <div className="flex items-center gap-2 mt-2 text-teal-100">
                    <span className="text-lg">{diff?.icon}</span>
                    <span>{selectedProfile.studentCode} — {diff?.ar}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label>المادة المستهدفة <span className="text-red-500">*</span></Label>
                  <Select value={planForm.targetSubject} onValueChange={v => setPlanForm(p => ({ ...p, targetSubject: v }))}>
                    <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>مدة الخطة <span className="text-red-500">*</span></Label>
                  <Select value={planForm.planDuration} onValueChange={v => setPlanForm(p => ({ ...p, planDuration: v }))}>
                    <SelectTrigger><SelectValue placeholder="اختر المدة" /></SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>لغة الخطة</Label>
                  <Select value={language} onValueChange={(v: "ar" | "fr") => setLanguage(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="fr">الفرنسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ملاحظات إضافية (اختياري)</Label>
                  <Textarea placeholder="أي تفاصيل إضافية تريد أن يراعيها الذكاء الاصطناعي في الخطة..."
                    rows={3} value={planForm.additionalNotes}
                    onChange={e => setPlanForm(p => ({ ...p, additionalNotes: e.target.value }))} />
                </div>
                <Button onClick={handleGeneratePlan} className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg">
                  <Sparkles className="w-5 h-5 ml-2" /> توليد خطة المرافقة بالذكاء الاصطناعي
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ===== PLANS LIST =====
  if (viewMode === "plans") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8" dir="rtl">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setViewMode("home")}>
                <ArrowLeft className="w-4 h-4 ml-1" /> العودة
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">خطط المرافقة</h1>
            </div>
          </div>

          {plans.isLoading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" /></div>
          ) : !plans.data?.length ? (
            <Card className="text-center py-16 border-0 shadow-lg">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">لا توجد خطط مرافقة بعد</p>
              <Button onClick={() => setViewMode("profiles")} className="bg-teal-600 hover:bg-teal-700">
                اختر تلميذاً لتوليد خطة
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {plans.data.map(plan => (
                <Card key={plan.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{plan.planTitle}</h3>
                          <Badge variant={plan.status === "active" ? "default" : "secondary"} className="text-xs">
                            {plan.status === "draft" ? "مسودة" : plan.status === "active" ? "نشط" : plan.status === "completed" ? "مكتمل" : "مؤرشف"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {plan.targetSubject}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {plan.planDuration}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(plan.createdAt).toLocaleDateString("ar-TN")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedPlanId(plan.id); setViewMode("view-plan"); }}>
                          <Eye className="w-4 h-4 ml-1" /> عرض
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700"
                          onClick={() => deletePlan.mutate({ id: plan.id })}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== VIEW PLAN =====
  if (viewMode === "view-plan" && selectedPlan.data) {
    const plan = selectedPlan.data;
    const weeklyPlan = (plan.weeklyPlan as any[]) || [];
    const strategies = (plan.teachingStrategies as string[]) || [];
    const adaptations = (plan.classroomAdaptations as string[]) || [];
    const parentGuides = (plan.parentGuidelines as string[]) || [];
    const indicators = (plan.progressIndicators as string[]) || [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8" dir="rtl">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setViewMode("plans")}>
              <ArrowLeft className="w-4 h-4 ml-1" /> العودة للخطط
            </Button>
            <div className="flex gap-2">
              {plan.status === "draft" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700"
                  onClick={() => updatePlanStatus.mutate({ id: plan.id, status: "active" })}>
                  <CheckCircle2 className="w-4 h-4 ml-1" /> تفعيل الخطة
                </Button>
              )}
              {plan.status === "active" && (
                <Button size="sm" variant="outline"
                  onClick={() => updatePlanStatus.mutate({ id: plan.id, status: "completed" })}>
                  مكتمل
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Download className="w-4 h-4 ml-1" /> طباعة
              </Button>
            </div>
          </div>

          {/* Plan Header */}
          <Card className="border-0 shadow-xl mb-6">
            <div className="bg-gradient-to-l from-teal-600 to-emerald-600 text-white p-6 rounded-t-lg">
              <Badge className="bg-white/20 text-white border-white/30 mb-3">
                {plan.status === "draft" ? "مسودة" : plan.status === "active" ? "نشط" : plan.status === "completed" ? "مكتمل" : "مؤرشف"}
              </Badge>
              <h1 className="text-2xl font-bold mb-2">{plan.planTitle}</h1>
              <div className="flex flex-wrap gap-4 text-teal-100 text-sm">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {plan.targetSubject}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {plan.planDuration}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(plan.createdAt).toLocaleDateString("ar-TN")}</span>
              </div>
            </div>
          </Card>

          {/* Diagnostic Summary */}
          <Card className="border-0 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Brain className="w-5 h-5" /> الملخص التشخيصي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.diagnosticSummary}</p>
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card className="border-0 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Calendar className="w-5 h-5" /> الخطة الأسبوعية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyPlan.map((week: any, i: number) => (
                <div key={i} className="border-r-4 border-teal-500 pr-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                      {week.week}
                    </div>
                    الأسبوع {week.week}
                  </h3>

                  {/* Objectives */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Target className="w-4 h-4 text-blue-500" /> الأهداف:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {(week.objectives || []).map((obj: string, j: number) => <li key={j}>{obj}</li>)}
                    </ul>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3 mb-3">
                    {(week.activities || []).map((act: any, j: number) => (
                      <div key={j} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{act.title}</h5>
                          <Badge variant="secondary" className="text-xs">{act.duration}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{act.description}</p>
                        {act.materials?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs text-gray-500 font-medium">الوسائل:</span>
                            {act.materials.map((m: string, k: number) => (
                              <Badge key={k} variant="outline" className="text-xs">{m}</Badge>
                            ))}
                          </div>
                        )}
                        {act.adaptations?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500 font-medium">التكييفات:</span>
                            {act.adaptations.map((a: string, k: number) => (
                              <Badge key={k} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">{a}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assessment */}
                  {week.assessmentCriteria?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> معايير التقييم:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {week.assessmentCriteria.map((c: string, j: number) => <li key={j}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strategies & Adaptations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                  <Lightbulb className="w-5 h-5" /> استراتيجيات التدريس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategies.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 text-base">
                  <Shield className="w-5 h-5" /> التكييفات الصفية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {adaptations.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 text-base">
                  <Users className="w-5 h-5" /> توجيهات للأولياء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {parentGuides.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <HeartHandshake className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                  <Activity className="w-5 h-5" /> مؤشرات التقدم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {ind}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for view-plan
  if (viewMode === "view-plan" && selectedPlan.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return null;
}
