import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ShadingType, Table, TableRow, TableCell, WidthType, ImageRun } from "docx";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import https from "https";
import http from "http";
import reshaperModule from "arabic-reshaper";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bidiModule from "bidi-js/dist/bidi.mjs";
import { createPDF } from "./pdfGenerator";

const __filename_exp = fileURLToPath(import.meta.url);
const __dirname_exp = path.dirname(__filename_exp);

// Arabic text processing for pdfkit
// arabic-reshaper ESM exports { default: { convertArabic } }
// bidi-js ESM exports { default: fn(text) => { getEmbeddingLevels, getReorderedString } }
const reshaper = (reshaperModule as any).default ?? reshaperModule;
const bidiLib = (bidiModule as any).default ?? bidiModule;

function processArabicForPdf(text: string): string {
  try {
    const reshaped = reshaper.convertArabic(text);
    const bidiObj = bidiLib(reshaped);
    const levels = bidiObj.getEmbeddingLevels(reshaped);
    return bidiObj.getReorderedString(reshaped, levels);
  } catch {
    return text;
  }
}

// Create PDF buffer from PDFDocument
function createPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    doc.end();
  });
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  timestamp: number;
}

interface ConversationExportData {
  title: string;
  messages: Message[];
  createdAt: Date;
  subject?: string;
  level?: string;
  language?: string;
  schoolName?: string;
  teacherName?: string;
  exportDate?: string;
  schoolLogoUrl?: string;
}

/**
 * Extract the last assistant message (the lesson plan) from the conversation.
 * Returns the content of the last assistant message.
 */
function extractLastLessonPlan(messages: Message[]): string {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  if (assistantMessages.length === 0) return "";
  return assistantMessages[assistantMessages.length - 1].content;
}

/**
 * Convert simple Markdown to HTML for clean PDF rendering.
 * Handles: headings (#, ##, ###), bold (**text**), tables (|...|), horizontal rules (---), lists (-, *), and paragraphs.
 */
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inTable = false;
  let tableRows: string[] = [];
  let inList = false;

  const flushTable = () => {
    if (tableRows.length === 0) return;
    let tableHtml = '<table class="md-table">';
    tableRows.forEach((row, idx) => {
      // Skip separator rows (---|---|---)
      if (/^\|[\s\-|:]+\|$/.test(row.trim())) return;
      const cells = row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());
      const tag = idx === 0 ? "th" : "td";
      tableHtml += "<tr>" + cells.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
    });
    tableHtml += "</table>";
    html += tableHtml;
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row detection
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (/^### (.+)/.test(line)) {
      flushList();
      html += `<h3>${line.replace(/^### /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</h3>`;
    } else if (/^## (.+)/.test(line)) {
      flushList();
      html += `<h2>${line.replace(/^## /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</h2>`;
    } else if (/^# (.+)/.test(line)) {
      flushList();
      html += `<h1>${line.replace(/^# /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</h1>`;
    }
    // Horizontal rule
    else if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      flushList();
      html += '<hr class="md-hr"/>';
    }
    // List items
    else if (/^[-*] (.+)/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      const itemContent = line.replace(/^[-*] /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html += `<li>${itemContent}</li>`;
    }
    // Numbered list
    else if (/^\d+\. (.+)/.test(line)) {
      flushList();
      const itemContent = line.replace(/^\d+\. /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html += `<p class="numbered">${itemContent}</p>`;
    }
    // Empty line
    else if (line.trim() === "") {
      flushList();
      html += "<br/>";
    }
    // Normal paragraph
    else {
      flushList();
      const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
      html += `<p>${formatted}</p>`;
    }
  }

  flushList();
  if (inTable) flushTable();

  return html;
}

/**
 * Export the clean lesson plan (last assistant message only) as PDF.
 * Produces a professional, print-ready document without chat messages.
 */
