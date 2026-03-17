
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Edit2, Check, X, FileText, BookOpen, ClipboardCheck, Trash2, Plus, Loader2 } from "lucide-react";
import UnifiedToolLayout, { type ToolConfig } from "@/components/UnifiedToolLayout";

// ─── Tool Config ──────────────────────────────────────────────────────────────

const TOOL_CONFIG: ToolConfig = {
  id: "annual-plan-generator",
  icon: BookOpen,
  nameAr: "توليد المخطط السنوي التلقائي",
  nameFr: "Générateur de Plan Annuel",
  nameEn: "Annual Plan Generator",
  descAr: "إنشاء مخططات سنوية مفصلة للمواد والمستويات التعليمية المختلفة وفقًا للمنهج التونسي.",
  descFr: "Générez des plans annuels détaillés pour diverses matières et niveaux scolaires selon le programme tunisien.",
  descEn: "Generate detailed annual plans for various subjects and grade levels according to the Tunisian curriculum.",
  accentColor: "#1B4F72",
  gradient: "linear-gradient(135deg, #1B4F72, #2E86C1)",
  loaderMessages: [
    "جاري تحليل المنهج الرسمي للمادة المختارة...",
    "تحديد الكفايات ومكوناتها الأساسية...",
    "توزيع الوحدات التعليمية على الثلاثيات...",
    "صياغة الأهداف المميزة لكل درس...",
    "تحديد المحتويات المعرفية والمهارية...",
    "تقدير عدد الحصص اللازمة لكل نشاط...",
    "مراجعة تسلسل وتوازن المخطط...",
    "المخطط السنوي جاهز تقريباً...",
  ],
};

// ─── Types & Constants ──────────────────────────────────────────────────────────

interface PlanRow {
  trimester: string;
  unit: string;
  activity: string;
  competencyComponent: string;
  distinguishedObjective: string;
  content: string;
  sessions: number;
}

const SUBJECTS = [
  "اللغة العربية",
  "الرياضيات",
  "الإيقاظ العلمي",
  "التربية المدنية",
  "التاريخ والجغرافيا",
  "التربية الإسلامية",
  "اللغة الفرنسية",
];

const GRADES = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"];

const TRIMESTER_COLORS: Record<string, string> = {
  "الأول": "bg-blue-100 text-blue-800",
  "الثاني": "bg-green-100 text-green-800",
  "الثالث": "bg-purple-100 text-purple-800",
};

