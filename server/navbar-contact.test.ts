import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const clientDir = join(__dirname, "..", "client", "src");

describe("UnifiedNavbar Integration", () => {
  it("UnifiedNavbar component exists", () => {
    const path = join(clientDir, "components", "UnifiedNavbar.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("UnifiedNavbar has EDUGPT Tools dropdown with i18n labels", () => {
    const content = readFileSync(join(clientDir, "components", "UnifiedNavbar.tsx"), "utf-8");
    expect(content).toContain("أدوات EDUGPT");
    expect(content).toContain("Outils EDUGPT");
    expect(content).toContain("EDUGPT Tools");
  });

  it("UnifiedNavbar has Contact link", () => {
    const content = readFileSync(join(clientDir, "components", "UnifiedNavbar.tsx"), "utf-8");
    expect(content).toContain("/contact");
    expect(content).toContain("تواصل معنا");
    expect(content).toContain("Contact");
  });

  it("UnifiedNavbar has language switcher with 3 languages", () => {
    const content = readFileSync(join(clientDir, "components", "UnifiedNavbar.tsx"), "utf-8");
    expect(content).toContain("العربية");
    expect(content).toContain("Français");
    expect(content).toContain("English");
    expect(content).toContain("🇹🇳");
    expect(content).toContain("🇫🇷");
    expect(content).toContain("🇬🇧");
  });

  it("UnifiedNavbar has mobile menu support", () => {
    const content = readFileSync(join(clientDir, "components", "UnifiedNavbar.tsx"), "utf-8");
    expect(content).toContain("Menu");
    expect(content).toMatch(/mobile|mobileOpen|setMobileOpen/i);
  });

  it("EduGPT page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "EduGPT.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("import UnifiedNavbar");
  });

  it("Marketplace page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "Marketplace.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("import UnifiedNavbar");
  });

  it("Pricing page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "Pricing.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("import UnifiedNavbar");
  });

  it("About page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "About.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("import UnifiedNavbar");
  });

  it("Home page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "Home.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("import UnifiedNavbar");
  });
});

describe("Testimonials Translation", () => {
  it("Testimonials section has trilingual title", () => {
    const content = readFileSync(join(clientDir, "pages", "Home.tsx"), "utf-8");
    // Check for Arabic testimonials title
    expect(content).toContain("ماذا يقول المربّون عنّا");
    // Check for French translation
    expect(content).toMatch(/Ce que disent nos enseignants|Témoignages/);
    // Check for English translation
    expect(content).toMatch(/What Teachers Say|Teacher Testimonials/);
  });

  it("Testimonials section uses t() function for translations", () => {
    const content = readFileSync(join(clientDir, "pages", "Home.tsx"), "utf-8");
    // The testimonials section should use the t() translation function for individual testimonials
    expect(content).toContain("testimonial.textAr");
    expect(content).toContain("testimonial.textFr");
    expect(content).toContain("testimonial.textEn");
    expect(content).toContain("testimonial.nameAr");
    expect(content).toContain("testimonial.roleFr");
  });
});

describe("Contact Page", () => {
  it("Contact page exists", () => {
    const path = join(clientDir, "pages", "Contact.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("Contact page uses UnifiedNavbar", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("UnifiedNavbar");
    expect(content).toContain("<UnifiedNavbar");
  });

  it("Contact page has SEOHead", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("SEOHead");
    expect(content).toContain("<SEOHead");
  });

  it("Contact page has trilingual form labels", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    // Arabic
    expect(content).toContain("الاسم الكامل");
    expect(content).toContain("البريد الإلكتروني");
    expect(content).toContain("إرسال الرسالة");
    // French
    expect(content).toContain("Nom complet");
    expect(content).toContain("Envoyer le message");
    // English
    expect(content).toContain("Full Name");
    expect(content).toContain("Send Message");
  });

  it("Contact page has trilingual subjects", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("استفسار عام");
    expect(content).toContain("Demande générale");
    expect(content).toContain("General Inquiry");
    expect(content).toContain("دعم تقني");
    expect(content).toContain("Support technique");
    expect(content).toContain("Technical Support");
  });

  it("Contact page has FAQ section with trilingual content", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("أسئلة شائعة");
    expect(content).toContain("Questions fréquentes");
    expect(content).toContain("FAQ");
  });

  it("Contact page has social links", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("facebook.com");
    expect(content).toContain("leaderacademy.school");
  });

  it("Contact page has success state after submission", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("submitted");
    expect(content).toContain("شكراً لتواصلك معنا");
    expect(content).toContain("Merci de nous avoir contacté");
    expect(content).toContain("Thank you for contacting us");
  });

  it("Contact page uses contact.send tRPC mutation", () => {
    const content = readFileSync(join(clientDir, "pages", "Contact.tsx"), "utf-8");
    expect(content).toContain("trpc.contact.send.useMutation");
  });

  it("Contact route is registered in App.tsx", () => {
    const content = readFileSync(join(clientDir, "App.tsx"), "utf-8");
    expect(content).toContain('"/contact"');
    expect(content).toContain("Contact");
  });
});
