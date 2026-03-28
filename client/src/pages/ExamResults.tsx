import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Award } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import useI18n from "@/i18n";


export default function ExamResults() {
  const { t, lang, isRTL, dir } = useI18n();
  const { id } = useParams<{ id: string }>();
  const attemptId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  
  const { data, isLoading } = trpc.examAttempts.getById.useQuery({ attemptId });
  const { data: certificate } = trpc.certificates.getByAttemptId.useQuery(
    { attemptId },
    { enabled: !!data?.attempt.passed }
  );
  const generateCertificate = trpc.certificates.generate.useMutation({
    onSuccess: (cert) => {
      toast.success("تم إنشاء الشهادة بنجاح!");
      if (cert.pdfUrl) {
        window.open(cert.pdfUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });
  const { data: exam } = trpc.exams.getById.useQuery(
    { id: data?.attempt.examId || 0 },
    { enabled: !!data?.attempt.examId }
  );
  const { data: questions } = trpc.questions.listByExam.useQuery(
    { examId: data?.attempt.examId || 0 },
    { enabled: !!data?.attempt.examId }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>النتائج غير متاحة</CardTitle>
            <CardDescription>لم يتم العثور على نتائج الاختبار</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { attempt, answers: userAnswers } = data;
  const passed = attempt.passed || false;
  const score = attempt.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <Link href={exam ? `/courses/${exam.courseId}` : "/"}>
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ms-2" />
              العودة للدورة
            </Button>
          </Link>
        </div>
      </header>

      {/* Results Summary */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Card */}
          <Card className={`border-2 ${passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
            <CardHeader className="text-center">
              {passed ? (
                <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              )}
              <CardTitle className="text-3xl">
                {passed ? "مبروك! لقد نجحت" : "للأسف، لم تنجح"}
              </CardTitle>
              <CardDescription className="text-xl font-semibold text-gray-900 mt-2">
                النتيجة: {score}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{attempt.earnedPoints}</div>
                  <div className="text-sm text-gray-600">النقاط المكتسبة</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-700">{attempt.totalPoints}</div>
                  <div className="text-sm text-gray-600">إجمالي النقاط</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-700">{exam?.passingScore}%</div>
                  <div className="text-sm text-gray-600">درجة النجاح</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retry Button (if failed) */}
          {!passed && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">لا تقلق! يمكنك إعادة المحاولة</CardTitle>
                <CardDescription className="text-base text-gray-700">
                  ادرس المواد مرة أخرى وحاول مجدداً. لديك عدد غير محدود من المحاولات.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Link href={`/exam/${exam?.id}`}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <ArrowRight className="w-5 h-5 ms-2" />
                    إعادة المحاولة
                  </Button>
                </Link>
                <p className="text-sm text-gray-600">
                  نصيحة: راجع مواد الدورة قبل إعادة المحاولة
                </p>
              </CardContent>
            </Card>
          )}

          {/* Detailed Answers (only if passed) */}
          {passed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">مراجعة الإجابات</CardTitle>
                <CardDescription>
                  تفاصيل إجاباتك على جميع الأسئلة
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {questions?.map((question, index) => {
                const userAnswer = userAnswers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect || false;
                
                return (
                  <div 
                    key={question.id}
                    className={`border-2 rounded-lg p-6 ${
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        السؤال {index + 1}
                      </h3>
                      <Badge className={isCorrect ? "bg-green-600" : "bg-red-600"}>
                        {isCorrect ? "صحيح" : "خطأ"}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-900 mb-4 leading-relaxed">
                      {question.questionTextAr}
                    </p>
                    
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((option) => {
                        const optionKey = `option${option}` as keyof typeof question.options;
                        const optionText = question.options[optionKey];
                        const isUserAnswer = userAnswer?.selectedAnswer === option;
                        const isCorrectAnswer = question.correctAnswer === option;
                        
                        let bgColor = "bg-white";
                        let textColor = "text-gray-900";
                        let icon = null;
                        
                        if (isCorrectAnswer) {
                          bgColor = "bg-green-100 border-green-500";
                          textColor = "text-green-900";
                          icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                        } else if (isUserAnswer && !isCorrect) {
                          bgColor = "bg-red-100 border-red-500";
                          textColor = "text-red-900";
                          icon = <XCircle className="w-5 h-5 text-red-600" />;
                        }
                        
                        return (
                          <div 
                            key={option}
                            className={`border-2 rounded-lg p-3 flex items-center gap-3 ${bgColor}`}
                          >
                            {icon}
                            <span className={`flex-1 ${textColor}`}>
                              <span className="font-semibold ms-2">{option}.</span>
                              {optionText}
                            </span>
                            {isUserAnswer && (
                              <Badge variant="outline" className="text-xs">
                                إجابتك
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 text-sm">
                      <span className="font-semibold">النقاط: </span>
                      {userAnswer?.points || 0} من {question.points}
                    </div>
                  </div>
                );
              })}
            </CardContent>
            </Card>
          )}

          {/* Certificate Section (if passed) */}
          {passed && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
              <CardHeader className="text-center">
                <Award className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">تهانينا!</CardTitle>
                <CardDescription className="text-base text-gray-700">
                  لقد أكملت الاختبار بنجاح وحصلت على شهادة إتمام الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {certificate ? (
                  <Button 
                    size="lg"
                    onClick={() => certificate.pdfUrl && window.open(certificate.pdfUrl, "_blank")}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Award className="w-5 h-5 ms-2" />
                    تحميل الشهادة
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => generateCertificate.mutate({ attemptId })}
                    disabled={generateCertificate.isPending}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {generateCertificate.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 ms-2 animate-spin" />
                        جاري إنشاء الشهادة...
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5 ms-2" />
                        إنشاء الشهادة
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
