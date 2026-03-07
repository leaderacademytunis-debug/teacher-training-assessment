import { useState } from "react";
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
import { Loader2, FileText, Download, Wand2, ChevronRight, BookOpen, Target, Layers, CheckCircle2, Edit3, ClipboardCheck } from "lucide-react";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LessonSheet {
  lessonTitle?: string;
  subject?: string;
  level?: string;
  trimester?: string;
  period?: string;
  duration?: string;
  finalCompetency?: string;
  distinguishedObjective?: string;
  proceduralObjectives?: string[];
  materials?: string[];
  launchPhase?: {
    duration?: string;
    problemSituation?: string;
    teacherActivity?: string;
    learnerActivity?: string;
  };
  mainPhase?: {
    duration?: string;
    steps?: Array<{
      step: string;
      teacherActivity: string;
      learnerActivity: string;
    }>;
  };
  consolidationPhase?: {
    duration?: string;
    exercise?: string;
    exerciseType?: string;
  };
  conclusion?: string;
  summativeEvaluation?: string;
  [key: string]: unknown;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  { value: "اللغة العربية", label: "اللغة العربية" },
  { value: "الرياضيات", label: "الرياضيات" },
  { value: "الإيقاظ العلمي", label: "الإيقاظ العلمي" },
  { value: "اللغة الفرنسية", label: "اللغة الفرنسية" },
  { value: "التربية المدنية", label: "التربية المدنية" },
  { value: "التاريخ والجغرافيا", label: "التاريخ والجغرافيا" },
];

const GRADES = [
  { value: "الأولى ابتدائي", label: "السنة الأولى" },
  { value: "الثانية ابتدائي", label: "السنة الثانية" },
  { value: "الثالثة ابتدائي", label: "السنة الثالثة" },
  { value: "الرابعة ابتدائي", label: "السنة الرابعة" },
  { value: "الخامسة ابتدائي", label: "السنة الخامسة" },
  { value: "السادسة ابتدائي", label: "السنة السادسة" },
];

