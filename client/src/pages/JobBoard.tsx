import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Briefcase, MapPin, Clock, Building2, Search, Filter, Send,
  CheckCircle2, Star, ArrowRight, Calendar, Users, Sparkles,
  FileText, ExternalLink, Loader2, GraduationCap, Shield,
  Award, Languages, Brain, Zap, ShieldCheck
} from "lucide-react";
import useI18n from "@/i18n";


const REGIONS = [
  "تونس", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان", "بنزرت",
  "باجة", "جندوبة", "الكاف", "سليانة", "سوسة", "المنستير", "المهدية",
  "صفاقس", "القيروان", "القصرين", "سيدي بوزيد", "قابس", "مدنين",
  "تطاوين", "قفصة", "توزر", "قبلي"
];

const CONTRACT_LABELS: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  temporary: "مؤقت",
  freelance: "حر",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  sent: { label: "مُرسل", color: "bg-blue-100 text-blue-700" },
  viewed: { label: "تم الاطلاع", color: "bg-amber-100 text-amber-700" },
  shortlisted: { label: "في القائمة المختصرة", color: "bg-purple-100 text-purple-700" },
  interviewed: { label: "تمت المقابلة", color: "bg-teal-100 text-teal-700" },
  accepted: { label: "مقبول", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700" },
};

