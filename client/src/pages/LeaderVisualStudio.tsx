import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useExtractionStore } from "@/stores/extractionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { LockedFeature, usePermissions } from "@/components/LockedFeature";
import ImageOverlayEditor from "@/components/ImageOverlayEditor";
import EducationalImageLibrary from "@/components/EducationalImageLibrary";
import AIDirectorAssistant from "@/pages/AIDirectorAssistant";
import {
  Paintbrush, Download, Trash2, Eraser, Image as ImageIcon,
  Loader2, Sparkles, Palette, PenLine, BarChart3, BookOpen,
  AlertCircle, Crown, ChevronDown, ChevronUp, X, Type, Library,
  Clapperboard
} from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";

const VISUAL_STUDIO_GRADIENT = "linear-gradient(135deg, #7c3aed, #4338ca)";

export default function LeaderVisualStudio() {
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  const STYLES = [
    { id: "bw_lineart" as const, label: t("رسم خطي أبيض/أسود", "Dessin au trait N&B", "B&W Line Art"), icon: PenLine, desc: t("مثالي للطباعة", "Idéal pour l'impression", "Ideal for printing"), default: true },
    { id: "minimalist" as const, label: t("تصميم بسيط", "Minimaliste", "Minimalist"), icon: Paintbrush, desc: t("ألوان محدودة", "Couleurs limitées", "Limited colors") },
    { id: "cartoon" as const, label: t("رسم كرتوني", "Dessin animé", "Cartoon"), icon: Sparkles, desc: t("ملون وجذاب", "Coloré et attractif", "Colorful & engaging") },
    { id: "diagram" as const, label: t("مخطط بياني", "Diagramme", "Diagram"), icon: BarChart3, desc: t("رسوم توضيحية", "Illustrations", "Illustrations") },
    { id: "coloring" as const, label: t("تلوين للأطفال", "Coloriage", "Coloring page"), icon: Palette, desc: t("صفحات تلوين", "Pages à colorier", "Coloring pages") },
    { id: "realistic" as const, label: t("صورة واقعية", "Réaliste", "Realistic"), icon: ImageIcon, desc: t("صور حقيقية", "Photos réelles", "Real photos") },
  ];

  type StyleId = typeof STYLES[number]["id"];

  const { hasEdugpt, isAdmin, isLoading: permLoading } = usePermissions();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StyleId>("bw_lineart");

  // Zustand - extracted_payload from textbook viewer
  const { extracted_payload: libraryPayload, sourceInfo: librarySource } = useExtractionStore();
  const [libraryPayloadApplied, setLibraryPayloadApplied] = useState(false);

  // Auto-fill prompt from Library extracted_payload
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "library" && libraryPayload && !libraryPayloadApplied) {
      setPrompt(libraryPayload);
      setLibraryPayloadApplied(true);
      // Use a simple alert-style notification since toast may not be available
    }
  }, [libraryPayload, libraryPayloadApplied]);

  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [generatedImage, setGeneratedImage] = useState<{ url: string; prompt: string; style: string } | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showOverlayEditor, setShowOverlayEditor] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<"images" | "director">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") === "director" ? "director" : "images";
  });
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const usageQuery = trpc.visualStudio.getUsage.useQuery({ sessionId });
  const galleryQuery = trpc.visualStudio.listImages.useQuery({ limit: 30 });
  const generateMutation = trpc.visualStudio.generateEducationalImage.useMutation();
  const removeBgMutation = trpc.visualStudio.removeBackground.useMutation();
  const deleteMutation = trpc.visualStudio.deleteImage.useMutation();

  const usage = usageQuery.data;
  const isGenerating = generateMutation.isPending;
  const isRemovingBg = removeBgMutation.isPending;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        style: selectedStyle,
        subject: subject || undefined,
        level: level || undefined,
        source: "studio",
        sessionId,
      });
      setGeneratedImage(result);
      usageQuery.refetch();
      galleryQuery.refetch();
    } catch (err: any) {
      alert(err.message || t("حدث خطأ أثناء توليد الصورة", "Erreur lors de la génération de l'image", "Error generating image"));
    }
  };

  const handleRemoveBg = async () => {
    if (!generatedImage?.url) return;
    try {
      const result = await removeBgMutation.mutateAsync({ imageUrl: generatedImage.url });
      setGeneratedImage({ ...generatedImage, url: result.url });
    } catch (err: any) {
      alert(err.message || t("حدث خطأ أثناء إزالة الخلفية", "Erreur lors de la suppression de l'arrière-plan", "Error removing background"));
    }
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || `leader-visual-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm(t("هل تريد حذف هذه الصورة؟", "Voulez-vous supprimer cette image ?", "Do you want to delete this image?"))) return;
    await deleteMutation.mutateAsync({ id });
    galleryQuery.refetch();
  };

  const quickPrompts = [
    t("رسم توضيحي لأجزاء جسم الإنسان", "Illustration du corps humain", "Illustration of the human body"),
    t("خريطة تونس مع المدن الرئيسية", "Carte de la Tunisie avec les villes principales", "Map of Tunisia with main cities"),
    t("دورة حياة الفراشة", "Cycle de vie du papillon", "Butterfly life cycle"),
    t("الجهاز الهضمي للإنسان", "Système digestif humain", "Human digestive system"),
    t("المجموعة الشمسية والكواكب", "Système solaire et planètes", "Solar system and planets"),
    t("أنواع الزوايا في الهندسة", "Types d'angles en géométrie", "Types of angles in geometry"),
    t("مراحل نمو النبتة", "Étapes de croissance de la plante", "Plant growth stages"),
    t("خريطة ذهنية لأركان الإسلام", "Carte mentale des piliers de l'Islam", "Mind map of the pillars of Islam"),
  ];

  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">{tt.loading}...</p>
        </div>
      </div>
    );
  }

  if (!hasEdugpt && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <LockedFeature requiredService="accessEdugpt" featureName="Leader Visual Studio">
          <div />
        </LockedFeature>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50" dir={isRTL ? "rtl" : "ltr"}>
      <ToolPageHeader
        icon={Paintbrush}
        nameAr="Leader Visual Studio"
        nameFr="Leader Visual Studio"
        nameEn="Leader Visual Studio"
        descAr="مولّد الصور التعليمية بالذكاء الاصطناعي"
        descFr="Générateur d'images éducatives par l'IA"
        descEn="AI-powered educational image generator"
        gradient={VISUAL_STUDIO_GRADIENT}
        backTo="/"
        actions={
          usage ? (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
              <div className="flex items-center gap-2">
                {usage.tier === "pro" ? (
                  <Crown className="w-4 h-4 text-yellow-300" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-violet-200" />
                )}
                <span>
                  {usage.tier === "pro" ? `Pro — ${t("غير محدود", "Illimité", "Unlimited")}` : `${usage.remaining} / ${usage.limit} ${t("صور متبقية", "images restantes", "images remaining")}`}
                </span>
              </div>
            </div>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 pt-4 max-w-6xl">
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "images"
                ? "bg-gradient-to-l from-violet-500 to-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            {t("مولّد الصور", "Générateur d'images", "Image Generator")}
          </button>
          <button
            onClick={() => setActiveTab("director")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "director"
                ? "bg-gradient-to-l from-rose-500 to-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            {t("مساعد المخرج AI", "Assistant Réalisateur IA", "AI Director Assistant")}
          </button>
        </div>
      </div>

      {activeTab === "director" ? (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <AIDirectorAssistant />
        </div>
      ) : (
      <>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5">
                <label className={`block text-sm font-bold text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("صف الصورة التي تريدها لدرسك", "Décrivez l'image que vous voulez pour votre cours", "Describe the image you want for your lesson")}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t("مثال: رسم توضيحي لأجزاء النبتة مع الجذور والساق والأوراق والزهرة...", "Ex: Illustration des parties d'une plante avec racines, tige, feuilles et fleur...", "Ex: Illustration of plant parts with roots, stem, leaves, and flower...")}
                  className={`w-full border rounded-xl p-3 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 ${isRTL ? "text-right" : "text-left"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <div className="mt-3">
                  <p className={`text-xs text-gray-500 mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("اقتراحات سريعة:", "Suggestions rapides:", "Quick prompts:")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((qp, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(qp)}
                        className="text-[11px] px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full hover:bg-violet-100 transition-colors border border-violet-200"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5">
                <p className={`text-sm font-bold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>{t("السياق (اختياري)", "Contexte (optionnel)", "Context (optional)")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">{tt.subject}</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full border rounded-lg p-2 text-sm mt-1 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <option value="">{t("اختر المادة", "Choisir la matière", "Select subject")}</option>
                      <option value="عربية">{t("عربية", "Arabe", "Arabic")}</option>
                      <option value="رياضيات">{t("رياضيات", "Maths", "Math")}</option>
                      <option value="إيقاظ علمي">{t("إيقاظ علمي", "Éveil scientifique", "Science")}</option>
                      <option value="تربية إسلامية">{t("تربية إسلامية", "Éducation islamique", "Islamic Edu.")}</option>
                      <option value="تاريخ وجغرافيا">{t("تاريخ وجغرافيا", "Histoire & Géo", "History & Geo.")}</option>
                      <option value="فرنسية">{t("فرنسية", "Français", "French")}</option>
                      <option value="إنجليزية">{t("إنجليزية", "Anglais", "English")}</option>
                      <option value="تربية تشكيلية">{t("تربية تشكيلية", "Art plastique", "Art")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">{tt.level}</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className={`w-full border rounded-lg p-2 text-sm mt-1 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <option value="">{t("اختر المستوى", "Choisir le niveau", "Select level")}</option>
                      <option value="السنة الأولى">{t("السنة الأولى", "1ère année", "1st Year")}</option>
                      <option value="السنة الثانية">{t("السنة الثانية", "2ème année", "2nd Year")}</option>
                      <option value="السنة الثالثة">{t("السنة الثالثة", "3ème année", "3rd Year")}</option>
                      <option value="السنة الرابعة">{t("السنة الرابعة", "4ème année", "4th Year")}</option>
                      <option value="السنة الخامسة">{t("السنة الخامسة", "5ème année", "5th Year")}</option>
                      <option value="السنة السادسة">{t("السنة السادسة", "6ème année", "6th Year")}</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-5">
                <p className={`text-sm font-bold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>{t("نمط الصورة", "Style d'image", "Image Style")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STYLES.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-violet-500 bg-violet-50 shadow-md"
                            : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                        }`}
                      >
                        {style.default && (
                          <span className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full`}>
                            {t("مُوصى", "Recommandé", "Recommended")}
                          </span>
                        )}
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "text-violet-600" : "text-gray-500"}`} />
                        <div className={`text-xs font-medium ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                          {style.label}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{style.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || (usage?.remaining === 0 && usage?.tier !== "pro")}
              className="flex-1 h-12 text-base bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  {t("جارٍ التوليد... (10-20 ثانية)", "Génération... (10-20s)", "Generating... (10-20s)")}
                </>
              ) : (
                <>
                  <Sparkles className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("توليد الصورة", "Générer l'image", "Generate Image")}
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowImageLibrary(true)}
              variant="outline"
              className="h-12 px-4 rounded-xl border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <Library className={`w-5 h-5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {tt.library}
            </Button>
            </div>

            {usage?.remaining === 0 && usage?.tier !== "pro" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-start gap-2">
                <Crown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">{t("وصلت إلى الحد الأقصى", "Limite atteinte", "Limit Reached")}</p>
                  <p className="text-xs mt-1">{t(`لقد استخدمت ${usage.limit} صور هذا الشهر. قم بالترقية إلى Pro للحصول على صور غير محدودة.`, `Vous avez utilisé ${usage.limit} images ce mois-ci. Passez à Pro pour des images illimitées.`, `You have used ${usage.limit} images this month. Upgrade to Pro for unlimited images.`)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {generatedImage ? (
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-l from-green-50 to-emerald-50 p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-bold text-green-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t("الصورة المُولَّدة", "Image générée", "Generated Image")}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(generatedImage.url)}
                      className="text-xs h-7"
                    >
                      <Download className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {tt.download}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveBg}
                      disabled={isRemovingBg}
                      className="text-xs h-7"
                    >
                      {isRemovingBg ? (
                        <Loader2 className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'} animate-spin`} />
                      ) : (
                        <Eraser className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      )}
                      {t("إزالة الخلفية", "Enlever fond", "Remove BG")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowOverlayEditor(true)}
                      className="text-xs h-7"
                    >
                      <Type className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t("تسميات عربية", "Légendes", "Labels")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setGeneratedImage(null)}
                      className="text-xs h-7 text-gray-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="bg-gray-50 rounded-xl p-2 flex items-center justify-center min-h-[300px]">
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="max-w-full max-h-[500px] rounded-lg shadow-md"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">{generatedImage.prompt}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Paintbrush className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{t("مرحباً بك في Leader Visual Studio", "Bienvenue sur Leader Visual Studio", "Welcome to Leader Visual Studio")}</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {t("صف الصورة التعليمية التي تحتاجها وسيقوم الذكاء الاصطناعي بتوليدها فوراً.", "Décrivez l'image éducative dont vous avez besoin et l'IA la générera instantanément.", "Describe the educational image you need, and the AI will generate it instantly.")}
                    <br/>
                    {t("النمط الافتراضي هو", "Le style par défaut est", "The default style is")} <strong>{t("رسم خطي أبيض/أسود", "Dessin au trait N&B", "B&W Line Art")}</strong> {t("المثالي للطباعة على أوراق المدرسة.", "idéal pour l'impression sur les feuilles scolaires.", "ideal for printing on school papers.")}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg">
              <div
                className="p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowGallery(!showGallery)}
              >
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  {t("وسائلي البصرية", "Mes visuels", "My Visuals")} ({galleryQuery.data?.length || 0})
                </span>
                {showGallery ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
              
              {showGallery && (
                <CardContent className="p-4">
                  {galleryQuery.data && galleryQuery.data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryQuery.data.map((img) => (
                        <div key={img.id} className="group relative rounded-xl overflow-hidden border bg-gray-50">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDownload(img.url)}
                                className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(img.id)}
                                className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-[10px] text-gray-500 truncate">{img.prompt}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[9px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                                {STYLES.find(s => s.id === img.style)?.label || img.style}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                {new Date(img.createdAt).toLocaleDateString(isRTL ? "ar-TN" : "fr-FR")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t("لا توجد صور بعد. قم بتوليد صورتك الأولى!", "Aucune image pour le moment. Générez votre première image !", "No images yet. Generate your first one!")}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      <EducationalImageLibrary
        open={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={(image) => {
          setGeneratedImage({ url: image.url, prompt: image.caption, style: "library" });
          setShowImageLibrary(false);
        }}
        onGenerateRequest={(p) => {
          setPrompt(p);
          setShowImageLibrary(false);
        }}
      />

      {showOverlayEditor && generatedImage && (
        <ImageOverlayEditor
          imageUrl={generatedImage.url}
          caption={generatedImage.prompt}
          open={showOverlayEditor}
          onClose={() => setShowOverlayEditor(false)}
          onSave={(dataUrl) => {
            setGeneratedImage({ ...generatedImage, url: dataUrl });
            setShowOverlayEditor(false);
          }}
        />
      )}
      </>)}
    </div>
  );
}
