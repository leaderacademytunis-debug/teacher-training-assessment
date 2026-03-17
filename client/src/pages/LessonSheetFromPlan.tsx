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
import { Loader2, FileText, Download, Wand2, ChevronRight, BookOpen, Target, Layers, CheckCircle2, Edit3, ClipboardCheck, GraduationCap, Stethoscope, Award } from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";

const LESSON_GRADIENT = "linear-gradient(135deg, #1B4F72, #2E86C1)";
import BackButton from "@/components/BackButton";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LessonSheet {
  lessonTitle?: string;
  subject?: string;
  level?: string;
  degree?: string;
  trimester?: string;
  period?: string;
  duration?: string;
  domainCompetency?: string;
  finalCompetency?: string;
  competencyComponent?: string;
  distinguishedObjective?: string;
  sessionObjective?: string;
  proceduralObjectives?: string[];
  materials?: string[];
  launchPhase?: {
    duration?: string;
    phaseName?: string;
    problemSituation?: string;
    teacherActivity?: string;
    learnerActivity?: string;
    tools?: string;
  };
  mainPhase?: {
    duration?: string;
    phaseName?: string;
    steps?: Array<{
      step: string;
      teacherActivity: string;
      learnerActivity: string;
      tools?: string;
    }>;
  };
  applicationPhase?: {
    duration?: string;
    phaseName?: string;
    exercise?: string;
    exerciseType?: string;
    teacherActivity?: string;
    learnerActivity?: string;
  };
  integrationPhase?: {
    duration?: string;
    phaseName?: string;
    sened?: string;
    talima?: string;
    targetCompetency?: string;
    expectedPerformance?: string;
  };
  // Legacy field for backward compatibility
  consolidationPhase?: {
    duration?: string;
    exercise?: string;
    exerciseType?: string;
  };
  remediation?: {
    difficulties?: string;
    minimalCriteria?: string;
    remediationActivities?: string;
    enrichmentActivities?: string;
  };
  conclusion?: string;
  assessmentCriteria?: {
    m1?: string;
    m2?: string;
    m3?: string;
    m4?: string;
    m5?: string;
  };
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
  { value: "التربية الإسلامية", label: "التربية الإسلامية" },
  { value: "التربية التشكيلية", label: "التربية التشكيلية" },
  { value: "التربية الموسيقية", label: "التربية الموسيقية" },
  { value: "التربية البدنية", label: "التربية البدنية" },
];

const GRADES = [
  { value: "الأولى ابتدائي", label: "السنة الأولى" },
  { value: "الثانية ابتدائي", label: "السنة الثانية" },
  { value: "الثالثة ابتدائي", label: "السنة الثالثة" },
  { value: "الرابعة ابتدائي", label: "السنة الرابعة" },
  { value: "الخامسة ابتدائي", label: "السنة الخامسة" },
  { value: "السادسة ابتدائي", label: "السنة السادسة" },
];

