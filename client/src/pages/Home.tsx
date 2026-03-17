import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, Loader2, UserPlus,
  MessageSquare, ClipboardCheck, Globe, Brain, Sparkles,
  ChevronLeft, ChevronDown, Star, Zap, Shield, ArrowLeft, Menu, X,
  Bot, Search, FileEdit, Palette, BarChart3, LayoutDashboard,
  BadgeCheck, ShieldCheck, type LucideIcon, DollarSign, Info,
  Megaphone, Settings, ScanLine, FileCheck, Store, Navigation, MapPin, Play, Target, Clock, Theater, Building2, Briefcase, FileText, Film,
  Quote, Heart, Phone, Mail, ExternalLink, ChevronRight, Send,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import { Link, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ChatAssistant } from "@/components/ChatAssistant";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const courseIcons: Record<string, typeof BookOpen> = {
  primary_teachers: GraduationCap,
  arabic_teachers: BookOpen,
  science_teachers: Award,
  french_teachers: BookOpen,
  preschool_facilitators: Users,
  special_needs_companions: Users,
  digital_teacher_ai: Award,
};

const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇹🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

// AI tools grouped under EDUGPT dropdown
const AI_TOOLS: { href: string; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon; descAr: string; descFr: string; descEn: string }[] = [
  { href: "/assistant", labelAr: "EDUGPT — المساعد البيداغوجي", labelFr: "EDUGPT — Assistant pédagogique", labelEn: "EDUGPT — Pedagogical Assistant", icon: Bot, descAr: "إعداد الجذاذات والمخططات بالذكاء الاصطناعي", descFr: "Préparer fiches et plannings avec l'IA", descEn: "Prepare lesson plans with AI" },
  { href: "/inspector", labelAr: "المتفقد الذكي", labelFr: "Inspecteur IA", labelEn: "AI Inspector", icon: Search, descAr: "تحليل وتقييم الوثائق وفق المعايير الرسمية", descFr: "Analyser les documents selon les normes officielles", descEn: "Analyze documents per official standards" },
  { href: "/exam-builder", labelAr: "بناء الاختبار", labelFr: "Créer un examen", labelEn: "Exam Builder", icon: FileEdit, descAr: "توليد اختبارات مع الرسومات وجدول التقييم", descFr: "Générer des examens avec illustrations et barème", descEn: "Generate exams with illustrations and grading" },
  { href: "/visual-studio", labelAr: "Visual Studio", labelFr: "Visual Studio", labelEn: "Visual Studio", icon: Palette, descAr: "توليد صور تعليمية وإنفوغرافيك بالذكاء الاصطناعي", descFr: "Générer des images éducatives et infographies", descEn: "Generate educational images and infographics" },
  { href: "/legacy-digitizer", labelAr: "Legacy Digitizer — رقمنة الوثائق", labelFr: "Legacy Digitizer — Numérisation", labelEn: "Legacy Digitizer", icon: ScanLine, descAr: "مسح ورقمنة الوثائق التعليمية القديمة بالذكاء الاصطناعي", descFr: "Numériser les anciens documents pédagogiques avec l'IA", descEn: "Scan and digitize old educational documents with AI" },
  { href: "/curriculum-map", labelAr: "Curriculum GPS — خريطة المنهج", labelFr: "Curriculum GPS — Carte du programme", labelEn: "Curriculum GPS — Curriculum Map", icon: BarChart3, descAr: "تتبع تقدمك في تغطية المنهج الدراسي بذكاء", descFr: "Suivre votre progression dans le programme scolaire", descEn: "Track your curriculum coverage progress intelligently" },
  { href: "/blind-grading", labelAr: "مساعد التصحيح الأعمى", labelFr: "Correction aveugle IA", labelEn: "Blind Grading Assistant", icon: FileCheck, descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية", descFr: "Correction intelligente des copies selon les critères tunisiens", descEn: "AI-powered student paper grading with Tunisian criteria" },  { href: "/marketplace", labelAr: "سوق المحتوى الذهبي", labelFr: "Marché du contenu", labelEn: "Content Marketplace", icon: Store, descAr: "سوق مجتمعي لمشاركة وتحميل أفضل المحتويات التعليمية", descFr: "Marché communautaire pour partager le meilleur contenu éducatif", descEn: "Community marketplace for sharing best educational content" },
  { href: "/drama-engine", labelAr: "محرك الدراما التعليمية", labelFr: "Moteur de théâtre éducatif", labelEn: "Drama Engine", icon: Theater, descAr: "حوّل دروسك إلى مسرحيات تفاعلية مع توزيع الأدوار والوسائل", descFr: "Transformez vos leçons en pièces de théâtre interactives", descEn: "Transform lessons into interactive classroom plays" },
  { href: "/handwriting-analyzer", labelAr: "محلل خط اليد الذكي", labelFr: "Analyseur d'écriture IA", labelEn: "AI Handwriting Analyzer", icon: Brain, descAr: "تحليل خط يد التلميذ للكشف المبكر عن صعوبات واضطرابات التعلم", descFr: "Analyser l'écriture pour détecter les troubles d'apprentissage", descEn: "Analyze handwriting to detect learning difficulties" },
  { href: "/video-evaluator", labelAr: "مُقيِّم المعلم الرقمي", labelFr: "Évaluateur vidéo IA", labelEn: "AI Video Evaluator", icon: Film, descAr: "تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر (Prompt Engineering)", descFr: "Évaluer les vidéos éducatives et améliorer le Prompt Engineering", descEn: "Evaluate educational videos and improve Prompt Engineering" },
];

// Certificate links grouped in a dropdown
const CERT_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon; descAr: string; descFr: string; descEn: string; authOnly: boolean }[] = [
  { href: "/my-certificates", labelAr: "شهاداتي", labelFr: "Mes certificats", labelEn: "My Certificates", icon: BadgeCheck, descAr: "عرض وتحميل شهاداتك المكتسبة", descFr: "Voir et télécharger vos certificats", descEn: "View and download your certificates", authOnly: true },
  { href: "/verify", labelAr: "التحقق من شهادة", labelFr: "Vérifier un certificat", labelEn: "Verify Certificate", icon: ShieldCheck, descAr: "التحقق من صحة شهادة برقمها", descFr: "Vérifier l'authenticité d'un certificat", descEn: "Verify a certificate by its number", authOnly: false },
];

const NAV_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; adminOnly: boolean; authOnly: boolean; icon: LucideIcon }[] = [
  { href: "/#programs", labelAr: "برامجنا التدريبية", labelFr: "Nos formations", labelEn: "Training Programs", adminOnly: false, authOnly: false, icon: Megaphone },
  { href: "/about", labelAr: "عن الأكاديمية", labelFr: "À propos", labelEn: "About", adminOnly: false, authOnly: false, icon: Info },
  { href: "/pricing", labelAr: "الأسعار", labelFr: "Tarifs", labelEn: "Pricing", adminOnly: false, authOnly: false, icon: DollarSign },
];

