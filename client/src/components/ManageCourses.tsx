import { useState, useMemo, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Loader2, Trash2, RotateCcw, BookOpen, Users, Clock, Eye, EyeOff, Star, DollarSign, Image, Package, GripVertical, X, Tag, Calendar, Layers, Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "primary_teachers", label: "تأهيل مدرسي الابتدائي", color: "bg-blue-100 text-blue-700" },
  { value: "arabic_teachers", label: "تأهيل مدرسي العربية", color: "bg-emerald-100 text-emerald-700" },
  { value: "science_teachers", label: "تأهيل مدرسي العلوم", color: "bg-purple-100 text-purple-700" },
  { value: "french_teachers", label: "تأهيل مدرسي الفرنسية", color: "bg-rose-100 text-rose-700" },
  { value: "preschool_facilitators", label: "تأهيل منشطي التحضيري", color: "bg-amber-100 text-amber-700" },
  { value: "special_needs_companions", label: "مرافقة ذوي صعوبات التعلّم", color: "bg-teal-100 text-teal-700" },
  { value: "digital_teacher_ai", label: "المعلم الرقمي والذكاء الاصطناعي", color: "bg-indigo-100 text-indigo-700" },
  { value: "bundle", label: "باقة شاملة", color: "bg-orange-100 text-orange-700" },
];

interface CourseFormData {
  titleAr: string;
  descriptionAr: string;
  descriptionShortAr: string;
  category: string;
  duration: string;
  price: string;
  originalPrice: string;
  coverImageUrl: string;
  axes: string[];
  schedule: string;
  isBundle: boolean;
  bundleCourseIds: number[];
  isFeatured: boolean;
  sortOrder: string;
}

const emptyForm: CourseFormData = {
  titleAr: "",
  descriptionAr: "",
  descriptionShortAr: "",
  category: "",
  duration: "",
  price: "",
  originalPrice: "",
  coverImageUrl: "",
  axes: [],
  schedule: "",
  isBundle: false,
  bundleCourseIds: [],
  isFeatured: false,
  sortOrder: "0",
};

