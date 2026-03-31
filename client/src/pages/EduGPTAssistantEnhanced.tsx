import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, File, Menu, Search, Trash2, Download, Plus, MessageSquare, ArrowRight, Globe, Pencil, Check, Pin, PinOff, Sparkles, BookOpen, ClipboardCheck, Copy, RefreshCw, Printer, Calendar, GripVertical, Upload, Lightbulb } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LeaderStudio } from "@/components/LeaderStudio";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExportMetadataModal, type ExportMetadata } from "@/components/ExportMetadataModal";
import PrintPreview from "@/components/PrintPreview";
import { LockedFeature, usePermissions } from "@/components/LockedFeature";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ===== TRANSLATIONS =====
const UI = {
  ar: {
    sidebarTitle: "المحادثات السابقة",
    newBtn: "جديد",
    searchPlaceholder: "ابحث في المحادثات...",
    noConversations: "لا توجد محادثات سابقة",
    newConversation: "محادثة جديدة",
    backToHome: "العودة إلى الصفحة الرئيسية",
    changeContext: "تغيير",
    setContext: "⚠️ حدد المادة والمستوى",
    modalTitle: "🎓 تحديد سياق التعليم",
    modalSubtitle: "حدد المادة والمستوى ولغة التدريس لتخصيص إجابات المساعد بدقة",
    subjectLabel: "📚 المادة الدراسية",
    levelLabel: "🎓 المستوى الدراسي",
    langLabel: "🌐 لغة التدريس (اختياري)",
    confirmBtn: (s: string, l: string, lang?: string | null) =>
      `تأكيد: ${s} — ${l}${lang ? " — " + lang : ""}`,
    selectFirst: "يرجى اختيار المادة والمستوى",
    welcomeTitle: "مرحباً بك",
    welcomeNoContext: "لبدء المحادثة، يرجى تحديد المادة الدراسية والمستوى أولاً حتى يتمكن المساعد من تقديم إجابات دقيقة ومتوافقة مع البرامج الرسمية التونسية.",
    selectContextBtn: "📚 حدد المادة والمستوى الدراسي",
    readyMsg: (s: string, l: string) => `جاهز لمساعدتك في`,
    expertDesc: "الخبير البيداغوجي الرقمي التونسي. أساعدك في إعداد المذكرات والتقييمات وفق البرامج الرسمية.",
    placeholder: "اكتب رسالتك هنا... (أو أرفق ملف PDF/صورة)",
    suggestions: [
      { label: "إعداد مذكرة بيداغوجية رسمية", prompt: "أريد إعداد مذكرة بيداغوجية (Fiche de préparation) وفق البرامج الرسمية التونسية" },
      { label: "تمارين متمايزة (بيداغوجيا فارقية)", prompt: "ساعدني في بناء تمارين متمايزة (علاجي، دعم، تميّز)" },
      { label: "توزيع سنوي/فصلي", prompt: "أحتاج توزيعاً سنوياً/فصلياً (Répartition) للبرنامج" },
      { label: "تقييم بيداغوجي على 20", prompt: "قيّم هذه المذكرة على 20 وفق معايير وزارة التربية" },
    ],
    // Tags
    tagAll: "الكل",
    tagNote: "📝 مذكرة",
    tagEval: "✅ تقييم",
    tagAnnual: "📅 توزيع سنوي",
    tagExercises: "✏️ تمارين",
    tagReview: "🔄 مراجعة",
    tagReport: "📊 تقرير",
    tagOther: "💡 أخرى",
    tagAdd: "إضافة وسم",
    tagChoose: "اختر وسماً",
    // Quick actions
    quickLessonPlan: "تحضير جذاذة",
    quickLessonPlanPrompt: "أعدّ لي جذاذة درس مفصّلة وفق المعايير التونسية الرسمية",
    quickExam: "إنشاء اختبار",
    quickExamPrompt: "أنشئ اختباراً رسمياً بالسندات والتعليمات ومعايير التملك (مع1-مع4) وجدول التنقيط",
    quickDrama: "سيناريو دراما",
    quickDramaPrompt: "أنشئ سيناريو مسرحي تعليمي (دراما تربوية) لمدة 10 دقائق مع توزيع الأدوار",
    // Quick suggestion buttons
    quickGoal: "صغ لي هدفاً مميزاً",
    quickGoalPrompt: "للمادة {subject} المستوى {level} الدرس {topic}: صغ لي هدفاً مميزاً قابلاً للقياس",
    quickProblem: "اقترح وضعية مشكل استكشافية",
    quickProblemPrompt: "للمادة {subject} المستوى {level} الدرس {topic}: اقترح وضعية مشكل استكشافية مرتبطة بالحياة اليومية التونسية",
    quickQuestions: "أعطني 3 أسئلة تقييمية",
    quickQuestionsPrompt: "للمادة {subject} المستوى {level} الدرس {topic}: أعطني 3 أسئلة تقييمية مناسبة",
    quickActivity: "اقترح نشاطاً استكشافياً",
    quickActivityPrompt: "للمادة {subject} المستوى {level} الدرس {topic}: اقترح نشاطاً استكشافياً عملياً",
    // Export
    exportBtn: "تصدير",
    exportPdfFull: "PDF (محادثة كاملة)",
    exportWordFull: "Word (محادثة كاملة)",
    exportPdfClean: "PDF ✨ (مذكرة نظيفة)",
    exportWordClean: "Word ✨ (مذكرة نظيفة)",
    exportPrintPreview: "📄 معاينة الطباعة A4",
    // Toasts
    toastExportSuccess: "تم تصدير المحادثة بنجاح",
    toastExportError: "خطأ في تصدير المحادثة",
    toastCleanSuccess: "تم تصدير المذكرة النظيفة بنجاح ✔️",
    toastCleanPdfError: "خطأ في تصدير PDF",
    toastCleanWordError: "خطأ في تصدير Word",
    toastExporting: "جاري تصدير المحادثة...",
    toastCreatingClean: "جاري إنشاء المذكرة النظيفة...",
    toastTemplateLoaded: "تم تحميل القالب",
    toastConnectionError: "خطأ في الاتصال بالمساعد الذكي",
    toastSaved: "تم حفظ المحادثة",
    toastDeleted: "تم حذف المحادثة",
    toastPinError: "خطأ في تثبيت المحادثة",
    toastTagError: "خطأ في تحديث الوسوم",
    toastFileTooLarge: "كبير جداً. الحد الأقصى 10 ميجابايت",
    toastFileAnalyzeError: "تعذر تحليل الملف",
    toastUploadError: "خطأ في رفع الملفات",
    toastCopied: "تم نسخ النص بنجاح",
    toastExportingMsg: "جاري تصدير الرد...",
    copyBtn: "نسخ",
    downloadPdfBtn: "PDF",
    downloadWordBtn: "Word",
    printBtn: "طباعة",
    regenerateBtn: "إعادة التوليد",
    dropZoneText: "أفلت الملفات هنا",
    dropZoneSubtext: "PDF, صور, Word",
    quickAnnualPlan: "توزيع سنوي",
    quickAnnualPlanPrompt: "أعدّ لي توزيعاً سنوياً مفصلاً وفق البرنامج الرسمي التونسي مع توزيع الحصص على الثلاثيات",
    quickExercises: "تمارين",
    quickExercisesPrompt: "أنشئ سلسلة تمارين متدرجة الصعوبة (دعم + علاج + تميز) مع الإصلاح",
    quickImage: "صورة تعليمية",
    quickImagePrompt: "أنشئ صورة تعليمية بالأبيض والأسود للطباعة تناسب الدرس",
    // Misc
    typing: "جاري الكتابة...",
    deleteConfirm: "هل أنت متأكد من حذف هذه المحادثة؟",
    pinTitle: "تثبيت في الأعلى",
    unpinTitle: "إلغاء التثبيت",
    deleteTitle: "حذف",
    loadingText: "جارٍ التحميل...",
    renameTitle: "إعادة التسمية",
    dateToday: "اليوم",
    dateYesterday: "أمس",
    dateDaysAgo: (d: number) => `منذ ${d} أيام`,
    datePinned: "المثبتة",
    dateOlder: "أقدم",
    templateLoadPrompt: (name: string) => `أريد إعداد مذكرة بيداغوجية رسمية بناءً على القالب: "${name}"`,
    fileContentLabel: (name: string) => `[محتوى الملف ${name}]:`,
    // Welcome message
    welcomeMessage: `مرحباً — أنا EDUGPT، مستشارك البيداغوجي. أخبرني بما تحتاجه مباشرةً.`,
    // Subjects
    subjects: [
      "اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية / English",
      "الرياضيات", "العلوم", "التربية الإسلامية", "التربية المدنية",
      "التاريخ", "الجغرافيا", "الفلسفة", "الفيزياء", "الكيمياء",
      "الأحياء", "التكنولوجيا", "الفنون", "التربية البدنية", "أخرى",
    ],
    // Levels
    levels: [
      "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
      "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
      "السنة السابعة إعدادي", "السنة الثامنة إعدادي", "السنة التاسعة إعدادي",
      "السنة الأولى ثانوي", "السنة الثانية ثانوي", "السنة الثالثة ثانوي", "السنة الرابعة ثانوي",
    ],
    // Teaching language options
    teachLangAr: "🇹🇳 عربية",
    teachLangArDesc: "المواد بالعربية",
    teachLangFr: "🇫🇷 Français",
    teachLangFrDesc: "Matières en français",
    teachLangEn: "🇬🇧 English",
    teachLangEnDesc: "English subjects",
  },
  fr: {
    sidebarTitle: "Conversations",
    newBtn: "Nouveau",
    searchPlaceholder: "Rechercher...",
    noConversations: "Aucune conversation",
    newConversation: "Nouvelle conversation",
    backToHome: "Retour à l'accueil",
    changeContext: "Modifier",
    setContext: "⚠️ Définir matière et niveau",
    modalTitle: "🎓 Définir le contexte",
    modalSubtitle: "Sélectionnez la matière, le niveau et la langue pour personnaliser les réponses",
    subjectLabel: "📚 Matière",
    levelLabel: "🎓 Niveau scolaire",
    langLabel: "🌐 Langue d'enseignement (optionnel)",
    confirmBtn: (s: string, l: string, lang?: string | null) =>
      `Confirmer : ${s} — ${l}${lang ? " — " + lang : ""}`,
    selectFirst: "Veuillez sélectionner la matière et le niveau",
    welcomeTitle: "Bienvenue dans l'assistant pédagogique",
    welcomeNoContext: "Pour commencer, veuillez sélectionner la matière et le niveau afin que l'assistant puisse vous fournir des réponses précises conformément aux programmes officiels tunisiens.",
    selectContextBtn: "📚 Définir la matière et le niveau",
    readyMsg: (s: string, l: string) => `Prêt à vous aider en`,
    expertDesc: "Expert pédagogique numérique tunisien. Je vous aide à préparer vos fiches et évaluations selon les programmes officiels.",
    placeholder: "Tapez votre message... (ou joignez un fichier PDF/image)",
    suggestions: [
      { label: "Fiche de préparation officielle", prompt: "Je veux préparer une fiche de préparation officielle selon les programmes tunisiens" },
      { label: "Exercices différenciés", prompt: "Aide-moi à créer des exercices différenciés (remédiation, soutien, excellence)" },
      { label: "Répartition annuelle/trimestrielle", prompt: "J'ai besoin d'une répartition annuelle/trimestrielle du programme" },
      { label: "Évaluation pédagogique sur 20", prompt: "Évalue cette fiche sur 20 selon les critères du ministère de l'éducation" },
    ],
    tagAll: "Tous",
    tagNote: "📝 Fiche",
    tagEval: "✅ Évaluation",
    tagAnnual: "📅 Répartition",
    tagExercises: "✏️ Exercices",
    tagReview: "🔄 Révision",
    tagReport: "📊 Rapport",
    tagOther: "💡 Autre",
    tagAdd: "Ajouter un tag",
    tagChoose: "Choisir un tag",
    quickLessonPlan: "Préparer une fiche",
    quickLessonPlanPrompt: "Prépare-moi une fiche de leçon détaillée selon les normes officielles tunisiennes",
    quickExam: "Créer un examen",
    quickExamPrompt: "Crée un examen officiel avec contextes, consignes, critères de maîtrise (C1-C4) et barème",
    quickDrama: "Scénario dramatique",
    quickDramaPrompt: "Crée un scénario de théâtre éducatif (drame pédagogique) de 10 minutes avec distribution des rôles",
    exportBtn: "Exporter",
    exportPdfFull: "PDF (conversation complète)",
    exportWordFull: "Word (conversation complète)",
    exportPdfClean: "PDF ✨ (fiche propre)",
    exportWordClean: "Word ✨ (fiche propre)",
    exportPrintPreview: "📄 Aperçu impression A4",
    toastExportSuccess: "Conversation exportée avec succès",
    toastExportError: "Erreur lors de l'exportation",
    toastCleanSuccess: "Fiche propre exportée avec succès ✔️",
    toastCleanPdfError: "Erreur d'exportation PDF",
    toastCleanWordError: "Erreur d'exportation Word",
    toastExporting: "Exportation en cours...",
    toastCreatingClean: "Création de la fiche propre...",
    toastTemplateLoaded: "Modèle chargé",
    toastConnectionError: "Erreur de connexion à l'assistant",
    toastSaved: "Conversation sauvegardée",
    toastDeleted: "Conversation supprimée",
    toastPinError: "Erreur d'épinglage",
    toastTagError: "Erreur de mise à jour des tags",
    toastFileTooLarge: "trop volumineux. Maximum 10 Mo",
    toastFileAnalyzeError: "Impossible d'analyser le fichier",
    toastUploadError: "Erreur de téléchargement",
    toastCopied: "Texte copié avec succès",
    toastExportingMsg: "Export du message en cours...",
    copyBtn: "Copier",
    downloadPdfBtn: "PDF",
    downloadWordBtn: "Word",
    printBtn: "Imprimer",
    regenerateBtn: "Regénérer",
    dropZoneText: "Déposez vos fichiers ici",
    dropZoneSubtext: "PDF, images, Word",
    quickAnnualPlan: "Répartition annuelle",
    quickAnnualPlanPrompt: "Préparez une répartition annuelle détaillée selon le programme officiel tunisien",
    quickExercises: "Exercices",
    quickExercisesPrompt: "Créez une série d'exercices différenciés (remédiation + soutien + excellence) avec corrigé",
    quickImage: "Image pédagogique",
    quickImagePrompt: "Générez une image pédagogique en noir et blanc pour impression",
    typing: "En train d'écrire...",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette conversation ?",
    pinTitle: "Épingler en haut",
    unpinTitle: "Désépingler",
    deleteTitle: "Supprimer",
    loadingText: "Chargement...",
    renameTitle: "Renommer",
    dateToday: "Aujourd'hui",
    dateYesterday: "Hier",
    dateDaysAgo: (d: number) => `Il y a ${d} jours`,
    datePinned: "Épinglées",
    dateOlder: "Plus anciennes",
    templateLoadPrompt: (name: string) => `Je veux préparer une fiche pédagogique officielle basée sur le modèle : "${name}"`,
    fileContentLabel: (name: string) => `[Contenu du fichier ${name}]:`,
    welcomeMessage: `Bienvenue sur **Leader Academy** ! Je suis **Leader Assistant**, votre conseiller pédagogique numérique. Je suis là pour vous aider à préparer vos fiches, répartitions annuelles et évaluations selon les programmes officiels tunisiens 2026.
Pour mieux vous aider, dites-moi :
- **Quelle matière enseignez-vous ?** (ex : Éveil scientifique, Mathématiques, Arabe...)
- **Quel niveau scolaire ?** (ex : 3ème année primaire)
Ou dites-moi directement ce dont vous avez besoin ! 😊`,
    subjects: [
      "Arabe", "Français", "Anglais / English",
      "Mathématiques", "Sciences", "Éducation islamique", "Éducation civique",
      "Histoire", "Géographie", "Philosophie", "Physique", "Chimie",
      "Biologie", "Technologie", "Arts", "Éducation physique", "Autre",
    ],
    levels: [
      "1ère année primaire", "2ème année primaire", "3ème année primaire",
      "4ème année primaire", "5ème année primaire", "6ème année primaire",
      "7ème année (collège)", "8ème année (collège)", "9ème année (collège)",
      "1ère année secondaire", "2ème année secondaire", "3ème année secondaire", "4ème année secondaire",
    ],
    teachLangAr: "🇹🇳 Arabe",
    teachLangArDesc: "Matières en arabe",
    teachLangFr: "🇫🇷 Français",
    teachLangFrDesc: "Matières en français",
    teachLangEn: "🇬🇧 English",
    teachLangEnDesc: "English subjects",
  },
  en: {
    sidebarTitle: "Conversations",
    newBtn: "New",
    searchPlaceholder: "Search conversations...",
    noConversations: "No conversations yet",
    newConversation: "New conversation",
    backToHome: "Back to Home",
    changeContext: "Change",
    setContext: "⚠️ Set subject & level",
    modalTitle: "🎓 Set Teaching Context",
    modalSubtitle: "Select subject, level and language to personalize the assistant's responses",
    subjectLabel: "📚 Subject",
    levelLabel: "🎓 Grade level",
    langLabel: "🌐 Teaching language (optional)",
    confirmBtn: (s: string, l: string, lang?: string | null) =>
      `Confirm: ${s} — ${l}${lang ? " — " + lang : ""}`,
    selectFirst: "Please select subject and level",
    welcomeTitle: "Welcome to the Pedagogical Assistant",
    welcomeNoContext: "To start, please select the subject and grade level so the assistant can provide accurate answers aligned with official Tunisian programs.",
    selectContextBtn: "📚 Select subject & grade level",
    readyMsg: (s: string, l: string) => `Ready to help you with`,
    expertDesc: "Tunisian digital pedagogical expert. I help you prepare lesson plans and assessments according to official programs.",
    placeholder: "Type your message... (or attach a PDF/image file)",
    suggestions: [
      { label: "Official Lesson Plan", prompt: "I want to prepare an official lesson plan according to Tunisian programs" },
      { label: "Differentiated Exercises", prompt: "Help me create differentiated exercises (remediation, support, excellence)" },
      { label: "Annual/Term Distribution", prompt: "I need an annual/term distribution of the program" },
      { label: "Pedagogical Evaluation /20", prompt: "Evaluate this lesson plan out of 20 according to Ministry of Education criteria" },
    ],
    tagAll: "All",
    tagNote: "📝 Lesson Plan",
    tagEval: "✅ Evaluation",
    tagAnnual: "📅 Annual Plan",
    tagExercises: "✏️ Exercises",
    tagReview: "🔄 Review",
    tagReport: "📊 Report",
    tagOther: "💡 Other",
    tagAdd: "Add tag",
    tagChoose: "Choose a tag",
    quickLessonPlan: "Prepare Lesson Plan",
    quickLessonPlanPrompt: "Prepare a detailed lesson plan according to official Tunisian standards",
    quickExam: "Create Exam",
    quickExamPrompt: "Create an official exam with contexts, instructions, mastery criteria (C1-C4) and grading table",
    quickDrama: "Drama Scenario",
    quickDramaPrompt: "Create a 10-minute educational theatre scenario (pedagogical drama) with role distribution",
    exportBtn: "Export",
    exportPdfFull: "PDF (full conversation)",
    exportWordFull: "Word (full conversation)",
    exportPdfClean: "PDF ✨ (clean lesson plan)",
    exportWordClean: "Word ✨ (clean lesson plan)",
    exportPrintPreview: "📄 Print Preview A4",
    toastExportSuccess: "Conversation exported successfully",
    toastExportError: "Error exporting conversation",
    toastCleanSuccess: "Clean lesson plan exported successfully ✔️",
    toastCleanPdfError: "PDF export error",
    toastCleanWordError: "Word export error",
    toastExporting: "Exporting conversation...",
    toastCreatingClean: "Creating clean lesson plan...",
    toastTemplateLoaded: "Template loaded",
    toastConnectionError: "Connection error with AI assistant",
    toastSaved: "Conversation saved",
    toastDeleted: "Conversation deleted",
    toastPinError: "Error pinning conversation",
    toastTagError: "Error updating tags",
    toastFileTooLarge: "too large. Maximum 10 MB",
    toastFileAnalyzeError: "Unable to analyze file",
    toastUploadError: "File upload error",
    toastCopied: "Text copied successfully",
    toastExportingMsg: "Exporting message...",
    copyBtn: "Copy",
    downloadPdfBtn: "PDF",
    downloadWordBtn: "Word",
    printBtn: "Print",
    regenerateBtn: "Regenerate",
    dropZoneText: "Drop files here",
    dropZoneSubtext: "PDF, images, Word",
    quickAnnualPlan: "Annual plan",
    quickAnnualPlanPrompt: "Prepare a detailed annual distribution according to the official Tunisian program",
    quickExercises: "Exercises",
    quickExercisesPrompt: "Create a series of differentiated exercises (remediation + support + excellence) with corrections",
    quickImage: "Educational image",
    quickImagePrompt: "Generate a black and white educational image for printing",
    typing: "Typing...",
    deleteConfirm: "Are you sure you want to delete this conversation?",
    pinTitle: "Pin to top",
    unpinTitle: "Unpin",
    deleteTitle: "Delete",
    loadingText: "Loading...",
    renameTitle: "Rename",
    dateToday: "Today",
    dateYesterday: "Yesterday",
    dateDaysAgo: (d: number) => `${d} days ago`,
    datePinned: "Pinned",
    dateOlder: "Older",
    templateLoadPrompt: (name: string) => `I want to prepare an official lesson plan based on the template: "${name}"`,
    fileContentLabel: (name: string) => `[File content ${name}]:`,
    welcomeMessage: `Welcome to **Leader Academy**! I'm **Leader Assistant**, your digital educational consultant. I'm here to help you prepare lesson plans, annual distributions, and assessments according to official Tunisian programs 2026.
To better assist you, tell me:
- **What subject do you teach?** (e.g., Science, Mathematics, Arabic...)
- **What grade level?** (e.g., 3rd year primary)
Or tell me directly what you need! 😊`,
    subjects: [
      "Arabic", "French", "English",
      "Mathematics", "Science", "Islamic Education", "Civic Education",
      "History", "Geography", "Philosophy", "Physics", "Chemistry",
      "Biology", "Technology", "Arts", "Physical Education", "Other",
    ],
    levels: [
      "1st Year Primary", "2nd Year Primary", "3rd Year Primary",
      "4th Year Primary", "5th Year Primary", "6th Year Primary",
      "7th Year (Middle)", "8th Year (Middle)", "9th Year (Middle)",
      "1st Year Secondary", "2nd Year Secondary", "3rd Year Secondary", "4th Year Secondary",
    ],
    teachLangAr: "🇹🇳 Arabic",
    teachLangArDesc: "Arabic subjects",
    teachLangFr: "🇫🇷 French",
    teachLangFrDesc: "French subjects",
    teachLangEn: "🇬🇧 English",
    teachLangEnDesc: "English subjects",
  },
} as const;
// ===== END TRANSLATIONS =====

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  timestamp: number;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastMessageAt: Date | string;
}

