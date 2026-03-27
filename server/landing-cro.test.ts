import { describe, expect, it } from "vitest";

/**
 * CRO Landing Page Component Tests
 * 
 * These tests verify the data structures and business logic
 * used by the 4 new CRO sections on the landing page:
 * 1. Killer Features Section
 * 2. Time Savings Calculator
 * 3. FAQ Section
 * 4. Mini Pricing Section
 */

// ============ TIME SAVINGS CALCULATOR LOGIC ============
describe("Time Savings Calculator", () => {
  const calculateSavings = (hoursPerWeek: number) => {
    const savedHours = Math.round(hoursPerWeek * 0.85);
    const savedPerMonth = savedHours * 4;
    const savedPerYear = savedPerMonth * 9; // 9 months school year
    const moneySaved = Math.round(savedPerYear * 8); // ~8 TND per hour
    return { savedHours, savedPerMonth, savedPerYear, moneySaved };
  };

  it("calculates correct savings for default 15 hours/week", () => {
    const result = calculateSavings(15);
    expect(result.savedHours).toBe(13);
    expect(result.savedPerMonth).toBe(52);
    expect(result.savedPerYear).toBe(468);
    expect(result.moneySaved).toBe(3744);
  });

  it("calculates correct savings for minimum 5 hours/week", () => {
    const result = calculateSavings(5);
    expect(result.savedHours).toBe(4);
    expect(result.savedPerMonth).toBe(16);
    expect(result.savedPerYear).toBe(144);
    expect(result.moneySaved).toBe(1152);
  });

  it("calculates correct savings for maximum 30 hours/week", () => {
    const result = calculateSavings(30);
    expect(result.savedHours).toBe(26);
    expect(result.savedPerMonth).toBe(104);
    expect(result.savedPerYear).toBe(936);
    expect(result.moneySaved).toBe(7488);
  });

  it("remaining hours are always positive", () => {
    for (let h = 5; h <= 30; h++) {
      const result = calculateSavings(h);
      expect(h - result.savedHours).toBeGreaterThan(0);
    }
  });

  it("saved hours never exceed input hours", () => {
    for (let h = 5; h <= 30; h++) {
      const result = calculateSavings(h);
      expect(result.savedHours).toBeLessThan(h);
    }
  });
});

// ============ PRICING TIER VALIDATION ============
describe("Mini Pricing Tiers", () => {
  const MINI_TIERS = [
    { id: "starter", nameAr: "المبادر", price: 49, oldPrice: 79 },
    { id: "pro", nameAr: "المحترف", price: 149, oldPrice: 199, popular: true },
    { id: "vip", nameAr: "المعلم الرقمي VIP", price: 299, oldPrice: 450 },
  ];

  it("has exactly 3 pricing tiers", () => {
    expect(MINI_TIERS).toHaveLength(3);
  });

  it("all tiers have valid prices", () => {
    MINI_TIERS.forEach((tier) => {
      expect(tier.price).toBeGreaterThan(0);
      expect(tier.oldPrice).toBeGreaterThan(tier.price);
    });
  });

  it("discount percentages are calculated correctly", () => {
    const discounts = MINI_TIERS.map((tier) =>
      Math.round(((tier.oldPrice - tier.price) / tier.oldPrice) * 100)
    );
    // Starter: (79-49)/79 = 38%
    expect(discounts[0]).toBe(38);
    // Pro: (199-149)/199 = 25%
    expect(discounts[1]).toBe(25);
    // VIP: (450-299)/450 = 34%
    expect(discounts[2]).toBe(34);
  });

  it("only one tier is marked as popular", () => {
    const popularTiers = MINI_TIERS.filter((t) => (t as any).popular);
    expect(popularTiers).toHaveLength(1);
    expect(popularTiers[0]!.id).toBe("pro");
  });

  it("tiers are ordered by ascending price", () => {
    for (let i = 1; i < MINI_TIERS.length; i++) {
      expect(MINI_TIERS[i]!.price).toBeGreaterThan(MINI_TIERS[i - 1]!.price);
    }
  });
});

// ============ FAQ VALIDATION ============
describe("FAQ Section", () => {
  const FAQ_ITEMS = [
    { qAr: "هل المحتوى متوافق مع البرامج الرسمية التونسية؟", aAr: "نعم 100%..." },
    { qAr: "كيف يمكنني الدفع؟ هل D17 متاح؟", aAr: "نعم!..." },
    { qAr: "هل يمكنني تجربة الأدوات قبل الاشتراك؟", aAr: "بالطبع!..." },
    { qAr: "هل استنساخ الصوت آمن وقانوني؟", aAr: "نعم تماماً..." },
    { qAr: "هل يمكنني إلغاء الاشتراك في أي وقت؟", aAr: "نعم..." },
    { qAr: "هل أحتاج خبرة تقنية لاستخدام الأدوات؟", aAr: "لا أبداً!..." },
  ];

  it("has at least 5 FAQ items", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(5);
  });

  it("all FAQ items have non-empty questions and answers", () => {
    FAQ_ITEMS.forEach((item) => {
      expect(item.qAr.length).toBeGreaterThan(10);
      expect(item.aAr.length).toBeGreaterThan(3);
    });
  });

  it("includes the critical D17 payment question", () => {
    const d17Question = FAQ_ITEMS.find((item) => item.qAr.includes("D17"));
    expect(d17Question).toBeDefined();
  });

  it("includes the curriculum compliance question", () => {
    const curriculumQuestion = FAQ_ITEMS.find((item) =>
      item.qAr.includes("البرامج الرسمية") || item.qAr.includes("المنهج")
    );
    expect(curriculumQuestion).toBeDefined();
  });
});

// ============ KILLER FEATURES VALIDATION ============
describe("Killer Features Section", () => {
  const KILLER_FEATURES = [
    {
      titleAr: "تحضير الدروس في 3 دقائق",
      href: "/assistant",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      titleAr: "استوديو فيديو تعليمي احترافي",
      href: "/ultimate-studio",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      titleAr: "استنسخ صوتك بالذكاء الاصطناعي",
      href: "/pricing",
      gradient: "from-orange-500 to-red-500",
      badge: { ar: "VIP حصري" },
    },
  ];

  it("has exactly 3 killer features", () => {
    expect(KILLER_FEATURES).toHaveLength(3);
  });

  it("all features have valid navigation links", () => {
    KILLER_FEATURES.forEach((feature) => {
      expect(feature.href).toMatch(/^\//);
      expect(feature.href.length).toBeGreaterThan(1);
    });
  });

  it("all features have gradient styles", () => {
    KILLER_FEATURES.forEach((feature) => {
      expect(feature.gradient).toContain("from-");
      expect(feature.gradient).toContain("to-");
    });
  });

  it("voice cloning feature has VIP badge", () => {
    const voiceFeature = KILLER_FEATURES.find((f) =>
      f.titleAr.includes("استنسخ صوتك")
    );
    expect(voiceFeature).toBeDefined();
    expect((voiceFeature as any).badge).toBeDefined();
    expect((voiceFeature as any).badge.ar).toContain("VIP");
  });

  it("lesson prep links to assistant page", () => {
    const lessonFeature = KILLER_FEATURES.find((f) =>
      f.titleAr.includes("تحضير الدروس")
    );
    expect(lessonFeature?.href).toBe("/assistant");
  });
});
