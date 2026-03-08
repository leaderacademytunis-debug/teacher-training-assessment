import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, Loader2, UserPlus,
  MessageSquare, ClipboardCheck, Globe, Brain, Sparkles,
  ChevronLeft, Star, Zap, Shield, ArrowLeft, Menu, X,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ChatAssistant } from "@/components/ChatAssistant";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

const NAV_LINKS = [
  { href: "/", labelAr: "الرئيسية", labelFr: "Accueil", labelEn: "Home" },
  { href: "/assistant", labelAr: "EDUGPT", labelFr: "EDUGPT", labelEn: "EDUGPT" },
  { href: "/inspector", labelAr: "المتفقد الذكي", labelFr: "Inspecteur IA", labelEn: "AI Inspector" },
  { href: "/exam-builder", labelAr: "بناء الاختبار", labelFr: "Créer un examen", labelEn: "Exam Builder" },
  { href: "/visual-studio", labelAr: "Visual Studio", labelFr: "Visual Studio", labelEn: "Visual Studio" },
  { href: "/evaluate-fiche", labelAr: "تقييم المكتسبات", labelFr: "Évaluation", labelEn: "Assessment" },
  { href: "/#programs", labelAr: "برامجنا التدريبية", labelFr: "Nos formations", labelEn: "Training Programs" },
  { href: "/contact", labelAr: "عن الأكاديمية", labelFr: "À propos", labelEn: "About" },
  { href: "/admin", labelAr: "لوحة التحكم", labelFr: "Admin", labelEn: "Admin" },
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

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
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
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button className="text-blue-100 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap">
                    {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                  </button>
                </Link>
              ))}
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
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button
                    className="block w-full text-right text-blue-100 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {language === "fr" ? link.labelFr : language === "en" ? link.labelEn : link.labelAr}
                  </button>
                </Link>
              ))}
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
