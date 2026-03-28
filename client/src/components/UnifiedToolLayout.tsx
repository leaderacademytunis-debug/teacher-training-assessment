import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "wouter";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight, Copy, CheckCheck, Download, FileText, RefreshCw,
  Loader2, Sparkles, ChevronLeft, Printer, Edit3, Check, X,
  Wand2, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export interface ToolConfig {
  /** Unique tool identifier */
  id: string;
  /** Tool icon from lucide */
  icon: LucideIcon;
  /** Tool name in 3 languages */
  nameAr: string;
  nameFr: string;
  nameEn: string;
  /** Short description in 3 languages */
  descAr: string;
  descFr: string;
  descEn: string;
  /** Accent color for the tool (hex) */
  accentColor: string;
  /** Gradient for header/accents */
  gradient: string;
  /** Smart loader messages — can be a flat array (Arabic only) or per-language */
  loaderMessages: string[];
  loaderMessagesFr?: string[];
  loaderMessagesEn?: string[];
}

export interface UnifiedToolLayoutProps {
  config: ToolConfig;
  /** The input form rendered on the right side */
  inputPanel?: ReactNode;
  /** The result content (markdown/HTML string or ReactNode) */
  resultContent?: string | null;
  /** Whether generation is in progress */
  isGenerating?: boolean;
  /** Callback to regenerate */
  onRegenerate?: () => void;
  /** Optional: callback for PDF download */
  onDownloadPDF?: () => void;
  /** Optional: callback for Word download */
  onDownloadWord?: () => void;
  /** Optional: custom result renderer (overrides default paper view) */
  customResultRenderer?: ReactNode;
  /** Whether to show the input panel (can be toggled on mobile) */
  showInputOnMobile?: boolean;
  /** Optional: whether result is editable inline */
  editable?: boolean;
  /** Optional: callback when edited content changes */
  onContentEdit?: (newContent: string) => void;
  /** Optional: extra action buttons for the action bar */
  extraActions?: ReactNode;
  /** Optional: children for custom full-page layout (bypasses split panel) */
  children?: ReactNode;
  /** Alias: resultPanel maps to customResultRenderer */
  resultPanel?: ReactNode;
  /** Alias: isLoading maps to isGenerating */
  isLoading?: boolean;
  /** Alias: loadingMessage (unused but accepted for compat) */
  loadingMessage?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   SMART LOADER COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

function SmartLoader({ messages, accentColor, gradient }: { messages: string[]; accentColor: string; gradient: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Animated circles */}
      <div className="relative w-28 h-28 mb-10">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
          style={{
            borderTopColor: accentColor,
            borderRightColor: `${accentColor}40`,
            animationDuration: "2s",
          }}
        />
        {/* Middle pulsing ring */}
        <div
          className="absolute inset-2 rounded-full border-[2px] border-transparent animate-spin"
          style={{
            borderBottomColor: accentColor,
            borderLeftColor: `${accentColor}30`,
            animationDuration: "3s",
            animationDirection: "reverse",
          }}
        />
        {/* Inner icon */}
        <div
          className="absolute inset-4 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: `${accentColor}12` }}
        >
          <Sparkles className="w-8 h-8" style={{ color: accentColor }} />
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {messages.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === currentIndex ? "24px" : "6px",
              height: "6px",
              background: i === currentIndex ? accentColor : `${accentColor}30`,
            }}
          />
        ))}
      </div>

      {/* Animated message */}
      <div className="h-8 flex items-center justify-center">
        <p
          className="text-base font-medium text-center transition-all duration-300"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(8px)",
            color: accentColor,
            fontFamily: "'Almarai', sans-serif",
          }}
        >
          {messages[currentIndex]}
        </p>
      </div>

      {/* Subtle progress bar */}
      <div className="w-64 h-1 bg-gray-100 rounded-full mt-6 overflow-hidden">
        <div
          className="h-full rounded-full animate-pulse"
          style={{
            background: gradient,
            width: `${((currentIndex + 1) / messages.length) * 100}%`,
            transition: "width 0.5s ease-out",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING ACTION BAR
   ═══════════════════════════════════════════════════════════════════ */

function FloatingActionBar({
  onCopy,
  onDownloadPDF,
  onDownloadWord,
  onRegenerate,
  onPrint,
  isEditing,
  onToggleEdit,
  accentColor,
  gradient,
  extraActions,
  lang,
}: {
  onCopy: () => void;
  onDownloadPDF?: () => void;
  onDownloadWord?: () => void;
  onRegenerate: () => void;
  onPrint: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  accentColor: string;
  gradient: string;
  extraActions?: ReactNode;
  lang: AppLanguage;
}) {
  const [copied, setCopied] = useState(false);
  const t = (ar: string, fr: string, en: string) =>
    lang === "ar" ? ar : lang === "fr" ? fr : en;

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="sticky bottom-4 z-30 mx-auto max-w-fit"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-xl border border-white/60"
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: copied ? "#DEF7EC" : `${accentColor}08`,
            color: copied ? "#03543F" : accentColor,
          }}
          title={t("نسخ النص", "Copier le texte", "Copy text")}
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? t("تم النسخ", "Copié", "Copied") : t("نسخ", "Copier", "Copy")}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* PDF */}
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105"
            style={{ background: "#FEF3C7", color: "#92400E" }}
            title={t("تحميل PDF", "Télécharger PDF", "Download PDF")}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}

        {/* Word */}
        {onDownloadWord && (
          <button
            onClick={onDownloadWord}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105"
            style={{ background: "#DBEAFE", color: "#1E40AF" }}
            title={t("تحميل Word", "Télécharger Word", "Download Word")}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Word</span>
          </button>
        )}

        {/* Print */}
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 bg-gray-50 text-gray-600 hover:bg-gray-100"
          title={t("طباعة", "Imprimer", "Print")}
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">{t("طباعة", "Imprimer", "Print")}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Edit toggle */}
        <button
          onClick={onToggleEdit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: isEditing ? "#DEF7EC" : "#F3F4F6",
            color: isEditing ? "#03543F" : "#4B5563",
          }}
          title={t("تعديل مباشر", "Édition directe", "Inline edit")}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isEditing ? t("تم", "Terminé", "Done") : t("تعديل", "Éditer", "Edit")}</span>
        </button>

        {/* Extra actions */}
        {extraActions}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Regenerate */}
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{ background: gradient }}
          title={t("إعادة التوليد", "Régénérer", "Regenerate")}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">{t("إعادة التوليد", "Régénérer", "Regenerate")}</span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAPER RESULT CONTAINER
   ═══════════════════════════════════════════════════════════════════ */