const ACTIVITY_COLORS: Record<string, string> = {
  "تواصل شفوي": "bg-orange-100 text-orange-800",
  "قراءة": "bg-teal-100 text-teal-800",
  "قواعد لغة": "bg-indigo-100 text-indigo-800",
  "إنتاج كتابي": "bg-pink-100 text-pink-800",
  "أعداد وحساب": "bg-yellow-100 text-yellow-800",
  "هندسة": "bg-cyan-100 text-cyan-800",
  "قياس": "bg-lime-100 text-lime-800",
  "علوم الحياة": "bg-emerald-100 text-emerald-800",
  "علوم المادة": "bg-violet-100 text-violet-800",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnnualPlanGenerator() {
  const [, navigate] = useLocation();
  const [subject, setSubject] = useState("اللغة العربية");
  const [grade, setGrade] = useState("السادسة");
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; field: keyof PlanRow } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Dialog state for evaluation generation
  const [evalDialogOpen, setEvalDialogOpen] = useState(false);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);
  const [evalType, setEvalType] = useState<"formative" | "summative" | "diagnostic">("formative");
  const [questionCount, setQuestionCount] = useState(8);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isGeneratingEval, setIsGeneratingEval] = useState(false);

  const generateMutation = trpc.pedagogicalSheets.generateAnnualPlan.useMutation({
    onSuccess: (data: { rows: PlanRow[]; subject: string; grade: string; schoolYear: string }) => {
      if (data.rows && Array.isArray(data.rows)) {
        setRows(data.rows);
        toast.success(`تم التوليد بنجاح! تم توليد ${data.rows.length} صفاً في المخطط السنوي`);
      }
    },
    onError: (err: { message: string }) => {
      toast.error(`خطأ في التوليد: ${err.message}`);
    },
  });

  const exportMutation = trpc.pedagogicalSheets.exportAnnualPlanToWord.useMutation({
    onSuccess: (data: { base64: string; filename: string }) => {
      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم التصدير بنجاح! جاري تحميل ملف Word...");
    },
    onError: (err: { message: string }) => {
      toast.error(`خطأ في التصدير: ${err.message}`);
    },
  });

  const generateEvalMutation = trpc.pedagogicalSheets.generateEvaluationFromPlanRow.useMutation({
    onSuccess: (data) => {
      setIsGeneratingEval(false);
      setEvalDialogOpen(false);
      toast.success("تم توليد ورقة التقييم بنجاح!");
      const evalData = encodeURIComponent(JSON.stringify(data.evaluation));
      navigate(`/evaluation-from-sheet?data=${evalData}&includeAnswerKey=${includeAnswerKey}`);
    },
    onError: (err: { message: string }) => {
      setIsGeneratingEval(false);
      toast.error(`خطأ في توليد التقييم: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ subject, grade, schoolYear });
  };

  const handleExportWord = () => {
    if (rows.length === 0) {
      toast.error("لا يوجد مخطط — يرجى توليد المخطط أولاً");
      return;
    }
    exportMutation.mutate({ subject, grade, schoolYear, rows });
  };

  const openEvalDialog = (rowIdx: number) => {
    setSelectedRowIdx(rowIdx);
    setEvalDialogOpen(true);
  };

  const handleGenerateEvaluation = () => {
    if (selectedRowIdx === null) return;
    const row = rows[selectedRowIdx];
    setIsGeneratingEval(true);
    generateEvalMutation.mutate({
      subject,
      grade,
      schoolYear,
      trimester: row.trimester,
      unit: row.unit,
      activity: row.activity,
      competencyComponent: row.competencyComponent,
      distinguishedObjective: row.distinguishedObjective,
      content: row.content,
      sessions: row.sessions,
      evaluationType: evalType,
      questionCount,
      includeAnswerKey,
      schoolName: schoolName || undefined,
      teacherName: teacherName || undefined,
    });
  };

  const startEdit = (rowIdx: number, field: keyof PlanRow) => {
    setEditingCell({ rowIdx, field });
    setEditValue(String(rows[rowIdx][field]));
  };

  const confirmEdit = () => {
    if (!editingCell) return;
    const { rowIdx, field } = editingCell;
    const newRows = [...rows];
    if (field === "sessions") {
      newRows[rowIdx] = { ...newRows[rowIdx], [field]: Number(editValue) || 0 };
    } else {
      newRows[rowIdx] = { ...newRows[rowIdx], [field]: editValue };
    }
    setRows(newRows);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows([...rows, {
      trimester: lastRow?.trimester || "الأول",
      unit: lastRow?.unit || "الوحدة 1",
      activity: "قراءة",
      competencyComponent: "",
      distinguishedObjective: "",
      content: "",
      sessions: 2,
    }]);
  };

  const deleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const totalSessions = rows.reduce((sum, r) => sum + (r.sessions || 0), 0);

  const trimesterSummary = rows.reduce((acc, row) => {
    acc[row.trimester] = (acc[row.trimester] || 0) + row.sessions;
    return acc;
  }, {} as Record<string, number>);

  const renderCell = (row: PlanRow, rowIdx: number, field: keyof PlanRow) => {
    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.field === field;
    const value = String(row[field]);

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[80px]">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
            className="h-7 text-xs px-1 text-right"
            autoFocus
          />
          <button onClick={confirmEdit} className="text-green-600 hover:text-green-800"><Check className="w-3 h-3" /></button>
          <button onClick={cancelEdit} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
        </div>
      );
    }

    if (field === "activity") {
      const colorClass = ACTIVITY_COLORS[value] || "bg-gray-100 text-gray-700";
      return (
        <div className="flex items-center gap-1 cursor-pointer group" onClick={() => startEdit(rowIdx, field)}>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{value}</span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer group flex items-start gap-1 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
        onClick={() => startEdit(rowIdx, field)}
      >
        <span className="text-xs text-right flex-1 leading-relaxed">{value}</span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0 mt-0.5" />
      </div>
    );
  };

  const selectedRow = selectedRowIdx !== null ? rows[selectedRowIdx] : null;

  const inputPanel = (
    <div className="space-y-4">
      <Card className="shadow-md border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B4F72]">إعدادات المخطط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-right">
          <div>
            <Label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-600">المادة</Label>
            <Select value={subject} onValueChange={setSubject} dir="rtl">
              <SelectTrigger id="subject">
                <SelectValue placeholder="اختر المادة..." />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="grade" className="mb-1.5 block text-sm font-medium text-gray-600">المستوى</Label>
            <Select value={grade} onValueChange={setGrade} dir="rtl">
              <SelectTrigger id="grade">
                <SelectValue placeholder="اختر المستوى..." />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map(g => <SelectItem key={g} value={g}>{`السنة ${g}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="schoolYear" className="mb-1.5 block text-sm font-medium text-gray-600">السنة الدراسية</Label>
            <Input id="schoolYear" value={schoolYear} onChange={e => setSchoolYear(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className="shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B4F72]">ملخص الحصص</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="flex justify-between items-center mb-2 text-sm font-bold">
              <span>المجموع العام:</span>
              <span>{totalSessions} حصة</span>
            </div>
            <div className="space-y-1 text-xs">
              {Object.entries(trimesterSummary).map(([tri, count]) => (
                <div key={tri} className="flex justify-between items-center text-gray-600">
                  <span>الثلاثي {tri}:</span>
                  <span>{count} حصة</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md border-0 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B4F72]">التعليمات</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2 text-right">
          <p>1. اختر المادة والمستوى الدراسي.</p>
          <p>2. اضغط على زر "توليد المخطط" لإنشاء نسخة أولية.</p>
          <p>3. يمكنك تعديل أي خانة بالضغط عليها مباشرة.</p>
          <p>4. يمكنك توليد تقييم تكويني أو إشهادي لأي درس.</p>
          <p>5. عند الانتهاء، يمكنك تصدير المخطط كملف Word.</p>
        </CardContent>
      </Card>
    </div>
  );

  const customResultRenderer = rows.length > 0 ? (
    <div className="bg-white rounded-2xl shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">المخطط السنوي لمادة {subject} - السنة {grade}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={addRow} size="sm" variant="outline" className="gap-1.5"><Plus className="w-4 h-4" />إضافة صف</Button>
          <Button onClick={handleExportWord} size="sm" variant="default" className="bg-[#2E86C1] hover:bg-[#1B4F72] gap-1.5">
            <Download className="w-4 h-4" />
            تصدير Word
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3">الثلاثي</th>
              <th className="p-3">الوحدة</th>
              <th className="p-3">النشاط</th>
              <th className="p-3">مكون الكفاية</th>
              <th className="p-3">الهدف المميز</th>
              <th className="p-3">المحتوى</th>
              <th className="p-3">الحصص</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                <td className="p-2 align-top"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TRIMESTER_COLORS[row.trimester] || "bg-gray-100"}`}>{`الثلاثي ${row.trimester}`}</span></td>
                <td className="p-2 align-top min-w-[120px]">{renderCell(row, rowIdx, "unit")}</td>
                <td className="p-2 align-top min-w-[120px]">{renderCell(row, rowIdx, "activity")}</td>
                <td className="p-2 align-top min-w-[200px]">{renderCell(row, rowIdx, "competencyComponent")}</td>
                <td className="p-2 align-top min-w-[200px]">{renderCell(row, rowIdx, "distinguishedObjective")}</td>
                <td className="p-2 align-top min-w-[250px]">{renderCell(row, rowIdx, "content")}</td>
                <td className="p-2 align-top min-w-[80px]">{renderCell(row, rowIdx, "sessions")}</td>
                <td className="p-2 align-top"><div className="flex items-center gap-1.5"><Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEvalDialog(rowIdx)}><ClipboardCheck className="w-3 h-3" />تقييم</Button><Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-100 hover:text-red-600" onClick={() => deleteRow(rowIdx)}><Trash2 className="w-4 h-4" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : undefined;

  return (
    <>
      <UnifiedToolLayout
        config={TOOL_CONFIG}
        inputPanel={inputPanel}
        resultContent={rows.length > 0 ? "results" : null} // Dummy content to trigger result view
        isGenerating={generateMutation.isPending}
        onRegenerate={handleGenerate}
        customResultRenderer={customResultRenderer}
        onDownloadWord={rows.length > 0 ? handleExportWord : undefined}
      />

      {/* Evaluation Generation Dialog */}
      <Dialog open={evalDialogOpen} onOpenChange={setEvalDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>توليد تقييم من درس</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="py-4 space-y-4 text-right">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                <strong>الدرس المستهدف:</strong> {selectedRow.content} ({selectedRow.activity})
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eval-type">نوع التقييم</Label>
                  <Select value={evalType} onValueChange={(v) => setEvalType(v as any)} dir="rtl">
                    <SelectTrigger id="eval-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">تكويني</SelectItem>
                      <SelectItem value="summative">إشهادي</SelectItem>
                      <SelectItem value="diagnostic">تشخيصي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="q-count">عدد الأسئلة</Label>
                  <Input id="q-count" type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <Label htmlFor="teacher-name">اسم المدرس (اختياري)</Label>
                <Input id="teacher-name" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="مثال: الأستاذ علي سعدالله" />
              </div>
              <div>
                <Label htmlFor="school-name">اسم المدرسة (اختياري)</Label>
                <Input id="school-name" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="مثال: مدرسة النجاح الابتدائية" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="include-key" checked={includeAnswerKey} onChange={e => setIncludeAnswerKey(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <Label htmlFor="include-key" className="mb-0">تضمين الإصلاح</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvalDialogOpen(false)} disabled={isGeneratingEval}>إلغاء</Button>
            <Button onClick={handleGenerateEvaluation} disabled={isGeneratingEval} className="gap-2 bg-[#1B4F72] hover:bg-[#2E86C1]">
              {isGeneratingEval && <Loader2 className="w-4 h-4 animate-spin" />} 
              توليد ورقة التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
