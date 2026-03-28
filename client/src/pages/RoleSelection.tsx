import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  GraduationCap,
  School,
  BookOpen,
  Briefcase,
  Users,
  Star,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Target,
  Award,
  Building2,
  FileText,
  BarChart3,
  MessageSquare,
  Loader2,
} from "lucide-react";
import useI18n from "@/i18n";


const TEACHER_FEATURES = [
  { icon: BookOpen, text: "أدوات ذكاء اصطناعي متقدمة لإعداد الدروس والاختبارات" },
  { icon: Star, text: "نظام نقاط وتصنيفات (مبتدئ → نشط → خبير → رائد)" },
  { icon: Award, text: "ملف مهني رقمي وشهادات معتمدة" },
  { icon: Target, text: "فرص عمل مخصصة من المدارس الشريكة" },
  { icon: BarChart3, text: "تحليلات أداء وتقارير تقدم شخصية" },
  { icon: MessageSquare, text: "تواصل مباشر مع المدارس والمؤسسات" },
];

const SCHOOL_FEATURES = [
  { icon: Briefcase, text: "نشر عروض عمل واستقطاب أفضل المعلمين" },
  { icon: Users, text: "الوصول إلى قاعدة بيانات المعلمين المؤهلين" },
  { icon: Target, text: "محرك مطابقة ذكي يقترح أفضل المرشحين" },
  { icon: BarChart3, text: "لوحة تحكم شاملة لإدارة التوظيف" },
  { icon: FileText, text: "عرض ملفات المعلمين المهنية والشهادات" },
  { icon: MessageSquare, text: "نظام مراسلة مباشر مع المرشحين" },
];

export default function RoleSelection() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"teacher" | "school" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const utils = trpc.useUtils();

  const selectRoleMutation = trpc.profile.selectRole.useMutation({
    onSuccess: (data) => {
      toast.success("تم اختيار نوع الحساب بنجاح!");
      utils.auth.me.invalidate();
      // Redirect based on role
      if (data.newRole === "teacher") {
        navigate("/teacher-tools");
      } else if (data.newRole === "school") {
        navigate("/school-portal");
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setConfirming(false);
    },
  });

  // If user already has a role, redirect
  if (user && user.role !== "user") {
    if (user.role === "teacher") {
      navigate("/teacher-tools");
      return null;
    }
    if (user.role === "school") {
      navigate("/school-portal");
      return null;
    }
    navigate("/");
    return null;
  }

  const handleConfirm = () => {
    if (!selectedRole) return;
    selectRoleMutation.mutate({ role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-gray-700">Leader Academy</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4 text-sm px-4 py-1">
            خطوة واحدة فقط
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            اختر نوع حسابك
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            مرحباً بك في ليدر أكاديمي! اختر نوع حسابك لتخصيص تجربتك. 
            <span className="text-amber-600 font-medium"> هذا الاختيار نهائي</span> ولا يمكن تغييره لاحقاً.
          </p>
        </div>

        {/* Role Cards */}
        {!confirming ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Teacher Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                selectedRole === "teacher" 
                  ? "border-blue-500 shadow-lg shadow-blue-100 bg-blue-50/30" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                  selectedRole === "teacher" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"
                }`}>
                  <GraduationCap className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl">معلّم / مربّي</CardTitle>
                <CardDescription className="text-base">
                  أنا معلم أو مربّي أبحث عن أدوات تعليمية وفرص مهنية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TEACHER_FEATURES.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedRole === "teacher" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">{feature.text}</span>
                    </div>
                  ))}
                </div>
                {selectedRole === "teacher" && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>تم الاختيار</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* School Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                selectedRole === "school" 
                  ? "border-amber-500 shadow-lg shadow-amber-100 bg-amber-50/30" 
                  : "border-gray-200 hover:border-amber-300"
              }`}
              onClick={() => setSelectedRole("school")}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                  selectedRole === "school" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600"
                }`}>
                  <Building2 className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl">مدرسة / مؤسسة تعليمية</CardTitle>
                <CardDescription className="text-base">
                  أمثّل مدرسة أو مؤسسة تعليمية تبحث عن معلمين مؤهلين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SCHOOL_FEATURES.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedRole === "school" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">{feature.text}</span>
                    </div>
                  ))}
                </div>
                {selectedRole === "school" && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-amber-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>تم الاختيار</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  selectedRole === "teacher" ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                }`}>
                  {selectedRole === "teacher" ? <GraduationCap className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
                </div>
                <CardTitle className="text-xl">تأكيد الاختيار</CardTitle>
                <CardDescription className="text-base">
                  أنت على وشك اختيار حساب{" "}
                  <span className="font-bold text-gray-900">
                    {selectedRole === "teacher" ? "معلّم / مربّي" : "مدرسة / مؤسسة تعليمية"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <strong>تنبيه:</strong> هذا الاختيار نهائي ولا يمكن تغييره لاحقاً. 
                  إذا كنت بحاجة لتغيير نوع حسابك مستقبلاً، يرجى التواصل مع الإدارة.
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setConfirming(false)}
                    disabled={selectRoleMutation.isPending}
                  >
                    العودة
                  </Button>
                  <Button 
                    className={`flex-1 ${
                      selectedRole === "teacher" 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                    onClick={handleConfirm}
                    disabled={selectRoleMutation.isPending}
                  >
                    {selectRoleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin ms-2" />
                    ) : null}
                    تأكيد الاختيار
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Continue Button */}
        {!confirming && selectedRole && (
          <div className="text-center mt-8">
            <Button 
              size="lg" 
              className={`px-12 py-6 text-lg rounded-xl shadow-lg transition-all ${
                selectedRole === "teacher" 
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" 
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
              }`}
              onClick={() => setConfirming(true)}
            >
              متابعة
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            لست متأكداً؟ يمكنك تصفح المنصة كمستخدم عادي والاختيار لاحقاً.
          </p>
          <Button variant="link" className="text-gray-500 mt-2" onClick={() => navigate("/")}>
            تخطي والمتابعة كمستخدم عادي
          </Button>
        </div>
      </div>
    </div>
  );
}
