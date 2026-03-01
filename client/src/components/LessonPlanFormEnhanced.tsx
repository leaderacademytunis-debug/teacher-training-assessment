import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

interface LessonPlanFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Lesson {
  week: number;
  lessonTitle: string;
  objectives: string;
  duration: number;
}

export function LessonPlanFormEnhanced({ onClose, onSuccess }: LessonPlanFormEnhancedProps) {
  const [formData, setFormData] = useState({
    schoolYear: "",
    educationLevel: "" as "primary" | "middle" | "secondary" | "",
    grade: "",
    subject: "",
    planTitle: "",
    startDate: "",
    endDate: "",
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    { week: 1, lessonTitle: "", objectives: "", duration: 45 }
  ]);

  const createPlan = trpc.lessonPlans.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ خطة الدروس بنجاح");
      onSuccess();
    },
    onError: (error: any) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const handleAddLesson = () => {
    const lastWeek = lessons.length > 0 ? lessons[lessons.length - 1].week : 0;
    setLessons([...lessons, { week: lastWeek + 1, lessonTitle: "", objectives: "", duration: 45 }]);
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleLessonChange = (index: number, field: keyof Lesson, value: string | number) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.planTitle) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    if (lessons.length === 0 || lessons.some(l => !l.lessonTitle)) {
      alert("يرجى إضافة درس واحد على الأقل مع عنوان");
      return;
    }

    createPlan.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      planTitle: formData.planTitle,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      totalLessons: lessons.length,
      lessons: lessons,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>إنشاء خطة دروس جديدة</CardTitle>
            <CardDescription>
              خطط لدروسك الأسبوعية أو الشهرية مع تحديد الأهداف والمدة الزمنية
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
              <Label htmlFor="planTitle">عنوان الخطة *</Label>
              <Input
                id="planTitle"
                placeholder="مثال: خطة دروس الثلاثي الأول"
                value={formData.planTitle}
                onChange={(e) => setFormData({ ...formData, planTitle: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* الدروس */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">الدروس ({lessons.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLesson} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة درس
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">الأسبوع {lesson.week}</span>
                      {lessons.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLesson(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>رقم الأسبوع</Label>
                        <Input
                          type="number"
                          min="1"
                          value={lesson.week}
                          onChange={(e) => handleLessonChange(index, "week", parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>المدة (دقيقة)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={lesson.duration}
                          onChange={(e) => handleLessonChange(index, "duration", parseInt(e.target.value) || 45)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>عنوان الدرس *</Label>
                      <Input
                        value={lesson.lessonTitle}
                        onChange={(e) => handleLessonChange(index, "lessonTitle", e.target.value)}
                        placeholder="أدخل عنوان الدرس"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الأهداف</Label>
                      <Textarea
                        value={lesson.objectives}
                        onChange={(e) => handleLessonChange(index, "objectives", e.target.value)}
                        placeholder="أهداف الدرس"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createPlan.isPending}>
              {createPlan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الخطة"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
