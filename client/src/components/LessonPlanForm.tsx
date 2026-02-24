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

export function LessonPlanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    schoolYear: "2024-2025",
    educationLevel: "primary" as "primary" | "middle" | "secondary",
    grade: "",
    subject: "",
    planTitle: "",
    duration: "",
    objectives: "",
    materials: "",
    activities: "",
    evaluation: "",
  });

  const createMutation = trpc.lessonPlans.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ تخطيط الدرس بنجاح!");
      setFormData({
        schoolYear: "2024-2025",
        educationLevel: "primary" as "primary" | "middle" | "secondary",
        grade: "",
        subject: "",
        planTitle: "",
        duration: "",
        objectives: "",
        materials: "",
        activities: "",
        evaluation: "",
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
      ...formData,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تخطيط درس جديد</CardTitle>
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
            <Label htmlFor="planTitle">عنوان الخطة</Label>
            <Input
              id="planTitle"
              value={formData.planTitle}
              onChange={(e) =>
                setFormData({ ...formData, planTitle: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">المدة الزمنية</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              placeholder="مثال: 45 دقيقة"
              required
            />
          </div>

          <div>
            <Label htmlFor="objectives">الأهداف</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) =>
                setFormData({ ...formData, objectives: e.target.value })
              }
              rows={4}
              placeholder="أهداف الدرس..."
              required
            />
          </div>

          <div>
            <Label htmlFor="materials">الوسائل والمواد</Label>
            <Textarea
              id="materials"
              value={formData.materials}
              onChange={(e) =>
                setFormData({ ...formData, materials: e.target.value })
              }
              rows={3}
              placeholder="الوسائل التعليمية المستخدمة..."
            />
          </div>

          <div>
            <Label htmlFor="activities">الأنشطة والمراحل</Label>
            <Textarea
              id="activities"
              value={formData.activities}
              onChange={(e) =>
                setFormData({ ...formData, activities: e.target.value })
              }
              rows={6}
              placeholder="مراحل الدرس والأنشطة..."
              required
            />
          </div>

          <div>
            <Label htmlFor="evaluation">التقييم</Label>
            <Textarea
              id="evaluation"
              value={formData.evaluation}
              onChange={(e) =>
                setFormData({ ...formData, evaluation: e.target.value })
              }
              rows={3}
              placeholder="أساليب التقييم..."
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
            حفظ تخطيط الدرس
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
