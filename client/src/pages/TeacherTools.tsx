import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import {
  Bot, Search, FileEdit, Palette, BarChart3,
  FileCheck, Theater, Brain, Film, ScanLine,
  Calendar, BookOpen, Sparkles, ArrowLeft,
  Zap, ClipboardCheck, Lightbulb, type LucideIcon,
  Play, CheckCircle2, Clock, Users, Star,
  FileText, Image as ImageIcon, Mic, PenTool, HeartHandshake,
} from "lucide-react";

/* ───────── Tool definition ───────── */
interface ToolDef {
  id: string;
  href: string;
  icon: LucideIcon;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  isNew?: boolean;
  gradient: string;
  iconBg: string;
  /* Preview data */
  previewAr: string[];
  previewFr: string[];
  previewEn: string[];
  previewIcon: LucideIcon;
  demoSteps: number;
}

/* ───────── Category definition ───────── */
interface CategoryDef {
  id: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleFr: string;
  subtitleEn: string;
  icon: LucideIcon;
  accentColor: string;
  headerGradient: string;
  tools: ToolDef[];
}

/* ───────── Data ───────── */
const CATEGORIES: CategoryDef[] = [
  {
    id: "preparation",
    titleAr: "أدوات التحضير",
    titleFr: "Outils de préparation",
    titleEn: "Preparation Tools",
    subtitleAr: "جهّز دروسك ومخططاتك بذكاء اصطناعي متقدم",
    subtitleFr: "Préparez vos cours et plannings avec une IA avancée",
    subtitleEn: "Prepare your lessons and plans with advanced AI",
    icon: Zap,
    accentColor: "#1565C0",
    headerGradient: "linear-gradient(135deg, #1A237E 0%, #1565C0 50%, #42A5F5 100%)",
    tools: [
      {
        id: "edugpt",
        href: "/assistant",
        icon: Bot,
        nameAr: "EDUGPT — المساعد البيداغوجي",
        nameFr: "EDUGPT — Assistant pédagogique",
        nameEn: "EDUGPT — Pedagogical Assistant",
        descAr: "مساعدك الذكي لإعداد الجذاذات والمخططات والدروس تلقائياً بالذكاء الاصطناعي",
        descFr: "Votre assistant IA pour préparer fiches, plannings et cours automatiquement",
        descEn: "Your AI assistant for preparing lesson plans, schedules and courses automatically",
        gradient: "linear-gradient(135deg, #1A237E, #1565C0)",
        iconBg: "#E3F2FD",
        previewAr: ["إعداد جذاذة درس كاملة", "توليد مخطط أسبوعي", "إنشاء أنشطة تفاعلية", "تصدير PDF / Word"],
        previewFr: ["Préparer une fiche complète", "Générer un planning hebdo", "Créer des activités", "Export PDF / Word"],
        previewEn: ["Prepare a full lesson plan", "Generate weekly schedule", "Create activities", "Export PDF / Word"],
        previewIcon: FileText,
        demoSteps: 4,
      },
      {
        id: "annual-plan",
        href: "/annual-plan",
        icon: Calendar,
        nameAr: "التوزيع السنوي الذكي",
        nameFr: "Planification annuelle IA",
        nameEn: "AI Annual Planning",
        descAr: "توليد المخطط السنوي الكامل لأي مادة ومستوى حسب البرامج الرسمية التونسية",
        descFr: "Générer le planning annuel complet selon les programmes officiels tunisiens",
        descEn: "Generate complete annual plan per official Tunisian curriculum",
        gradient: "linear-gradient(135deg, #0D47A1, #1976D2)",
        iconBg: "#BBDEFB",
        previewAr: ["اختر المادة والمستوى", "توليد تلقائي للتوزيع", "تعديل حسب الحاجة", "طباعة جاهزة"],
        previewFr: ["Choisir matière et niveau", "Génération automatique", "Modifier selon besoins", "Prêt à imprimer"],
        previewEn: ["Choose subject & level", "Auto-generate plan", "Customize as needed", "Print-ready"],
        previewIcon: Calendar,
        demoSteps: 4,
      },
      {
        id: "curriculum-map",
        href: "/curriculum-map",
        icon: BarChart3,
        nameAr: "Curriculum GPS — خريطة المنهج",
        nameFr: "Curriculum GPS — Carte du programme",
        nameEn: "Curriculum GPS — Curriculum Map",
        descAr: "تتبع تقدمك في تغطية المنهج الدراسي بذكاء مع تنبيهات التأخر والتقدم",
        descFr: "Suivez votre progression dans le programme avec alertes de retard/avance",
        descEn: "Track your curriculum coverage progress with delay/advance alerts",
        gradient: "linear-gradient(135deg, #1565C0, #42A5F5)",
        iconBg: "#E1F5FE",
        previewAr: ["تتبع التقدم بالنسبة المئوية", "تنبيهات التأخر والتقدم", "مقارنة مع الزملاء", "تقارير مفصّلة"],
        previewFr: ["Suivi en pourcentage", "Alertes retard/avance", "Comparer avec collègues", "Rapports détaillés"],
        previewEn: ["Track % progress", "Delay/advance alerts", "Compare with peers", "Detailed reports"],
        previewIcon: BarChart3,
        demoSteps: 4,
      },
    ],
  },
  {
    id: "evaluation",
    titleAr: "أدوات التقييم",
    titleFr: "Outils d'évaluation",
    titleEn: "Evaluation Tools",
    subtitleAr: "قيّم وصحّح وحلّل بدقة المعايير التونسية الرسمية",
    subtitleFr: "Évaluez, corrigez et analysez selon les critères officiels tunisiens",
    subtitleEn: "Evaluate, grade and analyze per official Tunisian standards",
    icon: ClipboardCheck,
    accentColor: "#6A1B9A",
    headerGradient: "linear-gradient(135deg, #4A148C 0%, #6A1B9A 50%, #AB47BC 100%)",
    tools: [
      {
        id: "inspector",
        href: "/inspector",
        icon: Search,
        nameAr: "المتفقد الذكي",
        nameFr: "Inspecteur IA",
        nameEn: "AI Inspector",
        descAr: "تحليل وتقييم الجذاذات والاختبارات والمخططات وفق المعايير الرسمية التونسية",
        descFr: "Analyser fiches, examens et plannings selon les normes officielles tunisiennes",
        descEn: "Analyze lesson plans, exams and schedules per official Tunisian standards",
        gradient: "linear-gradient(135deg, #4A148C, #7B1FA2)",
        iconBg: "#F3E5F5",
        previewAr: ["رفع الجذاذة أو الاختبار", "تحليل وفق 4 أنواع وثائق", "تقرير مفصّل بالمعايير", "اقتراحات التحسين"],
        previewFr: ["Téléverser fiche/examen", "Analyse selon 4 types", "Rapport détaillé", "Suggestions d'amélioration"],
        previewEn: ["Upload lesson/exam", "Analyze 4 doc types", "Detailed criteria report", "Improvement suggestions"],
        previewIcon: Search,
        demoSteps: 4,
      },
      {
        id: "blind-grading",
        href: "/blind-grading",
        icon: FileCheck,
        nameAr: "مساعد التصحيح الذكي",
        nameFr: "Correction intelligente IA",
        nameEn: "Smart Grading Assistant",
        descAr: "تصحيح ذكي لأوراق التلاميذ بالذكاء الاصطناعي حسب المعايير التونسية (مع1، مع2، مع3)",
        descFr: "Correction intelligente des copies avec IA selon les critères tunisiens (M1, M2, M3)",
        descEn: "AI-powered student paper grading with Tunisian criteria (M1, M2, M3)",
        isNew: true,
        gradient: "linear-gradient(135deg, #6A1B9A, #AB47BC)",
        iconBg: "#E1BEE7",
        previewAr: ["تصوير ورقة التلميذ", "تحليل ذكي بالمعايير مع1-مع3", "إسناد الأعداد تلقائياً", "تقرير فردي لكل تلميذ"],
        previewFr: ["Photographier la copie", "Analyse IA critères M1-M3", "Notes automatiques", "Rapport par élève"],
        previewEn: ["Photograph student paper", "AI analysis M1-M3", "Auto-grading", "Per-student report"],
        previewIcon: FileCheck,
        demoSteps: 4,
      },
      {
        id: "exam-builder",
        href: "/exam-builder",
        icon: FileEdit,
        nameAr: "بناء الاختبارات الذكي",
        nameFr: "Créateur d'examens IA",
        nameEn: "AI Exam Builder",
        descAr: "توليد اختبارات كاملة مع الرسومات وجدول التقييم الرسمي (---/+++ system)",
        descFr: "Générer des examens complets avec illustrations et barème officiel",
        descEn: "Generate complete exams with illustrations and official grading table",
        gradient: "linear-gradient(135deg, #7B1FA2, #CE93D8)",
        iconBg: "#F8BBD0",
        previewAr: ["اختر المادة والمستوى", "توليد سند وتعليمات", "إضافة رسومات تلقائية", "جدول إسناد الأعداد"],
        previewFr: ["Choisir matière/niveau", "Générer contexte & questions", "Illustrations auto", "Barème officiel"],
        previewEn: ["Choose subject/level", "Generate context & questions", "Auto illustrations", "Official grading table"],
        previewIcon: FileEdit,
        demoSteps: 4,
      },
    ],
  },
  {
    id: "creativity",
    titleAr: "أدوات الإبداع",
    titleFr: "Outils créatifs",
    titleEn: "Creative Tools",
    subtitleAr: "حوّل دروسك إلى تجارب تعليمية مبتكرة وجذابة",
    subtitleFr: "Transformez vos cours en expériences éducatives innovantes et captivantes",
    subtitleEn: "Transform your lessons into innovative and engaging learning experiences",
    icon: Lightbulb,
    accentColor: "#E65100",
    headerGradient: "linear-gradient(135deg, #BF360C 0%, #E65100 50%, #FF9800 100%)",
    tools: [
      {
        id: "visual-studio",
        href: "/visual-studio",
        icon: Palette,
        nameAr: "Leader Visual Studio",
        nameFr: "Leader Visual Studio",
        nameEn: "Leader Visual Studio",
        descAr: "توليد صور تعليمية وإنفوغرافيك وبطاقات تعلم بـ 6 أنماط مختلفة بالذكاء الاصطناعي",
        descFr: "Générer images éducatives, infographies et cartes d'apprentissage en 6 styles IA",
        descEn: "Generate educational images, infographics and learning cards in 6 AI styles",
        gradient: "linear-gradient(135deg, #E65100, #FF9800)",
        iconBg: "#FFF3E0",
        previewAr: ["اختر نمط الصورة (6 أنماط)", "اكتب الوصف بالعربية", "توليد بالذكاء الاصطناعي", "تحميل بجودة عالية"],
        previewFr: ["Choisir le style (6 styles)", "Décrire en texte", "Génération IA", "Télécharger en HD"],
        previewEn: ["Choose style (6 styles)", "Describe in text", "AI generation", "Download in HD"],
        previewIcon: ImageIcon,
        demoSteps: 4,
      },
      {
        id: "drama-engine",
        href: "/drama-engine",
        icon: Theater,
        nameAr: "محرك الدراما التعليمية",
        nameFr: "Moteur de théâtre éducatif",
        nameEn: "Educational Drama Engine",
        descAr: "حوّل أي درس إلى مسرحية تفاعلية مع توزيع الأدوار والحوارات والوسائل المسرحية",
        descFr: "Transformez toute leçon en pièce de théâtre interactive avec rôles et dialogues",
        descEn: "Transform any lesson into an interactive play with roles, dialogues and props",
        isNew: true,
        gradient: "linear-gradient(135deg, #BF360C, #FF6D00)",
        iconBg: "#FFE0B2",
        previewAr: ["أدخل موضوع الدرس", "توزيع الأدوار تلقائياً", "حوارات تعليمية مشوّقة", "وسائل مسرحية مقترحة"],
        previewFr: ["Entrer le sujet du cours", "Distribution des rôles", "Dialogues éducatifs", "Accessoires suggérés"],
        previewEn: ["Enter lesson topic", "Auto role assignment", "Educational dialogues", "Suggested props"],
        previewIcon: Theater,
        demoSteps: 4,
      },
      {
        id: "video-evaluator",
        href: "/video-evaluator",
        icon: Film,
        nameAr: "مُقيِّم المعلم الرقمي",
        nameFr: "Évaluateur vidéo IA",
        nameEn: "AI Video Evaluator",
        descAr: "تقييم الفيديوهات التعليمية وتحسين مهارات هندسة الأوامر (Prompt Engineering)",
        descFr: "Évaluer les vidéos éducatives et améliorer le Prompt Engineering",
        descEn: "Evaluate educational videos and improve Prompt Engineering skills",
        gradient: "linear-gradient(135deg, #FF6D00, #FFB74D)",
        iconBg: "#FFECB3",
        previewAr: ["رفع الفيديو التعليمي", "تحليل جودة المحتوى", "تقييم الأداء البيداغوجي", "نصائح لتحسين الأوامر"],
        previewFr: ["Téléverser la vidéo", "Analyse de qualité", "Évaluation pédagogique", "Conseils d'amélioration"],
        previewEn: ["Upload video", "Quality analysis", "Pedagogical evaluation", "Improvement tips"],
        previewIcon: Film,
        demoSteps: 4,
      },
    ],
  },
];