export default function JobBoard() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [coverMessage, setCoverMessage] = useState("");

  const jobsQuery = trpc.jobBoard.listJobs.useQuery({
    subject: searchTerm || undefined,
    region: selectedRegion || undefined,
    contractType: selectedContract || undefined,
  });

  const applyMutation = trpc.jobBoard.applyForJob.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إرسال طلبك بنجاح! نسبة المطابقة: ${data.matchScore}%`);
      setApplyDialogOpen(false);
      setCoverMessage("");
      setSelectedJobId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const jobs = jobsQuery.data?.jobs || [];

  const handleApply = (jobId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedJobId(jobId);
    setApplyDialogOpen(true);
  };

  const submitApplication = () => {
    if (!selectedJobId) return;
    applyMutation.mutate({ jobId: selectedJobId, coverMessage: coverMessage || undefined });
  };

  const selectedJob = useMemo(() => jobs.find((j: any) => j.id === selectedJobId), [jobs, selectedJobId]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #1565C0 50%, #0D47A1 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 end-20 w-32 h-32 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-10 start-20 w-48 h-48 rounded-full bg-orange-300/20 blur-xl" />
        </div>
        <div className="container max-w-6xl py-12 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-orange-300" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                فرص العمل التعليمية
              </h1>
            </div>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              اكتشف فرص العمل في المدارس الشريكة وتقدّم مباشرة بملفك المهني المعتمد
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  placeholder="ابحث حسب المادة أو المنصب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pe-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
                />
              </div>
              <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v === "all" ? "" : v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="الجهة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجهات</SelectItem>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedContract} onValueChange={(v) => setSelectedContract(v === "all" ? "" : v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {Object.entries(CONTRACT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            <span className="font-bold text-slate-800">{jobs.length}</span> عرض عمل متاح
          </p>
          {user && (
            <Link href="/my-applications">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                طلباتي
              </Button>
            </Link>
          )}
        </div>

        {jobsQuery.isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!jobsQuery.isLoading && jobs.length === 0 && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">لا توجد عروض عمل حالياً</h3>
              <p className="text-slate-400">سيتم إضافة عروض جديدة قريباً. تابع الإشعارات!</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {jobs.map((job: any) => (
            <JobCard key={job.id} job={job} onApply={handleApply} user={user} />
          ))}
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Send className="w-5 h-5 text-blue-600" />
              تقديم طلب توظيف
            </DialogTitle>
            <DialogDescription>
              {selectedJob && (
                <span className="text-slate-600">
                  التقديم لمنصب: <strong>{selectedJob.title}</strong>
                  {selectedJob.school && ` في ${selectedJob.school.schoolName}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-blue-800 mb-1">سيتم إرسال رابط ملفك المهني المعتمد</p>
                  <p className="text-xs text-blue-600">ملفك المهني (Showcase) يحتوي على شهاداتك، تقييماتك، ومهاراتك المعتمدة من المنصة</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رسالة تقديم (اختياري)</label>
              <Textarea
                placeholder="اكتب رسالة قصيرة تعرّف فيها بنفسك وتشرح لماذا أنت مناسب لهذا المنصب..."
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={submitApplication}
              disabled={applyMutation.isPending}
              className="gap-2"
              style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}
            >
              {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobCard({ job, onApply, user }: { job: any; onApply: (id: number) => void; user: any }) {
  const hasAppliedQuery = user ? trpc.jobBoard.hasApplied.useQuery({ jobId: job.id }) : null;
  const hasApplied = hasAppliedQuery?.data?.applied || false;
  const application = hasAppliedQuery?.data?.application;

  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const isNew = daysAgo <= 3;
  const deadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-300 border-slate-100 group">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* School Logo / Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              {job.school?.logoUrl ? (
                <img src={job.school.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <Building2 className="w-7 h-7 text-blue-600" />
              )}
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                  {isNew && <Badge className="bg-orange-100 text-orange-700 text-[10px]">جديد</Badge>}
                  {job.school?.isVerified && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-[10px] gap-1">
                      <Shield className="w-3 h-3" /> معتمدة
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">{job.school?.schoolName || "مدرسة شريكة"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
                <GraduationCap className="w-3 h-3" /> {job.subject}
              </Badge>
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
                <MapPin className="w-3 h-3" /> {job.region}
              </Badge>
              <Badge variant="outline" className="gap-1 text-teal-600 border-teal-200">
                <Clock className="w-3 h-3" /> {CONTRACT_LABELS[job.contractType] || job.contractType}
              </Badge>
              {job.grade && (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  {job.grade}
                </Badge>
              )}
              {job.salaryRange && (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  {job.salaryRange}
                </Badge>
              )}
              {job.minExperience > 0 && (
                <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200">
                  <Award className="w-3 h-3" /> {job.minExperience}+ سنة خبرة
                </Badge>
              )}
              {job.requiresCertification && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                  <ShieldCheck className="w-3 h-3" /> شهادات مطلوبة
                </Badge>
              )}
              {job.urgencyLevel && job.urgencyLevel !== "normal" && (
                <Badge className={job.urgencyLevel === "immediate" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                  <Zap className="w-3 h-3 ms-1" />
                  {job.urgencyLevel === "immediate" ? "فوري" : "مستعجل"}
                </Badge>
              )}
            </div>

            {job.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
            )}

            {/* Skills, Languages, Methodologies */}
            <div className="flex flex-wrap gap-1 mb-3">
              {job.requiredSkills && job.requiredSkills.length > 0 && job.requiredSkills.slice(0, 4).map((skill: string, i: number) => (
                <span key={`s-${i}`} className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">{skill}</span>
              ))}
              {job.requiredLanguages && job.requiredLanguages.length > 0 && job.requiredLanguages.map((lang: string, i: number) => (
                <span key={`l-${i}`} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">{lang}</span>
              ))}
              {job.preferredMethodologies && job.preferredMethodologies.length > 0 && job.preferredMethodologies.slice(0, 3).map((m: string, i: number) => (
                <span key={`m-${i}`} className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">{m}</span>
              ))}
              {((job.requiredSkills?.length || 0) + (job.requiredLanguages?.length || 0) + (job.preferredMethodologies?.length || 0)) > 9 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">+المزيد</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysAgo === 0 ? "اليوم" : daysAgo === 1 ? "أمس" : `منذ ${daysAgo} يوم`}
                </span>
                {job.applicationDeadline && (
                  <span className={`flex items-center gap-1 ${deadlinePassed ? "text-red-400" : ""}`}>
                    <Clock className="w-3 h-3" />
                    آخر أجل: {new Date(job.applicationDeadline).toLocaleDateString("ar-TN")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasApplied ? (
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_LABELS[application?.status || "sent"]?.color || "bg-blue-100 text-blue-700"}>
                      <CheckCircle2 className="w-3 h-3 ms-1" />
                      {STATUS_LABELS[application?.status || "sent"]?.label || "مُرسل"}
                    </Badge>
                    {application?.matchScore != null && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 gap-1">
                        <Star className="w-3 h-3" /> {application.matchScore}%
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => onApply(job.id)}
                    disabled={deadlinePassed}
                    size="sm"
                    className="gap-2"
                    style={{ background: deadlinePassed ? undefined : "linear-gradient(135deg, #1A237E, #1565C0)" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {deadlinePassed ? "انتهى الأجل" : "تقدّم الآن"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
