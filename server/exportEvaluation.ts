import PDFDocument from "pdfkit";

interface EvaluationCritere {
  nom: string;
  note: number;
  noteMax: number;
  commentaire: string;
  points: string[];
  ameliorations: string[];
}

interface EvaluationData {
  noteGlobale: number;
  appreciation: string;
  criteres: EvaluationCritere[];
  pointsForts: string[];
  pointsAmeliorer: string[];
  recommandations: string;
  fileName?: string;
  subject?: string;
  level?: string;
}

function createPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    doc.end();
  });
}

function getAppreciationEmoji(appreciation: string): string {
  if (appreciation.includes("Très Bien") || appreciation.includes("ممتاز")) return "★★★★★";
  if (appreciation.includes("Bien") || appreciation.includes("جيد جداً")) return "★★★★☆";
  if (appreciation.includes("Assez") || appreciation.includes("جيد")) return "★★★☆☆";
  if (appreciation.includes("Passable") || appreciation.includes("مقبول")) return "★★☆☆☆";
  return "★☆☆☆☆";
}

function getNoteColor(note: number, max: number): string {
  const pct = (note / max) * 100;
  if (pct >= 75) return "#16a34a";
  if (pct >= 50) return "#d97706";
  return "#dc2626";
}

export async function exportEvaluationPDF(data: EvaluationData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: "تقرير تقييم الفيشة البيداغوجية - ليدر أكاديمي",
      Author: "ليدر أكاديمي",
      Subject: "تقييم الفيشة البيداغوجية",
    },
  });

  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // ─── HEADER ────────────────────────────────────────────────────────────────
  // Header background
  doc.rect(0, 0, pageWidth, 100).fill("#4c1d95");

  // Title (LTR layout since PDFKit has limited RTL support)
  doc
    .fillColor("#ffffff")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("Leader Academy", margin, 20, { align: "left", width: contentWidth });

  doc
    .fillColor("#c4b5fd")
    .fontSize(11)
    .font("Helvetica")
    .text("Rapport d'Evaluation Pedagogique", margin, 46, { align: "left", width: contentWidth });

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-TN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc
    .fillColor("#e9d5ff")
    .fontSize(10)
    .text(`Date: ${dateStr}`, margin, 68, { align: "left", width: contentWidth });

  doc.y = 120;

  // ─── CONTEXT INFO ──────────────────────────────────────────────────────────
  if (data.fileName || data.subject || data.level) {
    doc.rect(margin, doc.y, contentWidth, 40).fill("#f5f3ff").stroke("#8b5cf6");
    doc.fillColor("#4c1d95").fontSize(10).font("Helvetica");
    let contextLine = "";
    if (data.fileName) contextLine += `Fichier: ${data.fileName}   `;
    if (data.subject) contextLine += `Matiere: ${data.subject}   `;
    if (data.level) contextLine += `Niveau: ${data.level}`;
    doc.text(contextLine, margin + 10, doc.y + 14, { width: contentWidth - 20 });
    doc.y += 55;
  }

  doc.moveDown(0.5);

  // ─── GLOBAL SCORE ──────────────────────────────────────────────────────────
  const scoreBoxY = doc.y;
  const scoreColor = getNoteColor(data.noteGlobale, 20);

  // Score box
  doc.rect(margin, scoreBoxY, contentWidth, 80).fill("#fafafa").stroke("#e5e7eb");

  // Big score
  doc
    .fillColor(scoreColor)
    .fontSize(42)
    .font("Helvetica-Bold")
    .text(`${data.noteGlobale}/20`, margin + 20, scoreBoxY + 15, { width: 120 });

  // Appreciation
  doc
    .fillColor("#1e1b4b")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(data.appreciation, margin + 160, scoreBoxY + 20, { width: contentWidth - 180 });

  // Stars
  doc
    .fillColor(scoreColor)
    .fontSize(14)
    .font("Helvetica")
    .text(getAppreciationEmoji(data.appreciation), margin + 160, scoreBoxY + 50, { width: contentWidth - 180 });

  doc.y = scoreBoxY + 95;
  doc.moveDown(0.5);

  // ─── SECTION TITLE HELPER ──────────────────────────────────────────────────
  function sectionTitle(title: string) {
    doc.moveDown(0.3);
    doc.rect(margin, doc.y, contentWidth, 24).fill("#4c1d95");
    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(title, margin + 10, doc.y + 6, { width: contentWidth - 20 });
    doc.y += 30;
    doc.moveDown(0.2);
  }

  // ─── CRITERIA DETAIL ───────────────────────────────────────────────────────
  sectionTitle("Evaluation Detaillee par Critere (Grille Officielle)");

  data.criteres.forEach((critere, index) => {
    // Check page space
    if (doc.y > 680) doc.addPage();

    const critereY = doc.y;
    const noteColor = getNoteColor(critere.note, critere.noteMax);
    const pct = Math.round((critere.note / critere.noteMax) * 100);

    // Critère header
    doc.rect(margin, critereY, contentWidth, 28).fill("#f8f7ff").stroke("#ddd6fe");

    // Number badge
    doc.circle(margin + 14, critereY + 14, 10).fill(noteColor);
    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`${index + 1}`, margin + 10, critereY + 8, { width: 20, align: "center" });

    // Critère name
    doc
      .fillColor("#1e1b4b")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(critere.nom, margin + 32, critereY + 8, { width: contentWidth - 100 });

    // Score badge
    doc
      .fillColor(noteColor)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${critere.note}/${critere.noteMax}`, pageWidth - margin - 60, critereY + 8, { width: 55, align: "right" });

    // Progress bar background
    const barY = critereY + 28;
    const barWidth = contentWidth;
    doc.rect(margin, barY, barWidth, 4).fill("#e5e7eb");
    doc.rect(margin, barY, (barWidth * pct) / 100, 4).fill(noteColor);

    doc.y = critereY + 40;

    // Comment
    doc
      .fillColor("#374151")
      .fontSize(9)
      .font("Helvetica")
      .text(critere.commentaire, margin + 10, doc.y, { width: contentWidth - 20 });
    doc.moveDown(0.3);

    // Points forts
    if (critere.points.length > 0) {
      doc.fillColor("#166534").fontSize(9).font("Helvetica-Bold").text("Points forts:", margin + 10, doc.y);
      critere.points.forEach((p) => {
        doc.fillColor("#166534").fontSize(8.5).font("Helvetica").text(`  + ${p}`, margin + 15, doc.y, { width: contentWidth - 25 });
      });
    }

    // Améliorations
    if (critere.ameliorations.length > 0) {
      doc.fillColor("#92400e").fontSize(9).font("Helvetica-Bold").text("Ameliorations:", margin + 10, doc.y);
      critere.ameliorations.forEach((a) => {
        doc.fillColor("#92400e").fontSize(8.5).font("Helvetica").text(`  > ${a}`, margin + 15, doc.y, { width: contentWidth - 25 });
      });
    }

    doc.moveDown(0.5);
  });

  // ─── STRENGTHS & IMPROVEMENTS ──────────────────────────────────────────────
  if (doc.y > 600) doc.addPage();

  const halfW = (contentWidth - 10) / 2;

  sectionTitle("Synthese: Points Forts et Points a Ameliorer");

  const synthY = doc.y;

  // Points forts box
  doc.rect(margin, synthY, halfW, 20).fill("#dcfce7").stroke("#86efac");
  doc.fillColor("#166534").fontSize(10).font("Helvetica-Bold").text("Points Forts", margin + 8, synthY + 5, { width: halfW - 16 });
  doc.y = synthY + 25;
  data.pointsForts.forEach((p) => {
    doc.fillColor("#166534").fontSize(9).font("Helvetica").text(`✓ ${p}`, margin + 8, doc.y, { width: halfW - 16 });
    doc.moveDown(0.15);
  });

  const rightColX = margin + halfW + 10;
  doc.y = synthY;

  // Points à améliorer box
  doc.rect(rightColX, synthY, halfW, 20).fill("#fef3c7").stroke("#fcd34d");
  doc.fillColor("#92400e").fontSize(10).font("Helvetica-Bold").text("Points a Ameliorer", rightColX + 8, synthY + 5, { width: halfW - 16 });
  doc.y = synthY + 25;
  data.pointsAmeliorer.forEach((p) => {
    doc.fillColor("#92400e").fontSize(9).font("Helvetica").text(`> ${p}`, rightColX + 8, doc.y, { width: halfW - 16 });
    doc.moveDown(0.15);
  });

  doc.y = synthY + 25 + Math.max(data.pointsForts.length, data.pointsAmeliorer.length) * 18 + 20;

  // ─── RECOMMENDATIONS ───────────────────────────────────────────────────────
  if (doc.y > 650) doc.addPage();

  sectionTitle("Recommandations de l'Inspecteur");

  doc.rect(margin, doc.y, contentWidth, 16).fill("#ede9fe");
  doc
    .fillColor("#4c1d95")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Avis de l'inspecteur pedagogique:", margin + 10, doc.y + 4, { width: contentWidth - 20 });
  doc.y += 22;

  doc
    .fillColor("#374151")
    .fontSize(10)
    .font("Helvetica")
    .text(data.recommandations, margin + 10, doc.y, { width: contentWidth - 20 });

  doc.moveDown(1);

  // ─── FOOTER ────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 50;
  doc.rect(0, footerY, pageWidth, 50).fill("#4c1d95");
  doc
    .fillColor("#c4b5fd")
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Leader Academy - Rapport genere le ${dateStr} | leaderacademy.school`,
      margin,
      footerY + 18,
      { align: "center", width: contentWidth }
    );

  return createPdfBuffer(doc);
}
