import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");

function readFile(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf-8");
}

describe("i18n System - LanguageContext", () => {
  const ctx = readFile("client/src/contexts/LanguageContext.tsx");

  it("should have Arabic as the fallback default language", () => {
    // The detectBrowserLanguage function should return "ar" as default
    expect(ctx).toContain('return "ar"');
    // The getInitialLanguage should check localStorage via safeGetItem
    expect(ctx).toContain("safeGetItem(STORAGE_KEY)");
  });

  it("should detect browser language (fr, en, ar)", () => {
    expect(ctx).toContain("navigator.languages");
    expect(ctx).toContain("navigator.language");
    expect(ctx).toContain('code === "fr"');
    expect(ctx).toContain('code === "en"');
    expect(ctx).toContain('code === "ar"');
  });

  it("should save language choice to localStorage via safeSetItem", () => {
    expect(ctx).toContain("safeSetItem(STORAGE_KEY, lang)");
  });

  it("should update document direction for RTL/LTR", () => {
    expect(ctx).toContain('document.documentElement.dir = language === "ar" ? "rtl" : "ltr"');
    expect(ctx).toContain("document.documentElement.lang = language");
  });

  it("should export useLanguage hook and LanguageProvider", () => {
    expect(ctx).toContain("export function LanguageProvider");
    expect(ctx).toContain("export function useLanguage");
  });

  it("should support three languages: ar, fr, en", () => {
    expect(ctx).toContain('export type AppLanguage = "ar" | "fr" | "en"');
  });
});

describe("UnifiedNavbar Component", () => {
  const navbar = readFile("client/src/components/UnifiedNavbar.tsx");

  it("should have EDUGPT Tools dropdown with translated title", () => {
    expect(navbar).toContain('"أدوات EDUGPT"');
    expect(navbar).toContain('"Outils EDUGPT"');
    expect(navbar).toContain('"EDUGPT Tools"');
  });

  it("should contain all AI tools in the dropdown", () => {
    expect(navbar).toContain("/assistant");
    expect(navbar).toContain("/inspector");
    expect(navbar).toContain("/exam-builder");
    expect(navbar).toContain("/visual-studio");
    expect(navbar).toContain("/legacy-digitizer");
    expect(navbar).toContain("/curriculum-map");
    expect(navbar).toContain("/blind-grading");
    expect(navbar).toContain("/marketplace");
    expect(navbar).toContain("/drama-engine");
    expect(navbar).toContain("/handwriting-analyzer");
    expect(navbar).toContain("/video-evaluator");
  });

  it("should have language switcher with three flags", () => {
    expect(navbar).toContain('flag: "🇹🇳"');
    expect(navbar).toContain('flag: "🇫🇷"');
    expect(navbar).toContain('flag: "🇬🇧"');
  });

  it("should have Certificates dropdown with translated labels", () => {
    expect(navbar).toContain('"الشهادات"');
    expect(navbar).toContain('"Certificats"');
    expect(navbar).toContain('"Certificates"');
  });

  it("should have Career dropdown with translated labels", () => {
    expect(navbar).toContain('"المسار المهني"');
    expect(navbar).toContain('"Carrière"');
    expect(navbar).toContain('"Career"');
  });

  it("should have Management/Admin dropdown with translated labels", () => {
    expect(navbar).toContain('"الإدارة"');
    expect(navbar).toContain('"Administration"');
    expect(navbar).toContain('"Management"');
  });

  it("should have mobile menu toggle", () => {
    expect(navbar).toContain("mobileMenuOpen");
    expect(navbar).toContain("setMobileMenuOpen");
    expect(navbar).toContain("lg:hidden");
  });

  it("should have mobile language switcher section", () => {
    // Mobile menu should have language options (rendered via LANGUAGES array)
    expect(navbar).toContain('label: "العربية"');
    expect(navbar).toContain('label: "Français"');
    expect(navbar).toContain('label: "English"');
  });

  it("should have About link with translated labels", () => {
    expect(navbar).toContain('"من نحن"');
    expect(navbar).toContain('"À propos"');
    expect(navbar).toContain('"About Us"');
  });

  it("should have Pricing link with translated labels", () => {
    expect(navbar).toContain('"الأسعار"');
    expect(navbar).toContain('"Tarifs"');
    expect(navbar).toContain('"Pricing"');
  });

  it("should have translated subtitle under Leader Academy logo", () => {
    expect(navbar).toContain('"نحو تعليم رقمي متميز"');
    expect(navbar).toContain("Vers un enseignement numérique d'excellence");
    expect(navbar).toContain('"Towards excellent digital education"');
  });
});

describe("Home.tsx - UnifiedNavbar Integration", () => {
  const home = readFile("client/src/pages/Home.tsx");

  it("should import UnifiedNavbar", () => {
    expect(home).toContain('import UnifiedNavbar from "@/components/UnifiedNavbar"');
  });

  it("should render UnifiedNavbar component", () => {
    expect(home).toContain("<UnifiedNavbar />");
  });

  it("should have translated hero subtitle", () => {
    expect(home).toContain("Réduisez des heures de préparation épuisantes");
    expect(home).toContain("Cut exhausting hours of preparation down to minutes");
  });

  it("should have translated CTA buttons", () => {
    expect(home).toContain('"Essayer les outils IA"');
    expect(home).toContain('"Try Smart Tools"');
    expect(home).toContain('"Voir la vidéo"');
    expect(home).toContain('"Watch Demo Video"');
  });
});
