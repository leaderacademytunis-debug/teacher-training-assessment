import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import BackButton from "@/components/BackButton";
import {
  Bot, Search, FileEdit, Palette, BarChart3,
  FileCheck, Theater, Brain, Film, ScanLine,
  Calendar, BookOpen, Sparkles, ArrowLeft,
  Zap, ClipboardCheck, Lightbulb, type LucideIcon,
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
      },
      {
        id: "blind-grading",
        href: "/blind-grading",
        icon: FileCheck,
        nameAr: "مساعد التصحيح الأعمى",
        nameFr: "Correction aveugle IA",
        nameEn: "Blind Grading Assistant",
        descAr: "تصحيح ذكي لأوراق التلاميذ بالذكاء الاصطناعي حسب المعايير التونسية (مع1، مع2، مع3)",
        descFr: "Correction intelligente des copies avec IA selon les critères tunisiens (M1, M2, M3)",
        descEn: "AI-powered student paper grading with Tunisian criteria (M1, M2, M3)",
        isNew: true,
        gradient: "linear-gradient(135deg, #6A1B9A, #AB47BC)",
        iconBg: "#E1BEE7",
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
      },
    ],
  },
];

/* ───────── Bonus tools (not in main categories) ───────── */
const BONUS_TOOLS: ToolDef[] = [
  {
    id: "handwriting",
    href: "/handwriting-analyzer",
    icon: Brain,
    nameAr: "محلل خط اليد الذكي",
    nameFr: "Analyseur d'écriture IA",
    nameEn: "AI Handwriting Analyzer",
    descAr: "تحليل خط يد التلميذ للكشف المبكر عن صعوبات واضطرابات التعلم",
    descFr: "Analyser l'écriture pour détecter les troubles d'apprentissage",
    descEn: "Analyze handwriting to detect learning difficulties early",
    gradient: "linear-gradient(135deg, #00695C, #26A69A)",
    iconBg: "#E0F2F1",
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
  },
];

/* ───────── Helper ───────── */
function getName(tool: ToolDef, lang: AppLanguage) {
  return lang === "fr" ? tool.nameFr : lang === "en" ? tool.nameEn : tool.nameAr;
}
function getDesc(tool: ToolDef, lang: AppLanguage) {
  return lang === "fr" ? tool.descFr : lang === "en" ? tool.descEn : tool.descAr;
}
function getCatTitle(cat: CategoryDef, lang: AppLanguage) {
  return lang === "fr" ? cat.titleFr : lang === "en" ? cat.titleEn : cat.titleAr;
}
function getCatSubtitle(cat: CategoryDef, lang: AppLanguage) {
  return lang === "fr" ? cat.subtitleFr : lang === "en" ? cat.subtitleEn : cat.subtitleAr;
}

/* ───────── Tool Card Component ───────── */
function ToolCard({ tool, lang }: { tool: ToolDef; lang: AppLanguage }) {
  return (
    <Link href={tool.href}>
      <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden cursor-pointer h-full">
        {/* Top gradient accent bar */}
        <div className="h-1.5 w-full" style={{ background: tool.gradient }} />

        {/* New badge */}
        {tool.isNew && (
          <div className="absolute top-4 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-lg animate-pulse"
              style={{ background: "linear-gradient(135deg, #FF6D00, #FF9800)" }}>
              <Sparkles className="w-3 h-3" />
              {lang === "fr" ? "Nouveau" : lang === "en" ? "New" : "جديد"}
            </span>
          </div>
        )}

        <div className="p-5 flex flex-col h-full" dir="rtl">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm"
            style={{ background: tool.iconBg }}>
            <tool.icon className="w-7 h-7" style={{ color: tool.gradient.includes("#1A237E") ? "#1A237E" : tool.gradient.includes("#4A148C") ? "#6A1B9A" : tool.gradient.includes("#E65100") ? "#E65100" : tool.gradient.includes("#00695C") ? "#00695C" : "#1565C0" }} />
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-800 transition-colors">
            {getName(tool, lang)}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            {getDesc(tool, lang)}
          </p>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: tool.gradient.includes("#1A237E") ? "#1565C0" : tool.gradient.includes("#4A148C") ? "#7B1FA2" : tool.gradient.includes("#E65100") ? "#E65100" : "#00897B" }}>
            <span>{lang === "fr" ? "Ouvrir l'outil" : lang === "en" ? "Open tool" : "افتح الأداة"}</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-8">
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
