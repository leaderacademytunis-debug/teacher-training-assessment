import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  FileText, GraduationCap, Image, Award, BarChart3, ScanLine,
  MessageSquare, Download, Share2, Edit3, Globe, Lock,
  ArrowRight, Loader2, Copy, Check, User, Briefcase,
  MapPin, School, ChevronLeft, BookOpen, TrendingUp,
  Calendar, ExternalLink, Store, Zap, Filter, Target,
  Inbox, ShieldCheck, Sparkles, Link2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ===== RADAR CHART COMPONENT (SVG) =====
function RadarChart({ data, size = 280 }: { data: Record<string, number>; size?: number }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  if (labels.length < 3) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        يتطلب 3 مواد على الأقل لعرض المخطط
      </div>
    );
  }

  const maxVal = Math.max(...values, 1);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / labels.length;
  const levels = [0.25, 0.5, 0.75, 1];

  // Grid lines
  const gridPaths = levels.map((level) => {
    const points = labels.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * level * Math.cos(angle);
      const y = cy + radius * level * Math.sin(angle);
      return `${x},${y}`;
    });
    return points.join(" ");
  });

  // Data polygon
  const dataPoints = values.map((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / maxVal) * radius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  // Label positions
  const labelPositions = labels.map((label, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + (radius + 25) * Math.cos(angle);
    const y = cy + (radius + 25) * Math.sin(angle);
    return { label, x, y, value: values[i] };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {/* Grid */}
      {gridPaths.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {/* Axes */}
      {labels.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line key={i} x1={cx} y1={cy}
            x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)}
            stroke="#e5e7eb" strokeWidth="1" />
        );
      })}
      {/* Data area */}
      <polygon points={dataPoints.join(" ")} fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth="2" />
      {/* Data points */}
      {values.map((val, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (val / maxVal) * radius;
        return (
          <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)}
            r="4" fill="#2563eb" />
        );
      })}
      {/* Labels */}
      {labelPositions.map((lp, i) => (
        <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
          className="text-[10px] fill-gray-600" fontFamily="sans-serif">
          {lp.label.length > 12 ? lp.label.slice(0, 12) + "…" : lp.label}
        </text>
      ))}
    </svg>
  );
}