/* ───────── Bonus tools (not in main categories) ───────── */
const BONUS_TOOLS: ToolDef[] = [
  {
    id: "learning-support",
    href: "/learning-support",
    icon: HeartHandshake,
    nameAr: "أدوات ذوي صعوبات التعلم",
    nameFr: "Outils troubles d'apprentissage",
    nameEn: "Learning Difficulties Tools",
    descAr: "أدوات ذكاء اصطناعي متخصصة لمرافقة التلاميذ ذوي صعوبات واضطرابات التعلم",
    descFr: "Outils IA spécialisés pour accompagner les élèves en difficulté d'apprentissage",
    descEn: "Specialized AI tools to support students with learning difficulties",
    gradient: "linear-gradient(135deg, #00695C, #26A69A)",
    iconBg: "#E0F2F1",
    previewAr: ["محلل خط اليد الذكي", "المرافق البيداغوجي", "مكيّف المحتوى", "مولّد التمارين العلاجية"],
    previewFr: ["Analyseur d'écriture", "Accompagnateur pédagogique", "Adaptateur de contenu", "Générateur d'exercices"],
    previewEn: ["Handwriting Analyzer", "Pedagogical Companion", "Content Adapter", "Exercise Generator"],
    previewIcon: HeartHandshake,
    demoSteps: 4,
  },
  {
    id: "legacy-digitizer",
    href: "/legacy-digitizer",
    icon: ScanLine,
    nameAr: "Legacy Digitizer — رقمنة الوثائق",
    nameFr: "Legacy Digitizer — Numérisation",
    nameEn: "Legacy Digitizer — Document Digitization",
    descAr: "مسح ورقمنة الوثائق التعليمية القديمة وتحويلها إلى صيغ رقمية قابلة للتعديل",
    descFr: "Numériser les anciens documents pédagogiques et les convertir en formats modifiables",
    descEn: "Scan and digitize old educational documents into editable formats",
    gradient: "linear-gradient(135deg, #004D40, #00897B)",
    iconBg: "#B2DFDB",
    previewAr: ["مسح الوثيقة الورقية", "التعرف الذكي على النص", "تحويل إلى Word/PDF", "تعديل وإعادة استخدام"],
    previewFr: ["Scanner le document", "Reconnaissance OCR", "Convertir en Word/PDF", "Modifier et réutiliser"],
    previewEn: ["Scan document", "OCR recognition", "Convert to Word/PDF", "Edit and reuse"],
    previewIcon: ScanLine,
    demoSteps: 4,
  },
];

