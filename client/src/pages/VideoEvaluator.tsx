import { useState, useRef, useMemo, useCallback } from "react";
import { Loader2, Paperclip, X, Image as ImageIcon, Video, FileText, File, Film, Target, BarChart3, History, ChevronLeft, Star, TrendingUp, Award, Eye, BookOpen, Zap, Wrench, Upload, Copy, RefreshCw, ChevronRight, Sparkles, Globe, Youtube, Camera, Link2, Play, CheckCircle2, Cloud, Scissors, LineChart as LineChartIcon, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import ToolPageHeader from "@/components/ToolPageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";


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
            <RechartsTooltip
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

  // Multi-input source state
  const [inputMode, setInputMode] = useState<"upload" | "youtube" | "url" | "camera" | "cloud">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [youtubeData, setYoutubeData] = useState<{ videoId: string; title: string; author: string; thumbnailUrl: string; embedUrl: string } | null>(null);
  const [directUrlData, setDirectUrlData] = useState<{ fileUrl: string; contentType: string; size: number } | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [cloudUrl, setCloudUrl] = useState("");
  const [cloudData, setCloudData] = useState<{ fileUrl: string; provider: string; fileName: string } | null>(null);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [oversizedFile, setOversizedFile] = useState<AttachedFile | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: history, refetch: refetchHistory } = trpc.tool.videoEvaluator.getMyEvaluations.useQuery(undefined, {
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
    // Check for oversized video files (>16MB)
    const MAX_SIZE = 16 * 1024 * 1024; // 16MB
    const oversized = newFiles.find(f => f.size > MAX_SIZE && f.type.startsWith("video/"));
    if (oversized) {
      setOversizedFile(oversized);
      setShowTrimmer(true);
      // Still add the file but show the warning
    }
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

    let fileUrls: string[] = [];

    if (inputMode === "upload") {
      const uploaded = await uploadFiles();
      if (!uploaded) return;
      fileUrls = uploaded;
    } else if (inputMode === "youtube" && youtubeData) {
      // Pass thumbnail URL as attachment for the AI to analyze
      fileUrls = [youtubeData.thumbnailUrl];
    } else if (inputMode === "url" && directUrlData) {
      fileUrls = [directUrlData.fileUrl];
    } else if (inputMode === "cloud" && cloudData) {
      fileUrls = [cloudData.fileUrl];
    } else if (inputMode === "camera" && recordedBlob) {
      const file = new File([recordedBlob], "camera-recording.webm", { type: "video/webm" });
      const cameraFile: AttachedFile = { name: file.name, size: file.size, type: file.type, file };
      const savedFiles = [...attachedFiles];
      setAttachedFiles([cameraFile]);
      try {
        const presigned = await trpc.general.getPresignedUrl.mutate({ fileName: file.name, fileType: file.type });
        const response = await fetch(presigned.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!response.ok) throw new Error("Upload failed");
        fileUrls = [presigned.fileUrl];
      } catch {
        toast.error(t("فشل في رفع التسجيل", "Échec de l'envoi", "Upload failed"));
        setAttachedFiles(savedFiles);
        return;
      }
      setAttachedFiles(savedFiles);
    }

    // Build video description with source info
    let enrichedDescription = videoDescription;
    if (inputMode === "youtube" && youtubeData) {
      enrichedDescription = `[فيديو يوتيوب: ${youtubeData.title} - ${youtubeData.author}] ${videoDescription}`;
    } else if (inputMode === "cloud" && cloudData) {
      enrichedDescription = `[${cloudData.provider}: ${cloudData.fileName}] ${videoDescription}`;
    }

    evaluateVideo({
      prompt,
      targetAudience,
      educationalObjective,
      toolUsed,
      grade,
      subject,
      lessonTitle,
      videoDescription: enrichedDescription,
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

  // Process YouTube URL
  const handleProcessYoutubeUrl = async () => {
    if (!youtubeUrl.trim()) return;
    setIsProcessingUrl(true);
    try {
      const result = await trpc.tool.videoEvaluator.processVideoUrl.mutate({ url: youtubeUrl.trim(), type: "youtube" });
      if (result.success && result.type === "youtube") {
        setYoutubeData({ videoId: result.videoId!, title: result.title!, author: result.author!, thumbnailUrl: result.thumbnailUrl!, embedUrl: result.embedUrl! });
        toast.success(t("تم جلب معلومات الفيديو بنجاح!", "Informations vidéo récupérées!", "Video info fetched!"));
      }
    } catch (e: any) {
      toast.error(e.message || t("فشل في معالجة رابط يوتيوب", "Échec du traitement du lien YouTube", "Failed to process YouTube link"));
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Process cloud storage URL (Google Drive / Dropbox)
  const handleProcessCloudUrl = async () => {
    if (!cloudUrl.trim()) return;
    setIsProcessingUrl(true);
    try {
      let downloadUrl = cloudUrl.trim();
      let provider = "";
      let fileName = "";

      // Google Drive: convert share link to direct download
      const gdriveMatch = downloadUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
      const gdriveMatch2 = downloadUrl.match(/drive\.google\.com\/open\?id=([^&]+)/);
      const fileId = gdriveMatch?.[1] || gdriveMatch2?.[1];
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        provider = "Google Drive";
        fileName = `drive-video-${fileId.slice(0, 8)}`;
      }

      // Dropbox: convert share link to direct download
      if (downloadUrl.includes("dropbox.com")) {
        downloadUrl = downloadUrl.replace("dl=0", "dl=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
        provider = "Dropbox";
        const parts = downloadUrl.split("/");
        fileName = parts[parts.length - 1]?.split("?")[0] || "dropbox-video";
      }

      // OneDrive: convert share link
      if (downloadUrl.includes("1drv.ms") || downloadUrl.includes("onedrive.live.com")) {
        downloadUrl = downloadUrl.replace("redir", "download");
        provider = "OneDrive";
        fileName = "onedrive-video";
      }

      if (!provider) {
        toast.error(t("الرجاء لصق رابط من Google Drive أو Dropbox أو OneDrive", "Veuillez coller un lien Google Drive, Dropbox ou OneDrive", "Please paste a Google Drive, Dropbox, or OneDrive link"));
        setIsProcessingUrl(false);
        return;
      }

      setCloudData({ fileUrl: downloadUrl, provider, fileName });
      toast.success(t(`تم التعرف على رابط ${provider}!`, `Lien ${provider} reconnu!`, `${provider} link recognized!`));
    } catch (e: any) {
      toast.error(e.message || t("فشل في معالجة رابط التخزين السحابي", "Échec du traitement du lien cloud", "Failed to process cloud link"));
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Process direct URL
  const handleProcessDirectUrl = async () => {
    if (!directUrl.trim()) return;
    setIsProcessingUrl(true);
    try {
      const result = await trpc.tool.videoEvaluator.processVideoUrl.mutate({ url: directUrl.trim(), type: "direct" });
      if (result.success && result.type === "direct") {
        setDirectUrlData({ fileUrl: result.fileUrl!, contentType: result.contentType!, size: result.size! });
        toast.success(t("تم التحقق من الرابط بنجاح!", "Lien vérifié avec succès!", "Link verified!"));
      }
    } catch (e: any) {
      toast.error(e.message || t("فشل في معالجة الرابط", "Échec du traitement du lien", "Failed to process link"));
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Camera recording
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (e) {
      toast.error(t("تعذر الوصول إلى الكاميرا. تأكد من منح الإذن.", "Impossible d'accéder à la caméra.", "Cannot access camera."));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    const mr = new MediaRecorder(cameraStream, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNewEvaluation = () => {
    setEvaluationResult(null);
    setSelectedHistoryItem(null);
    setActiveTab("form");
    setPrompt("");
    setTargetAudience("");
    setEducationalObjective("");
    setToolUsed("");
    setGrade("");
    setSubject("");
    setLessonTitle("");
    setVideoDescription("");
    setAttachedFiles([]);
    setYoutubeUrl("");
    setDirectUrl("");
    setCloudUrl("");
    setYoutubeData(null);
    setDirectUrlData(null);
    setCloudData(null);
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    setOversizedFile(null);
    setShowTrimmer(false);
    stopCamera();
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

            {/* Video Input - Multi-Tab */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <Film className="w-4 h-4 text-gray-500" />
                  </div>
                  {t("إدخال الفيديو", "Source Vidéo", "Video Input")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input mode tabs */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { mode: "upload" as const, icon: Upload, label: t("رفع ملف", "Importer", "Upload"), color: "#3b82f6" },
                    { mode: "youtube" as const, icon: Youtube, label: t("يوتيوب", "YouTube", "YouTube"), color: "#ef4444" },
                    { mode: "url" as const, icon: Globe, label: t("رابط مباشر", "Lien Direct", "Direct URL"), color: "#10b981" },
                    { mode: "cloud" as const, icon: Cloud, label: t("تخزين سحابي", "Cloud", "Cloud Storage"), color: "#f97316" },
                    { mode: "camera" as const, icon: Camera, label: t("كاميرا", "Caméra", "Camera"), color: "#8b5cf6" },
                  ].map(({ mode, icon: Icon, label, color }) => (
                    <button
                      key={mode}
                      onClick={() => { setInputMode(mode); if (mode !== "camera") stopCamera(); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                        inputMode === mode
                          ? "border-current shadow-md scale-[1.02]"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      style={inputMode === mode ? { borderColor: color, backgroundColor: color + "08" } : {}}
                    >
                      <Icon className="w-5 h-5" style={{ color: inputMode === mode ? color : "#9ca3af" }} />
                      <span className={`text-xs font-medium ${inputMode === mode ? "" : "text-gray-500"}`} style={inputMode === mode ? { color } : {}}>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Upload Mode */}
                {inputMode === "upload" && (
                  <>
                    <input ref={fileInputRef} type="file" multiple accept="video/*,image/*" className="hidden" onChange={handleFileSelect} />
                    {attachedFiles.length === 0 ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                          <Paperclip className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{t("اضغط لإرفاق فيديو أو صور من الفيديو", "Cliquez pour joindre une vidéo ou des images", "Click to attach a video or images")}</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, WebM, JPG, PNG — {t("الحد الأقصى", "Max", "Max")}: 16MB</p>
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
                          <Paperclip className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`} /> {t("إضافة ملف آخر", "Ajouter un autre", "Add another")}
                        </Button>
                      </div>
                    )}
                    {/* Oversized file warning */}
                    {showTrimmer && oversizedFile && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-800">{t("حجم الفيديو يتجاوز 16MB", "La vid\u00e9o d\u00e9passe 16 Mo", "Video exceeds 16MB")}</h4>
                            <p className="text-xs text-amber-700 mt-1">
                              {t(
                                `حجم الملف (${formatFileSize(oversizedFile.size)}) يتجاوز الحد الأقصى. يمكنك قص مقطع محدد أو المتابعة باستخدام صور من الفيديو بدلاً.`,
                                `Le fichier (${formatFileSize(oversizedFile.size)}) d\u00e9passe la limite. Vous pouvez couper un extrait ou utiliser des captures d'\u00e9cran.`,
                                `File size (${formatFileSize(oversizedFile.size)}) exceeds the limit. You can trim a clip or use screenshots instead.`
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{t("بداية المقطع", "D\u00e9but", "Clip Start")}: {trimStart}%</span>
                            <span>{t("نهاية المقطع", "Fin", "Clip End")}: {trimEnd}%</span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Scissors className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <input
                              type="range"
                              min={0}
                              max={90}
                              value={trimStart}
                              onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 10))}
                              className="flex-1 accent-amber-500 h-2"
                            />
                            <input
                              type="range"
                              min={10}
                              max={100}
                              value={trimEnd}
                              onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 10))}
                              className="flex-1 accent-amber-500 h-2"
                            />
                          </div>
                          <p className="text-xs text-amber-600 text-center">
                            {t(
                              `سيتم استخدام ${trimEnd - trimStart}% من الفيديو (≈ ${formatFileSize(oversizedFile.size * (trimEnd - trimStart) / 100)})`,
                              `${trimEnd - trimStart}% de la vid\u00e9o sera utilis\u00e9 (\u2248 ${formatFileSize(oversizedFile.size * (trimEnd - trimStart) / 100)})`,
                              `${trimEnd - trimStart}% of video will be used (\u2248 ${formatFileSize(oversizedFile.size * (trimEnd - trimStart) / 100)})`
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                            onClick={() => {
                              toast.info(t("سيتم إرسال الفيديو مع تحديد المقطع المختار", "La vid\u00e9o sera envoy\u00e9e avec l'extrait s\u00e9lectionn\u00e9", "Video will be sent with the selected clip"));
                              setShowTrimmer(false);
                            }}
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            {t("قص ومتابعة", "Couper et continuer", "Trim & Continue")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowTrimmer(false);
                              setOversizedFile(null);
                            }}
                          >
                            {t("متابعة بدون قص", "Continuer sans couper", "Continue without trimming")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* YouTube Mode */}
                {inputMode === "youtube" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Youtube className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-red-400`} />
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => { setYoutubeUrl(e.target.value); setYoutubeData(null); }}
                          placeholder={t("الصق رابط يوتيوب هنا...", "Collez le lien YouTube ici...", "Paste YouTube link here...")}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-background`}
                          dir="ltr"
                        />
                      </div>
                      <Button
                        onClick={handleProcessYoutubeUrl}
                        disabled={!youtubeUrl.trim() || isProcessingUrl}
                        className="bg-red-600 hover:bg-red-700 text-white px-4"
                      >
                        {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                    {youtubeData && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4 items-start">
                        <img src={youtubeData.thumbnailUrl} alt={youtubeData.title} className="w-32 h-20 object-cover rounded-lg shadow-sm flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-green-600 font-medium">{t("تم التحقق", "Vérifié", "Verified")}</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-2">{youtubeData.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{youtubeData.author}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{t("يدعم: youtube.com/watch?v=... و youtu.be/... و youtube.com/shorts/...", "Supporte: youtube.com/watch?v=... et youtu.be/... et youtube.com/shorts/...", "Supports: youtube.com/watch?v=... and youtu.be/... and youtube.com/shorts/...")}</p>
                  </div>
                )}

                {/* Direct URL Mode */}
                {inputMode === "url" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400`} />
                        <input
                          type="url"
                          value={directUrl}
                          onChange={(e) => { setDirectUrl(e.target.value); setDirectUrlData(null); }}
                          placeholder={t("الصق رابط الفيديو المباشر هنا...", "Collez le lien direct de la vidéo ici...", "Paste direct video URL here...")}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-background`}
                          dir="ltr"
                        />
                      </div>
                      <Button
                        onClick={handleProcessDirectUrl}
                        disabled={!directUrl.trim() || isProcessingUrl}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                      >
                        {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    {directUrlData && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700">{t("تم التحقق من الرابط", "Lien vérifié", "Link verified")}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{t("النوع", "Type", "Type")}: {directUrlData.contentType || t("غير محدد", "Indéfini", "Unknown")}</span>
                          {directUrlData.size > 0 && <span>{t("الحجم", "Taille", "Size")}: {formatFileSize(directUrlData.size)}</span>}
                        </div>
                        {directUrlData.contentType?.startsWith("video/") && (
                          <video src={directUrlData.fileUrl} controls className="w-full mt-3 rounded-lg max-h-48" />
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{t("يدعم روابط مباشرة لملفات MP4, WebM, أو صور من الفيديو", "Supporte les liens directs vers MP4, WebM ou captures d'écran", "Supports direct links to MP4, WebM, or video screenshots")}</p>
                  </div>
                )}

                {/* Cloud Storage Mode */}
                {inputMode === "cloud" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Cloud className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400`} />
                        <input
                          type="url"
                          value={cloudUrl}
                          onChange={(e) => { setCloudUrl(e.target.value); setCloudData(null); }}
                          placeholder={t("الصق رابط Google Drive أو Dropbox هنا...", "Collez le lien Google Drive ou Dropbox ici...", "Paste Google Drive or Dropbox link here...")}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-background`}
                          dir="ltr"
                        />
                      </div>
                      <Button
                        onClick={handleProcessCloudUrl}
                        disabled={!cloudUrl.trim() || isProcessingUrl}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4"
                      >
                        {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    {cloudData && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700">{t("تم التعرف على الرابط", "Lien reconnu", "Link recognized")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cloudData.provider === 'Google Drive' ? 'bg-blue-100' : cloudData.provider === 'Dropbox' ? 'bg-blue-100' : 'bg-sky-100'}`}>
                            <Cloud className={`w-4 h-4 ${cloudData.provider === 'Google Drive' ? 'text-blue-600' : cloudData.provider === 'Dropbox' ? 'text-blue-500' : 'text-sky-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{cloudData.provider}</p>
                            <p className="text-xs text-gray-500">{cloudData.fileName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Google Drive</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dropbox</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> OneDrive</span>
                    </div>
                  </div>
                )}

                {/* Camera Mode */}
                {inputMode === "camera" && (
                  <div className="space-y-3">
                    {!cameraStream && !recordedPreviewUrl && (
                      <div
                        onClick={startCamera}
                        className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 transition-colors">
                          <Camera className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{t("اضغط لتشغيل الكاميرا", "Cliquez pour activer la caméra", "Click to start camera")}</p>
                        <p className="text-xs text-gray-400 mt-1">{t("سجل فيديو مباشرة من كاميرا جهازك", "Enregistrez directement depuis votre caméra", "Record directly from your device camera")}</p>
                      </div>
                    )}
                    {cameraStream && (
                      <div className="relative">
                        <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full rounded-xl bg-black max-h-64" />
                        <div className="flex justify-center gap-3 mt-3">
                          {!isRecording ? (
                            <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                              {t("بدء التسجيل", "Démarrer", "Start Recording")}
                            </Button>
                          ) : (
                            <Button onClick={stopRecording} variant="destructive" className="gap-2">
                              <div className="w-3 h-3 rounded-sm bg-white" />
                              {t("إيقاف التسجيل", "Arrêter", "Stop Recording")}
                            </Button>
                          )}
                          <Button onClick={stopCamera} variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {isRecording && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            {t("جارٍ التسجيل...", "Enregistrement...", "Recording...")}
                          </div>
                        )}
                      </div>
                    )}
                    {recordedPreviewUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700">{t("تم التسجيل بنجاح", "Enregistrement réussi", "Recording successful")}</span>
                        </div>
                        <video src={recordedPreviewUrl} controls className="w-full rounded-xl max-h-48" />
                        <Button variant="outline" size="sm" onClick={() => { setRecordedBlob(null); setRecordedPreviewUrl(null); startCamera(); }}>
                          <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> {t("إعادة التسجيل", "Réenregistrer", "Re-record")}
                        </Button>
                      </div>
                    )}
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
            {/* Progress Analysis Charts */}
            {history && history.length >= 2 && (() => {
              const sorted = [...history].sort((a, b) => a.attemptNumber - b.attemptNumber);
              const first = sorted[0];
              const last = sorted[sorted.length - 1];
              const improvement = last.totalScore - first.totalScore;
              const improvementPct = first.totalScore > 0 ? Math.round((improvement / first.totalScore) * 100) : 0;

              const lineData = sorted.map(item => ({
                name: `#${item.attemptNumber}`,
                score: item.totalScore,
              }));

              const comparisonRadarData = CRITERIA_CONFIG.map(c => ({
                criterion: c.shortLabel,
                first: (first as any)[c.key] || 0,
                last: (last as any)[c.key] || 0,
                fullMark: 20,
              }));

              return (
                <Card className="shadow-sm border-t-4 border-t-indigo-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                      <TrendingUp className="w-5 h-5" />
                      {t("تحليل التقدم", "Analyse de Progression", "Progress Analysis")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Improvement Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{t("أول تقييم", "1er Score", "First Score")}</p>
                        <p className="text-2xl font-bold text-blue-600">{first.totalScore}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{t("آخر تقييم", "Dernier Score", "Latest Score")}</p>
                        <p className="text-2xl font-bold text-green-600">{last.totalScore}</p>
                      </div>
                      <div className={`text-center p-4 rounded-xl ${improvement >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <p className="text-xs text-gray-500 mb-1">{t("نسبة التحسن", "Amélioration", "Improvement")}</p>
                        <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {improvement >= 0 ? '+' : ''}{improvementPct}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Line Chart - Score Evolution */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                          <LineChartIcon className="w-4 h-4 text-indigo-500" />
                          {t("تطور النتيجة الإجمالية", "Évolution du Score", "Score Evolution")}
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                              formatter={(value: number) => [`${value}/100`, t("النتيجة", "Score", "Score")]}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#4f46e5"
                              strokeWidth={3}
                              dot={{ fill: '#4f46e5', strokeWidth: 2, r: 5 }}
                              activeDot={{ r: 7, fill: '#4f46e5' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Radar Chart - First vs Last Comparison */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                          <BarChart3 className="w-4 h-4 text-indigo-500" />
                          {t("مقارنة المعايير: أول ↔ آخر", "Critères: 1er \u2194 Dernier", "Criteria: First \u2194 Last")}
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={comparisonRadarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 20]} tick={{ fontSize: 10 }} />
                            <Radar name={t("أول تقييم", "1er", "First")} dataKey="first" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                            <Radar name={t("آخر تقييم", "Dernier", "Last")} dataKey="last" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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

