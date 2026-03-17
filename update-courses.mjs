// Script to update existing courses with new fields and add bundle program
// Run with: node update-courses.mjs

const courses = [
  {
    id: 1,
    titleAr: "تأهيل مدرّسي الابتدائي",
    descriptionShortAr: "دورة شاملة تغطي التخطيط البيداغوجي وقراءة المناهج وإدارة الفصل وتعليمية المواد الأساسية",
    descriptionAr: "دورة تأهيلية شاملة لأصحاب الشهادات العليا الراغبين في التدريس بالمدارس الابتدائية الخاصة. تغطي الدورة 7 محاور أساسية من التخطيط البيداغوجي إلى تعليمية اللغة العربية والرياضيات والعلوم والمهارات الحياتية والوثائق البيداغوجية.",
    duration: 16,
    price: 150,
    originalPrice: 200,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-primary-jaWHj2aNhWRLcwyhK7g4PC.webp",
    axes: JSON.stringify([
      "التخطيط البيداغوجي",
      "قراءة وتحليل المناهج الرسمية",
      "ملامح المدرس المحترف وإدارة الفصل",
      "تعليمية اللغة العربية",
      "تعليمية الرياضيات والعلوم",
      "المهارات الحياتية",
      "الوثائق البيداغوجية وكيفية توظيفها"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 1
  },
  {
    id: 2,
    titleAr: "تأهيل مدرّسي العربية",
    descriptionShortAr: "إتقان ديداكتيك القراءة والتعبير وقواعد اللغة وإعداد وضعيات التعلم اللغوية",
    descriptionAr: "دورة متخصصة في تعليمية اللغة العربية تشمل ديداكتيك القراءة وفهم النصوص والتعبير الشفوي والكتابي وقواعد اللغة والصرف والإملاء وإعداد وضعيات تعلم لغوية وتقييم الكفاءات اللغوية ودعم المتعثرين.",
    duration: 16,
    price: 150,
    originalPrice: 200,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-arabic-LcskgwMQQ82Wg8A6PeXB3q.webp",
    axes: JSON.stringify([
      "ديداكتيك القراءة",
      "فهم النصوص وتحليلها",
      "التعبير الشفوي والكتابي",
      "قواعد اللغة والصرف والإملاء",
      "إعداد وضعيات تعلم لغوية",
      "تقييم الكفاءات اللغوية ودعم المتعثرين"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 2
  },
  {
    id: 3,
    titleAr: "تأهيل مدرّسي العلوم",
    descriptionShortAr: "تنمية التفكير العلمي وتعليمية الرياضيات والإيقاظ العلمي وبناء وضعيات تعلمية",
    descriptionAr: "دورة متكاملة في تعليمية العلوم والرياضيات تشمل تنمية التفكير العلمي وتعليمية الرياضيات والإيقاظ العلمي والمقاربة بالوضعيات وبناء وضعيات تعلمية وتقييم الكفاءات العلمية والرياضية وإعداد الوسائل التعليمية.",
    duration: 16,
    price: 150,
    originalPrice: 200,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-science-gE6Q2NVXPWeG4xZZHWcpqG.webp",
    axes: JSON.stringify([
      "تنمية التفكير العلمي",
      "تعليمية الرياضيات",
      "تعليمية الإيقاظ العلمي",
      "المقاربة بالوضعيات",
      "بناء وضعيات تعلمية",
      "تقييم الكفاءات العلمية والرياضية",
      "إعداد الوسائل التعليمية"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 3
  },
  {
    id: 4,
    titleAr: "تأهيل مدرّسي الفرنسية",
    descriptionShortAr: "إتقان الصوتيات والاستماع والتواصل والقراءة وصياغة الأهداف والمؤشرات",
    descriptionAr: "دورة تخصصية في تعليمية اللغة الفرنسية تشمل الصوتيات والاستماع والتواصل والقراءة وصياغة الأهداف والمؤشرات البيداغوجية.",
    duration: 12,
    price: 120,
    originalPrice: 160,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-french-3CxsYeKuboqHeDGrXdPhf2.webp",
    axes: JSON.stringify([
      "الصوتيات (Phonétique)",
      "الاستماع (Compréhension orale)",
      "التواصل (Communication)",
      "القراءة (Lecture)",
      "صياغة الأهداف والمؤشرات"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 4
  },
  {
    id: 5,
    titleAr: "تأهيل منشّطي التحضيري",
    descriptionShortAr: "منهاج التحضيري والمقاربة بالكفاءات ومراحل نمو الطفل وإعداد الأنشطة",
    descriptionAr: "دورة متخصصة في تأهيل منشطي التعليم التحضيري تشمل منهاج التحضيري والمقاربة بالكفاءات ومراحل نمو الطفل من 3 إلى 5 سنوات وإعداد الأنشطة من التصميم إلى الإنجاز والمهارات الحياتية للطفل والتقييم والمتابعة.",
    duration: 12,
    price: 120,
    originalPrice: 160,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-preschool-fqNwBMPZSa4hJ32UukV3Kw.webp",
    axes: JSON.stringify([
      "منهاج التحضيري",
      "المقاربة بالكفاءات",
      "مراحل نمو الطفل (3-5 سنوات)",
      "إعداد الأنشطة من التصميم إلى الإنجاز",
      "المهارات الحياتية للطفل",
      "التقييم والمتابعة"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 5
  },
  {
    id: 6,
    titleAr: "مرافقة التلاميذ ذوي صعوبات التعلّم",
    descriptionShortAr: "رصد وتشخيص صعوبات التعلّم وبناء برامج علاجية فردية وتدخلات بيداغوجية ملائمة",
    descriptionAr: "دورة متخصصة في مرافقة التلاميذ ذوي صعوبات التعلّم تشمل المفاهيم الأساسية لصعوبات واضطرابات التعلّم وفرط الحركة وتشتت الانتباه وصعوبات القراءة والكتابة والحساب والحس الحركي ورصد الصعوبات وتشخيصها والتدخلات البيداغوجية الملائمة وبناء برامج علاجية فردية.",
    duration: 12,
    price: 120,
    originalPrice: 160,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-special-needs-XmVJzivhXoRYEaVtnc2hz8.webp",
    axes: JSON.stringify([
      "المفاهيم الأساسية لصعوبات واضطرابات التعلّم",
      "فرط الحركة وتشتت الانتباه",
      "صعوبات القراءة – الكتابة – الحساب – الحس الحركي",
      "رصد الصعوبات وتشخيصها",
      "التدخلات البيداغوجية الملائمة",
      "بناء برامج علاجية فردية"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 6
  },
  {
    id: 7,
    titleAr: "المعلم الرقمي والذكاء الاصطناعي في التدريس",
    descriptionShortAr: "التحوّل الرقمي وأدوات Microsoft وGoogle وتصميم موارد رقمية وChatGPT في التعليم",
    descriptionAr: "دورة شاملة في التحوّل الرقمي والذكاء الاصطناعي في التدريس تشمل أدوات Microsoft وGoogle للمدرس وتصميم موارد رقمية تفاعلية وإعداد دروس واختبارات رقمية واستخدام ChatGPT في إعداد الدروس والتقييم والألعاب الرقمية التعليمية.",
    duration: 12,
    price: 120,
    originalPrice: 160,
    coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-digital-ai-6Pqg3XLhtcg7qCg7jY4nZh.webp",
    axes: JSON.stringify([
      "التحوّل الرقمي في التعليم",
      "أدوات Microsoft وGoogle للمدرس",
      "تصميم موارد رقمية تفاعلية",
      "إعداد دروس واختبارات رقمية",
      "ChatGPT في إعداد الدروس والتقييم",
      "الذكاء الاصطناعي في التعليم",
      "الألعاب الرقمية: Kahoot – Quizizz – Blooket",
      "إعداد ملفات تقييم رقمية للمتعلمين"
    ]),
    schedule: "كل أحد 9:00 - 13:00",
    isFeatured: true,
    sortOrder: 7
  }
];

// Bundle course
const bundle = {
  titleAr: "البرنامج الشامل: 7 دورات في دورة واحدة",
  descriptionShortAr: "برنامج تأهيلي متكامل يضم 7 دورات تدريبية مع 7 شهادات - وفّر 580 د.ت!",
  descriptionAr: "برنامج تأهيل أصحاب الشهادات العليا للتدريس في المدارس الابتدائية الخاصة. يضم 7 دورات متكاملة في دورة واحدة تمتد على 5 أشهر بمعدل 4 ساعات كل يوم أحد. يتحصل المشارك على 7 شهادات بعد اجتياز التقييم من خلال المنصة. الدورات: تأهيل مدرّسي الابتدائي، تعليمية العربية، تعليمية العلوم، تعليمية الفرنسية، تأهيل منشّطي التحضيري، مرافقة ذوي صعوبات التعلّم، المعلم الرقمي والذكاء الاصطناعي.",
  category: "bundle",
  duration: 80,
  price: 350,
  originalPrice: 930,
  coverImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/course-cover-bundle-QanmcCgw8EiVxC5M9eYkRD.webp",
  axes: JSON.stringify([
    "تأهيل مدرّسي الابتدائي (7 محاور)",
    "تأهيل مدرّسي العربية (6 محاور)",
    "تأهيل مدرّسي العلوم (7 محاور)",
    "تأهيل مدرّسي الفرنسية (5 محاور)",
    "تأهيل منشّطي التحضيري (6 محاور)",
    "مرافقة ذوي صعوبات التعلّم (6 محاور)",
    "المعلم الرقمي والذكاء الاصطناعي (8 محاور)"
  ]),
  bundleCourseIds: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
  isBundle: true,
  schedule: "كل أحد 9:00 - 13:00 | 5 أشهر",
  isFeatured: true,
  sortOrder: 0
};

// Generate SQL statements
console.log("-- Update existing 7 courses with new fields");
courses.forEach(c => {
  const sql = `UPDATE courses SET 
    descriptionShortAr = '${c.descriptionShortAr.replace(/'/g, "''")}',
    descriptionAr = '${c.descriptionAr.replace(/'/g, "''")}',
    duration = ${c.duration},
    price = ${c.price},
    originalPrice = ${c.originalPrice},
    coverImageUrl = '${c.coverImageUrl}',
    axes = '${c.axes.replace(/'/g, "''")}',
    schedule = '${c.schedule}',
    isFeatured = ${c.isFeatured ? 1 : 0},
    sortOrder = ${c.sortOrder},
    isBundle = 0
  WHERE id = ${c.id};`;
  console.log(sql);
  console.log("");
});

console.log("-- Insert bundle course");
const b = bundle;
const bundleSql = `INSERT INTO courses (titleAr, descriptionShortAr, descriptionAr, category, duration, price, originalPrice, coverImageUrl, axes, bundleCourseIds, isBundle, schedule, isFeatured, sortOrder, isActive, createdBy) VALUES (
  '${b.titleAr.replace(/'/g, "''")}',
  '${b.descriptionShortAr.replace(/'/g, "''")}',
  '${b.descriptionAr.replace(/'/g, "''")}',
  '${b.category}',
  ${b.duration},
  ${b.price},
  ${b.originalPrice},
  '${b.coverImageUrl}',
  '${b.axes.replace(/'/g, "''")}',
  '${b.bundleCourseIds}',
  1,
  '${b.schedule}',
  1,
  ${b.sortOrder},
  1,
  1
);`;
console.log(bundleSql);
