import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

interface PedagogicalSheetFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PedagogicalSheetForm({ onClose, onSuccess }: PedagogicalSheetFormProps) {
  // Removed useToast
  const [formData, setFormData] = useState({
    schoolYear: "",
    educationLevel: "" as "primary" | "middle" | "secondary" | "",
    grade: "",
    subject: "",
    lessonTitle: "",
    lessonObjectives: "",
    duration: "",
    materials: "",
    introduction: "",
    conclusion: "",
    evaluation: "",
    guidePageReference: "",
    programReference: "",
  });

  const createSheet = trpc.pedagogicalSheets.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ المذكرة البيداغوجية بنجاح");
      onSuccess();
    },
    onError: (error) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.lessonTitle) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    createSheet.mutate({
      ...formData,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      status: "draft",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>إنشاء مذكرة بيداغوجية جديدة</CardTitle>
            <CardDescription>
              املأ المعلومات التالية لإنشاء مذكرة بيداغوجية
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات التعريف الإلزامية */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات التعريف (إلزامية)</h3>
            
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
                <Input
                  id="grade"
                  placeholder="مثال: السنة الأولى ابتدائي"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">المادة *</Label>
                <Input
                  id="subject"
                  placeholder="مثال: اللغة العربية"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* تفاصيل الدرس */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">تفاصيل الدرس</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">عنوان الدرس *</Label>
              <Input
                id="lessonTitle"
                placeholder="أدخل عنوان الدرس"
                value={formData.lessonTitle}
                onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonObjectives">الأهداف والكفايات</Label>
              <Textarea
                id="lessonObjectives"
                placeholder="أدخل أهداف الدرس والكفايات المستهدفة"
                value={formData.lessonObjectives}
                onChange={(e) => setFormData({ ...formData, lessonObjectives: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">المدة (بالدقائق)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="مثال: 45"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">الوسائل المطلوبة</Label>
                <Input
                  id="materials"
                  placeholder="مثال: كتاب، سبورة، بطاقات"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* البنية البيداغوجية */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">البنية البيداغوجية</h3>
            
            <div className="space-y-2">
              <Label htmlFor="introduction">المقدمة / التمهيد</Label>
              <Textarea
                id="introduction"
                placeholder="أدخل نشاط التمهيد أو المقدمة"
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusion">الخاتمة</Label>
              <Textarea
                id="conclusion"
                placeholder="أدخل نشاط الخاتمة أو التلخيص"
                value={formData.conclusion}
                onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluation">التقييم</Label>
              <Textarea
                id="evaluation"
                placeholder="أدخل طريقة التقييم أو الأسئلة التقييمية"
                value={formData.evaluation}
                onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* المراجع الرسمية */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">المراجع الرسمية</h3>
            
            <div className="space-y-2">
              <Label htmlFor="guidePageReference">مرجع دليل المعلم</Label>
              <Input
                id="guidePageReference"
                placeholder="مثال: صفحة 24"
                value={formData.guidePageReference}
                onChange={(e) => setFormData({ ...formData, guidePageReference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programReference">مرجع البرنامج الرسمي</Label>
              <Textarea
                id="programReference"
                placeholder="أدخل الكفاية الختامية من البرنامج الرسمي (سطر أو سطرين فقط)"
                value={formData.programReference}
                onChange={(e) => setFormData({ ...formData, programReference: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createSheet.isPending}>
              {createSheet.isPending ? "جاري الإنشاء..." : "إنشاء المذكرة"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
