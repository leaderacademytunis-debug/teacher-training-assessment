
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
import { Loader2, FileText, Download, Wand2, ChevronRight, BookOpen, Target, Layers, CheckCircle2, Edit3, ClipboardCheck, GraduationCap, Stethoscope, Award } from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";
import BackButton from "@/components/BackButton";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolTranslations } from "@/lib/toolTranslations";

const LESSON_GRADIENT = "linear-gradient(135deg, #1B4F72, #2E86C1)";

// --- Types ---
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

// --- Constants ---
const SUBJECTS = [
  { value: "اللغة العربية", ar: "اللغة العربية", fr: "Langue Arabe", en: "Arabic Language" },
  { value: "الرياضيات", ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" },
  { value: "الإيقاظ العلمي", ar: "الإيقاظ العلمي", fr: "Éveil Scientifique", en: "Science" },
  { value: "اللغة الفرنسية", ar: "اللغة الفرنسية", fr: "Langue Française", en: "French Language" },
  { value: "التربية المدنية", ar: "التربية المدنية", fr: "Éducation Civique", en: "Civic Education" },
  { value: "التاريخ والجغرافيا", ar: "التاريخ والجغرافيا", fr: "Histoire & Géographie", en: "History & Geography" },
  { value: "التربية الإسلامية", ar: "التربية الإسلامية", fr: "Éducation Islamique", en: "Islamic Education" },
  { value: "التربية التشكيلية", ar: "التربية التشكيلية", fr: "Arts Plastiques", en: "Art" },
  { value: "التربية الموسيقية", ar: "التربية الموسيقية", fr: "Éducation Musicale", en: "Music" },
  { value: "التربية البدنية", ar: "التربية البدنية", fr: "Éducation Physique", en: "Physical Education" },
];

const GRADES = [
  { value: "الأولى ابتدائي", ar: "السنة الأولى", fr: "1ère Année", en: "1st Grade" },
  { value: "الثانية ابتدائي", ar: "السنة الثانية", fr: "2ème Année", en: "2nd Grade" },
  { value: "الثالثة ابتدائي", ar: "السنة الثالثة", fr: "3ème Année", en: "3rd Grade" },
  { value: "الرابعة ابتدائي", ar: "السنة الرابعة", fr: "4ème Année", en: "4th Grade" },
  { value: "الخامسة ابتدائي", ar: "السنة الخامسة", fr: "5ème Année", en: "5th Grade" },
  { value: "السادسة ابتدائي", ar: "السنة السادسة", fr: "6ème Année", en: "6th Grade" },
];

const DEGREES = [
  { value: "الدرجة الأولى", ar: "الدرجة الأولى (سنة 1 + 2)", fr: "1er Degré (1ère + 2ème)", en: "1st Degree (1st + 2nd)" },
  { value: "الدرجة الثانية", ar: "الدرجة الثانية (سنة 3 + 4)", fr: "2ème Degré (3ème + 4ème)", en: "2nd Degree (3rd + 4th)" },
  { value: "الدرجة الثالثة", ar: "الدرجة الثالثة (سنة 5 + 6)", fr: "3ème Degré (5ème + 6ème)", en: "3rd Degree (5th + 6th)" },
];

const TRIMESTERS = [
  { value: "الثلاثي الأول", ar: "الثلاثي الأول", fr: "1er Trimestre", en: "1st Trimester" },
  { value: "الثلاثي الثاني", ar: "الثلاثي الثاني", fr: "2ème Trimestre", en: "2nd Trimester" },
  { value: "الثلاثي الثالث", ar: "الثلاثي الثالث", fr: "3ème Trimestre", en: "3rd Trimester" },
];

// --- Main Component ---
export default function LessonSheetFromPlan() {
  const [, navigate] = useLocation();
  const { language, t } = useLanguage();
  const tt = getToolTranslations(language);
  const isRTL = language === "ar";

  // Step 1: Input Parameters
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

  // Step 2: Generated Sheet
  const [sheet, setSheet] = useState<LessonSheet | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSheet, setEditedSheet] = useState<LessonSheet | null>(null);

  // --- tRPC Mutations ---
  const generateMutation = trpc.pedagogicalSheets.generateLessonSheetFromPlan.useMutation({
    onSuccess: (data: { success: boolean; sheet?: Record<string, unknown> }) => {
      if (data.success && data.sheet) {
        setSheet(data.sheet as LessonSheet);
        setEditedSheet(data.sheet as LessonSheet);
        toast.success(t("تم توليد الجذاذة بنجاح!", "Fiche générée avec succès !", "Lesson sheet generated successfully!"));
      }
    },
    onError: (err: { message: string }) => {
      toast.error(`${t("خطأ في التوليد:", "Erreur de génération :", "Generation error:")} ${err.message}`);
    },
  });

  const exportWordMutation = trpc.pedagogicalSheets.exportLessonSheetToWord.useMutation({
    onSuccess: (data: { base64: string; filename: string }) => {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.base64}`;
      link.download = data.filename;
      link.click();
      toast.success(t("تم تحميل الجذاذة بصيغة Word!", "Fiche téléchargée en Word !", "Sheet downloaded as Word!"));
    },
    onError: (err: { message: string }) => {
      toast.error(`${t("خطأ في التصدير:", "Erreur d'export :", "Export error:")} ${err.message}`);
    },
  });

  // --- Handlers ---
  const handleGenerate = () => {
    if (!subject || !grade || !objective) {
      toast.error(t("يرجى تحديد المادة والمستوى والهدف المميز على الأقل", "Veuillez sélectionner la matière, le niveau et l'objectif au minimum", "Please select subject, grade, and objective at least"));
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

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir={isRTL ? "rtl" : "ltr"}>
      <ToolPageHeader
        icon={BookOpen}
        nameAr="محرك بناء الجذاذات التربوية"
        nameFr="Moteur de Fiches Pédagogiques"
        nameEn="Lesson Plan Builder"
        descAr="Leader Lesson Architect — المقاربة بالكفايات المعتمدة في تونس"
        descFr="Leader Lesson Architect — Approche par compétences adoptée en Tunisie"
        descEn="Leader Lesson Architect — Competency-based approach"
        gradient={LESSON_GRADIENT}
        backTo="/teacher-tools"
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* --- Data Card --- */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              {t("معطيات الجذاذة", "Données de la Fiche", "Sheet Data")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Row 1: Subject + Grade + Degree */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{tt.subject} *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="border-blue-200 focus:border-[#1B4F72]">
                    <SelectValue placeholder={t("اختر المادة...", "Choisir matière...", "Select subject...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{tt.level} *</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="border-blue-200 focus:border-[#1B4F72]">
                    <SelectValue placeholder={t("اختر السنة...", "Choisir année...", "Select grade...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{t("الدرجة", "Degré", "Degree")}</Label>
                <Select value={degree} onValueChange={setDegree}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder={t("اختر الدرجة...", "Choisir degré...", "Select degree...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Trimester + Period + Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{tt.trimester}</Label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder={t("اختر الثلاثي...", "Choisir trimestre...", "Select trimester...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTERS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{t("الوحدة / الفترة", "Unité / Période", "Unit / Period")}</Label>
                <Input
                  className="border-blue-200"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={t("مثال: الوحدة 1، الأسبوع 3...", "Ex: Unité 1, Semaine 3...", "Ex: Unit 1, Week 3...")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{t("المجال / النشاط", "Domaine / Activité", "Domain / Activity")}</Label>
                <Input
                  className="border-blue-200"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={t("مثال: قراءة، إنتاج كتابي، أعداد...", "Ex: Lecture, Production écrite...", "Ex: Reading, Writing, Numbers...")}
                />
              </div>
            </div>

            {/* Row 3: Competency Component */}
            <div className="space-y-2">
              <Label className="text-[#1B4F72] font-semibold">{t("مكون الكفاية", "Composante de la compétence", "Competency Component")}</Label>
              <Input
                className="border-blue-200"
                value={competencyComponent}
                onChange={(e) => setCompetencyComponent(e.target.value)}
                placeholder={t("مثال: التحكم في نظام الرسم الكتابي، حل وضعيات مشكل...", "Ex: Maîtriser le système d'écriture...", "Ex: Master the writing system...")}
              />
            </div>

            {/* Row 4: Objective + Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{t("الهدف المميز *", "Objectif spécifique *", "Specific Objective *")}</Label>
                <Input
                  className="border-blue-200 focus:border-[#1B4F72]"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder={t("مثال: يتعرف المتعلم على الصوت [س] ضمن كلمات", "Ex: L'élève identifie le son [s]...", "Ex: The learner identifies the sound [s]...")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#1B4F72] font-semibold">{t("المحتوى", "Contenu", "Content")}</Label>
                <Input
                  className="border-blue-200"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("مثال: حرف السين، الجمع والطرح، جسم الإنسان...", "Ex: La lettre S, Addition/Soustraction...", "Ex: The letter S, Addition/Subtraction...")}
                />
              </div>
            </div>

            {/* Row 5: School Info */}
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-gray-500">{tt.schoolName}</Label>
                    <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder={t("اسم مدرستك...", "Nom de votre école...", "Your school's name...")} />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-500">{tt.teacherName}</Label>
                    <Input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder={t("اسمك الكامل...", "Votre nom complet...", "Your full name...")} />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-500">{tt.academicYear}</Label>
                    <Input value={schoolYear} onChange={e => setSchoolYear(e.target.value)} />
                </div>
            </div>

            {/* Generate Button */}
            <div className="text-center pt-4">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-r from-[#2E86C1] to-[#1B4F72] text-white shadow-lg hover:shadow-xl transition-shadow w-full md:w-auto"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {tt.generating}</>
                ) : (
                  <><Wand2 className="w-5 h-5" /> {t("توليد الجذاذة الآن", "Générer la Fiche", "Generate Sheet Now")}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Result Display --- */}
        {displaySheet && (
          <Card className="border-0 shadow-md mt-6">
            <CardHeader className="bg-white flex flex-row items-center justify-between rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1B4F72]">
                <FileText className="w-5 h-5" />
                {t("الجذاذة التربوية", "Fiche Pédagogique", "Lesson Sheet")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                    {editMode ? <><CheckCircle2 className="w-4 h-4" /> {t("حفظ التعديلات", "Enregistrer", "Save Changes")} </>: <><Edit3 className="w-4 h-4" /> {tt.edit}</>}
                </Button>
                <Button size="sm" onClick={handleExportWord} disabled={exportWordMutation.isPending}>
                  {exportWordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {tt.downloadWord}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`p-6 text-sm leading-relaxed ${isRTL ? 'text-end' : 'text-start'}`}>
                <div className={`space-y-4 ${isRTL ? 'text-end' : 'text-start'}`}>
                  {displaySheet.lessonTitle && <EditableField isRTL={isRTL} editMode={editMode} label={t("عنوان الدرس", "Titre de la leçon", "Lesson Title")} value={displaySheet.lessonTitle} onChange={(val) => updateEditedField("lessonTitle", val)} />}
                  <div className="grid grid-cols-2 gap-4">
                    {displaySheet.duration && <DisplayField isRTL={isRTL} label={t("المدة", "Durée", "Duration")} value={displaySheet.duration} />}
                    {displaySheet.sessionObjective && <DisplayField isRTL={isRTL} label={t("هدف الحصة", "Objectif de la séance", "Session Objective")} value={displaySheet.sessionObjective} />}
                  </div>
                  {displaySheet.proceduralObjectives && <DisplayList isRTL={isRTL} label={t("الأهداف الإجرائية", "Objectifs procéduraux", "Procedural Objectives")} items={displaySheet.proceduralObjectives} />}
                  {displaySheet.materials && <DisplayList isRTL={isRTL} label={t("المعينات البيداغوجية", "Matériels didactiques", "Teaching Aids")} items={displaySheet.materials} />}
                  
                  {displaySheet.launchPhase && <PhaseCard isRTL={isRTL} phase={displaySheet.launchPhase} title={t("مرحلة الانطلاق", "Phase de lancement", "Launch Phase")} />}
                  {displaySheet.mainPhase && <PhaseCard isRTL={isRTL} phase={displaySheet.mainPhase} title={t("المرحلة الرئيسية", "Phase principale", "Main Phase")} />}
                  {displaySheet.applicationPhase && <PhaseCard isRTL={isRTL} phase={displaySheet.applicationPhase} title={t("مرحلة التطبيق", "Phase d'application", "Application Phase")} />}
                  {displaySheet.integrationPhase && <PhaseCard isRTL={isRTL} phase={displaySheet.integrationPhase} title={t("مرحلة الإدماج", "Phase d'intégration", "Integration Phase")} />}
                  {displaySheet.remediation && <RemediationCard isRTL={isRTL} remediation={displaySheet.remediation} t={t} />}
                  {displaySheet.assessmentCriteria && <AssessmentCriteriaCard isRTL={isRTL} criteria={displaySheet.assessmentCriteria} t={t} />}
                  {displaySheet.conclusion && <DisplayField isRTL={isRTL} label={t("الخاتمة", "Conclusion", "Conclusion")} value={displaySheet.conclusion} />}
                  {displaySheet.summativeEvaluation && <DisplayField isRTL={isRTL} label={t("التقييم النهائي", "Évaluation sommative", "Summative Evaluation")} value={displaySheet.summativeEvaluation} />}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


// --- Helper Components for Displaying Sheet ---

function EditableField({ isRTL, editMode, label, value, onChange }: { isRTL: boolean; editMode: boolean; label: string; value: string; onChange: (value: string) => void; }) {
  return (
    <div>
      <Label className={`font-bold text-blue-800 mb-1 block ${isRTL ? 'text-end' : 'text-start'}`}>{label}</Label>
      {editMode ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border rounded-md" />
      ) : (
        <div className="p-2 bg-gray-50 rounded-md border">{value}</div>
      )}
    </div>
  );
}

function DisplayField({ isRTL, label, value }: { isRTL: boolean; label: string; value: string; }) {
  return (
    <div>
      <Label className={`font-bold text-blue-800 mb-1 block ${isRTL ? 'text-end' : 'text-start'}`}>{label}</Label>
      <div className="p-2 bg-gray-50 rounded-md border">{value}</div>
    </div>
  );
}

function DisplayList({ isRTL, label, items }: { isRTL: boolean; label: string; items: string[]; }) {
  return (
    <div>
      <Label className={`font-bold text-blue-800 mb-1 block ${isRTL ? 'text-end' : 'text-start'}`}>{label}</Label>
      <ul className={`list-disc ${isRTL ? 'list-inside pe-4' : 'list-outside ps-4'}`}>
        {items.map((item, index) => <li key={index} className="mb-1">{item}</li>)}
      </ul>
    </div>
  );
}

function PhaseCard({ isRTL, phase, title, t }: { isRTL: boolean; phase: any; title: string; t: (ar: string, fr: string, en: string) => string; }) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className={`text-base font-semibold text-blue-900 ${isRTL ? 'text-end' : 'text-start'}`}>{title} ({phase.duration})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {phase.problemSituation && <p><strong>{t("وضعية الانطلاق", "Situation de départ", "Starting Situation")}:</strong> {phase.problemSituation}</p>}
        {phase.teacherActivity && <p><strong>{t("نشاط المعلم", "Activité de l'enseignant", "Teacher's Activity")}:</strong> {phase.teacherActivity}</p>}
        {phase.learnerActivity && <p><strong>{t("نشاط المتعلم", "Activité de l'apprenant", "Learner's Activity")}:</strong> {phase.learnerActivity}</p>}
        {phase.tools && <p><strong>{t("المعينات", "Outils", "Tools")}:</strong> {phase.tools}</p>}
        {phase.steps && (
          <div className="space-y-2">
            {phase.steps.map((step: any, i: number) => (
              <div key={i} className={`p-2 rounded-md bg-white border ${isRTL ? 'border-e-2 border-e-blue-300' : 'border-s-2 border-s-blue-300'}`}>
                <p className="font-semibold">{step.step}</p>
                <p><strong>{t("نشاط المعلم", "Activité de l'enseignant", "Teacher's Activity")}:</strong> {step.teacherActivity}</p>
                <p><strong>{t("نشاط المتعلم", "Activité de l'apprenant", "Learner's Activity")}:</strong> {step.learnerActivity}</p>
                {step.tools && <p><strong>{t("المعينات", "Outils", "Tools")}:</strong> {step.tools}</p>}
              </div>
            ))}
          </div>
        )}
        {phase.exercise && <p><strong>{t("التمرين", "Exercice", "Exercise")}:</strong> {phase.exercise}</p>}
        {phase.sened && <p><strong>{t("السند", "Support", "Support")}:</strong> {phase.sened}</p>}
        {phase.talima && <p><strong>{t("التعليمة", "Consigne", "Instruction")}:</strong> {phase.talima}</p>}
      </CardContent>
    </Card>
  );
}

function RemediationCard({ isRTL, remediation, t }: { isRTL: boolean; remediation: any; t: (ar: string, fr: string, en: string) => string; }) {
  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader className="pb-2">
        <CardTitle className={`text-base font-semibold text-orange-900 ${isRTL ? 'text-end' : 'text-start'}`}>{t("مرحلة العلاج", "Phase de remédiation", "Remediation Phase")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>{t("الصعوبات المرصودة", "Difficultés observées", "Observed Difficulties")}:</strong> {remediation.difficulties}</p>
        <p><strong>{t("المعيار الأدنى للتحكم", "Critère minimal de maîtrise", "Minimal Mastery Criterion")}:</strong> {remediation.minimalCriteria}</p>
        <p><strong>{t("أنشطة العلاج", "Activités de remédiation", "Remediation Activities")}:</strong> {remediation.remediationActivities}</p>
        <p><strong>{t("أنشطة الإثراء", "Activités d'enrichissement", "Enrichment Activities")}:</strong> {remediation.enrichmentActivities}</p>
      </CardContent>
    </Card>
  );
}

function AssessmentCriteriaCard({ isRTL, criteria, t }: { isRTL: boolean; criteria: any; t: (ar: string, fr: string, en: string) => string; }) {
  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader className="pb-2">
        <CardTitle className={`text-base font-semibold text-purple-900 ${isRTL ? 'text-end' : 'text-start'}`}>{t("معايير التقييم", "Critères d'évaluation", "Assessment Criteria")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(criteria).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-1">{key.toUpperCase()}</Badge>
            <span>{value as string}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
