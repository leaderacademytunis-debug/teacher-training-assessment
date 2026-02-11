import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import axios from "axios";

/**
 * Download image from URL and return as Buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

interface CertificateData {
  participantName: string;
  courseName: string;
  courseType: string;
  courseAxes?: string[]; // Array of course topics/axes
  batchNumber?: string; // Batch/promotion number
  completionDate: Date;
  score: number;
  certificateNumber: string;
}

// Course-specific configurations
const courseConfigs = {
  primary_teachers: {
    title: "تأهيل مدرسي الاختصاص في تدريس العربية",
    defaultAxes: [
      "تعليمية العربية : المفاهيم الأساسية",
      "جذاذات التنشيط : القراءة ، التواصل الشفوي ، الإنتاج الكتابي ، قواعد اللغة ، المحفوظات",
      "التقييم و بناء الاختبارات"
    ]
  },
  arabic_teachers: {
    title: "تأهيل مدرسي الاختصاص في تدريس العربية",
    defaultAxes: [
      "تعليمية العربية : المفاهيم الأساسية",
      "جذاذات التنشيط : القراءة ، التواصل الشفوي ، الإنتاج الكتابي ، قواعد اللغة ، المحفوظات",
      "التقييم و بناء الاختبارات"
    ]
  },
  science_teachers: {
    title: "تأهيل مدرسي الاختصاص في تدريس العلوم",
    defaultAxes: [
      "تعليمية العلوم : المفاهيم الأساسية",
      "التجارب العملية والأساليب التفاعلية",
      "التقييم و بناء الاختبارات"
    ]
  },
  french_teachers: {
    title: "تأهيل مدرسي الاختصاص في تدريس الفرنسية",
    defaultAxes: [
      "تعليمية الفرنسية : المفاهيم الأساسية",
      "جذاذات التنشيط والأنشطة التفاعلية",
      "التقييم و بناء الاختبارات"
    ]
  },
  preschool_facilitators: {
    title: "تأهيل منشّطي التحضيري",
    defaultAxes: [
      "التربية في مرحلة الطفولة المبكرة",
      "الأنشطة التربوية والترفيهية",
      "التقييم والمتابعة"
    ]
  },
  special_needs_companions: {
    title: "تأهيل مرافقي التلاميذ ذوي الصعوبات",
    defaultAxes: [
      "فهم الاحتياجات الخاصة",
      "استراتيجيات الدعم والمرافقة",
      "التقييم والتكيف"
    ]
  },
  digital_teacher_ai: {
    title: "المعلم الرقمي والذكاء الاصطناعي",
    defaultAxes: [
      "أساسيات الذكاء الاصطناعي في التعليم",
      "أدوات وتطبيقات الذكاء الاصطناعي",
      "التقييم والتطوير المهني"
    ]
  },
};

/**
 * Draw decorative Islamic/traditional border
 */
function drawDecorativeBorder(doc: PDFKit.PDFDocument, pageWidth: number, pageHeight: number) {
  const margin = 15;
  const innerMargin = 30;
  
  // Outer border
  doc.strokeColor("#333333").lineWidth(3);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).stroke();
  
  // Inner decorative border
  doc.strokeColor("#666666").lineWidth(1.5);
  doc.rect(innerMargin, innerMargin, pageWidth - 2 * innerMargin, pageHeight - 2 * innerMargin).stroke();
  
  // Draw corner decorations (simplified Islamic pattern)
  const cornerSize = 40;
  const corners = [
    { x: innerMargin, y: innerMargin }, // top-left
    { x: pageWidth - innerMargin, y: innerMargin }, // top-right
    { x: innerMargin, y: pageHeight - innerMargin }, // bottom-left
    { x: pageWidth - innerMargin, y: pageHeight - innerMargin }, // bottom-right
  ];
  
  doc.strokeColor("#444444").lineWidth(1);
  corners.forEach((corner, idx) => {
    const isLeft = idx % 2 === 0;
    const isTop = idx < 2;
    const xDir = isLeft ? 1 : -1;
    const yDir = isTop ? 1 : -1;
    
    // Draw corner pattern
    for (let i = 0; i < 3; i++) {
      const offset = i * 8;
      doc.moveTo(corner.x, corner.y + yDir * offset)
        .lineTo(corner.x + xDir * offset, corner.y)
        .stroke();
    }
  });
  
  // Draw decorative arcs at top and bottom
  const arcY = innerMargin - 5;
  const arcSpacing = 60;
  doc.strokeColor("#888888").lineWidth(1);
  
  for (let x = innerMargin + arcSpacing; x < pageWidth - innerMargin; x += arcSpacing) {
    // Top arcs
    doc.moveTo(x - 30, arcY)
      .bezierCurveTo(x - 15, arcY - 15, x + 15, arcY - 15, x + 30, arcY)
      .stroke();
    
    // Bottom arcs
    const bottomY = pageHeight - innerMargin + 5;
    doc.moveTo(x - 30, bottomY)
      .bezierCurveTo(x - 15, bottomY + 15, x + 15, bottomY + 15, x + 30, bottomY)
      .stroke();
  }
}

