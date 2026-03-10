import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, Loader2, UserPlus,
  MessageSquare, ClipboardCheck, Globe, Brain, Sparkles,
  ChevronLeft, ChevronDown, Star, Zap, Shield, ArrowLeft, Menu, X,
  Bot, Search, FileEdit, Palette, BarChart3, LayoutDashboard,
  BadgeCheck, ShieldCheck, type LucideIcon, DollarSign, Info,
  Megaphone, Settings, ScanLine, FileCheck, Store, Navigation, MapPin, Play, Target, Clock, Theater, Building2, Briefcase, FileText,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
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
];

// Certificate links grouped in a dropdown
const CERT_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon; descAr: string; descFr: string; descEn: string; authOnly: boolean }[] = [
  { href: "/my-certificates", labelAr: "شهاداتي", labelFr: "Mes certificats", labelEn: "My Certificates", icon: BadgeCheck, descAr: "عرض وتحميل شهاداتك المكتسبة", descFr: "Voir et télécharger vos certificats", descEn: "View and download your certificates", authOnly: true },
  { href: "/verify", labelAr: "التحقق من شهادة", labelFr: "Vérifier un certificat", labelEn: "Verify Certificate", icon: ShieldCheck, descAr: "التحقق من صحة شهادة برقمها", descFr: "Vérifier l'authenticité d'un certificat", descEn: "Verify a certificate by its number", authOnly: false },
];

const NAV_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; adminOnly: boolean; authOnly: boolean; icon: LucideIcon }[] = [
  { href: "/#programs", labelAr: "برامجنا التدريبية", labelFr: "Nos formations", labelEn: "Training Programs", adminOnly: false, authOnly: false, icon: Megaphone },
  { href: "/contact", labelAr: "عن الأكاديمية", labelFr: "À propos", labelEn: "About", adminOnly: false, authOnly: false, icon: Info },
  { href: "/pricing", labelAr: "الأسعار", labelFr: "Tarifs", labelEn: "Pricing", adminOnly: false, authOnly: false, icon: DollarSign },
];

const FEATURES = [
  {
    icon: Brain,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    titleAr: "ذكاء اصطناعي تربوي",
    titleFr: "IA pédagogique",
    descAr: "مساعد ذكي يُعدّ الجذاذات والمخططات وفق البرامج الرسمية التونسية 2026",
    descFr: "Assistant IA qui prépare fiches et plannings selon les programmes officiels tunisiens 2026",
  },
  {
    icon: ClipboardCheck,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50",
    titleAr: "تقييم فوري للمكتسبات",
    titleFr: "Évaluation instantanée",
    descAr: "اختبارات تفاعلية ذكية مع تقارير مفصلة وشهادات معتمدة",
    descFr: "Tests interactifs intelligents avec rapports détaillés et certificats accrédités",
  },
  {
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
    titleAr: "توليد المحتوى التعليمي",
    titleFr: "Génération de contenu",
    descAr: "إنشاء مذكرات الدروس، التوزيعات السنوية، وورقات التقييم في ثوانٍ",
    descFr: "Créez fiches de cours, plannings annuels et feuilles d'évaluation en secondes",
  },
  {
    icon: Shield,
    color: "from-green-500 to-teal-500",
    bg: "bg-green-50",
    titleAr: "مصادقة رسمية",
    titleFr: "Certification officielle",
    descAr: "شهادات معتمدة من Leader Academy تُثبت كفاءتك في توظيف الذكاء الاصطناعي",
    descFr: "Certificats accrédités par Leader Academy prouvant votre maîtrise de l'IA",
  },
];

