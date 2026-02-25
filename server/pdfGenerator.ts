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

interface AiSuggestionData {
  schoolYear: string;
  educationLevel: string;
  grade: string;
  subject: string;
  lessonTitle: string;
  duration?: number;
  lessonObjectives?: string;
  materials?: string;
  introduction?: string;
  mainActivities?: { title: string; duration: number; description: string }[];
  conclusion?: string;
  evaluation?: string;
}

// Helper to process Arabic text for PDF
function processArabicText(text: string): string {
  const bidi = require("bidi-js");
  return bidi(text);
}

export async function generateAiSuggestionPDF(suggestion: AiSuggestionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Detect language from subject
      const detectLanguage = (subject: string): "arabic" | "french" | "english" => {
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes("فرنسية") || subjectLower.includes("français") || subjectLower.includes("francais")) {
          return "french";
        }
        if (subjectLower.includes("إنجليزية") || subjectLower.includes("english") || subjectLower.includes("anglais")) {
          return "english";
        }
        return "arabic";
      };

      const language = detectLanguage(suggestion.subject);

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Register Arabic font (Amiri)
      const amiriFontPath = "/home/ubuntu/teacher_training_assessment/server/fonts/Amiri-Regular.ttf";
      doc.registerFont("Amiri", amiriFontPath);
      doc.font("Amiri");

      const educationLevelMaps = {
        french: {
          primary: "Primaire",
          middle: "Collège",
          secondary: "Lycée",
        },
        english: {
          primary: "Primary",
          middle: "Middle",
          secondary: "Secondary",
        },
        arabic: {
          primary: "ابتدائي",
          middle: "إعدادي",
          secondary: "ثانوي",
        },
      };

      const educationLevelMap: Record<string, string> = educationLevelMaps[language];

      const pageWidth = doc.page.width;
      const leftMargin = 50;
      const rightMargin = 50;
      const contentWidth = pageWidth - leftMargin - rightMargin;

      // Title
      const titlesByLang = {
        french: "Suggestion de contenu par IA",
        english: "AI Content Suggestion",
        arabic: processArabicText("اقتراح محتوى بالذكاء الاصطناعي"),
      };

      const subtitlesByLang = {
        french: "Fiche pédagogique proposée",
        english: "Proposed Lesson Plan",
        arabic: processArabicText("مذكرة بيداغوجية مقترحة"),
      };

      doc.fontSize(24).fillColor("#1e40af");
      const title = titlesByLang[language];
      doc.text(title, leftMargin, doc.y, {
        width: contentWidth,
        align: language === "arabic" ? "right" : "left",
      });

      doc.moveDown(0.5);
      doc.fontSize(18).fillColor("#3b82f6");
      const subtitle = subtitlesByLang[language];
      doc.text(subtitle, leftMargin, doc.y, {
        width: contentWidth,
        align: language === "arabic" ? "right" : "left",
      });

      doc.moveDown(1);

      // Labels
      const labelsByLang = {
        french: {
          schoolYear: "Année scolaire",
          level: "Niveau",
          grade: "Classe",
          subject: "Matière",
          lessonTitle: "Titre de la leçon",
          duration: "Durée",
          minutes: "minutes",
          objectives: "Objectifs et compétences",
          materials: "Moyens nécessaires",
          introduction: "Introduction",
          mainActivities: "Activités principales",
          conclusion: "Clôture",
          evaluation: "Évaluation",
          note: "Note: Ce contenu est généré par intelligence artificielle et peut être modifié selon les besoins.",
        },
        english: {
          schoolYear: "School year",
          level: "Level",
          grade: "Grade",
          subject: "Subject",
          lessonTitle: "Lesson title",
          duration: "Duration",
          minutes: "minutes",
          objectives: "Objectives and competencies",
          materials: "Required resources",
          introduction: "Introduction",
          mainActivities: "Main activities",
          conclusion: "Conclusion",
          evaluation: "Evaluation",
          note: "Note: This content is generated by artificial intelligence and can be modified as needed.",
        },
        arabic: {
          schoolYear: "السنة الدراسية",
          level: "المستوى",
          grade: "الصف",
          subject: "المادة",
          lessonTitle: "عنوان الدرس",
          duration: "المدة",
          minutes: "دقيقة",
          objectives: "الأهداف والكفايات",
          materials: "الوسائل المطلوبة",
          introduction: "المقدمة / التمهيد",
          mainActivities: "الأنشطة الرئيسية",
          conclusion: "الخاتمة",
          evaluation: "التقييم",
          note: "ملاحظة: هذا المحتوى مُولّد بواسطة الذكاء الاصطناعي ويمكن تعديله حسب الحاجة.",
        },
      };

      const labels = labelsByLang[language];

      // Table data
      const tableData: { label: string; content: string }[] = [
        { label: labels.schoolYear, content: suggestion.schoolYear },
        {
          label: labels.level,
          content: educationLevelMap[suggestion.educationLevel] || suggestion.educationLevel,
        },
        { label: labels.grade, content: suggestion.grade },
        { label: labels.subject, content: suggestion.subject },
        { label: labels.lessonTitle, content: suggestion.lessonTitle },
      ];

      if (suggestion.duration) {
        tableData.push({ label: labels.duration, content: `${suggestion.duration} ${labels.minutes}` });
      }

      if (suggestion.lessonObjectives) {
        tableData.push({ label: labels.objectives, content: suggestion.lessonObjectives });
      }

      if (suggestion.materials) {
        tableData.push({ label: labels.materials, content: suggestion.materials });
      }

      if (suggestion.introduction) {
        tableData.push({ label: labels.introduction, content: suggestion.introduction });
      }

      if (suggestion.mainActivities && suggestion.mainActivities.length > 0) {
        const activitiesText = suggestion.mainActivities
          .map((activity, index) => `${index + 1}. ${activity.title} (${activity.duration} ${labels.minutes})\n${activity.description}`)
          .join("\n\n");
        tableData.push({ label: labels.mainActivities, content: activitiesText });
      }

      if (suggestion.conclusion) {
        tableData.push({ label: labels.conclusion, content: suggestion.conclusion });
      }

      if (suggestion.evaluation) {
        tableData.push({ label: labels.evaluation, content: suggestion.evaluation });
      }

      // Draw table
      const labelColumnWidth = contentWidth * 0.3;
      const contentColumnWidth = contentWidth * 0.7;
      const rowPadding = 10;
      const fontSize = 14;

      doc.fontSize(fontSize).fillColor("#000000");

      tableData.forEach((row) => {
        const startY = doc.y;

        // Calculate row height based on content
        const labelText = processArabicText(row.label);
        const contentText = processArabicText(row.content);

        const labelHeight = doc.heightOfString(labelText, {
          width: labelColumnWidth - rowPadding * 2,
          align: "right",
        });

        const contentHeight = doc.heightOfString(contentText, {
          width: contentColumnWidth - rowPadding * 2,
          align: "right",
        });

        const rowHeight = Math.max(labelHeight, contentHeight) + rowPadding * 2;

        // Check if we need a new page
        if (startY + rowHeight > doc.page.height - 50) {
          doc.addPage();
        }

        const currentY = doc.y;

        // Draw label cell (left side in RTL)
        doc
          .rect(leftMargin, currentY, labelColumnWidth, rowHeight)
          .fillAndStroke("#E7E6E6", "#CCCCCC");

        doc.fillColor("#000000");
        doc.font("Amiri").fontSize(fontSize + 2);
        doc.text(labelText, leftMargin + rowPadding, currentY + rowPadding, {
          width: labelColumnWidth - rowPadding * 2,
          align: "right",
        });

        // Draw content cell (right side in RTL)
        doc
          .rect(leftMargin + labelColumnWidth, currentY, contentColumnWidth, rowHeight)
          .stroke("#CCCCCC");

        doc.fillColor("#000000");
        doc.font("Amiri").fontSize(fontSize);
        doc.text(contentText, leftMargin + labelColumnWidth + rowPadding, currentY + rowPadding, {
          width: contentColumnWidth - rowPadding * 2,
          align: "right",
        });

        doc.y = currentY + rowHeight;
      });

      // Footer note
      doc.moveDown(2);
      doc.fontSize(12).fillColor("#666666");
      const note = language === "arabic" ? processArabicText(labels.note) : labels.note;
      doc.text(note, leftMargin, doc.y, {
        width: contentWidth,
        align: "center",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
