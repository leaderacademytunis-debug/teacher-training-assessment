import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Streamdown } from "streamdown";
import {
  Upload, ScanLine, Wand2, Save, FileDown, FileText, Image as ImageIcon,
  Loader2, ArrowLeft, Trash2, Eye, RotateCcw, Download, ChevronRight,
  BookOpen, ClipboardCheck, Calendar, FileQuestion, Sparkles,
  X, Check, AlertCircle, History, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

// ===== CONSTANTS =====
const SUBJECTS = [
  "اللغة العربية", "الرياضيات", "الإيقاظ العلمي", "التربية الإسلامية",
  "التربية المدنية", "التاريخ", "الجغرافيا", "اللغة الفرنسية",
  "اللغة الإنجليزية", "التربية التشكيلية", "التربية الموسيقية",
  "التربية البدنية", "الإعلامية",
];

const LEVELS = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
  "السنة السابعة أساسي", "السنة الثامنة أساسي", "السنة التاسعة أساسي",
];

const FORMAT_TYPES = [
  { value: "lesson_plan", label: "جذاذة بيداغوجية", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  { value: "exam", label: "اختبار رسمي", icon: ClipboardCheck, color: "bg-orange-100 text-orange-700" },
  { value: "evaluation", label: "ورقة تقييم", icon: FileText, color: "bg-green-100 text-green-700" },
  { value: "annual_plan", label: "مخطط سنوي", icon: Calendar, color: "bg-purple-100 text-purple-700" },
  { value: "other", label: "وثيقة أخرى", icon: FileQuestion, color: "bg-gray-100 text-gray-700" },
];

type FormatType = "lesson_plan" | "exam" | "evaluation" | "annual_plan" | "other";

// ===== STEP INDICATOR =====
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "رفع الصورة", icon: Upload },
    { num: 2, label: "استخراج النص (OCR)", icon: ScanLine },
    { num: 3, label: "تنسيق بالذكاء الاصطناعي", icon: Wand2 },
    { num: 4, label: "حفظ وتصدير", icon: Save },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.num;
        const isDone = currentStep > step.num;
        return (
          <div key={step.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              isActive ? "bg-blue-600 text-white shadow-lg scale-105" :
              isDone ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-400"
            }`}>
              {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              <span className="text-sm font-medium sm:hidden">{step.num}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className={`w-4 h-4 ${isDone ? "text-green-500" : "text-gray-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function LegacyDigitizer() {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [formattedContent, setFormattedContent] = useState("");
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formatType, setFormatType] = useState<FormatType>("lesson_plan");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingText, setEditingText] = useState(false);

  // Mutations
  const uploadOCR = trpc.legacyDigitizer.uploadAndOCR.useMutation();
  const formatAI = trpc.legacyDigitizer.formatWithAI.useMutation();
  const saveMutation = trpc.legacyDigitizer.save.useMutation();
  const exportWord = trpc.legacyDigitizer.exportWord.useMutation();
  const exportPDF = trpc.legacyDigitizer.exportPDF.useMutation();
  const deleteMutation = trpc.legacyDigitizer.delete.useMutation();

  // Queries
  const { data: documents, refetch: refetchDocs } = trpc.legacyDigitizer.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // ===== HANDLERS =====
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى رفع صورة فقط (JPG, PNG, WEBP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن لا يتجاوز 10 ميغابايت");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCurrentStep(1);
    setExtractedText("");
    setFormattedContent("");
    setDocumentId(null);
  }, []);

  const handleUploadAndOCR = useCallback(async () => {
    if (!selectedFile) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      toast.loading("جاري استخراج النص من الصورة...", { id: "ocr" });

      const result = await uploadOCR.mutateAsync({
        base64Data: base64,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        title: documentTitle || undefined,
      });

      setDocumentId(result.id);
      setImageUrl(result.imageUrl);
      setExtractedText(result.extractedText);
      setCurrentStep(2);
      toast.success("تم استخراج النص بنجاح!", { id: "ocr" });
      refetchDocs();
    } catch (error: any) {
      toast.error(error.message || "فشل في استخراج النص", { id: "ocr" });
    }
  }, [selectedFile, documentTitle, uploadOCR, refetchDocs]);

  const handleFormatWithAI = useCallback(async () => {
    if (!documentId || !extractedText) return;

    try {
      toast.loading("جاري تنسيق الوثيقة بالذكاء الاصطناعي...", { id: "format" });

      const result = await formatAI.mutateAsync({
        documentId,
        extractedText,
        formatType,
        subject: subject || undefined,
        level: level || undefined,
        additionalInstructions: additionalInstructions || undefined,
      });

      setFormattedContent(result.formattedContent);
      setCurrentStep(3);
      toast.success("تم تنسيق الوثيقة بنجاح!", { id: "format" });
    } catch (error: any) {
      toast.error(error.message || "فشل في تنسيق الوثيقة", { id: "format" });
    }
  }, [documentId, extractedText, formatType, subject, level, additionalInstructions, formatAI]);

  const handleSave = useCallback(async () => {
    if (!documentId) return;

    try {
      toast.loading("جاري الحفظ...", { id: "save" });

      await saveMutation.mutateAsync({
        documentId,
        title: documentTitle || undefined,
        formattedContent: formattedContent || undefined,
        subject: subject || undefined,
        level: level || undefined,
      });

      setCurrentStep(4);
      toast.success("تم حفظ الوثيقة في مكتبتك!", { id: "save" });
      refetchDocs();
    } catch (error: any) {
      toast.error(error.message || "فشل في الحفظ", { id: "save" });
    }
  }, [documentId, documentTitle, formattedContent, subject, level, saveMutation, refetchDocs]);

  const handleExportWord = useCallback(async () => {
    if (!documentId) return;
    try {
      toast.loading("جاري تصدير Word...", { id: "export-word" });
      const result = await exportWord.mutateAsync({ documentId });
      window.open(result.url, "_blank");
      toast.success("تم تصدير الملف بنجاح!", { id: "export-word" });
    } catch (error: any) {
      toast.error(error.message || "فشل في التصدير", { id: "export-word" });
    }
  }, [documentId, exportWord]);

  const handleExportPDF = useCallback(async () => {
    if (!documentId) return;
    try {
      toast.loading("جاري تصدير PDF...", { id: "export-pdf" });
      const result = await exportPDF.mutateAsync({ documentId });
      window.open(result.url, "_blank");
      toast.success("تم تصدير الملف بنجاح!", { id: "export-pdf" });
    } catch (error: any) {
      toast.error(error.message || "فشل في التصدير", { id: "export-pdf" });
    }
  }, [documentId, exportPDF]);

  const handleLoadDocument = useCallback((doc: any) => {
    setDocumentId(doc.id);
    setDocumentTitle(doc.title);
    setImageUrl(doc.originalImageUrl);
    setExtractedText(doc.extractedText || "");
    setFormattedContent(doc.formattedContent || "");
    setSubject(doc.subject || "");
    setLevel(doc.level || "");
    setFormatType(doc.formatType || "lesson_plan");

    if (doc.formattedContent) {
      setCurrentStep(4);
    } else if (doc.extractedText) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, []);

  const handleDeleteDocument = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("تم حذف الوثيقة");
      refetchDocs();
      if (documentId === id) {
        resetAll();
      }
    } catch {
      toast.error("فشل في حذف الوثيقة");
    }
  }, [deleteMutation, refetchDocs, documentId]);

  const resetAll = useCallback(() => {
    setCurrentStep(1);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDocumentTitle("");
    setExtractedText("");
    setFormattedContent("");
    setDocumentId(null);
    setImageUrl(null);
    setFormatType("lesson_plan");
    setSubject("");
    setLevel("");
    setAdditionalInstructions("");
    setEditingText(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ===== AUTH CHECK =====
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center space-y-4">
            <ScanLine className="w-16 h-16 mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">رقمنة الوثائق التعليمية</h2>
            <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى أداة الرقمنة</p>
            <a href={getLoginUrl()} className="inline-block">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                تسجيل الدخول
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 ml-1" />
                الرئيسية
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Legacy Digitizer</h1>
                <p className="text-xs text-gray-500">رقمنة الوثائق التعليمية القديمة</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="w-4 h-4 ml-1" />
              جديد
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Document History */}
        {showSidebar && (
          <aside className="w-72 shrink-0 hidden lg:block">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-4 h-4" />
                  الوثائق المرقمنة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {!documents || documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8 px-4">
                      لا توجد وثائق مرقمنة بعد
                    </p>
                  ) : (
                    <div className="space-y-1 px-2 pb-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                            documentId === doc.id ? "bg-blue-50 border border-blue-200" : ""
                          }`}
                          onClick={() => handleLoadDocument(doc)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] px-1.5">
                                  {FORMAT_TYPES.find(f => f.value === doc.formatType)?.label || "وثيقة"}
                                </Badge>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(doc.createdAt).toLocaleDateString("ar-TN")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {doc.status === "saved" && <Badge className="bg-green-100 text-green-700 text-[10px]">محفوظ</Badge>}
                                {doc.status === "formatted" && <Badge className="bg-blue-100 text-blue-700 text-[10px]">منسّق</Badge>}
                                {doc.status === "ocr_done" && <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">مستخرج</Badge>}
                                {doc.status === "uploaded" && <Badge className="bg-gray-100 text-gray-700 text-[10px]">مرفوع</Badge>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <StepIndicator currentStep={currentStep} />

          {/* Step 1: Upload */}
          {currentStep === 1 && !extractedText && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    رفع صورة الوثيقة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="عنوان الوثيقة (اختياري)"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="text-right"
                  />

                  {/* Drop zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      previewUrl
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="معاينة"
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-400">اضغط لتغيير الصورة</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700">اسحب الصورة هنا أو اضغط للرفع</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP — حتى 10 ميغابايت</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {previewUrl && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      onClick={handleUploadAndOCR}
                      disabled={uploadOCR.isPending}
                    >
                      {uploadOCR.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          جاري استخراج النص...
                        </>
                      ) : (
                        <>
                          <ScanLine className="w-5 h-5 ml-2" />
                          مسح واستخراج النص (OCR)
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Steps 2-4: Side-by-side view */}
          {(currentStep >= 2 || extractedText) && (
            <div className="space-y-6">
              {/* Format options (Step 2) */}
              {currentStep === 2 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">نوع الوثيقة</label>
                        <Select value={formatType} onValueChange={(v) => setFormatType(v as FormatType)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORMAT_TYPES.map(ft => (
                              <SelectItem key={ft.value} value={ft.value}>
                                <span className="flex items-center gap-2">
                                  <ft.icon className="w-4 h-4" />
                                  {ft.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">المادة</label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">المستوى</label>
                        <Select value={level} onValueChange={setLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map(l => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">تعليمات إضافية</label>
                        <Input
                          placeholder="تعليمات خاصة (اختياري)"
                          value={additionalInstructions}
                          onChange={(e) => setAdditionalInstructions(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="lg"
                        onClick={handleFormatWithAI}
                        disabled={formatAI.isPending || !extractedText}
                      >
                        {formatAI.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            جاري التنسيق بالذكاء الاصطناعي...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 ml-2" />
                            تنسيق بالذكاء الاصطناعي
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Side-by-side: Original Image vs Extracted/Formatted Text */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Image */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      الصورة الأصلية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      {(imageUrl || previewUrl) ? (
                        <img
                          src={imageUrl || previewUrl || ""}
                          alt="الوثيقة الأصلية"
                          className="w-full object-contain"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          <p>لم يتم رفع صورة بعد</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Right: Extracted / Formatted Text */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {formattedContent ? "النص المنسّق" : "النص المستخرج (OCR)"}
                      </CardTitle>
                      {extractedText && !formattedContent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingText(!editingText)}
                        >
                          {editingText ? <Eye className="w-4 h-4" /> : <span className="text-xs">تعديل</span>}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      <div className="p-4">
                        {formattedContent ? (
                          <Tabs defaultValue="preview">
                            <TabsList className="mb-4">
                              <TabsTrigger value="preview">معاينة</TabsTrigger>
                              <TabsTrigger value="raw">النص الخام</TabsTrigger>
                              <TabsTrigger value="ocr">النص المستخرج</TabsTrigger>
                            </TabsList>
                            <TabsContent value="preview">
                              <div className="prose prose-sm max-w-none" dir="rtl">
                                <Streamdown>{formattedContent}</Streamdown>
                              </div>
                            </TabsContent>
                            <TabsContent value="raw">
                              <Textarea
                                value={formattedContent}
                                onChange={(e) => setFormattedContent(e.target.value)}
                                className="min-h-[500px] font-mono text-sm"
                                dir="rtl"
                              />
                            </TabsContent>
                            <TabsContent value="ocr">
                              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                {extractedText}
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : editingText ? (
                          <Textarea
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                            className="min-h-[500px] text-sm"
                            dir="rtl"
                          />
                        ) : extractedText ? (
                          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                            {extractedText}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 py-20">
                            <div className="text-center space-y-2">
                              <ScanLine className="w-12 h-12 mx-auto text-gray-300" />
                              <p>ارفع صورة لاستخراج النص</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Action buttons */}
              {(currentStep >= 3 || formattedContent) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 ml-2" />
                          )}
                          حفظ في المكتبة
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleFormatWithAI}
                          disabled={formatAI.isPending}
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          إعادة التنسيق
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={handleExportWord}
                          disabled={exportWord.isPending}
                        >
                          {exportWord.isPending ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4 ml-2" />
                          )}
                          تصدير Word
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleExportPDF}
                          disabled={exportPDF.isPending}
                        >
                          {exportPDF.isPending ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 ml-2" />
                          )}
                          تصدير PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Format options when already formatted - allow re-format */}
              {currentStep >= 3 && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">خيارات إعادة التنسيق</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select value={formatType} onValueChange={(v) => setFormatType(v as FormatType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMAT_TYPES.map(ft => (
                            <SelectItem key={ft.value} value={ft.value}>
                              <span className="flex items-center gap-2">
                                <ft.icon className="w-4 h-4" />
                                {ft.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="تعليمات إضافية"
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
