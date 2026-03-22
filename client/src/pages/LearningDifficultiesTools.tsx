/**
 * صفحة أدوات مرافقة ذوي صعوبات واضطرابات التعلم
 * صفحة مستقلة غير مرتبطة بالمنهاج التونسي - قابلة للاستخدام في جميع الدول العربية
 */
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Brain, PenTool, BookOpen, Puzzle, HeartHandshake, Sparkles,
  ArrowRight, ChevronDown, ChevronUp, Star, Shield, Users,
  Eye, Ear, Hand, GraduationCap, FileText, BarChart3,
  Lightbulb, Target, Clock, CheckCircle2, AlertTriangle,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ===== Language helper =====
const useLang = () => {
  const stored = typeof window !== "undefined" ? localStorage.getItem("leader-academy-lang") : null;
  return (stored as "ar" | "fr" | "en") || "ar";
};
const t = (ar: string, fr: string, en: string, lang: string) =>
  lang === "fr" ? fr : lang === "en" ? en : ar;

// ===== Tool definitions =====
interface LDTool {
  id: string;
  href: string;
  icon: LucideIcon;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  status: "available" | "coming_soon";
  gradient: string;
  iconBg: string;
  stepsAr: string[];
  stepsFr: string[];
  stepsEn: string[];
  targetAr: string;
  targetFr: string;
  targetEn: string;
}

