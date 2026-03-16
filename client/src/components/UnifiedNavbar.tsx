import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, UserPlus,
  MessageSquare, ClipboardCheck, Globe, Brain, Sparkles,
  ChevronDown, Star, Menu, X,
  Bot, Search, FileEdit, Palette, BarChart3, LayoutDashboard,
  BadgeCheck, ShieldCheck, type LucideIcon, DollarSign, Info,
  Megaphone, Settings, ScanLine, FileCheck, Store, Briefcase, FileText, Theater, Building2, Film, Shield,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  { href: "/blind-grading", labelAr: "مساعد التصحيح الأعمى", labelFr: "Correction aveugle IA", labelEn: "Blind Grading Assistant", icon: FileCheck, descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية", descFr: "Correction intelligente des copies selon les critères tunisiens", descEn: "AI-powered student paper grading with Tunisian criteria" },
  { href: "/marketplace", labelAr: "سوق المحتوى الذهبي", labelFr: "Marché du contenu", labelEn: "Content Marketplace", icon: Store, descAr: "سوق مجتمعي لمشاركة وتحميل أفضل المحتويات التعليمية", descFr: "Marché communautaire pour partager le meilleur contenu éducatif", descEn: "Community marketplace for sharing best educational content" },
  { href: "/drama-engine", labelAr: "محرك الدراما التعليمية", labelFr: "Moteur de théâtre éducatif", labelEn: "Drama Engine", icon: Theater, descAr: "حوّل دروسك إلى مسرحيات تفاعلية مع توزيع الأدوار والوسائل", descFr: "Transformez vos leçons en pièces de théâtre interactives", descEn: "Transform lessons into interactive classroom plays" },
  { href: "/handwriting-analyzer", labelAr: "محلل خط اليد الذكي", labelFr: "Analyseur d'écriture IA", labelEn: "AI Handwriting Analyzer", icon: Brain, descAr: "تحليل خط يد التلميذ للكشف المبكر عن صعوبات واضطرابات التعلم", descFr: "Analyser l'écriture pour détecter les troubles d'apprentissage", descEn: "Analyze handwriting to detect learning difficulties" },
  { href: "/video-evaluator", labelAr: "مُقيِّم المعلم الرقمي", labelFr: "Évaluateur vidéo IA", labelEn: "AI Video Evaluator", icon: Film, descAr: "تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر (Prompt Engineering)", descFr: "Évaluer les vidéos éducatives et améliorer le Prompt Engineering", descEn: "Evaluate educational videos and improve Prompt Engineering" },
];

