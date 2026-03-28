import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ManageQuestions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [formData, setFormData] = useState({
    questionTextAr: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A" as "A" | "B" | "C" | "D",
    points: "1",
  });

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: exams } = trpc.exams.listByCourse.useQuery(
    { courseId: parseInt(selectedCourse) },
    { enabled: !!selectedCourse }
  );
  const { data: questions, isLoading } = trpc.questions.listByExam.useQuery(
    { examId: parseInt(selectedExam) },
    { enabled: !!selectedExam }
  );
  const utils = trpc.useUtils();

  const createMutation = trpc.questions.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة السؤال بنجاح!");
      utils.questions.listByExam.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.questions.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث السؤال بنجاح!");
      utils.questions.listByExam.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.questions.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح!");
      utils.questions.listByExam.invalidate();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      questionTextAr: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      points: "1",
    });
    setEditingQuestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.questionTextAr || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    const data = {
      examId: parseInt(selectedExam),
      questionTextAr: formData.questionTextAr,
      options: {
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
      },
      correctAnswer: formData.correctAnswer,
      points: parseInt(formData.points),
      orderIndex: editingQuestion ? editingQuestion.orderIndex : (questions?.length || 0) + 1,
    };

    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      questionTextAr: question.questionTextAr,
      optionA: question.options.optionA,
      optionB: question.options.optionB,
      optionC: question.options.optionC,
      optionD: question.options.optionD,
      correctAnswer: question.correctAnswer,
      points: question.points?.toString() || "1",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الأسئلة</h2>
          <p className="text-gray-600">إضافة وتعديل أسئلة الاختبارات</p>
        </div>
        {selectedExam && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ms-2" />
                إضافة سؤال جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد"}</DialogTitle>
                <DialogDescription>
                  املأ البيانات أدناه لإنشاء أو تعديل سؤال اختيار من متعدد
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="questionTextAr">نص السؤال *</Label>
                  <Textarea
                    id="questionTextAr"
                    value={formData.questionTextAr}
                    onChange={(e) => setFormData({ ...formData, questionTextAr: e.target.value })}
                    placeholder="اكتب السؤال هنا..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>الخيارات *</Label>
                  <div>
                    <Label htmlFor="optionA" className="text-sm text-gray-600">الخيار A</Label>
                    <Input
                      id="optionA"
                      value={formData.optionA}
                      onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                      placeholder="الخيار الأول"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionB" className="text-sm text-gray-600">الخيار B</Label>
                    <Input
                      id="optionB"
                      value={formData.optionB}
                      onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                      placeholder="الخيار الثاني"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionC" className="text-sm text-gray-600">الخيار C</Label>
                    <Input
                      id="optionC"
                      value={formData.optionC}
                      onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                      placeholder="الخيار الثالث"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionD" className="text-sm text-gray-600">الخيار D</Label>
                    <Input
                      id="optionD"
                      value={formData.optionD}
                      onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                      placeholder="الخيار الرابع"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>الإجابة الصحيحة *</Label>
                  <RadioGroup 
                    value={formData.correctAnswer} 
                    onValueChange={(value) => setFormData({ ...formData, correctAnswer: value as any })}
                  >
                    <div className="flex gap-4 mt-2">
                      {["A", "B", "C", "D"].map((option) => (
                        <div key={option} className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value={option} id={`correct-${option}`} />
                          <Label htmlFor={`correct-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="points">النقاط *</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      editingQuestion ? "تحديث" : "إضافة"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
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

        {selectedCourse && (
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
                  {exams?.map((exam) => (
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

      {/* Questions List */}
      {selectedExam && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {questions?.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">السؤال {index + 1}</CardTitle>
                        <CardDescription className="text-base text-gray-900 mt-2 leading-relaxed">
                          {question.questionTextAr}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((option) => {
                        const optionKey = `option${option}` as keyof typeof question.options;
                        const isCorrect = question.correctAnswer === option;
                        return (
                          <div 
                            key={option}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrect ? "bg-green-50 border-green-500" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <span className="font-semibold ms-2">{option}.</span>
                            {question.options[optionKey]}
                            {isCorrect && (
                              <span className="text-green-600 font-semibold me-2">(الإجابة الصحيحة)</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      النقاط: {question.points}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {questions && questions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">لا توجد أسئلة لهذا الاختبار. ابدأ بإضافة سؤال جديد.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
