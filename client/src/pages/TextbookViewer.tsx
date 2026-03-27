import { useState, useRef, useEffect, useCallback } from "react";
import { useExtractionStore } from "@/stores/extractionStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, Scissors, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Upload, Trash2, Copy, Loader2, MousePointer2, FileText,
  Maximize2, Minimize2, CalendarDays, Clapperboard, HelpCircle,
  Archive, ArrowLeft, Send,
} from "lucide-react";
import { useLocation } from "wouter";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export default function TextbookViewer() {
  const [, navigate] = useLocation();

  // Zustand global state
  const {
    extracted_payload,
    sourceInfo,
    isExtracting,
    setExtractedPayload,
    clearPayload,
    setIsExtracting,
  } = useExtractionStore();

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [fileName, setFileName] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Snipping state
  const [isSnipping, setIsSnipping] = useState(false);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Archive mutation
  const archiveMutation = trpc.textbookArchive.saveExcerpt.useMutation({
    onSuccess: () => toast.success("تم حفظ النص في أرشيفك"),
    onError: () => toast.error("فشل حفظ النص"),
  });

  // Load PDF
  const loadPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
    setCurrentPage(1);
    setFileName(file.name);
  };

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      // Resize overlay to match
      if (overlayRef.current) {
        overlayRef.current.width = viewport.width;
        overlayRef.current.height = viewport.height;
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, scale]);

  // Snipping handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isSnipping || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      setSnipStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setSnipRect(null);
    },
    [isSnipping]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isSnipping || !snipStart || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const x = Math.min(snipStart.x, e.clientX - rect.left);
      const y = Math.min(snipStart.y, e.clientY - rect.top);
      const w = Math.abs(e.clientX - rect.left - snipStart.x);
      const h = Math.abs(e.clientY - rect.top - snipStart.y);
      setSnipRect({ x, y, w, h });

      // Draw selection rectangle
      const ctx = overlayRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      // Dim outside
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      ctx.clearRect(x, y, w, h);
      // Border
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      // Corner handles
      ctx.setLineDash([]);
      ctx.fillStyle = "#f59e0b";
      const hs = 6;
      [
        [x, y], [x + w, y], [x, y + h], [x + w, y + h],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
      });
    },
    [isSnipping, snipStart]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isSnipping || !snipRect || !canvasRef.current || snipRect.w < 10 || snipRect.h < 10) {
      setSnipStart(null);
      return;
    }
    setSnipStart(null);
    setIsExtracting(true);

    try {
      // Capture the selected area as image
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = snipRect.w;
      tempCanvas.height = snipRect.h;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.drawImage(
        canvasRef.current,
        snipRect.x, snipRect.y, snipRect.w, snipRect.h,
        0, 0, snipRect.w, snipRect.h
      );
      const imageDataUrl = tempCanvas.toDataURL("image/png");

      // Send to backend for OCR via LLM Vision
      const response = await fetch("/api/trpc/textbookArchive.extractText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { imageBase64: imageDataUrl } }),
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.result?.data?.json?.text || result?.result?.data?.text || "";
        if (text) {
          setExtractedPayload(text, { fileName, pageNumber: currentPage });
          toast.success("تم استخراج النص بنجاح");
        } else {
          toast.error("لم يتم العثور على نص في المنطقة المحددة");
        }
      } else {
        // Fallback: use a mock extraction for demo
        setExtractedPayload(
          "نص تجريبي مستخرج من الكتاب المدرسي - يرجى التأكد من اتصال خدمة OCR",
          { fileName, pageNumber: currentPage }
        );
        toast.info("تم استخراج نص تجريبي (الخدمة غير متاحة حالياً)");
      }
    } catch {
      setExtractedPayload(
        "نص تجريبي مستخرج من الكتاب المدرسي - يرجى التأكد من اتصال خدمة OCR",
        { fileName, pageNumber: currentPage }
      );
      toast.info("تم استخراج نص تجريبي");
    } finally {
      setIsExtracting(false);
    }
  }, [isSnipping, snipRect, fileName, currentPage, setExtractedPayload, setIsExtracting]);

  // Navigation
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(extracted_payload);
    toast.success("تم نسخ النص إلى الحافظة");
  };

  // Handle archive save
  const handleArchiveSave = () => {
    archiveMutation.mutate({
      content: extracted_payload,
      sourceFileName: sourceInfo?.fileName || fileName || undefined,
      sourcePageNumber: sourceInfo?.pageNumber || currentPage,
      title: `مقتطف من ${sourceInfo?.fileName || fileName || "كتاب"}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/library")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              المكتبة
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">المكتبة التفاعلية</h1>
              <p className="text-xs text-slate-500">
                {fileName ? fileName : "عارض الكتب المدرسية واستخراج المحتوى"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!pdfDoc && (
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2 bg-amber-500 hover:bg-amber-600">
                <Upload className="w-4 h-4" />
                تحميل كتاب PDF
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadPDF(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Workspace (40%) */}
        <div className={`${isFullscreen ? "hidden" : "w-[40%]"} flex flex-col border-l border-slate-200 bg-white`}>
          {/* Workspace Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Almarai', sans-serif" }}>
                  مساحة العمل
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!extracted_payload} className="h-7 px-2">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearPayload(); toast.success("تم مسح النص"); }}
                  disabled={!extracted_payload}
                  className="h-7 px-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {sourceInfo && (
              <div className="text-xs text-slate-500 bg-white rounded px-2 py-1 mt-1">
                المصدر: {sourceInfo.fileName} — صفحة {sourceInfo.pageNumber}
              </div>
            )}
          </div>

          {/* Extracted Text Area */}
          <div className="flex-1 p-3 overflow-auto">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-sm">جاري استخراج النص...</span>
              </div>
            ) : extracted_payload ? (
              <Textarea
                value={extracted_payload}
                onChange={(e) =>
                  setExtractedPayload(e.target.value, sourceInfo ? { fileName: sourceInfo.fileName, pageNumber: sourceInfo.pageNumber } : undefined)
                }
                className="h-full resize-none text-sm leading-relaxed border-slate-200 focus:border-amber-400 focus:ring-amber-400/20"
                dir="rtl"
                placeholder="النص المستخرج سيظهر هنا..."
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-500">مساحة العمل فارغة</p>
                  <p className="text-xs text-slate-400 mt-1">
                    افتح كتاباً واستخدم أداة الاقتطاع لاستخراج النص
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payload Info Bar */}
          {extracted_payload && (
            <div className="p-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
              <span>{extracted_payload.length} حرف</span>
              <span className="text-amber-600 font-medium">extracted_payload محدّث</span>
            </div>
          )}

          {/* Smart Action Routing Buttons */}
          {extracted_payload && (
            <div className="p-3 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-slate-700" style={{ fontFamily: "'Almarai', sans-serif" }}>أرسل النص إلى...</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate("/repartition-journaliere?from=library")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 transition-all group text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-800 truncate">محضر الدروس</p>
                    <p className="text-[10px] text-blue-500">Répartition Journalière</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/visual-studio?from=library")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-300 transition-all group text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Clapperboard className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-purple-800 truncate">Edu-Studio</p>
                    <p className="text-[10px] text-purple-500">استوديو الفيديو</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/exam-builder?from=library")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-100 hover:border-green-300 transition-all group text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-green-800 truncate">اختبار ذكي</p>
                    <p className="text-[10px] text-green-500">توليد اختبار من النص</p>
                  </div>
                </button>

                <button
                  onClick={handleArchiveSave}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-300 transition-all group text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Archive className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-800 truncate">حفظ في أرشيفي</p>
                    <p className="text-[10px] text-amber-500">للعودة إليه لاحقاً</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - PDF Viewer (60%) */}
        <div className={`${isFullscreen ? "w-full" : "w-[60%]"} flex flex-col bg-slate-100`}>
          {/* PDF Toolbar */}
          {pdfDoc && (
            <div className="p-2 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={isSnipping ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsSnipping(!isSnipping);
                    if (isSnipping && overlayRef.current) {
                      const ctx = overlayRef.current.getContext("2d");
                      if (ctx) ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                    }
                    setSnipRect(null);
                    setSnipStart(null);
                  }}
                  className={`gap-2 ${isSnipping ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                >
                  {isSnipping ? (
                    <>
                      <MousePointer2 className="w-4 h-4" />
                      وضع الاقتطاع مفعّل
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      أداة الاقتطاع
                    </>
                  )}
                </Button>
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goToNextPage} disabled={currentPage >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600 min-w-[80px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="ghost" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-slate-500 min-w-[40px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.min(3, s + 0.25))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* PDF Canvas */}
          <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-4">
            {pdfDoc ? (
              <div className="relative shadow-xl rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="block" />
                <canvas
                  ref={overlayRef}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ cursor: isSnipping ? "crosshair" : "default" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-slate-400">
                <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-600" style={{ fontFamily: "'Almarai', sans-serif" }}>
                    لم يتم تحميل كتاب بعد
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    اختر كتاباً من المكتبة أو حمّل ملف PDF
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 bg-amber-500 hover:bg-amber-600"
                >
                  <Upload className="w-4 h-4" />
                  تحميل كتاب PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