/* ───────── Helper ───────── */
function getName(tool: ToolDef, lang: AppLanguage) {
  return lang === "fr" ? tool.nameFr : lang === "en" ? tool.nameEn : tool.nameAr;
}
function getDesc(tool: ToolDef, lang: AppLanguage) {
  return lang === "fr" ? tool.descFr : lang === "en" ? tool.descEn : tool.descAr;
}
function getPreview(tool: ToolDef, lang: AppLanguage) {
  return lang === "fr" ? tool.previewFr : lang === "en" ? tool.previewEn : tool.previewAr;
}
function getCatTitle(cat: CategoryDef, lang: AppLanguage) {
  return lang === "fr" ? cat.titleFr : lang === "en" ? cat.titleEn : cat.titleAr;
}
function getCatSubtitle(cat: CategoryDef, lang: AppLanguage) {
  return lang === "fr" ? cat.subtitleFr : lang === "en" ? cat.subtitleEn : cat.subtitleAr;
}

function getIconColor(gradient: string): string {
  if (gradient.includes("#1A237E")) return "#1A237E";
  if (gradient.includes("#4A148C")) return "#6A1B9A";
  if (gradient.includes("#E65100")) return "#E65100";
  if (gradient.includes("#BF360C")) return "#BF360C";
  if (gradient.includes("#FF6D00")) return "#FF6D00";
  if (gradient.includes("#0D47A1")) return "#0D47A1";
  if (gradient.includes("#00695C")) return "#00695C";
  if (gradient.includes("#004D40")) return "#004D40";
  if (gradient.includes("#7B1FA2")) return "#7B1FA2";
  if (gradient.includes("#6A1B9A")) return "#6A1B9A";
  return "#1565C0";
}

