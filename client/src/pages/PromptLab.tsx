import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Sparkles, Copy, ArrowRight, Loader2, BookOpen, Lightbulb,
  Wand2, FileText, Video, Theater, Brain, Search, Palette,
  ChevronDown, ChevronUp, Star, Zap, Target, CheckCircle,
  AlertTriangle, ArrowLeft, RefreshCw, GraduationCap,
  PenTool, Layers, MessageSquare, BookMarked, Award,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════════════════════════════
   TRANSLATIONS
   ═══════════════════════════════════════════════════════════════════ */

const translations = {
  ar: {
    pageTitle: "مختبر هندسة الأوامر",
    pageSubtitle: "أتقن فن كتابة الأوامر للذكاء الاصطناعي وحقق أفضل النتائج",
    backHome: "الرئيسية",
    tabLibrary: "مكتبة الأوامر",
    tabOptimizer: "محسّن الأوامر",
    tabTemplates: "قوالب تفاعلية",
    tabTips: "أسرار ونصائح",
    // Library
    libraryTitle: "مكتبة الأوامر الذهبية",
    libraryDesc: "أوامر جاهزة ومجربة مصنفة حسب المجال — انسخ واستخدم مباشرة",
    categoryAll: "الكل",
    categoryVideo: "صناعة الفيديو",
    categoryExam: "الاختبارات",
    categoryLesson: "الجذاذات",
    categoryDrama: "المسرح التربوي",
    categoryAnalysis: "التحليل والتقييم",
    categoryGeneral: "أوامر عامة",
    categoryImage: "الصور التعليمية",
    copyPrompt: "نسخ الأمر",
    copied: "تم النسخ!",
    promptFor: "مناسب لـ",
    // Optimizer
    optimizerTitle: "محسّن الأوامر الذكي",
    optimizerDesc: "اكتب أمراً بسيطاً وسيحوله الذكاء الاصطناعي إلى أمر احترافي",
    optimizerPlaceholder: "اكتب أمرك البسيط هنا... مثال: اصنع فيديو عن الكسور",
    optimizerButton: "تحسين الأمر",
    optimizerProcessing: "جارٍ التحسين...",
    optimizerResult: "الأمر المحسّن",
    optimizerExplanation: "لماذا هذا أفضل؟",
    optimizerTryAnother: "جرّب أمراً آخر",
    optimizerBefore: "قبل التحسين",
    optimizerAfter: "بعد التحسين",
    // Templates
    templatesTitle: "قوالب تفاعلية",
    templatesDesc: "املأ الفراغات واحصل على أمر مخصص جاهز للاستخدام",
    templateFillIn: "املأ الحقول",
    templateGenerated: "الأمر الناتج",
    templateCopy: "نسخ الأمر",
    templateSubject: "المادة",
    templateLevel: "المستوى",
    templateTopic: "الموضوع",
    templateDuration: "المدة",
    templateObjective: "الهدف",
    templateStyle: "النمط",
    templateAudience: "الجمهور",
    // Tips
    tipsTitle: "أسرار هندسة الأوامر",
    tipsDesc: "قواعد ذهبية لكتابة أوامر فعالة تحقق أفضل النتائج",
    tipsDo: "افعل",
    tipsDont: "لا تفعل",
    tipsGoldenRules: "القواعد الذهبية",
    tipsCommonMistakes: "أخطاء شائعة",
    tipsAdvanced: "تقنيات متقدمة",
    // Free badge
    freeBadge: "مجاني",
    freeForAll: "متاح للجميع بدون تسجيل",
  },
  fr: {
    pageTitle: "Laboratoire de Prompt Engineering",
    pageSubtitle: "Maîtrisez l'art de rédiger des prompts IA pour obtenir les meilleurs résultats",
    backHome: "Accueil",
    tabLibrary: "Bibliothèque",
    tabOptimizer: "Optimiseur",
    tabTemplates: "Modèles",
    tabTips: "Conseils",
    // Library
    libraryTitle: "Bibliothèque de Prompts",
    libraryDesc: "Prompts prêts à l'emploi classés par domaine — copiez et utilisez directement",
    categoryAll: "Tout",
    categoryVideo: "Création vidéo",
    categoryExam: "Examens",
    categoryLesson: "Fiches de cours",
    categoryDrama: "Théâtre éducatif",
    categoryAnalysis: "Analyse & évaluation",
    categoryGeneral: "Prompts généraux",
    categoryImage: "Images éducatives",
    copyPrompt: "Copier le prompt",
    copied: "Copié !",
    promptFor: "Adapté pour",
    // Optimizer
    optimizerTitle: "Optimiseur de Prompts IA",
    optimizerDesc: "Écrivez un prompt simple et l'IA le transformera en prompt professionnel",
    optimizerPlaceholder: "Écrivez votre prompt simple ici... Ex: Faire une vidéo sur les fractions",
    optimizerButton: "Optimiser le prompt",
    optimizerProcessing: "Optimisation en cours...",
    optimizerResult: "Prompt optimisé",
    optimizerExplanation: "Pourquoi c'est mieux ?",
    optimizerTryAnother: "Essayer un autre",
    optimizerBefore: "Avant optimisation",
    optimizerAfter: "Après optimisation",
    // Templates
    templatesTitle: "Modèles interactifs",
    templatesDesc: "Remplissez les champs et obtenez un prompt personnalisé prêt à l'emploi",
    templateFillIn: "Remplir les champs",
    templateGenerated: "Prompt généré",
    templateCopy: "Copier le prompt",
    templateSubject: "Matière",
    templateLevel: "Niveau",
    templateTopic: "Sujet",
    templateDuration: "Durée",
    templateObjective: "Objectif",
    templateStyle: "Style",
    templateAudience: "Public",
    // Tips
    tipsTitle: "Secrets du Prompt Engineering",
    tipsDesc: "Règles d'or pour rédiger des prompts efficaces et obtenir les meilleurs résultats",
    tipsDo: "À faire",
    tipsDont: "À éviter",
    tipsGoldenRules: "Règles d'or",
    tipsCommonMistakes: "Erreurs courantes",
    tipsAdvanced: "Techniques avancées",
    // Free badge
    freeBadge: "Gratuit",
    freeForAll: "Accessible à tous sans inscription",
  },
  en: {
    pageTitle: "Prompt Engineering Lab",
    pageSubtitle: "Master the art of writing AI prompts for the best results",
    backHome: "Home",
    tabLibrary: "Library",
    tabOptimizer: "Optimizer",
    tabTemplates: "Templates",
    tabTips: "Tips & Tricks",
    // Library
    libraryTitle: "Golden Prompt Library",
    libraryDesc: "Ready-to-use prompts organized by domain — copy and use directly",
    categoryAll: "All",
    categoryVideo: "Video Creation",
    categoryExam: "Exams",
    categoryLesson: "Lesson Plans",
    categoryDrama: "Educational Drama",
    categoryAnalysis: "Analysis & Evaluation",
    categoryGeneral: "General Prompts",
    categoryImage: "Educational Images",
    copyPrompt: "Copy Prompt",
    copied: "Copied!",
    promptFor: "Best for",
    // Optimizer
    optimizerTitle: "AI Prompt Optimizer",
    optimizerDesc: "Write a simple prompt and AI will transform it into a professional one",
    optimizerPlaceholder: "Write your simple prompt here... e.g.: Make a video about fractions",
    optimizerButton: "Optimize Prompt",
    optimizerProcessing: "Optimizing...",
    optimizerResult: "Optimized Prompt",
    optimizerExplanation: "Why is this better?",
    optimizerTryAnother: "Try Another",
    optimizerBefore: "Before Optimization",
    optimizerAfter: "After Optimization",
    // Templates
    templatesTitle: "Interactive Templates",
    templatesDesc: "Fill in the blanks and get a custom prompt ready to use",
    templateFillIn: "Fill in the fields",
    templateGenerated: "Generated Prompt",
    templateCopy: "Copy Prompt",
    templateSubject: "Subject",
    templateLevel: "Level",
    templateTopic: "Topic",
    templateDuration: "Duration",
    templateObjective: "Objective",
    templateStyle: "Style",
    templateAudience: "Audience",
    // Tips
    tipsTitle: "Prompt Engineering Secrets",
    tipsDesc: "Golden rules for writing effective prompts that achieve the best results",
    tipsDo: "Do",
    tipsDont: "Don't",
    tipsGoldenRules: "Golden Rules",
    tipsCommonMistakes: "Common Mistakes",
    tipsAdvanced: "Advanced Techniques",
    // Free badge
    freeBadge: "Free",
    freeForAll: "Available to everyone without registration",
  },
};

