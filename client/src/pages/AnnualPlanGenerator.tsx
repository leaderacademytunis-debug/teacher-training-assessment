
import { useState, useEffect } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";

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
  loaderMessagesFr: [
    "Analyse du programme officiel de la matière choisie...",
    "Identification des compétences et de leurs composantes...",
    "Répartition des unités d'apprentissage sur les trimestres...",
    "Formulation des objectifs spécifiques pour chaque leçon...",
    "Définition des contenus notionnels et procéduraux...",
    "Estimation du nombre de séances pour chaque activité...",
    "Vérification de la cohérence et de l'équilibre du plan...",
    "Le plan annuel est presque prêt...",
  ],
  loaderMessagesEn: [
    "Analyzing the official curriculum for the selected subject...",
    "Identifying competencies and their core components...",
    "Distributing learning units across trimesters...",
    "Formulating specific objectives for each lesson...",
    "Defining knowledge and skill-based content...",
    "Estimating the number of sessions for each activity...",
    "Reviewing the sequence and balance of the plan...",
    "The annual plan is almost ready...",
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

const SUBJECTS_DATA = [
  { value: "اللغة العربية", ar: "اللغة العربية", fr: "Langue Arabe", en: "Arabic Language" },
  { value: "الرياضيات", ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" },
  { value: "الإيقاظ العلمي", ar: "الإيقاظ العلمي", fr: "Éveil Scientifique", en: "Science" },
  { value: "التربية المدنية", ar: "التربية المدنية", fr: "Éducation Civique", en: "Civic Education" },
  { value: "التاريخ والجغرافيا", ar: "التاريخ والجغرافيا", fr: "Histoire & Géographie", en: "History & Geography" },
  { value: "التربية الإسلامية", ar: "التربية الإسلامية", fr: "Éducation Islamique", en: "Islamic Education" },
  { value: "اللغة الفرنسية", ar: "اللغة الفرنسية", fr: "Langue Française", en: "French Language" },
];

const GRADES_DATA = [
  { value: "الأولى", ar: "الأولى", fr: "1ère Année", en: "1st Grade" },
  { value: "الثانية", ar: "الثانية", fr: "2ème Année", en: "2nd Grade" },
  { value: "الثالثة", ar: "الثالثة", fr: "3ème Année", en: "3rd Grade" },
  { value: "الرابعة", ar: "الرابعة", fr: "4ème Année", en: "4th Grade" },
  { value: "الخامسة", ar: "الخامسة", fr: "5ème Année", en: "5th Grade" },
  { value: "السادسة", ar: "السادسة", fr: "6ème Année", en: "6th Grade" },
];

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
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

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
        toast.success(t(`تم التوليد بنجاح! تم توليد ${data.rows.length} صفاً في المخطط السنوي`, `Génération réussie ! ${data.rows.length} lignes ont été générées dans le plan annuel`, `Generation successful! ${data.rows.length} rows were generated in the annual plan`));
      }
    },
    onError: (err: { message: string }) => {
      toast.error(t(`خطأ في التوليد: ${err.message}`, `Erreur de génération : ${err.message}`, `Generation error: ${err.message}`));
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
      toast.success(t("تم التصدير بنجاح! جاري تحميل ملف Word...", "Exportation réussie ! Téléchargement du fichier Word en cours...", "Export successful! Downloading Word file..."));
    },
    onError: (err: { message: string }) => {
      toast.error(t(`خطأ في التصدير: ${err.message}`, `Erreur d'exportation : ${err.message}`, `Export error: ${err.message}`));
    },
  });

  const generateEvalMutation = trpc.pedagogicalSheets.generateEvaluationFromPlanRow.useMutation({
    onSuccess: (data) => {
      setIsGeneratingEval(false);
      setEvalDialogOpen(false);
      toast.success(t("تم توليد ورقة التقييم بنجاح!", "Fiche d'évaluation générée avec succès !", "Evaluation sheet generated successfully!"));
      const evalData = encodeURIComponent(JSON.stringify(data.evaluation));
      navigate(`/evaluation-from-sheet?data=${evalData}&includeAnswerKey=${includeAnswerKey}`);
    },
    onError: (err: { message: string }) => {
      setIsGeneratingEval(false);
      toast.error(t(`خطأ في توليد التقييم: ${err.message}`, `Erreur de génération de l'évaluation : ${err.message}`, `Error generating evaluation: ${err.message}`));
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ subject, grade, schoolYear });
  };

  const handleExportWord = () => {
    if (rows.length === 0) {
      toast.error(t("لا يوجد مخطط — يرجى توليد المخطط أولاً", "Aucun plan trouvé — veuillez d'abord générer le plan", "No plan found — please generate the plan first"));
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
      trimester: lastRow?.trimester || t("الأول", "1er", "1st"),
      unit: lastRow?.unit || t("الوحدة 1", "Unité 1", "Unit 1"),
      activity: t("قراءة", "Lecture", "Reading"),
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
        <div className={`flex items-center gap-1 min-w-[80px]`}>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
            className={`h-7 text-xs px-1 ${isRTL ? 'text-end' : 'text-start'}`}
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
        <span className={`text-xs ${isRTL ? 'text-end' : 'text-start'} flex-1 leading-relaxed`}>{value}</span>
        <Edit2 className={`w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0 mt-0.5`} />
      </div>
    );
  };

  const selectedRow = selectedRowIdx !== null ? rows[selectedRowIdx] : null;

  const inputPanel = (
    <div className="space-y-4">
      <Card className="shadow-md border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B4F72]">{t("إعدادات المخطط السنوي", "Paramètres du Plan Annuel", "Annual Plan Settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="subject">{tt.subject}</Label>
              <Select value={subject} onValueChange={setSubject} dir={isRTL ? "rtl" : "ltr"}>
                <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS_DATA.map(s => <SelectItem key={s.value} value={s.value}>{t(s.ar, s.fr, s.en)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">{tt.level}</Label>
              <Select value={grade} onValueChange={setGrade} dir={isRTL ? "rtl" : "ltr"}>
                <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES_DATA.map(g => <SelectItem key={g.value} value={g.value}>{t(g.ar, g.fr, g.en)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="schoolYear">{tt.academicYear}</Label>
              <Input id="schoolYear" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} placeholder="2025-2026" dir={isRTL ? "rtl" : "ltr"} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generateMutation.isLoading} className="w-full mt-6 bg-[#1B4F72] hover:bg-[#153e5a]">
            {generateMutation.isLoading ? tt.generating : tt.generate}
          </Button>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className="shadow-md border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B4F72]">{t("ملخص الحصص", "Résumé des Séances", "Sessions Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex justify-between items-center font-semibold">
              <span>{t("المجموع العام", "Total Général", "Grand Total")}</span>
              <span>{totalSessions} {t("حصة", "séances", "sessions")}</span>
            </div>
            <hr className="my-2" />
            {Object.entries(trimesterSummary).map(([tri, count]) => (
              <div key={tri} className="flex justify-between items-center text-xs">
                <span>{t("الثلاثي", "Trimestre", "Trimester")} {tri}</span>
                <span>{count} {t("حصة", "séances", "sessions")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const resultPanel = (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {rows.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <h2 className="text-lg font-bold text-gray-800">{t("المخطط السنوي لـ", "Plan Annuel pour", "Annual Plan for")} {subject} - {t("السنة", "Année", "Year")} {grade}</h2>
            <div className="flex gap-2">
              <Button onClick={handleExportWord} variant="outline" size="sm" disabled={exportMutation.isLoading}>
                <Download className="w-4 h-4 ltr:me-2 rtl:ms-2" />
                {exportMutation.isLoading ? tt.loading : tt.downloadWord}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("الثلاثي", "Trimestre", "Trimester")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("الوحدة", "Unité", "Unit")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("النشاط", "Activité", "Activity")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("مكون الكفاية", "Composante", "Component")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("الهدف المميز", "Objectif", "Objective")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("المحتوى", "Contenu", "Content")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("الحصص", "Séances", "Sessions")}</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase tracking-wider">{t("إجراءات", "Actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TRIMESTER_COLORS[row.trimester] || 'bg-gray-100'}`}>
                        {t("الثلاثي", "Trimestre", "Trimester")} {row.trimester}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-center">{renderCell(row, rowIdx, 'unit')}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-center">{renderCell(row, rowIdx, 'activity')}</td>
                    <td className="px-2 py-1.5 text-center" style={{ minWidth: '150px' }}>{renderCell(row, rowIdx, 'competencyComponent')}</td>
                    <td className="px-2 py-1.5 text-center" style={{ minWidth: '150px' }}>{renderCell(row, rowIdx, 'distinguishedObjective')}</td>
                    <td className="px-2 py-1.5 text-center" style={{ minWidth: '200px' }}>{renderCell(row, rowIdx, 'content')}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-center">{renderCell(row, rowIdx, 'sessions')}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7 bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => openEvalDialog(rowIdx)}>
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => deleteRow(rowIdx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-gray-50 border-t">
            <Button variant="ghost" size="sm" className="w-full text-sm" onClick={addRow}>
              <Plus className="w-4 h-4 ltr:me-2 rtl:ms-2" />
              {t("إضافة صف جديد", "Ajouter une ligne", "Add new row")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <FileText className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">{tt.noResult}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("استخدم النموذج على اليسار لتوليد مخطط سنوي جديد.", "Utilisez le formulaire à gauche pour générer un nouveau plan annuel.", "Use the form on the left to generate a new annual plan.")}</p>
        </div>
      )}

      {selectedRow && (
        <Dialog open={evalDialogOpen} onOpenChange={setEvalDialogOpen} dir={isRTL ? "rtl" : "ltr"}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{t("توليد تقييم من درس", "Générer une évaluation à partir d'une leçon", "Generate Evaluation from Lesson")}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className={`text-sm bg-blue-50 p-3 rounded-md border border-blue-200 ${isRTL ? 'text-end' : 'text-start'}`}>
                <strong>{tt.subject}:</strong> {subject}<br />
                <strong>{tt.level}:</strong> {grade}<br />
                <strong>{t("الدرس", "Leçon", "Lesson")}:</strong> {selectedRow.content}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("نوع التقييم", "Type d'évaluation", "Evaluation Type")}</Label>
                  <Select value={evalType} onValueChange={(v) => setEvalType(v as any)} dir={isRTL ? "rtl" : "ltr"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">{t("تكويني", "Formative", "Formative")}</SelectItem>
                      <SelectItem value="summative">{t("إشهادي", "Sommative", "Summative")}</SelectItem>
                      <SelectItem value="diagnostic">{t("تشخيصي", "Diagnostique", "Diagnostic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("عدد الأسئلة", "Nombre de questions", "Number of Questions")}</Label>
                  <Input type="number" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} min={3} max={15} dir={isRTL ? "rtl" : "ltr"} />
                </div>
              </div>
              <div>
                <Label>{tt.schoolName} ({tt.optional})</Label>
                <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder={t("مثال: مدرسة النجاح", "Ex: École Al-Najah", "Ex: Al-Najah School")} dir={isRTL ? "rtl" : "ltr"} />
              </div>
              <div>
                <Label>{tt.teacherName} ({tt.optional})</Label>
                <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder={t("مثال: الأستاذ علي", "Ex: M. Ali", "Ex: Mr. Ali")} dir={isRTL ? "rtl" : "ltr"} />
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input type="checkbox" id="includeAnswerKey" checked={includeAnswerKey} onChange={(e) => setIncludeAnswerKey(e.target.checked)} />
                <Label htmlFor="includeAnswerKey">{t("تضمين الإصلاح", "Inclure la correction", "Include Answer Key")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEvalDialogOpen(false)}>{tt.cancel}</Button>
              <Button onClick={handleGenerateEvaluation} disabled={isGeneratingEval}>
                {isGeneratingEval ? (
                  <><Loader2 className="w-4 h-4 animate-spin ltr:me-2 rtl:ms-2" /> {tt.generating}</>
                ) : (
                  t("توليد ورقة التقييم", "Générer la fiche", "Generate Sheet")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  return (
    <UnifiedToolLayout
      config={TOOL_CONFIG}
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      isLoading={generateMutation.isLoading}
      loadingMessage={t("جاري توليد المخطط السنوي...", "Génération du plan annuel en cours...", "Generating annual plan...")}
    />
  );
}
