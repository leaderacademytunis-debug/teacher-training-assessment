import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BarChart3, Eye, Download, Zap, MousePointer, TrendingUp, ClipboardList, Send, Star, ArrowRight, Calendar } from "lucide-react";
import { Link } from "wouter";
import useI18n from "@/i18n";


function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-500">{d.count}</span>
          <div
            className="w-full bg-blue-500 rounded-t transition-all"
            style={{ height: `${Math.max((d.count / maxCount) * 80, 4)}px` }}
          />
          <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function TeacherAnalytics() {
  const { t, lang, isRTL, dir } = useI18n();
  const [activeTab, setActiveTab] = useState("stats");
  const [responseTaskId, setResponseTaskId] = useState<number | null>(null);
  const [responseContent, setResponseContent] = useState("");

  const stats = trpc.profileStats.getMyStats.useQuery();
  const tasks = trpc.digitalAudition.getMyTasks.useQuery();
  const utils = trpc.useUtils();

  const submitResponseMutation = trpc.digitalAudition.submitResponse.useMutation({
    onSuccess: () => {
      toast.success("تم تقديم الرد بنجاح");
      setResponseTaskId(null);
      setResponseContent("");
      utils.digitalAudition.getMyTasks.invalidate();
    },
    onError: () => toast.error("حدث خطأ أثناء تقديم الرد"),
  });

  const taskStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">في الانتظار</Badge>;
      case "submitted": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">تم التقديم</Badge>;
      case "reviewed": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">تمت المراجعة</Badge>;
      case "expired": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">منتهية</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const taskTypeName = (type: string) => {
    switch (type) {
      case "lesson_plan": return "خطة درس";
      case "exam": return "اختبار";
      case "drama_script": return "سيناريو مسرحي";
      case "free_form": return "مهمة حرة";
      default: return type;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              تحليلات ملفي المهني
            </h1>
            <p className="text-slate-500 mt-1">أداء ملفك المهني والمهام الرقمية</p>
          </div>
          <Link href="/portfolio">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              ملفي المهني
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              المهام الرقمية ({tasks.data?.filter((t: any) => t.status === 'pending').length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Performance Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-white border-blue-100">
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{stats.data?.totalViews || 0}</p>
                  <p className="text-xs text-slate-500">إجمالي الزيارات</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-indigo-100">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-indigo-700">{stats.data?.weeklyViews || 0}</p>
                  <p className="text-xs text-slate-500">زيارات هذا الأسبوع</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-cyan-100">
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-cyan-700">{stats.data?.dailyViews || 0}</p>
                  <p className="text-xs text-slate-500">زيارات اليوم</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-emerald-100">
                <CardContent className="p-4 text-center">
                  <Download className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-700">{stats.data?.cvDownloads || 0}</p>
                  <p className="text-xs text-slate-500">تحميل السيرة</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-amber-100">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-700">{stats.data?.smartMatches || 0}</p>
                  <p className="text-xs text-slate-500">مطابقات ذكية</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-purple-100">
                <CardContent className="p-4 text-center">
                  <MousePointer className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{stats.data?.contactClicks || 0}</p>
                  <p className="text-xs text-slate-500">طلبات تواصل</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Views Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  زيارات الملف المهني - آخر 7 أيام
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.data?.viewsByDay && stats.data.viewsByDay.length > 0 ? (
                  <MiniBarChart data={stats.data.viewsByDay} />
                ) : (
                  <p className="text-center text-slate-400 py-8">لا توجد بيانات بعد</p>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-l from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-blue-800 mb-3">نصائح لتحسين ظهورك</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    أكمل جميع أقسام ملفك المهني لزيادة فرص الظهور في المطابقات الذكية
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    أضف عينات ذهبية من أعمالك لجذب اهتمام المدارس
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    حافظ على تحديث مهاراتك ونتائج التقييمات بانتظام
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    استجب بسرعة للمهام الرقمية لتحسين فرصك في التوظيف
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {tasks.data?.length === 0 && (
              <Card className="bg-white">
                <CardContent className="p-8 text-center text-slate-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg">لا توجد مهام رقمية حالياً</p>
                  <p className="text-sm mt-1">ستظهر المهام عندما ترسل لك مدرسة طلب اختبار</p>
                </CardContent>
              </Card>
            )}
            {tasks.data?.map((task: any) => (
              <Card key={task.id} className={`bg-white hover:shadow-md transition-shadow ${task.status === 'pending' ? 'border-amber-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ClipboardList className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                        {taskStatusBadge(task.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="text-blue-600">الموضوع: {task.topic}</Badge>
                        <Badge variant="outline" className="text-purple-600">النوع: {taskTypeName(task.taskType)}</Badge>
                        <Badge variant="outline" className="text-slate-600">المدرسة: {task.school?.schoolName || '-'}</Badge>
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                          <Calendar className="w-4 h-4" />
                          <span>الموعد النهائي: {new Date(task.deadline).toLocaleDateString('ar-TN')}</span>
                        </div>
                      )}
                      {/* School Feedback */}
                      {task.status === 'reviewed' && task.schoolFeedback && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm font-medium text-emerald-800 mb-1">تقييم المدرسة:</p>
                          <div className="flex items-center gap-1 mb-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= (task.schoolRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-emerald-700">{task.schoolFeedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col gap-2">
                      {task.status === 'pending' && (
                        <>
                          {responseTaskId === task.id ? (
                            <div className="space-y-2 w-full md:w-72">
                              <Textarea
                                value={responseContent}
                                onChange={(e) => setResponseContent(e.target.value)}
                                placeholder="اكتب ردك على المهمة... يمكنك أيضاً استخدام المساعد لتوليد المحتوى"
                                className="min-h-[100px] text-end"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => submitResponseMutation.mutate({ taskId: task.id, responseContent })}
                                  disabled={!responseContent.trim() || submitResponseMutation.isPending}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                                >
                                  <Send className="w-4 h-4" />
                                  إرسال الرد
                                </Button>
                                <Button variant="outline" onClick={() => { setResponseTaskId(null); setResponseContent(""); }}>
                                  إلغاء
                                </Button>
                              </div>
                              <Link href="/assistant">
                                <Button variant="outline" className="w-full text-blue-600 gap-2">
                                  <Zap className="w-4 h-4" />
                                  استخدم المساعد لتوليد المحتوى
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <Button onClick={() => setResponseTaskId(task.id)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                              <Send className="w-4 h-4" />
                              الرد على المهمة
                            </Button>
                          )}
                        </>
                      )}
                      {task.status === 'submitted' && (
                        <Badge className="bg-blue-100 text-blue-700 px-4 py-2">في انتظار مراجعة المدرسة</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
