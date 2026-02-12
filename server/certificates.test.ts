import { describe, it, expect } from "vitest";
import { generateCertificatePDF } from "./certificates";

describe("Certificate Generation", () => {
  it("should generate a certificate PDF successfully", async () => {
    const certificateData = {
      participantName: "محمد الأمين",
      courseName: "تأهيل مدرّسي العربية",
      courseType: "arabic_teachers",
      completionDate: new Date("2024-12-15"),
      score: 85,
      certificateNumber: "CERT-TEST-001",
      batchNumber: "107",
    };

    const result = await generateCertificatePDF(certificateData);
    
    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(typeof result.key).toBe("string");
  }, 30000); // 30 second timeout for image download and PDF generation
});
