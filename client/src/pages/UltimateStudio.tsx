import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen, Wand2, FileText, Image, Mic, ChevronDown, ChevronUp,
  Upload, Loader2, Copy, Play, Pause, Download, ArrowRight,
  Sparkles, Eye, Volume2, Check, RefreshCw, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Film, Save, FolderOpen, Trash2,
  PenLine, Clock, MoreVertical, Plus, Clapperboard, X,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { renderVideo, downloadBlob, isWasmSupported, type RenderProgress, type SceneData as VideoSceneData } from "@/lib/videoRenderer";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

// ─── Types ───
interface SceneData {
  sceneNumber: number;
  title: string;
  description: string;
  educationalContent: string;
  spokenText: string;
  visualPrompt: string;
  duration: number;
  imageUrl?: string;
  audioUrl?: string;
}

interface ScenarioData {
  title: string;
  summary: string;
  scenes: SceneData[];
}

// ─── Pipeline Steps ───
type PipelineStep = "script" | "vision" | "voice";

export default function UltimateStudio() {
  const { user } = useAuth();

  // ═══ Project State ═══
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState("مشروع جديد");
  const [showProjectsDialog, setShowProjectsDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ═══ Column 1: Source State ═══
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [fileName, setFileName] = useState("");
  const [pageInput, setPageInput] = useState("1");
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ═══ Column 2: Pipeline State ═══
  const [activeStep, setActiveStep] = useState<PipelineStep>("script");
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [numberOfScenes, setNumberOfScenes] = useState(4);
  const [language, setLanguage] = useState<"ar" | "fr">("ar");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatingImageIdx, setGeneratingImageIdx] = useState<number | null>(null);
  const [generatingAudioIdx, setGeneratingAudioIdx] = useState<number | null>(null);
  const [voiceMode, setVoiceMode] = useState<"ai" | "clone">("ai");
  const [selectedVoice, setSelectedVoice] = useState("nova");

  // ═══ Column 3: Storyboard State ═══
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({});

  // ═══ tRPC Mutations & Queries ═══
  const extractMutation = trpc.ultimateStudio.extractPageText.useMutation();
  const scenarioMutation = trpc.ultimateStudio.quickScenario.useMutation();
  const imageMutation = trpc.eduStudio.generateSceneImage.useMutation();
  const audioMutation = trpc.eduStudio.generateSceneAudio.useMutation();
  const cloneQuery = trpc.voiceCloning.getMyVoiceClone.useQuery();
  const cloneTTSMutation = trpc.voiceCloning.generateWithClonedVoice.useMutation();

  // Project management
  const saveMutation = trpc.ultimateStudio.saveProject.useMutation();
  const projectsQuery = trpc.ultimateStudio.listProjects.useQuery();
  const deleteMutation = trpc.ultimateStudio.deleteProject.useMutation();
  const renameMutation = trpc.ultimateStudio.renameProject.useMutation();
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null);
  const loadProjectQuery = trpc.ultimateStudio.loadProject.useQuery(
    { projectId: loadingProjectId! },
    { enabled: loadingProjectId !== null }
  );

  // ═══ Handle project loading ═══
  useEffect(() => {
    if (loadProjectQuery.data && loadingProjectId !== null) {
      loadProjectData(loadProjectQuery.data);
      setLoadingProjectId(null);
    }
  }, [loadProjectQuery.data, loadingProjectId]);

  // ═══ Auto-Save Logic ═══
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProject = useCallback(async (silent = false) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const result = await saveMutation.mutateAsync({
        projectId: projectId ?? undefined,
        title: projectTitle || "مشروع بدون عنوان",
        pdfFileName: fileName || undefined,
        currentPage,
        extractedText: extractedText || undefined,
        scriptContent: extractedText || undefined,
        scenarioData: scenario?.scenes || undefined,
        status: scenario ? "in_progress" : "draft",
      });
      if (!projectId && result.id) {
        setProjectId(result.id);
      }
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      if (!silent) toast.success("تم حفظ المشروع");
    } catch {
      if (!silent) toast.error("فشل في حفظ المشروع");
    } finally {
      setIsSaving(false);
    }
  }, [user, projectId, projectTitle, fileName, currentPage, extractedText, scenario, saveMutation]);

  // Mark changes as unsaved when state changes
  useEffect(() => {
    if (extractedText || scenario) {
      setHasUnsavedChanges(true);
    }
  }, [extractedText, scenario]);

  // Auto-save every 30 seconds when there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges && user) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveProject(true);
      }, 30000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [hasUnsavedChanges, user, saveProject]);

  // ═══ Load Project ═══
  const loadProjectData = (project: any) => {
    setProjectId(project.id);
    setProjectTitle(project.title);
    setFileName(project.pdfFileName || "");
    setCurrentPage(project.currentPage || 1);
    setPageInput(String(project.currentPage || 1));
    setExtractedText(project.extractedText || project.scriptContent || "");
    if (project.scenarioData && Array.isArray(project.scenarioData)) {
      setScenario({
        title: project.title,
        summary: project.summary || "",
        scenes: project.scenarioData as SceneData[],
      });
    }
    setHasUnsavedChanges(false);
    setLastSavedAt(project.updatedAt ? new Date(project.updatedAt) : null);
    setShowProjectsDialog(false);
    toast.success(`تم تحميل المشروع "${project.title}"`);
  };

  // ═══ New Project ═══
  const startNewProject = () => {
    setProjectId(null);
    setProjectTitle("مشروع جديد");
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setFileName("");
    setPageInput("1");
    setExtractedText("");
    setScenario(null);
    setActiveStep("script");
    setHasUnsavedChanges(false);
    setLastSavedAt(null);
    setShowProjectsDialog(false);
    toast.info("مشروع جديد");
  };

  // ═══ PDF Loading ═══
  const loadPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setPageInput("1");
      setFileName(file.name);
      if (projectTitle === "مشروع جديد") {
        setProjectTitle(file.name.replace(".pdf", ""));
      }
      toast.success(`تم تحميل "${file.name}" (${doc.numPages} صفحة)`);
    } catch {
      toast.error("فشل في تحميل ملف PDF");
    }
  };

  // ═══ Render PDF Page ═══
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch {
      console.error("Failed to render page", pageNum);
    }
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, renderPage]);

  // ═══ Extract Text from Current Page ═══
  const handleExtract = async () => {
    if (!canvasRef.current) return;
    setIsExtracting(true);
    try {
      const imageBase64 = canvasRef.current.toDataURL("image/png");
      const result = await extractMutation.mutateAsync({
        imageBase64,
        pageNumber: currentPage,
        fileName,
      });
      if (result.text) {
        setExtractedText(result.text);
        toast.success(`تم استخراج النص من الصفحة ${currentPage}`);
      } else {
        toast.error("لم يتم العثور على نص في هذه الصفحة");
      }
    } catch {
      toast.error("فشل في استخراج النص");
    } finally {
      setIsExtracting(false);
    }
  };

  // ═══ Navigate Pages ═══
  const goToPage = (num: number) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      setPageInput(String(num));
    }
  };

  // ═══ Generate Scenario ═══
  const handleGenerateScript = async () => {
    if (!extractedText.trim()) {
      toast.error("استخرج النص أولاً من الكتاب المدرسي");
      return;
    }
    setIsGeneratingScript(true);
    try {
      const result = await scenarioMutation.mutateAsync({
        text: extractedText,
        numberOfScenes,
        language,
      });
      setScenario(result);
      setActiveStep("vision");
      toast.success(`تم توليد سيناريو "${result.title}" (${result.scenes.length} مشاهد)`);
    } catch {
      toast.error("فشل في توليد السيناريو");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // ═══ Generate Image for Scene ═══
  const handleGenerateImage = async (sceneIdx: number) => {
    if (!scenario) return;
    const scene = scenario.scenes[sceneIdx];
    setGeneratingImageIdx(sceneIdx);
    try {
      const result = await imageMutation.mutateAsync({
        sceneNumber: scene.sceneNumber,
        visualPrompt: scene.visualPrompt,
      });
      setScenario(prev => {
        if (!prev) return prev;
        const updated = { ...prev, scenes: [...prev.scenes] };
        updated.scenes[sceneIdx] = { ...updated.scenes[sceneIdx], imageUrl: result.imageUrl };
        return updated;
      });
      toast.success(`تم توليد صورة المشهد ${scene.sceneNumber}`);
    } catch {
      toast.error(`فشل في توليد صورة المشهد ${scene.sceneNumber}`);
    } finally {
      setGeneratingImageIdx(null);
    }
  };

  // ═══ Generate Audio for Scene ═══
  const handleGenerateAudio = async (sceneIdx: number) => {
    if (!scenario) return;
    const scene = scenario.scenes[sceneIdx];
    setGeneratingAudioIdx(sceneIdx);
    try {
      let audioUrl: string;
      if (voiceMode === "clone" && cloneQuery.data?.id) {
        const result = await cloneTTSMutation.mutateAsync({
          text: scene.spokenText,
          voiceCloneId: cloneQuery.data.id,
          sceneIndex: sceneIdx,
        });
        audioUrl = result.audioUrl;
      } else {
        const result = await audioMutation.mutateAsync({
          sceneNumber: scene.sceneNumber,
          spokenText: scene.spokenText,
          voice: selectedVoice as any,
        });
        audioUrl = result.audioUrl;
      }
      setScenario(prev => {
        if (!prev) return prev;
        const updated = { ...prev, scenes: [...prev.scenes] };
        updated.scenes[sceneIdx] = { ...updated.scenes[sceneIdx], audioUrl };
        return updated;
      });
      toast.success(`تم توليد صوت المشهد ${scene.sceneNumber}`);
    } catch {
      toast.error(`فشل في توليد صوت المشهد ${scene.sceneNumber}`);
    } finally {
      setGeneratingAudioIdx(null);
    }
  };

  // ═══ Audio Playback ═══
  const toggleAudio = (sceneIdx: number, url: string) => {
    if (playingAudio === sceneIdx) {
      audioRefs.current[sceneIdx]?.pause();
      setPlayingAudio(null);
    } else {
      Object.values(audioRefs.current).forEach(a => a?.pause());
      if (!audioRefs.current[sceneIdx]) {
        audioRefs.current[sceneIdx] = new Audio(url);
        audioRefs.current[sceneIdx].onended = () => setPlayingAudio(null);
      }
      audioRefs.current[sceneIdx].play();
      setPlayingAudio(sceneIdx);
    }
  };

  // ═══ Copy to Clipboard ═══
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  // ═══ Video Export State ═══
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<RenderProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Check if all scenes have both image and audio (ready for video export)
  const canExportVideo = useMemo(() => {
    if (!scenario || scenario.scenes.length === 0) return false;
    return scenario.scenes.every(s => s.imageUrl && s.audioUrl);
  }, [scenario]);

  // ═══ Export Video (FFmpeg.wasm in browser) ═══
  const handleExportVideo = async () => {
    if (!scenario || !canExportVideo) return;

    // Check WASM support
    if (!isWasmSupported()) {
      toast.error("متصفحك لا يدعم WebAssembly. يرجى استخدام Google Chrome أحدث إصدار.");
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress({ phase: 'loading', percent: 0, message: 'جاري التحضير...' });

    try {
      const videoScenes: VideoSceneData[] = scenario.scenes.map(s => ({
        sceneNumber: s.sceneNumber,
        imageUrl: s.imageUrl!,
        audioUrl: s.audioUrl!,
        duration: s.duration,
      }));

      const blob = await renderVideo(videoScenes, (progress) => {
        setExportProgress(progress);
      });

      // Auto-download
      const filename = `Leader-${scenario.title || 'Lesson'}-Video.mp4`;
      downloadBlob(blob, filename);
      toast.success("تم تصدير الفيديو بنجاح! تحقق من مجلد التحميلات.");
    } catch (err: any) {
      console.error('[VideoExport]', err);
      if (err.message === 'WASM_NOT_SUPPORTED') {
        setExportError('متصفحك يحتاج إلى تحديث لدعم هذه الميزة الخارقة. يرجى استخدام Google Chrome أحدث إصدار.');
      } else if (err.message === 'NO_SCENES') {
        setExportError('لا توجد مشاهد لتصديرها.');
      } else {
        setExportError(err.message || 'حدث خطأ أثناء إنشاء الفيديو. حاول مرة أخرى.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // ═══ Pipeline Step Config ═══
  const steps: { key: PipelineStep; icon: typeof FileText; label: string; labelEn: string; color: string }[] = [
    { key: "script", icon: FileText, label: "السيناريو", labelEn: "Edu-Script", color: "from-blue-500 to-blue-600" },
    { key: "vision", icon: Image, label: "الأوامر البصرية", labelEn: "Edu-Vision", color: "from-purple-500 to-purple-600" },
    { key: "voice", icon: Mic, label: "التعليق الصوتي", labelEn: "Edu-Voice", color: "from-green-500 to-green-600" },
  ];

  const hasClonedVoice = cloneQuery.data?.status === "ready";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      {/* ═══ Top Bar ═══ */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Ultimate Studio</h1>
                <span className="text-xs text-white/40">|</span>
                <span className="text-sm text-amber-400 font-bold truncate max-w-[200px]">{projectTitle}</span>
                {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="تغييرات غير محفوظة" />}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <span>الكتاب ← السيناريو ← الفيديو</span>
                {lastSavedAt && (
                  <>
                    <span>|</span>
                    <Clock className="w-3 h-3" />
                    <span>آخر حفظ: {lastSavedAt.toLocaleTimeString("ar-TN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* New Project */}
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={startNewProject}
            >
              <Plus className="w-4 h-4 ml-1" /> جديد
            </Button>

            {/* Open Project */}
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                projectsQuery.refetch();
                setShowProjectsDialog(true);
              }}
            >
              <FolderOpen className="w-4 h-4 ml-1" /> مشاريعي
            </Button>

            {/* Save */}
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => saveProject(false)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Save className="w-4 h-4 ml-1" />}
              حفظ
            </Button>

            {/* Export */}
            {scenario && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  const content = scenario.scenes.map(s =>
                    `## المشهد ${s.sceneNumber}: ${s.title}\n\n**المحتوى:** ${s.educationalContent}\n\n**التعليق الصوتي:** ${s.spokenText}\n\n**الأمر البصري:** ${s.visualPrompt}\n\n---`
                  ).join("\n\n");
                  const blob = new Blob([`# ${scenario.title}\n\n${scenario.summary}\n\n${content}`], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${scenario.title || "scenario"}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("تم تصدير خطة العمل");
                }}
              >
                <Download className="w-4 h-4 ml-1" /> تصدير MD
              </Button>
            )}

            {/* Export Video MP4 */}
            {scenario && (
              <Button
                size="sm"
                className={canExportVideo
                  ? "bg-gradient-to-l from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-red-500/20 animate-pulse hover:animate-none"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
                }
                onClick={handleExportVideo}
                disabled={!canExportVideo || isExporting}
                title={!canExportVideo ? "يجب توليد الصور والصوت لجميع المشاهد أولاً" : "تصدير كفيديو MP4"}
              >
                <Clapperboard className="w-4 h-4 ml-1" /> تصدير فيديو MP4
              </Button>
            )}
            <span className="text-xs text-white/40">مرحباً {user?.name?.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {/* ═══ Three Column Layout ═══ */}
      <div className="flex h-[calc(100vh-57px)] max-w-[1920px] mx-auto">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* COLUMN 1: THE SOURCE (30%) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="w-[30%] border-l border-white/10 flex flex-col bg-black/20">
          {/* Header */}
          <div className="p-3 border-b border-white/10 bg-gradient-to-l from-amber-500/10 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">المصدر والاستخراج</h2>
              <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">The Source</span>
            </div>
            {!pdfDoc && (
              <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 ml-1" /> تحميل كتاب مدرسي (PDF)
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && loadPDF(e.target.files[0])}
            />
          </div>

          {/* PDF Viewer */}
          {pdfDoc ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* PDF Controls */}
              <div className="flex items-center justify-between px-3 py-2 bg-black/30 border-b border-white/10">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-white/70 min-w-[60px] text-center">{currentPage} / {totalPages}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-[10px] text-white/50">{Math.round(scale * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70" onClick={() => setScale(s => Math.min(3, s + 0.2))}>
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70" onClick={() => fileInputRef.current?.click()}>
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto p-2 flex justify-center">
                <canvas ref={canvasRef} className="rounded-lg shadow-lg max-w-full" />
              </div>

              {/* Page Extractor */}
              <div className="p-3 border-t border-white/10 bg-black/30">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goToPage(Number(pageInput))}
                    className="w-20 h-8 text-center bg-white/10 border-white/20 text-white text-sm"
                    placeholder="صفحة"
                  />
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold"
                    onClick={handleExtract}
                    disabled={isExtracting}
                  >
                    {isExtracting ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Wand2 className="w-4 h-4 ml-1" />}
                    استخراج النص
                  </Button>
                </div>

                {/* Extracted Text */}
                {extractedText && (
                  <div className="relative">
                    <Textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="bg-white/5 border-white/20 text-white text-xs h-32 resize-none"
                      dir="auto"
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-white/50" onClick={() => copyText(extractedText)}>
                        <Copy className="w-3 h-3 ml-1" /> نسخ
                      </Button>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        className="h-6 text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                        onClick={() => {
                          setActiveStep("script");
                          toast.info("النص جاهز في محرك الإنتاج ← اضغط 'توليد السيناريو'");
                        }}
                      >
                        <ArrowRight className="w-3 h-3 ml-1" /> أرسل للإنتاج
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">حمّل كتاباً مدرسياً (PDF) للبدء</p>
                <p className="text-white/20 text-xs mt-1">سيظهر هنا مع إمكانية استخراج النص من أي صفحة</p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* COLUMN 2: THE PIPELINE ENGINE (30%) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="w-[30%] border-l border-white/10 flex flex-col bg-black/10">
          {/* Header */}
          <div className="p-3 border-b border-white/10 bg-gradient-to-l from-blue-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-white">محرك الإنتاج المتسلسل</h2>
              <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Pipeline</span>
            </div>
          </div>

          {/* Accordion Steps */}
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {steps.map((step, idx) => {
              const isActive = activeStep === step.key;
              const StepIcon = step.icon;
              const stepNumber = idx + 1;
              const isCompleted = (step.key === "script" && scenario) ||
                (step.key === "vision" && scenario?.scenes.some(s => s.imageUrl)) ||
                (step.key === "voice" && scenario?.scenes.some(s => s.audioUrl));

              return (
                <div key={step.key} className={`rounded-xl border transition-all duration-300 ${isActive ? "border-white/20 bg-white/5" : "border-white/5 bg-black/20"}`}>
                  {/* Step Header */}
                  <button
                    className="w-full flex items-center gap-3 p-3 text-right"
                    onClick={() => setActiveStep(step.key)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${step.color} ${isCompleted ? "ring-2 ring-green-400/50" : ""}`}>
                      {isCompleted ? <Check className="w-4 h-4 text-white" /> : <StepIcon className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">خطوة {stepNumber}</span>
                        <span className="text-sm font-bold text-white">{step.label}</span>
                        <span className="text-[10px] text-white/30">{step.labelEn}</span>
                      </div>
                    </div>
                    {isActive ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                  </button>

                  {/* Step Content */}
                  {isActive && (
                    <div className="px-3 pb-3 border-t border-white/5">
                      {/* ── STEP 1: Edu-Script ── */}
                      {step.key === "script" && (
                        <div className="pt-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <label className="text-[10px] text-white/50 block mb-1">عدد المشاهد</label>
                              <Input
                                type="number"
                                min={2}
                                max={8}
                                value={numberOfScenes}
                                onChange={(e) => setNumberOfScenes(Number(e.target.value))}
                                className="h-8 bg-white/5 border-white/20 text-white text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-white/50 block mb-1">اللغة</label>
                              <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as "ar" | "fr")}
                                className="w-full h-8 rounded-md bg-white/5 border border-white/20 text-white text-sm px-2"
                              >
                                <option value="ar">عربية</option>
                                <option value="fr">فرنسية</option>
                              </select>
                            </div>
                          </div>

                          {extractedText ? (
                            <div className="bg-white/5 rounded-lg p-2 max-h-20 overflow-auto">
                              <p className="text-[10px] text-white/40 mb-1">النص المستخرج:</p>
                              <p className="text-xs text-white/70 line-clamp-3" dir="auto">{extractedText}</p>
                            </div>
                          ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                              <p className="text-xs text-amber-400">استخرج النص من الكتاب أولاً (العمود الأيمن)</p>
                            </div>
                          )}

                          <Button
                            className="w-full bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
                            onClick={handleGenerateScript}
                            disabled={isGeneratingScript || !extractedText}
                          >
                            {isGeneratingScript ? (
                              <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري توليد السيناريو...</>
                            ) : (
                              <><FileText className="w-4 h-4 ml-2" /> توليد السيناريو</>
                            )}
                          </Button>

                          {scenario && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                              <p className="text-xs text-green-400 font-bold">{scenario.title}</p>
                              <p className="text-[10px] text-green-400/70 mt-1">{scenario.scenes.length} مشاهد جاهزة ← انتقل لـ Edu-Vision</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── STEP 2: Edu-Vision ── */}
                      {step.key === "vision" && (
                        <div className="pt-3 space-y-2">
                          {scenario ? (
                            scenario.scenes.map((scene, idx) => (
                              <div key={idx} className="bg-white/5 rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-white">مشهد {scene.sceneNumber}: {scene.title}</span>
                                  {scene.imageUrl && <Check className="w-3 h-3 text-green-400" />}
                                </div>
                                <p className="text-[10px] text-white/50 mb-2 line-clamp-2 font-mono" dir="ltr">{scene.visualPrompt}</p>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px] flex-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                                    onClick={() => handleGenerateImage(idx)}
                                    disabled={generatingImageIdx === idx}
                                  >
                                    {generatingImageIdx === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3 ml-1" />}
                                    {scene.imageUrl ? "إعادة التوليد" : "توليد الصورة"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-white/40"
                                    onClick={() => copyText(scene.visualPrompt)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <Eye className="w-8 h-8 text-white/10 mx-auto mb-2" />
                              <p className="text-xs text-white/30">أكمل الخطوة 1 أولاً (توليد السيناريو)</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── STEP 3: Edu-Voice ── */}
                      {step.key === "voice" && (
                        <div className="pt-3 space-y-3">
                          {/* Voice Mode Selector */}
                          <div className="flex gap-2">
                            <button
                              className={`flex-1 p-2 rounded-lg border text-xs font-bold transition-all ${voiceMode === "ai" ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-white/5 border-white/10 text-white/50"}`}
                              onClick={() => setVoiceMode("ai")}
                            >
                              <Volume2 className="w-4 h-4 mx-auto mb-1" />
                              أصوات AI
                            </button>
                            <button
                              className={`flex-1 p-2 rounded-lg border text-xs font-bold transition-all ${voiceMode === "clone" ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-white/5 border-white/10 text-white/50"} ${!hasClonedVoice ? "opacity-50" : ""}`}
                              onClick={() => hasClonedVoice ? setVoiceMode("clone") : toast.error("أنشئ بصمتك الصوتية أولاً في /my-voice")}
                            >
                              <Mic className="w-4 h-4 mx-auto mb-1" />
                              صوتي المستنسخ
                            </button>
                          </div>

                          {voiceMode === "ai" && (
                            <select
                              value={selectedVoice}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              className="w-full h-8 rounded-md bg-white/5 border border-white/20 text-white text-sm px-2"
                            >
                              <option value="nova">Nova (أنثوي - عربي)</option>
                              <option value="alloy">Alloy (محايد)</option>
                              <option value="echo">Echo (ذكوري)</option>
                              <option value="fable">Fable (سردي)</option>
                              <option value="onyx">Onyx (عميق)</option>
                              <option value="shimmer">Shimmer (ناعم)</option>
                            </select>
                          )}

                          {scenario ? (
                            scenario.scenes.map((scene, idx) => (
                              <div key={idx} className="bg-white/5 rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-white">مشهد {scene.sceneNumber}</span>
                                  {scene.audioUrl && <Check className="w-3 h-3 text-green-400" />}
                                </div>
                                <p className="text-[10px] text-white/60 mb-2 line-clamp-2" dir="auto">{scene.spokenText}</p>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px] flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                    onClick={() => handleGenerateAudio(idx)}
                                    disabled={generatingAudioIdx === idx}
                                  >
                                    {generatingAudioIdx === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3 ml-1" />}
                                    {scene.audioUrl ? "إعادة التوليد" : "توليد الصوت"}
                                  </Button>
                                  {scene.audioUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-white/40"
                                      onClick={() => toggleAudio(idx, scene.audioUrl!)}
                                    >
                                      {playingAudio === idx ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <Mic className="w-8 h-8 text-white/10 mx-auto mb-2" />
                              <p className="text-xs text-white/30">أكمل الخطوة 1 أولاً</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* COLUMN 3: THE OUTPUT STORYBOARD (40%) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="w-[40%] flex flex-col bg-black/5">
          {/* Header */}
          <div className="p-3 border-b border-white/10 bg-gradient-to-l from-green-500/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-green-400" />
              <h2 className="text-sm font-bold text-white">شاشة العرض النهائية</h2>
              <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Storyboard</span>
            </div>
            <div className="flex items-center gap-2">
              {scenario && (
                <span className="text-[10px] text-white/40">{scenario.scenes.length} مشاهد</span>
              )}
              {scenario && canExportVideo && (
                <Button
                  size="sm"
                  className="h-7 text-[11px] bg-gradient-to-l from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-red-500/20"
                  onClick={handleExportVideo}
                  disabled={isExporting}
                >
                  <Clapperboard className="w-3.5 h-3.5 ml-1" /> تصدير MP4
                </Button>
              )}
            </div>
          </div>

          {/* Storyboard Content */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {scenario ? (
              <>
                {/* Project Title */}
                <div className="bg-gradient-to-l from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3">
                  <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
                  <p className="text-xs text-white/60 mt-1">{scenario.summary}</p>
                </div>

                {/* Scene Cards */}
                {scenario.scenes.map((scene, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10 overflow-hidden">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] text-black font-bold">{scene.sceneNumber}</span>
                          {scene.title}
                        </CardTitle>
                        <span className="text-[10px] text-white/30">{scene.duration}s</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {/* Image */}
                      {scene.imageUrl ? (
                        <div className="relative rounded-lg overflow-hidden">
                          <img src={scene.imageUrl} alt={scene.title} className="w-full h-40 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-[10px] text-white/70 line-clamp-1" dir="auto">{scene.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                          <div className="text-center">
                            <Image className="w-6 h-6 text-white/10 mx-auto mb-1" />
                            <p className="text-[10px] text-white/20">لم تُولّد الصورة بعد</p>
                          </div>
                        </div>
                      )}

                      {/* Educational Content */}
                      <div className="bg-blue-500/5 rounded-lg p-2 border border-blue-500/10">
                        <p className="text-[10px] text-blue-400/70 font-bold mb-1">المحتوى التعليمي</p>
                        <p className="text-xs text-white/70" dir="auto">{scene.educationalContent}</p>
                      </div>

                      {/* Visual Prompt */}
                      <div className="bg-purple-500/5 rounded-lg p-2 border border-purple-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] text-purple-400/70 font-bold">الأمر البصري</p>
                          <Button variant="ghost" size="sm" className="h-5 text-[10px] text-purple-400/50 p-0" onClick={() => copyText(scene.visualPrompt)}>
                            <Copy className="w-3 h-3 ml-1" /> نسخ
                          </Button>
                        </div>
                        <p className="text-[10px] text-white/50 font-mono" dir="ltr">{scene.visualPrompt}</p>
                      </div>

                      {/* Spoken Text + Audio */}
                      <div className="bg-green-500/5 rounded-lg p-2 border border-green-500/10">
                        <p className="text-[10px] text-green-400/70 font-bold mb-1">التعليق الصوتي</p>
                        <p className="text-xs text-white/70 mb-2" dir="auto">{scene.spokenText}</p>
                        {scene.audioUrl && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-6 text-[10px] bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              onClick={() => toggleAudio(idx, scene.audioUrl!)}
                            >
                              {playingAudio === idx ? <Pause className="w-3 h-3 ml-1" /> : <Play className="w-3 h-3 ml-1" />}
                              {playingAudio === idx ? "إيقاف" : "تشغيل"}
                            </Button>
                            <a href={scene.audioUrl} download className="text-[10px] text-white/30 hover:text-white/50">
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Film className="w-10 h-10 text-white/10" />
                  </div>
                  <h3 className="text-lg font-bold text-white/20 mb-2">لوحة القصة المصورة</h3>
                  <p className="text-sm text-white/10 max-w-xs mx-auto">
                    ستظهر هنا بطاقات المشاهد حية أثناء توليدها من محرك الإنتاج
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6 text-white/10">
                    <BookOpen className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4" />
                    <Sparkles className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4" />
                    <Film className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-white/10 mt-2">الكتاب ← المعالجة ← النتيجة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Video Export Overlay ═══ */}
      {(isExporting || exportError) && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center" dir="rtl">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            {exportError ? (
              /* Error State */
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">فشل في إنشاء الفيديو</h3>
                <p className="text-sm text-white/60 mb-6">{exportError}</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => { setExportError(null); handleExportVideo(); }}
                  >
                    <RefreshCw className="w-4 h-4 ml-1" /> إعادة المحاولة
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => { setExportError(null); setExportProgress(null); }}
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            ) : (
              /* Progress State */
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 relative">
                  <Clapperboard className="w-10 h-10 text-amber-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">جاري إنشاء الفيديو</h3>
                <p className="text-sm text-amber-400/80 mb-6">{exportProgress?.message || 'جاري التحضير...'}</p>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden mb-3 border border-white/10">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${exportProgress?.percent || 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow">{exportProgress?.percent || 0}%</span>
                  </div>
                </div>

                {/* Phase indicator */}
                <div className="flex items-center justify-center gap-4 text-[10px] text-white/40">
                  <span className={exportProgress?.phase === 'loading' ? 'text-amber-400 font-bold' : ''}>تحميل المحرك</span>
                  <span>→</span>
                  <span className={exportProgress?.phase === 'preparing' ? 'text-amber-400 font-bold' : ''}>تحضير الملفات</span>
                  <span>→</span>
                  <span className={exportProgress?.phase === 'rendering' ? 'text-amber-400 font-bold' : ''}>دمج المشاهد</span>
                  <span>→</span>
                  <span className={exportProgress?.phase === 'finalizing' ? 'text-amber-400 font-bold' : ''}>إنهاء</span>
                </div>

                <p className="text-[10px] text-white/20 mt-6">يتم المعالجة في متصفحك مباشرة - لا يتم إرسال أي بيانات للسيرفر</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Projects Dialog ═══ */}
      <Dialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-400" />
              مشاريعي المحفوظة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {projectsQuery.isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/30" />
                <p className="text-xs text-white/30 mt-2">جاري التحميل...</p>
              </div>
            ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
              projectsQuery.data.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group cursor-pointer"
                  onClick={() => {
                    setLoadingProjectId(p.id);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Film className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      {p.pdfFileName && <span>{p.pdfFileName}</span>}
                      <span>{p.status === "draft" ? "مسودة" : p.status === "in_progress" ? "قيد العمل" : "مكتمل"}</span>
                      <span>{new Date(p.updatedAt).toLocaleDateString("ar-TN")}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("هل تريد حذف هذا المشروع؟")) {
                        try {
                          await deleteMutation.mutateAsync({ projectId: p.id });
                          projectsQuery.refetch();
                          toast.success("تم حذف المشروع");
                        } catch {
                          toast.error("فشل في حذف المشروع");
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/30">لا توجد مشاريع محفوظة بعد</p>
                <p className="text-xs text-white/20 mt-1">ابدأ مشروعاً جديداً واحفظه</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/20 text-white" onClick={() => setShowProjectsDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
