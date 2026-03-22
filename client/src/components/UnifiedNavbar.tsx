import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, UserPlus,
  MessageSquare, ClipboardCheck, Globe, Brain, Sparkles,
  ChevronDown, Star, Menu, X,
  Bot, Search, FileEdit, Palette, BarChart3, LayoutDashboard,
  BadgeCheck, ShieldCheck, type LucideIcon, DollarSign, Info,
  Megaphone, Settings, ScanLine, FileCheck, Store, Briefcase, FileText, Theater, Building2, Film, Shield, PanelLeft, HeartHandshake,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ===== LANGUAGE OPTIONS =====
const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇹🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

// ===== AI TOOLS under EDUGPT dropdown =====
const AI_TOOLS: { href: string; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon; descAr: string; descFr: string; descEn: string }[] = [
  { href: "/assistant", labelAr: "EDUGPT — المساعد البيداغوجي", labelFr: "EDUGPT — Assistant pédagogique", labelEn: "EDUGPT — Pedagogical Assistant", icon: Bot, descAr: "إعداد الجذاذات والمخططات بالذكاء الاصطناعي", descFr: "Préparer fiches et plannings avec l'IA", descEn: "Prepare lesson plans with AI" },
  { href: "/inspector", labelAr: "المتفقد الذكي", labelFr: "Inspecteur IA", labelEn: "AI Inspector", icon: Search, descAr: "تحليل وتقييم الوثائق وفق المعايير الرسمية", descFr: "Analyser les documents selon les normes officielles", descEn: "Analyze documents per official standards" },
  { href: "/exam-builder", labelAr: "بناء الاختبار", labelFr: "Créer un examen", labelEn: "Exam Builder", icon: FileEdit, descAr: "توليد اختبارات مع الرسومات وجدول التقييم", descFr: "Générer des examens avec illustrations et barème", descEn: "Generate exams with illustrations and grading" },
  { href: "/visual-studio", labelAr: "Visual Studio", labelFr: "Visual Studio", labelEn: "Visual Studio", icon: Palette, descAr: "توليد صور تعليمية وإنفوغرافيك بالذكاء الاصطناعي", descFr: "Générer des images éducatives et infographies", descEn: "Generate educational images and infographics" },
  { href: "/legacy-digitizer", labelAr: "Legacy Digitizer — رقمنة الوثائق", labelFr: "Legacy Digitizer — Numérisation", labelEn: "Legacy Digitizer", icon: ScanLine, descAr: "مسح ورقمنة الوثائق التعليمية القديمة بالذكاء الاصطناعي", descFr: "Numériser les anciens documents pédagogiques avec l'IA", descEn: "Scan and digitize old educational documents with AI" },
  { href: "/curriculum-map", labelAr: "Curriculum GPS — خريطة المنهج", labelFr: "Curriculum GPS — Carte du programme", labelEn: "Curriculum GPS — Curriculum Map", icon: BarChart3, descAr: "تتبع تقدمك في تغطية المنهج الدراسي بذكاء", descFr: "Suivre votre progression dans le programme scolaire", descEn: "Track your curriculum coverage progress intelligently" },
  { href: "/blind-grading", labelAr: "مساعد التصحيح الذكي", labelFr: "Correction intelligente IA", labelEn: "Smart Grading Assistant", icon: FileCheck, descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية", descFr: "Correction intelligente des copies selon les critères tunisiens", descEn: "AI-powered student paper grading with Tunisian criteria" },
  { href: "/marketplace", labelAr: "سوق المحتوى الذهبي", labelFr: "Marché du contenu", labelEn: "Content Marketplace", icon: Store, descAr: "سوق مجتمعي لمشاركة وتحميل أفضل المحتويات التعليمية", descFr: "Marché communautaire pour partager le meilleur contenu éducatif", descEn: "Community marketplace for sharing best educational content" },
  { href: "/drama-engine", labelAr: "محرك الدراما التعليمية", labelFr: "Moteur de théâtre éducatif", labelEn: "Drama Engine", icon: Theater, descAr: "حوّل دروسك إلى مسرحيات تفاعلية مع توزيع الأدوار والوسائل", descFr: "Transformez vos leçons en pièces de théâtre interactives", descEn: "Transform lessons into interactive classroom plays" },
  { href: "/learning-support", labelAr: "أدوات ذوي صعوبات التعلم", labelFr: "Outils troubles d'apprentissage", labelEn: "Learning Difficulties Tools", icon: HeartHandshake, descAr: "أدوات ذكاء اصطناعي متخصصة لمرافقة التلاميذ ذوي صعوبات واضطرابات التعلم", descFr: "Outils IA spécialisés pour accompagner les élèves en difficulté d'apprentissage", descEn: "Specialized AI tools to support students with learning difficulties" },
  { href: "/video-evaluator", labelAr: "مُقيِّم المعلم الرقمي", labelFr: "Évaluateur vidéo IA", labelEn: "AI Video Evaluator", icon: Film, descAr: "تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر (Prompt Engineering)", descFr: "Évaluer les vidéos éducatives et améliorer le Prompt Engineering", descEn: "Evaluate educational videos and improve Prompt Engineering" },
];

// ===== SIMPLIFIED NAV LINKS (4 items for center menu) =====
const CENTER_NAV: { href: string; labelAr: string; labelFr: string; labelEn: string; hasDropdown?: boolean }[] = [
  { href: "/", labelAr: "الرئيسية", labelFr: "Accueil", labelEn: "Home" },
  { href: "/teacher-tools", labelAr: "أدوات الذكاء الاصطناعي", labelFr: "Outils IA", labelEn: "AI Tools", hasDropdown: true },
  { href: "/template-library", labelAr: "بنك الدروس", labelFr: "Banque de cours", labelEn: "Lesson Bank" },
  { href: "/about", labelAr: "من نحن", labelFr: "À propos", labelEn: "About Us" },
];

// ===== CERTIFICATE LINKS =====
const CERT_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon; descAr: string; descFr: string; descEn: string; authOnly: boolean }[] = [
  { href: "/my-certificates", labelAr: "شهاداتي", labelFr: "Mes certificats", labelEn: "My Certificates", icon: BadgeCheck, descAr: "عرض وتحميل شهاداتك المكتسبة", descFr: "Voir et télécharger vos certificats", descEn: "View and download your certificates", authOnly: true },
  { href: "/verify", labelAr: "التحقق من شهادة", labelFr: "Vérifier un certificat", labelEn: "Verify Certificate", icon: ShieldCheck, descAr: "التحقق من صحة شهادة برقمها", descFr: "Vérifier l'authenticité d'un certificat", descEn: "Verify a certificate by its number", authOnly: false },
];

