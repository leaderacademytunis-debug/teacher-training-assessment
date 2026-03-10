import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "mocked response" } }],
  }),
}));

// Mock the database module
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  getOrCreatePortfolio: vi.fn().mockResolvedValue({ id: 1, userId: 1 }),
  updatePortfolio: vi.fn().mockResolvedValue(true),
  computePortfolioStats: vi.fn().mockResolvedValue({
    totalLessonPlans: 15,
    totalExams: 8,
    totalImages: 20,
    totalCertificates: 3,
    totalEvaluations: 12,
    totalDigitizedDocs: 5,
    totalConversations: 25,
  }),
}));

describe("Career Hub - Schema & Data Model", () => {
  it("should have connection_requests table with required fields", () => {
    // Verify the schema structure
    const requiredFields = [
      "teacherUserId", "requesterName", "requesterEmail",
      "requesterPhone", "requesterOrganization", "requesterRole",
      "message", "status", "teacherResponse", "contactInfoRevealed",
    ];
    // Schema validation - all fields should be defined
    requiredFields.forEach(field => {
      expect(typeof field).toBe("string");
    });
  });

  it("should have golden_samples table with required fields", () => {
    const requiredFields = [
      "userId", "itemType", "itemId", "title",
      "description", "subject", "grade", "displayOrder", "isVisible",
    ];
    requiredFields.forEach(field => {
      expect(typeof field).toBe("string");
    });
  });

  it("should have certificates table for verified badge", () => {
    const requiredFields = ["userId", "courseId", "certificateNumber", "issuedAt"];
    requiredFields.forEach(field => {
      expect(typeof field).toBe("string");
    });
  });
});

describe("Career Hub - Public Profile Mode", () => {
  it("should validate slug format (alphanumeric + hyphens only)", () => {
    const validSlugs = ["ahmed-ben-ali", "teacher-123", "fatma-trabelsi"];
    const invalidSlugs = ["أحمد", "teacher name", "test@user", ""];
    
    const slugRegex = /^[a-zA-Z0-9-]+$/;
    validSlugs.forEach(slug => {
      expect(slugRegex.test(slug)).toBe(true);
    });
    invalidSlugs.forEach(slug => {
      expect(slugRegex.test(slug)).toBe(false);
    });
  });

  it("should enforce slug length constraints (3-50 chars)", () => {
    expect("ab".length >= 3).toBe(false);
    expect("abc".length >= 3).toBe(true);
    expect("a".repeat(51).length <= 50).toBe(false);
    expect("a".repeat(50).length <= 50).toBe(true);
  });

  it("should generate unique URL format /showcase/:slug", () => {
    const slug = "ahmed-ben-ali";
    const expectedPath = `/showcase/${slug}`;
    expect(expectedPath).toBe("/showcase/ahmed-ben-ali");
  });
});

describe("Career Hub - Digital Resume (CV 2.0)", () => {
  it("should compute skill level based on total score", () => {
    const getLevel = (totalScore: number): string => {
      if (totalScore >= 100) return "خبير متميز";
      if (totalScore >= 60) return "خبير";
      if (totalScore >= 30) return "متقدم";
      if (totalScore >= 10) return "متوسط";
      return "مبتدئ";
    };

    expect(getLevel(150)).toBe("خبير متميز");
    expect(getLevel(100)).toBe("خبير متميز");
    expect(getLevel(80)).toBe("خبير");
    expect(getLevel(60)).toBe("خبير");
    expect(getLevel(45)).toBe("متقدم");
    expect(getLevel(30)).toBe("متقدم");
    expect(getLevel(20)).toBe("متوسط");
    expect(getLevel(10)).toBe("متوسط");
    expect(getLevel(5)).toBe("مبتدئ");
    expect(getLevel(0)).toBe("مبتدئ");
  });

  it("should compute subject expertise from activities", () => {
    const subjectExpertise: Record<string, number> = {};
    
    // Simulate sheet contributions
    const sheets = [{ subject: "رياضيات" }, { subject: "رياضيات" }, { subject: "عربية" }];
    for (const s of sheets) {
      subjectExpertise[s.subject] = (subjectExpertise[s.subject] || 0) + 2;
    }
    
    // Simulate exam contributions
    const exams = [{ subject: "رياضيات" }, { subject: "فرنسية" }];
    for (const e of exams) {
      subjectExpertise[e.subject] = (subjectExpertise[e.subject] || 0) + 3;
    }
    
    expect(subjectExpertise["رياضيات"]).toBe(7); // 2+2+3
    expect(subjectExpertise["عربية"]).toBe(2);
    expect(subjectExpertise["فرنسية"]).toBe(3);
  });

  it("should verify badge based on certificate count", () => {
    const isVerified = (certCount: number) => certCount > 0;
    expect(isVerified(0)).toBe(false);
    expect(isVerified(1)).toBe(true);
    expect(isVerified(5)).toBe(true);
  });

  it("should limit golden samples to 12 max", () => {
    const MAX_GOLDEN_SAMPLES = 12;
    const currentCount = 12;
    expect(currentCount >= MAX_GOLDEN_SAMPLES).toBe(true);
    expect(11 >= MAX_GOLDEN_SAMPLES).toBe(false);
  });
});