const LD_TOOLS: LDTool[] = [
  {
    id: "handwriting",
    href: "/handwriting-analyzer",
    icon: PenTool,
    nameAr: "محلل خط اليد الذكي",
    nameFr: "Analyseur d'écriture IA",
    nameEn: "AI Handwriting Analyzer",
    descAr: "تحليل خط يد التلميذ بالذكاء الاصطناعي للكشف المبكر عن صعوبات واضطرابات التعلم مثل عسر الكتابة (Dysgraphia) وعسر القراءة (Dyslexia)",
    descFr: "Analyse de l'écriture manuscrite par IA pour la détection précoce des troubles d'apprentissage comme la dysgraphie et la dyslexie",
    descEn: "AI-powered handwriting analysis for early detection of learning difficulties such as dysgraphia and dyslexia",
    status: "available",
    gradient: "linear-gradient(135deg, #00695C 0%, #26A69A 100%)",
    iconBg: "#E0F2F1",
    stepsAr: ["تصوير عيّنة خط اليد", "تحليل ذكي للحروف والكلمات", "كشف مؤشرات صعوبات التعلم", "تقرير مفصّل مع توصيات المرافقة"],
    stepsFr: ["Photographier l'écriture", "Analyse IA des lettres et mots", "Détection des indicateurs de troubles", "Rapport détaillé avec recommandations"],
    stepsEn: ["Photograph handwriting sample", "AI analysis of letters and words", "Detect learning difficulty indicators", "Detailed report with recommendations"],
    targetAr: "عسر الكتابة • عسر القراءة • اضطرابات التنسيق الحركي",
    targetFr: "Dysgraphie • Dyslexie • Troubles de coordination motrice",
    targetEn: "Dysgraphia • Dyslexia • Motor coordination disorders",
  },
  {
    id: "learning-companion",
    href: "/pedagogical-companion",
    icon: HeartHandshake,
    nameAr: "المرافق البيداغوجي الخاص",
    nameFr: "Accompagnateur pédagogique spécialisé",
    nameEn: "Specialized Pedagogical Companion",
    descAr: "مساعد ذكي يولّد خطط مرافقة فردية لكل تلميذ حسب نوع الصعوبة مع أنشطة علاجية وتمارين مكيّفة",
    descFr: "Assistant IA qui génère des plans d'accompagnement individuels selon le type de difficulté avec des activités thérapeutiques adaptées",
    descEn: "AI assistant generating individual support plans per difficulty type with adapted therapeutic activities",
    status: "available",
    gradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
    iconBg: "#F3E5F5",
    stepsAr: ["تحديد نوع الصعوبة أو الاضطراب", "توليد خطة مرافقة فردية", "اقتراح أنشطة علاجية مكيّفة", "متابعة التقدم وتعديل الخطة"],
    stepsFr: ["Identifier le type de difficulté", "Générer un plan individuel", "Proposer des activités adaptées", "Suivre les progrès"],
    stepsEn: ["Identify difficulty type", "Generate individual plan", "Suggest adapted activities", "Track progress"],
    targetAr: "جميع أنواع صعوبات واضطرابات التعلم",
    targetFr: "Tous types de troubles d'apprentissage",
    targetEn: "All types of learning difficulties",
  },
  {
    id: "content-adapter",
    href: "/content-adapter",
    icon: BookOpen,
    nameAr: "مكيّف المحتوى التعليمي",
    nameFr: "Adaptateur de contenu pédagogique",
    nameEn: "Educational Content Adapter",
    descAr: "يأخذ أي درس عادي ويعيد صياغته بشكل مبسّط ومكيّف لذوي الصعوبات: نص أكبر، جمل أقصر، صور داعمة، تعليمات مجزّأة",
    descFr: "Prend n'importe quelle leçon et la reformule de manière simplifiée et adaptée : texte plus grand, phrases courtes, images de support",
    descEn: "Takes any lesson and reformulates it in a simplified, adapted way: larger text, shorter sentences, supporting images",
    status: "available",
    gradient: "linear-gradient(135deg, #E65100 0%, #FF8F00 100%)",
    iconBg: "#FFF3E0",
    stepsAr: ["رفع الدرس الأصلي", "اختيار نوع التكييف المطلوب", "توليد النسخة المكيّفة تلقائياً", "تحميل بصيغة Word أو PDF"],
    stepsFr: ["Téléverser la leçon originale", "Choisir le type d'adaptation", "Générer la version adaptée", "Télécharger en Word ou PDF"],
    stepsEn: ["Upload original lesson", "Choose adaptation type", "Generate adapted version", "Download as Word or PDF"],
    targetAr: "عسر القراءة • بطء التعلم • اضطراب نقص الانتباه",
    targetFr: "Dyslexie • Lenteur d'apprentissage • TDAH",
    targetEn: "Dyslexia • Slow learning • ADHD",
  },
  {
    id: "remedial-exercises",
    href: "/therapeutic-exercises",
    icon: Puzzle,
    nameAr: "مولّد التمارين العلاجية",
    nameFr: "Générateur d'exercices thérapeutiques",
    nameEn: "Therapeutic Exercise Generator",
    descAr: "توليد تمارين تدريجية مخصصة لكل نوع اضطراب: تمارين بصرية لعسر القراءة، حركية لعسر الكتابة، تركيز لفرط النشاط",
    descFr: "Générer des exercices progressifs par type de trouble : visuels pour la dyslexie, moteurs pour la dysgraphie, concentration pour le TDAH",
    descEn: "Generate progressive exercises per disorder type: visual for dyslexia, motor for dysgraphia, focus for ADHD",
    status: "available",
    gradient: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
    iconBg: "#E3F2FD",
    stepsAr: ["اختيار نوع الاضطراب والمستوى", "تحديد المهارة المستهدفة", "توليد سلسلة تمارين تدريجية", "طباعة أو عرض تفاعلي"],
    stepsFr: ["Choisir le trouble et le niveau", "Définir la compétence ciblée", "Générer une série progressive", "Imprimer ou afficher"],
    stepsEn: ["Choose disorder and level", "Define target skill", "Generate progressive series", "Print or display"],
    targetAr: "عسر القراءة • عسر الكتابة • عسر الحساب • فرط النشاط",
    targetFr: "Dyslexie • Dysgraphie • Dyscalculie • TDAH",
    targetEn: "Dyslexia • Dysgraphia • Dyscalculia • ADHD",
  },
  {
    id: "progress-tracker",
    href: "#",
    icon: BarChart3,
    nameAr: "تقرير المتابعة الفردي",
    nameFr: "Rapport de suivi individuel",
    nameEn: "Individual Progress Report",
    descAr: "توليد تقارير دورية لمتابعة تطور التلميذ ذي الصعوبات مع رسوم بيانية ومقارنات زمنية وتوصيات",
    descFr: "Générer des rapports périodiques de suivi avec graphiques, comparaisons temporelles et recommandations",
    descEn: "Generate periodic progress reports with charts, time comparisons and recommendations",
    status: "coming_soon",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
    iconBg: "#E8F5E9",
    stepsAr: ["إدخال بيانات التقييم الدوري", "تحليل التطور عبر الزمن", "توليد رسوم بيانية مقارنة", "تقرير شامل مع توصيات"],
    stepsFr: ["Saisir les données d'évaluation", "Analyser l'évolution", "Générer des graphiques", "Rapport avec recommandations"],
    stepsEn: ["Enter assessment data", "Analyze progress over time", "Generate comparison charts", "Report with recommendations"],
    targetAr: "جميع أنواع صعوبات التعلم • متابعة طويلة المدى",
    targetFr: "Tous types de troubles • Suivi à long terme",
    targetEn: "All difficulty types • Long-term tracking",
  },
];

