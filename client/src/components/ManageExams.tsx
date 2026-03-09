import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Loader2, Users, Upload, Trash2, FileText, Clock, Target, CheckCircle2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ManageExams() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<any>(null);
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
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updateMutation = trpc.exams.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الاختبار بنجاح!");
      utils.exams.listByCourse.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deleteMutation = trpc.exams.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الاختبار بنجاح!");
      utils.exams.listByCourse.invalidate();
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const resetForm = () => {
    setFormData({ courseId: selectedCourse || "", titleAr: "", descriptionAr: "", duration: "", passingScore: "60" });
    setEditingExam(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr || !formData.courseId || !formData.duration) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    const courseId = parseInt(formData.courseId, 10);
    const duration = parseInt(formData.duration, 10);
    const passingScore = parseInt(formData.passingScore, 10);
    if (isNaN(courseId) || isNaN(duration) || isNaN(passingScore)) {
      toast.error("قيم غير صالحة في الحقول الرقمية");
      return;
    }
    const data = { courseId, titleAr: formData.titleAr, descriptionAr: formData.descriptionAr || undefined, duration, passingScore };
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

  const handleDelete = (exam: any) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (examToDelete) {
      deleteMutation.mutate({ id: examToDelete.id });
    }
  };

  const selectedCourseName = courses?.find(c => c.id === parseInt(selectedCourse))?.titleAr;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة الاختبارات</h2>
          <p className="text-gray-600">إضافة وتعديل وحذف الاختبارات النهائية</p>
        </div>
        <div className="flex gap-2">
          <Link href="/import-exam">
            <Button variant="outline">
              <Upload className="w-4 h-4 ml-2" />
              استيراد من Google Forms
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
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
                  <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدورة" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>{course.titleAr}</SelectItem>
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
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>إلغاء</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الحفظ...</>
                    ) : (editingExam ? "تحديث" : "إنشاء")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            اختر الدورة لعرض الاختبارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full text-base">
              <SelectValue placeholder="اختر الدورة" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>{course.titleAr}</SelectItem>
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
            <>
              {/* Stats */}
              {exams && exams.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-purple-700">{exams.length}</p>
                        <p className="text-sm text-purple-600">اختبار</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-700">
                          {Math.round(exams.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / exams.length)} د
                        </p>
                        <p className="text-sm text-blue-600">متوسط المدة</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Target className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-emerald-700">
                          {Math.round(exams.reduce((sum: number, e: any) => sum + (e.passingScore || 0), 0) / exams.length)}%
                        </p>
                        <p className="text-sm text-emerald-600">متوسط درجة النجاح</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams?.map((exam: any) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{exam.titleAr}</CardTitle>
                          <CardDescription className="leading-relaxed mt-1">
                            {exam.descriptionAr || "لا يوجد وصف"}
                          </CardDescription>
                        </div>
                        <Badge variant={exam.isActive ? "default" : "secondary"}>
                          {exam.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.duration} دقيقة
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          نجاح: {exam.passingScore}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                          <Pencil className="w-3.5 h-3.5 ml-1" />
                          تعديل
                        </Button>
                        <Link href={`/admin/exam-attempts/${exam.id}`}>
                          <Button variant="secondary" size="sm" className="w-full">
                            <Users className="w-3.5 h-3.5 ml-1" />
                            المحاولات
                          </Button>
                        </Link>
                        <Link href={`/dashboard?tab=questions&examId=${exam.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-300 hover:bg-blue-50">
                            <ListChecks className="w-3.5 h-3.5 ml-1" />
                            الأسئلة
                          </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(exam)}>
                          <Trash2 className="w-3.5 h-3.5 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {exams && exams.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد اختبارات لهذه الدورة</p>
                <p className="text-gray-400 text-sm mt-1">ابدأ بإضافة اختبار جديد من الزر أعلاه</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الاختبار</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الاختبار "{examToDelete?.titleAr}"?
              <br /><br />
              <strong className="text-destructive">سيتم حذف جميع الأسئلة والمحاولات المرتبطة بهذا الاختبار. هذه العملية لا يمكن التراجع عنها.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف الاختبار"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