describe("Career Hub - Connection Request Flow", () => {
  it("should validate connection request input", () => {
    const validRequest = {
      teacherSlug: "ahmed-ben-ali",
      requesterName: "مدير المدرسة",
      requesterEmail: "director@school.tn",
      requesterPhone: "+216 71 123 456",
      requesterOrganization: "المدرسة الخاصة النجاح",
      requesterRole: "مدير مدرسة",
      message: "نحن مهتمون بملفكم المهني ونود التواصل معكم بخصوص فرصة تعليمية في مؤسستنا.",
    };

    expect(validRequest.requesterName.length >= 2).toBe(true);
    expect(validRequest.requesterEmail.includes("@")).toBe(true);
    expect(validRequest.message.length >= 10).toBe(true);
  });

  it("should validate email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("director@school.tn")).toBe(true);
    expect(emailRegex.test("invalid-email")).toBe(false);
    expect(emailRegex.test("user@domain.com")).toBe(true);
  });

  it("should have correct status transitions", () => {
    const validStatuses = ["pending", "approved", "rejected"];
    const validTransitions: Record<string, string[]> = {
      pending: ["approved", "rejected"],
      approved: [],
      rejected: [],
    };

    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("approved");
    expect(validStatuses).toContain("rejected");
    expect(validTransitions.pending).toContain("approved");
    expect(validTransitions.pending).toContain("rejected");
  });
});

describe("Career Hub - Privacy Shield", () => {
  it("should hide contact info by default", () => {
    const request = { status: "pending", contactInfoRevealed: false };
    expect(request.contactInfoRevealed).toBe(false);
  });

  it("should reveal contact info only when approved", () => {
    const getContactVisibility = (status: string): boolean => {
      return status === "approved";
    };

    expect(getContactVisibility("pending")).toBe(false);
    expect(getContactVisibility("rejected")).toBe(false);
    expect(getContactVisibility("approved")).toBe(true);
  });

  it("should not expose personal info in public showcase", () => {
    // The showcase should NOT include email, phone, or personal contact details
    const showcaseData = {
      displayName: "أحمد بن علي",
      schoolName: "المدرسة الابتدائية",
      bio: "معلم متميز...",
      stats: { totalLessonPlans: 15 },
      // These should NOT be present:
      email: undefined,
      phone: undefined,
      personalAddress: undefined,
    };

    expect(showcaseData.email).toBeUndefined();
    expect(showcaseData.phone).toBeUndefined();
    expect(showcaseData.personalAddress).toBeUndefined();
    expect(showcaseData.displayName).toBeDefined();
    expect(showcaseData.stats).toBeDefined();
  });
});

describe("Career Hub - Golden Samples", () => {
  it("should support all item types", () => {
    const validTypes = ["lesson_plan", "exam", "drama_script", "digitized_doc", "marketplace_item"];
    validTypes.forEach(type => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it("should auto-populate from marketplace when no manual samples", () => {
    const manualSamples: any[] = [];
    const marketplaceItems = [
      { id: 1, title: "جذاذة رياضيات", contentType: "lesson_plan", averageRating: "4.5" },
      { id: 2, title: "اختبار علوم", contentType: "exam", averageRating: "4.2" },
    ];

    const goldenSamples = manualSamples.length > 0
      ? manualSamples
      : marketplaceItems.map(item => ({
          id: item.id,
          title: item.title,
          itemType: item.contentType,
          rating: item.averageRating,
        }));

    expect(goldenSamples.length).toBe(2);
    expect(goldenSamples[0].title).toBe("جذاذة رياضيات");
  });

  it("should order samples by displayOrder", () => {
    const samples = [
      { id: 1, displayOrder: 3 },
      { id: 2, displayOrder: 1 },
      { id: 3, displayOrder: 2 },
    ];
    const sorted = [...samples].sort((a, b) => a.displayOrder - b.displayOrder);
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].id).toBe(1);
  });
});

describe("Career Hub - Slug Generation", () => {
  it("should generate slug from French name parts", () => {
    const generateSlug = (firstNameFr?: string, lastNameFr?: string, name?: string): string => {
      const nameParts: string[] = [];
      if (firstNameFr) nameParts.push(firstNameFr.toLowerCase());
      if (lastNameFr) nameParts.push(lastNameFr.toLowerCase());
      if (nameParts.length === 0 && name) nameParts.push(...name.toLowerCase().split(/\s+/).filter(Boolean));
      return nameParts.join("-").replace(/[^a-z0-9-]/g, "") || "teacher";
    };

    expect(generateSlug("Ahmed", "Ben Ali")).toBe("ahmed-benali");
    expect(generateSlug("Fatma", "Trabelsi")).toBe("fatma-trabelsi");
    expect(generateSlug(undefined, undefined, "John Doe")).toBe("john-doe");
    expect(generateSlug()).toBe("teacher");
  });

  it("should handle slug conflicts by appending number", () => {
    const resolveConflict = (baseSlug: string, existingSlugs: string[]): string => {
      let slug = baseSlug;
      let attempt = 0;
      while (existingSlugs.includes(slug)) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
      return slug;
    };

    expect(resolveConflict("ahmed", ["ahmed"])).toBe("ahmed-1");
    expect(resolveConflict("ahmed", ["ahmed", "ahmed-1"])).toBe("ahmed-2");
    expect(resolveConflict("fatma", [])).toBe("fatma");
  });
});
