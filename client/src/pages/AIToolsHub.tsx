import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import {
  Bot, Search, FileEdit, Palette, BarChart3,
  FileCheck, Theater, Film, ScanLine, Calendar,
  HeartHandshake, Sparkles, ArrowRight, Mic,
  PenTool, Coins, Clapperboard, Camera, MonitorPlay,
  Zap, ClipboardCheck, Lightbulb, Video, BookOpen,
  type LucideIcon, ChevronRight, Star, Shield, Crown,
  Play, CheckCircle2, ExternalLink, Info,
} from "lucide-react";

/* ───────── Types ───────── */
interface ToolInfo {
  id: string;
  href: string;
  icon: LucideIcon;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  whatAr: string;
  whatFr: string;
  whatEn: string;
  whyAr: string;
  whyFr: string;
  whyEn: string;
  howAr: string[];
  howFr: string[];
  howEn: string[];
  gradient: string;
  badgeAr: string;
  badgeFr: string;
  badgeEn: string;
  isNew?: boolean;
  isExclusive?: boolean;
}

interface CategoryInfo {
  id: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleFr: string;
  subtitleEn: string;
  icon: LucideIcon;
  gradient: string;
  tools: ToolInfo[];
}

/* ───────── Data ───────── */
const CATEGORIES: CategoryInfo[] = [
  {
    id: "preparation",
    titleAr: "أدوات التحضير والتخطيط",
    titleFr: "Préparation & Planification",
    titleEn: "Preparation & Planning",
    subtitleAr: "جهّز دروسك ومخططاتك بذكاء اصطناعي متقدم",
    subtitleFr: "Préparez vos cours et plannings avec une IA avancée",
    subtitleEn: "Prepare your lessons and plans with advanced AI",
    icon: Zap,
    gradient: "linear-gradient(135deg, #1A237E 0%, #1565C0 100%)",
    tools: [
      {
        id: "edugpt",
        href: "/assistant",
        icon: Bot,
        nameAr: "EDUGPT — المساعد البيداغوجي",
        nameFr: "EDUGPT — Assistant pédagogique",
        nameEn: "EDUGPT — Pedagogical Assistant",
        descAr: "مساعدك الذكي لإعداد الجذاذات والمخططات والدروس تلقائياً",
        descFr: "Votre assistant IA pour préparer fiches et plannings automatiquement",
        descEn: "Your AI assistant for preparing lesson plans and schedules automatically",
        whatAr: "مساعد ذكاء اصطناعي يفهم المنهج التونسي ويولّد جذاذات ومخططات ودروس كاملة بضغطة زر.",
        whatFr: "Un assistant IA qui comprend le programme tunisien et génère fiches, plannings et cours complets en un clic.",
        whatEn: "An AI assistant that understands the Tunisian curriculum and generates complete lesson plans, schedules and courses in one click.",
        whyAr: "لأن ساعات التحضير المرهقة يمكن اختصارها إلى دقائق، مع ضمان التوافق مع المعايير الرسمية.",
        whyFr: "Parce que des heures de préparation peuvent être réduites à quelques minutes, tout en respectant les normes officielles.",
        whyEn: "Because exhausting hours of preparation can be reduced to minutes, while ensuring compliance with official standards.",
        howAr: ["اختر المادة والمستوى والكفاية", "اكتب الموضوع أو اختر من المنهج", "اضغط 'توليد' واحصل على الجذاذة كاملة", "صدّر بصيغة PDF أو Word"],
        howFr: ["Choisir matière, niveau et compétence", "Écrire le sujet ou choisir du programme", "Cliquer 'Générer' pour la fiche complète", "Exporter en PDF ou Word"],
        howEn: ["Choose subject, level and competency", "Write topic or pick from curriculum", "Click 'Generate' for complete plan", "Export as PDF or Word"],
        gradient: "linear-gradient(135deg, #1A237E, #1565C0)",
        badgeAr: "الأكثر استخداماً",
        badgeFr: "Le plus utilisé",
        badgeEn: "Most Popular",
      },
      {
        id: "annual-plan",
        href: "/annual-plan",
        icon: Calendar,
        nameAr: "التوزيع السنوي الذكي",
        nameFr: "Planification annuelle IA",
        nameEn: "AI Annual Planning",
        descAr: "توليد المخطط السنوي الكامل لأي مادة ومستوى حسب البرامج الرسمية",
        descFr: "Générer le planning annuel complet selon les programmes officiels",
        descEn: "Generate complete annual plan per official curriculum",
        whatAr: "أداة تولّد التوزيع السنوي الكامل لأي مادة ومستوى وفق البرامج الرسمية التونسية.",
        whatFr: "Un outil qui génère le planning annuel complet pour toute matière et niveau selon les programmes officiels tunisiens.",
        whatEn: "A tool that generates the complete annual plan for any subject and level per official Tunisian programs.",
        whyAr: "لتوفير وقت إعداد التوزيع السنوي وضمان تغطية كاملة للمنهج.",
        whyFr: "Pour gagner du temps sur la planification annuelle et assurer une couverture complète du programme.",
        whyEn: "To save time on annual planning and ensure complete curriculum coverage.",
        howAr: ["اختر المادة والمستوى", "حدد عدد الأسابيع والعطل", "اضغط 'توليد' للتوزيع الكامل", "طباعة أو تصدير PDF"],
        howFr: ["Choisir matière et niveau", "Définir semaines et vacances", "Cliquer 'Générer'", "Imprimer ou exporter PDF"],
        howEn: ["Choose subject & level", "Set weeks and holidays", "Click 'Generate'", "Print or export PDF"],
        gradient: "linear-gradient(135deg, #0D47A1, #1976D2)",
        badgeAr: "توزيع رسمي",
        badgeFr: "Planning officiel",
        badgeEn: "Official Planning",
      },
      {
        id: "curriculum-map",
        href: "/curriculum-map",
        icon: BarChart3,
        nameAr: "Curriculum GPS — خريطة المنهج",
        nameFr: "Curriculum GPS — Carte du programme",
        nameEn: "Curriculum GPS — Curriculum Map",
        descAr: "تتبع تقدمك في تغطية المنهج الدراسي بذكاء مع تنبيهات",
        descFr: "Suivez votre progression dans le programme avec alertes",
        descEn: "Track your curriculum coverage progress with alerts",
        whatAr: "لوحة تحكم ذكية تتتبع تقدمك في تغطية المنهج الدراسي مع تنبيهات التأخر والتقدم.",
        whatFr: "Un tableau de bord intelligent qui suit votre progression dans le programme avec alertes de retard/avance.",
        whatEn: "A smart dashboard that tracks your curriculum coverage progress with delay/advance alerts.",
        whyAr: "لضمان تغطية كاملة للمنهج قبل نهاية السنة وتجنب الفجوات.",
        whyFr: "Pour assurer une couverture complète du programme avant la fin de l'année et éviter les lacunes.",
        whyEn: "To ensure complete curriculum coverage before year-end and avoid gaps.",
        howAr: ["سجّل الدروس المنجزة", "تابع نسبة التقدم", "احصل على تنبيهات ذكية", "قارن مع الزملاء"],
        howFr: ["Enregistrer les leçons faites", "Suivre le % de progression", "Recevoir des alertes", "Comparer avec collègues"],
        howEn: ["Log completed lessons", "Track % progress", "Get smart alerts", "Compare with peers"],
        gradient: "linear-gradient(135deg, #1565C0, #42A5F5)",
        badgeAr: "تتبع ذكي",
        badgeFr: "Suivi intelligent",
        badgeEn: "Smart Tracking",
      },
      {
        id: "repartition",
        href: "/repartition-journaliere",
        icon: Calendar,
        nameAr: "التوزيع اليومي — Répartition Journalière",
        nameFr: "Répartition Journalière",
        nameEn: "Daily Schedule",
        descAr: "توليد التوزيع اليومي لحصص اللغة الفرنسية وفق المنهج الرسمي",
        descFr: "Générer la répartition journalière des séances de français",
        descEn: "Generate daily French language session schedule",
        whatAr: "أداة متخصصة لتوليد التوزيع اليومي لحصص اللغة الفرنسية وفق المنهج التونسي الرسمي.",
        whatFr: "Un outil spécialisé pour générer la répartition journalière des séances de français selon le curriculum tunisien.",
        whatEn: "A specialized tool for generating daily French language session schedules per the official Tunisian curriculum.",
        whyAr: "لتنظيم حصص الفرنسية يومياً بشكل متوافق مع المنهج الرسمي.",
        whyFr: "Pour organiser les séances de français quotidiennement selon le programme officiel.",
        whyEn: "To organize daily French sessions in compliance with the official curriculum.",
        howAr: ["أدخل معلومات الوحدة", "حدد الحصص المطلوبة", "توليد التوزيع تلقائياً", "تصدير PDF"],
        howFr: ["Entrer les infos de l'unité", "Définir les séances", "Génération automatique", "Export PDF"],
        howEn: ["Enter unit info", "Define sessions", "Auto-generate", "Export PDF"],
        gradient: "linear-gradient(135deg, #0277BD, #4FC3F7)",
        badgeAr: "فرنسية",
        badgeFr: "Français",
        badgeEn: "French",
      },
    ],
  },
  {
    id: "evaluation",
    titleAr: "أدوات التقييم والتصحيح",
    titleFr: "Évaluation & Correction",
    titleEn: "Evaluation & Grading",
    subtitleAr: "قيّم وصحّح وحلّل بدقة المعايير التونسية الرسمية",
    subtitleFr: "Évaluez, corrigez et analysez selon les critères officiels",
    subtitleEn: "Evaluate, grade and analyze per official standards",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
    tools: [
      {
        id: "inspector",
        href: "/inspector",
        icon: Search,
        nameAr: "المتفقد الذكي",
        nameFr: "Inspecteur IA",
        nameEn: "AI Inspector",
        descAr: "تحليل وتقييم الجذاذات والاختبارات وفق المعايير الرسمية",
        descFr: "Analyser fiches et examens selon les normes officielles",
        descEn: "Analyze lesson plans and exams per official standards",
        whatAr: "وكيل ذكاء اصطناعي يحلل جذاذاتك واختباراتك ومخططاتك ويقيّمها وفق المعايير الرسمية التونسية.",
        whatFr: "Un agent IA qui analyse vos fiches, examens et plannings selon les normes officielles tunisiennes.",
        whatEn: "An AI agent that analyzes your lesson plans, exams and schedules per official Tunisian standards.",
        whyAr: "لأن التقييم الذاتي صعب، والمتفقد الذكي يكشف نقاط الضعف قبل التفتيش الحقيقي.",
        whyFr: "Parce que l'auto-évaluation est difficile, l'inspecteur IA révèle les faiblesses avant l'inspection réelle.",
        whyEn: "Because self-evaluation is hard, the AI inspector reveals weaknesses before the real inspection.",
        howAr: ["ارفع الجذاذة أو الاختبار", "اختر نوع الوثيقة", "احصل على تقرير مفصّل", "طبّق اقتراحات التحسين"],
        howFr: ["Téléverser fiche/examen", "Choisir le type de document", "Obtenir un rapport détaillé", "Appliquer les suggestions"],
        howEn: ["Upload lesson/exam", "Choose document type", "Get detailed report", "Apply suggestions"],
        gradient: "linear-gradient(135deg, #4A148C, #7B1FA2)",
        badgeAr: "تقييم رسمي",
        badgeFr: "Évaluation officielle",
        badgeEn: "Official Evaluation",
      },
      {
        id: "blind-grading",
        href: "/blind-grading",
        icon: FileCheck,
        nameAr: "مساعد التصحيح الذكي",
        nameFr: "Correction intelligente IA",
        nameEn: "Smart Grading Assistant",
        descAr: "تصحيح ذكي لأوراق التلاميذ حسب المعايير التونسية (مع1، مع2، مع3)",
        descFr: "Correction intelligente des copies selon les critères tunisiens (M1, M2, M3)",
        descEn: "AI-powered student paper grading with Tunisian criteria (M1, M2, M3)",
        whatAr: "أداة تصحيح ذكية تحلل أوراق التلاميذ وتسند الأعداد تلقائياً وفق معايير مع1 ومع2 ومع3.",
        whatFr: "Un outil de correction intelligent qui analyse les copies et attribue les notes selon les critères M1, M2, M3.",
        whatEn: "A smart grading tool that analyzes student papers and assigns grades per M1, M2, M3 criteria.",
        whyAr: "لتوفير ساعات التصحيح وضمان العدالة والدقة في إسناد الأعداد.",
        whyFr: "Pour gagner des heures de correction et assurer l'équité et la précision des notes.",
        whyEn: "To save hours of grading and ensure fairness and accuracy in scoring.",
        howAr: ["صوّر ورقة التلميذ", "ارفعها للتحليل الذكي", "راجع الأعداد المقترحة", "صدّر التقرير الفردي"],
        howFr: ["Photographier la copie", "Téléverser pour analyse", "Vérifier les notes proposées", "Exporter le rapport"],
        howEn: ["Photograph student paper", "Upload for analysis", "Review proposed grades", "Export report"],
        gradient: "linear-gradient(135deg, #6A1B9A, #AB47BC)",
        badgeAr: "تصحيح آلي",
        badgeFr: "Correction auto",
        badgeEn: "Auto Grading",
        isNew: true,
      },
      {
        id: "exam-builder",
        href: "/exam-builder",
        icon: FileEdit,
        nameAr: "بناء الاختبارات الذكي",
        nameFr: "Créateur d'examens IA",
        nameEn: "AI Exam Builder",
        descAr: "توليد اختبارات كاملة مع الرسومات وجدول التقييم الرسمي",
        descFr: "Générer des examens complets avec illustrations et barème officiel",
        descEn: "Generate complete exams with illustrations and official grading table",
        whatAr: "أداة تولّد اختبارات كاملة بالسند والتعليمات والرسومات وجدول إسناد الأعداد الرسمي.",
        whatFr: "Un outil qui génère des examens complets avec contexte, questions, illustrations et barème officiel.",
        whatEn: "A tool that generates complete exams with context, questions, illustrations and official grading table.",
        whyAr: "لبناء اختبارات احترافية متوافقة مع المعايير الرسمية في دقائق بدل ساعات.",
        whyFr: "Pour créer des examens professionnels conformes aux normes officielles en minutes au lieu d'heures.",
        whyEn: "To build professional exams compliant with official standards in minutes instead of hours.",
        howAr: ["اختر المادة والمستوى والثلاثي", "حدد المعايير والكفايات", "اضغط 'توليد' للاختبار الكامل", "طباعة مع جدول التقييم"],
        howFr: ["Choisir matière, niveau, trimestre", "Définir critères et compétences", "Cliquer 'Générer'", "Imprimer avec barème"],
        howEn: ["Choose subject, level, term", "Set criteria & competencies", "Click 'Generate'", "Print with grading table"],
        gradient: "linear-gradient(135deg, #7B1FA2, #CE93D8)",
        badgeAr: "اختبارات رسمية",
        badgeFr: "Examens officiels",
        badgeEn: "Official Exams",
      },
    ],
  },
  {
    id: "creativity",
    titleAr: "أدوات الإبداع والإنتاج",
    titleFr: "Créativité & Production",
    titleEn: "Creativity & Production",
    subtitleAr: "حوّل دروسك إلى تجارب تعليمية مبتكرة ومحتوى مرئي جذاب",
    subtitleFr: "Transformez vos cours en expériences innovantes et contenu visuel captivant",
    subtitleEn: "Transform your lessons into innovative experiences and engaging visual content",
    icon: Lightbulb,
    gradient: "linear-gradient(135deg, #E65100 0%, #FF9800 100%)",
    tools: [
      {
        id: "visual-studio",
        href: "/visual-studio",
        icon: Palette,
        nameAr: "Leader Visual Studio",
        nameFr: "Leader Visual Studio",
        nameEn: "Leader Visual Studio",
        descAr: "توليد صور تعليمية وإنفوغرافيك بـ 6 أنماط مختلفة بالذكاء الاصطناعي",
        descFr: "Générer images éducatives et infographies en 6 styles IA",
        descEn: "Generate educational images and infographics in 6 AI styles",
        whatAr: "استوديو إبداعي يولّد صوراً تعليمية وإنفوغرافيك وبطاقات تعلم بـ 6 أنماط فنية مختلفة.",
        whatFr: "Un studio créatif qui génère images éducatives, infographies et cartes d'apprentissage en 6 styles artistiques.",
        whatEn: "A creative studio that generates educational images, infographics and learning cards in 6 artistic styles.",
        whyAr: "لأن المحتوى المرئي يزيد استيعاب التلاميذ بنسبة 65% مقارنة بالنص فقط.",
        whyFr: "Parce que le contenu visuel augmente la compréhension des élèves de 65% par rapport au texte seul.",
        whyEn: "Because visual content increases student comprehension by 65% compared to text alone.",
        howAr: ["اختر نمط الصورة", "اكتب الوصف بالعربية", "اضغط 'توليد'", "حمّل بجودة عالية"],
        howFr: ["Choisir le style", "Décrire en texte", "Cliquer 'Générer'", "Télécharger en HD"],
        howEn: ["Choose style", "Describe in text", "Click 'Generate'", "Download in HD"],
        gradient: "linear-gradient(135deg, #E65100, #FF9800)",
        badgeAr: "6 أنماط فنية",
        badgeFr: "6 styles artistiques",
        badgeEn: "6 Art Styles",
      },
      {
        id: "drama-engine",
        href: "/drama-engine",
        icon: Theater,
        nameAr: "محرك الدراما التعليمية",
        nameFr: "Moteur de théâtre éducatif",
        nameEn: "Educational Drama Engine",
        descAr: "حوّل أي درس إلى مسرحية تفاعلية مع توزيع الأدوار والحوارات",
        descFr: "Transformez toute leçon en pièce de théâtre interactive",
        descEn: "Transform any lesson into an interactive play",
        whatAr: "محرك يحوّل أي درس إلى مسرحية تفاعلية كاملة مع توزيع الأدوار والحوارات والوسائل المسرحية.",
        whatFr: "Un moteur qui transforme toute leçon en pièce de théâtre interactive avec rôles, dialogues et accessoires.",
        whatEn: "An engine that transforms any lesson into a complete interactive play with roles, dialogues and props.",
        whyAr: "لأن التعلم بالدراما يرفع نسبة المشاركة والاحتفاظ بالمعلومات بشكل كبير.",
        whyFr: "Parce que l'apprentissage par le théâtre augmente considérablement la participation et la rétention.",
        whyEn: "Because drama-based learning significantly increases participation and information retention.",
        howAr: ["أدخل موضوع الدرس", "حدد عدد الشخصيات", "احصل على السيناريو الكامل", "وزّع الأدوار وابدأ"],
        howFr: ["Entrer le sujet", "Définir les personnages", "Obtenir le scénario complet", "Distribuer les rôles"],
        howEn: ["Enter topic", "Set characters", "Get complete script", "Assign roles & start"],
        gradient: "linear-gradient(135deg, #BF360C, #FF6D00)",
        badgeAr: "مسرح تعليمي",
        badgeFr: "Théâtre éducatif",
        badgeEn: "Edu Theater",
        isNew: true,
      },
      {
        id: "legacy-digitizer",
        href: "/legacy-digitizer",
        icon: ScanLine,
        nameAr: "Legacy Digitizer — رقمنة الوثائق",
        nameFr: "Legacy Digitizer — Numérisation",
        nameEn: "Legacy Digitizer",
        descAr: "مسح ورقمنة الوثائق التعليمية القديمة وتحويلها إلى صيغ رقمية",
        descFr: "Numériser les anciens documents pédagogiques en formats modifiables",
        descEn: "Scan and digitize old educational documents into editable formats",
        whatAr: "أداة تمسح الوثائق الورقية القديمة وتحوّلها إلى صيغ رقمية قابلة للتعديل (Word/PDF).",
        whatFr: "Un outil qui numérise les anciens documents papier et les convertit en formats modifiables (Word/PDF).",
        whatEn: "A tool that scans old paper documents and converts them into editable formats (Word/PDF).",
        whyAr: "لإنقاذ سنوات من العمل المتراكم وتحويلها إلى موارد رقمية قابلة لإعادة الاستخدام.",
        whyFr: "Pour sauver des années de travail accumulé et les convertir en ressources numériques réutilisables.",
        whyEn: "To rescue years of accumulated work and convert them into reusable digital resources.",
        howAr: ["صوّر الوثيقة الورقية", "ارفعها للمسح الذكي", "راجع النص المستخرج", "صدّر Word أو PDF"],
        howFr: ["Photographier le document", "Téléverser pour OCR", "Vérifier le texte extrait", "Exporter Word/PDF"],
        howEn: ["Photograph document", "Upload for OCR", "Review extracted text", "Export Word/PDF"],
        gradient: "linear-gradient(135deg, #004D40, #00897B)",
        badgeAr: "رقمنة ذكية",
        badgeFr: "Numérisation IA",
        badgeEn: "Smart Digitization",
      },
    ],
  },
  {
    id: "video-production",
    titleAr: "أدوات إنتاج الفيديو التعليمي",
    titleFr: "Production Vidéo Éducative",
    titleEn: "Educational Video Production",
    subtitleAr: "أنتج فيديوهات تعليمية احترافية بالذكاء الاصطناعي من الصفر",
    subtitleFr: "Produisez des vidéos éducatives professionnelles avec l'IA",
    subtitleEn: "Produce professional educational videos with AI from scratch",
    icon: Video,
    gradient: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
    tools: [
      {
        id: "edu-studio",
        href: "/edu-studio",
        icon: Clapperboard,
        nameAr: "Edu-Studio — استوديو الفيديو التعليمي",
        nameFr: "Edu-Studio — Studio Vidéo Éducatif",
        nameEn: "Edu-Studio — Educational Video Studio",
        descAr: "استوديو متكامل لإنتاج فيديوهات تعليمية: سيناريو + صور + صوت",
        descFr: "Studio complet pour produire des vidéos éducatives: scénario + images + audio",
        descEn: "Complete studio for educational video production: script + images + audio",
        whatAr: "استوديو إنتاج فيديو تعليمي متكامل يولّد السيناريو والصور والتعليق الصوتي تلقائياً.",
        whatFr: "Un studio de production vidéo éducative complet qui génère automatiquement scénario, images et voix off.",
        whatEn: "A complete educational video production studio that auto-generates script, images and voiceover.",
        whyAr: "لإنتاج فيديوهات تعليمية احترافية دون الحاجة لمهارات تقنية أو معدات تصوير.",
        whyFr: "Pour produire des vidéos éducatives professionnelles sans compétences techniques ni équipement.",
        whyEn: "To produce professional educational videos without technical skills or filming equipment.",
        howAr: ["أدخل موضوع الدرس", "يولّد السيناريو تلقائياً", "أنشئ الصور والتعليق الصوتي", "صدّر الفيديو النهائي"],
        howFr: ["Entrer le sujet du cours", "Scénario auto-généré", "Créer images et voix off", "Exporter la vidéo finale"],
        howEn: ["Enter lesson topic", "Auto-generated script", "Create images & voiceover", "Export final video"],
        gradient: "linear-gradient(135deg, #7C3AED, #4F46E5)",
        badgeAr: "إنتاج متكامل",
        badgeFr: "Production complète",
        badgeEn: "Full Production",
        isExclusive: true,
      },
      {
        id: "ai-director",
        href: "/visual-studio",
        icon: Camera,
        nameAr: "المخرج الذكي — AI Director",
        nameFr: "AI Director — Réalisateur IA",
        nameEn: "AI Director",
        descAr: "حوّل دروسك إلى مشاهد فيديو سينمائية بالذكاء الاصطناعي",
        descFr: "Transformez vos cours en vidéos cinématiques avec l'IA",
        descEn: "Transform your lessons into cinematic AI videos",
        whatAr: "مخرج ذكي يحوّل دروسك إلى مشاهد فيديو سينمائية مع مؤثرات بصرية احترافية.",
        whatFr: "Un réalisateur IA qui transforme vos cours en scènes vidéo cinématiques avec effets visuels professionnels.",
        whatEn: "An AI director that transforms your lessons into cinematic video scenes with professional visual effects.",
        whyAr: "لإنشاء محتوى مرئي سينمائي يجذب انتباه التلاميذ ويرفع جودة التعليم.",
        whyFr: "Pour créer du contenu visuel cinématique qui capte l'attention des élèves et améliore la qualité de l'enseignement.",
        whyEn: "To create cinematic visual content that captures student attention and improves teaching quality.",
        howAr: ["اكتب وصف المشهد", "اختر النمط السينمائي", "اضغط 'إخراج'", "حمّل الفيديو"],
        howFr: ["Décrire la scène", "Choisir le style", "Cliquer 'Réaliser'", "Télécharger la vidéo"],
        howEn: ["Describe the scene", "Choose cinematic style", "Click 'Direct'", "Download video"],
        gradient: "linear-gradient(135deg, #9333EA, #DB2777)",
        badgeAr: "إنتاج فيديو متقدم",
        badgeFr: "Production vidéo avancée",
        badgeEn: "Advanced Video",
        isExclusive: true,
      },
      {
        id: "video-evaluator",
        href: "/video-evaluator",
        icon: MonitorPlay,
        nameAr: "مُقيِّم الفيديو التعليمي",
        nameFr: "Évaluateur Vidéo IA",
        nameEn: "AI Video Evaluator",
        descAr: "وكيل ذكاء اصطناعي لتقييم فيديوهاتك التعليمية وتحسينها",
        descFr: "Agent IA pour évaluer et améliorer vos vidéos éducatives",
        descEn: "AI agent to evaluate and improve your educational videos",
        whatAr: "وكيل ذكاء اصطناعي خبير يحلل فيديوهاتك التعليمية ويقيّم جودتها ويقترح تحسينات.",
        whatFr: "Un agent IA expert qui analyse vos vidéos éducatives, évalue leur qualité et suggère des améliorations.",
        whatEn: "An expert AI agent that analyzes your educational videos, evaluates quality and suggests improvements.",
        whyAr: "لضمان جودة فيديوهاتك التعليمية وتحسين مهاراتك في هندسة الأوامر.",
        whyFr: "Pour assurer la qualité de vos vidéos et améliorer vos compétences en Prompt Engineering.",
        whyEn: "To ensure video quality and improve your Prompt Engineering skills.",
        howAr: ["ارفع الفيديو التعليمي", "يحلل المحتوى والجودة", "احصل على تقييم مفصّل", "طبّق نصائح التحسين"],
        howFr: ["Téléverser la vidéo", "Analyse contenu & qualité", "Obtenir évaluation détaillée", "Appliquer les conseils"],
        howEn: ["Upload video", "Content & quality analysis", "Get detailed evaluation", "Apply improvement tips"],
        gradient: "linear-gradient(135deg, #1A237E, #0D47A1)",
        badgeAr: "وكيل ذكاء اصطناعي",
        badgeFr: "Agent IA",
        badgeEn: "AI Agent",
        isExclusive: true,
      },
      {
        id: "my-voice",
        href: "/my-voice",
        icon: Mic,
        nameAr: "صوتي الرقمي — Voice Cloning",
        nameFr: "Ma Voix Numérique — Voice Cloning",
        nameEn: "My Digital Voice — Voice Cloning",
        descAr: "استنسخ صوتك واستخدمه في التعليق الصوتي لدروسك",
        descFr: "Clonez votre voix et utilisez-la pour vos cours",
        descEn: "Clone your voice and use it for your lesson voiceovers",
        whatAr: "تقنية استنساخ صوتي تسجّل بصمتك الصوتية مرة واحدة لتستخدمها في توليد تعليق صوتي بصوتك الشخصي.",
        whatFr: "Une technologie de clonage vocal qui enregistre votre empreinte vocale une fois pour générer des voix off avec votre propre voix.",
        whatEn: "A voice cloning technology that records your voice print once to generate voiceovers with your own voice.",
        whyAr: "لأن صوت المعلم الحقيقي يخلق رابطاً عاطفياً أقوى مع التلاميذ مقارنة بالأصوات الاصطناعية.",
        whyFr: "Parce que la vraie voix de l'enseignant crée un lien émotionnel plus fort avec les élèves que les voix synthétiques.",
        whyEn: "Because the teacher's real voice creates a stronger emotional bond with students than synthetic voices.",
        howAr: ["سجّل 60 ثانية بصوتك", "اضغط 'إنشاء بصمتي'", "انتظر المعالجة", "استخدم صوتك في Edu-Studio"],
        howFr: ["Enregistrer 60 secondes", "Cliquer 'Créer mon empreinte'", "Attendre le traitement", "Utiliser dans Edu-Studio"],
        howEn: ["Record 60 seconds", "Click 'Create my print'", "Wait for processing", "Use in Edu-Studio"],
        gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
        badgeAr: "ميزة حصرية",
        badgeFr: "Exclusif",
        badgeEn: "Exclusive",
        isNew: true,
        isExclusive: true,
      },
      {
        id: "prompt-lab",
        href: "/prompt-lab",
        icon: PenTool,
        nameAr: "محسّن الأوامر — Prompt Lab",
        nameFr: "Prompt Lab — Optimiseur de prompts",
        nameEn: "Prompt Lab — Prompt Optimizer",
        descAr: "حسّن أوامرك للذكاء الاصطناعي واحصل على نتائج أفضل",
        descFr: "Améliorez vos prompts IA et obtenez de meilleurs résultats",
        descEn: "Improve your AI prompts and get better results",
        whatAr: "مختبر متخصص في تحسين أوامر الذكاء الاصطناعي (Prompt Engineering) للحصول على أفضل النتائج.",
        whatFr: "Un laboratoire spécialisé dans l'optimisation des prompts IA pour obtenir les meilleurs résultats.",
        whatEn: "A specialized lab for optimizing AI prompts (Prompt Engineering) to get the best results.",
        whyAr: "لأن جودة الأمر تحدد جودة النتيجة — أمر محسّن = فيديو أفضل بكثير.",
        whyFr: "Parce que la qualité du prompt détermine la qualité du résultat — prompt optimisé = bien meilleure vidéo.",
        whyEn: "Because prompt quality determines result quality — optimized prompt = much better video.",
        howAr: ["اكتب أمرك الأولي", "يحلل ويقترح تحسينات", "اختر النسخة المحسّنة", "انسخ واستخدم في أي أداة"],
        howFr: ["Écrire votre prompt initial", "Analyse et suggestions", "Choisir la version optimisée", "Copier et utiliser"],
        howEn: ["Write your initial prompt", "Analysis & suggestions", "Choose optimized version", "Copy and use anywhere"],
        gradient: "linear-gradient(135deg, #0891B2, #06B6D4)",
        badgeAr: "هندسة الأوامر",
        badgeFr: "Prompt Engineering",
        badgeEn: "Prompt Engineering",
        isExclusive: true,
      },
    ],
  },
  {
    id: "inclusion",
    titleAr: "أدوات الدمج والمرافقة",
    titleFr: "Inclusion & Accompagnement",
    titleEn: "Inclusion & Support",
    subtitleAr: "أدوات متخصصة لمرافقة التلاميذ ذوي الاحتياجات الخاصة",
    subtitleFr: "Outils spécialisés pour accompagner les élèves à besoins spécifiques",
    subtitleEn: "Specialized tools to support students with special needs",
    icon: HeartHandshake,
    gradient: "linear-gradient(135deg, #00695C 0%, #26A69A 100%)",
    tools: [
      {
        id: "learning-support",
        href: "/learning-support",
        icon: HeartHandshake,
        nameAr: "أدوات ذوي صعوبات التعلم",
        nameFr: "Outils troubles d'apprentissage",
        nameEn: "Learning Difficulties Tools",
        descAr: "أدوات ذكاء اصطناعي متخصصة لمرافقة التلاميذ ذوي صعوبات التعلم",
        descFr: "Outils IA spécialisés pour accompagner les élèves en difficulté",
        descEn: "Specialized AI tools to support students with learning difficulties",
        whatAr: "مجموعة أدوات متكاملة تشمل محلل خط اليد، المرافق البيداغوجي، مكيّف المحتوى، ومولّد التمارين العلاجية.",
        whatFr: "Une suite d'outils intégrée incluant analyseur d'écriture, accompagnateur pédagogique, adaptateur de contenu et générateur d'exercices thérapeutiques.",
        whatEn: "An integrated toolset including handwriting analyzer, pedagogical companion, content adapter and therapeutic exercise generator.",
        whyAr: "لأن كل تلميذ يستحق فرصة متساوية في التعلم، وهذه الأدوات تساعد في تحقيق ذلك.",
        whyFr: "Parce que chaque élève mérite une chance égale d'apprendre, et ces outils aident à y parvenir.",
        whyEn: "Because every student deserves an equal chance to learn, and these tools help achieve that.",
        howAr: ["اختر الأداة المناسبة", "أدخل بيانات التلميذ", "احصل على تحليل مفصّل", "طبّق التوصيات المخصصة"],
        howFr: ["Choisir l'outil approprié", "Entrer les données de l'élève", "Obtenir une analyse détaillée", "Appliquer les recommandations"],
        howEn: ["Choose appropriate tool", "Enter student data", "Get detailed analysis", "Apply recommendations"],
        gradient: "linear-gradient(135deg, #00695C, #26A69A)",
        badgeAr: "4 أدوات متكاملة",
        badgeFr: "4 outils intégrés",
        badgeEn: "4 Integrated Tools",
      },
    ],
  },
  {
    id: "economy",
    titleAr: "نظام النقاط والمكافآت",
    titleFr: "Système de Points & Récompenses",
    titleEn: "Points & Rewards System",
    subtitleAr: "أدر رصيدك من نقاط ليدر لاستخدام أدوات الذكاء الاصطناعي",
    subtitleFr: "Gérez votre solde de Leader Points pour utiliser les outils IA",
    subtitleEn: "Manage your Leader Points balance to use AI tools",
    icon: Coins,
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    tools: [
      {
        id: "my-points",
        href: "/my-points",
        icon: Coins,
        nameAr: "نقاط ليدر — Leader Points",
        nameFr: "Leader Points — Points Leader",
        nameEn: "Leader Points",
        descAr: "رصيدك من النقاط لاستخدام أدوات الذكاء الاصطناعي المتقدمة",
        descFr: "Votre solde de points pour utiliser les outils IA avancés",
        descEn: "Your points balance for using advanced AI tools",
        whatAr: "نظام نقاط يتيح لك استخدام أدوات الذكاء الاصطناعي المتقدمة مع تتبع الرصيد وسجل المعاملات.",
        whatFr: "Un système de points qui vous permet d'utiliser les outils IA avancés avec suivi du solde et historique des transactions.",
        whatEn: "A points system that lets you use advanced AI tools with balance tracking and transaction history.",
        whyAr: "لإدارة استخدامك لأدوات الذكاء الاصطناعي بذكاء وتتبع إنفاقك.",
        whyFr: "Pour gérer intelligemment votre utilisation des outils IA et suivre vos dépenses.",
        whyEn: "To smartly manage your AI tool usage and track your spending.",
        howAr: ["سجّل للحصول على 100 نقطة مجانية", "استخدم النقاط في الأدوات", "تابع رصيدك وسجل المعاملات", "اشترِ نقاطاً إضافية عند الحاجة"],
        howFr: ["Inscrivez-vous pour 100 points gratuits", "Utilisez les points dans les outils", "Suivez votre solde", "Achetez des points supplémentaires"],
        howEn: ["Sign up for 100 free points", "Use points in tools", "Track your balance", "Buy more points when needed"],
        gradient: "linear-gradient(135deg, #10B981, #059669)",
        badgeAr: "100 نقطة مجانية",
        badgeFr: "100 points gratuits",
        badgeEn: "100 Free Points",
      },
    ],
  },
];

