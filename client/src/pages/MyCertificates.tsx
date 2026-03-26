import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Download, ArrowRight, Star, CheckCircle, Lock, PenTool, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export default function MyCertificates() {
  const { user, loading: authLoading } = useAuth();
  const { data: certificates, isLoading, refetch } = trpc.certificates.listMyCertificates.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();
  const { data: eligibility, isLoading: eligibilityLoading } = trpc.certificates.checkCumulativeEligibility.useQuery();
  const { data: correctionRequests, refetch: refetchRequests } = trpc.certificates.myCorrectionRequests.useQuery();

  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    requestedFirstNameAr: "",
    requestedLastNameAr: "",
    requestedFirstNameFr: "",
    requestedLastNameFr: "",
    reason: "",
  });

  const generateCumulative = trpc.certificates.generateCumulative.useMutation({
    onSuccess: () => {
      toast.success("مبروك! تم إصدار الشهادة الجامعة بنجاح 🎉");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء إصدار الشهادة");
    },
  });

  const submitCorrection = trpc.certificates.submitCorrectionRequest.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowCorrectionDialog(false);
      setCorrectionForm({ requestedFirstNameAr: "", requestedLastNameAr: "", requestedFirstNameFr: "", requestedLastNameFr: "", reason: "" });
      refetchRequests();
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ");
    },
  });

  const hasPendingRequest = useMemo(() => {
    return correctionRequests?.some((r) => r.status === "pending") || false;
  }, [correctionRequests]);

  const openCorrectionDialog = () => {
    if (user) {
      setCorrectionForm({
        requestedFirstNameAr: user.firstNameAr || "",
        requestedLastNameAr: user.lastNameAr || "",
        requestedFirstNameFr: user.firstNameFr || "",
        requestedLastNameFr: user.lastNameFr || "",
        reason: "",
      });
    }
    setShowCorrectionDialog(true);
  };

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={openCorrectionDialog}
                disabled={hasPendingRequest}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <PenTool className="w-4 h-4 ml-2" />
                {hasPendingRequest ? "طلب قيد المراجعة" : "طلب تصحيح الاسم"}
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container py-12 space-y-12">

        {/* ===== Name Correction Requests Status ===== */}
        {correctionRequests && correctionRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <PenTool className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">طلبات تصحيح الاسم</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {correctionRequests.map((req) => (
                <Card key={req.id} className={`border ${
                  req.status === "pending" ? "border-amber-300 bg-amber-50/50" :
                  req.status === "approved" ? "border-green-300 bg-green-50/50" :
                  "border-red-300 bg-red-50/50"
                }`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      {req.status === "pending" && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                          <Clock className="w-3 h-3 ml-1" />
                          قيد المراجعة
                        </Badge>
                      )}
                      {req.status === "approved" && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          تمت الموافقة
                        </Badge>
                      )}
                      {req.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          <XCircle className="w-3 h-3 ml-1" />
                          مرفوض
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 mr-auto">
                        {new Date(req.createdAt).toLocaleDateString("ar-TN")}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex gap-2">
                        <span className="text-gray-500">الاسم الحالي:</span>
                        <span className="text-red-600 line-through">
                          {req.currentFirstNameAr} {req.currentLastNameAr}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500">الاسم المطلوب:</span>
                        <span className="text-green-700 font-medium">
                          {req.requestedFirstNameAr} {req.requestedLastNameAr}
                        </span>
                      </div>
                      {req.reason && (
                        <div className="flex gap-2">
                          <span className="text-gray-500">السبب:</span>
                          <span className="text-gray-700">{req.reason}</span>
                        </div>
                      )}
                      {req.reviewNote && (
                        <div className="flex gap-2 mt-2 pt-2 border-t">
                          <span className="text-gray-500">ملاحظة الإدارة:</span>
                          <span className="text-gray-700">{req.reviewNote}</span>
                        </div>
                      )}
                      {req.status === "approved" && req.certificatesRegenerated && req.certificatesRegenerated > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            تم إعادة إصدار {req.certificatesRegenerated} شهادة
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 absolute -top-1 -right-1" />
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
                  <Download className="w-5 h-5 ml-2" />
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
                      <Lock className="w-8 h-8 text-gray-400 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right">
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
                              <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الإصدار...</>
                            ) : (
                              <><Star className="w-4 h-4 ml-2 fill-white" />إصدار الشهادة الجامعة</>
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
                          <CheckCircle className="w-5 h-5 text-green-500 fill-green-100 absolute -bottom-1 -right-1" />
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
                        <Download className="w-4 h-4 ml-2" />
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

      {/* ===== Name Correction Request Dialog ===== */}
      <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <PenTool className="w-5 h-5 text-orange-500" />
              طلب تصحيح الاسم
            </DialogTitle>
            <DialogDescription>
              أدخل الاسم الصحيح وسبب التصحيح. سيتم مراجعة الطلب من قبل الإدارة وإعادة إصدار الشهادات تلقائياً عند الموافقة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Current name display */}
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500 mb-1">الاسم الحالي:</p>
              <p className="font-medium text-gray-800">
                {user.firstNameAr || ""} {user.lastNameAr || ""}
                {(user.firstNameFr || user.lastNameFr) && (
                  <span className="text-gray-500 text-sm mr-2" dir="ltr">
                    ({user.firstNameFr || ""} {user.lastNameFr || ""})
                  </span>
                )}
              </p>
            </div>

            {/* Arabic name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700">الاسم الأول (عربي)</Label>
                <Input
                  value={correctionForm.requestedFirstNameAr}
                  onChange={(e) => setCorrectionForm(prev => ({ ...prev, requestedFirstNameAr: e.target.value }))}
                  className="mt-1"
                  dir="rtl"
                  placeholder="الاسم الأول"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">اللقب (عربي)</Label>
                <Input
                  value={correctionForm.requestedLastNameAr}
                  onChange={(e) => setCorrectionForm(prev => ({ ...prev, requestedLastNameAr: e.target.value }))}
                  className="mt-1"
                  dir="rtl"
                  placeholder="اللقب"
                />
              </div>
            </div>

            {/* French name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700">Prénom (فرنسي)</Label>
                <Input
                  value={correctionForm.requestedFirstNameFr}
                  onChange={(e) => setCorrectionForm(prev => ({ ...prev, requestedFirstNameFr: e.target.value }))}
                  className="mt-1"
                  dir="ltr"
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Nom (فرنسي)</Label>
                <Input
                  value={correctionForm.requestedLastNameFr}
                  onChange={(e) => setCorrectionForm(prev => ({ ...prev, requestedLastNameFr: e.target.value }))}
                  className="mt-1"
                  dir="ltr"
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label className="text-sm text-gray-700">سبب التصحيح <span className="text-red-500">*</span></Label>
              <Textarea
                value={correctionForm.reason}
                onChange={(e) => setCorrectionForm(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
                placeholder="مثال: خطأ إملائي في الاسم، اسم العائلة غير مكتمل..."
                rows={3}
              />
            </div>

            {/* Info note */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
              <p className="font-medium mb-1">ملاحظة:</p>
              <p>بعد موافقة الإدارة، سيتم تحديث اسمك وإعادة إصدار جميع شهاداتك بالاسم الجديد تلقائياً.</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCorrectionDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (!correctionForm.reason.trim()) {
                  toast.error("يرجى ذكر سبب التصحيح");
                  return;
                }
                submitCorrection.mutate({
                  requestedFirstNameAr: correctionForm.requestedFirstNameAr || undefined,
                  requestedLastNameAr: correctionForm.requestedLastNameAr || undefined,
                  requestedFirstNameFr: correctionForm.requestedFirstNameFr || undefined,
                  requestedLastNameFr: correctionForm.requestedLastNameFr || undefined,
                  reason: correctionForm.reason,
                });
              }}
              disabled={submitCorrection.isPending || !correctionForm.reason.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {submitCorrection.isPending ? (
                <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الإرسال...</>
              ) : (
                <><Send className="w-4 h-4 ml-2" />إرسال الطلب</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
