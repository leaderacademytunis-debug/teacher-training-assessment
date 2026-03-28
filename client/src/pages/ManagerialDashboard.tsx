import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Users, TrendingUp, Award, BookOpen, FileText,
  Star, Download, Eye, ArrowLeft, Activity, AlertTriangle,
  Loader2, Crown, Target, Layers
} from "lucide-react";
import useI18n from "@/i18n";


const ACTIVITY_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  lesson_plan: { label: "جذاذة درس", icon: "📝", color: "bg-blue-100 text-blue-800" },
  exam_generated: { label: "اختبار", icon: "📋", color: "bg-red-100 text-red-800" },
  evaluation: { label: "تقييم", icon: "✅", color: "bg-green-100 text-green-800" },
  image_generated: { label: "صورة", icon: "🎨", color: "bg-purple-100 text-purple-800" },
  inspection_report: { label: "تقرير تفقد", icon: "🔍", color: "bg-orange-100 text-orange-800" },
};

export default function ManagerialDashboard() {
  const { t, lang, isRTL, dir } = useI18n();
  const auth = useAuth();
  const user = auth.user;
  const authLoading = !auth.isAuthenticated && !user;
  const [activeTab, setActiveTab] = useState<"overview" | "teachers" | "gaps">("overview");

  const { data: dashboard, isLoading } = trpc.analytics.getDashboard.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: gapsData, isLoading: gapsLoading } = trpc.analytics.getPedagogicalGaps.useQuery(undefined, {
    enabled: !!user && activeTab === "gaps",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">لوحة التحكم الإدارية</h2>
            <p className="text-muted-foreground mb-6">يرجى تسجيل الدخول للوصول إلى التحليلات</p>
            <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              تسجيل الدخول
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/teacher-tools">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 ms-1" /> العودة</Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                  لوحة التحكم الإدارية
                </h1>
                <p className="text-sm text-muted-foreground">تحليلات شاملة لنشاط المؤسسة التعليمية</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Crown className="w-4 h-4 ms-1 text-amber-500" />
              {user.role === "admin" ? "مدير" : "مشرف"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "overview" as const, label: "نظرة عامة", icon: <Activity className="w-4 h-4" /> },
            { key: "teachers" as const, label: "المعلمون المتميزون", icon: <Award className="w-4 h-4" /> },
            { key: "gaps" as const, label: "الفجوات البيداغوجية", icon: <AlertTriangle className="w-4 h-4" /> },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key)}
              className="gap-2"
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="me-3 text-muted-foreground">جاري تحميل التحليلات...</span>
          </div>
        ) : dashboard ? (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
                          <p className="text-3xl font-bold mt-1">{dashboard.totalUsers}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm">إجمالي الأنشطة</p>
                          <p className="text-3xl font-bold mt-1">{dashboard.totalActivities}</p>
                        </div>
                        <Activity className="w-10 h-10 text-emerald-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">محتوى السوق الذهبي</p>
                          <p className="text-3xl font-bold mt-1">{dashboard.marketplaceStats.totalItems}</p>
                        </div>
                        <Layers className="w-10 h-10 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">إجمالي التحميلات</p>
                          <p className="text-3xl font-bold mt-1">{dashboard.marketplaceStats.totalDownloads}</p>
                        </div>
                        <Download className="w-10 h-10 text-amber-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Distribution & Top Subjects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        توزيع الأنشطة حسب النوع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(dashboard.activityTypeDistribution).map(([type, count]) => {
                          const info = ACTIVITY_TYPE_LABELS[type] || { label: type, icon: "📌", color: "bg-gray-100 text-gray-800" };
                          const maxCount = Math.max(...Object.values(dashboard.activityTypeDistribution));
                          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={type} className="flex items-center gap-3">
                              <span className="text-lg">{info.icon}</span>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">{info.label}</span>
                                  <span className="text-muted-foreground">{count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(dashboard.activityTypeDistribution).length === 0 && (
                          <p className="text-center text-muted-foreground py-4">لا توجد أنشطة بعد</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Subjects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        المواد الأكثر نشاطاً
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.topSubjects.map((item, i) => {
                          const maxCount = dashboard.topSubjects[0]?.count || 1;
                          const percentage = (item.count / maxCount) * 100;
                          return (
                            <div key={item.subject} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">{item.subject}</span>
                                  <span className="text-muted-foreground">{item.count} نشاط</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {dashboard.topSubjects.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">لا توجد بيانات بعد</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      آخر الأنشطة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-end py-2 px-3">المعلم</th>
                            <th className="text-end py-2 px-3">النوع</th>
                            <th className="text-end py-2 px-3">المادة</th>
                            <th className="text-end py-2 px-3">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.recentActivity.map((activity, i) => {
                            const info = ACTIVITY_TYPE_LABELS[activity.type] || { label: activity.type, icon: "📌", color: "bg-gray-100 text-gray-800" };
                            return (
                              <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50">
                                <td className="py-2 px-3 font-medium">{activity.userName}</td>
                                <td className="py-2 px-3">
                                  <Badge variant="secondary" className={`text-xs ${info.color}`}>
                                    {info.icon} {info.label}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 text-muted-foreground">{activity.subject || "—"}</td>
                                <td className="py-2 px-3 text-muted-foreground">
                                  {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("ar-TN") : "—"}
                                </td>
                              </tr>
                            );
                          })}
                          {dashboard.recentActivity.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد أنشطة حديثة</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === "teachers" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="w-5 h-5 text-amber-500" />
                      المعلمون المتميزون (حسب تقييمات السوق الذهبي)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.topTeachers.map((teacher, i) => (
                        <div key={teacher.userId} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-l from-amber-50/50 to-transparent border hover:shadow-sm transition">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-blue-500"
                          }`}>
                            {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">{teacher.name}</p>
                            {teacher.school && <p className="text-sm text-muted-foreground">{teacher.school}</p>}
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-amber-500" />
                                <span className="font-bold">{teacher.avgRating.toFixed(1)}</span>
                              </div>
                              <p className="text-muted-foreground text-xs">التقييم</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-blue-600">{teacher.totalItems}</p>
                              <p className="text-muted-foreground text-xs">محتوى</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-emerald-600">{teacher.totalDownloads}</p>
                              <p className="text-muted-foreground text-xs">تحميل</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dashboard.topTeachers.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">لا يوجد معلمون متميزون بعد. شجع المعلمين على نشر محتواهم في السوق الذهبي!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Activity Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      نشاط المعلمين (الأكثر إنتاجية)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-end py-2 px-3">#</th>
                            <th className="text-end py-2 px-3">المعلم</th>
                            <th className="text-end py-2 px-3">إجمالي الأنشطة</th>
                            <th className="text-end py-2 px-3">جذاذات</th>
                            <th className="text-end py-2 px-3">اختبارات</th>
                            <th className="text-end py-2 px-3">تقييمات</th>
                            <th className="text-end py-2 px-3">صور</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.userActivity.map((ua, i) => (
                            <tr key={ua.userId} className="border-b last:border-0 hover:bg-gray-50/50">
                              <td className="py-2 px-3 font-bold text-muted-foreground">{i + 1}</td>
                              <td className="py-2 px-3 font-medium">{ua.name}</td>
                              <td className="py-2 px-3">
                                <Badge variant="secondary">{ua.totalActivities}</Badge>
                              </td>
                              <td className="py-2 px-3">{ua.types.lesson_plan || 0}</td>
                              <td className="py-2 px-3">{ua.types.exam_generated || 0}</td>
                              <td className="py-2 px-3">{ua.types.evaluation || 0}</td>
                              <td className="py-2 px-3">{ua.types.image_generated || 0}</td>
                            </tr>
                          ))}
                          {dashboard.userActivity.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد بيانات نشاط بعد</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Gaps Tab */}
            {activeTab === "gaps" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      الفجوات البيداغوجية المشتركة
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      تحليل مجمّع من تقارير المتفقد الذكي - المواد ذات أدنى متوسط تقييم AI
                    </p>
                  </CardHeader>
                  <CardContent>
                    {gapsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : gapsData?.gaps && gapsData.gaps.length > 0 ? (
                      <div className="space-y-4">
                        {gapsData.gaps.map((gap, i) => (
                          <div key={gap.subject} className="p-4 rounded-xl border hover:shadow-sm transition">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  gap.avgScore < 50 ? "bg-red-500" : gap.avgScore < 70 ? "bg-orange-500" : "bg-green-500"
                                }`}>
                                  {i + 1}
                                </span>
                                <div>
                                  <p className="font-bold">{gap.subject}</p>
                                  <p className="text-xs text-muted-foreground">{gap.itemCount} محتوى تم تحليله</p>
                                </div>
                              </div>
                              <div className="text-start">
                                <p className={`text-2xl font-bold ${
                                  gap.avgScore < 50 ? "text-red-600" : gap.avgScore < 70 ? "text-orange-600" : "text-green-600"
                                }`}>
                                  {gap.avgScore}%
                                </p>
                                <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  gap.avgScore < 50 ? "bg-red-500" : gap.avgScore < 70 ? "bg-orange-500" : "bg-green-500"
                                }`}
                                style={{ width: `${gap.avgScore}%` }}
                              />
                            </div>
                            {gap.grades.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {gap.grades.slice(0, 5).map(g => (
                                  <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">لا توجد بيانات كافية لتحليل الفجوات البيداغوجية بعد.</p>
                        <p className="text-sm text-muted-foreground mt-1">شجع المعلمين على استخدام المتفقد الذكي لتحليل محتواهم.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">فشل تحميل التحليلات. يرجى المحاولة مرة أخرى.</p>
          </div>
        )}
      </div>
    </div>
  );
}
