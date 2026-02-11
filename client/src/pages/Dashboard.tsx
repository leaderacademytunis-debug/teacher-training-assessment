import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Users, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import ManageCourses from "@/components/ManageCourses";
import ManageExams from "@/components/ManageExams";
import ManageQuestions from "@/components/ManageQuestions";
import Statistics from "@/components/Statistics";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: courses } = trpc.courses.list.useQuery();

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
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>
              ليس لديك صلاحية للوصول إلى لوحة التحكم
            </CardDescription>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 mt-1">إدارة الدورات والاختبارات والمشاركين</p>
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

      {/* Dashboard Content */}
      <section className="container py-8">
        <Tabs defaultValue="courses" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              الدورات
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="w-4 h-4" />
              الاختبارات
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <Users className="w-4 h-4" />
              الأسئلة
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              الإحصائيات
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
        </Tabs>
      </section>
    </div>
  );
}
