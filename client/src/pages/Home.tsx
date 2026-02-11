import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, GraduationCap, Users, Award, Loader2 } from "lucide-react";
import { Link } from "wouter";

const courseIcons: Record<string, typeof BookOpen> = {
  primary_teachers: GraduationCap,
  arabic_teachers: BookOpen,
  science_teachers: Award,
  french_teachers: BookOpen,
  preschool_facilitators: Users,
  special_needs_companions: Users,
  digital_teacher_ai: Award,
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.enrollment.courseId) || []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">منصة تأهيل المدرسين</h1>
              <p className="text-gray-600 mt-1">تطوير مهارات المعلمين وتقييم مكتسباتهم</p>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  {["admin", "trainer", "supervisor"].includes(user.role) && (
                    <Link href="/dashboard">
                      <Button variant="outline">لوحة التحكم</Button>
                    </Link>
                  )}
                  <Link href="/my-courses">
                    <Button>دوراتي</Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>تسجيل الدخول</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            برامج تأهيل شاملة للمعلمين
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            اختر من بين سبع دورات تدريبية متخصصة مصممة لتطوير مهاراتك التعليمية وتعزيز قدراتك المهنية
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => {
            const Icon = courseIcons[course.category] || BookOpen;
            const isEnrolled = enrolledCourseIds.has(course.id);
            
            return (
              <Card 
                key={course.id} 
                className="hover:shadow-lg transition-shadow duration-300 bg-white border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{course.titleAr}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {course.descriptionAr || "دورة تدريبية متخصصة لتطوير مهارات المعلمين"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {course.duration && (
                      <span className="text-sm text-gray-600">
                        المدة: {course.duration} ساعة
                      </span>
                    )}
                  </div>
                  {user ? (
                    isEnrolled ? (
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full" variant="outline">
                          متابعة الدورة
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full">
                          التسجيل في الدورة
                        </Button>
                      </Link>
                    )
                  ) : (
                    <a href={getLoginUrl()}>
                      <Button className="w-full">
                        سجل للالتحاق بالدورة
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!courses || courses.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد دورات متاحة حالياً</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-t">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">لماذا تختار منصتنا؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">محتوى تعليمي متميز</h4>
              <p className="text-gray-600">دورات مصممة بعناية من قبل خبراء التعليم</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">تقييم فوري</h4>
              <p className="text-gray-600">اختبارات تفاعلية مع نتائج فورية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">متابعة مستمرة</h4>
              <p className="text-gray-600">تقارير مفصلة لتتبع تقدمك</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="text-gray-400">
            © 2026 منصة تأهيل المدرسين. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