// ===== Disorder types for the info section =====
const DISORDERS = [
  { icon: Eye, nameAr: "عسر القراءة", nameFr: "Dyslexie", nameEn: "Dyslexia", color: "#E53935", descAr: "صعوبة في القراءة والتهجئة وفك رموز الكلمات" },
  { icon: PenTool, nameAr: "عسر الكتابة", nameFr: "Dysgraphie", nameEn: "Dysgraphia", color: "#8E24AA", descAr: "صعوبة في الكتابة اليدوية والتنسيق الحركي الدقيق" },
  { icon: Target, nameAr: "عسر الحساب", nameFr: "Dyscalculie", nameEn: "Dyscalculia", color: "#1565C0", descAr: "صعوبة في فهم الأرقام والعمليات الحسابية" },
  { icon: Lightbulb, nameAr: "فرط النشاط ونقص الانتباه", nameFr: "TDAH", nameEn: "ADHD", color: "#EF6C00", descAr: "صعوبة في التركيز والانتباه مع فرط في الحركة" },
  { icon: Ear, nameAr: "اضطراب المعالجة السمعية", nameFr: "Trouble du traitement auditif", nameEn: "Auditory Processing Disorder", color: "#00897B", descAr: "صعوبة في معالجة وفهم المعلومات السمعية" },
  { icon: Hand, nameAr: "عسر الأداء الحركي", nameFr: "Dyspraxie", nameEn: "Dyspraxia", color: "#5D4037", descAr: "صعوبة في التنسيق الحركي والتخطيط للحركات" },
];

// ===== Statistics =====
const STATS = [
  { valueAr: "15-20%", labelAr: "من التلاميذ يعانون من صعوبات تعلم", labelFr: "des élèves ont des difficultés", labelEn: "of students have learning difficulties" },
  { valueAr: "80%", labelAr: "يمكن تحسينهم بالكشف المبكر", labelFr: "peuvent s'améliorer avec détection précoce", labelEn: "can improve with early detection" },
  { valueAr: "+50%", labelAr: "تحسّن في الأداء مع المرافقة المناسبة", labelFr: "d'amélioration avec accompagnement", labelEn: "improvement with proper support" },
];

