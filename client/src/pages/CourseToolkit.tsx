import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { useState } from "react";
import {
  Clapperboard, Mic, Wand2, BookOpen, FileText, Video, Sparkles,
  ArrowRight, Lock, CheckCircle2, ChevronDown, ChevronUp, Play,
  Zap, Clock, Star, GraduationCap, Loader2, ExternalLink,
  Monitor, PenTool, Image, Volume2, Film, Camera, Lightbulb,
  Target, Award, Rocket, Shield
} from "lucide-react";
import { getLoginUrl } from "@/const";

// ─── Translations ───
const translations = {
  ar: {
    pageTitle: "صندوق أدوات الدورة",
    pageSubtitle: "دورة إعداد الفيديوهات التعليمية بالذكاء الاصطناعي",
    pageDescription: "جميع الأدوات المتاحة لك كمشارك في الدورة مع شرح تفصيلي لكيفية استخدام كل أداة",
    enrolledBadge: "مشارك معتمد",
    notEnrolled: "غير مسجل في الدورة",
    enrollNow: "سجّل الآن في الدورة",
    loginRequired: "سجّل دخولك أولاً",
    backToCourse: "العودة لصفحة الدورة",
    toolsCount: "أداة متاحة لك",
    exclusiveTools: "أدوات حصرية للمشاركين",
    allTools: "جميع أدوات المنصة",
    whatItDoes: "ماذا تفعل هذه الأداة؟",
    whyNeedIt: "لماذا تحتاجها؟",
    howToUse: "كيف تستخدمها؟",
    ifNotUsed: "ماذا لو لم تستخدمها؟",
    openTool: "افتح الأداة",
    exclusive: "حصري للدورة",
    vipOnly: "VIP فقط",
    free: "مجاني",
    pro: "احترافي",
    stepByStep: "خطوات الاستخدام",
    step: "الخطوة",
    proTip: "نصيحة احترافية",
    loading: "جاري التحميل...",
    welcomeTitle: "مرحباً بك في صندوق أدوات الدورة!",
    welcomeText: "كمشارك في دورة إعداد الفيديوهات التعليمية بالذكاء الاصطناعي، لديك وصول حصري لأدوات متقدمة تساعدك على إنتاج محتوى تعليمي احترافي.",
    quickStart: "ابدأ سريعاً",
    quickStartDesc: "المسار المقترح لإنتاج أول فيديو تعليمي لك",
    journeyStep1: "اختر درساً من الكتاب المدرسي",
    journeyStep2: "استخرج النص بالذكاء الاصطناعي",
    journeyStep3: "أنشئ السيناريو التعليمي",
    journeyStep4: "ولّد الصور التوضيحية",
    journeyStep5: "استنسخ صوتك الرقمي",
    journeyStep6: "صدّر الفيديو النهائي",
  },
  fr: {
    pageTitle: "Boîte à Outils du Cours",
    pageSubtitle: "Cours de Création de Vidéos Éducatives par IA",
    pageDescription: "Tous les outils disponibles pour vous en tant que participant au cours avec des explications détaillées",
    enrolledBadge: "Participant Approuvé",
    notEnrolled: "Non inscrit au cours",
    enrollNow: "Inscrivez-vous maintenant",
    loginRequired: "Connectez-vous d'abord",
    backToCourse: "Retour à la page du cours",
    toolsCount: "outils disponibles",
    exclusiveTools: "Outils Exclusifs aux Participants",
    allTools: "Tous les Outils de la Plateforme",
    whatItDoes: "Que fait cet outil ?",
    whyNeedIt: "Pourquoi en avez-vous besoin ?",
    howToUse: "Comment l'utiliser ?",
    ifNotUsed: "Que se passe-t-il si vous ne l'utilisez pas ?",
    openTool: "Ouvrir l'outil",
    exclusive: "Exclusif au cours",
    vipOnly: "VIP uniquement",
    free: "Gratuit",
    pro: "Professionnel",
    stepByStep: "Étapes d'utilisation",
    step: "Étape",
    proTip: "Conseil Pro",
    loading: "Chargement...",
    welcomeTitle: "Bienvenue dans votre boîte à outils !",
    welcomeText: "En tant que participant au cours de création de vidéos éducatives par IA, vous avez un accès exclusif à des outils avancés pour produire du contenu éducatif professionnel.",
    quickStart: "Démarrage Rapide",
    quickStartDesc: "Le parcours suggéré pour produire votre première vidéo éducative",
    journeyStep1: "Choisissez une leçon du manuel",
    journeyStep2: "Extrayez le texte par IA",
    journeyStep3: "Créez le scénario éducatif",
    journeyStep4: "Générez les illustrations",
    journeyStep5: "Clonez votre voix numérique",
    journeyStep6: "Exportez la vidéo finale",
  },
  en: {
    pageTitle: "Course Toolkit",
    pageSubtitle: "AI Educational Video Creation Course",
    pageDescription: "All tools available to you as a course participant with detailed usage guides",
    enrolledBadge: "Approved Participant",
    notEnrolled: "Not enrolled in the course",
    enrollNow: "Enroll Now",
    loginRequired: "Login Required",
    backToCourse: "Back to Course Page",
    toolsCount: "tools available",
    exclusiveTools: "Exclusive Tools for Participants",
    allTools: "All Platform Tools",
    whatItDoes: "What does this tool do?",
    whyNeedIt: "Why do you need it?",
    howToUse: "How to use it?",
    ifNotUsed: "What if you don't use it?",
    openTool: "Open Tool",
    exclusive: "Course Exclusive",
    vipOnly: "VIP Only",
    free: "Free",
    pro: "Professional",
    stepByStep: "Usage Steps",
    step: "Step",
    proTip: "Pro Tip",
    loading: "Loading...",
    welcomeTitle: "Welcome to Your Course Toolkit!",
    welcomeText: "As a participant in the AI Educational Video Creation course, you have exclusive access to advanced tools for producing professional educational content.",
    quickStart: "Quick Start",
    quickStartDesc: "The suggested path to produce your first educational video",
    journeyStep1: "Choose a lesson from the textbook",
    journeyStep2: "Extract text with AI",
    journeyStep3: "Create the educational script",
    journeyStep4: "Generate illustrations",
    journeyStep5: "Clone your digital voice",
    journeyStep6: "Export the final video",
  },
};