const STATS = [
  { value: "+500", labelAr: "مدرّس مُكوَّن", labelFr: "Enseignants formés" },
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
          {t("انضم إلى أكثر من 500 مدرس تونسي يطوّرون مهاراتهم معنا", "Rejoignez plus de 500 enseignants tunisiens", "Join 500+ Tunisian teachers")}
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
          <span className="flex items-center gap-2"><Users className="w-4 h-4" />{t("+500 مدرس تونسي", "+500 enseignants", "+500 teachers")}</span>
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

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ background: "#1A237E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png"
                  alt="Leader Academy"
                  className="h-10 w-auto"
                />
                <div className="hidden sm:block">
                  <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "Cairo, sans-serif" }}>Leader Academy</p>
                  <p className="text-blue-200 text-xs">نحو تعليم رقمي متميز</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* EDUGPT Dropdown - hover activated */}
              <div className="relative group">
                <Link href="/assistant">
                  <button className="flex items-center gap-1.5 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.4)" }}>
                    <Sparkles className="w-4 h-4 text-orange-300" />
                    EDUGPT
                    <ChevronDown className="w-3.5 h-3.5 text-orange-300 transition-transform group-hover:rotate-180" />
                  </button>
                </Link>
                {/* Hover dropdown */}
                <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ minWidth: "320px" }}>
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" dir="rtl" style={{ maxHeight: "calc(100vh - 60px)" }}>
                    <div className="px-3 py-2 border-b border-gray-100 sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                      <p className="text-white font-bold text-xs flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-orange-300" />
                        {t("أدوات الذكاء الاصطناعي التربوي", "Outils IA éducatifs", "Educational AI Tools")}
                      </p>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
                    {AI_TOOLS.map((tool, idx) => {
                      const IconComp = tool.icon;
                      return (
                        <Link key={tool.href} href={tool.href}>
                          <div className={`flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors ${idx < AI_TOOLS.length - 1 ? "border-b border-gray-50" : ""}`}>
                            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                              <IconComp className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-900 leading-tight">{language === "fr" ? tool.labelFr : language === "en" ? tool.labelEn : tool.labelAr}</p>
                              <p className="text-[10px] text-gray-500 leading-tight">{language === "fr" ? tool.descFr : language === "en" ? tool.descEn : tool.descAr}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other nav links */}
              {NAV_LINKS.filter(link => {
                if (link.adminOnly && user?.role !== "admin") return false;
                if (link.authOnly && !user) return false;
                return true;
              }).map((link) => {
                const isActive = location === link.href || (link.href !== "/" && !link.href.startsWith("/#") && location.startsWith(link.href));
                const isAnchor = link.href.startsWith("/#");
                const handleAnchorClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  const anchorId = link.href.replace("/#", "");
                  if (location === "/") {
                    document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = link.href;
                  }
                };
                if (isAnchor) {
                  return (
                    <a key={link.href} href={link.href} onClick={handleAnchorClick}>
                      <button className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-blue-100 hover:text-white hover:bg-white/10`}>
                        {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                      </button>
                    </a>
                  );
                }
                return (
                  <Link key={link.href} href={link.href}>
                    <button className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                    }`}>
                      {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-400 rounded-full" />}
                    </button>
                  </Link>
                );
              })}

              {/* Certificates Dropdown - hover activated */}
              <div className="relative group/cert">
                <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  ['/my-certificates', '/verify'].includes(location) ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}>
                  <Award className="w-4 h-4" />
                  {t("الشهادات", "Certificats", "Certificates")}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/cert:rotate-180" />
                  {['/my-certificates', '/verify'].includes(location) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-400 rounded-full" />}
                </button>
                {/* Hover dropdown */}
                <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover/cert:opacity-100 group-hover/cert:visible transition-all duration-200 z-50" style={{ minWidth: "280px" }}>
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" dir="rtl">
                    <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                      <p className="text-white font-bold text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-300" />
                        {t("الشهادات والتحقق", "Certificats & Vérification", "Certificates & Verification")}
                      </p>
                    </div>
                    {CERT_LINKS.filter(cl => !cl.authOnly || user).map((cl, idx) => {
                      const CIcon = cl.icon;
                      return (
                        <Link key={cl.href} href={cl.href}>
                          <div className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${idx < CERT_LINKS.filter(c => !c.authOnly || user).length - 1 ? "border-b border-gray-50" : ""}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                              <CIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-900">{language === "fr" ? cl.labelFr : language === "en" ? cl.labelEn : cl.labelAr}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{language === "fr" ? cl.descFr : language === "en" ? cl.descEn : cl.descAr}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Career Hub Dropdown */}
              {user && (
                <div className="relative group/career">
                  <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    ['/jobs', '/my-applications', '/showcase', '/my-portfolio', '/school-portal', '/career-messages', '/teacher-analytics'].includes(location) ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}>
                    <Briefcase className="w-4 h-4" />
                    {t("المسار المهني", "Carri\u00e8re", "Career")}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/career:rotate-180" />
                    {['/jobs', '/my-applications'].includes(location) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-400 rounded-full" />}
                  </button>
                  <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover/career:opacity-100 group-hover/career:visible transition-all duration-200 z-50" style={{ minWidth: "300px" }}>
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" dir="rtl">
                      <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-orange-300" />
                          {t("المسار المهني وفرص العمل", "Carri\u00e8re & Emploi", "Career & Jobs")}
                        </p>
                      </div>
                      <Link href="/jobs">
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-blue-600 to-indigo-600">
                            <Briefcase className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900">{t("فرص العمل", "Offres d'emploi", "Job Board")}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t("تصفح عروض العمل في المدارس الشريكة", "Parcourir les offres des \u00e9coles partenaires", "Browse partner school listings")}</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/my-applications">
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-teal-500 to-emerald-600">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900">{t("طلباتي", "Mes candidatures", "My Applications")}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t("تتبع حالة طلبات التوظيف", "Suivre l'\u00e9tat de vos candidatures", "Track application status")}</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/showcase">
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-purple-500 to-pink-600">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900">{t("دليل الكفاءات", "R\u00e9pertoire des talents", "Talent Directory")}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t("اكتشف المعلمين المعتمدين", "D\u00e9couvrir les enseignants certifi\u00e9s", "Discover certified teachers")}</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/my-portfolio">
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-amber-500 to-orange-600">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900">{t("ملفي المهني", "Mon portfolio", "My Portfolio")}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t("إدارة ملفك المهني العام", "G\u00e9rer votre profil professionnel", "Manage your public portfolio")}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin/Management Dropdown - visible for authenticated users */}
              {user && (
                <AdminConsoleDropdown language={language} t={t} location={location} isAdmin={user.role === 'admin'} />
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-white/10 h-8 px-2 gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-xs">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`gap-2 cursor-pointer ${language === lang.code ? "bg-primary/10 font-semibold" : ""}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {user && <NotificationBell />}

              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {!user.registrationCompleted && (
                    <Link href="/complete-registration">
                      <Button size="sm" className="h-8 px-3 text-xs" style={{ background: "#FF6D00" }}>
                        <UserPlus className="w-3.5 h-3.5 ml-1" />
                        {t("إكمال التسجيل", "Inscription", "Complete")}
                      </Button>
                    </Link>
                  )}
                  <Link href="/my-courses">
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-white/30 text-white hover:bg-white/10 bg-transparent">
                      {t("دوراتي", "Mes cours", "My Courses")}
                    </Button>
                  </Link>
                  <Link href="/my-portfolio">
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-white/30 text-white hover:bg-white/10 bg-transparent">
                      {t("ملفي المهني", "Mon portfolio", "My Portfolio")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm" className="h-8 px-4 text-sm font-semibold" style={{ background: "#FF6D00", color: "white" }}>
                    {t("تسجيل الدخول", "Se connecter", "Sign In")}
                  </Button>
                </a>
              )}

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden text-white p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/20 py-3 space-y-1">
              {/* EDUGPT Section */}
              <div className="px-4 py-2">
                <p className="text-orange-300 font-bold text-sm flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  {t("أدوات الذكاء الاصطناعي", "Outils IA", "AI Tools")}
                </p>
                <div className="space-y-1 mr-4">
                  {AI_TOOLS.map((tool) => {
                    const IconComp = tool.icon;
                    return (
                      <Link key={tool.href} href={tool.href}>
                        <button
                          className="flex items-center gap-3 w-full text-right text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2.5 rounded-lg text-sm font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,109,0,0.2)" }}>
                            <IconComp className="w-4 h-4 text-orange-300" />
                          </div>
                          <div>
                            <span className="block">{language === "fr" ? tool.labelFr : language === "en" ? tool.labelEn : tool.labelAr}</span>
                            <span className="block text-xs text-blue-300 mt-0.5">{language === "fr" ? tool.descFr : language === "en" ? tool.descEn : tool.descAr}</span>
                          </div>
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-white/10 my-2" />
              {/* Other Links with icons */}
              {NAV_LINKS.filter(link => {
                if (link.adminOnly && user?.role !== "admin") return false;
                if (link.authOnly && !user) return false;
                return true;
              }).map((link) => {
                const NavIcon = link.icon;
                const isAnchor = link.href.startsWith("/#");
                const isActive = !isAnchor && (location === link.href || (link.href !== "/" && location.startsWith(link.href)));
                const handleMobileAnchorClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const anchorId = link.href.replace("/#", "");
                  if (location === "/") {
                    setTimeout(() => document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" }), 300);
                  } else {
                    window.location.href = link.href;
                  }
                };
                if (isAnchor) {
                  return (
                    <a key={link.href} href={link.href} onClick={handleMobileAnchorClick}>
                      <button
                        className="flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/10"
                      >
                        <NavIcon className="w-4 h-4 flex-shrink-0" />
                        {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                      </button>
                    </a>
                  );
                }
                return (
                  <Link key={link.href} href={link.href}>
                    <button
                      className={`flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <NavIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-300" : ""}`} />
                      {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                    </button>
                  </Link>
                );
              })}
              {/* Certificates section in mobile */}
              <div className="border-t border-white/10 my-2" />
              <div className="px-4 py-2">
                <p className="text-orange-300 font-bold text-xs flex items-center gap-2 mb-2">
                  <Award className="w-3.5 h-3.5" />
                  {t("الشهادات", "Certificats", "Certificates")}
                </p>
                <div className="space-y-1 mr-4">
                  {CERT_LINKS.filter(cl => !cl.authOnly || user).map((cl) => {
                    const CIcon = cl.icon;
                    const isActive = location === cl.href;
                    return (
                      <Link key={cl.href} href={cl.href}>
                        <button
                          className={`flex items-center gap-3 w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <CIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-300" : ""}`} />
                          {language === "fr" ? cl.labelFr : language === "en" ? cl.labelEn : cl.labelAr}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
              {/* Career Hub section in mobile */}
              {user && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <div className="px-4 py-2">
                    <p className="text-orange-300 font-bold text-xs flex items-center gap-2 mb-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      {t("المسار المهني", "Carri\u00e8re", "Career")}
                    </p>
                    <div className="space-y-1 mr-4">
                      {[
                        { href: "/jobs", icon: Briefcase, labelAr: "فرص العمل", labelFr: "Offres d'emploi", labelEn: "Job Board" },
                        { href: "/my-applications", icon: FileText, labelAr: "طلباتي", labelFr: "Mes candidatures", labelEn: "My Applications" },
                        { href: "/showcase", icon: Users, labelAr: "دليل الكفاءات", labelFr: "R\u00e9pertoire", labelEn: "Directory" },
                        { href: "/my-portfolio", icon: Star, labelAr: "ملفي المهني", labelFr: "Mon portfolio", labelEn: "My Portfolio" },
                      ].map((item) => {
                        const CIcon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <button
                              className={`flex items-center gap-3 w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <CIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-300" : ""}`} />
                              {language === "fr" ? item.labelFr : language === "en" ? item.labelEn : item.labelAr}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              {/* Management section in mobile */}
              {user && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <div className="px-4 py-2">
                    <p className="text-blue-200 font-bold text-xs flex items-center gap-2 mb-2">
                      <Settings className="w-3.5 h-3.5" />
                      {t("الإدارة", "Administration", "Management")}
                    </p>
                    <div className="space-y-1 mr-4">
                      <AdminMobileLink setMobileMenuOpen={setMobileMenuOpen} location={location} language={language} t={t} isAdmin={user?.role === 'admin'} />
                    </div>
                  </div>
                </>
              )}
              {/* Quick actions */}
              <div className="flex gap-2 px-4 pt-2">
                <Link href="/assistant" className="flex-1">
                  <Button size="sm" className="w-full text-xs" style={{ background: "#FF6D00" }}>
                    <MessageSquare className="w-3.5 h-3.5 ml-1" />
                    EDUGPT
                  </Button>
                </Link>
                <Link href="/evaluate-fiche" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs border-white/30 text-white bg-transparent">
                    <ClipboardCheck className="w-3.5 h-3.5 ml-1" />
                    {t("تقييم", "Évaluer", "Assess")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #1565C0 40%, #0D47A1 100%)", minHeight: "90vh" }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          {/* Glowing orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10" style={{ background: "#FF6D00", filter: "blur(80px)" }} />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "#42A5F5", filter: "blur(60px)" }} />
          {/* Floating particles */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-orange-400 opacity-60 animate-pulse" />
          <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-60 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 rounded-full bg-white opacity-30 animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text content */}
            <div className="text-white space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.4)", color: "#FFB74D" }}>
                <Sparkles className="w-4 h-4" />
                <span>منصة الذكاء الاصطناعي التربوي #1 في تونس</span>
              </div>

              {/* Main headline */}
              <div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
                  <span className="text-white">Leader Academy:</span>
                  <br />
                  <span style={{ color: "#FF6D00" }}>نقود ثورة</span>
                  <br />
                  <span className="text-blue-200">الذكاء الاصطناعي</span>
                  <br />
                  <span className="text-white text-3xl lg:text-4xl">في التعليم بتونس</span>
                </h1>
                <p className="text-blue-100 text-lg lg:text-xl leading-relaxed max-w-xl">
                  منصتك الشاملة لتصميم الدروس الذكية، تقييم المكتسبات، وتطوير مهارات المستقبل.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/assistant">
                  <Button
                    size="lg"
                    className="text-white font-bold px-8 py-4 text-base rounded-xl shadow-2xl hover:scale-105 transition-transform"
                    style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)", boxShadow: "0 8px 32px rgba(255,109,0,0.4)" }}
                  >
                    <Brain className="w-5 h-5 ml-2" />
                    جرّب EDUGPT الآن
                  </Button>
                </Link>
                <button
                  onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 text-white font-semibold px-8 py-4 text-base rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all"
                >
                  <span>اكتشف دوراتنا</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {["🧑‍🏫", "👩‍🏫", "🧑‍💻", "👩‍💻"].map((emoji, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-base" style={{ background: "#1565C0" }}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-blue-200 text-sm">+500 مدرّس يثق بنا</p>
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="rounded-2xl p-6 shadow-2xl" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {/* Header bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 h-6 rounded-md mx-2" style={{ background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Chat simulation */}
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FF6D00" }}>
                        <span className="text-white text-xs font-bold">م</span>
                      </div>
                      <div className="rounded-xl rounded-tr-sm px-3 py-2 text-sm text-white max-w-xs" style={{ background: "rgba(255,255,255,0.1)" }}>
                        أعدّ لي جذاذة درس الكسور للسنة الخامسة ابتدائي
                      </div>
                    </div>
                    <div className="flex gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1565C0, #0D47A1)" }}>
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="rounded-xl rounded-tl-sm px-3 py-2 text-sm text-white max-w-xs" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.3)" }}>
                        <p className="font-semibold mb-1">✅ جذاذة الكسور — السنة 5</p>
                        <p className="text-blue-200 text-xs">الكفاءة: يُعبّر عن كسر بسيط...</p>
                        <p className="text-blue-200 text-xs">المدة: 45 دقيقة</p>
                        <div className="mt-2 flex gap-1">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.15)" }}>📄 PDF</span>
                          <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.15)" }}>📝 Word</span>
                        </div>
                      </div>
                    </div>
                    {/* Typing indicator */}
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <span className="text-white text-xs">🇹🇳</span>
                      </div>
                      <div className="rounded-xl px-3 py-2 flex items-center gap-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                  {/* Input bar */}
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <span className="text-blue-200 text-sm flex-1">اكتب طلبك هنا...</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FF6D00" }}>
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 rounded-xl px-3 py-2 shadow-lg" style={{ background: "white" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">متوافق مع</p>
                      <p className="text-xs text-gray-500">البرامج 2026</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-xl px-3 py-2 shadow-lg" style={{ background: "white" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇹🇳</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">صُمِّم لتونس</p>
                      <p className="text-xs text-gray-500">المنهج الرسمي</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0 80L1440 80L1440 20C1200 70 960 0 720 30C480 60 240 10 0 40L0 80Z" fill="white" />
          </svg>
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

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20" style={{ background: "#F8F9FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ background: "rgba(26,35,126,0.08)", color: "#1A237E" }}>
              <Sparkles className="w-4 h-4" />
              <span>لماذا Leader Academy؟</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
              أدوات الذكاء الاصطناعي للمدرّس التونسي
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              كل ما تحتاجه لتحويل تجربتك التدريسية في مكان واحد — مصمّم خصيصاً للمنظومة التربوية التونسية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${feat.color}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                    {language === "fr" ? feat.titleFr : feat.titleAr}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {language === "fr" ? feat.descFr : feat.descAr}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PROGRAMS SECTION ===== */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4" style={{ background: "rgba(255,109,0,0.1)", color: "#FF6D00" }}>
              <GraduationCap className="w-4 h-4" />
              <span>برامجنا التدريبية</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
              {t("اختر برنامجك التدريبي", "Choisissez votre programme", "Choose Your Training Program")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("دورات متخصصة لكل مرحلة ومادة تعليمية", "Formations spécialisées pour chaque niveau et matière", "Specialized courses for every level and subject")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => {
              const Icon = courseIcons[course.category] || BookOpen;
              const isEnrolled = enrolledCourseIds.has(course.id);
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  {/* Card top accent */}
                  <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #1A237E, #FF6D00)" }} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(26,35,126,0.08)" }}>
                        <Icon className="w-6 h-6" style={{ color: "#1A237E" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>{course.titleAr}</h3>
                        {course.duration && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <span>⏱</span>
                            {course.duration} {t("ساعة", "h", "h")}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-2">
                      {course.descriptionAr || t("دورة تدريبية متخصصة لتطوير مهارات المعلمين", "Formation spécialisée pour développer les compétences des enseignants", "Specialized training to develop teachers' skills")}
                    </p>
                    {user ? (
                      isEnrolled ? (
                        <Link href={`/courses/${course.id}`}>
                          <Button className="w-full text-sm" variant="outline" style={{ borderColor: "#1A237E", color: "#1A237E" }}>
                            {t("متابعة الدورة", "Continuer", "Continue")}
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/courses/${course.id}`}>
                          <Button className="w-full text-sm text-white font-semibold" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                            {t("التسجيل في الدورة", "S'inscrire", "Enroll")}
                          </Button>
                        </Link>
                      )
                    ) : (
                      <a href={getLoginUrl()}>
                        <Button className="w-full text-sm text-white font-semibold" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
                          {t("سجّل للالتحاق", "Se connecter", "Sign in to Enroll")}
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!courses || courses.length === 0) && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(26,35,126,0.08)" }}>
                <BookOpen className="w-10 h-10" style={{ color: "#1A237E" }} />
              </div>
              <p className="text-gray-500 text-lg">{t("لا توجد دورات متاحة حالياً", "Aucune formation disponible", "No courses available")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== CURRICULUM GPS ===== */}
      <CurriculumGPSSection t={t} />

      {/* ===== FEATURED CONTENT OF THE WEEK ===== */}
      <FeaturedContentSection t={t} />

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-20 bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: "rgba(26,35,126,0.08)", color: "#1A237E" }}>
              <Star className="w-4 h-4" />
              {t("ماذا يقول المربون عنا؟", "Ce que disent nos enseignants", "What Teachers Say")}
            </span>
            <h2 className="text-3xl lg:text-4xl font-black mb-4" style={{ fontFamily: "Cairo, sans-serif", color: "#1A237E" }}>
              {t("ماذا يقول المربون عنا؟", "Témoignages de nos enseignants", "Teacher Testimonials")}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {t("آراء حقيقية من مدرسين تونسيين استخدموا منصة Leader Academy", "Avis réels d'enseignants tunisiens", "Real feedback from Tunisian teachers")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "الأستاذ محمد البوعزيزي",
                role: "مدرس رياضيات — المرحلة الإعدادية، سوسة",
                text: "كنت أقضي ساعتين في تحضير الجذاذة الواحدة. بعد EDUGPT، أنجز نفس العمل في 5 دقائق بجودة تفوق ما كنت أفعله يدوياً. هذه ثورة حقيقية!",
                rating: 5,
                avatar: "م",
                color: "#1A237E",
              },
              {
                name: "الأستاذة مريم العامري",
                role: "مدرسة علوم — المرحلة الابتدائية، تونس"
                , text: "التقييم الفوري غيّر طريقتي في متابعة تلاميذي. أستطيع الآن معرفة مستوى كل تلميذ بدقة وتقديم دعم مخصص له. Leader Academy حوّلت طريقة تدريسي بالكامل.",
                rating: 5,
                avatar: "م",
                color: "#FF6D00",
              },
              {
                name: "الأستاذ أحمد الطرابلسي",
                role: "مدرس لغة عربية — الثانوية، صفاقس",
                text: "دورة توظيف الذكاء الاصطناعي في التدريس كانت نقطة تحوّل حقيقية. المحتوى عملي، المدربون خبراء، والأدوات ثورية. أنصح بها كل معلم تونسي.",
                rating: 5,
                avatar: "أ",
                color: "#1565C0",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative"
              >
                {/* Quote icon */}
                <div className="absolute top-6 left-6 text-5xl font-black opacity-10" style={{ color: testimonial.color, fontFamily: "Georgia, serif" }}>“</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-current" style={{ color: "#FF6D00" }} />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  “{testimonial.text}”
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}99)` }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
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
      <footer style={{ background: "#0D1B5E" }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png" alt="Leader Academy" className="h-10 w-auto" />
                <div>
                  <p className="font-bold text-lg">Leader Academy</p>
                  <p className="text-blue-300 text-xs">نحو تعليم رقمي متميز</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                منصة تدريبية رائدة في توظيف الذكاء الاصطناعي في التدريس، مخصصة للمعلمين التونسيين.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">روابط سريعة</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="/assistant" className="hover:text-white transition-colors">EDUGPT — المساعد البيداغوجي</Link></li>
                <li><Link href="/evaluate-fiche" className="hover:text-white transition-colors">تقييم الفيشة البيداغوجية</Link></li>
                <li><Link href="/template-library" className="hover:text-white transition-colors">مكتبة القوالب</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">تواصل معنا</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a href="mailto:leaderacademy216@gmail.com" className="hover:text-white transition-colors">leaderacademy216@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <span>🇹🇳</span>
                  <span>تونس — خدمات رقمية</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-blue-300 text-sm">
            <p>© 2026 Leader Academy. جميع الحقوق محفوظة. 🇹🇳</p>
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
