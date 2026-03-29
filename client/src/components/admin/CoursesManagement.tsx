/**
 * Courses Management Component
 * Features: View courses, Create/Edit, Track enrollments, Send notifications
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, Calendar, Users, MessageSquare,
  Search, Filter, Download, Send, X, Check, AlertCircle, Clock
} from "lucide-react";

// ===== TYPES =====
interface Course {
  id: string;
  titleAr: string;
  titleFr: string;
  description: string;
  objectives: string;
  duration: number; // hours
  price: number; // TND, 0 = free
  coverImage: string;
  status: "published" | "draft";
  videoUrl: string;
  rating: number;
  enrolledCount: number;
  createdAt: string;
}

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  enrolledDate: string;
  completionRate: number;
  hasCertificate: boolean;
}

// ===== MOCK DATA =====
const MOCK_COURSES: Course[] = [
  {
    id: "1",
    titleAr: "المعلم الرقمي والذكاء الاصطناعي",
    titleFr: "L'Enseignant Numérique et l'IA",
    description: "دورة شاملة في توظيف الذكاء الاصطناعي في التدريس",
    objectives: "تعلم استخدام أدوات AI في إعداد الدروس والتقييمات",
    duration: 40,
    price: 150,
    coverImage: "https://via.placeholder.com/300x200?text=Course1",
    status: "published",
    videoUrl: "https://youtube.com/watch?v=example",
    rating: 4.8,
    enrolledCount: 245,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    titleAr: "تأهيل مدرسي الابتدائي",
    titleFr: "Formation des Enseignants Primaires",
    description: "برنامج تأهيل شامل لمعلمي المرحلة الابتدائية",
    objectives: "تطوير المهارات التربوية والرقمية",
    duration: 60,
    price: 200,
    coverImage: "https://via.placeholder.com/300x200?text=Course2",
    status: "published",
    videoUrl: "https://youtube.com/watch?v=example",
    rating: 4.9,
    enrolledCount: 180,
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    titleAr: "تأهيل مرافقي التلاميذ ذوي الصعوبات",
    titleFr: "Formation des Accompagnateurs",
    description: "تأهيل المرافقين للتعامل مع التلاميذ ذوي صعوبات التعلم",
    objectives: "تطوير مهارات الدعم والمساعدة التربوية",
    duration: 45,
    price: 0,
    coverImage: "https://via.placeholder.com/300x200?text=Course3",
    status: "published",
    videoUrl: "https://youtube.com/watch?v=example",
    rating: 4.7,
    enrolledCount: 95,
    createdAt: "2024-03-05",
  },
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  { id: "e1", studentName: "أحمد محمود", studentEmail: "ahmed@example.com", enrolledDate: "2024-01-20", completionRate: 85, hasCertificate: true },
  { id: "e2", studentName: "فاطمة علي", studentEmail: "fatima@example.com", enrolledDate: "2024-01-22", completionRate: 60, hasCertificate: false },
  { id: "e3", studentName: "محمد حسن", studentEmail: "mohammad@example.com", enrolledDate: "2024-01-25", completionRate: 100, hasCertificate: true },
  { id: "e4", studentName: "سارة إبراهيم", studentEmail: "sarah@example.com", enrolledDate: "2024-02-01", completionRate: 45, hasCertificate: false },
  { id: "e5", studentName: "علي أحمد", studentEmail: "ali@example.com", enrolledDate: "2024-02-05", completionRate: 95, hasCertificate: true },
];

// ===== COURSES LIST SECTION =====
function CoursesListSection() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.titleAr.includes(searchTerm) || course.titleFr.includes(searchTerm);
      const matchesStatus = filterStatus === "all" || course.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, filterStatus]);

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
    setShowDeleteConfirm(false);
    setSelectedCourse(null);
  };

  const toggleStatus = (courseId: string) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId ? { ...c, status: c.status === "published" ? "draft" : "published" } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="ابحث عن تكوين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التكوينات</SelectItem>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Table */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardHeader>
          <CardTitle>التكوينات المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-4 text-slate-400">الاسم</th>
                  <th className="text-right py-3 px-4 text-slate-400">المسجلون</th>
                  <th className="text-right py-3 px-4 text-slate-400">الحالة</th>
                  <th className="text-right py-3 px-4 text-slate-400">التقييم</th>
                  <th className="text-right py-3 px-4 text-slate-400">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 text-slate-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">{course.titleAr}</p>
                        <p className="text-xs text-slate-400">{course.titleFr}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-400" />
                        {course.enrolledCount}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={course.status === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}
                      >
                        {course.status === "published" ? "منشور" : "مسودة"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        {course.rating}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{course.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(course.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {course.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-blue-400">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <DialogTitle>حذف التكوين</DialogTitle>
            <DialogDescription className="text-slate-400">
              هل أنت متأكد من حذف التكوين "{selectedCourse?.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-slate-600 text-slate-300">
              إلغاء
            </Button>
            <Button
              onClick={() => selectedCourse && handleDelete(selectedCourse.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== CREATE/EDIT COURSE SECTION =====
function CreateCourseSection() {
  const [formData, setFormData] = useState({
    titleAr: "",
    titleFr: "",
    description: "",
    objectives: "",
    duration: "",
    price: "",
    videoUrl: "",
    status: "draft" as "draft" | "published",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader>
        <CardTitle>إنشاء تكوين جديد</CardTitle>
        <CardDescription className="text-slate-400">أضف تكوين جديد إلى المنصة</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">العنوان (عربي)</Label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="أدخل العنوان بالعربية"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">العنوان (فرنسي)</Label>
              <Input
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                placeholder="Entrez le titre en français"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Description and Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف التكوين"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
            <div>
              <Label className="text-slate-300">الأهداف</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="أدخل أهداف التكوين"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
          </div>

          {/* Duration, Price, Video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">المدة (بالساعات)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="40"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">السعر (TND)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0 = مجاني"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">رابط الفيديو التعريفي</Label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-slate-300">حالة النشر</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
              <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="published">منشور</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 ms-2" />
            إنشاء التكوين
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ===== ENROLLMENT TRACKING SECTION =====
function EnrollmentTrackingSection() {
  const [selectedCourseId, setSelectedCourseId] = useState("1");
  const [enrollments, setEnrollments] = useState<Enrollment[]>(MOCK_ENROLLMENTS);

  const selectedCourse = MOCK_COURSES.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div>
        <Label className="text-slate-300">اختر التكوين</Label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOCK_COURSES.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.titleAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments Table */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardHeader>
          <CardTitle>المسجلون في "{selectedCourse?.titleAr}"</CardTitle>
          <CardDescription className="text-slate-400">
            {enrollments.length} مسجل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-4 text-slate-400">اسم المعلم</th>
                  <th className="text-right py-3 px-4 text-slate-400">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 text-slate-400">تاريخ التسجيل</th>
                  <th className="text-right py-3 px-4 text-slate-400">نسبة الإتمام</th>
                  <th className="text-right py-3 px-4 text-slate-400">الشهادة</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-semibold">{enrollment.studentName}</td>
                    <td className="py-3 px-4 text-slate-400">{enrollment.studentEmail}</td>
                    <td className="py-3 px-4 text-slate-400">{enrollment.enrolledDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${enrollment.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{enrollment.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {enrollment.hasCertificate ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="h-3 w-3 ms-1" />
                          نعم
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                          لا
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== SEND NOTIFICATION SECTION =====
function SendNotificationSection() {
  const [selectedCourseId, setSelectedCourseId] = useState("1");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);

  const selectedCourse = MOCK_COURSES.find((c) => c.id === selectedCourseId);

  const handleSendMessage = async () => {
    if (!subject || !message) return;
    setIsSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setSubject("");
    setMessage("");
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader>
        <CardTitle>إرسال رسالة للمسجلين</CardTitle>
        <CardDescription className="text-slate-400">
          أرسل رسالة إلى جميع المسجلين في تكوين محدد
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Selection */}
        <div>
          <Label className="text-slate-300">اختر التكوين</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_COURSES.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.titleAr} ({course.enrolledCount} مسجل)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div>
          <Label className="text-slate-300">الموضوع</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="أدخل موضوع الرسالة"
            className="mt-2 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {/* Message */}
        <div>
          <Label className="text-slate-300">الرسالة</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="أدخل محتوى الرسالة..."
            className="mt-2 bg-slate-800 border-slate-700 text-white"
            rows={6}
          />
          <p className="text-xs text-slate-400 mt-2">
            سيتم إرسال هذه الرسالة إلى {selectedCourse?.enrolledCount} مسجل
          </p>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={!subject || !message || isSending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <>
              <Clock className="h-4 w-4 animate-spin ms-2" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 ms-2" />
              إرسال الرسالة
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ===== MAIN COURSES MANAGEMENT COMPONENT =====
export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "enrollments" | "notifications">("list");

  return (
    <div className="space-y-6" dir="rtl">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
        {[
          { id: "list", label: "📋 عرض التكوينات" },
          { id: "create", label: "➕ إنشاء تكوين" },
          { id: "enrollments", label: "👥 تتبع التسجيلات" },
          { id: "notifications", label: "💬 إرسال رسائل" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "list" && <CoursesListSection />}
      {activeTab === "create" && <CreateCourseSection />}
      {activeTab === "enrollments" && <EnrollmentTrackingSection />}
      {activeTab === "notifications" && <SendNotificationSection />}
    </div>
  );
}
