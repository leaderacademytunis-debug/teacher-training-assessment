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
  Check, X, Crown, Sparkles, BookOpen, GraduationCap, Package,
  Upload, ArrowRight, Shield, Zap, Star, Award, MessageCircle,
  Mic, Video, Brain, FileText, Image, Headphones, Rocket
} from "lucide-react";
import useI18n from "@/i18n";


// ============ TIER DEFINITIONS ============
const TIERS = [
  {
    id: "starter",
    nameAr: "المبادر",
    nameEn: "Starter",
    price: 49,
    oldPrice: 79,
    currency: "TND",
    billing: "شهري",
    description: "للمعلم الذي يريد البدء بأدوات الذكاء الاصطناعي الأساسية",
    color: "emerald",
    icon: <Rocket className="h-7 w-7" />,
    popular: false,
    badge: null,
    features: [
      "EDUGPT المساعد الذكي (20 استخدام/شهر)",
      "منشئ الاختبارات (10 اختبارات/شهر)",
      "المفتش الذكي (5 تقارير/شهر)",
      "المخطط السنوي (5 مخططات/شهر)",
      "الاستوديو البصري (5 صور/شهر)",
      "الوصول للدورات المجانية",
    ],
    excluded: [
      "Ultimate Studio",
      "استنساخ الصوت بالذكاء الاصطناعي",
      "تصدير فيديو MP4",
      "الدعم ذو الأولوية",
      "الاستخدام غير المحدود",
    ],
  },
  {
    id: "pro",
    nameAr: "المحترف",
    nameEn: "Professional",
    price: 149,
    oldPrice: 199,
    currency: "TND",
    billing: "شهري",
    description: "للمعلم المحترف الذي يريد إنتاجية عالية وأدوات متقدمة",
    color: "blue",
    icon: <Brain className="h-7 w-7" />,
    popular: true,
    badge: "الأكثر طلباً",
    features: [
      "جميع ميزات باقة المبادر",
      "EDUGPT المساعد الذكي (100 استخدام/شهر)",
      "منشئ الاختبارات (50 اختبار/شهر)",
      "جميع أدوات AI بلا قيود يومية",
      "Ultimate Studio (بدون استنساخ صوت)",
      "تصدير فيديو MP4 مع هوية بصرية",
      "الاستوديو البصري (50 صورة/شهر)",
      "الوصول لجميع الدورات التدريبية",
      "محلل الخط والتصحيح الذكي",
    ],
    excluded: [
      "استنساخ الصوت بالذكاء الاصطناعي",
      "الدعم ذو الأولوية",
    ],
  },
  {
    id: "vip",
    nameAr: "المعلم الرقمي VIP",
    nameEn: "Digital Teacher VIP",
    price: 299,
    oldPrice: 450,
    currency: "TND",
    billing: "شهري",
    description: "الباقة الكاملة للمعلم الرقمي: صوتك الحقيقي في فيديوهاتك التعليمية",
    color: "amber",
    icon: <Crown className="h-7 w-7" />,
    popular: false,
    badge: "👑 الباقة الملكية",
    features: [
      "جميع ميزات باقة المحترف",
      "استخدام غير محدود لجميع الأدوات",
      "استنساخ الصوت بالذكاء الاصطناعي 🎤",
      "Ultimate Studio الكامل مع Voice Clone",
      "تصدير فيديو MP4 احترافي بصوتك",
      "الاستوديو البصري (غير محدود)",
      "الدعم ذو الأولوية عبر واتساب",
      "الوصول المبكر للميزات الجديدة",
      "شارة VIP في الملف الشخصي",
    ],
    excluded: [],
  },
];