// Smart Grid: 11 AI Tool Cards for Features Section
const SMART_TOOLS: {
  href: string;
  icon: LucideIcon;
  titleAr: string; titleFr: string; titleEn: string;
  descAr: string; descFr: string; descEn: string;
  gradient: string;
  iconBg: string;
  badge?: { ar: string; fr: string; en: string; color: string };
  featured?: boolean;
}[] = [
  {
    href: "/assistant",
    icon: Bot,
    titleAr: "تحضير الدروس الفوري",
    titleFr: "Préparation instantanée",
    titleEn: "Instant Lesson Prep",
    descAr: "أنشئ خطة درس كاملة وفق المنهج التونسي في ثوانٍ مع جذاذات جاهزة للطباعة",
    descFr: "Créez un plan de cours complet selon le programme tunisien en secondes",
    descEn: "Create a complete lesson plan following the Tunisian curriculum in seconds",
    gradient: "from-blue-600 to-indigo-700",
    iconBg: "rgba(26,35,126,0.08)",
    badge: { ar: "الأكثر استخداماً", fr: "Le plus utilisé", en: "Most Popular", color: "#FF6D00" },
    featured: true,
  },
  {
    href: "/exam-builder",
    icon: FileEdit,
    titleAr: "بنك التقييمات الذكي",
    titleFr: "Banque d'évaluations IA",
    titleEn: "Smart Assessment Bank",
    descAr: "توليد اختبارات وتمارين بيداغوجية دقيقة بمختلف المستويات مع جدول التقييم",
    descFr: "Générez des examens et exercices pédagogiques précis avec barème",
    descEn: "Generate precise pedagogical exams and exercises with grading rubric",
    gradient: "from-orange-500 to-red-500",
    iconBg: "rgba(255,109,0,0.08)",
    badge: { ar: "AI Powered", fr: "AI Powered", en: "AI Powered", color: "#1A237E" },
    featured: true,
  },
  {
    href: "/inspector",
    icon: Search,
    titleAr: "المتفقد الذكي",
    titleFr: "Inspecteur IA",
    titleEn: "AI Inspector",
    descAr: "تحليل وتقييم الوثائق التربوية وفق المعايير الرسمية التونسية بدقة متناهية",
    descFr: "Analysez et évaluez les documents pédagogiques selon les normes officielles",
    descEn: "Analyze and evaluate pedagogical documents per official Tunisian standards",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "rgba(16,185,129,0.08)",
  },
  {
    href: "/visual-studio",
    icon: Palette,
    titleAr: "استوديو الصور التعليمية",
    titleFr: "Studio visuel IA",
    titleEn: "Visual Studio",
    descAr: "توليد صور تعليمية وإنفوغرافيك احترافي بالذكاء الاصطناعي لإثراء دروسك",
    descFr: "Générez des images éducatives et infographies professionnelles avec l'IA",
    descEn: "Generate professional educational images and infographics with AI",
    gradient: "from-purple-500 to-pink-500",
    iconBg: "rgba(168,85,247,0.08)",
    badge: { ar: "جديد", fr: "Nouveau", en: "New", color: "#9333EA" },
  },
  {
    href: "/blind-grading",
    icon: FileCheck,
    titleAr: "مساعد التصحيح الأعمى",
    titleFr: "Correction aveugle IA",
    titleEn: "Blind Grading Assistant",
    descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية مع تقارير مفصلة",
    descFr: "Correction intelligente des copies selon les critères tunisiens",
    descEn: "AI-powered student paper grading with Tunisian criteria",
    gradient: "from-cyan-500 to-blue-500",
    iconBg: "rgba(6,182,212,0.08)",
    badge: { ar: "حصري", fr: "Exclusif", en: "Exclusive", color: "#0891B2" },
  },
  {
    href: "/curriculum-map",
    icon: Navigation,
    titleAr: "خريطة المنهج الذكية",
    titleFr: "GPS du programme",
    titleEn: "Curriculum GPS",
    descAr: "تتبع تقدمك في تغطية المنهج الدراسي بذكاء مع تحليلات مفصلة",
    descFr: "Suivez votre progression dans le programme scolaire intelligemment",
    descEn: "Track your curriculum coverage progress intelligently",
    gradient: "from-sky-500 to-blue-600",
    iconBg: "rgba(14,165,233,0.08)",
  },
  {
    href: "/legacy-digitizer",
    icon: ScanLine,
    titleAr: "رقمنة الوثائق التعليمية",
    titleFr: "Numérisation IA",
    titleEn: "Legacy Digitizer",
    descAr: "مسح ورقمنة الوثائق التعليمية القديمة وتحويلها لصيغ رقمية قابلة للتعديل",
    descFr: "Numérisez les anciens documents pédagogiques en formats éditables",
    descEn: "Scan and digitize old educational documents into editable formats",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "rgba(245,158,11,0.08)",
  },
  {
    href: "/drama-engine",
    icon: Theater,
    titleAr: "محرك الدراما التعليمية",
    titleFr: "Moteur de théâtre éducatif",
    titleEn: "Drama Engine",
    descAr: "حوّل دروسك إلى مسرحيات تفاعلية مع توزيع الأدوار والحوارات والوسائل",
    descFr: "Transformez vos leçons en pièces de théâtre interactives",
    descEn: "Transform lessons into interactive classroom plays",
    gradient: "from-rose-500 to-red-500",
    iconBg: "rgba(244,63,94,0.08)",
    badge: { ar: "جديد", fr: "Nouveau", en: "New", color: "#E11D48" },
  },
  {
    href: "/handwriting-analyzer",
    icon: Brain,
    titleAr: "محلل خط اليد الذكي",
    titleFr: "Analyseur d'écriture IA",
    titleEn: "Handwriting Analyzer",
    descAr: "تحليل خط يد التلميذ للكشف المبكر عن صعوبات واضطرابات التعلم",
    descFr: "Analysez l'écriture pour détecter les troubles d'apprentissage",
    descEn: "Analyze handwriting to detect learning difficulties",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "rgba(139,92,246,0.08)",
  },
  {
    href: "/marketplace",
    icon: Store,
    titleAr: "سوق المحتوى الذهبي",
    titleFr: "Marché du contenu",
    titleEn: "Content Marketplace",
    descAr: "سوق مجتمعي لمشاركة وتحميل أفضل المحتويات التعليمية من معلمين تونسيين",
    descFr: "Marché communautaire pour partager le meilleur contenu éducatif",
    descEn: "Community marketplace for sharing best educational content",
    gradient: "from-yellow-500 to-amber-500",
    iconBg: "rgba(234,179,8,0.08)",
  },
  {
    href: "/video-evaluator",
    icon: Film,
    titleAr: "مُقيِّم الفيديو التعليمي",
    titleFr: "Évaluateur vidéo IA",
    titleEn: "Video Evaluator",
    descAr: "تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر (Prompt Engineering)",
    descFr: "Évaluez les vidéos éducatives et améliorez le Prompt Engineering",
    descEn: "Evaluate educational videos and improve Prompt Engineering",
    gradient: "from-indigo-500 to-blue-600",
    iconBg: "rgba(99,102,241,0.08)",
    badge: { ar: "جديد", fr: "Nouveau", en: "New", color: "#6366F1" },
  },
];

const STATS = [
  { value: "+5000", labelAr: "مدرّس مُكوَّن", labelFr: "Enseignants formés" },
  { value: "12", labelAr: "برنامج تدريبي", labelFr: "Programmes de formation" },
  { value: "98%", labelAr: "نسبة الرضا", labelFr: "Taux de satisfaction" },
  { value: "2026", labelAr: "متوافق مع البرامج", labelFr: "Conforme aux programmes" },
];

