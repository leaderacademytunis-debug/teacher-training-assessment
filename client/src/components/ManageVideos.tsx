import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Pencil, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

export default function ManageVideos() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

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
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفيديو بنجاح");
      setIsEditDialogOpen(false);
      setEditingVideo(null);
      refetchVideos();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفيديو بنجاح");
      refetchVideos();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleAddVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createVideo.mutate({
      courseId: selectedCourseId!,
      titleAr: formData.get("titleAr") as string,
      descriptionAr: formData.get("descriptionAr") as string,
      videoUrl: formData.get("videoUrl") as string,
      duration: parseInt(formData.get("duration") as string) || undefined,
      orderIndex: parseInt(formData.get("orderIndex") as string),
      isRequired: formData.get("isRequired") === "on",
    });
  };

  const handleUpdateVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateVideo.mutate({
      id: editingVideo.id,
      titleAr: formData.get("titleAr") as string,
      descriptionAr: formData.get("descriptionAr") as string,
      videoUrl: formData.get("videoUrl") as string,
      duration: parseInt(formData.get("duration") as string) || undefined,
      orderIndex: parseInt(formData.get("orderIndex") as string),
      isRequired: formData.get("isRequired") === "on",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الفيديوهات</h2>
        {selectedCourseId && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                إضافة فيديو
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleAddVideo}>
                <DialogHeader>
                  <DialogTitle>إضافة فيديو جديد</DialogTitle>
                  <DialogDescription>
                    أضف فيديو تعليمي جديد للدورة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="titleAr">عنوان الفيديو</Label>
                    <Input id="titleAr" name="titleAr" required />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr">الوصف</Label>
                    <Textarea id="descriptionAr" name="descriptionAr" />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">رابط الفيديو</Label>
                    <Input id="videoUrl" name="videoUrl" type="url" required placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">المدة (بالثواني)</Label>
                      <Input id="duration" name="duration" type="number" />
                    </div>
                    <div>
                      <Label htmlFor="orderIndex">الترتيب</Label>
                      <Input id="orderIndex" name="orderIndex" type="number" required defaultValue="1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="isRequired" name="isRequired" defaultChecked />
                    <Label htmlFor="isRequired">فيديو إلزامي</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createVideo.isPending}>
                    {createVideo.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    إضافة
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
          <CardTitle>اختر الدورة</CardTitle>
          <CardDescription>اختر الدورة لإدارة فيديوهاتها</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseId?.toString()} onValueChange={(value) => setSelectedCourseId(parseInt(value))}>
            <SelectTrigger>
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
            <CardTitle>الفيديوهات</CardTitle>
            <CardDescription>
              {videos?.length || 0} فيديو
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videos && videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Video className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{video.titleAr}</h3>
                        <p className="text-sm text-gray-600">
                          {video.isRequired ? "إلزامي" : "اختياري"} • الترتيب: {video.orderIndex}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingVideo(video);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الفيديو؟")) {
                            deleteVideo.mutate({ id: video.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد فيديوهات بعد</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingVideo && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleUpdateVideo}>
              <DialogHeader>
                <DialogTitle>تعديل الفيديو</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-titleAr">عنوان الفيديو</Label>
                  <Input id="edit-titleAr" name="titleAr" defaultValue={editingVideo.titleAr} required />
                </div>
                <div>
                  <Label htmlFor="edit-descriptionAr">الوصف</Label>
                  <Textarea id="edit-descriptionAr" name="descriptionAr" defaultValue={editingVideo.descriptionAr || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-videoUrl">رابط الفيديو</Label>
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
              <DialogFooter>
                <Button type="submit" disabled={updateVideo.isPending}>
                  {updateVideo.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
