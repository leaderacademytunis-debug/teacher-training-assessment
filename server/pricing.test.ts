import { describe, it, expect, vi } from "vitest";

// ============================================
// Pricing & Paywall System Tests
// ============================================

describe("Pricing Tiers Configuration", () => {
  const TIERS = [
    { id: "starter", nameAr: "المبادر", price: 49, currency: "TND" },
    { id: "pro", nameAr: "المحترف", price: 149, currency: "TND" },
    { id: "vip", nameAr: "المعلم الرقمي", price: 299, currency: "TND" },
  ];

  it("should have exactly 3 pricing tiers", () => {
    expect(TIERS).toHaveLength(3);
  });

  it("should have correct tier IDs", () => {
    const ids = TIERS.map((t) => t.id);
    expect(ids).toEqual(["starter", "pro", "vip"]);
  });

  it("should have ascending prices", () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(TIERS[i].price).toBeGreaterThan(TIERS[i - 1].price);
    }
  });

  it("should use TND currency for all tiers", () => {
    TIERS.forEach((tier) => {
      expect(tier.currency).toBe("TND");
    });
  });

  it("starter tier should cost 49 TND", () => {
    const starter = TIERS.find((t) => t.id === "starter");
    expect(starter?.price).toBe(49);
  });

  it("pro tier should cost 149 TND", () => {
    const pro = TIERS.find((t) => t.id === "pro");
    expect(pro?.price).toBe(149);
  });

  it("vip tier should cost 299 TND", () => {
    const vip = TIERS.find((t) => t.id === "vip");
    expect(vip?.price).toBe(299);
  });
});

describe("Tier Feature Access Control", () => {
  const TIER_FEATURES: Record<string, Record<string, boolean>> = {
    free: {
      eduGPT: true,
      examBuilder: false,
      smartInspector: false,
      annualPlanner: false,
      ultimateStudio: false,
      voiceClone: false,
      videoExport: false,
    },
    starter: {
      eduGPT: true,
      examBuilder: true,
      smartInspector: true,
      annualPlanner: true,
      ultimateStudio: true,
      voiceClone: false,
      videoExport: true,
    },
    pro: {
      eduGPT: true,
      examBuilder: true,
      smartInspector: true,
      annualPlanner: true,
      ultimateStudio: true,
      voiceClone: false,
      videoExport: true,
    },
    vip: {
      eduGPT: true,
      examBuilder: true,
      smartInspector: true,
      annualPlanner: true,
      ultimateStudio: true,
      voiceClone: true,
      videoExport: true,
    },
  };

  it("free tier should have limited access", () => {
    const free = TIER_FEATURES.free;
    expect(free.eduGPT).toBe(true);
    expect(free.examBuilder).toBe(false);
    expect(free.voiceClone).toBe(false);
    expect(free.ultimateStudio).toBe(false);
  });

  it("only VIP tier should have voice clone access", () => {
    expect(TIER_FEATURES.free.voiceClone).toBe(false);
    expect(TIER_FEATURES.starter.voiceClone).toBe(false);
    expect(TIER_FEATURES.pro.voiceClone).toBe(false);
    expect(TIER_FEATURES.vip.voiceClone).toBe(true);
  });

  it("starter and above should have Ultimate Studio access", () => {
    expect(TIER_FEATURES.free.ultimateStudio).toBe(false);
    expect(TIER_FEATURES.starter.ultimateStudio).toBe(true);
    expect(TIER_FEATURES.pro.ultimateStudio).toBe(true);
    expect(TIER_FEATURES.vip.ultimateStudio).toBe(true);
  });

  it("VIP should have all features enabled", () => {
    const vip = TIER_FEATURES.vip;
    Object.values(vip).forEach((val) => {
      expect(val).toBe(true);
    });
  });
});

describe("Smart Paywall Logic", () => {
  const shouldShowPaywall = (userTier: string, feature: string): boolean => {
    if (feature === "voiceClone" && userTier !== "vip") return true;
    return false;
  };

  it("should show paywall for free user trying voice clone", () => {
    expect(shouldShowPaywall("free", "voiceClone")).toBe(true);
  });

  it("should show paywall for starter user trying voice clone", () => {
    expect(shouldShowPaywall("starter", "voiceClone")).toBe(true);
  });

  it("should show paywall for pro user trying voice clone", () => {
    expect(shouldShowPaywall("pro", "voiceClone")).toBe(true);
  });

  it("should NOT show paywall for VIP user trying voice clone", () => {
    expect(shouldShowPaywall("vip", "voiceClone")).toBe(false);
  });
});

