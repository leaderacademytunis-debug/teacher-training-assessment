import { storagePut } from "../storage";
import fs from "fs";
import { execSync } from "child_process";

/**
 * Convert HTML content to PDF using WeasyPrint, with fallback to uploading
 * printable HTML to S3 if WeasyPrint is not available (production).
 * Returns the URL of the generated file (PDF or HTML).
 */
export async function htmlToPdf(
  html: string,
  s3Key: string,
  options?: {
    margins?: { top?: string; right?: string; bottom?: string; left?: string };
  }
): Promise<{ url: string; isPdf: boolean }> {
  const margins = options?.margins || { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" };
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const tmpHtmlPath = `/tmp/html-to-pdf-${ts}-${rand}.html`;
  const tmpPdfPath = `/tmp/html-to-pdf-${ts}-${rand}.pdf`;

  // Add print-ready styles
  const printableHtml = html.replace('</style>', `
    @media print {
      body { padding: 0; margin: 0; }
      .no-print { display: none !important; }
    }
    @page {
      size: A4;
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
    }
  </style>`);

  fs.writeFileSync(tmpHtmlPath, printableHtml, "utf-8");

  let url = "";
  let isPdf = false;

  try {
    // Try WeasyPrint first (available in dev, may not be in production)
    execSync(`weasyprint "${tmpHtmlPath}" "${tmpPdfPath}"`, { timeout: 30000 });
    const pdfBuffer = fs.readFileSync(tmpPdfPath);
    const pdfKey = s3Key.replace(/\.(html|pdf)$/, "") + ".pdf";
    const result = await storagePut(pdfKey, pdfBuffer, "application/pdf");
    url = result.url;
    isPdf = true;
    try { fs.unlinkSync(tmpPdfPath); } catch {}
  } catch {
    // Fallback: upload HTML as printable page to S3
    const htmlKey = s3Key.replace(/\.(html|pdf)$/, "") + ".html";
    const result = await storagePut(htmlKey, Buffer.from(printableHtml, "utf-8"), "text/html");
    url = result.url;
    isPdf = false;
  }

  try { fs.unlinkSync(tmpHtmlPath); } catch {}

  return { url, isPdf };
}
