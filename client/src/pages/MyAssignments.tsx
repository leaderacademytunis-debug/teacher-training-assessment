import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, Clock, CheckCircle2, AlertCircle, Send, Eye, Loader2, FileText, Award, ArrowRight, BarChart3, Star, RefreshCw } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700", icon: FileText },
  submitted: { label: "تم التسليم", color: "bg-blue-100 text-blue-700", icon: Send },
  grading: { label: "جاري التقييم", color: "bg-amber-100 text-amber-700", icon: Loader2 },
  graded: { label: "تم التقييم", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  returned: { label: "مُعاد للمراجعة", color: "bg-red-100 text-red-700", icon: RefreshCw },
};

const GRADE_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  excellent: { label: "ممتاز", color: "text-green-600", emoji: "🌟" },
  good: { label: "جيد", color: "text-blue-600", emoji: "👍" },
  acceptable: { label: "مقبول", color: "text-amber-600", emoji: "📝" },
  needs_improvement: { label: "يحتاج تحسين", color: "text-orange-600", emoji: "📌" },
  insufficient: { label: "غير كافٍ", color: "text-red-600", emoji: "⚠️" },
};

export default function MyAssignments() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const assignmentsQuery = trpc.assignmentManager.myAssignments.useQuery(undefined, { enabled: !!user });
  const submissionQuery = trpc.assignmentManager.mySubmission.useQuery(
    { assignmentId: selectedAssignment?.id ?? 0 },
    { enabled: !!selectedAssignment }
  );

  const submitWork = trpc.assignmentManager.submitWork.useMutation({
    onSuccess: () => {
      toast.success("تم تسليم الواجب بنجاح");
      assignmentsQuery.refetch();
      submissionQuery.refetch();
      setShowSubmitDialog(false);
      setSubmissionContent("");
    },
    onError: (err) => { toast.error(err.message); },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" dir="rtl">
        <BookOpen className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-bold">يرجى تسجيل الدخول للوصول إلى واجباتك</h2>
        <a href={getLoginUrl()}><Button>تسجيل الدخول</Button></a>
      </div>
    );
  }

  const assignments = assignmentsQuery.data || [];
  const pendingCount = assignments.filter(a => !a.submission).length;
  const submittedCount = assignments.filter(a => a.submission?.status === "submitted" || a.submission?.status === "grading").length;
  const gradedCount = assignments.filter(a => a.submission?.status === "graded").length;
  const returnedCount = assignments.filter(a => a.submission?.status === "returned").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/"><Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">← الرئيسية</Button></Link>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8" />واجباتي
          </h1>
          <p className="text-emerald-100 mt-1">بوابة تسليم الواجبات والتقييم الآلي</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-emerald-100 text-sm">في الانتظار</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{submittedCount}</div>
              <div className="text-emerald-100 text-sm">تم التسليم</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{gradedCount}</div>
              <div className="text-emerald-100 text-sm">تم التقييم</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">{returnedCount}</div>
              <div className="text-emerald-100 text-sm">مُعاد للمراجعة</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {assignmentsQuery.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : assignments.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد واجبات حالياً</h3>
              <p className="text-gray-500 text-sm">ستظهر هنا الواجبات المطلوبة منك عند إضافتك إلى دفعة تدريبية</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: any) => {
              const status = assignment.submission ? STATUS_MAP[assignment.submission.status] : null;
              const grade = assignment.submission?.aiGrade ? GRADE_MAP[assignment.submission.aiGrade] : null;
              const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !assignment.submission;
              const canSubmit = !assignment.submission || assignment.submission.status === "returned" || assignment.submission.status === "draft";

              return (
                <Card key={assignment.id} className={`transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50/30" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Assignment Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: assignment.batchColor || "#10B981" }}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{assignment.title}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">{assignment.batchName}</Badge>
                              <Badge variant="outline" className="text-xs">
                                {assignment.type === "lesson_plan" ? "جذاذة درس" : assignment.type === "exam" ? "اختبار" : assignment.type === "evaluation" ? "تقييم" : "حر"}
                              </Badge>
                              <span className="text-xs text-gray-500">العلامة: {assignment.maxScore}</span>
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{assignment.description}</p>
                            )}
                            {assignment.dueDate && (
                              <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                                <Clock className="h-3 w-3" />
                                {isOverdue ? "انتهى الأجل: " : "آخر أجل: "}
                                {new Date(assignment.dueDate).toLocaleDateString("ar-TN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        {status ? (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                            <status.icon className={`h-4 w-4 ${assignment.submission.status === "grading" ? "animate-spin" : ""}`} />
                            {status.label}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                            <AlertCircle className="h-4 w-4" />
                            لم يُسلّم بعد
                          </div>
                        )}

                        {/* Score display */}
                        {assignment.submission?.status === "graded" && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">{assignment.submission.aiScore}/{assignment.maxScore}</div>
                            {grade && (
                              <div className={`text-sm font-medium ${grade.color}`}>{grade.emoji} {grade.label}</div>
                            )}
                            {assignment.submission.masteryScore != null && (
                              <div className="text-xs text-gray-500 mt-1">درجة الإتقان: {assignment.submission.masteryScore}%</div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {canSubmit && (
                            <Dialog open={showSubmitDialog && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                              setShowSubmitDialog(open);
                              if (open) { setSelectedAssignment(assignment); setSubmissionContent(""); }
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                  <Send className="h-4 w-4 ml-1" />
                                  {assignment.submission?.status === "returned" ? "إعادة التسليم" : "تسليم"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent dir="rtl" className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>تسليم: {assignment.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  {assignment.submission?.status === "returned" && assignment.submission?.aiFeedback && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4" />ملاحظات المراجعة السابقة:</h4>
                                      <p className="text-sm text-amber-700">{assignment.submission.aiFeedback}</p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">المحتوى المقدم</label>
                                    <p className="text-xs text-gray-500 mb-2">
                                      {assignment.type === "lesson_plan" ? "الصق هنا جذاذة الدرس المُعدّة" : assignment.type === "exam" ? "الصق هنا الاختبار المُعدّ" : "اكتب إجابتك هنا"}
                                    </p>
                                    <Textarea className="min-h-[300px] font-mono text-sm" placeholder="الصق محتوى عملك هنا..." value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} dir="rtl" />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                                  <Button onClick={() => submitWork.mutate({ assignmentId: assignment.id, content: submissionContent })} disabled={!submissionContent.trim() || submitWork.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                                    {submitWork.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Send className="h-4 w-4 ml-2" />}
                                    تسليم للتقييم
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}

                          {assignment.submission?.status === "graded" && (
                            <Dialog open={showFeedbackDialog && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                              setShowFeedbackDialog(open);
                              if (open) setSelectedAssignment(assignment);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><Eye className="h-4 w-4 ml-1" />عرض التقييم</Button>
                              </DialogTrigger>
                              <DialogContent dir="rtl" className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-emerald-600" />نتيجة التقييم</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  {/* Score Summary */}
                                  <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-xl p-6 text-center">
                                    <div className="text-4xl font-bold text-emerald-600">{assignment.submission.aiScore}/{assignment.maxScore}</div>
                                    {grade && (
                                      <div className={`text-lg font-medium mt-1 ${grade.color}`}>{grade.emoji} {grade.label}</div>
                                    )}
                                    {assignment.submission.masteryScore != null && (
                                      <div className="mt-2">
                                        <div className="text-sm text-gray-600">درجة الإتقان</div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mt-1 max-w-xs mx-auto">
                                          <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${assignment.submission.masteryScore}%` }} />
                                        </div>
                                        <div className="text-sm font-medium mt-1">{assignment.submission.masteryScore}%</div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Feedback */}
                                  {assignment.submission.aiFeedback && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2"><Star className="h-4 w-4" />تعليق المفتش الآلي</h4>
                                      <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-wrap">{assignment.submission.aiFeedback}</p>
                                    </div>
                                  )}

                                  {/* Rubric Scores */}
                                  {assignment.submission.aiRubricScores && Array.isArray(assignment.submission.aiRubricScores) && (
                                    <div>
                                      <h4 className="font-medium mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" />تفصيل المعايير</h4>
                                      <div className="space-y-3">
                                        {(assignment.submission.aiRubricScores as any[]).map((r: any, i: number) => (
                                          <div key={i} className="border rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-medium text-sm">{r.criterion}</span>
                                              <span className="text-sm font-bold">{r.score}/{r.maxScore}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(r.score / r.maxScore) * 100}%` }} />
                                            </div>
                                            {r.feedback && <p className="text-xs text-gray-600">{r.feedback}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
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
