import { useState } from "react";
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
import { Building2, Briefcase, Plus, MapPin, BookOpen, GraduationCap, CheckCircle, Clock, Users, Star, Send, School } from "lucide-react";

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

export default function SchoolPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("register");

  const { data: mySchool, isLoading: loadingSchool } = trpc.schoolPortal.getMySchool.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  // Registration form state
  const [regForm, setRegForm] = useState({
    schoolName: "", schoolNameAr: "", schoolType: "private" as const,
    region: "", address: "", phone: "", email: "", website: "", description: "",
  });

  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: "", subject: "", region: "", grade: "", description: "",
    requirements: "", salaryRange: "", contractType: "full_time" as const,
  });
  const [showJobForm, setShowJobForm] = useState(false);

  const registerMutation = trpc.schoolPortal.registerSchool.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل المدرسة بنجاح! سيتم مراجعة طلبك من الإدارة.");
      utils.schoolPortal.getMySchool.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const postJobMutation = trpc.schoolPortal.postJob.useMutation({
    onSuccess: () => {
      toast.success("تم نشر عرض العمل بنجاح!");
      setShowJobForm(false);
      setJobForm({ title: "", subject: "", region: "", grade: "", description: "", requirements: "", salaryRange: "", contractType: "full_time" });
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
    });
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
            سجّل مدرستك واكتشف أفضل المعلمين المعتمدين من Leader Academy. انشر عروض العمل واحصل على مطابقة ذكية.
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

                {/* Job Posting Form */}
                {showJobForm && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-bold text-blue-800">نشر عرض عمل جديد</h4>
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
                      <div className="flex gap-3">
                        <Button className="bg-blue-700 hover:bg-blue-800" onClick={handlePostJob} disabled={postJobMutation.isPending}>
                          <Send className="w-4 h-4 ml-2" />
                          {postJobMutation.isPending ? "جاري النشر..." : "نشر العرض"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowJobForm(false)}>إلغاء</Button>
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
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              job.status === "active" ? "bg-green-100 text-green-700" :
              job.status === "closed" ? "bg-gray-100 text-gray-700" :
              "bg-yellow-100 text-yellow-700"
            }>
              {job.status === "active" ? "نشط" : job.status === "closed" ? "مغلق" : "مسودة"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {job.contractType === "full_time" ? "دوام كامل" :
               job.contractType === "part_time" ? "دوام جزئي" :
               job.contractType === "temporary" ? "مؤقت" : "حر"}
            </Badge>
          </div>
        </div>
        {job.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>}
        {job.matchedTeacherIds && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-blue-600">
            <Star className="w-4 h-4" />
            <span>{JSON.parse(job.matchedTeacherIds).length} معلم مطابق</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SmartMatchesSection({ jobs }: { jobs: any[] }) {
  const activeJobs = jobs.filter((j: any) => j.status === "active" && j.matchedTeacherIds);

  if (activeJobs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">لا توجد مطابقات ذكية بعد</p>
          <p className="text-sm mt-1">انشر عرض عمل وسيقوم النظام تلقائياً بمطابقة أفضل المعلمين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeJobs.map((job: any) => {
        const matchedIds = JSON.parse(job.matchedTeacherIds || "[]");
        return (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                مطابقات: {job.title}
              </CardTitle>
              <CardDescription>{matchedIds.length} معلم مطابق لمعايير الوظيفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <p>المعلمون المطابقون: {matchedIds.length} معلم</p>
                <p className="mt-1">
                  <a href="/showcase" className="text-blue-600 hover:underline">عرض دليل المواهب</a> لاكتشاف المزيد
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