export default function ManageCourses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState<CourseFormData>({ ...emptyForm });
  const [newAxis, setNewAxis] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allCourses, isLoading } = trpc.courses.listAll.useQuery();
  const { data: activeCourses } = trpc.courses.list.useQuery();
  const utils = trpc.useUtils();

  const filteredCourses = useMemo(() => {
    const base = showInactive ? allCourses : activeCourses;
    if (!base) return [];
    if (filterCategory === "all") return base;
    return base.filter((c: any) => c.category === filterCategory);
  }, [allCourses, activeCourses, showInactive, filterCategory]);

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

  const uploadImageMutation = trpc.courses.uploadCoverImage.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, coverImageUrl: data.url }));
      toast.success("تم رفع الصورة بنجاح!");
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error("فشل رفع الصورة: " + error.message);
      setIsUploading(false);
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("الرجاء اختيار ملف صورة فقط (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const ext = file.name.split('.').pop() || 'jpg';
      uploadImageMutation.mutate({
        base64Data: base64,
        fileExtension: ext,
        mimeType: file.type,
        courseId: editingCourse?.id,
      });
    };
    reader.readAsDataURL(file);
  }, [editingCourse, uploadImageMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingCourse(null);
    setNewAxis("");
    setActiveTab("basic");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr || !formData.category) {
      toast.error("الرجاء ملء عنوان الدورة والفئة على الأقل");
      return;
    }
    const data: any = {
      titleAr: formData.titleAr,
      descriptionAr: formData.descriptionAr || undefined,
      descriptionShortAr: formData.descriptionShortAr || undefined,
      category: formData.category,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      price: formData.price ? parseInt(formData.price) : undefined,
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
      coverImageUrl: formData.coverImageUrl || undefined,
      axes: formData.axes.length > 0 ? JSON.stringify(formData.axes) : undefined,
      schedule: formData.schedule || undefined,
      isBundle: formData.isBundle,
      bundleCourseIds: formData.bundleCourseIds.length > 0 ? JSON.stringify(formData.bundleCourseIds) : undefined,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 0,
    };
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    let parsedAxes: string[] = [];
    try { parsedAxes = course.axes ? JSON.parse(course.axes) : []; } catch { parsedAxes = []; }
    let parsedBundleIds: number[] = [];
    try { parsedBundleIds = course.bundleCourseIds ? JSON.parse(course.bundleCourseIds) : []; } catch { parsedBundleIds = []; }
    
    setFormData({
      titleAr: course.titleAr || "",
      descriptionAr: course.descriptionAr || "",
      descriptionShortAr: course.descriptionShortAr || "",
      category: course.category || "",
      duration: course.duration?.toString() || "",
      price: course.price?.toString() || "",
      originalPrice: course.originalPrice?.toString() || "",
      coverImageUrl: course.coverImageUrl || "",
      axes: parsedAxes,
      schedule: course.schedule || "",
      isBundle: course.isBundle || false,
      bundleCourseIds: parsedBundleIds,
      isFeatured: course.isFeatured || false,
      sortOrder: course.sortOrder?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const addAxis = () => {
    if (newAxis.trim()) {
      setFormData({ ...formData, axes: [...formData.axes, newAxis.trim()] });
      setNewAxis("");
    }
  };

  const removeAxis = (index: number) => {
    setFormData({ ...formData, axes: formData.axes.filter((_, i) => i !== index) });
  };

  const toggleBundleCourse = (courseId: number) => {
    const ids = formData.bundleCourseIds;
    if (ids.includes(courseId)) {
      setFormData({ ...formData, bundleCourseIds: ids.filter(id => id !== courseId) });
    } else {
      setFormData({ ...formData, bundleCourseIds: [...ids, courseId] });
    }
  };

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat);

  // Calculate stats
  const totalCourses = activeCourses?.length || 0;
  const bundleCourses = activeCourses?.filter((c: any) => c.isBundle)?.length || 0;
  const featuredCourses = activeCourses?.filter((c: any) => c.isFeatured)?.length || 0;
  const totalRevenuePotential = activeCourses?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) || 0;

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
          <h2 className="text-2xl font-bold">إدارة الدورات التدريبية</h2>
          <p className="text-gray-600">إضافة وتعديل وإدارة الدورات مع الأسعار والمحاور والصور</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6">
              <Plus className="w-4 h-4 ml-2" />
              إضافة دورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingCourse ? "تعديل الدورة" : "إضافة دورة جديدة"}</DialogTitle>
              <DialogDescription>
                {editingCourse ? "قم بتعديل بيانات الدورة أدناه" : "املأ البيانات لإنشاء دورة تدريبية جديدة"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                  <TabsTrigger value="pricing">التسعير</TabsTrigger>
                  <TabsTrigger value="content">المحاور</TabsTrigger>
                  <TabsTrigger value="display">العرض</TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="titleAr" className="font-semibold">عنوان الدورة *</Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: تأهيل مدرّسي الابتدائي"
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="font-semibold">الفئة *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, isBundle: value === "bundle" })}>
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cat.color.split(' ')[0]}`} />
                              {cat.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="descriptionShortAr" className="font-semibold">وصف مختصر (للبطاقات)</Label>
                    <Input
                      id="descriptionShortAr"
                      value={formData.descriptionShortAr}
                      onChange={(e) => setFormData({ ...formData, descriptionShortAr: e.target.value })}
                      placeholder="سطر واحد يظهر في بطاقة الدورة..."
                      className="mt-1 rounded-xl"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.descriptionShortAr.length}/200 حرف</p>
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr" className="font-semibold">الوصف التفصيلي</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="وصف تفصيلي للدورة يظهر في صفحة التفاصيل..."
                      rows={4}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="font-semibold">المدة (بالساعات)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="مثال: 16"
                        min="1"
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule" className="font-semibold">الجدول الزمني</Label>
                      <Input
                        id="schedule"
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        placeholder="مثال: كل أحد 9:00 - 13:00"
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Pricing */}
                <TabsContent value="pricing" className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-amber-800 text-sm font-medium">💡 نصيحة تسويقية: أضف السعر الأصلي (قبل التخفيض) لإظهار قيمة الخصم للمشارك</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="font-semibold">السعر الحالي (د.ت)</Label>
                      <div className="relative mt-1">
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="مثال: 150"
                          min="0"
                          className="rounded-xl pl-12"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">د.ت</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="font-semibold">السعر الأصلي (قبل التخفيض)</Label>
                      <div className="relative mt-1">
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          placeholder="مثال: 200"
                          min="0"
                          className="rounded-xl pl-12"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">د.ت</span>
                      </div>
                    </div>
                  </div>
                  {formData.price && formData.originalPrice && parseInt(formData.originalPrice) > parseInt(formData.price) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-bold text-emerald-700">
                            خصم {Math.round((1 - parseInt(formData.price) / parseInt(formData.originalPrice)) * 100)}%
                          </p>
                          <p className="text-sm text-emerald-600">
                            توفير {parseInt(formData.originalPrice) - parseInt(formData.price)} د.ت
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bundle Settings */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Switch
                        checked={formData.isBundle}
                        onCheckedChange={(checked) => setFormData({ ...formData, isBundle: checked, category: checked ? "bundle" : formData.category })}
                      />
                      <Label className="font-semibold">هذه باقة (تضم عدة دورات)</Label>
                    </div>
                    {formData.isBundle && activeCourses && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">اختر الدورات المضمنة في الباقة:</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-xl p-3">
                          {activeCourses.filter((c: any) => !c.isBundle && c.id !== editingCourse?.id).map((course: any) => (
                            <label key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.bundleCourseIds.includes(course.id)}
                                onChange={() => toggleBundleCourse(course.id)}
                                className="rounded"
                              />
                              <span className="text-sm">{course.titleAr}</span>
                              {course.price > 0 && (
                                <Badge variant="outline" className="text-xs mr-auto">{course.price} د.ت</Badge>
                              )}
                            </label>
                          ))}
                        </div>
                        {formData.bundleCourseIds.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {formData.bundleCourseIds.length} دورات مختارة
                            {activeCourses && (() => {
                              const total = activeCourses
                                .filter((c: any) => formData.bundleCourseIds.includes(c.id))
                                .reduce((sum: number, c: any) => sum + (c.price || 0), 0);
                              return total > 0 ? ` | القيمة الإجمالية: ${total} د.ت` : '';
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 3: Content / Axes */}
                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label className="font-semibold">محاور الدورة</Label>
                    <p className="text-sm text-gray-500 mb-3">أضف المحاور التي تغطيها الدورة (تظهر في صفحة التفاصيل)</p>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newAxis}
                        onChange={(e) => setNewAxis(e.target.value)}
                        placeholder="أضف محور جديد..."
                        className="rounded-xl"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAxis(); } }}
                      />
                      <Button type="button" onClick={addAxis} variant="outline" className="rounded-xl shrink-0">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.axes.length > 0 ? (
                      <div className="space-y-2 border rounded-xl p-3 bg-gray-50">
                        {formData.axes.map((axis, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <GripVertical className="w-4 h-4 text-gray-300" />
                            <span className="text-sm flex-1">{axis}</span>
                            <button type="button" onClick={() => removeAxis(index)} className="text-red-400 hover:text-red-600 p-1">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 mt-2">{formData.axes.length} محور</p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-xl p-6 text-center text-gray-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لم تتم إضافة محاور بعد</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 4: Display Settings */}
                <TabsContent value="display" className="space-y-4">
                  <div>
                    <Label className="font-semibold mb-2 block">صورة غلاف الدورة</Label>
                    {formData.coverImageUrl ? (
                      <div className="relative group">
                        <div className="rounded-xl overflow-hidden border-2 border-gray-200 aspect-video max-w-md">
                          <img
                            src={formData.coverImageUrl}
                            alt="معاينة الغلاف"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 ml-1" />
                            تغيير الصورة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-red-500 hover:text-red-700"
                            onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: '' }))}
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 max-w-md ${
                          isUploading
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-sm text-blue-600 font-medium">جاري رفع الصورة...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                              <ImagePlus className="w-7 h-7 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">اسحب الصورة هنا أو انقر للاختيار</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • الحد الأقصى 5 ميجابايت</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                    {/* Fallback: manual URL input */}
                    <div className="mt-3">
                      <button
                        type="button"
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                        onClick={() => {
                          const url = prompt('أدخل رابط الصورة مباشرة:');
                          if (url) setFormData(prev => ({ ...prev, coverImageUrl: url }));
                        }}
                      >
                        أو أدخل رابط الصورة يدوياً
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sortOrder" className="font-semibold">ترتيب العرض</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="mt-1 rounded-xl"
                      />
                      <p className="text-xs text-gray-400 mt-1">الأصغر يظهر أولاً</p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex items-center gap-3 p-3 border rounded-xl">
                        <Switch
                          checked={formData.isFeatured}
                          onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                        />
                        <div>
                          <Label className="font-semibold">مميزة</Label>
                          <p className="text-xs text-gray-400">تظهر في الصفحة الرئيسية</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  إلغاء
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الحفظ...</>
                  ) : (editingCourse ? "تحديث الدورة" : "إنشاء الدورة")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-200 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{totalCourses}</p>
              <p className="text-xs text-emerald-600">دورات نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{bundleCourses}</p>
              <p className="text-xs text-orange-600">باقات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{featuredCourses}</p>
              <p className="text-xs text-blue-600">مميزة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200 rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalRevenuePotential}</p>
              <p className="text-xs text-purple-600">إجمالي الأسعار (د.ت)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch checked={showInactive} onCheckedChange={setShowInactive} />
          <Label className="text-sm text-gray-600">عرض المعطلة</Label>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="تصفية حسب الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course: any) => {
          const catInfo = getCategoryInfo(course.category);
          let axesCount = 0;
          try { axesCount = course.axes ? JSON.parse(course.axes).length : 0; } catch { axesCount = 0; }
          
          return (
            <Card key={course.id} className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-xl overflow-hidden ${!course.isActive ? "opacity-60 border-dashed border-red-300" : ""}`}>
              {/* Cover Image */}
              {course.coverImageUrl ? (
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={course.coverImageUrl}
                    alt={course.titleAr}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'hidden'; }}
                  />
                  {/* Overlay badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {course.isBundle && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        <Package className="w-3 h-3 ml-1" />
                        باقة
                      </Badge>
                    )}
                    {course.isFeatured && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Star className="w-3 h-3 ml-1" />
                        مميزة
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 left-3">
                    {course.isActive ? (
                      <Badge className="bg-emerald-500/90 text-white text-xs">
                        <Eye className="w-3 h-3 ml-1" />
                        نشطة
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/90 text-white text-xs">
                        <EyeOff className="w-3 h-3 ml-1" />
                        معطلة
                      </Badge>
                    )}
                  </div>
                  {/* Price badge on image */}
                  {course.price > 0 && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-xs text-gray-400 line-through">{course.originalPrice}</span>
                        )}
                        <span className="font-bold text-emerald-700">{course.price} د.ت</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <Image className="w-12 h-12 text-gray-300" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {course.isBundle && <Badge className="bg-orange-500 text-white text-xs"><Package className="w-3 h-3 ml-1" />باقة</Badge>}
                    {course.isFeatured && <Badge className="bg-amber-500 text-white text-xs"><Star className="w-3 h-3 ml-1" />مميزة</Badge>}
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={course.isActive ? "bg-emerald-500/90 text-white text-xs" : "bg-red-500/90 text-white text-xs"}>
                      {course.isActive ? <><Eye className="w-3 h-3 ml-1" />نشطة</> : <><EyeOff className="w-3 h-3 ml-1" />معطلة</>}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-relaxed">{course.titleAr}</CardTitle>
                </div>
                {catInfo && (
                  <Badge variant="outline" className={`text-xs w-fit ${catInfo.color}`}>
                    {catInfo.label}
                  </Badge>
                )}
                {course.descriptionShortAr && (
                  <CardDescription className="leading-relaxed line-clamp-2 text-sm">
                    {course.descriptionShortAr}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {/* Course meta */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  {course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration} ساعة
                    </span>
                  )}
                  {axesCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {axesCount} محور
                    </span>
                  )}
                  {course.schedule && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {course.schedule}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => handleEdit(course)}>
                    <Pencil className="w-3.5 h-3.5 ml-1" />
                    تعديل
                  </Button>
                  {course.isActive ? (
                    <Button variant="destructive" size="sm" className="flex-1 rounded-xl" onClick={() => { setCourseToDelete(course); setDeleteDialogOpen(true); }}>
                      <Trash2 className="w-3.5 h-3.5 ml-1" />
                      إزالة
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-emerald-600 border-emerald-300 hover:bg-emerald-50"
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
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="rounded-xl">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد دورات مطابقة</p>
            <p className="text-gray-400 text-sm mt-1">جرب تغيير الفلتر أو أضف دورة جديدة</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl" className="rounded-xl">
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
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => courseToDelete && deleteMutation.mutate({ id: courseToDelete.id })} className="bg-destructive hover:bg-destructive/90 rounded-xl">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إزالة الدورة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
