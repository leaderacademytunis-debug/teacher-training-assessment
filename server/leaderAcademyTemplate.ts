/**
 * Leader Academy Standard Template — نسخة تونس 2026
 * Professional Tunisian lesson plan (مذكرة) template
 * Follows the official Tunisian Ministry of Education structure:
 *   - Header: Logo + Title + QR Code
 *   - General Info Table (المعطيات العامة)
 *   - 3 Pedagogical Phases: Exploration → Analysis → Synthesis
 *   - Evaluation block
 *   - Tunisian identity footer
 */
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONTS_DIR = path.join(__dirname, "fonts");
const LOGO_CDN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/leader-academy-logo_866ef755.png";

// Academy brand colors
const COLORS = {
  primary: "#1a3a5c",
  secondary: "#2d7dd2",
  accent: "#f0a500",
  lightBg: "#f4f7fb",
  blockBg: "#eef3fa",
  border: "#c8d8ed",
  text: "#1a2535",
  mutedText: "#5a6a7e",
  white: "#ffffff",
  tunisiaRed: "#E70013",
  phase1: "#fff8e8",   // Exploration — warm yellow
  phase2: "#e8f4fd",   // Analysis — soft blue
  phase3: "#f0fff4",   // Synthesis — soft green
  evalBg: "#fff7ed",   // Evaluation — warm orange
};

function getLogoBase64(): string {
  // Try local file first, then CDN fallback is handled by getLogoBase64Async
  const logoPath = path.join(FONTS_DIR, "leader-academy-logo.png");
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoData.toString("base64")}`;
  }
  return "";
}

async function getLogoBase64Async(): Promise<string> {
  // Try local first
  const local = getLogoBase64();
  if (local) return local;
  // Fallback to CDN
  try {
    const resp = await fetch(LOGO_CDN_URL);
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch {}
  return "";
}

async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: { dark: COLORS.primary, light: COLORS.white },
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
}

export interface JathathaBlocData {
  // ─── General Info ───────────────────────────────────────────────────────────
  schoolYear: string;
  level: string;            // e.g. "السنة الأولى ابتدائي"
  subject: string;          // e.g. "القراءة" / "الإيقاظ العلمي"
  lessonTitle: string;
  sessionNumber?: string;   // رقم الحصة
  duration?: string;        // المدة الزمنية
  teacherName?: string;
  date?: string;
  schoolName?: string;      // اسم المدرسة
  textbookRef?: string;     // المرجع (كتاب التلميذ صفحة...)

  // ─── Competencies ───────────────────────────────────────────────────────────
  terminalCompetency?: string;   // الكفاية الختامية
  distinctiveObjective?: string; // الهدف المميز
  contentTarget?: string;        // المحتوى المستهدف
  materials?: string;            // الوسائل والأدوات

  // ─── Phase 1: Exploration (مرحلة الاستكشاف) ─────────────────────────────────
  explorationLaunch?: string;    // بناء نص الانطلاق
  scene1?: string;               // مشهد مصوّر 1 — وضعية المشكلة
  spontaneousReactions?: string; // ردود فعل تلقائية
  guidingQuestions?: string;     // توجيه المتعلمين
  scene2?: string;               // مشهد مصوّر 2
  hypotheses?: string;           // صياغة الفرضيات
  textBuilding?: string;         // إكمال بناء النص

  // ─── Phase 2: Analysis (مرحلة التحليل) ──────────────────────────────────────
  auditoryDiscrimination?: string;  // التمييز السمعي
  visualDiscrimination?: string;    // التمييز البصري
  letterExtraction?: string;        // استخراج الحرف / المفهوم
  readingActivities?: string;       // أنشطة القراءة
  writingActivities?: string;       // أنشطة الكتابة

  // ─── Phase 3: Synthesis (مرحلة التركيب) ─────────────────────────────────────
  textReading?: string;             // قراءة النص الكامل
  enrichmentActivities?: string;    // أنشطة الإثراء
  rhythmicGames?: string;           // ألعاب إيقاعية
  exercisesBook?: string;           // تمارين من كتاب التلميذ

  // ─── Evaluation ─────────────────────────────────────────────────────────────
  evaluation?: string;              // التقييم
  evaluationCriteria?: string;      // معايير التقييم

  // ─── Free / AI content ──────────────────────────────────────────────────────
  freeContent?: string;

  // ─── Meta ───────────────────────────────────────────────────────────────────
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

function renderPhaseBlock(
  phaseNumber: string,
  phaseTitle: string,
  phaseSubtitle: string,
  rows: Array<{ icon: string; label: string; content: string }>,
  bgColor: string,
  borderColor: string
): string {
  const validRows = rows.filter(r => r.content && r.content.trim());
  if (validRows.length === 0) return "";

  const rowsHtml = validRows.map(row => `
    <tr>
      <td class="phase-label">
        <span class="row-icon">${row.icon}</span>
        ${escapeHtml(row.label)}
      </td>
      <td class="phase-content">${escapeHtml(row.content)}</td>
    </tr>
  `).join("");

  return `
    <div class="phase-block" style="background:${bgColor}; border-right:5px solid ${borderColor};">
      <div class="phase-header" style="background:${borderColor};">
        <span class="phase-number">${phaseNumber}</span>
        <div class="phase-titles">
          <div class="phase-title">${phaseTitle}</div>
          <div class="phase-subtitle">${phaseSubtitle}</div>
        </div>
      </div>
      <table class="phase-table">
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderSimpleBlock(
  icon: string,
  title: string,
  content: string,
  bgColor: string,
  borderColor: string
): string {
  if (!content || !content.trim()) return "";
  return `
    <div class="simple-block" style="background:${bgColor}; border-right:4px solid ${borderColor};">
      <div class="simple-block-title" style="color:${borderColor};">
        <span>${icon}</span> ${escapeHtml(title)}
      </div>
      <div class="simple-block-content">${escapeHtml(content)}</div>
    </div>
  `;
}

