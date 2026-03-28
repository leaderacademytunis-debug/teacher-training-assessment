import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

interface TeacherExamFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Question {
  questionText: string;
  questionType: "mcq" | "short_answer" | "essay";
  points: number;
  options?: string[];
  correctAnswer?: string;
}

export function TeacherExamFormEnhanced({ onClose, onSuccess }: TeacherExamFormEnhancedProps) {
  const [formData, setFormData] = useState({
    schoolYear: "",
    educationLevel: "" as "primary" | "middle" | "secondary" | "",
    grade: "",
    subject: "",
    examTitle: "",
    examType: "" as "formative" | "summative" | "diagnostic" | "",
    duration: "",
    totalPoints: "20",
  });

  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", questionType: "mcq", points: 2, options: ["", "", "", ""], correctAnswer: "" }
  ]);

  const createExam = trpc.teacherExams.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ الاختبار بنجاح");
      onSuccess();
    },
    onError: (error: any) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      questionText: "", 
      questionType: "mcq", 
      points: 2, 
      options: ["", "", "", ""], 
      correctAnswer: "" 
    }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // If changing question type, reset options and correctAnswer
    if (field === "questionType") {
      if (value === "mcq") {
        updated[index].options = ["", "", "", ""];
        updated[index].correctAnswer = "";
      } else {
        updated[index].options = undefined;
        updated[index].correctAnswer = undefined;
      }
    }
    
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
      setQuestions(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.examTitle || !formData.examType) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    if (questions.length === 0 || questions.some(q => !q.questionText)) {
      alert("يرجى إضافة سؤال واحد على الأقل مع نص السؤال");
      return;
    }

    // Validate MCQ questions have options
    for (const q of questions) {
      if (q.questionType === "mcq") {
        if (!q.options || q.options.some(opt => !opt.trim())) {
          alert("يرجى ملء جميع خيارات الأسئلة متعددة الاختيارات");
          return;
        }
      }
    }

    createExam.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      examTitle: formData.examTitle,
      examType: formData.examType as "formative" | "summative" | "diagnostic",
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      totalPoints: parseInt(formData.totalPoints),
      questions: questions,
    });
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>إنشاء اختبار جديد</CardTitle>
            <CardDescription>
              أنشئ اختباراً تقييمياً مع أسئلة متنوعة (اختيار من متعدد، إجابات قصيرة، مقالية)
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات التعريف */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات التعريف</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolYear">السنة الدراسية *</Label>
                <Input
                  id="schoolYear"
                  placeholder="مثال: 2025-2026"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationLevel">المستوى التعليمي *</Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) => setFormData({ ...formData, educationLevel: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">ابتدائي</SelectItem>
                    <SelectItem value="middle">إعدادي</SelectItem>
                    <SelectItem value="secondary">ثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">الصف *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.educationLevel === "primary" && (
                      <>
                        <SelectItem value="السنة الأولى ابتدائي">السنة الأولى ابتدائي</SelectItem>
                        <SelectItem value="السنة الثانية ابتدائي">السنة الثانية ابتدائي</SelectItem>
                        <SelectItem value="السنة الثالثة ابتدائي">السنة الثالثة ابتدائي</SelectItem>
                        <SelectItem value="السنة الرابعة ابتدائي">السنة الرابعة ابتدائي</SelectItem>
                        <SelectItem value="السنة الخامسة ابتدائي">السنة الخامسة ابتدائي</SelectItem>
                        <SelectItem value="السنة السادسة ابتدائي">السنة السادسة ابتدائي</SelectItem>
                      </>
                    )}
                    {formData.educationLevel === "middle" && (
                      <>
                        <SelectItem value="السنة السابعة إعدادي">السنة السابعة إعدادي</SelectItem>
                        <SelectItem value="السنة الثامنة إعدادي">السنة الثامنة إعدادي</SelectItem>
                        <SelectItem value="السنة التاسعة إعدادي">السنة التاسعة إعدادي</SelectItem>
                      </>
                    )}
                    {formData.educationLevel === "secondary" && (
                      <>
                        <SelectItem value="السنة الأولى ثانوي">السنة الأولى ثانوي</SelectItem>
                        <SelectItem value="السنة الثانية ثانوي">السنة الثانية ثانوي</SelectItem>
                        <SelectItem value="السنة الثالثة ثانوي">السنة الثالثة ثانوي</SelectItem>
                        <SelectItem value="السنة الرابعة ثانوي">السنة الرابعة ثانوي</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">المادة *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
                    <SelectItem value="الرياضيات">الرياضيات</SelectItem>
                    <SelectItem value="الإيقاظ العلمي">الإيقاظ العلمي</SelectItem>
                    <SelectItem value="التربية الإسلامية">التربية الإسلامية</SelectItem>
                    <SelectItem value="التربية المدنية">التربية المدنية</SelectItem>
                    <SelectItem value="اللغة الفرنسية">اللغة الفرنسية</SelectItem>
                    <SelectItem value="التاريخ والجغرافيا">التاريخ والجغرافيا</SelectItem>
                    <SelectItem value="التربية الموسيقية">التربية الموسيقية</SelectItem>
                    <SelectItem value="التربية التشكيلية">التربية التشكيلية</SelectItem>
                    <SelectItem value="التربية البدنية">التربية البدنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examTitle">عنوان الاختبار *</Label>
              <Input
                id="examTitle"
                placeholder="مثال: اختبار الثلاثي الأول"
                value={formData.examTitle}
                onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examType">نوع الاختبار *</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) => setFormData({ ...formData, examType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic">تشخيصي</SelectItem>
                    <SelectItem value="formative">تكويني</SelectItem>
                    <SelectItem value="summative">ختامي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">المدة (دقيقة)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints">المجموع (من 20)</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  min="1"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* الأسئلة */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">الأسئلة ({questions.length})</h3>
                <p className="text-sm text-muted-foreground">
                  المجموع الحالي: {calculateTotalPoints()} نقطة
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة سؤال
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">السؤال {index + 1}</span>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>نوع السؤال</Label>
                        <Select
                          value={question.questionType}
                          onValueChange={(value) => handleQuestionChange(index, "questionType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                            <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                            <SelectItem value="essay">مقالي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>النقاط</Label>
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(index, "points", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>نص السؤال *</Label>
                      <Textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                        placeholder="أدخل نص السؤال"
                        rows={2}
                        required
                      />
                    </div>

                    {question.questionType === "mcq" && (
                      <div className="space-y-3">
                        <Label>الخيارات</Label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6">{String.fromCharCode(65 + optIndex)}.</span>
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                              placeholder={`الخيار ${String.fromCharCode(65 + optIndex)}`}
                              required
                            />
                          </div>
                        ))}
                        
                        <div className="space-y-2 mt-3">
                          <Label>الإجابة الصحيحة</Label>
                          <RadioGroup
                            value={question.correctAnswer || ""}
                            onValueChange={(value) => handleQuestionChange(index, "correctAnswer", value)}
                          >
                            {question.options?.map((_, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value={String.fromCharCode(65 + optIndex)} id={`q${index}-opt${optIndex}`} />
                                <Label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer">
                                  الخيار {String.fromCharCode(65 + optIndex)}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createExam.isPending}>
              {createExam.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الاختبار"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
