/**
 * Tunisian Pedagogical Glossary (قاموس المصطلحات البيداغوجية التونسية)
 * 
 * This glossary serves as the "Secret Sauce" for OCR error correction.
 * It maps common OCR misreadings to correct Tunisian pedagogical terms,
 * and provides a comprehensive dictionary of educational terminology
 * used in the Tunisian Ministry of Education system.
 */

// ===== CORE PEDAGOGICAL TERMS =====
export interface GlossaryTerm {
  term: string;           // Correct term
  category: string;       // Category for grouping
  definition: string;     // Brief definition
  aliases: string[];      // Common variations/misspellings OCR might produce
  french?: string;        // French equivalent
  relatedTerms?: string[];// Related terms for context matching
}

export const TUNISIAN_GLOSSARY: GlossaryTerm[] = [
  // ===== المعايير والتقييم (Criteria & Assessment) =====
  {
    term: "معيار",
    category: "تقييم",
    definition: "مقياس لتقييم مدى تحقق الكفاية",
    aliases: ["معبار", "معیار", "مغيار", "معيا ر", "مع يار", "معبر"],
    french: "Critère",
    relatedTerms: ["مع1", "مع2", "مع3", "كفاية", "مؤشر"],
  },
  {
    term: "مع1",
    category: "تقييم",
    definition: "المعيار الأول - الربط والاختيار والتحديد البسيط",
    aliases: ["مع 1", "م ع 1", "مع١", "معيار 1", "M1"],
    french: "Critère 1",
    relatedTerms: ["معيار", "تقييم", "إسناد الأعداد"],
  },
  {
    term: "مع2",
    category: "تقييم",
    definition: "المعيار الثاني - التطبيق والتوظيف في وضعيات بسيطة",
    aliases: ["مع 2", "م ع 2", "مع٢", "معيار 2", "M2"],
    french: "Critère 2",
    relatedTerms: ["معيار", "تقييم", "إسناد الأعداد"],
  },
  {
    term: "مع3",
    category: "تقييم",
    definition: "المعيار الثالث - الإصلاح والتبرير والتميز",
    aliases: ["مع 3", "م ع 3", "مع٣", "معيار 3", "M3"],
    french: "Critère 3",
    relatedTerms: ["معيار", "تقييم", "إسناد الأعداد"],
  },
  {
    term: "كفاية",
    category: "تقييم",
    definition: "القدرة على توظيف المعارف والمهارات لحل وضعيات مركبة",
    aliases: ["كفایة", "كفاي ة", "كفائة", "كفاءة", "كفايه"],
    french: "Compétence",
    relatedTerms: ["معيار", "مؤشر", "هدف"],
  },
  {
    term: "مؤشر",
    category: "تقييم",
    definition: "علامة قابلة للملاحظة تدل على تحقق المعيار",
    aliases: ["مؤشّر", "مؤ شر", "موشر", "مأشر"],
    french: "Indicateur",
    relatedTerms: ["معيار", "كفاية"],
  },
  {
    term: "إسناد الأعداد",
    category: "تقييم",
    definition: "جدول توزيع الدرجات حسب المعايير",
    aliases: ["اسناد الاعداد", "إسناد الأعداد", "اسناد الأعداد", "جدول الأعداد", "جدول إسناد"],
    french: "Barème de notation",
    relatedTerms: ["معيار", "مع1", "مع2", "مع3"],
  },
  {
    term: "جدول إسناد الأعداد",
    category: "تقييم",
    definition: "الجدول الرسمي لتوزيع الدرجات في نهاية الاختبار",
    aliases: ["جدول اسناد الاعداد", "جدول الاسناد", "سلم التنقيط"],
    french: "Grille de notation",
    relatedTerms: ["إسناد الأعداد", "+++", "++", "+", "0"],
  },
  {
    term: "تفقد",
    category: "تقييم",
    definition: "زيارة المتفقد البيداغوجي للمعلم (لا نستعمل تفتيش في تونس)",
    aliases: ["تفقّد", "تفقد بيداغوجي", "زيارة التفقد"],
    french: "Inspection pédagogique",
    relatedTerms: ["متفقد", "تقرير التفقد"],
  },

  // ===== الوثائق البيداغوجية (Pedagogical Documents) =====
  {
    term: "جذاذة",
    category: "وثائق",
    definition: "بطاقة تخطيط الدرس التفصيلية",
    aliases: ["جذادة", "جداذة", "جذاذه", "جداده", "جدادة", "جذّاذة"],
    french: "Fiche de préparation",
    relatedTerms: ["درس", "حصة", "مذكرة"],
  },
  {
    term: "مذكرة يومية",
    category: "وثائق",
    definition: "الدفتر اليومي لتسجيل الأنشطة التعليمية",
    aliases: ["مذكره يوميه", "المذكرة اليومية", "الدفتر اليومي"],
    french: "Journal de classe",
    relatedTerms: ["جذاذة", "توزيع"],
  },
  {
    term: "سند",
    category: "وثائق",
    definition: "الوضعية القصصية المحفزة في الاختبار أو الدرس",
    aliases: ["سنّد", "سن د", "السند", "سندّ"],
    french: "Support / Contexte",
    relatedTerms: ["تعليمة", "وضعية"],
  },
  {
    term: "تعليمة",
    category: "وثائق",
    definition: "السؤال الإجرائي المحدد المرتبط بالسند",
    aliases: ["تعليمه", "تعلیمة", "التعليمة", "تعليم ة"],
    french: "Consigne",
    relatedTerms: ["سند", "وضعية", "معيار"],
  },
  {
    term: "مخطط سنوي",
    category: "وثائق",
    definition: "التوزيع السنوي للدروس والوحدات حسب البرنامج الرسمي",
    aliases: ["مخطط سنوى", "المخطط السنوي", "توزيع سنوي", "التوزيع السنوي"],
    french: "Plan annuel",
    relatedTerms: ["توزيع", "برنامج", "وحدة"],
  },
  {
    term: "دفتر الأعداد",
    category: "وثائق",
    definition: "السجل الرسمي لدرجات التلاميذ",
    aliases: ["دفتر الاعداد", "سجل الأعداد", "كراس الأعداد"],
    french: "Registre de notes",
    relatedTerms: ["إسناد الأعداد", "تقييم"],
  },

  // ===== المنهج والبرنامج (Curriculum) =====
  {
    term: "البرامج الرسمية",
    category: "منهج",
    definition: "المناهج المعتمدة من وزارة التربية التونسية",
    aliases: ["البرامج الرسميه", "البرنامج الرسمي", "المنهج الرسمي"],
    french: "Programmes officiels",
    relatedTerms: ["وزارة التربية", "مخطط سنوي"],
  },
  {
    term: "وحدة تعلمية",
    category: "منهج",
    definition: "مجموعة دروس مترابطة تشكل وحدة متكاملة",
    aliases: ["وحده تعلميه", "وحدة تعلّمية", "الوحدة التعلمية"],
    french: "Unité d'apprentissage",
    relatedTerms: ["درس", "حصة", "مخطط"],
  },
  {
    term: "ثلاثي",
    category: "منهج",
    definition: "فترة دراسية (الثلاثي الأول، الثاني، الثالث)",
    aliases: ["ثلاثى", "الثلاثي", "ثلاثي أول", "ثلاثي ثاني", "ثلاثي ثالث"],
    french: "Trimestre",
    relatedTerms: ["فترة", "امتحان", "تقييم"],
  },
  {
    term: "فترة",
    category: "منهج",
    definition: "تقسيم زمني داخل الثلاثي",
    aliases: ["فتره", "الفترة"],
    french: "Période",
    relatedTerms: ["ثلاثي", "وحدة"],
  },

  // ===== الأنشطة التعليمية (Teaching Activities) =====
  {
    term: "وضعية مشكلة",
    category: "أنشطة",
    definition: "نشاط تعليمي يطرح مشكلة حقيقية للتلميذ لحلها",
    aliases: ["وضعيه مشكله", "وضعية مشكل", "وضعية-مشكلة"],
    french: "Situation problème",
    relatedTerms: ["استكشاف", "بناء", "تقييم"],
  },
  {
    term: "إيقاظ علمي",
    category: "أنشطة",
    definition: "مادة العلوم في التعليم الابتدائي التونسي",
    aliases: ["ايقاظ علمي", "إيقاظ علمى", "الإيقاظ العلمي"],
    french: "Éveil scientifique",
    relatedTerms: ["علوم", "تجربة", "ملاحظة"],
  },
  {
    term: "تعبير كتابي",
    category: "أنشطة",
    definition: "نشاط إنتاج كتابي في مادة اللغة العربية",
    aliases: ["تعبير كتابى", "إنتاج كتابي", "انتاج كتابي"],
    french: "Expression écrite",
    relatedTerms: ["لغة عربية", "إنشاء"],
  },
  {
    term: "قراءة",
    category: "أنشطة",
    definition: "نشاط القراءة والفهم",
    aliases: ["قراءه", "القراءة"],
    french: "Lecture",
    relatedTerms: ["فهم", "نص", "سند"],
  },
  {
    term: "حساب ذهني",
    category: "أنشطة",
    definition: "نشاط الحساب الذهني في الرياضيات",
    aliases: ["حساب ذهنى", "الحساب الذهني"],
    french: "Calcul mental",
    relatedTerms: ["رياضيات", "عمليات"],
  },
  {
    term: "خط",
    category: "أنشطة",
    definition: "نشاط الخط والكتابة",
    aliases: ["خطّ"],
    french: "Écriture / Calligraphie",
    relatedTerms: ["كتابة", "نسخ"],
  },

  // ===== المراحل الدراسية (Education Levels) =====
  {
    term: "السنة الأولى ابتدائي",
    category: "مراحل",
    definition: "المستوى الأول من التعليم الابتدائي",
    aliases: ["سنة أولى", "سنة 1", "س1", "1 ابتدائي", "أولى ابتدائي"],
    french: "1ère année primaire",
    relatedTerms: ["ابتدائي", "تحضيري"],
  },
  {
    term: "السنة الثانية ابتدائي",
    category: "مراحل",
    definition: "المستوى الثاني من التعليم الابتدائي",
    aliases: ["سنة ثانية", "سنة 2", "س2", "2 ابتدائي", "ثانية ابتدائي"],
    french: "2ème année primaire",
    relatedTerms: ["ابتدائي"],
  },
  {
    term: "السنة الثالثة ابتدائي",
    category: "مراحل",
    definition: "المستوى الثالث من التعليم الابتدائي",
    aliases: ["سنة ثالثة", "سنة 3", "س3", "3 ابتدائي", "ثالثة ابتدائي"],
    french: "3ème année primaire",
    relatedTerms: ["ابتدائي"],
  },
  {
    term: "السنة الرابعة ابتدائي",
    category: "مراحل",
    definition: "المستوى الرابع من التعليم الابتدائي",
    aliases: ["سنة رابعة", "سنة 4", "س4", "4 ابتدائي", "رابعة ابتدائي"],
    french: "4ème année primaire",
    relatedTerms: ["ابتدائي"],
  },
  {
    term: "السنة الخامسة ابتدائي",
    category: "مراحل",
    definition: "المستوى الخامس من التعليم الابتدائي",
    aliases: ["سنة خامسة", "سنة 5", "س5", "5 ابتدائي", "خامسة ابتدائي"],
    french: "5ème année primaire",
    relatedTerms: ["ابتدائي", "مناظرة السيزيام"],
  },
  {
    term: "السنة السادسة ابتدائي",
    category: "مراحل",
    definition: "المستوى السادس من التعليم الابتدائي",
    aliases: ["سنة سادسة", "سنة 6", "س6", "6 ابتدائي", "سادسة ابتدائي"],
    french: "6ème année primaire",
    relatedTerms: ["ابتدائي", "مناظرة السيزيام"],
  },

  // ===== المواد الدراسية (Subjects) =====
  {
    term: "الرياضيات",
    category: "مواد",
    definition: "مادة الرياضيات",
    aliases: ["رياضيات", "الرياضيّات", "حساب"],
    french: "Mathématiques",
    relatedTerms: ["أعداد", "هندسة", "قياس"],
  },
  {
    term: "اللغة العربية",
    category: "مواد",
    definition: "مادة اللغة العربية",
    aliases: ["لغة عربية", "عربية", "اللغة العربيّة"],
    french: "Langue arabe",
    relatedTerms: ["قراءة", "كتابة", "قواعد لغة"],
  },
  {
    term: "اللغة الفرنسية",
    category: "مواد",
    definition: "مادة اللغة الفرنسية",
    aliases: ["لغة فرنسية", "فرنسية", "الفرنسيّة"],
    french: "Langue française",
    relatedTerms: ["lecture", "écriture", "grammaire"],
  },
  {
    term: "التربية الإسلامية",
    category: "مواد",
    definition: "مادة التربية الإسلامية",
    aliases: ["تربية إسلامية", "تربيه اسلاميه", "التربية الاسلامية"],
    french: "Éducation islamique",
    relatedTerms: ["قرآن", "حديث", "سيرة"],
  },
  {
    term: "التربية المدنية",
    category: "مواد",
    definition: "مادة التربية المدنية",
    aliases: ["تربية مدنية", "تربيه مدنيه", "التربية المدنيّة"],
    french: "Éducation civique",
    relatedTerms: ["مواطنة", "حقوق", "واجبات"],
  },
  {
    term: "التربية التشكيلية",
    category: "مواد",
    definition: "مادة الفنون التشكيلية",
    aliases: ["تربية تشكيلية", "تربيه تشكيليه", "فنون"],
    french: "Arts plastiques",
    relatedTerms: ["رسم", "تلوين", "إبداع"],
  },
  {
    term: "التربية البدنية",
    category: "مواد",
    definition: "مادة التربية البدنية والرياضية",
    aliases: ["تربية بدنية", "رياضة", "التربية البدنيّة"],
    french: "Éducation physique",
    relatedTerms: ["رياضة", "حركة"],
  },
  {
    term: "التربية الموسيقية",
    category: "مواد",
    definition: "مادة التربية الموسيقية",
    aliases: ["تربية موسيقية", "موسيقى", "التربية الموسيقيّة"],
    french: "Éducation musicale",
    relatedTerms: ["أنشودة", "إيقاع"],
  },
  {
    term: "التربية التكنولوجية",
    category: "مواد",
    definition: "مادة التربية التكنولوجية",
    aliases: ["تربية تكنولوجية", "تكنولوجيا", "التربية التكنولوجيّة"],
    french: "Éducation technologique",
    relatedTerms: ["تقنية", "إعلامية"],
  },

  // ===== مصطلحات الرياضيات (Math Terms) =====
  {
    term: "الأعداد ذات 5 أرقام",
    category: "رياضيات",
    definition: "الأعداد من 10000 إلى 99999",
    aliases: ["أعداد ذات 5 أرقام", "الاعداد ذات 5 ارقام", "أعداد من 5 أرقام"],
    french: "Nombres à 5 chiffres",
    relatedTerms: ["عدد", "رقم", "منزلة"],
  },
  {
    term: "الكسور",
    category: "رياضيات",
    definition: "الأعداد الكسرية",
    aliases: ["كسور", "الكسور العادية", "كسر"],
    french: "Fractions",
    relatedTerms: ["بسط", "مقام", "كسر عشري"],
  },
  {
    term: "الأشكال الهندسية",
    category: "رياضيات",
    definition: "المربع، المستطيل، المثلث، الدائرة...",
    aliases: ["أشكال هندسية", "الاشكال الهندسية", "هندسة"],
    french: "Formes géométriques",
    relatedTerms: ["مربع", "مستطيل", "مثلث", "دائرة"],
  },
  {
    term: "القياس",
    category: "رياضيات",
    definition: "قياس الأطوال والمساحات والكتل والسعات",
    aliases: ["قياس", "وحدات القياس"],
    french: "Mesures",
    relatedTerms: ["طول", "مساحة", "كتلة", "سعة"],
  },

  // ===== مصطلحات الإيقاظ العلمي (Science Terms) =====
  {
    term: "الحواس الخمس",
    category: "إيقاظ علمي",
    definition: "البصر، السمع، الشم، الذوق، اللمس",
    aliases: ["حواس خمس", "الحواس", "5 حواس"],
    french: "Les cinq sens",
    relatedTerms: ["بصر", "سمع", "شم", "ذوق", "لمس"],
  },
  {
    term: "الجهاز التنفسي",
    category: "إيقاظ علمي",
    definition: "أعضاء التنفس: الأنف، القصبة الهوائية، الرئتان",
    aliases: ["جهاز تنفسي", "التنفس", "الجهاز التنفّسي"],
    french: "Appareil respiratoire",
    relatedTerms: ["رئة", "تنفس", "هواء"],
  },
  {
    term: "الجهاز الهضمي",
    category: "إيقاظ علمي",
    definition: "أعضاء الهضم: الفم، المريء، المعدة، الأمعاء",
    aliases: ["جهاز هضمي", "الهضم", "الجهاز الهضمى"],
    french: "Appareil digestif",
    relatedTerms: ["معدة", "هضم", "غذاء"],
  },
  {
    term: "النبات",
    category: "إيقاظ علمي",
    definition: "دراسة النباتات ونموها",
    aliases: ["نبات", "النباتات"],
    french: "La plante",
    relatedTerms: ["جذر", "ساق", "ورقة", "زهرة"],
  },
  {
    term: "الماء",
    category: "إيقاظ علمي",
    definition: "خصائص الماء وحالاته",
    aliases: ["ماء"],
    french: "L'eau",
    relatedTerms: ["سائل", "صلب", "غاز", "تبخر"],
  },

  // ===== مصطلحات بيداغوجية عامة (General Pedagogical Terms) =====
  {
    term: "هدف تعلمي",
    category: "بيداغوجيا",
    definition: "ما يُنتظر أن يكتسبه المتعلم في نهاية الحصة",
    aliases: ["هدف تعلّمي", "هدف تعلمى", "الهدف التعلمي", "أهداف تعلمية"],
    french: "Objectif d'apprentissage",
    relatedTerms: ["كفاية", "مؤشر"],
  },
  {
    term: "بيداغوجيا الفارقية",
    category: "بيداغوجيا",
    definition: "تكييف التعليم حسب الفروق الفردية بين المتعلمين",
    aliases: ["بيداغوجيا فارقية", "البيداغوجيا الفارقية", "تعليم فارقي"],
    french: "Pédagogie différenciée",
    relatedTerms: ["فروق فردية", "مستويات"],
  },
  {
    term: "بيداغوجيا المشروع",
    category: "بيداغوجيا",
    definition: "منهج تعليمي قائم على إنجاز مشاريع",
    aliases: ["بيداغوجيا مشروع", "مشروع قسم"],
    french: "Pédagogie de projet",
    relatedTerms: ["مشروع", "إنجاز"],
  },
  {
    term: "تقييم تشخيصي",
    category: "بيداغوجيا",
    definition: "تقييم في بداية الوحدة لتحديد مستوى المتعلمين",
    aliases: ["تقييم تشخيصى", "التقييم التشخيصي"],
    french: "Évaluation diagnostique",
    relatedTerms: ["تقييم", "تشخيص"],
  },
  {
    term: "تقييم تكويني",
    category: "بيداغوجيا",
    definition: "تقييم أثناء التعلم لتعديل المسار",
    aliases: ["تقييم تكوينى", "التقييم التكويني"],
    french: "Évaluation formative",
    relatedTerms: ["تقييم", "علاج"],
  },
  {
    term: "تقييم إجمالي",
    category: "بيداغوجيا",
    definition: "تقييم في نهاية الوحدة أو الثلاثي",
    aliases: ["تقييم إجمالى", "التقييم الإجمالي", "تقييم ختامي"],
    french: "Évaluation sommative",
    relatedTerms: ["تقييم", "امتحان", "اختبار"],
  },
  {
    term: "علاج بيداغوجي",
    category: "بيداغوجيا",
    definition: "أنشطة لمعالجة صعوبات التعلم المكتشفة",
    aliases: ["علاج بيداغوجى", "العلاج البيداغوجي", "دعم وعلاج"],
    french: "Remédiation pédagogique",
    relatedTerms: ["دعم", "صعوبات", "تقييم تكويني"],
  },
  {
    term: "تملك",
    category: "بيداغوجيا",
    definition: "مستوى اكتساب الكفاية (+++, ++, +, 0)",
    aliases: ["تملّك", "مستوى التملك", "درجة التملك"],
    french: "Maîtrise",
    relatedTerms: ["معيار", "كفاية", "إسناد الأعداد"],
  },
  {
    term: "حصة",
    category: "بيداغوجيا",
    definition: "وحدة زمنية للتدريس (45 دقيقة عادة)",
    aliases: ["حصّة", "الحصة"],
    french: "Séance",
    relatedTerms: ["درس", "جذاذة"],
  },
  {
    term: "مسار تعلمي",
    category: "بيداغوجيا",
    definition: "تسلسل الأنشطة التعليمية في الحصة",
    aliases: ["مسار تعلّمي", "المسار التعلمي"],
    french: "Parcours d'apprentissage",
    relatedTerms: ["حصة", "أنشطة"],
  },
];

