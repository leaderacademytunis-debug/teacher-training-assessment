import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Users, FileText, BarChart3, ArrowRight, Video, CheckSquare, UserCheck } from "lucide-react";
import { Link } from "wouter";
import ManageCourses from "@/components/ManageCourses";
import ManageExams from "@/components/ManageExams";
import ManageQuestions from "@/components/ManageQuestions";
import Statistics from "@/components/Statistics";
import ManageVideos from "@/components/ManageVideos";
import EnrollmentApprovals from "@/components/EnrollmentApprovals";
import { useLanguage } from "@/contexts/LanguageContext";

const i18n = {
  ar: {
    unauthorized: "غير مصرح",
    unauthorizedDesc: "ليس لديك صلاحية للوصول إلى لوحة التحكم",
    backHome: "العودة للرئيسية",
    title: "لوحة التحكم",
    subtitle: "إدارة الدورات والاختبارات والمشاركين",
    manageRegistrations: "إدارة التسجيلات",
    tabCourses: "الدورات",
    tabExams: "الاختبارات",
    tabQuestions: "الأسئلة",
    tabStats: "الإحصائيات",
    tabVideos: "الفيديوهات",
    tabApprovals: "طلبات التسجيل",
  },
  fr: {
    unauthorized: "Accès refusé",
    unauthorizedDesc: "Vous n'avez pas les droits pour accéder au tableau de bord",
    backHome: "Retour à l'accueil",
    title: "Tableau de bord",
    subtitle: "Gérer les formations, examens et participants",
    manageRegistrations: "Gérer les inscriptions",
    tabCourses: "Formations",
    tabExams: "Examens",
    tabQuestions: "Questions",
    tabStats: "Statistiques",
    tabVideos: "Vidéos",
    tabApprovals: "Demandes d'inscription",
  },
  en: {
    unauthorized: "Unauthorized",
    unauthorizedDesc: "You don't have permission to access the dashboard",
    backHome: "Back to Home",
    title: "Dashboard",
    subtitle: "Manage courses, exams and participants",
    manageRegistrations: "Manage registrations",
    tabCourses: "Courses",
    tabExams: "Exams",
    tabQuestions: "Questions",
    tabStats: "Statistics",
    tabVideos: "Videos",
    tabApprovals: "Registration requests",
  },
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: courses } = trpc.courses.list.useQuery();
  const { language } = useLanguage();
  const tx = i18n[language as keyof typeof i18n] || i18n.ar;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !["admin", "trainer", "supervisor"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{tx.unauthorized}</CardTitle>
            <CardDescription>
              {tx.unauthorizedDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>{tx.backHome}</Button>
            </Link>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold text-gray-900">{tx.title}</h1>
              <p className="text-gray-600 mt-1">{tx.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/registrations">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <UserCheck className="w-4 h-4 ml-2" />
                  {tx.manageRegistrations}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  {tx.backHome}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="container py-8">
        <Tabs defaultValue="courses" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              {tx.tabCourses}
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="w-4 h-4" />
              {tx.tabExams}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <Users className="w-4 h-4" />
              {tx.tabQuestions}
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {tx.tabStats}
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              {tx.tabVideos}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              {tx.tabApprovals}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <ManageCourses />
          </TabsContent>

          <TabsContent value="exams">
            <ManageExams />
          </TabsContent>

          <TabsContent value="questions">
            <ManageQuestions />
          </TabsContent>

          <TabsContent value="statistics">
            <Statistics />
          </TabsContent>

          <TabsContent value="videos">
            <ManageVideos />
          </TabsContent>

          <TabsContent value="approvals">
            <EnrollmentApprovals />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
