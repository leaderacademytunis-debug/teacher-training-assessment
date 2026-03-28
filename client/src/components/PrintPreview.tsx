import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText, Eye, EyeOff, ZoomIn, ZoomOut, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PrintPreviewProps {
  content: string;
  title?: string;
  subject?: string;
  level?: string;
  trimester?: string;
  schoolName?: string;
  schoolYear?: string;
  studentName?: boolean;
  duration?: string;
  totalScore?: number;
  onClose?: () => void;
  images?: Array<{ url: string; caption?: string }>;
  type?: "exam" | "lesson" | "plan" | "report";
  schoolLogo?: string;
}

interface GradingCell {
  criterion: string;
  subCriterion: string;
  score: string;
}

interface GradingRow {
  cells: GradingCell[];
  total: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const A4_W = 794;
const A4_H = 1123;
const MARGIN = 56; // ~15mm for more content space

// ─── Markdown → HTML converter (Tunisian exam style) ───────────────────────────

function mdToHtml(md: string, imageMap?: Map<string, string>): string {
  let html = md
    // Tables: detect lines with | separators
    .replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/gm, (_match, headerRow: string, _sep: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) =>
        `<th style="border:2px solid #333;padding:8px 12px;background:#f5f5f5;font-weight:700;text-align:center;font-size:13px;">${c.trim()}</th>`
      ).join("");
      const rows = bodyRows.trim().split("\n").map((row: string) => {
        const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) =>
          `<td style="border:1.5px solid #555;padding:10px 12px;text-align:center;font-size:13px;min-height:30px;">${c.trim() || '&nbsp;'}</td>`
        ).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table style="width:100%;border-collapse:collapse;margin:12px 0;border:2px solid #333;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // "السند" headers - large and prominent like the sample
    .replace(/^## (السند \d+)/gm, '<div style="font-size:18px;font-weight:700;margin:20px 0 10px;padding:6px 14px;background:#f0f4ff;border:2px solid #333;border-radius:4px;display:inline-block;">$1</div>')
    // "جدول إسناد الأعداد" header
    .replace(/^## (جدول إسناد الأعداد)/gm, '<div style="font-size:16px;font-weight:700;margin:24px 0 12px;padding:8px 16px;background:#f9f9f9;border:2px solid #333;text-align:center;">$1</div>')
    // Other ## headers
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:16px 0 8px;border-bottom:2px solid #333;padding-bottom:4px;">$1</h2>')
    // "التعليمة" headers - bold with criteria badge
    .replace(/^### (التعليمة \d+)\s*(\(مع\d+ [أ-ي]\))?/gm, (_m: string, title: string, criteria: string) => {
      const badge = criteria ? `<span style="display:inline-block;background:#e8e8e8;border:1px solid #999;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;margin-right:8px;">${criteria.replace(/[()]/g, '')}</span>` : '';
      return `<div style="font-size:16px;font-weight:700;margin:14px 0 8px;color:#111;">${title} ${badge}</div>`;
    })
    // Other ### headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:12px 0 6px;color:#222;">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 style="font-size:14px;font-weight:700;margin:10px 0 4px;color:#333;">$1</h4>')
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Criteria badges inline (مع1 أ) etc
    .replace(/\(مع(\d+)\s*([أ-ي]?)\)/g, '<span style="display:inline-block;background:#e8e8e8;border:1px solid #aaa;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:700;margin:0 3px;">مع$1 $2</span>')
    // Dotted lines for answers (........)
    .replace(/(\.{5,})/g, '<span style="display:inline-block;border-bottom:1.5px dotted #333;min-width:150px;margin:0 4px;">&nbsp;</span>')
    // Image placeholders [رسم: ...] - replace with actual images if available
    .replace(/\[رسم:\s*([^\]]*)\]/g, (_match: string, desc: string) => {
      if (imageMap) {
        // Try to find a matching image by caption
        const trimDesc = desc.trim();
        const matchUrl = imageMap.get(trimDesc);
        if (matchUrl) {
          return `<div style="text-align:center;margin:14px auto;max-width:85%;"><img src="${matchUrl}" alt="${trimDesc}" style="max-width:280px;max-height:220px;border:1.5px solid #333;border-radius:4px;filter:grayscale(100%) contrast(1.2);" /><div style="font-size:10px;color:#666;margin-top:4px;">${trimDesc}</div></div>`;
        }
      }
      return `<div style="border:2px dashed #888;padding:30px 20px;text-align:center;margin:14px auto;color:#555;border-radius:6px;background:#fafafa;max-width:80%;font-size:13px;"><span style="font-size:24px;display:block;margin-bottom:6px;">🎨</span>رسم توضيحي: ${desc}</div>`;
    })
    .replace(/\[صورة[^\]]*\]/g, '<div style="border:2px dashed #888;padding:30px 20px;text-align:center;margin:14px auto;color:#555;border-radius:6px;background:#fafafa;max-width:80%;font-size:13px;"><span style="font-size:24px;display:block;margin-bottom:6px;">📷</span>$&</div>')
    // Unordered list
    .replace(/^[-•] (.+)$/gm, '<div style="padding-right:20px;margin:4px 0;position:relative;font-size:14px;"><span style="position:absolute;right:4px;">•</span> $1</div>')
    // Ordered list
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-right:20px;margin:4px 0;font-size:14px;">$1. $2</div>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:2px solid #333;margin:16px 0;"/>')
    // Paragraphs
    .replace(/\n\n/g, '<div style="height:12px;"></div>')
    .replace(/\n/g, '<br/>');
  return html;
}

