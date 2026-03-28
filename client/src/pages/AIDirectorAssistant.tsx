import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Film, Clapperboard, Sparkles, Loader2, Play, Pause, Download,
  Edit3, Eye, Camera, Music, ChevronLeft, ChevronRight, Trash2,
  Image as ImageIcon, Video, RefreshCw, Check, X, ArrowRight,
  User, Crown, Wand2, Layers, Clock, Volume2, FileText
} from "lucide-react";
import ArabicTTS from "@/components/ArabicTTS";
import useI18n from "@/i18n";


type ProjectView = "list" | "create" | "editor";

interface SceneData {
  sceneNumber: number;
  title: string;
  description: string;
  visualPrompt: string;
  editedPrompt: string | null;
  cameraAngle: string;
  mood: string;
  duration: number;
  imageUrl: string | null;
  videoUrl: string | null;
  videoStatus: "pending" | "generating" | "completed" | "failed";
  errorMessage: string | null;
}

export default function AIDirectorAssistant() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();

  const [view, setView] = useState<ProjectView>("list");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);

  // Create form state
  const [script, setScript] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [characterProfile, setCharacterProfile] = useState<"teacher" | "leader" | "custom">("teacher");
  const [customCharacterDesc, setCustomCharacterDesc] = useState("");

  // Check for prefill data from EduGPT lesson-to-video conversion
  useEffect(() => {
    try {
      const prefillData = sessionStorage.getItem("ai_director_prefill");
      if (prefillData) {
        const data = JSON.parse(prefillData);
        if (data.script) setScript(data.script);
        if (data.subject) setSubject(data.subject);
        if (data.level) setLevel(data.level);
        setView("create");
        sessionStorage.removeItem("ai_director_prefill");
        toast.success("تم استيراد السكريبت من الجذاذة — اختر الشخصية واضغط إنشاء");
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Edit prompt state
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [editPromptText, setEditPromptText] = useState("");

  // Queries
  const projectsQuery = trpc.aiDirector.listProjects.useQuery({ limit: 20 });
  const profilesQuery = trpc.aiDirector.getCharacterProfiles.useQuery();
  const activeProject = trpc.aiDirector.getProject.useQuery(
    { id: activeProjectId! },
    { enabled: !!activeProjectId }
  );

  // Mutations
  const generateScenesMut = trpc.aiDirector.generateScenes.useMutation();
  const updatePromptMut = trpc.aiDirector.updateScenePrompt.useMutation();
  const generateImageMut = trpc.aiDirector.generateSceneImage.useMutation();
  const generateVideoMut = trpc.aiDirector.generateSceneVideo.useMutation();
  const generateAllMut = trpc.aiDirector.generateAllVideos.useMutation();
  const suggestSoundtrackMut = trpc.aiDirector.suggestSoundtrack.useMutation();
  const deleteProjectMut = trpc.aiDirector.deleteProject.useMutation();

  const scenes: SceneData[] = useMemo(() => {
    if (!activeProject.data?.scenes) return [];
    return activeProject.data.scenes as SceneData[];
  }, [activeProject.data]);

  const currentScene = scenes[activeSceneIdx] || null;

  // Handlers
  const handleCreateProject = async () => {
    if (!script.trim() || script.length < 20) {
      toast.error("يرجى كتابة نص الدرس (20 حرفاً على الأقل)");
      return;
    }
    try {
      const result = await generateScenesMut.mutateAsync({
        script: script.trim(),
        subject: subject || undefined,
        level: level || undefined,
        characterProfile,
        customCharacterDesc: characterProfile === "custom" ? customCharacterDesc : undefined,
      });
      toast.success(`تم تقسيم النص إلى ${result.scenes.length} مشاهد سينمائية`);
      setActiveProjectId(Number(result.projectId));
      setView("editor");
      setActiveSceneIdx(0);
      projectsQuery.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSavePromptEdit = async (sceneNumber: number) => {
    if (!activeProjectId || !editPromptText.trim()) return;
    try {
      await updatePromptMut.mutateAsync({
        projectId: activeProjectId,
        sceneNumber,
        editedPrompt: editPromptText.trim(),
      });
      toast.success("تم تحديث وصف المشهد");
      setEditingScene(null);
      activeProject.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerateImage = async (sceneNumber: number) => {
    if (!activeProjectId) return;
    try {
      await generateImageMut.mutateAsync({ projectId: activeProjectId, sceneNumber });
      toast.success(`تم إنشاء صورة المشهد ${sceneNumber}`);
      activeProject.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerateAll = async () => {
    if (!activeProjectId) return;
    try {
      const result = await generateAllMut.mutateAsync({ projectId: activeProjectId });
      result.success ? toast.success(result.message) : toast.warning(result.message);
      activeProject.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSuggestSoundtrack = async () => {
    if (!activeProjectId) return;
    try {
      await suggestSoundtrackMut.mutateAsync({ projectId: activeProjectId });
      toast.success("تم اقتراح الموسيقى التصويرية");
      activeProject.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("هل تريد حذف هذا المشروع؟")) return;
    await deleteProjectMut.mutateAsync({ id });
    projectsQuery.refetch();
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setView("list");
    }
  };

  const handleOpenProject = (id: number) => {
    setActiveProjectId(id);
    setView("editor");
    setActiveSceneIdx(0);
  };

  const profiles = profilesQuery.data?.profiles || [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
    scenes_generated: { label: "المشاهد جاهزة", color: "bg-blue-100 text-blue-700" },
    images_generating: { label: "جاري توليد الصور", color: "bg-yellow-100 text-yellow-700" },
    videos_generating: { label: "جاري توليد الفيديو", color: "bg-orange-100 text-orange-700" },
    merging: { label: "جاري الدمج", color: "bg-purple-100 text-purple-700" },
    completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
    failed: { label: "فشل", color: "bg-red-100 text-red-700" },
  };

  // ============ RENDER ============

  // PROJECT LIST VIEW
  if (view === "list") {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">مساعد المخرج بالذكاء الاصطناعي</h2>
              <p className="text-sm text-gray-500">حوّل نصوص دروسك إلى مشاهد فيديو سينمائية</p>
            </div>
          </div>
          <Button
            onClick={() => setView("create")}
            className="bg-gradient-to-l from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 ms-2" />
            مشروع جديد
          </Button>
        </div>

        {/* Projects Grid */}
        {projectsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsQuery.data.map((project) => {
              const st = statusLabels[project.status] || statusLabels.draft;
              const projectScenes = (project.scenes || []) as SceneData[];
              const firstImage = projectScenes.find((s) => s.imageUrl)?.imageUrl;
              return (
                <Card key={project.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    {firstImage ? (
                      <img src={firstImage} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 end-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        onClick={() => handleOpenProject(project.id)}
                        className="bg-white text-gray-800 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4 ms-1" />
                        فتح
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{project.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString("ar-TN")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">{projectScenes.length} مشاهد</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                          className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clapperboard className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">ابدأ مشروعك الأول</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                اكتب نص درسك وسيقوم الذكاء الاصطناعي بتقسيمه إلى 5 مشاهد سينمائية مع وصف بصري مفصّل لكل مشهد
              </p>
              <Button onClick={() => setView("create")} className="bg-gradient-to-l from-rose-500 to-purple-600">
                <Sparkles className="w-4 h-4 ms-2" />
                إنشاء مشروع
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // CREATE PROJECT VIEW
  if (view === "create") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">مشروع فيديو جديد</h2>
            <p className="text-sm text-gray-500">اكتب نص الدرس واختر الشخصية</p>
          </div>
        </div>

        {/* Script Input */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline ms-1" />
              نص الدرس / السيناريو
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="اكتب هنا نص الدرس الذي تريد تحويله إلى فيديو تعليمي...&#10;&#10;مثال: درس الكسور للسنة الخامسة ابتدائي. يبدأ المعلم بتقديم مفهوم الكسر باستخدام قطعة بيتزا مقسمة إلى أجزاء متساوية. ثم يشرح البسط والمقام مع أمثلة عملية..."
              className="w-full border rounded-xl p-4 text-sm min-h-[180px] resize-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              dir="rtl"
            />
            <p className="text-xs text-gray-400 mt-1">{script.length} حرف (الحد الأدنى: 20)</p>
          </CardContent>
        </Card>

        {/* Context */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-gray-700 mb-3">السياق التعليمي</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">المادة</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm mt-1">
                  <option value="">اختر المادة</option>
                  <option value="عربية">عربية</option>
                  <option value="رياضيات">رياضيات</option>
                  <option value="إيقاظ علمي">إيقاظ علمي</option>
                  <option value="تربية إسلامية">تربية إسلامية</option>
                  <option value="تاريخ وجغرافيا">تاريخ وجغرافيا</option>
                  <option value="فرنسية">فرنسية</option>
                  <option value="إنجليزية">إنجليزية</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">المستوى</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm mt-1">
                  <option value="">اختر المستوى</option>
                  <option value="السنة الأولى">السنة الأولى</option>
                  <option value="السنة الثانية">السنة الثانية</option>
                  <option value="السنة الثالثة">السنة الثالثة</option>
                  <option value="السنة الرابعة">السنة الرابعة</option>
                  <option value="السنة الخامسة">السنة الخامسة</option>
                  <option value="السنة السادسة">السنة السادسة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Profile Selection */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-gray-700 mb-3">
              <User className="w-4 h-4 inline ms-1" />
              شخصية الفيديو (Character Consistency)
            </p>
            <p className="text-xs text-gray-500 mb-4">
              اختر شخصية ثابتة تظهر في جميع المشاهد لضمان التناسق البصري
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setCharacterProfile(profile.id as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-end ${
                    characterProfile === profile.id
                      ? "border-purple-500 bg-purple-50 shadow-md"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-rose-400 flex items-center justify-center mb-2">
                    {profile.id === "teacher" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : profile.id === "leader" ? (
                      <Crown className="w-5 h-5 text-white" />
                    ) : (
                      <Wand2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="font-bold text-sm text-gray-800">{profile.name}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{profile.description}</div>
                </button>
              ))}
            </div>

            {characterProfile === "custom" && (
              <div className="mt-4">
                <label className="text-xs text-gray-500">وصف الشخصية المخصصة (بالإنجليزية أو العربية)</label>
                <textarea
                  value={customCharacterDesc}
                  onChange={(e) => setCustomCharacterDesc(e.target.value)}
                  placeholder="مثال: معلمة شابة ترتدي نظارات دائرية وقميصاً أزرق..."
                  className="w-full border rounded-lg p-3 text-sm mt-1 min-h-[80px] resize-none"
                  dir="rtl"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleCreateProject}
          disabled={script.length < 20 || generateScenesMut.isPending}
          className="w-full h-14 text-lg bg-gradient-to-l from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-lg"
        >
          {generateScenesMut.isPending ? (
            <>
              <Loader2 className="w-6 h-6 ms-2 animate-spin" />
              جاري تحليل النص وإنشاء المشاهد... (15-30 ثانية)
            </>
          ) : (
            <>
              <Clapperboard className="w-6 h-6 ms-2" />
              إنشاء المشاهد السينمائية
            </>
          )}
        </Button>
      </div>
    );
  }

  // EDITOR VIEW (Storyline Preview)
  return (
    <div className="space-y-4" dir="rtl">
      {/* Editor Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {activeProject.data?.title || "جاري التحميل..."}
            </h2>
            <p className="text-xs text-gray-500">
              {activeProject.data?.subject && `${activeProject.data.subject} • `}
              {activeProject.data?.level && `${activeProject.data.level} • `}
              {scenes.length} مشاهد
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSuggestSoundtrack}
            disabled={suggestSoundtrackMut.isPending}
            className="text-xs"
          >
            {suggestSoundtrackMut.isPending ? <Loader2 className="w-3 h-3 ms-1 animate-spin" /> : <Music className="w-3 h-3 ms-1" />}
            اقتراح موسيقى
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateAll}
            disabled={generateAllMut.isPending}
            className="text-xs bg-gradient-to-l from-rose-500 to-purple-600"
          >
            {generateAllMut.isPending ? <Loader2 className="w-3 h-3 ms-1 animate-spin" /> : <Play className="w-3 h-3 ms-1" />}
            توليد الكل
          </Button>
        </div>
      </div>

      {activeProject.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scene Timeline (Left) */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-purple-500" />
              خط الأحداث (Storyline)
            </h3>
            {scenes.map((scene, idx) => (
              <button
                key={scene.sceneNumber}
                onClick={() => setActiveSceneIdx(idx)}
                className={`w-full text-end p-3 rounded-xl border-2 transition-all ${
                  activeSceneIdx === idx
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    activeSceneIdx === idx ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {scene.sceneNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-gray-800 truncate">{scene.title}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{scene.description}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Camera className="w-2.5 h-2.5" /> {scene.cameraAngle}
                      </span>
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {scene.duration}s
                      </span>
                      {scene.videoStatus === "completed" && (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                      {scene.videoStatus === "generating" && (
                        <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                      )}
                      {scene.videoStatus === "failed" && (
                        <X className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  {scene.imageUrl && (
                    <img src={scene.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}

            {/* Soundtrack Card */}
            {activeProject.data?.soundtrack && (
              <Card className="border-0 shadow-md mt-4">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-gray-700">الموسيقى التصويرية</span>
                  </div>
                  <div className="text-[11px] text-gray-600">
                    <p><strong>النوع:</strong> {(activeProject.data.soundtrack as any).genre}</p>
                    <p><strong>المزاج:</strong> {(activeProject.data.soundtrack as any).mood}</p>
                    <p className="mt-1">{(activeProject.data.soundtrack as any).suggestion}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scene Detail (Right) */}
          <div className="lg:col-span-2 space-y-4">
            {currentScene && (
              <>
                {/* Scene Preview */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-l from-purple-50 to-rose-50 p-3 border-b flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-500" />
                      المشهد {currentScene.sceneNumber}: {currentScene.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {currentScene.cameraAngle}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {currentScene.mood}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {currentScene.duration}s
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {/* Image/Video Preview */}
                    <div className="bg-gray-900 rounded-xl overflow-hidden mb-4 relative" style={{ aspectRatio: "16/9" }}>
                      {currentScene.imageUrl ? (
                        <img
                          src={currentScene.imageUrl}
                          alt={currentScene.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                          <p className="text-sm">لم يتم توليد صورة المعاينة بعد</p>
                        </div>
                      )}
                      {/* Scene number overlay */}
                      <div className="absolute top-3 start-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-bold">
                        المشهد {currentScene.sceneNumber}/5
                      </div>
                      {currentScene.videoStatus === "generating" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                            <p className="text-sm">جاري توليد الفيديو...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scene Description */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-gray-600">وصف المشهد</h4>
                        <ArabicTTS
                          text={currentScene.description}
                          label="استمع"
                          size="sm"
                          variant="ghost"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6 text-[10px]"
                        />
                      </div>
                      <p className="text-sm text-gray-700">{currentScene.description}</p>
                    </div>

                    {/* Visual Prompt (Editable) */}
                    <div className="bg-gradient-to-l from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1">
                          <Wand2 className="w-3 h-3" />
                          الوصف البصري (Visual Prompt)
                        </h4>
                        {editingScene !== currentScene.sceneNumber ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6"
                            onClick={() => {
                              setEditingScene(currentScene.sceneNumber);
                              setEditPromptText(currentScene.editedPrompt || currentScene.visualPrompt);
                            }}
                          >
                            <Edit3 className="w-3 h-3 ms-1" />
                            تعديل
                          </Button>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6 text-green-600"
                              onClick={() => handleSavePromptEdit(currentScene.sceneNumber)}
                              disabled={updatePromptMut.isPending}
                            >
                              {updatePromptMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6 text-red-500"
                              onClick={() => setEditingScene(null)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingScene === currentScene.sceneNumber ? (
                        <textarea
                          value={editPromptText}
                          onChange={(e) => setEditPromptText(e.target.value)}
                          className="w-full border rounded-lg p-3 text-xs min-h-[100px] resize-none focus:ring-2 focus:ring-purple-400"
                          dir="ltr"
                        />
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed" dir="ltr">
                          {currentScene.editedPrompt || currentScene.visualPrompt}
                        </p>
                      )}
                    </div>

                    {/* TTS: Read All Scenes */}
                    <div className="bg-gradient-to-l from-indigo-50 to-purple-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-bold text-gray-700">التعليق الصوتي</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArabicTTS
                            text={currentScene.description}
                            label={`استمع للمشهد ${currentScene.sceneNumber}`}
                            size="sm"
                            className="bg-gradient-to-l from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 border-0 text-[10px] h-7"
                            showVoiceSelector
                          />
                          <ArabicTTS
                            text={scenes.map(s => `المشهد ${s.sceneNumber}: ${s.title}. ${s.description}`).join(". ")}
                            label="استمع لكل المشاهد"
                            size="sm"
                            className="bg-gradient-to-l from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 border-0 text-[10px] h-7"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateImage(currentScene.sceneNumber)}
                        disabled={generateImageMut.isPending}
                        className="text-xs bg-gradient-to-l from-blue-500 to-cyan-500"
                      >
                        {generateImageMut.isPending ? (
                          <Loader2 className="w-3 h-3 ms-1 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3 h-3 ms-1" />
                        )}
                        {currentScene.imageUrl ? "إعادة توليد الصورة" : "توليد صورة المعاينة"}
                      </Button>
                      {currentScene.imageUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = currentScene.imageUrl!;
                            a.download = `scene-${currentScene.sceneNumber}.png`;
                            a.click();
                          }}
                        >
                          <Download className="w-3 h-3 ms-1" />
                          تحميل الصورة
                        </Button>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={activeSceneIdx === 0}
                        onClick={() => setActiveSceneIdx(activeSceneIdx - 1)}
                        className="text-xs"
                      >
                        <ChevronRight className="w-4 h-4 ms-1" />
                        المشهد السابق
                      </Button>
                      <div className="flex gap-1">
                        {scenes.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSceneIdx(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              activeSceneIdx === idx ? "bg-purple-500 scale-125" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={activeSceneIdx >= scenes.length - 1}
                        onClick={() => setActiveSceneIdx(activeSceneIdx + 1)}
                        className="text-xs"
                      >
                        المشهد التالي
                        <ChevronLeft className="w-4 h-4 me-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Section */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                      <Download className="w-4 h-4 text-purple-500" />
                      التصدير والدمج
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-700 mb-1">دمج المشاهد</p>
                        <p className="text-[10px] text-gray-500 mb-3">
                          دمج جميع المشاهد في فيديو واحد مع الموسيقى التصويرية
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs w-full"
                          disabled={!scenes.every((s) => s.videoStatus === "completed")}
                          onClick={() => toast.info("ميزة دمج الفيديو ستكون متاحة عند ربط API الفيديو الخارجي (Veo/Runway)")}
                        >
                          <Film className="w-3 h-3 ms-1" />
                          دمج الفيديو النهائي
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-700 mb-1">تصدير السيناريو</p>
                        <p className="text-[10px] text-gray-500 mb-3">
                          تحميل السيناريو الكامل مع أوصاف المشاهد والملاحظات
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs w-full"
                          onClick={() => {
                            const content = scenes.map((s) =>
                              `المشهد ${s.sceneNumber}: ${s.title}\n${s.description}\nزاوية الكاميرا: ${s.cameraAngle}\nالمزاج: ${s.mood}\nالمدة: ${s.duration} ثانية\nالوصف البصري: ${s.editedPrompt || s.visualPrompt}\n`
                            ).join("\n---\n\n");
                            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${activeProject.data?.title || "scenario"}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-3 h-3 ms-1" />
                          تحميل السيناريو
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
