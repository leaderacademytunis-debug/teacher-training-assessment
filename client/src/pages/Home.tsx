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
  Quote, Heart, Phone, Mail, ExternalLink, ChevronRight, Send, HeartHandshake,
  Timer, Calculator, HelpCircle, ChevronUp, Mic, Video, CheckCircle, TrendingUp, Minus,
  Crown, Rocket,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import { Link, useLocation } from "wouter";
import { useState, useMemo, useEffect, useRef } from "react";
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
  { href: "/blind-grading", labelAr: "مساعد التصحيح الذكي", labelFr: "Correction intelligente IA", labelEn: "Smart Grading Assistant", icon: FileCheck, descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية", descFr: "Correction intelligente des copies selon les critères tunisiens", descEn: "AI-powered student paper grading with Tunisian criteria" },  { href: "/marketplace", labelAr: "سوق المحتوى الذهبي", labelFr: "Marché du contenu", labelEn: "Content Marketplace", icon: Store, descAr: "سوق مجتمعي لمشاركة وتحميل أفضل المحتويات التعليمية", descFr: "Marché communautaire pour partager le meilleur contenu éducatif", descEn: "Community marketplace for sharing best educational content" },
  { href: "/drama-engine", labelAr: "محرك الدراما التعليمية", labelFr: "Moteur de théâtre éducatif", labelEn: "Drama Engine", icon: Theater, descAr: "حوّل دروسك إلى مسرحيات تفاعلية مع توزيع الأدوار والوسائل", descFr: "Transformez vos leçons en pièces de théâtre interactives", descEn: "Transform lessons into interactive classroom plays" },
  { href: "/learning-support", labelAr: "أدوات ذوي صعوبات التعلم", labelFr: "Outils troubles d'apprentissage", labelEn: "Learning Difficulties Tools", icon: HeartHandshake, descAr: "أدوات ذكاء اصطناعي متخصصة لمرافقة التلاميذ ذوي صعوبات واضطرابات التعلم", descFr: "Outils IA spécialisés pour accompagner les élèves en difficulté d'apprentissage", descEn: "Specialized AI tools to support students with learning difficulties" },
  { href: "/video-evaluator", labelAr: "مُقيِّم المعلم الرقمي", labelFr: "Évaluateur vidéo IA", labelEn: "AI Video Evaluator", icon: Film, descAr: "تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر (Prompt Engineering)", descFr: "Évaluer les vidéos éducatives et améliorer le Prompt Engineering", descEn: "Evaluate educational videos and improve Prompt Engineering" },
  { href: "/prompt-lab", labelAr: "مختبر هندسة الأوامر", labelFr: "Labo Prompt Engineering", labelEn: "Prompt Engineering Lab", icon: Sparkles, descAr: "مكتبة أوامر ذهبية ومحسّن ذكي وقوالب تفاعلية — مجاني للجميع", descFr: "Bibliothèque de prompts, optimiseur IA et modèles — gratuit pour tous", descEn: "Prompt library, AI optimizer and templates — free for everyone" },
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
    titleAr: "مساعد التصحيح الذكي",
    titleFr: "Correction intelligente IA",
    titleEn: "Smart Grading Assistant",
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
    href: "/learning-support",
    icon: HeartHandshake,
    titleAr: "أدوات ذوي صعوبات التعلم",
    titleFr: "Outils troubles d'apprentissage",
    titleEn: "Learning Difficulties Tools",
    descAr: "أدوات ذكاء اصطناعي متخصصة لمرافقة التلاميذ ذوي صعوبات التعلم",
    descFr: "Outils IA spécialisés pour accompagner les élèves en difficulté",
    descEn: "Specialized AI tools to support students with learning difficulties",
    gradient: "from-teal-500 to-emerald-600",
    iconBg: "rgba(20,184,166,0.08)",
    badge: { ar: "جديد", fr: "Nouveau", en: "New", color: "#0D9488" },
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
  {
    href: "/prompt-lab",
    icon: Sparkles,
    titleAr: "مختبر هندسة الأوامر",
    titleFr: "Labo Prompt Engineering",
    titleEn: "Prompt Engineering Lab",
    descAr: "أتقن فن كتابة الأوامر للذكاء الاصطناعي مع مكتبة أوامر ذهبية ومحسّن ذكي وقوالب تفاعلية",
    descFr: "Maîtrisez l'art du Prompt Engineering avec une bibliothèque, un optimiseur IA et des modèles interactifs",
    descEn: "Master Prompt Engineering with a golden library, AI optimizer, and interactive templates",
    gradient: "from-fuchsia-500 to-purple-600",
    iconBg: "rgba(192,38,211,0.08)",
    badge: { ar: "مجاني", fr: "Gratuit", en: "Free", color: "#C026D3" },
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
                        <Clock className="w-3 h-3 inline ms-1" />
                        {t(`الأسبوع ${currentLesson.weekNumber}`, `Semaine ${currentLesson.weekNumber}`, `Week ${currentLesson.weekNumber}`)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {currentLesson.topicTitle}
                  </h3>
                  {currentLesson.competency && (
                    <p className="text-blue-200 text-sm mb-1">
                      {currentLesson.competencyCode && <span className="font-bold text-yellow-300 ms-2">{currentLesson.competencyCode}</span>}
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
                <><Loader2 className="w-5 h-5 animate-spin ms-2" />{t("جاري...", "En cours...", "Loading...")}</>
              ) : (
                <><Sparkles className="w-5 h-5 ms-2" />{t("احصل على الدليل المجاني", "Obtenir le guide gratuit", "Get Free Guide")}</>
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

// ============ CRO SECTION 1: KILLER FEATURES ============
function KillerFeaturesSection({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const KILLER_FEATURES = [
    {
      icon: Bot,
      titleAr: "تحضير الدروس في 3 دقائق",
      titleFr: "Pr\u00e9parez vos cours en 3 minutes",
      titleEn: "Prepare Lessons in 3 Minutes",
      descAr: "بدل ساعات التحضير المرهقة، EDUGPT ينشئ لك جذاذة درس كاملة متوافقة مع المنهج التونسي الرسمي في ثوانٍ معدودة. اكتب الموضوع فقط واحصل على خطة درس جاهزة للطباعة.",
      descFr: "Au lieu d'heures de pr\u00e9paration, EDUGPT cr\u00e9e une fiche de cours compl\u00e8te conforme au programme tunisien en quelques secondes.",
      descEn: "Instead of hours of preparation, EDUGPT creates a complete lesson plan aligned with the Tunisian curriculum in seconds.",
      beforeAr: "قبل: 2 ساعة تحضير",
      beforeFr: "Avant: 2h de pr\u00e9paration",
      beforeEn: "Before: 2h preparation",
      afterAr: "بعد: 3 دقائق فقط",
      afterFr: "Apr\u00e8s: 3 minutes seulement",
      afterEn: "After: Just 3 minutes",
      gradient: "from-blue-600 to-indigo-700",
      accentColor: "#1A237E",
      href: "/assistant",
    },
    {
      icon: Film,
      titleAr: "استوديو فيديو تعليمي احترافي",
      titleFr: "Studio vid\u00e9o \u00e9ducatif professionnel",
      titleEn: "Professional Educational Video Studio",
      descAr: "حوّل أي درس PDF إلى فيديو تعليمي احترافي بدقة 1080p مع صور AI وصوت طبيعي وهوية بصرية Leader Academy. كل ذلك من متصفحك دون أي برنامج إضافي.",
      descFr: "Transformez n'importe quel cours PDF en vid\u00e9o \u00e9ducative professionnelle 1080p avec images IA et voix naturelle.",
      descEn: "Transform any PDF lesson into a professional 1080p educational video with AI images and natural voice.",
      beforeAr: "قبل: تكلفة إنتاج 500+ دينار",
      beforeFr: "Avant: Co\u00fbt de production 500+ TND",
      beforeEn: "Before: Production cost 500+ TND",
      afterAr: "بعد: مجاناً مع الاشتراك",
      afterFr: "Apr\u00e8s: Gratuit avec l'abonnement",
      afterEn: "After: Free with subscription",
      gradient: "from-purple-600 to-pink-600",
      accentColor: "#9333EA",
      href: "/ultimate-studio",
    },
    {
      icon: Mic,
      titleAr: "استنسخ صوتك بالذكاء الاصطناعي",
      titleFr: "Clonez votre voix avec l'IA",
      titleEn: "Clone Your Voice with AI",
      descAr: "تقنية حصرية: سجّل 30 ثانية من صوتك واحصل على نسخة رقمية تتحدث بصوتك الحقيقي في كل فيديوهاتك التعليمية. تلاميذك سيسمعون صوت أستاذهم الحقيقي!",
      descFr: "Technologie exclusive: enregistrez 30 secondes de votre voix et obtenez un clone num\u00e9rique pour toutes vos vid\u00e9os.",
      descEn: "Exclusive technology: record 30 seconds of your voice and get a digital clone for all your educational videos.",
      beforeAr: "قبل: صوت آلي بارد",
      beforeFr: "Avant: Voix robotique froide",
      beforeEn: "Before: Cold robotic voice",
      afterAr: "بعد: صوتك الحقيقي في كل فيديو",
      afterFr: "Apr\u00e8s: Votre vraie voix dans chaque vid\u00e9o",
      afterEn: "After: Your real voice in every video",
      gradient: "from-orange-500 to-red-500",
      accentColor: "#FF6D00",
      href: "/pricing",
      badge: { ar: "VIP حصري", fr: "VIP Exclusif", en: "VIP Exclusive" },
    },
  ];

  return (
    <section className="py-24 lg:py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F0F4FF 100%)" }}>
      {/* Decorative */}
      <div className="absolute top-0 end-0 w-96 h-96 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #1A237E, transparent 70%)" }} />
      <div className="absolute bottom-0 start-0 w-80 h-80 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FF6D00, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold mb-6" style={{ background: "linear-gradient(135deg, rgba(255,109,0,0.1), rgba(255,143,0,0.06))", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.15)" }}>
            <Zap className="w-4 h-4" />
            <span>{t("لماذا يختارنا +5000 مدرّس؟", "Pourquoi +5000 enseignants nous choisissent ?", "Why +5000 Teachers Choose Us?")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 leading-tight" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
            {t(
              "3 أسلحة سرية تغيّر حياتك المهنية",
              "3 armes secr\u00e8tes qui changent votre carri\u00e8re",
              "3 Secret Weapons That Change Your Career"
            )}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t(
              "ليست مجرد أدوات... بل ثورة حقيقية في طريقة تحضيرك وتدريسك",
              "Pas de simples outils... une v\u00e9ritable r\u00e9volution dans votre enseignement",
              "Not just tools... a real revolution in your teaching"
            )}
          </p>
        </div>

        {/* 3 Feature Cards */}
        <div className="space-y-8">
          {KILLER_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const isEven = i % 2 === 1;
            return (
              <Link key={i} href={feature.href}>
                <div className={`group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer`}>
                  {/* Badge */}
                  {feature.badge && (
                    <div className="absolute top-4 start-4 rtl:left-auto rtl:end-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-pulse-glow" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
                        <Crown className="w-3.5 h-3.5" />
                        {t(feature.badge.ar, feature.badge.fr, feature.badge.en)}
                      </span>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 lg:grid-cols-5 gap-0 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Content Side (3 cols) */}
                    <div className={`lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black leading-tight group-hover:text-[#FF6D00] transition-colors duration-300" style={{ color: "#1A237E", fontFamily: "'Cairo', sans-serif" }}>
                          {t(feature.titleAr, feature.titleFr, feature.titleEn)}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-6" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
                        {t(feature.descAr, feature.descFr, feature.descEn)}
                      </p>

                      {/* Before/After comparison */}
                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.06)" }}>
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-600 line-through">{t(feature.beforeAr, feature.beforeFr, feature.beforeEn)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(34,197,94,0.06)" }}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-bold text-green-600">{t(feature.afterAr, feature.afterFr, feature.afterEn)}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3" style={{ color: "#FF6D00" }}>
                        <span>{t("جرّب الآن مجاناً", "Essayez maintenant gratuitement", "Try Now for Free")}</span>
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Visual Side (2 cols) */}
                    <div className={`lg:col-span-2 relative overflow-hidden ${isEven ? 'lg:order-1' : 'lg:order-2'}`} style={{ minHeight: "280px" }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.06]`} />
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative">
                          {/* Large icon background */}
                          <div className={`w-40 h-40 lg:w-48 lg:h-48 rounded-3xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-2xl group-hover:scale-105 transition-transform duration-500`} style={{ boxShadow: `0 20px 60px ${feature.accentColor}30` }}>
                            <Icon className="w-20 h-20 lg:w-24 lg:h-24 text-white opacity-90" />
                          </div>
                          {/* Floating stat badge */}
                          <div className="absolute -bottom-4 -end-4 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100" style={{ animation: "float 5s ease-in-out infinite" }}>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-bold" style={{ color: "#1A237E" }}>
                                {i === 0 ? t("توفير 90% من الوقت", "90% de temps gagn\u00e9", "90% time saved") : i === 1 ? t("فيديو 1080p", "Vid\u00e9o 1080p", "1080p Video") : t("صوتك الحقيقي", "Votre vraie voix", "Your real voice")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ CRO SECTION 2: TIME SAVINGS CALCULATOR ============
function TimeSavingsCalculator({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const savedHours = Math.round(hoursPerWeek * 0.85);
  const savedPerMonth = savedHours * 4;
  const savedPerYear = savedPerMonth * 9; // 9 months school year
  const moneySaved = Math.round(savedPerYear * 8); // ~8 TND per hour

  return (
    <section className="py-24 lg:py-28 relative overflow-hidden" dir="rtl" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #1565C0 100%)" }}>
      {/* Decorative */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #FF6D00 0%, transparent 50%), radial-gradient(circle at 75% 50%, #42A5F5 0%, transparent 50%)" }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold mb-6" style={{ background: "rgba(255,255,255,0.12)", color: "#fbbf24", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Calculator className="w-4 h-4" />
            <span>{t("احسب توفيرك الحقيقي", "Calculez vos \u00e9conomies r\u00e9elles", "Calculate Your Real Savings")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
            {t(
              "كم ساعة تضيع أسبوعياً في التحضير؟",
              "Combien d'heures perdez-vous par semaine ?",
              "How Many Hours Do You Waste Weekly?"
            )}
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            {t(
              "حرّك المؤشر واكتشف كم ستوفّر مع Leader Academy",
              "D\u00e9placez le curseur et d\u00e9couvrez vos \u00e9conomies avec Leader Academy",
              "Move the slider and discover your savings with Leader Academy"
            )}
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 lg:p-10" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {/* Slider */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-bold text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t("ساعات التحضير الأسبوعية الحالية", "Heures de pr\u00e9paration hebdomadaires", "Current Weekly Prep Hours")}
                </label>
                <span className="text-3xl font-black" style={{ color: "#fbbf24" }}>{hoursPerWeek} {t("ساعة", "heures", "hours")}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to left, #FF6D00 0%, #FF6D00 ${((hoursPerWeek - 5) / 25) * 100}%, rgba(255,255,255,0.15) ${((hoursPerWeek - 5) / 25) * 100}%, rgba(255,255,255,0.15) 100%)`,
                  accentColor: "#FF6D00",
                }}
              />
              <div className="flex justify-between text-xs text-blue-300 mt-2">
                <span>5 {t("ساعات", "heures", "hours")}</span>
                <span>30 {t("ساعة", "heures", "hours")}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { value: savedHours, unit: t("ساعة/أسبوع", "h/semaine", "h/week"), label: t("توفير أسبوعي", "\u00c9conomie hebdo", "Weekly Savings"), color: "#4CAF50" },
                { value: savedPerMonth, unit: t("ساعة/شهر", "h/mois", "h/month"), label: t("توفير شهري", "\u00c9conomie mensuelle", "Monthly Savings"), color: "#fbbf24" },
                { value: savedPerYear, unit: t("ساعة/سنة", "h/an", "h/year"), label: t("توفير سنوي", "\u00c9conomie annuelle", "Yearly Savings"), color: "#FF6D00" },
                { value: moneySaved, unit: "TND", label: t("قيمة الوقت الموفّر", "Valeur du temps", "Time Value Saved"), color: "#E91E63" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-4xl lg:text-5xl font-black mb-1" style={{ color: stat.color, fontFamily: "'Cairo', sans-serif" }}>{stat.value}</p>
                  <p className="text-white text-sm font-semibold">{stat.unit}</p>
                  <p className="text-blue-300 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Comparison bar */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm">{t("بدون Leader Academy", "Sans Leader Academy", "Without Leader Academy")}</span>
                <span className="text-red-400 font-bold">{hoursPerWeek} {t("ساعة", "h", "h")}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: "100%" }} />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm">{t("مع Leader Academy", "Avec Leader Academy", "With Leader Academy")}</span>
                <span className="font-bold" style={{ color: "#4CAF50" }}>{hoursPerWeek - savedHours} {t("ساعة", "h", "h")}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((hoursPerWeek - savedHours) / hoursPerWeek) * 100}%`, background: "linear-gradient(90deg, #4CAF50, #66BB6A)" }} />
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Link href="/pricing">
                <button className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 8px 32px rgba(255,109,0,0.4)" }}>
                  <Sparkles className="w-5 h-5" />
                  {t("ابدأ التوفير الآن", "Commencez \u00e0 \u00e9conomiser", "Start Saving Now")}
                </button>
              </Link>
              <p className="text-blue-300 text-sm mt-4">
                {t("ابدأ مجاناً • لا حاجة لبطاقة بنكية", "Commencez gratuitement \u2022 Pas de carte bancaire requise", "Start free \u2022 No credit card required")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CRO SECTION 3: FAQ ============
function FAQSection({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQ_ITEMS = [
    {
      qAr: "هل المحتوى متوافق مع البرامج الرسمية التونسية؟",
      qFr: "Le contenu est-il conforme aux programmes officiels tunisiens ?",
      qEn: "Is the content aligned with official Tunisian programs?",
      aAr: "نعم 100%. جميع أدواتنا مصممة خصيصاً وفق المنهج التربوي التونسي الرسمي (البرامج الرسمية 2024-2026). كل جذاذة وكل اختبار يتبع هيكل السند والتعليمة مع معايير التقييم (مع1، مع2، مع3) وجدول إسناد الأعداد الرسمي.",
      aFr: "Oui, \u00e0 100%. Tous nos outils sont con\u00e7us sp\u00e9cifiquement selon le programme \u00e9ducatif tunisien officiel (2024-2026).",
      aEn: "Yes, 100%. All our tools are specifically designed according to the official Tunisian educational curriculum (2024-2026).",
    },
    {
      qAr: "كيف يمكنني الدفع؟ هل D17 متاح؟",
      qFr: "Comment puis-je payer ? D17 est-il disponible ?",
      qEn: "How can I pay? Is D17 available?",
      aAr: "نعم! نقبل الدفع عبر D17 (البريد التونسي)، التحويل البنكي، أو واتساب. بعد الدفع، يتم تفعيل حسابك خلال ساعة واحدة كحد أقصى. قريباً سنضيف الدفع الآلي عبر Flouci وKonnect.",
      aFr: "Oui ! Nous acceptons D17 (Poste Tunisienne), virement bancaire ou WhatsApp. Activation en 1h maximum.",
      aEn: "Yes! We accept D17 (Tunisian Post), bank transfer, or WhatsApp. Account activated within 1 hour maximum.",
    },
    {
      qAr: "هل يمكنني تجربة الأدوات قبل الاشتراك؟",
      qFr: "Puis-je essayer les outils avant de m'abonner ?",
      qEn: "Can I try the tools before subscribing?",
      aAr: "بالطبع! عدة أدوات متاحة مجاناً بدون اشتراك مثل مختبر هندسة الأوامر (Prompt Lab) ومقيّم الفيديو. كما يمكنك تجربة EDUGPT والأدوات الأخرى بعدد محدود من الاستخدامات المجانية.",
      aFr: "Bien s\u00fbr ! Plusieurs outils sont gratuits comme le Prompt Lab et l'\u00e9valuateur vid\u00e9o. Vous pouvez aussi essayer EDUGPT avec des utilisations gratuites limit\u00e9es.",
      aEn: "Of course! Several tools are free like Prompt Lab and Video Evaluator. You can also try EDUGPT with limited free uses.",
    },
    {
      qAr: "هل استنساخ الصوت آمن وقانوني؟",
      qFr: "Le clonage vocal est-il s\u00fbr et l\u00e9gal ?",
      qEn: "Is voice cloning safe and legal?",
      aAr: "نعم تماماً. نستخدم تقنية ElevenLabs المعتمدة عالمياً. صوتك المستنسخ يُستخدم فقط في فيديوهاتك التعليمية ولا يُشارك مع أي طرف ثالث. أنت تملك حقوق صوتك الرقمي بالكامل.",
      aFr: "Oui, absolument. Nous utilisons la technologie ElevenLabs certifi\u00e9e mondialement. Votre voix clon\u00e9e n'est utilis\u00e9e que dans vos vid\u00e9os.",
      aEn: "Yes, absolutely. We use globally certified ElevenLabs technology. Your cloned voice is only used in your educational videos.",
    },
    {
      qAr: "هل يمكنني إلغاء الاشتراك في أي وقت؟",
      qFr: "Puis-je annuler mon abonnement \u00e0 tout moment ?",
      qEn: "Can I cancel my subscription anytime?",
      aAr: "نعم، يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية. ستستمر في الاستفادة من الخدمات حتى نهاية فترة الاشتراك المدفوعة.",
      aFr: "Oui, vous pouvez annuler \u00e0 tout moment sans frais suppl\u00e9mentaires. Vous continuez \u00e0 b\u00e9n\u00e9ficier des services jusqu'\u00e0 la fin de la p\u00e9riode pay\u00e9e.",
      aEn: "Yes, you can cancel anytime without additional fees. You continue to benefit from services until the end of the paid period.",
    },
    {
      qAr: "هل أحتاج خبرة تقنية لاستخدام الأدوات؟",
      qFr: "Ai-je besoin d'exp\u00e9rience technique pour utiliser les outils ?",
      qEn: "Do I need technical experience to use the tools?",
      aAr: "لا أبداً! صممنا جميع الأدوات لتكون بسيطة وسهلة الاستخدام. فقط اكتب ما تريد باللغة العربية أو الفرنسية والذكاء الاصطناعي يتكفل بالباقي. كما نوفر دورات تدريبية مجانية لمساعدتك.",
      aFr: "Pas du tout ! Tous les outils sont simples et intuitifs. \u00c9crivez ce que vous voulez en arabe ou fran\u00e7ais et l'IA s'occupe du reste.",
      aEn: "Not at all! All tools are simple and intuitive. Just write what you want in Arabic or French and AI handles the rest.",
    },
  ];

  return (
    <section className="py-24 lg:py-28 bg-white" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold mb-6" style={{ background: "rgba(26,35,126,0.06)", color: "#1A237E" }}>
            <HelpCircle className="w-4 h-4" />
            <span>{t("أسئلة شائعة", "Questions fr\u00e9quentes", "Frequently Asked Questions")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 leading-tight" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
            {t("كل ما تريد معرفته", "Tout ce que vous devez savoir", "Everything You Need to Know")}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t(
              "إجابات واضحة على أكثر الأسئلة شيوعاً من المدرسين التونسيين",
              "R\u00e9ponses claires aux questions les plus fr\u00e9quentes des enseignants tunisiens",
              "Clear answers to the most common questions from Tunisian teachers"
            )}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? "border-[#1A237E]/20 shadow-lg" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
                style={{ background: isOpen ? "linear-gradient(135deg, rgba(26,35,126,0.02), rgba(21,101,192,0.01))" : "white" }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-end"
                >
                  <span className="font-bold text-base lg:text-lg flex-1 ms-4" style={{ color: isOpen ? "#1A237E" : "#374151", fontFamily: "'Cairo', sans-serif" }}>
                    {t(item.qAr, item.qFr, item.qEn)}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ background: isOpen ? "linear-gradient(135deg, #1A237E, #1565C0)" : "rgba(26,35,126,0.06)" }}>
                    <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? "text-white" : "text-gray-400"}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 animate-fade-in-up">
                    <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(26,35,126,0.1), transparent)" }} />
                    <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: "'Almarai', 'Cairo', sans-serif" }}>
                      {t(item.aAr, item.aFr, item.aEn)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="text-center mt-12 p-8 rounded-2xl" style={{ background: "rgba(26,35,126,0.03)" }}>
          <p className="text-gray-600 font-semibold mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t("لم تجد إجابتك؟", "Vous n'avez pas trouv\u00e9 votre r\u00e9ponse ?", "Didn't find your answer?")}
          </p>
          <a href="https://wa.me/21652339339" target="_blank" rel="noopener noreferrer">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:scale-105" style={{ background: "#25D366" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t("تواصل معنا عبر واتساب", "Contactez-nous via WhatsApp", "Contact us via WhatsApp")}
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}

// ============ CRO SECTION 4: MINI PRICING ============
function MiniPricingSection({ t }: { t: (ar: string, fr: string, en: string) => string }) {
  const MINI_TIERS = [
    {
      id: "starter",
      nameAr: "المبادر",
      nameFr: "Starter",
      nameEn: "Starter",
      price: 49,
      oldPrice: 79,
      descAr: "للمعلم الذي يريد البدء",
      descFr: "Pour d\u00e9buter",
      descEn: "To get started",
      color: "#059669",
      gradient: "from-emerald-500 to-emerald-600",
      icon: Rocket,
      highlights: [
        { ar: "EDUGPT (20 استخدام/شهر)", fr: "EDUGPT (20/mois)", en: "EDUGPT (20/month)" },
        { ar: "منشئ الاختبارات (10/شهر)", fr: "Cr\u00e9ateur d'examens (10/mois)", en: "Exam Builder (10/month)" },
        { ar: "الاستوديو البصري (5 صور)", fr: "Studio visuel (5 images)", en: "Visual Studio (5 images)" },
      ],
    },
    {
      id: "pro",
      nameAr: "المحترف",
      nameFr: "Professionnel",
      nameEn: "Professional",
      price: 149,
      oldPrice: 199,
      descAr: "للمعلم المحترف",
      descFr: "Pour le professionnel",
      descEn: "For the professional",
      color: "#1A237E",
      gradient: "from-blue-600 to-indigo-700",
      icon: Brain,
      popular: true,
      highlights: [
        { ar: "جميع أدوات AI بلا قيود يومية", fr: "Tous les outils IA sans limites", en: "All AI tools unlimited daily" },
        { ar: "Ultimate Studio + فيديو MP4", fr: "Ultimate Studio + vid\u00e9o MP4", en: "Ultimate Studio + MP4 video" },
        { ar: "100 استخدام EDUGPT/شهر", fr: "100 utilisations EDUGPT/mois", en: "100 EDUGPT uses/month" },
      ],
    },
    {
      id: "vip",
      nameAr: "المعلم الرقمي VIP",
      nameFr: "Digital Teacher VIP",
      nameEn: "Digital Teacher VIP",
      price: 299,
      oldPrice: 450,
      descAr: "الباقة الملكية الكاملة",
      descFr: "Le pack royal complet",
      descEn: "The complete royal package",
      color: "#FF6D00",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      icon: Crown,
      highlights: [
        { ar: "استنساخ صوتك بالذكاء الاصطناعي", fr: "Clonage vocal IA", en: "AI Voice Cloning" },
        { ar: "استخدام غير محدود لكل شيء", fr: "Utilisation illimit\u00e9e", en: "Unlimited everything" },
        { ar: "دعم أولوية + وصول مبكر", fr: "Support prioritaire + acc\u00e8s anticipé", en: "Priority support + early access" },
      ],
    },
  ];

  return (
    <section className="py-24 lg:py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)" }} dir="rtl">
      {/* Decorative */}
      <div className="absolute top-0 start-1/3 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #1A237E, transparent)" }} />
      <div className="absolute bottom-0 end-1/4 w-80 h-80 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FF6D00, transparent)" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold mb-6" style={{ background: "rgba(255,109,0,0.08)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.12)" }}>
            <Crown className="w-4 h-4" />
            <span>{t("عرض خاص لفترة محدودة", "Offre sp\u00e9ciale limit\u00e9e", "Limited Time Offer")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 leading-tight" style={{ color: "#1A237E", fontFamily: "'Cairo', 'Almarai', sans-serif" }}>
            {t("اختر باقتك وابدأ اليوم", "Choisissez votre forfait", "Choose Your Plan Today")}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t(
              "استثمر في مستقبلك المهني — كل باقة تدفع ثمنها من أول أسبوع استخدام",
              "Investissez dans votre avenir — chaque forfait se rentabilise d\u00e8s la premi\u00e8re semaine",
              "Invest in your future — every plan pays for itself from the first week"
            )}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {MINI_TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const isPopular = tier.popular;
            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isPopular ? "shadow-xl" : "shadow-lg"
                }`}
                style={{
                  background: isPopular
                    ? "linear-gradient(135deg, #1A237E, #FF6D00)"
                    : "linear-gradient(135deg, #E8EAF6, #F3F4F6)",
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {t("الأكثر طلباً", "Le plus populaire", "Most Popular")}
                    </span>
                  </div>
                )}

                <div className="bg-white rounded-[22px] p-7 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.gradient} shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg" style={{ color: "#1A237E", fontFamily: "'Cairo', sans-serif" }}>
                        {t(tier.nameAr, tier.nameFr, tier.nameEn)}
                      </h3>
                      <p className="text-gray-400 text-xs">{t(tier.descAr, tier.descFr, tier.descEn)}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black" style={{ color: tier.color }}>{tier.price}</span>
                      <span className="text-gray-400 text-sm font-semibold">TND/{t("شهر", "mois", "month")}</span>
                    </div>
                    <span className="text-sm text-red-400 line-through">{tier.oldPrice} TND</span>
                    <span className="text-xs font-bold me-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#059669" }}>
                      -{Math.round(((tier.oldPrice - tier.price) / tier.oldPrice) * 100)}%
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3 mb-6 flex-1">
                    {tier.highlights.map((h, j) => (
                      <div key={j} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" style={{ color: tier.color }} />
                        <span className="text-sm text-gray-600 font-medium">{t(h.ar, h.fr, h.en)}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/pricing">
                    <button
                      className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                        isPopular ? "text-white" : "text-white"
                      }`}
                      style={{
                        background: isPopular
                          ? "linear-gradient(135deg, #FF6D00, #FF8F00)"
                          : `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)`,
                        boxShadow: isPopular ? "0 6px 24px rgba(255,109,0,0.3)" : undefined,
                      }}
                    >
                      {t("اشترك الآن", "S'abonner maintenant", "Subscribe Now")}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-10 text-gray-400 text-sm">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" />{t("دفع آمن 100%", "Paiement s\u00e9curis\u00e9 100%", "100% Secure Payment")}</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{t("إلغاء في أي وقت", "Annulation \u00e0 tout moment", "Cancel Anytime")}</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" />{t("تفعيل فوري", "Activation instantan\u00e9e", "Instant Activation")}</span>
        </div>

        {/* Full comparison link */}
        <div className="text-center mt-6">
          <Link href="/pricing">
            <button className="text-sm font-semibold hover:underline transition-colors" style={{ color: "#1A237E" }}>
              {t("عرض جدول المقارنة الكامل", "Voir le tableau comparatif complet", "View Full Comparison Table")} →
            </button>
          </Link>
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
      <div className="absolute start-0 top-full pt-1 opacity-0 invisible group-hover/admin:opacity-100 group-hover/admin:visible transition-all duration-200 z-50" style={{ minWidth: "320px" }}>
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
              className={`flex items-center gap-3 w-full text-end px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="absolute -top-32 -end-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "#1A237E", filter: "blur(100px)" }} />
          <div className="absolute -bottom-20 -start-20 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "#FF6D00", filter: "blur(80px)" }} />
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
                    <Sparkles className="w-5 h-5 ms-2" />
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
                <div className="absolute -top-5 -end-5 rounded-xl px-4 py-2.5 shadow-lg bg-white border border-gray-100" style={{ animation: "float 6s ease-in-out infinite" }}>
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
                <div className="absolute -bottom-5 -start-5 rounded-xl px-4 py-2.5 shadow-lg bg-white border border-gray-100" style={{ animation: "float 6s ease-in-out infinite 3s" }}>
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
                <div className="absolute top-8 -start-8 rounded-xl px-3 py-2 shadow-lg bg-white border border-gray-100" style={{ animation: "float 5s ease-in-out infinite 1.5s" }}>
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
                      <div className="absolute -top-3 start-5 rtl:left-auto rtl:end-5">
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
                <Sparkles className="w-5 h-5 ms-2" style={{ color: "#FF6D00" }} />
                {t("استكشف جميع الأدوات", "Explorer tous les outils", "Explore All Tools")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 3 KILLER FEATURES SECTION (CRO) ===== */}
      <KillerFeaturesSection t={t} />

      {/* ===== TIME SAVINGS CALCULATOR (CRO) ===== */}
      <TimeSavingsCalculator t={t} />

      {/* ===== FAQ SECTION (CRO) ===== */}
      <FAQSection t={t} />

      {/* ===== MINI PRICING SECTION (CRO) ===== */}
      <MiniPricingSection t={t} />

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
                              className="absolute top-3 end-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                              style={{ background: cover.badgeColor }}
                            >
                              {t(cover.badgeAr, cover.badgeFr, cover.badgeEn)}
                            </div>
                          )}
                          {/* Duration pill */}
                          {course.duration && (
                            <div className="absolute bottom-3 start-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
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
                              <span className="text-gray-600 font-semibold me-1">{rating}</span>
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

      {/* ===== TESTIMONIALS SECTION - HYBRID TRUST WALL WITH REAL PHOTOS ===== */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: "#FFFFFF" }} dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 start-0 w-72 h-72 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #1A237E, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full opacity-[0.02]" style={{ background: "radial-gradient(circle, #FF6D00, transparent 70%)", transform: "translate(30%, 30%)" }} />
        
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

          {/* 3-Column Hybrid Trust Wall Grid */}
          {(() => {
            const coursePhotos = [
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-1_cc210bfe.jpg",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-2_7da659dd.jpg",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-7_fc279829.webp",
            ];
            const accentColors = ["#1A237E", "#FF6D00", "#1565C0"];
            const avatarPhotos = [
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-3_beade4d9.jpg",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-5_1ccdb6df.jpg",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-6_e21e67db.jpg",
            ];
            const staticTestimonials = [
              {
                review: { id: -1, rating: 5, comment: t(
                  "كنت أقضي ساعتين في تحضير الجذاذة الواحدة. بعد EDUGPT، أنجز نفس العمل في 5 دقائق بجودة تفوق ما كنت أفعله يدوياً. هذه ثورة حقيقية في عالم التعليم!",
                  "Je passais deux heures à préparer une seule fiche. Avec EDUGPT, je fais le même travail en 5 minutes avec une qualité supérieure. C'est une vraie révolution!",
                  "I used to spend two hours preparing a single lesson plan. With EDUGPT, I do the same work in 5 minutes with superior quality. A true revolution!"
                ), createdAt: new Date() },
                user: { id: -1, name: t("الأستاذة سمر", "Samar", "Samar"), arabicName: "الأستاذة سمر" },
                course: { id: -1, titleAr: "EDUGPT" },
                _jobTitle: t("أستاذة تعليم ابتدائي", "Enseignante du primaire", "Primary School Teacher"),
              },
              {
                review: { id: -2, rating: 5, comment: t(
                  "التقييم الفوري غيّر طريقتي في متابعة تلاميذي. أستطيع الآن معرفة مستوى كل تلميذ بدقة وتقديم دعم مخصص له. أنصح كل زملائي بتجربة هذه الأدوات.",
                  "L'évaluation instantanée a changé ma façon de suivre mes élèves. Je peux maintenant connaître le niveau de chaque élève avec précision et offrir un soutien personnalisé.",
                  "Instant assessment changed how I track my students. I can now know each student's level precisely and offer personalized support."
                ), createdAt: new Date() },
                user: { id: -2, name: t("الأستاذة هاجر", "Hajer", "Hajer"), arabicName: "الأستاذة هاجر" },
                course: { id: -2, titleAr: t("التصحيح الذكي", "Correction intelligente", "Smart Grading") },
                _jobTitle: t("خبيرة تربوية", "Experte pédagogique", "Educational Expert"),
              },
              {
                review: { id: -3, rating: 5, comment: t(
                  "دورة توظيف الذكاء الاصطناعي في التدريس كانت نقطة تحوّل حقيقية. المحتوى عملي، المدربون خبراء، والأدوات ثورية. أفضل استثمار في مسيرتي المهنية.",
                  "La formation sur l'intégration de l'IA dans l'enseignement a été un vrai tournant. Le contenu est pratique, les formateurs sont experts. Le meilleur investissement de ma carrière.",
                  "The AI integration in teaching course was a real turning point. Practical content, expert trainers. The best investment in my career."
                ), createdAt: new Date() },
                user: { id: -3, name: t("الأستاذة سامية", "Sameh", "Sameh"), arabicName: "الأستاذة سامية" },
                course: { id: -3, titleAr: t("الدورات التدريبية", "Formations", "Training Courses") },
                _jobTitle: t("أستاذة تعليم ثانوي", "Enseignante du secondaire", "Secondary School Teacher"),
              },
            ];
            const items = (featuredReviews && featuredReviews.length > 0 ? featuredReviews : staticTestimonials) as any[];
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {items.map((item: any, i: number) => {
                  const accentColor = accentColors[i % 3];
                  const displayName = item.user?.arabicName || item.user?.name || t("مشارك", "Participant", "Participant");
                  const initial = displayName.charAt(0);
                  const courseName = item.course?.titleAr || "";
                  const jobTitle = item._jobTitle || t("مشارك في الدورة", "Participant au cours", "Course participant");
                  const photoUrl = coursePhotos[i % coursePhotos.length];
                  const avatarUrl = avatarPhotos[i % avatarPhotos.length];
                  
                  return (
                    <div
                      key={item.review.id}
                      className="group relative bg-white overflow-hidden transition-all duration-500 ease-out hover:-translate-y-3 cursor-default"
                      style={{
                        borderRadius: "20px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.05), 0 10px 48px rgba(0,0,0,0.03)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.06), 0 0 0 2px ${accentColor}25`;
                        e.currentTarget.style.borderColor = `${accentColor}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.05), 0 10px 48px rgba(0,0,0,0.03)";
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                      }}
                    >
                      {/* Course Photo - Top Section (3:2 Aspect Ratio) */}
                      <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
                        <img
                          src={photoUrl}
                          alt={t("صورة من الدورة التدريبية", "Photo de la formation", "Training course photo")}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Gradient overlay at bottom of image */}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 40%, transparent 60%)" }} />
                        {/* Course badge on image */}
                        {courseName && (
                          <div className="absolute bottom-3 end-3">
                            <span 
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md"
                              style={{ 
                                background: "rgba(255,255,255,0.92)", 
                                color: accentColor,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                              }}
                            >
                              <Sparkles className="w-3 h-3" />
                              {courseName}
                            </span>
                          </div>
                        )}
                        {/* Decorative accent line */}
                        <div 
                          className="absolute bottom-0 start-0 end-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80, ${accentColor}40)` }} 
                        />
                      </div>

                      {/* Card Content */}
                      <div className="relative p-7 lg:p-8">
                        {/* Avatar overlapping the image-content boundary */}
                        <div className="absolute -top-8 end-7" style={{ direction: "ltr" }}>
                          <div 
                            className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ 
                              border: "3px solid #FFFFFF",
                              boxShadow: `0 4px 16px ${accentColor}30`,
                            }}
                          >
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Quote icon */}
                        <div className="mb-4 mt-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}>
                            <Quote className="w-5 h-5 opacity-50" style={{ color: accentColor }} />
                          </div>
                        </div>

                        {/* Review Text - Almarai 16px */}
                        <p 
                          className="text-gray-600 leading-[1.9] mb-5" 
                          style={{ 
                            fontFamily: "'Almarai', 'Cairo', sans-serif", 
                            fontSize: "16px",
                            lineHeight: "1.9",
                          }}
                        >
                          {item.review.comment}
                        </p>

                        {/* 5 Golden Stars */}
                        <div className="flex gap-1 mb-6">
                          {Array.from({ length: 5 }).map((_: any, s: number) => (
                            <Star 
                              key={s} 
                              className="w-[17px] h-[17px] fill-current" 
                              style={{ 
                                color: s < (item.review.rating || 5) ? "#F59E0B" : "#E5E7EB",
                              }} 
                            />
                          ))}
                        </div>

                        {/* Divider + Teacher Profile */}
                        <div className="border-t border-gray-100 pt-5">
                          <div className="flex items-center gap-3.5">
                            {/* Small circular avatar for identity */}
                            <div 
                              className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                              style={{ 
                                border: `2px solid ${accentColor}20`,
                              }}
                            >
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
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
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Real Course Photos Gallery Strip */}
          <div className="mt-16 mb-8">
            <p className="text-center text-gray-400 text-sm mb-6 font-medium" style={{ fontFamily: "'Almarai', sans-serif" }}>
              {t("لقطات حقيقية من دوراتنا التدريبية", "Photos réelles de nos formations", "Real photos from our training courses")}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {[
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-4_f67039c1.jpg",
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-3_beade4d9.jpg",
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-5_1ccdb6df.jpg",
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-photo-6_e21e67db.jpg",
              ].map((url, idx) => (
                <div key={idx} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden group/thumb cursor-pointer transition-transform duration-300 hover:scale-105" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-12 py-8 px-6 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(26,35,126,0.03), rgba(21,101,192,0.02))" }}>
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
            انضم إلى أكثر من 5000 مدرّس تونسي يستخدمون Leader Academy لتحويل تجربتهم التدريسية
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/assistant">
              <Button size="lg" className="text-white font-bold px-10 py-4 text-lg rounded-xl shadow-2xl hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 8px 32px rgba(255,109,0,0.4)" }}>
                <Brain className="w-5 h-5 ms-2" />
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

      {/* ===== PREMIUM FOOTER ===== */}
      <footer className="text-white relative overflow-hidden" dir="rtl" style={{ background: "linear-gradient(165deg, #050D2E 0%, #0A1847 35%, #0D1B5E 65%, #101F6A 100%)" }}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 start-1/4 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 end-1/4 w-80 h-80 bg-blue-400/[0.04] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 start-0 w-64 h-64 bg-purple-500/[0.02] rounded-full blur-[80px]" />
        </div>

        {/* Top Decorative Line */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #F97316 20%, #FB923C 50%, #F97316 80%, transparent 100%)" }} />

        {/* Main Footer Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
            
            {/* Column 1: Brand Identity */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-orange-400/20 to-blue-400/20 rounded-2xl blur-sm" />
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png" alt="Leader Academy" className="relative h-12 w-auto" />
                </div>
                <div>
                  <p className="font-bold text-xl tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>Leader Academy</p>
                  <p className="text-orange-300/80 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("نحو تعليم رقمي متميز", "Vers un enseignement num\u00e9rique d'excellence", "Towards excellent digital education")}</p>
                </div>
              </div>
              <p className="text-blue-200/50 text-sm leading-[1.8] mb-7" style={{ fontFamily: "'Almarai', sans-serif" }}>
                {t(
                  "Leader Academy: رائدك في توظيف الذكاء الاصطناعي لتطوير الأداء التربوي. منصة معتمدة مخصصة للمعلمين التونسيين.",
                  "Leader Academy: votre r\u00e9f\u00e9rence pour l'int\u00e9gration de l'IA dans le d\u00e9veloppement p\u00e9dagogique.",
                  "Leader Academy: Your leader in leveraging AI for educational performance development."
                )}
              </p>
              {/* Social Media Bar */}
              <div className="flex items-center gap-3">
                {[
                  { href: "https://www.facebook.com/leaderacademy.tn", label: "Facebook", icon: <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { href: "https://www.youtube.com/channel/UCEZWPqq_ONwn-CzD_GwLuVg", label: "YouTube", icon: <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                  { href: "https://www.linkedin.com/company/leaderacademy-tn", label: "LinkedIn", icon: <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { href: "https://www.instagram.com/leaderacademytn/", label: "Instagram", icon: <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-blue-300/70 hover:text-orange-300 hover:bg-white/[0.1] hover:border-orange-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10" aria-label={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-orange-600" />
                <h4 className="font-bold text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t("روابط سريعة", "Liens rapides", "Quick Links")}
                </h4>
              </div>
              <ul className="space-y-3.5">
                {[
                  { href: "/", labelAr: "الرئيسية", labelFr: "Accueil", labelEn: "Home" },
                  { href: "/teacher-tools", labelAr: "أدواتنا الذكية", labelFr: "Nos outils IA", labelEn: "Our AI Tools" },
                  { href: "/courses", labelAr: "الدورات التدريبية", labelFr: "Formations", labelEn: "Courses" },
                  { href: "/about", labelAr: "من نحن", labelFr: "\u00c0 propos", labelEn: "About Us" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/50 text-sm hover:text-orange-300 transition-all duration-200 flex items-center gap-2.5 group" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 -me-1 group-hover:me-0 text-orange-400" />
                      <span className="group-hover:translate-x-[-4px] transition-transform duration-200">{t(link.labelAr, link.labelFr, link.labelEn)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support & Contact */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                <h4 className="font-bold text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t("الدعم والتواصل", "Support & Contact", "Support & Contact")}
                </h4>
              </div>
              <ul className="space-y-3.5 mb-6">
                {[
                  { href: "/contact", labelAr: "اتصل بنا", labelFr: "Contactez-nous", labelEn: "Contact Us" },
                  { href: "/privacy", labelAr: "سياسة الخصوصية", labelFr: "Politique de confidentialit\u00e9", labelEn: "Privacy Policy" },
                  { href: "/terms", labelAr: "شروط الاستخدام", labelFr: "Conditions d'utilisation", labelEn: "Terms of Use" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/50 text-sm hover:text-orange-300 transition-all duration-200 flex items-center gap-2.5 group" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 -me-1 group-hover:me-0 text-orange-400" />
                      <span className="group-hover:translate-x-[-4px] transition-transform duration-200">{t(link.labelAr, link.labelFr, link.labelEn)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Contact Info */}
              <div className="space-y-3 pt-2 border-t border-white/[0.05]">
                <a href="mailto:leaderacademy216@gmail.com" className="flex items-center gap-2.5 text-blue-200/40 hover:text-orange-300 transition-colors text-xs group">
                  <Mail className="w-3.5 h-3.5 text-blue-300/40 group-hover:text-orange-300" />
                  <span dir="ltr">leaderacademy216@gmail.com</span>
                </a>
                <div className="flex items-center gap-2.5 text-blue-200/40 text-xs">
                  <Phone className="w-3.5 h-3.5 text-blue-300/40" />
                  <span dir="ltr">52 339 339 / 99 997 729</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-200/40 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-blue-300/40" />
                  <span style={{ fontFamily: "'Almarai', sans-serif" }}>{t("تونس، الجمهورية التونسية", "Tunisie", "Tunisia")}</span>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-yellow-500" />
                <h4 className="font-bold text-white text-sm tracking-wide" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t("النشرة الذكية", "Newsletter intelligente", "Smart Newsletter")}
                </h4>
              </div>
              <p className="text-blue-200/40 text-sm leading-relaxed mb-5" style={{ fontFamily: "'Almarai', sans-serif" }}>
                {t(
                  "اشترك في نشرتنا الذكية واحصل على أحدث أدوات الذكاء الاصطناعي والنصائح البيداغوجية مباشرة.",
                  "Abonnez-vous \u00e0 notre newsletter et recevez les derniers outils IA et conseils p\u00e9dagogiques.",
                  "Subscribe to our smart newsletter and get the latest AI tools and pedagogical tips."
                )}
              </p>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/30" />
                    <input
                      type="email"
                      placeholder={t("بريدك الإلكتروني", "Votre email", "Your email")}
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pe-10 ps-4 py-3 text-sm text-white placeholder:text-blue-300/30 focus:outline-none focus:border-orange-400/40 focus:bg-white/[0.08] transition-all duration-300"
                      style={{ fontFamily: "'Almarai', sans-serif" }}
                      dir="rtl"
                    />
                  </div>
                  <button className="px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/20 flex-shrink-0" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", fontFamily: "'Almarai', sans-serif" }}>
                    <Send className="w-4 h-4 rotate-180" />
                    {t("اشترك", "S'abonner", "Subscribe")}
                  </button>
                </div>
              </div>
              {/* Trust Badge */}
              <div className="mt-6 flex items-center gap-2 text-blue-200/30 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
                <ShieldCheck className="w-4 h-4 text-green-400/50" />
                <span>{t("نحترم خصوصيتك - لا رسائل مزعجة", "Nous respectons votre vie priv\u00e9e", "We respect your privacy")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Separator Bar */}
        <div className="relative border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: Social proof */}
              <div className="flex items-center gap-6 text-blue-200/30 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400/50" />
                  <span>{t("+5000 مدرّس تونسي", "+5000 enseignants tunisiens", "+5000 Tunisian teachers")}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400/50" />
                  <span>{t("تقييم 4.9/5", "Note 4.9/5", "Rating 4.9/5")}</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400/50" />
                  <span>{t("12 برنامج معتمد", "12 programmes certifi\u00e9s", "12 certified programs")}</span>
                </div>
              </div>
              {/* Right: WhatsApp CTA */}
              <a href="https://wa.me/21652339339" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400/70 hover:text-green-300 hover:bg-green-500/15 transition-all duration-300 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t("تواصل معنا عبر واتساب", "Contactez-nous via WhatsApp", "Contact us via WhatsApp")}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06]" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-blue-300/40 text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
                {t(
                  "\u00a9 2026 Leader Academy. جميع الحقوق محفوظة. سجل تجاري: B08107512016",
                  "\u00a9 2026 Leader Academy. Tous droits r\u00e9serv\u00e9s. RC: B08107512016",
                  "\u00a9 2026 Leader Academy. All rights reserved. CR: B08107512016"
                )}
              </p>
              <div className="flex items-center gap-5 text-xs">
                {/* Made with AI in Tunisia Badge */}
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/20 bg-orange-500/[0.06]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400/70" />
                  <span className="text-orange-300/70" style={{ fontFamily: "'Almarai', sans-serif" }}>{t("صنع بذكاء اصطناعي في تونس", "Con\u00e7u avec l'IA en Tunisie", "Made with AI in Tunisia")}</span>
                  <span>🇹🇳</span>
                </span>
                <a href="https://leaderacademy.school" target="_blank" rel="noopener noreferrer" className="text-blue-300/40 hover:text-orange-300 transition-colors flex items-center gap-1.5 hidden sm:flex">
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
