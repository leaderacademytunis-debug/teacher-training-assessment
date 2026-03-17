import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, Loader2, ArrowRight, FileText, Clock, Video, Lock, Film, Sparkles,
  CheckCircle2, Users, Star, Calendar, Tag, Package, ChevronLeft, GraduationCap,
  Award, Target, Zap
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery({ id: courseId });
  const { data: exams, isLoading: examsLoading } = trpc.exams.listByCourse.useQuery({ courseId });
  const { data: videos } = trpc.videos.listByCourse.useQuery({ courseId });
  const { data: hasCompletedVideos } = trpc.videoProgress.hasCompletedRequired.useQuery(
    { courseId },
    { enabled: !!user }
  );
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: allCourses } = trpc.courses.list.useQuery();
  
  const enrollMutation = trpc.enrollments.enroll.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم التسجيل في الدورة بنجاح!" : "Inscription réussie!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error((isAr ? "حدث خطأ أثناء التسجيل: " : "Erreur: ") + error.message);
    },
  });

  const enrollment = enrollments?.find((e: any) => e.enrollment.courseId === courseId);
  const isEnrolled = !!enrollment;
  const isApproved = enrollment?.enrollment.status === "approved";
  const isPending = enrollment?.enrollment.status === "pending";
  const isRejected = enrollment?.enrollment.status === "rejected";

  // Parse axes from JSON string
  const axes: string[] = (() => {
    if (!course?.axes) return [];
    try {
      const parsed = JSON.parse(course.axes as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();

  // Parse bundle course IDs
  const bundleCourseIds: number[] = (() => {
    if (!course?.bundleCourseIds) return [];
    try {
      const parsed = JSON.parse(course.bundleCourseIds as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();

  const bundleCourses = allCourses?.filter((c: any) => bundleCourseIds.includes(c.id)) || [];

  if (authLoading || courseLoading || examsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#1e3a5f]" />
          <p className="text-gray-500">{isAr ? "جاري التحميل..." : "Chargement..."}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">{isAr ? "الدورة غير موجودة" : "Cours introuvable"}</h2>
            <p className="text-gray-500 mb-6">{isAr ? "لم يتم العثور على الدورة المطلوبة" : "Le cours demandé n'a pas été trouvé"}</p>
            <Link href="/">
              <Button className="rounded-xl bg-[#1e3a5f] hover:bg-[#15304f]">
                {isAr ? "العودة للرئيسية" : "Retour à l'accueil"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!user) {
      toast.error(isAr ? "يجب تسجيل الدخول أولاً" : "Veuillez vous connecter d'abord");
      return;
    }
    enrollMutation.mutate({ courseId });
  };

  const totalBundlePrice = bundleCourses.reduce((sum: number, c: any) => sum + (c.price || 0), 0);
  const savings = course.isBundle && course.price ? totalBundlePrice - course.price : 0;

  return (
    <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Hero Section with Cover Image */}
      <section className="relative">
        {/* Cover Image */}
        <div className="relative h-[320px] md:h-[400px] overflow-hidden">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.titleAr}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] via-[#2a5a8f] to-[#1e3a5f]" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          {/* Back Button */}
          <div className="absolute top-6 right-6 z-10">
            <Link href={user ? "/my-courses" : "/"}>
              <Button variant="outline" className="rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white border-0 shadow-lg">
                <ArrowRight className="w-4 h-4 ml-2" />
                {isAr ? "العودة" : "Retour"}
              </Button>
            </Link>
          </div>

          {/* Course Title on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.isBundle && (
                  <Badge className="bg-orange-500 text-white border-0 rounded-lg px-3 py-1">
                    <Package className="w-3.5 h-3.5 ml-1" />
                    {isAr ? "باقة شاملة" : "Pack complet"}
                  </Badge>
                )}
                {isPending && (
                  <Badge className="bg-yellow-500 text-white border-0 rounded-lg px-3 py-1">
                    {isAr ? "قيد المراجعة" : "En attente"}
                  </Badge>
                )}
                {isApproved && (
                  <Badge className="bg-green-500 text-white border-0 rounded-lg px-3 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                    {isAr ? "مسجّل" : "Inscrit"}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                {course.titleAr}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl">
                {course.descriptionShortAr || course.descriptionAr || (isAr ? "دورة تدريبية متخصصة لتطوير مهارات المعلمين" : "Formation spécialisée pour le développement des compétences")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {course.duration && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-800">{course.duration} {isAr ? "ساعة" : "h"}</p>
                  <p className="text-xs text-gray-500">{isAr ? "المدة الإجمالية" : "Durée totale"}</p>
                </div>
              )}
              {axes.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Target className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-800">{axes.length}</p>
                  <p className="text-xs text-gray-500">{isAr ? "محور تدريبي" : "Axes"}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Award className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-800">{course.isBundle ? "7" : "1"}</p>
                <p className="text-xs text-gray-500">{isAr ? "شهادة" : "Certificat"}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <GraduationCap className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-800">{isAr ? "معتمد" : "Certifié"}</p>
                <p className="text-xs text-gray-500">{isAr ? "شهادة معترف بها" : "Reconnu"}</p>
              </div>
            </div>

            {/* Description */}
            {course.descriptionAr && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <BookOpen className="w-5 h-5 text-[#1e3a5f]" />
                  {isAr ? "وصف الدورة" : "Description du cours"}
                </h2>
                <p className="text-gray-600 leading-relaxed text-base">{course.descriptionAr}</p>
              </div>
            )}

            {/* Axes / Topics */}
            {axes.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <Target className="w-5 h-5 text-[#1e3a5f]" />
                  {isAr ? "محاور الدورة" : "Axes de formation"}
                </h2>
                <div className="space-y-3">
                  {axes.map((axis, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{axis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle: Included Courses */}
            {course.isBundle && bundleCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <Package className="w-5 h-5 text-orange-500" />
                  {isAr ? "الدورات المشمولة في الباقة" : "Cours inclus dans le pack"}
                </h2>
                <div className="space-y-3">
                  {bundleCourses.map((bc: any) => (
                    <Link key={bc.id} href={`/courses/${bc.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1e3a5f] hover:shadow-md transition-all cursor-pointer group">
                        {bc.coverImageUrl ? (
                          <img src={bc.coverImageUrl} alt={bc.titleAr} className="w-16 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 group-hover:text-[#1e3a5f] transition-colors">{bc.titleAr}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {bc.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{bc.duration} {isAr ? "ساعة" : "h"}</span>}
                            {bc.price && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{bc.price} {isAr ? "د.ت" : "DT"}</span>}
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-[#1e3a5f] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
                {savings > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-green-700 font-bold">
                      <Zap className="w-4 h-4 inline ml-1" />
                      {isAr ? `وفّر ${savings} د.ت مع الباقة الشاملة!` : `Économisez ${savings} DT avec le pack complet!`}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      {isAr ? `بدل ${totalBundlePrice} د.ت، ادفع فقط ${course.price} د.ت` : `Au lieu de ${totalBundlePrice} DT, payez seulement ${course.price} DT`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule */}
            {course.schedule && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#1e3a5f]" />
                  <h3 className="font-bold text-gray-800">{isAr ? "الجدول الزمني" : "Calendrier"}</h3>
                </div>
                <p className="text-gray-600">{course.schedule}</p>
              </div>
            )}

            {/* Videos Section - Only for enrolled users */}
            {isApproved && videos && videos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <Video className="w-5 h-5 text-[#1e3a5f]" />
                  {isAr ? "فيديوهات الدورة" : "Vidéos du cours"}
                </h2>
                <Link href={`/courses/${courseId}/videos`}>
                  <Button size="lg" className="w-full rounded-xl bg-[#1e3a5f] hover:bg-[#15304f]">
                    <Video className="w-5 h-5 ml-2" />
                    {isAr ? `مشاهدة الفيديوهات (${videos.length} فيديو)` : `Voir les vidéos (${videos.length})`}
                  </Button>
                </Link>
              </div>
            )}

            {/* AI Video Evaluator - Only for Video AI course */}
            {isApproved && course && (course.slug === 'digital_teacher_ai' || course.slug === 'digital_teacher_ai ') && (
              <Card className="border-2 overflow-hidden rounded-2xl" style={{ borderColor: 'rgba(26,35,126,0.2)' }}>
                <div className="p-1" style={{ background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 50%, #01579B 100%)' }}>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-bold text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>{isAr ? "وكيل ذكاء اصطناعي" : "Agent IA"}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1A237E, #0D47A1)' }}>
                      <Film className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#1A237E' }}>{isAr ? "مُقيِّم المعلم الرقمي" : "Évaluateur Vidéo IA"}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {isAr ? "وكيل ذكاء اصطناعي خبير في تقييم الفيديوهات التعليمية وتحسين هندسة الأوامر" : "Agent IA expert en évaluation de vidéos pédagogiques"}
                      </p>
                    </div>
                  </div>
                  <Link href="/video-evaluator">
                    <Button size="lg" className="w-full mt-4 text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #1A237E, #1565C0)' }}>
                      <Film className="w-5 h-5 ml-2" />
                      {isAr ? "بدء التقييم مع المُقيِّم الرقمي" : "Commencer l'évaluation"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Exams Section */}
            {isApproved && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <FileText className="w-5 h-5 text-[#1e3a5f]" />
                  {isAr ? "الاختبارات النهائية" : "Examens finaux"}
                </h2>
                {exams && exams.length > 0 ? (
                  <div className="space-y-3">
                    {exams.map((exam: any) => (
                      <div key={exam.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-[#1e3a5f]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{exam.titleAr}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {exam.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} {isAr ? "دقيقة" : "min"}</span>}
                            <span>{isAr ? "درجة النجاح" : "Note de passage"}: {exam.passingScore}%</span>
                          </div>
                        </div>
                        {hasCompletedVideos || !videos || videos.length === 0 ? (
                          <Link href={`/exams/${exam.id}`}>
                            <Button className="rounded-xl bg-[#1e3a5f] hover:bg-[#15304f]">{isAr ? "بدء الاختبار" : "Commencer"}</Button>
                          </Link>
                        ) : (
                          <Button disabled className="gap-2 rounded-xl">
                            <Lock className="w-4 h-4" />
                            {isAr ? "مقفل" : "Verrouillé"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                    {isAr ? "لا توجد اختبارات متاحة حالياً" : "Aucun examen disponible"}
                  </div>
                )}
                {videos && videos.length > 0 && !hasCompletedVideos && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-800 text-center text-sm">
                      {isAr ? "يجب مشاهدة جميع الفيديوهات الإلزامية قبل تقديم الاختبار" : "Vous devez regarder toutes les vidéos obligatoires avant de passer l'examen"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sticky Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8f] p-6 text-white text-center">
                  {course.price ? (
                    <>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <p className="text-white/60 line-through text-lg mb-1">{course.originalPrice} {isAr ? "د.ت" : "DT"}</p>
                      )}
                      <p className="text-4xl font-bold">{course.price} <span className="text-lg">{isAr ? "د.ت" : "DT"}</span></p>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <Badge className="bg-orange-500 text-white border-0 mt-2 rounded-lg">
                          {isAr ? `خصم ${Math.round((1 - course.price / course.originalPrice) * 100)}%` : `${Math.round((1 - course.price / course.originalPrice) * 100)}% de réduction`}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <p className="text-2xl font-bold">{isAr ? "مجاني" : "Gratuit"}</p>
                  )}
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Enrollment Button */}
                  {!isEnrolled && user && (
                    <Button 
                      className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 font-bold" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          {isAr ? "جاري التسجيل..." : "Inscription..."}
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 ml-2" />
                          {isAr ? "سجّل الآن" : "S'inscrire maintenant"}
                        </>
                      )}
                    </Button>
                  )}

                  {!user && (
                    <Link href="/">
                      <Button className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 font-bold" size="lg">
                        <Zap className="w-5 h-5 ml-2" />
                        {isAr ? "سجّل دخولك للتسجيل" : "Connectez-vous pour s'inscrire"}
                      </Button>
                    </Link>
                  )}

                  {isPending && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <p className="text-yellow-800 text-sm font-medium">
                        {isAr ? "تم إرسال طلب التسجيل. بانتظار موافقة المشرف." : "Demande envoyée. En attente d'approbation."}
                      </p>
                    </div>
                  )}

                  {isApproved && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 text-sm font-medium">
                        {isAr ? "أنت مسجّل في هذه الدورة" : "Vous êtes inscrit à ce cours"}
                      </p>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-red-800 text-sm font-medium">
                        {isAr ? "تم رفض طلب التسجيل. يرجى التواصل مع المشرف." : "Demande refusée. Contactez l'administrateur."}
                      </p>
                    </div>
                  )}

                  {/* Course Features */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-gray-800 text-sm">{isAr ? "تشمل الدورة:" : "Le cours comprend:"}</h3>
                    <div className="space-y-2.5">
                      {course.duration && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{course.duration} {isAr ? "ساعة تدريب" : "heures de formation"}</span>
                        </div>
                      )}
                      {axes.length > 0 && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{axes.length} {isAr ? "محور تدريبي" : "axes de formation"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{isAr ? "شهادة إتمام معتمدة" : "Certificat de réussite"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{isAr ? "وصول لأدوات الذكاء الاصطناعي" : "Accès aux outils IA"}</span>
                      </div>
                      {course.isBundle && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{isAr ? "7 شهادات مستقلة" : "7 certificats indépendants"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
