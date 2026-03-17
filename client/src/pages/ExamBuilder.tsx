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
import UnifiedToolLayout, { type ToolConfig } from "@/components/UnifiedToolLayout";
import {
  FileEdit, BookOpen, Save, Key, Eye, Image as ImageIcon,
  Palette, GraduationCap, Loader2, Library, Trash2, Upload,
} from "lucide-react";

// ─── Tool Config ──────────────────────────────────────────────────────────────

const EXAM_TOOL_CONFIG: ToolConfig = {
  id: "exam-builder",
  icon: FileEdit,
  nameAr: "بنك التقييمات الذكي",
  nameFr: "Banque d'évaluations intelligente",
  nameEn: "Smart Assessment Builder",
  descAr: "بناء اختبارات رسمية وفق المقاربة بالكفايات — المرحلة الابتدائية التونسية",
  descFr: "Construire des examens officiels selon l'approche par compétences",
  descEn: "Build official exams following the competency-based approach",
  accentColor: "#1565C0",
  gradient: "linear-gradient(135deg, #1A237E, #1565C0)",
  loaderMessages: [
    "جاري تحليل المنهج التونسي الرسمي...",
    "تطبيق نظام المعايير (مع1، مع2، مع3)...",
    "بناء الوضعيات المشكلة والسندات...",
    "صياغة التعليمات وفق المقاربة بالكفايات...",
    "تنسيق جدول إسناد الأعداد...",
    "مراجعة التدرج في الصعوبة...",
    "التحقق من مطابقة البرامج الرسمية 2026...",
    "الاختبار جاهز تقريباً...",
  ],
};

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
    <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${color}`}>
      <span className="font-bold text-xs font-mono">{code}</span>
      <span className="text-[11px]">{label}</span>
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0 text-right">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {exam.subject} — {exam.level}
        </p>
        <p className="text-xs text-blue-600">{exam.trimester} · {formatDate(exam.createdAt)}</p>
        {exam.topics && <p className="text-xs text-gray-400 truncate mt-0.5">{exam.topics}</p>}
      </div>
      <div className="flex gap-2 mr-3 shrink-0">
        {exam.answerKeyContent && (
          <Badge className="bg-purple-100 text-purple-700 text-xs">+ تصحيح</Badge>
        )}
        <Button size="sm" variant="outline" onClick={() => onLoad(exam)}
          className="text-xs h-7 px-2">
          تحميل
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(exam.id)}
          className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-7 px-2">
          حذف
        </Button>
      </div>
    </div>
  );
}

// ─── Exam Content With Inline Images ─────────────────────────────────────────

function ExamContentWithImages({ content, images }: { content: string; images: Array<{ url: string; caption?: string }> }) {
  const imageMap = new Map<string, string>();
  images.forEach(img => {
    if (img.caption) imageMap.set(img.caption.trim(), img.url);
  });

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
                className="mx-auto max-w-[280px] max-h-[220px] rounded-lg border border-gray-200"
                style={{ filter: "grayscale(100%) contrast(1.2)" }}
              />
              <p className="text-[10px] text-gray-400 mt-1">{part.text}</p>
            </div>
          );
        }
        return (
          <div key={i} className="my-3 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
            <span className="text-2xl block mb-1">🎨</span>
            <span className="text-xs">رسم توضيحي: {part.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ExamBuilder() {
  const { hasEdugpt, isAdmin, isLoading: permLoading, tier } = usePermissions();
  const isFreeAccount = tier === "free" && !isAdmin;

  const { user, refresh: refreshAuth } = useAuth();
  const userSchoolName = (user as any)?.schoolName || "";
  const [schoolNameInput, setSchoolNameInput] = useState(userSchoolName);
  const [schoolNameSaved, setSchoolNameSaved] = useState(false);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      setSchoolNameSaved(true);
      refreshAuth();
      toast.success("تم حفظ اسم المدرسة في ملفك الشخصي");
      setTimeout(() => setSchoolNameSaved(false), 2000);
    },
  });

  const uploadSchoolLogo = trpc.profile.uploadSchoolLogo.useMutation({
    onSuccess: () => refreshAuth(),
  });

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
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
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

  const generateLineArt = trpc.visualStudio.generateEducationalImage.useMutation();

  useEffect(() => {
    if (userSchoolLogo && !schoolLogo) setSchoolLogo(userSchoolLogo);
  }, [userSchoolLogo]);

  // Show loading spinner while permissions are loading
  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FB" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F8F9FB" }}>
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

  const handleExportWord = () => {
    const content = activeTab === "exam" ? generatedExam : answerKey;
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
          prompt: description, style: "bw_lineart", subject, level, source: "exam-builder",
        });
        if (result.url) newImages.push({ url: result.url, caption: description });
      } catch {
        toast.error(`فشل توليد صورة: ${description.substring(0, 30)}...`);
      }
    }
    setExamImages(prev => [...prev, ...newImages]);
    setGeneratingImages(false);
    if (newImages.length > 0) toast.success(`تم توليد ${newImages.length} صورة توضيحية`);
  };

  const handleRegenerateImage = async (idx: number) => {
    const img = examImages[idx];
    if (!img?.caption) return;
    setRegeneratingIndex(idx);
    try {
      const result = await generateLineArt.mutateAsync({
        prompt: img.caption, style: "bw_lineart", subject, level, source: "exam-builder",
      });
      if (result.url) {
        setExamImages(prev => prev.map((item, i) => i === idx ? { ...item, url: result.url } : item));
        toast.success("تم إعادة توليد الصورة بنجاح");
      }
    } catch {
      toast.error("فشل إعادة توليد الصورة");
    }
    setRegeneratingIndex(null);
  };

  const handleLibraryImageSelect = (image: { url: string; caption: string }) => {
    setExamImages(prev => [...prev, image]);
    toast.success(`تم إضافة صورة: ${image.caption}`);
  };

  const handleLibraryGenerateRequest = async (prompt: string) => {
    if (isFreeAccount) { toast.error("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة (PRO/Premium)"); return; }
    setGeneratingImages(true);
    try {
      const result = await generateLineArt.mutateAsync({
        prompt, style: "bw_lineart", subject: subject || "الإيقاظ العلمي", level: level || "السنة الخامسة ابتدائي", source: "exam-builder",
      });
      if (result.url) {
        setExamImages(prev => [...prev, { url: result.url, caption: prompt }]);
        toast.success(`تم توليد وإضافة صورة: ${prompt}`);
      }
    } catch {
      toast.error(`فشل توليد صورة: ${prompt}`);
    }
    setGeneratingImages(false);
  };

  const handleOverlaySave = (dataUrl: string) => {
    if (!overlayEditorImage) return;
    setExamImages(prev => prev.map(img =>
      img.url === overlayEditorImage.url ? { ...img, url: dataUrl } : img
    ));
    setOverlayEditorImage(null);
    toast.success("تم حفظ الصورة مع التسميات العربية");
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

  // ─── Input Panel ──────────────────────────────────────────────────────────────

  const inputPanel = (
    <div className="space-y-4" dir="rtl" style={{ fontFamily: "'Almarai', sans-serif" }}>
      {/* Criteria Info */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          نظام المعايير المعتمد
        </p>
        <div className="space-y-1">
          <CriteriaBadge code="مع1" label="التملك الأساسي للموارد" color="bg-green-50 border-green-200 text-green-700" />
          <CriteriaBadge code="مع2" label="التوظيف السليم للموارد" color="bg-blue-50 border-blue-200 text-blue-700" />
          <CriteriaBadge code="مع3" label="التميز والدقة (الإدماج)" color="bg-purple-50 border-purple-200 text-purple-700" />
          <CriteriaBadge code="مع4" label="جودة التقديم والخط" color="bg-amber-50 border-amber-200 text-amber-700" />
        </div>
      </div>

      <Separator className="bg-gray-100" />

      {/* Form Fields */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">المادة *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder="اختر المادة..." />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">المستوى *</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder="اختر المستوى..." />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">الثلاثي *</Label>
          <Select value={trimester} onValueChange={setTrimester}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder="اختر الثلاثي..." />
            </SelectTrigger>
            <SelectContent>
              {TRIMESTERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs font-medium">المدة</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs font-medium">المجموع (نقطة)</Label>
            <Input type="number" min={10} max={40} value={totalScore}
              onChange={e => setTotalScore(Number(e.target.value))}
              className="h-9 text-sm border-gray-200 bg-gray-50/50" />
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* School Name */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">اسم المدرسة (يظهر في الترويسة)</Label>
          <div className="flex gap-1.5">
            <Input
              value={schoolNameInput}
              onChange={e => setSchoolNameInput(e.target.value)}
              placeholder="مثال: المدرسة الابتدائية النموذجية"
              className="h-9 flex-1 text-sm border-gray-200 bg-gray-50/50 placeholder:text-gray-300"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveSchoolName}
              disabled={updateProfile.isPending || !schoolNameInput.trim()}
              className={`h-9 px-2 text-xs shrink-0 ${schoolNameSaved ? "border-green-400 text-green-600" : ""}`}
            >
              {schoolNameSaved ? "✅" : updateProfile.isPending ? "⏳" : "حفظ"}
            </Button>
          </div>
          {userSchoolName && <p className="text-[10px] text-green-500">محفوظ: {userSchoolName}</p>}
        </div>

        {/* School Logo */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">
            شعار المدرسة {isFreeAccount && <span className="text-amber-500 text-[10px]">PRO</span>}
          </Label>
          <div className="flex items-center gap-2">
            {schoolLogo ? (
              <div className="relative w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                <img src={schoolLogo} alt="شعار" className="w-full h-full object-contain p-0.5" />
                <button
                  onClick={() => { setSchoolLogo(""); updateProfile.mutate({ schoolLogo: "" }); }}
                  className="absolute -top-0.5 -left-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                >×</button>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                <Upload className="w-4 h-4" />
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
                  if (file.size > 2 * 1024 * 1024) { toast.error("حجم الشعار يجب أن لا يتجاوز 2MB"); return; }
                  try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = (reader.result as string).split(',')[1];
                      const ext = file.name.split('.').pop() || 'png';
                      const result = await uploadSchoolLogo.mutateAsync({ base64Data: base64, fileExtension: ext, mimeType: file.type });
                      setSchoolLogo(result.url);
                      toast.success("تم رفع شعار المدرسة بنجاح");
                    };
                    reader.readAsDataURL(file);
                  } catch { toast.error("فشل في رفع الشعار"); }
                }}
              />
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-xs text-gray-500 hover:bg-gray-100 transition-colors">
                {uploadSchoolLogo.isPending ? "جاري الرفع..." : schoolLogo ? "تغيير الشعار" : "رفع شعار المدرسة"}
              </div>
            </label>
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Topics */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">المحاور المقررة (اختياري)</Label>
          <Textarea value={topics} onChange={e => setTopics(e.target.value)}
            placeholder="مثال: الأعداد الصحيحة، الكسور..."
            className="resize-none h-14 text-sm border-gray-200 bg-gray-50/50 placeholder:text-gray-300" />
        </div>

        {/* Additional Instructions */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">تعليمات إضافية (اختياري)</Label>
          <Textarea value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)}
            placeholder="مثال: أضف تمريناً على الهندسة..."
            className="resize-none h-14 text-sm border-gray-200 bg-gray-50/50 placeholder:text-gray-300" />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generateExam.isPending || !subject || !level || !trimester}
          className="w-full font-bold py-2.5 text-white text-sm"
          style={{ background: EXAM_TOOL_CONFIG.gradient }}
        >
          {generateExam.isPending
            ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> جارٍ بناء الاختبار...</span>
            : <span className="flex items-center gap-2"><FileEdit className="w-4 h-4" /> بناء الاختبار</span>}
        </Button>

        {/* Quick Actions */}
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setShowLibrary(true)}
            className="text-xs h-7 px-2 flex items-center gap-1">
            <Library className="w-3 h-3" /> مكتبة الاختبارات
          </Button>
          {hasExam && (
            <>
              <Button size="sm" variant="outline" onClick={handleSave}
                disabled={saveExam.isPending}
                className="text-xs h-7 px-2 flex items-center gap-1 border-green-200 text-green-600 hover:bg-green-50">
                <Save className="w-3 h-3" /> {saveExam.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerateAnswerKey}
                disabled={generateAnswerKey.isPending}
                className="text-xs h-7 px-2 flex items-center gap-1 border-purple-200 text-purple-600 hover:bg-purple-50">
                <Key className="w-3 h-3" /> {generateAnswerKey.isPending ? "جاري..." : "تصحيح"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowPrintPreview(true)}
                className="text-xs h-7 px-2 flex items-center gap-1 border-amber-200 text-amber-600 hover:bg-amber-50">
                <Eye className="w-3 h-3" /> معاينة الطباعة
              </Button>
              <Button size="sm" variant="outline"
                onClick={() => { if (isFreeAccount) { toast.error("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة"); return; } handleAutoGenerateImages(); }}
                disabled={generatingImages}
                className={`text-xs h-7 px-2 flex items-center gap-1 border-violet-200 text-violet-600 hover:bg-violet-50 ${isFreeAccount ? 'opacity-60' : ''}`}>
                <Palette className="w-3 h-3" /> {generatingImages ? "توليد..." : "رسومات"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowImageLibrary(true)}
                className="text-xs h-7 px-2 flex items-center gap-1 border-teal-200 text-teal-600 hover:bg-teal-50">
                <ImageIcon className="w-3 h-3" /> مكتبة الصور
              </Button>
              <Button size="sm" variant="outline"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("fromExam", "true");
                  params.set("examTitle", `${subject} - ${level}`);
                  params.set("subject", subject);
                  params.set("grade", level);
                  params.set("examContent", activeTab === "exam" ? generatedExam : answerKey);
                  navigate(`/blind-grading?${params.toString()}`);
                }}
                className="text-xs h-7 px-2 flex items-center gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                تصحيح هذا الاختبار
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Custom Result Renderer ──────────────────────────────────────────────────

  const customResultRenderer = hasExam ? (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Paper top accent */}
      <div className="h-1 w-full" style={{ background: EXAM_TOOL_CONFIG.gradient }} />

      <div className="px-6 sm:px-10 py-6 sm:py-8" style={{ minHeight: "400px" }}>
        {/* Tabs for Exam / Answer Key */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "exam" | "answer")}>
          <TabsList className="bg-gray-100 border border-gray-200 mb-5 w-full">
            <TabsTrigger value="exam" className="flex-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              الاختبار
            </TabsTrigger>
            <TabsTrigger value="answer" className="flex-1 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              disabled={!answerKey && !generateAnswerKey.isPending}>
              نموذج الإجابة {!answerKey && !generateAnswerKey.isPending && "(اضغط تصحيح)"}
              {generateAnswerKey.isPending && " جارٍ..."}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exam">
            <div
              className={`prose prose-sm max-w-none leading-relaxed overflow-auto max-h-[600px] pr-1 transition-all duration-200 rounded-lg ${
                isDragOver ? "ring-2 ring-violet-400 bg-violet-50" : ""
              }`}
              style={{ direction: "rtl", fontFamily: "'Almarai', sans-serif", color: "#1F2937" }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (draggedImage) {
                  const caption = draggedImage.caption || "صورة توضيحية";
                  setGeneratedExam(prev => prev + `\n[رسم: ${caption}]\n`);
                  if (!examImages.find(img => img.url === draggedImage.url)) {
                    setExamImages(prev => [...prev, draggedImage]);
                  }
                  toast.success(`تم إدراج الصورة: ${caption}`);
                  setDraggedImage(null);
                }
              }}
            >
              {isDragOver && (
                <div className="text-center py-6 text-violet-500 animate-pulse">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
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
                <Key className="w-10 h-10 text-purple-400 animate-bounce" />
                <p className="text-purple-600 font-semibold" style={{ fontFamily: "'Almarai', sans-serif" }}>يُعدّ نموذج الإجابة النموذجية...</p>
              </div>
            ) : answerKey ? (
              <div className="prose prose-sm max-w-none leading-relaxed overflow-auto max-h-[600px] pr-1" style={{ direction: "rtl", fontFamily: "'Almarai', sans-serif", color: "#1F2937" }}>
                <Streamdown>{answerKey}</Streamdown>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>

        {/* Generated Images Gallery */}
        {examImages.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-violet-600 flex items-center gap-1.5" style={{ fontFamily: "'Almarai', sans-serif" }}>
                <Palette className="w-3.5 h-3.5" />
                الرسومات التوضيحية المولّدة ({examImages.length})
              </h4>
              <Button size="sm" variant="outline" onClick={() => setExamImages([])}
                className="text-xs h-6 px-2 border-red-200 text-red-400 hover:bg-red-50">
                <Trash2 className="w-3 h-3 ml-1" /> مسح الكل
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {examImages.map((img, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDraggedImage(img)}
                  onDragEnd={() => setDraggedImage(null)}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-violet-300 transition-all"
                >
                  {regeneratingIndex === idx ? (
                    <div className="w-full h-28 flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                    </div>
                  ) : (
                    <img src={img.url} alt={img.caption || `صورة ${idx + 1}`}
                      className="w-full h-28 object-contain bg-white p-1"
                      style={{ filter: "grayscale(100%) contrast(1.2)" }} />
                  )}
                  {img.caption && (
                    <div className="p-1.5 text-[10px] text-gray-500 text-center truncate">{img.caption}</div>
                  )}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.stopPropagation(); handleRegenerateImage(idx); }}
                      disabled={regeneratingIndex !== null}
                      className="bg-blue-500 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-blue-400 disabled:opacity-50">
                      إعادة
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setOverlayEditorImage(img); }}
                      className="bg-green-500 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-green-400">
                      تسميات
                    </button>
                  </div>
                  <button onClick={() => setExamImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : undefined;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <UnifiedToolLayout
        config={EXAM_TOOL_CONFIG}
        inputPanel={inputPanel}
        resultContent={hasExam ? generatedExam : null}
        isGenerating={generateExam.isPending}
        onRegenerate={handleGenerate}
        onDownloadPDF={() => setShowPrintPreview(true)}
        onDownloadWord={handleExportWord}
        customResultRenderer={customResultRenderer}
        editable={false}
      />

      {/* Library Dialog */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <Library className="w-5 h-5 text-blue-600" /> مكتبة الاختبارات المحفوظة
            </DialogTitle>
          </DialogHeader>
          {loadingExams ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : !savedExams || savedExams.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">لا توجد اختبارات محفوظة بعد</p>
              <p className="text-sm mt-1">أنشئ اختباراً واضغط "حفظ" لإضافته هنا</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedExams.map(exam => (
                <LibraryItem key={exam.id} exam={exam as SavedExam} onLoad={handleLoadFromLibrary}
                  onDelete={(id) => deleteExam.mutate({ id })} />
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
          subject={subject} level={level} trimester={trimester}
          schoolName={schoolNameInput.trim() || userSchoolName || undefined}
          studentName={activeTab === "exam"}
          onClose={() => setShowPrintPreview(false)}
          images={examImages.length > 0 ? examImages : undefined}
          schoolLogo={schoolLogo || userSchoolLogo || undefined}
        />
      )}

      {/* Educational Image Library */}
      <EducationalImageLibrary
        open={showImageLibrary} onClose={() => setShowImageLibrary(false)}
        onSelect={handleLibraryImageSelect} onGenerateRequest={handleLibraryGenerateRequest}
      />

      {/* Image Overlay Editor */}
      {overlayEditorImage && (
        <ImageOverlayEditor
          imageUrl={overlayEditorImage.url} caption={overlayEditorImage.caption}
          open={!!overlayEditorImage} onClose={() => setOverlayEditorImage(null)}
          onSave={handleOverlaySave}
        />
      )}
    </>
  );
}
