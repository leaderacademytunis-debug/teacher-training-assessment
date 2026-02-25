import { drizzle } from "drizzle-orm/mysql2";
import { referenceDocuments } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const manuelData = {
  uploadedBy: 1, // Owner ID
  schoolYear: "2025-2026",
  educationLevel: "primary",
  grade: "6ème année primaire",
  subject: "Français",
  documentType: "teacher_guide",
  documentTitle: "Manuel de lecture 6ème année - Un pas de plus vers le collège",
  documentUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/mOLpWZfprxetOxba.pdf",
  extractedContent: null,
};

async function addManuel() {
  try {
    console.log("Adding manuel to database...");
    
    const [result] = await db.insert(referenceDocuments).values(manuelData);
    
    console.log(`✅ Manuel added successfully with ID: ${result.insertId}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding manuel:", error);
    process.exit(1);
  }
}

addManuel();
