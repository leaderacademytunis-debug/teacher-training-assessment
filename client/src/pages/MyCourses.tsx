import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function MyCourses() {
  const { user, loading: authLoading } = useAuth();
  const { data: enrollments, isLoading } = trpc.enrollments.myEnrollments.useQuery();

  if (authLoading || isLoading) {
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
            <CardTitle>يجب تسجيل الدخول</CardTitle>
            <CardDescription>الرجاء تسجيل الدخول لعرض دوراتك</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    active: "نشط",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">دوراتي</h1>
              <p className="text-gray-600 mt-1">تابع تقدمك في الدورات التدريبية</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Courses List */}
      <section className="container py-12">
        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(({ enrollment, course }) => {
              if (!course) return null;
              
              return (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className={statusColors[enrollment.status]}>
                        {statusLabels[enrollment.status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{course.titleAr}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {course.descriptionAr || "دورة تدريبية متخصصة"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">تاريخ التسجيل:</span>{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString("ar-EG")}
                      </div>
                      {enrollment.completedAt && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">تاريخ الإكمال:</span>{" "}
                          {new Date(enrollment.completedAt).toLocaleDateString("ar-EG")}
                        </div>
                      )}
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full mt-4">
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <CardTitle>لا توجد دورات مسجلة</CardTitle>
              <CardDescription className="text-base">
                لم تسجل في أي دورة تدريبية بعد. تصفح الدورات المتاحة وابدأ رحلتك التعليمية
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/">
                <Button>تصفح الدورات المتاحة</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