// ─── Tool Definitions ───
interface ToolDef {
  id: string;
  icon: any;
  color: string;
  bgGradient: string;
  route: string;
  exclusive: boolean;
  tier: "free" | "pro" | "exclusive" | "vip";
  name: { ar: string; fr: string; en: string };
  whatItDoes: { ar: string; fr: string; en: string };
  whyNeedIt: { ar: string; fr: string; en: string };
  howToUse: { ar: string; fr: string; en: string };
  ifNotUsed: { ar: string; fr: string; en: string };
  steps: { ar: string[]; fr: string[]; en: string[] };
  proTip: { ar: string; fr: string; en: string };
}

const COURSE_TOOLS: ToolDef[] = [
  {
    id: "ultimate-studio",
    icon: Clapperboard,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 to-amber-500/10",
    route: "/ultimate-studio",
    exclusive: true,
    tier: "exclusive",
    name: {
      ar: "Ultimate Studio — استوديو الفيديو الشامل",
      fr: "Ultimate Studio — Studio Vidéo Complet",
      en: "Ultimate Studio — Complete Video Studio",
    },
    whatItDoes: {
      ar: "يحوّل أي صفحة من الكتاب المدرسي إلى فيديو تعليمي تفاعلي كامل بالذكاء الاصطناعي: استخراج النص، كتابة السيناريو، توليد الصور، التعليق الصوتي، وتصدير الفيديو.",
      fr: "Transforme n'importe quelle page de manuel scolaire en vidéo éducative interactive complète par IA : extraction de texte, écriture de scénario, génération d'images, narration vocale et exportation vidéo.",
      en: "Transforms any textbook page into a complete interactive educational video using AI: text extraction, script writing, image generation, voice narration, and video export.",
    },
    whyNeedIt: {
      ar: "لأن إنتاج فيديو تعليمي واحد يستغرق عادةً 5-8 ساعات من العمل اليدوي. مع Ultimate Studio، تنجزه في 3 دقائق فقط!",
      fr: "Parce que la production d'une seule vidéo éducative prend habituellement 5 à 8 heures de travail manuel. Avec Ultimate Studio, vous la réalisez en 3 minutes seulement !",
      en: "Because producing a single educational video normally takes 5-8 hours of manual work. With Ultimate Studio, you complete it in just 3 minutes!",
    },
    howToUse: {
      ar: "ارفع صورة صفحة الكتاب → اضغط 'استخراج النص' → اضغط 'توليد السيناريو' → اختر الأصوات والصور → اضغط 'تصدير الفيديو'.",
      fr: "Téléchargez l'image de la page → Cliquez 'Extraire le texte' → Cliquez 'Générer le scénario' → Choisissez les voix et images → Cliquez 'Exporter la vidéo'.",
      en: "Upload the page image → Click 'Extract Text' → Click 'Generate Script' → Choose voices and images → Click 'Export Video'.",
    },
    ifNotUsed: {
      ar: "ستضطر لقضاء ساعات طويلة في كتابة السيناريو يدوياً، والبحث عن صور مناسبة، وتسجيل الصوت بنفسك، ثم المونتاج — وهي عملية مرهقة ومكلفة.",
      fr: "Vous devrez passer de longues heures à écrire le scénario manuellement, chercher des images appropriées, enregistrer la voix vous-même, puis faire le montage — un processus épuisant et coûteux.",
      en: "You'll have to spend long hours writing the script manually, searching for appropriate images, recording voice yourself, then editing — an exhausting and costly process.",
    },
    steps: {
      ar: ["ارفع صورة صفحة الكتاب المدرسي (PDF أو صورة)", "اضغط زر 'استخراج النص' لقراءة المحتوى بالذكاء الاصطناعي", "راجع النص المستخرج وعدّله إن لزم الأمر", "اضغط 'توليد السيناريو' لإنشاء نص الفيديو التعليمي", "اختر نوع الصوت (أصوات AI أو صوتك المستنسخ)", "ولّد الصور التوضيحية لكل مشهد", "اضغط 'تصدير الفيديو' واحصل على فيديوك الجاهز"],
      fr: ["Téléchargez l'image de la page du manuel (PDF ou image)", "Cliquez 'Extraire le texte' pour lire le contenu par IA", "Révisez le texte extrait et modifiez-le si nécessaire", "Cliquez 'Générer le scénario' pour créer le texte de la vidéo", "Choisissez le type de voix (voix IA ou votre voix clonée)", "Générez les illustrations pour chaque scène", "Cliquez 'Exporter la vidéo' et obtenez votre vidéo prête"],
      en: ["Upload the textbook page image (PDF or image)", "Click 'Extract Text' to read content with AI", "Review the extracted text and edit if needed", "Click 'Generate Script' to create the video text", "Choose voice type (AI voices or your cloned voice)", "Generate illustrations for each scene", "Click 'Export Video' and get your ready video"],
    },
    proTip: {
      ar: "استخدم صوتك المستنسخ لإضفاء لمسة شخصية على الفيديو — التلاميذ يتفاعلون أكثر مع صوت معلمهم الحقيقي!",
      fr: "Utilisez votre voix clonée pour ajouter une touche personnelle à la vidéo — les élèves interagissent davantage avec la vraie voix de leur enseignant !",
      en: "Use your cloned voice to add a personal touch to the video — students interact more with their real teacher's voice!",
    },
  },
  {
    id: "voice-clone",
    icon: Mic,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    route: "/my-voice",
    exclusive: true,
    tier: "exclusive",
    name: {
      ar: "استنساخ الصوت الرقمي — صوتك في كل فيديو",
      fr: "Clonage Vocal Numérique — Votre voix dans chaque vidéo",
      en: "Digital Voice Cloning — Your voice in every video",
    },
    whatItDoes: {
      ar: "يسجّل عينة من صوتك (30 ثانية فقط) ويُنشئ نسخة رقمية مطابقة يمكنك استخدامها لتوليد تعليق صوتي لأي نص تعليمي تلقائياً.",
      fr: "Enregistre un échantillon de votre voix (30 secondes seulement) et crée une copie numérique identique que vous pouvez utiliser pour générer automatiquement une narration pour tout texte éducatif.",
      en: "Records a sample of your voice (just 30 seconds) and creates an identical digital copy you can use to automatically generate narration for any educational text.",
    },
    whyNeedIt: {
      ar: "لأن التلاميذ يتعلمون أفضل عندما يسمعون صوت معلمهم الحقيقي. الاستنساخ الصوتي يجعل كل فيديو شخصياً ومألوفاً للتلميذ.",
      fr: "Parce que les élèves apprennent mieux en entendant la vraie voix de leur enseignant. Le clonage vocal rend chaque vidéo personnelle et familière pour l'élève.",
      en: "Because students learn better when they hear their real teacher's voice. Voice cloning makes every video personal and familiar to the student.",
    },
    howToUse: {
      ar: "اذهب لصفحة 'صوتي الرقمي' → اضغط 'تسجيل' → اقرأ النص المعروض بصوت واضح لمدة 30 ثانية → اضغط 'إنشاء الصوت الرقمي'. بعد دقائق، صوتك جاهز!",
      fr: "Allez à la page 'Ma Voix Numérique' → Cliquez 'Enregistrer' → Lisez le texte affiché clairement pendant 30 secondes → Cliquez 'Créer la voix numérique'. Après quelques minutes, votre voix est prête !",
      en: "Go to 'My Digital Voice' page → Click 'Record' → Read the displayed text clearly for 30 seconds → Click 'Create Digital Voice'. After a few minutes, your voice is ready!",
    },
    ifNotUsed: {
      ar: "ستضطر لاستخدام أصوات AI عامة لا تحمل هويتك الشخصية، مما يقلل من تأثير الفيديو على التلاميذ ويجعله أقل تفاعلية.",
      fr: "Vous devrez utiliser des voix IA génériques qui ne portent pas votre identité personnelle, réduisant l'impact de la vidéo sur les élèves et la rendant moins interactive.",
      en: "You'll have to use generic AI voices that don't carry your personal identity, reducing the video's impact on students and making it less interactive.",
    },
    steps: {
      ar: ["اذهب إلى صفحة 'صوتي الرقمي' من القائمة", "اضغط زر 'بدء التسجيل'", "اقرأ النص المعروض بصوت واضح وطبيعي", "انتظر حتى يكتمل التسجيل (30 ثانية)", "اضغط 'إنشاء الصوت الرقمي'", "انتظر بضع دقائق حتى تتم المعالجة", "صوتك الرقمي جاهز للاستخدام في Ultimate Studio!"],
      fr: ["Allez à la page 'Ma Voix Numérique' depuis le menu", "Cliquez le bouton 'Commencer l'enregistrement'", "Lisez le texte affiché d'une voix claire et naturelle", "Attendez que l'enregistrement soit terminé (30 secondes)", "Cliquez 'Créer la voix numérique'", "Attendez quelques minutes pour le traitement", "Votre voix numérique est prête à utiliser dans Ultimate Studio !"],
      en: ["Go to 'My Digital Voice' page from the menu", "Click the 'Start Recording' button", "Read the displayed text in a clear, natural voice", "Wait until the recording is complete (30 seconds)", "Click 'Create Digital Voice'", "Wait a few minutes for processing", "Your digital voice is ready to use in Ultimate Studio!"],
    },
    proTip: {
      ar: "سجّل في مكان هادئ بدون ضوضاء خلفية، واستخدم سماعات رأس مع ميكروفون للحصول على أفضل جودة صوت.",
      fr: "Enregistrez dans un endroit calme sans bruit de fond, et utilisez un casque avec microphone pour obtenir la meilleure qualité sonore.",
      en: "Record in a quiet place without background noise, and use a headset with microphone for the best sound quality.",
    },
  },
  {
    id: "edu-studio",
    icon: Film,
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-violet-500/10",
    route: "/edu-studio",
    exclusive: false,
    tier: "pro",
    name: {
      ar: "Edu Studio — محرك الفيديو التعليمي",
      fr: "Edu Studio — Moteur Vidéo Éducatif",
      en: "Edu Studio — Educational Video Engine",
    },
    whatItDoes: {
      ar: "محرك إنتاج فيديو تعليمي متقدم يتيح لك إنشاء فيديوهات تعليمية من الصفر مع تحكم كامل في المشاهد والنصوص والصور.",
      fr: "Un moteur de production vidéo éducatif avancé qui vous permet de créer des vidéos éducatives à partir de zéro avec un contrôle total sur les scènes, textes et images.",
      en: "An advanced educational video production engine that lets you create educational videos from scratch with full control over scenes, texts, and images.",
    },
    whyNeedIt: {
      ar: "عندما تريد تحكماً أكبر في عملية الإنتاج أو إنشاء فيديوهات مخصصة لا تعتمد على صفحات الكتاب المدرسي.",
      fr: "Quand vous voulez plus de contrôle sur le processus de production ou créer des vidéos personnalisées qui ne dépendent pas des pages du manuel.",
      en: "When you want more control over the production process or create custom videos that don't depend on textbook pages.",
    },
    howToUse: {
      ar: "اذهب إلى Edu Studio → أنشئ مشروعاً جديداً → أضف المشاهد والنصوص → ولّد الصور → أضف الصوت → صدّر الفيديو.",
      fr: "Allez à Edu Studio → Créez un nouveau projet → Ajoutez les scènes et textes → Générez les images → Ajoutez le son → Exportez la vidéo.",
      en: "Go to Edu Studio → Create a new project → Add scenes and texts → Generate images → Add audio → Export the video.",
    },
    ifNotUsed: {
      ar: "ستفقد القدرة على إنشاء فيديوهات مخصصة بالكامل من الصفر، وستكون محدوداً بالمحتوى المستخرج من الكتب فقط.",
      fr: "Vous perdrez la capacité de créer des vidéos entièrement personnalisées à partir de zéro, et serez limité au contenu extrait des manuels uniquement.",
      en: "You'll lose the ability to create fully custom videos from scratch, and will be limited to content extracted from textbooks only.",
    },
    steps: {
      ar: ["افتح Edu Studio من القائمة", "اضغط 'مشروع جديد'", "أضف المشاهد واكتب النصوص لكل مشهد", "ولّد الصور التوضيحية بالذكاء الاصطناعي", "اختر الصوت (AI أو صوتك المستنسخ)", "راجع المشاهد وعدّل ما يلزم", "صدّر الفيديو النهائي"],
      fr: ["Ouvrez Edu Studio depuis le menu", "Cliquez 'Nouveau projet'", "Ajoutez les scènes et écrivez les textes pour chaque scène", "Générez les illustrations par IA", "Choisissez la voix (IA ou votre voix clonée)", "Révisez les scènes et modifiez si nécessaire", "Exportez la vidéo finale"],
      en: ["Open Edu Studio from the menu", "Click 'New Project'", "Add scenes and write texts for each scene", "Generate AI illustrations", "Choose voice (AI or your cloned voice)", "Review scenes and edit as needed", "Export the final video"],
    },
    proTip: {
      ar: "ابدأ بمشاهد قصيرة (3-5 مشاهد) ثم زد العدد تدريجياً. الفيديوهات القصيرة (2-3 دقائق) أكثر فعالية تعليمياً.",
      fr: "Commencez par des scènes courtes (3-5 scènes) puis augmentez progressivement. Les vidéos courtes (2-3 minutes) sont plus efficaces pédagogiquement.",
      en: "Start with short scenes (3-5 scenes) then gradually increase. Short videos (2-3 minutes) are more pedagogically effective.",
    },
  },
  {
    id: "assistant",
    icon: Sparkles,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-cyan-500/10",
    route: "/assistant",
    exclusive: false,
    tier: "free",
    name: {
      ar: "المساعد البيداغوجي الذكي — EduGPT",
      fr: "L'Assistant Pédagogique Intelligent — EduGPT",
      en: "Smart Pedagogical Assistant — EduGPT",
    },
    whatItDoes: {
      ar: "مساعد ذكاء اصطناعي متخصص في التعليم التونسي يساعدك في إعداد المذكرات والتخطيط والتقييمات وفق المنهج الرسمي.",
      fr: "Un assistant IA spécialisé dans l'éducation tunisienne qui vous aide à préparer les fiches de cours, la planification et les évaluations selon le programme officiel.",
      en: "An AI assistant specialized in Tunisian education that helps you prepare lesson plans, planning, and assessments according to the official curriculum.",
    },
    whyNeedIt: {
      ar: "لتحضير محتوى السيناريو التعليمي قبل تحويله إلى فيديو. المساعد يضمن أن المحتوى مطابق للمنهج الرسمي.",
      fr: "Pour préparer le contenu du scénario éducatif avant de le convertir en vidéo. L'assistant garantit que le contenu est conforme au programme officiel.",
      en: "To prepare the educational script content before converting it to video. The assistant ensures the content matches the official curriculum.",
    },
    howToUse: {
      ar: "افتح المساعد → اكتب طلبك (مثال: 'حضّر لي درس الكسور للسنة 5') → راجع النتيجة → انسخها إلى Ultimate Studio.",
      fr: "Ouvrez l'assistant → Écrivez votre demande (ex: 'Prépare-moi une leçon sur les fractions pour la 5ème') → Révisez le résultat → Copiez-le dans Ultimate Studio.",
      en: "Open the assistant → Write your request (e.g., 'Prepare a fractions lesson for 5th grade') → Review the result → Copy it to Ultimate Studio.",
    },
    ifNotUsed: {
      ar: "ستكتب السيناريو يدوياً من الصفر، مما يستغرق وقتاً أطول وقد لا يكون مطابقاً تماماً للمنهج الرسمي.",
      fr: "Vous écrirez le scénario manuellement à partir de zéro, ce qui prend plus de temps et peut ne pas être exactement conforme au programme officiel.",
      en: "You'll write the script manually from scratch, which takes longer and may not exactly match the official curriculum.",
    },
    steps: {
      ar: ["افتح المساعد البيداغوجي", "حدد المادة والمستوى والدرس", "اكتب طلبك بوضوح", "راجع المحتوى المولّد", "عدّل حسب الحاجة", "انسخ المحتوى لاستخدامه في الفيديو"],
      fr: ["Ouvrez l'assistant pédagogique", "Spécifiez la matière, le niveau et la leçon", "Écrivez votre demande clairement", "Révisez le contenu généré", "Modifiez selon les besoins", "Copiez le contenu pour l'utiliser dans la vidéo"],
      en: ["Open the pedagogical assistant", "Specify the subject, level, and lesson", "Write your request clearly", "Review the generated content", "Edit as needed", "Copy the content to use in the video"],
    },
    proTip: {
      ar: "اطلب من المساعد كتابة 'سيناريو فيديو تعليمي' مباشرة — سيُنشئ نصاً جاهزاً للتحويل إلى فيديو في Ultimate Studio.",
      fr: "Demandez à l'assistant d'écrire directement un 'scénario de vidéo éducative' — il créera un texte prêt à être converti en vidéo dans Ultimate Studio.",
      en: "Ask the assistant to write an 'educational video script' directly — it will create text ready to convert to video in Ultimate Studio.",
    },
  },
  {
    id: "library",
    icon: BookOpen,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/20 to-green-500/10",
    route: "/library",
    exclusive: false,
    tier: "free",
    name: {
      ar: "مكتبة الكتب المدرسية الرقمية",
      fr: "Bibliothèque de Manuels Scolaires Numériques",
      en: "Digital Textbooks Library",
    },
    whatItDoes: {
      ar: "مكتبة رقمية شاملة تحتوي على جميع الكتب المدرسية التونسية بصيغة رقمية، يمكنك تصفحها واستخراج الصفحات مباشرة.",
      fr: "Une bibliothèque numérique complète contenant tous les manuels scolaires tunisiens en format numérique, que vous pouvez parcourir et extraire des pages directement.",
      en: "A comprehensive digital library containing all Tunisian textbooks in digital format, which you can browse and extract pages from directly.",
    },
    whyNeedIt: {
      ar: "لأنها المصدر الأساسي لمحتوى الفيديوهات التعليمية. بدلاً من تصوير الكتاب بهاتفك، تستخرج الصفحة بجودة عالية مباشرة.",
      fr: "Parce que c'est la source principale du contenu des vidéos éducatives. Au lieu de photographier le livre avec votre téléphone, vous extrayez la page en haute qualité directement.",
      en: "Because it's the primary source for educational video content. Instead of photographing the book with your phone, you extract the page in high quality directly.",
    },
    howToUse: {
      ar: "افتح المكتبة → اختر المادة والمستوى → تصفح الكتاب → اضغط على الصفحة المطلوبة → أرسلها مباشرة إلى Ultimate Studio.",
      fr: "Ouvrez la bibliothèque → Choisissez la matière et le niveau → Parcourez le livre → Cliquez sur la page souhaitée → Envoyez-la directement à Ultimate Studio.",
      en: "Open the library → Choose subject and level → Browse the book → Click on the desired page → Send it directly to Ultimate Studio.",
    },
    ifNotUsed: {
      ar: "ستضطر لتصوير صفحات الكتاب بهاتفك (جودة منخفضة) أو البحث عن نسخ PDF على الإنترنت (غير مضمونة الجودة).",
      fr: "Vous devrez photographier les pages du livre avec votre téléphone (basse qualité) ou chercher des copies PDF sur Internet (qualité non garantie).",
      en: "You'll have to photograph book pages with your phone (low quality) or search for PDF copies online (quality not guaranteed).",
    },
    steps: {
      ar: ["افتح مكتبة الكتب المدرسية", "اختر المادة (رياضيات، علوم، عربية...)", "اختر المستوى الدراسي", "تصفح الكتاب وابحث عن الدرس", "اضغط على الصفحة لعرضها بحجم كامل", "استخدمها مباشرة في Ultimate Studio"],
      fr: ["Ouvrez la bibliothèque de manuels", "Choisissez la matière (maths, sciences, arabe...)", "Choisissez le niveau scolaire", "Parcourez le livre et cherchez la leçon", "Cliquez sur la page pour l'afficher en taille réelle", "Utilisez-la directement dans Ultimate Studio"],
      en: ["Open the textbooks library", "Choose the subject (math, science, Arabic...)", "Choose the grade level", "Browse the book and find the lesson", "Click on the page to view full size", "Use it directly in Ultimate Studio"],
    },
    proTip: {
      ar: "استخدم ميزة البحث السريع للوصول مباشرة إلى الدرس المطلوب بدلاً من التصفح اليدوي.",
      fr: "Utilisez la fonction de recherche rapide pour accéder directement à la leçon souhaitée au lieu de parcourir manuellement.",
      en: "Use the quick search feature to go directly to the desired lesson instead of manual browsing.",
    },
  },
  {
    id: "image-gen",
    icon: Image,
    color: "text-pink-500",
    bgGradient: "from-pink-500/20 to-rose-500/10",
    route: "/ai-hub",
    exclusive: false,
    tier: "pro",
    name: {
      ar: "مولّد الصور التعليمية بالذكاء الاصطناعي",
      fr: "Générateur d'Images Éducatives par IA",
      en: "AI Educational Image Generator",
    },
    whatItDoes: {
      ar: "يولّد صوراً تعليمية مخصصة بالذكاء الاصطناعي: رسومات توضيحية، مخططات، صور واقعية، أو رسومات أطفال — كل ما تحتاجه لإثراء فيديوهاتك.",
      fr: "Génère des images éducatives personnalisées par IA : illustrations, schémas, images réalistes ou dessins pour enfants — tout ce dont vous avez besoin pour enrichir vos vidéos.",
      en: "Generates custom educational images with AI: illustrations, diagrams, realistic images, or children's drawings — everything you need to enrich your videos.",
    },
    whyNeedIt: {
      ar: "لأن الفيديو التعليمي الجيد يحتاج صوراً توضيحية جذابة. بدلاً من البحث في Google عن صور (قد تكون محمية بحقوق النشر)، تولّد صوراً حصرية.",
      fr: "Parce qu'une bonne vidéo éducative nécessite des illustrations attrayantes. Au lieu de chercher sur Google des images (qui peuvent être protégées par des droits d'auteur), vous générez des images exclusives.",
      en: "Because a good educational video needs attractive illustrations. Instead of searching Google for images (which may be copyrighted), you generate exclusive images.",
    },
    howToUse: {
      ar: "اذهب إلى مركز أدوات AI → اختر 'توليد صورة' → اكتب وصف الصورة المطلوبة → اختر النمط (واقعي، كرتون، خطي) → اضغط 'توليد'.",
      fr: "Allez au centre d'outils IA → Choisissez 'Générer une image' → Écrivez la description de l'image souhaitée → Choisissez le style (réaliste, cartoon, linéaire) → Cliquez 'Générer'.",
      en: "Go to AI Tools Hub → Choose 'Generate Image' → Write the desired image description → Choose style (realistic, cartoon, linear) → Click 'Generate'.",
    },
    ifNotUsed: {
      ar: "ستعتمد على صور جاهزة من الإنترنت قد تكون غير مناسبة تعليمياً أو محمية بحقوق النشر.",
      fr: "Vous dépendrez d'images prêtes sur Internet qui peuvent ne pas être adaptées pédagogiquement ou protégées par des droits d'auteur.",
      en: "You'll depend on ready-made images from the Internet that may not be pedagogically suitable or may be copyrighted.",
    },
    steps: {
      ar: ["افتح مركز أدوات AI", "اختر أداة توليد الصور", "اكتب وصفاً دقيقاً للصورة المطلوبة", "اختر نمط الصورة المناسب", "اضغط 'توليد' وانتظر النتيجة", "حمّل الصورة أو أرسلها مباشرة للفيديو"],
      fr: ["Ouvrez le centre d'outils IA", "Choisissez l'outil de génération d'images", "Écrivez une description précise de l'image souhaitée", "Choisissez le style d'image approprié", "Cliquez 'Générer' et attendez le résultat", "Téléchargez l'image ou envoyez-la directement à la vidéo"],
      en: ["Open the AI Tools Hub", "Choose the image generation tool", "Write a precise description of the desired image", "Choose the appropriate image style", "Click 'Generate' and wait for the result", "Download the image or send it directly to the video"],
    },
    proTip: {
      ar: "اختر نمط 'خطي أبيض وأسود' (Line Art) للصور التي ستُطبع على ورق — توفر الحبر وتكون أوضح للتلاميذ.",
      fr: "Choisissez le style 'dessin au trait noir et blanc' (Line Art) pour les images qui seront imprimées — économise l'encre et est plus clair pour les élèves.",
      en: "Choose 'black and white line art' style for images that will be printed — saves ink and is clearer for students.",
    },
  },
  {
    id: "prompt-lab",
    icon: PenTool,
    color: "text-indigo-500",
    bgGradient: "from-indigo-500/20 to-blue-500/10",
    route: "/prompt-lab",
    exclusive: false,
    tier: "free",
    name: {
      ar: "مختبر الأوامر — Prompt Lab",
      fr: "Laboratoire de Prompts — Prompt Lab",
      en: "Prompt Lab — Master AI Commands",
    },
    whatItDoes: {
      ar: "مختبر تفاعلي لتعلم كتابة أوامر الذكاء الاصطناعي (Prompts) بطريقة احترافية لتحصل على أفضل النتائج من أي أداة AI.",
      fr: "Un laboratoire interactif pour apprendre à écrire des commandes IA (Prompts) de manière professionnelle pour obtenir les meilleurs résultats de tout outil IA.",
      en: "An interactive lab to learn writing AI commands (Prompts) professionally to get the best results from any AI tool.",
    },
    whyNeedIt: {
      ar: "لأن جودة مخرجات الذكاء الاصطناعي تعتمد بنسبة 80% على جودة الأمر (Prompt). تعلّم كتابة أوامر احترافية = نتائج أفضل بكثير.",
      fr: "Parce que la qualité des sorties IA dépend à 80% de la qualité de la commande (Prompt). Apprendre à écrire des commandes professionnelles = des résultats bien meilleurs.",
      en: "Because AI output quality depends 80% on the command (Prompt) quality. Learning to write professional prompts = much better results.",
    },
    howToUse: {
      ar: "افتح Prompt Lab → اختر نوع المهمة → جرّب كتابة الأمر → قارن النتائج → تعلّم من الأمثلة المحسّنة.",
      fr: "Ouvrez Prompt Lab → Choisissez le type de tâche → Essayez d'écrire la commande → Comparez les résultats → Apprenez des exemples optimisés.",
      en: "Open Prompt Lab → Choose task type → Try writing the command → Compare results → Learn from optimized examples.",
    },
    ifNotUsed: {
      ar: "ستكتب أوامر عشوائية للذكاء الاصطناعي وستحصل على نتائج متوسطة الجودة بدلاً من نتائج احترافية.",
      fr: "Vous écrirez des commandes aléatoires pour l'IA et obtiendrez des résultats de qualité moyenne au lieu de résultats professionnels.",
      en: "You'll write random AI commands and get average quality results instead of professional ones.",
    },
    steps: {
      ar: ["افتح مختبر الأوامر", "اختر فئة المهمة (تعليم، فيديو، صور...)", "اقرأ الأمثلة والنصائح", "جرّب كتابة أمرك الخاص", "قارن نتيجتك مع النتيجة المثالية", "طبّق ما تعلمته في أدوات المنصة"],
      fr: ["Ouvrez le laboratoire de prompts", "Choisissez la catégorie de tâche (éducation, vidéo, images...)", "Lisez les exemples et conseils", "Essayez d'écrire votre propre commande", "Comparez votre résultat avec le résultat idéal", "Appliquez ce que vous avez appris dans les outils de la plateforme"],
      en: ["Open the Prompt Lab", "Choose task category (education, video, images...)", "Read examples and tips", "Try writing your own command", "Compare your result with the ideal result", "Apply what you learned in the platform tools"],
    },
    proTip: {
      ar: "استخدم قالب CRISP: السياق (Context) + الدور (Role) + التعليمات (Instructions) + الأسلوب (Style) + المخرج (Product) للحصول على أفضل النتائج.",
      fr: "Utilisez le modèle CRISP : Contexte + Rôle + Instructions + Style + Produit pour obtenir les meilleurs résultats.",
      en: "Use the CRISP template: Context + Role + Instructions + Style + Product for the best results.",
    },
  },
];