// ===== NAV LINKS =====
const NAV_LINKS: { href: string; labelAr: string; labelFr: string; labelEn: string; adminOnly: boolean; authOnly: boolean; icon: LucideIcon }[] = [
  { href: "/#programs", labelAr: "برامجنا التدريبية", labelFr: "Nos formations", labelEn: "Training Programs", adminOnly: false, authOnly: false, icon: Megaphone },
  { href: "/about", labelAr: "عن الأكاديمية", labelFr: "À propos", labelEn: "About", adminOnly: false, authOnly: false, icon: Info },
  { href: "/pricing", labelAr: "الأسعار", labelFr: "Tarifs", labelEn: "Pricing", adminOnly: false, authOnly: false, icon: DollarSign },
  { href: "/contact", labelAr: "تواصل معنا", labelFr: "Contact", labelEn: "Contact", adminOnly: false, authOnly: false, icon: MessageSquare },
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

// ===== ADMIN DESKTOP DROPDOWN =====
function AdminDesktopDropdown({ language, t, location, isAdmin }: { language: AppLanguage; t: (ar: string, fr: string, en: string) => string; location: string; isAdmin: boolean }) {
  const pendingCountQuery = trpc.adminPartners.pendingCount.useQuery(undefined, { refetchInterval: 30000, enabled: isAdmin });
  const pendingCount = isAdmin ? (pendingCountQuery.data?.count || 0) : 0;

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
          {generalLinks.map((link) => {
            const IconComp = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{getLabel(link, language)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getDesc(link, language)}</p>
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
                      <p className="font-bold text-sm text-gray-900">{getLabel(link, language)}</p>
                      {isPartners && pendingCount > 0 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{getDesc(link, language)}</p>
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

// ===== MAIN UNIFIED NAVBAR =====
export default function UnifiedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  return (
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
                <p className="text-blue-200 text-xs">{t("نحو تعليم رقمي متميز", "Vers un enseignement numérique d'excellence", "Towards excellent digital education")}</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* EDUGPT Dropdown */}
            <div className="relative group">
              <Link href="/assistant">
                <button className="flex items-center gap-1.5 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap" style={{ background: "rgba(255,109,0,0.2)", border: "1px solid rgba(255,109,0,0.4)" }}>
                  <Sparkles className="w-4 h-4 text-orange-300" />
                  {t("أدوات EDUGPT", "Outils EDUGPT", "EDUGPT Tools")}
                  <ChevronDown className="w-3.5 h-3.5 text-orange-300 transition-transform group-hover:rotate-180" />
                </button>
              </Link>
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
                              <p className="font-bold text-xs text-gray-900 leading-tight">{getLabel(tool, language)}</p>
                              <p className="text-[10px] text-gray-500 leading-tight">{getDesc(tool, language)}</p>
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
                    <button className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-blue-100 hover:text-white hover:bg-white/10">
                      {getLabel(link, language)}
                    </button>
                  </a>
                );
              }
              return (
                <Link key={link.href} href={link.href}>
                  <button className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}>
                    {getLabel(link, language)}
                    {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-400 rounded-full" />}
                  </button>
                </Link>
              );
            })}

            {/* Certificates Dropdown */}
            <div className="relative group/cert">
              <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                ['/my-certificates', '/verify'].includes(location) ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}>
                <Award className="w-4 h-4" />
                {t("الشهادات", "Certificats", "Certificates")}
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/cert:rotate-180" />
                {['/my-certificates', '/verify'].includes(location) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-400 rounded-full" />}
              </button>
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
                            <p className="font-bold text-sm text-gray-900">{getLabel(cl, language)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{getDesc(cl, language)}</p>
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
                  ['/jobs', '/my-applications', '/showcase', '/my-portfolio', '/school-portal', '/career-messages', '/teacher-analytics', '/my-assignments'].includes(location) ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}>
                  <Briefcase className="w-4 h-4" />
                  {t("المسار المهني", "Carrière", "Career")}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/career:rotate-180" />
                </button>
                <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover/career:opacity-100 group-hover/career:visible transition-all duration-200 z-50" style={{ minWidth: "300px" }}>
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" dir="rtl">
                    <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                      <p className="text-white font-bold text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-orange-300" />
                        {t("المسار المهني وفرص العمل", "Carrière & Emploi", "Career & Jobs")}
                      </p>
                    </div>
                    {CAREER_LINKS.map((cl, idx) => {
                      const CIcon = cl.icon;
                      return (
                        <Link key={cl.href} href={cl.href}>
                          <div className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${idx < CAREER_LINKS.length - 1 ? "border-b border-gray-50" : ""}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-blue-600 to-indigo-600">
                              <CIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-900">{getLabel(cl, language)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{getDesc(cl, language)}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Admin/Management Dropdown */}
            {user && (
              <AdminDesktopDropdown language={language} t={t} location={location} isAdmin={user.role === 'admin'} />
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

        {/* ===== MOBILE MENU ===== */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* EDUGPT Section */}
            <div className="px-4 py-2">
              <p className="text-orange-300 font-bold text-sm flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                {t("أدوات EDUGPT", "Outils EDUGPT", "EDUGPT Tools")}
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
                          <span className="block">{getLabel(tool, language)}</span>
                          <span className="block text-xs text-blue-300 mt-0.5">{getDesc(tool, language)}</span>
                        </div>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 my-2" />

            {/* Other Links */}
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
                    <button className="flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/10">
                      <NavIcon className="w-4 h-4 flex-shrink-0" />
                      {getLabel(link, language)}
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
                    {getLabel(link, language)}
                  </button>
                </Link>
              );
            })}

            {/* Certificates section */}
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
                        {getLabel(cl, language)}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Career Hub section */}
            {user && (
              <>
                <div className="border-t border-white/10 my-2" />
                <div className="px-4 py-2">
                  <p className="text-orange-300 font-bold text-xs flex items-center gap-2 mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    {t("المسار المهني", "Carrière", "Career")}
                  </p>
                  <div className="space-y-1 mr-4">
                    {CAREER_LINKS.map((item) => {
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
                            {getLabel(item, language)}
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Management section */}
            {user && (
              <>
                <div className="border-t border-white/10 my-2" />
                <div className="px-4 py-2">
                  <p className="text-blue-200 font-bold text-xs flex items-center gap-2 mb-2">
                    <Settings className="w-3.5 h-3.5" />
                    {t("الإدارة", "Administration", "Management")}
                  </p>
                  <div className="space-y-1 mr-4">
                    <AdminMobileLinks setMobileMenuOpen={setMobileMenuOpen} location={location} language={language} isAdmin={user?.role === 'admin'} />
                  </div>
                </div>
              </>
            )}

            {/* Mobile language switcher */}
            <div className="border-t border-white/10 my-2" />
            <div className="px-4 py-2">
              <p className="text-blue-200 font-bold text-xs flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5" />
                {t("اللغة", "Langue", "Language")}
              </p>
              <div className="flex gap-2 mr-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      // Don't close menu on language switch so user sees the change
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      language === lang.code ? "bg-white/20 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/assistant" className="flex-1">
                <Button size="sm" className="w-full text-xs" style={{ background: "#FF6D00" }} onClick={() => setMobileMenuOpen(false)}>
                  <MessageSquare className="w-3.5 h-3.5 ml-1" />
                  EDUGPT
                </Button>
              </Link>
              <Link href="/evaluate-fiche" className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs border-white/30 text-white bg-transparent" onClick={() => setMobileMenuOpen(false)}>
                  <ClipboardCheck className="w-3.5 h-3.5 ml-1" />
                  {t("تقييم", "Évaluer", "Assess")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
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
              className={`flex items-center gap-3 w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "text-white bg-white/15" : "text-blue-100 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-300" : ""}`} />
              <span className="flex-1">{getLabel(link, language)}</span>
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