const DEGREES = [
  { value: "الدرجة الأولى", label: "الدرجة الأولى (سنة 1 + 2)" },
  { value: "الدرجة الثانية", label: "الدرجة الثانية (سنة 3 + 4)" },
  { value: "الدرجة الثالثة", label: "الدرجة الثالثة (سنة 5 + 6)" },
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
  const [degree, setDegree] = useState("");
  const [trimester, setTrimester] = useState("");
  const [period, setPeriod] = useState("");
  const [activity, setActivity] = useState("");
  const [competencyComponent, setCompetencyComponent] = useState("");
  const [objective, setObjective] = useState("");
  const [content, setContent] = useState("");
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
      activity: activity || objective,
      competencyComponent: competencyComponent || objective,
      distinguishedObjective: objective,
      content: content || objective,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
      schoolYear: schoolYear || undefined,
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
      <ToolPageHeader
        icon={BookOpen}
        nameAr="محرك بناء الجذاذات التربوية"
        descAr="Leader Lesson Architect — المقاربة بالكفايات المعتمدة في تونس"
        gradient={LESSON_GRADIENT}
        backTo="/teacher-tools"
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* ── بطاقة المعطيات ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              معطيات الجذاذة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* الصف الأول: المادة + المستوى + الدرجة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">الدرجة</Label>
                <Select value={degree} onValueChange={setDegree}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="اختر الدرجة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* الصف الثاني: الثلاثي + الفترة + النشاط */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">الفترة / الوحدة</Label>
                <Input
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  placeholder="مثال: الوحدة الأولى"
                  className="border-blue-200 focus:border-[#1B4F72]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">النشاط</Label>
                <Input
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  placeholder="مثال: حساب / هندسة / فيزياء"
                  className="border-blue-200 focus:border-[#1B4F72]"
                />
              </div>
            </div>

            {/* مكوّن الكفاية */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">مكوّن الكفاية</Label>
              <Input
                value={competencyComponent}
                onChange={e => setCompetencyComponent(e.target.value)}
                placeholder="مثال: حل وضعيات مشكل دالة بتوظيف العمليات على الأعداد"
                className="border-blue-200 focus:border-[#1B4F72]"
              />
            </div>

            {/* الهدف المميز + المحتوى */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">الهدف المميز *</Label>
                <Textarea
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="مثال: يتعرف المتعلم على أنواع العظام ويصنّفها"
                  className="border-blue-200 focus:border-[#1B4F72] min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">المحتوى / عنوان الدرس</Label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="مثال: الجهاز التنفسي عند الإنسان"
                  className="border-blue-200 focus:border-[#1B4F72] min-h-[80px]"
                />
              </div>
            </div>

            {/* معلومات المدرسة */}
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">اسم المدرسة</Label>
                <Input
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="المدرسة الابتدائية..."
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">المعلم/ة</Label>
                <Input
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="الاسم واللقب"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">السنة الدراسية</Label>
                <Input
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  className="border-blue-200"
                />
              </div>
            </div>

            {/* زر التوليد */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:from-[#E67E22] hover:to-[#D35400] text-white px-10 py-3 text-lg font-bold shadow-lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 ml-2" />
                    توليد الجذاذة
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ── عرض الجذاذة المولّدة ────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
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
                  تحميل Word
                </Button>
              </div>
            </div>

            {/* ═══ القسم 1: الترويسة الإدارية ═══ */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1B4F72] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  القسم 1 — الترويسة الإدارية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["عنوان الدرس", "lessonTitle"],
                      ["المادة", "subject"],
                      ["المستوى", "level"],
                      ["الدرجة", "degree"],
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

            {/* ═══ القسم 2: المرجعية البيداغوجية ═══ */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#2E86C1] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  القسم 2 — المرجعية البيداغوجية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* كفاية المجال */}
                <div className="bg-indigo-50 rounded-lg p-3 border-r-4 border-indigo-500">
                  <p className="text-xs font-bold text-indigo-700 mb-1">كفاية المجال:</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.domainCompetency || "")} onChange={e => updateEditedField("domainCompetency", e.target.value)} className="text-sm min-h-[50px] border-indigo-200" />
                  ) : (
                    <p className="text-sm font-medium">{String(displaySheet.domainCompetency || "—")}</p>
                  )}
                </div>
                {/* الكفاية النهائية للمادة */}
                <div className="bg-blue-50 rounded-lg p-3 border-r-4 border-blue-500">
                  <p className="text-xs font-bold text-[#1B4F72] mb-1">الكفاية النهائية للمادة:</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.finalCompetency || "")} onChange={e => updateEditedField("finalCompetency", e.target.value)} className="text-sm min-h-[50px] border-blue-200" />
                  ) : (
                    <p className="text-sm">{String(displaySheet.finalCompetency || "—")}</p>
                  )}
                </div>
                {/* مكوّن الكفاية */}
                <div className="bg-cyan-50 rounded-lg p-3 border-r-4 border-cyan-500">
                  <p className="text-xs font-bold text-cyan-700 mb-1">مكوّن الكفاية:</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.competencyComponent || "")} onChange={e => updateEditedField("competencyComponent", e.target.value)} className="text-sm min-h-[50px] border-cyan-200" />
                  ) : (
                    <p className="text-sm">{String(displaySheet.competencyComponent || "—")}</p>
                  )}
                </div>
                {/* الهدف المميز */}
                <div className="bg-amber-50 rounded-lg p-3 border-r-4 border-amber-500">
                  <p className="text-xs font-bold text-[#F39C12] mb-1">الهدف المميّز:</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.distinguishedObjective || "")} onChange={e => updateEditedField("distinguishedObjective", e.target.value)} className="text-sm min-h-[50px] border-amber-200" />
                  ) : (
                    <p className="text-sm font-medium">{String(displaySheet.distinguishedObjective || "—")}</p>
                  )}
                </div>
                {/* هدف الحصّة */}
                <div className="bg-orange-50 rounded-lg p-3 border-r-4 border-orange-500">
                  <p className="text-xs font-bold text-orange-700 mb-1">هدف الحصّة (إجرائي):</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.sessionObjective || "")} onChange={e => updateEditedField("sessionObjective", e.target.value)} className="text-sm min-h-[50px] border-orange-200" />
                  ) : (
                    <p className="text-sm font-medium">{String(displaySheet.sessionObjective || "—")}</p>
                  )}
                </div>
                {/* الأهداف الإجرائية */}
                {displaySheet.proceduralObjectives && displaySheet.proceduralObjectives.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
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
                {/* الوسائل */}
                {displaySheet.materials && (displaySheet.materials as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-[#1B4F72]">الوسائل والأدوات:</span>
                    {(displaySheet.materials as string[]).map((m, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700">{m}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══ القسم 3: التمشي البيداغوجي (4 مراحل) ═══ */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1B4F72] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  القسم 3 — التمشي البيداغوجي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* أ) مرحلة الاستكشاف */}
                {displaySheet.launchPhase && (
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-100 px-4 py-2 font-semibold text-[#1B4F72] text-sm flex items-center justify-between">
                      <span>أ) مرحلة الاستكشاف (Exploration)</span>
                      <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-xs">{(displaySheet.launchPhase as {duration?: string}).duration || "10 دقائق"}</Badge>
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <div className="bg-amber-50 rounded p-2 border-r-3 border-amber-400">
                        <span className="font-bold text-amber-700">وضعية المشكلة: </span>
                        {String((displaySheet.launchPhase as {problemSituation?: string}).problemSituation || "—")}
                      </div>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1B4F72] text-white">
                            <th className="p-2 text-right border border-blue-300 w-1/3">دور المعلم</th>
                            <th className="p-2 text-right border border-blue-300 w-1/3">نشاط المتعلم</th>
                            <th className="p-2 text-right border border-blue-300 w-1/3">الوسائل</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="p-2 border border-blue-200">{String((displaySheet.launchPhase as {teacherActivity?: string}).teacherActivity || "—")}</td>
                            <td className="p-2 border border-blue-200">{String((displaySheet.launchPhase as {learnerActivity?: string}).learnerActivity || "—")}</td>
                            <td className="p-2 border border-blue-200">{String((displaySheet.launchPhase as {tools?: string}).tools || "—")}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ب) مرحلة البناء */}
                {displaySheet.mainPhase && (
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-100 px-4 py-2 font-semibold text-green-800 text-sm flex items-center justify-between">
                      <span>ب) مرحلة البناء (Construction)</span>
                      <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">{(displaySheet.mainPhase as {duration?: string}).duration || "25 دقيقة"}</Badge>
                    </div>
                    <div className="p-3">
                      {(displaySheet.mainPhase as {steps?: Array<{step: string; teacherActivity: string; learnerActivity: string; tools?: string}>}).steps && (
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#1B4F72] text-white">
                              <th className="p-2 text-right border border-blue-300 w-1/5">الخطوة</th>
                              <th className="p-2 text-right border border-blue-300 w-3/10">دور المعلم</th>
                              <th className="p-2 text-right border border-blue-300 w-3/10">نشاط المتعلم</th>
                              <th className="p-2 text-right border border-blue-300 w-1/5">الوسائل</th>
                            </tr>
                          </thead>
                          <tbody>
                            {((displaySheet.mainPhase as {steps?: Array<{step: string; teacherActivity: string; learnerActivity: string; tools?: string}>}).steps || []).map((step, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-green-50" : "bg-white"}>
                                <td className="p-2 border border-green-200 font-medium">{step.step}</td>
                                <td className="p-2 border border-green-200">{step.teacherActivity}</td>
                                <td className="p-2 border border-green-200">{step.learnerActivity}</td>
                                <td className="p-2 border border-green-200">{step.tools || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* ج) مرحلة التطبيق */}
                {(displaySheet.applicationPhase || displaySheet.consolidationPhase) && (
                  <div className="border border-purple-200 rounded-lg overflow-hidden">
                    <div className="bg-purple-100 px-4 py-2 font-semibold text-purple-800 text-sm flex items-center justify-between">
                      <span>ج) مرحلة التطبيق (Application)</span>
                      <Badge variant="secondary" className="bg-purple-200 text-purple-800 text-xs">
                        {(displaySheet.applicationPhase as {duration?: string})?.duration || (displaySheet.consolidationPhase as {duration?: string})?.duration || "10 دقائق"}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      {displaySheet.applicationPhase ? (
                        <>
                          <div className="bg-purple-50 rounded p-2">
                            <span className="font-bold text-purple-700">التمرين ({(displaySheet.applicationPhase as {exerciseType?: string}).exerciseType || "تطبيقي"}): </span>
                            {String((displaySheet.applicationPhase as {exercise?: string}).exercise || "—")}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 rounded p-2">
                              <span className="font-bold text-green-700 text-xs block mb-1">دور المعلم:</span>
                              {String((displaySheet.applicationPhase as {teacherActivity?: string}).teacherActivity || "—")}
                            </div>
                            <div className="bg-blue-50 rounded p-2">
                              <span className="font-bold text-blue-700 text-xs block mb-1">نشاط المتعلم:</span>
                              {String((displaySheet.applicationPhase as {learnerActivity?: string}).learnerActivity || "—")}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-purple-50 rounded p-2">
                          <span className="font-bold text-purple-700">التمرين ({(displaySheet.consolidationPhase as {exerciseType?: string})?.exerciseType || "تقييمي"}): </span>
                          {String((displaySheet.consolidationPhase as {exercise?: string})?.exercise || "—")}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* د) مرحلة الإدماج والتقييم */}
                {displaySheet.integrationPhase && (
                  <div className="border border-teal-200 rounded-lg overflow-hidden">
                    <div className="bg-teal-100 px-4 py-2 font-semibold text-teal-800 text-sm flex items-center justify-between">
                      <span>د) مرحلة الإدماج والتقييم (Integration)</span>
                      <Badge variant="secondary" className="bg-teal-200 text-teal-800 text-xs">{(displaySheet.integrationPhase as {duration?: string}).duration || "5 دقائق"}</Badge>
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <div className="bg-amber-50 rounded p-2 border-r-3 border-amber-400">
                        <span className="font-bold text-amber-700">السند: </span>
                        {String((displaySheet.integrationPhase as {sened?: string}).sened || "—")}
                      </div>
                      <div className="bg-blue-50 rounded p-2 border-r-3 border-blue-400">
                        <span className="font-bold text-blue-700">التعليمة: </span>
                        {String((displaySheet.integrationPhase as {talima?: string}).talima || "—")}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded p-2">
                          <span className="font-bold text-green-700 text-xs block mb-1">الكفاية المستهدفة:</span>
                          {String((displaySheet.integrationPhase as {targetCompetency?: string}).targetCompetency || "—")}
                        </div>
                        <div className="bg-indigo-50 rounded p-2">
                          <span className="font-bold text-indigo-700 text-xs block mb-1">الأداء المنتظر:</span>
                          {String((displaySheet.integrationPhase as {expectedPerformance?: string}).expectedPerformance || "—")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══ القسم 4: الدعم والعلاج ═══ */}
            {displaySheet.remediation && (
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-[#E74C3C] text-white py-3 px-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    القسم 4 — الدعم والعلاج (Remediation)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="bg-red-50 rounded-lg p-3 border-r-4 border-red-400">
                    <p className="text-xs font-bold text-red-700 mb-1">الصعوبات المتوقعة:</p>
                    <p className="text-sm">{String((displaySheet.remediation as {difficulties?: string}).difficulties || "—")}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border-r-4 border-orange-400">
                    <p className="text-xs font-bold text-orange-700 mb-1">معايير الحد الأدنى:</p>
                    <p className="text-sm">{String((displaySheet.remediation as {minimalCriteria?: string}).minimalCriteria || "—")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-3 border-r-4 border-yellow-400">
                      <p className="text-xs font-bold text-yellow-700 mb-1">أنشطة العلاج:</p>
                      <p className="text-sm">{String((displaySheet.remediation as {remediationActivities?: string}).remediationActivities || "—")}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border-r-4 border-green-400">
                      <p className="text-xs font-bold text-green-700 mb-1">أنشطة إثرائية للمتفوقين:</p>
                      <p className="text-sm">{String((displaySheet.remediation as {enrichmentActivities?: string}).enrichmentActivities || "—")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ═══ القسم 5: الاستنتاج والقاعدة ═══ */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-[#1E8449] text-white py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  القسم 5 — الاستنتاج والقاعدة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="bg-green-50 rounded-lg p-3 border-r-4 border-green-500">
                  <p className="text-xs font-bold text-green-700 mb-1">الاستنتاج / القاعدة:</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.conclusion || "")} onChange={e => updateEditedField("conclusion", e.target.value)} className="text-sm min-h-[60px] border-green-200" />
                  ) : (
                    <p className="text-sm">{String(displaySheet.conclusion || "—")}</p>
                  )}
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border-r-4 border-teal-500">
                  <p className="text-xs font-bold text-teal-700 mb-1">التقييم الختامي (وضعية إدماجية):</p>
                  {editMode ? (
                    <Textarea value={String(editedSheet?.summativeEvaluation || "")} onChange={e => updateEditedField("summativeEvaluation", e.target.value)} className="text-sm min-h-[60px] border-teal-200" />
                  ) : (
                    <p className="text-sm">{String(displaySheet.summativeEvaluation || "—")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ═══ القسم 6: معايير التقييم ═══ */}
            {displaySheet.assessmentCriteria && (
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-[#8E44AD] text-white py-3 px-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    القسم 6 — معايير التقييم
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="py-2 px-4 text-right text-purple-800 border-b border-purple-200 w-1/6">المعيار</th>
                        <th className="py-2 px-4 text-right text-purple-800 border-b border-purple-200">الوصف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["مع1", (displaySheet.assessmentCriteria as {m1?: string}).m1],
                        ["مع2", (displaySheet.assessmentCriteria as {m2?: string}).m2],
                        ["مع3", (displaySheet.assessmentCriteria as {m3?: string}).m3],
                        ["مع4", (displaySheet.assessmentCriteria as {m4?: string}).m4],
                        ["مع5", (displaySheet.assessmentCriteria as {m5?: string}).m5],
                      ].filter(([, v]) => v).map(([label, value], i) => (
                        <tr key={label} className={i % 2 === 0 ? "bg-purple-50" : "bg-white"}>
                          <td className="py-2 px-4 font-bold text-purple-700 border-b border-purple-100">{label}</td>
                          <td className="py-2 px-4 border-b border-purple-100">{String(value || "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {/* أزرار التحميل النهائية */}
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
                تحميل الجذاذة بصيغة Word
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
                توليد ورقة التقييم
              </Button>
            </div>

            <Separator />
            <p className="text-center text-xs text-gray-400">
              الجمهورية التونسية — Leader Academy — leaderacademy.school
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
