/**
 * Courses Management Component
 * Features: View courses, Create/Edit, Track enrollments, Send notifications
 * NOW USING REAL DATABASE QUERIES
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// Toast notifications will be handled with simple alerts
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, Calendar, Users, MessageSquare,
  Search, Filter, Download, Send, X, Check, AlertCircle, Clock, Loader2, BookOpen, Upload, Image as ImageIcon
} from "lucide-react";

// ===== COURSES LIST SECTION =====
function CoursesListSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Real API calls
  const { data: courses, isLoading, refetch } = trpc.coursesManagement.getAllCourses.useQuery();
  const deleteMutation = trpc.coursesManagement.deleteCourse.useMutation();
  const updateMutation = trpc.coursesManagement.updateCourse.useMutation();

  const filteredCourses = useMemo(() => {
    return (courses || []).filter((course) =>
      course.titleAr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleDelete = async (courseId: number) => {
    try {
      await deleteMutation.mutateAsync({ courseId });
      alert("تم حذف التكوين بنجاح");
      refetch();
      setShowDeleteConfirm(false);
      setSelectedCourse(null);
    } catch (error: any) {
      alert("خطأ: " + (error.message || "فشل حذف التكوين"));
    }
  };

  const handleToggleStatus = async (courseId: number, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({
        courseId,
        isActive: !isActive,
      });
      alert("تم تحديث حالة التكوين بنجاح");
      refetch();
    } catch (error: any) {
      alert("خطأ: " + (error.message || "فشل تحديث التكوين"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="ابحث عن تكوين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Courses Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white">
              <thead className="border-b border-slate-700 bg-slate-800/50">
                <tr>
                  <th className="text-right py-3 px-4">اسم التكوين</th>
                  <th className="text-right py-3 px-4">المسجلون</th>
                  <th className="text-right py-3 px-4">السعر (TND)</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                  <th className="text-right py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium">{course.titleAr}</td>
                    <td className="py-3 px-4">{course.enrollmentCount}</td>
                    <td className="py-3 px-4">{course.price || "مجاني"}</td>
                    <td className="py-3 px-4">
                      <Badge className={course.isActive ? "bg-green-600" : "bg-slate-600"}>
                        {course.isActive ? "نشط" : "مخفي"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(course.createdAt).toLocaleDateString("ar-TN")}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(course.id, course.isActive)}
                        className="p-2 hover:bg-slate-700 rounded"
                        title={course.isActive ? "إخفاء" : "إظهار"}
                      >
                        {course.isActive ? (
                          <Eye className="h-4 w-4 text-blue-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 hover:bg-slate-700 rounded"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-slate-400">
              هل أنت متأكد من حذف هذا التكوين؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-slate-800 border-slate-700"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCourse && handleDelete(selectedCourse)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== ENROLLMENT TRACKING SECTION =====
function EnrollmentTrackingSection() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Get courses for dropdown
  const { data: courses, isLoading: coursesLoading } = trpc.coursesManagement.getAllCourses.useQuery();
  
  // Get enrollments for selected course
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.coursesManagement.getEnrollments.useQuery(
    { courseId: selectedCourseId || 0 },
    { enabled: selectedCourseId !== null }
  );

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <Select value={selectedCourseId?.toString() || ""} onValueChange={(v) => setSelectedCourseId(parseInt(v))}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder="اختر تكويناً لعرض المسجلين..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {(courses || []).map((course) => (
            <SelectItem key={course.id} value={course.id.toString()}>
              {course.titleAr} ({course.enrollmentCount} مسجل)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Enrollments Table */}
      {selectedCourseId && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>المسجلون في التكوين</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {enrollmentsLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="text-right py-3 px-4">اسم المعلم</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">تاريخ التسجيل</th>
                      <th className="text-right py-3 px-4">نسبة الإتمام</th>
                      <th className="text-right py-3 px-4">الشهادة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(enrollments || []).map((enrollment) => (
                      <tr key={enrollment.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">{enrollment.userName}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{enrollment.email}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {new Date(enrollment.enrolledAt).toLocaleDateString("ar-TN")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${enrollment.completionRate}%` }}
                              />
                            </div>
                            <span className="text-xs">{enrollment.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {enrollment.hasCertificate ? (
                            <Badge className="bg-green-600">✓ حاصل</Badge>
                          ) : (
                            <Badge className="bg-slate-600">قيد الإنجاز</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== SEND MESSAGES SECTION =====
function SendMessagesSection() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  // Get courses
  const { data: courses, isLoading: coursesLoading } = trpc.coursesManagement.getAllCourses.useQuery();
  
  // Send message mutation
  const sendMutation = trpc.coursesManagement.sendMessageToEnrollees.useMutation();

  const handleSendMessage = async () => {
    if (!selectedCourseId || !message.trim()) {
      alert("اختر تكويناً واكتب رسالة");
      return;
    }

    try {
      await sendMutation.mutateAsync({
        courseId: selectedCourseId,
        message,
        subject,
      });
      alert("تم إرسال الرسالة للمسجلين بنجاح");
      setMessage("");
      setSubject("");
    } catch (error: any) {
      alert("خطأ: " + (error.message || "فشل إرسال الرسالة"));
    }
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>إرسال رسالة للمسجلين</CardTitle>
          <CardDescription className="text-slate-400">
            أرسل رسالة لجميع المسجلين في تكوين محدد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Selection */}
          <div>
            <Label className="text-slate-300 mb-2 block">اختر التكوين</Label>
            <Select value={selectedCourseId?.toString() || ""} onValueChange={(v) => setSelectedCourseId(parseInt(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="اختر تكويناً..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {(courses || []).map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.titleAr} ({course.enrollmentCount} مسجل)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label className="text-slate-300 mb-2 block">الموضوع (اختياري)</Label>
            <Input
              placeholder="موضوع الرسالة..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Message */}
          <div>
            <Label className="text-slate-300 mb-2 block">الرسالة</Label>
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white min-h-32"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={sendMutation.isPending || !selectedCourseId || !message.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                إرسال الرسالة
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== CREATE COURSE SECTION =====
function CreateCourseSection() {
  const [formData, setFormData] = useState({
    titleAr: "",
    titleFr: "",
    descriptionAr: "",
    descriptionFr: "",
    duration: "",
    price: "",
    isActive: true,
    videoUrl: "",
    coverImageUrl: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const createMutation = trpc.coursesManagement.createCourse.useMutation();
  const { data: courses, refetch } = trpc.coursesManagement.getAllCourses.useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.titleFr.trim()) {
      alert("يجب إدخال العنوان بالعربية والفرنسية");
      return;
    }

    try {
      await createMutation.mutateAsync({
        titleAr: formData.titleAr,
        titleFr: formData.titleFr,
        descriptionAr: formData.descriptionAr,
        descriptionFr: formData.descriptionFr,
        duration: parseInt(formData.duration) || 0,
        price: formData.price ? parseFloat(formData.price) : null,
        isActive: formData.isActive,
        videoUrl: formData.videoUrl,
        coverImageBase64: coverImagePreview.split(',')[1] || '',
      });
      alert("تم إنشاء التكوين بنجاح");
      setFormData({
        titleAr: "",
        titleFr: "",
        descriptionAr: "",
        descriptionFr: "",
        duration: "",
        price: "",
        isActive: true,
        videoUrl: "",
        coverImageUrl: "",
      });
      setCoverImageFile(null);
      setCoverImagePreview("");
      refetch();
    } catch (error: any) {
      alert("خطأ: " + (error.message || "فشل إنشاء التكوين"));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>إنشاء تكوين جديد</CardTitle>
          <CardDescription className="text-slate-400">
            أضف تكويناً جديداً إلى المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Arabic Title */}
            <div>
              <Label className="text-slate-300 mb-2 block">العنوان (عربي) *</Label>
              <Input
                placeholder="مثال: دورة الرياضيات المتقدمة"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* French Title */}
            <div>
              <Label className="text-slate-300 mb-2 block">العنوان (فرنسي) *</Label>
              <Input
                placeholder="Exemple: Cours de Mathématiques Avancées"
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Arabic Description */}
            <div>
              <Label className="text-slate-300 mb-2 block">الوصف (عربي)</Label>
              <Textarea
                placeholder="وصف التكوين والأهداف..."
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-24"
              />
            </div>

            {/* French Description */}
            <div>
              <Label className="text-slate-300 mb-2 block">الوصف (فرنسي)</Label>
              <Textarea
                placeholder="Description du cours et objectifs..."
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-24"
              />
            </div>

            {/* Duration */}
            <div>
              <Label className="text-slate-300 mb-2 block">المدة (بالساعات)</Label>
              <Input
                type="number"
                placeholder="مثال: 20"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-slate-300 mb-2 block">السعر (TND) - اتركه فارغاً للمجاني</Label>
              <Input
                type="number"
                placeholder="مثال: 150"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Video URL */}
            <div>
              <Label className="text-slate-300 mb-2 block">رابط الفيديو التعريفي</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label className="text-slate-300 mb-2 block">صورة الغلاف</Label>
              <div className="flex flex-col gap-3">
                {coverImagePreview && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageFile(null);
                        setCoverImagePreview("");
                        setFormData({ ...formData, coverImageUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setCoverImagePreview(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="coverImageInput"
                />
                <label
                  htmlFor="coverImageInput"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 bg-slate-800/50"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">اضغط لاختيار صورة الغلاف</span>
                </label>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label className="text-slate-300">نشر التكوين الآن</Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء التكوين
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== MAIN COURSES MANAGEMENT =====
export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "enrollments" | "messages">("list");

  const tabs = [
    { id: "list", label: "التكوينات", icon: BookOpen },
    { id: "create", label: "إنشاء جديد", icon: Plus },
    { id: "enrollments", label: "المسجلون", icon: Users },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "list" && <CoursesListSection />}
      {activeTab === "create" && <CreateCourseSection />}
      {activeTab === "enrollments" && <EnrollmentTrackingSection />}
      {activeTab === "messages" && <SendMessagesSection />}
    </div>
  );
}
