import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Save, X, Star } from "lucide-react";
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
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const exportJathathWord = trpc.pedagogicalSheets.exportJathathToWord.useMutation({
    onSuccess: (data) => {
      toast.success("تم تصدير الجذاذة إلى Word بقالب Leader Academy ✨");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(`خطأ في التصدير: ${error.message}`);
    },
  });

  const exportLeaderAcademy = trpc.pedagogicalSheets.exportLeaderAcademyJathatha.useMutation({
    onSuccess: (data) => {
      toast.success("تم تصدير الجذاذة بقالب Leader Academy Standard بنجاح ✨");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(`خطأ في التصدير: ${error.message}`);
    },
  });

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

  const handleExportLeaderAcademy = () => {
    const levelMap: Record<string, string> = {
      primary: "ابتدائي",
      middle: "إعدادي",
      secondary: "ثانوي",
    };
    exportLeaderAcademy.mutate({
      schoolYear: formData.schoolYear,
      level: `${levelMap[formData.educationLevel] || formData.educationLevel} — ${formData.grade}`,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration ? `${formData.duration} دقيقة` : undefined,
      terminalCompetency: formData.lessonObjectives,
      materials: formData.materials,
      problemSituation: formData.introduction,
      conclusion: formData.conclusion,
      evaluation: formData.evaluation,
      freeContent: formData.mainActivitiesText,
      language: "arabic",
    });
  };

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
                className="text-end"
              />
            </div>
            <div>
              <Label>المستوى</Label>
              <Input
                value={educationLevelMap[formData.educationLevel]}
                disabled
                className="text-end bg-gray-50"
              />
            </div>
            <div>
              <Label>الصف</Label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="text-end"
              />
            </div>
            <div>
              <Label>المادة</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="text-end"
              />
            </div>
          </div>

          <div>
            <Label>عنوان الدرس</Label>
            <Input
              value={formData.lessonTitle}
              onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
              className="text-end"
            />
          </div>

          <div>
            <Label>المدة (بالدقائق)</Label>
            <Input
              type="number"
              value={formData.duration || ""}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
              className="text-end"
            />
          </div>

          {/* Content Fields */}
          <div>
            <Label>الأهداف والكفايات</Label>
            <Textarea
              value={formData.lessonObjectives || ""}
              onChange={(e) => setFormData({ ...formData, lessonObjectives: e.target.value })}
              className="min-h-[100px] text-end"
            />
          </div>

          <div>
            <Label>الوسائل المطلوبة</Label>
            <Textarea
              value={formData.materials || ""}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="min-h-[80px] text-end"
            />
          </div>

          <div>
            <Label>المقدمة / التمهيد</Label>
            <Textarea
              value={formData.introduction || ""}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              className="min-h-[100px] text-end"
            />
          </div>

          <div>
            <Label>الأنشطة الرئيسية (كل نشاط في سطر)</Label>
            <Textarea
              value={formData.mainActivitiesText || ""}
              onChange={(e) => setFormData({ ...formData, mainActivitiesText: e.target.value })}
              className="min-h-[120px] text-end"
            />
          </div>

          <div>
            <Label>الخاتمة</Label>
            <Textarea
              value={formData.conclusion || ""}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="min-h-[100px] text-end"
            />
          </div>

          <div>
            <Label>التقييم</Label>
            <Textarea
              value={formData.evaluation || ""}
              onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
              className="min-h-[100px] text-end"
            />
          </div>
        </div>

        {/* Rating Section */}
        <div className="border-t pt-4 mt-4">
          <Label className="text-base font-semibold mb-3 block">تقييم جودة الاقتراح</Label>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none transition-colors"
                >
                  {star <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating === 0 ? "لم يتم التقييم" :
               rating === 1 ? "ضعيف" :
               rating === 2 ? "مقبول" :
               rating === 3 ? "جيد" :
               rating === 4 ? "جيد جداً" : "ممتاز"}
            </span>
          </div>
          <Textarea
            placeholder="ملاحظات إضافية (اختياري)..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            className="mt-3 text-end"
            rows={2}
          />
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
          <Button
            variant="default"
            onClick={handleExportLeaderAcademy}
            disabled={exportLeaderAcademy.isPending}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
          >
            <Star className="h-4 w-4" />
            {exportLeaderAcademy.isPending ? "جاري التصدير..." : "قالب Leader Academy PDF ✦"}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              const levelMap: Record<string, string> = { primary: "ابتدائي", middle: "إعدادي", secondary: "ثانوي" };
              exportJathathWord.mutate({
                Header: {
                  title: formData.lessonTitle || "عنوان الدرس",
                  subject: formData.subject || "المادة",
                  level: `${levelMap[formData.educationLevel] || formData.educationLevel} — ${formData.grade}`,
                  duration: formData.duration ? `${formData.duration} دقيقة` : "45 دقيقة",
                  trimester: "الثلاثي الأول",
                  terminalCompetency: formData.lessonObjectives || "الكفاية الختامية",
                  distinctiveObjective: formData.lessonObjectives?.split("\n")[0] || "الهدف المميز",
                  tools: formData.materials || "وسائل الدرس",
                },
                Objectives: formData.lessonObjectives
                  ? formData.lessonObjectives.split("\n").filter(Boolean)
                  : ["الهدف الإجرائي"],
                Stages: [
                  { name: "وضعية المشكلة", teacherRole: "يقدم السند ويطرح السؤال", studentRole: "يلاحظ ويتساءل", duration: "5-8 دق", content: formData.introduction || "وضعية تونسية دالة" },
                  { name: "الفرضيات", teacherRole: "يوجه ويسجل الفرضيات", studentRole: "يقترح تفسيرات", duration: "8-10 دق", content: "صياغة الفرضيات المتوقعة" },
                  { name: "التحقق", teacherRole: "يوزع الأدوات ويراقب", studentRole: "يجرب ويلاحظ ويقيس", duration: "15-20 دق", content: formData.mainActivitiesText || "الأنشطة الرئيسية" },
                  { name: "الاستنتاج", teacherRole: "يهيكل النتائج", studentRole: "يصيغ الاستنتاج", duration: "5-8 دق", content: formData.conclusion || "صياغة المفهوم" },
                  { name: "التقييم", teacherRole: "يقدم التمرين", studentRole: "يحل بشكل فردي", duration: "5-8 دق", content: formData.evaluation || "وضعية إدماجية" },
                ],
                Evaluation: {
                  type: "وضعية إدماجية",
                  question: formData.evaluation || "سؤال التقييم",
                  successCriteria: "الإجابة الصحيحة في 3 من 5 معايير",
                  correctAnswer: "وفق البرنامج الرسمي",
                },
              });
            }}
            disabled={exportJathathWord.isPending}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
          >
            <FileText className="h-4 w-4" />
            {exportJathathWord.isPending ? "جاري التصدير..." : "تصدير Word • ليدر أكاديمي"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
