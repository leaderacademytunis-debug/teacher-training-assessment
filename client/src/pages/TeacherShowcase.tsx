import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  FileText, GraduationCap, Image, Award, BarChart3, ScanLine,
  MessageSquare, BookOpen, Loader2, User, School, MapPin,
  Briefcase, TrendingUp, ShieldCheck, Star, Send, CheckCircle2,
  Sparkles, Globe, Mail, Phone, Building2, UserCheck, Lock, Download,
} from "lucide-react";

// Radar Chart Component
function RadarChart({ data, size = 280 }: { data: Record<string, number>; size?: number }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  if (labels.length < 3) return null;
  const maxVal = Math.max(...values, 1);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 45;
  const angleStep = (2 * Math.PI) / labels.length;
  const levels = [0.25, 0.5, 0.75, 1];
  const gridPaths = levels.map((level) => {
    const points = labels.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + radius * level * Math.cos(angle)},${cy + radius * level * Math.sin(angle)}`;
    });
    return points.join(" ");
  });
  const dataPoints = values.map((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / maxVal) * radius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });
  const labelPositions = labels.map((label, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return { label, x: cx + (radius + 28) * Math.cos(angle), y: cy + (radius + 28) * Math.sin(angle) };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {gridPaths.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {labels.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      <polygon points={dataPoints.join(" ")} fill="rgba(217,119,6,0.15)" stroke="#d97706" strokeWidth="2.5" />
      {values.map((val, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (val / maxVal) * radius;
        return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="4" fill="#d97706" stroke="#fff" strokeWidth="1.5" />;
      })}
      {labelPositions.map((lp, i) => (
        <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-gray-600" fontFamily="Cairo, sans-serif">
          {lp.label.length > 14 ? lp.label.slice(0, 14) + "…" : lp.label}
        </text>
      ))}
    </svg>
  );
}

// Stat Card
function StatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: typeof FileText; label: string; value: number; color: string; bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center transition-transform hover:scale-105`}>
      <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// Level Badge
function LevelBadge({ level, totalScore }: { level: string; totalScore: number }) {
  const colors: Record<string, string> = {
    "خبير متميز": "from-amber-500 to-yellow-400 text-white",
    "خبير": "from-blue-600 to-indigo-500 text-white",
    "متقدم": "from-emerald-500 to-green-400 text-white",
    "متوسط": "from-cyan-500 to-blue-400 text-white",
    "مبتدئ": "from-gray-400 to-gray-300 text-gray-800",
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-l ${colors[level] || colors["مبتدئ"]} shadow-lg`}>
      <Star className="w-4 h-4" />
      <span className="font-bold text-sm">{level}</span>
      <span className="text-xs opacity-80">({totalScore} نقطة)</span>
    </div>
  );
}

// Connection Request Form
function HireMeDialog({ teacherSlug, teacherName }: { teacherSlug: string; teacherName: string }) {
  // using sonner toast directly
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requesterOrganization: "",
    requesterRole: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.careerHub.submitConnectionRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم إرسال الطلب بنجاح");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      teacherSlug,
      ...form,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-xl gap-2 text-base px-8 py-6 rounded-xl">
          <Send className="w-5 h-5" />
          تواصل للتوظيف
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            طلب تواصل مع {teacherName}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            أرسل طلب اتصال. سيتم إخفاء معلومات الاتصال الشخصية حتى يوافق المعلم.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl font-bold text-gray-900">تم إرسال طلبك بنجاح</h3>
            <p className="text-gray-600">سيتم إعلام المعلم وإدارة Leader Academy. ستتلقى رداً قريباً.</p>
            <div className="flex items-center gap-2 justify-center text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <Lock className="w-4 h-4" />
              <span>معلومات الاتصال محمية حتى الموافقة</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الاسم الكامل *</Label>
                <Input required value={form.requesterName} onChange={e => setForm(f => ({ ...f, requesterName: e.target.value }))} placeholder="أحمد بن محمد" />
              </div>
              <div>
                <Label>البريد الإلكتروني *</Label>
                <Input required type="email" value={form.requesterEmail} onChange={e => setForm(f => ({ ...f, requesterEmail: e.target.value }))} placeholder="email@school.tn" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>رقم الهاتف</Label>
                <Input value={form.requesterPhone} onChange={e => setForm(f => ({ ...f, requesterPhone: e.target.value }))} placeholder="+216 XX XXX XXX" />
              </div>
              <div>
                <Label>المؤسسة / المدرسة</Label>
                <Input value={form.requesterOrganization} onChange={e => setForm(f => ({ ...f, requesterOrganization: e.target.value }))} placeholder="المدرسة الخاصة..." />
              </div>
            </div>
            <div>
              <Label>الصفة الوظيفية</Label>
              <Input value={form.requesterRole} onChange={e => setForm(f => ({ ...f, requesterRole: e.target.value }))} placeholder="مدير مدرسة، مسؤول توظيف..." />
            </div>
            <div>
              <Label>رسالة التواصل *</Label>
              <Textarea required minLength={10} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="نحن مهتمون بملفكم المهني ونود التواصل معكم بخصوص فرصة تعليمية..." rows={4} />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>لن يتم الكشف عن معلومات الاتصال الشخصية للمعلم إلا بعد موافقته على طلبك</span>
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 gap-2" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إرسال طلب التواصل
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Item type labels
const itemTypeLabels: Record<string, string> = {
  lesson_plan: "جذاذة درس",
  exam: "اختبار",
  drama_script: "سيناريو مسرحي",
  digitized_doc: "وثيقة مرقمنة",
  marketplace_item: "مورد منشور",
};

export default function TeacherShowcase() {
  const [, params] = useRoute("/showcase/:slug");
  const slug = params?.slug || "";

  const { data: showcase, isLoading, error } = trpc.careerHub.getShowcase.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const subjectBreakdown = useMemo(() => showcase?.subjectExpertise || {}, [showcase?.subjectExpertise]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
          <p className="text-gray-500 font-medium">جاري تحميل الملف المهني...</p>
        </div>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/20 p-4" dir="rtl">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="pt-8 text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">الملف المهني غير متاح</h2>
            <p className="text-gray-600">هذا الملف المهني غير موجود أو غير عام حالياً.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const educationLevelLabel = showcase.educationLevel === "primary" ? "ابتدائي" : showcase.educationLevel === "middle" ? "إعدادي" : showcase.educationLevel === "secondary" ? "ثانوي" : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/10 to-blue-50/10" dir="rtl">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container max-w-5xl py-12 px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">Leader Academy Career Hub</span>
            </div>
            {showcase.isVerified && (
              <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-400/30">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-200">معلم معتمد</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {(showcase.displayName || "م")?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{showcase.displayName}</h1>
                {showcase.isVerified && (
                  <div className="relative group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      شهادة Leader Academy معتمدة
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-300">
                {showcase.schoolName && (
                  <div className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">{showcase.schoolName}</span>
                  </div>
                )}
                {showcase.region && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">{showcase.region}</span>
                  </div>
                )}
                {showcase.yearsOfExperience && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">{showcase.yearsOfExperience} سنة خبرة</span>
                  </div>
                )}
                {educationLevelLabel && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-0">{educationLevelLabel}</Badge>
                )}
              </div>
              {showcase.specializations && (showcase.specializations as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(showcase.specializations as string[]).map((s: string, i: number) => (
                    <Badge key={i} className="bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Level + Hire Me */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
            <LevelBadge level={showcase.level} totalScore={showcase.totalScore} />
            <div className="flex-1" />
            <HireMeDialog teacherSlug={slug} teacherName={showcase.displayName} />
            <DownloadCVButton slug={slug} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl py-8 px-4 space-y-8">
        {/* Bio */}
        {showcase.bio && (
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-amber-600" />
                نبذة مهنية
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">{showcase.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            الإنجازات الرقمية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="جذاذة" value={showcase.stats.totalLessonPlans} color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={GraduationCap} label="اختبار" value={showcase.stats.totalExams} color="text-purple-600" bgColor="bg-purple-50" />
            <StatCard icon={Image} label="صورة تعليمية" value={showcase.stats.totalImages} color="text-green-600" bgColor="bg-green-50" />
            <StatCard icon={Award} label="شهادة" value={showcase.stats.totalCertificates} color="text-amber-600" bgColor="bg-amber-50" />
            <StatCard icon={BarChart3} label="تقييم" value={showcase.stats.totalEvaluations} color="text-orange-600" bgColor="bg-orange-50" />
            <StatCard icon={ScanLine} label="وثيقة مرقمنة" value={showcase.stats.totalDigitizedDocs} color="text-teal-600" bgColor="bg-teal-50" />
            <StatCard icon={MessageSquare} label="محادثة ذكية" value={showcase.stats.totalConversations} color="text-indigo-600" bgColor="bg-indigo-50" />
            <StatCard icon={BookOpen} label="مادة" value={Object.keys(subjectBreakdown).length} color="text-rose-600" bgColor="bg-rose-50" />
          </div>
        </div>

        {/* Skills Radar + Level */}
        {Object.keys(subjectBreakdown).length >= 3 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  رادار الكفاءات
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <RadarChart data={subjectBreakdown} />
              </CardContent>
            </Card>
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  التخصصات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(subjectBreakdown).sort(([, a], [, b]) => (b as number) - (a as number)).map(([subject, val]) => {
                  const maxVal = Math.max(...Object.values(subjectBreakdown) as number[], 1);
                  const pct = Math.round(((val as number) / maxVal) * 100);
                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{subject}</span>
                        <span className="text-gray-500">{val as number} نقطة</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-l from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Golden Samples */}
        {showcase.goldenSamples && showcase.goldenSamples.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              العينات الذهبية
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcase.goldenSamples.map((sample: any, i: number) => (
                <Card key={i} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        {sample.itemType === "lesson_plan" ? <FileText className="w-5 h-5 text-amber-600" /> :
                         sample.itemType === "exam" ? <GraduationCap className="w-5 h-5 text-purple-600" /> :
                         sample.itemType === "drama_script" ? <MessageSquare className="w-5 h-5 text-indigo-600" /> :
                         <BookOpen className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{sample.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{itemTypeLabels[sample.itemType] || sample.itemType}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sample.subject && <Badge variant="outline" className="text-[10px] py-0">{sample.subject}</Badge>}
                          {sample.grade && <Badge variant="outline" className="text-[10px] py-0">{sample.grade}</Badge>}
                          {sample.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-[10px]">{Number(sample.rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-700 text-sm">درع الخصوصية</h4>
              <p className="text-xs text-slate-500 mt-1">
                معلومات الاتصال الشخصية (الهاتف، البريد الإلكتروني) محمية ولن يتم الكشف عنها إلا بعد موافقة المعلم على طلب التواصل.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <HireMeDialog teacherSlug={slug} teacherName={showcase.displayName} />
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-200">
          <p className="text-sm text-gray-400">
            تم إنشاء هذا الملف المهني بواسطة <span className="font-bold text-amber-600">Leader Academy</span> — مركز التوظيف المهني
          </p>
        </div>
      </div>
    </div>
  );
}

// Download Digital CV Button
function DownloadCVButton({ slug }: { slug: string }) {
  const [generating, setGenerating] = useState(false);
  const generateCV = trpc.careerHub.generateDigitalCV.useMutation({
    onSuccess: (data) => {
      // Create a downloadable HTML file
      const blob = new Blob([String(data.html)], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.displayName || "teacher"}-cv.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تحميل السيرة الذاتية الرقمية بنجاح");
      setGenerating(false);
    },
    onError: (err) => {
      toast.error(err.message || "خطأ في توليد السيرة الذاتية");
      setGenerating(false);
    },
  });

  const handleDownload = () => {
    setGenerating(true);
    generateCV.mutate({ slug });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2 text-base px-6 py-6 rounded-xl backdrop-blur-sm"
      onClick={handleDownload}
      disabled={generating}
    >
      {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      {generating ? "جاري التوليد..." : "تحميل السيرة الذاتية"}
    </Button>
  );
}