/* ───────── Helpers ───────── */
function getName(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.nameFr : lang === "en" ? t.nameEn : t.nameAr;
}
function getDesc(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.descFr : lang === "en" ? t.descEn : t.descAr;
}
function getWhat(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.whatFr : lang === "en" ? t.whatEn : t.whatAr;
}
function getWhy(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.whyFr : lang === "en" ? t.whyEn : t.whyAr;
}
function getHow(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.howFr : lang === "en" ? t.howEn : t.howAr;
}
function getBadge(t: ToolInfo, lang: AppLanguage) {
  return lang === "fr" ? t.badgeFr : lang === "en" ? t.badgeEn : t.badgeAr;
}
function getCatTitle(c: CategoryInfo, lang: AppLanguage) {
  return lang === "fr" ? c.titleFr : lang === "en" ? c.titleEn : c.titleAr;
}
function getCatSub(c: CategoryInfo, lang: AppLanguage) {
  return lang === "fr" ? c.subtitleFr : lang === "en" ? c.subtitleEn : c.subtitleAr;
}

/* ───────── Component ───────── */
export default function AIToolsHub() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalTools = CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0);

  const filteredCategories = selectedCategory
    ? CATEGORIES.filter((c) => c.id === selectedCategory)
    : CATEGORIES;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 50%, #F8FAFC 100%)" }} dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #0D47A1 40%, #01579B 70%, #006064 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <BackButton />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white/90 font-bold text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>
                {t("Leader Academy — مركز أدوات الذكاء الاصطناعي", "Leader Academy — Centre des outils IA", "Leader Academy — AI Tools Hub")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
              {t("مركز الأدوات الذكية", "Centre des Outils IA", "AI Tools Hub")}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              {t(
                `${totalTools} أداة ذكاء اصطناعي تربوي مصممة خصيصاً للمعلم التونسي — من التحضير إلى التقييم إلى إنتاج الفيديو`,
                `${totalTools} outils IA éducatifs conçus spécialement pour l'enseignant tunisien — de la préparation à l'évaluation à la production vidéo`,
                `${totalTools} educational AI tools designed specifically for the Tunisian teacher — from preparation to evaluation to video production`
              )}
            </p>
            {/* Category filter pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  !selectedCategory
                    ? "bg-white text-[#1A237E] shadow-lg"
                    : "bg-white/15 text-white/80 hover:bg-white/25"
                }`}
              >
                {t("الكل", "Tout", "All")} ({totalTools})
              </button>
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? "bg-white text-[#1A237E] shadow-lg"
                        : "bg-white/15 text-white/80 hover:bg-white/25"
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    {getCatTitle(cat, language)} ({cat.tools.length})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCategories.map((category) => {
          const CatIcon = category.icon;
          return (
            <div key={category.id} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: category.gradient }}>
                  <CatIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {getCatTitle(category, language)}
                  </h2>
                  <p className="text-gray-500 text-sm">{getCatSub(category, language)}</p>
                </div>
                <Badge className="bg-gray-100 text-gray-600 border-0 text-xs font-bold">
                  {category.tools.length} {t("أدوات", "outils", "tools")}
                </Badge>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isExpanded = expandedTool === tool.id;
                  return (
                    <Card
                      key={tool.id}
                      className={`group border-2 rounded-2xl transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? "border-blue-300 shadow-xl md:col-span-2 lg:col-span-3"
                          : "border-transparent hover:border-gray-200 hover:shadow-lg"
                      }`}
                    >
                      <CardContent className="p-0">
                        {/* Card Header */}
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                              style={{ background: tool.gradient }}
                            >
                              <ToolIcon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "Cairo, sans-serif" }}>
                                  {getName(tool, language)}
                                </h3>
                                {tool.isNew && (
                                  <Badge className="bg-red-100 text-red-600 border-0 text-[10px] font-bold animate-pulse">
                                    {t("جديد", "Nouveau", "New")}
                                  </Badge>
                                )}
                                {tool.isExclusive && (
                                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-bold">
                                    <Crown className="w-3 h-3 inline mr-0.5" />
                                    {t("حصري", "Exclusif", "Exclusive")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-500 text-sm leading-relaxed">{getDesc(tool, language)}</p>
                            </div>
                          </div>

                          {/* Badge */}
                          <div className="mt-4 flex items-center justify-between">
                            <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                              {getBadge(tool, language)}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                              >
                                <Info className="w-3.5 h-3.5" />
                                {isExpanded
                                  ? t("إخفاء التفاصيل", "Masquer", "Hide")
                                  : t("تفاصيل", "Détails", "Details")}
                              </button>
                              <Link href={tool.href}>
                                <Button
                                  size="sm"
                                  className="text-white rounded-xl text-xs"
                                  style={{ background: tool.gradient }}
                                >
                                  {t("استخدم", "Utiliser", "Use")}
                                  <ArrowRight className="w-3.5 h-3.5 mr-1 rtl:rotate-180" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* What */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-sm">{t("ماذا تفعل؟", "Que fait-il ?", "What does it do?")}</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{getWhat(tool, language)}</p>
                              </div>
                              {/* Why */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Star className="w-4 h-4 text-amber-600" />
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-sm">{t("لماذا تحتاجها؟", "Pourquoi en avez-vous besoin ?", "Why do you need it?")}</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{getWhy(tool, language)}</p>
                              </div>
                              {/* How */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-green-600" />
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-sm">{t("كيف تستخدمها؟", "Comment l'utiliser ?", "How to use it?")}</h4>
                                </div>
                                <ol className="space-y-2">
                                  {getHow(tool, language).map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: tool.gradient }}>
                                        {idx + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                            <div className="mt-6 flex justify-center">
                              <Link href={tool.href}>
                                <Button
                                  size="lg"
                                  className="text-white rounded-xl px-8"
                                  style={{ background: tool.gradient }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {t("افتح الأداة الآن", "Ouvrir l'outil", "Open Tool Now")}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center mt-12 p-8 rounded-3xl" style={{ background: "linear-gradient(135deg, #1A237E, #0D47A1)" }}>
            <Sparkles className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>
              {t("ابدأ مجاناً الآن!", "Commencez gratuitement maintenant!", "Start for Free Now!")}
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              {t(
                "سجّل واحصل على 100 نقطة مجانية لتجربة جميع أدوات الذكاء الاصطناعي",
                "Inscrivez-vous et obtenez 100 points gratuits pour essayer tous les outils IA",
                "Sign up and get 100 free points to try all AI tools"
              )}
            </p>
            <Link href="/">
              <Button size="lg" className="bg-[#FF6D00] hover:bg-orange-600 text-white rounded-xl px-8 font-bold">
                {t("سجّل الآن", "S'inscrire", "Sign Up")}
                <ArrowRight className="w-5 h-5 mr-2 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
