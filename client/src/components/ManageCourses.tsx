import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Loader2, Trash2, RotateCcw, BookOpen, Users, Video, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "primary_teachers", label: "تأهيل مدرسي الابتدائي" },
  { value: "arabic_teachers", label: "تأهيل مدرسي العربية" },
  { value: "science_teachers", label: "تأهيل مدرسي العلوم" },
  { value: "french_teachers", label: "تأهيل مدرسي الفرنسية" },
  { value: "preschool_facilitators", label: "تأهيل منشطي التحضيري" },
  { value: "special_needs_companions", label: "تأهيل مرافقي التلاميذ ذوي الصعوبات" },
  { value: "digital_teacher_ai", label: "المعلم الرقمي والذكاء الاصطناعي" },
];

export default function ManageCourses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    titleAr: "",
    descriptionAr: "",
    category: "",
    duration: "",
  });

  // Use listAll for admin to see inactive courses too
  const { data: allCourses, isLoading } = trpc.courses.listAll.useQuery();
  const { data: activeCourses } = trpc.courses.list.useQuery();
  const utils = trpc.useUtils();

  const courses = showInactive ? allCourses : activeCourses;

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الدورة بنجاح!");
      utils.courses.list.invalidate();
      utils.courses.listAll.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الدورة بنجاح!");
      utils.courses.list.invalidate();
      utils.courses.listAll.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء تفعيل الدورة بنجاح");
      utils.courses.list.invalidate();
      utils.courses.listAll.invalidate();
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const restoreMutation = trpc.courses.restore.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة تفعيل الدورة بنجاح");
      utils.courses.list.invalidate();
      utils.courses.listAll.invalidate();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const resetForm = () => {
    setFormData({ titleAr: "", descriptionAr: "", category: "", duration: "" });
    setEditingCourse(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr || !formData.category) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    const data = {
      titleAr: formData.titleAr,
      descriptionAr: formData.descriptionAr || undefined,
      category: formData.category as any,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    };
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      titleAr: course.titleAr,
      descriptionAr: course.descriptionAr || "",
      category: course.category,
      duration: course.duration?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (course: any) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate({ id: courseToDelete.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة الدورات</h2>
          <p className="text-gray-600">إضافة وتعديل وإزالة الدورات التدريبية</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle inactive */}
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            <Label className="text-sm text-gray-600">عرض المعطلة</Label>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة دورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "تعديل الدورة" : "إضافة دورة جديدة"}</DialogTitle>
                <DialogDescription>
                  املأ البيانات أدناه لإنشاء أو تعديل دورة تدريبية
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titleAr">عنوان الدورة *</Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: تأهيل مدرسي الابتدائي"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descriptionAr">الوصف</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="وصف تفصيلي للدورة..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">المدة (بالساعات)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="مثال: 40"
                    min="1"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الحفظ...</>
                    ) : (editingCourse ? "تحديث" : "إنشاء")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{activeCourses?.length || 0}</p>
              <p className="text-sm text-emerald-600">دورات نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{allCourses?.length || 0}</p>
              <p className="text-sm text-blue-600">إجمالي الدورات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{categories.length}</p>
              <p className="text-sm text-purple-600">فئات متاحة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id} className={`relative transition-all hover:shadow-lg ${!course.isActive ? "opacity-60 border-dashed border-red-300" : ""}`}>
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {course.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <Eye className="w-3 h-3 ml-1" />
                  نشطة
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                  <EyeOff className="w-3 h-3 ml-1" />
                  معطلة
                </Badge>
              )}
            </div>

            <CardHeader className="pt-10">
              <CardTitle className="text-lg">{course.titleAr}</CardTitle>
              <CardDescription className="leading-relaxed line-clamp-2">
                {course.descriptionAr || "لا يوجد وصف"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.value === course.category)?.label || course.category}
                  </Badge>
                </div>
                {course.duration && (
                  <div className="text-gray-500">المدة: {course.duration} ساعة</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(course)}>
                  <Pencil className="w-3.5 h-3.5 ml-1" />
                  تعديل
                </Button>
                {course.isActive ? (
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(course)}>
                    <Trash2 className="w-3.5 h-3.5 ml-1" />
                    إزالة
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => restoreMutation.mutate({ id: course.id })}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5 ml-1" />
                    استعادة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!courses || courses.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد دورات حالياً</p>
            <p className="text-gray-400 text-sm mt-1">ابدأ بإضافة دورة جديدة من الزر أعلاه</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إزالة الدورة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة الدورة "{courseToDelete?.titleAr}"?
              <br /><br />
              <span className="text-amber-600 font-medium">
                سيتم تعطيل الدورة ولن تظهر للمشاركين. يمكنك استعادتها لاحقاً.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إزالة الدورة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
