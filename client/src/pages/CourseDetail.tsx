import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, ArrowRight, FileText, Clock } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  
  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery({ id: courseId });
  const { data: exams, isLoading: examsLoading } = trpc.exams.listByCourse.useQuery({ courseId });
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });
  
  const enrollMutation = trpc.enrollments.enroll.useMutation({
    onSuccess: () => {
      toast.success("تم التسجيل في الدورة بنجاح!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء التسجيل: " + error.message);
    },
  });

  const isEnrolled = enrollments?.some(e => e.enrollment.courseId === courseId);

  if (authLoading || courseLoading || examsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الدورة غير موجودة</CardTitle>
            <CardDescription>لم يتم العثور على الدورة المطلوبة</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    enrollMutation.mutate({ courseId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <Link href={user ? "/my-courses" : "/"}>
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
        </div>
      </header>

      {/* Course Info */}
      <section className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                {isEnrolled && (
                  <Badge className="bg-green-100 text-green-800">مسجل في الدورة</Badge>
                )}
              </div>
              <CardTitle className="text-3xl mb-3">{course.titleAr}</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                {course.descriptionAr || "دورة تدريبية متخصصة لتطوير مهارات المعلمين"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-gray-600">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>المدة: {course.duration} ساعة</span>
                  </div>
                )}
              </div>

              {!isEnrolled && user && (
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "التسجيل في الدورة"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Exams Section */}
          {isEnrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">الاختبارات النهائية</CardTitle>
                <CardDescription>
                  اختبر معرفتك واحصل على شهادة إتمام الدورة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exams && exams.length > 0 ? (
                  <div className="space-y-4">
                    {exams.map((exam) => (
                      <Card key={exam.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{exam.titleAr}</CardTitle>
                              <CardDescription className="leading-relaxed">
                                {exam.descriptionAr || "اختبار نهائي لتقييم المكتسبات"}
                              </CardDescription>
                            </div>
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 text-sm text-gray-600">
                              {exam.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>المدة: {exam.duration} دقيقة</span>
                                </div>
                              )}
                              <div>درجة النجاح: {exam.passingScore}%</div>
                            </div>
                            <Link href={`/exams/${exam.id}`}>
                              <Button>بدء الاختبار</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد اختبارات متاحة حالياً
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
