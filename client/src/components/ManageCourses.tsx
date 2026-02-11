import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    titleAr: "",
    descriptionAr: "",
    category: "",
    duration: "",
  });

  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الدورة بنجاح!");
      utils.courses.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الدورة بنجاح!");
      utils.courses.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      titleAr: "",
      descriptionAr: "",
      category: "",
      duration: "",
    });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الدورات</h2>
          <p className="text-gray-600">إضافة وتعديل الدورات التدريبية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
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
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
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

              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    editingCourse ? "تحديث" : "إنشاء"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.titleAr}</CardTitle>
              <CardDescription className="leading-relaxed">
                {course.descriptionAr || "لا يوجد وصف"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>الفئة: {categories.find(c => c.value === course.category)?.label}</div>
                {course.duration && <div>المدة: {course.duration} ساعة</div>}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleEdit(course)}
              >
                <Pencil className="w-4 h-4 ml-2" />
                تعديل
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!courses || courses.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لا توجد دورات حالياً. ابدأ بإضافة دورة جديدة.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
