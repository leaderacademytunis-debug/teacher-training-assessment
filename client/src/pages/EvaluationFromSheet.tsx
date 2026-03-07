import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Loader2, FileText, Download, Wand2, ChevronRight,
  ClipboardCheck, Target, BookOpen, CheckCircle2, Edit3,
  ListChecks, AlertCircle, RotateCcw
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EvaluationQuestion {
  number: number;
  question: string;
  options?: string[];
  points: number;
  answer: string;
  justification?: string;
}

interface EvaluationSection {
  sectionNumber: number;
  sectionTitle: string;
  sectionType: string;
  points: number;
  instructions: string;
  questions: EvaluationQuestion[];
}

interface IntegrationSituation {
  context: string;
  task: string;
  points: number;
  expectedAnswer: string;
}

interface EvaluationCriterion {
  criterion: string;
  indicators: string[];
}

interface Evaluation {
  evaluationTitle?: string;
  subject?: string;
  level?: string;
  trimester?: string;
  duration?: string;
  evaluationType?: string;
  totalPoints?: number;
  learningObjective?: string;
  competency?: string;
  sections?: EvaluationSection[];
  integrationSituation?: IntegrationSituation;
  evaluationCriteria?: EvaluationCriterion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SECTION_TYPE_LABELS: Record<string, string> = {
  true_false: "صواب / خطأ",
  fill_blank: "ملء فراغات",
  mcq: "اختيار من متعدد",
  open: "أسئلة مفتوحة",
  integration: "وضعية إدماجية",
};

const SECTION_TYPE_COLORS: Record<string, string> = {
  true_false: "bg-blue-100 text-blue-700",
  fill_blank: "bg-purple-100 text-purple-700",
  mcq: "bg-amber-100 text-amber-700",
  open: "bg-green-100 text-green-700",
  integration: "bg-rose-100 text-rose-700",
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EvaluationFromSheet() {
  const [, navigate] = useLocation();

  // Récupérer la fiche depuis sessionStorage (passée depuis LessonSheetFromPlan)
  const [sheet, setSheet] = useState<Record<string, unknown> | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [editedEvaluation, setEditedEvaluation] = useState<Evaluation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  // Paramètres de génération
  const [evaluationType, setEvaluationType] = useState<"formative" | "summative" | "diagnostic">("formative");
  const [questionCount, setQuestionCount] = useState(8);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2025-2026");

  useEffect(() => {
    const stored = sessionStorage.getItem("evaluationSheet");
    if (stored) {
      try {
        setSheet(JSON.parse(stored));
      } catch {
        toast.error("خطأ في تحميل بيانات الجذاذة");
      }
    }
  }, []);

  // ── Mutation: توليد ──────────────────────────────────────────────────────
  const generateMutation = trpc.pedagogicalSheets.generateEvaluationFromSheet.useMutation({
    onSuccess: (data) => {
      setEvaluation(data.evaluation as Evaluation);
      setEditedEvaluation(data.evaluation as Evaluation);
      toast.success("تم توليد ورقة التقييم بنجاح!");
    },
    onError: (err) => {
      toast.error(`خطأ في التوليد: ${err.message}`);
    },
  });

  // ── Mutation: تصدير Word ──────────────────────────────────────────────────
  const exportWordMutation = trpc.pedagogicalSheets.exportEvaluationToWord.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.base64}`;
      link.download = data.filename;
      link.click();
      toast.success("تم تحميل ورقة التقييم بصيغة Word!");
    },
    onError: (err) => {
      toast.error(`خطأ في التصدير: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!sheet) {
      toast.error("لا توجد بيانات جذاذة. يرجى العودة وتوليد جذاذة أولاً.");
      return;
    }
    generateMutation.mutate({
      sheet,
      evaluationType,
      questionCount,
      includeAnswerKey,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
      schoolYear: schoolYear || undefined,
    });
  };

  const handleExportWord = () => {
    const evalToExport = editMode ? editedEvaluation : evaluation;
    if (!evalToExport) return;
    exportWordMutation.mutate({
      evaluation: evalToExport as Record<string, unknown>,
      includeAnswerKey,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
      schoolYear: schoolYear || undefined,
    });
  };

  const displayEval = editMode ? editedEvaluation : evaluation;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <BackButton to="/lesson-sheet-from-plan" label="العودة للجذاذة" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">توليد ورقة التقييم</h1>
          </div>
          {sheet && (
            <Badge variant="outline" className="mr-auto border-green-300 text-green-700 text-xs">
              {String(sheet.subject || "")} — {String(sheet.level || "")}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* معلومات الجذاذة المصدر */}
        {sheet && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800 mb-1">الجذاذة المصدر</p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">{String(sheet.lessonTitle || sheet.distinguishedObjective || "درس")}</span>
                    {" — "}
                    {String(sheet.subject || "")} — {String(sheet.level || "")} — {String(sheet.trimester || "")}
                  </p>
                  {!!sheet.distinguishedObjective && (
                    <p className="text-xs text-green-600 mt-1">
                      الهدف المميز: {String(sheet.distinguishedObjective)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!sheet && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">لا توجد جذاذة محملة</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    يرجى العودة إلى صفحة الجذاذة وتوليد جذاذة أولاً، ثم الضغط على زر "توليد اختبار".
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/lesson-sheet-from-plan")}
                  className="mr-auto border-amber-400 text-amber-700"
                >
                  <ChevronRight className="w-4 h-4 ml-1" />
                  توليد جذاذة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* إعدادات التوليد */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              <Target className="w-5 h-5 text-green-600" />
              إعدادات ورقة التقييم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* نوع التقييم */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">نوع التقييم</Label>
                <Select value={evaluationType} onValueChange={(v) => setEvaluationType(v as "formative" | "summative" | "diagnostic")}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formative">تكويني (أثناء التعلم)</SelectItem>
                    <SelectItem value="summative">إجمالي (نهاية الوحدة)</SelectItem>
                    <SelectItem value="diagnostic">تشخيصي (قبلي)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* عدد الأسئلة */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">عدد الأسئلة ({questionCount})</Label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>3</span>
                  <span>15</span>
                </div>
              </div>

              {/* مفتاح الإجابة */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">مفتاح الإجابة</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={includeAnswerKey}
                    onCheckedChange={setIncludeAnswerKey}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm text-gray-600">
                    {includeAnswerKey ? "مضمّن في الملف" : "غير مضمّن"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">اسم المدرسة (اختياري)</Label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="مدرسة ابتدائية..."
                  className="border-gray-300 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">اسم المدرس/ة (اختياري)</Label>
                <Input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="الأستاذ/ة..."
                  className="border-gray-300 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">السنة الدراسية</Label>
                <Input
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  placeholder="2025-2026"
                  className="border-gray-300 text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !sheet}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 text-base font-bold shadow-md"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جارٍ توليد ورقة التقييم...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 ml-2" />
                  ✨ توليد ورقة التقييم بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ورقة التقييم المولّدة */}
        {displayEval && (
          <div className="space-y-4">
            {/* شريط الإجراءات */}
            <div className="flex flex-wrap items-center gap-2 justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800 text-sm">ورقة التقييم جاهزة</span>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  {displayEval.totalPoints || 20} / 20 نقطة
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className="border-gray-300 text-gray-600 text-xs"
                >
                  <ListChecks className="w-3.5 h-3.5 ml-1" />
                  {showAnswerKey ? "إخفاء مفتاح الإجابة" : "إظهار مفتاح الإجابة"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className={`text-xs ${editMode ? "border-orange-400 text-orange-600" : "border-blue-300 text-blue-600"}`}
                >
                  <Edit3 className="w-3.5 h-3.5 ml-1" />
                  {editMode ? "إيقاف التعديل" : "تعديل يدوي"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportWord}
                  disabled={exportWordMutation.isPending}
                  className="bg-[#1E8449] hover:bg-[#196F3D] text-white text-xs"
                >
                  {exportWordMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 ml-1" />
                  )}
                  تحميل Word
                </Button>
              </div>
            </div>

            {/* ترويسة ورقة التقييم */}
            <Card className="border-green-300 shadow-sm overflow-hidden">
              <div className="bg-[#1E8449] text-white px-6 py-4 text-center">
                <p className="text-xs opacity-80 mb-1">الجمهورية التونسية — وزارة التربية</p>
                <p className="text-xs opacity-70 mb-2">المحرك البيداغوجي الذكي — Leader Academy</p>
                {editMode ? (
                  <Input
                    value={editedEvaluation?.evaluationTitle || ""}
                    onChange={(e) => setEditedEvaluation(prev => prev ? { ...prev, evaluationTitle: e.target.value } : prev)}
                    className="text-center font-bold text-lg bg-white/20 border-white/40 text-white placeholder:text-white/60"
                  />
                ) : (
                  <h2 className="text-xl font-bold">{displayEval.evaluationTitle || "ورقة تقييم"}</h2>
                )}
              </div>

              <CardContent className="pt-4 pb-4">
                {/* بيانات عامة */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "المادة", key: "subject" },
                    { label: "المستوى", key: "level" },
                    { label: "الثلاثي", key: "trimester" },
                    { label: "المدة", key: "duration" },
                  ].map(({ label, key }) => (
                    <div key={key} className="bg-green-50 rounded-lg p-2.5 text-center border border-green-100">
                      <p className="text-xs text-green-600 font-medium mb-0.5">{label}</p>
                      {editMode ? (
                        <Input
                          value={String((editedEvaluation as Record<string, unknown>)?.[key] || "")}
                          onChange={(e) => setEditedEvaluation(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                          className="text-center text-sm h-7 border-green-200"
                        />
                      ) : (
                        <p className="text-sm font-bold text-gray-800">
                          {String((displayEval as Record<string, unknown>)?.[key] ?? "—")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* الكفاية والهدف */}
                <div className="space-y-2 mb-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs font-bold text-teal-700 shrink-0 mt-0.5">الكفاية المقيّمة:</span>
                    {editMode ? (
                      <Textarea
                        value={editedEvaluation?.competency || ""}
                        onChange={(e) => setEditedEvaluation(prev => prev ? { ...prev, competency: e.target.value } : prev)}
                        className="text-sm border-teal-200 min-h-[50px]"
                      />
                    ) : (
                      <p className="text-sm text-teal-800">{displayEval.competency}</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-xs font-bold text-teal-700 shrink-0 mt-0.5">الهدف المستهدف:</span>
                    {editMode ? (
                      <Textarea
                        value={editedEvaluation?.learningObjective || ""}
                        onChange={(e) => setEditedEvaluation(prev => prev ? { ...prev, learningObjective: e.target.value } : prev)}
                        className="text-sm border-teal-200 min-h-[50px]"
                      />
                    ) : (
                      <p className="text-sm text-teal-800">{displayEval.learningObjective}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* أقسام الأسئلة */}
                <div className="space-y-5">
                  {(displayEval.sections || []).map((sec, sIdx) => (
                    <div key={sIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* رأس القسم */}
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm">
                            القسم {sec.sectionNumber} — {sec.sectionTitle}
                          </span>
                          <Badge className={`text-xs ${SECTION_TYPE_COLORS[sec.sectionType] || "bg-gray-100 text-gray-600"}`}>
                            {SECTION_TYPE_LABELS[sec.sectionType] || sec.sectionType}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-300">
                          {sec.points} نقطة
                        </Badge>
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        {/* التعليمة */}
                        <p className="text-xs text-gray-500 italic border-r-2 border-green-400 pr-2">
                          {sec.instructions}
                        </p>

                        {/* الأسئلة */}
                        {sec.questions.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-green-700 shrink-0 mt-0.5 w-5">
                                {q.number}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{q.question}</p>
                                {/* خيارات MCQ */}
                                {Array.isArray(q.options) && q.options.length > 0 && (
                                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 border border-gray-100">
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* مساحة الإجابة للأسئلة المفتوحة */}
                                {(sec.sectionType === "open" || sec.sectionType === "fill_blank") && (
                                  <div className="mt-1.5 border-b border-dashed border-gray-300 h-6" />
                                )}
                                {/* مفتاح الإجابة */}
                                {showAnswerKey && includeAnswerKey && (
                                  <div className="mt-1.5 flex items-start gap-1.5 bg-green-50 rounded px-2 py-1 border border-green-100">
                                    <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-700">
                                      <span className="font-medium">الإجابة: </span>
                                      {q.answer}
                                      {q.justification && <span className="text-green-600"> — {q.justification}</span>}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 shrink-0">({q.points}ن)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* الوضعية الإدماجية */}
                {displayEval.integrationSituation && (
                  <>
                    <Separator className="my-4" />
                    <div className="border border-rose-200 rounded-lg overflow-hidden">
                      <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between">
                        <span className="font-bold text-rose-800 text-sm">الوضعية الإدماجية</span>
                        <Badge className="bg-rose-100 text-rose-700 text-xs">
                          {displayEval.integrationSituation.points} نقطة
                        </Badge>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-rose-700 mb-1">السياق:</p>
                          {editMode ? (
                            <Textarea
                              value={editedEvaluation?.integrationSituation?.context || ""}
                              onChange={(e) => setEditedEvaluation(prev => prev ? {
                                ...prev,
                                integrationSituation: { ...prev.integrationSituation!, context: e.target.value }
                              } : prev)}
                              className="text-sm border-rose-200 min-h-[60px]"
                            />
                          ) : (
                            <p className="text-sm text-gray-700 bg-rose-50/50 rounded p-2 border border-rose-100">
                              {displayEval.integrationSituation.context}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-rose-700 mb-1">المهمة:</p>
                          {editMode ? (
                            <Textarea
                              value={editedEvaluation?.integrationSituation?.task || ""}
                              onChange={(e) => setEditedEvaluation(prev => prev ? {
                                ...prev,
                                integrationSituation: { ...prev.integrationSituation!, task: e.target.value }
                              } : prev)}
                              className="text-sm border-rose-200 min-h-[50px]"
                            />
                          ) : (
                            <p className="text-sm text-gray-700">{displayEval.integrationSituation.task}</p>
                          )}
                        </div>
                        <div className="border-b border-dashed border-gray-300 h-8" />
                        <div className="border-b border-dashed border-gray-300 h-8" />
                        {showAnswerKey && includeAnswerKey && (
                          <div className="bg-green-50 rounded p-2 border border-green-100">
                            <p className="text-xs font-bold text-green-700 mb-1">الإجابة المتوقعة:</p>
                            <p className="text-sm text-green-800">{displayEval.integrationSituation.expectedAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* معايير التقييم */}
                {displayEval.evaluationCriteria && displayEval.evaluationCriteria.length > 0 && showAnswerKey && (
                  <>
                    <Separator className="my-4" />
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4" />
                        معايير التقييم
                      </p>
                      <div className="space-y-2">
                        {displayEval.evaluationCriteria.map((c, cIdx) => (
                          <div key={cIdx} className="text-xs">
                            <span className="font-semibold text-blue-700">• {c.criterion}: </span>
                            <span className="text-blue-600">{Array.isArray(c.indicators) ? c.indicators.join(" — ") : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* أزرار التصدير النهائية */}
            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={handleExportWord}
                disabled={exportWordMutation.isPending}
                className="bg-[#1E8449] hover:bg-[#196F3D] text-white px-8 py-3 text-base font-bold shadow-lg"
              >
                {exportWordMutation.isPending ? (
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 ml-2" />
                )}
                تحميل ورقة التقييم بصيغة Word • قالب Leader Academy
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="border-green-500 text-green-700 hover:bg-green-50 px-6"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                توليد جديد
              </Button>
            </div>

            <Separator />
            <p className="text-center text-xs text-gray-400">
              🇹🇳 الجمهورية التونسية — Leader Academy — leaderacademy.school
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
