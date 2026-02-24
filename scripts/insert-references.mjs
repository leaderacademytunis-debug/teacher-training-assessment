import { drizzle } from "drizzle-orm/mysql2";
import { referenceDocuments } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const references = [
  {
    uploadedBy: 1, // Admin user ID
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "اللغة العربية",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - اللغة العربية - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/gXwTVSIkELuJdlwT.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "التربية الفنية",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - التربية الفنية - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/itQAUUneueOZaozU.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "التربية الإسلامية",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - التربية الإسلامية - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/NTtzOeVdDhdVhHAl.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "التربية الموسيقية",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - التربية الموسيقية - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/qKbEunnCvOgcGzwx.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "الرياضيات",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - الرياضيات - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/pRAGTsYWUjRKVBVP.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "علوم الطبيعة",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - علوم الطبيعة - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/ofWLXfqHDwrhJAvD.pdf"
  },
  {
    uploadedBy: 1,
    schoolYear: "2024-2025",
    educationLevel: "primary",
    grade: "السنة الأولى والثانية ابتدائي",
    subject: "التكنولوجيا",
    documentType: "teacher_guide",
    documentTitle: "دليل المعلم - التكنولوجيا - الدرجة الأولى",
    documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/TTpHHTRKUdTAfkyg.pdf"
  }
];

async function insertReferences() {
  try {
    console.log("Inserting reference documents...");
    
    for (const ref of references) {
      await db.insert(referenceDocuments).values(ref);
      console.log(`✓ Inserted: ${ref.documentTitle}`);
    }
    
    console.log("\n✅ All references inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting references:", error);
    process.exit(1);
  }
}

insertReferences();
