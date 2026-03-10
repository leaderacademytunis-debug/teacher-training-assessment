import { useState, useEffect, useMemo } from "react";
import PrintPreview from "@/components/PrintPreview";
import ImageOverlayEditor from "@/components/ImageOverlayEditor";
import EducationalImageLibrary from "@/components/EducationalImageLibrary";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { LockedFeature, usePermissions } from "@/components/LockedFeature";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  "اللغة العربية", "الرياضيات", "الإيقاظ العلمي", "التربية الإسلامية",
  "التربية المدنية", "اللغة الفرنسية", "التربية التشكيلية",
  "التربية الموسيقية", "التربية البدنية",
];
const LEVELS = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
];
const TRIMESTERS = ["الثلاثي الأول", "الثلاثي الثاني", "الثلاثي الثالث"];
const DURATIONS = ["30 دقيقة", "45 دقيقة", "60 دقيقة", "90 دقيقة"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadBase64(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i));
  const blob = new Blob([new Uint8Array(byteNums)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(ts: Date | string | number) {
  return new Date(ts).toLocaleDateString("ar-TN", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Criteria Badge ────────────────────────────────────────────────────────────

function CriteriaBadge({ code, label, color }: { code: string; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${color}`}>
      <span className="font-bold text-sm font-mono">{code}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

// ─── Library Item ──────────────────────────────────────────────────────────────

type SavedExam = {
  id: number;
  subject: string;
  level: string;
  trimester: string;
  duration: string | null;
  totalScore: number | null;
  topics: string | null;
  examContent: string;
  answerKeyContent: string | null;
  createdAt: Date;
};

function LibraryItem({
  exam,
  onLoad,
  onDelete,
}: {
  exam: SavedExam;
  onLoad: (exam: SavedExam) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex-1 min-w-0 text-right">
        <p className="font-semibold text-white text-sm truncate">
          {exam.subject} — {exam.level}
        </p>
        <p className="text-xs text-blue-300">{exam.trimester} · {formatDate(exam.createdAt)}</p>
        {exam.topics && <p className="text-xs text-white/40 truncate mt-0.5">{exam.topics}</p>}
      </div>
      <div className="flex gap-2 mr-3 shrink-0">
        {exam.answerKeyContent && (
          <Badge className="bg-purple-700 text-white text-xs">+ تصحيح</Badge>
        )}
        <Button size="sm" variant="outline" onClick={() => onLoad(exam)}
          className="border-blue-500/50 text-blue-300 hover:bg-blue-900/30 text-xs h-7 px-2">
          تحميل
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(exam.id)}
          className="border-red-500/30 text-red-400 hover:bg-red-900/20 text-xs h-7 px-2">
          حذف
        </Button>
      </div>
    </div>
  );
}

// ─── Exam Content With Inline Images ─────────────────────────────────────────────────────────────

function ExamContentWithImages({ content, images }: { content: string; images: Array<{ url: string; caption?: string }> }) {
  // Build a map from caption to URL
  const imageMap = new Map<string, string>();
  images.forEach(img => {
    if (img.caption) imageMap.set(img.caption.trim(), img.url);
  });

  // Split content by [رسم: ...] placeholders and render inline images
  const parts: Array<{ type: 'text' | 'image'; text: string; url?: string }> = [];
  const regex = /\[رسم:\s*([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    const desc = match[1].trim();
    const url = imageMap.get(desc);
    parts.push({ type: 'image', text: desc, url });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <Streamdown key={i}>{part.text}</Streamdown>;
        }
        if (part.url) {
          return (
            <div key={i} className="my-3 text-center">
              <img
                src={part.url}
                alt={part.text}
                className="mx-auto max-w-[280px] max-h-[220px] rounded-lg border border-white/20"
                style={{ filter: "grayscale(100%) contrast(1.2)" }}
              />
              <p className="text-[10px] text-white/50 mt-1">{part.text}</p>
            </div>
          );
        }
        // No image generated yet - show placeholder
        return (
          <div key={i} className="my-3 p-4 border-2 border-dashed border-white/20 rounded-lg text-center text-white/40">
            <span className="text-2xl block mb-1">🎨</span>
            <span className="text-xs">رسم توضيحي: {part.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────────────────────

export default function ExamBuilder() {
  // ── ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN ──
  const { hasEdugpt, isAdmin, isLoading: permLoading, tier } = usePermissions();
  const isFreeAccount = tier === "free" && !isAdmin;

  // Auth & school name
  const { user, refresh: refreshAuth } = useAuth();
  const userSchoolName = (user as any)?.schoolName || "";
  const [schoolNameInput, setSchoolNameInput] = useState(userSchoolName);
  const [schoolNameSaved, setSchoolNameSaved] = useState(false);

  // Save school name to profile
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      setSchoolNameSaved(true);
      refreshAuth();
      toast.success("تم حفظ اسم المدرسة في ملفك الشخصي");
      setTimeout(() => setSchoolNameSaved(false), 2000);
    },
  });

  // Upload school logo
  const uploadSchoolLogo = trpc.profile.uploadSchoolLogo.useMutation({
    onSuccess: () => refreshAuth(),
  });

  // Initialize schoolLogo from user profile
  const userSchoolLogo = (user as any)?.schoolLogo || "";

  // Form state
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [trimester, setTrimester] = useState("");
  const [duration, setDuration] = useState("45 دقيقة");
  const [totalScore, setTotalScore] = useState(20);
  const [topics, setTopics] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [examImages, setExamImages] = useState<Array<{ url: string; caption?: string }>>([]);
  const [generatingImages, setGeneratingImages] = useState(false);

  // Result state
  const [generatedExam, setGeneratedExam] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [activeTab, setActiveTab] = useState<"exam" | "answer">("exam");
  const [copied, setCopied] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [suggestedImages, setSuggestedImages] = useState<Array<{prompt_ar: string; prompt_en: string; type: string}>>([]);
  const [, navigate] = useLocation();
  const [draggedImage, setDraggedImage] = useState<{url: string; caption?: string} | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string>("");
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [overlayEditorImage, setOverlayEditorImage] = useState<{url: string; caption?: string} | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  // tRPC hooks
  const utils = trpc.useUtils();

  const generateExam = trpc.edugpt.generateExam.useMutation({
    onSuccess: (data) => {
      setGeneratedExam(data.exam);
      setAnswerKey("");
      setActiveTab("exam");
      toast.success("تم إنشاء الاختبار بنجاح!");
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const saveExam = trpc.edugpt.saveExam.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الاختبار في المكتبة ✅");
      utils.edugpt.listExams.invalidate();
    },
    onError: (err) => toast.error(`خطأ في الحفظ: ${err.message}`),
  });

  const deleteExam = trpc.edugpt.deleteExam.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الاختبار");
      utils.edugpt.listExams.invalidate();
    },
  });

  const generateAnswerKey = trpc.edugpt.generateAnswerKey.useMutation({
    onSuccess: (data) => {
      setAnswerKey(data.answerKey);
      setActiveTab("answer");
      toast.success("تم إنشاء نموذج الإجابة النموذجية ✅");
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const exportWord = trpc.edugpt.exportExamWord.useMutation({
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename);
      toast.success("تم تحميل ملف Word ✅");
    },
    onError: (err) => toast.error(`خطأ في التصدير: ${err.message}`),
  });

  const { data: savedExams, isLoading: loadingExams } = trpc.edugpt.listExams.useQuery(undefined, {
    enabled: showLibrary,
  });

  // Auto-generate Line Art images from [رسم: ...] placeholders
  const generateLineArt = trpc.visualStudio.generateEducationalImage.useMutation();

  // useEffect for schoolLogo initialization
  useEffect(() => {
    if (userSchoolLogo && !schoolLogo) setSchoolLogo(userSchoolLogo);
  }, [userSchoolLogo]);

  // Show loading spinner while permissions are loading
  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // ── EARLY RETURN FOR LOCKED FEATURE (after all hooks) ──
  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <LockedFeature requiredService="accessEdugpt" featureName="بناء الاختبار">
          <div />
        </LockedFeature>
      </div>
    );
  }

  const handleSaveSchoolName = () => {
    if (schoolNameInput.trim()) {
      updateProfile.mutate({ schoolName: schoolNameInput.trim() });
    }
  };

  // Handlers
  const handleGenerate = () => {
    if (!subject || !level || !trimester) {
      toast.error("يُرجى تحديد المادة والمستوى والثلاثي");
      return;
    }
    setGeneratedExam("");
    setAnswerKey("");
    generateExam.mutate({ subject, level, trimester, duration, totalScore, topics: topics.trim() || undefined, additionalInstructions: additionalInstructions.trim() || undefined });
  };

  const handleSave = () => {
    if (!generatedExam) return;
    saveExam.mutate({ subject, level, trimester, duration, totalScore, topics: topics.trim() || undefined, examContent: generatedExam, answerKeyContent: answerKey || undefined });
  };

  const handleGenerateAnswerKey = () => {
    if (!generatedExam) return;
    generateAnswerKey.mutate({ examContent: generatedExam, subject, level });
  };

  const handleExportWord = (content: string) => {
    exportWord.mutate({ subject, level, trimester, duration, totalScore, examContent: content, schoolName: schoolNameInput || undefined, schoolYear: "2025-2026", schoolLogoUrl: schoolLogo || undefined });
  };

  const handleAutoGenerateImages = async () => {
    if (!generatedExam) return;
    const placeholders: RegExpExecArray[] = [];
    const regex = /\[رسم:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(generatedExam)) !== null) placeholders.push(m);
    if (placeholders.length === 0) {
      toast.info("لا توجد عناصر [رسم: ...] في الاختبار");
      return;
    }
    setGeneratingImages(true);
    const newImages: Array<{ url: string; caption?: string }> = [];
    for (const match of placeholders) {
      const description = match[1].trim();
      try {
        const result = await generateLineArt.mutateAsync({
          prompt: description,
          style: "bw_lineart",
          subject,
          level,
          source: "exam-builder",
        });
        if (result.url) {
          newImages.push({ url: result.url, caption: description });
        }
      } catch (err: any) {
        toast.error(`فشل توليد صورة: ${description.substring(0, 30)}...`);
      }
    }
    setExamImages(prev => [...prev, ...newImages]);
    setGeneratingImages(false);
    if (newImages.length > 0) {
      toast.success(`تم توليد ${newImages.length} صورة توضيحية`);
    }
  };

  // Regenerate a single image
  const handleRegenerateImage = async (idx: number) => {
    const img = examImages[idx];
    if (!img?.caption) return;
    setRegeneratingIndex(idx);
    try {
      const result = await generateLineArt.mutateAsync({
        prompt: img.caption,
        style: "bw_lineart",
        subject,
        level,
        source: "exam-builder",
      });
      if (result.url) {
        setExamImages(prev => prev.map((item, i) => i === idx ? { ...item, url: result.url } : item));
        toast.success("تم إعادة توليد الصورة بنجاح");
      }
    } catch (err: any) {
      toast.error("فشل إعادة توليد الصورة");
    }
    setRegeneratingIndex(null);
  };

  // Handle image selected from library
  const handleLibraryImageSelect = (image: { url: string; caption: string }) => {
    setExamImages(prev => [...prev, image]);
    toast.success(`تم إضافة صورة: ${image.caption}`);
  };

  // Handle library generate request (for images not yet generated)
  const handleLibraryGenerateRequest = async (prompt: string) => {
    if (isFreeAccount) {
      toast.error("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة (PRO/Premium)");
      return;
    }
    setGeneratingImages(true);
    try {
      const result = await generateLineArt.mutateAsync({
        prompt,
        style: "bw_lineart",
        subject: subject || "الإيقاظ العلمي",
        level: level || "السنة الخامسة ابتدائي",
        source: "exam-builder",
      });
      if (result.url) {
        setExamImages(prev => [...prev, { url: result.url, caption: prompt }]);
        toast.success(`تم توليد وإضافة صورة: ${prompt}`);
      }
    } catch (err: any) {
      toast.error(`فشل توليد صورة: ${prompt}`);
    }
    setGeneratingImages(false);
  };

  // Handle overlay save - replace image with overlaid version
  const handleOverlaySave = (dataUrl: string) => {
    if (!overlayEditorImage) return;
    setExamImages(prev => prev.map(img => 
      img.url === overlayEditorImage.url ? { ...img, url: dataUrl } : img
    ));
    setOverlayEditorImage(null);
    toast.success("تم حفظ الصورة مع التسميات العربية");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم النسخ إلى الحافظة");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (content: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
      <title>اختبار - ${subject}</title>
      <style>@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
      body{font-family:'Amiri',serif;direction:rtl;padding:20px;font-size:14px;line-height:1.8}
      h1,h2,h3{font-weight:bold}table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{border:1px solid #333;padding:6px 10px;text-align:right}th{background:#f0f0f0}</style>
      </head><body><div style="white-space:pre-wrap">${content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div></body></html>`);
    win.document.close();
    win.print();
  };

  const handleLoadFromLibrary = (exam: SavedExam) => {
    setSubject(exam.subject);
    setLevel(exam.level);
    setTrimester(exam.trimester);
    setDuration(exam.duration || "45 دقيقة");
    setTotalScore(exam.totalScore || 20);
    setTopics(exam.topics || "");
    setGeneratedExam(exam.examContent);
    setAnswerKey(exam.answerKeyContent || "");
    setActiveTab("exam");
    setShowLibrary(false);
    toast.success("تم تحميل الاختبار من المكتبة");
  };

  const hasExam = !!generatedExam;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 border-b border-blue-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl">📝</div>
          <div>
            <h1 className="text-lg font-bold">المتفقد المميز للتربية</h1>
            <p className="text-blue-200 text-xs">بناء اختبارات رسمية وفق المقاربة بالكفايات — المرحلة الابتدائية التونسية</p>
          </div>
          <div className="mr-auto flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLibrary(true)}
              className="border-blue-400/50 text-blue-200 hover:bg-blue-800/50 text-xs"
            >
              📚 مكتبة الاختبارات
            </Button>
            <Badge variant="outline" className="border-blue-400 text-blue-200 text-xs hidden sm:flex">
              خبرة 30 عاماً
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Criteria */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-blue-300 flex items-center gap-2">🎯 نظام المعايير المعتمد</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-1.5 px-4 pb-3">
              <CriteriaBadge code="مع1" label="التملك الأساسي للموارد" color="bg-green-900/30 border-green-700/50 text-green-300" />
              <CriteriaBadge code="مع2" label="التوظيف السليم للموارد" color="bg-blue-900/30 border-blue-700/50 text-blue-300" />
              <CriteriaBadge code="مع3" label="التميز والدقة (الإدماج)" color="bg-purple-900/30 border-purple-700/50 text-purple-300" />
              <CriteriaBadge code="مع4" label="جودة التقديم والخط" color="bg-amber-900/30 border-amber-700/50 text-amber-300" />
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-white flex items-center gap-2">⚙️ معطيات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">المادة *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                    <SelectValue placeholder="اختر المادة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">المستوى *</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                    <SelectValue placeholder="اختر المستوى..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">الثلاثي *</Label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                    <SelectValue placeholder="اختر الثلاثي..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-blue-200 text-xs">المدة</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-blue-200 text-xs">المجموع (نقطة)</Label>
                  <Input type="number" min={10} max={40} value={totalScore}
                    onChange={e => setTotalScore(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white h-9" />
                </div>
              </div>
              {/* School name */}
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">اسم المدرسة (يظهر في الترويسة)</Label>
                <div className="flex gap-1.5">
                  <Input
                    value={schoolNameInput}
                    onChange={e => setSchoolNameInput(e.target.value)}
                    placeholder="مثال: المدرسة الابتدائية النموذجية"
                    className="bg-white/10 border-white/20 text-white h-9 flex-1 placeholder:text-white/30 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveSchoolName}
                    disabled={updateProfile.isPending || !schoolNameInput.trim()}
                    className={`h-9 px-2 text-xs border-white/20 shrink-0 ${
                      schoolNameSaved ? "border-green-500 text-green-300" : "text-blue-200 hover:bg-white/10"
                    }`}
                  >
                    {schoolNameSaved ? "✅" : updateProfile.isPending ? "⏳" : "حفظ"}
                  </Button>
                </div>
                {userSchoolName && <p className="text-[10px] text-green-400/70">محفوظ: {userSchoolName}</p>}
              </div>
              {/* School Logo Upload */}
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">شعار المدرسة (يظهر في الترويسة) {isFreeAccount && <span className="text-amber-400 text-[10px]">🔒 PRO</span>}</Label>
                <div className="flex items-center gap-2">
                  {schoolLogo ? (
                    <div className="relative w-12 h-12 rounded-lg border border-white/20 overflow-hidden bg-white flex-shrink-0">
                      <img src={schoolLogo} alt="شعار المدرسة" className="w-full h-full object-contain p-0.5" />
                      <button
                        onClick={() => { setSchoolLogo(""); updateProfile.mutate({ schoolLogo: "" }); }}
                        className="absolute -top-0.5 -left-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                      >×</button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-lg flex-shrink-0">
                      🏫
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={async (e) => {
                        if (isFreeAccount) { toast.error("ميزة رفع شعار المدرسة متاحة فقط للحسابات المدفوعة (PRO/Premium)"); e.target.value = ''; return; }
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("حجم الشعار يجب أن لا يتجاوز 2MB");
                          return;
                        }
                        try {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(',')[1];
                            const ext = file.name.split('.').pop() || 'png';
                            const result = await uploadSchoolLogo.mutateAsync({
                              base64Data: base64,
                              fileExtension: ext,
                              mimeType: file.type,
                            });
                            setSchoolLogo(result.url);
                            toast.success("تم رفع شعار المدرسة بنجاح");
                          };
                          reader.readAsDataURL(file);
                        } catch {
                          toast.error("فشل في رفع الشعار");
                        }
                      }}
                    />
                    <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center text-xs text-blue-200 hover:bg-white/15 transition-colors">
                      {uploadSchoolLogo.isPending ? "✨ جاري الرفع..." : schoolLogo ? "🔄 تغيير الشعار" : "📤 رفع شعار المدرسة"}
                    </div>
                  </label>
                </div>
                <p className="text-[10px] text-white/40">PNG أو JPG أو SVG — أقصى حجم 2MB</p>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">المحاور المقررة (اختياري)</Label>
                <Textarea value={topics} onChange={e => setTopics(e.target.value)}
                  placeholder="مثال: الأعداد الصحيحة، الكسور..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none h-16 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-blue-200 text-xs">تعليمات إضافية (اختياري)</Label>
                <Textarea value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)}
                  placeholder="مثال: أضف تمريناً على الهندسة..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none h-16 text-sm" />
              </div>
              <Button onClick={handleGenerate}
                disabled={generateExam.isPending || !subject || !level || !trimester}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5">
                {generateExam.isPending
                  ? <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> جارٍ بناء الاختبار...</span>
                  : <span className="flex items-center gap-2"><span>📝</span> بناء الاختبار</span>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Result */}
        <div className="lg:col-span-3">
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <span>📄</span> الاختبار المُنتَج
                  {hasExam && <Badge className="bg-green-600 text-white text-xs">جاهز</Badge>}
                </CardTitle>
                {hasExam && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleCopy(activeTab === "exam" ? generatedExam : answerKey)}
                      className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2">
                      {copied ? "✅" : "📋"} نسخ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrint(activeTab === "exam" ? generatedExam : answerKey)}
                      className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2">
                      🖨️ طباعة
                    </Button>
                    <Button size="sm" onClick={() => handleExportWord(activeTab === "exam" ? generatedExam : answerKey)}
                      disabled={exportWord.isPending}
                      className="bg-blue-700 hover:bg-blue-600 text-white text-xs h-7 px-2">
                      {exportWord.isPending ? "⏳" : "📥"} Word
                    </Button>
                    <Button size="sm" onClick={handleSave}
                      disabled={saveExam.isPending}
                      className="bg-green-700 hover:bg-green-600 text-white text-xs h-7 px-2">
                      {saveExam.isPending ? "⏳" : "💾"} حفظ
                    </Button>
                    <Button size="sm" onClick={handleGenerateAnswerKey}
                      disabled={generateAnswerKey.isPending}
                      className="bg-purple-700 hover:bg-purple-600 text-white text-xs h-7 px-2">
                      {generateAnswerKey.isPending ? "⏳" : "🔑"} تصحيح
                    </Button>
                    <Button size="sm" onClick={() => setShowPrintPreview(true)}
                      className="bg-amber-700 hover:bg-amber-600 text-white text-xs h-7 px-2">
                      📷 معاينة الطباعة
                    </Button>
                    <Button size="sm" onClick={() => {
                      if (isFreeAccount) { toast.error("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة (PRO/Premium)"); return; }
                      handleAutoGenerateImages();
                    }}
                      disabled={generatingImages}
                      className={`bg-violet-700 hover:bg-violet-600 text-white text-xs h-7 px-2 ${isFreeAccount ? 'opacity-60' : ''}`}>
                      {generatingImages ? <span className="flex items-center gap-1"><span className="animate-spin">⏳</span> توليد...</span> : "🎨 توليد رسومات"}
                      {isFreeAccount && <span className="mr-1 text-[9px]">🔒</span>}
                    </Button>
                    <Button size="sm" onClick={() => navigate("/visual-studio")}
                      className="bg-violet-700/60 hover:bg-violet-600/60 text-white text-xs h-7 px-2">
                      🖌️ الاستوديو
                    </Button>
                    <Button size="sm" onClick={() => setShowImageLibrary(true)}
                      className="bg-teal-700 hover:bg-teal-600 text-white text-xs h-7 px-2">
                      🖼️ مكتبة الصور
                    </Button>
                    <Button size="sm" onClick={() => {
                      const params = new URLSearchParams();
                      params.set("fromExam", "true");
                      params.set("examTitle", `${subject} - ${level}`);
                      params.set("subject", subject);
                      params.set("grade", level);
                      params.set("examContent", activeTab === "exam" ? generatedExam : answerKey);
                      navigate(`/blind-grading?${params.toString()}`);
                    }}
                      className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs h-7 px-2">
                      ✅ تصحيح هذا الاختبار
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {!hasExam && !generateExam.isPending && (
                <div className="flex flex-col items-center justify-center h-72 text-center text-white/40 gap-4">
                  <div className="text-5xl">📝</div>
                  <div>
                    <p className="font-semibold text-white/60">أدخل معطيات الاختبار</p>
                    <p className="text-sm mt-1">حدد المادة والمستوى والثلاثي ثم اضغط "بناء الاختبار"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-white/50 max-w-xs">
                    {[["✅ وضعيات مشكلة", "3–4 سندات واقعية"], ["✅ نظام المعايير", "مع1 → مع2 → مع3 → مع4"],
                      ["✅ تدرج الصعوبة", "من السهل إلى الأصعب"], ["✅ جدول الإسناد", "توزيع الدرجات"]].map(([t, d]) => (
                      <div key={t} className="bg-white/5 rounded-lg p-2 text-right">
                        <div className="font-semibold text-white/70 mb-0.5">{t}</div>
                        <div>{d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generateExam.isPending && (
                <div className="flex flex-col items-center justify-center h-72 text-center gap-4">
                  <div className="text-5xl animate-bounce">⏳</div>
                  <div>
                    <p className="font-semibold text-blue-300">المتفقد المميز يبني الاختبار...</p>
                    <p className="text-sm text-white/50 mt-1">يُطبّق نظام المعايير والمقاربة بالكفايات</p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {hasExam && (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "exam" | "answer")}>
                  <TabsList className="bg-white/10 border border-white/20 mb-3 w-full">
                    <TabsTrigger value="exam" className="flex-1 text-xs data-[state=active]:bg-blue-700 data-[state=active]:text-white">
                      📄 الاختبار
                    </TabsTrigger>
                    <TabsTrigger value="answer" className="flex-1 text-xs data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                      disabled={!answerKey && !generateAnswerKey.isPending}>
                      🔑 نموذج الإجابة {!answerKey && !generateAnswerKey.isPending && "(اضغط تصحيح)"}
                      {generateAnswerKey.isPending && "⏳ جارٍ..."}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="exam">
                    <div
                      className={`prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed overflow-auto max-h-[600px] pr-1 transition-all duration-200 rounded-lg ${
                        isDragOver ? "ring-2 ring-violet-400 bg-violet-900/20" : ""
                      }`}
                      style={{ direction: "rtl" }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (draggedImage) {
                          const caption = draggedImage.caption || "صورة توضيحية";
                          const insertTag = `\n[\u0631\u0633\u0645: ${caption}]\n`;
                          setGeneratedExam(prev => prev + insertTag);
                          // Ensure image is in examImages if not already
                          if (!examImages.find(img => img.url === draggedImage.url)) {
                            setExamImages(prev => [...prev, draggedImage]);
                          }
                          toast.success(`تم إدراج الصورة: ${caption}`);
                          setDraggedImage(null);
                        }
                      }}
                    >
                      {isDragOver && (
                        <div className="text-center py-6 text-violet-300 animate-pulse">
                          <span className="text-3xl block mb-2">🖼️</span>
                          <span className="text-sm font-semibold">أفلت الصورة هنا لإدراجها في الاختبار</span>
                        </div>
                      )}
                      {examImages.length > 0 ? (
                        <ExamContentWithImages content={generatedExam} images={examImages} />
                      ) : (
                        <Streamdown>{generatedExam}</Streamdown>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="answer">
                    {generateAnswerKey.isPending ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <div className="text-4xl animate-bounce">🔑</div>
                        <p className="text-purple-300 font-semibold">يُعدّ نموذج الإجابة النموذجية...</p>
                      </div>
                    ) : answerKey ? (
                      <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed overflow-auto max-h-[600px] pr-1" style={{ direction: "rtl" }}>
                        <Streamdown>{answerKey}</Streamdown>
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              )}

              {/* Generated Images Gallery */}
              {examImages.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-violet-300 flex items-center gap-1">
                      🎨 الرسومات التوضيحية المولّدة ({examImages.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExamImages([])}
                      className="text-xs h-6 px-2 border-red-500/30 text-red-400 hover:bg-red-900/20"
                    >
                      مسح الكل
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {examImages.map((img, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDraggedImage(img)}
                        onDragEnd={() => setDraggedImage(null)}
                        className="relative group rounded-lg overflow-hidden border border-white/10 bg-white/5 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-violet-400/50 transition-all"
                      >
                        <div className="absolute top-1 right-1 bg-violet-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10" title="اسحب لإدراج في الاختبار">
                          ✥
                        </div>
                        {regeneratingIndex === idx ? (
                          <div className="w-full h-28 flex items-center justify-center bg-white/10">
                            <span className="animate-spin text-2xl">⏳</span>
                          </div>
                        ) : (
                          <img
                            src={img.url}
                            alt={img.caption || `صورة ${idx + 1}`}
                            className="w-full h-28 object-contain bg-white p-1"
                            style={{ filter: "grayscale(100%) contrast(1.2)" }}
                          />
                        )}
                        {img.caption && (
                          <div className="p-1.5 text-[10px] text-white/60 text-center truncate">
                            {img.caption}
                          </div>
                        )}
                        {/* Action buttons */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRegenerateImage(idx); }}
                            disabled={regeneratingIndex !== null}
                            className="bg-blue-600/90 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-blue-500 disabled:opacity-50"
                            title="إعادة توليد"
                          >
                            🔄 إعادة
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOverlayEditorImage(img); }}
                            className="bg-green-600/90 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-green-500"
                            title="إضافة تسميات"
                          >
                            ✏️ تسميات
                          </button>
                        </div>
                        <button
                          onClick={() => setExamImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 left-1 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1.5">
                    ✥ اسحب الصورة وأفلتها في منطقة الاختبار | 🔄 إعادة توليد صورة محددة | ✏️ إضافة تسميات عربية
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Library Dialog */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              📚 مكتبة الاختبارات المحفوظة
            </DialogTitle>
          </DialogHeader>
          {loadingExams ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin text-3xl">⏳</div>
            </div>
          ) : !savedExams || savedExams.length === 0 ? (
            <div className="text-center py-10 text-white/40">
              <div className="text-4xl mb-3">📭</div>
              <p>لا توجد اختبارات محفوظة بعد</p>
              <p className="text-sm mt-1">أنشئ اختباراً واضغط "حفظ" لإضافته هنا</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedExams.map(exam => (
                <LibraryItem
                  key={exam.id}
                  exam={exam as SavedExam}
                  onLoad={handleLoadFromLibrary}
                  onDelete={(id) => deleteExam.mutate({ id })}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Modal */}
      {showPrintPreview && generatedExam && (
        <PrintPreview
          content={activeTab === "exam" ? generatedExam : answerKey}
          title={activeTab === "exam" ? `اختبار ${subject}` : `تصحيح اختبار ${subject}`}
          subject={subject}
          level={level}
          trimester={trimester}
          schoolName={schoolNameInput.trim() || userSchoolName || undefined}
          studentName={activeTab === "exam"}
          onClose={() => setShowPrintPreview(false)}
          images={examImages.length > 0 ? examImages : undefined}
          schoolLogo={schoolLogo || userSchoolLogo || undefined}
        />
      )}

      {/* Educational Image Library */}
      <EducationalImageLibrary
        open={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={handleLibraryImageSelect}
        onGenerateRequest={handleLibraryGenerateRequest}
      />

      {/* Image Overlay Editor */}
      {overlayEditorImage && (
        <ImageOverlayEditor
          imageUrl={overlayEditorImage.url}
          caption={overlayEditorImage.caption}
          open={!!overlayEditorImage}
          onClose={() => setOverlayEditorImage(null)}
          onSave={handleOverlaySave}
        />
      )}
    </div>
  );
}