// ─── Journey Steps Component ───
function JourneySteps({ t, lang }: { t: typeof translations.ar; lang: string }) {
  const isRTL = lang === "ar";
  const steps = [
    { icon: BookOpen, text: t.journeyStep1, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Wand2, text: t.journeyStep2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: FileText, text: t.journeyStep3, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Image, text: t.journeyStep4, color: "text-pink-500", bg: "bg-pink-500/10" },
    { icon: Mic, text: t.journeyStep5, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Video, text: t.journeyStep6, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {steps.map((step, i) => (
        <div key={i} className="relative group">
          <div className={`${step.bg} rounded-xl p-4 text-center transition-all hover:scale-105 border border-white/5`}>
            <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-xs font-bold ${step.color}`}>
              {i + 1}
            </div>
            <step.icon className={`w-6 h-6 mx-auto mb-2 ${step.color}`} />
            <p className="text-xs text-white/80 font-medium leading-relaxed">{step.text}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`hidden lg:block absolute top-1/2 ${isRTL ? "-left-3" : "-right-3"} -translate-y-1/2 z-10`}>
              <ArrowRight className={`w-4 h-4 text-white/20 ${isRTL ? "rotate-180" : ""}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tool Card Component ───
function ToolCard({ tool, t, lang }: { tool: ToolDef; t: typeof translations.ar; lang: string }) {
  const [expanded, setExpanded] = useState(false);
  const isRTL = lang === "ar";
  const Icon = tool.icon;

  return (
    <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all overflow-hidden group">
      <CardContent className="p-0">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${tool.bgGradient} relative`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 ${tool.color}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-bold text-white">{tool.name[lang as keyof typeof tool.name]}</h3>
                {tool.exclusive && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                    <Star className="w-3 h-3 me-1" /> {t.exclusive}
                  </Badge>
                )}
                {tool.tier === "free" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">{t.free}</Badge>
                )}
                {tool.tier === "pro" && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">{t.pro}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* What it does */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-blue-400">{t.whatItDoes}</h4>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{tool.whatItDoes[lang as keyof typeof tool.whatItDoes]}</p>
          </div>

          {/* Why need it */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-amber-400">{t.whyNeedIt}</h4>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{tool.whyNeedIt[lang as keyof typeof tool.whyNeedIt]}</p>
          </div>

          {/* How to use - brief */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-emerald-400">{t.howToUse}</h4>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{tool.howToUse[lang as keyof typeof tool.howToUse]}</p>
          </div>

          {/* Expandable section */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors w-full justify-center py-2 border-t border-white/5"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "" : t.stepByStep}
          </button>

          {expanded && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Step by step */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" /> {t.stepByStep}
                </h4>
                <ol className="space-y-2">
                  {tool.steps[lang as keyof typeof tool.steps].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white/90">{i + 1}</span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* What if not used */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {t.ifNotUsed}
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">{tool.ifNotUsed[lang as keyof typeof tool.ifNotUsed]}</p>
              </div>

              {/* Pro tip */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" /> {t.proTip}
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">{tool.proTip[lang as keyof typeof tool.proTip]}</p>
              </div>
            </div>
          )}

          {/* Open Tool Button */}
          <Link href={tool.route}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold">
              <ExternalLink className="w-4 h-4 me-2" />
              {t.openTool}
              <ArrowRight className={`w-4 h-4 ms-2 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page Component ───
export default function CourseToolkit() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const lang = language || "ar";
  const isRTL = lang === "ar";
  const t = translations[lang as keyof typeof translations] || translations.ar;

  const { data: myEnrollments, isLoading: enrollLoading } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });

  const isEnrolled = myEnrollments?.some((e: any) =>
    (e.enrollment?.courseId === 30001 || e.course?.category === "digital_teacher_ai") &&
    ["approved", "active", "completed"].includes(e.enrollment?.status)
  ) ?? false;

  const loading = authLoading || enrollLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white/60">{t.loading}</p>
        </div>
      </div>
    );
  }

  const exclusiveTools = COURSE_TOOLS.filter(t => t.exclusive);
  const otherTools = COURSE_TOOLS.filter(t => !t.exclusive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={isRTL ? "rtl" : "ltr"}>
      {/* ═══ Hero Header ═══ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 start-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-12 relative">
          {/* Back link */}
          <Link href="/courses/30001">
            <Button variant="ghost" className="text-white/50 hover:text-white mb-6">
              <ArrowRight className={`w-4 h-4 me-2 ${isRTL ? "" : "rotate-180"}`} />
              {t.backToCourse}
            </Button>
          </Link>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-4">
              <Clapperboard className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{t.pageSubtitle}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.pageTitle}</h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">{t.pageDescription}</p>

            {/* Enrollment Status */}
            <div className="mt-6">
              {!user ? (
                <a href={getLoginUrl("/course-toolkit")}>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Lock className="w-4 h-4 me-2" /> {t.loginRequired}
                  </Button>
                </a>
              ) : isEnrolled ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 me-2" /> {t.enrolledBadge}
                </Badge>
              ) : (
                <Link href="/courses/30001">
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                    <GraduationCap className="w-4 h-4 me-2" /> {t.enrollNow}
                  </Button>
                </Link>
              )}
            </div>

            {/* Tools count */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/40">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold">{COURSE_TOOLS.length} {t.toolsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Welcome & Quick Start ═══ */}
      <div className="container max-w-6xl mx-auto px-4 pb-8">
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{t.quickStart}</h2>
                <p className="text-white/60 text-sm">{t.quickStartDesc}</p>
              </div>
            </div>
            <JourneySteps t={t} lang={lang} />
          </CardContent>
        </Card>
      </div>

      {/* ═══ Exclusive Tools Section ═══ */}
      <div className="container max-w-6xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">{t.exclusiveTools}</h2>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{exclusiveTools.length}</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {exclusiveTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} t={t} lang={lang} />
          ))}
        </div>
      </div>

      {/* ═══ All Platform Tools Section ═══ */}
      <div className="container max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">{t.allTools}</h2>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{otherTools.length}</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {otherTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} t={t} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}
