import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  Building2,
  Briefcase,
  Users,
  Star,
  BarChart3,
  MessageSquare,
  FileText,
  Plus,
  MapPin,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Clock,
  ArrowLeft,
  TrendingUp,
  Send,
  ExternalLink,
  Eye,
  UserCheck,
  UserX,
  Loader2,
  Search,
  type LucideIcon,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";

export default function SchoolDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch school data
  const { data: mySchool, isLoading: loadingSchool } = trpc.schoolPortal.getMySchool.useQuery(
    undefined,
    { enabled: !!user, retry: false }
  );

  // Fetch school's job postings
  const { data: myJobs, isLoading: loadingJobs } = trpc.schoolPortal.getMyJobs.useQuery(
    undefined,
    { enabled: !!user && !!mySchool, retry: false }
  );

  // Applications data - will be available via job board router
  const applicationsData: any[] = [];
  const loadingApps = false;

  // Stats
  const stats = useMemo(() => {
    const jobs = myJobs || [];
    const apps = applicationsData || [];
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j: any) => j.isActive).length,
      totalApplications: apps.length,
      pendingApplications: apps.filter((a: any) => a.status === "pending").length,
      acceptedApplications: apps.filter((a: any) => a.status === "accepted").length,
      shortlistedApplications: apps.filter((a: any) => a.status === "shortlisted").length,
    };
  }, [myJobs, applicationsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  // If school not registered yet, redirect to school portal
  if (!loadingSchool && !mySchool) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <UnifiedNavbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">سجّل مدرستك أولاً</h1>
          <p className="text-gray-600 mb-8">
            لاستخدام لوحة تحكم المدرسة، يجب عليك تسجيل مدرستك في بوابة المدارس الشريكة أولاً.
          </p>
          <Link href="/school-portal">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Building2 className="w-5 h-5" />
              تسجيل المدرسة
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <UnifiedNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 text-gray-500">
              <ArrowLeft className="w-4 h-4" />
              الرئيسية
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {mySchool?.schoolNameAr || mySchool?.schoolName || "المدرسة"}
                </h1>
                {mySchool?.isVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
                    <CheckCircle className="w-3 h-3" />
                    معتمدة
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
                    <Clock className="w-3 h-3" />
                    قيد المراجعة
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">لوحة تحكم المدرسة — إدارة التوظيف والمعلمين</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/school-portal">
                <Button variant="outline" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  إعدادات المدرسة
                </Button>
              </Link>
              <Link href="/school-portal">
                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                  <Plus className="w-4 h-4" />
                  نشر عرض عمل
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={Briefcase} label="عروض العمل" value={stats.totalJobs} subtitle={`${stats.activeJobs} نشط`} color="bg-blue-500" />
          <StatsCard icon={Users} label="الطلبات" value={stats.totalApplications} subtitle={`${stats.pendingApplications} قيد المراجعة`} color="bg-purple-500" />
          <StatsCard icon={UserCheck} label="مقبول" value={stats.acceptedApplications} subtitle="معلم مقبول" color="bg-emerald-500" />
          <StatsCard icon={Star} label="القائمة القصيرة" value={stats.shortlistedApplications} subtitle="مرشح محتمل" color="bg-amber-500" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="w-4 h-4" />
              عروض العمل
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <Users className="w-4 h-4" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="talent" className="gap-2">
              <Search className="w-4 h-4" />
              اكتشاف المواهب
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* School Info */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    معلومات المدرسة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <InfoRow label="الاسم" value={mySchool?.schoolName || "-"} />
                    <InfoRow label="الاسم بالعربية" value={mySchool?.schoolNameAr || "-"} />
                    <InfoRow label="النوع" value={
                      mySchool?.schoolType === "private" ? "خاصة" :
                      mySchool?.schoolType === "public" ? "عمومية" :
                      mySchool?.schoolType === "international" ? "دولية" : "أخرى"
                    } />
                    <InfoRow label="الجهة" value={mySchool?.region || "-"} />
                    <InfoRow label="الهاتف" value={mySchool?.phone || "-"} />
                    <InfoRow label="البريد" value={mySchool?.email || "-"} />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/school-portal">
                      <QuickAction icon={Plus} label="نشر عرض عمل جديد" desc="استقطب أفضل المعلمين" color="bg-blue-500" />
                    </Link>
                    <Link href="/showcase">
                      <QuickAction icon={Search} label="تصفح دليل المواهب" desc="اكتشف معلمين مؤهلين" color="bg-purple-500" />
                    </Link>
                    <Link href="/career-messages">
                      <QuickAction icon={MessageSquare} label="الرسائل المهنية" desc="تواصل مع المرشحين" color="bg-emerald-500" />
                    </Link>
                    <Link href="/school-portal">
                      <QuickAction icon={Building2} label="تعديل ملف المدرسة" desc="حدّث معلومات مدرستك" color="bg-amber-500" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      آخر عروض العمل
                    </CardTitle>
                    <CardDescription>أحدث العروض المنشورة</CardDescription>
                  </div>
                  <Link href="/school-portal">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-3 h-3" />
                      عرض جديد
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {loadingJobs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : myJobs && myJobs.length > 0 ? (
                    <div className="space-y-3">
                      {myJobs.slice(0, 5).map((job: any) => (
                        <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="font-medium text-gray-900">{job.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {job.subject}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.region}</span>
                            </div>
                          </div>
                          <Badge className={job.isActive ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                            {job.isActive ? "نشط" : "مغلق"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لم تنشر أي عروض عمل بعد</p>
                      <Link href="/school-portal">
                        <Button variant="outline" className="mt-4 gap-2">
                          <Plus className="w-4 h-4" />
                          نشر أول عرض
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">جميع عروض العمل</h3>
              <Link href="/school-portal">
                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                  <Plus className="w-4 h-4" />
                  نشر عرض جديد
                </Button>
              </Link>
            </div>
            {loadingJobs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : myJobs && myJobs.length > 0 ? (
              <div className="space-y-4">
                {myJobs.map((job: any) => (
                  <Card key={job.id} className="border-0 shadow-sm">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {job.subject}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.region}</span>
                            {job.grade && <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {job.grade}</span>}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.contractType === "full_time" ? "دوام كامل" :
                               job.contractType === "part_time" ? "دوام جزئي" :
                               job.contractType === "temporary" ? "مؤقت" : "حر"}
                            </span>
                          </div>
                          {job.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={job.isActive ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                            {job.isActive ? "نشط" : "مغلق"}
                          </Badge>
                          {job.matchedTeacherIds && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {JSON.parse(typeof job.matchedTeacherIds === "string" ? job.matchedTeacherIds : "[]").length} مطابقة
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">لم تنشر أي عروض عمل بعد</h3>
                  <p className="text-sm mb-6">انشر أول عرض عمل لاكتشاف المعلمين المناسبين لمدرستك</p>
                  <Link href="/school-portal">
                    <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                      <Plus className="w-4 h-4" />
                      نشر أول عرض عمل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">طلبات التوظيف الواردة</h3>
            {loadingApps ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : applicationsData && applicationsData.length > 0 ? (
              <div className="space-y-4">
                {applicationsData.map((app: any) => (
                  <Card key={app.id} className="border-0 shadow-sm">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{app.teacherName || "معلم"}</h4>
                            <p className="text-sm text-gray-500">{app.jobTitle || "وظيفة"}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("ar-TN") : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            app.status === "accepted" ? "bg-emerald-100 text-emerald-700 border-0" :
                            app.status === "rejected" ? "bg-red-100 text-red-700 border-0" :
                            app.status === "shortlisted" ? "bg-amber-100 text-amber-700 border-0" :
                            "bg-gray-100 text-gray-600 border-0"
                          }>
                            {app.status === "pending" ? "قيد المراجعة" :
                             app.status === "accepted" ? "مقبول" :
                             app.status === "rejected" ? "مرفوض" :
                             app.status === "shortlisted" ? "قائمة قصيرة" : app.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">لا توجد طلبات توظيف بعد</h3>
                  <p className="text-sm">انشر عروض عمل لاستقبال طلبات من المعلمين المؤهلين</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Talent Discovery Tab */}
          <TabsContent value="talent">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-500" />
                    دليل المواهب
                  </CardTitle>
                  <CardDescription>تصفح ملفات المعلمين المؤهلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    اكتشف معلمين مؤهلين حسب التخصص والمنطقة والخبرة. تصفح ملفاتهم المهنية وتواصل معهم مباشرة.
                  </p>
                  <Link href="/showcase">
                    <Button className="w-full gap-2">
                      <Search className="w-4 h-4" />
                      تصفح دليل المواهب
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    المطابقة الذكية
                  </CardTitle>
                  <CardDescription>نظام مطابقة تلقائي بالذكاء الاصطناعي</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    عند نشر عرض عمل، يقوم النظام تلقائياً بمطابقة أفضل المعلمين حسب: التخصص (30%)، المستوى (25%)، المهارات (20%)، التصنيف (15%)، والقرب الجغرافي (10%).
                  </p>
                  <Link href="/school-portal">
                    <Button variant="outline" className="w-full gap-2">
                      <Briefcase className="w-4 h-4" />
                      نشر عرض لتفعيل المطابقة
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    التواصل المهني
                  </CardTitle>
                  <CardDescription>تواصل مباشر مع المرشحين المحتملين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    استخدم نظام الرسائل المهنية للتواصل مع المعلمين المهتمين. يمكنك إرسال دعوات للمقابلة وطلب معلومات إضافية.
                  </p>
                  <Link href="/career-messages">
                    <Button variant="outline" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      فتح الرسائل المهنية
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function StatsCard({ icon: Icon, label, value, subtitle, color }: {
  icon: LucideIcon; label: string; value: number; subtitle: string; color: string;
}) {
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
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, color }: {
  icon: LucideIcon; label: string; desc: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
      <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <ExternalLink className="w-3 h-3 text-gray-300 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
