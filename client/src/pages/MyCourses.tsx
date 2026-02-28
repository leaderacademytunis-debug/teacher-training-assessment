import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyCourses() {
  const { user, loading: authLoading } = useAuth();
  const { data: enrollments, isLoading } = trpc.enrollments.myEnrollments.useQuery();
  const { t, language } = useLanguage();

  const i18n = {
    ar: {
      loginRequired: "يجب تسجيل الدخول",
      loginDesc: "الرجاء تسجيل الدخول لعرض دوراتك",
      title: "دوراتي",
      subtitle: "تابع تقدمك في الدورات التدريبية",
      backHome: "العودة للرئيسية",
      enrollDate: "تاريخ التسجيل:",
      completedDate: "تاريخ الإكمال:",
      viewDetails: "عرض التفاصيل",
      noCourses: "لا توجد دورات مسجلة",
      noCoursesDesc: "لم تسجل في أي دورة تدريبية بعد. تصفح الدورات المتاحة وابدأ رحلتك التعليمية",
      browseCourses: "تصفح الدورات المتاحة",
      defaultDesc: "دورة تدريبية متخصصة",
      statusLabels: { pending: "قيد الانتظار", approved: "مقبول", rejected: "مرفوض", active: "نشط", completed: "مكتمل", cancelled: "ملغي" },
      locale: "ar-EG",
    },
    fr: {
      loginRequired: "Connexion requise",
      loginDesc: "Veuillez vous connecter pour voir vos cours",
      title: "Mes cours",
      subtitle: "Suivez votre progression dans les formations",
      backHome: "Retour à l'accueil",
      enrollDate: "Date d'inscription :",
      completedDate: "Date de complétion :",
      viewDetails: "Voir les détails",
      noCourses: "Aucun cours inscrit",
      noCoursesDesc: "Vous n'êtes inscrit à aucune formation. Parcourez les formations disponibles et commencez votre parcours",
      browseCourses: "Parcourir les formations",
      defaultDesc: "Formation spécialisée",
      statusLabels: { pending: "En attente", approved: "Accepté", rejected: "Refusé", active: "Actif", completed: "Terminé", cancelled: "Annulé" },
      locale: "fr-FR",
    },
    en: {
      loginRequired: "Login required",
      loginDesc: "Please log in to view your courses",
      title: "My Courses",
      subtitle: "Track your progress in training programs",
      backHome: "Back to Home",
      enrollDate: "Enrollment date:",
      completedDate: "Completion date:",
      viewDetails: "View details",
      noCourses: "No courses enrolled",
      noCoursesDesc: "You haven't enrolled in any course yet. Browse available courses and start your learning journey",
      browseCourses: "Browse available courses",
      defaultDesc: "Specialized training course",
      statusLabels: { pending: "Pending", approved: "Approved", rejected: "Rejected", active: "Active", completed: "Completed", cancelled: "Cancelled" },
      locale: "en-US",
    },
  };
  const tx = i18n[language as keyof typeof i18n] || i18n.ar;

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
            <CardTitle>{tx.loginRequired}</CardTitle>
            <CardDescription>{tx.loginDesc}</CardDescription>
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

  const statusLabels = tx.statusLabels;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tx.title}</h1>
              <p className="text-gray-600 mt-1">{tx.subtitle}</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 ml-2" />
                {tx.backHome}
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
                      {course.descriptionAr || tx.defaultDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{tx.enrollDate}</span>{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString(tx.locale)}
                      </div>
                      {enrollment.completedAt && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{tx.completedDate}</span>{" "}
                          {new Date(enrollment.completedAt).toLocaleDateString(tx.locale)}
                        </div>
                      )}
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full mt-4">
                          {tx.viewDetails}
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
              <CardTitle>{tx.noCourses}</CardTitle>
              <CardDescription className="text-base">
                {tx.noCoursesDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/">
                <Button>{tx.browseCourses}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
