import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Download, ArrowRight, Star, CheckCircle, Lock } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import useI18n from "@/i18n";


export default function MyCertificates() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { data: certificates, isLoading, refetch } = trpc.certificates.listMyCertificates.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();
  const { data: eligibility, isLoading: eligibilityLoading } = trpc.certificates.checkCumulativeEligibility.useQuery();

  const generateCumulative = trpc.certificates.generateCumulative.useMutation({
    onSuccess: () => {
      toast.success("مبروك! تم إصدار الشهادة الجامعة بنجاح 🎉");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء إصدار الشهادة");
    },
  });

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

  // Separate comprehensive certificate from regular ones
  const regularCerts = certificates?.filter(c => c.course?.titleAr !== 'تأهيل أصحاب الشهادات العليا') || [];
  const comprehensiveCert = certificates?.find(c => c.course?.titleAr === 'تأهيل أصحاب الشهادات العليا');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
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
                <ArrowRight className="w-4 h-4 me-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container py-12 space-y-12">

        {/* ===== Comprehensive Certificate Section ===== */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-bold text-gray-800">الشهادة الجامعة</h2>
            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">
              شهادة إتمام المسار الكامل
            </Badge>
          </div>

          {comprehensiveCert ? (
            /* Already has comprehensive certificate */
            <Card className="border-2 border-amber-400 shadow-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Award className="w-24 h-24 text-amber-500" />
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 absolute -top-1 -end-1" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-amber-800">الشهادة الجامعة</CardTitle>
                <CardDescription className="text-amber-700 font-medium">
                  تأهيل أصحاب الشهادات العليا للتدريس في المدارس الابتدائية الخاصة
                </CardDescription>
                <p className="text-sm text-gray-500 mt-2">رقم الشهادة: {comprehensiveCert.certificateNumber}</p>
                <p className="text-sm text-gray-500">
                  تاريخ الإصدار: {new Date(comprehensiveCert.issuedAt).toLocaleDateString("ar-TN")}
                </p>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <Button
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                  onClick={() => comprehensiveCert.pdfUrl && window.open(comprehensiveCert.pdfUrl, "_blank")}
                >
                  <Download className="w-5 h-5 ms-2" />
                  تحميل الشهادة الجامعة
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Progress toward comprehensive certificate */
            <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
              <CardContent className="py-8 px-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Award className="w-20 h-20 text-gray-300" />
                      <Lock className="w-8 h-8 text-gray-400 absolute -bottom-1 -end-1 bg-white rounded-full p-1" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-end">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      الشهادة الجامعة — تأهيل أصحاب الشهادات العليا
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      أكمل جميع الدورات الخمس الأساسية للحصول على هذه الشهادة المميزة
                    </p>

                    {!eligibilityLoading && eligibility && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">التقدم:</span>
                          <span className="font-semibold text-amber-700">
                            {eligibility.completedCount} / {eligibility.requiredCount} دورات
                          </span>
                        </div>
                        <Progress
                          value={(eligibility.completedCount / eligibility.requiredCount) * 100}
                          className="h-3 bg-amber-100"
                        />

                        {eligibility.missingCourses.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">الدورات المتبقية:</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                              {eligibility.missingCourses.map((c) => (
                                <Badge key={c} variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {eligibility.eligible && (
                          <Button
                            size="lg"
                            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white w-full md:w-auto"
                            onClick={() => generateCumulative.mutate()}
                            disabled={generateCumulative.isPending}
                          >
                            {generateCumulative.isPending ? (
                              <><Loader2 className="w-4 h-4 ms-2 animate-spin" />جاري الإصدار...</>
                            ) : (
                              <><Star className="w-4 h-4 ms-2 fill-white" />إصدار الشهادة الجامعة</>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== Regular Certificates ===== */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">شهادات الدورات</h2>
            {regularCerts.length > 0 && (
              <Badge variant="secondary">{regularCerts.length} شهادة</Badge>
            )}
          </div>

          {regularCerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularCerts.map((cert) => {
                const course = courses?.find((c) => c.id === cert.courseId);
                return (
                  <Card key={cert.id} className="hover:shadow-lg transition-shadow border border-blue-100">
                    <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          <Award className="w-14 h-14 text-blue-500" />
                          <CheckCircle className="w-5 h-5 text-green-500 fill-green-100 absolute -bottom-1 -end-1" />
                        </div>
                      </div>
                      <CardTitle className="text-center text-lg leading-tight">
                        {course?.titleAr || cert.course?.titleAr || "دورة تدريبية"}
                      </CardTitle>
                      <CardDescription className="text-center text-xs">
                        رقم الشهادة: {cert.certificateNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5">
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span className="font-semibold">تاريخ الإصدار:</span>
                          <span>{new Date(cert.issuedAt).toLocaleDateString("ar-TN")}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => cert.pdfUrl && window.open(cert.pdfUrl, "_blank")}
                      >
                        <Download className="w-4 h-4 ms-2" />
                        تحميل الشهادة
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto border-dashed">
              <CardContent className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد شهادات بعد</h3>
                <p className="text-gray-500 mb-6">أكمل الدورات واجتاز الاختبارات للحصول على الشهادات</p>
                <Link href="/">
                  <Button size="lg">تصفح الدورات المتاحة</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

      </section>
    </div>
  );
}