// ===== ADMIN LINKS =====
const ADMIN_LINKS = [
  { href: "/dashboard", labelAr: "لوحة التحكم بالدورات", labelFr: "Gestion des formations", labelEn: "Course Management", icon: LayoutDashboard, descAr: "إدارة الدورات والمشاركين والامتحانات", descFr: "Gérer formations, participants et examens", descEn: "Manage courses, participants and exams", section: "general", adminOnly: false },
  { href: "/admin", labelAr: "لوحة الإدارة العامة", labelFr: "Administration générale", labelEn: "General Admin", icon: Settings, descAr: "إدارة المستخدمين والإعدادات العامة", descFr: "Gérer utilisateurs et paramètres", descEn: "Manage users and settings", section: "admin", adminOnly: true },
  { href: "/admin/partners", labelAr: "إدارة الشركاء", labelFr: "Gestion des partenaires", labelEn: "Partner Management", icon: Building2, descAr: "اعتماد ورفض طلبات المدارس الشريكة", descFr: "Approuver/rejeter les demandes d'écoles", descEn: "Approve/reject school partner requests", section: "admin", adminOnly: true },
  { href: "/managerial-dashboard", labelAr: "التحليلات والإحصائيات", labelFr: "Analyses & Statistiques", labelEn: "Analytics & Statistics", icon: BarChart3, descAr: "تقارير الأداء والإحصائيات التفصيلية", descFr: "Rapports de performance et statistiques", descEn: "Performance reports and statistics", section: "admin", adminOnly: true },
  { href: "/admin/batches", labelAr: "إدارة الدفعات", labelFr: "Gestion des groupes", labelEn: "Batch Manager", icon: Users, descAr: "إدارة المجموعات والصلاحيات والواجبات", descFr: "Gérer groupes, accès et devoirs", descEn: "Manage batches, access and assignments", section: "admin", adminOnly: true },
  { href: "/admin-control", labelAr: "لوحة التحكم الشاملة", labelFr: "Panneau de contrôle", labelEn: "Control Panel", icon: PanelLeft, descAr: "إدارة حدود الاستخدام والمستخدمين والاشتراكات والإحصائيات", descFr: "Gérer limites, utilisateurs, abonnements et statistiques", descEn: "Manage limits, users, subscriptions and statistics", section: "admin", adminOnly: true },
];