export async function exportCleanNotePDF(data: ConversationExportData): Promise<Buffer> {
  const lessonContent = extractLastLessonPlan(data.messages);
  const bodyHtml = markdownToHtml(lessonContent);

  const isRTL = data.language !== "fr" && data.language !== "en";
  const dir = isRTL ? "rtl" : "ltr";
  const lang = isRTL ? "ar" : data.language === "fr" ? "fr" : "en";

  const institutionLabel = isRTL ? "ليدر أكاديمي — منصة تأهيل المدرسين" : "Leader Academy — Plateforme de Formation des Enseignants";
  const dateLabel = isRTL ? "تاريخ الإعداد" : "Date de préparation";
  const subjectLabel = isRTL ? "المادة" : "Matière";
  const levelLabel = isRTL ? "المستوى" : "Niveau";
  const schoolLabel = isRTL ? "المؤسسة" : "École";
  const teacherLabel = isRTL ? "المعلم" : "Enseignant(e)";

  // Resolve display date: prefer exportDate field, fallback to createdAt
  const displayDate = data.exportDate
    ? new Date(data.exportDate).toLocaleDateString(isRTL ? "ar-TN" : "fr-TN")
    : data.createdAt.toLocaleDateString(isRTL ? "ar-TN" : "fr-TN");

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: ${isRTL ? "'Cairo', 'Amiri', Arial" : "'Arial', sans-serif"};
          direction: ${dir};
          text-align: ${isRTL ? "right" : "left"};
          padding: 50px 55px;
          max-width: 860px;
          margin: 0 auto;
          color: #1a1a2e;
          font-size: 13.5px;
          line-height: 1.75;
        }

        /* ── Header ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1e3a5f;
          padding-bottom: 18px;
          margin-bottom: 28px;
          gap: 12px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .school-logo {
          height: 64px;
          width: auto;
          max-width: 120px;
          object-fit: contain;
        }
        .header-institution {
          font-size: 11px;
          color: #555;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .header-meta {
          font-size: 11px;
          color: #555;
          text-align: ${isRTL ? "left" : "right"};
        }
        .header-meta span { display: block; }

        /* ── Document title ── */
        .doc-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e3a5f;
          text-align: center;
          margin-bottom: 32px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%);
          border-radius: 8px;
          border: 1px solid #c7d2fe;
        }

        /* ── Markdown content ── */
        h1 { font-size: 17px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; margin: 24px 0 12px; }
        h2 { font-size: 15px; color: #1e4d8c; border-right: ${isRTL ? "4px solid #3b82f6" : "none"}; border-left: ${isRTL ? "none" : "4px solid #3b82f6"}; padding-${isRTL ? "right" : "left"}: 10px; margin: 20px 0 10px; background: #f0f7ff; padding-top: 5px; padding-bottom: 5px; border-radius: 4px; }
        h3 { font-size: 14px; color: #1e6091; margin: 16px 0 8px; }
        p { margin: 6px 0; }
        strong { color: #1a1a2e; }
        ul { margin: 8px 0 8px 20px; padding: 0; }
        li { margin: 4px 0; list-style-type: disc; }
        .numbered { margin: 4px 0 4px 20px; }
        hr.md-hr { border: none; border-top: 1.5px solid #d1d5db; margin: 18px 0; }
        br { display: block; margin: 4px 0; }

        /* ── Tables ── */
        table.md-table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 12.5px;
        }
        table.md-table th {
          background-color: #1e3a5f;
          color: white;
          padding: 8px 12px;
          text-align: ${isRTL ? "right" : "left"};
          font-weight: 600;
        }
        table.md-table td {
          padding: 7px 12px;
          border: 1px solid #d1d5db;
          text-align: ${isRTL ? "right" : "left"};
        }
        table.md-table tr:nth-child(even) td { background-color: #f8fafc; }

        /* ── Footer ── */
        .footer {
          margin-top: 40px;
          padding-top: 14px;
          border-top: 1px solid #d1d5db;
          font-size: 10px;
          color: #9ca3af;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          ${data.schoolLogoUrl ? `<img src="${data.schoolLogoUrl}" alt="school logo" class="school-logo" />` : ""}
          <div class="header-institution">${institutionLabel}</div>
        </div>
        <div class="header-meta">
          ${data.schoolName ? `<span>${schoolLabel}: <strong>${data.schoolName}</strong></span>` : ""}
          ${data.teacherName ? `<span>${teacherLabel}: <strong>${data.teacherName}</strong></span>` : ""}
          ${data.subject ? `<span>${subjectLabel}: <strong>${data.subject}</strong></span>` : ""}
          ${data.level ? `<span>${levelLabel}: <strong>${data.level}</strong></span>` : ""}
          <span>${dateLabel}: ${displayDate}</span>
        </div>
      </div>

      <div class="doc-title">${data.title}</div>

      <div class="content">
        ${bodyHtml}
      </div>

      <div class="footer">
        ${institutionLabel} &nbsp;|&nbsp; leaderacademy.school
      </div>
    </body>
    </html>
  `;

  return await createPDF(htmlContent);
}

/**
 * Generate PDF from Markdown content using pdfkit (no Chromium required).
 * Supports Arabic RTL, tables, headings, bold, lists.
 */
async function downloadFontBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function createPdfFromMarkdown(markdown: string, data: ConversationExportData): Promise<Buffer> {
  const isRTL = data.language !== "fr" && data.language !== "en";
  const fontPath = path.join(__dirname_exp, "fonts", "Amiri-Regular.ttf");
  const fontBoldPath = path.join(__dirname_exp, "fonts", "Amiri-Bold.ttf");
  const FONT_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/Amiri-Regular_cfc49f25.ttf";
  const FONT_BOLD_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/Amiri-Bold_0cd66c9b.ttf";

  // Load font: prefer local file, fallback to CDN
  let fontSource: string | Buffer = fontPath;
  let fontBoldSource: string | Buffer = fontBoldPath;
  if (!existsSync(fontPath)) {
    try { fontSource = await downloadFontBuffer(FONT_CDN); } catch { /* use default */ }
  }
  if (!existsSync(fontBoldPath)) {
    try { fontBoldSource = await downloadFontBuffer(FONT_BOLD_CDN); } catch { fontBoldSource = fontSource; }
  }

  const doc = new PDFDocument({ size: "A4", margin: 40, info: { Title: data.title } });
  doc.registerFont("Arabic", fontSource as any);
  doc.registerFont("ArabicBold", fontBoldSource as any);

  const pageW = doc.page.width - 80; // usable width
  const ar = (t: string) => isRTL ? processArabicForPdf(t) : t;
  const font = isRTL ? "Arabic" : "Helvetica";
  const fontBold = isRTL ? "ArabicBold" : "Helvetica-Bold";
  const align = isRTL ? "right" : "left";

  // ── Header ──
  const institutionLabel = isRTL ? "ليدر أكاديمي — منصة تأهيل المدرسين" : "Leader Academy — Plateforme de Formation";
  const displayDate = data.exportDate
    ? new Date(data.exportDate).toLocaleDateString(isRTL ? "ar-TN" : "fr-TN")
    : data.createdAt.toLocaleDateString(isRTL ? "ar-TN" : "fr-TN");

  // Logo (if provided, download and embed)
  if (data.schoolLogoUrl) {
    try {
      const logoBuffer: Buffer = await new Promise((resolve, reject) => {
        const client = data.schoolLogoUrl!.startsWith("https") ? https : http;
        client.get(data.schoolLogoUrl!, (res: any) => {
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        }).on("error", reject);
      });
      doc.image(logoBuffer, 40, 40, { height: 50, fit: [80, 50] });
    } catch { /* skip logo on error */ }
  }

  // Institution name top-right
  doc.font(fontBold).fontSize(10).fillColor("#1e3a5f")
    .text(ar(institutionLabel), 40, 45, { width: pageW, align: "right" });

  // Meta info
  let metaY = 60;
  const metaLines: string[] = [];
  if (data.schoolName) metaLines.push(ar((isRTL ? "المؤسسة: " : "École: ") + data.schoolName));
  if (data.teacherName) metaLines.push(ar((isRTL ? "المعلم: " : "Enseignant(e): ") + data.teacherName));
  if (data.subject) metaLines.push(ar((isRTL ? "المادة: " : "Matière: ") + data.subject));
  if (data.level) metaLines.push(ar((isRTL ? "المستوى: " : "Niveau: ") + data.level));
  metaLines.push(ar((isRTL ? "التاريخ: " : "Date: ") + displayDate));

  doc.font(font).fontSize(9).fillColor("#555555");
  for (const line of metaLines) {
    doc.text(line, 40, metaY, { width: pageW, align: "right" });
    metaY += 13;
  }

  // Divider
  const divY = Math.max(metaY + 4, 95);
  doc.moveTo(40, divY).lineTo(40 + pageW, divY).lineWidth(2).strokeColor("#1e3a5f").stroke();

  // Title
  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(16).fillColor("#1e3a5f")
    .text(ar(data.title), 40, divY + 14, { width: pageW, align: "center" });
  doc.moveDown(0.8);

  // ── Body: parse Markdown ──
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[-|: ]+\|/)) {
      // Collect all table rows
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Remove separator row
      const rows = tableLines.filter(r => !r.trim().match(/^\|[-|: ]+\|$/));
      if (rows.length > 0) {
        const parsedRows = rows.map(r =>
          r.split("|").slice(1, -1).map(c => c.trim())
        );
        const colCount = Math.max(...parsedRows.map(r => r.length));
        const colW = pageW / colCount;
        const rowH = 22;
        let startX = 40;
        let startY = doc.y;

        // Check page space
        if (startY + rowH * parsedRows.length > doc.page.height - 60) {
          doc.addPage();
          startY = 40;
        }

        parsedRows.forEach((row, ri) => {
          const isHeader = ri === 0;
          const bgColor = isHeader ? "#1e3a5f" : ri % 2 === 0 ? "#f8fafc" : "#ffffff";
          const textColor = isHeader ? "#ffffff" : "#1a1a2e";

          // Draw cells
          row.forEach((cell, ci) => {
            const cellX = startX + ci * colW;
            const cellY = startY + ri * rowH;

            // Background
            doc.rect(cellX, cellY, colW, rowH).fill(bgColor).stroke();

            // Text
            const cellText = ar(cell.replace(/\*\*/g, ""));
            doc.font(isHeader ? fontBold : font)
              .fontSize(9)
              .fillColor(textColor)
              .text(cellText, cellX + 4, cellY + 6, { width: colW - 8, align: "center", lineBreak: false });
          });
        });

        doc.y = startY + parsedRows.length * rowH + 8;
        doc.x = 40;
      }
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      doc.moveDown(0.4);
      doc.font(fontBold).fontSize(12).fillColor("#1e6091")
        .text(ar(line.slice(4).replace(/\*\*/g, "")), { align });
      doc.moveDown(0.2);
    } else if (line.startsWith("## ")) {
      doc.moveDown(0.5);
      doc.font(fontBold).fontSize(13).fillColor("#1e4d8c")
        .text(ar(line.slice(3).replace(/\*\*/g, "")), { align });
      doc.moveDown(0.2);
    } else if (line.startsWith("# ")) {
      doc.moveDown(0.6);
      doc.font(fontBold).fontSize(15).fillColor("#1e3a5f")
        .text(ar(line.slice(2).replace(/\*\*/g, "")), { align });
      doc.moveDown(0.3);
    } else if (line.match(/^[-*] /)) {
      // List item
      const bullet = isRTL ? "• " : "• ";
      const content = ar(line.slice(2).replace(/\*\*/g, ""));
      doc.font(font).fontSize(11).fillColor("#1a1a2e")
        .text(bullet + content, { align, indent: 10 });
    } else if (line.match(/^\d+\. /)) {
      // Numbered list
      const content = ar(line.replace(/^\d+\. /, "").replace(/\*\*/g, ""));
      doc.font(font).fontSize(11).fillColor("#1a1a2e")
        .text(line.match(/^(\d+\.)/)?.[1] + " " + content, { align });
    } else if (line.trim() === "---" || line.trim() === "***") {
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(40 + pageW, doc.y).lineWidth(0.5).strokeColor("#d1d5db").stroke();
      doc.moveDown(0.3);
    } else if (line.trim() === "") {
      doc.moveDown(0.3);
    } else {
      // Paragraph — handle inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      let x = doc.x;
      const y = doc.y;
      let lineText = "";
      for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
          lineText += part.slice(2, -2);
        } else {
          lineText += part;
        }
      }
      doc.font(font).fontSize(11).fillColor("#1a1a2e")
        .text(ar(lineText), { align });
    }

    i++;
  }

  // ── Footer ──
  doc.font(font).fontSize(8).fillColor("#9ca3af")
    .text(ar(institutionLabel + " | leaderacademy.school"), 40, doc.page.height - 40, { width: pageW, align: "center" });

  return createPdfBuffer(doc);
}

/**
 * Parse a Markdown line with bold/italic into TextRun[]
 */
function parseInlineMarkdown(text: string, baseSize = 24): TextRun[] {
  const runs: TextRun[] = [];
  // Split on **bold** patterns
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (/^\*\*(.+)\*\*$/.test(part)) {
      runs.push(new TextRun({ text: part.replace(/\*\*/g, ""), bold: true, size: baseSize }));
    } else if (part !== "") {
      runs.push(new TextRun({ text: part, size: baseSize }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: "", size: baseSize })];
}

/**
 * Parse a Markdown table block into a DOCX Table object.
 * tableLines: array of raw Markdown table rows (including separator)
 */
function buildDocxTable(tableLines: string[], isRTL: boolean): Table {
  const alignment = isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT;
  // Filter out separator rows (---|---|---)
  const dataRows = tableLines.filter((row) => !/^\|[\s\-|:]+\|$/.test(row.trim()));

  const rows = dataRows.map((row, rowIndex) => {
    const cells = row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

    const isHeader = rowIndex === 0;

    return new TableRow({
      children: cells.map((cellText) =>
        new TableCell({
          children: [
            new Paragraph({
              children: parseInlineMarkdown(cellText, isHeader ? 22 : 22),
              alignment,
              spacing: { before: 60, after: 60 },
            }),
          ],
          shading: isHeader
            ? { type: ShadingType.SOLID, color: "1e3a5f", fill: "1e3a5f" }
            : { type: ShadingType.CLEAR, color: "auto", fill: rowIndex % 2 === 0 ? "f8fafc" : "ffffff" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
        })
      ),
    });
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/**
 * Export the clean lesson plan (last assistant message only) as Word DOCX.
 * Produces a professional, print-ready document without chat messages.
 * Supports: headings, bold, bullet lists, numbered lists, horizontal rules, and TABLES.
 */
export async function exportCleanNoteWord(data: ConversationExportData): Promise<Buffer> {
  const lessonContent = extractLastLessonPlan(data.messages);
  const isRTL = data.language !== "fr" && data.language !== "en";
  const alignment = isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT;

  // We build a mixed array of Paragraph | Table
  const children: (Paragraph | Table)[] = [];

  // ── School logo (if provided) ──
  if (data.schoolLogoUrl) {
    try {
      const logoResponse = await fetch(data.schoolLogoUrl);
      if (logoResponse.ok) {
        const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
        const contentType = logoResponse.headers.get("content-type") || "image/png";
        const imageType = contentType.includes("jpeg") || contentType.includes("jpg")
          ? "jpg"
          : contentType.includes("gif")
          ? "gif"
          : contentType.includes("bmp")
          ? "bmp"
          : "png";
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: { width: 80, height: 80 },
                type: imageType as any,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          })
        );
      }
    } catch {
      // Logo fetch failed — skip silently
    }
  }

  // ── Institution header ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isRTL ? "ليدر أكاديمي — منصة تأهيل المدرسين" : "Leader Academy — Plateforme de Formation des Enseignants",
          size: 20,
          color: "555555",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // ── Subject / Level / Date meta ──
  const metaParts: string[] = [];
  if (data.schoolName) metaParts.push(`${isRTL ? "المؤسسة" : "École"}: ${data.schoolName}`);
  if (data.teacherName) metaParts.push(`${isRTL ? "المعلم" : "Enseignant(e)"}: ${data.teacherName}`);
  if (data.subject) metaParts.push(`${isRTL ? "المادة" : "Matière"}: ${data.subject}`);
  if (data.level) metaParts.push(`${isRTL ? "المستوى" : "Niveau"}: ${data.level}`);
  const displayDateWord = data.exportDate
    ? new Date(data.exportDate).toLocaleDateString(isRTL ? "ar-TN" : "fr-TN")
    : data.createdAt.toLocaleDateString(isRTL ? "ar-TN" : "fr-TN");
  metaParts.push(`${isRTL ? "تاريخ الإعداد" : "Date"}: ${displayDateWord}`);

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: metaParts.join("   |   "),
          size: 20,
          color: "444444",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e3a5f" },
      },
    })
  );

  // ── Document title ──
  children.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
    })
  );

  // ── Parse Markdown content with TABLE support ──
  const lines = lessonContent.split("\n");
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      children.push(buildDocxTable(tableBuffer, isRTL));
      // Add spacing after table
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      tableBuffer = [];
    }
  };

  for (const line of lines) {
    // ── Table row detection ──
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    // ── Headings ──
    if (/^### (.+)/.test(line)) {
      children.push(
        new Paragraph({
          text: line.replace(/^### /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_3,
          alignment,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (/^## (.+)/.test(line)) {
      children.push(
        new Paragraph({
          text: line.replace(/^## /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_2,
          alignment,
          spacing: { before: 280, after: 120 },
        })
      );
    } else if (/^# (.+)/.test(line)) {
      children.push(
        new Paragraph({
          text: line.replace(/^# /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_1,
          alignment,
          spacing: { before: 320, after: 160 },
        })
      );
    }
    // ── Horizontal rule ──
    else if (/^---+$/.test(line.trim())) {
      children.push(
        new Paragraph({
          text: "",
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "d1d5db" } },
          spacing: { before: 200, after: 200 },
        })
      );
    }
    // ── Bullet list ──
    else if (/^[-*] (.+)/.test(line)) {
      const itemText = line.replace(/^[-*] /, "");
      children.push(
        new Paragraph({
          children: parseInlineMarkdown(itemText),
          bullet: { level: 0 },
          alignment,
          spacing: { after: 80 },
        })
      );
    }
    // ── Numbered list ──
    else if (/^\d+\.\s(.+)/.test(line)) {
      const itemText = line.replace(/^\d+\.\s/, "");
      children.push(
        new Paragraph({
          children: parseInlineMarkdown(itemText),
          numbering: { reference: "default-numbering", level: 0 },
          alignment,
          spacing: { after: 80 },
        })
      );
    }
    // ── Empty line ──
    else if (line.trim() === "") {
      children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
    }
    // ── Normal paragraph ──
    else {
      const runs = parseInlineMarkdown(line);
      if (line.trim() !== "") {
        children.push(
          new Paragraph({
            children: runs,
            alignment,
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Flush any remaining table
  flushTable();

  // ── Footer ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${isRTL ? "ليدر أكاديمي" : "Leader Academy"} | leaderacademy.school`,
          size: 18,
          color: "9ca3af",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "d1d5db" } },
    })
  );

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Export conversation as Word document (DOCX)
 * @param data - Conversation data to export
 * @returns Buffer containing the Word document
 */
