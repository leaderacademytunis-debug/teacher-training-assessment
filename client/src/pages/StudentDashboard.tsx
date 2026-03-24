import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowLeft, Users, FileText, Activity, Award, BarChart3, Loader2,
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock,
  GraduationCap, Brain, Target, Eye,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const DIFFICULTY_TYPE_LABELS: Record<string, string> = {
  dyslexia: "عسر القراءة", dysgraphia: "عسر الكتابة", dyscalculia: "عسر الحساب",
  dysphasia: "عسر النطق", adhd: "فرط النشاط", asd: "طيف التوحد",
  slow_learning: "بطء التعلم", intellectual_disability: "إعاقة ذهنية",
};

const PROGRESS_LABELS: Record<string, { label: string; color: string }> = {
  significant_improvement: { label: "تحسن ملحوظ", color: "text-green-600" },
  moderate_improvement: { label: "تحسن متوسط", color: "text-emerald-600" },
  slight_improvement: { label: "تحسن طفيف", color: "text-lime-600" },
  stable: { label: "مستقر", color: "text-blue-600" },
  slight_decline: { label: "تراجع طفيف", color: "text-orange-600" },
  needs_attention: { label: "يحتاج اهتماماً", color: "text-red-600" },
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#eab308", "#14b8a6", "#ef4444", "#ec4899", "#6366f1"];

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const studentsQuery = trpc.studentDashboard.getStudents.useQuery(undefined, { enabled: !!user });
  const globalStatsQuery = trpc.studentDashboard.getGlobalStats.useQuery(undefined, { enabled: !!user });
  const studentDetailQuery = trpc.studentDashboard.getStudentDetail.useQuery(
    { studentName: selectedStudent! },
    { enabled: !!user && !!selectedStudent }
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لوحة متابعة التلاميذ</h2>
            <p className="text-gray-500 mb-4">يرجى تسجيل الدخول للوصول إلى لوحة المتابعة</p>
            <Button onClick={() => { window.location.href = getLoginUrl(); }}>تسجيل الدخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredStudents = studentsQuery.data?.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = globalStatsQuery.data;

  // ===== STUDENT DETAIL VIEW =====
  if (selectedStudent && studentDetailQuery.data) {
    const detail = studentDetailQuery.data;
    const completedReports = detail.reports.filter((r: any) => r.status === "completed");

    const scoreTrend = [...completedReports].reverse().map((r: any) => ({
      date: new Date(r.createdAt).toLocaleDateString("ar", { month: "short", day: "numeric" }),
      القراءة: r.readingScore || 0,
      الكتابة: r.writingScore || 0,
      الرياضيات: r.mathScore || 0,
      الانتباه: r.attentionScore || 0,
      التفاعل: r.socialScore || 0,
      الدافعية: r.motivationScore || 0,
    }));

    const latestReport = completedReports[0];
    const radarData = latestReport ? [
      { subject: "القراءة", score: latestReport.readingScore || 0, fullMark: 10 },
      { subject: "الكتابة", score: latestReport.writingScore || 0, fullMark: 10 },
      { subject: "الرياضيات", score: latestReport.mathScore || 0, fullMark: 10 },
      { subject: "الانتباه", score: latestReport.attentionScore || 0, fullMark: 10 },
      { subject: "التفاعل", score: latestReport.socialScore || 0, fullMark: 10 },
      { subject: "الدافعية", score: latestReport.motivationScore || 0, fullMark: 10 },
    ] : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى القائمة
          </Button>

          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{detail.studentName}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{detail.reports.length} تقرير</Badge>
                    <Badge variant="outline">{detail.evaluations.length} تقييم</Badge>
                    <Badge variant="outline">{detail.exercises.length} مجموعة تمارين</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {radarData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-indigo-600" />
                    الملف الشخصي الحالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Radar name="الدرجات" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {scoreTrend.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      تطور الدرجات عبر الزمن
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={scoreTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="القراءة" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="الكتابة" stroke="#8b5cf6" strokeWidth={2} />
                        <Line type="monotone" dataKey="الرياضيات" stroke="#f97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="الانتباه" stroke="#eab308" strokeWidth={2} />
                        <Line type="monotone" dataKey="التفاعل" stroke="#14b8a6" strokeWidth={2} />
                        <Line type="monotone" dataKey="الدافعية" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
                الجدول الزمني للأنشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail.timeline.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد أنشطة مسجلة بعد</p>
              ) : (
                <div className="space-y-4">
                  {detail.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === "report" ? "bg-amber-100" :
                        item.type === "evaluation" ? "bg-violet-100" : "bg-green-100"
                      }`}>
                        {item.type === "report" ? <FileText className="h-5 w-5 text-amber-600" /> :
                         item.type === "evaluation" ? <BarChart3 className="h-5 w-5 text-violet-600" /> :
                         <Award className="h-5 w-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.type === "report" ? "تقرير" : item.type === "evaluation" ? "تقييم" : "تمارين"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(item.date).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        {item.scores && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(item.scores).map(([key, val]: [string, any]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key === "reading" ? "القراءة" : key === "writing" ? "الكتابة" :
                                 key === "math" ? "الرياضيات" : key === "attention" ? "الانتباه" :
                                 key === "social" ? "التفاعل" : "الدافعية"}: {val}/10
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/follow-up-report">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-amber-200">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <h3 className="font-semibold">إنشاء تقرير متابعة</h3>
                  <p className="text-sm text-gray-500 mt-1">لهذا التلميذ</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/progress-evaluator">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-violet-200">
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 text-violet-600 mx-auto mb-2" />
                  <h3 className="font-semibold">تقييم التقدم</h3>
                  <p className="text-sm text-gray-500 mt-1">تحليل زمني جديد</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/therapeutic-exercises">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200">
                <CardContent className="pt-6 text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">تمارين علاجية</h3>
                  <p className="text-sm text-gray-500 mt-1">توليد تمارين جديدة</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN DASHBOARD VIEW =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/learning-support">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                لوحة متابعة التلاميذ
              </h1>
              <p className="text-gray-500 text-sm mt-1">متابعة شاملة لجميع التلاميذ ذوي الصعوبات</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-indigo-700">{stats.totalStudents}</div>
                <p className="text-sm text-indigo-600">تلميذ</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="pt-6 text-center">
                <FileText className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-amber-700">{stats.totalReports}</div>
                <p className="text-sm text-amber-600">تقرير متابعة</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-8 w-8 text-violet-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-violet-700">{stats.totalEvaluations}</div>
                <p className="text-sm text-violet-600">تقييم تقدم</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6 text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-700">{stats.totalExercises}</div>
                <p className="text-sm text-green-600">مجموعة تمارين</p>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && stats.difficultyDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-indigo-600" />
                توزيع أنواع الصعوبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.difficultyDistribution.map((d: any) => ({
                      name: DIFFICULTY_TYPE_LABELS[d.type] || d.type,
                      value: d.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.difficultyDistribution.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Input
            placeholder="البحث عن تلميذ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="secondary">{filteredStudents.length} تلميذ</Badge>
        </div>

        {studentsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">لا يوجد تلاميذ بعد</h3>
              <p className="text-gray-400 mt-2">ابدأ بإنشاء تقارير متابعة أو تقييمات لتظهر هنا</p>
              <div className="flex justify-center gap-3 mt-4">
                <Link href="/follow-up-report">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    تقرير متابعة
                  </Button>
                </Link>
                <Link href="/progress-evaluator">
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    تقييم التقدم
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student: any) => {
              const diffLabel = DIFFICULTY_TYPE_LABELS[student.difficultyType || ""] || student.difficultyType;
              const progressInfo = PROGRESS_LABELS[student.overallProgress || ""] || null;
              const avgScore = student.latestScores
                ? Math.round(
                    ((student.latestScores.reading || 0) + (student.latestScores.writing || 0) +
                     (student.latestScores.math || 0) + (student.latestScores.attention || 0) +
                     (student.latestScores.social || 0) + (student.latestScores.motivation || 0)) / 6 * 10
                  ) / 10
                : null;

              return (
                <Card
                  key={student.name}
                  className="hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-indigo-300"
                  onClick={() => setSelectedStudent(student.name)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{student.name}</h3>
                          {student.gradeLevel && (
                            <p className="text-sm text-gray-500">{student.gradeLevel}</p>
                          )}
                        </div>
                      </div>
                      {progressInfo && (
                        <Badge variant="outline" className={progressInfo.color}>
                          {progressInfo.label}
                        </Badge>
                      )}
                    </div>

                    {student.difficultyType && (
                      <Badge variant="secondary" className="mb-3">{diffLabel}</Badge>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-amber-50 rounded">
                        <div className="text-lg font-bold text-amber-700">{student.reportCount}</div>
                        <div className="text-xs text-amber-600">تقارير</div>
                      </div>
                      <div className="text-center p-2 bg-violet-50 rounded">
                        <div className="text-lg font-bold text-violet-700">{student.evalCount}</div>
                        <div className="text-xs text-violet-600">تقييمات</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-700">{student.exerciseCount}</div>
                        <div className="text-xs text-green-600">تمارين</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {avgScore !== null && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">المعدل: <span className="font-bold">{avgScore}/10</span></span>
                        </div>
                      )}
                      {student.progressPercentage != null && (
                        <Badge variant="outline" className="bg-violet-50 text-violet-700">
                          {student.progressPercentage}% تقدم
                        </Badge>
                      )}
                    </div>

                    {student.lastActivity && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        آخر نشاط: {new Date(student.lastActivity).toLocaleDateString("ar", { month: "short", day: "numeric" })}
                      </div>
                    )}

                    <Button variant="ghost" size="sm" className="w-full mt-3 gap-2 text-indigo-600">
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
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
