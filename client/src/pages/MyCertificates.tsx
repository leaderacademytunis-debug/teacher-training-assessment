import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function MyCertificates() {
  const { user, loading: authLoading } = useAuth();
  const { data: certificates, isLoading } = trpc.certificates.listMyCertificates.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();

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
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>يجب تسجيل الدخول لعرض الشهادات</CardDescription>
          </CardHeader>
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
              <h1 className="text-3xl font-bold text-gray-900">شهاداتي</h1>
              <p className="text-gray-600 mt-1">جميع الشهادات التي حصلت عليها</p>
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

      {/* Certificates Grid */}
      <section className="container py-12">
        {certificates && certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const course = courses?.find((c) => c.id === cert.courseId);
              return (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-50 border-b-2 border-amber-200">
                    <div className="flex justify-center mb-4">
                      <Award className="w-16 h-16 text-amber-600" />
                    </div>
                    <CardTitle className="text-center text-xl">
                      {course?.titleAr || "دورة تدريبية"}
                    </CardTitle>
                    <CardDescription className="text-center text-sm">
                      رقم الشهادة: {cert.certificateNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span className="font-semibold">تاريخ الإصدار:</span>
                        <span>
                          {new Date(cert.issuedAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => cert.pdfUrl && window.open(cert.pdfUrl, "_blank")}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الشهادة
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <Award className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                لا توجد شهادات بعد
              </h2>
              <p className="text-gray-600 mb-6">
                أكمل الدورات واجتاز الاختبارات للحصول على الشهادات
              </p>
              <Link href="/">
                <Button size="lg">
                  تصفح الدورات المتاحة
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
