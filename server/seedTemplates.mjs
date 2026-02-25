import { drizzle } from "drizzle-orm/mysql2";
import { templates } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Predefined templates for different levels and subjects
const predefinedTemplates = [
  // Arabic Language - Primary
  {
    templateName: "درس قراءة - السنة الأولى ابتدائي",
    description: "قالب جاهز لدرس قراءة في السنة الأولى ابتدائي",
    educationLevel: "primary",
    grade: "السنة الأولى ابتدائي",
    subject: "اللغة العربية",
    language: "arabic",
    duration: 45,
    lessonObjectives: "- تعرف الحروف الهجائية\n- قراءة كلمات بسيطة\n- فهم معنى الكلمات المقروءة",
    materials: "- بطاقات الحروف\n- الكتاب المدرسي\n- السبورة والطباشير الملونة\n- صور توضيحية",
    introduction: "مراجعة الحروف المدروسة سابقاً من خلال لعبة تفاعلية. عرض الحرف الجديد بطريقة جذابة باستخدام صور وأمثلة من بيئة التلميذ.",
    mainActivities: [
      {
        title: "التعرف على الحرف",
        description: "عرض الحرف الجديد بأشكاله المختلفة (أول، وسط، آخر الكلمة). التدريب على نطقه الصحيح.",
        duration: 15
      },
      {
        title: "القراءة والفهم",
        description: "قراءة كلمات تحتوي على الحرف الجديد. شرح معاني الكلمات باستخدام الصور.",
        duration: 20
      },
      {
        title: "التطبيق",
        description: "تمارين كتابية وشفوية على الحرف. ألعاب تعليمية تفاعلية.",
        duration: 10
      }
    ],
    conclusion: "مراجعة سريعة للحرف المدروس. تقييم فهم التلاميذ من خلال أسئلة شفوية.",
    evaluation: "- ملاحظة مشاركة التلاميذ\n- تقييم القراءة الشفوية\n- تصحيح التمارين الكتابية",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  
  // French Language - Primary
  {
    templateName: "Leçon de lecture - 4ème année primaire",
    description: "Modèle prêt pour une leçon de lecture en français",
    educationLevel: "primary",
    grade: "4ème année primaire",
    subject: "Français",
    language: "french",
    duration: 45,
    lessonObjectives: "- Lire et comprendre un texte narratif\n- Identifier les personnages et les actions\n- Enrichir le vocabulaire",
    materials: "- Manuel scolaire\n- Tableau et marqueurs\n- Images illustratives\n- Fiches d'exercices",
    introduction: "Rappel de la leçon précédente. Présentation du thème du texte à travers des images. Motivation des élèves par des questions d'anticipation.",
    mainActivities: [
      {
        title: "Lecture magistrale",
        description: "L'enseignant lit le texte à haute voix avec expression. Les élèves suivent sur leurs livres.",
        duration: 10
      },
      {
        title: "Lecture individuelle et compréhension",
        description: "Les élèves lisent silencieusement puis à haute voix. Questions de compréhension sur le texte.",
        duration: 20
      },
      {
        title: "Exploitation du vocabulaire",
        description: "Explication des mots difficiles. Utilisation dans des phrases. Exercices d'application.",
        duration: 15
      }
    ],
    conclusion: "Résumé du texte par les élèves. Synthèse des points importants.",
    evaluation: "- Observation de la participation\n- Évaluation de la lecture à haute voix\n- Correction des exercices",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  
  // Mathematics - Primary
  {
    templateName: "درس رياضيات - العمليات الحسابية",
    description: "قالب لدرس العمليات الحسابية في الرياضيات",
    educationLevel: "primary",
    grade: "السنة الثالثة ابتدائي",
    subject: "الرياضيات",
    language: "arabic",
    duration: 45,
    lessonObjectives: "- فهم مفهوم العملية الحسابية\n- إجراء العمليات بشكل صحيح\n- حل مسائل تطبيقية",
    materials: "- الكتاب المدرسي\n- السبورة والطباشير\n- بطاقات الأعداد\n- مجسمات حسابية",
    introduction: "مراجعة المفاهيم السابقة. طرح مشكلة رياضية من الحياة اليومية لتحفيز التلاميذ.",
    mainActivities: [
      {
        title: "الفهم والاستكشاف",
        description: "شرح المفهوم الجديد باستخدام أمثلة محسوسة. استخدام المجسمات للتوضيح.",
        duration: 15
      },
      {
        title: "التطبيق الموجه",
        description: "حل تمارين مع التلاميذ خطوة بخطوة. التأكد من فهم الجميع.",
        duration: 15
      },
      {
        title: "التطبيق المستقل",
        description: "تمارين فردية للتلاميذ. المرور بين الصفوف لتقديم المساعدة.",
        duration: 15
      }
    ],
    conclusion: "مراجعة الخطوات الأساسية. حل تمرين جماعي على السبورة.",
    evaluation: "- ملاحظة المشاركة والفهم\n- تصحيح التمارين\n- تقييم تشخيصي سريع",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  
  // Science - Middle School
  {
    templateName: "درس علوم - الإعدادي",
    description: "قالب لدرس علوم في المرحلة الإعدادية",
    educationLevel: "middle",
    grade: "السنة السابعة أساسي",
    subject: "علوم الحياة والأرض",
    language: "arabic",
    duration: 55,
    lessonObjectives: "- فهم الظاهرة العلمية المدروسة\n- تطوير مهارات الملاحظة والتحليل\n- ربط المعرفة بالواقع",
    materials: "- الكتاب المدرسي\n- عينات أو نماذج\n- أدوات المخبر\n- عرض تقديمي أو فيديو",
    introduction: "طرح إشكالية علمية أو ظاهرة ملاحظة. استثارة فضول التلاميذ من خلال أسئلة استقصائية.",
    mainActivities: [
      {
        title: "الملاحظة والاستكشاف",
        description: "ملاحظة الظاهرة أو العينة. تسجيل الملاحظات الأولية.",
        duration: 15
      },
      {
        title: "التجربة والتحليل",
        description: "إجراء تجربة بسيطة أو دراسة حالة. تحليل النتائج ومناقشتها.",
        duration: 25
      },
      {
        title: "الاستنتاج والتطبيق",
        description: "استخلاص القوانين أو المفاهيم العلمية. تطبيقات في الحياة اليومية.",
        duration: 15
      }
    ],
    conclusion: "تلخيص المفاهيم الأساسية. ربط الدرس بالدروس السابقة والقادمة.",
    evaluation: "- تقييم الملاحظات والتحليل\n- مناقشة جماعية\n- تمارين تطبيقية",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  
  // History - Secondary
  {
    templateName: "درس تاريخ - الثانوي",
    description: "قالب لدرس تاريخ في المرحلة الثانوية",
    educationLevel: "secondary",
    grade: "السنة الأولى ثانوي",
    subject: "التاريخ",
    language: "arabic",
    duration: 55,
    lessonObjectives: "- فهم الحدث التاريخي وسياقه\n- تحليل الأسباب والنتائج\n- تطوير التفكير النقدي",
    materials: "- الكتاب المدرسي\n- خرائط تاريخية\n- وثائق ونصوص\n- عرض تقديمي",
    introduction: "تقديم الإطار الزمني والمكاني للحدث. ربط الدرس بالمعارف السابقة.",
    mainActivities: [
      {
        title: "عرض الحدث التاريخي",
        description: "سرد الأحداث الرئيسية. استخدام الخرائط والصور التوضيحية.",
        duration: 20
      },
      {
        title: "تحليل الوثائق",
        description: "دراسة نصوص تاريخية أو وثائق. استخراج المعلومات وتحليلها.",
        duration: 20
      },
      {
        title: "النقاش والتركيب",
        description: "مناقشة الأسباب والنتائج. ربط الحدث بالسياق العام.",
        duration: 15
      }
    ],
    conclusion: "تلخيص الدرس وإبراز أهميته. طرح أسئلة للتفكير.",
    evaluation: "- مشاركة في النقاش\n- تحليل الوثائق\n- تمرين كتابي",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  
  // English Language - Middle School
  {
    templateName: "English Lesson - Reading Comprehension",
    description: "Template for English reading lesson",
    educationLevel: "middle",
    grade: "8th grade",
    subject: "English",
    language: "english",
    duration: 55,
    lessonObjectives: "- Develop reading comprehension skills\n- Expand vocabulary\n- Practice critical thinking",
    materials: "- Textbook\n- Whiteboard and markers\n- Handouts\n- Audio/video materials",
    introduction: "Warm-up activity to activate prior knowledge. Introduction of the topic through pictures or questions.",
    mainActivities: [
      {
        title: "Pre-reading",
        description: "Prediction activities. Vocabulary pre-teaching. Setting reading purposes.",
        duration: 15
      },
      {
        title: "While-reading",
        description: "First reading for gist. Second reading for details. Comprehension questions.",
        duration: 25
      },
      {
        title: "Post-reading",
        description: "Discussion of main ideas. Vocabulary practice. Extension activities.",
        duration: 15
      }
    ],
    conclusion: "Summary of key points. Connection to students' lives or experiences.",
    evaluation: "- Observation of participation\n- Comprehension questions\n- Written exercises",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  }
];

async function seedTemplates() {
  try {
    console.log("Starting to seed templates...");
    
    for (const template of predefinedTemplates) {
      await db.insert(templates).values(template);
      console.log(`✓ Inserted template: ${template.templateName}`);
    }
    
    console.log(`\n✅ Successfully seeded ${predefinedTemplates.length} templates!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