// ===== CAREER LINKS =====
const CAREER_LINKS = [
  { href: "/jobs", icon: Briefcase, labelAr: "فرص العمل", labelFr: "Offres d'emploi", labelEn: "Job Board", descAr: "تصفح عروض العمل في المدارس الشريكة", descFr: "Parcourir les offres des écoles partenaires", descEn: "Browse partner school listings" },
  { href: "/my-applications", icon: FileText, labelAr: "طلباتي", labelFr: "Mes candidatures", labelEn: "My Applications", descAr: "تتبع حالة طلبات التوظيف", descFr: "Suivre l'état de vos candidatures", descEn: "Track application status" },
  { href: "/my-assignments", icon: BookOpen, labelAr: "واجباتي", labelFr: "Mes devoirs", labelEn: "My Assignments", descAr: "تسليم الواجبات وعرض التقييمات", descFr: "Soumettre devoirs et voir évaluations", descEn: "Submit work and view grades" },
  { href: "/showcase", icon: Users, labelAr: "دليل الكفاءات", labelFr: "Répertoire des talents", labelEn: "Talent Directory", descAr: "اكتشف المعلمين المعتمدين", descFr: "Découvrir les enseignants certifiés", descEn: "Discover certified teachers" },
  { href: "/my-portfolio", icon: Star, labelAr: "ملفي المهني", labelFr: "Mon portfolio", labelEn: "My Portfolio", descAr: "إدارة ملفك المهني العام", descFr: "Gérer votre profil professionnel", descEn: "Manage your public portfolio" },
];

function getLabel(item: { labelAr: string; labelFr: string; labelEn: string }, language: AppLanguage) {
  if (language === "fr") return item.labelFr;
  if (language === "en") return item.labelEn;
  return item.labelAr;
}

function getDesc(item: { descAr: string; descFr: string; descEn: string }, language: AppLanguage) {
  if (language === "fr") return item.descFr;
  if (language === "en") return item.descEn;
  return item.descAr;
}

