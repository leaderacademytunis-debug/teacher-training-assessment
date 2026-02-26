import { db } from "./db.ts";
import { referenceDocuments } from "../drizzle/schema.ts";

const guide = {
  title: "دليل البرامج الرسمية للتعليم الابتدائي في تونس",
  description: "الدليل الرسمي لوزارة التربية التونسية يحدد البرامج والمناهج الرسمية للمستويات الستة في التعليم الابتدائي (السنوات 1-6). يتضمن الأهداف التعليمية، المحتوى البيداغوجي، معايير التقييم، والتوجيهات المنهجية لجميع المواد (عربية، فرنسية، إنجليزية، رياضيات، علوم، تربية إسلامية، تاريخ، جغرافيا، فنون).",
  fileUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/BBXbpvboRyfWUydi.pdf",
  fileType: "application/pdf",
  language: "ar",
  level: "ابتدائي (جميع المستويات)",
  subject: "جميع المواد",
  uploadedBy: "admin"
};

async function main() {
  try {
    const result = await db.insert(referenceDocuments).values(guide);
    console.log("✅ تم إضافة الدليل الرسمي بنجاح:", result);
  } catch (error) {
    console.error("❌ خطأ في إضافة الدليل:", error);
  }
  process.exit(0);
}

main();
