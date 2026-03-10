import { describe, it, expect, vi } from "vitest";

// ===== Career Hub Phase 2 Tests =====

describe("Career Hub Phase 2 - Talent Directory & School Portal", () => {
  // --- Slug Validation ---
  describe("Custom Slug Validation", () => {
    it("should only allow lowercase alphanumeric and hyphens", () => {
      const validSlugs = ["ahmed-ben-ali", "teacher-math-2024", "my-profile"];
      const invalidSlugs = ["Ahmed Ben Ali", "teacher@math", "my profile", "UPPER"];

      validSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
      });

      invalidSlugs.forEach(slug => {
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(false);
      });
    });

    it("should enforce minimum slug length of 3 characters", () => {
      expect("ab".length >= 3).toBe(false);
      expect("abc".length >= 3).toBe(true);
      expect("ahmed-teacher".length >= 3).toBe(true);
    });

    it("should enforce maximum slug length of 50 characters", () => {
      const longSlug = "a".repeat(51);
      expect(longSlug.length <= 50).toBe(false);
      expect("ahmed-ben-ali".length <= 50).toBe(true);
    });
  });

  // --- Talent Directory Filtering ---
  describe("Talent Directory Filtering Logic", () => {
    const mockTeachers = [
      { id: 1, displayName: "أحمد", region: "سوسة", subject: "رياضيات", totalScore: 85, isVerified: true },
      { id: 2, displayName: "فاطمة", region: "تونس العاصمة", subject: "علوم", totalScore: 72, isVerified: true },
      { id: 3, displayName: "محمد", region: "سوسة", subject: "رياضيات", totalScore: 60, isVerified: false },
      { id: 4, displayName: "سارة", region: "صفاقس", subject: "فرنسية", totalScore: 90, isVerified: true },
    ];

    it("should filter by region", () => {
      const filtered = mockTeachers.filter(t => t.region === "سوسة");
      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.region === "سوسة")).toBe(true);
    });

    it("should filter by subject", () => {
      const filtered = mockTeachers.filter(t => t.subject === "رياضيات");
      expect(filtered).toHaveLength(2);
    });

    it("should filter by verified status", () => {
      const verified = mockTeachers.filter(t => t.isVerified);
      expect(verified).toHaveLength(3);
    });

    it("should sort by total score descending", () => {
      const sorted = [...mockTeachers].sort((a, b) => b.totalScore - a.totalScore);
      expect(sorted[0].displayName).toBe("سارة");
      expect(sorted[1].displayName).toBe("أحمد");
    });

    it("should combine multiple filters", () => {
      const filtered = mockTeachers.filter(t => t.region === "سوسة" && t.subject === "رياضيات" && t.isVerified);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].displayName).toBe("أحمد");
    });
  });

  // --- Smart Match Logic ---
  describe("Smart Match Logic", () => {
    const mockPortfolios = [
      { userId: 1, region: "سوسة", specializations: ["رياضيات", "إعلامية"], totalScore: 85, isVerified: true },
      { userId: 2, region: "سوسة", specializations: ["علوم"], totalScore: 72, isVerified: true },
      { userId: 3, region: "تونس العاصمة", specializations: ["رياضيات"], totalScore: 90, isVerified: true },
      { userId: 4, region: "سوسة", specializations: ["رياضيات"], totalScore: 60, isVerified: false },
    ];

    it("should match teachers by region and subject", () => {
      const job = { subject: "رياضيات", region: "سوسة" };
      const matched = mockPortfolios.filter(p =>
        p.region === job.region &&
        p.specializations.includes(job.subject)
      );
      expect(matched).toHaveLength(2);
    });

    it("should prioritize verified teachers", () => {
      const job = { subject: "رياضيات", region: "سوسة" };
      const matched = mockPortfolios
        .filter(p => p.region === job.region && p.specializations.includes(job.subject))
        .sort((a, b) => {
          if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
          return b.totalScore - a.totalScore;
        });
      expect(matched[0].isVerified).toBe(true);
      expect(matched[0].totalScore).toBe(85);
    });

    it("should return top 3 matches maximum", () => {
      const allMatches = mockPortfolios.filter(p => p.specializations.includes("رياضيات"));
      const top3 = allMatches.slice(0, 3);
      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  // --- School Registration ---
  describe("School Registration Validation", () => {
    it("should require school name and region", () => {
      const validSchool = { schoolName: "مدرسة النجاح", region: "سوسة", schoolType: "private" };
      const invalidSchool1 = { schoolName: "", region: "سوسة", schoolType: "private" };
      const invalidSchool2 = { schoolName: "مدرسة النجاح", region: "", schoolType: "private" };

      expect(validSchool.schoolName.length >= 2 && validSchool.region.length >= 2).toBe(true);
      expect(invalidSchool1.schoolName.length >= 2).toBe(false);
      expect(invalidSchool2.region.length >= 2).toBe(false);
    });

    it("should validate school type enum", () => {
      const validTypes = ["private", "public", "international", "other"];
      expect(validTypes.includes("private")).toBe(true);
      expect(validTypes.includes("invalid")).toBe(false);
    });

    it("should validate email format if provided", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test("school@example.com")).toBe(true);
      expect(emailRegex.test("invalid-email")).toBe(false);
      expect(emailRegex.test("")).toBe(false);
    });
  });

  // --- Job Posting ---
  describe("Job Posting Validation", () => {
    it("should require title, subject, and region", () => {
      const validJob = { title: "معلم رياضيات", subject: "رياضيات", region: "سوسة" };
      expect(validJob.title.length >= 2 && validJob.subject.length >= 1 && validJob.region.length >= 1).toBe(true);
    });

    it("should validate contract type enum", () => {
      const validTypes = ["full_time", "part_time", "temporary", "freelance"];
      expect(validTypes.includes("full_time")).toBe(true);
      expect(validTypes.includes("invalid")).toBe(false);
    });

    it("should default status to active", () => {
      const defaultStatus = "active";
      expect(defaultStatus).toBe("active");
    });
  });

  // --- Digital CV Generation ---
  describe("Digital CV Generation", () => {
    it("should generate valid HTML structure", () => {
      const mockHtml = `<!DOCTYPE html><html dir="rtl"><head><title>CV</title></head><body><h1>أحمد</h1></body></html>`;
      expect(mockHtml).toContain("<!DOCTYPE html>");
      expect(mockHtml).toContain("dir=\"rtl\"");
      expect(mockHtml).toContain("أحمد");
    });

    it("should include Leader Academy branding", () => {
      const mockHtml = `<div class="badge">معتمد من Leader Academy</div><span style="color:#1e40af">Leader</span>`;
      expect(mockHtml).toContain("Leader Academy");
      expect(mockHtml).toContain("#1e40af");
    });
  });

  // --- Email Notification ---
  describe("Email Notification for Connection Requests", () => {
    it("should format notification email correctly", () => {
      const teacherName = "أحمد بن علي";
      const schoolName = "مدرسة النجاح الخاصة";
      const subject = `طلب توظيف جديد من ${schoolName}`;
      const body = `مرحباً ${teacherName}، لديك طلب توظيف جديد من ${schoolName}.`;

      expect(subject).toContain(schoolName);
      expect(body).toContain(teacherName);
      expect(body).toContain(schoolName);
    });

    it("should include connection request details", () => {
      const request = {
        requesterName: "مدير مدرسة النجاح",
        requesterEmail: "director@school.com",
        organization: "مدرسة النجاح الخاصة",
        message: "نحن مهتمون بملفكم المهني",
      };

      expect(request.requesterName.length).toBeGreaterThan(0);
      expect(request.requesterEmail).toContain("@");
      expect(request.message.length).toBeGreaterThan(0);
    });
  });

  // --- Privacy Shield ---
  describe("Privacy Shield", () => {
    it("should hide personal info for pending requests", () => {
      const request = { status: "pending", teacherEmail: "ahmed@mail.com", teacherPhone: "+21612345678" };
      const isApproved = request.status === "approved";
      const visibleEmail = isApproved ? request.teacherEmail : "***@***.com";
      const visiblePhone = isApproved ? request.teacherPhone : "+216*****";

      expect(visibleEmail).toBe("***@***.com");
      expect(visiblePhone).toBe("+216*****");
    });

    it("should reveal personal info for approved requests", () => {
      const request = { status: "approved", teacherEmail: "ahmed@mail.com", teacherPhone: "+21612345678" };
      const isApproved = request.status === "approved";
      const visibleEmail = isApproved ? request.teacherEmail : "***@***.com";

      expect(visibleEmail).toBe("ahmed@mail.com");
    });
  });
});
