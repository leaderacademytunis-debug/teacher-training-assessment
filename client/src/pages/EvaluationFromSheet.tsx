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
  ListChecks, AlertCircle, RotateCcw, Grid3X3,
  Printer, Copy, Save, BookMarked
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useLocation } from "wouter";

// ─── Types SC2M223 ────────────────────────────────────────────────────────────
interface Instruction {
  instructionNumber: number;
  instructionText: string;
  criterionCode?: string;
  points: number;
  items?: string[];
  tableHeaders?: string[];
  answer?: string;
}

interface Support {
  supportNumber: number;
  supportTitle: string;
  supportText?: string;
  instructions: Instruction[];
}

interface ScoringLevel {
  levelCode: string;
  description: string;
}

interface ScoringGrid {
  criteria: string[];
  levels: ScoringLevel[];
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
  supports?: Support[];
  scoringGrid?: ScoringGrid;
  // Legacy fields (backward compat)
  sections?: unknown[];
  integrationSituation?: unknown;
  evaluationCriteria?: unknown[];
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EvaluationFromSheet() {
  const [, navigate] = useLocation();

  const [sheet, setSheet] = useState<Record<string, unknown> | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [editedEvaluation, setEditedEvaluation] = useState<Evaluation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

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

  // ── Mutation: حفظ في المكتبة ─────────────────────────────────────────────
  const saveEvalMutation = trpc.pedagogicalSheets.saveEvaluation.useMutation({
    onSuccess: (data) => {
      setIsSaved(true);
      setSavedId(data.id);
      toast.success("تم حفظ ورقة التقييم في المكتبة!");
    },
    onError: (err) => {
      toast.error(`خطأ في الحفظ: ${err.message}`);
    },
  });

  // ── Mutation: توليد نسخة بديلة ───────────────────────────────────────────
  const variantBMutation = trpc.pedagogicalSheets.generateVariantB.useMutation({
    onSuccess: (data) => {
      setEvaluation(data.evaluation as Evaluation);
      setEditedEvaluation(data.evaluation as Evaluation);
      setIsSaved(false);
      setSavedId(null);
      toast.success("تم توليد النسخة البديلة (ب) بنجاح!");
    },
    onError: (err) => {
      toast.error(`خطأ في توليد النسخة البديلة: ${err.message}`);
    },
  });

  const handleSave = () => {
    const evalToSave = editMode ? editedEvaluation : evaluation;
    if (!evalToSave) return;
    const ev = evalToSave as Record<string, unknown>;
    saveEvalMutation.mutate({
      title: String(ev.evaluationTitle || `تقييم ${ev.subject || ""} — ${ev.level || ""}`.trim() || "ورقة تقييم"),
      subject: String(ev.subject || "") || undefined,
      level: String(ev.level || "") || undefined,
      trimester: String(ev.trimester || "") || undefined,
      evaluationType: String(ev.evaluationType || evaluationType) || undefined,
      schoolYear: schoolYear || undefined,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
      totalPoints: typeof ev.totalPoints === "number" ? ev.totalPoints : 20,
      variant: String(ev.variant || "A") || undefined,
      evaluationData: ev,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateVariantB = () => {
    const evalToUse = editMode ? editedEvaluation : evaluation;
    if (!evalToUse) return;
    variantBMutation.mutate({
      originalEvaluation: evalToUse as Record<string, unknown>,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
      schoolYear: schoolYear || undefined,
    });
  };

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
            <h1 className="text-lg font-bold text-gray-800">توليد ورقة التقييم — قالب SC2M223</h1>
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
              إعدادات ورقة التقييم (SC2M223)
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

              {/* عدد التعليمات */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">عدد التعليمات ({questionCount})</Label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>3</span><span>15</span>
                </div>
              </div>

              {/* السنة الدراسية */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">السنة الدراسية</Label>
                <Input
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  placeholder="2025-2026"
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">اسم المدرسة (اختياري)</Label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="مثال: المدرسة الابتدائية ..."
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">اسم المدرس/ة (اختياري)</Label>
                <Input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="مثال: أ. محمد ..."
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="includeAnswerKey"
                checked={includeAnswerKey}
                onCheckedChange={setIncludeAnswerKey}
              />
              <Label htmlFor="includeAnswerKey" className="text-sm text-gray-700 cursor-pointer">
                تضمين مفتاح الإجابة في ملف Word
              </Label>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !sheet}
              className="w-full bg-[#1E8449] hover:bg-[#196F3D] text-white font-bold py-3 text-base shadow-md"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جارٍ توليد ورقة التقييم...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 ml-2" />
                  توليد ورقة التقييم بالذكاء الاصطناعي
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

            {/* ورقة التقييم — محاكاة قالب SC2M223 */}
            <Card className="border-green-300 shadow-md overflow-hidden">
              {/* ترويسة مزدوجة SC2M223 */}
              <div className="bg-[#1E8449]">
                {/* الصف الأول: الجمهورية التونسية */}
                <div className="flex items-center justify-between px-6 py-2 border-b border-white/20">
                  <div className="text-white text-xs text-right">
                    <p className="font-bold">الجمهورية التونسية</p>
                    <p className="opacity-80">وزارة التربية</p>
                  </div>
                  <div className="text-white text-center text-xs opacity-70">
                    <p>Leader Academy</p>
                    <p>leaderacademy.school</p>
                  </div>
                  <div className="text-white text-xs text-left">
                    <p className="font-bold">{schoolName || "اسم المدرسة"}</p>
                    <p className="opacity-80">السنة الدراسية: {schoolYear}</p>
                  </div>
                </div>
                {/* الصف الثاني: عنوان الورقة */}
                <div className="px-6 py-3 text-center">
                  {editMode ? (
                    <Input
                      value={editedEvaluation?.evaluationTitle || ""}
                      onChange={(e) => setEditedEvaluation(prev => prev ? { ...prev, evaluationTitle: e.target.value } : prev)}
                      className="text-center font-bold text-lg bg-white/20 border-white/40 text-white placeholder:text-white/60"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-white">{displayEval.evaluationTitle || "ورقة تقييم"}</h2>
                  )}
                </div>
              </div>

              <CardContent className="pt-4 pb-4">
                {/* بيانات التلميذ — جدول SC2M223 */}
                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs w-1/4 border-l border-gray-200">الاسم واللقب</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">.....................................................</td>
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs w-1/4 border-l border-gray-200">الرقم</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">.............</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs border-l border-gray-200">المادة</td>
                        <td className="px-3 py-2 text-xs font-medium">{displayEval.subject || "—"}</td>
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs border-l border-gray-200">المستوى</td>
                        <td className="px-3 py-2 text-xs font-medium">{displayEval.level || "—"}</td>
                      </tr>
                      <tr>
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs border-l border-gray-200">الثلاثي</td>
                        <td className="px-3 py-2 text-xs font-medium">{displayEval.trimester || "—"}</td>
                        <td className="bg-[#1E8449]/10 px-3 py-2 font-bold text-[#1E8449] text-xs border-l border-gray-200">المدة</td>
                        <td className="px-3 py-2 text-xs font-medium">{displayEval.duration || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* الكفاية والهدف */}
                <div className="space-y-2 mb-5 p-3 bg-teal-50 rounded-lg border border-teal-100">
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

                {/* السندات والتعليمات — هيكل SC2M223 */}
                <div className="space-y-6">
                  {(displayEval.supports || []).map((sup, sIdx) => (
                    <div key={sIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* رأس السند */}
                      <div className="bg-[#1E8449] text-white px-4 py-2.5">
                        <span className="font-bold text-sm">
                          السند {sup.supportNumber}: {sup.supportTitle}
                        </span>
                      </div>

                      {/* نص السند */}
                      {sup.supportText && (
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 border-r-4 border-r-[#1E8449]">
                          <p className="text-sm text-gray-700 italic leading-relaxed">{sup.supportText}</p>
                        </div>
                      )}

                      {/* التعليمات */}
                      <div className="divide-y divide-gray-100">
                        {(sup.instructions || []).map((inst, iIdx) => (
                          <div key={iIdx} className="px-4 py-3">
                            {/* صف التعليمة مع مربع النقطة */}
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">
                                  <span className="text-[#1E8449] font-bold ml-1">تعليمة {inst.instructionNumber}:</span>
                                  {inst.instructionText}
                                </p>
                              </div>
                              {/* مربع النقطة والمعيار */}
                              <div className="shrink-0 border border-[#1E8449] rounded px-2 py-1 text-center min-w-[60px]">
                                {inst.criterionCode && (
                                  <p className="text-xs font-bold text-[#1E8449]">{inst.criterionCode}</p>
                                )}
                                <p className="text-xs font-bold text-gray-700">{inst.points} ن</p>
                              </div>
                            </div>

                            {/* عناصر الإجابة */}
                            {inst.tableHeaders && inst.tableHeaders.length > 0 ? (
                              <div className="overflow-x-auto mt-2">
                                <table className="w-full border border-gray-200 text-xs rounded">
                                  <thead>
                                    <tr>
                                      {inst.tableHeaders.map((h, hIdx) => (
                                        <th key={hIdx} className="bg-[#1E8449]/10 border border-gray-200 px-3 py-2 text-center font-bold text-[#1E8449]">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {inst.tableHeaders.map((_, hIdx) => (
                                        <td key={hIdx} className="border border-gray-200 px-3 py-3 text-center text-gray-300">
                                          .........
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : inst.items && inst.items.length > 0 ? (
                              <div className="mt-2 space-y-1 pr-4">
                                {inst.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="w-4 h-4 border border-gray-400 rounded-sm shrink-0 inline-block" />
                                    {item}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-2 space-y-1">
                                <div className="border-b border-dashed border-gray-300 h-6" />
                                <div className="border-b border-dashed border-gray-300 h-6" />
                              </div>
                            )}

                            {/* مفتاح الإجابة */}
                            {showAnswerKey && inst.answer && (
                              <div className="mt-2 flex items-start gap-1.5 bg-green-50 rounded px-2 py-1.5 border border-green-100">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-700">
                                  <span className="font-bold">الإجابة: </span>
                                  {inst.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* شبكة التصحيح SC2M223 */}
                {displayEval.scoringGrid && (displayEval.scoringGrid.criteria?.length ?? 0) > 0 && (
                  <>
                    <Separator className="my-5" />
                    <div className="border border-[#1E8449] rounded-lg overflow-hidden">
                      <div className="bg-[#1E8449] text-white px-4 py-2.5 flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />
                        <span className="font-bold text-sm">شبكة التصحيح</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="bg-[#1E8449]/10 border border-gray-200 px-3 py-2 text-right font-bold text-[#1E8449] w-1/3">
                                مستوى الأداء
                              </th>
                              {displayEval.scoringGrid.criteria.map((c, cIdx) => (
                                <th key={cIdx} className="bg-[#1E8449]/10 border border-gray-200 px-3 py-2 text-center font-bold text-[#1E8449]">
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(displayEval.scoringGrid.levels || []).map((lv, lIdx) => (
                              <tr key={lIdx} className={lIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                <td className="border border-gray-200 px-3 py-3">
                                  <p className="font-bold text-[#1E8449] text-sm">{lv.levelCode}</p>
                                  <p className="text-gray-600 text-xs mt-0.5">{lv.description}</p>
                                </td>
                                {displayEval.scoringGrid!.criteria.map((_, cIdx) => (
                                  <td key={cIdx} className="border border-gray-200 px-3 py-3 text-center">
                                    <span className="w-5 h-5 border-2 border-gray-400 rounded-sm inline-block" />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* أزرار الإجراءات النهائية */}
            <div className="flex flex-wrap gap-3 justify-center pt-2 print:hidden">
              {/* تحميل Word */}
              <Button
                onClick={handleExportWord}
                disabled={exportWordMutation.isPending}
                className="bg-[#1E8449] hover:bg-[#196F3D] text-white px-6 py-3 text-sm font-bold shadow-lg"
              >
                {exportWordMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Download className="w-4 h-4 ml-2" />}
                تحميل Word
              </Button>

              {/* طباعة A4 */}
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-50 px-6 py-3 text-sm font-bold"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة A4
              </Button>

              {/* توليد نسخة ب */}
              <Button
                onClick={handleGenerateVariantB}
                disabled={variantBMutation.isPending}
                variant="outline"
                className="border-purple-500 text-purple-700 hover:bg-purple-50 px-6 py-3 text-sm font-bold"
              >
                {variantBMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Copy className="w-4 h-4 ml-2" />}
                نسخة بديلة (ب)
              </Button>

              {/* حفظ في المكتبة */}
              <Button
                onClick={handleSave}
                disabled={saveEvalMutation.isPending || isSaved}
                variant="outline"
                className={isSaved ? "border-green-500 text-green-700 bg-green-50 px-6 py-3 text-sm font-bold" : "border-amber-500 text-amber-700 hover:bg-amber-50 px-6 py-3 text-sm font-bold"}
              >
                {saveEvalMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                {isSaved ? "تم الحفظ ✓" : "حفظ في المكتبة"}
              </Button>

              {/* توليد جديد */}
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="border-gray-400 text-gray-600 hover:bg-gray-50 px-5 py-3 text-sm"
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
