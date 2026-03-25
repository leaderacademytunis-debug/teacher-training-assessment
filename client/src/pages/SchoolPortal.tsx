import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Briefcase, Plus, MapPin, BookOpen, GraduationCap, CheckCircle, Clock, Users, Star, Send, School, ChevronDown, ChevronUp, Award, Globe, Brain, Zap, TrendingUp, ShieldCheck, Eye, Languages, Target } from "lucide-react";

const REGIONS = [
  "تونس العاصمة", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان", "بنزرت",
  "باجة", "جندوبة", "الكاف", "سليانة", "القيروان", "القصرين", "سيدي بوزيد",
  "سوسة", "المنستير", "المهدية", "صفاقس", "قفصة", "توزر", "قبلي",
  "قابس", "مدنين", "تطاوين",
];

const SUBJECTS = [
  "رياضيات", "علوم", "عربية", "فرنسية", "إنجليزية", "تاريخ", "جغرافيا",
  "تربية إسلامية", "تربية مدنية", "إيقاظ علمي", "تربية تكنولوجية",
  "تربية فنية", "تربية بدنية", "إعلامية",
];

const LANGUAGES = ["العربية", "الفرنسية", "الإنجليزية", "الإيطالية", "الألمانية", "الإسبانية"];

const METHODOLOGIES = [
  "التعلم النشط", "المقاربة بالكفايات", "التعلم التعاوني", "التعليم المتمايز",
  "التعلم بالمشاريع", "التعلم الرقمي", "بيداغوجيا الخطأ", "التعلم باللعب",
  "المقاربة التواصلية", "التعلم الذاتي",
];

const SKILLS = [
  "تكنولوجيا التعليم", "التربية الخاصة", "التقييم التكويني", "إدارة الصف",
  "التخطيط البيداغوجي", "الذكاء الاصطناعي في التعليم", "التعليم عن بعد",
  "إنتاج الموارد الرقمية", "التنشيط البيداغوجي", "الدعم المدرسي",
];

interface JobFormState {
  title: string;
  subject: string;
  region: string;
  grade: string;
  description: string;
  requirements: string;
  salaryRange: string;
  contractType: "full_time" | "part_time" | "temporary" | "freelance";
  minExperience: number;
  maxExperience: number | null;
  requiredSkills: string[];
  requiredLanguages: string[];
  preferredMethodologies: string[];
  requiresCertification: boolean;
  urgencyLevel: "normal" | "urgent" | "immediate";
}

const INITIAL_JOB_FORM: JobFormState = {
  title: "", subject: "", region: "", grade: "", description: "",
  requirements: "", salaryRange: "", contractType: "full_time",
  minExperience: 0, maxExperience: null,
  requiredSkills: [], requiredLanguages: [], preferredMethodologies: [],
  requiresCertification: false, urgencyLevel: "normal",
};