export async function generateLeaderAcademyPDF(data: JathathaBlocData): Promise<string> {
  const logoBase64 = getLogoBase64();
  const qrUrl = data.qrUrl || "https://leaderacademy.school";
  const qrBase64 = await generateQRCode(qrUrl);

  const isArabic = data.language !== "french" && data.language !== "english";
  const isFrench = data.language === "french";

  const L = {
    // Labels
    generalInfo: isArabic ? "المعطيات العامة" : "Informations générales",
    schoolYear: isArabic ? "السنة الدراسية" : "Année scolaire",
    level: isArabic ? "المستوى" : "Niveau",
    subject: isArabic ? "المادة" : "Matière",
    lessonTitle: isArabic ? "عنوان الدرس" : "Titre de la leçon",
    sessionNumber: isArabic ? "رقم الحصة" : "N° de séance",
    duration: isArabic ? "المدة الزمنية" : "Durée",
    teacher: isArabic ? "المدرس/ة" : "Enseignant(e)",
    date: isArabic ? "التاريخ" : "Date",
    school: isArabic ? "المدرسة" : "École",
    textbookRef: isArabic ? "المرجع" : "Référence",

    // Competencies
    competencies: isArabic ? "الكفايات والأهداف" : "Compétences et objectifs",
    terminalComp: isArabic ? "الكفاية الختامية" : "Compétence terminale",
    distinctiveObj: isArabic ? "الهدف المميز" : "Objectif spécifique",
    contentTarget: isArabic ? "المحتوى المستهدف" : "Contenu ciblé",
    materials: isArabic ? "الوسائل والأدوات" : "Matériel et outils",

    // Phase 1
    phase1Title: isArabic ? "مرحلة الاستكشاف" : "Phase de Découverte",
    phase1Sub: isArabic ? "Exploration" : "Exploration",
    explorationLaunch: isArabic ? "بناء نص الانطلاق" : "Mise en situation",
    scene1: isArabic ? "المشهد المصوّر 1 — وضعية المشكلة" : "Scène 1 — Situation-problème",
    spontaneous: isArabic ? "ردود فعل تلقائية من التلاميذ" : "Réactions spontanées",
    guiding: isArabic ? "توجيه المتعلمين" : "Guidage des apprenants",
    scene2: isArabic ? "المشهد المصوّر 2" : "Scène 2",
    hypotheses: isArabic ? "صياغة الفرضيات" : "Formulation d'hypothèses",
    textBuilding: isArabic ? "إكمال بناء النص" : "Construction du texte",

    // Phase 2
    phase2Title: isArabic ? "مرحلة التحليل" : "Phase d'Analyse",
    phase2Sub: isArabic ? "Analyse" : "Analyse",
    auditoryDisc: isArabic ? "التمييز السمعي" : "Discrimination auditive",
    visualDisc: isArabic ? "التمييز البصري" : "Discrimination visuelle",
    letterExt: isArabic ? "استخراج الحرف / المفهوم" : "Extraction du concept",
    readingAct: isArabic ? "أنشطة القراءة" : "Activités de lecture",
    writingAct: isArabic ? "أنشطة الكتابة" : "Activités d'écriture",

    // Phase 3
    phase3Title: isArabic ? "مرحلة التركيب" : "Phase de Synthèse",
    phase3Sub: isArabic ? "Synthèse" : "Synthèse",
    textReading: isArabic ? "قراءة النص الكامل" : "Lecture du texte complet",
    enrichment: isArabic ? "أنشطة الإثراء" : "Activités d'enrichissement",
    rhythmic: isArabic ? "ألعاب إيقاعية" : "Jeux rythmiques",
    exercises: isArabic ? "تمارين من كتاب التلميذ" : "Exercices du manuel",

    // Evaluation
    evaluation: isArabic ? "التقييم" : "Évaluation",
    evalCriteria: isArabic ? "معايير التقييم" : "Critères d'évaluation",
    freeContent: isArabic ? "المحتوى البيداغوجي" : "Contenu pédagogique",

    // Footer
    republic: isArabic ? "الجمهورية التونسية" : "République Tunisienne",
    tagline: isArabic ? "نحو تعليم رقمي متميز" : "Pour une éducation numérique d'excellence",
    scanQR: isArabic ? "امسح للمعاينة" : "Scanner pour aperçu",
    headerTitle: isArabic ? "المساعد البيداغوجي الذكي" : "Assistant Pédagogique Intelligent",
    headerSub: isArabic ? "نسخة تونس 2026 — المقاربة بالكفايات (APC)" : "Tunisie 2026 — Approche Par Compétences (APC)",
    badge: "Leader Academy Standard ✦",
    jathatha: isArabic ? "مذكرة بيداغوجية" : "Fiche pédagogique",
  };

  // ── Info table ──────────────────────────────────────────────────────────────
  const infoRows = [
    { label: L.schoolYear, value: data.schoolYear },
    { label: L.level, value: data.level },
    { label: L.subject, value: data.subject },
    { label: L.lessonTitle, value: data.lessonTitle },
    data.sessionNumber ? { label: L.sessionNumber, value: data.sessionNumber } : null,
    data.duration ? { label: L.duration, value: data.duration } : null,
    data.teacherName ? { label: L.teacher, value: data.teacherName } : null,
    data.date ? { label: L.date, value: data.date } : null,
    data.schoolName ? { label: L.school, value: data.schoolName } : null,
    data.textbookRef ? { label: L.textbookRef, value: data.textbookRef } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const infoTableHtml = infoRows.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? COLORS.white : COLORS.lightBg}">
      <td class="info-label">${escapeHtml(row.label)}</td>
      <td class="info-value">${escapeHtml(row.value)}</td>
    </tr>
  `).join("");

  // ── Competencies block ──────────────────────────────────────────────────────
  const hasCompetencies = data.terminalCompetency || data.distinctiveObjective || data.contentTarget || data.materials;
  const competenciesHtml = hasCompetencies ? `
    <div class="section-title"><span>🎯</span> ${L.competencies}</div>
    <div class="competencies-grid">
      ${data.terminalCompetency ? renderSimpleBlock("🏆", L.terminalComp, data.terminalCompetency, "#fff8e8", "#b8860b") : ""}
      ${data.distinctiveObjective ? renderSimpleBlock("📌", L.distinctiveObj, data.distinctiveObjective, "#e8f4fd", COLORS.secondary) : ""}
      ${data.contentTarget ? renderSimpleBlock("📚", L.contentTarget, data.contentTarget, "#f0f8f0", "#2d8a4e") : ""}
      ${data.materials ? renderSimpleBlock("🧰", L.materials, data.materials, "#faf0ff", "#7c3aed") : ""}
    </div>
  ` : "";

  // ── Phase 1: Exploration ────────────────────────────────────────────────────
  const phase1Html = renderPhaseBlock(
    "1",
    L.phase1Title,
    L.phase1Sub,
    [
      { icon: "📖", label: L.explorationLaunch, content: data.explorationLaunch || "" },
      { icon: "🖼️", label: L.scene1, content: data.scene1 || "" },
      { icon: "💬", label: L.spontaneous, content: data.spontaneousReactions || "" },
      { icon: "❓", label: L.guiding, content: data.guidingQuestions || "" },
      { icon: "🖼️", label: L.scene2, content: data.scene2 || "" },
      { icon: "💡", label: L.hypotheses, content: data.hypotheses || "" },
      { icon: "✍️", label: L.textBuilding, content: data.textBuilding || "" },
    ],
    COLORS.phase1,
    "#b8860b"
  );

  // ── Phase 2: Analysis ───────────────────────────────────────────────────────
  const phase2Html = renderPhaseBlock(
    "2",
    L.phase2Title,
    L.phase2Sub,
    [
      { icon: "👂", label: L.auditoryDisc, content: data.auditoryDiscrimination || "" },
      { icon: "👁️", label: L.visualDisc, content: data.visualDiscrimination || "" },
      { icon: "🔤", label: L.letterExt, content: data.letterExtraction || "" },
      { icon: "📖", label: L.readingAct, content: data.readingActivities || "" },
      { icon: "✏️", label: L.writingAct, content: data.writingActivities || "" },
    ],
    COLORS.phase2,
    COLORS.secondary
  );

  // ── Phase 3: Synthesis ──────────────────────────────────────────────────────
  const phase3Html = renderPhaseBlock(
    "3",
    L.phase3Title,
    L.phase3Sub,
    [
      { icon: "📚", label: L.textReading, content: data.textReading || "" },
      { icon: "🌟", label: L.enrichment, content: data.enrichmentActivities || "" },
      { icon: "🎵", label: L.rhythmic, content: data.rhythmicGames || "" },
      { icon: "📝", label: L.exercises, content: data.exercisesBook || "" },
    ],
    COLORS.phase3,
    "#15803d"
  );

  // ── Evaluation ──────────────────────────────────────────────────────────────
  const evalHtml = (data.evaluation || data.evaluationCriteria) ? `
    <div class="section-title"><span>📊</span> ${L.evaluation}</div>
    <div class="eval-container">
      ${data.evaluation ? renderSimpleBlock("📝", L.evaluation, data.evaluation, COLORS.evalBg, "#c2410c") : ""}
      ${data.evaluationCriteria ? renderSimpleBlock("✅", L.evalCriteria, data.evaluationCriteria, "#f0fff4", "#15803d") : ""}
    </div>
  ` : "";

  // ── Free content (AI suggestions) ──────────────────────────────────────────
  const freeHtml = data.freeContent ? `
    <div class="section-title"><span>🤖</span> ${L.freeContent}</div>
    ${renderSimpleBlock("📄", L.freeContent, data.freeContent, COLORS.blockBg, COLORS.primary)}
  ` : "";

  const html = `<!DOCTYPE html>
<html dir="${isArabic ? "rtl" : "ltr"}" lang="${isArabic ? "ar" : isFrench ? "fr" : "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${L.jathatha} — Leader Academy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Amiri', 'Cairo', 'Traditional Arabic', serif;
      background: ${COLORS.white};
      color: ${COLORS.text};
      font-size: 12.5pt;
      line-height: 1.75;
      direction: ${isArabic ? "rtl" : "ltr"};
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: ${COLORS.white};
    }

    /* ===== HEADER ===== */
    .header {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .header-logo {
      width: 85px; height: auto; object-fit: contain; flex-shrink: 0;
      filter: brightness(0) invert(1);
    }
    .header-center { flex: 1; text-align: center; color: ${COLORS.white}; }
    .header-title {
      font-family: 'Cairo', sans-serif; font-size: 15pt; font-weight: 800;
      margin-bottom: 3px;
    }
    .header-subtitle { font-size: 9.5pt; opacity: 0.85; }
    .header-badge {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px; padding: 2px 12px; font-size: 8.5pt; margin-top: 5px;
      display: inline-block; color: ${COLORS.accent}; font-weight: 700;
    }
    .header-qr { flex-shrink: 0; text-align: center; }
    .header-qr img {
      width: 68px; height: 68px; border-radius: 6px; background: white; padding: 3px;
    }
    .header-qr-label { color: rgba(255,255,255,0.7); font-size: 7pt; margin-top: 3px; }

    /* ===== CONTENT ===== */
    .content { padding: 16px 20px; }

    .section-title {
      font-family: 'Cairo', sans-serif; font-size: 11pt; font-weight: 700;
      color: ${COLORS.primary}; border-bottom: 2px solid ${COLORS.accent};
      padding-bottom: 4px; margin-bottom: 10px; margin-top: 16px;
      display: flex; align-items: center; gap: 6px;
    }

    /* ===== INFO TABLE ===== */
    .info-table {
      width: 100%; border-collapse: collapse; border-radius: 10px;
      overflow: hidden; border: 1px solid ${COLORS.border}; margin-bottom: 4px;
    }
    .info-table td { padding: 7px 13px; border-bottom: 1px solid ${COLORS.border}; vertical-align: top; }
    .info-label {
      background: ${COLORS.primary}; color: ${COLORS.white}; font-weight: 700;
      width: 32%; font-size: 10.5pt; white-space: nowrap;
    }
    .info-value { font-size: 11.5pt; color: ${COLORS.text}; }

    /* ===== COMPETENCIES GRID ===== */
    .competencies-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }

    /* ===== SIMPLE BLOCK ===== */
    .simple-block {
      border-radius: 8px; padding: 10px 14px; border: 1px solid ${COLORS.border};
      page-break-inside: avoid;
    }
    .simple-block-title {
      font-family: 'Cairo', sans-serif; font-size: 11pt; font-weight: 700;
      margin-bottom: 6px; display: flex; align-items: center; gap: 5px;
    }
    .simple-block-content { font-size: 11.5pt; line-height: 1.8; color: ${COLORS.text}; }

    /* ===== PHASE BLOCKS ===== */
    .phase-block {
      border-radius: 10px; overflow: hidden; border: 1px solid ${COLORS.border};
      margin-bottom: 12px; page-break-inside: avoid;
    }
    .phase-header {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 16px; color: white;
    }
    .phase-number {
      font-family: 'Cairo', sans-serif; font-size: 18pt; font-weight: 800;
      background: rgba(255,255,255,0.2); border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .phase-titles { }
    .phase-title { font-family: 'Cairo', sans-serif; font-size: 12pt; font-weight: 700; }
    .phase-subtitle { font-size: 9pt; opacity: 0.85; font-style: italic; }

    .phase-table { width: 100%; border-collapse: collapse; }
    .phase-table tr { border-bottom: 1px solid ${COLORS.border}; }
    .phase-table tr:last-child { border-bottom: none; }
    .phase-label {
      background: rgba(255,255,255,0.6); font-weight: 700; font-size: 10.5pt;
      padding: 8px 13px; width: 30%; vertical-align: top; white-space: nowrap;
      color: ${COLORS.primary};
    }
    .row-icon { margin-left: 4px; margin-right: 4px; }
    .phase-content { padding: 8px 13px; font-size: 11.5pt; line-height: 1.8; vertical-align: top; }

    /* ===== EVAL ===== */
    .eval-container { display: flex; flex-direction: column; gap: 8px; }

    /* ===== FOOTER ===== */
    .footer {
      background: ${COLORS.primary}; padding: 10px 20px;
      display: flex; align-items: center; justify-content: space-between; margin-top: 20px;
    }
    .footer-text { color: rgba(255,255,255,0.8); font-size: 9pt; }
    .footer-brand { color: ${COLORS.accent}; font-weight: 700; font-size: 10pt; }
    .footer-flag { display: flex; align-items: center; gap: 6px; }
    .tunisia-flag {
      width: 30px; height: 20px; background: ${COLORS.tunisiaRed};
      border-radius: 2px; position: relative; overflow: hidden;
      display: inline-block; flex-shrink: 0;
    }
    .tunisia-flag::before {
      content: ''; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); width: 14px; height: 14px;
      background: white; border-radius: 50%;
    }
    .tunisia-flag::after {
      content: '☪'; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); color: ${COLORS.tunisiaRed};
      font-size: 8px; line-height: 1;
    }
    .footer-country { color: rgba(255,255,255,0.7); font-size: 9pt; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- ═══ HEADER ═══ -->
    <div class="header">
      ${logoBase64
        ? `<img src="${logoBase64}" alt="Leader Academy" class="header-logo">`
        : `<div style="color:white;font-weight:800;font-size:13pt;width:85px;font-family:Cairo,sans-serif">Leader<br>Academy</div>`
      }
      <div class="header-center">
        <div class="header-title">${L.headerTitle}</div>
        <div class="header-subtitle">${L.headerSub}</div>
        <div class="header-badge">${L.badge}</div>
      </div>
      <div class="header-qr">
        ${qrBase64
          ? `<img src="${qrBase64}" alt="QR Code">`
          : `<div style="width:68px;height:68px;background:rgba(255,255,255,0.2);border-radius:6px;"></div>`
        }
        <div class="header-qr-label">${L.scanQR}</div>
      </div>
    </div>

    <!-- ═══ CONTENT ═══ -->
    <div class="content">

      <!-- General Info -->
      <div class="section-title"><span>📋</span> ${L.generalInfo}</div>
      <table class="info-table">
        <tbody>${infoTableHtml}</tbody>
      </table>

      <!-- Competencies -->
      ${competenciesHtml}

      <!-- Phases -->
      ${(phase1Html || phase2Html || phase3Html) ? `
        <div class="section-title"><span>🏫</span> ${isArabic ? "المسار البيداغوجي" : "Démarche pédagogique"}</div>
        ${phase1Html}
        ${phase2Html}
        ${phase3Html}
      ` : ""}

      <!-- Evaluation -->
      ${evalHtml}

      <!-- Free / AI content -->
      ${freeHtml}

    </div>

    <!-- ═══ FOOTER ═══ -->
    <div class="footer">
      <div class="footer-flag">
        <div class="tunisia-flag"></div>
        <span class="footer-country">${L.republic}</span>
      </div>
      <div class="footer-text">
        <span class="footer-brand">Leader Academy</span>
        ${isArabic ? " — " + L.tagline : " — " + L.tagline}
      </div>
      <div class="footer-text">leaderacademy.school</div>
    </div>

  </div>
</body>
</html>`;

  return html;
}
