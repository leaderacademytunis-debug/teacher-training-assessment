import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useExtractionStore } from "@/stores/extractionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Film, Clapperboard, Sparkles, Loader2, Copy, Check, Download,
  ChevronRight, Eye, Camera, Music, Volume2, FileText, Palette,
  ArrowRight, BookOpen, Clock, Wand2, Play, Settings2, Layers,
  CheckCircle2, Circle, Lock, Mic, Image as ImageIcon, Video,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

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
}

type PipelineStep = "scenario" | "visual" | "voiceover";

export default function EduStudioEngine() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

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

  // Settings
  const [numberOfScenes, setNumberOfScenes] = useState(4);
  const [visualStyle, setVisualStyle] = useState<"3d_animation" | "2d_cartoon" | "realistic" | "whiteboard" | "cinematic">("3d_animation");
  const [voiceLanguage, setVoiceLanguage] = useState<"ar" | "fr" | "en">("ar");
  const [voiceTone, setVoiceTone] = useState<"enthusiastic" | "calm" | "professional" | "storytelling">("enthusiastic");

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active scene for detail view
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);

  // Mutations
  const scenarioMut = trpc.eduStudio.generateScenario.useMutation();
  const visualMut = trpc.eduStudio.generateVisualPrompts.useMutation();
  const voiceoverMut = trpc.eduStudio.generateVoiceover.useMutation();

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
      const result = await scenarioMut.mutateAsync({
        referenceText: referenceText.trim(),
        numberOfScenes,
      });
      setScenarioData(result);
      setCurrentStep("visual");
      toast.success(t(
        `تم توليد ${result.scenes.length} مشاهد بنجاح!`,
        `${result.scenes.length} scènes générées avec succès !`,
        `${result.scenes.length} scenes generated successfully!`
      ));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد السيناريو", "Échec de la génération", "Generation failed"));
    }
  };

  // Step 2: Generate Visual Prompts
  const handleGenerateVisuals = async () => {
    if (!scenarioData) return;
    try {
      const result = await visualMut.mutateAsync({
        scenes: scenarioData.scenes.map(s => ({
          sceneNumber: s.sceneNumber,
          title: s.title,
          description: s.description,
          educationalContent: s.educationalContent,
        })),
        visualStyle,
      });
      setVisualPrompts(result.prompts);
      setCurrentStep("voiceover");
      toast.success(t(
        "تم توليد الأوامر البصرية بنجاح!",
        "Prompts visuels générés avec succès !",
        "Visual prompts generated successfully!"
      ));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد الأوامر البصرية", "Échec de la génération", "Generation failed"));
    }
  };

  // Step 3: Generate Voiceover
  const handleGenerateVoiceover = async () => {
    if (!scenarioData) return;
    try {
      const result = await voiceoverMut.mutateAsync({
        scenes: scenarioData.scenes.map(s => ({
          sceneNumber: s.sceneNumber,
          title: s.title,
          educationalContent: s.educationalContent,
          duration: s.duration,
        })),
        voiceLanguage,
        voiceTone,
      });
      setVoiceovers(result.voiceovers);
      toast.success(t(
        "تم توليد أوامر الصوت بنجاح!",
        "Scripts voix générés avec succès !",
        "Voiceover scripts generated successfully!"
      ));
    } catch (err: any) {
      toast.error(err.message || t("فشل في توليد أوامر الصوت", "Échec de la génération", "Generation failed"));
    }
  };

  // Build merged scene cards
  const sceneCards: SceneCard[] = (scenarioData?.scenes || []).map(scene => ({
    scene,
    visualPrompt: visualPrompts.find(vp => vp.sceneNumber === scene.sceneNumber),
    voiceover: voiceovers.find(vo => vo.sceneNumber === scene.sceneNumber),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" dir={isRTL ? "rtl" : "ltr"}>
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

            {/* Pipeline Progress */}
            <div className="hidden md:flex items-center gap-2">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-1">
                  <button
                    onClick={() => step.done || step.id === currentStep ? setCurrentStep(step.id) : null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      step.done
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : step.id === currentStep
                        ? "bg-purple-500/30 text-purple-200 border border-purple-400/40 animate-pulse"
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
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* LEFT: Storyboard Dashboard (60%) */}
        <div className="w-[60%] border-r border-purple-500/10 overflow-y-auto p-6">
          {!scenarioData ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <Film className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t("لوحة الستوري بورد", "Storyboard", "Storyboard")}</h2>
              <p className="text-gray-400 max-w-md mb-2">
                {t(
                  "أدخل النص المدرسي في الجهة اليمنى واضغط على 'توليد السيناريو' لتبدأ رحلة الإنتاج",
                  "Entrez le texte scolaire à droite et cliquez sur 'Générer le scénario' pour commencer",
                  "Enter the school text on the right and click 'Generate Scenario' to start"
                )}
              </p>
              <div className="flex items-center gap-2 text-purple-400/60 text-sm mt-4">
                <ArrowRight className="w-4 h-4" />
                {t("ابدأ من الجهة اليمنى", "Commencez à droite", "Start from the right")}
              </div>
            </div>
          ) : (
            /* Storyboard with Scene Cards */
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
                      </div>
                    </div>

                    {/* Scene Description */}
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">{card.scene.description}</p>

                    {/* Visual Prompt */}
                    {card.visualPrompt && (
                      <div className="bg-blue-950/40 rounded-xl p-4 mb-3 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" />
                            Visual Prompt — {card.visualPrompt.suggestedTool}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(card.visualPrompt!.visualPrompt, `vp-${card.scene.sceneNumber}`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 text-xs font-medium transition-all border border-blue-400/30 hover:border-blue-400/60"
                          >
                            {copiedId === `vp-${card.scene.sceneNumber}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === `vp-${card.scene.sceneNumber}` ? "Copied!" : "Copy Prompt"}
                          </button>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(card.voiceover!.spokenText, `vo-${card.scene.sceneNumber}`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-200 text-xs font-medium transition-all border border-green-400/30 hover:border-green-400/60"
                          >
                            {copiedId === `vo-${card.scene.sceneNumber}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === `vo-${card.scene.sceneNumber}` ? t("تم!", "Copié!", "Copied!") : t("نسخ", "Copier", "Copy")}
                          </button>
                        </div>
                        <p className="text-sm text-green-100 leading-relaxed" dir="auto">{card.voiceover.spokenText}</p>
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
                  <span className="text-xs text-gray-500">
                    ({sourceInfo.fileName} - p.{sourceInfo.pageNumber})
                  </span>
                )}
              </label>
              <textarea
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                placeholder={t(
                  "الصق هنا النص المدرسي المراد تحويله إلى فيديو تعليمي...",
                  "Collez ici le texte scolaire à convertir en vidéo éducative...",
                  "Paste the school text to convert into educational video..."
                )}
                className="w-full h-40 bg-white/5 border border-purple-500/20 rounded-xl p-4 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 text-sm leading-relaxed"
                dir="auto"
              />
            </div>

            {/* Step 1: Generate Scenario */}
            <Card className="bg-white/5 border-purple-500/20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    scenarioData ? "bg-green-500 text-white" : "bg-purple-500/30 text-purple-300"
                  }`}>
                    {scenarioData ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد سيناريو الدرس", "Générer le scénario", "Generate Scenario")}</h3>
                    <p className="text-xs text-gray-500">{t("تقسيم النص إلى مشاهد سينمائية", "Diviser en scènes cinématiques", "Split into cinematic scenes")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-gray-400">{t("عدد المشاهد:", "Nombre de scènes:", "Number of scenes:")}</label>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => setNumberOfScenes(n)}
                        className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                          numberOfScenes === n
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-gray-400 hover:bg-white/20"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateScenario}
                  disabled={scenarioMut.isPending || !referenceText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0"
                >
                  {scenarioMut.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                  ) : scenarioData ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                  ) : (
                    <><FileText className="w-4 h-4 mr-2" />{t("توليد السيناريو", "Générer le scénario", "Generate Scenario")}</>
                  )}
                </Button>
              </div>
            </Card>

            {/* Step 2: Generate Visual Prompts */}
            <Card className={`border-purple-500/20 overflow-hidden ${!scenarioData ? "opacity-50" : "bg-white/5"}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    visualPrompts.length > 0 ? "bg-green-500 text-white" : scenarioData ? "bg-blue-500/30 text-blue-300" : "bg-white/10 text-gray-600"
                  }`}>
                    {visualPrompts.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد الأوامر البصرية", "Générer les prompts visuels", "Generate Visual Prompts")}</h3>
                    <p className="text-xs text-gray-500">{t("أوامر إنجليزية عالية الدقة لـ AI", "Prompts anglais haute qualité pour IA", "High-quality English prompts for AI")}</p>
                  </div>
                  {!scenarioData && <Lock className="w-4 h-4 text-gray-600 ml-auto" />}
                </div>

                {scenarioData && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visualStyles.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setVisualStyle(style.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          visualStyle === style.id
                            ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {style.icon} {style.label}
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleGenerateVisuals}
                  disabled={!scenarioData || visualMut.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0"
                >
                  {visualMut.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                  ) : visualPrompts.length > 0 ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                  ) : (
                    <><Camera className="w-4 h-4 mr-2" />{t("توليد الأوامر البصرية", "Générer les prompts visuels", "Generate Visual Prompts")}</>
                  )}
                </Button>
              </div>
            </Card>

            {/* Step 3: Generate Voiceover */}
            <Card className={`border-purple-500/20 overflow-hidden ${!visualPrompts.length ? "opacity-50" : "bg-white/5"}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    voiceovers.length > 0 ? "bg-green-500 text-white" : visualPrompts.length > 0 ? "bg-green-500/30 text-green-300" : "bg-white/10 text-gray-600"
                  }`}>
                    {voiceovers.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : "3"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{t("توليد أوامر الصوت", "Générer les scripts voix", "Generate Voiceover")}</h3>
                    <p className="text-xs text-gray-500">{t("نص منطوق مع توجيهات الأداء", "Texte parlé avec directives", "Spoken text with performance directions")}</p>
                  </div>
                  {!visualPrompts.length && <Lock className="w-4 h-4 text-gray-600 ml-auto" />}
                </div>

                {visualPrompts.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t("اللغة", "Langue", "Language")}</label>
                      <div className="flex gap-1">
                        {(["ar", "fr", "en"] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setVoiceLanguage(lang)}
                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                              voiceLanguage === lang
                                ? "bg-green-500/30 text-green-200 border border-green-400/40"
                                : "bg-white/5 text-gray-400 border border-white/10"
                            }`}
                          >
                            {lang === "ar" ? "عربي" : lang === "fr" ? "FR" : "EN"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t("النبرة", "Ton", "Tone")}</label>
                      <select
                        value={voiceTone}
                        onChange={(e) => setVoiceTone(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-gray-300"
                      >
                        {voiceTones.map(tone => (
                          <option key={tone.id} value={tone.id}>{tone.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerateVoiceover}
                  disabled={!visualPrompts.length || voiceoverMut.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0"
                >
                  {voiceoverMut.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("جاري التوليد...", "Génération...", "Generating...")}</>
                  ) : voiceovers.length > 0 ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" />{t("إعادة التوليد", "Régénérer", "Regenerate")}</>
                  ) : (
                    <><Mic className="w-4 h-4 mr-2" />{t("توليد أوامر الصوت", "Générer les scripts voix", "Generate Voiceover")}</>
                  )}
                </Button>
              </div>
            </Card>

            {/* Export PDF Button */}
            {scenarioData && (
              <Button
                onClick={() => {
                  // Trigger PDF export via hidden form or API
                  const exportData = {
                    title: scenarioData.title,
                    summary: scenarioData.summary,
                    scenes: sceneCards,
                    totalDuration,
                    visualStyle,
                    voiceLanguage,
                  };
                  // Store in sessionStorage for the export page
                  sessionStorage.setItem("edu_studio_export", JSON.stringify(exportData));
                  // Open export in new tab
                  window.open(`/edu-studio-export`, "_blank");
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 py-6"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {t("تحميل خطة الإنتاج (PDF)", "Télécharger le plan de production (PDF)", "Download Production Plan (PDF)")}
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
                  <span className="text-purple-400 mt-0.5">•</span>
                  {t(
                    "انسخ الـ Visual Prompt والصقه في Midjourney أو DALL-E",
                    "Copiez le Visual Prompt et collez-le dans Midjourney ou DALL-E",
                    "Copy the Visual Prompt and paste it in Midjourney or DALL-E"
                  )}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {t(
                    "استخدم نص التعليق الصوتي مع ElevenLabs أو أي أداة TTS",
                    "Utilisez le texte voix off avec ElevenLabs ou tout outil TTS",
                    "Use the voiceover text with ElevenLabs or any TTS tool"
                  )}
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {t(
                    "حمّل خطة الإنتاج كـ PDF للاحتفاظ بها كمرجع",
                    "Téléchargez le plan de production en PDF comme référence",
                    "Download the production plan as PDF for reference"
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