// ===== STAT CARD =====
function StatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: typeof FileText; label: string; value: number; color: string; bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== MAIN COMPONENT =====
export default function TeacherPortfolio() {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile form state
  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | undefined>();
  const [currentSchool, setCurrentSchool] = useState("");
  const [region, setRegion] = useState("");

  // Queries
  const portfolioQuery = trpc.portfolio2.getMyPortfolio.useQuery(undefined, {
    enabled: !!user,
  });

  // Sync form state when portfolio data loads
  const portfolioData = portfolioQuery.data;
  const [formInitialized, setFormInitialized] = useState(false);
  if (portfolioData && !formInitialized) {
    setBio(portfolioData.bio || "");
    setSpecializations(portfolioData.specializations?.join("\u060C ") || "");
    setYearsOfExperience(portfolioData.yearsOfExperience || undefined);
    setCurrentSchool(portfolioData.currentSchool || "");
    setRegion(portfolioData.region || "");
    setFormInitialized(true);
  }

  const statsQuery = trpc.portfolio2.getStats.useQuery(undefined, { enabled: !!user });
  const certsQuery = trpc.portfolio2.getCertificates.useQuery(undefined, { enabled: !!user });
  const activityQuery = trpc.portfolio2.getRecentActivity.useQuery({ limit: 10 }, { enabled: !!user });

  // New: Contributions & Skill Radar
  const [contribFilter, setContribFilter] = useState<"all" | "lesson_plan" | "exam" | "digitized" | "image" | "marketplace">("all");
  const contributionsQuery = trpc.portfolio2.getMyContributions.useQuery(
    { type: contribFilter, limit: 50 },
    { enabled: !!user }
  );
  const skillRadarQuery = trpc.portfolio2.getSkillRadar.useQuery(undefined, { enabled: !!user });

  // Mutations
  const updateProfile = trpc.portfolio2.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف المهني بنجاح");
      setIsEditing(false);
      portfolioQuery.refetch();
    },
    onError: () => toast.error("فشل في تحديث الملف المهني"),
  });

  const togglePublic = trpc.portfolio2.togglePublic.useMutation({
    onSuccess: (data) => {
      toast.success(data.isPublic ? "الملف المهني أصبح عاماً" : "الملف المهني أصبح خاصاً");
      portfolioQuery.refetch();
    },
  });

  const exportPDF = trpc.portfolio2.exportPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("تم إنشاء ملف PDF بنجاح");
    },
    onError: () => toast.error("فشل في إنشاء ملف PDF"),
  });

  const portfolio = portfolioQuery.data;
  const stats = statsQuery.data;

  const publicUrl = useMemo(() => {
    if (!portfolio?.publicToken) return "";
    return `${window.location.origin}/public-portfolio/${portfolio.publicToken}`;
  }, [portfolio?.publicToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("تم نسخ الرابط");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      bio,
      specializations: specializations.split("،").map(s => s.trim()).filter(Boolean),
      yearsOfExperience,
      currentSchool,
      region,
    });
  };

  const activityTypeLabels: Record<string, { label: string; icon: typeof FileText; color: string }> = {
    lesson_plan: { label: "جذاذة بيداغوجية", icon: FileText, color: "text-blue-600" },
    exam_generated: { label: "اختبار", icon: GraduationCap, color: "text-purple-600" },
    evaluation: { label: "تقييم", icon: BarChart3, color: "text-orange-600" },
    image_generated: { label: "صورة تعليمية", icon: Image, color: "text-green-600" },
    inspection_report: { label: "تقرير تفقد", icon: BookOpen, color: "text-red-600" },
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">الملف المهني</h2>
            <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى ملفك المهني</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">تسجيل الدخول</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container max-w-6xl py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4 ml-1" />
                الرئيسية
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
              {(user.arabicName || user.name || "م")?.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {user.arabicName || user.name || "المعلم"}
              </h1>
              <p className="text-blue-100 mt-1">{user.email}</p>
              {portfolio?.currentSchool && (
                <div className="flex items-center gap-2 mt-2 text-blue-200">
                  <School className="w-4 h-4" />
                  <span>{portfolio.currentSchool}</span>
                </div>
              )}
              {portfolio?.specializations && portfolio.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {portfolio.specializations.map((s, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/20 text-white border-0">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="w-4 h-4 ml-1" />
                تعديل
              </Button>
              <Button variant="outline" size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => exportPDF.mutate()}
                disabled={exportPDF.isPending}>
                {exportPDF.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Download className="w-4 h-4 ml-1" />}
                تصدير PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8 space-y-8">
        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                تعديل الملف المهني
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">نبذة مهنية</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن مسيرتك المهنية..."
                  className="bg-white" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">التخصصات (مفصولة بفاصلة)</label>
                  <Input value={specializations} onChange={(e) => setSpecializations(e.target.value)}
                    placeholder="اللغة العربية، الرياضيات، الإيقاظ العلمي"
                    className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">سنوات الخبرة</label>
                  <Input type="number" value={yearsOfExperience || ""} onChange={(e) => setYearsOfExperience(Number(e.target.value) || undefined)}
                    placeholder="10" className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">المؤسسة التعليمية</label>
                  <Input value={currentSchool} onChange={(e) => setCurrentSchool(e.target.value)}
                    placeholder="المدرسة الابتدائية..." className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الجهة</label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)}
                    placeholder="تونس العاصمة" className="bg-white" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}
                  className="bg-blue-600 hover:bg-blue-700">
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}
                  حفظ التعديلات
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        {portfolio?.bio && !isEditing && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                نبذة مهنية
              </h3>
              <p className="text-gray-600 leading-relaxed">{portfolio.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            إحصائيات النشاط الرقمي
          </h2>
          {statsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="جذاذة بيداغوجية" value={stats?.totalLessonPlans || 0}
                color="text-blue-600" bgColor="bg-blue-100" />
              <StatCard icon={GraduationCap} label="اختبار" value={stats?.totalExams || 0}
                color="text-purple-600" bgColor="bg-purple-100" />
              <StatCard icon={Image} label="صورة تعليمية" value={stats?.totalImages || 0}
                color="text-green-600" bgColor="bg-green-100" />
              <StatCard icon={Award} label="شهادة" value={stats?.totalCertificates || 0}
                color="text-amber-600" bgColor="bg-amber-100" />
              <StatCard icon={BarChart3} label="تقييم" value={stats?.totalEvaluations || 0}
                color="text-orange-600" bgColor="bg-orange-100" />
              <StatCard icon={ScanLine} label="وثيقة مرقمنة" value={stats?.totalDigitizedDocs || 0}
                color="text-teal-600" bgColor="bg-teal-100" />
              <StatCard icon={MessageSquare} label="محادثة ذكية" value={stats?.totalConversations || 0}
                color="text-indigo-600" bgColor="bg-indigo-100" />
              <StatCard icon={BookOpen} label="مادة تعليمية" value={Object.keys(stats?.subjectBreakdown || {}).length}
                color="text-rose-600" bgColor="bg-rose-100" />
            </div>
          )}
        </div>

        {/* Two columns: Skill Radar + Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Skill Radar Chart */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                مخطط رادار المهارات
                {skillRadarQuery.data && (
                  <Badge variant="outline" className="mr-auto text-xs">
                    <Zap className="w-3 h-3 ml-1" />
                    {skillRadarQuery.data.level} • {skillRadarQuery.data.totalScore} نقطة
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillRadarQuery.isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : skillRadarQuery.data && Object.keys(skillRadarQuery.data.subjectExpertise).length >= 3 ? (
                <div>
                  <RadarChart data={skillRadarQuery.data.subjectExpertise} />
                  {/* Document Type Breakdown */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {Object.entries(skillRadarQuery.data.documentTypeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
                        <span className="font-medium text-gray-700">{type}</span>
                        <Badge variant="secondary" className="mr-auto text-xs">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                  {/* Level Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>المستوى: {skillRadarQuery.data.level}</span>
                      <span>{skillRadarQuery.data.totalScore} / {skillRadarQuery.data.totalScore >= 100 ? 100 : skillRadarQuery.data.totalScore >= 60 ? 100 : skillRadarQuery.data.totalScore >= 30 ? 60 : skillRadarQuery.data.totalScore >= 10 ? 30 : 10}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-l from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (skillRadarQuery.data.totalScore / (skillRadarQuery.data.totalScore >= 100 ? 100 : skillRadarQuery.data.totalScore >= 60 ? 100 : skillRadarQuery.data.totalScore >= 30 ? 60 : skillRadarQuery.data.totalScore >= 10 ? 30 : 10)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">مبتدئ (0) → متوسط (10) → متقدم (30) → خبير (60) → خبير متميز (100+)</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">يتطلب نشاطاً في 3 مواد على الأقل</p>
                  <p className="text-xs mt-1">ابدأ بإنشاء جذاذات واختبارات ورقمنة وثائق لمواد مختلفة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                الشهادات المكتسبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : certsQuery.data && certsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {certsQuery.data.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{cert.courseTitle || "شهادة"}</p>
                        <p className="text-xs text-gray-500">
                          {cert.certificateNumber} • {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("ar-TN") : ""}
                        </p>
                      </div>
                      {cert.pdfUrl && (
                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">لا توجد شهادات بعد</p>
                  <Link href="/my-courses">
                    <Button variant="link" size="sm" className="mt-2">
                      استكشف الدورات <ArrowRight className="w-3 h-3 mr-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== MY CONTRIBUTIONS (مساهماتي) ===== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                مساهماتي
                {contributionsQuery.data && (
                  <Badge variant="secondary" className="text-xs">{contributionsQuery.data.total}</Badge>
                )}
              </CardTitle>
              <Select value={contribFilter} onValueChange={(v) => setContribFilter(v as typeof contribFilter)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <Filter className="w-3 h-3 ml-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="lesson_plan">جذاذات</SelectItem>
                  <SelectItem value="exam">اختبارات</SelectItem>
                  <SelectItem value="digitized">وثائق مرقمنة</SelectItem>
                  <SelectItem value="marketplace">منشورات السوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {contributionsQuery.isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : contributionsQuery.data && contributionsQuery.data.items.length > 0 ? (
              <div className="space-y-2">
                {contributionsQuery.data.items.map((item) => {
                  const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
                    lesson_plan: { icon: BookOpen, color: "text-blue-600 bg-blue-100", label: "جذاذة" },
                    exam: { icon: FileText, color: "text-purple-600 bg-purple-100", label: "اختبار" },
                    digitized: { icon: ScanLine, color: "text-emerald-600 bg-emerald-100", label: "مرقمنة" },
                    image: { icon: Image, color: "text-pink-600 bg-pink-100", label: "صورة" },
                    marketplace: { icon: Store, color: "text-amber-600 bg-amber-100", label: "سوق" },
                  };
                  const cfg = typeConfig[item.type] || typeConfig.digitized;
                  const ItemIcon = cfg.icon;
                  return (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cfg.label}</Badge>
                          {item.subject && <span>{item.subject}</span>}
                          {item.level && <><span>•</span><span>{item.level}</span></>}
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString("ar-TN")}</span>
                        </div>
                      </div>
                      <Badge variant={item.status === "saved" || item.status === "approved" ? "default" : "secondary"} className="text-[10px]">
                        {item.status === "saved" ? "محفوظ" : item.status === "approved" ? "منشور" : item.status === "formatted" ? "منسّق" : item.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">لا توجد مساهمات بعد</p>
                <p className="text-xs mt-1">ابدأ بإنشاء جذاذات أو اختبارات أو رقمنة وثائق</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              آخر الأنشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : activityQuery.data && activityQuery.data.length > 0 ? (
              <div className="space-y-3">
                {activityQuery.data.map((activity) => {
                  const meta = activityTypeLabels[activity.activityType] || {
                    label: activity.activityType, icon: FileText, color: "text-gray-600"
                  };
                  const ActivityIcon = meta.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title || meta.label}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {meta.label}
                          </Badge>
                          {activity.subject && <span>{activity.subject}</span>}
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString("ar-TN")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">لا توجد أنشطة مسجلة بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Public Sharing Section */}
        <Card className="border-indigo-200 bg-gradient-to-l from-indigo-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              المشاركة العامة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              شارك ملفك المهني مع المتفقدين والزملاء عبر رابط فريد. يعرض الرابط إحصائياتك وشهاداتك بشكل احترافي.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {portfolio?.isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {portfolio?.isPublic ? "عام — يمكن لأي شخص الوصول" : "خاص — أنت فقط"}
                </span>
              </div>
              <Switch
                checked={portfolio?.isPublic || false}
                onCheckedChange={(checked) => togglePublic.mutate({ isPublic: checked })}
              />
            </div>

            {portfolio?.isPublic && publicUrl && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                <Input value={publicUrl} readOnly className="text-xs bg-transparent border-0 flex-1" dir="ltr" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Hub Section */}
        <Card className="border-amber-200 bg-gradient-to-l from-amber-50/50 to-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              مركز التوظيف المهني (Career Hub)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              اجعل ملفك المهني قابلاً للاكتشاف من طرف المدارس الخاصة والمؤسسات التعليمية. صفحة العرض تشمل شارة التحقق، رادار الكفاءات، والعينات الذهبية.
            </p>
            {portfolio?.isPublic && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                  <Link2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs text-gray-500 shrink-0">رابط العرض:</span>
                  <code className="text-xs text-amber-700 flex-1 truncate" dir="ltr">
                    {window.location.origin}/showcase/{portfolio?.publicSlug || portfolio?.publicToken}
                  </code>
                  <a href={`/showcase/${portfolio?.publicSlug || portfolio?.publicToken}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
                <Link href="/connection-requests">
                  <Button variant="outline" className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Inbox className="w-4 h-4" />
                    إدارة طلبات التوظيف
                    <ArrowRight className="w-4 h-4 mr-auto" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>درع الخصوصية نشط: معلومات الاتصال مخفية حتى توافق على طلب التواصل</span>
                </div>
              </div>
            )}
            {!portfolio?.isPublic && (
              <div className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                فعّل المشاركة العامة أعلاه لتفعيل مركز التوظيف المهني.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
