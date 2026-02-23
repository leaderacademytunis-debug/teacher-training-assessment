import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";


export default function CompleteRegistration() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstNameAr: "",
    lastNameAr: "",
    firstNameFr: "",
    lastNameFr: "",
    phone: "",
    idCardNumber: "",
  });
  
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.profile.uploadPaymentReceipt.useMutation();
  
  const completeMutation = trpc.profile.completeRegistration.useMutation({
    onSuccess: () => {
      toast.success("تم إكمال التسجيل بنجاح!");
      setLocation("/");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت");
        return;
      }
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("نوع الملف غير مدعوم. يرجى استخدام صورة أو PDF");
        return;
      }
      setPaymentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentFile) {
      toast.error("يرجى إرفاق وصل الخلاص");
      return;
    }

    try {
      setUploading(true);
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:image/xxx;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(paymentFile);
      });
      
      const base64Data = await base64Promise;
      const fileExtension = paymentFile.name.split('.').pop() || 'jpg';
      
      // Upload via tRPC
      const uploadResult = await uploadMutation.mutateAsync({
        base64Data,
        fileExtension,
        mimeType: paymentFile.type,
      });

      // Submit registration
      await completeMutation.mutateAsync({
        ...formData,
        paymentReceiptUrl: uploadResult.url,
      });
    } catch (error) {
      toast.error("فشل رفع الملف. يرجى المحاولة مرة أخرى");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
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
            <CardDescription>يرجى تسجيل الدخول لإكمال التسجيل</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If already registered, redirect
  if (user.registrationCompleted) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-gray-900">إكمال التسجيل</h1>
          <p className="text-gray-600 mt-1">يرجى ملء جميع البيانات المطلوبة</p>
        </div>
      </header>

      {/* Registration Form */}
      <section className="container py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              نموذج التسجيل
            </CardTitle>
            <CardDescription>
              جميع الحقول مطلوبة. يرجى التأكد من صحة البيانات المدخلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+216 XX XXX XXX"
                  required
                  dir="ltr"
                />
              </div>

              {/* Arabic Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstNameAr">الاسم بالعربية *</Label>
                  <Input
                    id="firstNameAr"
                    value={formData.firstNameAr}
                    onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                    placeholder="محمد"
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastNameAr">اللقب بالعربية *</Label>
                  <Input
                    id="lastNameAr"
                    value={formData.lastNameAr}
                    onChange={(e) => setFormData({ ...formData, lastNameAr: e.target.value })}
                    placeholder="العربي"
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              {/* French Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstNameFr">Prénom en français *</Label>
                  <Input
                    id="firstNameFr"
                    value={formData.firstNameFr}
                    onChange={(e) => setFormData({ ...formData, firstNameFr: e.target.value })}
                    placeholder="Mohamed"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastNameFr">Nom en français *</Label>
                  <Input
                    id="lastNameFr"
                    value={formData.lastNameFr}
                    onChange={(e) => setFormData({ ...formData, lastNameFr: e.target.value })}
                    placeholder="Arabi"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* ID Card Number */}
              <div className="space-y-2">
                <Label htmlFor="idCardNumber">رقم بطاقة التعريف الوطنية *</Label>
                <Input
                  id="idCardNumber"
                  value={formData.idCardNumber}
                  onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                  placeholder="XXXXXXXX"
                  required
                  dir="ltr"
                />
              </div>

              {/* Payment Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="paymentReceipt">وصل الخلاص (Payment Receipt) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    id="paymentReceipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="paymentReceipt" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    {paymentFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-600">
                          ✓ {paymentFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(paymentFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          انقر لاختيار الملف
                        </p>
                        <p className="text-xs text-gray-500">
                          صورة أو PDF (حد أقصى 5 ميجابايت)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={uploading || completeMutation.isPending}
                >
                  {uploading || completeMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5 ml-2" />
                      إكمال التسجيل
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