// ===== OCR CORRECTION MAP =====
// Quick lookup: misspelling -> correct term
export function buildCorrectionMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of TUNISIAN_GLOSSARY) {
    for (const alias of entry.aliases) {
      const normalized = alias.trim().replace(/\s+/g, " ");
      if (normalized !== entry.term) {
        map.set(normalized, entry.term);
      }
    }
  }
  return map;
}

// ===== OCR POST-PROCESSING =====
export function correctOCRText(text: string): { correctedText: string; corrections: Array<{ original: string; corrected: string; position: number }> } {
  const correctionMap = buildCorrectionMap();
  const corrections: Array<{ original: string; corrected: string; position: number }> = [];
  let correctedText = text;

  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Array.from(correctionMap.entries()).sort((a, b) => b[0].length - a[0].length);

  for (const [misspelling, correct] of sortedEntries) {
    let searchFrom = 0;
    while (true) {
      const idx = correctedText.indexOf(misspelling, searchFrom);
      if (idx === -1) break;
      corrections.push({ original: misspelling, corrected: correct, position: idx });
      correctedText = correctedText.substring(0, idx) + correct + correctedText.substring(idx + misspelling.length);
      searchFrom = idx + correct.length;
    }
  }

  return { correctedText, corrections };
}

// ===== GLOSSARY CONTEXT FOR LLM =====
// Generate a compact glossary string to inject into OCR/formatting prompts
export function getGlossaryContext(): string {
  const categories = new Map<string, GlossaryTerm[]>();
  for (const term of TUNISIAN_GLOSSARY) {
    const list = categories.get(term.category) || [];
    list.push(term);
    categories.set(term.category, list);
  }

  let context = "📚 قاموس المصطلحات البيداغوجية التونسية الرسمية:\n";
  for (const [cat, terms] of Array.from(categories.entries())) {
    context += `\n【${cat}】\n`;
    for (const t of terms) {
      context += `• ${t.term}`;
      if (t.french) context += ` (${t.french})`;
      context += `: ${t.definition}\n`;
    }
  }
  context += "\n⚠️ تنبيه: استخدم دائماً 'تفقد' بدل 'تفتيش' في السياق التونسي.\n";
  context += "⚠️ المعايير: مع1 (ربط/اختيار)، مع2 (تطبيق/توظيف)، مع3 (إصلاح/تبرير/تميز).\n";
  return context;
}

// ===== KEYWORD EXTRACTION FOR COMPETENCY MATCHING =====
export function extractPedagogicalKeywords(text: string): string[] {
  const keywords: string[] = [];
  for (const entry of TUNISIAN_GLOSSARY) {
    if (text.includes(entry.term)) {
      keywords.push(entry.term);
    }
    // Also check aliases that appear in text
    for (const alias of entry.aliases) {
      if (text.includes(alias) && !keywords.includes(entry.term)) {
        keywords.push(entry.term);
        break;
      }
    }
  }
  return keywords;
}
