import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText, FileImage, Eye, EyeOff, ZoomIn, ZoomOut, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PrintPreviewProps {
  content: string; // Markdown/HTML content
  title?: string;
  subject?: string;
  level?: string;
  trimester?: string;
  schoolName?: string;
  schoolYear?: string;
  studentName?: boolean; // Show student name field
  onClose?: () => void;
  images?: Array<{ url: string; caption?: string }>;
}

// A4 dimensions in mm: 210 x 297
// With 2cm margins: content area = 170 x 257mm
const A4_WIDTH_PX = 794; // ~210mm at 96dpi
const A4_HEIGHT_PX = 1123; // ~297mm at 96dpi
const MARGIN_PX = 76; // ~2cm at 96dpi
const HEADER_HEIGHT = 120;
const FOOTER_HEIGHT = 40;
const CONTENT_HEIGHT = A4_HEIGHT_PX - (2 * MARGIN_PX) - HEADER_HEIGHT - FOOTER_HEIGHT;

export default function PrintPreview({
  content,
  title = "اختبار",
  subject = "",
  level = "",
  trimester = "",
  schoolName = "..................",
  schoolYear = "2025-2026",
  studentName = true,
  onClose,
  images = [],
}: PrintPreviewProps) {
  const [grayscale, setGrayscale] = useState(true);
  const [zoom, setZoom] = useState(0.7);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);

  const exportWordMutation = trpc.edugpt.exportExamWord.useMutation();

  // Parse content into pages
  useEffect(() => {
    const lines = content.split("\n");
    const pagesArr: string[] = [];
    let currentPage = "";
    let currentHeight = 0;
    const LINE_HEIGHT = 24; // approximate px per line

    for (const line of lines) {
      const lineHeight = line.startsWith("#") ? LINE_HEIGHT * 2 : 
                         line.startsWith("##") ? LINE_HEIGHT * 1.5 :
                         line.trim() === "" ? LINE_HEIGHT * 0.5 :
                         LINE_HEIGHT;
      
      if (currentHeight + lineHeight > CONTENT_HEIGHT && currentPage.trim()) {
        pagesArr.push(currentPage);
        currentPage = line + "\n";
        currentHeight = lineHeight;
      } else {
        currentPage += line + "\n";
        currentHeight += lineHeight;
      }
    }
    if (currentPage.trim()) {
      pagesArr.push(currentPage);
    }
    setPages(pagesArr.length > 0 ? pagesArr : [content]);
  }, [content]);

  // Render header for each page
  const renderHeader = (pageNum: number) => (
    <div className="print-header" style={{ 
      height: HEADER_HEIGHT, 
      borderBottom: "2px solid #333",
      padding: "8px 0",
      direction: "rtl",
      fontFamily: "'Noto Kufi Arabic', 'Cairo', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ textAlign: "right", fontSize: 11, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>الجمهورية التونسية</div>
          <div>وزارة التربية</div>
          <div>المدرسة: {schoolName}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
          {subject && <div style={{ fontSize: 12 }}>المادة: {subject}</div>}
        </div>
        <div style={{ textAlign: "left", fontSize: 11, lineHeight: 1.6 }}>
          <div>السنة الدراسية: {schoolYear}</div>
          {level && <div>المستوى: {level}</div>}
          {trimester && <div>الثلاثي: {trimester}</div>}
        </div>
      </div>
      {studentName && pageNum === 1 && (
        <div style={{ display: "flex", gap: 40, fontSize: 12, borderTop: "1px solid #999", paddingTop: 6 }}>
          <span>الاسم واللقب: ..................................</span>
          <span>القسم: ............</span>
          <span>العدد: ......../20</span>
        </div>
      )}
    </div>
  );

  // Render footer with page numbers
  const renderFooter = (pageNum: number, totalPages: number) => (
    <div className="print-footer" style={{
      height: FOOTER_HEIGHT,
      borderTop: "1px solid #ccc",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 11,
      color: "#666",
      direction: "rtl",
    }}>
      <span>صفحة {pageNum} / {totalPages}</span>
    </div>
  );

  // Convert markdown-like content to simple HTML
  const renderContent = (text: string) => {
    let html = text
      .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 6px;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:14px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:700;margin:16px 0 10px;">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<div style="padding-right:16px;margin:3px 0;">• $1</div>')
      .replace(/^\d+\. (.+)$/gm, (match, p1, offset, str) => {
        const num = str.substring(0, offset).split('\n').filter((l: string) => /^\d+\./.test(l)).length + 1;
        return `<div style="padding-right:16px;margin:3px 0;">${num}. ${p1}</div>`;
      })
      .replace(/\[رسم توضيحي[^\]]*\]/g, '<div style="border:2px dashed #999;padding:20px;text-align:center;margin:10px 0;color:#666;border-radius:4px;">$&</div>')
      .replace(/\n\n/g, '<div style="height:10px;"></div>')
      .replace(/\n/g, '<br/>');
    return html;
  };

  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    setIsExporting("pdf");
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("يرجى السماح بالنوافذ المنبثقة لتحميل PDF");
        return;
      }
      
      const pagesHtml = pages.map((pageContent, i) => `
        <div class="page" style="width:210mm;min-height:297mm;padding:20mm;box-sizing:border-box;page-break-after:always;position:relative;font-family:'Noto Kufi Arabic','Cairo',sans-serif;direction:rtl;">
          <div class="header" style="border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div style="text-align:right;font-size:11pt;line-height:1.6;">
                <div style="font-weight:700;font-size:13pt;">الجمهورية التونسية</div>
                <div>وزارة التربية</div>
                <div>المدرسة: ${schoolName}</div>
              </div>
              <div style="text-align:center;">
                <div style="font-weight:700;font-size:16pt;margin-bottom:4px;">${title}</div>
                ${subject ? `<div style="font-size:12pt;">المادة: ${subject}</div>` : ""}
              </div>
              <div style="text-align:left;font-size:11pt;line-height:1.6;">
                <div>السنة الدراسية: ${schoolYear}</div>
                ${level ? `<div>المستوى: ${level}</div>` : ""}
                ${trimester ? `<div>الثلاثي: ${trimester}</div>` : ""}
              </div>
            </div>
            ${studentName && i === 0 ? `<div style="display:flex;gap:40px;font-size:12pt;border-top:1px solid #999;padding-top:6px;">
              <span>الاسم واللقب: ..................................</span>
              <span>القسم: ............</span>
              <span>العدد: ......../20</span>
            </div>` : ""}
          </div>
          <div class="content" style="font-size:13pt;line-height:1.8;${grayscale ? "filter:grayscale(100%);" : ""}">${renderContent(pageContent)}</div>
          <div class="footer" style="position:absolute;bottom:20mm;left:20mm;right:20mm;text-align:center;font-size:10pt;color:#666;border-top:1px solid #ccc;padding-top:6px;">
            صفحة ${i + 1} / ${pages.length}
          </div>
        </div>
      `).join("");

      printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
          .page { background: white; }
          @media print { .page { page-break-after: always; } .page:last-child { page-break-after: auto; } }
        </style>
      </head><body>${pagesHtml}</body></html>`);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExporting(null);
    }
  }, [pages, title, subject, level, trimester, schoolName, schoolYear, studentName, grayscale]);

  // Handle Word export
  const handleExportWord = useCallback(async () => {
    setIsExporting("word");
    try {
      const result = await exportWordMutation.mutateAsync({
        examContent: content,
        subject: subject || "اختبار",
        level: level || "",
        trimester: trimester || "",
      });
      
      // Download the base64 docx
      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export error:", err);
      alert("حدث خطأ أثناء تصدير Word");
    } finally {
      setIsExporting(null);
    }
  }, [content, subject, level, trimester, schoolName, schoolYear]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col" dir="rtl">
      {/* Toolbar */}
      <div className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">معاينة الطباعة</h3>
          <span className="text-xs text-gray-500 hidden sm:inline">({pages.length} {pages.length === 1 ? "صفحة" : "صفحات"})</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Grayscale toggle */}
          <Button
            variant={grayscale ? "default" : "outline"}
            size="sm"
            onClick={() => setGrayscale(!grayscale)}
            className="text-xs"
          >
            {grayscale ? <EyeOff className="w-3.5 h-3.5 ml-1" /> : <Eye className="w-3.5 h-3.5 ml-1" />}
            {grayscale ? "ألوان" : "أبيض/أسود"}
          </Button>

          {/* Zoom */}
          <div className="flex items-center gap-1 border rounded-md px-1">
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1 h-7">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 h-7">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Export buttons */}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting === "pdf"}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            <FileText className="w-3.5 h-3.5 ml-1" />
            {isExporting === "pdf" ? "جارٍ..." : "تحميل PDF"}
          </Button>
          
          <Button
            onClick={handleExportWord}
            disabled={isExporting === "word"}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <Download className="w-3.5 h-3.5 ml-1" />
            {isExporting === "word" ? "جارٍ..." : "تحميل Word"}
          </Button>

          {/* Print directly */}
          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Printer className="w-3.5 h-3.5 ml-1" />
            طباعة
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-7">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center" style={{ background: "#525659" }}>
        <div ref={previewRef} className="flex flex-col gap-8" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
          {pages.map((pageContent, i) => (
            <div
              key={i}
              className="bg-white shadow-2xl"
              style={{
                width: A4_WIDTH_PX,
                minHeight: A4_HEIGHT_PX,
                padding: MARGIN_PX,
                boxSizing: "border-box",
                fontFamily: "'Noto Kufi Arabic', 'Cairo', sans-serif",
                direction: "rtl",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              {renderHeader(i + 1)}

              {/* Content */}
              <div
                className="flex-1"
                style={{
                  fontSize: 13,
                  lineHeight: 1.8,
                  padding: "12px 0",
                  filter: grayscale ? "grayscale(100%) contrast(1.2)" : "none",
                }}
                dangerouslySetInnerHTML={{ __html: renderContent(pageContent) }}
              />

              {/* Inline images */}
              {i === pages.length - 1 && images.length > 0 && (
                <div style={{ 
                  display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", padding: "12px 0",
                  filter: grayscale ? "grayscale(100%) contrast(1.3)" : "none",
                }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ textAlign: "center" }}>
                      <img
                        src={img.url}
                        alt={img.caption || `صورة ${idx + 1}`}
                        style={{ maxWidth: 200, maxHeight: 150, border: "1px solid #ddd", borderRadius: 4 }}
                      />
                      {img.caption && <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>{img.caption}</div>}
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

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-preview-container, .print-preview-container * { visibility: visible; }
          .print-preview-container { position: absolute; left: 0; top: 0; }
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
        }
      `}</style>
    </div>
  );
}