// ===== MAIN UNIFIED NAVBAR =====
export default function UnifiedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* ===== RIGHT: Logo ===== */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png"
                alt="Leader Academy"
                className="h-11 w-auto"
              />
              <div className="hidden sm:block">
                <p className="text-[#1A237E] font-extrabold text-lg leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  Leader Academy
                </p>
                <p className="text-gray-400 text-[11px] font-medium">
                  {t("نحو تعليم رقمي متميز", "Vers un enseignement numérique d'excellence", "Towards excellent digital education")}
                </p>
              </div>
            </div>
          </Link>

          {/* ===== CENTER: Navigation (Desktop) ===== */}
          <nav className="hidden lg:flex items-center gap-1">
            {CENTER_NAV.map((item) => {
              const isActive = item.href === "/"
                ? location === "/"
                : location === item.href || location.startsWith(item.href + "/");

              // AI Tools dropdown
              if (item.hasDropdown) {
                return (
                  <div key={item.href} className="relative group">
                    <Link href={item.href}>
                      <button
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? "text-[#FF6D00] bg-orange-50"
                            : "text-gray-600 hover:text-[#1A237E] hover:bg-gray-50"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {getLabel(item, language)}
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                      </button>
                    </Link>
                    {/* Mega dropdown */}
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ minWidth: "360px" }}>
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" dir="rtl">
                        <div className="px-4 py-3 border-b border-gray-50" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                          <p className="text-white font-bold text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange-300" />
                            {t("أدوات الذكاء الاصطناعي التربوي", "Outils IA éducatifs", "Educational AI Tools")}
                          </p>
                        </div>
                        <div className="overflow-y-auto py-1" style={{ maxHeight: "calc(100vh - 120px)" }}>
                          {AI_TOOLS.map((tool, idx) => {
                            const IconComp = tool.icon;
                            return (
                              <Link key={tool.href} href={tool.href}>
                                <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors ${idx < AI_TOOLS.length - 1 ? "border-b border-gray-50" : ""}`}>
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                                    <IconComp className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800">{getLabel(tool, language)}</p>
                                    <p className="text-xs text-gray-400 leading-tight">{getDesc(tool, language)}</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                          <Link href="/teacher-tools">
                            <button className="w-full text-center text-sm font-bold text-[#FF6D00] hover:text-orange-700 transition-colors">
                              {t("عرض جميع الأدوات →", "Voir tous les outils →", "View all tools →")}
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-[#1A237E] bg-blue-50"
                        : "text-gray-600 hover:text-[#1A237E] hover:bg-gray-50"
                    }`}
                  >
                    {getLabel(item, language)}
                  </button>
                </Link>
              );
            })}

            {/* Logged-in user extras: Programs, Certificates, Career, Admin */}
            {user && (
              <>
                {/* Programs */}
                <a
                  href="/#programs"
                  onClick={(e) => {
                    e.preventDefault();
                    if (location === "/") {
                      document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = "/#programs";
                    }
                  }}
                >
                  <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-all duration-200">
                    {t("الدورات", "Formations", "Courses")}
                  </button>
                </a>

                {/* More dropdown for logged-in users */}
                <MoreDropdown language={language} t={t} user={user} location={location} isAdmin={isAdmin} />

                {/* Admin dropdown - separate from More */}
                {isAdmin && (
                  <AdminDropdown language={language} t={t} location={location} isAdmin={isAdmin} />
                )}
              </>
            )}
          </nav>

          {/* ===== LEFT: Action Buttons ===== */}
          <div className="flex items-center gap-2.5">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                </button>
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
                    <Button
                      size="sm"
                      className="h-9 px-4 text-xs font-bold rounded-xl text-white"
                      style={{ background: "#FF6D00" }}
                    >
                      <UserPlus className="w-3.5 h-3.5 ml-1" />
                      {t("إكمال التسجيل", "Inscription", "Complete")}
                    </Button>
                  </Link>
                )}
                <Link href="/my-courses">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-xs font-semibold rounded-xl border-gray-200 text-gray-600 hover:text-[#1A237E] hover:border-[#1A237E]/30 hover:bg-blue-50/50"
                  >
                    {t("دوراتي", "Mes cours", "My Courses")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <a href={getLoginUrl()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-5 text-sm font-semibold rounded-xl border-gray-200 text-gray-600 hover:text-[#1A237E] hover:border-[#1A237E]/30"
                  >
                    {t("تسجيل الدخول", "Se connecter", "Sign In")}
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button
                    size="sm"
                    className="h-9 px-5 text-sm font-bold rounded-xl text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
                  >
                    {t("ابدأ مجانًا", "Commencer gratuitement", "Start Free")}
                  </Button>
                </a>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1 max-h-[calc(100vh-4.5rem)] overflow-y-auto bg-white">
            {/* Main nav links */}
            {CENTER_NAV.map((item) => {
              const isActive = item.href === "/" ? location === "/" : location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "text-[#1A237E] bg-blue-50" : "text-gray-600 hover:text-[#1A237E] hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.hasDropdown && <Sparkles className="w-4 h-4 flex-shrink-0" />}
                    {getLabel(item, language)}
                  </button>
                </Link>
              );
            })}

            {/* AI Tools section */}
            <div className="border-t border-gray-100 my-2 pt-2">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                {t("أدوات EDUGPT", "Outils EDUGPT", "EDUGPT Tools")}
              </p>
              <div className="space-y-0.5 px-2">
                {AI_TOOLS.slice(0, 6).map((tool) => {
                  const IconComp = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <button
                        className="flex items-center gap-3 w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#1A237E] hover:bg-blue-50/60 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                          <IconComp className="w-3.5 h-3.5 text-white" />
                        </div>
                        {getLabel(tool, language)}
                      </button>
                    </Link>
                  );
                })}
                <Link href="/teacher-tools">
                  <button
                    className="w-full text-center py-2 text-sm font-bold text-[#FF6D00] hover:text-orange-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("عرض جميع الأدوات →", "Voir tous les outils →", "View all tools →")}
                  </button>
                </Link>
              </div>
            </div>

            {/* Programs link */}
            <div className="border-t border-gray-100 my-2 pt-2">
              <a
                href="/#programs"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (location === "/") {
                    setTimeout(() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" }), 300);
                  } else {
                    window.location.href = "/#programs";
                  }
                }}
              >
                <button className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-colors">
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  {t("برامجنا التدريبية", "Nos formations", "Training Programs")}
                </button>
              </a>
            </div>

            {/* Certificates */}
            <div className="border-t border-gray-100 my-2 pt-2">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                {t("الشهادات", "Certificats", "Certificates")}
              </p>
              {CERT_LINKS.filter(cl => !cl.authOnly || user).map((cl) => {
                const CIcon = cl.icon;
                return (
                  <Link key={cl.href} href={cl.href}>
                    <button
                      className="flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CIcon className="w-4 h-4 flex-shrink-0" />
                      {getLabel(cl, language)}
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Career Hub */}
            {user && (
              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  {t("المسار المهني", "Carrière", "Career")}
                </p>
                {CAREER_LINKS.map((item) => {
                  const CIcon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        className="flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CIcon className="w-4 h-4 flex-shrink-0" />
                        {getLabel(item, language)}
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Admin */}
            {user && (
              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  {t("الإدارة", "Administration", "Management")}
                </p>
                <AdminMobileLinks setMobileMenuOpen={setMobileMenuOpen} location={location} language={language} isAdmin={isAdmin} />
              </div>
            )}

            {/* Language */}
            <div className="border-t border-gray-100 my-2 pt-2">
              <div className="flex gap-2 px-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      language === lang.code ? "bg-blue-50 text-[#1A237E]" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="border-t border-gray-100 my-2 pt-3 px-4 space-y-2">
              {user ? (
                <Link href="/assistant" className="block">
                  <Button
                    className="w-full text-sm font-bold rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Brain className="w-4 h-4 ml-2" />
                    {t("جرّب EDUGPT", "Essayer EDUGPT", "Try EDUGPT")}
                  </Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()} className="block">
                    <Button
                      className="w-full text-sm font-bold rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
                    >
                      {t("ابدأ مجانًا", "Commencer gratuitement", "Start Free")}
                    </Button>
                  </a>
                  <a href={getLoginUrl()} className="block">
                    <Button variant="outline" className="w-full text-sm font-semibold rounded-xl border-gray-200 text-gray-600">
                      {t("تسجيل الدخول", "Se connecter", "Sign In")}
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ===== MORE DROPDOWN (for logged-in users on desktop) =====
function MoreDropdown({ language, t, user, location, isAdmin }: { language: AppLanguage; t: (ar: string, fr: string, en: string) => string; user: any; location: string; isAdmin: boolean }) {
  return (
    <div className="relative group/more">
      <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-all duration-200">
        {t("المزيد", "Plus", "More")}
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/more:rotate-180" />
      </button>
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-200 z-50" style={{ minWidth: "320px" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" dir="rtl">
          {/* Certificates section */}
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3 h-3" />
              {t("الشهادات", "Certificats", "Certificates")}
            </p>
          </div>
          {CERT_LINKS.filter(cl => !cl.authOnly || user).map((cl) => {
            const CIcon = cl.icon;
            return (
              <Link key={cl.href} href={cl.href}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                    <CIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800">{getLabel(cl, language)}</p>
                    <p className="text-xs text-gray-400">{getDesc(cl, language)}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Career section */}
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              {t("المسار المهني", "Carrière", "Career")}
            </p>
          </div>
          {CAREER_LINKS.map((cl) => {
            const CIcon = cl.icon;
            return (
              <Link key={cl.href} href={cl.href}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600">
                    <CIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800">{getLabel(cl, language)}</p>
                    <p className="text-xs text-gray-400">{getDesc(cl, language)}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Pricing & Contact */}
          <div className="border-t border-gray-100 flex">
            <Link href="/pricing" className="flex-1">
              <div className="flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-sm font-semibold text-gray-600 border-l border-gray-100">
                <DollarSign className="w-4 h-4" />
                {t("الأسعار", "Tarifs", "Pricing")}
              </div>
            </Link>
            <Link href="/contact" className="flex-1">
              <div className="flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-sm font-semibold text-gray-600">
                <MessageSquare className="w-4 h-4" />
                {t("تواصل معنا", "Contact", "Contact")}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== ADMIN DROPDOWN (separate from More, for admin users on desktop) =====
function AdminDropdown({ language, t, location, isAdmin }: { language: AppLanguage; t: (ar: string, fr: string, en: string) => string; location: string; isAdmin: boolean }) {
  const pendingCountQuery = trpc.adminPartners.pendingCount.useQuery(undefined, { refetchInterval: 30000, enabled: isAdmin });
  const pendingCount = isAdmin ? (pendingCountQuery.data?.count || 0) : 0;

  return (
    <div className="relative group/admin">
      <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#1A237E] hover:bg-gray-50 transition-all duration-200">
        <Settings className="w-4 h-4" />
        {t("الإدارة", "Administration", "Management")}
        {pendingCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/admin:rotate-180" />
      </button>
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover/admin:opacity-100 group-hover/admin:visible transition-all duration-200 z-50" style={{ minWidth: "340px" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" dir="rtl">
          <div className="px-4 py-3 border-b border-gray-50" style={{ background: "linear-gradient(135deg, #1A237E, #0D47A1)" }}>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-300" />
              {t("لوحة الإدارة", "Panneau d'administration", "Admin Panel")}
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white">
                  {pendingCount}
                </span>
              )}
            </p>
          </div>
          <div className="overflow-y-auto py-1" style={{ maxHeight: "calc(100vh - 120px)" }}>
            {ADMIN_LINKS.filter(l => !l.adminOnly || isAdmin).map((link, idx) => {
              const IconComp = link.icon;
              const isActive = location === link.href || location.startsWith(link.href + "/");
              const isPartners = link.href === "/admin/partners";
              const isControlPanel = link.href === "/admin-control";
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors ${idx < ADMIN_LINKS.length - 1 ? "border-b border-gray-50" : ""} ${isActive ? "bg-blue-50/40" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: isControlPanel ? "linear-gradient(135deg, #FF6D00, #FF8F00)" : isPartners ? "linear-gradient(135deg, #DC2626, #EF4444)" : "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-sm ${isActive ? "text-[#1A237E]" : "text-gray-800"}`}>{getLabel(link, language)}</p>
                        {isPartners && pendingCount > 0 && (
                          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {isControlPanel && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600">
                            {t("جديد", "Nouveau", "New")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-tight">{getDesc(link, language)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== ADMIN MOBILE LINKS =====
function AdminMobileLinks({ setMobileMenuOpen, location, language, isAdmin }: { setMobileMenuOpen: (v: boolean) => void; location: string; language: AppLanguage; isAdmin: boolean }) {
  const pendingCountQuery = trpc.adminPartners.pendingCount.useQuery(undefined, { refetchInterval: 30000, enabled: isAdmin });
  const pendingCount = isAdmin ? (pendingCountQuery.data?.count || 0) : 0;

  const links = ADMIN_LINKS.filter(l => !l.adminOnly || isAdmin);

  return (
    <>
      {links.map((link) => {
        const IconComp = link.icon;
        const isActive = location === link.href || location.startsWith(link.href + "/");
        const isPartners = link.href === "/admin/partners";
        return (
          <Link key={link.href} href={link.href}>
            <button
              className={`flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "text-[#1A237E] bg-blue-50" : "text-gray-600 hover:text-[#1A237E] hover:bg-gray-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <IconComp className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{getLabel(link, language)}</span>
              {isPartners && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </Link>
        );
      })}
    </>
  );
}
