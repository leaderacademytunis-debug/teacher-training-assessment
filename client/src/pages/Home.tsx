import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, GraduationCap, Users, Award, Loader2,
  ChevronLeft, ChevronDown, Star, Zap, Shield, ArrowLeft, Menu, X,
  Bot, Search, FileEdit, Palette, BarChart3,
  BadgeCheck, ShieldCheck, type LucideIcon, DollarSign, Info,
  ScanLine, FileCheck, Store, Navigation, MapPin, Play, Target, Clock, Theater, Building2, Briefcase, FileText, Film,
  Phone, Mail, ExternalLink, ChevronRight, Send, HeartHandshake,
  Mic, Video, CheckCircle, TrendingUp,
  Crown, Rocket, Sparkles, Brain, Globe,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import { Link, useLocation } from "wouter";
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ChatAssistant } from "@/components/ChatAssistant";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";

// ===== PRODUCT DEFINITIONS =====
interface ProductTool {
  name: string;
  icon: LucideIcon;
  href: string;
}

interface Product {
  id: string;
  tag: string;
  title: string;
  description: string;
  tools: ProductTool[];
  color: string;
  colorLight: string;
  colorBorder: string;
  btnText: string;
  btnHref: string;
  toolCount: number;
}

const PRODUCTS: Product[] = [
  {
    id: "edugpt",
    tag: "متوافق 100% مع البرامج التونسية 2026",
    title: "Leader EduGPT",
    description: "6 أدوات ذكاء اصطناعي لتحضير الدروس والتقييمات في دقائق",
    tools: [
      { name: "مساعد إعداد الجذاذات", icon: Bot, href: "/assistant" },
      { name: "بناء الاختبارات الذكي", icon: FileEdit, href: "/exam-builder" },
      { name: "المتفقد الذكي", icon: Search, href: "/inspector" },
      { name: "خريطة المنهج GPS", icon: Navigation, href: "/curriculum-map" },
      { name: "مساعد التصحيح الذكي", icon: FileCheck, href: "/blind-grading" },
      { name: "مختبر هندسة الأوامر", icon: Sparkles, href: "/prompt-lab" },
    ],
    color: "#1D9E75",
    colorLight: "#E6F7F0",
    colorBorder: "#B8E8D5",
    btnText: "اكتشف الأدوات الستة",
    btnHref: "/teacher-tools",
    toolCount: 6,
  },
  {
    id: "studio",
    tag: "إنتاج فيديوهات تعليمية بصوتك المستنسخ",
    title: "Leader Studio",
    description: "5 أدوات لإنتاج محتوى بصري وسمعي احترافي",
    tools: [
      { name: "استوديو الصور التعليمية", icon: Palette, href: "/visual-studio" },
      { name: "Ultimate Studio (فيديو)", icon: Video, href: "/ultimate-studio" },
      { name: "محرك الدراما التعليمية", icon: Theater, href: "/drama-engine" },
      { name: "رقمنة الوثائق", icon: ScanLine, href: "/legacy-digitizer" },
      { name: "سوق المحتوى الذهبي", icon: Store, href: "/marketplace" },
    ],
    color: "#E8590C",
    colorLight: "#FFF4ED",
    colorBorder: "#FDDCBF",
    btnText: "اكتشف الأدوات الخمسة",
    btnHref: "/teacher-tools",
    toolCount: 5,
  },
  {
    id: "inclusion",
    tag: "لجميع الدول العربية — الوحيدة في المنطقة",
    title: "Leader Inclusion",
    description: "7 أدوات ذكاء اصطناعي لدعم صعوبات التعلم مبكراً",
    tools: [
      { name: "محلل الخط", icon: FileText, href: "/learning-support" },
      { name: "المرافق البيداغوجي الفردي", icon: HeartHandshake, href: "/learning-support" },
      { name: "محول المحتوى (ADHD)", icon: Brain, href: "/learning-support" },
      { name: "التمارين العلاجية", icon: Target, href: "/learning-support" },
      { name: "تقرير التقدم", icon: TrendingUp, href: "/learning-support" },
      { name: "المقيّم التنبؤي", icon: BarChart3, href: "/learning-support" },
      { name: "لوحة متابعة التلاميذ", icon: Users, href: "/learning-support" },
    ],
    color: "#7C3AED",
    colorLight: "#EEEDFE",
    colorBorder: "#D4D0FB",
    btnText: "اكتشف الأدوات السبعة",
    btnHref: "/learning-support",
    toolCount: 7,
  },
];

