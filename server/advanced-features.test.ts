import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");

// ============================================================
// 1. EDUGPT PDF Export Enhancement Tests
// ============================================================
describe("EDUGPT PDF Export Enhancement", () => {
  const exportFile = readFileSync(resolve(ROOT, "server/exportConversation.ts"), "utf-8");

  it("includes QR code generation import", () => {
    expect(exportFile).toMatch(/qrcode|QRCode|qr.*code/i);
  });

  it("includes Leader Academy header in PDF template", () => {
    expect(exportFile).toMatch(/المساعد البيداغوجي الذكي/);
  });

  it("includes Tunisia 2026 in header", () => {
    expect(exportFile).toMatch(/تونس 2026|نسخة تونس/);
  });

  it("includes footer with AI generation credit", () => {
    expect(exportFile).toMatch(/تم التوليد بواسطة الذكاء الاصطناعي/);
  });

  it("includes Leader Academy in footer", () => {
    expect(exportFile).toMatch(/Leader Academy/);
  });

  it("includes Tunisia flag emoji or reference in footer", () => {
    expect(exportFile).toMatch(/🇹🇳|tunisia|تونس/i);
  });

  it("includes QR code pointing to leaderacademy.school", () => {
    expect(exportFile).toMatch(/leaderacademy\.school/);
  });

  it("uses Arabic-compatible font (Amiri or similar)", () => {
    expect(exportFile).toMatch(/Amiri|Traditional Arabic|Cairo|Noto Sans Arabic|font-family.*arabic/i);
  });
});

// ============================================================
// 2. Pricing Page Enhancement Tests
// ============================================================
describe("Pricing Page Enhancement", () => {
  const pricingFile = readFileSync(resolve(ROOT, "client/src/pages/Pricing.tsx"), "utf-8");

  it("imports useLanguage for trilingual badge", () => {
    expect(pricingFile).toMatch(/useLanguage/);
  });

  it("has OLD_PRICES for strikethrough display", () => {
    expect(pricingFile).toMatch(/OLD_PRICES/);
  });

  it("shows strikethrough old price with line-through", () => {
    expect(pricingFile).toMatch(/line-through/);
  });

  it("shows discount percentage badge", () => {
    expect(pricingFile).toMatch(/-.*%/);
  });

  it("has Smart Choice badge text in Arabic", () => {
    expect(pricingFile).toMatch(/الخيار الأذكى/);
  });

  it("has Smart Choice badge text in French", () => {
    expect(pricingFile).toMatch(/Le choix intelligent/);
  });

  it("has Smart Choice badge text in English", () => {
    expect(pricingFile).toMatch(/Smart Choice/);
  });

  it("highlights EDUGPT PRO card with special styling", () => {
    expect(pricingFile).toMatch(/isEdugptPro/);
  });

  it("uses Award icon for the smart choice badge", () => {
    expect(pricingFile).toMatch(/Award/);
  });

  it("applies special border/ring to EDUGPT PRO card", () => {
    expect(pricingFile).toMatch(/border-blue-400.*shadow-xl|ring-2.*ring-blue-200/);
  });
});

// ============================================================
// 3. Marketplace Gamification Tests
// ============================================================
describe("Marketplace Gamification", () => {
  const marketplaceFile = readFileSync(resolve(ROOT, "client/src/pages/Marketplace.tsx"), "utf-8");
  const routersFile = readFileSync(resolve(ROOT, "server/routers.ts"), "utf-8");

  describe("Backend - getTopContributors procedure", () => {
    it("defines getTopContributors procedure", () => {
      expect(routersFile).toMatch(/getTopContributors.*publicProcedure/);
    });

    it("calculates leader points (10 per item, 5 per rating)", () => {
      expect(routersFile).toMatch(/totalItems \* 10/);
      expect(routersFile).toMatch(/totalRatings \* 5/);
    });

    it("assigns creative_teacher badge for 5+ items", () => {
      expect(routersFile).toMatch(/totalItems >= 5.*creative_teacher/);
    });

    it("assigns subject_expert badge for 4.5+ rating", () => {
      expect(routersFile).toMatch(/avgRating >= 4\.5.*subject_expert/);
    });

    it("returns enriched data with user names", () => {
      expect(routersFile).toMatch(/arabicName.*name.*معلم/);
    });
  });

  describe("Frontend - Gamification UI", () => {
    it("imports Trophy and Crown icons", () => {
      expect(marketplaceFile).toMatch(/Trophy/);
      expect(marketplaceFile).toMatch(/Crown/);
    });

    it("imports useLanguage for trilingual badges", () => {
      expect(marketplaceFile).toMatch(/useLanguage/);
    });

    it("defines GAMIFICATION_BADGES with creative_teacher", () => {
      expect(marketplaceFile).toMatch(/creative_teacher/);
      expect(marketplaceFile).toMatch(/معلم مبدع/);
    });

    it("defines GAMIFICATION_BADGES with subject_expert", () => {
      expect(marketplaceFile).toMatch(/subject_expert/);
      expect(marketplaceFile).toMatch(/خبير المادة/);
    });

    it("has Top Contributors section title in Arabic", () => {
      expect(marketplaceFile).toMatch(/أفضل المعلمين هذا الشهر/);
    });

    it("has Top Contributors section title in French", () => {
      expect(marketplaceFile).toMatch(/Meilleurs enseignants du mois/);
    });

    it("has Top Contributors section title in English", () => {
      expect(marketplaceFile).toMatch(/Top Contributors This Month/);
    });

    it("shows leader points with Flame icon", () => {
      expect(marketplaceFile).toMatch(/Flame/);
      expect(marketplaceFile).toMatch(/leaderPoints/);
    });

    it("shows badges on marketplace item cards", () => {
      expect(marketplaceFile).toMatch(/topContributors\?\.find.*publishedBy.*badges/);
    });

    it("calls getTopContributors query", () => {
      expect(marketplaceFile).toMatch(/trpc\.marketplace\.getTopContributors\.useQuery/);
    });

    it("displays up to 5 top contributors", () => {
      expect(marketplaceFile).toMatch(/topContributors\.slice\(0, 5\)/);
    });
  });
});