export async function exportConversationAsWord(data: ConversationExportData): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
    })
  );

  // Date
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `التاريخ: ${data.createdAt.toLocaleDateString("ar-TN")}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
    })
  );

  // Messages
  for (const message of data.messages) {
    const role = message.role === "user" ? "المستخدم" : "المساعد البيداغوجي";
    const timestamp = new Date(message.timestamp).toLocaleString("ar-TN");

    // Message header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${role} - ${timestamp}`,
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 300, after: 200 },
      })
    );

    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `📎 ${attachment.name}`,
                italics: true,
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          })
        );
      }
    }

    // Message content
    const contentLines = message.content.split("\n");
    for (const line of contentLines) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
        })
      );
    }

    // Separator
    paragraphs.push(
      new Paragraph({
        text: "─────────────────────────────────────",
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Export conversation as PDF
 * @param data - Conversation data to export
 * @returns Buffer containing the PDF document
 */
export async function exportConversationAsPDF(data: ConversationExportData): Promise<Buffer> {
  let htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #2563eb;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        .date {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .message {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background-color: #f9fafb;
        }
        .message-header {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .message.user {
          background-color: #eff6ff;
          border-right: 4px solid #3b82f6;
        }
        .message.assistant {
          background-color: #f0fdf4;
          border-right: 4px solid #10b981;
        }
        .attachment {
          display: inline-block;
          background-color: #e5e7eb;
          padding: 5px 10px;
          border-radius: 4px;
          margin: 5px 0;
          font-size: 12px;
        }
        .content {
          white-space: pre-wrap;
          line-height: 1.6;
          color: #374151;
        }
        .separator {
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <div class="date">التاريخ: ${data.createdAt.toLocaleDateString("ar-TN")}</div>
  `;

  for (const message of data.messages) {
    const role = message.role === "user" ? "المستخدم" : "المساعد البيداغوجي";
    const roleClass = message.role;
    const timestamp = new Date(message.timestamp).toLocaleString("ar-TN");

    htmlContent += `
      <div class="message ${roleClass}">
        <div class="message-header">${role} - ${timestamp}</div>
    `;

    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        htmlContent += `<div class="attachment">📎 ${attachment.name}</div>`;
      }
    }

    htmlContent += `
        <div class="content">${message.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </div>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  return await createPDF(htmlContent);
}
