import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Users, BookOpen, TrendingUp, Award, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useLocation } from "wouter";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

export default function BatchComparison() {
  const [, navigate] = useLocation();
  const comparisonQuery = trpc.batchComparison.getAll.useQuery();

  const data = comparisonQuery.data || [];

  const completionChartData = useMemo(() => {
    return data.map((b: any) => ({
      name: b.name.length > 20 ? b.name.slice(0, 20) + "..." : b.name,
      fullName: b.name,
      "نسبة الإنجاز": b.overallCompletion,
      "المعدل العام": b.overallAvg,
    }));
  }, [data]);

  const memberChartData = useMemo(() => {
    return data.map((b: any) => ({
      name: b.name.length > 20 ? b.name.slice(0, 20) + "..." : b.name,
      fullName: b.name,
      "الأعضاء": b.memberCount,
      "الواجبات": b.assignmentCount,
      "التسليمات": b.totalSubmissions,
      "المقيّمة": b.totalGraded,
    }));
  }, [data]);

  const radarData = useMemo(() => {
    if (data.length === 0) return [];
    return data.slice(0, 5).map((b: any) => ({
      name: b.name.length > 15 ? b.name.slice(0, 15) + "..." : b.name,
      "الإنجاز": b.overallCompletion,
      "المعدل": b.overallAvg,
      "التسليمات": Math.min(100, b.totalSubmissions * 10),
    }));
  }, [data]);

  if (comparisonQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">لا توجد دفعات للمقارنة</p>
        <p className="text-sm mt-2">أنشئ دفعات وأضف واجبات لتتمكن من مقارنة الأداء</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            مقارنة أداء الدفعات
          </h2>
          <p className="text-sm text-gray-500 mt-1">مقارنة شاملة بين جميع الدفعات التدريبية</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/batches")} className="gap-1">
          <ArrowRight className="h-4 w-4" />
          العودة للدفعات
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">{data.length}</div>
            <div className="text-xs text-blue-600">إجمالي الدفعات</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-700">{data.reduce((s: number, b: any) => s + b.memberCount, 0)}</div>
            <div className="text-xs text-purple-600">إجمالي المشاركين</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">
              {data.length > 0 ? Math.round(data.reduce((s: number, b: any) => s + b.overallAvg, 0) / data.length) : 0}%
            </div>
            <div className="text-xs text-green-600">متوسط المعدل العام</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">
              {data.length > 0 ? Math.round(data.reduce((s: number, b: any) => s + b.overallCompletion, 0) / data.length) : 0}%
            </div>
            <div className="text-xs text-amber-600">متوسط نسبة الإنجاز</div>
          </CardContent>
        </Card>
      </div>

      {/* Completion & Average Chart */}
      {completionChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              نسبة الإنجاز والمعدل العام لكل دفعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={completionChartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ direction: "rtl", fontFamily: "inherit" }}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                  labelFormatter={(label: any) => {
                    const item = completionChartData.find((d: any) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="نسبة الإنجاز" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="المعدل العام" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Members & Assignments Chart */}
      {memberChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              الأعضاء والواجبات والتسليمات لكل دفعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={memberChartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ direction: "rtl", fontFamily: "inherit" }}
                  labelFormatter={(label: any) => {
                    const item = memberChartData.find((d: any) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="الأعضاء" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الواجبات" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="التسليمات" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="المقيّمة" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            جدول المقارنة التفصيلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-3 font-medium">الدفعة</th>
                  <th className="text-center p-3 font-medium">الأعضاء</th>
                  <th className="text-center p-3 font-medium">الواجبات</th>
                  <th className="text-center p-3 font-medium">التسليمات</th>
                  <th className="text-center p-3 font-medium">المقيّمة</th>
                  <th className="text-center p-3 font-medium">نسبة الإنجاز</th>
                  <th className="text-center p-3 font-medium">المعدل العام</th>
                  <th className="text-center p-3 font-medium">الترتيب</th>
                </tr>
              </thead>
              <tbody>
                {[...data]
                  .sort((a: any, b: any) => b.overallAvg - a.overallAvg)
                  .map((b: any, index: number) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{b.name}</td>
                    <td className="text-center p-3">{b.memberCount}</td>
                    <td className="text-center p-3">{b.assignmentCount}</td>
                    <td className="text-center p-3">{b.totalSubmissions}</td>
                    <td className="text-center p-3">{b.totalGraded}</td>
                    <td className="text-center p-3">
                      <Badge variant={b.overallCompletion >= 75 ? "default" : b.overallCompletion >= 50 ? "secondary" : "destructive"} className="text-xs">
                        {b.overallCompletion}%
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant={b.overallAvg >= 75 ? "default" : b.overallAvg >= 50 ? "secondary" : "destructive"} className="text-xs">
                        {b.overallAvg}%
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-100 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