export default function SchoolPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("register");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: mySchool, isLoading: loadingSchool } = trpc.schoolPortal.getMySchool.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  const [regForm, setRegForm] = useState({
    schoolName: "", schoolNameAr: "", schoolType: "private" as const,
    region: "", address: "", phone: "", email: "", website: "", description: "",
  });

  const [jobForm, setJobForm] = useState<JobFormState>({ ...INITIAL_JOB_FORM });
  const [showJobForm, setShowJobForm] = useState(false);

  const registerMutation = trpc.schoolPortal.registerSchool.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل المدرسة بنجاح! سيتم مراجعة طلبك من الإدارة.");
      utils.schoolPortal.getMySchool.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const postJobMutation = trpc.schoolPortal.postJob.useMutation({
    onSuccess: (data: any) => {
      toast.success(`تم نشر عرض العمل بنجاح! تم مطابقة ${data.matchedCount || 0} معلم.`);
      setShowJobForm(false);
      setJobForm({ ...INITIAL_JOB_FORM });
      setShowAdvanced(false);
      utils.schoolPortal.getMyJobs.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: myJobs } = trpc.schoolPortal.getMyJobs.useQuery(undefined, { enabled: !!mySchool });

  const handleRegister = () => {
    if (!regForm.schoolName || !regForm.region) {
      toast.error("يرجى ملء اسم المدرسة والمنطقة على الأقل");
      return;
    }
    registerMutation.mutate(regForm);
  };

  const handlePostJob = () => {
    if (!jobForm.title || !jobForm.subject || !jobForm.region) {
      toast.error("يرجى ملء عنوان الوظيفة والمادة والمنطقة");
      return;
    }
    postJobMutation.mutate({
      ...jobForm,
      grade: jobForm.grade || undefined,
      requirements: jobForm.requirements || undefined,
      salaryRange: jobForm.salaryRange || undefined,
      requiredSkills: jobForm.requiredSkills.length > 0 ? jobForm.requiredSkills : undefined,
      requiredLanguages: jobForm.requiredLanguages.length > 0 ? jobForm.requiredLanguages : undefined,
      preferredMethodologies: jobForm.preferredMethodologies.length > 0 ? jobForm.preferredMethodologies : undefined,
      maxExperience: jobForm.maxExperience ?? undefined,
    });
  };

  const toggleArrayItem = (field: "requiredSkills" | "requiredLanguages" | "preferredMethodologies", item: string) => {
    setJobForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item],
    }));
  };

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <School className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">بوابة المدارس الشريكة</h2>
            <p className="text-gray-500 mb-6">سجل دخولك للوصول إلى بوابة المدارس الشريكة</p>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => window.location.href = "/api/oauth/login"}>
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-l from-indigo-900 via-blue-800 to-blue-700 text-white py-12 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-9 h-9 text-orange-400" />
            <h1 className="text-3xl font-bold">بوابة المدارس الشريكة</h1>
          </div>
          <p className="text-blue-200 text-lg max-w-2xl">
            سجّل مدرستك واكتشف أفضل المعلمين المعتمدين من Leader Academy. انشر عروض العمل واحصل على مطابقة ذكية متعددة المعايير.
          </p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {loadingSchool ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">جاري التحميل...</p>
          </div>
        ) : !mySchool ? (
          /* Registration Form */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                تسجيل مدرسة جديدة
              </CardTitle>
              <CardDescription>سجّل مدرستك للوصول إلى دليل المواهب ونشر عروض العمل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">اسم المدرسة (فرنسية/إنجليزية) *</label>
                  <Input value={regForm.schoolName} onChange={e => setRegForm(p => ({...p, schoolName: e.target.value}))} placeholder="School Name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">اسم المدرسة (عربية)</label>
                  <Input value={regForm.schoolNameAr} onChange={e => setRegForm(p => ({...p, schoolNameAr: e.target.value}))} placeholder="اسم المدرسة" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نوع المدرسة *</label>
                  <Select value={regForm.schoolType} onValueChange={v => setRegForm(p => ({...p, schoolType: v as any}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">خاصة</SelectItem>
                      <SelectItem value="public">عمومية</SelectItem>
                      <SelectItem value="international">دولية</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">المنطقة *</label>
                  <Select value={regForm.region} onValueChange={v => setRegForm(p => ({...p, region: v}))}>
                    <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">العنوان</label>
                <Input value={regForm.address} onChange={e => setRegForm(p => ({...p, address: e.target.value}))} placeholder="العنوان الكامل" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">الهاتف</label>
                  <Input value={regForm.phone} onChange={e => setRegForm(p => ({...p, phone: e.target.value}))} placeholder="+216 XX XXX XXX" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                  <Input type="email" value={regForm.email} onChange={e => setRegForm(p => ({...p, email: e.target.value}))} placeholder="school@example.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الموقع الإلكتروني</label>
                <Input value={regForm.website} onChange={e => setRegForm(p => ({...p, website: e.target.value}))} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">وصف المدرسة</label>
                <Textarea value={regForm.description} onChange={e => setRegForm(p => ({...p, description: e.target.value}))} placeholder="نبذة عن المدرسة ورؤيتها..." rows={3} />
              </div>
              <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleRegister} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "جاري التسجيل..." : "تسجيل المدرسة"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* School Dashboard */
          <div className="space-y-6">
            {/* School Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {mySchool.schoolNameAr || mySchool.schoolName}
                        {mySchool.isVerified ? (
                          <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 ml-1" /> موثقة</Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 ml-1" /> قيد المراجعة</Badge>
                        )}
                      </h2>
                      <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {mySchool.region}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs" className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> عروض العمل</TabsTrigger>
                <TabsTrigger value="matches" className="flex items-center gap-2"><Users className="w-4 h-4" /> المطابقات الذكية</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">عروض العمل المنشورة</h3>
                  <Button onClick={() => setShowJobForm(!showJobForm)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="w-4 h-4 ml-2" /> نشر عرض عمل
                  </Button>
                </div>

                {/* Enhanced Job Posting Form */}
                {showJobForm && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <h4 className="font-bold text-blue-800 text-lg">نشر عرض عمل جديد</h4>
                        <Badge className="bg-orange-100 text-orange-700 text-xs">مطابقة ذكية v2</Badge>
                      </div>

                      {/* Basic Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">عنوان الوظيفة *</label>
                          <Input value={jobForm.title} onChange={e => setJobForm(p => ({...p, title: e.target.value}))} placeholder="مثال: معلم رياضيات - ابتدائي" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">المادة *</label>
                          <Select value={jobForm.subject} onValueChange={v => setJobForm(p => ({...p, subject: v}))}>
                            <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">المنطقة *</label>
                          <Select value={jobForm.region} onValueChange={v => setJobForm(p => ({...p, region: v}))}>
                            <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                            <SelectContent>
                              {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">المستوى</label>
                          <Select value={jobForm.grade} onValueChange={v => setJobForm(p => ({...p, grade: v}))}>
                            <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">ابتدائي</SelectItem>
                              <SelectItem value="middle">إعدادي</SelectItem>
                              <SelectItem value="secondary">ثانوي</SelectItem>
                              <SelectItem value="preschool">تحضيري</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">نوع العقد</label>
                          <Select value={jobForm.contractType} onValueChange={v => setJobForm(p => ({...p, contractType: v as any}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_time">دوام كامل</SelectItem>
                              <SelectItem value="part_time">دوام جزئي</SelectItem>
                              <SelectItem value="temporary">مؤقت</SelectItem>
                              <SelectItem value="freelance">حر</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">وصف الوظيفة</label>
                        <Textarea value={jobForm.description} onChange={e => setJobForm(p => ({...p, description: e.target.value}))} placeholder="وصف المهام والمسؤوليات..." rows={3} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">المتطلبات</label>
                          <Input value={jobForm.requirements} onChange={e => setJobForm(p => ({...p, requirements: e.target.value}))} placeholder="الخبرة، الشهادات..." />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">نطاق الراتب</label>
                          <Input value={jobForm.salaryRange} onChange={e => setJobForm(p => ({...p, salaryRange: e.target.value}))} placeholder="مثال: 1500-2000 د.ت" />
                        </div>
                      </div>

                      {/* Advanced Matching Criteria Toggle */}
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors w-full justify-center py-2 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
                      >
                        <Brain className="w-4 h-4" />
                        {showAdvanced ? "إخفاء معايير المطابقة المتقدمة" : "عرض معايير المطابقة المتقدمة (10 معايير)"}
                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showAdvanced && (
                        <div className="space-y-4 p-4 bg-white rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-500 mb-3">كلما أضفت معايير أكثر، كانت المطابقة أدق وأفضل</p>

                          {/* Experience Range */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-blue-600" /> الحد الأدنى للخبرة (سنوات)
                              </label>
                              <Input type="number" min={0} value={jobForm.minExperience} onChange={e => setJobForm(p => ({...p, minExperience: parseInt(e.target.value) || 0}))} />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-blue-600" /> الحد الأقصى للخبرة (سنوات)
                              </label>
                              <Input type="number" min={0} value={jobForm.maxExperience ?? ""} onChange={e => setJobForm(p => ({...p, maxExperience: e.target.value ? parseInt(e.target.value) : null}))} placeholder="بدون حد" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-red-500" /> مستوى الاستعجال
                              </label>
                              <Select value={jobForm.urgencyLevel} onValueChange={v => setJobForm(p => ({...p, urgencyLevel: v as any}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">عادي</SelectItem>
                                  <SelectItem value="urgent">مستعجل</SelectItem>
                                  <SelectItem value="immediate">فوري</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Certification requirement */}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={jobForm.requiresCertification}
                              onChange={e => setJobForm(p => ({...p, requiresCertification: e.target.checked}))}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label className="text-sm font-medium flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                              يتطلب شهادات معتمدة من المنصة
                            </label>
                          </div>

                          {/* Required Languages */}
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Languages className="w-3.5 h-3.5 text-purple-600" /> اللغات المطلوبة
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {LANGUAGES.map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => toggleArrayItem("requiredLanguages", lang)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    jobForm.requiredLanguages.includes(lang)
                                      ? "bg-purple-100 text-purple-700 border-purple-300"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-200"
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Required Skills */}
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Target className="w-3.5 h-3.5 text-orange-600" /> المهارات المطلوبة
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {SKILLS.map(skill => (
                                <button
                                  key={skill}
                                  onClick={() => toggleArrayItem("requiredSkills", skill)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    jobForm.requiredSkills.includes(skill)
                                      ? "bg-orange-100 text-orange-700 border-orange-300"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
                                  }`}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Preferred Methodologies */}
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Brain className="w-3.5 h-3.5 text-teal-600" /> المنهجيات البيداغوجية المفضلة
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {METHODOLOGIES.map(meth => (
                                <button
                                  key={meth}
                                  onClick={() => toggleArrayItem("preferredMethodologies", meth)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    jobForm.preferredMethodologies.includes(meth)
                                      ? "bg-teal-100 text-teal-700 border-teal-300"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-200"
                                  }`}
                                >
                                  {meth}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button className="bg-blue-700 hover:bg-blue-800" onClick={handlePostJob} disabled={postJobMutation.isPending}>
                          <Send className="w-4 h-4 ml-2" />
                          {postJobMutation.isPending ? "جاري النشر والمطابقة..." : "نشر العرض وتفعيل المطابقة الذكية"}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowJobForm(false); setShowAdvanced(false); }}>إلغاء</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Job Listings */}
                {myJobs && myJobs.length > 0 ? (
                  <div className="space-y-3">
                    {myJobs.map((job: any) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">لم تنشر أي عروض عمل بعد</p>
                      <p className="text-sm mt-1">انشر أول عرض عمل لاكتشاف المعلمين المناسبين</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="matches" className="mt-4">
                <SmartMatchesSection jobs={myJobs || []} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  const urgencyLabels: Record<string, { text: string; color: string }> = {
    normal: { text: "عادي", color: "bg-gray-100 text-gray-600" },
    urgent: { text: "مستعجل", color: "bg-yellow-100 text-yellow-700" },
    immediate: { text: "فوري", color: "bg-red-100 text-red-700" },
  };
  const urgency = urgencyLabels[job.urgencyLevel] || urgencyLabels.normal;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-lg">{job.title}</h4>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {job.subject}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.region}</span>
              {job.grade && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {job.grade}</span>}
              {job.minExperience > 0 && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {job.minExperience}+ سنة خبرة</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={job.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
              {job.isActive ? "نشط" : "مغلق"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {job.contractType === "full_time" ? "دوام كامل" :
               job.contractType === "part_time" ? "دوام جزئي" :
               job.contractType === "temporary" ? "مؤقت" : "حر"}
            </Badge>
            {job.urgencyLevel && job.urgencyLevel !== "normal" && (
              <Badge className={`text-xs ${urgency.color}`}>{urgency.text}</Badge>
            )}
          </div>
        </div>
        {job.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>}
        {/* Skills & Languages tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.requiredSkills && JSON.parse(typeof job.requiredSkills === 'string' ? job.requiredSkills : JSON.stringify(job.requiredSkills)).map((s: string) => (
            <Badge key={s} variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">{s}</Badge>
          ))}
          {job.requiredLanguages && JSON.parse(typeof job.requiredLanguages === 'string' ? job.requiredLanguages : JSON.stringify(job.requiredLanguages)).map((l: string) => (
            <Badge key={l} variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">{l}</Badge>
          ))}
        </div>
        {job.matchedTeacherIds && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-blue-600">
            <Star className="w-4 h-4" />
            <span>{(typeof job.matchedTeacherIds === 'string' ? JSON.parse(job.matchedTeacherIds) : job.matchedTeacherIds).length} معلم مطابق</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SmartMatchesSection({ jobs }: { jobs: any[] }) {
  const activeJobs = jobs.filter((j: any) => j.isActive && j.matchedTeacherIds);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const firstJobId = useMemo(() => activeJobs[0]?.id || null, [activeJobs]);
  const currentJobId = selectedJobId || firstJobId;

  const { data: matches, isLoading } = trpc.schoolPortal.getSmartMatch.useQuery(
    { jobId: currentJobId! },
    { enabled: !!currentJobId }
  );

  if (activeJobs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">لا توجد مطابقات ذكية بعد</p>
          <p className="text-sm mt-1">انشر عرض عمل وسيقوم النظام تلقائياً بمطابقة أفضل المعلمين عبر 10 معايير</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">اختر الوظيفة:</span>
        {activeJobs.map((job: any) => (
          <button
            key={job.id}
            onClick={() => setSelectedJobId(job.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              currentJobId === job.id
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
            }`}
          >
            {job.title}
          </button>
        ))}
      </div>

      {/* Match Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-3">جاري تحليل المطابقات...</p>
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>{matches.length} معلم مطابق - مرتبون حسب نسبة التطابق</span>
          </div>
          {matches.map((match: any, idx: number) => (
            <MatchCard key={match.userId} match={match} rank={idx + 1} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-gray-500">
            <p>لا توجد مطابقات لهذه الوظيفة بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MatchCard({ match, rank }: { match: any; rank: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const scoreColor = match.matchScore >= 80 ? "text-green-600" : match.matchScore >= 60 ? "text-blue-600" : match.matchScore >= 40 ? "text-yellow-600" : "text-gray-500";
  const scoreBg = match.matchScore >= 80 ? "bg-green-50 border-green-200" : match.matchScore >= 60 ? "bg-blue-50 border-blue-200" : match.matchScore >= 40 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200";
  const availLabels: Record<string, { text: string; color: string }> = {
    available: { text: "متاح", color: "bg-green-100 text-green-700" },
    open_to_offers: { text: "منفتح على العروض", color: "bg-blue-100 text-blue-700" },
    not_available: { text: "غير متاح", color: "bg-gray-100 text-gray-500" },
  };
  const avail = availLabels[match.availabilityStatus] || availLabels.open_to_offers;

  return (
    <Card className={`border ${scoreBg} transition-all hover:shadow-md`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              rank === 1 ? "bg-yellow-400 text-white" : rank === 2 ? "bg-gray-300 text-white" : rank === 3 ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {rank}
            </div>
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                {match.displayName}
                {match.isVerified && <ShieldCheck className="w-4 h-4 text-green-600" />}
              </h4>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-0.5">
                {match.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.region}</span>}
                {match.yearsOfExperience > 0 && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {match.yearsOfExperience} سنة</span>}
                {match.schoolName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {match.schoolName}</span>}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${scoreColor}`}>{match.matchScore}%</div>
            <div className="text-xs text-gray-500">نسبة التطابق</div>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge className={`text-xs ${avail.color}`}>{avail.text}</Badge>
          {match.specializations?.slice(0, 3).map((s: string) => (
            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
          ))}
          {match.languages?.slice(0, 2).map((l: string) => (
            <Badge key={l} variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">{l}</Badge>
          ))}
        </div>

        {/* Strength & Improvement Areas */}
        {(match.strengthAreas?.length > 0 || match.improvementAreas?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {match.strengthAreas?.map((area: string) => (
              <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                + {area}
              </span>
            ))}
            {match.improvementAreas?.map((area: string) => (
              <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                - {area}
              </span>
            ))}
          </div>
        )}

        {/* Expand Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {showDetails ? "إخفاء التفاصيل" : "عرض تفصيل المطابقة (10 معايير)"}
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetails && match.matchBreakdown && (
          <div className="mt-3 p-4 bg-white rounded-lg border space-y-2">
            <h5 className="font-bold text-sm text-gray-700 mb-3">تفصيل المطابقة حسب المعايير</h5>
            {Object.entries(match.matchBreakdown).map(([key, val]: [string, any]) => {
              const criteriaLabels: Record<string, { label: string; icon: string }> = {
                subject: { label: "المادة الدراسية", icon: "📚" },
                region: { label: "المنطقة الجغرافية", icon: "📍" },
                educationLevel: { label: "المستوى التعليمي", icon: "🎓" },
                experience: { label: "سنوات الخبرة", icon: "⭐" },
                skills: { label: "المهارات", icon: "🎯" },
                certifications: { label: "الشهادات", icon: "🏆" },
                platformActivity: { label: "النشاط على المنصة", icon: "📊" },
                availability: { label: "التوفر", icon: "✅" },
                languages: { label: "اللغات", icon: "🌍" },
                methodologies: { label: "المنهجيات", icon: "🧠" },
              };
              const info = criteriaLabels[key] || { label: key, icon: "📌" };
              const pct = val.max > 0 ? Math.round((val.score / val.max) * 100) : 0;
              const barColor = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : pct >= 25 ? "bg-yellow-500" : "bg-gray-300";

              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm w-5">{info.icon}</span>
                  <span className="text-xs font-medium text-gray-600 w-28 shrink-0">{info.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold w-14 text-left" dir="ltr">{val.score}/{val.max}</span>
                  <span className="text-xs text-gray-400 w-24 truncate" title={val.details}>{val.details}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          {match.slug && (
            <a href={`/portfolio/${match.slug}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs">
                <Eye className="w-3 h-3 ml-1" /> عرض الملف المهني
              </Button>
            </a>
          )}
          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("ميزة المراسلة قادمة قريباً")}>
            <Send className="w-3 h-3 ml-1" /> مراسلة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
