import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, Sparkles, Edit2, Check, X, FileText, BookOpen } from "lucide-react";

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

export default function AnnualPlanGenerator() {
  const [subject, setSubject] = useState("اللغة العربية");
  const [grade, setGrade] = useState("السادسة");
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; field: keyof PlanRow } | null>(null);
  const [editValue, setEditValue] = useState("");

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
      // Download the Word file
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

  // Group rows by trimester for summary
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

    // Special rendering for activity field
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold">توليد المخطط السنوي التلقائي</h1>
              <p className="text-blue-200 text-sm">المحرك البيداغوجي الذكي — Leader Academy — نسخة تونس 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1B4F72] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                إعدادات المخطط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">المادة الدراسية</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s} className="text-right">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">السنة الدراسية</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => (
                      <SelectItem key={g} value={g} className="text-right">السنة {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">السنة الدراسية</Label>
                <Input
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="text-right"
                  placeholder="2025-2026"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-[#1B4F72] hover:bg-[#154360] text-white"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري التوليد...</>
                ) : (
                  <><Sparkles className="w-4 h-4 ml-2" />توليد المخطط تلقائياً</>
                )}
              </Button>

              {rows.length > 0 && (
                <Button
                  onClick={handleExportWord}
                  disabled={exportMutation.isPending}
                  variant="outline"
                  className="w-full border-[#F39C12] text-[#F39C12] hover:bg-[#FEF9E7]"
                >
                  {exportMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري التصدير...</>
                  ) : (
                    <><Download className="w-4 h-4 ml-2" />تحميل بصيغة Word</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {rows.length > 0 && (
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#1B4F72]">ملخص المخطط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#1B4F72]">{totalSessions}</span>
                  <span className="text-gray-600">إجمالي الحصص</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#1B4F72]">{rows.length}</span>
                  <span className="text-gray-600">إجمالي الصفوف</span>
                </div>
                <div className="border-t pt-2 space-y-1">
                  {Object.entries(trimesterSummary).map(([tri, count]) => (
                    <div key={tri} className="flex justify-between text-xs">
                      <span className="font-medium">{count} حصة</span>
                      <Badge className={`text-xs ${TRIMESTER_COLORS[tri] || "bg-gray-100 text-gray-700"}`}>{tri}</Badge>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={addRow}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs mt-2"
                >
                  + إضافة صف
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="shadow-md border-0 bg-amber-50">
            <CardContent className="pt-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>كيفية الاستخدام:</strong><br />
                1. اختر المادة والسنة<br />
                2. اضغط "توليد المخطط"<br />
                3. انقر على أي خانة لتعديلها<br />
                4. اضغط Enter لحفظ التعديل<br />
                5. صدّر إلى Word بشعار Leader Academy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          {generateMutation.isPending && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-md">
              <Loader2 className="w-12 h-12 animate-spin text-[#2E86C1] mb-4" />
              <p className="text-[#1B4F72] font-semibold">جاري توليد المخطط السنوي...</p>
              <p className="text-gray-500 text-sm mt-1">يستخرج النظام الأهداف والمحتويات من البرنامج الرسمي</p>
            </div>
          )}

          {!generateMutation.isPending && rows.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-md border-2 border-dashed border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">لم يتم توليد أي مخطط بعد</p>
              <p className="text-gray-400 text-sm mt-1">اختر المادة والسنة ثم اضغط "توليد المخطط تلقائياً"</p>
            </div>
          )}

          {rows.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Table Header Info */}
              <div className="bg-[#1B4F72] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold">مخطط سنوي — {subject} — السنة {grade} ابتدائي</span>
                </div>
                <span className="text-blue-200 text-sm">{schoolYear}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" dir="rtl">
                  <thead>
                    <tr className="bg-[#2E86C1] text-white">
                      <th className="px-3 py-2 text-center font-semibold text-xs w-16">الثلاثي</th>
                      <th className="px-3 py-2 text-center font-semibold text-xs w-20">الفترة</th>
                      <th className="px-3 py-2 text-center font-semibold text-xs w-24">النشاط</th>
                      <th className="px-3 py-2 text-right font-semibold text-xs">مكوّن الكفاية</th>
                      <th className="px-3 py-2 text-right font-semibold text-xs">الهدف المميز</th>
                      <th className="px-3 py-2 text-right font-semibold text-xs">المحتوى</th>
                      <th className="px-3 py-2 text-center font-semibold text-xs w-16">الحصص</th>
                      <th className="px-3 py-2 text-center font-semibold text-xs w-12">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-2 py-2 text-center">
                          <Badge className={`text-xs ${TRIMESTER_COLORS[row.trimester] || "bg-gray-100 text-gray-700"}`}>
                            {row.trimester}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-gray-600">{renderCell(row, idx, "unit")}</td>
                        <td className="px-2 py-2">{renderCell(row, idx, "activity")}</td>
                        <td className="px-2 py-2 max-w-[160px]">{renderCell(row, idx, "competencyComponent")}</td>
                        <td className="px-2 py-2 max-w-[180px]">{renderCell(row, idx, "distinguishedObjective")}</td>
                        <td className="px-2 py-2 max-w-[200px]">{renderCell(row, idx, "content")}</td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center">
                            {renderCell(row, idx, "sessions")}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => deleteRow(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                <p className="text-xs text-gray-500">انقر على أي خانة لتعديلها • اضغط Enter لحفظ التعديل</p>
                <Button
                  onClick={handleExportWord}
                  disabled={exportMutation.isPending}
                  size="sm"
                  className="bg-[#F39C12] hover:bg-[#D68910] text-white"
                >
                  {exportMutation.isPending ? (
                    <><Loader2 className="w-3 h-3 ml-1 animate-spin" />تصدير...</>
                  ) : (
                    <><Download className="w-3 h-3 ml-1" />تحميل Word • ليدر أكاديمي</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
