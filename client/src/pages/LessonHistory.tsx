import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, History, Search, Trash2, Eye, RefreshCw, BookOpen, Calendar, GraduationCap, ChevronLeft, FileText, Store } from "lucide-react";
import { toast } from "sonner";

const LEVEL_LABELS: Record<string, { ar: string; fr: string; en: string }> = {
  primary: { ar: "ابتدائي", fr: "Primaire", en: "Primary" },
  middle: { ar: "إعدادي", fr: "Collège", en: "Middle" },
  secondary: { ar: "ثانوي", fr: "Lycée", en: "Secondary" },
};

export default function LessonHistory() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: suggestions, isLoading, refetch } = trpc.pedagogicalSheets.listAiSuggestions.useQuery();
  const { data: detail, isLoading: detailLoading } = trpc.pedagogicalSheets.getAiSuggestion.useQuery(
    { id: selectedSuggestion! },
    { enabled: !!selectedSuggestion }
  );

  const deleteMutation = trpc.pedagogicalSheets.deleteAiSuggestion.useMutation({
    onSuccess: () => {
      toast.success(t("تم الحذف", "Supprimé", "Deleted"), { description: t("تم حذف الدرس من السجل", "La leçon a été supprimée de l'historique", "Lesson deleted from history") });
      refetch();
    },
    onError: () => {
      toast.error(t("خطأ", "Erreur", "Error"), { description: t("فشل الحذف", "Échec de la suppression", "Delete failed") });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("يرجى تسجيل الدخول", "Veuillez vous connecter", "Please sign in")}</p>
      </div>
    );
  }

  // Filter suggestions
  const filtered = (suggestions || []).filter(s => {
    const matchSearch = !searchQuery || 
      s.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = filterLevel === "all" || s.educationLevel === filterLevel;
    const matchSubject = filterSubject === "all" || s.subject === filterSubject;
    return matchSearch && matchLevel && matchSubject;
  });

  // Get unique subjects for filter
  const subjects = Array.from(new Set((suggestions || []).map(s => s.subject))).sort();

  const getLevelLabel = (level: string) => {
    const labels = LEVEL_LABELS[level];
    if (!labels) return level;
    return language === "ar" ? labels.ar : language === "fr" ? labels.fr : labels.en;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(
      language === "ar" ? "ar-TN" : language === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );
  };

  const handleReuseLesson = (s: typeof filtered[0]) => {
    // Navigate to teacher tools with pre-filled data
    navigate(`/teacher-tools?reuse=ai&subject=${encodeURIComponent(s.subject)}&grade=${encodeURIComponent(s.grade)}&level=${s.educationLevel}&title=${encodeURIComponent(s.lessonTitle)}&year=${encodeURIComponent(s.schoolYear)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  {t("الرئيسية", "Accueil", "Home")}
                </Button>
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-900">
                  {t("سجل الدروس المُولَّدة", "Historique des leçons générées", "Generated Lessons History")}
                </h1>
              </div>
            </div>
            <Link href="/teacher-tools">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <BookOpen className="w-4 h-4" />
                {t("إنشاء درس جديد", "Nouvelle leçon", "New Lesson")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-blue-600">{suggestions?.length || 0}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("إجمالي الدروس", "Total des leçons", "Total Lessons")}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-violet-600">
                {Array.from(new Set((suggestions || []).map(s => s.subject))).length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{t("المواد", "Matières", "Subjects")}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-green-600">
                {Array.from(new Set((suggestions || []).map(s => s.grade))).length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{t("الصفوف", "Classes", "Grades")}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-orange-600">
                {suggestions && suggestions.length > 0
                  ? formatDate(suggestions[0].createdAt).split(",")[0]
                  : "—"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{t("آخر درس", "Dernière leçon", "Last Lesson")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-sm mb-6">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t("البحث بعنوان الدرس أو المادة أو الصف...", "Rechercher par titre, matière ou classe...", "Search by title, subject or grade...")}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pe-9 text-sm"
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder={t("كل المستويات", "Tous les niveaux", "All Levels")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("كل المستويات", "Tous les niveaux", "All Levels")}</SelectItem>
                  <SelectItem value="primary">{t("ابتدائي", "Primaire", "Primary")}</SelectItem>
                  <SelectItem value="middle">{t("إعدادي", "Collège", "Middle")}</SelectItem>
                  <SelectItem value="secondary">{t("ثانوي", "Lycée", "Secondary")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("كل المواد", "Toutes les matières", "All Subjects")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("كل المواد", "Toutes les matières", "All Subjects")}</SelectItem>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {suggestions?.length === 0
                  ? t("لا توجد دروس مُولَّدة بعد", "Aucune leçon générée pour l'instant", "No lessons generated yet")
                  : t("لا توجد نتائج للبحث", "Aucun résultat trouvé", "No results found")}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {suggestions?.length === 0
                  ? t("استخدم أدوات المدرس لإنشاء درسك الأول بالذكاء الاصطناعي", "Utilisez les outils enseignant pour créer votre première leçon avec l'IA", "Use Teacher Tools to create your first AI lesson")
                  : t("جرب تغيير معايير البحث", "Essayez de modifier vos critères de recherche", "Try changing your search criteria")}
              </p>
              {suggestions?.length === 0 && (
                <Link href="/teacher-tools">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {t("إنشاء درس جديد", "Créer une leçon", "Create a Lesson")}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">
              {t(`${filtered.length} درس`, `${filtered.length} leçon(s)`, `${filtered.length} lesson(s)`)}
            </p>
            {filtered.map(s => (
              <Card key={s.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-semibold text-gray-900 text-base truncate">{s.lessonTitle}</h3>
                        <Badge variant="outline" className="text-xs shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                          {s.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {getLevelLabel(s.educationLevel)} — {s.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(s.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {s.schoolYear}
                        </span>
                      </div>
                      {s.lessonObjectives && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
                          {s.lessonObjectives.replace(/\n/g, " ").substring(0, 120)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => { setSelectedSuggestion(s.id); setDetailOpen(true); }}
                        title={t("عرض التفاصيل", "Voir les détails", "View details")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                        onClick={() => handleReuseLesson(s)}
                        title={t("إعادة الاستخدام", "Réutiliser", "Reuse")}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                          const params = new URLSearchParams({
                            type: "lesson_plan",
                            title: s.lessonTitle,
                            subject: s.subject,
                            grade: s.grade,
                            level: s.educationLevel,
                            sourceId: String(s.id),
                          });
                          navigate(`/marketplace/publish?${params.toString()}`);
                        }}
                        title={t("نشر في السوق", "Publier au marché", "Publish to Market")}
                      >
                        <Store className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            title={t("حذف", "Supprimer", "Delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("تأكيد الحذف", "Confirmer la suppression", "Confirm Delete")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(
                                `هل أنت متأكد من حذف درس "${s.lessonTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                                `Êtes-vous sûr de vouloir supprimer la leçon "${s.lessonTitle}" ? Cette action est irréversible.`,
                                `Are you sure you want to delete "${s.lessonTitle}"? This action cannot be undone.`
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("إلغاء", "Annuler", "Cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteMutation.mutate({ id: s.id })}
                            >
                              {t("حذف", "Supprimer", "Delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {detail?.lessonTitle || t("تفاصيل الدرس", "Détails de la leçon", "Lesson Details")}
            </DialogTitle>
            {detail && (
              <DialogDescription className="flex items-center gap-2 flex-wrap text-sm">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{detail.subject}</Badge>
                <span>{getLevelLabel(detail.educationLevel)} — {detail.grade}</span>
                <span>•</span>
                <span>{detail.schoolYear}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : detail ? (
            <div className="space-y-4 mt-2">
              {detail.lessonObjectives && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    {t("الأهداف والكفايات", "Objectifs et compétences", "Objectives & Competencies")}
                  </h4>
                  <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap">{detail.lessonObjectives}</p>
                </div>
              )}
              {detail.introduction && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    {t("التمهيد", "Introduction", "Introduction")}
                  </h4>
                  <p className="text-sm text-gray-600 bg-green-50 rounded-lg p-3 whitespace-pre-wrap">{detail.introduction}</p>
                </div>
              )}
              {detail.conclusion && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    {t("الخاتمة", "Conclusion", "Conclusion")}
                  </h4>
                  <p className="text-sm text-gray-600 bg-purple-50 rounded-lg p-3 whitespace-pre-wrap">{detail.conclusion}</p>
                </div>
              )}
              {detail.evaluation && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                    {t("التقييم", "Évaluation", "Evaluation")}
                  </h4>
                  <p className="text-sm text-gray-600 bg-orange-50 rounded-lg p-3 whitespace-pre-wrap">{detail.evaluation}</p>
                </div>
              )}
              {detail.materials && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                    {t("الوسائل", "Moyens", "Materials")}
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.materials}</p>
                </div>
              )}
              {!detail.lessonObjectives && !detail.introduction && detail.rawSuggestion && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5">{t("محتوى الدرس الكامل", "Contenu complet de la leçon", "Full Lesson Content")}</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.rawSuggestion}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => { setDetailOpen(false); handleReuseLesson(detail); }}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("إعادة الاستخدام", "Réutiliser cette leçon", "Reuse this Lesson")}
                </Button>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  {t("إغلاق", "Fermer", "Close")}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
