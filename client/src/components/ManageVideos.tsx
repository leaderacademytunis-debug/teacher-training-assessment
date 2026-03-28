import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Pencil, Trash2, Video, GripVertical, ExternalLink, Clock, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export default function ManageVideos() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<any>(null);

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: videos, refetch: refetchVideos } = trpc.videos.listByCourse.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );

  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الفيديو بنجاح");
      setIsAddDialogOpen(false);
      refetchVideos();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفيديو بنجاح");
      setIsEditDialogOpen(false);
      setEditingVideo(null);
      refetchVideos();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفيديو بنجاح");
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      refetchVideos();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const handleAddVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const titleAr = formData.get("titleAr") as string;
    const videoUrl = formData.get("videoUrl") as string;
    
    if (!titleAr || !videoUrl) {
      toast.error("الرجاء ملء الحقول المطلوبة");
      return;
    }

    createVideo.mutate({
      courseId: selectedCourseId!,
      titleAr,
      descriptionAr: (formData.get("descriptionAr") as string) || undefined,
      videoUrl,
      duration: parseInt(formData.get("duration") as string) || undefined,
      orderIndex: parseInt(formData.get("orderIndex") as string) || (videos?.length || 0) + 1,
      isRequired: formData.get("isRequired") === "on",
    });
  };

  const handleUpdateVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateVideo.mutate({
      id: editingVideo.id,
      titleAr: formData.get("titleAr") as string,
      descriptionAr: (formData.get("descriptionAr") as string) || undefined,
      videoUrl: formData.get("videoUrl") as string,
      duration: parseInt(formData.get("duration") as string) || undefined,
      orderIndex: parseInt(formData.get("orderIndex") as string),
      isRequired: formData.get("isRequired") === "on",
    });
  };

  const handleDeleteVideo = (video: any) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteVideo.mutate({ id: videoToDelete.id });
    }
  };

  const selectedCourse = courses?.find(c => c.id === selectedCourseId);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getVideoEmbedType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("vimeo.com")) return "Vimeo";
    if (url.includes("drive.google.com")) return "Google Drive";
    return "رابط خارجي";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة الفيديوهات</h2>
          <p className="text-gray-600">إضافة وتعديل وحذف فيديوهات الدورات</p>
        </div>
        {selectedCourseId && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 ms-2" />
                إضافة فيديو
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <form onSubmit={handleAddVideo}>
                <DialogHeader>
                  <DialogTitle>إضافة فيديو جديد</DialogTitle>
                  <DialogDescription>
                    أضف فيديو تعليمي جديد للدورة: {selectedCourse?.titleAr}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="titleAr">عنوان الفيديو *</Label>
                    <Input id="titleAr" name="titleAr" required placeholder="مثال: مقدمة في الذكاء الاصطناعي" />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr">الوصف</Label>
                    <Textarea id="descriptionAr" name="descriptionAr" placeholder="وصف محتوى الفيديو..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">رابط الفيديو *</Label>
                    <Input id="videoUrl" name="videoUrl" type="url" required placeholder="https://www.youtube.com/watch?v=..." />
                    <p className="text-xs text-gray-500 mt-1">يدعم YouTube, Vimeo, Google Drive وأي رابط فيديو مباشر</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">المدة (بالثواني)</Label>
                      <Input id="duration" name="duration" type="number" placeholder="مثال: 600" />
                    </div>
                    <div>
                      <Label htmlFor="orderIndex">الترتيب</Label>
                      <Input id="orderIndex" name="orderIndex" type="number" defaultValue={(videos?.length || 0) + 1} required />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="isRequired" name="isRequired" defaultChecked />
                    <Label htmlFor="isRequired">فيديو إلزامي (مطلوب لإتمام الدورة)</Label>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                  <Button type="submit" disabled={createVideo.isPending}>
                    {createVideo.isPending && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                    إضافة الفيديو
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            اختر الدورة
          </CardTitle>
          <CardDescription>اختر الدورة لإدارة فيديوهاتها</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseId?.toString() || ""} onValueChange={(value) => setSelectedCourseId(parseInt(value))}>
            <SelectTrigger className="text-base">
              <SelectValue placeholder="اختر دورة..." />
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

      {/* Videos List */}
      {selectedCourseId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>فيديوهات: {selectedCourse?.titleAr}</CardTitle>
                <CardDescription>{videos?.length || 0} فيديو</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {videos?.filter((v: any) => v.isRequired).length || 0} إلزامي
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {videos && videos.length > 0 ? (
              <div className="space-y-3">
                {[...videos].sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((video: any, index: number) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                    {/* Order number */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-lg font-bold w-8 text-center">{video.orderIndex}</span>
                    </div>

                    {/* Video icon */}
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Video info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{video.titleAr}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(video.duration)}
                        </span>
                        <Badge variant={video.isRequired ? "default" : "secondary"} className="text-xs">
                          {video.isRequired ? (
                            <><CheckCircle2 className="w-3 h-3 ms-1" />إلزامي</>
                          ) : (
                            <><Circle className="w-3 h-3 ms-1" />اختياري</>
                          )}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getVideoEmbedType(video.videoUrl)}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditingVideo(video); setIsEditDialogOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد فيديوهات بعد</p>
                <p className="text-gray-400 text-sm mt-1">ابدأ بإضافة فيديو جديد من الزر أعلاه</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingVideo && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingVideo(null); }}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <form onSubmit={handleUpdateVideo}>
              <DialogHeader>
                <DialogTitle>تعديل الفيديو</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-titleAr">عنوان الفيديو *</Label>
                  <Input id="edit-titleAr" name="titleAr" defaultValue={editingVideo.titleAr} required />
                </div>
                <div>
                  <Label htmlFor="edit-descriptionAr">الوصف</Label>
                  <Textarea id="edit-descriptionAr" name="descriptionAr" defaultValue={editingVideo.descriptionAr || ""} rows={3} />
                </div>
                <div>
                  <Label htmlFor="edit-videoUrl">رابط الفيديو *</Label>
                  <Input id="edit-videoUrl" name="videoUrl" type="url" defaultValue={editingVideo.videoUrl} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-duration">المدة (بالثواني)</Label>
                    <Input id="edit-duration" name="duration" type="number" defaultValue={editingVideo.duration || ""} />
                  </div>
                  <div>
                    <Label htmlFor="edit-orderIndex">الترتيب</Label>
                    <Input id="edit-orderIndex" name="orderIndex" type="number" defaultValue={editingVideo.orderIndex} required />
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch id="edit-isRequired" name="isRequired" defaultChecked={editingVideo.isRequired} />
                  <Label htmlFor="edit-isRequired">فيديو إلزامي</Label>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingVideo(null); }}>إلغاء</Button>
                <Button type="submit" disabled={updateVideo.isPending}>
                  {updateVideo.isPending && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الفيديو</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الفيديو "{videoToDelete?.titleAr}"?
              <br />
              <strong className="text-destructive">هذه العملية لا يمكن التراجع عنها.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {deleteVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف الفيديو"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
