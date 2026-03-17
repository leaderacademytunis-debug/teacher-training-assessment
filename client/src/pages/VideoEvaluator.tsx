import { useState, useRef, useMemo, useCallback } from "react";
import { Loader2, Paperclip, X, Image as ImageIcon, Video, FileText, File, Film, Target, BarChart3, History, ChevronLeft, Star, TrendingUp, Award, Eye, BookOpen, Zap, Wrench, Upload, Copy, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";

const VIDEO_EVALUATOR_GRADIENT = "linear-gradient(135deg, #1A237E, #0D47A1, #01579B)";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

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

const CRITERIA_CONFIG = [
  { key: "scoreVisualQuality", label: "الجودة البصرية", shortLabel: "البصرية", feedbackKey: "feedbackVisualQuality", icon: Eye, color: "#8b5cf6", gradient: "from-violet-500 to-purple-600" },
  { key: "scoreNarrative", label: "السرد والسيناريو", shortLabel: "السرد", feedbackKey: "feedbackNarrative", icon: BookOpen, color: "#3b82f6", gradient: "from-blue-500 to-indigo-600" },
  { key: "scorePedagogical", label: "الملاءمة التربوية", shortLabel: "التربوية", feedbackKey: "feedbackPedagogical", icon: Target, color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  { key: "scoreEngagement", label: "التشويق والجذب", shortLabel: "التشويق", feedbackKey: "feedbackEngagement", icon: Zap, color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
  { key: "scoreTechnical", label: "جودة الموجه التقني", shortLabel: "الموجه", feedbackKey: "feedbackTechnical", icon: Wrench, color: "#ef4444", gradient: "from-red-500 to-rose-600" },
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
  { value: "other", label: "أداة أخرى" },
];

const GRADES = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
  "السنة السابعة أساسي", "السنة الثامنة أساسي", "السنة التاسعة أساسي",
  "السنة الأولى ثانوي", "السنة الثانية ثانوي", "السنة الثالثة ثانوي", "السنة الرابعة ثانوي",
];

const SUBJECTS = [
  "الإيقاظ العلمي", "الرياضيات", "اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية",
  "التربية الإسلامية", "التاريخ والجغرافيا", "التربية المدنية", "التربية التشكيلية",
  "التربية الموسيقية", "التربية البدنية", "العلوم الطبيعية", "العلوم الفيزيائية",
  "الإعلامية", "التكنولوجيا", "الفلسفة", "الاقتصاد", "أخرى",
];

function getScoreLevel(score: number, max: number = 100) {
  const pct = (score / max) * 100;
  if (pct >= 85) return { label: "ممتاز", color: "#16a34a", bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" };
  if (pct >= 65) return { label: "جيد", color: "#2563eb", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" };
  if (pct >= 45) return { label: "متوسط", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" };
  if (pct >= 25) return { label: "ضعيف", color: "#ea580c", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" };
  return { label: "ضعيف جداً", color: "#dc2626", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" };
}

// Animated score circle with smooth fill
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

// Grand total score display
function TotalScoreDisplay({ score, attemptNumber }: { score: number; attemptNumber?: number }) {
  const level = getScoreLevel(score);
  const percentage = score;

  return (
    <div className={`text-center p-8 rounded-2xl ${level.bg} border-2 ${level.border} relative overflow-hidden`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full border-4" style={{ borderColor: level.color }} />
        <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full border-4" style={{ borderColor: level.color }} />
      </div>
      <div className="relative z-10">
        {attemptNumber && (
          <span className={`inline-block text-xs px-3 py-1 rounded-full mb-3 ${level.badge}`}>
            المحاولة #{attemptNumber}
          </span>
        )}
        <div className="text-6xl font-black mb-2" style={{ color: level.color, fontFamily: "Cairo, sans-serif" }}>
          {score}<span className="text-2xl font-normal text-gray-400">/100</span>
        </div>
        <div className="text-lg font-bold mb-3" style={{ color: level.color }}>{level.label}</div>
        {/* Progress bar */}
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

// Radar chart for 5 criteria
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
            name="الدرجة"
            dataKey="score"
            stroke="#1A237E"
            fill="#1A237E"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/20`, "الدرجة"]}
            contentStyle={{ fontFamily: "Cairo, sans-serif", direction: "rtl" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Feedback card with score bar
function FeedbackCard({ title, feedback, score, icon: Icon, color }: { title: string; feedback: string; score: number; icon: React.ElementType; color: string }) {
  const level = getScoreLevel(score, 20);
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
      {/* Score bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(score / 20) * 100}%`, backgroundColor: color }} />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
    </div>
  );
}

// History evaluation card
function HistoryCard({ evaluation, onClick }: { evaluation: any; onClick: () => void }) {
  const level = getScoreLevel(evaluation.totalScore);
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 group" style={{ borderLeftColor: level.color }} onClick={onClick}>
      <CardContent className="py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.badge}`}>#{evaluation.attemptNumber}</span>
              {evaluation.toolUsed && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{evaluation.toolUsed}</span>}
              {evaluation.subject && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{evaluation.subject}</span>}
              {evaluation.grade && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{evaluation.grade}</span>}
            </div>
            {evaluation.lessonTitle && (
              <p className="text-sm font-medium text-gray-800 mb-1">{evaluation.lessonTitle}</p>
            )}
            <p className="text-xs text-gray-500 truncate max-w-md">{evaluation.originalPrompt?.substring(0, 100)}...</p>
            <p className="text-xs text-gray-400 mt-1.5">{new Date(evaluation.createdAt).toLocaleDateString("ar-TN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3 mr-4">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: level.color }}>{evaluation.totalScore}</div>
              <div className="text-xs text-gray-400 font-medium">/100</div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VideoEvaluator() {
  const [activeTab, setActiveTab] = useState<"evaluate" | "results" | "history">("evaluate");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [educationalObjective, setEducationalObjective] = useState("");
  const [toolUsed, setToolUsed] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  const evaluateMutation = trpc.videoEvaluator.evaluate.useMutation({
    onSuccess: (result) => {
      setEvaluationResult(result as EvaluationResult);
      setActiveTab("results");
      setIsLoading(false);
      toast.success("تم التقييم بنجاح!");
    },
    onError: (error: any) => {
      toast.error(error.message || "خطأ في التقييم");
      setIsLoading(false);
    },
  });

  const { data: myEvaluations, refetch: refetchEvaluations } = trpc.videoEvaluator.getMyEvaluations.useQuery();
  const { data: myStats, refetch: refetchStats } = trpc.videoEvaluator.getMyStats.useQuery();
  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 16 * 1024 * 1024) {
        toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 16 ميجابايت`);
        continue;
      }
      const newFile: AttachedFile = { name: file.name, size: file.size, type: file.type, file };
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachedFiles(prev => prev.map(f => f.name === file.name ? { ...f, preview: ev.target?.result as string } : f));
        };
        reader.readAsDataURL(file);
      }
      setAttachedFiles(prev => [...prev, newFile]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeFile = (index: number) => setAttachedFiles(prev => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const canSubmit = originalPrompt.trim() && targetAudience.trim() && educationalObjective.trim();

  const handleSubmit = async () => {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);

    try {
      const uploadedFiles: AttachedFile[] = [];
      for (const af of attachedFiles) {
        if (!af.file) continue;
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(af.file!);
        });
        const result = await uploadFileMutation.mutateAsync({ base64Data, fileName: af.name, mimeType: af.type });
        uploadedFiles.push({ name: af.name, size: af.size, type: af.type, url: result.url });
      }

      evaluateMutation.mutate({
        originalPrompt,
        targetAudience,
        educationalObjective,
        toolUsed: toolUsed || undefined,
        grade: grade || undefined,
        subject: subject || undefined,
        lessonTitle: lessonTitle || undefined,
        videoDescription: videoDescription || undefined,
        videoUrl: uploadedFiles.find(f => f.type.startsWith("video/"))?.url,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });
    } catch {
      toast.error("خطأ في رفع الملفات");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setOriginalPrompt("");
    setTargetAudience("");
    setEducationalObjective("");
    setToolUsed("");
    setGrade("");
    setSubject("");
    setLessonTitle("");
    setVideoDescription("");
    setAttachedFiles([]);
    setEvaluationResult(null);
    setActiveTab("evaluate");
  };

  // Re-evaluate with improved prompt
  const reEvaluateWithImprovedPrompt = () => {
    if (evaluationResult?.improvedPrompt) {
      setOriginalPrompt(evaluationResult.improvedPrompt);
      setEvaluationResult(null);
      setActiveTab("evaluate");
      toast.info("تم تعبئة الموجه المحسّن. يمكنك تعديله ثم إعادة التقييم.");
    }
  };

  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const { data: historyDetail } = trpc.videoEvaluator.getEvaluation.useQuery(
    { id: selectedHistoryId! },
    { enabled: selectedHistoryId !== null }
  );

  // Build radar chart data from evaluation
  const buildRadarData = (ev: any) => [
    { criterion: "البصرية", score: ev.scoreVisualQuality, fullMark: 20 },
    { criterion: "السرد", score: ev.scoreNarrative, fullMark: 20 },
    { criterion: "التربوية", score: ev.scorePedagogical, fullMark: 20 },
    { criterion: "التشويق", score: ev.scoreEngagement, fullMark: 20 },
    { criterion: "الموجه", score: ev.scoreTechnical, fullMark: 20 },
  ];

  const radarData = useMemo(() => {
    if (!evaluationResult) return [];
    return buildRadarData(evaluationResult);
  }, [evaluationResult]);

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <ToolPageHeader
        icon={Film}
        nameAr="مُقيِّم المعلم الرقمي"
        descAr="تقييم احترافي للفيديوهات التعليمية بشبكة 5 معايير"
        gradient={VIDEO_EVALUATOR_GRADIENT}
        backTo="/"
        actions={
          myStats && myStats.totalEvaluations > 0 ? (
            <div className="hidden md:flex items-center gap-3 text-white/90 text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">{myStats.totalEvaluations}</span>
                <span className="text-white/60">تقييم</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="font-medium">{myStats.averageScore}</span>
                <span className="text-white/60">/100</span>
              </div>
              {myStats.improvement > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/20 rounded-lg px-3 py-1.5 text-green-200">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+{myStats.improvement}</span>
                </div>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="border-b bg-background px-6">
        <div className="flex gap-1">
          {[
            { id: "evaluate" as const, label: "تقييم جديد", icon: <Target className="w-4 h-4" /> },
            { id: "results" as const, label: "النتائج", icon: <BarChart3 className="w-4 h-4" />, disabled: !evaluationResult },
            { id: "history" as const, label: "سجل التقييمات", icon: <History className="w-4 h-4" />, count: myEvaluations?.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => !(tab as any).disabled && setActiveTab(tab.id)}
              disabled={(tab as any).disabled}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : (tab as any).disabled
                  ? "border-transparent text-gray-300 cursor-not-allowed"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
              {(tab as any).count != null && (tab as any).count > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{(tab as any).count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {/* === TAB: EVALUATE === */}
        {activeTab === "evaluate" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Required Fields */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                    <Target className="w-4 h-4 text-blue-700" />
                  </div>
                  المعلومات الأساسية <span className="text-red-500 text-xs font-normal">(مطلوبة)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    الموجه (Prompt) المستخدم لتوليد الفيديو <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={originalPrompt}
                    onChange={(e) => setOriginalPrompt(e.target.value)}
                    placeholder="الصق هنا الموجه الذي استخدمته لتوليد الفيديو بالذكاء الاصطناعي... مثال: Create a 30-second animated video explaining the water cycle for 4th grade students..."
                    className="min-h-[120px] resize-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">يُفضّل كتابة الموجه بالإنجليزية كما استخدمته مع أداة الذكاء الاصطناعي</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      الفئة المستهدفة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="مثال: تلاميذ السنة الرابعة ابتدائي"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      الهدف التعليمي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={educationalObjective}
                      onChange={(e) => setEducationalObjective(e.target.value)}
                      placeholder="مثال: شرح دورة الماء في الطبيعة"
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
                  معلومات إضافية <span className="text-gray-400 text-xs font-normal">(اختيارية لتقييم أدق)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">الأداة المستخدمة</label>
                    <select
                      value={toolUsed}
                      onChange={(e) => setToolUsed(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">اختر الأداة</option>
                      {AI_TOOLS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">المستوى الدراسي</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">اختر المستوى</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">المادة</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    >
                      <option value="">اختر المادة</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">عنوان الدرس</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="مثال: دورة الماء في الطبيعة"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">وصف مختصر للفيديو</label>
                    <input
                      type="text"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="صف ما يحدث في الفيديو باختصار..."
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
                  إرفاق الفيديو أو لقطات شاشة
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
                    <p className="text-sm text-gray-600 font-medium">اضغط لإرفاق فيديو أو صور من الفيديو</p>
                    <p className="text-xs text-gray-400 mt-1">يدعم: MP4, WebM, JPG, PNG — الحد الأقصى: 16 ميجابايت لكل ملف</p>
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
                      <Paperclip className="w-4 h-4 ml-1" /> إضافة ملف آخر
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
                <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جارٍ التقييم بالذكاء الاصطناعي... (15-30 ثانية)</>
              ) : (
                <><Sparkles className="w-5 h-5 ml-2" /> تقييم الفيديو بالذكاء الاصطناعي</>
              )}
            </Button>

            {/* Scoring guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>كيف يعمل التقييم؟</h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {CRITERIA_CONFIG.map(c => (
                  <div key={c.key} className="flex items-center gap-1.5 text-gray-600">
                    <c.icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                    <span>{c.shortLabel}: 20 نقطة</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">المجموع: 100 نقطة — يقيّم الذكاء الاصطناعي كل معيار ويقدم ملاحظات مفصّلة + موجه محسّن</p>
            </div>
          </div>
        )}

        {/* === TAB: RESULTS === */}
        {activeTab === "results" && evaluationResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Total Score */}
            <TotalScoreDisplay score={evaluationResult.totalScore} attemptNumber={evaluationResult.attemptNumber} />

            {/* Radar Chart + Score Circles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    <BarChart3 className="w-4 h-4" />
                    خريطة المعايير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CriteriaRadarChart data={radarData} />
                </CardContent>
              </Card>

              {/* Score Circles */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    <Target className="w-4 h-4" />
                    تفصيل الدرجات
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
                    {CRITERIA_CONFIG.map(c => (
                      <ScoreCircle
                        key={c.key}
                        score={(evaluationResult as any)[c.key]}
                        maxScore={20}
                        label={c.shortLabel}
                        icon={c.icon}
                        color={c.color}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Feedback */}
            <Card className="shadow-sm border-2" style={{ borderColor: "#1A237E20" }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                    <Award className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>التقييم العام</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{evaluationResult.overallFeedback}</p>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <div>
              <h3 className="font-bold text-base mb-4 text-gray-800" style={{ fontFamily: "Cairo, sans-serif" }}>تفاصيل التقييم حسب المعيار</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CRITERIA_CONFIG.map(c => (
                  <FeedbackCard
                    key={c.key}
                    title={c.label}
                    feedback={(evaluationResult as any)[c.feedbackKey]}
                    score={(evaluationResult as any)[c.key]}
                    icon={c.icon}
                    color={c.color}
                  />
                ))}
              </div>
            </div>

            {/* Improved Prompt */}
            <Card className="shadow-sm border-2 border-green-200 bg-green-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100">
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-green-700" style={{ fontFamily: "Cairo, sans-serif" }}>الموجه المحسّن</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-100"
                      onClick={() => {
                        navigator.clipboard.writeText(evaluationResult.improvedPrompt);
                        toast.success("تم نسخ الموجه المحسّن!");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 ml-1" /> نسخ
                    </Button>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-mono" dir="ltr">{evaluationResult.improvedPrompt}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center pt-2 pb-4">
              <Button
                onClick={reEvaluateWithImprovedPrompt}
                className="text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
              >
                <RefreshCw className="w-4 h-4 ml-1.5" /> إعادة التقييم بالموجه المحسّن
              </Button>
              <Button onClick={resetForm} className="text-white shadow-md" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                <Target className="w-4 h-4 ml-1.5" /> تقييم فيديو جديد
              </Button>
              <Button variant="outline" onClick={() => { setActiveTab("history"); refetchEvaluations(); refetchStats(); }}>
                <History className="w-4 h-4 ml-1" /> سجل التقييمات
              </Button>
            </div>
          </div>
        )}

        {/* === TAB: HISTORY === */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {selectedHistoryId && historyDetail ? (
              <div className="space-y-6">
                <Button variant="ghost" onClick={() => setSelectedHistoryId(null)} className="mb-2 text-gray-600 hover:text-gray-900">
                  <ChevronRight className="w-4 h-4 ml-1" /> العودة للسجل
                </Button>
                
                <TotalScoreDisplay score={historyDetail.totalScore} attemptNumber={historyDetail.attemptNumber} />
                
                {/* Radar + Circles for history detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                        <BarChart3 className="w-4 h-4" /> خريطة المعايير
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CriteriaRadarChart data={buildRadarData(historyDetail)} />
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                        <Target className="w-4 h-4" /> تفصيل الدرجات
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
                        {CRITERIA_CONFIG.map(c => (
                          <ScoreCircle key={c.key} score={(historyDetail as any)[c.key]} maxScore={20} label={c.shortLabel} icon={c.icon} color={c.color} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Overall feedback */}
                {historyDetail.overallFeedback && (
                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5" style={{ color: "#1A237E" }} />
                        <h3 className="font-bold" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>التقييم العام</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{historyDetail.overallFeedback}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CRITERIA_CONFIG.map(c => {
                    const feedback = (historyDetail as any)[c.feedbackKey];
                    if (!feedback) return null;
                    return (
                      <FeedbackCard key={c.key} title={c.label} feedback={feedback} score={(historyDetail as any)[c.key]} icon={c.icon} color={c.color} />
                    );
                  })}
                </div>

                {/* Improved prompt */}
                {historyDetail.improvedPrompt && (
                  <Card className="shadow-sm border-green-200 bg-green-50/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-green-700" style={{ fontFamily: "Cairo, sans-serif" }}>الموجه المحسّن</h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-700 border-green-300 hover:bg-green-100"
                          onClick={() => {
                            navigator.clipboard.writeText(historyDetail.improvedPrompt!);
                            toast.success("تم نسخ الموجه المحسّن!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 ml-1" /> نسخ
                        </Button>
                      </div>
                      <p className="text-sm font-mono bg-white p-4 rounded-lg border border-green-200 leading-relaxed" dir="ltr">{historyDetail.improvedPrompt}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {historyDetail.toolUsed && <span className="bg-gray-100 px-3 py-1 rounded-full">الأداة: {historyDetail.toolUsed}</span>}
                  {historyDetail.grade && <span className="bg-gray-100 px-3 py-1 rounded-full">{historyDetail.grade}</span>}
                  {historyDetail.subject && <span className="bg-gray-100 px-3 py-1 rounded-full">{historyDetail.subject}</span>}
                  {historyDetail.lessonTitle && <span className="bg-gray-100 px-3 py-1 rounded-full">{historyDetail.lessonTitle}</span>}
                </div>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                {myStats && myStats.totalEvaluations > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-t-4 border-t-blue-500">
                      <CardContent className="pt-5 text-center">
                        <div className="text-3xl font-black text-blue-600">{myStats.totalEvaluations}</div>
                        <div className="text-xs text-gray-500 mt-1">إجمالي التقييمات</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-t-4 border-t-green-500">
                      <CardContent className="pt-5 text-center">
                        <div className="text-3xl font-black text-green-600">{myStats.averageScore}</div>
                        <div className="text-xs text-gray-500 mt-1">المعدل العام /100</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-t-4 border-t-purple-500">
                      <CardContent className="pt-5 text-center">
                        <div className="text-3xl font-black text-purple-600">{myStats.bestScore}</div>
                        <div className="text-xs text-gray-500 mt-1">أفضل درجة /100</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-t-4" style={{ borderTopColor: myStats.improvement >= 0 ? "#16a34a" : "#dc2626" }}>
                      <CardContent className="pt-5 text-center">
                        <div className={`text-3xl font-black ${myStats.improvement >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {myStats.improvement >= 0 ? "+" : ""}{myStats.improvement}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">التحسن</div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Averages radar for history */}
                {myStats && myStats.totalEvaluations > 0 && myStats.averages && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                        <BarChart3 className="w-4 h-4" /> متوسط الأداء حسب المعيار
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CriteriaRadarChart data={[
                        { criterion: "البصرية", score: myStats.averages.visual, fullMark: 20 },
                        { criterion: "السرد", score: myStats.averages.narrative, fullMark: 20 },
                        { criterion: "التربوية", score: myStats.averages.pedagogical, fullMark: 20 },
                        { criterion: "التشويق", score: myStats.averages.engagement, fullMark: 20 },
                        { criterion: "الموجه", score: myStats.averages.technical, fullMark: 20 },
                      ]} />
                    </CardContent>
                  </Card>
                )}

                {/* Evaluations List */}
                {myEvaluations && myEvaluations.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-gray-800" style={{ fontFamily: "Cairo, sans-serif" }}>جميع التقييمات</h3>
                    {myEvaluations.map((ev: any) => (
                      <HistoryCard key={ev.id} evaluation={ev} onClick={() => setSelectedHistoryId(ev.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <History className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-500 mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>لا توجد تقييمات سابقة</h3>
                    <p className="text-sm text-gray-400 mb-6">ابدأ بتقييم أول فيديو تعليمي لك!</p>
                    <Button onClick={() => setActiveTab("evaluate")} className="text-white shadow-md" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                      <Target className="w-4 h-4 ml-1.5" /> تقييم فيديو جديد
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
