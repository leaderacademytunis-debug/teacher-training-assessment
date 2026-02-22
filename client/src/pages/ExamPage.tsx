import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const examId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const { data: exam, isLoading: examLoading } = trpc.exams.getById.useQuery({ id: examId });
  const { data: questions, isLoading: questionsLoading } = trpc.questions.listByExam.useQuery({ examId });
  const { data: attempts } = trpc.examAttempts.myAttempts.useQuery({ examId }, { enabled: !!user });
  
  const startMutation = trpc.examAttempts.start.useMutation({
    onSuccess: (data) => {
      setAttemptId(data.attemptId);
      if (exam?.duration) {
        setTimeLeft(exam.duration * 60); // Convert minutes to seconds
      }
      toast.success("بدأ الاختبار!");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });
  
  const submitMutation = trpc.examAttempts.submit.useMutation({
    onSuccess: (result) => {
      toast.success(`تم تقديم الاختبار! النتيجة: ${result.score}%`);
      setLocation(`/exam-results/${attemptId}`);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء التقديم: " + error.message);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !attemptId) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, attemptId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, answer: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!attemptId) return;
    
    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId: parseInt(questionId),
      selectedAnswer,
    }));
    
    if (answerArray.length === 0) {
      toast.error("يجب الإجابة على سؤال واحد على الأقل");
      return;
    }
    
    submitMutation.mutate({
      attemptId,
      answers: answerArray,
    });
  };

  if (authLoading || examLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>يجب تسجيل الدخول</CardTitle>
            <CardDescription>الرجاء تسجيل الدخول لبدء الاختبار</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!exam || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الاختبار غير موجود</CardTitle>
            <CardDescription>لم يتم العثور على الاختبار المطلوب</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const lastAttempt = attempts?.[0];
  const hasPassedAttempt = lastAttempt?.status === "graded" && lastAttempt?.passed;

  // Only block if user has PASSED the exam
  if (hasPassedAttempt && !attemptId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container py-6">
            <Link href={`/courses/${exam.courseId}`}>
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للدورة
              </Button>
            </Link>
          </div>
        </header>
        
        <section className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">لقد نجحت في هذا الاختبار</CardTitle>
              <CardDescription className="text-base">
                النتيجة: {lastAttempt.score}% - ناجح ✅
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Link href={`/exam-results/${lastAttempt.id}`}>
                <Button>عرض النتائج والشهادة</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container py-6">
            <Link href={`/courses/${exam.courseId}`}>
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للدورة
              </Button>
            </Link>
          </div>
        </header>
        
        <section className="container py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{exam.titleAr}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {exam.descriptionAr || "اختبار نهائي لتقييم المكتسبات"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>المدة: {exam.duration} دقيقة</span>
                </div>
                <div>عدد الأسئلة: {questions.length} سؤال</div>
                <div>درجة النجاح: {exam.passingScore}%</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">تعليمات الاختبار:</h4>
                <ul className="space-y-1 text-blue-800 text-sm">
                  <li>• اقرأ كل سؤال بعناية قبل الإجابة</li>
                  <li>• اختر إجابة واحدة فقط لكل سؤال</li>
                  <li>• لا يمكن العودة بعد تقديم الاختبار</li>
                  <li>• سيتم تقديم الاختبار تلقائياً عند انتهاء الوقت</li>
                </ul>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => startMutation.mutate({ examId })}
                disabled={startMutation.isPending}
              >
                {startMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري البدء...
                  </>
                ) : (
                  "بدء الاختبار"
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header with Timer */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{exam.titleAr}</h1>
              <p className="text-sm text-gray-600">
                تمت الإجابة على {answeredCount} من {questions.length} سؤال
              </p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5 text-primary" />
                <span className={timeLeft < 60 ? "text-red-600" : "text-gray-900"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Questions */}
      <section className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  السؤال {index + 1} من {questions.length}
                </CardTitle>
                <CardDescription className="text-base text-gray-900 leading-relaxed">
                  {question.questionTextAr}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => handleAnswerChange(question.id, value as "A" | "B" | "C" | "D")}
                >
                  <div className="space-y-3">
                    {["A", "B", "C", "D"].map((option) => {
                      const optionKey = `option${option}` as keyof typeof question.options;
                      const optionText = question.options[optionKey];
                      
                      return (
                        <div 
                          key={option}
                          className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <RadioGroupItem value={option} id={`q${question.id}-${option}`} />
                          <Label 
                            htmlFor={`q${question.id}-${option}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            <span className="font-semibold ml-2">{option}.</span>
                            {optionText}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <Card className="sticky bottom-4 bg-white shadow-lg">
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || answeredCount === 0}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التقديم...
                  </>
                ) : (
                  `تقديم الاختبار (${answeredCount}/${questions.length})`
                )}
              </Button>
              {answeredCount < questions.length && (
                <p className="text-sm text-center text-amber-600 mt-2">
                  لم تجب على جميع الأسئلة. يمكنك التقديم الآن أو إكمال الإجابات.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
