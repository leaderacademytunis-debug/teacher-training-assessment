import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins, ArrowUp, ArrowDown, Gift, RotateCcw, Home,
  ChevronRight, Loader2, AlertCircle, Sparkles, Mic, Image, Volume2
} from "lucide-react";
import useI18n from "@/i18n";


export default function MyPoints() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  
  const pointsQuery = trpc.voiceCloning.getMyPoints.useQuery(undefined, {
    enabled: !!user,
  });
  const historyQuery = trpc.voiceCloning.getPointsHistory.useQuery(
    { limit: 30 },
    { enabled: !!user }
  );
  const pricingQuery = trpc.voiceCloning.getPricing.useQuery(undefined, {
    enabled: !!user,
  });
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg">يرجى تسجيل الدخول للوصول إلى هذه الميزة</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const points = pointsQuery.data;
  const history = historyQuery.data ?? [];
  const pricing = pricingQuery.data;
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "earn": return <ArrowUp className="h-4 w-4 text-emerald-600" />;
      case "spend": return <ArrowDown className="h-4 w-4 text-red-500" />;
      case "bonus": return <Gift className="h-4 w-4 text-amber-500" />;
      case "refund": return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };
  
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "earn": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">ربح</Badge>;
      case "spend": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">إنفاق</Badge>;
      case "bonus": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">مكافأة</Badge>;
      case "refund": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">استرداد</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-slate-50 to-violet-50/30" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/teacher-tools">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 ms-1" />
              الأدوات
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-lg font-bold bg-gradient-to-l from-amber-600 to-orange-600 bg-clip-text text-transparent">
            💰 نقاطي - Leader Points
          </h1>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Balance Card */}
        <Card className="border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 overflow-hidden relative">
          <div className="absolute top-0 start-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 end-0 w-24 h-24 bg-orange-200/20 rounded-full translate-x-1/2 translate-y-1/2" />
          <CardContent className="pt-8 pb-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-sm text-amber-700 font-medium mb-1">رصيدك الحالي</h2>
              <div className="text-5xl font-bold text-amber-800 mb-2">
                {points?.balance ?? <Loader2 className="h-8 w-8 animate-spin inline" />}
              </div>
              <p className="text-sm text-amber-600">نقطة متاحة</p>
            </div>
            
            {points && (
              <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">إجمالي المكتسب</p>
                  <p className="font-bold text-emerald-600">+{points.totalEarned}</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">إجمالي المنفق</p>
                  <p className="font-bold text-red-500">-{points.totalSpent}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pricing Table */}
        {pricing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                تسعيرة الخدمات
              </CardTitle>
              <CardDescription>تكلفة كل ميزة بالنقاط</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <Mic className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">صوت مستنسخ (TTS)</h4>
                    <p className="text-xs text-muted-foreground">لكل مشهد</p>
                  </div>
                  <Badge className="me-auto bg-violet-100 text-violet-700 hover:bg-violet-100">
                    {pricing.voiceCloneTTS} نقاط
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">صوت عادي (TTS)</h4>
                    <p className="text-xs text-muted-foreground">لكل مشهد</p>
                  </div>
                  <Badge className="me-auto bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {pricing.standardTTS} نقطة
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    <Image className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">توليد صورة</h4>
                    <p className="text-xs text-muted-foreground">لكل مشهد</p>
                  </div>
                  <Badge className="me-auto bg-pink-100 text-pink-700 hover:bg-pink-100">
                    {pricing.imageGeneration} نقاط
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📜 سجل المعاملات</CardTitle>
            <CardDescription>آخر {history.length} معاملة</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد معاملات بعد</p>
                <p className="text-sm mt-1">ابدأ باستخدام أدوات الذكاء الاصطناعي!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                    {getTypeIcon(tx.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.featureUsed && <span className="ms-2">{tx.featureUsed}</span>}
                        {tx.createdAt && (
                          <span className="me-2">
                            {new Date(tx.createdAt).toLocaleDateString("ar-TN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-start">
                      {getTypeBadge(tx.type)}
                      <p className={`text-sm font-bold mt-1 ${
                        tx.amount > 0 ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
