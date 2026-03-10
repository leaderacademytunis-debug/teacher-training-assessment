import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "curriculum-test-user",
    email: "curriculum@test.com",
    name: "Curriculum Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    arabicName: null,
    firstNameAr: null,
    lastNameAr: null,
    firstNameFr: null,
    lastNameFr: null,
    phone: null,
    idCardNumber: null,
    paymentReceiptUrl: null,
    schoolName: null,
    schoolLogo: null,
    registrationCompleted: false,
    registrationStatus: "pending",
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("curriculum router", () => {
  describe("createPlan", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      await expect(
        caller.curriculum.createPlan({
          schoolYear: "2025-2026",
          educationLevel: "primary",
          grade: "السنة الخامسة ابتدائي",
          subject: "الرياضيات",
          planTitle: "التوزيع السنوي - رياضيات سنة 5",
          totalPeriods: 6,
        })
      ).rejects.toThrow();
    });

    it("creates a plan for authenticated user", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الخامسة ابتدائي",
        subject: "الرياضيات",
        planTitle: "التوزيع السنوي - رياضيات سنة 5",
        totalPeriods: 6,
      });
      expect(plan).toBeTruthy();
      if (plan) {
        expect(plan.planTitle).toBe("التوزيع السنوي - رياضيات سنة 5");
        expect(plan.subject).toBe("الرياضيات");
        expect(plan.grade).toBe("السنة الخامسة ابتدائي");
        expect(plan.createdBy).toBe(99);
      }
    });
  });

  describe("getMyPlans", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      await expect(caller.curriculum.getMyPlans()).rejects.toThrow();
    });

    it("returns plans for authenticated user", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const plans = await caller.curriculum.getMyPlans();
      expect(Array.isArray(plans)).toBe(true);
    });
  });

  describe("getCoverage", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      await expect(caller.curriculum.getCoverage({ planId: 1 })).rejects.toThrow();
    });

    it("returns coverage stats structure", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      // Create a plan first
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الرابعة ابتدائي",
        subject: "الإيقاظ العلمي",
        planTitle: "Test Coverage Plan",
        totalPeriods: 3,
      });
      if (plan) {
        const coverage = await caller.curriculum.getCoverage({ planId: plan.id });
        expect(coverage).toHaveProperty("total");
        expect(coverage).toHaveProperty("completed");
        expect(coverage).toHaveProperty("inProgress");
        expect(coverage).toHaveProperty("percentage");
        expect(typeof coverage.percentage).toBe("number");
      }
    });
  });

  describe("addTopics and getPlanDetails", () => {
    it("adds topics to a plan and retrieves them", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      
      // Create plan
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الخامسة ابتدائي",
        subject: "الرياضيات",
        planTitle: "Test Topics Plan",
        totalPeriods: 2,
      });
      
      if (plan) {
        // Add topics
        const topics = await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [
            {
              periodNumber: 1,
              periodName: "الفترة الأولى",
              topicTitle: "الأعداد ذات 5 أرقام",
              competency: "حل وضعيات مشكل",
              competencyCode: "ك.م.1",
              textbookPages: "ص 12-15",
              orderIndex: 1,
              sessionCount: 2,
              sessionDuration: 45,
            },
            {
              periodNumber: 1,
              periodName: "الفترة الأولى",
              topicTitle: "الجمع والطرح",
              competency: "حل وضعيات مشكل",
              competencyCode: "ك.م.1",
              textbookPages: "ص 16-20",
              orderIndex: 2,
              sessionCount: 3,
              sessionDuration: 45,
            },
          ],
        });
        
        expect(topics.length).toBe(2);
        
        // Get plan details
        const details = await caller.curriculum.getPlanDetails({ planId: plan.id });
        expect(details.plan.id).toBe(plan.id);
        expect(details.topics.length).toBe(2);
        expect(details.topics[0].topicTitle).toBe("الأعداد ذات 5 أرقام");
      }
    });
  });

  describe("updateProgress", () => {
    it("updates topic progress status", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      
      // Create plan + topic
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الثالثة ابتدائي",
        subject: "اللغة العربية",
        planTitle: "Test Progress Plan",
        totalPeriods: 1,
      });
      
      if (plan) {
        const topics = await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [{
            periodNumber: 1,
            periodName: "الفترة الأولى",
            topicTitle: "القراءة والفهم",
            orderIndex: 1,
            sessionCount: 1,
            sessionDuration: 45,
          }],
        });
        
        if (topics.length > 0) {
          const progress = await caller.curriculum.updateProgress({
            planId: plan.id,
            topicId: topics[0].id,
            status: "completed",
            teacherNotes: "تم إنجاز الدرس بنجاح",
          });
          
          expect(progress).toBeTruthy();
          if (progress) {
            expect(progress.status).toBe("completed");
          }
          
          // Check coverage updated
          const coverage = await caller.curriculum.getCoverage({ planId: plan.id });
          expect(coverage.completed).toBe(1);
          expect(coverage.percentage).toBe(100);
        }
      }
    });
  });

  describe("getSmartSuggestions", () => {
    it("returns next uncovered topics", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة السادسة ابتدائي",
        subject: "الإيقاظ العلمي",
        planTitle: "Test Suggestions Plan",
        totalPeriods: 2,
      });
      
      if (plan) {
        await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [
            { periodNumber: 1, periodName: "الفترة 1", topicTitle: "الجهاز التنفسي", orderIndex: 1, sessionCount: 1, sessionDuration: 45 },
            { periodNumber: 1, periodName: "الفترة 1", topicTitle: "الجهاز الهضمي", orderIndex: 2, sessionCount: 1, sessionDuration: 45 },
            { periodNumber: 2, periodName: "الفترة 2", topicTitle: "الدورة الدموية", orderIndex: 3, sessionCount: 1, sessionDuration: 45 },
          ],
        });
        
        const suggestions = await caller.curriculum.getSmartSuggestions({
          planId: plan.id,
          limit: 2,
        });
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeLessThanOrEqual(2);
        if (suggestions.length > 0) {
          expect(suggestions[0].topicTitle).toBe("الجهاز التنفسي");
        }
      }
    });
  });

  describe("getTextbookRef", () => {
    it("returns textbook reference for a topic", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الرابعة ابتدائي",
        subject: "الرياضيات",
        planTitle: "Test Textbook Plan",
        totalPeriods: 1,
      });
      
      if (plan) {
        await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [{
            periodNumber: 1,
            periodName: "الفترة الأولى",
            topicTitle: "الأعداد ذات 5 أرقام",
            textbookName: "كتاب الرياضيات - السنة الرابعة",
            textbookPages: "ص 42-45",
            competency: "حل وضعيات مشكل دالة",
            competencyCode: "ك.م.1",
            orderIndex: 1,
            sessionCount: 1,
            sessionDuration: 45,
          }],
        });
        
        const ref = await caller.curriculum.getTextbookRef({
          planId: plan.id,
          topicTitle: "الأعداد ذات 5 أرقام",
        });
        
        expect(ref).toBeTruthy();
        if (ref) {
          expect(ref.textbookPages).toBe("ص 42-45");
          expect(ref.textbookName).toBe("كتاب الرياضيات - السنة الرابعة");
          expect(ref.competencyCode).toBe("ك.م.1");
        }
      }
    });
  });

  describe("deletePlan", () => {
    it("soft deletes a plan", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الأولى ابتدائي",
        subject: "اللغة العربية",
        planTitle: "Test Delete Plan",
        totalPeriods: 1,
      });
      
      if (plan) {
        const result = await caller.curriculum.deletePlan({ planId: plan.id });
        expect(result).toBe(true);
      }
    });

    it("forbids deleting another user's plan", async () => {
      const caller1 = appRouter.createCaller(createAuthContext({ id: 100 }));
      const plan = await caller1.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الأولى ابتدائي",
        subject: "اللغة العربية",
        planTitle: "Another User Plan",
        totalPeriods: 1,
      });
      
      if (plan) {
        const caller2 = appRouter.createCaller(createAuthContext({ id: 200 }));
        await expect(
          caller2.curriculum.deletePlan({ planId: plan.id })
        ).rejects.toThrow();
      }
    });
  });

  describe("markAsOfficial (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createAuthContext({ role: "user" }));
      await expect(
        caller.curriculum.markAsOfficial({ planId: 1, isOfficial: true })
      ).rejects.toThrow();
    });

    it("allows admin to mark plan as official", async () => {
      const adminCaller = appRouter.createCaller(createAuthContext({ role: "admin", id: 101 }));
      
      const plan = await adminCaller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الخامسة ابتدائي",
        subject: "الرياضيات",
        planTitle: "Official Plan Test",
        totalPeriods: 6,
      });
      
      if (plan) {
        const result = await adminCaller.curriculum.markAsOfficial({
          planId: plan.id,
          isOfficial: true,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("getCurriculumGPS", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      await expect(caller.curriculum.getCurriculumGPS()).rejects.toThrow();
    });

    it("returns GPS structure for user", async () => {
      const caller = appRouter.createCaller(createAuthContext({ id: 500 }));
      const gps = await caller.curriculum.getCurriculumGPS();
      expect(gps).toHaveProperty("plans");
      expect(gps).toHaveProperty("activePlan");
      expect(gps).toHaveProperty("currentLesson");
      expect(gps).toHaveProperty("nextLessons");
      expect(Array.isArray(gps.plans)).toBe(true);
      expect(Array.isArray(gps.nextLessons)).toBe(true);
    });

    it("returns GPS data with progress and current lesson", async () => {
      const caller = appRouter.createCaller(createAuthContext({ id: 501 }));
      
      // Create a plan
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الخامسة ابتدائي",
        subject: "الرياضيات",
        planTitle: "GPS Test Plan",
        totalPeriods: 2,
      });

      if (plan) {
        // Add topics
        await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [
            { periodNumber: 1, periodName: "الفترة الأولى", topicTitle: "الأعداد ذات 5 أرقام", competency: "حل وضعيات مشكل", competencyCode: "ك.م.1", orderIndex: 1, sessionCount: 2, sessionDuration: 45, weekNumber: 1 },
            { periodNumber: 1, periodName: "الفترة الأولى", topicTitle: "الجمع والطرح", competency: "حل وضعيات مشكل", competencyCode: "ك.م.1", orderIndex: 2, sessionCount: 2, sessionDuration: 45, weekNumber: 3 },
            { periodNumber: 2, periodName: "الفترة الثانية", topicTitle: "الضرب", competency: "حل وضعيات مشكل", competencyCode: "ك.م.2", orderIndex: 3, sessionCount: 2, sessionDuration: 45, weekNumber: 8 },
          ],
        });

        const gps = await caller.curriculum.getCurriculumGPS({ planId: plan.id });
        
        expect(gps.activePlan).toBeTruthy();
        expect(gps.activePlan!.id).toBe(plan.id);
        expect(gps.progress).toBeTruthy();
        expect(gps.progress!.total).toBe(3);
        expect(gps.progress!.currentWeek).toBeGreaterThanOrEqual(1);
        expect(gps.progress!.periodBreakdown).toBeDefined();
        expect(Array.isArray(gps.progress!.periodBreakdown)).toBe(true);
        // Should have a current lesson
        expect(gps.currentLesson).toBeTruthy();
        expect(gps.currentLesson!.topicTitle).toBeTruthy();
        // Should have next lessons
        expect(Array.isArray(gps.nextLessons)).toBe(true);
      }
    });

    it("updates current lesson after marking progress", async () => {
      const caller = appRouter.createCaller(createAuthContext({ id: 502 }));
      
      const plan = await caller.curriculum.createPlan({
        schoolYear: "2025-2026",
        educationLevel: "primary",
        grade: "السنة الرابعة ابتدائي",
        subject: "العلوم",
        planTitle: "GPS Progress Test",
        totalPeriods: 1,
      });

      if (plan) {
        const topics = await caller.curriculum.addTopics({
          planId: plan.id,
          topics: [
            { periodNumber: 1, periodName: "الفترة 1", topicTitle: "الجهاز التنفسي", orderIndex: 1, sessionCount: 1, sessionDuration: 45 },
            { periodNumber: 1, periodName: "الفترة 1", topicTitle: "الجهاز الهضمي", orderIndex: 2, sessionCount: 1, sessionDuration: 45 },
          ],
        });

        // Mark first topic as completed
        if (topics.length > 0) {
          await caller.curriculum.updateProgress({
            planId: plan.id,
            topicId: topics[0].id,
            status: "completed",
          });

          const gps = await caller.curriculum.getCurriculumGPS({ planId: plan.id });
          expect(gps.progress!.completed).toBe(1);
          expect(gps.progress!.percentage).toBe(50);
        }
      }
    });
  });
});

// ===== Portfolio PDF Export Tests =====
describe("portfolio2 exportPDF", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(caller.portfolio2.exportPDF()).rejects.toThrow();
  });

  it("returns PDF URL", async () => {
    const caller = appRouter.createCaller(createAuthContext({ id: 600, name: "Test Teacher" }));
    const result = await caller.portfolio2.exportPDF();
    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(10);
  }, 15000);
});