export default function LearningDifficultiesTools() {
  const lang = useLang();
  const { user } = useAuth();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [showAllDisorders, setShowAllDisorders] = useState(false);

  const T = (ar: string, fr: string, en: string) => t(ar, fr, en, lang);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50" dir="rtl">
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-purple-600/5 to-blue-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-6">
              <HeartHandshake className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">
                {T("لجميع الدول العربية — غير مرتبط بمنهاج محدد", "Pour tous les pays arabes — Non lié à un programme spécifique", "For all Arab countries — Not tied to a specific curriculum")}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {T("أدوات مرافقة ذوي", "Outils d'accompagnement des", "Support Tools for")}
              <br />
              <span className="bg-gradient-to-l from-teal-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {T("صعوبات واضطرابات التعلم", "troubles d'apprentissage", "Learning Difficulties")}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              {T(
                "أدوات ذكاء اصطناعي متخصصة تساعد المعلمين والمرافقين على الكشف المبكر عن صعوبات التعلم وتقديم الدعم المناسب لكل تلميذ",
                "Des outils d'IA spécialisés pour aider les enseignants à détecter précocement les troubles d'apprentissage et fournir un soutien adapté",
                "Specialized AI tools to help teachers detect learning difficulties early and provide appropriate support for each student"
              )}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 shadow-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-1">{stat.valueAr}</div>
                  <div className="text-sm text-slate-500">
                    {T(stat.labelAr, stat.labelFr, stat.labelEn)}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/handwriting-analyzer">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 text-base px-8 py-6 rounded-xl shadow-lg shadow-teal-600/20">
                  <Brain className="h-5 w-5" />
                  {T("ابدأ بتحليل خط اليد", "Commencer l'analyse d'écriture", "Start Handwriting Analysis")}
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6 rounded-xl border-slate-300"
                onClick={() => document.getElementById("disorders-section")?.scrollIntoView({ behavior: "smooth" })}>
                <BookOpen className="h-5 w-5" />
                {T("تعرّف على الاضطرابات", "Découvrir les troubles", "Learn About Disorders")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tools Grid ===== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {T("الأدوات المتاحة", "Outils disponibles", "Available Tools")}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {T(
              "مجموعة أدوات ذكاء اصطناعي متكاملة لمرافقة التلاميذ ذوي صعوبات التعلم في كل مراحل الدعم",
              "Une suite complète d'outils IA pour accompagner les élèves en difficulté à chaque étape",
              "A complete AI toolkit to support students with learning difficulties at every stage"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LD_TOOLS.map((tool) => {
            const isExpanded = expandedTool === tool.id;
            const isAvailable = tool.status === "available";
            const ToolIcon = tool.icon;

            return (
              <Card key={tool.id} className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                isAvailable ? "border-slate-200 hover:border-teal-300" : "border-slate-200/60 hover:border-purple-200"
              }`}>
                {/* Status badge */}
                <div className="absolute top-3 left-3 z-10">
                  {isAvailable ? (
                    <Badge className="bg-teal-500 text-white border-0 shadow-sm">
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      {T("متاحة", "Disponible", "Available")}
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm">
                      <Clock className="h-3 w-3 ml-1" />
                      {T("قريباً", "Bientôt", "Coming Soon")}
                    </Badge>
                  )}
                </div>

                {/* Gradient header */}
                <div className="h-2 w-full" style={{ background: tool.gradient }} />

                <CardContent className="p-6">
                  {/* Icon + Name */}
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: tool.iconBg }}>
                      <ToolIcon className="h-7 w-7" style={{ color: tool.gradient.includes("#00695C") ? "#00695C" : tool.gradient.includes("#4A148C") ? "#4A148C" : tool.gradient.includes("#E65100") ? "#E65100" : tool.gradient.includes("#1565C0") ? "#1565C0" : "#2E7D32" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {T(tool.nameAr, tool.nameFr, tool.nameEn)}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {T(tool.descAr, tool.descFr, tool.descEn)}
                      </p>
                    </div>
                  </div>

                  {/* Target disorders */}
                  <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-400 mb-1">
                      {T("يستهدف:", "Cible:", "Targets:")}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      {T(tool.targetAr, tool.targetFr, tool.targetEn)}
                    </div>
                  </div>

                  {/* Expand/Collapse steps */}
                  <button
                    onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-500"
                  >
                    <span>{T("كيف تعمل الأداة؟", "Comment ça marche ?", "How does it work?")}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 px-1">
                      {(lang === "fr" ? tool.stepsFr : lang === "en" ? tool.stepsEn : tool.stepsAr).map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: tool.gradient }}>
                            {i + 1}
                          </div>
                          <span className="text-sm text-slate-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  <div className="mt-4">
                    {isAvailable ? (
                      <Link href={tool.href}>
                        <Button className="w-full gap-2 rounded-xl" style={{ background: tool.gradient.replace("linear-gradient(135deg, ", "").split(" ")[0] }}>
                          {T("افتح الأداة", "Ouvrir l'outil", "Open Tool")}
                          <ArrowRight className="h-4 w-4 rotate-180" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full gap-2 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed">
                        <Sparkles className="h-4 w-4" />
                        {T("قيد التطوير — قريباً", "En développement — Bientôt", "In development — Coming Soon")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== Disorders Info Section ===== */}
      <section id="disorders-section" className="bg-gradient-to-b from-white to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {T("أنواع صعوبات واضطرابات التعلم", "Types de troubles d'apprentissage", "Types of Learning Difficulties")}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {T(
                "تعرّف على أبرز أنواع صعوبات التعلم التي يمكن لأدواتنا المساعدة في كشفها ومرافقتها",
                "Découvrez les principaux types de troubles que nos outils peuvent aider à détecter et accompagner",
                "Learn about the main types of learning difficulties our tools can help detect and support"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DISORDERS.slice(0, showAllDisorders ? DISORDERS.length : 3).map((d, i) => {
              const DIcon = d.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + "15" }}>
                      <DIcon className="h-5 w-5" style={{ color: d.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{T(d.nameAr, d.nameFr, d.nameEn)}</h3>
                      <span className="text-xs text-slate-400">{d.nameFr}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{d.descAr}</p>
                </div>
              );
            })}
          </div>

          {!showAllDisorders && DISORDERS.length > 3 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => setShowAllDisorders(true)} className="gap-2">
                <ChevronDown className="h-4 w-4" />
                {T("عرض جميع الاضطرابات", "Voir tous les troubles", "Show all disorders")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== Why This Matters Section ===== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }} />
          
          <div className="relative">
            <div className="text-center max-w-3xl mx-auto">
              <Shield className="h-12 w-12 mx-auto mb-4 text-teal-200" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {T("لماذا الكشف المبكر مهم؟", "Pourquoi la détection précoce est importante ?", "Why is early detection important?")}
              </h2>
              <p className="text-lg text-teal-100 leading-relaxed mb-8">
                {T(
                  "الكشف المبكر عن صعوبات التعلم يمكن أن يغيّر مسار حياة التلميذ بالكامل. المعلم هو أول من يلاحظ العلامات، وأدواتنا تساعده على تحويل ملاحظاته إلى تشخيص أولي دقيق وخطة مرافقة فعّالة.",
                  "La détection précoce des troubles d'apprentissage peut changer le cours de la vie d'un élève. L'enseignant est le premier à remarquer les signes, et nos outils l'aident à transformer ses observations en un diagnostic initial précis.",
                  "Early detection of learning difficulties can change a student's entire life trajectory. The teacher is the first to notice the signs, and our tools help transform observations into an accurate initial diagnosis."
                )}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Eye, labelAr: "كشف مبكر ودقيق", labelFr: "Détection précoce", labelEn: "Early detection" },
                  { icon: FileText, labelAr: "تقارير مهنية موثّقة", labelFr: "Rapports professionnels", labelEn: "Professional reports" },
                  { icon: Users, labelAr: "تعاون مع الأولياء والمختصين", labelFr: "Collaboration parents/spécialistes", labelEn: "Parent/specialist collaboration" },
                ].map((item, i) => {
                  const IIcon = item.icon;
                  return (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <IIcon className="h-8 w-8 mx-auto mb-2 text-teal-200" />
                      <div className="text-sm font-medium">{T(item.labelAr, item.labelFr, item.labelEn)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA Footer ===== */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            {T(
              "هل لديك اقتراحات لأدوات جديدة؟ تواصل معنا لنبنيها معاً",
              "Vous avez des suggestions pour de nouveaux outils ? Contactez-nous",
              "Have suggestions for new tools? Contact us to build them together"
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/handwriting-analyzer">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl">
                <Brain className="h-5 w-5" />
                {T("جرّب محلل خط اليد الآن", "Essayer l'analyseur d'écriture", "Try Handwriting Analyzer Now")}
              </Button>
            </Link>
            <Link href="/teacher-tools">
              <Button size="lg" variant="outline" className="gap-2 rounded-xl">
                {T("العودة لجميع الأدوات", "Retour aux outils", "Back to All Tools")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