describe("Payment Request Validation", () => {
  const validatePaymentRequest = (data: {
    requestedService: string;
    amount: number;
    receiptUrl?: string;
    paymentMethod?: string;
  }) => {
    const errors: string[] = [];
    if (!data.requestedService) errors.push("Service is required");
    if (data.amount <= 0) errors.push("Amount must be positive");
    if (!data.receiptUrl && data.paymentMethod === "bank") {
      errors.push("Receipt is required for bank transfer");
    }
    return { valid: errors.length === 0, errors };
  };

  it("should validate a valid bank transfer request", () => {
    const result = validatePaymentRequest({
      requestedService: "full_bundle",
      amount: 299,
      receiptUrl: "https://storage.example.com/receipt.jpg",
      paymentMethod: "bank",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject bank transfer without receipt", () => {
    const result = validatePaymentRequest({
      requestedService: "full_bundle",
      amount: 299,
      paymentMethod: "bank",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Receipt is required for bank transfer");
  });

  it("should reject zero amount", () => {
    const result = validatePaymentRequest({
      requestedService: "full_bundle",
      amount: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Amount must be positive");
  });

  it("should accept WhatsApp request without receipt", () => {
    const result = validatePaymentRequest({
      requestedService: "full_bundle",
      amount: 299,
      paymentMethod: "whatsapp",
    });
    expect(result.valid).toBe(true);
  });
});

describe("WhatsApp Message Generation", () => {
  const generateWhatsAppMessage = (tier: { nameAr: string; price: number; currency: string }, userName: string, userEmail: string) => {
    return `مرحباً، أريد الاشتراك في باقة "${tier.nameAr}" بسعر ${tier.price} ${tier.currency}/شهر.\nاسمي: ${userName}\nالبريد: ${userEmail}`;
  };

  it("should generate correct WhatsApp message for VIP tier", () => {
    const msg = generateWhatsAppMessage(
      { nameAr: "المعلم الرقمي", price: 299, currency: "TND" },
      "أحمد",
      "ahmed@example.com"
    );
    expect(msg).toContain("المعلم الرقمي");
    expect(msg).toContain("299");
    expect(msg).toContain("أحمد");
    expect(msg).toContain("ahmed@example.com");
  });

  it("should generate correct WhatsApp message for starter tier", () => {
    const msg = generateWhatsAppMessage(
      { nameAr: "المبادر", price: 49, currency: "TND" },
      "سارة",
      "sara@example.com"
    );
    expect(msg).toContain("المبادر");
    expect(msg).toContain("49");
  });
});

describe("Tier Upgrade Path", () => {
  const canUpgrade = (currentTier: string, targetTier: string): boolean => {
    const tierOrder = ["free", "starter", "pro", "vip"];
    const currentIdx = tierOrder.indexOf(currentTier);
    const targetIdx = tierOrder.indexOf(targetTier);
    return targetIdx > currentIdx;
  };

  it("free can upgrade to any paid tier", () => {
    expect(canUpgrade("free", "starter")).toBe(true);
    expect(canUpgrade("free", "pro")).toBe(true);
    expect(canUpgrade("free", "vip")).toBe(true);
  });

  it("starter can upgrade to pro or vip", () => {
    expect(canUpgrade("starter", "pro")).toBe(true);
    expect(canUpgrade("starter", "vip")).toBe(true);
  });

  it("cannot downgrade", () => {
    expect(canUpgrade("vip", "pro")).toBe(false);
    expect(canUpgrade("pro", "starter")).toBe(false);
  });

  it("cannot upgrade to same tier", () => {
    expect(canUpgrade("pro", "pro")).toBe(false);
    expect(canUpgrade("vip", "vip")).toBe(false);
  });
});

describe("Discount Calculation", () => {
  const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  it("should calculate starter discount correctly", () => {
    expect(calculateDiscount(79, 49)).toBe(38);
  });

  it("should calculate pro discount correctly", () => {
    expect(calculateDiscount(199, 149)).toBe(25);
  });

  it("should calculate vip discount correctly", () => {
    expect(calculateDiscount(450, 299)).toBe(34);
  });
});