/**
 * Generate a professional certificate PDF matching the provided design
 */
export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
  const config = courseConfigs[data.courseType as keyof typeof courseConfigs] || courseConfigs.arabic_teachers;
  const axes = data.courseAxes || config.defaultAxes;
  
  // Download images first
  const logoUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/aYRTvdXAkBzKfCAY.png";
  const flagUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/lUjeCQtcebHcrJBL.png";
  
  let logoBuffer: Buffer | null = null;
  let flagBuffer: Buffer | null = null;
  
  try {
    logoBuffer = await downloadImage(logoUrl);
  } catch (error) {
    console.error("Failed to load logo:", error);
  }
  
  try {
    flagBuffer = await downloadImage(flagUrl);
  } catch (error) {
    console.error("Failed to load flag:", error);
  }
  
  return new Promise((resolve, reject) => {
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

    // Draw decorative border
    drawDecorativeBorder(doc, pageWidth, pageHeight);

    // Add Leader Academy logo (left side)
    if (logoBuffer) {
      doc.image(logoBuffer, 50, 50, { width: 120 });
    }

    // Add Tunisia flag (right side)
    if (flagBuffer) {
      doc.image(flagBuffer, pageWidth - 120, 50, { width: 60 });
    }
    
    doc.fontSize(9).fillColor("#333333").font("Helvetica");
    doc.text("الجمهورية التونسية", pageWidth - 150, 120, { width: 130, align: "center" });
    doc.text("وزارة التشغيل والتكوين المهني", pageWidth - 150, 135, { width: 130, align: "center" });
    doc.text("ليدر أكاديمي", pageWidth - 150, 150, { width: 130, align: "center" });
    doc.fontSize(7).fillColor("#666666");
    doc.text("تسجيل عدد 61-309-16", pageWidth - 150, 165, { width: 130, align: "center" });

    // Main title "شهادة"
    doc.fontSize(48).fillColor("#000000").font("Helvetica-Bold");
    doc.text("شهادة", 0, 110, { align: "center", width: pageWidth });

    // Subtitle
    doc.fontSize(14).fillColor("#555555").font("Helvetica");
    doc.text("أسندت هذه الشهادة إلى السيد(ة)", 0, 170, { align: "center", width: pageWidth });

    // Participant name
    doc.fontSize(24).fillColor("#000000").font("Helvetica-Bold");
    doc.text(data.participantName, 0, 200, { align: "center", width: pageWidth });

    // Description
    doc.fontSize(13).fillColor("#444444").font("Helvetica");
    doc.text("للمشاركة الفاعلة في دورة تكوينيّة بعنوان", 0, 240, { align: "center", width: pageWidth });

    // Course title
    doc.fontSize(18).fillColor("#000000").font("Helvetica-Bold");
    doc.text(`" ${config.title} "`, 0, 270, { align: "center", width: pageWidth });
    
    // Underline
    doc.strokeColor("#000000").lineWidth(1.5);
    doc.moveTo(pageWidth / 2 - 250, 295).lineTo(pageWidth / 2 + 250, 295).stroke();

    // Course axes
    doc.fontSize(11).fillColor("#333333").font("Helvetica");
    doc.text("والتي تناولت المحاور التالية :", pageWidth - 200, 315, { width: 180, align: "right" });
    
    let axisY = 335;
    axes.forEach((axis) => {
      doc.fontSize(10).fillColor("#444444");
      doc.text(`• ${axis}`, pageWidth - 400, axisY, { width: 380, align: "right" });
      axisY += 18;
    });

    // Signatures section
    const sigY = 450;
    
    // Left signature (Coordinator)
    doc.fontSize(11).fillColor("#333333").font("Helvetica-Bold");
    doc.text("أ. سامي الجازي", 80, sigY, { width: 150, align: "center" });
    doc.fontSize(10).fillColor("#666666").font("Helvetica");
    doc.text("منسق عام مميز للتربية", 80, sigY + 20, { width: 150, align: "center" });

    // Right signature (Director)
    doc.fontSize(11).fillColor("#333333").font("Helvetica-Bold");
    doc.text("أ. علي سعدالله", pageWidth - 230, sigY, { width: 150, align: "center" });
    doc.fontSize(10).fillColor("#666666").font("Helvetica");
    doc.text("مدير الأكاديمية", pageWidth - 230, sigY + 20, { width: 150, align: "center" });

    // Footer with batch number
    const batchText = data.batchNumber || `الدفعة رقم 107 من البرنامج التكويني لتأهيل المدرسين  ديسمبر ${new Date().getFullYear()}`;
    doc.fontSize(9).fillColor("#666666").font("Helvetica");
    doc.text(batchText, 0, 530, { align: "center", width: pageWidth });

    doc.end();
  });
}
