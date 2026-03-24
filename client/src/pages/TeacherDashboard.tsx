import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  GraduationCap,
  BookOpen,
  Star,
  Award,
  Target,
  BarChart3,
  Briefcase,
  MessageSquare,
  FileText,
  Bot,
  Search,
  FileEdit,
  Palette,
  Theater,
  Brain,
  Film,
  ScanLine,
  Calendar,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Zap,
  Trophy,
  Medal,
  Crown,
  HeartHandshake,
  FileCheck,
  Loader2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";

// ===== TIER SYSTEM =====
interface Tier {
  name: string;
  nameAr: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

const TIERS: Tier[] = [
  { name: "beginner", nameAr: "مبتدئ", min: 0, max: 99, color: "text-gray-600", bgColor: "bg-gray-100", icon: Star },
  { name: "active", nameAr: "نشط", min: 100, max: 499, color: "text-blue-600", bgColor: "bg-blue-100", icon: Zap },
  { name: "expert", nameAr: "خبير", min: 500, max: 1999, color: "text-purple-600", bgColor: "bg-purple-100", icon: Trophy },
  { name: "pioneer", nameAr: "رائد", min: 2000, max: Infinity, color: "text-amber-600", bgColor: "bg-amber-100", icon: Crown },
];

function getTier(points: number): Tier {
  return TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
}

function getNextTier(points: number): Tier | null {
  const currentIndex = TIERS.findIndex(t => points >= t.min && points <= t.max);
  if (currentIndex < TIERS.length - 1) return TIERS[currentIndex + 1];
  return null;
}

function getProgressToNextTier(points: number): number {
  const tier = getTier(points);
  const nextTier = getNextTier(points);
  if (!nextTier) return 100;
  const range = nextTier.min - tier.min;
  const progress = points - tier.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ===== QUICK ACCESS TOOLS =====
const QUICK_TOOLS: { href: string; icon: LucideIcon; label: string; color: string }[] = [
  { href: "/assistant", icon: Bot, label: "المساعد البيداغوجي", color: "bg-blue-500" },
  { href: "/inspector", icon: Search, label: "المتفقد الذكي", color: "bg-emerald-500" },
  { href: "/exam-builder", icon: FileEdit, label: "بناء الاختبار", color: "bg-purple-500" },
  { href: "/visual-studio", icon: Palette, label: "Visual Studio", color: "bg-pink-500" },
  { href: "/blind-grading", icon: FileCheck, label: "التصحيح الذكي", color: "bg-orange-500" },
  { href: "/learning-support", icon: HeartHandshake, label: "ذوي الصعوبات", color: "bg-teal-500" },
  { href: "/drama-engine", icon: Theater, label: "محرك الدراما", color: "bg-red-500" },
  { href: "/curriculum-map", icon: Calendar, label: "خريطة المنهج", color: "bg-indigo-500" },
];

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch teacher portfolio data
  const { data: portfolio, isLoading: loadingPortfolio } = trpc.portfolio2.getMyPortfolio.useQuery(
    undefined, 
    { enabled: !!user, retry: false }
  );

  // Fetch job applications
  const { data: applications, isLoading: loadingApps } = trpc.jobBoard.myApplications.useQuery(
    undefined, 
    { enabled: !!user, retry: false }
  );

  // Fetch certificates
  const { data: certificates, isLoading: loadingCerts } = trpc.certificates.listMyCertificates.useQuery(
    undefined, 
    { enabled: !!user, retry: false }
  );

  // Calculate points (based on portfolio stats)
  const points = useMemo(() => {
    if (!portfolio) return 0;
    return (
      (portfolio.totalLessonPlans || 0) * 10 +
      (portfolio.totalExams || 0) * 15 +
      (portfolio.totalEvaluations || 0) * 8 +
      (portfolio.totalCertificates || 0) * 50 +
      (portfolio.totalImages || 0) * 5 +
      (portfolio.totalDigitizedDocs || 0) * 12 +
      (portfolio.totalConversations || 0) * 3
    );
  }, [portfolio]);

  const currentTier = getTier(points);
  const nextTier = getNextTier(points);
  const progressPercent = getProgressToNextTier(points);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const TierIcon = currentTier.icon;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <UnifiedNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 text-gray-500">
              <ArrowLeft className="w-4 h-4" />
              الرئيسية
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                مرحباً، {user.name || user.firstNameAr || "معلّم"} 👋
              </h1>
              <p className="text-gray-600 mt-1">لوحة تحكمك الشخصية — تابع تقدمك واكتشف فرصاً جديدة</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${currentTier.bgColor} ${currentTier.color} border-0 text-sm px-4 py-2 gap-2`}>
                <TierIcon className="w-4 h-4" />
                {currentTier.nameAr}
              </Badge>
              <span className="text-2xl font-bold text-gray-900">{points}</span>
              <span className="text-sm text-gray-500">نقطة</span>
            </div>
          </div>
        </div>

        {/* Tier Progress Card */}
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-l from-blue-50 to-white">
          <CardContent className="py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 rounded-xl ${currentTier.bgColor} flex items-center justify-center`}>
                  <TierIcon className={`w-6 h-6 ${currentTier.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      المستوى: <span className={`font-bold ${currentTier.color}`}>{currentTier.nameAr}</span>
                    </span>
                    {nextTier && (
                      <span className="text-xs text-gray-500">
                        {nextTier.min - points} نقطة للوصول إلى {nextTier.nameAr}
                      </span>
                    )}
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const isActive = tier.name === currentTier.name;
                  return (
                    <div key={tier.name} className={`flex items-center gap-1 ${isActive ? "font-bold" : "opacity-50"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? tier.color : ""}`} />
                      <span>{tier.nameAr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Sparkles className="w-4 h-4" />
              أدواتي
            </TabsTrigger>
            <TabsTrigger value="career" className="gap-2">
              <Briefcase className="w-4 h-4" />
              المسار المهني
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="w-4 h-4" />
              الإنجازات
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={FileText}
                label="الجذاذات"
                value={portfolio?.totalLessonPlans || 0}
                color="bg-blue-500"
                points={10}
              />
              <StatCard
                icon={FileEdit}
                label="الاختبارات"
                value={portfolio?.totalExams || 0}
                color="bg-purple-500"
                points={15}
              />
              <StatCard
                icon={Award}
                label="الشهادات"
                value={portfolio?.totalCertificates || 0}
                color="bg-amber-500"
                points={50}
              />
              <StatCard
                icon={CheckCircle}
                label="التقييمات"
                value={portfolio?.totalEvaluations || 0}
                color="bg-emerald-500"
                points={8}
              />
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">وصول سريع للأدوات</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {QUICK_TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="cursor-pointer hover:shadow-md transition-all border-0 shadow-sm group">
                    <CardContent className="py-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tool.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{tool.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  النشاط الأخير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>استخدم الأدوات لتبدأ في جمع النقاط وتتبع نشاطك</p>
                  <Link href="/teacher-tools">
                    <Button variant="outline" className="mt-4 gap-2">
                      <Sparkles className="w-4 h-4" />
                      استكشف الأدوات
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="grid md:grid-cols-2 gap-4">
              <ToolCategory
                title="أدوات الذكاء الاصطناعي"
                description="أدوات متقدمة لإعداد الدروس والاختبارات"
                tools={[
                  { href: "/assistant", icon: Bot, label: "المساعد البيداغوجي", desc: "إعداد الجذاذات والمخططات" },
                  { href: "/inspector", icon: Search, label: "المتفقد الذكي", desc: "تحليل وتقييم الوثائق" },
                  { href: "/exam-builder", icon: FileEdit, label: "بناء الاختبار", desc: "توليد اختبارات مع الرسومات" },
                  { href: "/visual-studio", icon: Palette, label: "Visual Studio", desc: "توليد صور تعليمية" },
                  { href: "/blind-grading", icon: FileCheck, label: "التصحيح الذكي", desc: "تصحيح ذكي لأوراق التلاميذ" },
                ]}
              />
              <ToolCategory
                title="أدوات المنهج والتخطيط"
                description="تخطيط وتتبع المنهج الدراسي"
                tools={[
                  { href: "/curriculum-map", icon: Calendar, label: "خريطة المنهج", desc: "تتبع تغطية المنهج" },
                  { href: "/annual-plan", icon: FileText, label: "المخطط السنوي", desc: "توليد مخططات سنوية" },
                  { href: "/repartition-journaliere", icon: BookOpen, label: "التوزيع اليومي", desc: "التوزيع اليومي للفرنسية" },
                ]}
              />
              <ToolCategory
                title="أدوات ذوي الصعوبات"
                description="مرافقة التلاميذ ذوي صعوبات التعلم"
                tools={[
                  { href: "/learning-support", icon: HeartHandshake, label: "أدوات الدعم", desc: "مجموعة أدوات متكاملة" },
                  { href: "/pedagogical-companion", icon: Brain, label: "المرافق البيداغوجي", desc: "خطط مرافقة فردية" },
                  { href: "/therapeutic-exercises", icon: Target, label: "تمارين علاجية", desc: "تمارين مخصصة لكل اضطراب" },
                ]}
              />
              <ToolCategory
                title="أدوات إبداعية"
                description="أدوات تعليمية إبداعية ومبتكرة"
                tools={[
                  { href: "/drama-engine", icon: Theater, label: "محرك الدراما", desc: "تحويل الدروس لمسرحيات" },
                  { href: "/video-evaluator", icon: Film, label: "مقيّم الفيديو", desc: "تقييم الفيديوهات التعليمية" },
                  { href: "/legacy-digitizer", icon: ScanLine, label: "رقمنة الوثائق", desc: "رقمنة الوثائق القديمة" },
                  { href: "/prompt-lab", icon: Sparkles, label: "مختبر الأوامر", desc: "مكتبة أوامر ذهبية" },
                ]}
              />
            </div>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Job Applications */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    طلبات التوظيف
                  </CardTitle>
                  <CardDescription>تتبع طلباتك للوظائف في المدارس الشريكة</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingApps ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : applications && applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{app.jobTitle || "وظيفة"}</p>
                            <p className="text-xs text-gray-500">{app.schoolName || ""}</p>
                          </div>
                          <Badge variant={
                            app.status === "accepted" ? "default" :
                            app.status === "rejected" ? "destructive" : "secondary"
                          }>
                            {app.status === "pending" ? "قيد المراجعة" :
                             app.status === "accepted" ? "مقبول" :
                             app.status === "rejected" ? "مرفوض" :
                             app.status === "shortlisted" ? "في القائمة القصيرة" : app.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">لم تقدم على أي وظيفة بعد</p>
                      <Link href="/jobs">
                        <Button variant="outline" size="sm" className="mt-3 gap-2">
                          <ExternalLink className="w-3 h-3" />
                          تصفح فرص العمل
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Completeness */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    الملف المهني
                  </CardTitle>
                  <CardDescription>أكمل ملفك لتحسين فرصك</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ProfileCheckItem label="الاسم الكامل" completed={!!(user.firstNameAr && user.lastNameAr)} />
                    <ProfileCheckItem label="رقم الهاتف" completed={!!user.phone} />
                    <ProfileCheckItem label="اسم المدرسة" completed={!!user.schoolName} />
                    <ProfileCheckItem label="الملف العام (Portfolio)" completed={!!portfolio?.isPublic} />
                    <ProfileCheckItem label="التخصصات" completed={!!portfolio?.specializations?.length} />
                    <ProfileCheckItem label="سنوات الخبرة" completed={!!portfolio?.yearsOfExperience} />
                  </div>
                  <Link href="/my-portfolio">
                    <Button className="w-full mt-6 gap-2" variant="outline">
                      <FileText className="w-4 h-4" />
                      تعديل الملف المهني
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    الرسائل المهنية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">تواصل مع المدارس المهتمة بملفك</p>
                    <Link href="/career-messages">
                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                        <ExternalLink className="w-3 h-3" />
                        فتح الرسائل
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    الشهادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCerts ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : certificates && certificates.length > 0 ? (
                    <div className="space-y-2">
                      {certificates.slice(0, 3).map((cert: any) => (
                        <div key={cert.id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                          <Award className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="text-sm font-medium">{cert.courseName || "شهادة"}</p>
                            <p className="text-xs text-gray-500">
                              {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("ar-TN") : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Award className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">أكمل الدورات للحصول على شهادات</p>
                      <Link href="/courses">
                        <Button variant="outline" size="sm" className="mt-3 gap-2">
                          <ExternalLink className="w-3 h-3" />
                          تصفح الدورات
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid md:grid-cols-3 gap-4">
              <AchievementCard
                icon={FileText}
                title="كاتب الجذاذات"
                description="أنشئ 10 جذاذات بيداغوجية"
                current={portfolio?.totalLessonPlans || 0}
                target={10}
                points={100}
                color="blue"
              />
              <AchievementCard
                icon={FileEdit}
                title="بنّاء الاختبارات"
                description="أنشئ 5 اختبارات"
                current={portfolio?.totalExams || 0}
                target={5}
                points={75}
                color="purple"
              />
              <AchievementCard
                icon={Award}
                title="جامع الشهادات"
                description="احصل على 3 شهادات"
                current={portfolio?.totalCertificates || 0}
                target={3}
                points={150}
                color="amber"
              />
              <AchievementCard
                icon={Palette}
                title="المبدع البصري"
                description="أنشئ 20 صورة تعليمية"
                current={portfolio?.totalImages || 0}
                target={20}
                points={100}
                color="pink"
              />
              <AchievementCard
                icon={ScanLine}
                title="حافظ التراث"
                description="رقمن 10 وثائق قديمة"
                current={portfolio?.totalDigitizedDocs || 0}
                target={10}
                points={120}
                color="emerald"
              />
              <AchievementCard
                icon={Bot}
                title="صديق الذكاء الاصطناعي"
                description="أجرِ 50 محادثة مع المساعد"
                current={portfolio?.totalConversations || 0}
                target={50}
                points={150}
                color="indigo"
              />
            </div>

            {/* Points Breakdown */}
            <Card className="mt-8 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">كيف تكسب النقاط؟</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PointsInfo label="جذاذة بيداغوجية" points={10} />
                  <PointsInfo label="اختبار" points={15} />
                  <PointsInfo label="تقييم" points={8} />
                  <PointsInfo label="شهادة" points={50} />
                  <PointsInfo label="صورة تعليمية" points={5} />
                  <PointsInfo label="وثيقة مرقمنة" points={12} />
                  <PointsInfo label="محادثة ذكاء اصطناعي" points={3} />
                  <PointsInfo label="إنجاز مكتمل" points={"متغير"} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function StatCard({ icon: Icon, label, value, color, points }: { icon: LucideIcon; label: string; value: number; color: string; points: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">+{points} نقطة لكل عنصر</p>
      </CardContent>
    </Card>
  );
}

function ToolCategory({ title, description, tools }: { 
  title: string; 
  description: string; 
  tools: { href: string; icon: LucideIcon; label: string; desc: string }[] 
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <tool.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{tool.label}</p>
                  <p className="text-xs text-gray-400">{tool.desc}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-300 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileCheckItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span className={`text-sm ${completed ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

function AchievementCard({ icon: Icon, title, description, current, target, points, color }: {
  icon: LucideIcon;
  title: string;
  description: string;
  current: number;
  target: number;
  points: number;
  color: string;
}) {
  const completed = current >= target;
  const progress = Math.min(100, Math.round((current / target) * 100));
  
  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-50 text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-50 text-purple-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", badge: "bg-amber-50 text-amber-600" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", badge: "bg-pink-50 text-pink-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", badge: "bg-indigo-50 text-indigo-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Card className={`border-0 shadow-sm ${completed ? "ring-2 ring-emerald-200" : ""}`}>
      <CardContent className="py-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          {completed ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-0">مكتمل ✓</Badge>
          ) : (
            <Badge className={`${c.badge} border-0`}>+{points} نقطة</Badge>
          )}
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-gray-500 font-medium">{current}/{target}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PointsInfo({ label, points }: { label: string; points: number | string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <Star className="w-4 h-4 text-amber-500" />
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-amber-600 font-bold">+{points} نقطة</p>
      </div>
    </div>
  );
}
