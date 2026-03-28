import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Users, BookOpen, TrendingUp, Award, Download, ArrowRight, ChevronDown, ChevronUp, FileText, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts";
import useI18n from "@/i18n";


const GRADE_COLORS: Record<string, string> = {
  excellent: "#16a34a",
  good: "#3b82f6",
  acceptable: "#f59e0b",
  needsImprovement: "#f97316",
  insufficient: "#ef4444",
};

const GRADE_LABELS: Record<string, string> = {
  excellent: "ممتاز",
  good: "جيد",
  acceptable: "مقبول",
  needsImprovement: "يحتاج تحسين",
  insufficient: "غير كافي",
};

interface BatchStatsDashboardProps {
  batchId: number;
  onGenerateReport?: (userId: number) => void;
}

export default function BatchStatsDashboard({ batchId, onGenerateReport }: BatchStatsDashboardProps) {
  const { t, lang, isRTL, dir } = useI18n();
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const statsQuery = trpc.batchStats.getStats.useQuery({ batchId }, { enabled: !!batchId });
  const exportMutation = trpc.excelExport.batchStats.useMutation();

  const stats = statsQuery.data;

  // Chart data
  const completionChartData = useMemo(() => {
    if (!stats?.assignmentStats) return [];
    return stats.assignmentStats.map((a: any) => ({
      name: a.title.length > 20 ? a.title.slice(0, 20) + "..." : a.title,
      fullName: a.title,
      "نسبة الإنجاز": a.completionRate,
      "معدل العلامة": a.avgScore,
    }));
  }, [stats]);

  const gradeDistributionData = useMemo(() => {
    if (!stats?.assignmentStats) return [];
    const totals = { excellent: 0, good: 0, acceptable: 0, needsImprovement: 0, insufficient: 0 };
    stats.assignmentStats.forEach((a: any) => {
      totals.excellent += a.distribution.excellent;
      totals.good += a.distribution.good;
      totals.acceptable += a.distribution.acceptable;
      totals.needsImprovement += a.distribution.needsImprovement;
      totals.insufficient += a.distribution.insufficient;
    });
    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: GRADE_LABELS[key],
        value,
        color: GRADE_COLORS[key],
      }));
  }, [stats]);

  const memberRankingData = useMemo(() => {
    if (!stats?.memberProgress) return [];
    return [...stats.memberProgress]
      .sort((a: any, b: any) => b.avgScore - a.avgScore)
      .slice(0, 10)
      .map((m: any) => ({
        name: m.name.length > 15 ? m.name.slice(0, 15) + "..." : m.name,
        fullName: m.name,
        "المعدل": m.avgScore,
        "الإنجاز": m.completionPct,
      }));
  }, [stats]);

  if (statsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>لا توجد بيانات إحصائية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              const result = await exportMutation.mutateAsync({ batchId });
              if (result.url) {
                const a = document.createElement('a');
                a.href = result.url;
                a.download = result.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            } catch (e) {
              console.error('Export failed:', e);
            } finally {
              setExporting(false);
            }
          }}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {exporting ? 'جاري التصدير...' : 'تصدير Excel'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">{stats.memberCount}</div>
            <div className="text-xs text-blue-600">الأعضاء</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-700">{stats.assignmentCount}</div>
            <div className="text-xs text-purple-600">الواجبات</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">{stats.overallAvg}%</div>
            <div className="text-xs text-green-600">المعدل العام</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">{stats.overallCompletion}%</div>
            <div className="text-xs text-amber-600">نسبة الإنجاز</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {completionChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignment Completion & Scores Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                الإنجاز والمعدلات حسب الواجب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={completionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ direction: "rtl", fontFamily: "inherit" }}
                    formatter={(value: any, name: string) => [`${value}%`, name]}
                    labelFormatter={(label: any) => {
                      const item = completionChartData.find((d: any) => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="نسبة الإنجاز" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="معدل العلامة" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grade Distribution Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                توزيع التقديرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {gradeDistributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} تسليم`, "العدد"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                  لا توجد تقييمات بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Member Ranking Chart */}
      {memberRankingData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              ترتيب المشاركين حسب المعدل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberRankingData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ direction: "rtl", fontFamily: "inherit" }}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                  labelFormatter={(label: any) => {
                    const item = memberRankingData.find((d: any) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="المعدل" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الإنجاز" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-Assignment Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            تفاصيل الواجبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-end p-3 font-medium">الواجب</th>
                  <th className="text-center p-3 font-medium">النوع</th>
                  <th className="text-center p-3 font-medium">التسليمات</th>
                  <th className="text-center p-3 font-medium">المقيّمة</th>
                  <th className="text-center p-3 font-medium">الإنجاز</th>
                  <th className="text-center p-3 font-medium">المعدل</th>
                  <th className="text-center p-3 font-medium">أعلى</th>
                  <th className="text-center p-3 font-medium">أدنى</th>
                </tr>
              </thead>
              <tbody>
                {stats.assignmentStats.map((a: any) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{a.title}</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="text-xs">
                        {a.type === "lesson_plan" ? "جذاذة" : a.type === "exam" ? "اختبار" : a.type === "evaluation" ? "تقييم" : "حر"}
                      </Badge>
                    </td>
                    <td className="text-center p-3">{a.submitted}/{stats.memberCount}</td>
                    <td className="text-center p-3">{a.graded}</td>
                    <td className="text-center p-3">
                      <span className={`font-bold ${a.completionRate >= 80 ? "text-green-600" : a.completionRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {a.completionRate}%
                      </span>
                    </td>
                    <td className="text-center p-3 font-bold">{a.avgScore || "—"}</td>
                    <td className="text-center p-3 text-green-600">{a.maxScoreVal || "—"}</td>
                    <td className="text-center p-3 text-red-600">{a.minScoreVal || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Member Progress Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            تقدم المشاركين
          </CardTitle>
          <CardDescription>انقر على اسم المشارك لعرض التفاصيل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.memberProgress.map((member: any) => (
              <div key={member.userId} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedMember(expandedMember === member.userId ? null : member.userId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-700">{member.avgScore}%</div>
                      <div className="text-xs text-gray-500">المعدل</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-700">{member.completionPct}%</div>
                      <div className="text-xs text-gray-500">الإنجاز</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold">{member.completedAssignments}/{member.totalAssignments}</div>
                      <div className="text-xs text-gray-500">واجبات</div>
                    </div>
                    {onGenerateReport && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onGenerateReport(member.userId); }}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 ms-1" />
                        تقرير PDF
                      </Button>
                    )}
                    {expandedMember === member.userId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                {expandedMember === member.userId && (
                  <div className="border-t bg-gray-50 p-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${member.completionPct}%`,
                          backgroundColor: member.completionPct >= 80 ? "#16a34a" : member.completionPct >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {member.submissions.map((sub: any) => {
                        const assignment = stats.assignmentStats.find((a: any) => a.id === sub.assignmentId);
                        return (
                          <div key={sub.id} className="p-2 bg-white rounded border text-xs">
                            <div className="font-medium truncate">{assignment?.title || `واجب #${sub.assignmentId}`}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[10px] ${sub.status === 'graded' ? 'bg-green-50 text-green-700' : sub.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'}`}>
                                {sub.status === 'graded' ? 'مُقيّم' : sub.status === 'submitted' ? 'مُسلّم' : sub.status === 'returned' ? 'مُعاد' : sub.status}
                              </Badge>
                              {sub.aiScore !== null && (
                                <span className="font-bold text-green-700">{sub.aiScore}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
