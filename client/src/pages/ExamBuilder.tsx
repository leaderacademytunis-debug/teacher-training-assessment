import { useState, useEffect } from "react";
import PrintPreview from "@/components/PrintPreview";
import ImageOverlayEditor from "@/components/ImageOverlayEditor";
import EducationalImageLibrary from "@/components/EducationalImageLibrary";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useExtractionStore } from "@/stores/extractionStore";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";
import UnifiedToolLayout, { type ToolConfig } from "@/components/UnifiedToolLayout";
import {
  FileEdit, BookOpen, Save, Key, Eye, Image as ImageIcon,
  Palette, GraduationCap, Loader2, Library, Trash2, Upload,
} from "lucide-react";

// ─── Multilingual Constants ──────────────────────────────────────────────────

const SUBJECTS_DATA = [
  { ar: "اللغة العربية", fr: "Langue arabe", en: "Arabic Language" },
  { ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" },
  { ar: "الإيقاظ العلمي", fr: "Éveil scientifique", en: "Science" },
  { ar: "التربية الإسلامية", fr: "Éducation islamique", en: "Islamic Education" },
  { ar: "التربية المدنية", fr: "Éducation civique", en: "Civic Education" },
  { ar: "اللغة الفرنسية", fr: "Langue française", en: "French Language" },
  { ar: "التربية التشكيلية", fr: "Arts plastiques", en: "Art" },
  { ar: "التربية الموسيقية", fr: "Éducation musicale", en: "Music" },
  { ar: "التربية البدنية", fr: "Éducation physique", en: "Physical Education" },
];

const LEVELS_DATA = [
  { ar: "السنة الأولى ابتدائي", fr: "1ère année primaire", en: "1st Year Primary" },
  { ar: "السنة الثانية ابتدائي", fr: "2ème année primaire", en: "2nd Year Primary" },
  { ar: "السنة الثالثة ابتدائي", fr: "3ème année primaire", en: "3rd Year Primary" },
  { ar: "السنة الرابعة ابتدائي", fr: "4ème année primaire", en: "4th Year Primary" },
  { ar: "السنة الخامسة ابتدائي", fr: "5ème année primaire", en: "5th Year Primary" },
  { ar: "السنة السادسة ابتدائي", fr: "6ème année primaire", en: "6th Year Primary" },
];

const TRIMESTERS_DATA = [
  { ar: "الثلاثي الأول", fr: "1er trimestre", en: "1st Trimester" },
  { ar: "الثلاثي الثاني", fr: "2ème trimestre", en: "2nd Trimester" },
  { ar: "الثلاثي الثالث", fr: "3ème trimestre", en: "3rd Trimester" },
];

const DURATIONS_DATA = [
  { ar: "30 دقيقة", fr: "30 minutes", en: "30 minutes" },
  { ar: "45 دقيقة", fr: "45 minutes", en: "45 minutes" },
  { ar: "60 دقيقة", fr: "60 minutes", en: "60 minutes" },
  { ar: "90 دقيقة", fr: "90 minutes", en: "90 minutes" },
];

const CRITERIA_DATA = [
  { code: "مع1", ar: "التملك الأساسي للموارد", fr: "Maîtrise de base des ressources", en: "Basic resource mastery", color: "bg-green-50 border-green-200 text-green-700" },
  { code: "مع2", ar: "التوظيف السليم للموارد", fr: "Utilisation correcte des ressources", en: "Correct use of resources", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { code: "مع3", ar: "التميز والدقة (الإدماج)", fr: "Excellence et précision (intégration)", en: "Excellence and precision (integration)", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { code: "مع4", ar: "جودة التقديم والخط", fr: "Qualité de présentation et écriture", en: "Presentation and handwriting quality", color: "bg-amber-50 border-amber-200 text-amber-700" },
];

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

function formatDate(ts: Date | string | number, lang: string) {
  const locale = lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-TN" : "en-US";
  return new Date(ts).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
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
  t,
  lang,
}: {
  exam: SavedExam;
  onLoad: (exam: SavedExam) => void;
  onDelete: (id: number) => void;
  t: (ar: string, fr: string, en: string) => string;
  lang: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className={`flex-1 min-w-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
        <p className="font-semibold text-gray-800 text-sm truncate">
          {exam.subject} — {exam.level}
        </p>
        <p className="text-xs text-blue-600">{exam.trimester} · {formatDate(exam.createdAt, lang)}</p>
        {exam.topics && <p className="text-xs text-gray-400 truncate mt-0.5">{exam.topics}</p>}
      </div>
      <div className={`flex gap-2 ${lang === "ar" ? "mr-3" : "ml-3"} shrink-0`}>
        {exam.answerKeyContent && (
          <Badge className="bg-purple-100 text-purple-700 text-xs">+ {t("تصحيح", "corrigé", "answer key")}</Badge>
        )}
        <Button size="sm" variant="outline" onClick={() => onLoad(exam)}
          className="text-xs h-7 px-2">
          {t("تحميل", "Charger", "Load")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(exam.id)}
          className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-7 px-2">
          {t("حذف", "Supprimer", "Delete")}
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
            <span className="text-xs">{part.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ExamBuilder() {
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  // ─── Tool Config (with multilingual loader messages) ───
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
    loaderMessagesFr: [
      "Analyse du programme tunisien officiel...",
      "Application du système de critères (C1, C2, C3)...",
      "Construction des situations-problèmes...",
      "Rédaction des consignes selon l'approche par compétences...",
      "Mise en forme du barème de notation...",
      "Vérification de la progression en difficulté...",
      "Validation de la conformité aux programmes 2026...",
      "L'examen est presque prêt...",
    ],
    loaderMessagesEn: [
      "Analyzing the official Tunisian curriculum...",
      "Applying criteria system (C1, C2, C3)...",
      "Building problem situations and contexts...",
      "Writing instructions per competency-based approach...",
      "Formatting the grading table...",
      "Reviewing difficulty progression...",
      "Verifying compliance with 2026 programs...",
      "The exam is almost ready...",
    ],
  };

  // ─── Translated dropdown data ───
  const subjects = SUBJECTS_DATA.map(s => ({ value: s.ar, label: t(s.ar, s.fr, s.en) }));
  const levels = LEVELS_DATA.map(l => ({ value: l.ar, label: t(l.ar, l.fr, l.en) }));
  const trimesters = TRIMESTERS_DATA.map(tr => ({ value: tr.ar, label: t(tr.ar, tr.fr, tr.en) }));
  const durations = DURATIONS_DATA.map(d => ({ value: d.ar, label: t(d.ar, d.fr, d.en) }));
  const criteria = CRITERIA_DATA.map(c => ({ ...c, label: t(c.ar, c.fr, c.en) }));

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
      toast.success(t("تم حفظ اسم المدرسة في ملفك الشخصي", "Nom de l'école enregistré dans votre profil", "School name saved to your profile"));
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

  // Zustand - extracted_payload from textbook viewer
  const { extracted_payload: libraryPayload, sourceInfo: librarySource } = useExtractionStore();
  const [libraryPayloadApplied, setLibraryPayloadApplied] = useState(false);
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
      toast.success(t("تم إنشاء الاختبار بنجاح!", "Examen créé avec succès !", "Exam created successfully!"));
    },
    onError: (err) => toast.error(`${t("خطأ", "Erreur", "Error")}: ${err.message}`),
  });

  const saveExam = trpc.edugpt.saveExam.useMutation({
    onSuccess: () => {
      toast.success(t("تم حفظ الاختبار في المكتبة", "Examen enregistré dans la bibliothèque", "Exam saved to library"));
      utils.edugpt.listExams.invalidate();
    },
    onError: (err) => toast.error(`${t("خطأ في الحفظ", "Erreur d'enregistrement", "Save error")}: ${err.message}`),
  });

  const deleteExam = trpc.edugpt.deleteExam.useMutation({
    onSuccess: () => {
      toast.success(t("تم حذف الاختبار", "Examen supprimé", "Exam deleted"));
      utils.edugpt.listExams.invalidate();
    },
  });

  const generateAnswerKey = trpc.edugpt.generateAnswerKey.useMutation({
    onSuccess: (data) => {
      setAnswerKey(data.answerKey);
      setActiveTab("answer");
      toast.success(t("تم إنشاء نموذج الإجابة النموذجية", "Corrigé type créé avec succès", "Answer key created successfully"));
    },
    onError: (err) => toast.error(`${t("خطأ", "Erreur", "Error")}: ${err.message}`),
  });

  const exportWord = trpc.edugpt.exportExamWord.useMutation({
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename);
      toast.success(t("تم تحميل ملف Word", "Fichier Word téléchargé", "Word file downloaded"));
    },
    onError: (err) => toast.error(`${t("خطأ في التصدير", "Erreur d'exportation", "Export error")}: ${err.message}`),
  });

  const { data: savedExams, isLoading: loadingExams } = trpc.edugpt.listExams.useQuery(undefined, {
    enabled: showLibrary,
  });

  const generateLineArt = trpc.visualStudio.generateEducationalImage.useMutation();

  useEffect(() => {
    if (userSchoolLogo && !schoolLogo) setSchoolLogo(userSchoolLogo);
  }, [userSchoolLogo]);

  // Auto-fill from Library extracted_payload
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "library" && libraryPayload && !libraryPayloadApplied) {
      setTopics(libraryPayload);
      setLibraryPayloadApplied(true);
      toast.success(
        `تم تعبئة المحاور من المكتبة${librarySource?.fileName ? ` (من ${librarySource.fileName})` : ""}`,
        { duration: 5000 }
      );
    }
  }, [libraryPayload, libraryPayloadApplied, librarySource]);

  // Show loading spinner while permissions are loading
  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FB" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>{tt.loading}</p>
        </div>
      </div>
    );
  }

  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F8F9FB" }}>
        <LockedFeature requiredService="accessEdugpt" featureName={t("بناء الاختبار", "Constructeur d'examens", "Exam Builder")}>
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
      toast.error(t("يُرجى تحديد المادة والمستوى والثلاثي", "Veuillez sélectionner la matière, le niveau et le trimestre", "Please select subject, level, and trimester"));
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
      toast.info(t("لا توجد عناصر [رسم: ...] في الاختبار", "Aucun élément [رسم: ...] dans l'examen", "No [رسم: ...] elements in the exam"));
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
        toast.error(`${t("فشل توليد صورة", "Échec de génération d'image", "Image generation failed")}: ${description.substring(0, 30)}...`);
      }
    }
    setExamImages(prev => [...prev, ...newImages]);
    setGeneratingImages(false);
    if (newImages.length > 0) toast.success(t(
      `تم توليد ${newImages.length} صورة توضيحية`,
      `${newImages.length} illustration(s) générée(s)`,
      `${newImages.length} illustration(s) generated`
    ));
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
        toast.success(t("تم إعادة توليد الصورة بنجاح", "Image régénérée avec succès", "Image regenerated successfully"));
      }
    } catch {
      toast.error(t("فشل إعادة توليد الصورة", "Échec de régénération de l'image", "Failed to regenerate image"));
    }
    setRegeneratingIndex(null);
  };

  const handleLibraryImageSelect = (image: { url: string; caption: string }) => {
    setExamImages(prev => [...prev, image]);
    toast.success(`${t("تم إضافة صورة", "Image ajoutée", "Image added")}: ${image.caption}`);
  };

  const handleLibraryGenerateRequest = async (prompt: string) => {
    if (isFreeAccount) { toast.error(t("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة (PRO/Premium)", "La génération d'images est réservée aux comptes payants (PRO/Premium)", "Image generation is only available for paid accounts (PRO/Premium)")); return; }
    setGeneratingImages(true);
    try {
      const result = await generateLineArt.mutateAsync({
        prompt, style: "bw_lineart", subject: subject || "الإيقاظ العلمي", level: level || "السنة الخامسة ابتدائي", source: "exam-builder",
      });
      if (result.url) {
        setExamImages(prev => [...prev, { url: result.url, caption: prompt }]);
        toast.success(`${t("تم توليد وإضافة صورة", "Image générée et ajoutée", "Image generated and added")}: ${prompt}`);
      }
    } catch {
      toast.error(`${t("فشل توليد صورة", "Échec de génération d'image", "Image generation failed")}: ${prompt}`);
    }
    setGeneratingImages(false);
  };

  const handleOverlaySave = (dataUrl: string) => {
    if (!overlayEditorImage) return;
    setExamImages(prev => prev.map(img =>
      img.url === overlayEditorImage.url ? { ...img, url: dataUrl } : img
    ));
    setOverlayEditorImage(null);
    toast.success(t("تم حفظ الصورة مع التسميات العربية", "Image enregistrée avec les annotations arabes", "Image saved with Arabic labels"));
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
    toast.success(t("تم تحميل الاختبار من المكتبة", "Examen chargé depuis la bibliothèque", "Exam loaded from library"));
  };

  const hasExam = !!generatedExam;

  // ─── Input Panel ──────────────────────────────────────────────────────────────

  const inputPanel = (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Almarai', sans-serif" }}>
      {/* Criteria Info */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          {t("نظام المعايير المعتمد", "Système de critères adopté", "Adopted criteria system")}
        </p>
        <div className="space-y-1">
          {criteria.map(c => (
            <CriteriaBadge key={c.code} code={c.code} label={c.label} color={c.color} />
          ))}
        </div>
      </div>

      <Separator className="bg-gray-100" />

      {/* Form Fields */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{tt.subject} *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder={t("اختر المادة...", "Choisir la matière...", "Select subject...")} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{tt.level} *</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder={t("اختر المستوى...", "Choisir le niveau...", "Select level...")} />
            </SelectTrigger>
            <SelectContent>
              {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{tt.trimester} *</Label>
          <Select value={trimester} onValueChange={setTrimester}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
              <SelectValue placeholder={t("اختر الثلاثي...", "Choisir le trimestre...", "Select trimester...")} />
            </SelectTrigger>
            <SelectContent>
              {trimesters.map(tr => <SelectItem key={tr.value} value={tr.value}>{tr.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs font-medium">{tt.duration}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-600 text-xs font-medium">{t("المجموع (نقطة)", "Total (points)", "Total (points)")}</Label>
            <Input type="number" min={10} max={40} value={totalScore}
              onChange={e => setTotalScore(Number(e.target.value))}
              className="h-9 text-sm border-gray-200 bg-gray-50/50" />
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* School Name */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{t("اسم المدرسة (يظهر في الترويسة)", "Nom de l'école (affiché dans l'en-tête)", "School name (shown in header)")}</Label>
          <div className="flex gap-1.5">
            <Input
              value={schoolNameInput}
              onChange={e => setSchoolNameInput(e.target.value)}
              placeholder={t("مثال: المدرسة الابتدائية النموذجية", "Ex: École primaire modèle", "Ex: Model Primary School")}
              className="h-9 flex-1 text-sm border-gray-200 bg-gray-50/50 placeholder:text-gray-300"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveSchoolName}
              disabled={updateProfile.isPending || !schoolNameInput.trim()}
              className={`h-9 px-2 text-xs shrink-0 ${schoolNameSaved ? "border-green-400 text-green-600" : ""}`}
            >
              {schoolNameSaved ? "✅" : updateProfile.isPending ? "⏳" : tt.save}
            </Button>
          </div>
          {userSchoolName && <p className="text-[10px] text-green-500">{t("محفوظ", "Enregistré", "Saved")}: {userSchoolName}</p>}
        </div>

        {/* School Logo */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">
            {t("شعار المدرسة", "Logo de l'école", "School Logo")} {isFreeAccount && <span className="text-amber-500 text-[10px]">PRO</span>}
          </Label>
          <div className="flex items-center gap-2">
            {schoolLogo ? (
              <div className="relative w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                <img src={schoolLogo} alt={t("شعار", "Logo", "Logo")} className="w-full h-full object-contain p-0.5" />
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
                  if (isFreeAccount) { toast.error(t("ميزة رفع شعار المدرسة متاحة فقط للحسابات المدفوعة (PRO/Premium)", "Le téléversement du logo est réservé aux comptes payants (PRO/Premium)", "Logo upload is only available for paid accounts (PRO/Premium)")); e.target.value = ''; return; }
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { toast.error(t("حجم الشعار يجب أن لا يتجاوز 2MB", "La taille du logo ne doit pas dépasser 2 Mo", "Logo size must not exceed 2MB")); return; }
                  try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = (reader.result as string).split(',')[1];
                      const ext = file.name.split('.').pop() || 'png';
                      const result = await uploadSchoolLogo.mutateAsync({ base64Data: base64, fileExtension: ext, mimeType: file.type });
                      setSchoolLogo(result.url);
                      toast.success(t("تم رفع شعار المدرسة بنجاح", "Logo de l'école téléversé avec succès", "School logo uploaded successfully"));
                    };
                    reader.readAsDataURL(file);
                  } catch { toast.error(t("فشل في رفع الشعار", "Échec du téléversement du logo", "Failed to upload logo")); }
                }}
              />
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-xs text-gray-500 hover:bg-gray-100 transition-colors">
                {uploadSchoolLogo.isPending
                  ? t("جاري الرفع...", "Téléversement...", "Uploading...")
                  : schoolLogo
                    ? t("تغيير الشعار", "Changer le logo", "Change logo")
                    : t("رفع شعار المدرسة", "Téléverser le logo", "Upload school logo")}
              </div>
            </label>
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Topics */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{t("المحاور المقررة", "Axes du programme", "Program topics")} ({tt.optional})</Label>
          <Textarea value={topics} onChange={e => setTopics(e.target.value)}
            placeholder={t("مثال: الأعداد الصحيحة، الكسور...", "Ex: Nombres entiers, fractions...", "Ex: Whole numbers, fractions...")}
            className="resize-none h-14 text-sm border-gray-200 bg-gray-50/50 placeholder:text-gray-300" />
        </div>

        {/* Additional Instructions */}
        <div className="space-y-1">
          <Label className="text-gray-600 text-xs font-medium">{t("تعليمات إضافية", "Instructions supplémentaires", "Additional instructions")} ({tt.optional})</Label>
          <Textarea value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)}
            placeholder={t("مثال: أضف تمريناً على الهندسة...", "Ex: Ajouter un exercice de géométrie...", "Ex: Add a geometry exercise...")}
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
            ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t("جارٍ بناء الاختبار...", "Construction de l'examen...", "Building the exam...")}</span>
            : <span className="flex items-center gap-2"><FileEdit className="w-4 h-4" /> {t("بناء الاختبار", "Construire l'examen", "Build Exam")}</span>}
        </Button>

        {/* Quick Actions */}
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setShowLibrary(true)}
            className="text-xs h-7 px-2 flex items-center gap-1">
            <Library className="w-3 h-3" /> {t("مكتبة الاختبارات", "Bibliothèque d'examens", "Exam Library")}
          </Button>
          {hasExam && (
            <>
              <Button size="sm" variant="outline" onClick={handleSave}
                disabled={saveExam.isPending}
                className="text-xs h-7 px-2 flex items-center gap-1 border-green-200 text-green-600 hover:bg-green-50">
                <Save className="w-3 h-3" /> {saveExam.isPending ? t("جاري الحفظ...", "Enregistrement...", "Saving...") : tt.save}
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerateAnswerKey}
                disabled={generateAnswerKey.isPending}
                className="text-xs h-7 px-2 flex items-center gap-1 border-purple-200 text-purple-600 hover:bg-purple-50">
                <Key className="w-3 h-3" /> {generateAnswerKey.isPending ? t("جاري...", "En cours...", "Loading...") : t("تصحيح", "Corrigé", "Answer Key")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowPrintPreview(true)}
                className="text-xs h-7 px-2 flex items-center gap-1 border-amber-200 text-amber-600 hover:bg-amber-50">
                <Eye className="w-3 h-3" /> {t("معاينة الطباعة", "Aperçu d'impression", "Print Preview")}
              </Button>
              <Button size="sm" variant="outline"
                onClick={() => { if (isFreeAccount) { toast.error(t("ميزة توليد الرسومات متاحة فقط للحسابات المدفوعة", "La génération d'images est réservée aux comptes payants", "Image generation is only available for paid accounts")); return; } handleAutoGenerateImages(); }}
                disabled={generatingImages}
                className={`text-xs h-7 px-2 flex items-center gap-1 border-violet-200 text-violet-600 hover:bg-violet-50 ${isFreeAccount ? 'opacity-60' : ''}`}>
                <Palette className="w-3 h-3" /> {generatingImages ? t("توليد...", "Génération...", "Generating...") : t("رسومات", "Illustrations", "Illustrations")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowImageLibrary(true)}
                className="text-xs h-7 px-2 flex items-center gap-1 border-teal-200 text-teal-600 hover:bg-teal-50">
                <ImageIcon className="w-3 h-3" /> {t("مكتبة الصور", "Galerie d'images", "Image Gallery")}
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
                {t("تصحيح هذا الاختبار", "Corriger cet examen", "Grade this exam")}
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
              {t("الاختبار", "Examen", "Exam")}
            </TabsTrigger>
            <TabsTrigger value="answer" className="flex-1 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              disabled={!answerKey && !generateAnswerKey.isPending}>
              {t("نموذج الإجابة", "Corrigé type", "Answer Key")} {!answerKey && !generateAnswerKey.isPending && t("(اضغط تصحيح)", "(cliquez Corrigé)", "(click Answer Key)")}
              {generateAnswerKey.isPending && t(" جارٍ...", " en cours...", " loading...")}
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
                  const caption = draggedImage.caption || t("صورة توضيحية", "illustration", "illustration");
                  setGeneratedExam(prev => prev + `\n[رسم: ${caption}]\n`);
                  if (!examImages.find(img => img.url === draggedImage.url)) {
                    setExamImages(prev => [...prev, draggedImage]);
                  }
                  toast.success(`${t("تم إدراج الصورة", "Image insérée", "Image inserted")}: ${caption}`);
                  setDraggedImage(null);
                }
              }}
            >
              {isDragOver && (
                <div className="text-center py-6 text-violet-500 animate-pulse">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">{t("أفلت الصورة هنا لإدراجها في الاختبار", "Déposez l'image ici pour l'insérer dans l'examen", "Drop the image here to insert it into the exam")}</span>
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
                <p className="text-purple-600 font-semibold" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("يُعدّ نموذج الإجابة النموذجية...", "Préparation du corrigé type...", "Preparing the answer key...")}</p>
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
                {t("الرسومات التوضيحية المولّدة", "Illustrations générées", "Generated illustrations")} ({examImages.length})
              </h4>
              <Button size="sm" variant="outline" onClick={() => setExamImages([])}
                className="text-xs h-6 px-2 border-red-200 text-red-400 hover:bg-red-50">
                <Trash2 className="w-3 h-3 ml-1" /> {t("مسح الكل", "Tout supprimer", "Clear all")}
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
                    <img src={img.url} alt={img.caption || `${t("صورة", "Image", "Image")} ${idx + 1}`}
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
                      {t("إعادة", "Régénérer", "Redo")}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setOverlayEditorImage(img); }}
                      className="bg-green-500 text-white rounded px-1.5 py-0.5 text-[10px] hover:bg-green-400">
                      {t("تسميات", "Annotations", "Labels")}
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
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <Library className="w-5 h-5 text-blue-600" /> {t("مكتبة الاختبارات المحفوظة", "Bibliothèque d'examens enregistrés", "Saved Exams Library")}
            </DialogTitle>
          </DialogHeader>
          {loadingExams ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : !savedExams || savedExams.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">{t("لا توجد اختبارات محفوظة بعد", "Aucun examen enregistré", "No saved exams yet")}</p>
              <p className="text-sm mt-1">{t("أنشئ اختباراً واضغط \"حفظ\" لإضافته هنا", "Créez un examen et cliquez \"Enregistrer\" pour l'ajouter ici", "Create an exam and click \"Save\" to add it here")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedExams.map(exam => (
                <LibraryItem key={exam.id} exam={exam as SavedExam} onLoad={handleLoadFromLibrary}
                  onDelete={(id) => deleteExam.mutate({ id })} t={t} lang={language} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Modal */}
      {showPrintPreview && generatedExam && (
        <PrintPreview
          content={activeTab === "exam" ? generatedExam : answerKey}
          title={activeTab === "exam" ? `${t("اختبار", "Examen", "Exam")} ${subject}` : `${t("تصحيح اختبار", "Corrigé de l'examen", "Exam Answer Key")} ${subject}`}
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