const TRIMESTERS = [
  { value: "الثلاثي الأول", label: "الثلاثي الأول" },
  { value: "الثلاثي الثاني", label: "الثلاثي الثاني" },
  { value: "الثلاثي الثالث", label: "الثلاثي الثالث" },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function LessonSheetFromPlan() {
  const [, navigate] = useLocation();

  // Étape 1: Paramètres d'entrée
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [trimester, setTrimester] = useState("");
  const [period, setPeriod] = useState("");
  const [objective, setObjective] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2025-2026");

  // Étape 2: Fiche générée
  const [sheet, setSheet] = useState<LessonSheet | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSheet, setEditedSheet] = useState<LessonSheet | null>(null);

  // ── Mutations tRPC ─────────────────────────────────────────────────────────
  const generateMutation = trpc.pedagogicalSheets.generateLessonSheetFromPlan.useMutation({
    onSuccess: (data: { success: boolean; sheet?: Record<string, unknown> }) => {
      if (data.success && data.sheet) {
        setSheet(data.sheet as LessonSheet);
        setEditedSheet(data.sheet as LessonSheet);
        toast.success("تم توليد الجذاذة بنجاح!");
      }
    },
    onError: (err: { message: string }) => {
      toast.error(`خطأ في التوليد: ${err.message}`);
    },
  });

  const exportWordMutation = trpc.pedagogicalSheets.exportLessonSheetToWord.useMutation({
    onSuccess: (data: { base64: string; filename: string }) => {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.base64}`;
      link.download = data.filename;
      link.click();
      toast.success("تم تحميل الجذاذة بصيغة Word!");
    },
    onError: (err: { message: string }) => {
      toast.error(`خطأ في التصدير: ${err.message}`);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!subject || !grade || !objective) {
      toast.error("يرجى تحديد المادة والمستوى والهدف المميز على الأقل");
      return;
    }
    generateMutation.mutate({
      subject,
      level: grade,
      trimester: trimester || "الثلاثي الأول",
      period: period || "الوحدة الأولى",
      activity: objective,
      competencyComponent: objective,
      distinguishedObjective: objective,
      content: objective,
    });
  };

  const handleExportWord = () => {
    const sheetToExport = editMode ? editedSheet : sheet;
    if (!sheetToExport) return;
    exportWordMutation.mutate({
      sheet: sheetToExport as Record<string, unknown>,
      schoolName,
      teacherName,
      schoolYear,
    });
  };

  const updateEditedField = (field: string, value: unknown) => {
    setEditedSheet(prev => prev ? { ...prev, [field]: value } : null);
  };

  const displaySheet = editMode ? editedSheet : sheet;

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] text-white py-6 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/teacher-tools")}
              className="text-blue-200 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              أدوات المدرس
            </button>
            <ChevronRight className="w-4 h-4 text-blue-300" />
            <span className="text-sm">توليد جذاذة من المخطط السنوي</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">توليد جذاذة تلقائية</h1>
              <p className="text-blue-200 text-sm">من المخطط السنوي إلى جذاذة كاملة في ثوانٍ — Leader Academy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* ── بطاقة المعطيات ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              أولاً — معطيات الجذاذة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* المادة */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">المادة *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="border-blue-200 focus:border-[#1B4F72]">
                  <SelectValue placeholder="اختر المادة..." />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* المستوى */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">المستوى *</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="border-blue-200 focus:border-[#1B4F72]">
                  <SelectValue placeholder="اختر السنة..." />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* الثلاثي */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">الثلاثي</Label>
              <Select value={trimester} onValueChange={setTrimester}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="الثلاثي الأول" />
                </SelectTrigger>
                <SelectContent>
                  {TRIMESTERS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* الفترة */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">الفترة / الوحدة</Label>
              <Input
                value={period}
                onChange={e => setPeriod(e.target.value)}
                placeholder="مثال: الوحدة الأولى"
                className="border-blue-200 focus:border-[#1B4F72]"
              />
            </div>

            {/* الهدف المميز */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[#1B4F72] font-semibold">الهدف المميز *</Label>
              <Textarea
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="مثال: يتعرف المتعلم على أنواع الجملة العربية ويوظفها في سياقات مختلفة"
                className="border-blue-200 focus:border-[#1B4F72] min-h-[80px]"
              />
            </div>

            {/* معلومات المدرسة */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">اسم المدرسة</Label>
              <Input
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="اختياري"
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">اسم المدرس/ة</Label>
              <Input
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="اختياري"
                className="border-blue-200"
              />
            </div>

            {/* زر التوليد */}
            <div className="md:col-span-2 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:from-[#E67E22] hover:to-[#D35400] text-white font-bold py-3 text-base shadow-md"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري توليد الجذاذة... (قد يستغرق 15-30 ثانية)
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 ml-2" />
                    ✨ توليد الجذاذة تلقائياً بالذكاء الاصطناعي
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── عرض الجذاذة المولّدة ────────────────────────────────────────── */}
        {displaySheet && (
          <div className="space-y-4">
            {/* شريط الأدوات */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">تم توليد الجذاذة بنجاح</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {displaySheet.subject} — {displaySheet.level}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className={editMode ? "border-orange-400 text-orange-600" : "border-blue-300 text-blue-600"}
                >
                  <Edit3 className="w-4 h-4 ml-1" />
                  {editMode ? "إيقاف التعديل" : "تعديل يدوي"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportWord}
                  disabled={exportWordMutation.isPending}
                  className="bg-[#1B4F72] hover:bg-[#154360] text-white"
                >
                  {exportWordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 ml-1" />
                  )}
                  تحميل Word • Leader Academy
                </Button>
              </div>
            </div>

            {/* ── المعطيات العامة ──────────────────────────────────────── */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1B4F72] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  أولاً — المعطيات العامة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["عنوان الدرس", "lessonTitle"],
                      ["المادة", "subject"],
                      ["المستوى", "level"],
                      ["الثلاثي", "trimester"],
                      ["الفترة / الوحدة", "period"],
                      ["المدة", "duration"],
                    ].map(([label, field], i) => (
                      <tr key={field} className={i % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                        <td className="py-2 px-4 font-semibold text-[#1B4F72] w-1/3 border-b border-blue-100">{label}</td>
                        <td className="py-2 px-4 border-b border-blue-100">
                          {editMode ? (
                            <Input
                              value={String(editedSheet?.[field] || "")}
                              onChange={e => updateEditedField(field, e.target.value)}
                              className="h-7 text-sm border-blue-200"
                            />
                          ) : (
                            String(displaySheet[field] || "—")
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* ── الكفاية والأهداف ─────────────────────────────────────── */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#2E86C1] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  ثانياً — الكفاية والأهداف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-[#1B4F72] mb-1">الكفاية الختامية:</p>
                  {editMode ? (
                    <Textarea
                      value={String(editedSheet?.finalCompetency || "")}
                      onChange={e => updateEditedField("finalCompetency", e.target.value)}
                      className="text-sm min-h-[60px] border-blue-200"
                    />
                  ) : (
                    <p className="text-sm">{String(displaySheet.finalCompetency || "—")}</p>
                  )}
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-[#F39C12] mb-1">الهدف المميز:</p>
                  {editMode ? (
                    <Textarea
                      value={String(editedSheet?.distinguishedObjective || "")}
                      onChange={e => updateEditedField("distinguishedObjective", e.target.value)}
                      className="text-sm min-h-[60px] border-amber-200"
                    />
                  ) : (
                    <p className="text-sm font-medium">{String(displaySheet.distinguishedObjective || "—")}</p>
                  )}
                </div>
                {displaySheet.proceduralObjectives && displaySheet.proceduralObjectives.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#1B4F72] mb-2">الأهداف الإجرائية:</p>
                    <ul className="space-y-1">
                      {(displaySheet.proceduralObjectives as string[]).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="bg-[#1B4F72] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {displaySheet.materials && (displaySheet.materials as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#1B4F72]">الوسائل:</span>
                    {(displaySheet.materials as string[]).map((m, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700">{m}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── مراحل الحصة ──────────────────────────────────────────── */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1B4F72] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ثالثاً — مراحل الحصة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* وضعية الانطلاق */}
                {displaySheet.launchPhase && (
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-100 px-4 py-2 font-semibold text-[#1B4F72] text-sm">
                      أ) وضعية الانطلاق ({(displaySheet.launchPhase as {duration?: string}).duration || "10 دقائق"})
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <div className="bg-amber-50 rounded p-2">
                        <span className="font-bold text-amber-700">وضعية المشكلة: </span>
                        {String((displaySheet.launchPhase as {problemSituation?: string}).problemSituation || "—")}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded p-2">
                          <span className="font-bold text-green-700 text-xs block mb-1">نشاط المعلم:</span>
                          {String((displaySheet.launchPhase as {teacherActivity?: string}).teacherActivity || "—")}
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                          <span className="font-bold text-purple-700 text-xs block mb-1">نشاط المتعلم:</span>
                          {String((displaySheet.launchPhase as {learnerActivity?: string}).learnerActivity || "—")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* النشاط الرئيسي */}
                {displaySheet.mainPhase && (
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-100 px-4 py-2 font-semibold text-[#1B4F72] text-sm">
                      ب) بناء التعلمات ({(displaySheet.mainPhase as {duration?: string}).duration || "25 دقائق"})
                    </div>
                    <div className="p-3">
                      {(displaySheet.mainPhase as {steps?: Array<{step: string; teacherActivity: string; learnerActivity: string}>}).steps && (
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#1B4F72] text-white">
                              <th className="p-2 text-right border border-blue-300 w-1/4">الخطوة</th>
                              <th className="p-2 text-right border border-blue-300 w-3/8">نشاط المعلم</th>
                              <th className="p-2 text-right border border-blue-300 w-3/8">نشاط المتعلم</th>
                            </tr>
                          </thead>
                          <tbody>
                            {((displaySheet.mainPhase as {steps?: Array<{step: string; teacherActivity: string; learnerActivity: string}>}).steps || []).map((step, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                <td className="p-2 border border-blue-200 font-medium">{step.step}</td>
                                <td className="p-2 border border-blue-200">{step.teacherActivity}</td>
                                <td className="p-2 border border-blue-200">{step.learnerActivity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* الاستثمار والتقييم */}
                {displaySheet.consolidationPhase && (
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-100 px-4 py-2 font-semibold text-green-800 text-sm">
                      ج) الاستثمار والتقييم ({(displaySheet.consolidationPhase as {duration?: string}).duration || "10 دقائق"})
                    </div>
                    <div className="p-3 text-sm">
                      <span className="font-bold text-green-700">التمرين ({(displaySheet.consolidationPhase as {exerciseType?: string}).exerciseType || "تقييمي"}): </span>
                      {String((displaySheet.consolidationPhase as {exercise?: string}).exercise || "—")}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── الاستنتاج والتقييم الختامي ──────────────────────────── */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1E8449] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  رابعاً — الاستنتاج والتقييم الختامي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-700 mb-1">الاستنتاج:</p>
                  {editMode ? (
                    <Textarea
                      value={String(editedSheet?.conclusion || "")}
                      onChange={e => updateEditedField("conclusion", e.target.value)}
                      className="text-sm min-h-[60px] border-green-200"
                    />
                  ) : (
                    <p className="text-sm">{String(displaySheet.conclusion || "—")}</p>
                  )}
                </div>
                <div className="bg-teal-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-teal-700 mb-1">التقييم الختامي (وضعية إدماجية):</p>
                  {editMode ? (
                    <Textarea
                      value={String(editedSheet?.summativeEvaluation || "")}
                      onChange={e => updateEditedField("summativeEvaluation", e.target.value)}
                      className="text-sm min-h-[60px] border-teal-200"
                    />
                  ) : (
                    <p className="text-sm">{String(displaySheet.summativeEvaluation || "—")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* زر التحميل النهائي */}
            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={handleExportWord}
                disabled={exportWordMutation.isPending}
                className="bg-[#1B4F72] hover:bg-[#154360] text-white px-8 py-3 text-base font-bold shadow-lg"
              >
                {exportWordMutation.isPending ? (
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 ml-2" />
                )}
                تحميل الجذاذة بصيغة Word • قالب Leader Academy
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="border-[#F39C12] text-[#F39C12] hover:bg-amber-50 px-6"
              >
                <Wand2 className="w-4 h-4 ml-2" />
                توليد جديد
              </Button>
              <Button
                onClick={() => {
                  const sheetData = editMode ? editedSheet : sheet;
                  if (sheetData) {
                    sessionStorage.setItem("evaluationSheet", JSON.stringify(sheetData));
                    navigate("/evaluation-from-sheet");
                  }
                }}
                className="bg-[#1E8449] hover:bg-[#196F3D] text-white px-6 font-bold shadow-md"
              >
                <ClipboardCheck className="w-5 h-5 ml-2" />
                ✨ توليد ورقة التقييم
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
