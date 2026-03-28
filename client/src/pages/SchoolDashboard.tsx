import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import {
  Building2,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Search,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  TrendingUp,
  UserCheck,
  Star,
  MapPin,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import useI18n from "@/i18n";


const APP_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  sent: { label: "مُرسل", variant: "secondary" },
  viewed: { label: "تمت المشاهدة", variant: "secondary" },
  shortlisted: { label: "قائمة قصيرة", variant: "outline" },
  interviewed: { label: "تمت المقابلة", variant: "outline" },
  accepted: { label: "مقبول", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

export default function SchoolDashboard() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashData, isLoading: loadingDash } = trpc.dashboardApi.schoolStats.useQuery(
    undefined,
    { enabled: !!user, retry: false, refetchOnWindowFocus: false }
  );

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

  const stats = dashData?.stats;
  const school = dashData?.school;
  const jobs = dashData?.jobs || [];
  const applications = dashData?.applications || [];
  const recentApps = dashData?.recentApplications || [];

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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-500" />
                {school?.schoolName || user.schoolName || "لوحة تحكم المدرسة"}
              </h1>
              <p className="text-gray-600 mt-1">إدارة الوظائف والطلبات واكتشاف المواهب</p>
            </div>
            <div className="flex items-center gap-3">
              {school?.isVerified ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1 px-3 py-1.5">
                  <CheckCircle className="w-4 h-4" />
                  مدرسة موثّقة
                </Badge>
              ) : school ? (
                <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 px-3 py-1.5">
                  <Clock className="w-4 h-4" />
                  في انتظار التوثيق
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {loadingDash ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : !dashData ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لم يتم إعداد ملف المدرسة بعد</h3>
              <p className="text-gray-500 mb-6">قم بإعداد ملف مدرستك للبدء في نشر الوظائف واستقبال الطلبات</p>
              <Link href="/school-portal">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  إعداد ملف المدرسة
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard icon={Briefcase} label="إجمالي الوظائف" value={stats?.totalJobs || 0} subLabel={`${stats?.activeJobs || 0} نشطة`} color="bg-blue-500" />
              <KPICard icon={FileText} label="إجمالي الطلبات" value={stats?.totalApplications || 0} subLabel={`${stats?.pendingApplications || 0} قيد المراجعة`} color="bg-purple-500" />
              <KPICard icon={UserCheck} label="مقبولون" value={stats?.acceptedApplications || 0} subLabel={`${stats?.shortlistedApplications || 0} في القائمة القصيرة`} color="bg-emerald-500" />
              <KPICard icon={Star} label="مقابلات" value={stats?.interviewedApplications || 0} subLabel={`${stats?.rejectedApplications || 0} مرفوض`} color="bg-amber-500" />
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
                  الوظائف
                  {jobs.length > 0 && <Badge variant="secondary" className="text-xs me-1">{jobs.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="applications" className="gap-2">
                  <Users className="w-4 h-4" />
                  الطلبات
                  {applications.length > 0 && <Badge variant="secondary" className="text-xs me-1">{applications.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="talent" className="gap-2">
                  <Search className="w-4 h-4" />
                  اكتشاف المواهب
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Applications */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        آخر الطلبات الواردة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentApps.length > 0 ? (
                        <div className="space-y-3">
                          {recentApps.slice(0, 5).map((app: any) => {
                            const si = APP_STATUS_MAP[app.status] || APP_STATUS_MAP.sent;
                            return (
                              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{app.teacherName}</p>
                                  <p className="text-xs text-gray-500">{app.jobTitle}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={si.variant}>{si.label}</Badge>
                                  <span className="text-xs text-gray-400">
                                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString("ar-TN") : ""}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">لا توجد طلبات واردة بعد</p>
                          <p className="text-xs text-gray-400 mt-1">انشر وظيفة لاستقبال طلبات المعلمين</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Application Funnel */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        قمع التوظيف
                      </CardTitle>
                      <CardDescription>تتبع مسار الطلبات عبر المراحل</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <FunnelStep label="طلبات واردة" count={stats?.totalApplications || 0} total={stats?.totalApplications || 1} color="bg-blue-500" />
                        <FunnelStep label="تمت المشاهدة" count={(stats?.totalApplications || 0) - (stats?.pendingApplications || 0)} total={stats?.totalApplications || 1} color="bg-cyan-500" />
                        <FunnelStep label="القائمة القصيرة" count={stats?.shortlistedApplications || 0} total={stats?.totalApplications || 1} color="bg-amber-500" />
                        <FunnelStep label="مقابلات" count={stats?.interviewedApplications || 0} total={stats?.totalApplications || 1} color="bg-purple-500" />
                        <FunnelStep label="مقبولون" count={stats?.acceptedApplications || 0} total={stats?.totalApplications || 1} color="bg-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/school-portal">
                          <Card className="cursor-pointer hover:shadow-md transition-all border-0 bg-blue-50 group">
                            <CardContent className="py-4 flex items-center gap-3">
                              <Plus className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">نشر وظيفة</p>
                                <p className="text-xs text-gray-500">أضف فرصة عمل جديدة</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        <Link href="/talent-directory">
                          <Card className="cursor-pointer hover:shadow-md transition-all border-0 bg-emerald-50 group">
                            <CardContent className="py-4 flex items-center gap-3">
                              <Search className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">اكتشاف المواهب</p>
                                <p className="text-xs text-gray-500">ابحث عن معلمين مؤهلين</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        <Link href="/career-messages">
                          <Card className="cursor-pointer hover:shadow-md transition-all border-0 bg-purple-50 group">
                            <CardContent className="py-4 flex items-center gap-3">
                              <MessageSquare className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">الرسائل</p>
                                <p className="text-xs text-gray-500">تواصل مع المتقدمين</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        <Link href="/school-portal">
                          <Card className="cursor-pointer hover:shadow-md transition-all border-0 bg-amber-50 group">
                            <CardContent className="py-4 flex items-center gap-3">
                              <Building2 className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">ملف المدرسة</p>
                                <p className="text-xs text-gray-500">تعديل معلومات المدرسة</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Jobs Tab */}
              <TabsContent value="jobs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">الوظائف المنشورة</h3>
                  <Link href="/school-portal">
                    <Button className="gap-2" size="sm">
                      <Plus className="w-4 h-4" />
                      نشر وظيفة جديدة
                    </Button>
                  </Link>
                </div>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job: any) => {
                      const jobApps = applications.filter((a: any) => a.jobPostingId === job.id);
                      return (
                        <Card key={job.id} className="border-0 shadow-sm">
                          <CardContent className="py-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                  {job.isActive ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">نشطة</Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">مغلقة</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {job.subject && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {job.subject}
                                    </span>
                                  )}
                                  {job.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {job.location}
                                    </span>
                                  )}
                                  {job.createdAt && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(job.createdAt).toLocaleDateString("ar-TN")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-blue-600">{jobApps.length}</p>
                                  <p className="text-xs text-gray-500">طلب</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-emerald-600">
                                    {jobApps.filter((a: any) => a.status === "accepted").length}
                                  </p>
                                  <p className="text-xs text-gray-500">مقبول</p>
                                </div>
                              </div>
                            </div>
                            {jobApps.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                  {jobApps.slice(0, 5).map((app: any) => {
                                    const si = APP_STATUS_MAP[app.status] || APP_STATUS_MAP.sent;
                                    return (
                                      <Badge key={app.id} variant={si.variant} className="text-xs gap-1">
                                        {app.teacherName} — {si.label}
                                      </Badge>
                                    );
                                  })}
                                  {jobApps.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">+{jobApps.length - 5} آخرين</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لم تنشر أي وظيفة بعد</p>
                      <Link href="/school-portal">
                        <Button className="mt-4 gap-2">
                          <Plus className="w-4 h-4" />
                          نشر أول وظيفة
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">جميع الطلبات</h3>
                  <span className="text-sm text-gray-500">{applications.length} طلب إجمالي</span>
                </div>
                {applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((app: any) => {
                      const si = APP_STATUS_MAP[app.status] || APP_STATUS_MAP.sent;
                      return (
                        <Card key={app.id} className="border-0 shadow-sm">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{app.teacherName}</p>
                                  <p className="text-xs text-gray-500">{app.jobTitle}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={si.variant}>{si.label}</Badge>
                                <span className="text-xs text-gray-400">
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString("ar-TN") : ""}
                                </span>
                              </div>
                            </div>
                            {app.coverLetter && (
                              <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-2">{app.coverLetter}</p>
                            )}
                            {app.matchScore && (
                              <div className="mt-2 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-gray-500">نسبة التوافق: {app.matchScore}%</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لا توجد طلبات واردة</p>
                      <p className="text-xs text-gray-400 mt-1">انشر وظائف لاستقبال طلبات المعلمين</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Talent Discovery Tab */}
              <TabsContent value="talent">
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">اكتشف المعلمين المؤهلين</h3>
                    <p className="text-gray-500 mb-6">تصفح دليل المواهب للعثور على أفضل المعلمين لمدرستك</p>
                    <Link href="/talent-directory">
                      <Button className="gap-2">
                        <Search className="w-4 h-4" />
                        تصفح دليل المواهب
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function KPICard({ icon: Icon, label, value, subLabel, color }: {
  icon: LucideIcon; label: string; value: number; subLabel: string; color: string;
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
        <p className="text-xs text-gray-400 mt-2">{subLabel}</p>
      </CardContent>
    </Card>
  );
}

function FunnelStep({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm text-gray-600 text-start">{label}</div>
      <div className="flex-1">
        <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">{count}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 w-10 text-start">{pct}%</span>
    </div>
  );
}
