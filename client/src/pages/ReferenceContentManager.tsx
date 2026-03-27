import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Plus, Pencil, Trash2, Database, BookOpen, Download, Upload, ChevronLeft, ChevronRight, Search, Filter, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function ReferenceContentManager() {
  const { user, loading } = useAuth();
  const trpcUtils = trpc.useUtils();

  // Filters
  const [filterUnite, setFilterUnite] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [page, setPage] = useState(0);
  const LIMIT = 10;

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 1,
    niveau: "6ème année",
    commOraleObjet: "",
    commOraleObjectif: "",
    commOraleRemarques: "",
    lectureObjet: "",
    lectureObjectif: "",
    lectureRemarques: "",
    grammaireType: "Grammaire" as "Grammaire" | "Conjugaison" | "Orthographe",
    grammaireObjet: "",
    grammaireObjectif: "",
    grammaireRemarques: "",
    isOfficial: true,
    source: "Programme officiel tunisien",
    notes: "",
  });

  // Queries
  const listInput = useMemo(() => ({
    uniteNumber: filterUnite !== "all" ? parseInt(filterUnite) : undefined,
    moduleNumber: filterModule !== "all" ? parseInt(filterModule) : undefined,
    limit: LIMIT,
    offset: page * LIMIT,
  }), [filterUnite, filterModule, page]);

  const { data: listData, isLoading: isListLoading } = trpc.referenceContent.list.useQuery(listInput);
  const { data: stats } = trpc.referenceContent.getStats.useQuery();

  // Mutations
  const createMutation = trpc.referenceContent.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المحتوى المرجعي بنجاح.");
      trpcUtils.referenceContent.list.invalidate();
      trpcUtils.referenceContent.getStats.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = trpc.referenceContent.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المحتوى المرجعي بنجاح.");
      trpcUtils.referenceContent.list.invalidate();
      setEditingItem(null);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = trpc.referenceContent.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المحتوى المرجعي.");
      trpcUtils.referenceContent.list.invalidate();
      trpcUtils.referenceContent.getStats.invalidate();
      setIsDeleteConfirmOpen(false);
      setDeletingId(null);
    },
  });

  const seedMutation = trpc.referenceContent.seedData.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      trpcUtils.referenceContent.list.invalidate();
      trpcUtils.referenceContent.getStats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    setForm({
      uniteNumber: 1, moduleNumber: 1, journeeNumber: 1, niveau: "6ème année",
      commOraleObjet: "", commOraleObjectif: "", commOraleRemarques: "",
      lectureObjet: "", lectureObjectif: "", lectureRemarques: "",
      grammaireType: "Grammaire", grammaireObjet: "", grammaireObjectif: "", grammaireRemarques: "",
      isOfficial: true, source: "Programme officiel tunisien", notes: "",
    });
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setForm({
      uniteNumber: item.uniteNumber,
      moduleNumber: item.moduleNumber,
      journeeNumber: item.journeeNumber,
      niveau: item.niveau,
      commOraleObjet: item.commOraleObjet || "",
      commOraleObjectif: item.commOraleObjectif || "",
      commOraleRemarques: item.commOraleRemarques || "",
      lectureObjet: item.lectureObjet || "",
      lectureObjectif: item.lectureObjectif || "",
      lectureRemarques: item.lectureRemarques || "",
      grammaireType: item.grammaireType || "Grammaire",
      grammaireObjet: item.grammaireObjet || "",
      grammaireObjectif: item.grammaireObjectif || "",
      grammaireRemarques: item.grammaireRemarques || "",
      isOfficial: item.isOfficial ?? true,
      source: item.source || "Programme officiel tunisien",
      notes: item.notes || "",
    });
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        commOraleObjet: form.commOraleObjet,
        commOraleObjectif: form.commOraleObjectif,
        commOraleRemarques: form.commOraleRemarques,
        lectureObjet: form.lectureObjet,
        lectureObjectif: form.lectureObjectif,
        lectureRemarques: form.lectureRemarques,
        grammaireType: form.grammaireType,
        grammaireObjet: form.grammaireObjet,
        grammaireObjectif: form.grammaireObjectif,
        grammaireRemarques: form.grammaireRemarques,
        isOfficial: form.isOfficial,
        source: form.source,
        notes: form.notes,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
            <p className="text-muted-foreground">هذه الصفحة متاحة للمستخدمين المسجلين فقط.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil((listData?.total || 0) / LIMIT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/repartition-journaliere">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 ml-1" />
                  العودة للتوزيع اليومي
                </Button>
              </Link>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-7 w-7" />
                قاعدة المحتوى المرجعي
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Base de données du contenu de référence — Programme officiel tunisien
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.totalEntries || 0}</div>
              <div className="text-sm text-muted-foreground">إجمالي المحتويات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats?.totalUnites || 0}</div>
              <div className="text-sm text-muted-foreground">وحدات تعلمية</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats?.totalModules || 0}</div>
              <div className="text-sm text-muted-foreground">وحدات فرعية</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending || (stats?.totalEntries || 0) > 0}
                className="w-full"
                variant={(stats?.totalEntries || 0) > 0 ? "outline" : "default"}
              >
                {seedMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Download className="h-4 w-4 ml-2" />
                )}
                {(stats?.totalEntries || 0) > 0 ? "البيانات موجودة" : "تحميل البيانات الأولية"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                U1-M1/M2 + U2-M3/M4 (20 يوم)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تصفية:</span>
              </div>
              <Select value={filterUnite} onValueChange={(v) => { setFilterUnite(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الوحدات</SelectItem>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <SelectItem key={n} value={String(n)}>Unité {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterModule} onValueChange={(v) => { setFilterModule(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="الوحدة الفرعية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الوحدات الفرعية</SelectItem>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <SelectItem key={n} value={String(n)}>Module {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة محتوى جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        {isListLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !listData?.items?.length ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بيانات مرجعية</h3>
              <p className="text-muted-foreground mb-4">
                اضغط على "تحميل البيانات الأولية" لإضافة المحتوى الرسمي للوحدات 1-4
              </p>
              <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Download className="h-4 w-4 ml-2" />}
                تحميل البيانات الأولية
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {listData.items.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setDeletingId(item.id); setIsDeleteConfirmOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Unité {item.uniteNumber}
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          Module {item.moduleNumber}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Journée {item.journeeNumber}
                        </Badge>
                        {item.isOfficial && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">رسمي</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.niveau}</p>
                    </div>
                  </div>

                  {/* 3 Activities Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3" dir="ltr">
                    {/* Communication orale */}
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center gap-1 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">Communication orale (35 mn)</span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium mb-1">{item.commOraleObjet}</p>
                      <p className="text-xs text-amber-700 line-clamp-2">{item.commOraleObjectif}</p>
                    </div>

                    {/* Lecture */}
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                      <div className="flex items-center gap-1 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">Lecture (45 mn)</span>
                      </div>
                      <p className="text-xs text-emerald-900 font-medium mb-1">{item.lectureObjet}</p>
                      <p className="text-xs text-emerald-700 line-clamp-2">{item.lectureObjectif}</p>
                    </div>

                    {/* Grammaire/Conjugaison/Orthographe */}
                    <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
                      <div className="flex items-center gap-1 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-sky-600" />
                        <span className="text-xs font-bold text-sky-700">{item.grammaireType} (35 mn)</span>
                      </div>
                      <p className="text-xs text-sky-900 font-medium mb-1">{item.grammaireObjet}</p>
                      <p className="text-xs text-sky-700 line-clamp-2">{item.grammaireObjectif}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {page + 1} من {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingItem} onOpenChange={(open) => {
        if (!open) { setIsCreateOpen(false); setEditingItem(null); resetForm(); }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingItem ? "تعديل المحتوى المرجعي" : "إضافة محتوى مرجعي جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Identifiers */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Unité</Label>
                <Select value={String(form.uniteNumber)} onValueChange={(v) => setForm(f => ({ ...f, uniteNumber: parseInt(v) }))}>
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
                <Select value={String(form.moduleNumber)} onValueChange={(v) => setForm(f => ({ ...f, moduleNumber: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Journée</Label>
                <Select value={String(form.journeeNumber)} onValueChange={(v) => setForm(f => ({ ...f, journeeNumber: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Niveau</Label>
                <Select value={form.niveau} onValueChange={(v) => setForm(f => ({ ...f, niveau: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6ème année">6ème année</SelectItem>
                    <SelectItem value="5ème année">5ème année</SelectItem>
                    <SelectItem value="4ème année">4ème année</SelectItem>
                    <SelectItem value="3ème année">3ème année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Communication orale */}
            <div className="border rounded-lg p-4 bg-amber-50/50">
              <h3 className="font-bold text-amber-700 mb-3 text-right" dir="ltr">Communication orale (35 mn)</h3>
              <div className="space-y-3">
                <div>
                  <Label>Objet (contenu)</Label>
                  <Input value={form.commOraleObjet} onChange={(e) => setForm(f => ({ ...f, commOraleObjet: e.target.value }))} dir="ltr" placeholder="Ex: Présentation du module et du projet d'écriture" />
                </div>
                <div>
                  <Label>Objectif de la séance</Label>
                  <Textarea value={form.commOraleObjectif} onChange={(e) => setForm(f => ({ ...f, commOraleObjectif: e.target.value }))} dir="ltr" placeholder="Ex: Communiquer en situation pour : Informer/s'informer..." rows={2} />
                </div>
                <div>
                  <Label>Remarques</Label>
                  <Input value={form.commOraleRemarques} onChange={(e) => setForm(f => ({ ...f, commOraleRemarques: e.target.value }))} dir="ltr" placeholder="Remarques optionnelles" />
                </div>
              </div>
            </div>

            {/* Lecture */}
            <div className="border rounded-lg p-4 bg-emerald-50/50">
              <h3 className="font-bold text-emerald-700 mb-3 text-right" dir="ltr">Lecture (45 mn)</h3>
              <div className="space-y-3">
                <div>
                  <Label>Objet (contenu)</Label>
                  <Input value={form.lectureObjet} onChange={(e) => setForm(f => ({ ...f, lectureObjet: e.target.value }))} dir="ltr" placeholder="Ex: Apprentie comédienne" />
                </div>
                <div>
                  <Label>Objectif de la séance</Label>
                  <Textarea value={form.lectureObjectif} onChange={(e) => setForm(f => ({ ...f, lectureObjectif: e.target.value }))} dir="ltr" placeholder="Ex: L'élève serait capable de lire de manière expressive..." rows={2} />
                </div>
                <div>
                  <Label>Remarques</Label>
                  <Input value={form.lectureRemarques} onChange={(e) => setForm(f => ({ ...f, lectureRemarques: e.target.value }))} dir="ltr" placeholder="Remarques optionnelles" />
                </div>
              </div>
            </div>

            {/* Grammaire/Conjugaison/Orthographe */}
            <div className="border rounded-lg p-4 bg-sky-50/50">
              <div className="flex items-center justify-between mb-3">
                <Select value={form.grammaireType} onValueChange={(v: any) => setForm(f => ({ ...f, grammaireType: v }))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grammaire">Grammaire</SelectItem>
                    <SelectItem value="Conjugaison">Conjugaison</SelectItem>
                    <SelectItem value="Orthographe">Orthographe</SelectItem>
                  </SelectContent>
                </Select>
                <h3 className="font-bold text-sky-700" dir="ltr">{form.grammaireType} (35 mn)</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Objet (contenu)</Label>
                  <Input value={form.grammaireObjet} onChange={(e) => setForm(f => ({ ...f, grammaireObjet: e.target.value }))} dir="ltr" placeholder="Ex: Les déterminants / les noms / les pronoms personnels" />
                </div>
                <div>
                  <Label>Objectif de la séance</Label>
                  <Textarea value={form.grammaireObjectif} onChange={(e) => setForm(f => ({ ...f, grammaireObjectif: e.target.value }))} dir="ltr" placeholder="Ex: Reconnaître et utiliser les déterminants..." rows={2} />
                </div>
                <div>
                  <Label>Remarques</Label>
                  <Input value={form.grammaireRemarques} onChange={(e) => setForm(f => ({ ...f, grammaireRemarques: e.target.value }))} dir="ltr" placeholder="Remarques optionnelles" />
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h3 className="font-bold text-gray-700 mb-3">معلومات إضافية</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>المصدر</Label>
                  <Input value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Programme officiel tunisien" />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingItem(null); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editingItem ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">هل أنت متأكد من حذف هذا المحتوى المرجعي؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate({ id: deletingId })} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
