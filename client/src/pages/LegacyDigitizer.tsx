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
  FolderUp, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ToolPageHeader from "@/components/ToolPageHeader";

const DIGITIZER_GRADIENT = "linear-gradient(135deg, #2563eb, #4338ca)";

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
  const matchCompetencies = trpc.legacyDigitizer.matchCompetencies.useMutation();

  // Batch upload state
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<Array<{
    file: File;
    previewUrl: string;
    status: "pending" | "processing" | "done" | "error";
    title: string;
    documentId?: number;
    extractedText?: string;
    error?: string;
  }>>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const batchInputRef = useRef<HTMLInputElement>(null);

  // Competency matches state
  const [competencyMatches, setCompetencyMatches] = useState<Array<{
    topicId: number;
    topicTitle: string;
    competency: string | null;
    competencyCode: string | null;
    objectives: string | null;
    periodName: string | null;
    textbookRef: string | null;
    matchScore: number;
    matchedKeywords: string[];
  }>>([]);
  const [competencySuggestions, setCompetencySuggestions] = useState<string[]>([]);

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

      // Auto-match competencies in background
      try {
        const matchResult = await matchCompetencies.mutateAsync({
          extractedText: result.extractedText,
          subject: subject || undefined,
          level: level || undefined,
        });
        if (matchResult.matches.length > 0) {
          setCompetencyMatches(matchResult.matches);
          toast.info(`تم العثور على ${matchResult.matches.length} كفاية مرتبطة بالمنهج`);
        }
        if (matchResult.suggestions.length > 0) {
          setCompetencySuggestions(matchResult.suggestions);
        }
      } catch { /* non-critical */ }
    } catch (error: any) {
      const errorMsg = error.message || "فشل في استخراج النص";
      toast.error(errorMsg, { 
        id: "ocr",
        duration: 8000,
        action: {
          label: "إعادة المحاولة",
          onClick: () => handleUploadAndOCR(),
        },
      });
    }
  }, [selectedFile, documentTitle, uploadOCR, refetchDocs, matchCompetencies, subject, level]);

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
      const errorMsg = error.message || "فشل في تنسيق الوثيقة";
      toast.error(errorMsg, { 
        id: "format",
        duration: 8000,
        action: {
          label: "إعادة المحاولة",
          onClick: () => handleFormatWithAI(),
        },
      });
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

  // ===== BATCH UPLOAD HANDLERS =====
  const handleBatchFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (validFiles.length === 0) {
      toast.error("لم يتم العثور على صور صالحة");
      return;
    }
    if (validFiles.length < files.length) {
      toast.warning(`تم تجاهل ${files.length - validFiles.length} ملف غير صالح`);
    }
    const newBatchFiles = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending" as const,
      title: file.name.replace(/\.[^.]+$/, ""),
    }));
    setBatchFiles(prev => [...prev, ...newBatchFiles]);
    toast.success(`تم إضافة ${validFiles.length} صورة للدفعة`);
  }, []);

  const removeBatchFile = useCallback((index: number) => {
    setBatchFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const processBatch = useCallback(async () => {
    if (batchFiles.length === 0) return;
    setBatchProcessing(true);
    setBatchProgress(0);

    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      if (item.status === "done") {
        setBatchProgress(((i + 1) / batchFiles.length) * 100);
        continue;
      }

      setBatchFiles(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "processing" };
        return updated;
      });

      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        const result = await uploadOCR.mutateAsync({
          base64Data: base64,
          fileName: item.file.name,
          mimeType: item.file.type,
          title: item.title || `وثيقة دفعة ${i + 1}`,
        });

        setBatchFiles(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: "done",
            documentId: result.id,
            extractedText: result.extractedText,
          };
          return updated;
        });
      } catch (error: any) {
        setBatchFiles(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: "error",
            error: error.message || "فشل في المعالجة",
          };
          return updated;
        });
      }

      setBatchProgress(((i + 1) / batchFiles.length) * 100);
    }

    setBatchProcessing(false);
    refetchDocs();
    const doneCount = batchFiles.filter(f => f.status === "done" || f.status === "pending").length;
    toast.success(`تم معالجة ${doneCount} وثيقة بنجاح`);
  }, [batchFiles, uploadOCR, refetchDocs]);

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
    setCompetencyMatches([]);
    setCompetencySuggestions([]);
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
      <ToolPageHeader
        icon={ScanLine}
        nameAr="Legacy Digitizer"
        nameFr="Legacy Digitizer"
        nameEn="Legacy Digitizer"
        descAr="رقمنة الوثائق التعليمية القديمة"
        descFr="Numérisation des documents éducatifs anciens"
        descEn="Digitize legacy educational documents"
        gradient={DIGITIZER_GRADIENT}
        backTo="/"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={batchMode ? "default" : "outline"}
              size="sm"
              onClick={() => { setBatchMode(!batchMode); if (!batchMode) { resetAll(); } }}
              className={batchMode ? "bg-amber-600 hover:bg-amber-700" : "bg-white/15 text-white border-white/30 hover:bg-white/25"}
            >
              <FolderUp className="w-4 h-4 ml-1" />
              {batchMode ? "وضع الدفعة" : "رفع جماعي"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { resetAll(); setBatchMode(false); setBatchFiles([]); }}
              className="bg-white/15 text-white border-white/30 hover:bg-white/25">
              <RotateCcw className="w-4 h-4 ml-1" />
              جديد
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-white hover:bg-white/15"
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          </div>
        }
      />

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

          {/* Batch Upload Mode */}
          {batchMode && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderUp className="w-5 h-5 text-amber-600" />
                    رفع جماعي — رقمنة فصل دراسي كامل
                    <Badge variant="outline" className="mr-auto text-xs">{batchFiles.length} صورة</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop zone for multiple files */}
                  <div
                    className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all"
                    onClick={() => batchInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                      if (files.length > 0) {
                        const newFiles = files.filter(f => f.size <= 10 * 1024 * 1024).map(file => ({
                          file,
                          previewUrl: URL.createObjectURL(file),
                          status: "pending" as const,
                          title: file.name.replace(/\.[^.]+$/, ""),
                        }));
                        setBatchFiles(prev => [...prev, ...newFiles]);
                        toast.success(`تم إضافة ${newFiles.length} صورة`);
                      }
                    }}
                  >
                    <input
                      ref={batchInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleBatchFileSelect}
                    />
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                        <FolderUp className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">اسحب عدة صور هنا أو اضغط للاختيار</p>
                        <p className="text-sm text-gray-500 mt-1">يمكنك رفع جميع جذاذات واختبارات الفصل الدراسي دفعة واحدة</p>
                      </div>
                    </div>
                  </div>

                  {/* Batch file list */}
                  {batchFiles.length > 0 && (
                    <div className="space-y-3">
                      {batchProcessing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">جاري المعالجة...</span>
                            <span className="font-medium">{Math.round(batchProgress)}%</span>
                          </div>
                          <Progress value={batchProgress} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {batchFiles.map((item, idx) => (
                          <div key={idx} className={`relative rounded-lg border p-3 transition-all ${
                            item.status === "done" ? "border-green-200 bg-green-50/50" :
                            item.status === "error" ? "border-red-200 bg-red-50/50" :
                            item.status === "processing" ? "border-blue-200 bg-blue-50/50 animate-pulse" :
                            "border-gray-200"
                          }`}>
                            <div className="flex items-start gap-3">
                              <img src={item.previewUrl} alt="" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <Input
                                  value={item.title}
                                  onChange={(e) => {
                                    setBatchFiles(prev => {
                                      const updated = [...prev];
                                      updated[idx] = { ...updated[idx], title: e.target.value };
                                      return updated;
                                    });
                                  }}
                                  className="text-xs h-7 mb-1"
                                  placeholder="عنوان الوثيقة"
                                  disabled={item.status !== "pending"}
                                />
                                <div className="flex items-center gap-1">
                                  {item.status === "pending" && (
                                    <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 ml-0.5" />في الانتظار</Badge>
                                  )}
                                  {item.status === "processing" && (
                                    <Badge className="bg-blue-100 text-blue-700 text-[10px]"><Loader2 className="w-3 h-3 ml-0.5 animate-spin" />جاري...</Badge>
                                  )}
                                  {item.status === "done" && (
                                    <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle2 className="w-3 h-3 ml-0.5" />تم</Badge>
                                  )}
                                  {item.status === "error" && (
                                    <Badge className="bg-red-100 text-red-700 text-[10px]"><XCircle className="w-3 h-3 ml-0.5" />فشل</Badge>
                                  )}
                                </div>
                                {item.error && <p className="text-[10px] text-red-500 mt-1">{item.error}</p>}
                              </div>
                              {item.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                  onClick={() => removeBatchFile(idx)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Batch actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          className="bg-amber-600 hover:bg-amber-700 flex-1"
                          size="lg"
                          onClick={processBatch}
                          disabled={batchProcessing || batchFiles.every(f => f.status === "done")}
                        >
                          {batchProcessing ? (
                            <><Loader2 className="w-5 h-5 ml-2 animate-spin" />جاري معالجة {batchFiles.length} وثيقة...</>
                          ) : batchFiles.every(f => f.status === "done") ? (
                            <><CheckCircle2 className="w-5 h-5 ml-2" />تم معالجة الجميع!</>
                          ) : (
                            <><ScanLine className="w-5 h-5 ml-2" />بدء الرقمنة الجماعية ({batchFiles.filter(f => f.status === "pending").length} وثيقة)</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => { setBatchFiles([]); setBatchProgress(0); }}
                          disabled={batchProcessing}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          مسح الكل
                        </Button>
                      </div>

                      {/* Summary after processing */}
                      {!batchProcessing && batchFiles.some(f => f.status === "done") && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              تم رقمنة {batchFiles.filter(f => f.status === "done").length} وثيقة بنجاح
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            يمكنك الآن العودة للوضع العادي وفتح كل وثيقة من الشريط الجانبي لتنسيقها بالذكاء الاصطناعي وتصديرها.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => { setBatchMode(false); setBatchFiles([]); setBatchProgress(0); }}
                          >
                            <ArrowLeft className="w-4 h-4 ml-1" />
                            العودة للوضع العادي
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 1: Upload */}
          {!batchMode && currentStep === 1 && !extractedText && (
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

              {/* Competency Matches Panel */}
              {(competencyMatches.length > 0 || competencySuggestions.length > 0) && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800">الكفايات المرتبطة من خريطة المنهج</span>
                      {matchCompetencies.isPending && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {competencyMatches.length > 0 && (
                      <div className="space-y-2">
                        {competencyMatches.slice(0, 5).map((match, idx) => (
                          <div key={match.topicId} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-amber-700">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm text-gray-900">{match.topicTitle}</span>
                                {match.competencyCode && (
                                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                    {match.competencyCode}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                  تطابق {Math.min(Math.round(match.matchScore * 10), 100)}%
                                </Badge>
                              </div>
                              {match.competency && (
                                <p className="text-xs text-gray-600 mt-1">الكفاية: {match.competency}</p>
                              )}
                              {match.periodName && (
                                <p className="text-xs text-gray-500 mt-0.5">الفترة: {match.periodName}</p>
                              )}
                              {match.textbookRef && (
                                <p className="text-xs text-gray-500 mt-0.5">المرجع: {match.textbookRef}</p>
                              )}
                              {match.matchedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {match.matchedKeywords.slice(0, 6).map(kw => (
                                    <span key={kw} className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {competencyMatches.length === 0 && competencySuggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-amber-700 mb-2">لم يتم العثور على تطابق مباشر في خريطة المنهج. اقتراحات الذكاء الاصطناعي:</p>
                        {competencySuggestions.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border border-amber-100">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs text-gray-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                        onClick={async () => {
                          if (!extractedText) return;
                          try {
                            const result = await matchCompetencies.mutateAsync({
                              extractedText,
                              subject: subject || undefined,
                              level: level || undefined,
                            });
                            setCompetencyMatches(result.matches);
                            setCompetencySuggestions(result.suggestions);
                            if (result.matches.length === 0 && result.suggestions.length === 0) {
                              toast.info("لم يتم العثور على كفايات مرتبطة");
                            }
                          } catch {
                            toast.error("فشل في البحث عن الكفايات");
                          }
                        }}
                        disabled={matchCompetencies.isPending}
                      >
                        {matchCompetencies.isPending ? (
                          <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3 ml-1" />
                        )}
                        إعادة البحث
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
