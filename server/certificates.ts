import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

interface CertificateData {
  participantName: string;
  courseName: string;
  courseType: string; // primary_teachers, arabic_teachers, etc.
  completionDate: Date;
  score: number;
  certificateNumber: string;
}

// Course-specific design configurations
const courseDesigns = {
  primary_teachers: {
    primaryColor: "#FF6B6B",
    secondaryColor: "#FFE66D",
    icon: "🎓",
    pattern: "diagonal",
    title: "شهادة تأهيل مدرّس الابتدائي",
  },
  arabic_teachers: {
    primaryColor: "#4ECDC4",
    secondaryColor: "#44A08D",
    icon: "📚",
    pattern: "waves",
    title: "شهادة تأهيل مدرّس العربية",
  },
  science_teachers: {
    primaryColor: "#9B59B6",
    secondaryColor: "#8E44AD",
    icon: "🔬",
    pattern: "circles",
    title: "شهادة تأهيل مدرّس العلوم",
  },
  french_teachers: {
    primaryColor: "#3498DB",
    secondaryColor: "#2980B9",
    icon: "🇫🇷",
    pattern: "squares",
    title: "شهادة تأهيل مدرّس الفرنسية",
  },
  preschool_facilitators: {
    primaryColor: "#F39C12",
    secondaryColor: "#E67E22",
    icon: "🧸",
    pattern: "stars",
    title: "شهادة تأهيل منشّط التحضيري",
  },
  special_needs_companions: {
    primaryColor: "#1ABC9C",
    secondaryColor: "#16A085",
    icon: "🤝",
    pattern: "hearts",
    title: "شهادة تأهيل مرافق ذوي الصعوبات",
  },
  digital_teacher_ai: {
    primaryColor: "#E74C3C",
    secondaryColor: "#C0392B",
    icon: "🤖",
    pattern: "tech",
    title: "شهادة المعلم الرقمي والذكاء الاصطناعي",
  },
};

/**
 * Draw decorative pattern based on course type
 */
function drawPattern(doc: PDFKit.PDFDocument, pattern: string, color: string, pageWidth: number, pageHeight: number) {
  doc.opacity(0.05);
  
  switch (pattern) {
    case "diagonal":
      for (let i = 0; i < 20; i++) {
        doc.strokeColor(color).lineWidth(2).moveTo(i * 50, 0).lineTo(i * 50 + pageHeight, pageHeight).stroke();
      }
      break;
    case "waves":
      for (let y = 0; y < pageHeight; y += 40) {
        doc.strokeColor(color).lineWidth(2);
        doc.moveTo(0, y);
        for (let x = 0; x < pageWidth; x += 20) {
          doc.lineTo(x, y + Math.sin(x / 30) * 10);
        }
        doc.stroke();
      }
      break;
    case "circles":
      for (let x = 100; x < pageWidth; x += 120) {
        for (let y = 100; y < pageHeight; y += 120) {
          doc.strokeColor(color).lineWidth(2).circle(x, y, 30).stroke();
        }
      }
      break;
    case "squares":
      for (let x = 80; x < pageWidth; x += 100) {
        for (let y = 80; y < pageHeight; y += 100) {
          doc.strokeColor(color).lineWidth(2).rect(x - 20, y - 20, 40, 40).stroke();
        }
      }
      break;
    case "stars":
      for (let x = 100; x < pageWidth; x += 150) {
        for (let y = 100; y < pageHeight; y += 150) {
          drawStar(doc, x, y, 5, 20, 10, color);
        }
      }
      break;
    case "hearts":
      for (let x = 100; x < pageWidth; x += 120) {
        for (let y = 100; y < pageHeight; y += 120) {
          doc.fillColor(color).circle(x - 10, y, 15).fill();
          doc.circle(x + 10, y, 15).fill();
          doc.moveTo(x - 22, y).lineTo(x, y + 25).lineTo(x + 22, y).fill();
        }
      }
      break;
    case "tech":
      for (let x = 80; x < pageWidth; x += 100) {
        for (let y = 80; y < pageHeight; y += 100) {
          doc.strokeColor(color).lineWidth(2);
          doc.rect(x - 15, y - 15, 30, 30).stroke();
          doc.circle(x, y, 8).stroke();
        }
      }
      break;
  }
  
  doc.opacity(1);
}

/**
 * Draw a star shape
 */
function drawStar(doc: PDFKit.PDFDocument, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  doc.strokeColor(color).lineWidth(2);
  doc.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    doc.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    doc.lineTo(x, y);
    rot += step;
  }
  
  doc.lineTo(cx, cy - outerRadius);
  doc.stroke();
}

/**
 * Generate a professional certificate PDF in Arabic with course-specific design
 */
