import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useI18n from "@/i18n";


export default function EditQuestions() {
  const { t, lang, isRTL, dir } = useI18n();
  const params = useParams();
  const examId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: exam } = trpc.exams.getById.useQuery({ id: examId });
  const { data: questions, refetch } = trpc.exams.getQuestions.useQuery({ examId });
  
  const updateMutation = trpc.exams.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success("✅ تم تحديث السؤال بنجاح");
      refetch();
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(`❌ خطأ: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.exams.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("✅ تم حذف السؤال بنجاح");
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`❌ خطأ: ${error.message}`);
    },
  });
  
  const reorderMutation = trpc.exams.reorderQuestion.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(`❌ خطأ: ${error.message}`);
    },
  });

  const [editForm, setEditForm] = useState<{
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
  }>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

  const startEditing = (question: any) => {
    setEditingId(question.id);
    setEditForm({
      questionText: question.questionTextAr,
      optionA: question.options.optionA,
      optionB: question.options.optionB,
      optionC: question.options.optionC,
      optionD: question.options.optionD,
      correctAnswer: question.correctAnswer,
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      ...editForm,
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId });
  };

  const handleMoveUp = (questionId: number, currentOrder: number) => {
    if (currentOrder === 0) return;
    reorderMutation.mutate({
      id: questionId,
      newOrder: currentOrder - 1,
    });
  };

  const handleMoveDown = (questionId: number, currentOrder: number, maxOrder: number) => {
    if (currentOrder >= maxOrder) return;
    reorderMutation.mutate({
      id: questionId,
      newOrder: currentOrder + 1,
    });
  };

  if (!exam || !questions) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="ms-2 h-4 w-4" />
              العودة للوحة التحكم
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">تحرير الأسئلة</h1>
          <p className="text-muted-foreground">
            الاختبار: {exam.titleAr} • {questions.length} سؤال
          </p>
        </div>
        <Link href={`/preview-exam/${examId}`}>
          <Button size="lg">
            <Check className="ms-2 h-5 w-5" />
            معاينة الاختبار
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    السؤال {index + 1}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {/* Reorder buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveUp(question.id, question.orderIndex)}
                    disabled={index === 0 || reorderMutation.isPending}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveDown(question.id, question.orderIndex, questions.length - 1)}
                    disabled={index === questions.length - 1 || reorderMutation.isPending}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {editingId === question.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="ms-2 h-4 w-4" />
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(question)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === question.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>نص السؤال</Label>
                    <Input
                      value={editForm.questionText}
                      onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الخيار A</Label>
                      <Input
                        value={editForm.optionA}
                        onChange={(e) => setEditForm({ ...editForm, optionA: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>الخيار B</Label>
                      <Input
                        value={editForm.optionB}
                        onChange={(e) => setEditForm({ ...editForm, optionB: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>الخيار C</Label>
                      <Input
                        value={editForm.optionC}
                        onChange={(e) => setEditForm({ ...editForm, optionC: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>الخيار D</Label>
                      <Input
                        value={editForm.optionD}
                        onChange={(e) => setEditForm({ ...editForm, optionD: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>الإجابة الصحيحة</Label>
                    <RadioGroup
                      value={editForm.correctAnswer}
                      onValueChange={(value) => setEditForm({ ...editForm, correctAnswer: value as "A" | "B" | "C" | "D" })}
                      className="mt-2 flex gap-4"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="A" id="edit-a" />
                        <Label htmlFor="edit-a">A</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="B" id="edit-b" />
                        <Label htmlFor="edit-b">B</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="C" id="edit-c" />
                        <Label htmlFor="edit-c">C</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="D" id="edit-d" />
                        <Label htmlFor="edit-d">D</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-lg">{question.questionTextAr}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-md border ${question.correctAnswer === 'A' ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                      <span className="font-semibold">A.</span> {question.options.optionA}
                    </div>
                    <div className={`p-3 rounded-md border ${question.correctAnswer === 'B' ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                      <span className="font-semibold">B.</span> {question.options.optionB}
                    </div>
                    <div className={`p-3 rounded-md border ${question.correctAnswer === 'C' ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                      <span className="font-semibold">C.</span> {question.options.optionC}
                    </div>
                    <div className={`p-3 rounded-md border ${question.correctAnswer === 'D' ? 'bg-green-50 border-green-300' : 'bg-muted'}`}>
                      <span className="font-semibold">D.</span> {question.options.optionD}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
