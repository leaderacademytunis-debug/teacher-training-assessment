import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, Loader2, ArrowRight, FileText, Clock, Video, Lock, Film, Sparkles,
  CheckCircle2, Users, Star, Calendar, Tag, Package, ChevronLeft, GraduationCap,
  Award, Target, Zap, MessageSquare, Send, Quote, ThumbsUp, CreditCard, Upload,
  Phone, Banknote, Wallet, Mic, Coins, Clapperboard, Wand2, PenTool, MonitorPlay, Camera
} from "lucide-react";
import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";

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
  
  // Reviews
  const { data: courseReviews, refetch: refetchReviews } = trpc.reviews.byCourse.useQuery({ courseId });
  const { data: avgRating } = trpc.reviews.averageRating.useQuery({ courseId });
  const { data: myReview } = trpc.reviews.myReview.useQuery({ courseId }, { enabled: !!user });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  
  const submitReviewMutation = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم إرسال تقييمك بنجاح!" : "Votre avis a été soumis avec succès!");
      refetchReviews();
      setReviewRating(0);
      setReviewComment("");
    },
    onError: (error) => {
      toast.error((isAr ? "خطأ: " : "Erreur: ") + error.message);
    },
  });
  
  // Similar courses (same category, excluding current)
  const similarCourses = useMemo(() => {
    if (!allCourses || !course) return [];
    return allCourses
      .filter((c: any) => c.id !== courseId && c.category === course.category && !c.isBundle)
      .slice(0, 4);
  }, [allCourses, course, courseId]);
  
  // If no same-category courses, show other featured courses
  const displaySimilarCourses = useMemo(() => {
    if (similarCourses.length >= 2) return similarCourses;
    if (!allCourses || !course) return [];
    const others = allCourses
      .filter((c: any) => c.id !== courseId && !c.isBundle)
      .slice(0, 4);
    return others;
  }, [similarCourses, allCourses, course, courseId]);
  
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollFormData, setEnrollFormData] = useState({
    fullName: "",
    phone: "",
    paymentMethod: "bank_transfer" as string,
    receiptUrl: "",
    note: "",
  });
  const [uploading, setUploading] = useState(false);
  
  const enrollMutation = trpc.enrollments.enroll.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم إرسال طلب التسجيل بنجاح! سيتم مراجعته قريباً." : "Demande envoyée avec succès! Elle sera examinée prochainement.");
      setShowEnrollmentForm(false);
      window.location.reload();
    },
    onError: (error) => {
      toast.error((isAr ? "حدث خطأ أثناء التسجيل: " : "Erreur: ") + error.message);
    },
  });
  
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isAr ? "حجم الملف كبير جداً (5MB كحد أقصى)" : "Fichier trop volumineux (5MB max)");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setEnrollFormData(prev => ({ ...prev, receiptUrl: reader.result as string }));
        toast.success(isAr ? "تم رفع الإيصال" : "État reçu téléchargé");
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error(isAr ? "فشل رفع الملف" : "Échec du téléchargement");
        setUploading(false);
      };
    } catch {
      toast.error(isAr ? "فشل رفع الملف" : "Échec du téléchargement");
      setUploading(false);
    }
  };

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

            {/* AI Tools Section - Visible to all, locked for non-approved */}
            {course && (course.id === 30001 || course.category === 'digital_teacher_ai') && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  {isAr ? "أدوات الذكاء الاصطناعي الحصرية" : "Outils IA exclusifs"}
                  {!isApproved && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs animate-pulse">
                      <Lock className="w-3 h-3 ml-1" />
                      {isAr ? "حصري للمشاركين" : "Réservé aux participants"}
                    </Badge>
                  )}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {isAr ? "أدوات متقدمة متاحة حصرياً لمشاركي هذه الدورة لإنشاء محتوى تعليمي احترافي" : "Outils avancés exclusifs aux participants de ce cours"}
                </p>

                {/* Locked overlay for non-approved users */}
                {!isApproved && (
                  <div className="relative mb-4">
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)' }}>
                      <div className="text-center p-6 max-w-md">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7C3AED, #F59E0B)' }}>
                          <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                          {isAr ? "سجّل في الدورة لفتح 6 أدوات ذكاء اصطناعي" : "Inscrivez-vous pour débloquer 6 outils IA"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {isAr 
                            ? "استوديو إنتاج فيديو، استنساخ صوتي، مُقيِّم فيديو، محسّن أوامر، مخرج ذكي، و100 نقطة مجانية!"
                            : "Studio vidéo, clonage vocal, évaluateur vidéo, prompt lab, réalisateur IA et 100 points gratuits !"}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          {!user ? (
                            <a href={getLoginUrl()}>
                              <Button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-xl px-8 py-3 text-base font-bold shadow-lg">
                                <Sparkles className="w-5 h-5 ml-2" />
                                {isAr ? "سجّل الدخول وانضم الآن" : "Connectez-vous et inscrivez-vous"}
                              </Button>
                            </a>
                          ) : (
                            <Button 
                              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-xl px-8 py-3 text-base font-bold shadow-lg"
                              onClick={() => {
                                const enrollBtn = document.querySelector('[data-enroll-btn]') as HTMLElement;
                                if (enrollBtn) enrollBtn.click();
                                else window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <Sparkles className="w-5 h-5 ml-2" />
                              {isAr ? "سجّل في الدورة الآن" : "Inscrivez-vous maintenant"}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {isAr ? "6 أدوات AI" : "6 outils IA"}</span>
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-green-500" /> {isAr ? "100 نقطة مجانية" : "100 pts gratuits"}</span>
                          <span className="flex items-center gap-1"><Mic className="w-3 h-3 text-orange-500" /> {isAr ? "استنساخ صوتي" : "Clonage vocal"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Blurred tools grid behind overlay */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 pointer-events-none select-none" style={{ filter: 'blur(5px)', opacity: 0.6 }}>
                      {[{
                        icon: <Clapperboard className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                        name: isAr ? 'Edu-Studio' : 'Edu-Studio',
                        desc: isAr ? 'استوديو إنتاج الفيديوهات التعليمية' : 'Studio de production vidéo',
                        badge: isAr ? 'سيناريو + صور + صوت' : 'Scénario + Images + Audio',
                        badgeColor: 'bg-purple-100 text-purple-700'
                      }, {
                        icon: <Mic className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        name: isAr ? 'صوتي الرقمي' : 'Ma voix numérique',
                        desc: isAr ? 'استنسخ صوتك لدروسك' : 'Clonez votre voix',
                        badge: isAr ? 'ميزة حصرية' : 'Exclusif',
                        badgeColor: 'bg-orange-100 text-orange-700'
                      }, {
                        icon: <MonitorPlay className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #1A237E, #0D47A1)',
                        name: isAr ? 'مُقيِّم الفيديو' : 'Évaluateur Vidéo',
                        desc: isAr ? 'تقييم فيديوهاتك التعليمية' : 'Évaluez vos vidéos',
                        badge: isAr ? 'وكيل ذكاء اصطناعي' : 'Agent IA',
                        badgeColor: 'bg-indigo-100 text-indigo-700'
                      }, {
                        icon: <PenTool className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #0891B2, #06B6D4)',
                        name: isAr ? 'محسّن الأوامر' : 'Prompt Lab',
                        desc: isAr ? 'حسّن أوامرك للذكاء الاصطناعي' : 'Améliorez vos prompts',
                        badge: isAr ? 'هندسة الأوامر' : 'Prompt Engineering',
                        badgeColor: 'bg-cyan-100 text-cyan-700'
                      }, {
                        icon: <Camera className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #9333EA, #DB2777)',
                        name: isAr ? 'المخرج الذكي' : 'AI Director',
                        desc: isAr ? 'مشاهد فيديو سينمائية' : 'Vidéos cinématiques',
                         badge: isAr ? 'إنتاج فيديو متقدم' : 'Production avancée',
                         badgeColor: 'bg-rose-100 text-rose-700'
                       }, {
                         icon: <Film className="w-7 h-7 text-white" />,
                         bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
                         name: 'Ultimate Studio',
                         desc: isAr ? 'من الكتاب إلى الفيديو' : 'Du manuel au vidéo',
                         badge: isAr ? 'جديد' : 'Nouveau',
                         badgeColor: 'bg-amber-100 text-amber-700'
                       }, {
                        icon: <Coins className="w-7 h-7 text-white" />,
                        bg: 'linear-gradient(135deg, #10B981, #059669)',
                        name: isAr ? 'نقاط ليدر' : 'Leader Points',
                        desc: isAr ? 'رصيدك من النقاط' : 'Votre solde de points',
                        badge: isAr ? '100 نقطة مجانية' : '100 points gratuits',
                        badgeColor: 'bg-green-100 text-green-700'
                      }].map((tool, i) => (
                        <Card key={i} className="border-2 border-gray-200 rounded-2xl h-full">
                          <CardContent className="p-5 text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: tool.bg }}>
                              {tool.icon}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>{tool.name}</h3>
                            <p className="text-xs text-gray-500">{tool.desc}</p>
                            <Badge className={`mt-3 border-0 text-xs ${tool.badgeColor}`}>{tool.badge}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unlocked tools for approved participants */}
                {isApproved && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {/* Edu-Studio */}
                    <Link href="/edu-studio">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-purple-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                            <Clapperboard className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "Edu-Studio" : "Edu-Studio"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "استوديو إنتاج الفيديوهات التعليمية بالذكاء الاصطناعي" : "Studio de production vidéo éducative IA"}
                          </p>
                          <Badge className="mt-3 bg-purple-100 text-purple-700 border-0 text-xs">
                            {isAr ? "سيناريو + صور + صوت" : "Scénario + Images + Audio"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* My Digital Voice */}
                    <Link href="/my-voice">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-orange-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                            <Mic className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "صوتي الرقمي" : "Ma voix numérique"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "استنسخ صوتك واستخدمه في التعليق الصوتي لدروسك" : "Clonez votre voix pour vos cours"}
                          </p>
                          <Badge className="mt-3 bg-orange-100 text-orange-700 border-0 text-xs">
                            {isAr ? "ميزة حصرية" : "Exclusif"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Video Evaluator */}
                    <Link href="/video-evaluator">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-indigo-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #1A237E, #0D47A1)' }}>
                            <MonitorPlay className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "مُقيِّم الفيديو" : "Évaluateur Vidéo"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "وكيل ذكاء اصطناعي لتقييم فيديوهاتك التعليمية" : "Agent IA pour évaluer vos vidéos"}
                          </p>
                          <Badge className="mt-3 bg-indigo-100 text-indigo-700 border-0 text-xs">
                            {isAr ? "وكيل ذكاء اصطناعي" : "Agent IA"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Prompt Lab */}
                    <Link href="/prompt-lab">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-cyan-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #0891B2, #06B6D4)' }}>
                            <PenTool className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "محسّن الأوامر" : "Prompt Lab"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "حسّن أوامرك للذكاء الاصطناعي واحصل على نتائج أفضل" : "Améliorez vos prompts IA"}
                          </p>
                          <Badge className="mt-3 bg-cyan-100 text-cyan-700 border-0 text-xs">
                            {isAr ? "هندسة الأوامر" : "Prompt Engineering"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* AI Director */}
                    <Link href="/visual-studio">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-rose-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #9333EA, #DB2777)' }}>
                            <Camera className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "المخرج الذكي" : "AI Director"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "حوّل دروسك إلى مشاهد فيديو سينمائية بالذكاء الاصطناعي" : "Transformez vos cours en vidéos cinématiques IA"}
                          </p>
                          <Badge className="mt-3 bg-rose-100 text-rose-700 border-0 text-xs">
                            {isAr ? "إنتاج فيديو متقدم" : "Production vidéo avancée"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Ultimate Studio */}
                    <Link href="/ultimate-studio">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-amber-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                            <Film className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "Ultimate Studio" : "Ultimate Studio"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "من الكتاب المدرسي إلى الفيديو التعليمي في شاشة واحدة" : "Du manuel au vidéo éducatif en un seul écran"}
                          </p>
                          <Badge className="mt-3 bg-amber-100 text-amber-700 border-0 text-xs">
                            {isAr ? "جديد - الأداة الشاملة" : "Nouveau - Outil complet"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* My Points */}
                    <Link href="/my-points">
                      <Card className="group cursor-pointer border-2 border-transparent hover:border-green-300 rounded-2xl transition-all hover:shadow-lg h-full">
                        <CardContent className="p-5 text-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            <Coins className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                            {isAr ? "نقاط ليدر" : "Leader Points"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {isAr ? "رصيدك من النقاط لاستخدام أدوات الذكاء الاصطناعي" : "Votre solde de points pour les outils IA"}
                          </p>
                          <Badge className="mt-3 bg-green-100 text-green-700 border-0 text-xs">
                            {isAr ? "100 نقطة مجانية" : "100 points gratuits"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                )}
              </div>
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
                      onClick={() => {
                        if (course.price && course.price > 0) {
                          setShowEnrollmentForm(true);
                        } else {
                          handleEnroll();
                        }
                      }}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          {isAr ? "جاري التسجيل..." : "Inscription..."}
                        </>
                      ) : (
                        <>
                          {course.price && course.price > 0 ? <CreditCard className="w-5 h-5 ml-2" /> : <Zap className="w-5 h-5 ml-2" />}
                          {isAr ? (course.price && course.price > 0 ? "سجّل وادفع الآن" : "سجّل الآن مجاناً") : (course.price && course.price > 0 ? "S'inscrire et payer" : "S'inscrire gratuitement")}
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
                      <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
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

                  {/* Payment Methods Info */}
                  {course.price && course.price > 0 && !isEnrolled && (
                    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase">{isAr ? "طرق الدفع المتاحة" : "Moyens de paiement"}</h4>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700">
                          <Banknote className="w-3.5 h-3.5" />
                          {isAr ? "تحويل بنكي" : "Virement"}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg text-xs text-green-700">
                          <Wallet className="w-3.5 h-3.5" />
                          D17
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg text-xs text-purple-700">
                          <CreditCard className="w-3.5 h-3.5" />
                          Flouci
                        </div>
                      </div>
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

      {/* ===== REVIEWS SECTION ===== */}
      <section className="py-16 bg-gray-50" dir={isAr ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3" style={{ fontFamily: 'Cairo, Almarai, sans-serif' }}>
                <MessageSquare className="w-6 h-6 text-[#1e3a5f]" />
                {isAr ? "آراء المشاركين" : "Avis des participants"}
              </h2>
              {avgRating && avgRating.count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating.average) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{avgRating.average.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({avgRating.count} {isAr ? "تقييم" : "avis"})</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form (for enrolled users) */}
          {user && isApproved && !myReview && (
            <Card className="rounded-2xl border-0 shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] px-6 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  {isAr ? "شاركنا رأيك في هذه الدورة" : "Partagez votre avis sur ce cours"}
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{isAr ? "تقييمك:" : "Votre note:"}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || reviewRating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={isAr ? "اكتب تعليقك هنا... (اختياري)" : "Écrivez votre commentaire ici... (optionnel)"}
                  className="rounded-xl border-gray-200 focus:border-[#1e3a5f] min-h-[100px] resize-none"
                  dir={isAr ? "rtl" : "ltr"}
                />
                <Button
                  onClick={() => {
                    if (reviewRating === 0) {
                      toast.error(isAr ? "يرجى اختيار تقييم" : "Veuillez choisir une note");
                      return;
                    }
                    submitReviewMutation.mutate({ courseId, rating: reviewRating, comment: reviewComment || undefined });
                  }}
                  disabled={submitReviewMutation.isPending || reviewRating === 0}
                  className="mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {submitReviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Send className="w-4 h-4 ml-2" />
                  )}
                  {isAr ? "إرسال التقييم" : "Envoyer l'avis"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* My existing review */}
          {myReview && (
            <Card className="rounded-2xl border-2 border-green-200 shadow-sm mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-green-700">{isAr ? "تقييمك" : "Votre avis"}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= myReview.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                {myReview.comment && <p className="text-gray-600 text-sm leading-relaxed">{myReview.comment}</p>}
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {courseReviews && courseReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseReviews.map((item: any) => (
                <Card key={item.review.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8f] flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(item.user?.arabicName || item.user?.name || "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{item.user?.arabicName || item.user?.name || (isAr ? "مشارك" : "Participant")}</h4>
                          <span className="text-xs text-gray-400">{new Date(item.review.createdAt).toLocaleDateString('ar-TN')}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= item.review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        {item.review.comment && (
                          <p className="text-gray-600 text-sm leading-relaxed">{item.review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">{isAr ? "لا توجد مراجعات بعد. كن أول من يقيّم!" : "Aucun avis pour le moment. Soyez le premier!"}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== SIMILAR COURSES SECTION ===== */}
      {displaySimilarCourses.length > 0 && (
        <section className="py-16 bg-white" dir={isAr ? "rtl" : "ltr"}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3" style={{ fontFamily: 'Cairo, Almarai, sans-serif' }}>
              <Sparkles className="w-6 h-6 text-orange-500" />
              {isAr ? "دورات مشابهة قد تهمّك" : "Cours similaires qui pourraient vous intéresser"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displaySimilarCourses.map((sc: any) => (
                <Link key={sc.id} href={`/courses/${sc.id}`}>
                  <Card className="rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
                    <div className="relative h-40 overflow-hidden">
                      {sc.coverImageUrl ? (
                        <img src={sc.coverImageUrl} alt={sc.titleAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8f] flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {sc.price ? (
                        <Badge className="absolute bottom-3 left-3 bg-orange-500 text-white border-0 rounded-lg text-xs">
                          {sc.price} {isAr ? "د.ت" : "DT"}
                        </Badge>
                      ) : (
                        <Badge className="absolute bottom-3 left-3 bg-green-500 text-white border-0 rounded-lg text-xs">
                          {isAr ? "مجاني" : "Gratuit"}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2" style={{ fontFamily: 'Almarai, Cairo, sans-serif' }}>{sc.titleAr}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {sc.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sc.duration} {isAr ? "ساعة" : "h"}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* ===== ENROLLMENT DIALOG WITH PAYMENT ===== */}
      <Dialog open={showEnrollmentForm} onOpenChange={setShowEnrollmentForm}>
        <DialogContent dir={isAr ? "rtl" : "ltr"} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-orange-500" />
              {isAr ? "نموذج التسجيل والدفع" : "Formulaire d'inscription et paiement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Course Summary */}
            <div className="bg-gradient-to-r from-[#1e3a5f]/5 to-[#2a5a8f]/5 p-4 rounded-xl border border-[#1e3a5f]/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#1e3a5f] text-sm">{course.titleAr}</p>
                  {course.schedule && <p className="text-xs text-gray-500 mt-1">{course.schedule}</p>}
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-orange-500">{course.price} {isAr ? "د.ت" : "DT"}</p>
                  {course.originalPrice && course.originalPrice > (course.price || 0) && (
                    <p className="text-xs text-gray-400 line-through">{course.originalPrice} {isAr ? "د.ت" : "DT"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{isAr ? "الاسم الكامل" : "Nom complet"}</Label>
              <Input
                placeholder={isAr ? "مثال: محمد بن علي" : "Ex: Mohamed Ben Ali"}
                value={enrollFormData.fullName}
                onChange={e => setEnrollFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{isAr ? "رقم الهاتف" : "Numéro de téléphone"}</Label>
              <Input
                type="tel"
                placeholder={isAr ? "مثال: 55 123 456" : "Ex: 55 123 456"}
                value={enrollFormData.phone}
                onChange={e => setEnrollFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{isAr ? "طريقة الدفع" : "Mode de paiement"}</Label>
              <Select value={enrollFormData.paymentMethod} onValueChange={v => setEnrollFormData(prev => ({ ...prev, paymentMethod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <span className="flex items-center gap-2"><Banknote className="w-4 h-4" /> {isAr ? "تحويل بنكي" : "Virement bancaire"}</span>
                  </SelectItem>
                  <SelectItem value="d17">
                    <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> D17</span>
                  </SelectItem>
                  <SelectItem value="flouci">
                    <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Flouci</span>
                  </SelectItem>
                  <SelectItem value="cash">
                    <span className="flex items-center gap-2"><Banknote className="w-4 h-4" /> {isAr ? "نقدي" : "Espèces"}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 p-3 rounded-xl text-sm">
              <p className="font-semibold text-blue-800 mb-1">{isAr ? "تعليمات الدفع:" : "Instructions de paiement:"}</p>
              <p className="text-blue-700 text-xs leading-relaxed">
                {isAr ? (
                  <>1. قم بالتحويل إلى الحساب البنكي أو عبر D17/Flouci<br/>2. ارفع صورة إيصال الدفع<br/>3. سيتم تفعيل تسجيلك خلال 24 ساعة</>
                ) : (
                  <>1. Effectuez le virement ou le paiement via D17/Flouci<br/>2. Téléchargez la preuve de paiement<br/>3. Votre inscription sera activée sous 24h</>
                )}
              </p>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{isAr ? "صورة إيصال الدفع *" : "Preuve de paiement *"}</Label>
              <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-300 transition-colors">
                {enrollFormData.receiptUrl ? (
                  <div className="space-y-2">
                    <img src={enrollFormData.receiptUrl} alt={isAr ? "إيصال" : "Reçu"} className="max-h-32 mx-auto rounded-lg" />
                    <Button variant="outline" size="sm" onClick={() => setEnrollFormData(prev => ({ ...prev, receiptUrl: "" }))}>
                      {isAr ? "تغيير الصورة" : "Changer l'image"}
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {uploading ? (isAr ? "جارٍ الرفع..." : "Téléchargement...") : (isAr ? "اضغط لرفع صورة الإيصال" : "Cliquez pour télécharger le reçu")}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReceiptUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{isAr ? "ملاحظة (اختياري)" : "Note (optionnel)"}</Label>
              <Textarea
                placeholder={isAr ? "أي ملاحظة إضافية..." : "Remarque supplémentaire..."}
                value={enrollFormData.note}
                onChange={e => setEnrollFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleEnroll()}
              disabled={enrollMutation.isPending || !enrollFormData.receiptUrl}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-full text-white rounded-xl py-5 text-base font-bold"
            >
              {enrollMutation.isPending ? (
                <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> {isAr ? "جاري الإرسال..." : "Envoi..."}</>
              ) : (
                <><Send className="w-5 h-5 ml-2" /> {isAr ? "إرسال طلب التسجيل والدفع" : "Envoyer la demande"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
