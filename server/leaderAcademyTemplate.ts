/**
 * Leader Academy Standard Template
 * Professional pedagogical sheet (Jathatha) template for Tunisian teachers
 * Features:
 *  - Smart Header: Logo (right) + Title (center) + QR Code (left)
 *  - Rounded table blocks with academy colors
 *  - Amiri Arabic font
 *  - Tunisian flag in footer
 */
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONTS_DIR = path.join(__dirname, "fonts");

// Academy brand colors
const COLORS = {
  primary: "#1a3a5c",      // Deep navy blue
  secondary: "#2d7dd2",    // Academy blue
  accent: "#f0a500",       // Gold accent
  lightBg: "#f4f7fb",      // Light grey-blue background
  blockBg: "#eef3fa",      // Block background
  border: "#c8d8ed",       // Soft border
  text: "#1a2535",         // Dark text
  mutedText: "#5a6a7e",    // Muted text
  white: "#ffffff",
  tunisiaRed: "#E70013",
};

function getLogoBase64(): string {
  const logoPath = path.join(FONTS_DIR, "leader-academy-logo.png");
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoData.toString("base64")}`;
  }
  return "";
}

async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: COLORS.primary,
        light: COLORS.white,
      },
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
}

export interface JathathaBlocData {
  // Header info
  schoolYear: string;
  level: string;       // e.g. "السنة الثالثة ابتدائي"
  subject: string;     // e.g. "الإيقاظ العلمي"
  lessonTitle: string;
  duration?: string;
  teacherName?: string;
  date?: string;

  // Pedagogical content
  terminalCompetency?: string;  // الكفاية الختامية
  distinctiveObjective?: string; // الهدف المميز
  materials?: string;            // الوسائل

  // Lesson stages
  problemSituation?: string;   // وضعية المشكلة
  hypotheses?: string;         // الفرضيات
  verification?: string;       // التحقق
  conclusion?: string;         // الاستنتاج
  evaluation?: string;         // التقييم

  // Free content (for AI suggestions)
  freeContent?: string;

  // QR Code URL
  qrUrl?: string;
  language?: "arabic" | "french" | "english";
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function renderBlock(
  icon: string,
  title: string,
  content: string,
  bgColor: string = COLORS.blockBg,
  titleColor: string = COLORS.primary
): string {
  if (!content) return "";
  return `
    <div class="block" style="background:${bgColor}; border-right:4px solid ${titleColor};">
      <div class="block-title" style="color:${titleColor};">
        <span class="block-icon">${icon}</span>
        ${escapeHtml(title)}
      </div>
      <div class="block-content">${escapeHtml(content)}</div>
    </div>
  `;
}

export async function generateLeaderAcademyPDF(data: JathathaBlocData): Promise<string> {
  const logoBase64 = getLogoBase64();
  const qrUrl = data.qrUrl || "https://leaderacademy.school";
  const qrBase64 = await generateQRCode(qrUrl);

  const isArabic = data.language !== "french" && data.language !== "english";

  // Build the info table rows
  const infoRows = [
    { label: isArabic ? "السنة الدراسية" : "Année scolaire", value: data.schoolYear },
    { label: isArabic ? "المستوى" : "Niveau", value: data.level },
    { label: isArabic ? "المادة" : "Matière", value: data.subject },
    { label: isArabic ? "عنوان الدرس" : "Titre de la leçon", value: data.lessonTitle },
    data.duration ? { label: isArabic ? "المدة" : "Durée", value: data.duration } : null,
    data.teacherName ? { label: isArabic ? "المدرس/ة" : "Enseignant(e)", value: data.teacherName } : null,
    data.date ? { label: isArabic ? "التاريخ" : "Date", value: data.date } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const infoTableHtml = infoRows.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? COLORS.white : COLORS.lightBg}">
      <td class="info-label">${escapeHtml(row.label)}</td>
      <td class="info-value">${escapeHtml(row.value)}</td>
    </tr>
  `).join("");

  // Build pedagogical blocks
  const pedagogicalBlocks = [
    data.terminalCompetency ? renderBlock("🎯", isArabic ? "الكفاية الختامية" : "Compétence terminale", data.terminalCompetency, "#fff8e8", "#b8860b") : "",
    data.distinctiveObjective ? renderBlock("📌", isArabic ? "الهدف المميز" : "Objectif spécifique", data.distinctiveObjective, "#e8f4fd", COLORS.secondary) : "",
    data.materials ? renderBlock("🧰", isArabic ? "الوسائل" : "Matériel", data.materials, "#f0f8f0", "#2d8a4e") : "",
    data.problemSituation ? renderBlock("❓", isArabic ? "وضعية المشكلة" : "Situation-problème", data.problemSituation, "#fef3f3", "#c0392b") : "",
    data.hypotheses ? renderBlock("💡", isArabic ? "الفرضيات" : "Hypothèses", data.hypotheses, "#f5f0ff", "#7c3aed") : "",
    data.verification ? renderBlock("🔬", isArabic ? "التحقق والاستقصاء" : "Vérification", data.verification, "#f0fbf8", "#0d9488") : "",
    data.conclusion ? renderBlock("✅", isArabic ? "الاستنتاج" : "Conclusion", data.conclusion, "#f0fff4", "#15803d") : "",
    data.evaluation ? renderBlock("📝", isArabic ? "التقييم" : "Évaluation", data.evaluation, "#fff7ed", "#c2410c") : "",
    data.freeContent ? renderBlock("📄", isArabic ? "المحتوى البيداغوجي" : "Contenu pédagogique", data.freeContent, COLORS.blockBg, COLORS.primary) : "",
  ].join("");

  const html = `<!DOCTYPE html>
<html dir="${isArabic ? "rtl" : "ltr"}" lang="${isArabic ? "ar" : data.language === "french" ? "fr" : "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>جذاذة بيداغوجية — Leader Academy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Amiri', 'Cairo', 'Traditional Arabic', serif;
      background: ${COLORS.white};
      color: ${COLORS.text};
      font-size: 13pt;
      line-height: 1.7;
      direction: ${isArabic ? "rtl" : "ltr"};
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      background: ${COLORS.white};
    }

    /* ===== HEADER ===== */
    .header {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .header-logo {
      width: 90px;
      height: auto;
      object-fit: contain;
      flex-shrink: 0;
      filter: brightness(0) invert(1);
    }

    .header-center {
      flex: 1;
      text-align: center;
      color: ${COLORS.white};
    }

    .header-title {
      font-family: 'Cairo', 'Amiri', sans-serif;
      font-size: 15pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .header-subtitle {
      font-size: 10pt;
      opacity: 0.85;
      font-weight: 400;
    }

    .header-badge {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      padding: 3px 12px;
      font-size: 9pt;
      margin-top: 6px;
      display: inline-block;
      color: ${COLORS.accent};
      font-weight: 600;
    }

    .header-qr {
      flex-shrink: 0;
      text-align: center;
    }

    .header-qr img {
      width: 70px;
      height: 70px;
      border-radius: 6px;
      background: white;
      padding: 3px;
    }

    .header-qr-label {
      color: rgba(255,255,255,0.7);
      font-size: 7pt;
      margin-top: 3px;
      text-align: center;
    }

    /* ===== CONTENT ===== */
    .content {
      padding: 18px 20px;
    }

    /* ===== INFO TABLE ===== */
    .section-title {
      font-family: 'Cairo', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: ${COLORS.primary};
      border-bottom: 2px solid ${COLORS.accent};
      padding-bottom: 5px;
      margin-bottom: 10px;
      margin-top: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid ${COLORS.border};
      margin-bottom: 16px;
      font-size: 12pt;
    }

    .info-table td {
      padding: 8px 14px;
      border-bottom: 1px solid ${COLORS.border};
      vertical-align: top;
    }

    .info-label {
      background: ${COLORS.primary};
      color: ${COLORS.white};
      font-weight: 700;
      width: 35%;
      font-size: 11pt;
      white-space: nowrap;
    }

    .info-value {
      font-size: 12pt;
      color: ${COLORS.text};
    }

    /* ===== BLOCKS ===== */
    .blocks-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .block {
      border-radius: 10px;
      padding: 12px 16px;
      border: 1px solid ${COLORS.border};
      page-break-inside: avoid;
    }

    .block-title {
      font-family: 'Cairo', sans-serif;
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .block-icon {
      font-size: 14pt;
    }

    .block-content {
      font-size: 12pt;
      line-height: 1.8;
      color: ${COLORS.text};
    }

    /* ===== FOOTER ===== */
    .footer {
      background: ${COLORS.primary};
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;
    }

    .footer-text {
      color: rgba(255,255,255,0.8);
      font-size: 9pt;
    }

    .footer-brand {
      color: ${COLORS.accent};
      font-weight: 700;
      font-size: 10pt;
    }

    .footer-flag {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Tunisia flag CSS */
    .tunisia-flag {
      width: 30px;
      height: 20px;
      background: ${COLORS.tunisiaRed};
      border-radius: 2px;
      position: relative;
      overflow: hidden;
      display: inline-block;
      flex-shrink: 0;
    }

    .tunisia-flag::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
    }

    .tunisia-flag::after {
      content: '☪';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${COLORS.tunisiaRed};
      font-size: 8px;
      line-height: 1;
    }

    .footer-country {
      color: rgba(255,255,255,0.7);
      font-size: 9pt;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      ${logoBase64
        ? `<img src="${logoBase64}" alt="Leader Academy" class="header-logo">`
        : `<div style="color:white;font-weight:bold;font-size:12pt;width:90px">Leader<br>Academy</div>`
      }

      <div class="header-center">
        <div class="header-title">المساعد البيداغوجي الذكي</div>
        <div class="header-subtitle">نسخة تونس 2026 — المقاربة بالكفايات (APC)</div>
        <div class="header-badge">Leader Academy Standard ✦</div>
      </div>

      <div class="header-qr">
        ${qrBase64
          ? `<img src="${qrBase64}" alt="QR Code">`
          : `<div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:6px;"></div>`
        }
        <div class="header-qr-label">${isArabic ? "امسح للمعاينة" : "Scanner pour aperçu"}</div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">

      <!-- INFO TABLE -->
      <div class="section-title">
        <span>📋</span>
        ${isArabic ? "المعطيات العامة" : "Informations générales"}
      </div>
      <table class="info-table">
        <tbody>
          ${infoTableHtml}
        </tbody>
      </table>

      <!-- PEDAGOGICAL BLOCKS -->
      <div class="section-title">
        <span>🏫</span>
        ${isArabic ? "المسار البيداغوجي" : "Démarche pédagogique"}
      </div>
      <div class="blocks-container">
        ${pedagogicalBlocks}
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-flag">
        <div class="tunisia-flag"></div>
        <span class="footer-country">${isArabic ? "الجمهورية التونسية" : "République Tunisienne"}</span>
      </div>
      <div class="footer-text">
        <span class="footer-brand">Leader Academy</span>
        ${isArabic ? " — نحو تعليم رقمي متميز" : " — Pour une éducation numérique d'excellence"}
      </div>
      <div class="footer-text">leaderacademy.school</div>
    </div>

  </div>
</body>
</html>`;

  return html;
}
