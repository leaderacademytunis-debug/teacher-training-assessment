/**
 * Configuration des contenus personnalisés pour chaque type de certificat
 */

export interface CertificateContent {
  language: 'ar' | 'fr' | 'en';
  title: string;
  subtitle: string;
  mainText: string;
  axes: string[];
}

export const CERTIFICATE_CONTENTS: Record<string, CertificateContent> = {
  // 1. تأهيل مدرسي العربية
  'تأهيل مدرّسي العربية': {
    language: 'ar',
    title: 'شهادة',
    subtitle: 'أُسندت هذه الشهادة إلى السيد(ة):',
    mainText: 'للمشاركة الفاعلة في دورة تكوينية بعنوان: "تأهيل مدرس ابتدائي في تدريس اللغة العربية"',
    axes: [
      'التعلمية التعليمية: المفاهيم الأساسية',
      'جذاذات التنشيط: القراءة، التواصل الشفوي، الإنتاج الكتابي، قواعد اللغة، المحفوظات',
      'التقييم وبناء الاختبارات'
    ]
  },

  // 2. تأهيل مدرسي العلوم
  'تأهيل مدرّسي العلوم': {
    language: 'ar',
    title: 'شهادة',
    subtitle: 'أُسندت هذه الشهادة إلى السيد(ة):',
    mainText: 'للمشاركة الفاعلة في دورة تكوينية بعنوان: "تأهيل مدرس ابتدائي في تدريس العلوم"',
    axes: [
      'إنماء التفكير العلمي، تعلمية الرياضيات، تعلمية الإيقاظ العلمي، منهجية حل المسائل وبناء المشاريع العلمية',
      'صعوبات المجال العلمي وسبل تجاوزها، تقييم الكفاية الرياضية والمكتسبات الفيزيائية ومفاهيم علم الأحياء'
    ]
  },

  // 3. تأهيل مدرسي الفرنسية
  'تأهيل مدرّسي الفرنسية': {
    language: 'fr',
    title: 'CERTIFICAT DE PARTICIPATION',
    subtitle: 'CE CERTIFICAT A ÉTÉ CONFIÉ A',
    mainText: 'Pour sa participation à la formation : «Formation pour Enseignants du FLE (Français Langue Étrangère)»',
    axes: [
      'La préparation matérielle, mentale et écrite d\'un leçon',
      'L\'élaboration de scénarios pédagogiques (mise en train/ phonétique/ activité d\'écoute/ communication orale/ lecture compréhension/ lecture fonctionnement/fonctionnement de la langue : grammaire, conjugaison, orthographe/la production écrite)',
      'Les situations d\'apprentissage. L\'élaboration de l\'objectif de la séance',
      'Les critères de réussite et leurs indicateurs. La répartition journalière',
      'L\'élaboration de consignes (chatgpt). Les jeux de lecture'
    ]
  },

  // 4. تأهيل مرافقي التلاميذ ذوي الصعوبات
  'تأهيل مرافقي التلاميذ ذوي الصعوبات': {
    language: 'ar',
    title: 'شهادة',
    subtitle: 'أُسندت هذه الشهادة إلى السيد(ة):',
    mainText: 'للمشاركة الفاعلة في دورة تكوينية بعنوان: "المرافق التربوي للتلميذ ذوي اضطرابات وصعوبات التعلم"',
    axes: [
      'المصطلحات والمفاهيم المتصلة بصعوبات التعلم واضطرابات التعلم وبطء التعلم والتأخر الدراسي',
      'اضطرابات التعلم النمائية والأكاديمية (القدرات العامة والإنجاز الفعلي، اضطرابات فرط الحركة وقلة الانتباه، عسر القراءة، عسر الكتابة، عسر الحساب...)',
      'التدخلات البيداغوجية الملائمة لمرافقة ذوي صعوبات التعلم (رصد صعوبات التعلم، تصنيفها، والبحث عن مصادرها وبناء جهاز علاجي مناسب لها)'
    ]
  },

  // 5. تأهيل منشطي التحضيري
  'تأهيل منشطي التحضيري': {
    language: 'ar',
    title: 'شهادة',
    subtitle: 'أُسندت هذه الشهادة إلى السيد(ة):',
    mainText: 'للمشاركة الفاعلة في دورة تكوينية بعنوان: "منهاج السنة التحضيرية وطرق تنشيط الأطفال في سن ما قبل الدراسة"',
    axes: [
      'التخطيط للعمل باعتماد منهاج السنة التحضيرية، المقاربة بالمشروع في خدمة التعلمات',
      'المهارات الحياتية بالسنة التحضيرية، أنشطة السنة التحضيرية من التصور إلى الإنجاز، مراحل نمو الطفل من ثلاثة إلى خمس سنوات'
    ]
  },

  // 6. الشهادة التجميعية - تأهيل أصحاب الشهادات العليا
  'تأهيل أصحاب الشهادات العليا': {
    language: 'ar',
    title: 'شهادة',
    subtitle: 'أُسندت هذه الشهادة إلى السيد(ة):',
    mainText: 'للمشاركة الفاعلة في دورة تكوينية بعنوان: "تأهيل أصحاب الشهادات العليا للتدريس في المدارس الابتدائية الخاصة"',
    axes: [
      'تأهيل مدرسي ومنشطي سنوات التحضيري',
      'تأهيل مدرسي الاختصاص في العلوم',
      'تأهيل مدرسي الاختصاص في اللغة العربية',
      'تأهيل مدرسي ومرافقي التلاميذ ذوي اضطرابات وصعوبات التعلم',
      'المعلم الرقمي: توظيف التقنيات الحديثة والذكاء الاصطناعي في التدريس'
    ]
  }
};

/**
 * Get certificate content by course title
 */
export function getCertificateContent(courseTitle: string): CertificateContent | null {
  return CERTIFICATE_CONTENTS[courseTitle] || null;
}

/**
 * Check if a course title has custom certificate content
 */
export function hasCertificateContent(courseTitle: string): boolean {
  return courseTitle in CERTIFICATE_CONTENTS;
}
