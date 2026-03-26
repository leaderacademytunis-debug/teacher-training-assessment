import { useState, useRef, useCallback, useEffect } from "react";
import { useExtractionStore } from "@/stores/extractionStore";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  BookOpen,
  Scissors,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Upload,
  Trash2,
  Copy,
  Loader2,
  MousePointer2,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export default function TextbookViewer() {

  // Zustand global state
  const {
    extracted_payload,
    sourceInfo,
    isExtracting,
    setExtractedPayload,
    appendToPayload,
    clearPayload,
    setIsExtracting,
  } = useExtractionStore();

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [fileName, setFileName] = useState("");

  // Snipping state
  const [isSnipping, setIsSnipping] = useState(false);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR mutation
  const ocrMutation = trpc.textbookOCR.extractText.useMutation({
    onSuccess: (data) => {
      if (data.text) {
        appendToPayload(data.text);
        toast.success(`تم استخراج ${data.text.length} حرف من الصفحة ${currentPage}`);
      }
      setIsExtracting(false);
    },
    onError: (err) => {
      toast.error(`خطأ في الاستخراج: ${err.message}`);
      setIsExtracting(false);
    },
  });

  // Render PDF page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Also resize overlay
      if (overlayRef.current) {
        overlayRef.current.width = viewport.width;
        overlayRef.current.height = viewport.height;
      }

      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  // Load PDF file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("يرجى اختيار ملف PDF");
      return;
    }

    setFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
    setCurrentPage(1);
  };

  // Snipping tool handlers
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSnipping || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    setSnipStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setSnipRect(null);
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSnipping || !snipStart || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const newRect = {
      x: Math.min(snipStart.x, currentX),
      y: Math.min(snipStart.y, currentY),
      w: Math.abs(currentX - snipStart.x),
      h: Math.abs(currentY - snipStart.y),
    };
    setSnipRect(newRect);

    // Draw selection rectangle on overlay
    const ctx = overlayRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

    // Dim outside selection
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, overlayRef.current.width, overlayRef.current.height);

    // Clear selection area
    ctx.clearRect(newRect.x, newRect.y, newRect.w, newRect.h);

    // Draw selection border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(newRect.x, newRect.y, newRect.w, newRect.h);

    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = "#f59e0b";
    ctx.setLineDash([]);
    // Top-left
    ctx.fillRect(newRect.x - handleSize / 2, newRect.y - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(newRect.x + newRect.w - handleSize / 2, newRect.y - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(newRect.x - handleSize / 2, newRect.y + newRect.h - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(newRect.x + newRect.w - handleSize / 2, newRect.y + newRect.h - handleSize / 2, handleSize, handleSize);
  };

  const handleOverlayMouseUp = async () => {
    if (!isSnipping || !snipRect || !canvasRef.current) return;
    if (snipRect.w < 10 || snipRect.h < 10) {
      // Too small, ignore
      setSnipStart(null);
      setSnipRect(null);
      return;
    }

    setIsExtracting(true);
    setSnipStart(null);

    // Extract the selected region as image
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = snipRect.w;
    tempCanvas.height = snipRect.h;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(
      canvas,
      snipRect.x,
      snipRect.y,
      snipRect.w,
      snipRect.h,
      0,
      0,
      snipRect.w,
      snipRect.h
    );

    // Convert to base64
    const imageData = tempCanvas.toDataURL("image/png");

    // Clear overlay
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
    setSnipRect(null);

    // Send to server for OCR
    try {
      await ocrMutation.mutateAsync({
        imageBase64: imageData,
        fileName,
        pageNumber: currentPage,
      });
    } catch {
      setIsExtracting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">المكتبة التفاعلية</h1>
              <p className="text-xs text-slate-500">عارض الكتب المدرسية واستخراج المحتوى</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              تحميل كتاب PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="max-w-[1920px] mx-auto flex h-[calc(100vh-65px)]">
        {/* Left Panel - Workspace (40%) */}
        <div
          className={`${isFullscreen ? "hidden" : "w-[40%]"} border-l border-slate-200 bg-white flex flex-col`}
        >
          {/* Workspace Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">مساحة العمل</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!extracted_payload}
                  className="h-7 px-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPayload}
                  disabled={!extracted_payload}
                  className="h-7 px-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {sourceInfo && (
              <div className="text-xs text-slate-500 bg-white rounded px-2 py-1">
                المصدر: {sourceInfo.fileName} — صفحة {sourceInfo.pageNumber}
              </div>
            )}
          </div>

          {/* Extracted Text Area */}
          <div className="flex-1 p-3">
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
                className="h-full resize-none text-sm leading-relaxed font-arabic border-slate-200 focus:border-amber-400 focus:ring-amber-400/20"
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

          {/* PDF Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-start justify-center p-4"
          >
            {pdfDoc ? (
              <div className="relative shadow-lg rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="block" />
                {/* Snipping Overlay */}
                <canvas
                  ref={overlayRef}
                  className={`absolute top-0 left-0 w-full h-full ${
                    isSnipping ? "cursor-crosshair" : "pointer-events-none"
                  }`}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                />
                {/* Snipping mode indicator */}
                {isSnipping && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                    <Scissors className="w-3 h-3" />
                    ارسم مربعاً حول النص المراد اقتطاعه
                  </div>
                )}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 mt-20 bg-white/80 backdrop-blur border-dashed border-2 border-slate-300">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد كتاب مفتوح</h3>
                <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
                  قم بتحميل كتاب مدرسي بصيغة PDF لبدء استخراج المحتوى
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Upload className="w-4 h-4" />
                  تحميل كتاب PDF
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