// ============ COMPARISON TABLE ============
const COMPARISON_FEATURES = [
  { category: "أدوات الذكاء الاصطناعي", features: [
    { name: "EDUGPT المساعد الذكي", starter: "20/شهر", pro: "100/شهر", vip: "غير محدود" },
    { name: "منشئ الاختبارات", starter: "10/شهر", pro: "50/شهر", vip: "غير محدود" },
    { name: "المفتش الذكي", starter: "5/شهر", pro: "30/شهر", vip: "غير محدود" },
    { name: "المخطط السنوي", starter: "5/شهر", pro: "20/شهر", vip: "غير محدود" },
    { name: "الاستوديو البصري", starter: "5 صور", pro: "50 صورة", vip: "غير محدود" },
    { name: "محلل الخط", starter: false, pro: true, vip: true },
    { name: "التصحيح الذكي", starter: false, pro: true, vip: true },
  ]},
  { category: "إنتاج الفيديو", features: [
    { name: "Ultimate Studio", starter: false, pro: true, vip: true },
    { name: "استنساخ الصوت AI 🎤", starter: false, pro: false, vip: true },
    { name: "تصدير فيديو MP4", starter: false, pro: true, vip: true },
    { name: "هوية بصرية في الفيديو", starter: false, pro: true, vip: true },
  ]},
  { category: "الدورات والدعم", features: [
    { name: "الدورات المجانية", starter: true, pro: true, vip: true },
    { name: "الدورات المدفوعة", starter: false, pro: true, vip: true },
    { name: "الدعم عبر واتساب", starter: false, pro: false, vip: true },
    { name: "الوصول المبكر للميزات", starter: false, pro: false, vip: true },
  ]},
];

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; gradient: string; ring: string; lightBg: string }> = {
  emerald: { bg: "bg-emerald-500", border: "border-emerald-300", text: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600", ring: "ring-emerald-200", lightBg: "bg-emerald-50" },
  blue: { bg: "bg-blue-500", border: "border-blue-400", text: "text-blue-600", gradient: "from-blue-500 to-indigo-600", ring: "ring-blue-200", lightBg: "bg-blue-50" },
  amber: { bg: "bg-amber-500", border: "border-amber-400", text: "text-amber-600", gradient: "from-amber-500 via-yellow-500 to-amber-600", ring: "ring-amber-200", lightBg: "bg-amber-50" },
};

export default function Pricing() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();
  const { data: permissions } = trpc.adminDashboard.getMyPermissions.useQuery(undefined, { enabled: !!user });
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<typeof TIERS[0] | null>(null);
  const [paymentMode, setPaymentMode] = useState<"bank" | "whatsapp">("bank");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [userNote, setUserNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const submitPayment = trpc.adminDashboard.submitPaymentRequest.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلب الاشتراك بنجاح! سيتم مراجعته وتفعيل حسابك قريباً.");
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

  const handleSubscribe = (tier: typeof TIERS[0]) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    setSelectedTier(tier);
    setPaymentMode("bank");
    setShowPayment(true);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `مرحباً، أريد الاشتراك في باقة "${selectedTier?.nameAr}" بسعر ${selectedTier?.price} ${selectedTier?.currency}/شهر.\nاسمي: ${user?.name || user?.email}\nالبريد: ${user?.email}`
    );
    window.open(`https://wa.me/21658765432?text=${msg}`, "_blank");
  };

  const handleSubmitPayment = () => {
    if (!receiptUrl) {
      toast.error("يرجى رفع إيصال الدفع");
      return;
    }
    submitPayment.mutate({
      requestedService: selectedTier?.id === "vip" ? "full_bundle" : selectedTier?.id === "pro" ? "edugpt_pro" : "course_ai" as any,
      receiptImageUrl: receiptUrl,
      amount: String(selectedTier?.price || 0),
      paymentMethod: "bank_transfer",
      userNote: `[باقة ${selectedTier?.nameAr}] ${userNote}`,
    });
  };

  const getUserTier = () => {
    if (!permissions) return "free";
    return permissions.tier || "free";
  };

  const currentTier = getUserTier();

  const renderCellValue = (val: boolean | string) => {
    if (typeof val === "string") return <span className="text-sm font-medium">{val}</span>;
    if (val === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
    return <X className="h-5 w-5 text-gray-300 mx-auto" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      <SEOHead
        title="الأسعار وخطط الاشتراك - Leader Academy"
        description="اكتشف خطط الاشتراك في Leader Academy. ابدأ مجاناً أو اختر الخطة المناسبة لاحتياجاتك التعليمية."
        descriptionFr="Découvrez les plans d'abonnement Leader Academy."
        ogUrl="/pricing"
      />
      <UnifiedNavbar />

      {/* Hero */}
      <section className="pt-20 pb-12 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="container max-w-3xl relative z-10">
          <Badge className="mb-5 bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 ms-1.5" />
            استثمر في مستقبلك التعليمي
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 text-white">
            اختر باقتك <span className="bg-gradient-to-l from-amber-400 to-yellow-300 bg-clip-text text-transparent">وانطلق</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            أدوات ذكاء اصطناعي متطورة مصممة خصيصاً للمدرسين التونسيين.
            من إنشاء الاختبارات إلى إنتاج الفيديوهات بصوتك الحقيقي.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-8">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((tier) => {
              const colors = COLOR_CLASSES[tier.color];
              const isCurrentTier = currentTier === tier.id;
              const isVIP = tier.id === "vip";
              const isPro = tier.id === "pro";

              return (
                <Card
                  key={tier.id}
                  className={`relative overflow-hidden transition-all duration-300 bg-slate-900/80 backdrop-blur border-slate-700/50 hover:border-slate-600 ${
                    isPro ? `border-2 ${colors.border} shadow-2xl shadow-blue-500/10 scale-[1.03]` : ""
                  } ${isVIP ? `border-2 ${colors.border} shadow-xl shadow-amber-500/10` : ""}`}
                >
                  {/* Top gradient bar */}
                  <div className={`h-1.5 bg-gradient-to-l ${colors.gradient}`} />

                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute top-4 start-4 z-10">
                      <Badge className={`${isPro ? 'bg-gradient-to-l from-blue-600 to-indigo-600' : 'bg-gradient-to-l from-amber-600 to-yellow-500'} text-white border-0 shadow-lg px-3 py-1 text-xs font-bold`}>
                        {isPro && <Award className="h-3.5 w-3.5 ms-1" />}
                        {tier.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-8">
                    <div className={`w-14 h-14 rounded-2xl ${colors.lightBg} ${colors.text} flex items-center justify-center mb-4`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-2xl text-white">{tier.nameAr}</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div>
                      {tier.oldPrice > tier.price && (
                        <div className="mb-1">
                          <span className="text-lg text-slate-500 line-through">{tier.oldPrice} {tier.currency}</span>
                          <Badge variant="destructive" className="me-2 text-xs">
                            -{Math.round(((tier.oldPrice - tier.price) / tier.oldPrice) * 100)}%
                          </Badge>
                        </div>
                      )}
                      <span className={`text-5xl font-bold ${isVIP ? 'bg-gradient-to-l from-amber-400 to-yellow-300 bg-clip-text text-transparent' : 'text-white'}`}>
                        {tier.price}
                      </span>
                      <span className="text-sm text-slate-400 me-2">
                        {tier.currency} / {tier.billing}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <Check className={`h-4 w-4 ${colors.text} shrink-0 mt-0.5`} />
                          <span className="text-slate-300">{f}</span>
                        </li>
                      ))}
                      {tier.excluded.map((f, i) => (
                        <li key={`ex-${i}`} className="flex items-start gap-2.5 text-sm opacity-40">
                          <X className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                          <span className="text-slate-500 line-through">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrentTier ? (
                      <Button className="w-full gap-2 h-12" variant="outline" disabled>
                        <Shield className="h-4 w-4" />
                        باقتك الحالية
                      </Button>
                    ) : (
                      <Button
                        className={`w-full gap-2 h-12 text-base font-semibold bg-gradient-to-l ${colors.gradient} text-white hover:opacity-90 transition-opacity shadow-lg ${isVIP ? 'shadow-amber-500/20' : isPro ? 'shadow-blue-500/20' : ''}`}
                        onClick={() => handleSubscribe(tier)}
                      >
                        {isVIP ? "انضم للنخبة" : "اشترك الآن"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Toggle */}
      <section className="py-8">
        <div className="container max-w-6xl text-center">
          <Button
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? "إخفاء" : "عرض"} جدول المقارنة التفصيلي
          </Button>
        </div>
      </section>

      {/* Comparison Table */}
      {showComparison && (
        <section className="pb-16">
          <div className="container max-w-5xl">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-end p-4 text-slate-400 font-medium w-[40%]">الميزة</th>
                      <th className="p-4 text-center">
                        <span className="text-emerald-400 font-bold">المبادر</span>
                        <div className="text-xs text-slate-500 mt-0.5">{TIERS[0].price} TND</div>
                      </th>
                      <th className="p-4 text-center bg-blue-500/5">
                        <span className="text-blue-400 font-bold">المحترف</span>
                        <div className="text-xs text-slate-500 mt-0.5">{TIERS[1].price} TND</div>
                      </th>
                      <th className="p-4 text-center">
                        <span className="text-amber-400 font-bold">VIP</span>
                        <div className="text-xs text-slate-500 mt-0.5">{TIERS[2].price} TND</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((cat) => (
                      <>
                        <tr key={cat.category}>
                          <td colSpan={4} className="px-4 pt-5 pb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cat.category}</span>
                          </td>
                        </tr>
                        {cat.features.map((f) => (
                          <tr key={f.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 pe-4 text-slate-300">{f.name}</td>
                            <td className="p-3 text-center">{renderCellValue(f.starter)}</td>
                            <td className="p-3 text-center bg-blue-500/5">{renderCellValue(f.pro)}</td>
                            <td className="p-3 text-center">{renderCellValue(f.vip)}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Free tier note */}
      <section className="pb-20">
        <div className="container max-w-lg text-center">
          <Card className="bg-slate-900/50 border-slate-700/50 border-dashed">
            <CardContent className="py-6">
              <h3 className="font-semibold text-white mb-2">الخطة المجانية</h3>
              <p className="text-sm text-slate-400">
                يمكنك استخدام المنصة مجاناً مع ميزات محدودة. سجّل الآن وجرّب الأدوات قبل الاشتراك.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-amber-400" />
              اشتراك في باقة {selectedTier?.nameAr}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Price summary */}
            <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">المبلغ المطلوب</p>
                <p className="text-2xl font-bold text-white">{selectedTier?.price} <span className="text-sm text-slate-400">{selectedTier?.currency}/شهر</span></p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedTier?.id === "vip" ? "bg-amber-500/20 text-amber-400" : selectedTier?.id === "pro" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {selectedTier?.icon}
              </div>
            </div>

            {/* Payment method tabs */}
            <div className="flex gap-2">
              <Button
                variant={paymentMode === "bank" ? "default" : "outline"}
                className={`flex-1 gap-2 ${paymentMode === "bank" ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300"}`}
                onClick={() => setPaymentMode("bank")}
              >
                <Upload className="h-4 w-4" />
                تحويل بنكي / D17
              </Button>
              <Button
                variant={paymentMode === "whatsapp" ? "default" : "outline"}
                className={`flex-1 gap-2 ${paymentMode === "whatsapp" ? "bg-green-600 hover:bg-green-700" : "border-slate-600 text-slate-300"}`}
                onClick={() => setPaymentMode("whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                واتساب مع الإدارة
              </Button>
            </div>

            {paymentMode === "bank" ? (
              <>
                {/* Bank transfer info */}
                <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-4 text-sm space-y-2">
                  <p className="font-semibold text-blue-300">طرق الدفع المتاحة:</p>
                  <ul className="text-blue-200/80 space-y-1.5 me-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      التحويل البنكي
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      D17 / Flouci
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      البريد التونسي (Mandat)
                    </li>
                  </ul>
                  <p className="text-blue-200/60 text-xs mt-2">
                    بعد التحويل، ارفع صورة الإيصال وسيتم تفعيل حسابك خلال ساعات قليلة.
                  </p>
                </div>

                {/* Receipt upload */}
                <div>
                  <Label className="text-slate-300">إيصال الدفع *</Label>
                  <div className="mt-1.5">
                    {receiptUrl ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800/50 rounded-lg">
                        <Check className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-emerald-300">تم رفع الإيصال بنجاح</span>
                        <Button size="sm" variant="ghost" onClick={() => setReceiptUrl("")} className="me-auto text-slate-400">
                          تغيير
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <Upload className="h-8 w-8 text-slate-500" />
                        <span className="text-sm text-slate-400">
                          {uploading ? "جاري الرفع..." : "اضغط لرفع صورة الإيصال"}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <Label className="text-slate-300">ملاحظة (اختياري)</Label>
                  <Textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="أي ملاحظة تريد إضافتها..."
                    rows={2}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-semibold"
                  onClick={handleSubmitPayment}
                  disabled={submitPayment.isPending || !receiptUrl}
                >
                  {submitPayment.isPending ? "جاري الإرسال..." : "إرسال طلب الاشتراك"}
                </Button>
              </>
            ) : (
              <>
                {/* WhatsApp mode */}
                <div className="bg-green-950/50 border border-green-800/50 rounded-xl p-5 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-300 font-semibold mb-1">تواصل مباشر مع الإدارة</p>
                    <p className="text-green-200/60 text-sm">
                      اضغط على الزر أدناه لفتح محادثة واتساب مع فريق Leader Academy.
                      سيتم تفعيل حسابك فوراً بعد تأكيد الدفع.
                    </p>
                  </div>
                  <Button
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5" />
                    فتح واتساب مع الإدارة
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
