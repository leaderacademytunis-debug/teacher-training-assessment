import { useState, useRef, useMemo, useCallback } from "react";
import { Loader2, Paperclip, X, Image as ImageIcon, Video, FileText, File, Film, Target, BarChart3, History, ChevronLeft, Star, TrendingUp, Award, Eye, BookOpen, Zap, Wrench, Upload, Copy, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const VIDEO_EVALUATOR_GRADIENT = "linear-gradient(135deg, #1A237E, #0D47A1, #01579B)";

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File;
}

interface EvaluationResult {
  scoreVisualQuality: number;
  scoreNarrative: number;
  scorePedagogical: number;
  scoreEngagement: number;
  scoreTechnical: number;
  feedbackVisualQuality: string;
  feedbackNarrative: string;
  feedbackPedagogical: string;
  feedbackEngagement: string;
  feedbackTechnical: string;
  overallFeedback: string;
  improvedPrompt: string;
  totalScore: number;
  attemptNumber: number;
}

const VideoEvaluator = () => {
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  const CRITERIA_CONFIG = [
    { key: "scoreVisualQuality", label: t("الجودة البصرية", "Qualité Visuelle", "Visual Quality"), shortLabel: t("البصرية", "Visuelle", "Visual"), feedbackKey: "feedbackVisualQuality", icon: Eye, color: "#8b5cf6", gradient: "from-violet-500 to-purple-600" },
    { key: "scoreNarrative", label: t("السرد والسيناريو", "Narration & Scénario", "Narrative & Script"), shortLabel: t("السرد", "Narratif", "Narrative"), feedbackKey: "feedbackNarrative", icon: BookOpen, color: "#3b82f6", gradient: "from-blue-500 to-indigo-600" },
    { key: "scorePedagogical", label: t("الملاءمة التربوية", "Pertinence Pédagogique", "Pedagogical Fit"), shortLabel: t("التربوية", "Pédago.", "Pedago."), feedbackKey: "feedbackPedagogical", icon: Target, color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
    { key: "scoreEngagement", label: t("التشويق والجذب", "Engagement & Accroche", "Engagement & Hook"), shortLabel: t("التشويق", "Engage.", "Engage."), feedbackKey: "feedbackEngagement", icon: Zap, color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
    { key: "scoreTechnical", label: t("جودة الموجه التقني", "Qualité du Prompt", "Prompt Quality"), shortLabel: t("الموجه", "Prompt", "Prompt"), feedbackKey: "feedbackTechnical", icon: Wrench, color: "#ef4444", gradient: "from-red-500 to-rose-600" },
  ] as const;

  const AI_TOOLS = [
    { value: "kling", label: "Kling AI" },
    { value: "runway", label: "Runway ML" },
    { value: "pika", label: "Pika Labs" },
    { value: "hailuo", label: "Hailuo MiniMax" },
    { value: "vidu", label: "Vidu AI" },
    { value: "sora", label: "Sora (OpenAI)" },
    { value: "luma", label: "Luma Dream Machine" },
    { value: "invideo", label: "InVideo AI" },
    { value: "other", label: t("أداة أخرى", "Autre outil", "Other tool") },
  ];

  const GRADES = [
    { value: "السنة الأولى ابتدائي", label: t("السنة الأولى ابتدائي", "1ère Année Primaire", "1st Grade Primary") },
    { value: "السنة الثانية ابتدائي", label: t("السنة الثانية ابتدائي", "2ème Année Primaire", "2nd Grade Primary") },
    { value: "السنة الثالثة ابتدائي", label: t("السنة الثالثة ابتدائي", "3ème Année Primaire", "3rd Grade Primary") },
    { value: "السنة الرابعة ابتدائي", label: t("السنة الرابعة ابتدائي", "4ème Année Primaire", "4th Grade Primary") },
    { value: "السنة الخامسة ابتدائي", label: t("السنة الخامسة ابتدائي", "5ème Année Primaire", "5th Grade Primary") },
    { value: "السنة السادسة ابتدائي", label: t("السنة السادسة ابتدائي", "6ème Année Primaire", "6th Grade Primary") },
    { value: "السنة السابعة أساسي", label: t("السنة السابعة أساسي", "7ème Année de Base", "7th Grade") },
    { value: "السنة الثامنة أساسي", label: t("السنة الثامنة أساسي", "8ème Année de Base", "8th Grade") },
    { value: "السنة التاسعة أساسي", label: t("السنة التاسعة أساسي", "9ème Année de Base", "9th Grade") },
    { value: "السنة الأولى ثانوي", label: t("السنة الأولى ثانوي", "1ère Année Secondaire", "10th Grade") },
    { value: "السنة الثانية ثانوي", label: t("السنة الثانية ثانوي", "2ème Année Secondaire", "11th Grade") },
    { value: "السنة الثالثة ثانوي", label: t("السنة الثالثة ثانوي", "3ème Année Secondaire", "12th Grade") },
    { value: "السنة الرابعة ثانوي", label: t("السنة الرابعة ثانوي", "4ème Année Secondaire", "Baccalauréat") },
  ];

  const SUBJECTS = [
    { value: "الإيقاظ العلمي", label: t("الإيقاظ العلمي", "Éveil scientifique", "Science Awakening") },
    { value: "الرياضيات", label: t("الرياضيات", "Mathématiques", "Mathematics") },
    { value: "اللغة العربية", label: t("اللغة العربية", "Langue Arabe", "Arabic Language") },
    { value: "اللغة الفرنسية", label: t("اللغة الفرنسية", "Langue Française", "French Language") },
    { value: "اللغة الإنجليزية", label: t("اللغة الإنجليزية", "Langue Anglaise", "English Language") },
    { value: "التربية الإسلامية", label: t("التربية الإسلامية", "Éducation Islamique", "Islamic Education") },
    { value: "التاريخ والجغرافيا", label: t("التاريخ والجغرافيا", "Histoire et Géographie", "History and Geography") },
    { value: "التربية المدنية", label: t("التربية المدنية", "Éducation Civique", "Civic Education") },
    { value: "التربية التشكيلية", label: t("التربية التشكيلية", "Arts Plastiques", "Visual Arts") },
    { value: "التربية الموسيقية", label: t("التربية الموسيقية", "Éducation Musicale", "Music Education") },
    { value: "التربية البدنية", label: t("التربية البدنية", "Éducation Physique", "Physical Education") },
    { value: "العلوم الطبيعية", label: t("العلوم الطبيعية", "Sciences Naturelles", "Natural Sciences") },
    { value: "العلوم الفيزيائية", label: t("العلوم الفيزيائية", "Sciences Physiques", "Physical Sciences") },
    { value: "الإعلامية", label: t("الإعلامية", "Informatique", "Computer Science") },
    { value: "التكنولوجيا", label: t("التكنولوجيا", "Technologie", "Technology") },
    { value: "الفلسفة", label: t("الفلسفة", "Philosophie", "Philosophy") },
    { value: "الاقتصاد", label: t("الاقتصاد", "Économie", "Economics") },
    { value: "أخرى", label: t("أخرى", "Autre", "Other") },
  ];

  const getScoreLevel = useCallback((score: number, max: number = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 85) return { label: t("ممتاز", "Excellent", "Excellent"), color: "#16a34a", bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" };
    if (pct >= 65) return { label: t("جيد", "Bon", "Good"), color: "#2563eb", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" };
    if (pct >= 45) return { label: t("متوسط", "Moyen", "Average"), color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" };
    if (pct >= 25) return { label: t("ضعيف", "Faible", "Weak"), color: "#ea580c", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" };
    return { label: t("ضعيف جداً", "Très Faible", "Very Weak"), color: "#dc2626", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" };
  }, [t]);

  function ScoreCircle({ score, maxScore, label, icon: Icon, color }: { score: number; maxScore: number; label: string; icon: React.ElementType; color: string }) {
    const percentage = (score / maxScore) * 100;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const level = getScoreLevel(score, maxScore);

    return (
      <div className="flex flex-col items-center gap-2 group">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="6" fill="none" />
            <circle
              cx="40" cy="40" r="36"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color }}>{score}</span>
            <span className="text-[10px] text-gray-400">/{maxScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span>{label}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${level.badge}`}>{level.label}</span>
      </div>
    );
  }

  function TotalScoreDisplay({ score, attemptNumber }: { score: number; attemptNumber?: number }) {
    const level = getScoreLevel(score);
    const percentage = score;

    return (
      <div className={`text-center p-8 rounded-2xl ${level.bg} border-2 ${level.border} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 w-20 h-20 rounded-full border-4" style={{ borderColor: level.color }} />
          <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full border-4" style={{ borderColor: level.color }} />
        </div>
        <div className="relative z-10">
          {attemptNumber && (
            <span className={`inline-block text-xs px-3 py-1 rounded-full mb-3 ${level.badge}`}>
              {t("المحاولة", "Tentative", "Attempt")} #{attemptNumber}
            </span>
          )}
          <div className="text-6xl font-black mb-2" style={{ color: level.color, fontFamily: "Cairo, sans-serif" }}>
            {score}<span className="text-2xl font-normal text-gray-400">/100</span>
          </div>
          <div className="text-lg font-bold mb-3" style={{ color: level.color }}>{level.label}</div>
          <div className="w-48 h-2.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%`, backgroundColor: level.color }}
            />
          </div>
        </div>
      </div>
    );
  }

  function CriteriaRadarChart({ data }: { data: { criterion: string; score: number; fullMark: number }[] }) {
    return (
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="criterion"
              tick={{ fontSize: 12, fill: "#4b5563", fontFamily: "Cairo, sans-serif" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 20]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickCount={5}
            />
            <Radar
              name={t("الدرجة", "Score", "Score")}
              dataKey="score"
              stroke="#1A237E"
              fill="#1A237E"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              formatter={(value: number) => [`${value}/20`, t("الدرجة", "Score", "Score")]}
              contentStyle={{ fontFamily: "Cairo, sans-serif", direction: isRTL ? "rtl" : "ltr" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  function FeedbackCard({ title, feedback, score, icon: Icon, color }: { title: string; feedback: string; score: number; icon: React.ElementType; color: string }) {
    return (
      <div className="p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: color + "30" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <h4 className="font-bold text-sm" style={{ color, fontFamily: "Cairo, sans-serif" }}>{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color }}>{score}</span>
            <span className="text-xs text-gray-400">/20</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(score / 20) * 100}%`, backgroundColor: color }} />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
      </div>
    );
  }

  function HistoryCard({ evaluation, onClick }: { evaluation: any; onClick: () => void }) {
    const level = getScoreLevel(evaluation.totalScore);
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 group" style={{ borderLeftColor: level.color }} onClick={onClick}>
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.badge}`}>#{evaluation.attemptNumber}</span>
                {evaluation.toolUsed && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{AI_TOOLS.find(tl => tl.value === evaluation.toolUsed)?.label || evaluation.toolUsed}</span>}
                {evaluation.grade && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{GRADES.find(g => g.value === evaluation.grade)?.label || evaluation.grade}</span>}
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate">{evaluation.educationalObjective}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(evaluation.createdAt).toLocaleString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className={`flex flex-col items-end ${isRTL ? "mr-3" : "ml-3"}`}>
              <div className="text-2xl font-bold" style={{ color: level.color }}>{evaluation.totalScore}</div>
              <div className="text-xs font-medium" style={{ color: level.color }}>{level.label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [prompt, setPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [educationalObjective, setEducationalObjective] = useState("");
  const [toolUsed, setToolUsed] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "results" | "history">("form");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: history, refetch: refetchHistory } = trpc.tool.videoEvaluator.getHistory.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: evaluateVideo, isLoading } = trpc.tool.videoEvaluator.evaluate.useMutation({
    onSuccess: (data) => {
      setEvaluationResult(data);
      setActiveTab("results");
      refetchHistory();
      toast.success(t("تم تقييم الفيديو بنجاح!", "Vidéo évaluée avec succès!", "Video evaluated successfully!"));
    },
    onError: (error) => {
      toast.error(t("حدث خطأ أثناء التقييم:", "Erreur lors de l'évaluation:", "An error occurred during evaluation:") + ` ${error.message}`)
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: AttachedFile[] = files.map(file => {
      const newFile: AttachedFile = { name: file.name, size: file.size, type: file.type, file };
      if (file.type.startsWith("image/")) {
        newFile.preview = URL.createObjectURL(file);
      }
      return newFile;
    });
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const fileToRemove = attachedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-6 h-6 text-gray-500" />;
    if (type.startsWith("video/")) return <Video className="w-6 h-6 text-gray-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const canSubmit = useMemo(() => {
    return prompt.trim().length > 10 && targetAudience.trim().length > 3 && educationalObjective.trim().length > 3;
  }, [prompt, targetAudience, educationalObjective]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const fileUrls = await uploadFiles();
    if (!fileUrls) return; // Upload failed

    evaluateVideo({
      prompt,
      targetAudience,
      educationalObjective,
      toolUsed,
      grade,
      subject,
      lessonTitle,
      videoDescription,
      fileUrls,
    });
  };

  const uploadFiles = async (): Promise<string[] | null> => {
    if (attachedFiles.length === 0) return [];

    const presignPromises = attachedFiles.map(file => trpc.general.getPresignedUrl.mutate({ fileName: file.name, fileType: file.type }));

    try {
      const presignedUrls = await Promise.all(presignPromises);

      const uploadPromises = presignedUrls.map(async (presigned, index) => {
        const file = attachedFiles[index].file;
        if (!file) throw new Error("File not found");

        const response = await fetch(presigned.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return presigned.fileUrl;
      });

      toast.promise(Promise.all(uploadPromises), {
        loading: t("جارٍ رفع الملفات...", "Téléchargement des fichiers...", "Uploading files..."),
        success: t("تم رفع الملفات بنجاح!", "Fichiers téléchargés avec succès!", "Files uploaded successfully!"),
        error: t("فشل رفع بعض الملفات.", "Échec du téléchargement de certains fichiers.", "Failed to upload some files."),
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("حدث خطأ أثناء رفع الملفات.", "Une erreur s'est produite lors du téléchargement des fichiers.", "An error occurred while uploading files."));
      return null;
    }
  };

  const radarData = useMemo(() => {
    if (!evaluationResult) return [];
    return CRITERIA_CONFIG.map(c => ({
      criterion: c.shortLabel,
      score: evaluationResult[c.key],
      fullMark: 20,
    }));
  }, [evaluationResult, CRITERIA_CONFIG]);

  const handleHistoryClick = (item: any) => {
    setSelectedHistoryItem(item);
    setEvaluationResult(item);
    setActiveTab("results");
  };

  const handleCopyPrompt = () => {
    if (evaluationResult?.improvedPrompt) {
      navigator.clipboard.writeText(evaluationResult.improvedPrompt);
      toast.success(t("تم نسخ الموجه المحسّن بنجاح!", "Prompt amélioré copié avec succès!", "Improved prompt copied successfully!"));
    }
  };

  const handleNewEvaluation = () => {
    setEvaluationResult(null);
    setSelectedHistoryItem(null);
    setActiveTab("form");
    // Reset form fields if needed
    setPrompt("");
    setTargetAudience("");
    setEducationalObjective("");
    setToolUsed("");
    setGrade("");
    setSubject("");
    setLessonTitle("");
    setVideoDescription("");
    setAttachedFiles([]);
  };

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      <ToolPageHeader
        title={t("مقيّم الفيديو التعليمي", "Évaluateur de Vidéo Pédagogique", "Educational Video Evaluator")}
        subtitle={t("حلل وقيّم فيديوهاتك التعليمية بالذكاء الاصطناعي", "Analysez et évaluez vos vidéos éducatives avec l'IA", "Analyze and evaluate your educational videos with AI")}
        gradient={VIDEO_EVALUATOR_GRADIENT}
        icon={Film}
      />

      <div className="flex-grow bg-muted/40 p-4 md:p-6 overflow-y-auto">
        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-4 bg-white rounded-lg shadow-sm p-1.5 flex items-center justify-center gap-2">
          <Button
            variant={activeTab === "form" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("form")}
            className={`flex-1 ${activeTab === "form" ? "font-bold" : ""}`}
          >
            <Wrench className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("إعداد التقييم", "Configuration", "Setup")}
          </Button>
          <Button
            variant={activeTab === "results" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("results")}
            disabled={!evaluationResult}
            className={`flex-1 ${activeTab === "results" ? "font-bold" : ""}`}
          >
            <BarChart3 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("النتائج", "Résultats", "Results")}
          </Button>
          <Button
            variant={activeTab === "history" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("history")}
            className={`flex-1 ${activeTab === "history" ? "font-bold" : ""}`}
          >
            <History className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("الأرشيف", "Historique", "History")}
          </Button>
        </div>

        {/* === TAB: FORM === */}
        {activeTab === "form" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Required Fields */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <Star className="w-4 h-4 text-gray-500" />
                  </div>
                  {t("المعلومات الأساسية", "Informations de Base", "Basic Information")} <span className="text-red-500 text-xs font-normal">({t("إلزامي", "Obligatoire", "Required")})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="text-sm font-medium text-gray-700 block mb-1.5">
                    {t("الموجه (Prompt) المستخدم لإنشاء الفيديو", "Prompt utilisé pour générer la vidéo", "Prompt used to generate the video")} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t("أدخل الموجه النصي الكامل الذي استخدمته لإنشاء الفيديو...", "Entrez le prompt textuel complet que vous avez utilisé pour générer la vidéo...", "Enter the full text prompt you used to generate the video...")}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      {t("الجمهور المستهدف", "Public Cible", "Target Audience")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder={t("مثال: تلاميذ السنة الرابعة ابتدائي", "Ex: Élèves de 4ème année primaire", "Ex: 4th-grade primary students")}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      {t("الهدف التعليمي", "Objectif Pédagogique", "Educational Objective")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={educationalObjective}
                      onChange={(e) => setEducationalObjective(e.target.value)}
                      placeholder={t("مثال: شرح دورة الماء في الطبيعة", "Ex: Expliquer le cycle de l'eau dans la nature", "Ex: Explaining the water cycle in nature")}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optional Fields */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                  </div>
                  {t("معلومات إضافية", "Informations Additionnelles", "Additional Information")} <span className="text-gray-400 text-xs font-normal">({t("اختيارية لتقييم أدق", "Optionnel pour une évaluation plus précise", "Optional for a more accurate evaluation")})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{t("الأداة المستخدمة", "Outil Utilisé", "Tool Used")}</label>
                    <select
                      value={toolUsed}
                      onChange={(e) => setToolUsed(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">{t("اختر الأداة", "Choisir l'outil", "Select tool")}</option>
                      {AI_TOOLS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{tt.level}</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">{t("اختر المستوى", "Choisir le niveau", "Select level")}</option>
                      {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{tt.subject}</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">{t("اختر المادة", "Choisir la matière", "Select subject")}</option>
                      {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{t("عنوان الدرس", "Titre de la Leçon", "Lesson Title")}</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder={t("مثال: دورة الماء في الطبيعة", "Ex: Le cycle de l'eau", "Ex: The Water Cycle")}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{t("وصف مختصر للفيديو", "Description courte de la vidéo", "Short video description")}</label>
                    <input
                      type="text"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder={t("صف ما يحدث في الفيديو باختصار...", "Décrivez brièvement ce qui se passe dans la vidéo...", "Briefly describe what happens in the video...")}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <Upload className="w-4 h-4 text-gray-500" />
                  </div>
                  {t("إرفاق الفيديو أو لقطات شاشة", "Joindre la vidéo ou des captures d'écran", "Attach Video or Screenshots")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input ref={fileInputRef} type="file" multiple accept="video/*,image/*" className="hidden" onChange={handleFileSelect} />
                
                {attachedFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                      <Paperclip className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{t("اضغط لإرفاق فيديو أو صور من الفيديو", "Cliquez pour joindre une vidéo ou des images", "Click to attach a video or images from the video")}</p>
                    <p className="text-xs text-gray-400 mt-1">{t("يدعم", "Supporte", "Supports")}: MP4, WebM, JPG, PNG — {t("الحد الأقصى", "Max", "Max")}: 16MB {t("لكل ملف", "par fichier", "per file")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-background rounded flex items-center justify-center">{getFileIcon(file.type)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
                      <Paperclip className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} /> {t("إضافة ملف آخر", "Ajouter un autre fichier", "Add another file")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className="w-full h-14 text-lg font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: canSubmit ? "linear-gradient(135deg, #1A237E, #1565C0)" : undefined }}
            >
              {isLoading ? (
                <><Loader2 className={`w-5 h-5 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} /> {t("جارٍ التقييم بالذكاء الاصطناعي... (15-30 ثانية)", "Évaluation par IA en cours... (15-30s)", "AI evaluation in progress... (15-30s)")}</>
              ) : (
                <><Sparkles className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("تقييم الفيديو بالذكاء الاصطناعي", "Évaluer la vidéo par IA", "Evaluate Video with AI")}</>
              )}
            </Button>

            {/* Scoring guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>{t("كيف يعمل التقييم؟", "Comment fonctionne l'évaluation ?", "How does the evaluation work?")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {CRITERIA_CONFIG.map(c => (
                  <div key={c.key} className="flex items-center gap-1.5 text-gray-600">
                    <c.icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                    <span>{c.shortLabel}: {t("نقطة", "pts", "pts")}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">{t("المجموع: 100 نقطة — يقيّم الذكاء الاصطناعي كل معيار ويقدم ملاحظات مفصّلة + موجه محسّن", "Total: 100 points — L'IA évalue chaque critère, fournit des retours détaillés et un prompt amélioré", "Total: 100 points — The AI evaluates each criterion, provides detailed feedback, and an improved prompt")}</p>
            </div>
          </div>
        )}

        {/* === TAB: RESULTS === */}
        {activeTab === "results" && evaluationResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <TotalScoreDisplay score={evaluationResult.totalScore} attemptNumber={evaluationResult.attemptNumber} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    <BarChart3 className="w-4 h-4" />
                    {t("خريطة المعايير", "Carte des Critères", "Criteria Map")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CriteriaRadarChart data={radarData} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    <Target className="w-4 h-4" />
                    {t("تفصيل الدرجات", "Détail des Scores", "Score Breakdown")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-4 gap-x-2">
                  {CRITERIA_CONFIG.map(c => (
                    <ScoreCircle
                      key={c.key}
                      score={evaluationResult[c.key]}
                      maxScore={20}
                      label={c.shortLabel}
                      icon={c.icon}
                      color={c.color}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                  <TrendingUp className="w-5 h-5" />
                  {t("التقييم العام والتوصيات", "Évaluation Globale et Recommandations", "Overall Evaluation and Recommendations")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{evaluationResult.overallFeedback}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {CRITERIA_CONFIG.map(c => (
                <FeedbackCard
                  key={c.key}
                  title={c.label}
                  feedback={evaluationResult[c.feedbackKey]}
                  score={evaluationResult[c.key]}
                  icon={c.icon}
                  color={c.color}
                />
              ))}
            </div>

            <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <Sparkles className="w-5 h-5" />
                  {t("الموجه المحسّن", "Prompt Amélioré", "Improved Prompt")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} h-8 w-8 text-gray-500 hover:bg-blue-100 hover:text-blue-700`}
                    onClick={handleCopyPrompt}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <p className="text-sm text-gray-800 leading-loose whitespace-pre-wrap" style={{ fontFamily: "monospace" }}>
                    {evaluationResult.improvedPrompt}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleNewEvaluation} size="lg" className="h-12 text-base">
                <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("تقييم جديد", "Nouvelle Évaluation", "New Evaluation")}
              </Button>
              <Button onClick={() => setActiveTab("history")} size="lg" variant="outline" className="h-12 text-base">
                <History className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("عرض الأرشيف", "Voir l'Historique", "View History")}
              </Button>
            </div>
          </div>
        )}

        {/* === TAB: HISTORY === */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <History className="w-5 h-5" />
                  {t("أرشيف التقييمات", "Historique des Évaluations", "Evaluation History")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history && history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map(item => (
                      <HistoryCard key={item.id} evaluation={item} onClick={() => handleHistoryClick(item)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium">{t("لا توجد تقييمات سابقة", "Aucune évaluation précédente", "No previous evaluations")}</h3>
                    <p className="text-sm mt-1">{t("سيظهر أرشيف تقييماتك هنا.", "Votre historique d'évaluation apparaîtra ici.", "Your evaluation history will appear here.")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEvaluator;