function PaperResult({
  content,
  editable,
  isEditing,
  onContentChange,
  accentColor,
  lang = "ar",
}: {
  content: string;
  editable: boolean;
  isEditing: boolean;
  onContentChange: (newContent: string) => void;
  accentColor: string;
  lang?: AppLanguage;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-color headings in the result
  const processedContent = content
    .replace(
      /^(#{1,3})\s+(.+)$/gm,
      (_, hashes, text) => {
        const level = hashes.length;
        const sizes = ["text-xl", "text-lg", "text-base"];
        return `<h${level} class="${sizes[level - 1]} font-bold mb-3 mt-5" style="color: ${accentColor}">${text}</h${level}>`;
      }
    )
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color: ${accentColor}">$1</strong>`)
    .replace(/^[-•]\s+(.+)$/gm, '<li class="me-4 mb-1.5 leading-relaxed">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside mb-4 space-y-1">$&</ul>')
    .replace(/\n{2,}/g, '</p><p class="mb-3 leading-[1.9]">')
    .replace(/\n/g, "<br/>");

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      onContentChange(contentRef.current.innerText);
    }
  }, [onContentChange]);

  return (
    <div className="relative">
      {/* Paper shadow effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-gray-200/50 to-gray-300/30 rounded-2xl blur-sm" />

      {/* Paper container */}
      <div
        className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        {/* Paper top accent line */}
        <div className="h-1 w-full" style={{ background: accentColor }} />

        {/* Paper ruled lines effect (subtle) */}
        <div
          className="px-8 sm:px-12 py-8 sm:py-10"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, ${accentColor}06 31px, ${accentColor}06 32px)`,
            backgroundSize: "100% 32px",
            minHeight: "400px",
          }}
        >
          {/* Editing indicator */}
          {isEditing && (
            <div
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: `${accentColor}08`, color: accentColor }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span style={{ fontFamily: "'Almarai', sans-serif" }}>
                {lang === "fr" ? "Mode édition directe — cliquez sur le texte pour le modifier" : lang === "en" ? "Inline edit mode — click on text to edit" : "وضع التعديل المباشر — انقر على النص لتعديله"}
              </span>
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            contentEditable={editable && isEditing}
            suppressContentEditableWarning
            onInput={handleInput}
            className={`prose prose-lg max-w-none focus:outline-none ${
              isEditing
                ? "ring-2 ring-offset-4 rounded-lg p-4"
                : ""
            }`}
            style={{
              fontFamily: "'Almarai', sans-serif",
              fontSize: "15px",
              lineHeight: "1.9",
              color: "#1F2937",
              direction: lang === "ar" ? "rtl" : "ltr",
              ...(isEditing ? { ringColor: `${accentColor}40` } : {}),
            }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>

        {/* Paper bottom fold effect */}
        <div
          className="h-8 w-full"
          style={{
            background: `linear-gradient(to bottom, transparent, ${accentColor}03)`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════ */

function EmptyState({ config, lang }: { config: ToolConfig; lang: AppLanguage }) {
  const t = (ar: string, fr: string, en: string) =>
    lang === "ar" ? ar : lang === "fr" ? fr : en;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Decorative icon */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative"
        style={{ background: `${config.accentColor}08` }}
      >
        <div
          className="absolute inset-0 rounded-3xl animate-pulse"
          style={{ background: `${config.accentColor}04` }}
        />
        <Icon className="w-10 h-10 relative" style={{ color: config.accentColor }} />
      </div>

      <h3
        className="text-xl font-bold text-gray-800 mb-3"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        {t(config.nameAr, config.nameFr, config.nameEn)}
      </h3>

      <p
        className="text-gray-400 text-sm max-w-sm leading-relaxed mb-8"
        style={{ fontFamily: "'Almarai', sans-serif" }}
      >
        {t(
          "أكمل تعبئة البيانات في اللوحة المقابلة ثم اضغط على زر التوليد لبدء السحر",
          "Remplissez les données dans le panneau ci-contre puis cliquez sur Générer",
          "Fill in the data in the panel and click Generate to start the magic"
        )}
      </p>

      {/* Decorative arrows */}
      <div className="flex items-center gap-2 text-gray-300">
        <Wand2 className="w-5 h-5" />
        <span className="text-xs" style={{ fontFamily: "'Almarai', sans-serif" }}>
          {t("في انتظار بياناتك...", "En attente de vos données...", "Waiting for your data...")}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN LAYOUT COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function UnifiedToolLayout({
  config,
  inputPanel,
  resultContent,
  isGenerating: isGeneratingProp = false,
  isLoading = false,
  onRegenerate = () => {},
  onDownloadPDF,
  onDownloadWord,
  customResultRenderer,
  resultPanel,
  editable = true,
  onContentEdit,
  extraActions,
  children,
  loadingMessage,
}: UnifiedToolLayoutProps) {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"input" | "result">("input");
  const resultRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Resolve aliases
  const isGenerating = isGeneratingProp || isLoading;
  const effectiveCustomRenderer = customResultRenderer || resultPanel;

  const t = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const Icon = config.icon;
  const isRTL = language === "ar";
  const hasResult = (resultContent !== null && resultContent !== undefined) || (effectiveCustomRenderer !== null && effectiveCustomRenderer !== undefined);

  // Auto-switch to result view on mobile when generation completes
  useEffect(() => {
    if (resultContent && !isGenerating) {
      setMobileView("result");
    }
  }, [resultContent, isGenerating]);

  // Copy handler
  const handleCopy = useCallback(() => {
    const textToCopy = editedContent || resultContent || "";
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success(t("تم نسخ النص بنجاح", "Texte copié avec succès", "Text copied successfully"));
    });
  }, [editedContent, resultContent, t]);

  // Print handler
  const handlePrint = useCallback(() => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <title>${t(config.nameAr, config.nameFr, config.nameEn)}</title>
            <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Almarai', sans-serif; direction: rtl; padding: 40px; line-height: 1.8; color: #1F2937; }
              h1, h2, h3 { color: ${config.accentColor}; font-family: 'Cairo', sans-serif; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>${printRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }, [config, t]);

  // Content edit handler
  const handleContentEdit = useCallback(
    (newContent: string) => {
      setEditedContent(newContent);
      onContentEdit?.(newContent);
    },
    [onContentEdit]
  );

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#F8F9FB" }}
    >
      {/* ─── Top Header Bar ─── */}
      <div
        className="sticky top-0 z-40 border-b border-gray-100"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Right: Back + Tool name */}
            <div className="flex items-center gap-3">
              <Link
                href="/teacher-tools"
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                <span style={{ fontFamily: "'Almarai', sans-serif" }}>
                  {t("الأدوات", "Outils", "Tools")}
                </span>
              </Link>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${config.accentColor}10` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.accentColor }} />
                </div>
                <span
                  className="font-bold text-gray-800 text-sm"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {t(config.nameAr, config.nameFr, config.nameEn)}
                </span>
              </div>
            </div>

            {/* Left: Mobile view toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileView("input")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mobileView === "input"
                    ? "text-white shadow-sm"
                    : "text-gray-500 bg-gray-50"
                }`}
                style={
                  mobileView === "input"
                    ? { background: config.accentColor }
                    : {}
                }
              >
                {t("الإدخال", "Saisie", "Input")}
              </button>
              <button
                onClick={() => setMobileView("result")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mobileView === "result"
                    ? "text-white shadow-sm"
                    : "text-gray-500 bg-gray-50"
                }`}
                style={
                  mobileView === "result"
                    ? { background: config.accentColor }
                    : {}
                }
              >
                {t("النتيجة", "Résultat", "Result")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Children bypass or Main Split Layout ─── */}
      {children ? (
        <div className="max-w-[1600px] mx-auto">{children}</div>
      ) : (
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
          {/* ═══ RIGHT PANEL: Input Form ═══ */}
          <div
            className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 border-s border-gray-100 bg-white ${
              mobileView === "input" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto">
              {/* Input panel header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-5 rounded-full"
                    style={{ background: config.gradient }}
                  />
                  <h2
                    className="text-base font-bold text-gray-800"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {t("بيانات الإدخال", "Données d'entrée", "Input Data")}
                  </h2>
                </div>
                <p
                  className="text-xs text-gray-400 me-3.5"
                  style={{ fontFamily: "'Almarai', sans-serif" }}
                >
                  {t(
                    "أكمل الحقول أدناه ثم اضغط على زر التوليد",
                    "Remplissez les champs ci-dessous puis cliquez sur Générer",
                    "Fill in the fields below then click Generate"
                  )}
                </p>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gray-100" />

              {/* Input form content (passed as prop) */}
              <div className="px-6 py-5">{inputPanel}</div>
            </div>
          </div>

          {/* ═══ LEFT PANEL: Results Area ═══ */}
          <div
            className={`flex-1 ${
              mobileView === "result" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
              {/* Result area */}
              <div ref={resultRef}>
                {isGenerating ? (
                  /* Smart Loader */
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <SmartLoader
                      messages={
                        language === "fr" && config.loaderMessagesFr ? config.loaderMessagesFr :
                        language === "en" && config.loaderMessagesEn ? config.loaderMessagesEn :
                        config.loaderMessages
                      }
                      accentColor={config.accentColor}
                      gradient={config.gradient}
                    />
                  </div>
                ) : resultContent ? (
                  /* Paper Result */
                  <div>
                    <div ref={printRef}>
                      {effectiveCustomRenderer || (
                        <PaperResult
                          content={editedContent || resultContent}
                          editable={editable}
                          isEditing={isEditing}
                          onContentChange={handleContentEdit}
                          accentColor={config.accentColor}
                          lang={language}
                        />
                      )}
                    </div>

                    {/* Floating Action Bar */}
                    <div className="mt-4">
                      <FloatingActionBar
                        onCopy={handleCopy}
                        onDownloadPDF={onDownloadPDF}
                        onDownloadWord={onDownloadWord}
                        onRegenerate={onRegenerate}
                        onPrint={handlePrint}
                        isEditing={isEditing}
                        onToggleEdit={() => setIsEditing(!isEditing)}
                        accentColor={config.accentColor}
                        gradient={config.gradient}
                        extraActions={extraActions}
                        lang={language}
                      />
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <EmptyState config={config} lang={language} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORT SUB-COMPONENTS for custom use
   ═══════════════════════════════════════════════════════════════════ */

export { SmartLoader, FloatingActionBar, PaperResult, EmptyState };
export type { ToolConfig as UnifiedToolConfig };
