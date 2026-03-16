import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import {
  Check, Crown, Sparkles, BookOpen, GraduationCap, Package,
  Upload, ArrowRight, Shield, Zap, Star, Award
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  edugpt_pro: <Sparkles className="h-6 w-6" />,
  course_ai: <BookOpen className="h-6 w-6" />,
  course_pedagogy: <GraduationCap className="h-6 w-6" />,
  full_bundle: <Package className="h-6 w-6" />,
};

const BILLING_LABELS: Record<string, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  yearly: "سنوي",
  lifetime: "مدى الحياة",
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", gradient: "from-amber-500 to-amber-600" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", gradient: "from-rose-500 to-rose-600" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
};

// Old prices for strikethrough display (in millimes)
const OLD_PRICES: Record<string, number> = {
  full_bundle: 750000, // was 750 TND, now 690 TND
  edugpt_pro: 199000, // was 199 TND, now 149 TND
};

export default function Pricing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: plans, isLoading } = trpc.adminDashboard.listPricingPlans.useQuery();
  const { data: permissions } = trpc.adminDashboard.getMyPermissions.useQuery(undefined, { enabled: !!user });
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [userNote, setUserNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const submitPayment = trpc.adminDashboard.submitPaymentRequest.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلب الاشتراك بنجاح! سيتم مراجعته قريباً.");
      setShowPayment(false);
      setReceiptUrl("");
      setUserNote("");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setReceiptUrl(data.url);
        toast.success("تم رفع الإيصال بنجاح");
      } else {
        toast.error("فشل رفع الملف");
      }
    } catch {
      toast.error("خطأ في رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleSubscribe = (plan: any) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleSubmitPayment = () => {
    if (!receiptUrl) {
      toast.error("يرجى رفع إيصال الدفع");
      return;
    }
    submitPayment.mutate({
      requestedService: selectedPlan.serviceKey as any,
      receiptImageUrl: receiptUrl,
      amount: (selectedPlan.price / 1000).toFixed(3),
      paymentMethod: "bank_transfer",
      userNote,
    });
  };

  const isSubscribed = (serviceKey: string) => {
    if (!permissions) return false;
    if (permissions.accessFullBundle) return true;
    switch (serviceKey) {
      case "edugpt_pro": return permissions.accessEdugpt;
      case "course_ai": return permissions.accessCourseAi;
      case "course_pedagogy": return permissions.accessCoursePedagogy;
      case "full_bundle": return permissions.accessFullBundle;
      default: return false;
    }
  };

  const formatPrice = (price: number) => (price / 1000).toFixed(3);

  const activePlans = plans?.filter(p => p.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <SEOHead
        title="الأسعار وخطط الاشتراك"
        description="اكتشف خطط الاشتراك في Leader Academy. ابدأ مجاناً أو اختر الخطة المناسبة لاحتياجاتك التعليمية."
        descriptionFr="Découvrez les plans d'abonnement Leader Academy. Commencez gratuitement ou choisissez le plan adapté à vos besoins."
        ogUrl="/pricing"
      />
      <UnifiedNavbar />

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="container max-w-3xl">
          <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Star className="h-3 w-3 ml-1" />
            خطط مرنة تناسب احتياجاتك
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            اختر الخطة المناسبة لك
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            أدوات ذكاء اصطناعي متطورة مصممة خصيصاً للمدرسين التونسيين.
            ابدأ مجاناً وقم بالترقية حسب احتياجاتك.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-20">
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">جاري تحميل الخطط...</div>
          ) : activePlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد خطط متاحة حالياً</p>
              <p className="text-sm text-muted-foreground/70 mt-2">يرجى المحاولة لاحقاً</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${activePlans.length <= 3 ? `grid-cols-1 md:grid-cols-${activePlans.length}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {activePlans.map((plan) => {
                const colors = COLOR_MAP[plan.color || "blue"] || COLOR_MAP.blue;
                const subscribed = isSubscribed(plan.serviceKey);
                let featuresList: string[] = [];
                try { featuresList = plan.features ? JSON.parse(plan.features) : []; } catch { featuresList = []; }

                const isEdugptPro = plan.serviceKey === "edugpt_pro" && plan.id === 1;
                const oldPrice = OLD_PRICES[plan.serviceKey];
                const smartBadgeText = t("الخيار الأذكى", "Le choix intelligent", "Smart Choice");

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      isEdugptPro
                        ? 'border-2 border-blue-400 shadow-xl scale-[1.04] ring-2 ring-blue-200'
                        : plan.isPopular ? `border-2 ${colors.border} shadow-md scale-[1.02]` : 'border'
                    }`}
                  >
                    {/* Top gradient bar */}
                    <div className={`h-1.5 bg-gradient-to-l ${isEdugptPro ? 'from-blue-500 via-indigo-500 to-purple-500' : colors.gradient}`} />

                    {/* Smart Choice badge for EDUGPT PRO */}
                    {isEdugptPro && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-lg px-3 py-1 text-xs font-bold gap-1">
                          <Award className="h-3.5 w-3.5" />
                          {smartBadgeText}
                        </Badge>
                      </div>
                    )}

                    {plan.isPopular && !isEdugptPro && (
                      <div className={`absolute top-5 left-5`}>
                        <Badge className={`bg-gradient-to-l ${colors.gradient} text-white border-0`}>
                          {plan.badgeText || t("الأكثر طلباً", "Le plus demandé", "Most Popular")}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-2 pt-6">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}>
                        {SERVICE_ICONS[plan.serviceKey] || <Zap className="h-6 w-6" />}
                      </div>
                      <CardTitle className="text-xl">{plan.nameAr}</CardTitle>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-5">
                      {/* Price with strikethrough old price */}
                      <div>
                        {oldPrice && oldPrice > plan.price && (
                          <div className="mb-1">
                            <span className="text-lg text-muted-foreground line-through">{formatPrice(oldPrice)} {plan.currency}</span>
                            <Badge variant="destructive" className="mr-2 text-xs">
                              -{Math.round(((oldPrice - plan.price) / oldPrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                        <span className={`text-4xl font-bold ${isEdugptPro ? 'text-blue-600' : ''}`}>{formatPrice(plan.price)}</span>
                        <span className="text-sm text-muted-foreground mr-1">
                          {plan.currency} / {BILLING_LABELS[plan.billingPeriod]}
                        </span>
                      </div>

                      {/* Features */}
                      {featuresList.length > 0 && (
                        <ul className="space-y-2.5">
                          {featuresList.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm">
                              <Check className={`h-4 w-4 ${colors.text} shrink-0 mt-0.5`} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* CTA */}
                      {subscribed ? (
                        <Button className="w-full gap-2" variant="outline" disabled>
                          <Shield className="h-4 w-4" />
                          مشترك حالياً
                        </Button>
                      ) : (
                        <Button
                          className={`w-full gap-2 bg-gradient-to-l ${colors.gradient} text-white hover:opacity-90`}
                          onClick={() => handleSubscribe(plan)}
                        >
                          اشترك الآن
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Free tier info */}
          <div className="mt-12 text-center">
            <Card className="max-w-lg mx-auto bg-gray-50 border-dashed">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-2">الخطة المجانية</h3>
                <p className="text-sm text-muted-foreground">
                  يمكنك استخدام المنصة مجاناً مع ميزات محدودة. قم بالترقية للوصول الكامل لجميع الأدوات.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              طلب اشتراك - {selectedPlan?.nameAr}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium text-blue-800">معلومات الدفع:</p>
              <p className="text-blue-700">المبلغ: <strong>{selectedPlan ? formatPrice(selectedPlan.price) : "0"} TND</strong></p>
              <p className="text-blue-700">يرجى تحويل المبلغ عبر:</p>
              <ul className="text-blue-600 space-y-1 mr-4">
                <li>- التحويل البنكي</li>
                <li>- D17 / Flouci</li>
                <li>- البريد التونسي</li>
              </ul>
            </div>

            <div>
              <Label>إيصال الدفع *</Label>
              <div className="mt-1">
                {receiptUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm text-emerald-700">تم رفع الإيصال بنجاح</span>
                    <Button size="sm" variant="ghost" onClick={() => setReceiptUrl("")} className="mr-auto">
                      تغيير
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploading ? "جاري الرفع..." : "اضغط لرفع صورة الإيصال"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label>ملاحظة (اختياري)</Label>
              <Textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="أي ملاحظة تريد إضافتها..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayment(false)}>إلغاء</Button>
            <Button onClick={handleSubmitPayment} disabled={submitPayment.isPending || !receiptUrl}>
              {submitPayment.isPending ? "جاري الإرسال..." : "إرسال طلب الاشتراك"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
