import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Eye, CheckCircle2, XCircle } from "lucide-react";

export default function PreviewExam() {
  const params = useParams();
  const examId = parseInt(params.id || "0");
  
  const { data: exam } = trpc.exams.getById.useQuery({ id: examId });
  const { data: questions } = trpc.exams.getQuestions.useQuery({ examId });
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (exam && exam.duration) {
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!questions) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, percentage };
  };

  if (!exam || !questions) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  const score = showResults ? calculateScore() : null;
  const passed = score ? score.percentage >= exam.passingScore : false;

  return (
    <div className="container max-w-4xl py-8">
      {/* Preview Banner */}
      <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
        <Eye className="h-4 w-4" />
        <AlertDescription className="text-right">
          <strong>وضع المعاينة:</strong> هذا عرض تجريبي للاختبار. لن يتم حفظ النتائج أو التأثير على الإحصائيات.
        </AlertDescription>
      </Alert>

      {/* Back Button */}
      <Link href={`/edit-questions/${examId}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة للتحرير
        </Button>
      </Link>

      {/* Exam Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{exam.titleAr}</CardTitle>
          <CardDescription>{exam.descriptionAr}</CardDescription>
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span>⏱️ المدة: {exam.duration} دقيقة</span>
            <span>📊 درجة النجاح: {exam.passingScore}%</span>
            <span>❓ عدد الأسئلة: {questions.length}</span>
          </div>
          {!showResults && (
            <div className="mt-4 text-lg font-semibold">
              ⏰ الوقت المتبقي: {formatTime(timeLeft)}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Results Card */}
      {showResults && score && (
        <Card className={`mb-6 ${passed ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {passed ? "نجحت في الاختبار! 🎉" : "لم تنجح في الاختبار"}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  النتيجة: {score.correct} من {score.total} ({score.percentage}%)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = showResults && userAnswer === question.correctAnswer;
          const isWrong = showResults && userAnswer && userAnswer !== question.correctAnswer;
          
          return (
            <Card 
              key={question.id}
              className={showResults ? (isCorrect ? "border-green-500" : isWrong ? "border-red-500" : "") : ""}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>السؤال {index + 1}</span>
                  {showResults && (
                    isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : isWrong ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : null
                  )}
                </CardTitle>
                <CardDescription className="text-base text-foreground mt-2">
                  {question.questionTextAr}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userAnswer || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  disabled={showResults}
                >
                  {["A", "B", "C", "D"].map((option) => {
                    const optionKey = `option${option}` as keyof typeof question.options;
                    const optionText = question.options[optionKey];
                    const isThisCorrect = showResults && option === question.correctAnswer;
                    const isThisWrong = showResults && userAnswer === option && option !== question.correctAnswer;
                    
                    return (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border ${
                          isThisCorrect
                            ? "bg-green-50 border-green-500 dark:bg-green-950"
                            : isThisWrong
                            ? "bg-red-50 border-red-500 dark:bg-red-950"
                            : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} id={`q${question.id}-${option}`} />
                        <Label
                          htmlFor={`q${question.id}-${option}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <span className="font-semibold ml-2">{option}.</span>
                          {optionText}
                          {isThisCorrect && (
                            <span className="mr-2 text-green-600 font-semibold">✓ الإجابة الصحيحة</span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit Button */}
      {!showResults && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            إنهاء الاختبار وعرض النتيجة
          </Button>
        </div>
      )}

      {/* Retry Button */}
      {showResults && (
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setShowResults(false);
              setTimeLeft((exam.duration || 30) * 60);
            }}
          >
            إعادة المحاولة
          </Button>
          <Link href={`/edit-questions/${examId}`}>
            <Button size="lg">
              العودة للتحرير
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
