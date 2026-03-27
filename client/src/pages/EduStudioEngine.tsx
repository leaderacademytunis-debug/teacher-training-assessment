import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useExtractionStore } from "@/stores/extractionStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Film, Clapperboard, Sparkles, Loader2, Copy, Check, Download,
  ChevronRight, Camera, Mic, FileText, Palette,
  ArrowRight, BookOpen, Clock, Wand2, Play, Layers,
  CheckCircle2, Circle, Lock, Image as ImageIcon,
  ArrowLeft, Save, FolderOpen, Pause, Volume2, ZoomIn, X,
  Trash2, RotateCcw, Coins, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";

// Types
interface Scene {
  sceneNumber: number;
  title: string;
  description: string;
  educationalContent: string;
  duration: number;
  transition: string;
}

interface VisualPrompt {
  sceneNumber: number;
  visualPrompt: string;
  negativePrompt: string;
  suggestedTool: string;
  aspectRatio: string;
}

interface Voiceover {
  sceneNumber: number;
  spokenText: string;
  performanceNotes: string;
  pace: string;
  emphasis: string[];
  pausePoints: string[];
  estimatedDuration: number;
  emotionalTone: string;
}

interface SceneCard {
  scene: Scene;
  visualPrompt?: VisualPrompt;
  voiceover?: Voiceover;
  generatedImageUrl?: string;
  generatedAudioUrl?: string;
  imageLoading?: boolean;
  audioLoading?: boolean;
}

type PipelineStep = "scenario" | "visual" | "voiceover";

