import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, Video, CheckCircle, ArrowRight, Play } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useI18n from "@/i18n";


export default function CourseVideos() {
  const { t, lang, isRTL, dir } = useI18n();
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [watchedTime, setWatchedTime] = useState(0);

  const { data: course } = trpc.courses.getById.useQuery({ id: courseId });
  const { data: videos } = trpc.videos.listByCourse.useQuery({ courseId });
  const { data: progress, refetch: refetchProgress } = trpc.videoProgress.getCourseProgress.useQuery(
    { courseId },
    { enabled: !!user }
  );
  const { data: hasCompleted } = trpc.videoProgress.hasCompletedRequired.useQuery(
    { courseId },
    { enabled: !!user }
  );

  const updateProgress = trpc.videoProgress.updateProgress.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
  });

  useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  // Track video progress every 5 seconds
  useEffect(() => {
    if (!selectedVideo || !user) return;

    // For YouTube videos, we'll use a simplified tracking
    const isYouTube = selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be');
    
    if (isYouTube) {
      // For YouTube, mark as watched after 30 seconds of being on the page
      const timeout = setTimeout(() => {
        updateProgress.mutate({
          videoId: selectedVideo.id,
          watchedDuration: selectedVideo.duration || 600,
          completed: true,
        });
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timeout);
    } else {
      // For direct video files, track actual progress
      const interval = setInterval(() => {
        const videoElement = document.querySelector("video") as HTMLVideoElement;
        if (videoElement && !videoElement.paused) {
          const currentTime = Math.floor(videoElement.currentTime);
          setWatchedTime(currentTime);

          const duration = Math.floor(videoElement.duration);
          const completed = currentTime >= duration * 0.9; // 90% watched = completed

          updateProgress.mutate({
            videoId: selectedVideo.id,
            watchedDuration: currentTime,
            completed,
          });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedVideo, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>يجب تسجيل الدخول لمشاهدة الفيديوهات</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getVideoProgress = (videoId: number) => {
    return progress?.find((p) => p.videoId === videoId);
  };

  const calculateProgress = () => {
    if (!videos || !progress) return 0;
    const requiredVideos = videos.filter((v) => v.isRequired);
    if (requiredVideos.length === 0) return 100;
    const completedCount = requiredVideos.filter((v) => {
      const p = getVideoProgress(v.id);
      return p?.completed;
    }).length;
    return Math.round((completedCount / requiredVideos.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course?.titleAr}</h1>
              <p className="text-gray-600 mt-1">فيديوهات الدورة</p>
            </div>
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ms-2" />
                العودة للدورة
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container py-8">
        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>تقدمك في الدورة</CardTitle>
                <CardDescription>
                  {hasCompleted ? "أكملت جميع الفيديوهات المطلوبة" : "استمر في المشاهدة"}
                </CardDescription>
              </div>
              {hasCompleted && (
                <Badge className="bg-green-600">
                  <CheckCircle className="w-4 h-4 ms-1" />
                  مكتمل
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم الإجمالي</span>
                <span className="font-semibold">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {selectedVideo ? (
                  <div>
                    {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
                      <iframe
                        key={selectedVideo.id}
                        className="w-full aspect-video"
                        src={selectedVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={selectedVideo.titleAr}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={selectedVideo.id}
                        controls
                        className="w-full aspect-video bg-black"
                        src={selectedVideo.videoUrl}
                      >
                        المتصفح لا يدعم تشغيل الفيديو
                      </video>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.titleAr}</h2>
                      {selectedVideo.descriptionAr && (
                        <p className="text-gray-600">{selectedVideo.descriptionAr}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        {selectedVideo.isRequired && (
                          <Badge variant="outline">إلزامي</Badge>
                        )}
                        {getVideoProgress(selectedVideo.id)?.completed && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="w-3 h-3 ms-1" />
                            مكتمل
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">اختر فيديو للمشاهدة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>قائمة الفيديوهات</CardTitle>
                <CardDescription>{videos?.length || 0} فيديو</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {videos?.map((video, index) => {
                    const videoProgress = getVideoProgress(video.id);
                    const isCompleted = videoProgress?.completed;
                    const isSelected = selectedVideo?.id === video.id;

                    return (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className={`w-full text-end p-4 hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Play className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-1">
                              {index + 1}. {video.titleAr}
                            </p>
                            <div className="flex gap-2">
                              {video.isRequired && (
                                <Badge variant="outline" className="text-xs">
                                  إلزامي
                                </Badge>
                              )}
                              {video.duration && (
                                <span className="text-xs text-gray-500">
                                  {Math.floor(video.duration / 60)} دقيقة
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
