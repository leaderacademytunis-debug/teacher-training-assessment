import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, AlertTriangle, XCircle, Crown, Gift, Sparkles } from "lucide-react";
import { Link } from "wouter";
import useI18n from "@/i18n";
import { toast } from "sonner";

export default function SubscriptionBadge() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { data: subStatus, refetch } = trpc.adminDashboard.getMySubscriptionStatus.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });
  const markGiftSeen = trpc.adminDashboard.markGiftSeen.useMutation({
    onSuccess: () => refetch(),
  });

  const [showGiftToast, setShowGiftToast] = useState(false);

  // Show gift toast when user has unseen gift
  useEffect(() => {
    if (subStatus?.hasUnseenGift && !showGiftToast) {
      setShowGiftToast(true);
      const giftMsg = lang === "ar"
        ? `🎉 مفاجأة! لقد حصلت للتو على شهر إضافي مجاني كهدية من إدارة Leader Academy!`
        : lang === "fr"
        ? `🎉 Surprise ! Vous venez de recevoir un mois gratuit offert par Leader Academy !`
        : `🎉 Surprise! You just received a free bonus month from Leader Academy!`;
      
      toast.success(giftMsg, {
        duration: 10000,
        action: {
          label: lang === "ar" ? "شكراً! 🎁" : lang === "fr" ? "Merci ! 🎁" : "Thanks! 🎁",
          onClick: () => markGiftSeen.mutate(),
        },
        onDismiss: () => markGiftSeen.mutate(),
      });
      // Auto-mark as seen after 15 seconds
      setTimeout(() => markGiftSeen.mutate(), 15000);
    }
  }, [subStatus?.hasUnseenGift]);

  if (!user || !subStatus) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString(lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-TN" : "en-US", {
      day: "numeric",
      month: "long",
    });
  };

  const tierLabels: Record<string, Record<string, string>> = {
    free: { ar: "مجاني", fr: "Gratuit", en: "Free" },
    starter: { ar: "المبادر", fr: "Starter", en: "Starter" },
    pro: { ar: "المحترف", fr: "Pro", en: "Pro" },
    vip: { ar: "VIP", fr: "VIP", en: "VIP" },
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-600 border-gray-200",
    starter: "bg-blue-50 text-blue-700 border-blue-200",
    pro: "bg-orange-50 text-orange-700 border-orange-200",
    vip: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const statusConfig = {
    active: {
      icon: <Calendar className="w-3.5 h-3.5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      pulse: false,
    },
    expiring: {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-300 hover:bg-orange-100",
      pulse: true,
    },
    expired: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-300 hover:bg-red-100",
      pulse: true,
    },
    none: {
      icon: <Crown className="w-3.5 h-3.5" />,
      color: "text-gray-500",
      bgColor: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      pulse: false,
    },
  };

  const config = statusConfig[subStatus.status];
  const tierLabel = tierLabels[subStatus.tier]?.[lang] || subStatus.tier;

  // Badge text
  const getBadgeText = () => {
    if (subStatus.status === "none") {
      return lang === "ar" ? "اشترك الآن" : lang === "fr" ? "S'abonner" : "Subscribe";
    }
    if (subStatus.status === "expired") {
      return lang === "ar" ? "منتهي — جدّد" : lang === "fr" ? "Expiré — Renouveler" : "Expired — Renew";
    }
    if (subStatus.status === "expiring") {
      const daysText = lang === "ar"
        ? `${subStatus.daysRemaining} يوم`
        : lang === "fr"
        ? `${subStatus.daysRemaining}j`
        : `${subStatus.daysRemaining}d`;
      return `⚠️ ${daysText}`;
    }
    // Active
    return `🗓️ ${formatDate(subStatus.expiresAt)}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
            ${config.bgColor} ${config.color}
            ${config.pulse ? "animate-pulse" : ""}
          `}
        >
          {config.icon}
          <span className="hidden sm:inline">{getBadgeText()}</span>
          {subStatus.hasUnseenGift && (
            <Gift className="w-3.5 h-3.5 text-pink-500 animate-bounce" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="center">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm">
                {lang === "ar" ? "حالة الاشتراك" : lang === "fr" ? "État de l'abonnement" : "Subscription Status"}
              </span>
            </div>
            <Badge variant="outline" className={`text-[10px] ${tierColors[subStatus.tier]}`}>
              {tierLabel}
            </Badge>
          </div>

          {/* Status details */}
          <div className={`rounded-lg p-3 ${
            subStatus.status === "active" ? "bg-emerald-50" :
            subStatus.status === "expiring" ? "bg-orange-50" :
            subStatus.status === "expired" ? "bg-red-50" : "bg-gray-50"
          }`}>
            {subStatus.status === "none" ? (
              <p className="text-sm text-gray-600">
                {lang === "ar"
                  ? "لا يوجد اشتراك نشط. اشترك الآن للوصول إلى جميع الأدوات."
                  : lang === "fr"
                  ? "Aucun abonnement actif. Abonnez-vous pour accéder à tous les outils."
                  : "No active subscription. Subscribe to access all tools."}
              </p>
            ) : subStatus.status === "expired" ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-700">
                  {lang === "ar" ? "⛔ انتهى الاشتراك!" : lang === "fr" ? "⛔ Abonnement expiré !" : "⛔ Subscription expired!"}
                </p>
                <p className="text-xs text-red-600">
                  {lang === "ar"
                    ? "جدّد اشتراكك لمواصلة استخدام الأدوات المتقدمة."
                    : lang === "fr"
                    ? "Renouvelez pour continuer à utiliser les outils avancés."
                    : "Renew to continue using advanced tools."}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {lang === "ar" ? "ينتهي في" : lang === "fr" ? "Expire le" : "Expires on"}
                  </span>
                  <span className="text-sm font-bold">{formatDate(subStatus.expiresAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {lang === "ar" ? "الأيام المتبقية" : lang === "fr" ? "Jours restants" : "Days remaining"}
                  </span>
                  <span className={`text-sm font-bold ${subStatus.status === "expiring" ? "text-orange-600" : "text-emerald-600"}`}>
                    {subStatus.daysRemaining}
                  </span>
                </div>
                {subStatus.giftBonusDays > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-dashed">
                    <span className="text-xs text-pink-500 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      {lang === "ar" ? "أيام هدية" : lang === "fr" ? "Jours offerts" : "Gift days"}
                    </span>
                    <span className="text-sm font-bold text-pink-600">+{subStatus.giftBonusDays}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          {(subStatus.status === "none" || subStatus.status === "expired") && (
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 me-1.5" />
                {lang === "ar" ? "اشترك الآن" : lang === "fr" ? "S'abonner maintenant" : "Subscribe Now"}
              </Button>
            </Link>
          )}
          {subStatus.status === "expiring" && (
            <Link href="/pricing">
              <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 me-1.5" />
                {lang === "ar" ? "جدّد قبل الانتهاء" : lang === "fr" ? "Renouveler avant expiration" : "Renew Before Expiry"}
              </Button>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
