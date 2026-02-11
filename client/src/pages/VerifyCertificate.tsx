import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Search, Award, Calendar, User, BookOpen, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: certificate, isLoading, error, refetch } = trpc.certificates.verify.useQuery(
    { certificateNumber: searchQuery },
    { enabled: searchQuery.length > 0, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateNumber.trim()) {
      setSearchQuery(certificateNumber.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-lg font-bold text-blue-600">
                ← العودة للرئيسية
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">التحقق من الشهادات</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Search Card */}
          <Card className="mb-8 shadow-lg border-2">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Award className="w-12 h-12" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">التحقق من صحة الشهادة</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                أدخل رقم الشهادة للتحقق من صحتها ومعلومات حاملها
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="أدخل رقم الشهادة (مثال: CERT-2024-001)"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    className="text-lg h-14 text-right"
                    dir="ltr"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    disabled={isLoading || !certificateNumber.trim()}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        جاري البحث...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        بحث
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 text-center">
                  💡 رقم الشهادة موجود في أسفل الشهادة بصيغة: CERT-YYYY-XXXX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {error && (
            <Alert className="mb-6 border-2 border-red-300 bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 text-lg font-medium">
                {error.message === "Certificate not found" 
                  ? "الشهادة غير موجودة. يرجى التحقق من رقم الشهادة والمحاولة مرة أخرى."
                  : "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى."}
              </AlertDescription>
            </Alert>
          )}

          {certificate && (
            <Card className="shadow-xl border-2 border-green-300 animate-in fade-in duration-500">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                  <CardTitle className="text-3xl font-bold">شهادة صحيحة ✓</CardTitle>
                </div>
                <CardDescription className="text-white/90 text-center text-lg">
                  تم التحقق من صحة الشهادة بنجاح
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Certificate Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Participant Name */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-600 p-3 rounded-full text-white">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">اسم الحامل</p>
                      <p className="text-xl font-bold text-gray-900">{certificate.user?.name || "غير متوفر"}</p>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-600 p-3 rounded-full text-white">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">الدورة التدريبية</p>
                      <p className="text-xl font-bold text-gray-900">{certificate.course?.titleAr || "غير متوفر"}</p>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="bg-purple-600 p-3 rounded-full text-white">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">تاريخ الإصدار</p>
                      <p className="text-xl font-bold text-gray-900">
                        {new Date(certificate.certificate.issuedAt).toLocaleDateString("ar-TN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="bg-amber-600 p-3 rounded-full text-white">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">النتيجة</p>
                      <p className="text-xl font-bold text-gray-900">
                        {certificate.attempt?.score || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Number */}
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300 text-center">
                  <p className="text-sm text-gray-600 mb-1">رقم الشهادة</p>
                  <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {certificate.certificate.certificateNumber}
                  </p>
                </div>

                {/* Download Button */}
                {certificate.certificate.pdfUrl && (
                  <div className="text-center pt-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8"
                    >
                      <a href={certificate.certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                        📥 تحميل الشهادة
                      </a>
                    </Button>
                  </div>
                )}

                {/* Verification Note */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700 text-center">
                    ✅ هذه الشهادة صادرة رسمياً من ليدر أكاديمي وتم التحقق من صحتها
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 ليدر أكاديمي - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
