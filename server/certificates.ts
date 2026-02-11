import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

interface CertificateData {
  participantName: string;
  courseName: string;
  completionDate: Date;
  score: number;
  certificateNumber: string;
}

/**
 * Generate a professional certificate PDF in Arabic
 */
export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
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
    doc
      .strokeColor("#2962ff")
      .lineWidth(8)
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke();

    doc
      .strokeColor("#666666")
      .lineWidth(2)
      .rect(45, 45, pageWidth - 90, pageHeight - 90)
      .stroke();

    // Title - Certificate of Achievement
    doc
      .fontSize(40)
      .fillColor("#2962ff")
      .font("Helvetica-Bold")
      .text("شهادة إتمام", 0, 100, {
        align: "center",
        width: pageWidth,
      });

    // Subtitle
    doc
      .fontSize(18)
      .fillColor("#666666")
      .font("Helvetica")
      .text("هذا يشهد بأن", 0, 160, {
        align: "center",
        width: pageWidth,
      });

    // Participant name
    doc
      .fontSize(32)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text(data.participantName, 0, 200, {
        align: "center",
        width: pageWidth,
      });

    // Description
    doc
      .fontSize(16)
      .fillColor("#555555")
      .font("Helvetica")
      .text("قد أكمل بنجاح دورة", 0, 255, {
        align: "center",
        width: pageWidth,
      });

    // Course name
    doc
      .fontSize(24)
      .fillColor("#2962ff")
      .font("Helvetica-Bold")
      .text(data.courseName, 0, 290, {
        align: "center",
        width: pageWidth,
      });

    // Score
    doc
      .fontSize(16)
      .fillColor("#555555")
      .font("Helvetica")
      .text(`بدرجة: ${data.score}%`, 0, 345, {
        align: "center",
        width: pageWidth,
      });

    // Date and certificate number
    const dateStr = data.completionDate.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(12)
      .fillColor("#888888")
      .font("Helvetica")
      .text(`التاريخ: ${dateStr}`, 80, 430, {
        align: "left",
      });

    doc
      .fontSize(12)
      .fillColor("#888888")
      .text(`رقم الشهادة: ${data.certificateNumber}`, pageWidth - 280, 430, {
        align: "right",
        width: 200,
      });

    // Footer
    doc
      .fontSize(11)
      .fillColor("#999999")
      .text("منصة تأهيل المدرسين - ليدر أكاديمي", 0, 490, {
        align: "center",
        width: pageWidth,
      });

    doc.end();
  });
}
