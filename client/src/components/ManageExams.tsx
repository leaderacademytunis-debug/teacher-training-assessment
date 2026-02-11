import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ManageExams() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [formData, setFormData] = useState({
    courseId: "",
    titleAr: "",
    descriptionAr: "",
    duration: "",
    passingScore: "60",
  });

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: exams, isLoading } = trpc.exams.listByCourse.useQuery(
    { courseId: parseInt(selectedCourse) },
    { enabled: !!selectedCourse }
  );
  const utils = trpc.useUtils();

  const createMutation = trpc.exams.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الاختبار بنجاح!");
      utils.exams.listByCourse.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.exams.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الاختبار بنجاح!");
      utils.exams.listByCourse.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      courseId: "",
      titleAr: "",
      descriptionAr: "",
      duration: "",
      passingScore: "60",
    });
    setEditingExam(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titleAr || !formData.courseId || !formData.duration) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      courseId: parseInt(formData.courseId),
      titleAr: formData.titleAr,
      descriptionAr: formData.descriptionAr || undefined,
      duration: parseInt(formData.duration),
      passingScore: parseInt(formData.passingScore),
    };

    if (editingExam) {
      updateMutation.mutate({ id: editingExam.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      courseId: exam.courseId.toString(),
      titleAr: exam.titleAr,
      descriptionAr: exam.descriptionAr || "",
      duration: exam.duration?.toString() || "",
      passingScore: exam.passingScore?.toString() || "60",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الاختبارات</h2>
          <p className="text-gray-600">إضافة وتعديل الاختبارات النهائية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة اختبار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}</DialogTitle>
              <DialogDescription>
                املأ البيانات أدناه لإنشاء أو تعديل اختبار نهائي
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="courseId">الدورة *</Label>
                <Select 
                  value={formData.courseId} 
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.titleAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="titleAr">عنوان الاختبار *</Label>
                <Input
                  id="titleAr"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  placeholder="مثال: الاختبار النهائي"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descriptionAr">الوصف</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف تفصيلي للاختبار..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">المدة (بالدقائق) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="مثال: 60"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="passingScore">درجة النجاح (%) *</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    placeholder="مثال: 60"
                    min="0"
                    max="100"
                    required
                  />
                </div>
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
                    editingExam ? "تحديث" : "إنشاء"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Selector */}
      <Card>
        <CardHeader>
          <CardTitle>اختر الدورة لعرض الاختبارات</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الدورة" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.titleAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Exams List */}
      {selectedCourse && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams?.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle>{exam.titleAr}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {exam.descriptionAr || "لا يوجد وصف"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>المدة: {exam.duration} دقيقة</div>
                      <div>درجة النجاح: {exam.passingScore}%</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEdit(exam)}
                      >
                        <Pencil className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                      <Link href={`/admin/exam-attempts/${exam.id}`}>
                        <Button variant="secondary" className="flex-1">
                          <Users className="w-4 h-4 ml-2" />
                          المحاولات
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {exams && exams.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">لا توجد اختبارات لهذه الدورة. ابدأ بإضافة اختبار جديد.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
