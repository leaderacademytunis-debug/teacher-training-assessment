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
}

// ─── Constants ─────────────────────────────────────────────────────────────────

// A4 at 96dpi
const A4_W = 794;
const A4_H = 1123;
const MARGIN = 76; // ~20mm

// ─── Markdown → HTML converter ─────────────────────────────────────────────────

function mdToHtml(md: string): string {
  let html = md
    // Tables: detect lines with | separators
    .replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/gm, (_match, headerRow: string, _sep: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) => `<th style="border:1px solid #333;padding:6px 10px;background:#f0f0f0;font-weight:700;text-align:center;">${c.trim()}</th>`).join("");
      const rows = bodyRows.trim().split("\n").map((row: string) => {
        const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td style="border:1px solid #666;padding:5px 10px;text-align:center;">${c.trim()}</td>`).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:12px;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 style="font-size:13px;font-weight:700;margin:10px 0 4px;color:#333;">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 6px;color:#222;border-right:3px solid #0066cc;padding-right:8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:14px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:17px;font-weight:700;margin:16px 0 10px;text-align:center;">$1</h1>')
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Criteria badges
    .replace(/\(مع(\d)\)/g, '<span style="display:inline-block;background:#e0e0e0;border-radius:3px;padding:0 5px;font-size:10px;font-weight:700;margin:0 2px;">مع$1</span>')
    // Unordered list
    .replace(/^[-•] (.+)$/gm, '<div style="padding-right:18px;margin:3px 0;position:relative;"><span style="position:absolute;right:4px;">•</span> $1</div>')
    // Ordered list
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-right:18px;margin:3px 0;">$1. $2</div>')
    // Image placeholders
    .replace(/\[رسم[^\]]*\]/g, '<div style="border:2px dashed #999;padding:24px;text-align:center;margin:12px 0;color:#666;border-radius:6px;background:#fafafa;">$&</div>')
    .replace(/\[صورة[^\]]*\]/g, '<div style="border:2px dashed #999;padding:24px;text-align:center;margin:12px 0;color:#666;border-radius:6px;background:#fafafa;">$&</div>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #ccc;margin:12px 0;"/>')
    // Paragraphs
    .replace(/\n\n/g, '<div style="height:10px;"></div>')
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
}): string {
  const { pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, grayscale, images, type } = opts;

  const headerHTML = (pageNum: number) => `
    <div class="page-header">
      <div class="header-row">
        <div class="header-right">
          <div class="header-title-gov">الجمهورية التونسية</div>
          <div>وزارة التربية</div>
          <div>المندوبية الجهوية للتربية</div>
          <div>المدرسة: ${schoolName}</div>
        </div>
        <div class="header-center">
          <div class="doc-title">${title}</div>
          ${subject ? `<div class="doc-subject">المادة: ${subject}</div>` : ""}
          ${duration ? `<div class="doc-subject">المدة: ${duration}</div>` : ""}
        </div>
        <div class="header-left">
          <div>السنة الدراسية: ${schoolYear}</div>
          ${level ? `<div>المستوى: ${level}</div>` : ""}
          ${trimester ? `<div>الثلاثي: ${trimester}</div>` : ""}
          ${totalScore ? `<div>المجموع: /${totalScore}</div>` : ""}
        </div>
      </div>
      ${studentName && pageNum === 1 ? `
        <div class="student-info">
          <span>الاسم واللقب: ..................................</span>
          <span>القسم: ............</span>
          <span>العدد: ......../${totalScore || 20}</span>
        </div>` : ""}
    </div>`;

  const footerHTML = (pageNum: number, total: number) => `
    <div class="page-footer">
      <span>صفحة ${pageNum} / ${total}</span>
      <span class="footer-brand">Leader Academy — ${type === "exam" ? "اختبار" : type === "lesson" ? "جذاذة" : "وثيقة"}</span>
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
      <div class="page-content ${grayscale ? "grayscale" : ""}">${mdToHtml(content)}${i === pages.length - 1 ? imagesHTML : ""}</div>
      ${footerHTML(i + 1, pages.length)}
    </div>`).join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Kufi Arabic', 'Cairo', 'Tahoma', sans-serif; direction: rtl; background: #525659; }

    .a4-page {
      width: 210mm; min-height: 297mm;
      padding: 20mm;
      background: white;
      margin: 0 auto;
      position: relative;
      display: flex; flex-direction: column;
    }

    /* ── Header ── */
    .page-header {
      border-bottom: 2.5px solid #222;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .header-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 6px;
    }
    .header-right, .header-left { font-size: 10pt; line-height: 1.7; }
    .header-right { text-align: right; }
    .header-left { text-align: left; }
    .header-center { text-align: center; flex: 1; }
    .header-title-gov { font-weight: 700; font-size: 12pt; }
    .doc-title { font-weight: 700; font-size: 15pt; margin-bottom: 2px; }
    .doc-subject { font-size: 11pt; }
    .student-info {
      display: flex; gap: 30px; font-size: 11pt;
      border-top: 1px solid #999; padding-top: 8px; margin-top: 4px;
    }

    /* ── Content ── */
    .page-content {
      flex: 1;
      font-size: 12pt; line-height: 1.9;
      padding: 8px 0;
    }
    .page-content.grayscale { filter: grayscale(100%) contrast(1.15); }
    .page-content img { max-width: 100%; }

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
        margin: 0; padding: 20mm;
        box-shadow: none;
        width: 100%; min-height: auto;
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
}: PrintPreviewProps) {
  const [grayscale, setGrayscale] = useState(true);
  const [zoom, setZoom] = useState(0.6);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | "print" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);

  const exportWordMutation = trpc.edugpt.exportExamWord.useMutation();
  // PDF export uses browser print-to-PDF (no server endpoint needed)

  // ── Paginate content ──
  useEffect(() => {
    const lines = content.split("\n");
    const pagesArr: string[] = [];
    let currentPage = "";
    let estimatedHeight = 0;
    // Approximate content area height in "line units" (~35 lines per A4 page with headers)
    const MAX_LINES = 38;

    for (const line of lines) {
      // Estimate line weight
      let weight = 1;
      if (line.startsWith("# ")) weight = 2.5;
      else if (line.startsWith("## ")) weight = 2;
      else if (line.startsWith("### ")) weight = 1.7;
      else if (line.startsWith("|")) weight = 1.3;
      else if (line.trim() === "") weight = 0.5;
      else if (line.startsWith("---")) weight = 0.8;
      else if (line.length > 80) weight = Math.ceil(line.length / 70);

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

  // ── Header renderer ──
  const renderHeader = (pageNum: number) => (
    <div style={{
      borderBottom: "2.5px solid #222",
      paddingBottom: 10,
      marginBottom: 14,
      fontFamily: "'Noto Kufi Arabic', 'Cairo', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ textAlign: "right", fontSize: 10, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>الجمهورية التونسية</div>
          <div>وزارة التربية</div>
          <div>المندوبية الجهوية للتربية</div>
          <div>المدرسة: {schoolName}</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{title}</div>
          {subject && <div style={{ fontSize: 11 }}>المادة: {subject}</div>}
          {duration && <div style={{ fontSize: 11 }}>المدة: {duration}</div>}
        </div>
        <div style={{ textAlign: "left", fontSize: 10, lineHeight: 1.7 }}>
          <div>السنة الدراسية: {schoolYear}</div>
          {level && <div>المستوى: {level}</div>}
          {trimester && <div>الثلاثي: {trimester}</div>}
          {totalScore > 0 && <div>المجموع: /{totalScore}</div>}
        </div>
      </div>
      {studentName && pageNum === 1 && (
        <div style={{ display: "flex", gap: 30, fontSize: 11, borderTop: "1px solid #999", paddingTop: 8, marginTop: 4 }}>
          <span>الاسم واللقب: ..................................</span>
          <span>القسم: ............</span>
          <span>العدد: ......../{totalScore || 20}</span>
        </div>
      )}
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
      <span style={{ fontSize: 8 }}>Leader Academy — {type === "exam" ? "اختبار" : type === "lesson" ? "جذاذة" : "وثيقة"}</span>
    </div>
  );

  // ── Print via new window ──
  const handlePrint = useCallback(() => {
    setIsExporting("print");
    try {
      const printHTML = generatePrintHTML({
        pages, title, subject, level, trimester, schoolName, schoolYear,
        studentName, duration, totalScore, grayscale, images, type,
      });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("يرجى السماح بالنوافذ المنبثقة للطباعة");
        return;
      }
      printWindow.document.write(printHTML);
      printWindow.document.close();
      // Wait for fonts to load
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
  }, [pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, grayscale, images, type]);

  // ── PDF export (opens print dialog with "Save as PDF") ──
  const handleExportPDF = useCallback(() => {
    setIsExporting("pdf");
    try {
      const printHTML = generatePrintHTML({
        pages, title, subject, level, trimester, schoolName, schoolYear,
        studentName, duration, totalScore, grayscale: true, images, type,
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
  }, [pages, title, subject, level, trimester, schoolName, schoolYear, studentName, duration, totalScore, images, type]);

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
      toast.success("تم تحميل ملف Word ✅");
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
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">معاينة الطباعة</h3>
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
            {grayscale ? <EyeOff className="w-3.5 h-3.5 ml-1" /> : <Eye className="w-3.5 h-3.5 ml-1" />}
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
            <FileText className="w-3.5 h-3.5 ml-1" />
            {isExporting === "pdf" ? "جارٍ..." : "تحميل بصيغة PDF"}
          </Button>

          {/* Word */}
          <Button
            onClick={handleExportWord}
            disabled={isExporting === "word"}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
          >
            <Download className="w-3.5 h-3.5 ml-1" />
            {isExporting === "word" ? "جارٍ..." : "تحميل بصيغة Word"}
          </Button>

          {/* Direct print */}
          <Button
            onClick={handlePrint}
            disabled={isExporting === "print"}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3"
          >
            <Printer className="w-3.5 h-3.5 ml-1" />
            طباعة مباشرة
          </Button>

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
                fontFamily: "'Noto Kufi Arabic', 'Cairo', sans-serif",
                direction: "rtl",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 30px rgba(0,0,0,0.35)",
                borderRadius: 2,
              }}
            >
              {/* Page number indicator (visual only) */}
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
                  fontSize: 13,
                  lineHeight: 1.9,
                  padding: "8px 0",
                  filter: grayscale ? "grayscale(100%) contrast(1.15)" : "none",
                  transition: "filter 0.3s ease",
                }}
                dangerouslySetInnerHTML={{ __html: mdToHtml(pageContent) }}
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
        </div>
      </div>

      {/* ── Print CSS (injected globally) ── */}
      <style>{`
        @page {
          size: A4;
          margin: 20mm;
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
