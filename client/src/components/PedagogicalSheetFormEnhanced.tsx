import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2, Sparkles, BookOpen, Info, Bookmark, Save, FileText, Download, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PromptEngineeringGuide } from "@/components/PromptEngineeringGuide";
import { SavedPromptsDialog } from "@/components/SavedPromptsDialog";
import { PreviewSuggestionDialog } from "@/components/PreviewSuggestionDialog";
import { toast } from "sonner";

interface PedagogicalSheetFormEnhancedProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PedagogicalSheetFormEnhanced({ onClose, onSuccess }: PedagogicalSheetFormEnhancedProps) {
  // Check for templateId in URL
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('templateId');
  
  // Load template if templateId is provided
  const { data: template } = trpc.templates.getById.useQuery(
    { id: parseInt(templateId || '0') },
    { enabled: !!templateId }
  );
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
    mainActivitiesText: "", // Temporary text field
    conclusion: "",
    evaluation: "",
    guidePageReference: "",
    programReference: "",
    language: "auto" as "arabic" | "french" | "english" | "auto", // Optional language override
  });

  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [showSavedPromptsDialog, setShowSavedPromptsDialog] = useState(false);
  const [usedReferences, setUsedReferences] = useState<Array<{ title: string; type: string; url: string }>>([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>("");

  // Fill form with template data when template is loaded
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        educationLevel: template.educationLevel,
        grade: template.grade || "",
        subject: template.subject || "",
        lessonObjectives: template.lessonObjectives || "",
        duration: template.duration?.toString() || "",
        materials: template.materials || "",
        introduction: template.introduction || "",
        mainActivitiesText: template.mainActivities
          ? template.mainActivities.map((a: any) => a.description).join('\n')
          : "",
        conclusion: template.conclusion || "",
        evaluation: template.evaluation || "",
        language: template.language,
      }));
      toast.success(`تم تحميل القالب: ${template.templateName}`);
    }
  }, [template]);

  const createSheet = trpc.pedagogicalSheets.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ المذكرة البيداغوجية بنجاح");
      onSuccess();
    },
    onError: (error) => {
      alert(`خطأ: ${error.message}`);
    },
  });

  const generateAiSuggestion = trpc.pedagogicalSheets.generateAiSuggestion.useMutation({
    onSuccess: (data: any) => {
      const suggestionText = typeof data.suggestion === 'string' ? data.suggestion : '';
      setAiSuggestion(suggestionText);
      setShowAiSuggestion(true);
      setUsedReferences(data.usedReferences || []);
      
      // Auto-fill form fields from AI suggestion
      if (data.parsedContent) {
        setFormData(prev => ({
          ...prev,
          lessonObjectives: data.parsedContent.objectives || prev.lessonObjectives,
          introduction: data.parsedContent.introduction || prev.introduction,
          mainActivitiesText: data.parsedContent.mainActivities || prev.mainActivitiesText,
          conclusion: data.parsedContent.conclusion || prev.conclusion,
          evaluation: data.parsedContent.evaluation || prev.evaluation,
          materials: data.parsedContent.materials || prev.materials,
        }));
      }
    },
    onError: (error: any) => {
      alert(`خطأ في الحصول على الاقتراح: ${error.message}`);
    },
  });

  const savePrompt = trpc.pedagogicalSheets.savePrompt.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ Prompt في المفضلة بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const incrementUsage = trpc.pedagogicalSheets.incrementUsage.useMutation();

  const exportToWord = trpc.pedagogicalSheets.exportAiSuggestionToWord.useMutation({
    onSuccess: (data) => {
      toast.success("تم تصدير الاقتراح إلى Word بنجاح");
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

  const handleAiSuggestion = () => {
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.lessonTitle) {
      alert("يرجى ملء المعلومات الأساسية أولاً (السنة الدراسية، المستوى، الصف، المادة، عنوان الدرس)");
      return;
    }

    // Build the prompt text
    const promptText = `السنة الدراسية: ${formData.schoolYear}\nالمستوى: ${formData.educationLevel === "primary" ? "ابتدائي" : formData.educationLevel === "middle" ? "إعدادي" : "ثانوي"}\nالصف: ${formData.grade}\nالمادة: ${formData.subject}\nعنوان الدرس: ${formData.lessonTitle}`;
    setLastGeneratedPrompt(promptText);

    generateAiSuggestion.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      language: formData.language === "auto" ? undefined : (formData.language as "arabic" | "french" | "english"), // Pass language if selected
    });
  };

  const handleExportToPDF = () => {
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.lessonTitle) {
      toast.error("يرجى ملء المعلومات الأساسية أولاً");
      return;
    }

    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, index) => ({
          title: `نشاط ${index + 1}`,
          duration: 15,
          description: line.trim(),
        }))
      : undefined;

    exportToPDF.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      lessonObjectives: formData.lessonObjectives || undefined,
      materials: formData.materials || undefined,
      introduction: formData.introduction || undefined,
      mainActivities,
      conclusion: formData.conclusion || undefined,
      evaluation: formData.evaluation || undefined,
    });
  };

  const handleExportToWord = () => {
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.lessonTitle) {
      toast.error("يرجى ملء المعلومات الأساسية أولاً");
      return;
    }

    // Parse mainActivitiesText into array
    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, index) => ({
          title: `نشاط ${index + 1}`,
          duration: 15,
          description: line.trim(),
        }))
      : undefined;

    exportToWord.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      lessonObjectives: formData.lessonObjectives || undefined,
      materials: formData.materials || undefined,
      introduction: formData.introduction || undefined,
      mainActivities,
      conclusion: formData.conclusion || undefined,
      evaluation: formData.evaluation || undefined,
    });
  };

  const handleSavePrompt = () => {
    const title = prompt("أدخل عنواناً للPrompt:", `مذكرة ${formData.subject} - ${formData.lessonTitle}`);
    if (!title) return;

    savePrompt.mutate({
      title,
      promptText: lastGeneratedPrompt,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
    });
  };

  const handleSelectSavedPrompt = (promptText: string, promptId: number) => {
    // Parse the prompt text and fill form fields
    const lines = promptText.split('\n');
    lines.forEach(line => {
      if (line.includes('السنة الدراسية:')) {
        const value = line.split(':')[1]?.trim();
        if (value) setFormData(prev => ({ ...prev, schoolYear: value }));
      }
      // Add more parsing as needed
    });

    // Increment usage count
    incrementUsage.mutate({ id: promptId });
    
    // Trigger AI suggestion with the saved prompt
    handleAiSuggestion();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolYear || !formData.educationLevel || !formData.grade || 
        !formData.subject || !formData.lessonTitle) {
      alert("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    // Parse mainActivities from text to JSON array
    const mainActivities = formData.mainActivitiesText
      ? formData.mainActivitiesText.split('\n').filter(line => line.trim()).map((line, idx) => ({
          title: `نشاط ${idx + 1}`,
          description: line.trim(),
          duration: 10, // Default duration
        }))
      : undefined;

    createSheet.mutate({
      schoolYear: formData.schoolYear,
      educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
      grade: formData.grade,
      subject: formData.subject,
      lessonTitle: formData.lessonTitle,
      lessonObjectives: formData.lessonObjectives || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      materials: formData.materials || undefined,
      introduction: formData.introduction || undefined,
      mainActivities,
      conclusion: formData.conclusion || undefined,
      evaluation: formData.evaluation || undefined,
      guidePageReference: formData.guidePageReference || undefined,
      programReference: formData.programReference || undefined,
      status: "draft",
    });
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>إنشاء مذكرة بيداغوجية جديدة</CardTitle>
            <CardDescription>
              املأ المعلومات التالية واستخدم المساعد الذكي للحصول على اقتراحات بناءً على المراجع الرسمية
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
                        <SelectItem value="السنة السابعة أساسي">السنة السابعة أساسي</SelectItem>
                        <SelectItem value="السنة الثامنة أساسي">السنة الثامنة أساسي</SelectItem>
                        <SelectItem value="السنة التاسعة أساسي">السنة التاسعة أساسي</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="language">لغة التوليد (اختياري)</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value as "arabic" | "french" | "english" | "auto" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="كشف تلقائي من المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">كشف تلقائي من المادة</SelectItem>
                    <SelectItem value="arabic">العربية</SelectItem>
                    <SelectItem value="french">Français</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  إذا لم تختر لغة، سيتم كشفها تلقائيًا من المادة (مثلاً: اللغة الفرنسية → فرنسية)
                </p>
              </div>
            </div>
            
            {/* عنوان الدرس */}
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
          </div>

          {/* تفاصيل الدرس */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">تفاصيل الدرس</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPromptGuide(true)}
                  className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Info className="h-4 w-4" />
                  دليل هندسة الأوامر
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedPromptsDialog(true)}
                  className="gap-1"
                >
                  <Bookmark className="h-4 w-4" />
                  مكتبة Prompts
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiSuggestion}
                  disabled={generateAiSuggestion.isPending || !formData.lessonTitle}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                >
                {generateAiSuggestion.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحصول على الاقتراح...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    اقتراح محتوى بالذكاء الاصطناعي
                  </>
                )}
                </Button>
              </div>
            </div>

            {showAiSuggestion && aiSuggestion && (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900 whitespace-pre-wrap">
                    {aiSuggestion}
                  </AlertDescription>
                </Alert>
                {usedReferences.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">المراجع الرسمية المستخدمة:</h4>
                    <ul className="space-y-1">
                      {usedReferences.map((ref, idx) => (
                        <li key={idx} className="text-xs text-green-700">
                          <a 
                            href={ref.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <BookOpen className="h-3 w-3" />
                            {ref.title}
                            <span className="text-green-600">({ref.type === 'teacher_guide' ? 'دليل المعلم' : ref.type === 'official_program' ? 'برنامج رسمي' : 'مرجع'})</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSavePrompt}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    حفظ في المفضلة
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setShowPreviewDialog(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    معاينة وتعديل
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleExportToWord}
                    disabled={exportToWord.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {exportToWord.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Word
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleExportToPDF}
                    disabled={exportToPDF.isPending}
                    className="gap-2 bg-red-600 hover:bg-red-700"
                  >
                    {exportToPDF.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    PDF
                  </Button>
                </div>
              </>
            )}

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
              <Label htmlFor="mainActivities">الأنشطة الرئيسية</Label>
              <Textarea
                id="mainActivities"
                placeholder="أدخل الأنشطة الرئيسية للدرس (كل سطر نشاط منفصل)"
                value={formData.mainActivitiesText}
                onChange={(e) => setFormData({ ...formData, mainActivitiesText: e.target.value })}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">ملاحظة: كل سطر سيتم تحويله إلى نشاط منفصل</p>
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
              {createSheet.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء المذكرة"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    <PromptEngineeringGuide open={showPromptGuide} onOpenChange={setShowPromptGuide} />
    <SavedPromptsDialog 
      open={showSavedPromptsDialog} 
      onOpenChange={setShowSavedPromptsDialog}
      onSelectPrompt={handleSelectSavedPrompt}
    />
    <PreviewSuggestionDialog
      open={showPreviewDialog}
      onClose={() => setShowPreviewDialog(false)}
      initialData={{
        schoolYear: formData.schoolYear,
        educationLevel: formData.educationLevel as "primary" | "middle" | "secondary",
        grade: formData.grade,
        subject: formData.subject,
        lessonTitle: formData.lessonTitle,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        lessonObjectives: formData.lessonObjectives,
        materials: formData.materials,
        introduction: formData.introduction,
        mainActivitiesText: formData.mainActivitiesText,
        conclusion: formData.conclusion,
        evaluation: formData.evaluation,
      }}
      rawSuggestion={aiSuggestion}
      usedReferences={usedReferences}
    />
    </>
  );
}