// ===== NAVBAR LINKS =====
const SIMPLE_NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/teacher-tools", label: "الأدوات" },
  { href: "/courses", label: "التكوينات" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/about", label: "من نحن" },
];

// ===== STATS =====
const HERO_STATS = [
  { value: "+5000", label: "معلم يستخدم المنصة" },
  { value: "18", label: "أداة ذكاء اصطناعي" },
  { value: "98%", label: "نسبة رضا المستخدمين" },
  { value: "3 دقائق", label: "لإعداد درس كامل" },
];

// ===== SIMPLE NAVBAR COMPONENT =====
function SimpleNavbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png"
              alt="Leader Academy"
              className="h-9 w-auto"
            />
            <span className="font-bold text-lg hidden sm:block" style={{ color: "#1A237E", fontFamily: "'Cairo', sans-serif" }}>
              Leader Academy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {SIMPLE_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors rounded-lg hover:bg-gray-50"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/teacher-tools">
                <Button
                  size="sm"
                  className="text-white font-bold px-5 rounded-xl text-sm"
                  style={{ background: "#1D9E75" }}
                >
                  لوحة الأدوات
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button
                  size="sm"
                  className="text-white font-bold px-5 rounded-xl text-sm hidden sm:inline-flex"
                  style={{ background: "#1D9E75" }}
                >
                  ابدأ بـ 100 نقطة مجانية
                </Button>
              </a>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {SIMPLE_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                style={{ fontFamily: "'Cairo', sans-serif" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <a href={getLoginUrl()} className="block mt-2">
                <Button className="w-full text-white font-bold rounded-xl" style={{ background: "#1D9E75" }}>
                  ابدأ بـ 100 نقطة مجانية
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ===== PRODUCT CARD WITH ACCORDION =====
function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{
        background: product.colorLight,
        borderColor: product.colorBorder,
        borderRadius: "16px",
      }}
    >
      {/* Header */}
      <div className="p-6 sm:p-8">
        {/* Tag */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold mb-4"
          style={{ background: `${product.color}15`, color: product.color }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {product.tag}
        </div>

        {/* Title */}
        <h3
          className="text-2xl sm:text-3xl font-extrabold mb-3"
          style={{ color: product.color, fontFamily: "'Cairo', sans-serif" }}
        >
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-base leading-relaxed mb-5" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {product.description}
        </p>

        {/* Accordion Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-bold transition-colors"
          style={{ color: product.color }}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
          {open ? "إخفاء الأدوات" : `عرض الأدوات (${product.toolCount})`}
        </button>
      </div>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Link key={i} href={tool.href}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${product.color}12` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: product.color }} />
                    </div>
                    <span
                      className="text-sm font-semibold text-gray-700 group-hover:text-gray-900"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {tool.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="mt-5">
            <Link href={product.btnHref}>
              <Button
                className="w-full sm:w-auto text-white font-bold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
                style={{ background: product.color }}
              >
                {product.btnText}
                <ArrowLeft className="w-4 h-4 ms-2 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN HOME COMPONENT =====
export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.enrollment.courseId) || []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#1D9E75" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[Cairo,Tajawal,sans-serif]" dir="rtl">
      <SEOHead ogUrl="/" />

      {/* ===== NAVBAR ===== */}
      <SimpleNavbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -end-40 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "#1D9E75", filter: "blur(120px)" }} />
          <div className="absolute -bottom-32 -start-32 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "#7C3AED", filter: "blur(100px)" }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "radial-gradient(#1D9E75 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold mb-8"
            style={{ background: "#E6F7F0", color: "#1D9E75" }}
          >
            <Sparkles className="w-4 h-4" />
            المنصة الأولى في تونس — 18 أداة — متوافقة مع البرامج 2026
          </div>

          {/* H1 */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: "#1A1A2E", fontFamily: "'Cairo', sans-serif" }}
          >
            كل ما يحتاجه المعلم في مكان واحد
          </h1>

          {/* Subtitle */}
          <p
            className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-8"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            من إعداد الجذاذة إلى إنتاج الفيديو بصوتك إلى دعم التلاميذ ذوي الصعوبات — 18 أداة ذكاء اصطناعي لم تُجمع من قبل في منصة عربية واحدة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link href="/teacher-tools">
              <Button
                size="lg"
                className="text-white font-bold px-8 h-13 text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
                style={{ background: "#1D9E75", boxShadow: "0 6px 24px rgba(29,158,117,0.3)" }}
              >
                <Sparkles className="w-5 h-5 ms-2" />
                اكتشف الأدوات الآن
              </Button>
            </Link>
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2.5 font-semibold px-6 h-13 text-base rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#1D9E75]/30 hover:text-[#1D9E75] hover:bg-green-50/30 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(29,158,117,0.08)" }}>
                <Play className="w-4 h-4 fill-current" style={{ color: "#1D9E75" }} />
              </div>
              <span>شاهد كيف تعمل</span>
            </button>
          </div>

          {/* Free signup pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium mb-12"
            style={{ background: "#FFF8F0", color: "#B45309", border: "1px solid #FDE68A" }}
          >
            <Zap className="w-4 h-4" style={{ color: "#F59E0B" }} />
            سجّل الآن واحصل على 100 نقطة مجانية — بدون بطاقة بنكية
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {HERO_STATS.map((stat, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
                style={{ borderRadius: "16px" }}
              >
                <p className="text-3xl sm:text-4xl font-black mb-1" style={{ color: "#1D9E75", fontFamily: "'Cairo', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3 PRODUCT CARDS SECTION ===== */}
      <section id="products" className="py-16 sm:py-20 lg:py-24" style={{ background: "#FAFAFA" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-extrabold mb-4"
              style={{ color: "#1A1A2E", fontFamily: "'Cairo', sans-serif" }}
            >
              3 منتجات — 18 أداة — منصة واحدة
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Cairo', sans-serif" }}>
              كل منتج يحتوي على مجموعة أدوات متكاملة مصممة لتغطية جانب محدد من عمل المعلم
            </p>
          </div>

          {/* Product Cards */}
          <div className="space-y-6">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROGRAMS SECTION ===== */}
      <section id="programs" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold mb-5" style={{ background: "rgba(29,158,117,0.08)", color: "#1D9E75" }}>
              <GraduationCap className="w-4 h-4" />
              <span>برامجنا التدريبية</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "#1A1A2E", fontFamily: "'Cairo', sans-serif" }}>
              اختر برنامجك التدريبي
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              دورات متخصصة مصمّمة بعناية لتطوير مهاراتك التربوية والرقمية، مع شهادات معتمدة
            </p>
          </div>

          {/* Courses Grid */}
          {(() => {
            const FEATURED_COVERS: Record<string, { img: string; badgeAr: string; badgeColor: string; rating: number; students: number; descAr: string }> = {
              "primary_teachers": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-primary-teachers-22HWdhUvhChXUErJygCu7Z.webp",
                badgeAr: "الأكثر شمولاً", badgeColor: "#1D9E75",
                rating: 4.9, students: 342,
                descAr: "برنامج شامل لتأهيل معلمي المرحلة الابتدائية وفق المنهج التونسي الرسمي"
              },
              "digital_teacher_ai": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-ai-digital-teacher-KChS7RNLizhz8EaP2yDNfe.webp",
                badgeAr: "الأكثر طلباً", badgeColor: "#E8590C",
                rating: 4.8, students: 528,
                descAr: "تعلّم توظيف الذكاء الاصطناعي في التدريس وإعداد الدروس الرقمية"
              },
              "special_needs_companions": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-special-needs-5fM9gP4Ep9BwSgBvKbJcid.webp",
                badgeAr: "فريد", badgeColor: "#7C3AED",
                rating: 4.7, students: 186,
                descAr: "تأهيل مرافقي التلاميذ ذوي صعوبات التعلم بأحدث الأساليب التربوية"
              },
              "english_teachers": {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-english-training-9cPsmZ4bKgqCVy9M8z7Mue.webp",
                badgeAr: "دولي", badgeColor: "#5C6BC0",
                rating: 4.6, students: 215,
                descAr: "برنامج تدريب معلمي اللغة الإنجليزية بمعايير دولية وشهادة معتمدة"
              }
            };
            const featuredOrder = ["digital_teacher_ai", "primary_teachers", "special_needs_companions", "english_teachers"];
            const featuredCourses = featuredOrder.map(cat => courses?.find(c => c.category === cat)).filter(Boolean);
            const displayCourses = featuredCourses.length > 0 ? featuredCourses : (courses?.slice(0, 4) || []);

            if (displayCourses.length === 0) {
              return (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">لا توجد دورات متاحة حالياً</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayCourses.map((course) => {
                  if (!course) return null;
                  const cover = FEATURED_COVERS[course.category];
                  const isEnrolled = enrolledCourseIds.has(course.id);
                  return (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full flex flex-col" style={{ borderRadius: "16px" }}>
                        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          <img
                            src={cover?.img || "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-primary-teachers-22HWdhUvhChXUErJygCu7Z.webp"}
                            alt={course.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {cover?.badgeAr && (
                            <div className="absolute top-3 start-3">
                              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: cover.badgeColor }}>
                                {cover.badgeAr}
                              </span>
                            </div>
                          )}
                          {isEnrolled && (
                            <div className="absolute top-3 end-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-green-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> مسجّل
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-base mb-2 text-gray-800 group-hover:text-[#1D9E75] transition-colors" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            {course.titleAr}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-3">
                            {cover?.descAr || course.descriptionAr}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
                              <span className="font-bold text-gray-600">{cover?.rating || 4.5}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{cover?.students || 100}+ متعلم</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })()}

          <div className="text-center mt-10">
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="font-bold text-base px-8 h-12 rounded-xl border-2 hover:scale-[1.03] transition-all"
                style={{ borderColor: "#1D9E75", color: "#1D9E75" }}
              >
                عرض جميع الدورات
                <ArrowLeft className="w-4 h-4 ms-2 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FREE SIGNUP CTA BLOCK ===== */}
      <section className="py-16 sm:py-20" style={{ background: "#E1F5EE" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "#1D9E75" }}>
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "#1A1A2E", fontFamily: "'Cairo', sans-serif" }}
          >
            ابدأ مجاناً — 100 نقطة هدية
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            جرّب جميع الأدوات بدون بطاقة بنكية. 15-20% من تلاميذك قد يعانون من صعوبات لم تُكتشف بعد.
          </p>
          <a href={getLoginUrl()}>
            <Button
              size="lg"
              className="text-white font-bold px-10 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
              style={{ background: "#1D9E75", boxShadow: "0 8px 32px rgba(29,158,117,0.3)" }}
            >
              <Sparkles className="w-5 h-5 ms-2" />
              سجّل واحصل على نقاطك المجانية
            </Button>
          </a>
          <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            لا حاجة لبطاقة بنكية — تسجيل فوري في 30 ثانية
          </p>
        </div>
      </section>

      {/* ===== PREMIUM FOOTER ===== */}
      <footer className="text-white relative overflow-hidden" dir="rtl" style={{ background: "linear-gradient(165deg, #050D2E 0%, #0A1847 35%, #0D1B5E 65%, #101F6A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 start-1/4 w-96 h-96 bg-green-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 end-1/4 w-80 h-80 bg-blue-400/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #1D9E75 20%, #2BC48A 50%, #1D9E75 80%, transparent 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3.5 mb-6">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png" alt="Leader Academy" className="h-12 w-auto" />
                <div>
                  <p className="font-bold text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>Leader Academy</p>
                  <p className="text-green-300/80 text-xs">نحو تعليم رقمي متميز</p>
                </div>
              </div>
              <p className="text-blue-200/50 text-sm leading-[1.8] mb-7">
                Leader Academy: رائدك في توظيف الذكاء الاصطناعي لتطوير الأداء التربوي. منصة معتمدة مخصصة للمعلمين التونسيين.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { href: "https://www.facebook.com/leaderacademy.tn", label: "Facebook", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { href: "https://www.youtube.com/channel/UCEZWPqq_ONwn-CzD_GwLuVg", label: "YouTube", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                  { href: "https://www.linkedin.com/company/leaderacademy-tn", label: "LinkedIn", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { href: "https://www.instagram.com/leaderacademytn/", label: "Instagram", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-blue-300/70 hover:text-green-300 hover:bg-white/[0.1] hover:border-green-400/30 transition-all duration-300 hover:-translate-y-1" aria-label={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
                <h4 className="font-bold text-white text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>روابط سريعة</h4>
              </div>
              <ul className="space-y-3.5">
                {[
                  { href: "/", label: "الرئيسية" },
                  { href: "/teacher-tools", label: "أدواتنا الذكية" },
                  { href: "/courses", label: "الدورات التدريبية" },
                  { href: "/pricing", label: "الأسعار" },
                  { href: "/about", label: "من نحن" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/50 text-sm hover:text-green-300 transition-colors flex items-center gap-2.5 group">
                      <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-green-400" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                <h4 className="font-bold text-white text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>الدعم والتواصل</h4>
              </div>
              <ul className="space-y-3.5 mb-6">
                {[
                  { href: "/contact", label: "اتصل بنا" },
                  { href: "/privacy", label: "سياسة الخصوصية" },
                  { href: "/terms", label: "شروط الاستخدام" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-blue-200/50 text-sm hover:text-green-300 transition-colors flex items-center gap-2.5 group">
                      <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-green-400" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 pt-2 border-t border-white/[0.05]">
                <a href="mailto:leaderacademy216@gmail.com" className="flex items-center gap-2.5 text-blue-200/40 hover:text-green-300 transition-colors text-xs group">
                  <Mail className="w-3.5 h-3.5" />
                  <span dir="ltr">leaderacademy216@gmail.com</span>
                </a>
                <div className="flex items-center gap-2.5 text-blue-200/40 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">52 339 339 / 99 997 729</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-200/40 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>تونس، الجمهورية التونسية</span>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-400 to-yellow-500" />
                <h4 className="font-bold text-white text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>النشرة الذكية</h4>
              </div>
              <p className="text-blue-200/40 text-sm leading-relaxed mb-5">
                اشترك في نشرتنا الذكية واحصل على أحدث أدوات الذكاء الاصطناعي والنصائح البيداغوجية مباشرة.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/30" />
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pe-10 ps-4 py-3 text-sm text-white placeholder:text-blue-300/30 focus:outline-none focus:border-green-400/40 focus:bg-white/[0.08] transition-all"
                    dir="rtl"
                  />
                </div>
                <button className="px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1D9E75 0%, #15805E 100%)" }}>
                  <Send className="w-4 h-4 rotate-180" />
                  اشترك
                </button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-blue-200/30 text-xs">
                <ShieldCheck className="w-4 h-4 text-green-400/50" />
                <span>نحترم خصوصيتك - لا رسائل مزعجة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social bar */}
        <div className="relative border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-blue-200/30 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400/50" />
                  <span>+5000 مدرّس تونسي</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400/50" />
                  <span>تقييم 4.9/5</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400/50" />
                  <span>12 برنامج معتمد</span>
                </div>
              </div>
              <a href="https://wa.me/21652339339" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400/70 hover:text-green-300 hover:bg-green-500/15 transition-all text-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                تواصل معنا عبر واتساب
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06]" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-blue-300/40 text-xs">
                © 2026 Leader Academy. جميع الحقوق محفوظة. سجل تجاري: B08107512016
              </p>
              <div className="flex items-center gap-5 text-xs">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400/20 bg-green-500/[0.06]">
                  <Sparkles className="w-3.5 h-3.5 text-green-400/70" />
                  <span className="text-green-300/70">صنع بذكاء اصطناعي في تونس 🇹🇳</span>
                </span>
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
