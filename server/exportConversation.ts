import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
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
