import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowRight, Theater, Users, Sparkles, Download, Loader2,
  Play, Pause, ChevronDown, ChevronUp, Lightbulb, Target,
  Clock, BookOpen, Palette, MessageCircle, Star, Award,
  Wand2, UserPlus, Package, FileText, RefreshCw,
  Image, Save, Heart, Trash2, Store, Share2,
  HelpCircle, CheckCircle, Library, Eye, Printer, Film
} from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";
import { toast } from "sonner";

const DRAMA_GRADIENT = "from-purple-600 via-fuchsia-500 to-pink-500";

type DramaScript = {
  title: string;
  synopsis: string;
  duration: string;
  characters: Array<{ name: string; description: string; keyLines: number; difficulty: string }>;
  scenes: Array<{
    number: number;
    title: string;
    setting: string;
    directorNotes: string;
    dialogue: Array<{ character: string; line: string; action: string }>;
    audienceInteraction: string;
  }>;
  educationalObjectives: string[];
  props: Array<{ name: string; description: string; cost: string; alternatives: string }>;
  warmUpActivity: string;
  debriefQuestions: string[];
};

type MaskItem = { characterName: string; imageUrl: string; generatedAt: string };
type AssessmentQuestion = { question: string; type: string; options?: string[]; correctAnswer: string; criterion: string };
type SavedScript = {
  id: number;
  lessonTitle: string;
  subject: string;
  grade: string;
  scriptData: any;
  maskUrls: any;
  assessmentQuestions: any;
  isFavorite: boolean;
  isPublished: boolean;
  createdAt: string;
};