// SUBJECTS and LEVELS are now dynamic from t.subjects and t.levels

// Map subject index to their teaching language for auto-detection
const LANGUAGE_SUBJECT_INDICES = [0, 1, 2]; // Arabic, French, English are always first 3
const LANGUAGE_MAP: ("arabic" | "french" | "english")[] = ["arabic", "french", "english"];

// LEVELS moved to t.levels

// ===== PREDEFINED TAGS =====
// PREDEFINED_TAGS are now dynamic from t.tagNote, t.tagEval, etc.
const TAG_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-gray-100 text-gray-700 border-gray-200",
];
const TAG_VALUES = ["مذكرة", "تقييم", "توزيع سنوي", "تمارين", "مراجعة", "تقرير", "أخرى"];

export default function EduGPTAssistantEnhanced() {
  const { hasEdugpt, isAdmin, isLoading: permLoading } = usePermissions();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const { language: globalLanguage, setLanguage } = useLanguage();
  const t = UI[globalLanguage as keyof typeof UI] ?? UI.ar;
  const [conversationTitle, setConversationTitle] = useState<string>(t.newConversation);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(() => {
    try { return localStorage.getItem('assistant_subject') || null; } catch { return null; }
  });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(() => {
    try { return localStorage.getItem('assistant_level') || null; } catch { return null; }
  });

  // Dynamic translated arrays
  const SUBJECTS = t.subjects as unknown as string[];
  const LEVELS = t.levels as unknown as string[];
  const PREDEFINED_TAGS = [
    { label: t.tagNote, value: TAG_VALUES[0], color: TAG_COLORS[0] },
    { label: t.tagEval, value: TAG_VALUES[1], color: TAG_COLORS[1] },
    { label: t.tagAnnual, value: TAG_VALUES[2], color: TAG_COLORS[2] },
    { label: t.tagExercises, value: TAG_VALUES[3], color: TAG_COLORS[3] },
    { label: t.tagReview, value: TAG_VALUES[4], color: TAG_COLORS[4] },
    { label: t.tagReport, value: TAG_VALUES[5], color: TAG_COLORS[5] },
    { label: t.tagOther, value: TAG_VALUES[6], color: TAG_COLORS[6] },
  ];

  // Dynamic subject language map
  const SUBJECT_LANGUAGE_MAP: Record<string, "arabic" | "french" | "english"> = {};
  LANGUAGE_SUBJECT_INDICES.forEach((idx, i) => {
    if (SUBJECTS[idx]) SUBJECT_LANGUAGE_MAP[SUBJECTS[idx]] = LANGUAGE_MAP[i];
  });
  const [teachingLanguage, setTeachingLanguage] = useState<"arabic" | "french" | "english" | null>(() => {
    try {
      const saved = localStorage.getItem('assistant_teaching_language') as "arabic" | "french" | "english" | null;
      if (saved) return saved;
    } catch { /* ignore */ }
    // Don't auto-assign based on UI language - let user explicitly choose
    // This prevents the bug where French UI auto-sets French teaching language
    // causing Arabic messages to get French responses
    return null;
  });
  // Inline rename state
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editingConvTitle, setEditingConvTitle] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  // Tags state
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [tagMenuConvId, setTagMenuConvId] = useState<number | null>(null);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Export metadata modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalFormat, setExportModalFormat] = useState<"pdf" | "word">("pdf");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Read templateId from URL query params
  const templateId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("templateId");
    return id ? parseInt(id, 10) : null;
  }, []);

  // Fetch template data if templateId is present in URL
  const { data: templateData } = trpc.templates.getById.useQuery(
    { id: templateId! },
    { enabled: !!templateId && !templateLoaded }
  );

  // Auto-fill context and input from template
  useEffect(() => {
    if (!templateData || templateLoaded) return;
    setTemplateLoaded(true);
    if (templateData.subject) setSelectedSubject(templateData.subject);
    if (templateData.grade) setSelectedLevel(templateData.grade);
    if (templateData.language === "french") setTeachingLanguage("french");
    else if (templateData.language === "english") setTeachingLanguage("english");
    else setTeachingLanguage("arabic");
    // Build prompt from template fields
    const parts: string[] = [
      t.templateLoadPrompt(templateData.templateName),
    ];
    // Template fields use teaching language context for LLM prompt
    const subjectLabel = globalLanguage === 'fr' ? 'Matière' : globalLanguage === 'en' ? 'Subject' : 'المادة';
    const gradeLabel = globalLanguage === 'fr' ? 'Niveau' : globalLanguage === 'en' ? 'Level' : 'المستوى';
    const durationLabel = globalLanguage === 'fr' ? 'Durée' : globalLanguage === 'en' ? 'Duration' : 'المدة';
    const durationUnit = globalLanguage === 'fr' ? 'minutes' : globalLanguage === 'en' ? 'minutes' : 'دقيقة';
    const objectivesLabel = globalLanguage === 'fr' ? 'Objectifs' : globalLanguage === 'en' ? 'Objectives' : 'الأهداف التعلمية';
    const introLabel = globalLanguage === 'fr' ? 'Introduction' : globalLanguage === 'en' ? 'Introduction' : 'التمهيد';
    const evalLabel = globalLanguage === 'fr' ? 'Évaluation' : globalLanguage === 'en' ? 'Evaluation' : 'التقييم';
    if (templateData.subject) parts.push(`${subjectLabel}: ${templateData.subject}`);
    if (templateData.grade) parts.push(`${gradeLabel}: ${templateData.grade}`);
    if (templateData.duration) parts.push(`${durationLabel}: ${templateData.duration} ${durationUnit}`);
    if (templateData.lessonObjectives) parts.push(`${objectivesLabel}: ${templateData.lessonObjectives}`);
    if (templateData.introduction) parts.push(`${introLabel}: ${templateData.introduction}`);
    if (templateData.evaluation) parts.push(`${evalLabel}: ${templateData.evaluation}`);
    setInput(parts.join("\n"));
    // Remove templateId from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("templateId");
    window.history.replaceState({}, "", url.toString());
    toast.success(`${t.toastTemplateLoaded}: ${templateData.templateName}`);
  }, [templateData, templateLoaded]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries and mutations
  const { data: conversations = [], refetch: refetchConversations } = trpc.assistant.getConversations.useQuery({
    searchQuery: searchQuery || undefined,
    filterTag: filterTag || undefined,
  });

  // Streaming ref to accumulate content across chunks
  const streamingContentRef = useRef("");
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Streaming send function using SSE
  const sendStreamingMessage = useCallback(async (msgs: Message[], opts?: { subject?: string; level?: string; teachingLanguage?: string }) => {
    setIsLoading(true);
    streamingContentRef.current = "";
    setStreamingContent("");

    // Add empty assistant message placeholder
    const placeholderMsg: Message = { role: "assistant", content: "", timestamp: Date.now() };
    const withPlaceholder = [...msgs, placeholderMsg];
    setMessages(withPlaceholder);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          subject: opts?.subject,
          level: opts?.level,
          teachingLanguage: opts?.teachingLanguage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.error) {
              toast.error(data.error);
              continue;
            }
            if (data.content) {
              streamingContentRef.current += data.content;
              setStreamingContent(streamingContentRef.current);
              // Update the last message in-place
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: streamingContentRef.current };
                }
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Finalize: update the last message with complete content
      const finalContent = streamingContentRef.current;
      const finalMessages = [...msgs, { role: "assistant" as const, content: finalContent, timestamp: Date.now() }];
      setMessages(finalMessages);
      setIsLoading(false);
      setStreamingContent("");
      streamingContentRef.current = "";
      abortControllerRef.current = null;

      // Auto-save conversation
      await saveCurrentConversation(finalMessages);

      // Detect lead interest
      const lastUserMsg = [...msgs].reverse().find(m => m.role === "user");
      if (lastUserMsg) {
        detectAndNotifyLead(lastUserMsg.content, currentConversationId ?? undefined);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Streaming error:", error);
      toast.error(t.toastConnectionError);
      setIsLoading(false);
      setStreamingContent("");
      streamingContentRef.current = "";
      abortControllerRef.current = null;
    }
  }, [currentConversationId, t]);

  const saveConversationMutation = trpc.assistant.saveConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      refetchConversations();
      toast.success(t.toastSaved);
    },
  });

  const updateConversationMutation = trpc.assistant.updateConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  const deleteConversationMutation = trpc.assistant.deleteConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
      toast.success(t.toastDeleted);
    },
  });

  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();
  const analyzeFileMutation = trpc.assistant.analyzeFile.useMutation();

  const togglePinMutation = trpc.assistant.togglePinConversation.useMutation({
    onSuccess: () => refetchConversations(),
    onError: () => toast.error(t.toastPinError),
  });

  const updateTagsMutation = trpc.assistant.updateConversationTags.useMutation({
    onSuccess: () => { refetchConversations(); setTagMenuConvId(null); },
    onError: () => toast.error(t.toastTagError),
  });

  // Lead notification mutation
  const notifyLeadMutation = trpc.contact.notifyLead.useMutation();

  // Detect serious interest in the assistant response
  const detectAndNotifyLead = (responseText: string, convId?: number) => {
    const LEAD_KEYWORDS = [
      "دورة", "تسجيل", "اشتراك", "سعر", "تكلفة", "كيف ألتحق", "كيف أسجل",
      "inscription", "formation", "tarif", "prix", "comment s'inscrire",
    ];
    const lower = responseText.toLowerCase();
    const isLead = LEAD_KEYWORDS.some(kw => lower.includes(kw));
    if (isLead) {
      notifyLeadMutation.mutate({
        userName: "مستخدم مهتم",
        specialty: selectedSubject || undefined,
        interest: selectedSubject ? `دورة ذكاء اصطناعي — ${selectedSubject}` : "دورة تدريبية",
        conversationId: convId,
      });
    }
  };

  // State for loading a specific conversation
  const [loadingConvId, setLoadingConvId] = useState<number | null>(null);
  const { data: loadedConvData, isFetching: isLoadingConv } = trpc.assistant.getConversation.useQuery(
    { id: loadingConvId! },
    { enabled: loadingConvId !== null }
  );

  // Apply loaded conversation data when fetch completes
  useEffect(() => {
    if (!isLoadingConv && loadedConvData && loadingConvId !== null) {
      const msgs = Array.isArray(loadedConvData.messages) ? loadedConvData.messages : [];
      setMessages(msgs as Message[]);
      setCurrentConversationId(loadedConvData.id);
      setConversationTitle(loadedConvData.title);
      setAttachedFiles([]);
      setInput("");
      setLoadingConvId(null);
    }
  }, [isLoadingConv, loadedConvData, loadingConvId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Generate conversation title from first message
  const generateTitle = (firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 6).join(" ");
    return words.length > 50 ? words.substring(0, 50) + "..." : words;
  };

  // Save or update conversation
  const saveCurrentConversation = async (msgs: Message[]) => {
    if (msgs.length === 0) return;

    const title = (conversationTitle === t.newConversation || conversationTitle === "محادثة جديدة" || conversationTitle === "Nouvelle conversation" || conversationTitle === "New Conversation") 
      ? generateTitle(msgs[0].content)
      : conversationTitle;

    if (currentConversationId) {
      await updateConversationMutation.mutateAsync({
        id: currentConversationId,
        messages: msgs,
      });
    } else {
      const saved = await saveConversationMutation.mutateAsync({
        title,
        messages: msgs,
      });
      setConversationTitle(title);
      setCurrentConversationId(saved.id);
    }
  };

  // Persist subject/level/language to localStorage
  useEffect(() => {
    try { if (selectedSubject) localStorage.setItem('assistant_subject', selectedSubject); else localStorage.removeItem('assistant_subject'); } catch { /* ignore */ }
  }, [selectedSubject]);
  useEffect(() => {
    try { if (selectedLevel) localStorage.setItem('assistant_level', selectedLevel); else localStorage.removeItem('assistant_level'); } catch { /* ignore */ }
  }, [selectedLevel]);
  useEffect(() => {
    try { if (teachingLanguage) localStorage.setItem('assistant_teaching_language', teachingLanguage); else localStorage.removeItem('assistant_teaching_language'); } catch { /* ignore */ }
  }, [teachingLanguage]);
  // Inline rename helpers
  const startRenaming = (conv: { id: number; title: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingConvTitle(conv.title);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };
  const commitRename = async () => {
    if (editingConvId === null) return;
    const trimmed = editingConvTitle.trim();
    if (trimmed) {
      await updateConversationMutation.mutateAsync({ id: editingConvId, title: trimmed, messages: [] });
      if (currentConversationId === editingConvId) setConversationTitle(trimmed);
    }
    setEditingConvId(null);
  };
  // Group conversations by date (pinned first, then by date)
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const pinned: typeof conversations = [];
    const today: typeof conversations = [];
    const yesterday: typeof conversations = [];
    const thisWeek: typeof conversations = [];
    const older: typeof conversations = [];
    conversations.forEach((conv) => {
      if (conv.isPinned) { pinned.push(conv); return; }
      const d = new Date(conv.lastMessageAt);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) today.push(conv);
      else if (diffDays === 1) yesterday.push(conv);
      else if (diffDays < 7) thisWeek.push(conv);
      else older.push(conv);
    });
    return { pinned, today, yesterday, thisWeek, older };
  }, [conversations]);
  // Load conversation - fetch full data including messages from server
  const loadConversation = (conv: { id: number; title: string }) => {
    setConversationTitle(conv.title);
    setLoadingConvId(conv.id);
  };

  // Welcome message helper
  const buildWelcomeMessage = (): Message => ({
    role: "assistant",
    timestamp: Date.now(),
    content: t.welcomeMessage,
  });

  // Start new conversation
  const startNewConversation = () => {
    setMessages([buildWelcomeMessage()]);
    setCurrentConversationId(null);
    setConversationTitle(t.newConversation);
    setAttachedFiles([]);
    setInput("");
    setSelectedSubject(null);
    setSelectedLevel(null);
    setTeachingLanguage(null);
  };

  // Delete conversation
  const deleteConversation = async (id: number) => {
    if (confirm(t.deleteConfirm)) {
      await deleteConversationMutation.mutateAsync({ id });
      if (currentConversationId === id) {
        startNewConversation();
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const newFiles: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} ${t.toastFileTooLarge}`);
        continue;
      }

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
          setAttachedFiles(prev => 
            prev.map(f => f.name === file.name ? { ...f, preview } : f)
          );
        };
        reader.readAsDataURL(file);
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attached file
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} ${t.toastFileTooLarge}`);
        continue;
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
          setAttachedFiles(prev => prev.map(f => f.name === file.name ? { ...f, preview } : f));
        };
        reader.readAsDataURL(file);
      }
      newFiles.push({ name: file.name, size: file.size, type: file.type, file });
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  }, [t]);

  // Copy message content
  const copyMessageContent = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t.toastCopied);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(t.toastCopied);
    }
  }, [t]);

  // Export single message as PDF
  const exportSingleMessagePDF = useCallback(async (content: string) => {
    toast.info(t.toastExportingMsg);
    try {
      await exportCleanPDFMutation.mutateAsync({
        title: conversationTitle,
        messages: [{ role: "assistant" as const, content, timestamp: Date.now() }],
        createdAt: new Date().toISOString(),
        subject: selectedSubject || undefined,
        level: selectedLevel || undefined,
        language: teachingLanguage || undefined,
      });
    } catch { /* handled by mutation */ }
  }, [conversationTitle, selectedSubject, selectedLevel, teachingLanguage, t]);

  // Export single message as Word
  const exportSingleMessageWord = useCallback(async (content: string) => {
    toast.info(t.toastExportingMsg);
    try {
      await exportCleanWordMutation.mutateAsync({
        title: conversationTitle,
        messages: [{ role: "assistant" as const, content, timestamp: Date.now() }],
        createdAt: new Date().toISOString(),
        subject: selectedSubject || undefined,
        level: selectedLevel || undefined,
        language: teachingLanguage || undefined,
      });
    } catch { /* handled by mutation */ }
  }, [conversationTitle, selectedSubject, selectedLevel, teachingLanguage, t]);

  const generateSummaryCard = useCallback(async (content: string) => {
    setSummaryCardLoading(true);
    setSummaryCardOpen(true);
    try {
      const summaryPrompt = `بناءً على الجذاذة التالية:\n\n${content}\n\n---\n\nأنشئ بطاقة تلخيص للتلميذ بهذا الهيكل الصارم:\n\n[اسم الدرس] | [المادة] | [المستوى]\n\nأتعلم: [المفهوم الأساسي - جملة واحدة فقط]\n\nأتذكر:\n• نقطة 1 (لا تتجاوز 6 كلمات)\n• نقطة 2 (لا تتجاوز 6 كلمات)\n• نقطة 3 (لا تتجاوز 6 كلمات)\n\nمثال: [مثال واحد + حل واحد في سطرين فقط]\n\nأتحقق: [سؤال قصير + الجواب في سطر واحد]\n\n[قيود صارمة مطلقة]:\n- الحد الأقصى: 80 كلمة إجمالاً (ليس 150)\n- أتذكر: 3 نقاط فقط — كل نقطة لا تتجاوز 6 كلمات\n- مثال: مثال واحد + حل واحد في سطرين فقط\n- أتحقق: سؤال + جواب في سطر واحد\n- ممنوع استخدام أي رموز ┌─├─└│ — نص عادي فقط\n- لا تطلب أي معلومات إضافية`;

      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: summaryPrompt },
          ],
          subject: selectedSubject,
          level: selectedLevel,
          teachingLanguage: teachingLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary card");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) fullContent += data.content;
            } catch {}
          }
        }
      }

      setSummaryCardContent(fullContent);
    } catch (error) {
      console.error("Summary card error:", error);
      toast.error("خطأ في إنشاء بطاقة التلخيص");
      setSummaryCardOpen(false);
    } finally {
      setSummaryCardLoading(false);
    }
  }, [selectedSubject, selectedLevel, teachingLanguage]);

  // Regenerate last assistant response
  const regenerateLastResponse = useCallback(() => {
    if (isLoading) return;
    // Find the last user message
    const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === "user");
    if (lastUserMsgIndex === -1) return;
    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    // Remove all messages after the last user message
    const trimmedMessages = messages.slice(0, actualIndex + 1);
    setMessages(trimmedMessages);
    sendStreamingMessage(trimmedMessages, {
      subject: selectedSubject || undefined,
      level: selectedLevel || undefined,
      teachingLanguage: teachingLanguage || undefined,
    });
  }, [messages, isLoading, selectedSubject, selectedLevel, teachingLanguage, sendStreamingMessage]);

  // Send message with file analysis
  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    setIsLoading(true);

    try {
      // Upload and analyze files
      const uploadedFiles: AttachedFile[] = [];
      let analyzedText = "";
      
      for (const attachedFile of attachedFiles) {
        const fileToUpload = attachedFile.file;
        if (!fileToUpload) continue;

        // Convert to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });

        // Upload to S3
        const uploadResult = await uploadFileMutation.mutateAsync({
          base64Data,
          fileName: attachedFile.name,
          mimeType: attachedFile.type,
        });

      const fileWithUrl: AttachedFile = {
        name: attachedFile.name,
        size: attachedFile.size,
        type: attachedFile.type,
        url: uploadResult.url,
      };
      uploadedFiles.push(fileWithUrl);

        // Analyze file if it's PDF or image
        if (attachedFile.type === "application/pdf" || attachedFile.type.startsWith("image/")) {
          try {
            const analysis = await analyzeFileMutation.mutateAsync({
              fileUrl: uploadResult.url,
              mimeType: attachedFile.type,
            });
            analyzedText += `\n\n${t.fileContentLabel(attachedFile.name)}\n${analysis.text}\n`;
          } catch (error) {
            console.error("Error analyzing file:", error);
            toast.error(`${t.toastFileAnalyzeError}: ${attachedFile.name}`);
          }
        }
      }

      // Combine user input with analyzed text
      const fullContent = input.trim() + analyzedText;

      // Filter files to ensure they have URLs
      const validAttachments = uploadedFiles.filter(f => f.url !== undefined).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url!,
      }));

      const userMessage: Message = {
        role: "user",
        content: fullContent,
        attachments: validAttachments.length > 0 ? validAttachments : undefined,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setAttachedFiles([]);

      await sendStreamingMessage(newMessages, {
        subject: selectedSubject || undefined,
        level: selectedLevel || undefined,
        teachingLanguage: teachingLanguage || undefined,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(t.toastUploadError);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exportPDFMutation = trpc.assistant.exportConversationAsPDF.useMutation({
    onSuccess: (data) => {
      // Download the file
      window.open(data.url, "_blank");
      toast.success(t.toastExportSuccess);
    },
    onError: () => {
      toast.error(t.toastExportError);
    },
  });

  const exportWordMutation = trpc.assistant.exportConversationAsWord.useMutation({
    onSuccess: (data) => {
      // Download the file
      window.open(data.url, "_blank");
      toast.success(t.toastExportSuccess);
    },
    onError: () => {
      toast.error(t.toastExportError);
    },
  });

  const exportCleanPDFMutation = trpc.assistant.exportCleanNotePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success(t.toastCleanSuccess);
    },
    onError: (err) => {
      console.error("PDF export error:", err);
      toast.error(t.toastCleanPdfError + ": " + (err?.message || ""));
    },
  });
  const exportCleanWordMutation = trpc.assistant.exportCleanNoteWord.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success(t.toastCleanSuccess);
    },
    onError: (err) => {
      console.error("Word export error:", err);
      toast.error(t.toastCleanWordError + ": " + (err?.message || ""));
    },
  });

  const hasAssistantMessage = messages.some((m) => m.role === "assistant");
  const [summaryCardOpen, setSummaryCardOpen] = useState(false);
  const [summaryCardContent, setSummaryCardContent] = useState("");
  const [summaryCardLoading, setSummaryCardLoading] = useState(false);

  // Leader Studio state
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<'mindmap' | 'quiz' | 'pptx' | null>(null);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioContent, setStudioContent] = useState("");
  const [mindmapSvg, setMindmapSvg] = useState("");
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const exportCleanAsPDF = () => {
    if (!hasAssistantMessage) return;
    setExportModalFormat("pdf");
    setExportModalOpen(true);
  };

  const exportCleanAsWord = () => {
    if (!hasAssistantMessage) return;
    setExportModalFormat("word");
    setExportModalOpen(true);
  };

  const handleExportConfirm = async (meta: ExportMetadata) => {
    toast.info(t.toastCreatingClean);
    const payload = {
      title: conversationTitle,
      messages,
      createdAt: new Date().toISOString(),
      subject: selectedSubject || undefined,
      level: selectedLevel || undefined,
      language: teachingLanguage || undefined,
      schoolName: meta.schoolName || undefined,
      teacherName: meta.teacherName || undefined,
      exportDate: meta.exportDate || undefined,
      schoolLogoUrl: meta.schoolLogoUrl || undefined,
    };
    if (exportModalFormat === "pdf") {
      await exportCleanPDFMutation.mutateAsync(payload);
    } else {
      await exportCleanWordMutation.mutateAsync(payload);
    }
    setExportModalOpen(false);
  };

  // Export conversation as PDF
  const exportAsPDF = async () => {
    if (messages.length === 0) return;
    
    toast.info(t.toastExporting);
    await exportPDFMutation.mutateAsync({
      title: conversationTitle,
      messages,
      createdAt: new Date().toISOString(),
    });
  };

  // Export conversation as Word
  const exportAsWord = async () => {
    if (messages.length === 0) return;
    
    toast.info(t.toastExporting);
    await exportWordMutation.mutateAsync({
      title: conversationTitle,
      messages,
      createdAt: new Date().toISOString(),
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Detect text direction: returns 'rtl' for Arabic/Hebrew, 'ltr' for Latin
  const detectDirection = (text: string): 'rtl' | 'ltr' => {
    // Check first meaningful character (skip spaces, numbers, punctuation)
    const stripped = text.replace(/[\s\d.,;:!?'"()\[\]{}\-\/\\@#$%^&*_+=<>~`|]/g, '');
    if (!stripped) return 'rtl'; // default to RTL for empty
    const firstChar = stripped.codePointAt(0) || 0;
    // Arabic: 0600-06FF, 0750-077F, 08A0-08FF, FB50-FDFF, FE70-FEFF
    // Hebrew: 0590-05FF
    const isRTL = (firstChar >= 0x0600 && firstChar <= 0x06FF) ||
                  (firstChar >= 0x0750 && firstChar <= 0x077F) ||
                  (firstChar >= 0x08A0 && firstChar <= 0x08FF) ||
                  (firstChar >= 0xFB50 && firstChar <= 0xFDFF) ||
                  (firstChar >= 0xFE70 && firstChar <= 0xFEFF) ||
                  (firstChar >= 0x0590 && firstChar <= 0x05FF);
    return isRTL ? 'rtl' : 'ltr';
  };

  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t.dateToday;
    if (days === 1) return t.dateYesterday;
    if (days < 7) return t.dateDaysAgo(days);
    const localeMap: Record<string, string> = { ar: 'ar-TN', fr: 'fr-TN', en: 'en-US' };
    return date.toLocaleDateString(localeMap[globalLanguage] || 'ar-TN');
  };

  // Show loading spinner while permissions are loading
  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">{t.loadingText}</p>
        </div>
      </div>
    );
  }

  // Show locked state for non-subscribers (admin always has access)
  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <LockedFeature requiredService="accessEdugpt" featureName={t.welcomeTitle}>
          <div />
        </LockedFeature>
      </div>
    );
  }

  return (
    <>
    <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Sidebar - on mobile it overlays, on desktop it pushes */}
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"}
        fixed md:relative inset-y-0 end-0 z-40 md:z-auto
        transition-all duration-300 border-s border-gray-200 bg-white flex flex-col overflow-hidden shrink-0
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{t.sidebarTitle}</h2>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={startNewConversation}
            >
              <Plus className="h-4 w-4 ms-1" />
              {t.newBtn}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute end-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pe-10"
            />
          </div>
          {/* Tag filter chips */}
          <div className="mt-3 flex flex-wrap gap-1">
            <button
              onClick={() => setFilterTag(null)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                filterTag === null
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t.tagAll}
            </button>
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setFilterTag(filterTag === tag.value ? null : tag.value)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  filterTag === tag.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : `${tag.color} hover:opacity-80`
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.noConversations}</p>
              </div>
            )}
            {([
              { label: `📌 ${t.datePinned}`, items: groupedConversations.pinned, isPinnedGroup: true },
              { label: t.dateToday, items: groupedConversations.today, isPinnedGroup: false },
              { label: t.dateYesterday, items: groupedConversations.yesterday, isPinnedGroup: false },
              { label: t.dateDaysAgo(7), items: groupedConversations.thisWeek, isPinnedGroup: false },
              { label: t.dateOlder, items: groupedConversations.older, isPinnedGroup: false },
            ] as { label: string; items: typeof conversations; isPinnedGroup: boolean }[]).map(({ label, items, isPinnedGroup }) =>
              items.length > 0 ? (
                <div key={label}>
                  <p className={`text-xs font-semibold px-2 pt-3 pb-1 uppercase tracking-wide ${
                    isPinnedGroup ? "text-amber-500" : "text-gray-400"
                  }`}>{label}</p>
                  {items.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group ${
                        currentConversationId === conv.id ? "bg-blue-50 border border-blue-200" : ""
                      } ${loadingConvId === conv.id ? "opacity-60" : ""} ${
                        conv.isPinned ? "border-e-2 border-e-amber-400" : ""
                      }`}
                      onClick={() => editingConvId !== conv.id && loadConversation(conv)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            {editingConvId === conv.id ? (
                              <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  ref={renameInputRef}
                                  value={editingConvTitle}
                                  onChange={(e) => setEditingConvTitle(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingConvId(null); }}
                                  onBlur={commitRename}
                                  className="flex-1 text-sm border border-blue-300 rounded px-1 py-0.5 outline-none bg-white"
                                />
                                <button onClick={commitRename} className="text-green-600 hover:text-green-700">
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <h3
                                className="font-medium text-sm truncate"
                                onDoubleClick={(e) => startRenaming(conv, e)}
                                title="انقر مرتين لتغيير الاسم"
                              >{conv.title}</h3>
                            )}
                          </div>
                          {/* Tags badges */}
                          {Array.isArray(conv.tags) && conv.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(conv.tags as string[]).map((tag) => {
                                const tagDef = PREDEFINED_TAGS.find((td) => td.value === tag);
                                return (
                                  <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full border ${tagDef?.color ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{formatDate(conv.lastMessageAt)}</p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Tag menu button */}
                          <div className="relative">
                            <Button
                              size="sm" variant="ghost" className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); setTagMenuConvId(tagMenuConvId === conv.id ? null : conv.id); }}
                              title={t.tagAdd || "إضافة وسم"}
                            >
                              <span className="text-xs font-bold text-gray-500">#</span>
                            </Button>
                            {tagMenuConvId === conv.id && (
                              <div
                                className="absolute start-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-40"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-xs font-semibold text-gray-500 mb-1.5 px-1">{t.tagChoose || "اختر وسماً"}</p>
                                {PREDEFINED_TAGS.map((tag) => {
                                  const currentTags: string[] = Array.isArray(conv.tags) ? (conv.tags as string[]) : [];
                                  const isSelected = currentTags.includes(tag.value);
                                  return (
                                    <button
                                      key={tag.value}
                                      className={`w-full text-end text-xs px-2 py-1 rounded flex items-center justify-between gap-1 hover:bg-gray-50 ${
                                        isSelected ? "font-semibold" : ""
                                      }`}
                                      onClick={() => {
                                        const newTags = isSelected
                                          ? currentTags.filter((tg) => tg !== tag.value)
                                          : [...currentTags, tag.value];
                                        updateTagsMutation.mutate({ id: conv.id, tags: newTags });
                                      }}
                                    >
                                      <span>{tag.label}</span>
                                      {isSelected && <Check className="h-3 w-3 text-blue-600 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm" variant="ghost" className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); togglePinMutation.mutate({ id: conv.id, isPinned: !conv.isPinned }); }}
                            title={conv.isPinned ? t.unpinTitle : t.pinTitle}
                          >
                            {conv.isPinned
                              ? <PinOff className="h-3.5 w-3.5 text-amber-500" />
                              : <Pin className="h-3.5 w-3.5 text-gray-500" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => startRenaming(conv, e)} title={t.renameTitle}>
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} title={t.deleteTitle}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900">{t.dropZoneText}</p>
              <p className="text-sm text-gray-500 mt-1">{t.dropZoneSubtext}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 flex flex-col gap-1.5 shrink-0">
          {/* Row 1: nav + title + action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Nav buttons */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/")}
              title="العودة إلى الصفحة الرئيسية"
              className="text-gray-600 hover:text-blue-600 shrink-0 h-8 w-8 p-0"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0 h-8 w-8 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Title - truncated on mobile */}
            <h1 className="flex-1 min-w-0 text-sm sm:text-lg font-bold text-gray-900 truncate">
              {conversationTitle}
            </h1>
            {/* Action buttons - always visible but compact */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Open EDUGPT Button */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1 font-medium h-8 px-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                onClick={() => window.open('https://chatgpt.com/g/g-6992396d1e7481919c778aeaa4efae98-edugpt', '_blank')}
                title="فتح EDUGPT المخصص"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">EDUGPT</span>
              </Button>
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1 font-medium h-8 px-2">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-sm">
                      {globalLanguage === "fr" ? "🇫🇷" : globalLanguage === "en" ? "🇬🇧" : "🇹🇳"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {[
                    { code: "ar" as const, label: "العربية", flag: "🇹🇳", teaching: null },
                    { code: "fr" as const, label: "Français", flag: "🇫🇷", teaching: "french" as const },
                    { code: "en" as const, label: "English", flag: "🇬🇧", teaching: "english" as const },
                  ].map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setTeachingLanguage(lang.teaching);
                      }}
                      className={`gap-2 cursor-pointer ${globalLanguage === lang.code ? "bg-primary/10 font-semibold" : ""}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {globalLanguage === lang.code && <span className="me-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Export dropdown - all export buttons in one menu on mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 px-2 gap-1" disabled={messages.length === 0}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">{t.exportBtn}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={exportAsPDF} disabled={messages.length === 0}>
                    <Download className="h-4 w-4 ms-2" />
                    {t.exportPdfFull}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsWord} disabled={messages.length === 0}>
                    <Download className="h-4 w-4 ms-2" />
                    {t.exportWordFull}
                  </DropdownMenuItem>
                  {hasAssistantMessage && (
                    <>
                      <div className="border-t my-1" />
                      <DropdownMenuItem onClick={exportCleanAsPDF} disabled={exportCleanPDFMutation.isPending}>
                        {exportCleanPDFMutation.isPending ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Download className="h-4 w-4 ms-2" />}
                        {t.exportPdfClean}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportCleanAsWord} disabled={exportCleanWordMutation.isPending}>
                        {exportCleanWordMutation.isPending ? <Loader2 className="h-4 w-4 ms-2 animate-spin" /> : <Download className="h-4 w-4 ms-2" />}
                        {t.exportWordClean}
                      </DropdownMenuItem>
                      <div className="border-t my-1" />
                      <DropdownMenuItem onClick={() => setShowPrintPreview(true)}>
                        <FileText className="h-4 w-4 ms-2" />
                        {t.exportPrintPreview}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Row 2: context badge */}
          <div className="flex items-center">
            {selectedSubject && selectedLevel ? (
              <button
                onClick={() => setShowContextSelector(true)}
                className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 hover:bg-blue-100 transition-colors max-w-full overflow-hidden"
              >
                <span className="truncate">📚 {selectedSubject}</span>
                <span className="text-blue-400 shrink-0">|</span>
                <span className="truncate">🎓 {selectedLevel}</span>
                {teachingLanguage && (
                  <><span className="text-blue-400 shrink-0">|</span>
                  <span className="shrink-0">{teachingLanguage === "french" ? "🇫🇷" : teachingLanguage === "english" ? "🇬🇧" : "🇹🇳"}</span></>
                )}
                <span className="text-blue-400 me-1 shrink-0">• {t.changeContext}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowContextSelector(true)}
                className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5 hover:bg-orange-100 transition-colors animate-pulse"
              >
                <span>{t.setContext}</span>
              </button>
            )}
          </div>
        </div>

        {/* Context Selector Modal */}
        {showContextSelector && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => {
            if (selectedSubject && selectedLevel) setShowContextSelector(false);
          }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative flex items-start p-5 border-b shrink-0">
                <div className="flex-1 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{t.modalTitle}</h2>
                  <p className="text-sm text-gray-500">{t.modalSubtitle}</p>
                </div>
                <button
                  onClick={() => setShowContextSelector(false)}
                  className="absolute top-4 start-4 rounded-full p-1.5 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                {/* المادة الدراسية */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.subjectLabel}</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedSubject(s);
                          if (SUBJECT_LANGUAGE_MAP[s]) {
                            setTeachingLanguage(SUBJECT_LANGUAGE_MAP[s]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          selectedSubject === s
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* المستوى الدراسي */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.levelLabel}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map(l => (
                      <button
                        key={l}
                        onClick={() => setSelectedLevel(l)}
                        className={`px-3 py-2 rounded-lg text-sm border text-end transition-all ${
                          selectedLevel === l
                            ? "bg-green-600 text-white border-green-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* لغة التدريس (اختياري) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.langLabel}</label>
                  <div className="flex gap-2">
                    {([
                      { value: "arabic", label: "🇹🇳 عربية", desc: "المواد بالعربية" },
                      { value: "french", label: "🇫🇷 Français", desc: "Matières en français" },
                      { value: "english", label: "🇬🇧 English", desc: "English subjects" },
                    ] as const).map(lang => (
                      <button
                        key={lang.value}
                        onClick={() => setTeachingLanguage(teachingLanguage === lang.value ? null : lang.value)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all text-center ${
                          teachingLanguage === lang.value
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:text-purple-600"
                        }`}
                      >
                        <div className="font-medium">{lang.label}</div>
                        <div className="text-xs opacity-75 mt-0.5">{lang.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with confirm button */}
              <div className="p-5 border-t shrink-0">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedSubject || !selectedLevel}
                  onClick={() => setShowContextSelector(false)}
                >
                  {selectedSubject && selectedLevel
                    ? t.confirmBtn(selectedSubject, selectedLevel, teachingLanguage === "french" ? t.teachLangFr : teachingLanguage === "english" ? t.teachLangEn : teachingLanguage === "arabic" ? t.teachLangAr : null)
                    : t.selectFirst}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-blue-100 p-6 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.welcomeTitle}</h2>
              {!selectedSubject || !selectedLevel ? (
                <>
                  <p className="text-gray-600 mb-4 max-w-md">
                    {t.welcomeNoContext}
                  </p>
                  <Button
                    onClick={() => setShowContextSelector(true)}
                    className="bg-blue-600 hover:bg-blue-700 mb-6 gap-2"
                  >
                    {t.selectContextBtn}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-2 max-w-md">
                    {t.readyMsg(selectedSubject!, selectedLevel!)} <strong>{selectedSubject}</strong> — <strong>{selectedLevel}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {t.expertDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-2xl">
                    {t.suggestions.map((s, i) => (
                      <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput(s.prompt)}>
                        <p className="text-sm font-medium">{s.label}</p>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        

          {messages.map((message, index) => {
            const msgDir = detectDirection(message.content);
            const isUser = message.role === "user";
            const isRTL = msgDir === 'rtl';
            return (
              <>
                <div
                  key={index}
                  className={`flex items-end gap-2 ${isUser ? (isRTL ? 'justify-start flex-row' : 'justify-start flex-row-reverse') : (isRTL ? 'justify-end flex-row-reverse' : 'justify-end flex-row')}`}
                >
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isUser ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {isUser ? '👤' : '🤖'}
                </div>
                <Card className={`max-w-[85vw] sm:max-w-3xl p-3 sm:p-4 chat-bubble overflow-hidden ${
                  isUser 
                    ? "bg-white border-gray-200" 
                    : "bg-blue-600 text-white border-blue-600"
                }`} dir="auto">
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {message.attachments.map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center gap-2 text-sm" dir="auto">
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                          <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none" dir="auto" style={{ textAlign: 'start' }}>
                    <Streamdown>{message.content}</Streamdown>
                  </div>
                  {/* Timestamp + Inline Actions */}
                  <div className={`flex items-center gap-2 mt-2 ${isUser ? '' : ''}`} dir="ltr">
                    <span className={`text-xs opacity-50 ${isUser ? '' : 'text-blue-100'}`}>
                      {new Date(message.timestamp).toLocaleTimeString(globalLanguage === 'fr' ? 'fr-TN' : globalLanguage === 'en' ? 'en-US' : 'ar-TN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <div className="flex items-center gap-0.5 ms-auto">
                        <button
                          onClick={() => copyMessageContent(message.content)}
                          className="p-1 rounded hover:bg-white/20 transition-colors text-blue-100 hover:text-white"
                          title={t.copyBtn}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleMessagePDF(message.content)}
                          className="p-1 rounded hover:bg-white/20 transition-colors text-blue-100 hover:text-white"
                          title={t.downloadPdfBtn}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleMessageWord(message.content)}
                          className="p-1 rounded hover:bg-white/20 transition-colors text-blue-100 hover:text-white text-[10px] font-bold"
                          title={t.downloadWordBtn}
                        >
                          W
                        </button>
                        {index === messages.length - 1 && (
                          <>
                            <button
                              onClick={() => generateSummaryCard(message.content)}
                              className="p-1 rounded hover:bg-white/20 transition-colors text-blue-100 hover:text-white"
                              title="بطاقة تلخيص التلميذ"
                              disabled={isLoading}
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={regenerateLastResponse}
                              className="p-1 rounded hover:bg-white/20 transition-colors text-blue-100 hover:text-white"
                              title={t.regenerateBtn}
                              disabled={isLoading}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              </>
            );
          })}

          {/* Leader Studio - Show after streaming completes */}
          {messages.length > 0 && 
           messages[messages.length - 1]?.role === "assistant" && 
           !isLoading &&
           (messages[messages.length - 1]?.content?.length || 0) > 0 && (
            <div className="mt-4">
              <LeaderStudio
                lessonContent={messages[messages.length - 1]?.content || ""}
                selectedSubject={selectedSubject}
                selectedLevel={selectedLevel}
                teachingLanguage={teachingLanguage}
              />
            </div>
          )}

          {/* Summary Card Modal */}
          <Dialog open={summaryCardOpen} onOpenChange={setSummaryCardOpen}>
            <DialogContent className="w-[420px] h-[90vh] overflow-hidden flex flex-col" dir="rtl">
              <DialogHeader>
                <DialogTitle>بطاقة تلخيص التلميذ</DialogTitle>
              </DialogHeader>
              {summaryCardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    style={{
                      border: "2px solid #1D9E75",
                      borderRadius: "12px",
                      overflow: "hidden",
                      fontFamily: "Arial, sans-serif",
                      direction: "rtl",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  >
                    {/* Green header with lesson info */}
                    <div style={{background:"#1D9E75",color:"white",padding:"10px 14px",fontWeight:"bold",fontSize:"13px",textAlign:"center"}}>
                      {selectedLevel && selectedSubject ? `${selectedLevel} | ${selectedSubject}` : "بطاقة تلخيص"}
                    </div>
                    {/* Render the summary card with HTML parsing */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: summaryCardContent
                          .replace(/أتعلم:/g, '<div style="padding:10px 14px;border-bottom:1px solid #E1F5EE;background:#F8FFFC"><span style="color:#1D9E75;font-weight:bold">أتعلم: </span>')
                          .replace(/أتذكر:/g, '</div><div style="padding:10px 14px;border-bottom:1px solid #E1F5EE;"><div style="color:#1D9E75;font-weight:bold;margin-bottom:6px">أتذكر:</div>')
                          .replace(/مثال:/g, '</div><div style="padding:10px 14px;border-bottom:1px solid #E1F5EE;background:#F8FFFC"><span style="color:#1D9E75;font-weight:bold">مثال: </span>')
                          .replace(/أتحقق:/g, '</div><div style="padding:10px 14px;"><span style="color:#1D9E75;font-weight:bold">أتحقق: </span>')
                          .replace(/\n/g, '<br/>')
                          .replace(/• /g, '<div style="margin:4px 0">• </div>') +
                          '</div><div style="background:#1D9E75;color:white;padding:6px 14px;font-size:11px;text-align:center">Leader Academy</div>',
                      }}
                    />
                  </div>
                  <DialogFooter className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(summaryCardContent);
                        toast.success("تم نسخ البطاقة");
                      }}
                      className="px-4 py-2 bg-[#1D9E75] text-white rounded hover:bg-[#0d7a5c] transition-colors flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      نسخ
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      طباعة
                    </button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {isLoading && !streamingContent && (
            <div className="flex items-end gap-2 justify-end flex-row-reverse">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                🤖
              </div>
              <Card className="max-w-[85vw] sm:max-w-3xl p-3 sm:p-4 bg-blue-600 text-white border-blue-600 chat-bubble" dir="auto">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.typing}</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="border-t border-gray-100 bg-gradient-to-l from-blue-50 to-white px-2 sm:px-4 pt-2 pb-0 shrink-0">
          <div className="quick-actions-bar">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickLessonPlanPrompt); }}
              disabled={isLoading}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t.quickLessonPlan}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickExamPrompt); }}
              disabled={isLoading}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              {t.quickExam}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickDramaPrompt); }}
              disabled={isLoading}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.quickDrama}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickAnnualPlanPrompt); }}
              disabled={isLoading}
            >
              <Calendar className="h-3.5 w-3.5" />
              {t.quickAnnualPlan}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickExercisesPrompt); }}
              disabled={isLoading}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              {t.quickExercises}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-pink-200 text-pink-700 hover:bg-pink-100 hover:border-pink-400 rounded-full px-4 h-8 text-xs font-semibold"
              onClick={() => { setInput(t.quickImagePrompt); }}
              disabled={isLoading}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {t.quickImage}
            </Button>
          </div>
        </div>
        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-2 sm:p-4 shrink-0">
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 pe-3"
                >
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={`flex gap-2 items-end ${detectDirection(input) === 'ltr' ? 'flex-row' : 'flex-row-reverse'}`} dir="auto">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              className="bg-blue-600 hover:bg-blue-700 shrink-0 h-10 w-10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className={`h-4 w-4 ${detectDirection(input) === 'ltr' ? '' : 'rotate-180'}`} />
              )}
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              dir="auto"
              className="flex-1 min-h-[44px] max-h-[160px] resize-none text-sm chat-input-bidi"
              style={{ textAlign: 'start' }}
              disabled={isLoading}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="shrink-0 h-10 w-10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Export Metadata Modal */}
    <ExportMetadataModal
      open={exportModalOpen}
      onOpenChange={setExportModalOpen}
      format={exportModalFormat}
      onConfirm={handleExportConfirm}
      isLoading={exportCleanPDFMutation.isPending || exportCleanWordMutation.isPending}
      subject={selectedSubject}
      level={selectedLevel}
    />
    {showPrintPreview && hasAssistantMessage && (
      <PrintPreview
        content={messages.filter(m => m.role === "assistant").slice(-1)[0]?.content || ""}
        title={selectedSubject ? `جذاذة ${selectedSubject}` : "وثيقة تربوية"}
        subject={selectedSubject || ""}
        level={selectedLevel || ""}
        type="lesson"
        studentName={false}
        onClose={() => setShowPrintPreview(false)}
      />
    )}
    </>
  );
}