function FeaturedContentSection({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const featuredQuery = trpc.marketplace.featured.useQuery({ limit: 6 });
  const featured = featuredQuery.data?.items || [];

  if (featured.length === 0) return null;

  const typeLabels: Record<string, string> = {
    lesson_plan: "جذاذة",
    exam: "اختبار",
    evaluation: "تقييم",
    drama_script: "نص مسرحي",
    digitized_doc: "وثيقة مرقمنة",
    other: "أخرى",
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: "rgba(255,109,0,0.1)", color: "#FF6D00" }}>
            <Award className="w-4 h-4" />
            {t("محتوى الأسبوع", "Contenu de la semaine", "Content of the Week")}
          </span>
          <h2 className="text-3xl lg:text-4xl font-black mb-3" style={{ fontFamily: "Cairo, sans-serif", color: "#1A237E" }}>
            {t("أفضل المحتويات في السوق الذهبي", "Meilleur contenu du march\u00e9", "Top Marketplace Content")}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t("محتويات مميزة أنشأها معلمون تونسيون وحازت على أعلى التقييمات", "Contenu cr\u00e9\u00e9 par des enseignants tunisiens", "Top-rated content by Tunisian teachers")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item: any) => (
            <Link key={item.id} href="/marketplace">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(26,35,126,0.08)", color: "#1A237E" }}>
                      {typeLabels[item.contentType] || item.contentType}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{Number(item.averageRating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {item.description || item.contentPreview || ""}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.subject} • {item.grade}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {item.totalDownloads || 0} {t("تحميل", "t\u00e9l\u00e9chargements", "downloads")}
                    </span>
                  </div>
                  {item.contributorName && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ background: "#1A237E" }}>
                        {item.contributorName.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-500">{item.contributorName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/marketplace">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
              <Store className="w-5 h-5" />
              {t("استكشف السوق الذهبي", "Explorer le march\u00e9", "Explore Marketplace")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CurriculumGPSSection({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const { user } = useAuth();
  const gpsQuery = trpc.curriculum.getCurriculumGPS.useQuery(undefined, { enabled: !!user });
  const [, navigate] = useLocation();

  if (!user || !gpsQuery.data?.activePlan) return null;

  const { activePlan, progress, currentLesson, nextLessons, plans } = gpsQuery.data;
  const pct = progress?.percentage || 0;
  const currentWeek = progress?.currentWeek || 1;

  const statusColors: Record<string, string> = {
    completed: "#059669",
    in_progress: "#f59e0b",
    not_started: "#94a3b8",
  };

  return (
    <section className="py-16" dir="rtl" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 60%, #1565C0 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "#fbbf24" }}>
            <Navigation className="w-4 h-4" />
            {t("بوصلة المنهج الذكية", "GPS du Programme", "Curriculum GPS")}
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>
            {activePlan.planTitle}
          </h2>
          <p className="text-blue-200 text-lg">
            {activePlan.subject} • {activePlan.grade} • {t(`الأسبوع ${currentWeek}`, `Semaine ${currentWeek}`, `Week ${currentWeek}`)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-lg">{t("تقدم المنهج", "Progression", "Progress")}</span>
            <span className="text-2xl font-black" style={{ color: "#fbbf24" }}>{pct}%</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-blue-200">
            <span>{progress?.completed || 0} {t("درس مكتمل", "le\u00e7ons compl\u00e9t\u00e9es", "completed")} / {progress?.total || 0}</span>
            <span>{progress?.inProgress || 0} {t("قيد الإنجاز", "en cours", "in progress")}</span>
          </div>
        </div>

        {/* Period breakdown mini-bars */}
        {progress?.periodBreakdown && progress.periodBreakdown.length > 0 && (
          <div className="max-w-3xl mx-auto mb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {progress.periodBreakdown.map((period: any) => (
              <div key={period.periodNumber} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="text-xs text-blue-200 mb-1">{period.periodName}</div>
                <div className="text-lg font-bold text-white">{period.percentage}%</div>
                <div className="h-1.5 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="h-full rounded-full" style={{ width: `${period.percentage}%`, background: period.percentage === 100 ? "#059669" : "#fbbf24" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Lesson Card */}
        {currentLesson && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-6 border" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(251,191,36,0.3)" }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                      {t("الدرس الحالي", "Le\u00e7on actuelle", "Current Lesson")}
                    </span>
                    {currentLesson.weekNumber && (
                      <span className="text-xs text-blue-300">
                        <Clock className="w-3 h-3 inline ml-1" />
                        {t(`الأسبوع ${currentLesson.weekNumber}`, `Semaine ${currentLesson.weekNumber}`, `Week ${currentLesson.weekNumber}`)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {currentLesson.topicTitle}
                  </h3>
                  {currentLesson.competency && (
                    <p className="text-blue-200 text-sm mb-1">
                      {currentLesson.competencyCode && <span className="font-bold text-yellow-300 ml-2">{currentLesson.competencyCode}</span>}
                      {currentLesson.competency}
                    </p>
                  )}
                  {currentLesson.textbookName && (
                    <p className="text-blue-300 text-xs">
                      {currentLesson.textbookName} {currentLesson.textbookPages && `• ${currentLesson.textbookPages}`}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/edugpt?subject=${encodeURIComponent(activePlan.subject)}&grade=${encodeURIComponent(activePlan.grade)}&lesson=${encodeURIComponent(currentLesson.topicTitle)}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                    >
                      <Play className="w-4 h-4" />
                      {t("حضّر هذا الدرس الآن", "Pr\u00e9parer cette le\u00e7on", "Prepare this lesson")}
                    </button>
                    <Link href="/curriculum-map">
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                        <MapPin className="w-4 h-4" />
                        {t("عرض خريطة المنهج", "Voir la carte", "View Curriculum Map")}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Lessons Preview */}
            {nextLessons.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {nextLessons.map((lesson: any, i: number) => (
                  <div key={lesson.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: statusColors[lesson.status] || "#94a3b8", color: "white" }}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-blue-300">
                        {lesson.status === "completed" ? t("مكتمل", "Termin\u00e9", "Done") : lesson.status === "in_progress" ? t("جاري", "En cours", "In progress") : t("قادم", "\u00c0 venir", "Upcoming")}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-sm line-clamp-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                      {lesson.topicTitle}
                    </h4>
                    {lesson.competencyCode && (
                      <span className="text-xs text-yellow-300 mt-1 inline-block">{lesson.competencyCode}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const { t } = useLanguage();

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        setAlreadySubscribed(true);
      }
      setSubmitted(true);
      setEmail("");
      setName("");
    },
  });

  return (
    <section className="py-20 relative overflow-hidden" dir="rtl" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #1565C0 100%)" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #FF6D00 0%, transparent 60%), radial-gradient(circle at 70% 50%, #42A5F5 0%, transparent 60%)" }} />
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 text-white" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.4)" }}>
          <Sparkles className="w-4 h-4" style={{ color: "#FF6D00" }} />
          {t("مجاني 100%", "100% Gratuit", "100% Free")}
        </span>

        <h2 className="text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
          {t("احصل على دليلك المجاني", "Obtenez votre guide gratuit", "Get Your Free Guide")}
        </h2>
        <p className="text-2xl font-bold mb-3" style={{ color: "#FF6D00" }}>
          {t("الذكاء الاصطناعي في الفصل الدراسي التونسي 2026", "L'IA dans la classe tunisienne 2026", "AI in the Tunisian Classroom 2026")}
        </p>
        <p className="text-blue-200 text-lg mb-8">
          {t("انضم إلى أكثر من 5000 مدرس تونسي يطوّرون مهاراتهم معنا", "Rejoignez plus de 5000 enseignants tunisiens", "Join 5000+ Tunisian teachers")}
        </p>

        {submitted ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,109,0,0.2)" }}>
              <Award className="w-8 h-8" style={{ color: "#FF6D00" }} />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">
              {alreadySubscribed
                ? t("أنت مشترك بالفعل!", "Déjà abonné!", "Already subscribed!")
                : t("شكراً لاشتراكك!", "Merci pour votre inscription!", "Thank you for subscribing!")}
            </h3>
            <p className="text-blue-200">
              {t("سيصلك الدليل قريباً على بريدك الإلكتروني", "Le guide vous sera envoyé par email", "The guide will be sent to your email")}
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                type="text"
                placeholder={t("اسمك (اختياري)", "Votre nom (optionnel)", "Your name (optional)")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                dir="rtl"
              />
              <input
                type="email"
                placeholder={t("بريدك الإلكتروني *", "Votre email *", "Your email *")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                dir="ltr"
              />
            </div>
            <Button
              onClick={() => {
                if (!email) return;
                subscribeMutation.mutate({ email, name: name || undefined });
              }}
              disabled={subscribeMutation.isPending || !email}
              className="w-full py-3 text-white font-bold text-lg rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 8px 24px rgba(255,109,0,0.4)" }}
            >
              {subscribeMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin ml-2" />{t("جاري...", "En cours...", "Loading...")}</>
              ) : (
                <><Sparkles className="w-5 h-5 ml-2" />{t("احصل على الدليل المجاني", "Obtenir le guide gratuit", "Get Free Guide")}</>
              )}
            </Button>
            {subscribeMutation.isError && (
              <p className="text-red-300 text-sm mt-2">{t("حدث خطأ، حاول مرة أخرى", "Une erreur est survenue", "An error occurred")}</p>
            )}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-blue-200 text-sm">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" />{t("لا رسائل مزعجة", "Pas de spam", "No spam")}</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4" />{t("+5000 مدرس تونسي", "+5000 enseignants", "+5000 teachers")}</span>
          <span className="flex items-center gap-2"><Award className="w-4 h-4" />{t("محتوى حصري", "Contenu exclusif", "Exclusive content")}</span>
        </div>
      </div>
    </section>
  );
}

// Admin Console Dropdown for desktop nav
function AdminConsoleDropdown({ language, t, location, isAdmin }: { language: AppLanguage; t: (ar: string, fr: string, en: string) => string; location: string; isAdmin: boolean }) {
  const pendingCountQuery = trpc.adminPartners.pendingCount.useQuery(undefined, { refetchInterval: 30000, enabled: isAdmin });
  const pendingCount = isAdmin ? (pendingCountQuery.data?.count || 0) : 0;

  const ADMIN_LINKS = [
    { href: "/dashboard", labelAr: "لوحة التحكم بالدورات", labelFr: "Gestion des formations", labelEn: "Course Management", icon: LayoutDashboard, descAr: "إدارة الدورات والمشاركين والامتحانات", descFr: "Gérer formations, participants et examens", descEn: "Manage courses, participants and exams", section: "general" },
    { href: "/admin", labelAr: "لوحة الإدارة العامة", labelFr: "Administration générale", labelEn: "General Admin", icon: Settings, descAr: "إدارة المستخدمين والإعدادات العامة", descFr: "Gérer utilisateurs et paramètres", descEn: "Manage users and settings", section: "admin" },
    { href: "/admin/partners", labelAr: "إدارة الشركاء", labelFr: "Gestion des partenaires", labelEn: "Partner Management", icon: Building2, descAr: "اعتماد ورفض طلبات المدارس الشريكة", descFr: "Approuver/rejeter les demandes d'écoles", descEn: "Approve/reject school partner requests", section: "admin" },
    { href: "/managerial-dashboard", labelAr: "التحليلات والإحصائيات", labelFr: "Analyses & Statistiques", labelEn: "Analytics & Statistics", icon: BarChart3, descAr: "تقارير الأداء والإحصائيات التفصيلية", descFr: "Rapports de performance et statistiques", descEn: "Performance reports and statistics", section: "admin" },
    { href: "/admin/batches", labelAr: "إدارة الدفعات", labelFr: "Gestion des groupes", labelEn: "Batch Manager", icon: Users, descAr: "إدارة المجموعات والصلاحيات والواجبات", descFr: "Gérer groupes, accès et devoirs", descEn: "Manage batches, access and assignments", section: "admin" },

  ];

  const generalLinks = ADMIN_LINKS.filter(l => l.section === "general");
  const adminLinks = ADMIN_LINKS.filter(l => l.section === "admin");

  return (
    <div className="relative group/admin">
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        ['/admin', '/admin/partners', '/managerial-dashboard', '/dashboard'].some(p => location === p || location.startsWith(p + '/')) ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
      }`} style={{ background: "rgba(30,64,175,0.25)", border: "1px solid rgba(96,165,250,0.3)" }}>
        <Settings className="w-4 h-4 text-blue-200" />
        {t("الإدارة", "Administration", "Management")}
        {pendingCount > 0 && (
          <span className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-blue-200 transition-transform group-hover/admin:rotate-180" />
      </button>
      {/* Hover dropdown */}
      <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover/admin:opacity-100 group-hover/admin:visible transition-all duration-200 z-50" style={{ minWidth: "320px" }}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" dir="rtl">
          <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-300" />
              {t("لوحة الإدارة", "Panneau d'administration", "Admin Panel")}
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-400 text-white">
                  {pendingCount} {t("طلب معلق", "en attente", "pending")}
                </span>
              )}
            </p>
          </div>
          {/* General section */}
          {generalLinks.map((link) => {
            const IconComp = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{language === "fr" ? link.descFr : language === "en" ? link.descEn : link.descAr}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          {isAdmin && adminLinks.length > 0 && (
            <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {t("إدارة متقدمة", "Administration avancée", "Advanced Admin")}
              </p>
            </div>
          )}
          {isAdmin && adminLinks.map((link, idx, arr) => {
            const IconComp = link.icon;
            const isPartners = link.href === "/admin/partners";
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${idx < arr.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: isPartners ? "linear-gradient(135deg, #DC2626, #EF4444)" : "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-gray-900">{language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}</p>
                      {isPartners && pendingCount > 0 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{language === "fr" ? link.descFr : language === "en" ? link.descEn : link.descAr}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Admin mobile link with red dot badge
function AdminMobileLink({ setMobileMenuOpen, location, language, t, isAdmin }: { setMobileMenuOpen: (v: boolean) => void; location: string; language: AppLanguage; t: (ar: string, fr: string, en: string) => string; isAdmin: boolean }) {
  const pendingCountQuery = trpc.adminPartners.pendingCount.useQuery(undefined, { refetchInterval: 30000, enabled: isAdmin });
  const pendingCount = isAdmin ? (pendingCountQuery.data?.count || 0) : 0;

  const allLinks = [
    { href: "/dashboard", labelAr: "لوحة التحكم بالدورات", labelFr: "Gestion des formations", labelEn: "Course Management", icon: LayoutDashboard, adminOnly: false },
    { href: "/admin", labelAr: "لوحة الإدارة العامة", labelFr: "Administration générale", labelEn: "General Admin", icon: Settings, adminOnly: true },
    { href: "/admin/partners", labelAr: "إدارة الشركاء", labelFr: "Gestion des partenaires", labelEn: "Partner Management", icon: Building2, adminOnly: true },
    { href: "/managerial-dashboard", labelAr: "التحليلات والإحصائيات", labelFr: "Analyses & Statistiques", labelEn: "Analytics & Statistics", icon: BarChart3, adminOnly: true },
    { href: "/admin/batches", labelAr: "إدارة الدفعات", labelFr: "Gestion des groupes", labelEn: "Batch Manager", icon: Users, adminOnly: true },

  ];
  const links = allLinks.filter(l => !l.adminOnly || isAdmin);

  return (
    <>
      {links.map((link) => {
        const IconComp = link.icon;
        const isActive = location === link.href || location.startsWith(link.href + "/");
        const isPartners = link.href === "/admin/partners";
        return (
          <Link key={link.href} href={link.href}>
            <button
              className={`flex items-center gap-3 w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-300" : ""}`} />
              <span className="flex-1">{language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}</span>
              {isPartners && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                </span>
              )}
            </button>
          </Link>
        );
      })}
    </>
  );
}

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [location] = useLocation();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: featuredReviews } = trpc.reviews.featured.useQuery({ limit: 3 });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.enrollment.courseId) || []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A237E 0%, #283593 50%, #1565C0 100%)" }}>
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[Cairo,Tajawal,sans-serif]" dir="rtl">
      <SEOHead ogUrl="/" />

      <UnifiedNavbar />


      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-white" style={{ minHeight: "85vh" }}>
        {/* Subtle decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Soft gradient blobs */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "#1A237E", filter: "blur(100px)" }} />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "#FF6D00", filter: "blur(80px)" }} />
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(#1A237E 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ===== RIGHT SIDE: Text Content ===== */}
            <div className="space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "rgba(26,35,126,0.06)", color: "#1A237E" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#FF6D00" }} />
                <span>{t("منصة الذكاء الاصطناعي التربوي #1 في تونس", "Plateforme IA éducative #1 en Tunisie", "#1 Educational AI Platform in Tunisia")}</span>
              </div>

              {/* Main headline (H1) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-extrabold leading-[1.15] tracking-tight" style={{ fontFamily: "'Cairo', 'Almarai', sans-serif", color: "#1A237E" }}>
                {t(
                  "مستقبل التعليم بين يديك:",
                  "L'avenir de l'enseignement entre vos mains :",
                  "The Future of Education in Your Hands:"
                )}
                <br />
                <span style={{ color: "#FF6D00" }}>
                  {t(
                    "حضّر دروسك في ثوانٍ بذكاء",
                    "Préparez vos cours en secondes avec l'IA",
                    "Prepare Lessons in Seconds with AI"
                  )}
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-gray-500 text-lg lg:text-xl leading-relaxed max-w-xl" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
                {t(
                  "اختصر ساعات التحضير المرهقة إلى دقائق معدودة باستخدام أقوى أدوات الذكاء الاصطناعي المصممة للمنهج التربوي.",
                  "Réduisez des heures de préparation épuisantes à quelques minutes grâce aux outils IA les plus puissants conçus pour le programme éducatif.",
                  "Cut exhausting hours of preparation down to minutes using the most powerful AI tools designed for the educational curriculum."
                )}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/teacher-tools">
                  <Button
                    size="lg"
                    className="text-white font-bold px-8 h-13 text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 6px 24px rgba(255,109,0,0.3)" }}
                  >
                    <Sparkles className="w-5 h-5 ml-2" />
                    {t("جرب الأدوات الذكية", "Essayer les outils IA", "Try Smart Tools")}
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    // Placeholder for video - scroll to features for now
                    document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2.5 font-semibold px-6 h-13 text-base rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#1A237E]/30 hover:text-[#1A237E] hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(26,35,126,0.08)" }}>
                    <Play className="w-4 h-4 fill-current" style={{ color: "#1A237E" }} />
                  </div>
                  <span>{t("شاهد فيديو توضيحي", "Voir la vidéo", "Watch Demo Video")}</span>
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-3">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {["#1A237E", "#FF6D00", "#1565C0", "#0D47A1"].map((color, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: color }}>
                      {["م", "أ", "س", "ن"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#FF6D00" }} />)}
                  </div>
                  <p className="text-gray-400 text-sm">{t("+5000 مدرّس يثق بنا", "+5000 enseignants nous font confiance", "+5000 teachers trust us")}</p>
                </div>
              </div>
            </div>

            {/* ===== LEFT SIDE: Visual Panel ===== */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main app mockup card */}
                <div className="rounded-2xl p-1 shadow-2xl" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)", boxShadow: "0 25px 60px rgba(26,35,126,0.25)" }}>
                  <div className="bg-white rounded-xl p-5">
                    {/* Browser header bar */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="flex-1 h-7 rounded-lg mx-3 flex items-center px-3" style={{ background: "#F8F9FF" }}>
                        <span className="text-[11px] text-gray-400" dir="ltr">leaderacademy.school/assistant</span>
                      </div>
                    </div>
                    {/* Chat simulation */}
                    <div className="space-y-3">
                      {/* User message */}
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: "#FF6D00" }}>
                          م
                        </div>
                        <div className="rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-gray-700 max-w-[280px]" style={{ background: "#F8F9FF" }}>
                          {t(
                            "أعدّ لي جذاذة درس الكسور للسنة الخامسة ابتدائي",
                            "Prépare-moi une fiche de cours sur les fractions pour la 5e année primaire",
                            "Prepare a lesson plan on fractions for 5th grade"
                          )}
                        </div>
                      </div>
                      {/* AI response */}
                      <div className="flex gap-2.5 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md px-4 py-3 text-sm max-w-[300px] border" style={{ background: "white", borderColor: "#E8EAF6" }}>
                          <p className="font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: "#4CAF50" }}>✓</span>
                            {t("جذاذة الكسور — السنة 5", "Fiche Fractions — 5e année", "Fractions Plan — Grade 5")}
                          </p>
                          <div className="space-y-1 text-gray-500 text-xs">
                            <p>{t("الكفاءة: يُعبّر عن كسر بسيط ويقارن بين كسرين", "Compétence: Exprimer une fraction simple", "Competency: Express a simple fraction")}</p>
                            <p>{t("المدة: 45 دقيقة | المستوى: السنة 5", "Durée: 45 min | Niveau: 5e année", "Duration: 45 min | Level: Grade 5")}</p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "#FFF3E0", color: "#E65100" }}>📄 PDF</span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "#E8EAF6", color: "#1A237E" }}>📝 Word</span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "#E8F5E9", color: "#2E7D32" }}>🖨 Print</span>
                          </div>
                        </div>
                      </div>
                      {/* Typing indicator */}
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F8F9FF" }}>
                          <span className="text-sm">🇹🇳</span>
                        </div>
                        <div className="rounded-2xl px-4 py-2.5 flex items-center gap-1.5" style={{ background: "#F8F9FF" }}>
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#1A237E", animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#1565C0", animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#FF6D00", animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge: top-right */}
                <div className="absolute -top-5 -right-5 rounded-xl px-4 py-2.5 shadow-lg bg-white border border-gray-100" style={{ animation: "float 6s ease-in-out infinite" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                      <span className="text-green-600 text-base font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{t("متوافق مع", "Conforme aux", "Compatible with")}</p>
                      <p className="text-xs text-gray-500">{t("البرامج الرسمية 2026", "Programmes 2026", "Official Programs 2026")}</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge: bottom-left */}
                <div className="absolute -bottom-5 -left-5 rounded-xl px-4 py-2.5 shadow-lg bg-white border border-gray-100" style={{ animation: "float 6s ease-in-out infinite 3s" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF3E0" }}>
                      <Zap className="w-5 h-5" style={{ color: "#FF6D00" }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{t("11 أداة ذكية", "11 outils IA", "11 AI Tools")}</p>
                      <p className="text-xs text-gray-500">{t("جاهزة للاستخدام", "Prêts à l'emploi", "Ready to use")}</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge: top-left */}
                <div className="absolute top-8 -left-8 rounded-xl px-3 py-2 shadow-lg bg-white border border-gray-100" style={{ animation: "float 5s ease-in-out infinite 1.5s" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇹🇳</span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">{t("صُمِّم لتونس", "Conçu pour la Tunisie", "Made for Tunisia")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-4xl font-black mb-1" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>{stat.value}</p>
                <p className="text-gray-600 text-sm font-medium">{language === "fr" ? stat.labelFr : stat.labelAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SMART TOOLS GRID SECTION ===== */}
      <section className="py-20 lg:py-24" style={{ background: "#F9FAFB" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold mb-5" style={{ background: "rgba(26,35,126,0.06)", color: "#1A237E" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#FF6D00" }} />
              <span>{t("لماذا Leader Academy؟", "Pourquoi Leader Academy ?", "Why Leader Academy?")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold mb-5 leading-tight" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
              {t(
                "11 أداة ذكاء اصطناعي للمدرّس التونسي",
                "11 outils IA pour l'enseignant tunisien",
                "11 AI Tools for the Tunisian Teacher"
              )}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
              {t(
                "كل ما تحتاجه لتحويل تجربتك التدريسية في مكان واحد — مصمّم خصيصاً للمنظومة التربوية التونسية",
                "Tout ce dont vous avez besoin pour transformer votre expérience d'enseignement — conçu pour le système éducatif tunisien",
                "Everything you need to transform your teaching experience — designed for the Tunisian educational system"
              )}
            </p>
          </div>

          {/* Smart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SMART_TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Link key={i} href={tool.href}>
                  <div className={`group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full ${
                    tool.featured ? "ring-1 ring-gray-200 hover:ring-[#1A237E]/20" : ""
                  }`} style={{ borderRadius: "16px" }}>
                    {/* Badge */}
                    {tool.badge && (
                      <div className="absolute -top-3 left-5 rtl:left-auto rtl:right-5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md" style={{ background: tool.badge.color }}>
                          <Sparkles className="w-3 h-3" />
                          {t(tool.badge.ar, tool.badge.fr, tool.badge.en)}
                        </span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`} style={{ background: tool.iconBg }}>
                      <Icon className={`w-7 h-7 transition-colors duration-300`} style={{ color: tool.gradient.includes("blue") ? "#1A237E" : tool.gradient.includes("orange") ? "#FF6D00" : tool.gradient.includes("emerald") ? "#059669" : tool.gradient.includes("purple") ? "#9333EA" : tool.gradient.includes("cyan") ? "#0891B2" : tool.gradient.includes("sky") ? "#0284C7" : tool.gradient.includes("amber") ? "#D97706" : tool.gradient.includes("rose") ? "#E11D48" : tool.gradient.includes("violet") ? "#7C3AED" : tool.gradient.includes("yellow") ? "#CA8A04" : tool.gradient.includes("indigo") ? "#4F46E5" : "#1A237E" }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2.5 transition-colors duration-200 group-hover:text-[#FF6D00]" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
                      {t(tool.titleAr, tool.titleFr, tool.titleEn)}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-4" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
                      {t(tool.descAr, tool.descFr, tool.descEn)}
                    </p>

                    {/* Arrow link */}
                    <div className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-2 rtl:-translate-x-2 group-hover:translate-x-0 rtl:group-hover:translate-x-0" style={{ color: "#FF6D00" }}>
                      <span>{t("افتح الأداة", "Ouvrir l'outil", "Open Tool")}</span>
                      <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All CTA */}
          <div className="text-center mt-12">
            <Link href="/teacher-tools">
              <Button
                size="lg"
                variant="outline"
                className="font-bold text-base px-8 h-12 rounded-xl border-2 hover:scale-[1.03] transition-all duration-200"
                style={{ borderColor: "#1A237E", color: "#1A237E" }}
              >
                <Sparkles className="w-5 h-5 ml-2" style={{ color: "#FF6D00" }} />
                {t("استكشف جميع الأدوات", "Explorer tous les outils", "Explore All Tools")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROGRAMS SECTION ===== */}
      <section id="programs" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold mb-5" style={{ background: "rgba(255,109,0,0.08)", color: "#FF6D00" }}>
              <GraduationCap className="w-4 h-4" />
              <span>{t("برامجنا التدريبية", "Nos formations", "Training Programs")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5" style={{ color: "#1A237E", fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
              {t("اختر برنامجك التدريبي", "Choisissez votre programme", "Choose Your Training Program")}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t(
                "دورات متخصصة مصمّمة بعناية لتطوير مهاراتك التربوية والرقمية، مع شهادات معتمدة",
                "Des formations spécialisées conçues pour développer vos compétences pédagogiques et numériques",
                "Specialized courses designed to develop your pedagogical and digital skills, with certified diplomas"
              )}
            </p>
          </div>

          {/* Featured Courses Grid - 4 cards */}
          {(() => {
            const FEATURED_COVERS: Record<string, { img: string; badgeAr: string; badgeFr: string; badgeEn: string; badgeColor: string; rating: number; students: number; descAr: string; descFr: string; descEn: string }> = {
              "primary_teachers": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-primary-teachers-22HWdhUvhChXUErJygCu7Z.webp",
                badgeAr: "الأكثر شمولاً", badgeFr: "Le plus complet", badgeEn: "Most Comprehensive",
                badgeColor: "#1A237E",
                rating: 4.9, students: 342,
                descAr: "برنامج شامل لتأهيل معلمي المرحلة الابتدائية وفق المنهج التونسي الرسمي",
                descFr: "Programme complet pour qualifier les enseignants du primaire selon le curriculum tunisien",
                descEn: "Comprehensive program to qualify primary teachers per the Tunisian curriculum"
              },
              "digital_teacher_ai": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-ai-digital-teacher-KChS7RNLizhz8EaP2yDNfe.webp",
                badgeAr: "الأكثر طلباً", badgeFr: "Le plus demandé", badgeEn: "Most Popular",
                badgeColor: "#FF6D00",
                rating: 4.8, students: 528,
                descAr: "تعلّم توظيف الذكاء الاصطناعي في التدريس وإعداد الدروس الرقمية",
                descFr: "Apprenez à utiliser l'IA dans l'enseignement et la préparation numérique",
                descEn: "Learn to leverage AI in teaching and digital lesson preparation"
              },
              "special_needs_companions": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-special-needs-5fM9gP4Ep9BwSgBvKbJcid.webp",
                badgeAr: "فريد", badgeFr: "Unique", badgeEn: "Unique",
                badgeColor: "#00897B",
                rating: 4.7, students: 186,
                descAr: "تأهيل مرافقي التلاميذ ذوي صعوبات التعلم بأحدث الأساليب التربوية",
                descFr: "Former les accompagnants d'élèves en difficulté avec les méthodes modernes",
                descEn: "Train learning support companions with the latest pedagogical methods"
              },
              "english_teachers": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-english-training-9cPsmZ4bKgqCVy9M8z7Mue.webp",
                badgeAr: "دولي", badgeFr: "International", badgeEn: "International",
                badgeColor: "#5C6BC0",
                rating: 4.6, students: 215,
                descAr: "برنامج تدريب معلمي اللغة الإنجليزية بمعايير دولية وشهادة معتمدة",
                descFr: "Programme de formation des enseignants d'anglais aux standards internationaux",
                descEn: "English teacher training program with international standards and certification"
              }
            };
            const featuredOrder = ["digital_teacher_ai", "primary_teachers", "special_needs_companions", "english_teachers"];
            const featuredCourses = featuredOrder
              .map(cat => courses?.find(c => c.category === cat))
              .filter(Boolean);

            if (!featuredCourses || featuredCourses.length === 0) {
              // Fallback: show first 4 courses from API
              const fallback = courses?.slice(0, 4) || [];
              if (fallback.length === 0 && !isLoading) {
                return (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(26,35,126,0.08)" }}>
                      <BookOpen className="w-10 h-10" style={{ color: "#1A237E" }} />
                    </div>
                    <p className="text-gray-500 text-lg">{t("لا توجد دورات متاحة حالياً", "Aucune formation disponible", "No courses available")}</p>
                  </div>
                );
              }
            }

            const displayCourses = featuredCourses.length > 0 ? featuredCourses : (courses?.slice(0, 4) || []);

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                  {displayCourses.map((course) => {
                    if (!course) return null;
                    const cover = FEATURED_COVERS[course.category];
                    const isEnrolled = enrolledCourseIds.has(course.id);
                    const rating = cover?.rating || 4.5;
                    const students = cover?.students || 100;
                    return (
                      <div
                        key={course.id}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                      >
                        {/* Card Image Header */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          <img
                            src={cover?.img || "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-primary-teachers-22HWdhUvhChXUErJygCu7Z.webp"}
                            alt={course.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Badge */}
                          {cover && (
                            <div
                              className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                              style={{ background: cover.badgeColor }}
                            >
                              {t(cover.badgeAr, cover.badgeFr, cover.badgeEn)}
                            </div>
                          )}
                          {/* Duration pill */}
                          {course.duration && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.duration} {t("ساعة", "h", "h")}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3
                            className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2"
                            style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}
                          >
                            {course.titleAr}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                            {cover
                              ? t(cover.descAr, cover.descFr, cover.descEn)
                              : (course.descriptionAr || t("دورة تدريبية متخصصة", "Formation spécialisée", "Specialized training"))
                            }
                          </p>

                          {/* Rating & Students */}
                          <div className="flex items-center justify-between mb-4 text-sm">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className="w-4 h-4"
                                  style={{
                                    color: s <= Math.floor(rating) ? "#F59E0B" : "#E5E7EB",
                                    fill: s <= Math.floor(rating) ? "#F59E0B" : "none"
                                  }}
                                />
                              ))}
                              <span className="text-gray-600 font-semibold mr-1">{rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Users className="w-3.5 h-3.5" />
                              <span className="text-xs">{students}+</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {user ? (
                            isEnrolled ? (
                              <Link href={`/courses/${course.id}`}>
                                <button
                                  className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 hover:shadow-md"
                                  style={{ borderColor: "#1A237E", color: "#1A237E", background: "transparent" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#1A237E"; e.currentTarget.style.color = "#fff"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A237E"; }}
                                >
                                  {t("متابعة الدورة", "Continuer", "Continue")}
                                </button>
                              </Link>
                            ) : (
                              <Link href={`/courses/${course.id}`}>
                                <button
                                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:brightness-110"
                                  style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}
                                >
                                  {t("تفاصيل الدورة", "Détails du cours", "Course Details")}
                                </button>
                              </Link>
                            )
                          ) : (
                            <a href={getLoginUrl()}>
                              <button
                                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:brightness-110"
                                style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
                              >
                                {t("سجّل الآن", "S'inscrire", "Enroll Now")}
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View All Ghost Button */}
                <div className="text-center mt-14">
                  <Link href="/courses">
                    <button
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold border-2 transition-all duration-300 hover:shadow-lg group/btn"
                      style={{ borderColor: "#1A237E", color: "#1A237E", background: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#1A237E"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A237E"; }}
                    >
                      <span>{t("استكشف كافة الدورات", "Voir toutes les formations", "Explore All Courses")}</span>
                      <ArrowLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-1" />
                    </button>
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ===== CURRICULUM GPS ===== */}
      <CurriculumGPSSection t={t} />

      {/* ===== FEATURED CONTENT OF THE WEEK ===== */}
      <FeaturedContentSection t={t} />

      {/* ===== TESTIMONIALS SECTION - TRUST WALL ===== */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: "#FFFFFF" }} dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #1A237E, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, #FF6D00, transparent 70%)", transform: "translate(30%, 30%)" }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2.5 rounded-full px-6 py-2.5 text-sm font-bold mb-6" style={{ background: "linear-gradient(135deg, rgba(255,109,0,0.08), rgba(255,143,0,0.05))", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.12)" }}>
              <Heart className="w-4 h-4" />
              <span style={{ fontFamily: "'Almarai', sans-serif" }}>{t("جدار الثقة", "Mur de confiance", "Trust Wall")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold mb-6 leading-tight" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
              {t("ماذا يقول المربّون عنّا؟", "Témoignages de nos enseignants", "What Teachers Say About Us")}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
              {t(
                "آراء حقيقية من مدرّسين تونسيين غيّرت Leader Academy طريقة تدريسهم",
                "Avis réels d'enseignants tunisiens dont Leader Academy a transformé l'enseignement",
                "Real feedback from Tunisian teachers whose teaching was transformed by Leader Academy"
              )}
            </p>
          </div>

          {/* 3-Column Trust Wall Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {(featuredReviews && featuredReviews.length > 0 ? featuredReviews : [
              {
                review: { id: -1, rating: 5, comment: t(
                  "كنت أقضي ساعتين في تحضير الجذاذة الواحدة. بعد EDUGPT، أنجز نفس العمل في 5 دقائق بجودة تفوق ما كنت أفعله يدوياً. هذه ثورة حقيقية في عالم التعليم!",
                  "Je passais deux heures à préparer une seule fiche. Avec EDUGPT, je fais le même travail en 5 minutes avec une qualité supérieure. C'est une vraie révolution!",
                  "I used to spend two hours preparing a single lesson plan. With EDUGPT, I do the same work in 5 minutes with superior quality. A true revolution!"
                ), createdAt: new Date() },
                user: { id: -1, name: t("الأستاذ محمد البوعزيزي", "Mohamed Bouazizi", "Mohamed Bouazizi"), arabicName: "الأستاذ محمد البوعزيزي" },
                course: { id: -1, titleAr: "EDUGPT" },
                _jobTitle: t("أستاذ تعليم ابتدائي", "Enseignant du primaire", "Primary School Teacher"),
                _avatarBg: "linear-gradient(135deg, #1A237E 0%, #283593 100%)",
              },
              {
                review: { id: -2, rating: 5, comment: t(
                  "التقييم الفوري غيّر طريقتي في متابعة تلاميذي. أستطيع الآن معرفة مستوى كل تلميذ بدقة وتقديم دعم مخصص له. أنصح كل زملائي بتجربة هذه الأدوات.",
                  "L'évaluation instantanée a changé ma façon de suivre mes élèves. Je peux maintenant connaître le niveau de chaque élève avec précision et offrir un soutien personnalisé.",
                  "Instant assessment changed how I track my students. I can now know each student's level precisely and offer personalized support."
                ), createdAt: new Date() },
                user: { id: -2, name: t("الأستاذة مريم العامري", "Mariem Amri", "Mariem Amri"), arabicName: "الأستاذة مريم العامري" },
                course: { id: -2, titleAr: t("التصحيح الأعمى", "Correction aveugle", "Blind Grading") },
                _jobTitle: t("خبيرة تربوية", "Experte pédagogique", "Educational Expert"),
                _avatarBg: "linear-gradient(135deg, #FF6D00 0%, #FF8F00 100%)",
              },
              {
                review: { id: -3, rating: 5, comment: t(
                  "دورة توظيف الذكاء الاصطناعي في التدريس كانت نقطة تحوّل حقيقية. المحتوى عملي، المدربون خبراء، والأدوات ثورية. أفضل استثمار في مسيرتي المهنية.",
                  "La formation sur l'intégration de l'IA dans l'enseignement a été un vrai tournant. Le contenu est pratique, les formateurs sont experts. Le meilleur investissement de ma carrière.",
                  "The AI integration in teaching course was a real turning point. Practical content, expert trainers. The best investment in my career."
                ), createdAt: new Date() },
                user: { id: -3, name: t("الأستاذ أحمد الطرابلسي", "Ahmed Trabelsi", "Ahmed Trabelsi"), arabicName: "الأستاذ أحمد الطرابلسي" },
                course: { id: -3, titleAr: t("الدورات التدريبية", "Formations", "Training Courses") },
                _jobTitle: t("أستاذ تعليم ثانوي", "Enseignant du secondaire", "Secondary School Teacher"),
                _avatarBg: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
              },
            ] as any[]).map((item: any, i: number) => {
              const accentColors = ["#1A237E", "#FF6D00", "#1565C0"];
              const accentColor = accentColors[i % 3];
              const avatarGradients = [
                "linear-gradient(135deg, #1A237E 0%, #283593 100%)",
                "linear-gradient(135deg, #FF6D00 0%, #FF8F00 100%)",
                "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
              ];
              const displayName = item.user?.arabicName || item.user?.name || t("مشارك", "Participant", "Participant");
              const initial = displayName.charAt(0);
              const courseName = item.course?.titleAr || "";
              const jobTitle = item._jobTitle || t("مشارك في الدورة", "Participant au cours", "Course participant");
              
              return (
                <div
                  key={item.review.id}
                  className="group relative bg-white p-8 lg:p-9 transition-all duration-500 ease-out hover:-translate-y-3 cursor-default"
                  style={{
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.04), 0 0 0 2px ${accentColor}20`;
                    e.currentTarget.style.borderColor = `${accentColor}35`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.02)";
                    e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Decorative accent line on top */}
                  <div 
                    className="absolute top-0 rounded-t-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      left: 0, right: 0, height: "3px",
                      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, ${accentColor}40)`,
                    }} 
                  />

                  {/* Quote icon - elegant corner placement */}
                  <div className="absolute top-6 left-6" style={{ transform: language === "ar" ? "none" : "scaleX(-1)" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}04)` }}>
                      <Quote className="w-6 h-6 opacity-40" style={{ color: accentColor }} />
                    </div>
                  </div>

                  {/* 5 Golden Stars */}
                  <div className="flex gap-1 mb-6 mt-2">
                    {Array.from({ length: 5 }).map((_: any, s: number) => (
                      <Star 
                        key={s} 
                        className="w-[18px] h-[18px] fill-current transition-transform duration-300" 
                        style={{ 
                          color: s < (item.review.rating || 5) ? "#F59E0B" : "#E5E7EB",
                          transitionDelay: `${s * 50}ms`,
                        }} 
                      />
                    ))}
                  </div>

                  {/* Review Text - Almarai 16px */}
                  <p 
                    className="text-gray-600 leading-[1.9] mb-7" 
                    style={{ 
                      fontFamily: "'Almarai', 'Cairo', sans-serif", 
                      fontSize: "16px",
                      lineHeight: "1.9",
                    }}
                  >
                    <span className="text-xl font-bold opacity-30" style={{ color: accentColor }}>"</span>
                    {item.review.comment}
                    <span className="text-xl font-bold opacity-30" style={{ color: accentColor }}>"</span>
                  </p>

                  {/* Course badge */}
                  {courseName && (
                    <div className="mb-7">
                      <span 
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
                        style={{ 
                          background: `${accentColor}08`, 
                          color: accentColor,
                          border: `1px solid ${accentColor}15`,
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {courseName}
                      </span>
                    </div>
                  )}

                  {/* Divider + Teacher Profile */}
                  <div className="border-t border-gray-100/80 pt-6">
                    <div className="flex items-center gap-4">
                      {/* Circular Avatar - 60px */}
                      <div 
                        className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          background: item._avatarBg || avatarGradients[i % 3],
                          boxShadow: `0 4px 14px ${accentColor}30`,
                        }}
                      >
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Bold Name */}
                        <p className="font-extrabold text-gray-900 text-[15px] truncate" style={{ fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
                          {displayName}
                        </p>
                        {/* Gray Job Title */}
                        <p className="text-gray-400 text-[13px] mt-0.5 truncate" style={{ fontFamily: "'Almarai', sans-serif" }}>
                          {jobTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-20 py-8 px-6 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(26,35,126,0.03), rgba(21,101,192,0.02))" }}>
            <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-16">
              {/* Metric 1 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A237E10, #1A237E05)" }}>
                  <Users className="w-5 h-5" style={{ color: "#1A237E" }} />
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#1A237E", fontFamily: "'Cairo', sans-serif" }}>+5000</p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("مدرّس تونسي", "enseignants tunisiens", "Tunisian teachers")}</p>
                </div>
              </div>
              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-gray-200/60" />
              {/* Metric 2 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6D0010, #FF6D0005)" }}>
                  <Star className="w-5 h-5 fill-current" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#FF6D00", fontFamily: "'Cairo', sans-serif" }}>4.9/5</p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("تقييم المشاركين", "Note des participants", "Participant rating")}</p>
                </div>
              </div>
              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-gray-200/60" />
              {/* Metric 3 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1565C010, #1565C005)" }}>
                  <Shield className="w-5 h-5" style={{ color: "#1565C0" }} />
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#1565C0", fontFamily: "'Cairo', sans-serif" }}>98%</p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("نسبة الرضا", "Taux de satisfaction", "Satisfaction rate")}</p>
                </div>
              </div>
              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-gray-200/60" />
              {/* Metric 4 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4CAF5010, #4CAF5005)" }}>
                  <Award className="w-5 h-5" style={{ color: "#4CAF50" }} />
                </div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#4CAF50", fontFamily: "'Cairo', sans-serif" }}>12</p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("برنامج تدريبي معتمد", "Programmes certifiés", "Certified programs")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <NewsletterSection />

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #1565C0 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #FF6D00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #42A5F5 0%, transparent 50%)"
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6" style={{ fontFamily: "Cairo, sans-serif" }}>
            ابدأ رحلتك مع الذكاء الاصطناعي التربوي
          </h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
            انضم إلى أكثر من 500 مدرّس تونسي يستخدمون Leader Academy لتحويل تجربتهم التدريسية
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/assistant">
              <Button size="lg" className="text-white font-bold px-10 py-4 text-lg rounded-xl shadow-2xl hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 8px 32px rgba(255,109,0,0.4)" }}>
                <Brain className="w-5 h-5 ml-2" />
                جرّب EDUGPT مجاناً
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold px-10 py-4 text-lg rounded-xl">
                تواصل مع الفريق
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: "linear-gradient(180deg, #0A1647 0%, #0D1B5E 100%)" }} className="text-white" dir="rtl">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png" alt="Leader Academy" className="h-11 w-auto" />
                <div>
                  <p className="font-bold text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>Leader Academy</p>
                  <p className="text-blue-300 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("نحو تعليم رقمي متميز", "Vers un enseignement num\u00e9rique d'excellence", "Towards excellent digital education")}</p>
                </div>
              </div>
              <p className="text-blue-200/70 text-sm leading-relaxed mb-6" style={{ fontFamily: "'Almarai', sans-serif" }}>
                {t(
                  "منصة تدريبية رائدة في توظيف الذكاء الاصطناعي في التدريس، مخصصة للمعلمين التونسيين. معتمدة من وزارة التكوين المهني.",
                  "Plateforme de formation leader dans l'int\u00e9gration de l'IA dans l'enseignement, d\u00e9di\u00e9e aux enseignants tunisiens.",
                  "Leading training platform for AI integration in teaching, dedicated to Tunisian teachers."
                )}
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-2.5">
                <a href="https://www.facebook.com/leaderacademy.tn" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all duration-300 hover:-translate-y-0.5" aria-label="Facebook">
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/leaderacademytn/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all duration-300 hover:-translate-y-0.5" aria-label="Instagram">
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCEZWPqq_ONwn-CzD_GwLuVg" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all duration-300 hover:-translate-y-0.5" aria-label="YouTube">
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://wa.me/21652339339" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all duration-300 hover:-translate-y-0.5" aria-label="WhatsApp">
                  <svg className="w-4 h-4 text-blue-300" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold mb-5 text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t("روابط سريعة", "Liens rapides", "Quick Links")}
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/", labelAr: "الرئيسية", labelFr: "Accueil", labelEn: "Home" },
                  { href: "/teacher-tools", labelAr: "الأدوات الذكية", labelFr: "Outils IA", labelEn: "AI Tools" },
                  { href: "/courses", labelAr: "الدورات التدريبية", labelFr: "Formations", labelEn: "Courses" },
                  { href: "/about", labelAr: "من نحن", labelFr: "\u00c0 propos", labelEn: "About Us" },
                  { href: "/contact", labelAr: "تواصل معنا", labelFr: "Contact", labelEn: "Contact" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/60 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                      {t(link.labelAr, link.labelFr, link.labelEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: AI Tools */}
            <div>
              <h4 className="font-bold mb-5 text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t("أدوات الذكاء الاصطناعي", "Outils d'IA", "AI Tools")}
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/assistant", labelAr: "EDUGPT — المساعد البيداغوجي", labelFr: "EDUGPT", labelEn: "EDUGPT" },
                  { href: "/exam-builder", labelAr: "بناء الاختبارات", labelFr: "Cr\u00e9ateur d'examens", labelEn: "Exam Builder" },
                  { href: "/inspector", labelAr: "المتفقد الذكي", labelFr: "Inspecteur IA", labelEn: "AI Inspector" },
                  { href: "/visual-studio", labelAr: "Visual Studio", labelFr: "Visual Studio", labelEn: "Visual Studio" },
                  { href: "/blind-grading", labelAr: "التصحيح الأعمى", labelFr: "Correction aveugle", labelEn: "Blind Grading" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/60 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                      {t(link.labelAr, link.labelFr, link.labelEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-bold mb-5 text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t("تواصل معنا", "Contactez-nous", "Contact Us")}
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:leaderacademy216@gmail.com" className="flex items-start gap-3 text-blue-200/60 hover:text-white transition-colors duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-300/50 mb-0.5" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("البريد الإلكتروني", "Email", "Email")}</p>
                      <p className="text-sm" dir="ltr">leaderacademy216@gmail.com</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-blue-200/60">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-300/50 mb-0.5" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("الهاتف", "T\u00e9l\u00e9phone", "Phone")}</p>
                      <p className="text-sm" dir="ltr">52 339 339 / 99 997 729</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-blue-200/60">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-300/50 mb-0.5" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("الموقع", "Localisation", "Location")}</p>
                      <p className="text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("تونس، الجمهورية التونسية", "Tunisie", "Tunisia")}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-blue-300/50 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
                {t(
                  "\u00a9 2026 Leader Academy. جميع الحقوق محفوظة. سجل تجاري: B08107512016",
                  "\u00a9 2026 Leader Academy. Tous droits r\u00e9serv\u00e9s. RC: B08107512016",
                  "\u00a9 2026 Leader Academy. All rights reserved. CR: B08107512016"
                )}
              </p>
              <div className="flex items-center gap-4 text-blue-300/50 text-xs">
                <span className="flex items-center gap-1.5">
                  <span>🇹🇳</span>
                  <span style={{ fontFamily: "'Almarai', sans-serif" }}>{t("صنع في تونس", "Fabriqu\u00e9 en Tunisie", "Made in Tunisia")}</span>
                </span>
                <span className="hidden sm:inline">|</span>
                <a href="https://leaderacademy.school" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  leaderacademy.school
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ChatAssistant
        externalIsOpen={isChatOpen}
        onExternalOpenChange={setIsChatOpen}
      />
    </div>
  );
}
