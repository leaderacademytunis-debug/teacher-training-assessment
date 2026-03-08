import { describe, it, expect } from "vitest";
import {
  getNewPaymentRequestEmailTemplate,
  getPaymentApprovedEmailTemplate,
  getPaymentRejectedEmailTemplate,
} from "./emailService";

describe("Payment Email Templates", () => {
  describe("getNewPaymentRequestEmailTemplate", () => {
    it("should generate admin notification email with user info", () => {
      const html = getNewPaymentRequestEmailTemplate(
        "أحمد بن علي",
        "ahmed@example.com",
        "edugpt_pro",
        "45"
      );
      expect(html).toContain("أحمد بن علي");
      expect(html).toContain("ahmed@example.com");
      expect(html).toContain("EDUGPT PRO");
      expect(html).toContain("45 د.ت");
      expect(html).toContain("طلب دفع جديد");
      expect(html).toContain("/admin");
    });

    it("should handle missing amount gracefully", () => {
      const html = getNewPaymentRequestEmailTemplate(
        "سارة",
        "sara@example.com",
        "full_bundle"
      );
      expect(html).toContain("سارة");
      expect(html).toContain("الباقة الكاملة");
      expect(html).not.toContain("د.ت");
    });

    it("should map all service keys to Arabic labels", () => {
      const services = ["edugpt_pro", "course_ai", "course_pedagogy", "full_bundle"];
      const expectedLabels = ["EDUGPT PRO", "دورة الذكاء الاصطناعي", "دورة البيداغوجيا", "الباقة الكاملة"];
      services.forEach((service, i) => {
        const html = getNewPaymentRequestEmailTemplate("test", "test@test.com", service);
        expect(html).toContain(expectedLabels[i]);
      });
    });

    it("should be RTL and Arabic", () => {
      const html = getNewPaymentRequestEmailTemplate("test", "test@test.com", "edugpt_pro");
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });
  });

  describe("getPaymentApprovedEmailTemplate", () => {
    it("should generate approval email with service names", () => {
      const html = getPaymentApprovedEmailTemplate("محمد", ["EDUGPT PRO", "دورة الذكاء الاصطناعي"]);
      expect(html).toContain("محمد");
      expect(html).toContain("EDUGPT PRO");
      expect(html).toContain("دورة الذكاء الاصطناعي");
      expect(html).toContain("تم تفعيل اشتراكك بنجاح");
    });

    it("should include CTA button to the platform", () => {
      const html = getPaymentApprovedEmailTemplate("test", ["EDUGPT PRO"]);
      expect(html).toContain("ابدأ الاستخدام الآن");
    });

    it("should list all activated services", () => {
      const services = ["EDUGPT PRO", "دورة البيداغوجيا", "الباقة الكاملة"];
      const html = getPaymentApprovedEmailTemplate("user", services);
      services.forEach(s => {
        expect(html).toContain(s);
      });
    });
  });

  describe("getPaymentRejectedEmailTemplate", () => {
    it("should generate rejection email with reason", () => {
      const html = getPaymentRejectedEmailTemplate("فاطمة", "الإيصال غير واضح");
      expect(html).toContain("فاطمة");
      expect(html).toContain("الإيصال غير واضح");
      expect(html).toContain("لم يتم قبول الطلب");
    });

    it("should include link to resubmit", () => {
      const html = getPaymentRejectedEmailTemplate("test", "سبب ما");
      expect(html).toContain("/pricing");
      expect(html).toContain("إعادة تقديم الطلب");
    });

    it("should be RTL and Arabic", () => {
      const html = getPaymentRejectedEmailTemplate("test", "reason");
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });
  });
});
