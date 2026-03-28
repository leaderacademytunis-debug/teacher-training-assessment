import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function TeacherExamForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    schoolYear: "2024-2025",
    educationLevel: "primary" as "primary" | "middle" | "secondary",
    grade: "",
    subject: "",
    examTitle: "",
    examType: "formative" as "formative" | "summative" | "diagnostic",
    duration: "",
    totalMarks: "",
    instructions: "",
    questions: "",
  });

  const createMutation = trpc.teacherExams.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ الاختبار بنجاح!");
      setFormData({
        schoolYear: "2024-2025",
        educationLevel: "primary" as "primary" | "middle" | "secondary",
        grade: "",
        subject: "",
        examTitle: "",
        examType: "formative" as "formative" | "summative" | "diagnostic",
        duration: "",
        totalMarks: "",
        instructions: "",
        questions: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      examTitle: formData.examTitle,
      examType: formData.examType as "formative" | "summative" | "diagnostic",
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      totalPoints: formData.totalMarks ? parseInt(formData.totalMarks) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إنشاء اختبار جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schoolYear">السنة الدراسية</Label>
              <Input
                id="schoolYear"
                value={formData.schoolYear}
                onChange={(e) =>
                  setFormData({ ...formData, schoolYear: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="educationLevel">المرحلة التعليمية</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, educationLevel: value as "primary" | "middle" | "secondary" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المرحلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">ابتدائي</SelectItem>
                  <SelectItem value="middle">إعدادي</SelectItem>
                  <SelectItem value="secondary">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">المستوى</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="مثال: السنة الأولى ابتدائي"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">المادة</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="مثال: اللغة العربية"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="examTitle">عنوان الاختبار</Label>
            <Input
              id="examTitle"
              value={formData.examTitle}
              onChange={(e) =>
                setFormData({ ...formData, examTitle: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="examType">نوع الاختبار</Label>
              <Select
                value={formData.examType}
                onValueChange={(value) =>
                  setFormData({ ...formData, examType: value as "formative" | "summative" | "diagnostic" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formative">تكويني</SelectItem>
                  <SelectItem value="summative">تحصيلي</SelectItem>
                  <SelectItem value="diagnostic">تشخيصي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">المدة الزمنية</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="مثال: 60 دقيقة"
                required
              />
            </div>

            <div>
              <Label htmlFor="totalMarks">العلامة الكلية</Label>
              <Input
                id="totalMarks"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: e.target.value })
                }
                placeholder="مثال: 20"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">التعليمات</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              rows={3}
              placeholder="تعليمات الاختبار..."
            />
          </div>

          <div>
            <Label htmlFor="questions">الأسئلة</Label>
            <Textarea
              id="questions"
              value={formData.questions}
              onChange={(e) =>
                setFormData({ ...formData, questions: e.target.value })
              }
              rows={10}
              placeholder="أسئلة الاختبار..."
              required
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending && (
              <Loader2 className="ms-2 h-4 w-4 animate-spin" />
            )}
            حفظ الاختبار
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