export default function DramaEngine() {
  const { user, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";
  
  const [viewMode, setViewMode] = useState<"create" | "library">("create");
  
  const [lessonTitle, setLessonTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [duration, setDuration] = useState(10);
  const [studentCount, setStudentCount] = useState(25);
  
  const [script, setScript] = useState<DramaScript | null>(null);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [showRoles, setShowRoles] = useState(false);
  const [roles, setRoles] = useState<Array<{ studentNumber: number; characterName: string; role: string; tip: string }>>([]);
  
  const [masks, setMasks] = useState<MaskItem[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showMasks, setShowMasks] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [videoTeaser, setVideoTeaser] = useState<{ frames: string[]; description: string; thumbnailUrl?: string } | null>(null);
  const [showVideoTeaser, setShowVideoTeaser] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [currentSavedId, setCurrentSavedId] = useState<number | null>(null);
  
  const libraryQuery = trpc.drama.getLibrary.useQuery(undefined, {
    enabled: viewMode === "library" && !!user,
  });
  
  const generateMutation = trpc.drama.generateScript.useMutation({
    onSuccess: (data) => {
      setScript(data as DramaScript);
      setActiveScene(0);
      setMasks([]);
      setAssessmentQuestions([]);
      setCurrentSavedId(null);
    },
  });
  
  const assignRolesMutation = trpc.drama.assignRoles.useMutation({
    onSuccess: (data) => {
      setRoles(data.assignments);
      setShowRoles(true);
    },
  });
  
  const exportPdfMutation = trpc.drama.exportPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  const generateMasksMutation = trpc.drama.generateMasks.useMutation({
    onSuccess: (data) => {
      setMasks(data.masks);
      setShowMasks(true);
      toast.success(t(`تم توليد ${data.masks.length} قناع جاهز للطباعة`, `Génération de ${data.masks.length} masques prêts à imprimer`, `${data.masks.length} masks generated and ready to print`));
    },
    onError: () => {
      toast.error(t("فشل توليد الأقنعة، حاول مرة أخرى", "La génération des masques a échoué, veuillez réessayer", "Failed to generate masks, please try again"));
    },
  });

  const saveScriptMutation = trpc.drama.saveScript.useMutation({
    onSuccess: (data) => {
      setCurrentSavedId(data.id);
      toast.success(t("تم حفظ المسرحية في مكتبتك الشخصية", "La pièce a été sauvegardée dans votre bibliothèque personnelle", "The play has been saved to your personal library"));
      libraryQuery.refetch();
    },
  });

  const deleteScriptMutation = trpc.drama.deleteScript.useMutation({
    onSuccess: () => {
      toast.success(t("تم حذف المسرحية من المكتبة", "La pièce a été supprimée de la bibliothèque", "The play has been deleted from the library"));
      libraryQuery.refetch();
    },
  });

  const toggleFavoriteMutation = trpc.drama.toggleFavorite.useMutation({
    onSuccess: () => {
      libraryQuery.refetch();
    },
  });

  const generateAssessmentMutation = trpc.drama.generateAssessment.useMutation({
    onSuccess: (data) => {
      setAssessmentQuestions(data.questions);
      setShowAssessment(true);
      toast.success(t(`تم توليد ${data.questions.length} أسئلة تقييمية جاهزة`, `Génération de ${data.questions.length} questions d'évaluation prêtes`, `${data.questions.length} assessment questions generated`));
    },
  });

  const generateVideoTeaserMutation = trpc.videoTeaser.generate.useMutation({
    onSuccess: (data) => {
      setVideoTeaser({ frames: data.frames, description: data.status || t("تم توليد المعاينة", "Aperçu généré", "Preview generated"), thumbnailUrl: data.thumbnailUrl });
      setShowVideoTeaser(true);
      toast.success(t("تم توليد معاينة الفيديو بنجاح!", "L'aperçu vidéo a été généré avec succès!", "Video preview generated successfully!"));
    },
    onError: () => {
      toast.error(t("فشل توليد معاينة الفيديو، حاول مرة أخرى", "Échec de la génération de l'aperçu vidéo, veuillez réessayer", "Failed to generate video preview, please try again"));
    },
  });

  const publishToMarketMutation = trpc.drama.publishToMarket.useMutation({
    onSuccess: () => {
      setShowPublishDialog(false);
      toast.success(t("تم نشر المسرحية في السوق الذهبي", "La pièce a été publiée sur le marché d'or", "The play has been published to the Golden Market"));
      libraryQuery.refetch();
    },
    onError: () => {
      toast.error(t("فشل النشر، حاول مرة أخرى", "Échec de la publication, veuillez réessayer", "Publishing failed, please try again"));
    },
  });

  const subjects = useMemo(() => [
    { value: "إيقاظ علمي", label: t("إيقاظ علمي", "Éveil scientifique", "Scientific Awakening") },
    { value: "رياضيات", label: t("رياضيات", "Mathématiques", "Mathematics") },
    { value: "عربية", label: t("عربية", "Arabe", "Arabic") },
    { value: "فرنسية", label: t("فرنسية", "Français", "French") },
    { value: "إنجليزية", label: t("إنجليزية", "Anglais", "English") },
    { value: "تربية إسلامية", label: t("تربية إسلامية", "Éducation islamique", "Islamic Education") },
    { value: "تاريخ وجغرافيا", label: t("تاريخ وجغرافيا", "Histoire et géographie", "History and Geography") },
    { value: "تربية مدنية", label: t("تربية مدنية", "Éducation civique", "Civic Education") },
    { value: "تربية تشكيلية", label: t("تربية تشكيلية", "Éducation artistique", "Art Education") },
    { value: "تربية موسيقية", label: t("تربية موسيقية", "Éducation musicale", "Music Education") },
    { value: "تربية بدنية", label: t("تربية بدنية", "Éducation physique", "Physical Education") },
  ], [t]);

  const grades = useMemo(() => [
    { value: "السنة الأولى", label: t("السنة الأولى", "Première année", "First Year") },
    { value: "السنة الثانية", label: t("السنة الثانية", "Deuxième année", "Second Year") },
    { value: "السنة الثالثة", label: t("السنة الثالثة", "Troisième année", "Third Year") },
    { value: "السنة الرابعة", label: t("السنة الرابعة", "Quatrième année", "Fourth Year") },
    { value: "السنة الخامسة", label: t("السنة الخامسة", "Cinquième année", "Fifth Year") },
    { value: "السنة السادسة", label: t("السنة السادسة", "Sixième année", "Sixth Year") },
  ], [t]);

  const handleGenerate = () => {
    if (!lessonTitle || !subject || !grade || !lessonContent) return;
    generateMutation.mutate({ lessonTitle, subject, grade, lessonContent, duration, studentCount });
  };

  const handleAssignRoles = () => {
    if (!script) return;
    assignRolesMutation.mutate({ characters: script.characters, studentCount });
  };

  const handleExportPDF = () => {
    if (!script) return;
    exportPdfMutation.mutate({ script, lessonTitle });
  };

  const handleGenerateMasks = () => {
    if (!script) return;
    generateMasksMutation.mutate({
      characters: script.characters.slice(0, 6).map(c => ({ name: c.name, description: c.description })),
      lessonTitle, subject,
    });
  };

  const handleSaveScript = () => {
    if (!script) return;
    saveScriptMutation.mutate({
      lessonTitle, subject, grade, duration, studentCount,
      scriptData: script,
      maskImages: masks.length > 0 ? masks : undefined,
      assessmentQuestions: assessmentQuestions.length > 0 ? assessmentQuestions.map(q => ({ question: q.question, expectedAnswer: q.correctAnswer, criteria: q.criterion })) : undefined,
    });
  };

  const handleGenerateAssessment = () => {
    if (!script) return;
    generateAssessmentMutation.mutate({
      lessonTitle, subject, grade,
      scriptSynopsis: script.synopsis,
      educationalObjectives: script.educationalObjectives,
    });
  };

  const handlePublish = () => {
    if (!script || !publishTitle) return;
    publishToMarketMutation.mutate({
      scriptId: currentSavedId || undefined,
      title: publishTitle,
      description: publishDesc || script.synopsis,
      subject, grade,
      content: script.synopsis,
      scriptData: script,
    });
  };

  const handleLoadFromLibrary = (saved: SavedScript) => {
    setScript(saved.scriptData as DramaScript);
    setLessonTitle(saved.lessonTitle);
    setSubject(saved.subject);
    setGrade(saved.grade);
    setCurrentSavedId(saved.id);
    setMasks(saved.maskUrls ? (saved.maskUrls as MaskItem[]) : []);
    setAssessmentQuestions(saved.assessmentQuestions ? (saved.assessmentQuestions as AssessmentQuestion[]) : []);
    setShowMasks(false);
    setShowAssessment(false);
    setViewMode("create");
    setActiveScene(0);
  };

  const resetAll = () => {
    setScript(null);
    setRoles([]);
    setShowRoles(false);
    setActiveScene(0);
    setMasks([]);
    setAssessmentQuestions([]);
    setShowMasks(false);
    setShowAssessment(false);
    setCurrentSavedId(null);
    setShowPublishDialog(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Theater className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("محرك الدراما التعليمية", "Moteur de Drame Éducatif", "Educational Drama Engine")}</h1>
          <p className="text-gray-600 mb-6">{t("حوّل دروسك إلى مسرحيات تفاعلية ممتعة!", "Transformez vos leçons en pièces de théâtre interactives et amusantes!", "Turn your lessons into fun, interactive plays!")}</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
            {t("تسجيل الدخول", "Se connecter", "Login")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50" dir={isRTL ? "rtl" : "ltr"}>
      <ToolPageHeader
        icon={Theater}
        nameAr="محرك الدراما التعليمية"
        nameFr="Moteur de Drame Éducatif"
        nameEn="Educational Drama Engine"
        descAr="حوّل دروسك إلى مسرحيات شيقة وتفاعلية لزيادة انخراط التلاميذ"
        descFr="Transformez vos leçons en pièces de théâtre captivantes et interactives pour augmenter l'engagement des élèves"
        descEn="Turn your lessons into engaging, interactive plays to boost student engagement"
        gradient={DRAMA_GRADIENT}
      />
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-center my-6">
          <div className="bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-gray-200/80 flex items-center gap-1">
            <button
              onClick={() => setViewMode("create")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "create" ? "bg-white shadow-sm text-purple-700" : "text-gray-600 hover:bg-white/50"}`}>
              {t("إنشاء جديد", "Créer", "Create")}
            </button>
            <button
              onClick={() => setViewMode("library")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "library" ? "bg-white shadow-sm text-purple-700" : "text-gray-600 hover:bg-white/50"}`}>
              {t("المكتبة", "Bibliothèque", "Library")}
            </button>
          </div>
        </div>

        {viewMode === "create" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ===== FORM ===== */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-200/80 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  {t("1. إعدادات المسرحية", "1. Paramètres de la pièce", "1. Play Settings")}
                </h2>
                <button onClick={resetAll} className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {t("البدء من جديد", "Recommencer", "Start Over")}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{tt.lessonTitle}</label>
                  <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder={t("مثال: دورة حياة النبات", "Ex: Le cycle de vie d'une plante", "Ex: The life cycle of a plant")}
                    className="w-full px-4 py-2 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{tt.subject}</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow">
                      <option value="">{t("اختر المادة", "Choisir la matière", "Select Subject")}</option>
                      {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{tt.level}</label>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow">
                      <option value="">{t("اختر المستوى", "Choisir le niveau", "Select Level")}</option>
                      {grades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{t("محتوى الدرس أو ملخصه", "Contenu ou résumé de la leçon", "Lesson Content or Summary")}</label>
                  <textarea value={lessonContent} onChange={e => setLessonContent(e.target.value)} rows={6}
                    placeholder={t("أدخل هنا المفاهيم الأساسية للدرس، الشخصيات المقترحة، أو أي تفاصيل تريدها في المسرحية...", "Entrez ici les concepts clés de la leçon, les personnages suggérés, ou tout autre détail que vous souhaitez voir dans la pièce...", "Enter the key concepts of the lesson, suggested characters, or any other details you want in the play...")}
                    className="w-full px-4 py-2 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{t("مدة المسرحية (دقائق)", "Durée de la pièce (minutes)", "Play Duration (minutes)")}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="5" max="30" step="5" value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                      <span className="font-mono text-purple-800 bg-purple-100 rounded-md px-2 py-1 text-sm w-16 text-center">{duration} {t("د", "min", "min")}</span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{t("عدد التلاميذ", "Nombre d'élèves", "Number of Students")}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="10" max="40" step="1" value={studentCount} onChange={e => setStudentCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                      <span className="font-mono text-pink-800 bg-pink-100 rounded-md px-2 py-1 text-sm w-16 text-center">{studentCount} {t("تلميذ", "élèves", "students")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button onClick={handleGenerate} disabled={generateMutation.isPending || !lessonTitle || !subject || !grade || !lessonContent}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-transform hover:scale-105 font-bold disabled:bg-gray-400 disabled:hover:scale-100">
                    {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {generateMutation.isPending ? t("جاري كتابة المسرحية...", "Écriture de la pièce en cours...", "Writing the play...") : t("حوّل إلى مسرحية الآن!", "Transformer en pièce maintenant!", "Turn into a play now!")}
                  </button>
                </div>
              </div>
            </div>

            {/* ===== RESULT ===== */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-200/80 rounded-2xl p-6 shadow-lg shadow-pink-500/5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-5">
                <Theater className="w-5 h-5 text-pink-600" />
                {t("2. نتيجة المسرحية", "2. Résultat de la pièce", "2. Play Result")}
              </h2>

              {!script ? (
                <div className="text-center py-12 px-6 bg-purple-50/50 rounded-2xl border-2 border-dashed border-purple-200">
                  <Theater className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-800">{t("في انتظار إبداعك", "En attente de votre création", "Waiting for your creation")}</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs mx-auto">{t("املأ الحقول على اليمين وسيقوم الذكاء الاصطناعي بتحويل درسك إلى مسرحية تعليمية متكاملة.", "Remplissez les champs à droite et l'IA transformera votre leçon en une pièce éducative complète.", "Fill in the fields on the right and the AI will turn your lesson into a complete educational play.")}</p>
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      {t("ماذا ستحصل عليه؟", "Qu'obtiendrez-vous?", "What will you get?")}
                    </h3>
                    <ul className={`space-y-2 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <li className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-purple-500" /> {t("نص مسرحي كامل بالعربية", "Script de pièce complet en arabe", "Full play script in Arabic")}</li>
                      <li className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-blue-500" /> {t("شخصيات مع توزيع تلقائي للأدوار", "Personnages avec distribution automatique des rôles", "Characters with automatic role assignment")}</li>
                      <li className="flex items-center gap-2"><Image className="w-3.5 h-3.5 text-pink-500" /> {t("أقنعة Line Art للطباعة", "Masques Line Art à imprimer", "Line Art masks for printing")}</li>
                      <li className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-green-500" /> {t("قائمة وسائل منخفضة التكلفة", "Liste de matériel à faible coût", "Low-cost props list")}</li>
                      <li className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-amber-500" /> {t("أسئلة تقييم تكويني", "Questions d'évaluation formative", "Formative assessment questions")}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Script Header */}
                  <div className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Theater className="w-6 h-6" />
                          <span className="text-sm opacity-80">{t("مسرحية تعليمية", "Pièce éducative", "Educational Play")}</span>
                          {currentSavedId && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t("محفوظة", "Sauvegardée", "Saved")}</span>}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{script.title}</h2>
                        <p className="text-sm opacity-90 leading-relaxed max-w-2xl">{script.synopsis}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4" />
                          {script.duration}
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                          <Users className="w-4 h-4" />
                          {script.characters.length} {t("شخصية", "personnages", "characters")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <button onClick={handleGenerateMasks} disabled={generateMasksMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                        {generateMasksMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                        {t("توليد أقنعة", "Générer des masques", "Generate Masks")}
                      </button>
                      <button onClick={handleGenerateAssessment} disabled={generateAssessmentMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                        {generateAssessmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                        {t("أسئلة تقييمية", "Questions d'évaluation", "Assessment Questions")}
                      </button>
                      <button onClick={handleAssignRoles} disabled={assignRolesMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                        {assignRolesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        {t("وزّع الأدوار", "Distribuer les rôles", "Assign Roles")}
                      </button>
                      <button
                        onClick={() => {
                          if (!script) return;
                          generateVideoTeaserMutation.mutate({
                            scriptTitle: script.title,
                            synopsis: script.synopsis,
                            characters: script.characters.map(c => ({ name: c.name, description: c.description || "" })),
                            scenes: script.scenes.slice(0, 3).map(s => ({ title: s.title, setting: s.setting })),
                          });
                        }}
                        disabled={generateVideoTeaserMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 border border-purple-300/30"
                      >
                        {generateVideoTeaserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                        {generateVideoTeaserMutation.isPending ? t("جاري التوليد...", "Génération en cours...", "Generating...") : t("معاينة فيديو AI", "Aperçu vidéo IA", "AI Video Preview")}
                      </button>
                    </div>
                  </div>

                  {showVideoTeaser && videoTeaser && (
                    <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Film className="w-5 h-5 text-purple-600" />
                          {t("معاينة فيديو AI (30 ثانية)", "Aperçu vidéo IA (30s)", "AI Video Preview (30s)")}
                        </h3>
                        <button onClick={() => setShowVideoTeaser(false)} className="text-gray-400 hover:text-gray-600 text-sm">{t("إخفاء", "Cacher", "Hide")}</button>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 bg-purple-50 rounded-lg p-3 border border-purple-100">
                        {videoTeaser.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {videoTeaser.frames.map((frame, idx) => (
                          <div key={idx} className="relative group">
                            <img src={frame} alt={`${t("مشهد", "Scène", "Scene")} ${idx + 1}`} className="w-full rounded-xl border border-purple-100 shadow-sm" />
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                              {t("مشهد", "Scène", "Scene")} {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      {videoTeaser.frames.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">{t("لم يتم توليد إطارات. حاول مرة أخرى.", "Aucun cadre n'a été généré. Veuillez réessayer.", "No frames were generated. Please try again.")}</p>
                      )}
                    </div>
                  )}

                  {showMasks && masks.length > 0 && (
                    <div className="bg-white rounded-2xl border border-pink-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Image className="w-5 h-5 text-pink-600" />
                          {t("أقنعة الشخصيات (Line Art)", "Masques des personnages (Line Art)", "Character Masks (Line Art)")}
                        </h3>
                        <button onClick={() => setShowMasks(false)} className="text-gray-400 hover:text-gray-600 text-sm">{t("إخفاء", "Cacher", "Hide")}</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {masks.map((mask, idx) => (
                          <div key={idx} className="text-center">
                            {mask.imageUrl ? (
                              <div className="relative group">
                                <img src={mask.imageUrl} alt={mask.characterName} className="w-full rounded-xl border border-gray-200 bg-white" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                  <a href={mask.imageUrl} target="_blank" rel="noopener noreferrer"
                                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                                    <Download className="w-4 h-4" />
                                  </a>
                                  <button onClick={() => window.print()}
                                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                                    <Printer className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                <span className="text-xs">{t("فشل التوليد", "Échec de la génération", "Generation Failed")}</span>
                              </div>
                            )}
                            <p className="text-sm font-medium text-gray-700 mt-2">{mask.characterName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAssessment && assessmentQuestions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-green-600" />
                          {t("أسئلة التقييم التكويني (بعد العرض)", "Questions d'évaluation formative (post-présentation)", "Formative Assessment Questions (Post-Show)")}
                        </h3>
                        <button onClick={() => setShowAssessment(false)} className="text-gray-400 hover:text-gray-600 text-sm">{t("إخفاء", "Cacher", "Hide")}</button>
                      </div>
                      <div className="space-y-4">
                        {assessmentQuestions.map((q: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                            <div className="flex items-start gap-3">
                              <span className="w-7 h-7 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</span>
                              <div className="flex-1">
                                <p className={`font-medium text-gray-900 text-sm mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{q.question}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{q.type === "mcq" ? t("اختيار متعدد", "Choix multiple", "Multiple Choice") : q.type === "open" ? t("سؤال مفتوح", "Question ouverte", "Open Question") : t("صح/خطأ", "Vrai/Faux", "True/False")}</span>
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{q.criterion}</span>
                                </div>
                                {q.options && q.options.length > 0 && (
                                  <div className={`mt-2 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {q.options.map((opt: string, oi: number) => (
                                      <div key={oi} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${opt === q.correctAnswer ? "bg-green-100 text-green-800 font-medium" : "bg-gray-50 text-gray-600"}`}>
                                        {opt === q.correctAnswer ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" />}
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!q.options && (
                                  <p className={`mt-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <strong>{t("الإجابة المتوقعة:", "Réponse attendue:", "Expected Answer:")}</strong> {q.correctAnswer}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showRoles && roles.length > 0 && (
                    <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          {t("توزيع الأدوار", "Distribution des rôles", "Role Assignment")}
                        </h3>
                        <button onClick={() => setShowRoles(false)} className="text-gray-400 hover:text-gray-600 text-sm">{t("إخفاء", "Cacher", "Hide")}</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roles.map((role, idx) => (
                          <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-blue-800">{t("تلميذ", "Élève", "Student")} {role.studentNumber}</p>
                              <p className="text-sm font-medium text-gray-700">{role.characterName}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{role.tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3">
                    <button onClick={handleSaveScript} disabled={saveScriptMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-50">
                      {saveScriptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentSavedId ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />)}
                      {currentSavedId ? t("تم الحفظ", "Enregistré", "Saved") : t("حفظ في المكتبة", "Sauvegarder", "Save to Library")}
                    </button>
                    <button onClick={handleExportPDF} disabled={exportPdfMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-50">
                      {exportPdfMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {t("تصدير PDF", "Exporter en PDF", "Export as PDF")}
                    </button>
                    {currentSavedId && (
                      <button onClick={() => setShowPublishDialog(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 border border-amber-500 hover:bg-amber-500 rounded-xl text-sm font-medium text-white transition-colors">
                        <Store className="w-4 h-4" />
                        {t("نشر في السوق", "Publier sur le marché", "Publish to Market")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        {t("نص المسرحية", "Script de la pièce", "Play Script")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setActiveScene(Math.max(0, activeScene - 1))} disabled={activeScene === 0} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 font-medium">{t("مشهد", "Scène", "Scene")} {activeScene + 1} / {script.scenes.length}</span>
                        <button onClick={() => setActiveScene(Math.min(script.scenes.length - 1, activeScene + 1))} disabled={activeScene === script.scenes.length - 1} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <h4 className="font-bold text-purple-800 mb-1">{script.scenes[activeScene].title}</h4>
                        <p className="text-sm text-purple-700">{script.scenes[activeScene].setting}</p>
                      </div>
                      <div className="space-y-3">
                        {script.scenes[activeScene].dialogue.map((line, idx) => (
                          <div key={idx} className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm shrink-0">{line.character.substring(0, 2)}</div>
                            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <p className="font-bold text-gray-800">{line.character}</p>
                              <p className="text-gray-700">{line.line}</p>
                              {line.action && <p className="text-xs text-pink-600 italic">({line.action})</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== LIBRARY VIEW ===== */
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200/80 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Library className="w-5 h-5 text-purple-600" />
              {t("مكتبة المسرحيات المحفوظة", "Bibliothèque de pièces sauvegardées", "Saved Plays Library")}
            </h2>
            {libraryQuery.isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              </div>
            ) : libraryQuery.data && libraryQuery.data.length > 0 ? (
              <div className="space-y-3">
                {libraryQuery.data.map((item: SavedScript) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{item.lessonTitle}</p>
                        {item.isPublished && <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">{t("منشور", "Publié", "Published")}</span>}
                      </div>
                      <p className="text-sm text-gray-500">{item.subject} • {item.grade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavoriteMutation.mutate({ id: item.id, isFavorite: !item.isFavorite })}>
                        <Heart className={`w-5 h-5 transition-colors ${item.isFavorite ? 'text-pink-500 fill-current' : 'text-gray-400 hover:text-pink-400'}`} />
                      </button>
                      <button onClick={() => handleLoadFromLibrary(item)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
                        <Eye className="w-4 h-4" />
                        {t("عرض", "Afficher", "View")}
                      </button>
                      <button onClick={() => deleteScriptMutation.mutate({ id: item.id })} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-purple-50/50 rounded-2xl border-2 border-dashed border-purple-200">
                <Library className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-800">{t("مكتبتك فارغة", "Votre bibliothèque est vide", "Your library is empty")}</h3>
                <p className="text-sm text-gray-500 mt-2">{t("عندما تحفظ مسرحية، ستظهر هنا.", "Lorsque vous sauvegardez une pièce, elle apparaîtra ici.", "When you save a play, it will appear here.")}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
            <h3 className="text-lg font-bold mb-4">{t("نشر في السوق الذهبي", "Publier sur le marché d'or", "Publish to the Golden Market")}</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t("عنوان المنشور", "Titre de la publication", "Post Title")}</label>
                <input type="text" value={publishTitle} onChange={e => setPublishTitle(e.target.value)} placeholder={t("مسرحية ممتعة حول...", "Une pièce amusante sur...", "A fun play about...")} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-300" />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t("وصف قصير (اختياري)", "Description courte (optionnel)", "Short Description (optional)")}</label>
                <textarea value={publishDesc} onChange={e => setPublishDesc(e.target.value)} rows={3} placeholder={t("اشرح ما يميز هذه المسرحية...", "Expliquez ce qui rend cette pièce spéciale...", "Explain what makes this play special...")} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-300"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPublishDialog(false)} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">{t("إلغاء", "Annuler", "Cancel")}</button>
              <button onClick={handlePublish} disabled={publishToMarketMutation.isPending} className="px-4 py-2 rounded-lg text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300">
                {publishToMarketMutation.isPending ? t("جاري النشر...", "Publication en cours...", "Publishing...") : t("تأكيد النشر", "Confirmer la publication", "Confirm Publication")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
