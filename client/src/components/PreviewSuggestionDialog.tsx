import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PreviewSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  initialData: {
    schoolYear: string;
    educationLevel: "primary" | "middle" | "secondary";
    grade: string;
    subject: string;
    lessonTitle: string;
    duration?: number;
    lessonObjectives?: string;
    materials?: string;
    introduction?: string;
    mainActivitiesText?: string;
    conclusion?: string;
    evaluation?: string;
  };
  rawSuggestion?: string;
  usedReferences?: Array<{ title: string; type: string; url: string }>;
}

export function PreviewSuggestionDialog({
  open,
  onClose,
  initialData,
  rawSuggestion,
  usedReferences,
}: PreviewSuggestionDialogProps) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const exportToPDF = trpc.pedagogicalSheets.exportAiSuggestionToPDF.useMutation({
    onSuccess: (data) => {
      toast.success("تم تصدير الاقتراح إلى PDF بنجاح");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(`خطأ في التصدير: ${error.message}`);
    },
  });

  const exportToWord = trpc.pedagogicalSheets.exportAiSuggestionToWord.useMutation({
    onSuccess: (data) => {
      toast.success("تم تصدير الاقتراح إلى Word بنجاح");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(`خطأ في التصدير: ${error.message}`);
    },
  });

  const saveSuggestion = trpc.pedagogicalSheets.saveAiSuggestion.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الاقتراح في الأرشيف بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في الحفظ: ${error.message}`);
    },
  });

  const handleExportPDF = () => {
    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, index) => ({
          title: `نشاط ${index + 1}`,
          duration: 15,
          description: line.trim(),
        }))
      : undefined;

    exportToPDF.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel,
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration,
      lessonObjectives: formData.lessonObjectives,
      materials: formData.materials,
      introduction: formData.introduction,
      mainActivities,
      conclusion: formData.conclusion,
      evaluation: formData.evaluation,
    });
  };

  const handleExportWord = () => {
    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, index) => ({
          title: `نشاط ${index + 1}`,
          duration: 15,
          description: line.trim(),
        }))
      : undefined;

    exportToWord.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel,
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration,
      lessonObjectives: formData.lessonObjectives,
      materials: formData.materials,
      introduction: formData.introduction,
      mainActivities,
      conclusion: formData.conclusion,
      evaluation: formData.evaluation,
    });
  };

  const handleSave = () => {
    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, index) => ({
          title: `نشاط ${index + 1}`,
          duration: 15,
          description: line.trim(),
        }))
      : undefined;

    saveSuggestion.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel,
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration,
      lessonObjectives: formData.lessonObjectives,
      materials: formData.materials,
      introduction: formData.introduction,
      mainActivities,
      conclusion: formData.conclusion,
      evaluation: formData.evaluation,
      rawSuggestion,
      usedReferences,
    });
  };

  const educationLevelMap = {
    primary: "ابتدائي",
    middle: "إعدادي",
    secondary: "ثانوي",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">معاينة وتعديل الاقتراح</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>السنة الدراسية</Label>
              <Input
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="text-right"
              />
            </div>
            <div>
              <Label>المستوى</Label>
              <Input
                value={educationLevelMap[formData.educationLevel]}
                disabled
                className="text-right bg-gray-50"
              />
            </div>
            <div>
              <Label>الصف</Label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="text-right"
              />
            </div>
            <div>
              <Label>المادة</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="text-right"
              />
            </div>
          </div>

          <div>
            <Label>عنوان الدرس</Label>
            <Input
              value={formData.lessonTitle}
              onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <Label>المدة (بالدقائق)</Label>
            <Input
              type="number"
              value={formData.duration || ""}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
              className="text-right"
            />
          </div>

          {/* Content Fields */}
          <div>
            <Label>الأهداف والكفايات</Label>
            <Textarea
              value={formData.lessonObjectives || ""}
              onChange={(e) => setFormData({ ...formData, lessonObjectives: e.target.value })}
              className="min-h-[100px] text-right"
            />
          </div>

          <div>
            <Label>الوسائل المطلوبة</Label>
            <Textarea
              value={formData.materials || ""}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="min-h-[80px] text-right"
            />
          </div>

          <div>
            <Label>المقدمة / التمهيد</Label>
            <Textarea
              value={formData.introduction || ""}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              className="min-h-[100px] text-right"
            />
          </div>

          <div>
            <Label>الأنشطة الرئيسية (كل نشاط في سطر)</Label>
            <Textarea
              value={formData.mainActivitiesText || ""}
              onChange={(e) => setFormData({ ...formData, mainActivitiesText: e.target.value })}
              className="min-h-[120px] text-right"
            />
          </div>

          <div>
            <Label>الخاتمة</Label>
            <Textarea
              value={formData.conclusion || ""}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="min-h-[100px] text-right"
            />
          </div>

          <div>
            <Label>التقييم</Label>
            <Textarea
              value={formData.evaluation || ""}
              onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
              className="min-h-[100px] text-right"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-center sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            إغلاق
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveSuggestion.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            حفظ في الأرشيف
          </Button>
          <Button
            variant="default"
            onClick={handleExportWord}
            disabled={exportToWord.isPending}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            تصدير Word
          </Button>
          <Button
            variant="default"
            onClick={handleExportPDF}
            disabled={exportToPDF.isPending}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <Download className="h-4 w-4" />
            تصدير PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
