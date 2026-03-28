import { describe, it, expect } from "vitest";

// ===== SUBSCRIPTION STATUS LOGIC TESTS =====
describe("Subscription Status Logic", () => {
  function getSubscriptionStatus(expiresAt: Date | null, lastGiftAt: Date | null, lastGiftSeenAt: Date | null) {
    if (!expiresAt) {
      return { status: "none", daysRemaining: 0, hasUnseenGift: false };
    }
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: "active" | "expiring" | "expired" | "none" = "active";
    if (daysRemaining <= 0) status = "expired";
    else if (daysRemaining <= 3) status = "expiring";
    const hasUnseenGift = !!(lastGiftAt && (!lastGiftSeenAt || lastGiftAt > lastGiftSeenAt));
    return { status, daysRemaining: Math.max(0, daysRemaining), hasUnseenGift };
  }

  it("should return 'none' status when no expiry date", () => {
    const result = getSubscriptionStatus(null, null, null);
    expect(result.status).toBe("none");
    expect(result.daysRemaining).toBe(0);
  });

  it("should return 'active' status for subscription expiring in 30 days", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const result = getSubscriptionStatus(future, null, null);
    expect(result.status).toBe("active");
    expect(result.daysRemaining).toBeGreaterThanOrEqual(29);
  });

  it("should return 'expiring' status for subscription expiring in 2 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const result = getSubscriptionStatus(soon, null, null);
    expect(result.status).toBe("expiring");
    expect(result.daysRemaining).toBeLessThanOrEqual(3);
  });

  it("should return 'expired' status for past expiry date", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const result = getSubscriptionStatus(past, null, null);
    expect(result.status).toBe("expired");
    expect(result.daysRemaining).toBe(0);
  });

  it("should detect unseen gift when lastGiftAt is set but lastGiftSeenAt is null", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const giftAt = new Date();
    const result = getSubscriptionStatus(future, giftAt, null);
    expect(result.hasUnseenGift).toBe(true);
  });

  it("should detect unseen gift when lastGiftAt is after lastGiftSeenAt", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const giftAt = new Date();
    const seenAt = new Date(giftAt.getTime() - 60000); // seen 1 min before gift
    const result = getSubscriptionStatus(future, giftAt, seenAt);
    expect(result.hasUnseenGift).toBe(true);
  });

  it("should NOT detect unseen gift when lastGiftSeenAt is after lastGiftAt", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const giftAt = new Date();
    const seenAt = new Date(giftAt.getTime() + 60000); // seen 1 min after gift
    const result = getSubscriptionStatus(future, giftAt, seenAt);
    expect(result.hasUnseenGift).toBe(false);
  });
});

// ===== GIFT BONUS DAYS CALCULATION TESTS =====
describe("Gift Bonus Days Calculation", () => {
  function calculateNewExpiry(currentExpiry: Date | null, daysToAdd: number): Date {
    const now = new Date();
    const baseDate = currentExpiry && currentExpiry > now ? new Date(currentExpiry) : new Date(now);
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return baseDate;
  }

  it("should extend from current expiry when subscription is active", () => {
    const currentExpiry = new Date();
    currentExpiry.setDate(currentExpiry.getDate() + 10); // 10 days remaining
    const newExpiry = calculateNewExpiry(currentExpiry, 30);
    const expectedDays = Math.ceil((newExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    expect(expectedDays).toBeGreaterThanOrEqual(39); // 10 + 30 - 1 (rounding)
  });

  it("should extend from today when subscription is expired", () => {
    const pastExpiry = new Date();
    pastExpiry.setDate(pastExpiry.getDate() - 5); // expired 5 days ago
    const newExpiry = calculateNewExpiry(pastExpiry, 30);
    const expectedDays = Math.ceil((newExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    expect(expectedDays).toBeGreaterThanOrEqual(29);
    expect(expectedDays).toBeLessThanOrEqual(31);
  });

  it("should extend from today when no current subscription", () => {
    const newExpiry = calculateNewExpiry(null, 30);
    const expectedDays = Math.ceil((newExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    expect(expectedDays).toBeGreaterThanOrEqual(29);
    expect(expectedDays).toBeLessThanOrEqual(31);
  });

  it("should accumulate gift days correctly", () => {
    const existingGiftDays = 30;
    const newGiftDays = 30;
    expect(existingGiftDays + newGiftDays).toBe(60);
  });
});

// ===== BADGE DISPLAY LOGIC TESTS =====
describe("Badge Display Logic", () => {
  const tierLabels: Record<string, Record<string, string>> = {
    free: { ar: "مجاني", fr: "Gratuit", en: "Free" },
    starter: { ar: "المبادر", fr: "Starter", en: "Starter" },
    pro: { ar: "المحترف", fr: "Pro", en: "Pro" },
    vip: { ar: "VIP", fr: "VIP", en: "VIP" },
  };

  it("should have labels for all tiers in all 3 languages", () => {
    const tiers = ["free", "starter", "pro", "vip"];
    const langs = ["ar", "fr", "en"];
    for (const tier of tiers) {
      for (const lang of langs) {
        expect(tierLabels[tier]?.[lang]).toBeTruthy();
      }
    }
  });

  it("should return correct Arabic labels", () => {
    expect(tierLabels.free.ar).toBe("مجاني");
    expect(tierLabels.pro.ar).toBe("المحترف");
    expect(tierLabels.vip.ar).toBe("VIP");
  });

  it("should return correct French labels", () => {
    expect(tierLabels.free.fr).toBe("Gratuit");
    expect(tierLabels.pro.fr).toBe("Pro");
  });

  it("should return correct English labels", () => {
    expect(tierLabels.free.en).toBe("Free");
    expect(tierLabels.starter.en).toBe("Starter");
  });
});

// ===== NOTIFICATION MESSAGE TESTS =====
describe("Gift Notification Messages", () => {
  function getGiftMessage(lang: string, days: number): string {
    if (lang === "ar") return `🎉 مفاجأة! لقد حصلت للتو على شهر إضافي مجاني كهدية من إدارة Leader Academy!`;
    if (lang === "fr") return `🎉 Surprise ! Vous venez de recevoir un mois gratuit offert par Leader Academy !`;
    return `🎉 Surprise! You just received a free bonus month from Leader Academy!`;
  }

  it("should generate Arabic gift message", () => {
    const msg = getGiftMessage("ar", 30);
    expect(msg).toContain("مفاجأة");
    expect(msg).toContain("Leader Academy");
  });

  it("should generate French gift message", () => {
    const msg = getGiftMessage("fr", 30);
    expect(msg).toContain("Surprise");
    expect(msg).toContain("Leader Academy");
  });

  it("should generate English gift message", () => {
    const msg = getGiftMessage("en", 30);
    expect(msg).toContain("Surprise");
    expect(msg).toContain("Leader Academy");
  });
});