export default function EduStudioEngine() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [, navigate] = useLocation();

  // Zustand store
  const { extracted_payload, sourceInfo } = useExtractionStore();

  // Reference text
  const [referenceText, setReferenceText] = useState("");
  const [payloadApplied, setPayloadApplied] = useState(false);

  // Pipeline state
  const [currentStep, setCurrentStep] = useState<PipelineStep>("scenario");
  const [scenarioData, setScenarioData] = useState<{ title: string; summary: string; scenes: Scene[] } | null>(null);
  const [visualPrompts, setVisualPrompts] = useState<VisualPrompt[]>([]);
  const [voiceovers, setVoiceovers] = useState<Voiceover[]>([]);

  // Media state per scene
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatedAudios, setGeneratedAudios] = useState<Record<number, string>>({});
  const [imageLoadingScenes, setImageLoadingScenes] = useState<Set<number>>(new Set());
  const [audioLoadingScenes, setAudioLoadingScenes] = useState<Set<number>>(new Set());

  // Settings
  const [numberOfScenes, setNumberOfScenes] = useState(4);
  const [visualStyle, setVisualStyle] = useState<"3d_animation" | "2d_cartoon" | "realistic" | "whiteboard" | "cinematic">("3d_animation");
  const [voiceLanguage, setVoiceLanguage] = useState<"ar" | "fr" | "en">("ar");
  const [voiceTone, setVoiceTone] = useState<"enthusiastic" | "calm" | "professional" | "storytelling">("enthusiastic");
  const [ttsVoice, setTtsVoice] = useState<"alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer">("nova");

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active scene for detail view
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);

  // Image lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Audio playback
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});
  const [playingScene, setPlayingScene] = useState<number | null>(null);

  // Project saving
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Voice clone integration
  const [voiceMode, setVoiceMode] = useState<"standard" | "cloned">("standard");
  const voiceCloneQuery = trpc.voiceCloning.getMyVoiceClone.useQuery();
  const pointsQuery = trpc.voiceCloning.getMyPoints.useQuery();
  const clonedAudioMut = trpc.voiceCloning.generateWithClonedVoice.useMutation();

  // Mutations
  const scenarioMut = trpc.eduStudio.generateScenario.useMutation();
  const visualMut = trpc.eduStudio.generateVisualPrompts.useMutation();
  const voiceoverMut = trpc.eduStudio.generateVoiceover.useMutation();
  const imageGenMut = trpc.eduStudio.generateSceneImage.useMutation();
  const audioGenMut = trpc.eduStudio.generateSceneAudio.useMutation();
  const saveProjectMut = trpc.eduStudio.saveProject.useMutation();

  // Auto-fill from library
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "library" && extracted_payload && !payloadApplied) {
      setReferenceText(extracted_payload);
      setPayloadApplied(true);
      toast.success(t(
        "تم استيراد النص من المكتبة — جاهز للتحويل إلى فيديو",
        "Texte importé de la bibliothèque — prêt pour la conversion",
        "Text imported from library — ready for conversion"
      ));
    }
  }, [extracted_payload, payloadApplied]);

  // Load project from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    if (projectId) {
      setCurrentProjectId(parseInt(projectId));
    }
  }, []);

  // Load project data
  const projectQuery = trpc.eduStudio.getProject.useQuery(
    { id: currentProjectId! },
    { enabled: !!currentProjectId }
  );

  useEffect(() => {
    if (projectQuery.data && !payloadApplied) {
      const p = projectQuery.data;
      if (p.referenceText) setReferenceText(p.referenceText);
      if (p.scenarioData) {
        try {
          const sd = typeof p.scenarioData === "string" ? JSON.parse(p.scenarioData) : p.scenarioData;
          setScenarioData(sd);
        } catch {}
      }
      if (p.visualPromptsData) {
        try {
          const vp = typeof p.visualPromptsData === "string" ? JSON.parse(p.visualPromptsData) : p.visualPromptsData;
          setVisualPrompts(vp);
        } catch {}
      }
      if (p.voiceoverData) {
        try {
          const vo = typeof p.voiceoverData === "string" ? JSON.parse(p.voiceoverData) : p.voiceoverData;
          setVoiceovers(vo);
        } catch {}
      }
      if (p.generatedImages) {
        try {
          const gi = typeof p.generatedImages === "string" ? JSON.parse(p.generatedImages) : p.generatedImages;
          setGeneratedImages(gi);
        } catch {}
      }
      if (p.generatedAudios) {
        try {
          const ga = typeof p.generatedAudios === "string" ? JSON.parse(p.generatedAudios) : p.generatedAudios;
          setGeneratedAudios(ga);
        } catch {}
      }
      if (p.visualStyle) setVisualStyle(p.visualStyle as any);
      if (p.voiceLanguage) setVoiceLanguage(p.voiceLanguage as any);
      if (p.voiceTone) setVoiceTone(p.voiceTone as any);
      setPayloadApplied(true);
      // Set current step based on what's loaded
      if (p.voiceoverData) setCurrentStep("voiceover");
      else if (p.visualPromptsData) setCurrentStep("voiceover");
      else if (p.scenarioData) setCurrentStep("visual");
    }
  }, [projectQuery.data]);

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(t("تم النسخ!", "Copié !", "Copied!"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Step 1: Generate Scenario
  const handleGenerateScenario = async () => {
    if (!referenceText.trim()) {
      toast.error(t("أدخل النص المرجعي أولاً", "Entrez le texte de référence", "Enter reference text first"));
      return;
    }
    try {
      const result = await scenarioMut.mutateAsync({ referenceText: referenceText.trim(), numberOfScenes });
      setScenarioData(result);
      setVisualPrompts([]);
      setVoiceovers([]);
      setGeneratedImages({});
      setGeneratedAudios({});
      setCurrentStep("visual");
      toast.success(t(`تم توليد ${result.scenes.length} مشاهد بنجاح!`, `${result.scenes.length} scènes générées !`, `${result.scenes.length} scenes generated!`));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد السيناريو", "Échec de la génération", "Generation failed"));
    }
  };

  // Step 2: Generate Visual Prompts
  const handleGenerateVisuals = async () => {
    if (!scenarioData) return;
    try {
      const result = await visualMut.mutateAsync({
        scenes: scenarioData.scenes.map(s => ({ sceneNumber: s.sceneNumber, title: s.title, description: s.description, educationalContent: s.educationalContent })),
        visualStyle,
      });
      setVisualPrompts(result.prompts);
      setCurrentStep("voiceover");
      toast.success(t("تم توليد الأوامر البصرية!", "Prompts visuels générés !", "Visual prompts generated!"));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد الأوامر البصرية", "Échec", "Failed"));
    }
  };

  // Step 3: Generate Voiceover
  const handleGenerateVoiceover = async () => {
    if (!scenarioData) return;
    try {
      const result = await voiceoverMut.mutateAsync({
        scenes: scenarioData.scenes.map(s => ({ sceneNumber: s.sceneNumber, title: s.title, educationalContent: s.educationalContent, duration: s.duration })),
        voiceLanguage, voiceTone,
      });
      setVoiceovers(result.voiceovers);
      toast.success(t("تم توليد أوامر الصوت!", "Scripts voix générés !", "Voiceover scripts generated!"));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد أوامر الصوت", "Échec", "Failed"));
    }
  };

  // Generate Image for a scene
  const handleGenerateImage = async (sceneNumber: number, visualPrompt: string) => {
    setImageLoadingScenes(prev => new Set([...Array.from(prev), sceneNumber]));
    try {
      const result = await imageGenMut.mutateAsync({ sceneNumber, visualPrompt });
      if (result.imageUrl) {
        setGeneratedImages(prev => ({ ...prev, [sceneNumber]: result.imageUrl }));
        toast.success(t(`تم توليد صورة المشهد ${sceneNumber}!`, `Image scène ${sceneNumber} générée !`, `Scene ${sceneNumber} image generated!`));
      }
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد الصورة", "Échec de la génération d'image", "Image generation failed"));
    } finally {
      setImageLoadingScenes(prev => { const s = new Set(Array.from(prev)); s.delete(sceneNumber); return s; });
    }
  };

  // Generate Audio for a scene (standard or cloned voice)
  const handleGenerateAudio = async (sceneNumber: number, spokenText: string) => {
    setAudioLoadingScenes(prev => new Set([...Array.from(prev), sceneNumber]));
    try {
      if (voiceMode === "cloned" && voiceCloneQuery.data?.status === "ready") {
        // Use cloned voice (costs points)
        const result = await clonedAudioMut.mutateAsync({
          text: spokenText,
          voiceCloneId: voiceCloneQuery.data.id,
          sceneIndex: sceneNumber,
        });
        if (result.audioUrl) {
          setGeneratedAudios(prev => ({ ...prev, [sceneNumber]: result.audioUrl }));
          pointsQuery.refetch();
          toast.success(t(
            `تم توليد صوت المشهد ${sceneNumber} بصوتك! (${result.pointsUsed} نقاط)`,
            `Audio scène ${sceneNumber} généré avec votre voix ! (${result.pointsUsed} pts)`,
            `Scene ${sceneNumber} audio generated with your voice! (${result.pointsUsed} pts)`
          ));
        }
      } else {
        // Standard TTS
        const result = await audioGenMut.mutateAsync({ sceneNumber, spokenText, voice: ttsVoice });
        if (result.audioUrl) {
          setGeneratedAudios(prev => ({ ...prev, [sceneNumber]: result.audioUrl }));
          toast.success(t(`تم توليد صوت المشهد ${sceneNumber}!`, `Audio scène ${sceneNumber} généré !`, `Scene ${sceneNumber} audio generated!`));
        }
      }
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد الصوت", "Échec de la génération audio", "Audio generation failed"));
    } finally {
      setAudioLoadingScenes(prev => { const s = new Set(Array.from(prev)); s.delete(sceneNumber); return s; });
    }
  };

  // Audio playback
  const toggleAudioPlayback = (sceneNumber: number) => {
    const audio = audioRefs.current[sceneNumber];
    if (!audio) return;
    if (playingScene === sceneNumber) {
      audio.pause();
      setPlayingScene(null);
    } else {
      // Pause any other playing audio
      Object.values(audioRefs.current).forEach(a => a?.pause());
      audio.play();
      setPlayingScene(sceneNumber);
    }
  };

  // Save project
  const handleSaveProject = async () => {
    if (!scenarioData) {
      toast.error(t("لا يوجد مشروع لحفظه", "Aucun projet à sauvegarder", "No project to save"));
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveProjectMut.mutateAsync({
        id: currentProjectId || undefined,
        title: scenarioData.title,
        summary: scenarioData.summary,
        referenceText,
        sourceBookTitle: sourceInfo?.fileName || undefined,
        numberOfScenes: scenarioData.scenes.length,
        visualStyle,
        voiceLanguage,
        voiceTone,
        scenarioData: scenarioData,
        visualPromptsData: visualPrompts.length > 0 ? visualPrompts : undefined,
        voiceoverData: voiceovers.length > 0 ? voiceovers : undefined,
        generatedImages: Object.keys(generatedImages).length > 0 ? generatedImages : undefined,
        generatedAudios: Object.keys(generatedAudios).length > 0 ? generatedAudios : undefined,
        status: voiceovers.length > 0 ? "completed" : scenarioData ? "in_progress" : "draft",
      });
      if (result.id && !currentProjectId) {
        setCurrentProjectId(typeof result.id === "string" ? parseInt(result.id) : result.id);
      }
      toast.success(t("تم حفظ المشروع بنجاح!", "Projet sauvegardé !", "Project saved!"));
    } catch (err: any) {
      toast.error(err.message || t("فشل في حفظ المشروع", "Échec de la sauvegarde", "Save failed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Build merged scene cards
  const sceneCards: SceneCard[] = (scenarioData?.scenes || []).map(scene => ({
    scene,
    visualPrompt: visualPrompts.find(vp => vp.sceneNumber === scene.sceneNumber),
    voiceover: voiceovers.find(vo => vo.sceneNumber === scene.sceneNumber),
    generatedImageUrl: generatedImages[scene.sceneNumber],
    generatedAudioUrl: generatedAudios[scene.sceneNumber],
    imageLoading: imageLoadingScenes.has(scene.sceneNumber),
    audioLoading: audioLoadingScenes.has(scene.sceneNumber),
  }));

  const totalDuration = scenarioData?.scenes.reduce((sum, s) => sum + s.duration, 0) || 0;

  // Pipeline steps config
  const steps = [
    { id: "scenario" as const, label: t("السيناريو", "Scénario", "Scenario"), icon: FileText, done: !!scenarioData },
    { id: "visual" as const, label: t("الأوامر البصرية", "Prompts visuels", "Visual Prompts"), icon: Camera, done: visualPrompts.length > 0 },
    { id: "voiceover" as const, label: t("الصوت", "Voix", "Voiceover"), icon: Mic, done: voiceovers.length > 0 },
  ];

  const visualStyles = [
    { id: "3d_animation" as const, label: "3D Animation", icon: "🎬" },
    { id: "2d_cartoon" as const, label: "2D Cartoon", icon: "🎨" },
    { id: "realistic" as const, label: "Realistic", icon: "📷" },
    { id: "whiteboard" as const, label: "Whiteboard", icon: "📝" },
    { id: "cinematic" as const, label: "Cinematic", icon: "🎥" },
  ];

  const voiceTones = [
    { id: "enthusiastic" as const, label: t("حماسي", "Enthousiaste", "Enthusiastic") },
    { id: "calm" as const, label: t("هادئ", "Calme", "Calm") },
    { id: "professional" as const, label: t("احترافي", "Professionnel", "Professional") },
    { id: "storytelling" as const, label: t("سردي", "Narratif", "Storytelling") },
  ];

  const ttsVoices = [
    { id: "nova" as const, label: "Nova", desc: t("أنثوي دافئ", "Féminin chaleureux", "Warm female") },
    { id: "alloy" as const, label: "Alloy", desc: t("محايد", "Neutre", "Neutral") },
    { id: "echo" as const, label: "Echo", desc: t("ذكوري عميق", "Masculin profond", "Deep male") },
    { id: "fable" as const, label: "Fable", desc: t("سردي", "Narratif", "Narrative") },
    { id: "onyx" as const, label: "Onyx", desc: t("ذكوري قوي", "Masculin fort", "Strong male") },
    { id: "shimmer" as const, label: "Shimmer", desc: t("أنثوي حيوي", "Féminin vif", "Lively female") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" dir={isRTL ? "rtl" : "ltr"}>
      {/* Image Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setLightboxImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="Scene" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <a href={lightboxImage} download className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm" onClick={e => e.stopPropagation()}>
            <Download className="w-4 h-4" /> {t("تحميل", "Télécharger", "Download")}
          </a>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/leader-visual-studio">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Clapperboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Edu-Studio Engine</h1>
                  <p className="text-xs text-purple-300">{t("محرك الإنتاج المرئي التعليمي", "Moteur de production visuelle éducative", "Educational Visual Production Engine")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Pipeline Progress */}
              <div className="hidden md:flex items-center gap-2">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-1">
                    <button
                      onClick={() => step.done || step.id === currentStep ? setCurrentStep(step.id) : null}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        step.done ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : step.id === currentStep ? "bg-purple-500/30 text-purple-200 border border-purple-400/40 animate-pulse"
                        : "bg-white/5 text-gray-500 border border-white/10"
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id === currentStep ? <Loader2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      {step.label}
                    </button>
                    {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-600" />}
                  </div>
                ))}
              </div>

              {/* Save & My Projects Buttons */}
              <button
                onClick={handleSaveProject}
                disabled={!scenarioData || isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all disabled:opacity-40"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {t("حفظ", "Sauver", "Save")}
              </button>
              <Link href="/my-studio-projects">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-medium border border-white/10 transition-all">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {t("مشاريعي", "Mes projets", "My Projects")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* LEFT: Storyboard Dashboard (60%) */}
        <div className="w-[60%] border-r border-purple-500/10 overflow-y-auto p-6">
          {!scenarioData ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <Film className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t("لوحة الستوري بورد", "Storyboard", "Storyboard")}</h2>
              <p className="text-gray-400 max-w-md mb-2">
                {t("أدخل النص المدرسي في الجهة اليمنى واضغط على 'توليد السيناريو' لتبدأ رحلة الإنتاج",
                  "Entrez le texte scolaire à droite et cliquez sur 'Générer le scénario' pour commencer",
                  "Enter the school text on the right and click 'Generate Scenario' to start")}
              </p>
              <div className="flex items-center gap-2 text-purple-400/60 text-sm mt-4">
                <ArrowRight className="w-4 h-4" />
                {t("ابدأ من الجهة اليمنى", "Commencez à droite", "Start from the right")}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Title & Summary */}
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl p-5 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{scenarioData.title}</h2>
                    <p className="text-sm text-purple-300 mt-1">{scenarioData.summary}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Layers className="w-4 h-4" />{sceneCards.length} {t("مشاهد", "scènes", "scenes")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{totalDuration}s</span>
                    <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" />{Object.keys(generatedImages).length}/{sceneCards.length}</span>
                    <span className="flex items-center gap-1"><Volume2 className="w-4 h-4" />{Object.keys(generatedAudios).length}/{sceneCards.length}</span>
                  </div>
                </div>
              </div>

              {/* Scene Cards */}
              {sceneCards.map((card, idx) => (
                <div
                  key={card.scene.sceneNumber}
                  onClick={() => setActiveSceneIdx(idx)}
                  className={`group rounded-2xl border transition-all cursor-pointer ${
                    activeSceneIdx === idx
                      ? "bg-purple-900/30 border-purple-400/40 shadow-lg shadow-purple-500/10"
                      : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-purple-500/20"
                  }`}
                >
                  <div className="p-5">
                    {/* Scene Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          activeSceneIdx === idx ? "bg-purple-500 text-white" : "bg-white/10 text-gray-300"
                        }`}>
                          {card.scene.sceneNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{card.scene.title}</h3>
                          <span className="text-xs text-gray-500">{card.scene.duration}s • {card.scene.transition}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {card.visualPrompt && <div className="w-2 h-2 rounded-full bg-blue-400" title="Visual Prompt" />}
                        {card.voiceover && <div className="w-2 h-2 rounded-full bg-green-400" title="Voiceover" />}
                        {card.generatedImageUrl && <div className="w-2 h-2 rounded-full bg-pink-400" title="Image Generated" />}
                        {card.generatedAudioUrl && <div className="w-2 h-2 rounded-full bg-amber-400" title="Audio Generated" />}
                      </div>
                    </div>

                    {/* Scene Description */}
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">{card.scene.description}</p>

                    {/* Generated Image */}
                    {card.generatedImageUrl && (
                      <div className="mb-3 relative group/img">
                        <img
                          src={card.generatedImageUrl}
                          alt={`Scene ${card.scene.sceneNumber}`}
                          className="w-full h-48 object-cover rounded-xl border border-pink-500/20"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLightboxImage(card.generatedImageUrl!); }}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                          <a
                            href={card.generatedImageUrl}
                            download
                            onClick={e => e.stopPropagation()}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Visual Prompt */}
                    {card.visualPrompt && (
                      <div className="bg-blue-950/40 rounded-xl p-4 mb-3 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" />
                            Visual Prompt — {card.visualPrompt.suggestedTool}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Generate Image Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateImage(card.scene.sceneNumber, card.visualPrompt!.visualPrompt);
                              }}
                              disabled={imageLoadingScenes.has(card.scene.sceneNumber)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 text-xs font-medium transition-all border border-pink-400/30 hover:border-pink-400/60 disabled:opacity-50"
                            >
                              {imageLoadingScenes.has(card.scene.sceneNumber) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : card.generatedImageUrl ? (
                                <RotateCcw className="w-3.5 h-3.5" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              {imageLoadingScenes.has(card.scene.sceneNumber)
                                ? t("جاري...", "En cours...", "Loading...")
                                : card.generatedImageUrl
                                ? t("إعادة", "Régénérer", "Regen")
                                : t("توليد صورة", "Générer image", "Gen Image")}
                            </button>
                            {/* Copy Prompt Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(card.visualPrompt!.visualPrompt, `vp-${card.scene.sceneNumber}`); }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 text-xs font-medium transition-all border border-blue-400/30 hover:border-blue-400/60"
                            >
                              {copiedId === `vp-${card.scene.sceneNumber}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === `vp-${card.scene.sceneNumber}` ? "Copied!" : "Copy Prompt"}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-blue-100 font-mono leading-relaxed">{card.visualPrompt.visualPrompt}</p>
                        {card.visualPrompt.negativePrompt && (
                          <p className="text-xs text-blue-400/60 mt-2 font-mono">
                            <span className="text-red-400/60">Negative:</span> {card.visualPrompt.negativePrompt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-blue-400/50">
                          <span>Ratio: {card.visualPrompt.aspectRatio}</span>
                        </div>
                      </div>
                    )}

                    {/* Voiceover */}
                    {card.voiceover && (
                      <div className="bg-green-950/40 rounded-xl p-4 border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-green-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5" />
                            {t("التعليق الصوتي", "Voix off", "Voiceover")} — {card.voiceover.emotionalTone} • {card.voiceover.pace}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Generate Audio Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateAudio(card.scene.sceneNumber, card.voiceover!.spokenText);
                              }}
                              disabled={audioLoadingScenes.has(card.scene.sceneNumber)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-xs font-medium transition-all border border-amber-400/30 hover:border-amber-400/60 disabled:opacity-50"
                            >
                              {audioLoadingScenes.has(card.scene.sceneNumber) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : card.generatedAudioUrl ? (
                                <RotateCcw className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                              {audioLoadingScenes.has(card.scene.sceneNumber)
                                ? t("جاري...", "En cours...", "Loading...")
                                : card.generatedAudioUrl
                                ? t("إعادة", "Régénérer", "Regen")
                                : t("توليد صوت", "Générer audio", "Gen Audio")}
                            </button>
                            {/* Copy Text Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(card.voiceover!.spokenText, `vo-${card.scene.sceneNumber}`); }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-200 text-xs font-medium transition-all border border-green-400/30 hover:border-green-400/60"
                            >
                              {copiedId === `vo-${card.scene.sceneNumber}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === `vo-${card.scene.sceneNumber}` ? t("تم!", "Copié!", "Copied!") : t("نسخ", "Copier", "Copy")}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-green-100 leading-relaxed" dir="auto">{card.voiceover.spokenText}</p>

                        {/* Audio Player */}
                        {card.generatedAudioUrl && (
                          <div className="mt-3 flex items-center gap-3 bg-black/20 rounded-lg p-2.5 border border-amber-500/20">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleAudioPlayback(card.scene.sceneNumber); }}
                              className="w-9 h-9 rounded-full bg-amber-500/30 hover:bg-amber-500/50 flex items-center justify-center text-amber-200 transition-all flex-shrink-0"
                            >
                              {playingScene === card.scene.sceneNumber ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <audio
                              ref={el => { audioRefs.current[card.scene.sceneNumber] = el; }}
                              src={card.generatedAudioUrl}
                              onEnded={() => setPlayingScene(null)}
                              className="flex-1 h-8"
                              controls
                              style={{ filter: "invert(1) hue-rotate(180deg)", height: "32px" }}
                            />
                            <a
                              href={card.generatedAudioUrl}
                              download={`scene-${card.scene.sceneNumber}.mp3`}
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex-shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-green-400/60">
                          <p>🎭 {card.voiceover.performanceNotes}</p>
                          {card.voiceover.emphasis.length > 0 && (
                            <p className="mt-1">💡 {t("تأكيد على:", "Accentuer:", "Emphasize:")} {card.voiceover.emphasis.join(", ")}</p>
                          )}
                          <p className="mt-1">⏱ ~{card.voiceover.estimatedDuration}s</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Generation Engine (40%) */}
        <div className="w-[40%] overflow-y-auto p-6 bg-black/20">
          <div className="space-y-5">
            {/* Reference Text */}
            <div>
              <label className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t("النص المرجعي", "Texte de référence", "Reference Text")}
                {sourceInfo && (
                  <span className="text-xs text-gray-500">({sourceInfo.fileName} - p.{sourceInfo.pageNumber})</span>
                )}
              </label>
              <textarea
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                placeholder={t("الصق هنا النص المدرسي المراد تحويله إلى فيديو تعليمي...", "Collez ici le texte scolaire...", "Paste the school text here...")}
                className="w-full h-40 bg-white/5 border border-purple-500/20 rounded-xl p-4 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 text-sm leading-relaxed"
                dir="auto"
              />
            </div>

            {/* Step 1: Generate Scenario */}
            <Card className="bg-white/5 border-purple-500/20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${scenarioData ? "bg-green-500 text-white" : "bg-purple-500/30 text-purple-300"}`}>
                    {scenarioData ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد سيناريو الدرس", "Générer le scénario", "Generate Scenario")}</h3>
                    <p className="text-xs text-gray-500">{t("تقسيم النص إلى مشاهد سينمائية", "Diviser en scènes cinématiques", "Split into cinematic scenes")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-gray-400">{t("عدد المشاهد:", "Nombre de scènes:", "Scenes:")}</label>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button key={n} onClick={() => setNumberOfScenes(n)}
                        className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${numberOfScenes === n ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleGenerateScenario} disabled={scenarioMut.isPending || !referenceText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0">
                  {scenarioMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                    : scenarioData ? <><RotateCcw className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                    : <><FileText className="w-4 h-4 mr-2" />{t("توليد السيناريو", "Générer le scénario", "Generate Scenario")}</>}
                </Button>
              </div>
            </Card>

            {/* Step 2: Generate Visual Prompts */}
            <Card className={`border-purple-500/20 overflow-hidden ${!scenarioData ? "opacity-50" : "bg-white/5"}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    visualPrompts.length > 0 ? "bg-green-500 text-white" : scenarioData ? "bg-blue-500/30 text-blue-300" : "bg-white/10 text-gray-600"}`}>
                    {visualPrompts.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد الأوامر البصرية", "Générer les prompts visuels", "Generate Visual Prompts")}</h3>
                    <p className="text-xs text-gray-500">{t("أوامر إنجليزية عالية الدقة لـ AI", "Prompts anglais HD pour IA", "High-quality English prompts")}</p>
                  </div>
                  {!scenarioData && <Lock className="w-4 h-4 text-gray-600 ml-auto" />}
                </div>
                {scenarioData && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visualStyles.map(style => (
                      <button key={style.id} onClick={() => setVisualStyle(style.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${visualStyle === style.id
                          ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                        {style.icon} {style.label}
                      </button>
                    ))}
                  </div>
                )}
                <Button onClick={handleGenerateVisuals} disabled={!scenarioData || visualMut.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0">
                  {visualMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                    : visualPrompts.length > 0 ? <><RotateCcw className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                    : <><Camera className="w-4 h-4 mr-2" />{t("توليد الأوامر البصرية", "Générer les prompts visuels", "Generate Visual Prompts")}</>}
                </Button>
              </div>
            </Card>

            {/* Step 3: Generate Voiceover */}
            <Card className={`border-purple-500/20 overflow-hidden ${!visualPrompts.length ? "opacity-50" : "bg-white/5"}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    voiceovers.length > 0 ? "bg-green-500 text-white" : visualPrompts.length > 0 ? "bg-green-500/30 text-green-300" : "bg-white/10 text-gray-600"}`}>
                    {voiceovers.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : "3"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد أوامر الصوت", "Générer les scripts voix", "Generate Voiceover")}</h3>
                    <p className="text-xs text-gray-500">{t("نص منطوق مع توجيهات الأداء", "Texte parlé avec directives", "Spoken text with directions")}</p>
                  </div>
                  {!visualPrompts.length && <Lock className="w-4 h-4 text-gray-600 ml-auto" />}
                </div>
                {visualPrompts.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t("اللغة", "Langue", "Language")}</label>
                        <div className="flex gap-1">
                          {(["ar", "fr", "en"] as const).map(lang => (
                            <button key={lang} onClick={() => setVoiceLanguage(lang)}
                              className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${voiceLanguage === lang
                                ? "bg-green-500/30 text-green-200 border border-green-400/40"
                                : "bg-white/5 text-gray-400 border border-white/10"}`}>
                              {lang === "ar" ? "عربي" : lang === "fr" ? "FR" : "EN"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t("النبرة", "Ton", "Tone")}</label>
                        <select value={voiceTone} onChange={(e) => setVoiceTone(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-gray-300">
                          {voiceTones.map(tone => <option key={tone.id} value={tone.id}>{tone.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Voice Mode Selector */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t("نوع الصوت", "Type de voix", "Voice Type")}</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => setVoiceMode("standard")}
                          className={`p-2.5 rounded-lg text-xs transition-all border ${voiceMode === "standard"
                            ? "bg-amber-500/30 text-amber-200 border-amber-400/40"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
                        >
                          <Volume2 className="w-4 h-4 mx-auto mb-1" />
                          <div className="font-medium">{t("أصوات AI عادية", "Voix AI standard", "Standard AI Voices")}</div>
                          <div className="text-[10px] opacity-60">{t("مجاني", "Gratuit", "Free")}</div>
                        </button>
                        <button
                          onClick={() => {
                            if (voiceCloneQuery.data?.status === "ready") {
                              setVoiceMode("cloned");
                            } else {
                              toast.info(t(
                                "يجب إنشاء بصمة صوتية أولاً من صفحة 'صوتي الرقمي'",
                                "Créez d'abord votre empreinte vocale",
                                "Create your voice clone first"
                              ));
                            }
                          }}
                          className={`p-2.5 rounded-lg text-xs transition-all border relative ${voiceMode === "cloned"
                            ? "bg-violet-500/30 text-violet-200 border-violet-400/40"
                            : voiceCloneQuery.data?.status === "ready"
                            ? "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            : "bg-white/5 text-gray-600 border-white/5 opacity-60"}`}
                        >
                          {voiceCloneQuery.data?.status === "ready" && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                            </span>
                          )}
                          <User className="w-4 h-4 mx-auto mb-1" />
                          <div className="font-medium">{t("صوتي المستنسخ", "Ma voix clonée", "My Cloned Voice")}</div>
                          <div className="text-[10px] opacity-60">
                            {voiceCloneQuery.data?.status === "ready"
                              ? t("5 نقاط/مشهد", "5 pts/scène", "5 pts/scene")
                              : t("غير مفعّل", "Non activé", "Not activated")}
                          </div>
                        </button>
                      </div>
                      {voiceMode === "cloned" && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 mb-2">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-violet-300">
                            {t("رصيدك:", "Solde:", "Balance:")} <span className="font-bold text-amber-300">{pointsQuery.data?.balance ?? "..."}</span> {t("نقطة", "pts", "pts")}
                          </span>
                          <Link href="/my-voice" className="mr-auto">
                            <span className="text-xs text-violet-400 hover:text-violet-300 underline">{t("إعدادات الصوت", "Paramètres voix", "Voice settings")}</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* TTS Voice Selection (only for standard mode) */}
                    {voiceMode === "standard" && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t("صوت TTS", "Voix TTS", "TTS Voice")}</label>
                      <div className="grid grid-cols-3 gap-1">
                        {ttsVoices.map(v => (
                          <button key={v.id} onClick={() => setTtsVoice(v.id)}
                            className={`px-2 py-1.5 rounded-md text-xs transition-all ${ttsVoice === v.id
                              ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                            <div className="font-medium">{v.label}</div>
                            <div className="text-[10px] opacity-60">{v.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                )}
                <Button onClick={handleGenerateVoiceover} disabled={!visualPrompts.length || voiceoverMut.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0">
                  {voiceoverMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                    : voiceovers.length > 0 ? <><RotateCcw className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                    : <><Mic className="w-4 h-4 mr-2" />{t("توليد أوامر الصوت", "Générer les scripts voix", "Generate Voiceover")}</>}
                </Button>
              </div>
            </Card>

            {/* Export PDF Button */}
            {scenarioData && (
              <Button
                onClick={() => {
                  const exportData = { title: scenarioData.title, summary: scenarioData.summary, scenes: sceneCards, totalDuration, visualStyle, voiceLanguage };
                  sessionStorage.setItem("edu_studio_export", JSON.stringify(exportData));
                  window.open(`/edu-studio-export`, "_blank");
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 py-6" size="lg">
                <Download className="w-5 h-5 mr-2" />
                {t("تحميل خطة الإنتاج (PDF)", "Télécharger le plan (PDF)", "Download Production Plan (PDF)")}
              </Button>
            )}

            {/* Quick Tips */}
            <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
              <h4 className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t("نصائح سريعة", "Conseils rapides", "Quick Tips")}
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-400 mt-0.5">•</span>
                  {t("اضغط 'توليد صورة' في كل بطاقة مشهد لتوليد الصورة مباشرة", "Cliquez 'Générer image' pour créer l'image directement", "Click 'Gen Image' on each scene card to generate directly")}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {t("اضغط 'توليد صوت' لتحويل النص إلى مقطع صوتي MP3 قابل للتشغيل", "Cliquez 'Générer audio' pour convertir en MP3", "Click 'Gen Audio' to convert text to playable MP3")}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {t("انسخ الـ Visual Prompt والصقه في Midjourney أو DALL-E لنتائج أفضل", "Copiez le prompt dans Midjourney pour de meilleurs résultats", "Copy the prompt to Midjourney for better results")}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">•</span>
                  {t("احفظ مشروعك لتعود إليه لاحقاً من صفحة 'مشاريعي'", "Sauvegardez votre projet pour y revenir plus tard", "Save your project to return to it later")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
