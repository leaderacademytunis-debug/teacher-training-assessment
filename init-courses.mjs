import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, text, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
    "primary_teachers",
    "arabic_teachers", 
    "science_teachers",
    "french_teachers",
    "preschool_facilitators",
    "special_needs_companions",
    "digital_teacher_ai"
  ]).notNull(),
  duration: int("duration"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

const coursesData = [
  {
    titleAr: "تأهيل مدرّسي الابتدائي",
    descriptionAr: "برنامج تدريبي شامل لتطوير مهارات معلمي المرحلة الابتدائية في أساليب التدريس الحديثة وإدارة الصف",
    category: "primary_teachers",
    duration: 40,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "تأهيل مدرّسي العربية",
    descriptionAr: "دورة متخصصة في تدريس اللغة العربية بطرق تفاعلية وتعزيز مهارات القراءة والكتابة لدى الطلاب",
    category: "arabic_teachers",
    duration: 35,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "تأهيل مدرّسي العلوم",
    descriptionAr: "برنامج تدريبي لتطوير مهارات تدريس العلوم باستخدام التجارب العملية والأساليب التفاعلية",
    category: "science_teachers",
    duration: 45,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "تأهيل مدرّسي الفرنسية (مع الذكاء الاصطناعي)",
    descriptionAr: "دورة حديثة لتدريس اللغة الفرنسية باستخدام أدوات الذكاء الاصطناعي والتقنيات التعليمية المتقدمة",
    category: "french_teachers",
    duration: 50,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "تأهيل منشّطي التحضيري",
    descriptionAr: "برنامج متخصص لتأهيل منشطي مرحلة التحضيري في أساليب التعليم المبكر وتنمية مهارات الأطفال",
    category: "preschool_facilitators",
    duration: 30,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "تأهيل مرافقي التلاميذ ذوي الصعوبات",
    descriptionAr: "دورة تدريبية لمرافقي الطلاب ذوي الاحتياجات الخاصة وصعوبات التعلم وطرق دعمهم",
    category: "special_needs_companions",
    duration: 40,
    isActive: true,
    createdBy: 1
  },
  {
    titleAr: "المعلم الرقمي والذكاء الاصطناعي",
    descriptionAr: "برنامج شامل لتدريب المعلمين على استخدام التكنولوجيا الرقمية والذكاء الاصطناعي في التعليم",
    category: "digital_teacher_ai",
    duration: 55,
    isActive: true,
    createdBy: 1
  }
];

async function initCourses() {
  try {
    console.log("Initializing courses...");
    
    for (const course of coursesData) {
      await db.insert(courses).values(course);
      console.log(`Created: ${course.titleAr}`);
    }
    
    console.log("\nAll courses created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

initCourses();
