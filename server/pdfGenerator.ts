import PDFDocument from "pdfkit";
import type { PedagogicalSheet, LessonPlan, TeacherExam } from "../drizzle/schema";

// Helper to create PDF buffer from PDFDocument
function createPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    doc.end();
  });
}

// Helper to add Arabic text support (right-to-left)
function addArabicText(doc: PDFKit.PDFDocument, text: string, x: number, y: number, options?: any) {
  doc.text(text, x, y, { ...options, align: "right" });
}

export async function generatePedagogicalSheetPdf(sheet: PedagogicalSheet): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Title
  doc.fontSize(20).text("مذكرة بيداغوجية", { align: "center" });
  doc.moveDown();

  // Identification
  doc.fontSize(14).text("معلومات التعريف", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`السنة الدراسية: ${sheet.schoolYear}`);
  doc.text(`المستوى: ${sheet.educationLevel === "primary" ? "ابتدائي" : sheet.educationLevel === "middle" ? "إعدادي" : "ثانوي"}`);
  doc.text(`الصف: ${sheet.grade}`);
  doc.text(`المادة: ${sheet.subject}`);
  doc.text(`عنوان الدرس: ${sheet.lessonTitle}`);
  if (sheet.duration) {
    doc.text(`المدة: ${sheet.duration} دقيقة`);
  }
  doc.moveDown();

  // Objectives
  if (sheet.lessonObjectives) {
    doc.fontSize(14).text("الأهداف والكفايات", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(sheet.lessonObjectives);
    doc.moveDown();
  }

  // Materials
  if (sheet.materials) {
    doc.fontSize(14).text("الوسائل المطلوبة", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(sheet.materials);
    doc.moveDown();
  }

  // Introduction
  if (sheet.introduction) {
    doc.fontSize(14).text("المقدمة / التمهيد", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(sheet.introduction);
    doc.moveDown();
  }

  // Main Activities
  if (sheet.mainActivities && Array.isArray(sheet.mainActivities) && sheet.mainActivities.length > 0) {
    doc.fontSize(14).text("الأنشطة الرئيسية", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    sheet.mainActivities.forEach((activity, index) => {
      doc.text(`${index + 1}. ${activity.title} (${activity.duration} دقيقة)`);
      doc.text(`   ${activity.description}`);
      doc.moveDown(0.3);
    });
    doc.moveDown();
  }

  // Conclusion
  if (sheet.conclusion) {
    doc.fontSize(14).text("الخاتمة", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(sheet.conclusion);
    doc.moveDown();
  }

  // Evaluation
  if (sheet.evaluation) {
    doc.fontSize(14).text("التقييم", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(sheet.evaluation);
    doc.moveDown();
  }

  // References
  if (sheet.guidePageReference || sheet.programReference) {
    doc.fontSize(14).text("المراجع الرسمية", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    if (sheet.guidePageReference) {
      doc.text(`مرجع دليل المعلم: ${sheet.guidePageReference}`);
    }
    if (sheet.programReference) {
      doc.text(`مرجع البرنامج الرسمي: ${sheet.programReference}`);
    }
  }

  return createPdfBuffer(doc);
}

export async function generateLessonPlanPdf(plan: LessonPlan): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Title
  doc.fontSize(20).text("خطة دروس", { align: "center" });
  doc.moveDown();

  // Identification
  doc.fontSize(14).text("معلومات التعريف", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`السنة الدراسية: ${plan.schoolYear}`);
  doc.text(`المستوى: ${plan.educationLevel === "primary" ? "ابتدائي" : plan.educationLevel === "middle" ? "إعدادي" : "ثانوي"}`);
  doc.text(`الصف: ${plan.grade}`);
  doc.text(`المادة: ${plan.subject}`);
  doc.text(`عنوان الخطة: ${plan.planTitle}`);
  
  if (plan.startDate) {
    doc.text(`تاريخ البداية: ${new Date(plan.startDate).toLocaleDateString("ar-TN")}`);
  }
  if (plan.endDate) {
    doc.text(`تاريخ النهاية: ${new Date(plan.endDate).toLocaleDateString("ar-TN")}`);
  }
  if (plan.totalLessons) {
    doc.text(`عدد الدروس: ${plan.totalLessons}`);
  }
  doc.moveDown();

  // Lessons
  if (plan.lessons && Array.isArray(plan.lessons) && plan.lessons.length > 0) {
    doc.fontSize(14).text("الدروس", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    
    plan.lessons.forEach((lesson, index) => {
      doc.font("Helvetica-Bold").fontSize(12).text(`الأسبوع ${lesson.week}: ${lesson.lessonTitle}`);
      doc.font("Helvetica");
      doc.fontSize(11);
      if (lesson.objectives) {
        doc.text(`الأهداف: ${lesson.objectives}`);
      }
      doc.text(`المدة: ${lesson.duration} دقيقة`);
      doc.moveDown(0.5);
    });
  }

  return createPdfBuffer(doc);
}

export async function generateTeacherExamPdf(exam: TeacherExam): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Title
  doc.fontSize(20).text("اختبار", { align: "center" });
  doc.moveDown();

  // Identification
  doc.fontSize(14).text("معلومات التعريف", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`السنة الدراسية: ${exam.schoolYear}`);
  doc.text(`المستوى: ${exam.educationLevel === "primary" ? "ابتدائي" : exam.educationLevel === "middle" ? "إعدادي" : "ثانوي"}`);
  doc.text(`الصف: ${exam.grade}`);
  doc.text(`المادة: ${exam.subject}`);
  doc.text(`عنوان الاختبار: ${exam.examTitle}`);
  
  const examTypeMap = {
    diagnostic: "تشخيصي",
    formative: "تكويني",
    summative: "ختامي",
  };
  doc.text(`نوع الاختبار: ${examTypeMap[exam.examType]}`);
  
  if (exam.duration) {
    doc.text(`المدة: ${exam.duration} دقيقة`);
  }
  doc.text(`المجموع: ${exam.totalPoints} نقطة`);
  doc.moveDown();

  // Questions
  if (exam.questions && Array.isArray(exam.questions) && exam.questions.length > 0) {
    doc.fontSize(14).text("الأسئلة", { underline: true });
    doc.moveDown(0.5);
    
    exam.questions.forEach((question, index) => {
      doc.font("Helvetica-Bold").fontSize(12).text(`السؤال ${index + 1} (${question.points} نقاط):`);
      doc.font("Helvetica");
      doc.fontSize(11).text(question.questionText);
      
      if (question.questionType === "mcq" && question.options) {
        doc.moveDown(0.3);
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          doc.text(`${letter}. ${option}`);
        });
      }
      
      doc.moveDown(0.8);
    });
  }

  return createPdfBuffer(doc);
}
