import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Plus, Pencil, Trash2, Database, BookOpen, ChevronLeft, ChevronRight, Filter, Loader2, X } from "lucide-react";
import { Link } from "wouter";

interface ActivityForm {
  activityName: string;
  objet: string;
  objectifSpecifique: string;
  objectif: string;
  etapes: string[];
  remarques: string;
  duration: string;
}

const EMPTY_ACTIVITY: ActivityForm = {
  activityName: "",
  objet: "",
  objectifSpecifique: "",
  objectif: "",
  etapes: [],
  remarques: "",
  duration: "",
};

const ACTIVITY_COLORS = [
  { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: "text-amber-600" },
  { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: "text-emerald-600" },
  { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-700", icon: "text-sky-600" },
  { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", icon: "text-purple-600" },
  { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", icon: "text-rose-600" },
];

export default function ReferenceContentManager() {
  const { user, loading } = useAuth();
  const trpcUtils = trpc.useUtils();

  // Filters
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
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
  const [formMeta, setFormMeta] = useState({
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 1,
    niveau: "6ème année",
    sousTheme: "",
    isOfficial: true,
    source: "Programme officiel tunisien",
    notes: "",
  });
  const [formActivities, setFormActivities] = useState<ActivityForm[]>([{ ...EMPTY_ACTIVITY }]);

  // Queries
  const listInput = useMemo(() => ({
    niveau: filterNiveau !== "all" ? filterNiveau : undefined,
    uniteNumber: filterUnite !== "all" ? parseInt(filterUnite) : undefined,
    moduleNumber: filterModule !== "all" ? parseInt(filterModule) : undefined,
    limit: LIMIT,
    offset: page * LIMIT,
  }), [filterNiveau, filterUnite, filterModule, page]);

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
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.referenceContent.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المحتوى المرجعي بنجاح.");
      trpcUtils.referenceContent.list.invalidate();
      setEditingItem(null);
    },
    onError: (err) => toast.error(err.message),
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

  const resetForm = () => {
    setFormMeta({
      uniteNumber: 1, moduleNumber: 1, journeeNumber: 1, niveau: "6ème année",
      sousTheme: "", isOfficial: true, source: "Programme officiel tunisien", notes: "",
    });
    setFormActivities([{ ...EMPTY_ACTIVITY }]);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormMeta({
      uniteNumber: item.uniteNumber,
      moduleNumber: item.moduleNumber,
      journeeNumber: item.journeeNumber,
      niveau: item.niveau,
      sousTheme: item.sousTheme || "",
      isOfficial: item.isOfficial ?? true,
      source: item.source || "Programme officiel tunisien",
      notes: item.notes || "",
    });
    const acts = (item.activities || []).map((a: any) => ({
      activityName: a.activityName || "",
      objet: a.objet || "",
      objectifSpecifique: a.objectifSpecifique || "",
      objectif: a.objectif || "",
      etapes: a.etapes || [],
      remarques: a.remarques || "",
      duration: a.duration || "",
    }));
    setFormActivities(acts.length > 0 ? acts : [{ ...EMPTY_ACTIVITY }]);
  };

  const addActivity = () => {
    setFormActivities(prev => [...prev, { ...EMPTY_ACTIVITY }]);
  };

  const removeActivity = (index: number) => {
    setFormActivities(prev => prev.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: keyof ActivityForm, value: any) => {
    setFormActivities(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const handleSubmit = () => {
    // Clean activities - remove empty optional fields
    const cleanActivities = formActivities.map(a => {
      const clean: any = {
        activityName: a.activityName,
        objet: a.objet,
        objectif: a.objectif,
        etapes: a.etapes.filter(e => e.trim()),
      };
      if (a.objectifSpecifique?.trim()) clean.objectifSpecifique = a.objectifSpecifique;
      if (a.remarques?.trim()) clean.remarques = a.remarques;
      if (a.duration?.trim()) clean.duration = a.duration;
      return clean;
    });

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        sousTheme: formMeta.sousTheme || undefined,
        activities: cleanActivities,
        isOfficial: formMeta.isOfficial,
        source: formMeta.source,
        notes: formMeta.notes || undefined,
      });
    } else {
      createMutation.mutate({
        ...formMeta,
        sousTheme: formMeta.sousTheme || undefined,
        activities: cleanActivities,
        notes: formMeta.notes || undefined,
      });
    }
  };

  const is3to5 = formMeta.niveau === "3ème année" || formMeta.niveau === "4ème année" || formMeta.niveau === "5ème année";

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
                قاعدة المحتوى المرجعي (Smart Autofill)
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
              <div className="text-3xl font-bold text-indigo-600">{stats?.totalNiveaux || 0}</div>
              <div className="text-sm text-muted-foreground">مستويات دراسية</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats?.totalModules || 0}</div>
              <div className="text-sm text-muted-foreground">وحدات فرعية</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.totalUnites || 0}</div>
              <div className="text-sm text-muted-foreground">وحدات تعلمية</div>
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
              <Select value={filterNiveau} onValueChange={(v) => { setFilterNiveau(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المستويات</SelectItem>
                  <SelectItem value="3ème année">3ème année</SelectItem>
                  <SelectItem value="4ème année">4ème année</SelectItem>
                  <SelectItem value="5ème année">5ème année</SelectItem>
                  <SelectItem value="6ème année">6ème année</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterUnite} onValueChange={(v) => { setFilterUnite(v); setPage(0); }}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[140px]">
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
                اضغط على "إضافة محتوى جديد" لإضافة المحتوى الرسمي
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {listData.items.map((item: any) => {
              const activities = item.activities || [];
              return (
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {item.niveau}
                          </Badge>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            U{item.uniteNumber} / M{item.moduleNumber}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            J{item.journeeNumber}
                          </Badge>
                          {item.sousTheme && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              {item.sousTheme}
                            </Badge>
                          )}
                          {item.isOfficial && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">رسمي</Badge>
                          )}
                          <Badge variant="secondary">{activities.length} أنشطة</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Activities Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3" dir="ltr">
                      {activities.map((act: any, idx: number) => {
                        const color = ACTIVITY_COLORS[idx % ACTIVITY_COLORS.length];
                        return (
                          <div key={idx} className={`${color.bg} rounded-lg p-3 border ${color.border}`}>
                            <div className="flex items-center gap-1 mb-2">
                              <BookOpen className={`h-3.5 w-3.5 ${color.icon}`} />
                              <span className={`text-xs font-bold ${color.text}`}>
                                {act.activityName}
                                {act.duration && ` (${act.duration})`}
                              </span>
                            </div>
                            <p className="text-xs font-medium mb-1 line-clamp-1">{act.objet}</p>
                            <p className="text-xs opacity-75 line-clamp-2">{act.objectif}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingItem ? "تعديل المحتوى المرجعي" : "إضافة محتوى مرجعي جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Identifiers */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label>Niveau</Label>
                <Select value={formMeta.niveau} onValueChange={(v) => setFormMeta(f => ({ ...f, niveau: v }))}>
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
                <Label>Unité</Label>
                <Select value={String(formMeta.uniteNumber)} onValueChange={(v) => setFormMeta(f => ({ ...f, uniteNumber: parseInt(v) }))}>
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
                <Select value={String(formMeta.moduleNumber)} onValueChange={(v) => setFormMeta(f => ({ ...f, moduleNumber: parseInt(v) }))}>
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
                <Select value={String(formMeta.journeeNumber)} onValueChange={(v) => setFormMeta(f => ({ ...f, journeeNumber: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(n => (
                      <SelectItem key={n} value={String(n)}>J{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {is3to5 && (
                <div>
                  <Label>Sous-thème</Label>
                  <Input value={formMeta.sousTheme} onChange={(e) => setFormMeta(f => ({ ...f, sousTheme: e.target.value }))} dir="ltr" placeholder="Ex: Vive l'école" />
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={addActivity} className="gap-1">
                  <Plus className="h-4 w-4" />
                  إضافة نشاط
                </Button>
                <h3 className="font-bold">الأنشطة ({formActivities.length})</h3>
              </div>

              {formActivities.map((act, idx) => {
                const color = ACTIVITY_COLORS[idx % ACTIVITY_COLORS.length];
                return (
                  <div key={idx} className={`border rounded-lg p-4 ${color.bg}/50 relative`}>
                    {formActivities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 left-2 h-6 w-6 p-0 text-destructive"
                        onClick={() => removeActivity(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <h4 className={`font-bold ${color.text} mb-3 text-right`}>
                      النشاط {idx + 1}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nom de l'activité</Label>
                        <Input
                          value={act.activityName}
                          onChange={(e) => updateActivity(idx, "activityName", e.target.value)}
                          dir="ltr"
                          placeholder="Ex: Communication orale"
                        />
                      </div>
                      <div>
                        <Label>Objet (contenu)</Label>
                        <Input
                          value={act.objet}
                          onChange={(e) => updateActivity(idx, "objet", e.target.value)}
                          dir="ltr"
                          placeholder="Ex: Présenter / Se présenter"
                        />
                      </div>
                      {is3to5 && (
                        <div>
                          <Label>Objectifs spécifiques</Label>
                          <Textarea
                            value={act.objectifSpecifique}
                            onChange={(e) => updateActivity(idx, "objectifSpecifique", e.target.value)}
                            dir="ltr"
                            placeholder="Ex: Discriminer auditivement les phonèmes-graphèmes"
                            rows={2}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Objectif de la séance</Label>
                        <Textarea
                          value={act.objectif}
                          onChange={(e) => updateActivity(idx, "objectif", e.target.value)}
                          dir="ltr"
                          placeholder="Ex: L'élève serait capable de..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Étapes (une par ligne)</Label>
                        <Textarea
                          value={act.etapes.join("\n")}
                          onChange={(e) => updateActivity(idx, "etapes", e.target.value.split("\n"))}
                          dir="ltr"
                          placeholder={"Exploration\nApprentissage systématique\nIntégration\nÉvaluation"}
                          rows={3}
                        />
                      </div>
                      {formMeta.niveau === "6ème année" && (
                        <>
                          <div>
                            <Label>Durée</Label>
                            <Input
                              value={act.duration}
                              onChange={(e) => updateActivity(idx, "duration", e.target.value)}
                              dir="ltr"
                              placeholder="Ex: 35 mn"
                            />
                          </div>
                          <div>
                            <Label>Remarques</Label>
                            <Input
                              value={act.remarques}
                              onChange={(e) => updateActivity(idx, "remarques", e.target.value)}
                              dir="ltr"
                              placeholder="Remarques optionnelles"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h3 className="font-bold text-gray-700 mb-3">معلومات إضافية</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>المصدر</Label>
                  <Input value={formMeta.source} onChange={(e) => setFormMeta(f => ({ ...f, source: e.target.value }))} placeholder="Programme officiel tunisien" />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Input value={formMeta.notes} onChange={(e) => setFormMeta(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
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
