import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, FileText, Download, Trash2, Loader2, Calendar, BookOpen, GraduationCap, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

// Activity color mapping
const ACTIVITY_COLORS: Record<string, { border: string; text: string; bg: string; icon: string }> = {
  "Communication orale": { border: "border-orange-200", text: "text-orange-700", bg: "bg-orange-50", icon: "🗣️" },
  "Lecture": { border: "border-green-200", text: "text-green-700", bg: "bg-green-50", icon: "📖" },
  "Lecture compréhension": { border: "border-green-200", text: "text-green-700", bg: "bg-green-50", icon: "📖" },
  "Lecture fonctionnement": { border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50", icon: "📗" },
  "Grammaire": { border: "border-purple-200", text: "text-purple-700", bg: "bg-purple-50", icon: "📝" },
  "Conjugaison": { border: "border-indigo-200", text: "text-indigo-700", bg: "bg-indigo-50", icon: "📝" },
  "Orthographe": { border: "border-violet-200", text: "text-violet-700", bg: "bg-violet-50", icon: "📝" },
  "Mise en train": { border: "border-yellow-200", text: "text-yellow-700", bg: "bg-yellow-50", icon: "🎵" },
  "Étude de graphies": { border: "border-cyan-200", text: "text-cyan-700", bg: "bg-cyan-50", icon: "✏️" },
  "P.E.L": { border: "border-rose-200", text: "text-rose-700", bg: "bg-rose-50", icon: "📐" },
  "Écriture": { border: "border-amber-200", text: "text-amber-700", bg: "bg-amber-50", icon: "✍️" },
  "Auto dictée": { border: "border-teal-200", text: "text-teal-700", bg: "bg-teal-50", icon: "📋" },
  "Projet d'écriture": { border: "border-sky-200", text: "text-sky-700", bg: "bg-sky-50", icon: "📄" },
  "Projet (Entraînement)": { border: "border-sky-200", text: "text-sky-700", bg: "bg-sky-50", icon: "📄" },
  "Présentation du projet et du module": { border: "border-blue-200", text: "text-blue-700", bg: "bg-blue-50", icon: "📋" },
  "Activité d'écoute": { border: "border-pink-200", text: "text-pink-700", bg: "bg-pink-50", icon: "👂" },
};

function getActivityStyle(name: string) {
  return ACTIVITY_COLORS[name] || { border: "border-gray-200", text: "text-gray-700", bg: "bg-gray-50", icon: "📌" };
}

interface ActivityInput {
  activityName: string;
  objet: string;
  objectifDetails: string;
  objectifSpecifique: string;
}

export default function RepartitionJournaliere() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  // Form state - Header
  const [uniteNumber, setUniteNumber] = useState(1);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [journeeNumber, setJourneeNumber] = useState(1);
  const [niveau, setNiveau] = useState("4ème année");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sousTheme, setSousTheme] = useState("");

  // Dynamic activity inputs
  const [activityInputs, setActivityInputs] = useState<ActivityInput[]>([]);

  // Fetch grade config when niveau/journee changes
  const gradeConfigQuery = trpc.repartitionJournaliere.getGradeConfig.useQuery(
    { niveau, journeeNumber },
    { enabled: !!niveau && !!journeeNumber }
  );

  // Update activity inputs when grade config changes
  useEffect(() => {
    if (gradeConfigQuery.data) {
      const newInputs = gradeConfigQuery.data.activities.map(a => ({
        activityName: a.name,
        objet: "",
        objectifDetails: "",
        objectifSpecifique: "",
      }));
      setActivityInputs(newInputs);
    }
  }, [gradeConfigQuery.data]);

  const historyQuery = trpc.repartitionJournaliere.getHistory.useQuery({ limit: 20, offset: 0 });
  const generateMutation = trpc.repartitionJournaliere.generate.useMutation({
    onSuccess: (data) => {
      setCurrentResult(data);
      setShowResult(true);
      historyQuery.refetch();
      toast.success("Répartition journalière générée avec succès !");
    },
    onError: (err) => {
      toast.error("Erreur: " + err.message);
    },
  });

  const exportPdfMutation = trpc.repartitionJournaliere.exportPdf.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("PDF exporté avec succès !");
    },
    onError: (err) => {
      toast.error("Erreur export PDF: " + err.message);
    },
  });

  const exportDocxMutation = trpc.repartitionJournaliere.exportDocx.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("DOCX exporté avec succès !");
    },
    onError: (err) => {
      toast.error("Erreur export DOCX: " + err.message);
    },
  });

  const deleteMutation = trpc.repartitionJournaliere.delete.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      toast.success("Supprimé avec succès");
    },
  });

  const handleGenerate = () => {
    // Validate at least the first activity has content
    const hasContent = activityInputs.some(a => a.objet.trim());
    if (!hasContent) {
      toast.error("Veuillez remplir au moins un champ Objet/Contenu");
      return;
    }
    generateMutation.mutate({
      uniteNumber,
      moduleNumber,
      journeeNumber,
      niveau,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sousTheme: sousTheme || undefined,
      activityInputs: activityInputs.map(a => ({
        activityName: a.activityName,
        objet: a.objet,
        objectifDetails: a.objectifDetails || undefined,
        objectifSpecifique: a.objectifSpecifique || undefined,
      })),
    });
  };

  const resetForm = () => {
    setStep(1);
    setShowResult(false);
    setCurrentResult(null);
    setActivityInputs(prev => prev.map(a => ({ ...a, objet: "", objectifDetails: "", objectifSpecifique: "" })));
  };

  const updateActivityInput = (idx: number, field: keyof ActivityInput, value: string) => {
    setActivityInputs(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">يرجى تسجيل الدخول للوصول إلى هذه الأداة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = gradeConfigQuery.data;
  const is6eme = config?.tableStructure === "6eme";

  // ===== RESULT VIEW =====
  if (showResult && currentResult) {
    const resultIs6eme = currentResult.tableStructure === "6eme";
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8" dir="ltr">
        <div className="max-w-6xl mx-auto">
          {/* Back + Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={resetForm} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Nouvelle répartition
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportPdfMutation.mutate({ id: currentResult.id })}
                disabled={exportPdfMutation.isPending}
              >
                {exportPdfMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Télécharger PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportDocxMutation.mutate({ id: currentResult.id })}
                disabled={exportDocxMutation.isPending}
              >
                {exportDocxMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Télécharger DOCX
              </Button>
            </div>
          </div>

          {/* Header */}
          {resultIs6eme ? (
            <Card className="mb-6 border-2 border-blue-300 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-between">
                    <p><span className="font-bold text-blue-800">Unité d'apprentissage n°</span> <span className="text-lg font-semibold">{currentResult.uniteNumber}</span></p>
                    <p className="text-gray-600"><span className="font-semibold">Date :</span> de {currentResult.dateFrom || "……"} à {currentResult.dateTo || "……"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p><span className="font-bold text-blue-800">Niveau :</span> <span className="font-semibold">{currentResult.niveau}</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p><span className="font-bold text-blue-800">Module {currentResult.moduleNumber}</span></p>
                    <span className="text-gray-400">—</span>
                    <p><span className="font-bold text-blue-800">Journée {currentResult.journeeNumber}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-2 border-blue-300 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-blue-800">Unité : {currentResult.uniteNumber} / Module : {currentResult.moduleNumber} / Journée : {currentResult.journeeNumber}</p>
                    {currentResult.sousTheme && <p className="text-gray-600 mt-1">Sous thème : {currentResult.sousTheme}</p>}
                  </div>
                  <div className="text-center text-gray-400">
                    ……………… ………… ………………
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-800">{currentResult.niveau}</p>
                    <p className="text-gray-600">De {currentResult.dateFrom || "……"} à {currentResult.dateTo || "……"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card className="border-blue-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: resultIs6eme ? "14%" : "16%" }}>Activités</th>
                    <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: resultIs6eme ? "20%" : "18%" }}>{resultIs6eme ? "Objet (contenu)" : "Objets"}</th>
                    {!resultIs6eme && <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: "22%" }}>Objectifs spécifiques</th>}
                    <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: resultIs6eme ? "26%" : "22%" }}>Objectif de la séance</th>
                    <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: resultIs6eme ? "25%" : "22%" }}>Étapes</th>
                    {resultIs6eme && <th className="p-3 text-center border border-blue-600 font-semibold" style={{ width: "15%" }}>Remarques</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentResult.activities?.map((activity: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                      <td className="p-3 border border-gray-200 align-top text-center">
                        <span className="font-bold text-blue-700 block">{activity.activityName}</span>
                        {activity.duration && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{activity.duration}</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-200 align-top">{activity.objet}</td>
                      {!resultIs6eme && <td className="p-3 border border-gray-200 align-top text-gray-600">{activity.objectifSpecifique || "—"}</td>}
                      <td className="p-3 border border-gray-200 align-top">{activity.objectif}</td>
                      <td className="p-3 border border-gray-200 align-top">
                        <ul className="space-y-1">
                          {activity.etapes?.map((etape: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-blue-600 shrink-0" />
                              <span>{etape}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      {resultIs6eme && (
                        <td className="p-3 border border-gray-200 align-top text-gray-500 italic">
                          {activity.remarques || "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-400">
            Leader Academy — المساعد البيداغوجي الذكي — نسخة تونس 2026
          </div>
        </div>
      </div>
    );
  }

  // ===== FORM VIEW =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8" dir="ltr">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6" dir="rtl">
          <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/ai-tools" className="hover:text-blue-600">الأدوات الذكية</Link>
          <span>/</span>
          <span className="text-blue-700 font-medium">Répartition Journalière</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8" dir="rtl">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Calendar className="h-4 w-4" />
            أداة التوزيع اليومي
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Répartition Journalière</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            أداة توليد التوزيع اليومي لمادة الفرنسية — مطابقة تماماً للنماذج الرسمية التونسية
          </p>
        </div>

        {/* Grade info badge */}
        {config && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 bg-white border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-blue-700">{niveau}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                {config.activities.length} activités • Journée {journeeNumber}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">
                {is6eme ? "Avec durée + Remarques" : "Avec Objectifs spécifiques"}
              </span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: "Informations" },
            { num: 2, label: "Activités" },
            { num: 3, label: "Génération" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "text-blue-700 font-medium" : "text-gray-400"}`}>{s.label}</span>
              {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Header Info */}
        {step === 1 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="h-5 w-5" />
                Informations générales
              </CardTitle>
              <CardDescription>Renseignez les informations d'en-tête de la répartition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Niveau *</Label>
                  <Select value={niveau} onValueChange={setNiveau}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3ème année">3ème année</SelectItem>
                      <SelectItem value="4ème année">4ème année</SelectItem>
                      <SelectItem value="5ème année">5ème année</SelectItem>
                      <SelectItem value="6ème année">6ème année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unité d'apprentissage n°</Label>
                  <Select value={String(uniteNumber)} onValueChange={(v) => setUniteNumber(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Module</Label>
                  <Select value={String(moduleNumber)} onValueChange={(v) => setModuleNumber(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Journée *</Label>
                  <Select value={String(journeeNumber)} onValueChange={(v) => setJourneeNumber(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={String(n)}>Journée {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date début</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              {/* Sous-thème for 3ème-5ème */}
              {!is6eme && (
                <div>
                  <Label>Sous-thème (optionnel)</Label>
                  <Input
                    placeholder="Ex: Vive l'école"
                    value={sousTheme}
                    onChange={(e) => setSousTheme(e.target.value)}
                  />
                </div>
              )}

              {/* Show activity preview */}
              {config && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-2">Activités pour cette journée :</p>
                  <div className="flex flex-wrap gap-2">
                    {config.activities.map((a, i) => {
                      const style = getActivityStyle(a.name);
                      return (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                          <span>{style.icon}</span>
                          {a.name}
                          {a.duration && <span className="opacity-70">({a.duration})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Activities */}
        {step === 2 && (
          <div className="space-y-6">
            {activityInputs.map((input, idx) => {
              const actConfig = config?.activities[idx];
              const style = getActivityStyle(input.activityName);
              return (
                <Card key={idx} className={style.border}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`flex items-center gap-2 ${style.text} text-lg`}>
                      <span className="text-xl">{style.icon}</span>
                      {input.activityName}
                      {actConfig?.duration && <span className="text-sm font-normal opacity-70">({actConfig.duration})</span>}
                    </CardTitle>
                    <CardDescription>
                      Étapes obligatoires : {actConfig?.mandatorySteps.join(" → ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Objet / Contenu *</Label>
                      <Input
                        placeholder={`Ex: Contenu pour ${input.activityName}`}
                        value={input.objet}
                        onChange={(e) => updateActivityInput(idx, "objet", e.target.value)}
                      />
                    </div>
                    {config?.hasObjectifSpecifique && (
                      <div>
                        <Label>Objectifs spécifiques (optionnel)</Label>
                        <Textarea
                          placeholder="Ex: Discriminer auditivement les phonèmes-graphèmes..."
                          value={input.objectifSpecifique}
                          onChange={(e) => updateActivityInput(idx, "objectifSpecifique", e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                    <div>
                      <Label>Précisions sur l'objectif de la séance (optionnel)</Label>
                      <Textarea
                        placeholder={actConfig?.objectifPrefix 
                          ? `Ex: ${actConfig.objectifPrefix} ...`
                          : "Ex: L'élève serait capable de ..."}
                        value={input.objectifDetails}
                        onChange={(e) => updateActivityInput(idx, "objectifDetails", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Generate */}
        {step === 3 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5" />
                Résumé et génération
              </CardTitle>
              <CardDescription>Vérifiez les informations avant de générer la répartition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Niveau :</strong> {niveau}</div>
                  <div><strong>Unité :</strong> {uniteNumber}</div>
                  <div><strong>Module :</strong> {moduleNumber}</div>
                  <div><strong>Journée :</strong> {journeeNumber}</div>
                  {sousTheme && <div className="col-span-2"><strong>Sous-thème :</strong> {sousTheme}</div>}
                </div>
                <hr />
                {activityInputs.map((input, idx) => {
                  const style = getActivityStyle(input.activityName);
                  return (
                    <div key={idx}>
                      <strong className={style.text}>{style.icon} {input.activityName} :</strong>{" "}
                      {input.objet || <span className="text-gray-400 italic">(sera généré par l'IA)</span>}
                    </div>
                  );
                })}
              </div>

              {/* Structure info */}
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                <strong>Structure du tableau :</strong>{" "}
                {is6eme
                  ? "Activités (avec durée) | Objet | Objectif de la séance | Étapes | Remarques"
                  : "Activités | Objets | Objectifs spécifiques | Objectif de la séance | Étapes"
                }
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer la répartition
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {historyQuery.data && historyQuery.data.items.length > 0 && (
          <Card className="mt-8 border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-700 text-lg" dir="rtl">السجل السابق</CardTitle>
              <CardDescription dir="rtl">التوزيعات اليومية المولّدة سابقاً ({historyQuery.data.total})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyQuery.data.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Unité {item.uniteNumber} — Module {item.moduleNumber} — Journée {item.journeeNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.niveau} • {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          const genData = item.generatedContent ? JSON.parse(item.generatedContent) : {};
                          setCurrentResult({
                            id: item.id,
                            activities: item.activities,
                            tableStructure: genData.tableStructure || (item.niveau === "6ème année" ? "6eme" : "3_5eme"),
                            uniteNumber: item.uniteNumber,
                            moduleNumber: item.moduleNumber,
                            journeeNumber: item.journeeNumber,
                            niveau: item.niveau,
                            sousTheme: item.sousTheme,
                            dateFrom: item.dateFrom,
                            dateTo: item.dateTo,
                          });
                          setShowResult(true);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => exportPdfMutation.mutate({ id: item.id })}
                        disabled={exportPdfMutation.isPending}
                      >
                        {exportPdfMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Supprimer cette répartition ?")) {
                            deleteMutation.mutate({ id: item.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
