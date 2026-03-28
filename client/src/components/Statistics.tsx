import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, Award, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Statistics() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: exams } = trpc.exams.listByCourse.useQuery(
    { courseId: parseInt(selectedCourse) },
    { enabled: !!selectedCourse }
  );
  const { data: courseStats } = trpc.courses.getStatistics.useQuery(
    { courseId: parseInt(selectedCourse) },
    { enabled: !!selectedCourse }
  );
  const { data: examStats } = trpc.exams.getStatistics.useQuery(
    { examId: parseInt(selectedExam) },
    { enabled: !!selectedExam }
  );
  const { data: attempts } = trpc.examAttempts.listByExam.useQuery(
    { examId: parseInt(selectedExam) },
    { enabled: !!selectedExam }
  );

  const passFailData = examStats ? [
    { name: "ناجح", value: Math.round((examStats.passRate / 100) * examStats.totalAttempts) },
    { name: "راسب", value: examStats.totalAttempts - Math.round((examStats.passRate / 100) * examStats.totalAttempts) },
  ] : [];

  const scoreDistribution = attempts
    ? attempts.reduce((acc: any[], { attempt }) => {
        if (attempt.status === "graded" && attempt.score !== null) {
          const range = Math.floor(attempt.score / 10) * 10;
          const existing = acc.find(item => item.range === `${range}-${range + 9}%`);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ range: `${range}-${range + 9}%`, count: 1 });
          }
        }
        return acc;
      }, [])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الإحصائيات والتقارير</h2>
        <p className="text-gray-600">عرض تفصيلي لأداء المشاركين ونتائج الاختبارات</p>
      </div>

      {/* Course and Exam Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>اختر الدورة</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={(value) => {
              setSelectedCourse(value);
              setSelectedExam("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدورة" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.titleAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourse && exams && exams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>اختر الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الاختبار" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.titleAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Statistics */}
      {selectedCourse && courseStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المسجلين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseStats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                عدد المشاركين في الدورة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المكملين</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseStats.completedEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                عدد من أكملوا الدورة
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam Statistics */}
      {selectedExam && examStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المحاولات</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examStats.totalAttempts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المتوسط</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examStats.averageScore.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">أعلى درجة</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{examStats.highestScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{examStats.passRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pass/Fail Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>نسبة النجاح والرسوب</CardTitle>
                <CardDescription>توزيع النتائج بين الناجحين والراسبين</CardDescription>
              </CardHeader>
              <CardContent>
                {passFailData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {passFailData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    لا توجد بيانات كافية
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الدرجات</CardTitle>
                <CardDescription>عدد المشاركين في كل نطاق درجات</CardDescription>
              </CardHeader>
              <CardContent>
                {scoreDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="عدد المشاركين" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    لا توجد بيانات كافية
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Attempts Table */}
          <Card>
            <CardHeader>
              <CardTitle>آخر المحاولات</CardTitle>
              <CardDescription>قائمة بأحدث محاولات الاختبار</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts && attempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-end">
                        <th className="pb-3 font-semibold">المشارك</th>
                        <th className="pb-3 font-semibold">الدرجة</th>
                        <th className="pb-3 font-semibold">الحالة</th>
                        <th className="pb-3 font-semibold">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.slice(0, 10).map(({ attempt, user }) => (
                        <tr key={attempt.id} className="border-b">
                          <td className="py-3">{user?.name || "غير معروف"}</td>
                          <td className="py-3">
                            <span className={`font-semibold ${attempt.passed ? "text-green-600" : "text-red-600"}`}>
                              {attempt.score}%
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              attempt.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {attempt.passed ? "ناجح" : "راسب"}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(attempt.startedAt).toLocaleDateString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد محاولات بعد
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">اختر دورة لعرض الإحصائيات</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
