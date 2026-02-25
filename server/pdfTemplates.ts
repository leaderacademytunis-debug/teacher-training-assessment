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

// Template 1: Classic Professional (Blue theme)
export async function generatePedagogicalSheetPdfClassic(sheet: PedagogicalSheet): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Decorative double border
  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
     .lineWidth(3)
     .strokeColor("#2563eb")
     .stroke();

  doc.rect(45, 45, doc.page.width - 90, doc.page.height - 90)
     .lineWidth(1)
     .strokeColor("#60a5fa")
     .stroke();

  // Title with blue background
  doc.rect(60, 60, doc.page.width - 120, 50)
     .fillAndStroke("#2563eb", "#1e40af");
  
  doc.fillColor("#ffffff")
     .fontSize(24)
     .text("مذكرة بيداغوجية", 60, 75, { 
       width: doc.page.width - 120, 
       align: "center" 
     });
  
  doc.fillColor("#000000");
  doc.y = 130;

  // Identification section
  addSectionHeader(doc, "معلومات التعريف", "#2563eb", "#dbeafe");
  doc.fontSize(12);
  addLabelValue(doc, "السنة الدراسية", sheet.schoolYear);
  addLabelValue(doc, "المستوى", sheet.educationLevel === "primary" ? "ابتدائي" : sheet.educationLevel === "middle" ? "إعدادي" : "ثانوي");
  addLabelValue(doc, "الصف", sheet.grade);
  addLabelValue(doc, "المادة", sheet.subject);
  addLabelValue(doc, "عنوان الدرس", sheet.lessonTitle);
  if (sheet.duration) {
    addLabelValue(doc, "المدة", `${sheet.duration} دقيقة`);
  }
  doc.moveDown();

  // Objectives
  if (sheet.lessonObjectives) {
    addSectionHeader(doc, "الأهداف والكفايات", "#16a34a", "#dcfce7");
    doc.fontSize(11).text(sheet.lessonObjectives);
    doc.moveDown();
  }

  // Materials
  if (sheet.materials) {
    addSectionHeader(doc, "الوسائل المطلوبة", "#ea580c", "#fed7aa");
    doc.fontSize(11).text(sheet.materials);
    doc.moveDown();
  }

  // Introduction
  if (sheet.introduction) {
    addSectionHeader(doc, "المقدمة / التمهيد", "#7c3aed", "#e9d5ff");
    doc.fontSize(11).text(sheet.introduction);
    doc.moveDown();
  }

  // Main Activities
  if (sheet.mainActivities && Array.isArray(sheet.mainActivities) && sheet.mainActivities.length > 0) {
    addSectionHeader(doc, "الأنشطة الرئيسية", "#dc2626", "#fecaca");
    sheet.mainActivities.forEach((activity, index) => {
      doc.fontSize(12).font("Helvetica-Bold").text(`${index + 1}. ${activity.title} (${activity.duration} دقيقة)`);
      doc.font("Helvetica").fontSize(11).text(`   ${activity.description}`);
      doc.moveDown(0.3);
    });
    doc.moveDown();
  }

  // Conclusion
  if (sheet.conclusion) {
    addSectionHeader(doc, "الخاتمة", "#0891b2", "#cffafe");
    doc.fontSize(11).text(sheet.conclusion);
    doc.moveDown();
  }

  // Evaluation
  if (sheet.evaluation) {
    addSectionHeader(doc, "التقييم", "#ca8a04", "#fef3c7");
    doc.fontSize(11).text(sheet.evaluation);
    doc.moveDown();
  }

  // References
  if (sheet.guidePageReference || sheet.programReference) {
    addSectionHeader(doc, "المراجع الرسمية", "#6366f1", "#e0e7ff");
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

// Template 2: Modern Minimalist (Green theme)
export async function generatePedagogicalSheetPdfModern(sheet: PedagogicalSheet): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 60 });

  // Simple left border accent
  doc.rect(40, 40, 10, doc.page.height - 80)
     .fillAndStroke("#10b981", "#059669");

  // Title
  doc.fontSize(28)
     .fillColor("#10b981")
     .text("مذكرة بيداغوجية", 70, 60);
  
  doc.moveTo(70, 95)
     .lineTo(doc.page.width - 60, 95)
     .lineWidth(2)
     .strokeColor("#10b981")
     .stroke();

  doc.fillColor("#000000");
  doc.y = 120;

  // Content sections with minimal design
  addModernSection(doc, "معلومات التعريف");
  doc.fontSize(11);
  doc.text(`السنة الدراسية: ${sheet.schoolYear}`);
  doc.text(`المستوى: ${sheet.educationLevel === "primary" ? "ابتدائي" : sheet.educationLevel === "middle" ? "إعدادي" : "ثانوي"}`);
  doc.text(`الصف: ${sheet.grade}`);
  doc.text(`المادة: ${sheet.subject}`);
  doc.text(`عنوان الدرس: ${sheet.lessonTitle}`);
  if (sheet.duration) {
    doc.text(`المدة: ${sheet.duration} دقيقة`);
  }
  doc.moveDown();

  if (sheet.lessonObjectives) {
    addModernSection(doc, "الأهداف والكفايات");
    doc.fontSize(11).text(sheet.lessonObjectives);
    doc.moveDown();
  }

  if (sheet.materials) {
    addModernSection(doc, "الوسائل المطلوبة");
    doc.fontSize(11).text(sheet.materials);
    doc.moveDown();
  }

  if (sheet.introduction) {
    addModernSection(doc, "المقدمة / التمهيد");
    doc.fontSize(11).text(sheet.introduction);
    doc.moveDown();
  }

  if (sheet.mainActivities && Array.isArray(sheet.mainActivities) && sheet.mainActivities.length > 0) {
    addModernSection(doc, "الأنشطة الرئيسية");
    sheet.mainActivities.forEach((activity, index) => {
      doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${activity.title} (${activity.duration} دقيقة)`);
      doc.font("Helvetica").text(`   ${activity.description}`);
      doc.moveDown(0.3);
    });
    doc.moveDown();
  }

  if (sheet.conclusion) {
    addModernSection(doc, "الخاتمة");
    doc.fontSize(11).text(sheet.conclusion);
    doc.moveDown();
  }

  if (sheet.evaluation) {
    addModernSection(doc, "التقييم");
    doc.fontSize(11).text(sheet.evaluation);
    doc.moveDown();
  }

  if (sheet.guidePageReference || sheet.programReference) {
    addModernSection(doc, "المراجع الرسمية");
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

// Template 3: Colorful Creative (Multi-color theme)
export async function generatePedagogicalSheetPdfColorful(sheet: PedagogicalSheet): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Colorful corner decorations
  doc.circle(50, 50, 30).fillAndStroke("#ef4444", "#dc2626");
  doc.circle(doc.page.width - 50, 50, 30).fillAndStroke("#3b82f6", "#2563eb");
  doc.circle(50, doc.page.height - 50, 30).fillAndStroke("#10b981", "#059669");
  doc.circle(doc.page.width - 50, doc.page.height - 50, 30).fillAndStroke("#f59e0b", "#d97706");

  // Title with gradient effect (simulated with rectangles)
  const titleY = 80;
  doc.rect(70, titleY, doc.page.width - 140, 60)
     .fillAndStroke("#8b5cf6", "#7c3aed");
  
  doc.fillColor("#ffffff")
     .fontSize(26)
     .text("مذكرة بيداغوجية", 70, titleY + 18, { 
       width: doc.page.width - 140, 
       align: "center" 
     });
  
  doc.fillColor("#000000");
  doc.y = 170;

  // Colorful sections
  const colors = [
    { border: "#3b82f6", bg: "#dbeafe" },
    { border: "#10b981", bg: "#d1fae5" },
    { border: "#f59e0b", bg: "#fed7aa" },
    { border: "#ef4444", bg: "#fecaca" },
    { border: "#8b5cf6", bg: "#e9d5ff" },
    { border: "#06b6d4", bg: "#cffafe" },
  ];
  let colorIndex = 0;

  addColorfulSection(doc, "معلومات التعريف", colors[colorIndex++ % colors.length]);
  doc.fontSize(11);
  doc.text(`السنة الدراسية: ${sheet.schoolYear}`);
  doc.text(`المستوى: ${sheet.educationLevel === "primary" ? "ابتدائي" : sheet.educationLevel === "middle" ? "إعدادي" : "ثانوي"}`);
  doc.text(`الصف: ${sheet.grade}`);
  doc.text(`المادة: ${sheet.subject}`);
  doc.text(`عنوان الدرس: ${sheet.lessonTitle}`);
  if (sheet.duration) {
    doc.text(`المدة: ${sheet.duration} دقيقة`);
  }
  doc.moveDown();

  if (sheet.lessonObjectives) {
    addColorfulSection(doc, "الأهداف والكفايات", colors[colorIndex++ % colors.length]);
    doc.fontSize(11).text(sheet.lessonObjectives);
    doc.moveDown();
  }

  if (sheet.materials) {
    addColorfulSection(doc, "الوسائل المطلوبة", colors[colorIndex++ % colors.length]);
    doc.fontSize(11).text(sheet.materials);
    doc.moveDown();
  }

  if (sheet.introduction) {
    addColorfulSection(doc, "المقدمة / التمهيد", colors[colorIndex++ % colors.length]);
    doc.fontSize(11).text(sheet.introduction);
    doc.moveDown();
  }

  if (sheet.mainActivities && Array.isArray(sheet.mainActivities) && sheet.mainActivities.length > 0) {
    addColorfulSection(doc, "الأنشطة الرئيسية", colors[colorIndex++ % colors.length]);
    sheet.mainActivities.forEach((activity, index) => {
      doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${activity.title} (${activity.duration} دقيقة)`);
      doc.font("Helvetica").text(`   ${activity.description}`);
      doc.moveDown(0.3);
    });
    doc.moveDown();
  }

  if (sheet.conclusion) {
    addColorfulSection(doc, "الخاتمة", colors[colorIndex++ % colors.length]);
    doc.fontSize(11).text(sheet.conclusion);
    doc.moveDown();
  }

  if (sheet.evaluation) {
    addColorfulSection(doc, "التقييم", colors[colorIndex++ % colors.length]);
    doc.fontSize(11).text(sheet.evaluation);
    doc.moveDown();
  }

  if (sheet.guidePageReference || sheet.programReference) {
    addColorfulSection(doc, "المراجع الرسمية", colors[colorIndex++ % colors.length]);
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

// Helper functions
function addSectionHeader(doc: PDFKit.PDFDocument, title: string, borderColor: string, bgColor: string) {
  const currentY = doc.y;
  doc.rect(55, currentY, doc.page.width - 110, 28)
     .fillAndStroke(bgColor, borderColor);
  
  doc.fillColor(borderColor)
     .fontSize(15)
     .font("Helvetica-Bold")
     .text(title, 65, currentY + 7);
  
  doc.font("Helvetica")
     .fillColor("#000000");
  doc.moveDown(1.5);
}

function addLabelValue(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
}

function addModernSection(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(14)
     .fillColor("#10b981")
     .font("Helvetica-Bold")
     .text(title);
  
  doc.moveTo(doc.x, doc.y)
     .lineTo(doc.x + 100, doc.y)
     .lineWidth(2)
     .strokeColor("#10b981")
     .stroke();
  
  doc.fillColor("#000000")
     .font("Helvetica");
  doc.moveDown(0.5);
}

function addColorfulSection(doc: PDFKit.PDFDocument, title: string, colors: { border: string; bg: string }) {
  const currentY = doc.y;
  
  // Left colored bar
  doc.rect(55, currentY, 8, 28)
     .fillAndStroke(colors.border, colors.border);
  
  // Background
  doc.rect(63, currentY, doc.page.width - 118, 28)
     .fillAndStroke(colors.bg, colors.border);
  
  doc.fillColor(colors.border)
     .fontSize(14)
     .font("Helvetica-Bold")
     .text(title, 73, currentY + 7);
  
  doc.font("Helvetica")
     .fillColor("#000000");
  doc.moveDown(1.5);
}
