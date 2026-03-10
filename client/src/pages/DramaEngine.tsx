import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  ArrowRight, Theater, Users, Sparkles, Download, Loader2,
  Play, Pause, ChevronDown, ChevronUp, Lightbulb, Target,
  Clock, BookOpen, Palette, MessageCircle, Star, Award,
  Wand2, UserPlus, Package, FileText, RefreshCw
} from "lucide-react";

type DramaScript = {
  title: string;
  synopsis: string;
  duration: string;
  characters: Array<{ name: string; description: string; keyLines: number; difficulty: string }>;
  scenes: Array<{
    number: number;
    title: string;
    setting: string;
    directorNotes: string;
    dialogue: Array<{ character: string; line: string; action: string }>;
    audienceInteraction: string;
  }>;
  educationalObjectives: string[];
  props: Array<{ name: string; description: string; cost: string; alternatives: string }>;
  warmUpActivity: string;
  debriefQuestions: string[];
};

export default function DramaEngine() {
  const { user, loading: authLoading } = useAuth();
  
  // Form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [duration, setDuration] = useState(10);
  const [studentCount, setStudentCount] = useState(25);
  
  // Result state
  const [script, setScript] = useState<DramaScript | null>(null);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [showRoles, setShowRoles] = useState(false);
  const [roles, setRoles] = useState<Array<{ studentNumber: number; characterName: string; role: string; tip: string }>>([]);
  
  // Mutations
  const generateMutation = trpc.drama.generateScript.useMutation({
    onSuccess: (data) => {
      setScript(data as DramaScript);
      setActiveScene(0);
    },
  });
  
  const assignRolesMutation = trpc.drama.assignRoles.useMutation({
    onSuccess: (data) => {
      setRoles(data.assignments);
      setShowRoles(true);
    },
  });
  
  const exportPdfMutation = trpc.drama.exportPDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  const subjects = useMemo(() => [
    "إيقاظ علمي", "رياضيات", "عربية", "فرنسية", "إنجليزية",
    "تربية إسلامية", "تاريخ وجغرافيا", "تربية مدنية",
    "تربية تشكيلية", "تربية موسيقية", "تربية بدنية"
  ], []);

  const grades = useMemo(() => [
    "السنة الأولى", "السنة الثانية", "السنة الثالثة",
    "السنة الرابعة", "السنة الخامسة", "السنة السادسة"
  ], []);

  const handleGenerate = () => {
    if (!lessonTitle || !subject || !grade || !lessonContent) return;
    generateMutation.mutate({
      lessonTitle, subject, grade, lessonContent,
      duration, studentCount,
    });
  };

  const handleAssignRoles = () => {
    if (!script) return;
    assignRolesMutation.mutate({
      characters: script.characters,
      studentCount,
    });
  };

  const handleExportPDF = () => {
    if (!script) return;
    exportPdfMutation.mutate({
      script,
      lessonTitle,
    });
  };

  const resetAll = () => {
    setScript(null);
    setRoles([]);
    setShowRoles(false);
    setActiveScene(0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Theater className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">محرك الدراما التعليمية</h1>
          <p className="text-gray-600 mb-6">حوّل دروسك إلى مسرحيات تفاعلية ممتعة!</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
            تسجيل الدخول
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-purple-600 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Theater className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">محرك الدراما التعليمية</h1>
                <p className="text-xs text-gray-500">حوّل الدرس إلى مسرحية تفاعلية</p>
              </div>
            </div>
          </div>
          {script && (
            <div className="flex items-center gap-2">
              <button onClick={handleExportPDF} disabled={exportPdfMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm border border-red-200 disabled:opacity-50">
                {exportPdfMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                تصدير PDF
              </button>
              <button onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-200">
                <RefreshCw className="w-4 h-4" />
                جديد
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {!script ? (
          /* ===== INPUT FORM ===== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  معلومات الدرس
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدرس *</label>
                    <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="مثال: الجهاز التنفسي عند الإنسان" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المادة *</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white">
                        <option value="">اختر المادة</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المستوى *</label>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white">
                        <option value="">اختر المستوى</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">مدة المسرحية (دقائق)</label>
                      <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                        min={5} max={30}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد التلاميذ</label>
                      <input type="number" value={studentCount} onChange={(e) => setStudentCount(Number(e.target.value))}
                        min={5} max={50}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">محتوى الدرس / الأهداف التعليمية *</label>
                    <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm resize-none"
                      placeholder="اكتب ملخص الدرس أو الأهداف التعليمية المراد تحويلها إلى مسرحية تفاعلية..." />
                  </div>
                  
                  <button onClick={handleGenerate}
                    disabled={!lessonTitle || !subject || !grade || !lessonContent || generateMutation.isPending}
                    className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-xl font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري إنشاء النص المسرحي...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        أنشئ المسرحية التفاعلية
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Tips */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <Theater className="w-10 h-10 mb-3 opacity-80" />
                <h3 className="text-lg font-bold mb-2">المسرح المدرسي</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  حوّل أي درس إلى مسرحية تفاعلية ممتعة. الذكاء الاصطناعي يُنشئ نصاً مسرحياً كاملاً مع شخصيات وحوارات وتعليمات إخراجية.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  نصائح للنجاح
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>اكتب محتوى الدرس بالتفصيل للحصول على نص أغنى</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>حدد عدد التلاميذ الفعلي لتوزيع الأدوار بدقة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>المسرحيات القصيرة (5-10 دقائق) أكثر فعالية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>يمكنك تصدير النص كـ PDF وطباعته للتلاميذ</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  ماذا ستحصل عليه؟
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    نص مسرحي كامل بالعربية
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    شخصيات مع توزيع تلقائي للأدوار
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-green-500" />
                    قائمة وسائل بسيطة ومنخفضة التكلفة
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                    أسئلة تفاعلية للجمهور
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* ===== SCRIPT RESULT ===== */
          <div className="space-y-6">
            {/* Script Header */}
            <div className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Theater className="w-6 h-6" />
                    <span className="text-sm opacity-80">مسرحية تعليمية</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{script.title}</h2>
                  <p className="text-sm opacity-90 leading-relaxed max-w-2xl">{script.synopsis}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    {script.duration}
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg">
                    <Users className="w-4 h-4" />
                    {script.characters.length} شخصية
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Warm-up Activity */}
                {script.warmUpActivity && (
                  <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      نشاط التحمية
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">{script.warmUpActivity}</p>
                  </div>
                )}

                {/* Scenes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Play className="w-5 h-5 text-purple-600" />
                    المشاهد
                  </h3>
                  
                  {script.scenes.map((scene, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                      <button onClick={() => setActiveScene(activeScene === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                            {scene.number}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">{scene.title}</div>
                            <div className="text-xs text-gray-500">{scene.dialogue.length} حوار</div>
                          </div>
                        </div>
                        {activeScene === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      
                      {activeScene === idx && (
                        <div className="px-4 pb-4 space-y-3">
                          {/* Setting */}
                          <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700 italic">
                            <Palette className="w-3.5 h-3.5 inline ml-1" />
                            {scene.setting}
                          </div>
                          
                          {/* Director Notes */}
                          {scene.directorNotes && (
                            <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 border border-amber-200">
                              <strong className="text-amber-800">تعليمات للمعلم:</strong> {scene.directorNotes}
                            </div>
                          )}
                          
                          {/* Dialogue */}
                          <div className="space-y-2">
                            {scene.dialogue.map((d, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {d.character.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-purple-700 text-sm">{d.character}</div>
                                  <div className="text-sm text-gray-800 leading-relaxed">{d.line}</div>
                                  {d.action && (
                                    <div className="text-xs text-gray-400 italic mt-1">({d.action})</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Audience Interaction */}
                          {scene.audienceInteraction && (
                            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 border border-blue-200">
                              <MessageCircle className="w-3.5 h-3.5 inline ml-1" />
                              <strong>تفاعل الجمهور:</strong> {scene.audienceInteraction}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Debrief Questions */}
                {script.debriefQuestions && script.debriefQuestions.length > 0 && (
                  <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      أسئلة النقاش بعد المسرحية
                    </h3>
                    <ul className="space-y-2">
                      {script.debriefQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                          <span className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Characters */}
                <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      الشخصيات
                    </h3>
                    <button onClick={handleAssignRoles}
                      disabled={assignRolesMutation.isPending}
                      className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium disabled:opacity-50">
                      {assignRolesMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3 inline ml-1" />}
                      وزّع الأدوار
                    </button>
                  </div>
                  <div className="space-y-2">
                    {script.characters.map((char, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">{char.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            char.difficulty === "easy" ? "bg-green-100 text-green-700" :
                            char.difficulty === "hard" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {char.difficulty === "easy" ? "سهل" : char.difficulty === "hard" ? "متقدم" : "متوسط"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{char.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Assignments */}
                {showRoles && roles.length > 0 && (
                  <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      توزيع الأدوار
                    </h3>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {roles.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 text-sm">
                          <span className="text-gray-600">تلميذ {r.studentNumber}</span>
                          <span className="font-medium text-blue-700 text-xs">{r.characterName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Props */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    الوسائل المطلوبة
                  </h3>
                  <div className="space-y-2">
                    {script.props.map((prop, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-green-50/50 border border-green-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">{prop.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            prop.cost === "مجاني" ? "bg-green-100 text-green-700" :
                            prop.cost === "منخفض" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>{prop.cost}</span>
                        </div>
                        <p className="text-xs text-gray-500">{prop.description}</p>
                        {prop.alternatives && (
                          <p className="text-xs text-green-600 mt-1">
                            <Lightbulb className="w-3 h-3 inline ml-1" />
                            بديل: {prop.alternatives}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Educational Objectives */}
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    الأهداف التعليمية
                  </h3>
                  <ul className="space-y-2">
                    {script.educationalObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