type T = typeof translations.ar;
function useT(): T {
  const { language } = useLanguage();
  return translations[language];
}

/* ═══════════════════════════════════════════════════════════════════
   PROMPT LIBRARY DATA
   ═══════════════════════════════════════════════════════════════════ */

type Category = "video" | "exam" | "lesson" | "drama" | "analysis" | "general" | "image";

interface PromptItem {
  id: string;
  category: Category;
  icon: LucideIcon;
  title: { ar: string; fr: string; en: string };
  prompt: { ar: string; fr: string; en: string };
  tags: { ar: string; fr: string; en: string }[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

const PROMPT_LIBRARY: PromptItem[] = [
  // VIDEO
  {
    id: "v1",
    category: "video",
    icon: Video,
    title: {
      ar: "تحويل درس إلى فيديو تعليمي",
      fr: "Convertir un cours en vidéo éducative",
      en: "Convert a lesson into an educational video",
    },
    prompt: {
      ar: `أنت خبير في إنتاج الفيديوهات التعليمية. أريد تحويل درس [المادة] حول موضوع [الموضوع] للمستوى [المستوى] إلى سيناريو فيديو تعليمي مدته [المدة] دقائق.

المطلوب:
1. مقدمة جذابة (15 ثانية) تطرح سؤالاً محفزاً
2. تقسيم المحتوى إلى مشاهد قصيرة (30-60 ثانية لكل مشهد)
3. لكل مشهد: النص المنطوق + وصف المرئيات + الانتقالات
4. أمثلة من البيئة التونسية
5. خاتمة تلخيصية مع سؤال تفاعلي
6. اقتراح موسيقى خلفية مناسبة

النبرة: بسيطة، حماسية، مناسبة للأطفال`,
      fr: `Vous êtes un expert en production de vidéos éducatives. Je veux convertir un cours de [Matière] sur le sujet [Sujet] pour le niveau [Niveau] en un scénario de vidéo éducative de [Durée] minutes.

Requis :
1. Introduction captivante (15 secondes) posant une question stimulante
2. Division du contenu en courtes scènes (30-60 secondes chacune)
3. Pour chaque scène : texte parlé + description visuelle + transitions
4. Exemples du contexte tunisien
5. Conclusion récapitulative avec question interactive
6. Suggestion de musique de fond appropriée

Ton : simple, enthousiaste, adapté aux enfants`,
      en: `You are an expert in educational video production. I want to convert a [Subject] lesson about [Topic] for [Level] into an educational video script of [Duration] minutes.

Requirements:
1. Engaging introduction (15 seconds) posing a stimulating question
2. Content divided into short scenes (30-60 seconds each)
3. For each scene: spoken text + visual description + transitions
4. Examples from the Tunisian context
5. Summary conclusion with interactive question
6. Background music suggestion

Tone: simple, enthusiastic, child-friendly`,
    },
    tags: [
      { ar: "فيديو", fr: "Vidéo", en: "Video" },
      { ar: "سيناريو", fr: "Scénario", en: "Script" },
    ],
    difficulty: "intermediate",
  },
  {
    id: "v2",
    category: "video",
    icon: Video,
    title: {
      ar: "سيناريو فيديو تجربة علمية",
      fr: "Scénario vidéo d'expérience scientifique",
      en: "Science experiment video script",
    },
    prompt: {
      ar: `صمم سيناريو فيديو تعليمي لتجربة علمية حول [الموضوع] للمستوى [المستوى].

البنية المطلوبة:
- المقدمة: سؤال علمي محفز + عرض المواد المطلوبة
- خطوات التجربة: مرقمة بوضوح مع تحذيرات السلامة
- الملاحظة: ماذا يحدث ولماذا؟
- الاستنتاج: ربط بالحياة اليومية في تونس
- تحدي للتلاميذ: تجربة مشابهة يمكنهم تنفيذها في المنزل

أضف وصفاً مرئياً لكل مشهد (زوايا الكاميرا، الرسوم المتحركة، النصوص على الشاشة).`,
      fr: `Concevez un scénario vidéo éducatif pour une expérience scientifique sur [Sujet] pour le niveau [Niveau].

Structure requise :
- Introduction : question scientifique stimulante + présentation du matériel
- Étapes de l'expérience : numérotées clairement avec consignes de sécurité
- Observation : que se passe-t-il et pourquoi ?
- Conclusion : lien avec la vie quotidienne en Tunisie
- Défi pour les élèves : expérience similaire réalisable à la maison

Ajoutez une description visuelle pour chaque scène (angles de caméra, animations, textes à l'écran).`,
      en: `Design an educational video script for a science experiment about [Topic] for [Level].

Required structure:
- Introduction: stimulating scientific question + materials presentation
- Experiment steps: clearly numbered with safety warnings
- Observation: what happens and why?
- Conclusion: connection to daily life in Tunisia
- Student challenge: similar experiment they can do at home

Add visual description for each scene (camera angles, animations, on-screen text).`,
    },
    tags: [
      { ar: "علوم", fr: "Sciences", en: "Science" },
      { ar: "تجربة", fr: "Expérience", en: "Experiment" },
    ],
    difficulty: "intermediate",
  },
  // EXAM
  {
    id: "e1",
    category: "exam",
    icon: FileText,
    title: {
      ar: "توليد اختبار وفق المعايير التونسية",
      fr: "Générer un examen selon les normes tunisiennes",
      en: "Generate an exam following Tunisian standards",
    },
    prompt: {
      ar: `أنت خبير في التقييم التربوي وفق المنهج التونسي الرسمي. أنشئ اختبار [المادة] للمستوى [المستوى] - الثلاثي [الثلاثي].

الهيكل الإلزامي:
1. الترويسة: اسم المدرسة، المستوى، المادة، الثلاثي، الاسم واللقب
2. السند الأول + التعليمات (مع 1 - معيار الربط والاختيار)
3. السند الثاني + التعليمات (مع 2 - معيار التطبيق والتوظيف)
4. وضعية إدماجية (مع 3 - معيار الإصلاح والتميز)
5. جدول إسناد الأعداد: مع1/مع2/مع3 × (+++/++/+/0)

القواعد:
- كل سند يجب أن يكون وضعية قصصية محفزة من البيئة التونسية
- التعليمات إجرائية ومحددة
- التدرج في الصعوبة من مع1 إلى مع3`,
      fr: `Vous êtes un expert en évaluation pédagogique selon le programme tunisien officiel. Créez un examen de [Matière] pour le niveau [Niveau] - Trimestre [Trimestre].

Structure obligatoire :
1. En-tête : nom de l'école, niveau, matière, trimestre, nom et prénom
2. Premier contexte + consignes (C1 - critère de liaison et choix)
3. Deuxième contexte + consignes (C2 - critère d'application)
4. Situation d'intégration (C3 - critère de correction et excellence)
5. Tableau de notation : C1/C2/C3 × (+++/++/+/0)

Règles :
- Chaque contexte doit être une situation narrative motivante du contexte tunisien
- Consignes opérationnelles et précises
- Progression de difficulté de C1 à C3`,
      en: `You are an expert in educational assessment following the official Tunisian curriculum. Create a [Subject] exam for [Level] - Trimester [Trimester].

Mandatory structure:
1. Header: school name, level, subject, trimester, student name
2. First context + instructions (C1 - linking and selection criterion)
3. Second context + instructions (C2 - application criterion)
4. Integration situation (C3 - correction and excellence criterion)
5. Grading table: C1/C2/C3 × (+++/++/+/0)

Rules:
- Each context must be a motivating narrative from the Tunisian environment
- Operational and specific instructions
- Difficulty progression from C1 to C3`,
    },
    tags: [
      { ar: "اختبار", fr: "Examen", en: "Exam" },
      { ar: "تقييم", fr: "Évaluation", en: "Assessment" },
    ],
    difficulty: "advanced",
  },
  // LESSON
  {
    id: "l1",
    category: "lesson",
    icon: BookOpen,
    title: {
      ar: "جذاذة درس بالمقاربة بالكفايات",
      fr: "Fiche de cours par compétences",
      en: "Competency-based lesson plan",
    },
    prompt: {
      ar: `أنت معلم خبير في المنهج التونسي. أعدّ جذاذة درس [المادة] حول [الموضوع] للمستوى [المستوى].

البنية:
- الكفاية المستهدفة ومكوناتها
- الأهداف التعلمية (3-4 أهداف قابلة للقياس)
- المكتسبات السابقة
- الوسائل التعليمية
- مراحل الدرس:
  1. وضعية الانطلاق (10 دق): تقييم تشخيصي + تحفيز
  2. بناء التعلمات (20 دق): أنشطة تفاعلية + عمل فردي/جماعي
  3. الاستثمار (10 دق): تمارين تطبيقية
  4. التقييم التكويني (5 دق): تقييم فوري
- التمشي البيداغوجي لكل مرحلة
- معايير التقييم`,
      fr: `Vous êtes un enseignant expert du programme tunisien. Préparez une fiche de cours de [Matière] sur [Sujet] pour le niveau [Niveau].

Structure :
- Compétence visée et ses composantes
- Objectifs d'apprentissage (3-4 objectifs mesurables)
- Prérequis
- Supports pédagogiques
- Phases du cours :
  1. Situation de départ (10 min) : évaluation diagnostique + motivation
  2. Construction des apprentissages (20 min) : activités interactives
  3. Investissement (10 min) : exercices d'application
  4. Évaluation formative (5 min) : évaluation immédiate
- Démarche pédagogique pour chaque phase
- Critères d'évaluation`,
      en: `You are an expert teacher in the Tunisian curriculum. Prepare a [Subject] lesson plan about [Topic] for [Level].

Structure:
- Target competency and its components
- Learning objectives (3-4 measurable objectives)
- Prerequisites
- Teaching materials
- Lesson phases:
  1. Starting situation (10 min): diagnostic assessment + motivation
  2. Learning construction (20 min): interactive activities
  3. Investment (10 min): application exercises
  4. Formative assessment (5 min): immediate evaluation
- Pedagogical approach for each phase
- Assessment criteria`,
    },
    tags: [
      { ar: "جذاذة", fr: "Fiche", en: "Lesson Plan" },
      { ar: "كفايات", fr: "Compétences", en: "Competencies" },
    ],
    difficulty: "intermediate",
  },
  // DRAMA
  {
    id: "d1",
    category: "drama",
    icon: Theater,
    title: {
      ar: "تحويل درس إلى مسرحية تربوية",
      fr: "Transformer un cours en pièce de théâtre éducative",
      en: "Transform a lesson into an educational play",
    },
    prompt: {
      ar: `أنت كاتب مسرحي تربوي. حوّل درس [المادة] حول [الموضوع] للمستوى [المستوى] إلى مسرحية تفاعلية.

المطلوب:
- عدد الشخصيات: [العدد] (أسماء تونسية)
- المدة: [المدة] دقائق
- البنية:
  1. المشهد الافتتاحي: تقديم المشكلة/السؤال
  2. مشاهد البناء: كل مشهد يقدم مفهوماً من الدرس
  3. المشهد الختامي: حل المشكلة + الدرس المستفاد
- لكل مشهد: الحوار + الإرشادات المسرحية + الوسائل
- أغنية أو نشيد تعليمي مرتبط بالموضوع
- أسئلة تفاعلية يطرحها الممثلون على الجمهور`,
      fr: `Vous êtes un dramaturge éducatif. Transformez un cours de [Matière] sur [Sujet] pour le niveau [Niveau] en pièce de théâtre interactive.

Requis :
- Nombre de personnages : [Nombre] (noms tunisiens)
- Durée : [Durée] minutes
- Structure :
  1. Scène d'ouverture : présentation du problème/question
  2. Scènes de construction : chaque scène présente un concept du cours
  3. Scène finale : résolution + leçon apprise
- Pour chaque scène : dialogue + indications scéniques + accessoires
- Chanson ou comptine éducative liée au sujet
- Questions interactives posées par les acteurs au public`,
      en: `You are an educational playwright. Transform a [Subject] lesson about [Topic] for [Level] into an interactive play.

Requirements:
- Number of characters: [Number] (Tunisian names)
- Duration: [Duration] minutes
- Structure:
  1. Opening scene: present the problem/question
  2. Building scenes: each scene presents a lesson concept
  3. Final scene: resolution + lesson learned
- For each scene: dialogue + stage directions + props
- Educational song or rhyme related to the topic
- Interactive questions posed by actors to the audience`,
    },
    tags: [
      { ar: "مسرح", fr: "Théâtre", en: "Drama" },
      { ar: "تفاعلي", fr: "Interactif", en: "Interactive" },
    ],
    difficulty: "advanced",
  },
  // ANALYSIS
  {
    id: "a1",
    category: "analysis",
    icon: Search,
    title: {
      ar: "تحليل جذاذة بيداغوجية",
      fr: "Analyser une fiche pédagogique",
      en: "Analyze a pedagogical lesson plan",
    },
    prompt: {
      ar: `أنت متفقد تربوي تونسي خبير. حلل الجذاذة التالية وفق المعايير الرسمية:

[ألصق نص الجذاذة هنا]

معايير التقييم:
1. الانسجام مع المنهج الرسمي (20 نقطة)
2. وضوح الأهداف وقابليتها للقياس (15 نقطة)
3. التدرج البيداغوجي (15 نقطة)
4. تنوع الأنشطة والوسائل (15 نقطة)
5. مراعاة الفروقات الفردية (10 نقطة)
6. جودة التقييم التكويني (15 نقطة)
7. الجانب الشكلي والتنظيمي (10 نقطة)

المطلوب: نقاط القوة + نقاط الضعف + توصيات محددة + النتيجة /100`,
      fr: `Vous êtes un inspecteur pédagogique tunisien expert. Analysez la fiche suivante selon les normes officielles :

[Collez le texte de la fiche ici]

Critères d'évaluation :
1. Cohérence avec le programme officiel (20 points)
2. Clarté et mesurabilité des objectifs (15 points)
3. Progression pédagogique (15 points)
4. Diversité des activités et supports (15 points)
5. Prise en compte des différences individuelles (10 points)
6. Qualité de l'évaluation formative (15 points)
7. Aspect formel et organisationnel (10 points)

Requis : points forts + points faibles + recommandations spécifiques + score /100`,
      en: `You are an expert Tunisian educational inspector. Analyze the following lesson plan according to official standards:

[Paste the lesson plan text here]

Evaluation criteria:
1. Alignment with official curriculum (20 points)
2. Clarity and measurability of objectives (15 points)
3. Pedagogical progression (15 points)
4. Diversity of activities and materials (15 points)
5. Consideration of individual differences (10 points)
6. Quality of formative assessment (15 points)
7. Formal and organizational aspects (10 points)

Required: strengths + weaknesses + specific recommendations + score /100`,
    },
    tags: [
      { ar: "تحليل", fr: "Analyse", en: "Analysis" },
      { ar: "تفقد", fr: "Inspection", en: "Inspection" },
    ],
    difficulty: "advanced",
  },
  // IMAGE
  {
    id: "i1",
    category: "image",
    icon: Palette,
    title: {
      ar: "توليد صورة تعليمية للطباعة",
      fr: "Générer une image éducative pour impression",
      en: "Generate a printable educational image",
    },
    prompt: {
      ar: `صمم صورة تعليمية بأسلوب الرسم الخطي بالأبيض والأسود (line art) حول [الموضوع] للمستوى [المستوى].

المواصفات:
- أسلوب: رسم خطي واضح مناسب للطباعة بالأبيض والأسود
- المحتوى: [وصف تفصيلي للعناصر المطلوبة]
- النص: بدون نص (أو مع تسميات بسيطة بالعربية)
- الحجم: مناسب لورقة A4
- الهدف: يمكن للتلاميذ تلوينها واستخدامها كوسيلة تعليمية
- تجنب: التفاصيل المعقدة، الخلفيات المزدحمة`,
      fr: `Concevez une image éducative en style dessin au trait noir et blanc (line art) sur [Sujet] pour le niveau [Niveau].

Spécifications :
- Style : dessin au trait clair adapté à l'impression en noir et blanc
- Contenu : [description détaillée des éléments requis]
- Texte : sans texte (ou avec des étiquettes simples en arabe)
- Taille : adaptée au format A4
- Objectif : les élèves peuvent la colorier et l'utiliser comme support
- Éviter : détails complexes, arrière-plans chargés`,
      en: `Design an educational image in black and white line art style about [Topic] for [Level].

Specifications:
- Style: clear line art suitable for black and white printing
- Content: [detailed description of required elements]
- Text: no text (or simple Arabic labels)
- Size: suitable for A4 paper
- Purpose: students can color it and use it as a teaching aid
- Avoid: complex details, busy backgrounds`,
    },
    tags: [
      { ar: "صورة", fr: "Image", en: "Image" },
      { ar: "طباعة", fr: "Impression", en: "Print" },
    ],
    difficulty: "beginner",
  },
  // GENERAL
  {
    id: "g1",
    category: "general",
    icon: Sparkles,
    title: {
      ar: "تبسيط مفهوم صعب للتلاميذ",
      fr: "Simplifier un concept difficile pour les élèves",
      en: "Simplify a difficult concept for students",
    },
    prompt: {
      ar: `أنت معلم تونسي مبدع. بسّط مفهوم [المفهوم] لتلاميذ المستوى [المستوى].

المطلوب:
1. تشبيه من الحياة اليومية التونسية
2. شرح في 3 جمل بسيطة
3. مثال عملي يمكن تنفيذه في القسم
4. سؤال تفاعلي للتحقق من الفهم
5. نشاط ممتع مرتبط بالمفهوم (لعبة، أغنية، تجربة)

استخدم لغة بسيطة ومفردات مناسبة لعمر التلاميذ.`,
      fr: `Vous êtes un enseignant tunisien créatif. Simplifiez le concept de [Concept] pour les élèves de [Niveau].

Requis :
1. Analogie de la vie quotidienne tunisienne
2. Explication en 3 phrases simples
3. Exemple pratique réalisable en classe
4. Question interactive pour vérifier la compréhension
5. Activité ludique liée au concept (jeu, chanson, expérience)

Utilisez un langage simple et un vocabulaire adapté à l'âge des élèves.`,
      en: `You are a creative Tunisian teacher. Simplify the concept of [Concept] for [Level] students.

Requirements:
1. Analogy from Tunisian daily life
2. Explanation in 3 simple sentences
3. Practical example that can be done in class
4. Interactive question to check understanding
5. Fun activity related to the concept (game, song, experiment)

Use simple language and age-appropriate vocabulary.`,
    },
    tags: [
      { ar: "تبسيط", fr: "Simplification", en: "Simplification" },
      { ar: "شرح", fr: "Explication", en: "Explanation" },
    ],
    difficulty: "beginner",
  },
  {
    id: "g2",
    category: "general",
    icon: MessageSquare,
    title: {
      ar: "كتابة رسالة لأولياء الأمور",
      fr: "Rédiger un message aux parents",
      en: "Write a message to parents",
    },
    prompt: {
      ar: `اكتب رسالة رسمية من المعلم لأولياء أمور تلاميذ المستوى [المستوى] حول [الموضوع].

المطلوب:
- نبرة مهنية ومحترمة
- شرح واضح للموضوع
- ما المطلوب من الأولياء
- معلومات التواصل
- التاريخ والتوقيع

الموضوع: [اجتماع / نتائج / نشاط / سلوك / رحلة / ...]`,
      fr: `Rédigez un message officiel de l'enseignant aux parents d'élèves de [Niveau] concernant [Sujet].

Requis :
- Ton professionnel et respectueux
- Explication claire du sujet
- Ce qui est attendu des parents
- Coordonnées de contact
- Date et signature

Sujet : [réunion / résultats / activité / comportement / sortie / ...]`,
      en: `Write an official message from the teacher to parents of [Level] students about [Topic].

Requirements:
- Professional and respectful tone
- Clear explanation of the topic
- What is expected from parents
- Contact information
- Date and signature

Topic: [meeting / results / activity / behavior / trip / ...]`,
    },
    tags: [
      { ar: "أولياء", fr: "Parents", en: "Parents" },
      { ar: "رسالة", fr: "Message", en: "Message" },
    ],
    difficulty: "beginner",
  },
  {
    id: "v3",
    category: "video",
    icon: Video,
    title: {
      ar: "أمر لتوليد فيديو بأداة AI",
      fr: "Prompt pour générer une vidéo avec un outil IA",
      en: "Prompt to generate a video with an AI tool",
    },
    prompt: {
      ar: `اكتب لي أمراً (prompt) احترافياً لتوليد فيديو تعليمي باستخدام أداة ذكاء اصطناعي (مثل Runway, Pika, Sora) حول:

الموضوع: [الموضوع]
المستوى: [المستوى]
المدة المطلوبة: [المدة]

المطلوب في الأمر:
- وصف المشهد البصري بدقة (الألوان، الخلفية، الشخصيات)
- حركة الكاميرا (تقريب، ابتعاد، تتبع)
- الأسلوب البصري (رسوم متحركة، واقعي، كرتوني)
- النص الذي يظهر على الشاشة
- الانتقالات بين المشاهد
- المزاج العام (مرح، جدي، تشويقي)

اكتب الأمر بالإنجليزية لأن معظم أدوات AI تعمل بالإنجليزية.`,
      fr: `Écrivez-moi un prompt professionnel pour générer une vidéo éducative avec un outil IA (comme Runway, Pika, Sora) sur :

Sujet : [Sujet]
Niveau : [Niveau]
Durée souhaitée : [Durée]

Le prompt doit inclure :
- Description visuelle précise de la scène (couleurs, arrière-plan, personnages)
- Mouvement de caméra (zoom, dézoom, suivi)
- Style visuel (animation, réaliste, cartoon)
- Texte apparaissant à l'écran
- Transitions entre les scènes
- Ambiance générale (joyeuse, sérieuse, suspense)

Rédigez le prompt en anglais car la plupart des outils IA fonctionnent en anglais.`,
      en: `Write me a professional prompt to generate an educational video using an AI tool (like Runway, Pika, Sora) about:

Topic: [Topic]
Level: [Level]
Desired duration: [Duration]

The prompt should include:
- Precise visual scene description (colors, background, characters)
- Camera movement (zoom in, zoom out, tracking)
- Visual style (animation, realistic, cartoon)
- On-screen text
- Scene transitions
- Overall mood (cheerful, serious, suspenseful)

Write the prompt in English as most AI tools work in English.`,
    },
    tags: [
      { ar: "فيديو AI", fr: "Vidéo IA", en: "AI Video" },
      { ar: "Prompt", fr: "Prompt", en: "Prompt" },
    ],
    difficulty: "advanced",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE TEMPLATES DATA
   ═══════════════════════════════════════════════════════════════════ */

interface TemplateField {
  key: string;
  label: { ar: string; fr: string; en: string };
  type: "text" | "select";
  options?: { value: string; label: { ar: string; fr: string; en: string } }[];
  placeholder: { ar: string; fr: string; en: string };
}

interface PromptTemplate {
  id: string;
  icon: LucideIcon;
  title: { ar: string; fr: string; en: string };
  fields: TemplateField[];
  buildPrompt: (values: Record<string, string>, lang: AppLanguage) => string;
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: "t1",
    icon: Video,
    title: {
      ar: "سيناريو فيديو تعليمي",
      fr: "Scénario vidéo éducatif",
      en: "Educational video script",
    },
    fields: [
      { key: "subject", label: { ar: "المادة", fr: "Matière", en: "Subject" }, type: "text", placeholder: { ar: "مثال: الرياضيات", fr: "Ex: Mathématiques", en: "e.g.: Mathematics" } },
      { key: "topic", label: { ar: "الموضوع", fr: "Sujet", en: "Topic" }, type: "text", placeholder: { ar: "مثال: الكسور", fr: "Ex: Les fractions", en: "e.g.: Fractions" } },
      { key: "level", label: { ar: "المستوى", fr: "Niveau", en: "Level" }, type: "text", placeholder: { ar: "مثال: السنة 5", fr: "Ex: 5ème année", en: "e.g.: 5th grade" } },
      { key: "duration", label: { ar: "المدة (دقائق)", fr: "Durée (minutes)", en: "Duration (minutes)" }, type: "text", placeholder: { ar: "مثال: 5", fr: "Ex: 5", en: "e.g.: 5" } },
      {
        key: "style", label: { ar: "النمط", fr: "Style", en: "Style" }, type: "select",
        options: [
          { value: "animation", label: { ar: "رسوم متحركة", fr: "Animation", en: "Animation" } },
          { value: "realistic", label: { ar: "واقعي", fr: "Réaliste", en: "Realistic" } },
          { value: "whiteboard", label: { ar: "سبورة بيضاء", fr: "Tableau blanc", en: "Whiteboard" } },
        ],
        placeholder: { ar: "اختر النمط", fr: "Choisir le style", en: "Choose style" },
      },
    ],
    buildPrompt: (v, lang) => {
      const prompts = {
        ar: `أنت خبير في إنتاج الفيديوهات التعليمية. صمم سيناريو فيديو تعليمي بأسلوب ${v.style === "animation" ? "رسوم متحركة" : v.style === "realistic" ? "واقعي" : "سبورة بيضاء"} حول "${v.topic}" في مادة ${v.subject} للمستوى ${v.level}، مدته ${v.duration} دقائق.\n\nالمطلوب:\n1. مقدمة جذابة (15 ثانية)\n2. تقسيم المحتوى إلى مشاهد قصيرة\n3. لكل مشهد: النص + وصف المرئيات\n4. أمثلة من البيئة التونسية\n5. خاتمة تلخيصية مع سؤال تفاعلي`,
        fr: `Vous êtes un expert en production de vidéos éducatives. Concevez un scénario vidéo éducatif en style ${v.style === "animation" ? "animation" : v.style === "realistic" ? "réaliste" : "tableau blanc"} sur "${v.topic}" en ${v.subject} pour le niveau ${v.level}, durée ${v.duration} minutes.\n\nRequis :\n1. Introduction captivante (15 secondes)\n2. Contenu divisé en courtes scènes\n3. Pour chaque scène : texte + description visuelle\n4. Exemples du contexte tunisien\n5. Conclusion récapitulative avec question interactive`,
        en: `You are an expert in educational video production. Design a ${v.style === "animation" ? "animation" : v.style === "realistic" ? "realistic" : "whiteboard"} style educational video script about "${v.topic}" in ${v.subject} for ${v.level}, duration ${v.duration} minutes.\n\nRequirements:\n1. Engaging introduction (15 seconds)\n2. Content divided into short scenes\n3. For each scene: text + visual description\n4. Examples from the Tunisian context\n5. Summary conclusion with interactive question`,
      };
      return prompts[lang];
    },
  },
  {
    id: "t2",
    icon: FileText,
    title: {
      ar: "اختبار تقييمي",
      fr: "Examen d'évaluation",
      en: "Assessment exam",
    },
    fields: [
      { key: "subject", label: { ar: "المادة", fr: "Matière", en: "Subject" }, type: "text", placeholder: { ar: "مثال: الإيقاظ العلمي", fr: "Ex: Éveil scientifique", en: "e.g.: Science" } },
      { key: "level", label: { ar: "المستوى", fr: "Niveau", en: "Level" }, type: "text", placeholder: { ar: "مثال: السنة 4", fr: "Ex: 4ème année", en: "e.g.: 4th grade" } },
      { key: "trimester", label: { ar: "الثلاثي", fr: "Trimestre", en: "Trimester" }, type: "select", options: [
        { value: "1", label: { ar: "الثلاثي الأول", fr: "1er trimestre", en: "1st trimester" } },
        { value: "2", label: { ar: "الثلاثي الثاني", fr: "2ème trimestre", en: "2nd trimester" } },
        { value: "3", label: { ar: "الثلاثي الثالث", fr: "3ème trimestre", en: "3rd trimester" } },
      ], placeholder: { ar: "اختر الثلاثي", fr: "Choisir le trimestre", en: "Choose trimester" } },
      { key: "topic", label: { ar: "الموضوع", fr: "Sujet", en: "Topic" }, type: "text", placeholder: { ar: "مثال: الدورة الدموية", fr: "Ex: La circulation sanguine", en: "e.g.: Blood circulation" } },
    ],
    buildPrompt: (v, lang) => {
      const prompts = {
        ar: `أنت خبير في التقييم التربوي وفق المنهج التونسي. أنشئ اختبار ${v.subject} للمستوى ${v.level} - الثلاثي ${v.trimester} حول "${v.topic}".\n\nالهيكل الإلزامي:\n1. الترويسة (اسم المدرسة، المستوى، المادة، الثلاثي)\n2. السند الأول + التعليمات (مع 1)\n3. السند الثاني + التعليمات (مع 2)\n4. وضعية إدماجية (مع 3)\n5. جدول إسناد الأعداد`,
        fr: `Vous êtes un expert en évaluation pédagogique selon le programme tunisien. Créez un examen de ${v.subject} pour le niveau ${v.level} - Trimestre ${v.trimester} sur "${v.topic}".\n\nStructure obligatoire :\n1. En-tête (école, niveau, matière, trimestre)\n2. Contexte 1 + consignes (C1)\n3. Contexte 2 + consignes (C2)\n4. Situation d'intégration (C3)\n5. Tableau de notation`,
        en: `You are an expert in educational assessment following the Tunisian curriculum. Create a ${v.subject} exam for ${v.level} - Trimester ${v.trimester} about "${v.topic}".\n\nMandatory structure:\n1. Header (school, level, subject, trimester)\n2. Context 1 + instructions (C1)\n3. Context 2 + instructions (C2)\n4. Integration situation (C3)\n5. Grading table`,
      };
      return prompts[lang];
    },
  },
  {
    id: "t3",
    icon: BookOpen,
    title: {
      ar: "جذاذة درس",
      fr: "Fiche de cours",
      en: "Lesson plan",
    },
    fields: [
      { key: "subject", label: { ar: "المادة", fr: "Matière", en: "Subject" }, type: "text", placeholder: { ar: "مثال: اللغة العربية", fr: "Ex: Langue arabe", en: "e.g.: Arabic language" } },
      { key: "topic", label: { ar: "الموضوع", fr: "Sujet", en: "Topic" }, type: "text", placeholder: { ar: "مثال: الجملة الفعلية", fr: "Ex: La phrase verbale", en: "e.g.: Verbal sentence" } },
      { key: "level", label: { ar: "المستوى", fr: "Niveau", en: "Level" }, type: "text", placeholder: { ar: "مثال: السنة 6", fr: "Ex: 6ème année", en: "e.g.: 6th grade" } },
      { key: "objective", label: { ar: "الهدف الرئيسي", fr: "Objectif principal", en: "Main objective" }, type: "text", placeholder: { ar: "مثال: أن يميز التلميذ بين الفعل والفاعل", fr: "Ex: L'élève distingue le verbe du sujet", en: "e.g.: Student distinguishes verb from subject" } },
    ],
    buildPrompt: (v, lang) => {
      const prompts = {
        ar: `أنت معلم خبير في المنهج التونسي. أعدّ جذاذة درس ${v.subject} حول "${v.topic}" للمستوى ${v.level}.\n\nالهدف الرئيسي: ${v.objective}\n\nالبنية المطلوبة:\n- الكفاية المستهدفة ومكوناتها\n- الأهداف التعلمية (3-4 أهداف)\n- المكتسبات السابقة والوسائل\n- مراحل الدرس (انطلاق، بناء، استثمار، تقييم)\n- التمشي البيداغوجي لكل مرحلة`,
        fr: `Vous êtes un enseignant expert du programme tunisien. Préparez une fiche de cours de ${v.subject} sur "${v.topic}" pour le niveau ${v.level}.\n\nObjectif principal : ${v.objective}\n\nStructure requise :\n- Compétence visée et composantes\n- Objectifs d'apprentissage (3-4)\n- Prérequis et supports\n- Phases du cours (départ, construction, investissement, évaluation)\n- Démarche pédagogique pour chaque phase`,
        en: `You are an expert teacher in the Tunisian curriculum. Prepare a ${v.subject} lesson plan about "${v.topic}" for ${v.level}.\n\nMain objective: ${v.objective}\n\nRequired structure:\n- Target competency and components\n- Learning objectives (3-4)\n- Prerequisites and materials\n- Lesson phases (start, construction, investment, evaluation)\n- Pedagogical approach for each phase`,
      };
      return prompts[lang];
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   TIPS DATA
   ═══════════════════════════════════════════════════════════════════ */

interface TipItem {
  icon: LucideIcon;
  title: { ar: string; fr: string; en: string };
  description: { ar: string; fr: string; en: string };
  type: "do" | "dont" | "advanced";
}

const TIPS_DATA: TipItem[] = [
  // DO
  { icon: Target, type: "do", title: { ar: "حدد الدور بوضوح", fr: "Définissez le rôle clairement", en: "Define the role clearly" }, description: { ar: "ابدأ بـ 'أنت خبير في...' أو 'أنت معلم تونسي متخصص في...' لتوجيه الذكاء الاصطناعي", fr: "Commencez par 'Vous êtes un expert en...' pour guider l'IA", en: "Start with 'You are an expert in...' to guide the AI" } },
  { icon: Layers, type: "do", title: { ar: "قسّم المطلوب إلى خطوات", fr: "Divisez en étapes", en: "Break into steps" }, description: { ar: "استخدم الترقيم (1، 2، 3) لتوضيح ما تريده بالتحديد بدل طلب كل شيء دفعة واحدة", fr: "Utilisez la numérotation (1, 2, 3) pour clarifier exactement ce que vous voulez", en: "Use numbering (1, 2, 3) to clarify exactly what you want" } },
  { icon: BookMarked, type: "do", title: { ar: "أعطِ أمثلة", fr: "Donnez des exemples", en: "Give examples" }, description: { ar: "قدم مثالاً على النتيجة المطلوبة ليفهم الذكاء الاصطناعي المستوى والأسلوب المطلوب", fr: "Fournissez un exemple du résultat attendu pour que l'IA comprenne le niveau et le style", en: "Provide an example of the expected result so AI understands the level and style" } },
  { icon: GraduationCap, type: "do", title: { ar: "حدد السياق التونسي", fr: "Précisez le contexte tunisien", en: "Specify the Tunisian context" }, description: { ar: "اذكر 'وفق المنهج التونسي الرسمي' أو 'مناسب للبيئة التونسية' للحصول على نتائج دقيقة", fr: "Mentionnez 'selon le programme tunisien officiel' pour des résultats précis", en: "Mention 'following the official Tunisian curriculum' for accurate results" } },
  { icon: PenTool, type: "do", title: { ar: "حدد الشكل المطلوب", fr: "Précisez le format", en: "Specify the format" }, description: { ar: "اطلب جدول، قائمة مرقمة، فقرات... حدد الشكل الذي تريد النتيجة فيه", fr: "Demandez un tableau, une liste numérotée, des paragraphes... précisez le format souhaité", en: "Request a table, numbered list, paragraphs... specify the desired format" } },
  // DONT
  { icon: AlertTriangle, type: "dont", title: { ar: "لا تكتب أوامر غامضة", fr: "N'écrivez pas de prompts vagues", en: "Don't write vague prompts" }, description: { ar: "❌ 'اعمل درس رياضيات' → ✅ 'أعد جذاذة درس رياضيات حول الكسور للسنة 5 وفق المنهج التونسي'", fr: "❌ 'Faites un cours de maths' → ✅ 'Préparez une fiche de maths sur les fractions pour la 5ème année'", en: "❌ 'Make a math lesson' → ✅ 'Prepare a math lesson plan on fractions for 5th grade'" } },
  { icon: AlertTriangle, type: "dont", title: { ar: "لا تطلب كل شيء دفعة واحدة", fr: "Ne demandez pas tout d'un coup", en: "Don't ask for everything at once" }, description: { ar: "قسّم الطلبات الكبيرة إلى أوامر متتالية. اطلب الجذاذة أولاً، ثم الاختبار، ثم الصور", fr: "Divisez les grandes demandes en prompts successifs. Demandez la fiche d'abord, puis l'examen", en: "Split large requests into successive prompts. Ask for the plan first, then the exam" } },
  { icon: AlertTriangle, type: "dont", title: { ar: "لا تنسَ تحديد المستوى", fr: "N'oubliez pas de préciser le niveau", en: "Don't forget to specify the level" }, description: { ar: "درس للسنة 1 يختلف تماماً عن درس للسنة 6. حدد المستوى دائماً", fr: "Un cours pour la 1ère année est très différent de la 6ème. Précisez toujours le niveau", en: "A lesson for 1st grade is very different from 6th grade. Always specify the level" } },
  // ADVANCED
  { icon: Zap, type: "advanced", title: { ar: "تقنية السلسلة (Chain of Thought)", fr: "Technique de la chaîne (Chain of Thought)", en: "Chain of Thought Technique" }, description: { ar: "اطلب من الذكاء الاصطناعي أن 'يفكر خطوة بخطوة' قبل الإجابة للحصول على نتائج أعمق وأدق", fr: "Demandez à l'IA de 'réfléchir étape par étape' avant de répondre pour des résultats plus profonds", en: "Ask AI to 'think step by step' before answering for deeper and more accurate results" } },
  { icon: Zap, type: "advanced", title: { ar: "تقنية الأمثلة المتعددة (Few-Shot)", fr: "Technique des exemples multiples (Few-Shot)", en: "Few-Shot Technique" }, description: { ar: "قدم 2-3 أمثلة على النتيجة المطلوبة ثم اطلب إنتاج مثال جديد بنفس النمط", fr: "Fournissez 2-3 exemples du résultat attendu puis demandez un nouveau dans le même style", en: "Provide 2-3 examples of the expected result then ask for a new one in the same style" } },
  { icon: Zap, type: "advanced", title: { ar: "تقنية التكرار والتحسين", fr: "Technique d'itération", en: "Iteration Technique" }, description: { ar: "لا تتوقع نتيجة مثالية من أول أمر. حسّن الأمر تدريجياً: 'أضف المزيد من التفاصيل حول...' أو 'غيّر الأسلوب إلى...'", fr: "N'attendez pas un résultat parfait du premier prompt. Améliorez progressivement", en: "Don't expect a perfect result from the first prompt. Improve gradually" } },
];

/* ═══════════════════════════════════════════════════════════════════
   CATEGORY HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const CATEGORIES: { key: Category | "all"; icon: LucideIcon; labelKey: keyof T }[] = [
  { key: "all", icon: Sparkles, labelKey: "categoryAll" },
  { key: "video", icon: Video, labelKey: "categoryVideo" },
  { key: "exam", icon: FileText, labelKey: "categoryExam" },
  { key: "lesson", icon: BookOpen, labelKey: "categoryLesson" },
  { key: "drama", icon: Theater, labelKey: "categoryDrama" },
  { key: "analysis", icon: Search, labelKey: "categoryAnalysis" },
  { key: "image", icon: Palette, labelKey: "categoryImage" },
  { key: "general", icon: Sparkles, labelKey: "categoryGeneral" },
];

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
};
const difficultyLabels = {
  beginner: { ar: "مبتدئ", fr: "Débutant", en: "Beginner" },
  intermediate: { ar: "متوسط", fr: "Intermédiaire", en: "Intermediate" },
  advanced: { ar: "متقدم", fr: "Avancé", en: "Advanced" },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function PromptLab() {
  const { language, t } = useLanguage();
  const tt = useT();
  const isRtl = language === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 ${isRtl ? "font-[Almarai]" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      <SEOHead title={tt.pageTitle} description={tt.pageSubtitle} />
      <UnifiedNavbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <span className="text-white/70 hover:text-white text-sm cursor-pointer">{tt.backHome}</span>
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white text-sm">{tt.pageTitle}</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{tt.pageTitle}</h1>
                <Badge className="bg-green-400 text-green-900 border-0 text-sm px-3">{tt.freeBadge}</Badge>
              </div>
              <p className="text-white/80 mt-1">{tt.pageSubtitle}</p>
            </div>
          </div>
          <p className="text-white/60 text-sm">{tt.freeForAll}</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
            <TabsTrigger value="library" className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{tt.tabLibrary}</span>
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2 text-sm">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">{tt.tabOptimizer}</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">{tt.tabTemplates}</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">{tt.tabTips}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Library */}
          <TabsContent value="library">
            <LibraryTab language={language} tt={tt} t={t} />
          </TabsContent>

          {/* TAB 2: Optimizer */}
          <TabsContent value="optimizer">
            <OptimizerTab language={language} tt={tt} t={t} />
          </TabsContent>

          {/* TAB 3: Templates */}
          <TabsContent value="templates">
            <TemplatesTab language={language} tt={tt} t={t} />
          </TabsContent>

          {/* TAB 4: Tips */}
          <TabsContent value="tips">
            <TipsTab language={language} tt={tt} t={t} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: LIBRARY
   ═══════════════════════════════════════════════════════════════════ */

function LibraryTab({ language, tt, t }: { language: AppLanguage; tt: T; t: (ar: string, fr: string, en: string) => string }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return PROMPT_LIBRARY;
    return PROMPT_LIBRARY.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(tt.copied);
    setTimeout(() => setCopiedId(null), 2000);
  }, [tt.copied]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{tt.libraryTitle}</h2>
        <p className="text-gray-600">{tt.libraryDesc}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {(tt as any)[cat.labelKey]}
            </button>
          );
        })}
      </div>

