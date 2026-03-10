import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookMarked, Search, Filter, Trash2, Eye, Download,
  ClipboardCheck, Calendar, BookOpen, Loader2, Plus,
  FileText, RotateCcw, Store
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useLocation } from "wouter";

interface EvalItem {
  id: number;
  title: string;
  subject?: string | null;
  level?: string | null;
  trimester?: string | null;
  evaluationType?: string | null;
  schoolYear?: string | null;
  schoolName?: string | null;
  teacherName?: string | null;
  totalPoints?: number | null;
  variant?: string | null;
  createdAt: Date;
}

const EVAL_TYPE_LABELS: Record<string, string> = {
  formative: "تكويني",
  summative: "إجمالي",
  diagnostic: "تشخيصي",
};

const EVAL_TYPE_COLORS: Record<string, string> = {
  formative: "bg-blue-100 text-blue-700 border-blue-200",
  summative: "bg-green-100 text-green-700 border-green-200",
  diagnostic: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function EvaluationLibrary() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterTrimester, setFilterTrimester] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // ── Query: قائمة التقييمات ─────────────────────────────────────────────────
  const { data, isLoading, error } = trpc.pedagogicalSheets.listEvaluations.useQuery();

  // ── Mutation: حذف تقييم ───────────────────────────────────────────────────
  const deleteMutation = trpc.pedagogicalSheets.deleteEvaluation.useMutation({
    onSuccess: () => {
      toast.success("تم حذف ورقة التقييم من المكتبة.");
      utils.pedagogicalSheets.listEvaluations.invalidate();
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(`خطأ في الحذف: ${err.message}`);
      setDeletingId(null);
    },
  });

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

  // ── Query: استرجاع تقييم كامل للتصدير ────────────────────────────────────
  const getEvalMutation = trpc.pedagogicalSheets.getEvaluation.useQuery(
    { id: 0 },
    { enabled: false }
  );

  const handleExportWord = async (item: EvalItem) => {
    // نحتاج للبيانات الكاملة من DB
    try {
      const result = await utils.pedagogicalSheets.getEvaluation.fetch({ id: item.id });
      if (result?.item?.evaluationData) {
        exportWordMutation.mutate({
          evaluation: result.item.evaluationData as Record<string, unknown>,
          includeAnswerKey: true,
          schoolName: item.schoolName || undefined,
          teacherName: item.teacherName || undefined,
          schoolYear: item.schoolYear || undefined,
        });
      }
    } catch {
      toast.error("خطأ في تحميل بيانات التقييم");
    }
  };

  const handleView = async (item: EvalItem) => {
    try {
      const result = await utils.pedagogicalSheets.getEvaluation.fetch({ id: item.id });
      if (result?.item?.evaluationData) {
        sessionStorage.setItem("loadedEvaluation", JSON.stringify({
          evaluation: result.item.evaluationData,
          schoolName: item.schoolName,
          teacherName: item.teacherName,
          schoolYear: item.schoolYear,
        }));
        navigate("/evaluation-from-sheet");
      }
    } catch {
      toast.error("خطأ في تحميل التقييم");
    }
  };

  // ── فلترة وبحث ────────────────────────────────────────────────────────────
  const items: EvalItem[] = (data?.items || []) as EvalItem[];

  const uniqueSubjects = useMemo(() => {
    const subjects = items.map(i => i.subject).filter(Boolean) as string[];
    return Array.from(new Set(subjects)).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !searchQuery ||
        (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.level || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teacherName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = filterSubject === "all" || item.subject === filterSubject;
      const matchType = filterType === "all" || item.evaluationType === filterType;
      const matchTrimester = filterTrimester === "all" || item.trimester === filterTrimester;
      return matchSearch && matchSubject && matchType && matchTrimester;
    });
  }, [items, searchQuery, filterSubject, filterType, filterTrimester]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-TN", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <BackButton to="/teacher-tools" label="أدوات المدرس" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-600" />
            <h1 className="text-lg font-bold text-gray-800">مكتبة التقييمات</h1>
          </div>
          <Badge variant="outline" className="mr-auto border-amber-300 text-amber-700 text-xs">
            {filtered.length} ورقة تقييم
          </Badge>
          <Button
            size="sm"
            onClick={() => navigate("/annual-plan")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            توليد تقييم جديد
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* شريط البحث والفلاتر */}
        <Card className="border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* بحث */}
              <div className="flex-1 min-w-48">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالعنوان أو المادة أو المدرس..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pr-9 text-sm"
                  />
                </div>
              </div>

              {/* فلتر المادة */}
              <div className="min-w-36">
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="كل المواد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المواد</SelectItem>
                    {uniqueSubjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر نوع التقييم */}
              <div className="min-w-36">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="كل الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="formative">تكويني</SelectItem>
                    <SelectItem value="summative">إجمالي</SelectItem>
                    <SelectItem value="diagnostic">تشخيصي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر الثلاثي */}
              <div className="min-w-36">
                <Select value={filterTrimester} onValueChange={setFilterTrimester}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="كل الثلاثيات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الثلاثيات</SelectItem>
                    <SelectItem value="الثلاثي الأول">الثلاثي الأول</SelectItem>
                    <SelectItem value="الثلاثي الثاني">الثلاثي الثاني</SelectItem>
                    <SelectItem value="الثلاثي الثالث">الثلاثي الثالث</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* إعادة تعيين */}
              {(searchQuery || filterSubject !== "all" || filterType !== "all" || filterTrimester !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterSubject("all");
                    setFilterType("all");
                    setFilterTrimester("all");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 ml-1" />
                  إعادة تعيين
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* قائمة التقييمات */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="mr-3 text-gray-500">جاري تحميل المكتبة...</span>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 font-medium">خطأ في تحميل المكتبة: {error.message}</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-10 pb-10 text-center">
              <BookMarked className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">
                {items.length === 0 ? "المكتبة فارغة" : "لا توجد نتائج مطابقة"}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {items.length === 0
                  ? "ابدأ بتوليد ورقة تقييم وحفظها في المكتبة"
                  : "جرّب تغيير معايير البحث أو الفلاتر"}
              </p>
              {items.length === 0 && (
                <Button
                  onClick={() => navigate("/annual-plan")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  توليد أول تقييم
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map(item => (
              <Card key={item.id} className="border-amber-200 hover:border-amber-400 hover:shadow-md transition-all">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    {/* أيقونة */}
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardCheck className="w-5 h-5 text-amber-600" />
                    </div>

                    {/* المعلومات */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.variant && item.variant !== "A" && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-1.5 py-0">
                              نسخة {item.variant}
                            </Badge>
                          )}
                          {item.evaluationType && (
                            <Badge className={`text-xs px-1.5 py-0 ${EVAL_TYPE_COLORS[item.evaluationType] || "bg-gray-100 text-gray-600"}`}>
                              {EVAL_TYPE_LABELS[item.evaluationType] || item.evaluationType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* تفاصيل */}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {item.subject && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {item.subject}
                          </span>
                        )}
                        {item.level && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {item.level}
                          </span>
                        )}
                        {item.trimester && (
                          <span className="flex items-center gap-1">
                            <Filter className="w-3 h-3" />
                            {item.trimester}
                          </span>
                        )}
                        {item.totalPoints && (
                          <span className="flex items-center gap-1 font-medium text-amber-700">
                            /{item.totalPoints} نقطة
                          </span>
                        )}
                        {item.schoolYear && (
                          <span className="text-gray-400">{item.schoolYear}</span>
                        )}
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      {(item.schoolName || item.teacherName) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {[item.schoolName, item.teacherName].filter(Boolean).join(" — ")}
                        </p>
                      )}
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* عرض */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(item)}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 h-8 px-3 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 ml-1" />
                        عرض
                      </Button>

                      {/* تحميل Word */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportWord(item)}
                        disabled={exportWordMutation.isPending}
                        className="border-green-300 text-green-700 hover:bg-green-50 h-8 px-3 text-xs"
                      >
                        {exportWordMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 ml-1" />
                        )}
                        Word
                      </Button>

                      {/* نشر في السوق */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const params = new URLSearchParams({
                            type: "evaluation",
                            title: item.title,
                            subject: item.subject || "",
                            grade: item.level || "",
                            sourceId: String(item.id),
                          });
                          navigate(`/marketplace/publish?${params.toString()}`);
                        }}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 h-8 px-3 text-xs"
                        title="نشر في السوق"
                      >
                        <Store className="w-3.5 h-3.5 ml-1" />
                        نشر
                      </Button>

                      {/* حذف */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-500 hover:bg-red-50 h-8 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف ورقة التقييم</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف "{item.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setDeletingId(item.id);
                                deleteMutation.mutate({ id: item.id });
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deleteMutation.isPending && deletingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                              ) : null}
                              حذف نهائياً
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

        {/* إحصائيات */}
        {items.length > 0 && (
          <div className="flex justify-center gap-6 py-2 text-xs text-gray-400">
            <span>إجمالي: {items.length} ورقة</span>
            <span>تكويني: {items.filter(i => i.evaluationType === "formative").length}</span>
            <span>إجمالي: {items.filter(i => i.evaluationType === "summative").length}</span>
            <span>تشخيصي: {items.filter(i => i.evaluationType === "diagnostic").length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