// ─── Generate full HTML document for print/PDF ─────────────────────────────────

function generatePrintHTML(opts: {
  pages: string[];
  title: string;
  subject: string;
  level: string;
  trimester: string;
  schoolName: string;
  schoolYear: string;
  studentName: boolean;
  duration: string;
  totalScore: number;
  grayscale: boolean;
  images: Array<{ url: string; caption?: string }>;
  type: string;
  imageMap?: Map<string, string>;
  schoolLogo?: string;
}): string {
  const { pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, grayscale, images, type, imageMap: imageMapForPrint, schoolLogo } = opts;
  const hasInlineImages = imageMapForPrint && imageMapForPrint.size > 0;

  const headerHTML = (pageNum: number) => `
    <div class="page-header">
      <table class="header-table">
        <tr>
          <td class="header-cell header-right">
            <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">
              ${schoolLogo ? `<img src="${schoolLogo}" alt="شعار" style="width:36px;height:36px;object-fit:contain;border-radius:4px;" />` : ''}
              <div>
                <div class="school-name">${schoolName}</div>
                <div class="school-sub">المدرسة الابتدائيّة</div>
              </div>
            </div>
          </td>
          <td class="header-cell header-center">
            <div class="exam-title">${title}</div>
          </td>
          <td class="header-cell header-left">
            <div>الاسم</div>
            <div>واللقب:..................</div>
            <div>.................................</div>
          </td>
        </tr>
      </table>
      <table class="header-table header-row2">
        <tr>
          <td class="header-cell" style="text-align:left;font-weight:700;">${schoolYear}</td>
          <td class="header-cell" style="text-align:center;font-weight:700;text-decoration:underline;">المادّة: ${subject}</td>
          <td class="header-cell" style="text-align:right;font-weight:700;">${level} ${trimester ? '| ' + trimester : ''}</td>
        </tr>
      </table>
    </div>`;

  const imagesHTML = images.length > 0 ? `
    <div class="images-section">
      ${images.map((img, i) => `
        <div class="image-item">
          <img src="${img.url}" alt="${img.caption || `صورة ${i + 1}`}" />
          ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ""}
        </div>`).join("")}
    </div>` : "";

  const pagesHTML = pages.map((content, i) => `
    <div class="a4-page">
      ${headerHTML(i + 1)}
      <div class="page-content ${grayscale ? "grayscale" : ""}">${mdToHtml(content, imageMapForPrint)}${i === pages.length - 1 && !hasInlineImages ? imagesHTML : ""}</div>
      <div class="page-footer">
        <span>صفحة ${i + 1} / ${pages.length}</span>
        <span class="footer-brand">Leader Academy</span>
      </div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Kufi Arabic', 'Amiri', 'Tahoma', sans-serif; direction: rtl; background: #525659; }

    .a4-page {
      width: 210mm; min-height: 297mm;
      padding: 15mm 18mm;
      background: white;
      margin: 0 auto;
      position: relative;
      display: flex; flex-direction: column;
      border: 2px solid #333;
    }

    /* ── Header (matching Tunisian sample) ── */
    .page-header {
      margin-bottom: 14px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #333;
    }
    .header-cell {
      border: 1.5px solid #333;
      padding: 6px 10px;
      font-size: 12pt;
      line-height: 1.5;
      vertical-align: middle;
    }
    .header-right { text-align: right; width: 30%; }
    .header-center { text-align: center; width: 40%; }
    .header-left { text-align: right; width: 30%; }
    .school-name { font-weight: 700; font-size: 13pt; }
    .school-sub { font-size: 11pt; }
    .exam-title { font-weight: 700; font-size: 14pt; }
    .header-row2 { border-top: none; }
    .header-row2 td { border-top: none; font-size: 12pt; }

    /* ── Scoring boxes on the right margin ── */
    .scoring-box {
      position: absolute;
      right: 6mm;
      border: 1.5px solid #333;
      width: 28px;
      text-align: center;
      font-size: 9px;
      font-weight: 700;
    }
    .scoring-box-label {
      border-bottom: 1px solid #333;
      padding: 2px;
      background: #f5f5f5;
    }
    .scoring-box-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    .scoring-box-grid div {
      border: 0.5px solid #999;
      height: 14px;
    }

    /* ── Content ── */
    .page-content {
      flex: 1;
      font-size: 14pt;
      line-height: 2;
      padding: 4px 0;
    }
    .page-content.grayscale { filter: grayscale(100%) contrast(1.15); }
    .page-content img { max-width: 100%; }
    .page-content table { font-size: 13pt; }

    /* ── Footer ── */
    .page-footer {
      border-top: 1px solid #bbb;
      padding-top: 6px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 9pt; color: #888;
      margin-top: auto;
    }
    .footer-brand { font-size: 8pt; }

    /* ── Images ── */
    .images-section {
      display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
      padding: 14px 0; margin-top: 10px; border-top: 1px dashed #ccc;
    }
    .image-item { text-align: center; }
    .image-item img { max-width: 200px; max-height: 160px; border: 1px solid #ddd; border-radius: 4px; }
    .image-caption { font-size: 9pt; color: #666; margin-top: 4px; }

    /* ── Print rules ── */
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body { background: white; }
      .a4-page {
        page-break-after: always;
        margin: 0; padding: 15mm 18mm;
        box-shadow: none;
        width: 100%; min-height: auto;
        border: none;
      }
      .a4-page:last-child { page-break-after: auto; }
      .no-print { display: none !important; }
    }

    /* ── Screen-only page shadows ── */
    @media screen {
      .a4-page {
        box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        margin-bottom: 24px;
      }
    }
  </style>
</head>
<body>
  ${pagesHTML}
</body>
</html>`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PrintPreview({
  content,
  title = "اختبار",
  subject = "",
  level = "",
  trimester = "",
  schoolName = "..................",
  schoolYear = "2025-2026",
  studentName = true,
  duration = "",
  totalScore = 20,
  onClose,
  images = [],
  type = "exam",
  schoolLogo,
}: PrintPreviewProps) {
  const [grayscale, setGrayscale] = useState(true);
  const [zoom, setZoom] = useState(0.6);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | "print" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [editingGrading, setEditingGrading] = useState(false);
  const [gradingData, setGradingData] = useState<GradingRow[]>([]);

  const exportWordMutation = trpc.edugpt.exportExamWord.useMutation();

  // Build image map from generated images (caption → url)
  const imageMap = new Map<string, string>();
  images.forEach(img => {
    if (img.caption) imageMap.set(img.caption.trim(), img.url);
  });

  // ── Parse grading table from content ──
  useEffect(() => {
    const gradingMatch = content.match(/## جدول إسناد الأعداد[\s\S]*?(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)+)/);
    if (gradingMatch) {
      const tableText = gradingMatch[1];
      const lines = tableText.trim().split("\n").filter(l => l.includes("|"));
      if (lines.length >= 3) {
        const dataLines = lines.slice(2); // skip header + separator
        const rows: GradingRow[] = dataLines.map(line => {
          const cols = line.split("|").filter(c => c.trim() !== "");
          return {
            cells: cols.slice(0, -1).map(c => {
              const text = c.trim();
              const parts = text.split(/\s+/);
              return {
                criterion: parts[0] || "",
                subCriterion: parts.slice(1).join(" ") || "",
                score: "",
              };
            }),
            total: cols[cols.length - 1]?.trim() || "",
          };
        });
        if (gradingData.length === 0) setGradingData(rows);
      }
    }
  }, [content]);

  const updateGradingScore = (rowIdx: number, cellIdx: number, value: string) => {
    setGradingData(prev => {
      const updated = [...prev];
      if (updated[rowIdx]?.cells[cellIdx]) {
        updated[rowIdx] = {
          ...updated[rowIdx],
          cells: updated[rowIdx].cells.map((c, i) => i === cellIdx ? { ...c, score: value } : c),
          total: updated[rowIdx].total,
        };
      }
      return updated;
    });
  };

  const updateGradingTotal = (rowIdx: number, value: string) => {
    setGradingData(prev => {
      const updated = [...prev];
      if (updated[rowIdx]) {
        updated[rowIdx] = { ...updated[rowIdx], total: value };
      }
      return updated;
    });
  };

  // ── Paginate content ──
  useEffect(() => {
    const lines = content.split("\n");
    const pagesArr: string[] = [];
    let currentPage = "";
    let estimatedHeight = 0;
    const MAX_LINES = 32; // Fewer lines per page for larger font

    for (const line of lines) {
      let weight = 1;
      if (line.startsWith("# ")) weight = 2.5;
      else if (line.startsWith("## ")) weight = 2.2;
      else if (line.startsWith("### ")) weight = 1.8;
      else if (line.startsWith("|")) weight = 1.5;
      else if (line.trim() === "") weight = 0.6;
      else if (line.startsWith("---")) weight = 1;
      else if (line.includes("[رسم")) weight = 4; // Image placeholders take more space
      else if (line.length > 60) weight = Math.ceil(line.length / 50);

      if (estimatedHeight + weight > MAX_LINES && currentPage.trim()) {
        pagesArr.push(currentPage);
        currentPage = line + "\n";
        estimatedHeight = weight;
      } else {
        currentPage += line + "\n";
        estimatedHeight += weight;
      }
    }
    if (currentPage.trim()) pagesArr.push(currentPage);
    setPages(pagesArr.length > 0 ? pagesArr : [content]);
  }, [content]);

  // ── Header renderer (Tunisian table-style) ──
  const renderHeader = (pageNum: number) => (
    <div style={{ marginBottom: 14 }}>
      {/* Main header table */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #333" }}>
        <tbody>
          <tr>
            <td style={{ border: "1.5px solid #333", padding: "6px 10px", textAlign: "right", width: "30%", verticalAlign: "middle" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                {schoolLogo && (
                  <img src={schoolLogo} alt="شعار" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{schoolName}</div>
                  <div style={{ fontSize: 11 }}>المدرسة الابتدائيّة</div>
                </div>
              </div>
            </td>
            <td style={{ border: "1.5px solid #333", padding: "6px 10px", textAlign: "center", width: "40%", verticalAlign: "middle" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
            </td>
            <td style={{ border: "1.5px solid #333", padding: "6px 10px", textAlign: "right", width: "30%", verticalAlign: "middle" }}>
              <div>الاسم</div>
              <div>واللقب:..................</div>
              <div>.................................</div>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Second row */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #333", borderTop: "none" }}>
        <tbody>
          <tr>
            <td style={{ border: "1.5px solid #333", borderTop: "none", padding: "4px 10px", textAlign: "left", fontWeight: 700, fontSize: 12 }}>
              {schoolYear}
            </td>
            <td style={{ border: "1.5px solid #333", borderTop: "none", padding: "4px 10px", textAlign: "center", fontWeight: 700, fontSize: 12, textDecoration: "underline" }}>
              المادّة: {subject}
            </td>
            <td style={{ border: "1.5px solid #333", borderTop: "none", padding: "4px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>
              {level} {trimester ? `| ${trimester}` : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── Footer renderer ──
  const renderFooter = (pageNum: number, total: number) => (
    <div style={{
      borderTop: "1px solid #bbb",
      paddingTop: 6,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 9,
      color: "#888",
      marginTop: "auto",
    }}>
      <span>صفحة {pageNum} / {total}</span>
      <span style={{ fontSize: 8 }}>Leader Academy</span>
    </div>
  );

  // ── Print via new window ──
  const handlePrint = useCallback(() => {
    setIsExporting("print");
    try {
      const printHTML = generatePrintHTML({
        pages, title, subject, level, trimester, schoolName, schoolYear,
        studentName, duration, totalScore, grayscale, images, type, imageMap, schoolLogo,
      });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة");
        return;
      }
      printWindow.document.write(printHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1200);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("خطأ أثناء الطباعة");
    } finally {
      setTimeout(() => setIsExporting(null), 2000);
    }
  }, [pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, grayscale, images, type, imageMap, schoolLogo]);

  // ── PDF export (opens print dialog with "Save as PDF") ──
  const handleExportPDF = useCallback(() => {
    setIsExporting("pdf");
    try {
      const printHTML = generatePrintHTML({
        pages, title, subject, level, trimester, schoolName, schoolYear,
        studentName, duration, totalScore, grayscale: true, images, type, imageMap, schoolLogo,
      });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("يرجى السماح بالنوافذ المنبثقة لتحميل PDF");
        return;
      }
      printWindow.document.write(printHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        toast.info("اختر 'حفظ كـ PDF' من خيارات الطابعة");
      }, 1200);
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("خطأ أثناء تصدير PDF");
    } finally {
      setTimeout(() => setIsExporting(null), 2000);
    }
  }, [pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, images, type, imageMap, schoolLogo]);

  // ── Word export ──
  const handleExportWord = useCallback(async () => {
    setIsExporting("word");
    try {
      const result = await exportWordMutation.mutateAsync({
        examContent: content,
        subject: subject || "وثيقة",
        level: level || "",
        trimester: trimester || "",
        duration: duration || "",
        totalScore: totalScore || 20,
      });

      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تحميل ملف Word");
    } catch (err) {
      console.error("Word export error:", err);
      toast.error("خطأ أثناء تصدير Word");
    } finally {
      setIsExporting(null);
    }
  }, [content, subject, level, trimester, duration, totalScore]);

  // ── Responsive zoom ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setZoom(0.38);
      else if (window.innerWidth < 1024) setZoom(0.55);
      else setZoom(0.7);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col" dir="rtl">
      {/* ── Toolbar ── */}
      <div className="bg-white border-b shadow-md px-3 sm:px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">معاينة الطباعة — النموذج التونسي</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {pages.length} {pages.length === 1 ? "صفحة" : "صفحات"} · A4
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Grayscale toggle */}
          <Button
            variant={grayscale ? "default" : "outline"}
            size="sm"
            onClick={() => setGrayscale(!grayscale)}
            className="text-xs h-8"
          >
            {grayscale ? <EyeOff className="w-3.5 h-3.5 ms-1" /> : <Eye className="w-3.5 h-3.5 ms-1" />}
            {grayscale ? "ألوان" : "أبيض/أسود"}
          </Button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 border rounded-md px-1 h-8">
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1 h-6 w-6">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 h-6 w-6">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-gray-300 hidden sm:block" />

          {/* PDF */}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting === "pdf"}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3"
          >
            <FileText className="w-3.5 h-3.5 ms-1" />
            {isExporting === "pdf" ? "جارٍ..." : "تحميل PDF"}
          </Button>

          {/* Word */}
          <Button
            onClick={handleExportWord}
            disabled={isExporting === "word"}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
          >
            <Download className="w-3.5 h-3.5 ms-1" />
            {isExporting === "word" ? "جارٍ..." : "تحميل Word"}
          </Button>

          {/* Direct print */}
          <Button
            onClick={handlePrint}
            disabled={isExporting === "print"}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3"
          >
            <Printer className="w-3.5 h-3.5 ms-1" />
            طباعة مباشرة
          </Button>

          {/* Edit Grading Table */}
          {gradingData.length > 0 && (
            <Button
              variant={editingGrading ? "default" : "outline"}
              size="sm"
              onClick={() => setEditingGrading(!editingGrading)}
              className={`text-xs h-8 px-3 ${editingGrading ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
            >
              {editingGrading ? "✅ حفظ التعديلات" : "✏️ تعديل جدول الإسناد"}
            </Button>
          )}

          {/* Close */}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-8 w-8 hover:bg-red-50">
              <X className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Preview Area ── */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center" style={{ background: "#4a4d50" }}>
        <div
          ref={contentRef}
          className="flex flex-col items-center gap-6"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}
        >
          {pages.map((pageContent, i) => (
            <div
              key={i}
              className="bg-white relative"
              style={{
                width: A4_W,
                minHeight: A4_H,
                padding: MARGIN,
                boxSizing: "border-box",
                fontFamily: "'Noto Kufi Arabic', 'Amiri', sans-serif",
                direction: "rtl",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 30px rgba(0,0,0,0.35)",
                borderRadius: 2,
                border: "2px solid #333",
                color: "#000",
              }}
            >
              {/* Page number indicator */}
              <div style={{
                position: "absolute", top: 8, left: 8,
                background: "#333", color: "#fff",
                fontSize: 10, padding: "2px 8px", borderRadius: 10,
                opacity: 0.6,
              }}>
                {i + 1}/{pages.length}
              </div>

              {/* Header */}
              {renderHeader(i + 1)}

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  lineHeight: 2,
                  padding: "4px 0",
                  filter: grayscale ? "grayscale(100%) contrast(1.15)" : "none",
                  transition: "filter 0.3s ease",
                }}
                dangerouslySetInnerHTML={{ __html: mdToHtml(pageContent, imageMap) }}
              />

              {/* Images on last page */}
              {i === pages.length - 1 && images.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center",
                  padding: "14px 0", marginTop: 10, borderTop: "1px dashed #ccc",
                  filter: grayscale ? "grayscale(100%) contrast(1.3)" : "none",
                }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ textAlign: "center" }}>
                      <img
                        src={img.url}
                        alt={img.caption || `صورة ${idx + 1}`}
                        style={{ maxWidth: 200, maxHeight: 160, border: "1px solid #ddd", borderRadius: 4 }}
                      />
                      {img.caption && <div style={{ fontSize: 9, color: "#666", marginTop: 4 }}>{img.caption}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {renderFooter(i + 1, pages.length)}
            </div>
          ))}

          {/* ── Editable Grading Table Panel ── */}
          {editingGrading && gradingData.length > 0 && (
            <div
              style={{
                width: A4_W,
                background: "white",
                padding: MARGIN,
                boxShadow: "0 4px 30px rgba(0,0,0,0.35)",
                borderRadius: 2,
                border: "2px solid #f59e0b",
                fontFamily: "'Noto Kufi Arabic', 'Amiri', sans-serif",
                direction: "rtl" as const,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>✏️ تعديل جدول إسناد الأعداد</h3>
                <span style={{ fontSize: 11, color: "#888" }}>اضغط على الخلية لتعديل الدرجة</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #333" }}>
                <thead>
                  <tr>
                    <th style={{ border: "2px solid #333", padding: "8px 12px", background: "#f5f5f5", fontWeight: 700, fontSize: 13, textAlign: "center" }}>الوضعية</th>
                    <th style={{ border: "2px solid #333", padding: "8px 12px", background: "#f5f5f5", fontWeight: 700, fontSize: 13, textAlign: "center" }}>المعايير الفرعية</th>
                    <th style={{ border: "2px solid #333", padding: "8px 12px", background: "#f5f5f5", fontWeight: 700, fontSize: 13, textAlign: "center" }}>الدرجة</th>
                    <th style={{ border: "2px solid #333", padding: "8px 12px", background: "#f5f5f5", fontWeight: 700, fontSize: 13, textAlign: "center" }}>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingData.map((row, rowIdx) => (
                    row.cells.map((cell, cellIdx) => (
                      <tr key={`${rowIdx}-${cellIdx}`}>
                        {cellIdx === 0 && (
                          <td
                            rowSpan={row.cells.length}
                            style={{ border: "1.5px solid #555", padding: "10px 12px", textAlign: "center", fontSize: 13, fontWeight: 600, verticalAlign: "middle" }}
                          >
                            الوضعية {rowIdx + 1}
                          </td>
                        )}
                        <td style={{ border: "1.5px solid #555", padding: "8px 12px", textAlign: "center", fontSize: 13 }}>
                          {cell.criterion} {cell.subCriterion}
                        </td>
                        <td style={{ border: "1.5px solid #555", padding: "4px", textAlign: "center" }}>
                          <input
                            type="text"
                            value={cell.score}
                            onChange={(e) => updateGradingScore(rowIdx, cellIdx, e.target.value)}
                            placeholder="..."
                            style={{
                              width: "100%",
                              textAlign: "center",
                              border: "1px dashed #ccc",
                              borderRadius: 4,
                              padding: "4px 6px",
                              fontSize: 14,
                              fontWeight: 600,
                              background: cell.score ? "#fef3c7" : "#fff",
                              outline: "none",
                            }}
                          />
                        </td>
                        {cellIdx === 0 && (
                          <td
                            rowSpan={row.cells.length}
                            style={{ border: "1.5px solid #555", padding: "4px", textAlign: "center", verticalAlign: "middle" }}
                          >
                            <input
                              type="text"
                              value={row.total}
                              onChange={(e) => updateGradingTotal(rowIdx, e.target.value)}
                              placeholder="..."
                              style={{
                                width: "100%",
                                textAlign: "center",
                                border: "1px dashed #ccc",
                                borderRadius: 4,
                                padding: "6px",
                                fontSize: 16,
                                fontWeight: 700,
                                background: row.total ? "#d1fae5" : "#fff",
                                outline: "none",
                              }}
                            />
                          </td>
                        )}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#666" }}>
                  المجموع الكلي: {gradingData.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0).toFixed(1)} / {totalScore}
                </span>
                <button
                  onClick={() => setEditingGrading(false)}
                  style={{
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✅ حفظ وإغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Print CSS ── */}
      <style>{`
        @page {
          size: A4;
          margin: 15mm 18mm;
        }
        @media print {
          body > *:not(.print-preview-root) { display: none !important; }
          .no-print { display: none !important; }
          .print-preview-root {
            position: static !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