      {/* Prompt Cards */}
      <div className="grid gap-4">
        {filtered.map(item => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;
          const promptText = item.prompt[language];
          const titleText = item.title[language];
          const isCopied = copiedId === item.id;

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-5 flex items-center justify-between text-start"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{titleText}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${difficultyColors[item.difficulty]}`}>
                          {difficultyLabels[item.difficulty][language]}
                        </Badge>
                        {item.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag[language]}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 relative">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-[inherit]" dir={language === "ar" ? "rtl" : "ltr"}>
                        {promptText}
                      </pre>
                      <Button
                        size="sm"
                        variant={isCopied ? "default" : "outline"}
                        className={`absolute top-3 ${language === "ar" ? "left-3" : "right-3"} ${isCopied ? "bg-green-600" : ""}`}
                        onClick={(e) => { e.stopPropagation(); handleCopy(promptText, item.id); }}
                      >
                        {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="ms-1">{isCopied ? tt.copied : tt.copyPrompt}</span>
                      </Button>
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
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: OPTIMIZER
   ═══════════════════════════════════════════════════════════════════ */

function OptimizerTab({ language, tt, t }: { language: AppLanguage; tt: T; t: (ar: string, fr: string, en: string) => string }) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [optimizedResult, setOptimizedResult] = useState<{ optimized: string; explanation: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeMutation = trpc.promptLab.optimize.useMutation({
    onSuccess: (data: any) => {
      setOptimizedResult(data);
      setIsOptimizing(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error");
      setIsOptimizing(false);
    },
  });

  const handleOptimize = () => {
    if (!inputPrompt.trim()) return;
    setIsOptimizing(true);
    setOptimizedResult(null);
    optimizeMutation.mutate({ prompt: inputPrompt, language });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(tt.copied);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{tt.optimizerTitle}</h2>
        <p className="text-gray-600">{tt.optimizerDesc}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="w-5 h-5 text-gray-500" />
              {tt.optimizerBefore}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder={tt.optimizerPlaceholder}
              className="min-h-[200px] text-base"
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <Button
              onClick={handleOptimize}
              disabled={!inputPrompt.trim() || isOptimizing}
              className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
            >
              {isOptimizing ? (
                <><Loader2 className="w-5 h-5 animate-spin me-2" />{tt.optimizerProcessing}</>
              ) : (
                <><Wand2 className="w-5 h-5 me-2" />{tt.optimizerButton}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className={optimizedResult ? "border-green-200 bg-green-50/30" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {tt.optimizerAfter}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOptimizing && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-gray-500">{tt.optimizerProcessing}</p>
              </div>
            )}
            {optimizedResult && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-green-200 relative">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-[inherit]" dir={language === "ar" ? "rtl" : "ltr"}>
                    {optimizedResult.optimized}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`absolute top-3 ${language === "ar" ? "left-3" : "right-3"}`}
                    onClick={() => handleCopy(optimizedResult.optimized)}
                  >
                    <Copy className="w-4 h-4 me-1" />{tt.copyPrompt}
                  </Button>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />{tt.optimizerExplanation}
                  </h4>
                  <div className="text-sm text-amber-700 leading-relaxed">
                    <Streamdown>{optimizedResult.explanation}</Streamdown>
                  </div>
                </div>
                <Button variant="outline" onClick={() => { setOptimizedResult(null); setInputPrompt(""); }}>
                  <RefreshCw className="w-4 h-4 me-2" />{tt.optimizerTryAnother}
                </Button>
              </div>
            )}
            {!isOptimizing && !optimizedResult && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                <Wand2 className="w-12 h-12" />
                <p>{tt.optimizerDesc}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

function TemplatesTab({ language, tt, t }: { language: AppLanguage; tt: T; t: (ar: string, fr: string, en: string) => string }) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].id);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
  const allFieldsFilled = template.fields.every(f => fieldValues[f.key]?.trim());
  const generatedPrompt = allFieldsFilled ? template.buildPrompt(fieldValues, language) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedTemplate(true);
    toast.success(tt.copied);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{tt.templatesTitle}</h2>
        <p className="text-gray-600">{tt.templatesDesc}</p>
      </div>

      {/* Template Selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        {TEMPLATES.map(tmpl => {
          const Icon = tmpl.icon;
          const isActive = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => { setSelectedTemplate(tmpl.id); setFieldValues({}); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tmpl.title[language]}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              {tt.templateFillIn}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label[language]}</label>
                {field.type === "select" ? (
                  <Select value={fieldValues[field.key] || ""} onValueChange={v => setFieldValues(prev => ({ ...prev, [field.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder={field.placeholder[language]} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={fieldValues[field.key] || ""}
                    onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder[language]}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Generated Prompt */}
        <Card className={allFieldsFilled ? "border-green-200 bg-green-50/30" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {tt.templateGenerated}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allFieldsFilled ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-[inherit]" dir={language === "ar" ? "rtl" : "ltr"}>
                    {generatedPrompt}
                  </pre>
                </div>
                <Button
                  onClick={handleCopy}
                  className={copiedTemplate ? "bg-green-600" : "bg-indigo-600"}
                  size="lg"
                >
                  {copiedTemplate ? <CheckCircle className="w-5 h-5 me-2" /> : <Copy className="w-5 h-5 me-2" />}
                  {copiedTemplate ? tt.copied : tt.templateCopy}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                <Layers className="w-12 h-12" />
                <p>{tt.templateFillIn}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: TIPS
   ═══════════════════════════════════════════════════════════════════ */

function TipsTab({ language, tt, t }: { language: AppLanguage; tt: T; t: (ar: string, fr: string, en: string) => string }) {
  const doTips = TIPS_DATA.filter(tip => tip.type === "do");
  const dontTips = TIPS_DATA.filter(tip => tip.type === "dont");
  const advancedTips = TIPS_DATA.filter(tip => tip.type === "advanced");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{tt.tipsTitle}</h2>
        <p className="text-gray-600">{tt.tipsDesc}</p>
      </div>

      {/* Golden Rules - DO */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          {tt.tipsGoldenRules} — {tt.tipsDo}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <Card key={i} className="border-green-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">{tip.title[language]}</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.description[language]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Common Mistakes - DON'T */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          {tt.tipsCommonMistakes} — {tt.tipsDont}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dontTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <Card key={i} className="border-red-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">{tip.title[language]}</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.description[language]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Advanced Techniques */}
      <div>
        <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          {tt.tipsAdvanced}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <Card key={i} className="border-indigo-200 hover:shadow-md transition-shadow bg-indigo-50/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">{tip.title[language]}</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.description[language]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
