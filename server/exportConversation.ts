import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ShadingType, Table, TableRow, TableCell, WidthType } from "docx";
import { createPDF } from "./pdfGenerator";

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
          align-items: flex-start;
          border-bottom: 3px solid #1e3a5f;
          padding-bottom: 18px;
          margin-bottom: 28px;
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
        <div class="header-institution">${institutionLabel}</div>
        <div class="header-meta">
          ${data.subject ? `<span>${subjectLabel}: <strong>${data.subject}</strong></span>` : ""}
          ${data.level ? `<span>${levelLabel}: <strong>${data.level}</strong></span>` : ""}
          <span>${dateLabel}: ${data.createdAt.toLocaleDateString(isRTL ? "ar-TN" : "fr-TN")}</span>
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
 * Export the clean lesson plan (last assistant message only) as Word DOCX.
 * Produces a professional, print-ready document without chat messages.
 */
export async function exportCleanNoteWord(data: ConversationExportData): Promise<Buffer> {
  const lessonContent = extractLastLessonPlan(data.messages);
  const isRTL = data.language !== "fr" && data.language !== "en";
  const alignment = isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT;

  const paragraphs: Paragraph[] = [];

  // Institution header
  paragraphs.push(
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

  // Subject / Level / Date meta
  const metaParts: string[] = [];
  if (data.subject) metaParts.push(`${isRTL ? "المادة" : "Matière"}: ${data.subject}`);
  if (data.level) metaParts.push(`${isRTL ? "المستوى" : "Niveau"}: ${data.level}`);
  metaParts.push(`${isRTL ? "التاريخ" : "Date"}: ${data.createdAt.toLocaleDateString(isRTL ? "ar-TN" : "fr-TN")}`);

  paragraphs.push(
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

  // Document title
  paragraphs.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
    })
  );

  // Parse markdown content into paragraphs
  const lines = lessonContent.split("\n");
  for (const line of lines) {
    if (/^### (.+)/.test(line)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^### /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_3,
          alignment,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (/^## (.+)/.test(line)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^## /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_2,
          alignment,
          spacing: { before: 280, after: 120 },
        })
      );
    } else if (/^# (.+)/.test(line)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^# /, "").replace(/\*\*/g, ""),
          heading: HeadingLevel.HEADING_1,
          alignment,
          spacing: { before: 320, after: 160 },
        })
      );
    } else if (/^---+$/.test(line.trim())) {
      paragraphs.push(
        new Paragraph({
          text: "",
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "d1d5db" } },
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (/^[-*] (.+)/.test(line)) {
      const itemText = line.replace(/^[-*] /, "");
      // Bold detection
      const runs: TextRun[] = [];
      const parts = itemText.split(/(\*\*[^*]+\*\*)/g);
      for (const part of parts) {
        if (/^\*\*(.+)\*\*$/.test(part)) {
          runs.push(new TextRun({ text: part.replace(/\*\*/g, ""), bold: true, size: 24 }));
        } else {
          runs.push(new TextRun({ text: part, size: 24 }));
        }
      }
      paragraphs.push(
        new Paragraph({
          children: runs,
          bullet: { level: 0 },
          alignment,
          spacing: { after: 80 },
        })
      );
    } else if (line.trim() === "" || /^---+$/.test(line.trim())) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    } else {
      // Normal line — detect bold segments
      const runs: TextRun[] = [];
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      for (const part of parts) {
        if (/^\*\*(.+)\*\*$/.test(part)) {
          runs.push(new TextRun({ text: part.replace(/\*\*/g, ""), bold: true, size: 24 }));
        } else if (part !== "") {
          runs.push(new TextRun({ text: part, size: 24 }));
        }
      }
      if (runs.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            alignment,
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Footer
  paragraphs.push(
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
