import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, FileText, Download, Trash2, Loader2, Calendar, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function RepartitionJournaliere() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  // Form state
  const [uniteNumber, setUniteNumber] = useState(1);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [journeeNumber, setJourneeNumber] = useState(1);
  const [niveau, setNiveau] = useState("6ème année");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Communication orale
  const [commObjet, setCommObjet] = useState("");
  const [commObjectifDetails, setCommObjectifDetails] = useState("");

  // Lecture
  const [lectureObjet, setLectureObjet] = useState("");
  const [lectureObjectifDetails, setLectureObjectifDetails] = useState("");

  // Grammaire/Conjugaison/Orthographe
  const [gramType, setGramType] = useState<"Grammaire" | "Conjugaison" | "Orthographe">("Grammaire");
  const [gramObjet, setGramObjet] = useState("");
  const [gramObjectifDetails, setGramObjectifDetails] = useState("");

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

  const deleteMutation = trpc.repartitionJournaliere.delete.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      toast.success("Supprimé avec succès");
    },
  });

  const handleGenerate = () => {
    if (!commObjet.trim() || !lectureObjet.trim() || !gramObjet.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires (Objet/Contenu)");
      return;
    }
    generateMutation.mutate({
      uniteNumber,
      moduleNumber,
      journeeNumber,
      niveau,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      communicationOrale: {
        objet: commObjet,
        objectifDetails: commObjectifDetails || undefined,
      },
      lecture: {
        objet: lectureObjet,
        objectifDetails: lectureObjectifDetails || undefined,
      },
      grammaireConjugaisonOrthographe: {
        type: gramType,
        objet: gramObjet,
        objectifDetails: gramObjectifDetails || undefined,
      },
    });
  };

  const resetForm = () => {
    setStep(1);
    setShowResult(false);
    setCurrentResult(null);
    setCommObjet("");
    setCommObjectifDetails("");
    setLectureObjet("");
    setLectureObjectifDetails("");
    setGramObjet("");
    setGramObjectifDetails("");
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

  // ===== RESULT VIEW =====
  if (showResult && currentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8" dir="ltr">
        <div className="max-w-5xl mx-auto">
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
            </div>
          </div>

          {/* Header - Official Tunisian Format */}
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

          {/* Table */}
          <Card className="border-blue-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-3 text-center border border-blue-600 w-[15%] font-semibold">Activités</th>
                    <th className="p-3 text-center border border-blue-600 w-[20%] font-semibold">Objet (contenu)</th>
                    <th className="p-3 text-center border border-blue-600 w-[25%] font-semibold">Objectif de la séance</th>
                    <th className="p-3 text-center border border-blue-600 w-[25%] font-semibold">Étapes</th>
                    <th className="p-3 text-center border border-blue-600 w-[15%] font-semibold">Remarques</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.activities?.map((activity: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                      <td className="p-3 border border-gray-200 align-top text-center">
                        <span className="font-bold text-blue-700 block">{activity.activityName}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{activity.duration}</span>
                      </td>
                      <td className="p-3 border border-gray-200 align-top">{activity.objet}</td>
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
                      <td className="p-3 border border-gray-200 align-top text-gray-500 italic">
                        {activity.remarques || "—"}
                      </td>
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
          <p className="text-gray-600">التوزيع اليومي للحصص — اللغة الفرنسية — المنهج التونسي الرسمي</p>
        </div>

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
                  <Label htmlFor="unite">Unité d'apprentissage n°</Label>
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
                  <Label htmlFor="module">Module</Label>
                  <Select value={String(moduleNumber)} onValueChange={(v) => setModuleNumber(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="journee">Journée</Label>
                  <Select value={String(journeeNumber)} onValueChange={(v) => setJourneeNumber(Number(v))}>
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
                  <Label htmlFor="niveau">Niveau</Label>
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
                  <Label htmlFor="dateFrom">Date début</Label>
                  <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dateTo">Date fin</Label>
                  <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

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
            {/* Communication Orale */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Communication orale (35 mn)
                </CardTitle>
                <CardDescription>
                  Étapes obligatoires : Situation d'exploration → Apprentissage systématique structuré → Intégration → Évaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="commObjet">Objet / Contenu *</Label>
                  <Input
                    id="commObjet"
                    placeholder="Ex: Présentation du module et du projet d'écriture"
                    value={commObjet}
                    onChange={(e) => setCommObjet(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="commObjectif">Précisions sur l'objectif (optionnel)</Label>
                  <Textarea
                    id="commObjectif"
                    placeholder="Ex: Informer/s'informer, Décrire/Raconter un événement, Justifier un choix"
                    value={commObjectifDetails}
                    onChange={(e) => setCommObjectifDetails(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lecture */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Lecture (45 mn)
                </CardTitle>
                <CardDescription>
                  Étapes obligatoires : Anticipation → Approche globale → Approche analytique → Lecture vocale → Étude de vocabulaire → Évaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lectureObjet">Objet / Contenu *</Label>
                  <Input
                    id="lectureObjet"
                    placeholder="Ex: Apprentie comédienne"
                    value={lectureObjet}
                    onChange={(e) => setLectureObjet(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lectureObjectif">Précisions sur l'objectif (optionnel)</Label>
                  <Textarea
                    id="lectureObjectif"
                    placeholder="Ex: Lire de manière expressive et intelligible un passage choisi"
                    value={lectureObjectifDetails}
                    onChange={(e) => setLectureObjectifDetails(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Grammaire/Conjugaison/Orthographe */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Grammaire / Conjugaison / Orthographe (35 mn)
                </CardTitle>
                <CardDescription>
                  Étapes obligatoires : Exploration → Apprentissage systématique structuré → Intégration → Évaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gramType">Type d'activité *</Label>
                  <Select value={gramType} onValueChange={(v) => setGramType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grammaire">Grammaire</SelectItem>
                      <SelectItem value="Conjugaison">Conjugaison</SelectItem>
                      <SelectItem value="Orthographe">Orthographe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gramObjet">Objet / Contenu *</Label>
                  <Input
                    id="gramObjet"
                    placeholder="Ex: Les déterminants / les noms / les pronoms personnels"
                    value={gramObjet}
                    onChange={(e) => setGramObjet(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gramObjectif">Précisions sur l'objectif (optionnel)</Label>
                  <Textarea
                    id="gramObjectif"
                    placeholder="Ex: Reconnaître et utiliser les déterminants, les noms et les pronoms personnels"
                    value={gramObjectifDetails}
                    onChange={(e) => setGramObjectifDetails(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

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
                <FileText className="h-5 w-5" />
                Résumé et génération
              </CardTitle>
              <CardDescription>Vérifiez les informations avant de générer la répartition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Unité :</strong> {uniteNumber}</div>
                  <div><strong>Module :</strong> {moduleNumber}</div>
                  <div><strong>Journée :</strong> {journeeNumber}</div>
                  <div><strong>Niveau :</strong> {niveau}</div>
                </div>
                <hr />
                <div>
                  <strong className="text-orange-700">Communication orale :</strong> {commObjet}
                </div>
                <div>
                  <strong className="text-green-700">Lecture :</strong> {lectureObjet}
                </div>
                <div>
                  <strong className="text-purple-700">{gramType} :</strong> {gramObjet}
                </div>
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
                      <FileText className="h-4 w-4" />
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
                          setCurrentResult({
                            id: item.id,
                            activities: item.activities,
                            uniteNumber: item.uniteNumber,
                            moduleNumber: item.moduleNumber,
                            journeeNumber: item.journeeNumber,
                            niveau: item.niveau,
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