function getAccentColor(gradient: string): string {
  if (gradient.includes("#1A237E") || gradient.includes("#0D47A1") || gradient.includes("#1565C0")) return "#1565C0";
  if (gradient.includes("#4A148C") || gradient.includes("#6A1B9A") || gradient.includes("#7B1FA2")) return "#7B1FA2";
  if (gradient.includes("#E65100") || gradient.includes("#BF360C") || gradient.includes("#FF6D00")) return "#E65100";
  if (gradient.includes("#00695C") || gradient.includes("#004D40")) return "#00897B";
  return "#1565C0";
}

/* ───────── Tool Card Component with Hover Preview ───────── */
function ToolCard({ tool, lang }: { tool: ToolDef; lang: AppLanguage }) {
  const [isHovered, setIsHovered] = useState(false);
  const previewSteps = getPreview(tool, lang);
  const accentColor = getAccentColor(tool.gradient);
  const iconColor = getIconColor(tool.gradient);
  const PreviewIcon = tool.previewIcon;

  return (
    <Link href={tool.href}>
      <div
        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-500 overflow-hidden cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top gradient accent bar */}
        <div className="h-1.5 w-full transition-all duration-500"
          style={{
            background: tool.gradient,
            height: isHovered ? "4px" : "6px",
          }}
        />

        {/* New badge */}
        {tool.isNew && (
          <div className="absolute top-4 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-lg animate-pulse"
              style={{ background: "linear-gradient(135deg, #FF6D00, #FF9800)" }}>
              <Sparkles className="w-3 h-3" />
              {lang === "fr" ? "Nouveau" : lang === "en" ? "New" : "جديد"}
            </span>
          </div>
        )}

        {/* Normal content */}
        <div className={`p-5 flex flex-col transition-all duration-500 ${isHovered ? "opacity-0 scale-95 absolute inset-0 pointer-events-none" : "opacity-100 scale-100"}`}
          style={{ minHeight: "240px" }}
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm"
            style={{ background: tool.iconBg }}>
            <tool.icon className="w-7 h-7" style={{ color: iconColor }} />
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
            {getName(tool, lang)}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            {getDesc(tool, lang)}
          </p>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: accentColor }}>
            <span>{lang === "fr" ? "Ouvrir l'outil" : lang === "en" ? "Open tool" : "افتح الأداة"}</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover Preview Overlay */}
        <div className={`absolute inset-0 top-[4px] flex flex-col transition-all duration-500 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
          style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)` }}
        >
          <div className="p-5 flex flex-col h-full">
            {/* Preview header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: tool.gradient }}>
                <PreviewIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                  {lang === "fr" ? "Aperçu rapide" : lang === "en" ? "Quick Preview" : "معاينة سريعة"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {lang === "fr" ? "Comment ça marche" : lang === "en" ? "How it works" : "كيف تعمل الأداة"}
                </p>
              </div>
            </div>

            {/* Animated steps */}
            <div className="flex-1 space-y-2.5">
              {previewSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 transition-all duration-500"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateX(0)" : "translateX(20px)",
                    transitionDelay: `${idx * 120}ms`,
                  }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                    style={{ background: tool.gradient }}>
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{step}</p>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span className="text-xs font-bold" style={{ color: accentColor }}>
                  {lang === "fr" ? "Essayer maintenant" : lang === "en" ? "Try now" : "جرّب الآن"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
                style={{ background: tool.gradient }}>
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ───────── Main Page ───────── */
function TeacherTools() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language;

  const t = (ar: string, fr: string, en: string) =>
    lang === "fr" ? fr : lang === "en" ? en : ar;

  const totalTools = CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0) + BONUS_TOOLS.length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #0D47A1 40%, #1565C0 70%, #42A5F5 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-orange-300/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="mb-6">
            <BackButton to="/" label={t("الرئيسية", "Accueil", "Home")} />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-orange-300" />
              <span className="text-white/90 text-sm font-medium">
                {t(`${totalTools} أداة ذكاء اصطناعي تربوي`, `${totalTools} outils IA éducatifs`, `${totalTools} Educational AI Tools`)}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {t("ترسانة أدوات EDUGPT", "Arsenal d'outils EDUGPT", "EDUGPT Tools Arsenal")}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
              {t(
                "كل ما يحتاجه المعلم التونسي من أدوات ذكاء اصطناعي — من التحضير إلى التقييم إلى الإبداع",
                "Tout ce dont l'enseignant tunisien a besoin en outils IA — de la préparation à l'évaluation à la créativité",
                "Everything a Tunisian teacher needs in AI tools — from preparation to evaluation to creativity"
              )}
            </p>
            <p className="text-sm text-blue-200/70 mt-3">
              {t("مرّر فوق أي بطاقة لمعاينة كيفية عمل الأداة", "Survolez une carte pour voir comment l'outil fonctionne", "Hover over any card to preview how the tool works")}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <a key={cat.id} href={`#${cat.id}`} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                  <CatIcon className="w-5 h-5 text-orange-300 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-white font-bold text-sm">{getCatTitle(cat, lang)}</p>
                    <p className="text-blue-200 text-xs">{cat.tools.length} {t("أدوات", "outils", "tools")}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <section key={cat.id} id={cat.id}>
              {/* Category header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: cat.headerGradient }}>
                  <CatIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{getCatTitle(cat, lang)}</h2>
                  <p className="text-sm text-gray-500">{getCatSubtitle(cat, lang)}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent" style={{ backgroundImage: `linear-gradient(to left, transparent, ${cat.accentColor}20)` }} />
              </div>

              {/* Tool cards grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} lang={lang} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Bonus tools section */}
        {BONUS_TOOLS.length > 0 && (
          <section id="bonus">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #004D40, #00897B)" }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {t("أدوات متخصصة", "Outils spécialisés", "Specialized Tools")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("أدوات إضافية لتحليل وتطوير المهارات", "Outils supplémentaires pour l'analyse et le développement", "Additional tools for analysis and development")}
                </p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-teal-100" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BONUS_TOOLS.map((tool) => (
                <ToolCard key={tool.id} tool={tool} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-gray-100 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {t(
              "هل تحتاج مساعدة في استخدام الأدوات؟ جرّب المساعد الذكي EDUGPT",
              "Besoin d'aide ? Essayez l'assistant intelligent EDUGPT",
              "Need help? Try the EDUGPT intelligent assistant"
            )}
          </p>
          <Link href="/assistant">
            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
              <Bot className="w-5 h-5" />
              {t("ابدأ مع EDUGPT", "Commencer avec EDUGPT", "Start with EDUGPT")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TeacherTools;