export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const design = courseDesigns[data.courseType as keyof typeof courseDesigns] || courseDesigns.primary_teachers;
    
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const fileKey = `certificates/${nanoid()}-${data.certificateNumber}.pdf`;
        const result = await storagePut(fileKey, pdfBuffer, "application/pdf");
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // Page dimensions for A4 landscape
    const pageWidth = 842;
    const pageHeight = 595;

    // Draw background pattern
    drawPattern(doc, design.pattern, design.primaryColor, pageWidth, pageHeight);

    // Draw decorative border with course colors
    doc
      .strokeColor(design.primaryColor)
      .lineWidth(10)
      .rect(25, 25, pageWidth - 50, pageHeight - 50)
      .stroke();

    doc
      .strokeColor(design.secondaryColor)
      .lineWidth(4)
      .rect(35, 35, pageWidth - 70, pageHeight - 70)
      .stroke();

    doc
      .strokeColor(design.primaryColor)
      .lineWidth(1)
      .rect(48, 48, pageWidth - 96, pageHeight - 96)
      .stroke();

    // Draw corner decorations
    const cornerSize = 60;
    doc.fillColor(design.primaryColor).opacity(0.2);
    // Top-left corner
    doc.moveTo(48, 48).lineTo(48 + cornerSize, 48).lineTo(48, 48 + cornerSize).fill();
    // Top-right corner
    doc.moveTo(pageWidth - 48, 48).lineTo(pageWidth - 48 - cornerSize, 48).lineTo(pageWidth - 48, 48 + cornerSize).fill();
    // Bottom-left corner
    doc.moveTo(48, pageHeight - 48).lineTo(48 + cornerSize, pageHeight - 48).lineTo(48, pageHeight - 48 - cornerSize).fill();
    // Bottom-right corner
    doc.moveTo(pageWidth - 48, pageHeight - 48).lineTo(pageWidth - 48 - cornerSize, pageHeight - 48).lineTo(pageWidth - 48, pageHeight - 48 - cornerSize).fill();
    doc.opacity(1);

    // Icon/Logo at top
    doc
      .fontSize(50)
      .text(design.icon, 0, 70, {
        align: "center",
        width: pageWidth,
      });

    // Title - Certificate Type
    doc
      .fontSize(32)
      .fillColor(design.primaryColor)
      .font("Helvetica-Bold")
      .text(design.title, 0, 140, {
        align: "center",
        width: pageWidth,
      });

    // Subtitle
    doc
      .fontSize(16)
      .fillColor("#555555")
      .font("Helvetica")
      .text("تُمنح هذه الشهادة إلى", 0, 190, {
        align: "center",
        width: pageWidth,
      });

    // Participant name with underline
    const nameY = 220;
    doc
      .fontSize(28)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text(data.participantName, 0, nameY, {
        align: "center",
        width: pageWidth,
      });
    
    // Decorative line under name
    doc
      .strokeColor(design.secondaryColor)
      .lineWidth(2)
      .moveTo(pageWidth / 2 - 200, nameY + 40)
      .lineTo(pageWidth / 2 + 200, nameY + 40)
      .stroke();

    // Description
    doc
      .fontSize(15)
      .fillColor("#444444")
      .font("Helvetica")
      .text("تقديراً لإتمامه بنجاح برنامج", 0, 285, {
        align: "center",
        width: pageWidth,
      });

    // Course name
    doc
      .fontSize(20)
      .fillColor(design.secondaryColor)
      .font("Helvetica-Bold")
      .text(data.courseName, 0, 315, {
        align: "center",
        width: pageWidth,
      });

    // Score with badge
    doc
      .fillColor(design.primaryColor)
      .roundedRect(pageWidth / 2 - 80, 360, 160, 40, 20)
      .fill();
    
    doc
      .fontSize(18)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text(`النتيجة: ${data.score}%`, 0, 370, {
        align: "center",
        width: pageWidth,
      });

    // Date and certificate number in styled boxes
    const dateStr = data.completionDate.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Date box (left)
    doc.fillColor(design.secondaryColor).opacity(0.1).roundedRect(70, 450, 250, 50, 5).fill();
    doc.opacity(1);
    doc
      .fontSize(13)
      .fillColor("#333333")
      .font("Helvetica-Bold")
      .text("تاريخ الإصدار", 70, 458, { width: 250, align: "center" });
    doc
      .fontSize(12)
      .fillColor("#666666")
      .font("Helvetica")
      .text(dateStr, 70, 478, { width: 250, align: "center" });

    // Certificate number box (right)
    doc.fillColor(design.secondaryColor).opacity(0.1).roundedRect(pageWidth - 320, 450, 250, 50, 5).fill();
    doc.opacity(1);
    doc
      .fontSize(13)
      .fillColor("#333333")
      .font("Helvetica-Bold")
      .text("رقم الشهادة", pageWidth - 320, 458, { width: 250, align: "center" });
    doc
      .fontSize(12)
      .fillColor("#666666")
      .font("Helvetica")
      .text(data.certificateNumber, pageWidth - 320, 478, { width: 250, align: "center" });

    // Footer with organization name
    doc
      .fontSize(12)
      .fillColor(design.primaryColor)
      .font("Helvetica-Bold")
      .text("منصة تأهيل المدرسين", 0, 525, {
        align: "center",
        width: pageWidth,
      });
    
    doc
      .fontSize(10)
      .fillColor("#888888")
      .font("Helvetica")
      .text("ليدر أكاديمي للتدريب والتطوير", 0, 545, {
        align: "center",
        width: pageWidth,
      });

    doc.end();
  });
}
